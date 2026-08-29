# Atneura/act-so101-red-lego-controlled-light-30eps

## Resumen

Este modelo es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales. Ha sido desarrollado por Atneura utilizando la librería LeRobot de Hugging Face y entrenado para ejecutar la tarea de recoger una pieza Lego roja y depositarla en un contenedor, usando un brazo robótico SO-101 (SO-ARM100). El modelo cuenta con 51,67 millones de parámetros y se ha entrenado con 30 episodios de demostración teleoperada, lo que lo convierte en un ejemplo representativo de políticas ACT de tamaño reducido para manipulación robótica.

La relevancia de este modelo radica en que demuestra el flujo completo de entrenamiento y despliegue de políticas de imitación con LeRobot, una de las herramientas open source más utilizadas en robótica de bajo coste. Al estar publicado con licencia Apache 2.0 y en formato safetensors, puede ser reproducido, evaluado y adaptado por la comunidad. Su tamaño compacto permite ejecutarlo en hardware de consumo, lo que facilita la experimentación en laboratorios académicos y proyectos de robótica doméstica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - transformer encoder-decoder |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT descrita en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). ACT utiliza un transformer con codificador y decodificador que procesa observaciones visuales (imagen de cámara frontal de 480x640 píxeles) y el estado del robot (6 dimensiones), y genera acciones de 6 dimensiones en forma de chunks temporales. Esta arquitectura está diseñada para reducir el error de acumulación en tareas de manipulación de larga duración.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset propio de 30 episodios teleoperados, con un total de 13.470 frames a 30 FPS. La configuración de entrenamiento incluye 5.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se dispone de información sobre el uso de técnicas como RLHF o DPO, ya que se trata de aprendizaje por imitación supervisado. Tampoco se han publicado detalles sobre el número de capas, heads de atención o dimensiones internas del transformer.

## Capacidades

- Control robótico de brazo SO-101: genera comandos de articulación de 6 grados de libertad a partir de observaciones visuales y de estado.
- Tarea de pick and place: entrenado específicamente para recoger una pieza Lego roja y colocarla en un contenedor.
- Percepción visual: procesa imágenes RGB de una cámara frontal (480x640) para localizar el objeto y el contenedor.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones humanas teleoperadas.
- Generación de acciones en chunks: predice secuencias de acciones (action chunking) en lugar de acciones paso a paso, lo que mejora la estabilidad del movimiento.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot.

## Casos de uso

- Automatización de tareas de manipulación en laboratorio: el modelo puede integrarse en un brazo SO-101 para realizar tareas repetitivas de recoger y colocar objetos, reduciendo la intervención manual en entornos de investigación.
- Prototipado rápido de políticas robóticas: al ser un modelo pequeño y entrenado con pocos datos, sirve como punto de partida para validar el flujo de LeRobot antes de escalar a tareas más complejas.
- Educación en robótica y aprendizaje por imitación: estudiantes e investigadores pueden desplegar este modelo en hardware de bajo coste (SO-101) para estudiar el comportamiento de políticas ACT y comparar con otras arquitecturas.
- Benchmarking de métodos de imitación: al estar disponible públicamente, puede usarse como referencia para comparar el rendimiento de nuevas variantes de ACT o de otros algoritmos de aprendizaje por imitación en la misma tarea.
- Desarrollo de sistemas de control visual: el modelo demuestra cómo combinar percepción visual y control de articulaciones, sirviendo de ejemplo para integrar visión en otros robots.
- Investigación en generalización de políticas: dado que el entrenamiento se realizó con iluminación controlada, puede usarse para estudiar la robustez de la política ante cambios de iluminación u otras variaciones del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito, precisión de agarre o tiempo de ejecución.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,67 millones de parámetros, el modelo ocupa aproximadamente 207 MB en fp32 y unos 103 MB en fp16. La inferencia puede ejecutarse en cualquier GPU con al menos 1 GB de VRAM, incluyendo GPUs integradas modernas.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (GTX 1060 o superior, RTX 2060, RTX 3060, etc.) es suficiente. También puede ejecutarse en CPU para pruebas de baja frecuencia.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer actual, incluso en Jetson Nano o Raspberry Pi con aceleración.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo ejecutan en el robot. También puede integrarse con frameworks de inferencia como PyTorch directamente.
- Latencia y throughput: no se han publicado datos de latencia. Dado el tamaño del modelo, se espera una inferencia en el orden de milisegundos en GPU moderna, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos. Existen otros modelos ACT publicados en Hugging Face para el brazo SO-101, como `Atneura/act-so101-red-lego-to-bin-10eps` (entrenado con 10 episodios) o `aiden-li/so101-act`, pero no se han encontrado sus especificaciones detalladas ni resultados de benchmarks. La comparativa cualitativa se limita a señalar que este modelo usa 30 episodios frente a otros que usan menos, lo que podría influir en la robustez, pero sin datos de evaluación no es posible confirmarlo.

## Limitaciones y advertencias

- Entrenado para una tarea muy específica: el modelo solo sabe recoger una pieza Lego roja y colocarla en un contenedor. No generaliza a otros objetos, colores o disposiciones del entorno.
- Condiciones de iluminación controladas: el nombre del modelo indica "controlled-light", lo que sugiere que fue entrenado bajo iluminación fija. Cambios de iluminación pueden degradar el rendimiento.
- Dataset pequeño: 30 episodios es una cantidad limitada de demostraciones, lo que puede provocar sobreajuste y baja robustez ante variaciones en la posición inicial del objeto o del robot.
- Sin evaluación en robot real: no se han publicado resultados de pruebas físicas, por lo que el rendimiento real en hardware es desconocido.
- Riesgo de alucinación de acciones: como todo modelo de imitación, puede generar movimientos erráticos si las observaciones difieren de las del entrenamiento.
- Dependencia de la cámara frontal: el modelo solo utiliza una cámara; si el objeto queda fuera del campo de visión, la política fallará.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye sin garantías y sin soporte oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Atneura/act-so101-red-lego-controlled-light-30eps
- Dataset de entrenamiento: https://huggingface.co/datasets/Atneura/so101-red-lego-to-bin-controlled-light-30eps_20260828_160455
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Documentación de rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio del brazo SO-ARM100: https://github.com/TheRobotStudio/SO-ARM100
