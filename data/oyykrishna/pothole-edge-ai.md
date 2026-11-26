# oyykrishna/pothole-edge-ai

## Resumen

pothole-edge-ai es un conjunto de pesos ONNX publicado por el usuario oyykrishna (proyecto CSET400C Capstone, Bennett University) para un sistema de deteccion de baches en calzadas orientado a despliegue en el borde (edge AI). No es un modelo de lenguaje ni un modelo fundacional: se compone de tres artefactos de inferencia visual que trabajan en cadena dentro de un pipeline de vision por computador.

El primero es `det_fp32.onnx`, un detector YOLOv8n entrenado para localizar baches. El segundo es `depth_resnet18_fp32.onnx`, un modelo ResNet18 que opera sobre recortes de la region detectada para estimar una severidad relativa (low / moderate / high), que el propio autor califica de experimental y no de profundidad medida. El tercero, `coco_yolov8n.pt`, es un YOLOv8n estandar preentrenado en COCO que se usa unicamente para difuminar personas y vehiculos antes de procesar la imagen, una medida de privacidad.

Su relevancia es acotada pero concreta: ofrece una via de despliegue en formato ONNX (compatible con ONNX Runtime, TensorRT, OpenVINO y otros runtimes de borde) para una tarea de mantenimiento de infraestructura viaria, con un tamano de repositorio de 0,1 GB que sugiere pesos ligeros aptos para dispositivos con recursos limitados. El repositorio no incluye model card tecnica detallada, metricas, ni informacion sobre el dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (deteccion de objetos) + ResNet18 (regresion/clasificacion de severidad sobre recortes) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (los ficheros publicados son FP32) |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`det_fp32.onnx`, `depth_resnet18_fp32.onnx`) y PyTorch (`coco_yolov8n.pt`) |

## Arquitectura y entrenamiento

La arquitectura combina dos etapas de vision. La primera es una red YOLOv8n, la variante "nano" de la familia YOLOv8 de Ultralytics, que actua como detector de baches sobre la imagen completa. La segunda es una ResNet18 que recibe recortes de las regiones detectadas y produce una etiqueta de severidad relativa en tres niveles (low, moderate, high). Adicionalmente se emplea un YOLOv8n preentrenado en COCO como filtro de privacidad para difuminar personas y vehiculos.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el numero de imagenes, las tecnicas de aumento de datos ni si hubo ajuste fino supervisado desde pesos preentrenados de YOLOv8n y ResNet18 (lo cual es plausible dado el uso de esas arquitecturas, pero no esta documentado). Tampoco hay informacion sobre el proceso de etiquetado de la severidad ni sobre su validacion. El autor indica explicitamente que la salida de severidad es relativa y experimental.

## Capacidades

- Deteccion de baches en imagenes de calzada mediante YOLOv8n en formato ONNX.
- Estimacion de severidad relativa por bache (low / moderate / high) mediante ResNet18 sobre recortes.
- Difuminado de personas y vehiculos mediante un YOLOv8n COCO estandar, como paso previo de privacidad.
- Inferencia en formato ONNX, exportable a runtimes de borde (ONNX Runtime, TensorRT, OpenVINO).
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de capacidades multilingues ni de procesamiento de audio.
- No dispone de modo "thinking" ni de capacidades multimodales mas alla de la vision.

## Casos de uso

- Inspeccion de firmes con vehiculos instrumentados: montar el pipeline ONNX en una camara a bordo (dashcam o vehiculo municipal) para detectar baches en tiempo real durante rutas de mantenimiento, aprovechando el bajo peso de YOLOv8n.
- Priorizacion de reparaciones: usar la etiqueta de severidad relativa para ordenar los baches detectados y asignar cuadrillas a los tramos con severidad alta, con la advertencia de que la severidad es experimental y no una medida metrica.
- Despliegue en dispositivos de borde con recursos limitados: los ficheros ONNX FP32 permiten ejecucion en CPU o en aceleradores ligeros (Jetson, NPU integradas) sin necesidad de GPU de datacenter.
- Procesamiento por lotes de imagenes historicas: ejecutar el detector sobre archivos de imagenes de inventario viario para generar un catalogo de baches con coordenadas y severidad estimada.
- Integracion en aplicaciones ciudadanas de reporte: recibir fotos enviadas por ciudadanos, difuminar personas y vehiculos con el modelo COCO y detectar el bache para enrutar el aviso al servicio municipal.
- Prototipado academico y de investigacion: servir como base reproducible (capstone de Bennett University) para experimentos de deteccion de defectos viarios y comparacion de arquitecturas ligeras.
- Filtro de privacidad previo en pipelines de video: reutilizar `coco_yolov8n.pt` como etapa de anonimizacion antes de almacenar o publicar imagenes de calzada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de los modelos (YOLOv8n y ResNet18 en FP32, repositorio de 0,1 GB) es plausible su ejecucion en CPU y en GPUs de consumo, pero no hay cifras publicadas.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de los modelos, aunque no hay confirmacion del autor.
- Opciones de despliegue: ONNX Runtime (formato nativo de los ficheros), TensorRT, OpenVINO, y cualquier runtime compatible con ONNX; el fichero COCO en `.pt` requiere PyTorch/Ultralytics.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pothole-edge-ai (este) | Deteccion de baches + severidad relativa | YOLOv8n + ResNet18 | no disponible | no aplica | AGPL-3.0 | Hugging Face (0 descargas) |
| YOLOv8n (Ultralytics, COCO) | Deteccion de objetos generica | YOLOv8n | no disponible en la informacion | no aplica | AGPL-3.0 | Ampliamente disponible |
| Modelos de deteccion de defectos viarios en HF | Deteccion de baches | variable | no disponible | no aplica | variable | variable |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La salida de severidad es relativa y experimental (low / moderate / high); no es una profundidad medida ni una magnitud fisica calibrada.
- No hay model card tecnica con metricas (mAP, precision, recall) ni descripcion del dataset, por lo que no es posible evaluar la calidad del detector.
- El repositorio registra 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad.
- No se especifican sesgos conocidos, pero al ser un detector entrenado sobre un dataset no documentado, su generalizacion a otras regiones, condiciones de iluminacion, climatologia o tipos de firme es incierta.
- Riesgo de falsos positivos y negativos no cuantificado; en produccion requeriria validacion local antes de tomar decisiones de mantenimiento.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el software que integre el modelo y sobre los servicios en red que lo expongan; conviene revisar su compatibilidad con el uso comercial previsto.
- No hay informacion sobre idiomas ni sobre soporte de texto: es un modelo exclusivamente de vision.
- El uso de `coco_yolov8n.pt` para difuminar personas y vehiculos no garantiza anonimizacion completa si el detector COCO falla en casos dificiles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/oyykrishna/pothole-edge-ai
- Repositorio del proyecto en GitHub: https://github.com/oyy-krishna/pothole-edge-ai
- Ultralytics YOLOv8 (framework base): https://github.com/ultralytics/ultralytics
- ONNX Runtime: https://onnxruntime.ai/
