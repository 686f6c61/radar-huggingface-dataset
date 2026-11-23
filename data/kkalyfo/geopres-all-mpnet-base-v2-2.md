# kkalyfo/geopres-all-mpnet-base-v2-2

## Resumen

GeoPres projection es un artefacto de reduccion de dimensionalidad publicado por el usuario kkalyfo. No es un modelo de lenguaje ni un encoder de texto autonomo: es un mapa lineal `W` de dimensiones 2 x 768 entrenado con la libreria GeoPres para proyectar embeddings de `sentence-transformers/all-mpnet-base-v2` (768 dimensiones) a un espacio bidimensional preservando las distancias euclideas por pares entre ellos. El backbone original queda congelado y no se incluye en el repositorio; el artefacto publicado es unicamente la matriz de proyeccion.

El problema que resuelve es concreto: cuando se dispone de embeddings de alta dimension y se quiere una representacion en 2D para visualizacion (por ejemplo, scatter plots de clusters semanticos), las tecnicas clasicas como PCA o t-SNE no respetan de forma explicita la estructura de distancias del espacio original. GeoPres entrena una proyeccion lineal que minimiza la distorsion de esas distancias, y este repositorio ofrece el caso extremo de 2 dimensiones.

La relevancia practica esta acotada: el propio autor advierte en la model card que en 2D la retencion en MTEB cae al 35-38 % respecto al modelo completo, por lo que el uso previsto es la visualizacion y no la recuperacion semantica ni el ranking. El repositorio tiene 0 descargas y 0 likes, un tamano de 0.0 GB (solo la matriz) y fue creado el 23 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mapa lineal (matriz de proyeccion) de 2 x 768 sobre embeddings de all-mpnet-base-v2 |
| Parametros totales | 1536 (matriz 2 x 768); el backbone MPNet no se incluye |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del backbone, no del proyector) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredados del backbone all-mpnet-base-v2, no declarados) |
| Licencia | no disponible |
| Formato de pesos | no disponible en la informacion proporcionada (carga via `geopres.GeoPres.from_pretrained` y `geopres.Projection.from_pretrained`) |

## Arquitectura y entrenamiento

El artefacto es una transformacion lineal `W` que mapea un vector de 768 dimensiones a 2 dimensiones. Se entrena con GeoPres, una libreria del mismo autor, cuyo objetivo es preservar las distancias euclideas por pares del espacio de embeddings original tras la reduccion. El backbone `sentence-transformers/all-mpnet-base-v2` permanece congelado: la inferencia consiste en una unica multiplicacion de matrices, sin pasar por la red neuronal.

La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si hubo optimizacion adicional mas alla del ajuste de la proyeccion. La referencia metodologica es el paper "On Post-Hoc Dimensionality Reduction of Text Embeddings" (EACL 2027), que describe el enfoque de reduccion post-hoc. El autor indica que la entrada debe ser embeddings de all-mpnet-base-v2 calculados con el mismo pooling, normalizacion y prefijos que los datos de entrenamiento, lo que implica que el proyector no es transferible a embeddings de otros encoders.

## Capacidades

- Proyeccion de embeddings de 768 a 2 dimensiones mediante una sola multiplicacion de matrices.
- Preservacion de distancias euclideas por pares en el espacio reducido, segun el objetivo de entrenamiento de GeoPres.
- Dos modos de uso: `GeoPres.from_pretrained(...).embed(["texto"])`, que codifica y proyecta, y `Projection.from_pretrained(...).project(embeddings)`, que solo proyecta embeddings ya calculados sin descargar el backbone.
- No realiza generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No declara capacidades multilingues propias; depende del backbone.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Visualizacion de clusters semanticos: proyectar un corpus de embeddings all-mpnet-base-v2 a 2D y representarlo en un scatter plot para inspeccionar la separacion entre topicos, ya que el ajuste de GeoPres prioriza preservar las distancias relativas entre puntos.
- Diagnostico de calidad del corpus: comparar la estructura 2D de embeddings de distintos lotes o periodos para detectar desplazamientos en la distribucion de los textos antes de indexarlos en un sistema de recuperacion.
- Exploracion interactiva de un indice vectorial: usar la proyeccion como vista de bajo coste (una multiplicacion de matrices) para navegar por un conjunto de embeddings ya almacenados en una base vectorial, sin recalcular el encoder.
- Demos y material docente: mostrar de forma tangible como se relacionan frases semanticamente proximas en un espacio de 768 dimensiones, con un coste computacional minimo.
- Preprocesado para tecnicas de clustering sobre representaciones 2D: en pipelines donde se necesita una reduccion barata previa a un agrupamiento visual, aceptando la perdida de calidad documentada.
- Validacion de pipelines de embeddings: comprobar que los embeddings de produccion (calculados en TEI o en un batch job) coinciden en estructura con los de entrenamiento, proyectandolos y verificando que las distancias se mantienen coherentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica aportada por el autor es que, en 2 dimensiones, la retencion en MTEB cae al 35-38 % del modelo completo (seccion 6 del paper citado).

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula para el proyector (matriz de 2 x 768, 1536 parametros); el coste real lo determina el backbone all-mpnet-base-v2 (aproximadamente 420 MB en fp32).
- GPU recomendadas: cualquier GPU consumer moderna sirve; el cuello de botella es el encoder, no la proyeccion.
- Cabe en cualquier GPU consumer y tambien en CPU para el modo `Projection`, que solo aplica la matriz.
- Opciones de despliegue: la libreria `geopres` es la via documentada; el modo `Projection` puede integrarse en pipelines existentes (TEI, bases vectoriales, batch jobs) sin descargar el backbone.
- Latencia y throughput: no disponibles en la informacion proporcionada. La proyeccion en si es una multiplicacion de matrices de coste despreciable frente a la codificacion.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension de salida | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kkalyfo/geopres-all-mpnet-base-v2-2 | Proyeccion lineal post-hoc | 2 | 1536 (matriz) | no disponible | no disponible | Hugging Face, 0 descargas |
| PCA sobre all-mpnet-base-v2 | Reduccion lineal clasica | configurable | sin parametros entrenados | no disponible | no disponible | implementacion estandar |
| t-SNE / UMAP sobre all-mpnet-base-v2 | Reduccion no lineal | configurable (habitualmente 2) | sin parametros entrenados (UMAP aprende) | no disponible | no disponible | librerias estandar |
| sentence-transformers/all-mpnet-base-v2 | Encoder completo | 768 | aproximadamente 109 M | no disponible | no disponible en la informacion | Hugging Face, ampliamente adoptado |

La diferencia frente a PCA, t-SNE o UMAP es que GeoPres entrena la proyeccion con un objetivo explicito de preservacion de distancias por pares, mientras que las alternativas optimizan varianza explicada o estructura local de vecindad. No hay datos publicados que permitan comparar la retencion MTEB de este artefacto con esas alternativas en este repositorio.

## Limitaciones y advertencias

- La retencion en MTEB en 2 dimensiones es del 35-38 % del modelo completo, segun el propio autor; no es apto para recuperacion semantica, ranking ni clasificacion en produccion.
- Solo acepta embeddings de `sentence-transformers/all-mpnet-base-v2` calculados con el mismo pooling, normalizacion y prefijos que los datos de entrenamiento; con otros encoders la proyeccion carece de validez.
- El backbone no esta incluido en el repositorio; el modo `embed` requiere descargarlo por separado.
- El repositorio tiene 0 descargas y 0 likes y fue creado en noviembre de 2026, sin senales de adopcion ni mantenimiento.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; conviene contactar con el autor antes de cualquier uso en produccion.
- No se declaran sesgos, idiomas soportados ni evaluaciones de robustez; cualquier sesgo del backbone se hereda en la proyeccion.
- El caso de 2 dimensiones es un extremo incluido para visualizacion; el autor remite al paper para el analisis de la perdida de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkalyfo/geopres-all-mpnet-base-v2-2
- Repositorio de la libreria GeoPres: https://github.com/konstantinoskalyfommatos/geopres
- Paper "On Post-Hoc Dimensionality Reduction of Text Embeddings" (EACL 2027): https://openreview.net/forum?id=vAWo3CIzqp
- Backbone: https://huggingface.co/sentence-transformers/all-mpnet-base-v2
