# kkalyfo/geopres-jina-embeddings-v2-small-en-256

## Resumen

GeoPres projection: jina-embeddings-v2-small-en -> 256 dimensiones es un artefacto de reduccion de dimensionalidad publicado por el usuario kkalyfo bajo el identificador `kkalyfo/geopres-jina-embeddings-v2-small-en-256`. No es un modelo de lenguaje ni un encoder de texto propiamente dicho: es un mapa lineal `W` de forma 256 x 512, entrenado con la libreria GeoPres para proyectar embeddings de 512 dimensiones generados por `jinaai/jina-embeddings-v2-small-en` a un espacio de 256 dimensiones preservando las distancias euclideas por pares. El backbone original no se incluye en el repositorio y permanece congelado durante la inferencia.

El problema que resuelve es el coste de almacenamiento y computo asociado a indices vectoriales de alta dimensionalidad: reducir de 512 a 256 dimensiones implica dividir por dos el tamano del indice y el coste de las busquedas por similitud, manteniendo (segun el autor) la estructura geometrica de las representaciones originales. La aproximacion es puramente post-hoc: no requiere reentrenar el encoder ni modificar el pipeline de generacion de embeddings, solo aplicar una multiplicacion matricial sobre vectores ya calculados.

La relevancia del artefacto es acotada y muy especifica: se publica como material complementario del paper "On Post-Hoc Dimensionality Reduction of Text Embeddings" (EACL 2027), el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo es de 0.0 GB (practicamente solo la matriz y metadatos). No dispone de model card con especificaciones de entrenamiento detalladas (numero de pares, dataset, criterio de parada) ni de resultados de evaluacion publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mapa lineal (proyeccion matricial) `W` de 256 x 512; no es una red neuronal profunda ni un transformer |
| Parametros totales | 131.072 (256 x 512 pesos del mapa lineal); el backbone no se incluye |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo generativo; hereda la ventana del backbone jina-embeddings-v2-small-en, no declarada en la informacion) |
| Tipos de cuantizacion | no disponible (la matriz se usa en el formato en que se distribuye; no se documentan variantes) |
| Idiomas soportados | no disponibles (depende del backbone jina-embeddings-v2-small-en, orientado a ingles segun su nombre) |
| Licencia | no disponible |
| Formato de pesos | no disponible de forma explicita; se carga mediante `GeoPres.from_pretrained` y `Projection.from_pretrained` de la libreria `geopres` |

## Arquitectura y entrenamiento

El artefacto consiste en una unica transformacion lineal afin (matriz `W` de 256 x 512) que mapea embeddings de 512 dimensiones a 256 dimensiones. El criterio de entrenamiento declarado es la preservacion de distancias euclideas por pares entre los embeddings del backbone `jinaai/jina-embeddings-v2-small-en`. No se especifica en la model card el algoritmo exacto de optimizacion, la funcion de perdida concreta (aunque el objetivo es preservar distancias, lo que sugiere minimos cuadrados sobre pares o una variante tipo PCA supervisado por distancias), el numero de pares de entrenamiento, el corpus utilizado ni si hubo regularizacion.

El backbone esta congelado y no se incluye en el repositorio: la inferencia se reduce a una multiplicacion matricial sobre vectores ya calculados por el encoder original. Esto implica que la calidad de la proyeccion depende enteramente de que los embeddings de entrada se hayan generado con el mismo pooling, normalizacion y prefijos que los datos de entrenamiento, tal como advierte el autor. No se documentan innovaciones adicionales como decodificacion especulativa, atencion lineal ni tecnicas de cuantizacion.

## Capacidades

- Reduccion de dimensionalidad de embeddings: proyecta vectores de 512 a 256 dimensiones mediante una multiplicacion matricial.
- Preservacion de distancias euclideas por pares, segun el criterio declarado por el autor.
- Dos modos de uso: encoding completo con `GeoPres.from_pretrained(...).embed([...])` o proyeccion de embeddings ya calculados con `Projection.from_pretrained(...).project(embeddings)`.
- Modo de solo proyeccion sin descarga del backbone, apto para pipelines donde los embeddings ya existen (TEI, base de datos vectorial, jobs por lotes).
- No genera texto, no razona, no ejecuta codigo, no soporta tool calling, no tiene modo thinking ni capacidades multimodales.
- No se documentan capacidades multilingues propias; hereda las del backbone, no declaradas.

## Casos de uso

- Compresion de indices vectoriales en produccion: si ya se opera un indice con embeddings de `jina-embeddings-v2-small-en` a 512 dimensiones, aplicar la proyeccion reduce el almacenamiento a la mitad y acelera las busquedas por similitud, sin reindexar desde cero ni reencodificar el corpus.
- Reduccion de coste en bases de datos vectoriales: en sistemas como Qdrant, Milvus o pgvector, la mitad de dimensiones implica menor uso de RAM y menor latencia por consulta, manteniendo (segun el autor) la geometria del espacio original.
- Pipelines de retrieval con embeddings precalculados: cuando los embeddings se generan en un servicio TEI o en un job batch, el modo `Projection` permite reducir dimensiones a posteriori sin volver a ejecutar el encoder.
- Experimentacion academica sobre reduccion post-hoc: util como baseline reproducible para comparar con PCA, UMAP o autoencoders en tareas de recuperacion y clustering, dado que el paper asociado (EACL 2027) define el marco.
- Deduplicacion y clustering a escala: al reducir dimensiones se abaratan las comparaciones por pares y el entrenamiento de modelos de clustering sobre los vectores proyectados.
- Despliegue en entornos con memoria limitada: la matriz ocupa unos 131.072 parametros, por lo que la proyeccion en si misma cabe en cualquier CPU y solo requiere el backbone si se usa el modo `embed`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recuperacion (Recall@k, nDCG, MRR), de preservacion de distancias (correlacion de Pearson/Spearman entre distancias originales y proyectadas) ni comparaciones con PCA u otros metodos de reduccion.

## Requisitos de hardware

- La proyeccion en si misma es una multiplicacion matricial de 256 x 512: requiere ~0,5 MB en float32 (131.072 parametros x 4 bytes) y se ejecuta en CPU sin GPU.
- El modo `embed` requiere cargar el backbone `jinaai/jina-embeddings-v2-small-en` (no incluido en este repo), cuyos requisitos de VRAM no se detallan en la informacion disponible.
- GPU recomendadas: no aplica para la proyeccion; para el backbone, no disponible en la informacion proporcionada.
- Cabe en cualquier GPU consumer e incluso en CPU para el modo `Projection`; para el modo `embed` depende del backbone.
- Opciones de despliegue: libreria `geopres` (unica via documentada); no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo.
- Latencia y throughput: no disponibles; al ser una multiplicacion matricial, la latencia sera despreciable frente al coste de generar los embeddings originales.

## Comparativa con modelos similares

| Artefacto | Tipo | Dimension de entrada | Dimension de salida | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kkalyfo/geopres-jina-embeddings-v2-small-en-256 | Proyeccion lineal post-hoc | 512 | 256 | 131.072 | no disponible | Hugging Face, 0 descargas |
| PCA sobre embeddings de jina-embeddings-v2-small-en | Proyeccion lineal estadistica | 512 | 256 | 131.072 | no aplica (metodo) | Implementable con scikit-learn |
| jinaai/jina-embeddings-v2-small-en (backbone) | Encoder transformer | texto | 512 | no disponible en la informacion | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo acepta embeddings generados por `jinaai/jina-embeddings-v2-small-en` con el mismo pooling, normalizacion y prefijos que los datos de entrenamiento; cualquier desviacion invalida la proyeccion.
- No es un modelo autonomo: sin el backbone no puede codificar texto, solo proyectar vectores existentes.
- Licencia no declarada: no se puede confirmar el uso comercial sin consultar al autor o el repositorio.
- Sin resultados de evaluacion publicados: no hay evidencia cuantitativa de la preservacion de distancias ni del impacto en tareas downstream (retrieval, clasificacion, clustering).
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria ni senales de mantenimiento.
- Riesgo de perdida de informacion inherente a cualquier reduccion de 512 a 256 dimensiones; el grado de degradacion en tareas concretas no esta documentado.
- Idiomas no declarados: el nombre del backbone sugiere orientacion a ingles, pero no se confirma en la informacion.
- Sin sesgos documentados, pero al heredar el backbone puede arrastrar los sesgos del corpus de entrenamiento de este, no especificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkalyfo/geopres-jina-embeddings-v2-small-en-256
- Backbone: https://huggingface.co/jinaai/jina-embeddings-v2-small-en
- Repositorio GeoPres: https://github.com/konstantinoskalyfommatos/geopres
- Paper: https://openreview.net/forum?id=vAWo3CIzqp (On Post-Hoc Dimensionality Reduction of Text Embeddings, EACL 2027)
