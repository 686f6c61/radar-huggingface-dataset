# OpenGraphLabs/hand21-rtmpose-m-256

## Resumen

hand21-rtmpose-m-256 es un modelo de estimación de pose de manos desarrollado por OpenGraph Labs. Se trata de un RTMPose-M en configuración top-down: recibe una imagen junto con una caja delimitadora de la mano detectada previamente y devuelve 21 keypoints siguiendo el orden de articulaciones de MediaPipe (muñeca, pulgar, índice, corazón, anular y meñique, de base a punta). El modelo forma parte del pipeline interno de OpenGraph Labs para el NVIDIA V2D Challenge Track 3, donde se ejecuta después del detector de manos sin guantes.

La arquitectura combina un backbone CSPNeXt-P5 (con factores de profundización 0,67 y ensanchamiento 0,75) con una cabeza RTMCCHead configurada para 21 keypoints, usando el codec SimCCLabel sobre entradas de 256 x 256 píxeles. Es un modelo compacto (fichero de pesos de aproximadamente 55 MB) orientado a inferencia en tiempo real, no un modelo generativo: no procesa lenguaje ni produce texto.

Su relevancia radica en que ofrece un punto de partida reproducible para tareas de pose de manos en primera persona (egocéntricas), con pesos publicados bajo licencia Apache-2.0 y métricas declaradas sobre un conjunto de validación interno. No obstante, el dataset de entrenamiento no se ha liberado, lo que limita la reproducibilidad completa del entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MMPose `TopdownPoseEstimator`: backbone CSPNeXt-P5 (deepen 0.67, widen 0.75) + `RTMCCHead` (GAU 256, s 128) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pth` (PyTorch `state_dict` + `meta.dataset_meta`), fichero `rtmpose_m_hand21_256.pth` de 55.334.196 bytes |
| Codec | `SimCCLabel`, entrada 256 x 256, sigma 5.66, split ratio 2.0 |
| Keypoints de salida | 21 (orden MediaPipe), puntuaciones recortadas a [0, 1] |
| Preprocesado | Expansión de la caja del 25 % por lado, `GetBBoxCenterScale` (padding 1.25), `TopdownAffine` a 256 x 256, media (123.675, 116.28, 103.53), std (58.395, 57.12, 57.375), BGR a RGB, flip test activado |
| Runtime de referencia | mmpose 1.3.2, mmdet 3.2.0, mmcv 2.1.0, torch 2.1.2 |
| Tamaño del repositorio | 0.1 GB |

## Arquitectura y entrenamiento

El modelo sigue el paradigma top-down de MMPose: un detector externo localiza la mano y el estimador de pose refina los keypoints dentro de la región recortada. El backbone CSPNeXt-P5 extrae características con una profundidad y anchura reducidas (0,67 y 0,75 respectivamente), lo que sitúa al modelo en la variante M de la familia RTMPose. La cabeza RTMCCHead emplea atención con compuerta (GAU) y una representación SimCC con resolución de 256 y factor de escala 128, decodificando las coordenadas como clasificación 1D sobre los ejes x e y en lugar de mapas de calor. El entrenamiento se realizó sobre un dataset interno de keypoints de manos de OpenGraph Labs que no se ha publicado. No se especifican el número de tokens, la composición del dataset ni si se aplicaron técnicas de refinamiento posteriores como RLHF o DPO (no aplicables en este dominio). Los pesos publicados son una exportación solo de pesos del checkpoint de entrenamiento que generó la submission al reto: conservan `state_dict` y `meta.dataset_meta` de forma idéntica bit a bit al original, mientras que los metadatos de la ejecución de entrenamiento, los logs y la copia EMA se eliminaron. El SHA-256 del fichero es `9fcb071d40ae2bd6ec53d99ddbbf2d43e7f2b79e03921d84dcbe99c295fcf91e` y el del checkpoint original, `76df865f48119d3a5a88cbf9ac3a54d2e64d865fc453fa4bc6b2a68e3535c9ab`.

## Capacidades

- Detección de 21 keypoints de la mano en orden MediaPipe: muñeca y cinco dedos con articulaciones de base a punta.
- Estimación de pose top-down a partir de una caja delimitadora de mano proporcionada por un detector externo.
- Salida de puntuaciones de confianza por keypoint, recortadas al intervalo [0, 1].
- Funcionamiento sobre imágenes RGB con normalización específica y flip test activado para mayor robustez.
- Orientado a escenas egocéntricas (primera persona), según la etiqueta `egocentric` del repositorio.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües, de visión general, audio ni modo de pensamiento.

## Casos de uso

- Análisis de vídeo en primera persona: el modelo se aplica tras un detector de manos para extraer la pose de las manos del usuario en grabaciones egocéntricas, un escenario habitual en investigación de interacción y wearables.
- Reconocimiento de gestos: los 21 keypoints con puntuaciones permiten clasificar gestos estáticos o dinámicos (puño, palma abierta, pinza) en interfaces de control sin contacto.
- Teleoperación y robótica: la pose de la mano puede mapearse a un efector final o a una mano robótica, aprovechando la inferencia ligera del modelo para bucles de control en tiempo real.
- Evaluación de destreza manual: en estudios de rehabilitación o ergonomía, el modelo cuantifica la posición de las articulaciones a partir de cajas detectadas, con métricas como NME o error de punto final.
- Preprocesado para modelos de generación 3D: los keypoints 2D sirven como entrada a pipelines de reconstrucción de mano o de avatares, donde la cabeza RTMCC proporciona coordenadas precisas por articulación.
- Integración en pipelines de visión existentes: al ser compatible con MMPose 1.3.2, puede insertarse en sistemas que ya usan mmdet/mmcv para detección de manos y otras tareas de pose, reutilizando el mismo runtime.
- Benchmarking de detectores de mano: al medir el rendimiento de extremo a extremo desde las cajas del detector, permite comparar la calidad del front-end de detección con una pose fija como referencia.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre su conjunto de validación interno, medidos de extremo a extremo a partir de las cajas del detector:

| Métrica | Valor |
|---|---|
| PCK@0.1 | 0.916 |
| NME | 0.052 |
| Error mediano de punto final | 9.4 px |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero de pesos ocupa aproximadamente 55 MB, por lo que la huella en memoria es reducida y compatible con GPUs de gama baja.
- GPUs recomendadas: no especificadas por el autor. Por el tamaño y la entrada de 256 x 256, es viable en GPUs consumer (por ejemplo, RTX 3060 o superiores) y en GPUs de datacenter (A100, H100) sin problema de capacidad.
- Compatibilidad con GPU consumer: sí, previsiblemente en cualquier GPU con al menos unos pocos GB de VRAM; el dato exacto no está publicado.
- Opciones de despliegue: MMPose 1.3.2 con mmdet 3.2.0, mmcv 2.1.0 y torch 2.1.2, usando `init_model` de MMPose; el autor remite a `og_v2d.hands.front_end` del repositorio og-v2d-track3, que incluye la configuración MMPose correspondiente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas con otros estimadores de pose de manos en la información proporcionada. Como referencia cualitativa, la familia RTMPose de MMPose incluye variantes S, M y L con distintos compromisos de precisión y coste computacional, pero no se han facilitado cifras comparativas para esta exportación concreta. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El dataset de entrenamiento es interno y no se ha liberado, lo que impide reproducir el entrenamiento y auditar la composición de los datos.
- Solo se publican métricas sobre un conjunto de validación interno del autor; no hay evaluación en benchmarks públicos independientes.
- El modelo es top-down: depende de la calidad de la caja del detector de manos. Cajas mal ajustadas degradan la precisión de los keypoints.
- Está especializado en manos y escenas egocéntricas; su comportamiento en otros dominios (manos ocluidas, guantes, iluminación extrema) no está documentado.
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural ni tool calling.
- La exportación elimina metadatos de entrenamiento, logs y la copia EMA; solo conserva `state_dict` y `meta.dataset_meta`.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene conservar los avisos de licencia y verificar las dependencias de MMPose, mmdet y mmcv, que tienen sus propias licencias.
- No se han documentado sesgos demográficos ni de otro tipo; la ausencia de información no implica ausencia de sesgo.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de predicciones erróneas con alta confianza en keypoints ocluidos.

## Enlaces

- Hugging Face: https://huggingface.co/OpenGraphLabs/hand21-rtmpose-m-256
- Repositorio del pipeline de referencia: og-v2d-track3 (módulo `og_v2d.hands.front_end`), mencionado en la model card
- MMPose: https://github.com/open-mmlab/mmpose
- MMPose 1.3.2 (documentación de la versión usada): https://github.com/open-mmlab/mmpose/releases
- NVIDIA V2D Challenge Track 3: no disponible como enlace en la información proporcionada
