# massimoYao/supershot-beauty-coreml

## Resumen

`massimoYao/supershot-beauty-coreml` es un paquete de modelos Core ML para iOS que agrupa tres redes de visión de Google MediaPipe convertidas a formato `mlprogram` en FP16: detección facial (Full Range Sparse), malla facial de 468 puntos y segmentación multiclase de selfies a 256 × 256. No es un modelo de lenguaje ni un transformer generativo, sino un conjunto de modelos convolucionales ligeros orientados a la inferencia en dispositivo (on-device) dentro de la aplicación SuperShot, donde se emplean para retoque de retratos.

El paquete lo publica el usuario massimoYao y se distribuye bajo licencia Apache 2.0, heredada de los modelos originales de Google AI Edge. Su interés práctico reside en que empaqueta en un único archivo `BeautyModels.mlpackage.zip` (9.200.600 bytes, SHA-256 `8bf15090f38ffab66f18d249789acf59d458de154d802bb2ae3ec004558a4c62`) tres tareas de visión que normalmente se despliegan por separado, lo que simplifica la integración en apps de fotografía y vídeo para iPhone e iPad.

La relevancia es acotada: no compite con modelos fundacionales de segmentación, sino que ofrece una alternativa lista para producción en el ecosistema Apple (Core ML, Neural Engine) a quienes necesiten detección y segmentación facial de baja latencia sin depender de servicios en la nube. El repositorio no incluye documentación sobre datos de entrenamiento, métricas ni parámetros, más allá de la procedencia de los modelos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes convolucionales de Google MediaPipe (detección facial, malla facial de 468 puntos y segmentación multiclase), convertidas a Core ML `mlprogram` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de visión, entrada de imagen; segmentación a 256 × 256) |
| Tipos de cuantizacion | FP16 (conversión a `mlprogram` en FP16); no se documentan otras precisiones |
| Idiomas soportados | no disponible (modelos de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML `mlpackage` (archivo `BeautyModels.mlpackage.zip`, 9.200.600 bytes) |

## Arquitectura y entrenamiento

El paquete no entrena ningún modelo propio: agrega tres redes de Google MediaPipe ya publicadas y las convierte a Core ML. La primera es Face Detection Full Range Sparse, un detector facial optimizado para rostros en un rango amplio de escalas y poses. La segunda es Face Landmark, que predice 468 puntos de referencia faciales. La tercera es Selfie Multiclass Segmentation a 256 × 256, que genera una máscara multiclase (fondo, pelo, piel, cara, ropa, etc.) pensada para selfies.

La conversión se realiza a `mlprogram` en FP16, el formato moderno de Core ML que permite ejecución en Neural Engine y GPU de los chips Apple. No se detallan en la model card los datos de entrenamiento (número de imágenes, composición del dataset, técnicas de aumento), ni si hubo destilación o ajuste fino; esa información corresponde a los modelos originales de MediaPipe, cuyos enlaces y hashes SHA-256 se citan en la propia ficha.

## Capacidades

- Detección facial en imágenes con rostros en distintas escalas y orientaciones (modelo Full Range Sparse).
- Predicción de malla facial densa de 468 puntos, útil para alineación, efectos y retoque localizado.
- Segmentación multiclase de selfies a 256 × 256, con máscaras por región (piel, pelo, cara, ropa, fondo).
- Inferencia en dispositivo en iOS mediante Core ML, con posible uso de Neural Engine y GPU.
- Integración con el pipeline de retoque de la app SuperShot (caso de uso declarado por el autor).
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje: es exclusivamente visión por computador.
- No se documentan capacidades multimodales (audio, texto) ni modos de pensamiento.

## Casos de uso

- Retoque de retratos en apps de fotografía: el paquete permite detectar la cara, localizar 468 puntos y segmentar piel, pelo y fondo para aplicar suavizado de piel, blanqueamiento dental o sustitución de fondo de forma localizada y sin subir la imagen a un servidor.
- Editor de selfies en tiempo real: la segmentación multiclase a 256 × 256 y la malla facial permiten aplicar filtros por región (labios, ojos, mejillas) con latencia baja en dispositivos Apple recientes.
- Videollamadas y apps de cámara con fondos virtuales: la máscara de segmentación de selfies sirve para recortar a la persona y sustituir o desenfocar el fondo en tiempo real, aprovechando la ejecución en Neural Engine.
- Prueba virtual de maquillaje o gafas: los 468 landmarks permiten anclar productos virtuales (pintalabios, monturas) a regiones faciales concretas y mantenerlos estables entre fotogramas.
- Automatización de flujos de edición por lotes en iOS: un pipeline puede detectar caras y aplicar recortes o correcciones automáticas a colecciones de fotos sin conexión, útil en apps de gestión de bibliotecas fotográficas.
- Preprocesado para otras tareas de visión: la detección y la malla facial pueden alimentar etapas posteriores (reconocimiento de expresiones, análisis de atención) en apps de investigación o accesibilidad que requieran privacidad por diseño al no salir los datos del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Diseñado para ejecución en dispositivo en iOS/iPadOS mediante Core ML; requiere un dispositivo Apple compatible con `mlprogram` (iOS 15 o superior, según el soporte de Core ML para este formato).
- VRAM: no disponible; al ser modelos pequeños y ejecutarse en memoria unificada, el consumo es reducido, pero el autor no publica cifras.
- GPU recomendadas: no aplica en el sentido de GPU de escritorio; el objetivo son los chips Apple (A-series y M-series) con Neural Engine.
- No está pensado para GPU de servidor (A100, H100) ni para tarjetas consumer NVIDIA; la conversión es específica de Core ML.
- Opciones de despliegue: Core ML en apps iOS/macOS (Xcode, `mlpackage`), potencialmente con Vision framework para integrar los modelos en pipelines de Apple.
- Latencia y throughput: no disponibles; no se publican mediciones por dispositivo.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| massimoYao/supershot-beauty-coreml | CNN MediaPipe convertida a Core ML | Detección facial, landmarks 468, segmentación selfie | Imagen; segmentación 256 × 256 | Apache 2.0 | Hugging Face (Core ML) |
| Google MediaPipe (original) | CNN en TFLite | Mismas tareas | Imagen; segmentación 256 × 256 | Apache 2.0 | GitHub / storage de Google |
| MediaPipe Selfie Segmentation (modelo único) | CNN en TFLite | Solo segmentación de selfie | Imagen | Apache 2.0 | Google AI Edge |
| Apple Vision (framework del sistema) | APIs propietarias | Detección facial, landmarks, segmentación de personas | Imagen/vídeo | Propietaria de Apple | Integrado en iOS/macOS |

La comparativa directa con modelos fundacionales de segmentación (SAM, SegFormer) no es pertinente: aquellos priorizan calidad y generalidad con un coste computacional mucho mayor, mientras que este paquete prioriza latencia y tamaño para móvil.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona ni soporta instrucciones en lenguaje natural.
- La segmentación multiclase está entrenada para selfies; su rendimiento en escenas complejas, grupos grandes o iluminación adversa puede degradarse y no se documenta.
- La detección facial Full Range Sparse puede fallar en rostros muy ocluidos, de perfil extremo o en imágenes de baja resolución.
- Riesgo de sesgos heredados de los datasets de MediaPipe (posible menor precisión en tonos de piel oscuros o determinados grupos demográficos); el autor no publica evaluaciones de equidad.
- La conversión a FP16 puede introducir pequeñas pérdidas de precisión respecto a los modelos originales en float32; no se cuantifica el impacto.
- Dependencia del ecosistema Apple: el `mlpackage` no es portable a Android, Linux o Windows sin reconversión.
- Uso comercial permitido por Apache 2.0, pero conviene revisar las licencias y atribuciones de los modelos originales de MediaPipe citados en la model card.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni mantenimiento documentado.

## Enlaces

- Hugging Face: https://huggingface.co/massimoYao/supershot-beauty-coreml
- Proyecto original MediaPipe: https://github.com/google-ai-edge/mediapipe
- Face Detection Full Range Sparse: https://storage.googleapis.com/mediapipe-assets/face_detection_full_range_sparse.tflite
- Face Landmark (468 puntos): https://storage.googleapis.com/mediapipe-assets/face_landmark.tflite
- Selfie Multiclass 256×256: https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
