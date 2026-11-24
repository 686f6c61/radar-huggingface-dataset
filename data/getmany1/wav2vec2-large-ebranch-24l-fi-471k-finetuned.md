# GetmanY1/wav2vec2-large-ebranch-24l-fi-471k-finetuned

## Resumen

El modelo `GetmanY1/wav2vec2-large-ebranch-24l-fi-471k-finetuned` es un sistema de reconocimiento automático del habla (ASR) para finlandés desarrollado por Yaroslav Getman y colaboradores del grupo de investigación en tecnología del habla de la Universidad Aalto (equipo `aalto-speech`). Se trata de un modelo wav2vec 2.0 Large en el que el codificador transformer original se ha sustituido por un codificador E-Branchformer de 24 capas, preentrenado de forma autosupervisada sobre 471.000 horas de audio finlandés y posteriormente ajustado con CTC para transcripción.

El modelo forma parte de la familia publicada junto al artículo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL: Confidence Filtering and Architectural Analysis at Scale" (arXiv:2610.13102), que explora cómo escalar el preentrenamiento autosupervisado monolingüe a partir de 2,1 millones de horas de audio de radiodifusión en bruto, aplicando detección de actividad de voz, deduplicación basada en transcripciones y filtrado por confianza del ASR. Con 317 millones de parámetros, el modelo compite directamente con baselines Transformer y Conformer del mismo tamaño, ofreciendo mejoras moderadas pero consistentes en varios conjuntos de evaluación.

Su relevancia radica en dos factores: por un lado, demuestra que las arquitecturas híbridas de atención y convolución (E-Branchformer) son viables a escala de cientos de miles de horas en un idioma de recursos medios como el finlandés; por otro, libera pesos, código de modelado personalizado y el checkpoint original de fairseq bajo licencia Apache 2.0, lo que facilita su reproducción e integración en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 con codificador E-Branchformer (24 capas) |
| Parametros totales | 317,1 M (315.817.762 según safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz; ventana efectiva determinada por el codificador convolucional y la atención) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas estándar de transformers) |
| Idiomas soportados | finlandés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y checkpoint original fairseq (`fairseq/checkpoint.pt`) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma wav2vec 2.0: un codificador convolucional de características procesa audio mono a 16 kHz y genera representaciones latentes, sobre las que se aplica un codificador de contexto. En este caso, el codificador de contexto es un E-Branchformer de 24 capas con dimensión de modelo 768 y dimensión feed-forward 1592, que combina atención global con ramas convolucionales locales mediante un esquema de fusión tipo branchformer. El preentrenamiento autosupervisado se realizó durante 167.000 actualizaciones con learning rate 4e-4, procesando aproximadamente 2 minutos de audio por GPU en 512 GPUs.

Los datos de preentrenamiento provienen de 471.000 horas de audio finlandés: el archivo de radio y televisión de la Agencia Finlandesa de Arte y Cultura (KUVI, anteriormente KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandés y Lahjoita puhetta. Las 2,1 millones de horas de audio bruto pasaron por detección de actividad de voz, deduplicación basada en transcripciones y filtrado por confianza del ASR con umbral τ = −0,10. El ajuste fino se hizo con CTC sobre 4.600 horas de habla transcrita (Parlamento finlandés y Lahjoita puhetta) durante 25.000 actualizaciones en 128 GPUs, con el codificador convolucional de características congelado. El modelo requiere `trust_remote_code=True` porque incluye código de modelado personalizado que reproduce el codificador de fairseq.

## Capacidades

- Reconocimiento automático del habla (ASR) en finlandés con salida a nivel de carácter mediante CTC.
- Transcripción de audio mono a 16 kHz con normalización de entrada (`do_normalize=True`).
- Manejo de habla espontánea y de dominio público (Parlamento, radio, podcast) gracias al entrenamiento sobre corpus diversos.
- Robustez ante audio de radiodifusión real (conjunto KAVI) y habla leída (Common Voice, FLEURS).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente acústico-a-texto.
- No dispone de modo thinking, visión ni audio generativo.
- Capacidad multilingüe limitada al finlandés; no se reporta transferencia a otros idiomas.

## Casos de uso

- Transcripción de archivos de radiodifusión finlandeses: el modelo está entrenado sobre el archivo KUVI/KAVI y obtiene 20,01 % de WER en ese dominio, por lo que es adecuado para digitalizar y buscar contenido audiovisual histórico.
- Subtitulado automático de vídeo y audio en finlandés: con 317 M de parámetros y CTC, puede desplegarse en pipelines de streaming con latencia moderada para generar subtítulos en directo o bajo demanda.
- Análisis de sesiones parlamentarias: el ajuste fino incluye el corpus del Parlamento finlandés (FP'16 y FP'20), con WER de 8,22 % y 6,84 % respectivamente, útil para actas automáticas y búsqueda de intervenciones.
- Investigación en lingüística computacional finlandesa: permite alinear audio y transcripción a escala para estudios fonéticos, análisis de discurso o construcción de corpus anotados.
- Evaluación comparativa de arquitecturas ASR: sirve como baseline E-Branchformer frente a Transformer y Conformer del mismo tamaño en experimentos académicos.
- Transcripción de encuestas y entrevistas (Lahjoita puhetta): con 16,30 % de WER en ese dominio, es viable para procesar grandes volúmenes de habla espontánea en proyectos de ciencias sociales.
- Integración en asistentes de voz locales para finlandés: al ser Apache 2.0 y tener 317 M de parámetros, puede ejecutarse en servidores modestos o GPUs de consumo para dictado y comandos de voz.

## Benchmarks y rendimiento

Resultados de WER (%) en la tabla III del artículo, para modelos Large con recuento de parámetros equiparable. LP = Lahjoita puhetta, FP = Parlamento finlandés, CV = Common Voice 16.1, KAVI = habla de radiodifusión real.

| Modelo | Params | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer 24 capas (baseline previo, 158K h) | 317,4 M | 16,86 | 8,29 | 6,94 | 5,86 | 10,69 | 23,60 |
| Transformer 24 capas | 317,4 M | 16,78 | 8,41 | 6,77 | 6,20 | 10,42 | 21,02 |
| Conformer 24 capas | 317,2 M | 16,46 | 8,58 | **6,71** | 4,52 | 9,69 | **19,86** |
| Conformer 36 capas | 317,1 M | 16,36 | 8,16 | 6,81 | **4,28** | 9,43 | 21,02 |
| **E-Branchformer 24 capas (este modelo)** | 317,1 M | 16,30 | 8,22 | 6,84 | 4,33 | 9,59 | 20,01 |
| E-Branchformer 36 capas | 317,4 M | **16,11** | **8,15** | 6,88 | 5,24 | **9,30** | 20,09 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB solo para pesos (317 M × 4 bytes), más activaciones y memoria del codificador convolucional; en la práctica, entre 2 y 3 GB para lotes pequeños.
- En fp16/bf16: alrededor de 0,7 GB de pesos, con un consumo total típico de 1,5 a 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, T4) para inferencia en tiempo real; A100 o H100 para procesamiento por lotes a gran escala.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares, así como en CPU para transcripción offline (con mayor latencia).
- Opciones de despliegue: transformers con `AutoModelForCTC` y `trust_remote_code=True`; exportación a ONNX o TorchScript para producción; fairseq mediante el fork del autor para cargar el checkpoint original.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto/entrada | WER medio (LP/FP/CV/FLEURS/KAVI) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E-Branchformer 24 capas (este modelo) | 317,1 M | audio 16 kHz | 16,30 / 8,22 / 6,84 / 4,33 / 9,59 / 20,01 | Apache 2.0 | Hugging Face + fairseq |
| Conformer 24 capas (mismo paper) | 317,2 M | audio 16 kHz | 16,46 / 8,58 / 6,71 / 4,52 / 9,69 / 19,86 | Apache 2.0 (según paper) | Hugging Face (familia del paper) |
| Transformer 24 capas (mismo paper) | 317,4 M | audio 16 kHz | 16,78 / 8,41 / 6,77 / 6,20 / 10,42 / 21,02 | Apache 2.0 (según paper) | Hugging Face (familia del paper) |
| wav2vec 2.0 Large original (fairseq) | ~317 M | audio 16 kHz | no disponible para finlandés en esta información | MIT (modelo original) | fairseq / Hugging Face |

## Limitaciones y advertencias

- El modelo solo reconoce finlandés; no se ha evaluado su comportamiento en otros idiomas y probablemente produzca transcripciones erróneas o alucinadas fuera de ese dominio.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; conviene auditar el código antes de usarlo en producción.
- Al ser un modelo CTC, no genera puntuación ni mayúsculas de forma fiable; la salida es a nivel de carácter y requiere post-procesado para texto legible.
- Riesgo de alucinación en audio con ruido, música o habla solapada; el WER en dominios no vistos (p. ej. llamadas telefónicas de banda estrecha) puede degradarse considerablemente.
- Sesgos derivados del corpus de entrenamiento: sobrerrepresentación de habla de radiodifusión, parlamentaria y de lectura; posible peor rendimiento en acentos regionales, habla infantil o dialectos poco representados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de preentrenamiento pueden tener condiciones adicionales; conviene revisar la procedencia de KUVI/KAVI y Lahjoita puhetta.
- No se han publicado métricas de latencia, throughput ni consumo energético, por lo que la planificación de producción requiere mediciones propias.
- El checkpoint fairseq requiere un fork específico del autor, lo que añade fricción para equipos que no usen transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-large-ebranch-24l-fi-471k-finetuned
- Modelo base (preentrenamiento): https://huggingface.co/GetmanY1/wav2vec2-large-ebranch-24l-fi-471k
- Artículo: https://arxiv.org/abs/2610.13102
- Repositorio de código y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Fork de fairseq del autor: https://github.com/Getmany1/fairseq
- Perfil de Yaroslav Getman: https://huggingface.co/GetmanY1
- LinkedIn de Yaroslav Getman: https://www.linkedin.com/in/yaroslav-getman/
- Perfil de Tamás Grósz: https://huggingface.co/Grosy
- LinkedIn de Tamás Grósz: https://www.linkedin.com/in/tam%C3%A1s-gr%C3%B3sz-950a049a/
