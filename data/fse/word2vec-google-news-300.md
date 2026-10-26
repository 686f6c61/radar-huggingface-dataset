# fse/word2vec-google-news-300

## Resumen

`fse/word2vec-google-news-300` es un conjunto de vectores de palabras (word embeddings) estáticos de 300 dimensiones para 3 millones de palabras y expresiones en inglés, entrenados sobre una parte del corpus Google News de aproximadamente 100.000 millones de palabras. No es un modelo generativo ni un transformer: es la redistribución, en formato gensim, de los vectores publicados originalmente por Google con el proyecto word2vec, empaquetados por el autor `fse` para su uso con la librería Fast Sentence Embeddings.

El repositorio resuelve un problema muy concreto: disponer de los clásicos vectores de Google News en un formato que gensim puede cargar directamente y que la librería `fse` puede convertir en embeddings de frase mediante técnicas de pooling (media CBOW, SIF y uSIF). Históricamente, el formato original distribuido por Google era un binario `.bin` que requería conversión; este repositorio ofrece el fichero `KeyedVectors` de gensim junto con la matriz de vectores en `float32` (3.000.000 × 300, 3,6 GB) lista para cargar o mapear en memoria.

Su relevancia actual es la de un componente clásico de línea base: sigue siendo útil como referencia en tareas de similitud léxica, como extractor de características barato en CPU para clasificadores y sistemas de recuperación, y como punto de comparación frente a modelos de embeddings contextuales. La licencia Apache 2.0 facilita su uso comercial, y el tamaño del vocabulario (incluye expresiones multivocablo detectadas con el método data-driven del paper de Mikolov et al.) lo hace adecuado para dominios con jerga periodística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | word2vec (embeddings estáticos a nivel de palabra; la model card no especifica si el entrenamiento fue CBOW o skip-gram) |
| Parametros totales | 900.000.000 valores `float32` (3.000.000 de entradas × 300 dimensiones); no son parámetros de una red neuronal profunda |
| Parametros activos | no aplica (no es un modelo MoE ni una red con activaciones por token) |
| Longitud de contexto | no aplica; es un modelo de vectores por palabra. La ventana de entrenamiento no se indica en la información disponible |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en `float32`. `fse` permite mapear el fichero en memoria (`mmap="r"`) en lugar de cargarlo completo |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | gensim `KeyedVectors`: `word2vec-google-news-300.model` (vocabulario y metadatos) + `word2vec-google-news-300.model.vectors.npy` (matriz `float32` de 3,6 GB) |

## Arquitectura y entrenamiento

Se trata de embeddings estáticos obtenidos con word2vec sobre una parte del dataset Google News, con un vocabulario de 3 millones de palabras y expresiones en inglés y 300 dimensiones por vector. Las expresiones multivocablo se obtuvieron con el enfoque data-driven descrito en «Distributed Representations of Words and Phrases and their Compositionality» (Mikolov et al., 2013), que es también la referencia de las técnicas de subsampling de palabras frecuentes y negative sampling empleadas en la familia word2vec. La model card no detalla hiperparámetros concretos (ventana, número de muestras negativas, epochs ni si se usó CBOW o skip-gram), por lo que esos datos deben considerarse no disponibles.

La aportación del repositorio `fse` no está en el entrenamiento sino en el empaquetado: convierte los vectores de palabra en vectores de frase mediante media CBOW, SIF (smooth inverse frequency) y uSIF, implementados en la librería Fast Sentence Embeddings de Oliver Borchers. SIF requiere un paso de entrenamiento ligero sobre el corpus de frases para estimar las frecuencias y la componente principal que se resta; el resto del proceso es aritmética sobre los vectores preentrenados. No hay fine-tuning del espacio de embeddings ni ningún tipo de RLHF o DPO: el modelo es puramente estático.

## Capacidades

- Representación vectorial de palabras y expresiones en inglés, con 300 dimensiones por entrada y un vocabulario de 3 millones de entradas.
- Similitud semántica léxica (coseno entre vectores) y analogías vectoriales del estilo `rey - hombre + mujer`.
- Construcción de embeddings de frase mediante pooling CBOW, SIF y uSIF a través de `fse`.
- Extracción de características para clasificadores clásicos (regresión logística, SVM, árboles) en tareas de análisis de sentimiento, clasificación de temas o detección de spam.
- Capacidad de mapear los vectores en memoria con `mmap`, lo que permite usarlos en entornos con RAM limitada.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo «thinking», ni visión, ni audio.
- No genera texto: no es un modelo de lenguaje, es un diccionario de vectores.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Línea base en evaluación de embeddings: usar estos vectores como referencia clásica al comparar modelos contextuales en tareas de similitud semántica o clasificación, aprovechando que el repositorio incluye el benchmark STS de todos los conjuntos de vectores de la organización `fse`.
- Clasificación de textos periodísticos en producción: promediar los vectores de las palabras de un titular o párrafo y alimentar con ese vector un clasificador lineal; el coste en CPU es muy bajo y no requiere GPU.
- Búsqueda léxica y recuperación de documentos: indexar documentos como vectores de frase (SIF/uSIF) y recuperar por similitud coseno en lugar de por coincidencia exacta de términos, útil en motores de búsqueda internos con presupuesto de infraestructura reducido.
- Deduplicación y agrupamiento de noticias: agrupar titulares o resúmenes por cercanía vectorial para detectar cables repetidos o historias relacionadas en un agregador.
- Expansión de consultas y sinónimos: dado un término, obtener los vecinos más próximos del vocabulario para enriquecer consultas o construir diccionarios de sinónimos específicos de dominio periodístico.
- Preprocesamiento para pipelines de NLP: generar representaciones de entrada para modelos posteriores o para técnicas de interpretabilidad (comparación de vecinos, análisis de sesgos en el espacio vectorial).
- Prototipado rápido y docencia: cargar el modelo con `Vectors.from_pretrained(..., mmap="r")` y disponer de embeddings en minutos sin infraestructura de inferencia ni dependencias de GPU, algo útil para enseñar conceptos de espacios vectoriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (ni SimLex, ni WordSim-353, ni resultados STS numéricos), y la búsqueda web realizada no ha devuelto datos de rendimiento del modelo. El repositorio `fse` en GitHub menciona la existencia de un benchmark STS para todos los conjuntos de vectores de la organización, pero los valores concretos no forman parte de la información proporcionada.

## Requisitos de hardware

- VRAM: no aplica en el uso habitual; el modelo se ejecuta en CPU. Si se carga completo en memoria, requiere en torno a 3,6 GB de RAM para la matriz de vectores `float32`, más la sobrecarga del vocabulario y los metadatos de gensim.
- Memoria con `mmap`: el mapeo en memoria (`mmap="r"`) evita cargar los 3,6 GB en RAM de forma residente; el sistema operativo pagina bajo demanda, por lo que el consumo efectivo depende del patrón de acceso.
- GPU recomendadas: ninguna. No hay kernels de GPU específicos en la información disponible; el cálculo es aritmética de vectores que puede hacerse con NumPy en CPU.
- Cabe en cualquier GPU consumer y en cualquier portátil con suficiente RAM o disco; también en entornos sin GPU.
- Opciones de despliegue: `gensim` (`KeyedVectors.load`), la librería `fse` (instalable con `pip install fse`), y NumPy directamente sobre el fichero `.npy`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Los datos de las alternativas provienen de conocimiento público general y no de la información proporcionada; se marcan como no verificados en este contexto.

| Modelo | Dimensiones | Vocabulario | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `fse/word2vec-google-news-300` | 300 | 3.000.000 palabras y expresiones | en | Apache 2.0 | Empaquetado gensim + soporte `fse` para SIF/uSIF; 3,6 GB |
| GoogleNews-vectors-negative300 (original) | 300 | 3.000.000 | en | Apache 2.0 | Mismo contenido en formato binario `.bin` original de Google; requiere conversión a gensim |
| GloVe (Stanford) | 50, 100, 200, 300 | depende del corpus (6B, 42B, 840B tokens) | en (y versiones multilingües) | dominio público / Open Data Commons (no verificado aquí) | Entrenado con matriz de coocurrencia; sin expresiones multivocablo |
| fastText (Facebook) | 300 | varios cientos de miles a millones | 157 idiomas en la versión multilingüe | MIT (no verificado aquí) | Usa subpalabras, por lo que genera vectores para palabras fuera de vocabulario |

La ventaja diferencial de este repositorio frente al binario original de Google es el formato: carga directa con gensim y compatibilidad con el pooling de frases de `fse`. Frente a GloVe, el vocabulario es mayor y la licencia Apache 2.0 es explícita; frente a fastText, pierde la capacidad de representar palabras desconocidas mediante subpalabras.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no mantiene conversaciones. Cualquier caso de uso que requiera generación queda fuera de su alcance.
- Solo inglés: el vocabulario y el corpus de entrenamiento son monolingües, por lo que el rendimiento en castellano u otros idiomas es prácticamente nulo.
- Vectores estáticos: cada palabra tiene una única representación, sin desambiguación por contexto. «Banco» (entidad financiera) y «banco» (asiento) comparten vector, lo que introduce errores en tareas sensibles al sentido.
- Sesgos: al estar entrenado sobre Google News, el espacio vectorial hereda los sesgos de género, nacionalidad, religión y etnia presentes en la cobertura periodística de la época. Se han documentado ampliamente analogías sesgadas en este tipo de vectores; conviene auditar los vecinos más próximos antes de usar el modelo en sistemas de selección, ranking o recomendación.
- Cobertura de vocabulario desactualizada: el corpus es anterior a 2013, por lo que términos y entidades posteriores no están representados. No hay soporte de subpalabras, así que las palabras fuera de vocabulario no tienen vector.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de resultados sin sentido en analogías y similitudes cuando los términos son polisémicos o poco frecuentes.
- Licencia: Apache 2.0 permite uso comercial y modificación con atribución; el repositorio redistribuye vectores publicados por Google bajo la misma licencia. Conviene conservar el aviso de licencia y citar los papers originales.
- Producción: el fichero completo ocupa 3,8 GB de repositorio; sin `mmap`, la carga inicial consume varios segundos y 3,6 GB de RAM. En servicios con múltiples workers hay que planificar la memoria o compartir el mapeo.
- Empaquetado con `library_name: fse`: no es un modelo con `pipeline_tag` estándar de HuggingFace, por lo que `transformers` no puede cargarlo. La integración debe hacerse con gensim o `fse`.
- La búsqueda web realizada devuelve resultados sobre el Fondo Social Europeo (FSE), una entidad sin relación con este repositorio; no se ha encontrado documentación externa adicional del modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/fse/word2vec-google-news-300
- Repositorio de Fast Sentence Embeddings: https://github.com/oborchers/Fast_Sentence_Embeddings
- Web del autor, Dr. Oliver Borchers: https://www.drborchers.com/
- Mikolov et al. (2013), Efficient Estimation of Word Representations in Vector Space: https://arxiv.org/abs/1301.3781
- Mikolov et al. (2013), Distributed Representations of Words and Phrases and their Compositionality: https://arxiv.org/abs/1310.4546
- Proyecto original word2vec de Google (incluye la publicación de los vectores): https://code.google.com/archive/p/word2vec/
