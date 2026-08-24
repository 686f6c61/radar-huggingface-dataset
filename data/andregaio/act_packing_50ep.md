# AndreGaio/act_packing_50ep

## Resumen

El modelo `act_packing_50ep` es una política de robótica basada en **Action Chunking with Transformers (ACT)**, un método de aprendizaje por imitación que predice secuencias de acciones (action chunks) en lugar de pasos individuales. Ha sido desarrollado por AndreGaio y entrenado con el framework LeRobot de Hugging Face, sobre un conjunto de datos teleoperados de la tarea "cargar gomas de borrar en un contenedor". El modelo utiliza tres cámaras (frontal, superior y de muñeca) para percibir el entorno y controla un robot tipo `so_follower` con 6 grados de libertad.

Con 51,7 millones de parámetros y un peso de 0,2 GB, es un modelo compacto y ligero, pensado para ejecutarse en tiempo real en entornos de robótica. Su relevancia radica en que demuestra cómo un transformer relativamente pequeño puede aprender tareas de manipulación complejas mediante teleoperación, y se integra directamente con la infraestructura de LeRobot para entrenamiento y despliegue. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (no aplica, modelo de visión-actuación) |
| Tipos de cuantización | No disponible (pesos completos en FP32) |
| Idiomas soportados | No aplica (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador de visión (ResNet preentrenado) con un transformador que predice un `chunk` de acciones de longitud fija (por ejemplo, 10 pasos futuros) en lugar de una sola acción. Esto permite capturar la estructura temporal de la tarea y reducir el error de acumulación de pasos. El modelo procesa tres imágenes (640×480 para cámara frontal y superior, 480×640 para la muñeca) y un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset propio de 50 episodios teleoperados (134.745 frames a 30 FPS). Se usaron 100.000 pasos de entrenamiento, tamaño de batch 8, optimizador AdamW y una tasa de aprendizaje de 1e-5, con semilla 1000. No se menciona el uso de RLHF ni DPO; el método es puramente de imitación supervisada.

## Capacidades

- Aprendizaje por imitación de tareas de manipulación robótica a partir de teleoperación.
- Percepción multimodal con tres cámaras simultáneas (frontal, superior, muñeca).
- Control de un robot con 6 grados de libertad (estado y acción de 6 dimensiones).
- Predicción de secuencias de acciones (action chunking), lo que permite movimientos fluidos y coordinados.
- Integración nativa con LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- Soporte de ejecución en tiempo real gracias a su tamaño reducido (51,7 M de parámetros).

## Casos de uso

- **Empaquetado y manipulación en líneas de producción**: el modelo puede ejecutar la tarea de cargar objetos en contenedores de forma autónoma, sustituyendo la operación manual en entornos controlados.
- **Investigación en aprendizaje por imitación**: sirve como punto de partida para estudiar el efecto del número de episodios, el número de cámaras o la longitud del chunk en el éxito de tareas de manipulación.
- **Validación de hardware robótico**: al estar entrenado con LeRobot, se puede usar para verificar el funcionamiento de un brazo `so_leader` y sus cámaras antes de realizar tareas más complejas.
- **Pruebas de robustez con variaciones**: aunque no se han publicado evaluaciones, se puede desplegar el modelo en escenarios con posiciones de objetos diferentes para medir su generalización.
- **Benchmark de métodos de imitación**: comparar el rendimiento de ACT con otros métodos (por ejemplo, Diffusion Policy) en la misma tarea de empaquetado.
- **Formación de operadores de robots**: el modelo puede ejecutarse en modo de demostración para enseñar a operadores humanos los movimientos óptimos de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación de la política en el robot real.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al ser un modelo de 51,7 M parámetros con entrada de imágenes (3×640×480), se estima un consumo de memoria de entre 1 y 2 GB en FP32, y menos de 1 GB en cuantización FP16.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia, por ejemplo una NVIDIA RTX 3060, RTX 4060 o superior. Para entrenamiento, se recomienda una GPU con 8 GB o más (por ejemplo, RTX 3070, RTX 4090, A100).
- **Compatibilidad con GPU de consumo**: sí, el modelo cabe en GPUs de consumo como las de la serie RTX 30 o 40.
- **Opciones de despliegue**: el modelo se ejecuta con el framework LeRobot, que soporta inferencia en PyTorch con CUDA. También se puede exportar a formato ONNX o TensorRT para optimizar en tiempo real, aunque no está documentado.
- **Latencia y throughput**: no disponible. Al ser un modelo pequeño y con entrada de imágenes de resolución moderada, se espera una latencia de inferencia inferior a 20 ms en una GPU moderna, lo que permite control en tiempo real a 30 Hz.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Framework | Licencia |
|---|---|---|---|---|
| `act_50ep` (este) | 51,7 M | Empaquetado de gomas | LeRobot | Apache 2.0 |
| `Deepkar/box-packaging-stacking-50ep-act` | No disponible | Empaquetado y apilado de cajas | LeRobot | No disponible |
| `ACT` original (paper) | Variable (85 M en la publicación) | Manipulación general | No disponible | No disponible |

La comparación directa con otros modelos del mismo autor no está disponible. En el Hub de Hugging Face existen otros modelos ACT entrenados con LeRobot para tareas similares, como `Deepkar/box-packaging-stacking-50ep-act`, aunque no se han publicado resultados de evaluación comparativos.

## Limitaciones y advertencias

- **Sesgos de teleoperación**: el modelo aprende de las demostraciones del operador humano, por lo que puede reproducir sesgos o errores sistemáticos de la persona que teleopera.
- **Riesgo de alucinación**: al ser un modelo de control, no hay riesgo de alucinación lingüística, pero puede generar acciones no deseadas si el entorno difiere de los datos de entrenamiento (por ejemplo, objetos en posiciones nuevas).
- **Limitación de contexto**: el modelo solo ha visto un tipo de tarea (empaquetado de gomas de borrar) y con un robot específico; no generaliza a otras tareas sin reentrenamiento.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial y modificación, pero es necesario citar el método ACT y LeRobot en caso de publicación (según la model card).
- **Advertencia de producción**: no hay resultados de evaluación real en el robot, por lo que no se recomienda su uso en entornos de producción sin una validación previa con la tasa de éxito medida.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AndreGaio/act_packing_50ep)
- [Dataset de entrenamiento](https://huggingface.co/datasets/AndreGaio/test-packing_3cam_20260823_140000)
- [Paper de ACT (arXiv 2304.13705)](https://huggingface.co/papers/2304.13705)
- [LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Visualización del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=AndreGaio/test-packing_3cam_20260823_140000)
