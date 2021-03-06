$(document).ready(function() {



  if (localStorage.getItem("token") == null){
		$(location).attr('href', '/login.html');
		return;
  }
  
  let logoutButton = ".mdl-navigation__link#logout";
  
  $(logoutButton).on("click", function(){
		$(location).attr('href', '/login.html');
		localStorage.removeItem("token");
	});

  const hostName = '89.34.92.135:2222';
  const token = localStorage.getItem("token");
  
  var mon, tue, wed, thu, fri, sat, sun;
  var windows = false;
  var rows = [];
  var days = [];
  
  var allrooms;
  var allgroups;
  var allsubjects;
  var allconstraints;
  
  const urlPost = `http://${hostName}/api/linked_constraints?token=${token}`;
  const urlDelete = `http://${hostName}/api/delete_constraints?token=${token}`;
  const urlDeleteLinked = `http://${hostName}/api/delete_linked_constraints?token=${token}`;
   
  require('./../less/profPref.less');

  $(".loader-bck").hide();
  
  function postThisShit(json, callback) {

      $(".loader-bck").show();
    $.ajax({
      url: urlPost,
      method: 'POST',
      contentType: 'application/json',
      data: json
    }).done(function(data){

        $(".loader-bck").hide();
        if (data.success === true){
          callback(true);
        }
        else{
          callback(false);
        }
    });
  };
  
  function deleteThisShit(json, callback){

      $(".loader-bck").show();
    $.ajax({
      url: urlDelete,
      method: 'POST',
      contentType: 'application/json',
      data: json
    }).done(function(data){

        $(".loader-bck").hide();
        if (data.success === true){
          callback(true);
        }
        else{
          callback(false);
        }
    });
  };
  
  function deleteThisLinkedShit(json, callback){
      $(".loader-bck").show();
    $.ajax({
      url: urlDeleteLinked,
      method: 'POST',
      contentType: 'application/json',
      data: json
    }).done(function(data){
      if (data.success === true){

        $(".loader-bck").hide();
        callback(true);
      }
      else{
        callback(false);
      }
    });
  };
  
  
  function getSubjectsShow(){

      $(".loader-bck").show();
    var url = 'http://'+hostName+'/api/subjects?token=' + token;
    $.get(`${url}`).done(function (result){
        $(".loader-bck").hide();
      if (result.success !== true)
        return;
      allsubjects=result;
    getRoomsShow();
    });
  };
  
  
  function getRoomsShow(){
    var url = 'http://'+hostName+'/api/rooms?token=' + token;
    var pos;
      $(".loader-bck").show();
    $.get(`${url}`).done(function(result){
      $(".loader-bck").hide();
      if (result.success !== true)
        return;
      allrooms=result.rooms;
    getGroupsShow();
    });
  };
  
  function getGroupsShow(){
      $(".loader-bck").show();
    var url = 'http://'+hostName+'/api/groups?token=' + token;
    $.get(`${url}`).done(function(result){
        $(".loader-bck").hide();
      if (result.success !== true)
        return;
      allgroups=result.groups;
    getUnlinkedConstraints();
    });
  };
  
  function subName(id){
    for(var i=0;i<allsubjects.subjects.length;i++)
      if(allsubjects.subjects[i].id == id) return allsubjects.subjects[i].name;
  };
  
  function roomName(ids){
    var roomNames =[];
    var pos =0;
    for(var i = 0;i < ids.length; i++)
    {
      for (var j = 0; j < allrooms.length; ++j) {
        const room = allrooms[j];
        if (room.id === ids[i]) {
          roomNames.push(room.name);
          break;
        }
      }
      
    }
    return roomNames;
  };
  
  function groupName(ids){
    var groupNames=[];
    var pos=0;
    for(var i=0;i<ids.length;i++){
      for (var j = 0; j < allgroups.length; ++j) {
        const group = allgroups[j];
        if (group.id === ids[i]) {
          groupNames.push(group.name);
          break;
        }
      }
    }
    return groupNames;
  };
  
  function getDayName(day) {
    var days = {
      '1': 'Luni',
      '2': 'Marti',
      '3': 'Miercuri',
      '4': 'Joi',
      '5': 'Vineri',
      '6': 'Sambata',
      '0': 'Duminica',
    }
    return days[day];
  }
  
  function getUnlinkedConstraints(){
    var url = 'http://'+hostName+'/api/constraints?token=' + token;
    var pos;
      $(".loader-bck").show();
    $.get(`${url}`).done(function(result){
        $(".loader-bck").hide();
      if (result.success !== true)
        return;
    allconstraints=result;
      for(var i=0;i<result.constraints.length;i++){
      var days='';
      var hours='';
        for(var j=0;j<result.constraints[i].possibleIntervals.length;j++)
        {
          if(result.constraints[i].possibleIntervals[j].intervals.length !== 0)
          {
            days= days+'<li>'+getDayName(result.constraints[i].possibleIntervals[j].days)+'</li>';
        hours=hours+'<li>'+result.constraints[i].possibleIntervals[j].intervals+'</li>';
          }
        }
      
      $("#tabl tbody").append(`
            <tr data-id=${result.constraints[i].id}>
            <td>
            <label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
    <input type="checkbox" class="mdl-checkbox__input">
    <span class="mdl-checkbox__label"></span>
  </label>
  </td>
              <td class="mdl-data-table__cell--non-numeric">${subName(result.constraints[i].subjectId)}</td>
              <td class="mdl-data-table__cell--non-numeric">${roomName(result.constraints[i].roomIds)}</td>
              <td class="mdl-data-table__cell--non-numeric">${groupName(result.constraints[i].groupIds)}</td>
              <td class="mdl-data-table__cell--non-numeric">${result.constraints[i].date}</td>
              <td class="mdl-data-table__cell--non-numeric"><ul>${days}</ul></td>
              <td class="mdl-data-table__cell--non-numeric"><ul>${hours}</ul></td>
            </tr>`);
      }
    getLinkedConstraints();
    });
  };
  
  function iswindow(check){
    var fereastra = {
      '1': 'Da',
      '0': 'Nu'
    }
    return fereastra[check];
  };
  
  function getsubfromcons(id){
    for(var i=0;i<allconstraints.constraints.length;i++)
      if(allconstraints.constraints[i].id == id)
        return subName(allconstraints.constraints[i].subjectId);
  };
  
  function getLinkedConstraints(){
    var url='http://'+hostName+'/api/linked_constraints?token='+token;
      $(".loader-bck").show();
    $.get(`${url}`).done(function(result){
        $(".loader-bck").hide();
      if(result.success !== true) return;
      for(var i=0;i<result.constraints.length;i++)
      {
        var numeZile=[];
        for(var j=0;j<result.constraints[i].days.length;j++)
        {numeZile.push(getDayName(result.constraints[i].days[j]));}
        
        var numeMaterii=[];
        for(var j=0;j<result.constraints[i].ids.length;j++)
        {numeMaterii.push(getsubfromcons(result.constraints[i].ids[j]));}
        $("#tabl2 tbody").append(
        `<tr  data-id=${result.constraints[i].id}>
          <td>
            <label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
              <input type="checkbox" class="mdl-checkbox__input">
              <span class="mdl-checkbox__label"></span>
            </label>
          </td>
          <td class="mdl-data-table__cell--non-numeric">${numeZile}</td>
          <td class="mdl-data-table__cell--non-numeric">${numeMaterii}</td>
          <td class="mdl-data-table__cell--non-numeric">${iswindow(result.constraints[i].win)}</td>
        </tr>`);
      }
      addListeners();
    });
  };
  
  
  function getRows(){
      var table = document.getElementById("tabl");
      for (var i = 1, row; row = table.rows[i]; i++){
        if ($(row).find('input')[0].checked === true) {
        // if(row.className=="is-selected"){
            rows.push($(row).attr('data-id'));
        }
    }
  };
  
  function getDays(){
    mon = document.getElementById("luni").checked;
    tue = document.getElementById("marti").checked;
    wed = document.getElementById("miercuri").checked;
    thu = document.getElementById("joi").checked;
    fri = document.getElementById("vineri").checked;
    sat = document.getElementById("sambata").checked;
    sun = document.getElementById("duminica").checked;
    if(mon)
      days.push(1);
    if(tue)
      days.push(2);
    if(wed)
      days.push(3);
    if(thu)
      days.push(4);
    if(fri)
      days.push(5);
    if(sat)
      days.push(6);
    if(sun)
      days.push(0);
  };
  
  function getWindow(){
    var checkbox = document.getElementById("switch1");
    windows = checkbox.checked;
  };
  
  function start(){
    getRows();
    getDays();
    getWindow(); 
    var object = {};
    object["ids"] = rows;
    object["days"] = days;
    object["win"] = windows;
    var json = JSON.stringify(object);
    
    postThisShit(json, function(response){
        if(response){
          alert("Optiune adaugata!");
          location.reload();
        }else{
          alert("Auleu buba!");
          location.reload();
        }
      });
      
     
  };
  
  var delRows = [];
  var delLinkedRows = [];
  
  function sterge(){
    delRows = [];
     var table = document.getElementById("tabl");
      for (var i = 1, row; row = table.rows[i]; i++){
        if ($(row).find('input')[0].checked === true) {
        // if(row.className=="is-selected"){
            delRows.push($(row).attr('data-id'));
            document.getElementById("tabl").deleteRow(i);
            i--;
        }
  
    }
    for(var i = 0; i < delRows.length; i++){
      
        var object = {};
        object["id"] = delRows[i];
        var json = JSON.stringify(object);
        deleteThisShit(json, function(response){
            if(i==(delRows.length-1))
            {
              if(response){
                alert("Optiuni sterse cu succes!");
              }else{
                alert("Auleu buba");
              }
            }
          });
      }
  };
  function stergeLinked(){
     var table = document.getElementById("tabl2");
      for (var i = 1, row; row = table.rows[i]; i++){
        if ($(row).find('input')[0].checked === true) {
            delLinkedRows.push($(row).attr('data-id'));
            document.getElementById("tabl2").deleteRow(i);
            i--;
        }
    }
    for(var i = 0; i < delLinkedRows.length; i++){
    
        var object = {};
        object["id"] = delLinkedRows[i];
        var json = JSON.stringify(object);
        
        deleteThisLinkedShit(json, function(response){
            if(i==(delLinkedRows.length-1))
            {
              if(response){
                alert("Optiuni sterse cu succes!");
              }else{
                alert("Auleu buba");
              }
            }
          });
      }
  };
  
  function addListeners(){
  
    var sendButton = document.getElementById("sendData2");
    sendButton.addEventListener('click', start);
    
    var deleteButton = document.getElementById("deleteData");
    deleteButton.addEventListener('click', sterge);
  
     var deleteButton = document.getElementById("deleteLinkedData");
    deleteButton.addEventListener('click', stergeLinked);
  }
  
    getSubjectsShow();
  
  });