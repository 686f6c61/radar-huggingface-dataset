# sandeep123/aops-grpo-cliphigh-step300

## Resumen

El modelo `sandeep123/aops-grpo-cliphigh-step300` es un fine-tuning de `Qwen/Qwen2.5-Math-1.5B` (arquitectura Qwen2.5, 1.78B parámetros) entrenado mediante aprendizaje por refuerzo (RL) con el algoritmo GRPO y una modificación de límites de clip asimétricos inspirada en DAPO (Decoupled PPO). El autor, sandeep123, lo publica como un checkpoint de referencia (baseline) dentro de un estudio sobre métodos de RL aplicados al razonamiento científico, concretamente sobre el dataset ScienceQA. El modelo está diseñado para responder preguntas de opción múltiple de ciencia con razonamiento explícito, y se seleccionó como el mejor checkpoint en validación según la métrica pass@6 para este brazo experimental.

La relevancia de este modelo radica en su utilidad como herramienta de investigación para comparar variantes de RL (por ejemplo, distintos límites de clip, coeficientes de entropía, temperaturas de muestreo) y para estudiar el efecto del desajuste entre entrenamiento e inferencia (no usar chat template). Al ser un modelo pequeño (1.78B) y con licencia Apache 2.0, resulta accesible para experimentos en hardware de consumo. No se especifica la longitud de contexto en la información disponible, aunque el modelo base Qwen2.5-Math-1.5B soporta hasta 32K tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5) |
| Parametros totales | 1.777.088.000 (1.78B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (heredado del base, no confirmado) |
| Tipos de cuantizacion | no disponible (pesos en bf16 segun ejemplo de uso) |
| Idiomas soportados | no disponible (probablemente ingles, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Math-1.5B, un transformer decoder con atención causal y capas de normalización RMSNorm. El entrenamiento se realizó con GRPO (Group Relative Policy Optimization) sobre el dataset ScienceQA (versión `scienceqa_boxfix`), usando el framework verl. La modificación clave es el uso de límites de clip asimétricos (inferior 0.8, superior 1.28) en lugar del clip simétrico estándar, técnica propuesta en DAPO. No se aplicó RLHF ni DPO; es un entrenamiento puramente de refuerzo con recompensa basada en formato (0.03 constante) y penalización KL (coeficiente 0.01). Se entrenó durante 25 épocas (1250 pasos) con batch de 128 prompts y 6 rollouts por prompt, learning rate constante de 1e-6 y temperatura de muestreo 1.0. Un detalle crítico es que el modelo se entrenó con texto de prompt sin plantilla de chat (`apply_chat_template=False`), por lo que aplicar la plantilla de chat de Qwen2.5 en inferencia degrada el rendimiento en aproximadamente 19 puntos de pass@1.

## Capacidades

- Razonamiento científico de opción múltiple: dado un prompt con una pregunta de ciencia y opciones A-E, genera una cadena de razonamiento y una respuesta final encerrada en `\boxed{}`.
- Generación de texto con formato de respuesta estructurada (extracción de la última `\boxed{}` o el último token A-E).
- Entrenado específicamente para el dataset ScienceQA, que incluye preguntas de física, química, biología y ciencias de la tierra (aunque el modelo solo procesa texto, no imágenes).
- No soporta tool calling, ni funciones, ni agentes, ni visión, ni audio.
- Capacidades multilingües no confirmadas; el dataset ScienceQA está mayoritariamente en inglés.

## Casos de uso

- Investigación en RL: este checkpoint sirve como referencia para comparar el efecto de distintos hiperparámetros de GRPO (límites de clip, coeficiente de entropía, temperatura) sobre la calidad del razonamiento.
- Evaluación de métodos de selección de checkpoints: el autor publica este modelo (mejor pass@6) junto a otros con mejor pass@1 para estudiar la divergencia entre ambas métricas.
- Benchmark de razonamiento en ciencia: puede usarse como modelo pequeño para medir el rendimiento de pipelines de generación con muestreo múltiple (pass@k) en tareas de opción múltiple.
- Estudio de desajuste train/eval: su sensibilidad al chat template lo convierte en un caso de estudio para entender cómo el preprocesado de prompts afecta al rendimiento de modelos RL.
- Base para fine-tuning adicional: al ser un modelo de 1.78B con licencia permisiva, puede servir como punto de partida para experimentos de RL en otros dominios.
- Pruebas de infraestructura: su pequeño tamaño permite validar configuraciones de vLLM, llama.cpp u otros motores de inferencia en hardware limitado.

## Benchmarks y rendimiento

El autor reporta métricas de validación en 256 prompts held-out, con K=6 muestras, temperatura 1.0 y seed 42:

| Metrica | Valor |
|---|---|
| pass@1 (accuracy de respuesta muestreada) | 0.2292 |
| pass@6 | 0.4258 |

No se proporcionan comparaciones con otros modelos en la información disponible. La extracción de respuestas se basa en el contenido de la última `\boxed{}` o el último token A-E; respuestas sin formato válido se puntúan como incorrectas.

## Requisitos de hardware

- VRAM estimada: en bf16, los pesos ocupan aproximadamente 3.6 GB (1.78B × 2 bytes). Con overhead de activaciones y KV cache, se recomienda al menos 6 GB de VRAM para inferencia con contexto corto. Con cuantización de 4 bits (no disponible oficialmente) podría caber en ~2 GB.
- GPUs recomendadas: cualquier GPU con ≥8 GB de VRAM, como RTX 3060/3070/4060, o GPUs de datacenter como A10, L4. Para entrenamiento se necesitaría más VRAM (no especificado).
- Opciones de despliegue: vLLM (como en el ejemplo del autor), llama.cpp, Ollama (si se convierte a GGUF), Hugging Face Transformers.
- Latencia y throughput: no disponibles; al ser un modelo pequeño, se espera alta velocidad en hardware moderno.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo base Qwen2.5-Math-1.5B es el punto de referencia natural, pero no se reportan sus métricas en ScienceQA. Existe un modelo hermano `sandeep123/sqa-grpo-cliphigh-step300` (mismo entrenamiento pero sobre dataset ScienceQA sin variante `boxfix`), que podría usarse para comparar, aunque tampoco se publican sus métricas aquí.

## Limitaciones y advertencias

- No usar chat template: aplicar la plantilla de chat de Qwen2.5 en inferencia produce una pérdida de ~19 puntos de pass@1. El prompt debe pasarse como texto crudo.
- Sesgos y alucinaciones: al ser un modelo pequeño entrenado en un dominio específico, puede generar razonamientos incorrectos o inventar hechos cuando la pregunta está fuera de su distribución.
- Limitación de dominio: solo está entrenado para preguntas de opción múltiple de ScienceQA; no es adecuado para tareas generales de chat, código o matemáticas abiertas.
- Riesgo de sobreajuste: el checkpoint se seleccionó por pass@6 en validación, lo que puede favorecer respuestas diversas pero no necesariamente la mejor exactitud individual.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está optimizado para producción y carece de garantías.
- No se especifican idiomas soportados; se asume inglés, pero no hay confirmación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sandeep123/aops-grpo-cliphigh-step300
- Modelo relacionado (mismo autor, variante sin boxfix): https://huggingface.co/sandeep123/sqa-grpo-cliphigh-step300
