# anira-project/mediapipe-gesture-recognizer

## Resumen

El modelo `anira-project/mediapipe-gesture-recognizer` es una conversión multiformato del paquete `gesture_recognizer.task` de MediaPipe, publicado por el proyecto anira. No se trata de un modelo de lenguaje, sino de un conjunto de cuatro redes neuronales convolucionales que implementan una canalización completa de detección de manos y reconocimiento de gestos estáticos en tiempo real: detección de palma, detección de 21 puntos clave de la mano, generación de embeddings de gesto y clasificación en ocho gestos predefinidos.

Su relevancia radica en que expone los pesos originales de Google en formatos de inferencia intercambiables (LiteRT, ONNX Runtime, LibTorch, ExecuTorch con XNNPACK, Core ML y Vulkan), lo que permite desplegar la misma canalización en CPU, GPU y Neural Engine sin depender del runtime de MediaPipe. El repositorio incluye los scripts de exportación y verifica numéricamente cada formato contra ONNX Runtime como referencia, con desviaciones máximas del orden de 1e-3 a 4e-3.

La licencia es Apache 2.0 (heredada de los modelos originales de MediaPipe) y el tamaño total del repositorio es de aproximadamente 0,1 GB. La model card no proporciona información sobre arquitecturas internas detalladas, número de parámetros ni composición del dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (cuatro redes convolucionales independientes: detector de palma, detector de landmarks, embedder de gesto y clasificador) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantización | Float16 (bundle original de MediaPipe); exportaciones Core ML en float16 para Neural Engine; resto de formatos sin cuantización especificada |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite, LiteRT, ONNX, LibTorch, ExecuTorch (`.pte` con XNNPACK, Core ML y Vulkan), Core ML `.mlpackage` |

## Arquitectura y entrenamiento

La canalización consta de cuatro submodelos con interfaces tensoriales explícitas. El `hand_detector` recibe una imagen NHWC RGB de `[1,192,192,3]` en el rango `[0,1]` y produce 2016 cajas con keypoints (`[1,2016,18]`) y puntuaciones (`[1,2016,1]`). El `hand_landmarks_detector` recibe un recorte de `[1,224,224,3]` y devuelve 21 landmarks (`[1,63]`), presencia (`[1,1]`), lateralidad (`[1,1]`) y landmarks en coordenadas de mundo (`[1,63]`). El `gesture_embedder` combina landmarks, lateralidad y world landmarks en un vector de 128 dimensiones, y el `canned_gesture_classifier` lo mapea a 8 puntuaciones de gesto.

Los modelos son stateless: no mantienen estado entre llamadas, y la model card indica que se han validado transmitiendo cada formato durante doce llamadas consecutivas con realimentación de estado. Las exportaciones a ExecuTorch se generan desde los modelos ONNX mediante `export_executorch.py`, con verificación contra ONNX Runtime (desviación máxima de 1,5e-4 en el proceso de exportación). No se documentan en la información disponible los detalles del dataset de entrenamiento, el número de tokens (no aplica) ni si hubo ajuste fino con RLHF o DPO.

## Capacidades

- Detección de manos en imagen completa con 2016 candidatos y puntuaciones de confianza.
- Localización de 21 landmarks por mano, incluyendo coordenadas en el espacio de la imagen y coordenadas de mundo.
- Clasificación de lateralidad (mano izquierda o derecha).
- Generación de embeddings de 128 dimensiones que describen la configuración de la mano.
- Clasificación en ocho gestos predefinidos de MediaPipe: None, Closed_Fist, Open_Palm, Pointing_Up, Thumb_Down, Thumb_Up, Victory e ILoveYou.
- Inferencia en tiempo real sobre CPU, GPU y Neural Engine según el formato elegido.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No dispone de capacidades multilingües ni de modalidad de audio.

## Casos de uso

- Control por gestos en aplicaciones de escritorio: la canalización se integra en el runtime anira y permite mapear gestos como Open_Palm o Closed_Fist a acciones de la interfaz, con latencia adecuada para interacción en tiempo real en CPU.
- Interacción sin contacto en entornos sanitarios o industriales: el detector de palma y los landmarks permiten operar paneles o visores sin tocar superficies, desplegando el formato LiteRT o ONNX en dispositivos embebidos.
- Realidad aumentada y filtros: el embedder de gesto y los 21 landmarks alimentan el anclaje de objetos virtuales a la mano, con exportaciones Core ML para aprovechar el Neural Engine en iPhone y iPad.
- Reconocimiento de lenguaje de signos a nivel de vocabulario: los ocho gestos predefinidos sirven como base para prototipos de comunicación asistida, sustituyendo el clasificador final por uno propio entrenado sobre los embeddings de 128 dimensiones.
- Automatización de pruebas de interfaz: la canalización puede ejecutarse en pipelines de CI sobre imágenes sintéticas o grabaciones para verificar que el comportamiento de una aplicación de visión por computador no regresa entre versiones.
- Teleoperación de robots y drones: los landmarks en coordenadas de mundo y la lateralidad permiten traducir la pose de la mano en comandos de movimiento, con la variante Vulkan para GPUs integradas.
- Análisis de vídeo offline: el modelo stateless procesa fotogramas independientes, lo que facilita el análisis por lotes de grabaciones para extraer estadísticas de gestos en estudios de usabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta desviaciones numéricas entre formatos respecto a ONNX Runtime:

| Formato | hand_detector | hand_landmarks_detector | gesture_embedder | canned_gesture_classifier |
|---|---|---|---|---|
| ExecuTorch Core ML (float16) | 4,3e-3 | 1,0e-3 | 7,1e-4 | 0 |
| Core ML ML program (float16) | 4,3e-3 | 1,0e-3 | 7,1e-4 | 0 |
| ExecuTorch Vulkan | Exportado, no ejecutado (sin runtime Vulkan) | — | — | — |

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio completo ocupa 0,1 GB, por lo que cada submodelo es de tamaño reducido y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican modelos concretos; la variante Vulkan está pensada para GPUs en general y la variante Core ML para el Neural Engine de Apple.
- Compatibilidad con GPU consumer: previsiblemente sí en cualquier GPU con soporte Vulkan o Core ML, dado el tamaño del bundle; no se aportan cifras de VRAM por submodelo.
- Opciones de despliegue: LiteRT, TensorFlow Lite, ONNX Runtime, LibTorch, ExecuTorch (XNNPACK en CPU, Core ML en Apple, Vulkan en GPU) y Core ML nativo (previsto en anira v3, macOS 13 e iOS 16).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Formatos | Gestos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anira-project/mediapipe-gesture-recognizer | Canalización de 4 CNN | TFLite, LiteRT, ONNX, LibTorch, ExecuTorch, Core ML | 8 clases | Apache 2.0 | Hugging Face |
| MediaPipe `gesture_recognizer.task` original | Canalización de 4 CNN | TFLite | 8 clases | Apache 2.0 | Google MediaPipe |
| MediaPipe Hand Tracking (Lite/Full) | Detección y landmarks | TFLite | No aplica | Apache 2.0 | Google MediaPipe |

No se dispone de datos de benchmarks que permitan comparar rendimiento numérico con alternativas de terceros.

## Limitaciones y advertencias

- El modelo solo reconoce ocho gestos estáticos predefinidos; no cubre gestos dinámicos ni secuencias.
- No se documentan sesgos demográficos ni de tono de piel en la información disponible; la model card original de MediaPipe Hand Tracking incluye una sección de fairness que conviene consultar antes de desplegar en producción.
- Riesgo de falsos positivos y negativos en condiciones de oclusión, iluminación adversa o manos parcialmente fuera de encuadre; no se aportan métricas de precisión.
- Los modelos son stateless, por lo que no hay suavizado temporal integrado; cualquier estabilización debe implementarse en la capa de aplicación.
- La variante Vulkan se ha exportado pero no se ha ejecutado en el entorno de validación del autor, por lo que su corrección numérica no está verificada.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda conservar el aviso de licencia y verificar los términos de los modelos originales de Google.
- El repositorio solo contiene pesos, script de exportación y licencia; el contrato, el preprocesado y el postprocesado viven en el repositorio `anira-project/models`, por lo que es necesario fijar una revisión y comprobar los SHA256 al descargar.

## Enlaces

- Hugging Face: https://huggingface.co/anira-project/mediapipe-gesture-recognizer
- Repositorio anira: https://github.com/anira-project/anira
- Repositorio de modelos y scripts de exportación: https://github.com/anira-project/models
- Script de exportación ExecuTorch: https://github.com/anira-project/models/blob/main/models/handtracking/export/export_executorch.py
- Guía de MediaPipe Gesture Recognizer: https://developers.google.com/edge/mediapipe/solutions/vision/gesture_recognizer
- Model card original de MediaPipe Hand Tracking: https://storage.googleapis.com/mediapipe-assets/Model%20Card%20Hand%20Tracking%20(Lite_Full)%20with%20Fairness%20Oct%202021.pdf
