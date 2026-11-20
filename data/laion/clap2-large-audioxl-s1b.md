# laion/clap2-large-audioxl-s1B

## Resumen

CLAP2-L es un modelo contrastivo audio-texto desarrollado por LAION que proyecta clips de audio y descripciones en ingles a un espacio de embeddings compartido. Forma parte de la familia CLAP2, compuesta por cinco tamanos (de 27M a 340M parametros), y esta implementado en los formatos de OpenCLIP y Transformers. El modelo resuelve tareas de recuperacion audio-texto, clasificacion zero-shot de audio y extraccion de embeddings de audio para clasificadores posteriores, sin necesidad de entrenamiento especifico por tarea.

La torre de audio es un vision transformer NaFlex que opera sobre parches de log-mel y acepta audio de cualquier duracion sin recorte ni padding a una longitud fija, generando un unico embedding por clip. La torre de texto procesa descripciones en ingles con un tokenizador BPE de estilo GPT-2. El conjunto se entreno desde cero sobre LAION-Audio-XL, un corpus de 366 millones de pares audio-texto.

Su relevancia actual radica en que ofrece un rendimiento cercano al estado del arte en benchmarks de embeddings de audio (MAEB-30, HEAR-17, MSEB) con un modelo compacto de 340M parametros y licencia Apache 2.0, lo que facilita su uso comercial y su despliegue en infraestructura moderada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Contrastiva de dos torres: vision transformer NaFlex (audio) + transformer de texto |
| Parametros totales | 340.073.856 (ambas torres) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Audio: clips de hasta 30 s en entrenamiento (acepta mas, no evaluado); texto: 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (texto); audio de cualquier idioma en el corpus, pero recuperacion solo en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (via OpenCLIP / Transformers) |

## Arquitectura y entrenamiento

El modelo sigue un esquema contrastivo de dos torres. La torre de audio es un vision transformer NaFlex que procesa un espectrograma log-mel de 128 bins (50 Hz a 16 kHz, hop de 320 muestras) troceado en parches no solapados de 16x16, lo que produce 50 tokens por segundo de audio. Al no imponer un recorte fijo, admite clips de cualquier duracion y numero de canales (el preprocesado promedia a mono y remuestrea a 32 kHz). La torre de texto es un transformer con tokenizador BPE de estilo GPT-2 y contexto de 256 tokens.

El entrenamiento se realizo desde cero sobre LAION-Audio-XL, con 366 millones de pares audio-texto y 1.024 millones de muestras vistas, usando un schedule de learning rate WSD (warmup-stable-decay) y el ultimo checkpoint. Los clips de entrenamiento se agruparon en buckets de longitud de 6,9, 9,0, 13,0, 22,6 y 30,1 segundos. La evaluacion de benchmarks utiliza solo los primeros 30 segundos de cada clip. El entrenamiento empleo autocast en bf16, aunque la inferencia publicada se realiza en float32.

## Capacidades

- Recuperacion audio-texto: emparejamiento y ranking de clips de audio con descripciones textuales en ingles.
- Clasificacion zero-shot de audio: asignacion de etiquetas definidas mediante prompts de texto en lenguaje natural.
- Extraccion de embeddings de audio y de texto normalizados para clasificadores posteriores y busqueda por similitud.
- Procesamiento de audio de duracion variable sin recorte ni padding a longitud fija, con enmascaramiento de padding para lotes de clips de distinta duracion.
- Cobertura de dominios de voz, musica y sonidos ambientales, segun las tareas de los benchmarks MAEB y HEAR.
- Sin soporte documentado de tool calling, agentes, vision, audio generation ni modo de razonamiento; es un modelo de representacion, no generativo.

## Casos de uso

- Clasificacion zero-shot de eventos sonoros: definir clases con varias frases descriptivas en ingles, promediar sus embeddings y comparar con el embedding del clip; adecuado para taxonomias que cambian con frecuencia sin reentrenar.
- Curacion y filtrado de datasets de audio: ordenar o filtrar grandes colecciones de audio mediante consultas de texto, aprovechando que el modelo acepta cualquier duracion y produce un embedding por clip.
- Busqueda semantica de audio: indexar embeddings de una fonoteca y recuperar clips por descripcion textual, usando `encode_audio` y `encode_text` con normalizacion.
- Etiquetado automatico de archivos de sonido para archivos multimedia: generar etiquetas descriptivas sobre segmentos de hasta 30 s y agregar los resultados por segmento.
- Clasificadores downstream de bajo coste: usar los embeddings congelados como caracteristicas de entrada a un clasificador lineal o MLP entrenado con pocas muestras etiquetadas.
- Deteccion de similitud y duplicados de audio: comparar embeddings normalizados para agrupar clips acusticamente proximos en tareas de deduplicacion o clustering.
- Monitorizacion acustica: clasificar segmentos de audio de sensores o grabaciones continuas dividiendolos en ventanas de hasta 30 s.

## Benchmarks y rendimiento

| Benchmark | CLAP2-L (este modelo) | CLAP2-M | CLAP2-S | CLAP2-XS | CLAP2-XXS |
|---|---|---|---|---|---|
| Parametros | 340,1M | 152,8M | 103,9M | 48,3M | 27,3M |
| MAEB-30 (%) | 53,6 | 52,3 | 51,8 | 49,1 | 46,2 |
| HEAR-17 (%) | 81,9 | 81,4 | 81,8 | 80,6 | 79,1 |
| MSEB (%) | 30,3 | 29,4 | 29,8 | 27,6 | 28,0 |

MAEB-30 es la media sobre 30 tareas del Massive Audio Embedding Benchmark (clasificacion, clasificacion zero-shot, pair classification, clustering y retrieval en voz, musica y sonido). HEAR-17 es la media sobre 17 tareas HEAR (todas excepto Beehive y Maestro 5h). MSEB es la media sobre 62 puntuaciones MSEB en ingles. No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, los 340M parametros ocupan aproximadamente 1,4 GB de pesos; con activaciones y lotes pequenos, el consumo se situa en torno a 2-3 GB. Para lotes grandes o clips de 30 s, prever margen adicional.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes. El modelo no requiere GPUs de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas.
- Opciones de despliegue: OpenCLIP (`open_clip_torch>=4.2.1`) y Transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que estan orientadas a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada. El coste crece de forma cuadratica con la duracion del audio por el uso de atencion completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | MAEB-30 | HEAR-17 | Licencia |
|---|---|---|---|---|---|
| CLAP2-L (este) | 340,1M | hasta 30 s evaluado | 53,6 | 81,9 | Apache 2.0 |
| CLAP2-M | 152,8M | hasta 30 s evaluado | 52,3 | 81,4 | Apache 2.0 |
| CLAP2-S | 103,9M | hasta 30 s evaluado | 51,8 | 81,8 | Apache 2.0 |
| CLAP2-XS | 48,3M | hasta 30 s evaluado | 49,1 | 80,6 | Apache 2.0 |

No se dispone en la informacion proporcionada de comparativas con modelos de otros autores (por ejemplo, CLAP original de Microsoft o AudioCLIP); la comparativa se limita a los distintos tamanos de la propia familia CLAP2.

## Limitaciones y advertencias

- Texto unicamente en ingles: las descripciones, etiquetas y consultas deben redactarse en ingles; el corpus contiene voz en varios idiomas, pero la recuperacion texto-audio solo funciona en ingles.
- El tokenizador distingue mayusculas: los textos escritos integramente en mayusculas se tokenizan en piezas raras y puntuan peor; conviene normalizar a minusculas los textos de ese tipo o escribir en caja normal.
- Ventana de audio de 30 s: los benchmarks solo evaluan los primeros 30 s; para grabaciones largas hay que segmentar y agregar embeddings. El coste crece de forma cuadratica con la longitud por la atencion completa.
- Riesgo de alucinacion en el sentido de falsos positivos en clasificacion zero-shot: las etiquetas definidas con prompts pobres o etiquetas desnudas producen puntuaciones poco fiables; el autor recomienda frases completas y restar la media por clase.
- Sin capacidades generativas: no produce texto ni audio, solo embeddings; no es adecuado para transcripcion, sintesis ni dialogo.
- Licencia Apache 2.0: permite uso comercial, pero deben respetarse las condiciones de los datos de entrenamiento subyacentes y las obligaciones de atribucion.
- No se documentan sesgos especificos ni evaluaciones de robustez por dominio o idioma mas alla de los benchmarks citados.

## Enlaces

- Hugging Face: https://huggingface.co/laion/clap2-large-audioxl-s1B
- Paper: https://arxiv.org/abs/2611.11592
- Codigo: https://github.com/LAION-AI/clap2
- Pagina del proyecto: https://projects.laion.ai/clap2/
- Modelo M: https://huggingface.co/laion/clap2-medium-audioxl-s1B
- Modelo S: https://huggingface.co/laion/clap2-small-audioxl-s1B
- Modelo XS: https://huggingface.co/laion/clap2-xs-audioxl-s1B
- Modelo XXS: https://huggingface.co/laion/clap2-xxs-audioxl-s1B
- LAION: https://laion.ai/
- GitHub de LAION: https://github.com/LAION-AI
