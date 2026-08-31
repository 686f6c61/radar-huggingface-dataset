# sandeep123/aops-grpo-entropy-step900

## Resumen

El modelo `sandeep123/aops-grpo-entropy-step900` es un checkpoint intermedio de un experimento de reinforcement learning (RL) sobre el modelo base `Qwen/Qwen2.5-Math-1.5B`, desarrollado por el usuario sandeep123. Forma parte de un estudio comparativo de brazos de entrenamiento GRPO (Group Relative Policy Optimization) sobre el dataset ScienceQA, donde este checkpoint en particular incorpora un bonus de entropía en la función de pérdida para fomentar la exploración durante el entrenamiento.

El modelo está entrenado para resolver problemas de opción múltiple de ScienceQA, un dataset de preguntas de ciencias con respuestas A-E. La arquitectura es un transformer decoder-only de 1.777 millones de parámetros, basado en Qwen2.5-Math, con una licencia Apache 2.0 que permite uso comercial y modificación. Este checkpoint fue seleccionado como el mejor en validación pass@6 para su brazo experimental, alcanzando un pass@1 de 0.2220 y un pass@6 de 0.4180.

La relevancia de este modelo reside en que documenta de forma reproducible un experimento de RL con GRPO, incluyendo los ajustes de hiperparámetros y el criterio de selección de checkpoint. Es útil para investigadores que estudian estrategias de exploración en RL para razonamiento matemático y para quienes comparan el efecto de diferentes coeficientes de entropía en el rendimiento del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1536 tokens (max prompt 512 + max response 1024) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible (dataset en ingles, probablemente solo ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-Math-1.5B, un transformer decoder-only con 1.777 millones de parámetros, atención multi-cabeza estándar y normalización RMSNorm. El modelo fue entrenado con GRPO, un algoritmo de RL que elimina la necesidad de un modelo crítico separado, usando la recompensa relativa del grupo de rollouts para calcular ventajas. En este brazo experimental, se añadió un término de bonus de entropía con coeficiente 1e-3, aplicado solo a los tokens de respuesta, para incentivar la exploración.

El entrenamiento se realizó con el framework verl, sobre el dataset ScienceQA (variante `scienceqa_boxfix`), durante 25 épocas equivalentes a 1250 pasos. Se usaron 128 prompts por batch con K=6 rollouts cada uno, learning rate constante de 1e-6, un coeficiente KL dentro de la recompensa de 0.01, y una recompensa de formato fija de 0.03. La temperatura de rollout fue 1.0 con top_p=1.0 y top_k=-1. El checkpoint corresponde al paso 900, elegido por su mejor pass@6 en validación.

Una característica crítica es que el modelo fue entrenado con texto de prompt sin plantilla de chat (`apply_chat_template=False`). Aplicar la plantilla de chat de Qwen2.5-Math en inferencia produce una degradación medida de aproximadamente 19 puntos de pass@1 en una tarea hermana.

## Capacidades

- Razonamiento científico de opción múltiple: resuelve preguntas de ScienceQA con respuestas A-E, extrayendo la respuesta del contenido de `\boxed{}` final o del último token A-E independiente.
- Generación de razonamiento paso a paso en texto plano, sin formato de chat.
- Exploración con temperatura: soporta muestreo con temperatura 1.0 y múltiples rollouts (pass@6) para mejorar la probabilidad de respuesta correcta.
- Entrenamiento específico para el formato de respuesta con `\boxed{}`: el modelo aprende a emitir su respuesta final en este formato estructurado.
- Capacidades multilingües: no disponibles (el dataset ScienceQA está en inglés; no se reportan otros idiomas).
- No soporta tool calling, ni agentes, ni visión, ni audio.

## Casos de uso

- Evaluación de estrategias de RL para razonamiento: investigadores pueden usar este checkpoint como referencia para comparar el efecto del bonus de entropía frente a otros brazos experimentales (por ejemplo, el brazo `aops-grpo-cliphigh`).
- Generación de respuestas razonadas en dominios científicos: dado un prompt de pregunta de ciencias con opciones A-E, el modelo genera un razonamiento y una respuesta final en formato `\boxed{}`. Adecuado para prototipos de sistemas de ayuda al estudio.
- Análisis de degradación por plantilla de chat: el modelo es un caso de estudio documentado de cómo la discrepancia train/eval por el uso de chat template afecta al rendimiento, útil para quienes diseñan pipelines de RL.
- Investigación sobre selección de checkpoints: el modelo documenta que el mejor checkpoint para pass@1 (pasos 1000-1200) difiere del mejor para pass@6 (pasos 200-500), lo que informa sobre criterios de selección en experimentos de RL.
- Reproducción de experimentos GRPO: al publicar los ajustes completos de hiperparámetros, permite reproducir el brazo experimental de entropía y verificar los resultados reportados.
- Comparación de algoritmos de exploración: sirve como baseline para probar variantes de GRPO con diferentes coeficientes de entropía o métodos de exploración alternativos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| pass@1 (ScienceQA validacion, 256 prompts) | 0.2220 |
| pass@6 (ScienceQA validacion, 256 prompts) | 0.4180 |
| Paso de entrenamiento | 900 |

No se han publicado resultados de benchmarks en la informacion disponible comparando con otros modelos. Los valores reportados corresponden a la validación del propio experimento con 256 prompts retenidos, K=6 rollouts, temperatura 1.0 y semilla 42. La extracción de respuestas se realizó según un protocolo pre-registrado: contenido del último `\boxed{}`, o el último token A-E independiente si no hay caja. Las respuestas sin respuesta extraíble se puntúan como incorrectas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1.777 millones de parámetros en bfloat16, lo que ocupa aproximadamente 3.55 GB en memoria. Con una ventana de contexto de 1536 tokens y batch de 6, se recomiendan al menos 8 GB de VRAM para inferencia cómoda.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más de VRAM, como RTX 3060, RTX 4060, RTX 4090, o GPUs de datacenter como A10, A100 o H100 para mayor throughput.
- Cabe en GPU consumer: sí, el modelo es pequeño y cabe en GPUs de gama media con 8 GB de VRAM o más.
- Opciones de despliegue: el modelo card recomienda vLLM con dtype bfloat16 y `max_model_len=1536`. También puede usarse con llama.cpp u Ollama si se convierte a GGUF, aunque no se proporcionan cuantizaciones oficiales.
- Latencia y throughput estimados: no disponibles. En una RTX 4090, un modelo de 1.5B en bfloat16 puede generar aproximadamente 50-100 tokens/segundo, pero no hay datos específicos para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodologia | pass@1 (ScienceQA) | Licencia |
|---|---|---|---|---|---|
| sandeep123/aops-grpo-entropy-step900 | 1.78B | 1536 | GRPO + bonus entropia | 0.2220 | Apache 2.0 |
| Qwen/Qwen2.5-Math-1.5B (base) | 1.78B | 32768 | Pre-entrenamiento + SFT matematicas | no disponible | Apache 2.0 |
| sandeep123/aops-grpo-cliphigh-step900 | 1.78B | 1536 | GRPO + clip alto | no disponible | Apache 2.0 |

La comparativa se limita a los brazos del mismo experimento y al modelo base, ya que no se dispone de datos de otros modelos en ScienceQA con el mismo protocolo de evaluación. El checkpoint de entropía es el mejor en pass@6 para su brazo, pero no se reportan los valores del brazo cliphigh en la información disponible.

## Limitaciones y advertencias

- No se debe aplicar la plantilla de chat de Qwen2.5-Math en inferencia: el modelo fue entrenado con texto plano y el uso de chat template degrada el rendimiento en aproximadamente 19 puntos de pass@1.
- El modelo está especializado en ScienceQA y no se ha evaluado en otras tareas de razonamiento; su rendimiento fuera de este dominio es desconocido.
- La extracción de respuestas depende del formato `\boxed{}`: si el modelo no emite este formato, se usa el último token A-E, y las respuestas sin formato extraíble se puntúan como incorrectas. Esto puede penalizar respuestas correctas con formato alternativo.
- La validación usa 256 prompts fijos con semilla 42; los resultados pueden variar con otros conjuntos de validación.
- El checkpoint está seleccionado por pass@6, no por pass@1; para aplicaciones que requieren una sola respuesta, otros checkpoints (pasos 1000-1200) podrían ser mejores.
- No se proporcionan cuantizaciones oficiales (GGUF, AWQ, GPTQ); el uso con llama.cpp u Ollama requiere conversión manual.
- El modelo se entrenó con un dataset en inglés; no se ha evaluado su rendimiento en otros idiomas.
- El uso de temperatura 1.0 y top_p=1.0 genera respuestas altamente estocásticas; para uso determinista se recomienda temperatura 0 o ajustar los parámetros de muestreo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeep123/aops-grpo-entropy-step900
- Brazo comparativo (cliphigh): https://huggingface.co/sandeep123/aops-grpo-cliphigh-step900
- Documentación de GRPO en verl: https://verl.readthedocs.io/en/latest/algo/grpo.html
- Guía ilustrada de GRPO: https://abderrahmanskiredj.github.io/the-illustrated-grpo/The%20Illustrated%20GRPO.pdf
- Paper E-GRPO (entropy aware GRPO): https://arxiv.org/abs/2601.00423
- Modelo base Qwen2.5-Math-1.5B: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
