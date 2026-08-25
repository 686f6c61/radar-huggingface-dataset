# qualcomm/MediaPipe-Pose-Estimation

## Resumen

MediaPipe-Pose-Estimation es un modelo de detección de puntos clave (keypoint detection) desarrollado por Qualcomm, basado en la implementación de MediaPipePyTorch de Google. Su función principal es predecir bounding boxes y esqueletos de pose de la cara, las manos y el torso en imágenes y vídeo en tiempo real. Está optimizado para ejecutarse en dispositivos Qualcomm mediante el kit Qualcomm AI Hub, que permite compilar, perfilar y evaluar el modelo en hardware real.

El modelo se distribuye como un pipeline de dos etapas típico de MediaPipe: un detector de región de interés (ROI) y un regresor de landmarks que devuelve 33 puntos de pose corporal. Aunque no se publican los parámetros totales, su diseño está pensado para ser ligero y eficiente, con soporte de cuantización w8a8 (pesos y activaciones de 8 bits) además de precisión float. La licencia Apache 2.0 permite uso comercial sin restricciones, y el repositorio incluye exportaciones precompiladas en formato ONNX para varios chipsets Snapdragon y Dragonwing.

La relevancia actual del modelo radica en su integración directa con el ecosistema de Qualcomm AI Hub, que facilita el despliegue en dispositivos móviles y edge con aceleración por hardware. Es una opción práctica para desarrolladores que necesitan seguimiento de pose en tiempo real sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BlazePose (pipeline de dos etapas: detector de ROI y regresor de landmarks) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | float (FP32) y w8a8 (pesos y activaciones de 8 bits) |
| Idiomas soportados | no disponible (no aplica, es un modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (precompilado QNN ONNX) y PyTorch (repositorio fuente) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BlazePose descrita en el paper arXiv:2006.10204, que combina un detector de región de interes (ROI) con un regresor de landmarks. El detector localiza la zona del cuerpo en la imagen y el regresor predice 33 puntos clave (nariz, ojos, articulaciones, etc.) junto con su visibilidad. Esta separacion en dos etapas permite un procesamiento eficiente en tiempo real, ya que el detector opera a baja resolucion y el regresor se aplica solo sobre el recorte.

No se dispone de informacion detallada sobre el conjunto de datos de entrenamiento, el numero de epocas o el uso de tecnicas como RLHF o DPO. La implementacion base proviene de MediaPipePyTorch, un port no oficial de los modelos de MediaPipe a PyTorch, y Qualcomm ha adaptado los pesos para su ejecucion en hardware propio mediante el compilador QNN. La cuantizacion w8a8 reduce el tamaño del modelo y acelera la inferencia en las NPU de los chipsets Snapdragon.

## Capacidades

- Deteccion de bounding boxes y esqueletos de pose de cara, manos y torso en una sola imagen.
- Prediccion de 33 landmarks de pose corporal con coordenadas normalizadas y puntuacion de visibilidad.
- Inferencia en tiempo real en dispositivos moviles y edge, gracias a la optimizacion para NPU de Qualcomm.
- Soporte de cuantizacion w8a8 para reducir el uso de memoria y mejorar la latencia.
- Exportacion precompilada en formato ONNX para multiples chipsets (Snapdragon X Elite, 8 Gen 3, 8 Gen 1, Dragonwing, etc.).
- Integracion con Qualcomm AI Hub Workbench para compilacion, perfilado y evaluacion en hardware real.
- No incluye capacidades de generacion de texto, tool calling ni procesamiento de lenguaje natural.

## Casos de uso

- Aplicaciones de fitness y entrenamiento personal: el modelo puede seguir la postura del usuario en tiempo real para contar repeticiones, corregir la forma de los ejercicios o medir el rango de movimiento. Su baja latencia permite una retroalimentacion inmediata en el movil.
- Realidad aumentada y filtros interactivos: al detectar los landmarks de cara y torso, se pueden superponer efectos virtuales que se ajustan al movimiento del usuario, como mascaras, ropa virtual o avatares animados.
- Analisis de movimiento en fisioterapia: los 33 puntos de pose permiten calcular angulos articulares y detectar patrones anormales de movimiento, util para sesiones de rehabilitacion guiadas por una aplicacion movil.
- Control por gestos en interfaces de usuario: los landmarks de las manos pueden interpretarse como comandos (deslizar, pinzar, senalar) para controlar dispositivos sin contacto fisico, especialmente en kioscos o pantallas publicas.
- Seguimiento de personas en videovigilancia: el modelo puede rastrear la posicion de una persona en un flujo de video, detectando caidas o comportamientos sospechosos en tiempo real, con despliegue en camaras edge basadas en Snapdragon.
- Animacion de personajes 3D: los datos de pose capturados con el modelo pueden alimentar motores de animacion para transferir el movimiento de una persona real a un avatar digital, tanto en aplicaciones de entretenimiento como en produccion de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como mAP, precision o latencia comparativa con otros modelos. Los unicos datos de rendimiento son los chipsets soportados y las versiones de runtime (QAIRT 2.45, ONNX Runtime 1.27.1), pero sin cifras concretas de FPS o tiempo de inferencia.

## Requisitos de hardware

- El modelo esta disenado para ejecutarse en dispositivos con chipsets Qualcomm: Snapdragon X Elite, X2 Elite, 8 Gen 1, 8 Gen 3, 8 Elite, 8 Elite Gen 5, y Dragonwing QCS6490, IQ-8275, QCS8550, IQ-9075.
- No se especifica VRAM minima, pero al ser un modelo de vision ligero (tamano de repo 1.6 GB incluyendo pesos y codigo), es probable que quepa en la memoria de cualquier SoC movil moderno.
- Para desarrollo y pruebas, se puede ejecutar en CPU o GPU de escritorio, aunque el rendimiento optimo se obtiene con la compilacion QNN en hardware Qualcomm.
- Opciones de despliegue: Qualcomm AI Hub Workbench para compilar y evaluar, o descarga directa de los archivos precompilados QNN ONNX e integracion con ONNX Runtime.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediaPipe-Pose-Estimation (Qualcomm) | BlazePose (2 etapas) | no disponible | no aplica | Apache 2.0 | ONNX precompilado para Qualcomm |
| MoveNet (Google) | EfficientNet-based | ~4-17 M | no aplica | Apache 2.0 | TensorFlow Lite, multiplataforma |
| PoseNet (Google) | MobileNet/ResNet | ~5-10 M | no aplica | Apache 2.0 | TensorFlow.js, navegador |

La comparativa es cualitativa porque no hay datos de rendimiento publicados para el modelo de Qualcomm. MoveNet y PoseNet son alternativas mas ligeras y ampliamente soportadas en multiples plataformas, mientras que MediaPipe-Pose-Estimation destaca por su optimizacion especifica para hardware Qualcomm, lo que puede ofrecer mejor latencia en esos dispositivos.

## Limitaciones y advertencias

- No se han documentado sesgos especificos en la informacion disponible, pero al ser un modelo de deteccion de pose, puede presentar errores con oclusiones, iluminacion pobre o posturas extremas.
- Riesgo de alucinacion: en imagenes ambiguas o con multiples personas, el modelo puede producir landmarks incorrectos o bounding boxes imprecisos.
- Limitaciones de contexto: al ser un modelo de vision, no procesa texto ni entiende instrucciones; solo genera coordenadas de puntos clave.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero el codigo base de MediaPipePyTorch puede tener condiciones adicionales (se recomienda revisar el repositorio original).
- Para produccion, es necesario validar el rendimiento en el chipset objetivo, ya que la compilacion QNN puede variar segun la version de QAIRT y el hardware concreto.

## Enlaces

- HuggingFace: https://huggingface.co/qualcomm/MediaPipe-Pose-Estimation
- Repositorio base MediaPipePyTorch: https://github.com/zmurez/MediaPipePyTorch/
- Paper BlazePose (arXiv:2006.10204): https://arxiv.org/abs/2006.10204
- Qualcomm AI Hub (modelo): https://aihub.qualcomm.com/models/mediapipe_pose
- Repositorio Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models
