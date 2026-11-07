# mlboydaisuke/RTMPose-Face-WFLW-OpenVINO

## Resumen

RTMPose-Face-WFLW-OpenVINO es una conversión y empaquetado del modelo RTMPose-Face-WFLW-LiteRT (publicado por litert-community) a formatos ONNX, OpenVINO IR e Intel NPU blob, realizada por el usuario mlboydaisuke. El modelo original es un detector de keypoints faciales de la familia RTMPose, orientado a la localización de puntos de referencia en rostros (landmarks) sobre el dataset WFLW. Esta ficha describe el artefacto empaquetado, no el modelo de entrenamiento original.

El problema que resuelve es la portabilidad: el modelo original está en formato LiteRT/TFLite, y este repositorio ofrece una versión ONNX (opset 17, tf2onnx 1.17.0), un IR de OpenVINO con pesos fp32 y un blob precompilado para NPU de Intel. Con ello se busca desplegar la detección de keypoints faciales en CPU, iGPU y NPU de Intel, así como en GPU NVIDIA y NPU Qualcomm, con latencias del orden de milisegundos.

La relevancia actual es doble: por un lado, la cuantización y compilación para NPUs de bajo consumo (Intel AI Boost, Snapdragon) acerca la inferencia de keypoints a tiempo real en dispositivos; por otro, la model card documenta de forma explícita un fallo de corrección en la NPU de Intel (salidas NaN), lo que resulta útil como advertencia para quien evalúe este tipo de despliegues. El tamaño del repositorio es de 0,2 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de detección de keypoints de la familia RTMPose; arquitectura concreta no detallada en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | fp16 (origen), fp32 (IR de OpenVINO), blob precompilado para NPU Intel; ONNX en fp16 y copia fp16 no incluida en el repo |
| Idiomas soportados | no disponible (no es un modelo lingüístico; procesa imágenes de rostros) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (.xml/.bin), Intel NPU blob (.blob) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original en los datos proporcionados. La model card describe únicamente el proceso de conversión: el fichero `rtm_face_fp16` de litert-community/RTMPose-Face-WFLW-LiteRT se convirtió a ONNX con tf2onnx 1.17.0 (opset 17), se generó un IR de OpenVINO con pesos fp32 y se compiló un blob para NPU Intel con OpenVINO 2026.4.1 y el driver NPU 32.0.100.4841. El modelo original pertenece al proyecto RTMPose de OpenMMLab (mmpose), orientado a estimación de pose, pero no se detallan en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset WFLW usada, ni si hubo RLHF/DPO (no aplicable a un modelo de visión de este tipo).

La innovación técnica destacable no está en el modelo sino en el empaquetado: se ofrece un blob precompilado que evita la compilación en tiempo de carga en la NPU de Intel, y se documenta un procedimiento de verificación de salidas (comparación contra la salida de referencia en CPU fp32 con ONNX Runtime, criterio de coseno ≥ 0,99, ausencia de NaN/Inf y acuerdo de argmax ≥ 0,99). La model card reporta que el ONNX coincide con el `.tflite` original (coseno ≥ 0,9999 en todas las salidas) y que la iGPU de Intel pasa la verificación (coseno ≥ 0,9999), mientras que la NPU de Intel produce NaN y la GPU NVIDIA con copia fp16 falla el acuerdo de argmax (95/98).

## Capacidades

- Detección de keypoints faciales (landmarks) sobre imágenes de rostro; la model card no especifica el número exacto de puntos ni el esquema de salida más allá de dos salidas (`output_0_output`, `output_1_output`).
- Inferencia en CPU, iGPU y NPU de Intel mediante OpenVINO y el Execution Provider de OpenVINO en ONNX Runtime.
- Inferencia en GPU NVIDIA mediante el Execution Provider CUDA de ONNX Runtime.
- Inferencia en NPU Qualcomm (Snapdragon X2 Elite, Galaxy S26) mediante QNN, según los perfiles de Qualcomm AI Hub reportados.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de visión especializado.
- No se documentan capacidades de thinking mode, visión general, audio ni generación de texto.

## Casos de uso

- Análisis de expresiones faciales en tiempo real: el modelo puede ejecutarse en la iGPU de un portátil Intel a 2,20 ms por inferencia (medido en Core Ultra 9 386H), lo que permite procesar vídeo a decenas de fotogramas por segundo para aplicaciones de seguimiento facial.
- Despliegue en dispositivos de bajo consumo con NPU Intel: el blob precompilado se importa en 0,02 s y ejecuta en 2,99 ms, adecuado para aplicaciones de escritorio que necesitan latencia mínima, siempre que se valide la corrección de salida (la model card reporta NaN en esta ruta).
- Preprocesado para pipelines de reconocimiento facial: los landmarks sirven para alinear y normalizar rostros antes de un modelo de identificación; la latencia de milisegundos permite integrarlo en un pipeline en serie sin cuello de botella.
- Telemetría de atención en entornos educativos o de usabilidad: la detección de puntos faciales permite estimar orientación de la mirada y expresiones en estudios de interacción, ejecutándose en CPU a 9,02 ms por inferencia.
- Aplicaciones móviles con Snapdragon: los perfiles de Qualcomm AI Hub reportan 1,39-1,44 ms en NPU de Snapdragon X2 Elite y Galaxy S26, lo que hace viable la detección de landmarks en tiempo real en dispositivos móviles.
- Verificación y benchmarking de despliegues en NPU: el repositorio incluye scripts, registros crudos y una tabla comparativa para 52 grafos de LiteRT-Models, útil para equipos que evalúan la portabilidad de modelos TFLite a ONNX/OpenVINO.
- Prototipado en GPU NVIDIA: con ONNX Runtime y el Execution Provider CUDA se obtiene 4,47 ms en una RTX 5080 Laptop con límite de 95 W, útil para desarrollo y pruebas antes de pasar a producción en hardware Intel.

## Benchmarks y rendimiento

La model card no incluye métricas de precisión (NME, AUC, etc.) sobre WFLW. Sí incluye una tabla de latencia y verificación de salida, que se reproduce a continuación:

| Procesador | Runtime | Fichero | ms | Carga (s) | Verificación |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob (`import_model`) | 2,99 | 0,02 | FAIL: NaN, coseno 0,0000, argmax 0/98 |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 3,39 | 1,88 | FAIL: NaN, coseno 0,0000, argmax 0/98 |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 2,20 | 1,05 | PASS (coseno ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` | 3,94 | 1,14 | FAIL: argmax 95/98 |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 4,47 | 1,15 | PASS (coseno ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 9,02 | 0,16 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN precompilado | `.onnx` | 1,44 | 0,33 | no comparado |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, ONNX Runtime QNN EP | `.onnx` | 1,44 | 1,30 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN precompilado | `.onnx` | 1,39 | 0,18 | no comparado |

No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no es un modelo de lenguaje. Tampoco se reportan métricas de error de keypoints sobre WFLW.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El fichero ONNX ocupa 67,1 MB y el binario del IR 66,6 MB, por lo que la huella de memoria es reducida (del orden de decenas de MB en fp32).
- GPU recomendadas: RTX 5080 Laptop (probado, 4,47 ms con ONNX Runtime CUDA EP en fp32); no se han probado otras GPU en la información disponible.
- Cabe en GPU de consumo: sí, dado el tamaño del modelo (67 MB en ONNX); se ha verificado en una RTX 5080 Laptop con límite de 95 W.
- Opciones de despliegue: OpenVINO (2026.4.1) para NPU/CPU/iGPU Intel; ONNX Runtime 1.31.1 con Execution Provider OpenVINO 1.8.1 o CUDA; Qualcomm AI Hub con QNN para Snapdragon.
- Latencia y throughput: 2,20 ms en iGPU Intel, 2,99 ms en NPU Intel (con fallo de corrección), 4,47 ms en RTX 5080 Laptop, 9,02 ms en CPU Core Ultra 9 386H, 1,39-1,44 ms en NPU Snapdragon (según Qualcomm AI Hub). No se reporta throughput agregado (inferencias/segundo) más allá de la latencia por ejecución.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la información proporcionada. El repositorio RTMpose-OpenVINO de coldchanP incluye modelos RTMPose para cara, cuerpo y mano (68 o 106 keypoints faciales, 17 o 133 corporales, 21 de mano), pero no se aportan métricas de rendimiento que permitan una comparación cuantitativa. La comparación con el modelo base (litert-community/RTMPose-Face-WFLW-LiteRT) se limita a la equivalencia numérica: el ONNX coincide con el `.tflite` original con coseno ≥ 0,9999.

| Modelo | Formato | Keypoints | Licencia | Disponibilidad |
|---|---|---|---|---|
| RTMPose-Face-WFLW-OpenVINO | ONNX, IR, blob | no disponible | Apache 2.0 | Hugging Face |
| RTMPose-Face-WFLW-LiteRT (base) | LiteRT/TFLite | no disponible | no disponible | Hugging Face |
| RTMpose-OpenVINO (coldchanP) | OpenVINO IR | 68 o 106 (cara) | no disponible | GitHub |

## Limitaciones y advertencias

- La ruta de NPU Intel produce salidas incorrectas: 50.176 valores NaN en ambas salidas, coseno 0,0000 y acuerdo de argmax 0/98, tanto con el blob precompilado como con ONNX Runtime + OpenVINO EP. No debe usarse en producción sin validar la corrección en el hardware y driver concretos.
- La copia fp16 del ONNX en GPU NVIDIA falla el criterio de acuerdo de argmax (95/98), por lo que se recomienda usar el ONNX en fp32 para esa ruta.
- El blob precompilado depende de OpenVINO 2026.4.1 y del driver NPU 32.0.100.4841; en otras versiones `import_model` puede rechazarlo y hay que recompilar el IR.
- No se han publicado métricas de precisión (NME/AUC) sobre WFLW en la información disponible, por lo que no es posible evaluar la calidad de los keypoints frente a otros modelos.
- No se documentan sesgos conocidos del modelo original ni limitaciones de idioma (no aplica).
- Licencia Apache 2.0: permite uso comercial con atribución, pero el modelo base y sus dependencias deben verificarse por separado.
- El modelo es un artefacto de conversión de un tercero (mlboydaisuke), con 0 descargas y 0 likes en el momento de la consulta; no hay garantía de mantenimiento ni soporte.
- Es un modelo especializado en keypoints faciales: no sirve para generación de texto, razonamiento, código ni tareas generales.

## Enlaces

- Hugging Face: https://huggingface.co/mlboydaisuke/RTMPose-Face-WFLW-OpenVINO
- Modelo base: https://huggingface.co/litert-community/RTMPose-Face-WFLW-LiteRT
- Repositorio con scripts y tabla comparativa (52 grafos): https://github.com/john-rocky/windows-zoo
- Proyecto RTMPose en OpenMMLab: https://github.com/open-mmlab/mmpose/tree/main/projects/rtmpose
- Conversión RTMPose a OpenVINO (cara, cuerpo, mano): https://github.com/coldchanP/RTMpose-OpenVINO
