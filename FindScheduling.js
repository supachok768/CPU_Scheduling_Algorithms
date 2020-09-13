//#region Algorithm Scheduling CPU

//#region FCFS
let FCFS = (data = [{
    process: "",
    arrivalTime: 0,
    burstTime: 0,
    priority: 0
}]) => {

    //#region Initain Data
    let workSteps = []
    let workObj = {
        process: {
            process: "",
            arrivalTime: 0,
            burstTime: 0,
            priority: 0,
            startTime: 0,
            completeTime: 0
        },
        queue: []
    }

    let processSummary = []
    let processSummaryObj = {
        process: "",
        arrivalTime: 0,
        burstTime: 0,
        priority: 0,
        waitTime: 0,
        turnaroundTime: 0
    }

    let time = 0
    let sumWaitTime = 0
    let sumTurnaroundTime = 0
    data = SortByArrivalTime(data)
    //#endregion

    let i = 0
    while (i < data.length) {

        //#region Calculator Start Time and Complete Time and Find process in queue then push to workSteps

        let queue = []
        let q = 0
        while (q < workObj.queue.length) {
            if (workObj.queue[q] != data[i]) {
                queue.push(workObj.queue[q])
            }
            q++
        }

        workObj = {
            process: {
                ...data[i],
                startTime: 0,
                completeTime: 0
            },
            queue: queue
        }
        workObj.process.startTime = time
        time += data[i].burstTime
        workObj.process.completeTime = time


        let j = i + 1
        while (j < data.length) {
            if (data[j].arrivalTime < time) {
                q = 0
                let inQueue = false
                while (q < workObj.queue.length && !inQueue) {
                    if (workObj.queue[q] == data[j]) {
                        inQueue = true
                    }
                    q++
                }
                if (!inQueue) {
                    workObj.queue.push(data[j])
                }
            }
            j++
        }


        workSteps.push(workObj)

        //#endregion

        //#region Calculator Waiting Time and Turnaround Time Per Process then push to processSummary
        processSummaryObj = { ...processSummaryObj, ...data[i] }
        processSummaryObj.waitTime = workObj.process.startTime - processSummaryObj.arrivalTime
        processSummaryObj.turnaroundTime = workObj.process.completeTime - processSummaryObj.arrivalTime
        processSummary.push(processSummaryObj)
        //#endregion

        //#region Sum Waiting Time and Turnaround Time
        sumWaitTime += processSummaryObj.waitTime
        sumTurnaroundTime += processSummaryObj.turnaroundTime
        //#endregion
        i++


    }

    return {
        process: processSummary,
        step: workSteps,
        averageWaitTime: sumWaitTime / data.length,
        averageTurnaroundTime: sumTurnaroundTime / data.length,
        time: time
    }

}
//#endregion

//#region Non-Preemptive SJF
let NonPreemSJF = (data = [{
    process: "",
    arrivalTime: 0,
    burstTime: 0,
    priority: 0
}]) => {

    //#region Initain Data
    let workSteps = []
    let workObj = {
        process: {
            process: "",
            arrivalTime: 0,
            burstTime: 0,
            priority: 0,
            startTime: 0,
            completeTime: 0
        },
        queue: []
    }

    let processSummary = []
    let processSummaryObj = {
        process: "",
        arrivalTime: 0,
        burstTime: 0,
        priority: 0,
        waitTime: 0,
        turnaroundTime: 0
    }

    let time = 0
    let sumWaitTime = 0
    let sumTurnaroundTime = 0
    //#endregion

    let i = 0
    while (i < data.length) {

        if (workObj.queue.length == 0) { //Select Process for work when Empty Queue
            //Find Pn ArrivalTime >= Time
            let moreTime = SortByArrivalTime(data.filter(item => item.arrivalTime >= time))
            let useData = moreTime
            //Check Same ArrivalTime
            let sameArrival = moreTime.filter(item => item.arrivalTime == moreTime[0].arrivalTime)
            if (sameArrival.length > 1) {
                //Sort by BurstTime then merge
                useData = [...SortByBurstTime(sameArrival), ...moreTime.slice(sameArrival.length, moreTime.length)]
            }

            //Do Process
            let queue = []
            processSummaryObj = { ...processSummaryObj, ...useData[0] }
            workObj = {
                process: {
                    ...useData[0],
                    startTime: 0,
                    completeTime: 0
                },
                queue: queue
            }
            workObj.process.startTime = time
            time += useData[0].burstTime
            workObj.process.completeTime = time

        } else { //Select Process for work when have Queue
            let queue = SortByBurstTime(workObj.queue).slice()

            processSummaryObj = { ...processSummaryObj, ...queue[0] }
            workObj = {
                process: {
                    ...queue[0],
                    startTime: 0,
                    completeTime: 0
                },
                queue: queue
            }
            workObj.process.startTime = time
            time += queue[0].burstTime
            workObj.process.completeTime = time
            //Pop Queue
            workObj.queue.shift()

        }

        //#region Find Queue when data have to do
        if (workSteps.length + 1 < data.length) {
            let q = 0
            while (q < data.length) {
                if (data[q].arrivalTime <= time) {
                    if (data[q].process != workObj.process.process && workObj.queue.every(item => item.process != data[q].process)) {
                        if (workSteps.length > 0) {
                            if (workSteps.every(item => item.process.process != data[q].process)) {
                                workObj.queue.push(data[q])
                            }
                        } else {
                            workObj.queue.push(data[q])
                        }
                    }
                }
                q++
            }
        }
        //#endregion

        processSummaryObj.waitTime = workObj.process.startTime - processSummaryObj.arrivalTime
        processSummaryObj.turnaroundTime = workObj.process.completeTime - processSummaryObj.arrivalTime
        processSummary.push(processSummaryObj)

        //#region Sum Waiting Time and Turnaround Time
        sumWaitTime += processSummaryObj.waitTime
        sumTurnaroundTime += processSummaryObj.turnaroundTime
        //#endregion

        workSteps.push(workObj)
        i++
    }

    return {
        process: processSummary,
        step: workSteps,
        averageWaitTime: sumWaitTime / data.length,
        averageTurnaroundTime: sumTurnaroundTime / data.length,
        time: time
    }

}
//#endregion

//#region Preemptive SJF Killing me slow
let PreemSJF = (data = [{
    process: "",
    arrivalTime: 0,
    burstTime: 0,
    priority: 0
}]) => {

    //#region Initain Data
    let workSteps = []
    let workObj = {
        process: {
            process: "",
            arrivalTime: 0,
            burstTime: 0,
            priority: 0,
            startTime: 0,
            completeTime: 0
        },
        queue: []
    }

    let processSummary = []
    let processSummaryObj = {
        process: "",
        arrivalTime: 0,
        burstTime: 0,
        priority: 0,
        waitTime: 0,
        turnaroundTime: 0
    }

    let time = 0
    let sumWaitTime = 0
    let sumTurnaroundTime = 0
    //#endregion

    let timeAll = 0
    data.forEach(item => timeAll += item.burstTime)
    let Preemptive = undefined
    while (time < timeAll) {
        notInWork = []
        let d = 0
        while (d < data.length) {
            let w = 0
            let chk = false
            while (w < workSteps.length) {
                if (data[d].process == workSteps[w].process.process) {
                    chk == true
                }
                w++
            }

            if (!chk) {
                notInWork.push(data[d])
            }

            d++
        }
        moreTime = SortByArrivalTime(notInWork)

        if (Preemptive != undefined) {
            let process = workObj.process
            // process.burstTime = data.find(item => item.process == process.process).burstTime - process.burstTime
            let queue = []
            let q = 0
            while (q < workObj.queue.length) {
                if (workObj.queue[q].process != Preemptive.process)
                    queue.push(workObj.queue[q])
                q++
            }
            queue.push(process)
            workObj = {
                process: {
                    ...Preemptive,
                    startTime: time,
                    completeTime: 0
                },
                queue: queue
            }

        } else if (workObj.queue.length > 0) {
            workObj.queue = SortByBurstTime(workObj.queue)
            let queue = []
            let q = 0
            while (q < workObj.queue.length) {
                queue.push(workObj.queue[q])
                q++
            }

            workObj = {
                process: {
                    ...queue[0],
                    startTime: time,
                    completeTime: 0
                },
                queue: []
            }
            queue.shift()
            workObj.queue = queue
        } else if (workObj.queue.length == 0) {
            let queue = []
            let sameArrival = moreTime.filter(item => item.arrivalTime == moreTime[0].arrivalTime)
            if (sameArrival > 0) {
                sameArrival = SortByBurstTime(sameArrival)
                queue = sameArrival.slice(1, sameArrival.length)
                moreTime = [...sameArrival, ...moreTime]
            }
            workObj = {
                process: {
                    ...moreTime[0],
                    startTime: time,
                    completeTime: 0
                },
                queue: queue
            }

        }

        let preem = []
        d = 0
        while (d < moreTime.length) {
            if (moreTime[d].arrivalTime <= (time + workObj.process.burstTime) && moreTime[d].process != workObj.process.process) {

                if (workObj.queue.every(q => moreTime[d].process != q.process) && workSteps.every(itemWork => itemWork.process.process != moreTime[d].process)) {
                    preem.push(moreTime[d])
                }
            }
            d++
        }
        if (preem.length > 0) {
            let queue = preem.filter(item => item.burstTime >= workObj.process.burstTime)
            if (queue.length > 0) {
                queue.forEach(item => {
                    workObj.queue.push(item)
                })
            } else {
                workObj.queue = queue
            }
            preem = preem.filter(item => item.burstTime < workObj.process.burstTime)
        }
        if (preem.length > 0) {
            preem = SortByArrivalTime(preem)
            Preemptive = preem[0]
            time = Preemptive.arrivalTime
            workObj.process.burstTime = Math.abs(Math.abs(Preemptive.arrivalTime - workObj.process.burstTime) - workObj.process.burstTime)
            workObj.process.completeTime = time
        } else {
            Preemptive = undefined
            time += workObj.process.burstTime
            workObj.process.burstTime -= workObj.process.burstTime
            workObj.process.completeTime = time
        }

        if (workObj.process.burstTime == 0) {
            processSummaryObj = { ...processSummaryObj, ...workObj.process }
            processSummaryObj.waitTime = workObj.process.startTime - processSummaryObj.arrivalTime
            processSummaryObj.turnaroundTime = workObj.process.completeTime - processSummaryObj.arrivalTime
            processSummary.push(processSummaryObj)

            //#region Sum Waiting Time and Turnaround Time
            sumWaitTime += processSummaryObj.waitTime
            sumTurnaroundTime += processSummaryObj.turnaroundTime
        }


        moreTime.forEach(item => {
            if (item.arrivalTime <= time && item.burstTime >= workObj.process.burstTime && item.process != workObj.process.process) {
                let notInQueue = workObj.queue.every(q => item.process != q.process)
                if (notInQueue) {
                    if (workSteps.length > 0) {
                        if (workSteps.every(itemWork => itemWork.process.process != item.process)) {
                            workObj.queue.push(item)
                        }
                    } else {
                        workObj.queue.push(item)
                    }

                }
            }
        })

        workSteps.push(workObj)
    }

    return {
        process: processSummary,
        step: workSteps,
        averageWaitTime: sumWaitTime / data.length,
        averageTurnaroundTime: sumTurnaroundTime / data.length,
        time: time
    }
}
//#endregion


//#endregion
let RoundRobin = (data = [{
    process: "",
    arrivalTime: 0,
    burstTime: 0,
    priority: 0
}], QT = 2) => {

    //#region Initain Data
    let workSteps = []
    let workObj = {
        process: {
            process: "",
            arrivalTime: 0,
            burstTime: 0,
            priority: 0,
            startTime: 0,
            completeTime: 0
        },
        queue: []
    }

    let processSummary = []
    let processSummaryObj = {
        process: "",
        arrivalTime: 0,
        burstTime: 0,
        priority: 0,
        waitTime: 0,
        turnaroundTime: 0
    }

    let time = 0
    let sumWaitTime = 0
    let sumTurnaroundTime = 0
    //#endregion
    let timeAll = 0
    data.forEach(item => timeAll += item.burstTime)

    while (time < timeAll) {

        if (data.length > 0) {
            let queue = []
            let q = 0
            while (q < workObj.queue.length) {
                queue.push(workObj.queue[q])
                q++
            }

            if(data[0].burstTime <= QT){
                workObj = {
                    process : {...data[0],...workObj.process},
                    queue: queue
                }
                workObj.process.startTime = time
                time += data[0].burstTime
                workObj.process.completeTime = time
                data.shift()
            }else{
                
            }


        } else {

        }



    }


}

//#region Sorted using Divide N Conquer and Merge Sort BigO(n log n)

let SortByArrivalTime = (data = [{
    process: "",
    arrivalTime: 0,
    burstTime: 0,
    priority: 0
}]) => {
    if (data.length == 1) {
        return data
    }

    //Divide and Conquer 
    let mid = parseInt(data.length / 2)
    let left = SortByArrivalTime(data.slice(0, mid))
    let right = SortByArrivalTime(data.slice(mid, data.length))

    //Merge Sort
    let inxL = inxR = 0
    let result = []
    while (inxL < left.length && inxR < right.length) {
        if (left[inxL].arrivalTime < right[inxR].arrivalTime) {
            result.push(left[inxL])
            inxL++
        } else if (left[inxL].arrivalTime > right[inxR].arrivalTime) {
            result.push(right[inxR])
            inxR++
        } else {
            result.push(left[inxL])
            result.push(right[inxR])
            inxL++
            inxR++
        }
    }

    while (inxL < left.length) {
        result.push(left[inxL])
        inxL++
    }

    while (inxR < right.length) {
        result.push(right[inxR])
        inxR++
    }

    return result
}

let SortByBurstTime = (data = [{
    process: "",
    arrivalTime: 0,
    burstTime: 0,
    priority: 0
}]) => {
    if (data.length == 1) {
        return data
    }

    //Divide and Conquer 
    let mid = parseInt(data.length / 2)
    let left = SortByBurstTime(data.slice(0, mid))
    let right = SortByBurstTime(data.slice(mid, data.length))

    //Merge Sort
    let inxL = inxR = 0
    let result = []
    while (inxL < left.length && inxR < right.length) {
        if (left[inxL].burstTime < right[inxR].burstTime) {
            result.push(left[inxL])
            inxL++
        } else if (left[inxL].burstTime > right[inxR].burstTime) {
            result.push(right[inxR])
            inxR++
        } else {
            result.push(left[inxL])
            result.push(right[inxR])
            inxL++
            inxR++
        }
    }

    while (inxL < left.length) {
        result.push(left[inxL])
        inxL++
    }

    while (inxR < right.length) {
        result.push(right[inxR])
        inxR++
    }

    return result
}

//#endregion


let data = [{
    process: "P1",
    arrivalTime: 0,
    burstTime: 7,
    priority: 0
}, {
    process: "P2",
    arrivalTime: 1,
    burstTime: 7,
    priority: 0
}, {
    process: "P3",
    arrivalTime: 3,
    burstTime: 3,
    priority: 0
}, {
    process: "P4",
    arrivalTime: 4,
    burstTime: 1,
    priority: 0
}]
// let data = [{
//     process: "P1",
//     arrivalTime: 0,
//     burstTime: 7,
//     priority: 0
// }, {
//     process: "P2",
//     arrivalTime: 0,
//     burstTime: 7,
//     priority: 0
// }, {
//     process: "P3",
//     arrivalTime: 0,
//     burstTime: 3,
//     priority: 0
// }, {
//     process: "P4",
//     arrivalTime: 0,
//     burstTime: 1,
//     priority: 0
// }]

// let result = PreemSJF(data)
// console.log(result)
// console.log(result)
