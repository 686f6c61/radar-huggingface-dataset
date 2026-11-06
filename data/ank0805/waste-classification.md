# Ank0805/waste-classification

## Resumen

YOLO11n Granular Waste Material Classifier es un modelo de deteccion de objetos basado en la arquitectura YOLO11 nano de Ultralytics, desarrollado por el usuario Ank0805 y publicado en Hugging Face bajo licencia MIT. Su proposito es la clasificacion y localizacion espacial de residuos solidos urbanos en 42 categorias materiales discretas, distinguiendo entre polimeros, fibras celulosicas, metales ferrosos y no ferrosos, vidrio mineral y envases compuestos.

El modelo opera a una resolucion nativa de 640x640 pixeles con 2,59 millones de parametros y 6,5 GFLOPs, lo que lo situa en el segmento de modelos ultraligeros disenados para inferencia en dispositivos edge y sistemas roboticos de clasificacion. La granularidad taxonomica de 42 clases va mas alla de las categorias genericas habituales (plastico, papel, vidrio, metal) y desglosa materiales especificos como PET, HDPE, LDPE, LLDPE, polipropileno, aluminio, hojalata, ceramica o tetra pack.

La relevancia actual del modelo radica en su aplicacion potencial a la economia circular: analisis de recogida municipal, inspeccion de cintas transportadoras de alta velocidad y robotica de triaje automatizado. No obstante, la informacion publicada es limitada: no se documentan datos de entrenamiento, resultados de benchmarks ni detalles del proceso de anotacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO11n (cabecera de deteccion anchor-free desacoplada, C3k2, SPPF, C2PSA) |
| Parametros totales | 2.590.425 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 640x640x3 RGB) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt, Ultralytics) |
| GFLOPs | 6,5 |
| Tarea | Deteccion de objetos 2D con clasificacion multiclase |
| Clases | 42 categorias materiales |
| Framework | PyTorch / Ultralytics |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO11n de Ultralytics, una red de deteccion de una sola etapa con cabecera anchor-free desacoplada. Incorpora los bloques C3k2 (modulo de convolucion con conexiones residuales), SPPF (Spatial Pyramid Pooling - Fast) y C2PSA (modulo de atencion espacial parcial). La entrada es una imagen RGB de 640x640 pixeles y la salida son cajas delimitadoras con clase y confianza para cada una de las 42 categorias materiales definidas en la taxonomia.

No se dispone de informacion sobre el dataset de entrenamiento: no se documenta el numero de imagenes, la composicion del conjunto, la procedencia de las anotaciones ni si se aplicaron tecnicas de aumento de datos, destilacion o ajuste fino desde pesos preentrenados en COCO. Tampoco se indican procesos de RLHF, DPO ni tecnicas de decodificacion especulativa, que no aplican a un modelo de deteccion visual. La unica innovacion tecnica destacable es la propia taxonomia de 42 clases, que desglosa materiales a un nivel de granularidad poco habitual en modelos de clasificacion de residuos.

## Capacidades

- Deteccion de objetos 2D con cajas delimitadoras y clasificacion en 42 categorias materiales.
- Distincion granular entre polimeros (PET, HDPE, LDPE, LLDPE, PP, PS, ABS, PVC), fibras celulosicas (papel, carton, celulosa, papier mache), metales (aluminio, hojalata, hierro, chatarra, virutas metalicas), vidrio, ceramica, textil, madera y residuos organicos.
- Identificacion de envases compuestos y multicapa (tetra pack, plastico combinado, embalaje postal).
- Localizacion espacial de residuos en imagenes, apta para robotica de recogida.
- Inferencia en CPU o GPU mediante la libreria Ultralytics.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, al ser un modelo puramente visual.

## Casos de uso

- Triaje robotico en plantas de reciclaje: el modelo detecta y localiza cada residuo en la cinta transportadora con cajas delimitadoras que pueden enviarse a un brazo robotico para su separacion por material especifico (PET, HDPE, aluminio, vidrio), gracias a su resolucion de 640x640 y su bajo coste computacional de 6,5 GFLOPs.
- Inspeccion de cintas transportadoras de alta velocidad: con 2,59 millones de parametros, el modelo puede ejecutarse a alta frecuencia de fotogramas en GPU de gama media o en dispositivos edge, permitiendo analisis en tiempo real del flujo de residuos.
- Analisis de recogida municipal: procesamiento de imagenes de contenedores o vertederos para caracterizar la composicion de residuos por categoria material y generar estadisticas de reciclaje.
- Clasificacion en dispositivos edge y embebidos: su tamano reducido permite desplegarlo en camaras inteligentes, drones o dispositivos IoT con recursos limitados para monitorizacion ambiental in situ.
- Educacion y concienciacion ambiental: aplicaciones moviles o web que identifiquen el tipo de residuo a partir de una fotografia y guien al usuario sobre el contenedor adecuado.
- Auditoria de calidad de flujos de reciclaje: deteccion de contaminantes (plasticos combinados, residuos organicos en flujos de papel) en plantas de tratamiento para control de calidad.
- Investigacion en vision artificial aplicada a residuos: modelo base para experimentos de deteccion granular de materiales, con licencia MIT que facilita su uso academico y comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 para un modelo de 2,59 millones de parametros; en la practica, el consumo depende del tamano de lote y de la resolucion de entrada (640x640).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA, incluidas GTX 1650, RTX 3050, RTX 4090, A100 o H100; el modelo es lo suficientemente pequeno como para no requerir GPU de datacenter.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: Ultralytics (Python API), exportacion a ONNX, TensorRT, OpenVINO o TFLite mediante las utilidades de Ultralytics; tambien es posible la ejecucion en CPU con PyTorch.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen del hardware y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Clases | Contexto/Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO11n Waste Classifier (este modelo) | 2,59 M | 42 | 640x640 | MIT | Hugging Face |
| YOLOv8n (COCO) | 3,2 M | 80 (genericas) | 640x640 | AGPL-3.0 | Ultralytics |
| YOLO11n (COCO) | 2,6 M | 80 (genericas) | 640x640 | AGPL-3.0 | Ultralytics |
| Modelos de clasificacion de residuos genericos | no disponible | 4-6 (plastico, papel, vidrio, metal) | variable | variable | variable |

La comparativa con modelos especificos de clasificacion de residuos no esta disponible en la informacion proporcionada. Frente a los modelos YOLO genericos, la ventaja de este modelo es su taxonomia de 42 clases especificas de materiales, aunque no se han publicado metricas que permitan comparar su precision.

## Limitaciones y advertencias

- No se documentan datos de entrenamiento, composicion del dataset ni proceso de anotacion, lo que impide evaluar la representatividad y el sesgo del modelo.
- No se han publicado resultados de benchmarks (mAP, precision, recall) en la informacion disponible; no es posible verificar su rendimiento real.
- Riesgo de alucinacion o falsos positivos inherente a los modelos de deteccion: puede clasificar erroneamente materiales visualmente similares (por ejemplo, distintos tipos de plastico o metal).
- El modelo no tiene capacidades linguisticas ni de razonamiento; cualquier aplicacion que requiera texto debe combinarse con otro modelo.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en dominios distintos al de entrenamiento.
- El repositorio tiene un tamano de 0.0 GB y solo 33 descargas, lo que sugiere escasa validacion por parte de la comunidad; conviene verificar la integridad de los pesos antes de usarlo en produccion.
- El nombre del archivo de pesos indicado en la model card ("waste classification modle.pt") contiene una errata; debe confirmarse el nombre exacto en el repositorio.
- No se especifican limitaciones de contexto ni de idioma porque el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ank0805/waste-classification
- Ultralytics (framework): https://github.com/ultralytics/ultralytics
- Documentacion de Ultralytics YOLO11: https://docs.ultralytics.com/models/yolo11/
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios adicionales ni demos.
