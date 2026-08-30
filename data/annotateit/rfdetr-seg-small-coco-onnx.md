# AnnotateIt/rfdetr-seg-small-coco-onnx

## Resumen

RF-DETR Seg Small en formato ONNX FP32 es una conversión independiente y no oficial del checkpoint preentrenado de Roboflow para segmentación de instancias en tiempo real. La ha producido AnnotateIt para su herramienta de autoanotación local en navegador, utilizando el exportador oficial de la librería `rfdetr` (versión 1.9.4), por lo que no se trata de una reimplementación. El modelo original, desarrollado por Roboflow, es una arquitectura basada en DETR que alcanza estado del arte en COCO y está diseñada para fine-tuning.

Esta conversión concreta fija el batch a 1, la resolución de entrada a 384×384 y exporta el grafo en precisión FP32 con opset 17. El modelo tiene 33,7 millones de parámetros y detecta las 80 clases "thing" de COCO, aunque internamente usa un layout disperso de 91 logits (COCO-91). Su relevancia actual radica en que permite ejecutar segmentación de instancias en entornos ONNX Runtime, incluido el navegador mediante onnxruntime-web con backend WASM, sin depender de PyTorch ni de GPUs dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (transformer encoder-decoder, basado en DETR) |
| Parametros totales | 33.711.107 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija 384×384) |
| Tipos de cuantizacion | FP32 (este repo); el modelo base tiene versiones cuantizadas en otros repos |
| Idiomas soportados | no disponible (modelo de vision, sin soporte de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model.onnx, 123.380.405 bytes) |

## Arquitectura y entrenamiento

El modelo base es RF-DETR Seg Small de Roboflow, una arquitectura de detección y segmentación de instancias en tiempo real basada en transformer (encoder-decoder) que elimina la necesidad de NMS. El checkpoint original fue entrenado en el dataset COCO con las 80 clases "thing", aunque la salida de logits usa un esquema disperso de 91 columnas (COCO-91) que incluye un slot de fondo y diez huecos N/A. No se dispone de detalles adicionales sobre el dataset de entrenamiento, el número de tokens o el proceso de alineación, ya que la model card de esta conversión no los proporciona.

La conversión a ONNX se realizó con el exportador oficial de `rfdetr` (tag 1.9.4, commit `9b009fa928d6218320439803d1da01869a85c072`), fijando batch 1, resolución 384×384 y precisión FP32 con opset 17. El grafo resultante se validó re-evaluando COCO val2017 completo (5000 imágenes) tanto con el checkpoint PyTorch original como con el grafo ONNX, obteniendo una concordancia de 0,007 puntos de AP en segmentación. El postprocesado sigue la semántica oficial: sigmoid sobre logits, top-K global sobre las 100×91 puntuaciones, umbral de confianza 0,5 y binarización de máscaras con logit > 0. No se aplica NMS.

## Capacidades

- Segmentación de instancias en tiempo real sobre las 80 clases "thing" de COCO (persona, coche, animal, mobiliario, etc.).
- Detección de objetos con bounding boxes en formato cxcywh normalizado.
- Generación de máscaras de segmentación a resolución 96×96 por consulta, redimensionables al tamaño de imagen original.
- Inferencia en navegador mediante onnxruntime-web con backend WASM (probado en Chromium).
- Inferencia en CPU y GPU a través de ONNX Runtime estándar.
- Postprocesado simple sin NMS, lo que facilita la integración en pipelines ligeros.
- Compatible con el ecosistema ONNX (TensorRT, OpenVINO, etc.) por ser un grafo estándar.

## Casos de uso

- Autoanotación en navegador: el propósito original de AnnotateIt. El modelo se ejecuta localmente en el navegador del usuario con WASM, permitiendo anotar imágenes sin enviar datos a un servidor. Su latencia media en Chromium (p50 de 1499 ms en caliente) es aceptable para flujos de anotación interactivos.
- Segmentación de instancias en aplicaciones web: al ser un grafo ONNX FP32, puede integrarse en herramientas de edición de imágenes online, generando máscaras de objetos en tiempo real sin infraestructura backend.
- Prototipado rápido con ONNX Runtime: los equipos de visión por computador pueden cargar el modelo en Python o C++ con ONNX Runtime y validar pipelines de segmentación sin necesidad de instalar PyTorch.
- Despliegue en edge computing: con 33,7M de parámetros y entrada 384×384, el modelo cabe en dispositivos con pocos recursos. Puede ejecutarse en CPU (la validación reporta AP de segmentación 0,4296 en CPU) o en GPUs modestas.
- Fine-tuning y transferencia: aunque este repo es solo inferencia, el modelo base de Roboflow está diseñado para fine-tuning. Los desarrolladores pueden usar esta conversión como referencia para exportar sus propios checkpoints fine-tuned a ONNX.
- Evaluación de pipelines de segmentación: el repositorio incluye scripts de reproducción y un informe de validación (`validation-report.json`) que permiten verificar la integridad del grafo y comparar métricas entre PyTorch y ONNX.

## Benchmarks y rendimiento

La model card reporta métricas oficiales del modelo base (según Roboflow) y resultados de la conversión evaluados sobre COCO val2017 completo. Es importante señalar que los protocolos de evaluación difieren: las métricas oficiales usan el protocolo de Roboflow, mientras que la validación de la conversión fija `num_select=100` y el preprocesado de despliegue.

| Metrica | Valor |
|---|---|
| COCO mask AP 50:95 (oficial Roboflow) | 43,1 |
| COCO mask AP50 (oficial Roboflow) | 66,2 |
| Latencia (T4, TensorRT 10.4, FP16, batch 1) | 4,4 ms |
| bbox AP (PyTorch CPU, validacion conversion) | 0,5108 |
| segm AP (PyTorch CPU, validacion conversion) | 0,4297 |
| segm AP50 (PyTorch CPU, validacion conversion) | 0,6624 |
| bbox AP (ONNX Runtime CPU, validacion conversion) | 0,5107 |
| segm AP (ONNX Runtime CPU, validacion conversion) | 0,4296 |
| segm AP50 (ONNX Runtime CPU, validacion conversion) | 0,6624 |
| Session init (Chromium, WASM, single thread) | 703 ms |
| First run (Chromium, WASM) | 1628 ms |
| Warm p50 (Chromium, WASM) | 1499 ms |

La concordancia Torch↔ONNX en segmentación es de 0,007 puntos de AP. No se han publicado resultados comparativos con otros modelos de segmentación en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación. Dado el tamaño del grafo (123 MB FP32) y la entrada 384×384, el consumo de VRAM en GPU debería ser inferior a 1 GB, pero no se ha medido oficialmente.
- GPU recomendadas: el dato de latencia oficial (4,4 ms) se obtuvo en una NVIDIA T4 con TensorRT 10.4 y FP16. Cualquier GPU con soporte CUDA y al menos 2 GB de VRAM debería ejecutarlo sin problemas.
- CPU: la validación se realizó en CPU con ONNX Runtime 1.29.0, obteniendo métricas prácticamente idénticas a PyTorch CPU. Es viable en CPUs modernas para inferencia por lotes pequeños.
- Navegador: funciona en Chromium con onnxruntime-web 1.24.3 y backend WASM de un solo hilo. No se ha probado en WKWebView ni WebView2.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), onnxruntime-web (WASM), TensorRT, OpenVINO. No es compatible con vLLM ni llama.cpp al ser un modelo de visión.
- Latencia estimada: 4,4 ms en T4 con TensorRT FP16; 1499 ms p50 en navegador WASM (Chromium, un hilo). En CPU sin especificar, la validación no reporta tiempos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de segmentación de instancias en la información proporcionada. Existe una versión hermana, `AnnotateIt/rfdetr-seg-nano-coco-onnx`, del mismo autor y con el mismo enfoque de conversión, pero no se publican métricas de rendimiento en la información disponible. El modelo base original `Roboflow/rf-detr-seg-small` es el mismo checkpoint, por lo que las métricas oficiales coinciden. Para una comparativa con YOLO11-seg o Mask R-CNN, no hay datos en las fuentes consultadas.

## Limitaciones y advertencias

- Conversión independiente y no oficial: no está respaldada por Roboflow, aunque se realizó con el exportador oficial.
- Preprocesado específico: requiere stretch-resize a 384×384 sin letterbox ni padding, con normalización ImageNet. Usar otro preprocesado degradará el rendimiento.
- Sin NMS: el postprocesado puede producir detecciones duplicadas para una misma instancia, ya que una consulta puede seleccionarse para varias clases.
- Clases COCO-91 dispersas: los índices de clase son nativos de COCO-91 (persona=1, coche=3, etc.) con diez huecos N/A. No deben compactarse a COCO-80 ni desplazarse.
- Rendimiento en navegador limitado: solo se ha validado en Chromium; WKWebView y WebView2 no se han probado. La latencia WASM es alta (p50 de 1499 ms) y no es adecuada para aplicaciones en tiempo real.
- Regresión de cajas no acotada: las coordenadas de los bounding boxes pueden salirse del rango [0,1] y deben recortarse tras la conversión.
- Sin soporte de lenguaje: es un modelo puramente visual, no procesa texto ni instrucciones.
- Licencia Apache-2.0: permite uso comercial, pero al ser una conversión independiente, el aviso de atribución debe mantenerse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnnotateIt/rfdetr-seg-small-coco-onnx
- Modelo base original: https://huggingface.co/Roboflow/rf-detr-seg-small
- Repositorio de Roboflow rf-detr: https://github.com/roboflow/rf-detr
- Versión nano de la misma conversión: https://huggingface.co/AnnotateIt/rfdetr-seg-nano-coco-onnx
