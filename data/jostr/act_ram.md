# JoSTR/act_ram

## Resumen

El modelo `JoSTR/act_ram` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Ha sido entrenado y publicado mediante el framework LeRobot de Hugging Face, y está diseñado para ejecutar la tarea específica de desbloquear y extraer un módulo de memoria RAM en un robot manipulador de doble brazo. El modelo consume observaciones de estado y tres flujos de imagen (cámara cenital, muñeca derecha e izquierda) y produce comandos de acción de 16 dimensiones.

Con 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a la robótica de manipulación, no a la generación de lenguaje. Su relevancia radica en que demuestra el uso de ACT con LeRobot para tareas de precisión en entornos controlados, y su licencia Apache 2.0 permite su uso comercial y modificación. El entrenamiento se realizó sobre un dataset propio de 60 episodios teleoperados, con 87.659 fotogramas a 30 FPS.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.689.104 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de robótica, no procesa texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers que predice un "chunk" de acciones futuras (por ejemplo, 16 pasos) a partir de observaciones actuales. En este caso, el modelo recibe como entrada un vector de estado de 16 dimensiones y tres imágenes RGB de 480x640 píxeles (cenital, muñeca derecha y muñeca izquierda), y genera una secuencia de acciones de 16 dimensiones. El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset de teleoperación con 60 episodios y 87.659 fotogramas, correspondientes a la tarea "Unlock the RAM-Stick and remove it". Se usaron 100.000 pasos de entrenamiento, batch size 8, optimizador AdamW y una tasa de aprendizaje de 1e-05. No se menciona el uso de RLHF ni DPO; es un entrenamiento puramente supervisado de imitación.

## Capacidades

- Control robótico de manipulación: predice acciones de 16 dimensiones para un robot de doble brazo (Dual_xArm7).
- Percepción visual multimodal: procesa tres flujos de imagen simultáneos (cenital, muñeca derecha e izquierda) para guiar la manipulación.
- Aprendizaje por imitación: reproduce comportamientos teleoperados con alta fidelidad en la tarea entrenada.
- Ejecución en tiempo real: diseñado para inferencia en bucle cerrado con el robot, a 30 FPS.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot (comandos `lerobot-rollout` y `lerobot-train`).
- No incluye capacidades de lenguaje, tool calling ni razonamiento simbólico; es exclusivamente una política motora.

## Casos de uso

- Automatización de ensamblaje y desensamblaje de componentes electrónicos: el modelo puede ejecutar tareas de inserción o extracción de piezas (como módulos RAM) en líneas de producción, reduciendo la intervención manual.
- Manipulación de objetos en entornos de laboratorio: útil para tareas repetitivas de precisión, como montaje de circuitos o manejo de muestras, donde se requiere consistencia y exactitud.
- Investigación en robótica de imitación: sirve como punto de partida para estudiar la transferencia de políticas ACT a nuevas tareas o robots, gracias a su tamaño reducido y licencia abierta.
- Prototipado rápido de soluciones robóticas: permite validar la viabilidad de ACT en un robot concreto antes de escalar a tareas más complejas, usando el flujo de LeRobot.
- Educación y formación en robótica: puede emplearse en cursos de aprendizaje por imitación para demostrar el ciclo completo de recolección de datos, entrenamiento y despliegue.
- Integración en sistemas de control industrial: al ser un modelo ligero, puede ejecutarse en hardware embebido o GPUs de gama media para control en tiempo real de brazos robóticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real. No hay datos de tasas de éxito ni comparaciones con otros métodos.

## Requisitos de hardware

- Al tratarse de un modelo de 51,7 millones de parámetros, la inferencia es ligera y puede ejecutarse en GPUs de consumo (por ejemplo, RTX 3060 o superiores) con VRAM inferior a 4 GB, aunque no se especifican requisitos oficiales.
- El entrenamiento se realizó con `--policy.device=cuda`, lo que sugiere que se usó una GPU NVIDIA, pero no se indica el modelo concreto.
- Para despliegue en robot, se requiere un sistema con soporte para cámaras (OpenCV) y comunicación con el robot (puerto serie o red), según la configuración de LeRobot.
- No se proporcionan datos de latencia ni throughput. Dado el tamaño, se espera una inferencia en milisegundos en GPU moderna.
- Opciones de despliegue: el modelo se ejecuta mediante el comando `lerobot-rollout` de LeRobot, que gestiona la captura de imágenes y el envío de acciones al robot. No es compatible con vLLM, llama.cpp u otros motores de LLM, al ser un modelo de robótica.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas ACT para robótica) dentro de la información proporcionada. No se pueden establecer comparaciones con otras implementaciones de ACT o métodos de imitación sin datos adicionales.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea "Unlock the RAM-Stick and remove it" y no generaliza a otras tareas sin reentrenamiento.
- El dataset de entrenamiento es reducido (60 episodios), lo que puede limitar la robustez ante variaciones de iluminación, posición de objetos o perturbaciones.
- No se han proporcionado resultados de evaluación en robot real, por lo que se desconoce la tasa de éxito real en condiciones operativas.
- La dependencia de tres cámaras fijas (cenital, muñeca derecha e izquierda) implica que cualquier cambio en la configuración de sensores requiere recalibración o reentrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías; el usuario es responsable de validar su seguridad en entornos de producción.
- No es un modelo de lenguaje: no procesa texto, ni mantiene conversaciones, ni soporta tool calling. Su uso está restringido al control robótico.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/JoSTR/act_ram)
- [Dataset de entrenamiento](https://huggingface.co/datasets/JoSTR/rm_ram_20260831_145557)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
