# fse/glove-wiki-gigaword-100

## Resumen

`fse/glove-wiki-gigaword-100` es un repositorio de vectores de palabra GloVe de 100 dimensiones para 400.000 palabras del inglés, empaquetado en formato `gensim` y publicada por la organización `fse` (Fast Sentence Embeddings) para su uso directo con esa librería. No es un modelo generativo ni un transformer: es una tabla estática de embeddings de palabra que se convierte en embeddings de frase mediante técnicas de pooling (media CBOW, SIF y uSIF).

Los vectores originales fueron entrenados por el Stanford NLP Group (Pennington, Socher y Manning, 2014) sobre Wikipedia 2014 y Gigaword 5, un total de 6.000 millones de tokens, y se distribuyen bajo licencia PDDL (Public Domain Dedication and License), lo que permite uso comercial sin restricciones de atribución relevantes. El repositorio es una redistribución en formato `gensim KeyedVectors`, no un reentrenamiento.

Su relevancia actual es la de un baseline ligero y determinista: 160 MB de pesos en `float32`, inferencia en CPU y la posibilidad de mapear los vectores en memoria sin cargarlos en RAM. Resulta útil para filtrar, clasificar, deduplicar o buscar por similitud antes de justificar el coste de un transformer, y como referencia en experimentos de sentence embeddings. El repositorio acumula 0 descargas y 3 likes, por lo que no cuenta con validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es un transformer: vectores de palabra estáticos entrenados con GloVe (objetivo de mínimos cuadrados ponderados sobre la matriz global de co-ocurrencia) |
| Parámetros totales | 40.000.000 valores en `float32` (400.000 palabras × 100 dimensiones) |
| Parámetros activos | No aplica: no es un modelo MoE ni existe inferencia por token |
| Longitud de contexto | No aplica: cada palabra tiene un único vector independiente del contexto; el pooling de frase no impone ventana |
| Tipos de cuantización | No disponible: el repositorio solo distribuye pesos en `float32` |
| Idiomas soportados | Inglés (`en`), sin distinción de mayúsculas (`uncased`) |
| Licencia | PDDL (Public Domain Dedication and License) |
| Formato de pesos | `gensim KeyedVectors`: `glove-wiki-gigaword-100.model` (vocabulario y metadatos) + `glove-wiki-gigaword-100.model.vectors.npy` (matriz de 400.000 × 100 `float32`, 160 MB); no hay `safetensors` ni GGUF |
| Vocabulario | 400.000 palabras |
| Dimensiones por vector | 100 |
| Corpus de entrenamiento | Wikipedia 2014 + Gigaword 5, 6.000 millones de tokens |
| Tamaño del repositorio | 0,2 GB |
| Librería declarada | `fse` |
| Fecha de creación / actualización | 2022-03-02 / 2026-10-26 |
| Descargas / likes | 0 / 3 |

## Arquitectura y entrenamiento

GloVe no es una red neuronal profunda por token, sino un modelo log-bilineal que ajusta vectores de palabra y vectores de contexto para que su producto escalar reproduzca el logaritmo de las frecuencias de co-ocurrencia, ponderando los pares por una función que reduce el peso de las co-ocurrencias muy frecuentes y de las muy raras. El resultado es una matriz de 400.000 filas y 100 columnas que se consulta por índice; no hay atención, ni capas apiladas, ni estado recurrente. Los vectores se entrenaron sobre Wikipedia 2014 y Gigaword 5, con 6.000 millones de tokens, vocabulario cerrado de 400.000 palabras y texto pasado a minúsculas.

El proceso de entrenamiento es puramente no supervisado y auto-supervisado sobre estadísticas de co-ocurrencia: no hay RLHF, DPO, instrucciones, ajuste supervisado ni preferencias humanas. La capa que añade el empaquetado `fse` es la agregación a nivel de frase: media tipo CBOW, SIF y uSIF, que combinan los vectores de las palabras de una oración en un único vector. En la propia model card se muestra que SIF requiere una llamada previa a `model.train(sentences)` con un corpus de frases, además de la carga de los vectores mediante `Vectors.from_pretrained`, que admite `mmap="r"` para mapear el array de NumPy en lugar de leerlo completo en memoria.

## Capacidades

- Representación de palabras: similitud semántica entre términos y aritmética vectorial sobre un vocabulario cerrado de 400.000 palabras inglesas.
- Representación de frases y documentos cortos mediante pooling CBOW, SIF y uSIF sobre los vectores de palabra.
- Recuperación por similitud: comparación de vectores con distancia coseno sobre conjuntos de hasta 400.000 entradas.
- Extracción de características para modelos clásicos (regresión logística, SVM, árboles) sin dependencia de GPU.
- Carga eficiente en memoria mediante `mmap="r"`, adecuada para procesos con RAM limitada.
- Gestión de vocabulario fuera de diccionario: no disponible; el vocabulario es cerrado y no hay subpalabras, de modo que las palabras ausentes no tienen representación.
- Generación de texto, razonamiento, matemáticas y código: no soportado; el modelo no genera tokens.
- Tool calling y function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no soportado; únicamente inglés.
- Visión, audio y modo de razonamiento explícito (thinking): no soportado.

## Casos de uso

- Clasificación de texto y análisis de sentimiento como baseline: se agregan los vectores de cada reseña con SIF y se entrena un clasificador lineal encima; sirve para fijar una referencia de calidad y coste antes de introducir un transformer.
- Búsqueda semántica interna sobre catálogos pequeños o medianos: se indexan títulos y descripciones como vectores de frase y se recuperan por similitud coseno, con 160 MB de pesos que caben en cualquier servidor.
- Deduplicación y agrupamiento de tickets o noticias: los vectores de frase permiten agrupar textos casi idénticos por umbral de similitud sin coste de GPU, algo útil en pipelines de limpieza de datos.
- Expansión de consultas en motores de búsqueda: se recuperan los términos del vocabulario más próximos al vector de la consulta para añadir sinónimos y mejorar el recall de un índice léxico existente.
- Recomendación basada en contenido: se representan descripciones de productos o artículos y se calcula la similitud entre el vector del ítem y el del historial del usuario.
- Ingeniería de características para modelos tabulares: se generan embeddings de campos textuales (categoría, descripción corta) que alimentan un `XGBoost` o una regresión logística en entornos sin GPU.
- Evaluación y prototipado de pipelines de embeddings: al ser determinista y barato, permite validar la lógica de indexación, normalización y pooling antes de migrar a un modelo contextual.
- Análisis exploratorio de vocabulario: estudio de vecinos semánticos, detección de términos sobrerrepresentados y auditoría preliminar de sesgos léxicos en un corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de tareas de similitud semántica; únicamente enlaza al repositorio de `fse`, donde se publica un benchmark STS de todos los conjuntos de vectores de la organización, sin que los valores concretos estén incluidos en la información proporcionada. Las métricas de generación de código o razonamiento no aplican a un modelo de embeddings estáticos.

## Requisitos de hardware

- VRAM: 0 MB; el modelo no requiere GPU.
- RAM: aproximadamente 160 MB para la matriz de vectores en `float32`, más la sobrecarga del vocabulario de `gensim`; con `mmap="r"` el consumo residente se reduce al de las páginas realmente accedidas.
- GPU recomendadas: no aplica. Cualquier GPU (A100, H100, RTX 4090) aportaría un beneficio marginal, ya que la operación dominante es una consulta de tabla seguida de un pooling.
- CPU: cualquier procesador moderno es suficiente; el coste por frase es proporcional al número de tokens de la frase.
- Cabe en hardware consumer: sí, en cualquier portátil o instancia pequeña, sin requisitos de acelerador.
- Opciones de despliegue: librería `fse` sobre `gensim` y `numpy`; integrable como paso previo de un servicio HTTP propio o dentro de un job por lotes. No aplica el despliegue con vLLM, llama.cpp, Ollama o TGI, orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Dimensiones | Vocabulario | Corpus | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fse/glove-wiki-gigaword-100` | 100 | 400.000 | Wikipedia 2014 + Gigaword 5 (6B tokens) | PDDL | HuggingFace, formato `gensim` |
| GloVe wiki+gigaword de 50 dimensiones | 50 | 400.000 (misma publicación) | Mismo corpus | PDDL | Publicado por Stanford NLP; no verificado en este repositorio |
| GloVe wiki+gigaword de 300 dimensiones | 300 | 400.000 (misma publicación) | Mismo corpus | PDDL | Publicado por Stanford NLP; no verificado en este repositorio |
| `word2vec-google-news-300` | 300 | No disponible en la información proporcionada | Google News | No disponible en la información proporcionada | Disponible fuera de este repositorio |
| `fastText cc.en.300` | 300 | No disponible en la información proporcionada | Common Crawl | No disponible en la información proporcionada | Disponible fuera de este repositorio |

Solo la primera fila está verificada con la información proporcionada. Las variantes dimensionales de GloVe comparten corpus y licencia, por lo que la elección entre 50, 100 y 300 dimensiones es un compromiso entre tamaño (80 MB, 160 MB y 480 MB en `float32`) y expresividad; no hay métricas en la documentación disponible para cuantificar esa diferencia. Frente a `word2vec` y `fastText`, la diferencia cualitativa conocida es que `fastText` incorpora subpalabras y cubre términos fuera de vocabulario, algo que este modelo no ofrece.

## Limitaciones y advertencias

- Vectores estáticos: una palabra polisémica tiene un único vector, por lo que no se resuelven ambigüedades dependientes del contexto.
- Vocabulario cerrado de 400.000 palabras sin subpalabras: erratas, neologismos, nombres propios poco frecuentes y morfología derivada quedan sin representación.
- Solo inglés y en minúsculas: se pierde la información de capitalización y el modelo no es utilizable en castellano sin reentrenar.
- Corpus desactualizado (Wikipedia 2014 y Gigaword 5): entidades, terminología y usos lingüísticos posteriores a 2014 están infrarrepresentados o ausentes.
- Sesgos: los corpus de enciclopedia y de agencia de noticias sobrerrepresentan determinados registros y pueden codificar estereotipos de género, nacionalidad o profesión; la información disponible no incluye ninguna auditoría de sesgo.
- Riesgo de alucinación: no aplica en sentido generativo, pero la similitud vectorial puede producir asociaciones semánticamente plausibles y factualmente incorrectas si se usa como sustituto de una base de conocimiento.
- Licencia: PDDL está orientada a la dedicación al dominio público y permite uso comercial; conviene verificar los términos exactos de la licencia antes de redistribuir los vectores dentro de un producto.
- Requiere configuración adicional: SIF necesita un corpus de frases para `model.train(sentences)`, y la calidad del vector de frase depende críticamente del esquema de pooling y del preprocesado elegidos.
- Sin validación comunitaria: 0 descargas y 3 likes, sin informes de terceros sobre su comportamiento en producción.
- No es un sustituto de un modelo contextual: para tareas de razonamiento, generación, código, multilingüismo o instrucciones no es una opción viable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/fse/glove-wiki-gigaword-100
- Proyecto GloVe de Stanford NLP: https://nlp.stanford.edu/projects/glove/
- Paper original: Pennington, Socher y Manning (2014), "GloVe: Global Vectors for Word Representation": https://nlp.stanford.edu/pubs/glove.pdf
- Repositorio de `fse` (Fast Sentence Embeddings), con código, documentación y benchmark STS: https://github.com/oborchers/Fast_Sentence_Embeddings
- Documentación de `gensim`: https://radimrehurek.com/gensim/
- Licencia PDDL (Open Data Commons): https://opendatacommons.org/licenses/pddl/
- Página del mantenedor de `fse`, Dr. Oliver Borchers: https://www.drborchers.com/
- Nota sobre la búsqueda web: los resultados obtenidos corresponden al Fonds Social Européen (FSE), una entidad sin relación con este modelo, y se han descartado por no ser relevantes.
