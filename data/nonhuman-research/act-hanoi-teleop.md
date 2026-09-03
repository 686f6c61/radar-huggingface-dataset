# NONHUMAN-RESEARCH/act-hanoi-teleop

## Resumen

El modelo `NONHUMAN-RESEARCH/act-hanoi-teleop` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por NONHUMAN-RESEARCH y publicada en el Hub de Hugging Face bajo licencia Apache 2.0. Está entrenada con el framework LeRobot (versión 0.6.2) sobre un dataset de teleoperación (`murobotics/tblock-all-piper-clean-bi_piper_follower`) y está diseñada para controlar un robot bimanual en una tarea de manipulación, probablemente relacionada con la torre de Hanoi, como sugiere el nombre del repositorio.

El modelo tiene 51.685.006 parámetros y consume observaciones de tres cámaras (izquierda, superior y derecha) junto con el estado del robot (14 dimensiones), y produce acciones de control de 14 dimensiones. Es un ejemplo de aplicación de ACT, un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación fina. Su relevancia radica en que demuestra un pipeline completo de entrenamiento y despliegue de políticas robóticas con herramientas open source, accesible para la comunidad investigadora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - transformer con VAE condicional |
| Parametros totales | 51.685.006 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper [Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware](https://arxiv.org/abs/2304.13705). La arquitectura combina un transformer con un autoencoder variacional condicional (CVAE) para modelar la variabilidad de las demostraciones humanas. El modelo recibe observaciones multimodales (imágenes de tres cámaras y estado del robot) y genera un chunk de acciones futuras, lo que reduce la acumulación de errores durante la ejecución.

El entrenamiento se realizó con el framework LeRobot, utilizando el dataset `murobotics/tblock-all-piper-clean-bi_piper_follower`, que contiene demostraciones teleoperadas de un robot bimanual. La configuración de entrenamiento incluye 20.000 pasos, batch size de 32, optimizador AdamW con learning rate de 0,00015 y semilla 1000. No se especifica el número de tokens ni la composición exacta del dataset, pero al ser un modelo de robótica, el entrenamiento se basa en datos de estado e imágenes, no en texto.

## Capacidades

- Control robótico bimanual: genera acciones de 14 dimensiones (posiblemente 7 grados de libertad por brazo) a partir de observaciones visuales y de estado.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas, sin necesidad de programación explícita de la tarea.
- Percepción multimodal: integra tres flujos de imagen (izquierda, superior y derecha) con el estado propioceptivo del robot.
- Predicción por chunks: emite secuencias de acciones (action chunking) que mejoran la suavidad y robustez del movimiento.
- Específico para la tarea de la torre de Hanoi: el nombre del repositorio sugiere que está entrenado para manipular discos en una torre de Hanoi, aunque no se confirma en la model card.
- Compatible con LeRobot: se puede ejecutar y evaluar mediante las herramientas CLI de LeRobot (`lerobot-rollout`, `lerobot-train`).

## Casos de uso

- Investigación en manipulación robótica: el modelo sirve como punto de partida para estudiar el rendimiento de ACT en tareas de precisión bimanual, como apilar o mover objetos pequeños.
- Automatización de tareas de ensamblaje: en entornos de laboratorio, puede transferirse a tareas similares de manipulación fina, como insertar piezas o apilar componentes, siempre que se reentrene con datos específicos.
- Evaluación de políticas de imitación: permite comparar la eficacia de ACT frente a otros métodos (por ejemplo, Diffusion Policy) en un hardware de bajo coste.
- Desarrollo de sistemas de teleoperación: el pipeline de entrenamiento con LeRobot puede reutilizarse para crear nuevas políticas a partir de demostraciones humanas en otros dominios.
- Educación y prototipado: al ser un modelo pequeño (51,7M de parámetros) y con licencia Apache 2.0, es adecuado para cursos de robótica y experimentación en hardware asequible.
- Benchmarking de controladores: puede utilizarse como referencia para probar algoritmos de control, planificación de trayectorias o métodos de aprendizaje por refuerzo en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." Por tanto, no hay datos de tasa de éxito, precisión ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 51,7M de parámetros con entradas de imagen de 480x640, la inferencia puede ejecutarse en GPUs con al menos 4-6 GB de VRAM, aunque no hay datos oficiales. Una RTX 3060 o superior sería suficiente.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 30xx/40xx, A100, etc.). El entrenamiento se realizó con `--policy.device=cuda`, por lo que se asume uso de GPU.
- Compatibilidad con consumer GPU: sí, el tamaño del modelo y la carga de trabajo son manejables en GPUs de gama media.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) que cargan el modelo y ejecutan la política en el robot. También es posible exportar los pesos a otros formatos, aunque no se documenta.
- Latencia y throughput: no disponible. Depende del hardware y de la frecuencia de las cámaras (típicamente 30 fps).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas ACT para tareas de manipulación bimanual) dentro de la información proporcionada. Existen otros repositorios de políticas ACT en el Hub de Hugging Face, pero no se han incluido datos concretos para una comparación rigurosa. Se recomienda consultar el ecosistema LeRobot para encontrar modelos alternativos.

## Limitaciones y advertencias

- Sin resultados de evaluación: no hay evidencia de la tasa de éxito en el mundo real, por lo que su rendimiento en producción es incierto.
- Dependencia del dataset: el modelo está entrenado específicamente con el dataset `murobotics/tblock-all-piper-clean-bi_piper_follower`; su generalización a otras tareas o configuraciones de robot no está garantizada.
- Sesgos y alucinaciones: al ser un modelo de control, no genera texto, pero puede producir acciones erróneas si las observaciones difieren de las del entrenamiento (por ejemplo, cambios de iluminación, posición de objetos o calibración de cámaras).
- Limitaciones de contexto: no aplica, pero la ventana de observación está fijada por las dimensiones de entrada (imágenes de 480x640 y estado de 14 dimensiones).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe atribuir la autoría y mantener el aviso de licencia.
- Requisitos de calibración: para desplegar el modelo en un robot real, es necesario que las cámaras y el robot estén calibrados de acuerdo con las especificaciones del dataset (nombres de cámaras, resoluciones, etc.).

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/NONHUMAN-RESEARCH/act-hanoi-teleop)
- [Paper de ACT (arXiv:2304.13705)](https://arxiv.org/abs/2304.13705)
- [LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot sobre ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
