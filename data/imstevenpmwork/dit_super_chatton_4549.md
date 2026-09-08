# imstevenpmwork/dit_super_chatton_4549

## Resumen

Este modelo es una politica de robotica denominada `dit_super_chatton_4549`, desarrollada por `imstevenpmwork` y publicada en HuggingFace bajo licencia Apache 2.0. Se trata de un Multi-Task Diffusion Transformer (DiT) que extiende la Diffusion Policy original con un transformer de difusion de gran tamano y condicionamiento por texto e imagenes, permitiendo aprendizaje multitarea de habilidades de manipulacion robotica. El modelo esta entrenado sobre el dataset `imstevenpmwork/super_chatton`, que contiene 100 episodios y 73.842 fotogramas a 30 FPS de una tarea de pick-and-place con cubos de colores.

La arquitectura DiT soporta objetivos de difusion y flow-matching, y aunque el paper de referencia menciona ~450M parametros, esta implementacion concreta tiene 248.855.302 parametros en formato safetensors, con un tamano de repositorio de 1.0 GB. El modelo se integra con el framework LeRobot de HuggingFace, lo que facilita su entrenamiento, evaluacion y despliegue en robots compatibles, concretamente el robot tipo `omx_follower`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Task Diffusion Transformer (DiT) con condicionamiento por texto e imagenes |
| Parametros totales | 248.855.302 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de politica robotica, no aplica contexto de texto) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje; la tarea se especifica en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza un Multi-Task Diffusion Transformer (DiT), una arquitectura que extiende la Diffusion Policy con un transformer de difusion de gran escala y condicionamiento por texto y vision. Esta combinacion permite que la politica aprenda multiples tareas de manipulacion robotica a partir de descripciones textuales y observaciones visuales. El modelo soporta tanto objetivos de difusion como de flow-matching, lo que ofrece flexibilidad en el metodo de entrenamiento.

El entrenamiento se realizo con el framework LeRobot sobre el dataset `super_chatton`, compuesto por 100 episodios y 73.842 fotogramas a 30 FPS. La configuracion de entrenamiento incluye 30.000 pasos, batch size de 80, optimizador Adam con learning rate de 0.0001 y seed 1000, utilizando la version 0.6.2 de LeRobot. La tarea especificada es: "Pick up the blue cube, and the yellow cube, and drop them in the green box one by one."

## Capacidades

- Generacion de acciones de robotica de 6 dimensiones a partir de observaciones de estado (6 valores) e imagenes de camara frontal y de muñeca (3, 480, 640).
- Condicionamiento por texto: puede interpretar descripciones de tareas en ingles, como la tarea de pick-and-place mencionada en el dataset.
- Condicionamiento por vision: utiliza dos camaras (frontal y muñeca) para percibir la escena y guiar la manipulacion.
- Soporte de objetivos de difusion y flow-matching, lo que permite adaptar el modelo a diferentes metodos de entrenamiento.
- Aprendizaje multitarea: la arquitectura DiT esta disenada para compartir conocimiento entre tareas, aunque este modelo concreto se ha entrenado en una sola tarea.
- Integracion nativa con LeRobot: se puede ejecutar con `lerobot-rollout` y entrenar con `lerobot-train`, facilitando el ciclo de desarrollo.

## Casos de uso

- Manipulacion pick-and-place en robots de brazo: el modelo puede controlar un robot tipo `omx_follower` para recoger cubos de colores y depositarlos en una caja, tal como fue entrenado.
- Aprendizaje por imitacion de tareas de manipulacion: sirve como base para entrenar nuevas politicas en tareas similares mediante el framework LeRobot, aprovechando el condicionamiento por texto e imagenes.
- Investigacion en politicas de difusion: se puede utilizar como referencia para comparar el rendimiento de DiT frente a otras arquitecturas, como la Diffusion Policy original o ACT, en tareas de robotica.
- Prototipado rapido de tareas de robotica: gracias a su integracion con LeRobot, el modelo se puede cargar y ejecutar en un robot real con pocos comandos, acelerando el ciclo de desarrollo y pruebas.
- Evaluacion de generalizacion multitarea: aunque este modelo esta entrenado en una tarea, la arquitectura DiT esta disenada para soportar multiples tareas, lo que permite experimentos de transferencia y adaptacion.
- Educacion y demostraciones: el modelo puede utilizarse en entornos educativos para ilustrar el funcionamiento de los diffusion transformers en robotica, ya que su despliegue es sencillo con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 248.8M parametros en FP32 (~1 GB) mas las activaciones del transformer y el procesamiento de imagenes de 480x640, la inferencia deberia caber en menos de 4 GB de VRAM. Es una estimacion, no un dato oficial.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA RTX 3060, RTX 4060 o superior. Para entrenamiento se recomienda una GPU con 8 GB o mas, como una RTX 3070 o una A10.
- Compatibilidad con consumer GPU: si, es probable que quepa en GPUs de consumo con 4 GB o mas.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot (PyTorch), usando el comando `lerobot-rollout`. No se mencionan opciones como vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible; depende del hardware y del numero de pasos de difusion.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| dit_super_chatton_4549 | Multi-task DiT | 248.8M | No aplica | No disponible | Apache 2.0 |
| Diffusion Policy (original) | U-Net | No disponible | No aplica | No disponible | No disponible |
| ACT | Transformer | No disponible | No aplica | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en el dataset `super_chatton` (100 episodios) para una tarea concreta de pick-and-place. Su capacidad de generalizacion a otras tareas o entornos es limitada y no ha sido evaluada.
- No se han publicado resultados de evaluacion en robot real; el rendimiento en condiciones diferentes a las del dataset es desconocido.
- El modelo requiere una configuracion de hardware especifica: robot `omx_follower`, camaras frontal y de muñeca a 480x640, y estado de 6 dimensiones. Cambios en estos parametros pueden degradar el rendimiento.
- Al ser una politica de difusion, la inferencia es iterativa y mas lenta que una politica de regresion directa, lo que puede afectar a tareas que requieren alta frecuencia de control.
- El modelo no es un modelo de lenguaje; no soporta generacion de texto ni otras tareas de NLP.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable de la seguridad del robot y del cumplimiento de normativas.
- Posibles sesgos: no se han identificado sesgos especificos, pero el modelo puede fallar en condiciones de iluminacion o con objetos no vistos en el entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/imstevenpmwork/dit_super_chatton_4549
- Dataset: https://huggingface.co/datasets/imstevenpmwork/super_chatton
- Paper: https://huggingface.co/papers/2507.05331
- LeRobot repositorio: https://github.com/huggingface/lerobot
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
