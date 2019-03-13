//index.js
//获取应用实例
const app = getApp()
//计数器
var interval = null;

//值越大旋转时间越长  即旋转速度
var intime = 50;

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    picArray:[], //奖品图片
    lotteryInfo:[],  //获奖名单
    viewTop:[],
    viewRight: [],
    viewBottom: [],
    viewLeft: [],
    allNum: 8,//奖品总数
    clickLuck: 'clickLuck',  //单机事件
    luckPosition: 0,  //中奖位置
    clickCss:[]
  },
  //下拉刷新
  onPullDownRefresh() {

    wx.showNavigationBarLoading() //在标题栏中显示加载
    setTimeout(function () {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 1500);
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  //点击抽奖按钮
  clickLuck: function () {

    var e = this;
    var allNum = e.data.allNum;
    //设置按钮不可点击
    e.setData({
      clickLuck: '',
    })
    //清空计时器
    clearInterval(interval);
    var index = 0;
    //循环设置每一项的透明度
    interval = setInterval(function () {
      if (index > allNum-1) {
        index = 0;
        e.data.clickCss[allNum - 1] = ''
      } else if (index != 0) {
        e.data.clickCss[index - 1] = ''
      }
      e.data.clickCss[index] = 'active'
      e.setData({
        clickCss: e.data.clickCss,
      })
      index++;
    }, intime);

    //模拟网络请求时间  设为两秒
    var stoptime = 2000;
    setTimeout(function () {
      e.stop(e.data.luckPosition);
    }, stoptime)

  },
  stop: function (which) {
    var e = this;
    //清空计数器
    clearInterval(interval);
    //初始化当前位置
    var current = -1;
    var clickCss = e.data.clickCss;
    for (var i = 0; i < clickCss.length; i++) {
      if (clickCss[i] == 'active') {
        current = i;
      }
    }
    //下标从1开始
    var index = current + 1;

    e.stopLuck(which, index, intime, 10);
  },
  /**
	 * which:中奖位置
	 * index:当前位置
	 * time：时间标记
	 * splittime：每次增加的时间 值越大减速越快
	 */
  stopLuck: function (which, index, time, splittime) {
    var e = this;
    var allNum = e.data.allNum;
    //值越大出现中奖结果后减速时间越长
    var clickCss = e.data.clickCss;
    setTimeout(function () {
      //重置前一个位置
      if (index > allNum-1) {
        index = 0;
        clickCss[allNum-1] = ''
      } else if (index != 0) {
        clickCss[index - 1] = ''
      }
      //当前位置为选中状态
      clickCss[index] = 'active'
      e.setData({
        clickCss: clickCss,
      })
      //如果旋转时间过短或者当前位置不等于中奖位置则递归执行
      //直到旋转至中奖位置
      if (time < 400 || index != which) {
        //越来越慢
        splittime++;
        time += splittime;
        //当前位置+1
        index++;
        e.stopLuck(which, index, time, splittime);
      } else {
        //1秒后显示弹窗
        setTimeout(function () {
          if (which == 1 || which == 3 || which == 5 || which == 7) {
            //中奖
            wx.showModal({
              title: '提示',
              content: '恭喜中奖',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  //设置按钮可以点击
                  e.setData({
                    clickLuck: 'clickLuck',
                  })
                }
              }
            })
          } else {
            //中奖
            wx.showModal({
              title: '提示',
              content: '很遗憾未中奖',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  //设置按钮可以点击
                  e.setData({
                    clickLuck: 'clickLuck',
                  })
                }
              }
            })
          }
        }, 1000);
      }
    }, time);
  },
  imageInfo: function (e) {
    wx.showModal({
      title: '提示',
      content: e.currentTarget.dataset.picinfo,
      showCancel: false,
      success: function (res) {
        //console.log(res);
      }
    })
  },
  onLoad: function () {
    //判断用户是否授权
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {//授权了，可以获取用户信息了
          wx.getUserInfo({
            success: (res) => {
              this.setData({
                userInfo: res.userInfo,
                hasUserInfo: true
              })
            }
          })
        } else {//未授权，跳到授权页面
          wx.redirectTo({
            url: '../authorize/authorize',//授权页面
          })
        }
      }
    })
    
    var allWidth=700;
    var allHeight=700;
    var lineNumber;  //几行
    var listNumber;  //几列
    var allNum = this.data.allNum;
    var lotArray={};
    var listArray={};
    var clickCss = [];
    var picsArray = [];
    var lotteryInfo = [];
    allNums(allNum);

    for (var i = 0; i < allNum; i++) {
      picsArray[i] = {};
      lotteryInfo[i] = {};
      picsArray[i].id = (i + 1);
      lotteryInfo[i].id = (i + 1);
      picsArray[i].pic = '../../images/lottery/' + (i + 1) + '.png';
      picsArray[i].picInfo = '奖品' + i;
      lotteryInfo[i].name = '张三'+i;
      lotteryInfo[i].info = '感谢参与'+i;
      clickCss[i] = '';
    }
    
    ///---初始化
    var thisWidth = allWidth / listNumber;
    var thisHeight = allHeight / lineNumber;
    if (thisWidth > 160) {
      thisWidth = 160;
    } else {
      thisWidth = allWidth / listNumber;
    }
    if (thisHeight > 160) {
      thisHeight = 160;
    } else {
      thisHeight = allWidth / listNumber;
    }

    var all = listNumber * lineNumber - (lineNumber - 2) * (listNumber - 2)  //应该有的总数
    var listWidth = thisWidth;
    var listHeight = thisHeight;
    var lotWidth = allWidth - (thisWidth * 2);
    var lotHeight = allHeight - thisHeight * 2;
    var lotLineHeight = allHeight - thisHeight * 2;
    var lotMarginTop = -(allHeight - thisHeight * 2) / 2;
    var lotMarginLeft = -(allWidth - thisWidth * 2) / 2;
    this.setData({
      picArray: picsArray,
      lotteryInfo: lotteryInfo,
      listWidth:listWidth,
      listHeight:listHeight,
      lotWidth:lotWidth,
      lotHeight:lotHeight,
      lotLineHeight: lotLineHeight,
      lotMarginTop: lotMarginTop,
      lotMarginLeft: lotMarginLeft,
      all:all,
      clickCss: clickCss
    })
    
    // 设置布局
    var viewRight = [];
    var viewLeft = [];
    var viewTop = [];
    var viewBottom = [];
    for (var index = 0; index < allNum; index++) {
      viewRight[index] = {};
      viewLeft[index] = {};
      viewTop[index] = {};
      viewBottom[index] = {};
      if (index < listNumber) {  //---小于listNumber列
        if (index == (listNumber - 1)) {
          viewRight[index].right = 0;
        } else {
          if (thisWidth >= 160) {
            viewLeft[index].left = index % listNumber * thisWidth + (allWidth - listNumber * thisWidth) / (listNumber - 1) * index + 'rpx';
          } else {
            viewLeft[index].left = index % listNumber * thisWidth + 'rpx'
          }
        }
      }
      else if (index >= listNumber && index < listNumber + lineNumber - 2) {
        if (thisHeight >= 160) {
          viewTop[index].top = (index - (listNumber - 1)) * thisHeight + (allHeight - lineNumber * thisHeight) / (lineNumber - 1) * (index - (listNumber - 1)) + 'rpx';
          viewRight[index].right = 0;
        } else {
          viewTop[index].top = (index - (listNumber - 1)) * thisHeight + 'rpx';
          viewRight[index].right = 0;
        }
      }
      else if (index >= listNumber + lineNumber - 2 && index < all - lineNumber + 2) {
        if (thisWidth >= 160) {
          viewBottom[index].bottom = 0;
          viewRight[index].right = (index - (lineNumber + (listNumber - 2))) * thisWidth + (allWidth - listNumber * thisWidth) / (listNumber - 1) * (index - (listNumber + (lineNumber - 2))) + 'rpx';
        } else {
          viewBottom[index].bottom = 0;
          viewRight[index].right = (index - (lineNumber + (listNumber - 2))) * thisWidth + 'rpx';
        }
      } else {
        if (thisHeight >= 160) {
          viewBottom[index].bottom = (index - (listNumber * 2 + (lineNumber - 3))) * thisHeight + (allHeight - lineNumber * thisHeight) / (lineNumber - 1) * (index - (listNumber * 2 + (lineNumber - 3))) + 'rpx';
          viewLeft[index].left = 0;
        } else {
          viewBottom[index].bottom = (index - (listNumber * 2 + (lineNumber - 3))) * thisHeight + 'rpx',
          viewLeft[index].left = 0;
        }
      }
    }
    this.setData({
      viewTop: viewTop,
      viewBottom: viewBottom,
      viewLeft: viewLeft,
      viewRight: viewRight
    })
    //根据奖品总数计算行和列
    function allNums(num) {
      //aNum为行
      //bNum为列
      for (var aNum = 0; aNum <= 40; aNum++) {
        for (var bNum = 0; bNum <= aNum; bNum++) {
          if (aNum * bNum - (aNum - 2) * (bNum - 2) == num || aNum * bNum - (aNum - 2) * (bNum - 2) == num + 1) {
            lineNumber = bNum;
            listNumber = aNum;
            return false;
          }
        }
      }
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
