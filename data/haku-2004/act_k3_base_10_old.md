# Haku-2004/act_k3_base_10_old

## Resumen

`act_k3_base_10_old` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705 que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido desarrollado por el usuario Haku-2004 y entrenado con la librería LeRobot de Hugging Face, a partir del dataset de teleoperación `Haku-2004/LeRobot_dataset_k_3_20261027_143829`.

El checkpoint contiene 51.668.614 parámetros en formato safetensors y se publica bajo licencia Apache 2.0. No se trata de un modelo de lenguaje: su pipeline es `robotics` y su función es controlar un robot seguidor (por ejemplo, un SO-100) a partir de observaciones visuales y del estado de las articulaciones, reproduciendo comportamientos aprendidos de demostraciones humanas.

Es relevante para quien experimenta con manipulación robótica de bajo coste y flujos de trabajo LeRobot, ya que ACT es uno de los métodos de referencia para políticas visomotoras con datasets pequeños. El sufijo `old` en el nombre sugiere que se trata de una versión previa o descartada dentro de una serie de experimentos del autor, y el modelo no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; entrada compuesta por observaciones visuales y estado del robot) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT combina un backbone de visión (típicamente ResNet) que procesa las imágenes de las cámaras con un transformer encoder-decoder que fusiona observaciones visuales, estado de las articulaciones y, opcionalmente, una latente de estilo (CVAE). El decoder genera un chunk de acciones de longitud fija en lugar de una acción por paso, lo que reduce el error de compounding y suaviza la ejecución. La implementación concreta de este checkpoint sigue la disponible en LeRobot, pero la model card no detalla la configuración de capas, el backbone visual ni la dimensión de los chunks.

El entrenamiento se realizó por imitación supervisada sobre el dataset `Haku-2004/LeRobot_dataset_k_3_20261027_143829`, compuesto por episodios de teleoperación. No se especifican el número de episodios, el número de frames, la resolución de las cámaras, el robot objetivo ni si se aplicaron aumentos de datos. Tampoco se documenta el uso de RLHF, DPO ni ninguna fase de ajuste posterior; en ACT el entrenamiento es puramente de imitación.

## Capacidades

- Control visomotor de robots manipuladores: genera comandos de articulaciones a partir de imágenes y del estado del robot.
- Predicción de chunks de acciones, lo que permite ejecuciones más estables que el control paso a paso.
- Aprendizaje por imitación a partir de datasets de teleoperación en formato LeRobot.
- Integración con el ecosistema LeRobot para entrenamiento (`lerobot-train`) y evaluación (`lerobot-record`).
- Compatible con robots seguidores tipo SO-100 según los ejemplos de la model card.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, tool calling, capacidades de agente ni multilingüismo.

## Casos de uso

- Manipulación de objetos con un robot SO-100: la política reproduce la tarea aprendida (por ejemplo, recoger y colocar piezas) a partir de las cámaras y el estado articular, usando el chunk de acciones para suavizar el movimiento.
- Evaluación de pipelines de imitación en LeRobot: sirve como checkpoint de referencia para comparar configuraciones de entrenamiento con `lerobot-record` y medir tasas de éxito en 10 episodios, tal como propone la model card.
- Prototipado rápido de tareas de pick-and-place en laboratorio: al estar entrenado sobre un dataset concreto, permite validar en pocas horas si la tarea y la disposición de cámaras son viables antes de escalar el dataset.
- Reproducción de demostraciones teleoperadas: útil para estudiar la fidelidad de ACT frente a los datos originales y detectar desviaciones sistemáticas.
- Base para fine-tuning con nuevos datasets: al ser un checkpoint Apache 2.0 en safetensors, puede reentrenarse con `lerobot-train` sobre datos adicionales del mismo robot.
- Docencia y experimentación en aprendizaje por imitación: permite ilustrar el flujo completo teleoperación, dataset, entrenamiento y despliegue sin depender de modelos propietarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de trayectoria ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,7 M de parámetros, el peso en FP32 ronda los 207 MB y en FP16 unos 103 MB, a lo que hay que sumar el backbone visual y los buffers de activación.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder ejecutar la política, aunque no se documenta.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas tipo RTX 3060, RTX 4060 o superiores, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que es el flujo documentado; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k3_base_10_old | 51.668.614 | no aplica | no disponible | Apache 2.0 | Hugging Face (Haku-2004) |
| Otras políticas ACT en LeRobot Hub | variable | no aplica | no disponible | habitualmente Apache 2.0 | Hugging Face |
| Diffusion Policy (LeRobot) | variable | no aplica | no disponible | MIT/Apache según checkpoint | Hugging Face |
| SmolVLA (LeRobot) | no disponible | no aplica | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo específico de una tarea y un dataset: no generaliza a otras tareas, robots o disposiciones de cámara sin reentrenamiento.
- Sesgos derivados de las demostraciones: si el dataset de teleoperación tiene una distribución estrecha de posiciones u objetos, la política fallará fuera de ella.
- Riesgo de sobreajuste al entorno de entrenamiento (iluminación, fondo, posición inicial del robot).
- Sin métricas publicadas de tasa de éxito ni de robustez; el sufijo `old` sugiere que puede haber sido reemplazado por versiones posteriores del autor.
- Sin descargas ni validación comunitaria en el momento de la consulta.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del dataset de entrenamiento original.
- No apto para producción sin una evaluación propia exhaustiva en el robot y entorno objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k3_base_10_old
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/LeRobot_dataset_k_3_20261027_143829
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
