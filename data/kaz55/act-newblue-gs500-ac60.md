# Kaz55/act-newblue-gs500-ac60

## Resumen

`Kaz55/act-newblue-gs500-ac60` es una politica robotica de aprendizaje por imitacion entrenada con la libreria LeRobot. Concretamente, implementa ACT (Action Chunking Transformer), la arquitectura de tipo transformer con componente CVAE introducida por Zhao et al. para manipulacion fina de bajo coste. No es un modelo de lenguaje: es un controlador viso-tactil que mapea observaciones (estado del robot, dos camaras RealSense y dos sensores tactiles GelSight) a secuencias de acciones de 60 pasos.

El modelo pertenece a una barrido (sweep) de resolucion del sensor GelSight sobre la tarea "newblue" con el gripper DG-5F montado sobre un brazo UR5e. Esta variante concreta usa GelSight a 500x375 (resolucion nativa) y es, por tanto, el punto de mayor fidelidad tactil del barrido. Las demas variantes (`gs320`, `gs160`, `gs88`, `gs0`) son identicas salvo en la resolucion del tactil, de modo que cualquier diferencia de rendimiento entre ellas seria atribuible exclusivamente a ese factor, que es precisamente el objetivo del experimento.

El modelo tiene 51.668.634 parametros y un repositorio de 0.2 GB. Es relevante ahora porque ejemplifica la tendencia de reproducibilidad y estudios de ablacion en robotica open source: misma semilla (1000), mismo dataset y mismo presupuesto de entrenamiento, variando una sola dimension. Sin embargo, conviene advertir que no se ha publicado ninguna evaluacion en robot real, la licencia no esta declarada y el propio autor senala que la perdida de entrenamiento fue practicamente identica en todas las resoluciones, incluida la variante sin GelSight.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con componente CVAE, implementada en LeRobot |
| Parametros totales | 51.668.634 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; horizonte de accion fijo con chunk_size=60 y n_action_steps=60 |
| Tipos de cuantizacion | no disponibles; el repositorio solo publica safetensors (tamano coherente con fp32, ~207 MB) |
| Idiomas soportados | no disponible (no aplica: politica robotica sin salida de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato LeRobot / PyTorch) |
| Tarea | newblue sobre DG-5F + UR5e |
| Entradas | observation.state (26) + 2x RealSense 640x480 + 2x GelSight 500x375 |
| Entradas excluidas | observation.velocity y observation.effort (excluidas deliberadamente por el autor) |
| Dataset de entrenamiento | Kaz55/dg5f_ur5e_newblue, 90 episodios / 105.193 frames |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder para aprendizaje por imitacion. El encoder consume las observaciones (estado proprioceptivo de 26 dimensiones y las cuatro corrientes visuales: dos RealSense y dos GelSight) y el decoder genera un chunk de 60 acciones de forma no autoregresiva. La variante implementada en LeRobot anade un CVAE que modela la variabilidad de las demostraciones humanas durante el entrenamiento y se desactiva en inferencia, lo que permite capturar multimodalidad en los datos sin perder determinismo en produccion.

El entrenamiento se realizo durante 100.000 pasos (aproximadamente 7,6 epocas sobre el dataset), con batch de 8 y semilla 1000. El dataset contiene 90 episodios y 105.193 frames de la tarea newblue. El autor documenta una decision metodologica relevante: `observation.velocity` y `observation.effort` existen en el dataset pero se excluyen a proposito, porque la derivacion automatica de caracteristicas de LeRobot los habria alimentado a la politica e introducido una segunda diferencia entre las ejecuciones del barrido. Las dos camaras RealSense se mantienen a 640x480 identicas en todo el sweep, de modo que la unica variable es la resolucion del GelSight.

No se documenta ningun proceso de RLHF, DPO ni ajuste por preferencias, algo esperable en una politica de robotica entrenada por imitacion supervisada. Tampoco se describen innovaciones tecnicas adicionales mas alla de la propia arquitectura ACT y del diseno controlado del barrido de ablacion.

## Capacidades

- Generacion de trayectorias de accion en bloques de 60 pasos a partir de observaciones multimodales (estado + vision RGB + tactil).
- Percepcion tactil de alta resolucion mediante dos sensores GelSight a 500x375, la resolucion nativa del sensor en este barrido.
- Fusion de cuatro corrientes visuales (dos RealSense y dos GelSight) junto con el estado proprioceptivo de 26 dimensiones.
- Ejecucion de tareas de manipulacion viso-tactil en el montaje DG-5F + UR5e (tarea newblue).
- Reproducibilidad experimental: semilla fija (1000) y presupuesto de entrenamiento fijo, lo que permite comparaciones controladas dentro del barrido.
- Integracion con el ecosistema LeRobot para carga de politicas, normalizacion de observaciones y ejecucion en bucle de control.
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues, modo thinking, vision generativa ni audio. Es exclusivamente una politica de control motor.

## Casos de uso

- Control de un UR5e con gripper DG-5F en la tarea newblue: la politica consume el estado de 26 dimensiones y las cuatro imagenes y emite chunks de 60 acciones, lo que encaja con un bucle de control que amortiza la latencia de inferencia cada 60 pasos.
- Investigacion en ablacion de sensores tactiles: al existir variantes identicas con GelSight a 320x240, 160x120, 88x66 y sin GelSight, este modelo sirve como condicion de maxima resolucion en un estudio controlado sobre el valor real de la informacion tactil.
- Punto de partida para fine-tuning en tareas de ensamblaje con contacto: las representaciones aprendidas con tactil nativo son un inicializador razonable para tareas que requieren deteccion de fuerza y deslizamiento.
- Replicacion de pipelines de LeRobot: sirve como ejemplo completo de configuracion de politica ACT con multiples camaras y multiples sensores tactiles, util para validar infraestructura de entrenamiento propia.
- Comparacion de politicas en el mismo entorno: al compartir dataset, semilla y arquitectura con el resto del sweep, permite aislar el efecto de la resolucion de entrada sin confundirlo con otras variables.
- Docencia en aprendizaje por imitacion: el modelo y su dataset asociado (90 episodios, 105.193 frames) forman un caso de estudio de tamano manejable para explicar ACT, chunking de acciones y CVAE.
- Validacion offline sobre el dataset: puede evaluarse la perdida y las predicciones de accion contra los episodios registrados antes de comprometer tiempo de robot real, aunque el autor advierte que la perdida no es evidencia sobre la calidad tactil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito ni metricas de evaluacion en robot real.

El unico dato de rendimiento mencionado es cualitativo: en los barridos anteriores (`combined` y `blue_180ep`), la perdida de entrenamiento fue esencialmente identica en todas las resoluciones de GelSight, incluida la variante sin tactil. El autor indica explicitamente que estas perdidas deben tratarse como una comprobacion de sanidad y no como evidencia sobre la resolucion tactil, y que esa pregunta requiere evaluacion sobre el robot.

| Metrica | Resultado |
|---|---|
| Perdida de entrenamiento | no se publican valores numericos; el autor indica que fue practicamente identica entre resoluciones de GelSight |
| Tasa de exito en robot real | no disponible |
| Benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) | no aplica |

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de los 51,668 millones de parametros, los pesos ocupan aproximadamente 207 MB en fp32 y unos 103 MB en fp16. Sumando activaciones, los backbones visuales de las cuatro corrientes y los buffers de imagenes, es razonable esperar un consumo de pocos GB, aunque no se ha publicado una medicion concreta.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM deberia ser suficiente; no se han publicado pruebas con modelos concretos. Para entrenamiento, conviene una GPU de gama media-alta (RTX 3090/4090 o superior), dado que el entrenamiento se realizo con batch 8 durante 100.000 pasos.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU moderna de gama media, e incluso en CPU para inferencia a baja frecuencia de control, aunque no hay mediciones publicadas.
- Opciones de despliegue: LeRobot (PyTorch) es la via nativa, ya que el modelo usa `library_name: lerobot`. vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje. La exportacion a ONNX o TensorRT es posible en principio, pero no esta documentada.
- Latencia y throughput: no disponibles. La configuracion chunk_size=60 / n_action_steps=60 implica que cada inferencia produce 60 acciones, lo que reduce la frecuencia efectiva de llamadas al modelo.

## Comparativa con modelos similares

La comparacion mas directa es con las otras variantes del mismo barrido, que comparten dataset, semilla, arquitectura y presupuesto de entrenamiento, y solo difieren en la resolucion del GelSight.

| Modelo | GelSight | Arquitectura | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kaz55/act-newblue-gs500-ac60 | 500x375 (nativa) | ACT, chunk 60 | 51.668.634 | no disponible | publico en HuggingFace |
| Kaz55/act-newblue-gs320-ac60 | 320x240 | ACT, chunk 60 | no disponible | no disponible | publico en HuggingFace |
| Kaz55/act-newblue-gs160-ac60 | 160x120 | ACT, chunk 60 | no disponible | no disponible | publico en HuggingFace |
| Kaz55/act-newblue-gs88-ac60 | 88x66 | ACT, chunk 60 | no disponible | no disponible | publico en HuggingFace |
| Kaz55/act-newblue-gs0-ac60 | sin GelSight | ACT, chunk 60 | no disponible | no disponible | publico en HuggingFace |

No se dispone de datos para comparar con otras familias de politicas de robotica (por ejemplo, Diffusion Policy u otras implementaciones de ACT en LeRobot) en esta misma tarea, ni de metricas de rendimiento que permitan establecer una jerarquia entre ellas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al entrenarse sobre un unico dataset de 90 episodios de una tarea concreta, la politica heredara los sesgos de las demostraciones, pero no se ha publicado ningun analisis al respecto.
- Riesgo de alucinacion: no aplica en el sentido habitual de los modelos generativos de texto, pero si existe el riesgo de que la politica produzca acciones no validas ante observaciones fuera de la distribucion de entrenamiento.
- La perdida de entrenamiento no discrimina entre resoluciones tactiles: el autor advierte que fue practicamente identica incluso sin GelSight, por lo que este dato no debe usarse para justificar la utilidad del tactil. La validacion requiere robot real.
- No se han publicado resultados de evaluacion en robot, ni tasas de exito, ni comparaciones cuantitativas con las otras variantes del barrido.
- Se trata de un unico entrenamiento con una unica semilla (1000), por lo que no hay estimacion de varianza entre ejecuciones.
- No hay licencia declarada. Esto impide determinar si el uso comercial esta permitido; en la practica, la ausencia de licencia implica que no se conceden derechos explicitos de uso.
- Rendimiento limitado al montaje DG-5F + UR5e y a la tarea newblue; no hay evidencia de generalizacion a otros robots, grippers o tareas.
- El modelo tiene 0 descargas y 0 likes en el momento del registro, por lo que no ha sido validado por terceros.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los resultados obtenidos eran paginas de soporte de Microsoft sin relacion con el contenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kaz55/act-newblue-gs500-ac60
- Dataset asociado: https://huggingface.co/datasets/Kaz55/dg5f_ur5e_newblue
- Libreria LeRobot: https://github.com/huggingface/lerobot
- Paper original de ACT (referencia del metodo, no citado en la model card): https://arxiv.org/abs/2304.13705
- Paper, blog, repositorio o demo adicionales del autor: no disponibles. La busqueda web no aporto resultados relevantes.
