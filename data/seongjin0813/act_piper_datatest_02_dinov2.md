# seongjin0813/act_piper_datatest_02_dinov2

## Resumen

El modelo `seongjin0813/act_piper_datatest_02_dinov2` es una politica de imitacion (imitation learning) entrenada con el metodo ACT (Action Chunking with Transformers) sobre el brazo robotico Piper en configuracion follower, con una unica camara frontal. Lo publica el usuario de HuggingFace seongjin0813 utilizando LeRobot 0.6.2, la libreria de aprendizaje por imitacion de HuggingFace, y se distribuye con licencia Apache 2.0. No es un modelo de lenguaje: es un controlador visuomotor que transforma observaciones (estado articular de 7 dimensiones mas imagen RGB de 240x424) en comandos de accion de 7 dimensiones.

El modelo resuelve el problema clasico de la manipulacion robotica por aprendizaje desde demostraciones: en lugar de predecir una unica accion por paso, ACT predice trozos de acciones (*action chunks*) de varios pasos futuros, lo que reduce el error de composicion y la varianza temporal tipica de las politicas reactivas. Con 62.475.591 parametros y un tamano de repositorio de 0,2 GB, es un modelo ligero, disenado para ejecutarse en tiempo real a 30 FPS junto al robot.

Su relevancia es fundamentalmente practica y de nicho: sirve como referencia reproducible de un pipeline completo LeRobot (dataset de 50 episodios y 42.213 fotogramas, entrenamiento de 100.000 pasos, publicacion en el Hub) para robots Piper, y como punto de partida para reentrenar o comparar variantes de ACT. El identificador del repositorio incluye el sufijo `dinov2`, lo que sugiere el uso de un backbone visual DINOv2, aunque la model card no lo detalla explicitamente. No se han publicado resultados de evaluacion en robot real ni benchmarks numericos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers); transformer con VAE condicional y *action chunking*, segun el paper arXiv:2304.13705. Backbone visual probablemente DINOv2 (inferido del nombre del repositorio, no confirmado en la model card) |
| Parametros totales | 62.475.591 (dato real, safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el modelo opera sobre observaciones actuales, no sobre una ventana de contexto textual |
| Tipos de cuantizacion | no disponible; pesos en safetensors (precision de entrenamiento no declarada) |
| Idiomas soportados | no disponible (modelo de robotica, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | piper_follower |
| Camaras | 1 camara frontal (`observation.images.front`) |
| Entrada de estado | `observation.state`, shape `(7,)` |
| Entrada visual | `observation.images.front`, VISUAL, shape `(3, 240, 424)` |
| Salida | `action`, shape `(7,)` |
| Tamano del repositorio | 0,2 GB |
| Libreria | lerobot 0.6.2 |
| Pipeline | robotics |
| Fecha de creacion | 2026-10-14 |
| Ultima actualizacion | 2026-10-14 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que combina un autoencoder variacional condicional (CVAE) con un transformer que decodifica un *chunk* de acciones futuras en lugar de un unico paso. La intuicion es que predecir varios pasos de una vez mitiga el problema de los errores compuestos de las politicas paso a paso y reduce el ruido de las demostraciones teleoperadas. En este caso concreto la politica consume dos entradas: el vector de estado articular de 7 dimensiones y una imagen frontal de 240x424 pixeles con 3 canales, y produce un vector de accion de 7 dimensiones. El nombre del repositorio incluye `dinov2`, lo que apunta a un encoder visual basado en DINOv2, pero la model card no especifica ni el backbone ni el tamano del chunk de acciones.

El entrenamiento se realizo con LeRobot 0.6.2 sobre el dataset `seongjin0813/piper_datatest_02`, compuesto por 50 episodios y 42.213 fotogramas grabados a 30 FPS, con la etiqueta de tarea "2". La configuracion declarada es de 100.000 pasos de entrenamiento, batch size de 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. No se documentan tecnicas de RLHF, DPO, aumento de datos, mezcla de datasets ni estrategia de decodificacion especulativa; tampoco se indica el numero total de tokens o muestras procesadas mas alla de lo deducible de los pasos por batch.

## Capacidades

- Generacion de comandos de accion de 7 grados de libertad a partir de estado articular e imagen frontal, en el espacio de acciones del robot Piper follower.
- Prediccion de *action chunks*: emite secuencias cortas de acciones en lugar de un unico paso, lo que estabiliza la ejecucion.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas, sin necesidad de recompensas ni simulador.
- Percepcion visual mono-camara para tareas de manipulacion dependientes de la posicion de objetos.
- Ejecucion en bucle cerrado a 30 FPS, sincronizada con la frecuencia de grabacion del dataset de entrenamiento.
- Inferencia local sin conexion a servicios externos, apta para despliegue en estaciones de trabajo con GPU o en hardware embebido.
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso simbolico ni capacidades multilingues: son capacidades fuera del ambito de una politica visuomotora.
- No hay evidencia de transferencia a otras tareas, robots o posiciones de camara distintas de las del dataset de entrenamiento.

## Casos de uso

- Manipulacion pick-and-place con brazo Piper: la politica toma la imagen frontal y el estado articular, y genera las acciones de aproximacion, agarre y deposito aprendidas de las demostraciones. Es el caso de uso directo documentado en la propia model card mediante `lerobot-rollout`.
- Reproduccion de una celda de trabajo ya teleoperada: si el entorno fisico, la iluminacion y la posicion de los objetos se mantienen igual que en los 50 episodios de entrenamiento, el modelo puede repetir la tarea "2" de forma autonoma durante la duracion configurada (por ejemplo, `--duration=60`).
- Base para *fine-tuning* en tareas nuevas: con 62,5 M de parametros y un repo de 0,2 GB, reentrenar sobre un dataset adicional es viable en una sola GPU consumer usando `lerobot-train` con `--policy.type=act`.
- Referencia metodologica para comparar variantes: sirve como punto de control ACT sobre robot Piper para medir el efecto de cambiar el backbone visual (por ejemplo, DINOv2 frente a ResNet) manteniendo el resto del pipeline.
- Validacion de infraestructura LeRobot: sirve para verificar la cadena completa de hardware, calibracion, camaras OpenCV y claves de observacion antes de invertir en datasets mayores.
- Robotica educativa y de laboratorio: al ser ligero y de licencia Apache 2.0, es adecuado para practicas de aprendizaje por imitacion en cursos y prototipos academicos.
- Investigacion en imitation learning: como politica de imitacion pequena, permite estudiar sensibilidad a la variabilidad de demostraciones, al numero de episodios y a perturbaciones visuales.
- Automatizacion de tareas repetitivas en lotes pequenos: dado que el dataset tiene solo 50 episodios de una tarea etiquetada como "2", encaja en escenarios de produccion de baja variabilidad y no en entornos no estructurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explicitamente: "No evaluation results have been provided for this policy yet". No hay tabla de tareas, numero de ensayos, exitos ni tasa de exito en robot real. Tampoco se proporcionan metricas de perdida de entrenamiento, curvas de aprendizaje ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de los 62.475.591 parametros, los pesos ocupan aproximadamente 0,25 GB en FP32 y 0,125 GB en FP16/BF16. Sumando activaciones de un backbone visual sobre imagenes de 240x424 y el estado del robot, la inferencia completa cabe holgadamente en menos de 1 GB de VRAM, aunque la cifra exacta no esta publicada.
- GPU recomendadas: cualquier GPU con soporte CUDA de gama media o superior es suficiente. Para entrenamiento se recomienda una RTX 3090, RTX 4090, A100 o H100; para inferencia en tiempo real basta con una GPU integrada moderna o una GPU de portatil con unos pocos GB de VRAM.
- Compatibilidad con GPU de consumo: si, con margen amplio. El modelo cabe en tarjetas como RTX 3060, RTX 4060, RTX 4090 y tambien en plataformas embebidas tipo Jetson Orin Nano o Jetson AGX Orin.
- CPU: la inferencia en CPU es tecnicamente posible por el tamano del modelo, pero la viabilidad depende de mantener los 30 FPS del bucle de control; no hay mediciones publicadas.
- Opciones de despliegue: LeRobot con PyTorch es la via documentada (`lerobot-rollout` con `--policy.path=seongjin0813/act_piper_datatest_02_dinov2`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a politicas roboticas de este tipo.
- Latencia y throughput: no disponibles. El unico requisito conocido es el ritmo de 30 FPS del dataset de entrenamiento, que marca la frecuencia de control objetivo.
- Requisitos adicionales del entorno: brazo Piper en modo `piper_follower`, puerto serie del robot y al menos una camara OpenCV configurada con nombres de observacion que coincidan con los del entrenamiento (`front`).

## Comparativa con modelos similares

Los datos de rendimiento de las alternativas no estan disponibles en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas objetivas.

| Modelo | Tipo | Parametros | Contexto / observaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| seongjin0813/act_piper_datatest_02_dinov2 | ACT con backbone probable DINOv2 | 62.475.591 | Estado (7,) + imagen (3, 240, 424) | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| Otras politicas ACT de LeRobot sobre robots distintos | ACT | no disponible | no disponible | Apache 2.0 (por defecto en LeRobot) | Hub de HuggingFace |
| Diffusion Policy (Chi et al.) | Politica de difusion para manipulacion | no disponible | no disponible | no disponible | Repositorio de investigacion |
| pi0 / pi0-FAST (Physical Intelligence) | Vision-language-action | no disponible | no disponible | no disponible | Segun publicacion del autor |

No se dispone de resultados comparativos de tasa de exito, latencia ni robustez entre estas alternativas.

## Limitaciones y advertencias

- Sin evaluacion publicada: no hay ninguna medida de tasa de exito en robot real ni en simulacion, por lo que se desconoce si la politica funciona de forma fiable.
- Especificidad extrema del dominio: entrenada con un unico robot (`piper_follower`), una unica camara frontal y una unica tarea etiquetada de forma no descriptiva como "2". No hay evidencia de generalizacion a otras tareas, posiciones de objeto, iluminacion o robots.
- Dataset reducido y de baja diversidad: 50 episodios y 42.213 fotogramas de una sola tarea. El sobreajuste a las condiciones de grabacion es un riesgo alto.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin resultados de terceros que confirmen su comportamiento.
- Sin informacion sobre sesgos: no se documentan sesgos de genero, raza u otros, pero tampoco analisis de sesgo visual. La politica heredara las correlaciones espurias presentes en las demostraciones (posiciones, colores, iluminacion).
- Riesgo de alucinacion en sentido roboticos: como toda politica generativa, puede producir acciones plausibles pero incorrectas ante observaciones fuera de distribucion, con riesgo de colision o dano en el robot y su entorno.
- Ambiguedad del identificador: el sufijo `dinov2` no se explica en la model card, por lo que la arquitectura exacta del encoder visual no esta confirmada.
- Ausencia de informacion de seguridad: no se documentan limites de par, paradas de emergencia ni validacion de espacios de trabajo.
- Licencia permisiva con matices: Apache 2.0 permite uso comercial, pero el autor no ofrece ninguna garantia ni soporte.
- Dependencia de version: entrenado con LeRobot 0.6.2; cambios de version en la libreria pueden alterar la compatibilidad de carga o el formato de las claves de observacion.
- Fecha de creacion futura (2026-10-14) en los metadatos del Hub, lo que conviene verificar antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seongjin0813/act_piper_datatest_02_dinov2
- Dataset de entrenamiento: https://huggingface.co/datasets/seongjin0813/piper_datatest_02
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=seongjin0813/piper_datatest_02
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
