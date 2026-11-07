# mlboydaisuke/RTMPose-s-OpenVINO

## Resumen

RTMPose-s-OpenVINO es una conversión del modelo de estimación de pose RTMPose-s (variante small) al ecosistema OpenVINO de Intel, publicada por el usuario mlboydaisuke. El modelo original procede de la familia RTMPose desarrollada por OpenMMLab dentro del proyecto MMPose, y esta versión concreta deriva de la conversión a LiteRT publicada por litert-community (RTMPose-s-LiteRT), que a su vez se ha transformado a ONNX y posteriormente a formato OpenVINO IR y a un blob precompilado para la NPU de Intel.

El modelo resuelve la detección de keypoints (keypoint detection) sobre imágenes, típicamente para estimación de pose humana, ejecutándose en aceleradores de Intel: NPU (Intel AI Boost), GPU integrada y CPU. Su relevancia actual radica en que permite desplegar un detector de pose ligero en hardware de portátiles con Core Ultra, con latencias inferiores al milisegundo en NPU según las mediciones del autor, sin necesidad de GPU dedicada.

El repositorio es pequeño (aproximadamente 0,1 GB) e incluye el ONNX en fp16, el IR de OpenVINO con pesos fp32 y el blob precompilado para NPU. La licencia es Apache 2.0. No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica, al no ser un modelo de lenguaje) ni los idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RTMPose-s (estimador de pose por keypoints), convertido a ONNX opset 17 y a OpenVINO IR |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | fp16 (ONNX), fp32 (IR de OpenVINO), blob precompilado para NPU |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (.onnx), OpenVINO IR (.xml/.bin), blob de NPU (.blob) |

## Arquitectura y entrenamiento

RTMPose es una familia de modelos de estimación de pose por regresión de keypoints desarrollada por OpenMMLab. La variante "s" (small) emplea un backbone CSPNeXt-tiny según la documentación de MMPose, con una cabeza de regresión de coordenadas de keypoints. El modelo original se entrena sobre datasets de pose humana habituales en el ecosistema MMPose (no se detalla la composición exacta del dataset en la información disponible).

Esta publicación no entrena el modelo: es una conversión de formato en cadena. El punto de partida es rtmpose_s_fp16 de litert-community/RTMPose-s-LiteRT, convertido a ONNX mediante tf2onnx 1.17.0 con opset 17, y después a OpenVINO IR con pesos fp32. Además se incluye un blob precompilado para la NPU de Intel, generado con OpenVINO 2026.4.1 y el driver de NPU 32.0.100.4841. No se documentan innovaciones de entrenamiento (RLHF, DPO, decodificación especulativa) porque no aplican a este tipo de modelo.

## Capacidades

- Detección de keypoints sobre imágenes (pipeline keypoint-detection), orientada a estimación de pose.
- Ejecución en tres backends de Intel: NPU (Intel AI Boost), GPU integrada y CPU, mediante OpenVINO u ONNX Runtime con el execution provider de OpenVINO.
- Inferencia de baja latencia: 0,89 ms por ejecución en NPU con el blob precompilado en un Core Ultra 9 386H, según el autor.
- Entrada y salida en numpy (float32), con formas de entrada y salida consultables a través de la API de OpenVINO.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de visión general (VLM) ni modos de "thinking".

## Casos de uso

- Estimación de pose en tiempo real en portátiles con Core Ultra: el modelo se ejecuta en la NPU a menos de 1 ms por frame, lo que permite procesar vídeo a alta frecuencia sin cargar la CPU ni la GPU dedicada.
- Análisis de movimiento deportivo: integración en aplicaciones de escritorio que capturan vídeo de una webcam y extraen keypoints por frame para calcular ángulos articulares y detectar errores posturales.
- Videoconferencia y efectos en tiempo real: detección de pose para segmentación o avatares, aprovechando la baja latencia en GPU integrada (0,66 ms según las mediciones del autor).
- Control por gestos y análisis corporal en aplicaciones de accesibilidad: el modelo proporciona keypoints que alimentan lógica de interacción sin depender de servicios en la nube.
- Procesamiento por lotes en CPU en entornos sin acelerador: con ONNX Runtime CPU EP el modelo tarda 3,23 ms por ejecución, suficiente para pipelines offline de etiquetado de imágenes.
- Despliegue en dispositivos móviles vía Qualcomm AI Hub: el mismo ONNX se ha perfilado en NPU de Snapdragon X2 Elite (0,42-0,44 ms) y Galaxy S26 (0,36 ms), lo que abre la puerta a aplicaciones Android o Windows on ARM.
- Investigación y comparación de runtimes: el repositorio incluye scripts y registros del proyecto windows-zoo para reproducir las mediciones en distintos aceleradores.

## Benchmarks y rendimiento

El autor publica tiempos de inferencia y comprobaciones de salida frente a la referencia en CPU fp32 (ONNX Runtime CPU EP). PASS exige coseno ≥ 0,99, sin NaN ni Inf, y coincidencia de top-1 ≥ 0,99 en las puntuaciones de clase.

| Procesador | Runtime | Fichero | ms | Carga (s) | Comprobación de salida |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob (`import_model`) | 0,89 | 0,01 | FAIL: cos 0,9367 y 0,9374; top-1 15/17 y 10/17 |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 1,17 | 0,95 | FAIL: cos 0,9367 y 0,9374; top-1 15/17 y 10/17 |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 0,66 | 0,45 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` | 2,72 | 1,26 | FAIL: top-1 16/17 y 15/17 |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 2,94 | 1,16 | FAIL: top-1 16/17 |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 3,23 | 0,07 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN precompilado | `.onnx` | 0,44 | 0,44 | no comparado |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, ONNX Runtime QNN EP | `.onnx` | 0,42 | 0,79 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN precompilado | `.onnx` | 0,36 | 0,15 | no comparado |

El ONNX frente al `.tflite` original (intérprete LiteRT en CPU, misma entrada) obtiene PASS con coseno ≥ 0,9999 en todas las salidas. No se publican métricas de precisión (AP, PCK) sobre datasets de pose en la información disponible.

## Requisitos de hardware

- VRAM estimada: el ONNX ocupa 22,2 MB, el IR 645 KB (XML) más 21,9 MB (BIN) y el blob de NPU 11,9 MB; la huella es mínima y cabe holgadamente en cualquier acelerador moderno.
- GPU recomendadas: no requiere GPU dedicada; está pensado para NPU y GPU integrada de Intel. En una RTX 5080 Laptop (95 W) el autor mide 2,72-2,94 ms, más lento que en la iGPU.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo, aunque el objetivo del repositorio es el hardware Intel con NPU.
- Despliegue: OpenVINO 2026.4.1 (`import_model` o `compile_model`), ONNX Runtime 1.31.1 con OpenVINO EP 1.8.1 o CUDA EP, y Qualcomm AI Hub para Snapdragon.
- Latencia y throughput: 0,89 ms por ejecución en NPU de Core Ultra 9 386H (blob), 0,66 ms en iGPU y 3,23 ms en CPU; en Snapdragon X2 Elite y Galaxy S26, 0,36-0,44 ms según los perfiles de Qualcomm AI Hub.
- El blob de NPU está compilado para OpenVINO 2026.4.1 y driver 32.0.100.4841; en otras versiones hay que recompilar el IR.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone | Formatos | Licencia | Notas |
|---|---|---|---|---|---|
| RTMPose-s-OpenVINO (este) | Pose por keypoints | CSPNeXt-tiny (RTMPose-s) | ONNX, OpenVINO IR, blob NPU | Apache 2.0 | Optimizado para NPU/GPU/CPU de Intel |
| RTMPose-s-LiteRT | Pose por keypoints | CSPNeXt-tiny (RTMPose-s) | LiteRT/TFLite | no disponible | Modelo base de esta conversión |
| RTMpose-OpenVINO (coldchanP) | Pose (cara, cuerpo, manos) | RTMPose (varias variantes) | OpenVINO IR | no disponible | Requiere conversión manual a IR; cubre 17/133 keypoints de cuerpo, 68/106 de cara y 21 de mano |
| CSPNeXt-tiny (MMPose) | Clasificación/backbone | CSPNeXt-tiny | PyTorch | Apache 2.0 | 2,73 M parámetros, 0,34 GFLOPs a 224x224; referencia de backbone, no detector de pose completo |

## Limitaciones y advertencias

- El blob precompilado para NPU falla la comprobación de salida del propio autor (coseno 0,9367-0,9374 frente a la referencia en CPU), por debajo del umbral de 0,99; conviene validar la precisión antes de usarlo en producción.
- Las ejecuciones en NPU vía ONNX Runtime con OpenVINO EP y en CUDA EP también fallan parcialmente la comprobación (top-1 15/17 y 10/17 en NPU; 15/17 y 16/17 en CUDA).
- El blob está atado a OpenVINO 2026.4.1 y al driver de NPU 32.0.100.4841; en otras versiones `import_model` puede rechazarlo y hay que recompilar el IR.
- No se documentan sesgos, tasas de alucinación ni limitaciones de idioma porque no es un modelo generativo; los sesgos potenciales serían los del dataset de pose original, no detallado en la información disponible.
- No se publican métricas de precisión (AP, PCK) sobre benchmarks de pose, solo tiempos de inferencia y comprobaciones de consistencia numérica.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni mantenimiento continuado.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base LiteRT y del RTMPose original antes de redistribuir.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/RTMPose-s-OpenVINO
- Modelo base: https://huggingface.co/litert-community/RTMPose-s-LiteRT
- Proyecto windows-zoo (scripts y registros): https://github.com/john-rocky/windows-zoo
- RTMpose-OpenVINO (coldchanP): https://github.com/coldchanP/RTMpose-OpenVINO
- Documentación RTMPose en MMPose: https://raw.githubusercontent.com/open-mmlab/mmpose/refs/heads/main/projects/rtmpose/README_CN.md
- OpenMMLab MMPose: https://github.com/open-mmlab/mmpose
