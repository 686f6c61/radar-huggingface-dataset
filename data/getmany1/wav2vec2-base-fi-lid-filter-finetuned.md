# GetmanY1/wav2vec2-base-fi-lid-filter-finetuned

## Resumen

`GetmanY1/wav2vec2-base-fi-lid-filter-finetuned` es un modelo de reconocimiento automatico del habla (ASR) para finlandes, desarrollado por Yaroslav Getman y colaboradores del grupo de investigacion en tecnologia del habla de la Universidad de Aalto (firmas: Getman, Lehtonen, Grósz y Kurimo). Se trata de un checkpoint de wav2vec 2.0 Base (12 capas, 768 de dimension de modelo, 3072 de dimension feed-forward, 94,4 millones de parametros) preentrenado sobre un vasto archivo de audio de television y radio finlandes y posteriormente ajustado con CTC para transcripcion. El modelo forma parte de un ablation de filtrado que sustenta la Figura 1 del articulo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL" (arXiv:2610.13102).

El modelo resuelve el problema de construir un sistema ASR monoidioma de alta calidad para finlandes a partir de datos de difusion sin transcribir, aplicando un pipeline de curado agresivo: deteccion de actividad de voz, deduplicacion basada en transcripciones y, en este checkpoint concreto, filtrado por identificacion de idioma (LID). Se retuvieron 643K horas de las 890K horas deduplicadas (72%), tras exigir que tanto un modelo LID acustico (ECAPA-TDNN con VoxLingua107) como fastText sobre la transcripcion ASR identificasen finlandes.

Es relevante ahora porque demuestra que el filtrado por LID en un corpus masivo de difusion publica produce modelos SSL de habla competitivos con un coste computacional contenido (125K actualizaciones sobre 512 GPU). No obstante, el propio autor advierte de que este checkpoint existe para comparacion dentro del ablation y que para uso general conviene emplear los modelos principales del articulo (coleccion `GetmanY1/wav2vec2-fi-471k`). El contexto de entrenamiento, 512 GPU y unos 3 minutos de audio por GPU, situa el trabajo en la escala de los grandes corpus SSL multilingues, pero restringido a un solo idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 Base (transformer convolucional + transformer de 12 capas, preentrenamiento auto-supervisado con enmascaramiento y cuantizacion) |
| Parametros totales | 94.397.858 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; entrada en ventanas de 16 kHz mono, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y checkpoint fairseq original; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y checkpoint fairseq (`fairseq/checkpoint.pt` con `fairseq/dict.ltr.txt`) |
| Frecuencia de muestreo | 16 kHz mono, `do_normalize=False` |
| Tamano del repositorio | 0,8 GB |
| Libreria | transformers |
| Pipeline | automatic-speech-recognition |
| Modelo base | GetmanY1/wav2vec2-base-fi-lid-filter |

## Arquitectura y entrenamiento

La arquitectura es wav2vec 2.0 Base: un codificador convolucional de caracteristicas que transforma la forma de onda en representaciones latentes, seguido de un transformer de 12 capas con dimension 768 y feed-forward de 3072, entrenado de forma auto-supervisada mediante enmascaramiento de latentes y una tarea de contraste con cuantizacion (product quantization). El preentrenamiento se realizo durante 125K actualizaciones con tasa de aprendizaje 6e-4, procesando aproximadamente 3 minutos de audio por GPU en un total de 512 GPU. El ajuste fino posterior emplea CTC sobre 4,6K horas de habla transcrita procedente de los corpus del Parlamento finlandes y Lahjoita puhetta, durante 16K actualizaciones, con el codificador convolucional de caracteristicas congelado.

Los datos de preentrenamiento provienen del archivo de radio y television de la Agencia Finlandesa de Arte y Cultura (KUVI, anteriormente KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandes y Lahjoita puhetta. Todo el material paso por deteccion de actividad de voz y deduplicacion basada en transcripciones. La innovacion concreta de este checkpoint es el filtrado por identificacion de idioma: se conserva un segmento solo si tanto un modelo LID acustico (ECAPA-TDNN entrenado con VoxLingua107) como fastText aplicado sobre la transcripcion ASR lo clasifican como finlandes. El resultado son 643K horas retenidas (72% de las 890K horas deduplicadas). Este checkpoint forma parte del ablation que compara distintas estrategias de filtrado, y su proposito es servir de referencia comparativa frente a los modelos principales del articulo.

## Capacidades

- Reconocimiento automatico del habla en finlandes: transcripcion de audio mono a 16 kHz mediante decodificacion CTC.
- Salida a nivel de caracter: el vocabulario es un diccionario de caracteres (`dict.ltr.txt`), adecuado para decodificacion greedy o con modelo de lenguaje externo.
- Preentrenamiento auto-supervisado: las representaciones latentes pueden reutilizarse como extractor de caracteristicas para tareas descendentes (clasificacion, diarizacion, keyword spotting), aunque no se documenta un uso especifico.
- No soporta tool calling ni function calling: es un modelo exclusivamente de audio, sin interfaz de texto generativo.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el modelo esta especializado en finlandes.
- Capacidades especiales: ninguna documentada (sin modo thinking, sin vision, sin audio generativo).

## Casos de uso

- Transcripcion de archivos audiovisuales de television y radio finlandesa: el modelo esta entrenado sobre exactamente ese dominio (KUVI), por lo que es adecuado para digitalizar y hacer buscable el catalogo de una emisora publica o un archivo nacional.
- Subtitulacion automatica de contenido en finlandes: la salida CTC a nivel de caracter permite generar subtitulos con marcas temporales a partir de los logits por fotograma, integrable en pipelines de postproduccion.
- Transcripcion de sesiones parlamentarias y debates publicos: el ajuste fino incluye el corpus del Parlamento finlandes, lo que reduce el error en vocabulario politico y formal.
- Investigacion en tecnologias del habla: sirve como linea base reproducible en estudios de filtrado de datos y ablation, ya que el codigo y las configuraciones estan publicados en `aalto-speech/large-scale-monolingual-speech-foundation-models`.
- Extraccion de caracteristicas acusticas para tareas descendentes: las representaciones del transformer pueden alimentar clasificadores de emocion, edad o genero sobre habla finlandesa.
- Prototipado de asistentes de voz en finlandes: combinado con un modulo de reconocimiento de intenciones, el modelo puede transcribir comandos de voz en entornos de investigacion con licencia Apache 2.0.
- Generacion de datos etiquetados a escala: transcripcion de grandes volumenes de audio no anotado para construir corpus de texto en finlandes, con revision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de WER ni comparaciones numericas con otros modelos; unicamente referencia la Figura 1 del articulo arXiv:2610.13102, cuyos valores no se proporcionan en los datos disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: con 94,4 millones de parametros en FP32, los pesos ocupan aproximadamente 0,38 GB; en FP16, unos 0,19 GB. La memoria adicional para activaciones y buffers de audio es reducida, por lo que en la practica el modelo cabe en cualquier GPU con 2 GB o mas.
- GPU recomendadas: cualquier GPU moderna es suficiente; para procesamiento por lotes a gran escala se recomiendan A100, H100 o L40S por su ancho de banda y capacidad de paralelizacion. En consumer, una RTX 4090, RTX 3090 o incluso una RTX 3060 de 12 GB son mas que suficientes.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer con 4 GB o mas, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: transformers (Wav2Vec2ForCTC y Wav2Vec2Processor), fairseq con el checkpoint original, y servidores de inferencia compatibles con transformers como TGI o vLLM (aunque este ultimo esta orientado a modelos de texto). El tag `endpoints_compatible` sugiere compatibilidad con los Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dado el tamano (94M), se espera una latencia baja por segmento corto, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GetmanY1/wav2vec2-base-fi-lid-filter-finetuned | 94,4M | ventanas de 16 kHz mono | fi | Apache 2.0 | Hugging Face |
| GetmanY1/wav2vec2-base-fi-lid-filter (modelo base) | no disponible en la informacion | ventanas de 16 kHz mono | fi | Apache 2.0 | Hugging Face |
| Modelos principales de la coleccion `GetmanY1/wav2vec2-fi-471k` | no disponible en la informacion | ventanas de 16 kHz mono | fi | Apache 2.0 | Hugging Face |
| wav2vec 2.0 Base original (facebook) | 95M | ventanas de 16 kHz mono | multilingue (preentrenamiento) | MIT (facebook) | Hugging Face |

La comparacion cuantitativa de WER entre estos modelos no esta disponible en la informacion proporcionada. El autor indica explicitamente que, para uso general, deben preferirse los modelos principales de la coleccion frente a este checkpoint de ablation.

## Limitaciones y advertencias

- Modelo de ablation: el autor advierte de que este checkpoint existe para comparacion con otros del ablation y que no es la opcion recomendada para uso general.
- Especializado exclusivamente en finlandes: no transcribe otros idiomas y su rendimiento fuera del dominio de difusion publica finlandesa no esta documentado.
- Dominio de entrenamiento acotado: television, radio, parlamento y Lahjoita puhetta; el rendimiento en habla telefonica, conversacional informal o con ruido de fondo puede degradarse.
- Riesgo de alucinacion en la transcripcion: como todo modelo CTC, puede producir caracteres plausibles en segmentos de silencio o ruido; se recomienda un modelo de lenguaje externo o umbrales de confianza.
- Sesgos potenciales derivados del corpus: sobrerrepresentacion de habla formal y de registro periodistico, y posible infrarrepresentacion de acentos regionales o hablantes no nativos.
- Sin datos de benchmarks publicados en la informacion disponible, por lo que no es posible verificar su calidad frente a alternativas.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y la atribucion correspondiente.
- Requiere audio mono a 16 kHz con `do_normalize=False`; un preprocesado incorrecto degrada la transcripcion.
- No incluye funcionalidades de texto, tool calling ni agentes; su integracion en pipelines requiere modulos adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-base-fi-lid-filter-finetuned
- Modelo base: https://huggingface.co/GetmanY1/wav2vec2-base-fi-lid-filter
- Coleccion de modelos principales: https://huggingface.co/collections/GetmanY1/wav2vec2-fi-471k
- Articulo: https://arxiv.org/abs/2610.13102
- Codigo y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
