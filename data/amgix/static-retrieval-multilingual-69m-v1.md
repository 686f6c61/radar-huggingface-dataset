# amgix/static-retrieval-multilingual-69m-v1

## Resumen

`amgix/static-retrieval-multilingual-69m-v1` es un modelo de embeddings estáticos multilingüe, destilado a partir de `ibm-granite/granite-embedding-97m-multilingual-r2` mediante la técnica Model2Vec. A diferencia de los modelos transformer tradicionales, este modelo genera representaciones vectoriales de texto sumando embeddings de palabras de una tabla estática, lo que permite calcular embeddings de forma órdenes de magnitud más rápida tanto en CPU como en GPU. Está diseñado específicamente para tareas de recuperación semántica (retrieval) en entornos con recursos computacionales limitados o donde el rendimiento en tiempo real es crítico.

Con 69,1 millones de parámetros y una dimensión de 384, el modelo ofrece un equilibrio entre tamaño y calidad: supera a otros modelos estáticos multilingües en la mayoría de los benchmarks de recuperación, aunque sigue por debajo del modelo base transformer en precisión absoluta. Su licencia Apache 2.0 permite uso comercial sin restricciones, y su formato de pesos safetensors facilita su integración en pipelines modernos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos (Model2Vec) |
| Parámetros totales | 69.095.424 |
| Parámetros activos | No aplica (embeddings estáticos) |
| Longitud de contexto | No aplica (embeddings estáticos) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Multilingüe (no se especifica la lista completa) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la técnica **Model2Vec**, que destila la información de un modelo transformer (en este caso, `granite-embedding-97m-multilingual-r2`) en una tabla de embeddings estáticos por token. Cada palabra se asigna a un vector fijo de 384 dimensiones, y el embedding de una frase se calcula como la suma (o promedio) de los embeddings de sus tokens. Este enfoque elimina la necesidad de una arquitectura transformer en inferencia, reduciendo drásticamente el coste computacional.

El entrenamiento se realizó mediante destilación desde el modelo base, utilizando datos multilingües orientados a tareas de recuperación. No se han publicado detalles sobre el dataset exacto ni el número de tokens de entrenamiento. La destilación busca transferir las representaciones del modelo base a los embeddings estáticos, preservando la capacidad de recuperación en múltiples idiomas.

## Capacidades

- Generación de embeddings de texto para recuperación semántica y búsqueda.
- Soporte multilingüe, con resultados evaluados en más de 10 idiomas (árabe, alemán, inglés, francés, italiano, japonés, coreano, noruego, portugués, español, sueco, etc.).
- Cálculo de embeddings de alta velocidad, tanto en CPU como en GPU, gracias a su naturaleza estática.
- Compatibilidad con la librería `sentence-transformers` y `model2vec`, lo que facilita su integración en pipelines de embeddings.
- No requiere GPU para inferencia; puede ejecutarse en entornos con recursos limitados.
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso; se limita exclusivamente a la representación vectorial de texto.

## Casos de uso

- **Búsqueda semántica en bases de conocimiento multilingües**: permite indexar documentos en varios idiomas y recuperar los más relevantes mediante consultas en lenguaje natural. Su velocidad es crucial para aplicaciones con grandes volúmenes de datos.
- **Sistemas de atención al cliente automatizados**: el modelo puede generar embeddings de preguntas frecuentes y respuestas para construir un sistema de FAQ semántico, respondiendo consultas de usuarios en distintos idiomas con baja latencia.
- **Filtrado de contenido y detección de duplicados**: al comparar vectores de texto, se pueden identificar documentos similares o duplicados en plataformas de publicación, foros o repositorios.
- **Clasificación de textos**: los embeddings generados se pueden usar como entrada para clasificadores ligeros (p. ej., regresión logística) para tareas como análisis de sentimiento o categorización de contenido en entornos con recursos restringidos.
- **Recuperación de documentos legales**: en el ámbito jurídico, el modelo ha mostrado buen rendimiento en tareas como `AILACasedocs` y `AILAStatutes`, siendo útil para buscar jurisprudencia o normativa en varios idiomas.
- **Motores de búsqueda en tiempo real**: su alto throughput (miles de documentos por segundo) lo hace adecuado para sistemas de búsqueda que requieren indexación y consulta en tiempo real, como en aplicaciones de comercio electrónico o intranets corporativas.
- **Análisis de sentimiento en redes sociales**: aunque no está entrenado específicamente para ello, los embeddings pueden alimentar clasificadores de sentimiento en textos cortos (tweets, reseñas) con una latencia mínima.

## Benchmarks y rendimiento

### Rendimiento de embeddings

Medido en un test de 5000 documentos (354 caracteres por documento) y consultas (34 caracteres por consulta) con 4 núcleos CPU, mejor de 10 ejecuciones.

| Modelo | docs/s | queries/s |
|---|---|---|
| granite-embedding-97m-multilingual-r2 | 7 | 69 |
| potion-retrieval-32M | 8.431 | 39.632 |
| potion-multilingual-128M | 5.148 | 37.727 |
| static-similarity-mrl-multilingual-v1 | 7.924 | 37.731 |
| **static-retrieval-multilingual-69m-v1** | **8.974** | **44.456** |

### Resultados NanoBEIR multilingüe

Promedio por idioma. El mejor valor entre modelos estáticos se muestra en **negrita**.

| Idioma | granite-embedding-97m | potion-retrieval-32M | potion-multilingual-128M | static-similarity-mrl | **static-retrieval-69m** |
|---|---|---|---|---|---|
| ara-Arab | 0.4589 | 0.0988 | 0.2692 | 0.2860 | **0.3458** |
| deu-Latn | 0.5338 | 0.2537 | 0.3273 | 0.3454 | **0.4054** |
| eng-Latn | 0.5881 | **0.5107** | 0.3696 | 0.4352 | 0.4700 |
| fra-Latn | 0.5318 | 0.2828 | 0.3472 | 0.3702 | **0.4102** |
| ita-Latn | 0.5176 | 0.2752 | 0.3401 | 0.3683 | **0.3837** |
| jpn-Jpan | 0.4956 | 0.1142 | 0.3016 | 0.3190 | **0.3597** |
| kor-Kore | 0.4927 | 0.1171 | **0.3046** | 0.2763 | 0.3023 |
| nor-Latn | 0.4827 | 0.2532 | 0.3190 | **0.3314** | 0.3059 |
| por-Latn | 0.5193 | 0.2682 | 0.3364 | 0.3743 | **0.3992** |
| spa-Latn | 0.5295 | 0.2542 | 0.3369 | 0.3754 | **0.4145** |
| swe-Latn | 0.4991 | 0.2674 | 0.3154 | **0.3408** | 0.3208 |
| **Promedio** | 0.5136 | 0.2450 | 0.3243 | 0.3475 | **0.3743** |

### Resultados RTEB

Selección de algunos tests (el mejor valor se muestra en negrita):

| Test | Idioma | potion-retrieval-32M | potion-multilingual-128M | static-similarity-mrl | static-retrieval-69m |
|---|---|---|---|---|---|
| AILACasedocs | eng-Latn | 0.2157 | 0.2037 | 0.2202 | **0.2231** |
| AILAStatutes | eng-Latn | 0.1901 | 0.1598 | 0.1663 | **0.2100** |
| AppsRetrieval | eng-Latn, python-Code | **0.0431** | 0.0366 | 0.0127 | 0.0321 |
| ChatDoctorRetrieval | eng-Latn | **0.2470** | 0.1362 | 0.1535 | 0.2443 |
| DS1000Retrieval | eng-Latn, python-Code | **0.2330** | 0.2037 | 0.2083 | 0.1595 |
| HumanEvalRetrieval | eng-Latn, python-Code | **0.4271** | 0.3738 | 0.3461 | 0.3398 |
| LegalQuAD | deu-Latn | 0.3917 | **0.4326** | 0.4110 | 0.3707 |
| MIRACLRetrievalHardNegatives | ara-Arab | 0.0413 | 0.1657 | 0.1971 | **0.3515** |
| MIRACLRetrievalHardNegatives | hin-Deva | 0.0281 | 0.1773 | 0.1710 | **0.3357** |
| MIRACLRetrievalHardNegatives | rus-Cyrl | 0.0246 | 0.2299 | 0.1681 | **0.2592** |

La tabla completa de RTEB está disponible en la model card original.

## Requisitos de hardware

- **VRAM**: No se requiere GPU para la inferencia. El modelo se carga como una matriz de embeddings de 179,936 × 384 (≈274 MB en float32), por lo que cabe en cualquier dispositivo con más de ~300 MB de RAM.
- **CPU**: Funciona en cualquier CPU moderna; los benchmarks se ejecutaron con 4 núcleos. El modelo puede ejecutarse incluso en dispositivos embebidos o con recursos limitados.
- **GPU**: No es necesaria, pero puede usarse para acelerar el cálculo si se desea.
- **Despliegue**: Se puede integrar con la librería `model2vec` o `sentence-transformers`. También es compatible con herramientas de indexación y búsqueda como Amgix (según la documentación del autor).
- **Latencia y throughput**: En el benchmark de rendimiento, alcanza ~8.974 documentos/s y ~44.456 consultas/s en una CPU de 4 núcleos, lo que indica una latencia sub-milisegundo por documento.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño en disco | Promedio NanoBEIR | Licencia |
|---|---|---|---|---|
| potion-retrieval-32M | 32,3M | 125 MB | 0.2450 | Apache-2.0 (por defecto) |
| potion-multilingual-128M | 128,1M | 1003 MB | 0.3243 | Apache-2.0 (por defecto) |
| static-similarity-mrl-multilingual-v1 | 108,4M | 417 MB | 0.3475 | Apache-2.0 (por defecto) |
| **static-retrieval-multilingual-69m-v1** | **69,1M** | **274 MB** | **0.3743** | **Apache-2.0** |
| granite-embedding-97m-multilingual-r2 (base) | 97M | 211 MB | 0.5136 | Apache-2.0 |

Nota: Las licencias de los otros modelos estáticos no están confirmadas en la información proporcionada; se indica la licencia por defecto de los repositorios de Hugging Face.

## Limitaciones y advertencias

- **Alucinaciones**: no aplica, ya que el modelo no genera texto.
- **Sesgos**: no se han publicado estudios de sesgos. Al estar destilado de un modelo base multilingüe, puede heredar sesgos presentes en los datos de entrenamiento del modelo original.
- **Rendimiento en idiomas**: aunque es multilingüe, los resultados varían considerablemente entre idiomas. Por ejemplo, en coreano y noruego el rendimiento es inferior al de otros modelos estáticos.
- **Calidad de embeddings**: al ser embeddings estáticos, no capturan el contexto de la frase completa. En tareas que requieren comprensión de contexto o sinónimos dependientes del contexto, puede ser inferior a un modelo transformer.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial sin restricciones.
- **Limitaciones de contexto**: no existe ventana de contexto, por lo que no se pueden procesar textos de longitud variable con dependencia de contexto; cada token se representa independientemente.
- **Producción**: aunque el modelo es rápido, es recomendable validar su rendimiento en el dominio específico antes de desplegarlo, dado que los benchmarks se centran en recuperación general.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/amgix/static-retrieval-multilingual-69m-v1)
- [Repositorio de Model2Vec (GitHub)](https://github.com/MinishLab/model2vec)
- [Modelo base: ibm-granite/granite-embedding-97m-multilingual-r2](https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2)
- [Documentación de Amgix (sistema de búsqueda)](https://docs.amgix.io/)
- [Características de Amgix](https://docs.amgix.io/features/)
