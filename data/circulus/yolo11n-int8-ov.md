# circulus/yolo11n-int8-ov

## Resumen

`circulus/yolo11n-int8-ov` es una exportacion a OpenVINO IR del detector de objetos Ultralytics/YOLO11n, cuantizada a INT8 mediante cuantizacion post-entrenamiento (PTQ) completa. El modelo lo publica el usuario `circulus` como material del curso ARCademy de OpenVINO, concretamente para la leccion "03 YOLO11 object detection", y se genera con el script `convert/convert_all.py` de dicho courseware. No es un modelo de lenguaje: es un detector de objetos de una sola etapa orientado a inferencia en hardware Intel.

El artefacto resuelve un problema muy concreto: disponer de un detector COCO de 80 clases con pesos de aproximadamente 3 MB, ejecutable en CPU, iGPU o NPU Intel sin GPU dedicada. La entrada es un tensor fijo `[1,3,640,640]` con letterbox y la salida es `[1,84,8400]`, es decir, 8400 predicciones con 4 valores de caja (xywh) mas 80 puntuaciones de clase COCO. La supresion de no maximos (NMS) no forma parte del grafo exportado: se aplica en el codigo de la leccion.

Su relevancia es practica y acotada: sirve como referencia reproducible de un pipeline completo de exportacion y cuantizacion (Ultralytics a OpenVINO IR INT8 con NNCF) y como bloque de deteccion de bajo coste para prototipos y despliegues en el borde. El repositorio figura con 0 descargas y 0 likes, y la model card no incluye metricas de precision ni latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional de deteccion de objetos de una etapa (familia YOLO11, Ultralytics); no disponible el detalle de capas en la informacion proporcionada |
| Parametros totales | no disponible en la informacion proporcionada (el modelo base es Ultralytics/YOLO11n) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de imagen `[1,3,640,640]`) |
| Tipos de cuantizacion | INT8 (PTQ completo, calibracion con COCO128 mediante NNCF a traves de Ultralytics); no se documentan otros niveles |
| Idiomas soportados | no aplica; las 80 clases detectadas corresponden a las categorias de COCO en ingles |
| Licencia | `other` (segun la model card); el modelo base pertenece a Ultralytics, cuyos terminos deben verificarse aparte |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`) en INT8; tamano declarado de 3 MB |
| Entrada | `[1,3,640,640]`, letterboxed |
| Salida | `[1,84,8400]` = xywh + 80 puntuaciones COCO |
| NMS | No incluido en el grafo; se aplica en el codigo de la leccion |
| Modelo base | Ultralytics/YOLO11n |
| Tamano del repositorio | 0.0 GB (segun HuggingFace); la model card declara 3 MB para los pesos INT8 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del detector mas alla de su pertenencia a la familia YOLO11 de Ultralytics y de su condicion de modelo de deteccion de objetos de una sola etapa. El unico detalle tecnico documentado es el proceso de optimizacion: se parte del modelo base Ultralytics/YOLO11n y se aplica una cuantizacion post-entrenamiento (PTQ) completa a INT8, calibrada con el subconjunto COCO128 y ejecutada con Neural Network Compression Framework (NNCF) a traves del flujo de exportacion de Ultralytics. El resultado se serializa como OpenVINO IR con entrada estatica `[1,3,640,640]` y salida `[1,84,8400]`.

No hay informacion en la model card sobre el dataset de entrenamiento original (numero de imagenes o tokens, composicion, tecnicas de aumento de datos) ni sobre fases de ajuste fino con refuerzo o preferencias, algo que tampoco aplica a un detector de objetos. La innovacion destacable del artefacto es de ingenieria de despliegue, no de modelado: reducir el detector a 3 MB en INT8 manteniendo la interfaz de salida habitual de Ultralytics, de modo que el consumidor solo tenga que anadir el paso de NMS. La calibracion con COCO128 (un conjunto pequeno) es un punto a vigilar, ya que una calibracion poco representativa puede degradar la precision en dominios alejados de COCO.

## Capacidades

- Deteccion de objetos en imagenes: 80 clases del conjunto COCO (persona, vehiculo, animal, objetos cotidianos, etc.).
- Localizacion con cajas: salida de 8400 predicciones con formato xywh mas 80 puntuaciones de clase, lista para NMS posterior.
- Inferencia con entrada estatica de 640x640 con letterbox, lo que permite procesar imagenes de distintas proporciones reescaladas.
- Ejecucion en CPU Intel, iGPU Intel y NPU Intel a traves de OpenVINO Runtime, sin necesidad de GPU dedicada.
- Integracion con el ecosistema Ultralytics: se puede cargar con la API de Ultralytics apuntando al directorio OpenVINO descargado.
- Descarga programatica sencilla mediante `snapshot_download` de `huggingface_hub`.
- No soporta tool calling, function calling ni uso como agente.
- No soporta razonamiento multi-paso, generacion de texto, codigo ni matematicas: no es un modelo de lenguaje.
- No dispone de modo "thinking", ni de entrada o salida de audio.
- No hay capacidades de segmentacion de instancias, estimacion de pose ni clasificacion mas alla de las 80 clases COCO.
- Capacidades multilingues: no aplica; las etiquetas de clase son identificadores de COCO.

## Casos de uso

- Videovigilancia en el borde: desplegado en un mini PC o NUC con CPU Intel, el modelo detecta personas y vehiculos en streams de camara a 640x640 sin GPU dedicada, con el NMS implementado en el codigo de aplicacion sobre la salida `[1,84,8400]`.
- Control de calidad industrial: deteccion de productos o componentes en la linea de montaje; los 3 MB de pesos permiten embeber el modelo en equipos con almacenamiento y memoria limitados.
- Analitica de retail: conteo de personas en tienda o paso por zonas a partir de detecciones de la clase "person", procesando fotogramas de camaras fijas con entrada letterbox.
- Robotica movil y drones: deteccion de obstaculos y objetos relevantes en tiempo de ejecucion sobre plataformas con CPU Intel y presupuesto energetico ajustado.
- Preprocesado para anonimizacion: localizar personas o matriculas (vehiculos como proxy) antes de aplicar desenfoque en pipelines de tratamiento de imagenes.
- Docencia y formacion tecnica: es el artefacto de referencia de la leccion "03 YOLO11 object detection" del courseware ARCademy, util para reproducir el flujo completo de exportacion, cuantizacion INT8 y ejecucion con OpenVINO.
- Aplicaciones de escritorio offline: integrar la deteccion en herramientas locales que no pueden depender de servicios en la nube, aprovechando que el modelo se ejecuta en CPU.
- Prototipado rapido de pipelines de vision: usar este INT8 como linea base ligera antes de escalar a variantes mayores de YOLO11 si la precision resulta insuficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye mAP, latencia ni throughput, ni para el modelo cuantizado ni para el modelo base. Tampoco se han encontrado metricas en los resultados de busqueda web, que no devolvieron contenido relacionado con este modelo.

Nota: las cifras oficiales de precision y coste computacional del modelo base Ultralytics/YOLO11n (parametros, GFLOPs y mAP sobre COCO val) se publican en la documentacion de Ultralytics; no se reproducen aqui porque no forman parte de la informacion proporcionada y no deben atribuirse a esta exportacion INT8, cuya precision puede diferir tras la cuantizacion.

## Requisitos de hardware

- VRAM: no aplica en el escenario tipico; el modelo esta pensado para ejecucion en CPU o iGPU Intel, no requiere VRAM de GPU dedicada.
- Pesos: aproximadamente 3 MB en INT8 (dato declarado en la model card).
- Memoria en ejecucion: no disponible; con entrada estatica `[1,3,640,640]` el consumo lo dominan las activaciones intermedias y las estructuras del runtime, no los pesos.
- GPU recomendadas: no se especifican; el formato OpenVINO IR esta orientado a CPU Intel, iGPU Intel (Iris Xe, Arc) y NPU Intel. Para GPU NVIDIA, AMD u otras seria necesario reconvertir el modelo a otro formato.
- Cabe en GPU de consumo: el artefacto esta disenado para hardware de consumo Intel, no para GPU dedicada; ejecutarlo en una GPU de consumo NVIDIA requeriria exportar el modelo base a otro runtime.
- Opciones de despliegue: OpenVINO Runtime (Python, C++ o C), Ultralytics con backend OpenVINO, OpenVINO Model Server; integracion con `huggingface_hub` para la descarga.
- No aplican runtimes de modelos de lenguaje como vLLM, llama.cpp, Ollama o TGI: son herramientas para LLM y no soportan este grafo de deteccion.
- Latencia y throughput estimados: no disponibles. Dependen del procesador objetivo, del numero de hilos y de si se usa CPU, iGPU o NPU, y no se documentan en la model card.
- Requisito de postproceso: el NMS debe implementarse en la aplicacion consumidora, ya que no forma parte del grafo exportado.

## Comparativa con modelos similares

Los resultados de busqueda web no aportaron informacion sobre alternativas y la model card no ofrece comparaciones. La siguiente tabla recoge unicamente lo que puede afirmarse a partir de la informacion disponible, marcando como no disponible todo dato ausente.

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| circulus/yolo11n-int8-ov | no disponible (base: YOLO11n) | imagen 640x640 estatica | no disponible | `other` (verificar terminos de Ultralytics) | HuggingFace, 0 descargas, 0 likes |
| Ultralytics/YOLO11n (modelo base, PyTorch) | no disponible en la informacion proporcionada | imagen 640x640 | no disponible | la de Ultralytics; verificar | repositorio de Ultralytics |
| Otras variantes YOLO11 (s, m, l, x) | no disponible | imagen 640x640 | no disponible | la de Ultralytics; verificar | repositorio de Ultralytics |
| Otros detectores de una etapa (por ejemplo, familia YOLOv8) | no disponible | imagen 640x640 | no disponible | la de Ultralytics; verificar | repositorio de Ultralytics |

## Limitaciones y advertencias

- La salida es cruda: no incluye NMS, de modo que cualquier integracion debe implementar el postproceso (IoU y umbral de confianza) por su cuenta.
- La entrada es estatica `[1,3,640,640]`: no admite resoluciones o lotes variables sin reexportar el modelo.
- Solo detecta las 80 clases de COCO; no cubre categorias personalizadas ni tareas de segmentacion o pose.
- La calibracion INT8 se hizo con COCO128, un conjunto reducido; la perdida de precision frente al modelo en punto flotante no esta cuantificada en la model card y puede ser mayor en dominios distintos de COCO.
- No hay informacion publicada sobre sesgos del modelo. Cabe esperar los sesgos heredados del conjunto COCO y del modelo base, tanto en la distribucion de clases como en el rendimiento por region geografica, tono de piel o genero, pero no se documentan aqui.
- Riesgo de alucinacion: en el contexto de un detector, se traduce en falsos positivos y cajas mal localizadas, especialmente con oclusiones, objetos pequenos o clases poco representadas.
- Licencia `other`: los terminos exactos no estan detallados en la model card. Al derivar de Ultralytics/YOLO11n, el uso comercial esta sujeto a las condiciones del modelo base y debe verificarse antes de cualquier despliegue en produccion.
- El repositorio aparece con 0 descargas y 0 likes y un tamano declarado de 0.0 GB, mientras que la model card indica 3 MB de pesos; conviene comprobar los ficheros reales tras la descarga.
- No hay garantia de mantenimiento ni versionado del artefacto; la fecha de creacion registrada es 2026-09-13.
- Idiomas: no aplica, pero implica que las etiquetas de clase estan en ingles y cualquier interfaz multilingue debe implementarse en la capa de aplicacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/circulus/yolo11n-int8-ov
- Modelo base: https://huggingface.co/Ultralytics/YOLO11n
- Documentacion de Ultralytics (familia YOLO11): no disponible en la informacion proporcionada como URL concreta
- OpenVINO: no disponible en la informacion proporcionada como URL concreta
- NNCF (Neural Network Compression Framework): no disponible en la informacion proporcionada como URL concreta
- Courseware ARCademy OpenVINO (script `convert/convert_all.py`, leccion "03 YOLO11 object detection"): no disponible como URL
- Paper, blog o demo especificos de esta exportacion: no disponible
- Las busquedas web realizadas no devolvieron ningun enlace relevante sobre este modelo; los unicos resultados obtenidos fueron paginas corporativas de Microsoft sin relacion con el artefacto.
