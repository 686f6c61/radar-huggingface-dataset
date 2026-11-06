# NardoCreations/mediapipe-face-onnx

## Resumen

MediaPipe Face ONNX es un paquete de modelos de visión por computador para detección de rostros y extracción de puntos faciales (face landmarks), publicado por NardoCreations. No se trata de un modelo de lenguaje, sino de una conversión a ONNX de dos redes de Google MediaPipe: un detector BlazeFace de corto alcance y una malla facial (face mesh) que produce 478 puntos tridimensionales. El paquete está pensado para ejecutarse en el navegador mediante ONNX Runtime Web con el backend WebGPU.

El modelo resuelve el problema de integrar detección y seguimiento facial en aplicaciones web sin depender de servidores: ambos modelos se empaquetan en un único fichero con formato propietario `NCMP`, lo que simplifica la distribución y la carga en el cliente. Es la pieza que utiliza la herramienta NardoCut para recorte automático (auto reframe) y embellecimiento de vídeo, ejecutándose localmente en el ordenador del usuario.

La relevancia actual radica en que ofrece una alternativa ligera y con licencia Apache 2.0 para tareas de análisis facial en el navegador con aceleración por GPU, sin necesidad de infraestructura de inferencia en la nube. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se dispone de información sobre idiomas ni sobre el tamaño real de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos redes convolucionales: BlazeFace (detección) y Face Mesh V2 (landmarks) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | float16 (pesos originales); el paquete no documenta otras cuantizaciones |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17), empaquetado en un fichero `NCMP` |
| Entrada del detector | 1×128×128×3, rango −1…1; 896 cajas de 16 valores y 896 puntuaciones |
| Entrada de la malla | 1×256×256×3, rango 0…1; 478 puntos × 3 en píxeles del recorte y un logit de presencia |
| Backend previsto | ONNX Runtime Web con WebGPU |
| Batch | fijo a 1 |

## Arquitectura y entrenamiento

El paquete contiene dos redes independientes. La primera es BlazeFace de corto alcance, un detector de rostros basado en convoluciones ligeras que recibe una imagen de 128×128 píxeles normalizada en el rango −1…1 y devuelve 896 cajas candidatas de 16 valores junto con 896 puntuaciones de confianza. La segunda es Face Mesh V2, que recibe un recorte de 256×256 píxeles en el rango 0…1 y produce 478 puntos faciales con coordenadas tridimensionales en píxeles del recorte, además de un logit de presencia que indica si hay una cara en la entrada.

Los pesos proceden de Google MediaPipe, en concreto del fichero `face_landmarker.task` de la versión float16 v1, con SHA-256 `64184e229b263107bc2b804c6625db1341ff2bb731874b0bcc2fe6544e0bc9ff`. NardoCreations realizó únicamente la conversión de TFLite a ONNX mediante `tf2onnx` con opset 17 y batch fijo a 1; según la model card, cada red responde igual que el original TFLite con una tolerancia de 3·10⁻⁴ sobre entradas aleatorias. No se documentan datos de entrenamiento, composición del dataset ni procesos de ajuste posteriores, ya que los pesos son los originales de Google sin modificar más allá del formato.

La innovación destacable no está en la arquitectura, sino en el empaquetado: el formato `NCMP` (u32 con versión 1, u32 con el número de modelos y, por cada modelo, longitud y nombre en UTF-8, tamaño y bytes ONNX, todo en little-endian) permite cargar ambas redes desde un solo fichero, lo que reduce peticiones de red y simplifica el despliegue en aplicaciones web.

## Capacidades

- Detección de rostros en imágenes con BlazeFace de corto alcance, con 896 cajas candidatas y sus puntuaciones.
- Extracción de 478 puntos faciales tridimensionales con Face Mesh V2, incluyendo un logit de presencia de cara.
- Ejecución en el navegador mediante ONNX Runtime Web con WebGPU, sin envío de datos a servidores.
- Procesamiento de un único rostro por inferencia (batch fijo a 1).
- Integración en pipelines de análisis facial para recorte automático y embellecimiento, como en NardoCut.
- No incluye generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Recorte automático de vídeo (auto reframe): el detector localiza la cara en cada fotograma y la malla permite centrar el encuadre en el rostro del hablante, ejecutándose en el navegador del usuario sin subir el vídeo a un servidor.
- Embellecimiento facial en editores web: los 478 puntos permiten aplicar suavizado de piel, retoque de ojos o filtros localizados en tiempo real sobre la imagen del usuario.
- Videollamadas y aplicaciones de webcam: el paquete puede alimentar efectos de seguimiento facial, avatares o máscaras directamente en el cliente con WebGPU.
- Análisis de expresiones básicas: la geometría de los 478 puntos sirve para estimar apertura de ojos, posición de la boca y orientación de la cabeza en herramientas de accesibilidad o análisis de atención.
- Pruebas de realidad aumentada en navegador: colocación de gafas, sombreros u otros objetos virtuales anclados a los landmarks faciales sin infraestructura de servidor.
- Preprocesado en aplicaciones de privacidad: al ejecutarse localmente, permite detectar y difuminar rostros antes de compartir imágenes, sin que los datos salgan del dispositivo.
- Prototipado rápido de visión por computador: al ser un único fichero ONNX con licencia Apache 2.0, es adecuado para experimentar con detección y malla facial en entornos web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que cada red responde como el original TFLite con una tolerancia de 3·10⁻⁴ sobre entradas aleatorias, lo que es una comprobación de equivalencia numérica, no una evaluación de precisión sobre datasets.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño de los pesos no se documenta y el repositorio ocupa 0.0 GB según Hugging Face.
- GPU recomendadas: no disponibles. Al estar orientado a WebGPU, funcionaría en GPUs integradas y dedicadas compatibles con navegadores que soporten WebGPU, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado que MediaPipe Face Landmarker está diseñado para ejecutarse en tiempo real en dispositivos móviles y de escritorio, aunque no hay datos confirmados para este paquete.
- Opciones de despliegue: ONNX Runtime Web (WebGPU) es el backend previsto; también podría usarse ONNX Runtime nativo, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Puntos faciales | Formato | Licencia | Contexto de ejecución |
|---|---|---|---|---|---|
| MediaPipe Face ONNX (este) | Detección + malla facial | 478 | ONNX en paquete NCMP | Apache 2.0 | Navegador (WebGPU) |
| MediaPipe Face Landmarker original (Google) | Detección + malla facial | 478 | TFLite (`face_landmarker.task`) | Apache 2.0 | Móvil, escritorio, web |
| MediaPipe Face Mesh | Malla facial | 468 | TFLite | Apache 2.0 | Móvil, escritorio, web |
| BlazeFace (Google) | Detección de rostros | no aplica | TFLite | Apache 2.0 | Móvil, escritorio |

La comparación se limita a las variantes de MediaPipe porque no se dispone de datos de rendimiento de este paquete frente a alternativas como YuNet o RetinaFace. La diferencia principal frente al original de Google es el formato ONNX y el empaquetado en un solo fichero, no la arquitectura ni los pesos.

## Limitaciones y advertencias

- Modelo de visión: no procesa texto ni mantiene conversaciones; cualquier uso como modelo de lenguaje es inválido.
- Batch fijo a 1: no admite procesar varias imágenes simultáneamente en una sola inferencia.
- Un solo rostro por inferencia: el detector BlazeFace de corto alcance y la malla están pensados para una cara; escenas con múltiples rostros pueden requerir ejecuciones adicionales.
- Conversión no verificada de forma independiente: la equivalencia con TFLite se declara con tolerancia de 3·10⁻⁴, pero no hay evaluación pública de precisión sobre datasets.
- Licencia Apache 2.0: permite uso comercial, pero los pesos son de Google y el autor indica que se mantienen sin cambios salvo el formato; conviene revisar las condiciones de las model cards originales de Face Mesh V2 y BlazeFace.
- Dependencia de WebGPU: el backend previsto requiere un navegador con soporte de WebGPU, lo que limita la compatibilidad con navegadores antiguos o entornos sin GPU.
- Sin datos de sesgo: no se documentan sesgos demográficos, de iluminación o de oclusión facial.
- Repositorio sin actividad: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la evidencia de uso en producción.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el logit de presencia puede producir falsos positivos en imágenes sin rostro.

## Enlaces

- Hugging Face: https://huggingface.co/NardoCreations/mediapipe-face-onnx
- Modelo original de Google MediaPipe: https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task
- Documentación de MediaPipe Face Landmarker: https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- Repositorio de NardoCut (scripts de conversión en `tools/rosto/`): no disponible como enlace directo en la información proporcionada.
