# GetmanY1/wav2vec2-base-ebranch-17l-fi-471k

## Resumen

wav2vec2-base-ebranch-17l-fi-471k es un modelo de representacion del habla (feature extraction) auto-supervisado para fines, desarrollado por Yaroslav Getman y colaboradores del grupo de investigacion en voz de la Universidad Aalto (equipo de Mikko Kurimo). Se trata de un modelo wav2vec 2.0 Base en el que el encoder transformer original se ha sustituido por un encoder E-Branchformer de 17 capas, preentrenado sobre 471.000 horas de audio en fines. Forma parte de la familia de modelos publicada junto al articulo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL".

El modelo no es un sistema ASR listo para usar: es un extractor de caracteristicas acusticas que debe afinarse sobre habla transcrita para tareas de reconocimiento. Su relevancia reside en que demuestra que, a igualdad de parametros (~96M), una arquitectura E-Branchformer supera a los baselines transformer y Conformer en el corpus de habla broadcast real KAVI (22,44 % WER frente a 23,71 % del Conformer de 12 capas y 24,85 % del transformer de 12 capas), y se acerca al mejor resultado global a esa escala.

El modelo se distribuye con licencia Apache 2.0, requiere `trust_remote_code=True` por usar codigo de modelado personalizado que reproduce el encoder de fairseq, y esta pensado para investigadores que trabajen en ASR finlandes o en representaciones auto-supervisadas del habla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 con encoder E-Branchformer (17 capas) |
| Parametros totales | 96.243.760 (~96,6M segun model card; 97M declarados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz mono; ventana dependiente del extractor de caracteristicas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | fines (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,8 GB); incluye `fairseq/checkpoint.pt` original |
| Dimension del modelo | 512 |
| Dimension feed-forward | 1024 |
| Entrada | audio mono a 16 kHz, `do_normalize=False` |
| Libreria | transformers (con `trust_remote_code=True`) |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El modelo sigue el paradigma wav2vec 2.0: un extractor convolucional de caracteristicas seguido de un encoder contextual que se entrena de forma auto-supervisada mediante enmascaramiento y contraste. La innovacion respecto al wav2vec 2.0 Base original es la sustitucion del encoder transformer por un E-Branchformer de 17 capas, con dimension de modelo 512 y dimension feed-forward 1024. El E-Branchformer combina ramas de atencion global y convolucional en paralelo, lo que mejora la captura de dependencias locales y globales en la senal de audio.

El preentrenamiento utilizo 471.000 horas de habla finlandesa procedente del Archivo de Radio y Television de la Agencia Finlandesa de Arte y Cultura, KUVI (antes Instituto Nacional Audiovisual, KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandes y Lahjoita puhetta. Las 2,1 millones de horas de audio broadcast en bruto pasaron por deteccion de actividad de voz, deduplicacion basada en transcripciones y filtrado por confianza de ASR (umbral tau = -0,10). El entrenamiento consistio en 125.000 actualizaciones con tasa de aprendizaje 6e-4, procesando aproximadamente 3 minutos de audio por GPU en 512 GPUs.

El codigo y las configuraciones estan disponibles en el repositorio `aalto-speech/large-scale-monolingual-speech-foundation-models`. El checkpoint original de fairseq se puede cargar con el fork `Getmany1/fairseq`.

## Capacidades

- Extraccion de representaciones acusticas auto-supervisadas a partir de audio mono a 16 kHz.
- Base para fine-tuning en reconocimiento automatico del habla (ASR) en fines; existe una version ya afinada (`GetmanY1/wav2vec2-base-ebranch-17l-fi-471k-finetuned`).
- Capacidad de servir como backbone para otras tareas de habla (clasificacion, diarizacion, deteccion de palabras clave) previo fine-tuning.
- No incluye tokenizer ni cabeza CTC: no genera transcripciones directamente.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidades multilingues: solo fines.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Reconocimiento automatico del habla en fines: partir de este checkpoint y anadir una cabeza CTC o un decodificador para transcribir audio broadcast, aprovechando el preentrenamiento masivo sobre 471K horas.
- Investigacion en representaciones auto-supervisadas: comparar el E-Branchformer frente a transformer y Conformer a igualdad de parametros en tareas de habla.
- Adaptacion a dominios especificos: fine-tuning sobre corpus pequenos de dominios concretos (medico, legal, atencion al cliente) partiendo de representaciones ya entrenadas con habla broadcast real.
- Sistemas de subtitulado para medios finlandeses: usar el modelo afinado como base para transcripcion de archivos audiovisuales de la radiotelevision publica.
- Deteccion de palabras clave y wake-words en fines: extraer embeddings acusticos y entrenar un clasificador ligero encima.
- Analisis de calidad del habla y diarizacion: emplear las representaciones como features para segmentar hablantes o detectar condiciones acusticas.
- Pipeline de investigacion en ASR de bajos recursos: servir de punto de partida cuando se dispone de pocas horas transcritas, gracias al preentrenamiento auto-supervisado.

## Benchmarks y rendimiento

Resultados de WER (%) de los modelos Base afinados, tabla III del articulo, con recuento de parametros equiparable. LP = Lahjoita puhetta, FP = Parlamento finlandes, CV = Common Voice 16.1, KAVI = habla broadcast real.

| Modelo | Parametros | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer, 12 capas (baseline previo, 158K h) | 95,0M | 22,27 | 10,92 | 8,42 | 10,61 | 13,27 | 27,45 |
| Transformer, 12 capas | 95,0M | 22,28 | 10,72 | 8,70 | 9,74 | 13,02 | 24,85 |
| Transformer, 18 capas | 95,1M | 21,33 | 10,64 | 8,66 | 8,99 | 12,71 | 23,91 |
| Conformer, 12 capas | 96,7M | 18,89 | 10,08 | 8,07 | 6,46 | 11,20 | 23,71 |
| Conformer, 17 capas | 96,5M | **18,50** | 9,83 | 7,94 | **5,69** | **10,56** | 22,71 |
| E-Branchformer, 12 capas | 98,4M | 19,14 | 10,10 | **7,80** | 6,91 | 11,53 | 22,89 |
| **E-Branchformer, 17 capas (este modelo)** | 96,6M | 18,80 | **9,54** | 7,85 | 6,19 | 11,09 | **22,44** |

El modelo obtiene el mejor resultado en KAVI (22,44 % WER) y en FP'16 (9,54 %), y queda cerca del mejor en LP (18,80 frente a 18,50 del Conformer de 17 capas) y en FLEURS (11,09 frente a 10,56). En CV es donde presenta mayor desventaja relativa (6,19 frente a 5,69).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~96M parametros. En fp32 ocupa aproximadamente 0,4 GB de pesos; en fp16/bf16 unos 0,2 GB. Con activaciones y overhead de inferencia, cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna es suficiente; para procesamiento por lotes a gran escala se recomiendan A100, H100 o L40S. Para uso individual, RTX 3060/4060 o superiores son mas que suficientes.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas, e incluso en CPU para audio de duracion moderada.
- Opciones de despliegue: transformers con `trust_remote_code=True` (via `AutoModel`); el checkpoint original en fairseq se carga con el fork `Getmany1/fairseq`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada. El coste dominante es el extractor convolucional y las 17 capas del E-Branchformer; con lotes pequenos en GPU consumer la latencia por segundo de audio deberia ser baja, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto / entrada | WER KAVI | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| E-Branchformer 17 capas (este modelo) | ~96,6M | wav2vec 2.0 + E-Branchformer | audio 16 kHz | 22,44 | Apache 2.0 | Hugging Face |
| Conformer 17 capas | ~96,5M | wav2vec 2.0 + Conformer | audio 16 kHz | 22,71 | no disponible | en el articulo |
| Transformer 18 capas | ~95,1M | wav2vec 2.0 + transformer | audio 16 kHz | 23,91 | no disponible | en el articulo |
| Transformer 12 capas (baseline previo, 158K h) | ~95,0M | wav2vec 2.0 + transformer | audio 16 kHz | 27,45 | no disponible | en el articulo |

La comparativa se limita a los baselines del propio articulo, ya que no se dispone de otros modelos finlandeses de habla auto-supervisados con parametros equiparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo fines: no soporta otros idiomas sin fine-tuning adicional.
- No es un modelo ASR: no incluye tokenizer ni cabeza CTC, por lo que no transcribe audio directamente. Requiere fine-tuning sobre habla transcrita.
- Requiere `trust_remote_code=True` por el codigo de modelado personalizado; conviene auditar dicho codigo antes de desplegarlo en produccion.
- Riesgo de sesgo hacia el dominio broadcast: el preentrenamiento se basa mayoritariamente en radio y television finlandesas, lo que puede degradar el rendimiento en dominios acusticos muy distintos (telefonia, habla con ruido industrial, acentos no representados).
- El filtrado por confianza de ASR (tau = -0,10) durante el preentrenamiento puede haber descartado segmentos dificiles, lo que podria afectar a la robustez en condiciones adversas.
- El WER en Common Voice 16.1 (6,19 %) es peor que el del Conformer de 17 capas (5,69 %), lo que sugiere cierta desventaja en habla leida de dominio general.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no esta listo para produccion sin fine-tuning y evaluacion previa.
- No se documentan cuantizaciones oficiales ni soporte en runtimes ligeros (llama.cpp, Ollama), lo que limita el despliegue en entornos sin transformers.
- Sin datos publicados sobre latencia, throughput o consumo energetico en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-base-ebranch-17l-fi-471k
- Version afinada para ASR finlandes: https://huggingface.co/GetmanY1/wav2vec2-base-ebranch-17l-fi-471k-finetuned
- Articulo: https://arxiv.org/abs/2610.13102
- Codigo y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Fork de fairseq para el checkpoint original: https://github.com/Getmany1/fairseq
- Perfil del autor en Hugging Face: https://huggingface.co/GetmanY1
- Perfil de Tamas Grosz en Hugging Face: https://huggingface.co/Grosy
