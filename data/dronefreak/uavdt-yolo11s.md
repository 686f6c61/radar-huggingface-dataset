# dronefreak/uavdt-yolo11s

# dronefreak/uavdt-yolo11s

## Resumen

uavdt-yolo11s es un detector de objetos de una etapa obtenido por ajuste fino (fine-tuning) de YOLO11s, el modelo base de la familia YOLO11 de Ultralytics, sobre el conjunto de datos UAVDT (vehiculos en imagenes aereas captadas por dron). Lo publica el usuario dronefreak como parte de DetectionBench, un framework cuyo objetivo es reproducir de forma homogenea el entrenamiento y la evaluacion de detectores modernos sobre varios conjuntos de datos reales, con recetas identicas y metricas comparables. El repositorio declara 9,5 millones de parametros y 21,7 GFLOPs por imagen a 640 px, lo que lo situa en el segmento ligero de deteccion en tiempo real.

El modelo resuelve una tarea concreta: localizar y clasificar vehiculos (tres clases: car, truck y bus) en imagenes aereas de baja altitud, un escenario caracterizado por objetos pequenos, gran densidad de instancias y fuerte desequilibrio de clases. Su relevancia actual es fundamentalmente metodologica: aporta un punto de referencia reproducible dentro del zoo de modelos de DetectionBench, con la misma particion de test y la misma implementacion de evaluacion (`detectionbench-evaluate`) que el resto de checkpoints comparados.

Es importante subir las expectativas a la baja: se trata de un checkpoint recien publicado (2026-09-20), con 0 descargas y 0 likes en el momento de redactar esta ficha, metricas declaradas por el autor y no verificadas por terceros, y un rendimiento absoluto moderado (29,1 % de mAP@50 en el split de test). Ademas, la licencia AGPL-3.0 condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos CNN de una etapa, familia Ultralytics YOLO11, variante "s" (small); ajuste fino de Ultralytics/YOLO11 |
| Parametros totales | 9,5 M |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no aplica (modelo de vision; la entrada es una imagen, no una secuencia de texto) |
| Tipos de cuantizacion | no disponibles en la model card; el framework Ultralytics permite exportar a FP16 e INT8 (TensorRT, ONNX), pero no se documenta ningun artefacto cuantizado en este repositorio |
| Idiomas soportados | no aplica (modelo de vision; no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch mediante la libreria Ultralytics (`library_name: ultralytics`); no se documentan otros formatos (ONNX, TensorRT, etc.) en el repositorio |
| Tarea | object-detection |
| Clases | car, truck, bus |
| FLOPs | 21,7 GFLOPs a 640 px (dato declarado por el autor) |
| Dataset de entrenamiento | dronefreak/UAVDT |
| Tamano del repositorio | 0,0 GB (coherente con un checkpoint de ~19 MB en FP16 / ~38 MB en FP32) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLO11 en su variante "s", un detector denso de una etapa con cabeza de prediccion anclada a multiples escalas, pensado para inferencia en tiempo real. No hay en la informacion disponible innovaciones especificas declaradas para este checkpoint: se trata de un ajuste fino sobre los pesos preentrenados publicados por Ultralytics, no de un entrenamiento desde cero ni de una arquitectura modificada. El dato de coste computacional (21,7 GFLOPs por imagen a 640 px) corresponde a ese modelo base.

El modelo se entreno sobre UAVDT, un conjunto de imagenes aereas de vehiculos con tres categorias (car, truck, bus). La model card no especifica el numero de imagenes o de epochs, la composicion exacta del split de entrenamiento, las tecnicas de aumento de datos, los hiperparametros de optimizacion, la estrategia de inicializacion de pesos ni si se aplicaron tecnicas de ajuste adicionales. Tampoco procede hablar de RLHF o DPO, ya que no es un modelo de lenguaje. Lo unico documentado del protocolo es la evaluacion: las metricas se calculan sobre el split de test de UAVDT con el pipeline estandar `detectionbench-evaluate`, disenado para que todos los detectores del proyecto se midan de la misma forma.

## Capacidades

- Deteccion de objetos en imagenes aereas (UAV): devuelve cajas delimitadoras con clase y nivel de confianza.
- Clasificacion en tres categorias: car, truck y bus.
- Deteccion de objetos pequenos y de escenas con muchas instancias simultaneas, segun la orientacion declarada en las etiquetas (`small-object-detection`, `aerial-imagery`).
- Inferencia en tiempo real en GPUs de gama media y en hardware embarcado, dado el tamano del modelo (9,5 M de parametros, 21,7 GFLOPs a 640 px).
- Integracion directa en el ecosistema Ultralytics (prediccion, validacion, exportacion a otros formatos y despliegue mediante su API de Python o su CLI).
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No genera texto, codigo ni matematicas.
- No realiza tareas de vision general como captioning, VQA, segmentacion semantica, deteccion de pose o clasificacion de imagenes fuera de las tres clases entrenadas.
- No procesa audio ni modalidades distintas de la imagen.

## Casos de uso

- Monitorizacion de trafico urbano con drones: el modelo detecta y localiza vehiculos en fotogramas aereos, lo que permite construir aforos y mapas de densidad de trafico a partir de secuencias de video captadas por un UAV.
- Analitica de aforo y conteo de vehiculos: integrado en un pipeline que ejecute inferencia fotograma a fotograma, sirve para contar coches, camiones y autobuses y estimar ocupacion de vias en franjas horarias concretas.
- Vigilancia de recintos e infraestructuras: sobrevuelo de poligonos industriales, aparcamientos o recintos logisticos para detectar la presencia y el movimiento de vehiculos, con alertas cuando aparecen instancias en zonas restringidas.
- Inspeccion de carreteras y vias: deteccion de vehiculos parados o en situacion anomala en imagenes aereas de carreteras, util para tareas de mantenimiento y planificacion viaria.
- Procesamiento en el borde (edge) a bordo del dron: con 9,5 M de parametros, el checkpoint se puede exportar y ejecutar en plataformas embarcadas tipo Jetson, de modo que la deteccion ocurra a bordo sin enviar video a un servidor.
- Generacion de datos anotados de forma asistida: el modelo se puede usar como preanotador sobre nuevo metraje aereo y despues corregir las cajas manualmente, reduciendo el coste de etiquetado en proyectos de deteccion de vehiculos.
- Linea base reproducible para investigacion: al formar parte de DetectionBench, es util como referencia contra la que comparar arquitecturas nuevas manteniendo la misma receta de entrenamiento y evaluacion, especialmente en experimentos sobre objetos pequenos y desequilibrio de clases.
- Filtrado previo en pipelines de videovigilancia aerea: descartar fotogramas sin vehiculos antes de enviarlos a un modelo mas costoso, reduciendo el computo agregado del sistema.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, medidos sobre el split de **test** de UAVDT con el pipeline `detectionbench-evaluate`. Estan marcados como `verified: false`, es decir, no han sido verificados por un tercero independiente.

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 29,1 |
| mAP@50-95 | 17,16 |
| Precision | 34,32 |
| Recall | 37,31 |
| F1 | 35,75 |
| Parametros | 9,5 M |
| FLOPs | 21,7 GFLOPs (a 640 px) |

Rendimiento por clase (mAP):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| car | 69,08 | 38,97 |
| truck | 5,34 | 3,52 |
| bus | 12,89 | 8,98 |

Zoo de modelos de UAVDT publicado por el autor (mismos datos, misma receta de evaluacion; se reproduce tal cual, sin verificar):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLOv26s | 32,98 | 19,61 | 43,86 | 40,38 |
| RF-DETR Nano | 32,78 | 20,31 | 73,60 | 66,98 |
| RF-DETR Small | 32,62 | 20,21 | 73,83 | 71,63 |
| YOLOv9s | 31,82 | 18,71 | 39,83 | 38,12 |
| YOLOv8m | 31,42 | 18,80 | 40,27 | 37,79 |
| YOLOv10m | 30,12 | 17,33 | 40,13 | 35,68 |
| YOLOv9t | 29,42 | 17,03 | 35,75 | 36,47 |
| **YOLOv11s (este modelo)** | **29,10** | **17,16** | **34,32** | **37,31** |
| YOLOv26n | 28,88 | 16,79 | 33,14 | 35,66 |
| YOLOv10s | 28,85 | 16,48 | 36,53 | 33,16 |
| YOLOv11n | 28,56 | 16,30 | 38,04 | 32,26 |
| YOLOv8n | 27,80 | 15,34 | 35,42 | 33,61 |
| YOLOv10n | 27,17 | 15,16 | 33,30 | 31,21 |
| YOLOv8s | 27,12 | 15,33 | 34,65 | 31,87 |

## Requisitos de hardware

Las cifras de memoria y latencia que siguen son **estimaciones** derivadas del numero de parametros y del coste por imagen declarado; la model card no publica mediciones de consumo de VRAM ni de throughput.

- Pesos: aproximadamente 19 MB en FP16 y 38 MB en FP32 para 9,5 M de parametros.
- VRAM estimada para inferencia: por debajo de 1 GB en PyTorch con batch 1 a 640 px, contando el contexto de CUDA y las activaciones; del orden de unos cientos de MB con TensorRT en FP16 o INT8.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM sirve para inferencia. Para produccion con requisitos de latencia, RTX 3060/4070/4090, L4, T4, A10, A100 o H100 son opciones validas, aunque el modelo es lo bastante pequeno como para no necesitar GPUs de centro de datos.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna (GTX 1650 en adelante) y tambien en iGPU recientes con soporte de OpenVINO o DirectML, con latencias mayores.
- Plataformas embarcadas: es un candidato razonable para NVIDIA Jetson (Nano, Orin) por tamano y coste por imagen, aunque no hay cifras publicadas para este checkpoint concreto.
- Opciones de despliegue: la libretia base es Ultralytics (`pip install ultralytics huggingface_hub`), con exportacion a ONNX, TensorRT, OpenVINO, CoreML y TFLite. vLLM y TGI **no aplican**, ya que estan orientados a modelos de lenguaje. llama.cpp y Ollama tampoco aplican: no existe formato GGUF para este modelo.
- Latencia y throughput: no disponibles. Como orden de magnitud, un detector de 21,7 GFLOPs por imagen a 640 px suele procesar decenas o cientos de imagenes por segundo en GPUs modernas en FP16, pero no hay cifras medidas publicadas para este checkpoint.

## Comparativa con modelos similares

Comparativa dentro del propio zoo de UAVDT del autor, que es la unica fuente de datos disponible. Los parametros, la licencia y la longitud de contexto de los modelos alternativos no se detallan en la informacion proporcionada.

| Modelo | Parametros | Contexto | mAP@50 (UAVDT test) | mAP@50-95 | Precision | Recall | Licencia |
|---|---|---|---|---|---|---|---|
| uavdt-yolo11s (este modelo) | 9,5 M | no aplica | 29,10 | 17,16 | 34,32 | 37,31 | AGPL-3.0 |
| YOLOv26s | no disponible | no aplica | 32,98 | 19,61 | 43,86 | 40,38 | no disponible |
| RF-DETR Small | no disponible | no aplica | 32,62 | 20,21 | 73,83 | 71,63 | no disponible |
| RF-DETR Nano | no disponible | no aplica | 32,78 | 20,31 | 73,60 | 66,98 | no disponible |
| YOLOv9s | no disponible | no aplica | 31,82 | 18,71 | 39,83 | 38,12 | no disponible |
| YOLOv8s | no disponible | no aplica | 27,12 | 15,33 | 34,65 | 31,87 | no disponible |

Lectura de la tabla: en mAP@50, este checkpoint queda por debajo de YOLOv26s, las dos variantes de RF-DETR y YOLOv9s, y por encima de YOLOv8s. En precision y recall la distancia con RF-DETR Small es muy grande (34,32 frente a 73,83 de precision), lo que sugiere que YOLO11s necesita muchos mas ajustes de umbral o de entrenamiento para resultar util en produccion. La comparacion con modelos fuera de este zoo (por ejemplo, DETR, RT-DETR o Faster R-CNN) no esta disponible con datos de UAVDT y la misma receta.

## Limitaciones y advertencias

- Rendimiento absoluto moderado: 29,1 % de mAP@50 y 17,16 % de mAP@50-95 en el split de test. No es un modelo listo para produccion sin trabajo adicional de ajuste.
- Precision y recall bajos en terminos absolutos (34,32 % y 37,31 %): en la practica implica tanto falsas detecciones como vehiculos no detectados, con umbrales por defecto.
- Desequilibrio severo por clase: el modelo funciona de forma aceptable en `car` (69,08 % de mAP@50) pero es practicamente inutil en `truck` (5,34 %) y muy flojo en `bus` (12,89 %). Cualquier caso de uso centrado en vehiculos pesados no es viable con este checkpoint tal cual.
- Metricas no verificadas: los valores estan declarados por el autor con `verified: false` y proceden de un unico split de test. No hay validacion cruzada ni evaluacion independiente.
- Sin adopcion demostrable: 0 descargas y 0 likes en el momento de la consulta; el repositorio se creo y actualizo el 2026-09-20. No existe evidencia de uso en produccion ni informes de terceros.
- Model card incompleta: no se detallan hiperparametros, composicion del dataset, aumentos de datos, resolucion de entrenamiento ni el proceso de seleccion del checkpoint. La seccion de uso aparece truncada en la informacion disponible.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero si se ofrece el modelo como servicio en red hay que liberar el codigo fuente correspondiente bajo la misma licencia. Ultralytics comercializa una licencia empresarial alternativa para quien no pueda asumir esa obligacion.
- Sesgos del dataset no documentados: la model card no describe la procedencia geografica, las condiciones de captura, la meteorologia, la altitud ni la distribucion de clases de UAVDT. Un modelo entrenado en ese conjunto puede degradarse en entornos con condiciones distintas (otra ciudad, otra camara, otra altitud, otra iluminacion).
- Riesgo de falsos positivos: en deteccion de objetos no existe "alucinacion" en el sentido de los modelos de lenguaje, pero si detecciones espurias, especialmente con objetos pequenos y texturas que se parezcan a vehiculos.
- Limitaciones de idioma y contexto: no aplica porque el modelo no procesa texto ni secuencias; solo imagenes.
- Sin soporte multimodulo: no realiza segmentacion, seguimiento (tracking) nativo ni estimacion de profundidad. Cualquier pipeline de seguimiento de vehiculos tendria que anadir un tracker externo.
- Sin artefactos cuantizados publicados: si se necesita INT8 o TensorRT hay que generarlos a partir del checkpoint PyTorch.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/uavdt-yolo11s
- Dataset UAVDT (version del autor): https://huggingface.co/datasets/dronefreak/UAVDT
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Ultralytics/YOLO11
- Framework Ultralytics: https://github.com/ultralytics/ultralytics
- Demo en video del repositorio: https://huggingface.co/dronefreak/uavdt-yolo11s/resolve/main/assets/demo_banner.mp4
- Referencias arXiv incluidas en las etiquetas del repositorio (la model card no indica a que corresponde cada una; los titulos no estan disponibles en la informacion proporcionada):
  - arXiv:1804.00518 — https://arxiv.org/abs/1804.00518
  - arXiv:2410.17725 — https://arxiv.org/abs/2410.17725
  - arXiv:2511.09554 — https://arxiv.org/abs/2511.09554
  - arXiv:2304.07193 — https://arxiv.org/abs/2304.07193
  - arXiv:2405.14458 — https://arxiv.org/abs/2405.14458
  - arXiv:2606.03748 — https://arxiv.org/abs/2606.03748
  - arXiv:2402.13616 — https://arxiv.org/abs/2402.13616
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo. Las busquedas devolvieron unicamente paginas sin relacion con el contenido (servicios sanitarios y propiedades industriales en el Reino Unido), por lo que no se anade ningun enlace adicional.
