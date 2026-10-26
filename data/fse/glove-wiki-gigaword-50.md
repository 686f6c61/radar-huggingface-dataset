# fse/glove-wiki-gigaword-50

## Resumen

`fse/glove-wiki-gigaword-50` no es un modelo generativo ni un transformer: es un paquete de vectores de palabras GloVe de 50 dimensiones para 400.000 palabras en inglés, redistribuido en formato gensim `KeyedVectors` y empaquetado para la librería fse (*Fast Sentence Embeddings*). Los vectores originales fueron publicados por el Stanford NLP Group (Pennington, Socher y Manning, 2014) y se entrenaron sobre Wikipedia 2014 y Gigaword 5, un total de 6.000 millones de tokens, sin distinción de mayúsculas.

El repositorio resuelve un problema de ingeniería concreto: tomar un conjunto de embeddings estáticos ampliamente conocido y ofrecerlo con una API lista para usar que convierte vectores de palabra en vectores de frase mediante promediado CBOW, SIF y uSIF. Esto permite construir líneas base de similitud semántica, clustering o clasificación de texto sin depender de un modelo neuronal pesado y sin necesidad de GPU.

Su relevancia actual es la de un *baseline* barato y reproducible: 80 MB de pesos float32, ejecución en CPU, licencia de dominio público (PDDL) y una integración de dos líneas de código. No compite con modelos de embeddings neuronales modernos en calidad, pero sigue siendo útil como referencia, para entornos con recursos muy limitados y para docencia. Conviene señalar que el repositorio tiene 0 descargas y 4 likes, y que la búsqueda web realizada no devolvió resultados relacionados con el modelo (los enlaces encontrados corresponden al Fondo Social Europeo, una entidad homónima sin relación).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos de palabras GloVe (factorización de matriz de co-ocurrencia global); no es un transformer ni un modelo generativo |
| Parametros totales | 20.000.000 valores float32 (400.000 palabras × 50 dimensiones) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible; no existe ventana de contexto, la representación es de bolsa de palabras |
| Tipos de cuantizacion | No disponible; el repositorio solo distribuye vectores float32 (no se ofrecen variantes GGUF, int8 ni float16) |
| Idiomas soportados | Inglés (`en`), vocabulario sin distinción de mayúsculas |
| Licencia | PDDL (Public Domain Dedication and License) |
| Formato de pesos | gensim `KeyedVectors` (`glove-wiki-gigaword-50.model`) más `glove-wiki-gigaword-50.model.vectors.npy` (400.000 × 50 float32, 80 MB) |

## Arquitectura y entrenamiento

GloVe (Global Vectors for Word Representation) no usa una red neuronal profunda: construye una matriz global de co-ocurrencia palabra-palabra sobre el corpus y la factoriza con mínimos cuadrados ponderados, de modo que el producto escalar de dos vectores aproxima el logaritmo de su frecuencia de co-ocurrencia. El resultado es un embedding estático por palabra, de 50 dimensiones en esta variante. El corpus de entrenamiento combina Wikipedia 2014 y Gigaword 5, con 6.000 millones de tokens y tokenización en minúsculas, lo que da un vocabulario final de 400.000 entradas.

No hay fases de ajuste fino con RLHF ni DPO, ni decodificación especulativa, ni atención: el artefacto es una tabla de consulta. La innovación que aporta este repositorio no está en el modelo, sino en el empaquetado: la librería fse aplica sobre los vectores técnicas de composición a nivel de frase (promediado CBOW, SIF y uSIF) y permite cargar los pesos con `mmap="r"` para mapear el fichero `.npy` en memoria en lugar de copiarlo a RAM.

## Capacidades

- Representación vectorial de palabras individuales en inglés: 400.000 entradas de 50 dimensiones.
- Composición de vectores de frase mediante promediado CBOW, SIF (Smooth Inverse Frequency) y uSIF, a través de la librería fse.
- Cálculo de similitud semántica entre palabras y entre frases (producto escalar o coseno sobre los vectores resultantes).
- Extracción de características para modelos clásicos de machine learning (regresión logística, SVM, clustering).
- Carga con mapeo de memoria (`mmap="r"`) para reducir el consumo de RAM.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling ni uso como agente.
- No soporta multilingüismo: únicamente inglés.
- Sin subword units: las palabras fuera del vocabulario de 400.000 entradas no tienen vector (a diferencia de fastText, que sí descompone en n-gramas de caracteres).

## Casos de uso

- Línea base de similitud semántica de frases: cargar los vectores con `Vectors.from_pretrained` y aplicar SIF o uSIF para obtener un vector por frase, útil como referencia mínima antes de evaluar embeddings neuronales en una tarea de *semantic textual similarity*.
- Clustering y deduplicación de titulares o documentos cortos en inglés: promediar los vectores de las palabras de cada documento y agrupar con k-means; el coste es de milisegundos por documento en CPU.
- Búsqueda semántica ligera en catálogos pequeños: indexar frases como vectores de 50 dimensiones y recuperar por similitud coseno, sin infraestructura de GPU ni servidor de inferencia.
- Ingeniería de características para clasificación de texto: usar el vector medio de cada documento como entrada de un clasificador lineal, lo que permite entrenar sobre corpus grandes con muy poco cómputo.
- Preprocesado para topic modelling: generar representaciones densas de documentos para inicializar o complementar LDA/NMF en pipelines de análisis de contenido.
- Despliegue en entornos con restricciones severas (dispositivos embebidos, contenedores pequeños, funciones serverless): el fichero de 80 MB, o menos si se recorta el vocabulario, cabe en memoria de un contenedor mínimo y no requiere acelerador.
- Docencia y reproducción de experimentos: al estar bajo PDDL, se puede distribuir y usar sin restricciones en materiales de curso y cuadernos de prácticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La organización fse mantiene un benchmark de tipo STS para todos sus conjuntos de vectores en el repositorio de GitHub, pero las puntuaciones concretas de esta variante de 50 dimensiones no figuran en los datos proporcionados, por lo que no se incluyen cifras.

## Requisitos de hardware

- Inferencia en CPU: no requiere GPU. El cálculo es una búsqueda en tabla más operaciones de media ponderada sobre 50 dimensiones.
- VRAM: 0 GB. No aplica.
- Memoria RAM: aproximadamente 80 MB si se cargan los 400.000 vectores float32 completos; se reduce al usar `mmap="r"`, que mapea el `.npy` desde disco.
- GPU recomendadas: ninguna. Cualquier CPU moderna es suficiente; no hay soporte documentado para aceleración en A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo y en cualquier equipo de gama baja, aunque no se aprovecha el acelerador.
- Opciones de despliegue: librería `fse` (instalable con `pip install fse`) y gensim para cargar los `KeyedVectors`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo autoregresivo ni se distribuye en GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Dimensiones | Vocabulario | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| fse/glove-wiki-gigaword-50 (este) | 50 | 400.000 | No aplica | PDDL | gensim `KeyedVectors` + `.npy` float32 |
| GloVe wiki-gigaword-100 (misma familia) | 100 | 400.000 | No aplica | PDDL | texto/`.npy` según distribución |
| GloVe wiki-gigaword-300 (misma familia) | 300 | 400.000 | No aplica | PDDL | texto/`.npy` según distribución |
| word2vec-google-news-300 | 300 | ~3.000.000 | No aplica | No verificada en la información disponible | binario word2vec |
| fastText crawl-300d-2M | 300 | 2.000.000 con subpalabras | No aplica | No verificada en la información disponible | `.vec` / binario |

Las variantes de 100 y 300 dimensiones de GloVe sobre el mismo corpus forman parte de la publicación original de Stanford y comparten licencia PDDL; a mayor número de dimensiones se espera mejor calidad semántica a cambio de más memoria y cómputo, pero no se dispone de cifras comparativas en la información proporcionada. Los datos de licencia y vocabulario de word2vec-google-news-300 y fastText no están confirmados en las fuentes consultadas y deben verificarse antes de un uso comercial.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a instrucciones y no razona. Cualquier expectativa de uso conversacional es inválida.
- Sesgos conocidos: los vectores GloVe entrenados sobre Wikipedia y Gigaword heredan sesgos de género, nacionalidad y profesión documentados en la literatura sobre embeddings estáticos; no se han aplicado mitigaciones en este repositorio.
- Vocabulario cerrado y sin subpalabras: las palabras no presentes en las 400.000 entradas (incluidas erratas, neologismos y términos técnicos recientes) quedan sin representación.
- Cobertura monolingüe: solo inglés, con tokenización en minúsculas, por lo que se pierde información de capitalización y de límites de frase.
- La composición a nivel de frase por promediado ignora el orden de las palabras; SIF y uSIF mitigan parcialmente el problema de las palabras frecuentes, pero no modelan sintaxis ni negación.
- Calidad limitada por la dimensionalidad: 50 dimensiones es la variante más pequeña de la familia GloVe y la de menor capacidad de discriminación semántica.
- Licencia: PDDL permite uso comercial y redistribución sin restricciones atribucionales significativas, pero conviene conservar la referencia a los autores originales (Pennington, Socher y Manning, 2014) por buenas prácticas académicas.
- Repositorio de terceros: se trata de una redistribución (autor `fse`, 0 descargas, 4 likes) y no de la fuente canónica; para producción conviene validar la integridad de los ficheros frente a la publicación original de Stanford.
- En producción, un embedding estático de 50 dimensiones rara vez alcanza la calidad de los modelos de sentence-transformers actuales; úsese como línea base o en escenarios con restricciones extremas de recursos, no como opción por defecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fse/glove-wiki-gigaword-50
- Proyecto GloVe de Stanford NLP (vectores originales): https://nlp.stanford.edu/projects/glove/
- Artículo original: Pennington, Socher y Manning (2014), "GloVe: Global Vectors for Word Representation": https://nlp.stanford.edu/pubs/glove.pdf
- Repositorio de la librería fse (código, documentación y benchmark STS): https://github.com/oborchers/Fast_Sentence_Embeddings
- Documentación de gensim: https://radimrehurek.com/gensim/
- Licencia PDDL (Open Data Commons): https://opendatacommons.org/licenses/pddl/
- Autor del paquete fse, Dr. Oliver Borchers: https://www.drborchers.com/
- Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos corresponden al Fonds Social Européen (fse.gouv.fr), una entidad sin relación con el repositorio.
