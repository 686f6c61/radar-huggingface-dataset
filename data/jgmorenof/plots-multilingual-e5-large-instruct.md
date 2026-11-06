# Jgmorenof/plots-multilingual-e5-large-instruct

## Resumen

`Jgmorenof/plots-multilingual-e5-large-instruct` es un modelo de embeddings de frases obtenido por ajuste fino (fine-tuning) del modelo `intfloat/multilingual-e5-large-instruct` sobre el conjunto de datos PLOTS, compuesto por pares de resúmenes de argumento (plot summaries) de Wikipedia sobre la misma película escritos de forma independiente en inglés y en otra lengua. El objetivo del modelo es la similitud narrativa y la recuperación cross-lingual: emparejar historias por su contenido semántico en lugar de por palabras, nombres propios o títulos.

El modelo lo desarrolla Jose G. Moreno (autor del repositorio `Jgmorenof`) en el marco del conjunto de datos PLOTS, con una autoría académica más amplia que incluye a Hamdi, Boros, Jatowt, Bordea, González-Gallardo y Doucet. Resuelve un problema clásico de recuperación de información: dado un resumen o una descripción vaga de una película (el fenómeno *tip-of-the-tongue*), localizar el artículo o el argumento correspondiente en otro idioma sin depender de la coincidencia léxica.

Arquitectónicamente es un transformer tipo XLM-RoBERTa (etiqueta `xlm-roberta` en Hugging Face) con 559.890.432 parámetros (aproximadamente 560 M), derivado de un modelo base de embeddings multilingüe. Se distribuye con la librería `sentence-transformers`, en formato `safetensors`, con licencia MIT y un tamaño de repositorio de 2,3 GB. Es relevante ahora porque aborda la recuperación narrativa multilingüe con un ajuste específico sobre 197.694 pares y porque se evalúa en el marco de SemEval-2026 Task 4 y TREC ToT 2023.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo XLM-RoBERTa (etiqueta `xlm-roberta`), encoder de embeddings de frases |
| Parametros totales | 559.890.432 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens de entrada máxima (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos `safetensors` en precisión completa; no se documentan versiones GGUF/ONNX) |
| Idiomas soportados | Multilingüe (heredado de `multilingual-e5-large-instruct`; el conjunto de entrenamiento empareja inglés con otras lenguas) |
| Licencia | MIT (los pesos conservan la licencia del modelo base; los datos PLOTS son CC BY-SA 4.0) |
| Formato de pesos | `safetensors` |

## Arquitectura y entrenamiento

El modelo parte de `intfloat/multilingual-e5-large-instruct`, un encoder transformer multilingüe de la familia XLM-RoBERTa con unos 560 M de parámetros, y se ajusta con la librería `sentence-transformers`. El ajuste se realiza sobre PLOTS, un conjunto de pares de resúmenes de argumento de películas escritos de forma independiente: el resumen en inglés emparejado con su equivalente en otra lengua. El entrenamiento emplea 197.694 pares, una función de pérdida contrastiva simétrica en el lote (InfoNCE en ambas direcciones) con *gradient caching*, tamaño de lote 128, una época, tasa de aprendizaje 2e-05, longitud máxima de entrada de 512 tokens y semilla 13. Se excluyen del entrenamiento las películas de SemEval-2026 Task 4 y de las consultas de train y dev de TREC ToT 2023, lo que garantiza que la evaluación sea libre de fuga (*leak-free*).

La innovación principal no está en la arquitectura, sino en el diseño de la tarea y de los prompts: el modelo se entrena para igualar historias y no palabras, y la model card documenta prompts de instrucción distintos según el caso de uso (recuperación de argumento, petición *tip-of-the-tongue* y similitud simétrica historia-a-historia). El uso de pérdida contrastiva bidireccional con caché de gradientes permite manejar lotes grandes de pares sin multiplicar el coste de memoria.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación de información.
- Similitud narrativa: empareja resúmenes de argumento de la misma película redactados de forma independiente.
- Recuperación cross-lingual: consulta en una lengua, documento en otra (inglés como documento de referencia en los experimentos).
- Recuperación *tip-of-the-tongue*: a partir de una descripción vaga de una película, recuperar su página o argumento de Wikipedia.
- Soporte de prompts de instrucción diferenciados por tarea (`Instruct: ...\nQuery: `).
- Capacidades multilingües heredadas del modelo base.
- No es un modelo generativo: no produce texto, no soporta *tool calling* ni razonamiento multi-paso ni modo *thinking*.

## Casos de uso

- Búsqueda de películas por descripción vaga: el usuario describe una película que recuerda a medias y el modelo genera un embedding de la consulta que se compara contra los embeddings de los argumentos de Wikipedia, recuperando la película correcta incluso con nombres propios erróneos o ausentes.
- Recuperación cross-lingual de artículos: una consulta en castellano puede recuperar el argumento en inglés de la misma película, útil para sistemas de recomendación o de descubrimiento de contenidos en catálogos multilingües.
- Deduplicación y agrupación de fichas de películas: los embeddings permiten detectar que dos registros de un catálogo, con títulos y redacciones distintas en distintos idiomas, corresponden a la misma obra.
- Construcción de índices de similitud narrativa: con 512 tokens de entrada, se pueden indexar resúmenes de argumento y desplegar un motor de búsqueda semántica sobre ellos mediante `sentence-transformers` o `text-embeddings-inference`.
- Evaluación de sistemas de recuperación: sirve como línea base ajustada para tareas de similitud narrativa y recuperación cross-lingual en el contexto de SemEval-2026 Task 4 y TREC ToT.
- Recomendación por temática argumental: comparar la sinopsis de una película con un corpus de argumentos para sugerir títulos con tramas similares, sin depender de metadatos de género o reparto.
- Investigación en procesamiento de lenguaje natural multilingüe: análisis de hasta qué punto un encoder de ~560 M captura similitud narrativa frente a similitud léxica.

## Benchmarks y rendimiento

Resultados publicados en la model card. NS: precisión en los 355 triples de test de SemEval-2026 Task 4 track B libres de fuga. PLOTS-IR: nDCG@10 sobre las consultas de test (M: entidades enmascaradas). ToT: consultas de dev de TREC ToT 2023.

| Modelo | NS acc. | Full | Full M | First | Last | Last M | ToT nDCG@10 | ToT R@100 |
|---|---|---|---|---|---|---|---|---|
| Este modelo | 0.654 | 0.994 | 0.905 | 0.842 | 0.448 | 0.121 | 0.204 | 0.507 |
| multilingual-e5-large-instruct, zero-shot | 0.696 | 0.875 | 0.610 | 0.615 | 0.231 | 0.067 | 0.047 | 0.213 |

El ajuste mejora de forma clara la recuperación (Full, Full M, First y ToT) a costa de una ligera caída en la precisión de similitud simétrica (NS acc.: 0.654 frente a 0.696 del modelo base zero-shot).

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, unos 2,2 GB de pesos (560 M de parámetros); en FP16, aproximadamente 1,1 GB; el consumo real depende del tamaño de lote y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para lotes pequeños en FP16; A100, H100 o RTX 4090 para indexación a gran escala y lotes grandes.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más, incluso en FP32 con lotes moderados.
- Opciones de despliegue: `sentence-transformers` (uso documentado en la model card), `text-embeddings-inference` (etiqueta `text-embeddings-inference` en Hugging Face) y endpoints compatibles. No se documentan versiones GGUF para llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | NS acc. | ToT nDCG@10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Jgmorenof/plots-multilingual-e5-large-instruct | 559.890.432 | 512 tokens | 0.654 | 0.204 | MIT | Hugging Face (`sentence-transformers`) |
| intfloat/multilingual-e5-large-instruct | ~560 M (no confirmado en la información) | 512 tokens | 0.696 | 0.047 | MIT (según modelo base) | Hugging Face |
| Otros modelos de embeddings multilingües (p. ej. familia BGE-M3, LaBSE) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa solo es posible con el modelo base, ya que la información proporcionada no incluye resultados de otros encoders multilingües en estas tareas.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni admite *tool calling*, agentes o razonamiento multi-paso.
- Ventana de entrada limitada a 512 tokens, insuficiente para documentos largos sin troceado.
- Caída en la precisión de similitud simétrica (NS acc. 0.654) respecto al modelo base zero-shot (0.696); el ajuste está orientado a recuperación, no a similitud simétrica genérica.
- Rendimiento bajo en los escenarios "Last" y "Last M" (0.448 y 0.121), lo que sugiere dificultades cuando la información relevante aparece al final del texto o con entidades enmascaradas.
- Riesgo de sesgo heredado del corpus de Wikipedia y del modelo base; no se documentan análisis de sesgo específicos.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos en la recuperación (emparejar películas distintas con argumentos parecidos).
- El conjunto de datos PLOTS es CC BY-SA 4.0; los pesos son MIT, pero el uso de los datos de entrenamiento puede estar sujeto a las condiciones de atribución y compartir-igual de CC BY-SA.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados publicados.
- No se documentan versiones cuantizadas (GGUF, ONNX) ni métricas de latencia/throughput para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jgmorenof/plots-multilingual-e5-large-instruct
- Conjunto de datos PLOTS: https://huggingface.co/datasets/Jgmorenof/PLOTS
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large-instruct
- Cita del conjunto de datos (BibTeX en la model card): Moreno, Hamdi, Boros, Jatowt, Bordea, González-Gallardo y Doucet, 2026, "PLOTS -- Same Story, Different Words: Paired Plot Outlines for Narrative Similarity and Retrieval".
