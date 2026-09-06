# sandeep123/sqabf-grpo-entropy-step100

## Resumen

El modelo `sandeep123/sqabf-grpo-entropy-step100` es un fine-tuning de `Qwen/Qwen2.5-Math-1.5B` entrenado con GRPO (Group Relative Policy Optimization) y un bonus de entropía sobre el dataset ScienceQA. Lo desarrolla el usuario `sandeep123` como parte de una serie de baselines para investigar el efecto del coeficiente de entropía en el razonamiento estructurado. El objetivo es estudiar cómo la penalización de entropía, aplicada a los tokens de respuesta, afecta a la calidad y diversidad de las soluciones generadas en tareas de ciencias de opción múltiple.

El modelo se seleccionó como el mejor checkpoint en validación por `pass@6` (0.9688) para esta rama del experimento, con `pass@1` de 0.6094. Se entrenó bajo el protocolo "boxfix", que exige respuestas con pasos numerados (`Step 1..n`) y una respuesta final en `\boxed{X}` en una línea propia. La arquitectura es un transformer decoder-only heredado de Qwen2.5-Math-1.5B, con 1.777.088.000 parámetros. No se publica la longitud de contexto en la información disponible, y el modelo debe usarse con texto plano, sin plantilla de chat, para evitar una degradación de rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen/Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `Qwen/Qwen2.5-Math-1.5B`, un transformer decoder-only de 1.5B parámetros. La fase de entrenamiento utiliza GRPO implementado con `verl`, aplicando un bonus de entropía con coeficiente `entropy_coeff=1e-3` sobre los tokens de respuesta. El dataset es `scienceqa_boxfix`, una variante de ScienceQA que exige el formato "boxfix": pasos numerados `Step 1..n` seguidos de `\boxed{X}` en su propia línea y sin contenido posterior. La recompensa de formato es constante (0.03) y no decae durante el entrenamiento.

El entrenamiento se realizó durante 25 épocas (1250 pasos) con un batch de 128 prompts y K=6 rollouts por prompt. El learning rate es constante en 1e-6, la penalización KL es 0.01, y el clip de GRPO es 0.2/0.2. La temperatura de rollout es 1.0. El checkpoint publicado corresponde al paso 100, seleccionado por su `pass@6` en validación. Una advertencia importante es que el modelo se entrenó sobre texto plano sin `apply_chat_template`; aplicar la plantilla de chat de Qwen2.5-Math en inferencia causa una pérdida de aproximadamente 19 puntos de `pass@1` en una tarea hermana.

## Capacidades

- Generación de razonamiento paso a paso estructurado: produce respuestas con pasos numerados (`Step 1..n`) y una respuesta final en `\boxed{X}`, siguiendo el protocolo boxfix.
- Resolución de preguntas de opción múltiple de ScienceQA: alcanza `pass@1` de 0.6094 y `pass@6` de 0.9688 en validación con 256 prompts y K=6.
- Extracción de respuestas: la respuesta se define como el contenido del último `\boxed{}`; si no existe, se toma el último token A–E. Las respuestas sin contenido extraíble se puntúan como incorrectas.
- Uso sin plantilla de chat: el modelo espera texto plano; no debe usarse con el chat template de Qwen2.5-Math.
- No soporta tool calling, function calling ni agentes (no se documenta en la información proporcionada).
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en métodos de RL para razonamiento: el modelo sirve como baseline para comparar variantes de GRPO con bonus de entropía en tareas de razonamiento científico, permitiendo evaluar el impacto del coeficiente de entropía en la calidad de las respuestas.
- Benchmark de extracción de respuestas: se puede utilizar para probar pipelines que extraen el contenido de `\boxed{}` en salidas de modelos de razonamiento, especialmente en contextos donde el formato de respuesta es estricto.
- Estudio de diversidad vs calidad: el checkpoint, seleccionado por `pass@6`, es adecuado para analizar cómo el bonus de entropía afecta la diversidad de las soluciones generadas, en comparación con checkpoints seleccionados por `pass@1`.
- Evaluación de protocolos de formato: útil para investigar el impacto de instrucciones de formato estrictas (pasos numerados y `\boxed{}`) en el rendimiento de modelos de razonamiento generativo.
- Pruebas de estabilidad de hiperparámetros: el `entropy_coeff=1e-3` es un valor bajo; el modelo puede emplearse para estudiar la sensibilidad del entrenamiento a este coeficiente y compararlo con valores mayores que colapsan la política.
- Generación de explicaciones educativas: puede producir explicaciones paso a paso para preguntas de ciencias de opción múltiple, siempre que se use sin chat template y con el formato de respuesta esperado.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| pass@1 (validacion, 256 prompts, K=6, temperatura 1.0, seed 42) | 0.6094 |
| pass@6 (validacion, 256 prompts, K=6, temperatura 1.0, seed 42) | 0.9688 |
| Paso del checkpoint | 100 |

No se han publicado resultados de benchmarks en la información disponible más allá de las métricas de validación del autor. No se presentan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16 (formato usado en el README), el modelo ocupa aproximadamente 3,6 GB; no se publican cuantizaciones, por lo que no se puede estimar el consumo en 4-bit.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3060, A10, T4) es suficiente para inferencia en bfloat16.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo con 4 GB o más.
- Opciones de despliegue: vLLM (recomendado en el README), llama.cpp u Ollama si se convierte a GGUF, y TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado comparativas formales en la información proporcionada. Los únicos modelos comparables son el modelo base `Qwen/Qwen2.5-Math-1.5B` y otros checkpoints del mismo autor (por ejemplo, `sandeep123/sqa-grpo-entropy-step500` y `sandeep123/math-grpo-entropy-step1100`), pero no se dispone de métricas de esos modelos en la información disponible. Por tanto, no se presenta una tabla comparativa.

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado análisis de sesgos.
- Riesgo de alucinación: no se ha evaluado; el modelo solo se ha validado en ScienceQA.
- Limitaciones de contexto: la longitud de contexto no está documentada en la información proporcionada; en el README se usa `max_model_len=1536` para inferencia, lo que sugiere una ventana de trabajo de 1536 tokens en este experimento, pero no es el límite real del modelo base.
- Limitaciones de idioma: no se especifican idiomas soportados.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo es un artefacto de investigación sin garantías de producción.
- Caveat importante: aplicar el chat template de Qwen2.5-Math en inferencia degrada el rendimiento en aproximadamente 19 puntos de `pass@1`; el modelo debe usarse con texto plano.
- El modelo fue entrenado con un formato de respuesta estricto; respuestas fuera de ese formato pueden no ser extraídas correctamente.

## Enlaces

- https://huggingface.co/sandeep123/sqabf-grpo-entropy-step100
- https://huggingface.co/sandeep123/sqa-grpo-entropy-step500 (checkpoint relacionado)
- https://huggingface.co/sandeep123/math-grpo-entropy-step1100 (checkpoint relacionado)
