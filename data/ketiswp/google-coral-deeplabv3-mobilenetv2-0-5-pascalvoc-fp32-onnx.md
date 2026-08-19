# ketiswp/google-coral-DeepLabV3-MobileNetV2-0.5-PascalVOC-fp32-onnx

## Resumen

Este modelo es una conversión a ONNX en precisión FP32 del modelo DeepLabV3-MobileNetV2 0.5 Pascal VOC, originalmente desarrollado por Google dentro de su plataforma Coral para IA en el borde. DeepLabV3 es una arquitectura de segmentación semántica que combina un backbone MobileNetV2 (con factor de ancho 0.5, es decir, la versión reducida) con módulos de convolución atroz para capturar contexto a múltiples escalas. El modelo está entrenado sobre el conjunto de datos Pascal VOC, que incluye 20 clases de objetos más el fondo, y produce máscaras de segmentación por píxel.

La conversión a ONNX FP32 facilita su despliegue en entornos de producción que usan ONNX Runtime, especialmente en dispositivos de borde como los aceleradores Coral (TPU) o CPUs con soporte FP32. Es relevante ahora porque permite integrar segmentación semántica ligera en aplicaciones de visión por computador con requisitos de latencia bajos y sin depender de frameworks propietarios. La licencia Apache 2.0 permite uso comercial sin restricciones, aunque el modelo original de Google tiene su propia licencia (consultar el repositorio fuente).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepLabV3 con backbone MobileNetV2 (factor de ancho 0.5) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | FP32 (disponible tambien version UINT8 en repositorio del autor) |
| Idiomas soportados | no disponible (modelo de vision, no textual) |
| Licencia | Apache 2.0 (model card), la fuente original de Google puede tener licencia adicional |
| Formato de pesos | ONNX (safetensors no aplica) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DeepLabV3, propuesta por Chen et al. (2018), que utiliza un backbone MobileNetV2 con factor de ancho 0.5 para extraer características a baja resolución. El módulo de segmentación emplea convoluciones at con tasas de dilatación múltiples (atrous spatial pyramid pooling, ASPP) para capturar contexto a diferentes escalas sin aumentar el número de parámetros. La salida es una máscara de segmentación por píxel con 21 clases (20 de Pascal VOC más el fondo). El entrenamiento original se realizó en TensorFlow sobre el dataset Pascal VOC 2012, con técnicas de data augmentation y una función de pérdida basada en entropía cruzada. La conversión a ONNX FP32 mantiene la arquitectura original, pero no se dispone de detalles sobre el proceso de conversión ni el dataset exacto de validación.

## Capacidades

- Segmentación semántica de imágenes en 20 clases de Pascal VOC (persona, coche, árbol, etc.) más fondo.
- Inferencia en tiempo real en dispositivos de borde gracias a la versión ligera de MobileNetV2 (factor 0.5).
- Compatible con ONNX Runtime, lo que permite ejecución en CPU, GPU y aceleradores de borde como Coral Edge TPU (aunque la versión FP32 es para CPU/GPU; la UINT8 es para TPU).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades de texto; es exclusivamente un modelo de visión.
- No tiene capacidades multilingües ni de audio.

## Casos de uso

- Inspección visual en manufactura: el modelo puede segmentar defectos o componentes en imágenes de líneas de producción, clasificando píxeles de interés para control de calidad. Su ligereza permite ejecutarlo en cámaras inteligentes o PLC con CPU integrada.
- Robótica móvil: en robots de navegación, la segmentación permite identificar obstáculos, caminos o zonas de paso en tiempo real, usando la salida de máscaras para planificar rutas. El factor 0.5 reduce la latencia en CPUs de bajo consumo.
- Análisis de imágenes médicas (con limitaciones): aunque entrenado en Pascal VOC, puede adaptarse con fine-tuning para segmentar estructuras anatómicas simples en radiografías o ecografías, gracias a la licencia Apache que permite modificación.
- Agricultura de precisión: identificación de cultivos, malas hierbas o suelo desnudo en imágenes de drones, facilitando el monitoreo de campos con recursos computacionales limitados.
- Conducción autónoma en entornos controlados: segmentación de carretera, vehículos y peatones para sistemas de asistencia al conductor (ADAS) en vehículos industriales o agrícolas, con inferencia en hardware de borde.
- Prototipado de aplicaciones de visión: los desarrolladores pueden integrar el modelo en pipelines de ONNX Runtime para validar rápidamente segmentación semántica en aplicaciones móviles o de escritorio sin depender de frameworks pesados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original de Google tiene métricas de mIoU en Pascal VOC (consultar el repositorio de referencia), pero no se han facilitado datos numéricos en la model card ni en los resultados de la búsqueda web.

## Requisitos de hardware

- Al ser un modelo ONNX FP32 de segmentación ligera (MobileNetV2 0.5), la VRAM necesaria es baja: estimación de menos de 500 MB en FP32 para una entrada de 513x513 (basado en el tamaño de modelos similares; no se dispone del tamaño exacto del archivo).
- Compatible con cualquier GPU con soporte CUDA (por ejemplo, RTX 3060, RTX 4090) y con CPUs (ejecución en ONNX Runtime).
- En consumer GPU (RTX serie 30/40) se ejecuta con baja latencia, inferior a 50 ms por imagen en hardware moderno.
- Opciones de despliegue: ONNX Runtime, TensorFlow Lite (con conversión previa), o en el framework de Coral para dispositivos con Edge TPU (usando la versión UINT8).
- No se dispone de datos de throughput específicos, pero por la arquitectura ligera se espera un rendimiento alto en entornos de borde.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamano | Licencia | Formato |
|---|---|---|---|---|
| Este modelo (ketiswp) | DeepLabV3-MobileNetV2 0.5 | no disponible | Apache 2.0 | ONNX FP32 |
| google/deeplabv3_mobilenet_v2_1.0_513 | DeepLabV3-MobileNetV2 1.0 | mayor (factor 1.0) | other (consultar) | PyTorch |
| qualcomm/DeepLabV3-Plus-MobileNet | DeepLabV3Plus-MobileNet | no disponible | no disponible | ONNX |

La diferencia principal con el modelo de Google es el factor de ancho 0.5 frente a 1.0, lo que reduce el número de parámetros y la latencia a costa de algo de precisión. La versión de Qualcomm es un modelo similar pero con variante "Plus", que añade módulos adicionales. No se dispone de datos comparativos de rendimiento para estos modelos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en Pascal VOC, por lo que solo reconoce 20 clases de objetos; no generaliza a otros dominios sin fine-tuning.
- La precisión en imágenes con condiciones de iluminación extremas, oclusiones o objetos pequeños puede ser baja, como es típico en modelos de segmentación de este tamaño.
- El modelo no es multimodal ni soporta texto; no puede generar descripciones ni responder a preguntas.
- La licencia Apache 2.0 se aplica a la conversión ONNX, pero el modelo original de Google (TensorFlow) tiene su propia licencia de investigación; revisar los términos del repositorio fuente antes de uso comercial.
- No se dispone de información sobre el tamaño exacto del archivo (0.0 GB en el repo) ni sobre el proceso de conversión, lo que puede generar incertidumbre sobre la fidelidad de la conversión.
- El modelo no incluye normalización de entrada específica documentada; el usuario debe conocer los requisitos de preprocesado del modelo original.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/ketiswp/google-coral-DeepLabV3-MobileNetV2-0.5-PascalVOC-fp32-onnx
- Version UINT8 del mismo autor: https://huggingface.co/ketiswp/google-coral-DeepLabV3-MobileNetV2-0.5-PascalVOC-uint8-onnx
- Repositorio original de TensorFlow (DeepLab): https://github.com/tensorflow/models/tree/archive/research/deeplab
- Modelo similar de Google en HF: https://huggingface.co/google/deeplabv3_mobilenet_v2_1.0_513
- Modelo similar de Qualcomm: https://huggingface.co/qualcomm/DeepLabV3-Plus-MobileNet
- Plataforma Coral de Google: https://developers.google.com/coral
