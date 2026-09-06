# sandeep123/sqabf-grpo-vanilla-step500

## Resumen

El modelo `sandeep123/sqabf-grpo-vanilla-step500` es un checkpoint de investigación desarrollado por `sandeep123` en HuggingFace. Se trata de un fine-tuning con Reinforcement Learning (RL) mediante GRPO (Group Relative Policy Optimization) sobre el modelo base `Qwen/Qwen2.5-Math-1.5B`. Su objetivo es servir como baseline reproducible para el razonamiento en el dataset ScienceQA, siguiendo el protocolo "boxfix", que exige una respuesta estructurada con pasos numerados y una respuesta final en `\boxed{X}`.

El modelo tiene 1.777.088.000 parámetros y se ha entrenado durante 500 pasos (de un total de 1250). En validación alcanza un pass@1 de 0,7591 y un pass@6 de 0,9766. Es relevante para la comunidad de investigación en RL y alineación, ya que permite comparar variantes de GRPO y protocolos de prompt sin aplicar chat template, evitando el mismatch de entrenamiento/inferencia documentado por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) basado en Qwen2.5-Math-1.5B |
| Parámetros totales | 1.777.088.000 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento limita prompt a 512 tokens y respuesta a 1024 tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `Qwen/Qwen2.5-Math-1.5B`, un transformer decoder-only. El entrenamiento se realizó con GRPO, una variante de RL que optimiza la política usando grupos de rollouts. Se usó el dataset ScienceQA en su variante `scienceqa_boxfix`, con un protocolo que exige que el modelo genere un razonamiento numerado (Step 1..n) y finalice con `\boxed{X}` en una línea propia, sin nada después. La recompensa de formato es constante (0.03) y se añade a la recompensa de exactitud.

El entrenamiento se ejecutó con 128 prompts por batch, K=6 rollouts por prompt, learning rate constante de 1e-6, KL in-reward de 0.01, entropy_coeff=0, clip simétrico de PPO 0.2 y temperatura de rollout 1.0. Un aspecto crítico es que el modelo se entrenó con texto plano, sin chat template. Aplicar el chat template de Qwen2.5-Math en inferencia produce un mismatch que, según el autor, reduce el pass@1 en aproximadamente 19 puntos en una tarea hermana. El checkpoint seleccionado es el que mejor pass@6 alcanza en validación (step 500), mientras que el mejor pass@1 suele aparecer en pasos 1000-1200.

## Capacidades

- Responde preguntas de opción múltiple en ScienceQA con razonamiento paso a paso numerado.
- Extrae la respuesta final en formato `\boxed{X}` (donde X es A-E), facilitando la evaluación automática.
- Hereda capacidades matemáticas y de razonamiento de Qwen2.5-Math-1.5B.
- No se ha documentado soporte para tool calling ni function calling.
- No soporta visión ni audio; solo procesa texto.
- No soporta chat template; debe usarse con texto plano para mantener la coherencia con el entrenamiento.
- Genera múltiples rollouts con temperatura 1.0, lo que permite evaluar pass@k y diversidad de respuestas.

## Casos de uso

- Investigación en RL para razonamiento: permite comparar GRPO con otras variantes de RL (como PPO o DPO) en un entorno controlado y reproducible.
- Evaluación de protocolos de prompt: sirve para medir el impacto del formato "boxfix" (pasos numerados + `\boxed{}`) frente a otros formatos de respuesta.
- Benchmarking de checkpoints de RL: al existir checkpoints hermanos en los pasos 600 y 1200, se puede estudiar la evolución del rendimiento a lo largo del entrenamiento.
- Análisis de diversidad de respuestas: con pass@6 y temperatura alta, se puede investigar cómo la política explora diferentes razonamientos y respuestas.
- Prototipado de sistemas de verificación de respuestas: el formato `\boxed{}` permite construir pipelines de extracción automática y validación de respuestas en tareas de opción múltiple.
- Educación y divulgación: se puede usar como ejemplo de fine-tuning con GRPO en un modelo pequeño, para demostrar técnicas de RL en entornos académicos.
- Comparación de estrategias de decoding: el modelo es sensible a la temperatura y al uso de chat template, lo que lo hace útil para estudiar el impacto de estas decisiones en el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos de validación proporcionados por el autor son los siguientes:

| Métrica | Valor |
|---|---|
| pass@1 | 0.7591 |
| pass@6 | 0.9766 |
| step | 500 |

La validación se realizó sobre 256 prompts held-out, con K=6 rollouts, temperatura 1.0 y seed 42. La extracción de respuesta se hizo con el contenido del último `\boxed{}` o, en su ausencia, el último token A-E. Las respuestas sin respuesta extraíble se puntuaron como incorrectas.

## Requisitos de hardware

No se proporcionan requisitos de hardware oficiales en la información disponible. A partir del tamaño de los pesos (1.777.088.000 parámetros) y del formato safetensors, se puede estimar lo siguiente:

- VRAM para inferencia en bfloat16: aproximadamente 3,5-4 GB para los pesos, más overhead de activaciones y KV-cache. Una GPU con 6 GB de VRAM sería suficiente para secuencias cortas (como las de ScienceQA).
- VRAM para inferencia con cuantización int8 o GGUF: aproximadamente 2-3 GB, lo que permitiría ejecutar el modelo en GPUs de consumo como RTX 3060 o inferiores.
- GPUs recomendadas: RTX 4090, A100, H100 o cualquier GPU de al menos 6 GB de VRAM. El modelo cabe en GPUs de consumo.
- Opciones de despliegue: vLLM (usado en el ejemplo de inferencia del autor), llama.cpp, Ollama, TGI. El autor proporciona un ejemplo de código con vLLM usando `LLM` y `SamplingParams` con `dtype="bfloat16"` y `max_model_len=1536`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. Los únicos modelos comparables son los checkpoints hermanos del mismo autor en HuggingFace, pero no se proporcionan sus métricas de validación en la información disponible:

| Modelo | Parámetros | Contexto | pass@1 | pass@6 | Licencia |
|---|---|---|---|---|---|
| sandeep123/sqabf-grpo-vanilla-step500 | 1.777.088.000 | No disponible | 0.7591 | 0.9766 | Apache-2.0 |
| sandeep123/sqa-grpo-vanilla-step600 | No disponible | No disponible | No disponible | No disponible | Apache-2.0 |
| sandeep123/sqa-grpo-vanilla-step1200 | No disponible | No disponible | No disponible | No disponible | Apache-2.0 |

Nota: los nombres de los checkpoints hermanos difieren ligeramente (sqa vs sqabf), pero pertenecen a la misma familia de baselines GRPO sobre ScienceQA.

## Limitaciones y advertencias

- No aplicar chat template: el modelo fue entrenado con texto plano. Aplicar el chat template de Qwen2.5-Math en inferencia causa un mismatch que puede reducir el pass@1 en aproximadamente 19 puntos en tareas relacionadas.
- Solo evaluado en ScienceQA: no hay datos de rendimiento en otros benchmarks, por lo que su generalización es desconocida.
- Formato de respuesta rígido: el modelo está fuertemente condicionado a generar `\boxed{X}` al final; si se usa en otros contextos, puede producir respuestas mal formateadas o no extraíbles.
- Riesgo de alucinación: como modelo de 1.5B, puede generar razonamientos plausibles pero incorrectos, especialmente fuera de su dominio de entrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero es un checkpoint de investigación y no un producto listo para producción.
- No soporta tool calling, visión ni audio.
- Sin datos de idiomas soportados: se desconoce el rendimiento fuera de inglés (ScienceQA está en inglés).
- El checkpoint se seleccionó por mejor pass@6, no por mejor pass@1; si se busca máxima exactitud individual, puede ser preferible un checkpoint de pasos posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeep123/sqabf-grpo-vanilla-step500
- Checkpoint hermano step600: https://huggingface.co/sandeep123/sqa-grpo-vanilla-step600
- Checkpoint hermano step1200: https://huggingface.co/sandeep123/sqa-grpo-vanilla-step1200
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B

No se han encontrado papers, blogs o demos adicionales en la búsqueda web.
