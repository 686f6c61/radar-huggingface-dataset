# sandeep123/sqabf-grpo-entropy-step600

## Resumen

`sandeep123/sqabf-grpo-entropy-step600` es un modelo de razonamiento científico entrenado mediante Reinforcement Learning (RL) con GRPO (Group Relative Policy Optimization) sobre el modelo base `Qwen/Qwen2.5-Math-1.5B`. Lo desarrolla el usuario `sandeep123` como parte de una suite experimental que compara variantes de entrenamiento con recompensa de entropía. El objetivo es servir como baseline reproducible para estudiar cómo afecta el `entropy bonus` a la precisión y a la diversidad de las respuestas en la tarea ScienceQA.

El modelo tiene 1.777.088.000 parámetros y se publica en formato `safetensors` bajo licencia Apache 2.0. Está pensado para ser usado con texto plano (sin chat template) y se recomienda inferencia con vLLM. Aunque la ficha del autor no especifica la longitud de contexto del modelo base, el ejemplo de uso emplea `max_model_len=1536`. La relevancia del modelo radica en servir como referencia para investigaciones en algoritmos de RL y protocolos de recompensa en tareas de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en `Qwen2.5-Math-1.5B` |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el ejemplo de uso con vLLM indica `max_model_len=1536` |
| Tipos de cuantizacion | No disponible; en el ejemplo se usan pesos en `bfloat16` |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen2.5-Math-1.5B` y se somete a un fine-tuning con RL utilizando GRPO. La recompensa incluye un `entropy bonus` sobre los tokens de respuesta, con un coeficiente de `1e-3`. El entrenamiento se realiza sobre el dataset `ScienceQA` con el protocolo `scienceqa_boxfix`, que exige que el modelo produzca un razonamiento numerado (`Step 1..n`) y termine con la respuesta en `\boxed{X}` en una línea propia. Además, la recompensa de formato es constante (`0.03`) y no decae durante el entrenamiento.

La configuración de entrenamiento se mantiene idéntica para todos los brazos de la suite experimental: 25 épocas (1250 pasos), batch de 128 prompts con 6 rollouts por prompt, learning rate constante de `1e-6`, KL de `0.01`, y longitud máxima de prompt/respuesta de `512`/`1024` tokens. Este checkpoint concreto se selecciona como mejor `pass@6` de su rama en el paso 600. La model card advierte explícitamente que no se debe aplicar el chat template, porque durante el entrenamiento se usó texto plano sin plantilla y aplicar el template en inferencia puede provocar una pérdida de aproximadamente 19 puntos de `pass@1`.

## Capacidades

- Razonamiento paso a paso para preguntas de opción múltiple en ScienceQA, con respuestas estructuradas en `\boxed{}`.
- Generación de cadenas de razonamiento numeradas que cumplen un formato estricto, lo que facilita la extracción automática de respuestas.
- Soporte para muestreo múltiple: el modelo puede generar varios rollouts con `temperature=1.0`, alcanzando un `pass@6` de 0.9805 en validación.
- Compatibilidad con vLLM para inferencia con texto plano; la model card proporciona un ejemplo de uso sin aplicar el chat template.
- No se han documentado capacidades de tool calling, function calling, visión, audio ni agentes complejos en la información disponible.
- No se dispone de información sobre capacidades multilingües específicas para este checkpoint.

## Casos de uso

- Evaluación de modelos educativos en ciencias: el modelo puede generar explicaciones razonadas para preguntas de opción múltiple de ScienceQA, lo que permite construir simulacros de exámenes con respuesta automática.
- Baseline en investigación de RL: sirve como referencia para comparar el efecto de incorporar un `entropy bonus` en la recompensa de GRPO frente a otros baselines sin este término.
- Validación de protocolos de recompensa: permite probar si una recompensa de formato constante mejora la adherencia al formato `\boxed{}` y facilita la evaluación automatizada.
- Generación de explicaciones en aplicaciones de tutoría: el modelo produce razonamientos numerados que pueden usarse para mostrar pasos de solución a estudiantes, siempre que el prompt siga el formato de ScienceQA.
- Pruebas de integración en pipelines de inferencia con vLLM: al ser un modelo pequeño (1.7B), es adecuado para verificar el rendimiento de la decodificación con múltiples muestras (`n=6`) y longitudes de contexto reducidas.
- Análisis del equilibrio precisión-diversidad en RL: el checkpoint en el paso 600 puede compararse con otros de la misma serie (por ejemplo, paso 500 o 1100) para estudiar cómo evoluciona la diversidad de las respuestas a lo largo del entrenamiento.

## Benchmarks y rendimiento

Los resultados de validación reportados por el autor en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| pass@1 | 0.7871 |
| pass@6 | 0.9805 |
| Paso del checkpoint | 600 |

La validación se realizó con 256 prompts separados, 6 rollouts por prompt, temperatura 1.0 y semilla 42. La respuesta se extrae del contenido del último `\boxed{}`; si no existe, se toma el último token de opción A-E. Las respuestas sin respuesta extraíble se puntúan como incorrectas. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Pesos en `bfloat16`: aproximadamente 3.55 GB (1.777B parámetros × 2 bytes).
- Para la configuración del ejemplo con vLLM (`max_model_len=1536`, `n=6`), se estima que una GPU con 8 GB de VRAM es suficiente. No se han publicado requisitos oficiales.
- GPUs recomendadas: no disponible en la información proporcionada; a modo orientativo, una RTX 4090 (24 GB) o una A100 (40/80 GB) ofrecen margen amplio.
- Despliegue: compatible con vLLM según el ejemplo de la model card. También se espera compatibilidad con Hugging Face Transformers y llama.cpp, aunque no está verificado en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos detallados frente a otros modelos. Los modelos más cercanos son otros checkpoints del mismo autor y el propio modelo base. La tabla siguiente resume las diferencias conocidas:

| Modelo | Base | Objetivo | Paso | pass@1 | pass@6 |
|---|---|---|---|---|---|
| `sandeep123/sqabf-grpo-entropy-step600` | Qwen2.5-Math-1.5B | ScienceQA, entropy coeff 1e-3 | 600 | 0.7871 | 0.9805 |
| `sandeep123/sqa-grpo-entropy-step500` | Qwen2.5-Math-1.5B | ScienceQA, entropy coeff 1e-3 | 500 | no disponible | no disponible |
| `sandeep123/math-grpo-entropy-step1100` | Qwen2.5-Math-1.5B | Matemáticas | 1100 | no disponible | no disponible |
| `Qwen/Qwen2.5-Math-1.5B` | Qwen2.5-Math-1.5B | Preentrenamiento matemático | - | no disponible | no disponible |

Todos los checkpoints del autor comparten arquitectura, tamaño de parámetros y licencia Apache 2.0. No se han publicado datos de contexto ni de rendimiento en sus respectivas fichas.

## Limitaciones y advertencias

- No aplicar el chat template: la model card advierte que aplicar el template de Qwen2.5-Math en inferencia puede reducir `pass@1` en aproximadamente 19 puntos en una tarea hermana.
- El modelo está especializado en el formato `scienceqa_boxfix`; respuestas que no terminen con `\boxed{}` o que incluyan texto posterior pueden ser consideradas incorrectas en la evaluación presupuestada.
- Es un modelo pequeño de 1.5B, por lo que su capacidad de generalización fuera de ScienceQA no está documentada; no se ha evaluado en tareas de código, matemáticas abiertas ni lenguaje general.
- El entrenamiento con recompensa de formato constante y un coefficiente de entropía bajo puede favorecer respuestas precisas pero poco diversas. En la model card se menciona que valores más altos (por ejemplo, `1e-2`) provocaron colapso de la política.
- No hay información sobre sesgos de género, cultura o idioma. El modelo hereda los sesgos del modelo base `Qwen2.5-Math-1.5B`.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es un checkpoint de investigación y no ha sido validado para producción.

## Enlaces

- https://huggingface.co/sandeep123/sqabf-grpo-entropy-step600
- https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
- https://huggingface.co/sandeep123/sqa-grpo-entropy-step500
- https://huggingface.co/sandeep123/math-grpo-entropy-step1100
