# mysterium99/xvla-newtasks-manufacturing

## Resumen

X-VLA es un framework de Vision-Language-Action (VLA) basado en flow matching y soft prompts, desarrollado en el ecosistema LeRobot de Hugging Face. El modelo trata cada configuracion de robot o hardware como una "tarea" codificada mediante un pequeno conjunto de embeddings de Soft Prompt aprendibles, lo que permite que un unico modelo reconcilie morfologias de robot, sensores y espacios de accion diversos. La variante aqui descrita, `mysterium99/xvla-newtasks-manufacturing`, es un fine-tuning sobre `lerobot/xvla-base` orientado a tareas de manipulacion en entornos de manufactura.

El modelo cuenta con 879.687.256 parametros (segun los pesos en safetensors) y un repositorio de 1,8 GB. Consume tres flujos de imagen (dos a 256x256 y uno a 224x224) y un vector de estado de 8 dimensiones, produciendo acciones de 6 dimensiones. Esta disenado para politicas de imitacion en robots reales, no para generacion de texto o razonamiento general.

Su relevancia radica en la arquitectura de soft prompts que permite reutilizar un mismo backbone VLA para distintas plataformas roboticas, reduciendo el coste de adaptacion. El fine-tuning publicado se entrena sobre un dataset de manufactura con 150 episodios y 218.964 frames a 30 FPS, con tareas concretas de manipulacion de hardware (tornillos, tuercas, pernos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con flow matching y soft prompts |
| Parametros totales | 879.687.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

X-VLA es un framework VLA que combina un backbone vision-language con un cabezal de accion basado en flow matching. La innovacion principal es el uso de Soft Prompts: cada configuracion de robot (morfologia, sensores, espacio de accion) se representa mediante un conjunto reducido de embeddings aprendibles que condicionan al modelo, permitiendo que una sola red maneje plataformas heterogeneas sin reentrenar el backbone completo. El modelo parte de `lerobot/xvla-base` y se especializa mediante fine-tuning.

El fine-tuning concreto se realizo sobre el dataset `manufacturing_finetune` (150 episodios, 218.964 frames, 30 FPS), con tres tareas: "Take hardware from human and put in taped area", "put nuts in red cup and bolts in blue bucket" y "Put all hardware in bucket". La configuracion de entrenamiento fue de 20.000 pasos, batch size 16, optimizador `xvla-adamw`, learning rate 0,0001, semilla 0 y LeRobot 0.6.1. El tipo de robot es `follow` con tres camaras (`gripper`, `newtop`, `newside`). No se detalla la composicion del dataset de preentrenamiento ni si hubo RLHF/DPO (no aplicable en este dominio).

## Capacidades

- Control de robot manipulador mediante imitacion: genera acciones de 6 dimensiones a partir de observaciones visuales y de estado.
- Percepcion multi-camara: procesa tres flujos visuales simultaneos (dos a 256x256, uno a 224x224).
- Manipulacion de objetos de manufactura: recogida de hardware, clasificacion de tuercas y pernos en contenedores.
- Interaccion humano-robot: tarea de recibir hardware de una persona y depositarlo en zona delimitada.
- Politica de imitacion entrenada por behavior cloning con flow matching.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de LLMs.
- No dispone de capacidades multilingues ni de generacion de texto.

## Casos de uso

- Clasificacion de tornilleria en linea de montaje: el modelo distingue tuercas y pernos y los deposita en recipientes codificados por color (rojo/azul), adecuado por su entrenamiento especifico en esa tarea.
- Recepcion de componentes de un operario: la politica "Take hardware from human and put in taped area" permite a un brazo robot recoger piezas entregadas manualmente y colocarlas en una zona marcada, util en estaciones de kitting.
- Alimentacion de contenedores en celulas de ensamblaje: la tarea "Put all hardware in bucket" sirve para consolidar piezas sueltas en un unico recipiente, reduciendo intervencion manual.
- Prototipado rapido de politicas de manipulacion: al estar construido sobre LeRobot, sirve como punto de partida para fine-tuning en nuevas tareas de manufactura con pocos episodios (150 en este caso).
- Investigacion en VLA multi-robot: la arquitectura de soft prompts permite evaluar la transferencia entre morfologias usando este checkpoint como referencia fine-tuneada.
- Demostraciones y validacion en laboratorio: con `lerobot-rollout` se puede ejecutar la politica en un robot `follow` durante 60 segundos para evaluar comportamiento antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 879,7 M de parametros, en fp32 serian aproximadamente 3,5 GB de pesos, en fp16 unos 1,8 GB, mas overhead de activaciones para tres flujos de imagen.
- GPU recomendadas: no especificadas por el autor. Por tamano, una GPU consumer con 8 GB o mas seria suficiente en fp16, aunque no hay confirmacion oficial.
- Cabe en GPU consumer: previsiblemente si (RTX 3060 12 GB, RTX 4070, RTX 4090), sin datos oficiales de latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para fine-tuning), con `--policy.device=cuda`.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS segun la tasa del dataset, pero no se confirma que la inferencia alcance ese ritmo en hardware consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mysterium99/xvla-newtasks-manufacturing | 879,7 M | VLA fine-tune (manufactura) | no disponible | apache-2.0 | Hugging Face |
| lerobot/xvla-base | no disponible | VLA base | no disponible | no disponible | Hugging Face |
| Otros VLA de LeRobot (p. ej. pi0, SmolVLA) | no disponible | VLA | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de robotica especializado: no es un LLM ni un modelo de lenguaje; no genera texto ni responde a prompts conversacionales.
- Entrenado unicamente en tres tareas de manufactura con 150 episodios; la generalizacion a otras tareas u objetos es limitada sin fine-tuning adicional.
- Sin resultados de evaluacion publicados: no hay tasas de exito reales en robot, por lo que el rendimiento en produccion es incierto.
- Dependencia de la configuracion de camaras: las claves de observacion (`observation.images.image`, `image2`, `image3`) y el tipo de robot `follow` deben coincidir exactamente con los del entrenamiento.
- Riesgo de sobreajuste al entorno de recogida de datos (iluminacion, posiciones de objetos, fondo); no se documentan pruebas con distractores o cambios de iluminacion.
- Licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Sin informacion sobre sesgos, ya que no procesa lenguaje natural.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/xvla-newtasks-manufacturing
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Paper X-VLA: https://huggingface.co/papers/2510.10274
- Dataset de fine-tuning: https://huggingface.co/datasets/manufacturing_finetune
- Guia LeRobot xvla: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=manufacturing_finetune
