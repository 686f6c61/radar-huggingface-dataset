# anguoyang/yolo11n

## Resumen

YOLOv11-N es la variante "nano" de la familia YOLOv11 de Ultralytics, un detector de objetos de una sola etapa pensado para inferencia en tiempo real en dispositivos con recursos limitados. Este repositorio concreto (`anguoyang/yolo11n`) no distribuye pesos ni código: es una receta de documentación que recoge las mediciones de latencia del modelo sobre hardware Qualcomm real (RB3 Gen 2 con QCS6490 y Galaxy S25 con SM8750) a través de Qualcomm AI Hub Workbench, junto con los ajustes de versión, calibración y los errores encontrados en el proceso.

El dato central es la diferencia de rendimiento según la ruta de ejecución: en el RB3 Gen 2, la ruta TFLite por defecto tarda 134,7 ms con solo 19 de 343 capas en la NPU, mientras que la ruta QNN precompilada w8a8 tarda 5,03 ms con las 341 capas en la NPU. Es el mismo modelo y el mismo chip, con una diferencia de 27× atribuible exclusivamente al runtime y a la colocación de capas.

La relevancia práctica es doble: por un lado, confirma que el modelo es viable en edge con la ruta correcta; por otro, documenta los pitfalls (fallos de compilación sin diagnóstico, trampas del formato DLC, requisitos de cuantización) que no suelen aparecer en los blogs de los fabricantes. El modelo base es AGPL-3.0 y los pesos deben obtenerse de Ultralytics o de la receta oficial de Qualcomm.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN de detección de objetos de una etapa (familia YOLOv11, Ultralytics); exportada a ONNX opset 13, entrada 1×3×640×640, salida 1×84×8400 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | w8a8 QDQ (verificado), w8a16 QDQ (falla la compilación), FP32 (verificado en S25, falla en RB3 Gen 2), float TFLite |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no se distribuyen pesos en este repositorio; el flujo usa ONNX (opset 13) y artefactos QNN/TFLite generados con `qai-hub-models==0.66.0` |

## Arquitectura y entrenamiento

El modelo es un detector YOLOv11 en su variante nano, una CNN de una sola etapa que predice cajas y clases directamente sobre una rejilla, sin etapa de propuestas. La exportación documentada usa ONNX opset 13 con entrada fija de 1×3×640×640 y salida 1×84×8400 (4 coordenadas de caja más 80 clases COCO por cada una de las 8400 predicciones). No se detalla en la información disponible la composición del dataset de entrenamiento ni si hubo etapas de ajuste fino posteriores al entrenamiento original de Ultralytics.

La innovación técnica documentada no está en el modelo sino en el pipeline de despliegue: exportación a ONNX, cuantización w8a8 en Qualcomm AI Hub, compilación como QNN precompilado para el dispositivo objetivo y perfilado con lectura de la colocación de capas por capa. La receta fija la versión `qai-hub-models==0.66.0` y los dispositivos sobre los que se midió (Dragonwing RB3 Gen 2 Vision Kit y Samsung Galaxy S25) para garantizar reproducibilidad.

## Capacidades

- Detección de objetos en imágenes: 80 clases del conjunto COCO, con salida de cajas delimitadoras y puntuaciones de confianza.
- Inferencia en tiempo real en dispositivos edge con aceleración NPU (Qualcomm Hexagon) mediante la ruta QNN.
- Ejecución en GPU y CPU como fallback cuando la NPU no admite ciertas capas (caso de la ruta TFLite float en QCS6490).
- Despliegue en dos generaciones de SoC Qualcomm documentadas: QCS6490 (RB3 Gen 2) y SM8750 (Galaxy S25).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un modelo de visión.
- No dispone de modo "thinking", visión generativa, audio ni otras capacidades multimodales más allá de la detección sobre imagen.

## Casos de uso

- Detección de objetos en tiempo real en cámaras industriales o de vigilancia sobre RB3 Gen 2: con la ruta QNN w8a8 a 5,03 ms por inferencia (unos 200 FPS teóricos), el modelo puede procesar flujos de vídeo a 30 FPS con margen amplio en el propio dispositivo, sin enviar datos a la nube.
- Procesamiento en dispositivos móviles de gama alta (Galaxy S25): la ruta TFLite float a 2,94 ms y la QNN FP32 a 2,97 ms permiten integrar detección en aplicaciones Android con la NPU al completo (343/343 capas en TFLite, 341/341 en QNN FP32).
- Selección de la ruta de despliegue en proyectos edge: la receta sirve como guía para decidir entre TFLite y QNN precompilado según el chip, evitando el fallback silencioso a CPU/GPU que multiplica la latencia por 27 en QCS6490.
- Automatización de líneas de control de calidad: detección de defectos o piezas en cadenas de producción con modelos COCO o ajustados, desplegados en hardware Qualcomm de bajo consumo.
- Robots móviles y drones con presupuesto energético limitado: el modelo nano y la NPU del QCS6490 permiten detección a bordo sin penalizar la autonomía.
- Reproducción y auditoría de benchmarks de edge AI: el repositorio incluye `measurements.json` y los IDs de trabajo de Workbench, lo que permite a un equipo de ingeniería verificar las cifras y reutilizar la metodología de perfilado por capas en sus propios modelos.

## Benchmarks y rendimiento

Mediciones de latencia sobre hardware real vía Qualcomm AI Hub Workbench (latencia = estimación de perfilado / mediana):

| Dispositivo | Ruta | Resultado | Capas en NPU | Latencia (est / mediana) |
|---|---|---|---|---|
| RB3 Gen 2 (QCS6490) | QNN precompilado, w8a8 QDQ | Correcto | 341 / 341 | 5,03 / 6,03 ms |
| RB3 Gen 2 (QCS6490) | TFLite, float | Funciona, mayormente fuera de NPU | 19 / 343 (GPU 168, CPU 156) | 134,7 / 160,3 ms |
| RB3 Gen 2 (QCS6490) | QNN DLC, FP32 | Falla en dispositivo | — | error `MODEL_GRAPH_ERROR` al componer el grafo |
| RB3 Gen 2 (QCS6490) | QNN precompilado, w8a16 QDQ | Falla la compilación | — | `exit code 14` sin diagnóstico |
| Galaxy S25 (SM8750) | TFLite, float | Correcto | 343 / 343 | 2,94 / 2,99 ms |
| Galaxy S25 (SM8750) | QNN precompilado, FP32 | Correcto | 341 / 341 | 2,97 / 3,02 ms |

Precisión: el autor cita COCO mAP 39,5 como cifra publicada por Ultralytics, sin re-medición propia. La calibración de la ruta w8a8 se realizó con 24 muestras sintéticas aleatorias, por lo que la precisión de detección de esa celda no se verificó; Qualcomm lista 4,10 ms para este modelo en RB3 Gen 2 con calibración real.

## Requisitos de hardware

- VRAM: no disponible; el modelo se ejecuta en NPU/GPU/CPU integradas de SoC Qualcomm, no en GPUs dedicadas con memoria propia.
- Hardware verificado: Dragonwing RB3 Gen 2 Vision Kit (QCS6490) y Samsung Galaxy S25 (SM8750).
- No cabe ni está pensado para GPUs de escritorio tipo A100, H100 o RTX 4090; el objetivo es edge.
- Despliegue mediante Qualcomm AI Hub Workbench con `qai-hub-models==0.66.0` y token de API; la ruta QNN precompilada requiere cuantización previa (w8a8) y compilación específica por dispositivo.
- Latencia medida: 5,03 ms (w8a8 QNN en RB3 Gen 2) y 2,94–3,02 ms (S25 en TFLite float o QNN FP32).
- Throughput estimado: no disponible de forma explícita; a partir de la latencia mediana de 6,03 ms en RB3 Gen 2 se infieren del orden de 165 inferencias por segundo en el mejor caso, sin contabilizar el resto del pipeline.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento edge documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOv11-N (este repositorio) | no disponible | 640×640, salida 1×84×8400 | 5,03 ms en RB3 Gen 2 (QNN w8a8); 2,94 ms en S25 | AGPL-3.0 | Pesos en Ultralytics; receta en Qualcomm AI Hub |
| NanoDet | no disponible | no disponible | Receta propia del autor con 23 imágenes COCO val2017 para calibración; cifras no incluidas en esta información | no disponible | Repositorio del autor |
| DAMO-YOLO | no disponible | no disponible | Receta propia del autor con 23 imágenes COCO val2017 para calibración; cifras no incluidas en esta información | no disponible | Repositorio del autor |
| YOLOv11-N (catálogo oficial Qualcomm) | no disponible | 640×640 | 4,10 ms en RB3 Gen 2 con calibración real | AGPL-3.0 | Qualcomm AI Hub |

La comparativa se limita a los modelos mencionados en la información disponible; no se aportan parámetros ni contextos de las alternativas.

## Limitaciones y advertencias

- Este repositorio no contiene pesos ni código: es documentación y datos de medición. Cualquier uso productivo requiere obtener los pesos de Ultralytics o de la receta oficial de Qualcomm.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte para uso en red y distribución; revisar compatibilidad antes de integrar en productos comerciales cerrados.
- La calibración w8a8 se hizo con 24 muestras sintéticas aleatorias; la precisión de detección de esa ruta no está verificada y podría degradarse frente a una calibración con datos reales.
- La ruta TFLite float en QCS6490 funciona pero coloca solo 19 de 343 capas en la NPU, con latencia 27× superior; es fácil desplegarla por error si no se inspecciona el perfil por capas.
- El formato QNN DLC FP32 compila en host pero falla al componer el grafo en el dispositivo (`MODEL_GRAPH_ERROR`); éxito de compilación no garantiza ejecución.
- La compilación w8a16 precompilada falla con `exit code 14` sin diagnóstico accionable (incidencia reportada en ai-hub-models#364).
- El RB3 Gen 2 exige cuantizar antes de compilar la ruta QNN precompilada; el FP32 se rechaza.
- El rendimiento no es extrapolable entre generaciones de Snapdragon: el mismo grafo float es all-NPU en SM8750 y mayormente CPU en QCS6490.
- Sesgos y alucinaciones: no aplica en el sentido de modelos de lenguaje, pero el detector hereda los sesgos del dataset COCO (clases y contextos sobrerrepresentados) y puede producir falsos positivos en escenas fuera de distribución.
- No hay información sobre idiomas, contexto textual ni capacidades de lenguaje porque el modelo no las tiene.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anguoyang/yolo11n
- Bench completo del autor: https://github.com/anguoyang/qcs-bench
- Ultralytics (pesos y código del modelo): https://github.com/ultralytics/ultralytics
- Receta oficial de Qualcomm para yolov11_det: https://github.com/qualcomm/ai-hub-models
- Incidencia reportada sobre el fallo w8a16: https://github.com/qualcomm/ai-hub-models/issues/364
- Perfil del autor: https://huggingface.co/anguoyang
