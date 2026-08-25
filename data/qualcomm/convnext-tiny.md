# qualcomm/ConvNext-Tiny

## Resumen

ConvNext-Tiny es un modelo de clasificación de imágenes basado en la arquitectura ConvNeXt, desarrollado originalmente por el equipo de PyTorch Vision y posteriormente optimizado por Qualcomm para su despliegue en dispositivos con chipsets Snapdragon y otras plataformas de Qualcomm. El modelo clasifica imágenes del dataset ImageNet y también puede utilizarse como backbone para construir modelos más complejos en tareas de visión por computador.

La versión publicada por Qualcomm en Hugging Face incluye pesos pre-exportados y optimizados para ejecución en dispositivos móviles y embebidos, con soporte para runtimes ONNX, QNN (Qualcomm Neural Network) y TFLite. El modelo tiene 28,6 millones de parámetros y un tamaño de 109 MB en precisión float, reducible a 28,9 MB con cuantización w8a16. Su relevancia radica en que permite ejecutar inferencia de clasificación de imágenes con latencias de 1-3 ms en NPUs de Qualcomm, lo que lo hace adecuado para aplicaciones en tiempo real en dispositivos móviles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt (Tiny) |
| Parametros totales | 28,6 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | float, w8a16, w8a8 |
| Idiomas soportados | no disponible (modelo de vision, no textual) |
| Licencia | BSD-3-Clause |
| Formato de pesos | PyTorch, ONNX, QNN_DLC, TFLITE |

## Arquitectura y entrenamiento

ConvNeXt es una arquitectura de red neuronal convolucional pura, presentada en el articulo "A ConvNet for the 2020s" (arXiv:2201.03545). Moderniza las CNN clasicas incorporando disenos inspirados en transformers, como parches de entrada, normalizacion por capas, kernels grandes y activaciones GELU, pero manteniendo la eficiencia computacional de las convoluciones. La variante Tiny tiene una estructura con cuatro etapas, con dimensiones de canal de 96, 192, 384 y 768, y se entrena en ImageNet-1K con 224x224 píxeles de resolucion de entrada.

El checkpoint incluido en este repositorio es el modelo preentrenado de torchvision, sin fine-tuning adicional. Qualcomm ha aplicado tecnicas de compilacion y cuantizacion especificas para su ejecucion en NPUs, incluyendo formatos w8a16 y w8a8 que reducen el tamano del modelo manteniendo una precision aceptable. No se menciona el uso de RLHF ni DPO, ya que no es un modelo generativo.

## Capacidades

- Clasificacion de imagenes en las 1000 categorias de ImageNet.
- Uso como backbone para extraccion de caracteristicas en tareas de deteccion de objetos, segmentacion semantica o clasificacion personalizada.
- Inferencia en dispositivos moviles y embebidos gracias a la optimizacion para NPUs de Qualcomm.
- Soporte de multiples formatos de exportacion: ONNX, QNN_DLC y TFLite.
- Cuantizacion w8a16 y w8a8 para reducir el uso de memoria y acelerar la inferencia.
- No soporta generacion de texto, tool calling, agentes ni capacidades multimodales mas alla de la vision.

## Casos de uso

- Clasificacion de imagenes en tiempo real en aplicaciones moviles: el modelo puede integrarse en apps Android o iOS para etiquetar fotos, detectar objetos o moderar contenido, con latencias de 1-3 ms en chipsets Snapdragon 8 Gen 3 o superiores.
- Vision artificial en dispositivos IoT: gracias a su compatibilidad con QNN y TFLite, puede desplegarse en camaras inteligentes o dispositivos edge para clasificar escenas o detectar anomalias.
- Backbone para modelos de deteccion de objetos: al ser un extractor de caracteristicas eficiente, puede usarse como base para entrenar detectores como Faster R-CNN o YOLO en dominios especificos (industria, agricultura, medicina).
- Filtrado automatico de contenido en redes sociales: el modelo puede clasificar imagenes en categorias predefinidas (violencia, desnudos, spam) con baja latencia y sin depender de la nube.
- Asistencia a personas con discapacidad visual: una aplicacion puede describir el entorno clasificando objetos comunes en tiempo real usando el modelo en el propio dispositivo.
- Control de calidad en manufactura: el modelo puede clasificar piezas como defectuosas o correctas a partir de imagenes de camaras industriales, ejecutandose en hardware Qualcomm embebido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K) porque se trata de un modelo de vision, no de lenguaje. El rendimiento reportado se centra en latencia de inferencia en dispositivos Qualcomm. La tabla siguiente resume los tiempos de inferencia para la variante ONNX float en distintos chipsets:

| Chipset | Runtime | Precision | Tiempo de inferencia (ms) | Memoria pico (MB) |
|---|---|---|---|---|
| Snapdragon X2 Elite | ONNX | float | 1,333 | 2 |
| Snapdragon X Elite | ONNX | float | 2,693 | 57 |
| Snapdragon 8 Gen 3 Mobile | ONNX | float | 2,003 | 0-129 |
| Snapdragon 8 Gen 1 Mobile | ONNX | float | 9,014 | 1-132 |
| Snapdragon 8 Elite Mobile | ONNX | float | 1,548 | 0-76 |
| Snapdragon 8 Elite Gen 5 Mobile | ONNX | float | 1,298 | 0-76 |

Con cuantizacion w8a16, las latencias mejoran notablemente, por ejemplo 0,998 ms en Snapdragon X2 Elite y 1,548 ms en Snapdragon 8 Gen 3 Mobile. No se proporcionan metricas de exactitud (top-1 o top-5) en la informacion disponible, aunque el checkpoint de torchvision alcanza aproximadamente un 82,1% de top-1 en ImageNet segun la documentacion oficial de PyTorch.

## Requisitos de hardware

- VRAM estimada: el modelo float ocupa 109 MB; con cuantizacion w8a16 se reduce a 28,9 MB. La memoria pico durante inferencia en NPU varia entre 1 y 132 MB segun el chipset.
- GPU recomendadas: no es necesario usar GPU para inferencia en dispositivos Qualcomm, ya que la NPU integrada es suficiente. En entornos de servidor, cualquier GPU con al menos 1 GB de VRAM puede ejecutar el modelo sin problemas.
- Compatibilidad con consumer GPU: si, cabe en cualquier GPU moderna, incluso en integradas, dado su tamano reducido.
- Opciones de despliegue: ONNX Runtime, Qualcomm AI Hub Workbench, TFLite, y el paquete Python `qai_hub_models` para exportacion personalizada.
- Latencia y throughput: en NPUs Qualcomm, la latencia oscila entre 1,3 y 9 ms segun el chipset y la precision. En GPU de servidor, se pueden procesar cientos de imagenes por segundo, aunque no se proporcionan cifras exactas.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano (float) | Top-1 ImageNet | Licencia | Formato |
|---|---|---|---|---|---|
| ConvNext-Tiny (Qualcomm) | 28,6 M | 109 MB | ~82,1% | BSD-3-Clause | ONNX, QNN, TFLite |
| ResNet-50 | 25,6 M | 98 MB | ~76,1% | BSD-3-Clause | PyTorch, ONNX |
| EfficientNet-B0 | 5,3 M | 20 MB | ~77,1% | Apache-2.0 | PyTorch, ONNX |
| MobileNetV3-Large | 5,4 M | 21 MB | ~75,2% | Apache-2.0 | PyTorch, TFLite |

ConvNext-Tiny ofrece una mejor precision que ResNet-50 con un tamano similar, y supera claramente a EfficientNet-B0 y MobileNetV3 en exactitud, aunque con mas parametros. Su ventaja principal frente a estas alternativas es la optimizacion especifica para NPUs de Qualcomm, que permite latencias extremadamente bajas en hardware movil.

## Limitaciones y advertencias

- Es un modelo de clasificacion de imagenes, no generativo: no puede producir texto, responder preguntas ni realizar razonamiento.
- La informacion disponible no incluye datos sobre sesgos o alucinaciones, pero al ser un modelo entrenado en ImageNet, puede presentar sesgos hacia categorias occidentales y no cubrir adecuadamente objetos o escenas de otras culturas.
- La resolucion de entrada esta fijada en 224x224; imagenes con resoluciones muy diferentes pueden degradar el rendimiento.
- No se proporcionan metricas de exactitud en la model card de Qualcomm; los valores de top-1 mencionados provienen de la documentacion de torchvision y pueden variar con la cuantizacion.
- La licencia BSD-3-Clause permite uso comercial, pero el modelo esta optimizado para hardware Qualcomm; su ejecucion en otras plataformas puede requerir reexportacion y no garantiza el mismo rendimiento.
- El repositorio contiene principalmente archivos pre-exportados; para personalizar el modelo (fine-tuning, cambios de entrada) es necesario usar la libreria `qai_hub_models` y compilar con Qualcomm AI Hub.

## Enlaces

- Hugging Face: https://huggingface.co/qualcomm/ConvNext-Tiny
- Qualcomm AI Hub: https://aihub.qualcomm.com/models/convnext_tiny
- Repositorio GitHub de Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/convnext_tiny/README.md
- Implementacion original en torchvision: https://github.com/pytorch/vision/blob/main/torchvision/models/convnext.py
- Paper ConvNeXt: https://arxiv.org/abs/2201.03545
