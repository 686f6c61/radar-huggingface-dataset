# GetmanY1/wav2vec2-large-24l-fi-471k-finetuned

## Resumen

wav2vec2-large-24l-fi-471k-finetuned es un modelo de reconocimiento automatico del habla (ASR) para finlandes, desarrollado por Yaroslav Getman y el equipo de aalto-speech (Universidad de Aalto) en colaboracion con investigadores del proyecto. Se trata de un modelo wav2vec 2.0 Large con encoder Transformer de 24 capas y 317 millones de parametros, preentrenado de forma auto-supervisada sobre 471 000 horas de audio en finlandes y afinado con CTC para transcripcion.

El modelo forma parte de la publicacion "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL: Confidence Filtering and Architectural Analysis at Scale" (arXiv:2610.13102), que explora el preentrenamiento a gran escala de modelos de habla monolingues en finlandes a partir de audio de radiodifusion. La relevancia actual radica en que demuestra que el preentrenamiento SSL masivo con datos de archivo (radio y television) permite obtener modelos ASR competitivos sin depender exclusivamente de corpus transcritos.

Arquitectura transformer con 1024 dimensiones de modelo y 4096 de feed-forward, entrada de audio mono a 16 kHz y salida CTC a nivel de caracter. La licencia Apache 2.0 facilita su uso comercial, y el modelo base (wav2vec2-large-24l-fi-471k) esta disponible para tareas de representacion del habla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 Large con encoder Transformer (24 capas) |
| Parametros totales | 315 473 570 (317.4M segun la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio variable; no se especifica limite explicito) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se puede cuantizar con herramientas estandar, pero no se documenta) |
| Idiomas soportados | finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y checkpoint fairseq (`fairseq/checkpoint.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec 2.0: un encoder convolucional de caracteristicas (CNN) seguido de un encoder Transformer de 24 capas con dimension de modelo 1024 y feed-forward 4096. El preentrenamiento es auto-supervisado (objetivo wav2vec 2.0 con enmascaramiento y contraste), realizado sobre 471 000 horas de habla finlandesa procedente del Archivo de Radio y Television de la Agencia Finlandesa de Arte y Cultura (KUVI, antes KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandes y Lahjoita puhetta. El pipeline de filtrado incluyo deteccion de actividad de voz, deduplicacion basada en transcripciones y filtrado por confianza ASR (tau = -0.10). El preentrenamiento se ejecuto durante 167 000 actualizaciones con learning rate 4e-4 y aproximadamente 2 minutos de audio por GPU en 512 GPUs.

El afinamiento se realizo con CTC sobre 4600 horas de habla transcrita (Parlamento finlandes y Lahjoita puhetta) durante 25 000 actualizaciones, con el encoder CNN congelado, en 128 GPUs. La entrada es audio mono a 16 kHz con `do_normalize=True`. La innovacion principal del trabajo es el uso de audio de radiodifusion a gran escala con filtrado por confianza ASR para construir modelos fundacionales de habla monolingues, y el analisis comparativo de arquitecturas (Transformer, Conformer, E-Branchformer) con el mismo numero de parametros.

## Capacidades

- Reconocimiento automatico del habla (ASR) en finlandes con salida CTC a nivel de caracter.
- Transcripcion de audio de radiodifusion, discursos parlamentarios y habla espontanea.
- Procesamiento de audio mono a 16 kHz con normalizacion integrada.
- Modelo base disponible para tareas de representacion del habla (self-supervised learning).
- No soporta tool calling, function calling ni agentes: es un modelo puramente acustico-ASR.
- No tiene capacidades multilingues: solo finlandes.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Transcripcion de archivos audiovisuales: el modelo puede procesar audio de radio y television finlandesa para generar transcripciones automaticas, aprovechando su preentrenamiento sobre el archivo KUVI y su buen rendimiento en el conjunto KAVI (WER 21.02%).
- Subtitulado de contenido parlamentario: adecuado para transcribir sesiones del Parlamento finlandes, con WER de 8.41% en FP'16 y 6.77% en FP'20, gracias al afinamiento sobre este dominio.
- Investigacion en tecnologias del habla: sirve como modelo base o punto de comparacion para experimentos de ASR en finlandes y para estudios de arquitecturas (Transformer frente a Conformer/E-Branchformer).
- Sistemas de atencion al ciudadano: transcripcion de llamadas o mensajes de voz en finlandes para su posterior procesamiento textual, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Generacion de corpus transcritos: util para crear datasets de habla finlandesa a partir de grabaciones no transcritas, mediante inferencia por lotes con CTC.
- Integracion en pipelines de accesibilidad: conversion de audio a texto para personas con discapacidad auditiva en entornos finlandeses, con despliegue en servidores con GPU o CPU.
- Analisis de medios de comunicacion: indexacion y busqueda de contenido en archivos de radio y television finlandeses mediante transcripcion masiva.

## Benchmarks y rendimiento

Resultados de WER (%) en test de los modelos Large afinados (Tabla III del paper), con recuento de parametros equivalente. LP = Lahjoita puhetta, FP = Parlamento finlandes, CV = Common Voice 16.1, KAVI = habla de radiodifusion real.

| Modelo | Parametros | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer 24 capas (baseline previo, 158K horas) | 317.4M | 16.86 | 8.29 | 6.94 | 5.86 | 10.69 | 23.60 |
| **Transformer 24 capas (este modelo)** | 317.4M | 16.78 | 8.41 | 6.77 | 6.20 | 10.42 | 21.02 |
| Conformer 24 capas | 317.2M | 16.46 | 8.58 | 6.71 | 4.52 | 9.69 | 19.86 |
| Conformer 36 capas | 317.1M | 16.36 | 8.16 | 6.81 | 4.28 | 9.43 | 21.02 |
| E-Branchformer 24 capas | 317.1M | 16.30 | 8.22 | 6.84 | 4.33 | 9.59 | 20.01 |
| E-Branchformer 36 capas | 317.4M | 16.11 | 8.15 | 6.88 | 5.24 | 9.30 | 20.09 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1.3 GB en fp32 (317M parametros), alrededor de 0.7 GB en fp16 y 0.4 GB en int8. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes. Para inferencia por lotes a gran escala se recomienda A100/H100.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas (incluidas GTX 1650 o superiores).
- Opciones de despliegue: transformers con `AutoModelForCTC` y `Wav2Vec2Processor`, vLLM no soporta ASR CTC de forma nativa, llama.cpp/Ollama no estan orientados a este tipo de modelo, TGI no lo soporta de forma estandar; se puede usar ONNX Runtime o TorchScript para optimizacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento (WER KAVI) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Transformer 24 capas) | 317.4M | audio 16 kHz variable | 21.02 | Apache 2.0 | Hugging Face |
| Conformer 24 capas (mismo paper) | 317.2M | audio 16 kHz variable | 19.86 | Apache 2.0 (presumible) | Hugging Face (mismo repo de proyecto) |
| E-Branchformer 36 capas (mismo paper) | 317.4M | audio 16 kHz variable | 20.09 | Apache 2.0 (presumible) | Hugging Face (mismo repo de proyecto) |
| wav2vec2-large-fi (modelos previos finlandeses) | ~317M | audio 16 kHz variable | no disponible | variable | Hugging Face |

## Limitaciones y advertencias

- Solo soporta finlandes; no es multilingue y su uso en otros idiomas producira transcripciones incorrectas.
- Riesgo de alucinacion en ASR: el modelo puede generar texto plausible en segmentos con ruido, silencio o habla no finlandesa.
- Sesgos derivados del corpus de entrenamiento (radiodifusion, parlamento, Lahjoita puhetta): puede tener peor rendimiento en acentos regionales, habla infantil o jerga no representada.
- El WER en habla de radiodifusion real (KAVI, 21.02%) es notablemente superior al de dominios controlados, lo que limita su uso directo en produccion sin revision humana.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los terminos de los datos de preentrenamiento (archivo KUVI, VoxPopuli, Parlamento) para usos derivados.
- No incluye puntuacion ni capitalizacion en la salida CTC; requiere postprocesado para texto legible.
- No se documentan cuantizaciones oficiales ni limites de contexto explicitos; el rendimiento en audio muy largo dependera de la implementacion.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: poca validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-large-24l-fi-471k-finetuned
- Modelo base: https://huggingface.co/GetmanY1/wav2vec2-large-24l-fi-471k
- Paper: https://arxiv.org/abs/2610.13102
- Codigo y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Perfil del autor: https://huggingface.co/GetmanY1
- Perfil de Tamas Grosz: https://huggingface.co/Grosy
