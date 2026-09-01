# i1j/retriever

## Resumen

El modelo `i1j/retriever` es un codificador de frases (sentence transformer) desarrollado por el usuario `i1j`, especializado en tareas de similitud semántica y recuperación de información densa. Se basa en el modelo `deepvk/USER-bge-m3`, un checkpoint de la familia BGE-M3 adaptado para el ruso, y ha sido ajustado con un conjunto de datos reducido (415 ejemplos) utilizando funciones de pérdida de ranking por múltiples negativos. Su objetivo principal es generar representaciones vectoriales de alta calidad para búsqueda semántica en dominios específicos, como la normativa ferroviaria rusa, tal como muestran los ejemplos de la tarjeta del modelo.

Con 359 millones de parámetros, el modelo se posiciona en un rango medio para tareas de embedding, ofreciendo un equilibrio entre capacidad y requisitos de inferencia. Aunque la información pública no detalla la longitud de contexto ni los idiomas soportados de forma explícita, los ejemplos proporcionados están en ruso y el modelo base está orientado a ese idioma. Su relevancia actual radica en su uso potencial dentro de pipelines de Retrieval-Augmented Generation (RAG) para recuperar pasajes normativos o técnicos con precisión, un área de creciente interés en aplicaciones industriales y jurídicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en XLM-RoBERTa (fine-tuning de deepvk/USER-bge-m3) |
| Parametros totales | 359.026.688 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los ejemplos de la model card están en ruso) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `deepvk/USER-bge-m3`, que a su vez se basa en la arquitectura XLM-RoBERTa, un transformer encoder multilingüe. El ajuste se realizó con la librería `sentence-transformers` y empleó dos funciones de pérdida: `CachedMultipleNegativesRankingLoss` y `MultipleNegativesRankingLoss`. Estas pérdidas están diseñadas para entrenar modelos de recuperación densa, donde cada ejemplo de entrenamiento consiste en un par (consulta, pasaje relevante) y se utilizan los otros ejemplos del lote como negativos. El conjunto de datos de entrenamiento tiene un tamaño de 415 muestras, lo que sugiere un ajuste orientado a un dominio muy específico, probablemente normativa ferroviaria rusa, a juzgar por los ejemplos del widget. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores.

## Capacidades

- Generación de embeddings de frases y párrafos para similitud semántica.
- Recuperación de información densa: dado un texto de consulta, devuelve los pasajes más relevantes de un corpus mediante similitud coseno.
- Extracción de características (feature extraction) para uso en pipelines de clasificación o clustering.
- Compatible con la librería `sentence-transformers` y con `text-embeddings-inference` (TEI), lo que facilita su despliegue en servicios de embeddings.
- Soporte para búsqueda multilingüe limitado al ruso (según los ejemplos), aunque no hay una declaración oficial de idiomas.
- No se indica soporte para tool calling, agentes ni razonamiento multi-paso, ya que es un modelo de embeddings, no generativo.

## Casos de uso

- Búsqueda semántica en normativa técnica: el modelo puede indexar documentos normativos (por ejemplo, reglamentos ferroviarios) y permitir consultas en lenguaje natural para localizar artículos relevantes, gracias a su entrenamiento en un dominio específico.
- Asistente virtual para operadores de infraestructura: integrado en un chatbot, puede recuperar pasajes exactos de instrucciones operativas cuando un usuario pregunta sobre procedimientos de cierre de vías o maniobras.
- Sistema de preguntas y respuestas sobre documentación interna: combinado con un generador (RAG), el retriever selecciona los fragmentos más pertinentes de una base de conocimiento corporativa antes de que el LLM genere la respuesta.
- Clasificación de tickets o incidencias: los embeddings generados pueden alimentar un clasificador para categorizar consultas de soporte según el tema (seguridad, mantenimiento, operaciones).
- Deduplicación de documentos: al comparar vectores de frases, se pueden identificar documentos duplicados o versiones similares en un repositorio.
- Indexación de jurisprudencia o reglamentos: para despachos legales o entidades reguladoras, permite buscar precedentes o artículos específicos mediante consultas en lenguaje natural.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en un evaluador de recuperación de información (ir_evaluator) con métricas de similitud coseno. Los valores no han sido verificados de forma independiente.

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0.7991 |
| Cosine Accuracy@3 | 0.9330 |
| Cosine Accuracy@5 | 0.9643 |
| Cosine Accuracy@10 | 0.9955 |
| Cosine Precision@1 | 0.7991 |
| Cosine Precision@3 | 0.3110 |
| Cosine Precision@5 | 0.1929 |
| Cosine Precision@10 | 0.0996 |
| Cosine Recall@1 | 0.7991 |
| Cosine Recall@3 | 0.9330 |
| Cosine Recall@5 | 0.9643 |
| Cosine Recall@10 | 0.9955 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 359 millones de parámetros, el modelo en precisión fp32 ocupa aproximadamente 1,4 GB en memoria (coincide con el tamaño del repositorio). En fp16 o int8, el consumo sería menor, alrededor de 0,7 GB y 0,4 GB respectivamente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en lote pequeño. Modelos como NVIDIA T4, RTX 3060, RTX 4090 o A10G funcionan sin problemas.
- Cabe en GPUs de consumo: sí, cualquier GPU moderna con 4 GB o más puede ejecutar el modelo sin problemas.
- Opciones de despliegue: se puede servir mediante la librería `sentence-transformers` en Python, o a través de `text-embeddings-inference` (TEI) para endpoints de alta concurrencia. También es compatible con frameworks como Hugging Face Inference Endpoints.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de este tamaño, la latencia típica por lote de 1 frase en una GPU T4 es del orden de 10-20 ms, y el throughput puede alcanzar varios cientos de peticiones por segundo con batching adecuado.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (por ejemplo, otros fine-tunings de BGE-M3 o modelos de embeddings rusos). No se han encontrado datos públicos sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado sobre un conjunto de datos muy reducido (415 ejemplos) y en un dominio específico (normativa ferroviaria rusa), el modelo puede tener un rendimiento deficiente fuera de ese ámbito.
- Riesgo de alucinación: al ser un modelo de embeddings, no genera texto, por lo que no hay riesgo de alucinación directa. Sin embargo, si se usa en un pipeline RAG, la calidad de la recuperación depende de la cobertura del corpus indexado.
- Limitaciones de contexto: no se ha especificado la longitud máxima de secuencia soportada. Los modelos basados en XLM-RoBERTa suelen tener un límite de 512 tokens, pero no está confirmado para este checkpoint.
- Limitaciones de idioma: aunque los ejemplos están en ruso, no hay una declaración oficial de idiomas soportados. El uso en otros idiomas puede degradar significativamente el rendimiento.
- Restricciones de licencia: la licencia no está disponible, por lo que se desconoce si permite uso comercial o modificación. Se recomienda contactar al autor antes de utilizarlo en producción.
- Caveat para producción: el modelo no ha sido verificado de forma independiente y los benchmarks declarados son del propio autor. Es necesario validar su rendimiento en el caso de uso concreto antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/i1j/retriever
- Modelo base (deepvk/USER-bge-m3): https://huggingface.co/deepvk/USER-bge-m3
- Referencias citadas en los tags (papers): arxiv:1908.10084 (XLM-RoBERTa), arxiv:2101.06983 (sentence-transformers), arxiv:1807.03748 (BERT)
