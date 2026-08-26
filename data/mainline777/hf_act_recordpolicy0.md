# mainline777/hf_act_recordpolicy0

## Resumen

El modelo `mainline777/hf_act_recordpolicy0` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. Está diseñado para ejecutar la tarea de levantar un cubo con un brazo robótico xArm, a partir de observaciones de imagen y estado del robot. El modelo predice secuencias de acciones (chunks) de manera autoregresiva, lo que permite un control más estable y preciso que los métodos de predicción paso a paso.

Con solo 51,6 millones de parámetros, es un modelo ligero que puede ejecutarse en hardware modesto. Fue entrenado con 800 episodios teleoperados (20.000 frames a 15 FPS) y 1.000 pasos de optimización. Su relevancia radica en que sirve como ejemplo práctico de cómo aplicar ACT a tareas de manipulación real con el ecosistema LeRobot, y está publicado bajo licencia Apache 2.0, permitiendo su uso comercial y modificación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers) |
| Parametros totales | 51.663.491 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen y estado) |
| Tipos de cuantizacion | no disponible (pesos en float32, safetensors) |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT (Action Chunking with Transformers), publicada en el paper arXiv:2304.13705. Consiste en un codificador de visión (para imágenes de 84x84 píxeles) y un codificador de estado (vector de 4 dimensiones), seguidos de un decodificador transformer autoregresivo que genera secuencias de acciones de 3 dimensiones (posiciones del efector). En lugar de predecir una sola acción por paso, el modelo predice un chunk de acciones, lo que reduce la acumulación de errores y mejora la estabilidad del control.

El entrenamiento se realizó con el dataset `lerobot/xarm_lift_medium_replay_image`, compuesto por 800 episodios teleoperacionados de la tarea "Pick up the cube and lift it". Se usaron 20.000 frames a 15 FPS. La configuración de entrenamiento incluyó 1.000 pasos, batch size 64, optimizador AdamW con tasa de aprendizaje 1e-5 y semilla 1000. El modelo fue entrenado y subido al Hub mediante la librería LeRobot versión 0.6.2. No se reporta el uso de técnicas de refuerzo o RLHF.

## Capacidades

- Control robótico de brazo articulado (xarm) para tareas de manipulación.
- Predicción de acciones en chunks (secuencias de 3 dimensiones) a partir de observaciones de imagen y estado del robot.
- Manejo de entrada multimodal: imagen (3 canales, 84×84) y estado (4 valores).
- Generación de acciones de control de baja frecuencia (15 Hz) para tareas de pick-and-place.
- Capacidad de generalización limitada a la tarea y entorno de entrenamiento.
- No soporta tool calling, agentes ni razonamiento de lenguaje natural.

## Casos de uso

- Automatización de tareas de picking y colocación en líneas de producción: el modelo puede controlar un brazo robótico para recoger piezas y colocarlas en posiciones definidas, integrándose en sistemas de control mediante LeRobot.
- Investigación en aprendizaje por imitación: sirve como referencia para estudiar el comportamiento de ACT con datos de baja resolución y pocos episodios.
- Prototipado rápido de control robótico: al ser ligero y entrenado con un dataset público, permite evaluar la viabilidad de ACT en nuevas tareas antes de escalar a modelos más grandes.
- Desarrollo de entornos de simulación para robótica: puede integrarse en simuladores para probar políticas de control antes de despliegue físico.
- Educación en IA para robótica: útil como ejemplo didáctico de entrenamiento de políticas de comportamiento en el ecosistema LeRobot.
- Base para el aprendizaje de tareas compuestas: se puede usar como política inicial para transferencia de aprendizaje en tareas más complejas, aunque no está optimizado para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se proporcionaron resultados de evaluación. No se dispone de tasas de éxito ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB (modelo de 51 M parámetros, entrada de imagen 84×84 y estado 4).
- GPU recomendada: cualquier GPU con CUDA, incluyendo GTX 1060, RTX 2060 o superior. También puede ejecutarse en CPU para inferencia de baja frecuencia.
- Cabe en GPUs de consumo: sí, sin problemas. Incluso en sistemas embebidos con aceleración básica.
- Opciones de despliegue: LeRobot (biblioteca de Python), que permite ejecutar `lerobot-rollout` para control en tiempo real. También se puede exportar a otros formatos si se convierte, aunque no se documenta.
- Latencia y throughput: no se conocen datos medidos, pero al ser un modelo pequeño, la latencia por paso es del orden de milisegundos en GPU.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables con la misma arquitectura y tarea en el Hub o en la literatura consultada. El modelo es específico para la tarea de xarm lift y no se dispone de datos de rendimiento frente a alternativas como Diffusion Policy o otros métodos de imitación.

## Limitaciones y advertencias

- Generalización limitada: el modelo fue entrenado para una tarea específica (levantar un cubo) con un robot y cámara concretos. No se puede esperar que funcione en entornos o configuraciones diferentes sin reentrenamiento.
- Dependencia de la distribución de datos: si las condiciones de iluminación, posición del objeto o postura del robot difieren de las del dataset, el rendimiento puede degradarse significativamente.
- Sin evaluación en robot real: la model card indica que no se han proporcionado resultados de evaluación, por lo que no se conoce la tasa de éxito real en despliegue físico.
- Riesgo de errores de control: al ser un modelo de imitación, puede fallar en situaciones no vistas o ante perturbaciones inesperadas, causando movimientos no seguros.
- Licencia Apache 2.0 permite uso comercial, pero se debe citar el método y LeRobot según la política del Hub.
- No soporta procesamiento de lenguaje natural ni interacción con usuarios; es exclusivamente un controlador de bajo nivel.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mainline777/hf_act_recordpolicy0
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/xarm_lift_medium_replay_image
