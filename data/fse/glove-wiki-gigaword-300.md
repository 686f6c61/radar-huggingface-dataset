# fse/glove-wiki-gigaword-300

## Resumen

`fse/glove-wiki-gigaword-300` no es un modelo de lenguaje: es un paquete de vectores GloVe estáticos de 300 dimensiones para 400.000 palabras en inglés, redistribuido en formato gensim y empaquetado para la librería **fse (Fast Sentence Embeddings)** de Oliver Borchers. Los vectores originales fueron entrenados por el Stanford NLP Group (Pennington, Socher y Manning, 2014) sobre Wikipedia 2014 y Gigaword 5, un corpus de aproximadamente 6.000 millones de tokens, en versión *uncased*.

Su función es servir como capa de representación léxica: convierte palabras en vectores densos y, mediante fse, agrega esos vectores en embeddings de frase con tres estrategias (promedio CBOW, SIF y uSIF). Resuelve el problema de disponer de un *baseline* de embeddings barato, determinista y ejecutable en CPU, útil para comparar contra modelos neuronales de frases o para pipelines con recursos muy limitados.

Es relevante ahora como referencia histórica y como alternativa de coste casi nulo: 480 MB de matriz float32, sin GPU, con memoria mapeada opcional. No compite en calidad semántica con los *sentence transformers* actuales, pero sigue siendo un punto de partida reproducible y de dominio público.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GloVe (Global Vectors for Word Representation): embeddings estáticos de palabra obtenidos por factorización de una matriz de coocurrencia global. No es un transformer ni un modelo generativo |
| Parametros totales | 120.000.000 valores (400.000 palabras × 300 dimensiones), ~480 MB en float32. No hay capas ni pesos de red neuronal, solo una matriz de embeddings |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. El modelo no tiene ventana de contexto; fse agrega los vectores de las palabras de la frase (promedio CBOW, SIF, uSIF) y el límite práctico lo fija la implementación y el coste de memoria |
| Tipos de cuantizacion | No se distribuyen variantes cuantizadas. Los vectores se publican en float32; truncar a float16 o reducir dimensionalidad (PCA) es posible pero no está soportado oficialmente. No hay GGUF ni ONNX en el repositorio |
| Idiomas soportados | Inglés (vocabulario *uncased*) |
| Licencia | PDDL (Open Data Commons Public Domain Dedication and License) |
| Formato de pesos | gensim `KeyedVectors`: `glove-wiki-gigaword-300.model` (vocabulario y metadatos) + `glove-wiki-gigaword-300.model.vectors.npy` (400.000 × 300 float32, 480 MB). Sin safetensors |

## Arquitectura y entrenamiento

GloVe entrena embeddings minimizando una regresión de mínimos cuadrados ponderada sobre el logaritmo de las frecuencias de coocurrencia de pares de palabras en una ventana local, combinando así información global de corpus con estadística local. El resultado es un vector único por palabra y por tanto **no contextual**: la representación de una palabra es idéntica independientemente de la frase en la que aparezca.

Los datos de entrenamiento son Wikipedia 2014 y Gigaword 5, ~6.000 millones de tokens, con vocabulario de 400.000 palabras en minúsculas. La información proporcionada no detalla el tamaño de ventana, los hiperparámetros (`x_max`, `alpha`), el número de épocas ni si hubo ajuste posterior; la model card solo indica el corpus, el recuento de tokens y las dimensiones. No se aplicó RLHF, DPO ni ninguna fase de alineación, al no tratarse de un modelo generativo.

La innovación del paquete no está en los vectores, sino en el envoltorio: fse carga los vectores con `Vectors.from_pretrained(..., mmap="r")` para mapearlos desde disco en lugar de cargarlos en RAM, y ofrece tres agregadores de frase. SIF pondera cada palabra por `a/(a + p(w))` y elimina la primera componente principal; uSIF es una variante no supervisada que elimina la dependencia de estimar frecuencias en el corpus objetivo.

## Capacidades

- Representación vectorial de 400.000 palabras inglesas en 300 dimensiones, con similitud coseno utilizable para relaciones semánticas y analogías del tipo `rey - hombre + mujer ≈ reina`.
- Construcción de embeddings de frase mediante fse con tres modos: promedio CBOW, SIF y uSIF.
- Extracción de características para clasificación de texto, clustering y recuperación de documentos mediante similitud vectorial.
- Carga con memoria mapeada (`mmap="r"`) para reducir el consumo de RAM en despliegues con muchos procesos.
- Ejecución determinista y en CPU, sin dependencias de CUDA ni de frameworks de deep learning.
- **No** genera texto, no responde preguntas, no razona y no sigue instrucciones.
- **No** soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- **No** tiene capacidades multimodales (visión, audio) ni modo *thinking*.
- **No** es multilingüe: únicamente inglés.
- **No** maneja subpalabras: las palabras fuera del vocabulario de 400.000 entradas (erratas, neologismos, morfología productiva) quedan sin vector.

## Casos de uso

- **Baseline reproducible en experimentos de embeddings de frase**: cargar el modelo con fse y calcular SIF/uSIF para obtener una línea base frente a la que medir *sentence transformers*; su coste de ejecución permite repetir experimentos completos en CPU en minutos.
- **Búsqueda semántica ligera sobre corpus pequeños y estáticos**: indexar documentos en una matriz de 300 dimensiones y resolver consultas por similitud coseno con NumPy, sin infraestructura de inferencia ni GPU; adecuado para catálogos de menos de un millón de documentos.
- **Clasificación de texto con pocos datos etiquetados**: usar el promedio de vectores de los tokens como características de entrada para una regresión logística o una SVM, un esquema que generaliza razonablemente en dominios como clasificación de tickets o detección de spam cuando no hay datos para afinar un transformer.
- **Deduplicación y clustering de documentos**: agrupar titulares, abstracts o descripciones de producto por similitud de sus vectores SIF con KMeans o DBSCAN; el sesgo hacia el promedio hace que el método funcione mejor en textos cortos y homogéneos.
- **Expansión de consultas y recuperación léxica**: dado un término, recuperar sus 20 vecinos más próximos para ampliar una consulta en un motor de búsqueda tipo Elasticsearch sin incorporar un modelo neuronal.
- **Sistemas empotrados o con restricciones severas de memoria**: desplegar en contenedores de 512 MB o en dispositivos sin acelerador, usando `mmap="r"` para compartir la matriz entre procesos sin duplicar los 480 MB.
- **Análisis lexicográfico y exploración de sesgos**: inspeccionar vecindades para estudiar asociaciones de género, nacionalidad u ocupación en un corpus de 2014, con la ventaja de que el modelo es pequeño, abierto y de dominio público.
- **Preprocesamiento barato en pipelines de NLP**: generar características densas de frases como entrada de un clasificador posterior o como señal de *deduplication* previa a un filtrado más caro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, GLUE, STS ni de ningún otro conjunto de evaluación; únicamente remite al repositorio de GitHub de fse, donde el autor indica que publica el benchmark STS de todos sus conjuntos de vectores, sin reproducir los números en la ficha.

Dado que el modelo no es generativo, las métricas aplicables serían exclusivamente de similitud semántica de frases (STS) o de analogías léxicas, no evaluaciones de razonamiento o código. Cualquier cifra concreta debería obtenerse ejecutando la evaluación en el repositorio citado.

## Requisitos de hardware

- **VRAM**: 0 MB en GPU; el modelo está pensado para CPU. En memoria principal ocupa ~480 MB en float32 (400.000 × 300 × 4 bytes) y ~240 MB si se trunca a float16.
- **GPU recomendadas**: ninguna. Cualquier GPU es irrelevante para este *workload*; la vectorización se hace con NumPy/BLAS.
- **Consumer GPU**: no aplica; cabe en cualquier equipo, incluida una Raspberry Pi con 1 GB de RAM libre usando `mmap="r"`.
- **Despliegue**: gensim (`KeyedVectors.load`) y fse (`Vectors.from_pretrained`, `SIF`, `uSIF`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, que sirven modelos generativos.
- **Latencia y throughput**: no disponibles en la información proporcionada. Dependen del hardware y del tamaño de la frase; el cálculo es un promedio ponderado de 300 dimensiones por token más una proyección, y el coste dominante suele ser la tokenización, no el modelo.
- **Almacenamiento**: repositorio de 0,5 GB; el fichero `.npy` de vectores es de 480 MB.

## Comparativa con modelos similares

La comparativa se basa en conocimiento general sobre modelos de la misma categoría y no en datos incluidos en la información proporcionada; los campos marcados deben verificarse en las fuentes originales.

| Modelo | Tipo | Dimensiones | Vocabulario | Contexto | Licencia |
|---|---|---|---|---|---|
| glove-wiki-gigaword-300 (este) | GloVe estático, uncased | 300 | 400.000 | no aplica | PDDL |
| GloVe 840B 300d (Stanford) | GloVe estático, cased | 300 | ~2.200.000 | no aplica | PDDL (según Stanford, no verificado aquí) |
| word2vec GoogleNews-vectors-negative300 | word2vec estático | 300 | ~3.000.000 | no aplica | No disponible; redistribución restringida |
| fastText wiki-news-300d-1M | fastText con subpalabras | 300 | ~1.000.000 | no aplica | No verificada en la información disponible |
| all-MiniLM-L6-v2 (sentence-transformers) | Transformer encoder | 384 | subpalabras BPE | 256 tokens | Apache-2.0 (según el autor, no verificado aquí) |

Diferencias clave: frente a GloVe 840B, este paquete cubre menos vocabulario y pierde las mayúsculas, pero es un 18 % del tamaño. Frente a word2vec GoogleNews, la licencia PDDL elimina la ambigüedad legal para uso comercial. Frente a fastText, carece de subpalabras y por tanto es más frágil ante erratas y morfología. Frente a all-MiniLM-L6-v2, la diferencia cualitativa es que aquel produce embeddings contextuales y este no, a cambio de un coste de ejecución tres órdenes de magnitud menor.

## Limitaciones y advertencias

- **No es un modelo generativo**: no puede responder preguntas, redactar, resumir ni ejecutar instrucciones. Cualquier caso de uso que requiera generación de texto queda fuera de su alcance.
- **Sin contextualización**: una única representación por palabra, de modo que "bank" (banco financiero) y "bank" (orilla) comparten vector. El rendimiento en tareas que dependen del sentido cae de forma notable frente a modelos contextuales.
- **Sin subpalabras**: el vocabulario es cerrado y en minúsculas; erratas, *hashtags*, identificadores de código y neologismos producen vectores ausentes. fse no aplica ninguna estrategia de respaldo por defecto que la información proporcionada documente.
- **Sesgos del corpus**: Wikipedia 2014 y Gigaword 5 (noticias en inglés) sobrerrepresentan determinadas geografías, profesiones y perspectivas; los vectores reproducen asociaciones de género, nacionalidad y religión presentes en esas fuentes.
- **Solo inglés**: no hay soporte multilingüe ni vocabulario en castellano; usarlo con texto en español degradará los resultados a palabras ausentes o a coincidencias accidentales.
- **Calidad superada**: como referencia, los embeddings estáticos de 2014 quedan por detrás de los *sentence transformers* actuales en similitud semántica de frases; no deben elegirse cuando la calidad sea el criterio principal.
- **Licencia**: PDDL es una dedicación al dominio público que permite uso comercial y modificación sin atribución obligatoria; aun así, conviene conservar la referencia a Stanford NLP y verificar la licencia de los vectores originales en su página.
- **Mantenimiento**: la librería fse es un proyecto de nicho con pocas contribuciones; el repositorio de Hugging Face registra 0 descargas, por lo que la comunidad y el soporte son mínimos. Validar la compatibilidad con versiones recientes de gensim y NumPy antes de producción.
- **Normalización**: los vectores no se entregan normalizados; para similitud coseno hay que normalizar explícitamente o usar la métrica adecuada, y para SIF es necesario estimar frecuencias del corpus objetivo.
- **Metadatos a revisar**: la ficha indica creación en 2022 y actualización en 2026, probablemente por una migración de metadatos de la plataforma; no implica una nueva versión de los vectores.

## Enlaces

- Hugging Face: https://huggingface.co/fse/glove-wiki-gigaword-300
- GloVe, Stanford NLP Group: https://nlp.stanford.edu/projects/glove/
- Paper original (Pennington, Socher y Manning, 2014): https://nlp.stanford.edu/pubs/glove.pdf
- Repositorio de fse: https://github.com/oborchers/Fast_Sentence_Embeddings
- Documentación de gensim: https://radimrehurek.com/gensim/
- Licencia PDDL: https://opendatacommons.org/licenses/pddl/
- Autor de fse, Oliver Borchers: https://www.drborchers.com/

Nota: la búsqueda web realizada devolvió únicamente resultados sobre el Fondo Social Europeo (FSE), sin relación con este modelo; no se han incluido por no ser pertinentes.
