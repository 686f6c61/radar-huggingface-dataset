# nakotsuko13/ruri-v3-reranker-310m-rag-sft

## Resumen

Ruri v3 Reranker 310M es un modelo de reranking (reordenación de documentos recuperados) de propósito general para japonés, construido sobre la arquitectura ModernBERT Ja. El modelo original lo desarrolla el equipo de cl-nagoya, y esta variante concreta (`nakotsuko13/ruri-v3-reranker-310m-rag-sft`) es un ajuste fino supervisado (SFT) orientado a pipelines de RAG (Retrieval-Augmented Generation), publicado por el usuario nakotsuko13 bajo licencia Apache 2.0.

El modelo resuelve el segundo paso del pipeline de recuperación de información: dado un conjunto de pasajes candidatos devueltos por un retriever (típicamente bi-encoder o búsqueda léxica), el reranker asigna una puntuación de relevancia más precisa a cada par consulta-pasaje, mejorando la calidad del contexto que finalmente se inyecta en el LLM generador. Con 310 millones de parámetros, se sitúa en un punto de equilibrio entre precisión y coste computacional, lo que permite reordenar decenas de candidatos por consulta con latencia reducida.

La relevancia de esta ficha radica en que se trata de un ajuste fino específico para RAG sobre un modelo base ya consolidado en el ecosistema japonés, con soporte de secuencias de hasta 8192 tokens y un vocabulario expandido de 100 000 tokens, lo que lo hace adecuado para pasajes largos y dominios técnicos con terminología especializada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT Ja (transformer encoder con FlashAttention) |
| Parametros totales | 310 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (principal); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato estandar de Hugging Face; no confirmado explicitamente en la informacion disponible) |

## Arquitectura y entrenamiento

El modelo base es ModernBERT Ja, una implementación de la familia ModernBERT adaptada al japonés. ModernBERT es un transformer encoder que incorpora mejoras sobre BERT clásico: atención con FlashAttention, RoPE (rotary positional embeddings), alternancia entre atención global y local para manejar contextos largos, y un vocabulario expandido. En el caso de Ruri v3, el vocabulario alcanza los 100 000 tokens, frente a los 32 000 de las versiones v1 y v2, lo que reduce la fragmentación de tokens en japonés y en terminología técnica.

Esta variante concreta (`rag-sft`) es un ajuste fino supervisado sobre el reranker base, orientado específicamente a tareas de RAG. No se dispone en la información proporcionada de detalles sobre el dataset de ajuste (número de pares consulta-pasaje, composición, si hubo negativos hard mining, ni si se aplicó DPO o RLHF). La model card publicada por el autor está prácticamente vacía, por lo que los detalles de entrenamiento de este checkpoint específico deben considerarse no disponibles.

## Capacidades

- Reranking de pares consulta-pasaje: asigna una puntuación de relevancia a cada candidato recuperado, permitiendo reordenar los resultados de un retriever previo.
- Procesamiento de secuencias largas de hasta 8192 tokens, adecuado para pasajes extensos o documentos técnicos.
- Tokenización eficiente en japonés gracias al vocabulario de 100 000 tokens.
- Integración con pipelines de RAG como etapa de segunda fase (second-stage reranking).
- Inferencia acelerada mediante FlashAttention.
- No se dispone de información sobre soporte de tool calling, agentes, visión, audio o modo de razonamiento explícito; al ser un modelo encoder de reranking, estas capacidades no aplican por diseño.
- Capacidades multilingües: no disponibles más allá del japonés según la información proporcionada.

## Casos de uso

- Búsqueda empresarial en japonés: reordenar los resultados de un motor de búsqueda léxico o vectorial sobre documentación interna, mejorando la precisión de los primeros puestos que se muestran al usuario.
- Pipelines RAG sobre base documental japonesa: usar el modelo como reranker entre el retriever y el LLM generador, de modo que solo los pasajes más relevantes (por ejemplo, top-5 de top-50) se inyecten en el contexto del generador.
- Atención al cliente automatizada: reordenar artículos de base de conocimiento en japonés antes de que un LLM componga la respuesta, reduciendo respuestas basadas en documentación irrelevante.
- Búsqueda legal o regulatoria: con contexto de 8192 tokens, el modelo puede puntuar pasajes largos de contratos o normativas sin truncar secciones relevantes.
- Búsqueda académica y técnica: el vocabulario expandido reduce la fragmentación de términos especializados, lo que mejora el reranking en dominios con jerga técnica.
- Evaluación y filtrado de datasets: puntuar pares consulta-documento para construir conjuntos de entrenamiento o validar la calidad de un corpus de recuperación.
- Recuperación en asistentes de código o documentación de API en japonés: reordenar fragmentos de documentación técnica antes de pasarlos a un modelo generador de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint específico (`nakotsuko13/ruri-v3-reranker-310m-rag-sft`). El modelo base `cl-nagoya/ruri-v3-reranker-310m` declara en su model card un rendimiento state-of-the-art en reranking para japonés con robustez en múltiples dominios, pero no se dispone de las cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,7 GB solo para pesos (310 M × 2 bytes), más overhead de activaciones; en la práctica, menos de 2 GB para lotes pequeños.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,4 GB para pesos; en 4 bits, alrededor de 0,2 GB (si bien no se confirman formatos de cuantización publicados para este checkpoint).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); para despliegue de alto throughput, A100 o H100 permiten lotes grandes y paralelismo.
- Cabe holgadamente en GPU consumer e incluso en CPU para volúmenes moderados de consultas.
- Opciones de despliegue: Hugging Face Transformers, Text Embedding Inference (TEI) para rerankers, vLLM no aplica (no es un modelo generativo), llama.cpp/Ollama no aplican por el mismo motivo. Para servir el modelo como endpoint de reranking, TEI es la opción más directa.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware, la longitud de los pasajes y el tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Notas |
|---|---|---|---|---|---|
| nakotsuko13/ruri-v3-reranker-310m-rag-sft | 310 M | 8192 | Japones | Apache 2.0 | Ajuste fino SFT para RAG; sin benchmarks publicados |
| cl-nagoya/ruri-v3-reranker-310m | 310 M | 8192 | Japones | no disponible en la informacion | Modelo base; declara SOTA en japones |
| BGE Reranker v2 (m3) | no disponible en la informacion | no disponible en la informacion | Multilingue | no disponible en la informacion | Alternativa multilingue de reranking |
| Jina Reranker v2 | no disponible en la informacion | no disponible en la informacion | Multilingue | no disponible en la informacion | Alternativa multilingue de reranking |

La comparación cuantitativa con alternativas no es posible con la información disponible, ya que no se han publicado métricas de este checkpoint ni se dispone de cifras verificadas de los modelos comparados en el material proporcionado.

## Limitaciones y advertencias

- La model card del autor está prácticamente vacía: no documenta datos de entrenamiento, composición del dataset de SFT, ni métricas de evaluación. Esto dificulta auditar el comportamiento del modelo en producción.
- El modelo está especializado en japonés; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Al ser un modelo de reranking, no genera texto: no puede usarse como LLM ni como chatbot.
- Riesgo de sesgos heredados del corpus de entrenamiento del modelo base y del dataset de ajuste, no documentados.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de puntuaciones de relevancia mal calibradas en dominios alejados de la distribución de entrenamiento.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base `cl-nagoya/ruri-v3-reranker-310m` antes de un despliegue comercial, ya que la información disponible no detalla su licencia.
- Con 0 descargas y 0 likes en el momento de la consulta, el checkpoint carece de validación comunitaria; se recomienda evaluarlo contra el modelo base antes de adoptarlo.
- El límite de contexto de 8192 tokens debe respetarse; pasajes más largos requieren truncado o fragmentación, lo que puede degradar la puntuación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nakotsuko13/ruri-v3-reranker-310m-rag-sft
- Modelo base en Hugging Face: https://huggingface.co/cl-nagoya/ruri-v3-reranker-310m
- Ficha del modelo base en Inferix: https://inferix.co/models/cl-nagoya/ruri-v3-reranker-310m
