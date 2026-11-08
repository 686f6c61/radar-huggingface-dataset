# JJinJJin2/omx_act_policy_v3

## Resumen

`omx_act_policy_v3` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada por el usuario JJinJJin2 en Hugging Face bajo licencia Apache 2.0. El modelo no es un modelo de lenguaje: es un controlador visuomotor entrenado con LeRobot que, a partir de observaciones (imágenes de cámara y estado de las articulaciones), predice fragmentos cortos de acciones motoras en lugar de pasos individuales. El repositorio ocupa 0,2 GB y contiene 51.668.614 parámetros en formato safetensors.

El modelo se ha entrenado sobre el dataset `JJinJJin2/pick_and_place_v2`, un conjunto de demostraciones teleoperadas de 20 episodios orientado a tareas de recogida y colocación. La relevancia de este tipo de políticas radica en que ACT permite aprender habilidades manipulativas con relativamente pocas demostraciones humanas, lo que reduce el coste de entrenamiento frente a métodos de aprendizaje por refuerzo. La versión v3 sugiere iteraciones previas sobre el mismo pipeline.

Al tratarse de un artefacto de robótica de nicho (0 descargas, 0 likes en el momento de la consulta), no dispone de documentación extendida, benchmarks publicados ni información sobre idiomas. La ficha se limita a lo verificable en la model card, los metadatos de Hugging Face y el paper de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo visuomotor, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un backbone transformer que procesa las observaciones (típicamente imágenes de cámaras y el estado propioceptivo del robot) con un decoder que genera *chunks* de acciones de longitud fija, es decir, secuencias cortas de comandos motores en lugar de una única acción por paso. Esta predicción por bloques reduce el error de acumulación temporal y estabiliza el control. Una innovación destacable del método original es el uso de *temporal ensembling* durante la inferencia, que promedia predicciones solapadas de chunks consecutivos para suavizar la trayectoria.

El entrenamiento se realizó con LeRobot sobre el dataset `JJinJJin2/pick_and_place_v2`, compuesto por 20 episodios de teleoperación. No se dispone de información sobre el número de tokens, la composición exacta del dataset, el número de épocas ni si se aplicaron técnicas de aumento de datos. Tampoco hay datos sobre RLHF o DPO, que no aplican a este tipo de política. La model card únicamente documenta los comandos de entrenamiento (`lerobot-train`) y evaluación (`lerobot-record`).

## Capacidades

- Control visuomotor para manipulación robótica: predice chunks de acciones a partir de observaciones visuales y del estado de las articulaciones.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Ejecución de tareas de *pick and place* (recogida y colocación) sobre el hardware y dataset con los que fue entrenado.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante las herramientas `lerobot-train` y `lerobot-record`.
- Compatible con robots del tipo `so100_follower` según el ejemplo de evaluación de la model card.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, generación de texto, código, matemáticas, visión general, audio ni capacidades multilingües.

## Casos de uso

- Automatización de tareas de recogida y colocación en laboratorio: la política puede ejecutar la secuencia aprendida sobre el robot y el entorno del dataset `pick_and_place_v2`, reduciendo la necesidad de programación explícita de trayectorias.
- Prototipado rápido de políticas con LeRobot: sirve como punto de partida para reentrenar con `lerobot-train` sobre nuevos datasets y comparar variantes (v1, v2, v3) del mismo pipeline.
- Evaluación comparativa de checkpoints: el comando `lerobot-record` con `--episodes=10` permite medir la tasa de éxito de esta versión frente a iteraciones anteriores.
- Investigación en aprendizaje por imitación: útil para estudiar el efecto del *action chunking* y del *temporal ensembling* en tareas manipulativas con pocas demostraciones.
- Docencia y formación en robótica: ejemplo reproducible de un pipeline completo de entrenamiento y despliegue de una política ACT de 51,7 M de parámetros.
- Base para *fine-tuning* en tareas similares: al estar en formato safetensors y bajo Apache 2.0, puede adaptarse a nuevos entornos de manipulación sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamaño (51,7 M de parámetros, 0,2 GB de repo), la inferencia en FP32 requiere del orden de 0,2 GB de pesos, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más; esta estimación es orientativa y no procede de la documentación del modelo.
- GPU recomendadas: no disponible. El ejemplo de la model card usa `--policy.device=cuda`, sin especificar modelo de GPU.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU NVIDIA con soporte CUDA (GTX 1060 6 GB, RTX 3060, RTX 4090, etc.), dado el reducido tamaño del checkpoint.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de checkpoints locales o del Hub.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JJinJJin2/omx_act_policy_v3 | 51.668.614 | no aplica | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Jeonminjun/omx_act_policy | no disponible | no aplica | no disponible | no disponible en la busqueda | Hugging Face |
| ACT original (paper 2304.13705) | no disponible | no aplica | resultados en paper, no en esta ficha | no disponible | Paper y código de referencia |

No se dispone de datos de rendimiento comparables entre estas políticas. La comparativa se limita a la existencia de variantes del mismo pipeline ACT en el Hub.

## Limitaciones y advertencias

- Entrenada exclusivamente sobre 20 episodios de un único dataset (`pick_and_place_v2`); la generalización a otras tareas, objetos o entornos es muy limitada.
- Sin benchmarks publicados ni métricas de tasa de éxito; no hay evidencia cuantitativa de su rendimiento.
- Modelo de nicho con 0 descargas y 0 likes: no ha sido validado por la comunidad.
- No es un modelo de lenguaje: no procesa texto, no responde a instrucciones y no tiene capacidades de razonamiento simbólico.
- Riesgo de sobreajuste al entorno de entrenamiento (posición de cámaras, iluminación, mesa, robot concreto).
- No se documentan sesgos, pero al depender de demostraciones humanas puede heredar sesgos de la teleoperación (velocidades, trayectorias y preferencias del operador).
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de documentación técnica hace desaconsejable su uso en producción sin una evaluación propia.
- No hay información sobre cuantización, latencia ni requisitos de hardware oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JJinJJin2/omx_act_policy_v3
- Dataset de entrenamiento: https://huggingface.co/datasets/JJinJJin2/pick_and_place_v2
- Perfil del autor: https://huggingface.co/JJinJJin2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Variante relacionada: https://huggingface.co/Jeonminjun/omx_act_policy
