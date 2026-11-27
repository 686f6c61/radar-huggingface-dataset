# ases200q2/UR10_RTDE_SpaceMouse_EE_pick_and_place_object_tabletop_demo_v3_d455_clean_act_3ae7284f

## Resumen

El modelo `UR10_RTDE_SpaceMouse_EE_pick_and_place_object_tabletop_demo_v3_d455_clean_act_3ae7284f` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en Hugging Face mediante la librería LeRobot. Lo desarrolla el usuario `ases200q2` y su propósito es controlar un brazo robótico UR10 en tareas de recogida y colocación de objetos sobre una mesa, recibiendo comandos desde un SpaceMouse a través de RTDE en el espacio del efector final.

ACT es un método de aprendizaje por imitación que predice trozos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error acumulado en tareas de manipulación. El modelo contiene aproximadamente 51,6 millones de parámetros y se distribuye en formato safetensors con licencia Apache 2.0, lo que facilita su reutilización y despliegue en entornos de investigación.

Su relevancia actual radica en que ejemplifica el flujo completo de LeRobot para robótica de código abierto: recogida de demostraciones teleoperadas, entrenamiento de una política ACT y publicación reproducible en el Hub. Es una pieza concreta para quien quiera replicar o adaptar un pipeline de manipulación pick-and-place con un UR10.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Action Chunking (ACT) |
| Parametros totales | 51.626.631 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT (Action Chunking with Transformers), descrita en el paper arXiv 2304.13705. Se trata de un transformer que, a partir de observaciones (imágenes y estado del robot), predice una secuencia de acciones futuras de longitud fija en lugar de una única acción. Este enfoque de chunking mitiga el problema de horizonte largo y la acumulación de errores típica de las políticas paso a paso.

El entrenamiento se realizó mediante aprendizaje por imitación supervisada sobre el dataset `ases200q2/UR10_RTDE_SpaceMouse_EE_pick_and_place_object_tabletop_demo_v3_d455_clean`, compuesto por demostraciones teleoperadas de la tarea pick-and-place sobre una mesa con un UR10 controlado por SpaceMouse en el espacio del efector final. No se dispone de información sobre número de tokens, composición exacta del dataset ni sobre el uso de RLHF o DPO; estos métodos no son habituales en políticas ACT.

## Capacidades

- Control robótico de manipulación: genera comandos de acción en el espacio del efector final para un UR10.
- Aprendizaje por imitación: reproduce tareas pick-and-place a partir de demostraciones teleoperadas.
- Predicción de action chunks: emite secuencias cortas de acciones para mayor estabilidad.
- Integración con LeRobot: entrenamiento, evaluación e inferencia mediante `lerobot-train` y `lerobot-record`.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingües, de visión general ni de audio; su entrada son observaciones del entorno robótico.
- No dispone de modo de razonamiento (thinking mode) ni de decodificación especulativa.

## Casos de uso

- Pick-and-place en mesa: el modelo ejecuta la tarea de recoger un objeto y colocarlo en una posición destino, entrenado específicamente para este escenario con UR10 y SpaceMouse.
- Replicación de experimentos de investigación: sirve como referencia reproducible para validar el pipeline ACT de LeRobot en un brazo UR10.
- Evaluación de políticas de imitación: permite comparar el rendimiento de ACT frente a otras políticas (diffusion policy, VQ-BeT) sobre el mismo dataset.
- Base para fine-tuning: puede adaptarse a nuevas variantes de la tarea (otros objetos, posiciones o velocidades) reentrenando con demostraciones adicionales.
- Docencia y formación en robótica: útil para mostrar el ciclo completo de teleoperación, entrenamiento y despliegue con hardware UR10.
- Integración en pipelines de automatización de laboratorio: para tareas repetitivas de manipulación sobre mesa en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,6 millones de parámetros; en precisión completa (fp32) ocupa aproximadamente 0,2 GB de pesos, por lo que la VRAM necesaria es mínima y depende sobre todo del tamaño de las imágenes de entrada.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; se puede usar RTX 3060, RTX 4090, A100 o H100 sin problemas de memoria.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de CUDA mediante `--policy.device=cuda`; también puede ejecutarse en CPU para pruebas.
- Latencia y throughput estimados: no disponibles; dependen del hardware, del tamaño de las observaciones y de la frecuencia de control del UR10.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| UR10 ACT pick-and-place (este modelo) | 51,6 M | no disponible | Apache 2.0 | Hugging Face |
| Otras políticas ACT de LeRobot | variable | no disponible | Apache 2.0 | Hugging Face |
| Diffusion Policy | no disponible | no disponible | no disponible | no disponible |
| VQ-BeT | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado para una tarea y un robot concretos (UR10, pick-and-place sobre mesa); no generaliza a otros objetos, entornos o brazos sin reentrenamiento.
- Riesgo de fallo ante cambios en iluminación, posición de cámara, fondo de la mesa o variaciones de los objetos.
- No se han documentado sesgos específicos, pero al ser un modelo de imitación hereda los sesgos y limitaciones de las demostraciones teleoperadas.
- No hay información sobre el tamaño ni la diversidad del dataset de entrenamiento, lo que impide estimar su robustez.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- No debe utilizarse en entornos donde un fallo de manipulación pueda causar daños físicos o materiales sin supervisión adecuada.

## Enlaces

- Hugging Face: https://huggingface.co/ases200q2/UR10_RTDE_SpaceMouse_EE_pick_and_place_object_tabletop_demo_v3_d455_clean_act_3ae7284f
- Dataset: https://huggingface.co/datasets/ases200q2/UR10_RTDE_SpaceMouse_EE_pick_and_place_object_tabletop_demo_v3_d455_clean
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de entrenamiento: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
