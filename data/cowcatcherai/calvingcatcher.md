# CowcatcherAI/Calvingcatcher

## Resumen

Calvingcatcher es un modelo de deteccion de objetos basado en Ultralytics YOLO (familia `yolo26m`) entrenado especificamente para identificar las senales visuales del parto en ganado vacuno a partir de imagenes de camaras de establo convencionales. Lo desarrolla CowcatcherAI, un equipo de agricultores que entreno los modelos con grabaciones reales de sus propios establos, y forma el nucleo de vision de su sistema CalvingCatcher, pensado para monitorizar 24/7 la paridera sin necesidad de inspecciones presenciales nocturnas.

A diferencia de un detector binario de "parto si/no", el modelo detecta cinco clases progresivas —`waterbag`, `legs`, `head`, `body` y `calf`— que permiten razonar sobre el grado de avance del parto. La version recomendada por los autores es `CalvingcatcherV10.pt`, un modelo `yolo26m` de 44 MB entrenado a `imgsz=1024` durante 150 epocas sobre 18.258 imagenes. El repositorio ocupa 0,3 GB e incluye tambien las versiones V9 y V8.

Es relevante por su caracter sectorial: aplica vision por computador a un problema de bienestar animal y gestion ganadera concreto, con metricas publicadas sobre un conjunto de test estandarizado de 360 imagenes (precision del 94,8 % y recall del 54,1 % en V10). No es un modelo de lenguaje ni un modelo fundacional multimodal; es un detector de objetos especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO (familia `yolo26m`), deteccion de objetos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos `.pt` de Ultralytics; exportacion a otros formatos no documentada en la informacion disponible) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch / Ultralytics) |

Otros datos tecnicos: resolucion de entrenamiento `imgsz=1024`, tamano del fichero 44 MB, libreria `ultralytics` 8.4.14, pipeline `object-detection`, tamano del repositorio 0,3 GB.

## Arquitectura y entrenamiento

El modelo es un detector YOLO de la familia `yolo26m` en su variante media, implementado sobre Ultralytics 8.4.14. Se entreno con `imgsz=1024` durante 150 epocas (la version V10) sobre un conjunto de 18.258 imagenes de establo. El script de entrenamiento publicado por los autores emplea un `batch` de 8, paciencia de 20 epocas, `close_mosaic=10` y un pipeline de aumento de datos con rotacion de hasta 22,5 grados, escalado entre 0,5 y 1,5, volteo horizontal al 50 %, variacion de tono (0,015) y saturacion (0,7), sin variacion de brillo, y mosaic al 100 %.

La innovacion principal no esta en la arquitectura sino en el diseno del espacio de etiquetas: en lugar de una unica clase "calving", se anotan cinco etapas visuales del proceso de parto (`waterbag`, `legs`, `head`, `body`, `calf`), lo que permite a la logica externa del sistema inferir el estadio del parto. Los autores advierten que la cabeza de deteccion conserva una clase adicional procedente de un experimento antiguo que ya no usan en produccion y que debe ignorarse. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de destilacion.

## Capacidades

- Deteccion de objetos en imagenes estaticas de camaras de establo, con cajas delimitadoras y puntuaciones de confianza por clase.
- Deteccion de cinco clases especificas: `waterbag` (saco amniotico visible), `legs` (patas del ternero asomando), `head` (cabeza visible), `body` (cuerpo emergiendo) y `calf` (ternero recien nacido en el suelo).
- Inferencia sobre flujos de video en directo, incluidos streams RTSP, mediante `model.predict(source=..., stream=True)`.
- Salida compatible con el ecosistema Ultralytics: nombres de clase, confianza y coordenadas `xyxy`.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni capacidades multilingues; es exclusivamente un modelo de vision para deteccion.

## Casos de uso

- **Vigilancia nocturna de la paridera**: procesar el stream RTSP de una camara de establo y emitir una alerta cuando aparezca la clase `waterbag` o `legs`, evitando rondas presenciales cada hora durante la noche. Es el caso de uso original para el que se entreno el modelo.
- **Estimacion del estadio del parto**: al detectar secuencialmente `waterbag`, `legs`, `head`, `body` y `calf`, la logica de la aplicacion puede inferir cuanto falta para el nacimiento y priorizar la intervencion del ganadero.
- **Registro automatico de partos**: almacenar los fotogramas con detecciones y sus marcas temporales para construir un historial por animal, util para trazabilidad y para auditorias de bienestar animal.
- **Alertas de distocia**: si tras un tiempo prolongado solo se detectan `legs` o `head` sin progresion hacia `body`, el sistema puede marcar el parto como potencialmente complicado y requerir atencion veterinaria.
- **Verificacion del ternero nacido**: la clase `calf` permite confirmar automaticamente que el ternero esta en el suelo tras el parto, sin necesidad de inspeccion visual humana.
- **Despliegue en hardware de borde en la explotacion**: los pesos de 44 MB y la inferencia a `imgsz=1024` con `conf=0.40` permiten ejecutar el modelo en equipos modestos instalados en la propia granja, reduciendo la dependencia de conectividad.
- **Analitica de explotacion**: agregar estadisticas de partos por camara, franja horaria o epoca del ano para planificacion de personal y recursos.

## Benchmarks y rendimiento

Los autores publican metricas sobre un conjunto de test estandarizado de 360 imagenes, comparando generaciones del modelo:

| Version | Imagenes de entrenamiento | Precision % | Recall % | Falsos positivos totales |
|---|---|---|---|---|
| **V10** | **18.258** | **94,8** | **54,1** | **8** |
| V9 | 11.500 | 76,2 | 52,8 | 79 |
| V8 | 8.700 | 84,7 | 47,8 | 33 |
| V7 | 6.900 | 78,2 | 35,6 | 49 |

No se han publicado resultados de benchmarks estandar de deteccion (COCO mAP, etc.) en la informacion disponible. El recall del 54,1 % es bajo en comparacion con detectores de una sola clase, y los propios autores lo atribuyen a la dificultad del problema: objetos pequenos, a menudo parcialmente ocluidos, en imagenes de camaras de vigilancia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano del modelo (44 MB, familia `yolo26m`), cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas en la informacion disponible; cualquier GPU compatible con PyTorch y Ultralytics deberia poder ejecutar la inferencia a `imgsz=1024`.
- Cabe en GPU de consumo: si, dado el reducido tamano de los pesos; no se han publicado mediciones concretas por modelo de GPU.
- Opciones de despliegue: Ultralytics (Python), con soporte de ejecucion sobre imagenes o streams RTSP. No se documentan en la informacion disponible integraciones con vLLM, llama.cpp u Ollama (no aplicables a un detector de objetos).
- Latencia y throughput: no disponibles. Los autores recomiendan ejecutar siempre a `imgsz=1024` y con `conf=0.40`, advirtiendo que bajar a 640 reduce el recall de forma notable en sujetos pequenos y lejanos.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de modelos comparables de deteccion de partos en ganado vacuno. La comparacion mas cercana es interna, entre generaciones del propio modelo:

| Modelo | Base | Imagenes de entrenamiento | Precision % | Recall % | Licencia |
|---|---|---|---|---|---|
| Calvingcatcher V10 | `yolo26m` | 18.258 | 94,8 | 54,1 | AGPL-3.0 |
| Calvingcatcher V9 | `yolo26m` | 11.500 | 76,2 | 52,8 | AGPL-3.0 |
| Calvingcatcher V8 | `yolo26m` | 8.700 | 84,7 | 47,8 | AGPL-3.0 |

Comparativa con alternativas genericas no disponible.

## Limitaciones y advertencias

- **Recall moderado**: el 54,1 % de V10 implica que el modelo pierde aproximadamente la mitad de las instancias del conjunto de test; los propios autores lo reconocen como consecuencia de objetos pequenos y parcialmente ocluidos.
- **Resolucion de inferencia obligatoria**: bajar de `imgsz=1024` a 640 degrada el recall de forma perceptible; no es un modelo para ejecutar con los valores por defecto de Ultralytics sin ajustar.
- **Clase espuria en la cabeza de deteccion**: existe una clase residual de un experimento anterior que debe ignorarse; un integrador que consuma todas las clases sin filtrar obtendra detecciones no deseadas.
- **Dominio de entrenamiento restringido**: entrenado con grabaciones de establos concretos; el rendimiento puede degradarse con condiciones de iluminacion, angulos de camara, razas o instalaciones diferentes.
- **Licencia AGPL-3.0**: es una licencia copyleft fuerte; su uso en servicios en red puede obligar a liberar el codigo del servicio, lo que es un caveat relevante para integracion comercial propietaria.
- **Sin datos de sesgo publicados**: no se documentan analisis de sesgo por raza, color del pelaje o condiciones de iluminacion.
- **Riesgo de falsos negativos en produccion**: dado el recall, un sistema que dependa unicamente de este modelo para alertar de partos puede no detectar casos reales; conviene combinarlo con heuristicas temporales y supervision humana.
- **No es un modelo de lenguaje**: no admite prompts, razonamiento textual ni interaccion conversacional; cualquier logica de decision debe implementarse externamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CowcatcherAI/Calvingcatcher
- Sitio web del proyecto: https://jacobsfarm.github.io/website/
- Pagina del proyecto CalvingCatcher: https://jacobsfarm.github.io/website/projects/calvingcatcher/
- Space en Hugging Face: https://huggingface.co/spaces/CowcatcherAI/CowCatcherAI
- Repositorio GitHub CalvingCatcherAI: https://github.com/CowCatcherAI/CalvingCatcherAI
- Repositorio GitHub CowCatcherAI: https://github.com/CowCatcherAI/CowCatcherAI
- Repositorio GitHub AI-Detector: https://github.com/eschouten/ai-detector
- Canal de Telegram: https://t.me/+SphG4deaWVNkYTQ8
