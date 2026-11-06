# OpenVINO/yolox_tiny-int8-ov

## Resumen

YOLOX-Tiny INT8 OV es una versión optimizada del detector de objetos YOLOX-Tiny, convertida al formato Intermediate Representation (IR) de OpenVINO y cuantizada a INT8 tanto en pesos como en activaciones. El modelo original es YOLOX-Tiny, desarrollado en el ecosistema OpenMMLab (MMDetection), y esta versión concreta ha sido producida por Geti, la plataforma de Intel para etiquetado y entrenamiento de modelos de visión. El repositorio lo publica la organización OpenVINO en Hugging Face.

El modelo resuelve detección de objetos genérica en imágenes dentro del pipeline `object-detection`. Su relevancia radica en que ofrece un artefacto listo para desplegar en inferencia sobre hardware Intel (CPU, GPU integrada, NPU y aceleradores) sin necesidad de convertir ni cuantizar manualmente: el formato IR con compresión INT8 reduce el coste computacional y de memoria respecto al modelo en punto flotante, lo que lo hace apto para entornos de borde y AI PCs.

La información pública disponible es limitada: la model card no detalla el número de parámetros, el contexto de entrenamiento ni resultados de benchmarks. Los datos que sí se conocen con certeza son el pipeline, la licencia Apache-2.0, el método de cuantización (PTQ con NNCF) y los requisitos de compatibilidad con OpenVINO 2026.1.0 o superior y Model API 0.4.0 o superior.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOX-Tiny (detector de objetos de una etapa, familia YOLOX) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | INT8 en pesos y activaciones (Post-Training Quantization con NNCF) |
| Idiomas soportados | no disponible (no aplica a un detector de objetos) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (Intermediate Representation), INT8 |

## Arquitectura y entrenamiento

YOLOX es una familia de detectores de objetos de una etapa que introduce mejoras sobre las versiones previas de YOLO: cabecera desacoplada (decoupled head), asignación dinámica de etiquetas (simOTA) y ausencia de anchors. La variante Tiny reduce la profundidad y anchura de la red para priorizar velocidad de inferencia en dispositivos con recursos limitados. Esta ficha no dispone de datos sobre el número exacto de capas, canales o parámetros de la variante Tiny en la información proporcionada.

El proceso de producción de este artefacto consiste en tomar el modelo YOLOX-Tiny de MMDetection, exportarlo a OpenVINO IR y aplicar cuantización post-entrenamiento con `nncf.quantize`, fijando INT8 para pesos y activaciones. No se documenta en la model card el dataset de entrenamiento original, el número de imágenes, ni si hubo ajuste fino adicional por parte de Geti. Tampoco se especifican técnicas de aumento de datos ni detalles del calibrado de cuantización.

## Capacidades

- Detección de objetos en imágenes: devuelve cajas delimitadoras y etiquetas de clase sobre una imagen de entrada.
- Inferencia optimizada para hardware Intel mediante OpenVINO, con soporte para CPU, GPU y NPU.
- Ejecución mediante Model API (`Model.from_pretrained`) con pipeline de preprocesado y postprocesado incluido.
- Visualización de resultados integrada mediante `model_api.visualizer.Visualizer`.
- Ajuste fino con datasets personalizados a través de la plataforma Geti (anotación, entrenamiento y exportación).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual de detección.
- No se documentan capacidades multilingües ni modos especiales (thinking, audio, vídeo nativo).

## Casos de uso

- Inspección visual en línea de fabricación: el modelo detecta defectos o piezas en la cadena de producción ejecutándose sobre CPU o NPU Intel en el propio equipo, sin depender de la nube, gracias a la compresión INT8 que reduce latencia y consumo.
- Vigilancia y conteo de personas u objetos en cámaras de borde: al ser una variante Tiny cuantizada, puede ejecutarse en dispositivos con recursos limitados y procesar flujos de vídeo fotograma a fotograma con OpenVINO.
- Detección de objetos en aplicaciones de robótica móvil: la inferencia en NPU/CPU integrada permite al robot percibir su entorno sin GPU dedicada, usando el pipeline de Model API para integrar el preprocesado de imagen.
- Automatización de inventario en retail: detección de productos en estanterías a partir de imágenes capturadas por cámaras fijas, con ajuste fino previo mediante Geti sobre el catálogo concreto.
- Análisis de imágenes en AI PCs: aplicaciones de escritorio que aprovechan la NPU del procesador para tareas de detección sin cargar la CPU ni consumir batería de forma significativa.
- Prototipado rápido de pipelines de visión: el formato IR y la API de alto nivel permiten validar un detector funcional en pocas líneas de código antes de invertir en un modelo mayor o en un dataset propio.
- Filtrado previo en sistemas de visión más complejos: usar YOLOX-Tiny como etapa de detección rápida que recorta regiones de interés para un modelo posterior más pesado (clasificación, segmentación u OCR).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión (mAP), latencia ni throughput, ni comparaciones con el modelo original en punto flotante.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al ser un modelo Tiny cuantizado a INT8, la huella de memoria es reducida y está pensada para ejecución en CPU/NPU, no exclusivamente en GPU.
- GPU recomendadas: no se especifican. El modelo está optimizado para el runtime de OpenVINO, que cubre CPU, GPU integrada Intel y NPU.
- Compatibilidad con GPU de consumo: no disponible; el formato IR de OpenVINO no es directamente ejecutable en GPUs NVIDIA sin conversión adicional.
- Opciones de despliegue: OpenVINO Runtime (versión 2026.1.0 o superior) y Model API (versión 0.4.0 o superior) mediante `pip install openvino-model-api[huggingface]`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son runtimes de modelos de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOX-Tiny INT8 OV (este) | YOLOX-Tiny | OpenVINO IR | INT8 (PTQ) | Apache-2.0 | Hugging Face (OpenVINO) |
| YOLOX-Tiny original | YOLOX-Tiny | PyTorch (MMDetection) | FP32 | Apache-2.0 | GitHub OpenMMLab |
| Otras variantes YOLOX (S, M, L, X) | YOLOX | PyTorch / OpenVINO IR | FP32 / INT8 | Apache-2.0 | MMDetection / OpenVINO |

No se dispone de datos de rendimiento (mAP, latencia) para establecer una comparación cuantitativa con alternativas como YOLOv8-nano o YOLOv5-nano en la información proporcionada.

## Limitaciones y advertencias

- La model card remite a la documentación del modelo original para las limitaciones; no se detallan sesgos, clases soportadas ni dominios de aplicación previstos en esta ficha.
- Riesgo de degradación de precisión por la cuantización INT8: la cuantización post-entrenamiento puede reducir ligeramente el mAP respecto al modelo en FP32, especialmente en objetos pequeños o clases poco representadas; no se aportan métricas para cuantificarlo.
- Dependencia estricta del runtime: requiere OpenVINO 2026.1.0 o superior y Model API 0.4.0 o superior; versiones anteriores pueden no cargar el modelo.
- Sin información sobre el dataset de entrenamiento original ni sobre las clases del vocabulario, por lo que no se puede garantizar su comportamiento en dominios específicos sin ajuste fino.
- El tamaño del repositorio figura como 0.0 GB, lo que sugiere que los pesos pueden no estar alojados directamente o que la métrica no está actualizada; conviene verificar la descarga antes de integrarlo en producción.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución, pero se recomienda revisar los términos del modelo original en el repositorio de MMDetection.
- No apto para tareas de lenguaje, razonamiento o generación: cualquier uso en esos ámbitos queda fuera de su diseño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenVINO/yolox_tiny-int8-ov
- Organización OpenVINO en Hugging Face: https://huggingface.co/OpenVINO
- Modelo original YOLOX en MMDetection: https://github.com/open-mmlab/mmdetection/tree/main/configs/yolox
- Geti (plataforma de Intel): https://github.com/open-edge-platform/geti
- Documentación del formato OpenVINO IR: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Guía de cuantización post-entrenamiento de OpenVINO: https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/quantizing-models-post-training.html
- Model API: https://github.com/open-edge-platform/model_api
- Documentación de Model API: https://open-edge-platform.github.io/model_api/latest/
- Repositorio de OpenVINO: https://github.com/openvinotoolkit/openvino
- Documentación de OpenVINO: https://docs.openvino.ai/
- Intel Distribution of OpenVINO Toolkit: https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html
