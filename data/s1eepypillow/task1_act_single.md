# s1eepypillow/task1_act_single

## Resumen

`s1eepypillow/task1_act_single` es una politica robotica entrenada con el metodo ACT (Action Chunking with Transformers) y publicada en HuggingFace Hub a traves de LeRobot. Se trata de un modelo de aprendizaje por imitacion que, en lugar de predecir una unica accion por paso, predice fragmentos cortos de acciones (action chunks), lo que reduce el error acumulado y suele elevar la tasa de exito en tareas de manipulacion. El repositorio pertenece al usuario `s1eepypillow` y esta etiquetado con el pipeline `robotics`.

El modelo tiene 51.627.654 parametros (unos 51,6 millones) y ocupa 0,2 GB en el repositorio, por lo que es un modelo pequeno y desplegable incluso en CPU o en dispositivos embebidos. Esta especializado en un unico robot de tipo `so_follower` y en una unica tarea denominada `task1`, con dos camaras de entrada (`top` y `wrist`) a 480x640 y un espacio de acciones de 6 dimensiones. No es un modelo de lenguaje: no genera texto, codigo ni mantiene conversaciones.

Su relevancia es practica para el ecosistema LeRobot: sirve como ejemplo reproducible de entrenamiento de una politica ACT sobre un dataset propio de 197 episodios y 58.913 fotogramas a 30 FPS, y como punto de partida para experimentos de imitacion en robotica de bajo coste. No se han publicado resultados de evaluacion ni benchmarks en la informacion disponible, y el repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con encoder CVAE para aprendizaje por imitacion (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.627.654 (~51,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; consume observaciones de estado e imagen y produce chunks de acciones) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de modelo | politica de robotica (imitation learning, robotics) |
| Libreria | lerobot 0.6.1 |
| Robot objetivo | `so_follower` |
| Camaras | `top`, `wrist` (3x480x640 cada una) |
| Entrada de estado | `observation.state` con forma (6,) |
| Salida | `action` con forma (6,) |
| Dataset de entrenamiento | `s1eepypillow/grad_block_merged_20260730_single` (197 episodios, 58.913 fotogramas, 30 FPS, tarea `task1`) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo implementa ACT, el metodo descrito en el paper *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705) al que apunta el propio repositorio. Segun dicho paper, ACT combina un encoder de variacion autoencoders condicional (CVAE) que procesa la secuencia de observaciones y acciones, un backbone convolucional tipo ResNet para las imagenes, y un transformer encoder-decoder que genera un chunk de acciones de longitud fija en lugar de una accion por paso. En inferencia, ACT suele aplicar *temporal ensembling* para promediar predicciones solapadas entre chunks consecutivos. Los hiperparametros concretos de esta politica (dimensión del modelo, numero de capas, tamano del chunk, uso o no de ensembling temporal) no estan publicados en la model card.

Los datos de entrenamiento provienen del dataset `s1eepypillow/grad_block_merged_20260730_single`, con 197 episodios teleoperados, 58.913 fotogramas a 30 FPS y la etiqueta de tarea `task1`. La configuracion de entrenamiento declarada es de 100.000 pasos, batch size 64, optimizador AdamW, learning rate 1e-5 y semilla 1000, ejecutada con LeRobot 0.6.1. La model card no menciona uso de RLHF, DPO ni etapas de refinamiento por refuerzo (habitual en ACT, que es puramente aprendizaje por imitacion supervisado). La model card conserva plantillas sin rellenar para el GIF de demostracion y la tabla de evaluacion, lo que indica que no se ha documentado ningun resultado en robot real.

## Capacidades

- Generacion de acciones de manipulacion: produce vectores de accion de 6 dimensiones para un brazo `so_follower`, en forma de chunks cortos.
- Percepcion visual multimodal: consume dos flujos de imagen simultaneos (camara `top` y camara `wrist`) a resolucion 3x480x640.
- Fusion de estado propioceptivo: incorpora `observation.state` de 6 dimensiones junto con las imagenes.
- Aprendizaje por imitacion de una tarea concreta: reproduce la tarea `task1` tal y como fue teleoperada en el dataset.
- Ejecucion en robot real mediante `lerobot-rollout`, con o sin grabacion de episodios segun la estrategia configurada.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingues ni de generacion de texto, codigo o matematicas.
- No dispone de modo thinking, vision general, audio ni generacion de imagenes (la vision es exclusivamente entrada).

## Casos de uso

- Manipulacion de bloques en banco de pruebas: el modelo esta entrenado especificamente para la tarea `task1` sobre un objeto tipo bloque; se usaria con `lerobot-rollout --policy.path=s1eepypillow/task1_act_single --task="task1"` para reproducir la tarea en un `so_follower` con camaras `top` y `wrist`.
- Baseline de investigacion en imitation learning: al ser una politica ACT de 51,6 M de parametros con configuracion de entrenamiento documentada (100.000 pasos, batch 64, AdamW, lr 1e-5), sirve como referencia reproducible para comparar contra Diffusion Policy u otras variantes en el mismo dataset.
- Fine-tuning con datos propios en LeRobot: el comando `lerobot-train` documentado permite reentrenar o ajustar la politica sobre un dataset nuevo, reutilizando la infraestructura de checkpoints y registro en W&B.
- Docencia y formacion en robotica de bajo coste: el modelo ilustra el flujo completo de LeRobot (instalacion, montaje, calibracion, grabacion de datos, entrenamiento e inferencia) con un caso de 197 episodios que cabe en un repositorio de 0,2 GB.
- Automatizacion de pick-and-place en linea piloto: para tareas de recogida y colocacion de piezas con posiciones aproximadamente fijas y el mismo montaje de camaras, el modelo puede ejecutarse de forma continua sin limite de duracion indicando `--duration` o dejandolo correr indefinidamente.
- Evaluacion de robustez ante cambios de entorno: al reejecutar la politica con variaciones de iluminacion, posicion inicial del objeto o ligeros cambios de camara, se puede medir la degradacion de la tasa de exito, ya que el dataset original no cubre esas variaciones de forma documentada.
- Integracion en pipelines de robot learning: la politica puede actuar como componente de un pipeline mayor (recoleccion de rollouts, evaluacion offline, comparacion entre checkpoints) usando la API de LeRobot y pesos safetensors cargables con PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con la frase explicita de que no se han proporcionado resultados para esta politica, y la tabla de tareas, intentos, exitos y tasa de exito aparece como plantilla vacia. Tampoco se documentan metricas de perdida final, error de accion ni curvas de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 51.627.654 parametros, los pesos ocupan aproximadamente 206 MB en fp32 y unos 103 MB en fp16; sumando activaciones de dos imagenes 3x480x640 y el estado de 6 dimensiones, el consumo total es de unos pocos cientos de MB.
- GPU recomendadas: no se requiere GPU dedicada. Cualquier GPU NVIDIA con CUDA (RTX 3060, RTX 4090, A100, H100) es mas que suficiente; el cuello de botella practico es la latencia de control del robot, no el computo.
- Compatibilidad con GPU de consumo: si, en cualquier GPU de consumo e incluso en CPU. El modelo es candidato para dispositivos embebidos tipo NVIDIA Jetson, siempre que se respete la frecuencia de control de 30 FPS.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento) sobre PyTorch con pesos safetensors. No aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia por chunk ni de frecuencia efectiva de inferencia en el robot objetivo.

## Comparativa con modelos similares

No se dispone de datos verificados de parametros, contexto o rendimiento de las alternativas en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas cualitativas.

| Modelo | Tipo | Parametros | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| `s1eepypillow/task1_act_single` | ACT (imitation learning, transformer + CVAE) | 51.627.654 | Apache-2.0 | no disponible (sin evaluacion publicada) |
| Diffusion Policy (Chi et al.) | Politica de difusion para manipulacion | no disponible | no disponible en la informacion proporcionada | no disponible |
| Otras politicas ACT de LeRobot Hub | ACT | no disponible | variable segun repositorio | no disponible |

La diferencia funcional mas relevante frente a una politica de difusion es el mecanismo de generacion: ACT predice chunks mediante un transformer condicionado por CVAE, mientras que Diffusion Policy genera acciones por desruido iterativo, lo que suele implicar mas pasos de inferencia. No se dispone de comparaciones numericas verificadas para este repositorio concreto.

## Limitaciones y advertencias

- Especializacion extrema: el modelo ha sido entrenado unicamente para la tarea `task1` sobre un dataset de una sola tarea; no generaliza a otras tareas ni a instrucciones en lenguaje natural.
- Dependencia del montaje fisico: requiere un robot `so_follower` y exactamente dos camaras con nombres `top` y `wrist`, resueltas a 640x480 y 30 FPS. Cambiar nombres, resolucion o colocacion de camaras rompe la correspondencia con las claves de observacion usadas en entrenamiento.
- Sin resultados de evaluacion: la model card no reporta tasa de exito, numero de intentos ni condiciones de prueba, por lo que no hay evidencia publica de fiabilidad en robot real.
- Riesgo de sobreajuste al dataset: 197 episodios y 58.913 fotogramas para 100.000 pasos de entrenamiento es una relacion que puede favorecer el ajuste a las posiciones, iluminacion y objetos concretos del dataset `s1eepypillow/grad_block_merged_20260730_single`.
- Sin capacidades de lenguaje ni multilingues: no admite prompts de texto, tool calling ni razonamiento multi-paso; cualquier expectativa de ese tipo es inaplicable.
- Deriva de dominio: pequenos cambios en iluminacion, fondo, posicion inicial del objeto o desgaste mecanico pueden degradar el comportamiento sin aviso.
- Sin garantias de seguridad: es una politica de aprendizaje por imitacion sin capa de seguridad explicita; en produccion debe operarse con limites de par, paradas de emergencia y espacio de trabajo despejado.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion, pero no cubre los derechos sobre el dataset de entrenamiento ni sobre el hardware; conviene revisar la licencia del dataset asociado antes de un despliegue comercial.
- Mantenimiento incierto: 0 descargas, 0 likes y una unica revision (creado y actualizado el 2026-09-15), sin indicios de soporte continuado por parte del autor.
- Model card incompleta: los apartados de demostracion y evaluacion siguen siendo plantillas sin rellenar, por lo que faltan detalles de reproducibilidad (chunk size, dimension del modelo, estrategia de ensembling en inferencia).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/s1eepypillow/task1_act_single
- Dataset de entrenamiento: https://huggingface.co/datasets/s1eepypillow/grad_block_merged_20260730_single
- Visualizacion del dataset en LeRobot Spaces: https://huggingface.co/spaces/lerobot/visualize_dataset?path=s1eepypillow/grad_block_merged_20260730_single
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Paper de ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a contenidos de television ajenos al ambito de la robotica y se han descartado.
