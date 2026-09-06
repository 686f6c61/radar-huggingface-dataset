# sandeep123/mathbf-dqo-a1-step600

## Resumen

Este modelo es un checkpoint de aprendizaje por refuerzo (RL) sobre la base Qwen/Qwen2.5-Math-1.5B, desarrollado por el usuario sandeep123. Se trata de un baseline para el estudio de objetivos de diversidad en RL, concretamente el método DQO (Diversity-enhancing Quality Objective) con alpha=1.0, entrenado con GRPO sobre el dataset ScienceQA. El objetivo es mejorar la capacidad de razonamiento paso a paso en preguntas de ciencias de opción múltiple, forzando una salida estructurada con pasos numerados y una respuesta final en `\boxed{}`.

La arquitectura es un transformer decoder-only, basado en Qwen2.5-Math-1.5B. El checkpoint tiene 1.777.088.000 parámetros y se publica en formato safetensors con pesos en bfloat16. El repositorio no especifica la longitud de contexto nativa, pero el entrenamiento utiliza 512 tokens de prompt y 1024 tokens de respuesta. La relevancia del modelo radica en que permite investigar cómo objetivos de diversidad como DQO afectan al rendimiento pass@1 y pass@6, y en que el autor publica explícitamente el checkpoint seleccionado por mejor pass@6, no por mejor pass@1, para evitar sesgos en la evaluación de diversidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen/Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 |
| Longitud de contexto | No disponible (entrenamiento: 512 tokens de prompt + 1024 de respuesta) |
| Tipos de cuantizacion | No publicados (pesos en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning por RL de Qwen2.5-Math-1.5B. Se entrena con GRPO (Group Relative Policy Optimization) usando el dataset ScienceQA, bajo el protocolo boxfix: el prompt exige razonamiento numerado (pasos 1..n) seguido de `\boxed{X}` en una línea propia, sin nada después. La recompensa de formato es 0,03, constante, sin decaimiento. El método DQO se aplica con alpha=1.0, que añade un término de diversidad basado en `alpha*logdet(L+I)` con un estimador leave-one-out; la embedding phi se obtiene de los hidden states de la política de referencia, no de un codificador de frases preentrenado. El entrenamiento se realiza durante 25 epochs o 1250 steps, con batch de 128 prompts, K=6 rollouts, learning rate 1e-6 constante, coeficiente KL de 0,01, seed 42, entropy_coeff=0.0 y clip 0.2/0.2. La temperatura de rollout es 1.0. El README advierte explícitamente que no se debe aplicar el chat template de Qwen2.5 en inferencia, ya que el modelo fue entrenado con texto plano y aplicar el template provoca una caída estimada de unos 19 puntos en pass@1.

## Capacidades

- Generacion de texto y razonamiento: el modelo genera razonamientos paso a paso en texto plano, orientados a preguntas de ciencias de opción múltiple.
- Formato especial: produce salidas con pasos numerados y una respuesta final en `\boxed{}`, siguiendo el protocolo boxfix.
- Optimizado para métricas pass@k: la validación reporta pass@1 y pass@6 con decodificación por muestreo (temperatura 1.0, K=6).
- Soporte de tool calling: no documentado.
- Soporte de agentes: no documentado.
- Capacidades multilingües: no especificadas; el dataset ScienceQA está en inglés, pero el modelo no ha sido evaluado en otros idiomas.
- No se documenta soporte de visión ni audio.

## Casos de uso

- Investigacion en objetivos de diversidad en RL: este checkpoint sirve como baseline de referencia para comparar el efecto de DQO frente a otros objetivos, especialmente en métricas pass@6. Se puede ejecutar con vLLM y el código de ejemplo del README.
- Evaluacion de razonamiento en ciencias: permite generar múltiples rollouts sobre preguntas de ScienceQA y medir la precisión con la extracción pre-registrada de respuestas. Es adecuado porque el modelo fue entrenado específicamente para ese formato.
- Analisis de decodificacion con muestreo: con el ejemplo de inferencia se puede estudiar cómo varía el pass@1 y pass@6 al cambiar la temperatura o el número de rollouts, dado que la validación usa temperatura 1.0 y K=6.
- Comparacion de checkpoints de RL: el autor publica varios checkpoints del mismo brazo (por ejemplo, step600) y de otros brazos; este modelo permite comparar la evolución del rendimiento a lo largo de los steps y entre selecciones por pass@1 o pass@6.
- Pruebas de robustez de formato: se puede comprobar si el modelo mantiene la estructura exigida (pasos numerados y `\boxed{}`) cuando se varía el prompt o el sistema de mensajes. Es adecuado porque el README documenta una penalización de 19 puntos si se aplica el chat template.
- Distillation de modelos de razonamiento: al ser un modelo pequeño (1.777B parámetros), puede utilizarse como fuente de conocimiento para investigar técnicas de destilación o de transferencia de habilidades de razonamiento a modelos aún más pequeños.

## Benchmarks y rendimiento

El README reporta métricas de validación internas, no benchmarks estándar. Estas métricas se obtuvieron con 256 prompts held-out, K=6, temperatura 1.0 y seed 42.

| Metrica | Valor |
|---|---|
| pass@1 (validacion) | 0.7845 |
| pass@6 (validacion) | 0.9648 |
| step | 600 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 3,55 GB (1.777.088.000 parámetros × 2 bytes). Con overhead de runtime y KV cache, se recomienda un mínimo de 6 GB de VRAM.
- GPU recomendadas: cualquier GPU con 8 GB o más es suficiente. Ejemplos válidos: RTX 3060 12GB, RTX 4090, A100.
- El README muestra un ejemplo de despliegue con vLLM, usando `dtype="bfloat16"` y `max_model_len=1536`.
- No se mencionan otras plataformas como llama.cpp, Ollama o TGI en la documentación disponible.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Base | Dataset | Metrica validacion | Licencia |
|---|---|---|---|---|
| sandeep123/mathbf-dqo-a1-step600 | Qwen2.5-Math-1.5B | ScienceQA | pass@6=0.9648 | Apache-2.0 |
| sandeep123/math-dqo-a1-step700 | Qwen2.5-Math-1.5B | MATH | no disponible | Apache-2.0 |
| Qwen2.5-Math-1.5B (base) | - | - | no disponible | Apache-2.0 |

No se dispone de métricas comparables para el modelo base ni para el checkpoint hermano en la información proporcionada.

## Limitaciones y advertencias

- No aplicar chat template: el modelo fue entrenado con texto plano. Aplicar el template de chat de Qwen2.5-Math en inferencia crea un desajuste entre entrenamiento e inferencia que se estima en una pérdida de unos 19 puntos de pass@1.
- Dominio limitado: el modelo está entrenado únicamente con ScienceQA. Su rendimiento en otras tareas de razonamiento, matemáticas abiertas o dominios generales no está validado.
- Riesgo de alucinacion: fuera de la distribución de entrenamiento, el modelo puede producir razonamientos plausibles pero incorrectos, especialmente si el prompt no sigue el formato boxfix.
- Sensibilidad al formato de salida: el modelo depende de que la respuesta final aparezca en `\boxed{}`. Si no se extrae una respuesta, la puntuación es incorrecta, lo que penaliza cualquier salida mal formateada.
- Seleccion de checkpoint por pass@6: este checkpoint fue elegido por su mejor pass@6, no por su pass@1. Esto es intencionado para estudios de diversidad, pero puede ser inadecuado si se busca maximizar la precisión individual.
- Sesgos: no se documentan sesgos específicos. Sin embargo, al estar entrenado con un dataset de opción múltiple en inglés, puede heredar sesgos de ese corpus.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero exige mantener el aviso de licencia y la atribución correspondiente.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/sandeep123/mathbf-dqo-a1-step600
- Modelo hermano (MATH, DQO alpha=1.0): https://huggingface.co/sandeep123/math-dqo-a1-step700
