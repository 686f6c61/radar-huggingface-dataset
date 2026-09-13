# Shizhec/xarm6_pick_toy_to_bowl_joint_diffusion_v3

## Resumen

xarm6_pick_toy_to_bowl_joint_diffusion_v3 es una politica de control visuomotor entrenada con el framework LeRobot de Hugging Face y publicada por el usuario Shizhec. No es un modelo de lenguaje: es una Diffusion Policy, es decir, un modelo generativo que produce trayectorias de accion continuas y multimodales condicionadas por observaciones visuales y de estado del robot. Concretamente, aprende una unica tarea de manipulacion sobre un brazo UFACTORY xArm6: "Pick up the toy and place it into the bowl." (coger el juguete y dejarlo en el cuenco).

El modelo tiene 91.503.927 parametros (unos 91,5 millones) y se distribuye en formato safetensors dentro de un repositorio de 0,4 GB, con licencia Apache 2.0. Consume dos flujos de imagen a 480x640 (camaras frontal y de muneca) mas un vector de estado de 7 dimensiones, y emite un vector de accion de 7 dimensiones, presumiblemente las posiciones articulares del brazo. Fue entrenado durante 100.000 pasos con batch de 32 y optimizador Adam sobre un dataset de 50 episodios y 23.967 fotogramas capturados a 30 FPS.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de Diffusion Policy (metodo descrito en el articulo arXiv 2303.04137) aplicado a una tarea de recogida y colocacion con contacto fisico, e integrado en el ecosistema LeRobot 0.6.1. Es util como referencia para investigacion en imitacion robotica, como punto de partida para reentrenamiento con datos propios y como plantilla de despliegue con los comandos `lerobot-rollout` y `lerobot-train`. No se han publicado resultados de evaluacion en robots reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusion para control visuomotor; backbone concreto no especificado en la model card) |
| Parametros totales | 91.503.927 (aproximadamente 91,5 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de observacion definida por el historial de observaciones usado por la politica (no especificada en la model card) |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en safetensors sin cuantizaciones documentadas |
| Idiomas soportados | no aplica. Modelo visuomotor sin capacidades linguisticas; la tarea se identifica con la instruccion en ingles "Pick up the toy and place it into the bowl." |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`); tamano del repositorio 0,4 GB |
| Tipo de robot | UFACTORY Robot (brazo xArm6) |
| Camaras de entrada | `front`, `wrist` |
| Entrada `observation.state` | STATE, forma `(7,)` |
| Entrada `observation.images.front` | VISUAL, forma `(3, 480, 640)` |
| Entrada `observation.images.wrist` | VISUAL, forma `(3, 480, 640)` |
| Salida `action` | ACTION, forma `(7,)` |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creacion (segun HuggingFace) | 2026-09-12 |
| Version de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

La Diffusion Policy trata el control visuomotor como un proceso generativo: en lugar de predecir una accion unica de forma directa, aprende a generar trayectorias de accion multi-paso mediante un proceso de difusion, lo que produce movimientos suaves y permite representar distribuciones multimodales de comportamiento. Esto resulta especialmente adecuado para tareas con contacto fisico intenso, como la manipulacion de objetos, donde los enfoques de regresion directa tienden a promediar modos de accion incompatibles entre si. El metodo de referencia es el articulo Diffusion Policy (arXiv 2303.04137), citado en la model card. La model card no detalla el backbone concreto de la red de denoising (tipo de encoder visual, uso de transformer o de U-Net convolucional, numero de pasos de difusion ni scheduler), por lo que ese extremo queda como no disponible.

El entrenamiento se realizo con LeRobot 0.6.1 durante 100.000 pasos, con batch size de 32, optimizador Adam, tasa de aprendizaje 0,0001 y semilla 0. Los datos proceden del dataset Shizhec/xarm6_pick_toy_to_bowl_joint_v2: 50 episodios, 23.967 fotogramas, capturados a 30 FPS, correspondientes a una unica tarea de recogida y colocacion. Se trata por tanto de aprendizaje por imitacion supervisado sobre demostraciones teleoperadas; no hay evidencia en la informacion disponible de RLHF, DPO ni de aprendizaje por refuerzo. La model card no reporta aumentos de datos, normalizacion, tecnicas de decodificacion especulativa ni innovaciones adicionales mas alla del propio esquema de difusion.

## Capacidades

- Generacion de trayectorias de accion continuas de 7 dimensiones (una por grado de libertad del xArm6) a partir de observaciones visuales y de estado.
- Control visuomotor a partir de dos camaras simultaneas: una frontal y otra montada en la muneca del robot.
- Ejecucion de una unica tarea de manipulacion: coger un juguete y depositarlo en un cuenco, en el entorno y la configuracion de camaras con los que se recogieron los datos.
- Generacion de movimientos suaves y multimodales gracias al esquema de difusion, adecuado para tareas con contacto fisico.
- Integracion con el ecosistema LeRobot mediante los comandos `lerobot-rollout` (inferencia en robot real) y `lerobot-train` (reentrenamiento o ajuste fino).
- Reentrenamiento factible sobre datasets propios en formato LeRobot usando `--policy.type=diffusion`.
- No dispone de tool calling, function calling, razonamiento multi-paso simbolico, capacidades multilingues ni modos de pensamiento. No procesa lenguaje natural como entrada funcional: la instruccion de tarea es un identificador de tarea textual, no una orden interpretada semanticamente por el modelo.
- Sin capacidades de audio, vision generativa, OCR ni comprension de imagenes general fuera del uso como condicionamiento de control.

## Casos de uso

- Reproduccion de una linea base de Diffusion Policy: el modelo permite replicar resultados de investigacion en manipulacion con contacto fisico sin necesidad de reentrenar desde cero, usando `lerobot-rollout` con un xArm6 y dos camaras configuradas a 640x480 y 30 FPS.
- Ajuste fino para tareas de pick-and-place propias: partiendo de estos pesos, un equipo puede reentrenar con su propio dataset LeRobot (por ejemplo, variando posiciones de objeto, iluminacion o utillaje) y comparar la curva de aprendizaje frente al entrenamiento desde inicializacion aleatoria.
- Banco de pruebas de pipelines de recogida de datos: sirve para validar la cadena completa de teleoperacion, calibracion, sincronizacion de camaras a 30 FPS y verificacion de que las claves de observacion (`observation.images.front`, `observation.images.wrist`, `observation.state`) coinciden con las del entrenamiento.
- Prototipado de automatizacion de recogida de piezas ligeras en laboratorio: el modelo puede controlar un xArm6 que recoja un objeto y lo deposite en un contenedor, como paso previo a una celda de clasificacion mas compleja que combine varias politicas.
- Docencia y formacion en robotica e imitacion: es un ejemplo compacto (91,5 M de parametros, 0,4 GB) de politica entrenada de principio a fin con LeRobot, util para cursos practicos de aprendizaje por imitacion y de modelos generativos aplicados al control.
- Evaluacion comparativa de metodos de difusion frente a metodos de regresion (por ejemplo, ACT) en la misma tarea y con el mismo dataset, midiendo tasa de exito y suavidad de trayectoria.
- Experimentos de robustez: al disponer de una camara de muneca ademas de la frontal, permite estudiar la contribucion de cada vista a la tasa de exito y a la generalizacion ante cambios de posicion del objeto.
- Integracion en bucles de control a 30 Hz: la politica puede ejecutarse en el bucle de control del robot sincronizada con la frecuencia de captura del dataset, siempre que la latencia de inferencia lo permita (no hay datos publicados de latencia).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye la seccion de evaluacion vacia, con la nota explicita de que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet"). No se dispone por tanto de tasas de exito, numero de ensayos ni condiciones de evaluacion. La busqueda web realizada no aporto informacion adicional relevante sobre el modelo (los resultados obtenidos no guardan relacion con el).

## Requisitos de hardware

- VRAM estimada para inferencia: con 91,5 M de parametros, los pesos ocupan aproximadamente 0,37 GB en FP32 y 0,18 GB en FP16/BF16. Sumando activaciones de dos flujos de imagen a 480x640, se estima un consumo total en torno a 1-2 GB, aunque es una estimacion propia y no un dato publicado.
- Entrenamiento: con optimizador Adam, el estado del optimizador y los gradientes multiplican por cuatro el espacio de los pesos (aproximadamente 1,5 GB solo para el modelo en FP32), a lo que se anaden activaciones con batch 32 y dos camaras a 480x640. Se recomienda un minimo de 12 GB de VRAM, siendo 24 GB una cifra comoda.
- GPU recomendadas para entrenamiento: NVIDIA A100, H100, L40S o RTX 4090. Para inferencia basta con GPUs muy modestas.
- Cabe en GPU de consumo: si. Para inferencia, cualquier GPU con 4 GB o mas de VRAM (por ejemplo, RTX 3050, RTX 3060, RTX 4060) es suficiente segun las estimaciones de tamano; el cuello de botella real es el procesamiento de imagen, no el numero de parametros.
- Despliegue: el soporte oficial es la libreria `lerobot` sobre PyTorch, mediante `lerobot-rollout` para inferencia en robot real y `lerobot-train` para entrenamiento. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. No se documenta la frecuencia de inferencia alcanzable ni el numero de pasos de difusion empleados, factores que determinan la latencia. El dataset de entrenamiento esta capturado a 30 FPS, lo que marca la frecuencia de control de referencia.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xarm6_pick_toy_to_bowl_joint_diffusion_v3 | Diffusion Policy para manipulacion (LeRobot) | 91,5 M | 2 camaras 480x640 + estado 7D; accion 7D | apache-2.0 | HuggingFace, 0 descargas |
| ACT (Action Chunking with Transformers) | Politica de imitacion por chunking de acciones | no disponible en la informacion proporcionada | tipicamente camaras + estado del robot | no disponible en la informacion proporcionada | implementada en LeRobot |
| SmolVLA | Vision-language-action para robotica | no disponible en la informacion proporcionada | vision + lenguaje + estado | no disponible en la informacion proporcionada | LeRobot / HuggingFace |
| Otros checkpoints de Diffusion Policy en LeRobot | Diffusion Policy | variable | variable segun tarea | variable | HuggingFace |

La comparacion cuantitativa no es posible con la informacion disponible: no hay benchmarks publicados de este checkpoint y no se dispone de especificaciones verificadas de las alternativas en el material proporcionado. La diferencia cualitativa principal es que este modelo cubre una unica tarea y un unico tipo de robot, mientras que las alternativas tipo VLA estan disenadas para generalizar a multiples tareas mediante instrucciones en lenguaje natural.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una sola tarea, un solo tipo de robot y un unico montaje de camaras (frontal y de muneca, 640x480, 30 FPS). Fuera de esa configuracion no cabe esperar un comportamiento util.
- Sin resultados de evaluacion: la model card no reporta tasa de exito ni numero de ensayos, por lo que se desconoce su fiabilidad real, incluida la variabilidad entre ejecuciones.
- Generalizacion limitada: con solo 50 episodios y 23.967 fotogramas, es previsible que el modelo sea sensible a cambios de iluminacion, posicion del objeto, distractores, fondo, utillaje o a un robot distinto aunque sea del mismo modelo. Esto no se ha medido, pero es un riesgo estructural del tamano del dataset.
- Sensibilidad a las claves de observacion: los nombres de camara deben coincidir exactamente con `front` y `wrist`; un mapeo incorrecto produce entradas mal condicionadas.
- Riesgo de fallo fisico: al tratarse de control de un brazo robotico, una politica mal condicionada puede provocar colisiones, agarres fallidos o danos en el objeto o en el entorno. Es imprescindible operar con limites de seguridad, parada de emergencia y espacio de trabajo despejado.
- Ausencia de comprension linguistica: la instruccion de tarea es una etiqueta de tarea, no una orden interpretada. No se puede pedir al modelo una tarea nueva mediante texto.
- Idiomas: no aplica; no hay soporte multilingue ni procesamiento de texto funcional.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se atribuya correctamente. No impone restricciones de uso comercial, pero tampoco ofrece garantias de ningun tipo.
- Trazabilidad: el repositorio presenta 0 descargas y 0 likes, y la fecha de creacion indicada es 2026-09-12. Se recomienda verificar la autoria y el estado del repositorio antes de integrarlo en cualquier flujo de produccion.
- Despliegue: no hay soporte para servidores de inferencia de modelos de lenguaje. Cualquier integracion en produccion debe construirse sobre el stack de LeRobot o sobre PyTorch directamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shizhec/xarm6_pick_toy_to_bowl_joint_diffusion_v3
- Dataset de entrenamiento: https://huggingface.co/datasets/Shizhec/xarm6_pick_toy_to_bowl_joint_v2
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Shizhec/xarm6_pick_toy_to_bowl_joint_v2
- Articulo de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Resultados de la busqueda web: no se encontro informacion relevante sobre el modelo; los resultados obtenidos no guardan relacion con el contenido solicitado.
