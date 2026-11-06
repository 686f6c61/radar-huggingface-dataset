# manako/Detect-room-dirtiness-detection-winner

## Resumen

Detect-room-dirtiness-detection-winner es un modelo de deteccion de objetos publicado en Hugging Face por el usuario manako. Se trata de la conversion de un modelo ganador de una competicion de mineros ("winner miner") en un elemento de libreria reutilizable, segun la metadata de la propia model card. El modelo detecta cinco clases de suciedad y objetos relacionados con la limpieza de habitaciones: derrames de liquido, papeleras, basura, moho y manchas.

El modelo se distribuye en formato ONNX y esta construido sobre la arquitectura Ultralytics YOLO, un detector de objetos de una etapa ampliamente utilizado por su equilibrio entre velocidad y precision. El repositorio tiene un tamano de 0.0 GB en la metadata de Hugging Face, aunque la model card indica un tamano del artefacto de 10.7 MB, coherente con un modelo YOLO pequeno exportado a ONNX.

La relevancia de este modelo es limitada y muy especifica: no es un modelo de proposito general ni un lanzamiento de un laboratorio, sino un artefacto derivado de un pipeline interno de evaluacion (manako) que selecciona el mejor modelo de deteccion para una tarea concreta. Su interes practico reside en la deteccion de suciedad en entornos domesticos o de hosteleria, un caso de uso de vision por computador aplicado a robotica de limpieza o inspeccion automatizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO (detector de objetos de una etapa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (exportado a ONNX; cuantizacion INT8/FP16 no documentada) |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura es Ultralytics YOLO, un detector de objetos de una etapa que predice cajas delimitadoras y clases directamente en una sola pasada de la red, sin etapa de propuestas de region. El modelo se exporta a ONNX, lo que permite su despliegue con el runtime de ONNX Runtime en CPU o GPU, y potencialmente con TensorRT u otros backends compatibles.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de imagenes, la composicion de clases, ni si se aplicaron tecnicas de aumento de datos o ajuste fino. La model card unicamente documenta la procedencia del modelo (repositorio ganador `ArthurSword/ThunderStone_06`, revision `bf20ed2e0ec4ff06ba31f6b807bed561c4df9b8d`) y las metricas de evaluacion del pipeline de seleccion, sin detallar el proceso de entrenamiento.

## Capacidades

- Deteccion de objetos en imagenes para cinco clases: derrames de liquido (liquid spillage), papeleras (bin), basura (litter), moho (mould) y manchas (stain).
- Salida de cajas delimitadoras con clase y puntuacion de confianza, en formato estandar de deteccion de objetos.
- Inferencia mediante ONNX Runtime, lo que permite despliegue en entornos sin dependencia de PyTorch.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo de vision.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision multimodal ni audio.

## Casos de uso

- Robotica de limpieza automatizada: el modelo puede integrarse en la percepcion de un robot aspirador o de fregado para localizar derrames y manchas antes de decidir la ruta de limpieza, usando la salida de cajas para dirigir el efector.
- Inspeccion de habitaciones de hotel: un sistema de vision puede capturar imagenes de la habitacion tras el check-out y detectar basura, manchas o moho para priorizar tareas del personal de limpieza.
- Control de calidad en hosteleria: en cocinas y comedores, el modelo puede senalar derrames de liquido y restos de basura en superficies para activar protocolos de limpieza.
- Mantenimiento preventivo de edificios: deteccion temprana de moho en paredes o techos a partir de imagenes capturadas periodicamente, lo que permite programar intervenciones antes de que el problema se extienda.
- Aplicaciones moviles de asistencia domestica: el usuario fotografia una estancia y la app resalta las zonas que requieren limpieza, usando el modelo ONNX embebido en el dispositivo.
- Analisis de imagenes en paneles de gestion de instalaciones: procesamiento por lotes de imagenes de camaras o inspecciones para generar alertas de suciedad en un dashboard operativo.

## Benchmarks y rendimiento

La model card documenta las metricas del pipeline de seleccion del modelo ganador:

| Metrica | Valor |
|---|---|
| Performance mAP50 | 0.6279 |
| E (metrica de eficiencia del pipeline) | 0.0587 |
| Tamano del artefacto | 10.70 MB |
| Tipo de benchmark | synthetic_fixed |
| Fecha del benchmark | 2026-11-02 |

No se han publicado resultados de benchmarks estandar (COCO, VOC) en la informacion disponible. El valor de mAP50 de 0.6279 corresponde a la evaluacion interna del pipeline manako sobre un conjunto sintetico, no a un benchmark publico comparable.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un modelo ONNX de 10.7 MB requiere tipicamente menos de 1 GB de VRAM, aunque el dato exacto no esta disponible.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo puede ejecutarse en GPU de consumo como RTX 3060, RTX 4060 o superiores, y en GPU de datacenter como A100 o H100 sin aprovechar su capacidad.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), TensorRT, OpenVINO; tambien puede ejecutarse con las herramientas de Ultralytics si se dispone de los pesos originales.
- Latencia y throughput estimados: no disponibles; al tratarse de un modelo YOLO pequeno exportado a ONNX, se espera una latencia de pocos milisegundos por imagen en GPU, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | mAP50 | Licencia | Formato |
|---|---|---|---|---|---|---|
| Detect-room-dirtiness-detection-winner | Ultralytics YOLO | no disponible | no aplica | 0.6279 (interno) | no disponible | ONNX |
| YOLOv8n (Ultralytics) | YOLOv8 nano | ~3.2 M | no aplica | ~0.37 (COCO) | AGPL-3.0 | PyTorch, ONNX |
| YOLOv8s (Ultralytics) | YOLOv8 small | ~11.2 M | no aplica | ~0.45 (COCO) | AGPL-3.0 | PyTorch, ONNX |
| Faster R-CNN ResNet-50 | Two-stage | ~41 M | no aplica | ~0.37 (COCO) | Apache-2.0 (torchvision) | PyTorch |

La comparacion con modelos COCO no es directa, ya que las clases y el conjunto de evaluacion son distintos; el mAP50 de 0.6279 corresponde a un benchmark sintetico interno sobre las cinco clases de suciedad, no a COCO. Los datos de parametros y mAP de los modelos comparados son valores de referencia publicos de sus respectivos proyectos.

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse si el uso comercial esta permitido; es imprescindible verificar la licencia antes de desplegarlo en produccion.
- El modelo se ha evaluado unicamente sobre un benchmark sintetico interno; no hay validacion sobre datos reales publicos, lo que limita la confianza en su generalizacion.
- Al ser un modelo YOLO pequeno, la precision en objetos pequenos o parcialmente ocluidos puede ser limitada.
- Riesgo de falsos positivos y negativos en condiciones de iluminacion adversas, angulos no vistos o superficies con texturas similares a las clases entrenadas.
- No hay informacion sobre sesgos del dataset de entrenamiento ni sobre la distribucion de las clases.
- Es un modelo de vision puro: no procesa texto, no soporta instrucciones y no puede integrarse en flujos conversacionales sin un componente adicional.
- La metadata de Hugging Face indica 0 descargas y 0 likes, y el repositorio figura con 0.0 GB, lo que sugiere que el artefacto podria no estar completamente disponible o que la metadata no refleja el contenido real.
- No se documenta el proceso de entrenamiento, por lo que no puede evaluarse la calidad del dataset ni posibles sesgos de anotacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manako/Detect-room-dirtiness-detection-winner
- Repositorio ganador de origen: https://huggingface.co/ArthurSword/ThunderStone_06
- Repositorio Ultralytics YOLO: https://github.com/ultralytics/ultralytics
- ONNX Runtime: https://onnxruntime.ai/
