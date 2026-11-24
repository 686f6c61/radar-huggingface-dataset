# GetmanY1/wav2vec2-large-ebranch-24l-fi-471k

## Resumen

wav2vec2-large-ebranch-24l-fi-471k es un modelo de representacion auto-supervisada del habla (speech SSL) para fines, desarrollado por Yaroslav Getman y el equipo de Aalto Speech (Universidad de Aalto) en colaboracion con investigadores del proyecto. Sustituye el encoder Transformer estandar de wav2vec 2.0 Large por un encoder E-Branchformer de 24 capas, manteniendo un recuento de parametros comparable (317,1 M) para permitir una comparacion arquitectonica limpia a igual escala.

El modelo se preentrena sobre 471K horas de habla en fines extraidas de un corpus de 2,1M horas de audio de radiodifusion en bruto (archivo de radio y television de KUVI/KAVI, VoxPopuli fi, corpus del Parlamento finlandes y Lahjoita puhetta), tras un pipeline de deteccion de actividad vocal, deduplicacion basada en transcripciones y filtrado por confianza de ASR (tau = -0,10). Es relevante porque forma parte del mayor esfuerzo publicado de SSL monolingue en fines y porque aisla el efecto de la arquitectura (Transformer vs. Conformer vs. E-Branchformer) con presupuestos de parametros igualados.

No es un modelo de ASR listo para usar: no incluye tokenizer ni cabeza CTC y su pipeline es `feature-extraction`. Para transcripcion hay que fine-tunearlo o recurrir a la version ya ajustada (`GetmanY1/wav2vec2-large-ebranch-24l-fi-471k-finetuned`). Requiere `trust_remote_code=True` porque el codigo de modelado reproduce el encoder de fairseq.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 Large con encoder E-Branchformer (24 capas) |
| Parametros totales | 315.791.616 (317,1 M segun model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz mono; ventana no especificada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | fines (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (mas checkpoint original en fairseq, `fairseq/checkpoint.pt`) |

## Arquitectura y entrenamiento

El encoder es un E-Branchformer de 24 capas con dimension de modelo 768 y dimension feed-forward 1592, que sustituye al bloque Transformer del wav2vec 2.0 Large original. El E-Branchformer combina ramas de atencion global y de convolucion/atención local en paralelo, lo que en tareas de habla suele mejorar la captura de dependencias locales sin renunciar al contexto global. El preentrenamiento sigue el esquema auto-supervisado de wav2vec 2.0 (enmascarado de representaciones latentes con cuantizacion), realizado durante 167K actualizaciones con learning rate 4e-4 y aproximadamente 2 minutos de audio por GPU en 512 GPUs.

Los datos de preentrenamiento son 471K horas de habla en fines obtenidas tras filtrar 2,1M horas de audio de radiodifusion: VAD, deduplicacion basada en transcripciones y filtrado por confianza de ASR con umbral tau = -0,10. Las fuentes son el archivo de radio y television de KUVI (antes KAVI), los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandes y Lahjoita puhetta. No se documenta en la informacion disponible el uso de RLHF/DPO (no aplica a un modelo SSL de habla) ni detalles adicionales sobre la composicion exacta por fuente.

## Capacidades

- Extraccion de representaciones auto-supervisadas del habla en fines a partir de audio mono a 16 kHz.
- Base para fine-tuning supervisado en ASR (requiere anadir cabeza CTC o modulo de decodificacion).
- Base para otras tareas de habla: clasificacion de emociones, deteccion de idioma, diarizacion o keyword spotting (previa adaptacion).
- Normalizacion de entrada integrada (`do_normalize=True` en el feature extractor).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de representacion, no un LLM.
- No soporta vision ni audio generativo; solo procesa audio de entrada.
- Capacidad multilingue: no, entrenado exclusivamente en fines.

## Casos de uso

- Fine-tuning para ASR en fines: el modelo sirve como inicializacion para entrenar un sistema de transcripcion sobre corpus etiquetados (Lahjoita puhetta, Parlamento, Common Voice), aprovechando las 471K horas de preentrenamiento para reducir datos supervisados necesarios.
- Investigacion arquitectonica en speech SSL: permite comparar E-Branchformer frente a Transformer y Conformer con el mismo presupuesto de parametros (317 M) y los mismos datos, util para papers y ablaciones.
- Extraccion de embeddings para clasificacion de audio: usar las representaciones de capas intermedias como features para detectar emociones, genero, edad o calidad de audio en llamadas y broadcast finlandes.
- Sistemas de subtitulado para medios publicos: base para un pipeline de transcripcion de archivos de radio y television finlandeses, donde el modelo ya ha visto dominio de broadcast (KAVI) durante el preentrenamiento.
- Investigacion en diarizacion y segmentacion: las representaciones frame-level pueden alimentar modelos de segmentacion de hablante o VAD supervisado en fines.
- Prototipado de busqueda por voz en fines: extraer embeddings de consultas y de un indice de audio para recuperacion semantica aproximada por similitud.
- Desarrollo de modelos SSL monolingues para otras lenguas de baja recursos: el codigo y los configs publicos (aalto-speech/large-scale-monolingual-speech-foundation-models) sirven de plantilla para replicar el pipeline en otros idiomas.

## Benchmarks y rendimiento

Resultados de WER (%) del modelo fine-tuneado para ASR (Tabla III del paper), con recuento de parametros igualado. LP = Lahjoita puhetta, FP = Parlamento finlandes, CV = Common Voice 16.1, KAVI = habla de broadcast real.

| Modelo | Parametros | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer, 24 capas (baseline previo, 158K horas) | 317,4 M | 16,86 | 8,29 | 6,94 | 5,86 | 10,69 | 23,60 |
| Transformer, 24 capas | 317,4 M | 16,78 | 8,41 | 6,77 | 6,20 | 10,42 | 21,02 |
| Conformer, 24 capas | 317,2 M | 16,46 | 8,58 | 6,71 | 4,52 | 9,69 | 19,86 |
| Conformer, 36 capas | 317,1 M | 16,36 | 8,16 | 6,81 | 4,28 | 9,43 | 21,02 |
| E-Branchformer, 24 capas (este modelo) | 317,1 M | 16,30 | 8,22 | 6,84 | 4,33 | 9,59 | 20,01 |
| E-Branchformer, 36 capas | 317,4 M | 16,11 | 8,15 | 6,88 | 5,24 | 9,30 | 20,09 |

El E-Branchformer de 24 capas obtiene el mejor WER en Lahjoita puhetta (16,30) y resultados competitivos en el resto, aunque el Conformer de 24 capas le supera en FP'20 (6,71) y KAVI (19,86). No se publican benchmarks de las representaciones sin fine-tuning (p. ej. SUPERB) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB para los 317 M de parametros, mas activaciones (dependientes de la longitud del audio de entrada).
- VRAM estimada en fp16/bf16: aproximadamente 0,7 GB de pesos, mas activaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para audio corto; A100/H100 para procesar lotes grandes o audios largos.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 y similares, incluso con margen para lotes.
- Despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el codigo custom del encoder); tambien es posible cargar el checkpoint original con fairseq usando el fork de Getmany1. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama (no aplican a un modelo de habla de este tipo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GetmanY1/wav2vec2-large-ebranch-24l-fi-471k (este) | 317,1 M | audio 16 kHz mono, ventana no especificada | fi | Apache 2.0 | Hugging Face + checkpoint fairseq |
| Transformer, 24 capas (mismo paper, 158K h) | 317,4 M | audio 16 kHz mono | fi | Apache 2.0 (segun paper) | Hugging Face |
| Conformer, 24 capas (mismo paper) | 317,2 M | audio 16 kHz mono | fi | Apache 2.0 (segun paper) | Hugging Face |
| wav2vec 2.0 Large original (Facebook/Meta) | ~317 M | audio 16 kHz mono | multilingue (preentrenado en 53 idiomas) | MIT (segun model card original) | Hugging Face |

La comparacion con wav2vec 2.0 Large original es la mas directa en tamano y esquema de preentrenamiento, pero este modelo esta especializado en fines y usa un encoder distinto. No se dispone de datos de benchmarks comparativos con wav2vec 2.0 Large original en fines en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de ASR listo para produccion: no incluye tokenizer ni cabeza CTC; hay que fine-tunearlo o usar la version ajustada.
- Requiere `trust_remote_code=True` para cargar el codigo custom; esto implica ejecutar codigo del autor del modelo, con el riesgo de seguridad asociado en entornos no controlados.
- Entrenado exclusivamente en fines: no generaliza a otros idiomas sin fine-tuning.
- Sesgos conocidos: no documentados en la informacion disponible; al provenir de broadcast publico y corpus parlamentario, puede heredar sesgos de dominio y de hablantes presentes en esas fuentes.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero las representaciones pueden producir transcripciones erroneas si se usa una cabeza CTC mal calibrada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el codigo custom y el checkpoint fairseq deben revisarse por separado.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: sin validacion externa de la comunidad.
- No se documentan requisitos de longitud maxima de audio ni comportamiento con audios muy largos.

## Enlaces

- Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-large-ebranch-24l-fi-471k
- Version fine-tuneada para ASR: https://huggingface.co/GetmanY1/wav2vec2-large-ebranch-24l-fi-471k-finetuned
- Paper: https://arxiv.org/abs/2610.13102
- Codigo y configs: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Fork de fairseq para el checkpoint original: https://github.com/Getmany1/fairseq
- Perfil del autor: https://huggingface.co/GetmanY1
- LinkedIn del autor: https://www.linkedin.com/in/yaroslav-getman/
- LinkedIn de Tamas Grosz: https://www.linkedin.com/in/tam%C3%A1s-gr%C3%B3sz-950a049a/
