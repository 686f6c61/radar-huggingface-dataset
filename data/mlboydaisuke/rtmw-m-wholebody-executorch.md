# mlboydaisuke/RTMW-m-WholeBody-ExecuTorch

## Resumen

RTMW-m-WholeBody-ExecuTorch es una conversión del modelo RTMW-m de estimación de pose de cuerpo entero (133 keypoints) al formato ExecuTorch con backend XNNPACK, realizada por mlboydaisuke. El modelo original, desarrollado por OpenMMLab en el marco de mmpose, es un modelo top-down que detecta cuerpo, pies, cara y ambas manos en una sola pasada, y se distribuye aquí como un archivo `.pte` de 129,1 MB listo para inferencia en dispositivo.

La relevancia de esta conversión radica en que permite ejecutar un modelo de pose completa en hardware de borde con una latencia de 17 ms en CPU (Mac arm64), frente a los 178,9 ms de la ejecución eager, manteniendo una correlación de 1,0 con el modelo original. El formato ExecuTorch, junto con el backend XNNPACK, hace que el modelo sea desplegable en dispositivos móviles y embebidos sin necesidad de GPU, lo que lo convierte en una opción práctica para aplicaciones de tiempo real de estimación de pose.

El modelo espera un recorte de una persona de tamaño 256×192 normalizado con la media y desviación de ImageNet, y produce dos mapas SimCC de salida (bins x e y para cada keypoint) que permiten decodificar las coordenadas de los 133 keypoints. Es una alternativa de mayor cobertura que los modelos RTMPose de la misma familia, que cubren cada parte del cuerpo por separado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RTMW (backbone CSPNeXt + cuello CSPNeXtPAFPN + cabeza RTMWHead con decodificación SimCC) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de visión por computadora, entrada fija de 256×192 píxeles) |
| Tipos de cuantizacion | fp32 (XNNPACK). No se distribuyen fp16 ni int8 (ver limitaciones) |
| Idiomas soportados | no aplica (modelo de visión por computadora) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pte` (ExecuTorch) |

## Arquitectura y entrenamiento

RTMW es una arquitectura top-down de estimación de pose de cuerpo entero diseñada para equilibrio entre precisión y velocidad. El modelo original, descrito en el paper arXiv:2407.08634, utiliza un backbone CSPNeXt con un cuello CSPNeXtPAFPN que alimenta una cabeza RTMWHead con decodificación SimCC. La versión convertida aquí es la variante `m` destilada (el checkpoint `rtmw-dw-l-m_simcc-cocktail14_270e-256x192`), entrenada sobre el dataset cocktail14 con 270 épocas a resolución 256×192.

El entrenamiento del modelo original emplea una estrategia de destilación desde una versión más grande (l) hacia la más pequeña (m), lo que permite mantener una alta precisión con menor coste computacional. La conversión a ExecuTorch no modifica los pesos: se realiza mediante exportación con el script `export_rtmw.py` del repositorio executor-tools, que lee las configuraciones directamente de mmpose y verifica la coincidencia de pesos con `load_state_dict` estricto. El modelo exportado utiliza el backend XNNPACK para ejecución en CPU, sin cuantización.

## Capacidades

- Estimación de pose de cuerpo entero con 133 keypoints en una sola pasada: cuerpo (17), pies, cara y ambas manos (21 puntos por mano).
- Inferencia top-down: requiere un recorte previo de una persona, no procesa escenas completas.
- Ejecución en dispositivo (on-device) con formato ExecuTorch, compatible con runtime de ejecución en CPU mediante XNNPACK.
- Entrada fija de [1, 3, 256, 192] normalizada con ImageNet (media y desviación estándar).
- Salida de mapas SimCC de tamaño [1, 133, 384] y [1, 133, 512] para los bins x e y respectivamente, con ratio de división 2.0.
- Precisión numérica equivalente al modelo original en fp32: diferencia media de 0,001 px sobre 665 medidas en recortes reales de personas.

## Casos de uso

- **Seguimiento de movimiento en tiempo real**: el modelo puede procesar recortes de personas a 17 ms por frame en hardware de consumo, permitiendo aplicaciones de captura de movimiento para animación o análisis deportivo en directo.
- **Interacción por gestos en dispositivos**: al ejecutarse en el dispositivo, puede alimentar interfaces de usuario que detectan gestos de manos y posturas completas sin enviar datos a la nube, preservando la privacidad.
- **Rehabilitación y fisioterapia guiada**: los 133 keypoints permiten medir ángulos articulares de extremidades, tronco y mano, facilitando aplicaciones de seguimiento de ejercicios terapéuticos con feedback en tiempo real.
- **Realidad aumentada y virtual**: la detección de cara y manos en una sola pasada es adecuada para superponer avatares o efectos sobre el cuerpo del usuario en aplicaciones de AR en dispositivos móviles.
- **Robótica asistencial**: un robot puede usar el modelo para localizar la postura de una persona en una escena controlada (previa detección de caja) y adaptar su comportamiento en función de la posición de manos o cabeza.
- **Análisis de actividad en vídeo**: procesando recortes de personas extraídos por un detector (por ejemplo, YOLOX), el modelo puede alimentar sistemas de clasificación de acciones o detección de caídas en entornos de vigilancia con latencia reducida.

## Benchmarks y rendimiento

La información disponible sobre el modelo original y la conversión:

| Benchmark | RTMW-m (original) | RTMW-m ExecuTorch (fp32, XNNPACK) |
|---|---|---|
| COCO-Wholebody mAP | no disponible para la variante m | no disponible |
| RTMW-l (original) | 70.2 mAP (COCO-Wholebody) | — |
| Latencia (Mac arm64) | 178.9 ms (eager) | 17.0 ms |
| Correlación (entrada aleatoria) | — | 1.000000 |
| Diferencia media sobre 665 medidas | — | 0.001 px |
| Peor diferencia (sobre 665 medidas) | — | 0.5 px |

No se han publicado resultados de benchmarks para la variante `m` en la información disponible; el dato de 70.2 mAP corresponde a RTMW-l del paper original. La tabla de verificación muestra que la conversión fp32 es prácticamente exacta frente a la ejecución eager.

## Requisitos de hardware

- **VRAM estimada**: no aplica (ejecución en CPU mediante XNNPACK, no requiere GPU).
- **GPU recomendadas**: no aplica; el modelo está diseñado para ejecución en CPU de dispositivos con ExecuTorch.
- **Compatibilidad con GPU consumer**: no aplica, aunque el archivo `.pte` podría ejecutarse en GPU mediante backends alternativos (no incluidos en la distribución).
- **Opciones de despliegue**: ExecuTorch runtime, integrable en aplicaciones móviles (Android/iOS) o embebidas. Se puede usar con los scripts de conversión y verificación del repositorio `executor-tools`.
- **Latencia medida**: 17.0 ms por inferencia en Mac arm64 con XNNPACK fp32; en dispositivos de gama media la latencia puede variar según la capacidad de la CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/Entrada | Cobertura | Latencia (Mac arm64) | Licencia | Formato |
|---|---|---|---|---|---|---|
| **RTMW-m (ExecuTorch, este modelo)** | no disponible | 256×192 | 133 keypoints (cuerpo completo) | 17 ms | Apache-2.0 | .pte |
| **RTMPose-s-Body (ExecuTorch)** | no disponible | 256×192 | 17 keypoints (cuerpo) | 21.9 MB | Apache-2.0 | .pte |
| **RTMW-m (LiteRT)** | no disponible | 256×192 | 133 keypoints (cuerpo completo) | no disponible | Apache-2.0 | .tflite |
| **RTMW-l (original, mmpose)** | no disponible | 384×288 | 133 keypoints (cuerpo completo) | no disponible | Apache-2.0 | PyTorch |

La comparativa muestra que esta conversión es la única distribución ExecuTorch con cobertura de cuerpo entero en una sola pasada. RTMW-l es más preciso (70.2 mAP) pero más pesado y requiere más resolución; RTMPose-s cubre solo cuerpo y es más ligero (21.9 MB). La versión LiteRT ofrece el mismo modelo en formato TFLite para dispositivos con runtime de TensorFlow Lite.

## Limitaciones y advertencias

- **Modelo top-down**: requiere un detector de personas previo; no procesa escenas completas y el rendimiento depende de la calidad del recorte de entrada.
- **Entrada fija de 256×192**: no se admite cambio de resolución sin reentrenar o reexportar el modelo.
- **Solo se distribuye fp32**: la conversión fp16 no se incluye porque era más lenta (54,2 ms) y no reducía el tamaño; la int8 no exporta correctamente por un error en la cuantización de la atención de canal del CSPNeXt.
- **Precisión en puntos de baja confianza**: en la verificación fp16, 4 de 665 keypoints con picos de activación bajos se desplazaron hasta 123 px; en fp32 la precisión es exacta, pero los keypoints con baja activación son inherentemente inestables.
- **Requiere tensores contiguos**: la entrada debe ser contigua en memoria; si se construye con `np.transpose` o similar, el resultado puede ser incorrecto.
- **Uso comercial**: licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías; la responsabilidad de la integración en producto final es del desarrollador.
- **Sin soporte de escenas**: no se puede usar directamente para detección de personas en imágenes completas; es un componente de un pipeline mayor.

## Enlaces

- [HuggingFace - RTMW-m-WholeBody-ExecuTorch](https://huggingface.co/mlboydaisuke/RTMW-m-WholeBody-ExecuTorch)
- [Paper original RTMW (arXiv)](https://arxiv.org/abs/2407.08634)
- [Repositorio mmpose (OpenMMLab)](https://github.com/open-mmlab/mmpose)
- [Repositorio executor-tools (scripts de conversión)](https://github.com/john-rocky/executor-tools)
- [Versión LiteRT del mismo modelo](https://huggingface.co/litert-community/RTMW-m-WholeBody-LiteRT)
- [RTMPose-s-Body-ExecuTorch (modelo complementario)](https://huggingface.co/mlboydaisuke/RTMPose-s-Body-ExecuTorch)
- [YOLOX-s-ExecuTorch (detector recomendado)](https://huggingface.co/mlboydaisuke/YOLOX-s-ExecuTorch)
