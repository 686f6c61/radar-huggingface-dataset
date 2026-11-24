# OpenVINO/rfdetr_small-int8-ov

## Resumen

`rfdetr_small-int8-ov` es una versión optimizada del modelo de detección de objetos RF-DETR Small, publicada por la organización OpenVINO en Hugging Face. Se trata de la conversión del modelo original de Roboflow (RF-DETR Small) al formato Intermediate Representation (IR) de OpenVINO, con los pesos y las activaciones comprimidos a INT8 mediante cuantización post-entrenamiento (PTQ) con NNCF. La versión distribuida en este repositorio ha sido generada por Geti, la plataforma de Intel para el ciclo de vida de modelos de visión.

El modelo resuelve la tarea de detección de objetos en imágenes (object detection) y está pensado para despliegue en producción sobre hardware Intel: CPU, iGPU, NPU y aceleradores, aprovechando las optimizaciones de inferencia de OpenVINO. Al estar cuantizado a INT8, reduce el espacio en disco (el repositorio ocupa unos 0,1 GB) y acelera la inferencia respecto a los pesos en FP32, a costa de una posible pérdida menor de precisión.

Es relevante ahora porque encaja en flujos de trabajo de edge computing y AI PCs, donde el rendimiento y el consumo importan, y porque la licencia Apache-2.0 del modelo original permite uso comercial. La información pública disponible sobre esta conversión concreta es limitada: la model card remite a la documentación del modelo original para detalles de arquitectura y limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (transformer de detección de objetos, variante Small); convertido a OpenVINO IR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | INT8 en pesos y activaciones (PTQ con NNCF) |
| Idiomas soportados | no disponible (no aplica, tarea de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (compatible con OpenVINO 2026.1.0+ y Model API 0.4.0+) |

## Arquitectura y entrenamiento

RF-DETR es un detector basado en transformer (DETR, DEtection TRansformer) desarrollado por Roboflow, que combina un backbone de extracción de características con un decoder transformer para predecir bounding boxes y clases directamente, sin necesidad de anchors ni de supresión no máxima (NMS) en el pipeline clásico. La variante Small reduce el cómputo respecto a las variantes mayores del mismo family. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un detector).

La conversión realizada por OpenVINO/Geti aplica cuantización post-entrenamiento (PTQ) con `nncf.quantize`, comprimiendo pesos y activaciones a INT8. No se ha realizado un fine-tuning específico sobre este repositorio: la model card indica que, para adaptar el modelo a un dataset propio, debe usarse Geti para anotar, hacer fine-tuning y exportar el modelo resultante. La innovación principal de esta versión es, por tanto, la optimización para inferencia en hardware Intel mediante OpenVINO IR, no cambios arquitectónicos sobre el modelo original.

## Capacidades

- Detección de objetos en imágenes: predicción de bounding boxes y clases sobre imágenes de entrada.
- Inferencia optimizada en hardware Intel (CPU, iGPU, NPU) gracias al formato OpenVINO IR y a la cuantización INT8.
- Integración con Model API de OpenVINO para carga, inferencia y visualización de resultados con pocas líneas de código.
- Compatibilidad con flujos de fine-tuning mediante Geti sobre datasets personalizados.
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües: es un modelo puramente de visión.
- No dispone de modo thinking, visión aumentada, audio ni otras capacidades multimodales más allá de la detección de objetos.

## Casos de uso

- Detección de objetos en tiempo real en edge devices: el modelo INT8 en formato OpenVINO puede desplegarse en dispositivos con CPU Intel o NPU, reduciendo latencia y consumo frente a la versión FP32, lo que lo hace adecuado para cámaras inteligentes y sistemas embebidos.
- Control de calidad en líneas de producción: detección de defectos o piezas en imágenes industriales, con inferencia local sobre AI PCs o gateways industriales con OpenVINO.
- Vigilancia y análisis de vídeo: detección de personas u objetos en streams de vídeo, integrándose en pipelines de OpenVINO para procesar fotogramas con throughput elevado en CPU.
- Automatización de inventario y logística: detección de productos o paquetes en imágenes de almacén, con fine-tuning previo mediante Geti sobre el catálogo propio.
- Aplicaciones de retail y análisis de estanterías: detección de productos en lineales o cámaras de tienda, aprovechando la licencia Apache-2.0 para uso comercial.
- Prototipado rápido de sistemas de visión: uso de Model API para cargar el modelo, ejecutar inferencia y visualizar resultados en pocas líneas, ideal para validar casos de uso antes de invertir en fine-tuning.
- Fine-tuning con datos propios: punto de partida para adaptar el detector a dominios específicos (médico, agrícola, industrial) mediante la plataforma Geti y exportación posterior a OpenVINO IR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un modelo pequeño que puede ejecutarse en memoria compartida de CPU/NPU sin GPU dedicada.
- GPU recomendadas: no disponible en la información proporcionada; el modelo está optimizado para hardware Intel (CPU, iGPU, NPU) mediante OpenVINO, no específicamente para GPUs NVIDIA.
- ¿Cabe en consumer GPU? No hay datos específicos; por tamaño (0,1 GB de repositorio) es plausible que quepa en GPUs de consumo, pero no se confirma en la información disponible.
- Opciones de despliegue: OpenVINO Runtime (versión 2026.1.0 o superior) y Model API 0.4.0 o superior; instalación mediante `pip install openvino-model-api[huggingface]`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rfdetr_small-int8-ov | no disponible | no aplica (visión) | OpenVINO IR INT8 | Apache-2.0 | Hugging Face (OpenVINO) |
| RF-DETR Small (original) | no disponible | no aplica (visión) | pesos originales (PyTorch) | Apache-2.0 | GitHub Roboflow |
| Otras variantes RF-DETR (Medium/Large) | no disponible | no aplica (visión) | pesos originales | Apache-2.0 | GitHub Roboflow |

No se dispone de datos de benchmarks ni de parámetros para establecer una comparación cuantitativa con alternativas como YOLO u otros detectores DETR; la comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card remite a la documentación del modelo original (Roboflow RF-DETR) para las limitaciones; no se detallan sesgos específicos en la información disponible.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de falsos positivos y falsos negativos en la detección, inherente a cualquier detector.
- La cuantización INT8 puede introducir una pérdida de precisión respecto al modelo original en FP32; no se han publicado métricas de degradación en la información disponible.
- Limitaciones de idioma: no aplica; es un modelo de visión sin capacidades lingüísticas.
- Licencia Apache-2.0: permite uso comercial, pero debe verificarse la documentación del modelo original para condiciones adicionales.
- Requiere OpenVINO 2026.1.0+ y Model API 0.4.0+; versiones anteriores no son compatibles.
- Para uso en dominios específicos se recomienda fine-tuning con Geti; el modelo tal cual está entrenado sobre el dataset original de Roboflow.
- El modelo no incluye capacidades de texto, agentes ni tool calling; no debe evaluarse como un LLM.

## Enlaces

- Hugging Face: https://huggingface.co/OpenVINO/rfdetr_small-int8-ov
- Modelo original RF-DETR (Roboflow): https://github.com/roboflow/rf-detr
- Geti (Intel): https://github.com/open-edge-platform/geti
- OpenVINO IR format: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Guía de cuantización post-entrenamiento de OpenVINO: https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/quantizing-models-post-training.html
- Model API: https://github.com/open-edge-platform/model_api
- Documentación de Model API: https://open-edge-platform.github.io/model_api/latest/
- OpenVINO documentation: https://docs.openvino.ai/
- Instalación de OpenVINO: https://docs.openvino.ai/install
- Intel Distribution of OpenVINO Toolkit: https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html
- OpenVINO en Wikipedia: https://en.wikipedia.org/wiki/OpenVINO
- Organización OpenVINO en Hugging Face: https://huggingface.co/OpenVINO
- Licencia del modelo original: https://roboflow.com/licensing
