# Iwas-6127/act-model-mypick-color-20260926_235331

## Resumen

El modelo `Iwas-6127/act-model-mypick-color-20260926_235331` es una política robótica de aprendizaje por imitación entrenada con el método ACT (Action Chunking with Transformers), publicado en el paper arXiv:2304.13705 y referenciado en la propia model card. Lo desarrolla el usuario Iwas-6127 y se distribuye a través de Hugging Face dentro del ecosistema LeRobot, la librería de Hugging Face para robótica del mundo real. No es un modelo de lenguaje: su única función es generar comandos de acción continua para un brazo robótico a partir de observaciones visuales y de estado.

El modelo resuelve una tarea concreta de manipulación: dado el estado articular de un robot `so_follower` (6 dimensiones) y dos flujos de imagen RGB de 480x640 (`overview` y `handcamera`), produce un vector de acción de 6 dimensiones. ACT predice secuencias cortas de acciones (chunks) en lugar de un único paso, lo que reduce el error de compounding típico del behavior cloning y permite ejecutar movimientos más suaves y consistentes.

Su relevancia es acotada pero clara: es un ejemplo reproducible de política entrenada con 30 episodios teleoperados (6750 fotogramas a 15 FPS) y 51.668.614 parámetros, con licencia Apache-2.0, lo que lo convierte en un punto de partida razonable para fine-tuning, comparación de métodos de imitación o experimentación con robots de bajo coste tipo SO-100. La model card no incluye resultados de evaluación en robot real ni la descripción textual de la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) sobre transformer con encoder de observaciones y decoder de acciones; aprendizaje por imitación con chunking de acciones |
| Parametros totales | 51.668.614 (recuento real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); `n_obs_steps` y tamano de chunk no disponibles |
| Tipos de cuantizacion | no disponible; el repositorio contiene pesos en safetensors de 0,2 GB |
| Idiomas soportados | no aplica / no disponible (no genera texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Tipo de robot | `so_follower` |
| Camaras | `overview`, `handcamera` (RGB 3x480x640 cada una) |
| Entradas | `observation.state` (6,), `observation.images.overview` (3,480,640), `observation.images.handcamera` (3,480,640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | Iwas-6127/my_pick_test_color_20260926_221126 (30 episodios, 6750 fotogramas, 15 FPS) |
| Pasos de entrenamiento | 20.000 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que aprende de datos de teleoperacion y predice chunks de acciones en lugar de pasos individuales. La implementacion de LeRobot usa un transformer que codifica las observaciones (estado articular y las dos imagenes de camara) y un decoder que genera la secuencia de acciones; durante el entrenamiento se emplea un esquema tipo CVAE para modelar la variabilidad de las demostraciones, y en inferencia se aplica ensamblado temporal de los chunks para suavizar la trayectoria. El modelo resultante tiene 51.668.614 parametros, lo que lo situa en el rango de las decenas de millones, muy por debajo de un VLA.

El entrenamiento se realizo con LeRobot 0.6.2 sobre un dataset propio de 30 episodios y 6750 fotogramas a 15 FPS, con 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el numero exacto de tokens ni la composicion del dataset mas alla del nombre (`my_pick_test_color`), que sugiere una tarea de recogida selectiva por color. No hay indicios de RLHF, DPO ni ajuste por preferencias: es behavior cloning puro sobre demostraciones humanas. La model card deja el campo `Task(s)` vacio, por lo que la descripcion semantica de la tarea no esta formalmente declarada.

## Capacidades

- Generacion de acciones de manipulacion continua de 6 dimensiones para un brazo `so_follower` a partir de estado y vision.
- Percepcion visual con dos camaras simultaneas a 480x640 (`overview` y `handcamera`), lo que permite combinar contexto global de la escena con detalle de la pinza.
- Prediccion por chunks de acciones (action chunking), orientada a movimientos mas estables que una politica paso a paso.
- Ejecucion de politicas de imitacion entrenadas a 15 FPS sobre datos teleoperados.
- Integracion con el flujo de LeRobot: `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento o fine-tuning.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso simbolico ni planificacion de alto nivel.
- No tiene capacidades multilingues ni de generacion de texto: no procesa ni produce lenguaje.
- No dispone de modo "thinking", audio, vision generativa ni salidas multimodales mas alla de las acciones.

## Casos de uso

- Recogida selectiva por color en laboratorio o aula: el nombre del dataset apunta a una tarea de pick guiada por color; el modelo puede integrarse en una celda donde un operador cambia la posicion de las piezas para validar si la politica generaliza.
- Pick-and-place de piezas pequenas con robot de bajo coste: gracias a la camara `handcamera`, la politica puede controlar la aproximacion de la pinza en objetos de reducido tamano, un escenario habitual en montaje ligero.
- Banco de pruebas para comparar metodos de imitacion: al ser una politica ACT publicada con configuracion de entrenamiento completa (20.000 pasos, lr 1e-5, batch 8), sirve como linea base reproducible frente a Diffusion Policy u otras alternativas sobre el mismo dataset.
- Recoleccion de datos y teleoperacion asistida: puede desplegarse en modo `--strategy.type=base` con `lerobot-rollout` para generar ejecuciones continuas y estudiar donde falla la politica antes de ampliar el dataset.
- Automatizacion de tareas repetitivas de alimentacion de maquina: si la tarea consiste en coger una pieza y colocarla en una posicion fija, la politica puede sustituir a un operador en ciclos cortos, siempre tras validar la tasa de exito en el entorno real.
- Docencia e investigacion en robotica: al ejecutarse sobre hardware SO-100 y con pesos de ~0,2 GB, es viable en laboratorios docentes para explicar el pipeline completo de imitacion (grabacion, entrenamiento, rollout).
- Fine-tuning para tareas derivadas: el mismo pipeline (`lerobot-train --policy.type=act`) permite reentrenar con un dataset propio ampliado, por ejemplo anadiendo variaciones de iluminacion o nuevas posiciones de objeto.
- Validacion de robustez ante cambios de dominio: util para medir degradacion al mover la camara, cambiar el fondo o modificar la iluminacion, dado que no hay resultados de evaluacion publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con el texto "No evaluation results have been provided for this policy yet", por lo que no existen tasas de exito en robot real, ni comparaciones con otras politicas sobre la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir del recuento real de 51.668.614 parametros, los pesos ocupan aproximadamente 207 MB en fp32 y 103 MB en fp16/bf16; el coste dominante es la codificacion de dos imagenes de 480x640.
- GPU recomendadas: cualquier GPU con CUDA y al menos 4 GB de VRAM es suficiente por peso del modelo; para control en tiempo real se recomienda una GPU de gama media o superior (RTX 3060, RTX 4060, RTX 4090) o una placa embebida tipo Jetson Orin.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (incluidas GTX 1650/RTX 3050 y superiores), dado el tamano del modelo.
- Ejecucion en CPU: tecnicamente posible por el tamano del modelo, aunque no se dispone de datos de latencia publicados y no se recomienda para control en tiempo real.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento) sobre PyTorch. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Requisitos adicionales: robot `so_follower` con puerto serie configurado, dos camaras OpenCV accesibles y nombres de camara que coincidan exactamente con las claves de observacion (`overview`, `handcamera`); los comandos de la model card usan camaras a 640x480 y 30 FPS de captura.

## Comparativa con modelos similares

| Modelo | Metodo | Parametros | Licencia | Contexto de observacion | Disponibilidad |
|---|---|---|---|---|---|
| act-model-mypick-color-20260926_235331 (este modelo) | ACT / imitation learning | 51.668.614 | apache-2.0 | 6 dims de estado + 2 imagenes 480x640 | Hugging Face, libreria lerobot |
| Iwas-6127/act-model-mypick-20260921_125324 | ACT | no disponible | no disponible | no disponible | Hugging Face |
| Iwas-6127/act-model-20260920_180937 | ACT | no disponible | no disponible | no disponible | Hugging Face |
| Diffusion Policy (alternativa metodologica de imitation learning) | Difusion de trayectorias de accion | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| Politicas VLA tipo OpenVLA / pi0 | Vision-language-action | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparados entre estas opciones en la informacion proporcionada; la comparacion es, por tanto, estructural (metodo, licencia y disponibilidad) y no de resultados.

## Limitaciones y advertencias

- Dataset muy reducido: 30 episodios y 6750 fotogramas implican poca diversidad de escenas, posiciones e iluminacion, con alto riesgo de sobreajuste al entorno de captura.
- Ausencia total de evaluacion: la model card no reporta tasa de exito ni condiciones de prueba, por lo que no hay evidencia publica de que la politica funcione fuera del setup original.
- Descripcion de tarea vacia: el campo `Task(s)` esta en blanco y el prompt de rollout usa `--task=""`; la semantica de la tarea solo se deduce del nombre del dataset.
- Acoplamiento al hardware: la politica depende del robot `so_follower`, de la calibracion concreta y de las dos camaras con esos nombres exactos; cambiar de brazo, de montaje o de camaras invalida las observaciones esperadas.
- Sensibilidad al dominio visual: cambios de fondo, de iluminacion o de posicion de camara pueden degradar el comportamiento, al no haberse documentado aumento de datos ni evaluacion de robustez.
- Sin capacidades de lenguaje ni razonamiento: no acepta instrucciones en lenguaje natural distintas del prompt de tarea, no hace tool calling ni planificacion jerarquica.
- Riesgo de fallo silencioso: al ser behavior cloning, un estado fuera de distribucion produce acciones sin senal de incertidumbre; se recomienda supervision humana y limites de seguridad en el robot.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero la licencia del dataset de entrenamiento no se declara en la informacion disponible; conviene verificar sus terminos antes de un uso productivo.
- Sin garantias ni soporte del autor mas alla de la model card; el modelo tiene 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Iwas-6127/act-model-mypick-color-20260926_235331
- Dataset de entrenamiento: https://huggingface.co/datasets/Iwas-6127/my_pick_test_color_20260926_221126
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Iwas-6127/my_pick_test_color_20260926_221126
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Paper de ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de imitacion (grabar datos y entrenar): https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia / rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Otro modelo ACT del mismo autor: https://huggingface.co/Iwas-6127/act-model-mypick-20260921_125324
- Otro modelo ACT del mismo autor: https://huggingface.co/Iwas-6127/act-model-20260920_180937
