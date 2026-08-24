# litert-community/SINet-V2-Camouflage-LiteRT

## Resumen

SINet-V2-Camouflage-LiteRT es un modelo de detección de objetos camuflados (camouflaged object detection) preparado para ejecución on-device mediante el runtime LiteRT de Google, sucesor de TensorFlow Lite. El modelo original, SINet-V2, fue desarrollado por el grupo de investigación de Deng-Ping Fan y publicado en TPAMI 2022, y es capaz de localizar objetos que se funden con su fondo — animales ocultos, objetos disimulados, defectos industriales o pólipos en imágenes médicas— donde la segmentación semántica convencional falla.

El modelo es una conversión completa a formato LiteRT/TFLite del checkpoint Apache-2.0 de SINet-V2, con pesos de Res2Net-50 y un decodificador CNN con conexiones de vecinos y atención de reversión de grupo. Ocupa 100 MB y ha sido convertido con la herramienta litert-torch, de forma que las 2447 nodos del grafo son ejecutables en la GPU mediante el delegado CompiledModel sin caídas a CPU. Está pensado para aplicaciones Android y edge que necesiten inferencia en tiempo real de mapas de camuflaje a partir de imágenes de 352×352 píxeles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Res2Net-50 backbone + neighbor-connection decoder + group-reversal attention (CNN pura) |
| Parametros totales | no disponible (pesos de SINet-V2 Res2Net-50, ~29 M en el original, no confirmado en la card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada [1, 3, 352, 352]) |
| Tipos de cuantizacion | fp16 (mencionado en la card; no se indica int8) |
| Idiomas soportados | no aplica (modelo de vision sin modulo de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT/TFLite (safetensors no aplica; se distribuye como archivo .tflite) |

## Arquitectura y entrenamiento

SINet-V2 es una red convolucional pura. El backbone es Res2Net-50, una variante de ResNet que usa conexiones de escala múltiple dentro de cada bloque residual, seguida de un decoder que combina conexiones de vecinos (neighbor-connection) para fusionar características de diferentes niveles y un mecanismo de atención de reversión de grupo (group-reversal attention) que suprime el fondo y resalta las regiones camufladas. No hay atención transformadora ni mecanismos de estado; todo es convolucional, lo que facilita la conversión a delegados de GPU/NPU.

El modelo original fue entrenado en el dataset COD10K, que contiene más de 10 000 imágenes con objetos camuflados anotados. La conversión a LiteRT se realizó con litert-torch, exportando el mapa de camuflaje final. Se aplicaron dos parches durante la conversión: ZeroPadMaxPool para el stem de Res2Net (con PADV2 -inf) y el cambio de `align_corners=True` a `False` en los upsamples bilineales, con una correlación CPU-exacta de 0.997 respecto a PyTorch. No se menciona el uso de RLHF ni DPO, ya que es un modelo de visión supervisado.

## Capacidades

- Detección de objetos camuflados en imágenes: localiza y segmenta objetos que se funden con el fondo (animales ocultos, objetos disimulados, defectos industriales, pólipos).
- Segmentación de imágenes: produce un mapa de camuflaje sigmoide de tamaño 352×352 donde los valores altos indican presencia de objeto camuflado.
- Inferencia on-device: ejecución completa en GPU mediante LiteRT CompiledModel (delegado OpenCL) sin CPU fallback, y también en NPU Hexagon de Qualcomm.
- Compatibilidad con LiteRT/TFLite: se integra con las APIs de Kotlin (Android) y Python (ai-edge-litert) para despliegue en edge.
- Soporte de cuantización fp16: el archivo funciona en NPU sin necesidad de cuantización int8.
- No tiene capacidades de texto, tool calling, agentes ni multimodales; es un modelo de visión puro.

## Casos de uso

- Vigilancia y seguridad: detectar personas u objetos que se camuflan en entornos naturales o urbanos, por ejemplo en imágenes de cámaras de seguridad, para alertar de presencia no evidente. Se usaría la salida de 352×352 como máscara de segmentación y se aplicaría un umbral para disparar alarmas.
- Inspección industrial: localizar defectos o componentes ocultos en líneas de producción, donde los defectos pueden confundirse con el fondo de la pieza. El mapa de camuflaje permite identificar la región exacta del defecto.
- Diagnóstico médico asistido: detectar pólipos en imágenes endoscópicas o lesiones que se confunden con el tejido sano, ayudando a los especialistas a revisar las imágenes de forma más rápida.
- Seguimiento de fauna: localizar animales camuflados en imágenes de cámaras trampa o drones, útil para estudios de biodiversidad sin necesidad de revisión manual exhaustiva.
- Aplicaciones de visión industrial en edge: integrar el modelo en un dispositivo Android o similar para inspección de calidad en tiempo real, aprovechando la inferencia en GPU o NPU on-device.
- Protección de infraestructura: detectar objetos sospechosos disimulados en instalaciones (por ejemplo, en revisiones de seguridad) mediante análisis de imágenes capturadas con dispositivos móviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, etc.) en la información disponible, ya que es un modelo de visión y no de lenguaje. Sin embargo, la model card incluye mediciones de latencia en dispositivos reales:

| Runtime | Backend | Grafo en GPU | Latencia |
|---|---|---|---|
| TFLite `benchmark_model` (TfLiteGpuDelegateV2) | GPU (OpenCL) | 471/471 | 51.8 ms |
| TFLite `benchmark_model` | CPU (XNNPACK, 4 threads) | — | 281.4 ms |
| LiteRT CompiledModel (GPU Adreno, Pixel 8a) | GPU (OpenCL) | 2447/2447 | no disponible en la card (ver nota) |
| LiteRT CompiledModel (NPU Hexagon, Samsung Galaxy S26, SM8850) | NPU | — | 3.11 ms (mediana, en caché) |
| LiteRT CompiledModel (GPU Adreno, Samsung Galaxy S26) | GPU | — | 12.53 ms (mediana) |

Nota: la card aclara que las mediciones de GPU en el Pixel 8a fueron tomadas con el delegado clásico TFLite, y que las mediciones on-device del modelo en LiteRT se registraron con otro runtime (LiteRT CompiledModel) que no es comparable directamente. Las filas de TFLite se presentan como un suelo reproducible. En el Galaxy S26, el NPU es 4.0x más rápido en inferencia que la GPU (3.11 ms vs 12.53 ms) y la carga inicial en caché es 9.4x más rápida (135 ms vs 1268 ms).

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; el modelo ocupa 100 MB en disco, por lo que la memoria en GPU/NPU será inferior a ese tamaño.
- GPU recomendadas: Adreno (en dispositivos Pixel y Galaxy) mediante OpenCL; también compatible con otras GPUs Android que soporten el delegado TFLite/LiteRT.
- NPU: Qualcomm Hexagon (v73 en SM8550, v75 en SM8650, v79 en SM8750, v81 en SM8850) con las librerías de LiteRT Dispatch y Qualcomm QAIRT.
- CPU: XNNPACK con 4 hilos como respaldo (281.4 ms en Pixel 8a).
- Opciones de despliegue: LiteRT CompiledModel (Android Kotlin), Python con ai-edge-litert, y TFLite benchmark_model para mediciones.
- Latencia: 3.11 ms en NPU (Galaxy S26), 12.53 ms en GPU (Galaxy S26), 51.8 ms en GPU (Pixel 8a con delegado clásico TFLite), 281.4 ms en CPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de detección de objetos camuflados (como SINet original, CODINet o ANet) ni con otros modelos de segmentación on-device. El modelo es una conversión de SINet-V2, y no se proporcionan datos comparativos de precisión frente a alternativas.

## Limitaciones y advertencias

- Sesgos: el modelo fue entrenado en CO2K, que contiene imágenes de objetos camuflados en contextos naturales (animales, objetos). Su rendimiento puede degradarse en dominios muy distintos, como entornos industriales o médicos sin adaptación.
- Riesgo de alucinación: al ser un modelo de visión, no genera texto, pero puede producir falsos positivos en regiones de fondo con texturas similares a objetos camuflados; es necesario calibrar el umbral de la máscara sigmoide.
- Limitaciones de contexto: la entrada está fijada a 352×352 píxeles; no soporta imágenes de mayor resolución sin redimensionar, lo que puede perder detalles finos.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero se debe conservar la atribución y el aviso de licencia.
- Caveats de producción: la conversión GPU requiere los dos patches descritos (ZeroPadMaxPool y align_corners=False) para ser totalmente compatible; la ejecución en NPU requiere librerías externas de Qualcomm (QNN HTP) que no se distribuyen desde este repositorio y deben obtenerse del SDK de Qualcomm, así como el plugin de compilación de LiteRT. Sin el plugin de compilación, el modelo se ejecuta silenciosamente en CPU en lugar de NPU. Además, las mediciones de rendimiento de la card provienen de un runtime específico (LiteRT CompiledModel) y no son comparables con las del delegado TFLite clásico.

## Enlaces

- HuggingFace: https://huggingface.co/litert-community/SINet-V2-Camouflage-LiteRT
- Model card en GitHub: https://github.com/john-rocky/LiteRT-Models/blob/main/sinet/README.md
- Repositorio del modelo original SINet-V2: https://github.com/GewelsJI/SINet-V2
- Repositorio de LiteRT (sucesor de TensorFlow Lite): https://github.com/google-ai-edge/LiteRT
- Documentación de LiteRT (DeepWiki): https://deepwiki.com/google-ai-edge/LiteRT/4-api-reference
- Herramienta de medición de TFLite: https://ai.google.dev/edge/litert/models/measurement
