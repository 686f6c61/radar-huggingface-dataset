# sandeep123/sqabf-grpo-cliphigh-step200

## Resumen

`sandeep123/sqabf-grpo-cliphigh-step200` es un modelo fine-tuned a partir de `Qwen/Qwen2.5-Math-1.5B`, entrenado mediante GRPO (Group Relative Policy Optimization) sobre el dataset ScienceQA. El autor, sandeep123, lo publica como baseline de la rama "Clip-Higher" dentro de una suite de experimentos que estudia los efectos de distintos límites de clipping en PPO desacoplado. El objetivo es mejorar la capacidad de razonamiento del modelo en preguntas de opción múltiple de ciencias, forzando una estructura de respuesta numerada (Step 1..n) y una respuesta final en formato `\boxed{}`.

El checkpoint seleccionado es el que obtiene mejor `pass@6` en validación para esta rama (rank 2), con métricas de 0.6706 en `pass@1` y 0.9688 en `pass@6`. El modelo tiene 1.777.088.000 parámetros totales y se distribuye en formato `safetensors` bajo licencia Apache-2.0. Es un modelo pequeño y experimental, orientado a investigación en métodos de RL y razonamiento científico, no a producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-Math-1.5B` y se entrena con GRPO sobre el dataset ScienceQA, concretamente sobre la variante `scienceqa_boxfix`. El entrenamiento se realiza durante 25 epochs y 1250 steps, con batch de 128 prompts y K=6 rollouts por prompt. La tasa de aprendizaje es constante a 1e-6, con coeficiente KL in-reward de 0.01, y los límites de longitud son 512 tokens de prompt y 1024 de respuesta. El prompt exige una razonamiento numerado (Step 1..n) seguido de una línea final con `\boxed{X}` sin nada después. El reward de formato es 0.03, constante, y el seed fijado en 42.

La innovación técnica principal es el uso de límites de clipping desacoplados: lower 1-0.2 y upper 1+0.28, siguiendo el esquema DAPO. Además, el autor especifica que el modelo se entrenó con texto plano sin chat template (`apply_chat_template=False` en verl), y aplicarlo en inferencia puede degradar el rendimiento en unos 19 puntos de `pass@1` en tareas hermanas.

## Capacidades

- Genera respuestas de razonamiento paso a paso para preguntas de ciencias, siguiendo una estructura numerada.
- Produce una respuesta final en `\boxed{}` que permite extraer la opción elegida de forma automática.
- Muestra resultados de validación de 0.6706 en `pass@1` y 0.9688 en `pass@6` en ScienceQA.
- No soporta tool calling, function calling ni uso de agentes.
- No soporta visión, audio ni otras modalidades.
- Capacidades multilingües no documentadas; el modelo base Qwen2.5-Math está orientado a matemáticas y ciencias.
- No se debe aplicar chat template en inferencia, ya que fue entrenado con texto plano.

## Casos de uso

- Evaluación de exámenes de ciencias: el modelo genera una cadena de razonamiento numerada y una opción final `\boxed{}`, lo que permite puntuar automáticamente respuestas de opción múltiple en tests de ciencia.
- Investigación en RL y GRPO: sirve como baseline reproducible para comparar variantes de clipping en PPO desacoplado, gracias a que las métricas de validación y las configuraciones están documentadas.
- Generación de explicaciones en sistemas de tutoría: su salida estructurada en pasos puede usarse para mostrar al estudiante el razonamiento detrás de cada respuesta.
- Fine-tuning downstream: al ser un modelo de 1.5B, es económico de ajustar para tareas específicas de ciencias o QA educativo.
- Pruebas de robustez de decodificación: el autor documenta un mismatch de ~19 puntos si se aplica chat template; puede usarse para estudiar cómo afectan las plantillas de diálogo al rendimiento en modelos RL.
- Generación de datos sintéticos: puede generar preguntas y respuestas razonadas de estilo ScienceQA para aumentar conjuntos de entrenamiento de modelos más grandes.
- Análisis de selección de checkpoints: el autor publica dos checkpoints (best-pass@1 y best-pass@6) para estudiar el trade-off entre precisión y diversidad en resultados de RL.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| pass@1 | 0.6706 |
| pass@6 | 0.9688 |
| step | 200 |

Los valores corresponden a la validación sobre 256 prompts held-out, con K=6, temperatura 1.0 y seed 42. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3.6 GB en bfloat16 para los pesos, más overhead de vLLM, por lo que se recomiendan al menos 6 GB de VRAM.
- GPU recomendadas: RTX 3060 12GB, RTX 4070, A10G, o cualquier GPU con 8 GB o más.
- Puede ejecutarse en GPUs de consumo, como una RTX 3080 o RTX 4090, para inferencia con lotes pequeños.
- Opciones de despliegue: vLLM (usado en el ejemplo del autor), Hugging Face Transformers, o llama.cpp si se convierte a GGUF (no se incluyen cuantizaciones en el repo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de comparativa en la información proporcionada. El modelo es un fine-tune de `Qwen/Qwen2.5-Math-1.5B`; existen otros checkpoints del mismo autor, como `sandeep123/sqa-grpo-cliphigh-step400`, pero no se aportan métricas comparables en la documentación consultada.

## Limitaciones y advertencias

- No aplicar chat template en inferencia: el modelo fue entrenado con texto plano; hacerlo introduce un mismatch de aproximadamente 19 puntos de `pass@1` en tareas hermanas.
- Es un modelo experimental, fine-tuned únicamente sobre ScienceQA, por lo que su generalización a otras tareas o dominios no está validada.
- Riesgo de alucinación: al ser un modelo pequeño y especializado, puede generar razonamientos plausibles pero incorrectos.
- No soporta tool calling, function calling, ni interacción con agentes.
- No se documentan idiomas soportados; el modelo base está orientado a matemáticas y ciencias, con soporte principalmente en inglés y chino, aunque no se confirma en la ficha.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no ofrece garantías de rendimiento ni seguridad para producción.
- Las métricas de validación provienen de un protocolo específico (K=6, seed 42) y pueden no replicarse con otras configuraciones de decodificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sandeep123/sqabf-grpo-cliphigh-step200
- Checkpoint alternativo del mismo autor: https://huggingface.co/sandeep123/sqa-grpo-cliphigh-step400
