# sandeep123/sqa-grpo-cliphigh-step1100

## Resumen

`sandeep123/sqa-grpo-cliphigh-step1100` es un modelo de investigación entrenado mediante aprendizaje por refuerzo (RL) con el algoritmo GRPO sobre el modelo base `Qwen/Qwen2.5-Math-1.5B`. El autor, sandeep123, lo publica como un baseline del brazo "Clip-Higher" dentro de un estudio sobre los componentes de DAPO (Decoupled Clip and Dynamic Sampling Policy) aplicados a razonamiento científico. El objetivo es evaluar cómo el ajuste del límite superior de clipping en GRPO afecta a la precisión de respuesta en el dataset ScienceQA.

El modelo se presenta como un experimento académico, no como un producto listo para producción. Está entrenado para responder preguntas de ciencia de opción múltiple (ScienceQA) generando razonamiento y una respuesta final en `\boxed{}`. Con 1.777 millones de parámetros, es un modelo compacto que se puede ejecutar en hardware de consumo. El checkpoint seleccionado corresponde al paso 1100, elegido por su mejor pass@1 en validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | 1.777.088.000 (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo base Qwen2.5-Math-1.5B; en inferencia se recomienda max_model_len=1536) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponibles (dataset ScienceQA en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen2.5-Math-1.5B, un decoder-only con atención causal estándar. El entrenamiento utiliza GRPO (Group Relative Policy Optimization), una variante de RL que elimina la necesidad de un modelo de valor crítico al estimar ventajas a partir de un grupo de rollouts. El brazo "Clip-Higher" modifica los límites de clipping de la política: límite inferior 1-0.2 y superior 1+0.28, siguiendo la formulación DAPO. Es importante notar que esto solo implementa uno de los cuatro componentes de DAPO, no el método completo.

El entrenamiento se realizó con verl (el framework de RL de Volcengine) sobre el dataset ScienceQA con una variante llamada `scienceqa_boxfix`, que fuerza la extracción de respuestas en `\boxed{}`. Los hiperparámetros incluyen 25 épocas (1250 pasos), batch de 128 prompts con K=6 rollouts por prompt, learning rate constante de 1e-6, KL in-reward de 0.01, recompensa de formato fija de 0.03, y temperatura de rollout 1.0. La extracción de respuestas sigue una regla pre-registrada: contenido del último `\boxed{}` o, en su ausencia, el último token A-E standalone; respuestas sin extracción se puntúan como incorrectas.

## Capacidades

- Razonamiento en problemas de ciencia de opción múltiple (ScienceQA), generando una cadena de razonamiento y una respuesta final en `\boxed{}`.
- Generación de texto con formato de respuesta estructurada (boxed), útil para evaluación automática.
- No soporta tool calling, function calling ni agentes: es un modelo de razonamiento puro, sin integraciones de herramientas.
- Capacidades multilingües no documentadas; el dataset de entrenamiento es en inglés.
- No incluye modo de pensamiento explícito (thinking mode) más allá del razonamiento generado en texto plano.
- El modelo está diseñado para ser usado sin chat template; aplicar el template de Qwen2.5-Math degrada el rendimiento en aproximadamente 19 puntos de pass@1.

## Casos de uso

- Evaluación de métodos de RL para razonamiento: es un baseline de referencia para comparar intervenciones de clipping en GRPO, útil para investigadores que estudian el impacto de los límites de política.
- Investigación en alineación de modelos matemáticos: permite estudiar cómo el entrenamiento RL sobre un modelo base de matemáticas mejora la precisión en problemas de opción múltiple sin necesidad de un modelo de valor.
- Reproducción de experimentos DAPO: dado que los hiperparámetros están documentados en detalle, se puede replicar el experimento y comparar con otros brazos (como temperatura 1.2 o full DAPO).
- Análisis de extracción de respuestas: el método pre-registrado de extracción de `\boxed{}` es útil para diseñar pipelines de evaluación robustos en tareas de razonamiento.
- Test de infraestructura RL: el modelo es ligero (1.7B) y permite validar pipelines de entrenamiento con GRPO en hardware de consumo antes de escalar a modelos mayores.
- Docencia y aprendizaje: sirve como ejemplo práctico de un fine-tuning con GRPO aplicado a un dataset de razonamiento, útil para cursos de RL aplicada a LLMs.

## Benchmarks y rendimiento

La model card reporta métricas de validación en ScienceQA, con 256 prompts held-out, K=6 rollouts, temperatura 1.0 y semilla 42:

| Metrica | Valor |
|---|---|
| pass@1 | 0.8529 |
| pass@6 | 0.9570 |
| paso del checkpoint | 1100 |

No se han publicado resultados comparativos con otros modelos en la información disponible. La métrica es la "sampled answer accuracy (pass@1)" sobre las opciones de respuesta, no la exactitud de razonamiento completo.

## Requisitos de hardware

- VRAM estimada: los pesos en bfloat16 ocupan aproximadamente 3.5 GB (1.78B × 2 bytes). Con activaciones y KV cache, el uso total ronda los 5-7 GB para inferencia con contexto corto (1536 tokens).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como RTX 3060, RTX 4070, o A100/H100 para despliegue masivo. En consumer GPU (RTX 4090) se puede ejecutar sin cuantización.
- Opciones de despliegue: compatible con vLLM (según el snippet de inferencia de la model card), llama.cpp para CPU/GPU, y Ollama si se convierte a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Como orientación, un modelo de 1.7B en una GPU moderna genera decenas de tokens por segundo, pero no hay datos medidos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| Qwen/Qwen2.5-Math-1.5B (base) | 1.5B | 32K (no confirmado en la info) | Preentrenamiento + SFT matemático | Apache-2.0 |
| sandeep123/sqa-grpo-cliphigh-step1100 | 1.7B | no disponible | GRPO + Clip-Higher sobre ScienceQA | Apache-2.0 |
| Modelos DAPO completos | variable | no disponible | RL completo (4 componentes) | no disponible |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoría (p. ej., fine-tunes de Qwen2.5-Math con RL estándar o full DAPO) en la información proporcionada.

## Limitaciones y advertencias

- No aplicar chat template: el modelo fue entrenado con texto plano sin template. Usar el template de chat de Qwen2.5-Math en inferencia provoca una caída de aproximadamente 19 puntos de pass@1 en tareas similares.
- Sesgo de entrenamiento: entrenado exclusivamente en ScienceQA, por lo que su capacidad de razonamiento general es limitada y puede fallar en dominios fuera de ciencia de opción múltiple.
- Riesgo de alucinación: como cualquier LLM, puede generar razonamientos plausibles pero incorrectos; la extracción de respuesta depende de que el modelo produzca un `\boxed{}` válido.
- No apto para producción: es un checkpoint de investigación con 0 descargas y 0 likes, diseñado como baseline para comparar experimentos, no para uso comercial directo.
- Rendimiento de validación dependiente de la semilla: las métricas (pass@1 0.8529, pass@6 0.9570) se obtuvieron con temperatura 1.0 y semilla 42; otros decodificaciones pueden dar resultados distintos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo es un artefacto experimental sin garantías de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeep123/sqa-grpo-cliphigh-step1100
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
- Blog de referencia sobre GRPO (NoNormalUhr): https://huggingface.co/blog/NormalUhr/grpo
- Gist de entrenamiento GRPO con Llama-1B: https://gist.github.com/willccbb/4676755236bb08cab5f4e54a0475d6fb
- Guía end-to-end de GRPO fine-tuning: https://gist.github.com/loftwah/ada8364828e3a4478743f21aa5cf9e86
