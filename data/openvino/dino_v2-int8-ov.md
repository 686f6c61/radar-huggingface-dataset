# OpenVINO/dino_v2-int8-ov

## Resumen

DINOv2 int8-ov es la version cuantizada a INT8 y convertida al formato Intermediate Representation (IR) de OpenVINO del modelo de clasificación de imágenes basado en DINOv2 ViT-S/14, distribuido por el equipo OpenVINO de Intel a partir del checkpoint original de `timm` (`vit_small_patch14_dinov2.lvd142m`). No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: los pesos originales de DINOv2 se comprimen mediante cuantización post-entrenamiento (PTQ) con NNCF para reducir el coste computacional y de memoria en inferencia sobre hardware Intel (CPU, GPU integrada, NPU).

El modelo original DINOv2 es un Vision Transformer de tipo "small" con parches de 14x14 píxeles, entrenado por Meta AI mediante aprendizaje autosupervisado (self-distillation con teacher-student) sobre un corpus de imágenes sin etiquetar a gran escala. Sus representaciones se usan como backbone para clasificación, detección, segmentación y recuperación de imágenes. La versión que nos ocupa está adaptada por Geti (plataforma de Intel para visión artificial en el edge) para tareas de clasificación de imágenes, y se distribuye bajo licencia Apache-2.0.

Su relevancia actual radica en que permite desplegar un backbone de visión moderno en entornos de borde y PC con aceleración Intel sin necesidad de GPU dedicada, manteniendo un formato estandarizado (OpenVINO IR) compatible con OpenVINO 2026.1.0 o superior y con la Model API 0.4.0 o superior. El repositorio tiene un tamaño de 0.0 GB reportado y un volumen de descargas muy bajo (32), lo que sugiere un uso incipiente y orientado a pipelines internos de Geti/OpenVINO más que a consumo masivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-S/14) basado en DINOv2, adaptado a clasificación de imágenes |
| Parametros totales | no disponible (el checkpoint original es ViT-Small, ~22 M de parámetros; el fabricante no lo explicita en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; resolución de entrada no especificada en la card, el checkpoint original usa 518x518) |
| Tipos de cuantizacion | INT8 para pesos y activaciones (PTQ con NNCF) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un Vision Transformer con parches de 14x14 (ViT-S/14), en la variante DINOv2 entrenada por Meta AI mediante self-distillation con un esquema teacher-student y sin supervisión humana. El modelo original se entrena sobre un dataset curado de imágenes a gran escala (LVD-142M en la publicación original de DINOv2), lo que produce representaciones visuales genéricas de alta calidad transferibles a múltiples tareas. Sobre esta base, Geti ha adaptado la cabeza de clasificación para tareas de image-classification y ha exportado el grafo a OpenVINO IR.

La innovación principal de esta ficha no está en el entrenamiento (que hereda del DINOv2 original), sino en la cadena de despliegue: cuantización post-entrenamiento con `nncf.quantize` a INT8 en pesos y activaciones, y conversión al formato IR de OpenVINO. Esto reduce el tamaño del modelo y acelera la inferencia en CPU/NPU/GPU integrada de Intel, a costa de una posible pérdida de precisión que el fabricante no cuantifica en la model card. No se documentan detalles sobre el dataset de calibración de la cuantización ni sobre el proceso de fine-tuning específico realizado por Geti.

## Capacidades

- Clasificación de imágenes: el pipeline declarado es `image-classification`, por lo que el modelo devuelve etiquetas de clase sobre imágenes de entrada.
- Extracción de características visuales: al derivar de DINOv2, el backbone produce embeddings visuales útiles para tareas posteriores (recuperación, clustering, detección), aunque la card no documenta explícitamente esta interfaz.
- Inferencia acelerada en hardware Intel: soporta CPU, GPU integrada y NPU a través de OpenVINO.
- Integración con Model API: permite cargar el modelo con `Model.from_pretrained` y renderizar resultados con `Visualizer`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo "thinking", visión generativa, audio ni generación de texto.

## Casos de uso

- Clasificación de imágenes en el edge: el modelo puede ejecutarse en dispositivos con CPU Intel o NPU integrada para etiquetar imágenes en tiempo real en cámaras industriales o IoT, gracias a la compresión INT8 y al formato IR optimizado para OpenVINO.
- Control de calidad en líneas de fabricación: integrado en un pipeline de Geti, permite clasificar piezas como defectuosas o correctas en estaciones de inspección visual con hardware Intel de bajo consumo.
- Filtrado y triaje de imágenes en aplicaciones de visión artificial: clasificación previa de imágenes antes de pasarlas a modelos más pesados (detección o segmentación), reduciendo el coste computacional global.
- Clasificación de documentos escaneados o imágenes médicas no críticas: al ser un clasificador genérico, puede reutilizarse tras fine-tuning con datasets específicos mediante la propia plataforma Geti.
- Prototipado rápido en PC con IA: desarrolladores que quieran validar un pipeline de clasificación visual en un portátil con CPU Intel sin GPU dedicada pueden usar este modelo como baseline.
- Despliegue en entornos con requisitos de licencia permisiva: al ser Apache-2.0, puede integrarse en productos comerciales sin obligaciones de copyleft, algo relevante para empresas que distribuyen software propietario.
- Investigación en representaciones visuales: el backbone DINOv2 puede emplearse para extraer embeddings y evaluar técnicas de recuperación o clustering de imágenes en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (top-1, top-5), latencia ni throughput para la versión INT8 frente al checkpoint original en FP32.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al ser un ViT-Small cuantizado a INT8, la huella de memoria es reducida (del orden de decenas de MB), pero el fabricante no publica cifras.
- GPU recomendadas: el modelo está orientado a hardware Intel (CPU, GPU integrada, NPU). No se documentan requisitos para GPU NVIDIA.
- Cabe en consumer GPU: sí, previsiblemente en cualquier GPU con unos pocos GB de VRAM, aunque el objetivo declarado es CPU/NPU Intel.
- Opciones de despliegue: OpenVINO Runtime 2026.1.0 o superior, Model API 0.4.0 o superior, y el paquete `openvino-model-api[huggingface]`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenVINO/dino_v2-int8-ov | ViT-S/14 (~22 M, no confirmado en card) | Resolución de entrada no especificada | OpenVINO IR INT8 | Apache-2.0 | HuggingFace (32 descargas) |
| timm/vit_small_patch14_dinov2.lvd142m | ViT-S/14 (~22 M) | 518x518 (por defecto en timm) | safetensors/PyTorch | Apache-2.0 | HuggingFace (modelo original) |
| Otros backbones ViT-Small (p. ej. DeiT-S, ViT-S/16) | ~22 M | 224x224 típicamente | PyTorch, ONNX | variable | HuggingFace, timm |

La comparativa se limita al ecosistema de backbones ViT-Small; no se dispone de datos de rendimiento comparado para esta variante cuantizada.

## Limitaciones y advertencias

- La model card remite a la documentación del modelo original para limitaciones; no se detallan sesgos específicos de esta versión.
- Riesgo de degradación de precisión por la cuantización INT8: no se publican métricas que cuantifiquen la pérdida respecto al checkpoint FP32.
- Modelo puramente visual: no procesa texto ni lenguaje natural, por lo que no es adecuado para tareas de NLP.
- No se especifica la resolución de entrada ni el preprocesado exacto en la card; es necesario consultar la documentación del modelo original.
- Dependencia de la versión de OpenVINO (2026.1.0+) y de Model API (0.4.0+), lo que puede limitar la portabilidad a entornos con versiones anteriores.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la model card original para condiciones adicionales del checkpoint DINOv2.
- El bajo número de descargas y la ausencia de benchmarks públicos sugieren que debe validarse en el caso de uso concreto antes de llevarlo a producción.
- No se documenta el dataset de calibración de la cuantización, lo que dificulta anticipar su comportamiento en dominios alejados del corpus original.

## Enlaces

- HuggingFace: https://huggingface.co/OpenVINO/dino_v2-int8-ov
- Modelo original (timm): https://huggingface.co/timm/vit_small_patch14_dinov2.lvd142m
- Geti (plataforma de Intel): https://github.com/open-edge-platform/geti
- OpenVINO IR format: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Guía de cuantización post-entrenamiento de OpenVINO: https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/quantizing-models-post-training.html
- Model API: https://github.com/open-edge-platform/model_api
- Documentación de Model API: https://open-edge-platform.github.io/model_api/latest/
- OpenVINO documentation: https://docs.openvino.ai/
- Repositorio OpenVINO en GitHub: https://github.com/openvinotoolkit/openvino
- Intel Distribution of OpenVINO Toolkit: https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html
- OpenVINO en Wikipedia: https://en.wikipedia.org/wiki/OpenVINO
