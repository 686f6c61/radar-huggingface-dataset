# el1jah184/retriever

## Resumen

El modelo `el1jah184/retriever` es un modelo de embeddings densos para tareas de similitud semántica y recuperación de información, desarrollado por el usuario el1jah184 mediante fine-tuning del modelo base `deepvk/USER-bge-m3` (una variante de la familia BGE-M3 basada en XLM-RoBERTa). Está diseñado específicamente para recuperar pasajes relevantes dentro de documentación normativa del sector ferroviario ruso, como las reglas de explotación técnica (ПТЭ) y las instrucciones sobre movimiento de trenes y maniobras. El modelo se ha entrenado con un conjunto de datos muy reducido (415 ejemplos) utilizando funciones de pérdida de ranking de negativos múltiples, lo que lo convierte en una solución especializada más que en un modelo generalista.

Con aproximadamente 359 millones de parámetros y un tamaño de repositorio de 1,4 GB, el modelo se distribuye en formato safetensors y es compatible con la librería `sentence-transformers` y con `text-embeddings-inference`. Aunque no se especifica la licencia ni los idiomas oficiales, los ejemplos de la model card están en ruso, lo que sugiere que su uso principal se limita a ese idioma y a un dominio muy concreto. Su relevancia radica en la posibilidad de desplegar un sistema de búsqueda semántica de alta precisión sobre normativa técnica sin necesidad de entrenar un modelo desde cero, aprovechando un modelo base multilingüe ya contrastado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (XLM-RoBERTa) |
| Parametros totales | 359.026.688 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors) |
| Idiomas soportados | No disponibles oficialmente; ejemplos en ruso |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura XLM-RoBERTa, un transformer encoder multilingüe preentrenado sobre 100 idiomas. El modelo base `deepvk/USER-bge-m3` es una adaptación de la familia BGE-M3, que combina representaciones densas y dispersas para recuperación, aunque este fine-tuning concreto se centra en la generación de embeddings densos. El entrenamiento se realizó con `sentence-transformers` utilizando las funciones de pérdida `CachedMultipleNegativesRankingLoss` y `MultipleNegativesRankingLoss`, que optimizan la similitud coseno entre consultas y pasajes positivos frente a negativos muestreados. El dataset de entrenamiento consta de solo 415 ejemplos, todos ellos extraídos de normativa ferroviaria rusa, lo que indica un ajuste muy dirigido a un dominio específico. No se menciona el uso de RLHF ni DPO; el proceso es un fine-tuning supervisado estándar para recuperación.

## Capacidades

- Generación de embeddings de frases y párrafos para similitud semántica y recuperación densa.
- Búsqueda semántica sobre documentación técnica, especialmente normativa ferroviaria rusa.
- Recuperación de pasajes relevantes dado un texto de consulta, con métricas de precisión y recall evaluadas sobre un evaluador interno.
- Compatible con `sentence-transformers` para integración en pipelines de RAG (Retrieval-Augmented Generation).
- Soporte para despliegue con `text-embeddings-inference` y endpoints compatibles.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, al ser un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en manuales de operación ferroviaria: el modelo puede indexar documentos normativos (ПТЭ, instrucciones de movimiento) y responder a consultas en lenguaje natural devolviendo los pasajes exactos que regulan una situación concreta, como el cierre de un tramo para el paso de un vehículo especial.
- Asistente virtual para personal de infraestructura: integrado en un chatbot, permite a los operarios formular preguntas sobre procedimientos y obtener referencias normativas precisas, reduciendo el tiempo de consulta manual.
- Sistema de verificación de cumplimiento normativo: dado un conjunto de acciones planificadas, el modelo recupera las cláusulas relevantes para comprobar si se ajustan a la reglamentación vigente.
- Indexación de jurisprudencia o reglamentos internos: aunque el dominio actual es ferroviario, la arquitectura permite adaptarlo a otros corpus normativos con un fine-tuning adicional.
- Componente de RAG para generación de informes: combinado con un LLM, el modelo recupera los fragmentos normativos necesarios para que el generador redacte respuestas fundamentadas.
- Evaluación de consistencia documental: comparar versiones de un mismo reglamento y detectar pasajes que han cambiado semánticamente mediante la similitud de embeddings.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación son los declarados por el autor en la model card, obtenidos con un evaluador interno de recuperación de información (no verificados de forma independiente). Se evaluó la similitud coseno sobre un conjunto de consultas y pasajes del dominio ferroviario.

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,7991 |
| Cosine Accuracy@3 | 0,9330 |
| Cosine Accuracy@5 | 0,9643 |
| Cosine Accuracy@10 | 0,9955 |
| Cosine Precision@1 | 0,7991 |
| Cosine Precision@3 | 0,3110 |
| Cosine Precision@5 | 0,1929 |
| Cosine Precision@10 | 0,0996 |
| Cosine Recall@1 | 0,7991 |
| Cosine Recall@3 | 0,9330 |
| Cosine Recall@5 | 0,9643 |
| Cosine Recall@10 | 0,9955 |

Estos valores indican una alta capacidad de recuperación en el top-10, aunque la precisión baja rápidamente al aumentar el número de resultados, lo que es esperable en tareas de retrieval con colecciones pequeñas.

## Requisitos de hardware

- VRAM estimada: con 359M de parámetros, en fp32 se necesitan aproximadamente 1,4 GB de memoria; en fp16 unos 700 MB; en int8 unos 350 MB. Para inferencia con `sentence-transformers` en CPU, se puede ejecutar con 4-8 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) es suficiente para fp16. Para procesamiento por lotes grande, se recomienda una GPU con 8 GB o más (RTX 3070, A100, etc.).
- Es viable en GPU de consumo (RTX 3060, RTX 4060) y también en CPU para cargas bajas.
- Opciones de despliegue: `sentence-transformers` para prototipado, `text-embeddings-inference` para producción, `Ollama` no es compatible directamente (no es un modelo GGUF), pero se puede convertir a GGUF con herramientas externas si se desea usar con `llama.cpp`.
- Latencia y throughput: no se han publicado datos oficiales. En una GPU moderna, la codificación de un texto corto suele tardar entre 5 y 20 ms, dependiendo del lote y la longitud.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos en los datos proporcionados. Como referencia, se pueden considerar alternativas de la misma familia:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `el1jah184/retriever` | 359M | No disponible | No disponible | Fine-tuning especializado en normativa ferroviaria rusa |
| `BAAI/bge-m3` | 568M | 8192 | MIT | Modelo base multilingüe con embeddings densos y dispersos |
| `intfloat/multilingual-e5-large` | 560M | 512 | MIT | Embeddings multilingües para retrieval, entrenado con contrastive learning |
| `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` | 278M | 512 | Apache-2.0 | Modelo generalista de similitud de frases multilingüe |

La comparación es orientativa; no se han ejecutado los mismos benchmarks sobre estos modelos con el dataset del autor.

## Limitaciones y advertencias

- El modelo se ha entrenado con un dataset extremadamente pequeño (415 ejemplos), lo que puede provocar sobreajuste al dominio concreto y baja generalización fuera de la normativa ferroviaria rusa.
- No se especifica la licencia, por lo que su uso comercial es incierto; se recomienda contactar con el autor antes de utilizarlo en producción.
- Los idiomas soportados no están documentados; los ejemplos son exclusivamente en ruso, y el rendimiento en otros idiomas probablemente sea deficiente.
- No se han publicado resultados de benchmarks estándar (MTEB, MIRACL, etc.), solo métricas internas no verificadas.
- Riesgo de alucinación no aplica directamente al ser un modelo de embeddings, pero sí puede haber errores de recuperación si el corpus de consulta difiere del dominio de entrenamiento.
- La longitud de contexto no está documentada; se recomienda limitar los textos a 512 tokens para evitar degradación, aunque el modelo base BGE-M3 soporta hasta 8192.
- No hay soporte para cuantización oficial; los pesos están en safetensors y se pueden convertir, pero no se garantiza el mismo rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/el1jah184/retriever
- Paper de sentence-transformers (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper sobre MultipleNegativesRankingLoss (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
- Paper de XLM-RoBERTa (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
- Modelo base `deepvk/USER-bge-m3`: https://huggingface.co/deepvk/USER-bge-m3
