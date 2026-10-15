# digas99/smolvla_so101_screwdriver_box

## Resumen

`digas99/smolvla_so101_screwdriver_box` es un ajuste fino de SmolVLA, un modelo vision-language-action (VLA) de unos 450 millones de parametros, desarrollado por el usuario digas99 a partir de `lerobot/smolvla_base`. Resuelve una tarea muy concreta de robotica manipulativa: un brazo seguidor LeRobot SO-101 debe coger uno de cuatro objetos de una mesa (destornillador, cinta amarilla, tuerca o pila) y dejarlo en una caja. La instruccion de texto indica cual es el objeto, de modo que una unica politica cubre las cuatro tareas sin cambiar de pesos.

El modelo se ha entrenado sobre el dataset `digas99/so101_screwdriver_box`, compuesto por 201 episodios y 86.560 fotogramas a 30 fps, con dos camaras (una fija cenital y otra montada en la pinza), en formato LeRobot v3.0 y con `robot_type: so_follower`. La entrada combina el estado de las seis articulaciones, las dos imagenes RGB y la cadena de tarea; la salida es un vector de seis acciones en el mismo orden de articulaciones. Internamente la politica trocea la accion en bloques de 50 pasos (`chunk_size = 50`), lo que equivale a 1,67 segundos de acciones por inferencia.

Su relevancia es practica: es un ejemplo reproducible y ligero (menos de 1 GB de pesos) de como adaptar un VLA generico a un hardware de bajo coste como el SO-101 con pocos centenares de episodios, licencia Apache-2.0 y un contrato de entrada/salida documentado al detalle. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 "likes", por lo que no cuenta con validacion independiente de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA; transformer multimodal con experto de acciones entrenado mediante flow matching |
| Parametros totales | 450.046.176 (aprox. 450 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos sin cuantizar en safetensors) |
| Idiomas soportados | no disponible; las cuatro instrucciones de entrenamiento estan en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`; tamano del repo 0,9 GB) |
| Modelo base | `lerobot/smolvla_base` (fine-tune) |
| Dataset de entrenamiento | `digas99/so101_screwdriver_box` (201 episodios, 86.560 fotogramas, 30 fps, LeRobot v3.0) |
| Entradas | `observation.state` float32 (6,), `observation.images.top` uint8 HWC (480, 640, 3) RGB, `observation.images.wrist` uint8 HWC (480, 640, 3) RGB, `task` (str) |
| Salidas | `action` float32 (6,), mismo orden de articulaciones y unidades que `observation.state` |
| Configuracion de acciones | `chunk_size = 50`, `n_action_steps = 50`, `n_obs_steps = 1` |
| Robot objetivo | LeRobot SO-101 follower (`robot_type: so_follower`), modo grados |
| Version de libreria | `lerobot[smolvla]==0.6.1` |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action que combina un codificador visual y un modelo de lenguaje con un experto de acciones que genera trayectorias mediante flow matching. En este ajuste fino concreto, el codificador visual y el modelo de lenguaje se mantuvieron congelados y solo se entrenaron el experto de acciones y la proyeccion del estado, un esquema de adaptacion muy economico en computo. El modelo base reserva tres ranuras de camara; en este checkpoint solo se usan dos, con el mapeo `observation.images.top -> camera1` y `observation.images.wrist -> camera2`. Ese renombrado queda almacenado dentro del preprocesador del checkpoint, de forma que en inferencia se deben pasar las claves originales del dataset sin renombrar nada.

El entrenamiento se realizo durante 20.000 pasos con batch de 64 (aproximadamente 14,8 epocas sobre los 86.560 fotogramas), tasa de aprendizaje de 0,0001 con 1.000 pasos de calentamiento y decaimiento coseno hasta 2,5e-6 en el ultimo paso. La funcion de perdida es un MSE de flow matching y se ejecuto en una unica GPU NVIDIA L4 de 24 GB con `lerobot` 0.6.1. Se aplico el aumento de imagen por defecto de LeRobot (brillo, contraste, saturacion, tono, nitidez y una pequena transformacion afin). No se reservo ningun conjunto de validacion: los 201 episodios se usaron para entrenar. La model card incluye `train_log.txt`, `train_config.json` y `train_env_versions.txt` para reproducir la ejecucion.

El dataset tiene una estructura progresiva: en los primeros 50 episodios la caja esta en una posicion fija, despues se varia; a partir del episodio aproximado 137 hay varios objetos sobre la mesa y la instruccion selecciona el objetivo. El reparto de episodios por tarea es de 137 para el destornillador, 24 para la cinta amarilla, 20 para la tuerca y 20 para la pila, un desbalance notable. Se conservaron deliberadamente algunos episodios con recuperaciones naturales (fallo de agarre, reaproximacion), lo que introduce ejemplos de correccion en los datos.

## Capacidades

- Generacion de acciones de manipulacion de 6 grados de libertad (cinco articulaciones mas pinza) a partir de observaciones multimodales.
- Seleccion de objeto dirigida por lenguaje: la cadena de tarea determina cual de los cuatro objetos debe cogerse, con una sola politica para las cuatro tareas.
- Percepcion multimodal: procesa dos flujos de imagen RGB de 480x640 (camara cenital fija y camara en la pinza) junto con el estado articular.
- Troceado de acciones: emite bloques de 50 acciones por inferencia, equivalente a 1,67 s de ejecucion a 30 fps, y vuelve a inferir cada 50 llamadas.
- Recuperacion de fallos de agarre: el dataset incluye reaproximaciones tras fallos, por lo que la politica ha visto ejemplos de correccion.
- Ajuste del compromiso entre reactividad y consistencia mediante `n_action_steps` (por ejemplo 25 en lugar de 50 para reobservar cada 0,8 s).
- No dispone de tool calling ni de function calling.
- No implementa agentes ni razonamiento multi-paso mas alla del bucle cerrado de control.
- No ofrece capacidades de vision general (VQA, deteccion abierta) ni de generacion de texto: el modelo de lenguaje y el codificador visual estan congelados y solo alimentan al experto de acciones.
- No soporta audio.
- No hay informacion sobre capacidades multilingues; las instrucciones de entrenamiento son cuatro cadenas fijas en ingles que deben pasarse caracter a caracter.

## Casos de uso

- Recogida selectiva de piezas guiada por instruccion: el operador indica por texto cual de los cuatro objetos debe retirarse de la mesa y la politica ejecuta la recogida y el deposito en la caja. Es util en puestos de montaje o de control de calidad donde el objeto a retirar cambia de forma dinamica.
- Banco de pruebas para investigacion en VLA: al ser un checkpoint de 450 M con pesos de menos de 1 GB, permite experimentar con variaciones de `chunk_size`, `n_action_steps` y esquemas de reobservacion sin grandes costes de computo.
- Punto de partida para ajustes finos en nuevos objetos: el propio modelo demuestra que con 20 a 137 episodios por tarea se puede ensenar una habilidad nueva manteniendo congelados el codificador visual y el modelo de lenguaje, un procedimiento replicable con presupuestos modestos.
- Robotica educativa con LeRobot: el flujo `lerobot-record` con `--policy.path` permite a estudiantes ejecutar y evaluar una politica VLA real sobre un SO-101 en una sola orden, y el reprocesado por Python (`SmolVLAPolicy` mas `make_pre_post_processors`) sirve para entender el contrato de observaciones y acciones.
- Clasificacion y orden de banco de trabajo: recoger herramienta, consumible y componente suelto y dejarlos en una caja comun es un caso de "ordenacion" repetitivo que no requiere precision sub-milimetrica.
- Generacion de datos etiquetados: al ejecutar la politica en bucle, las grabaciones resultantes (`eval_smolvla_screwdriver_box`) pueden usarse como datos adicionales para reentrenar o comparar politicas sobre el mismo hardware.
- Validacion offline de politicas: el modelo permite comprobar el contrato de entrada y salida (formas, tipos, orden de articulaciones) antes de tocar el robot fisico, reduciendo el riesgo de comandos erroneos en el hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta la perdida de entrenamiento (MSE de flow matching) y remite a `train_log.txt`, pero no incluye metricas de exito en tarea, comparaciones con otras politicas ni evaluaciones en conjuntos retenidos. Tampoco se reservo ningun episodio para validacion, por lo que no existen datos de generalizacion publicados.

## Requisitos de hardware

- Entrenamiento reportado: 1 GPU NVIDIA L4 de 24 GB, con `lerobot` 0.6.1. Este es el unico dato de hardware confirmado en la model card.
- VRAM estimada para inferencia: los pesos en precision completa ocupan del orden de 1,8 GB y en bf16/fp16 unos 0,9 GB. Sumando activaciones y el procesamiento de dos imagenes de 480x640 reescaladas con padding a 512x512, es razonable esperar un consumo de unos 2 a 3 GB en bf16. Esta cifra es una estimacion de ingenieria, no un dato publicado.
- Cabe con holgura en GPU de consumo: RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090, asi como en GPUs de portatil con 6-8 GB. Tambien es viable en GPUs de centro de datos pequenas (L4, T4, A10).
- No se indica soporte de ejecucion en CPU; la via documentada es `policy.to("cuda")`.
- Opciones de despliegue: exclusivamente el ecosistema LeRobot mediante `pip install "lerobot[smolvla]==0.6.1"`, ya sea con la CLI `lerobot-record` o con la API de Python (`SmolVLAPolicy` y `make_pre_post_processors`). No es un modelo de lenguaje, por lo que no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El unico dato temporal es la granularidad de control: 50 acciones por inferencia a 30 Hz, es decir, 1,67 s de movimiento por reobservacion, o 0,8 s si se reduce `n_action_steps` a 25.
- Dato util para verificar magnitudes en produccion: la desviacion estandar de las acciones por articulacion en el dataset es `[31.9, 53.3, 51.8, 15.9, 35.7, 9.0]`.

## Comparativa con modelos similares

Los datos de los modelos alternativos que aparecen a continuacion no estan verificados en la informacion proporcionada y deben confirmarse antes de usarlos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `digas99/smolvla_so101_screwdriver_box` | 450 M | no disponible | Apache-2.0 | HuggingFace, 0 descargas | Ajuste fino especifico para SO-101 y cuatro objetos |
| `lerobot/smolvla_base` | misma arquitectura (aprox. 450 M) | no disponible | Apache-2.0 | HuggingFace | Modelo base generalista sin ajustar a esta tarea |
| OpenVLA-7B | aprox. 7 B | no disponible | no verificada | HuggingFace | VLA de referencia de mayor tamano; requiere mas VRAM |
| pi0 / openpi | no disponible | no disponible | no verificada | repositorio openpi | VLA con flow matching, orientado a brazos de mayor coste |

La comparacion significativa es con `lerobot/smolvla_base`: este checkpoint se distingue no por su tamano, que es el mismo, sino por su especializacion en un unico robot (SO-101), un conjunto fijo de camaras y cuatro instrucciones exactas.

## Limitaciones y advertencias

- No hay conjunto retenido: los 201 episodios se usaron en entrenamiento, por lo que no existe ninguna medida de generalizacion y el riesgo de sobreajuste al entorno grabado no esta cuantificado.
- Fuerte dependencia del entorno: la propia model card advierte de que cambiar las camaras, el montaje o el encuadre implica una distribucion distinta. Las imagenes deben estar en RGB (no BGR) y provenir idealmente de las mismas camaras.
- Dependencia de calibracion y configuracion del robot: hay que usar el mismo `--robot.id` y la misma calibracion y configuracion que en la grabacion del dataset. Las estadisticas de normalizacion viven dentro del checkpoint, de modo que se alimentan valores en bruto y se reciben valores en bruto.
- El orden de las articulaciones es critico: el normalizador es por articulacion. La politica devuelve acciones en el mismo orden que `observation.state` (shoulder_pan, shoulder_lift, elbow_flex, wrist_flex, wrist_roll, gripper), en valores de `lerobot-record` en modo grados, con rangos aproximados de -115 a 100.
- Instrucciones rigidas: las cuatro cadenas de tarea deben pasarse caracter a caracter. Cualquier variacion en la redaccion queda fuera de la distribucion de entrenamiento.
- Desbalance de datos: 137 episodios para el destornillador frente a 20 para la tuerca y la pila. Es esperable un rendimiento desigual entre objetos, aunque no hay metricas publicadas que lo confirmen.
- Solo cuatro objetos y una caja: no hay evidencia de transferencia a objetos, posiciones de caja o disposiciones no vistas.
- Riesgo de alucinacion en el sentido clasico (generacion de texto falso) no aplica porque el modelo no genera lenguaje; sin embargo, el modo de fallo equivalente es una accion fisica incorrecta o un agarre fallido, con riesgo material sobre el robot y el entorno.
- La model card menciona un ajuste practico si la politica llega al objeto pero duda al cerrar la pinza: reducir `n_action_steps` a 25 para reobservar cada 0,8 s. Es una indicacion de que el comportamiento por defecto puede ser poco reactivo.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero no exime de responsabilidad sobre la seguridad fisica de la instalacion, que recae integramente en quien despliega el modelo.
- Estado de validacion: 0 descargas y 0 "likes" en el momento de la consulta; sin revision por parte de terceros.
- El repositorio se creo y actualizo el 15 de octubre de 2026, con apenas diez segundos entre ambos eventos, lo que sugiere una subida automatizada sin mantenimiento posterior documentado.
- La model card proporcionada esta truncada a partir de la seccion "Offline verification before touching the robot", por lo que podria existir informacion adicional de validacion no recogida aqui.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/digas99/smolvla_so101_screwdriver_box
- Dataset de entrenamiento: https://huggingface.co/datasets/digas99/so101_screwdriver_box
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Repositorio y documentacion de LeRobot (referencia general del ecosistema, no enlazado en la model card): https://github.com/huggingface/lerobot
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo, su dataset o SmolVLA: los resultados obtenidos corresponden a noticias financieras y de criptomonedas sin relacion con el modelo. No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
