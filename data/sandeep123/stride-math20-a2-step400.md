# sandeep123/stride-math20-a2-step400

## Resumen

El modelo `sandeep123/stride-math20-a2-step400` es un fine-tune del modelo base `Qwen/Qwen2.5-Math-1.5B` mediante el método STRIDE (step-level diversity in RL exploration), un enfoque de aprendizaje por refuerzo que introduce diversidad a nivel de pasos durante la exploración. Fue entrenado con el framework verl sobre el dataset MATH (lighteval) durante 20 épocas (~1160 pasos) y seleccionado como el mejor checkpoint de validación según la métrica pass@1. Con 1.777 millones de parámetros, pertenece a la familia de modelos pequeños de razonamiento matemático, y está diseñado para mejorar la capacidad de resolución de problemas matemáticos complejos en comparación con el modelo base.

Este modelo es relevante para la comunidad de investigación en RL aplicada a razonamiento, ya que explora cómo la diversidad a nivel de pasos de razonamiento puede mejorar el rendimiento en tareas matemáticas. Aunque no está pensado para producción directa, sirve como referencia para evaluar técnicas de entrenamiento con RL y para comparar con otros fine-tunes del mismo modelo base. La licencia Apache 2.0 permite su uso comercial y académico sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-Math-1.5B (transformer decoder-only) |
| Parametros totales | 1.777.088.000 (1, 78 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, probablemente 32.768 tokens, pero no se confirma) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en safetensors de precisión completa) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5-Math-1.5B soporta principalmente inglés y chino, pero no se especifica para este fine-tune) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-Math-1.5B, con 1. 78 mil millones de parámetros y una longitud de contexto de 32.768 tokens según la configuración del modelo base. El entrenamiento se realizó con el framework verl, que implementa el algoritmo GRPO (Group Relative Policy Optimization) para RL. La técnica STRIDE introduce una penalización de diversidad a nivel de pasos en la recompensa, con un parámetro alpha de 2.0, para fomentar que el modelo genere pasos de razonamiento variados y evitar la convergencia prematura a soluciones repetitivas. Se usaron 6 rollouts por prompt (K=6) y un batch de entrenamiento de 128, con una longitud máxima de respuesta de 1024 tokens. El KL se incorporó directamente en la recompensa con un valor de 0.01. El entrenamiento se realizó durante 20 épocas, con validación cada 400 pasos, y este checkpoint corresponde al paso 400, seleccionado como el mejor en validación según pass@1.

## Capacidades

- Resolución de problemas matemáticos de nivel competición (dataset MATH) con razonamiento paso a paso.
- Generación de respuestas con justificaciones y explicaciones detalladas.
- Soporte para razonamiento multi-paso en problemas aritméticos, algebraicos, geométricos y de teoría de números.
- No se documentan capacidades de tool calling, agentes, visión o audio.
- Capacidades multilingües limitadas al inglés y posiblemente chino (según el modelo base), aunque no se confirma en la ficha del modelo.

## Casos de uso

- **Asistencia educativa en matemáticas**: el modelo puede generar soluciones paso a paso para ejercicios de nivel preuniversitario, ayudando a estudiantes a comprender el proceso de resolución. Su tamaño compacto permite integrarlo en aplicaciones móviles o plataformas web con recursos limitados.
- **Generación de problemas matemáticos**: al ser entrenado con MATH, puede usarse para generar variantes de problemas con razonamientos detallados, útil para crear datasets de entrenamiento o bancos de preguntas.
- **Evaluación de técnicas de RL**: como checkpoint de referencia, es útil para investigadores que quieran comparar el efecto de la diversidad en la exploración (STRIDE) frente a otros métodos como PPO o DPO en tareas matemáticas.
- **Fine-tuning adicional**: puede servir como punto de partida para especialización en dominios matemáticos concretos, por ejemplo, álgebra o cálculo, mediante un fine-tuning supervisado posterior.
- **Prototipado de agentes de razonamiento**: aunque no soporta tool calling directamente, puede integrarse en un pipeline más grande con herramientas externas para resolver problemas matemáticos que requieren cálculo simbólico o acceso a datos.
- **Investigación en alucinación y razonamiento**: al ser un modelo pequeño con entrenamiento RL, puede usarse para estudiar los límites del razonamiento matemático en modelos de tamaño reducido y los efectos de la diversidad en la generación.

## Benchmarks y rendimiento

Según la model card, en un conjunto de validación de 128 prompts con 6 rollouts (768 respuestas), el modelo alcanza los siguientes resultados:

| Métrica | Valor |
|---|---|
| pass@1 | 0.7253 |
| pass@k (k=6) | 0.9375 |
| duplicate-opening rate | 0.031 |
| non-ASCII fraction | 0.01% |

El modelo base `Qwen/Qwen2.5-Math-1.5B` obtuvo antes del entrenamiento un pass@1 de 0.4805 y un pass@k (k=6) de 0.8672 en el mismo conjunto. La mejora es notable (+0.24 en pass@1). Sin embargo, la validación es pequeña (128 prompts) y el error estándar estimado es de +/-4 puntos porcentuales, por lo que los resultados son orientativos. No se dispone de comparación con otros modelos de la misma categoría en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1.78 B de parámetros. En precisión FP16, el peso ocupa aproximadamente 3.6 GB, por lo que se requiere al menos 4 GB de VRAM para inferencia con batch pequeño. En cuantización int8 (si se convierte a GGUF o similar), se podría reducir a ~1.8 GB, pero no hay cuantizaciones oficiales.
- GPU recomendadas: una tarjeta de gama media como la NVIDIA RTX 3060 (12 GB) o superior es suficiente. En CPU, se puede ejecutar con 8 GB de RAM usando llama.cpp, aunque con menor velocidad.
- Despliegue: se puede servir con frameworks como vLLM, TGI, o llama.cpp. También es compatible con Ollama si se convierte a formato GGUF.
- Latencia y throughput: no se han publicado mediciones oficiales. En una GPU moderna, la inferencia de un modelo de 1.5 B es rápida, del orden de 50-100 tokens por segundo en FP16 con batch 1, pero depende de la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento en MATH (pass@1) | Disponibilidad |
|---|---|---|---|---|---|
| stride-math20-a2-step400 | 1.78 B | no disponible | Apache 2.0 | 0.7253 (validación propia) | HuggingFace |
| Qwen/Qwen2.5-Math-1.5B | 1.78 B | 32.768 | Apache 2.0 | 0.4805 (validación del autor) | HuggingFace |
| Qwen/Qwen2.5-Math-1.5B-Instruct | 1.78 B | 32.768 | Apache 2.0 | no disponible | HuggingFace |

No se dispone de datos para comparar con otros modelos de la misma categoría (por ejemplo, DeepSeek-Math-1.5B o Mathstral). La comparación con el modelo base muestra una mejora sustancial, pero no hay benchmarks públicos estandarizados.

## Limitaciones y advertencias

- El modelo está específicamente entrenado para problemas matemáticos del dataset MATH; su rendimiento en otras tareas (escritura, código, razonamiento general) no ha sido evaluado y probablemente sea inferior al de modelos generalistas.
- El conjunto de validación es pequeño (128 prompts) y el error estándar es alto; los resultados deben interpretarse con cautela.
- La técnica STRIDE introduce una penalización de diversidad que puede reducir la coherencia de las respuestas en algunos casos, aunque la métrica duplicate-opening es baja (0.031).
- No se han publicado detalles sobre sesgos, alucinaciones o riesgos de seguridad. Como modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en problemas no vistos.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda validar el comportamiento en producción antes de desplegarlo.
- No hay información sobre el proceso de filtrado de datos ni sobre la composición exacta del dataset MATH utilizado, lo que limita la reproducibilidad.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/sandeep123/stride-math20-a2-step400)
- [Modelo base Qwen/Qwen2.5-Math-1.5B](https://huggingface.co/Qwen/Qwen2.5-Math-1.5B)
- [Framework verl (GitHub)](https://github.com/volcengine/verl) (no confirmado en la información proporcionada, pero se menciona como herramienta de entrenamiento)
- [Dataset MATH (lighteval)](https://huggingface.co/datasets/lighteval/MATH) (referencia común, no confirmado en la ficha)
