# kob0105/act_whiteball_blackboard_NoIR_70ep_Next

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición acumulado en tareas de manipulación robótica. Este repositorio concreto, `kob0105/act_whiteball_blackboard_NoIR_70ep_Next`, es una política entrenada con LeRobot 0.6.1 sobre un robot `so_follower` con dos cámaras (global y palm) para la tarea "pick place white ball" (recoger y colocar una bola blanca).

El modelo resuelve el problema de control visuomotor de un brazo robótico: recibe el estado de las articulaciones (vector de 6 dimensiones) y dos imágenes RGB de 480x640, y emite un vector de acción de 6 dimensiones. Es relevante como ejemplo reproducible de entrenamiento de políticas de imitación de extremo a extremo con hardware asequible (el robot SO-100/SO-101 de bajo coste), y como punto de partida para quien quiera replicar el pipeline de LeRobot.

La arquitectura es un transformer ACT con aproximadamente 51,7 millones de parámetros totales, entrenado durante 25.000 pasos con batch de 8 y learning rate de 1e-5 sobre un dataset pequeño de 8 episodios y 4.212 frames a 30 FPS. El repositorio ocupa 0,2 GB y los pesos están en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica como texto "pick place white ball") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación en robótica. El modelo procesa observaciones multimodales (estado de articulaciones de 6 dimensiones e imágenes de dos cámaras de 3x480x640) y genera un chunk de acciones de 6 dimensiones. La innovación principal del método, descrita en el paper arXiv:2304.13705, es predecir secuencias de acciones en lugar de acciones individuales, lo que mitiga el problema de acumulación de errores en tareas de manipulación de horizonte largo.

El entrenamiento se realizó con LeRobot 0.6.1 durante 25.000 pasos, con batch size de 8, optimizador AdamW, learning rate de 1e-5 y semilla 1000. El dataset de entrenamiento (`kob0105/record_test_new_whiteball_blackboard_NoIR_20261019_132503`) contiene 8 episodios y 4.212 frames grabados a 30 FPS mediante teleoperación. No se especifica en la información disponible si hubo aumento de datos, regularización o técnicas adicionales más allá de la configuración estándar de ACT.

## Capacidades

- Control visuomotor de un robot `so_follower` a partir de dos cámaras (global y palm) y el estado de las articulaciones.
- Predicción de chunks de acciones de 6 dimensiones para la tarea "pick place white ball".
- Aprendizaje por imitación a partir de datos de teleoperación (no requiere refuerzo ni recompensas explícitas).
- Ejecución en tiempo real mediante el comando `lerobot-rollout` con estrategia base.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto; el único texto de entrada es la descripción de la tarea.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Recogida y colocación de objetos en línea de montaje: la política ejecuta la tarea "pick place white ball" sobre un robot SO-100/SO-101, adecuada para demostrar automatización de manipulación pick-and-place con hardware de bajo coste.
- Prototipado de pipelines de aprendizaje por imitación: sirve como referencia reproducible para validar la instalación de LeRobot, la calibración de cámaras y el flujo `lerobot-train` → `lerobot-rollout`.
- Investigación en manipulación robótica: permite estudiar el efecto del número de episodios (8 en este caso) y de los pasos de entrenamiento (25.000) en la tasa de éxito de ACT.
- Docencia y formación: ejemplo didáctico de entrenamiento de una política visuomotora de 51,7 M de parámetros que cabe en una GPU de consumo.
- Base para fine-tuning en tareas similares: punto de partida para adaptar ACT a otras tareas de pick-and-place con el mismo robot y configuración de cámaras.
- Evaluación de robustez ante cambios de iluminación o posición de objetos: al ser una política entrenada con datos limitados, permite medir la degradación en condiciones fuera de distribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (51,7 M de parámetros, ~0,2 GB de pesos en safetensors); con overhead de activaciones y dos cámaras a 480x640, el consumo real es de pocos GB.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1660 en adelante).
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), con soporte de CUDA mediante `--policy.device=cuda`.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependen del robot, la frecuencia de control (30 FPS en los datos) y la GPU utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_whiteball_blackboard_NoIR_70ep_Next (este) | 51,7 M | no aplica | Pick place white ball con so_follower | apache-2.0 | HuggingFace |
| Otras políticas ACT en LeRobot Hub | variable | no aplica | Manipulación genérica | variable | HuggingFace |
| Políticas Diffusion Policy | variable | no aplica | Manipulación visuomotora | variable | HuggingFace / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- Entrenada con solo 8 episodios y 4.212 frames: alta probabilidad de sobreajuste y baja generalización a posiciones, iluminación o fondos distintos a los del dataset.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito en el robot real.
- Específica para el robot `so_follower` y la configuración exacta de cámaras (`global`, `palm` a 480x640 y 30 FPS); no es portable a otros robots sin reentrenamiento.
- La tarea está limitada a "pick place white ball"; no resuelve otras tareas de manipulación.
- Riesgo de alucinación en el sentido de acciones incorrectas o inseguras cuando la observación se sale de la distribución de entrenamiento.
- No es un modelo de lenguaje: no procesa instrucciones en lenguaje natural más allá de la etiqueta de tarea.
- Licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- El dataset de entrenamiento y el modelo están fechados en 2026 según los metadatos; verificar la vigencia de los enlaces y la compatibilidad con la versión actual de LeRobot antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kob0105/act_whiteball_blackboard_NoIR_70ep_Next
- Dataset de entrenamiento: https://huggingface.co/datasets/kob0105/record_test_new_whiteball_blackboard_NoIR_20261019_132503
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kob0105/record_test_new_whiteball_blackboard_NoIR_20261019_132503
