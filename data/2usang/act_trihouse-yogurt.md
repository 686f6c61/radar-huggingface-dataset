# 2usang/act_trihouse-yogurt

## Resumen

El modelo `2usang/act_trihouse-yogurt` es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. ACT, descrito en el paper arXiv:2304.13705, predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y precisión en tareas de manipulación robótica. El modelo ha sido desarrollado por el usuario 2usang y está especializado en la tarea "trihouse-yogurt", probablemente relacionada con la manipulación de objetos en un entorno doméstico simulado o real.

Con 51,67 millones de parámetros, es un modelo compacto diseñado para control de robots, no para procesamiento de lenguaje. Su relevancia radica en que demuestra cómo se pueden entrenar políticas robóticas eficientes con datasets reducidos y desplegarlas en hardware asequible. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control motor, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que utiliza un transformer encoder-decoder para predecir un chunk de acciones (por ejemplo, 10 pasos) a partir de una observación actual. En la implementación de LeRobot, el modelo se entrena con datos teleoperados, minimizando la pérdida de regresión sobre las acciones y utilizando una pérdida auxiliar de reconstrucción de la observación. El dataset utilizado es `2usang/trihouse-yogurt`, aunque no se han publicado detalles sobre el número de episodios, la composición de las observaciones (imágenes, estados del robot) ni el proceso de entrenamiento (número de épocas, hiperparámetros). No se menciona el uso de RLHF ni DPO; es un entrenamiento supervisado clásico.

## Capacidades

- Control de robots manipuladores: genera comandos de articulación para ejecutar tareas de manipulación.
- Aprendizaje por imitación: reproduce comportamientos demostrados por teleoperación.
- Predicción de chunks de acciones: mejora la suavidad y precisión del movimiento frente a políticas que predicen paso a paso.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y evaluación de LeRobot, incluyendo robots SO-100.
- No tiene capacidades de lenguaje, visión, tool calling ni razonamiento simbólico.

## Casos de uso

- Automatización de tareas repetitivas en laboratorio: el modelo puede ejecutar la tarea "trihouse-yogurt" (posiblemente colocar o manipular un yogur en un entorno doméstico) de forma autónoma tras ser entrenado con demostraciones.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre entornos o la robustez ante variaciones.
- Desarrollo de robots de bajo coste: al ser un modelo pequeño, puede desplegarse en GPUs de gama media para control en tiempo real.
- Benchmarking de algoritmos de imitación: permite comparar ACT con otras arquitecturas (diffusion policies, etc.) en la misma tarea.
- Educación en robótica: los estudiantes pueden entrenar y evaluar políticas con LeRobot usando este modelo como ejemplo.
- Prototipado rápido de nuevas tareas: con un dataset pequeño, se puede entrenar una política específica para una tarea nueva en pocas horas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de éxito en la tarea ni comparaciones con otros modelos en el repositorio.

## Requisitos de hardware

- El modelo tiene 51,7 millones de parámetros, lo que en FP32 ocupa aproximadamente 207 MB. En FP16 serían unos 104 MB.
- Para inferencia en tiempo real (típico en robótica), se recomienda una GPU con al menos 4 GB de VRAM, como una NVIDIA GTX 1650 o superior.
- Es posible ejecutarlo en CPU, pero la latencia puede ser demasiado alta para control en bucle cerrado.
- LeRobot soporta despliegue con PyTorch y CUDA. No se menciona compatibilidad con vLLM, llama.cpp u otros motores de inferencia, ya que no es un modelo de lenguaje.
- El throughput depende de la frecuencia de control del robot; para un brazo SO-100 se suele requerir 50-100 Hz, lo cual es factible con una GPU moderna.

## Comparativa con modelos similares

El autor ha publicado otro modelo similar, `2usang/act_trihouse-dumpling`, con los mismos parámetros (51,7 M) y misma arquitectura, entrenado para una tarea distinta. No hay datos de rendimiento comparativo. Otros modelos de robótica basados en ACT existen en el Hub (por ejemplo, los oficiales de LeRobot), pero no se dispone de información suficiente para una comparación cuantitativa. Se recomienda consultar el paper original para comparaciones con métodos anteriores.

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| 2usang/act_trihouse-yogurt | 51,7 M | trihouse-yogurt | Apache 2.0 | Hub |
| 2usang/act_trihouse-dumpling | 51,7 M | trihouse-dumpling | Apache 2.0 | Hub |
| Modelos oficiales de LeRobot (ej. act_so100) | ~50-100 M | diversas | Apache 2.0 | Hub |

## Limitaciones y advertencias

- Es un modelo específico para una tarea concreta; no generaliza a otras tareas sin reentrenamiento.
- No se han documentado sesgos, pero al ser entrenado con datos teleoperados, puede heredar los sesgos del operador humano.
- Riesgo de alucinación no aplica (no genera texto), pero puede producir acciones erróneas si la observación difiere del dominio de entrenamiento.
- La longitud de contexto y el formato de observación no están documentados; es necesario revisar el código de LeRobot para conocer los detalles.
- No hay garantías de rendimiento en entornos no vistos; se recomienda evaluar en el robot real antes de uso en producción.
- La licencia Apache 2.0 permite uso comercial, pero el dataset `2usang/trihouse-yogurt` puede tener sus propias restricciones; consultar su licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2usang/act_trihouse-yogurt
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset utilizado: https://huggingface.co/datasets/2usang/trihouse-yogurt
