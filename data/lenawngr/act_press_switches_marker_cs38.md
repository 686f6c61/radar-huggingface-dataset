# lenawngr/ACT_press_switches_marker_cs38

## Resumen

ACT_press_switches_marker_cs38 es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), un método presentado en el artículo arXiv 2304.13705 que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido entrenado y publicado con LeRobot, la librería de robótica de Hugging Face, por el usuario lenawngr, sobre el dataset `lenawngr/press_switches_so101`, orientado a la manipulación de interruptores con un robot SO-101.

El modelo cuenta con 51.605.126 parámetros y se distribuye en formato safetensors con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su pipeline es `robotics` y no es un modelo de lenguaje: no procesa texto ni mantiene conversaciones, sino que mapea observaciones visuales y de estado del robot a comandos de control de bajo nivel.

Es relevante para quienes trabajan en robótica de manipulación con hardware asequible (SO-101), ya que ofrece una política entrenada lista para evaluar o reentrenar mediante los comandos de LeRobot. El repositorio es pequeño (0,2 GB) y la fecha de creación registrada es 2026-11-10.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ACT (Action Chunking with Transformers) |
| Parametros totales | 51.605.126 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada multimodal de observaciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que emplea un transformer para predecir secuencias cortas de acciones (chunks) a partir de observaciones, en lugar de generar una acción por paso. Esto reduce el error acumulado y la varianza en tareas de manipulación, y suele lograr tasas de éxito altas cuando se entrena con datos de teleoperación. El modelo sigue la implementación de LeRobot y se ha entrenado sobre el dataset `lenawngr/press_switches_so101`, correspondiente a una tarea de pulsación de interruptores con el robot SO-101.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, el número de episodios ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este contexto). La innovación técnica principal es el propio mecanismo de action chunking, que predice varios pasos de acción de forma conjunta para mejorar la estabilidad del control.

## Capacidades

- Control robótico de manipulación: genera comandos de acción para el robot SO-101 a partir de observaciones.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de datos de teleoperación.
- Predicción de action chunks: emite secuencias cortas de acciones en cada inferencia.
- Integración con LeRobot: entrenamiento, evaluación y despliegue mediante `lerobot-train` y `lerobot-record`.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales fuera de la observación del entorno robótico.

## Casos de uso

- Automatización de pulsación de interruptores: el modelo reproduce la tarea de accionar interruptores con el SO-101, adecuado para entornos de laboratorio o domésticos controlados.
- Evaluación de políticas de imitación: sirve como checkpoint de referencia para comparar con nuevas políticas entrenadas con LeRobot sobre el mismo dataset.
- Reentrenamiento con datos propios: se puede partir de esta configuración ACT y entrenar con un dataset propio mediante `lerobot-train`, ajustando el tipo de política a `act`.
- Pruebas de hardware SO-101: útil para validar la cadena completa de teleoperación, grabación de episodios e inferencia en un robot de bajo coste.
- Investigación en aprendizaje por imitación: permite reproducir experimentos de action chunking y medir tasas de éxito en tareas de manipulación.
- Docencia y formación en robótica: ejemplo práctico de pipeline completo con LeRobot, desde el dataset hasta la evaluación con `lerobot-record`.
- Prototipado de tareas de contacto: la tarea de pulsar interruptores implica contacto físico, lo que lo hace útil para estudiar control de fuerza y precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 51,6 M de parámetros el modelo es muy ligero y cabe holgadamente en GPUs de consumo, aunque no se especifica una cifra concreta.
- GPU recomendadas: no disponible; el comando de entrenamiento de LeRobot usa `--policy.device=cuda`, por lo que se espera una GPU NVIDIA, pero no se detalla un modelo concreto.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño reducido del modelo, aunque no se confirma en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de checkpoints locales o del Hub.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ACT_press_switches_marker_cs38 | 51.605.126 | no aplica | apache-2.0 | Hugging Face (LeRobot) |
| Otras políticas ACT en LeRobot | no disponible | no aplica | variable | Hugging Face |
| Políticas de imitación alternativas (p. ej. Diffusion Policy) | no disponible | no aplica | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo específico para una tarea y un robot concretos (SO-101, pulsación de interruptores); no generaliza a otras tareas sin reentrenamiento.
- No es un modelo de lenguaje: no procesa texto, no responde preguntas ni mantiene conversaciones.
- Riesgo de fallo ante cambios en el entorno, iluminación, posición de los objetos o del robot respecto a las condiciones de entrenamiento.
- No se documentan sesgos, pero al derivar de datos de teleoperación puede heredar sesgos de las demostraciones humanas.
- No se especifican limitaciones de contexto ni de idioma porque no aplican.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía alguna sobre el rendimiento en producción.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia comunitaria de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lenawngr/ACT_press_switches_marker_cs38
- Dataset de entrenamiento: https://huggingface.co/datasets/lenawngr/press_switches_so101
- Artículo ACT (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
