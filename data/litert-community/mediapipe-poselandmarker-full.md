# litert-community/MediaPipe-PoseLandmarker-Full

## Resumen

MediaPipe Pose Landmarker (Full) es un paquete de inferencia de estimación de pose humana en 3D desarrollado por Google dentro del ecosistema MediaPipe y redistribuido por la comunidad `litert-community` en Hugging Face. No es un modelo de lenguaje: es un bundle de dos sub-modelos TensorFlow Lite en FP16 que implementan la arquitectura BlazePose GHUM 3D, orientada a la detección de 33 puntos clave del cuerpo con máscara de segmentación, pensada para ejecución en dispositivo (on-device) en Android, iOS, Web, Python y Flutter.

El bundle `pose_landmarker_full.task` (9,4 MB) combina un detector de persona que localiza la ROI a partir de una entrada de 224×224 píxeles y un detector de landmarks que procesa un recorte de 256×256 píxeles y devuelve coordenadas 2D/3D normalizadas, landmarks métricos en el espacio GHUM, una puntuación de presencia y una máscara de segmentación. La variante "Full" se sitúa en el punto medio de la familia (Lite, Full, Heavy), equilibrando precisión y coste computacional.

Su relevancia actual radica en que permite estimación de pose en tiempo real sin conexión a red ni GPU dedicada, con licencia Apache 2.0 y formatos optimizados para LiteRT/TFLite, lo que lo hace adecuado para aplicaciones móviles, web y sistemas embebidos donde el coste energético y la latencia importan. El modelo está vinculado al artículo arXiv:2006.10204 (BlazePose).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BlazePose GHUM 3D, dos etapas (detector de persona + detector de landmarks), redes convolucionales ligeras en TFLite |
| Parametros totales | no disponible (pesos FP16; bundle de 9,4 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | pesos FP16 (float16); entradas/salidas en float32 |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.task` (bundle MediaPipe con dos `.tflite` internos: `pose_detector.tflite` y `pose_landmarks_detector.tflite`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BlazePose GHUM 3D descrita en arXiv:2006.10204. Se compone de dos sub-redes: un detector de pose que recibe `[1, 224, 224, 3]` en RGB con normalización `mean=127.5, std=127.5` y emite 2254 candidatos de caja/keypoints (`[1, 2254, 12]`) con sus puntuaciones (`[1, 2254, 1]`); y un detector de landmarks que recibe el recorte de ROI `[1, 256, 256, 3]` con normalización `mean=0.0, std=255.0` y produce cinco salidas: landmarks normalizados `[1, 195]` (33 puntos × 5 valores: x, y, z, visibilidad, presencia), presencia de pose `[1, 1]`, máscara de segmentación `[1, 256, 256, 1]`, mapa de calor `[1, 64, 64, 39]` y landmarks métricos en espacio GHUM `[1, 117]` (33 puntos × 3 coordenadas + 6 valores de traslación/escala).

La innovación principal es el uso del modelo corporal GHUM para derivar landmarks 3D métricos a partir de la predicción 2D, lo que permite estimaciones con escala realista. No se dispone de información sobre el número de tokens, la composición del dataset de entrenamiento ni si se aplicaron técnicas de RLHF/DPO (no aplicables a este tipo de modelo). Los pesos se distribuyen en FP16 para reducir el tamaño y acelerar la inferencia en hardware móvil.

## Capacidades

- Detección de 33 puntos clave del cuerpo humano en 2D y 3D (nariz, ojos, orejas, boca, hombros, codos, muñecas, dedos, caderas, rodillas, tobillos, talones y puntas de los pies).
- Estimación de landmarks métricos en 3D en el espacio GHUM, con traslación y escala.
- Segmentación de la silueta de la persona (máscara de primer plano de 256×256).
- Puntuación de presencia de pose para filtrar fotogramas sin persona.
- Ejecución on-device en Android, iOS, Web, Python y Flutter mediante MediaPipe Tasks.
- Procesamiento de imagen individual y de flujo de vídeo (modo streaming con seguimiento entre fotogramas).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües; no es un modelo generativo.

## Casos de uso

- **Fitness y entrenamiento guiado**: análisis en tiempo real de la postura del usuario durante ejercicios (sentadillas, flexiones, yoga) comparando los 33 landmarks con plantillas de referencia para detectar desviaciones y contar repeticiones en el dispositivo.
- **Telemedicina y rehabilitación**: seguimiento de rangos de movimiento articular (hombro, codo, rodilla) en sesiones remotas, con landmarks métricos 3D que permiten medir ángulos sin calibrar la cámara de forma exhaustiva.
- **Animación y motion capture de bajo coste**: captura de movimiento desde vídeo de una sola cámara para previsualización de animaciones o VTubers, exportando los 33 keypoints como esqueleto simplificado.
- **Análisis deportivo**: extracción de cinemática (velocidad angular de articulaciones, alineación de cadera y hombros) en vídeos de entrenamiento para retroalimentación técnica, procesable offline en móvil.
- **Realidad aumentada y efectos**: superposición de elementos gráficos anclados al cuerpo (ropa virtual, filtros, avatares) usando la máscara de segmentación y los landmarks para alinear la composición.
- **Ergonomía y prevención de riesgos laborales**: monitorización de posturas en puestos de trabajo mediante cámaras fijas, detectando posturas forzadas o mantenidas con la puntuación de presencia y los ángulos articulares.
- **Interacción sin contacto**: control gestual básico (señalar, levantar brazos) en quioscos o interfaces accesibles, aprovechando la inferencia local sin enviar vídeo a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el bundle completo ocupa 9,4 MB en disco y se ejecuta con huella de memoria muy reducida (decenas de MB según backend y resolución de entrada).
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU móvil, GPU móvil (OpenGL ES / Metal), DSP y NPU mediante delegados TFLite/LiteRT. En escritorio puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) y en hardware móvil de gama media; el cuello de botella es la resolución de entrada y el backend, no la VRAM.
- Opciones de despliegue: MediaPipe Tasks (Python, Android, iOS, Web/JavaScript, Flutter), LiteRT/TFLite con delegados (GPU, NNAPI, XNNPACK), y runners compatibles con `.tflite`.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del dispositivo y del backend. La variante Full está pensada para tiempo real en móvil, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Tipo | Puntos clave | Salidas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediaPipe Pose Landmarker Full (este) | BlazePose GHUM 3D, dos etapas | 33 | 2D/3D, world landmarks, segmentación, presencia | Apache 2.0 | Hugging Face, MediaPipe Tasks |
| MediaPipe Pose Landmarker Lite | BlazePose GHUM 3D, variante ligera | 33 | Igual que Full | Apache 2.0 | MediaPipe |
| MediaPipe Pose Landmarker Heavy | BlazePose GHUM 3D, variante pesada | 33 | Igual que Full | Apache 2.0 | MediaPipe |
| YOLOv8-pose | Detector de pose de una etapa | 17 (COCO) | 2D keypoints, cajas | AGPL-3.0 (Ultralytics) | Ultralytics, ONNX |

La comparativa con YOLOv8-pose es orientativa: este último ofrece 17 keypoints COCO en 2D y no proporciona landmarks métricos 3D ni máscara de segmentación de persona, pero su licencia AGPL-3.0 condiciona el uso comercial. Las variantes Lite y Heavy de MediaPipe comparten arquitectura y licencia, diferenciándose en coste computacional y precisión; no se dispone de cifras comparativas de precisión en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al ser un modelo de visión, puede presentar sesgos de rendimiento según tono de piel, ropa, oclusiones y complexión corporal, habituales en datasets de pose.
- Riesgo de alucinación: no aplica en el sentido generativo, pero puede producir landmarks espurios en fotogramas sin persona o con oclusiones severas; la salida de presencia permite filtrarlos.
- Limitaciones de contexto o idioma: no procesa lenguaje; no hay soporte multilingüe. El rendimiento cae con oclusiones, poses extremas, múltiples personas solapadas o resoluciones de entrada muy bajas.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, con obligación de conservar avisos de licencia y atribución; conviene revisar los términos de MediaPipe y de los modelos subyacentes de Google.
- Caveats para producción: el modelo es un bundle `.task` pensado para MediaPipe Tasks; su uso fuera de ese runtime requiere extraer y manejar los `.tflite` internos y replicar el pre/post-procesado (normalización, decodificación de cajas, anclajes). La precisión métrica 3D depende de la calibración de la cámara y de la calidad del recorte de ROI.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-PoseLandmarker-Full
- Documentación MediaPipe Pose Landmarker: https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker
- Artículo BlazePose (arXiv:2006.10204): https://arxiv.org/abs/2006.10204
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/pose_landmarker/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/pose_landmarker/ios
- Ejemplo Python (Colab): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/pose_landmarker/python/%5BMediaPipe_Python_Tasks%5D_Pose_Landmarker.ipynb
- Ejemplo Web: https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/pose-landmarker.ts
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/pose_landmarker
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/pose_landmarker
