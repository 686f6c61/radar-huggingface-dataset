# NYSgpt/44b-reranker-mini

## Resumen

El modelo `NYSgpt/44b-reranker-mini` es un reranker de tipo cross-encoder desarrollado por NYSgpt (Brendan Stanton) y publicado en Hugging Face con licencia Apache-2.0. Está diseñado para la tarea de reranking en recuperación de información, concretamente para el dominio de documentos científicos y revisión por pares. El modelo se basa en la arquitectura MiniLM-L6-v2 (el modelo base `cross-encoder/ms-marco-MiniLM-L6-v2`) y ha sido fine-tuneado sobre pares de revisión por pares y artículos académicos extraídos de un corpus de 44 mil millones de tokens, según la descripción del autor.

Con solo 22,7 millones de parámetros, es un modelo extremadamente ligero, lo que permite su despliegue en entornos con recursos limitados, incluso en CPU. Su relevancia radica en que aborda un caso de uso específico: la ordenación de documentos científicos según la relevancia para una consulta formulada como un resumen de revisión experta. Al estar entrenado con supervisión inusual (la consulta es el resumen que un revisor experto hace de un artículo, y el positivo es el artículo al que se adjunta esa revisión), el modelo captura relaciones semánticas entre textos académicos de forma más especializada que los rerankers genéricos.

El acceso al modelo está restringido (gated), por lo que los usuarios deben aceptar las condiciones en Hugging Face antes de poder descargarlo. El repositorio tiene un tamaño de 0,1 GB y los pesos están en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en MiniLM-L6-v2 (BERT de 6 capas) |
| Parametros totales | 22.713.601 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (limitado por MiniLM-L6-v2, típicamente 512 tokens) |
| Tipos de cuantizacion | No disponible (pesos en FP32/FP16 en safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en la arquitectura MiniLM-L6-v2, una variante compacta de BERT con 6 capas y 22,7 millones de parámetros. A diferencia de los modelos bi-encoder que generan embeddings independientes para consulta y documento, un cross-encoder procesa la concatenación de consulta y documento como una única secuencia, produciendo una puntuación de relevancia directamente. Esta arquitectura ofrece mayor precisión en tareas de reranking, aunque con mayor coste computacional por par, que se ve mitigado por el pequeño tamaño del modelo.

El entrenamiento se realizó mediante fine-tuning sobre pares de revisión por pares y artículos científicos, extraídos de un corpus de 44 mil millones de tokens (de ahí el nombre "44b"). La supervisión es atípica: la consulta es el resumen que un revisor experto escribe sobre un artículo, y el positivo es el artículo al que esa revisión está adjunta. Este diseño aprovecha datos naturales de revisión académica sin necesidad de anotaciones manuales. No se dispone de información sobre el número exacto de pares de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo base es `cross-encoder/ms-marco-MiniLM-L6-v2`, un reranker genérico entrenado sobre el corpus MS MARCO, que se ha adaptado al dominio científico.

## Capacidades

- Reranking de documentos científicos: ordena listas de artículos según su relevancia para una consulta dada, especialmente cuando la consulta es un resumen o descripción experta.
- Recuperación de información en dominios académicos: puede integrarse en pipelines de búsqueda para mejorar la precisión de los resultados iniciales obtenidos con bi-encoders o BM25.
- Comprensión de texto académico: al estar entrenado con revisiones de expertos, captura matices de vocabulario técnico y relaciones entre conceptos científicos.
- Generación de puntuaciones de relevancia: produce un score continuo para cada par consulta-documento, permitiendo umbrales configurables.
- Eficiencia computacional: al tener solo 22,7 millones de parámetros, es adecuado para despliegues con latencia baja y recursos limitados.
- Compatibilidad con sentence-transformers: al usar la librería homónima, se integra fácilmente en ecosistemas Python existentes.

## Casos de uso

- Búsqueda bibliográfica asistida: un investigador introduce un resumen de su trabajo y el modelo ordena los artículos de un repositorio académico (PubMed, arXiv, etc.) por relevancia, facilitando la revisión de literatura.
- Sistemas de recomendación de revisores: en plataformas de gestión de conferencias, el modelo puede emparejar manuscritos con revisores potenciales, puntuando la adecuación entre el contenido del paper y el perfil del revisor.
- Filtrado de preprints en agencias de financiación: organismos que evalúan propuestas pueden usar el modelo para priorizar documentos que coinciden con las líneas de investigación declaradas.
- Mejora de motores de búsqueda internos en editoriales académicas: integrado como etapa de reranking tras una búsqueda inicial, eleva la precisión de los resultados mostrados a los usuarios de plataformas como revistas o repositorios institucionales.
- Asistentes de investigación basados en RAG: en un pipeline de generación aumentada por recuperación, el modelo rerankea los fragmentos recuperados antes de pasarlos al generador, reduciendo ruido y mejorando la calidad de las respuestas.
- Análisis de tendencias científicas: dado un conjunto de abstracts y una consulta temática, el modelo puede ordenar los documentos por relevancia para identificar trabajos clave en un área emergente.
- Sistemas de detección de plagio o similitud conceptual: puntuando pares de documentos, el modelo puede ayudar a identificar trabajos con alta afinidad temática, aunque no es su propósito principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no presenta métricas en la página de Hugging Face ni en los resultados de búsqueda web. No se dispone de datos comparativos como MMLU, HumanEval o métricas específicas de reranking (nDCG, MAP) para este modelo.

## Requisitos de hardware

- VRAM estimada: al tener 22,7 millones de parámetros, el modelo en FP32 ocupa aproximadamente 91 MB, en FP16 unos 45 MB y en int8 unos 23 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM, incluso en GPUs integradas.
- GPU recomendadas: cualquier GPU moderna, desde NVIDIA GTX 1650 hasta A100. También puede ejecutarse en CPU con razonable latencia para inferencia por lotes pequeños.
- Compatibilidad con consumer GPU: sí, es totalmente viable en GPUs de consumo como RTX 3060, RTX 4090, etc., con margen amplio.
- Opciones de despliegue: al ser un modelo sentence-transformers, puede servirse con herramientas como Text Embeddings Inference (TEI), Hugging Face Inference Endpoints, o mediante bibliotecas Python como `transformers` o `sentence-transformers`. También es posible exportarlo a ONNX para inferencia optimizada.
- Latencia y throughput: no se han publicado datos oficiales. Dado el tamaño, en una GPU moderna (por ejemplo, RTX 3090) se espera una latencia por par en el orden de milisegundos, y en CPU de decenas de milisegundos por par, dependiendo de la longitud de los textos.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa exhaustiva. El propio autor publica otro modelo, `NYSgpt/44b-reranker-gte-modernbert`, que utiliza una arquitectura diferente (ModernBERT) y probablemente más parámetros, pero no se conocen sus especificaciones exactas. Otros rerankers genéricos como `BAAI/bge-reranker-base` (110M parámetros) o `cross-encoder/ms-marco-MiniLM-L6-v2` (el modelo base) son alternativas, pero no hay datos de rendimiento comparativo disponibles para este modelo concreto.

| Modelo | Parametros | Contexto | Licencia | Dominio |
|---|---|---|---|---|
| NYSgpt/44b-reranker-mini | 22,7M | no disponible | Apache-2.0 | Científico (peer review) |
| NYSgpt/44b-reranker-gte-modernbert | no disponible | no disponible | no disponible | Científico (peer review) |
| cross-encoder/ms-marco-MiniLM-L6-v2 | 22,7M | 512 | Apache-2.0 | Genérico (MS MARCO) |

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated, por lo que requiere aceptar condiciones en Hugging Face antes de su uso, lo que puede limitar su adopción en entornos automatizados.
- Sesgos del dominio: al estar entrenado exclusivamente sobre pares de revisión por pares, puede tener un rendimiento subóptimo en dominios no académicos o en tareas de reranking generalista.
- Longitud de contexto limitada: la arquitectura MiniLM-L6-v2 suele tener un límite de 512 tokens, lo que impide procesar documentos largos completos; será necesario truncar o dividir los textos.
- Riesgo de alucinación: como modelo de reranking, no genera texto, pero sus puntuaciones pueden ser inconsistentes para consultas fuera de distribución o con vocabulario muy especializado no visto en el entrenamiento.
- Sin datos de rendimiento: la ausencia de benchmarks públicos dificulta la evaluación objetiva de su calidad frente a alternativas establecidas.
- Idiomas no especificados: no se indica qué idiomas soporta; probablemente esté optimizado para inglés académico, dado el origen del corpus de revisión por pares.
- Restricciones de uso comercial: la licencia Apache-2.0 permite uso comercial, pero al ser un modelo gated, el proveedor puede imponer condiciones adicionales en el acceso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NYSgpt/44b-reranker-mini
- Modelo relacionado del mismo autor: https://huggingface.co/NYSgpt/44b-reranker-gte-modernbert
- Listado de modelos de NYSgpt: https://huggingface.co/NYSgpt/models
- Repositorio de rerankers destacados (referencia general): https://github.com/agentset-ai/awesome-rerankers
