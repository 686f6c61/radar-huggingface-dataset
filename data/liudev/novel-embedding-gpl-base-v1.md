# liudev/novel-embedding-gpl-base-v1

## Resumen

liudev/novel-embedding-gpl-base-v1 es un modelo de embeddings de frases (sentence transformer) afinado por el usuario liudev a partir del modelo chino BAAI/bge-base-zh-v1.5. Su funcion es proyectar frases y parrafos a un espacio vectorial denso de 768 dimensiones, con similitud coseno, para tareas de similitud semantica, busqueda semantica, mineria de parafrasis y agrupamiento (clustering). El modelo tiene 102.267.648 parametros (aproximadamente 102 millones) y una longitud maxima de secuencia declarada de 256 tokens.

El nombre y las etiquetas sugieren un entrenamiento con la tecnica GPL (Generative Pseudo-Labeling, arXiv:2010.02666), ademas del marco Sentence-BERT (arXiv:1908.10084). El dataset de entrenamiento declarado contiene 435.262 muestras con estructura de terna (anchor, sentence1, sentence2) y una etiqueta continua, y la funcion de perdida empleada es MarginMSELoss. Los ejemplos del widget y del dataset estan en chino y giran en torno a sinopsis de novelas (aventuras, artes marciales, clanes, tramas de fantasia), lo que apunta a un dominio de especializacion muy concreto.

Se trata de un modelo de nicho, con 143 descargas y 0 likes en el momento de la consulta, sin licencia declarada ni resultados de benchmarks publicados. Su relevancia es la de un afinamiento de dominio sobre una base solida en chino: util como referencia para equipos que construyan sistemas RAG o de recuperacion sobre corpus de ficcion o narrativa en chino, siempre que asuman la ausencia de garantias formales de licencia y de evaluacion publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (BertModel) + Pooling (modo cls) + Normalize |
| Parametros totales | 102.267.648 (aprox. 102 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens (maxima secuencia declarada) |
| Tipos de cuantizacion | no disponible (no se declaran cuantizaciones publicadas; al ser un modelo BERT de 102 M admite conversion a FP16, int8 y formatos GGUF/ONNX por herramientas externas) |
| Idiomas soportados | no disponible oficialmente; los ejemplos del widget y del dataset estan en chino, y el modelo base es especifico de chino |
| Licencia | no disponible (el modelo base BAAI/bge-base-zh-v1.5 es MIT, pero este afinamiento no declara licencia propia) |
| Formato de pesos | safetensors (repo con libreria sentence-transformers) |
| Dimension del embedding | 768 |
| Funcion de similitud | similitud coseno |
| Modalidad | texto |
| Perdida de entrenamiento | MarginMSELoss |
| Tamano del dataset | 435.262 muestras de entrenamiento |
| Tamano del repositorio | 47,7 GB |

## Arquitectura y entrenamiento

La arquitectura sigue el patron clasico de Sentence-Transformers: un encoder Transformer BERT que produce los embeddings de token (last_hidden_state), una capa de pooling en modo CLS que colapsa la secuencia a un vector unico de 768 dimensiones, y una capa de normalizacion final. El encoder se inicializa desde BAAI/bge-base-zh-v1.5, un modelo BERT-base chino ya optimizado para recuperacion. No hay cabezal de generacion ni decoder: el modelo solo produce representaciones vectoriales.

El entrenamiento se realizo sobre un dataset no nombrado de 435.262 muestras con columnas anchor, sentence1, sentence2 y label (valor continuo entre 0,02 y 0,84 en la muestra estadistica), usando MarginMSELoss, una perdida habitual en el afinamiento de embeddings que aprende a ordenar la similitud entre pares positivos y negativos. Las etiquetas de GPL en el nombre sugieren el uso de pseudo-etiquetado generativo para crear pares de entrenamiento, tecnica descrita en arXiv:2010.02666. Las longitudes tipicas de la muestra estadistica son: anchor de 8 a 25 tokens (media 15,5), sentence1 de 47 a 256 tokens (media 73,19) y sentence2 de 29 a 92 tokens (media 69,23). Esto indica un entrenamiento orientado a comparar frases cortas contra pasajes mas largos, tipico de un escenario de busqueda. No se documenta el numero total de tokens, la composicion exacta del dataset ni si hubo etapas adicionales de RLHF o DPO (poco habituales en modelos de embeddings).

## Capacidades

- Generacion de embeddings densos de frases y parrafos: cada entrada se mapea a un vector de 768 dimensiones normalizado, comparables mediante similitud coseno.
- Similitud semantica de texto (semantic textual similarity): calculo de puntuaciones de similitud entre pares de frases.
- Busqueda semantica: uso como recuperador en pipelines de RAG o de busqueda vectorial, comparando la consulta con pasajes indexados.
- Mineria de parafrasis: identificacion de frases con significado equivalente dentro de un corpus.
- Agrupamiento y clasificacion: los embeddings sirven como caracteristicas para clustering, deduplicacion o clasificacion con cabezales ligeros.
- Especializacion de dominio: afinado sobre sinopsis narrativas en chino, por lo que captura relaciones semanticas de tramas, personajes y eventos propios de ficcion.
- Compatibilidad con tooling estandar: soporte de text-embeddings-inference y endpoints_compatible, ademas de la libreria sentence-transformers.
- No es un modelo generativo: no produce texto, no soporta tool calling ni function calling, ni razonamiento multi-paso, ni capacidades de vision o audio.

## Casos de uso

- Recuperacion aumentada (RAG) sobre novelas o ficcion en chino: indexar capitulos y sinopsis como vectores de 768 dimensiones y recuperar los pasajes mas relevantes para una consulta, aprovechando el afinamiento en dominio narrativo.
- Busqueda semantica en plataformas de lectura: permitir que los usuarios busquen por argumento ("novelas donde el protagonista es traicionado por su clan") en lugar de por palabra clave exacta.
- Deduplicacion de contenidos: agrupar sinopsis o resumenes casi identicos dentro de un catalogo editorial usando la similitud coseno entre embeddings.
- Recomendacion de contenido: construir un sistema de vecinos mas cercanos sobre los embeddings para sugerir novelas con tramas similares a la que el usuario esta leyendo.
- Clasificacion y etiquetado automatico de tramas: entrenar un clasificador ligero sobre los embeddings para asignar generos, arquetipos o temas a textos narrativos.
- Moderacion y filtrado tematico de resumenes: usar las distancias entre embeddings para detectar contenido duplicado, spam o texto fuera de tematica antes de su publicacion.
- Mineria de parafrasis para evaluacion de resumenes: medir la similitud entre un resumen generado y su referencia, util como metrica auxiliar en pipelines de evaluacion.
- Construccion de datasets de entrenamiento: usar el modelo para filtrar y ordenar pares de frases por similitud antes de incorporarlos a un corpus de ajuste de otro modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM en FP32: aproximadamente 410 MB solo para los pesos (102 M parametros x 4 bytes); el consumo real con activaciones y batch es algo mayor.
- VRAM en FP16/BF16: aproximadamente 205 MB para los pesos, con calidad practicamente identica en tareas de similitud.
- VRAM en int8: aproximadamente 102 MB para los pesos, con una perdida minima esperada en embeddings de baja dimension.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o en CPU, dada la longitud maxima de 256 tokens y el tamano reducido del modelo.
- Opciones de despliegue: sentence-transformers (nativo), text-embeddings-inference (etiqueta declarada), endpoints de Hugging Face. Tambien es convertible a ONNX o a vLLM, aunque no se documenta soporte oficial en la model card.
- Latencia y throughput: no disponibles. Al ser un BERT-base con secuencias de 256 tokens como maximo, se espera un throughput alto por GPU, pero no hay cifras publicadas en la informacion disponible.
- Almacenamiento: el repositorio ocupa 47,7 GB, muy por encima de lo que requeririan los pesos del modelo (menos de 0,5 GB en FP32), lo que sugiere la presencia de multiples checkpoints o estados del optimizador. Conviene descargar solo los ficheros safetensors necesarios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liudev/novel-embedding-gpl-base-v1 | 102 M | 256 tokens | 768 | no disponible | Hugging Face (143 descargas) |
| BAAI/bge-base-zh-v1.5 | 102 M | 512 tokens | 768 | MIT | Hugging Face (modelo base) |
| BAAI/bge-m3 | 568 M | 8192 tokens | 1024 | MIT | Hugging Face |
| intfloat/multilingual-e5-base | 278 M | 512 tokens | 768 | MIT | Hugging Face |

Los datos de los tres modelos de referencia corresponden a lo que declaran habitualmente sus model cards publicas; no se han verificado en el marco de esta ficha. No se dispone de comparaciones de rendimiento (MTEB, C-MTEB ni similares) para el modelo objeto de esta ficha, por lo que no es posible afirmar si supera o no a su propio modelo base en tareas generales de recuperacion en chino.

## Limitaciones y advertencias

- Licencia no declarada: la model card no especifica licencia, lo que impide asumir permisos de uso comercial. Aunque el modelo base BAAI/bge-base-zh-v1.5 es MIT, la ausencia de una licencia explicita en el afinamiento es un riesgo legal para produccion.
- Sin resultados de benchmarks publicados: no hay evidencia cuantitativa (MTEB, C-MTEB, recuperacion, clustering) que respalde su calidad frente a alternativas genericas.
- Dominio muy restringido: el dataset y los ejemplos apuntan a sinopsis de novelas chinas. El rendimiento fuera de ese dominio narrativo (legal, medico, tecnico) es desconocido y probablemente inferior al de un modelo de proposito general.
- Contexto limitado a 256 tokens: los pasajes mas largos que el limite declarado requieren truncado o troceado, y el modelo base soporta hasta 512 tokens, por lo que este afinamiento reduce la ventana util.
- Sesgos no documentados: al no describir la composicion del dataset ni filtrarse, se desconoce que sesgos de genero, cultura o contenido puede haber absorbido de las novelas de entrenamiento.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos en similitud: dos tramas con vocabulario similar pueden puntuar alto aunque no sean equivalentes.
- Idiomas no declarados: aunque el modelo base y los ejemplos son en chino, no se confirma si el afinamiento conserva capacidades multilingues. No se debe asumir soporte de espanol.
- Uso como retrieval en produccion: al no haber evaluado la calidad de recuperacion, se recomienda validar en un conjunto propio antes de sustituir un modelo generico.
- Repositorio sobredimensionado: los 47,7 GB de tamano pueden complicar la descarga y el almacenamiento en entornos con restricciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liudev/novel-embedding-gpl-base-v1
- Modelo base: https://huggingface.co/BAAI/bge-base-zh-v1.5
- Perfil del autor: https://huggingface.co/liudev/models
- Documentacion de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de GPL, Generative Pseudo-Labeling (arXiv:2010.02666): https://arxiv.org/abs/2010.02666
- Modelos con la libreria sentence-transformers: https://huggingface.co/models?library=sentence-transformers
- Benchmark de modelos de embeddings (referencia externa): https://aimultiple.com/embedding-models
- Benchmark de modelos de embeddings open source (referencia externa): https://aimultiple.com/open-source-embedding-models
