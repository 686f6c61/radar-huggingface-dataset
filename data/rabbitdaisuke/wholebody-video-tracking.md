# RabbitDaisuke/Wholebody-Video-Tracking

## Resumen

Wholebody-Video-Tracking es un repositorio de modelos de estimación de pose y keypoints corporales publicado por el usuario RabbitDaisuke en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un conjunto de espejos verificados de pesos preentrenados de terceros: los task bundles de MediaPipe GHUM Full/Lite (pose corporal y manos) y los modelos ONNX RTMPose-s/m de 133 puntos de OpenMMLab. El autor declara explícitamente que no reentrena sobre subconjuntos de imágenes y que conserva los pesos originales.

El paquete resuelve un problema de ingeniería más que de investigación: ofrece un punto de descarga único con verificación de integridad (SHA-256 en `manifest.json`), URLs de origen y contratos de modelo documentados, además de un `verification.json` que registra inferencias reales en CPU sobre fixtures públicos. Está orientado a pipelines de seguimiento de cuerpo completo en vídeo, con salida de keypoints 2D y estimación de coordenadas mundiales monoculares.

La relevancia es acotada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamaño de 0,1 GB y licencia Apache-2.0 heredada de los proyectos upstream. Los idiomas declarados (inglés y japonés) corresponden a la documentación, no a capacidades lingüísticas del modelo, que es puramente de visión por computador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GHUM (MediaPipe) para pose 3D corporal y manos; RTMPose (OpenMMLab) para estimación 2D de 133 keypoints |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no lingüístico) |
| Tipos de cuantizacion | no disponible; se distribuyen pesos originales y modelos ONNX |
| Idiomas soportados | en, ja (documentación; el modelo no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX y bundles de tareas de MediaPipe (task bundles); tamaños exactos por variante no disponibles |

## Arquitectura y entrenamiento

El repositorio agrupa dos familias de modelos con enfoques distintos. Por un lado, los bundles de MediaPipe basados en GHUM, un modelo estadístico de cuerpo humano aprendido que produce pose 3D y keypoints de manos; se ofrecen dos variantes, Full y Lite, donde Lite sacrifica precisión a cambio de menor coste computacional. Por otro, los modelos RTMPose-s y RTMPose-m de OpenMMLab en formato ONNX, que estiman 133 keypoints de cuerpo completo en 2D y no emiten profundidad medida.

No hay entrenamiento propio ni ajuste fino: el autor indica que conserva todos los pesos preentrenados originales y que no reentrena sobre subconjuntos pequeños de imágenes. Tampoco se documentan en la información disponible el número de tokens, la composición del dataset ni procesos de RLHF/DPO, que en cualquier caso no aplican a modelos de keypoint detection. La innovación técnica del paquete es de trazabilidad: `manifest.json` registra hashes SHA-256, URLs de origen, contratos de modelo y revisiones inmutables de los assets en Hugging Face, mientras que `verification.json` documenta inferencias reales en CPU sobre fixtures públicos de los proyectos upstream.

## Capacidades

- Detección de keypoints de cuerpo completo en vídeo e imagen.
- Estimación de pose 3D corporal con GHUM Full y GHUM Lite.
- Seguimiento de manos mediante los task bundles de MediaPipe.
- Estimación 2D de 133 keypoints con RTMPose-s y RTMPose-m en ONNX.
- Salida de coordenadas mundiales monoculares y traslación de cámara-raíz como estimaciones, no como medidas exactas.
- Verificación de integridad de pesos mediante SHA-256 y contratos de modelo documentados.
- Inferencia en CPU validada sobre fixtures públicos según `verification.json`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.

## Casos de uso

- Análisis de movimiento deportivo: usar GHUM Full para extraer pose 3D de secuencias de vídeo y calcular ángulos articulares; la variante Lite permite procesar lotes grandes en hardware modesto.
- Motion capture de bajo coste: combinación de RTMPose para keypoints 2D y GHUM para elevación a 3D en pipelines de animación o previsualización.
- Interacción persona-ordenador sin mandos: los bundles de manos de MediaPipe permiten construir interfaces gestuales en tiempo real sobre CPU.
- Telemedicina y rehabilitación: seguimiento de ejercicios con keypoints 2D de 133 puntos para evaluar rangos de movimiento, asumiendo las limitaciones de precisión en vídeos arbitrarios.
- Auditoría de cadena de suministro de modelos: el `manifest.json` con hashes y URLs de origen facilita verificar que los pesos desplegados coinciden con los upstream de MediaPipe y MMPose.
- Investigación reproducible en visión: el `verification.json` con inferencias en CPU sobre fixtures públicos sirve como test de contrato ejecutable en CI antes de desplegar cambios de infraestructura.
- Prototipado de análisis de vídeo en entornos sin GPU: los modelos ONNX y los bundles de MediaPipe pueden ejecutarse en CPU, lo que encaja en validaciones locales o servidores sin acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor advierte que las comprobaciones de `verification.json` demuestran contratos de modelo ejecutables, no precisión sobre vídeos arbitrarios ni un uso de GPU bajo en un dispositivo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los modelos están pensados para ejecución en CPU y no se documentan requisitos de GPU.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; la verificación documentada se realizó en CPU.
- Opciones de despliegue: ONNX Runtime para los modelos RTMPose; MediaPipe Tasks para los bundles GHUM. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Keypoints | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wholebody-Video-Tracking | GHUM + RTMPose (espejo) | 133 (RTMPose) y pose 3D GHUM | no aplica | Apache-2.0 | Hugging Face, 0 descargas |
| MediaPipe Pose (upstream) | GHUM | Pose corporal 3D | no aplica | Apache-2.0 | GitHub google-ai-edge/mediapipe |
| MMPose RTMPose (upstream) | RTMPose | 133 | no aplica | Apache-2.0 | GitHub open-mmlab/mmpose |
| Otros modelos de pose 2D/3D | no disponible | no disponible | no aplica | no disponible | no disponible |

La comparativa relevante es contra los propios upstream: este repositorio no aporta pesos nuevos, sino empaquetado y verificación. Para producción conviene evaluar directamente MediaPipe v0.10.21 y MMPose en el commit referenciado.

## Limitaciones y advertencias

- No es un modelo original: cualquier mérito de precisión corresponde a MediaPipe y MMPose, no al autor del espejo.
- Las coordenadas mundiales monoculares y la traslación de cámara-raíz son estimaciones; no deben tratarse como medidas métricas fiables.
- RTMPose no emite profundidad medida; para 3D hay que combinar con GHUM u otro elevador.
- La verificación documentada prueba contratos ejecutables en CPU sobre fixtures públicos, no precisión en vídeos arbitrarios ni rendimiento en GPU concretas.
- GHUM Lite intercambia precisión por coste computacional; no es adecuado para aplicaciones que requieran máxima exactitud.
- No se publican vídeos, fotogramas, audio, landmarks personales ni credenciales de usuario, pero el despliegue en producción debe gestionar el cumplimiento de privacidad por su cuenta.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones de los proyectos upstream (MediaPipe y MMPose) y de los datasets con los que se entrenaron originalmente.
- Idiomas declarados (en, ja) se refieren a documentación; el modelo no procesa lenguaje natural.
- Sesgos conocidos y riesgo de alucinación: no aplica en el sentido lingüístico, pero los sesgos de los datasets de pose originales (demografía, iluminación, oclusión) se heredan sin documentar en esta ficha.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni mantenimiento demostrado.

## Enlaces

- Hugging Face: https://huggingface.co/RabbitDaisuke/Wholebody-Video-Tracking
- MediaPipe (v0.10.21): https://github.com/google-ai-edge/mediapipe/tree/v0.10.21
- MMPose (commit 759b39c): https://github.com/open-mmlab/mmpose/tree/759b39c13fea6ba094afc1fa932f51dc1b11cbf9
