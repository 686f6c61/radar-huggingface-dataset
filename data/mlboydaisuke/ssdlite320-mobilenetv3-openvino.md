# mlboydaisuke/ssdlite320-mobilenetv3-openvino

## Resumen

ssdlite320-mobilenetv3-openvino es una conversión y empaquetado del detector de objetos SSDLite320 con backbone MobileNetV3, exportado originalmente a LiteRT/TFLite por el mismo autor y aquí redistribuido en tres formatos: ONNX (opset 17, generado con tf2onnx 1.17.0), OpenVINO IR con pesos fp32 y un blob precompilado para la NPU integrada de Intel. El modelo base es la implementación SSDLite320 MobileNetV3-Large, una arquitectura de detección de objetos de una etapa pensada para inferencia en el borde, con entrada de 320x320 píxeles y salida de cajas delimitadoras con puntuaciones de clase.

El problema que resuelve es la portabilidad: ofrece un mismo grafo en un formato neutro (ONNX) y en formatos optimizados para aceleradores Intel (NPU AI Boost, iGPU y CPU), de modo que un desarrollador puede desplegar detección de objetos en un portátil con Core Ultra sin recompilar desde el framework original. El autor publica mediciones de latencia por procesador, incluida una ejecución de 1,70 ms por inferencia en la NPU de un Core Ultra 9 386H.

Es relevante ahora por la proliferación de NPUs integradas en portátiles (Intel Core Ultra, Qualcomm Snapdragon X) y porque el ecosistema OpenVINO 2026 ya permite cargar blobs precompilados sin coste de compilación en tiempo de carga. No es un modelo de lenguaje: es un detector de objetos clásico de tamaño muy reducido (unos 3,4 millones de parámetros en el backbone MobileNetV3-Large más la cabeza SSD), con licencia permisiva BSD-3-Clause.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SSDLite320 con backbone MobileNetV3-Large (detector de objetos de una etapa, CNN) |
| Parametros totales | no disponible (el repo no publica el recuento; el backbone MobileNetV3-Large ronda los 3,4 M en la literatura, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen 320x320) |
| Tipos de cuantizacion | fp16 en el nombre de los artefactos; ONNX en fp32, OpenVINO IR con pesos fp32, blob NPU precompilado |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (.xml + .bin), blob NPU precompilado (.blob) |

## Arquitectura y entrenamiento

SSDLite320 es una variante ligera de Single Shot MultiBox Detector en la que las convoluciones estándar de la cabeza de detección se sustituyen por convoluciones separables en profundidad, lo que reduce drásticamente el coste computacional. El backbone es MobileNetV3-Large, una CNN con bloques invertidos residuales, activaciones hard-swish y módulos de atención por squeeze-and-excitation. La entrada es de 320x320 píxeles y la salida son cajas delimitadoras con puntuaciones por clase, en línea con la implementación de referencia de torchvision (`ssdlite320_mobilenet_v3_large`).

No se dispone de información sobre el dataset de entrenamiento, el número de tokens (no aplica), ni sobre si hubo ajuste fino con RLHF o DPO (no aplica a un detector). La model card solo documenta el proceso de conversión: exportación desde el TFLite original a ONNX con tf2onnx 1.17.0 y opset 17, generación del IR de OpenVINO y compilación de un blob para la NPU con OpenVINO 2026.4.1 y driver NPU 32.0.100.4841. La verificación de fidelidad indica que el ONNX reproduce el TFLite de origen con coseno ≥ 0,9999 en todas las salidas.

## Capacidades

- Detección de objetos en imágenes: devuelve cajas delimitadoras y puntuaciones de clase para las categorías del dataset de entrenamiento (no especificadas en la model card).
- Inferencia en el borde: diseñado para ejecutarse en CPU, iGPU y NPU de bajo consumo.
- Ejecución en NPU Intel AI Boost mediante blob precompilado o compilación del IR en el momento de la carga.
- Compatibilidad con ONNX Runtime y su Execution Provider de OpenVINO, además del runtime nativo de OpenVINO.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual de detección.
- Capacidades multilingües: no aplica.
- No incluye modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la detección sobre imagen.

## Casos de uso

- Detección de objetos en tiempo real en portátiles con Core Ultra: el blob NPU ejecuta una inferencia en 1,70 ms, lo que permite procesar vídeo a más de 500 FPS teóricos por hilo de NPU y libera la CPU y la GPU para otras tareas.
- Preprocesado en pipelines de visión por computador: usar el detector como etapa de regiones de interés antes de un modelo más pesado (OCR, clasificación fina o segmentación) en aplicaciones de inspección.
- Aplicaciones de escritorio con aceleración por hardware: integrar el IR de OpenVINO en una app Windows nativa que aproveche la iGPU (1,13 ms por inferencia) sin depender de CUDA.
- Prototipado multiplataforma: el mismo ONNX sirve para validar en CPU (3,06 ms), iGPU, NPU Intel y, según el autor, también en NPU Snapdragon X2 Elite y Galaxy S26 mediante Qualcomm AI Hub (0,74 ms y 0,69 ms respectivamente).
- Automatización de inventario o conteo de objetos en entornos industriales ligeros, donde el coste de un detector de 14 MB en ONNX permite desplegarlo en equipos sin GPU dedicada.
- Filtrado previo en cámaras de seguridad o domótica: detectar presencia de personas u objetos en flujos de vídeo de baja resolución con latencia inferior a 2 ms en NPU.
- Benchmarking y comparación de aceleradores: el repositorio del autor (windows-zoo) publica la misma tabla para 52 grafos de LiteRT-Models, útil para evaluar el rendimiento relativo de NPU, iGPU y CPU en una misma máquina.

## Benchmarks y rendimiento

La model card no publica métricas de precisión (mAP, COCO) sino latencias y una verificación de fidelidad numérica frente a la salida de referencia en CPU fp32 con ONNX Runtime.

| Procesador | Runtime | Fichero | Latencia (ms) | Carga (s) | Verificación de salida |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob NPU (`import_model`) | 1,70 | 0,01 | FAIL: output_6_output argmax 53/54 |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 1,65 | 2,45 | FAIL: output_4_output 148/150; output_6_output 53/54 |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 1,13 | 1,85 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` | 9,14 | 1,17 | FAIL: output_4_output 147/150 |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 3,67 | 1,15 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 3,06 | 0,06 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 0,74 | 0,34 | no comparado |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, ONNX Runtime QNN EP | `.onnx` | 0,74 | 1,27 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 0,69 | 0,15 | no comparado |

No se han publicado resultados de benchmarks de precisión (mAP, COCO) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el ONNX pesa 14,3 MB y el IR de OpenVINO 15,0 MB en total (xml + bin), por lo que la huella de memoria es inferior a 100 MB en cualquier acelerador, incluyendo buffers intermedios.
- GPU recomendadas: RTX 5080 Laptop (medido a 95 W, 3,67 ms con ONNX en fp32); cualquier GPU con soporte de ONNX Runtime CUDA EP o de OpenVINO GPU plugin debería funcionar, aunque no se publican mediciones para otras.
- Cabe en cualquier GPU de consumo: con menos de 15 MB de pesos, incluso iGPU integradas lo ejecutan (1,13 ms medidos en Intel Graphics).
- Despliegue: OpenVINO 2026.4.1 (runtime nativo, con `import_model` para el blob o `compile_model` para el IR), ONNX Runtime 1.31.1 con OpenVINO EP 1.8.1 o CUDA EP, y Qualcomm AI Hub / QNN EP para Snapdragon.
- Latencia y throughput: 1,70 ms en NPU Intel, 1,13 ms en iGPU Intel, 3,06 ms en CPU Core Ultra 9 386H, 3,67 ms en RTX 5080 Laptop, 0,74 ms en Snapdragon X2 Elite NPU y 0,69 ms en Galaxy S26 NPU (estas dos últimas medidas por Qualcomm AI Hub con su propio temporizador).
- Nota sobre el blob NPU: fue compilado con OpenVINO 2026.4.1 y driver NPU 32.0.100.4841; si `import_model` lo rechaza en otra versión, hay que compilar el IR en la máquina destino.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| ssdlite320-mobilenetv3-openvino (este) | no disponible (backbone MobileNetV3-Large) | 320x320 | no aplica | BSD-3-Clause | Hugging Face, ONNX + IR + blob NPU | Optimizado para NPU Intel; latencias medidas por el autor |
| torchvision ssdlite320_mobilenet_v3_large | ~3,4 M (backbone) | 320x320 | no aplica | BSD-3-Clause | PyTorch, pesos COCO_V1 | Referencia de la arquitectura; requiere exportación para edge |
| mlboydaisuke/SSDLite320-MobileNetV3-ExecuTorch | no disponible | 320x320 | no aplica | BSD-3-Clause | Hugging Face, formato .pte (XNNPACK) | Misma familia del autor, orientada a ExecuTorch en lugar de OpenVINO |
| mlboydaisuke/ssdlite320-mobilenetv3-litert | no disponible | 320x320 | no aplica | BSD-3-Clause | Hugging Face, TFLite | Modelo base del que se deriva este paquete |

## Limitaciones y advertencias

- No es un modelo generativo: no procesa texto, no soporta tool calling ni razonamiento, y no debe evaluarse con métricas de LLM.
- La verificación de salida falla en NPU Intel y en la ruta fp16 de CUDA: la coincidencia de argmax es 53/54 y 148/150 en algunas salidas, lo que indica pequeñas divergencias numéricas respecto a la referencia fp32. Para aplicaciones sensibles a la precisión conviene validar con datos reales.
- El blob NPU está atado a una versión concreta de OpenVINO (2026.4.1) y de driver NPU (32.0.100.4841); en otros entornos hay que recompilar el IR.
- No se publican métricas de precisión (mAP) ni la lista de clases del dataset de entrenamiento, por lo que no se puede evaluar su calidad de detección a partir de la model card.
- Las latencias de Snapdragon y Galaxy S26 provienen de trabajos de perfilado de Qualcomm AI Hub y no se compararon numéricamente contra la referencia.
- Licencia BSD-3-Clause: permite uso comercial con atribución y sin garantías; no hay restricciones adicionales documentadas.
- Riesgo de sesgo y alucinación: no aplica alucinación en el sentido de LLM, pero sí existe el riesgo habitual de sesgo en el dataset de entrenamiento del detector original, no documentado aquí.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de repo de 0,0 GB reportado por Hugging Face pese a que los ficheros suman unos 38 MB; conviene verificar la integridad con los sha256 publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/ssdlite320-mobilenetv3-openvino
- Modelo base LiteRT: https://huggingface.co/mlboydaisuke/ssdlite320-mobilenetv3-litert
- Variante ExecuTorch: https://huggingface.co/mlboydaisuke/SSDLite320-MobileNetV3-ExecuTorch
- Repositorio con scripts y tabla de 52 grafos: https://github.com/john-rocky/windows-zoo
- Documentación de torchvision para ssdlite320_mobilenet_v3_large: https://docs.pytorch.org/vision/main/models/generated/torchvision.models.detection.ssdlite320_mobilenet_v3_large.html
