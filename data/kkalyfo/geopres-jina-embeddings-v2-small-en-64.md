# kkalyfo/geopres-jina-embeddings-v2-small-en-64

## Resumen

GeoPres projection: jina-embeddings-v2-small-en -> 64 dimensiones es un artefacto de reduccion de dimensionalidad publicado por el usuario kkalyfo bajo el identificador `kkalyfo/geopres-jina-embeddings-v2-small-en-64`. No es un modelo de lenguaje ni un encoder de texto propiamente dicho: es un mapa lineal `W` de forma 64 x 512 entrenado con la libreria GeoPres para proyectar embeddings de 512 dimensiones generados por `jinaai/jina-embeddings-v2-small-en` a un espacio de 64 dimensiones, preservando las distancias euclideas por pares del espacio original.

El problema que resuelve es el coste de almacenamiento y de computo en busquedas vectoriales: reducir la dimensionalidad de los embeddings permite indices mas pequenos, menor uso de memoria y calculos de similitud mas rapidos, a cambio de una perdida controlada de informacion geometrica. El enfoque es post-hoc, es decir, no requiere reentrenar el backbone, que permanece congelado y no se incluye en el repositorio. La inferencia consiste en una unica multiplicacion de matrices.

La relevancia del artefacto es limitada y muy especifica: el repositorio registra 0 descargas y 0 likes, el tamano del repo es de 0.0 GB (coherente con un unico tensor de 64 x 512), no declara licencia, idiomas ni pipeline, y la fecha de creacion indicada es 2026-11-23. Debe evaluarse como un complemento experimental para pipelines que ya usen el backbone Jina citado, no como un modelo autonomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mapa lineal (matriz de proyeccion 64 x 512) sobre embeddings congelados de `jinaai/jina-embeddings-v2-small-en` |
| Parametros totales | 32.768 (matriz 64 x 512); el backbone no se incluye en el repo |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del backbone, no declarada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el backbone es un modelo en ingles segun su nombre; no confirmado en la informacion) |
| Licencia | No disponible |
| Formato de pesos | Pesos cargables mediante `geopres` (`GeoPres.from_pretrained`, `Projection.from_pretrained`); formato de fichero no especificado |

## Arquitectura y entrenamiento

El artefacto es una transformacion lineal `W` de 64 x 512 entrenada para preservar distancias euclideas por pares entre los embeddings de `jinaai/jina-embeddings-v2-small-en`. La dimensionalidad de entrada (512) coincide con la del backbone Jina de tipo small, y la de salida es 64. El backbone se mantiene congelado durante el proceso y no forma parte del repositorio, por lo que el artefacto solo contiene la matriz de proyeccion.

El metodo de entrenamiento es GeoPres, descrito en el paper "On Post-Hoc Dimensionality Reduction of Text Embeddings" (EACL 2027, OpenReview `vAWo3CIzqp`). La model card no detalla el numero de tokens, la composicion del dataset de entrenamiento ni si hubo ajuste adicional mas alla del objetivo de preservacion de distancias. La unica operacion en inferencia es una multiplicacion de matrices, lo que implica un coste computacional despreciable frente al del encoder.

Una condicion critica documentada por el autor: la entrada debe ser embeddings de `jinaai/jina-embeddings-v2-small-en` calculados con el mismo pooling, normalizacion y prefijos que los datos de entrenamiento. Cualquier desviacion en ese preprocesado invalida la proyeccion.

## Capacidades

- Reduccion de dimensionalidad de embeddings de 512 a 64 dimensiones mediante una unica multiplicacion de matrices.
- Preservacion de distancias euclideas por pares, orientada a mantener la calidad de busquedas por similitud tras la reduccion.
- Proyeccion de embeddings ya calculados externamente (por ejemplo, desde TEI, una base de datos vectorial o un proceso por lotes) sin necesidad de descargar ni ejecutar el backbone.
- Encapsulado del pipeline completo (codificacion con el backbone mas proyeccion) mediante `GeoPres.from_pretrained` y `model.embed(...)`.
- No genera texto, no razona, no ejecuta codigo, no soporta tool calling ni agentes, y no tiene capacidades multimodales ni modo de razonamiento.

## Casos de uso

- Compresion de indices vectoriales en produccion: proyectar a 64 dimensiones los embeddings de 512 generados por el backbone Jina reduce el almacenamiento del indice en un factor de 8 por vector, manteniendo la geometria de distancias segun el criterio de entrenamiento.
- Aceleracion de busqueda por similitud a gran escala: con vectores de 64 dimensiones, el calculo de distancias y el recorrido de indices tipo HNSW o IVF son mas baratos en memoria y CPU, lo que resulta util en busquedas sobre millones de documentos.
- Reduccion en pipelines existentes sin reindexar el encoder: si ya se dispone de embeddings de 512 dimensiones almacenados, `Projection.project(embeddings)` los transforma en lote sin volver a ejecutar el backbone.
- Despliegue en entornos con memoria limitada: al requerir solo la matriz de proyeccion (32.768 parametros) y no el backbone, la fase de reduccion puede ejecutarse en el mismo nodo que la base de datos vectorial o en un servicio ligero.
- Experimentacion academica en reduccion post-hoc: sirve como referencia reproducible para comparar metodos de reduccion de dimensionalidad de embeddings de texto bajo la formulacion del paper de GeoPres.
- Visualizacion y analisis exploratorio de colecciones de documentos: la proyeccion a 64 dimensiones facilita tecnicas de clustering y visualizacion sobre los embeddings reducidos, siempre que el preprocesado coincida con el de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable para la proyeccion (matriz de 32.768 parametros, del orden de decenas de kilobytes en precision completa). Si se usa el pipeline completo con `GeoPres.from_pretrained`, se suma el coste del backbone `jinaai/jina-embeddings-v2-small-en`, no cuantificado en la informacion disponible.
- GPU recomendadas: no disponibles. La operacion de proyeccion es una multiplicacion de matrices y puede ejecutarse en CPU sin problema; para el backbone se aplicarian los requisitos habituales de un modelo de embeddings de tipo small, no especificados aqui.
- Cabe en cualquier GPU consumer para la parte de proyeccion; el requisito del backbone no esta documentado en la informacion proporcionada.
- Opciones de despliegue: libreria `geopres` (clases `GeoPres` y `Projection`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. La model card solo indica que la inferencia es una multiplicacion de matrices.

## Comparativa con modelos similares

| Aspecto | GeoPres jina-v2-small-en -> 64 | PCA post-hoc sobre embeddings | Matryoshka Representation Learning (MRL) | Modelo de embeddings nativo de 64 dims |
|---|---|---|---|---|
| Tipo | Mapa lineal entrenado | Proyeccion lineal no supervisada | Entrenamiento con truncamiento anidado | Encoder entrenado directamente |
| Requiere reentrenar el encoder | No | No | Si | Si |
| Dimension de salida | 64 | Configurable | Configurable (truncando) | 64 |
| Preservacion de distancias | Objetivo explicito del entrenamiento | Aproximada (maxima varianza) | Aproximada | Optimizada de extremo a extremo |
| Licencia | No disponible | No aplica | Depende del modelo | Depende del modelo |
| Datos publicos de rendimiento | No disponibles | No aplica | Depende del modelo | Depende del modelo |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de recuperacion de este artefacto frente a las alternativas listadas.

## Limitaciones y advertencias

- Solo es valido para embeddings producidos por `jinaai/jina-embeddings-v2-small-en` con el mismo pooling, normalizacion y prefijos que los datos de entrenamiento; cualquier otro encoder o preprocesado produce resultados incorrectos sin aviso.
- La reduccion de 512 a 64 dimensiones implica una perdida de informacion irreversible; no se documenta la magnitud de la degradacion en tareas de recuperacion.
- No declara licencia, lo que impide determinar si su uso comercial esta permitido; debe tratarse como no apto para produccion hasta aclararlo con el autor.
- Repositorio sin descargas ni likes y con fecha de creacion futura respecto a la informacion habitual de Hugging Face; no hay evidencia de uso o validacion por terceros.
- No se especifican idiomas soportados; el nombre del backbone sugiere ingles, pero no esta confirmado en la informacion disponible.
- No se documentan sesgos, tasas de alucinacion ni comportamiento en dominios especificos; al no ser un modelo generativo, el riesgo de alucinacion no aplica, pero si el de degradacion silenciosa de la calidad de recuperacion.
- El backbone no se incluye en el repositorio, por lo que el artefacto no es autocontenido para el flujo de codificacion completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkalyfo/geopres-jina-embeddings-v2-small-en-64
- Backbone: https://huggingface.co/jinaai/jina-embeddings-v2-small-en
- Repositorio de GeoPres: https://github.com/konstantinoskalyfommatos/geopres
- Paper (EACL 2027): https://openreview.net/forum?id=vAWo3CIzqp
