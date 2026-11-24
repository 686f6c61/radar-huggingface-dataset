# czrcbl/sface-mediapipe

## Resumen

SFace for MediaPipe es una conversión del modelo de reconocimiento facial SFace de OpenCV Zoo (originalmente `face_recognition_sface_2021dec.onnx`) al formato TFLite, empaquetada con los metadatos que requiere el componente Image Embedder de MediaPipe. Lo publica el usuario czrcbl en Hugging Face bajo licencia Apache 2.0. No es un modelo de lenguaje ni un transformer generativo: es un extractor de embeddings faciales de 128 dimensiones pensado para tareas de verificación e identificación de rostros en pipelines de visión por computador.

El modelo resuelve un problema de interoperabilidad: permite usar el reconocedor SFace dentro del ecosistema MediaPipe (Android, iOS, web, Python) sin depender de ONNX Runtime ni de OpenCV en producción. La conversión se realizó con onnx2tf y, según el autor, reproduce exactamente los embeddings del modelo ONNX original (similitud coseno de 1.000000 sobre las caras de prueba).

Es relevante para desarrolladores que ya usan MediaPipe para detección y alineación facial y necesitan añadir reconocimiento (quién es esa persona) con un artefacto ligero, autocontenido y con licencia permisiva. El repositorio tiene un tamaño de 0.0 GB, 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de reconocimiento facial (SFace, variante 2021dec de OpenCV Zoo); topología interna no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (el artefacto publicado es TFLite; no se especifica si es float32, float16 o int8) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite con metadatos de MediaPipe Image Embedder |
| Entrada | 1x112x112x3 RGB, valores de píxel 0-255, normalización en metadatos mean 0 / std 1 (el modelo normaliza internamente) |
| Salida | embedding de 128 valores; comparar con similitud coseno sobre vectores normalizados L2 |
| Umbral de coincidencia | 0.363 (el de OpenCV) |
| Librería | mediapipe |
| Tags | mediapipe, tflite, face-recognition |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original SFace más allá de su naturaleza de red convolucional para reconocimiento facial. El artefacto publicado es una conversión directa del ONNX `face_recognition_sface_2021dec.onnx` de OpenCV Zoo a TFLite mediante onnx2tf, a la que se añadieron los metadatos que MediaPipe Image Embedder necesita para gestionar la normalización de entrada (mean 0, std 1) y exponer la salida como embedding.

No se dispone de datos sobre el conjunto de entrenamiento, el número de identidades, la función de pérdida ni si hubo entrenamiento con margen angular o softmax variantes. Tampoco se documenta ninguna innovación técnica propia de esta conversión más allá de la equivalencia numérica con el modelo ONNX de referencia (coseno 1.000000 en las caras de prueba). El requisito operativo clave es que la cara debe estar previamente alineada al template de 5 puntos de SFace, tal como hace `FaceRecognizerSF.alignCrop` en OpenCV; el modelo no realiza detección ni alineación por sí mismo.

## Capacidades

- Extracción de embeddings faciales de 128 dimensiones a partir de recortes alineados de 112x112 píxeles.
- Verificación facial 1:1 mediante similitud coseno con umbral de referencia 0.363.
- Identificación facial 1:N mediante búsqueda del vecino más cercano en un índice de embeddings.
- Integración nativa con MediaPipe Image Embedder en Android, iOS, web y Python.
- Ejecución en TFLite, lo que permite despliegue en dispositivos móviles y entornos edge sin ONNX Runtime.
- Equivalencia numérica con el modelo ONNX original de OpenCV Zoo.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni generación: es exclusivamente un extractor de características visuales.

## Casos de uso

- Control de acceso en aplicaciones móviles: detectar el rostro con el Face Detector de MediaPipe, alinearlo con el template de 5 puntos y pasar el recorte al embedder para comparar contra el embedding enrolado del usuario con umbral 0.363.
- Verificación de identidad en procesos de onboarding (KYC): capturar un selfie, alinear y comparar 1:1 contra la foto del documento, todo en el dispositivo sin enviar imágenes a un servidor.
- Deduplicación de galerías fotográficas: generar embeddings de todos los rostros detectados y agrupar por similitud coseno para eliminar fotos repetidas de la misma persona.
- Autenticación en quioscos o tornos: pipeline MediaPipe completo (detección, alineación, embedding) ejecutado en un dispositivo Android o Raspberry Pi con aceleración TFLite.
- Etiquetado semiautomático de archivos multimedia: indexar caras en un DAM o sistema de gestión de vídeo y sugerir nombres basándose en coincidencias con una base de embeddings conocidos.
- Prototipado rápido en Python: sustituir OpenCV + ONNX por MediaPipe Tasks para mantener una única dependencia en entornos donde ya se usa MediaPipe para otras tareas de visión.
- Aplicaciones de privacidad por diseño: procesar biometría facial localmente en el terminal, evitando el envío de imágenes o embeddings a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento documentado es la equivalencia con el modelo ONNX original: similitud coseno de 1.000000 sobre las caras de prueba, lo que indica que la conversión no introduce degradación numérica medible en ese conjunto.

## Requisitos de hardware

- VRAM estimada: no disponible. Al tratarse de un modelo de reconocimiento facial de 112x112 de entrada, la huella de memoria es muy reducida (del orden de decenas de MB en float32), pero no se publica la cifra exacta.
- GPU recomendadas: no se especifican. El modelo está pensado para ejecutarse en CPU o en aceleradores móviles (GPU delegate de TFLite, NNAPI, Core ML) más que en GPU de servidor.
- Compatibilidad con GPU de consumo: sí, cualquier GPU de consumo puede ejecutarlo con holgura dado su tamaño; también cabe en dispositivos móviles y SBC.
- Opciones de despliegue: MediaPipe Tasks (Image Embedder) en Android, iOS, web y Python; TFLite Runtime; TFLite GPU delegate; NNAPI en Android; Core ML en iOS.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Salida | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| czrcbl/sface-mediapipe | CNN facial (SFace convertido a TFLite) | Embedding 128-d | Apache 2.0 | Hugging Face, MediaPipe | Conversión de OpenCV Zoo con metadatos MediaPipe |
| face_recognition_sface_2021dec (OpenCV Zoo) | CNN facial (ONNX) | Embedding 128-d | Apache 2.0 | GitHub OpenCV Zoo | Modelo de referencia original; requiere ONNX Runtime |
| FaceNet (variantes) | CNN facial | Embedding 128-d / 512-d | Varía según implementación | Múltiples repositorios | Arquitectura histórica de referencia para verificación facial |
| ArcFace (variantes) | CNN facial con margen angular | Embedding 512-d | Varía según checkpoint | Múltiples repositorios | Mayor dimensionalidad de embedding; requiere verificar licencia de cada checkpoint |

La comparación con FaceNet y ArcFace se ofrece como referencia de categoría; no se dispone de métricas comparativas publicadas en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo no detecta ni alinea rostros: exige un recorte de 112x112 ya alineado al template de 5 puntos de SFace. Un alineamiento incorrecto degrada gravemente la similitud coseno.
- No se documentan sesgos demográficos, pero todo reconocedor facial entrenado con datasets no balanceados tiende a mostrar precisión desigual por género, edad y tono de piel; conviene evaluarlo en la población objetivo antes de producción.
- Riesgo de falsos positivos y negativos: el umbral 0.363 es el de OpenCV y puede no ser óptimo para todos los dominios; debe calibrarse con datos propios.
- El embedding de 128 dimensiones ofrece menor capacidad discriminativa que alternativas de 512 dimensiones (ArcFace y derivados), lo que puede afectar a la identificación 1:N en galerías grandes.
- La model card no documenta el dataset de entrenamiento ni las condiciones de captura, por lo que se desconoce su robustez frente a oclusión, iluminación extrema, baja resolución o ángulos no frontales.
- El repositorio tiene 0 descargas y 0 likes: no hay validación comunitaria ni reportes de uso en producción.
- Uso comercial permitido por Apache 2.0, pero el tratamiento de datos biométricos está sujeto al RGPD y a normativas locales (consentimiento explícito, evaluación de impacto, minimización); la licencia del modelo no cubre el cumplimiento legal del despliegue.
- No se especifica la cuantización del artefacto TFLite publicado, lo que impide anticipar posibles pérdidas de precisión respecto al ONNX original en todos los escenarios.
- No apto para tareas de texto, razonamiento, generación ni tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/czrcbl/sface-mediapipe
- Modelo original en OpenCV Zoo: https://github.com/opencv/opencv_zoo/tree/main/models/face_recognition_sface
- OpenCV Zoo (repositorio general): https://github.com/opencv/opencv_zoo
- onnx2tf (herramienta de conversión): https://github.com/PINTO0309/onnx2tf
- MediaPipe Image Embedder: https://ai.google.dev/edge/mediapipe/solutions/vision/image_embedder
