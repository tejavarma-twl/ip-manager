import { Component, OnInit } from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  manage: FormGroup;
  limitErr = false;
  savedIps = [];
  btnStatus = true;
  ipPattern =  '(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)';
  plan = '';
  plans = {
    basic: 5,
    premium: 10
  };

  constructor(public fb: FormBuilder, private url: ActivatedRoute, private route: Router) {
    this.manage = fb.group({
      ipField: this.fb.array([
        this.fb.control('',[Validators.required, Validators.pattern(this.ipPattern)])
      ], )
    });
  }

  ngOnInit() {
    this.plan = this.url.snapshot.paramMap.get('plan');
    this.savedIps = JSON.parse(localStorage.getItem('ipInfo'))
    if(this.savedIps){
      for(let l = 0; l < this.savedIps.length; ++l){
        if (l === 0){
          this.ipField.at(0).patchValue(this.savedIps[l]);
        } else {
          this.ipField.push(this.fb.control(this.savedIps[l], [Validators.pattern(this.ipPattern)]));
        }
      }
      this.btnStatus = false;
    }

  }

  get ipField() {
    return this.manage.get('ipField') as FormArray;
  }

  addBlock(){
    if(this.ipField.length <= this.plans[this.plan] - 1){
      this.ipField.push(this.fb.control('', [Validators.pattern(this.ipPattern)]));
    }
    if (this.ipField.length > this.plans[this.plan] - 1) {
      this.limitErr = true;
    }
  }

  enableBtn(){
    this.btnStatus = true;
  }

  removeBlock(index){
    if(this.ipField.value[index] !== ''){
      this.btnStatus = true;
    }
    this.ipField.removeAt(index);
    if (this.ipField.length <= this.plans[this.plan] - 1) {
      this.limitErr = false;
    }
  }

  processData(){
    this.savedIps = [];
    if(this.manage.valid){
      const res = this.ipField.value;
      const resLen = this.ipField.value.length-1;
      for(let i = resLen; i >= 0; --i){
        if(res[i] === ''){
          this.ipField.removeAt(i);
        } else {
          this.savedIps.unshift(res[i]);
        }
      }
      // console.log(this.savedIps);
      localStorage.setItem('ipInfo', JSON.stringify(this.savedIps));
      this.btnStatus = false;
      if (this.ipField.length <= this.plans[this.plan] - 1) {
        this.limitErr = false;
      }
    } else{
      console.log('Fill up the fields!');
    }
  }
  logout(){
    this.route.navigate(['']).then( val => {
      localStorage.clear();
    });
  }

}
