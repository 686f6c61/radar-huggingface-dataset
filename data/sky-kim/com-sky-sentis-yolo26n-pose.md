# Sky-Kim/com.sky.sentis.yolo26n-pose

## Resumen

sentis-yolo26n-pose es la conversión del modelo Ultralytics YOLO26n-pose (variante nano, 17 keypoints COCO) al formato nativo de Unity Inference Engine (Sentis), en precisión FP32 y con entrada fija de 256 x 256 píxeles. Lo publica el usuario Sky-Kim bajo el identificador `com.sky.sentis.yolo26n-pose` y resuelve un problema muy concreto: llevar la estimación de pose humana multi-persona a juegos y aplicaciones Unity que necesitan inferencia on-device, sin depender de un runtime de Python ni de servicios en la nube. El repositorio incluye tanto el artefacto `yolo26n_pose_256_fp32.sentis` como un wrapper en C# (`Yolo26nPose.cs`) autocontenido que gestiona el letterboxing, la ejecución en GPU vía `BackendType.GPUCompute` y la decodificación de la cabeza cruda del modelo.

La relevancia de esta ficha es doble. Por un lado, demuestra el flujo de exportación Ultralytics → ONNX (opset 17, `end2end=False`) → Sentis, que es el camino estándar para integrar detectores YOLO en Unity. Por otro lado, la licencia AGPL-3.0 de los pesos (heredada de Ultralytics) impone obligaciones legales relevantes para cualquier producto distribuido o servicio en red, un punto que el autor documenta explícitamente.

No se dispone de información sobre parámetros totales, datos de entrenamiento ni benchmarks en la documentación proporcionada; esta ficha se limita a lo que el autor publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n-pose (Ultralytics), red de detección de keypoints de una etapa; exportada a Unity Sentis |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | FP32 únicamente (artefacto publicado); no se documentan variantes INT8/FP16 |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | AGPL-3.0 (pesos, vía licencia Ultralytics); código wrapper MIT |
| Formato de pesos | `.sentis` (Unity Sentis); export intermedio ONNX opset 17 |

## Arquitectura y entrenamiento

El modelo es una red de detección de pose de una sola etapa de la familia YOLO26, en su variante nano (`yolo26n-pose`). La cabeza de salida es cruda (`end2end=False`), con tensor `output0` de forma `[1, 56, 1344]` en disposición channel-major: las filas 0-3 contienen el centro x/y y ancho/alto de la caja en píxeles de entrada, la fila 4 la puntuación de persona y las 17 filas restantes los pares (x, y, visibilidad) de cada keypoint COCO. Los 1344 anchors corresponden a las rejillas de 32 x 32, 16 x 16 y 8 x 8 con strides 8, 16 y 32. Las coordenadas ya vienen decodificadas por la cabeza, por lo que en el cliente solo hay que deshacer el letterboxing.

El proceso de conversión documentado por el autor es: exportar `yolo26n-pose.pt` con `format=onnx, imgsz=256, batch=1, opset=17` y cabeza cruda, importar en Sentis y guardar con `ModelWriter.Save`. No hay preprocesado embebido: la entrada es RGB plano en [0, 1]. El autor verifica que la salida de Sentis coincide con la de ONNX Runtime para la misma entrada. No se publican detalles sobre el dataset de entrenamiento original, número de tokens (no aplica) ni si hubo fases de RLHF/DPO, por lo que esos datos deben consultarse en la documentación de Ultralytics.

## Capacidades

- Detección de personas con caja delimitadora y puntuación de confianza.
- Estimación de 17 keypoints corporales COCO por persona, con visibilidad por punto.
- Detección multi-persona con supresión de no máximos (NMS) integrada en el wrapper C#.
- Letterboxing automático de cualquier `Texture` de Unity (o de una región de ella) a la entrada 256 x 256, manteniendo proporción, centrado y relleno con gris 114 de Ultralytics.
- Ejecución en GPU vía `BackendType.GPUCompute` de Unity Sentis, con `Warmup()` para precalentar.
- Umbrales configurables: `ScoreThreshold` (0.25 por defecto), `NmsThreshold` (0.45 por defecto; valores `>= 1` conservan todos los anchors por encima del umbral) y `MaxPeople` (50 por defecto).
- Resultados devueltos en píxeles de la textura origen, con origen en la esquina superior izquierda (y hacia abajo).
- Utilidades de dibujo: `Yolo26nPose.Skeleton` con pares de extremidades y acceso al último `Canvas` de entrada para inspección.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje: es exclusivamente un modelo de visión.

## Casos de uso

- **Animación de avatares en juegos Unity**: capturar la webcam o un vídeo y usar los 17 keypoints para mapear el esqueleto a un rig humanoide en tiempo real, aprovechando la inferencia GPU de Sentis sin salir del motor.
- **Control por gestos y movimiento corporal**: detectar posturas (brazos levantados, sentadillas, etc.) a partir de los keypoints y las visibilidades para activar eventos de gameplay o ejercicios guiados.
- **Análisis deportivo o de fitness on-device**: procesar recortes de un detector de personas y calcular ángulos articulares (rodilla, codo) para evaluar la técnica, con el modelo corriendo localmente y sin enviar vídeo a la nube.
- **Realidad aumentada y filtros**: superponer esqueletos o efectos anclados a articulaciones concretas (muñecas, cadera) en aplicaciones móviles o de escritorio con Unity, usando el letterboxing del wrapper para encajar la región de interés.
- **Telepresencia y captura de movimiento de bajo coste**: pipeline de dos etapas donde un detector de personas recorta la caja y `Yolo26nPose` estima la pose sobre ese recorte, tal como recomienda el autor para encuadres amplios.
- **Análisis de interacción persona-escena en simulaciones**: registrar la posición de articulaciones respecto a objetos virtuales para validar ergonomía o accesibilidad en entornos simulados.
- **Prototipado rápido en editor**: gracias al wrapper autocontenido y a la API `DetectAsync`, se puede integrar en una escena de Unity en pocas líneas para validar ideas antes de invertir en un export a mayor resolución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de mAP, latencia ni throughput; únicamente afirma que la salida de Sentis coincide con la de ONNX Runtime para la misma entrada.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Al ser un modelo nano con entrada 256 x 256 y pesos FP32, la huella debería ser reducida, pero el autor no publica cifras.
- **GPU recomendadas**: no especificadas. El wrapper usa `BackendType.GPUCompute` de Unity Sentis, por lo que se beneficia de cualquier GPU compatible con el backend de cómputo de Unity (escritorio y móvil de gama alta).
- **Compatibilidad con GPU de consumo**: previsiblemente sí, dado el tamaño nano y la resolución de entrada, pero no hay confirmación oficial en la documentación.
- **Opciones de despliegue**: Unity Sentis exclusivamente (formato `.sentis`). No se publican artefactos GGUF, ONNX listos para otros runtimes ni versiones para vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- **Latencia y throughput**: no disponibles. El autor recomienda `Warmup()` antes de la primera inferencia para evitar picos iniciales.

## Comparativa con modelos similares

| Modelo | Entrada | Keypoints | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sentis-yolo26n-pose (este) | 256 x 256 | 17 COCO | `.sentis` (Unity Sentis) | AGPL-3.0 (pesos) | HuggingFace, repo de 0.0 GB |
| Ultralytics yolo26n-pose (original) | configurable (p. ej. 640) | 17 COCO | `.pt` / ONNX | AGPL-3.0 | Ultralytics / HuggingFace |
| Otros exports Sentis de YOLO-pose | variable | 17 COCO | `.sentis` | depende del exportador | no disponible en la información proporcionada |

La comparativa se limita al modelo original de Ultralytics, del que este es una conversión con resolución reducida a 256 x 256 y cabeza cruda. No se dispone de datos de rendimiento para comparar mAP ni latencia con alternativas.

## Limitaciones y advertencias

- **Licencia AGPL-3.0 en los pesos**: distribuir el modelo en un producto o exponerlo como servicio en red activa las obligaciones de AGPL-3.0, salvo que se disponga de una licencia Enterprise de Ultralytics. El código wrapper es MIT, pero eso no exime de las obligaciones sobre los pesos.
- **Resolución de entrada fija y baja**: 256 x 256 está pensado para recortes de una o pocas personas; para encuadres amplios el autor recomienda un export mayor o teselar la imagen, lo que añade complejidad y coste computacional.
- **Riesgo de fallo en poses oclusivas o personas pequeñas**: al ser una variante nano y con entrada reducida, la precisión en keypoints ocluidos o a distancia puede degradarse; no hay métricas publicadas para cuantificarlo.
- **Sesgos del dataset original**: no se documentan en esta ficha; deben consultarse en la documentación de Ultralytics (composición de COCO y posibles sesgos demográficos y de pose).
- **Sin cuantización documentada**: solo se publica FP32, lo que limita optimizaciones de memoria y latencia en dispositivos móviles.
- **Dependencia de Unity Sentis**: el artefacto no es portable a otros runtimes sin reexportar desde ONNX.
- **Repositorio sin descargas ni likes**: 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validación comunitaria y ausencia de reportes de fallos.
- **Fecha de creación futura en los metadatos**: el repositorio figura creado el 2026-11-03, dato que conviene verificar antes de citarlo.
- **Sin garantías de producción**: el autor no publica tests, CI ni resultados de validación más allá de la equivalencia con ONNX Runtime.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sky-Kim/com.sky.sentis.yolo26n-pose
- Licencia de Ultralytics: https://ultralytics.com/license
- Documentación de Unity Sentis: no disponible en la información proporcionada
- Repositorio de Ultralytics: no disponible en la información proporcionada
- Paper de YOLO26: no disponible en la información proporcionada
