# borsimnet/e5-sk-large

## Resumen

E5-sk-large es un modelo de embeddings de frases (sentence embeddings) desarrollado por el usuario borsimnet, obtenido mediante fine-tuning del modelo multilingüe `intfloat/multilingual-e5-large` sobre datos en eslovaco. Está diseñado específicamente para tareas de similitud semántica, búsqueda semántica y clasificación de textos en eslovaco, un idioma con escasez de recursos en el ecosistema de modelos de lenguaje. El modelo se distribuye bajo licencia MIT y está disponible en HuggingFace con formato safetensors, listo para usar con la librería sentence-transformers y compatible con Text Embeddings Inference (TEI).

El modelo se basa en la arquitectura XLM-RoBERTa (concretamente la variante large) y cuenta con 365.330.432 parámetros. Fue entrenado con un dataset de 137.745 muestras procedente del corpus `slovak-nlp/sklep`, utilizando funciones de pérdida CosineSimilarityLoss y MultipleNegativesRankingLoss. Aunque el modelo base es multilingüe, este fine-tuning está orientado exclusivamente al eslovaco, lo que lo convierte en una opción relevante para aplicaciones que requieran representaciones vectoriales de alta calidad en este idioma. Su relevancia actual radica en la creciente demanda de modelos de embeddings especializados en lenguas minoritarias, donde los modelos multilingües genéricos suelen mostrar un rendimiento inferior.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (large) |
| Parametros totales | 365.330.432 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | eslovaco (sk) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `intfloat/multilingual-e5-large`, que a su vez está basado en XLM-RoBERTa large. XLM-RoBERTa es un transformer encoder preentrenado con masked language modeling en 100 idiomas, y E5-large añade un entrenamiento adicional con contrastive learning sobre pares de frases. Este fine-tuning específico para eslovaco se realizó con el dataset `slovak-nlp/sklep`, que contiene 137.745 muestras, y empleó dos funciones de pérdida: CosineSimilarityLoss y MultipleNegativesRankingLoss. La primera optimiza directamente la similitud coseno entre pares positivos, mientras que la segunda es una pérdida contrastiva que empuja las representaciones de pares relevantes a estar más cerca que las de pares negativos aleatorios. No se menciona el uso de RLHF ni otras técnicas de alineación, ya que se trata de un modelo de embeddings, no generativo. La innovación principal es la adaptación monolingüe de un modelo multilingüe a un idioma con pocos recursos, mejorando el rendimiento en tareas semánticas en eslovaco.

## Capacidades

- Generación de embeddings densos de frases y párrafos en eslovaco.
- Similitud semántica entre textos: cálculo de similitud coseno, producto punto o distancia euclídea.
- Búsqueda semántica y recuperación de información (retrieval) en colecciones de documentos en eslovaco.
- Clasificación binaria de pares de frases (por ejemplo, NLI, RTE) mediante umbrales sobre la similitud coseno.
- Agrupación (clustering) de textos por similitud.
- Soporte para extracción de características (feature extraction) con sentence-transformers.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Búsqueda semántica en eslovaco: indexar documentos (artículos, noticias, páginas web) y recuperar los más relevantes mediante similitud coseno. El modelo está optimizado para este idioma, superando a los modelos multilingües genéricos en precisión.
- Sistemas de recomendación basados en contenido: representar ítems (productos, artículos) como vectores y recomendar elementos similares según la proximidad en el espacio de embeddings.
- Detección de duplicados y near-duplicates: comparar pares de textos (por ejemplo, ofertas de empleo, anuncios) para identificar contenido duplicado o muy similar, útil en agregadores de contenido.
- Clasificación de textos: convertir frases en vectores y alimentar clasificadores simples (regresión logística, SVM) para tareas como análisis de sentimiento o categorización de noticias en eslovaco.
- Moderación de contenido: identificar mensajes ofensivos o spam comparando con ejemplos etiquetados mediante umbrales de similitud.
- Construcción de bases de conocimiento semánticas: generar embeddings de preguntas y respuestas para sistemas de FAQ o chatbots que recuperen la respuesta más cercana a la consulta del usuario.
- Análisis de encuestas y feedback: agrupar respuestas abiertas en eslovaco por temas para extraer patrones de opinión.

## Benchmarks y rendimiento

Según los resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Semantic Similarity | validation sts | Pearson Cosine | 0.8404 |
| Semantic Similarity | validation sts | Spearman Cosine | 0.8424 |
| Binary Classification | validation nli | Cosine Accuracy | 0.6663 |
| Binary Classification | validation nli | Cosine F1 | 0.4997 |
| Binary Classification | validation nli | Cosine Precision | 0.3333 |
| Binary Classification | validation nli | Cosine Recall | 0.9976 |
| Binary Classification | validation nli | Cosine AP | 0.2791 |
| Binary Classification | validation nli | Cosine MCC | 0.0 |
| Binary Classification | validation rte | Cosine Accuracy | 0.5235 |
| Binary Classification | validation rte | Cosine F1 | 0.6453 |
| Binary Classification | validation rte | Cosine Precision | 0.4764 |
| Binary Classification | validation rte | Cosine Recall | 1.0 |
| Binary Classification | validation rte | Cosine AP | 0.3795 |
| Binary Classification | validation rte | Cosine MCC | 0.0808 |

No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 365M parámetros, en FP32 ocupa aproximadamente 1,4 GB, y en FP16 unos 730 MB. Con cuantización INT8 podría reducirse a ~365 MB, aunque no se especifican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en FP32 sin problemas. Tarjetas como NVIDIA GTX 1050 Ti, RTX 2060 o superiores son suficientes. Para procesamiento por lotes grande, se recomienda al menos 4 GB de VRAM.
- Es viable en CPU para inferencia de baja latencia (menos de 10 ms por frase) si se usan librerías optimizadas como ONNX Runtime o CTranslate2.
- Opciones de despliegue: sentence-transformers (Python), HuggingFace Inference Endpoints, Text Embeddings Inference (TEI), o exportación a ONNX para servidores propios.
- Latencia y throughput: no se han publicado datos concretos. En una GPU moderna (p. ej., RTX 3090) se pueden procesar cientos de frases por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| intfloat/multilingual-e5-large | 560M (aprox.) | 512 tokens | 100+ | MIT | Modelo base multilingüe, sin fine-tuning específico para eslovaco |
| borsimnet/e5-sk-large | 365M | no disponible | eslovaco | MIT | Fine-tuning en eslovaco del modelo anterior |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | 118M | 128 tokens | 50+ | Apache-2.0 | Modelo multilingüe más ligero, pero con menor rendimiento en idiomas minoritarios |

No se dispone de benchmarks comparativos entre estos modelos en tareas eslovacas. La ventaja de e5-sk-large es su especialización monolingüe, que probablemente mejore la calidad de los embeddings en eslovaco frente al modelo base, a costa de perder capacidad multilingüe.

## Limitaciones y advertencias

- Es un modelo especializado en eslovaco; su rendimiento en otros idiomas probablemente sea deficiente y no debe usarse como modelo multilingüe general.
- El dataset de entrenamiento (`slovak-nlp/sklep`) puede contener sesgos propios de la fuente (por ejemplo, dominio periodístico o de comercio electrónico), lo que podría afectar a la generalización en otros dominios.
- Al ser un modelo de embeddings, no genera texto; no es adecuado para tareas de generación o diálogo.
- Los resultados de los benchmarks son declarados por el autor y no han sido verificados de forma independiente; el MCC de 0 en la tarea NLI sugiere una correlación nula con la clasificación binaria, lo que indica que el umbral de decisión no es discriminativo en ese conjunto.
- No se especifica la longitud máxima de contexto, aunque por herencia del modelo base se espera que sea 512 tokens; textos más largos deberán truncarse.
- No se han publicado cuantizaciones oficiales (GGUF, etc.), aunque el formato safetensors permite conversión a otros formatos.
- El modelo tiene 0 descargas y 0 likes en el momento de la redacción, lo que indica que no ha sido ampliamente probado por la comunidad.

## Enlaces

- [HuggingFace: borsimnet/e5-sk-large](https://huggingface.co/borsimnet/e5-sk-large)
- [Modelo base: intfloat/multilingual-e5-large](https://huggingface.co/intfloat/multilingual-e5-large)
- [Paper XLM-RoBERTa (arXiv:1908.10084)](https://arxiv.org/abs/1908.10084)
- [Referencia adicional (arXiv:2606.13647)](https://arxiv.org/abs/2606.13647)
