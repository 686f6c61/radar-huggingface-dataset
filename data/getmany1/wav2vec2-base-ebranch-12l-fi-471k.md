# GetmanY1/wav2vec2-base-ebranch-12l-fi-471k

## Resumen

wav2vec2-base-ebranch-12l-fi-471k es un modelo de representacion auto-supervisada del habla (speech SSL) para finlandes, desarrollado por Yaroslav Getman y colaboradores del grupo de investigacion en tecnologia del habla de la Universidad Aalto (equipo de Mikko Kurimo). Se trata de un wav2vec 2.0 Base cuyo codificador Transformer original ha sido sustituido por un E-Branchformer de 12 capas, preentrenado sobre 471.000 horas de audio de habla finlandesa. El modelo resuelve el problema de obtener un extractor de caracteristicas acusticas de proposito general para finlandes que sirva como base para tareas posteriores como reconocimiento automatico del habla (ASR), sin necesidad de transcripciones durante el preentrenamiento.

El modelo forma parte del trabajo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL: Confidence Filtering and Architectural Analysis at Scale" (arXiv:2610.13102), que parte de 2,1 millones de horas de audio de radiodifusion en bruto y aplica deteccion de actividad de voz, deduplicacion basada en transcripciones y filtrado por confianza de ASR para reducir el corpus a 471.000 horas utilizables. La contribucion principal del paper es el analisis arquitectonico a escala: compara Transformer, Conformer y E-Branchformer con recuentos de parametros equiparables para aislar el efecto de la arquitectura frente al volumen de datos.

Con 97.731.520 parametros, una dimension de modelo de 576 y una dimension de feed-forward de 1280, el modelo es deliberadamente compacto (escala Base) y esta pensado como punto de partida para fine-tuning, no como modelo listo para produccion: no incluye tokenizer ni cabeza CTC. Su relevancia actual radica en que demuestra que un E-Branchformer de 12 capas iguala o supera a arquitecturas mas profundas en dominios dificiles como el habla de radiodifusion real (KAVI), y en que libera tanto los pesos en formato transformers como el checkpoint original de fairseq bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 con codificador E-Branchformer de 12 capas |
| Parametros totales | 97.731.520 (98,4 M segun la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz; el modelo no documenta una ventana maxima explicita) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; el repo solo contiene safetensors y el checkpoint fairseq) |
| Idiomas soportados | finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y `fairseq/checkpoint.pt` (fairseq) |
| Dimension de modelo | 576 |
| Dimension de feed-forward | 1280 |
| Entrada | audio mono a 16 kHz, `do_normalize=False` |
| Cabeza CTC / tokenizer | no incluidos |
| Codigo personalizado | si, requiere `trust_remote_code=True` |
| Tamano del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

El modelo es un wav2vec 2.0 en el que el bloque codificador Transformer se reemplaza por un E-Branchformer, una arquitectura que combina atencion global con una rama de convoluciones depthwise y fusiona ambas mediante concatenacion, lo que captura dependencias locales y globales de forma mas eficiente que un Transformer puro. El codificador tiene 12 capas, dimension de modelo 576 y dimension de feed-forward 1280, lo que da 98,4 M de parametros, practicamente identico a los 95 M del baseline Transformer de 12 capas y a los 96,7 M del Conformer de 12 capas, lo que permite comparaciones controladas por tamano. La modelacion se implementa con codigo personalizado que reproduce el encoder de fairseq, de ahi la necesidad de `trust_remote_code=True`.

El preentrenamiento es auto-supervisado, con el objetivo original de wav2vec 2.0 (enmascaramiento contrastivo sobre representaciones cuantizadas), durante 125.000 actualizaciones con una tasa de aprendizaje de 6e-4 y aproximadamente 3 minutos de audio por GPU en 512 GPUs. Los datos proceden de 471.000 horas de habla finlandesa: el archivo de radio y television de la Agencia Finlandesa de Arte y Cultura (KUVI, antes KAVI), los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandes y Lahjoita puhetta. Las 2,1 M de horas brutas se filtraron mediante deteccion de actividad de voz, deduplicacion basada en transcripciones y filtrado por confianza de ASR con umbral tau = -0,10. No se documenta en la informacion disponible el uso de RLHF ni DPO, algo esperable en un modelo puramente SSL sin etapa de alineamiento.

## Capacidades

- Extraccion de representaciones acusticas auto-supervisadas a partir de audio mono a 16 kHz, que es la funcion principal del modelo (pipeline `feature-extraction`).
- Base para fine-tuning en reconocimiento automatico del habla en finlandes: existe una version ya ajustada en `GetmanY1/wav2vec2-base-ebranch-12l-fi-471k-finetuned`.
- Captura de informacion fonetica y prosodica util para tareas descendentes de habla, gracias a la rama convolucional del E-Branchformer.
- No incluye cabeza CTC ni tokenizer, por lo que no transcribe audio de forma directa sin fine-tuning.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades de vision, audio generativo ni modo "thinking".
- Cobertura multilingue limitada al finlandes; no se documenta transferencia a otras lenguas.
- Compatible con la API de transformers (`AutoModel`, `Wav2Vec2FeatureExtractor`) y con el ecosistema fairseq mediante el fork del autor.

## Casos de uso

- Reconocimiento automatico del habla en finlandes: fine-tuning sobre transcripciones para construir un sistema ASR; el paper reporta WER de 6,91 % en Common Voice 16.1 y 7,80 % en el subconjunto del Parlamento de 2020 tras el ajuste.
- Transcripcion de archivos de radiodifusion: el modelo esta entrenado precisamente con audio de radio y television (KUVI/KAVI), por lo que es adecuado para digitalizar y transcribir fondos audiovisuales finlandeses con vocabulario y ruido de dominio coincidente.
- Subtitulado automatico de contenido audiovisual finlandes: partiendo del checkpoint ajustado para ASR, se puede integrar en un pipeline de generacion de subtitulos con marcas temporales a nivel de palabra.
- Investigacion en tecnologias del habla: sirve como linea base reproducible para estudiar el efecto de arquitecturas (E-Branchformer frente a Transformer o Conformer) con recuentos de parametros equiparables.
- Extraccion de embeddings para tareas paralinguisticas: identificacion de hablante, deteccion de emociones o clasificacion de acentos, congelando el codificador y entrenando una cabeza ligera sobre las representaciones.
- Indexacion y busqueda por voz en archivos parlamentarios o periodisticos: los embeddings permiten busqueda semantica sobre audio sin transcripcion previa.
- Aprendizaje activo y pseudo-etiquetado: usar el modelo ajustado para generar transcripciones de bajo coste y filtrar por confianza antes de incorporar datos nuevos al entrenamiento.

## Benchmarks y rendimiento

Resultados de WER (%) de los modelos Base ajustados para ASR, tabla III del paper, con recuentos de parametros equiparables. LP = Lahjoita puhetta, FP = Parlamento finlandes, CV = Common Voice 16.1, KAVI = habla de radiodifusion real. En negrita, el mejor resultado a esa escala.

| Modelo | Parametros | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer, 12 capas (baseline previo, 158K h) | 95,0 M | 22,27 | 10,92 | 8,42 | 10,61 | 13,27 | 27,45 |
| Transformer, 12 capas | 95,0 M | 22,28 | 10,72 | 8,70 | 9,74 | 13,02 | 24,85 |
| Transformer, 18 capas | 95,1 M | 21,33 | 10,64 | 8,66 | 8,99 | 12,71 | 23,91 |
| Conformer, 12 capas | 96,7 M | 18,89 | 10,08 | 8,07 | 6,46 | 11,20 | 23,71 |
| Conformer, 17 capas | 96,5 M | **18,50** | 9,83 | 7,94 | **5,69** | **10,56** | 22,71 |
| E-Branchformer, 12 capas (este modelo) | 98,4 M | 19,14 | 10,10 | **7,80** | 6,91 | 11,53 | 22,89 |
| E-Branchformer, 17 capas | 96,6 M | 18,80 | **9,54** | 7,85 | 6,19 | 11,09 | **22,44** |

Lectura de los datos: el E-Branchformer de 12 capas obtiene el mejor WER en FP'20 (7,80) y el segundo mejor en KAVI (22,89), superando al Conformer de 12 capas en el dominio de radiodifusion real (22,89 frente a 23,71) pese a tener mas parametros en la misma escala. Frente al Transformer de 12 capas, la mejora es de 1,96 puntos en KAVI y de 0,90 en FP'20. Las cifras corresponden a los modelos ajustados para ASR, no al modelo SSL base publicado aqui.

## Requisitos de hardware

- VRAM estimada para inferencia: con 97,7 M de parametros, los pesos en fp32 ocupan aproximadamente 0,39 GB y en fp16 unos 0,20 GB; el consumo real depende de la longitud del audio de entrada y del almacenamiento de activaciones, pero en la practica cabe en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: el modelo cabe con holgura en RTX 3060, RTX 4060, RTX 4090 y superiores; para procesar lotes grandes de audio en investigacion se recomiendan A100 o H100, que es el hardware usado en el preentrenamiento (512 GPUs).
- Cabe en GPU consumer: si, sin problema, incluso en GPUs integradas o CPU para audios cortos.
- Opciones de despliegue: transformers con `trust_remote_code=True` (via principal), fairseq mediante el fork del autor para cargar `checkpoint.pt`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un modelo de extraccion de caracteristicas de audio.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota: el preentrenamiento uso aproximadamente 3 minutos de audio por GPU en 512 GPUs durante 125.000 actualizaciones, dato de coste de entrenamiento, no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Preentrenamiento | Contexto / entrada | WER KAVI (ajustado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| E-Branchformer 12L fi (este modelo) | 98,4 M | 471K h finlandes | audio 16 kHz | 22,89 | Apache 2.0 | Hugging Face |
| Conformer 12L fi (mismo paper) | 96,7 M | 471K h finlandes | audio 16 kHz | 23,71 | Apache 2.0 | Hugging Face (paper) |
| Transformer 12L fi (mismo paper) | 95,0 M | 471K h finlandes | audio 16 kHz | 24,85 | Apache 2.0 | Hugging Face (paper) |
| wav2vec 2.0 Base original (Meta) | ~95 M | 960 h ingles (LibriSpeech) | audio 16 kHz | no aplica (no finlandes) | MIT / Apache 2.0 segun variante | Hugging Face |

La comparativa mas informativa es interna al paper, porque los tres modelos comparten corpus, recuento de parametros y receta de ajuste, lo que aisla el efecto de la arquitectura. Frente al wav2vec 2.0 Base original de Meta, la diferencia clave es el idioma y el volumen de datos: 471K horas de finlandes frente a 960 horas de ingles, lo que hace que este modelo sea la opcion adecuada para habla finlandesa y no para ingles.

## Limitaciones y advertencias

- Solo finlandes: no se documenta rendimiento en otras lenguas ni capacidad de transferencia multilingue.
- No es un modelo de ASR listo para usar: carece de tokenizer y cabeza CTC; requiere fine-tuning sobre transcripciones para transcribir.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; conviene auditar el codigo antes de desplegarlo en produccion.
- Riesgo de sesgo de dominio: el corpus esta dominado por radio, television y parlamento, por lo que el rendimiento puede degradarse en habla coloquial, dialectos no representados o audio con ruido no visto.
- El filtrado por confianza de ASR (tau = -0,10) descarta segmentos de baja confianza, lo que puede infrarrepresentar habla con acentos marcados o condiciones acusticas dificiles.
- Riesgo de alucinacion en sentido estricto no aplica (no genera texto), pero un modelo ajustado puede producir transcripciones erroneas con alta confianza en segmentos ruidosos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los corpus de origen (KUVI, VoxPopuli, Lahjoita puhetta) si se redistribuyen derivados.
- Sin datos publicados de latencia, throughput ni variantes cuantizadas; el despliegue en produccion exige medir el rendimiento real.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario practicamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-base-ebranch-12l-fi-471k
- Version ajustada para ASR: https://huggingface.co/GetmanY1/wav2vec2-base-ebranch-12l-fi-471k-finetuned
- Paper: https://arxiv.org/abs/2610.13102
- Codigo y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Fork de fairseq para cargar el checkpoint original: https://github.com/Getmany1/fairseq
- Perfil del autor en Hugging Face: https://huggingface.co/GetmanY1
- Perfil de Tamas Grosz en Hugging Face: https://huggingface.co/Grosy
- LinkedIn de Yaroslav Getman: https://www.linkedin.com/in/yaroslav-getman/
- LinkedIn de Tamas Grosz: https://www.linkedin.com/in/tam%C3%A1s-gr%C3%B3sz-950a049a/
