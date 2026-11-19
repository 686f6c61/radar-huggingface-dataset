# JetBrains-Research/budget-internalization-qwen3.5-4b-16k-grpo-budget-system-neatgrouse-s300

## Resumen

El modelo `budget-internalization-qwen3.5-4b-16k-grpo-budget-system-neatgrouse-s300` es un ajuste fino por aprendizaje por refuerzo de Qwen/Qwen3.5-4B desarrollado por JetBrains-Research. Su objetivo es internalizar un presupuesto fijo de generación de 16.384 tokens, declarado al modelo mediante un system prompt, para resolver problemas de razonamiento matemático sin necesidad de escalado en tiempo de inferencia (test-time scaling). El modelo forma parte de la investigación presentada en el artículo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*.

La arquitectura subyacente es la del modelo base Qwen3.5-4B, un transformer multimodal con pipeline `image-text-to-text`, con 4.539.265.536 parámetros totales en formato BF16 (9,1 GB de repositorio). El ajuste se realizó con GRPO sobre el dataset DeepScaleR (matemáticas) durante 300 pasos, con una recompensa binaria basada en la correctitud de la respuesta extraída de `\boxed{}`.

Es relevante porque propone un enfoque alternativo al escalado de cómputo en inferencia: en lugar de permitir cadenas de razonamiento arbitrariamente largas, el modelo aprende a operar dentro de un presupuesto declarado explícitamente. El checkpoint liberado corresponde al paso 300 de la ejecución denominada `neatgrouse`, bajo licencia Apache 2.0 heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-4B, pipeline image-text-to-text) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (presupuesto de generación de 16.384 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal de 4.539 millones de parámetros. El ajuste fino se realizó con GRPO (Group Relative Policy Optimization) usando baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Las respuestas que alcanzan el presupuesto de 16.384 tokens se truncan y se puntúan tal cual, lo que fuerza al modelo a internalizar la restricción en lugar de ignorarla.

Los datos de entrenamiento son problemas matemáticos del dataset DeepScaleR (agentica-org/DeepScaleR-Preview-Dataset), con un máximo de 3 épocas. La configuración incluye lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de warmup, durante 300 pasos totales. La recompensa es binaria, basada en la correctitud de la respuesta extraída del bloque `\boxed{}`. Cada prompt incorpora en el system prompt una declaración explícita del presupuesto de 16.384 tokens, renderizada con la plantilla de chat del modelo base. Los pesos se publican en BF16.

## Capacidades

- Razonamiento matemático con presupuesto fijo: resuelve problemas de matemáticas operando dentro de un límite declarado de 16.384 tokens de generación.
- Internalización de presupuesto: el modelo aprende a ajustar la longitud de su cadena de razonamiento al presupuesto indicado en el system prompt.
- Generación de cadenas de razonamiento (reasoning) con extracción de respuesta final mediante `\boxed{}`.
- Procesamiento image-text-to-text heredado del modelo base Qwen3.5-4B (pipeline declarado).
- Conversacional: soporta plantilla de chat del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de investigación en RLVR: sirve como checkpoint de referencia para estudiar cómo el ajuste con recompensa verificable bajo presupuesto fijo afecta a la precisión dentro del presupuesto, comparándolo con el modelo base sin ajuste.
- Razonamiento matemático con latencia acotada: en entornos donde el coste por consulta debe predecirse, el presupuesto declarado de 16.384 tokens permite dimensionar la infraestructura de inferencia de forma determinista.
- Generación de soluciones matemáticas paso a paso: útil para producir explicaciones detalladas de problemas de competición del estilo DeepScaleR, con respuesta final extraíble automáticamente.
- Baseline en pipelines de evaluación de test-time scaling: permite comparar estrategias de escalado en inferencia (self-consistency, best-of-n) frente a un modelo que ya opera bajo presupuesto fijo.
- Fine-tuning posterior sobre dominios matemáticos específicos: al estar bajo Apache 2.0 y en formato transformers/safetensors, se puede reajustar para subdominios concretos manteniendo el mecanismo de presupuesto.
- Investigación sobre control de longitud de generación: útil para estudiar cómo declarar restricciones en el system prompt afecta al comportamiento del modelo en tareas de razonamiento.
- Prototipado de asistentes matemáticos con ventana de contexto acotada: el límite de 16.384 tokens facilita el despliegue en GPUs de gama media con cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 16-24 GB para contexto largo.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB de pesos, más overhead; viable en GPUs de 12-16 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 2,5-3 GB de pesos, más overhead; viable en GPUs de 8-12 GB.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue de producción con contexto completo; RTX 4090 (24 GB) para BF16 con contexto moderado; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU consumer: sí, en RTX 4090 en BF16 con gestión de contexto, y en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI y llama.cpp/Ollama previa conversión a GGUF (no se proporcionan pesos GGUF en el repositorio).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-16k-grpo (este) | 4.539 M | no disponible (presupuesto 16.384 tokens) | GRPO con presupuesto fijo declarado | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4.539 M | no disponible | Modelo base multimodal sin ajuste RL de presupuesto | Apache 2.0 | Hugging Face |
| Alternativas de razonamiento matemático de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con otros modelos de razonamiento matemático de tamaño similar no está disponible en la información proporcionada. El principal punto de comparación es el modelo base Qwen3.5-4B, del que este checkpoint se diferencia por el ajuste GRPO orientado a internalizar un presupuesto fijo de generación.

## Limitaciones y advertencias

- Modelo de investigación: es un checkpoint intermedio (paso 300) de una ejecución experimental, no un modelo listo para producción.
- Especializado en matemáticas: el ajuste se realizó exclusivamente sobre DeepScaleR; su rendimiento en otras tareas puede degradarse respecto al modelo base.
- Dependencia del system prompt: el mecanismo de presupuesto requiere que el límite de 16.384 tokens se declare explícitamente en el system prompt; sin esa declaración el comportamiento puede no ser el esperado.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar razonamientos plausibles pero incorrectos; la recompensa de entrenamiento solo verifica la respuesta final, no la validez del razonamiento.
- Sesgos conocidos: no disponible en la información proporcionada.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados ni longitud de contexto nativa; el dato de 16.384 tokens es un presupuesto de generación, no la ventana de contexto total.
- Licencia: Apache 2.0 heredada del modelo base, permite uso comercial, pero se recomienda verificar los términos del modelo base Qwen3.5-4B.
- Sin benchmarks publicados: no hay métricas de rendimiento verificables en la información disponible, lo que dificulta evaluar su calidad frente a alternativas.
- Sin datos de despliegue: no se proporcionan pesos cuantizados ni guías de despliegue específicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-16k-grpo-budget-system-neatgrouse-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Organización JetBrains-Research: https://huggingface.co/JetBrains-Research
- Artículo de referencia: *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy* (enlace no disponible)
