# OpenVINO/efficientnet_v2_m-int8-ov

## Resumen

El modelo `efficientnet_v2_m-int8-ov` es una conversión al formato OpenVINO IR (Intermediate Representation) del clasificador de imágenes EfficientNetV2-M original de torchvision, con los pesos y las activaciones cuantizados a INT8. Lo publica el equipo OpenVINO en Hugging Face y no se trata de un modelo entrenado desde cero, sino de una optimización de despliegue del checkpoint EfficientNetV2-M de PyTorch Vision, pensada para inferencia acelerada sobre hardware Intel (CPU, iGPU, NPU y GPU).

EfficientNetV2 es una familia de redes convolucionales que combina el escalado compuesto de EfficientNet con búsqueda de arquitectura neuronal (NAS) y entrenamiento progresivo. La variante "M" (medium) es un CNN de tamaño medio diseñado para clasificación de imágenes en ImageNet-1k, con un equilibrio entre precisión y coste computacional. La conversión a OpenVINO con cuantización INT8 reduce el tamaño del repositorio a unos 0,3 GB y acelera la inferencia, manteniendo la cabecera de clasificación de 1000 clases.

La relevancia actual de esta ficha es práctica: no es un modelo generativo ni un LLM, sino un artefacto de despliegue para visión por computador en producción. Resulta útil cuando se necesita un clasificador de imágenes rápido y ligero en entornos Intel, con licencia BSD-3-Clause permisiva para uso comercial, y con una API de inferencia estándar (OpenVINO Model API) que simplifica la integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-M (CNN, torchvision) convertida a OpenVINO IR |
| Parametros totales | no disponible (el repo pesa 0,3 GB en INT8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | INT8 (pesos y activaciones, PTQ con `nncf.quantize`) |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | BSD-3-Clause |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`); checkpoint original en PyTorch |

## Arquitectura y entrenamiento

La arquitectura subyacente es EfficientNetV2-M, una red convolucional de la familia EfficientNetV2 publicada por Google Research y reimplementada en torchvision. EfficientNetV2 combina búsqueda de arquitectura (NAS) con entrenamiento progresivo (progressive learning) para mejorar la eficiencia de parámetros y el coste de entrenamiento respecto a EfficientNetV1. La variante M es un modelo de tamaño medio orientado a clasificación de imágenes en ImageNet-1k con 1000 clases.

El artefacto publicado no incluye información sobre el número exacto de parámetros, la composición del dataset de entrenamiento ni detalles de regularización o aumentación de datos. Lo que sí está documentado es el proceso de conversión: exportación del checkpoint torchvision a OpenVINO IR y cuantización post-entrenamiento (PTQ) con `nncf.quantize`, aplicando INT8 tanto a pesos como a activaciones. No hay evidencia de RLHF, DPO ni entrenamiento adicional; es exclusivamente una optimización de despliegue.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet-1k (cabecera estándar de torchvision).
- Inferencia optimizada para hardware Intel mediante OpenVINO Runtime (CPU, iGPU, NPU, GPU).
- Cuantización INT8 de pesos y activaciones, con reducción de tamaño y aceleración respecto al modelo en FP32.
- Integración con OpenVINO Model API (`Model.from_pretrained`) para carga, preprocesado y visualización de resultados.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No incluye visión generativa, detección de objetos, segmentación ni modelos multimodales; es un clasificador puro.

## Casos de uso

- Clasificación de imágenes en pipelines de producción: el modelo recibe una imagen y devuelve las probabilidades de las 1000 clases de ImageNet, útil como etapa de etiquetado automático o filtrado previo en sistemas de gestión de activos digitales.
- Moderación de contenido visual básica: como clasificador genérico puede servir de primera capa para descartar o etiquetar imágenes antes de pasar a modelos más específicos, con la ventaja de la baja latencia en INT8.
- Despliegue en edge con hardware Intel: gracias a la conversión OpenVINO IR y la cuantización INT8, encaja en equipos con CPU Intel, iGPU o NPU, reduciendo el consumo y el tamaño del binario (0,3 GB).
- Automatización de catalogación en comercio electrónico: clasificación de fotos de producto en categorías amplias, integrada en un servicio que use OpenVINO Runtime para servir peticiones concurrentes.
- Preprocesado en sistemas de visión industrial: como etapa de clasificación previa para decidir si una imagen requiere inspección más detallada con otro modelo, aprovechando el throughput de INT8.
- Prototipado rápido en investigación: punto de partida reproducible para comparar precisión y latencia de EfficientNetV2-M en FP32 frente a INT8 sobre el mismo hardware Intel, sin necesidad de reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (top-1/top-5 en ImageNet), latencia ni throughput. Cualquier cifra de precisión o speedup INT8 frente a FP32 requeriría medirse empíricamente sobre el hardware objetivo.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio pesa 0,3 GB en INT8; la huella en memoria en inferencia es del orden de cientos de MB, aunque no se dispone de una cifra oficial.
- GPU recomendadas: no hay recomendaciones específicas en la información disponible; el modelo está pensado para el runtime OpenVINO, que cubre CPU Intel, iGPU, NPU y GPU Intel.
- Cabe en GPU consumer: sí en términos de tamaño (modelo CNN de tamaño medio cuantizado), pero la aceleración relevante proviene de OpenVINO sobre hardware Intel, no de CUDA.
- Opciones de despliegue: OpenVINO Runtime, OpenVINO Model API (`openvino-model-api[huggingface]`), y conversión adicional a formatos compatibles con OpenVINO si se requiere.
- Latencia y throughput: no disponibles; dependen del hardware y de la resolución de entrada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| efficientnet_v2_m-int8-ov | EfficientNetV2-M (CNN) | no disponible | no aplica | BSD-3-Clause | OpenVINO IR INT8 |
| efficientnet_v2_l-int8-ov | EfficientNetV2-L (CNN) | no disponible | no aplica | BSD-3-Clause | OpenVINO IR INT8 |
| efficientnet_v2_m (torchvision, FP32) | EfficientNetV2-M (CNN) | no disponible | no aplica | BSD-3-Clause | PyTorch |

La comparación directa con alternativas de la misma categoría (por ejemplo, ResNet-50 o ConvNeXt-Tiny en formato OpenVINO) no está documentada en la información proporcionada; los datos de precisión y latencia comparativos no están disponibles.

## Limitaciones y advertencias

- Modelo de clasificación de imágenes exclusivamente; no genera texto ni soporta tareas de lenguaje, tool calling o agentes.
- La cuantización INT8 puede introducir una pérdida de precisión respecto al checkpoint FP32 original; la model card no cuantifica esa degradación.
- No se documentan sesgos del dataset de entrenamiento (ImageNet-1k) en esta ficha; se remite a la implementación original de torchvision.
- Riesgo de clasificación errónea en clases no representadas o en imágenes fuera de la distribución de ImageNet.
- Dependencia del runtime OpenVINO (versión 2026.1.0 o superior) y de Model API 0.4.0 o superior; no es directamente utilizable con PyTorch, TensorFlow o CUDA sin conversión.
- Licencia BSD-3-Clause permisiva para uso comercial, con obligación de conservar el aviso de copyright y la cláusula de exención de responsabilidad.
- No hay información sobre el número de parámetros ni sobre el proceso de entrenamiento original en la model card; para decisiones de producción conviene consultar la documentación de torchvision.

## Enlaces

- Hugging Face: https://huggingface.co/OpenVINO/efficientnet_v2_m-int8-ov
- README del repositorio: https://huggingface.co/OpenVINO/efficientnet_v2_m-int8-ov/blob/main/README.md
- Modelo original en torchvision: https://docs.pytorch.org/vision/main/models/generated/torchvision.models.efficientnet_v2_m.html
- Repositorio torchvision: https://github.com/pytorch/vision
- Documentación OpenVINO: https://docs.openvino.ai/
- Repositorio OpenVINO: https://github.com/openvinotoolkit/openvino
- Guía de cuantización post-entrenamiento: https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/quantizing-models-post-training.html
- Formato OpenVINO IR: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- OpenVINO Model API: https://github.com/open-edge-platform/model_api
- Documentación Model API: https://open-edge-platform.github.io/model_api/latest/
- Modelo similar: https://huggingface.co/OpenVINO/efficientnet_v2_l-int8-ov
- Intel Distribution of OpenVINO Toolkit: https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html
