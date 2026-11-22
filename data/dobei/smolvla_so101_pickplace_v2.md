# dobei/smolvla_so101_pickplace_v2

## Resumen
`dobei/smolvla_so101_pickplace_v2` es un modelo de visión-lenguaje-acción (VLA) compacto, especializado en robótica, publicado por el usuario dobei en Hugging Face. Se trata de un ajuste fino del modelo base `lerobot/smolvla_base`, que implementa la arquitectura SmolVLA descrita en el paper arXiv:2506.01844. El modelo está entrenado para controlar un robot de tipo `so_follower` (SO-101) y ejecutar la tarea concreta de "pick and place" (recoger y colocar) de un cubo rojo en una caja azul, a partir de observaciones visuales y del estado de las articulaciones.

Con 450 millones de parámetros, SmolVLA se posiciona como una alternativa ligera y desplegable en hardware de consumo, frente a los VLA de gran escala que requieren clústeres de GPU. Este ajuste concreto es un ejemplo práctico de cómo LeRobot permite adaptar un modelo base a una tarea robótica específica con muy pocos pasos de entrenamiento (10 pasos) y un dataset pequeño (25 episodios, 11.286 frames). Su relevancia radica en demostrar el flujo completo de imitación robótica de extremo a extremo con herramientas open source.

El modelo tiene un interés limitado fuera de su tarea específica: no es un modelo de propósito general, sino una política de control entrenada para un robot y un escenario concretos. Aun así, resulta útil como referencia para desarrolladores que quieran replicar el pipeline de SmolVLA o evaluar el rendimiento de políticas VLA compactas en tareas de manipulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), basada en transformer con encoder visual y de lenguaje |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower (SO-101) |
| Cámaras | scene, wrist (más una cámara vacía de 480x640) |
| Entradas | observation.state (6,), observation.images.camera1/2/3 (3,256,256), observation.images.empty_camera_0 (3,480,640) |
| Salidas | action (6,) |
| Librería | lerobot |
| Pipeline | robotics |
| Tamaño del repo | 1.8 GB |

## Arquitectura y entrenamiento
SmolVLA es un modelo de visión-lenguaje-acción que combina un encoder visual y un encoder de lenguaje para producir acciones motoras directamente a partir de observaciones. La arquitectura está diseñada para ser compacta y eficiente, de modo que pueda ejecutarse en hardware de consumo, a diferencia de otros VLA de mayor tamaño. El modelo base `lerobot/smolvla_base` se distribuye a través de la librería LeRobot y sirve como punto de partida para ajustes finos en tareas robóticas específicas.

Este ajuste concreto se entrenó sobre el dataset `dobei/so101_red_cube_blue_box_2_20261117_161737`, compuesto por 25 episodios y 11.286 frames a 30 FPS, con la tarea "pick and place". La configuración de entrenamiento fue de 10 pasos, batch size 16, optimizador AdamW, learning rate 0,0001, semilla 1000 y LeRobot versión 0.7.1. Se desconoce el número total de tokens o la composición exacta del dataset, así como si se aplicaron técnicas de RLHF o DPO; no hay información disponible al respecto. La innovación principal es el propio enfoque SmolVLA: un VLA compacto que logra un rendimiento competitivo con costes computacionales reducidos.

## Capacidades
- Control robótico de manipulación: genera acciones de 6 dimensiones para un robot SO-101 a partir de observaciones visuales y del estado de las articulaciones.
- Percepción visual multi-cámara: procesa tres cámaras de 256x256 y una cámara adicional de 480x640.
- Ejecución de la tarea "pick and place": entrenado específicamente para recoger un cubo rojo y colocarlo en una caja azul.
- Integración con LeRobot: se ejecuta mediante `lerobot-rollout` y se entrena con `lerobot-train`.
- Despliegue en hardware de consumo: al tener 450 millones de parámetros, es apto para GPUs de gama media.
- No soporta tool calling, agentes multi-paso, generación de texto ni capacidades multilingües; es un modelo puramente de robótica.

## Casos de uso
- Automatización de pick and place en laboratorio: el modelo puede controlar un robot SO-101 para recoger un cubo rojo y depositarlo en una caja azul, usando las cámaras scene y wrist para localizar los objetos y el estado de las articulaciones para planificar el movimiento.
- Prototipado rápido de políticas robóticas: sirve como punto de partida para que desarrolladores prueben el flujo de LeRobot con un modelo ya entrenado antes de adaptarlo a sus propias tareas.
- Investigación en imitación robótica: permite reproducir experimentos de aprendizaje por imitación con un dataset pequeño (25 episodios) y evaluar la viabilidad de VLA compactos.
- Docencia y formación: útil para enseñar conceptos de visión-lenguaje-acción y despliegue de políticas en robots de bajo coste.
- Benchmarking de hardware: al ser ligero, permite medir latencia y throughput en distintas GPUs de consumo para tareas de control en tiempo real.
- Base para ajustes finos en tareas similares: se puede reentrenar con `lerobot-train` sobre nuevos datasets de manipulación con el mismo robot y configuración de cámaras.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; con 450 millones de parámetros, en FP16 ocuparía aproximadamente 0,9 GB de pesos, y en FP32 unos 1,8 GB, a lo que habría que sumar el overhead de las cámaras y del runtime.
- GPU recomendadas: no disponible; por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, así como en A100 o H100.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 4-6 GB de VRAM, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dobei/smolvla_so101_pickplace_v2 | 450 M | no disponible | Pick and place SO-101 | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | VLA base para ajuste fino | no disponible | Hugging Face |
| Otros VLA de gran escala (p. ej. RT-2, OpenVLA) | no disponible en la información | no disponible | Manipulación general | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias
- Especialización extrema: el modelo solo está entrenado para la tarea "pick and place" con un robot SO-101 y un entorno concreto; no generaliza a otras tareas ni robots sin reentrenamiento.
- Entrenamiento muy corto: solo 10 pasos de entrenamiento y 25 episodios, lo que puede limitar la robustez y la tasa de éxito.
- Sin evaluación publicada: no hay métricas de éxito en robot real, por lo que se desconoce su fiabilidad.
- Dependencia de la configuración de cámaras: las claves de observación deben coincidir exactamente con las usadas en el entrenamiento (scene, wrist, empty_camera_0).
- Riesgo de alucinación visual: como todo modelo VLA, puede generar acciones incorrectas ante objetos, iluminación o posiciones no vistas durante el entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento.
- Sin soporte multilingüe ni de texto: no es adecuado para tareas de lenguaje natural.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/dobei/smolvla_so101_pickplace_v2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/dobei/so101_red_cube_blue_box_2_20261117_161737
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=dobei/so101_red_cube_blue_box_2_20261117_161737
