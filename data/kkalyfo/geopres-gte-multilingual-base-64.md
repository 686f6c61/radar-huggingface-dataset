# kkalyfo/geopres-gte-multilingual-base-64

## Resumen

GeoPres projection: Alibaba-NLP/gte-multilingual-base -> 64 dimensiones es un artefacto de reduccion de dimensionalidad publicado por el usuario kkalyfo. No es un modelo de lenguaje ni un encoder independiente, sino una matriz lineal `W` de 64 x 768 entrenada con la libreria GeoPres para proyectar embeddings de 768 dimensiones generados por el backbone `Alibaba-NLP/gte-multilingual-base` a un espacio de 64 dimensiones, preservando las distancias euclideas por pares entre embeddings.

El problema que resuelve es el coste de almacenamiento y computo asociado a vectores de embedding de alta dimension en sistemas de recuperacion, busqueda semantica y bases de datos vectoriales. Al reducir de 768 a 64 dimensiones se obtiene una compresion de 12x en el tamano de los vectores, manteniendo la estructura geometrica del espacio original segun el criterio de preservacion de distancias que utiliza GeoPres.

La relevancia del artefacto es acotada y muy especifica: solo es util para quien ya utilice el backbone `gte-multilingual-base` y quiera reducir sus embeddings a posteriori, sin reentrenar ni volver a codificar. El backbone permanece congelado y no se incluye en el repositorio; la inferencia consiste en una unica multiplicacion de matrices. El trabajo subyacente se describe en el paper "On Post-Hoc Dimensionality Reduction of Text Embeddings" (EACL 2027).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyeccion lineal (matriz W de 64 x 768) sobre embeddings de un transformer encoder congelado |
| Parametros totales | 49.152 (64 x 768) en la matriz de proyeccion; el backbone no se incluye |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del backbone `gte-multilingual-base`, no declarada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredados del backbone multilingue, no declarados) |
| Licencia | no disponible |
| Formato de pesos | no disponible (pesos gestionados por la libreria `geopres`; el repositorio ocupa 0.0 GB) |

## Arquitectura y entrenamiento

El artefacto es una transformacion lineal post-hoc: una matriz `W` de dimensiones 64 x 768 que se aplica sobre embeddings de 768 dimensiones producidos por `Alibaba-NLP/gte-multilingual-base`. No hay atencion, ni capas no lineales, ni parametros del backbone entrenados; el encoder subyacente se mantiene congelado y no forma parte del repositorio. La inferencia se reduce a una multiplicacion de matrices, lo que implica un coste computacional despreciable frente al de codificar texto con el backbone.

El entrenamiento se realizo con la libreria GeoPres, cuyo objetivo es preservar las distancias euclideas por pares entre los embeddings originales y sus proyecciones reducidas. La model card no detalla el volumen de datos de entrenamiento, la composicion del corpus, la funcion de perdida exacta ni si se aplicaron tecnicas de regularizacion. El metodo se documenta en el paper "On Post-Hoc Dimensionality Reduction of Text Embeddings" (EACL 2027), enlazado desde la model card.

## Capacidades

- Reduccion de dimensionalidad de embeddings: transforma vectores de 768 dimensiones de `gte-multilingual-base` en vectores de 64 dimensiones preservando distancias euclideas por pares.
- Proyeccion de embeddings preexistentes: permite proyectar lotes de vectores ya calculados (por ejemplo, procedentes de TEI, una base de datos vectorial o un proceso batch) sin volver a codificar texto ni descargar el backbone.
- Codificacion y reduccion en un solo paso: mediante `GeoPres.from_pretrained(...).embed([...])` se obtiene directamente la salida de 64 dimensiones a partir de texto.
- Integracion con la libreria `geopres`: expone las clases `GeoPres` y `Projection` para los dos flujos de uso.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni comportamiento de agente: es exclusivamente un modulo de post-procesado de embeddings.

## Casos de uso

- Compresion de indices vectoriales: reducir los embeddings almacenados de 768 a 64 dimensiones disminuye el espacio en disco y en memoria de un indice de busqueda semantica en un factor de 12x, lo que permite alojar corpus mayores en la misma infraestructura.
- Busqueda semantica de baja latencia: al operar con vectores de 64 dimensiones, el calculo de similitud y el recorrido del indice son mas rapidos, adecuado para servicios con requisitos estrictos de latencia por consulta.
- Deduplicacion y clustering de documentos: la preservacion de distancias euclideas permite agrupar textos similares en el espacio reducido con algoritmos como k-means o DBSCAN, con menor coste por punto.
- Proyeccion de embeddings ya generados en pipelines existentes: si el equipo ya dispone de un lote de vectores de `gte-multilingual-base` calculados con TEI o un job batch, la clase `Projection` los reduce sin reencodificar ni descargar el backbone.
- Sistemas con memoria limitada en el borde: en despliegues donde el almacenamiento de vectores es el cuello de botella, 64 dimensiones por documento reducen drasticamente el footprint frente a 768.
- Experimentacion con recuperacion de bajo coste: util para prototipar sistemas RAG o de recomendacion donde se prioriza velocidad y economia de almacenamiento sobre la maxima calidad de recuperacion, comparando la perdida de rendimiento frente al espacio completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para la proyeccion: practicamente nula; la matriz de 64 x 768 ocupa unos 49.152 parametros, es decir, menos de 0,2 MB en fp32.
- VRAM para el backbone: no declarada en la model card; depende de `Alibaba-NLP/gte-multilingual-base` (encoder de 768 dimensiones), que no se incluye en el repositorio.
- GPU recomendadas: no disponible para el backbone; la proyeccion en si puede ejecutarse en CPU sin problema.
- Cabe en GPU de consumo: la proyeccion si, en cualquier GPU o incluso en CPU; el backbone depende de sus propios requisitos, no especificados aqui.
- Opciones de despliegue: libreria `geopres` (clases `GeoPres` y `Projection`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modulo de proyeccion.
- Latencia y throughput: no disponibles; al ser una unica multiplicacion de matrices, el coste es despreciable frente a la codificacion con el backbone.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension de salida | Backbone requerido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kkalyfo/geopres-gte-multilingual-base-64 | Proyeccion lineal post-hoc | 64 | gte-multilingual-base (congelado) | no disponible | Hugging Face |
| Alibaba-NLP/gte-multilingual-base | Encoder de embeddings | 768 | ninguno | no disponible | Hugging Face |
| PCA o reduccion aleatoria sobre embeddings | Proyeccion estadistica | configurable | cualquiera | no aplica | implementacion propia |

La comparativa se limita al backbone de origen y a alternativas genericas de reduccion de dimensionalidad, ya que no se dispone de datos sobre otras proyecciones GeoPres publicadas ni sobre su rendimiento relativo.

## Limitaciones y advertencias

- Dependencia estricta del backbone: la entrada debe ser embeddings de `Alibaba-NLP/gte-multilingual-base` calculados con el mismo pooling, normalizacion y prefijos que los datos de entrenamiento; cualquier otra fuente produce proyecciones invalidas.
- Perdida de informacion irreversible: la reduccion de 768 a 64 dimensiones descarta informacion; no se documenta la magnitud de la perdida en tareas de recuperacion.
- Licencia no disponible: no se declara licencia, lo que impide determinar si el uso comercial esta permitido; conviene contactar con el autor antes de usarlo en produccion.
- Idiomas no declarados: aunque el backbone es multilingue, la model card no especifica que idiomas cubre la proyeccion ni si el entrenamiento fue equilibrado entre lenguas.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria ni evidencia de uso en produccion; el artefacto es experimental.
- Sin benchmarks publicados: no hay datos que permitan evaluar la calidad de la preservacion de distancias ni el impacto en tareas downstream.
- Formato de pesos no disponible: los pesos se gestionan mediante la libreria `geopres`, lo que limita la interoperabilidad con otros ecosistemas.
- Riesgo de alucinacion y sesgos: no aplica directamente, al no ser un modelo generativo; los sesgos del backbone pueden propagarse a traves de la proyeccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkalyfo/geopres-gte-multilingual-base-64
- Backbone: https://huggingface.co/Alibaba-NLP/gte-multilingual-base
- Repositorio GeoPres: https://github.com/konstantinoskalyfommatos/geopres
- Paper: https://openreview.net/forum?id=vAWo3CIzqp
