# qualcomm/ConvNext-Tiny

## Resumen

ConvNext-Tiny es un modelo de clasificación de imágenes basado en la arquitectura ConvNeXt, en su variante "tiny", exportado y optimizado por Qualcomm para su despliegue en dispositivos con hardware Qualcomm (Snapdragon y Dragonwing). El modelo original procede de la implementación de `torchvision` y está entrenado sobre ImageNet; este repositorio no contiene un entrenamiento nuevo, sino artefactos pre-exportados (ONNX, QNN_DLC y TFLite) compilados con Qualcomm AI Hub Workbench para ejecutarse de forma eficiente en NPU.

Con 28,6 millones de parámetros y una resolución de entrada de 224x224, ConvNext-Tiny es un clasificador de propósito general que también puede emplearse como backbone en modelos más complejos. Su relevancia actual radica en la disponibilidad de artefactos cuantizados (w8a16 y w8a8) listos para producción en el ecosistema Qualcomm, con tiempos de inferencia en NPU del orden de 1 a 9 ms según el chipset, lo que lo hace adecuado para visión embebida y aplicaciones móviles.

La licencia BSD-3-Clause y la disponibilidad de exportación personalizada mediante la librería `ai-hub-models` facilitan su integración en pipelines propios. No obstante, se trata de un modelo de clasificación de imágenes, no de un modelo de lenguaje, por lo que las secciones relativas a contexto, idiomas o generación de texto no aplican y se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ConvNeXt (variante Tiny), red convolucional pura |
| Parámetros totales | 28,6 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224x224 píxeles) |
| Tipos de cuantización | float, w8a16, w8a8 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX, QNN_DLC, TFLite (artefactos pre-exportados); checkpoint PyTorch vía torchvision |
| Tamaño del modelo | 109 MB (float), 28,9 MB (w8a16) |
| Resolución de entrada | 224x224 |
| Checkpoint | ImageNet |
| Tamaño del repositorio | 11,5 GB |

## Arquitectura y entrenamiento

ConvNeXt es una familia de redes convolucionales puras que moderniza el diseño de ResNet incorporando decisiones arquitectónicas inspiradas en los Vision Transformers: convoluciones depthwise de mayor tamaño de kernel (7x7), normalización LayerNorm en lugar de BatchNorm, activación GELU, menos etapas de downsampling y un diseño de bloque tipo "inverted bottleneck". La variante Tiny reduce el número de canales por etapa respecto a las variantes Base y Large, dando lugar a los 28,6 M de parámetros indicados.

Este repositorio de Qualcomm no documenta un entrenamiento propio: parte del checkpoint de ImageNet disponible en `torchvision` y genera artefactos compilados y perfilados con Qualcomm AI Hub Workbench (QAIRT 2.51, ONNX Runtime 1.30.0). La innovación técnica destacable no está en el entrenamiento, sino en la cadena de exportación y cuantización (float, w8a16, w8a8) orientada a ejecución en NPU de chipsets Qualcomm. No se dispone de información sobre composición del dataset de entrenamiento original, número de tokens (no aplica) ni uso de RLHF/DPO.

## Capacidades

- Clasificación de imágenes de ImageNet: predice la clase predominante entre las 1000 categorías del dataset.
- Uso como backbone: puede servir de base para modelos más complejos de detección, segmentación o clasificación específica de dominio.
- Inferencia en NPU: artefactos optimizados para ejecución acelerada en hardware Qualcomm (Snapdragon y Dragonwing).
- Cuantización configurable: variantes float, w8a16 y w8a8 para equilibrar precisión y tamaño.
- Exportación personalizada: posibilidad de recompilar con pesos ajustados (fine-tuning), formas de entrada propias y configuraciones de dispositivo mediante `ai-hub-models`.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no aplica.
- Capacidades especiales (thinking mode, visión, audio): únicamente visión por clasificación de imagen; sin audio ni texto.

## Casos de uso

- Clasificación de imágenes en aplicaciones móviles: integración del artefacto TFLite u ONNX en apps Android para etiquetar fotos en el dispositivo con latencias de 1 a 9 ms en NPU, sin enviar datos a la nube.
- Visión embebida en cámaras y dispositivos IoT: uso del modelo cuantizado w8a8 (28,9 MB en w8a16) para clasificación en tiempo real en hardware con recursos limitados, como los chipsets Dragonwing.
- Preprocesado en pipelines de visión: filtrado o categorización rápida de imágenes antes de etapas más costosas (detección, OCR, segmentación), aprovechando su bajo coste computacional.
- Backbone para fine-tuning: partiendo del checkpoint de ImageNet, adaptar el modelo a dominios específicos (por ejemplo, clasificación de productos o defectos industriales) y reexportarlo con `ai-hub-models`.
- Prototipado en Qualcomm AI Hub: uso del modelo como referencia para medir latencia y memoria en distintos chipsets antes de comprometerse con una arquitectura mayor.
- Aplicaciones de accesibilidad: clasificación de escenas o reconocimiento de objetos cotidianos en dispositivos de asistencia que requieren inferencia local y de baja latencia.
- Benchmarking de hardware: empleo como carga de trabajo estándar para comparar el rendimiento de NPU entre generaciones de Snapdragon y Dragonwing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (top-1/top-5 en ImageNet) en la información disponible. Sí se incluyen métricas de inferencia por dispositivo:

| Chipset | Runtime | Precisión | Tiempo de inferencia | Memoria pico | Unidad de cómputo |
|---|---|---|---|---|---|
| Snapdragon 8 Elite Extreme Gen 6 Mobile | ONNX | float | 1,116 ms | 1-79 MB | NPU |
| Snapdragon 8 Elite Gen 6 Mobile | ONNX | float | 1,261 ms | 0-80 MB | NPU |
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | ONNX | float | 1,307 ms | 0-80 MB | NPU |
| Snapdragon 8 Elite For Galaxy Mobile | ONNX | float | 1,543 ms | 0-82 MB | NPU |
| Snapdragon X2 Elite | ONNX | float | 1,323 ms | 2-2 MB | NPU |
| Snapdragon X Elite | ONNX | float | 2,679 ms | 58-58 MB | NPU |
| Snapdragon 8 Gen 3 Mobile | ONNX | float | 2,026 ms | 0-135 MB | NPU |
| Snapdragon 8 Gen 1 Mobile | ONNX | float | 8,561 ms | 0-137 MB | NPU |
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | ONNX | w8a16 | 0,868 ms | 0-98 MB | NPU |
| Snapdragon X2 Elite | ONNX | w8a16 | 0,874 ms | 1-1 MB | NPU |
| Snapdragon 8 Elite For Galaxy Mobile | ONNX | w8a16 | 1,083 ms | 0-97 MB | NPU |
| Snapdragon X Elite | ONNX | w8a16 | 2,18 ms | 30-30 MB | NPU |

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido de GPU de escritorio; el modelo está pensado para NPU de Qualcomm. El tamaño de pesos es de 109 MB en float y 28,9 MB en w8a16, por lo que cabe holgadamente en memoria de dispositivos móviles.
- GPU recomendadas: no disponibles; el perfilado documentado se realiza sobre NPU de chipsets Qualcomm (Snapdragon 8 Gen 1/3, 8 Elite, X Elite, X2 Elite; Dragonwing IQ-8275, IQ-9075, IQ-X7181, Q-8750, QCS8550, QCS8450).
- ¿Cabe en GPU de consumo? No hay datos de despliegue en GPU de consumo en la información proporcionada; por tamaño (28,6 M de parámetros) sería viable en cualquier GPU moderna, pero no se documenta.
- Opciones de despliegue: ONNX Runtime (ONNX), QAIRT (QNN_DLC) y TFLite; exportación personalizada con la librería `ai-hub-models` de Qualcomm.
- Latencia y throughput: latencias de 0,868 ms (w8a16, Snapdragon 8 Elite Gen 5 For Galaxy) hasta 8,561 ms (float, Snapdragon 8 Gen 1) según chipset y precisión; memoria pico entre 0 y 176 MB según configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| ConvNext-Tiny (este) | 28,6 M | 224x224 | BSD-3-Clause | Clasificación ImageNet optimizada para NPU Qualcomm | ONNX, QNN_DLC, TFLite |
| ConvNeXt-Tiny (torchvision) | ~28,6 M | 224x224 | BSD-3-Clause | Clasificación ImageNet genérica | PyTorch |
| ResNet-50 | ~25,6 M | 224x224 | BSD-3-Clause (torchvision) | Clasificación ImageNet genérica | PyTorch |
| MobileNetV3 | ~5,4 M (Large) | 224x224 | BSD-3-Clause (torchvision) | Clasificación eficiente en móvil | PyTorch, TFLite |

La comparación se limita a arquitecturas de clasificación de imagen de tamaño similar; no se dispone de datos de precisión comparada en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de clasificación de imágenes, no de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- Entrenado sobre ImageNet (1000 clases): su precisión fuera de ese dominio depende de fine-tuning; no se documentan métricas de precisión en este repositorio.
- Riesgo de sesgos heredados del dataset ImageNet (categorías y representaciones desequilibradas).
- Riesgo de clasificación errónea en imágenes fuera de distribución o con clases no presentes en ImageNet.
- El repositorio incluye artefactos compilados para hardware Qualcomm; el rendimiento en otras plataformas no está garantizado ni documentado.
- La cuantización w8a8 puede degradar la precisión respecto a float; no se aportan datos de la caída de precisión.
- Licencia BSD-3-Clause: permite uso comercial con atribución y sin endoso; conviene revisar los términos de los artefactos de terceros (torchvision, QAIRT) incluidos.
- El tamaño del repositorio (11,5 GB) se debe a los múltiples artefactos exportados, no al modelo en sí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qualcomm/ConvNext-Tiny
- Página en Qualcomm AI Hub: https://aihub.qualcomm.com/models/convnext_tiny
- Repositorio ai-hub-models (ConvNext-Tiny): https://github.com/qualcomm/ai-hub-models/blob/v0.67.0/src/qai_hub_models/models/convnext_tiny
- Implementación de referencia en torchvision: https://github.com/pytorch/vision/blob/main/torchvision/models/convnext.py
- Paper de ConvNeXt (arXiv:2201.03545): https://arxiv.org/abs/2201.03545
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Sitio corporativo de Qualcomm: https://www.qualcomm.com/
