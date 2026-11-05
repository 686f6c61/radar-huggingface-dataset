# qualcomm/EfficientNet-B0

## Resumen

EfficientNet-B0 es una red neuronal convolucional (CNN) para clasificación de imágenes, publicada originalmente por Google Research en 2019 (paper arXiv:1905.11946) y distribuida aquí por Qualcomm en una versión optimizada para ejecutarse en dispositivos con chips Snapdragon y aceleradores NPU de Qualcomm. El modelo clasifica imágenes en las 1000 categorías de ImageNet y también puede emplearse como backbone en arquitecturas más complejas (detección de objetos, segmentación, embeddings visuales).

Este repositorio no contiene un modelo de lenguaje ni un modelo generativo: es un artefacto de despliegue. Qualcomm exporta los pesos originales de `torchvision` a formatos ONNX, QNN_DLC y TFLite, con cuantización mixta `w8a16_mixed_int16`, para que puedan compilarse y perfilarse con Qualcomm AI Hub Workbench sobre hardware real. El modelo tiene 5,27 M de parámetros, trabaja con entradas de 224x224 píxeles y pesa 20,1 MB en float o 6,99 MB en la variante cuantizada.

Su relevancia actual es práctica: sirve como referencia para medir latencias de inferencia en NPU de Qualcomm (desde 0,548 ms en Snapdragon 8 Elite Gen 5 hasta 6,19 ms en Q-6690) y como plantilla para exportar modelos propios con la librería `qai_hub_models`. No aporta capacidades nuevas respecto al EfficientNet-B0 original; aporta artefactos listos para producción en el edge.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN EfficientNet (compound scaling), implementación de `torchvision` |
| Parámetros totales | 5,27 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224x224 píxeles) |
| Tipos de cuantización | float y w8a16_mixed_int16 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX, QNN_DLC, TFLite; pesos originales en PyTorch (`torchvision`) |

## Arquitectura y entrenamiento

EfficientNet-B0 es una CNN con bloques MBConv (Mobile Inverted Bottleneck Convolution) y squeeze-and-excitation, construida mediante escalado compuesto uniforme de profundidad, anchura y resolución. La versión de este repositorio sigue la implementación de `torchvision.models.efficientnet_b0` y carga el checkpoint preentrenado en ImageNet. No se ha reentrenado ni afinado: Qualcomm solo exporta, compila y perfila los pesos originales.

El entrenamiento original (Google, 2019) se realizó sobre ImageNet-1k con aumentación AutoAugment y regularización por dropout estocástico; los detalles completos están en el paper arXiv:1905.11946. La innovación de este repositorio no está en el modelo sino en el pipeline de despliegue: exportación a QNN_DLC y ONNX con cuantización mixta `w8a16_mixed_int16`, compilación para NPU Hexagon y profiling con Qualcomm AI Hub Workbench, incluyendo métricas de tiempo de inferencia y memoria pico por chipset.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet.
- Extracción de features y uso como backbone en modelos de visión de mayor complejidad.
- Inferencia en NPU de Qualcomm (Hexagon) con latencias sub-milisegundo en chips de gama alta.
- Ejecución en CPU/GPU vía ONNX Runtime y TFLite además de QNN.
- Soporte de entrada fija 224x224; no admite resolución variable sin reexportar.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües: no procesa lenguaje.

## Casos de uso

- Clasificación de imágenes en tiempo real en móvil: con 0,548 ms de inferencia en Snapdragon 8 Elite Gen 5, permite clasificar a más de 1000 FPS teóricos en NPU, adecuado para preprocesado en apps de cámara.
- Filtrado y moderación de contenido visual en el dispositivo: clasifica imágenes antes de subirlas a un servidor, reduciendo ancho de banda y preservando privacidad.
- Backbone para modelos de detección o segmentación en edge: al ser un checkpoint de `torchvision`, se puede recortar la cabeza de clasificación y añadir cabezas específicas, reexportando con `qai_hub_models`.
- Indexación y etiquetado automático de fotos en aplicaciones de galería: 6,99 MB en w8a16 cabe en memoria de un móvil de gama media sin impacto apreciable.
- Benchmarking de hardware: sirve como carga de referencia para medir latencia y memoria pico de NPU en distintos chipsets Qualcomm antes de desplegar modelos propios.
- Prototipado de pipelines de visión en IoT industrial: con 1,6 ms en Dragonwing IQ-8275, se puede integrar en inspección de calidad en línea sobre cámaras industriales.
- Validación de pipelines de exportación: permite comprobar que el flujo ONNX/QNN/TFLite funciona antes de aplicarlo a modelos más grandes y costosos de exportar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (top-1/top-5 en ImageNet) en la información disponible. Los datos de rendimiento publicados son de latencia y memoria pico por chipset:

| Chipset | Runtime | Precisión | Inferencia (ms) | Memoria pico (MB) | Unidad |
|---|---|---|---|---|---|
| Snapdragon 8 Elite Gen 5 for Galaxy | ONNX | float | 0,548 | 0-42 | NPU |
| Snapdragon 8 Elite for Galaxy | ONNX | float | 0,702 | 0-46 | NPU |
| Snapdragon X2 Elite | ONNX | float | 0,662 | 2-2 | NPU |
| Snapdragon X Elite | ONNX | float | 1,299 | 14-14 | NPU |
| Snapdragon 8 Gen 3 | ONNX | float | 0,901 | 0-69 | NPU |
| Snapdragon 8 Gen 1 | ONNX | float | 2,773 | 1-81 | NPU |
| Dragonwing IQ-8275 | ONNX | float | 1,606 | 1-5 | NPU |
| Dragonwing IQ-9075 | ONNX | float | 1,616 | 1-4 | NPU |
| Dragonwing IQ-X7181 | ONNX | float | 1,299 | 14-14 | NPU |
| Dragonwing Q-8750 | ONNX | float | 0,702 | 0-46 | NPU |
| Snapdragon 8 Elite Gen 5 for Galaxy | ONNX | w8a16 | 0,571 | 0-63 | NPU |
| Snapdragon X2 Elite | ONNX | w8a16 | 0,588 | 1-1 | NPU |
| Snapdragon 8 Gen 3 | ONNX | w8a16 | 0,953 | 0-82 | NPU |
| Dragonwing IQ-8275 | ONNX | w8a16 | 1,398 | 0-4 | NPU |
| Dragonwing Q-6690 | ONNX | w8a16 | 6,19 | 0-178 | NPU |

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo pesa 20,1 MB en float y 6,99 MB en w8a16, por lo que cabe en cualquier memoria de dispositivo móvil o embebido.
- GPU recomendadas: no requiere GPU dedicada; está pensado para NPU Hexagon de Qualcomm. En servidor puede ejecutarse en cualquier GPU con ONNX Runtime.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer (RTX 3060 o inferior) e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (1.30.0), Qualcomm QAIRT 2.50 (QNN_DLC), TFLite, y exportación personalizada con `qai_hub_models` v0.66.0.
- Latencia: 0,548-6,19 ms según chipset y precisión (ver tabla anterior). Throughput no publicado de forma explícita; a 0,548 ms por inferencia equivale a ~1825 inferencias/s en el chip más rápido.
- Memoria pico: entre 1 MB y 178 MB según chipset y precisión.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Licencia | Enfoque |
|---|---|---|---|---|
| EfficientNet-B0 (este repo) | 5,27 M | 224x224 | BSD-3-Clause | CNN optimizada para NPU Qualcomm |
| EfficientNet-B0 (torchvision) | 5,27 M | 224x224 | BSD-3-Clause | Pesos originales, sin optimizar |
| MobileNetV3-Small | ~2,5 M | 224x224 | BSD-3-Clause | CNN más ligera, menor precisión |
| ResNet-50 | ~25,6 M | 224x224 | BSD-3-Clause | CNN más pesada, mayor precisión |

No se dispone de datos de precisión (top-1/top-5) para establecer una comparación cuantitativa de calidad en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- Solo clasifica en las 1000 clases de ImageNet; para otras categorías requiere reentrenamiento o fine-tuning.
- Entrada fija de 224x224; no admite otras resoluciones sin reexportar con `qai_hub_models`.
- Los artefactos preexportados están optimizados para chipsets Qualcomm; en otros hardware funcionan vía ONNX/TFLite pero sin las optimizaciones de NPU.
- La cuantización w8a16 puede degradar ligeramente la precisión respecto a float; no se publican métricas de dicha degradación.
- Licencia BSD-3-Clause permite uso comercial con atribución, pero conviene revisar los términos del checkpoint original de `torchvision`.
- Riesgo de sesgo heredado de ImageNet: el modelo puede clasificar erróneamente categorías infrarrepresentadas o sensibles.
- No se han publicado resultados de benchmarks de precisión en este repositorio; no se debe asumir un rendimiento top-1 concreto sin medirlo.

## Enlaces

- HuggingFace: https://huggingface.co/qualcomm/EfficientNet-B0
- Qualcomm AI Hub (modelo): https://aihub.qualcomm.com/models/efficientnet_b0
- Repositorio `qai_hub_models`: https://github.com/qualcomm/ai-hub-models/blob/v0.66.0/src/qai_hub_models/models/efficientnet_b0
- Implementación original en `torchvision`: https://github.com/pytorch/vision/blob/main/torchvision/models/efficientnet.py
- Paper EfficientNet: https://arxiv.org/abs/1905.11946
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Sitio corporativo de Qualcomm: https://www.qualcomm.com/
