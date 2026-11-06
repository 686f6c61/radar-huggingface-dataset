# OpenVINO/mobilenet_v3_small-int8-ov

## Resumen

`OpenVINO/mobilenet_v3_small-int8-ov` es una versión optimizada del clasificador de imágenes MobileNetV3-Small, originalmente implementado en torchvision, convertido al formato Intermediate Representation (IR) de OpenVINO y cuantizado a INT8 tanto en pesos como en activaciones. Lo publica el equipo de OpenVINO (Intel) y su propósito no es otro que ofrecer una variante de inferencia de baja latencia y bajo consumo de recursos para despliegues en CPU, iGPU y dispositivos edge compatibles con el runtime de OpenVINO.

El modelo resuelve el problema de ejecutar clasificación de imágenes de 224x224 píxeles sobre las 1.000 clases de ImageNet en hardware modesto, manteniendo la arquitectura MobileNetV3-Small (bloques depthwise separable con atención squeeze-and-excitation y activaciones h-swish). Al estar pre-cuantizado con NNCF en modo Post-Training Quantization, no requiere un paso adicional de calibración por parte del usuario.

Es relevante ahora porque encaja en pipelines de visión por computador en producción sobre AI PCs, dispositivos Intel NUC, cámaras inteligentes y sistemas embebidos donde no hay GPU dedicada, y porque el formato IR de OpenVINO se integra con Model API, Optimum Intel y el backend de OpenVINO para vLLM en despliegues más amplios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Small (CNN con bloques depthwise separable, squeeze-and-excitation y h-swish) |
| Parametros totales | no disponible (no declarado en la model card; el original MobileNetV3-Small ronda los 2,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224x224 píxeles) |
| Tipos de cuantizacion | INT8 en pesos y activaciones (PTQ con NNCF) |
| Idiomas soportados | no disponible (no aplica; clasificación de imágenes) |
| Licencia | BSD-3-Clause |
| Formato de pesos | OpenVINO IR (comprimido a INT8) |

## Arquitectura y entrenamiento

La arquitectura subyacente es MobileNetV3-Small, una red convolucional diseñada mediante búsqueda de arquitectura (NAS) combinada con NetAdapt, orientada a recursos limitados. Incorpora bloques con convoluciones depthwise separables, módulos de atención squeeze-and-excitation en determinadas etapas y funciones de activación h-swish, lo que reduce el coste computacional frente a CNN clásicas.

El entrenamiento original corresponde a torchvision sobre ImageNet-1k (1.000 clases, 224x224). Esta ficha no dispone de información sobre el número exacto de épocas, composición del dataset ni técnicas de regularización empleadas en el entrenamiento original. La innovación técnica de esta variante es la conversión a OpenVINO IR y la compresión INT8 mediante `nncf.quantize` con Post-Training Quantization, aplicada tanto a pesos como a activaciones, sin necesidad de reentrenamiento. La model card no detalla el conjunto de calibración utilizado ni el número de muestras.

## Capacidades

- Clasificación de imágenes en 1.000 categorías de ImageNet a resolución 224x224.
- Inferencia en CPU, iGPU y dispositivos edge compatibles con OpenVINO 2026.1.0 o superior.
- Integración con Model API 0.4.0 o superior para carga y ejecución estandarizadas.
- Visualización de resultados mediante `model_api.visualizer.Visualizer`.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente perceptivo.
- No dispone de capacidades multilingües, generación de texto, código, matemáticas, visión generativa, audio ni modo "thinking".
- No es un modelo de agentes ni de conversación.

## Casos de uso

- Clasificación de imágenes en tiempo real en AI PCs y mini-PCs con CPU Intel: el modelo se ejecuta sobre el runtime de OpenVINO con compresión INT8, lo que permite procesar fotogramas de cámara web de forma continua sin GPU dedicada.
- Pre-filtrado en pipelines de visión industrial: usar la clasificación de 1.000 clases como etapa rápida de descarte antes de modelos más pesados (detección o segmentación), reduciendo el coste computacional global.
- Moderación de contenido básica en dispositivos edge: clasificar imágenes entrantes en categorías genéricas para activar revisiones posteriores o bloqueos preliminares en pasarelas IoT.
- Etiquetado automático de imágenes en herramientas de gestión documental o fototecas: generar metadatos de categoría ImageNet para indexación y búsqueda.
- Prototipado rápido de aplicaciones de visión: al cargarse con `Model.from_pretrained` desde Hugging Face y ejecutarse con pocas líneas de código, sirve para validar ideas antes de invertir en modelos mayores.
- Benchmarking de hardware y comparativas de rendimiento: al ser una variante INT8 con formato IR, es útil para medir latencia y throughput de CPUs, iGPUs y NPUs en pruebas de aceptación de plataformas.
- Despliegue en cámaras inteligentes y sistemas embebidos: el bajo consumo de recursos del MobileNetV3-Small permite ejecutarlo en dispositivos con memoria y cómputo restringidos compatibles con OpenVINO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo INT8 de muy pequeño tamaño, el consumo de memoria es mínimo y se ejecuta principalmente en CPU o iGPU.
- GPU recomendadas: no aplica una recomendación específica; el modelo está pensado para CPU Intel, iGPU (Intel Iris Xe, Arc integrada) y NPUs compatibles con OpenVINO. En GPUs dedicadas puede ejecutarse mediante el plugin correspondiente de OpenVINO, pero no se documentan cifras.
- Cabe en cualquier consumer GPU y en la mayoría de dispositivos edge; el cuello de botella no es la memoria sino el soporte del runtime.
- Opciones de despliegue: OpenVINO Runtime (versión 2026.1.0 o superior), Model API (0.4.0 o superior), Optimum Intel, y potencialmente el backend de OpenVINO para vLLM en pipelines más amplios.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| OpenVINO/mobilenet_v3_small-int8-ov | no disponible (≈2,5 M en el original) | 224x224 | INT8 (PTQ) | BSD-3-Clause | OpenVINO IR |
| mobilenet-v3-small-1.0-224-tf (Open Model Zoo) | no disponible | 224x224 | FP32/FP16 según variante | Apache 2.0 (según repo) | TF / OpenVINO IR |
| MobileNetV3-Small original (torchvision) | ≈2,5 M | 224x224 | FP32 | BSD-3-Clause | PyTorch (.pth) |
| Otras variantes INT8 de clasificadores ligeros en OpenVINO | no disponible | 224x224 | INT8 | variable | OpenVINO IR |

La comparativa se limita a variantes del mismo modelo o de la misma familia; no se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre ImageNet-1k; su vocabulario de clases es fijo (1.000 categorías) y no cubre categorías fuera de ese conjunto.
- Riesgo de sesgo heredado del dataset ImageNet, con posibles desequilibrios por clase y sesgos demográficos o culturales en las predicciones.
- La cuantización INT8 puede introducir una ligera degradación de precisión frente al modelo original en FP32; la model card no cuantifica esa pérdida.
- No es un modelo generativo ni conversacional; no debe esperarse razonamiento, texto, código ni capacidades de agente.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda revisar los términos del modelo original en torchvision y del dataset ImageNet para usos concretos.
- Requiere OpenVINO 2026.1.0 o superior y Model API 0.4.0 o superior; versiones anteriores pueden no cargar el modelo correctamente.
- La model card remite a la implementación original para limitaciones adicionales y no documenta el conjunto de calibración ni métricas de precisión tras la cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenVINO/mobilenet_v3_small-int8-ov
- Modelo original en torchvision: https://docs.pytorch.org/vision/main/models/generated/torchvision.models.mobilenet_v3_small.html#torchvision.models.mobilenet_v3_small
- Repositorio torchvision: https://github.com/pytorch/vision
- Documentación del formato OpenVINO IR: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Guía de cuantización post-entrenamiento de OpenVINO: https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/quantizing-models-post-training.html
- Repositorio OpenVINO: https://github.com/openvinotoolkit/openvino
- Documentación de OpenVINO: https://docs.openvino.ai/
- Open Model Zoo (variante TF del modelo): https://github.com/openvinotoolkit/open_model_zoo/blob/master/models/public/mobilenet-v3-small-1.0-224-tf/README.md
- Model API: https://github.com/open-edge-platform/model_api
- Documentación de Model API: https://open-edge-platform.github.io/model_api/latest/
- Intel Distribution of OpenVINO Toolkit: https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html
- Licencia BSD-3-Clause: https://spdx.org/licenses/BSD-3-Clause.html
