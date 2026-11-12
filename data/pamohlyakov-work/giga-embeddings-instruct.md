# pamohlyakov-work/Giga-Embeddings-instruct

## Resumen
Giga-Embeddings-instruct es un modelo de embeddings de tipo instruccional desarrollado por el equipo de GigaChat (autor del repositorio: pamohlyakov-work, pesos originales publicados como ai-sage/Giga-Embeddings-instruct). Se trata de un encoder derivado de un LLM decoder-only (GigaChat-3b) al que se le aplica un pooling de tipo Latent-Attention para producir representaciones vectoriales de 2048 dimensiones. Resuelve el problema de la recuperación semántica y la búsqueda de información en corpus rusos e ingleses, permitiendo usar instrucciones en lenguaje natural para adaptar el espacio de embeddings a cada tarea.

El modelo es relevante porque aplica la técnica de "instruction-aware embeddings" sobre una base decoder-only de 3.4B parámetros, lo que le permite aprovechar el conocimiento paramétrico de un LLM generativo en tareas de feature-extraction. Soporta una longitud de contexto de hasta 4096 tokens (recomendado en la model card) y está pensado tanto para retrieval asimétrico como para tareas simétricas como clasificación o similitud semántica.

La licencia MIT y su compatibilidad con sentence-transformers, transformers y LangChain facilitan su integración en pipelines de RAG, búsqueda semántica y clustering. Al estar orientado explícitamente a ruso e inglés, cubre un hueco importante en el ecosistema de embeddings open source para lenguas eslavas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: GigaChat-3b) con pooling Latent-Attention |
| Parametros totales | 3.449.624.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (recomendado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 13.8 GB) |

## Arquitectura y entrenamiento
El modelo parte de GigaChat-3b, un LLM decoder-only de aproximadamente 3.4B parámetros, y lo transforma en un encoder de embeddings mediante un cabezal de pooling denominado Latent-Attention. Esta técnica agrega las representaciones internas de las últimas capas mediante atención aprendida, en lugar de usar pooling medio o CLS, produciendo un vector denso de 2048 dimensiones. El resultado es un modelo de feature-extraction con soporte nativo para instrucciones en lenguaje natural que modifican el comportamiento del embedding según la tarea.

No se detalla en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. La model card referencia un artículo técnico publicado en el taller BSNLP (ACL Anthology 2025.bsnlp-1.3) donde se describen los detalles. La innovación principal es el uso de instrucciones solo en el lado de la query (no en los documentos) para tareas asimétricas de retrieval, y en ambos lados para tareas simétricas.

## Capacidades
- Generación de embeddings de texto de 2048 dimensiones para búsqueda semántica y recuperación de información.
- Soporte de instrucciones en lenguaje natural para adaptar el espacio vectorial a la tarea (retrieval, clasificación, similitud).
- Búsqueda asimétrica query-documento con instrucción solo en la query.
- Tareas simétricas como clasificación de sentimiento, detección de paráfrasis y similitud semántica textual, con instrucciones aplicadas a todas las entradas.
- Capacidades multilingües limitadas a ruso e inglés.
- Integración con sentence-transformers, transformers (con `trust_remote_code=True`) y LangChain mediante `HuggingFaceEmbeddings`.
- Compatibilidad con flash-attention 2 para aceleración y ahorro de memoria en inferencia con bfloat16.
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).

## Casos de uso
- Recuperación aumentada por generación (RAG) en ruso: el modelo permite indexar un corpus documental en ruso y consultar con instrucciones del tipo "Given a question, retrieve passages that answer the question", mejorando la precisión frente a embeddings genéricos multilingües.
- Búsqueda semántica en bases de conocimiento bilingües ruso-inglés: se pueden generar embeddings para documentos en ambos idiomas y consultar en cualquiera de ellos, aprovechando el contexto de 4096 tokens para pasajes largos.
- Clasificación de reseñas de productos: aplicando una instrucción como "Clasifica la reseña como positiva, negativa o neutra" a cada texto, se obtienen embeddings que pueden alimentar un clasificador ligero downstream.
- Detección de paráfrasis y duplicados: con instrucciones simétricas como "Dado un texto, recupera textos semánticamente similares", el modelo es adecuado para deduplicación de corpus y control de calidad de datasets.
- Enrutamiento semántico de tickets de soporte: los embeddings pueden usarse para asignar tickets a colas o agentes comparando con prototipos vectoriales de cada categoría, con baja latencia al ser un modelo de 3.4B en bfloat16.
- Moderación de contenido asistida por similitud: comparar embeddings de mensajes entrantes con una lista de ejemplos etiquetados de temas sensibles para priorizar revisiones humanas.
- Búsqueda en documentación técnica interna: indexación de manuales y guías con chunks de hasta 4096 tokens, consultables desde LangChain con `HuggingFaceEmbeddings`.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card menciona el tag MTEB y referencia el artículo en ACL Anthology, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni métricas MTEB en el contenido proporcionado.

## Requisitos de hardware
- VRAM estimada para inferencia en bfloat16: aproximadamente 7 GB solo para pesos (3.45B × 2 bytes), más overhead de activaciones y KV cache; en la práctica se recomienda entre 10 y 12 GB para lotes pequeños con contexto de 4096.
- GPU recomendadas: A100, H100 o L40S para throughput alto; RTX 4090 (24 GB) o RTX 3090 (24 GB) para desarrollo y despliegue en una sola GPU consumer.
- Cabe en GPU consumer de gama alta (RTX 4090, 3090). En GPUs de 8-12 GB requeriría cuantización, aunque no se documentan formatos de cuantización disponibles.
- Opciones de despliegue: transformers con `trust_remote_code=True`, sentence-transformers, LangChain (`HuggingFaceEmbeddings`), Hugging Face Inference Endpoints y flash-attention 2 para aceleración.
- No se dispone de datos medidos de latencia ni throughput en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Giga-Embeddings-instruct | 3.45B | 4096 | ru, en | MIT | Hugging Face |
| BGE-M3 | no disponible en esta ficha | no disponible en esta ficha | multilingüe | MIT | Hugging Face |
| E5-large-instruct | no disponible en esta ficha | no disponible en esta ficha | multilingüe | MIT | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible al no haberse publicado cifras MTEB en la información proporcionada.

## Limitaciones y advertencias
- El modelo está entrenado fundamentalmente para ruso e inglés; el rendimiento en castellano u otras lenguas no está garantizado.
- Al derivar de un LLM decoder-only, puede heredar sesgos presentes en el corpus de preentrenamiento de GigaChat-3b, que no se documentan en la model card.
- Riesgo de alucinación no aplica directamente a un modelo de embeddings, pero sí de falsos positivos en similitud semántica cuando los textos comparten vocabulario pero no significado.
- La longitud de contexto efectiva recomendada es de 4096 tokens; textos más largos se truncan en los ejemplos de la model card.
- Las instrucciones deben colocarse solo en las queries en tareas de retrieval y en todas las entradas en tareas simétricas; un uso incorrecto degrada la calidad de los embeddings.
- Requiere `trust_remote_code=True` por el código personalizado (custom_code), lo que implica revisar el código remoto antes de usarlo en producción.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones de la licencia del modelo base GigaChat-3b de origen.

## Enlaces
- Hugging Face: https://huggingface.co/pamohlyakov-work/Giga-Embeddings-instruct
- Repositorio original referenciado en la model card: https://huggingface.co/ai-sage/Giga-Embeddings-instruct
- Artículo técnico (ACL Anthology): https://aclanthology.org/2025.bsnlp-1.3/
