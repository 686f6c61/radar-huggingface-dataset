# bigsk1/jarvis-embedding-GGUF

## Resumen

El modelo `bigsk1/jarvis-embedding-GGUF` es una cuantización en formato GGUF del modelo de embeddings `google/embeddinggemma-300m`, desarrollado por el usuario de HuggingFace `bigsk1`. Está diseñado para tareas de similitud semántica, búsqueda vectorial y extracción de características, y se distribuye bajo licencia Gemma. Al ser una versión cuantizada, su objetivo es facilitar la ejecución en entornos con recursos limitados, como CPUs o GPUs de gama baja, mediante herramientas como Ollama, llama.cpp o text-embeddings-inference.

El modelo base, `embeddinggemma-300m`, es un encoder transformer de 300 millones de parámetros desarrollado por Google, optimizado para generar representaciones densas de texto. Esta versión GGUF conserva la funcionalidad del original pero reduce el tamaño del archivo (0.6 GB en el repositorio) y los requisitos de memoria, a costa de una ligera pérdida de precisión típica de la cuantización. Su relevancia radica en que permite desplegar embeddings de calidad en infraestructuras modestas sin depender de servicios en la nube.

El acceso al repositorio está restringido (gated), por lo que los usuarios deben aceptar las condiciones de licencia de Gemma antes de poder descargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (modelo base: google/embeddinggemma-300m) |
| Parametros totales | 307.581.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base; se recomienda consultar la documentacion de embeddinggemma) |
| Tipos de cuantizacion | GGUF (variantes no especificadas en la informacion proporcionada) |
| Idiomas soportados | no disponible (el modelo base soporta multiples idiomas, pero no se detalla en esta ficha) |
| Licencia | Gemma (requiere aceptacion de condiciones) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura del modelo corresponde a la del encoder `google/embeddinggemma-300m`, un transformer bidireccional basado en la familia Gemma, entrenado específicamente para producir embeddings de texto. No se dispone de detalles sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la información proporcionada. La versión GGUF es una conversión del modelo original a un formato optimizado para inferencia eficiente, sin modificaciones en los pesos más allá de la cuantización. No se han documentado innovaciones técnicas adicionales en esta adaptación.

## Capacidades

- Generación de embeddings de texto para similitud semántica (sentence-similarity).
- Extracción de características (feature-extraction) para uso en pipelines de búsqueda vectorial.
- Compatible con herramientas de inferencia que soporten GGUF, como Ollama, llama.cpp y text-embeddings-inference.
- Al estar basado en embeddinggemma-300m, se espera que herede las capacidades multilingües del modelo base, aunque no se especifican los idiomas concretos en la información disponible.
- No se han documentado capacidades adicionales como tool calling, agentes o razonamiento multi-paso, ya que es un modelo de embeddings y no un modelo generativo.

## Casos de uso

- Búsqueda semántica en bases de conocimiento: el modelo genera vectores de documentos y consultas, permitiendo recuperar información relevante mediante similitud coseno. Su tamaño reducido (300M parámetros) permite indexar colecciones de tamaño medio en memoria.
- Sistemas de recomendación basados en contenido: se pueden embedding de ítems (artículos, productos, noticias) y calcular similitudes para sugerir elementos relacionados.
- Clustering y análisis de textos: agrupar documentos por temas o detectar duplicados usando los embeddings generados.
- Clasificación de textos con pocos datos: los embeddings sirven como características de entrada para clasificadores ligeros (regresión logística, SVM) sin necesidad de fine-tuning del modelo.
- Preprocesamiento para RAG (Retrieval-Augmented Generation): integrar el modelo en un pipeline de recuperación para alimentar a un LLM generativo con contexto relevante.
- Despliegue en entornos edge o con GPU limitada: al ser GGUF cuantizado, puede ejecutarse en CPUs o GPUs con poca VRAM, ideal para prototipos y aplicaciones on-premise.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o MTEB para este modelo. Se recomienda evaluar su rendimiento en tareas específicas de embeddings (por ejemplo, en el benchmark MTEB) comparándolo con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 300M parámetros en GGUF, el tamaño del archivo es de aproximadamente 0.6 GB (incluyendo varias cuantizaciones). Una cuantización típica de 4 bits ocuparía unos 150-200 MB en memoria, por lo que puede ejecutarse en GPUs con 1 GB de VRAM o incluso en CPU.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, o integradas de última generación). También es viable en CPU con suficiente RAM.
- Compatibilidad con consumer GPU: sí, es adecuado para GPUs de consumo.
- Opciones de despliegue: Ollama, llama.cpp, text-embeddings-inference (TEI) y cualquier framework que soporte GGUF.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, se espera una latencia de pocos milisegundos por lote pequeño; en CPU, la latencia será mayor pero aceptable para aplicaciones no críticas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de embeddings cuantizados (por ejemplo, `sentence-transformers/all-MiniLM-L6-v2` en GGUF o `intfloat/multilingual-e5-small`). El modelo base `embeddinggemma-300m` es comparable en tamaño a otros encoders pequeños, pero no se han publicado métricas comparativas en la información proporcionada. Se recomienda consultar el repositorio original de Google para obtener referencias de rendimiento.

## Limitaciones y advertencias

- El acceso al repositorio está restringido (gated); es necesario aceptar la licencia Gemma de Google antes de descargar los pesos.
- Al ser una cuantización GGUF, puede haber una ligera degradación en la calidad de los embeddings respecto al modelo original en precisión completa.
- No se especifican los idiomas soportados; aunque el modelo base es multilingüe, el rendimiento puede variar según la lengua.
- No se dispone de información sobre sesgos o riesgos de alucinación, pero al ser un modelo de embeddings (no generativo), el riesgo de alucinación no aplica directamente. Sin embargo, los embeddings pueden reflejar sesgos presentes en los datos de entrenamiento del modelo base.
- No se han documentado limitaciones de contexto; se recomienda consultar la documentación de `embeddinggemma-300m` para conocer la longitud máxima de secuencia soportada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bigsk1/jarvis-embedding-GGUF
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- Licencia Gemma: https://ai.google.dev/gemma/terms (requiere aceptación)
