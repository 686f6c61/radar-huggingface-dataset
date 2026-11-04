# OpenVINO/rfdetr_seg_small-int8-ov

## Resumen

RF-DETR Segmentation Small INT8 OV es la conversión al formato OpenVINO IR, con pesos comprimidos a INT8, del modelo RF-DETR Segmentation Small desarrollado originalmente por Roboflow. La versión publicada en HuggingFace la mantiene el equipo de OpenVINO (Intel) a partir del trabajo de Geti, la plataforma de visión artificial de Intel para anotación y ajuste fino de modelos. No es un modelo de lenguaje: es un modelo de segmentación de instancias (instance segmentation) para imágenes, basado en la arquitectura DETR (Detection Transformer) con cabecera de segmentación.

El modelo resuelve el problema de detectar y segmentar instancias individuales en imágenes, devolviendo máscaras por objeto junto con sus cajas delimitadoras y etiquetas de clase. Su relevancia radica en que ofrece una variante DETR de tamano "small" optimizada para despliegue en CPU, GPU y NPU de Intel mediante OpenVINO, con cuantización post-entrenamiento a INT8 que reduce el peso del repositorio a aproximadamente 0,1 GB. Esto lo hace adecuado para inferencia en el edge y en equipos sin GPU dedicada.

La ficha se centra en la variante INT8 para OpenVINO; los detalles de entrenamiento, composición del dataset y métricas de precisión del modelo original no se detallan en la información disponible y deben consultarse en el repositorio de Roboflow.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DETR (Detection Transformer) con cabecera de segmentación de instancias (RF-DETR Segmentation Small) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | INT8 para pesos y activaciones (PTQ con nncf.quantize); el modelo original admite otras precisiones no detalladas |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (compatible con OpenVINO 2026.1.0+ y Model API 0.4.0+) |

## Arquitectura y entrenamiento

RF-DETR es una familia de detectores basados en transformer (DETR) desarrollada por Roboflow. La variante Segmentation anade una cabecera que produce máscaras de instancia además de las cajas y clases, siguiendo el paradigma set-prediction de DETR: el modelo predice directamente un conjunto de objetos sin necesidad de anchors ni de supresión no máxima (NMS) posterior en el pipeline clasico. El tamano "small" indica una variante compacta de la familia, pensada para un equilibrio entre precision y coste computacional.

La versión publicada aqui no incluye reentrenamiento: es una conversión del modelo original de Roboflow a OpenVINO IR con compresión de pesos mediante cuantización post-entrenamiento (PTQ) usando `nncf.quantize`, con precision INT8 tanto en pesos como en activaciones. No se dispone en la información proporcionada de detalles sobre el número de tokens/imágenes de entrenamiento, la composición del dataset (se presume COCO u otro dataset de segmentación estandar, no confirmado) ni sobre el uso de técnicas de alineación. Tampoco se detallan innovaciones como decodificación especulativa, ya que no aplica a este tipo de modelo.

## Capacidades

- Segmentación de instancias en imágenes: devuelve máscaras por objeto, cajas delimitadoras y etiquetas de clase.
- Detección de objetos multiple en una misma imagen (paradigma set-prediction de DETR).
- Inferencia optimizada para hardware Intel (CPU, GPU integrada, NPU) mediante OpenVINO.
- Ejecución en el edge gracias al reducido tamano del modelo cuantizado (repo de ~0,1 GB).
- Integración con la Model API de OpenVINO para carga, inferencia y visualización de resultados en pocas líneas de código.
- Ajuste fino con datasets personalizados a través de la plataforma Geti (anotación, entrenamiento y exportación).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Control de calidad industrial: inspección de piezas en línea de producción para detectar y segmentar defectos, ejecutando el modelo en CPUs o NPUs Intel junto a la cámara sin necesidad de GPU dedicada.
- Videovigilancia y analítica de escenas: segmentación de personas, vehículos y objetos en flujos de vídeo en dispositivos edge, aprovechando la cuantización INT8 para mantener latencia baja en hardware de bajo consumo.
- Robótica y manipulación: segmentación de objetos sobre la mesa de trabajo para guiar pinzas o brazos robóticos, con el modelo desplegado a bordo en un mini-PC con CPU Intel.
- Agricultura de precisión: segmentación de frutos, hojas o malas hierbas en imágenes de dron o tractor, usando el modelo ajustado con Geti sobre un dataset propio del cultivo.
- Análisis de imágenes médicas o científicas (con validación adecuada): segmentación de estructuras en imágenes donde se requiera separar instancias individuales, previo ajuste fino con datos anotados.
- Automatización de inventario y logística: conteo y localización de paquetes o productos en imágenes de almacén, integrado en un pipeline de OpenVINO Model API.
- Prototipado rápido en visión artificial: base preentrenada para ajustar con Geti y exportar a OpenVINO IR, reduciendo el tiempo desde la anotación hasta el despliegue en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de mAP, máscaras ni latencia, y remite a la documentación del modelo original de Roboflow para más detalles.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa ~0,1 GB, por lo que la huella en memoria es muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; al ser un modelo OpenVINO INT8, el objetivo principal son CPU, GPU integrada y NPU de Intel. Puede ejecutarse también en GPUs dedicadas mediante el plugin correspondiente de OpenVINO.
- Cabe en GPU consumer: sí, con amplio margen, dado el reducido tamano del modelo.
- Opciones de despliegue: OpenVINO Runtime (2026.1.0+) y OpenVINO Model API (0.4.0+); no se menciona soporte nativo para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| RF-DETR Segmentation Small INT8 OV (este) | DETR + segmentación | no disponible | no aplica | Apache-2.0 | OpenVINO IR INT8 | Optimizado para Intel CPU/GPU/NPU |
| RF-DETR Segmentation Small (original) | DETR + segmentación | no disponible | no aplica | Apache-2.0 | PyTorch | Modelo base sin cuantizar de Roboflow |
| Mask R-CNN (referencia clasica) | Detección + segmentación | no disponible | no aplica | Varía (a menudo Apache/MIT) | PyTorch/ONNX | Requiere NMS; no es DETR |
| YOLOv8-seg (referencia) | Detección + segmentación | varía por tamano | no aplica | AGPL-3.0 (Ultralytics) | PyTorch/ONNX/OpenVINO | Alternativa popular; licencia mas restrictiva para uso comercial |

La comparación cuantitativa de precisión y latencia entre estas alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Al ser una conversión cuantizada a INT8, puede existir una pérdida de precisión respecto al modelo original en FP32; no se documenta la magnitud de esa perdida.
- Las limitaciones del modelo original (clases del dataset de entrenamiento, sesgos visuales, condiciones de iluminación, oclusiones, etc.) se heredan y deben consultarse en la documentación de Roboflow.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni razonamiento multi-paso.
- El modelo base está entrenado sobre un dataset concreto (no detallado en la información disponible); para dominios específicos requiere ajuste fino con Geti u otra herramienta.
- Riesgo de falsos positivos y negativos en escenas muy distintas a las de entrenamiento; validar antes de usar en producción crítica.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar los términos del modelo original y de las dependencias (OpenVINO, Model API) antes de desplegar.
- Compatibilidad restringida a OpenVINO 2026.1.0+ y Model API 0.4.0+; versiones anteriores pueden no cargar el IR correctamente.

## Enlaces

- HuggingFace: https://huggingface.co/OpenVINO/rfdetr_seg_small-int8-ov
- Modelo original RF-DETR (Roboflow): https://github.com/roboflow/rf-detr
- Geti (Intel): https://github.com/open-edge-platform/geti
- OpenVINO Model API: https://github.com/open-edge-platform/model_api
- Documentación OpenVINO Model API: https://open-edge-platform.github.io/model_api/latest/
- Documentación OpenVINO IR: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Guía de cuantización OpenVINO: https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/quantizing-models-post-training.html
- Repositorio OpenVINO: https://github.com/openvinotoolkit/openvino
- Documentación OpenVINO: https://docs.openvino.ai/
- Toolkit OpenVINO (Intel): https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html
- Licencia original: https://roboflow.com/licensing
