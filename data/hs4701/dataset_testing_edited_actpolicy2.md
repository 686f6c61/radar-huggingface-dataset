# hs4701/dataset_testing_edited_actpolicy2

## Resumen

Este modelo es una política robótica basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario hs4701 y entrenada con la biblioteca LeRobot de Hugging Face. Se trata de un modelo de aprendizaje por imitación que predice secuencias de acciones (chunks) a partir de observaciones visuales y de estado del robot, en lugar de predecir acciones de un solo paso. El modelo está entrenado para la tarea concreta de "rotar un hongo boca abajo" utilizando un robot bimanual (bi_so_follower). Contiene 51.680.908 parámetros y se distribuye en formato safetensors con licencia Apache-2.0.

Este tipo de modelo es relevante en robótica porque permite aprender comportamientos complejos a partir de demostraciones teleoperadas sin necesidad de programar explícitamente el control. El método ACT es conocido por su eficacia en tareas de manipulación, y este modelo concreto sirve como ejemplo de entrenamiento y despliegue con LeRobot en el ecosistema Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers) |
| Parametros totales | 51.680.908 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura ACT, que combina un codificador de imágenes con un transformer que predice un chunk de acciones (en este caso, un vector de 12 dimensiones por cada paso de tiempo). Las entradas son el estado del robot (12 valores) y tres imágenes RGB de 480x640 píxeles (cam0, cam1 y global_cam). La salida es el vector de acción de 12 dimensiones que se envía al robot.

El entrenamiento se realizó con el dataset `hs4701/dataset_testing_edited`, que contiene 32 episodios y 31.961 fotogramas a 30 FPS, todos dedicados a la tarea de rotar el hongo. Se usó el optimizador AdamW con una tasa de aprendizaje de 1e-5, batch size de 32 y 40.000 pasos de entrenamiento. No se aplicó RLHF ni DPO, ya que se trata de un modelo de imitación que aprende de demostraciones teleoperadas.

## Capacidades

- Control de robot bimanual: genera acciones de 12 dimensiones para el robot `bi_so_follower`.
- Percepción visual: procesa tres cámaras RGB simultáneamente (cam0, cam1 y global_cam).
- Aprendizaje por imitación: reproduce la tarea aprendida a partir de datos teleoperados.
- Predicción de acciones en chunks: produce secuencias de acciones en lugar de pasos individuales, lo que mejora la estabilidad del control.
- Ejecución de tarea específica: rotar un hongo boca abajo.
- Integración con LeRobot: puede ejecutarse mediante `lerobot-rollout` y entrenarse con `lerobot-train`.
- No soporta tool calling, razonamiento simbólico, generación de texto ni otras capacidades de modelos de lenguaje.

## Casos de uso

- Manipulación robótica de precisión: el modelo puede utilizarse para tareas de manipulación que requieren control fino, como rotar un objeto pequeño. Al estar entrenado con datos teleoperados, aprende la estrategia de movimiento directamente de las demostraciones.
- Investigación en aprendizaje por imitación: sirve como modelo de referencia para estudiar el comportamiento de ACT con el framework LeRobot, comparando configuraciones de entrenamiento o el efecto del chunking de acciones.
- Prototipado de políticas robóticas: en entornos de laboratorio, se puede desplegar rápidamente en un robot bimanual para validar la tarea aprendida antes de pasar a producción.
- Automatización de tareas repetitivas en robótica industrial: aunque el modelo está especializado, puede adaptarse a tareas similares de manipulación con objetos previo reentrenamiento con nuevos datos.
- Benchmark de políticas teleoperadas: al estar publicado en Hugging Face, permite comparar la eficacia de diferentes políticas de imitación sobre la misma tarea y dataset.
- Demostración de flujo de trabajo con LeRobot: útil para aprender a entrenar y desplegar políticas usando el CLI de LeRobot y el registro de datasets en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se ha proporcionado información oficial).
- GPU recomendadas: no disponible.
- Dado el tamaño del modelo (51,7 M de parámetros), es de esperar que pueda ejecutarse en GPUs de consumo como una RTX 3060 o superior, pero no hay datos confirmados.
- Cabe en consumer GPU: probablemente sí, dado el tamaño, pero no se ha verificado.
- Opciones de despliegue: LeRobot (rollout y entrenamiento), PyTorch. No es un modelo de lenguaje, por lo que no aplica vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no hay datos disponibles.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el modelo puede generar acciones no deseadas si el entorno difiere del contexto de entrenamiento.
- Limitaciones de contexto: el modelo no es un modelo de lenguaje, por lo que no maneja contexto textual.
- Limitaciones de idioma: no aplica.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial y modificación.
- Advertencia importante: está entrenado para una tarea muy específica (rotar un hongo), por lo que su capacidad de generalización a otras tareas es limitada sin reentrenamiento.
- No se han proporcionado resultados de evaluación en robot real, por lo que se desconoce su tasa de éxito.

## Enlaces

- Hugging Face: https://huggingface.co/hs4701/dataset_testing_edited_actpolicy2
- Dataset de entrenamiento: https://huggingface.co/datasets/hs4701/dataset_testing_edited
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
