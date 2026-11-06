# OpenVINO/mobilenet_v2-int8-ov

## Resumen

`mobilenet_v2-int8-ov` es la versión optimizada para inferencia del clasificador de imágenes MobileNetV2, desarrollado originalmente por el equipo de torchvision (PyTorch) y convertido por OpenVINO al formato Intermediate Representation (IR) con compresión de pesos y activaciones a INT8. El modelo resuelve el problema de clasificación de imágenes sobre 1.000 clases de ImageNet, y su relevancia radica en que ofrece un coste computacional muy bajo con una precisión razonable, lo que lo hace idóneo para despliegue en dispositivos de borde, CPU y NPU.

La arquitectura es una red neuronal convolucional con bloques de residuos invertidos y cuellos de botella lineales (inverted residuals and linear bottlenecks), diseñada específicamente para dispositivos con recursos limitados. Esta variante INT8 aplica cuantización post-entrenamiento (PTQ) mediante `nncf.quantize`, reduciendo el peso del modelo y acelerando la inferencia en hardware Intel sin necesidad de reentrenamiento.

El modelo se distribuye como artefacto de OpenVINO y requiere la versión 2026.1.0 o superior del runtime, además de Model API 0.4.0 o superior para su uso a través de la API de alto nivel. No es un modelo generativo ni multimodal: es un clasificador de imágenes puro, pensado para pipelines de visión por computador en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN MobileNetV2 (inverted residuals, linear bottlenecks) |
| Parámetros totales | no disponible (el modelo original MobileNetV2 ronda los 3,4 M, pero la model card no lo especifica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | INT8 en pesos y activaciones (PTQ con nncf.quantize) |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | BSD-3-Clause |
| Formato de pesos | OpenVINO IR (compatible con OpenVINO 2026.1.0+) |

## Arquitectura y entrenamiento

MobileNetV2 es una red convolucional diseñada para eficiencia computacional en dispositivos móviles y de borde. Su bloque principal combina convoluciones depthwise separables con una expansión de canales intermedia y una proyección lineal final, evitando las no linealidades en el cuello de botella para preservar información. La versión de torchvision se entrena sobre ImageNet (1.000 clases), aunque la model card no detalla el número exacto de tokens ni la composición del dataset más allá de la referencia al modelo original.

La conversión a OpenVINO IR con INT8 se realizó mediante cuantización post-entrenamiento (PTQ) con `nncf.quantize`. Este proceso no requiere reentrenamiento y reduce el tamaño del modelo y el coste de inferencia, a cambio de una posible pérdida menor de precisión que la model card no cuantifica. No se menciona el uso de RLHF, DPO ni técnicas de alineación, ya que no es un modelo de lenguaje.

## Capacidades

- Clasificación de imágenes en 1.000 categorías de ImageNet.
- Inferencia optimizada en CPU, GPU y NPU Intel mediante OpenVINO.
- Ejecución en dispositivos de borde y sistemas embebidos con recursos limitados.
- Integración con Model API de OpenVINO para carga, inferencia y visualización de resultados.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento (thinking mode), visión generativa ni audio.

## Casos de uso

- Clasificación de imágenes en tiempo real en dispositivos de borde: el modelo puede ejecutarse en CPU o NPU de bajo consumo para etiquetar fotogramas de una cámara IP en un sistema de videovigilancia, gracias a su bajo coste computacional y a la cuantización INT8.
- Preprocesamiento en pipelines de visión artificial: se puede usar como primer filtro para clasificar imágenes antes de pasarlas a modelos más pesados (detección, segmentación), reduciendo el coste total del pipeline.
- Moderación de contenido básica: clasificación de imágenes subidas por usuarios en categorías genéricas para un primer cribado automático antes de la revisión humana.
- Indexación y etiquetado automático de bibliotecas de imágenes: generación de metadatos de clase para grandes volúmenes de fotos en servidores sin GPU dedicada, aprovechando la inferencia en CPU con OpenVINO.
- Aplicaciones móviles y de escritorio con OpenVINO: integración en aplicaciones de escritorio o sistemas empotrados que ya utilizan el runtime de OpenVINO para otras tareas de IA, reutilizando la misma infraestructura.
- Prototipado rápido de clasificadores: servir como línea base para evaluar el rendimiento de un pipeline de clasificación antes de invertir en modelos más grandes o en entrenamiento específico.
- Sistemas de control de calidad industrial: clasificación de piezas o productos en categorías visuales predefinidas en líneas de fabricación con hardware Intel industrial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión (top-1, top-5) ni de latencia para esta variante INT8.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es muy ligero (el repositorio ocupa 0,0 GB según Hugging Face, lo que sugiere un tamaño de decenas de MB) y está pensado para ejecutarse en CPU.
- GPU recomendadas: no se especifican; al ser un modelo INT8 para OpenVINO, funciona en CPU Intel, GPU integradas Intel y NPU. No requiere GPU dedicada.
- Cabe en cualquier GPU consumer, incluida una RTX 4090, aunque su uso típico es en CPU o aceleradores de borde.
- Opciones de despliegue: OpenVINO Runtime 2026.1.0 o superior, con Model API 0.4.0 o superior. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| mobilenet_v2-int8-ov | CNN MobileNetV2 | no disponible | no aplica | BSD-3-Clause | OpenVINO IR | Hugging Face (OpenVINO) |
| mobilenet-v2-pytorch (Open Model Zoo) | CNN MobileNetV2 | no disponible | no aplica | no disponible en la búsqueda | OpenVINO IR | Open Model Zoo |
| mobilenet-v2 (Open Model Zoo) | CNN MobileNetV2 | no disponible | no aplica | no disponible en la búsqueda | OpenVINO IR | Open Model Zoo |

No se dispone de datos de benchmarks ni de parámetros exactos para establecer una comparación cuantitativa con alternativas como EfficientNet o ResNet. La comparación se limita a la disponibilidad y al formato de distribución.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre ImageNet, hereda los sesgos de ese dataset (representación desigual de clases, sesgos geográficos y culturales). La model card no documenta un análisis específico de sesgos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero puede producir clasificaciones erróneas con alta confianza en imágenes fuera de distribución o clases no representadas.
- Limitaciones de contexto o idioma: no aplica; es un modelo de visión sin capacidades lingüísticas.
- Restricciones de licencia: BSD-3-Clause permite uso comercial, modificación y redistribución siempre que se conserve el aviso de copyright y la cláusula de exención de responsabilidad. No se especifican restricciones adicionales.
- Caveats para producción: requiere OpenVINO 2026.1.0+ y Model API 0.4.0+; la cuantización INT8 puede degradar la precisión respecto al modelo original en FP32, aunque no se cuantifica en la model card. El modelo está pensado para clasificación genérica, no para dominios especializados sin fine-tuning.

## Enlaces

- [Hugging Face: OpenVINO/mobilenet_v2-int8-ov](https://huggingface.co/OpenVINO/mobilenet_v2-int8-ov)
- [Modelo original MobileNetV2 en torchvision](https://docs.pytorch.org/vision/main/models/generated/torchvision.models.mobilenet_v2.html)
- [Formato OpenVINO IR](https://docs.openvino.ai/2026/documentation/openvino-ir-format.html)
- [Guía de cuantización post-entrenamiento de OpenVINO](https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/quantizing-models-post-training.html)
- [Model API de OpenVINO](https://github.com/open-edge-platform/model_api)
- [Documentación de Model API](https://open-edge-platform.github.io/model_api/latest/)
- [Repositorio de torchvision](https://github.com/pytorch/vision)
- [Documentación de OpenVINO](https://docs.openvino.ai/)
- [Repositorio de OpenVINO en GitHub](https://github.com/openvinotoolkit/openvino)
- [Open Model Zoo: mobilenet-v2](https://docs.openvino.ai/2023.3/omz_models_model_mobilenet_v2.html)
- [Open Model Zoo: mobilenet-v2-pytorch](https://docs.openvino.ai/2023.3/omz_models_model_mobilenet_v2_pytorch.html)
- [Intel Distribution of OpenVINO Toolkit](https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html)
