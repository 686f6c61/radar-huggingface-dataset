# qualcomm/MobileNet-v3-Small

## Resumen

MobileNet-v3-Small es una red neuronal convolucional (CNN) para clasificación de imágenes sobre ImageNet, publicada por Qualcomm como parte de su catálogo Qualcomm AI Hub Models. El modelo se basa en la implementación oficial de MobileNetV3-Small de `torchvision` y se distribuye en formatos preexportados y optimizados para ejecutarse en la NPU de chipsets Snapdragon y Dragonwing. Con 2,54 millones de parámetros y un checkpoint en coma flotante de 9,71 MB, está pensado para inferencia en tiempo real en dispositivos móviles y de borde (edge).

La relevancia de esta ficha no reside en el modelo en sí (la arquitectura MobileNetV3-Small es conocida desde 2019, paper arXiv:1905.02244), sino en el trabajo de despliegue: Qualcomm ofrece artefactos ONNX, QNN_DLC y TFLite con cuantización mixta `w8a16_mixed_int16`, junto con métricas medidas sobre hardware real. Los tiempos de inferencia reportados oscilan entre 0,232 ms y 0,797 ms según el chipset, con la NPU como unidad de cómputo principal.

El modelo no es un LLM ni un modelo generativo: es un backbone de visión para clasificación de 1000 clases de ImageNet, reutilizable como extractor de características en pipelines más complejos. Su licencia BSD-3-Clause y su tamaño reducido lo hacen adecuado para prototipado rápido y para integración en aplicaciones Android.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (MobileNetV3-Small, inverted residual blocks + squeeze-and-excitation) |
| Parametros totales | 2,54 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224x224 píxeles) |
| Tipos de cuantizacion | float; w8a16_mixed_int16 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | PyTorch (torchvision), ONNX, QNN_DLC, TFLite |
| Resolucion de entrada | 224x224 |
| Numero de clases | 1000 (ImageNet) |
| Tamano del checkpoint (float) | 9,71 MB |
| Runtime evaluado | QAIRT 2.51, ONNX Runtime 1.30.0 |

## Arquitectura y entrenamiento

MobileNetV3-Small es una CNN diseñada mediante búsqueda de arquitectura (NAS) combinada con el bloque `MnasNet` y módulos de atención tipo squeeze-and-excitation. Emplea convoluciones separables en profundidad (depthwise separable convolutions) y una función de activación hard-swish en las capas finales, lo que reduce el coste computacional manteniendo una precisión razonable para su tamaño. La arquitectura es la implementación estándar de `torchvision.models.mobilenetv3`, sin modificaciones estructurales por parte de Qualcomm.

El checkpoint distribuido en este repositorio es el preentrenado en ImageNet que acompaña a `torchvision`. No se documentan en la información disponible detalles sobre el número exacto de tokens de entrenamiento (no aplica), la composición del dataset más allá de ImageNet, ni si hubo ajuste fino adicional, RLHF o destilación. La innovación aportada por Qualcomm es de despliegue: exportación a QNN_DLC y TFLite, compilación con QAIRT 2.51, cuantización mixta `w8a16_mixed_int16` y perfilado sobre NPU de chipsets concretos mediante Qualcomm AI Hub Workbench.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet a resolución 224x224.
- Extracción de características (backbone) para modelos de visión de mayor complejidad, según indica la model card.
- Inferencia en tiempo real en NPU de dispositivos Qualcomm (Snapdragon y Dragonwing).
- Ejecución con precisión float y con cuantización mixta `w8a16_mixed_int16`.
- Despliegue multiplataforma mediante ONNX, QNN_DLC y TFLite.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües, de visión generativa, audio ni modo thinking.

## Casos de uso

- Clasificación de imágenes en aplicaciones Android: el modelo se integra mediante TFLite u ONNX y clasifica fotogramas de cámara en tiempo real; los tiempos medidos en NPU (0,232-0,797 ms) permiten procesar vídeo a alta cadencia sin penalizar la batería.
- Preprocesado en pipelines de visión: se usa como extractor de características previo a un clasificador específico o a un detector, aprovechando su tamaño de 2,54 M de parámetros para mantener el coste bajo.
- Filtrado y moderación de contenido en el dispositivo: clasificación rápida de imágenes para descartar o etiquetar contenido antes de enviarlo a un servicio en la nube, reduciendo ancho de banda y latencia.
- Automatización industrial y robótica de borde: inspección visual de piezas o clasificación de objetos en cámaras conectadas a módulos Dragonwing o QCS, donde el modelo corre en NPU con consumo mínimo.
- Prototipado rápido de producto: al estar disponible en ONNX y TFLite con artefactos preexportados, permite validar una idea de clasificación en un dispositivo Qualcomm sin entrenar ni exportar manualmente.
- Baseline en investigación de eficiencia: sirve como referencia de latencia y precisión para comparar técnicas de cuantización o de optimización de despliegue en NPU.
- Aplicaciones de realidad aumentada y wearables: la baja huella de memoria (rango de pico de 0 a 57 MB según chipset y precisión) permite ejecutarlo junto a otros modelos en dispositivos con recursos limitados.

## Benchmarks y rendimiento

La model card no publica métricas de precisión (top-1/top-5 en ImageNet) en la información disponible. Sí incluye tiempos de inferencia medidos por Qualcomm AI Hub Workbench sobre hardware real, con la NPU como unidad principal:

| Chipset | Runtime | Precision | Tiempo de inferencia (ms) | Memoria pico (MB) |
|---|---|---|---|---|
| Snapdragon 8 Elite Extreme Gen 6 Mobile | ONNX | float | 0,232 | 1 - 35 |
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | ONNX | float | 0,255 | 0 - 34 |
| Snapdragon X2 Elite | ONNX | float | 0,240 | 2 - 2 |
| Snapdragon 8 Elite Gen 6 Mobile | ONNX | float | 0,285 | 1 - 35 |
| Snapdragon 8 Gen 3 Mobile | ONNX | float | 0,364 | 0 - 49 |
| Snapdragon X Elite | ONNX | float | 0,545 | 5 - 5 |
| Snapdragon 8 Gen 1 Mobile | ONNX | float | 0,797 | 1 - 57 |
| Dragonwing IQ-8275 | ONNX | float | 0,578 | 0 - 5 |
| Dragonwing QCS8550 (Proxy) | ONNX | float | 0,573 | 0 - 8 |
| Dragonwing IQ-9075 | ONNX | float | 0,627 | 1 - 4 |
| Dragonwing IQ-X7181 | ONNX | float | 0,545 | 5 - 5 |
| Dragonwing Q-8750 | ONNX | float | 0,284 | 0 - 37 |
| QCS8450 | ONNX | float | 0,797 | 1 - 57 |
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | ONNX | w8a16_mixed_int16 | 0,237 | 0 - 38 |
| Snapdragon 8 Elite For Galaxy Mobile | ONNX | w8a16_mixed_int16 | 0,271 | 0 - 41 |
| Snapdragon X2 Elite | ONNX | w8a16_mixed_int16 | 0,226 | 1 - 1 |
| Snapdragon X Elite | ONNX | w8a16_mixed_int16 | 0,558 | 0 - 0 |
| Snapdragon 8 Gen 3 Mobile | ONNX | w8a16_mixed_int16 | 0,383 | 0 - 51 |
| Dragonwing IQ-8275 | ONNX | w8a16_mixed_int16 | 0,536 | 0 - 4 |
| Dragonwing QCS8550 (Proxy) | ONNX | w8a16_mixed_int16 | 0,585 | 0 - 5 |

No se han publicado resultados de precisión (top-1/top-5) en la información disponible. Los datos de la tabla anterior corresponden exclusivamente a latencia y memoria pico reportadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo está pensado para NPU y CPU de dispositivos móviles, no para GPU de servidor. El checkpoint en float ocupa 9,71 MB y la memoria pico medida en NPU va de 0 a 57 MB según chipset y precisión.
- GPU recomendadas: no se documentan; el perfilado oficial se realiza sobre NPU de chipsets Snapdragon y Dragonwing.
- Cabe en GPU de consumo: sí, por tamaño (2,54 M de parámetros), aunque no es el escenario objetivo ni se publican métricas para RTX 4090, A100 o H100.
- Opciones de despliegue: ONNX Runtime 1.30.0, QNN_DLC con QAIRT 2.51, TFLite; exportación personalizada mediante la librería `qualcomm/ai-hub-models` (v0.67.0) y Qualcomm AI Hub Workbench.
- Latencia y throughput: entre 0,226 ms y 0,797 ms por inferencia en NPU según chipset (ver tabla de benchmarks); el throughput no se publica de forma explícita.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MobileNet-v3-Small (Qualcomm) | 2,54 M | 224x224 | no aplica | BSD-3-Clause | Hugging Face, AI Hub, GitHub |
| MobileNetV3-Small (torchvision) | 2,54 M | 224x224 | no aplica | BSD-3-Clause | PyTorch Hub / torchvision |
| MobileNetV2 | no disponible en la informacion | 224x224 | no aplica | BSD-3-Clause (torchvision) | torchvision |
| EfficientNet-B0 | no disponible en la informacion | 224x224 | no aplica | Apache-2.0 (torchvision) | torchvision |

La comparativa se limita a modelos de la misma familia y categoría (CNN ligeras para clasificación de imágenes). No se dispone de datos de precisión comparada en la información proporcionada, por lo que la comparación se centra en tamaño, licencia y disponibilidad de artefactos optimizados para NPU.

## Limitaciones y advertencias

- Modelo de visión, no de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- Solo clasifica las 1000 clases de ImageNet; fuera de ese dominio su utilidad como clasificador directo es limitada.
- No se publican métricas de precisión (top-1/top-5) en la información disponible, lo que impide evaluar la degradación introducida por la cuantización `w8a16_mixed_int16`.
- Riesgo de sesgo heredado de ImageNet: el dataset presenta desequilibrios demográficos y geográficos conocidos que pueden trasladarse a las predicciones.
- Riesgo de alucinación en el sentido de clasificaciones erróneas con alta confianza en imágenes fuera de distribución; no aplica el concepto de alucinación generativa.
- Los tiempos de inferencia reportados son específicos de chipsets Qualcomm y de las versiones QAIRT 2.51 / ONNX Runtime 1.30.0; no son extrapolables a otros hardware o runtimes.
- La licencia BSD-3-Clause permite uso comercial con atribución, pero conviene revisar las condiciones de los artefactos preexportados y del SDK QAIRT, que pueden tener términos propios.
- El repositorio ocupa 0,9 GB por los múltiples artefactos empaquetados; el checkpoint en float es de solo 9,71 MB.

## Enlaces

- Hugging Face: https://huggingface.co/qualcomm/MobileNet-v3-Small
- Qualcomm AI Hub (modelo): https://aihub.qualcomm.com/models/mobilenet_v3_small
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Repositorio ai-hub-models (GitHub): https://github.com/qualcomm/ai-hub-models/blob/v0.67.0/src/qai_hub_models/models/mobilenet_v3_small
- Implementación de referencia en torchvision: https://github.com/pytorch/vision/blob/main/torchvision/models/mobilenetv3.py
- Paper MobileNetV3 (arXiv:1905.02244): https://arxiv.org/abs/1905.02244
- Qualcomm (sitio corporativo): https://www.qualcomm.com/
