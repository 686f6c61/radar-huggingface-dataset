# OpenVINO/rtmdet_inst_tiny-int8-ov

## Resumen

`OpenVINO/rtmdet_inst_tiny-int8-ov` es un modelo de segmentación de instancias (instance segmentation) basado en RTMDet Instance Tiny, convertido al formato OpenVINO IR y comprimido a INT8. Lo publica el equipo de OpenVINO (Intel) y el modelo original procede de Geti (Open Edge Platform), que a su vez se apoya en la implementación de RTMDet en MMDetection. Resuelve el problema de detección y segmentación simultánea de múltiples objetos en imágenes, devolviendo máscaras por instancia además de cajas delimitadoras y etiquetas de clase.

La relevancia de esta variante radica en su formato: al estar en OpenVINO IR con cuantización INT8 post-entrenamiento, está pensada para inferencia de baja latencia en CPU, iGPU y NPU de Intel, incluyendo equipos de escritorio y dispositivos de borde, sin necesidad de GPU dedicada. El sufijo "tiny" indica la variante más ligera de la familia RTMDet, orientada a throughput alto en hardware modesto.

No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica, es un modelo de visión) ni los idiomas soportados en la información proporcionada. La model card se centra en el proceso de conversión, cuantización y uso mediante Model API.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RTMDet (detector/segmentador de instancias, familia CNN) en formato OpenVINO IR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | INT8 en pesos y activaciones (PTQ con `nncf.quantize`) |
| Idiomas soportados | no disponible (no aplica; modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (compatible con OpenVINO >= 2026.1.0 y Model API >= 0.4.0) |

## Arquitectura y entrenamiento

RTMDet es una familia de detectores basados en CNN diseñada para lograr un buen equilibrio entre precisión y eficiencia, con un backbone y un neck optimizados y una cabeza de detección/segmentación. La variante "instance" añade la predicción de máscaras por instancia, por lo que la tarea es segmentación de instancias (no solo detección de cajas). La variante "tiny" es la de menor capacidad de la familia.

El modelo publicado aquí no se ha reentrenado desde cero: es una conversión del modelo original de Geti/MMDetection al formato OpenVINO IR, con compresión de pesos a INT8 mediante cuantización post-entrenamiento (PTQ) usando `nncf.quantize`. No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo ajuste fino con RLHF/DPO (no aplica en este tipo de modelo). Para ajustar el modelo a un dataset propio, la model card remite al flujo de Geti (anotación, fine-tuning y exportación).

## Capacidades

- Segmentación de instancias: devuelve máscaras por objeto, además de cajas delimitadoras y clases.
- Detección de objetos múltiples en una misma imagen.
- Inferencia optimizada para CPU, GPU integrada y NPU de Intel mediante OpenVINO.
- Ejecución en dispositivos de borde y AI PCs sin GPU dedicada.
- Integración con Model API de OpenVINO para carga, inferencia y visualización.
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto: es un modelo puramente visual.
- Capacidades multilingües: no aplica.
- No dispone de modo "thinking", visión generativa, audio ni otras capacidades multimodales más allá de la segmentación de imágenes.

## Casos de uso

- Inspección visual en línea de fabricación: el modelo puede segmentar piezas y defectos en cada imagen de una cinta transportadora, y su formato INT8 permite ejecutarlo en un PC industrial con CPU Intel sin GPU dedicada.
- Control de calidad en el borde: al ser una variante "tiny" cuantizada, se puede desplegar en dispositivos con recursos limitados para detectar y segmentar anomalías en tiempo real.
- Conteo y localización de objetos: útil para inventario, agricultura de precisión o logística, donde se necesita separar instancias individuales (no solo cajas) para contar y medir.
- Segmentación asistida en imágenes médicas o científicas no críticas: como punto de partida para pipelines de análisis de imágenes donde se requiere máscara por objeto, con la advertencia de que no es un modelo clínico.
- Preprocesado para pipelines de visión mayores: las máscaras y cajas generadas pueden alimentar etapas posteriores (OCR, clasificación, seguimiento) en sistemas de videovigilancia o análisis de escenas.
- Prototipado rápido con OpenVINO: gracias a la integración con Model API, se puede validar un caso de segmentación de instancias en pocas líneas de código antes de invertir en un modelo mayor.
- Fine-tuning con datos propios mediante Geti: la model card indica que se puede anotar, reentrenar y exportar el modelo para dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un modelo INT8 en OpenVINO IR, está pensado para ejecutarse en CPU, iGPU y NPU, no necesariamente en VRAM dedicada.
- GPU recomendadas: no se especifican; el formato OpenVINO está optimizado para hardware Intel (CPU, GPU integrada, NPU). No hay datos sobre rendimiento en A100, H100 o RTX 4090.
- ¿Cabe en GPU consumer? No hay datos de VRAM; por su naturaleza "tiny" e INT8, está diseñado para hardware de gama baja, pero no se confirma en la información disponible.
- Opciones de despliegue: OpenVINO Runtime (>= 2026.1.0) y Model API (>= 0.4.0). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos de segmentación de instancias (por ejemplo, variantes de Mask R-CNN, YOLO-seg u otras variantes de RTMDet) con los que comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La model card remite a la documentación del modelo original de MMDetection para las limitaciones; no se detallan aquí.
- Al ser una variante "tiny" cuantizada a INT8, es previsible una pérdida de precisión respecto al modelo original en FP32, aunque no se cuantifica en la información disponible.
- Es un modelo de visión: no procesa texto, no tiene contexto lingüístico y no soporta instrucciones en lenguaje natural.
- No se especifican sesgos conocidos ni riesgos de alucinación (no aplica el concepto de alucinación en el mismo sentido que en modelos de lenguaje, pero sí puede producir detecciones falsas o máscaras imprecisas).
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar los términos del modelo original en MMDetection y de Geti.
- Requiere OpenVINO >= 2026.1.0 y Model API >= 0.4.0; versiones anteriores pueden no ser compatibles.
- No se han publicado métricas de rendimiento en la información disponible, por lo que no se puede garantizar su idoneidad en producción sin una evaluación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenVINO/rtmdet_inst_tiny-int8-ov
- Modelo original RTMDet (MMDetection): https://github.com/open-mmlab/mmdetection/tree/main/configs/rtmdet
- Geti (Open Edge Platform): https://github.com/open-edge-platform/geti
- Documentación de OpenVINO IR: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Guía de cuantización post-entrenamiento de OpenVINO: https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/quantizing-models-post-training.html
- Model API: https://github.com/open-edge-platform/model_api
- Documentación de Model API: https://open-edge-platform.github.io/model_api/latest/
- OpenVINO (repositorio): https://github.com/openvinotoolkit/openvino
- Documentación de OpenVINO: https://docs.openvino.ai/
- Intel Distribution of OpenVINO Toolkit: https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html
