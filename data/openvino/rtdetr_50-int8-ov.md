# OpenVINO/rtdetr_50-int8-ov

## Resumen

`OpenVINO/rtdetr_50-int8-ov` es una conversión al formato OpenVINO IR con cuantización INT8 del detector de objetos RT-DETR con backbone ResNet-50, en la variante publicada por Geti (Intel). RT-DETR es un detector end-to-end basado en transformer (Real-Time DEtection TRansformer) que elimina la necesidad de componentes posteriores al estilo de NMS y de anchors, lo que simplifica el pipeline de inferencia frente a detectores clásicos como YOLO o Faster R-CNN.

El modelo no es un modelo de lenguaje: es un detector de objetos de visión por computador con pipeline `object-detection`. Su interés radica en que combina la precisión de un transformer de detección con un backbone convolucional ResNet-50, y se distribuye ya optimizado para inferencia en hardware Intel (CPU, GPU integrada, NPU) mediante el toolkit OpenVINO. El repositorio ocupa aproximadamente 0,1 GB, coherente con un modelo de este tamaño cuantizado a INT8.

La relevancia práctica es la del despliegue en producción: al estar en formato IR con pesos y activaciones en INT8, está pensado para ejecutarse en entornos de borde y en AI PCs con aceleración Intel, con la API `model_api` de OpenVINO como vía de integración. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR (Real-Time DEtection TRansformer) con backbone ResNet-50 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | INT8 (pesos y activaciones, PTQ con `nncf.quantize`) |
| Idiomas soportados | no disponible (no aplica; modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`), INT8 |

## Arquitectura y entrenamiento

RT-DETR es un detector end-to-end que formula la detección como un problema de predicción de conjuntos: un encoder transformer procesa las características extraídas por el backbone ResNet-50 y un decoder genera directamente las cajas y clases, sin NMS ni anchors. Esta variante conserva la arquitectura del modelo original de Roboflow (`roboflow/rf-detr`) y ha sido reempaquetada por Geti (Intel) para su exportación a OpenVINO IR.

El proceso de compresión aplicado es Post-Training Quantization (PTQ) mediante `nncf.quantize`, con precisión INT8 tanto en pesos como en activaciones. No se dispone de información sobre el dataset de entrenamiento original, el número de imágenes, la composición de clases ni si hubo fine-tuning adicional por parte de Geti. La model card remite a la documentación del modelo original para los detalles de entrenamiento.

## Capacidades

- Detección de objetos en imágenes: devuelve cajas delimitadoras y etiquetas de clase para los objetos presentes.
- Detección end-to-end sin NMS: el decoder produce directamente el conjunto final de detecciones.
- Inferencia optimizada para hardware Intel: CPU, GPU integrada y NPU a través de OpenVINO Runtime.
- Integración con `model_api` de OpenVINO, que incluye utilidades de preprocesado y visualización (`Visualizer`).
- Fine-tuning con datasets personalizados mediante Geti (anotación, entrenamiento y exportación).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de texto.

## Casos de uso

- Inspección visual en líneas de fabricación: desplegar el modelo en un PC industrial con CPU Intel para detectar defectos o piezas en cintas transportadoras, aprovechando la cuantización INT8 para reducir latencia y consumo.
- Vigilancia y análisis de vídeo en el borde: ejecutar detección por fotograma en dispositivos con NPU o GPU integrada Intel, sin necesidad de GPU dedicada.
- Conteo y seguimiento de objetos en retail: detección de personas y productos en imágenes de cámaras fijas, integrada en un pipeline de analítica con OpenVINO.
- Preetiquetado para anotación: usar el modelo como generador de detecciones iniciales que un equipo humano revisa en Geti antes del fine-tuning con datos propios.
- Automatización de inventario o logística: detección de paquetes, palés o contenedores en imágenes de almacén, con despliegue en hardware de bajo coste.
- Prototipado rápido de aplicaciones de visión: el ejemplo de la model card (carga con `Model.from_pretrained`, inferencia y `Visualizer().render`) permite tener un pipeline funcional en pocas líneas para validar una idea.
- Procesamiento por lotes en servidor: inferencia sobre grandes volúmenes de imágenes en CPU con OpenVINO, útil cuando no hay GPU disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio pesa unos 0,1 GB, lo que sugiere un modelo ligero apto para memoria unificada o incluso RAM de sistema.
- GPU recomendadas: no se especifican. El modelo está optimizado para CPU, GPU integrada y NPU Intel mediante OpenVINO; no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño reducido y la cuantización INT8, aunque no hay cifras oficiales de consumo de memoria.
- Opciones de despliegue: OpenVINO Runtime (versión 2026.1.0 o superior) y OpenVINO Model API (0.4.0 o superior). No se mencionan vLLM, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| rtdetr_50-int8-ov (este) | RT-DETR + ResNet-50 | OpenVINO IR | INT8 (PTQ) | Apache-2.0 | Optimizado para hardware Intel |
| RT-DETR ResNet-50 original (roboflow/rf-detr) | RT-DETR + ResNet-50 | PyTorch | FP32 | Apache-2.0 | Modelo de referencia sin optimizar |
| Detectores YOLO de tamaño similar | CNN | PyTorch / ONNX | FP32 / FP16 / INT8 | Varía según versión | Requieren NMS posterior |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La model card remite explícitamente a la documentación del modelo original para las limitaciones; no se detallan sesgos ni clases concretas en las que el modelo tenga un rendimiento deficiente.
- Al ser un detector genérico, puede fallar en dominios muy distintos al de su entrenamiento; se recomienda fine-tuning con Geti para datos propios.
- La cuantización INT8 puede introducir una pérdida de precisión respecto al modelo en FP32; no se han publicado métricas de esa degradación.
- Requiere OpenVINO 2026.1.0 o superior y Model API 0.4.0 o superior; versiones anteriores no son compatibles.
- El modelo está pensado para hardware Intel; en otras plataformas el rendimiento puede no ser óptimo.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar los términos del modelo original en el repositorio de Roboflow.
- No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones.

## Enlaces

- Hugging Face: https://huggingface.co/OpenVINO/rtdetr_50-int8-ov
- Modelo original (Roboflow rf-detr): https://github.com/roboflow/rf-detr
- Geti (Intel): https://github.com/open-edge-platform/geti
- OpenVINO Model API: https://github.com/open-edge-platform/model_api
- Documentación de Model API: https://open-edge-platform.github.io/model_api/latest/
- Formato OpenVINO IR: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Guía de cuantización PTQ de OpenVINO: https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/quantizing-models-post-training.html
- Repositorio de OpenVINO: https://github.com/openvinotoolkit/openvino
- Documentación de OpenVINO: https://docs.openvino.ai/
- Licencia del modelo original: https://roboflow.com/licensing
