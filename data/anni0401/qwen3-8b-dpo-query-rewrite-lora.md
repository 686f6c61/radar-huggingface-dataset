# Anni0401/qwen3-8b-dpo-query-rewrite-lora

## Resumen

El modelo `Anni0401/qwen3-8b-dpo-query-rewrite-lora` es un adaptador LoRA sobre `Qwen/Qwen3-8B` entrenado con Direct Preference Optimization (DPO) para una tarea muy concreta: reescribir las peticiones del usuario de forma que un recuperador basado en embeddings (concretamente `Qwen/Qwen3-Embedding-8B`) encuentre las herramientas correctas en un sistema de tool retrieval. No es un asistente generalista ni un modelo de chat: es un artefacto de investigación que interviene únicamente en el paso de reescritura de consultas dentro de un pipeline de selección de herramientas.

El adaptador forma parte del repositorio ToolSelectionBenchmark, donde se evalúan distintas estrategias de mejora sobre un benchmark de selección de herramientas (Wild-Tool-Bench). La idea subyacente es que el recuperador, la base de datos de herramientas y el LLM ejecutor permanecen intactos; solo se ajusta el paso de reescritura. Esto permite mejorar la precisión del retrieval sin reentrenar el modelo base ni tocar la infraestructura de ejecución.

El modelo se publica bajo licencia Apache-2.0 heredada del base, con un tamaño de repositorio de 0,1 GB (solo pesos del adaptador). Es relevante para equipos que construyen agentes con tool calling y quieren mejorar la fase de selección de herramientas mediante preferencias sintéticas, sin necesidad de desplegar un modelo adicional de gran tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-8B |
| Parametros totales | 8.000 millones (modelo base Qwen3-8B); adaptador LoRA con r=8, alpha=32 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens de secuencia máxima en entrenamiento (prompt máximo 768 tokens); contexto del base Qwen3-8B no especificado en la información disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantización depende del base) |
| Idiomas soportados | no disponible (entrenado con datos sintéticos en inglés según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con DPO usando `DPOTrainer` de TRL, tomando como modelo de referencia el Qwen3-8B congelado. La configuración LoRA es r=8, alpha=32, dropout=0.0 y módulos objetivo `q,k,v,o,gate,up,down_proj`. Los hiperparámetros incluyen learning rate 1e-5, beta DPO de 0.05, 2 épocas, batch global de 32, precisión bf16 y gradient checkpointing. La longitud máxima de secuencia es de 1024 tokens, con prompt máximo de 768.

Los datos de preferencia consisten en 1.114 pares (891 de entrenamiento y 223 de validación, con split agrupado por herramientas gold). Las consultas provienen de tareas sintéticas multi-turno de uso de herramientas generadas con el generador multiagente del repositorio. Para cada consulta se generaron dos reescrituras con `openai/gpt-oss-120b`; cada reescritura se embebió con `Qwen/Qwen3-Embedding-8B` y se puntuó según el ranking de las herramientas gold entre todas las candidatas. La mejor puntuación se etiqueta como `chosen` y la otra como `rejected`. Ninguna de las 60 herramientas gold aparece en el conjunto de Wild-Tool-Bench ni en la lista del benchmark.

## Capacidades

- Reescritura de consultas de usuario para mejorar el ranking de herramientas en un recuperador de embeddings.
- Integración en pipelines de tool retrieval como paso previo a la selección y ejecución.
- Formato de prompt específico definido en `REWRITE_PROMPT_TEMPLATE` (ejemplos de herramientas muestreadas más la consulta del usuario).
- Compatible con despliegue mediante PEFT + Transformers y con vLLM usando `--enable-lora`.
- No es un modelo de propósito general: no está diseñado para conversación abierta, código, matemáticas ni razonamiento general.
- No se documentan capacidades de tool calling directo, agentes multi-paso, visión ni audio en el adaptador.

## Casos de uso

- Mejora de selección de herramientas en agentes: el adaptador reescribe la consulta del usuario para que el recuperador `Qwen3-Embedding-8B` posicione mejor las herramientas correctas, reduciendo falsos positivos en la fase de retrieval.
- Investigación en DPO aplicado a retrieval: sirve como referencia reproducible para estudiar cómo las preferencias sintéticas afectan al ranking de herramientas sin reentrenar el modelo base.
- Benchmarking de estrategias de tool selection: se integra en ToolSelectionBenchmark para comparar la reescritura DPO frente a otras estrategias de mejora del pipeline.
- Prototipado de asistentes con catálogos grandes de herramientas: al mejorar la reescritura, se reduce la necesidad de inyectar todo el catálogo en el contexto del LLM ejecutor.
- Evaluación de pipelines RAG para herramientas: permite medir el impacto de la reescritura en la precisión end-to-end con ejecutores como `gpt-oss-120b` o Laguna.
- Experimentación con LoRA de bajo rango: su configuración r=8 y alpha=32 sirve como plantilla para adaptar Qwen3-8B a tareas específicas de preprocesamiento de consultas con coste de entrenamiento reducido.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precisión de preferencia en validación (`eval_rewards/accuracies`) | 0.62 en el último paso; 0.66 en el paso 50 |
| Precisión end-to-end en Wild-Tool-Bench | reportada en el repositorio GitHub, no incluida en la información disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card advierte explícitamente que la precisión de preferencia no equivale a la precisión de la tarea final.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del base Qwen3-8B. En bf16, aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 4 bits, en torno a 5-6 GB para pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en bf16 con concurrencia; RTX 4090 (24 GB) viable en bf16 para una sola instancia sin gran batch.
- Cabe en GPU consumer: sí, en RTX 3090/4090 (24 GB) con bf16 y batch pequeño, o en GPUs de 12-16 GB con cuantización del base.
- Opciones de despliegue: PEFT + Transformers (`PeftModel.from_pretrained`), vLLM con `--enable-lora --lora-modules`, y potencialmente TGI si soporta adaptadores LoRA sobre el base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Anni0401/qwen3-8b-dpo-query-rewrite-lora | 8B (base) + LoRA r=8 | 1024 tokens en entrenamiento | Reescritura de consultas para tool retrieval | Apache-2.0 | HuggingFace (adaptador) |
| Qwen/Qwen3-8B (base) | 8B | no disponible en la información | Generación de texto general | Apache-2.0 | HuggingFace |
| Adaptadores LoRA genéricos sobre Qwen3-8B | 8B (base) + LoRA | variable | Depende del ajuste | variable | HuggingFace |

No se dispone de datos de rendimiento comparativo con alternativas específicas de reescritura de consultas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con 1.114 pares sintéticos en inglés; es un artefacto de investigación, no un asistente de propósito general.
- La señal de preferencia depende de un recuperador concreto (`Qwen3-Embedding-8B`); cambiar el recuperador puede degradar el comportamiento.
- La precisión de preferencia en validación (0.62) es moderada y no garantiza mejora end-to-end en todos los pipelines.
- El adaptador espera un formato de prompt específico (`REWRITE_PROMPT_TEMPLATE`); usarlo con otro formato puede producir reescrituras no útiles.
- Longitud de contexto limitada a 1024 tokens en entrenamiento, lo que restringe consultas largas o catálogos extensos inyectados en el prompt.
- Riesgo de alucinación en las reescrituras: puede introducir términos o herramientas no presentes en el catálogo.
- Licencia Apache-2.0 permite uso comercial, pero el autor lo describe como artefacto de investigación sin garantías de robustez en producción.
- No se documentan sesgos específicos, pero al derivar del base Qwen3-8B hereda los sesgos de este.

## Enlaces

- HuggingFace: https://huggingface.co/Anni0401/qwen3-8b-dpo-query-rewrite-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio ToolSelectionBenchmark: https://github.com/Anni0401/ToolSelectionBenchmark
- Estrategia DPO query-rewrite: https://github.com/Anni0401/ToolSelectionBenchmark/tree/main/improvement-strategies/dpo-query-rewrite
- Dataset de pares: https://github.com/Anni0401/ToolSelectionBenchmark/blob/main/improvement-strategies/dpo-query-rewrite/data/queries_gold_tools_batch1_dpo_ranked.json
- Script de generación de pares: https://github.com/Anni0401/ToolSelectionBenchmark/blob/main/improvement-strategies/dpo-query-rewrite/generate_rewrite_pairs_vllm.py
- Recuperador de embeddings: https://huggingface.co/Qwen/Qwen3-Embedding-8B
