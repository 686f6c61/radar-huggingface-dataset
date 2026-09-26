# krut42/voice-zipformer-tg-int8

## Resumen

voice-zipformer-tg-int8 es una version cuantizada a int8 del modelo de reconocimiento automatico del habla (ASR) en tayiko (tg) publicado originalmente por Alpha Cephei como alphacep/vosk-model-tg (Vosk Tajik Speech Recognition Model, version 0.61). Se trata de un transductor Zipformer2 no streaming (arquitectura encoder-decoder-joiner de tipo RNN-T, tambien denominada transducer) que reconoce audio de 16 kHz mono y devuelve texto en minusculas sin puntuacion. El autor de esta ficha (krut42) no ha reentrenado el modelo: ha cuantizado dinamicamente a int8 los ficheros encoder.onnx y joiner.onnx con ONNX Runtime, dejando decoder.onnx y tokens.txt sin cambios.

El modelo resuelve la transcripcion de voz en tayiko en dispositivos, sin conexion y con recursos limitados. Esta pensado como fuente de respaldo para la aplicacion Android «Слышно» (Slyshno), que descarga cada fichero por separado y verifica su tamano y su SHA-256. Los tres ficheros de pesos ocupan en conjunto unos 73 MB (encoder.int8.onnx 70,9 MB, decoder.onnx 2,09 MB, joiner.int8.onnx 259 KB), lo que lo hace apto para telefonos moviles de gama baja.

Su relevancia actual radica en que el tayiko es un idioma con recursos escasos y pocos modelos ASR disponibles, y esta variante int8 permite ejecucion en CPU de moviles antiguos con factores de tiempo real (RTF) inferiores a 1. La contrapartida es una perdida pequena pero medible de precision frente a la version fp32 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer2 no streaming (transducer RNN-T: encoder + decoder + joiner) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo no streaming; procesa el enunciado completo) |
| Tipos de cuantizacion | int8 (cuantizacion dinamica de nodos MatMul con pesos int8, via ONNX Runtime); el modelo base es fp32 |
| Idiomas soportados | tayiko (tg) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.onnx, joiner.int8.onnx) + tokens.txt |
| Tamano del repo | 0,1 GB |
| Frecuencia de muestreo de entrada | 16 kHz mono, caracteristicas de 80 dimensiones |

## Arquitectura y entrenamiento

La arquitectura es un transductor (transducer) basado en Zipformer2, en configuracion no streaming (offline), con tres componentes: un encoder que procesa las caracteristicas acusticas, un decoder de prediccion y un joiner que combina ambas representaciones. Este diseno es el estandar en los modelos Vosk de Alpha Cephei para reconocimiento en dispositivo. La cuantizacion aplicada en esta version actua sobre los nodos MatMul del encoder y del joiner, guardando los pesos en int8; el decoder y el vocabulario se mantienen identicos al modelo original.

Segun la model card del modelo base, el entrenamiento se realizo sobre el dataset Peacockery/tajik-asr-corpus-v3 (CC BY 4.0), compuesto por aproximadamente 1059 horas de audio extraido de YouTube con transcripciones generadas automaticamente por ElevenLabs, no por anotadores humanos. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO (no procede habitualmente en ASR). La innovacion tecnica de esta publicacion concreta es exclusivamente la cuantizacion int8 para reducir el tamano y el consumo de memoria en moviles.

## Capacidades

- Reconocimiento automatico del habla en tayiko (tg) a partir de audio de 16 kHz mono.
- Transcripcion en modo no streaming: procesa el enunciado completo y devuelve el resultado de una vez.
- Salida en texto en minusculas y sin puntuacion (comportamiento declarado por el autor).
- Ejecucion en dispositivo (on-device) sobre CPU, sin necesidad de GPU ni conexion a red.
- Integracion con sherpa-onnx mediante un OfflineRecognizer con configuracion de tipo transducer.
- Verificacion de integridad: cada fichero incluye tamano y SHA-256 publicados por el autor.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni capacidades multilingues mas alla del tayiko.

## Casos de uso

- Transcripcion en dispositivo en la aplicacion Android «Слышно» (Slyshno): es el caso de uso declarado del modelo, que la app descarga para transcribir voz localmente sin enviar audio a servidores externos.
- Subtitulado offline de audio en tayiko: al ejecutarse en CPU con RTF bajo en moviles antiguos, permite generar subtitulos de grabaciones o videos almacenados en el propio dispositivo.
- Asistentes de voz y dictado en tayiko: la salida en minusculas sin puntuacion es adecuada como entrada para modulos posteriores de normalizacion o para comandos de voz que no requieren formato.
- Digitalizacion de archivos de audio historicos o periodisticos en tayiko: el modelo puede procesar lotes de grabaciones en maquinas sin GPU, ya que su consumo de memoria es de centenares de MB.
- Sistemas embebidos y dispositivos con recursos limitados: con un peak RSS de 282-367 MB y soporte armeabi-v7a, cabe en telefonos de 2 GB de RAM como el MT6735m documentado.
- Aplicaciones de accesibilidad para personas con discapacidad auditiva en comunidades tayikoparlantes: permite transcripcion local en tiempo real (o casi) sin depender de conectividad.
- Anotacion asistida de corpus en tayiko: como primer paso de transcripcion automatica previa a la revision humana, dado que el idioma tiene pocos recursos.

## Benchmarks y rendimiento

| Prueba | Metrica | int8 (este modelo) | fp32 (modelo base) |
|---|---|---|---|
| FLEURS tg_tj dev (primeros 12 clips, sherpa-onnx 1.13.8) | WER | 16,0 % | 15,3 % |
| FLEURS tg_tj dev (primeros 12 clips, sherpa-onnx 1.13.8) | CER | 5,9 % | 5,7 % |
| FLEURS test split (segun model card original) | WER | no disponible | 13,85 % |

Rendimiento en moviles (fragmentos de 25 s, 2 hilos; factor de tiempo real / RSS maximo):

| Dispositivo | RTF | RSS maximo |
|---|---|---|
| Snapdragon 835 | 0,11 | 367 MB |
| Kirin 710 | 0,23 | 367 MB |
| MT6735m (armeabi-v7a, 2 GB RAM) | 0,96 | 282 MB |

Un RTF inferior a 1 indica que la transcripcion es mas rapida que el tiempo real del audio.

## Requisitos de hardware

- Inferencia sobre CPU; no requiere GPU.
- Memoria: los pesos suman unos 73 MB (encoder.int8.onnx 70,9 MB + decoder.onnx 2,09 MB + joiner.int8.onnx 259 KB). El uso en ejecucion reportado es de 367 MB de RSS en Snapdragon 835 y Kirin 710, y 282 MB en MT6735m.
- Cabe en telefonos de gama baja y en cualquier portatil o equipo de sobremesa, incluso con poca RAM.
- GPUs recomendadas: no aplica; el modelo esta disenado para CPU. En caso de ejecutarse en un servidor, cualquier CPU moderna es suficiente.
- Despliegue: sherpa-onnx con OfflineRecognizer en configuracion transducer (model_type = "transducer"), entrada de 16 kHz mono y 80 dimensiones de caracteristicas. No esta previsto para vLLM, TGI ni Ollama, que no soportan este formato de modelo ASR.
- Latencia y throughput: RTF de 0,11 en Snapdragon 835, 0,23 en Kirin 710 y 0,96 en MT6735m con fragmentos de 25 s y 2 hilos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Cuantizacion | Idioma | WER FLEURS dev | Licencia | Tamano de pesos |
|---|---|---|---|---|---|---|
| krut42/voice-zipformer-tg-int8 | Zipformer2 transducer | int8 | tg | 16,0 % | Apache 2.0 | ~73 MB |
| alphacep/vosk-model-tg (modelo base) | Zipformer2 transducer | fp32 | tg | 15,3 % | Apache 2.0 | no disponible con precision |

No se dispone en la informacion proporcionada de datos comparativos con otros modelos ASR en tayiko (por ejemplo alternativas de tipo Whisper), por lo que no se incluyen.

## Limitaciones y advertencias

- Precision degradada respecto al modelo base: la cuantizacion int8 eleva el WER de 15,3 % a 16,0 % y el CER de 5,7 % a 5,9 % en la prueba FLEURS dev realizada.
- Datos de entrenamiento generados automaticamente: las transcripciones del corpus (1059 h de audio de YouTube) fueron producidas con ElevenLabs, no por anotadores humanos, lo que puede introducir sesgos y errores sistematicos que el modelo aprende.
- Unico idioma soportado: tayiko (tg). No es multilingue ni detecta cambio de idioma.
- Salida limitada: texto en minusculas y sin puntuacion, segun declara el autor; puede requerir un post-procesado para su uso en produccion.
- Modelo no streaming: no transcribe palabra a palabra de forma incremental; procesa el enunciado completo.
- Riesgo de alucinacion y de errores en audio con ruido, acentos no representados en el corpus o vocabulario tecnico poco frecuente, como es habitual en sistemas ASR.
- Uso comercial permitido por la licencia Apache 2.0, pero conviene conservar los avisos de atribucion a Alpha Cephei y a los autores del dataset (CC BY 4.0).
- El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y su unico proposito declarado es servir de espejo de respaldo para una aplicacion concreta; no debe considerarse un modelo con soporte comunitario amplio.
- La cuantizacion solo afecta a encoder.onnx y joiner.onnx; decoder.onnx y tokens.txt son los ficheros originales sin modificar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/krut42/voice-zipformer-tg-int8
- Modelo base: https://huggingface.co/alphacep/vosk-model-tg
- Dataset de entrenamiento: https://huggingface.co/datasets/Peacockery/tajik-asr-corpus-v3
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- sherpa-onnx (libreria de inferencia): https://github.com/k2-fsa/sherpa-onnx
- Alpha Cephei (desarrollador del modelo base): https://alphacephei.com/
