# Goodnight7/gte-derja-retrieval

## Resumen

`Goodnight7/gte-derja-retrieval` es un modelo de embeddings para recuperación de información (retrieval) desarrollado por el usuario Goodnight7, que adapta el modelo base `Alibaba-NLP/gte-multilingual-base` al árabe tunecino (Derja) mediante fine-tuning con `MultipleNegativesRankingLoss` sobre pares fabricados automáticamente. El objetivo principal es mejorar la recuperación cross-script, es decir, la capacidad de relacionar consultas escritas en alfabeto árabe con documentos en arabizi (transliteración latina) y viceversa, un problema relevante en un dialecto de bajos recursos como el tunecino.

El modelo tiene 305 millones de parámetros y se distribuye bajo licencia Apache 2.0. Está pensado como un artefacto de investigación: el autor documenta explícitamente que no es una mejora general sobre su base, sino que sacrifica rendimiento en tareas generales para ganar capacidad cross-script. Los resultados muestran que la ganancia en recuperación entre escrituras se logra a costa de una degradación significativa en la calidad semántica, un hallazgo medido y reproducible que el autor publica como resultado negativo útil para la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (basado en Alibaba-NLP/gte-multilingual-base) |
| Parametros totales | 305.368.320 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | aeb (árabe tunecino), ar (árabe); también evalúa francés y árabe estándar moderno |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `gte-multilingual-base`, un encoder transformer multilingüe de Alibaba diseñado para generar representaciones vectoriales de texto. El fine-tuning se realizó con `MultipleNegativesRankingLoss` utilizando `GradCache` para optimizar el uso de memoria. Se emplearon 300.000 pares de entrenamiento, un batch de 256, 1172 pasos y una tasa de aprendizaje de 1e-5, en una GPU NVIDIA L4 con un pico de memoria de 7,11 GB.

Los pares positivos se generaron sin etiquetas humanas mediante tres estrategias: transliteración árabe-arabizi (regla determinista), frases adyacentes del mismo documento y dropout positives. La mezcla final fue 38% transliteración, 38% adyacentes y 25% de "replay" (pares de MSA y francés para defender esos idiomas). El autor señala que la transliteración es una transformación superficial que permite al modelo satisfacer gran parte del objetivo solo con ortografía, lo que explica la regresión semántica observada.

## Capacidades

- Recuperación de información en árabe tunecino (Derja) tanto en escritura árabe como en arabizi.
- Soporte cross-script: relaciona consultas en arabizi con documentos en árabe y viceversa, con una mejora notable frente al modelo base (de 1,5 a 9,5 en recall@1).
- Genera embeddings densos para texto, adecuados para búsqueda vectorial y clustering.
- Funciona también en árabe estándar moderno y francés, aunque con rendimiento degradado respecto al modelo base.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.

## Casos de uso

- Búsqueda de contenido en foros y redes sociales tunecinos: permite indexar publicaciones escritas en árabe y arabizi en un mismo espacio vectorial, facilitando consultas en cualquiera de las dos escrituras.
- Sistemas de preguntas y respuestas sobre documentación local: un chatbot o buscador puede recuperar pasajes relevantes de manuales o guías escritas en Derja, incluso si la consulta del usuario está en arabizi.
- Atención al cliente automatizada en Túnez: integrado en un pipeline de retrieval-augmented generation (RAG), puede encontrar respuestas en una base de conocimiento multilingüe (árabe, francés, arabizi) para responder consultas de usuarios.
- Indexación de archivos históricos o periodísticos tunecinos: facilita la búsqueda en colecciones que mezclan escrituras, algo común en documentos coloniales o contemporáneos.
- Investigación sobre adaptación de modelos a dialectos de bajos recursos: sirve como punto de partida para estudiar el equilibrio entre invariancia de script y calidad semántica.
- Documentación de resultados negativos: el modelo se publica como artefacto reproducible para que otros investigadores eviten repetir el mismo enfoque o exploren mitigaciones adicionales.

## Benchmarks y rendimiento

La model card incluye resultados de recall@1 en el benchmark Derja retrieval, con etiquetas de relevancia proxy (cada consulta es un fragmento extraído de un documento conocido). La comparativa con el modelo base y una referencia e5 es la siguiente:

| Tarea | gte base | e5 reference | fine-tuned |
| --- | --- | --- | --- |
| Derja árabe | 51,0 | 44,0 | 28,5 |
| Derja arabizi | 33,5 | 29,0 | 40,0 |
| Derja cross-script | 1,5 | 0,5 | 9,5 |
| MSA | 41,0 | 43,0 | 26,0 |
| Francés | 50,0 | 39,0 | 30,5 |

También se presentan variantes de entrenamiento para evaluar el efecto del replay y el congelamiento de parámetros:

| Variante | Derja-Árabe | MSA | Francés | cross-script |
| --- | --- | --- | --- | --- |
| Sin replay, 74% transliteración | 26,0 | 22,5 | 17,0 | 14,5 |
| **Este modelo** (replay, 38% transliteración) | 28,5 | 26,0 | 30,5 | 9,5 |
| Replay + 75% de parámetros congelados | 23,0 | 24,5 | 30,5 | 7,0 |

El autor advierte que la relevancia es proxy y que el benchmark con juicio humano aún no está evaluado.

## Requisitos de hardware

- Modelo de 305M parámetros, con un tamaño de repositorio de 1,2 GB (pesos en safetensors).
- Para inferencia, al ser un modelo de embeddings, puede ejecutarse en CPU con memoria suficiente (aproximadamente 1,2 GB en FP32, menos si se cuantiza, aunque no se especifican cuantizaciones).
- En GPU, cabe en tarjetas con 2 GB de VRAM o menos; el entrenamiento se realizó en una NVIDIA L4 con un pico de memoria de 7,11 GB.
- Se integra con la librería `sentence-transformers` para generar embeddings y con índices vectoriales como FAISS o Annoy para búsqueda.
- No requiere despliegue con vLLM, llama.cpp u otros motores de LLM generativos, ya que no es un modelo de generación de texto.

## Comparativa con modelos similares

La comparativa se limita a los datos proporcionados en la model card. Se incluyen el modelo base `gte-multilingual-base` y una referencia `e5` (sin especificar versión). No se dispone de parámetros ni contexto para e5.

| Modelo | Parámetros | Contexto | Derja árabe (recall@1) | Derja arabizi | Cross-script | Licencia |
| --- | --- | --- | --- | --- | --- | --- |
| gte-multilingual-base | 305M | no disponible | 51,0 | 33,5 | 1,5 | Apache 2.0 |
| e5 (referencia) | no disponible | no disponible | 44,0 | 29,0 | 0,5 | no disponible |
| gte-derja-retrieval | 305M | no disponible | 28,5 | 40,0 | 9,5 | Apache 2.0 |

## Limitaciones y advertencias

- El modelo no es una mejora general sobre su base: degrada el rendimiento en tareas de recuperación en árabe estándar, francés y Derja en escritura árabe.
- La ganancia en cross-script se logra a expensas de la calidad semántica; el autor recomienda usar el modelo base salvo que se necesite específicamente recuperación entre arabizi y árabe.
- Los pares de entrenamiento se generaron sin etiquetas humanas, lo que puede introducir ruido y sesgos.
- El benchmark de evaluación usa relevancia proxy (fragmentos de documentos conocidos), no juicio humano; los resultados pueden no reflejar el rendimiento real en tareas de producción.
- El modelo está pensado como artefacto de investigación; no se recomienda su uso en producción sin una evaluación adicional con datos reales.
- Aunque la licencia Apache 2.0 permite uso comercial, el autor desaconseja explícitamente su uso general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Goodnight7/gte-derja-retrieval
- Dataset de benchmark: https://huggingface.co/datasets/Goodnight7/derja-retrieval-benchmark
- Modelo base: https://huggingface.co/Alibaba-NLP/gte-multilingual-base
- Repositorio de dataset tunecino (referencia externa): https://github.com/bahaeddinmselmi/tunisian-arabic-ai-dataset
