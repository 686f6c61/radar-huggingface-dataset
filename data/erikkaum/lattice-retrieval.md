# erikkaum/lattice-retrieval

## Resumen

`lattice-retrieval` es un modelo de embeddings estáticos para recuperación de información en inglés, desarrollado por Erik Kaunismäki. A diferencia de los modelos basados en transformadores, este modelo es una única tabla de embeddings de tokens de 30.522 × 1.024 dimensiones, sin capas de atención ni representaciones contextuales. La codificación consiste en tokenizar, buscar cada token en la tabla, hacer media ponderada (mean pooling) y normalizar L2. Este diseño permite alcanzar velocidades de procesamiento muy altas: con el runtime en Rust incluido en el repositorio, puede incrustar los 6,4 millones de artículos de la Wikipedia en inglés en 7 minutos y 26 segundos en un MacBook Air con chip M2 de 8 núcleos.

El modelo fue preentrenado con aproximadamente 660 millones de pares consulta-documento y posteriormente afinado con negativos duros (hard negatives), superando en 0,0415 puntos de NDCG@10 al anterior mejor modelo estático en el benchmark decontaminado BEIR. Su licencia MIT y su tamaño reducido (125 MB en fp32, 7,94 MB en int4 con 512 dimensiones) lo convierten en una opción atractiva para despliegues en entornos con recursos limitados, como CPU, dispositivos edge o pipelines de alta concurrencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tabla de embeddings estáticos (bag-of-token-vectors) con mean pooling y normalizacion L2. Sin capas transformer ni atencion. |
| Parametros totales | 31.254.528 (tabla de 30.522 × 1.024) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: procesa cada token de forma independiente, sin ventana de contexto. El numero maximo de tokens por secuencia depende del tokenizador (no especificado). |
| Tipos de cuantizacion | fp32 (canonico), int8 per-dim, int8 per-row, int4 per-dim, int4 per-row, int2 (post-training, via CLI del repositorio) |
| Idiomas soportados | ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32). El repositorio incluye una herramienta para generar versiones cuantizadas y truncadas en otros formatos. |

## Arquitectura y entrenamiento

El modelo es una tabla de embeddings estáticos de 30.522 filas (una por token del vocabulario) y 1.024 columnas. Durante la inferencia, cada token de la secuencia de entrada se convierte en su vector correspondiente mediante una consulta directa a la tabla; posteriormente se calcula la media de todos los vectores y se normaliza L2. No existe ninguna capa de atención, ni representaciones contextuales, ni interacción entre tokens. Esta arquitectura elimina por completo el coste computacional de los transformadores y permite una latencia extremadamente baja.

El entrenamiento se realizó en dos fases. Primero, un preentrenamiento con aproximadamente 660 millones de pares consulta-documento, ocho veces más datos que el modelo estático de referencia `static-retrieval-mrl-en-v1`. Después, un afinado con negativos duros (hard negatives). Los datos proceden de los conjuntos `lightonai/embeddings-pre-training-curated` y `lightonai/embeddings-fine-tuning`, publicados por LightOn en su release DenseOn/LateOn. El modelo se entrenó con objetivos Matryoshka, lo que permite truncar las dimensiones de salida a 512, 256, 128, 64 o 32 manteniendo una calidad razonable. Además, se realizaron experimentos de cuantización post-entrenamiento (int8, int4 e int2) que demuestran una pérdida mínima de rendimiento incluso con 512 dimensiones en int4.

## Capacidades

- Generacion de embeddings de frases y documentos para similitud semantica y recuperacion de informacion.
- Recuperacion por similitud coseno: los embeddings estan normalizados L2, por lo que la similitud coseno equivale al producto escalar.
- Truncacion Matryoshka: se pueden usar solo las primeras 512, 256, 128, 64 o 32 dimensiones sin necesidad de reentrenar, reduciendo el almacenamiento y acelerando la inferencia.
- Cuantizacion post-entrenamiento: soporta int8, int4 e int2 con perdida de calidad minima en la mayoria de configuraciones.
- Velocidad de procesamiento muy alta: 7,55 millones de tokens por segundo en fp32 y hasta 9,43 millones en int4 con 128 dimensiones (medido en Apple M2 con 12 workers).
- Integracion con Sentence Transformers: se puede cargar con `SentenceTransformer("erikkaum/lattice-retrieval")` y usar la API estándar de `encode()`.
- Runtime Rust dedicado en el repositorio para despliegue de alto rendimiento sin dependencias de Python.

## Casos de uso

- Busqueda semantica en corpus grandes: con la velocidad del runtime Rust, se pueden indexar millones de documentos en minutos. Por ejemplo, incrustar toda la Wikipedia en ingles en 7 minutos y 26 segundos en un portatil con chip M2, lo que permite construir un indice de busqueda completo sin infraestructura GPU.
- Sistemas RAG de baja latencia: al ser un modelo estatico, la generacion de embeddings de consultas es casi instantanea. Puede servir como recuperador en pipelines de generacion aumentada por recuperacion donde la latencia sea critica, combinado con un LLM generativo.
- Deduplicacion y deteccion de duplicados: al generar embeddings de documentos y comparar similitudes coseno, se pueden identificar articulos, noticias o registros duplicados en grandes colecciones, incluso con variaciones de redaccion.
- Clasificacion de textos con embeddings: los vectores generados pueden alimentar clasificadores clasicos (regresion logistica, SVM, etc.) para tareas como categorizacion de tickets, deteccion de spam o analisis de sentimiento, aprovechando la rapidez de generacion en lotes.
- Agrupacion (clustering) de documentos: los embeddings se pueden usar con algoritmos como k-means o HDBSCAN para organizar grandes colecciones de texto en temas, por ejemplo en sistemas de gestion documental o analisis de encuestas abiertas.
- Filtrado y moderacion de contenido: combinando embeddings de frases con umbrales de similitud, se pueden detectar contenidos cercanos a patrones no deseados (discurso de odio, spam, etc.) de forma rapida y con bajo coste computacional.
- Indexacion de codigo fuente: aunque el modelo esta entrenado principalmente para texto general en ingles, su tokenizacion basica permite generar embeddings de fragmentos de codigo para busqueda semantica en repositorios, siempre que el codigo use vocabulario ingles.

## Benchmarks y rendimiento

Los resultados publicados se centran en el benchmark BEIR decontaminado (NDCG@10) y en la velocidad de procesamiento. No se proporcionan resultados en MMLU, HumanEval u otros benchmarks de generacion, ya que este modelo no genera texto.

| Modelo | Pares de preentrenamiento | Dimensiones | BEIR NDCG@10 (decontaminado) |
|---|---|---|---|
| `static-retrieval-mrl-en-v1` | ~80M | 1.024 | 0.4334 |
| `lattice-retrieval` (fp32) | ~660M | 1.024 | **0.4749** |

La model card tambien reporta el rendimiento de distintas configuraciones de truncado y cuantizacion, medido sobre un corpus de 5.000 articulos con 12 workers en un Apple M2 de 8 nucleos:

| Dimensiones | Cuantizacion | Peso del modelo | BEIR NDCG@10 | Throughput |
|---|---:|---:|---:|---:|
| 1.024 | fp32 | 125,02 MB | **0.4749** | 7,55 M tokens/s |
| 1.024 | int8 per-dim | 31,26 MB | 0.4747 | 8,43 M tokens/s |
| 512 | int8 per-dim | 15,63 MB | 0.4700 | 9,05 M tokens/s |
| 512 | int4 per-row | 7,94 MB | 0.4697 | 8,76 M tokens/s |
| 256 | int8 per-dim | 7,82 MB | 0.4624 | 9,38 M tokens/s |
| 128 | int4 per-dim | 1,95 MB | 0.4312 | 9,43 M tokens/s |

Los valores de throughput deben interpretarse como comparativos entre variantes, no como mediciones universales de hardware.

## Requisitos de hardware

- El modelo es extremadamente ligero: 125 MB en fp32, 31 MB en int8, 7,94 MB en int4 con 512 dimensiones. No requiere GPU para inferencia.
- Puede ejecutarse en CPU de forma eficiente: el benchmark oficial se realizo en un MacBook Air con chip M2 de 8 nucleos, incrustando toda la Wikipedia en ingles en 7 minutos y 26 segundos.
- VRAM estimada: no aplica para CPU. Si se desea ejecutar en GPU, el uso de VRAM seria inferior a 200 MB en fp32, pero no es necesario ni recomendado dado el coste de transferencia.
- GPUs recomendadas: ninguna en particular; cualquier GPU moderna (incluso integradas) es suficiente si se opta por aceleracion por hardware.
- Opciones de despliegue: runtime Rust puro incluido en el repositorio `ErikKaum/lattice` (con herramienta `slicer` para cuantizar y truncar), integracion con Sentence Transformers (Python), o exportacion a otros formatos si se desea.
- Latencia: del orden de microsegundos por token en CPU moderna. El throughput medido alcanza 9,43 millones de tokens por segundo en la configuracion mas ligera (128 dims, int4).

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Dimensiones | BEIR NDCG@10 (decont.) | Licencia | Formato |
|---|---|---|---|---|---|---|
| `lattice-retrieval` | Tabla estatica | 31,25 M | 1.024 (truncable) | 0.4749 | MIT | safetensors |
| `static-retrieval-mrl-en-v1` | Tabla estatica | no disponible | 1.024 (truncable) | 0.4334 | no disponible | safetensors |
| `all-MiniLM-L6-v2` (referencia) | Transformer (6 capas) | 22,7 M | 384 | no comparable (otro benchmark) | Apache-2.0 | safetensors |

La comparativa directa solo es posible con `static-retrieval-mrl-en-v1`, que es el anterior mejor modelo estatico y la base sobre la que se construyo Lattice. `lattice-retrieval` supera a su predecesor en 0,0415 puntos de NDCG@10 con ocho veces mas datos de preentrenamiento. Frente a un transformer pequeno como `all-MiniLM-L6-v2`, Lattice ofrece mayor velocidad y menor huella de memoria, pero no captura el contexto ni el orden de las palabras, por lo que no es un sustituto directo en tareas que requieran comprension semantica fina.

## Limitaciones y advertencias

- Es un modelo de bolsa de tokens (bag-of-token-vectors): no contextualiza los tokens y es sustancialmente menos capaz que un recuperador transformer en tareas que dependen del orden de las palabras, la polisemia, el significado composicional y las distinciones semanticas finas.
- No debe presentarse como un reemplazo directo de un modelo transformer en calidad. La model card del autor lo advierte explicitamente.
- Solo soporta ingles. No hay datos sobre rendimiento en otros idiomas.
- No genera texto: es exclusivamente un modelo de embeddings.
- La tokenizacion es fija y limitada a 30.522 tokens; el vocabulario no se especifica en la informacion disponible, por lo que puede tener cobertura limitada para terminologia muy especializada o nombres propios poco frecuentes.
- La cuantizacion int2 y las truncaciones por debajo de 128 dimensiones pueden degradar significativamente la calidad (el NDCG@10 baja de 0,43 en la configuracion de 128 dims int4).
- El modelo fue creado en agosto de 2026 y tiene 0 descargas en el momento de la consulta; es un proyecto reciente y con poca adopcion, por lo que puede haber errores no detectados en la implementacion del runtime Rust.
- Aunque la licencia es MIT (permite uso comercial), los datos de entrenamiento proceden de LightOn (DenseOn/LateOn) y conviene revisar los terminos de esos datasets para usos comerciales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erikkaum/lattice-retrieval
- Blog post de Lattice: https://huggingface.co/blog/erikkaum/lattice-blog
- Repositorio GitHub: https://github.com/ErikKaum/lattice
- README del repositorio: https://github.com/ErikKaum/lattice/blob/main/README.md
- Publicacion en X (Twitter) del autor: https://x.com/ErikKaum/status/2085722111650222174
- Modelo base de referencia: https://huggingface.co/sentence-transformers/static-retrieval-mrl-en-v1
- Datasets de entrenamiento: https://huggingface.co/datasets/lightonai/embeddings-pre-training-curated y https://huggingface.co/datasets/lightonai/embeddings-fine-tuning
