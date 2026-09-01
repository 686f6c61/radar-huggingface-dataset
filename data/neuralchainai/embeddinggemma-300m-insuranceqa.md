# neuralchainai/embeddinggemma-300m-insuranceqa

## Resumen

El modelo `neuralchainai/embeddinggemma-300m-insuranceqa` es un ajuste fino completo (no LoRA) del modelo de embeddings `google/embeddinggemma-300m`, desarrollado por el equipo de neuralchainai para tareas de recuperación de información (retrieval) en el dominio de seguros. Está entrenado sobre el dataset `deccan-ai/insuranceQA-v2` con las funciones de pérdida `MultipleNegativesRankingLoss` y `MatryoshkaLoss`, lo que permite obtener representaciones vectoriales de alta calidad para preguntas y respuestas sobre pólizas, coberturas y reclamaciones.

Con 302,86 millones de parámetros, este modelo hereda la arquitectura de EmbeddingGemma, un transformer basado en Gemma 3 con inicialización T5Gemma, optimizado para ejecutarse en dispositivos de bajo consumo. Su relevancia radica en que mejora significativamente las métricas de recuperación frente al modelo base en un dominio especializado, como demuestran los incrementos en recall@k y NDCG@10. Está disponible bajo la licencia Gemma Terms of Use y se distribuye en formato safetensors, compatible con la librería `sentence-transformers` y con `text-embeddings-inference`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (EmbeddingGemma, basado en Gemma 3 con inicialización T5Gemma) |
| Parametros totales | 302.863.104 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponible (el modelo base es multilingüe) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/embeddinggemma-300m`, un modelo de embeddings de texto de 300M parámetros desarrollado por Google, que utiliza una arquitectura transformer con inicialización T5Gemma y está diseñado para generar representaciones densas de texto. El ajuste fino se realizó de forma completa (todos los pesos se actualizaron) sobre el dataset `deccan-ai/insuranceQA-v2`, que contiene pares de preguntas y respuestas del ámbito asegurador. Se emplearon dos funciones de pérdida combinadas: `MultipleNegativesRankingLoss`, que optimiza la similitud entre pares positivos frente a negativos dentro de un lote, y `MatryoshkaLoss`, que permite entrenar el modelo para producir embeddings de dimensiones reducidas (768, 512, 256 y 128) sin degradación significativa del rendimiento. El modelo utiliza prompts asimétricos para consultas y documentos: `task: search result | query: ` para consultas y `title: none | text: ` para documentos, lo que mejora la separación entre ambos espacios.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica, similitud de frases, recuperación de información y clustering.
- Soporte de dimensiones Matryoshka: permite obtener vectores de 768, 512, 256 o 128 dimensiones, adaptándose a requisitos de almacenamiento o latencia.
- Especialización en el dominio de seguros: comprende terminología sobre pólizas, coberturas, primas, reclamaciones y normativa.
- Capacidad de retrieval asimétrico: optimizado para emparejar consultas cortas con documentos largos mediante prompts diferenciados.
- Compatible con pipelines de Retrieval Augmented Generation (RAG) y sistemas de pregunta-respuesta sobre corpus de seguros.
- Multilingüe en su versión base, aunque el ajuste fino no especifica restricciones idiomáticas adicionales.

## Casos de uso

- Búsqueda semántica en documentación de pólizas: permite a aseguradoras indexar manuales, condiciones generales y cláusulas, y recuperar los fragmentos relevantes ante consultas de clientes o agentes.
- Atención al cliente automatizada: integrado en un chatbot, el modelo puede identificar la respuesta correcta a preguntas frecuentes sobre coberturas, exclusiones o procesos de reclamación, mejorando la precisión frente a modelos genéricos.
- RAG para asesores de seguros: un sistema de generación aumentada por recuperación puede usar este modelo para buscar en bases de conocimiento internas y generar respuestas contextualizadas con citas.
- Clasificación de consultas de soporte: los embeddings generados permiten agrupar tickets de soporte por tema (accidentes, salud, hogar, vida) y priorizar su derivación.
- Detección de duplicados en reclamaciones: al comparar embeddings de descripciones de siniestros, se pueden identificar reclamaciones duplicadas o relacionadas.
- Indexación de FAQs de seguros: el modelo puede convertir preguntas y respuestas en vectores para búsqueda instantánea en sitios web o aplicaciones móviles, con baja latencia en dispositivos.

## Benchmarks y rendimiento

La model card del autor proporciona métricas de recuperación sobre el split de test, evaluadas contra un banco de respuestas global único (todas las respuestas deduplicadas). Se comparan el modelo base (`google/embeddinggemma-300m`) y el modelo ajustado, ambos con dimensión de embedding 768.

| Metrica | Base | Fine-tuned | Δ |
|---|---|---|---|
| recall@1 | 0.2753 | 0.3181 | +0.0428 |
| recall@5 | 0.5031 | 0.5978 | +0.0946 |
| recall@10 | 0.6082 | 0.7108 | +0.1026 |
| recall@100 | 0.8774 | 0.9550 | +0.0776 |
| mrr@10 | 0.4747 | 0.5487 | +0.0740 |
| ndcg@10 | 0.4709 | 0.5532 | +0.0824 |

No se han publicado resultados comparativos con otros modelos de embeddings en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en FP32 (302M parámetros × 4 bytes) y unos 600 MB en FP16. El tamaño del repositorio (1,3 GB) sugiere pesos en FP32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, o integradas modernas). También puede ejecutarse en CPU con razonable latencia para lotes pequeños.
- Es adecuado para dispositivos de gama media (portátiles, tablets) gracias a su tamaño compacto y a las dimensiones Matryoshka reducidas.
- Opciones de despliegue: `sentence-transformers` para integración en Python, `text-embeddings-inference` (TEI) para servir el modelo como API REST, y compatible con `endpoints_compatible` según los tags del repositorio.
- Latencia y throughput: no se han publicado mediciones específicas; en una GPU moderna (por ejemplo, RTX 3090) se esperan latencias de pocos milisegundos por lote pequeño, y en CPU del orden de decenas de milisegundos.

## Comparativa con modelos similares

La comparativa más directa es con el modelo base `google/embeddinggemma-300m`, del cual deriva. No se dispone de datos de otros modelos de embeddings especializados en seguros para una comparación cuantitativa.

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| google/embeddinggemma-300m | 302M | No disponible | General | Gemma | Hugging Face |
| neuralchainai/embeddinggemma-300m-insuranceqa | 302M | No disponible | Seguros | Gemma | Hugging Face |

El ajuste fino aporta una mejora de +4,28 puntos en recall@1 y +8,24 puntos en NDCG@10 frente al modelo base, lo que lo hace más adecuado para aplicaciones específicas del sector asegurador.

## Limitaciones y advertencias

- La evaluación se realizó contra un banco de respuestas global fijo, donde las respuestas de entrenamiento se reutilizan en el test (InsuranceQA reutiliza respuestas). Esto puede inflar las métricas; el autor recomienda consultar el subconjunto de respuestas no vistas para una evaluación de generalización.
- El modelo está especializado en el dominio de seguros y puede degradar su rendimiento en otros dominios o con vocabulario fuera de ese ámbito.
- No es un modelo generativo: solo produce embeddings, por lo que no puede generar texto ni mantener conversaciones.
- La licencia Gemma Terms of Use impone restricciones de uso comercial; es necesario revisar los términos completos antes de desplegarlo en producción.
- No se especifican los idiomas soportados en el ajuste fino; aunque el modelo base es multilingüe, el entrenamiento con datos en inglés (InsuranceQA) puede sesgar el rendimiento hacia ese idioma.
- Riesgo de alucinación no aplica directamente, pero en sistemas RAG, la calidad de la recuperación depende de la cobertura del corpus indexado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/neuralchainai/embeddinggemma-300m-insuranceqa
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- Dataset de entrenamiento: https://huggingface.co/datasets/deccan-ai/insuranceQA-v2
- Model card de EmbeddingGemma (Google): https://ai.google.dev/gemma/docs/embeddinggemma/model_card
- Página oficial de EmbeddingGemma: https://deepmind.google/models/gemma/embeddinggemma/
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
