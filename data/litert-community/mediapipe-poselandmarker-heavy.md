# litert-community/MediaPipe-PoseLandmarker-Heavy

## Resumen

MediaPipe Pose Landmarker (Heavy) es un paquete de inferencia en formato `.task` para la tarea de detección de puntos clave corporales (pose landmarking) del framework MediaPipe. Lo publica la comunidad `litert-community` como distribución empaquetada del modelo original de Google (BlazePose GHUM 3D), y está pensado para ejecutarse en dispositivo (`on-device`) en Android, iOS, Web, Python y Flutter mediante LiteRT/TFLite. Resuelve el problema de estimar la pose de una persona en imagen o vídeo sin depender de servidores: localiza el cuerpo, predice 33 puntos clave en 2D y 3D, y opcionalmente genera una máscara de segmentación de la silueta.

El bundle `pose_landmarker_heavy.task` (30,66 MB, pesos FP16) contiene dos submodelos TFLite encadenados: un detector de pose que localiza la región de interés a partir de una entrada RGB de 224×224, y un detector de landmarks que recibe un recorte de 256×256 y produce 33 landmarks normalizados, 33 landmarks métricos en 3D derivados del modelo GHUM, una puntuación de presencia y una máscara de segmentación de 256×256. La variante "Heavy" es la de mayor capacidad de la familia BlazePose, frente a las variantes Lite y Full.

Su relevancia actual radica en que ofrece una alternativa ligera y de baja latencia para visión por computador en el borde, con licencia Apache 2.0 y API unificada multiplataforma. No es un modelo de lenguaje ni un transformer generativo: es una red convolucional especializada en regresión de keypoints, por lo que las métricas y comparativas relevantes son de precisión de keypoints y latencia, no de benchmarks de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BlazePose GHUM 3D, pipeline de dos etapas (detector de pose + detector de landmarks), redes convolucionales en formato TFLite/LiteRT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no secuencial) |
| Tipos de cuantizacion | Pesos FP16 en el bundle; entradas y salidas en float32; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de visión, independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.task` (bundle MediaPipe con miembros `.tflite` internos) |
| Tamano del bundle | 30,66 MB (30.664.242 B) |
| Submodelo detector | `pose_detector.tflite`, 2,96 MB, entrada `[1,224,224,3]` |
| Submodelo landmarks | `pose_landmarks_detector.tflite`, 27,70 MB, entrada `[1,256,256,3]` |
| Salidas | 33 landmarks 2D/3D `[1,195]`, world landmarks `[1,117]`, presencia `[1,1]`, máscara `[1,256,256,1]`, heatmap `[1,64,64,39]` |
| Numero de landmarks | 33 |
| Plataformas | Android, iOS, Web, Python, Flutter |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BlazePose GHUM 3D descrita en el paper arXiv:2006.10204. Se trata de un pipeline de dos etapas: primero, un detector ligero tipo BlazeFace procesa la imagen completa a 224×224 y propone la caja delimitadora y los keypoints de alineación de la persona; después, el detector de landmarks recorta y reescala esa región a 256×256 y regresa directamente los 33 puntos clave. La predicción incluye coordenadas normalizadas de pantalla, coordenadas métricas en 3D derivadas del modelo de cuerpo GHUM (que aporta una parametrización anatómica del esqueleto), una puntuación de presencia y una máscara de segmentación de primer plano.

Los detalles de entrenamiento (número de tokens o imágenes, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. Al ser un modelo de visión supervisado para regresión de keypoints, no aplican técnicas de alineamiento tipo RLHF. La innovación técnica destacable es el uso del modelo GHUM para elevar los landmarks 2D a coordenadas 3D métricas y la separación en dos etapas para reducir el coste computacional en el dispositivo. El bundle se distribuye con pesos en FP16 para reducir tamaño y acelerar la inferencia en hardware móvil.

## Capacidades

- Detección de pose de cuerpo completo con 33 puntos clave (cara, torso, brazos, manos y piernas).
- Predicción de landmarks 2D normalizados en coordenadas de pantalla y landmarks 3D métricos en coordenadas de mundo (world landmarks) derivados de GHUM.
- Puntuación de presencia de pose para filtrar detecciones espurias.
- Segmentación de primer plano de la persona mediante máscara de 256×256.
- Detección de múltiples personas mediante el parámetro `num_poses` de la API (el bundle empaquetado está pensado para una persona por ROI).
- Ejecución en dispositivo en Android, iOS, Web, Python y Flutter a través de MediaPipe Tasks.
- Modos de ejecución IMAGE, VIDEO y LIVE_STREAM en la API de MediaPipe.
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Análisis de forma deportiva: el modelo extrae los 33 landmarks por fotograma para calcular ángulos articulares (rodilla, codo, cadera) en vídeo de entrenamiento y detectar posturas incorrectas, con latencia baja al ejecutarse en el propio dispositivo.
- Rehabilitación y fisioterapia: seguimiento de ejercicios en tiempo real mediante el modo LIVE_STREAM, comparando la trayectoria de los landmarks contra una referencia y contando repeticiones sin enviar vídeo a la nube.
- Realidad aumentada y filtros: anclaje de elementos gráficos al esqueleto del usuario en aplicaciones móviles, usando los world landmarks para posicionar objetos 3D de forma coherente con la perspectiva de la cámara.
- Animación y captura de movimiento: generación de datos de mocap a partir de vídeo monocular para animar avatares o personajes, aprovechando los landmarks 3D métricos de GHUM.
- Control por gestos: uso de los landmarks de manos (índices 17-22) para reconocer gestos simples y controlar interfaces sin contacto, útil en quioscos o entornos sanitarios.
- Segmentación de personas en tiempo real: la máscara de 256×256 permite sustituir fondos o aplicar efectos de desenfoque en videollamadas y aplicaciones de edición, ejecutándose localmente.
- Análisis ergonómico en entornos industriales: estimación de posturas de trabajadores en puestos de trabajo para detectar riesgos posturales, con procesamiento en el borde que evita transmitir imágenes personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión de keypoints (PCK, MPJPE), latencia ni throughput comparativos con otras variantes de BlazePose. El paper de referencia (arXiv:2006.10204) contiene las evaluaciones originales de BlazePose, pero no se reproducen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el bundle completo ocupa 30,66 MB en disco con pesos FP16, por lo que el consumo de memoria es del orden de decenas de MB, muy por debajo de una GPU convencional.
- GPU recomendadas: no aplica en el sentido habitual; el modelo está diseñado para aceleradores móviles (GPU delegada de Android, Core ML/Metal en iOS, WebGL/WebGPU en navegador, CPU en Python).
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) y en hardware móvil de gama media; no requiere GPU dedicada.
- Opciones de despliegue: MediaPipe Tasks (Python, Android, iOS, Web, Flutter), LiteRT/TFLite con delegados GPU y CPU, y el runner de MediaPipe en C++.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Al ser un modelo de dos etapas con entradas de 224×224 y 256×256, está orientado a tiempo real en dispositivo, pero no se documentan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Landmarks | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| MediaPipe Pose Landmarker Heavy (este) | no disponible | 224×224 + 256×256 | 33 (2D/3D + world) | Apache 2.0 | `.task` / TFLite | Variante de mayor capacidad de BlazePose; incluye segmentación |
| MediaPipe Pose Landmarker Full | no disponible | 224×224 + 256×256 | 33 (2D/3D + world) | Apache 2.0 | `.task` / TFLite | Variante intermedia de la misma familia; menor tamaño y latencia, precisión inferior |
| MediaPipe Pose Landmarker Lite | no disponible | 224×224 + 256×256 | 33 (2D/3D + world) | Apache 2.0 | `.task` / TFLite | Variante más ligera, pensada para dispositivos de gama baja |
| YOLOv8-pose | no disponible | 640×640 | 17 (COCO) | AGPL-3.0 | PyTorch/ONNX | Menos landmarks (sin manos ni rostro detallado), licencia más restrictiva |

Los datos de las variantes Full y Lite y de YOLOv8-pose no se detallan en la información proporcionada; la comparativa se limita a categorías y características generales conocidas.

## Limitaciones y advertencias

- Modelo de visión especializado: no genera texto, no razona y no admite tool calling ni agentes; cualquier uso conversacional requiere combinarlo con otro modelo.
- No se documentan sesgos demográficos, de tono de piel, complexión o vestimenta; el rendimiento puede degradarse en poses ocluidas, cuerpos parcialmente fuera de cuadro o iluminación adversa.
- La estimación 3D de GHUM es una aproximación métrica a partir de una sola vista; puede tener error en profundidad y en poses extremas.
- La segmentación se limita a 256×256 y puede presentar bordes imprecisos en cabello, ropa holgada o fondos con colores similares.
- No hay información sobre el dataset de entrenamiento ni sobre cobertura de casos límite, lo que dificulta evaluar su robustez en dominios específicos.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo original de Google y de MediaPipe en la documentación upstream.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es una distribución reciente o poco adoptada; no hay evidencia de comunidad que valide su comportamiento.
- El tamaño del repo figura como 0.0 GB, lo que puede indicar que los archivos aún no se han indexado correctamente o que la información está incompleta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MediaPipe-PoseLandmarker-Heavy
- Documentación de la tarea Pose Landmarker: https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/pose_landmarker
- Paper BlazePose GHUM 3D: https://arxiv.org/abs/2006.10204
- Archivo del bundle: https://huggingface.co/litert-community/MediaPipe-PoseLandmarker-Heavy/blob/main/pose_landmarker_heavy.task
- Model card upstream (PDF): https://huggingface.co/litert-community/MediaPipe-PoseLandmarker-Heavy/blob/main/Model%20Card%20BlazePose%20GHUM%203D.pdf
