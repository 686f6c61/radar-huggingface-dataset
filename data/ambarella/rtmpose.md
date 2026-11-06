# Ambarella/RTMPose

## Resumen

RTMPose es un framework de estimación de pose humana (human pose estimation) en tiempo real, con enfoque top-down (primero se detectan las personas y después se estiman los keypoints de cada una). Lo desarrolla el proyecto OpenMMLab/MMPose y esta variante concreta la publica Ambarella, que ha convertido los pesos originales a formatos optimizados para sus SoC de visión (N1-655, X7, CV7, CV72, CV75) mediante su SDK Cooper. El modelo resuelve la detección de keypoints corporales (17 puntos del esqueleto en el esquema COCO) con latencias compatibles con vídeo en directo.

La variante alojada en este repositorio es RTMPose-M, el punto medio de la familia RTMPose (tiny, s, m, l, x), entrenada sobre COCO con la estrategia SimCC (Simulated Coordinate Classification) y una resolución de entrada de 3x256x192. Frente a los detectores de pose de una etapa, el enfoque top-down de RTMPose permite mayor precisión por persona a costa de depender de un detector de personas previo.

Su relevancia actual radica en que es una de las implementaciones de referencia para estimación de pose en el edge: los binarios incluidos están compilados y optimizados para NPU de Ambarella, lo que permite desplegar análisis de movimiento, interacción persona-ordenador o videovigilancia en cámaras y dispositivos embebidos sin GPU dedicada. No es un modelo de lenguaje: no genera texto ni soporta tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN top-down con backbone CSPNeXt y cabeza SimCC (clasificación de coordenadas simulada) |
| Parametros totales | no disponible (variante M de RTMPose; el paper reporta ~13,6 M para RTMPose-M, dato no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | Pesos optimizados "Amba_optimized" y variante con activaciones fp16 ("Activation_fp16") para NPU Ambarella |
| Idiomas soportados | no aplica (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | .bin propietario por SoC (N1-655, X7, CV7, CV72, CV75); pesos originales .pth de MMPose referenciados |
| Resolucion de entrada | 3x256x192 |
| Dataset de referencia | COCO (17 keypoints) |
| Libreria | mmpose |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

RTMPose emplea un esquema top-down: un detector de personas (típicamente RTMDet u otro detector de la familia MMPose) localiza bounding boxes y, para cada recorte, el modelo estima los keypoints. El backbone es una CSPNeXt de tamaño medio y la cabeza de keypoints usa SimCC, que reformula la regresión de coordenadas como dos clasificaciones 1D (eje X y eje Y) sobre bins discretizados, lo que estabiliza el entrenamiento y mejora la precisión frente a la regresión directa de heatmaps.

El entrenamiento se realizó sobre COCO con el esquema de anotaciones AIC-COCO, con 420 épocas según el nombre del checkpoint original (`rtmpose-m_simcc-aic-coco_pt-aic-coco_420e-256x192`). El prefijo "pt" indica preentrenamiento previo sobre el conjunto AIC antes del ajuste fino en COCO. No se detalla en la model card el uso de RLHF/DPO (no aplica a este tipo de modelo) ni la composición exacta del dataset más allá de COCO y AIC.

La aportación de Ambarella no es arquitectónica sino de despliegue: los pesos se han convertido y optimizado para las NPU de sus chips, con dos variantes por dispositivo (optimización completa "Amba_optimized" y versión con activaciones en fp16), lo que permite elegir entre máxima aceleración o mayor fidelidad numérica.

## Capacidades

- Estimación de pose humana multi-persona en modo top-down (17 keypoints del esquema COCO).
- Detección de keypoints de cuerpo completo: nariz, ojos, orejas, hombros, codos, muñecas, caderas, rodillas y tobillos.
- Inferencia en tiempo real sobre hardware embebido Ambarella (N1-655, X7, CV7, CV72, CV75).
- Dos modos de precisión por dispositivo: pesos optimizados para NPU y variante con activaciones fp16.
- Integración con el ecosistema MMPose (configuraciones, pipelines de inferencia y visualización).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No incluye detección de personas integrada; requiere un detector previo para el pipeline top-down.

## Casos de uso

- Análisis deportivo en directo: estimación de la postura de atletas fotograma a fotograma para calcular ángulos articulares, zancada o técnica de tiro, aprovechando la latencia baja en NPU Ambarella.
- Interacción persona-ordenador sin contacto: seguimiento de gestos y postura corporal en kioscos o paneles interactivos embebidos con SoC CV7/CV72.
- Videovigilancia inteligente en cámara: detección de caídas, posturas anómalas o aglomeraciones procesando el vídeo en el propio dispositivo, sin enviar imágenes a la nube.
- Rehabilitación y fisioterapia: comparación de la pose del paciente con patrones de referencia para evaluar la ejecución de ejercicios en sesiones guiadas por cámara.
- Robótica y drones: estimación de la pose de operarios o personas en el entorno para planificación de movimiento y seguridad, ejecutada a bordo en el SoC.
- Análisis de ergonomía en entornos industriales: monitorización de posturas de trabajadores en líneas de producción para detectar riesgos posturales.
- Animación y captura de movimiento de bajo coste: extracción de esqueletos 2D a partir de vídeo convencional como paso previo a rigging o retargeting.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de AP (Average Precision) sobre COCO ni comparativas numéricas de latencia o throughput para los distintos SoC. El paper original de RTMPose (arXiv:2303.07399) contiene las métricas oficiales de la familia, pero no se reproducen aquí al no estar incluidas en la información proporcionada.

## Requisitos de hardware

- El modelo está empaquetado para NPU de Ambarella (N1-655, X7, CV7, CV72, CV75), no para GPU de propósito general en el formato distribuido en este repositorio.
- Para ejecutar los pesos originales de MMPose se requiere el entorno estándar de PyTorch/MMPose; la VRAM estimada para RTMPose-M a 256x192 es modesta (del orden de 1-2 GB en fp32), aunque este dato no se confirma en la model card.
- GPU recomendadas para la versión MMPose: cualquier GPU con soporte CUDA moderna (RTX 3060 en adelante) es suficiente; el modelo está pensado para tiempo real incluso en hardware modesto.
- Cabe en GPU de consumo; el cuello de botella en producción suele ser el detector de personas del pipeline top-down, no el estimador de keypoints.
- Opciones de despliegue: SDK Cooper 2.5.4 y Cooper Foundry 2.3 para los binarios Ambarella; MMPose/PyTorch para los pesos originales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RTMPose-M (esta ficha) | Top-down, SimCC | no disponible en la card (paper: ~13,6 M) | 256x192 | no disponible | Pesos Ambarella + original MMPose |
| RTMPose-S / RTMPose-L | Top-down, SimCC | no disponible | 256x192 | Apache-2.0 en MMPose (no confirmado aquí) | MMPose |
| YOLOv8-pose | Una etapa, keypoints | no disponible | 640x640 | AGPL-3.0 (Ultralytics) | Ultralytics |
| MediaPipe Pose | Una etapa, landmarks | no disponible | variable | Apache-2.0 | MediaPipe |

La comparación cuantitativa de precisión y latencia entre estas alternativas no está disponible en la información proporcionada; el paper de RTMPose incluye comparativas con YOLO-Pose y otros métodos, pero no se reproducen aquí.

## Limitaciones y advertencias

- La licencia no está declarada en la model card: no se puede asumir uso comercial sin verificar los términos del proyecto MMPose y de Ambarella.
- Los binarios están ligados a SoC concretos de Ambarella; no son portables a otras plataformas sin reconversión.
- El enfoque top-down depende de un detector de personas: fallos en la detección se propagan a la estimación de keypoints.
- Solo cubre el esquema de 17 keypoints de COCO; no incluye keypoints de manos, cara detallada ni cuerpo entero (whole-body).
- Rendimiento degradado en oclusiones severas, personas muy pequeñas en la imagen o posturas extremas fuera de la distribución de COCO.
- Sesgos potenciales heredados del dataset COCO en cuanto a diversidad de cuerpos, vestimenta y contextos.
- No es un modelo generativo: no hay riesgo de alucinación textual, pero sí de estimaciones erróneas de coordenadas en condiciones adversas.
- No disponible información sobre cuantización a int8 ni métricas de precisión tras la optimización Ambarella, lo que dificulta estimar la pérdida de exactitud frente al modelo original.
- El repositorio tiene un uso muy bajo (10 descargas, 0 likes) y fue creado recientemente; no hay validación comunitaria extensa.

## Enlaces

- [Hugging Face: Ambarella/RTMPose](https://huggingface.co/Ambarella/RTMPose)
- [Paper: RTMPose: Real-Time Multi-Person Pose Estimation Based on MMPose (arXiv:2303.07399)](https://arxiv.org/abs/2303.07399)
- [Repositorio oficial MMPose RTMPose](https://github.com/open-mmlab/mmpose/tree/main/projects/rtmpose)
- [Pesos originales rtmpose-m_simcc-aic-coco (OpenMMLab)](https://download.openmmlab.com/mmpose/v1/projects/rtmposev1/rtmpose-m_simcc-aic-coco_pt-aic-coco_420e-256x192-63eb25f7_20230126.pth)
- [Dataset COCO](https://cocodataset.org/#home)
