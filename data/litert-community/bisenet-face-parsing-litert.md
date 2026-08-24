# litert-community/BiSeNet-Face-Parsing-LiteRT

## Resumen

BiSeNet-Face-Parsing-LiteRT es un modelo de segmentación facial (face parsing) en tiempo real diseñado para ejecutarse íntegramente en dispositivos móviles mediante LiteRT, el sucesor de TFLite. Lo publica la comunidad litert-community y convierte el modelo BiSeNet original de zllrunning/face-parsing.PyTorch a un grafo compatible con el delegado GPU de LiteRT, sin caída a CPU. El modelo segmenta un rostro en las 19 clases de CelebAMask-HQ (piel, cejas, ojos, nariz, labios, orejas, pelo, gafas, cuello, ropa, etc.), lo que lo hace idóneo para aplicaciones de realidad aumentada, belleza y maquillaje virtual.

La arquitectura es una CNN pura con backbone ResNet18, unos 13,3 millones de parámetros y un tamaño de 53 MB. La conversión requirió tres parches de re-autoría del grafo para lograr compatibilidad total con el delegado GPU: cambiar `align_corners` de `True` a `False`, sustituir el pooling global por una reducción `mean([2,3])` y añadir zero-padding explícito en el maxpool de la etapa ResNet. El resultado es un grafo con 74 de 74 nodos en GPU, una sola partición y una correlación de 0,99999 frente a PyTorch. En un Pixel 8a se alcanzan ~22 ms por fotograma con LiteRT y en un Snapdragon 8 Elite Gen 5 se baja a ~7,88 ms usando la NPU Hexagon.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiSeNet (ResNet18 backbone + context path + feature-fusion) |
| Parametros totales | ~13,3 millones |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión) |
| Tipos de cuantizacion | fp16 (no requiere int8 para NPU) |
| Idiomas soportados | no aplicable |
| Licencia | MIT |
| Formato de pesos | LiteRT (TFLite), 53 MB |

## Arquitectura y entrenamiento

BiSeNet (Bilateral Segmentation Network) es una red convolucional pura diseñada para segmentación semántica en tiempo real. Se compone de un path espacial que conserva detalles de baja resolución y un path de contexto que captura información global mediante pooling y atención, fusionándose en una etapa final. El backbone es ResNet18 y la salida son logits de 19 canales a resolución 512×512. Los pesos provienen del repositorio zilliz/face-parsing.PyTorch, entrenados con el dataset CelebAMask-HQ, y se convirtieron con la herramienta `litert-torch` aplicando los tres parches de compatibilidad GPU. No se ha publicado información sobre el número exacto de tokens de entrenamiento ni sobre el uso de RLHF o DPO, al ser un modelo de visión supervisada clásica.

## Capacidades

- Segmentación facial píxel a píxel en 19 clases: fondo, piel, cejas, ojos, gafas, orejas, pendientes, nariz, boca, labios, cuello, collar, ropa, pelo y sombrero.
- Ejecución en tiempo real en dispositivos móviles: ~22 ms en GPU (Pixel 8a) y ~7,88 ms en NPU Hexagon (Samsung Galaxy S26 con Snapdragon 8 Elite Gen 5).
- Inferencia totalmente en GPU sin caída a CPU: 74 de 74 nodos en el delegado, 1 partición.
- Soporte de ejecución en NPU Qualcomm Hexagon sin conversión previa, compilando el modelo en el dispositivo.
- Precisión alta frente a PyTorch: correlación de 0,99999 y coincidencia de argmax del 99,96 %.
- Entrada RGB normalizada con media y desviación de ImageNet; salida de logits por píxel sobre 19 clases.

## Casos de uso

- Realidad aumentada y filtros faciales: el modelo puede superponer máscaras, maquillaje o accesorios sobre el rostro en tiempo real, con latencias de ~22 ms en GPU móvil y ~8 ms en NPU, lo que permite una experiencia fluida en videollamadas o streaming.
- Maquillaje virtual y belleza: segmenta labios, ojos, cejas y piel para aplicar color o retoques de forma precisa, sin necesidad de marcadores manuales.
- Análisis de expresiones faciales: al aislar componentes como ojos, cejas y boca, sirve como entrada para sistemas de detección de emociones o animación de avatares.
- Detección de accesorios: identifica gafas, pendientes, sombreros y collares, útil en aplicaciones de moda o comercio electrónico para probar productos virtualmente.
- Salud y dermatología: la segmentación de piel y lesiones visibles puede ayudar en herramientas de análisis de la piel, aunque con las limitaciones de un modelo entrenado en CelebAM-HQ.
- Integración en apps Android/iOS: el formato LiteRT permite desplegar el modelo en producción móvil con la API `CompiledModel` de LiteRT, con opción de aceleración GPU o NPU según el hardware disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks tipo MMLU o HumanEval porque el modelo es de visión, no de lenguaje. El rendimiento se mide en latencia de inferencia sobre un Pixel 8a (Tensor G3, Android 16) y un Samsung Galaxy S26 (Snapdragon 8 Elite Gen 5, Hexagon v81):

| Runtime | Backend | Grafo en GPU | Latencia media |
|---|---|---|---|
| LiteRT `CompiledModel` (LITERT_CL) | GPU | 74 / 74 | ~22 ms |
| TFLite `benchmark_model` (TfLiteGpuDelegateV2) | GPU (OpenCL) | 74 / 74 | 52,9 ms |
| TFLite `benchmark_model` | CPU (XNNPACK, 4 hilos) | — | 229,4 ms |
| LiteRT `CompiledModel` (NPU, primera carga) | Hexagon NPU | — | 7,89 ms (mediana) |
| LiteRT `CompiledModel` (NPU, en caché) | Hexagon NPU | — | 7,88 ms (mediana) |
| LiteRT `CompiledModel` (GPU, en caché) | Adreno | — | 26,02 ms (mediana) |

La fila NPU es 3,3 veces más rápida que la GPU en el mismo dispositivo (7,88 ms frente a 26,02 ms) y la carga inicial en NPU es 7 veces menor (116 ms frente a 816 ms) porque la GPU reconstruye los shaders en cada arranque. No se han publicado resultados de precisión sobre conjuntos de datos de segmentación más allá de la correlación frente a PyTorch.

## Requisitos de hardware

- GPU móvil compatible con OpenCL (Adreno, Mali, etc.) para ejecutar el delegado GPU de LiteRT; se recomienda al menos un SoC de gama media-alta para alcanzar latencias de ~22 ms.
- NPU Qualcomm Hexagon (v81 o superior) para el mejor rendimiento: ~7,88 ms de inferencia y 116 ms de carga en caché.
- CPU XNNPACK con 4 hilos: 229 ms por frame, viable solo para uso de baja frecuencia o depuración.
- El modelo pesa 53 MB y requiere memoria RAM suficiente para la entrada y salida de 512×512×3 y 512×512×19 en float32 (aproximadamente 3 MB de entrada y 20 MB de salida).
- Despliegue mediante LiteRT (`CompiledModel` con acelerador GPU o NPU) o TFLite clásico (`TfLiteGpuDelegateV2`); para NPU se necesitan las librerías `libLiteRtDispatch_Qualcomm.so` y `libLiteRtCompilerPlugin_Qualcomm.so` del SDK de Qualcomm, no distribuidas en el repositorio.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| BiSeNet-Face-Parsing-LiteRT | BiSeNet (ResNet18) | ~13,3 M | 512×512 | 22 ms GPU, 7,88 ms NPU | MIT |
| BiSeNet (zllrunning/face-parsing.PyTorch) | BiSeNet (ResNet18) | ~13,3 M | 512×512 | no disponible (CPU/PyTorch) | MIT |
| Yakhyo/face-parsing (BiSeNet) | BiSeNet (ResNet18) | ~13,3 M | 512×512 | no disponible | MIT |

Los tres comparten la misma arquitectura y pesos base; la diferencia de LiteRT es la conversión a formato TFLite con los parches de compatibilidad GPU y la medición de latencia en dispositivos móviles. No se dispone de datos de otros modelos de segmentación facial comparable en formato móvil.

## Limitaciones y advertencias

- El modelo está entrenado con CelebAMask-HQ, un dataset con predominancia de rostros de celebridades; puede presentar sesgos de edad, tono de piel, etnia y condiciones de iluminación que limiten su generalización en producción.
- La salida es un mapa de clases de 19 etiquetas; no distingue entre individuos ni detecta rostros múltiples (se espera una entrada de un único rostro).
- La entrada está normalizada con media y desviación de ImageNet; un preprocesado incorrecto degrada significativamente la precisión.
- El modelo no es un LLM y no admite tool calling, agentes ni razonamiento de texto; su única salida es la segmentación por píxel.
- El rendimiento de la NPU depende de las librerías de Qualcomm que no se distribuyen en el repositorio; su integración requiere pasos manuales adicionales.
- La licencia MIT permite uso comercial, pero los datos de entrenamiento (CelebAMask-HQ) pueden tener restricciones de uso no cubiertas por la licencia del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/BiSeNet-Face-Parsing-LiteRT
- Repositorio de pesos originales: https://github.com/zllrunning/face-parsing.PyTorch
- Repositorio de conversión y scripts: https://github.com/john-rocky/LiteRT-Models/blob/main/faceparsing/README.md
- Paper de BiSeNet: https://arxiv.org/abs/1808.00897
- Repositorio de referencia de face parsing: https://github.com/yakhyo/face-parsing</think>## Resumen

BiSeNet-Face-Parsing-LiteRT es un modelo de segmentación facial (face parsing) en tiempo real diseñado para ejecutarse íntegramente en dispositivos móviles mediante LiteRT, la evolución de TensorFlow Lite. Lo publica la comunidad litert-community y convierte los pesos de BiSeNet (zllrunning/face-parsing.PyTorch) a un formato de grafo compatible con el delegado GPU de LiteRT, sin caída a CPU. El modelo clasifica cada píxel de un rostro en una de las 19 clases de CelebAMask-HQ (piel, cejas, ojos, nariz, labios, pelo, gafas, cuello, ropa, etc.), lo que lo hace idóneo para aplicaciones de realidad aumentada, maquillaje virtual y análisis facial.

La arquitectura es una CNN pura con backbone ResNet18, unos 13,3 millones de parámetros y un tamaño de 53 MB. Para lograr compatibilidad total con el delegado GPU se aplicaron tres parches de re-escritura del grafo: cambiar `align_corners` de `True` a `False`, sustituir el pooling global por una reducción `mean([2,3])` y añadir zero-padding explícito en el maxpool del stem de ResNet. El resultado es un grafo con 74 de 74 nodos en GPU y una correlación de 0,99999 frente a PyTorch. En un Pixel 8a se alcanzan ~22 ms por fotograma con LiteRT GPU, y en un Samsung Galaxy S26 con Snapdragon 8 Elite Gen 5 se baja a ~7,88 ms usando la NPU Hexagon, siendo 3,3 veces más rápido que la GPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiSeNet (ResNet18 backbone + context path + feature fusion) |
| Parametros totales | ~13,3 millones |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión) |
| Tipos de cuantizacion | fp16 (no requiere int8 para NPU) |
| Idiomas soportados | no aplicable |
| Licencia | MIT |
| Formato de pesos | LiteRT / TFLite (53 MB) |

## Arquitectura y entrenamiento

BiSeNet es una red convolucional bilateral diseñada para segmentación semántica en tiempo real. Consta de un *spatial path* que conserva detalles de baja resolución y un *context path* que captura información global mediante pooling y atención, fusionándose al final para producir la segmentación. El backbone es ResNet18 y la salida son logits de 19 canales a resolución 512×512. Los pesos provienen del repositorio zllrunning/face-parsing.PyTorch, entrenados con CelebAMask-HQ. La conversión se realizó con `litert-torch` aplicando los tres parches de compatibilidad GPU: `align_corners` se cambió de `True` a `False` (el delegado GPU lo rechazaba), el pooling global se reemplazó por una reducción `mean([2,3])` (el delegado Mali rechazaba el kernel completo) y el maxpool del stem de ResNet se reescribió con zero-padding explícito (el `PADV2` con `-inf` fallaba en Mali). El resultado es un grafo totalmente GPU con 74 de 74 nodos en una sola partición.

## Capacidades

- Segmentación facial píxel a píxel en 19 clases de CelebAMask-HQ: piel, cejas, ojos, gafas, nariz, boca, labios, orejas, pendientes, pelo, sombrero, cuello, collar, ropa, fondo, etc.
- Inferencia en tiempo real en dispositivos móviles: 22 ms en GPU (Pixel 8a) y 7,88 ms en NPU (Snapdragon 8 Elite Gen 5).
- Ejecución totalmente en GPU: 74 de 74 nodos en el delegado, sin caída a CPU.
- Compatibilidad con NPU Qualcomm Hexagon sin conversión previa: LiteRT compila el modelo en el dispositivo y lo cachea.
- Precisión alta frente a PyTorch: correlación 0,99999 y coincidencia de argmax del 99,96 %.
- Entrada y salida en formato NCHW, con normalización ImageNet estándar.

## Casos de uso

- **Realidad aumentada**: superponer accesorios virtuales (gafas, pendientes, sombreros) sobre el rostro en tiempo real, con latencias de 8-22 ms, suficiente para aplicaciones de streaming o videollamada.
- **Maquillaje virtual**: aplicar cosméticos digitales sobre los labios, ojos y piel con precisión píxel a píxel, usando las clases `u_lip`, `l_lip`, `l_eye`, `r_eye` y `skin`.
- **Análisis de belleza**: medir proporciones faciales (distancia entre ojos, tamaño de labios) a partir de las máscaras de segmentación, para recomendaciones de productos o consultas estéticas.
- **Detección de accesorios**: identificar si el sujeto lleva gafas, pendientes o sombrero, útil en aplicaciones de moda y comercio electrónico.
- **Filtros de fotos**: aplicar desenfoque selectivo o efectos de color solo en la piel o el pelo, mejorando la calidad visual de retratos.
- **Sistemas de seguridad biométrica**: preprocesar rostros para separar el fondo y el cabello, mejorando la robustez de los sistemas de reconocimiento facial en condiciones de iluminación variable.

## Benchmarks y rendimiento

| Runtime | Backend | Grafo en GPU | Latencia media |
|---|---|---|---|
| LiteRT `CompiledModel` (LITERT_CL) | GPU | 74/74 | ~22 ms |
| TFLite `benchmark_model` (TfLiteGpuDelegateV2) | GPU (OpenCL) | 74/74 | 52,9 ms |
| TFLite `benchmark_model` | CPU (XNNPACK, 4 hilos) | — | 229,4 ms |
| LiteRT `CompiledModel` (NPU, primera ejecución) | Hexagon NPU | — | 7,89 ms (mediana) |
| LiteRT `CompiledModel` (NPU, en caché) | Hexagon NPU | — | 7,88 ms (mediana) |
| LiteRT `CompiledModel` (GPU) | Adreno | — | 26,02 ms (mediana) |

Las dos filas de GPU corresponden a runtimes distintos: `LITERT_CL` es el camino oficial de LiteRT, mientras que `TfLiteGpuDelegateV2` es el delegado clásico de TFLite y se incluye como un suelo reproducible. La NPU es 3,3 veces más rápida que la GPU en el mismo dispositivo (7,88 ms frente a 26,02 ms) y la carga inicial en caché es 7 veces más rápida (116 ms frente a 816 ms). No se han publicado resultados de benchmarks como MMLU o HumanEval porque es un modelo de visión, no de lenguaje.

## Requisitos de hardware

- **GPU**: cualquier GPU móvil compatible con OpenCL (Adreno, Mali) puede ejecutar el modelo; el delegado GPU acepta el 100 % del grafo. En un Pixel 8a (Tensor G3) se obtienen ~22 ms.
- **NPU**: Qualcomm Hexagon v81 (Snapdragon 8 Elite Gen 5) puede ejecutar el modelo sin conversión previa, con 7,88 ms de latencia. Requiere las librerías `libLiteRtDispatch_Qualcomm.so` y `libLiteRtCompilerPlugin_Qualcomm.so` del SDK de Qualcomm.
- **CPU**: funciona con XNNPACK pero la latencia sube a 229,4 ms, no recomendable para uso en tiempo real.
- **VRAM**: el modelo ocupa 53 MB en disco y las entradas/salidas son tensores float32 de [1,3,512,512] y [1,19,512,512] (~3 MB y ~20 MB respectivamente).
- **Despliegue**: LiteRT `CompiledModel` con acelerador GPU o NPU, o TFLite clásico con `TfLiteGpuDelegateV2`. Herramienta de benchmark: `benchmark_model` de TFLite.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| BiSeNet-Face-Parsing-LiteRT | BiSeNet (ResNet18) | ~13,3 M | 512×512 | 22 ms GPU, 7,88 ms NPU | MIT |
| BiSeNet original (zllrunning) | BiSeNet (ResNet18) | ~13,3 M | 512×512 | no disponible | MIT |
| MobileNetV3-Segmentation (típico) | MobileNetV3 | ~5-10 M | 512×512 | no disponible | Apache 2.0 |

La conversión de LiteRT no cambia la arquitectura, solo la compatibilidad con GPU. No se dispone de datos de otros modelos de segmentación facial en la misma categoría para comparar directamente en el mismo dispositivo.

## Limitaciones y advertencias

- **Sesgos**: el entrenamiento se realizó con CelebAMask-HQ, un dataset de rostros de celebridades, lo que puede generar sesgos en tonos de piel, edades, etnias y condiciones de iluminación.
- **Alucinaciones**: como modelo de segmentación, no genera texto, pero puede clasificar erróneamente píxeles en clases incorrectas, especialmente en rostros parcialmente ocluidos o con accesorios.
- **Contexto**: el modelo procesa una sola imagen de 512×512; no maneja secuencias ni contexto temporal.
- **Licencia**: MIT permite uso comercial, pero los datos de entrenamiento (CelebAMask-HQ) pueden tener restricciones adicionales no cubiertas por la licencia del modelo.
- **Dependencia de hardware**: el rendimiento en NPU requiere librerías de Qualcomm que no se distribuyen en el repositorio; el usuario debe descargarlas del SDK.
- **Preprocesado**: la entrada debe normalizarse con la media y desviación de ImageNet; un preprocesado incorrecto degrada la precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/BiSeNet-Face-Parsing-LiteRT
- Repositorio de pesos originales: https://github.com/zllrunning/face-parsing.PyTorch
- Repositorio de conversión y scripts: https://github.com/john-rocky/LiteRT-Models/blob/main/faceparsing/README.md
- Paper BiSeNet: https://arxiv.org/abs/1808.00897
- Documentación de LiteRT: https://ai.google.dev/edge/litert/models/measurement
- Repositorio de referencia de face parsing: https://github.com/yakhyo/face-parsing</think>## Resumen

BiSeNet-Face-Parsing-LiteRT es un modelo de segmentación facial (face parsing) en tiempo real diseñado para ejecutarse íntegramente en dispositivos móviles mediante LiteRT, la evolución de TensorFlow Lite. Lo publica la comunidad litert-community y convierte los pesos del BiSeNet de zllrunning/face-parsing.PyTorch a un grafo totalmente compatible con el delegado GPU de LiteRT, sin caída a CPU. El modelo clasifica cada píxel de un rostro en una de las 19 clases de CelebAMask-HQ (piel, cejas, ojos, nariz, labios, orejas, pelo, gafas, cuello, ropa, etc.), lo que lo hace idóneo para aplicaciones de realidad aumentada, maquillaje virtual y análisis facial.

La arquitectura es una CNN pura con backbone ResNet18, unos 13,3 millones de parámetros y un tamaño de 53 MB. Para lograr compatibilidad total con el GPU se aplicaron tres parches de re-escritura del grafo: cambiar `align_corners` de `True` a `False`, sustituir el pooling global `avg_pool2d` por una reducción `mean([2,3])` y añadir zero-padding explícito en el maxpool del stem de ResNet. El resultado es un grafo con 74 de 74 nodos en GPU y una correlación de 0,99999 frente a PyTorch. En un Pixel 8a se alcanzan unos 22 ms por fotograma con la GPU, y en un Samsung Galaxy S26 con Snapdragon 8 Elite Gen 5 se baja a 7,88 ms por fotograma usando la NPU Hexagon sin conversión adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiSeNet (ResNet18 backbone + context path + feature fusion) |
| Parametros totales | ~13,3 millones |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision) |
| Tipos de cuantizacion | fp16 (no requiere int8 para NPU) |
| Idiomas soportados | no aplicable |
| Licencia | MIT |
| Formato de pesos | LiteRT / TFLite (53 MB) |

## Arquitectura y entrenamiento

BiSeNet es una red convolucional bilateral para segmentación semántica en tiempo real. Combina un camino espacial que conserva detalles de baja resolución y un camino de contexto que captura información global mediante pooling y atención, fusionándose al final para producir la salida. La entrada es una imagen RGB de 512×512 normalizada con los parámetros de ImageNet, y la salida son logits de 19 clases por píxel. Los pesos provienen del entrenamiento con CelebAMask-HQ, aunque no se publican detalles del número de tokens ni del proceso de entrenamiento. La conversión a LiteRT GPU se realizó con `litert-torch` aplicando tres parches específicos para la compatibilidad con el delegado GPU, y la precisión frente a PyTorch es de correlación 0,99999 y coincidencia de argmax del 99,96 %.

## Capacidades

- Segmentación facial píxel a píxel en 19 clases de CelebAMask-HQ: piel, cejas, ojos, gafas, nariz, boca, labios, orejas, pendientes, pelo, sombrero, cuello, collar, ropa, fondo, etc.
- Ejecución en tiempo real en dispositivos móviles: 22 ms en GPU (Pixel 8a) y 7,88 ms en NPU (Snapdragon 8 Elite Gen 5).
- Compatibilidad total con GPU: 74 de 74 nodos en el delegado, una sola partición, sin CPU fallback.
- Soporte de NPU Qualcomm Hexagon sin conversión previa, con compilación en el dispositivo y caché.
- Alta fidelidad frente a PyTorch: correlación 0,99999 y coincidencia de argmax del 99,96 %.
- Entrada y salida en formato NCHW, con normalización ImageNet (media y desviación estándar).

## Casos de uso

- **Realidad aumentada**: superponer accesorios virtuales (gafas, sombreros, pendientes) sobre el rostro en tiempo real, con latencias de 8-22 ms, suficiente para apps de streaming o videollamada.
- **Maquillaje virtual**: aplicar color de labios, sombra de ojos o base de maquillaje sobre las máscaras de piel, labios y ojos, con una precisión píxel a píxel.
- **Análisis facial y belleza**: medir proporciones faciales (distancia entre ojos, tamaño de labios) para recomendaciones de productos o consultas estéticas.
- **Filtros y efectos de fotografía**: aplicar desenfoque selectivo, cambio de color de pelo o eliminación de fondo en retratos, separando la piel, el pelo y la ropa.
- **Control de calidad en videollamadas**: detectar si el usuario lleva gafas o sombrero para activar ajustes automáticos de iluminación o efectos de fondo.
- **Integración en apps de salud**: análisis de la piel para detectar zonas de la cara, usando la máscara de piel para aplicaciones de dermatología asistida por imagen.

## Benchmarks y rendimiento

| Runtime | Backend | Grafo en GPU | Latencia media |
|---|---|---|---|
| LiteRT `CompiledModel` (LITERT_CL) | GPU | 74/74 | ~22 ms |
| TFLite `benchmark_model` (TfLiteGpuDelegateV2) | GPU (OpenCL) | 74/74 | 52,9 ms |
| TFLite `benchmark_model` | CPU (XNNPACK, 4 hilos) | — | 229,4 ms |
| LiteRT `CompiledModel` (primera ejecución) | Hexagon NPU | — | 7,89 ms (mediana) |
| LiteRT `CompiledModel` (caché) | Hexagon NPU | — | 7,88 ms (mediana) |
| LiteRT `CompiledModel` | GPU (Adreno) | — | 26,02 ms (mediana) |

Las dos filas de GPU corresponden a runtimes distintos: el `LITERT_CL` es el camino de LiteRT y el `TfLiteGpuDelegateV2` es el delegado clásico de TFLite, que es más lento (52,9 ms). La NPU es 3,3 veces más rápida que la GPU en el mismo dispositivo (7,88 ms frente a 26,02 ms) y la carga inicial en caché es 7 veces más rápida (116 ms frente a 816 ms). No se han publicado resultados de benchmarks de segmentación sobre datasets estándar, solo la correlación con PyTorch.

## Requisitos de hardware

- GPU compatible con OpenCL (Adreno, Mali, etc.) para ejecutar el delegado GPU; se requiere al menos una GPU de gama media para mantener los 60 fps.
- NPU Qualcomm Hexagon (v81 o superior) para la latencia mínima de 7,88 ms; se necesitan las librerías `libLiteRtDispatch_Qualcomm.so` y `libLiteRtCompilerPlugin_Qualcomm.so` del SDK de Qualcomm, no distribuidas en el repositorio.
- CPU: funciona con XNNPACK, pero la latencia sube a 229,4 ms, no recomendable para tiempo real.
- VRAM: el modelo ocupa 53 MB; la entrada es de 3 MB (float32) y la salida de 20 MB (float32), más los buffers internos del delegado.
- Despliegue: LiteRT `CompiledModel` con acelerador GPU o NPU, o TFLite clásico con `TfLiteGpuDelegateV2`. Medición con la herramienta `benchmark_model` de TFLite.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Tamaño | Rendimiento | Licencia |
|---|---|---|---|---|---|
| BiSeNet-Face-Parsing-LiteRT | BiSeNet (ResNet18) | ~13,3 M | 53 MB | 22 ms GPU, 7,88 ms NPU | MIT |
| BiSeNet original (zllrunning) | BiSeNet (ResNet18) | ~13,3 M | ~53 MB | no disponible | MIT |
| MobileNetV3-Segmentation (típico) | MobileNetV3 | ~5-10 M | ~20 MB | no disponible | Apache 2.0 |

La comparación directa con otros modelos de segmentación facial no está disponible en la información proporcionada. BiSeNet es un estándar en el campo, y esta versión LiteRT añade compatibilidad GPU/NPU sin cambiar la arquitectura.

## Limitaciones y advertencias

- **Sesgo**: entrenado con CelebAMask-HQ, que contiene rostros de celebridades, puede tener sesgos en tonos de piel, edad, etnias y condiciones de iluminación.
- **Alucinación**: como clasificador de píxeles, puede errar en regiones ambiguas, especialmente con oclusiones, gafas o pelo sobre la cara.
- **Contexto**: procesa una sola imagen de 512×512; no maneja secuencias de vídeo ni contexto temporal.
- **Licencia**: MIT para el código y los pesos, pero el dataset CelebAMask-HQ puede tener restricciones de uso no cubiertas por la licencia del modelo.
- **Dependencia de hardware**: el rendimiento de la NPU requiere librerías de Qualcomm que no se distribuyen en el repositorio; hay que obtenerlas del SDK de Qual
