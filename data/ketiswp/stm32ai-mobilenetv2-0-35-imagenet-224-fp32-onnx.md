# ketiswp/stm32ai-MobileNetV2-0.35-ImageNet-224-fp32-onnx

## Resumen

El modelo `ketiswp/stm32ai-MobileNetV2-0.35-ImageNet-224-fp32-onnx` es una conversión a formato ONNX con precisión FP32 del modelo MobileNetV2 con factor de ancho 0.35, entrenado en ImageNet y listo para clasificación de imágenes con resolución de entrada de 224x224 píxeles. La conversión proviene del modelo original alojado en el repositorio de STMicroelectronics, `stm32ai-modelzoo`, que agrupa modelos optimizados para su despliegue en microcontroladores STM32 mediante la herramienta STM32Cube.AI.

El modelo está pensado para la clasificación de imágenes en el borde (edge AI). Su arquitectura MobileNetV2, con bloques residuales invertidos y convoluciones en profundidad (depthwise), ofrece un equilibrio entre precisión y coste computacional, lo que lo hace adecuado para sistemas embebidos con recursos limitados. El factor de ancho 0.35 reduce el número de canales respecto al MobileNetV2 estándar, disminuyendo el número de parámetros y operaciones, a costa de una precisión inferior. El archivo se distribuye en formato ONNX con pesos en FP32, y existe una versión INT8 complementaria publicada por el mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (bloques residuales invertidos y cuellos de botella lineales) |
| Parametros totales | aproximadamente 3,5 millones (factor de ancho 0.35) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision, entrada de 224x224 píxeles) |
| Tipos de cuantizacion | FP32 (version actual); version INT8 disponible por separado |
| Idiomas soportados | no aplicable |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (safetensors no aplicable) |

## Arquitectura y entrenamiento

La arquitectura MobileNetV2 se basa en bloques residuales invertidos. A diferencia de los bloques residuales clasicos, que expanden la representacion en la entrada y la comprimen en la salida, MobileNetV2 invierte el proceso: usa cuellos de botella (bottleneck) delgados en la entrada y salida, y expande el numero de canales en la capa intermedia, donde aplica convoluciones depthwise. Esta estructura mejora el flujo de gradientes y permite construir redes mas profundas con menos operaciones.

El modelo fue entrenado en el conjunto de datos ImageNet, con resolucion de entrada de 224x224. En el repositorio de STMicroelectronics se ofrecen variantes entrenadas desde cero (tfs, "training from scratch") y con transferencia de aprendizaje (tl, "transfer learning"), donde el backbone se inicializa con pesos preentrenados y solo se descongela la ultima capa durante el entrenamiento. La informacion proporcionada no especifica cual de estas variantes corresponde a este archivo concreto. No se menciona el uso de tecnicas como RLHF o DPO, que no son habituales en modelos de clasificacion de imagenes.

## Capacidades

- Clasificacion de imagenes en 1000 categorias de ImageNet.
- Inferencia en dispositivos embebidos, gracias al diseno eficiente de MobileNetV2 y la compatibilidad con STM32Cube.AI.
- Soporte para inferencia con ONNX Runtime en plataformas de escritorio y servidor.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso, al ser un modelo exclusivamente de vision.
- No dispone de capacidades multilingue ni de vision adicional (deteccion, segmentacion) fuera de la clasificacion de imagenes.

## Casos de uso

- Clasificacion de imagenes en el borde: el modelo puede desplegarse en microcontroladores STM32 para aplicaciones de vision industrial, como control de calidad en lineas de produccion, donde se requiere una inferencia rapida y con bajo consumo.
- Sistema de vigilancia con deteccion de objetos: aunque el modelo solo clasifica, puede integrarse en un pipeline previo de deteccion para etiquetar regiones de interes, por ejemplo, para distinguir vehiculos o personas en imagenes capturadas por camaras IP.
- Aplicaciones de agricultura de precision: clasificacion de imagenes de cultivos para identificar plagas o enfermedades, utilizando fotografias tomadas por drones o telefonos moviles.
- Asistencia visual para personas con discapacidad: el modelo puede usarse en una aplicacion movil que clasifique objetos del entorno y proporcione descripciones de audio, gracias a su tamano reducido.
- Clasificacion de imagenes medicas: el modelo puede adaptarse mediante transferencia de aprendizaje para clasificar radiografias u otras imagenes diagnosticas, aunque se recomienda validar su rendimiento con datos especificos del dominio.
- Sistema de recomendacion de contenido: en una aplicacion de galeria de fotos, el modelo puede etiquetar automaticamente las imagenes (por ejemplo, "playa", "mascota", "coche") para organizar y filtrar el contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de HuggingFace no incluye metricas de precision ni comparaciones con otros modelos. En el repositorio de STMicroelectronics se mencionan medidas de rendimiento con STM32Cube.AI, pero los datos concretos no se proporcionan en la informacion consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable en dispositivos embebidos; en CPU de escritorio, el modelo FP32 requiere aproximadamente 14 MB de memoria para los pesos (3,5 millones de parametros x 4 bytes).
- GPU recomendadas: no se requiere GPU para inferencia; el modelo puede ejecutarse en CPU y en microcontroladores STM32.
- Compatibilidad con GPU de consumo: el modelo es lo suficientemente pequeno para ejecutarse en cualquier GPU moderna, pero no aporta ventaja en rendimiento frente a una CPU.
- Opciones de despliegue: STM32Cube.AI para microcontroladores, ONNX Runtime en servidores o escritorio, y herramientas como llama.cpp no son aplicables (no es un modelo de lenguaje).
- Latencia y throughput estimados: no disponible en la informacion proporcionada. En microcontroladores STM32, la latencia dependera del modelo especifico (por ejemplo, STM32H7) y de la frecuencia de reloj.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Prevision | Licencia |
|---|---|---|---|---|
| STM32AI MobileNetV2 0.35 (este) | 3,5 M | 224x224 | FP32 ONNX | Apache 2.0 |
| MobileNetV2 estandar (Google) | 3,5 M | 224x224 | Originalmente TF | Apache 2.0 |
| MobileNetV2 0.35 (Google) | 3,5 M | 96x96 | TF | Apache 2.0 |
| EfficientNet-Lite0 | 4,7 M | 224x224 | TF | Apache 2.0 |

La version estandar de MobileNetV2 tiene el mismo numero de parametros que la variante 0.35, pero con un factor de ancho de 1.0, lo que implica mas canales y una precision superior en ImageNet. La variante 0.35 de Google, disponible en HuggingFace, usa una resolucion de entrada de 96x96, lo que reduce la carga computacional pero tambien la precision. La comparacion directa en rendimiento no se puede establecer sin datos de benchmarks, que no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo es una conversion ONNX de un modelo original de STMicroelectronics; no se proporciona informacion sobre el proceso de conversion ni sobre la equivalencia exacta con el modelo original.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable verificar si el modelo original tiene alguna restriccion adicional en el repositorio de STMicroelectronics.
- No se incluye informacion sobre el rendimiento en imagenes fuera de la distribucion de ImageNet; puede presentar sesgos en categorias no representadas.
- Al ser un modelo de clasificacion de imagenes, no es adecuado para tareas de generacion de texto o vision avanzada, como deteccion o segmentacion.
- La version FP32 no esta optimizada para microcontroladores; para despliegue en STM32 se recomienda la version INT8, que reduce el uso de memoria y acelera la inferencia.
- No se proporciona informacion sobre la robustez ante ataques adversariales ni sobre el rendimiento en imagenes de baja calidad.

## Enlaces

- [HuggingFace: ketiswp/stm32ai-MobileNetV2-0.35-ImageNet-224-fp32-onnx](https://huggingface.co/ketiswp/stm32ai-MobileNetV2-0.35-ImageNet-224-fp32-onnx)
- [Version INT8 del mismo modelo](https://huggingface.co/ketiswp/stm32ai-MobileNetV2-0.35-ImageNet-224-int8-onnx)
- [Repositorio STMicroelectronics stm32ai-modelzoo (imagenes)](https://github.com/STMicroelectronics/stm32ai-modelzoo/tree/1423c78953a830903485135febe1dd98ff31aed8/image_classification/mobilenetv2)
- [README de STMicroelectronics para MobileNetV2](https://github.com/STMicroelectronics/stm32ai-modelzoo/blob/main/image_classification/mobilenetv2/README.md)
- [HuggingFace: STMicroelectronics/mobilenetv2](https://huggingface.co/STMicroelectronics/mobilenetv2)
- [HuggingFace: google/mobilenet_v2_0.35_96](https://huggingface.co/google/mobilenet_v2_0.35_96)
