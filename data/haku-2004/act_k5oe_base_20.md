# Haku-2004/act_k5oe_base_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora las tasas de éxito en tareas de manipulación. Este repositorio concreto, `Haku-2004/act_k5oe_base_20`, es una política ACT entrenada y publicada con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica.

El modelo tiene 51.668.614 parámetros y se distribuye en formato safetensors con un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras desplegables en hardware de consumo. Está entrenado sobre el dataset `Haku-2004/k5_20261110_143202` y se publica bajo licencia Apache 2.0.

Su relevancia radica en que ejemplifica el flujo actual de entrenamiento de políticas robóticas de código abierto: un único comando de LeRobot entrena la política, se publica en el Hub y se evalúa directamente sobre un robot SO-100 follower. No es un modelo de lenguaje, sino una política visomotora específica para control robótico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control; ventana de observación definida por la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT se basa en un transformer que combina un encoder visual (procesa las imágenes de las cámaras del robot) con un decoder que genera un chunk de acciones futuras de forma conjunta. La innovación principal del método original es predecir secuencias de acciones en lugar de acciones aisladas, lo que mitiga el problema de la acumulación de errores en el control a largo plazo y permite un control más suave y consistente. El modelo incorpora además una técnica de entrenamiento con ruido añadido en las posiciones objetivo (target positions) para mejorar la robustez.

En este caso concreto, la política se ha entrenado con LeRobot sobre el dataset `Haku-2004/k5_20261110_143202`. No se dispone de información sobre el número de tokens, la composición exacta del dataset, el número de episodios de teleoperación, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en aprendizaje por imitación). La configuración de entrenamiento (tipo de robot, cámaras, frecuencia de control) no está detallada en la model card.

## Capacidades

- Control robótico visomotor: genera comandos de acción a partir de observaciones visuales y del estado del robot.
- Predicción de action chunks: emite secuencias cortas de acciones en cada paso de inferencia, lo que reduce la latencia efectiva de control y suaviza las trayectorias.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de datos de teleoperación.
- Integración con LeRobot: entrenamiento, evaluación e inferencia mediante los comandos `lerobot-train` y `lerobot-record`.
- Despliegue sobre robot SO-100 follower (según el ejemplo de evaluación de la model card).
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multilingües: es una política de control, no un modelo generativo de texto.

## Casos de uso

- Manipulación robótica de precisión: la política predice chunks de acciones que permiten ejecutar tareas de pick-and-place con trayectorias suaves, aprovechando la reducción de error acumulado del método ACT.
- Automatización de tareas repetitivas en laboratorio: entrenada sobre un dataset específico de teleoperación, puede replicar secuencias de manipulación en un banco de trabajo con el robot SO-100.
- Prototipado rápido de políticas con LeRobot: el flujo de entrenamiento en un solo comando permite iterar sobre nuevos datasets y comparar configuraciones de política.
- Investigación en aprendizaje por imitación: sirve como referencia base para experimentos de ablación sobre action chunking, ruido en targets y arquitecturas de encoder visual.
- Evaluación comparativa de políticas robóticas: al estar publicada en el Hub con licencia Apache 2.0, puede usarse como baseline frente a otras políticas entrenadas con LeRobot.
- Despliegue en hardware de bajo coste: con 51,7 M de parámetros y 0,2 GB de pesos, es viable en GPUs de consumo para inferencia en tiempo real sobre el robot.
- Educación y reproducción de experimentos: el par dataset-política publicado permite reproducir el entrenamiento y la evaluación de forma completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del modelo (51,7 M de parámetros, pesos en safetensors de 0,2 GB), la inferencia en fp32 requeriría aproximadamente 0,2 GB de pesos más el coste del encoder visual y los buffers de activación, por lo que cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: no especificadas en la model card. El ejemplo de entrenamiento usa `--policy.device=cuda`. Para inferencia, cualquier GPU con CUDA es suficiente; para entrenamiento se recomienda una GPU dedicada (A100, H100, RTX 4090 o similar), aunque no hay datos oficiales de requisitos.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con al menos 4-8 GB de VRAM, dado el tamaño reducido del modelo.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de inferencia sobre el robot SO-100 follower. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k5oe_base_20 (este) | 51,7 M | no disponible | no publicado | apache-2.0 | Hugging Face Hub |
| Otras políticas ACT en LeRobot | variable | no disponible | no disponible | habitualmente apache-2.0 | Hugging Face Hub |
| Diffusion Policy (LeRobot) | variable | no disponible | no disponible | habitualmente apache-2.0 | Hugging Face Hub |
| VQ-BeT (LeRobot) | variable | no disponible | no disponible | habitualmente apache-2.0 | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Es una política específica entrenada sobre un único dataset (`Haku-2004/k5_20261110_143202`); su generalización fuera de las condiciones de ese dataset (robot, cámaras, entorno, tarea) es limitada.
- No hay información sobre sesgos, ya que no es un modelo lingüístico; los sesgos relevantes serían los del dataset de teleoperación, no documentados.
- Riesgo de fallo por distribución fuera de dominio: cambios de iluminación, posición de cámara u objetos distintos a los del entrenamiento pueden degradar el comportamiento.
- No se documentan limitaciones de contexto ni de idioma porque no aplican al tipo de modelo.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Sin métricas de éxito publicadas: no se puede evaluar la fiabilidad de la política sin ejecutar la evaluación sobre el robot.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se especifican los requisitos exactos de hardware ni la configuración del robot más allá del ejemplo con SO-100 follower.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5oe_base_20
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_20261110_143202
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
