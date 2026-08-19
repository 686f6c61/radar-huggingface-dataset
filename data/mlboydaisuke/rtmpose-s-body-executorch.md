# mlboydaisuke/RTMPose-s-Body-ExecuTorch

## Resumen

El modelo `mlboydaisuke/RTMPose-s-Body-ExecuTorch` es una conversión del detector de keypoints corporales RTMPose-s (variante "s" de la familia RTMPose de OpenMMLab) al formato ExecuTorch con delegación XNNPACK, diseñado para inferencia on-device en dispositivos con recursos limitados, como móviles, tablets y sistemas embebidos. El modelo original, `rtmpose-s_simcc-body7_pt-body7_420e-256x192`, fue entrenado por el equipo de MMPose para detectar 17 puntos anatómicos del cuerpo humano a partir de recortes de persona de 256x192 píxeles. Esta versión exportada mantiene una paridad numérica casi perfecta con el modelo eager de PyTorch (correlación 1.0, diferencia máxima del orden de 1e-5) y ofrece una latencia de referencia de 5,7 ms en un Mac con CPU arm64, frente a los 34,3 ms del modelo original sin optimizar.

La relevancia de este modelo radica en que permite integrar estimación de pose en tiempo real en aplicaciones móviles y de edge computing sin depender de GPU ni de conexión a la nube, preservando la privacidad de los datos. El archivo `.pte` generado ocupa solo 21,9 MB, lo que lo hace apto para entornos con memoria limitada. El autor también documenta por qué no se incluyen versiones cuantizadas a fp16 o int8: la degradación en la precisión de los keypoints es severa (mediana de 16 px en fp16 y 131 px en int8 sobre un recorte de 256x192), lo que desaconseja su uso sin un proceso de cuantización consciente (QAT).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RTMPose-s (backbone CSPNeXt + cabeza SimCC) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen 256x192) |
| Tipos de cuantizacion | fp32 (no se incluyen fp16 ni int8) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | ExecuTorch `.pte` (también disponible el modelo original en formato PyTorch de MMPose) |

## Arquitectura y entrenamiento

El modelo original, RTMPose-s, pertenece a la familia RTMPose de OpenMMLab, diseñada para estimación de pose en tiempo real. Su arquitectura combina un backbone CSPNeXt (una variante de CSPNet con atención de canal) y una cabeza de regresión basada en SimCC, que trata la localización de cada keypoint como una distribución de probabilidad unidimensional por eje (x e y). El entrenamiento se realizó sobre el conjunto de datos body7 (que incluye COCO y otros datasets de cuerpo completo) durante 420 épocas, con una resolución de entrada de 256x192. No se emplearon técnicas de RLHF ni DPO, al ser un modelo de visión supervisado.

La conversión a ExecuTorch se llevó a cabo mediante `torch.export`, seguido de `to_edge_transform_and_lower` con el `XnnpackPartitioner`. El proceso logra delegar el 92% de las operaciones (229 de 249) al backend XNNPACK, dejando solo unas pocas operaciones en kernels portables (como `_to_dim_order_copy`, `unsqueeze_copy`, `split_with_sizes_copy`, `sum.dim_IntList`, `pow.Tensor_Scalar` y `squeeze_copy`). El resultado es un único archivo `.pte` que acepta y devuelve tensores fp32, lo que simplifica la integración en aplicaciones.

## Capacidades

- Detección de 17 keypoints corporales (nariz, ojos, orejas, hombros, codos, muñecas, caderas, rodillas y tobillos) sobre un recorte de persona.
- Salida en formato SimCC: dos tensores de distribución de probabilidad por eje (x: [1,17,384], y: [1,17,512]). La decodificación se realiza obteniendo el `argmax` de cada distribución y dividiendo por 2 para obtener coordenadas en píxeles del recorte; el valor máximo de la distribución sirve como confianza.
- Inferencia on-device de baja latencia: 5,7 ms de mediana en CPU arm64 (referencia en Mac), frente a 34,3 ms del modelo eager.
- Paridad numérica casi exacta con el modelo original (correlación 1.0 y diferencias máximas del orden de 1e-5).
- Compatible con el runtime de ExecuTorch, que soporta despliegue en Android, iOS y sistemas embebidos.
- No incluye capacidades de lenguaje, tool calling, visión general ni generación de texto; es un modelo puramente de estimación de pose.

## Casos de uso

- Seguimiento de ejercicios y fitness: una aplicación móvil puede analizar la postura del usuario en tiempo real, contando repeticiones y detectando errores de forma. La baja latencia permite retroalimentación inmediata durante la sesión.
- Realidad aumentada: superposición de avatares o efectos sobre el cuerpo humano en aplicaciones de entretenimiento o videollamadas. Los 17 keypoints permiten animar un esqueleto virtual con precisión.
- Análisis deportivo: seguimiento de la biomecánica de un atleta durante entrenamientos o competiciones, capturando el movimiento con una cámara estándar y procesando en el dispositivo.
- Interacción humano-computadora: control de interfaces mediante gestos corporales, por ejemplo, en quioscos interactivos o sistemas de asistencia en el hogar.
- Salud y telemedicina: detección de caídas en personas mayores o evaluación de la movilidad articular mediante ejercicios guiados, todo procesado localmente para proteger la privacidad.
- Robótica y automatización: guiado por visión para robots colaborativos que necesitan localizar la posición de un operario humano en su entorno de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) porque este modelo no es de lenguaje. En su lugar, la model card proporciona datos de verificación de paridad y latencia, que se resumen a continuación:

| Métrica | Valor |
|---|---|
| Diferencia máxima absoluta (tensor x, shape [1,17,384]) | 6,855e-06 |
| Diferencia máxima absoluta (tensor y, shape [1,17,512]) | 8,076e-06 |
| Correlación (ambos tensores) | 1,000000 |
| Cobertura del delegado XNNPACK | 92,0% (229/249 ops) |
| Latencia mediana en Mac arm64 (fp32, 10 ejecuciones) | 5,7 ms |
| Latencia del modelo eager fp32 en la misma máquina | 34,3 ms |

Estos valores confirman que la conversión no introduce pérdida práctica de precisión y que la aceleración por XNNPACK es significativa. No se dispone de comparativas con otros modelos de pose en la información proporcionada.

## Requisitos de hardware

- Inferencia en CPU, sin necesidad de GPU. El modelo está optimizado para arquitecturas arm64 y x86-64 mediante el backend XNNPACK.
- Tamaño del archivo: 21,9 MB, por lo que cabe en cualquier dispositivo con almacenamiento mínimo y puede cargarse en memoria RAM de menos de 100 MB.
- VRAM: no aplica, al ejecutarse en CPU. En dispositivos con GPU, ExecuTorch puede aprovecharla, pero no es un requisito.
- GPU recomendadas: no se requieren; se puede ejecutar en Raspberry Pi, teléfonos Android de gama media, iPhones y similares.
- Opciones de despliegue: runtime de ExecuTorch (C++), integrable en aplicaciones Android (via JNI), iOS (via Objective-C/Swift) o en sistemas embebidos con Linux. También se puede usar con el ejecutable `executor_runner` de ExecuTorch.
- Latencia y throughput: la referencia de 5,7 ms en Mac arm64 sugiere que en un smartphone moderno se puede alcanzar una tasa de 30-60 FPS si se combina con un detector de personas eficiente.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. Sin embargo, se puede contextualizar:

| Modelo | Formato | Tamaño | Latencia (CPU) | Precisión | Licencia |
|---|---|---|---|---|---|
| RTMPose-s (este modelo) | ExecuTorch .pte | 21,9 MB | 5,7 ms (Mac arm64) | Alta (paridad con eager) | Apache-2.0 |
| RTMPose-s original (MMPose) | PyTorch | ~22 MB (fp32) | 34,3 ms (eager) | Alta | Apache-2.0 |
| MoveNet (TensorFlow) | TFLite | ~12 MB (int8) | ~5-10 ms (móvil) | Media | Apache-2.0 |
| BlazePose (MediaPipe) | TFLite | ~3-6 MB | ~5 ms (móvil) | Media | Apache-2.0 |

Nota: los datos de MoveNet y BlazePose son aproximados y provienen de conocimiento general, no de la información de este modelo. La comparación exacta requeriría benchmarks en el mismo hardware y con el mismo dataset.

## Limitaciones y advertencias

- Solo se proporciona la variante fp32; las cuantizaciones a fp16 e int8 degradan severamente la precisión (mediana de 16 px y 131 px respectivamente en un recorte de 256x192). Para usar int8 sería necesario aplicar QAT, no una simple calibración.
- El modelo espera un recorte de persona ya detectado y redimensionado a 256x192. No realiza detección de personas; se necesita un detector previo (por ejemplo, un modelo de detección de objetos) para obtener el recorte.
- No soporta múltiples personas directamente; cada persona debe procesarse por separado.
- La precisión puede verse afectada por oclusiones, posturas inusuales o iluminación pobre, como es común en los modelos de pose.
- La licencia Apache-2.0 permite uso comercial, pero requiere atribución y no ofrece garantías implícitas. El autor no proporciona soporte oficial.
- El repositorio tiene 0 descargas y 0 likes en HuggingFace, lo que indica que es un modelo de nicho con poca validación comunitaria.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/mlboydaisuke/RTMPose-s-Body-ExecuTorch
- Repositorio de MMPose (OpenMMLab): https://github.com/open-mmlab/mmpose
- Proyecto RTMPose dentro de MMPose: https://github.com/open-mmlab/mmpose/tree/main/projects/rtmpose
- Repositorio de ExecuTorch (PyTorch): https://github.com/pytorch/executorch
- Scripts de conversión utilizados: https://github.com/john-rocky/executorch-models
