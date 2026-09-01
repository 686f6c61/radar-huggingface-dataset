# seriintan/turbovla_frazier_smoketest

## Resumen

TurboVLA es un modelo de visión-lenguaje-acción (VLA) diseñado para robótica, que opera a alta frecuencia (32 Hz) en hardware de consumo. Este repositorio contiene una política entrenada con LeRobot para la tarea de "Pick and place Frazier to blue basket" sobre un robot tipo `so_follower`. El modelo tiene 216 millones de parámetros y está disponible bajo licencia Apache 2.0. Su relevancia radica en que demuestra cómo un VLA compacto puede ejecutar tareas de manipulación en tiempo real sin depender de un gran modelo de lenguaje como interfaz central, lo que reduce costes computacionales y facilita su despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TurboVLA (visión-lenguaje-acción con interacción bidireccional ligera) |
| Parametros totales | 216.072.210 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en inglés, según dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Según el paper de TurboVLA, el modelo codifica de forma independiente las observaciones visuales y las instrucciones de lenguaje, intercambiando información mediante una interacción bidireccional ligera entre visión y lenguaje, y predice chunks de acción continuos con un decoder compacto. Esto contrasta con otros VLA que usan un LLM grande como interfaz central. El modelo fue entrenado con LeRobot sobre un dataset de 100 episodios (52.442 frames a 30 FPS) para la tarea de pick and place. La configuración de entrenamiento incluye 200 pasos, batch size 4, optimizador AdamW y learning rate 5e-05.

## Capacidades

- Control de robot manipulador: genera acciones de 6 dimensiones (posición y orientación) a partir de observaciones de estado y dos cámaras (frontal y gripper).
- Ejecución de tareas de pick and place: entrenado específicamente para la tarea "Pick and place Frazier to blue basket".
- Integración con LeRobot: compatible con el ecosistema LeRobot para entrenamiento y despliegue.
- Inferencia en tiempo real: el paper reporta 32 Hz en una GPU RTX (probablemente RTX 4090).
- Procesamiento multimodal: combina imágenes (480x640) y estado del robot.

## Casos de uso

- Automatización de tareas de manipulación en laboratorio: el modelo puede controlar un brazo robótico para recoger y colocar objetos en posiciones específicas, útil en entornos de investigación.
- Prototipado rápido de políticas robóticas: gracias a LeRobot, se puede entrenar y desplegar en pocos pasos, ideal para validar algoritmos de imitación.
- Benchmarking de VLA en hardware de consumo: al ser compacto (216M parámetros), permite evaluar el rendimiento de VLA en GPUs de gama media.
- Educación en robótica: sirve como ejemplo didáctico de un pipeline completo de entrenamiento de políticas con LeRobot.
- Integración en sistemas de automatización industrial ligera: para tareas repetitivas de pick and place con requisitos de baja latencia.
- Investigación en interacción visión-lenguaje-acción: el diseño sin LLM central permite estudiar alternativas más eficientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no hay resultados de evaluación para esta política concreta.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser un modelo de 216M parámetros, se estima que cabe en GPUs con 8-12 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090).
- GPU recomendada: el paper de TurboVLA menciona RTX (probablemente RTX 4090) para alcanzar 32 Hz.
- Compatibilidad con consumer GPU: sí, dado el tamaño compacto.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), compatible con PyTorch.
- Latencia: el paper reporta 32 Hz (aproximadamente 31 ms por inferencia) en RTX.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos en la información proporcionada. Sin embargo, se puede comparar cualitativamente con otros VLA como OpenVLA (7B parámetros) o RT-2, que son mucho más grandes y requieren hardware más potente. TurboVLA destaca por su eficiencia, pero no hay benchmarks publicados en este repositorio.

## Limitaciones y advertencias

- Entrenado para una tarea específica: solo funciona para la tarea "Pick and place Frazier to blue basket" y puede no generalizar a otras tareas sin reentrenamiento.
- Dependencia del dataset: el rendimiento depende de la calidad y variedad del dataset de entrenamiento (100 episodios).
- Sin resultados de evaluación: no hay métricas de éxito en el mundo real publicadas.
- Requiere hardware específico: necesita un robot `so_follower` y cámaras configuradas según las especificaciones.
- Idioma de las instrucciones: el dataset está en inglés, por lo que las instrucciones deben estar en ese idioma.
- Licencia Apache 2.0: permite uso comercial, pero se debe atribuir la autoría.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/seriintan/turbovla_frazier_smoketest
- Paper TurboVLA: https://arxiv.org/html/2607.27205
- LeRobot: https://github.com/huggingface/lerobot
- Dataset: https://huggingface.co/datasets/seriintan/frazier_dataset_20260901_151518
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
