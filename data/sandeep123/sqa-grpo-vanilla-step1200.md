# sandeep123/sqa-grpo-vanilla-step1200

## Resumen

`sandeep123/sqa-grpo-vanilla-step1200` es un fine-tune del modelo base `Qwen/Qwen2.5-Math-1.5B` entrenado con GRPO (Group Relative Policy Optimization) sobre el dataset ScienceQA. El autor, sandeep123, lo publica como una línea base ("baseline") dentro de un estudio comparativo de algoritmos de refuerzo, utilizando el framework verl. El modelo está diseñado para razonamiento científico de opción múltiple (preguntas de ciencias con respuestas A-E) y ha sido seleccionado como el checkpoint con mejor pass@1 en validación dentro de su rama experimental.

Con 1.777 millones de parámetros, es un modelo compacto que cabe en GPUs de consumo. Su relevancia radica en que documenta de forma transparente un experimento de RL con GRPO "vanilla" (sin coeficiente de entropía, clip simétrico 0.2, temperatura de rollout 1.0), y advierte explícitamente sobre una trampa de evaluación: no debe aplicarse chat template, ya que el entrenamiento se hizo sobre texto plano y aplicarlo degrada el rendimiento en ~19 puntos de pass@1. Esto lo convierte en un caso de estudio útil para investigadores que trabajan con RL y alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 1536 tokens (max prompt 512 + max response 1024) |
| Tipos de cuantizacion | no disponible (inferencia en bfloat16 en el ejemplo) |
| Idiomas soportados | no disponible (hereda de Qwen2.5-Math, probablemente ingles y chino, pero no confirmado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-Math-1.5B`, un transformer decoder-only con 1.5B parámetros, diseñado originalmente para razonamiento matemático. Sobre esta base, el autor aplica GRPO, un algoritmo de optimización de políticas que elimina la necesidad de un modelo crítico (a diferencia de PPO), usando un grupo de rollouts para estimar ventajas relativas. El entrenamiento se realizó con verl, sobre el dataset ScienceQA (versión `scienceqa_boxfix`), durante 25 épocas (1250 pasos), con batch de 128 prompts y K=6 rollouts por prompt. La tasa de aprendizaje fue constante en 1e-6, con un coeficiente KL de 0.01 dentro de la recompensa, y una recompensa de formato fija de 0.03. El coeficiente de entropía se fijó a 0 (desactivando el valor por defecto de 1e-3), y el clip PPO fue simétrico en 0.2. La temperatura de rollout fue 1.0.

Una característica técnica destacable es que el entrenamiento se hizo sobre texto plano (sin chat template), y la model card advierte explícitamente que aplicar el chat template de Qwen2.5-Math en inferencia produce una discrepancia train/eval de aproximadamente 19 puntos de pass@1. Por tanto, la inferencia debe hacerse con el prompt crudo.

## Capacidades

- Razonamiento científico de opción múltiple: responde preguntas de ciencias (física, química, biología, etc.) con una opción A-E, extrayendo la respuesta de un `\boxed{}` final o del último token A-E.
- Generación de texto con formato de razonamiento: el modelo produce cadenas de razonamiento antes de dar la respuesta final, aunque no se especifica si usa un modo "thinking" explícito.
- No soporta tool calling ni function calling (no se menciona en la documentación).
- No soporta agentes ni multi-step reasoning más allá del contexto de la pregunta.
- Capacidades multilingües: no documentadas; probablemente limitadas al inglés (el dataset ScienceQA es en inglés).
- No tiene capacidades de visión ni audio; es puramente texto.

## Casos de uso

- Evaluación de algoritmos de RL: sirve como baseline reproducible para comparar variantes de GRPO (entropy, clip, temperatura) en tareas de razonamiento. Investigadores pueden descargar el checkpoint y replicar los experimentos con verl.
- Benchmarking de extracción de respuestas: el pipeline de extracción (buscar `\boxed{}` o último token A-E) es útil para desarrollar parsers robustos en tareas de opción múltiple.
- Estudio de discrepancia train/eval: el caso documentado de la penalización por chat template es un ejemplo didáctico para quienes trabajan con RL y formatos de prompt.
- Generación de razonamiento en dominios científicos: aunque el modelo es pequeño, puede generar explicaciones paso a paso para preguntas de ciencias de nivel escolar, útil en prototipos educativos.
- Fine-tuning posterior: al ser un checkpoint intermedio (step 1200), puede servir como punto de partida para continuar entrenamiento con otros datasets o algoritmos.
- Investigación sobre RL con modelos pequeños: dado su tamaño, es adecuado para experimentos en entornos con recursos limitados, permitiendo iterar rápidamente.

## Benchmarks y rendimiento

La model card reporta métricas de validación en ScienceQA (256 prompts held-out, K=6, temperatura 1.0, seed 42):

| Metrica | Valor |
|---|---|
| pass@1 | 0.8542 |
| pass@6 | 0.9336 |
| step | 1200 |

No se proporcionan comparaciones con otros modelos en la información disponible. El autor menciona que el checkpoint con mejor pass@1 se encuentra cerca del paso 1000-1200, mientras que el mejor pass@6 está en el paso 200-500, y ambos se publican por separado.

## Requisitos de hardware

- VRAM estimada: con 1.777 millones de parámetros en bfloat16, los pesos ocupan aproximadamente 3.6 GB. Añadiendo activaciones y KV cache, se estima un consumo total de 4-6 GB para inferencia con contexto de 1536 tokens. No se proporcionan cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo cómodamente. También cabe en GPUs de datacenter como A10 o T4.
- En consumer GPU: sí, es un modelo pequeño que cabe en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: el ejemplo de la model card usa vLLM con `SamplingParams` (n=6, temperature=1.0). También puede ejecutarse con llama.cpp u Ollama si se convierte a GGUF, aunque no se proporcionan archivos GGUF.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una latencia baja (del orden de decenas de milisegundos por token en GPUs modernas), pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. El modelo es un fine-tune de `Qwen/Qwen2.5-Math-1.5B`, por lo que una comparación natural sería contra el modelo base sin entrenar, pero no se reportan sus métricas. Tampoco se mencionan otros modelos de la misma categoría (por ejemplo, fine-tunes de Qwen2.5-Math con otros algoritmos RL). Se puede indicar que el modelo es comparable en tamaño a otros modelos de 1.5B, pero sin datos de rendimiento adicionales no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- No aplicar chat template: la model card es explícita. Usar el chat template de Qwen2.5-Math en inferencia degrada el pass@1 en ~19 puntos. El prompt debe pasarse como texto crudo.
- Tamaño reducido: al ser un modelo de 1.5B, su capacidad de razonamiento complejo es limitada en comparación con modelos más grandes. Puede cometer errores en preguntas que requieran conocimiento profundo o múltiples pasos.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse en ScienceQA (dataset en inglés, probablemente con sesgo occidental), puede reflejar esos sesgos en sus respuestas.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir razonamientos plausibles pero incorrectos. La extracción de respuesta se basa en `\boxed{}`, y si no hay respuesta extraíble se puntúa como incorrecta, lo que mitiga parcialmente el problema en evaluación.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-Math tiene su propia licencia (Qwen Research License para uso comercial, aunque la model card no lo detalla). Se debe verificar la licencia del modelo base.
- Contexto limitado: 1536 tokens en total (512 prompt + 1024 respuesta), insuficiente para tareas que requieran contexto largo.
- Producción: al ser un checkpoint experimental de investigación, no está optimizado para despliegue en producción. No se garantiza estabilidad ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeep123/sqa-grpo-vanilla-step1200
- Documentación de GRPO en verl: https://verl.readthedocs.io/en/latest/algo/grpo.html
- Perfil de GitHub del autor: https://github.com/sandeep123 (no específico del modelo)
- Otro checkpoint del mismo autor (grpo-math20-vanilla-step1160): https://huggingface.co/sandeep123/grpo-math20-vanilla-step1160
