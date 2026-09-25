# beaunix/colcar-vision

## Resumen

ColCar Vision es un repositorio de Hugging Face que no contiene un único modelo, sino un conjunto de tres modelos de visión por computador orientados a la inspección de vehículos. Los desarrolla beaunix (Bryan David Castaño) como componente perceptivo del proyecto ColCar (Car-Inspector), un agente que asiste en inspecciones de automóviles y alimenta un motor de RAG de cumplimiento normativo (RTM colombiana) y de valoración de precios. Dos de los modelos son de segmentación de instancias basados en YOLOv11-medium y el tercero es de detección de objetos basado en YOLOv8-medium.

El primer modelo (`colcar-damage-seg`) segmenta seis tipos de daño: grieta, arañazo, abolladura, rotura de cristal, faro roto y neumático desinflado. El segundo (`colcar-parts-seg`) segmenta 21 categorías de piezas de carrocería (rueda, capó, maletero, paragolpes, puertas, cristales, luces, espejos, portón, etc.). El tercero (`colcar-tyre-defect-det`) clasifica y localiza defectos de neumático en seis clases: correcto, bulto, grietas, zonas planas, picado y pinchazo.

La relevancia de este repositorio es práctica más que arquitectónica: empaqueta modelos YOLO ya existentes, reentrenados sobre datasets públicos de Roboflow (CC BY 4.0), en un pipeline vertical de inspección vehicular, y los publica tanto en formato PyTorch (`.pt`, válido para inferencia y reentrenamiento) como en ONNX (solo inferencia). El repositorio pesa 0,2 GB en total, no tiene descargas ni "likes" registrados en el momento de la consulta y se distribuye bajo licencia AGPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN tipo YOLO (anchor-free). Dos modelos YOLOv11-medium y un modelo YOLOv8-medium. Backbone con C3k2/C2f y cabezas desacopladas de detección y máscaras |
| Parametros totales | no disponible (no se publican recuentos por modelo; los pesos se derivan de los checkpoints medium de Ultralytics) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de visión; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible. Se distribuyen pesos densos en `.pt` y `.onnx`; no se documentan variantes INT8/FP16 específicas, aunque la exportación ONNX admite cuantización posterior con las herramientas de Ultralytics |
| Idiomas soportados | no aplicable (no procesa lenguaje natural) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch / Ultralytics) y `.onnx` (ONNX Runtime, solo inferencia) |

Componentes del repositorio:

| Fichero | Tarea | Arquitectura base | Clases |
|---|---|---|---|
| `colcar-damage-seg.{pt,onnx}` | Segmentación de instancias | YOLOv11-medium | 6 (crack, scratch, dent, glass_shatter, lamp_broken, tire_flat) |
| `colcar-parts-seg.{pt,onnx}` | Segmentación de instancias | YOLOv11-medium | 21 (wheel, hood, trunk, bumpers, doors, glass, lights, mirrors, tailgate, etc.) |
| `colcar-tyre-defect-det.{pt,onnx}` | Detección de objetos | YOLOv8-medium | 6 (Good, Bulge, Cracks, Flat spots, Pitting, Puncture) |

## Arquitectura y entrenamiento

Los tres modelos son redes convolucionales de la familia YOLO, una arquitectura de detección en una sola pasada que predice cajas delimitadoras y clases directamente sobre una rejilla de características, sin etapa de propuesta de regiones. Los dos modelos de segmentación emplean la variante de instancias de YOLOv11-medium, que añade una rama de predicción de máscaras por prototipos además de la cabeza de detección; el modelo de neumáticos utiliza YOLOv8-medium en su configuración de detección pura. No se especifican en la información disponible el número de épocas, el tamaño de imagen de entrada, el presupuesto de aumentación ni los hiperparámetros de entrenamiento.

El entrenamiento se realizó por ajuste fino de los checkpoints de Ultralytics sobre tres datasets públicos alojados en Roboflow Universe, todos bajo licencia CC BY 4.0: Car-Damage-Type-Detection-End-Game (daños), car-seg de Gianmarco Russo, que corresponde al dataset carparts-seg documentado por Ultralytics (piezas), y Tyre defect detection (neumáticos). No se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias, algo que no aplica a modelos discriminativos de visión. La innovación destacable es de integración, no algorítmica: los tres modelos se encadenan para producir una descripción estructurada del estado del vehículo que consume un motor de cumplimiento normativo y de tasación.

## Capacidades

- Detección y segmentación de daños de carrocería en seis categorías: grietas, arañazos, abolladuras, rotura de cristal, rotura de faro y neumático desinflado.
- Segmentación de 21 categorías de piezas y paneles del vehículo, con máscara por instancia para cada pieza.
- Detección y clasificación de defectos de neumático en seis clases, incluida la clase "Good" para neumáticos sin defecto.
- Salida de cajas delimitadoras, máscaras de instancia y puntuaciones de confianza por clase.
- Exportación a ONNX para inferencia en entornos sin PyTorch.
- Reentrenamiento y ajuste fino desde los pesos `.pt` mediante la librería Ultralytics.
- No soporta tool calling, function calling ni razonamiento multi-paso: son modelos perceptivos, no agentes.
- No tiene capacidades multilingües, de generación de texto, de audio ni de razonamiento simbólico.
- No dispone de modo "thinking" ni de cadena de razonamiento; la única salida es geométrica y categórica.

## Casos de uso

- Inspección técnica de vehículos (RTM): los tres modelos se ejecutan sobre las fotografías de la revisión para generar un informe estructurado de daños, piezas afectadas y estado de neumáticos que alimenta el motor de reglas de cumplimiento normativo colombiano.
- Peritaje para aseguradoras: `colcar-damage-seg` localiza y clasifica daños con máscaras, lo que permite estimar la extensión superficial de cada desperfecto y priorizar la revisión humana en los casos dudosos.
- Tasación automática y motor de precios: la combinación de piezas segmentadas y daños detectados permite calcular una estimación de reparación por pieza afectada, integrable en un pipeline de valoración de vehículos usados.
- Pre-inspección en alquiler y car sharing: `colcar-parts-seg` y `colcar-damage-seg` documentan el estado del vehículo en la entrega y la devolución, generando evidencia fotográfica con las zonas dañadas marcadas.
- Mantenimiento predictivo de flotas: `colcar-tyre-defect-det` permite revisar neumáticos de forma sistemática a partir de fotografías de los conductores, detectando bultos, grietas, zonas planas y pinchazos antes de que provoquen una incidencia en carretera.
- Catálogo y comercio de recambios: la segmentación de piezas facilita el reconocimiento automático del componente en una foto del usuario y su enlace al recambio correspondiente en un catálogo.
- Generación de datasets etiquetados: los pesos `.pt` permiten preanotar nuevas imágenes y acelerar el etiquetado humano en pipelines de datos propios.
- Despliegue en aplicaciones móviles o de borde: la exportación ONNX y el reducido tamaño de los pesos hacen viable la inferencia local sin enviar fotografías del vehículo a un servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de validación (mAP, máscara mAP, precisión, recall ni matrices de confusión) para ninguno de los tres modelos, ni comparaciones con los checkpoints originales de Ultralytics sobre los mismos datasets.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo YOLO de gama medium suele ejecutarse con menos de 1 GB de VRAM en FP16 a resoluciones habituales de 640 píxeles, más el consumo del runtime; el repositorio completo ocupa 0,2 GB en disco (seis ficheros de pesos entre `.pt` y `.onnx`).
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; una NVIDIA T4, RTX 3060 o superior ofrece margen holgado. Para procesamiento por lotes en servidor, A100 o H100 aportan ventaja de throughput, no de viabilidad.
- Cabe en GPU de consumo: sí. Con estos tamaños, cualquier GPU consumer con al menos 4 GB de VRAM puede ejecutar los tres modelos de forma secuencial, e incluso la CPU es viable para inferencia puntual con ONNX.
- Opciones de despliegue: ONNX Runtime (solo inferencia, formato documentado por el autor), Ultralytics con PyTorch (inferencia y reentrenamiento), exportación a TensorRT o OpenVINO mediante las utilidades de Ultralytics, y servidores de inferencia genéricos compatibles con ONNX.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por imagen ni de imágenes por segundo para ninguna de las configuraciones de hardware.

## Comparativa con modelos similares

Los datos de rendimiento de ColCar Vision no están publicados, por lo que la comparación se limita a aspectos estructurales y de disponibilidad.

| Modelo | Tarea | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ColCar Vision (conjunto) | Detección y segmentación de daños, piezas y neumáticos | YOLOv11m / YOLOv8m | no disponible | no aplicable | AGPL-3.0 | Hugging Face, `.pt` y `.onnx` |
| Ultralytics YOLO11 (checkpoints oficiales) | Detección, segmentación, pose, OBB, clasificación | YOLOv11 en varios tamaños | publicado por Ultralytics para cada variante | no aplicable | AGPL-3.0 (o Enterprise) | GitHub, documentación y pesos oficiales |
| Ultralytics YOLOv8 (checkpoints oficiales) | Detección, segmentación, pose, OBB, clasificación | YOLOv8 en varios tamaños | publicado por Ultralytics para cada variante | no aplicable | AGPL-3.0 (o Enterprise) | GitHub, documentación y pesos oficiales |
| RT-DETR | Detección de objetos | Transformer (DETR en tiempo real) | varía según variante | no aplicable | Apache-2.0 en varias implementaciones | Repositorios públicos y pesos preentrenados |
| Mask R-CNN | Detección y segmentación de instancias | CNN de dos etapas con FPN | varía según backbone | no aplicable | depende de la implementación (a menudo Apache-2.0 o MIT) | Detectron2, MMDetection, torchvision |

La diferencia relevante frente a los checkpoints oficiales de Ultralytics no es de arquitectura ni de rendimiento, sino de especialización: ColCar Vision está ajustado a dominios concretos (daños de carrocería, piezas de vehículo y defectos de neumático) mediante datasets de Roboflow, mientras que los modelos base son de propósito general con 80 clases COCO. No hay datos publicados que permitan afirmar qué conjunto rinde mejor en estas tareas específicas.

## Limitaciones y advertencias

- Ausencia total de métricas: no hay mAP, precisión, recall ni matrices de confusión publicadas, por lo que no es posible evaluar la calidad real de los tres modelos antes de desplegarlos.
- Sesgo de dominio: los datasets de entrenamiento son de Roboflow Universe y no se documenta su composición demográfica, geográfica ni las condiciones de captura; el rendimiento puede degradarse con vehículos, iluminación o ángulos distintos a los del conjunto de entrenamiento.
- Riesgo de falsos positivos y falsos negativos: en inspecciones con consecuencias económicas o normativas, cualquier error de detección debe filtrarse con revisión humana; no se documentan umbrales de confianza recomendados.
- Cobertura de clases limitada: los daños se reducen a seis categorías y los defectos de neumático a seis, lo que deja fuera numerosos tipos de desperfecto relevantes en un peritaje real.
- Dependencia de la calidad de la imagen: al ser modelos de visión puros, no hay mecanismo de razonamiento que compense fotografías borrosas, con oclusiones o con reflejos.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso del modelo en un servicio accesible por red obliga, según la interpretación habitual de la AGPL, a ofrecer el código fuente correspondiente a los usuarios del servicio. Para uso comercial cerrado sería necesaria una licencia alternativa, y el autor indica explícitamente que no se adquirió licencia Enterprise de Ultralytics.
- Atribución de datos: los datasets de entrenamiento son CC BY 4.0, lo que exige mantener la atribución a sus autores originales (Landebeau7 y Gianmarco Russo en Roboflow Universe) en cualquier redistribución o trabajo derivado.
- Repositorio sin tracción: cero descargas y cero "likes" en el momento de la consulta, sin historial de uso que permita inferir fiabilidad en producción.
- Idiomas no aplicables: al no procesar texto, no existen capacidades multilingües, pero tampoco se documenta si las etiquetas de clase están solo en inglés, lo que afecta a la integración con interfaces en castellano.
- Fecha de creación registrada en 2026-09-25, con actualización el mismo día; no hay historial posterior de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beaunix/colcar-vision
- Perfil del autor: https://huggingface.co/beaunix
- Repositorio del proyecto ColCar: https://github.com/BeauBryanDev/colcar
- Dataset de daños (Car-Damage-Type-Detection-End-Game, Roboflow Universe): https://universe.roboflow.com/landebeau7/car-damage-type-detection-end-game-ranzq
- Dataset de piezas (car-seg, Roboflow Universe): https://universe.roboflow.com/gianmarco-russo-vt9xr/car-seg-un1pm
- Documentación del dataset carparts-seg en Ultralytics: https://docs.ultralytics.com/datasets/segment/carparts-seg
- Dataset de neumáticos (Tyre defect detection, Roboflow Universe): https://universe.roboflow.com/landebeau7/tyre-defect-detection-ewz6t
- Repositorio de Ultralytics YOLO: https://github.com/ultralytics/ultralytics
