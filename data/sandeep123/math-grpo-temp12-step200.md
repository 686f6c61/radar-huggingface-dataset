# sandeep123/math-grpo-temp12-step200

## Resumen

El modelo `sandeep123/math-grpo-temp12-step200` es un ajuste fino del modelo base `Qwen/Qwen2.5-Math-1.5B` mediante aprendizaje por refuerzo con el algoritmo GRPO (Group Relative Policy Optimization), desarrollado por el usuario sandeep123 (Kumar). Forma parte de una serie de experimentos que exploran el efecto de la temperatura de muestreo durante el entrenamiento sobre el rendimiento en razonamiento científico. Este checkpoint concreto se entrenó con una temperatura de rollout de 1.2 y se seleccionó como el mejor en validación pass@1 dentro de su rama experimental.

El modelo está especializado en responder preguntas de opción múltiple del conjunto de datos ScienceQA, con un enfoque en razonamiento matemático y científico. Con 1.777 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo. Su relevancia radica en servir como línea base reproducible para investigaciones sobre métodos de optimización por política proximal (RL) aplicados a modelos de lenguaje, y en demostrar la importancia de la coherencia entre el formato de entrenamiento y el de inferencia.

Una característica crítica documentada por el autor es que el modelo se entrenó con texto sin plantilla de chat, por lo que aplicar la plantilla de chat de Qwen2.5-Math en inferencia provoca una degradación de aproximadamente 19 puntos en pass@1. Esta advertencia es esencial para cualquier uso práctico del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (max prompt 512, max response 1024 en entrenamiento) |
| Tipos de cuantizacion | No disponible (repo contiene safetensors en bfloat16) |
| Idiomas soportados | No disponible (dataset ScienceQA en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen2.5-Math-1.5B, un transformer decoder-only con atención causal estándar. No se han realizado modificaciones arquitectónicas; el ajuste se centra en el entrenamiento con GRPO, un algoritmo de optimización de política que utiliza un grupo de rollouts para estimar ventajas relativas. El entrenamiento se realizó sobre el dataset ScienceQA (versión `scienceqa_boxfix`), con 25 épocas y 1250 pasos, un batch de 128 prompts con K=6 rollouts por prompt, una tasa de aprendizaje constante de 1e-6, un coeficiente KL de 0.01 y una recompensa de formato de 0.03 constante. La temperatura de muestreo durante el entrenamiento fue 1.2, mientras que la validación se realizó a temperatura 1.0 para mantener comparabilidad entre ramas experimentales.

El proceso de entrenamiento utilizó el framework verl y el dataset RLHFDataset con `apply_chat_template=False`, lo que significa que el modelo se entrenó con texto plano sin plantilla de chat. Esta decisión de diseño es la causa de la advertencia sobre no aplicar plantilla de chat en inferencia. No se mencionan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Razonamiento matemático y científico: el modelo está entrenado para resolver problemas de opción múltiple de ScienceQA, que abarcan física, química, biología y ciencias de la tierra.
- Generación de respuestas con justificación: produce respuestas que incluyen un razonamiento paso a paso y una respuesta final en formato `\boxed{}`.
- Extracción de respuestas: el autor define que la respuesta se extrae del contenido del último `\boxed{}` o, en su ausencia, del último token A-E independiente.
- No soporta tool calling, ni funciones de agente, ni capacidades multimodales (visión, audio). Es un modelo puramente textual.
- Multilingüismo: no se ha especificado, pero el dataset de entrenamiento es en inglés, por lo que se espera un rendimiento limitado en otros idiomas.

## Casos de uso

- Evaluación de métodos de RL en modelos de lenguaje: sirve como línea base reproducible para investigaciones que comparan temperaturas de muestreo en GRPO, permitiendo a otros investigadores replicar experimentos y validar hipótesis sobre exploración.
- Generación de respuestas razonadas en educación científica: puede integrarse en sistemas de tutoría automática que presenten problemas de ciencias y generen explicaciones paso a paso, aunque requiere adaptación al formato de texto plano.
- Benchmarking de técnicas de extracción de respuestas: su formato de salida con `\boxed{}` facilita el desarrollo y prueba de parsers para extracción de respuestas en tareas de opción múltiple.
- Estudio de la sensibilidad a la plantilla de chat: el modelo documenta explícitamente una degradación de 19 puntos si se aplica la plantilla de chat, lo que lo convierte en un caso de estudio para investigar la coherencia entre entrenamiento e inferencia.
- Prototipado de sistemas de razonamiento con modelos pequeños: al tener solo 1.5B parámetros, es adecuado para entornos con recursos limitados donde se necesite un modelo de razonamiento básico sin grandes requisitos de hardware.
- Investigación sobre selección de checkpoints: el autor publica checkpoints seleccionados por pass@1 y pass@6 por separado, lo que permite estudiar la relación entre la métrica de selección y el rendimiento final en diferentes condiciones de decodificación.

## Benchmarks y rendimiento

El autor proporciona métricas de validación en un conjunto de 256 prompts retenidos de ScienceQA, con K=6 rollouts y temperatura 1.0, semilla 42. Los resultados son:

| Metrica | Valor |
|---|---|
| pass@1 | 0.7721 |
| pass@6 | 0.9414 |
| step | 200 |

No se han publicado comparaciones con otros modelos en la información disponible. La métrica pass@1 se define como la precisión de respuesta muestreada (sampled answer accuracy), donde una respuesta se considera correcta si el contenido del último `\boxed{}` coincide con la opción correcta, o si el último token A-E es correcto en ausencia de `\boxed{}`. Las respuestas sin respuesta extraíble se puntúan como incorrectas.

## Requisitos de hardware

No se dispone de datos oficiales sobre requisitos de hardware. A partir del tamaño del modelo (1.777M parámetros), se pueden hacer estimaciones orientativas:

- VRAM estimada para inferencia en bfloat16: aproximadamente 3.6 GB (1.777M × 2 bytes), más overhead de activaciones y KV cache. Con una ventana de contexto de 1536 tokens (como se usa en el ejemplo de vLLM), se puede estimar un consumo total de 4-5 GB.
- Con cuantización de 4 bits (si se generara), la VRAM se reduciría a aproximadamente 1 GB, permitiendo ejecución en GPUs con 4 GB o menos.
- GPUs recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, GTX 1660 Ti) puede ejecutar el modelo en bfloat16. Para cuantización, GPUs con 4 GB (GTX 1650, RTX 3050) serían suficientes.
- Opciones de despliegue: el autor muestra un ejemplo con vLLM, pero también es compatible con llama.cpp, Ollama y TGI mediante conversión a GGUF. El formato safetensors permite su uso directo con transformers.
- Latencia y throughput: no se proporcionan datos. En una GPU consumer moderna (RTX 3060), se espera una generación de 1024 tokens en unos pocos segundos, pero esto es una estimación no verificada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (fine-tunings de Qwen2.5-Math-1.5B con GRPO). La comparación más directa sería con el modelo base `Qwen/Qwen2.5-Math-1.5B`, que no ha sido entrenado con RL y probablemente tenga un rendimiento inferior en ScienceQA, pero no se han publicado métricas comparativas. Otros modelos de razonamiento de tamaño similar (por ejemplo, Llama-3.2-1B o Gemma-2-2B) no se mencionan en la documentación. Por tanto, la comparativa se limita a indicar que el modelo es un ajuste fino del base y que su rendimiento en ScienceQA es de 0.7721 pass@1, sin datos de referencia.

## Limitaciones y advertencias

- No aplicar plantilla de chat: el modelo se entrenó con texto plano. Aplicar la plantilla de chat de Qwen2.5-Math en inferencia reduce el pass@1 en aproximadamente 19 puntos, según el autor. Es imprescindible usar el modelo con texto sin formato.
- Selección de checkpoint: el checkpoint publicado (step 200) fue seleccionado por su mejor pass@6, no por pass@1. El mejor pass@1 se encuentra en steps 1000-1200. Esto puede afectar al rendimiento esperado en escenarios de una sola respuesta.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar razonamientos plausibles pero incorrectos. La extracción de respuestas se basa en `\boxed{}`, pero si el modelo no produce este formato, la respuesta se considera incorrecta.
- Limitaciones de idioma: el entrenamiento se realizó sobre ScienceQA en inglés, por lo que el rendimiento en otros idiomas es probablemente deficiente.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero se debe respetar la atribución y no utilizar marcas registradas.
- Dependencia del framework: el entrenamiento se realizó con verl, y la inferencia se muestra con vLLM. Aunque el modelo es estándar, se recomienda verificar la compatibilidad con otros frameworks.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sandeep123/math-grpo-temp12-step200
- Perfil del autor: https://huggingface.co/sandeep123
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
