# GetmanY1/wav2vec2-base-conformer-17l-fi-471k-finetuned

## Resumen

`GetmanY1/wav2vec2-base-conformer-17l-fi-471k-finetuned` es un modelo de reconocimiento automatico del habla (ASR) para finlandes, desarrollado por Yaroslav Getman en el grupo de investigacion de Aalto University (colaboran Tommi Lehtonen, Tamas Grosz y Mikko Kurimo). Es el resultado de afinar para CTC un encoder wav2vec 2.0 de tipo Conformer preentrenado de forma autosupervisada sobre 471.000 horas de audio en finlandes. El modelo forma parte de la familia publicada junto al paper *From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL* (arXiv:2610.13102).

La arquitectura combina el marco wav2vec 2.0 con un encoder Conformer de 17 capas (dimension de modelo 512, feed-forward 1536), que sustituye al transformer estandar y aporta convoluciones locales junto a la atencion global. Con 96,2 millones de parametros, se situa en la categoria "base" y compite directamente con variantes Transformer y E-Branchformer del mismo orden de magnitud. La innovacion principal del trabajo es el pipeline de filtrado de 2,1 millones de horas de audio broadcast en bruto (VAD, deduplicacion por transcripcion y filtrado por confianza ASR con τ = −0,10), que permite entrenar SSL a gran escala en un solo idioma.

Su relevancia practica radica en que mejora los WER de la linea base Transformer en todos los conjuntos de evaluacion del paper, con especial ventaja en Common Voice 16.1 (5,69 % frente a 10,61 % del baseline anterior) y Lahjoita puhetta (18,50 %). Es un modelo ligero, con licencia Apache 2.0 y pesos safetensors, adecuado para despliegue en produccion sobre hardware modesto, aunque requiere `trust_remote_code=True` por usar codigo de modelado personalizado que reproduce el encoder de fairseq.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 con encoder Conformer (17 capas, d_model=512, FFN=1536) |
| Parametros totales | 96.223.394 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada; sin limite explicito documentado) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; cuantizacion a int8/fp16 no documentada por el autor) |
| Idiomas soportados | finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (mas checkpoint original fairseq en `fairseq/checkpoint.pt`) |

## Arquitectura y entrenamiento

El modelo parte de wav2vec 2.0, un marco de aprendizaje autosupervisado que enmascara representaciones latentes del audio y las predice con un modulo de cuantizacion, pero reemplaza el encoder Transformer por un Conformer de 17 capas. El Conformer intercala bloques de atencion multi-cabeza con convoluciones depthwise, lo que captura dependencias locales y globales del habla y, segun los resultados del paper, supera a los Transformers puros con el mismo presupuesto de parametros. El preentrenamiento se realizo sobre 471.000 horas de habla finlandesa procedente del archivo de radio y television del Finnish Arts and Culture Agency (KUVI/KAVI), los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandes y Lahjoita puhetta. El pipeline de datos completo parte de 2,1 millones de horas de audio broadcast en bruto y aplica VAD, deduplicacion basada en transcripciones y filtrado por confianza de ASR (τ = −0,10).

El preentrenamiento consta de 125.000 actualizaciones con learning rate 6e-4, procesando unos 3 minutos de audio por GPU en 512 GPUs. Posteriormente se realiza un fine-tuning CTC sobre 4.600 horas de habla transcrita (Parlamento finlandes y Lahjoita puhetta) durante 16.000 actualizaciones, con unos 2,5 minutos de audio por GPU en 128 GPUs y el encoder CNN de caracteristicas congelado. La entrada es audio mono a 16 kHz con `do_normalize=False`. No se documenta uso de RLHF ni DPO, algo esperable en un modelo ASR.

## Capacidades

- Reconocimiento automatico del habla en finlandes a partir de audio mono a 16 kHz.
- Decodificacion CTC (caracteres) mediante `AutoModelForCTC`; el vocabulario es de caracteres, definido en `fairseq/dict.ltr.txt`.
- Transcripcion de audio broadcast y de dominio parlamentario, con buen rendimiento en habla espontanea y leida.
- Robusto a condiciones de audio real (el conjunto KAVI de habla broadcast real alcanza 22,71 % WER).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente acustico.
- No es multilingue: solo finlandes.
- No dispone de vision, audio generativo ni modo "thinking".

## Casos de uso

- Transcripcion de archivos audiovisuales: el modelo puede procesar audio broadcast de television y radio finlandesa, un dominio para el que fue entrenado explicitamente (KAVI, 22,71 % WER), lo que lo hace adecuado para digitalizar y buscar en archivos historicos.
- Subtitulado automatico de contenido en finlandes: con 96 M de parametros y WER de 10,56 % en FLEURS, es viable para generar subtitulos en tiempo casi real en servidores modestos.
- Actas parlamentarias y transcripcion institucional: el fine-tuning incluye el corpus del Parlamento finlandes (FP'16 9,83 %, FP'20 7,94 %), por lo que es una opcion solida para transcripcion de sesiones y debates.
- Investigacion en ASR de bajos recursos: sirve como linea base reproducible para comparar arquitecturas (Transformer, Conformer, E-Branchformer) con el mismo numero de parametros, gracias al codigo y configuraciones publicados en GitHub.
- Preentrenamiento y fine-tuning sobre dominios especificos: al ser un modelo "base" de 96 M, se puede afinar con CTC sobre un corpus propio en finlandes con recursos computacionales limitados (el fine-tuning del autor uso 128 GPUs, pero a esta escala es viable en menos).
- Procesamiento por lotes en pipelines de datos: su tamano reducido permite ejecutar transcripcion masiva de horas de audio en CPU/GPU consumer, por ejemplo para enriquecer datasets o indexar contenido multimedia.
- Evaluacion y benchmarking de SSL en finlandes: util para replicar los resultados del paper y medir el impacto del filtrado por confianza ASR en modelos de este tamano.

## Benchmarks y rendimiento

Resultados de WER (%) en test de los modelos Base afinados (Tabla III del paper). LP = Lahjoita puhetta, FP = Finnish Parliament, CV = Common Voice 16.1, KAVI = habla broadcast real.

| Modelo | Parametros | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer, 12 capas (baseline previo, 158K h) | 95,0M | 22,27 | 10,92 | 8,42 | 10,61 | 13,27 | 27,45 |
| Transformer, 12 capas | 95,0M | 22,28 | 10,72 | 8,70 | 9,74 | 13,02 | 24,85 |
| Transformer, 18 capas | 95,1M | 21,33 | 10,64 | 8,66 | 8,99 | 12,71 | 23,91 |
| Conformer, 12 capas | 96,7M | 18,89 | 10,08 | 8,07 | 6,46 | 11,20 | 23,71 |
| **Conformer, 17 capas (este modelo)** | 96,5M | **18,50** | 9,83 | 7,94 | **5,69** | **10,56** | 22,71 |
| E-Branchformer, 12 capas | 98,4M | 19,14 | 10,10 | **7,80** | 6,91 | 11,53 | 22,89 |
| E-Branchformer, 17 capas | 96,6M | 18,80 | **9,54** | 7,85 | 6,19 | 11,09 | **22,44** |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 96,2 M de parametros; en fp32 ocupa aproximadamente 0,4 GB y en fp16 alrededor de 0,2 GB, mas memoria para activaciones (dependiente de la longitud del audio).
- GPU recomendadas: cualquier GPU moderna es suficiente; para lotes grandes o audio largo se recomienda A100, H100 o L40S; para inferencia ligera, RTX 4090, RTX 3090 o incluso RTX 3060.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de VRAM; tambien es viable en CPU para transcripcion por lotes.
- Opciones de despliegue: `transformers` con `AutoModelForCTC` y `trust_remote_code=True`; fairseq con el fork del autor para el checkpoint original. No se documenta soporte especifico de vLLM, TGI, llama.cpp ni Ollama (herramientas orientadas a LLM, no a CTC de ASR).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | WER CV 16.1 | WER FLEURS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Conformer 17 capas (este modelo) | 96,2M | audio 16 kHz | 5,69 | 10,56 | Apache 2.0 | Hugging Face + fairseq |
| Conformer 12 capas | 96,7M | audio 16 kHz | 6,46 | 11,20 | Apache 2.0 (mismo paper) | Hugging Face |
| E-Branchformer 17 capas | 96,6M | audio 16 kHz | 6,19 | 11,09 | Apache 2.0 (mismo paper) | Hugging Face |
| Transformer 18 capas | 95,1M | audio 16 kHz | 8,99 | 12,71 | Apache 2.0 (mismo paper) | Hugging Face |

## Limitaciones y advertencias

- Solo soporta finlandes; no es multilingue y su uso en otros idiomas dara resultados pobres.
- Es un modelo ASR puro: no genera texto libre, no razona y no soporta herramientas ni agentes.
- Requiere `trust_remote_code=True` por el codigo de modelado personalizado que reproduce el encoder de fairseq; conviene auditar ese codigo antes de desplegarlo en produccion.
- El WER en habla broadcast real (KAVI, 22,71 %) sigue siendo alto en terminos absolutos; en dominios ruidosos o con acentos no representados puede degradarse.
- Riesgo de alucinacion en el sentido de transcripciones incorrectas o inserciones en audio con ruido o silencios; conviene aplicar umbrales de confianza y post-procesado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y el autor no documenta sesgos demograficos especificos.
- La cuantizacion no esta documentada por el autor; cualquier conversion a int8 debe validarse empiricamente.
- El checkpoint original fairseq requiere el fork del autor y una configuracion especifica (ruta `data` con `dict.ltr.txt`).

## Enlaces

- Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-base-conformer-17l-fi-471k-finetuned
- Modelo base: https://huggingface.co/GetmanY1/wav2vec2-base-conformer-17l-fi-471k
- Paper: https://arxiv.org/abs/2610.13102
- Codigo y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Fork de fairseq: https://github.com/Getmany1/fairseq
- Perfil del autor: https://huggingface.co/GetmanY1
- LinkedIn del autor: https://www.linkedin.com/in/yaroslav-getman/
- Perfil de Tamas Grosz: https://huggingface.co/Grosy
