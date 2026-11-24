# GetmanY1/wav2vec2-large-conformer-24l-fi-471k

## Resumen

wav2vec2-large-conformer-24l-fi-471k es un modelo de representacion auto-supervisada del habla (speech SSL) para finlandes, desarrollado por Yaroslav Getman y colaboradores del grupo de tecnologia del habla de la Universidad Aalto (equipo de Mikko Kurimo). Se trata de un wav2vec 2.0 Large cuya pila de codificacion es un Conformer de 24 capas en lugar del transformer estandar, preentrenado sobre 471.000 horas de audio finlandes. El modelo no transcribe por si mismo: extrae representaciones latentes del audio que deben afinarse con una cabeza CTC y datos transcritos para tareas de reconocimiento automatico del habla (ASR).

El modelo forma parte del trabajo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL", que describe el pipeline de filtrado (deteccion de actividad de voz, deduplicacion basada en transcripciones y filtrado por confianza de ASR con umbral tau = -0,10) aplicado a 2,1 millones de horas de audio de radiodifusion para producir el corpus de preentrenamiento de 471.000 horas. Su relevancia radica en que demuestra que, a igualdad de presupuesto de parametros (317 M), una arquitectura Conformer supera al transformer clasico en ASR finlandes, especialmente en habla de radiodifusion real (KAVI), con una reduccion de WER de 23,60 a 19,86 puntos porcentuales frente al baseline anterior.

La arquitectura es un wav2vec 2.0 con encoder Conformer de 24 capas, dimension de modelo 768 y dimension feed-forward 2608, con 315.957.888 parametros totales segun los pesos en safetensors (317 M declarados por el autor). El modelo se distribuye bajo licencia Apache 2.0 y requiere `trust_remote_code=True` porque incluye codigo de modelado personalizado que reproduce el encoder de fairseq.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 con encoder Conformer (24 capas, d_model 768, FFN 2608) |
| Parametros totales | 315.957.888 (segun safetensors); 317 M declarados por el autor |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; entrada a 16 kHz mono, sin limite de contexto textual documentado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); checkpoint original en fairseq (`fairseq/checkpoint.pt`) |
| Libreria | transformers |
| Pipeline | feature-extraction |
| Entrada | audio mono a 16 kHz, `do_normalize=True` |
| Tamano del repo | 2,5 GB |
| Requiere `trust_remote_code` | si |

## Arquitectura y entrenamiento

El modelo sigue el paradigma wav2vec 2.0: un extractor convolucional de caracteristicas de audio alimenta un encoder que produce representaciones contextualizadas, entrenado de forma auto-supervisada mediante enmascaramiento de fotogramas latentes y una tarea contrastiva. La innovacion respecto al wav2vec 2.0 Large original es la sustitucion del encoder transformer por un Conformer de 24 capas, que combina bloques de auto-atencion con convoluciones depthwise para capturar dependencias locales y globales en la senal de audio. La dimension de modelo es 768 y la dimension feed-forward 2608, lo que arroja unos 317 M de parametros, comparable al wav2vec 2.0 Large estandar.

El preentrenamiento se realizo sobre 471.000 horas de habla finlandesa procedentes del archivo de radio y television de la Agencia Finlandesa de Arte y Cultura (KUVI, antes KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandes y Lahjoita puhetta. El pipeline partio de 2,1 millones de horas de audio de radiodifusion en bruto y aplico deteccion de actividad de voz, deduplicacion basada en transcripciones y filtrado por confianza de ASR con umbral tau = -0,10. El entrenamiento consistio en 167.000 actualizaciones con tasa de aprendizaje 4e-4, procesando aproximadamente 2 minutos de audio por GPU en 512 GPUs. No se documenta en la informacion disponible el uso de RLHF, DPO ni etapas de ajuste fino supervisado en este checkpoint base.

## Capacidades

- Extraccion de representaciones latentes del habla (feature extraction) para audio finlandes a 16 kHz.
- Base para ajuste fino en reconocimiento automatico del habla (ASR) con cabeza CTC y datos transcritos.
- Captura de informacion acustica y linguistica contextualizada gracias al encoder Conformer de 24 capas.
- Capacidad de servir como modelo base para otras tareas de habla (diarizacion, clasificacion de emociones, deteccion de palabras clave) mediante ajuste fino, aunque no se documentan resultados especificos.
- No incluye tokenizer ni cabeza CTC: no genera transcripciones directamente.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo de audio, no de lenguaje).
- Capacidad multilingue limitada al finlandes; no se documenta transferencia a otros idiomas.

## Casos de uso

- Reconocimiento automatico del habla en finlandes: ajustar el modelo con una cabeza CTC sobre datos transcritos (por ejemplo, Lahjoita puhetta o el corpus del Parlamento) para construir un sistema ASR de dominio especifico. El autor publica una version ya afinada (`-finetuned`) que alcanza WER de 16,46 en Lahjoita puhetta y 19,86 en KAVI.
- Transcripcion de archivos de radiodifusion: el preentrenamiento sobre 471.000 horas de audio de radio y television finlandeses hace que el modelo sea especialmente adecuado para habla de medios, como refleja su mejor WER en el conjunto KAVI (19,86) frente a alternativas.
- Subtitulado automatico de contenido audiovisual finlandes: ajuste fino sobre pares audio-texto de programas concretos para generar subtitulos con vocabulario y acentos del dominio.
- Investigacion en speech SSL: servir como punto de partida reproducible (codigo y configuraciones publicos en `aalto-speech/large-scale-monolingual-speech-foundation-models`) para estudiar el efecto de arquitecturas Conformer frente a transformer en idiomas de bajos recursos.
- Sistemas de dictado o asistentes de voz en finlandes: integracion del encoder como extractor de caracteristicas en pipelines de ASR en produccion tras el ajuste fino correspondiente.
- Analisis de corpus orales (Parlamento, entrevistas, archivos): extraccion de representaciones para tareas downstream como segmentacion, clasificacion de hablantes o busqueda por contenido en archivos de audio finlandeses.
- Benchmarking de arquitecturas: uso como referencia para comparar Conformer, E-Branchformer y transformer a igualdad de parametros en ASR finlandes.

## Benchmarks y rendimiento

Resultados de WER (%) de los modelos Large afinados para ASR, tabla III del paper, con recuento de parametros equiparable. LP = Lahjoita puhetta, FP = Finnish Parliament, CV = Common Voice 16.1, KAVI = habla de radiodifusion real.

| Modelo | Parametros | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer, 24 capas (baseline previo, 158K horas) | 317,4 M | 16,86 | 8,29 | 6,94 | 5,86 | 10,69 | 23,60 |
| Transformer, 24 capas | 317,4 M | 16,78 | 8,41 | 6,77 | 6,20 | 10,42 | 21,02 |
| **Conformer, 24 capas (este modelo)** | 317,2 M | 16,46 | 8,58 | **6,71** | 4,52 | 9,69 | **19,86** |
| Conformer, 36 capas | 317,1 M | 16,36 | 8,16 | 6,81 | **4,28** | 9,43 | 21,02 |
| E-Branchformer, 24 capas | 317,1 M | 16,30 | 8,22 | 6,84 | 4,33 | 9,59 | 20,01 |
| E-Branchformer, 36 capas | 317,4 M | **16,11** | **8,15** | 6,88 | 5,24 | **9,30** | 20,09 |

Los resultados corresponden a las versiones afinadas para ASR de cada arquitectura, no al checkpoint base de este repositorio, que no produce transcripciones por si mismo.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 317 M de parametros, en precision FP32 ocupa aproximadamente 1,3 GB de pesos; en FP16 unos 0,65 GB. La VRAM real dependera de la longitud del audio de entrada y del tamano de lote, no solo de los pesos.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia en FP16 con lotes pequenos; para ajuste fino con lotes mayores se recomiendan A100, H100 o GPUs de 24 GB o mas (RTX 4090, RTX A6000).
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) para inferencia y ajuste fino con lotes moderados.
- Opciones de despliegue: transformers con `trust_remote_code=True` (via oficial); el checkpoint original en fairseq requiere el fork `Getmany1/fairseq`. No se documenta soporte explicito para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Encoder | Contexto / datos | WER KAVI (afinado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Conformer 24L (este modelo) | 317,2 M | Conformer 24 capas | 471K h finlandes | 19,86 | Apache 2.0 | Hugging Face (base + finetuned) |
| Transformer 24L (baseline del paper) | 317,4 M | Transformer 24 capas | 471K h finlandes | 21,02 | no disponible | no disponible |
| E-Branchformer 24L | 317,1 M | E-Branchformer 24 capas | 471K h finlandes | 20,01 | no disponible | no disponible |
| Conformer 36L | 317,1 M | Conformer 36 capas | 471K h finlandes | 21,02 | no disponible | no disponible |

La comparativa se limita a las arquitecturas evaluadas en el mismo paper, ya que no se dispone de datos de otros modelos de speech SSL finlandeses en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint base no transcribe: carece de tokenizer y de cabeza CTC, por lo que debe afinarse con datos transcritos antes de usarse para ASR.
- Solo cubre finlandes; no se documenta rendimiento en otros idiomas ni capacidad de transferencia cross-lingue.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; conviene auditar dicho codigo antes de desplegarlo en produccion.
- El checkpoint original en fairseq requiere un fork especifico del repositorio, lo que anade complejidad de mantenimiento.
- Riesgo de sesgo de dominio: el preentrenamiento se basa en audio de radiodifusion, parlamento y corpus especificos, por lo que el rendimiento puede degradarse en acentos, ruido o dominios no representados.
- Riesgo de alucinacion en la salida de ASR tras el ajuste fino: como cualquier sistema CTC, puede producir transcripciones erroneas, especialmente en audio ruidoso o solapamiento de hablantes.
- No se han documentado evaluaciones de sesgo, robustez ni seguridad en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones de los corpus de preentrenamiento subyacentes (KUVI/KAVI, VoxPopuli, Parlamento, Lahjoita puhetta) si redistribuye derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-large-conformer-24l-fi-471k
- Version afinada para ASR: https://huggingface.co/GetmanY1/wav2vec2-large-conformer-24l-fi-471k-finetuned
- Paper (arXiv): https://arxiv.org/abs/2610.13102
- Codigo y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Fork de fairseq para el checkpoint original: https://github.com/Getmany1/fairseq
- Perfil de Hugging Face del autor: https://huggingface.co/GetmanY1
- Perfil de LinkedIn de Yaroslav Getman: https://www.linkedin.com/in/yaroslav-getman/
- Perfil de Hugging Face de Tamas Grosz: https://huggingface.co/Grosy
- Perfil de LinkedIn de Tamas Grosz: https://www.linkedin.com/in/tam%C3%A1s-gr%C3%B3sz-950a049a/
