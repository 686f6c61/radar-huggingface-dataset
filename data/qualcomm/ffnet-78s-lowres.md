# qualcomm/FFNet-78S-LowRes

## Resumen

FFNet-78S-LowRes es un modelo de segmentación semántica de escenas urbanas desarrollado por Qualcomm AI Research, diseñado para ejecutarse en tiempo real en dispositivos con hardware Qualcomm, especialmente en el NPU integrado en sus SoC. El nombre "FFNet" proviene de "fuss-free network", una arquitectura que busca simplificar el diseño de redes de segmentación sin sacrificar precisión ni velocidad. El modelo clasifica cada píxel de una imagen en una de 19 categorías propias de entornos urbanos, como carretera, acera, peatón, vehículo o señal de tráfico, y está entrenado sobre el dataset Cityscapes.

La versión "78S" indica una variante de tamaño medio dentro de la familia FFNet, con 26,8 millones de parámetros y una resolución de entrada de 1024x512 píxeles. El modelo se distribuye pre-exportado en formatos ONNX, QNN_DLC y TFLITE, con precisiones float y w8a8 (cuantización de 8 bits), lo que permite su despliegue directo en dispositivos Snapdragon y otras plataformas Qualcomm. Su relevancia actual radica en la creciente demanda de modelos de visión por computador eficientes para aplicaciones embebidas, como la conducción autónoma, la asistencia al conductor y la robótica móvil, donde la latencia y el consumo energético son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional para segmentación semántica (FFNet, "fuss-free network") |
| Parametros totales | 26,8 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 1024x512) |
| Tipos de cuantizacion | float (FP32) y w8a8 (cuantización de 8 bits en pesos y activaciones) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX, QNN_DLC, TFLITE (pre-exportados); PyTorch (repo original) |

## Arquitectura y entrenamiento

FFNet-78S-LowRes es una red neuronal convolucional diseñada específicamente para segmentación semántica en tiempo real. La arquitectura se describe en el artículo arXiv:2206.08236, donde se presenta como una alternativa "sin complicaciones" a modelos más complejos como DeepLabV3 o BiSeNet, priorizando la simplicidad y la eficiencia computacional sin renunciar a la precisión. El modelo utiliza un encoder que extrae características de la imagen y un decoder que produce mapas de probabilidad por píxel para las 19 clases de Cityscapes. No se dispone de detalles adicionales sobre el número de capas, bloques residuales o mecanismos de atención, ya que la información pública se centra en el despliegue y el rendimiento en hardware Qualcomm.

El entrenamiento se realizó sobre el dataset Cityscapes, compuesto por imágenes de escenas urbanas capturadas en ciudades alemanas, con anotaciones densas a nivel de píxel. El checkpoint utilizado es `ffnet78S_BCC_cityscapes_state_dict_quarts_pre_down`, que sugiere un pre-entrenamiento en un conjunto de datos más amplio (posiblemente ImageNet) seguido de un ajuste fino en Cityscapes. No se menciona el uso de técnicas como RLHF o DPO, que no son aplicables a modelos de visión. La innovación principal de FFNet radica en su diseño compacto y en la optimización para hardware de borde, más que en una novedad arquitectónica radical.

## Capacidades

- Segmentación semántica de escenas urbanas: clasifica cada píxel en 19 categorías (carretera, acera, edificio, peatón, vehículo, etc.).
- Inferencia en tiempo real en dispositivos Qualcomm: tiempos de 2,7 ms a 40 ms según el chipset y la precisión, lo que permite su uso en aplicaciones de vídeo en tiempo real.
- Soporte de cuantización w8a8: reduce el tamaño del modelo de 102 MB a 26 MB y acelera la inferencia en NPU sin pérdida significativa de precisión (no se especifica el impacto exacto).
- Compatibilidad con múltiples formatos de exportación: ONNX, QNN_DLC y TFLITE, lo que facilita la integración en diferentes entornos de desarrollo (Android, Linux embebido, etc.).
- No incluye capacidades de generación de texto, tool calling, agentes ni procesamiento de lenguaje, al ser un modelo puramente visual.

## Casos de uso

- Conducción autónoma y asistencia al conductor: el modelo puede segmentar la escena en tiempo real para identificar carriles, peatones, vehículos y obstáculos, alimentando sistemas de frenado automático o aviso de colisión. Su baja latencia (8-15 ms en Snapdragon 8 Gen 3) lo hace adecuado para procesar vídeo a 30-60 fps.
- Vigilancia y análisis de tráfico: en cámaras fijas o embarcadas, permite contar vehículos, detectar infracciones o monitorizar el flujo de peatones en intersecciones, gracias a su capacidad de clasificar píxeles en categorías urbanas.
- Robótica móvil y drones: un robot de reparto o un dron de inspección puede usar la segmentación para navegar en entornos urbanos, distinguiendo zonas transitables (carretera, acera) de obstáculos (vehículos, personas).
- Sistemas de asistencia en aparcamiento: el modelo puede identificar plazas libres, bordillos y otros elementos del entorno para ayudar en maniobras de estacionamiento automático o semiautomático.
- Realidad aumentada en navegación: una aplicación móvil puede superponer indicaciones sobre la carretera o resaltar peligros en tiempo real, usando la segmentación para entender la escena.
- Análisis de imágenes aéreas urbanas: aunque entrenado en Cityscapes (perspectiva de cámara de coche), puede adaptarse con fine-tuning para segmentar tejados, calles o zonas verdes en imágenes de drones, útil para planificación urbana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (mIoU, accuracy, etc.) en la información disponible. La model card solo proporciona datos de rendimiento de inferencia en hardware Qualcomm, que se resumen a continuación:

| Runtime | Precision | Chipset | Inference Time (ms) | Peak Memory Range (MB) | Compute Unit |
|---|---|---|---|---|---|
| ONNX | float | Snapdragon X2 Elite | 10,083 | 10 - 10 | NPU |
| ONNX | float | Snapdragon X Elite | 20,084 | 47 - 47 | NPU |
| ONNX | float | Snapdragon 8 Gen 3 Mobile | 15,269 | 4 - 252 | NPU |
| ONNX | float | Snapdragon 8 Gen 1 Mobile | 36,559 | 11 - 244 | NPU |
| ONNX | float | Snapdragon 8 Elite Mobile | 13,341 | 7 - 193 | NPU |
| ONNX | float | Snapdragon 8 Elite Gen 5 Mobile | 8,209 | 5 - 194 | NPU |
| ONNX | w8a8 | Snapdragon X2 Elite | 2,723 | 4 - 4 | NPU |
| ONNX | w8a8 | Snapdragon X Elite | 5,814 | 26 - 26 | NPU |
| ONNX | w8a8 | Snapdragon 8 Gen 3 Mobile | 3,962 | 3 - 253 | NPU |
| ONNX | w8a8 | Snapdragon 8 Gen 1 Mobile | 8,276 | 0 - 252 | NPU |
| ONNX | w8a8 | Snapdragon 8 Elite Mobile | 3,962 | 3 - 253 | NPU |
| ONNX | w8a8 | Snapdragon 8 Elite Gen 5 Mobile | 2,723 | 4 - 4 | NPU |

La cuantización w8a8 reduce el tiempo de inferencia entre 2 y 4 veces en la mayoría de los chipsets, con un aumento mínimo del uso de memoria. No se proporcionan métricas de precisión como mIoU, por lo que no es posible comparar el rendimiento cualitativo con otros modelos.

## Requisitos de hardware

- El modelo está optimizado para el NPU de los SoC Qualcomm, por lo que el despliegue recomendado es en dispositivos con Snapdragon (móviles, tablets, portátiles) o plataformas Dragonwing (IoT, automoción).
- En formato float, el modelo ocupa 102 MB; en w8a8, 26 MB. Esto permite su ejecución en dispositivos con poca memoria, como cámaras IP o módulos de automoción.
- Para inferencia en GPU de escritorio (NVIDIA, AMD), no se proporcionan datos específicos, pero al ser un modelo de 26,8M parámetros, cabría en cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1650 o superior). Sin embargo, el modelo no está optimizado para CUDA y requeriría conversión a ONNX o TensorRT.
- Opciones de despliegue: Qualcomm AI Hub Workbench para compilar y perfilar en dispositivos reales; también se puede usar ONNX Runtime, TFLite o el runtime QNN directamente.
- La latencia en NPU de Qualcomm varía entre 2,7 ms (w8a8 en Snapdragon X2 Elite) y 40 ms (float en Dragonwing IQ-8275), lo que permite procesamiento en tiempo real (30+ fps) en la mayoría de los chipsets modernos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de segmentación semántica (como DeepLabV3, BiSeNet o SegFormer) en términos de precisión y velocidad, ya que la model card no incluye métricas de mIoU ni resultados en benchmarks estándar. Sin embargo, se puede contextualizar:

| Modelo | Parametros | Resolucion de entrada | Dataset | Licencia | Formato |
|---|---|---|---|---|---|
| FFNet-78S-LowRes | 26,8M | 1024x512 | Cityscapes | BSD-3-Clause | ONNX, TFLITE, QNN |
| DeepLabV3 (ResNet50) | ~39M | 513x513 | Cityscapes | Apache-2.0 | PyTorch, ONNX |
| BiSeNetV2 | ~49M | 1024x512 | Cityscapes | MIT | PyTorch |

FFNet-78S-LowRes es significativamente más ligero que BiSeNetV2 y comparable a DeepLabV3 en tamaño, pero su ventaja principal es la optimización específica para NPU de Qualcomm, que no está disponible en los otros modelos. No se dispone de datos de precisión para afirmar que supera o iguala a estos modelos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en Cityscapes, un dataset de escenas urbanas de ciudades alemanas (Múnich, Stuttgart, etc.). Esto puede introducir sesgos geográficos y de estilo: el rendimiento puede degradarse en entornos con diferente señalización, clima, vegetación o densidad de tráfico.
- La resolución de entrada está fijada en 1024x512. Si se usan otras resoluciones, el modelo puede requerir re-escalado o fine-tuning, y la precisión puede verse afectada.
- No se han publicado métricas de precisión (mIoU, accuracy) en la documentación oficial, por lo que es difícil evaluar su calidad frente a alternativas sin realizar pruebas propias.
- El modelo está pensado para hardware Qualcomm. En otras plataformas (GPU NVIDIA, CPU x86) puede funcionar, pero no se garantiza el mismo rendimiento ni se ofrecen guías de optimización.
- La cuantización w8a8 puede introducir una pérdida de precisión no cuantificada en la documentación. Se recomienda validar el impacto en el caso de uso específico.
- La licencia BSD-3-Clause permite uso comercial, pero el modelo depende de pesos pre-entrenados que pueden estar sujetos a condiciones adicionales del dataset Cityscapes (que tiene su propia licencia de investigación). Es necesario revisar los términos de uso de Cityscapes si se planea un despliegue comercial.

## Enlaces

- [HuggingFace - qualcomm/FFNet-78S-LowRes](https://huggingface.co/qualcomm/FFNet-78S-LowRes)
- [Qualcomm AI Hub - FFNet-78S-LowRes](https://aihub.qualcomm.com/models/ffnet_78s_lowres)
- [Qualcomm AI Hub IoT - FFNet-78S-LowRes](https://aihub.qualcomm.com/iot/models/ffnet_78s_lowres)
- [GitHub - Qualcomm-AI-research/FFNet (implementación original)](https://github.com/Qualcomm-AI-research/FFNet)
- [GitHub - qualcomm/ai-hub-models (carpeta del modelo)](https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/ffnet_78s_lowres)
- [Artículo arXiv:2206.08236](https://arxiv.org/abs/2206.08236)
