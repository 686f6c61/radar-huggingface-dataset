# fecasado/gact-kitchen-lettuce-multi

## Resumen

`gact-kitchen-lettuce-multi` es una política de control robótico (policy) entrenada con LeRobot y publicada en Hugging Face por el usuario `fecasado`. No se trata de un modelo de lenguaje generativo, sino de un modelo de imitación (imitation learning) orientado a robótica manipulativa, concretamente a la tarea de cocina "lettuce to plate" (llevar lechuga al plato) sobre un entorno de cocina. El identificador del modelo (`gaze_act`) sugiere una variante de la arquitectura ACT (Action Chunking Transformer) con algún componente de atención a la mirada (gaze), aunque la model card no lo detalla.

El modelo tiene 51.670.922 parámetros totales (unos 51,7 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 0,2 GB. Está entrenado sobre el dataset `fecasado/lettuce-to-plate-320x240`, con imágenes de resolución 320x240, y se ejecuta mediante el stack LeRobot, que permite tanto el entrenamiento como la inferencia sobre robots tipo SO-100 follower.

Su relevancia es la de un ejemplo práctico de política de imitación de código abierto para robótica de bajo coste: licencia Apache 2.0, integración directa con LeRobot y un pipeline reproducible de entrenamiento y evaluación. No hay información publicada sobre idiomas, benchmarks o capacidades de razonamiento, porque no es un modelo lingüístico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con variante `gaze_act` (detalles no disponibles) |
| Parametros totales | 51.670.922 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada es `gaze_act`, una variante de ACT (Action Chunking Transformer), el transformer de predicción de acciones por chunks empleado habitualmente en LeRobot para imitación de tareas manipulativas. ACT predice secuencias de acciones (chunks) a partir de observaciones visuales y de estado del robot, lo que reduce el error acumulado y mejora la estabilidad en tareas de manipulación de precisión media. El componente "gaze" no está descrito en la model card, por lo que no se dispone de detalles sobre su función exacta (posiblemente una señal de atención visual o de dirección de mirada integrada en la política).

El entrenamiento se realizó con LeRobot sobre el dataset `fecasado/lettuce-to-plate-320x240`, con observaciones de cámara a resolución 320x240. No se dispone de información sobre el número de episodios, la composición del dataset, si hubo aumento de datos o si se aplicó algún tipo de regularización o RLHF (no aplicable en este contexto). El flujo de entrenamiento documentado usa `lerobot-train` con `--policy.type=act`, dispositivo CUDA y registro opcional en Weights & Biases.

## Capacidades

- Control robótico por imitación para la tarea de manipulación "lettuce to plate" en un entorno de cocina.
- Predicción de acciones por chunks (action chunking) a partir de observaciones visuales y de estado.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- Ejecución sobre robots tipo `so100_follower` mediante `lerobot-record`.
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión generalista.
- No dispone de tool calling, function calling ni capacidades de agente multi-paso.
- No dispone de capacidades multilingües (no es un modelo lingüístico).
- No dispone de modo "thinking", audio ni otras capacidades especiales.

## Casos de uso

- Automatización de tareas de manipulación en cocina: la política puede ejecutar la secuencia de recogida y colocación de lechuga en un plato sobre un robot SO-100, sirviendo como base para tareas similares de pick-and-place.
- Prototipado de políticas de imitación: útil como punto de partida para investigadores que quieran replicar el pipeline LeRobot con sus propios datasets y comparar variantes de ACT.
- Evaluación reproducible en laboratorio: el flujo `lerobot-record` con `--policy.path` permite ejecutar 10 episodios de evaluación y medir la tasa de éxito de forma estandarizada.
- Benchmark interno de políticas robóticas: al ser un modelo pequeño (51,7 M parámetros) y ligero (0,2 GB), es adecuado como referencia en comparativas de políticas de imitación de bajo coste.
- Despliegue en hardware de bajo presupuesto: el tamaño reducido permite inferencia en GPUs de consumo, lo que facilita pruebas en laboratorios con recursos limitados.
- Educación y formación en robótica: ejemplo completo y abierto (Apache 2.0) para enseñar el ciclo completo de captura de datos, entrenamiento y evaluación de una política de imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del modelo (51,7 M parámetros, 0,2 GB en safetensors), la inferencia cabe holgadamente en GPUs de consumo con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (el flujo de entrenamiento documentado usa `--policy.device=cuda`); para entrenamiento se recomienda al menos una RTX 3060/4060 o superior.
- Cabe en GPU de consumo: sí, con margen amplio dado el reducido número de parámetros.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`), con integración sobre robots `so100_follower`. No se documentan opciones vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gact-kitchen-lettuce-multi | 51,7 M | no aplica | no disponible | apache-2.0 | Hugging Face (LeRobot) |
| fecasado/gfm-kitchen-lettuce-22dF | no disponible | no aplica | no disponible | no disponible | Hugging Face (LeRobot) |
| fecasado/gfm-kitchen-lettuce-22dN | no disponible | no aplica | no disponible | no disponible | Hugging Face (LeRobot) |

Los dos modelos comparables encontrados pertenecen al mismo autor y a la misma familia de tareas de cocina con lechuga, pero no se dispone de sus especificaciones detalladas ni de resultados de rendimiento. No se han identificado otras políticas ACT públicas directamente comparables en la información disponible.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada para una única tarea ("lettuce to plate") y un único entorno de cocina; no generaliza a otras tareas sin reentrenamiento.
- Sin datos de generalización: no hay información sobre variabilidad de iluminación, posiciones de objetos o dominios distintos al del dataset de entrenamiento.
- Sesgos: no disponibles; al ser un modelo de control, los sesgos relevantes serían de distribución de datos (posiciones, colores, objetos) más que sociales.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas fuera de distribución.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, con obligación de conservar avisos de licencia y atribución.
- Caveats para producción: el modelo no incluye documentación sobre seguridad física del robot, paradas de emergencia ni validación en entornos reales; se recomienda evaluación exhaustiva antes de cualquier despliegue.
- Model card incompleta: el propio autor indica "_Model type not recognized — please update this template._", por lo que faltan detalles de arquitectura, datos y evaluación.

## Enlaces

- Hugging Face: https://huggingface.co/fecasado/gact-kitchen-lettuce-multi
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/lettuce-to-plate-320x240
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Modelo relacionado: https://huggingface.co/fecasado/gfm-kitchen-lettuce-22dF
- Modelo relacionado: https://huggingface.co/fecasado/gfm-kitchen-lettuce-22dN
