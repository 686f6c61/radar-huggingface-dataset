# ketiswp/stm32ai-MobileNetV2-0.35-ImageNet-224-int8-onnx

## Resumen

El modelo `ketiswp/stm32ai-MobileNetV2-0.35-ImageNet-224-int8-onnx` es una versión cuantizada en INT8 (formato QDQ) de MobileNetV2 con factor de ancho 0.35, entrenado en ImageNet a resolución 224x224, y exportado a ONNX para su ejecución con ONNX Runtime. Forma parte del ecosistema STM32 AI Model Zoo de STMicroelectronics, un repositorio de modelos pre-entrenados y optimizados para microcontroladores STM32. El autor original es STMicroelectronics, y este repositorio en HuggingFace es una re-publicación del modelo dentro de ese ecosistema.

Este modelo está diseñado para resolver el problema de clasificación de imágenes en entornos con recursos muy limitados, típicos de microcontroladores y dispositivos embebidos. Su relevancia radica en que permite desplegar una red neuronal convolucional de última generación (MobileNetV2) en hardware de bajo consumo con una huella de memoria reducida gracias a la cuantización INT8. La arquitectura es MobileNetV2, con aproximadamente 1.7 millones de parámetros (factor de ancho 0.35) y una ventana de contexto no aplicable, al tratarse de un modelo de visión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (convoluciones invertidas residuales, factor de ancho 0.35) |
| Parámetros totales | 1,7 millones (aproximado, factor de ancho 0.35 sobre los 3.4M del MobileNetV2 base) |
| Parámetros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No aplicable (entrada de imagen 224x224) |
| Tipos de cuantización | INT8 estático (formato QDQ) |
| Idiomas soportados | No aplicable (clasificación de imágenes) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (contenedor de ONNX Runtime) |

## Arquitectura y entrenamiento

MobileNetV2 introduce dos innovaciones principales sobre MobileNetV1: bloques residuales invertidos (inverted residual blocks) y cuellos de botella lineales (linear bottlenecks). En lugar de aplicar convoluciones profundas a todas las capas, se proyecta la entrada a una dimensión baja, se aplican convoluciones depthwise y se expande de nuevo, con conexiones de salto entre los cuellos de botella. Esta estructura mejora el flujo de gradientes y permite redes más profundas con menor coste computacional. El factor de ancho 0.35 reduce el número de canales en cada capa, disminuyendo los parámetros totales y las operaciones FLOPs, a costa de una menor precisión.

El modelo fue entrenado en el dataset ImageNet (1,2 millones de imágenes, 1000 clases) mediante aprendizaje supervisado estándar. La versión INT8 se obtiene mediante cuantización estática de la versión FP32, convirtiendo los pesos y activaciones a enteros de 8 bits, con un formato QDQ (Quantize-Dequantize) que permite su ejecución en ONNX Runtime. No se ha aplicado RLHF ni DPO, ya que es un modelo de visión supervisado.

## Capacidades

- Clasificación de imágenes en 1000 categorías del dataset ImageNet (objetos, animales, escenas, etc.).
- Inferencia de baja latencia y bajo consumo energético, apta para microcontroladores STM32.
- Procesamiento de imágenes de entrada de 224x224 píxeles (RGB).
- Salida de probabilidades por clase mediante softmax.
- Soporte de ejecución en ONNX Runtime, tanto en CPU como en aceleradores de hardware compatibles.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso, ni capacidades multimodales.

## Casos de uso

- Clasificación de productos en línea de montaje industrial: el modelo puede integrarse en un sistema de visión basado en STM32 para clasificar piezas o productos en tiempo real, aprovechando la baja latencia y el bajo consumo del hardware embebido.
- Detección de defectos visuales en control de calidad: al ser ejecutado en microcontroladores, permite inspección óptica en máquinas de producción sin depender de un servidor central, reduciendo costes de infraestructura.
- Clasificación de plantas o plagas en agricultura de precisión: puede desplegarse en sensores de campo con energía limitada, clasificando imágenes de hojas para detectar enfermedades o especies.
- Reconocimiento de señales de tráfico en sistemas ADAS de bajo coste: adecuado para vehículos que requieren clasificación de señales sin GPU, usando la cuantización INT8 para reducir el consumo de memoria.
- Aplicaciones de accesibilidad en dispositivos portátiles: clasificación de objetos para personas con discapacidad visual, ejecutándose en microcontroladores de bajo coste.
- Prototipado rápido en el ecosistema STM32: sirve como punto de partida para evaluar la viabilidad de redes neuronales en microcontroladores, con la versión FP32 pareja para comparar la degradación de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de precisión en ImageNet, ni comparaciones con otros modelos. El repositorio original de STMicroelectronics en GitHub indica que las medidas de rendimiento se realizan con la configuración por defecto de STM32Cube.AI, pero no se han extraído datos numéricos concretos de la búsqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, ya que es un modelo diseñado para ejecución en microcontroladores con memoria flash y RAM limitada. El modelo INT8 completo ocupa menos de 2 MB (aproximadamente 1,7 MB de pesos).
- GPU recomendadas: no requiere GPU; se ejecuta en CPU de microcontroladores STM32 (Cortex-M4, M7, etc.) o en CPU de escritorio mediante ONNX Runtime.
- Si cabe en consumer GPU: no es relevante; su diseño es para MCU, no para GPU.
- Opciones de despliegue: ONNX Runtime (CPU), STM32Cube.AI para integración en microcontroladores STM32, y ONNX Runtime con proveedores de ejecución en CPU.
- Latencia y throughput estimados: no disponibles; la latencia depende del microcontrolador específico. En el repositorio de STM32 se reportan medidas con STM32Cube.AI, pero no se han extraído números en la búsqueda.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión ImageNet (top-1) | Licencia | Formato |
|---|---|---|---|---|---|
| MobileNetV2 0.35 INT8 (este) | ~1,7 M | 224x224 | No disponible | Apache-2.0 | ONNX |
| MobileNetV2 1.0 | 2,2 M | 224x224 | 71,8 % | Apache-2.0 | ONNX/TFLite |
| MobileNetV3-Large | 5,4 M | 224x224 | 75,2 % | Apache-2.0 | ONNX/TFLite |
| EfficientNet-B0 | 5,3 M | 224x224 | 77,1 % | Apache-2.0 | ONNX/TFLite |

La comparativa se centra en modelos de clasificación de imágenes de tamaño reducido. El factor de ancho 0.35 reduce parámetros y precisión frente a la versión completa de MobileNetV2, pero mejora la eficiencia en hardware embebido. La precisión exacta del modelo 0.35 no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Precisión reducida: la cuantización INT8 puede degradar la precisión entre un 1-2 % respecto al modelo FP32, y el factor de ancho 0.35 reduce aún más el rendimiento en comparación con MobileNetV2 completo.
- Sesgos de ImageNet: el modelo puede tener sesgos en clases subrepresentadas del dataset, como razas humanas o objetos de contextos culturales específicos.
- Riesgo de alucinación: no aplica, ya que es un clasificador de imágenes, no un generador de texto.
- Limitaciones de contexto: solo acepta imágenes de 224x224 píxeles; no procesa video ni imágenes de mayor resolución sin preprocesado.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero la redistribución del modelo con atribución es obligatoria. No hay restricciones adicionales conocidas.
- Consideraciones de producción: la cuantización QDQ está pensada para ONNX Runtime; puede no ser compatible con todos los proveedores de ejecución, y se recomienda validar la precisión en el hardware objetivo antes de desplegar en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ketiswp/stm32ai-MobileNetV2-0.35-ImageNet-224-int8-onnx
- Versión FP32 pareja: https://huggingface.co/ketiswp/stm32ai-MobileNetV2-0.35-ImageNet-224-fp32-onnx
- Modelo original en GitHub (STM32 model zoo): https://github.com/STMicroelectronics/stm32ai-modelzoo/tree/1423c78953a830903485135febe1dd98ff31aed8/image_classification/mobilenetv2
- Modelo STMicroelectronics/mobilenetv2 en HuggingFace: https://huggingface.co/STMicroelectronics/mobilenetv2
- Página del STM32 model zoo: https://stm32ai.st.com/model-zoo/
