# kartikbud/act_pick

## Resumen

`kartikbud/act_pick` es una política de robótica entrenada con imitación mediante el método ACT (Action Chunking with Transformers), publicado en el artículo arXiv:2304.13705. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado de las articulaciones del robot y dos flujos de imagen, y produce directamente consignas de acción de 6 grados de libertad a 30 FPS. El repositorio lo publica el usuario kartikbud mediante la librería LeRobot de Hugging Face y tiene licencia Apache 2.0.

La política está especializada en una única tarea: "Pick up the red cube and place it on the wooden coaster". Se entrenó con el dataset `kartikbud/pick`, compuesto por 100 episodios y 25 869 fotogramas teleoperados a 30 FPS, sobre un brazo `so_follower` (familia SO-100/SO-101 de LeRobot) con dos cámaras: una en la muñeca y otra en cenital. El modelo tiene 51 668 614 parámetros (aproximadamente 51,7 millones), un tamaño que lo sitúa en el rango de políticas ligeras ejecutables en hardware de consumo.

Su relevancia es la de un ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot para aprendizaje por imitación: dataset público, configuración de entrenamiento documentada y comando de despliegue en robot real. Al tratarse de un repositorio recién publicado, con 0 descargas y 0 likes, y sin resultados de evaluación en robot real, debe considerarse material de partida o de referencia, no una política validada para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): política de imitación con CVAE y transformer sobre codificador visual; no es un modelo de lenguaje |
| Parametros totales | 51 668 614 (≈51,7 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica: no hay contexto de texto. El horizonte de predicción de acciones (chunk) no se especifica en la model card |
| Tipos de cuantizacion | No disponible: solo se publican pesos en safetensors en precisión de entrenamiento (el repo de 0,2 GB para 51,7 M de parámetros es coherente con FP32) |
| Idiomas soportados | No aplica: la tarea se especifica mediante una cadena de texto fija y el modelo no procesa lenguaje de forma general |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato de LeRobot) |

Datos adicionales de la model card:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` (familia SO-100/SO-101 de LeRobot) |
| Camaras | `wrist`, `overhead` |
| Entrada `observation.state` | STATE, forma `(6,)` |
| Entrada `observation.images.wrist` | VISUAL, forma `(3, 480, 640)` |
| Entrada `observation.images.overhead` | VISUAL, forma `(3, 480, 640)` |
| Salida `action` | ACTION, forma `(6,)` |
| Libreria | lerobot |
| Pipeline | robotics |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion / actualizacion | 2026-09-13 / 2026-09-13 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de un único paso. En lugar de mapear observación a acción de forma instantánea, el modelo genera una secuencia de acciones futuras, lo que reduce el problema de errores compuestos y de correlación temporal que afecta al comportamiento clonado paso a paso. La formulación incluye un componente CVAE con una variable latente de estilo que se muestrea durante el entrenamiento y se fija en inferencia, y el backbone visual suele ser una red convolucional (ResNet) seguida de un transformer que codifica observaciones y decodifica la secuencia de acciones. En la model card no se detallan la profundidad del transformer, las dimensiones ocultas ni el tamaño del chunk para este checkpoint concreto, por lo que esos datos figuran como no disponibles.

El entrenamiento se realizó con el dataset `kartikbud/pick`: 100 episodios, 25 869 fotogramas, 30 FPS, tarea única "Pick up the red cube and place it on the wooden coaster", con observaciones de estado de 6 dimensiones y dos cámaras a 480x640. La configuración reportada es de 40 000 pasos, tamaño de lote 32, optimizador AdamW, tasa de aprendizaje 1e-5, semilla 1000 y LeRobot 0.6.2. Es aprendizaje por imitación a partir de demostraciones teleoperadas: no consta RLHF, DPO ni ningún tipo de ajuste por preferencias humanas. Tampoco se documentan aumentos de datos, composición detallada del dataset ni técnicas de decodificación especulativa o atención lineal.

## Capacidades

- Control visomotor de manipulacion: genera consignas de accion de 6 dimensiones para un brazo `so_follower` a partir de estado articular y dos imagenes de 480x640.
- Prediccion por fragmentos (action chunking): emite secuencias de acciones en lugar de pasos aislados, lo que aporta suavidad y reduce el error compuesto.
- Ejecucion en lazo cerrado a 30 FPS: el bucle de control esta pensado para operar a la misma frecuencia a la que se grabo el dataset.
- Tarea unica de pick-and-place: recoger un cubo rojo y colocarlo sobre un posavasos de madera, con la instruccion de tarea fijada por cadena de texto.
- Uso con LeRobot: se integra con `lerobot-rollout` y `lerobot-train` mediante el tipo de politica `act`.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificacion simbolica.
- No tiene capacidades multilingues ni de comprension de lenguaje natural general.
- No tiene modo de razonamiento (thinking), ni vision general, ni audio: la vision esta limitada a las dos camaras con las que fue entrenado.

## Casos de uso

- Investigacion en aprendizaje por imitacion: sirve como punto de partida reproducible para estudiar ACT, comparar variantes de chunking y medir sensibilidad a hiperparametros, ya que la configuracion de entrenamiento y el dataset son publicos.
- Fine-tuning sobre un brazo SO-100/SO-101 propio: se puede reentrenar con `lerobot-train --policy.type=act` sobre un dataset propio y usar este checkpoint como inicializacion o como referencia de configuracion.
- Automatizacion de pick-and-place de objetos rigidos: la tarea de recoger un cubo y depositarlo en una posicion objetivo es representativa de lineas de kitting y clasificacion ligera de piezas.
- Prototipado de celdas roboticas de bajo coste: al tener 51,7 M de parametros, la inferencia no exige GPU de datacenter, lo que encaja en laboratorios y talleres con hardware modesto.
- Docencia y formacion en robotica: permite ilustrar el ciclo completo de teleoperacion, grabacion de dataset, entrenamiento y despliegue en robot real dentro del ecosistema LeRobot.
- Banco de pruebas de robustez: util para evaluar como se degrada la politica al cambiar iluminacion, posicion de los objetos, presencia de distractores o un robot distinto del mismo modelo.
- Generacion de lineas base para comparativas: sirve como referencia de metodo (ACT) frente a alternativas como Diffusion Policy o modelos VLA en experimentos controlados.
- Demostraciones en ferias y actividades divulgativas: el modelo es lo bastante ligero para ejecutarse en un equipo portatil con una camara USB, siempre que la tarea coincida con la entrenada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion con la nota explicita de que no se han aportado resultados para esta politica ("No evaluation results have been provided for this policy yet"), y no se reportan tasas de exito en robot real, numero de ensayos ni condiciones de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion aritmetica a partir del numero de parametros, no publicada por el autor): unos 207 MB en FP32, unos 103 MB en FP16 y unos 52 MB en INT8. El repositorio ocupa 0,2 GB, coherente con pesos en FP32.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; no se requiere A100, H100 ni similar. Una RTX 3060, RTX 4090 o incluso una GPU integrada moderna cubren de sobra el requisito de memoria del modelo.
- CPU: la inferencia en CPU es viable por el tamano del modelo; el cuello de botella practico es el preprocesado de dos flujos de imagen a 480x640 a 30 FPS, no los pesos.
- Hardware embebido: plataformas tipo Jetson Orin Nano o Raspberry Pi 5 son candidatas razonables, aunque no hay mediciones publicadas que confirmen el cumplimiento de los 30 FPS en estos equipos.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es la via documentada oficialmente. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a una politica de accion.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia por paso ni de frecuencia efectiva de control. La politica se entreno sobre datos a 30 FPS, por lo que el objetivo de diseno es ejecutar el bucle a esa frecuencia.

## Comparativa con modelos similares

| Modelo | Tipo de metodo | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| `kartikbud/act_pick` (este modelo) | ACT: imitacion con chunks de accion, CVAE + transformer | 51 668 614 (dato del repo) | Apache 2.0 | Hugging Face Hub, via LeRobot |
| Diffusion Policy | Politica generativa por difusion para control visomotor | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Implementaciones publicas; no verificadas aqui |
| SmolVLA | Modelo vision-lenguaje-accion (VLA) de tipo generalista | Aproximadamente 450 M segun la publicacion del propio modelo (cifra no verificada en esta ficha) | No disponible en la informacion proporcionada | Hugging Face Hub, via LeRobot |
| Comportamiento clonado con CNN (linea base) | Regresion directa observacion-accion | No disponible en la informacion proporcionada | No aplica | Implementacion a medida |

Criterios cualitativos de comparacion: ACT es un metodo especializado de tarea unica, ligero y entrenable en pocas horas con 100 episodios; Diffusion Policy tambien es tarea unica pero con un coste de inferencia mayor por el proceso de difusion iterativo; SmolVLA incorpora lenguaje e instrucciones en lenguaje natural a cambio de un modelo mucho mayor. No hay datos de rendimiento comparado en la informacion disponible, por lo que no es posible ordenar estas alternativas por tasa de exito.

## Limitaciones y advertencias

- Especializacion extrema: la politica solo ha visto la tarea "Pick up the red cube and place it on the wooden coaster". No se puede esperar generalizacion a otros objetos, otras posiciones de destino ni otras tareas sin reentrenar.
- Sin evaluacion publicada: no hay tasa de exito medida, ni numero de ensayos, ni condiciones de prueba. No se debe asumir ningun nivel de fiabilidad.
- Dependencia del montaje: las camaras deben llamarse exactamente `wrist` y `overhead` y colocarse en la misma configuracion fisica que durante el entrenamiento; cambios de encuadre, iluminacion o calibracion degradan el comportamiento.
- Dependencia del robot: entrenada para `so_follower` con estado y accion de 6 dimensiones. Usarla en otro tipo de brazo, o en otro ejemplar del mismo modelo con desviaciones mecanicas, no esta validado.
- Riesgo de fallo silencioso: a diferencia de un modelo de lenguaje, los errores no se manifiestan como texto incorrecto, sino como movimientos fisicos. Es obligatorio operar con parada de emergencia, limites de par y espacio de trabajo despejado.
- Sesgos del dataset: el comportamiento queda determinado por el estilo de teleoperacion de un unico operador en 100 episodios, con la distribucion de posiciones, velocidades y estrategias que aparezca en esos datos.
- Sin capacidades de lenguaje ni de razonamiento: no acepta instrucciones nuevas en lenguaje natural ni puede descomponer una tarea en subtareas.
- Sin datos de robustez: no se documenta el comportamiento ante distractores, cambios de fondo, oclusiones o iluminacion variable, condiciones que suelen provocar caidas de rendimiento en politicas de imitacion.
- Licencia Apache 2.0: permite uso comercial y modificacion, con los avisos de atribucion y la clausula de exencion de garantias habitual. El autor no ofrece ninguna garantia sobre el funcionamiento del modelo.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento ni soporte documentado.
- Trazabilidad limitada: no se detallan la arquitectura exacta del transformer, el tamano del chunk, las dimensiones ocultas ni el preprocesado de imagen empleado, lo que dificulta reproducir el entrenamiento de forma exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kartikbud/act_pick
- Dataset de entrenamiento: https://huggingface.co/datasets/kartikbud/pick
- Articulo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kartikbud/pick
