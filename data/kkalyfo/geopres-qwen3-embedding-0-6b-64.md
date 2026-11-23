# kkalyfo/geopres-qwen3-embedding-0.6b-64

## Resumen

GeoPres projection: Qwen/Qwen3-Embedding-0.6B -> 64 dimensiones es un artefacto de reduccion de dimensionalidad publicado por el usuario kkalyfo bajo el identificador `kkalyfo/geopres-qwen3-embedding-0.6b-64`. No es un modelo de lenguaje ni un modelo de embeddings autonomo, sino una matriz de proyeccion lineal `W` de forma 64 x 1024 entrenada con la libreria GeoPres para preservar las distancias euclideas por pares entre los embeddings producidos por `Qwen/Qwen3-Embedding-0.6B`. El backbone no se incluye en el repositorio: permanece congelado y el artefacto solo contiene el mapa lineal.

El objetivo es reducir el coste de almacenamiento y de computo en busquedas vectoriales comprimiendo embeddings de 1024 a 64 dimensiones (una reduccion de 16x en el tamano del vector), manteniendo la geometria del espacio original. La inferencia consiste en una unica multiplicacion de matrices, lo que permite aplicarla tanto en el momento de generar el embedding como a posteriori sobre vectores ya calculados y almacenados en una base de datos vectorial.

La relevancia actual radica en que la reduccion post-hoc de dimensionalidad es una tecnica habitual para abaratar indices ANN (HNSW, IVF) y reducir el ancho de banda en servicios de recuperacion, y este artefacto la empaqueta como un objeto reutilizable independiente del backbone. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su licencia no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mapa lineal (matriz de proyeccion) 64 x 1024; backbone subyacente Qwen/Qwen3-Embedding-0.6B (no incluido) |
| Parametros totales | 65.536 valores en la matriz de proyeccion (64 x 1024); el backbone Qwen3-Embedding-0.6B no forma parte del repositorio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del backbone Qwen3-Embedding-0.6B, no declarada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (la model card solo indica `library_name: geopres`; el tamano del repo es 0.0 GB) |

## Arquitectura y entrenamiento

El artefacto es una proyeccion lineal aprendida que transforma un vector de 1024 dimensiones en uno de 64. Segun la model card, la matriz `W` se entreno con GeoPres para preservar las distancias euclideas por pares entre los embeddings de `Qwen/Qwen3-Embedding-0.6B`, es decir, el criterio de optimizacion es de tipo geometria-preservante (distance preservation) y no una simple PCA. El backbone esta congelado y no se incluye en el repositorio; la inferencia se reduce a una multiplicacion de matrices.

El metodo se describe en el articulo "On Post-Hoc Dimensionality Reduction of Text Embeddings" (EACL 2027), enlazado desde la model card. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de ajuste adicionales. La model card advierte que la entrada debe ser embeddings de `Qwen/Qwen3-Embedding-0.6B` calculados con el mismo pooling, normalizacion y prefijos que los datos de entrenamiento, lo que implica que el artefacto no es transferible a otros modelos de embeddings sin reentrenamiento.

## Capacidades

- Reduccion de dimensionalidad de embeddings: transforma vectores de 1024 a 64 dimensiones mediante una unica multiplicacion de matrices.
- Preservacion de distancias euclideas por pares, segun el criterio de entrenamiento declarado (GeoPres).
- Dos modos de uso: pipeline completo (`GeoPres.from_pretrained(...).embed([...])`), que codifica texto y reduce en un paso, y proyeccion aislada (`Projection.from_pretrained(...).project(embeddings)`), que reduce vectores ya calculados sin descargar el backbone.
- Integracion con embeddings procedentes de TEI, bases de datos vectoriales o trabajos por lotes, segun la model card.
- No realiza generacion de texto, razonamiento, codigo, matematicas, vision ni tool calling: no es un modelo generativo.
- No se declaran capacidades multilingues propias; dependen exclusivamente del backbone Qwen3-Embedding-0.6B.

## Casos de uso

- Compresion de indices vectoriales: aplicar `project()` sobre los embeddings ya almacenados en una base de datos vectorial para pasar de 1024 a 64 dimensiones, reduciendo 16x el tamano del indice y el coste de memoria en estructuras HNSW o IVF.
- Busqueda semantica de bajo coste: usar la proyeccion en el momento de la consulta y de la indexacion para acelerar el calculo de distancias en recuperacion a gran escala, a costa de una perdida de calidad que debe medirse con el propio corpus.
- Reduccion de ancho de banda en servicios de embeddings: si los vectores se generan en un servicio TEI y se envian a otro sistema, proyectarlos antes del transporte reduce el trafico en un orden de magnitud.
- Pipelines por lotes: recalcular o reindexar colecciones existentes sin volver a ejecutar el backbone, ya que el modo `Projection` no descarga el modelo de 0.6B.
- Prototipado y experimentacion: comparar la calidad de recuperacion con 64 dimensiones frente a las 1024 originales antes de comprometerse con un rediseno del indice.
- Despliegue en entornos con VRAM o RAM limitadas: al ser una matriz de 64 x 1024, la proyeccion puede ejecutarse en CPU sin GPU, lo que facilita su inclusion en funciones serverless o contenedores ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recall, nDCG, MTEB ni comparaciones numericas con otras tecnicas de reduccion (PCA, UMAP, etc.).

## Requisitos de hardware

- VRAM para la proyeccion: practicamente nula; la matriz ocupa 65.536 valores (unos 256 KB en float32 y unos 128 KB en float16).
- VRAM para el pipeline completo: la determina el backbone Qwen3-Embedding-0.6B, no incluido en este repositorio; no se dispone de cifras en la informacion proporcionada.
- GPU recomendadas: no aplica para la proyeccion; cualquier CPU sirve. Para el backbone habria que consultar la model card de Qwen/Qwen3-Embedding-0.6B.
- Cabe en cualquier GPU consumer, e incluso en CPU, porque el artefacto es solo la matriz.
- Opciones de despliegue: la libreria `geopres` (modos `GeoPres` y `Projection`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un mapa lineal.
- Latencia y throughput: no disponibles; al ser una multiplicacion de matrices, el coste es despreciable frente a la codificacion con el backbone.

## Comparativa con modelos similares

| Alternativa | Tipo | Dimension de salida | Requiere backbone | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kkalyfo/geopres-qwen3-embedding-0.6b-64 | Proyeccion lineal entrenada (GeoPres) | 64 | Si (Qwen3-Embedding-0.6B) | no disponible | Hugging Face, 0 descargas |
| PCA post-hoc sobre los mismos embeddings | Proyeccion lineal no supervisada | Configurable | Si | N/A | Implementacion propia |
| Qwen/Qwen3-Embedding-0.6B sin reducir | Modelo de embeddings completo | 1024 (segun backbone) | No | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El artefacto solo es valido para embeddings de `Qwen/Qwen3-Embedding-0.6B` calculados con el mismo pooling, normalizacion y prefijos que los datos de entrenamiento; usarlo con otro modelo o con otra configuracion de codificacion invalida la preservacion de distancias.
- La reduccion de 1024 a 64 dimensiones implica una perdida de informacion inevitable; la model card no cuantifica la degradacion en tareas de recuperacion.
- La licencia no esta declarada, por lo que no puede asumirse uso comercial sin consultar al autor.
- No se declaran idiomas soportados; la cobertura linguistica depende del backbone y no esta documentada en esta ficha.
- Riesgo de sesgos y alucinacion: no aplica directamente al ser una transformacion lineal, pero los sesgos del backbone Qwen3-Embedding-0.6B se heredan en la geometria proyectada.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado en noviembre de 2026, sin historial de uso que permita validar su robustez en produccion.
- El tamano del repositorio es de 0.0 GB, coherente con una matriz pequena, pero no se detalla el formato exacto de los pesos.
- No hay resultados de benchmarks publicados que respalden las afirmaciones de preservacion de distancias mas alla de la descripcion del metodo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkalyfo/geopres-qwen3-embedding-0.6b-64
- Backbone: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Repositorio de GeoPres: https://github.com/konstantinoskalyfommatos/geopres
- Paper (EACL 2027): https://openreview.net/forum?id=vAWo3CIzqp
