# OpenVINO/rfdetr_large-int8-ov

## Resumen

RF-DETR Large INT8 OV es la conversión al formato OpenVINO IR del modelo de detección de objetos RF-DETR Large, desarrollado originalmente por Roboflow y empaquetado por Intel dentro del ecosistema Geti para su despliegue optimizado en hardware Intel (CPU, GPU integrada y NPU). El modelo realiza detección de objetos densa (bounding boxes con clase) sobre imágenes, y esta variante concreta aplica cuantización post-entrenamiento a INT8 tanto en pesos como en activaciones mediante `nncf.quantize`, reduciendo el tamaño del repositorio a aproximadamente 0,1 GB y acelerando la inferencia en plataformas Intel.

La relevancia de esta ficha radica en que no se trata de un modelo de lenguaje, sino de un detector visual listo para producción en el borde: el formato OpenVINO IR permite ejecutarlo sin PyTorch en dispositivos con recursos limitados, y la licencia Apache-2.0 facilita su integración comercial. La model card no documenta parámetros totales, longitud de contexto (no aplica) ni idiomas; la información disponible se limita a la arquitectura de detección, el método de cuantización y los requisitos de compatibilidad con OpenVINO 2026.1.0+ y Model API 0.4.0+.

Es importante señalar que la información pública proporcionada es escasa: no se incluyen métricas de precisión (mAP), número de parámetros ni detalles del dataset de entrenamiento original. Esta ficha refleja exclusivamente lo que la model card y la documentación de OpenVINO permiten afirmar, marcando como "no disponible" todo aquello que no se ha publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de detección de objetos (RF-DETR, familia DETR con atención) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | INT8 en pesos y activaciones (PTQ con NNCF) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`), INT8 |

## Arquitectura y entrenamiento

RF-DETR Large es un detector de objetos basado en la familia DETR (Detection Transformer), que combina un backbone convolucional con un decoder transformer para predecir conjuntos de bounding boxes y clases de forma directa, sin necesidad de anclas ni de supresión no máxima (NMS) en el pipeline clásico. La model card no detalla el backbone exacto, el número de capas ni la resolución de entrada; únicamente confirma que se trata de la variante "Large" del proyecto RF-DETR de Roboflow.

El proceso de conversión aplicado por Geti/OpenVINO consiste en una cuantización post-entrenamiento (PTQ) con `nncf.quantize`, que comprime pesos y activaciones a INT8 sin reentrenamiento. No se documentan en la información disponible el número de tokens de entrenamiento (no aplica), la composición del dataset original, ni si hubo etapas de RLHF/DPO (no aplica a un detector). Tampoco se especifican innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el valor diferencial de esta variante es exclusivamente el formato IR optimizado para inferencia en hardware Intel.

## Capacidades

- Detección de objetos en imágenes: produce bounding boxes con etiqueta de clase y puntuación de confianza.
- Inferencia optimizada en hardware Intel: CPU, GPU integrada y NPU mediante OpenVINO Runtime 2026.1.0 o superior.
- Integración con Model API 0.4.0+: carga del modelo con `Model.from_pretrained` y visualización con `Visualizer`.
- Ejecución sin dependencia de PyTorch en producción: el formato IR es autónomo y portable.
- Ajuste fino con datasets personalizados: la model card indica que se puede anotar, reentrenar y exportar el modelo usando Geti.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual de detección.

## Casos de uso

- Inspección visual en líneas de fabricación: el detector se ejecuta en un PC industrial con CPU Intel o NPU y localiza defectos o piezas en imágenes de cámara en tiempo real, aprovechando la cuantización INT8 para reducir latencia en el borde.
- Vigilancia y analítica de vídeo en el borde: desplegado con OpenVINO en dispositivos de baja potencia, detecta personas, vehículos u objetos en streams de cámara sin enviar vídeo a la nube.
- Automatización de inventario en retail: identifica productos en estanterías o cestas a partir de fotos, con el modelo ajustado mediante Geti sobre un dataset propio de SKUs.
- Control de calidad en agricultura: detección de frutos, plagas o daños en imágenes de campo capturadas por drones o cámaras fijas, ejecutando el modelo en equipos con GPU integrada Intel.
- Procesamiento documental y logística: localización de etiquetas, códigos o paquetes en imágenes de escaneo para pipelines de clasificación y seguimiento.
- Prototipado rápido en el ecosistema Intel: uso de Model API para validar un detector preentrenado en notebooks o entornos de desarrollo antes de invertir en un ajuste fino con Geti.
- Sistemas de asistencia a la conducción o robótica móvil: detección de obstáculos y objetos relevantes en tiempo real, siempre que se valide la precisión del modelo cuantizado en el dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de mAP, latencia ni throughput para esta variante INT8, y la documentación de OpenVINO consultada no aporta cifras específicas del modelo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa aproximadamente 0,1 GB, por lo que la huella de memoria del modelo es muy reducida.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU, GPU integrada Intel y NPU mediante OpenVINO.
- Compatibilidad con GPU de consumo: al ser un modelo de detección de tamaño moderado y cuantizado a INT8, es plausible ejecutarlo en iGPU Intel y en GPUs de consumo, aunque no se documentan requisitos mínimos oficiales.
- Opciones de despliegue: OpenVINO Runtime 2026.1.0+, Model API 0.4.0+, y el ecosistema Geti para ajuste fino y exportación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Cuantización | Licencia | Contexto / entrada |
|---|---|---|---|---|---|
| RF-DETR Large INT8 OV (este) | DETR transformer | OpenVINO IR | INT8 (PTQ) | Apache-2.0 | Imagen, resolución no disponible |
| RF-DETR Large (original) | DETR transformer | PyTorch | FP32/FP16 | Apache-2.0 | Imagen, resolución no disponible |
| YOLO (variantes grandes) | CNN | PyTorch/ONNX | FP32/FP16/INT8 | AGPL-3.0 (Ultralytics) | Imagen, 640 px típico |
| DETR original | Transformer | PyTorch | FP32 | Apache-2.0 | Imagen, 800 px típico |

La comparativa se limita a características estructurales porque no hay métricas de precisión publicadas para esta variante. Frente a YOLO, RF-DETR ofrece un pipeline sin NMS y licencia Apache-2.0 más permisiva que AGPL-3.0; frente al DETR original, la familia RF-DETR está diseñada para mayor eficiencia de entrenamiento, aunque no se aportan cifras en la información disponible.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluación de robustez del modelo original en la información proporcionada.
- Riesgo de alucinación: en detección de objetos se traduce en falsos positivos y cajas mal localizadas; la cuantización INT8 puede degradar ligeramente la precisión respecto al modelo FP32, aunque no se cuantifica esa pérdida.
- La model card remite a la documentación del modelo original para limitaciones; no se detallan restricciones de dominio, clases soportadas ni resolución de entrada.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar los términos del modelo original en el repositorio de Roboflow.
- Compatibilidad estricta: requiere OpenVINO 2026.1.0+ y Model API 0.4.0+; versiones anteriores pueden no cargar el modelo.
- Es un modelo de visión: no procesa texto, no soporta tool calling ni razonamiento multi-step; no debe evaluarse como un LLM.
- No hay datos publicados sobre rendimiento en dominios distintos al de entrenamiento; se recomienda validación con dataset propio antes de producción.

## Enlaces

- HuggingFace: https://huggingface.co/OpenVINO/rfdetr_large-int8-ov
- Modelo original RF-DETR (Roboflow): https://github.com/roboflow/rf-detr
- Geti (Intel): https://github.com/open-edge-platform/geti
- OpenVINO IR format: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Guía de cuantización OpenVINO: https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/quantizing-models-post-training.html
- Model API: https://github.com/open-edge-platform/model_api
- Documentación Model API: https://open-edge-platform.github.io/model_api/latest/
- OpenVINO toolkit: https://github.com/openvinotoolkit/openvino
- Documentación OpenVINO: https://docs.openvino.ai/
- Licencia Roboflow: https://roboflow.com/licensing
