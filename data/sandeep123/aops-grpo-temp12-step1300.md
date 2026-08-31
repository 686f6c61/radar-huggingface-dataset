# sandeep123/aops-grpo-temp12-step1300

## Resumen

El modelo `sandeep123/aops-grpo-temp12-step1300` es un fine-tune del modelo base Qwen/Qwen2.5-Math-1.5B, entrenado mediante aprendizaje por refuerzo con el algoritmo GRPO (Group Relative Policy Optimization) sobre el conjunto de datos ScienceQA. El autor, sandeep123 (Kumar), lo publica como un "baseline" dentro de una serie de experimentos que exploran diferentes configuraciones de temperatura de muestreo durante el entrenamiento; en este caso, se utilizó una temperatura de rollout de 1.2, aunque la validación se realiza siempre a temperatura 1.0 para mantener la comparabilidad entre brazos del experimento.

El modelo está diseñado para resolver preguntas de opción múltiple de ciencia (ScienceQA) y extrae la respuesta del contenido final de una caja `\boxed{}`. Es un modelo de razonamiento matemático y científico de tamaño reducido (1.777 millones de parámetros), con licencia Apache 2.0 y pesos en formato safetensors. Su relevancia radica en servir como punto de referencia reproducible para investigaciones sobre optimización por políticas y métodos de exploración en modelos de lenguaje de pequeña escala.

La model card advierte explícitamente de que no se debe aplicar el chat template de Qwen2.5-Math en inferencia, ya que el entrenamiento se realizó sobre texto plano (raw prompt text) sin plantilla de chat, y aplicar dicha plantilla introduce una discrepancia de aproximadamente 19 puntos de pass@1 en una tarea relacionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 (1,78 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion del modelo; el modelo base Qwen2.5-Math-1.5B soporta hasta 32.768 tokens segun especificaciones publicas del fabricante |
| Tipos de cuantizacion | No disponible (formato safetensors; se puede cuantizar con herramientas estandar como llama.cpp, GPTQ o AWQ) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5-Math esta entrenado principalmente en ingles y chino, pero no se confirma para este fine-tune) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Math-1.5B, un transformer decoder-only con mecanismo de atención por ventanas deslizantes y normalización RMSNorm. Sobre esta base se aplica GRPO, un algoritmo de optimización de políticas que agrupa varias muestras (rollouts) por prompt y calcula la ventaja relativa dentro del grupo, en lugar de usar una función de valor crítica como en PPO. El entrenamiento se realizó sobre el dataset `scienceqa_boxfix` de ScienceQA, con 128 prompts por lote y K=6 rollouts por prompt, durante 25 épocas (1250 pasos), aunque el checkpoint publicado corresponde al paso 1300 (seleccionado por mejor pass@1 en validación).

Los hiperparámetros principales incluyen una tasa de aprendizaje constante de 1e-6, un coeficiente KL de 0.01 (aplicado como recompensa interna), una recompensa de formato de 0.03 constante, y límites de clip de 0.2/0.2. La temperatura de rollout fue 1.2, con `entropy_coeff=0.0`. La validación se realizó sobre 256 prompts held-out con temperatura 1.0 y semilla 42. Un aspecto técnico destacable es que el modelo se entrenó sin chat template (texto plano), lo que obliga a usar la misma estrategia en inferencia para evitar una caída de rendimiento de ~19 puntos de pass@1.

## Capacidades

- Razonamiento matemático y científico: resuelve preguntas de opción múltiple de ciencia (ScienceQA) y produce respuestas en formato `\boxed{...}`.
- Extracción de respuestas: la respuesta se define como el contenido de la última caja `\boxed{}`; si no existe, se toma el último token independiente A-E.
- Generación de texto autoregresivo: hereda la capacidad de generación del modelo base Qwen2.5-Math.
- No soporta tool calling ni function calling: no se ha entrenado ni documentado dicha capacidad.
- No soporta agentes ni razonamiento multi-paso explícito más allá de la cadena de pensamiento generada en el texto.
- Capacidades multilingües limitadas: no hay información específica para este fine-tune; el modelo base es principalmente bilingüe inglés-chino.
- No tiene capacidades de visión ni audio; es exclusivamente texto.

## Casos de uso

- Evaluación de razonamiento científico en educación: se puede usar para generar respuestas a preguntas de opción múltiple de ciencia, útil en plataformas de tutoría inteligente o evaluación automática de exámenes.
- Investigación en RLHF y GRPO: sirve como baseline reproducible para estudiar el efecto de la temperatura de muestreo en el entrenamiento por refuerzo, tal como lo concibe el autor.
- Benchmarking de modelos pequeños de razonamiento: comparar el rendimiento pass@1 y pass@6 de este modelo con otros fine-tunes de Qwen2.5-Math-1.5B o modelos de tamaño similar.
- Generación de explicaciones paso a paso: aunque no está optimizado para ello, puede producir cadenas de razonamiento que acompañan a la respuesta, útiles para análisis de interpretabilidad.
- Experimentos de decodificación: al ser un modelo pequeño, es adecuado para probar estrategias de muestreo, temperaturas, top-p o top-k en entornos de investigación.
- Prototipado de sistemas de respuesta a preguntas científicas: se puede integrar en un pipeline de QA sin necesidad de chat template, usando el ejemplo de vLLM proporcionado en la model card.

## Benchmarks y rendimiento

La model card reporta métricas de validación en un conjunto de 256 prompts held-out de ScienceQA, con K=6 rollouts, temperatura 1.0 y semilla 42. No se proporcionan resultados comparativos con otros modelos.

| Metrica | Valor |
|---|---|
| pass@1 | 0.2396 |
| pass@6 | 0.4023 |
| Paso de entrenamiento | 1300 |

Nota: estas métricas corresponden a la precisión de respuesta muestreada (sampled answer accuracy) sobre opciones A-E, donde las respuestas sin caja `\boxed{}` se consideran incorrectas y todos los rollouts permanecen en el denominador.

No se han publicado resultados de benchmarks estándar como MMLU, GSM8K o HumanEval en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1,78 B parámetros. En bfloat16 ocupa aproximadamente 3,6 GB de memoria solo para pesos. Con cuantización a 4 bits (GPTQ o AWQ) se reduce a ~1 GB, y a 8 bits a ~2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en bfloat16 (p. ej., RTX 3050, RTX 4060, T4). Para cuantización 4 bits basta con 2 GB (p. ej., GPU integradas o Jetson).
- Cabe en GPU de consumo: sí, incluso en tarjetas de gama baja.
- Opciones de despliegue: vLLM (como se muestra en el ejemplo de la model card), llama.cpp, Ollama, TGI o cualquier framework compatible con safetensors y arquitectura Qwen2.
- Latencia y throughput: no hay datos publicados. Como referencia, un modelo de 1,5 B en una GPU moderna (RTX 4090) puede generar decenas de tokens por segundo con vLLM, pero es una estimación orientativa.

## Comparativa con modelos similares

No se dispone de comparaciones directas publicadas con otros modelos en la información proporcionada. Sin embargo, se puede establecer una comparación conceptual con el modelo base y con otros fine-tunes de la misma serie:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-Math-1.5B (base) | 1,78 B | 32K | Apache-2.0 | Modelo base sin fine-tune RL; rendimiento general en matemáticas |
| sandeep123/aops-grpo-temp12-step1300 | 1,78 B | No disponible | Apache-2.0 | Fine-tune GRPO sobre ScienceQA, temperatura 1.2 |
| sandeep123/aops-grpo-entropy-step900 | 1,78 B (presumible) | No disponible | Apache-2.0 | Otro baseline de la misma serie con entropía como variable |

No hay datos de benchmarks comparativos entre estos modelos en la información disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre ScienceQA: no se garantiza rendimiento en otras tareas de razonamiento o dominios fuera de preguntas de ciencia de opción múltiple.
- No aplicar chat template: la model card advierte que usar el chat template de Qwen2.5-Math en inferencia provoca una caída de ~19 puntos de pass@1. Debe usarse texto plano.
- Extracción de respuestas estricta: si el modelo no genera una caja `\boxed{}` o un token A-E al final, la respuesta se considera incorrecta, lo que puede penalizar respuestas válidas en otros formatos.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar razonamientos plausibles pero incorrectos, especialmente fuera del dominio de entrenamiento.
- Sesgos: no se han evaluado sesgos específicos; el modelo puede reflejar los sesgos del dataset ScienceQA y del modelo base.
- Limitaciones de idioma: no hay información sobre soporte multilingüe; es probable que el rendimiento en español sea bajo dado el enfoque en inglés del dataset.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero se recomienda revisar los términos del modelo base Qwen2.5-Math (también Apache-2.0).
- Para producción: el modelo es un baseline experimental; no se recomienda su uso directo en aplicaciones críticas sin una evaluación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sandeep123/aops-grpo-temp12-step1300
- Perfil del autor en Hugging Face: https://huggingface.co/sandeep123
- Modelo base Qwen2.5-Math-1.5B: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
- Otro baseline de la misma serie: https://huggingface.co/sandeep123/aops-grpo-entropy-step900
