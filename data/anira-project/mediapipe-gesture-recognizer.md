# anira-project/mediapipe-gesture-recognizer

## Resumen

`anira-project/mediapipe-gesture-recognizer` es un paquete de pesos y scripts de exportacion que adapta los modelos de deteccion de manos y reconocimiento de gestos de MediaPipe para su ejecucion en tiempo real con el framework [anira](https://github.com/anira-project/anira). No se trata de un modelo generativo ni de un LLM, sino de una cadena de cuatro modelos de vision por computador (deteccion de palma, deteccion de 21 puntos clave de la mano, embedding de gesto y clasificador de gestos) que trabajan de forma encadenada sobre imagenes RGB.

El paquete resuelve un problema de despliegue: los modelos originales de MediaPipe se distribuyen como un bundle `.task` en float16, y este repositorio los convierte a multiple formatos de inferencia (LiteRT, ONNX Runtime, LibTorch, ExecuTorch con XNNPACK, Core ML y Vulkan) manteniendo la equivalencia numerica entre ellos con desviaciones maximas del orden de 1e-3 a 1e-4 respecto a ONNX Runtime. Esto permite ejecutar el mismo pipeline en CPU, GPU, Apple Neural Engine y plataformas moviles sin cambiar la logica de preprocesado ni postprocesado.

Es relevante para desarrolladores que necesitan reconocimiento de gestos de mano de baja latencia en dispositivos de borde (edge computing), sin depender de un runtime propietario ni de servicios en la nube. El repositorio pesa 0,1 GB e incluye los pesos, el script de exportacion y la licencia Apache 2.0 heredada de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de 4 redes convolucionales (MediaPipe Hands + gesto); no es un transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen fija) |
| Tipos de cuantizacion | Pesos originales en float16; exportaciones ExecuTorch Core ML en float16 para Neural Engine; resto sin cuantizar indicado |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, TFLite/LiteRT, LibTorch, ExecuTorch (`.pte` XNNPACK, Core ML, Vulkan), Core ML `.mlpackage` |

## Arquitectura y entrenamiento

El pipeline consta de cuatro etapas secuenciales. `hand_detector` recibe una imagen `[1,192,192,3]` en NHWC RGB normalizada a `[0,1]` y produce cajas y keypoints `[1,2016,18]` con scores `[1,2016,1]`. `hand_landmarks_detector` toma un recorte `[1,224,224,3]` y devuelve 21 landmarks `[1,63]`, presencia `[1,1]`, lateralidad `[1,1]` y world landmarks `[1,63]`. `gesture_embedder` combina landmarks `[1,21,3]`, lateralidad `[1,1]` y world landmarks `[1,21,3]` en un embedding `[1,128]`. Finalmente, `canned_gesture_classifier` mapea ese embedding a 8 puntuaciones de gesto `[1,8]`.

Los modelos son stateless (sin estado recurrente entre llamadas) y provienen del bundle `gesture_recognizer.task` de MediaPipe en float16. No se documenta en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si hubo ajuste fino con RLHF o DPO (no aplicable a un modelo de vision de este tipo). La innovacion tecnica destacable es la cadena de exportacion multi-formato con verificacion de equivalencia numerica: el script `export/export_executorch.py` valida cada programa contra ONNX Runtime (desviacion maxima 1,5e-4) y la variante Core ML queda dentro de 4,3e-3 del pico de cada salida. El repositorio incluye ademas `tools/check_streaming.py`, que ejecuta doce llamadas consecutivas realimentando el estado para comprobar que todos los formatos coinciden.

## Capacidades

- Deteccion de manos en imagen completa con cajas delimitadoras y keypoints candidatos (hasta 2016 anclas).
- Extraccion de 21 landmarks 2D y 21 world landmarks 3D por mano, con estimacion de lateralidad (izquierda/derecha).
- Calculo de un embedding de 128 dimensiones que resume la pose de la mano.
- Clasificacion en 8 gestos predefinidos de MediaPipe: None, Closed_Fist, Open_Palm, Pointing_Up, Thumb_Down, Thumb_Up, Victory e ILoveYou.
- Inferencia en tiempo real sobre CPU (XNNPACK), GPU (Vulkan), Apple Neural Engine (Core ML) y runtime nativo Core ML.
- Ejecucion multiplataforma con los mismos nombres de tensor que los modelos ONNX originales.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente perceptivo.

## Casos de uso

- Control por gestos en aplicaciones de escritorio y moviles: el pipeline clasifica gestos como Thumb_Up o Closed_Fist a partir de la camara en tiempo real, adecuado para reproducir multimedia, pasar diapositivas o activar comandos sin teclado.
- Realidad aumentada y filtros: los 21 landmarks y los world landmarks permiten anclar objetos virtuales a la mano con seguimiento continuo; la inferencia stateless facilita el procesado fotograma a fotograma.
- Accesibilidad: personas con movilidad reducida pueden usar gestos de la mano como entrada alternativa; la disponibilidad en Core ML y ExecuTorch permite desplegarlo en dispositivos Apple y Android sin conexion.
- Interaccion en kioscos y senalizacion digital: deteccion de Open_Palm o Pointing_Up para navegar menus en pantallas tactiles sin contacto, con latencia baja al ejecutarse en el propio dispositivo.
- Analisis de lenguaje de signos asistido: el embedding de 128 dimensiones y los landmarks sirven como caracteristicas de entrada para clasificadores personalizados entrenados por el integrador.
- Automatizacion industrial y robotica: reconocimiento de gestos de operario para confirmar pasos en lineas de montaje, aprovechando el runtime Vulkan en GPUs embebidas.
- Telemedicina y rehabilitacion: seguimiento de la pose de la mano para ejercicios de recuperacion motora, con los world landmarks como medida cuantitativa del movimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica cuantitativa documentada es la equivalencia numerica entre formatos de exportacion:

| Formato | Desviacion maxima respecto a ONNX Runtime |
|---|---|
| ExecuTorch Core ML (float16, Neural Engine) | hand_detector 4,3e-3; hand_landmarks_detector 1,0e-3; gesture_embedder 7,1e-4; canned_gesture_classifier 0 |
| Core ML ML program (float16) | hand_detector 4,3e-3; hand_landmarks_detector 1,0e-3; gesture_embedder 7,1e-4; canned_gesture_classifier 0 |
| ExecuTorch Vulkan | exportado, no ejecutado en el repositorio (sin runtime Vulkan) |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio completo ocupa 0,1 GB, por lo que los pesos de cada submodelo son del orden de decenas de MB y caben holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte Vulkan para la ruta ExecuTorch Vulkan; en Apple, el Neural Engine via Core ML; en CPU, XNNPACK sobre cualquier arquitectura soportada por ExecuTorch 1.3.1.
- Cabe en GPU consumer: si, practicamente en cualquier modelo reciente (RTX 4090, RTX 3060 o inferiores) e incluso en GPUs integradas, dado el tamano reducido de las redes.
- Opciones de despliegue: LiteRT, TensorFlow Lite, ONNX Runtime, LibTorch, ExecuTorch (XNNPACK, Core ML y Vulkan), Core ML nativo y el framework anira.
- Latencia y throughput: no disponibles en la informacion proporcionada; el diseno apunta a inferencia en tiempo real, pero no se publican cifras de FPS ni milisegundos por fotograma.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas/salidas | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anira-project/mediapipe-gesture-recognizer | Pipeline MediaPipe convertido | Imagen RGB → 21 landmarks + 8 gestos | ONNX, TFLite, LibTorch, ExecuTorch, Core ML, Vulkan | Apache 2.0 | HuggingFace, 164 descargas |
| MediaPipe Gesture Recognizer original (Google) | Bundle `.task` float16 | Imagen RGB → landmarks + gestos | TFLite / `.task` | Apache 2.0 | Google MediaPipe |
| MediaPipe Hands (Google) | Deteccion + landmarks | Imagen RGB → 21 landmarks | TFLite | Apache 2.0 | Google MediaPipe |

No se dispone de datos de benchmarks que permitan comparar precision o latencia frente a alternativas como YOLO-pose o modelos de keypoint detection genericos; la comparativa se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no admite instrucciones en lenguaje natural.
- El clasificador solo reconoce 8 gestos predefinidos; cualquier otro gesto se etiqueta como None o se confunde con una clase cercana.
- Los modelos son stateless, por lo que el seguimiento temporal (suavizado, identidad de mano entre fotogramas) debe implementarlo la aplicacion integradora.
- Riesgo de falsos positivos en condiciones de iluminacion adversa, oclusion parcial o manos fuera del encuadre; no se documentan metricas de precision en el repositorio.
- Sesgos de entrenamiento: no se detalla la composicion demografica del dataset de MediaPipe; la model card original de Google menciona evaluaciones de equidad, pero no se reproducen cifras aqui.
- La ruta ExecuTorch Vulkan se exporta pero no se ha ejecutado en el entorno del autor (sin runtime Vulkan), por lo que su correccion no esta verificada en el repositorio.
- La licencia Apache 2.0 permite uso comercial, pero los modelos son de Google y el repositorio solo redistribuye conversiones; conviene conservar el aviso de licencia y citar la model card original.
- El repositorio no incluye el codigo de preprocesado ni postprocesado: este vive en `anira foundation models` (`models/handtracking`), por lo que la integracion exige esa dependencia y el pin de revision con verificacion SHA256.

## Enlaces

- HuggingFace: https://huggingface.co/anira-project/mediapipe-gesture-recognizer
- Repositorio anira: https://github.com/anira-project/anira
- Guia de MediaPipe Gesture Recognizer: https://developers.google.com/edge/mediapipe/solutions/vision/gesture_recognizer
- Model card original de MediaPipe Hand Tracking: https://storage.googleapis.com/mediapipe-assets/Model%20Card%20Hand%20Tracking%20(Lite_Full)%20with%20Fairness%20Oct%202021.pdf
- Script de exportacion ExecuTorch: `export/export_executorch.py` (incluido en el repositorio)
- Script de exportacion Core ML: `export/export_coreml.py` (incluido en el repositorio)
- Verificacion de streaming: `tools/check_streaming.py` (incluido en el repositorio)
