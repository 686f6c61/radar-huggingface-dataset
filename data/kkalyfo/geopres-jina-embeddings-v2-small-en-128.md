# kkalyfo/geopres-jina-embeddings-v2-small-en-128

## Resumen

`kkalyfo/geopres-jina-embeddings-v2-small-en-128` no es un modelo de lenguaje, sino una proyección lineal entrenada con la librería GeoPres que reduce de 512 a 128 dimensiones los embeddings producidos por `jinaai/jina-embeddings-v2-small-en`. El artefacto consiste en una matriz `W` de 128 x 512 que se aplica sobre la salida del codificador congelado, sin volver a entrenar ni modificar el backbone. El objetivo es preservar las distancias euclídeas por pares entre embeddings originales tras la reducción, de modo que la búsqueda vectorial y el almacenamiento se abaraten sin degradar de forma significativa la geometría del espacio.

El proyecto lo publica el usuario `kkalyfo` bajo la librería `geopres` y se acompaña de un artículo en OpenReview titulado "On Post-Hoc Dimensionality Reduction of Text Embeddings", presentado en EACL 2027. Es relevante ahora porque la reducción post-hoc de embeddings es una vía barata de recortar costes de indexación y memoria en sistemas RAG y motores de búsqueda semántica: reduce el tamaño de los vectores un 75 % (de 512 a 128 componentes) manteniendo, según el autor, las relaciones de distancia.

El repositorio tiene un tamaño declarado de 0.0 GB y no incluye los pesos del backbone, que debe descargarse por separado desde su propio repositorio. No se han publicado descargas ni likes, y la model card es muy escueta: no detalla datos de entrenamiento, hiperparámetros de la proyección ni métricas de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal post-hoc (matriz W de 128 x 512) sobre un backbone transformer congelado (jina-embeddings-v2-small-en) |
| Parametros totales | No disponible (el artefacto es una matriz de 65.536 valores; el backbone no se incluye) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del backbone, no declarada aquí) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la model card no los declara; el backbone es de propósito general) |
| Licencia | No disponible |
| Formato de pesos | Pesos de la librería `geopres` (no se especifica safetensors ni GGUF); el backbone se distribuye aparte |

## Arquitectura y entrenamiento

La pieza entrenada es una transformación lineal `W` de 128 x 512 que mapea embeddings de 512 dimensiones a 128. El backbone `jinaai/jina-embeddings-v2-small-en` permanece congelado y no forma parte del repositorio: la inferencia consiste en una única multiplicación de matrices tras obtener el embedding original. El criterio de entrenamiento declarado es la preservación de distancias euclídeas por pares entre los embeddings de origen, es decir, un objetivo geométrico de tipo preservación de distancias (el nombre GeoPres sugiere "geometric preservation").

No se especifican en la información disponible el volumen de datos de entrenamiento, la composición del corpus, el número de tokens utilizados, ni si hubo etapas de ajuste adicionales. Tampoco se detallan hiperparámetros como la tasa de aprendizaje, el optimizador o el número de épocas. La model card advierte que la entrada debe calcularse con el mismo pooling, normalización y prefijos que los datos de entrenamiento, lo que implica que la proyección es sensible a la configuración exacta del codificador.

## Capacidades

- Reducción de dimensionalidad de embeddings de texto de 512 a 128 componentes mediante una multiplicación de matrices.
- Preservación de distancias euclídeas por pares entre los embeddings originales, según el criterio de entrenamiento declarado.
- Dos modos de uso: codificación y reducción en un solo paso (`GeoPres.embed`) o proyección de embeddings ya calculados (`Projection.project`), sin descargar el backbone en el segundo caso.
- Compatible con embeddings generados externamente (TEI, bases de datos vectoriales, trabajos por lotes) siempre que procedan del backbone indicado y con el mismo preprocesado.
- No realiza generación de texto, razonamiento, código, matemáticas, visión ni tool calling: es exclusivamente un componente de transformación de representaciones.
- No se declaran capacidades multilingües propias; dependen del backbone subyacente.

## Casos de uso

- Indexación vectorial de bajo coste en sistemas RAG: proyectar los embeddings de 512 a 128 dimensiones antes de insertarlos en una base de datos vectorial reduce el almacenamiento y el ancho de banda de búsqueda aproximadamente un 75 %, manteniendo las distancias relativas entre documentos.
- Búsqueda semántica a gran escala: aplicar la matriz sobre embeddings ya calculados permite migrar un índice existente sin reencodificar el corpus, solo reproyectando los vectores almacenados.
- Deduplicación y clustering de documentos: con vectores de 128 dimensiones las operaciones de similitud y agrupamiento son más rápidas en CPU y caben mejor en memoria, lo que facilita procesar lotes grandes.
- Sistemas con restricciones de memoria en el borde: en despliegues donde el índice debe residir en dispositivos con RAM limitada, la reducción a 128 componentes permite almacenar más vectores por unidad de memoria.
- Pipelines de recuperación en dos etapas: usar los vectores reducidos para un primer filtrado rápido y reservar el embedding completo de 512 dimensiones para la reordenación final de los candidatos.
- Evaluación comparativa de técnicas de reducción: sirve como referencia reproducible para medir la pérdida de calidad de recuperación frente a otras alternativas (PCA, quantización de producto) sobre el mismo backbone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la proyección en sí requiere memoria despreciable (una matriz de 128 x 512 en coma flotante de 32 bits ocupa unos 256 KB); el consumo real lo determina el backbone `jina-embeddings-v2-small-en`, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible para el backbone; la proyección puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU de consumo e incluso en CPU para el paso de proyección; el coste de codificación depende del backbone.
- Opciones de despliegue: la librería `geopres` (clases `GeoPres` y `Projection`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles; por la naturaleza del artefacto, la proyección añade una única multiplicación de matrices por lote de embeddings.

## Comparativa con modelos similares

| Modelo | Tipo | Dimensiones de salida | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kkalyfo/geopres-jina-embeddings-v2-small-en-128 | Proyección lineal post-hoc | 128 (desde 512) | No disponible | No disponible | Hugging Face, librería `geopres` |
| jinaai/jina-embeddings-v2-small-en | Modelo de embeddings (backbone) | 512 | No disponible en esta ficha | No disponible en esta ficha | Hugging Face |
| PCA / reducción lineal clásica sobre el mismo backbone | Método estadístico | Configurable (p. ej. 128) | No aplica | Depende de la implementación | Amplia (scikit-learn, etc.) |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La proyección solo es válida para embeddings de `jinaai/jina-embeddings-v2-small-en` calculados con el mismo pooling, normalización y prefijos que los datos de entrenamiento; cualquier desviación en el preprocesado invalida la preservación de distancias.
- No es un modelo generativo ni un codificador autónomo: no puede usarse sin el backbone para producir embeddings desde texto.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de integrarlo en producción.
- No se publican métricas de evaluación (recuperación, preservación de distancias, comparación con el espacio original), por lo que la pérdida de calidad tras la reducción no puede cuantificarse a priori.
- El repositorio no incluye los pesos del backbone ni documenta el proceso de entrenamiento de la matriz, lo que limita la reproducibilidad.
- Riesgo de alucinación y sesgos: no aplica directamente al ser un transformador de representaciones, pero los sesgos del backbone subyacente se propagan a los vectores reducidos.
- El modelo es muy reciente y sin adopción registrada (0 descargas, 0 likes), por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkalyfo/geopres-jina-embeddings-v2-small-en-128
- Backbone: https://huggingface.co/jinaai/jina-embeddings-v2-small-en
- Repositorio de GeoPres: https://github.com/konstantinoskalyfommatos/geopres
- Artículo (EACL 2027): https://openreview.net/forum?id=vAWo3CIzqp
