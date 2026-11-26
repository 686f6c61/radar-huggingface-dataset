# MirilAI/WALDO40-YOLOv26

## Resumen

WALDO 4.0 · YOLOv26 es una familia de detectores de objetos desarrollada por MirilAI, especializada en imagenes aereas captadas desde drones, aeronaves o satelites. El modelo detecta doce clases de objetos relevantes en escenarios de observacion aerea: vehiculos ligeros, personas, bicicletas, autobuses, camiones, embarcaciones, edificios, postes de servicios, contenedores de carga, tanques de almacenamiento, excavadoras y paneles solares. Se distribuye en cuatro tamanos (N, S, M y L) con 2,4 M, 9,4 M, 26,0 M y 54,7 M de parametros respectivamente.

La propuesta tecnica se centra en la deteccion de objetos pequenos en imagenes de alta resolucion. Un dron tipico captura fotogramas de 5472 x 3648 pixeles, y comprimirlos a una unica vista de 640 px hace desaparecer la mayoria de los objetos pequenos. WALDO 4.0 aborda esto mediante un diseno sin etapa NMS (la red selecciona sus propias cajas finales) y un entrenamiento desde cero orientado a objetos de hasta 32 px. La familia se ofrece como checkpoint propio, checkpoint compatible con Ultralytics y exportacion ONNX, todo bajo licencia MIT.

El modelo es relevante para desarrolladores e investigadores que trabajan en teledeteccion, vision por computador aplicada a drones y pipelines de analisis de imagenes aereas, especialmente cuando necesitan inferencia rapida en lote y despliegue sin dependencias de licencias restrictivas. La version M iguala en mAP50-95 a la L con menos de la mitad del computo, y la S supera en velocidad y precision a la generacion anterior YOLOv8 de MirilAI en el mismo tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv26 (familia YOLO, deteccion de objetos sin NMS) |
| Parametros totales | N: 2,4 M; S: 9,4 M; M: 26,0 M; L: 54,7 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision, entrada de imagen) |
| Tipos de cuantizacion | No disponible (se distribuyen pesos FP32/FP16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | No aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt propio y .pt Ultralytics) y ONNX (.onnx) |

## Arquitectura y entrenamiento

WALDO 4.0 · YOLOv26 es una red de deteccion de objetos de la familia YOLO, en su variante YOLOv26, entrenada desde cero con un harness de entrenamiento propio de MirilAI. La innovacion principal es la eliminacion de la etapa de supresion de no maximos (NMS): la red selecciona directamente sus cajas finales, lo que simplifica el pipeline de inferencia y reduce latencia en produccion. La arquitectura incorpora un nivel de deteccion P2 (indicado por el sufijo `p2` en los nombres de checkpoint), orientado a capturar objetos de hasta 32 px, lo cual es critico en imagenes aereas de alta resolucion.

El entrenamiento se realizo desde pesos aleatorios, sin partir de pesos preentrenados. Esto explica, segun el autor, que los modelos YOLOv8 de la generacion anterior (entrenados desde pesos preentrenados) obtengan entre 0,009 y 0,028 puntos mas de mAP50-95 en el mismo tamano. Los YOLOv26 compensan esa diferencia con un coste computacional del 54 % al 73 % respecto a los YOLOv8 equivalentes y una mayor velocidad en lote. La validacion se realizo sobre un conjunto congelado de 710 imagenes del benchmark WALDO 4.0, con un unico scorer para todos los modelos. El autor indica que WALDO 4.1 entrenara estas mismas redes desde pesos preentrenados propios.

## Capacidades

- Deteccion de objetos en imagenes aereas de dron, aeronave y satelite en doce clases: vehiculos ligeros, personas, bicicletas, autobuses, camiones, embarcaciones, edificios, postes de servicios, contenedores de carga, tanques de almacenamiento, excavadoras y paneles solares.
- Deteccion de objetos pequenos, con soporte especifico para objetos de hasta 32 px (nivel P2 y metrica AP small).
- Inferencia sin NMS: la red produce directamente las cajas finales, eliminando el postprocesado de supresion de no maximos.
- Compatibilidad con el ecosistema Ultralytics mediante checkpoints `.pt` estandar.
- Exportacion a ONNX para despliegue en runtimes multiplataforma.
- Cuatro tamanos intercambiables (N, S, M, L) para ajustar precision, velocidad y coste computacional.
- Funcionamiento con recorte por teselas (SAHI) para imagenes de muy alta resolucion.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente de vision.

## Casos de uso

- Monitorizacion de infraestructura energetica: deteccion de paneles solares, tanques de almacenamiento y postes de servicios en imagenes satelitales o de dron para inventariado y mantenimiento predictivo. El tamano M ofrece un equilibrio adecuado entre precision (mAP50-95 de 0,519) y coste (69,2 GFLOPs).
- Gestion de trafico y aparcamiento: conteo y localizacion de vehiculos ligeros, autobuses y camiones en imagenes aereas de carreteras y zonas urbanas. La ausencia de NMS simplifica el pipeline y reduce latencia en procesamiento por lotes.
- Seguridad en operaciones con drones: verificacion de zonas de aterrizaje mediante deteccion de personas, vehiculos y postes antes del descenso, tal como se ilustra en la model card. El modelo senala ubicaciones; la decision final recae en el operador.
- Logistica portuaria: deteccion de embarcaciones y contenedores de carga en imagenes de puertos y terminales, con capacidad de contar cientos de objetos en un solo fotograma.
- Seguimiento de obras y construccion: identificacion de excavadoras y maquinaria en imagenes aereas para monitorizar el avance de proyectos. El tamano L, con AP small de 0,468, es el mas adecuado para objetos pequenos en fotogramas de gran resolucion.
- Analisis de movilidad urbana: deteccion de bicicletas y personas en imagenes de ciudad para estudios de flujo y planificacion. El tamano S, con 1,18 ms por imagen en A100, permite procesar grandes volumenes en lote.
- Procesamiento de imagenes de muy alta resolucion con SAHI: recorte de fotogramas de 5472 x 3648 px en teselas de 640 px para recuperar objetos pequenos que se perderian en una unica vista reducida.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT permite uso comercial sin restricciones, integracion en productos propietarios y modificacion del modelo.

## Benchmarks y rendimiento

Resultados sobre el conjunto de validacion congelado de WALDO 4.0 (710 imagenes), con un unico scorer para todos los modelos. Tiempos medidos en A100, FP16, lote de 32, en caliente (modelo cargado, sin arranque), incluyendo seleccion de cajas; mediana de 200 ejecuciones cronometradas tras 30 no cronometradas.

| Metrica | N | S | M | L |
|---|---:|---:|---:|---:|
| mAP50-95 | 0,437 | 0,482 | 0,519 | 0,518 |
| AP small (<= 32 px) | 0,371 | 0,414 | 0,455 | 0,468 |
| GFLOPs a 640 px | 6,6 | 24,4 | 69,2 | 148,8 |
| Parametros | 2,4 M | 9,4 M | 26,0 M | 54,7 M |
| A100 ms/imagen (caliente) | 0,70 | 1,18 | 2,23 | 3,45 |
| YOLOv8 MirilAI mismo tamano, ms | 1,32 | 1,71 | 2,53 | 3,54 |

Comparacion con la generacion anterior YOLOv8 de MirilAI en el mismo tamano: los YOLOv8 obtienen entre 0,009 y 0,028 puntos mas de mAP50-95, pero los YOLOv26 logran resultados cercanos con un 54 %-73 % del computo y mayor velocidad en lote. La S de YOLOv26 (1,18 ms, mAP50-95 de 0,482) supera a la YOLOv8-N en velocidad (1,32 ms) y precision (0,445).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Por tamano de parametros, el modelo N (2,4 M) requiere muy poca memoria; el L (54,7 M) es manejable en cualquier GPU consumer moderna.
- GPU recomendadas: A100 para maximizar throughput en lote (referencia de los benchmarks publicados); H100 para mayor capacidad; RTX 4090 y GPUs consumer de gama media-alta para inferencia individual o lotes pequenos.
- Cabe en GPU consumer: si, todos los tamanos. Los 54,7 M de parametros del L suponen un peso en FP32 de aproximadamente 219 MB, muy por debajo de la VRAM de cualquier GPU consumer actual.
- Opciones de despliegue: PyTorch nativo, Ultralytics (checkpoints `.pt` estandar), ONNX Runtime para los modelos exportados, y SAHI para inferencia por teselas en imagenes de alta resolucion.
- Latencia y throughput: en A100, FP16, lote 32, los tiempos por imagen son 0,70 ms (N), 1,18 ms (S), 2,23 ms (M) y 3,45 ms (L). No se publican datos de latencia en otras GPUs ni de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | mAP50-95 | AP small | GFLOPs | Licencia | Formatos |
|---|---:|---:|---:|---:|---|---|
| WALDO40-YOLOv26 N | 2,4 M | 0,437 | 0,371 | 6,6 | MIT | .pt, .onnx |
| WALDO40-YOLOv26 S | 9,4 M | 0,482 | 0,414 | 24,4 | MIT | .pt, .onnx |
| WALDO40-YOLOv26 M | 26,0 M | 0,519 | 0,455 | 69,2 | MIT | .pt, .onnx |
| WALDO40-YOLOv26 L | 54,7 M | 0,518 | 0,468 | 148,8 | MIT | .pt, .onnx |
| WALDO40-YOLOv8 (generacion anterior, mismo tamano) | No disponible por tamano en la informacion | 0,009-0,028 puntos superior segun tamano | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada no incluye datos de modelos de terceros comparables (por ejemplo, YOLOv8 estandar de Ultralytics, YOLOv9, YOLOv10 u otros detectores especializados en imagenes aereas). La unica comparativa directa disponible es contra la generacion anterior YOLOv8 de MirilAI.

## Limitaciones y advertencias

- Entrenado desde cero, sin pesos preentrenados: en el mismo tamano, los YOLOv8 de MirilAI obtienen entre 0,009 y 0,028 puntos mas de mAP50-95. El autor indica que WALDO 4.1 corregira esto con pesos preentrenados propios.
- El conjunto de validacion es de 710 imagenes; no se publican resultados en benchmarks externos independientes (COCO, VisDrone, DOTA u otros), lo que limita la comparabilidad con terceros.
- Especializado en doce clases de imagenes aereas; no es un detector de proposito general y no cubre clases fuera de ese conjunto.
- Riesgo de falsos negativos en objetos muy pequenos si se usa una unica vista de 640 px sobre imagenes de alta resolucion; se recomienda SAHI para fotogramas grandes.
- No se documentan sesgos especificos del dataset de entrenamiento, composicion del mismo ni cobertura geografica o de condiciones de iluminacion.
- No dispone de capacidades linguisticas, tool calling ni agentes; su uso se limita a deteccion de objetos.
- La licencia MIT permite uso comercial sin restricciones, pero no se ofrece garantia alguna sobre el rendimiento en dominios distintos al de entrenamiento.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MirilAI/WALDO40-YOLOv26
- Generacion anterior YOLOv8 de MirilAI: https://huggingface.co/MirilAI/WALDO40-YOLOv8
- SAHI (Slicing Aided Hyper Inference): https://github.com/obss/sahi
- Checkpoints Ultralytics (N): https://huggingface.co/MirilAI/WALDO40-YOLOv26/resolve/main/ultralytics/waldo40-c10-yolov26n-p2-obnubilated.pt
- Checkpoints Ultralytics (S): https://huggingface.co/MirilAI/WALDO40-YOLOv26/resolve/main/ultralytics/waldo40-c10-yolov26s-p2-obnubilated.pt
- Checkpoints Ultralytics (M): https://huggingface.co/MirilAI/WALDO40-YOLOv26/resolve/main/ultralytics/waldo40-c10-yolov26m-p2-obnubilated.pt
- Checkpoints Ultralytics (L): https://huggingface.co/MirilAI/WALDO40-YOLOv26/resolve/main/ultralytics/waldo40-c10-yolov26l-p2-obnubilated.pt
- Exportaciones ONNX (N): https://huggingface.co/MirilAI/WALDO40-YOLOv26/resolve/main/onnx/waldo40-c10-yolov26n-p2-obnubilated.onnx
- Exportaciones ONNX (S): https://huggingface.co/MirilAI/WALDO40-YOLOv26/resolve/main/onnx/waldo40-c10-yolov26s-p2-obnubilated.onnx
- Exportaciones ONNX (M): https://huggingface.co/MirilAI/WALDO40-YOLOv26/resolve/main/onnx/waldo40-c10-yolov26m-p2-obnubilated.onnx
- Exportaciones ONNX (L): https://huggingface.co/MirilAI/WALDO40-YOLOv26/resolve/main/onnx/waldo40-c10-yolov26l-p2-obnubilated.onnx
