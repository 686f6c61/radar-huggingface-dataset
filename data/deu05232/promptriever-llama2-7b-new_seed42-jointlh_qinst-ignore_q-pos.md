# deu05232/promptriever-llama2-7B-new_seed42-JointLH_qinst-ignore_q-pos

## Resumen

El modelo `deu05232/promptriever-llama2-7B-new_seed42-JointLH_qinst-ignore_q-pos` es un adaptador PEFT (Parameter-Efficient Fine-Tuning) construido sobre el modelo base `meta-llama/Llama-2-7b-hf`. Forma parte de la familia Promptriever, desarrollada por el usuario deu05232, que explora el control de modelos de retrieval mediante instrucciones en lenguaje natural, de forma análoga a como se controlan los modelos generativos con prompts. El nombre del repositorio sugiere que se trata de una variante con entrenamiento conjunto (JointLH), instrucciones de consulta (qinst) y una configuración específica de ignorar la posición de la consulta (ignore_q-pos), aunque no se dispone de documentación detallada que confirme estos aspectos.

El adaptador tiene un tamaño de repositorio de 14.3 GB, lo que indica que probablemente incluye los pesos del modelo base o adaptadores de gran tamaño. Al estar basado en Llama-2-7b, hereda su arquitectura transformer decoder-only con 7 mil millones de parámetros y una ventana de contexto de 4096 tokens. La relevancia de este modelo radica en su enfoque innovador de retrieval controlado por prompts, una línea de investigación que busca unificar modelos de búsqueda y generación bajo un mismo paradigma de instrucciones. Sin embargo, la ausencia de una model card completa y de resultados de evaluación limita su aplicabilidad directa en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2-7b) |
| Parametros totales | 7 mil millones (modelo base) |
| Parametros activos | no disponible (adaptador PEFT, probablemente LoRA) |
| Longitud de contexto | 4096 tokens (heredada de Llama-2) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, formato original) |
| Idiomas soportados | no disponible (probablemente ingles, dado el modelo base) |
| Licencia | no disponible (el modelo base Llama-2 tiene licencia propia de Meta) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT sobre Llama-2-7b, lo que implica que solo se actualizan un subconjunto de parámetros durante el fine-tuning (típicamente mediante LoRA o técnicas similares). La arquitectura subyacente es la de Llama-2: un transformer autoregresivo con normalización RMSNorm, activación SwiGLU y atención con máscara causal. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El nombre "JointLH" podría referirse a un entrenamiento conjunto de loss (joint loss) o a un enfoque de aprendizaje conjunto, pero no hay confirmación. La referencia al paper `arxiv:1910.09700` en los tags corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono, que aparece de forma genérica en muchas model cards y no aporta información sobre el entrenamiento.

## Capacidades

- Retrieval de documentos: el modelo está diseñado para tareas de búsqueda de información, donde recibe una consulta y debe recuperar pasajes o documentos relevantes de un corpus.
- Control mediante prompts: siguiendo la filosofía de Promptriever, el comportamiento del modelo puede ajustarse mediante instrucciones en lenguaje natural a nivel de instancia, permitiendo personalizar la búsqueda según el contexto.
- Generación de embeddings de consultas y documentos: al estar basado en un transformer, puede producir representaciones vectoriales para calcular similitudes.
- Posible soporte de reranking: aunque no está confirmado, los modelos de retrieval basados en LLM suelen emplearse para reordenar resultados iniciales.
- Multilingüismo limitado: al heredar de Llama-2-7b, el modelo probablemente funciona mejor en inglés, aunque puede procesar otros idiomas con menor calidad.
- Sin capacidades de tool calling, agentes o visión: no hay evidencia de que el adaptador añada estas funcionalidades.

## Casos de uso

- Sistemas de recuperación aumentada por generación (RAG): el modelo puede integrarse en pipelines de RAG para seleccionar los pasajes más relevantes antes de pasarlos a un LLM generativo, mejorando la precisión de las respuestas con contexto externo.
- Búsqueda semántica en corpus corporativos: permite indexar documentos internos y recuperar información relevante mediante consultas en lenguaje natural, útil para bases de conocimiento empresarial.
- Asistentes de soporte técnico: combinado con un modelo generativo, puede ayudar a localizar manuales, FAQs o tickets anteriores relevantes para responder consultas de usuarios.
- Moderación de contenido: puede utilizarse para recuperar ejemplos previos de contenido problemático y asistir en la clasificación de nuevos casos.
- Investigación académica: sirve como base para experimentos sobre retrieval controlado por prompts, permitiendo comparar diferentes estrategias de instrucción.
- Sistemas de recomendación basados en texto: puede recuperar ítems (artículos, productos) a partir de descripciones o preferencias del usuario expresadas en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K ni de evaluaciones específicas de retrieval (nDCG, Recall@K) para este adaptador concreto. La ausencia de una model card completa impide verificar su rendimiento frente a otros modelos de retrieval.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Llama-2-7b en fp16 ocupa aproximadamente 14 GB, por lo que se necesitan al menos 16 GB de VRAM para cargarlo con el adaptador. Con cuantización a 8 bits (desconocida para este adaptador) podría reducirse a unos 8 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o GPUs de datacenter similares. En consumer, una RTX 3090 o 4090 es suficiente.
- Si cabe en consumer GPU: sí, en GPUs con 16 GB o más, aunque con limitaciones de velocidad si se usa cuantización.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la librería `peft` de HuggingFace junto con el modelo base. También es compatible con frameworks como vLLM o TGI si se fusionan los pesos, aunque no hay confirmación de soporte oficial.
- Latencia y throughput: no disponible. Para Llama-2-7b en una A100, la generación suele rondar los 20-30 tokens/s, pero en tareas de retrieval (solo forward pass de embeddings) la latencia es menor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| promptriever-llama2-7B (este) | 7B | 4096 | Retrieval con prompts | no disponible |
| BGE-large-en-v1.5 | 0.3B | 512 | Retrieval denso clasico | MIT |
| E5-large-v2 | 0.3B | 512 | Retrieval denso con contrastive learning | MIT |
| GTR-T5-large | 0.3B | 512 | Retrieval basado en T5 | Apache 2.0 |

La comparativa es limitada porque no se dispone de resultados de evaluación para este adaptador. Los modelos BGE, E5 y GTR son alternativas establecidas para retrieval denso, con tamaños mucho menores y licencias permisivas, pero no ofrecen control mediante prompts. Promptriever busca precisamente esa capacidad adicional, aunque su rendimiento relativo no puede verificarse sin benchmarks.

## Limitaciones y advertencias

- Documentación insuficiente: la model card está vacía, sin información sobre entrenamiento, datos, licencia o uso previsto. Esto dificulta su adopción en entornos profesionales.
- Sesgos heredados de Llama-2: el modelo base puede presentar sesgos de género, raza o ideología, que el adaptador no corrige.
- Riesgo de alucinación en retrieval: aunque el modelo no genera texto libre, puede producir embeddings que favorezcan pasajes irrelevantes si el entrenamiento no fue robusto.
- Limitaciones de idioma: probablemente optimizado para inglés; su rendimiento en otros idiomas es incierto.
- Licencia no especificada: el adaptador no declara licencia, y el modelo base Llama-2 tiene restricciones de uso comercial según los términos de Meta. Es necesario verificar la compatibilidad antes de usar en producción.
- Sin garantías de reproducibilidad: al no publicarse hiperparámetros ni datos de entrenamiento, no es posible replicar los resultados ni evaluar su robustez.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/deu05232/promptriever-llama2-7B-new_seed42-JointLH_qinst-ignore_q-pos)
- [HuggingFace - variante cross_batch](https://huggingface.co/deu05232/promptriever-llama2-7B-new_seed42-JointLH-cross_batch)
- [HuggingFace - variante repro](https://huggingface.co/deu05232/promptriever-repro-llama2-7b)
- [GitHub - repositorio Promptriever](https://github.com/deu05232/promptriever)
- [FriendliAI - página del modelo](https://friendli.ai/models/deu05232/promptriever-llama2-7B-new_seed42-JointLH-cross_batch)
