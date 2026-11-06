# OpenVINO/resnet18-int8-ov

## Resumen

`resnet18-int8-ov` es la conversión a formato OpenVINO IR del modelo ResNet-18 de torchvision, con los pesos comprimidos a INT8 mediante cuantización post-entrenamiento (PTQ) con NNCF. Lo publica el equipo de OpenVINO en Hugging Face y su propósito no es otro que ofrecer una variante lista para desplegar con el runtime de Intel, optimizada para inferencia de baja latencia en CPU, GPU y NPU. No es un modelo nuevo: es un artefacto de despliegue sobre la arquitectura ResNet-18 original, presentada en el paper "Deep Residual Learning for Image Recognition" (He et al., 2015).

La relevancia de esta ficha es acotada pero práctica: ResNet-18 es un clasificador de imágenes de referencia, con alrededor de 11,7 millones de parámetros en su versión estándar de torchvision, entrenado sobre ImageNet (1000 clases). Esta variante INT8 permite ejecutarlo en hardware modesto con un pipeline estandarizado a través de OpenVINO Model API, lo que simplifica la integración en aplicaciones de visión por computador embebidas o en el borde.

Conviene subrayar que la model card es mínima y no documenta métricas de precisión tras la cuantización ni detalles del calibrado. La información disponible sobre arquitectura y entrenamiento proviene del modelo original de torchvision, no del artefacto OpenVINO en sí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN con conexiones residuales, 18 capas) |
| Parametros totales | Aproximadamente 11,7 M (modelo original de torchvision; no confirmado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada 1x3x224x224 RGB) |
| Tipos de cuantizacion | INT8 en pesos y activaciones (PTQ con `nncf.quantize`) |
| Idiomas soportados | No disponible (clasificación de imágenes, sin procesamiento de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | OpenVINO IR (compatible con OpenVINO 2026.1.0+ y Model API 0.4.0+) |

## Arquitectura y entrenamiento

La arquitectura subyacente es ResNet-18, una red neuronal convolucional con bloques residuales (BasicBlock) que mitiga el problema del desvanecimiento del gradiente mediante conexiones de identidad. La implementación de referencia es la de torchvision, preentrenada sobre ImageNet para clasificación en 1000 categorías. La entrada esperada es un tensor de 1x3x224x224 en orden RGB.

El artefacto publicado no añade entrenamiento propio: aplica cuantización post-entrenamiento (PTQ) con NNCF, fijando INT8 tanto en pesos como en activaciones. La model card no especifica el conjunto de calibración, el número de muestras usado ni el método exacto de calibración (por ejemplo, min-max frente a percentil). Tampoco documenta si hubo ajuste fino consciente de la cuantización (QAT). Esta ausencia de metadatos es el principal punto débil de la ficha técnica del autor.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet (etiquetas estándar de torchvision).
- Extracción de logits por clase a partir de una imagen RGB de 224x224.
- Inferencia acelerada por OpenVINO en CPU, GPU y NPU.
- Integración directa con OpenVINO Model API 0.4.0+ para carga, preprocesado y visualización.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión-lenguaje: es un clasificador puro.
- No dispone de modo "thinking" ni funciones especiales más allá de la clasificación.

## Casos de uso

- Clasificación de imágenes en el borde: desplegar el modelo en dispositivos con CPU Intel o NPU para etiquetar imágenes en tiempo real en cámaras o gateways IoT, aprovechando la compresión INT8 y el runtime OpenVINO para reducir latencia y huella de memoria.
- Preetiquetado en pipelines de anotación: usar el modelo como primer filtro para sugerir clases ImageNet sobre grandes lotes de imágenes y reducir el trabajo manual de revisión.
- Detección de contenido y moderación básica: clasificar imágenes entrantes en categorías genéricas y derivar a revisión humana las que caigan en clases sensibles, como parte de un sistema de triaje.
- Prototipado rápido de aplicaciones de visión: emplear el ejemplo de Model API de la model card para validar un pipeline completo (carga, inferencia, visualización) en pocas líneas de código antes de invertir en un modelo mayor.
- Benchmark de infraestructura: servir como carga de referencia para medir throughput y latencia de CPU, GPU o NPU con OpenVINO en pruebas de capacidad o comparativas de hardware.
- Extracción de características para tareas downstream: usar las activaciones intermedias como embedding visual en clasificadores ligeros, sistemas de búsqueda por similitud o clustering de imágenes, dado el bajo coste computacional del modelo.
- Educación y demostraciones: ilustrar el flujo de cuantización PTQ y despliegue con OpenVINO en cursos o talleres, al ser un modelo pequeño y bien conocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión top-1 o top-5 tras la cuantización, ni comparativas de latencia o throughput. Tampoco se documenta en la búsqueda web ningún dato de rendimiento específico de esta variante INT8.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un modelo de aproximadamente 11,7 M de parámetros en INT8, la huella de pesos ronda las decenas de MB, pero no se confirma en la documentación.
- GPU recomendadas: no especificadas por el autor. OpenVINO soporta CPU, GPU y NPU Intel; para GPU discretas se sugiere hardware Intel compatible con el runtime, sin que la model card detalle modelos concretos.
- Cabe en GPU de consumo: sí, por tamaño; sin embargo, no se documentan requisitos mínimos ni GPU de consumo validadas.
- Opciones de despliegue: OpenVINO 2026.1.0 o superior, con OpenVINO Model API 0.4.0 o superior. El ejemplo oficial usa `openvino-model-api[huggingface]` y `Model.from_pretrained("OpenVINO/resnet18-int8-ov")`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenVINO/resnet18-int8-ov | ~11,7 M (INT8) | Imagen 1x3x224x224 | OpenVINO IR | BSD-3-Clause | Hugging Face |
| torchvision resnet18 | ~11,7 M | Imagen 1x3x224x224 | PyTorch (safetensors/bin) | BSD-3-Clause | PyTorch Hub, torchvision |
| resnet-18-pytorch (Open Model Zoo) | ~11,7 M | Imagen 1x3x224x224 | OpenVINO IR | No disponible en la búsqueda | Open Model Zoo |

La comparativa con alternativas de la misma categoría (por ejemplo, MobileNetV2/V3 o EfficientNet-B0 en formato OpenVINO) no está disponible en la información proporcionada, por lo que no se incluyen datos de rendimiento comparado.

## Limitaciones y advertencias

- La model card no documenta la pérdida de precisión introducida por la cuantización INT8; conviene validar top-1/top-5 sobre el dominio objetivo antes de producción.
- No se especifica el conjunto de calibración ni el método de calibración, lo que dificulta evaluar la robustez de la cuantización.
- Sesgos: hereda los sesgos del dataset ImageNet y de la implementación de torchvision; la model card no los analiza.
- Riesgo de clasificación errónea en dominios alejados de ImageNet (imágenes médicas, satelitales, industriales), donde las 1000 clases pueden no cubrir las categorías de interés.
- Solo clasificación de imágenes: no procesa texto, audio ni vídeo.
- La licencia BSD-3-Clause permite uso comercial, pero obliga a conservar el aviso de copyright y la cláusula de no endorsement; el modelo original de torchvision mantiene esa misma licencia.
- Compatibilidad restringida a OpenVINO 2026.1.0+ y Model API 0.4.0+; versiones anteriores pueden no cargar el IR.
- El tamaño del repo figura como 0.0 GB, lo que sugiere que los pesos podrían no estar alojados de forma completa o que la metadata es incompleta; verificar antes de integrar.
- Las limitaciones adicionales remiten a la implementación original de torchvision, según indica el autor.

## Enlaces

- Hugging Face: https://huggingface.co/OpenVINO/resnet18-int8-ov
- Modelo original en torchvision: https://docs.pytorch.org/vision/main/models/generated/torchvision.models.resnet18.html
- Repositorio de torchvision: https://github.com/pytorch/vision
- Documentación de OpenVINO IR: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Guía de cuantización post-entrenamiento de OpenVINO: https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/quantizing-models-post-training.html
- Repositorio de OpenVINO: https://github.com/openvinotoolkit/openvino
- OpenVINO Model API: https://github.com/open-edge-platform/model_api
- Documentación de Model API: https://open-edge-platform.github.io/model_api/latest/
- Página del modelo resnet-18-pytorch en OpenVINO: https://docs.openvino.ai/2023.3/omz_models_model_resnet_18_pytorch.html
- Documentación general de OpenVINO: https://docs.openvino.ai/
- Intel Distribution of OpenVINO Toolkit: https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html
- Licencia BSD-3-Clause: https://spdx.org/licenses/BSD-3-Clause.html
