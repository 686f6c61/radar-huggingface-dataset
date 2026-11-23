# kkalyfo/geopres-gte-multilingual-base-32

## Resumen

GeoPres projection: gte-multilingual-base a 32 dimensiones es un artefacto de reduccion de dimensionalidad publicado por el usuario kkalyfo. No es un modelo de lenguaje ni un encoder independiente, sino un mapa lineal `W` de 32 x 768 entrenado con la libreria GeoPres para preservar las distancias euclideas por pares entre embeddings producidos por el backbone `Alibaba-NLP/gte-multilingual-base`. El backbone permanece congelado y no se incluye en el repositorio: el artefacto contiene unicamente la matriz de proyeccion.

Su relevancia practica es la compresion de embeddings en pipelines de recuperacion de informacion y busqueda vectorial. Pasar de 768 a 32 dimensiones reduce el almacenamiento y el coste de las busquedas por similitud en un factor de 24, manteniendo, segun el autor, la estructura de distancias del espacio original. El enfoque es post-hoc: se aplica sobre embeddings ya calculados o se integra en el flujo de codificacion mediante la libreria `geopres`.

El repositorio se creo el 23 de noviembre de 2026, no registra descargas ni likes, y su model card es muy escueta: no declara licencia, idiomas ni pipeline. Toda la informacion tecnica disponible procede del README y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mapa lineal (matriz de proyeccion) de 32 x 768 sobre embeddings congelados de `Alibaba-NLP/gte-multilingual-base` |
| Parametros totales | 24.576 (32 x 768) en la matriz de proyeccion; el backbone no se incluye |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del backbone, no declarada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredados del backbone, no declarados) |
| Licencia | no disponible |
| Formato de pesos | no disponible (pesos cargables mediante `geopres.GeoPres.from_pretrained` y `geopres.Projection.from_pretrained`) |

## Arquitectura y entrenamiento

El artefacto es una transformacion lineal que proyecta embeddings de 768 dimensiones a 32. Se entreno con GeoPres, una libreria de reduccion de dimensionalidad cuyo objetivo es preservar las distancias euclideas por pares del espacio de embeddings original. El backbone `Alibaba-NLP/gte-multilingual-base` esta congelado y no forma parte del repositorio: la inferencia consiste en una unica multiplicacion de matrices sobre los embeddings de entrada.

El README no detalla el volumen de datos de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de regularizacion o validacion cruzada. La unica referencia metodologica es el paper "On Post-Hoc Dimensionality Reduction of Text Embeddings" (EACL 2027), enlazado en OpenReview. Es un requisito explicito que los embeddings de entrada se calculen con el mismo pooling, normalizacion y prefijos que los datos de entrenamiento; de lo contrario, la proyeccion no es valida.

## Capacidades

- Reduccion de embeddings de 768 a 32 dimensiones preservando distancias euclideas por pares.
- Proyeccion de embeddings ya calculados sin descargar ni ejecutar el backbone (`Projection.project`).
- Codificacion y reduccion en un solo paso mediante `GeoPres.embed`, que integra el backbone congelado y la matriz.
- Compatible con cualquier flujo que produzca embeddings de `Alibaba-NLP/gte-multilingual-base` (TEI, bases de datos vectoriales, procesos por lotes).
- No realiza generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- Capacidades multilingues: no declaradas en la model card; dependerian del backbone.

## Casos de uso

- Busqueda vectorial a gran escala: proyectar embeddings de 768 a 32 dimensiones reduce el almacenamiento y el coste de calculo de similitudes en un factor de 24, lo que permite indexar corpus mas grandes en la misma infraestructura.
- Deduplicacion y agrupamiento de documentos: las distancias euclideas preservadas permiten usar clustering o vecinos mas cercanos sobre la version comprimida sin recalcular embeddings completos.
- Filtrado previo en pipelines de recuperacion (retrieval de dos etapas): usar la proyeccion de 32 dimensiones como primera fase barata y reservar el modelo completo para el reranking.
- Sistemas con memoria limitada: dispositivos embebidos o contenedores con poca RAM pueden almacenar indices vectoriales comprimidos y proyectar consultas al vuelo.
- Migracion de indices existentes: si ya se dispone de embeddings de `gte-multilingual-base` en una base vectorial, `Projection.project` permite generar la version reducida sin volver a codificar el corpus.
- Experimentacion academica en reduccion de dimensionalidad: sirve como referencia reproducible del metodo GeoPres para comparar con PCA, UMAP u otras tecnicas post-hoc.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para la matriz de proyeccion: despreciable (24.576 parametros, menos de 1 MB en precision completa).
- VRAM para el flujo completo con `GeoPres.embed`: la del backbone `Alibaba-NLP/gte-multilingual-base`, no especificada en la model card.
- GPU recomendadas: no disponible; cualquier GPU capaz de ejecutar el backbone es suficiente para la proyeccion, y la matriz por si sola puede ejecutarse en CPU.
- Cabe en cualquier GPU de consumo e incluso en CPU para el modo `Projection`, ya que la inferencia es una multiplicacion de matrices.
- Opciones de despliegue: libreria `geopres` (unica via documentada); el backbone puede servirse por separado con TEI u otras herramientas y aplicar la proyeccion despues.
- Latencia y throughput: no disponibles; al tratarse de una multiplicacion de 768 x 32 por vector, el coste es minimo frente al de la codificacion.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension de salida | Parametros | Contexto | Licencia |
|---|---|---|---|---|---|
| kkalyfo/geopres-gte-multilingual-base-32 | Proyeccion lineal post-hoc | 32 | 24.576 (matriz) | no disponible | no disponible |
| Alibaba-NLP/gte-multilingual-base | Encoder de embeddings | 768 | no disponible en la informacion | no disponible | no disponible |
| PCA sobre embeddings del backbone | Reduccion lineal clasica | Configurable | No aplica | No aplica | No aplica |

La comparativa se limita a estas referencias porque la model card no menciona alternativas directas de la misma libreria ni resultados frente a otros metodos de reduccion. No hay datos publicados para comparar la preservacion de distancias frente a PCA u otras tecnicas.

## Limitaciones y advertencias

- Solo es valido para embeddings de `Alibaba-NLP/gte-multilingual-base` calculados con el mismo pooling, normalizacion y prefijos que los datos de entrenamiento; cualquier otra fuente invalida la proyeccion.
- La compresion a 32 dimensiones implica perdida de informacion; no se han publicado metricas de recuperacion ni de preservacion de distancias que cuantifiquen esa perdida.
- La licencia no esta declarada, lo que impide determinar si el uso comercial es posible sin contactar con el autor.
- No se declaran idiomas soportados; el comportamiento multilingue depende enteramente del backbone.
- El repositorio no tiene descargas ni likes y su model card es minima, por lo que no hay evidencia de validacion por terceros.
- Al ser un artefacto de proyeccion, no debe tratarse como un modelo generativo ni usarse para tareas de razonamiento, codigo o dialogo.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de resultados erroneos si se alimenta con embeddings incompatibles sin validacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkalyfo/geopres-gte-multilingual-base-32
- Backbone: https://huggingface.co/Alibaba-NLP/gte-multilingual-base
- Repositorio de GeoPres: https://github.com/konstantinoskalyfommatos/geopres
- Paper (EACL 2027): https://openreview.net/forum?id=vAWo3CIzqp
