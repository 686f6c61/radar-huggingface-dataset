# HyeonseokE/smolvla_rq2_turn_off_lever_random_1000_10fps

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) de 450 millones de parametros disenado para controlar robots con coste computacional reducido. Este repositorio concreto, `HyeonseokE/smolvla_rq2_turn_off_lever_random_1000_10fps`, es un ajuste fino del modelo base `lerobot/smolvla_base` publicado por el usuario HyeonseokE, entrenado con LeRobot 0.6.0 sobre un unico conjunto de datos propio de 100 episodios y 21.657 fotogramas a 10 FPS.

El modelo resuelve una tarea muy concreta de manipulacion: girar una palanca hasta apagarla, comprobando que el indicador de estado se ponga rojo ("Turn the lever off; the status indicator should turn red."). Esta pensado para el robot `so101_follower`, un brazo de bajo coste, y consume estado articular de 6 dimensiones mas imagenes de camara, devolviendo una accion de 6 dimensiones.

Su relevancia es doble: por un lado demuestra que un VLA de tamano reducido puede desplegarse en hardware de consumo, y por otro sirve como ejemplo reproducible de ajuste fino de SmolVLA con LeRobot, con semilla, hiperparametros y configuracion de entrenamiento documentados. No es un modelo de lenguaje: no genera texto ni mantiene conversaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) compacta; la model card no detalla la arquitectura interna, ver arXiv:2506.01844 |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; la model card no especifica la precision) |
| Idiomas soportados | No disponible (las instrucciones de tarea del ejemplo estan en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Tipo de modelo | Politica robotica (pipeline `robotics`), libreria `lerobot` |
| Robot objetivo | so101_follower |
| Camaras declaradas | top, left_wrist |
| Entradas | `observation.state` (6,); `observation.images.camera1`, `camera2`, `camera3` (3, 256, 256) |
| Salidas | `action` (6,); `action.radian_urdf0` (6,) |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo, mas alla de identificarlo como SmolVLA y enlazar el articulo arXiv:2506.01844. Segun la descripcion publica del metodo, SmolVLA es un VLA compacto que parte de un modelo de vision-lenguaje preentrenado y anade un experto de acciones encargado de producir secuencias de acciones continuas; su objetivo declarado es lograr un rendimiento competitivo con un coste computacional reducido y poder desplegarse en hardware de consumo. Este repositorio no aporta detalles adicionales sobre el backbone, el mecanismo de atencion ni el numero de tokens de contexto.

El ajuste fino se realizo con LeRobot 0.6.0 durante 16.900 pasos, con tamano de lote 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000, sobre el conjunto de datos `HyeonseokE/rq2_turn_off_lever_random_100_10fps`: 100 episodios, 21.657 fotogramas y 10 FPS, correspondientes a la tarea "Turn the lever off; the status indicator should turn red.". Se trata de aprendizaje por imitacion a partir de demostraciones; la informacion disponible no menciona RLHF, DPO ni ningun otro ajuste por preferencias, ni innovaciones tecnicas adicionales especificas de este ajuste.

## Capacidades

- Generacion de acciones de control para un brazo robotico de 6 grados de libertad a partir de observaciones visuales y de estado articular.
- Percepcion visual multicamara: la configuracion declarada admite tres vistas de 256 x 256 pixeles, ademas del estado de 6 dimensiones.
- Ejecucion de una tarea de manipulacion concreta: girar una palanca hasta apagar un dispositivo y verificar el cambio de indicador a rojo.
- Seguimiento de instrucciones en lenguaje natural mediante la cadena de tarea (`--task`), en ingles en el ejemplo proporcionado.
- Salida dual declarada: `action` y `action.radian_urdf0`, ambas de dimension 6.
- No dispone de generacion de texto, razonamiento simbolico, codigo ni matematicas: no es un modelo de lenguaje.
- No hay evidencia de soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No hay informacion sobre capacidades multilingues ni sobre modo de razonamiento explicito (thinking).

## Casos de uso

- Automatizacion de una celda de apagado de emergencia: el modelo puede accionar la palanca de una maquina hasta que el indicador pase a rojo, integrándose en una secuencia de parada controlada del puesto.
- Investigacion en aprendizaje por imitacion: sirve como referencia reproducible de ajuste fino de SmolVLA, con semilla, tasa de aprendizaje, lote y numero de pasos documentados, para comparar variantes.
- Estudio de variabilidad segun semilla: el identificador del repositorio indica la semilla 1000, lo que permite contrastarla con otros ajustes del mismo autor sobre el mismo conjunto de datos.
- Base para un ajuste fino adicional: al partir de `lerobot/smolvla_base` y estar bajo Apache-2.0, se puede reentrenar con nuevas posiciones, otros objetos o un robot del mismo tipo.
- Despliegue en hardware de consumo: un modelo de 450 M parametros puede ejecutarse en una GPU de gama media o en una placa embebida junto al brazo SO-101, sin necesidad de un servidor dedicado.
- Practicas y laboratorios de robotica con LeRobot: el repositorio incluye comandos de despliegue y entrenamiento listos para usar, lo que facilita montar ejercicios de recogida de datos, entrenamiento y evaluacion.
- Recogida de datos asistida: al ser una politica entrenada sobre posiciones aleatorias de la palanca, puede emplearse para comparar la calidad de nuevas demostraciones frente a la politica existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye la seccion de evaluacion vacia y senala explicitamente: "No evaluation results have been provided for this policy yet.". No se dispone, por tanto, de tasas de exito en robot real, ni de resultados en MMLU, HumanEval, GSM8K u otras pruebas, que por otra parte no aplican a un modelo de accion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en bf16/fp16 y 1,8 GB en fp32 solo para los pesos; contando el codificador visual, las tres camaras a 256 x 256 y las activaciones, una horquilla razonable es de 2 a 4 GB. Es una estimacion, no un dato confirmado por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM. Cabe en RTX 3060, RTX 4060, RTX 4090, asi como en Jetson Orin y en Apple Silicon. No requiere A100 ni H100.
- Cabe en GPU de consumo: si, es uno de los objetivos declarados del metodo SmolVLA.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con `--policy.path=HyeonseokE/smolvla_rq2_turn_off_lever_random_1000_10fps`; tambien es posible cargar los pesos con PyTorch. No hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje de texto.
- Latencia y throughput: no disponible. Como referencia, los datos de entrenamiento se grabaron a 10 FPS y el comando de ejemplo configura las camaras a 30 FPS, pero no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este ajuste (SmolVLA, palanca) | 450 M | Una tarea concreta sobre so101_follower; instruccion en lenguaje natural; sin contexto declarado | Apache-2.0 | HuggingFace, via LeRobot |
| lerobot/smolvla_base | 450 M | Modelo base generalista de accion; ajustable a multiples tareas | Apache-2.0 | HuggingFace, via LeRobot |
| OpenVLA | 7 B (aproximado, no confirmado en esta busqueda) | VLA generalista basado en VLM y LLM | No disponible | HuggingFace |
| Octo | 27 M y 93 M (variantes base y small) | Politica generalista de accion por imitacion | No disponible | HuggingFace y repositorio publico |
| pi0 | No disponible | VLA generalista | No disponible | Repositorio abierto |

La comparacion cuantitativa de rendimiento no es posible: no hay resultados de evaluacion publicados para este ajuste, y la busqueda web realizada no devolvio informacion tecnica utilizable sobre los modelos alternativos.

## Limitaciones y advertencias

- Alcance muy reducido: un unico conjunto de datos, una unica tarea y un unico tipo de robot (`so101_follower`). La generalizacion a otros objetos, brazos o entornos es improbable sin reentrenamiento.
- Sin evaluacion publicada: no hay tasa de exito, numero de ensayos ni condiciones de prueba, por lo que no se puede estimar su fiabilidad real.
- Sensibilidad a las condiciones de demostracion: iluminacion, fondo, posicion de la camara, color del indicador y colocacion de la palanca afectan al comportamiento. Cualquier cambio respecto a las demostraciones puede degradar el resultado.
- Discrepancia en la configuracion de camaras: la model card indica "Cameras: top, left_wrist", pero la tabla de entradas declara tres camaras (`camera1`, `camera2`, `camera3`) de 3 x 256 x 256. Conviene verificar que las claves de observacion del robot coinciden exactamente con las usadas en el entrenamiento.
- Desajuste de frecuencia: los datos se grabaron a 10 FPS y el comando de ejemplo configura las camaras a 30 FPS; hay que comprobar si la politica gestiona ese cambio sin perdida de rendimiento.
- Riesgo fisico: se trata de una politica que mueve un brazo robotico real. Errores de la politica pueden provocar colisiones, danos al utillaje o lesiones; se recomienda limitar velocidades y fuerzas, y supervisar la ejecucion.
- Sin informacion sobre sesgos, idiomas soportados, cuantizacion ni precision de los pesos mas alla de lo indicado en la model card.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero la card pide citar el metodo SmolVLA y LeRobot. Hay que revisar tambien las condiciones del modelo base `lerobot/smolvla_base` y del conjunto de datos empleado.
- En el caso de uso industrial (apagar una maquina con palanca), el fallo al accionar la palanca puede tener consecuencias de seguridad; no debe sustituir a un sistema de parada de emergencia certificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HyeonseokE/smolvla_rq2_turn_off_lever_random_1000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/HyeonseokE/rq2_turn_off_lever_random_100_10fps
- Articulo de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv: https://arxiv.org/abs/2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de inferencia y despliegue: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del conjunto de datos: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/rq2_turn_off_lever_random_100_10fps
- Nota sobre la busqueda web: las consultas realizadas no devolvieron resultados relacionados con este modelo; los unicos resultados obtenidos eran paginas sin relacion con el tema.
