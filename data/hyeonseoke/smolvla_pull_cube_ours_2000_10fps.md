# HyeonseokE/smolvla_pull_cube_ours_2000_10fps

## Resumen

El modelo `HyeonseokE/smolvla_pull_cube_ours_2000_10fps` es un ajuste fino (fine-tuning) de SmolVLA, un modelo vision-language-action (VLA) compacto y eficiente desarrollado para aplicaciones robóticas. El autor, HyeonseokE, ha entrenado este modelo sobre el dataset `HyeonseokE/pull_cube_ours_10fps`, compuesto por 100 episodios y 32.039 fotogramas a 10 FPS, para la tarea de tirar de un cubo hasta un marcador objetivo.

La arquitectura combina la percepción visual y el estado del robot para generar comandos de acción directamente. Con 450.046.176 parámetros, es un modelo ligero en comparación con los grandes VLA, lo que permite su ejecución en hardware de consumo. Este fine-tuning parte del modelo base `lerobot/smolvla_base` y está publicado bajo licencia Apache 2.0, con los pesos en formato safetensors y la librería oficial de Hugging Face LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer) |
| Parametros totales | 450.046.176 (450,05 millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo compacto de tipo vision-language-action que, según su paper, consigue un rendimiento competitivo a un coste computacional reducido. La arquitectura está basada en transformadores y procesa entradas multimodales: el estado del robot (6 valores) e imágenes de cámaras de 256x256 píxeles. Para este fine-tuning, el modelo genera dos salidas de acción de 6 dimensiones (`action` y `action.radian_urdf0`).

El entrenamiento se ha realizado con LeRobot 0.6.0 sobre el dataset `HyeonseokE/pull_cube_ours_10fps`, que contiene 100 episodios de la tarea "Pull the cube to the target marker" a 10 FPS. La configuración de entrenamiento incluye 25.000 pasos, tamaño de lote 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 2000. No se ha aplicado RLHF, DPO ni ningún alineamiento posterior; la política se ha obtenido mediante aprendizaje por imitación de demostraciones.

## Capacidades

- Generación de acciones de 6 grados de libertad (posición y orientación) del efector final del robot.
- Entrada de estado del robot: vector de 6 valores (`observation.state`).
- Entrada visual: tres imágenes de 256x256 píxeles; según la model card, las cámaras del robot son `top` y `left_wrist`, aunque la tabla de entradas muestra tres entradas visuales (`camera1`, `camera2`, `camera3`).
- Compatibilidad con el ecosistema LeRobot para inferencia y entrenamiento mediante `lerobot-rollout` y `lerobot-train`.
- Tarea específica de manipulación: tirar de un cubo hasta un marcador objetivo.
- No ofrece tool calling ni function calling; no es un modelo de lenguaje general.
- No ofrece soporte de agentes ni razonamiento multi-paso como un LLM, pero su salida se usa directamente como control de bajo nivel.
- Capacidades multilingües: no aplicables.

## Casos de uso

- **Investigación en manipulación robótica**: el modelo puede desplegarse en un robot SO101 para aprender y evaluar la tarea de tirar de un cubo. Es útil en laboratorios que trabajan con el framework LeRobot.
- **Recolección de datos para aprendizaje por imitación**: ejecutando la política con `lerobot-rollout`, se pueden generar nuevos episodios de demostración que amplíen el dataset original.
- **Benchmarking de políticas de control**: permite comparar el rendimiento con otros fine-tunings de SmolVLA (por ejemplo, distintas semillas) bajo las mismas condiciones de hardware.
- **Despliegue en robots de bajo coste**: al ser un modelo de 450M de parámetros, puede ejecutarse en GPUs domésticas, lo que posibilita sistemas de robótica asequibles.
- **Automatización de tareas de logística y manufactura**: en entornos controlados donde un robot debe mover objetos a posiciones objetivo, la política puede integrarse con una cámara superior y una cámara en la muñeca para realizar el control visual.
- **Prototipado rápido de nuevas tareas**: al partir de SmolVLA base y entrenar sobre un conjunto reducido de datos, el modelo sirve como punto de partida para adaptar la política a objetivos similares con poco coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que aún no se han facilitado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada: con los pesos en fp16 que ocupan 0,9 GB, se estima un consumo de 1-2 GB para los pesos y 1-2 GB adicionales para activaciones e imágenes en un batch de tamaño 1. En total, una GPU con 4 GB de VRAM es suficiente para inferencia.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4090, A100 o H100 para entrenamiento. El paper de SmolVLA indica que puede desplegarse en hardware de consumo.
- ¿Cabe en GPU de consumo? Sí, cabe en RTX 3050/3060 y similares.
- Opciones de despliegue: inferencia con LeRobot (`lerobot-rollout --policy.path=HyeonseokE/smolvla_pull_cube_ours_2000_10fps`). También se puede entrenar con `lerobot-train`. No se recomienda vLLM, Ollama ni TGI, que no son compatibles con este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyeonseokE/smolvla_pull_cube_ours_2000_10fps (este) | 450.046.176 | no disponible | no disponible | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base (modelo base) | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |
| HyeonseokE/smolvla_pull_cube_cap_2000_10fps | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |
| HyeonseokE/smolvla_pull_cube_cap_3000_10fps | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- El modelo está especializado en una única tarea ("pull the cube to the target marker") y probablemente no generalice a otras tareas sin reentrenamiento.
- Depende de la configuración exacta de las cámaras y del robot SO101; cambios en la iluminación, posición de las cámaras o en el robot pueden degradar el rendimiento.
- No se han publicado resultados de evaluación en robot real, por lo que la fiabilidad de la política no está validada formalmente.
- El dataset de entrenamiento es reducido (100 episodios); es posible que la política tenga una baja robustez ante variaciones del entorno.
- La model card indica tres entradas visuales (`camera1`, `camera2`, `camera3`), pero solo se mencionan dos cámaras (`top` y `left_wrist`); esta discrepancia debe aclararse antes de desplegar el modelo.
- Al ser un modelo de aprendizaje por imitación, puede heredar los sesgos de las demostraciones utilizadas para entrenarlo.
- Riesgo de alucinación en el sentido de generación de acciones no deseadas si las observaciones están fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable de validar el comportamiento seguro del robot en su entorno.
- Limitaciones de idioma: no aplica, no se trata de un modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: [https://huggingface.co/HyeonseokE/smolvla_pull_cube_ours_2000_10fps](https://huggingface.co/HyeonseokE/smolvla_pull_cube_ours_2000_10fps)
- Paper de SmolVLA: [https://huggingface.co/papers/2506.01844](https://huggingface.co/papers/2506.01844)
- Dataset de entrenamiento: [https://huggingface.co/datasets/HyeonseokE/pull_cube_ours_10fps](https://huggingface.co/datasets/HyeonseokE/pull_cube_ours_10fps)
- Modelo base: [https://huggingface.co/lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- Repositorio de LeRobot: [https://github.com/huggingface/lerobot](https://github.com/huggingface/lerobot)
- Documentación de LeRobot: [https://huggingface.co/docs/lerobot/index](https://huggingface.co/docs/lerobot/index)
- Guía de SmolVLA en LeRobot: [https://huggingface.co/docs/lerobot/main/en/smolvla](https://huggingface.co/docs/lerobot/main/en/smolvla)
- Espacio de visualización del dataset: [https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/pull_cube_ours_10fps](https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/pull_cube_ours_10fps)
- Variantes comparables: [HyeonseokE/smolvla_pull_cube_cap_2000_10fps](https://huggingface.co/HyeonseokE/smolvla_pull_cube_cap_2000_10fps) y [HyeonseokE/smolvla_pull_cube_cap_3000_10fps](https://huggingface.co/HyeonseokE/smolvla_pull_cube_cap_3000_10fps)
