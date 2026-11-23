# kkalyfo/geopres-jina-embeddings-v2-small-en-2

## Resumen

GeoPres projection es un artefacto de reduccion de dimensionalidad publicado por el usuario kkalyfo (Konstantinos Kalyfommatos) bajo el nombre `kkalyfo/geopres-jina-embeddings-v2-small-en-2`. No es un modelo de lenguaje ni un modelo de embeddings autonomo: es un mapa lineal `W` de dimensiones 2 x 512 entrenado con la libreria GeoPres para proyectar embeddings del modelo backbone `jinaai/jina-embeddings-v2-small-en` (512 dimensiones) a un espacio bidimensional, preservando las distancias euclideas por pares.

El proposito del artefacto es permitir la visualizacion y el analisis exploratorio de embeddings de texto en 2D sin reentrenar el codificador original. El backbone permanece congelado y no se incluye en el repositorio: la inferencia consiste en una unica multiplicacion matricial sobre embeddings ya calculados. El trabajo subyacente se describe en el paper "On Post-Hoc Dimensionality Reduction of Text Embeddings" (EACL 2027).

La relevancia es acotada y experimental: se trata de una proyeccion extrema a 2 dimensiones, un caso incluido en el paper para fines de visualizacion. El propio autor advierte que a este tamano la retencion de rendimiento en MTEB cae al 35-38 % del modelo completo, por lo que no es apto como sustituto del embedding original en tareas de recuperacion o similitud semantica en produccion. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mapa lineal (proyeccion) de 2 x 512 sobre embeddings congelados de `jinaai/jina-embeddings-v2-small-en` |
| Parametros totales | 1024 (matriz W de 2 x 512); el backbone no esta incluido en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del backbone, no declarada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el backbone es `-en`, orientado a ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (cargable via `geopres` con `from_pretrained`; tamano del repo 0.0 GB) |

## Arquitectura y entrenamiento

El artefacto es una transformacion lineal post-hoc: una matriz `W` de 2 x 512 entrenada con GeoPres para preservar distancias euclideas por pares entre los embeddings de entrada y sus proyecciones bidimensionales. El backbone `jinaai/jina-embeddings-v2-small-en` se mantiene congelado y no forma parte del repositorio; el pipeline completo consiste en codificar texto con el backbone y aplicar despues la multiplicacion matricial.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de regularizacion o validacion cruzada. La model card remite al paper "On Post-Hoc Dimensionality Reduction of Text Embeddings" (EACL 2027) para los detalles metodologicos. La innovacion tecnica declarada es la preservacion de estructura geometrica (distancias por pares) en la proyeccion, en contraste con reducciones lineales clasicas como PCA, y la separacion entre codificacion y proyeccion, que permite aplicar el mapa a embeddings ya almacenados sin descargar el backbone.

## Capacidades

- Proyeccion de embeddings de 512 a 2 dimensiones mediante una unica multiplicacion matricial.
- Preservacion de distancias euclideas por pares en el espacio reducido, segun el criterio de entrenamiento declarado.
- Dos modos de uso: `GeoPres.from_pretrained(...).embed([...])` para codificar y proyectar texto, y `Projection.from_pretrained(...).project(embeddings)` para proyectar embeddings precalculados.
- El modo `Projection` no descarga ni ejecuta el backbone, lo que permite procesar lotes almacenados en bases de datos vectoriales o jobs batch.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo generativo.
- No tiene capacidades multilingues declaradas; el backbone asociado es de ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Visualizacion exploratoria de corpus: proyectar los embeddings de un conjunto de documentos a 2D y representarlos en un scatter plot para detectar clusters tematicos, duplicados o outliers antes de disenar un pipeline de recuperacion.
- Analisis de deriva en bases vectoriales: aplicar `Projection.project` sobre embeddings ya almacenados para inspeccionar visualmente como evoluciona la distribucion de un indice a lo largo del tiempo, sin recalcular codificaciones.
- Diagnostico de calidad de datos: identificar agrupaciones anomalas o embeddings mal formados en un dataset antes de indexarlo, aprovechando la preservacion de distancias por pares.
- Demos y material docente: ilustrar en notebooks o presentaciones como se organizan semanticamente los embeddings de un modelo de 512 dimensiones, con una unica multiplicacion matricial y sin infraestructura GPU.
- Preprocesado para clustering rapido: usar las coordenadas 2D como entrada a algoritmos de agrupamiento o deteccion de outliers en exploraciones preliminares, asumiendo la perdida de informacion documentada.
- Auditoria de sesgos a nivel exploratorio: comparar visualmente la distribucion de subgrupos de texto en el plano 2D para detectar separaciones llamativas que justifiquen un analisis mas profundo con los embeddings completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica citada en la model card es la retencion de rendimiento en MTEB, que cae al 35-38 % del modelo completo para esta proyeccion a 2 dimensiones (seccion 6 del paper).

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula para la proyeccion (una matriz de 1024 parametros); el coste real lo determina el backbone `jinaai/jina-embeddings-v2-small-en` si se usa el modo `embed`.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente para el backbone; la proyeccion en si puede ejecutarse en CPU.
- Cabe en cualquier GPU consumer e incluso en CPU para el modo `Projection`, ya que solo requiere una multiplicacion matricial sobre los embeddings de entrada.
- Opciones de despliegue: la libreria `geopres` (unica via documentada en la model card); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un mapa lineal.
- Latencia y throughput: no disponibles; al ser una multiplicacion matricial, el coste es despreciable frente a la codificacion con el backbone.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada artefactos comparables de reduccion post-hoc de embeddings con la misma metodologia (GeoPres) ni proyecciones publicadas equivalentes sobre `jina-embeddings-v2-small-en`. Como referencia cualitativa, las alternativas habituales para reduccion de dimensionalidad de embeddings (PCA, UMAP, t-SNE) no preservan distancias euclideas por pares de forma lineal y no se distribuyen como pesos cargables con `from_pretrained`, pero no se dispone de datos comparativos publicados para este artefacto concreto.

## Limitaciones y advertencias

- La retencion de rendimiento en MTEB cae al 35-38 % del modelo completo: no apto para recuperacion, busqueda semantica ni similitud en produccion.
- La entrada debe ser exactamente embeddings de `jinaai/jina-embeddings-v2-small-en`, calculados con el mismo pooling, normalizacion y prefijos que los datos de entrenamiento; cualquier desviacion invalida la proyeccion.
- El backbone no esta incluido en el repositorio: el modo `embed` requiere descargarlo por separado.
- Licencia no declarada: no se puede confirmar el uso comercial del artefacto ni del backbone asociado.
- Idiomas no declarados; el backbone es de ingles, por lo que la calidad en castellano no esta garantizada.
- No se documentan sesgos conocidos ni tasas de alucinacion, aunque al no ser un modelo generativo el riesgo de alucinacion no aplica directamente.
- Repositorio sin descargas ni likes y con fecha de creacion posterior a la consulta de referencia: madurez y mantenimiento no verificables.
- Uso previsto limitado a visualizacion y analisis exploratorio; no debe sustituir al embedding de 512 dimensiones en ningun pipeline de recuperacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkalyfo/geopres-jina-embeddings-v2-small-en-2
- Backbone: https://huggingface.co/jinaai/jina-embeddings-v2-small-en
- Repositorio GeoPres: https://github.com/konstantinoskalyfommatos/geopres
- Paper (EACL 2027): https://openreview.net/forum?id=vAWo3CIzqp
