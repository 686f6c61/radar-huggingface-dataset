# lenawngr/ACT_pick-place_200_episodes

## Resumen

ACT_pick-place_200_episodes es una política de imitación basada en Action Chunking with Transformers (ACT), publicada por el usuario lenawngr en Hugging Face Hub y entrenada con la librería LeRobot de Hugging Face. El modelo resuelve una tarea concreta de manipulación robótica: pick-and-place sobre el robot SO-101 (variante del SO-100), aprendida a partir de 200 episodios de teleoperación recogidos en el dataset `lenawngr/pick-place_so101`. No es un modelo de lenguaje: es un policy de control motor que mapea observaciones visuales y propioceptivas a secuencias de acciones.

La arquitectura ACT, descrita en el paper arXiv:2304.13705, predice chunks de acciones (varios pasos futuros de una vez) en lugar de acciones individuales, lo que reduce el error de compounding y mejora la estabilidad en tareas de imitación. Con 51.668.614 parámetros y un repositorio de 0,2 GB en formato safetensors, es un modelo ligero pensado para inferencia en tiempo real sobre hardware modesto.

Su relevancia es práctica: demuestra el flujo completo de LeRobot para entrenar y desplegar políticas de imitación en robots de bajo coste, y sirve como referencia reproducible para quien quiera replicar pick-and-place en SO-101 con su propio dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre observaciones por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones en la model card) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación robótica que combina un backbone visual (típicamente ResNet preentrenado) para codificar las imágenes de las cámaras con un transformer encoder-decoder que genera chunks de acciones. La innovación central del método es predecir k acciones futuras de forma conjunta en lugar de una sola acción por paso, lo que mitiga el problema de acumulación de error típico de las políticas paso a paso y permite un control más suave. El paper original reporta altas tasas de éxito en tareas de manipulación fina con datos teleoperados.

En este caso concreto, el entrenamiento se realizó con LeRobot sobre el dataset `lenawngr/pick-place_so101`, compuesto por 200 episodios de teleoperación de la tarea pick-and-place en el robot SO-101. La model card no detalla el número de tokens, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO (no aplicables en este contexto de imitación supervisada). Tampoco se documentan aumentos de datos, resolución de cámara ni hiperparámetros de entrenamiento más allá del comando `lerobot-train` de referencia.

## Capacidades

- Control robótico de manipulación: genera comandos de acción para el robot SO-101 orientados a la tarea pick-and-place.
- Imitación de demostraciones: aprende de datos teleoperados y reproduce la política de agarre y colocación.
- Predicción de chunks de acciones: emite secuencias de acciones futuras, no solo el paso inmediato.
- Inferencia en tiempo real: pensada para ejecutarse en bucle de control con `lerobot-record`.
- Integración con LeRobot: compatible con el pipeline de entrenamiento, evaluación y despliegue de Hugging Face LeRobot.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico ni capacidades multilingües: es un policy motor, no un modelo generativo de texto.

## Casos de uso

- Automatización de pick-and-place en laboratorio: desplegar la política sobre un SO-101 real para recoger y colocar objetos en posiciones predefinidas, usando `lerobot-record` con `--policy.path` apuntando al checkpoint.
- Base para fine-tuning con datos propios: partir de estos pesos y reentrenar con un dataset específico de otra tarea de manipulación, aprovechando el flujo `lerobot-train --policy.type=act`.
- Benchmark de referencia para comparar políticas ACT: usar esta política como línea base al evaluar variantes de arquitectura o de tamaño de dataset en el mismo robot y tarea.
- Docencia y formación en imitación robótica: ejemplo reproducible de extremo a extremo (dataset, entrenamiento, evaluación) para cursos de robótica de aprendizaje.
- Validación de hardware SO-101: comprobar el funcionamiento del robot, cámaras y calibración ejecutando una política conocida antes de abordar tareas nuevas.
- Investigación en data efficiency: analizar el efecto del número de episodios (200 en este caso) sobre la tasa de éxito, replicando el entrenamiento con subconjuntos del dataset.
- Prototipado de pipelines de evaluación automatizada: integrar la política en scripts de evaluación con `--episodes=10` para medir éxito de forma sistemática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,7 M de parámetros (unos 207 MB en fp32, ~103 MB en fp16). Con el backbone visual y los buffers de inferencia, se estima un consumo de VRAM inferior a 2 GB en fp16, aunque no se documenta oficialmente.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la práctica; una RTX 3060, RTX 4060 o superior ofrece margen holgado. Para entrenamiento se recomienda una GPU con 8-16 GB (RTX 3090, RTX 4090, A100).
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante, con matices de drivers y CUDA).
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de dispositivo CUDA o CPU vía `--policy.device`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. La latencia vendrá dominada por la inferencia del backbone visual y el bucle de control del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT_pick-place_200_episodes (este) | 51,7 M | no aplica | Pick-and-place SO-101 | apache-2.0 | Hugging Face Hub |
| ACT original (paper 2304.13705) | no disponible | no aplica | Manipulación fina (varias tareas) | no disponible | Paper y código de referencia |
| Políticas LeRobot ACT genéricas | variable | no aplica | Manipulación con SO-100/SO-101 | según autor | Hugging Face Hub (varios repos) |
| Diffusion Policy (alternativa de imitación) | variable | no aplica | Manipulación robótica | MIT (implementación de referencia) | Repos públicos |

La comparación cuantitativa de rendimiento entre estas alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada para una única tarea (pick-and-place) y un único robot (SO-101); no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Dependencia del dataset: 200 episodios pueden ser insuficientes para robustez ante variaciones de iluminación, posición de objetos o fondo; el rendimiento fuera de la distribución de entrenamiento no está documentado.
- Sin métricas publicadas: no hay tasas de éxito ni evaluaciones reproducibles en la model card, por lo que el rendimiento real debe validarse en el hardware objetivo.
- Riesgo de sobreajuste a la configuración de cámaras y calibración usadas en la teleoperación; cambios en la disposición física pueden degradar la política.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar las obligaciones de atribución.
- Sin capacidades lingüísticas, de razonamiento simbólico ni de tool calling: no debe emplearse fuera del contexto de control robótico.
- Fecha de creación en el Hub (2026-10-30) y bajo número de descargas (18): modelo reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lenawngr/ACT_pick-place_200_episodes
- Dataset de entrenamiento: https://huggingface.co/datasets/lenawngr/pick-place_so101
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
