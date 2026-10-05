# Masterx/parakeet-tdt-0.6b-redux-onnx

## Resumen

Parakeet TDT 0.6B Redux (ONNX, int4) es un empaquetado del modelo de reconocimiento automatico del habla (ASR) `moondream/parakeet-redux`, la variante con cuantizacion ternaria de 1,58 bits del `nvidia/parakeet-tdt-0.6b-v3`. Esta ficha concreta, publicada por el usuario Masterx, republica la exportacion ONNX ya existente de `eschmidbauer/parakeet-redux-onnx` renombrando los ficheros con el sufijo `int4`, ya que los pesos ternarios del codificador se almacenan como bloques `MatMulNBits` de 4 bits que reproducen exactamente los valores -1/0/+1.

El modelo pertenece a la familia NeMo Conformer TDT (Token-and-Duration Transducer) y cuenta con aproximadamente 600 millones de parametros. Su proposito es ofrecer transcripcion de voz multilingue (25 idiomas europeos) en entornos sin GPU, ya que la ejecucion esta pensada exclusivamente para CPU mediante onnxruntime. Es relevante para desarrolladores que necesitan ASR ligero, sin dependencias de CUDA y con peso de repositorio reducido (0,4 GB).

La licencia es CC-BY-4.0, heredada de `moondream/parakeet-redux` y de `nvidia/parakeet-tdt-0.6b-v3`. El modelo no incluye datos de benchmarks en la informacion disponible y su ejecucion en el Execution Provider DirectML falla, por lo que el despliegue previsto es sobre CPU con onnxruntime clasico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer TDT (Token-and-Duration Transducer) |
| Parametros totales | ~0,6 B (600 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos ternarios (1,58 bits) almacenados como MatMulNBits int4, block size 128 |
| Idiomas soportados | en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt (25 idiomas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder-model.int4.onnx, decoder_joint-model.int4.onnx), opset 18 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Conformer TDT implementada en NVIDIA NeMo. Se compone de un codificador Conformer (convoluciones + auto-atencion) y una red de prediccion mas un modulo joint que forman el decodificador tipo transducer. La variante TDT (Token-and-Duration Transducer) predice conjuntamente el token y su duracion, lo que reduce el numero de pasos de decodificacion frente a un transducer clasico. El modelo original `nvidia/parakeet-tdt-0.6b-v3` es la base sobre la que se aplico la cuantizacion ternaria de `moondream/parakeet-redux`.

En esta republicacion los grafos ONNX son identicos byte a byte a la exportacion upstream; la unica diferencia son los nombres de fichero con sufijo `int4`. El codificador emplea bloques `MatMulNBits` de 4 bits (dominio com.microsoft) que representan de forma exacta los valores ternarios -1/0/+1, mientras que el decodificador (`decoder_joint-model.int4.onnx`) mantiene la red de prediccion y el joint en fp32, sin cambios respecto al fichero original. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Reconocimiento automatico del habla (ASR) sobre audio en 25 idiomas europeos.
- Transcripcion monolingue y aprovechamiento de la cobertura multilingue de la familia Parakeet (incluye espanol, aleman, frances, italiano, portugues, ruso, ucraniano y lenguas escandinavas, eslavas y balticas).
- Decodificacion eficiente mediante el esquema TDT, que predice token y duracion de forma conjunta.
- Ejecucion en CPU sin GPU gracias a la cuantizacion ternaria comprimida en int4.
- Compatible con la libreria `onnx-asr` para el pipeline de inferencia.
- No se documentan capacidades de vision, audio-vision, tool calling ni agentes; el modelo es exclusivamente ASR.
- No dispone de modo de razonamiento (thinking mode) ni generacion de texto general.

## Casos de uso

- Transcripcion de reuniones y notas de voz en local: el modelo procesa audio sin GPU, por lo que puede integrarse en portatiles o servidores sin CUDA para generar transcripciones multilingues de reuniones de trabajo.
- Subtitulado automatico de contenido audiovisual: con soporte para 25 idiomas europeos, permite generar subtitulos para videos en distintos idiomas sobre infraestructura CPU.
- Asistentes de voz embebidos o de borde (edge computing): al ocupar 0,4 GB de repositorio y ejecutarse en CPU, encaja en dispositivos con recursos limitados donde no hay GPU disponible.
- Dictado y transcripcion en aplicaciones de productividad: integracion en editores de texto o herramientas de toma de notas para dictado continuo en varios idiomas.
- Analitica de llamadas y atencion al cliente: transcripcion de grabaciones de call center para posteriores tareas de analisis, clasificacion y busqueda sobre el texto generado.
- Accesibilidad: generacion de transcripciones en tiempo real o diferido para personas con discapacidad auditiva en entornos sin aceleracion por hardware.
- Preprocesado de pipelines de datos de voz: conversion de grandes volumenes de audio a texto en lotes sobre CPU antes de alimentar sistemas de NLP posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de WER (Word Error Rate) ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- Inferencia prevista exclusivamente en CPU. El encoder en el Execution Provider DirectML (onnxruntime 1.24) falla en tiempo de ejecucion por un nodo Reshape (codigo 0x8007023E).
- Tamano de repositorio: 0,4 GB, lo que refleja la fuerte compresion derivada de la cuantizacion ternaria almacenada en int4.
- No requiere GPU; al estar cuantizado a ~1,58 bits puede ejecutarse en maquinas con RAM modesta (del orden de 1 GB o menos para cargar los pesos en memoria, aunque la cifra exacta de VRAM/RAM no esta disponible en la informacion proporcionada).
- Opciones de despliegue: onnxruntime (CPU) y la libreria `onnx-asr`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR ONNX.
- No se dispone de datos de latencia ni throughput (tokens por segundo o factor de tiempo real) en la informacion facilitada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| Masterx/parakeet-tdt-0.6b-redux-onnx | ~0,6 B | no disponible | no disponible | CC-BY-4.0 | ONNX int4 |
| nvidia/parakeet-tdt-0.6b-v3 | ~0,6 B | no disponible | no disponible | CC-BY-4.0 (heredada) | NeMo / safetensors |
| moondream/parakeet-redux | ~0,6 B | no disponible | no disponible | CC-BY-4.0 | ternario 1,58 bits |

No se dispone de datos numericos de benchmarks que permitan comparar el rendimiento relativo con alternativas de la misma categoria, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- Solo ejecucion en CPU: en DirectML (onnxruntime 1.24) el encoder falla con error de Reshape (0x8007023E); no debe asumirse compatibilidad con aceleracion GPU via ese proveedor.
- Es una republicacion: los grafos son identicos a la exportacion upstream y solo cambian los nombres de fichero, por lo que no aporta mejoras tecnicas sobre `eschmidbauer/parakeet-redux-onnx`.
- La cuantizacion ternaria (1,58 bits) puede degradar la precision respecto al modelo fp32 original, aunque la model card no aporta cifras de WER para cuantificar la perdida.
- Cobertura limitada a 25 idiomas europeos; no se garantiza rendimiento en otras lenguas o variedades dialectales no listadas.
- Riesgo de errores de transcripcion (sustituciones, omisiones y alucinacion de texto en audio ruidoso o con silencios), habitual en modelos ASR.
- Licencia CC-BY-4.0: permite uso comercial siempre que se atribuya la autoria y se indique la licencia; conviene revisar las condiciones heredadas de `nvidia/parakeet-tdt-0.6b-v3`.
- Modelo con 0 descargas y 0 likes en el momento del analisis, sin validacion de la comunidad ni mantenimiento confirmado.
- No hay informacion sobre sesgos por idioma, acento o genero en la documentacion proporcionada.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/Masterx/parakeet-tdt-0.6b-redux-onnx
- Exportacion ONNX upstream: https://huggingface.co/eschmidbauer/parakeet-redux-onnx
- Modelo ternario base: https://huggingface.co/moondream/parakeet-redux
- Modelo original NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
