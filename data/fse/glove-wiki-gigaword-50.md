# fse/glove-wiki-gigaword-50

## Resumen

GloVe Wikipedia + Gigaword (50 dimensiones) es un conjunto de vectores de palabras preentrenados mediante el algoritmo GloVe (Global Vectors for Word Representation) por el Stanford NLP Group, publicado originalmente en 2014. El repositorio `fse/glove-wiki-gigaword-50` redistribuye esos vectores en formato gensim `KeyedVectors`, empaquetados para su uso con la librería fse (Fast Sentence Embeddings), que los convierte en vectores de frase mediante técnicas como CBOW averaging, SIF y uSIF.

No se trata de un modelo generativo ni de un transformer: es una tabla estática de 400.000 palabras inglesas con vectores de 50 dimensiones float32, entrenada sobre Wikipedia 2014 y Gigaword 5 (aproximadamente 6.000 millones de tokens), sin distinción de mayúsculas. Su relevancia actual es la de un componente ligero y determinista para tareas de similitud semántica, búsqueda por embedding o clustering de texto, con un coste computacional mínimo y licencia de dominio público.

El paquete está pensado para la API de fse 1.x (requiere `fse<2`); para fse 2.0 el autor recomienda migrar a los encoders del catálogo clásico. El repositorio ocupa 0,1 GB y contiene el modelo gensim más un fichero `.npy` con la matriz de vectores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vectores de palabras estáticos GloVe (modelo de coocurrencia global con regresión logística); no es un transformer |
| Parametros totales | 20.000.000 valores float32 (400.000 palabras × 50 dimensiones); no aplica el concepto de parámetros de red neuronal |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; es un modelo de embeddings por palabra) |
| Tipos de cuantizacion | no disponible (vectores float32; se puede reducir precisión manualmente, pero no se documenta) |
| Idiomas soportados | inglés (`en`) |
| Licencia | PDDL (Public Domain Dedication and License) |
| Formato de pesos | gensim `KeyedVectors` (`.model`) y matriz `.npy` (400.000 × 50 float32, 80 MB) |

## Arquitectura y entrenamiento

GloVe no es una red neuronal profunda ni un transformer: es un método de factorización de la matriz de coocurrencia global de palabras. Se construye una matriz de coocurrencias sobre un corpus y se optimiza una función de pérdida de mínimos cuadrados ponderada para que el producto escalar de los vectores de dos palabras aproxime el logaritmo de su probabilidad de coocurrencia. El resultado son representaciones densas de 50 dimensiones por palabra.

El corpus de entrenamiento combina Wikipedia 2014 y Gigaword 5, con un total de aproximadamente 6.000 millones de tokens. El vocabulario resultante es de 400.000 palabras en inglés, sin distinción entre mayúsculas y minúsculas. No hay datos disponibles sobre el uso de RLHF, DPO ni ajuste fino posterior; el modelo es puramente estático y no genera texto. La innovación técnica del empaquetado fse es la conversión de vectores de palabra a vectores de frase mediante CBOW averaging, SIF (smooth inverse frequency) y uSIF, que ponderan las palabras según su frecuencia para mejorar la representación de oraciones.

## Capacidades

- Representación vectorial de palabras en inglés (400.000 entradas, 50 dimensiones).
- Construcción de vectores de frase mediante CBOW averaging, SIF y uSIF a través de fse.
- Cálculo de similitud semántica entre palabras y entre frases (coseno, producto escalar).
- Soporte de memoria mapeada (`mmap="r"`) para no cargar los vectores completos en RAM.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés; no hay vectores para otros idiomas.

## Casos de uso

- Búsqueda semántica ligera: indexar documentos cortos o títulos mediante vectores de frase SIF y recuperar por similitud coseno, con un coste de memoria de 80 MB y sin GPU.
- Clustering y deduplicación de textos: agrupar titulares, correos o reseñas por similitud semántica usando los vectores de frase como features de entrada a k-means o DBSCAN.
- Clasificación de texto con modelos clásicos: usar los vectores de frase como entrada a regresión logística o SVM en pipelines de NLP con requisitos de latencia muy bajos.
- Detección de similitud entre consultas: comparar consultas de usuario con un catálogo de preguntas frecuentes en un sistema de atención al cliente, aprovechando que el modelo es determinista y no alucina.
- Feature engineering para modelos supervisados: generar embeddings de palabras o frases como variables adicionales en modelos tabulares de churn, scoring o moderación.
- Prototipado y docencia: experimentar con representaciones distribucionales y técnicas SIF/uSIF sin necesidad de infraestructura de GPU, gracias a su tamaño reducido y a la licencia de dominio público.
- Filtrado previo en pipelines RAG: como primera etapa de recuperación de bajo coste antes de un reranker neuronal más pesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación; el autor remite al benchmark STS de todos los conjuntos de vectores de la organización en el repositorio de GitHub de fse, pero no se proporcionan cifras en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB (no requiere GPU; los vectores ocupan 80 MB en RAM si se cargan completos).
- GPU recomendadas: no aplica; el modelo es CPU-only por naturaleza.
- Cabe en cualquier GPU consumer y en cualquier CPU; con `mmap="r"` el consumo de RAM puede reducirse por debajo de los 80 MB.
- Opciones de despliegue: librería fse (`fse<2`), gensim directamente, o cualquier runtime que lea `KeyedVectors`; no es compatible con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo generativo.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza del modelo (búsqueda en tabla y operaciones vectoriales de 50 dimensiones) la latencia por frase es del orden de microsegundos a milisegundos en CPU, pero no se han publicado mediciones en la información disponible.

## Comparativa con modelos similares

| Modelo | Dimensiones | Vocabulario | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| fse/glove-wiki-gigaword-50 | 50 | 400.000 palabras | no aplica | PDDL | gensim / npy |
| GloVe wiki-gigaword-100 (Stanford) | 100 | 400.000 palabras | no aplica | PDDL | texto / binario |
| GloVe wiki-gigaword-300 (Stanford) | 300 | 400.000 palabras | no aplica | PDDL | texto / binario |
| fastText wiki-news-300 (Facebook) | 300 | 1.000.000 palabras | no aplica | MIT | binario / texto |

Los vectores de 100 y 300 dimensiones de GloVe ofrecen mayor capacidad de representación a costa de más memoria (160 MB y 480 MB respectivamente). fastText añade subword information, lo que mejora el tratamiento de palabras fuera de vocabulario. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo estático: no captura contexto, polisemia ni orden de palabras; una misma palabra tiene un único vector independientemente de la frase.
- Solo inglés: no hay soporte para castellano ni otros idiomas.
- Sin generación de texto: no puede usarse para tareas generativas, razonamiento ni diálogo.
- Vocabulario fijo de 400.000 palabras: las palabras fuera de vocabulario no tienen vector; fse no resuelve OOV por subwords como fastText.
- Sesgos: al entrenarse sobre Wikipedia y Gigaword, puede reflejar sesgos de género, nacionalidad y otros presentes en esos corpus; no se documenta ninguna mitigación.
- Riesgo de alucinación: no aplica en sentido generativo, pero la similitud vectorial puede producir falsos positivos en recuperación semántica.
- Licencia PDDL: permite uso comercial y redistribución sin restricciones significativas, pero conviene revisar los términos exactos de la Open Data Commons PDDL.
- Compatibilidad: requiere `fse<2`; la API de fse 2.0 es incompatible y el autor recomienda migrar a otros encoders.
- Mantenimiento: última actualización del repositorio en 2026-11-02, pero el modelo subyacente data de 2014 y no se ha reentrenado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fse/glove-wiki-gigaword-50
- GloVe original (Stanford NLP): https://nlp.stanford.edu/projects/glove/
- Paper GloVe (Pennington, Socher, Manning, 2014): https://nlp.stanford.edu/pubs/glove.pdf
- Repositorio fse (Fast Sentence Embeddings): https://github.com/oborchers/Fast_Sentence_Embeddings
- Catálogo de modelos clásicos de fse: https://github.com/oborchers/Fast_Sentence_Embeddings/blob/master/docs/models.md
- Guía de migración de fse 1.x a 2.0: https://github.com/oborchers/Fast_Sentence_Embeddings/blob/master/docs/migrating-from-1x.md
- Documentación de gensim: https://radimrehurek.com/gensim/
- Licencia PDDL (Open Data Commons): https://opendatacommons.org/licenses/pddl/
- Web del autor de fse: https://www.drborchers.com/
