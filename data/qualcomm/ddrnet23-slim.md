# qualcomm/DDRNet23-Slim

## Resumen

DDRNet23-Slim es un modelo de segmentación semántica de imágenes desarrollado por Qualcomm, diseñado específicamente para escenas de carretera y aplicaciones de conducción autónoma. Se basa en la arquitectura DDRNet (Deep Dual-resolution Network), presentada en el artículo arXiv:2101.06085, y su versión "Slim" reduce el número de parámetros a 6,13 millones, lo que permite inferencia en tiempo real en dispositivos móviles y embebidos. El modelo segmenta cada píxel de la imagen en una de 19 clases semánticas (vehículos, peatones, carretera, señales, etc.) y está optimizado para ejecutarse en hardware Qualcomm mediante su kit de herramientas AI Hub.

La relevancia actual de este modelo radica en su capacidad para ejecutarse en dispositivos de borde con latencias de entre 11 y 56 ms según el chipset, lo que lo hace adecuado para sistemas avanzados de asistencia al conductor (ADAS), robótica móvil y monitorización de tráfico en tiempo real. El repositorio de Hugging Face incluye pesos pre-exportados en formatos ONNX, TFLITE y QNN_DLC, así como scripts para exportar configuraciones personalizadas. La licencia MIT permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DDRNet (Deep Dual-resolution Network) - variante Slim |
| Parametros totales | 6,13 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | float (FP32) y w8a8 (pesos y activaciones de 8 bits) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | PyTorch, ONNX, TFLITE, QNN_DLC |

## Arquitectura y entrenamiento

DDRNet23-Slim se basa en la arquitectura DDRNet, que emplea dos ramas de resolución diferente (alta y baja) conectadas entre sí mediante módulos de fusión bilateral. Esta estructura permite capturar tanto detalles finos como contexto global de forma eficiente, manteniendo un coste computacional reducido. La variante Slim reduce la anchura de las capas respecto al DDRNet23 original, logrando 6,13 millones de parámetros y un tamaño de checkpoint de 21,7 MB en precisión float.

El modelo se entrena para segmentación semántica de escenas urbanas, con 19 clases de salida típicas del dataset Cityscapes. El checkpoint incluido (DDRNet23s_imagenet.pth) indica un pre-entrenamiento en ImageNet antes del ajuste fino para segmentación. No se dispone de información detallada sobre el número de tokens de entrenamiento, composición exacta del dataset o técnicas de alineación como RLHF/DPO, ya que no se mencionan en la documentación proporcionada. La implementación de referencia está disponible en el repositorio GitHub de DDRNet.pytorch.

## Capacidades

- Segmentación semántica de imágenes en 19 clases, orientada a escenas de carretera (vehículos, peatones, carretera, edificios, vegetación, etc.).
- Inferencia en tiempo real en dispositivos Qualcomm gracias a la optimización para NPU (unidad de procesamiento neuronal).
- Soporte de exportación a múltiples formatos: ONNX, TFLITE y QNN_DLC, lo que facilita la integración en aplicaciones Android, embebidas y de escritorio.
- Posibilidad de personalizar pesos, formas de entrada y configuraciones de hardware mediante la librería Qualcomm AI Hub Models.
- No incluye capacidades de generación de texto, tool calling, agentes ni procesamiento de lenguaje natural, al ser un modelo exclusivamente visual.

## Casos de uso

- Conducción autónoma y ADAS: el modelo segmenta en tiempo real los elementos de la carretera (carriles, señales, peatones, otros vehículos) a partir de cámaras frontales, permitiendo a los sistemas de asistencia tomar decisiones de frenado o cambio de carril. Su baja latencia (11-20 ms en chipsets Snapdragon 8 Gen 3 y superiores) lo hace viable para procesamiento embebido.
- Monitorización de tráfico en infraestructuras urbanas: cámaras fijas en intersecciones o autopistas pueden usar DDRNet23-Slim para contar vehículos, detectar obstáculos o analizar el flujo de tráfico en tiempo real, con un coste computacional mínimo.
- Robótica móvil y drones: robots de reparto o vehículos aéreos no tripulados pueden emplear la segmentación semántica para distinguir superficies transitables, obstáculos y zonas peligrosas, mejorando la navegación autónoma en entornos exteriores.
- Aplicaciones móviles de realidad aumentada: la segmentación de escenas permite superponer objetos virtuales sobre el entorno real de forma coherente, por ejemplo, para simular la colocación de mobiliario o señalización vial en una vista de cámara.
- Análisis de video en tiempo real para seguridad vial: sistemas de cámaras en vehículos o infraestructuras pueden detectar comportamientos anómalos (peatones en zonas prohibidas, vehículos en carriles incorrectos) mediante la clasificación píxel a píxel.
- Prototipado de sistemas de percepción en investigación: al ser un modelo ligero y de código abierto, es útil como punto de partida para experimentos de segmentación en tiempo real, permitiendo ajustar la arquitectura o los pesos para dominios específicos (por ejemplo, entornos agrícolas o industriales).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (mIoU, accuracy, etc.) en la información disponible. La documentación proporcionada solo incluye métricas de latencia y memoria para diferentes dispositivos Qualcomm, que se detallan en la sección de requisitos de hardware. Para obtener datos de calidad, se recomienda consultar el artículo original (arXiv:2101.06085) o el repositorio de implementación.

## Requisitos de hardware

- VRAM estimada: el modelo en float ocupa 21,7 MB y en w8a8 6,11 MB, por lo que cabe en cualquier GPU moderna, incluso en las integradas. La memoria pico durante la inferencia varía entre 1 y 300 MB según el dispositivo y la precisión, según la tabla de rendimiento de Qualcomm.
- GPUs recomendadas: no se requiere una GPU de alta gama; cualquier GPU con al menos 1 GB de VRAM es suficiente. Para el rendimiento óptimo en tiempo real, se recomienda usar la NPU de chipsets Qualcomm (Snapdragon, Dragonwing).
- Compatibilidad con GPU de consumo: sí, el modelo se puede ejecutar en GPUs de consumo como RTX 3060 o superiores mediante ONNX Runtime o PyTorch, aunque la latencia será mayor que en la NPU de Qualcomm.
- Opciones de despliegue: ONNX Runtime, TFLite, QNN (Qualcomm Neural Network), y la librería Qualcomm AI Hub Models para exportación personalizada. También se puede usar directamente con PyTorch.
- Latencia y throughput: según la tabla de rendimiento, en ONNX float la latencia varía entre 11,385 ms (Snapdragon 8 Elite Gen 5) y 45,616 ms (Snapdragon 8 Gen 1). En w8a8, la latencia es mayor (hasta 196 ms en Dragonwing Q-6690), pero el consumo de memoria se reduce significativamente. En general, el modelo alcanza tasas de procesamiento de 20-90 FPS en los chipsets más recientes.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de segmentación en tiempo real (como BiSeNet, STDC o RegSeg) en la documentación proporcionada. Para una comparación rigurosa, se recomienda consultar el paper original de DDRNet, donde se comparan con varias arquitecturas en el dataset Cityscapes.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para escenas de carretera urbanas; su rendimiento puede degradarse en entornos no urbanos (campos, interiores, condiciones meteorológicas extremas) o con clases fuera de las 19 definidas.
- La resolución de entrada fija de 2048x1024 puede requerir reescalado de las imágenes, lo que introduce distorsión o pérdida de detalle si la cámara no coincide con esa relación de aspecto.
- No se han documentado sesgos específicos, pero al ser un modelo de visión entrenado en datasets urbanos, puede presentar errores en condiciones de baja iluminación, oclusiones o con objetos poco frecuentes.
- El rendimiento óptimo está ligado al hardware Qualcomm; en otras plataformas (GPU NVIDIA, CPU Intel) la latencia puede ser significativamente mayor y no se garantiza la operación en tiempo real.
- Aunque la licencia MIT permite uso comercial, el modelo se distribuye con pesos pre-entrenados que pueden no estar actualizados con las últimas técnicas de segmentación; se recomienda validar su precisión en el caso de uso concreto antes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/qualcomm/DDRNet23-Slim
- Qualcomm AI Hub (página del modelo): https://aihub.qualcomm.com/models/ddrnet23_slim
- Repositorio GitHub de Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/ddrnet23_slim
- Implementación original de DDRNet: https://github.com/chenjun2hao/DDRNet.pytorch
- Paper original (arXiv:2101.06085): https://arxiv.org/abs/2101.06085
