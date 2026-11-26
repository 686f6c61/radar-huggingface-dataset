# Haku-2004/act_i_input_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para control robótico que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. Este repositorio concreto, `Haku-2004/act_i_input_20`, es una política entrenada con LeRobot y publicada en Hugging Face por el usuario Haku-2004, con 51.671.174 parámetros y un tamaño de repositorio de 0,2 GB. Está pensado para ejecutarse sobre brazos robóticos tipo SO-100/SO-101 dentro del ecosistema LeRobot.

El modelo resuelve el problema de la imitación de tareas manipulativas a partir de datos de teleoperación: en lugar de predecir una acción por paso de control, genera un chunk de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad del comportamiento. Es relevante para quien quiera reproducir o adaptar políticas de robot learning sin partir de cero, ya que se integra directamente con las herramientas de entrenamiento y evaluación de LeRobot.

La ficha se basa únicamente en la información pública del repositorio y en la model card del autor. No hay datos publicados sobre composición del dataset de entrenamiento, benchmarks ni resultados de evaluación, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones con chunking |
| Parametros totales | 51.671.174 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; depende de la ventana de observaciones del entorno) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación robótica que combina un encoder de observaciones (típicamente imágenes de cámaras y estado del robot) con un decoder que emite chunks de acciones de longitud fija. La innovación principal del método original es el *action chunking*: predecir varias acciones futuras de golpe, lo que mitiga el problema de la varianza en la predicción paso a paso y permite comportamientos más suaves y consistentes. El paper asociado (arXiv:2304.13705) describe también el uso de una componente de estilo CVAE para modelar la variabilidad de las demostraciones humanas.

En este repositorio concreto no se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO (no aplicables en este contexto). El autor indica que la política se entrenó con LeRobot sobre el dataset `Haku-2004/i_4seg` y que el pipeline es `robotics`. No hay información pública sobre hiperparámetros, aumentos de datos ni número de episodios de teleoperación utilizados.

## Capacidades

- Control robótico por imitación: genera chunks de acciones a partir de observaciones del entorno (imágenes y estado del robot).
- Manipulación de objetos en tareas de pick-and-place y similares, siempre que el modelo haya sido entrenado para esa tarea concreta.
- Integración nativa con LeRobot: entrenamiento con `lerobot-train` y evaluación/inferencia con `lerobot-record`.
- Compatible con robots de la familia SO-100 (`so100_follower` aparece en los comandos de ejemplo).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales fuera del uso de imágenes como observación.

## Casos de uso

- Manipulación robótica de laboratorio: usar la política para reproducir una tarea de pick-and-place sobre un brazo SO-100, cargando el checkpoint con `--policy.path` en `lerobot-record` y evaluando el éxito en 10 episodios.
- Reproducción de experimentos de robot learning: servir como punto de partida para comparar ACT frente a otras políticas de LeRobot sobre el mismo dataset `Haku-2004/i_4seg`.
- Fine-tuning sobre datos propios: reentrenar la política con `lerobot-train --policy.type=act` usando un dataset de teleoperación propio y comparar la tasa de éxito con este checkpoint como baseline.
- Docencia y formación: demostrar el flujo completo de LeRobot (grabación de datos, entrenamiento, evaluación) con un modelo pequeño (0,2 GB) que cabe en cualquier equipo con GPU consumer.
- Prototipado rápido en robótica de bajo coste: desplegar la política en un brazo SO-100 de sobremesa para validar una tarea antes de invertir en hardware mayor.
- Investigación en imitation learning: analizar el efecto del action chunking y de la componente CVAE comparando variantes entrenadas sobre el mismo dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tasas de éxito, curvas de aprendizaje ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 0,2 GB en safetensors; con overhead de activaciones y frames de cámara, una GPU con 4-8 GB de VRAM es suficiente en la práctica (estimación, no dato publicado).
- GPU recomendadas: cualquier GPU NVIDIA con CUDA; el ejemplo oficial usa `--policy.device=cuda`. Para entrenamiento se recomienda al menos una RTX 3060/4060 o superior; para inferencia basta una GPU de gama media.
- Cabe en GPU consumer: sí, por el tamaño del checkpoint (51,7 M de parámetros).
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que internamente usa PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| Haku-2004/act_i_input_20 | 51,7 M | ACT sobre LeRobot, dataset `i_4seg` | apache-2.0 | Hugging Face |
| Políticas ACT oficiales de LeRobot | no disponible | ACT de referencia en el ecosistema LeRobot | apache-2.0 | Hugging Face / docs de LeRobot |
| Diffusion Policy (referencia del estado del arte en imitación) | no disponible | Difusión para generación de acciones | según implementación | Repositorios de investigación |

La comparación cuantitativa con alternativas no está disponible: no se han publicado métricas de éxito ni datos de entrenamiento que permitan contrastar este checkpoint con otras políticas.

## Limitaciones y advertencias

- Especialización extrema: la política solo es válida para la tarea y el robot con los que se entrenó; no generaliza a otras tareas sin reentrenamiento.
- Sin datos de evaluación: no hay tasas de éxito publicadas, por lo que no se puede garantizar su comportamiento en producción.
- Dataset de entrenamiento no documentado: se desconoce el número de episodios, la variabilidad de las demostraciones y la cobertura de condiciones.
- Riesgo de sobreajuste al entorno de grabación (iluminación, posición de cámara, fondo), típico en imitation learning.
- Sin capacidades de lenguaje ni de razonamiento simbólico; no sustituye a un LLM en pipelines de agentes.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.
- No se documentan sesgos específicos; en robótica, los sesgos provienen de la distribución de demostraciones y pueden manifestarse como fallos sistemáticos en posiciones o objetos no vistos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_i_input_20
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/i_4seg
