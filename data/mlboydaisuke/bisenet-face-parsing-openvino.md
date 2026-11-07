# mlboydaisuke/BiSeNet-Face-Parsing-OpenVINO

## Resumen

BiSeNet-Face-Parsing-OpenVINO es una conversión y empaquetado del modelo de segmentación facial BiSeNet publicado originalmente por litert-community en formato LiteRT (TFLite). El autor, mlboydaisuke, ha generado tres artefactos a partir de los pesos originales: un grafo ONNX (opset 17, convertido con tf2onnx 1.17.0), un modelo intermedio de OpenVINO en fp32 (formato IR, compuesto por `.xml` y `.bin`) y un blob precompilado para la NPU de Intel. El objetivo es ejecutar la segmentación facial en aceleradores Intel (NPU AI Boost, iGPU y CPU) y en GPUs NVIDIA mediante ONNX Runtime, sin necesidad de recurrir al intérprete de LiteRT.

El modelo resuelve la tarea de *face parsing*: asignar a cada píxel de una imagen de un rostro una etiqueta semántica correspondiente a una región facial (ojos, cejas, nariz, boca, labios, piel, pelo, orejas, cuello, etc.). Es un modelo de segmentación densa de tipo CNN, no un modelo generativo ni un LLM, por lo que no maneja contexto textual ni parámetros en el sentido habitual de los transformers.

Su relevancia actual radica en la portabilidad: el mismo grafo ONNX se ejecuta de forma verificada (coseno ≥ 0,9999 frente a la referencia en CPU) en NPU Intel, iGPU Intel, GPU NVIDIA y NPU Qualcomm, con latencias de entre 3,6 y 27,7 ms según el procesador. El repositorio ocupa 0,1 GB y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiSeNet (Bilateral Segmentation Network) para segmentación semántica en tiempo real; CNN con rama espacial y rama de contexto |
| Parametros totales | no disponible (pesos fp32: 52.577.964 bytes en `faceparsing.bin`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | fp32 (IR de OpenVINO y ONNX); blob NPU precompilado (27.766.913 bytes); fp16 solo como copia externa para CUDA EP (no incluida en el repo) |
| Idiomas soportados | no disponible (no aplica; modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (`.xml` + `.bin`), blob precompilado para Intel NPU |
| Tarea (pipeline) | image-segmentation (face parsing) |
| Modelo base | litert-community/BiSeNet-Face-Parsing-LiteRT (relación: quantized) |
| Tamaño del repositorio | 0,1 GB |
| Entrada / salida | tensores float32 de NumPy (formas definidas por el grafo; consultables en `compiled.inputs` / `sess.get_inputs()`) |

## Arquitectura y entrenamiento

BiSeNet (Bilateral Segmentation Network) es una arquitectura CNN diseñada para segmentación semántica en tiempo real. Su rasgo distintivo es la división en dos ramas: una rama espacial de alta resolución que preserva detalles finos de contorno y una rama de contexto que captura información semántica global, fusionadas posteriormente mediante un módulo de agregación de características. En el caso del face parsing, la salida es un mapa denso de etiquetas por píxel correspondiente a las regiones faciales.

No se dispone de información sobre el dataset de entrenamiento, el número de imágenes, el esquema de aumento de datos ni si se aplicaron técnicas de destilación o ajuste fino específico en la model card del repositorio. El autor indica únicamente que los pesos proceden de litert-community/BiSeNet-Face-Parsing-LiteRT y que la conversión se realizó con tf2onnx 1.17.0 a opset 17. La validación numérica del proceso de conversión sí está documentada: la salida del ONNX frente al `.tflite` original (intérprete LiteRT en CPU, misma entrada) alcanza un coseno ≥ 0,9999 en todas las salidas.

La innovación técnica del paquete no reside en el modelo en sí, sino en el pipeline de despliegue: generación de un blob precompilado para la NPU Intel con OpenVINO 2026.4.1 y driver NPU 32.0.100.4841, lo que elimina el coste de compilación en tiempo de carga (0,02 s de carga frente a 3,39 s al compilar el ONNX en la sesión de ONNX Runtime).

## Capacidades

- Segmentación densa de regiones faciales: ojos, cejas, nariz, boca, labios, piel, pelo, orejas, cuello y contorno del rostro (según la definición de clases del modelo base).
- Inferencia en tiempo real: latencias de 3,63 a 27,69 ms por ejecución según el procesador.
- Ejecución multiplataforma verificada: NPU Intel AI Boost, iGPU Intel, CPU Intel, GPU NVIDIA (CUDA EP) y NPU Qualcomm (QNN EP vía Qualcomm AI Hub).
- Compatibilidad con OpenVINO (`import_model` / `compile_model`) y con ONNX Runtime mediante el execution provider de OpenVINO o el de CUDA.
- Preprocesado y postprocesado a cargo del usuario: el modelo recibe tensores float32 de NumPy y devuelve tensores de puntuaciones por clase; no incluye utilidades de carga de imagen ni de visualización de máscaras.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural: es exclusivamente un modelo de visión.
- No dispone de modo *thinking*, visión general (solo rostros), audio ni capacidades multilingües.

## Casos de uso

- Desbloqueo y autenticación facial por componentes: la máscara de segmentación permite aislar regiones concretas (ojos, boca) para verificación de vivacidad o *liveness detection* en sistemas de acceso, ejecutándose en la NPU del portátil en 10,91 ms por fotograma.
- Edición fotográfica y retoque automático: separar piel, labios, ojos y pelo permite aplicar máscaras de maquillaje virtual, suavizado de piel o cambio de color de ojos en herramientas de edición, con latencia compatible con previsualización interactiva (3,63 ms en iGPU Intel).
- *Beauty filters* y efectos en videollamada: al ejecutarse en iGPU o NPU con latencias inferiores a 11 ms, el modelo puede procesar flujos de vídeo a 30-60 fps sin cargar la CPU ni la GPU dedicada, lo que reduce el consumo energético en portátiles.
- Preprocesado para pipelines de análisis facial: generar máscaras por región antes de modelos de reconocimiento de expresión, estimación de pose de cabeza o análisis dermatológico, evitando que el modelo posterior procese píxeles de fondo o pelo.
- Segmentación en dispositivos móviles y edge: los artefactos QNN permiten ejecutar el mismo ONNX en la NPU de un Snapdragon X2 Elite (4,22 ms con blob precompilado) o de un Galaxy S26 (3,91 ms), habilitando aplicaciones de cámara en tiempo real sin conexión.
- Generación de datasets sintéticos y aumentación de datos: usar las máscaras para recortar o recomponer regiones faciales en pipelines de entrenamiento de otros modelos, aprovechando el throughput alto en CPU (27,69 ms) para procesamiento por lotes.
- Integración en herramientas de videoconferencia o *streaming*: sustitución de fondo selectiva que respeta el contorno del pelo y las orejas gracias a la rama espacial de BiSeNet, desplegable vía OpenVINO en equipos con Core Ultra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de segmentación (mIoU, F1 por clase) en la información disponible. Sí se documentan mediciones de latencia y verificación numérica de salida frente a la referencia en CPU (ONNX Runtime CPU EP), con criterio PASS = coseno ≥ 0,99, sin NaN/Inf y concordancia top-1 ≥ 0,99.

| Procesador | Runtime | Fichero | Latencia (ms) | Carga (s) | Verificación |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob (`import_model`) | 10,91 | 0,02 | PASS (cos ≥ 0,9999) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` (compila al cargar) | 5,45 | 3,39 | PASS (cos ≥ 0,9999) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 3,63 | 1,29 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` (no incluida) | 3,86 | 1,18 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 4,44 | 1,24 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 27,69 | 0,21 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` compilado por AI Hub | 4,22 | 0,35 | no comparado |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, ONNX Runtime QNN EP | `.onnx` (compila al cargar) | 5,21 (3 capas en CPU) | 2,11 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` compilado por AI Hub | 3,91 | 0,19 | no comparado |

Medición realizada el 2026-11-07 en un MSI Stealth 16 AI+ (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711, alimentación de red), con una ejecución por proceso, 5 ejecuciones de calentamiento y mediana de 30 ejecuciones cronometradas (2 de calentamiento y 10 cronometradas cuando la primera supera los 3 s). Las filas de Snapdragon y Galaxy S26 son trabajos de perfilado de Qualcomm AI Hub con su propio temporizador y no se compararon numéricamente contra la referencia.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Formatos | Licencia | Rendimiento documentado |
|---|---|---|---|---|---|
| BiSeNet-Face-Parsing-OpenVINO | BiSeNet | Face parsing | ONNX, OpenVINO IR, blob NPU | MIT | 3,63-27,69 ms según procesador (ver tabla) |
| litert-community/BiSeNet-Face-Parsing-LiteRT | BiSeNet | Face parsing | LiteRT/TFLite | MIT (heredada) | no disponible en la información proporcionada |
| yakhyo/face-parsing | BiSeNet con backbone alternativo | Face parsing | no disponible | no disponible | no disponible |

La información disponible no incluye métricas de calidad (mIoU, F1) que permitan comparar la precisión de estos modelos entre sí. La comparación se limita a formato, licencia y latencia publicada. El modelo de yakhyo/face-parsing se cita como alternativa de la misma familia arquitectónica, pero no se dispone de sus especificaciones completas.

## Limitaciones y advertencias

- El blob NPU está compilado para OpenVINO 2026.4.1 y driver Intel NPU 32.0.100.4841; en otra versión de driver o de OpenVINO, `import_model` puede rechazarlo y es necesario compilar el IR en la máquina destino (`core.compile_model("openvino/faceparsing.xml", "NPU")`), lo que añade varios segundos de carga.
- No se documentan métricas de calidad de segmentación: no hay mIoU ni F1 por clase, por lo que no es posible evaluar la precisión real frente a otros modelos de face parsing sin ejecutar una validación propia.
- El modelo está especializado en rostros; no es un segmentador semántico general y probablemente degrade en imágenes sin caras, caras ocluidas, perfiles extremos o iluminación muy adversa (no verificado en la información disponible).
- El repositorio no incluye scripts de preprocesado (redimensionado, normalización) ni de postprocesado (argmax, paleta de colores); el usuario debe implementarlos y garantizar que coinciden con los del modelo base LiteRT.
- No hay información sobre sesgos demográficos del modelo base (tono de piel, género, edad); al tratarse de un modelo de segmentación facial, estos sesgos pueden afectar a la equidad en aplicaciones de autenticación o análisis.
- La licencia MIT permite uso comercial, pero se hereda del modelo base; conviene verificar que litert-community/BiSeNet-Face-Parsing-LiteRT mantiene efectivamente MIT y no impone restricciones adicionales sobre los pesos originales.
- Las latencias publicadas corresponden a un hardware concreto (Core Ultra 9 386H, RTX 5080 Laptop a 95 W) y a un método de medición específico; no deben extrapolarse sin validación a otros equipos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación comunitaria ni informes independientes de fallos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/BiSeNet-Face-Parsing-OpenVINO
- Modelo base (LiteRT): https://huggingface.co/litert-community/BiSeNet-Face-Parsing-LiteRT/tree/62996ba4ebcfd9a44b45f1dd5325dcd7e4f09955
- Scripts, registros y tabla comparativa de los 52 grafos de LiteRT-Models: https://github.com/john-rocky/windows-zoo
- Implementación alternativa de face parsing basada en BiSeNet: https://github.com/yakhyo/face-parsing
- Página del proyecto de face parsing de yakhyo: https://yakhyo.github.io/face-parsing/
