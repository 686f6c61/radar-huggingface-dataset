# AnnotateIt/rfdetr-seg-xxlarge-coco-onnx

## Resumen

RF-DETR Seg 2XLarge es un modelo de segmentación de instancias en tiempo real desarrollado por Roboflow, basado en una arquitectura transformer con backbone DINOv2. Esta ficha describe la conversión ONNX FP32 no oficial realizada por AnnotateIt para su herramienta de autoanotación en navegador, exportada con el exportador oficial de RF-DETR (tag 1.9.4) y validada contra el checkpoint original. El modelo detecta y segmenta 80 clases de objetos de COCO (thing classes) en un layout de logits sparse COCO-91, con 38,6 millones de parámetros y una entrada fija de 768×768 píxeles.

La relevancia de esta conversión radica en que permite ejecutar el modelo en entornos de inferencia ONNX Runtime, incluido el navegador mediante WebAssembly (WASM), sin necesidad de PyTorch. Esto habilita casos de uso de anotación automática local y privada, sin dependencia de servicios en la nube. El modelo original reporta una precisión de segmentación (mask AP 50:95) de 49,9 en COCO val, y la conversión ONNX mantiene una concordancia de 0,019 puntos de AP con el checkpoint PyTorch en la evaluación completa de val2017.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de detección (RF-DETR) con backbone DINOv2 |
| Parametros totales | 38.648.163 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto de texto) |
| Tipos de cuantizacion | FP32 (única precisión publicada en esta conversión) |
| Idiomas soportados | no disponible (modelo de visión, no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17, archivo `model.onnx` de 140,7 MB) |

## Arquitectura y entrenamiento

RF-DETR es una familia de modelos de detección y segmentación de instancias en tiempo real desarrollada por Roboflow. La arquitectura combina un backbone de visión DINOv2 con un decoder transformer que predice directamente cajas, clases y máscaras sin necesidad de anclas ni NMS. El modelo fue diseñado mediante neural architecture search (NAS), como se describe en el paper "RF-DETR: Neural Architecture Search for Real-Time Detection Transformers" (arXiv:2511.09554). El checkpoint base `Roboflow/rf-detr-seg-xxlarge` fue entrenado en el conjunto de datos COCO con 80 clases thing, y esta conversión ONNX reproduce exactamente los pesos del checkpoint original, verificados tensor a tensor.

La conversión se realizó con el exportador oficial de RF-DETR, fijando batch 1, resolución 768×768 y precisión FP32. El preprocesado requerido es un redimensionado por estiramiento (stretch-resize) bilineal sin letterbox, seguido de normalización con media y desviación estándar de ImageNet. El postprocesado sigue la semántica oficial: sigmoid sobre los logits, selección global top-K sobre las 300×91 puntuaciones, umbral de confianza estricto de 0,5 y binarización de máscaras con logit > 0. No se aplica NMS; una misma query puede seleccionarse para varias clases.

## Capacidades

- Segmentación de instancias: predice máscaras de píxeles para cada objeto detectado, con salida de máscaras de 192×192 por query.
- Detección de objetos: genera hasta 300 cajas delimitadoras (formato cxcywh normalizado) con puntuaciones de clase.
- Clasificación en 80 clases COCO: las salidas de logits usan un layout sparse COCO-91, donde los índices de clase corresponden a los IDs nativos de COCO (person=1, car=3, etc.).
- Inferencia en navegador: la conversión ONNX está validada para ejecutarse con onnxruntime-web en WASM, permitiendo anotación automática local sin servidor.
- Compatibilidad con ONNX Runtime: puede ejecutarse en CPU, CUDA y otros proveedores de ejecución soportados por ORT.
- Sin NMS: el postprocesado es determinista y no requiere supresión de no máximos, simplificando la integración.

## Casos de uso

- Autoanotación en navegador: AnnotateIt usa este modelo para generar anotaciones de segmentación automáticamente en el navegador del usuario, con privacidad total de los datos. La validación WASM confirma que funciona en Chromium con una latencia de ~17 segundos por imagen en single-thread, suficiente para flujos de anotación asistida.
- Etiquetado de datos para visión por computador: equipos de anotación pueden pre-generar máscaras de instancias COCO y luego refinar manualmente, reduciendo el tiempo de etiquetado. El modelo se ejecuta localmente en GPU o CPU mediante ONNX Runtime.
- Segmentación en tiempo real en edge: con la latencia de 21,8 ms en T4 (TensorRT FP16) reportada por Roboflow, el modelo es adecuado para aplicaciones de inspección industrial o robótica que requieren segmentación de instancias en tiempo real.
- Análisis de imágenes médicas o agrícolas: aunque entrenado en COCO, el modelo puede servir como base para fine-tuning en dominios específicos, aprovechando su backbone DINOv2 para transferencia de características.
- Integración en pipelines de procesamiento de imágenes: al ser un único grafo ONNX, puede integrarse en sistemas de producción con ONNX Runtime, TensorRT o servicios como Azure ML, sin dependencia de PyTorch.
- Prototipado rápido de aplicaciones de visión: desarrolladores pueden usar el modelo para validar ideas de segmentación sin entrenar modelos propios, gracias a su licencia Apache-2.0 y su disponibilidad en formato estándar.

## Benchmarks y rendimiento

La model card reporta métricas oficiales de Roboflow y mediciones propias de la conversión. No se han publicado resultados adicionales en la información disponible.

| Métrica | Valor |
|---|---|
| COCO mask AP 50:95 (oficial, Roboflow) | 49,9 |
| COCO mask AP50 (oficial, Roboflow) | 73,1 |
| Latencia (oficial, T4, TensorRT FP16, batch 1) | 21,8 ms |
| bbox AP (PyTorch, RTX 3090, FP32) | 0,5765 |
| bbox AP (ONNX Runtime, RTX 3090, FP32) | 0,5766 |
| segm AP (PyTorch, RTX 3090, FP32) | 0,4970 |
| segm AP (ONNX Runtime, RTX 3090, FP32) | 0,4968 |
| segm AP50 (PyTorch, RTX 3090, FP32) | 0,7329 |
| segm AP50 (ONNX Runtime, RTX 3090, FP32) | 0,7330 |

La concordancia entre PyTorch y ONNX es de 0,019 puntos de AP en segmentación. La evaluación propia usa un protocolo distinto al oficial (fija `num_select=300` y preprocesado de despliegue), por lo que las cifras no son directamente comparables con el 49,9 oficial.

## Requisitos de hardware

- VRAM estimada: el modelo FP32 con entrada 768×768 requiere aproximadamente 1,5-2 GB de VRAM para inferencia en GPU (los pesos ocupan ~140 MB, más activaciones y buffers). En CPU, la memoria RAM necesaria es similar.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM (p. ej., RTX 3060, RTX 3090, T4). En la validación se usó una RTX 3090.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como RTX 3060 o superiores. También puede ejecutarse en CPU, aunque con latencia mucho mayor.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT), onnxruntime-web (WASM) para navegador, y cualquier framework que soporte ONNX (p. ej., OpenVINO, TensorRT).
- Latencia y throughput: 21,8 ms en T4 con TensorRT FP16 (dato oficial); en navegador WASM single-thread se midió ~17,2 s por imagen en Chromium (p50 tras warm-up). En RTX 3090 con FP32, la inferencia es sustancialmente más rápida, aunque no se reporta un número exacto.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos en la información proporcionada. El paper de RF-DETR menciona que RF-DETR-Seg (nano) supera a YOLOv11-Seg (x-large) en COCO siendo 4 veces más rápido, pero no se aportan cifras concretas para la variante 2XLarge. Como referencia cualitativa:

| Modelo | Parámetros | Contexto/entrada | Precisión (COCO mask AP) | Licencia |
|---|---|---|---|---|
| RF-DETR Seg 2XLarge (este) | 38,6 M | 768×768 | 49,9 (oficial) | Apache-2.0 |
| YOLOv11-Seg (x-large) | ~70 M (estimado) | 640×640 | no disponible | AGPL-3.0 |
| Mask R-CNN (ResNet-50) | ~44 M | 800×1333 | ~35 (aprox.) | MIT |

Los datos de YOLOv11 y Mask R-CNN son aproximados y no provienen de la información proporcionada; se incluyen solo como orientación general.

## Limitaciones y advertencias

- Conversión no oficial: aunque exportada con el exportador oficial, esta versión ONNX es mantenida por AnnotateIt y no está respaldada por Roboflow. Podría haber diferencias sutiles en entornos no validados.
- Tolerancia numérica FP32: en la variante 2XLarge se documenta una discrepancia en el TopK del encoder (dos puntuaciones separadas por 4,77e-6 en PyTorch se vuelven iguales en ORT), lo que provoca diferencias de hasta 0,0013 en puntuaciones y 0,23 píxeles en cajas en ciertas imágenes. La validación permite esta tolerancia, pero no es una paridad exacta.
- Validación de navegador limitada: solo se probó en Chromium (WASM single-thread). WKWebView y WebView2 no fueron ejercitados, por lo que el rendimiento en Safari o WebView de Android no está garantizado.
- Preprocesado específico: requiere stretch-resize sin letterbox y normalización ImageNet. Usar otro preprocesado degradará la precisión.
- Sin NMS: el postprocesado puede seleccionar la misma query para varias clases, lo que puede generar detecciones duplicadas en casos de clases solapadas.
- Sesgos de COCO: el modelo está entrenado en COCO, por lo que su rendimiento en dominios fuera de las 80 clases (objetos industriales, médicos, etc.) será limitado sin fine-tuning.
- Riesgo de alucinación: como todo modelo de visión, puede producir máscaras o detecciones incorrectas en imágenes ambiguas o fuera de distribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnnotateIt/rfdetr-seg-xxlarge-coco-onnx
- Checkpoint base: https://huggingface.co/Roboflow/rf-detr-seg-xxlarge
- Repositorio oficial RF-DETR: https://github.com/roboflow/rf-detr
- Paper "RF-DETR: Neural Architecture Search for Real-Time Detection Transformers": https://arxiv.org/pdf/2511.09554
- Documentación de RF-DETR: https://rfdetr.roboflow.com/latest/
- Conversión hermana (nano): https://huggingface.co/AnnotateIt/rfdetr-seg-nano-coco-onnx
