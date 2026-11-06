# ROA157/readorstop_hj_model

## Resumen

`ROA157/readorstop_hj_model` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. Lo publica el usuario ROA157 en Hugging Face Hub mediante la librería LeRobot de Hugging Face, y está entrenado sobre un dataset propio de 50 episodios teleoperados (71.961 fotogramas a 30 FPS) para un robot de tipo `omx_follower` equipado con tres cámaras (muñeca, lateral y superior).

El modelo no es un LLM ni un modelo de lenguaje: es un controlador visuomotor de aproximadamente 51,7 millones de parámetros (pesos en safetensors, 0,2 GB) que consume el estado articular de 6 dimensiones y tres imágenes RGB de 480x640, y emite un vector de acción de 6 dimensiones. Su relevancia es la de un ejemplo práctico y reproducible de entrenamiento de políticas con LeRobot: arquitectura ACT, licencia Apache 2.0 y un pipeline completo de entrenamiento e inferencia documentado.

Se trata de un artefacto de investigación de nicho, con cero descargas y cero likes en el momento de la consulta, sin resultados de evaluación publicados y sin especificación de tarea en el dataset. No debe confundirse con un modelo de propósito general: su ámbito es exclusivamente el control del robot concreto para el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija: estado de 6 dims + 3 imagenes de 3x480x640) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Entradas | `observation.state` (6,), `observation.images.wrist_cam` (3,480,640), `observation.images.side_cam` (3,480,640), `observation.images.top_cam` (3,480,640) |
| Salidas | `action` (6,) |
| Tipo de robot | `omx_follower` |
| Libreria | lerobot 0.5.2 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La política combina un codificador visual (procesa tres cámaras RGB de 480x640) con un transformer que fusiona la observación visual y el estado propioceptivo de 6 dimensiones para predecir *chunks* de acciones, es decir, secuencias cortas de comandos en lugar de un único paso. Esta predicción por fragmentos reduce el error de acumulación y suele mejorar la tasa de éxito frente a políticas paso a paso. El modelo tiene 51.668.614 parámetros y se distribuye en safetensors.

El entrenamiento se realizó con LeRobot 0.5.2 sobre el dataset `ROA157/readorstop_hj`: 50 episodios, 71.961 fotogramas a 30 FPS, con tres cámaras sincronizadas. La configuración reportada es de 5.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el número total de tokens ni composición del dataset, ni si hubo RLHF/DPO (no aplica en aprendizaje por imitación). El campo de tarea del dataset está vacío, por lo que no se especifica qué habilidad concreta aprende la política.

## Capacidades

- Control visuomotor de un robot `omx_follower` a partir de tres cámaras y el estado articular de 6 dimensiones.
- Predicción de *action chunks*: emite secuencias cortas de acciones de 6 dimensiones.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Ejecución en bucle cerrado mediante `lerobot-rollout` con estrategia base (sin grabación de episodios).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- **Automatización de una tarea de manipulación concreta**: replicar la habilidad aprendida del dataset (sin especificar) en el robot `omx_follower` con las mismas tres cámaras y la misma disposición física; es adecuado porque la política está entrenada exactamente para esa configuración.
- **Prototipado rápido de políticas de imitación**: servir como punto de partida o referencia para equipos que quieran entrenar su propio modelo ACT con LeRobot, reutilizando el comando `lerobot-train` documentado.
- **Investigación en aprendizaje por imitación**: analizar el comportamiento de ACT con 50 episodios y 5.000 pasos como caso de estudio de régimen de datos reducido.
- **Validación de pipelines de despliegue LeRobot**: probar el flujo `lerobot-rollout` con `--strategy.type=base` y `--duration` para verificar la integración hardware-software antes de entrenar políticas propias.
- **Reproducción de experimentos**: al fijar semilla (1000), learning rate (1e-05) y batch size (8), permite reproducir el entrenamiento sobre el dataset público `ROA157/readorstop_hj`.
- **Docencia y demostraciones**: ejemplo mínimo (0,2 GB, 51,7 M de parámetros) para ilustrar el ciclo completo de teleoperación, grabación, entrenamiento y despliegue en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: «No evaluation results have been provided for this policy yet». No hay tasas de éxito, número de ensayos ni métricas de latencia o throughput.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial; por el tamaño del repositorio (0,2 GB) y los 51,7 M de parámetros, la inferencia cabe holgadamente en GPUs de consumo, aunque no se publica una cifra medida.
- **GPU recomendadas**: no disponible; el comando de entrenamiento documentado usa `--policy.device=cuda`, sin especificar modelo de GPU.
- **GPU de consumo**: previsiblemente compatible con tarjetas consumer por el reducido tamaño del modelo, si bien no hay confirmación oficial ni requisitos mínimos publicados.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento), con soporte de CUDA. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- **Latencia y throughput**: no disponibles. La captura se realiza a 30 FPS con cámaras OpenCV de 640x480, pero no se reporta latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ROA157/readorstop_hj_model` (ACT) | 51,7 M | Estado 6 dims + 3 imagenes 480x640 | Control `omx_follower` | Apache 2.0 | Hugging Face (0 descargas) |
| Otras políticas ACT en LeRobot Hub | no disponible | no disponible | Manipulación genérica | variable | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | no disponible | no disponible | Manipulación genérica | variable | Hugging Face |
| Políticas VLA tipo pi0 / OpenVLA | no disponible | no disponible | Manipulación generalista | variable | Hugging Face |

No se dispone de datos comparativos de rendimiento entre este modelo y alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- **Sin evaluación publicada**: no hay tasas de éxito ni validación en robot real; el rendimiento es desconocido.
- **Tarea no especificada**: el campo `Task(s)` del dataset está vacío, por lo que no se sabe qué habilidad concreta ha aprendido la política.
- **Acoplamiento al hardware**: entrenada para el robot `omx_follower` con tres cámaras concretas (`wrist_cam`, `side_cam`, `top_cam`); no es transferible a otra configuración sin reentrenamiento.
- **Dataset reducido**: 50 episodios y 5.000 pasos de entrenamiento; riesgo de sobreajuste y baja generalización a posiciones, iluminación o distractores distintos.
- **Sin capacidades de lenguaje**: no admite instrucciones en lenguaje natural, tool calling ni razonamiento; su uso está limitado al control motor.
- **Riesgo de alucinación**: no aplica en el sentido de LLM, pero sí existe riesgo de acciones erróneas o inseguras en el robot; se recomienda supervisión y parada de emergencia.
- **Licencia Apache 2.0**: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- **Fecha de creación futura** (2026-11-04) en los metadatos del Hub, lo que puede indicar un artefacto de prueba o un error de marcado temporal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ROA157/readorstop_hj_model
- Dataset de entrenamiento: https://huggingface.co/datasets/ROA157/readorstop_hj
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de aprendizaje por imitación: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ROA157/readorstop_hj
