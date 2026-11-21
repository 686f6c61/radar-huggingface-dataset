# fse/glove-wiki-gigaword-300

## Resumen

GloVe Wikipedia + Gigaword (300 dimensiones) es un conjunto de vectores de palabras preentrenados que redistribuye el repositorio `fse/glove-wiki-gigaword-300` en formato gensim para su uso con la librería fse (Fast Sentence Embeddings). Los vectores originales fueron publicados por el Stanford NLP Group mediante el algoritmo GloVe (Pennington, Socher y Manning, 2014), entrenados sobre Wikipedia 2014 y Gigaword 5 (6.000 millones de tokens, en minúsculas), y cubren 400.000 palabras del inglés. El repositorio lo mantiene el usuario `fse`, asociado al proyecto de Oliver Borchers.

No se trata de un modelo generativo ni de un transformer: es una matriz de embeddings estáticos de 400.000 × 300 valores float32 (480 MB), empaquetada junto a los metadatos del vocabulario en un objeto `KeyedVectors` de gensim. Su función es proporcionar representaciones léxicas densas que fse transforma en vectores de frase mediante promediado CBOW, SIF y uSIF, lo que permite construir codificadores de frases ligeros sin entrenamiento neuronal profundo.

Su relevancia actual es la de una alternativa de bajísimo coste computacional para tareas de similitud semántica, búsqueda léxica y clasificación de texto cuando no se dispone de GPU o cuando se necesita un baseline reproducible. Es importante señalar que este repositorio usa la API de fse 1.x y requiere `fse<2`; para fse 2.0 el autor indica el repositorio `fse/glove-wiki-gigaword-300-raw`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings de palabras estáticos (GloVe, modelo de coocurrencia global con regresión log-bilineal); no es un transformer |
| Parametros totales | 120.000.000 valores float32 (400.000 palabras × 300 dimensiones); no es un modelo neuronal con parámetros entrenables en el sentido habitual |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de palabras; el contexto lo determina la frase que se vectoriza) |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen como float32 (`.npy`), sin versiones cuantizadas publicadas |
| Idiomas soportados | Inglés (`en`), vocabulario en minúsculas (uncased) |
| Licencia | PDDL (Public Domain Dedication and License) |
| Formato de pesos | gensim `KeyedVectors` (`.model`) + matriz `.model.vectors.npy` (400.000 × 300 float32, 480 MB) |

## Arquitectura y entrenamiento

GloVe no es una red neuronal profunda secuencial sino un método de factorización de la matriz de coocurrencia de palabras. Se construye una matriz global de coocurrencias sobre el corpus y se optimiza una regresión log-bilineal ponderada que aproxima el logaritmo de la probabilidad de coocurrencia mediante el producto escalar de los vectores de las dos palabras más sesgos por palabra. El resultado son dos conjuntos de vectores (palabra y contexto) que en la distribución estándar se suman para producir el embedding final de 300 dimensiones.

El corpus de entrenamiento son Wikipedia 2014 y Gigaword 5, con un total de 6.000 millones de tokens, vocabulario de 400.000 palabras y tokenización en minúsculas. No hay datos publicados en la información disponible sobre hiperparámetros concretos (ventana de contexto, dimensión de coocurrencia, número de épocas) ni sobre ajuste fino posterior con RLHF o DPO, algo que no aplica a este tipo de modelo.

La innovación del empaquetado `fse` es operativa: convierte los vectores de palabra en vectores de frase mediante CBOW (promedio de los vectores de los tokens), SIF (Smooth Inverse Frequency, ponderación por frecuencia y eliminación de la primera componente principal) y uSIF (variante no supervisada de SIF). Además, `Vectors.from_pretrained(..., mmap="r")` permite mapear la matriz en memoria en lugar de cargarla en RAM.

## Capacidades

- Representación vectorial de palabras individuales del inglés (400.000 entradas de vocabulario, 300 dimensiones).
- Construcción de embeddings de frase mediante CBOW, SIF y uSIF a través de la API de fse.
- Cálculo de similitud semántica y distancia coseno entre palabras y entre frases.
- Soporte de carga con memory mapping (`mmap="r"`) para reducir el consumo de RAM.
- No dispone de generación de texto, razonamiento, código ni matemáticas: no es un modelo generativo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés; no cubre otros idiomas.
- No incluye modo de razonamiento (thinking mode), visión ni audio.

## Casos de uso

- Búsqueda semántica ligera en inglés: vectorizar documentos y consultas con SIF/uSIF y recuperar por similitud coseno en un índice vectorial, sin necesidad de GPU y con un coste de memoria de 480 MB para el vocabulario completo.
- Deduplicación y agrupamiento de textos: calcular embeddings de frases con CBOW y agrupar por similitud para eliminar duplicados en corpus de noticias o tickets, aprovechando que el modelo se entrena sobre Wikipedia y Gigaword, dominios periodísticos y enciclopédicos.
- Baseline reproducible para investigación en similitud semántica: el proyecto fse publica el benchmark STS de todos sus conjuntos de vectores, lo que permite comparar métodos de composición (CBOW frente a SIF frente a uSIF) con una referencia fija.
- Clasificación de texto con modelos lineales: usar los vectores de frase como características de entrada para regresión logística o SVM en tareas de análisis de sentimiento o categorización de noticias, con un pipeline que cabe en CPU.
- Enrutamiento y filtrado previo en pipelines RAG: emplear los embeddings para una primera fase de recuperación de bajo coste antes de recurrir a un modelo de embeddings neuronal más caro, reduciendo el número de candidatos.
- Extracción de similitudes léxicas y expansión de consultas: explotar las relaciones vectoriales entre palabras (vecinos más próximos) para construir sinónimos y ampliar consultas en motores de búsqueda en inglés.
- Prototipado y docencia: disponer de un modelo de embeddings descargable en segundos (0,5 GB de repositorio) para demostrar conceptos de espacio vectorial, SIF y evaluación STS sin infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas propias; únicamente remite al benchmark STS de todos los conjuntos de vectores mantenido en el repositorio de GitHub de Fast Sentence Embeddings, sin cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es puramente CPU.
- RAM: aproximadamente 480 MB para la matriz de vectores en float32 si se carga completa; con `mmap="r"` el consumo se reduce al conjunto de páginas accedidas.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente. No se han publicado cifras de latencia o throughput.
- Cabe en cualquier equipo de consumo, incluidos portátiles de gama baja y entornos sin acelerador.
- Opciones de despliegue: la librería fse (`pip install "fse<2"`), que envuelve gensim; también es posible cargar directamente los `KeyedVectors` de gensim. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Dimensiones | Vocabulario | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fse/glove-wiki-gigaword-300 | GloVe estático (empaquetado gensim) | 300 | 400.000 palabras | No aplica | PDDL | Hugging Face, 0,5 GB |
| GloVe original (Stanford NLP, glove.6B.300d) | GloVe estático | 300 | 400.000 palabras | No aplica | PDDL | Descarga directa desde Stanford NLP |
| Word2Vec de Google News (gensim) | Embeddings estáticos | 300 | 3.000.000 palabras | No aplica | No disponible en la información | Distribución original de Google |
| fastText (wiki.en) | Embeddings con subpalabras | 300 | No disponible en la información | No aplica | MIT (según distribución original) | Sitio de fastText |

La comparación con modelos de embeddings de frase neuronales (por ejemplo, Sentence-BERT) no se incluye porque no se dispone de datos de rendimiento en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo puramente léxico: no captura contexto, negación, orden de palabras ni ambigüedad semántica más allá de lo que permite la composición por promedio.
- Sesgos: al entrenarse sobre Wikipedia 2014 y Gigaword 5, hereda los sesgos demográficos, culturales y de género presentes en esos corpus; no se han publicado evaluaciones de sesgo en la información disponible.
- Riesgo de alucinación: no aplica en sentido generativo, pero la similitud vectorial puede producir asociaciones espurias entre términos.
- Cobertura limitada al inglés y a 400.000 palabras en minúsculas; las palabras fuera de vocabulario no tienen representación (a diferencia de fastText, que usa subpalabras).
- Incompatibilidad de versión: el repositorio requiere `fse<2`; con fse 2.0 debe usarse `fse/glove-wiki-gigaword-300-raw`. Migrar sin seguir la guía puede romper el código.
- Licencia PDDL: permite uso comercial y modificación sin atribución obligatoria, pero conviene revisar los términos exactos de la Open Data Commons PDDL antes de su explotación en producción.
- No apto para tareas generativas, agentes, tool calling ni razonamiento multi-paso; su uso en producción debe limitarse a recuperación, similitud y clasificación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fse/glove-wiki-gigaword-300
- Variante para fse 2.0: https://huggingface.co/fse/glove-wiki-gigaword-300-raw
- Paper de GloVe (Pennington, Socher y Manning, 2014): https://nlp.stanford.edu/pubs/glove.pdf
- Página oficial de GloVe, Stanford NLP Group: https://nlp.stanford.edu/projects/glove/
- Repositorio de Fast Sentence Embeddings: https://github.com/oborchers/Fast_Sentence_Embeddings
- Guía de migración de fse 1.x a 2.0: https://github.com/oborchers/Fast_Sentence_Embeddings/blob/master/docs/migrating-from-1x.md
- Documentación de gensim: https://radimrehurek.com/gensim/
- Licencia PDDL (Open Data Commons): https://opendatacommons.org/licenses/pddl/
- Web de Oliver Borchers: https://www.drborchers.com/
