# HyeonseokE/smolvla_rq2_turn_off_lever_phase1_1000_10fps

## Resumen

smolvla_rq2_turn_off_lever_phase1_1000_10fps es un ajuste fino de SmolVLA, un modelo compacto de vision-lenguaje-accion (VLA) de 450.046.176 parametros (unos 450 millones) desarrollado por HyeonseokE a partir del checkpoint base lerobot/smolvla_base. El modelo no genera texto: recibe el estado articular de un robot SO-101 (6 valores) y tres imagenes RGB de 256x256, y devuelve un vector de accion de 6 dimensiones que controla el brazo. Esta entrenado para una unica tarea: "Turn the lever off; the status indicator should turn red." (apagar una palanca hasta que el indicador de estado se ponga rojo).

La relevancia de este checkpoint es doble. Por un lado, demuestra el flujo de trabajo completo de LeRobot 0.6.0 sobre hardware de consumo: un dataset de solo 20 episodios y 4344 fotogramas a 10 FPS basta para especializar un VLA de 450 M de parametros, cuyo repositorio ocupa 0,9 GB. Por otro, sirve como ejemplo reproducible de ajuste fino de bajo coste en robotica, con una configuracion de entrenamiento documentada (3350 pasos, batch 64, AdamW, learning rate 1e-4, semilla 1000).

Se trata de un artefacto de investigacion (el nombre remite a una "RQ2", es decir, una pregunta de investigacion) con 0 descargas y 0 "likes" en el momento de la consulta, sin resultados de evaluacion publicados y sin datos de contexto, cuantizacion o idiomas en la ficha. La licencia es apache-2.0. La busqueda web realizada no devolvio ninguna fuente relevante sobre este modelo: los resultados obtenidos correspondian al servicio de cadastro frances y no guardan relacion con el contenido de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); modelo de vision-lenguaje con cabeza/experto de acciones (metodo descrito en arXiv:2506.01844) |
| Parametros totales | 450.046.176 (aprox. 450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo conversacional; la instruccion de tarea usada en el entrenamiento esta en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Modelo base | lerobot/smolvla_base (ajuste fino) |
| Tipo de robot | so101_follower |
| Camaras | top, left_wrist (en la ficha de entradas se listan tres camaras: camera1, camera2, camera3) |
| Entradas | observation.state (6,); observation.images.camera1/2/3 (3, 256, 256) |
| Salidas | action (6,); action.radian_urdf0 (6,) |
| Tamano del repositorio | 0,9 GB |
| Version de LeRobot | 0.6.0 |

## Arquitectura y entrenamiento

SmolVLA se presenta en la model card como un modelo de vision-lenguaje-accion compacto y eficiente, con rendimiento competitivo a un coste computacional reducido y desplegable en hardware de consumo. El paper de referencia es arXiv:2506.01844. Este repositorio concreto no es el modelo base, sino un ajuste fino supervisado sobre lerobot/smolvla_base: se conservan los 450 M de parametros y se especializa la politica para una tarea de manipulacion sobre un robot SO-101. La informacion proporcionada no detalla la composicion interna del backbone de vision-lenguaje, el objetivo de entrenamiento ni el dataset de preentrenamiento original; esos datos deben consultarse en el paper.

El ajuste fino se realizo con LeRobot 0.6.0 sobre el dataset HyeonseokE/rq2_turn_off_lever_phase1_20_10fps, compuesto por 20 episodios y 4344 fotogramas a 10 FPS, con una unica tarea anotada de forma textual. La configuracion de entrenamiento reportada es: 3350 pasos, batch size 64, optimizador AdamW, learning rate 0,0001 y semilla 1000. No se documenta el uso de RLHF, DPO ni tecnicas de refinamiento por preferencias, algo esperable en un modelo de imitacion robotica; tampoco se indican tecnicas de decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de acciones de control: produce un vector de accion de 6 dimensiones por paso de inferencia, mas la variante action.radian_urdf0 (6,).
- Fusion multimodal: combina el estado articular del robot (6,) con tres flujos visuales RGB de 256x256.
- Condicionamiento por lenguaje: la tarea se especifica como texto ("Turn the lever off; the status indicator should turn red."), lo que permite reutilizar la misma politica con distintas descripciones si se reentrena.
- Manipulacion robotica por imitacion: ejecuta una tarea fisica de interaccion (accionar una palanca) aprendida de demostraciones humanas.
- Control en bucle cerrado a 10 Hz: la frecuencia del dataset de entrenamiento marca el regimen temporal esperado de la politica.
- No soporta generacion de texto, razonamiento, codigo ni matematicas: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues, vision general, audio ni modo de razonamiento explicito.
- No se documenta inferencia asincrona ni ejecucion multi-robot.

## Casos de uso

- Reproduccion de la tarea de apagado de palanca: desplegar la politica con `lerobot-rollout` sobre un SO-101 con camara cenital y de muneca, enviando la instruccion textual exacta del entrenamiento; es el escenario para el que se valido el ajuste.
- Punto de partida para nuevos ajustes finos: al derivar de lerobot/smolvla_base y tener pesos en safetensors, sirve como checkpoint inicial para tareas de manipulacion similares con pocos episodios.
- Estudio de imitacion con datos escasos: con 20 episodios y 4344 fotogramas es un caso de laboratorio para medir sobreajuste, sensibilidad a la semilla y curvas de aprendizaje en VLAs pequenos.
- Validacion de infraestructura LeRobot: probar el ciclo completo de grabacion, entrenamiento, publicacion en el Hub y rollout con LeRobot 0.6.0 antes de escalar a datasets mayores.
- Automatizacion de nicho en bancos de pruebas: accionar palancas o interruptores en celdas de ensayo donde no se justifica un sistema industrial completo y se admite control a 10 Hz.
- Docencia y formacion: ilustrar de forma tangible como un VLA de 450 M de parametros se especializa en una tarea fisica concreta y se ejecuta en una GPU de gama media.
- Analisis de robustez: repetir la tarea variando iluminacion, posicion de la palanca o colocando distractores para caracterizar la degradacion de la politica, ya que la ficha no incluye evaluacion alguna.
- Comparacion de experimentos internos: el nombre del repositorio codifica fase y semilla, lo que sugiere su uso como uno de varios brazos de un estudio comparativo de configuraciones de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la linea "_No evaluation results have been provided for this policy yet._", por lo que no existen tasas de exito, numero de ensayos ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 0,9 GB en precision de 16 bits (el repositorio completo pesa 0,9 GB) y en torno a 1,8 GB en fp32. Sumando activaciones y los tres tensores de imagen de 256x256, el consumo realista se situa en el rango de 1 a 3 GB, aunque no se dispone de mediciones publicadas.
- GPU recomendadas: cualquier GPU moderna con 4 GB o mas de VRAM. Una RTX 3060, RTX 4060, RTX 4090 o superior es mas que suficiente; tambien son validas GPU de centro de datos como A100 o H100 si el objetivo es ejecutar muchos rollouts en paralelo.
- GPU de consumo: si, cabe holgadamente en practicamente cualquier GPU de consumo actual y en plataformas integradas tipo Jetson Orin u Orin Nano. La ejecucion en CPU es posible por tamano, pero la idoneidad depende de mantener el bucle de control a 10 Hz.
- Opciones de despliegue: `lerobot-rollout` de LeRobot (con `--policy.path` apuntando a este repositorio y `--robot.type=so101_follower`) y entrenamiento posterior con `lerobot-train`. No aplican servidores de inferencia de texto como vLLM, TGI, llama.cpp u Ollama, porque el modelo no expone una interfaz de generacion de tokens.
- Latencia y throughput: no disponibles. La unica referencia temporal es la frecuencia del dataset, 10 FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este ajuste fino (smolvla_rq2_turn_off_lever_phase1_1000_10fps) | 450 M | VLA especializado (una tarea) | estado (6,) + 3 imagenes 256x256 + texto de tarea | apache-2.0 | HuggingFace, via LeRobot |
| lerobot/smolvla_base | 450 M | VLA generalista (modelo base) | estado + imagenes + instruccion | apache-2.0 | HuggingFace |
| OpenVLA | 7 B (aprox.) | VLA sobre LLM de 7 B con codificadores visuales | imagenes + instruccion | no verificada en la informacion disponible | HuggingFace |
| pi0 | 3,3 B (aprox.) | VLA con experto de acciones | imagenes + instruccion | no verificada en la informacion disponible | HuggingFace (openpi) |
| ACT | 80 M (aprox.) | Transformer de imitacion | estado + imagenes | no verificada en la informacion disponible | repositorios publicos |

Los datos de los modelos comparados proceden de informacion publica general sobre ellos y no han podido contrastarse con la busqueda web realizada, que no devolvio resultados relevantes. La ventaja principal de este checkpoint frente a alternativas como OpenVLA o pi0 es el tamano (450 M frente a miles de millones de parametros), lo que abarata el despliegue; la desventaja es que esta especializado en una unica tarea, mientras que los otros son modelos base de proposito general.

## Limitaciones y advertencias

- Dataset minimo: 20 episodios y 4344 fotogramas para una sola tarea. Es altamente probable el sobreajuste al entorno de grabacion y una generalizacion muy limitada.
- Sin evaluacion: no hay tasa de exito publicada, ni numero de ensayos, ni condiciones de prueba. No hay evidencia documentada de que la politica funcione fuera del entorno de recogida de datos.
- Sensibilidad al entorno: cambios de iluminacion, posicion de la palanca, fondo o presencia de distractores pueden degradar el comportamiento, ya que no se documenta aumento de datos ni variabilidad en el dataset.
- Dependencia del hardware concreto: la politica esta entrenada para un robot `so101_follower` con camaras `top` y `left_wrist`; los nombres e indices de camara deben coincidir con las claves de observacion, o la inferencia fallara.
- Riesgo fisico: se trata de control de un brazo robotico real. Es imprescindible disponer de parada de emergencia, limites de par y supervision humana durante cualquier prueba.
- Sin soporte conversacional: no debe usarse para generacion de texto, codigo, matematicas, atencion al cliente ni ninguna tarea de lenguaje. Su unica salida son acciones.
- Idiomas: la ficha no declara idiomas soportados. La instruccion de tarea del entrenamiento esta en ingles y no hay evidencia de que el condicionamiento funcione en castellano.
- Reputacion y mantenimiento: 0 descargas y 0 "likes", sin garantia de mantenimiento, soporte ni correcciones posteriores.
- Licencia: los pesos se publican bajo apache-2.0, lo que permite uso comercial del checkpoint. No obstante, la licencia del dataset de entrenamiento y las condiciones del modelo base deben verificarse por separado, porque no se detallan en la informacion disponible.
- Sesgos: no disponibles. No se documenta ningun analisis de sesgo demografico, etnico o de otro tipo, algo poco habitual en modelos de robotica pero relevante si el sistema interactua con personas.
- Metadatos: la ficha indica fecha de creacion 2026-09-15 y actualizacion 2026-09-15, posterior a la fecha de consulta, lo que conviene tener en cuenta al citar el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HyeonseokE/smolvla_rq2_turn_off_lever_phase1_1000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/rq2_turn_off_lever_phase1_20_10fps
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/rq2_turn_off_lever_phase1_20_10fps
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de imitacion (grabar datos y entrenar): https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
