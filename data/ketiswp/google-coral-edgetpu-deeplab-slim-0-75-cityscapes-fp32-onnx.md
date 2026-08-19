# ketiswp/google-coral-EdgeTPU-DeepLab-Slim-0.75-Cityscapes-fp32-onnx

## Resumen

El modelo `ketiswp/google-coral-EdgeTPU-DeepLab-Slim-0.75-Cityscapes-fp32-onnx` es una conversión a ONNX en precisión FP32 del modelo DeepLab Slim 0.75 de Google Coral, diseñado para segmentación semántica de escenas urbanas. El modelo original fue entrenado por Google sobre el dataset Cityscapes y está pensado para ejecutarse en dispositivos Edge TPU, aunque esta versión ONNX permite su uso en cualquier runtime compatible con ONNX, como ONNX Runtime, sin necesidad de hardware específico de Coral.

La arquitectura DeepLab v3+ con factor de reducción Slim 0.75 reduce el número de canales de las capas convolucionales, lo que lo hace especialmente adecuado para entornos con recursos limitados. El modelo acepta imágenes de entrada y produce un mapa de segmentación por píxel con 19 clases de objetos urbanos (personas, vehículos, infraestructuras, etc.). Su relevancia actual radica en servir como alternativa ligera y portable para aplicaciones de visión por computador en el edge, con licencia Apache 2.0 que permite uso comercial sin restricciones.

La información disponible es limitada: no se publican parámetros totales, contexto ni datos de entrenamiento detallados. La conversión a ONNX FP32 mantiene la precisión original del modelo, a diferencia de la versión UINT8 también publicada por el autor, que está cuantizada para Edge TPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepLab v3 (Slim 0.75) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | FP32 (esta version); existe version UINT8 para Edge TPU |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (safetensors no aplica; formato .onnx) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DeepLab v3 de Google, que utiliza una red de convoluciones dilatadas (atrous convolutions) en combinación con un módulo ASPP (Atrous Spatial Pyramid Pooling) para capturar contexto multiescala. La variante "Slim" con factor 0.75 reduce el número de canales en las capas convolucionales, lo que reduce el coste computacional y el tamaño del modelo a costa de una menor precisión. El modelo fue entrenado sobre el dataset Cityscapes, que contiene imágenes de escenas urbanas con anotaciones de segmentación semántica para 19 clases.

La versión ONNX FP32 se generó a partir del modelo original de TensorFlow disponible en el repositorio oficial de DeepLab de Google, convertido mediante la herramienta de conversión correspondiente. No se han publicado detalles sobre el proceso de entrenamiento original (número de épocas, configuración de optimizador, técnicas de regularización) en la información proporcionada. La conversión a ONNX no introduce cambios en la arquitectura ni en los pesos, solo en el formato de representación.

## Capacidades

- Segmentación semántica de imágenes: clasifica cada píxel de la imagen en una de las 19 clases de Cityscapes (caminos, vehículos, personas, edificios, etc.).
- Inferencia en tiempo real en dispositivos de bajo consumo: el modelo Slim 0.75 está diseñado para ejecutarse en hardware edge como el Edge TPU de Google, aunque esta versión ONNX puede ejecutarse en cualquier CPU o GPU.
- Compatibilidad con ONNX Runtime: puede integrarse en pipelines de Python, C++, o en entornos de producción mediante servidores de inferencia como ONNX Runtime Server o Triton.
- Soporte de entrada de imágenes de tamaño variable: el modelo acepta imágenes de cualquier tamaño, aunque el rendimiento óptimo se obtiene con resoluciones cercanas a 1024x2048 (resolución nativa de Cityscapes).
- No soporta tool calling, agentes ni razonamiento multimodal: es un modelo de visión puro, sin capacidades de lenguaje.

## Casos de uso

- Conducción autónoma y asistencia al conductor: el modelo puede segmentar la escena de la carretera en tiempo real para identificar carriles, vehículos, peatones y señalización, integrado en sistemas de ADAS o vehículos autónomos.
- Videovigilancia urbana: análisis de cámaras de tráfico para contar vehículos, detectar obstáculos en la calzada o identificar infracciones, ejecutándose en servidores o dispositivos edge.
- Robótica móvil: robots de reparto o limpieza que necesitan entender el entorno para navegar, evitando obstáculos y detectando zonas transitables.
- Realidad aumentada: superposición de información semántica sobre la vista de un dispositivo móvil, por ejemplo, para indicar carriles bici o zonas peatonales.
- Análisis de imágenes satelitales o aéreas: adaptación del modelo para segmentar infraestructuras urbanas, aunque no está entrenado para este dominio, puede servir como base para transferencia de aprendizaje.
- Sistema de control de calidad en industria: si se reentrena con un dataset propio, puede segmentar defectos en superficies o componentes en líneas de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como mIoU sobre Cityscapes, ni comparaciones con otros modelos. La documentación original de DeepLab Slim 0.75 en Cityscapes reporta un mIoU de aproximadamente 65,5 en el conjunto de validación, pero este dato no se confirma en la información proporcionada, por lo que no se incluye como cifra oficial.

## Requisitos de hardware

- El modelo es ligero: el tamaño del archivo ONNX es aproximadamente 5-10 MB (estimación razonable para un modelo Slim 0.75 con entrada 1024x1024), aunque el tamaño exacto no se especifica.
- VRAM estimada para inferencia en FP32: entre 0.5 y 2 GB, dependiendo de la resolución de entrada y del backend.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650 o superior. También puede ejecutarse en CPU con tiempos de inferencia de 100-500 ms por imagen.
- Compatible con Edge TPU: la versión UINT8 está compilada para Coral USB Accelerator o Dev Board, pero esta versión FP32 no es compatible con el Edge TPU (requiere cuantización a 8 bits).
- Opciones de despliegue: ONNX Runtime (CPU/CUDA), TensorRT, OpenVINO, o servicios como ONNX Server.
- Latencia estimada: en una CPU moderna (i5-10000), aproximadamente 200-400 ms por imagen de 1024x1024; en una GPU NVIDIA T4, 20-50 ms.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| DeepLab Slim 0.75 (este) | DeepLab v3 | no disponible | n/a | Apache 2.0 | ONNX |
| DeepLab v3 (full) | DeepLab v3 | ~60 M | n/a | Apache 2.0 | TensorFlow |
| MobileNetV3-Seg | MobileNet + decoder | ~10 M | n/a | Apache 2.0 | TensorFlow |
| SegFormer-B0 | Transformer | 3.7 M | n/a | Apache 2.0 | PyTorch |

La comparativa es orientativa, ya que no se dispone de benchmarks del modelo en ONNX. DeepLab Slim 0.75 es más pequeño y rápido que DeepLab v3 completo, pero menos preciso. SegFormer-B0 ofrece un mejor equilibrio entre eficiencia y precisión, aunque no está optimizado para Edge TPU.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con imágenes de escenas urbanas europeas de Cityscapes; su rendimiento puede degradarse en entornos rurales, industriales o con condiciones climáticas extremas.
- La precisión de segmentación es limitada en comparación con modelos más grandes; Slim 0.75 sacrifica calidad por velocidad y tamaño.
- No se ha validado el modelo en producción: no se ha publicado información sobre sesgos, robustez ante adversarios o comportamiento en condiciones de iluminación variable.
- La conversión ONNX puede introducir ligeras diferencias numéricas respecto al modelo original de TensorFlow, aunque en FP32 el impacto es mínimo.
- La licencia Apache 2.0 permite uso comercial y modificación, pero no incluye garantías ni soporte técnico.
- No es compatible con Edge TPU en su versión FP32; para ese hardware hay que usar la versión UINT8 del mismo autor.

## Enlaces

- [Modelo en HuggingFace (FP32 ONNX)](https://huggingface.co/ketiswp/google-coral-EdgeTPU-DeepLab-Slim-0.75-Cityscapes-fp32-onnx)
- [Version UINT8 del mismo modelo](https://huggingface.co/ketiswp/google-coral-EdgeTPU-DeepLab-Slim-0.75-Cityscapes-uint8-onnx)
- [Repositorio original de TensorFlow DeepLab](https://github.com/tensorflow/models/tree/archive/research/deeplab)
- [Repositorio coral-deeplab en GitHub](https://github.com/xadrianzetx/coral-deeplab)
- [Pagina de modelos de Coral](http://www.coral.withgoogle.com/models/all/)
- [Pagina oficial de Coral](https://developers.google.com/coral)
