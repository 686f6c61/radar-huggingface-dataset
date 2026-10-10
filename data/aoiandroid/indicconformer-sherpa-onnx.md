# aoiandroid/indicconformer-sherpa-onnx

## Resumen

`aoiandroid/indicconformer-sherpa-onnx` es un espejo (mirror) sin modificar del repositorio `parismitaglobalsolutions/indicconformer-sherpa-onnx`, fijado al commit `9721eb71eea141fae0982cfcdb9dd2e3d4953c4a`. No se trata de un modelo entrenado por el autor del espejo, sino de una copia de ficheros de un modelo de reconocimiento automatico del habla (ASR) ya convertido al formato ONNX para su uso con Sherpa-ONNX. El autor mantiene el espejo para que su aplicacion (Cription) no dependa de un repositorio de terceros.

El modelo subyacente es un IndicConformer: una red neuronal de tipo Conformer con decodificacion hibrida CTC/RNNT, segun se deduce del nombre del checkpoint original `ai4bharat/indicconformer_stt_hi_hybrid_ctc_rnnt_large`, referenciado en la conversion equivalente publicada por el usuario `meetsync`. AI4Bharat es el desarrollador del modelo original; este repositorio unicamente redistribuye una parte de la conversion ONNX (14 ficheros, 2568,8 MB) con las mismas rutas, tamanos y hashes que la fuente.

Su relevancia practica esta en el despliegue en dispositivo (on-device): al estar en formato ONNX e incluir cuantizacion INT8, puede ejecutarse con Sherpa-ONNX en moviles y equipos sin GPU, sin enviar audio a servicios externos. El repositorio no documenta parametros, idiomas exactos ni resultados de evaluacion; toda esa informacion deberia obtenerse del modelo fuente de AI4Bharat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con decodificacion hibrida CTC/RNNT (segun el nombre del checkpoint de origen `indicconformer_stt_hi_hybrid_ctc_rnnt_large`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; procesa audio por tramas, no contexto de texto) |
| Tipos de cuantizacion | INT8 (segun la conversion de referencia en `meetsync/indic-conformer-onnx-sherpa`); el espejo no detalla las variantes incluidas |
| Idiomas soportados | no disponibles en la model card; el sufijo `_hi` del checkpoint original apunta a hindi, y la conversion de referencia cita lenguas indias |
| Licencia | apache-2.0 (declarada por este espejo); la conversion de referencia y el modelo original de AI4Bharat se distribuyen bajo MIT |
| Formato de pesos | ONNX (Sherpa-ONNX) |

## Arquitectura y entrenamiento

La arquitectura es un Conformer, un transformer aumentado con convoluciones que combina mecanismos de atencion global con capas convolucionales para capturar dependencias locales en la secuencia de audio. El checkpoint de origen emplea decodificacion hibrida CTC/RNNT, un esquema habitual en ASR que entrena simultaneamente una cabeza CTC y una cabeza RNNT (transducer) sobre la misma representacion, lo que permite decodificar segun el coste computacional disponible.

No se dispone de informacion sobre el numero de tokens o horas de audio de entrenamiento, la composicion del dataset, ni si hubo etapas de ajuste fino (RLHF/DPO son propios de modelos de lenguaje y no aplican aqui). El espejo declara explicitamente que no ha modificado ningun fichero y que solo conserva el subconjunto de ficheros que usa la aplicacion. La unica innovacion tecnica documentada en este repositorio es la convers
