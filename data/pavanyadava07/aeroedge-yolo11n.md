# pavanyadava07/aeroedge-yolo11n

## Resumen

AeroEdge YOLO11n es un modelo de detección de objetos especializado en imágenes aéreas, desarrollado por pavanyadava07. Se trata de un fine-tuning de YOLO11n, la variante nano de la familia YOLO11 de Ultralytics, entrenado sobre los conjuntos de datos VisDrone (imágenes UAV) y DOTA (tiles de satélite). El modelo unifica una taxonomía de 8 clases relevantes para escenarios aéreos: persona, coche, camión, autobús, furgoneta, bicicleta/moto, barco/embarcación y aeronave.

La relevancia de este modelo radica en su orientación a despliegue en el borde (edge): se distribuye en formato ONNX con cuantización INT8, lo que reduce el peso a 3,2 MB y permite inferencias a 34 FPS en CPU x86. El autor proporciona un runtime en Rust y un sistema de actualización OTA, lo que lo convierte en una opción práctica para sistemas embebidos, drones y vigilancia por satélite. La licencia AGPL-3.0 condiciona su uso comercial, y los datasets de entrenamiento tienen restricciones académicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (CNN de una sola pasada, basada en la familia YOLO11 de Ultralytics) |
| Parametros totales | no disponible (no especificado en la model card) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | FP32, INT8 (QDQ, calibracion por percentil), INT8 a resolucion 416 |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt), ONNX (.onnx) |

## Arquitectura y entrenamiento

El modelo parte de YOLO11n, una red neuronal convolucional de deteccion de objetos en una sola etapa, disenada por Ultralytics para ofrecer un equilibrio entre velocidad y precision en dispositivos con recursos limitados. Sobre esta base, el autor realizo un fine-tuning durante 50 epocas a una resolucion de entrenamiento de 960x960 píxeles, utilizando los datasets VisDrone (imagenes capturadas por UAV) y DOTA (tiles de imagenes satelitales). La taxonomia resultante agrupa las clases originales de ambos datasets en 8 categorias unificadas.

La innovacion principal del proyecto no esta en la arquitectura base, sino en el pipeline de despliegue: se exporta a ONNX con el NMS (supresion de no maximos) fuera del grafo, lo que permite un control fino del post-procesado y una integracion bit-exacta con un runtime en Rust. La cuantizacion INT8 se realiza con QDQ (Quantize-Dequantize) sobre capas Conv y MatMul, con calibracion por percentil. No se menciona el uso de RLHF, DPO u otras tecnicas de alineacion, ya que no son aplicables a un modelo de vision.

## Capacidades

- Deteccion de objetos en imagenes aereas: identifica 8 clases (persona, coche, camion, autobus, furgoneta, bicicleta/moto, barco/embarcacion y aeronave) en imagenes captadas por drones o satelites.
- Inferencia en el borde: los pesos cuantizados a INT8 ocupan solo 3,2 MB, lo que permite ejecucion en CPUs de bajo consumo y dispositivos embebidos.
- Exportacion a ONNX: compatible con ONNX Runtime, con NMS fuera del grafo para un post-procesado personalizable.
- Runtime en Rust: el repositorio incluye una implementacion en Rust que replica exactamente el pre/post-procesado de Python, facilitando su integracion en sistemas de produccion.
- Sistema OTA: se menciona un sistema de actualizacion inalambrica para flotas de dispositivos, aunque no se detalla su implementacion.
- Soporte de resoluciones multiples: se ofrecen variantes a 640x640 y 416x416, esta ultima pensada para dispositivos de gama baja (clase Pi).

## Casos de uso

- Vigilancia con drones: el modelo puede desplegarse en un dron para detectar personas, vehiculos y embarcaciones en tiempo real, con una latencia de 29,6 ms por imagen en CPU x86, lo que permite una respuesta inmediata en operaciones de busqueda y rescate o seguridad perimetral.
- Analisis de imagenes satelitales: gracias a su entrenamiento con DOTA, es util para contar vehiculos o identificar infraestructuras en tiles de satelite, por ejemplo en estudios de trafico urbano o evaluacion de danos tras desastres naturales.
- Conteo de vehiculos en aparcamientos: integrado en un sistema de camaras aereas, puede clasificar coches, camiones y autobuses para gestionar plazas de aparcamiento o control de accesos.
- Monitorizacion de trafico maritimo: la clase "barco/embarcacion" permite detectar embarcaciones en puertos o costas, util para vigilancia aduanera o control de pesca ilegal.
- Robotica aerea autonoma: el runtime en Rust y el formato ONNX facilitan la integracion en sistemas embebidos de robots aereos, permitiendo navegacion autonoma basada en deteccion de obstaculos (vehiculos, personas).
- Despliegue en dispositivos de bajo coste: la variante INT8 a 416x416 esta disenada para ejecutarse en una Raspberry Pi, habilitando prototipos de vigilancia con un presupuesto de hardware minimo.

## Benchmarks y rendimiento

La model card proporciona resultados de mAP@0.5 en el conjunto de validacion (train-val) para cada variante, junto con mediciones de latencia en CPU. Se presentan en la siguiente tabla:

| Variante | Resolucion | mAP@0.5 | Latencia (p95) | FPS |
|---|---|---|---|---|
| aeroedge_yolo11n.pt (PyTorch) | 960 | 0,688 | no disponible | no disponible |
| aero_fp32.onnx | 640 | 0,569 | no disponible | no disponible |
| aero_int8.onnx | 640 | 0,523 | 29,6 ms | 34 |
| aero_int8_416.onnx | 416 | 0,396 | no disponible | no disponible |

Las mediciones de latencia se realizaron en un AMD EPYC x86 con 8 hilos, tras 5 minutos de estabilizacion termica. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, pero el peso del modelo en INT8 es de 3,2 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso en memoria compartida de SoCs.
- GPU recomendadas: no se especifican, pero al ser un modelo nano, puede ejecutarse en GPUs consumer como RTX 3060 o inferiores, asi como en aceleradores de borde (Jetson, Coral).
- CPU: el modelo INT8 a 640 alcanza 34 FPS en un AMD EPYC x86 con 8 hilos; en CPUs ARM de gama media se espera un rendimiento menor pero util para tareas no criticas.
- Dispositivos embebidos: la variante a 416x416 esta orientada a Raspberry Pi (clase Pi), aunque no se aportan mediciones concretas.
- Opciones de despliegue: ONNX Runtime (Python y Rust), con NMS fuera del grafo. No se menciona soporte para vLLM, llama.cpp u otros motores, ya que no son aplicables a modelos de vision.
- Latencia y throughput: 29,6 ms p95 (34 FPS) para INT8@640 en CPU x86; el resto de variantes no tienen mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de deteccion aerea en la informacion proporcionada. Como referencia cualitativa, se puede comparar con el YOLO11n original de Ultralytics, que esta entrenado en COCO (80 clases) y no esta especializado en imagenes aereas. AeroEdge YOLO11n sacrifica generalidad (8 clases frente a 80) a cambio de una mayor precision en el dominio aereo y un peso mucho menor gracias a la cuantizacion INT8. Otras alternativas como YOLOv8n o RT-DETR no se mencionan en la documentacion, por lo que no se incluyen en esta comparativa.

## Limitaciones y advertencias

- Sesgos de dominio: el modelo esta entrenado exclusivamente con VisDrone y DOTA, por lo que su rendimiento puede degradarse en imagenes aereas con condiciones muy diferentes (iluminacion extrema, altitudes inusuales, sensores distintos).
- Riesgo de alucinacion: como todo detector, puede producir falsos positivos, especialmente en escenarios con oclusiones o objetos pequenos. La model card menciona "failure modes" en el repositorio, pero no se detallan en la informacion disponible.
- Limitaciones de clases: la taxonomia unificada de 8 clases puede no cubrir todos los objetos relevantes en un dominio especifico (por ejemplo, animales o infraestructuras), lo que obligaria a un reentrenamiento.
- Restricciones de licencia: la licencia AGPL-3.0 exige que cualquier obra derivada o servicio que la utilice (incluso via red) libere su codigo fuente bajo la misma licencia. Esto puede ser incompatible con proyectos comerciales cerrados.
- Datasets academicos: VisDrone y DOTA tienen restricciones de uso academico; el autor advierte de esta limitacion en la model card, por lo que su uso en produccion comercial podria requerir una evaluacion legal.
- Sin soporte de vision general: no es un modelo multimodal ni de segmentacion; solo realiza deteccion de objetos en cajas delimitadoras.
- Fecha de creacion: el modelo fue creado en septiembre de 2026, lo que podria indicar que es un proyecto reciente con poca adopcion (0 descargas y 0 likes en HuggingFace).

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/pavanyadava07/aeroedge-yolo11n
- Repositorio de codigo, pipeline, runtime Rust y sistema OTA: https://github.com/pavanyadava007/aeroedge
- Documentacion de resultados y limitaciones: https://github.com/pavanyadava007/aeroedge/blob/main/docs/results.md
- Referencia de YOLO11 de Ultralytics: https://docs.ultralytics.com/models/yolo11
- Repositorio oficial de YOLO11 en GitHub: https://github.com/ultralytics/yolo11
- Modelo YOLO11n en la plataforma de Ultralytics: https://platform.ultralytics.com/ultralytics/yolo11/yolo11n
