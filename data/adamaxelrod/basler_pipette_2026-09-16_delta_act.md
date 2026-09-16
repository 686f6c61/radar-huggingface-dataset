# AdamAxelrod/basler_pipette_2026-09-16_delta_act

## Resumen

El modelo `AdamAxelrod/basler_pipette_2026-09-16_delta_act` es una política de robótica entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT). No es un modelo de lenguaje: es un controlador neuronal que, a partir de una imagen de cámara y del estado articular de un brazo robótico, predice una secuencia corta de acciones motrices. Lo desarrolla el usuario AdamAxelrod y se distribuye a través de HuggingFace con la librería LeRobot, la pila de robótica de Hugging Face.

La política está especializada en una tarea concreta: `move_pipette_under_microscope`, ejecutada sobre un robot Mecademic Meca500 con una cámara de microscopio. Consume un vector de estado de 6 dimensiones y una imagen RGB de 3x640x427, y produce un vector de acción de 7 dimensiones (resolución de 6 ejes más pinza). El checkpoint tiene 51.597.959 parámetros y ocupa 0,2 GB en el repositorio.

Es relevante porque ejemplifica el flujo actual de la robótica open source: grabar demostraciones teleoperadas, entrenar una política ACT con LeRobot y desplegarla con un único comando CLI. Su valor práctico es doble: sirve como política funcional para replicar esa tarea en hardware idéntico y como referencia reproducible para investigar imitación visomotora en manipulación de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con CVAE y action chunking (ACT, Action Chunking with Transformers); backbone visual convolucional |
| Parametros totales | 51.597.959 (dato de los safetensors del repositorio) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica. La política condiciona sobre un horizonte de observacion de un unico frame mas el estado; el "chunk" de acciones predicho tiene longitud fija definida por la configuracion ACT, no publicada en la model card |
| Tipos de cuantizacion | No disponible (no se documentan variantes cuantizadas; los pesos se distribuyen en safetensors) |
| Idiomas soportados | No aplica (no genera texto). La tarea se especifica con la cadena `move_pipette_under_microscope` en el prompt de tarea |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

Especificaciones de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.images.microscope_cam` | Visual | (3, 640, 427) |
| `observation.state` | Estado | (6,) |
| `action` | Accion | (7,) |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion publicado en el paper arXiv:2304.13705 que predice fragmentos ("chunks") de acciones en lugar de un unico paso de control. La formulacion estandar combina un backbone visual convolucional que codifica las imagenes de camara con un transformer encoder-decoder que, condicionado por el estado articular actual y por una variable latente de un CVAE, genera la secuencia de acciones del chunk. Predecir varios pasos de golpe reduce el error de acumulacion de la politica y mitiga el problema de la ambiguedad de las demostraciones humanas; en inferencia el chunk se suele suavizar con ensamblado temporal. No se han publicado en la model card detalles especificos sobre la anchura, el numero de capas o el horizonte del chunk de esta instancia concreta.

El entrenamiento se hizo con LeRobot 0.5.2 sobre el dataset `AdamAxelrod/basler_pipette_2026-09-16_delta`: 51 episodios, 23.202 frames a 20 FPS (aproximadamente 19 minutos de demostraciones teleoperadas), con una unica tarea. La configuracion reportada es de 100.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni etapas de refinamiento posteriores; al tratarse de imitacion supervisada pura, el ajuste se limita a clonar el comportamiento de las demostraciones. Tampoco se detalla si hubo aumentos de datos, cambios de iluminacion o variaciones en la posicion de los objetos durante la recogida.

## Capacidades

- Generacion de acciones motoras continuas: produce un vector de 7 dimensiones por paso, correspondiente a la cinematica de 6 ejes del Meca500 mas la actuacion de la pinza.
- Control visomotor de precision: condiciona la accion sobre imagen de microscopio (3x640x427) y estado articular (6,), lo que permite manipular objetos bajo aumento.
- Aprendizaje por imitacion de demostraciones teleoperadas: reproduce trayectorias aprendidas de 51 episodios para la tarea `move_pipette_under_microscope`.
- Operacion en bucle cerrado a la frecuencia del dataset, 20 FPS, con prediccion de chunks de acciones.
- Ejecucion autonoma de episodios completos mediante el comando `lerobot-rollout`, con estrategia `base` (sin grabacion) o con grabacion de episodios.
- Reentrenamiento y ajuste fino: la misma receta (`lerobot-train` con `--policy.type=act`) permite entrenar nuevas politicas sobre datasets propios.
- No soporta tool calling, function calling, razonamiento multi-paso simbolico, vision de proposito general, audio ni generacion de texto. Sus capacidades linguisticas son nulas: solo consume una etiqueta de tarea como condicionamiento.

## Casos de uso

- Manipulacion de precision bajo microscopio: es exactamente su tarea de entrenamiento. El modelo coloca una pipeta bajo el objetivo del microscopio a partir de la imagen de la camara, lo que lo hace adecuado para laboratorios que necesitan posicionamiento sub-milimetrico repetitivo sin intervencion humana continua.
- Replicacion en una celda robotica identica: si se dispone de un Meca500 con la misma camara y la misma calibracion, la politica se despliega con `lerobot-rollout` y la tarea se ejecuta en bucle durante `--duration` segundos, sin necesidad de reentrenar.
- Punto de partida para transferencia: el checkpoint sirve como inicializacion para ajuste fino con un dataset propio, util cuando se cambia la pipeta, el portaobjetos o el rango de posiciones de trabajo.
- Baseline de comparacion en investigacion: ACT es la referencia habitual frente a Diffusion Policy u otras politicas de imitacion; este checkpoint permite reproducir la linea base con un dataset pequeno realista (23.202 frames) y medir el efecto de cambios en chunking, aumentos de datos o ensamblado temporal.
- Validacion de pipelines de datos teleoperados: sirve para comprobar si un flujo de grabacion, curado y visualizacion de datasets LeRobot (via el Space `visualize_dataset`) produce politicas entrenables antes de invertir en campanas de recogida mayores.
- Automatizacion de rutinas de laboratorio con operador remoto: en lugar de teleoperar cada muestra, un operador puede supervisar la ejecucion de la politica y tomar el control solo en los fallos, reduciendo carga de trabajo en tareas de alimentacion de muestras.
- Investigacion sobre robustez y distribucion fuera de entrenamiento: al disponer de pesos y dataset publicos, permite medir sistematicamente como degrada la politica ante cambios de iluminacion, posicion de la pipeta o pequenas variaciones de camara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con la linea explicita `No evaluation results have been provided for this policy yet`, por lo que no hay tasas de exito, numero de ensayos ni condiciones de prueba. Tampoco se reportan metricas de error de accion (MSE/L1) sobre el conjunto de validacion.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,6 M de parametros, los pesos ocupan aproximadamente 206 MB en FP32 y 103 MB en FP16. Sumando activaciones del backbone visual sobre una imagen de 3x640x427, el consumo realista se situa en el rango de 0,5 a 1,5 GB en FP32, segun el tamano del lote y el horizonte del chunk. Cifra orientativa, no publicada por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. No se requiere A100 ni H100. Una RTX 3060, RTX 4060, RTX 4090 o incluso una GPU integrada moderna pueden ejecutar la inferencia.
- Cabe en GPU de consumo: si. Es una politica de ~52 M de parametros; el cuello de botella no es la memoria sino la latencia por paso, ya que el bucle de control trabaja a 20 FPS (presupuesto de 50 ms por paso) y cada paso implica un paso forward del backbone visual.
- CPU: la inferencia en CPU es viable en terminos de memoria, pero puede no sostener 20 FPS con una imagen de 640x427; conviene medir en el hardware objetivo antes de desplegar.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`), PyTorch en Python. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje. No se documenta exportacion a ONNX, TensorRT ni formato GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tiempo por inferencia ni de tasa de exito en hardware real.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `basler_pipette_2026-09-16_delta_act` (este) | 51.597.959 | Estado (6,) + imagen 3x640x427 | Accion (7,) | apache-2.0 | HuggingFace, libreria LeRobot |
| Diffusion Policy (referencia del metodo) | No disponible | Estado + imagenes | Acciones (chunk) | No disponible | Implementado en LeRobot; checkpoints dependientes del dataset |
| ACT generico de LeRobot (otras politicas ACT) | Del orden de decenas de millones, variable por configuracion | Estado + imagenes | Acciones (chunk) | Depende del autor (habitualmente apache-2.0 o MIT) | Multiples checkpoints publicos en HuggingFace |
| Modelos VLA (Vision-Language-Action, p. ej. SmolVLA o pi0) | Muy superior al de una ACT (cientos de millones a miles de millones) | Instruccion en lenguaje + imagenes + estado | Acciones | Variable (a menudo Apache 2.0 o de uso restringido) | HuggingFace, ecosistema LeRobot |

Las cifras de parametros de las alternativas no aparecen en la informacion proporcionada en esta busqueda y por tanto se marcan como no disponibles o cualitativas. La diferencia funcional clave frente a las familias VLA es que este checkpoint no generaliza a instrucciones en lenguaje ni a multiples tareas: esta entrenado para una unica tarea, sobre un unico robot y con una unica camara. A cambio, su huella de memoria y su coste de inferencia son ordenes de magnitud menores.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasa de exito, numero de ensayos ni condiciones de prueba. Cualquier uso en produccion debe ir precedido de una validacion en el hardware real.
- Sobreajuste al montaje concreto: entrenado para el tipo de robot `meca500_basler` con la camara `microscope_cam` y la tarea `move_pipette_under_microscope`. Cambios en la cinematica, en el utillaje o en la montura de la camara invalidan la politica.
- Dataset muy pequeno: 51 episodios y 23.202 frames (unos 19 minutos a 20 FPS) limitan la generalizacion ante posiciones de objeto, iluminacion o fondo no vistos durante el entrenamiento.
- Discrepancia de resolucion a revisar: la politica fue entrenada con imagenes de forma (3, 640, 427), mientras que el ejemplo de `lerobot-rollout` de la model card configura camaras a 640x480 y 30 FPS. Hay que verificar que la resolucion y la frecuencia reales coinciden con las de entrenamiento antes de desplegar.
- Riesgo de acciones fuera de distribucion: no existe "alucinacion" en sentido linguistico, pero si un fallo silencioso cuando la escena difiere de la entrenada; la politica puede generar movimientos fisicamente validos pero incorrectos para la tarea. Es imprescindible un supervisor y limites de seguridad en el robot.
- Dependencia de calibracion: los valores de `observation.state` (6,) y la escala de las acciones dependen del calibrado del Meca500 y del espacio de acciones usado en el dataset (`delta` en el nombre del dataset); un calibrado distinto desalinea el control.
- Sin soporte multilingue ni de lenguaje: no procesa instrucciones en lenguaje natural, solo la etiqueta de tarea entrenada. Cambiar esa cadena no cambia el comportamiento aprendido.
- Sin variantes cuantizadas publicadas: no hay versiones GGUF, ONNX ni INT8 que faciliten despliegue en hardware embebido.
- Licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion. No incluye garantias; la responsabilidad por danos fisicos o fallos en produccion recae en quien despliega.
- Coste de oportunidad: si el objetivo es una tarea distinta, reentrenar con datos propios es probablemente mas rentable que adaptar este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AdamAxelrod/basler_pipette_2026-09-16_delta_act
- Dataset de entrenamiento: https://huggingface.co/datasets/AdamAxelrod/basler_pipette_2026-09-16_delta
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=AdamAxelrod/basler_pipette_2026-09-16_delta
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento (imitation learning): https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos correspondian a contenido no relacionado (videoclips musicales) y se han descartado.
