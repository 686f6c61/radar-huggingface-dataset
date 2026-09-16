# JanPhilipp/smolvla_ai_days_hammer_250

## Resumen

smolvla_ai_days_hammer_250 es un ajuste fino del modelo vision-language-action (VLA) SmolVLA, publicado por el usuario JanPhilipp sobre el checkpoint base lerobot/smolvla_base. Se trata de una politica de robotica entrenada por imitacion para una unica tarea de manipulacion: "Grab the hammer from the green area and place it on the red area". El modelo consume un vector de estado propioceptivo de 6 dimensiones y hasta tres imagenes RGB de 3x256x256, y produce un vector de accion de 6 dimensiones, por lo que no es un modelo de lenguaje sino un controlador visomotor.

Con 450.046.176 parametros (0,9 GB en safetensors) y licencia Apache 2.0, es relevante porque demuestra el flujo completo de LeRobot: grabar demostraciones con un brazo so_follower, entrenar una politica VLA compacta y desplegarla en hardware de consumo. El paper de referencia (arXiv:2506.01844) presenta SmolVLA como un VLA compacto que logra rendimiento competitivo con un coste computacional reducido y puede ejecutarse en hardware de gama de consumo.

El repositorio no incluye resultados de evaluacion en robot real, no declara idiomas soportados y no publica variantes cuantizadas. Es, por tanto, un artefacto de investigacion y demostracion (el dataset se llama ai_days_hammer_merged_250), no una politica validada para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacto; tipo exacto de backbone no disponible en la informacion proporcionada |
| Parametros totales | 450.046.176 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; no se publica horizonte de action chunking) |
| Tipos de cuantizacion | No disponible; el repo solo contiene pesos en safetensors (0,9 GB, consistente con 2 bytes por parametro) |
| Idiomas soportados | No disponible; la unica instruccion de tarea documentada esta en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Entrada | observation.state (6,), observation.images.camera1/2/3 (3, 256, 256) |
| Salida | action (6,) |
| Robot objetivo | so_follower |
| Tamano del repo | 0,9 GB |
| Modelo base | lerobot/smolvla_base |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action que mapea observaciones visuales y estado propioceptivo a acciones de control. En este ajuste concreto, la entrada son tres camaras a 256x256 mas un vector de estado de 6 grados de libertad, y la salida es un vector de accion de 6 dimensiones. La informacion proporcionada no detalla la composicion interna del backbone (encoder de vision, modulo de lenguaje, cabezal de acciones), el mecanismo de generacion de acciones ni el horizonte de prediccion; esos datos figuran como no disponibles en esta ficha.

El entrenamiento se realizo por imitacion (aprendizaje supervisado sobre demostraciones teleoperadas) partiendo de lerobot/smolvla_base, con LeRobot 0.6.2. Configuracion declarada: 30.000 pasos, batch size 32, optimizador AdamW, learning rate 0,0001, semilla 1000. El dataset JanPhilipp/ai_days_hammer_merged_250 contiene 250 episodios, 107.426 frames a 30 FPS, correspondientes a una unica tarea de recogida y colocacion de un martillo. No se reporta uso de RLHF, DPO ni tecnicas de refinamiento por refuerzo, ni innovaciones de decodificacion especulativa o atencion lineal.

## Capacidades

- Control visomotor: genera acciones de 6 grados de libertad a partir de imagenes y estado del robot.
- Percepcion multicamara: acepta hasta tres flujos visuales de 256x256 (camera1, camera2, camera3).
- Seguimiento de instruccion en lenguaje natural: la tarea se especifica mediante una cadena de texto en el momento de la ejecucion.
- Ejecucion de una tarea concreta de pick-and-place aprendida por imitacion: coger el martillo de la zona verde y depositarlo en la zona roja.
- Integracion con el ecosistema LeRobot: inferencia con `lerobot-rollout` y reentrenamiento con `lerobot-train`.
- Despliegue en hardware de consumo, segun lo indicado en el paper de SmolVLA.
- No soporta generacion de texto, razonamiento simbolico, codigo, matematicas, tool calling ni uso como agente conversacional: es una politica de robotica, no un LLM.

## Casos de uso

- Replicacion de la tarea de pick-and-place: ejecutar la politica sobre un brazo so_follower con la instruccion "Grab the hammer from the green area and place it on the red area", usando las mismas claves de observacion con las que se entreno. Es el unico escenario validado por el autor, aunque sin metricas publicadas.
- Punto de partida para ajuste fino con nuevos objetos o posiciones: al derivar de lerobot/smolvla_base, sirve como inicializacion para reentrenar con `lerobot-train` sobre un dataset propio de otra tarea de manipulacion.
- Docencia y talleres de robotica: el nombre del dataset (ai_days) sugiere un uso formativo; el flujo LeRobot permite mostrar de principio a fin la recogida de datos, el entrenamiento y el despliegue en una sola sesion.
- Evaluacion comparativa de politicas VLA: permite medir el coste de ajustar SmolVLA con 30.000 pasos y 250 episodios frente a otros enfoques de imitation learning del ecosistema LeRobot (ACT, Diffusion Policy) en una tarea identica.
- Pruebas de reproducibilidad de pipelines de entrenamiento: sirve para validar configuraciones de hiperparametros (AdamW, lr 1e-4, batch 32) y el comportamiento de LeRobot 0.6.2 en entornos controlados.
- Prototipado de estaciones de trabajo robotizadas en laboratorio: con dos o tres camaras fijas y objetos siempre en la misma zona verde/roja, la politica puede automatizar una secuencia repetitiva de traslado de herramientas.
- Analisis de robustez ante cambios de iluminacion, posicion o distracciones: al no haber evaluacion publicada, es un caso de uso de investigacion (medir tasa de exito en esas condiciones), no de explotacion directa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de exito, numero de ensayos ni metricas comparativas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 0,9 GB (2 bytes por parametro) o 1,8 GB si se cargan en fp32. Sumando encoder de vision y activaciones de dos o tres camaras a 256x256, el consumo total estimado esta en el rango de 2 a 4 GB, aunque no hay medicion oficial publicada.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM deberia ser suficiente (RTX 3060, RTX 4060, RTX 4090). A100 o H100 son compatibles pero sobredimensionadas para 450 M de parametros.
- Cabe en GPU de consumo: si, segun el paper de SmolVLA, que lo describe como desplegable en hardware de gama de consumo.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`, `--policy.device=cuda` en entrenamiento), ollama... no disponible; el repositorio no documenta exportacion a GGUF, ONNX, TensorRT ni soporte de vLLM o TGI. El formato publicado es safetensors para la libreria lerobot.
- Latencia y throughput: no se publican mediciones. Como referencia del bucle de control, el dataset se grabo a 30 FPS, por lo que una reproduccion fluida exigiria inferencia sostenida a 30 Hz; no se confirma si el modelo alcanza esa frecuencia en GPU consumer.
- Almacenamiento: el repositorio completo ocupa 0,9 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| JanPhilipp/smolvla_ai_days_hammer_250 | 450.046.176 | Pick-and-place de un martillo (tarea unica) | Apache 2.0 | HuggingFace, 0 descargas, 0 likes | Ajuste fino especifico; sin evaluacion publicada |
| lerobot/smolvla_base | No disponible (misma arquitectura, del orden de 450 M) | Politica VLA generalista, ajustable por tarea | No disponible en la informacion proporcionada | HuggingFace, dentro del ecosistema LeRobot | Modelo de partida de este ajuste; no ejecuta la tarea del martillo sin ajuste |
| Otras politicas de LeRobot (ACT, Diffusion Policy, pi0) | No disponible | Manipulacion por imitation learning | No disponible | Repositorio LeRobot | Candidatas naturales a comparacion, pero no hay datos de rendimiento en la informacion proporcionada |

No se dispone de cifras de rendimiento comparadas (tasa de exito, latencia, robustez) para ninguno de los modelos citados.

## Limitaciones y advertencias

- Especificidad extrema: la politica esta entrenada para una unica tarea ("coger el martillo de la zona verde y dejarlo en la zona roja"). Fuera de ese enunciado y de ese montaje fisico, el comportamiento no esta garantizado.
- Sin evaluacion publicada: no existen tasas de exito ni numero de ensayos, por lo que se desconoce su fiabilidad real en robot.
- Inconsistencia en la documentacion de camaras: la ficha declara "Cameras: camera1, camera2" pero la tabla de entradas incluye observation.images.camera1, camera2 y camera3. Hay que verificar cuantas camaras y con que claves de observacion se entreno realmente antes de desplegar.
- Sensibilidad al montaje: cambios en la posicion de las camaras, la iluminacion, el fondo o la posicion inicial del objeto pueden degradar el rendimiento; no hay datos que cuantifiquen esa degradacion.
- Alcance funcional limitado: no genera texto, no razona, no soporta tool calling ni agentes multi-paso. No debe describirse ni desplegarse como modelo de lenguaje.
- Idiomas: no se declara ningun listado de idiomas soportados; la instruccion documentada esta en ingles y se desconoce el comportamiento con instrucciones en castellano.
- Formato de despliegue: solo se publican pesos safetensors para lerobot. No hay versiones GGUF, ONNX ni cuantizadas, lo que limita opciones de despliegue fuera del ecosistema LeRobot.
- Riesgo de generalizacion erronea: como toda politica de imitation learning, puede reproducir comportamientos espurios presentes en las demostraciones (sesgos del operador, trayectorias idiosincrasicas). No se documenta ningun analisis de sesgos.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero al no existir evaluacion de seguridad ni de rendimiento, cualquier despliegue en produccion con personas o maquinaria cerca requiere validacion propia y medidas de seguridad fisica independientes.
- Metadatos de publicacion: el repositorio registra fecha de creacion y actualizacion del 15 de septiembre de 2026, con 0 descargas y 0 likes; no hay historial de uso que permita inferir su robustez en la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JanPhilipp/smolvla_ai_days_hammer_250
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/JanPhilipp/ai_days_hammer_merged_250
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=JanPhilipp/ai_days_hammer_merged_250
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Paper de SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
