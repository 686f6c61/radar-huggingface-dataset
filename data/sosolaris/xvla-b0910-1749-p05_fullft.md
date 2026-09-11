# SoSolaris/xvla-b0910-1749-p05_fullft

## Resumen

X-VLA es un marco de Vision-Language-Action (VLA) basado en flow matching y soft prompts, desarrollado en el ecosistema LeRobot de Hugging Face. Su idea central es tratar cada configuracion de robot o hardware como una "tarea" distinta, codificada mediante un pequeno conjunto de embeddings de Soft Prompt entrenables. De este modo, un unico modelo puede reconciliar morfologias de robot, sensores y espacios de accion heterogeneos sin necesidad de cabezas especificas por plataforma.

El repositorio `SoSolaris/xvla-b0910-1749-p05_fullft` es un ajuste fino (full fine-tuning) del modelo base `lerobot/xvla-base`, especializado en una unica tarea de manipulacion: coger un calcetin y depositarlo en una caja ("Grab the sock and put it in the box"). El modelo tiene 879.687.256 parametros (~880 M) y esta pensado para controlar un brazo robotico `so100_follower` con dos camaras.

Es relevante ahora porque los modelos VLA open source estan pasando de prototipos de laboratorio a politicas reutilizables publicadas en el Hub, con licencia Apache 2.0 y flujos de entrenamiento reproducibles mediante `lerobot-train`. Este checkpoint concreto ilustra ese patron: un modelo pequeno, desplegable en hardware de consumo, entrenado sobre un dataset reducido y ejecutable con `lerobot-rollout`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | X-VLA: Vision-Language-Action con flow matching y soft prompts por robot/tarea |
| Parametros totales | 879.687.256 (~880 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo distribuido en safetensors, 1,8 GB) |
| Idiomas soportados | no disponible (la instruccion de tarea se pasa en ingles: "Grab the sock and put it in the box") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

Datos adicionales de la model card:

| Parametro | Valor |
|---|---|
| Modelo base | `lerobot/xvla-base` |
| Tipo de robot | `so100_follower` |
| Camaras declaradas | `front`, `up` |
| Version de LeRobot | 0.6.2 |
| Pipeline | robotics |

Entradas y salidas declaradas:

| Feature | Tipo | Forma |
|---|---|---|
| `observation.images.image` | VISUAL | (3, 256, 256) |
| `observation.images.image2` | VISUAL | (3, 256, 256) |
| `observation.images.image3` | VISUAL | (3, 224, 224) |
| `observation.state` | STATE | (8,) |
| `action` | ACTION | (6,) |

## Arquitectura y entrenamiento

X-VLA es un framework VLA con flow matching: en lugar de predecir directamente las acciones, el modelo aprende un campo de flujo que transporta ruido hacia la distribucion de acciones objetivo, un esquema generativo habitual en politicas de robotica recientes. La innovacion diferencial son los soft prompts: cada configuracion de robot o hardware se representa como una tarea, codificada con un pequeno conjunto de embeddings aprendidos. Esto permite que un mismo modelo trate morfologias, sensores y espacios de accion distintos, en lugar de depender de adaptadores por plataforma.

Los detalles completos de la arquitectura (numero de capas, dimension del encoder de vision, tipo de backbone de lenguaje, composicion exacta del dataset de preentrenamiento y si hubo RLHF/DPO) no estan disponibles en la informacion proporcionada; deben consultarse en el paper asociado (arXiv 2510.10274).

En cuanto a este ajuste fino concreto, los hiperparametros documentados son: 4000 pasos de entrenamiento, batch size 32, optimizador `xvla-adamw`, learning rate 0.0001, semilla 1000 y LeRobot 0.6.2. El dataset de entrenamiento es `SoSolaris/socks_20_diversified`, con 20 episodios, 7188 frames y 30 FPS, correspondiente a una unica tarea de manipulacion. Se trata, por tanto, de un ajuste fino de proposito muy especifico sobre una cantidad de datos reducida.

## Capacidades

- Control robotico de imitacion: genera acciones de 6 grados de libertad (vector `action` de forma `(6,)`) a partir de observaciones visuales y de estado.
- Percepcion multimodal: consume simultaneamente tres flujos de imagen (dos a 256x256 y uno a 224x224) mas un vector de estado de 8 dimensiones.
- Condicionamiento por instruccion en lenguaje natural: la tarea se especifica mediante un string de texto (en este checkpoint, "Grab the sock and put it in the box").
- Ejecucion en bucle cerrado: integrado en LeRobot mediante `lerobot-rollout` con `--strategy.type=base`.
- Transferencia desde un modelo base preentrenado: admite ajuste fino posterior a partir de `lerobot/xvla-base`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es una politica de control, no un agente conversacional).
- Capacidades multilingues: no disponibles.
- Modelo de pensamiento (thinking mode), vision general o audio: no disponibles. La vision se usa exclusivamente como entrada sensorial para el control, no para tareas de descripcion o VQA documentadas.
- Generalizacion entre robots/morfologias: atribuida al diseno de soft prompts del framework X-VLA, no verificada en este checkpoint concreto (no hay resultados de evaluacion publicados).

## Casos de uso

- Recogida automatizada de objetos en linea de manipulacion: el modelo ejecuta la secuencia "coger el calcetin y ponerlo en la caja" sobre un `so100_follower`, con las camaras `front` y `up` como entrada. Es adecuado porque fue entrenado exactamente para esa tarea y ese hardware.
- Banco de pruebas de investigacion en imitacion: sirve como punto de partida reproducible (4000 pasos, semilla 1000, lr 0.0001) para comparar variantes de ajuste fino sobre el mismo dataset de 20 episodios.
- Base para experimentos de soft prompting entre morfologias: partiendo de `lerobot/xvla-base`, permite estudiar como se comportan los embeddings de Soft Prompt al cambiar de robot o de configuracion de camaras.
- Educacion y prototipado en robotica de bajo coste: al tratarse de ~880 M de parametros con licencia Apache 2.0, es viable ejecutarlo en GPUs de consumo y usarlo en cursos o talleres de aprendizaje por imitacion con el brazo SO-100.
- Clasificacion y separacion de prendas (socks) en demostraciones de logistica ligera: el modelo puede integrarse en una celda que recoja calcetines de una superficie y los deposite en un contenedor.
- Generacion de datos sinteticos de politica: las trayectorias producidas pueden registrarse (con estrategias de rollout distintas de `base`) para aumentar datasets de manipulacion.
- Validacion de pipelines de despliegue LeRobot: sirve para verificar la cadena completa de instalacion, calibracion de camaras, mapeo de claves de observacion y ejecucion de politica antes de entrenar modelos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la advertencia "_No evaluation results have been provided for this policy yet_", es decir, no hay tabla de tasa de exito en robot real (trials, successes, success rate). Tampoco se proporcionan resultados de MMLU, HumanEval, GSM8K ni de ninguna otra suite, algo esperable en una politica de control robotico.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB solo para pesos en bf16 (879,7 M de parametros) y unos 3,5 GB en fp32. Sumando los tres encoders de vision, las activaciones y el runtime de PyTorch, una estimacion razonable es de 4 a 6 GB en bf16 y de 6 a 8 GB en fp32. Son estimaciones derivadas del recuento de parametros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM. Modelos como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 son suficientes. En el extremo alto, A100 o H100 no aportan ventaja relevante por tamano, salvo para entrenamiento o despliegues con muchos procesos concurrentes.
- Cabe en GPU de consumo: si, el checkpoint esta claramente en el rango de GPU de consumo por numero de parametros y tamano de repo (1,8 GB).
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion y `lerobot-train` para reentrenamiento) sobre PyTorch. El modelo requiere CUDA (`--policy.device=cuda`) de forma tipica; no se documentan rutas de CPU. No hay soporte declarado para vLLM, TGI, llama.cpp, Ollama ni formatos GGUF, lo cual es coherente con que sea una politica robotica y no un modelo de lenguaje.
- Latencia y throughput: no disponibles. El dataset se grabo a 30 FPS, pero la frecuencia de inferencia alcanzable y el horizonte de accion del modelo no se especifican en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de conocimiento general sobre el ecosistema VLA y no de la informacion proporcionada en esta busqueda; se marcan como referencia y deben verificarse en sus propias fichas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SoSolaris/xvla-b0910-1749-p05_fullft` | ~880 M | no disponible | sin resultados publicados | Apache 2.0 | Hugging Face, via LeRobot |
| `lerobot/xvla-base` | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada | Hugging Face, via LeRobot |
| SmolVLA (referencia externa) | rango de cientos de millones | no disponible | no disponible | licencia open source (verificar) | Hugging Face, via LeRobot |
| OpenVLA (referencia externa) | orden de miles de millones (7B) | no disponible | no disponible | licencia abierta con condiciones (verificar) | Hugging Face |
| pi0 (Physical Intelligence, referencia externa) | orden de miles de millones | no disponible | no disponible | no disponible | no disponible |

Para una comparativa rigurosa de rendimiento habria que consultar las tablas de evaluacion en robot real de cada modelo, que no forman parte de la informacion disponible en esta ficha.

## Limitaciones y advertencias

- Ausencia total de evaluacion: el autor declara explicitamente que no hay resultados de evaluacion. No se conoce la tasa de exito real de la politica, ni siquiera en la tarea para la que fue entrenada.
- Dataset muy reducido: 20 episodios y 7188 frames para una unica tarea. El riesgo de sobreajuste a posiciones de objeto, iluminacion y fondo concretos es alto, y la generalizacion a variaciones del entorno no esta documentada.
- Acoplamiento al hardware: el modelo esta ajustado para el robot `so100_follower` con las camaras `front` y `up` (y una tercera entrada visual `observation.images.image3`). Las claves de observacion deben coincidir exactamente con las del entrenamiento; cambiar camaras, resoluciones o indices rompe la politica.
- Ambiguedad en la configuracion de camaras: la model card declara dos camaras, pero la tabla de entradas lista tres flujos visuales. Conviene verificar el mapeo real antes de desplegar.
- Especializacion extrema: la unica tarea documentada es "Grab the sock and put it in the box". No hay evidencia de que el checkpoint funcione en otras tareas sin reentrenamiento.
- Riesgo de alucinacion en el sentido generativo clasico: no aplica de forma directa, pero si existe el riesgo de producir acciones fisicamente invalidas o colisiones cuando la observacion se sale de la distribucion de entrenamiento. Es imprescindible operar con limites de seguridad y parada de emergencia en el robot.
- Sesgos: no hay informacion sobre la composicion demografica o ambiental del dataset; los sesgos previsibles son de tipo perceptivo (colores, texturas, iluminacion de los calcetines y del entorno de grabacion).
- Contexto e idioma: no se especifica ninguna longitud de contexto ni cobertura de idiomas. La instruccion de tarea se proporciona en ingles.
- Licencia: Apache 2.0, lo que permite uso comercial. No obstante, al ser un ajuste fino de `lerobot/xvla-base`, conviene verificar que la licencia del modelo base no imponga condiciones adicionales.
- Despliegue en produccion: no se documentan cuantizaciones, formatos optimizados ni latencias, por lo que no hay garantias de cumplimiento de requisitos de tiempo real sin medicion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SoSolaris/xvla-b0910-1749-p05_fullft
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/SoSolaris/socks_20_diversified
- Paper de X-VLA (arXiv 2510.10274): https://huggingface.co/papers/2510.10274
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de LeRobot para X-VLA: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SoSolaris/socks_20_diversified
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de aprendizaje por imitacion: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre el modelo. Los enlaces obtenidos corresponden a articulos sobre financiacion de facturas en Sudafrica y no guardan relacion con X-VLA ni con robotica, por lo que se han omitido.
