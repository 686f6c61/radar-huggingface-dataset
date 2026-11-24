# GetmanY1/wav2vec2-xlarge-ebranch-48l-fi-471k-finetuned

## Resumen

wav2vec2-xlarge-ebranch-48l-fi-471k-finetuned es un modelo de reconocimiento automatico del habla (ASR) para finlandes desarrollado por Yaroslav Getman y colaboradores del grupo de investigacion en tecnologia del habla de la Universidad Aalto. Se trata de un modelo wav2vec 2.0 X-Large en el que el encoder transformer original se ha sustituido por un encoder E-Branchformer de 48 capas, preentrenado de forma autosupervisada sobre 471.000 horas de audio finlandes y posteriormente ajustado con CTC para transcripcion.

El modelo forma parte de la familia publicada junto al articulo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL" (arXiv:2610.13102), que describe el proceso de filtrado por confianza de ASR aplicado a 2,1 millones de horas de audio de radiodifusion en bruto para construir el corpus de preentrenamiento. Con 964 millones de parametros, es un modelo monolingue especializado que compite en la misma escala que los baselines Transformer y Conformer de 48 capas evaluados en el paper.

Su relevancia radica en dos aspectos: por un lado, demuestra que la arquitectura E-Branchformer ofrece ventajas medibles frente a Transformer y Conformer en WER sobre dominios dificiles como el habla de radiodifusion real (KAVI), y por otro, libera bajo licencia Apache 2.0 un modelo de ASR finlandes de gran escala con pesos en safetensors, codigo de modelado personalizado y el checkpoint original de fairseq.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 con encoder E-Branchformer (48 capas) |
| Parametros totales | 964.247.714 (966M segun model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz; ventana dependiente del encoder convolucional) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y checkpoint fairseq (`fairseq/checkpoint.pt`) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma wav2vec 2.0: un encoder convolucional que transforma la onda de audio a una secuencia de representaciones latentes, seguido de un encoder de contexto que en este caso es un E-Branchformer de 48 capas con dimension de modelo 1024 y dimension feed-forward 2048. El E-Branchformer combina atencion global con ramas convolucionales locales, lo que en el paper se traduce en mejoras de WER en dominios de habla espontanea y de radiodifusion. El modelo emplea codigo de modelado personalizado para reproducir el encoder de fairseq, por lo que requiere `trust_remote_code=True` al cargarse con transformers.

El preentrenamiento autosupervisado se realizo sobre 471.000 horas de audio finlandes procedente del archivo de radio y television de la Agencia Finlandesa de Arte y Cultura (KAVI, anteriormente Instituto Audiovisual Nacional), el corpus KUVI, los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandes y Lahjoita puhetta. Las 2,1 millones de horas originales de audio de radiodifusion se filtraron mediante deteccion de actividad vocal, deduplicacion basada en transcripciones y filtrado por confianza de ASR (tau = -0,10). El entrenamiento consistio en 400.000 actualizaciones con tasa de aprendizaje 1e-4, aproximadamente un minuto de audio por GPU en 512 GPUs.

El ajuste fino se realizo con CTC sobre 4.600 horas de habla transcrita (Parlamento finlandes y Lahjoita puhetta) durante 45.000 actualizaciones, con el encoder convolucional de caracteristicas congelado, en 128 GPUs. La entrada es audio mono a 16 kHz con `do_normalize=True`.

## Capacidades

- Reconocimiento automatico del habla en finlandes a partir de audio mono a 16 kHz.
- Transcripcion con salida a nivel de caracter (CTC), decodificable con `Wav2Vec2Processor`.
- Manejo de habla espontanea y de radiodifusion real, con WER competitivo en dominios como KAVI y el Parlamento finlandes.
- Preentrenamiento autosupervisado que permite reutilizar el encoder como extractor de representaciones de habla para tareas posteriores.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente acustico de ASR.
- No dispone de capacidades de vision, audio generativo ni modo de razonamiento explicito.
- Capacidad multilingue limitada al finlandes; no se ha entrenado para otras lenguas.

## Casos de uso

- Transcripcion de archivos audiovisuales de radiodifusion finlandesa: el modelo se entreno especificamente sobre audio de KAVI y del archivo de radio y television, por lo que es adecuado para digitalizar y transcribir fondos historicos con ruido y habla espontanea.
- Subtitulado automatico de contenido en finlandes: la salida CTC a nivel de caracter puede alinearse temporalmente para generar subtitulos en emisiones, videos corporativos o material educativo.
- Analisis de sesiones parlamentarias: el ajuste fino incluye el corpus del Parlamento finlandes, lo que lo hace util para transcribir debates politicos y generar actas indexables.
- Investigacion en tecnologias del habla: el checkpoint preentrenado y el encoder E-Branchformer sirven como base para experimentos de ASR, diarizacion o clasificacion de habla en finlandes.
- Sistemas de atencion al cliente en finlandes: transcripcion de llamadas o mensajes de voz para su posterior analisis de sentimiento o enrutamiento, siempre que se despliegue con la latencia adecuada.
- Generacion de corpus textuales a partir de audio: transcripcion masiva de entrevistas, podcasts o archivos orales para construir datasets de texto en finlandes.
- Accesibilidad: conversion de audio a texto para personas con discapacidad auditiva en contenidos finlandeses.

## Benchmarks y rendimiento

Resultados de WER (%) en test de los modelos X-Large ajustados, tabla III del paper. LP = Lahjoita puhetta, FP = Parlamento finlandes, CV = Common Voice 16.1, KAVI = habla de radiodifusion real. Mejores resultados a esta escala en negrita.

| Modelo | Parametros | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer, 48 capas (baseline previo, 158K horas) | 965,5M | 16,37 | 7,81 | 6,43 | 5,42 | 9,96 | 22,42 |
| Transformer, 48 capas | 965,5M | **16,27** | 7,83 | **6,26** | 3,85 | 9,37 | **19,54** |
| Conformer, 48 capas | 964,7M | 17,13 | 7,78 | 6,45 | **3,68** | **9,08** | 20,75 |
| E-Branchformer, 48 capas (este modelo) | 965,6M | 16,74 | **7,63** | 6,38 | 4,45 | 9,13 | 19,96 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3,9 GB solo para pesos (964M parametros x 4 bytes), mas activaciones y buffers; en la practica se recomienda al menos 8-12 GB para audio de duracion media.
- En fp16/bf16: aproximadamente 1,9 GB para pesos; cabe en GPUs consumer como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090.
- En cuantizacion de 8 bits: alrededor de 1 GB para pesos, viable en GPUs con 4-6 GB.
- GPU recomendadas para produccion: A100 40/80 GB o H100 para procesamiento por lotes de alto throughput; RTX 4090 o L4 para despliegues de baja latencia.
- Opciones de despliegue: transformers con `AutoModelForCTC` y `trust_remote_code=True`; el checkpoint original de fairseq se puede cargar con el fork del autor. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de texto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER KAVI | WER CV | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| E-Branchformer 48L (este modelo) | 965,6M | no disponible | 19,96 | 4,45 | Apache 2.0 | Hugging Face |
| Transformer 48L (mismo paper) | 965,5M | no disponible | 19,54 | 3,85 | no disponible | no disponible |
| Conformer 48L (mismo paper) | 964,7M | no disponible | 20,75 | 3,68 | no disponible | no disponible |
| Transformer 48L baseline previo (158K h) | 965,5M | no disponible | 22,42 | 5,42 | no disponible | no disponible |

La comparativa se limita a los baselines del mismo paper, ya que no se dispone de informacion sobre otros modelos publicos de ASR finlandes de escala comparable en la documentacion proporcionada. Frente al baseline previo de 158K horas, este modelo reduce el WER en KAVI de 22,42 a 19,96 y en Common Voice de 5,42 a 4,45. Frente al Transformer de 48 capas del mismo paper, mejora en FP'16 (7,63 frente a 7,83) y en KAVI (19,96 frente a 19,54 es peor, aunque la diferencia es pequena), mientras que el Conformer obtiene el mejor WER en CV y FLEURS.

## Limitaciones y advertencias

- Modelo monolingue: solo transcribe finlandes; no se ha evaluado en otras lenguas y probablemente produzca salidas incorrectas en audio no finlandes.
- Riesgo de alucinacion en ASR: en segmentos con ruido, musica o habla solapada puede generar transcripciones plausibles pero incorrectas; se recomienda umbral de confianza y revision humana en produccion.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; conviene auditar el repositorio antes de desplegarlo en entornos sensibles.
- El checkpoint fairseq solo carga con el fork especifico del autor, lo que anade una dependencia de mantenimiento.
- No se han publicado datos sobre sesgos dialectales, de genero o de edad en la informacion disponible; el corpus de radiodifusion puede sobrerrepresentar ciertos registros formales.
- Licencia Apache 2.0 permite uso comercial, pero no se especifican garantias ni condiciones adicionales sobre los datos de entrenamiento (KAVI, Parlamento, Lahjoita puhetta), que podrian tener sus propias restricciones.
- No es un modelo generativo: no admite prompts, tool calling ni razonamiento; su uso esta acotado a transcripcion.
- El rendimiento en audio de muy baja calidad, llamadas telefonicas o acentos no finlandeses no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-xlarge-ebranch-48l-fi-471k-finetuned
- Modelo base (preentrenado): https://huggingface.co/GetmanY1/wav2vec2-xlarge-ebranch-48l-fi-471k
- Paper: https://arxiv.org/abs/2610.13102
- Codigo y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Fork de fairseq del autor: https://github.com/Getmany1/fairseq
- Perfil del autor en Hugging Face: https://huggingface.co/GetmanY1
- Perfil de Tamas Grosz en Hugging Face: https://huggingface.co/Grosy
