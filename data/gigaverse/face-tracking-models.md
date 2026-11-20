# Gigaverse/face-tracking-models

## Resumen

Gigaverse/face-tracking-models es un repositorio de tres detectores de rostro en formato TensorFlow Lite (`.tflite`) empaquetados por Gigaverse para su uso con MediaPipe Tasks Vision ObjectDetector en el worker de cámara web de su aplicación. No se trata de un modelo generativo ni de un modelo de lenguaje: son pesos de detección de objetos (caras) derivados de dos arquitecturas upstream conocidas, YuNet y UltraFace, convertidos a TFLite para inferencia en navegador o en dispositivos de borde.

El paquete incluye tres variantes con distintos compromisos de tamaño y precisión: `yunet-256-int8.tflite` (cuantización entera de 8 bits, entrada 256), `yunet-160.tflite` (punto flotante de 32 bits, entrada 160) y `slim-160.tflite` (UltraFace Slim, entrada 160). La aplicación selecciona el detector en tiempo de ejecución y descarga únicamente el archivo necesario, lo que reduce el ancho de banda en el cliente.

Su relevancia es acotada pero práctica: ofrece artefactos listos para usar con MediaPipe Tasks Vision en pipelines de detección facial en el navegador, con licencia MIT y sumas de verificación SHA256 publicadas. El repositorio no incluye model card técnica detallada, métricas de precisión ni información sobre el recetario de conversión original, que el autor declara no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes de detección de rostros tipo CNN de una etapa (YuNet y UltraFace Slim), convertidas a TensorFlow Lite |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | int8 (yunet-256-int8), fp32 (yunet-160 y slim-160) |
| Idiomas soportados | no aplica (detección de rostros, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | TensorFlow Lite (.tflite); paquete adicional .tgz con avisos de licencia MIT upstream |

## Arquitectura y entrenamiento

Los tres artefactos son conversiones de detectores de rostro preexistentes. `yunet-256-int8.tflite` y `yunet-160.tflite` derivan de YuNet, un detector de rostros de una etapa publicado en OpenCV Zoo (commit `48b10fa505aeb51fbd127fc60a5c660040e823b7`). `slim-160.tflite` deriva de UltraFace, en concreto la variante Ultra-Light-Fast-Generic-Face-Detector-1MB (commit `dffdddda9794a50607cba8f318507a28c1c27cab`).

No se documenta en la información disponible el número de parámetros, el dataset de entrenamiento, el número de tokens (no aplica) ni si hubo ajuste fino adicional. El autor indica explícitamente que el recetario de conversión original no está verificado, por lo que no puede garantizarse la equivalencia numérica exacta con los modelos upstream. Los artefactos están pensados para ejecutarse con MediaPipe Tasks Vision ObjectDetector, que gestiona el preprocesado y el postprocesado de las cajas delimitadoras.

## Capacidades

- Detección de rostros: devuelve cajas delimitadoras (bounding boxes) de caras en imágenes o fotogramas de vídeo.
- Tres variantes con distinto equilibrio tamaño/precisión: int8 a 256 de entrada, fp32 a 160 y UltraFace Slim a 160.
- Integración con MediaPipe Tasks Vision ObjectDetector para ejecución en navegador o en dispositivos de borde.
- Carga selectiva por parte de la aplicación: solo se descarga el detector elegido.
- Verificación de integridad mediante `SHA256SUMS`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente perceptivo de visión.

## Casos de uso

- Detección de rostros en el navegador: el worker de cámara web de Gigaverse usa estos detectores para localizar caras en tiempo real sin enviar vídeo al servidor, lo que reduce latencia y preserva la privacidad.
- Seguimiento facial en videollamadas o filtros web: la variante int8 de 256 permite procesar fotogramas con menor huella de memoria en dispositivos móviles.
- Preprocesado para reconocimiento facial: las cajas devueltas pueden alimentar un segundo modelo de identificación o verificación, separando detección y reconocimiento.
- Aplicaciones de control de presencia o conteo de personas: la variante Slim de 160 es adecuada para escenarios con recursos muy limitados donde prima el rendimiento sobre la precisión.
- Prototipado rápido con MediaPipe: al estar en TFLite y seguir la interfaz de ObjectDetector, se pueden integrar en demos web o apps de escritorio con mínima configuración.
- Automatización de recorte y encuadre de retratos: usar las cajas detectadas para centrar o recortar imágenes en pipelines de edición por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser modelos TFLite de detección facial de tamaño reducido, se espera que operen en el rango de decenas a pocos cientos de MB de memoria, aunque no se aportan cifras oficiales.
- GPU recomendadas: no disponible. El diseño apunta a ejecución en CPU o en aceleradores ligeros (GPU integrada, DSP, NPU de móvil) mediante el runtime de TensorFlow Lite.
- Compatibilidad con GPU de consumo: no hay datos oficiales; por el formato y el tamaño típico de estos detectores, es plausible su ejecución en GPU de consumo, pero no puede confirmarse con la información disponible.
- Opciones de despliegue: MediaPipe Tasks Vision ObjectDetector (entorno principal documentado), TensorFlow Lite runtime, y cualquier runtime compatible con `.tflite` (por ejemplo, intérpretes de TFLite en Android, iOS o web).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gigaverse yunet-256-int8 | YuNet (TFLite) | 256 | int8 | MIT | Hugging Face (Gigaverse/face-tracking-models) |
| Gigaverse yunet-160 | YuNet (TFLite) | 160 | fp32 | MIT | Hugging Face (Gigaverse/face-tracking-models) |
| Gigaverse slim-160 | UltraFace Slim (TFLite) | 160 | fp32 | MIT | Hugging Face (Gigaverse/face-tracking-models) |
| YuNet original (OpenCV Zoo) | YuNet (ONNX) | variable | fp32 | MIT | OpenCV Zoo |
| Ultra-Light-Fast-Generic-Face-Detector-1MB | UltraFace Slim | 160 | fp32 | MIT | Repositorio Linzaer en GitHub |

No se dispone de datos de precisión (mAP, WIDER Face) ni de latencia comparada en la información proporcionada, por lo que la comparativa se limita a arquitectura, formato y licencia.

## Limitaciones y advertencias

- El recetario de conversión original no está verificado por el autor, por lo que no se garantiza la equivalencia exacta con los modelos upstream.
- No se publican métricas de precisión, recall ni mAP; no es posible evaluar su calidad frente a alternativas sin pruebas propias.
- Detección de rostros únicamente: no realiza reconocimiento de identidad, estimación de pose, landmarks ni análisis de expresiones.
- Posibles sesgos heredados de los datasets de entrenamiento de YuNet y UltraFace (no documentados en este repositorio), con riesgo de menor precisión en determinados grupos demográficos, condiciones de iluminación u oclusiones.
- No apto para usos de vigilancia o identificación biométrica sin evaluación legal y ética previa; la licencia MIT permite uso comercial, pero no exime de cumplir la normativa de protección de datos aplicable.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.
- El tamaño del repo figura como 0.0 GB, lo que puede indicar que los artefactos no están completamente subidos o que la métrica no se ha actualizado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Gigaverse/face-tracking-models
- YuNet en OpenCV Zoo (upstream): https://github.com/opencv/opencv_zoo/tree/48b10fa505aeb51fbd127fc60a5c660040e823b7/models/face_detection_yunet
- Ultra-Light-Fast-Generic-Face-Detector-1MB (upstream): https://github.com/Linzaer/Ultra-Light-Fast-Generic-Face-Detector-1MB/tree/dffdddda9794a50607cba8f318507a28c1c27cab
- MediaPipe Tasks Vision ObjectDetector: no disponible en la información proporcionada
- Aplicación de referencia (gigaverse-app/gigaverse-web-app, commit e73a666cd): no disponible como enlace directo en la información proporcionada
