# elijahleo/xvla-base-manufacturing

## Resumen

X-VLA-base-manufacturing es un modelo de vision-lenguaje-accion (VLA) para robotica, publicado por el usuario elijahleo en HuggingFace y entrenado sobre el modelo base lerobot/xvla-base. Se trata de un fine-tuning de una politica de imitacion destinada a controlar un robot manipulador en tareas de fabricacion y manejo de hardware. El modelo pertenece al ecosistema LeRobot de HuggingFace y sigue el pipeline de robotica, con licencia Apache 2.0.

El modelo implementa X-VLA, un marco VLA con flow matching y soft prompts aprendibles descrito en el paper arXiv:2510.10274. La idea central es tratar cada configuracion de robot o hardware como una "tarea" codificada mediante un conjunto reducido de embeddings de soft prompt, de modo que un mismo modelo pueda reconciliar morfologias, sensores y espacios de accion distintos. Este checkpoint concreto esta especializado en un unico robot de tipo `follow` con tres camaras.

El checkpoint cuenta con 879.687.256 parametros (aproximadamente 880 millones) y un repositorio de 1,8 GB en formato safetensors. Consume tres flujos visuales y un vector de estado de 8 dimensiones, y produce un vector de accion continua de 6 dimensiones. Es relevante como ejemplo de fine-tuning de politicas VLA de tamano medio para tareas industriales concretas dentro del ecosistema LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con flow matching y soft prompts (X-VLA) |
| Parametros totales | 879.687.256 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repo publica pesos en safetensors (sin variantes GGUF/AWQ/GPTQ declaradas) |
| Idiomas soportados | no disponible (las instrucciones de tarea del dataset estan en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

X-VLA es un marco VLA basado en flow matching que incorpora soft prompts aprendibles. Cada configuracion de robot o hardware se representa como una "tarea" codificada por un conjunto pequeno de embeddings de soft prompt, lo que permite que un unico modelo maneje morfologias de robot, sensores y espacios de accion heterogeneos. El modelo parte del checkpoint preentrenado lerobot/xvla-base y se especializa mediante fine-tuning supervisado sobre datos de imitacion. La arquitectura concreta del backbone de vision-lenguaje no se detalla en la informacion proporcionada, por lo que no es posible especificar el numero de capas, el tipo de atencion ni el encoder visual utilizado.

El entrenamiento se realizo con LeRobot 0.6.1 durante 20.000 pasos, con batch size 8, optimizador "xvla-adamw", learning rate 0,0001 y semilla 0. El dataset de fine-tuning, manufacturing_finetune, contiene 150 episodios y 218.964 fotogramas a 30 FPS, con tres tareas anotadas: "Take hardware from human and put in taped area", "put nuts in red cup and bolts in blue bucket" y "Put all hardware in bucket". No se documenta en la model card el uso de RLHF, DPO ni de tecnicas de decodificacion especulativa.

## Capacidades

- Control robotico por imitacion: genera acciones continuas de 6 dimensiones a partir de observaciones visuales y de estado.
- Percepcion multimodal: procesa tres flujos de imagen simultaneos (dos a 256x256 y uno a 224x224) junto con un vector de estado de 8 dimensiones.
- Ejecucion de tareas de manipulacion guiadas por instruccion textual en lenguaje natural (las tres tareas del dataset de entrenamiento).
- Adaptacion multi-robot mediante soft prompts: el diseno de X-VLA permite, en principio, acomodar distintas morfologias y espacios de accion con un mismo modelo.
- Fine-tuning posterior: sirve como punto de partida para entrenar politicas en nuevos datasets de robotica con LeRobot.
- No se documentan capacidades de generacion de texto, razonamiento simbolico, codigo, matematicas, tool calling ni agentes multi-paso, ya que el modelo es una politica de accion y no un modelo de lenguaje generativo de proposito general.

## Casos de uso

- Manipulacion de hardware en linea de montaje: el modelo recibe piezas de un operario humano y las coloca en una zona delimitada con cinta, tal y como se entreno en la tarea "Take hardware from human and put in taped area". Es adecuado porque dispone de tres vistas de camara que cubren pinza y entorno de trabajo.
- Clasificacion de tornillos y tuercas: separar tuercas en un vaso rojo y tornillos en un cubo azul mediante la politica entrenada para la tarea "put nuts in red cup and bolts in blue bucket". El modelo distingue objetos y contenedores por color usando la senal visual.
- Recoleccion y binning de piezas: agrupar todo el hardware disperso en un unico cubo con la tarea "Put all hardware in bucket", util para consolidar piezas al final de un puesto de trabajo.
- Base para fine-tuning en nuevas tareas industriales: partir de este checkpoint o de lerobot/xvla-base para entrenar politicas en otros datasets de fabricacion, reduciendo los pasos de entrenamiento respecto a un modelo desde cero.
- Investigacion en politicas VLA e imitacion: reproducir y comparar el comportamiento de un VLA con flow matching de ~880 M de parametros en entornos controlados de laboratorio.
- Prototipado de celdas robotizadas con camaras multiples: desplegar una configuracion de robot `follow` con camaras en pinza, vista superior y vista lateral para evaluar el comportamiento de la politica antes de escalar a produccion.
- Demostraciones y validacion de hardware LeRobot: usar el checkpoint para comprobar el funcionamiento de un robot y su calibracion con el comando `lerobot-rollout`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

Las cifras de memoria que siguen son estimaciones calculadas a partir de los 879,7 millones de parametros declarados, no datos publicados por el autor.

- VRAM estimada para los pesos: en FP32 unos 3,5 GB; en BF16/FP16 unos 1,8 GB; en INT8 unos 0,9 GB; en INT4 unos 0,45 GB (los formatos cuantizados no estan publicados, por lo que requeririan conversion propia).
- VRAM adicional: hay que sumar la memoria de activaciones y de los encoders visuales, no cuantificada en la informacion disponible.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM deberia poder cargar los pesos en BF16, aunque el margen real depende de las activaciones. Una RTX 3060 de 12 GB, una RTX 4090 o una A100 ofrecen holgura.
- Cabe en GPU de consumo: si, es un modelo de ~880 M de parametros, por lo que es apto para GPU de consumo recientes.
- Opciones de despliegue: el modelo esta integrado en LeRobot y se ejecuta mediante el comando `lerobot-rollout --strategy.type=base --policy.path=elijahleo/xvla-base-manufacturing`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una politica de accion robotica.
- Latencia y throughput: no disponible en la informacion proporcionada. El control se ejecuta a la frecuencia del robot y de las camaras (el dataset se grabo a 30 FPS).

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos alternativos en la informacion proporcionada. La unica comparacion documentada es con el modelo base del que deriva este checkpoint.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| elijahleo/xvla-base-manufacturing | 879.687.256 | no disponible | apache-2.0 | HuggingFace (0 descargas, 0 likes en el momento de la ficha) | sin resultados de evaluacion publicados |
| lerobot/xvla-base | no disponible | no disponible | no disponible | HuggingFace | no disponible |
| Otras politicas VLA (ACT, SmolVLA, pi0, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de evaluacion: la model card no reporta ninguna prueba en robot real, por lo que no hay tasa de exito conocida para las tareas entrenadas.
- Especializacion estrecha: el fine-tuning cubre solo tres tareas de fabricacion y un unico tipo de robot (`follow`), con un espacio de accion fijo de 6 dimensiones y un vector de estado de 8 dimensiones. No es un modelo generalista.
- Dependencia de la configuracion de sensores: el modelo espera exactamente tres camaras con nombres y resoluciones concretos (`observation.images.image` y `image2` a 256x256, `observation.images.image3` a 224x224). Cambiar la configuracion invalida la politica.
- Dataset pequeno: 150 episodios y 218.964 fotogramas son un volumen reducido, lo que aumenta el riesgo de sobreajuste al entorno, la iluminacion y las posiciones de objeto del dataset original.
- Riesgo de alucinacion motora: como toda politica de imitacion, puede generar acciones incorrectas o inseguras ante objetos, posiciones o condiciones de iluminacion no vistas, sin senal de confianza asociada.
- Idiomas: no se declara soporte multilingue; las instrucciones de tarea del dataset estan en ingles.
- Sesgos: no se documenta ningun analisis de sesgos visuales ni de robustez frente a distintos materiales, colores o formas de las piezas.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse tambien la licencia del modelo base y del dataset manufacturing_finetune antes de un despliegue en produccion.
- Uso en produccion: no debe desplegarse en celdas industriales sin validacion previa de seguridad fisica, ya que no se documentan limites de par, paradas de emergencia ni evaluacion de riesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/elijahleo/xvla-base-manufacturing
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Paper de X-VLA: https://huggingface.co/papers/2510.10274
- Dataset de entrenamiento: https://huggingface.co/datasets/manufacturing_finetune
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de LeRobot para X-VLA: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
