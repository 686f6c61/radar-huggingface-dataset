# OpenVINO/efficientnet_v2_l-int8-ov

## Resumen

`efficientnet_v2_l-int8-ov` es la conversión al formato OpenVINO IR con cuantización INT8 del modelo de clasificación de imágenes EfficientNetV2-L, originalmente publicado en torchvision. Lo mantiene el equipo OpenVINO (Intel) y su propósito no es otro que ofrecer una versión optimizada para inferencia de baja latencia sobre hardware Intel (CPU, iGPU, NPU y aceleradores), manteniendo el pipeline de clasificación de torchvision.

El modelo resuelve el problema de desplegar un clasificador de imágenes de alta precisión en entornos de producción donde el coste computacional importa. EfficientNetV2-L es la variante grande de la familia EfficientNetV2, una arquitectura CNN con búsqueda neural de arquitectura (NAS) y entrenamiento con técnicas de escalado progresivo. La conversión a OpenVINO IR con cuantización Post-Training Quantization (PTQ) reduce el peso del repositorio a unos 0,8 GB y permite ejecución INT8 tanto en pesos como en activaciones.

Es relevante ahora porque Intel está empujando OpenVINO 2026.x como toolkit de despliegue unificado para cloud, AI PCs y edge, y este modelo es un ejemplo práctico de cómo reutilizar un clasificador de referencia de torchvision con cuantización lista para producción. No es un modelo generativo ni un LLM: es un clasificador de imágenes ImageNet-style, y debe evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-L (CNN con NAS y escalado progresivo), convertida a OpenVINO IR |
| Parametros totales | no disponible (el repositorio ocupa 0,8 GB en INT8; el modelo original en FP32 ronda los 480 M de parametros, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no texto) |
| Tipos de cuantizacion | INT8 en pesos y activaciones (PTQ con `nncf.quantize`) |
| Idiomas soportados | no disponible (clasificacion de imagenes; las etiquetas de salida dependen del dataset de entrenamiento, tipicamente ImageNet en ingles) |
| Licencia | BSD-3-Clause |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`); compatible con OpenVINO >= 2026.1.0 y Model API >= 0.4.0 |

## Arquitectura y entrenamiento

EfficientNetV2-L es una red neuronal convolucional diseñada mediante Neural Architecture Search y entrenada con un esquema de escalado progresivo que ajusta la resolución de imagen y la regularización a lo largo del entrenamiento. La variante "L" es la de mayor capacidad de la familia EfficientNetV2 y está pensada para obtener la máxima precisión en clasificación de imágenes a costa de un mayor coste computacional que las variantes B0-B3.

Esta ficha concreta no incluye información sobre el dataset de entrenamiento original, el número de tokens (no aplica) ni detalles de fine-tuning. La model card solo documenta el proceso de conversión: cuantización Post-Training Quantization (PTQ) con `nncf.quantize`, precisión INT8 en pesos y activaciones, y compatibilidad con OpenVINO 2026.1.0 o superior. No se especifica si hubo calibración con un dataset concreto ni el número de muestras de calibración empleadas.

## Capacidades

- Clasificación de imágenes en un conjunto cerrado de clases (típicamente las 1000 clases de ImageNet, aunque la model card no lo confirma explícitamente).
- Inferencia optimizada en INT8 sobre hardware Intel mediante OpenVINO Runtime.
- Integración con Model API de OpenVINO para carga, preprocesado, inferencia y visualización en pocas líneas de código.
- Compatible con el pipeline `image-classification` de Hugging Face.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni vídeo.
- No es un modelo multilingüe en el sentido de NLP; las etiquetas de salida son las del dataset de entrenamiento original.

## Casos de uso

- Clasificación de imágenes en producción sobre CPU Intel: el modelo en INT8 permite ejecutar inferencia de un clasificador grande sin GPU dedicada, aprovechando las optimizaciones de OpenVINO para CPU, iGPU y NPU.
- Preetiquetado de datasets de visión: usar el clasificador para generar etiquetas preliminares sobre grandes volúmenes de imágenes y reducir el trabajo de anotación manual, con revisión humana posterior.
- Moderación de contenido visual en pipelines de ingestión: clasificar imágenes entrantes en categorías predefinidas antes de pasarlas a un modelo más caro o a revisión humana.
- Enrutamiento en sistemas de búsqueda visual: usar la clasificación de clase como señal previa para decidir qué índice o modelo especializado consultar después.
- Aplicaciones de edge y AI PCs: desplegar el modelo en dispositivos con NPU o iGPU Intel para tareas de visión en tiempo real (inspección, retail, robótica) donde no hay GPU dedicada.
- Benchmarking y validación de pipelines OpenVINO: servir como referencia de precisión y latencia al comparar configuraciones de cuantización, versiones de runtime o hardware Intel.
- Prototipado rápido con Model API: validar un flujo completo de clasificación (carga, preprocesado, inferencia, visualización) en pocas líneas antes de invertir en un modelo a medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (top-1, top-5), latencia ni throughput para esta conversión INT8, ni comparación con el modelo original en FP32.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,8 GB en INT8; el consumo en memoria en tiempo de ejecución depende del backend y del tamaño de batch.
- GPU recomendadas: no se especifican en la model card. OpenVINO está optimizado para hardware Intel (CPU, iGPU, NPU, aceleradores); también puede ejecutarse en GPU discretas Intel.
- Compatibilidad con GPU de consumo: no confirmada para NVIDIA/AMD en esta ficha; el ecosistema objetivo es Intel.
- Opciones de despliegue: OpenVINO Runtime (>= 2026.1.0) y OpenVINO Model API (>= 0.4.0). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de visión de este tipo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| efficientnet_v2_l-int8-ov (este) | no disponible (repo 0,8 GB INT8) | no aplica | OpenVINO IR INT8 | BSD-3-Clause | Hugging Face (OpenVINO) |
| efficientnet_v2_l (torchvision, FP32) | no disponible en la informacion | no aplica | PyTorch | BSD-3-Clause | torchvision / PyTorch Hub |
| Otras variantes EfficientNetV2 (B0-B3, S, M) | no disponible | no aplica | PyTorch / OpenVINO | BSD-3-Clause | torchvision / OpenVINO |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un clasificador de imágenes de conjunto cerrado; no genera texto ni responde a instrucciones en lenguaje natural.
- La cuantización INT8 puede introducir una pérdida de precisión respecto al modelo FP32 original; no se documenta la magnitud de esa pérdida.
- No se especifica el dataset de calibración usado en la PTQ, lo que dificulta evaluar el sesgo de cuantización en dominios distintos de ImageNet.
- Las clases de salida dependen del dataset de entrenamiento original; si se usa fuera de ese dominio, las etiquetas pueden ser irrelevantes.
- Sesgos conocidos: heredados del dataset de entrenamiento original (no documentados en esta ficha).
- Riesgo de alucinación: no aplica en el sentido de LLM, pero sí puede producir clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- Licencia BSD-3-Clause: permite uso comercial con atribución y sin endoso; conviene revisar los términos del modelo original en torchvision.
- Requiere OpenVINO >= 2026.1.0 y Model API >= 0.4.0; versiones anteriores no son compatibles.
- La model card remite a la implementación original de torchvision para limitaciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenVINO/efficientnet_v2_l-int8-ov
- Árbol de archivos: https://huggingface.co/OpenVINO/efficientnet_v2_l-int8-ov/tree/main
- Modelo original en torchvision: https://docs.pytorch.org/vision/main/models/generated/torchvision.models.efficientnet_v2_l.html
- Repositorio torchvision: https://github.com/pytorch/vision
- Documentación de OpenVINO: https://docs.openvino.ai/
- Repositorio OpenVINO: https://github.com/openvinotoolkit/openvino
- Formato OpenVINO IR: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Guía de cuantización PTQ: https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/quantizing-models-post-training.html
- OpenVINO Model API: https://github.com/open-edge-platform/model_api
- Documentación de Model API: https://open-edge-platform.github.io/model_api/latest/
- Intel Distribution of OpenVINO Toolkit: https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html
- Licencia BSD-3-Clause: https://spdx.org/licenses/BSD-3-Clause.html
