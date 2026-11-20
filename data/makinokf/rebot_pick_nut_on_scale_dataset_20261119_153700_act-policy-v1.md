# MakinoKF/rebot_pick_nut_on_scale_dataset_20261119_153700_act-policy-v1

## Resumen

Esta ficha describe una política de robótica entrenada con el método Action Chunking with Transformers (ACT), publicada por el usuario MakinoKF en Hugging Face bajo el identificador `rebot_pick_nut_on_scale_dataset_20261119_153700_act-policy-v1`. No se trata de un modelo de lenguaje, sino de una política de imitación (imitation learning) que aprende a controlar un brazo robótico a partir de datos de teleoperación. El modelo resuelve una tarea concreta: recoger una tuerca ("pick the nut") con un robot `rebot_b601_follower` equipado con dos cámaras (`top` y `left`).

La arquitectura subyacente es ACT, presentada en el paper arXiv 2304.13705, un transformer que predice fragmentos de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en manipulación real. El modelo cuenta con 51.670.663 parámetros y se distribuye en formato safetensors dentro de la librería LeRobot.

Su relevancia es acotada pero real: es un ejemplo reproducible y ligero de cómo LeRobot permite entrenar y desplegar políticas de imitación en hardware real con un coste computacional moderado, sirviendo como referencia para investigadores y desarrolladores que quieran replicar el flujo de trabajo en sus propios robots.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 51.670.663 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer de imitación que, a partir de observaciones (estado del robot y dos imágenes de 3x480x640), predice un chunk de acciones de forma (7,) por paso. La entrada de estado es un vector de 7 dimensiones y la salida de acción también es de 7 dimensiones, correspondiente a los grados de libertad del robot `rebot_b601_follower`. El modelo se entrenó con 30.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-05 y semilla 1000, usando LeRobot 0.6.0.

El dataset de entrenamiento (`MakinoKF/rebot_pick_nut_on_scale_dataset_20261119_153700`) contiene 120 episodios y 29.539 frames a 30 FPS para la tarea "pick the nut". No se especifica en la información disponible si hubo aumento de datos, regularización adicional ni técnicas de RLHF/DPO (no aplicables en este contexto de imitación). La innovación principal es el propio mecanismo de action chunking, que predice secuencias cortas de acciones para reducir el error acumulado.

## Capacidades

- Control robótico de manipulación para la tarea específica de recoger una tuerca.
- Percepción visual multimodal a partir de dos cámaras (`top` y `left`) con resolución 480x640.
- Predicción de acciones de 7 dimensiones compatibles con el robot `rebot_b601_follower`.
- Ejecución de políticas de imitación en tiempo real a 30 FPS.
- Integración con el ecosistema LeRobot para rollout y entrenamiento.
- No soporta tool calling, agentes multi-paso, razonamiento lingüístico ni capacidades multilingües.

## Casos de uso

- Replicación de experimentos de imitación: investigadores pueden descargar la política y reproducir el flujo de entrenamiento con LeRobot para validar resultados en su propio hardware `rebot_b601_follower`.
- Automatización de una celda de montaje concreta: el modelo puede ejecutar la tarea de recoger tuercas en un entorno controlado, sirviendo como base para prototipos de pick-and-place.
- Benchmark de referencia para ACT: al ser un modelo pequeño (51,7 M de parámetros) y con licencia Apache 2.0, es útil como línea base para comparar nuevas políticas en la misma tarea.
- Formación y docencia: ejemplo didáctico de pipeline completo (grabación de datos, entrenamiento, rollout) con LeRobot.
- Pruebas de integración hardware-software: validar la calibración de cámaras y del robot `rebot_b601_follower` antes de escalar a tareas más complejas.
- Desarrollo de variantes: punto de partida para fine-tuning con datasets propios de tareas similares (por ejemplo, otras piezas pequeñas) reutilizando la arquitectura ACT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (51,7 M de parámetros) es previsible que quepa en GPUs consumer con pocos GB, pero no se confirma en la información.
- GPU recomendadas: no disponible; el entrenamiento se realizó con `--policy.device=cuda`, sin especificar modelo de GPU.
- Compatibilidad con GPU consumer: probable por el tamaño reducido, pero no confirmada.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte para cámaras OpenCV a 640x480 y 30 FPS.
- Latencia y throughput: no disponibles; la frecuencia de operación del dataset es 30 FPS.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | 51,7 M | no aplica | pick the nut (rebot_b601_follower) | Apache 2.0 | Hugging Face |
| ACT original (paper 2304.13705) | no disponible | no aplica | manipulación genérica | no disponible | paper |
| Otras políticas LeRobot (p. ej. Diffusion Policy) | no disponible | no aplica | manipulación genérica | no disponible | Hugging Face / LeRobot |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico para una única tarea ("pick the nut") y un único tipo de robot (`rebot_b601_follower`); no es generalizable a otras tareas sin reentrenamiento.
- Sin resultados de evaluación publicados: no se conoce la tasa de éxito real en robot.
- Depende de la configuración exacta de cámaras (`top`, `left`) y de sus nombres; un cambio de montaje o calibración puede degradar el rendimiento.
- Riesgo de sobreajuste al dataset de 120 episodios; la variabilidad de posiciones, iluminación y distractores no está documentada.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación limita su uso en producción sin validación previa.
- No dispone de capacidades lingüísticas, de razonamiento ni de tool calling; no debe confundirse con un LLM.
- No se documentan sesgos ni limitaciones idiomáticas por tratarse de un modelo de robótica.

## Enlaces

- Hugging Face: https://huggingface.co/MakinoKF/rebot_pick_nut_on_scale_dataset_20261119_153700_act-policy-v1
- Dataset: https://huggingface.co/datasets/MakinoKF/rebot_pick_nut_on_scale_dataset_20261119_153700
- Paper ACT: https://huggingface.co/papers/2304.13705
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MakinoKF/rebot_pick_nut_on_scale_dataset_20261119_153700
