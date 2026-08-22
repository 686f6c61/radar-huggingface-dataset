# fhnwrover/manibar-act-erc-black_switch

## Resumen

El modelo `fhnwrover/manibar-act-erc-black_switch` es una política de manipulación robótica entrenada con el método Action Chunking with Transformers (ACT), un algoritmo de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales. Ha sido desarrollado por el usuario `fhnwrover` y publicado en Hugging Face bajo la licencia Apache 2.0, utilizando la librería LeRobot para su entrenamiento y despliegue. El modelo está especializado en una tarea concreta: rotar un interruptor negro hacia la derecha, y se ha entrenado con datos teleoperados de un robot real.

La arquitectura ACT combina un codificador de visión (para procesar imágenes de tres cámaras) con un transformador que genera acciones de control de 7 dimensiones. El modelo tiene aproximadamente 51,7 millones de parámetros y se ha entrenado durante 80.000 pasos sobre un dataset de 83 episodios. Su relevancia radica en que demuestra la aplicación práctica de técnicas de imitación de vanguardia en robótica, con un coste computacional reducido y una integración sencilla mediante el ecosistema LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parámetros totales | 51.748.707 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (modelo robótico, no procesa texto) |
| Tipos de cuantización | No disponible (pesos en precisión completa, safetensors) |
| Idiomas soportados | No disponible (modelo de visión y control, sin lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers. El modelo procesa observaciones multimodales: el estado del robot (un vector de 83 dimensiones) y tres imágenes RGB de 360x640 píxeles provenientes de las cámaras `board`, `gripper_left` y `gripper_right`. El codificador visual extrae características de cada imagen y las combina con el estado para generar una secuencia de acciones (un "chunk") de 7 dimensiones que representan los movimientos del efector final.

El entrenamiento se realizó con el dataset `fhnwrover/manibar-erc-black_switch`, que contiene 83 episodios de teleoperación con una tasa de 20 FPS (26.634 frames). Se utilizó el optimizador AdamW con una tasa de aprendizaje de 1e-5, un tamaño de lote de 32 y una semilla fija de 1000. El modelo se entrenó durante 80.000 pasos con la versión 0.6.1 de LeRobot. No se aplicaron técnicas de RLHF ni DPO, ya que el aprendizaje es por imitación directa de demostraciones.

## Capacidades

- Control de manipulación robótica: el modelo genera secuencias de acciones de 7 grados de libertad para mover el efector final de un brazo robótico.
- Percepción multimodal: combina tres fuentes de imagen con el estado propioceptivo del robot para tomar decisiones.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas, con capacidad de generalización limitada a la tarea y entorno de entrenamiento.
- No soporta tool calling, razonamiento complejo ni procesamiento de lenguaje natural, ya que su dominio es exclusivamente robótico.
- Funciona en tiempo real (20 FPS de inferencia) con hardware de gama media.

## Casos de uso

- Automatización de tareas de manipulación en laboratorios: el modelo puede integrarse en una estación de trabajo para rotar interruptores, botones o perillas, reduciendo la intervención humana en entornos de pruebas repetitivas.
- Control de robots colaborativos en líneas de producción: dado su bajo coste computacional, puede ejecutarse en controladores industriales con GPU modesta para realizar operaciones de conmutación de equipos.
- Investigación en robótica de imitación: sirve como base para experimentar con técnicas de ACT, transferencia de tareas o ampliación del dataset con nuevas demostraciones.
- Prototipado rápido de tareas de manipulación: permite a desarrolladores validar la viabilidad de un nuevo escenario de manipulación sin necesidad de diseñar controladores clásicos complejos.
- Entrenamiento de políticas robustas en entornos simulados: aunque se entrenó con datos reales, el modelo puede utilizarse como referencia para comparar el rendimiento de variantes de ACT en simuladores.
- Sistemas de teleoperación asistida: el modelo puede generar acciones sugeridas durante la teleoperación para mejorar la precisión de operadores humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no se han realizado evaluaciones en robot real (campo "Evaluation" vacío). Por tanto, no es posible comparar su éxito en la tarea con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 51,7 millones de parámetros y entradas de imagen de 640x360, la inferencia en punto flotante requiere aproximadamente 200-300 MB de VRAM en una GPU con CUDA. La carga del modelo en safetensors ocupa 0.2 GB en disco.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (ej. NVIDIA GTX 1050 Ti o superior) es suficiente. En CPU es viable para inferencia a baja frecuencia, pero no se recomienda para tiempo real.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama baja y media (RTX 3050, RTX 4060, etc.). También puede ejecutarse en dispositivos como Jetson Nano.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`). Se puede integrar con vLLM o TGI, aunque no son necesarios dado el tamaño. Para despliegue en robot, se recomienda ejecutar en un ordenador con GPU dedicada y las cámaras conectadas.
- Latencia y throughput: no se dispone de mediciones oficiales, pero con un modelo de este tamaño y tres cámaras, la inferencia típica es de menos de 50 ms por paso en una GPU media, permitiendo control a 20 FPS.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fhnwrover/manibar-act-erc-black_switch` (este) | 51.7M | Rotar interruptor negro | 83 episodios, 26k frames | Apache 2.0 | Hugging Face |
| `fhnwrover/manibar-act-erc-black-switches` (variante) | No disponible | Similar | No disponible | Apache 2.0 | Hugging Face |
| `fhnwrover/manibar-act-erc-black-switches-v2` (variante) | No disponible | Similar | No disponible | Apache 2.0 | Hugging Face |
| Modelo base ACT (LeRobot) | Variable | Variable | Variable | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo. Las variantes listadas en Hugging Face podrían tener configuraciones diferentes pero no se han publicado sus especificaciones.

## Limitaciones y advertencias

- El modelo está entrenado para una tarea muy específica (rotar un interruptor negro a la derecha) y no generaliza a otras tareas de manipulación sin reentrenamiento.
- No soporta entradas de texto ni lenguaje natural; es un sistema de control visual y de estado.
- La dependencia de las cámaras específicas (board, gripper_left, gripper_right) implica que el despliegue en otro robot requiere que los sensores coincidan en nombre y resolución.
- El entrenamiento se realizó con un solo robot y un entorno concreto; la transferencia a otros entornos o robots puede degradar el rendimiento.
- No se han publicado evaluaciones de éxito en robot real, por lo que no se conoce la tasa de éxito real en la tarea.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de LeRobot y del dataset asociado.
- Riesgo de alucinación no aplica al ser un modelo de control; sin embargo, puede generar acciones erróneas si las condiciones de entrada difieren del entrenamiento (por ejemplo, iluminación o posiciones diferentes).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/fhnwrover/manibar-act-erc-black_switch)
- [Dataset de entrenamiento](https://huggingface.co/datasets/fhnwrover/manibar-erc-black_switch)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
