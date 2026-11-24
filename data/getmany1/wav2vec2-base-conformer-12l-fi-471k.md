# GetmanY1/wav2vec2-base-conformer-12l-fi-471k

## Resumen

El modelo `GetmanY1/wav2vec2-base-conformer-12l-fi-471k` es un extractor de características acústicas auto-supervisado para finés, desarrollado por Yaroslav Getman y colaboradores del grupo de investigación en habla de la Universidad Aalto (equipo que incluye a Tommi Lehtonen, Tamás Grósz y Mikko Kurimo). Se trata de un modelo wav2vec 2.0 de escala "base" en el que el codificador Transformer original se ha sustituido por un codificador Conformer de 12 capas, preentrenado sobre 471.000 horas de audio en finés.

El modelo no realiza reconocimiento automático del habla (ASR) por sí mismo: es un backbone de representaciones que debe afinarse sobre habla transcrita. Su relevancia radica en que forma parte de una familia publicada junto al artículo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL", que explora cómo escalar el preentrenamiento auto-supervisado monolingüe a partir de audio de radiodifusión en bruto, aplicando detección de actividad de voz, deduplicación basada en transcripciones y filtrado por confianza de ASR.

Con 96 millones de parámetros, el modelo mantiene un coste computacional contenido (comparable a un wav2vec 2.0 Base estándar) pero mejora los resultados de WER de los baselines Transformer en todas las pruebas reportadas, lo que lo convierte en una opción interesante como punto de partida para ASR en finés y otras tareas de habla en ese idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 con codificador Conformer (12 capas) |
| Parametros totales | 96.042.688 (~96,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz; ventana efectiva determinada por la arquitectura convolucional y el codificador) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,8 GB) + checkpoint original fairseq (`fairseq/checkpoint.pt`) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma wav2vec 2.0 de auto-supervisión: un extractor convolucional de características procesa audio mono a 16 kHz y un codificador contextual genera representaciones enmascaradas que se entrenan con un objetivo contrastivo y una pérdida de diversidad. La innovación principal es el reemplazo del codificador Transformer por un Conformer de 12 capas con dimensión de modelo 576 y dimensión feed-forward 2048, lo que incorpora convoluciones locales dentro del bloque de atención y mejora la captura de patrones acústicos locales. El modelo utiliza código de modelado personalizado para reproducir el codificador de fairseq, por lo que requiere `trust_remote_code=True` al cargarse con Transformers.

El preentrenamiento se realizó sobre 471.000 horas de habla en finés provenientes del Archivo de Radio y Televisión de la Agencia Finlandesa de Arte y Cultura (KUVI, antes KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandés y Lahjoita puhetta. El pipeline de datos partió de 2,1 millones de horas de audio de radiodifusión en bruto, a las que se aplicó detección de actividad de voz, deduplicación basada en transcripciones y filtrado por confianza de ASR (umbral τ = −0,10). El entrenamiento consistió en 125.000 actualizaciones con tasa de aprendizaje 6e-4, procesando aproximadamente 3 minutos de audio por GPU en 512 GPUs. No se documenta una fase de RLHF o DPO, ya que es un modelo puramente auto-supervisado sin alineamiento humano.

## Capacidades

- Extracción de representaciones acústicas auto-supervisadas a partir de audio mono a 16 kHz, pensadas para servir como base de tareas posteriores.
- Preentrenamiento específico para finés, con vocabulario y patrones fonéticos adaptados a ese idioma.
- Base para ASR tras afinamiento supervisado (existe una versión ya afinada publicada por el autor).
- Compatible con el ecosistema Transformers mediante `AutoModel` y `Wav2Vec2FeatureExtractor`, con carga de código remoto.
- No incluye tokenizador ni cabeza CTC; no genera texto por sí mismo.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al finés; no se reportan resultados en otros idiomas.
- Capacidades especiales (thinking mode, visión, audio generativo): no disponibles.

## Casos de uso

- Reconocimiento automático del habla en finés: el uso principal es el afinamiento supervisado sobre habla transcrita para construir un sistema ASR. El autor publica una versión afinada (`-finetuned`) que sirve como referencia directa.
- Transcripción de archivos de radiodifusión: dado que el preentrenamiento usa audio de radio y televisión finlandeses, el modelo está especialmente adaptado al dominio de broadcast, lo que reduce el desajuste de dominio en la transcripción de programas, informativos y entrevistas.
- Subtitulado automático de contenido audiovisual en finés: el modelo puede afinarse para generar subtítulos con marcas de tiempo, aprovechando su robustez en habla espontánea y con ruido de fondo típica de la radiodifusión.
- Extracción de características para clasificación de habla: las representaciones pueden alimentar clasificadores de emoción, género, edad o detección de idioma, con un coste de inferencia bajo (96 M de parámetros).
- Investigación en fonética y análisis acústico: las representaciones auto-supervisadas permiten estudiar patrones fonéticos y prosódicos en finés sin necesidad de transcripciones, útil en lingüística computacional.
- Punto de partida para modelos de habla de dominio específico: al estar entrenado sobre 471K horas, sirve como inicialización para afinamiento en dominios concretos (sanitario, legal, atención al cliente) con cantidades limitadas de datos etiquetados.
- Búsqueda por contenido en archivos de audio: combinado con un índice vectorial, las representaciones permiten recuperar fragmentos de audio por similitud acústica o semántica en grandes archivos de la radio pública finlandesa.

## Benchmarks y rendimiento

Los resultados reportados en la model card corresponden al WER (%) de los modelos Base afinados para ASR (Tabla III del artículo). Este modelo concreto es la fila "Conformer, 12 layers".

| Modelo | Params | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer, 12 capas (baseline previo, 158K h) | 95,0 M | 22,27 | 10,92 | 8,42 | 10,61 | 13,27 | 27,45 |
| Transformer, 12 capas | 95,0 M | 22,28 | 10,72 | 8,70 | 9,74 | 13,02 | 24,85 |
| Transformer, 18 capas | 95,1 M | 21,33 | 10,64 | 8,66 | 8,99 | 12,71 | 23,91 |
| **Conformer, 12 capas (este modelo)** | 96,7 M | 18,89 | 10,08 | 8,07 | 6,46 | 11,20 | 23,71 |
| Conformer, 17 capas | 96,5 M | 18,50 | 9,83 | 7,94 | 5,69 | 10,56 | 22,71 |
| E-Branchformer, 12 capas | 98,4 M | 19,14 | 10,10 | 7,80 | 6,91 | 11,53 | 22,89 |
| E-Branchformer, 17 capas | 96,6 M | 18,80 | 9,54 | 7,85 | 6,19 | 11,09 | 22,44 |

LP = Lahjoita puhetta, FP = Finnish Parliament, CV = Common Voice 16.1, KAVI = habla de radiodifusión real. Los resultados son de los modelos afinados, no del backbone sin afinar.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 96 M de parámetros en fp32, los pesos ocupan aproximadamente 0,4 GB; la inferencia completa con activaciones se mantiene por debajo de 2 GB para audios de duración moderada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se ha entrenado en clústeres con 512 GPUs, pero la inferencia no requiere hardware de gama alta.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; también es posible cargar el checkpoint original con el fork de fairseq del autor. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de habla de este tipo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | WER (CV 16.1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Conformer 12L fi (este modelo)** | 96,7 M | no disponible | 6,46 | Apache 2.0 | Hugging Face |
| Transformer 12L fi (baseline del mismo paper) | 95,0 M | no disponible | 9,74 | Apache 2.0 (presumible) | Hugging Face |
| E-Branchformer 12L fi | 98,4 M | no disponible | 6,91 | Apache 2.0 (presumible) | Hugging Face |
| wav2vec 2.0 Base multilingüe (referencia general) | ~95 M | no disponible | no disponible para finés | MIT/Apache 2.0 | Hugging Face |

La comparación se limita a los modelos de la misma familia publicados en el artículo, ya que no se dispone de datos de benchmarks de otros modelos de habla en finés en la información proporcionada.

## Limitaciones y advertencias

- El modelo no realiza ASR de forma directa: carece de tokenizador y de cabeza CTC, por lo que debe afinarse antes de cualquier uso productivo.
- Está entrenado exclusivamente con habla en finés; su rendimiento en otros idiomas no está documentado y previsiblemente será pobre.
- Al ser un modelo auto-supervisado, puede heredar sesgos presentes en el audio de radiodifusión finlandesa (variedades dialectales sobrerrepresentadas, sesgos de género o de registro).
- El riesgo de alucinación no aplica en el sentido de los modelos de lenguaje, pero al afinarse para ASR puede producir transcripciones plausibles pero incorrectas en segmentos con ruido o solapamiento de hablantes.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el código antes de desplegarlo en entornos sensibles.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones de los corpus de origen (KUVI/KAVI, VoxPopuli, Parlamento finlandés, Lahjoita puhetta) si redistribuye derivados.
- El modelo se publicó en noviembre de 2026 y no cuenta con descargas ni validación independiente en el momento de la ficha (0 descargas, 0 likes).
- No se documentan cuantizaciones oficiales; el uso en CPU requiere convertir los pesos manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-base-conformer-12l-fi-471k
- Versión afinada para ASR: https://huggingface.co/GetmanY1/wav2vec2-base-conformer-12l-fi-471k-finetuned
- Artículo: https://arxiv.org/abs/2610.13102
- Repositorio de código y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Fork de fairseq del autor: https://github.com/Getmany1/fairseq
- Perfil de Hugging Face del autor: https://huggingface.co/GetmanY1
- LinkedIn de Yaroslav Getman: https://www.linkedin.com/in/yaroslav-getman/
- LinkedIn de Tamás Grósz: https://www.linkedin.com/in/tam%C3%A1s-gr%C3%B3sz-950a049a/
