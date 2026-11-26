# litert-community/MediaPipe-FaceLandmarker

## Resumen

MediaPipe Face Landmarker es un paquete de modelos de visión por computador para detección de geometría facial en dispositivo, publicado por la comunidad litert-community a partir de los modelos originales de Google MediaPipe. No es un modelo de lenguaje: es un *bundle* de tres redes neuronales empaquetadas en un único fichero `face_landmarker.task` de 3,76 MB con pesos en FP16, que resuelve el pipeline completo de detección de rostro, malla facial 3D y coeficientes de expresión.

El paquete combina un detector BlazeFace de corto alcance, un modelo FaceMesh V2 que produce 478 puntos clave 3D (incluidos 10 landmarks de iris) y una red MLP-Mixer que calcula 52 coeficientes de blendshapes faciales. Está pensado para ejecutarse íntegramente en el dispositivo, sin conexión a servidor, en Android, iOS, web, Python y Flutter mediante la librería MediaPipe Tasks.

Su relevancia actual radica en que ofrece un pipeline facial completo y ligero (menos de 4 MB) con licencia Apache 2.0, lo que facilita su integración en aplicaciones de realidad aumentada, avatares, análisis de expresiones y seguimiento facial en tiempo real sin depender de infraestructura en la nube ni de GPUs dedicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline multi-etapa: BlazeFace (detección) + FaceMesh V2 (landmarks 3D) + MLP-Mixer (blendshapes) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | pesos en FP16 en el bundle; los submodelos aceptan entrada `float32` |
| Idiomas soportados | no aplica (modelo de visión, independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`) empaquetados en `.task`; metadatos en `.binarypb` |

## Arquitectura y entrenamiento

El bundle `face_landmarker.task` contiene tres redes independientes más metadatos de geometría canónica. El detector `face_detector.tflite` es un BlazeFace de corto alcance con entrada RGB de `[1, 128, 128, 3]` normalizada con media y desviación 127,5, que produce 896 regresores de cajas y puntos clave junto con sus puntuaciones de clasificación. El modelo principal `face_landmarks_detector.tflite` (FaceMesh V2) recibe imágenes de `[-1, 256, 256, 3]` normalizadas con media 0 y desviación 255, y devuelve 478 landmarks 3D (`[-1, 1, 1, 1434]`), una puntuación de presencia facial y una puntuación `tongue_out`.

La tercera red, `face_blendshapes.tflite`, es una MLP-Mixer que consume 146 landmarks 2D (`[1, 146, 2]`) y genera 52 coeficientes de blendshape en el rango `[0, 1]`. Los metadatos `geometry_pipeline_metadata_landmarks.binarypb` aportan la geometría canónica necesaria para el pipeline. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste fino o RLHF; la model card remite a las fichas técnicas originales de Google para BlazeFace, FaceMesh V2 y Blendshape V2.

## Capacidades

- Detección de rostros en imágenes y vídeo mediante BlazeFace de corto alcance.
- Predicción de 478 landmarks faciales 3D, incluidos 10 puntos de iris.
- Estimación de 52 coeficientes de blendshapes faciales (expresiones) en el rango `[0, 1]`.
- Detección de presencia facial con puntuación de confianza.
- Detección de lengua fuera de la boca mediante la puntuación `tongue_out`.
- Ejecución en dispositivo en Android, iOS, web, Python y Flutter mediante MediaPipe Tasks.
- Procesamiento en tiempo real sobre CPU, sin necesidad de GPU.
- No soporta tool calling, agentes ni razonamiento multi-step: es un modelo puramente perceptivo.

## Casos de uso

- Realidad aumentada facial: el modelo proporciona 478 landmarks 3D y 52 blendshapes que permiten anclar filtros, gafas o maquillaje virtual a la geometría del rostro con seguimiento estable en vídeo en tiempo real.
- Avatares animados y *puppeteering*: los coeficientes de blendshape se mapean directamente a los huesos o morph targets de un avatar 3D, permitiendo animar personajes con la expresión del usuario en aplicaciones de videollamada o streaming.
- Análisis de atención y emoción en aplicaciones educativas: los blendshapes permiten estimar gestos faciales (sonrisa, ceño fruncido, parpadeo) para métricas de engagement sin enviar vídeo a la nube, lo que reduce latencia y cumple con requisitos de privacidad.
- Detección de somnolencia o fatiga al volante: la puntuación de presencia y los landmarks de párpados y ojos permiten calcular la apertura ocular y la frecuencia de parpadeo en un sistema embebido de bajo coste.
- Autenticación y verificación de presencia: la puntuación de presencia facial y los landmarks pueden usarse como etapa previa en pipelines de *liveness detection*, combinados con otras señales, para descartar fotos o vídeos pregrabados.
- Aplicaciones de accesibilidad: control de cursor o interfaces por gestos faciales mediante los blendshapes (por ejemplo, cejas o boca) en dispositivos móviles sin hardware adicional.
- Fotografía y edición automática: detección de rostro y landmarks para recorte inteligente, retoque de piel o alineación de caras en aplicaciones de cámara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el bundle completo ocupa 3,76 MB y está diseñado para ejecutarse en CPU.
- GPU recomendadas: no requiere GPU; funciona en CPU de dispositivos móviles y de escritorio.
- Cabe en cualquier GPU de consumo y en dispositivos móviles de gama baja; el despliegue típico es en CPU.
- Opciones de despliegue: MediaPipe Tasks (Python, Android, iOS, web y Flutter) y LiteRT/TFLite para los submodelos individuales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Landmarks | Blendshapes | Licencia |
|---|---|---|---|---|---|
| MediaPipe Face Landmarker (este) | Pipeline TFLite multi-etapa | 3,76 MB | 478 (incl. 10 iris) | 52 | Apache 2.0 |
| MediaPipe Face Mesh (original) | TFLite | no disponible | 468 | no | Apache 2.0 |
| MediaPipe BlazeFace (original) | TFLite | no disponible | no | no | Apache 2.0 |
| Alternativas de terceros (p. ej. modelos ONNX faciales) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está entrenado para rostros de corto alcance; el rendimiento puede degradarse en caras pequeñas, lejanas o muy ocluidas.
- Los blendshapes `*Left` y `*Right` se refieren al rostro del sujeto, no al del observador; en selfies con espejo horizontal los coeficientes izquierda/derecha aparecen invertidos.
- Riesgo de falsos positivos y negativos en condiciones de iluminación extrema, ángulos pronunciados o rostros parcialmente cubiertos.
- No se dispone de información sobre sesgos demográficos en la model card; conviene validar el rendimiento en la población objetivo antes de producción.
- El modelo no genera texto ni razona: no debe emplearse para tareas de comprensión semántica.
- La licencia Apache 2.0 permite uso comercial, pero las fichas originales de Google (BlazeFace, FaceMesh V2, Blendshape V2) incluyen consideraciones de uso responsable que deben revisarse.
- El tratamiento de datos biométricos faciales está sujeto a regulaciones como el RGPD; el procesamiento en dispositivo ayuda a la minimización de datos, pero no exime de las obligaciones legales aplicables.

## Enlaces

- [Hugging Face: litert-community/MediaPipe-FaceLandmarker](https://huggingface.co/litert-community/MediaPipe-FaceLandmarker)
- [Documentación de MediaPipe Face Landmarker](https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker)
- [Ejemplo Android](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/face_landmarker/android)
- [Ejemplo iOS](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/face_landmarker/ios)
- [Colab Python](https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/face_landmarker/python/%5BMediaPipe_Python_Tasks%5D_Face_Landmarker.ipynb)
- [Ejemplo Web](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/face-landmarker.ts)
- [Ejemplo Flutter](https://github.com/google/flutter-mediapipe/tree/main/samples/vision/face_landmarker)
- [Demo web en vivo](https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/face_landmarker)
- [Paper BlazeFace (arXiv:1907.05047)](https://arxiv.org/abs/1907.05047)
