# onnx-community/dfine-egret-x-rukopys-ONNX

## Resumen

`dfine-egret-x-rukopys` es un detector de regiones de documentos (document layout analysis) especializado en páginas manuscritas en ucraniano. El modelo, desarrollado por Hukyl y convertido a ONNX por la comunidad `onnx-community`, se basa en la arquitectura D-FINE, un detector de objetos en tiempo real derivado de RT-DETR con refinamiento de distribución de regresión de cajas. Con aproximadamente 62,7 millones de parámetros, clasifica cada región de una página en siete categorías: texto manuscrito, texto impreso, fórmula, tabla, anotación, imagen y gráfico.

El modelo se fine-tuneó sobre el dataset Rukopys, un corpus de documentos históricos ucranianos manuscritos, partiendo del checkpoint `docling-project/docling-layout-egret-xlarge` (diseñado para 17 clases de layout). La versión ONNX permite su ejecución en navegador mediante Transformers.js y en entornos con ONNX Runtime, lo que facilita su integración en pipelines de digitalización y análisis documental sin necesidad de infraestructura pesada. Su relevancia radica en cubrir un nicho poco atendido: la detección de layout en escritura manuscrita eslava, con una licencia Apache 2.0 que permite uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | D-FINE (backbone HGNetV2, decoder estilo RT-DETR con refinamiento de distribución fina) |
| Parametros totales | ~62,7 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 640×640) |
| Tipos de cuantizacion | no disponible (formato ONNX, sin cuantizaciones publicadas) |
| Idiomas soportados | ucraniano (para el contenido de los documentos; el modelo no procesa texto, solo detecta regiones) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, safetensors (el repo incluye `model.safetensors` y archivos de configuración) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura D-FINE, presentada en el paper *D-FINE: Redefine Regression Task of DETRs as Fine-grained Distribution Refinement*. Combina un backbone HGNetV2 con un decoder de detección de objetos sin NMS, basado en 300 queries de objeto y predicción de conjuntos. La innovación principal es el refinamiento de la distribución de regresión de cajas, que mejora la precisión de localización frente a los DETR clásicos. La cabeza de clasificación se re-inicializó para las 7 clases de Rukopys, mientras que el resto de pesos se cargaron del checkpoint base de 17 clases.

El entrenamiento se realizó con el 🤗 Trainer sobre el split de entrenamiento de Rukopys, con un total de 60 épocas y early stopping (paciencia 15 sobre mAP@50). Se usó AdamW con learning rate 1e-4, warmup del 10%, weight decay 1e-4, batch de 32 y resolución fija de 640×640 con normalización ImageNet. No se aplicó aumentación de datos. El checkpoint seleccionado (época 24) se eligió por mejor mAP@50 en validación, aunque la pérdida de validación y el mAP@50 mostraron una correlación negativa de −0.81, lo que llevó a comparar ambas métricas de selección. El dataset de entrenamiento contiene 23.022 regiones anotadas, con una distribución muy desequilibrada: la clase `handwritten` domina con 19.420 instancias, mientras que `graph` solo tiene 54.

## Capacidades

- Detección de regiones en páginas de documentos: identifica y clasifica cajas delimitadoras para texto manuscrito, texto impreso, fórmulas, tablas, anotaciones, imágenes y gráficos.
- Salida con predicción de conjunto: 300 queries de objeto, sin necesidad de supresión de no máximos (NMS).
- Entrada de imagen de página completa a 640×640 píxeles, con normalización ImageNet.
- Inferencia en navegador: gracias a la conversión ONNX y la integración con Transformers.js, puede ejecutarse en clientes web.
- Compatible con el ecosistema Hugging Face: carga directa con `AutoModelForObjectDetection` y `AutoImageProcessor`.
- Diseñado para aguas arriba de reconocedores de región específicos, como TrOCR para texto y fórmulas.

## Casos de uso

- Digitalización de archivos históricos ucranianos: el modelo puede segmentar páginas manuscritas en regiones semánticas (texto, fórmulas, tablas) para alimentar posteriormente un OCR o un reconocedor de escritura manual como TrOCR, facilitando la transcripción y búsqueda de contenido.
- Análisis de documentos académicos antiguos: en bibliotecas digitales, permite separar fórmulas matemáticas, gráficos y anotaciones marginales del cuerpo de texto, mejorando la indexación y el acceso a colecciones especializadas.
- Preprocesado para pipelines de reconocimiento de fórmulas: al detectar regiones de tipo `formula`, el modelo puede recortar y enviar esas áreas a un modelo específico de reconocimiento de expresiones matemáticas, reduciendo el ruido y mejorando la precisión.
- Clasificación de páginas en sistemas de gestión documental: permite etiquetar automáticamente si una página contiene texto manuscrito, impreso, tablas o gráficos, útil para organizar y priorizar tareas de digitalización.
- Extracción de tablas en documentos manuscritos: aunque la clase `table` tiene pocos ejemplos, el modelo puede localizar tablas en páginas manuscritas para su posterior estructuración, un paso clave en la conversión de documentos históricos a formatos editables.
- Integración en aplicaciones web de visualización de manuscritos: mediante Transformers.js, el modelo puede ejecutarse en el navegador para resaltar regiones de interés en tiempo real, sin enviar imágenes a un servidor, lo que preserva la privacidad de los documentos.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en la model card, sobre el split de validación "gold val" del dataset Rukopys (133 páginas, 2.629 regiones), son los siguientes:

| Metrica | Valor |
|---|---|
| mAP@50 | 0,6704 |
| mAP@50-95 | 0,4441 |
| Precision (confianza ≥ 0,50, IoU ≥ 0,50) | 0,8971 |
| Recall (confianza ≥ 0,50, IoU ≥ 0,50) | 0,8787 |

Además, se comparó la selección de checkpoint por mAP@50 (el enviado) frente a la selección por pérdida de validación:

| Seleccion | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---:|---:|---:|---:|
| Por mAP@50 (enviado) | 0,6704 | 0,4441 | 0,8971 | 0,8787 |
| Por val loss | 0,6413 | 0,4356 | 0,9184 | 0,8695 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Al tratarse de un modelo de ~62,7 millones de parámetros, la inferencia es ligera. En FP32, los pesos ocupan aproximadamente 250 MB; en FP16 o con cuantización, menos.
- Puede ejecutarse en CPU sin problemas para inferencia por lotes pequeños, aunque la latencia será mayor que en GPU.
- En GPU, cualquier tarjeta con al menos 2 GB de VRAM es suficiente para batch 1. Modelos como RTX 3060, RTX 4060 o superiores ofrecen latencias de decenas de milisegundos por imagen.
- El formato ONNX permite despliegue con ONNX Runtime, tanto en CPU como en GPU, y con Transformers.js en navegador.
- No se han publicado mediciones de throughput o latencia específicas para este modelo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Clases | mAP@50 (Rukopys) | Licencia |
|---|---|---|---|---|---|
| `dfine-egret-x-rukopys` (este) | D-FINE (HGNetV2 + RT-DETR decoder) | ~62,7M | 7 | 0,6704 | Apache 2.0 |
| `Hukyl/doclayout-yolov10-rukopys` | YOLOv10 | no disponible | 7 (presumiblemente) | no disponible (el autor lo cita como "más fuerte") | no disponible |
| `docling-project/docling-layout-egret-xlarge` | D-FINE | ~62,7M (base) | 17 | no disponible (checkpoint base) | no disponible |

No se dispone de datos de rendimiento comparativos publicados para los modelos alternativos en el mismo dataset.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con documentos ucranianos manuscritos; su rendimiento en otros idiomas o estilos de escritura puede degradarse significativamente.
- Fuerte desequilibrio de clases: `handwritten` representa el 84% de las regiones de entrenamiento, mientras que `graph` solo tiene 54 ejemplos. Las clases minoritarias (`table`, `image`, `graph`) probablemente tengan una precisión y recall mucho menores, aunque no se han publicado métricas per-clase en la información disponible.
- La resolución fija de 640×640 puede perder detalles en páginas muy densas o con letra pequeña.
- No se han documentado sesgos específicos, pero al ser un modelo de detección, el riesgo de alucinación no aplica; el riesgo principal es la omisión o clasificación errónea de regiones poco representadas.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el dataset Rukopys puede tener sus propios términos de uso que deben verificarse.
- La versión ONNX es una conversión automática; se recomienda validar que el comportamiento sea idéntico al modelo original en PyTorch antes de usarla en producción.

## Enlaces

- Modelo ONNX en Hugging Face: https://huggingface.co/onnx-community/dfine-egret-x-rukopys-ONNX
- Modelo original en PyTorch: https://huggingface.co/Hukyl/dfine-egret-x-rukopys
- Dataset Rukopys: https://huggingface.co/datasets/UkrainianCatholicUniversity/rukopys
- Checkpoint base (17 clases): https://huggingface.co/docling-project/docling-layout-egret-xlarge
- Repositorio oficial de D-FINE: https://github.com/Peterande/D-FINE
- Organización ONNX Community: https://huggingface.co/onnx-community
- Documentación de Transformers.js para object-detection: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.ObjectDetectionPipeline
