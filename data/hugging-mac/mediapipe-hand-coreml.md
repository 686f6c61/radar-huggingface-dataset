# hugging-mac/mediapipe-hand-coreml

## Resumen

El modelo `hugging-mac/mediapipe-hand-coreml` es un paquete de dos modelos Core ML listos para usar que implementan el pipeline de detección de manos y landmarks de MediaPipe sobre Apple Silicon. Fue desarrollado por Hugging Mac, un proyecto comunitario que facilita la ejecución local de modelos de IA en macOS, y se basa en la conversión de los modelos ONNX publicados por Qualcomm AI Hub. El paquete resuelve el problema de ejecutar seguimiento de manos en tiempo real sin depender de servicios en la nube ni de frameworks externos como TensorFlow Lite, aprovechando el runtime nativo de Core ML.

La arquitectura consta de dos componentes: un detector de palma (`hand_detector.mlpackage`) que localiza manos en la imagen completa y devuelve cajas orientadas con siete puntos clave, y un detector de landmarks (`hand_landmark_detector.mlpackage`) que, a partir del recorte de la mano, predice la presencia, la lateralidad (izquierda/derecha) y 21 puntos 3D. El modelo tiene 1.76 millones de parámetros para el detector y 2.01 millones para el de landmarks, con un tamaño combinado de 15.3 MB. No aplica longitud de contexto al tratarse de un modelo de visión. La licencia es personalizada (`mediapipe-pytorch-license`) y el formato de pesos es `.mlpackage` de Core ML.

La relevancia actual radica en la creciente demanda de aplicaciones de control por gestos, accesibilidad y realidad aumentada en macOS, donde Core ML ofrece aceleración por hardware (CPU, GPU y Neural Engine). Este paquete elimina la necesidad de convertir modelos manualmente y proporciona una integración directa con `coremltools`, además de incluir verificación numérica frente a ONNX Runtime.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos redes convolucionales (CNN) independientes: detector de palma y detector de landmarks (arquitectura original de MediaPipe, convertida a Core ML) |
| Parametros totales | 3.77 millones (1.76M detector + 2.01M landmarks) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada de imagen 256×256) |
| Tipos de cuantizacion | FP32 (sin cuantización) |
| Idiomas soportados | No disponible (modelo de visión, no procesa texto) |
| Licencia | MediaPipePyTorch License (custom, basada en Apache 2.0 de MediaPipe) |
| Formato de pesos | Core ML `.mlpackage` (compatible con `coremltools`) |

## Arquitectura y entrenamiento

El modelo es una conversión directa de los pesos ONNX publicados por Qualcomm AI Hub (release `v0.60.0`, precisión float) a Core ML, utilizando `coremltools`. No se realizó entrenamiento adicional; la arquitectura subyacente es la del pipeline de MediaPipe Hands, que combina un detector de palma (una red de detección de objetos con anclas predefinidas) y un detector de landmarks (una red de regresión de puntos clave). El detector de palma opera sobre la imagen completa redimensionada a 256×256 y produce 2944 propuestas con 18 coordenadas (caja orientada, puntos de referencia y confianza). El detector de landmarks recibe un recorte rotado de la mano y devuelve 21 puntos 3D normalizados, además de la probabilidad de presencia y la lateralidad.

Los datos de entrenamiento originales de MediaPipe no se detallan en la información proporcionada, pero se sabe que MediaPipe Hands fue entrenado por Google con un conjunto de datos propio de imágenes de manos. La innovación técnica de este paquete reside en la conversión a Core ML, que permite ejecutar ambos modelos de forma nativa en Apple Silicon con aceleración por hardware, y en la posibilidad de cargar el detector de landmarks de forma perezosa (solo cuando se solicitan los puntos) para optimizar el rendimiento.

## Capacidades

- Detección de manos en imágenes RGB: localiza una o varias manos mediante cajas orientadas (rotated bounding boxes) y devuelve la confianza de detección.
- Predicción de 21 landmarks 3D por mano: coordenadas normalizadas (x, y, z) que permiten reconstruir la pose completa de la mano.
- Determinación de lateralidad: indica si la mano detectada es izquierda o derecha (salida `lr`).
- Estimación de presencia: devuelve un valor de confianza sobre si el recorte contiene efectivamente una mano.
- Salidas en bruto para post-procesado: las cajas y puntuaciones requieren decodificación de anclas y NMS ponderado, lo que permite integrar el modelo en pipelines personalizados.
- Compatibilidad con el SDK de Hugging Mac: ofrece una implementación completa del pipeline (decodificación, proyección de coordenadas y manejo de lateralidad) para uso directo en aplicaciones macOS.
- No incluye clasificador de gestos: la interpretación de los landmarks (por ejemplo, detectar un puño o un pulgar arriba) debe implementarse por separado.

## Casos de uso

- Control por gestos en aplicaciones macOS: el modelo puede detectar la posición de los dedos en tiempo real y traducir gestos (como pellizcar o señalar) en comandos para controlar ventanas, presentaciones o herramientas de diseño. Gracias a su tamaño reducido (15.3 MB) y a la aceleración de Core ML, se puede ejecutar a 30 FPS o más en equipos con Apple Silicon.
- Juegos y entretenimiento interactivo: permite implementar controles basados en la mano sin necesidad de mandos físicos. El detector de landmarks devuelve coordenadas 3D que pueden usarse para mover avatares o interactuar con objetos virtuales en tiempo real.
- Accesibilidad: usuarios con movilidad reducida pueden manejar el cursor o activar funciones del sistema mediante gestos manuales. La lateralidad y la presencia de la mano permiten distinguir entre acciones intencionales y movimientos accidentales.
- Realidad aumentada y filtros: al conocer la pose 3D de la mano, se pueden superponer efectos visuales (por ejemplo, dibujar sobre los dedos o cambiar el color de la piel) en aplicaciones de vídeo o videollamadas.
- Análisis de gestos en vídeo: el modelo puede procesar fotogramas de vídeo para estudiar la motricidad fina o la interacción con objetos, por ejemplo en aplicaciones de rehabilitación o investigación ergonómica.
- Automatización de flujos de trabajo en macOS: integrado con Shortcuts o AppleScript, el modelo puede activar acciones cuando se detecta un gesto específico, como abrir una aplicación o enviar un correo, sin necesidad de tocar el teclado.
- Desarrollo de plugins para software creativo: editores de vídeo o música pueden usar la detección de manos para controlar parámetros (volumen, recorte, etc.) mediante gestos, aprovechando la baja latencia del runtime de Core ML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos (como precisión media o FPS) en la información disponible. Sin embargo, la model card incluye una verificación numérica de la conversión frente a ONNX Runtime, que confirma la fidelidad de los pesos convertidos. Las diferencias máximas absolutas son:

| Salida | Diferencia máxima |
|---|---|
| Cajas del detector (`box_coords`) | 6.866e-5 |
| Puntuaciones del detector (`box_scores`) | 1.526e-4 |
| Presencia de mano (`scores`) | 3.92e-8 |
| Lateralidad (`lr`) | 4.59e-6 |
| Landmarks | 4.47e-7 |

Estas diferencias son despreciables y garantizan que el comportamiento del modelo Core ML es equivalente al del modelo ONNX original.

## Requisitos de hardware

- Plataforma: Apple Silicon (macOS 13 o posterior). No se garantiza compatibilidad con Macs Intel.
- VRAM: al ser modelos pequeños (1.76M y 2.01M parámetros), la memoria necesaria es mínima; se estima menos de 100 MB en total para ambos modelos en memoria de GPU/ANE.
- GPU recomendada: no se requiere GPU dedicada; el modelo puede ejecutarse en la CPU, GPU integrada o Neural Engine del chip Apple Silicon (M1, M2, M3 o superiores).
- Compatibilidad con hardware de consumo: sí, cualquier Mac con chip Apple Silicon (incluidos MacBook Air y Mac mini) puede ejecutar el pipeline en tiempo real.
- Opciones de despliegue: se usa directamente con `coremltools` (carga de `.mlpackage`) o mediante el SDK de Hugging Mac. No se menciona soporte para vLLM, llama.cpp u otros runners, ya que es un modelo de visión específico de Core ML.
- Latencia y throughput: no se especifican valores concretos, pero dado el tamaño reducido y la optimización para Apple Silicon, se espera un rendimiento en tiempo real (más de 30 FPS) en hardware moderno.

## Comparativa con modelos similares

El paquete se puede comparar con otras implementaciones de detección de manos:

| Modelo | Formato | Parámetros | Plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| `hugging-mac/mediapipe-hand-coreml` | Core ML | 3.77M | Apple Silicon | MediaPipePyTorch (custom) | Incluye detector y landmarks, verificado frente a ONNX |
| MediaPipe Hands original (Google) | TensorFlow Lite | ~1M (detector) + ~2M (landmarks) | Multiplataforma (Android, iOS, web) | Apache 2.0 | Requiere el framework MediaPipe, no es Core ML nativo |
| Qualcomm MediaPipe Hand Detection (ONNX) | ONNX | 3.77M | Cualquier runtime ONNX | Depende de Qualcomm | Modelo base del que deriva esta conversión |

La principal ventaja de este paquete es su integración directa con Core ML y macOS, sin dependencias adicionales. La desventaja es que solo funciona en Apple Silicon, mientras que el modelo original de MediaPipe es multiplataforma.

## Limitaciones y advertencias

- Licencia personalizada: la licencia `mediapipe-pytorch-license` es un enlace a un repositorio que declara seguir los términos de Apache 2.0 de MediaPipe, pero es necesario revisar los términos de distribución de Qualcomm y del repositorio original antes de uso comercial. El autor del paquete no está afiliado con Qualcomm, Google ni MediaPipe.
- Solo Apple Silicon: el modelo está optimizado para macOS 13+ con chips Apple Silicon; no funcionará en sistemas con CPU Intel o en otras plataformas.
- Sin clasificador de gestos: el paquete solo proporciona detección de manos y landmarks; la interpretación de gestos debe implementarse por separado, lo que requiere lógica adicional.
- Post-procesado obligatorio: las salidas del detector (cajas y puntuaciones) necesitan decodificación de anclas y NMS ponderado para obtener resultados utilizables. El SDK de Hugging Mac lo implementa, pero si se usa directamente con `coremltools`, hay que implementar ese paso.
- Riesgo de alucinación en landmarks: como cualquier modelo de visión, puede producir landmarks incorrectos en condiciones de iluminación adversa, oclusiones o manos parcialmente visibles. No se han reportado sesgos específicos, pero se recomienda validar en el dominio de aplicación.
- Sin soporte de idiomas: al ser un modelo de visión, no procesa texto ni tiene capacidades multilingües.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/hugging-mac/mediapipe-hand-coreml
- Proyecto Hugging Mac (pipeline completo): https://github.com/devilyouwei/hugging-mac
- SDK de MediaPipe Hand Detection de Hugging Mac: https://github.com/devilyouwei/hugging-mac/tree/main/packages/hugging_mac_sdk/src/hugging_mac_sdk/models/mediapipe_hand_detection
- Modelo base de Qualcomm: https://huggingface.co/qualcomm/MediaPipe-Hand-Detection
- Licencia MediaPipePyTorch: https://github.com/zmurez/MediaPipePyTorch/blob/master/LICENSE
- Documentación oficial de MediaPipe Hands: https://github.com/google-ai-edge/mediapipe/blob/master/docs/solutions/hands.md
- Documentación alternativa de MediaPipe Hands: https://chuoling.github.io/mediapipe/solutions/hands.html
