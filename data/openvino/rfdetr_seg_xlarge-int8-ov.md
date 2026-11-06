# OpenVINO/rfdetr_seg_xlarge-int8-ov

## Resumen

RF-DETR Segmentation X-Large es un modelo de segmentación de instancias basado en la arquitectura DETR (Detection Transformer), desarrollado originalmente por Roboflow dentro del proyecto RF-DETR. Esta ficha concreta corresponde a la versión publicada por el equipo de OpenVINO (Intel) a través de la plataforma Geti, convertida al formato Intermediate Representation (IR) de OpenVINO y con los pesos comprimidos a INT8. El modelo resuelve tareas de detección y segmentación de instancias en imágenes, devolviendo máscaras por objeto junto con sus cajas delimitadoras y etiquetas de clase.

La relevancia de esta variante radica en su orientación al despliegue en producción sobre hardware Intel: al estar en formato IR con cuantización INT8, puede ejecutarse con el runtime de OpenVINO sobre CPU, GPU integrada y NPU, lo que reduce los requisitos de memoria y mejora la latencia frente al modelo original en PyTorch. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja el efecto de la compresión de pesos.

Se trata de un modelo puramente de visión, sin capacidades de generación de texto ni de razonamiento lingüístico, por lo que su evaluación debe hacerse en términos de precisión de segmentación (mAP de máscara y de caja) y de rendimiento de inferencia, no con benchmarks de lenguaje. La información pública disponible sobre esta variante concreta es limitada: la model card remite a la documentación del modelo original para detalles de arquitectura y limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DETR (Detection Transformer) para segmentación de instancias, variante X-Large de RF-DETR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | INT8 en pesos y activaciones (Post-Training Quantization con nncf.quantize) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (Intermediate Representation), INT8 |

## Arquitectura y entrenamiento

El modelo sigue la familia DETR, un enfoque de detección y segmentación de instancias que sustituye los componentes clásicos de las arquitecturas tipo R-CNN (anchors, NMS, propuestas de región) por un transformer que predice conjuntos de objetos directamente. La variante X-Large de RF-DETR corresponde al tamaño mayor de la familia y está pensada para maximizar la precisión de segmentación a costa de un mayor coste computacional. No se dispone en la información proporcionada de detalles sobre el número exacto de parámetros, la composición del dataset de entrenamiento ni el número de tokens o imágenes utilizadas.

El proceso de conversión realizado por OpenVINO consiste en transformar los pesos originales a formato IR y aplicar cuantización post-entrenamiento (PTQ) con NNCF, fijando INT8 tanto en pesos como en activaciones. No se documenta en la información disponible si se empleó ajuste fino consciente de la cuantización (QAT) ni qué dataset de calibración se utilizó, lo que es relevante porque la PTQ puede degradar la precisión en capas sensibles de la cabeza de segmentación. El modelo es compatible con OpenVINO 2026.1.0 o superior y con Model API 0.4.0 o superior.

## Capacidades

- Segmentación de instancias: genera máscaras por objeto, además de cajas delimitadoras y etiquetas de clase, en una sola pasada.
- Detección de objetos: la cabeza de segmentación va acompañada de predicciones de caja, por lo que el modelo sirve también para localización.
- Inferencia sobre hardware Intel: ejecutable en CPU, GPU integrada y NPU mediante el runtime de OpenVINO.
- Integración con Model API: carga mediante `Model.from_pretrained` y visualización de resultados con `Visualizer`.
- Ajuste fino con datos propios: la model card indica que puede reentrenarse con datasets personalizados usando Geti para anotación y fine-tuning.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No dispone de modo thinking, visión-lenguaje, audio ni capacidades multimodales más allá de la imagen.

## Casos de uso

- Inspección visual industrial: el modelo puede segmentar piezas y defectos en líneas de fabricación, ejecutándose sobre CPU o NPU Intel en equipos de planta sin GPU dedicada, gracias al formato IR INT8.
- Control de calidad en alimentación: segmentación de instancias para contar y clasificar productos en cinta transportadora, con despliegue en edge mediante OpenVINO.
- Videovigilancia y analítica de escenas: detección y segmentación de personas u objetos en streams de cámara, aprovechando la inferencia de baja latencia en GPU integrada.
- Automatización de almacenes y logística: segmentación de paquetes y palés para estimación de volumen o conteo, con fine-tuning sobre imágenes del propio almacén mediante Geti.
- Agricultura de precisión: segmentación de frutos, hojas o malas hierbas en imágenes de dron o cámara fija, desplegando el modelo en dispositivos de campo con NPU.
- Investigación en visión por computador: uso como baseline de segmentación de instancias en formato OpenVINO para comparar latencias y precisión frente a otras variantes del mismo modelo.
- Preprocesado para pipelines de robótica: generación de máscaras de instancia que alimentan módulos de agarre o navegación, con integración directa vía Model API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,1 GB, lo que sugiere un modelo compacto en INT8 que puede residir en memoria de GPU integrada o incluso en RAM de CPU.
- GPU recomendadas: no se especifican en la información disponible; al ser un modelo OpenVINO, el objetivo principal son CPU Intel, GPU integradas (iGPU) y NPU, aunque también puede ejecutarse en GPU dedicadas compatibles con OpenVINO.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del artefacto, aunque no se confirma con datos oficiales.
- Opciones de despliegue: runtime de OpenVINO (2026.1.0+), Model API (0.4.0+) con el extra `openvino-model-api[huggingface]`, y el ecosistema Geti para fine-tuning y exportación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Cuantización | Licencia | Contexto |
|---|---|---|---|---|---|
| OpenVINO/rfdetr_seg_xlarge-int8-ov | DETR (RF-DETR X-Large) | OpenVINO IR | INT8 (PTQ) | Apache-2.0 | no aplica |
| RF-DETR Segmentation X-Large (original) | DETR (RF-DETR X-Large) | PyTorch | FP32/FP16 | Apache-2.0 | no aplica |
| Otras variantes RF-DETR (base/large) | DETR (RF-DETR) | PyTorch / OpenVINO | según variante | Apache-2.0 | no aplica |

La comparación principal es contra el modelo original de Roboflow: misma arquitectura y licencia, pero distinto formato y precisión numérica. No se dispone de datos de benchmarks que permitan cuantificar la pérdida de precisión por la cuantización INT8 frente al original.

## Limitaciones y advertencias

- La cuantización PTQ a INT8 puede degradar la precisión de las máscaras respecto al modelo en FP32/FP16; no se documenta la magnitud de esa pérdida.
- No se especifica el dataset de calibración empleado en la cuantización, lo que dificulta anticipar el comportamiento en dominios distintos al de calibración.
- La model card remite a la documentación del modelo original para las limitaciones; no se detallan sesgos conocidos en esta ficha.
- Riesgo de alucinación en el sentido de detecciones falsas positivas o máscaras imprecisas en escenas con oclusión, objetos pequeños o clases no representadas en el entrenamiento.
- Modelo exclusivamente de visión: no procesa texto ni instrucciones en lenguaje natural.
- Compatibilidad restringida a OpenVINO 2026.1.0+ y Model API 0.4.0+; versiones anteriores pueden no cargar el modelo.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar la licencia del modelo original en el repositorio de Roboflow para confirmar condiciones.
- El número de descargas (17) y de likes (0) es muy bajo, lo que indica poca validación comunitaria de esta variante concreta.

## Enlaces

- Hugging Face: https://huggingface.co/OpenVINO/rfdetr_seg_xlarge-int8-ov
- Modelo original RF-DETR: https://github.com/roboflow/rf-detr
- Geti (Open Edge Platform): https://github.com/open-edge-platform/geti
- Documentación del formato OpenVINO IR: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Guía de cuantización post-entrenamiento de OpenVINO: https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/quantizing-models-post-training.html
- Model API: https://github.com/open-edge-platform/model_api
- Documentación de Model API: https://open-edge-platform.github.io/model_api/latest/
- OpenVINO toolkit: https://github.com/openvinotoolkit/openvino
- Documentación de OpenVINO: https://docs.openvino.ai/
- Licencia del modelo original: https://roboflow.com/licensing
