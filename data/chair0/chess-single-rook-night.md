# chair0/chess-single-rook-night

## Resumen

chess-single-rook-night es una politica de robotica basada en ACT (Action Chunking with Transformers), publicada en Hugging Face por el usuario chair0 mediante la libreria LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de imitacion (imitation learning) que traduce observaciones sensoriales de un robot —estado articular y dos camaras— en comandos de accion de 6 dimensiones. El repositorio ocupa 0,2 GB y contiene 51.668.614 parametros en formato safetensors, con licencia Apache 2.0.

El modelo se ha entrenado sobre el dataset chair0/chess_single_rook_noon_trimmed, compuesto por 39 episodios y 8557 fotogramas grabados a 30 FPS, con una unica tarea descrita como "Pick up the yellow print". El robot de destino es un so_follower (familia SO-100/SO-101 de bajo coste) con dos camaras, una en la muneca y otra lateral, ambas a 480x640. La politica consume observation.state de forma (6,) y devuelve un vector action de forma (6,).

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de un pipeline completo de LeRobot 0.6.1 (grabacion de datos, entrenamiento con ACT y despliegue con lerobot-rollout) para una tarea de pick-and-place sobre hardware de bajo coste. No incluye resultados de evaluacion en robot real, por lo que debe considerarse un punto de partida para reentrenamiento o ajuste antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de observacion temporal no especificada en la model card |
| Tipos de cuantizacion | no disponible (repo con pesos safetensors; sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no aplica (modelo de robotica; la unica tarea esta descrita en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot (model_name: act) |
| Tamano del repositorio | 0,2 GB |
| Tipo de robot | so_follower |
| Camaras | wrist, side |
| Entradas | observation.state (6,), observation.images.wrist (3, 480, 640), observation.images.side (3, 480, 640) |
| Salidas | action (6,) |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que predice fragmentos cortos de acciones (action chunks) en lugar de un unico paso de control. La arquitectura combina un codificador de imagen (normalmente un backbone tipo ResNet) que procesa las vistas de camara junto con el estado proprioceptivo, y un transformer encoder-decoder que genera la secuencia de acciones. Esta formulacion reduce el error de composicion acumulado en tareas de manipulacion de precision y permite tasas de exito altas en tareas de pick-and-place aprendidas de datos teleoperados, como describe el articulo arXiv:2304.13705.

El entrenamiento se realizo con LeRobot 0.6.1 durante 60.000 pasos, con tamano de lote 64, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. El dataset de origen contiene 39 episodios y 8557 fotogramas a 30 FPS para una sola tarea ("Pick up the yellow print"). La model card no especifica el numero total de tokens ni el desglose del dataset, ni indica si se aplicaron fases de RLHF o DPO; en el caso de ACT, el paradigma habitual es aprendizaje supervisado puro sobre demostraciones, sin modelado de recompensa.

## Capacidades

- Generacion de secuencias de acciones de 6 grados de libertad a partir de observaciones visuales y de estado articular.
- Manipulacion robotica de tipo pick-and-place para la tarea entrenada ("Pick up the yellow print").
- Fusion multimodal de dos vistas de camara (muneca y lateral) a 480x640 junto con un vector de estado de 6 dimensiones.
- Control a 30 FPS, frecuencia compatible con el dataset de entrenamiento.
- Inferencia sin recompensa explicita: no requiere entorno de simulacion ni funcion de reward durante la ejecucion.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica (politica de control de un solo horizonte de chunking).
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, vision-language, audio): no disponibles; no es un VLA ni un modelo generativo de lenguaje.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: el modelo recoge un objeto amarillo impreso desde una posicion fija y lo deposita, integrable en una celda de ensamblaje con un SO-100/SO-101 de bajo coste.
- Banco de pruebas para pipelines de LeRobot: sirve como referencia funcional para validar la instalacion, la calibracion de camaras y el flujo lerobot-train / lerobot-rollout con la version 0.6.1.
- Punto de partida para fine-tuning con datos propios: al ser un checkpoint ACT de 51,7 M de parametros y licencia Apache 2.0, se puede reentrenar sobre un dataset nuevo con `--policy.type=act`.
- Investigacion en aprendizaje por imitacion: util para comparar estrategias de chunking de acciones frente a politicas paso a paso en entornos con contacto fisico.
- Prototipado de robotica educativa: el coste de hardware y el tamano del modelo (0,2 GB) permiten desplegarlo en estaciones de trabajo modestas dentro de un aula o taller.
- Recoleccion de datos a escala mediante rollout: ejecutar la politica con `--strategy.type=base` sin grabacion para probar el comportamiento antes de capturar nuevas demostraciones.
- Validacion de robustez ante variaciones de iluminacion y posicion: al disponer de dos vistas, se puede medir empiricamente la sensibilidad del modelo a cambios de escena en la misma tarea.
- Referencia para replicacion de experimentos ACT: entorno controlado y reproducible con semilla 1000 y configuracion documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet"), por lo que no existe tasa de exito medida en robot real ni numero de ensayos por tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en precision completa ocupan aproximadamente 207 MB (51.668.614 parametros a 32 bits); en FP16 alrededor de 103 MB; en INT8 alrededor de 52 MB. Sumando buffers de activaciones y procesamiento de dos imagenes de 480x640, el consumo se mantiene por debajo de 1-2 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la practica (RTX 3050, RTX 3060, RTX 4090, A100, H100). No se requiere hardware de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en GPU integradas con soporte CUDA o en CPU (el modelo es lo bastante pequeno para inferencia en tiempo casi real a 30 FPS en CPU de escritorio, aunque no se han publicado mediciones concretas).
- Opciones de despliegue: LeRobot mediante los comandos `lerobot-rollout` y `lerobot-train` con `--policy.path=chess-single-rook-night`, sobre PyTorch. No hay soporte publicado para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Integracion con hardware: requiere un robot so_follower con dos camaras OpenCV configuradas a 640x480 y 30 FPS, y nombres de camara que coincidan con las claves de observacion (`observation.images.wrist`, `observation.images.side`).
- Latencia y throughput estimados: no disponibles. La model card no publica mediciones de latencia por chunk ni de frecuencia efectiva de control alcanzada en hardware real.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este checkpoint, por lo que la comparacion es estructural. Los modelos de referencia en la misma categoria son otros checkpoints ACT de LeRobot y las politicas de Diffusion Policy, tambien integradas en LeRobot.

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chair0/chess-single-rook-night (ACT) | 51.668.614 | estado (6,) + 2 imagenes 480x640 | sin evaluacion publicada | Apache 2.0 | Hugging Face, via LeRobot |
| Otros checkpoints ACT de LeRobot (p. ej. variantes SO-100/Aloha) | no disponible | similar (estado + camaras) | no disponible | generalmente Apache 2.0 | Hugging Face |
| Diffusion Policy (implementacion LeRobot) | no disponible | estado + camaras | no disponible | no disponible | repositorio LeRobot |
| Modelos VLA tipo pi0 (referencia cualitativa) | orden de miles de millones | lenguaje + vision + estado | no comparable directamente | no disponible | Hugging Face |

No se dispone de cifras homogeneas de exito por tarea para ninguno de los elementos de la tabla, por lo que no es posible establecer una jerarquia de rendimiento.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasa de exito, numero de ensayos ni condiciones de prueba publicadas, por lo que se desconoce si la politica funciona de forma fiable.
- Especializacion extrema: entrenada para una unica tarea ("Pick up the yellow print") sobre 39 episodios y 8557 fotogramas; es previsible un mal rendimiento fuera de esa tarea, posicion de objeto o configuracion de escena.
- Dependencia del hardware: la politica asume un robot so_follower con dos camaras concretas (wrist y side) y una disposicion fisica determinada; cambiar camaras, montaje o calibracion invalida el comportamiento aprendido.
- Sensibilidad a la iluminacion y al entorno: el nombre del repositorio sugiere una grabacion en condiciones concretas ("night"), lo que puede implicar un sesgo hacia ese regimen de luz.
- Riesgo de sobreajuste al operador: al provenir de datos teleoperados, puede reproducir sesgos del demostrador en trayectorias y tiempos.
- Sesgos conocidos: no disponibles; no hay analisis de sesgo publicado para este checkpoint.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de acciones incorrectas o inseguras cuando la observacion se sale de la distribucion de entrenamiento, sin mecanismo de rechazo o incertidumbre calibrada.
- Limitaciones de idioma: no aplica; la tarea esta descrita en ingles y el prompt de tarea debe coincidir con el texto usado en entrenamiento.
- Licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion; conviene verificar la licencia del dataset asociado.
- Seguridad en produccion: cualquier despliegue fisico deberia incluir limites de parada de emergencia y supervision humana, dado que no hay datos de fiabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chair0/chess-single-rook-night
- Dataset de entrenamiento: https://huggingface.co/datasets/chair0/chess_single_rook_noon_trimmed
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=chair0/chess_single_rook_noon_trimmed
- Articulo de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
