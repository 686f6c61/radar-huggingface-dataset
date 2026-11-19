# anguoyang/movenet-qcs6490

## Resumen

MoveNet es un modelo de estimación de pose humana (detección de un único esqueleto de 17 keypoints con confianza asociada) originalmente desarrollado por Google para TensorFlow Hub. Esta ficha concreta, publicada por el usuario anguoyang, no contiene pesos ni artefactos compilados: es una medición independiente de terceros del rendimiento de MoveNet sobre el SoC Qualcomm QCS6490, ejecutado en el kit Dragonwing RB3 Gen 2 Vision Kit.

El interés del artefacto es metodológico y de referencia para despliegues en el borde. Bajo un protocolo uniforme (ONNX en fp32, compilación por defecto de Qualcomm AI Hub, perfilado de un único grafo), el modelo reporta un tiempo de inferencia estimado de 17,7 ms (17.733 µs) para una entrada de 1 × 3 × 192 × 192. El autor forma parte de un barrido de 28 modelos en 14 categorías, con el objetivo de ofrecer puntos de referencia comparables entre modelos en el mismo hardware.

La relevancia es acotada pero útil para quien evalúe visión en el borde: el dato fp32 sirve como referencia frente a las variantes cuantizadas que ya aparecen en el `perf.yaml` upstream (0.66.0) para RB3, y advierte de una trampa de exportación: el primer intento falló por alimentar las entradas en formato NHWC y solo funcionó solicitando NCHW.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoveNet (CNN de estimación de pose, top-down single-pose, 17 keypoints); detalles internos de capas no disponibles en la información proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 1 × 3 × 192 × 192) |
| Tipos de cuantizacion | Medición en fp32 ONNX sin cuantización explícita; upstream `perf.yaml` lista variantes cuantizadas para RB3, sin detalle disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 (licencia del modelo upstream); la tarjeta publica solo mediciones, sin pesos |
| Formato de pesos | No se publican pesos. Origen: ONNX exportado desde `qai-hub-models` 0.66.0 (9.397.194 bytes); despliegue vía QNN en el dispositivo |

## Arquitectura y entrenamiento

MoveNet es un modelo de estimación de pose de una sola persona que predice 17 keypoints (formato COCO) junto con su confianza. La salida medida es 1 × 1 × 17 × 3. La arquitectura interna, el número de parámetros, los datos de entrenamiento y si hubo ajuste fino con RLHF/DPO no están disponibles en la información proporcionada.

La innovación técnica destacable de esta tarjeta no está en el modelo sino en el procedimiento de medición: exportación a ONNX desde la definición `movenet` de `qai-hub-models` 0.66.0, compilación con opciones por defecto de Qualcomm AI Hub y perfilado de un único grafo mediante `submit_inference_job(..., profile=True)`, tomando `execution_summary.estimated_inference_time`. El autor subraya que es una estimación por grafo, no una latencia extremo a extremo de aplicación, y que la exportación exige entradas en NCHW (el primer intento con NHWC falló). Los IDs de trabajo son `j5ml7lx9g` (compilación) y `jgnw4wvqg` (perfilado).

## Capacidades

- Estimación de pose de una sola persona con 17 keypoints y puntuación de confianza por keypoint.
- Entrada de imagen RGB de 192 × 192 píxeles en formato NCHW.
- Salida estructurada 1 × 1 × 17 × 3 apta para post-proceso de esqueleto.
- Ejecución en el borde sobre acelerador NPU vía runtime QNN en QCS6490.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Análisis de postura en tiempo real en dispositivos de borde: con 17,7 ms por inferencia en el QCS6490, el modelo permite procesar a decenas de FPS sobre vídeo de cámara sin depender de la nube, adecuado para kits de visión integrados.
- Gimnasia y fitness asistido: detección de keypoints para corregir la forma de un ejercicio en una aplicación empotrada, usando la confianza por keypoint para descartar articulaciones ocluidas.
- Seguridad laboral en entornos industriales: monitorización de posturas de riesgo (levantamiento de cargas, ergonomía) en cámaras fijas con procesamiento local, evitando enviar vídeo de trabajadores a servidores externos.
- Interacción persona-máquina sin contacto: control gestual o activación por pose en paneles y quioscos, donde la latencia de 17,7 ms permite respuesta percibida como inmediata.
- Telemetría deportiva en dispositivos portátiles: extracción de esqueletos por fotograma para métricas de movimiento, con el modelo ejecutándose en el propio dispositivo y solo transmitiendo las coordenadas.
- Validación de pipelines de despliegue en el borde: uso del dato fp32 como referencia para comparar contra variantes cuantizadas en el mismo QCS6490, y como caso de prueba de exportación ONNX con formato NCHW en flujos de Qualcomm AI Hub.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo de inferencia estimado | 17,7 ms (17.733 µs) |
| Entrada | 1 × 3 × 192 × 192 |
| Salida | 1 × 1 × 17 × 3 keypoints con confianza |
| Dispositivo | Dragonwing RB3 Gen 2 Vision Kit (QCS6490) |
| Runtime | QNN |
| Precisión | fp32 ONNX, compilación por defecto de AI Hub (sin cuantización explícita) |
| Fecha de medición | 2026-11-19 |

No se han publicado resultados de benchmarks de precisión (PCK, mAP, OKS) en la información disponible. El autor advierte que este punto fp32 no es directamente comparable con las entradas cuantizadas del `perf.yaml` upstream.

## Requisitos de hardware

- Hardware de referencia: Qualcomm QCS6490 en el kit Dragonwing RB3 Gen 2 Vision Kit, con aceleración NPU vía QNN.
- VRAM: no aplica; el despliegue es en SoC con memoria unificada. Consumo de memoria no disponible.
- GPU de escritorio: no disponible; el artefacto está orientado a NPU Qualcomm, no a CUDA.
- Inferencia en GPU de consumo: no disponible para este artefacto; el modelo upstream MoveNet puede ejecutarse en otras plataformas, pero no se aportan datos en esta tarjeta.
- Opciones de despliegue: Qualcomm AI Hub (compilación y perfilado), runtime QNN en dispositivo; exportación desde `qai-hub-models` 0.66.0 a ONNX.
- Latencia: 17,7 ms por grafo (estimación de perfilado, no extremo a extremo). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Contexto | Rendimiento en QCS6490 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MoveNet (esta medición) | Pose single-person, 17 keypoints | 192 × 192 NCHW | no aplica | 17,7 ms fp32 (estimado) | Apache-2.0 (upstream) | Solo mediciones; sin pesos en esta tarjeta |
| Variantes cuantizadas de MoveNet en `perf.yaml` 0.66.0 | Pose single-person | no disponible | no aplica | Listadas para RB3, valores no disponibles aquí | Apache-2.0 (upstream) | Referenciadas en el `perf.yaml` upstream |
| Otros modelos del barrido qcs-model-zoo | 14 categorías (28 modelos) | no disponible | no aplica | Medidos con el mismo protocolo | no disponible | Repositorio `qcs-model-zoo` |

No se dispone de datos de otros modelos de pose comparables (por ejemplo, BlazePose o RTMPose) en la información proporcionada.

## Limitaciones y advertencias

- La tarjeta no publica pesos ni artefactos compilados; solo números y método. No es utilizable directamente como modelo descargable.
- El dato de 17,7 ms es una estimación de perfilado por grafo, no una latencia extremo a extremo de aplicación; no debe usarse para dimensionar un producto sin medir el pipeline completo.
- El resultado es fp32 sin cuantización explícita y no es directamente comparable con las entradas cuantizadas del `perf.yaml` upstream para RB3.
- MoveNet es single-pose: no maneja múltiples personas en escena sin un detector previo.
- La exportación exige entradas NCHW; alimentar NHWC provoca fallo de exportación, según documenta el autor.
- Sesgos, riesgo de alucinación y limitaciones idiomáticas no aplican o no están documentados; el modelo puede fallar en poses extremas, oclusiones u orientaciones poco representadas en sus datos de entrenamiento, pero no se aportan datos concretos.
- Restricciones comerciales: la licencia upstream es Apache-2.0, pero esta tarjeta no otorga derechos sobre pesos que no distribuye; verificar la licencia del modelo original antes de uso comercial.

## Enlaces

- Tarjeta en Hugging Face: https://huggingface.co/anguoyang/movenet-qcs6490
- Repositorio de la colección medida: https://github.com/anguoyang/qcs-model-zoo
- Seguimiento del barrido completo: https://github.com/anguoyang/qcs-bench
