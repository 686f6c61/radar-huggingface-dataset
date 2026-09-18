# 6first/act_6first

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice bloques cortos de acciones futuras (action chunks) en lugar de un único paso de control. El modelo `6first/act_6first` es una política ACT concreta entrenada con LeRobot y publicada en HuggingFace Hub por el usuario `6first` para el robot `ffw_sg2_rev1`, equipado con cuatro cámaras (dos de cabeza y dos de muñeca). El repositorio ocupa 0,2 GB y los pesos en safetensors suman 51.701.398 parámetros.

La política consume un vector de estado de 22 dimensiones más cuatro flujos de imagen RGB (dos a 720x1280 y dos a 424x240) y produce un vector de acción de 22 dimensiones. Se entrenó sobre el dataset `6first/6first`, compuesto por 21 episodios, 10.862 fotogramas a 15 FPS y una única tarea etiquetada como "0", con 50.000 pasos de entrenamiento, batch de 8, optimizador AdamW y tasa de aprendizaje 1e-5.

Su relevancia es doble: por un lado, es un ejemplo reproducible del flujo completo de LeRobot (grabación de datos, entrenamiento, despliegue con `lerobot-rollout`); por otro, sirve como base de imitación para fine-tuning en manipulaciones bimanuales. El autor no ha publicado resultados de evaluación en el mundo real ni métricas de éxito, y el modelo acumula 0 descargas y 0 "likes", por lo que se trata de una política sin validación externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con CVAE y backbones convolucionales para vision (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.701.398 (aprox. 51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); horizonte de chunk de acciones no documentado en la model card |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors; no se documentan variantes INT8, INT4 ni GGUF) |
| Idiomas soportados | no aplica (modelo de robotica; no procesa lenguaje natural). La model card no declara idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de modelo | politica de aprendizaje por imitacion (pipeline: robotics) |
| Libreria | lerobot |
| Robot objetivo | `ffw_sg2_rev1` |
| Entradas | `observation.state` (22,); `observation.images.rgb.cam_left_head` (3, 720, 1280); `observation.images.rgb.cam_left_wrist` (3, 424, 240); `observation.images.rgb.cam_right_head` (3, 720, 1280); `observation.images.rgb.cam_right_wrist` (3, 424, 240) |
| Salidas | `action` (22,) |
| Tamano del repositorio | 0,2 GB |
| Version de LeRobot usada en entrenamiento | 0.6.2 |

## Arquitectura y entrenamiento

ACT se basa en un transformer encoder-decoder que recibe como entrada las observaciones multimodales (imagenes de varias camaras y el estado propioceptivo del robot) y genera como salida un chunk de acciones futuras en lugar de un unico paso. La formulacion incluye un componente CVAE (autoencoder variacional condicional) que modela la variabilidad de las demostraciones humanas, de modo que el modelo puede representar estilos de ejecucion distintos sin promediarlos. La parte visual se procesa con redes convolucionales que extraen caracteristicas de cada camara antes de concatenarlas con el estado. En inferencia, el metodo original propone el agregado temporal (temporal ensembling) de los chunks solapados para suavizar el control.

La informacion disponible no permite confirmar el detalle exacto de la configuracion (numero de capas, dimensiones ocultas, tamano del chunk, uso de temporal ensembling o backbone concreto). La model card indica que se trata de una implementacion de LeRobot (`--policy.type=act`) entrenada durante 50.000 pasos con batch de 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. El conjunto de entrenamiento es el dataset `6first/6first`: 21 episodios, 10.862 fotogramas, 15 FPS y una unica tarea etiquetada como "0". No se documenta composicion adicional del dataset, aumento de datos, RLHF, DPO ni ninguna otra etapa de post-entrenamiento.

## Capacidades

- Control robótico por imitación: predice chunks de acciones de 22 dimensiones a partir de estado propioceptivo y cuatro vistas de cámara.
- Percepción visual multi-cámara: procesa simultáneamente dos cámaras de cabeza (720x1280) y dos cámaras de muñeca (424x240), lo que aporta tanto vista global como vista cenital de la pinza.
- Ejecución de una tarea concreta (etiqueta "0") sobre el robot `ffw_sg2_rev1`; no hay evidencia de generalización a otras tareas.
- Integración nativa con LeRobot: carga directa mediante `--policy.path` en `lerobot-rollout` y `lerobot-train`.
- Entrenamiento adicional (fine-tuning) sobre datasets propios en formato LeRobot.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, tool calling, function calling, capacidades de agente ni procesamiento de lenguaje natural.
- No dispone de modo "thinking", visión general (captioning, VQA) ni audio; la visión está especializada en el control motor.
- Capacidades multilingües: no aplica.

## Casos de uso

- Automatización de una tarea de manipulación en el robot `ffw_sg2_rev1`: la política ejecuta la tarea "0" replicando las demostraciones teleoperadas; es adecuada porque el modelo fue entrenado exactamente con las cuatro cámaras y el estado de 22 dimensiones de ese robot.
- Base para fine-tuning en una tarea nueva: dado que el modelo tiene solo 51,7 M de parámetros (0,2 GB), se puede reentrenar con `lerobot-train` sobre un dataset propio de decenas de episodios sin necesidad de clústeres grandes.
- Recogida de datos y escalado de demostraciones: usar la política como asistente durante la teleoperación para reducir el esfuerzo por episodio y acelerar la creación del siguiente dataset.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible (semilla 1000, 50.000 pasos, AdamW, lr 1e-5) para comparar variantes de chunking, agregado temporal o estrategias de data augmentation bajo condiciones idénticas.
- Evaluación de pipelines de despliegue en robótica: al cargarse con `lerobot-rollout`, permite medir latencia real de inferencia multinicial a 15 FPS de datos de entrenamiento y ajustar la tasa de control del lazo.
- Validación de estrategias de control bimanual: el vector de 22 dimensiones y las cámaras izquierda/derecha sugieren un setup de dos brazos; el modelo puede emplearse para probar sincronización de ambos brazos en tareas de ensamblaje.
- Pruebas de regresión en integración hardware/software: útil para comprobar la calibración de cámaras y la coincidencia de nombres de features antes de desplegar políticas más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con el texto explicito "_No evaluation results have been provided for this policy yet_", por lo que no hay tasas de exito, numero de ensayos ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: 51,7 M de parametros equivalen a unos 207 MB en fp32 y unos 103 MB en fp16/bf16. Sumando activaciones de los cuatro flujos de imagen (dos a 720x1280 y dos a 424x240) mas los buffers de los encoders visuales, la inferencia deberia caber holgadamente en 1-2 GB de VRAM (estimacion propia a partir del numero de parametros, no verificada por el autor).
- GPU recomendadas: cualquier GPU NVIDIA con 4 GB o mas, como RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100 o H100. Para este tamano de modelo, una GPU de gama alta no aporta ventaja determinante mas alla de la latencia.
- Cabe en GPU de consumo: si. Es viable en practicamente cualquier GPU consumer moderna e incluso en iGPU recientes; tambien es probable que funcione en CPU para pruebas, aunque la model card indica `--policy.device=cuda` para entrenamiento.
- Entrenamiento: los 50.000 pasos con batch 8 son asequibles en una unica GPU consumer; no se documentan requisitos minimos por parte del autor.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` (ruta oficial documentada) y LeRobot/PyTorch en general. vLLM, llama.cpp, Ollama y TGI no aplican, ya que son servidores de modelos de lenguaje y esta politica no produce texto.
- Latencia y throughput estimados: no disponible. El dataset se grabo a 15 FPS, lo que da una referencia de la frecuencia a la que se capturaron las demostraciones, pero la model card no publica latencias de inferencia ni frecuencia de control alcanzada.

## Comparativa con modelos similares

Los datos de las alternativas proceden de documentacion publica general y no de la busqueda web proporcionada, por lo que se marcan como aproximados o no disponibles.

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| ACT (`6first/act_6first`) | 51,7 M | Aprendizaje por imitacion, transformer encoder-decoder con CVAE y chunks de acciones | Apache-2.0 | HuggingFace Hub, integrado en LeRobot |
| Diffusion Policy | no disponible | Aprendizaje por imitacion generativo basado en difusion | no disponible | Repositorio de codigo abierto; no verificado en la informacion proporcionada |
| SmolVLA | aprox. 450 M | Modelo vision-lenguaje-accion (VLA) con transformer multimodal | aprox. Apache-2.0 | HuggingFace Hub |
| pi0 (Physical Intelligence) | aprox. 3 B | VLA con flow matching | no disponible | Publicado por el autor; no verificado en la informacion proporcionada |

Diferencias clave: ACT es un metodo especifico de tarea y robot, con un modelo mucho mas pequeno que los VLA, y no procesa instrucciones en lenguaje natural; los VLA permiten condicionar la accion por texto, a costa de un orden de magnitud mas de parametros y de requisitos de GPU mayores.

## Limitaciones y advertencias

- Sin validacion experimental: no hay tasa de exito, numero de ensayos ni condiciones de prueba publicadas; no se puede afirmar que la politica funcione de forma fiable.
- Entrenamiento muy reducido: 21 episodios y 10.862 fotogramas para una sola tarea. Es un volumen bajo y aumenta el riesgo de sobreajuste al entorno, iluminacion y posiciones de objeto de la grabacion.
- Especificidad de hardware: el modelo espera exactamente las features `observation.state` (22,) y las cuatro camaras `cam_left_head`, `cam_left_wrist`, `cam_right_head` y `cam_right_wrist`; los nombres y las resoluciones deben coincidir o la inferencia fallara.
- Ausencia de instrucciones de lenguaje: la tarea se fija con `--task="0"`; no hay generalizacion a instrucciones nuevas ni a multiples tareas.
- Sesgos: los derivados de las demostraciones del teleoperador (trayectorias, velocidades, posiciones preferidas) y del entorno de grabacion. No hay analisis de sesgos publicado.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de acciones incoherentes o inseguras fuera de la distribucion de entrenamiento; debe operarse con parada de emergencia y limites de par.
- Idiomas: no aplica; no es un modelo de lenguaje y no se declaran idiomas.
- Licencia apache-2.0: permite uso comercial y modificacion con atribucion, pero la licencia del dataset `6first/6first` y del hardware asociado puede imponer condiciones adicionales que no se detallan.
- Metadatos inconsistentes: las fechas de creacion y actualizacion del repositorio (2026-09-17) no son coherentes con una publicacion tipica; conviene verificar la version real del artefacto antes de usarlo.
- Adopcion nula: 0 descargas y 0 "likes" en el momento de la consulta; no hay evidencia de que el modelo se haya reproducido en otro robot.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/6first/act_6first
- Dataset de entrenamiento: https://huggingface.co/datasets/6first/6first
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=6first/6first
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Paper de ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con el modelo, el paper ni LeRobot; los enlaces anteriores proceden de los metadatos de HuggingFace y de la propia model card.
