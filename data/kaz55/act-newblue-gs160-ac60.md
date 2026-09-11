# Kaz55/act-newblue-gs160-ac60

## Resumen

ACT-newblue-gs160-ac60 es una politica de imitacion robótica entrenada con la arquitectura ACT (Action Chunking Transformer) sobre la tarea "newblue" en un montaje compuesto por un robot DG-5F con brazo UR5e. No es un modelo de lenguaje: es un controlador viso-táctil que mapea observaciones multimodales (estado propioceptivo, dos cámaras RealSense y dos sensores táctiles GelSight) a secuencias de acciones de 60 pasos. Lo publica el usuario Kaz55 en Hugging Face dentro de la librería LeRobot.

El modelo forma parte de un barrido de ablacion de resolucion táctil: cinco variantes idénticas en todo excepto en la resolucion del GelSight (500x375, 320x240, 160x120, 88x66 y sin GelSight). Esta ficha corresponde a la variante de 160x120. El objetivo declarado del autor es aislar el efecto de la resolucion táctil, de modo que cualquier diferencia de rendimiento entre ejecuciones sea atribuible unicamente a ese factor.

Con 51.668.634 parametros (unos 51,7 millones) y un repositorio de 0,2 GB, es un modelo pequeno y desplegable en hardware modesto. Su relevancia es metodologica: aporta un punto de control reproducible dentro de un estudio de ablacion sobre percepcion táctil en manipulacion robotica, un area donde escasean las comparativas controladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), politica de imitacion con codificador CVAE y decodificador transformer |
| Parametros totales | 51.668.634 (~51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; horizonte de prediccion de chunk_size=60 y n_action_steps=60 |
| Tipos de cuantizacion | no disponible (repositorio distribuido en safetensors, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no aplica (politica de control robotico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria lerobot, PyTorch) |
| Modalidades de entrada | observation.state (26) + 2 camaras RealSense 640x480 + 2 sensores GelSight 160x120 |
| Variables excluidas | observation.velocity y observation.effort, excluidas deliberadamente |
| Dataset de entrenamiento | Kaz55/dg5f_ur5e_newblue_gs160, 90 episodios / 105.193 frames |
| Pasos de entrenamiento | 100.000 pasos (~7,6 epocas), batch 8, semilla 1000 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es una politica de imitacion basada en transformer que predice bloques de acciones ("action chunks") en lugar de acciones individuales, lo que reduce el error de acumulacion y suaviza la ejecucion. En esta implementacion el horizonte es de 60 acciones y se ejecutan las 60 en cada inferencia (chunk_size=60, n_action_steps=60). El modelo consume un vector de estado de 26 dimensiones junto con cuatro flujos visuales: dos camaras RealSense a 640x480 y dos sensores táctiles GelSight a 160x120.

El entrenamiento se realizo durante 100.000 pasos, equivalentes a aproximadamente 7,6 epocas sobre el dataset de 90 episodios y 105.193 frames, con batch de 8 y semilla 1000. El autor excluyo deliberadamente `observation.velocity` y `observation.effort`, presentes en el dataset, porque la derivacion automatica de caracteristicas los habria inyectado en la politica y habria introducido una segunda diferencia respecto al resto del barrido. Las cinco variantes del barrido comparten exactamente el mismo dataset, resolucion de RealSense, hiperparametros y semilla; solo cambia la resolucion del GelSight, lo que convierten en un experimento controlado de un unico factor.

## Capacidades

- Generacion de acciones de manipulacion robotica: produce secuencias de 60 acciones a partir de observaciones viso-táctiles y de estado.
- Percepcion multimodal: combina vision RGB (dos camaras RealSense a 640x480) con tacto (dos GelSight a 160x120) y propiocepcion (26 dimensiones).
- Control viso-táctil en tareas de contacto: el uso de sensores GelSight apunta a tareas donde la retroalimentacion táctil es informativa (agarre, insercion, contacto controlado).
- Ejecucion de politicas de imitacion entrenadas por comportamiento clonado sobre demostraciones teleoperadas.
- Integracion con el ecosistema LeRobot, que permite cargar el checkpoint, conectarlo a un robot y ejecutar politicas de forma estandarizada.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales: no se documentan modos de pensamiento, audio ni vision generativa; la unica especialidad es la entrada táctil a 160x120.

## Casos de uso

- Manipulacion con contacto en linea de montaje: la politica puede ejecutar la tarea "newblue" sobre el montaje DG-5F + UR5e replicando las demostraciones del dataset, con la ventaja de que el tacto a 160x120 aporta informacion de contacto que la vision por si sola no captura.
- Investigacion en ablacion de sensores táctiles: sirve como punto de comparacion directo contra act-newblue-gs500-ac60, gs320-ac60, gs88-ac60 y gs0-ac60 para medir el impacto de la resolucion táctil manteniendo todo lo demas constante.
- Referencia base en estudios de imitacion viso-táctil: al ser un checkpoint publico con dataset asociado, permite reproducir el entrenamiento (100.000 pasos, batch 8, semilla 1000) y verificar resultados.
- Evaluacion de estrategias de agarre: el modelo puede emplearse para estudiar como cambia la politica de agarre segun la informacion táctil disponible, comparando la variante 160x120 con la que no usa GelSight.
- Prototipado en robotica de investigacion: su tamano (51,7 M de parametros, 0,2 GB) permite iterar rapidamente en laboratorio sin necesidad de clústeres de GPU.
- Docencia y formacion en aprendizaje por imitacion: el par modelo-dataset es un ejemplo compacto y completo de un pipeline LeRobot con multiples modalidades de entrada.
- Despliegue en banco de pruebas de bajo coste: la huella de memoria reducida hace viable ejecutar la politica en una estacion de trabajo con una GPU de gama media o incluso en CPU para pruebas de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito en robot ni comparaciones cuantitativas entre las variantes del barrido.

El propio autor advierte que, en los barridos previos (`combined` y `blue_180ep`), la perdida de entrenamiento fue practicamente identica en todas las resoluciones de GelSight, incluida la variante sin GelSight. Por tanto, esas perdidas deben tratarse como una comprobacion de sanidad, no como evidencia sobre la resolucion táctil; esa pregunta requiere evaluacion en el robot real. No se dispone de datos de evaluacion on-robot para esta variante.

| Variante | Resolucion GelSight | Resultado publicado |
|---|---|---|
| act-newblue-gs500-ac60 | 500x375 | no disponible (sin metricas on-robot) |
| act-newblue-gs320-ac60 | 320x240 | no disponible (sin metricas on-robot) |
| act-newblue-gs160-ac60 | 160x120 | no disponible (sin metricas on-robot) |
| act-newblue-gs88-ac60 | 88x66 | no disponible (sin metricas on-robot) |
| act-newblue-gs0-ac60 | sin GelSight | no disponible (sin metricas on-robot) |

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia de calculo, los pesos en fp32 ocupan aproximadamente 207 MB (51,7 M de parametros x 4 bytes) y en fp16 unos 103 MB. La mayor parte del consumo proviene de las activaciones de los cuatro flujos visuales; una estimacion prudente es de 2 a 4 GB en fp32, pero es una estimacion derivada del recuento de parametros, no un dato medido.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM deberia ser suficiente (RTX 3060, RTX 4060, RTX 4090). Para entrenamiento con batch 8 y multiples flujos de imagen conviene una GPU de gama media-alta (RTX 4090, A100, H100), aunque el autor no especifica el hardware utilizado.
- Cabe en GPU de consumo: si, previsiblemente en practicamente cualquier GPU de consumo moderna; el repositorio de 0,2 GB es un indicador claro del reducido tamano del modelo.
- Opciones de despliegue: la libreria oficial es LeRobot (PyTorch), que gestiona la carga del checkpoint y la conexion con el robot. vLLM, llama.cpp, Ollama y TGI no aplican, ya que estan orientados a modelos de lenguaje y no a politicas de control. La exportacion a ONNX o TensorRT no esta documentada en la informacion disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones de frecuencia de control ni de tiempo de inferencia.

## Comparativa con modelos similares

La comparacion natural son las otras variantes del mismo barrido, que comparten arquitectura, dataset, hiperparametros y semilla, y solo difieren en la resolucion del GelSight.

| Modelo | Resolucion GelSight | Parametros | Chunk | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| act-newblue-gs160-ac60 | 160x120 | 51.668.634 | 60 | Estado + 2 RealSense + 2 GelSight | no disponible | publico en Hugging Face |
| act-newblue-gs500-ac60 | 500x375 | no disponible | 60 | Estado + 2 RealSense + 2 GelSight | no disponible | publico en Hugging Face |
| act-newblue-gs320-ac60 | 320x240 | no disponible | 60 | Estado + 2 RealSense + 2 GelSight | no disponible | publico en Hugging Face |
| act-newblue-gs88-ac60 | 88x66 | no disponible | 60 | Estado + 2 RealSense + 2 GelSight | no disponible | publico en Hugging Face |
| act-newblue-gs0-ac60 | sin GelSight | no disponible | 60 | Estado + 2 RealSense | no disponible | publico en Hugging Face |

No se dispone de comparaciones con otras familias de politicas (por ejemplo, Diffusion Policy o VLA genericos) dentro de la informacion proporcionada, ni de resultados que permitan situar esta variante frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- Especificidad de tarea y hardware: el modelo esta entrenado exclusivamente para la tarea "newblue" en el montaje DG-5F + UR5e. No es transferible a otros robots, tareas o disposiciones de camaras sin reentrenamiento.
- Licencia no disponible: al no declararse licencia en el repositorio, no puede asumirse permiso para uso comercial ni para redistribucion. Conviene contactar con el autor antes de cualquier uso en produccion.
- Sin evaluacion on-robot publicada: no hay metricas de exito, robustez ni generalizacion. El autor indica explicitamente que la evaluacion en robot es necesaria para responder a la pregunta del barrido.
- Perdida de entrenamiento no informativa: la perdida fue practicamente identica en todas las resoluciones de GelSight, incluida la variante sin tacto, por lo que no sirve como indicador de calidad de la politica.
- Riesgo de sobreajuste al entorno de demostracion: con 90 episodios y aproximadamente 7,6 epocas, la politica puede degradarse ante cambios de iluminacion, posicion de objetos o condiciones de contacto no vistas.
- Dependencia de las entradas exactas: el modelo espera 26 dimensiones de estado, dos camaras RealSense a 640x480 y dos GelSight a 160x120. Cualquier cambio en la configuracion de sensores invalida el checkpoint.
- Exclusion deliberada de velocidad y esfuerzo: estas senales existen en el dataset pero no alimentan a la politica, de modo que el modelo no las utiliza aunque esten disponibles en el robot.
- Sesgos: no hay informacion sobre la diversidad de condiciones de recogida de demostraciones ni sobre sesgos sistematicos de la politica. Los sesgos inherentes a la teleoperacion (por ejemplo, estilos de demostracion limitados) no estan caracterizados.
- Datos de la ficha: la fecha de creacion indicada en Hugging Face es 2026-09-11, posterior a la fecha habitual de consulta; se reproduce tal cual figura en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kaz55/act-newblue-gs160-ac60
- Dataset asociado: https://huggingface.co/datasets/Kaz55/dg5f_ur5e_newblue_gs160
- Variante GelSight 500x375: https://huggingface.co/Kaz55/act-newblue-gs500-ac60
- Variante GelSight 320x240: https://huggingface.co/Kaz55/act-newblue-gs320-ac60
- Variante GelSight 88x66: https://huggingface.co/Kaz55/act-newblue-gs88-ac60
- Variante sin GelSight: https://huggingface.co/Kaz55/act-newblue-gs0-ac60
- La busqueda web realizada no devolvio resultados relevantes para este modelo (unicamente paginas sin relacion con robotica o aprendizaje automatico). No se han localizado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
