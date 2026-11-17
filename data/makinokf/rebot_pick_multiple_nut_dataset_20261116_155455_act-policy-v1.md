# MakinoKF/rebot_pick_multiple_nut_dataset_20261116_155455_act-policy-v1

## Resumen

`MakinoKF/rebot_pick_multiple_nut_dataset_20261116_155455_act-policy-v1` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en el Hub mediante la librería LeRobot de Hugging Face. No se trata de un modelo de lenguaje: es una política visuomotora que mapea observaciones (estado articular de 7 dimensiones más dos cámaras RGB de 480x640) a acciones de 7 dimensiones, pensada para controlar un brazo robótico de tipo `rebot_b601_follower`.

El modelo resuelve una tarea concreta y acotada: "pick the nut" (coger una tuerca). Se entrenó sobre un dataset de 149 episodios y 39.013 fotogramas a 30 FPS, recogidos mediante teleoperación. Con 51.670.663 parámetros y un repositorio de 0,2 GB, es un modelo compacto que cabe en GPUs de consumo y está diseñado para inferencia en tiempo real sobre hardware físico.

Su relevancia es práctica para quien trabaja en manipulación robótica con aprendizaje por imitación: sirve como referencia reproducible de un pipeline completo LeRobot (grabación de datos, entrenamiento ACT, despliegue con `lerobot-rollout`) y como punto de partida para tareas de pick-and-place con un robot concreto. La licencia Apache 2.0 facilita su reutilización y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de chunks de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por chunk de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso, predice un chunk de acciones corto. La arquitectura combina un backbone visual que procesa las dos cámaras (`top` y `right`, cada una con entrada `(3, 480, 640)`) con un transformer que fusiona las observaciones visuales y el estado articular `(7,)` para generar secuencias de acciones `(7,)`. El chunking mitiga el problema de horizonte de error típico de las políticas paso a paso y suele traducirse en tasas de éxito más altas en tareas de manipulación.

El entrenamiento se realizó con LeRobot 0.6.0 durante 100.000 pasos, con batch size 32, optimizador AdamW, learning rate 1e-05 y semilla 1000. El dataset de origen contiene 149 episodios y 39.013 fotogramas a 30 FPS de la tarea "pick the nut", recogidos por teleoperación sobre el robot `rebot_b601_follower`. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de ajuste posteriores al aprendizaje supervisado por imitación.

## Capacidades

- Control visuomotor de un brazo robótico de 7 grados de libertad a partir de dos cámaras RGB y del estado articular.
- Predicción de chunks de acciones para ejecución fluida en tiempo real a 30 FPS.
- Ejecución de la tarea de picking ("pick the nut") sobre el robot `rebot_b601_follower`.
- Aprendizaje por imitación a partir de datos de teleoperación, sin necesidad de recompensas ni entorno simulado.
- Despliegue mediante la CLI de LeRobot (`lerobot-rollout`) con estrategia base y duración configurable.
- Reentrenamiento reproducible con `lerobot-train` sobre el dataset asociado.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política robótica, no un modelo generativo de texto.

## Casos de uso

- **Automatización de picking en línea de montaje**: la política ejecuta la tarea "pick the nut" sobre el robot `rebot_b601_follower`; puede integrarse en una celda de montaje donde la recogida de tuercas sea un paso repetitivo, con la ventaja de que el modelo ya está entrenado para esa tarea y ese robot concretos.
- **Prototipado rápido de políticas con LeRobot**: sirve como ejemplo reproducible de pipeline completo (dataset, entrenamiento ACT, despliegue) para equipos que quieran validar su cadena de herramientas antes de invertir en datos propios.
- **Base para fine-tuning en tareas de pick-and-place**: partiendo de este checkpoint y del dataset asociado, se puede reentrenar con `lerobot-train` añadiendo episodios de nuevas posiciones de objeto o de nuevas piezas, aprovechando la infraestructura ya montada.
- **Investigación en aprendizaje por imitación**: útil para comparar ACT frente a otras políticas (diffusion policy, VLA) en un entorno físico controlado y con un dataset público de 149 episodios y 39.013 fotogramas.
- **Docencia y formación en robótica**: el repositorio incluye comandos de ejecución y entrenamiento, lo que permite montar prácticas de laboratorio donde el alumnado graba datos, entrena y despliega una política real.
- **Validación de hardware `rebot_b601_follower`**: sirve para verificar calibración de cámaras, puertos y cinemática del robot antes de desarrollar políticas más complejas, ya que el modelo espera exactamente las claves de observación `observation.images.top`, `observation.images.right` y `observation.state`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- **VRAM estimada**: con 51,7 millones de parámetros, los pesos en FP32 ocupan aproximadamente 0,2 GB; en FP16, unos 0,1 GB. La VRAM real vendrá dominada por los buffers de las dos cámaras a 480x640 y por el batch de inferencia, no por el modelo.
- **GPU recomendadas**: cualquier GPU con al menos 4-6 GB de VRAM es suficiente; se puede ejecutar en RTX 3060, RTX 4060, RTX 4090, A100 o H100 sin problema.
- **Cabe en GPU de consumo**: sí, en prácticamente cualquier GPU consumer moderna, e incluso en CPU para inferencia a baja frecuencia (no recomendado para control a 30 FPS).
- **Opciones de despliegue**: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- **Latencia y throughput**: no disponibles en la información proporcionada; el control se realiza a 30 FPS según la configuración del dataset y de las cámaras.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni comparaciones con otras políticas robóticas (diffusion policy, VLA, etc.), por lo que no es posible establecer una comparativa rigurosa con cifras.

## Limitaciones y advertencias

- **Especificidad de hardware**: la política está entrenada para el robot `rebot_b601_follower` y para las cámaras `top` y `right`; no funcionará correctamente en otro robot ni con otra disposición de cámaras sin reentrenamiento.
- **Tarea única**: solo se ha entrenado para "pick the nut"; no generaliza a otras piezas ni a otras tareas sin datos adicionales.
- **Sin evaluación publicada**: la model card indica que no hay resultados de éxito en robot real, por lo que se desconoce la tasa de éxito esperada y su robustez ante cambios de iluminación, posiciones o distracciones.
- **Riesgo de sobreajuste al dataset**: con 149 episodios y 39.013 fotogramas, la variabilidad de posiciones y condiciones puede ser limitada; es probable que el rendimiento caiga fuera de la distribución de entrenamiento.
- **Sin capacidades de lenguaje ni razonamiento**: no debe emplearse como modelo de texto, agente conversacional ni sistema de tool calling.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero conviene citar el paper de ACT y LeRobot según indica la model card.
- **Fecha de creación futura en los metadatos**: el repositorio figura creado el 2026-11-16; conviene verificar la vigencia de los artefactos antes de usarlos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MakinoKF/rebot_pick_multiple_nut_dataset_20261116_155455_act-policy-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/MakinoKF/rebot_pick_multiple_nut_dataset_20261116_155455
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MakinoKF/rebot_pick_multiple_nut_dataset_20261116_155455
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
