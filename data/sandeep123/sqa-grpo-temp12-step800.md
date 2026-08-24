# sandeep123/sqa-grpo-temp12-step800

## Resumen

El modelo `sandeep123/sqa-grpo-temp12-step800` es un fine-tuning de `Qwen/Qwen2.5-Math-1.5B` entrenado con el algoritmo de optimización por refuerzo GRPO (Group Relative Policy Optimization) sobre el conjunto de datos ScienceQA. Ha sido desarrollado por el usuario sandeep123 como parte de un estudio de baselines que investiga el efecto de la temperatura de rollout en el entrenamiento con RL. Este checkpoint concreto corresponde al brazo con temperatura de muestreo 1.2 y fue seleccionado como el de mejor pass@1 en validación dentro de su grupo.

El modelo está pensado para responder preguntas de opción múltiple de ciencia, extrayendo la respuesta del contenido de un `\boxed{}` final o, en su defecto, del último token A-E. Con 1.777 millones de parámetros, es un modelo compacto que sirve como referencia para comparar estrategias de entrenamiento con RL en tareas de razonamiento. Su relevancia radica en que documenta de forma transparente las condiciones de entrenamiento y validación, lo que permite reproducir y analizar el impacto de la temperatura en la calidad del razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1536 (según ejemplo de inferencia con vLLM; entrenado con 512 de prompt y 1024 de respuesta) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantización específica) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen2.5-Math-1.5B, un transformer decoder-only de 1.500 millones de parámetros. Sobre esta base se aplica un entrenamiento con GRPO, un algoritmo de optimización por refuerzo que agrupa múltiples rollouts por prompt para estimar ventajas relativas. El entrenamiento se realizó sobre el dataset ScienceQA (versión `scienceqa_boxfix`), con 25 épocas (1250 pasos), un batch de 128 prompts con K=6 rollouts cada uno, learning rate constante de 1e-6, coeficiente KL de 0.01 y una recompensa de formato fija de 0.03. La temperatura de rollout fue 1.2, mientras que la validación se hizo a temperatura 1.0 para mantener comparabilidad con otros brazos del estudio.

Un aspecto crítico documentado es que el modelo se entrenó con texto plano, sin aplicar chat template. Aplicar el chat template de Qwen2.5-Math en inferencia provoca una caída de aproximadamente 19 puntos en pass@1, por lo que se recomienda usar el prompt como string crudo. La extracción de respuestas se realiza de forma pre-registrada: se toma el contenido del último `\boxed{}` o, si no existe, el último token A-E; las respuestas sin respuesta extraíble se puntúan como incorrectas.

## Capacidades

- Generación de respuestas de opción múltiple en tareas de ciencia (ScienceQA), con formato de salida en `\boxed{}`.
- Razonamiento matemático y científico básico heredado del modelo base Qwen2.5-Math-1.5B.
- Soporte para inferencia con muestreo múltiple (pass@K) gracias a la configuración de rollouts.
- No soporta tool calling, ni visión, ni audio; es un modelo puramente textual.
- Capacidad multilingüe no documentada; se asume limitada al inglés de los datos de entrenamiento.
- No incluye modo de pensamiento explícito ni generación de explicaciones detalladas más allá de la respuesta final.

## Casos de uso

- Investigación en optimización por refuerzo: sirve como baseline reproducible para estudiar el efecto de la temperatura de rollout en el rendimiento de modelos de razonamiento, permitiendo comparar con otros brazos del mismo estudio.
- Evaluación de algoritmos de RL: al estar entrenado con GRPO y documentar todos los hiperparámetros, es útil para validar implementaciones propias de GRPO o variantes como DPO, PPO, etc.
- Fine-tuning posterior: al ser un modelo pequeño y con licencia Apache-2.0, puede usarse como punto de partida para adaptarlo a dominios específicos de preguntas científicas o educativas.
- Generación de respuestas en exámenes de ciencias: puede integrarse en sistemas de tutoría inteligente para responder preguntas de opción múltiple, siempre que se respete la restricción de no usar chat template.
- Análisis de robustez: al tener métricas de pass@1 y pass@6, permite estudiar la consistencia de las respuestas bajo diferentes temperaturas de muestreo.
- Comparación de checkpoints: el autor publica también el checkpoint óptimo para pass@6, lo que permite analizar la divergencia entre calidad y diversidad en el entrenamiento con RL.

## Benchmarks y rendimiento

Los únicos datos de rendimiento disponibles son los de validación del propio checkpoint, reportados en la model card. No se han publicado comparaciones con otros modelos en la información proporcionada.

| Metrica | Valor |
|---|---|
| pass@1 (ScienceQA, validación) | 0.8438 |
| pass@6 (ScienceQA, validación) | 0.9414 |
| Paso de entrenamiento | 800 |

La validación se realizó sobre 256 prompts held-out, con K=6, temperatura 1.0 y seed 42. No se dispone de resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16 (2 bytes por parámetro), el modelo ocupa aproximadamente 3.6 GB. Con cuantización a 8 bits se reduce a ~1.8 GB, y a 4 bits a ~0.9 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en bfloat16; una RTX 3060, RTX 4060 o superior es suficiente. Para cuantización a 4 bits, incluso GPUs con 2 GB podrían funcionar.
- Compatibilidad con GPUs de consumo: sí, es un modelo pequeño que cabe en la mayoría de GPUs consumer actuales.
- Opciones de despliegue: el ejemplo de la model card usa vLLM con `max_model_len=1536`. Por ser un modelo basado en Qwen2.5, debería ser compatible con llama.cpp, Ollama, TGI y otros frameworks, aunque no está verificado explícitamente.
- Latencia y throughput: no se proporcionan datos. En una GPU moderna, se espera una latencia de decenas de milisegundos por token y un throughput de cientos de tokens por segundo con batch.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es un fine-tuning de Qwen2.5-Math-1.5B, por lo que podría compararse con el modelo base, pero no se reportan sus métricas en ScienceQA. Tampoco se mencionan otros baselines del mismo estudio más allá de la referencia a un checkpoint compañero (`sandeep123/dqo-math-K6a3kl-boxfix-step800`) que pertenece a otro experimento (DQO vs GRPO) y no se proporcionan sus resultados. Por tanto, la comparativa se limita a indicar que no hay datos disponibles.

## Limitaciones y advertencias

- No aplicar chat template: hacerlo reduce el pass@1 en aproximadamente 19 puntos, según la model card. Es imprescindible usar el prompt como texto crudo.
- Modelo pequeño (1.5B): puede tener alucinaciones y errores en razonamiento complejo, especialmente fuera del dominio de ScienceQA.
- Sesgos: al entrenarse solo con datos de ScienceQA, puede presentar sesgos hacia el formato de preguntas de opción múltiple y hacia los temas cubiertos en ese dataset.
- Extracción de respuestas estricta: si no hay un `\boxed{}` o un token A-E final, la respuesta se considera incorrecta, lo que puede penalizar respuestas válidas pero mal formateadas.
- Licencia Apache-2.0: permite uso comercial y modificación, pero no hay garantías de soporte ni de ausencia de riesgos en producción.
- Sin datos de rendimiento en benchmarks generales: no se puede evaluar su capacidad fuera de ScienceQA.
- Fecha de creación futura (2026-08-24): el modelo se publicó con una fecha posterior a la actual, lo que sugiere que puede ser parte de un experimento simulado o con metadatos incorrectos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sandeep123/sqa-grpo-temp12-step800
- Checkpoint compañero (DQO, otro experimento): https://huggingface.co/sandeep123/dqo-math-K6a3kl-boxfix-step800
- Perfil del autor: https://huggingface.co/sandeep123
