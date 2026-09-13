# HyeonseokE/smolvla_turn_on_lever_ours_1000_10fps

## Resumen

SmolVLA es un modelo vision-lenguaje-accion (VLA) compacto orientado a robotica de manipulacion, desarrollado en el ecosistema LeRobot de Hugging Face. Esta ficha concreta, `HyeonseokE/smolvla_turn_on_lever_ours_1000_10fps`, es un ajuste fino del modelo base `lerobot/smolvla_base` sobre un unico conjunto de datos propio de 100 episodios que ejecuta una tarea especifica: accionar una palanca hasta que el indicador de estado se ponga en verde. Con 450.046.176 parametros (~450 M), esta pensado para ejecutarse en hardware de consumo, no en clusteres de GPU.

El modelo no es un modelo de lenguaje: no genera texto, no conversa y no soporta tool calling. Recibe observaciones multimodales (estado articular de 6 dimensiones e imagenes RGB de 256x256 procedentes de dos o tres camaras) y devuelve directamente una accion de 6 grados de libertad para el brazo robotico `so101_follower`. Su relevancia actual esta en que demuestra el flujo completo de imitacion de bajo coste: grabar datos a 10 FPS, ajustar una politica VLA compacta y desplegarla con una sola linea de comandos en un robot de escritorio.

Al tratarse de un ajuste fino de una sola tarea, con 0 descargas y 0 "likes" en el momento de la consulta, debe considerarse un artefacto de investigacion o de reproduccion, no una politica generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) compacta; politica de imitacion gestionada por LeRobot |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (este concepto no aplica a una politica de control; la model card no documenta ninguna ventana) |
| Tipos de cuantizacion | No disponible. El repositorio publica pesos en safetensors en precision completa; no se documentan variantes GGUF, int8 ni int4 |
| Idiomas soportados | No disponible. El modelo no es conversacional; acepta una instruccion de tarea en ingles: "Turn the lever on; the status indicator should turn green." |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `lerobot` 0.6.0) |
| Modelo base | `lerobot/smolvla_base` (ajuste fino) |
| Tipo de robot | `so101_follower` |
| Camaras declaradas | `top`, `left_wrist` |
| Entrada de estado | `observation.state`, forma `(6,)` |
| Entradas visuales | `observation.images.camera1`, `camera2`, `camera3`, forma `(3, 256, 256)` |
| Salidas | `action` `(6,)` y `action.radian_urdf0` `(6,)` |
| Frecuencia del dataset de entrenamiento | 10 FPS |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo de tipo vision-lenguaje-accion descrito por sus autores como compacto y eficiente, capaz de operar en hardware de consumo con un coste computacional reducido. Esta instancia concreta es un ajuste fino supervisado por imitacion de `lerobot/smolvla_base`; la model card no detalla la composicion interna (numero de capas, mecanismo de atencion, tipo de cabeza de acciones ni el esquema exacto de generacion de acciones), por lo que esos datos deben consultarse en la publicacion del metodo (arXiv:2506.01844). El modelo mapea estado + imagenes a acciones de 6 dimensiones, con dos cabezas de salida declaradas (`action` y `action.radian_urdf0`).

El entrenamiento se realizo con LeRobot 0.6.0 sobre el dataset `HyeonseokE/turn_on_lever_ours_10fps`: 100 episodios, 21.927 fotogramas a 10 FPS y una unica tarea. La configuracion registrada es de 17.100 pasos, tamano de lote 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. No se documenta el uso de RLHF, DPO ni ninguna fase de alineacion adicional, algo esperable en un modelo de control y no de lenguaje. Tampoco se documentan tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de acciones de control de 6 grados de libertad para el brazo `so101_follower` a partir de observaciones visuales y de estado.
- Percepcion multimodal: consume hasta tres imagenes RGB de 256x256 y un vector de estado de 6 dimensiones por paso de control.
- Ejecucion de la tarea concreta "accionar la palanca hasta que el indicador se ponga verde", aprendida por imitacion de 100 demostraciones.
- Control visual cerrado: la definicion de exito depende del estado del indicador, de modo que la politica debe reaccionar a la observacion de la camara.
- Inferencia continua: el bucle de despliegue (`lerobot-rollout`) mantiene la politica activa en tiempo real, con la frecuencia de control derivada de los datos a 10 FPS.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificacion simbolica.
- No tiene capacidades multilingues: la instruccion de tarea es una cadena fija en ingles.
- No dispone de modo "thinking", ni de entrada o salida de audio, ni de generacion de texto.

## Casos de uso

- Accionamiento de palancas e interruptores en bancos de pruebas: es exactamente la tarea entrenada, por lo que el modelo puede desplegarse directamente sobre un SO-101 para automatizar la activacion repetitiva de un mando fisico y verificar por vision que el indicador cambia a verde.
- Investigacion en aprendizaje por imitacion: sirve como referencia reproducible de ajuste fino sobre `lerobot/smolvla_base` con un presupuesto de 17.100 pasos y lote 64, util para estudiar sensibilidad a hiperparametros y semillas.
- Estudios de frecuencia de control: el dataset esta muestreado a 10 FPS, lo que permite analizar el efecto de la tasa de muestreo en la estabilidad de la politica comparandolo con variantes a otras frecuencias del mismo autor.
- Docencia y formacion en robotica de bajo coste: con ~450 M de parametros y un repositorio de 0,9 GB, es viable ejecutarlo en portatiles con GPU de gama media y usarlo en practicas de manipulacion.
- Validacion de la cadena de herramientas LeRobot: el comando `lerobot-rollout` con `--strategy.type=base` permite comprobar de extremo a extremo calibracion, mapeo de camaras y conexion del robot antes de abordar tareas mas complejas.
- Automatizacion de laboratorio con verificacion de estado: combinado con un sensor o con inspeccion visual externa, puede emplearse en rutinas donde haya que dejar un dispositivo en posicion "encendido" y confirmarlo.
- Punto de partida para fine-tuning en tareas afines: al derivar de una politica base y estar bajo Apache 2.0, es reutilizable como inicializacion para nuevos datasets de manipulacion con el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una seccion de evaluacion explicitamente vacia ("No evaluation results have been provided for this policy yet"), sin tabla de ensayos, exitos ni tasa de exito. Tampoco se han encontrado resultados de terceros en la busqueda web realizada. No se dispone, por tanto, de MMLU, HumanEval, GSM8K ni de metricas especificas de robotica como tasa de exito por tarea, numero de ensayos o tolerancia a cambios de posicion, iluminacion o distractores.

## Requisitos de hardware

- VRAM de pesos (estimacion aritmetica a partir de los 450 M de parametros, no documentada por el autor): ~1,8 GB en fp32, ~0,9 GB en bf16/fp16, ~0,45 GB en int8.
- VRAM total recomendada en inferencia: del orden de 2 a 4 GB en fp16 contando el encoder visual y las activaciones (estimacion).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM. Una RTX 3060, RTX 4060 o RTX 4090 es mas que suficiente; A100 y H100 quedan sobredimensionadas para este tamano de modelo.
- Cabe en GPU de consumo: si, con holgura, siempre que el sistema operativo y los drivers permitan el acceso a la GPU.
- Alternativas en el borde: NVIDIA Jetson Orin o plataformas similares, coherentes con el objetivo declarado de despliegue en hardware de consumo.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (con `--strategy.type=base` para no grabar episodios y `--policy.path=HyeonseokE/smolvla_turn_on_lever_ours_1000_10fps`), o PyTorch directamente a traves de la API de LeRobot. No aplican vLLM, TGI, llama.cpp ni Ollama, porque no es un modelo de lenguaje.
- Latencia y throughput: no disponible. El unico requisito conocido es que la politica debe sostener el ritmo de control derivado del dataset, 10 FPS.
- El comando de despliegue exige que los nombres de camara configurados coincidan con las claves de observacion usadas en el entrenamiento.

## Comparativa con modelos similares

La informacion proporcionada solo documenta el modelo base del que deriva. La tabla siguiente incluye alternativas conocidas del ambito VLA, marcando como "no disponible" todo dato que no aparece en el material consultado y que deberia verificarse antes de usarse en una decision tecnica.

| Modelo | Parametros | Entradas | Ambito de tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `HyeonseokE/smolvla_turn_on_lever_ours_1000_10fps` | 450 M (dato real del repositorio) | 3 imagenes 256x256 + estado 6D | Una tarea: accionar una palanca | Apache 2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | No disponible en la informacion (pertenece a la misma familia SmolVLA) | No disponible | Politica base para ajuste fino | No disponible | Hugging Face |
| SmolVLA (metodo, arXiv:2506.01844) | No disponible | No disponible | Manipulacion general con hardware de consumo | No disponible | Paper |
| OpenVLA | No disponible (referencia de la comunidad; debe verificarse) | No disponible | Politica VLA generalista de mayor tamano | No disponible | Proyecto abierto |
| Politicas tipo ACT o Diffusion Policy en LeRobot | No disponible | Estado + imagenes | Manipulacion por imitacion | No disponible | Hugging Face / repositorio LeRobot |

Nota metodologica: los datos de SmolVLA se han extraido de la model card y del repositorio; el resto de filas corresponden a conocimiento general no verificado en esta consulta y se marcan como no disponibles para no presentar cifras sin respaldo.

## Limitaciones y advertencias

- No existe ninguna evaluacion publicada: se desconoce la tasa de exito real de la tarea, incluso en el entorno exacto de grabacion.
- Especializacion extrema: el modelo ha visto 100 episodios de una sola tarea. Cualquier objetivo distinto, o incluso la misma palanca en otra posicion, puede provocar fallos silenciosos.
- Sobreajuste probable: 21.927 fotogramas y 17.100 pasos de entrenamiento sobre un unico escenario implican una capacidad de generalizacion muy limitada ante cambios de iluminacion, fondo, posicion de la palanca o presencia de distractores.
- Inconsistencia documentada en la model card: la seccion de detalles declara las camaras `top` y `left_wrist`, mientras que las entradas listadas son `camera1`, `camera2` y `camera3`. Hay que verificar los nombres reales antes de desplegar; un mapeo incorrecto invalida la politica.
- Dependencia del robot: esta entrenado para `so101_follower` con estado y accion de 6 dimensiones. Otro robot, otra cinematica o un URDF distinto requieren recalibracion y probablemente reentrenamiento.
- Frecuencia de control de 10 FPS: si el bucle de inferencia no sostiene ese ritmo, el comportamiento puede degradarse.
- Sin capacidades de lenguaje: no puede interpretar instrucciones nuevas ni explicar sus decisiones, lo que limita la depuracion y la supervision en produccion.
- Riesgo fisico: es una politica de actuacion sobre hardware real. Debe desplegarse con parada de emergencia, limites de corriente y espacio de trabajo despejado. Los fallos no se manifiestan como texto incorrecto, sino como movimientos potencialmente daninos.
- Licencia: los pesos se publican bajo Apache 2.0, lo que permite uso comercial, pero conviene revisar por separado la licencia del dataset de entrenamiento y del modelo base, y verificar si existe alguna restriccion adicional no reflejada en esta ficha.
- El repositorio muestra 0 descargas y 0 valoraciones, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_turn_on_lever_ours_1000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/turn_on_lever_ours_10fps
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/turn_on_lever_ours_10fps
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de entrenamiento por imitacion: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet

La busqueda web realizada no devolvio enlaces relevantes sobre este modelo: los resultados obtenidos no guardan relacion con SmolVLA ni con robotica.
