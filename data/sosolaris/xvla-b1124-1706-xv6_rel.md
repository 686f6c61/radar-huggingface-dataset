# SoSolaris/xvla-b1124-1706-xv6_rel

## Resumen

X-VLA es un framework de Vision-Language-Action (VLA) basado en flow matching y soft prompts que permite que un unico modelo reconcilie morfologias de robot, sensores y espacios de accion diversos. La idea central es tratar cada configuracion de hardware como una "tarea" codificada mediante un pequeno conjunto de embeddings de Soft Prompt aprendibles, de modo que un mismo modelo pueda adaptarse a distintos robots sin reentrenamientos completos. El paper asociado es arXiv:2510.10274.

Este repositorio concreto, `SoSolaris/xvla-b1124-1706-xv6_rel`, es un fine-tune del modelo base `lerobot/xvla-base` sobre un dataset propio de tareas de manipulacion bimanual. El modelo tiene 879.687.256 parametros (dato real leido de los pesos safetensors) y esta empaquetado en formato LeRobot, con pesos en safetensors y un tamano de repositorio de 1,8 GB. La licencia es Apache 2.0.

El modelo resuelve una tarea muy concreta: una politica de imitacion para el robot `solaria_bimanual` que debe "agarrar una lata y verter su contenido en una taza (sin agua)". Es relevante como ejemplo de fine-tuning de X-VLA sobre hardware real y como referencia para quien quiera replicar el flujo de entrenamiento con LeRobot 0.6.2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | X-VLA: Vision-Language-Action con flow matching y soft prompts (transformer multimodal) |
| Parametros totales | 879.687.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no de lenguaje general) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (empaquetado LeRobot) |

## Arquitectura y entrenamiento

X-VLA es un framework VLA "soft-prompted" con flow matching. Cada configuracion de robot o hardware se representa como una tarea codificada por un conjunto reducido de embeddings de Soft Prompt aprendibles, lo que permite a un unico modelo manejar morfologias, sensores y espacios de accion distintos. La arquitectura combina un codificador visual y de lenguaje con un cabezal de accion basado en flow matching, segun describe el paper arXiv:2510.10274.

Este fine-tune se entreno con LeRobot 0.6.2 durante 30.000 pasos, batch size 32, optimizador `xvla-adamw`, learning rate 0.0001 y semilla 1000. El dataset de entrenamiento es `SoSolaris/can_to_mug_merged_20261117_trimmed`, con 195 episodios, 200.716 frames a 30 FPS y una unica tarea: "Grab the can and pour its contain in the mug (without water)". No se especifica en la informacion disponible si hubo RLHF/DPO ni la composicion detallada del dataset mas alla de los episodios y frames indicados.

Entradas del modelo: tres imagenes (`observation.images.image` de 3x256x256, `observation.images.image2` de 3x256x256, `observation.images.image3` de 3x224x224) y un vector de estado `observation.state` de dimension 8. Salida: un vector de accion `action` de dimension 14.

## Capacidades

- Generacion de acciones de robot (politica de imitacion) para manipulacion bimanual.
- Procesamiento multimodal de tres flujos de camara simultaneos (vistas `up`, `right`, `left`).
- Control de un espacio de accion de 14 dimensiones a partir de un estado de 8 dimensiones.
- Ejecucion de la tarea especifica de agarre y vertido sobre el robot `solaria_bimanual`.
- Integracion con el ecosistema LeRobot para rollout y entrenamiento via CLI.
- Capacidad de fine-tuning desde el modelo base `lerobot/xvla-base` para nuevas tareas.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general ni multilingue en la informacion disponible.

## Casos de uso

- Manipulacion bimanual de vertido: el modelo ejecuta la tarea "agarrar la lata y verter en la taza" sobre el robot `solaria_bimanual`, usando tres camaras y un espacio de accion de 14 dimensiones.
- Base para fine-tuning en nuevas tareas de robotica: al derivar de `lerobot/xvla-base`, sirve como punto de partida para entrenar politicas sobre otros datasets con `lerobot-train`.
- Validacion de pipelines de imitation learning: util para comprobar el flujo completo de grabacion, entrenamiento y rollout con LeRobot 0.6.2 en hardware real.
- Prototipado en laboratorio: permite desplegar una politica entrenada con 195 episodios y 200.716 frames para evaluar robustez ante variaciones de posicion y luz.
- Investigacion en VLA con soft prompts: referencia practica de como X-VLA adapta un modelo unico a una morfologia concreta mediante embeddings de tarea.
- Benchmark interno de manipulacion: sirve como linea base para comparar nuevas politicas sobre la misma tarea y dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 879,7 M de parametros, en fp32 los pesos ocupan aproximadamente 3,5 GB, y en fp16/bf16 alrededor de 1,8 GB, a lo que hay que sumar activaciones y buffers de las tres camaras.
- GPU recomendadas: no disponible. Por tamano, una GPU consumer con 8-12 GB de VRAM deberia ser suficiente para inferencia en bf16, aunque no hay confirmacion oficial.
- Cabe en GPU consumer: probablemente si (RTX 3060 12 GB, RTX 4070, RTX 4090), segun el calculo de pesos; no verificado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion y `lerobot-train` para entrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de robotica.
- Latencia y throughput: no disponible. El dataset se grabo a 30 FPS y el rollout de ejemplo usa camaras a 640x480 y 30 FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SoSolaris/xvla-b1124-1706-xv6_rel | 879,7 M | no disponible | Manipulacion bimanual (vertido) | apache-2.0 | Hugging Face |
| lerobot/xvla-base | no disponible | no disponible | Base VLA multitarea | no disponible en la informacion | Hugging Face |
| Otros VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Modelo especializado en una unica tarea ("Grab the can and pour its contain in the mug (without water)"); no generaliza a otras tareas sin fine-tuning.
- Entrenado para el robot `solaria_bimanual` con tres camaras concretas (`up`, `right`, `left`); requiere que los nombres e indices de camara coincidan con las claves de observacion.
- Sin resultados de evaluacion publicados: no hay tasa de exito medida en robot real.
- Dataset pequeno (195 episodios, 200.716 frames) sobre una sola tarea, lo que limita la robustez ante variaciones de posicion, iluminacion o distractores.
- Riesgo de sobreajuste al entorno de grabacion y a la configuracion de hardware del autor.
- No se documentan sesgos, capacidades multilingues ni riesgos de alucinacion en el sentido de modelos de lenguaje, al ser un modelo de robotica.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- No se especifican requisitos de hardware oficiales ni latencias; el despliegue en produccion requeriria validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SoSolaris/xvla-b1124-1706-xv6_rel
- Paper X-VLA (arXiv:2510.10274): https://huggingface.co/papers/2510.10274
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/SoSolaris/can_to_mug_merged_20261117_trimmed
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SoSolaris/can_to_mug_merged_20261117_trimmed
- Guia LeRobot xvla: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
