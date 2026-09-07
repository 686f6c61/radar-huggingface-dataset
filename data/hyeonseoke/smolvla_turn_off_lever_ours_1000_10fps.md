# HyeonseokE/smolvla_turn_off_lever_ours_1000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, diseñado para controlar robots mediante aprendizaje por imitación. Esta variante concreta ha sido desarrollada por HyeonseokE y es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset de 100 episodios recopilados en un robot SO-101, con el objetivo de ejecutar la tarea de apagar una palanca hasta que el indicador de estado se ponga en rojo. El modelo pertenece a la familia SmolVLA, presentada en el paper 2506.01844, que busca ofrecer un rendimiento competitivo en tareas de manipulación a un coste computacional reducido, permitiendo su despliegue en hardware de consumo.

Con un total de 450.046.176 parámetros y un peso de 0,9 GB, este modelo es una alternativa ligera frente a otros VLA de mayor tamaño. Su pipeline es de robótica, se distribuye bajo licencia Apache 2.0 y utiliza el formato de pesos safetensors. La longitud de contexto no está especificada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer) |
| Parametros totales | 450.046.176 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción basado en transformer que combina un codificador visual, un componente de lenguaje y una cabeza de acción. En esta versión, el modelo se ha afinado a partir del modelo base `lerobot/smolvla_base` utilizando el dataset `HyeonseokE/turn_off_lever_ours_10fps`, que contiene 100 episodios y 21.682 fotogramas a 10 FPS. La tarea de entrenamiento se describe en lenguaje natural: "Turn the lever off; the status indicator should turn red."

El entrenamiento se realizó con la librería LeRobot 0.6.0, con 16.900 pasos, tamaño de lote de 64, optimizador AdamW, tasa de aprendizaje de 0,0001 y semilla 1000. No se mencionan técnicas de alineación como RLHF o DPO, ya que el modelo está orientado a generar acciones de control en lugar de texto libre.

## Capacidades

- Generación de acciones de control de 6 dimensiones a partir de observaciones del estado del robot.
- Procesamiento de imágenes de 256x256 procedentes de tres cámaras, aunque la configuración del robot menciona cámaras `top` y `left_wrist`.
- Condicionamiento por tarea en lenguaje natural, lo que permite especificar la tarea mediante el argumento `--task` en el comando de ejecución.
- Adaptado para el robot SO-101 en configuración follower, con salidas de acción tanto en formato genérico (`action`) como específico (`action.radian_urdf0`).
- Sin soporte de tool calling ni de razonamiento multi-paso.
- Sin capacidades multilingües documentadas.

## Casos de uso

- Automatización de tareas industriales: el modelo puede ejecutar la operación de apagar una palanca, una acción frecuente en mantenimiento de maquinaria, integrado en un brazo robótico SO-101 con retroalimentación visual.
- Investigación en aprendizaje por imitación: sirve como modelo de referencia compacto para comparar algoritmos de recopilación de datos, entrenamiento de políticas y evaluación en tareas de manipulación.
- Prototipado en robótica de bajo coste: al tener 450 millones de parámetros y un tamaño de 0,9 GB, se puede desplegar en GPUs de consumo para pruebas de laboratorio.
- Transferencia a nuevas tareas: mediante LeRobot, el modelo puede afinarse sobre otros datasets de manipulación, como recoger objetos o accionar interruptores, siempre que se mantenga la configuración de cámaras.
- Simulación a real: el dataset fue recopilado en un entorno de simulación con Isaac Sim/IsaacLab, lo que permite evaluar la política en simulación antes de su despliegue en el robot real.
- Educación en robótica: los estudiantes pueden utilizar este modelo como ejemplo práctico de un VLA entrenado con imitación, siguiendo la guía de LeRobot para entrenamiento y rollout.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks ni evaluaciones reales para este modelo en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450.046.176 parámetros, los pesos en fp16 ocupan aproximadamente 0,9 GB. Se recomienda una GPU con al menos 2 GB de VRAM, aunque es preferible disponer de 4 GB o más para margen.
- GPU recomendadas: tarjetas consumer como NVIDIA RTX 3060 o superiores son suficientes para la inferencia.
- El modelo cabe en GPUs de consumo.
- Opciones de despliegue: LeRobot, mediante los comandos `lerobot-rollout` para ejecutar la política y `lerobot-train` para entrenar o afinar el modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa en los datos proporcionados. El modelo es una versión afinada del modelo base `lerobot/smolvla_base`, que pertenece a la familia SmolVLA, diseñada como alternativa compacta a modelos VLA de mayor tamaño. Sin embargo, no se han facilitado resultados de benchmarks ni comparaciones directas en este repositorio.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación, por lo que el rendimiento real en el robot no está validado.
- El modelo está entrenado exclusivamente para la tarea de apagar una palanca, lo que limita su generalización a otras tareas sin un nuevo fine-tuning.
- La configuración de cámaras y tipo de robot es específica (SO-101, cámaras `top` y `left_wrist`); el uso en otros robots o con otras cámaras puede degradar el rendimiento.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No hay información sobre sesgos, alucinaciones o comportamientos no deseados; en robótica, el riesgo principal es la ejecución incorrecta de acciones que puedan causar daños físicos.
- La licencia Apache 2.0 permite uso comercial, pero no incluye garantías de seguridad ni de rendimiento en entornos de producción.

## Enlaces

- Modelo: https://huggingface.co/HyeonseokE/smolvla_turn_off_lever_ours_1000_10fps
- Paper: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/turn_off_lever_ours_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- LeRobot: https://github.com/huggingface/lerobot
