# MakinoKF/rebot_pick_multiple_nut_dataset_20261111_093013_act-policy-v1

## Resumen

Este repositorio contiene una política de imitación entrenada con el método ACT (Action Chunking with Transformers) mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor para un brazo robótico concreto, el `rebot_b601_follower`, que aprende a ejecutar la tarea "pick the nut" a partir de demostraciones teleoperadas. El modelo consume el estado articular de 7 dimensiones y dos cámaras RGB (vistas `top` y `right`, 480x640) y produce un vector de acción de 7 dimensiones.

La arquitectura es un transformer encoder-decoder con cabeza de predicción de chunks de acciones, según el paper ACT (arXiv:2304.13705). El checkpoint tiene 51.670.663 parámetros y ocupa unos 0,2 GB en formato safetensors, lo que lo hace extremadamente ligero para inferencia en tiempo real a 30 FPS. Se entrenó durante 20.000 pasos con batch de 32 y AdamW a un learning rate de 1e-5 sobre un dataset propio de 35 episodios y 5.473 frames.

Su relevancia es acotada y práctica: sirve como ejemplo reproducible de un pipeline completo de imitation learning en LeRobot (grabación, entrenamiento, rollout) y como política base para una celda de pick-and-place de un objeto concreto. No es un modelo generalista ni transferible a otras tareas sin reentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), encoder-decoder transformer con predicción de chunks de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana temporal de observaciones definida por la configuración de ACT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |
| Tipo de robot | `rebot_b601_follower` |
| Cámaras de entrada | `top`, `right` (RGB, 3x480x640 cada una) |
| Entrada de estado | `observation.state` de forma (7,) |
| Salida de acción | `action` de forma (7,) |
| Frecuencia de datos | 30 FPS |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de imitation learning que, en lugar de predecir una única acción por paso, predice un chunk de acciones futuras de una sola pasada. Esto reduce el error de compounding y suaviza el control. La implementación de LeRobot combina un encoder visual (procesa las dos cámaras), un encoder del estado articular y un decoder transformer que genera el chunk de acciones. El checkpoint tiene 51,67 M de parámetros, coherente con una política ligera pensada para inferencia en tiempo real.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `MakinoKF/rebot_pick_multiple_nut_dataset_20261111_093013`: 35 episodios, 5.473 frames a 30 FPS, una única tarea ("pick the nut"). Configuración: 20.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-5, semilla 1000. No se documenta composición adicional del dataset, aumentos de datos, ni uso de RLHF/DPO (no aplica en imitation learning). No hay innovaciones técnicas declaradas más allá del propio método ACT.

## Capacidades

- Control visomotor de un brazo robótico `rebot_b601_follower` para la tarea "pick the nut".
- Predicción de chunks de acciones de 7 dimensiones a partir de estado articular (7,) y dos vistas RGB.
- Fusión de dos cámaras (`top` y `right`) para estimación de la posición del objeto.
- Ejecución en bucle cerrado a 30 FPS mediante `lerobot-rollout`.
- No soporta tool calling, function calling ni agentes multi-paso.
- No tiene capacidades multilingües, de razonamiento, código, matemáticas, visión general, audio ni thinking mode.
- No es un modelo generalista: la política está especializada en una única tarea y un único robot.

## Casos de uso

- Recogida automatizada de tuercas en una celda de pick-and-place: el modelo ejecuta la tarea "pick the nut" sobre el robot `rebot_b601_follower` con las cámaras calibradas, adecuado por su entrenamiento específico y su latencia baja a 30 FPS.
- Base para fine-tuning con nuevos objetos: sirve como punto de partida para reentrenar ACT con un dataset ampliado (más posiciones, iluminación o distracciones) usando `lerobot-train`.
- Validación de pipelines de imitation learning: útil como referencia reproducible para verificar la instalación de LeRobot, la calibración de hardware y el flujo de rollout antes de abordar tareas más complejas.
- Benchmark interno de éxito de agarre: permite medir tasas de éxito en una tarea sencilla y comparar con variantes entrenadas con más episodios o distinta configuración.
- Docencia y demos de robótica: su tamaño (0,2 GB, 51,67 M de parámetros) permite desplegarlo en equipos modestos para demostraciones en aula o laboratorio.
- Integración en entornos de investigación de manipulación: como política de referencia para comparar contra otros métodos de imitation learning (Diffusion Policy, VQ-BeT) en la misma celda y robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,67 M de parámetros y pesos safetensors de ~0,2 GB, cabe holgadamente en GPUs de 4-8 GB e incluso en CPU para inferencia a baja frecuencia.
- GPU recomendadas: cualquier GPU con soporte CUDA (RTX 3060, RTX 4090, A100, H100); para 30 FPS no se requiere hardware de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 20xx en adelante) e incluso en iGPU con suficiente margen.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--strategy.type=base`; el resto del stack es PyTorch.
- Latencia y throughput estimados: no disponibles de forma oficial; el diseño apunta a control en tiempo real a 30 FPS, pero no se documentan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ACT, LeRobot) | 51,67 M | no aplica | "pick the nut" en `rebot_b601_follower` | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| Diffusion Policy (referencia del paper) | no disponible | no aplica | Manipulación robótica general | MIT (repo original) | Repositorio oficial y checkpoints en LeRobot |
| VQ-BeT (referencia de LeRobot) | no disponible | no aplica | Manipulación robótica | MIT (repo original) | Implementado en LeRobot |
| Otras políticas ACT en LeRobot Hub | variable | no aplica | Tareas específicas por dataset | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo para este checkpoint concreto, por lo que la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: entrenado solo para "pick the nut" con 35 episodios; no generaliza a otros objetos, posiciones ni robots sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito en robot real.
- Dependencia de calibración: el rendimiento depende de la correcta calibración del robot `rebot_b601_follower` y de las cámaras `top` y `right`; nombres e índices de cámara deben coincidir con los usados en entrenamiento.
- Sensibilidad a cambios de dominio: iluminación, fondo, posición del objeto o distracciones no representadas en los 5.473 frames pueden degradar el comportamiento.
- Dataset pequeño: 35 episodios es una base limitada; el riesgo de sobreajuste y de fallos en el agarre es alto fuera de las condiciones de grabación.
- Sin capacidades lingüísticas ni de razonamiento: no debe emplearse como modelo de texto ni integrarse en pipelines de NLP.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; verificar la licencia del dataset asociado antes de redistribuir.
- Riesgo de alucinación no aplica en el sentido de NLP, pero sí existe riesgo de acciones erróneas o inseguras en el robot; se recomienda supervisión y paradas de emergencia.
- Sin información sobre sesgos: no disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MakinoKF/rebot_pick_multiple_nut_dataset_20261111_093013_act-policy-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/MakinoKF/rebot_pick_multiple_nut_dataset_20261111_093013
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MakinoKF/rebot_pick_multiple_nut_dataset_20261111_093013
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
