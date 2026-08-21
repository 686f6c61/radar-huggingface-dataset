# leo-maglanoc/so101-pick-and-place-faster

## Resumen

El modelo `leo-maglanoc/so101-pick-and-place-faster` es una política de control robótico basada en Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. Desarrollado por leo-maglanoc, el modelo está diseñado para ejecutar tareas de pick-and-place con el brazo robótico SO-101, utilizando una cámara frontal y el estado del robot para generar acciones de control. Con 51,7 millones de parámetros, es un modelo compacto que puede ejecutarse en tiempo real en hardware modesto. Su relevancia radica en demostrar el uso de aprendizaje por imitación para tareas de manipulación robótica, siguiendo la arquitectura propuesta en el paper de ACT (arXiv:2304.13705). El modelo se distribuye bajo licencia Apache 2.0 y está disponible en el Hub de Hugging Face, con pesos en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control robótico) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ACT, que combina un codificador de visión (para procesar la imagen frontal de 640x480 píxeles) con un transformador que predice secuencias de acciones (chunks) en lugar de pasos individuales. Esta técnica de aprendizaje por imitación, propuesta en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705), permite generar trayectorias suaves y robustas a partir de datos teleoperados. El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset propio de 30 episodios (18.519 frames a 30 FPS) para la tarea "test". La configuración de entrenamiento incluyó 20.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se reporta el uso de RLHF ni DPO, ya que es un método de imitación supervisada.

## Capacidades

- Generación de acciones de control para el brazo robótico SO-101, con salida de 6 dimensiones (posición y orientación).
- Percepción visual a través de una cámara frontal, procesando imágenes de 640x480 píxeles.
- Procesamiento del estado del robot (6 dimensiones) como entrada adicional.
- Ejecución de tareas de pick-and-place, es decir, recoger y colocar objetos en posiciones objetivo.
- Integración nativa con LeRobot para entrenamiento, evaluación y despliegue en robots reales o simulados.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni razonamiento simbólico.

## Casos de uso

- Automatización de pick-and-place en entornos de laboratorio: el modelo puede controlar un brazo SO-101 para recoger objetos y colocarlos en ubicaciones específicas, reduciendo la intervención manual en experimentos repetitivos.
- Prototipado de políticas de imitación con LeRobot: sirve como punto de partida para investigadores que deseen entrenar y evaluar políticas ACT en tareas similares, gracias a su integración con el ecosistema LeRobot.
- Simulación robótica en MuJoCo: el modelo puede desplegarse en entornos simulados (como se muestra en el repositorio ALPHA-117/LeRobot-SO101-Simulation) para validar algoritmos antes de pasar al hardware real.
- Investigación en aprendizaje por imitación: permite estudiar el efecto del número de demostraciones, la arquitectura ACT y los hiperparámetros en el rendimiento de tareas de manipulación.
- Control de brazos robóticos SO-101 en entornos educativos: al ser un modelo pequeño y de código abierto, es adecuado para cursos de robótica que enseñan aprendizaje por refuerzo o imitación.
- Benchmarking de políticas de control: puede utilizarse como referencia para comparar con otras políticas entrenadas sobre el mismo robot y tarea, aunque no se han publicado resultados formales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de métricas como tasa de éxito, precisión o latencia medidas.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB, dado el tamaño de 51,7 millones de parámetros y la entrada de imagen de baja resolución.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 3060, etc.). También puede ejecutarse en CPU, aunque con mayor latencia.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna.
- Opciones de despliegue: LeRobot (comando `lerobot-rollout`), PyTorch, y entornos de simulación como MuJoCo.
- Latencia y throughput: no se proporcionan datos medidos, pero al ser un modelo compacto se espera inferencia en tiempo real (30 FPS) en hardware con aceleración GPU.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de la misma categoría. Existe un modelo hermano en el Hub (`leo-maglanoc/so101-pick-and-place`) que probablemente comparte arquitectura y dataset, pero no se han publicado especificaciones ni resultados que permitan una comparación cuantitativa. Tampoco se han encontrado benchmarks frente a otras políticas ACT de la comunidad. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo fue entrenado con solo 30 episodios, lo que puede limitar su capacidad de generalización ante variaciones en la posición de los objetos, iluminación o configuraciones del robot.
- No se han reportado evaluaciones en robot real, por lo que su rendimiento en condiciones operativas es desconocido.
- La tarea está etiquetada como "test", lo que sugiere que el modelo es un experimento preliminar y no una solución lista para producción.
- Depende de la calibración del robot y de la configuración de la cámara frontal; cambios en estos parámetros pueden degradar el rendimiento.
- Al ser un modelo de imitación, no tiene capacidad de razonamiento ni de adaptación a tareas no vistas; solo reproduce comportamientos aprendidos.
- La licencia Apache 2.0 permite uso comercial, pero se debe citar el método ACT y LeRobot según las indicaciones de la model card.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/leo-maglanoc/so101-pick-and-place-faster)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [Dataset de entrenamiento](https://huggingface.co/datasets/leo-maglanoc/so101-pick-and-place_20260821_121335)
- [Repositorio de simulación SO-101 en MuJoCo](https://github.com/ALPHA-117/LeRobot-SO101-Simulation)
- [Repositorio de fine-tuning relacionado](https://github.com/meetsitaram/le-pickup)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
