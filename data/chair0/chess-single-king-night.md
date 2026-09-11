# chair0/chess-single-king-night

## Resumen

`chair0/chess-single-king-night` es una politica de robotica entrenada con Action Chunking with Transformers (ACT), un metodo de aprendizaje por imitacion publicado en 2023 (arXiv:2304.13705) que predice secuencias cortas de acciones (chunks) en lugar de un unico paso de control. El modelo lo publica el usuario `chair0` en HuggingFace Hub y se distribuye dentro del ecosistema LeRobot de HuggingFace, con licencia Apache 2.0 y formato de pesos safetensors.

Se trata de una politica especializada y de dominio muy concreto: un brazo `so_follower` (SO-100/SO-101 y variantes) con dos camaras (`wrist` y `top`) que debe ejecutar la tarea "Pick up the yellow print" a partir de 31 episodios de teleoperacion (7.033 fotogramas a 30 FPS). No es un modelo de lenguaje ni un modelo fundacional multimodal: consume estado propiocepcional de 6 dimensiones mas dos imagenes RGB de 480x640, y produce un vector de accion de 6 dimensiones.

Su relevancia es la de un ejemplo reproducible de entrenamiento de politicas con LeRobot 0.6.1: 51,7 millones de parametros, 60.000 pasos de entrenamiento y un repositorio de apenas 0,2 GB, lo que lo hace ejecutable en hardware de consumo. Al no incluir resultados de evaluacion en robot real, su utilidad practica esta limitada al entorno y a la tarea para los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual ResNet y decodificador de acciones con chunking |
| Parametros totales | 51.668.614 |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; consume una observacion por paso de control) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en precision completa; no se documentan variantes GGUF, AWQ ni similares) |
| Idiomas soportados | no aplica (politica de robotica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Camaras | `wrist`, `top` |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3, 480, 640), `observation.images.top` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 0,2 GB |
| Libreria | lerobot 0.6.1 |
| Fecha de creacion en el Hub | 2026-09-11 |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion supervisado que combina un backbone visual (tipicamente ResNet, aqui aplicado a dos flujos de imagen de 480x640) con un transformer encoder-decoder. La innovacion central es el *action chunking*: en lugar de predecir una accion por paso, el modelo emite un bloque de k acciones futuras, lo que reduce el error de compounding y la varianza temporal en tareas de manipulacion fina. En la implementacion de LeRobot, el codificador visual procesa las dos camaras y el estado propiocepcional, y el decodificador genera las acciones de 6 grados de libertad de forma condicionada a las observaciones.

El entrenamiento se realizo con LeRobot 0.6.1 sobre el dataset `chair0/chess-single-king-night` (31 episodios, 7.033 fotogramas a 30 FPS, tarea unica "Pick up the yellow print"), con 60.000 pasos, batch size 64, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni fases de refinamiento posteriores: es aprendizaje por imitacion puro sobre datos teleoperados. Tampoco se especifica el numero exacto de tokens o muestras vistas ni la composicion completa del dataset mas alla de la tarea unica.

## Capacidades

- Control de manipulacion visomotora: genera comandos de accion de 6 dimensiones para un brazo `so_follower` a partir de dos vistas de camara y del estado de las articulaciones.
- Action chunking: predice bloques de acciones en lugar de pasos aislados, lo que suaviza la ejecucion y mejora la robustez frente a pequenas perturbaciones.
- Ejecucion de una tarea concreta de recogida de objetos: "Pick up the yellow print".
- Inferencia en tiempo real a 30 FPS sobre el flujo de observaciones definido en la model card.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificacion simbolica.
- No tiene capacidades multilingues ni generacion de texto.
- No dispone de modo de razonamiento explicito (thinking mode), vision general, audio ni ninguna capacidad multimodal fuera de las dos camaras de las que depende.

## Casos de uso

- Recogida automatizada de objetos en linea de montaje: la politica puede replicar el gesto aprendido de "Pick up the yellow print" sobre un brazo `so_follower` con las mismas posiciones de camara, sustituyendo a un operario en una celda repetitiva.
- Prototipado de politicas de manipulacion en investigacion: sirve como punto de partida reproducible para comparar variantes de ACT, tamaños de dataset o estrategias de aumento de datos con LeRobot 0.6.1.
- Docencia y formacion en robotica: al tener solo 31,7 millones de parametros de vision/accion y un repositorio de 0,2 GB, permite a estudiantes entrenar y desplegar una politica completa en un portatil o una GPU de gama media.
- Benchmark interno de hardware de robotica: reproduce una tarea fija y medible para comparar brazos SO-100 frente a SO-101, calibraciones de camara o latencias de bus de comunicacion.
- Generacion de datos sinteticos de imitacion: usar las trayectorias generadas como punto de comparacion frente a datos teleoperados reales para medir la brecha sim-a-real en tareas de pick-and-place.
- Validacion de pipelines de despliegue edge: probar el ciclo completo `lerobot-rollout` con politica ACT en una maquina con GPU integrada, midiendo tasa de exito y latencia antes de invertir en un modelo mayor.
- Recopilacion de datos de fallo para reentrenamiento: ejecutar la politica durante periodos largos, registrar episodios no grabados y usar los fallos como datos negativos para iterar sobre el dataset original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet", por lo que no hay tasa de exito, numero de ensayos ni condiciones de evaluacion en robot real. Tampoco se proporcionan metricas de validacion durante el entrenamiento ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB solo para pesos en fp32 (51,7 millones de parametros x 4 bytes); sumando activaciones de dos flujos de imagen de 480x640 y el estado, el consumo realista se situa en el rango de 1 a 3 GB. Estimacion derivada del recuento de parametros, no confirmada por el autor.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM es suficiente en la practica; el autor entrena y ejecuta con `--policy.device=cuda`. Una RTX 4090, RTX 3060 o incluso una GPU integrada de portatil reciente pueden servirlo.
- Cabe en GPU de consumo: si. El modelo es compatible con tarjetas de gama media y baja; tambien es viable la inferencia en CPU para pruebas, aunque a costa de la tasa de control de 30 FPS.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`), con soporte de checkpoints intermedios. No se documenta soporte oficial para vLLM, TGI, llama.cpp u Ollama, que no aplican a politicas de robotica.
- Latencia y throughput: no disponibles. El autor no publica medidas de latencia por paso ni de frecuencia efectiva de control alcanzada en hardware concreto; la tasa nominal del dataset es de 30 FPS.

## Comparativa con modelos similares

| Modelo | Tipo de politica | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| chair0/chess-single-king-night | ACT (LeRobot) | 51.668.614 | apache-2.0 | HuggingFace Hub, 0 descargas, 0 likes |
| ACT original (Zhao et al., 2023) | ACT (implementacion de referencia) | no disponible | no disponible | Paper y repositorio publicos |
| Diffusion Policy (Cheng et al., 2023) | Politica generativa por difusion | no disponible | no disponible | Repositorio publico |
| SmolVLA (HuggingFace) | Vision-language-action | no disponible | no disponible | HuggingFace Hub |

La comparacion cuantitativa no es posible con la informacion disponible: no se han publicado parametros, licencias ni resultados de evaluacion de las alternativas en la documentacion proporcionada. A nivel cualitativo, ACT se distingue por su simplicidad y bajo coste de entrenamiento frente a enfoques de difusion (mas costosos en inferencia por el proceso iterativo de denoising) y frente a modelos VLA (mucho mayores y entrenados sobre datos multimodales a gran escala, pero no especializados en esta tarea).

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasa de exito medida en robot real ni en simulacion, por lo que no se puede afirmar que la politica funcione fuera del entorno de entrenamiento.
- Dataset muy reducido y de tarea unica: 31 episodios y 7.033 fotogramas para una sola tarea ("Pick up the yellow print"). La generalizacion a nuevas posiciones de objeto, iluminacion o distractores es altamente incierta.
- Dependencia fuerte de la configuracion de sensores: la politica espera exactamente dos camaras en las claves `observation.images.wrist` y `observation.images.top` con resolucion 480x640, y un estado de 6 dimensiones. Cambiar la camara, la calibracion o el tipo de robot invalida el modelo.
- Riesgo de sobreajuste al entorno de grabacion: con tan pocos episodios es probable que la politica memorice posiciones, colores y condiciones concretas del montaje original.
- Sin capacidad de razonamiento ni recuperacion de errores: ACT no planifica ni detecta fallos; si la accion falla, repetira el mismo comportamiento sin corregir.
- Zero adopcion en el Hub: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por parte de terceros.
- Licencia permisiva pero sin garantias: apache-2.0 permite uso comercial y modificacion, pero se distribuye "tal cual", sin garantia implicita de idoneidad ni de ausencia de sesgos fisicos en la ejecucion.
- Idiomas y contexto: no aplica; cualquier expectativa de uso como modelo de lenguaje es un error de categoria.
- Fecha de publicacion inusual (2026-09-11) en los metadatos del Hub; conviene verificar la version real del artefacto antes de desplegarlo.
- La busqueda web no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados pertenecen a un foro de trading en arabe sin relacion alguna con el proyecto, por lo que no existe documentacion externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chair0/chess-single-king-night
- Dataset de entrenamiento: https://huggingface.co/datasets/chair0/chess-single-king-night
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de aprendizaje por imitacion: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=chair0/chess-single-king-night
