# s2naito/qwen3.5-0.8b-rag-sft-v4

## Resumen

s2naito/qwen3.5-0.8b-rag-sft-v4 es un ajuste fino (SFT v4) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario s2naito. El modelo está especializado en respuesta corta a preguntas (short-answer QA) sobre Wikipedia en japonés mediante un pipeline de generación aumentada por recuperación (RAG) que reproduce la configuración exacta de producción denominada `run029`.

El ajuste se realizó con LoRA sobre todos los módulos lineales (`target_modules="all-linear"`) y emplea un pipeline de recuperación de cuatro vías con fusión RRF (Reciprocal Rank Fusion) sobre los 100 mejores resultados, un reranker Ruri, un paso de dos saltos (2-hop) basado en reglas, selección de artículos mediante el propio Qwen3.5-0.8B y un post-procesado `rerank_title_tail` con `CONTEXT_TOP_K=5`.

Con 873.438.784 parámetros (aproximadamente 0,8 mil millones), el modelo es extremadamente ligero y está pensado para despliegues de bajo coste en tareas de QA documental en japonés. Su relevancia radica en ser un ejemplo de especialización vertical de un modelo pequeño para un pipeline RAG concreto, con licencia Apache 2.0 y pesos en safetensors. El modelo tiene cero descargas y cero likes en el momento de la consulta, lo que indica que es un artefacto de investigación reciente y poco difundido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles específicos no disponibles) |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`) y se ajusta mediante LoRA con `target_modules="all-linear"`, es decir, aplicando adaptadores de bajo rango a todas las capas lineales del transformer. No se especifica en la información disponible el rango del LoRA, la tasa de aprendizaje, el número de pasos ni la composición exacta del dataset de entrenamiento más allá de las fuentes citadas.

Los datos de entrenamiento provienen de cuatro conjuntos con licencia CC BY-SA 4.0: JEMHopQA (preguntas multi-salto), JSQuAD/JGLUE (comprensión lectora en japonés), NIILC QA (preguntas y respuestas) y fragmentos de Wikipedia en japonés del dataset `bumbuboon/llm-course-final-2026`. Los tres primeros fueron filtrados y reformateados para el entrenamiento; el corpus de Wikipedia se usó sin modificar como contexto de recuperación seleccionado por el pipeline BM25/embedding/reranker/2-hop. No se indica si hubo RLHF, DPO u otras etapas de alineación posteriores al SFT.

La innovación principal no reside en la arquitectura, sino en la integración del entrenamiento con el pipeline de recuperación de producción real (`run029`), de modo que el modelo aprende a responder condicionado a los cinco fragmentos (`CONTEXT_TOP_K=5`) que el sistema RAG le entrega en inferencia.

## Capacidades

- Generación de texto y respuesta corta a preguntas en japonés.
- QA documental condicionada a contexto recuperado (RAG), con selección de artículos y post-procesado de títulos.
- Razonamiento multi-salto limitado, apoyado en el pipeline externo de dos saltos basado en reglas.
- Comprensión lectora sobre fragmentos de Wikipedia en japonés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso autónomo.
- Capacidades multilingües: solo japonés declarado.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Respuesta corta a preguntas sobre Wikipedia en japonés: el modelo está entrenado específicamente para recibir cinco fragmentos recuperados y emitir una respuesta concisa; es su escenario natural de uso.
- Sistemas RAG de producción en japonés: al reproducir el pipeline `run029` (RRF de cuatro vías, reranker Ruri, 2-hop), puede integrarse en arquitecturas existentes sin reentrenar el pipeline de recuperación.
- Asistentes de consulta documental de bajo coste: con menos de mil millones de parámetros, puede desplegarse en hardware modesto para responder preguntas factuales sobre corpus japoneses.
- Evaluación de pipelines de recuperación: sirve como componente generador fijo para aislar y medir el impacto de cambios en el recuperador o el reranker.
- Prototipado de QA multi-salto en japonés: útil para validar flujos JEMHopQA antes de escalar a modelos mayores.
- Filtrado y selección de artículos: el propio modelo base se usa en el pipeline para la selección de artículos, capacidad que el ajuste hereda y especializa.
- Investigación sobre ajuste fino de modelos pequeños para dominios verticales: caso de estudio de LoRA con `all-linear` sobre un modelo de 0,8B para una tarea RAG concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 873 millones de parámetros, en fp16 ocuparía aproximadamente 1,7 GB de pesos; en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, alrededor de 0,5 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en A100/H100 para despliegues por lotes.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo, aunque no hay confirmación oficial.
- Opciones de despliegue: no disponible. Al ser un modelo safetensors con arquitectura `qwen3_5`, requeriría frameworks compatibles con dicha arquitectura (vLLM, TGI, transformers); no se documenta soporte en llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| s2naito/qwen3.5-0.8b-rag-sft-v4 | 873 M | no disponible | Apache 2.0 | QA RAG en japonés | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | no disponible en la información | Propósito general | Hugging Face |
| Otros modelos de QA en japonés de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre benchmarks ni sobre modelos comparables adicionales en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en QA RAG sobre Wikipedia en japonés; su rendimiento fuera de ese dominio o idioma no está documentado y previsiblemente será limitado.
- Solo declara soporte de japonés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación: como todo modelo generativo de pequeño tamaño, puede producir respuestas plausibles pero incorrectas cuando el contexto recuperado es ambiguo o insuficiente.
- Dependencia del pipeline de recuperación: el ajuste asume la configuración exacta `run029` (RRF de cuatro vías, reranker Ruri, 2-hop, `CONTEXT_TOP_K=5`); cambios en el recuperador pueden degradar el rendimiento.
- Sesgos: no se documentan análisis de sesgo; los datos de Wikipedia y de los conjuntos CC BY-SA pueden introducir sesgos propios de sus fuentes.
- Licencia Apache 2.0 para el modelo, pero los datos de entrenamiento son CC BY-SA 4.0; conviene revisar las obligaciones de atribución y compartir-igual derivadas del corpus de entrenamiento en usos comerciales.
- Sin descargas ni validación comunitaria: no hay evidencia externa de calidad ni informes de terceros.
- No se documentan límites de contexto, por lo que no puede garantizarse el comportamiento con contextos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/s2naito/qwen3.5-0.8b-rag-sft-v4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- NIILC QA: https://github.com/mynlp/niilc-qa
- Dataset de fragmentos de Wikipedia: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
