# gigwegbe/act-first-dataset

## Resumen

El modelo `gigwegbe/act-first-dataset` es una política de aprendizaje por imitación basada en el método Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. Fue desarrollada por George Igwegbe (gigwegbe) y está diseñada para controlar un robot manipulador SO-101 (SO101_Follower) en una tarea concreta de recogida y colocación de un cubo en un recinto rojo. El modelo consume imágenes de tres cámaras (muñeca, frontal y superior) junto con el estado del robot (posición de las articulaciones) y predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite una ejecución más estable y robusta.

La relevancia de este modelo reside en que es un ejemplo práctico de cómo aplicar ACT con LeRobot para resolver una tarea de manipulación real a partir de datos teleoperados. Con apenas 51,7 millones de parámetros y un dataset de 20 episodios, demuestra que es posible entrenar políticas robóticas con recursos modestos y desplegarlas en hardware real. Su licencia Apache 2.0 facilita la reutilización y el estudio del método, siendo un punto de partida para quienes se inician en la robótica de aprendizaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - Transformer encoder-decoder |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica como en LLM; se usa ventana de observación) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no aplica (modelo de control robótico, no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un transformer encoder para procesar observaciones (imágenes y estado del robot) y un decoder que predice una secuencia de acciones (action chunk) de longitud fija. A diferencia de los métodos que generan una sola acción por paso, ACT genera un chunk completo, lo que reduce la propagación de errores y mejora la consistencia de los movimientos. El modelo fue entrenado con el framework LeRobot (versión 0.6.1) usando un dataset de 20 episodios teleoperados (7.826 fotogramas a 30 FPS) de la tarea "recoger el cubo y colocarlo en el recinto rojo". La configuración de entrenamiento incluyó 20.000 pasos, batch de 32, optimizador AdamW con tasa de aprendizaje de 1e-5 y semilla 1000.

La innovación técnica principal es la aplicación del action chunking en un contexto de robótica real con bajo presupuesto computacional. El modelo se entrena con datos de imitación y no requiere recompensas externas, lo que simplifica la adquisición de habilidades. No se han reportado técnicas adicionales como RLHF o DPO; el entrenamiento es puramente por aprendizaje supervisado de imitación.

## Capacidades

- Control de un robot manipulador SO-101 para tareas de pick-and-place con tres cámaras (wrist, front, top).
- Generación de secuencias de acciones (action chunks) de 6 dimensiones (posiciones de las articulaciones o esfuerzos) a partir de observaciones multimodales.
- Ejecución en tiempo real mediante el framework LeRobot, con soporte para despliegue en robots reales.
- No dispone de capacidades de lenguaje natural, visión general o tool calling; está especializado en una única tarea de manipulación.
- Funciona como una política de imitación cerrada: no aprende nuevas tareas sin reentrenamiento.

## Casos de uso

- Automatización de tareas repetitivas de manipulación en entornos de laboratorio o almacenes: el modelo puede ejecutar la tarea de recogida y colocación de objetos de forma autónoma, liberando a los operadores humanos de tareas monótonas.
- Prototipado de políticas robóticas con LeRobot: sirve como base para experimentar con la plataforma LeRobot, permitiendo a desarrolladores aprender a entrenar, evaluar y desplegar sus propios modelos de imitación.
- Investigación en aprendizaje por imitación: su código y configuración están disponibles, lo que facilita la reproducción de experimentos y la comparación de variantes de ACT.
- Demostraciones educativas de robótica: en cursos o talleres, este modelo puede usarse para ilustrar el pipeline completo de teleoperación, entrenamiento y despliegue de una política robótica.
- Prueba de concepto de control robótico con visión: el uso de tres cámaras permite experimentar con la fusión de información visual y el estado del robot.
- Desarrollo de sistemas de automatización de bajo coste: dado que solo requiere 51M de parámetros, puede ejecutarse en GPUs de gama media, lo que lo hace accesible para pequeños laboratorios o startups.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "No evaluation results have been provided for this policy yet". No se reportan tasas de éxito ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifica. Con 51M de parámetros y entrada de tres imágenes 480x640, se estima que puede ejecutarse en una GPU con 2-4 GB de VRAM, pero no hay datos oficiales.
- GPU recomendadas: cualquier GPU NVIDIA moderna (GTX 1060, RTX 2060 o superior) debería ser suficiente para inferencia en tiempo real, aunque no se ha validado oficialmente.
- Cabe en GPUs de consumo: sí, probablemente en tarjetas con 4 GB o más, dado el tamaño reducido del modelo.
- Opciones de despliegue: el modelo está integrado en LeRobot, por lo que se puede ejecutar mediante los comandos `lerobot-rollout` (para inferencia) y `lerobot-train` (para reentrenamiento). No se menciona soporte para vLLM, llama.cpp u otros motores de inferencia genéricos, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La ejecución en tiempo real se menciona en la documentación de LeRobot, pero sin cifras concretas.

## Comparativa con modelos similares

No se dispone de información de modelos comparables en la misma categoría (políticas ACT entrenadas con LeRobot). Existen otros repositorios de políticas ACT en Hugging Face, pero no se han encontrado datos de rendimiento o especificaciones comparables. Por lo tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea concreta: recoger un cubo y colocarlo en un recinto rojo. No generaliza a otros objetos, posiciones o entornos.
- Requiere la configuración específica de tres cámaras (wrist, front, top) y un robot SO-101. Cambiar la configuración del hardware puede degradar el rendimiento.
- No se ha evaluado en el robot real; los resultados de éxito no han sido reportados, por lo que su eficacia real es incierta.
- La política es sensible a las condiciones de iluminación, posiciones de objetos y calibración de cámaras, como cualquier modelo de imitación.
- El dataset de entrenamiento es muy pequeño (20 episodios), lo que limita la generalización y puede provocar sobreajuste.
- Licencia apache-2.0 permite uso comercial, pero no hay garantías de rendimiento ni soporte.
- No se han documentado sesgos, pero al ser un modelo de control robótico, no procesa datos personales ni lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gigwegbe/act-first-dataset
- Dataset de entrenamiento: https://huggingface.co/datasets/gigwegbe/first-dataset
- Paper del método ACT: https://huggingface.co/papers/2304.13705
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentación de LeRobot ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
