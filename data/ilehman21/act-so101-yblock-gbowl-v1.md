# ilehman21/act-so101-yblock-gbowl-v1

## Resumen

`ilehman21/act-so101-yblock-gbowl-v1` es una política de robótica entrenada con el método ACT (Action Chunking with Transformers), publicado con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: se trata de un modelo de aprendizaje por imitación que, a partir de observaciones visuales y del estado de las articulaciones, predice secuencias cortas de acciones (chunks) para controlar un brazo robótico. El autor es el usuario de Hugging Face `ilehman21` y el modelo está publicado bajo licencia Apache 2.0.

El modelo tiene 51.668.614 parámetros (~51,7 millones) y un tamaño de repositorio de 0,2 GB. Está especializado en una única tarea: "Pick up the yellow block and place it inside the green bowl" (recoger el bloque amarillo y colocarlo dentro del cuenco verde). Se entrenó sobre un conjunto de datos de teleoperación propio de 80 episodios y 54.846 fotogramas grabados a 30 FPS.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación con LeRobot sobre un robot de bajo coste (tipo `so_follower`, habitual en la familia SO-101), e incluye la configuración de entrenamiento completa, los comandos de despliegue y el enlace al dataset, lo que permite reproducir o adaptar el flujo de trabajo. En el momento de la consulta no tiene descargas ni valoraciones publicadas y no se han facilitado resultados de evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), aprendizaje por imitacion basado en transformer; segun el articulo 2304.13705, la politica se formula como un CVAE que predice chunks de acciones |
| Parametros totales | 51.668.614 (~51,7 M) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; opera sobre observaciones por fotograma, sin ventana de texto) |
| Tipos de cuantizacion | No disponible (se publican pesos safetensors sin cuantizacion; el despliegue estandar en LeRobot usa PyTorch en fp32/fp16) |
| Idiomas soportados | No aplica (la politica no procesa lenguaje; las cadenas de tarea del dataset estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,2 GB) |
| Tipo de robot | `so_follower` (familia SO-101) |
| Camaras de entrada | `front` (una camara frontal), imagen `(3, 1080, 1920)` |
| Entrada de estado | `observation.state`, vector `(6,)` |
| Salida de acciones | `action`, vector `(6,)` |
| Tarea entrenada | "Pick up the yellow block and place it inside the green bowl" |
| Libreria | lerobot 0.6.2 |
| Fecha de publicacion | 2026-10-02 |

## Arquitectura y entrenamiento

El modelo implementa el metodo ACT descrito en el articulo referenciado (arXiv 2304.13705). ACT es una tecnica de aprendizaje por imitacion que, en lugar de predecir una unica accion por paso, predice un chunk de acciones de corto horizonte. Esto reduce el error de acumulacion tipico del control paso a paso y suele mejorar las tasas de exito en tareas de manipulacion. La politica consume dos entradas: una imagen de la camara frontal (`observation.images.front`, `(3, 1080, 1920)`) y el estado de las articulaciones (`observation.state`, `(6,)`), y produce un vector de accion de dimension 6 (`action`, `(6,)`). Segun la formulacion original del metodo, el modelo se entrena como un CVAE condicionado por las observaciones.

Los datos de entrenamiento provienen del dataset `ilehman21/so101-yblock-gbowl-v1`: 80 episodios teleoperados, 54.846 fotogramas, a 30 FPS, todos correspondientes a la misma tarea de recogida y colocacion. La configuracion de entrenamiento declarada es: 50.000 pasos, tamano de lote 1, optimizador AdamW, tasa de aprendizaje 1e-5, semilla 1000 y LeRobot 0.6.2. No se especifica en la informacion disponible si hubo etapas de RLHF, DPO u otro ajuste posterior; en el flujo estandar de ACT no se emplean.

## Capacidades

- Control visuomotor de manipulacion: genera acciones de 6 grados de libertad a partir de una imagen frontal y del estado articular, en el marco de la tarea entrenada.
- Prediccion por chunks de acciones: emite secuencias cortas de acciones en lugar de pasos aislados, lo que aporta estabilidad al control.
- Aprendizaje por imitacion a partir de datos teleoperados, sin necesidad de recompensas explicitas ni de un simulador.
- Ejecucion de una unica tarea predefinida: recoger el bloque amarillo y depositarlo en el cuenco verde.
- Integracion directa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No dispone de tool calling, function calling, razonamiento multietapa, comprension de lenguaje natural, vision general (mas alla del uso de la imagen como observacion de control) ni capacidades multimodales de texto, audio o dialogo.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: la politica ejecuta la secuencia completa de recogida del bloque y deposito en el cuenco, adecuada para montajes de banco donde se repite la misma operacion de forma ciclica.
- Banco de pruebas para aprendizaje por imitacion: sirve como referencia funcional para validar la instalacion de LeRobot, la calibracion del robot `so_follower` y la camara frontal antes de abordar tareas mas complejas.
- Punto de partida para fine-tuning: al publicarse la configuracion de entrenamiento y el dataset asociado, es un punto de partida reproducible para entrenar variantes sobre objetos, posiciones o contenedores distintos.
- Investigacion en generalizacion visuomotora: permite estudiar la sensibilidad de una politica ACT a cambios de iluminacion, posicion inicial del objeto, oclusiones parciales o pequenos cambios en la pose de la camara.
- Comparacion de metodos de politica: util como baseline ACT frente a alternativas como Diffusion Policy en experimentos controlados con el mismo robot y el mismo dataset.
- Docencia y divulgacion tecnica: ejemplo autocontenido de un pipeline completo (dataset, entrenamiento, despliegue) para cursos o talleres de robotica con hardware de bajo coste.
- Evaluacion de robustez del controlador: al fijarse la frecuencia de datos en 30 FPS, permite medir el comportamiento del bucle de control y su estabilidad temporal en ejecuciones prolongadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con la indicacion explicita de que aun no se han proporcionado resultados en robot real (ni numero de ensayos ni tasa de exito). Por tanto, no se dispone de datos verificables de exito, generalizacion ni latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir del numero de parametros (~51,7 M), los pesos en fp32 ocupan aproximadamente 207 MB y en fp16 unos 103 MB. Sumando activaciones del codificador visual y del transformer, la inferencia cabe holgadamente en menos de 2 GB de VRAM (estimacion a partir del recuento de parametros, no dato publicado).
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente para inferencia; para entrenamiento se recomienda una GPU con soporte CUDA y 8 GB o mas (por ejemplo RTX 3060, RTX 4070, RTX 4090, A100 o H100), si bien el lote 1 utilizado reduce mucho el consumo.
- Cabe en GPU de consumo: si, con amplio margen. El tamano del modelo (~51,7 M de parametros) permite incluso ejecucion en CPU, con la limitacion de que la frecuencia efectiva de control podria no alcanzar los 30 FPS del dataset.
- Opciones de despliegue: el despliegue previsto es LeRobot sobre PyTorch (`lerobot-rollout` para ejecucion y `lerobot-train` para entrenamiento, con `--policy.device=cuda`). Herramientas orientadas a modelos de lenguaje como vLLM, llama.cpp, Ollama o TGI no son aplicables a este tipo de politica.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se grabo a 30 FPS, lo que fija la frecuencia de referencia del bucle de control, pero no se publican mediciones de latencia por inferencia ni de throughput en robot real.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada / tarea | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-so101-yblock-gbowl-v1 (este modelo) | 51,7 M | imagen frontal + estado (6,), tarea unica de pick-and-place | No disponible (sin evaluacion publicada) | Apache 2.0 | Hugging Face (0 descargas, 0 valoraciones) |
| ACT (metodo original, arXiv 2304.13705) | No disponible en la informacion proporcionada | Aprendizaje por imitacion con chunks de acciones | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Articulo y repositorio asociados al metodo |
| Diffusion Policy (familia de politicas por difusion) | No disponible | Politicas visuomotoras para manipulacion | No disponible | No disponible | Publicaciones y repositorios de referencia |
| SmolVLA (familia LeRobot) | No disponible | Politicas VLA para robotica en LeRobot | No disponible | No disponible | Ecosistema LeRobot |

No se dispone de datos verificables de parametros, contexto o rendimiento de las alternativas en la informacion proporcionada; la comparacion se limita, por tanto, a la categoria de metodo (aprendizaje por imitacion) y a la disponibilidad.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica tarea, un unico tipo de robot (`so_follower`) y una unica camara (`front`). Fuera de esa configuracion no cabe esperar un comportamiento util.
- Sin resultados de evaluacion: no hay tasa de exito publicada, por lo que el rendimiento real en robot es desconocido y no debe darse por bueno sin una validacion propia.
- Dependencia del montaje: cambios en la calibracion del robot, en la pose o indice de la camara, en la iluminacion o en el fondo pueden degradar el comportamiento, ya que el dataset es reducido (80 episodios).
- Riesgo de sobreajuste al dataset: con 54.846 fotogramas de una sola tarea y un solo entorno, la generalizacion a variaciones de posicion del objeto, distractores o nuevos contenedores es incierta.
- Sin capacidades de lenguaje ni de razonamiento: no interpreta instrucciones en lenguaje natural. La cadena de tarea que se pasa en la ejecucion es una etiqueta de contexto, no una orden que el modelo comprenda y descomponga.
- Acumulacion de error en ejecuciones largas: al ser una politica de imitacion sin mecanismo de recuperacion explicito, los fallos pueden propagarse durante la secuencia de pick-and-place.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el modelo se distribuye sin garantias y el autor no ofrece soporte ni validacion; conviene revisar las condiciones de los datos y del metodo original citados.
- Falta de validacion comunitaria: 0 descargas y 0 valoraciones en el momento de la consulta, sin evidencia externa de funcionamiento.
- Idiomas: no aplica soporte multilingue; el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ilehman21/act-so101-yblock-gbowl-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/ilehman21/so101-yblock-gbowl-v1
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ilehman21/so101-yblock-gbowl-v1
- Articulo del metodo ACT: https://huggingface.co/papers/2304.13705 (arXiv 2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
