# OpenVINO/rtmdet_inst_tiny-fp16-ov

## Resumen

RTMDet Instance Tiny es un modelo de detección y segmentación de instancias basado en la arquitectura RTMDet, originalmente publicado en MMDetection (OpenMMLab) y adaptado por Geti (Intel) para su despliegue en entornos de producción. Esta versión concreta, `OpenVINO/rtmdet_inst_tiny-fp16-ov`, es una conversión al formato OpenVINO IR (Intermediate Representation) con pesos comprimidos a FP16, publicada por el equipo de OpenVINO en Hugging Face. Su propósito es ofrecer inferencia de segmentación de instancias optimizada para CPU, GPU y NPU de Intel, sin necesidad de framework de entrenamiento en tiempo de ejecución.

El modelo resuelve la tarea de segmentación de instancias: detectar objetos en una imagen y generar máscaras por instancia. Al ser la variante "tiny" de la familia RTMDet, prioriza la latencia baja y el consumo reducido de recursos sobre la precisión máxima, lo que lo hace adecuado para despliegues en edge, AI PCs y sistemas embebidos. El repo tiene un tamaño declarado de 0.0 GB (probablemente por redondeo de un artefacto pequeño), 26 descargas y 0 likes en el momento de la consulta.

La relevancia actual radica en su integración con el ecosistema OpenVINO 2026 y Model API 0.4.0, que permite cargar el modelo con una sola línea y ejecutarlo en hardware Intel sin dependencias de PyTorch. Es una pieza práctica para pipelines de visión artificial en producción donde se requiere segmentación por instancia con footprints pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RTMDet (detector one-stage con cabeza de segmentación de instancias) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | FP16 (pesos comprimidos en el IR); no se documentan otras variantes en el repo |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`), compatible con OpenVINO 2026.1.0+ y Model API 0.4.0+ |

## Arquitectura y entrenamiento

RTMDet es un detector de objetos one-stage basado en una columna vertebral CSPNeXt con un cuello PAN y una cabeza desacoplada. La variante "Instance" añade una rama de segmentación que produce máscaras por instancia, siguiendo el paradigma de Mask R-CNN (de ahí el tag `MaskRCNN` en el repo). La variante "Tiny" reduce la profundidad y el ancho de los bloques convolucionales para minimizar el coste computacional. El modelo original fue entrenado sobre el dataset COCO (no se detalla en la información proporcionada el número exacto de tokens ni la composición del dataset, pero es el estándar en MMDetection para esta familia).

Esta versión concreta no incluye información sobre el proceso de entrenamiento, fine-tuning ni datos adicionales. Se trata de una conversión de pesos: el modelo original de MMDetection se exporta a OpenVINO IR y se comprime a FP16. La model card indica que Geti permite anotar datos, hacer fine-tuning y exportar el modelo resultante, pero no se documentan los detalles del entrenamiento original en esta ficha. No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal, ya que es un modelo puramente convolucional de visión.

## Capacidades

- Detección de objetos con cajas delimitadoras y puntuaciones de confianza.
- Segmentación de instancias: genera una máscara binaria por cada objeto detectado.
- Salida compatible con la clase `Model` de Model API, que devuelve resultados estructurados listos para visualización con `Visualizer`.
- Ejecución en CPU, GPU y NPU de Intel a través de OpenVINO Runtime.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión-lenguaje ni audio.

## Casos de uso

- **Control de calidad en líneas de fabricación**: el modelo detecta y segmenta piezas o defectos en imágenes de cámaras industriales. Su variante tiny y la compilación FP16 permiten inferencia en tiempo real sobre CPU o NPU integrada en el equipo de visión, sin GPU dedicada.
- **Segmentación en aplicaciones de retail y análisis de estanterías**: permite identificar productos individuales y sus máscaras para tareas de inventario automático. La integración con Model API simplifica el despliegue en AI PCs con OpenVINO.
- **Vigilancia y análisis de escenas**: detección y segmentación de personas u objetos en flujos de vídeo. Al ejecutarse en CPU con OpenVINO, se puede desplegar en servidores sin aceleradores dedicados, reduciendo costes.
- **Robótica y navegación**: segmentación de obstáculos y objetos para planificación de agarre o evitación. El bajo coste computacional de la variante tiny encaja en plataformas embebidas con CPU Intel.
- **Análisis de imágenes médicas o científicas (con fine-tuning)**: Geti permite anotar un dataset propio y reentrenar el modelo; la licencia Apache-2.0 facilita su uso en investigación y productos comerciales.
- **Preprocesado en pipelines de visión documental**: segmentación de regiones de interés (sellos, firmas, tablas) antes de un OCR. La máscara por instancia ayuda a aislar elementos solapados.
- **Prototipado rápido en notebooks y demos**: la carga con `Model.from_pretrained` y el renderizado con `Visualizer` permiten validar un caso de uso en pocas líneas de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Al ser un modelo tiny en FP16, el footprint es reducido, pero no se documenta el tamaño exacto de los pesos ni la memoria de activaciones.
- **GPU recomendadas**: no se especifican. OpenVINO soporta GPU Intel (iGPU y dGPU como Arc) además de CPU y NPU; no hay datos de rendimiento por dispositivo en la información proporcionada.
- **Consumer GPU**: no disponible. El modelo está pensado para el runtime de OpenVINO, no para CUDA/PyTorch, por lo que su ejecución en GPUs NVIDIA requeriría una ruta alternativa no documentada.
- **Opciones de despliegue**: OpenVINO Runtime (2026.1.0+), Model API 0.4.0+ con el extra `[huggingface]`, y el ecosistema Geti para fine-tuning y exportación.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| rtmdet_inst_tiny-fp16-ov | RTMDet tiny + máscaras | Segmentación de instancias | no aplica | Apache-2.0 | OpenVINO IR FP16 | Hugging Face (OpenVINO) |
| RTMDet Instance Tiny (original) | RTMDet tiny + máscaras | Segmentación de instancias | no aplica | Apache-2.0 | PyTorch (MMDetection) | GitHub OpenMMLab |
| Mask R-CNN (variantes tiny) | Mask R-CNN | Segmentación de instancias | no aplica | depende de la implementación | PyTorch / ONNX | MMDetection, torchvision |

No se dispone de datos de benchmarks para comparar el rendimiento numérico entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Sesgos**: no documentados en la model card; al entrenarse sobre COCO, puede heredar los sesgos de dicho dataset (clases y contextos sobrerrepresentados).
- **Alucinación**: no aplica en el sentido de los LLM, pero puede producir detecciones falsas positivas o máscaras imprecisas en escenas con oclusión o clases no vistas.
- **Limitaciones de contexto e idioma**: no aplica; es un modelo de visión sin procesamiento de lenguaje.
- **Licencia**: Apache-2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo original en MMDetection y las condiciones de uso de Geti para el fine-tuning.
- **Compatibilidad**: requiere OpenVINO 2026.1.0+ y Model API 0.4.0+; versiones anteriores pueden no cargar el IR correctamente.
- **Precisión**: la compresión a FP16 puede introducir una ligera degradación de precisión frente al modelo original en FP32; no se documenta la magnitud de esta pérdida.
- **Producción**: al ser una variante tiny, la precisión en objetos pequeños o densamente agrupados puede ser inferior a la de variantes mayores de RTMDet; validar con el dataset objetivo antes de desplegar.

## Enlaces

- [Hugging Face: OpenVINO/rtmdet_inst_tiny-fp16-ov](https://huggingface.co/OpenVINO/rtmdet_inst_tiny-fp16-ov)
- [Geti (Intel)](https://github.com/open-edge-platform/geti)
- [RTMDet en MMDetection](https://github.com/open-mmlab/mmdetection/tree/main/configs/rtmdet)
- [Documentación de OpenVINO IR](https://docs.openvino.ai/2026/documentation/openvino-ir-format.html)
- [Model API](https://github.com/open-edge-platform/model_api)
- [Documentación de Model API](https://open-edge-platform.github.io/model_api/latest/)
- [OpenVINO Toolkit](https://github.com/openvinotoolkit/openvino)
- [Documentación de OpenVINO](https://docs.openvino.ai/)
- [Intel Distribution of OpenVINO](https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html)
