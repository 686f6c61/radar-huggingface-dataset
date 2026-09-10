# DePubudu/SSDMobileNet-LightVarying-ZeaMays-Seed-Detection

## Resumen

SSDMobileNet-LightVarying-ZeaMays-Seed-Detection es un modelo de deteccion de objetos publicado en HuggingFace por el usuario DePubudu, orientado a identificar semillas de maiz (Zea mays) en condiciones de iluminacion adversas o variable. El modelo parte de un checkpoint preentrenado SSD MobileNet V2 con FPN y se ha reentrenado mediante la TensorFlow Object Detection API sobre el GermPredDataset, un conjunto de datos publico alojado en Mendeley Data. El repositorio se publico el 10 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 "likes", por lo que se trata de un artefacto sin validacion comunitaria.

La propuesta de valor es acotada y muy especifica: deteccion y conteo de semillas en escenarios de baja luminosidad, un problema recurrente en vision artificial agricola cuando las capturas se realizan en camara de cultivo, invernadero o linea de clasificacion con iluminacion controlada deficiente. Al apoyarse en la familia SSD MobileNet, la arquitectura esta disenada para inferencia ligera en CPU o dispositivos de borde, lo que encaja con despliegues en maquinaria agricola o estaciones de campo sin GPU dedicada.

No se dispone de informacion sobre el numero de parametros, el volumen de tokens de entrenamiento (no aplica, es vision), la composicion exacta del dataset ni resultados de benchmarks. La model card es fundamentalmente una guia de reproduccion: indica dependencias, comandos y la ubicacion de los checkpoints entrenados, pero no documenta metricas de evaluacion ni detalles del proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SSD MobileNet V2 con FPN (TensorFlow Object Detection API) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos, no generativo) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica / no disponible (tarea de vision por computador) |
| Licencia | MIT |
| Formato de pesos | checkpoints de TensorFlow (carpeta `zeamays-model/`); no se ofrecen safetensors ni GGUF |
| Tarea (pipeline) | object-detection |
| Clases detectadas | semillas de Zea mays (una clase, segun la descripcion) |
| Tamano del repositorio | 0.0 GB (segun HuggingFace) |
| Fecha de publicacion | 2026-09-10 |
| Fecha de ultima actualizacion | 2026-09-10 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura SSD (Single Shot MultiBox Detector) con backbone MobileNet V2 y un modulo FPN (Feature Pyramid Network) para la deteccion multi-escala. SSD es un detector de una sola etapa que predice cajas delimitadoras y puntuaciones de clase directamente sobre mapas de caracteristicas de varias resoluciones, sin una etapa separada de propuesta de regiones. MobileNet V2 aporta bloques residuales invertidos con conexiones de cuello de botella, disenados para reducir el coste computacional y el numero de operaciones, mientras que el FPN mejora la deteccion de objetos de distinto tamano combinando caracteristicas de niveles profundos y superficiales. Esta combinacion es habitual en escenarios de inferencia en tiempo real sobre hardware limitado.

El entrenamiento se realizo con la TensorFlow Object Detection API partiendo de un checkpoint preentrenado SSD MobileNet V2 con FPN. El conjunto de datos utilizado es el GermPredDataset, disponible publicamente en Mendeley Data, aunque la model card no especifica el numero de imagenes, la particion train/validation/test, el numero de pasos de entrenamiento, la estrategia de aumento de datos ni los hiperparametros empleados. No se documenta ningun proceso de ajuste por refuerzo ni de optimizacion preferencial (no aplica a deteccion). La innovacion declarada por el autor es la robustez frente a condiciones de baja luminosidad, si bien no se aportan evidencias cuantitativas de mejora respecto a un modelo base.

## Capacidades

- Deteccion de objetos de una unica clase: semillas de maiz (Zea mays) en imagenes.
- Localizacion con cajas delimitadoras y puntuacion de confianza asociada, apta para tareas de conteo de semillas.
- Funcionamiento declarado en condiciones de iluminacion variable y baja luminosidad.
- Inferencia ligera gracias al backbone MobileNet V2, orientada a CPU y dispositivos de borde.
- Integracion con el ecosistema TensorFlow y con la TensorFlow Object Detection API para reentrenamiento.
- Incluye scripts de inferencia (`seed-detection.py`) y un cuaderno Jupyter (`seed-detection.ipynb`) para ejecucion paso a paso.
- Capacidad de reentrenamiento sobre datasets propios mediante la edicion del archivo `pipeline.config`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling ni capacidades de agente.

## Casos de uso

- Conteo automatico de semillas en laboratorio: el modelo detecta cada semilla sobre una superficie de fondo uniforme, lo que permite sustituir el recuento manual y reducir el error humano en ensayos de germinacion.
- Control de calidad en lineas de clasificacion: integrado en una camara industrial, permite verificar que cada lote contiene el numero esperado de semillas antes del envasado.
- Analisis de germinacion en camara de cultivo: al tolerar baja luminosidad, puede operar en condiciones de iluminacion reducidas sin necesidad de anadir focos, algo util en ensayos donde la luz afecta al desarrollo de la placa.
- Fenotipado en investigacion agronomica: extraccion de recuentos por imagen en experimentos de mejora genetica, alimentando bases de datos con metadatos de tamano y posicion de semilla.
- Despliegue en dispositivos de borde: gracias a la arquitectura SSD MobileNet V2, es viable ejecutarlo en mini-PC, Raspberry Pi con aceleracion o moviles en campo, sin GPU dedicada.
- Digitalizacion de inventario de semillas: procesado por lotes de fotografias historicas de colecciones de germoplasma para catalogar y contar material almacenado.
- Preprocesado de pipelines de vision mas amplios: las cajas generadas pueden alimentar etapas posteriores de clasificacion de variedad, estimacion de tamano o deteccion de defectos.
- Prototipado rapido y docencia: la disponibilidad de scripts y cuaderno Jupyter facilita su uso como ejemplo base para cursos de deteccion de objetos con TensorFlow.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como mAP, precision, recall, IoU medio, F1 ni comparaciones cuantitativas frente al modelo base preentrenado. Tampoco se documentan latencias de inferencia ni curvas de entrenamiento.

| Metrica | Valor |
|---|---|
| mAP (COCO o VOC) | no disponible |
| Precision / recall | no disponible |
| F1 | no disponible |
| Latencia de inferencia | no disponible |
| Comparacion con modelo base | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La familia SSD MobileNet V2 esta disenada para ser ligera y ejecutable en CPU, pero el autor no publica cifras de memoria ni de parametros.
- GPU recomendadas: no disponible. No se documentan requisitos minimos ni recomendados.
- Compatibilidad con GPU de consumo: muy probable dado el diseno del backbone MobileNet V2, pero no confirmado por el autor.
- Despliegue en CPU: viable en principio, al estar la arquitectura orientada a inferencia en dispositivos con recursos limitados.
- Opciones de despliegue: TensorFlow (SavedModel o checkpoint), TensorFlow Serving y TFLite como rutas naturales; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.
- Requisitos de software: TensorFlow, OpenCV, NumPy, Matplotlib, Jupyter y la TensorFlow Object Detection API (con compilacion de los proto mediante `protoc`).

## Comparativa con modelos similares

La informacion proporcionada no incluye resultados de evaluacion, por lo que la comparacion es exclusivamente cualitativa y a nivel de familia arquitectonica.

| Modelo | Arquitectura | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SSDMobileNet-LightVarying-ZeaMays-Seed-Detection | SSD MobileNet V2 + FPN | Deteccion de semillas de maiz con iluminacion variable | Imagenes; resolucion no disponible | MIT | HuggingFace, 0 descargas |
| SSD MobileNet V2 (checkpoint preentrenado COCO, TF Model Zoo) | SSD MobileNet V2 / V2 + FPN | Deteccion generica de 80 clases | Imagenes | Apache 2.0 (habitual en el zoo de TF) | Ampliamente disponible |
| YOLOv8n (Ultralytics) | CNN de una etapa, anchor-free | Deteccion generica | Imagenes | AGPL-3.0 / licencia comercial | Ampliamente disponible |
| EfficientDet-Lite0 (TensorFlow) | EfficientNet-Lite + BiFPN | Deteccion generica optimizada para edge | Imagenes | Apache 2.0 | Ampliamente disponible |

No se dispone de datos comparativos de rendimiento, parametros ni contexto para establecer una comparacion cuantitativa entre estas alternativas y el modelo descrito.

## Limitaciones y advertencias

- Ausencia total de metricas: no hay mAP, precision ni recall publicados, por lo que el rendimiento real del modelo es desconocido.
- Sin validacion externa: 0 descargas y 0 "likes" en HuggingFace implican que no ha sido probado por terceros.
- Posible ausencia de pesos: el repositorio aparece con un tamano de 0.0 GB, aunque la model card menciona que los checkpoints entrenados estan en `zeamays-model/`. Conviene verificar si los pesos estan realmente subidos o solo referenciados.
- Dominio muy restringido: entrenado para una unica clase (semillas de Zea mays). No es un detector de proposito general y fallara en otras especies, objetos o contextos.
- Sesgo de dataset: depende por completo del GermPredDataset; la composicion, la variedad de variedades de maiz y las condiciones de captura no estan documentadas, lo que limita la generalizacion a otras camaras, fondos o iluminaciones.
- Riesgo de falsos positivos y negativos en escenarios de oclusion, solapamiento de semillas o fondos con texturas similares; no hay datos que lo cuantifiquen.
- Riesgo de sobreajuste no verificable, al no documentarse particiones de validacion ni curvas de entrenamiento.
- Dependencia de un stack antiguo: la TensorFlow Object Detection API requiere compilacion manual de los archivos proto y tiene un mantenimiento limitado, lo que complica la reproducibilidad a medio plazo.
- Licencia MIT: permisiva y compatible con uso comercial, pero no exime de revisar la licencia del GermPredDataset, cuyo termino de uso no se detalla en la informacion disponible.
- No apto para decisiones agronomicas criticas sin validacion previa en el dominio de destino.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DePubudu/SSDMobileNet-LightVarying-ZeaMays-Seed-Detection
- Repositorio de codigo en GitHub: https://github.com/PubDe/ZeaMays-Seed-Detection-LowLight
- Dataset GermPredDataset (Mendeley Data): https://data.mendeley.com/datasets/4wkt6thgp6/2
- TensorFlow Models (Object Detection API): https://github.com/tensorflow/models
- Nota: los resultados de busqueda web devueltos para esta ficha no contienen informacion relevante sobre el modelo (corresponden a servicios de trafico vial en Alemania), por lo que no se incluyen como fuentes.
