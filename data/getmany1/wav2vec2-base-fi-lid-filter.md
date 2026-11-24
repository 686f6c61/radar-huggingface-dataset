# GetmanY1/wav2vec2-base-fi-lid-filter

## Resumen

wav2vec2-base-fi-lid-filter es un modelo de representacion de voz (speech SSL) basado en wav2vec 2.0 Base, preentrenado de forma auto-supervisada sobre audio de television y radio en finlandes. Lo desarrolla un equipo del grupo de investigacion en speech de la Universidad de Aalto (Yaroslav Getman, Tommi Lehtonen, Tamas Grosz y Mikko Kurimo), en el marco del trabajo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL". No es un modelo de reconocimiento automatico del habla (ASR) listo para usar: es un extractor de representaciones acusticas que debe afinarse con datos transcritos.

Su interes tecnico es que forma parte de un ablation study sobre estrategias de filtrado de datos a gran escala. Este checkpoint concreto aplica filtrado por identificacion de idioma (LID): se conservan solo los segmentos en los que tanto un modelo LID de audio (ECAPA-TDNN, VoxLingua107) como fastText sobre la transcripcion ASR identifican finlandes. Tras ese filtro quedan 643.000 horas (el 72% de las 890.000 horas deduplicadas), lo que lo convierte en un punto de comparacion para medir el impacto del filtrado LID frente a otras estrategias.

Con 95 millones de parametros y arquitectura transformer de 12 capas (768/3072), cabe en cualquier GPU de consumo para extraccion de caracteristicas, y su licencia Apache 2.0 permite uso comercial. El autor recomienda explicitamente usar los modelos principales del paper para aplicaciones reales y reservar este checkpoint para comparaciones del ablation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 Base (transformer, 12 capas, dimension 768, FFN 3072) |
| Parametros totales | 95.044.608 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; entrada a 16 kHz mono) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y `fairseq/checkpoint.pt` (fairseq original) |

## Arquitectura y entrenamiento

wav2vec 2.0 Base es un modelo auto-supervisado que combina un encoder convolucional de audio con un transformer de 12 capas (768 de dimension, 3072 en la FFN). Se entrena con objetivos contrastivos sobre representaciones enmascaradas, sin necesidad de transcripciones. En este caso, el preentrenamiento se realizo durante 125.000 updates con learning rate 6e-4, procesando aproximadamente 3 minutos de audio por GPU en un cluster de 512 GPUs. La entrada es audio mono a 16 kHz con `do_normalize=False`.

Los datos proceden del archivo de television y radio de la agencia finlandesa de artes y cultura KUVI (antes KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandes y Lahjoita puhetta. Todo el material paso por deteccion de actividad de voz y deduplicacion basada en transcripcion, y despues por el filtro LID descrito: se retuvieron 643.000 horas de las 890.000 deduplicadas. No se menciona RLHF ni DPO, algo esperable en un modelo puramente SSL. El codigo y las configuraciones estan en el repositorio aalto-speech/large-scale-monolingual-speech-foundation-models.

## Capacidades

- Extraccion de representaciones acusticas auto-supervisadas a partir de audio a 16 kHz en finlandes.
- Base para fine-tuning en tareas downstream de voz: ASR, clasificacion de emociones, deteccion de idioma, diarizacion o keyword spotting.
- No incluye tokenizer ni cabeza CTC, por lo que no transcribe audio de forma directa.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- Capacidad multilingue limitada al finlandes por diseno del preentrenamiento.
- Disponible como checkpoint fairseq original ademas de los pesos en formato transformers.

## Casos de uso

- Fine-tuning para ASR en finlandes: se anade una cabeza CTC o un decoder y se afina sobre corpus transcritos (por ejemplo, Common Voice fi o Finnish Parliament), aprovechando las representaciones preentrenadas sobre 643.000 horas de audio de dominio amplio.
- Clasificacion de emociones o estado del hablante: se congela el encoder y se entrena una cabeza de clasificacion sobre embeddings de audio, util en analisis de llamadas o investigacion en interaccion.
- Deteccion de actividad de voz y segmentacion: los embeddings permiten discriminar segmentos con habla frente a silencio o ruido en pipelines de preprocesado de audio.
- Investigacion en filtrado de datos: sirve como punto de control del ablation para medir el efecto del filtrado LID frente a otras estrategias de limpieza, replicando la Figura 1 del paper.
- Extraccion de caracteristicas para sistemas de recuperacion de audio o busqueda por similitud en archivos de radio y television en finlandes.
- Baseline para experimentos academicos de speech SSL en lenguas de bajos recursos, comparando arquitecturas y volumenes de datos con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper (arXiv:2610.13102) para las comparaciones del ablation, pero no incluye cifras de WER ni de otras tareas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 95 millones de parametros ocupan aproximadamente 0,4 GB; con overhead de activaciones, cabe holgadamente en 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna sirve; para extraccion por lotes a gran escala se recomiendan A100 o H100, aunque una RTX 4090 o incluso una RTX 3060 son suficientes para uso individual.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 4 GB o mas, e incluso en CPU para inferencia de audio corto.
- Opciones de despliegue: transformers (Wav2Vec2Model), fairseq para el checkpoint original; tambien es compatible con endpoints de Hugging Face. No se documenta soporte especifico en vLLM, llama.cpp u Ollama, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| GetmanY1/wav2vec2-base-fi-lid-filter | 95M | no aplica | fi | Apache 2.0 | Ablation con filtrado LID, 643K h |
| Modelos principales del paper (coleccion GetmanY1/wav2vec2-fi-471k) | no disponible | no aplica | fi | no disponible | Recomendados por el autor para uso general |
| facebook/wav2vec2-base | 95M | no aplica | multilingue (entrenado en ingles principalmente) | Apache 2.0 | Referencia estandar de wav2vec 2.0 Base |
| facebook/wav2vec2-base-960h | 95M | no aplica | en | Apache 2.0 | Version afinada para ASR en ingles |

## Limitaciones y advertencias

- No es un modelo de ASR: carece de tokenizer y de cabeza CTC, por lo que no genera transcripciones sin fine-tuning previo.
- Entrenado exclusivamente con audio en finlandes; su rendimiento en otras lenguas no esta caracterizado.
- Al ser un checkpoint de ablation, el autor recomienda usar los modelos principales del paper para aplicaciones reales.
- Riesgo de sesgo derivado de la fuente de datos: television y radio publicas finlandesas, con posible sobrerrepresentacion de registros formales y de determinados acentos o hablantes.
- No se documentan evaluaciones de robustez frente a ruido, acentos regionales o audio telefónico.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrece ninguna garantia de calidad para produccion.
- El numero de descargas registrado es 0, lo que sugiere poca validacion externa hasta la fecha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-base-fi-lid-filter
- Paper: https://arxiv.org/abs/2610.13102
- Coleccion de modelos principales: https://huggingface.co/collections/GetmanY1/wav2vec2-fi-471k
- Codigo y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
