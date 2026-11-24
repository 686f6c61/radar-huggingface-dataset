# GetmanY1/wav2vec2-base-fi-no-filter

## Resumen

wav2vec2-base-fi-no-filter es un checkpoint de wav2vec 2.0 Base preentrenado de forma auto-supervisada sobre audio de archivo de television y radio en finlandes. Lo publica GetmanY1 (Yaroslav Getman) en el marco de un trabajo de investigacion del grupo de speech de la Universidad de Aalto sobre modelos fundacionales de habla monolingues a gran escala. No es un modelo de uso general: es una de las variantes del ablation de filtrado que sustenta la Figura 1 del paper "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL".

El modelo tiene 95.044.608 parametros (12 capas, dimension de modelo 768, dimension de feed-forward 3072) y se entreno sobre 890.000 horas de audio retenidas tras aplicar deteccion de actividad de voz y deduplicacion basada en transcripcion, pero sin ningun filtrado adicional de calidad. Esta variante "no filtering" existe precisamente para comparar su rendimiento frente a las variantes con filtrado de confianza del mismo corpus.

Es relevante ahora porque forma parte de un esfuerzo por construir modelos de habla fundacionales para idiomas con menos recursos computacionales y de datos que el ingles, y porque documenta de forma controlada el efecto del filtrado de datos a escala de millones de horas. Para uso practico, el autor recomienda los modelos principales del paper; este checkpoint debe tratarse como material de comparacion experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 Base (transformer encoder, 12 capas) |
| Parametros totales | 95.044.608 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz mono; ventana efectiva determinada por el fine-tuning) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; cuantizacion no documentada por el autor) |
| Idiomas soportados | finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y `fairseq/checkpoint.pt` (fairseq original) |

## Arquitectura y entrenamiento

La arquitectura es wav2vec 2.0 Base: un extractor de caracteristicas convolucional seguido de un encoder transformer de 12 capas con dimension 768 y feed-forward de 3072, entrenado con el objetivo auto-supervisado de wav2vec 2.0 (enmascaramiento contrastivo sobre representaciones cuantizadas). El modelo no incluye tokenizer ni cabeza CTC; es un extractor de representaciones que debe afinarse sobre habla transcrita para tareas de reconocimiento automatico del habla.

El preentrenamiento uso habla del archivo de radio y television de la Agencia Finlandesa de Artes y Cultura (KUVI, antes Instituto Audiovisual Nacional, KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandes y Lahjoita puhetta. Todos los datos pasaron por deteccion de actividad de voz y deduplicacion basada en transcripcion, y en esta variante **no se aplico ningun filtrado adicional**, reteniendose 890.000 horas. El entrenamiento consistio en 125.000 actualizaciones con learning rate 6e-4, procesando aproximadamente 3 minutos de audio por GPU en 512 GPUs. La entrada es audio mono a 16 kHz con `do_normalize=False`. El codigo y las configuraciones estan en el repositorio aalto-speech/large-scale-monolingual-speech-foundation-models.

## Capacidades

- Extraccion de representaciones de habla auto-supervisadas a partir de audio en finlandes.
- Base para fine-tuning en reconocimiento automatico del habla (ASR) mediante la adicion de una cabeza CTC o un decodificador seq2seq.
- Base potencial para otras tareas de habla descendentes (clasificacion de audio, diarizacion, deteccion de emociones) previo fine-tuning, aunque el autor solo documenta explicitamente el uso para ASR.
- Procesamiento de audio mono a 16 kHz con normalizacion desactivada.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de capacidades multilingues: esta entrenado exclusivamente en finlandes.
- No incluye modo thinking, vision ni audio generativo; es un encoder de representaciones.

## Casos de uso

- Fine-tuning para ASR en finlandes: el uso principal documentado. Se anade una cabeza CTC o un decodificador sobre las representaciones del encoder y se afina con habla transcrita para obtener un sistema de transcripcion.
- Investigacion sobre filtrado de datos a escala: sirve como punto de control "sin filtrado" para medir el impacto del filtrado de confianza en el rendimiento final de un modelo SSL, replicando la ablacion del paper.
- Reproduccion de experimentos: util para verificar los resultados de la Figura 1 del paper y para comparar con las variantes filtradas del mismo corpus.
- Extraccion de caracteristicas para modelos de habla descendentes: usar las representaciones congeladas como entrada de clasificadores ligeros en tareas de habla finlandesa.
- Desarrollo de sistemas de transcripcion para dominios de radiodifusion: el corpus de origen (radio y television) hace que las representaciones esten adaptadas al habla de medios, util para transcripcion de archivos audiovisuales.
- Benchmarking interno de pipelines de preprocesado de audio: comparar el efecto de la deteccion de actividad de voz y la deduplicacion frente al filtrado adicional en un corpus propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a la Figura 1 del paper arXiv:2610.13102 para la comparacion entre variantes del ablation, pero no se incluyen cifras en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 95M parametros, los pesos en fp32 ocupan aproximadamente 0,38 GB; en fp16 alrededor de 0,19 GB. La VRAM real dependera de la longitud del audio de entrada y del tamano de lote.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para inferencia en fp32 con lotes pequenos; para fine-tuning se recomienda al menos 16-24 GB (RTX 4090, A10, A100).
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, tanto para inferencia como para fine-tuning con lotes moderados.
- Opciones de despliegue: transformers (Wav2Vec2Model / Wav2Vec2FeatureExtractor) es la via documentada; tambien puede cargarse con fairseq usando el checkpoint original. No se documenta soporte especifico para vLLM, llama.cpp, Ollama ni TGI (no son adecuados para un encoder de habla).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GetmanY1/wav2vec2-base-fi-no-filter | 95M | no disponible | fi | Apache 2.0 | Hugging Face |
| Variantes filtradas del mismo paper (coleccion GetmanY1/wav2vec2-fi-471k) | 95M (base) | no disponible | fi | Apache 2.0 (segun model card) | Hugging Face |
| wav2vec 2.0 Base original (Facebook/Meta) | 95M | no disponible | en (principalmente) | MIT (segun publicacion original) | Hugging Face |
| XLS-R (variantes base) | ~300M | no disponible | multilingue | MIT (segun publicacion original) | Hugging Face |

La comparacion relevante es interna al paper: esta variante sin filtrado frente a las variantes con filtrado de confianza del mismo corpus finlandes. Frente a wav2vec 2.0 Base original, comparte arquitectura y numero de parametros pero difiere en idioma y datos de preentrenamiento. No se dispone de cifras de rendimiento comparativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de uso general: el propio autor recomienda los modelos principales del paper para uso practico y describe este checkpoint como material de comparacion del ablation.
- No incluye tokenizer ni cabeza CTC; sin fine-tuning sobre habla transcrita no produce transcripciones.
- Entrenado exclusivamente en finlandes: no generaliza a otros idiomas sin fine-tuning.
- Al no aplicar filtrado de calidad, el corpus de 890.000 horas puede contener audio ruidoso, solapamientos o segmentos de baja calidad que afecten a las representaciones; esta es precisamente la hipotesis que el ablation pretende medir.
- Riesgo de sesgo hacia el dominio de radiodifusion (radio y television) y hacia las variedades de habla presentes en los corpus KUVI, VoxPopuli, Parlamento y Lahjoita puhetta.
- No se documentan evaluaciones de sesgo, robustez ni alucinacion (no aplica alucinacion en el sentido de modelos generativos, pero si errores de transcripcion tras fine-tuning).
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; verificar los terminos de los corpus de origen si se redistribuyen datos derivados.
- Para produccion, validar el rendimiento en el dominio objetivo antes de desplegar, dado que no hay benchmarks publicados en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-base-fi-no-filter
- Paper: https://arxiv.org/abs/2610.13102
- Coleccion de modelos del paper: https://huggingface.co/collections/GetmanY1/wav2vec2-fi-471k
- Codigo y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
