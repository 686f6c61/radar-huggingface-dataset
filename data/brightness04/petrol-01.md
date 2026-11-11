# brightness04/petrol-01

## Resumen

`brightness04/petrol-01` es un modelo de deteccion de objetos empaquetado para la subnet 44 (SN44, tambien conocida como TurboVision) de Bittensor. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un detector ONNX especializado en reconocer elementos de estaciones de servicio (surtidores, mangueras, marquesinas y paneles de precios) entrenado por el autor `manak0` bajo el identificador `manak0/Detect-petrol-station-1-0`. El repositorio de `brightness04` actua como envoltorio de minero: incluye el detector exportado a ONNX, un script `miner.py` con la logica de inferencia y un fichero de configuracion con clases y umbrales.

El modelo se distribuye exclusivamente en formato ONNX, con un unico fichero de pesos de 9,31 MiB, lo que lo situa en la gama de detectores ligeros. Trabaja con entradas de 736x736 pixeles y devuelve cajas delimitadoras con clase y confianza para cuatro categorias: `petrol pump`, `petrol hose`, `roof canopy` y `price board`. La inferencia se ejecuta con onnxruntime, usando CUDA si esta disponible y CPU con dos hilos intra-op en caso contrario, con preprocesado tipo letterbox y supresion no maxima implementada en numpy.

Su relevancia es acotada y muy especifica: sirve como implementacion de referencia para participantes del track publico de la subnet 44 de Bittensor que necesiten desplegar un minero de vision por computador con un detector preentrenado. No hay informacion publica sobre el proceso de entrenamiento, el dataset original ni metricas de rendimiento, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos exportado a ONNX; no se especifica la familia) |
| Parametros totales | no disponible (pesos ONNX de 9,31 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija de 736x736) |
| Tipos de cuantizacion | no disponible (solo se distribuye el ONNX tal cual) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`model.onnx`, sha256 `d1507104619fa2af`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del detector. El repositorio solo indica que el modelo se exporta a ONNX y que se ejecuta mediante onnxruntime, con entrada de 736x736 pixeles en formato BGR tras un preprocesado de letterbox. El pipeline de inferencia incluye supresion no maxima en numpy con IoU 0,45 y un maximo de 100 detecciones por imagen. No se especifica si el detector subyacente es una familia YOLO, RT-DETR, Faster R-CNN u otra, ni se documentan capas, cabezas de prediccion o mecanismos de atencion.

Tampoco hay datos sobre el entrenamiento: no se indica el numero de imagenes, la composicion del dataset, si hubo aumento de datos, ni si se aplicaron tecnicas de destilacion o ajuste fino. El unico dato operativo relevante es el conjunto de umbrales de confianza por clase configurados en `miner_config.json`: 0,25 global, 0,32 para `petrol pump`, 0,4 para `petrol hose`, 0,35 para `price board` y 0,4 para `roof canopy`. Estos umbrales sugieren un ajuste manual orientado a reducir falsos positivos en las clases mas ambiguas.

## Capacidades

- Deteccion de objetos en imagenes BGR con cuatro clases: surtidor (`petrol pump`), manguera (`petrol hose`), marquesina (`roof canopy`) y panel de precios (`price board`).
- Procesamiento por lotes mediante `predict_batch(batch_images, offset, n_keypoints)`, que devuelve por fotograma `frame_id`, lista de cajas con `x1, y1, x2, y2, cls_id, conf`, lista de poligonos (vacia en esta implementacion) y keypoints.
- Ejecucion en GPU via onnxruntime con CUDA cuando esta disponible, y en CPU con dos hilos intra-op como alternativa.
- Preprocesado letterbox integrado para adaptar imagenes de distinta resolucion a la entrada 736x736.
- Supresion no maxima propia en numpy con IoU 0,45 y limite de 100 detecciones.
- Sin acceso a red y sin escritura en disco, requisito del verificador de conformidad del track publico.
- No soporta tool calling, agentes, razonamiento multietapa ni capacidades multilingues, al no ser un modelo de lenguaje.
- No se documentan capacidades de segmentacion, keypoints reales ni clasificacion de atributos mas alla de las cuatro clases.

## Casos de uso

- Mineria en la subnet 44 de Bittensor: el paquete esta disenado para actuar como minero del track publico, respondiendo a peticiones de deteccion sobre fotogramas de estaciones de servicio con el formato de salida exigido por la subnet.
- Auditoria de inventario de estaciones de servicio: el detector permite localizar surtidores, mangueras, marquesinas y paneles de precios en imagenes capturadas en campo, lo que facilita el recuento y la verificacion de elementos instalados.
- Control de calidad de imagen comercial: util para verificar que una fotografia de una estacion incluye los elementos esperados (por ejemplo, que el panel de precios sea visible) antes de publicarla en un catalogo o en una ficha de cliente.
- Anotacion asistida de datasets: las cajas generadas con umbrales ajustados por clase pueden servir como preanotaciones para revisores humanos, reduciendo el coste de etiquetado en proyectos de vision similares.
- Procesamiento en dispositivos sin GPU: al ser un ONNX de 9,31 MiB y funcionar en CPU con dos hilos, puede desplegarse en entornos edge o contenedores ligeros para tareas de deteccion en tiempo casi real sobre lotes pequenos.
- Integracion en pipelines de analisis geoespacial: combinado con metadatos de captura, permite clasificar y localizar estaciones de servicio en imagenes de satelite o street-level para estudios de cobertura.
- Prototipado rapido de detectores verticales: sirve como plantilla de referencia para construir mineros con onnxruntime, letterbox y NMS en numpy en otros dominios con pocas clases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; por el tamano del ONNX (9,31 MiB) y la entrada 736x736, el consumo es bajo y cabe holgadamente en GPUs consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU compatible con CUDA y onnxruntime; el repositorio no especifica modelos concretos. Una RTX 3060, RTX 4060 o superior es suficiente para lotes pequenos.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con soporte CUDA; tambien funciona en CPU con dos hilos intra-op.
- Opciones de despliegue: onnxruntime (CUDA o CPU), invocacion directa de `miner.py` mediante la clase `Miner(path_hf_repo)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector ONNX.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, del tamano del lote y de la resolucion de las imagenes de entrada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `brightness04/petrol-01` | Detector ONNX de 4 clases | no disponible (9,31 MiB) | 736x736 | no disponible | Hugging Face, ONNX |
| `manak0/Detect-petrol-station-1-0` | Detector original del que deriva | no disponible | no disponible | no disponible | Referenciado en la model card |
| YOLOv8n (Ultralytics) | Detector generico | ~3,2 M | 640x640 tipico | AGPL-3.0 / comercial | Ampliamente disponible |
| RT-DETR-l (PaddleDetection) | Detector transformer | ~32 M | 640x640 tipico | Apache-2.0 | Ampliamente disponible |

La comparativa con detectores genericos es orientativa: el modelo de `brightness04` esta especializado en cuatro clases de estaciones de servicio, mientras que YOLOv8n y RT-DETR-l son detectores de proposito general con licencias conocidas. No hay datos publicos de precision para `petrol-01` que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No hay informacion sobre la licencia, lo que impide confirmar si el uso comercial esta permitido; conviene contactar con el autor antes de utilizarlo en produccion.
- El repositorio no registra descargas ni likes y el modelo se creo y actualizo en la misma fecha (2026-11-10), lo que sugiere una publicacion reciente y sin validacion externa.
- No se documentan sesgos del dataset de entrenamiento; al tratarse de un detector vertical, es probable que tenga un rendimiento desigual en condiciones de iluminacion, clima o geografia distintas a las del conjunto original.
- Riesgo de falsos positivos y negativos: los umbrales por clase (0,32 a 0,4) indican un ajuste manual que puede no generalizar a otros dominios.
- La lista de poligonos se devuelve vacia y los keypoints no se describen, por lo que no debe esperarse segmentacion ni deteccion de puntos clave.
- El modelo no procesa texto ni mantiene contexto conversacional; no es adecuado para tareas de lenguaje, razonamiento o agentes.
- El codigo exige que no se abran conexiones de red ni se escriban ficheros; cualquier modificacion debe respetar esa restriccion si se usa en el track publico.
- No se especifica la arquitectura subyacente, lo que dificulta evaluar su robustez frente a detectores conocidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/brightness04/petrol-01
- Modelo original referenciado: `manak0/Detect-petrol-station-1-0` (no se proporciona URL directa en la informacion disponible)
- Subnet 44 de Bittensor (TurboVision): no se proporciona URL en la informacion disponible
- Paper, blog o demo adicionales: no disponibles
