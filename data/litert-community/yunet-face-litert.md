# litert-community/YuNet-Face-LiteRT

## Resumen

YuNet-Face-LiteRT es una conversión del detector de rostros YuNet (ShiqiYu/libfacedetection) al formato LiteRT, el sucesor de TensorFlow Lite desarrollado por Google para inferencia en dispositivos móviles. El modelo está optimizado para ejecutarse completamente en la GPU mediante el acelerador `CompiledModel` de LiteRT, logrando una latencia de aproximadamente 4 ms en un Pixel 8a con una precisión numérica casi idéntica a la versión PyTorch original (correlación 0.9999 en las 12 salidas). Con solo 0.076 millones de parámetros y un tamaño de 0.3 MB en fp16, es uno de los detectores de caras más pequeños y rápidos disponibles para despliegue on-device.

El modelo detecta caras y devuelve 5 puntos de referencia faciales (landmarks) por cada detección, utilizando una arquitectura CNN pura con convoluciones depthwise-separable y un cuello de upsampling por vecino más próximo. Está pensado para aplicaciones Android y otros entornos LiteRT, con soporte para aceleración por GPU y NPU. Su licencia BSD-3-Clause permite uso comercial sin restricciones significativas, lo que lo hace atractivo para integración en productos.

La relevancia actual radica en la creciente demanda de modelos de visión compactos y eficientes para edge computing, donde el tamaño y la latencia son críticos. YuNet-Face-LiteRT ofrece un equilibrio excelente entre precisión, velocidad y huella de memoria, siendo adecuado para aplicaciones en tiempo real como autenticación biométrica, realidad aumentada o análisis de vídeo en streaming.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN pura (depthwise-separable ConvDPUnit, neck con nearest-upsample, MaxPool2d sin padding) |
| Parametros totales | 0.076 M (76 000) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | fp16 (0.3 MB) |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | BSD-3-Clause |
| Formato de pesos | TFLite / LiteRT (.tflite) |

## Arquitectura y entrenamiento

YuNet-Face-LiteRT es una conversión directa del detector YuNet original, sin reescritura de la arquitectura. La red es una CNN pura compuesta por unidades `ConvDPUnit` (convoluciones depthwise-separable), un cuello de upsampling mediante `F.interpolate(mode="nearest")` que se traduce a `RESIZE_NEAREST_NEIGHBOR` (evitando convoluciones transpuestas), y capas `MaxPool2d` sin padding. La cabeza de detección integra operaciones de `permute/reshape/sigmoid` por cada stride (8, 16, 32), produciendo 12 salidas listas para decodificar: clases, objetividad, cajas y landmarks.

El modelo es anchor-free: las prioridades se calculan como `px=col·s, py=row·s` con offset 0, y la decodificación se realiza en el host (fuera del grafo). El preprocesamiento requiere letterbox a 640×640, formato BGR con valores 0-255 y sin normalización. La conversión a LiteRT se realizó con `litert-torch`, manteniendo una correlación tflite-vs-torch de 1.0 y device-vs-torch de 0.9999 en las 12 salidas.

No se dispone de información detallada sobre el entrenamiento del modelo original (dataset, número de tokens, técnicas de RLHF/DPO) en la documentación proporcionada. El modelo base es ShiqiYu/libfacedetection, cuyo entrenamiento se describe en el paper "YuNet: A Tiny Millisecond-level Face Detector" (enlace en la sección de enlaces).

## Capacidades

- Detección de rostros en imágenes y vídeo, devolviendo cajas delimitadoras y 5 landmarks faciales (ojos, nariz, comisuras de boca).
- Inferencia completamente en GPU mediante LiteRT `CompiledModel` (acelerador `LITERT_CL`), con 146/146 nodos residentes en GPU.
- Soporte para aceleración por NPU (Hexagon) en dispositivos Snapdragon, con latencia inferior a la GPU (1.85 ms frente a 3.31 ms en Galaxy S26).
- Precisión numérica casi idéntica a la versión PyTorch original (correlación 0.9999 en todas las salidas).
- Anchor-free, sin necesidad de anclas predefinidas; decodificación sencilla en el host.
- Tamaño extremadamente reducido (0.3 MB fp16), ideal para aplicaciones con restricciones de memoria.
- No requiere normalización de entrada (BGR 0-255), simplificando el pipeline de preprocesamiento.
- Compatible con el ecosistema LiteRT (sucesor de TensorFlow Lite), incluyendo Android, iOS y otras plataformas edge.

## Casos de uso

- Autenticación biométrica en dispositivos móviles: el modelo puede detectar el rostro y sus landmarks en tiempo real para desbloqueo facial o verificación de identidad, gracias a su latencia de ~4 ms y su pequeño tamaño que no impacta en la batería.
- Realidad aumentada (AR): los 5 landmarks permiten anclar filtros o efectos 3D sobre el rostro con precisión, funcionando a 60 fps en GPUs móviles modernas.
- Análisis de vídeo en streaming: integración en pipelines de procesamiento de vídeo para contar personas, detectar caras en multitudes o monitorizar presencia, con consumo mínimo de recursos.
- Aplicaciones de accesibilidad: detección de rostros para control por gestos o seguimiento de mirada en dispositivos de asistencia, aprovechando la baja latencia y el soporte NPU.
- Fotografía y edición automática: detección de caras para enfoque automático, corrección de ojos rojos o mejora de retratos en cámaras de smartphone, ejecutándose en segundo plano sin afectar la experiencia del usuario.
- Vigilancia y seguridad en edge: despliegue en cámaras IP o dispositivos IoT con GPU integrada para detección de intrusos o análisis de presencia, sin necesidad de conexión a la nube.
- Pruebas de concepto y prototipado: al ser un modelo de 0.3 MB, es fácil de integrar en demos o aplicaciones de ejemplo para validar flujos de detección facial antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (mAP, WIDER FACE, etc.) en la informacion disponible. Sin embargo, la model card incluye mediciones de latencia y rendimiento en dispositivos reales:

| Runtime | Backend | Grafo en GPU | Latencia |
|---|---|---|---|
| LiteRT `CompiledModel` (`LITERT_CL`) | GPU | 146 / 146 | ~4 ms (Pixel 8a) |
| TFLite `benchmark_model` (`TfLiteGpuDelegateV2`) | GPU (OpenCL) | 146 / 146 | 21.1 ms (Pixel 8a) |
| TFLite `benchmark_model` | CPU (XNNPACK) | — | XNNPACK declina el grafo |
| LiteRT `CompiledModel` 2.2.0 | NPU (Hexagon v81) | — | 1.85 ms (Galaxy S26) |
| LiteRT `CompiledModel` 2.2.0 | GPU (Adreno) | — | 3.31 ms (Galaxy S26) |

Nota: la fila de NPU/GPU en Galaxy S26 corresponde a mediciones con 5 warm-up y N=50 runs. La fila de CPU no es representativa porque XNNPACK rechaza el grafo fp16 y el fallback a kernels de referencia es ~20× más lento que la GPU.

## Requisitos de hardware

- VRAM estimada: no aplica (modelo on-device, 0.3 MB en fp16; la memoria de GPU móvil es compartida con el sistema).
- GPU recomendadas: cualquier GPU móvil compatible con OpenCL o Vulkan (Adreno, Mali, Tensor G3). Verificado en Pixel 8a (Tensor G3) y Galaxy S26 (Adreno).
- NPU: compatible con Hexagon v81 (Snapdragon 8 Elite Gen 5) mediante LiteRT `CompiledModel`; se recomienda para máxima eficiencia energética.
- Cabe en cualquier smartphone Android moderno con soporte LiteRT; no requiere GPU dedicada.
- Opciones de despliegue: LiteRT `CompiledModel` (recomendado), TFLite `benchmark_model` con `TfLiteGpuDelegateV2` (más lento), o inferencia en CPU con kernels de referencia (no recomendado por rendimiento).
- Latencia: ~4 ms en GPU (Pixel 8a), ~1.85 ms en NPU (Galaxy S26); throughput suficiente para procesamiento en tiempo real (más de 200 fps teóricos).

## Comparativa con modelos similares

No se dispone de datos comparativos cuantitativos en la informacion proporcionada. Como referencia cualitativa, se pueden considerar alternativas en la misma categoría (detección facial on-device):

| Modelo | Parametros | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YuNet-Face-LiteRT | 0.076 M | 0.3 MB fp16 | No aplica | BSD-3-Clause | LiteRT (TFLite) |
| BlazeFace (Google) | ~0.5 M (estimado) | ~1 MB (fp32) | No aplica | Apache-2.0 | TFLite, MediaPipe |
| RetinaFace (versión móvil) | ~1 M (estimado) | ~4 MB (fp32) | No aplica | MIT | TFLite, ONNX |

Nota: los datos de BlazeFace y RetinaFace son estimaciones basadas en conocimiento general, no en la informacion proporcionada. YuNet destaca por su tamaño extremadamente reducido y su soporte nativo para GPU/NPU en LiteRT.

## Limitaciones y advertencias

- Solo detección de rostros y landmarks; no realiza reconocimiento facial ni identificación de personas.
- La decodificación de las salidas (NMS, cálculo de cajas) debe implementarse en el host; el modelo no incluye postprocesamiento integrado.
- No hay soporte CPU eficiente: XNNPACK rechaza el grafo fp16 y el fallback a kernels de referencia es ~20× más lento que la GPU. Para despliegue en CPU se necesitaría una versión cuantizada a int8 (no proporcionada).
- El preprocesamiento requiere letterbox a 640×640 y formato BGR sin normalización; cualquier desviación puede afectar la precisión.
- La precisión numérica es muy alta (correlación 0.9999 con PyTorch), pero no se han publicado métricas de detección (mAP, WIDER FACE) en la documentación.
- La latencia reportada depende del dispositivo y del runtime; los valores de 4 ms y 1.85 ms corresponden a hardware específico (Pixel 8a y Galaxy S26) y pueden variar en otros dispositivos.
- Licencia BSD-3-Clause permite uso comercial, pero se debe mantener el aviso de copyright en redistribuciones.
- No se especifican limitaciones de sesgo o alucinación (no aplica a un modelo de visión), pero la detección puede fallar en condiciones de iluminación extrema, oclusiones o rostros muy pequeños.

## Enlaces

- HuggingFace: https://huggingface.co/litert-community/YuNet-Face-LiteRT
- Repositorio del modelo base (libfacedetection): https://github.com/ShiqiYu/libfacedetection
- LiteRT (sucesor de TensorFlow Lite): https://github.com/google-ai-edge/litert
- Paper de YuNet: https://www.researchgate.net/publication/370122920_YuNet_A_Tiny_Millisecond-level_Face_Detector
- Documentación de medición de rendimiento LiteRT: https://ai.google.dev/edge/litert/models/measurement
