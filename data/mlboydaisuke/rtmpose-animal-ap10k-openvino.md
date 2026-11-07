# mlboydaisuke/RTMPose-Animal-AP10K-OpenVINO

## Resumen

RTMPose-Animal-AP10K-OpenVINO es una conversión y empaquetado del modelo de estimación de pose animal RTMPose, originalmente distribuido por litert-community como `RTMPose-Animal-AP10K-LiteRT` (formato TensorFlow Lite). El autor, mlboydaisuke, lo ha reconvertido a ONNX (opset 17) y a OpenVINO IR en fp32, y ha generado además un blob precompilado para la NPU de Intel (Intel AI Boost). El modelo detecta keypoints de animales sobre imágenes, siguiendo el esquema de anotación del benchmark AP-10K.

El interés del artefacto no está en la arquitectura del modelo en sí (heredada del RTMPose original) sino en la cadena de despliegue: ofrece tres formatos listos para producción (ONNX, OpenVINO IR y blob NPU) con mediciones de latencia reproducibles sobre hardware Intel Core Ultra, GPU integrada, RTX 5080 Laptop y NPU Snapdragon. El blob para NPU Intel ejecuta una inferencia en 1,76 ms (entrada y salida NumPy), lo que lo hace apto para pipelines de visión en tiempo real en portátiles.

Se trata de un modelo pequeño (repo de 0,1 GB, ONNX de ~55 MB) bajo licencia Apache-2.0, orientado a keypoint detection y no a generación de texto: no es un LLM y no tiene contexto, tokenizador ni capacidades lingüísticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RTMPose (estimación de pose por keypoints; red convolucional, detalles exactos no disponibles en la información proporcionada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | fp16 (origen LiteRT), fp32 (OpenVINO IR), blob NPU precompilado; ONNX en fp16 |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (.xml/.bin), blob NPU Intel (.blob) |
| Tarea (pipeline) | keypoint-detection |
| Dataset de referencia | AP-10K (10.015 imágenes, 23 familias, 60 especies) |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo base es RTMPose aplicado a pose animal, según la nomenclatura del repositorio de origen (`RTMPose-Animal-AP10K-LiteRT`). La información proporcionada no detalla el número de capas, el backbone exacto ni la configuración de entrenamiento; únicamente se indica que el punto de partida es un modelo LiteRT en fp16 (`rtm_animal_fp16`) y que el proceso de conversión se realizó con tf2onnx 1.17.0 (opset 17). No se dispone de datos sobre el número de tokens, composición del dataset de entrenamiento ni si hubo etapas de ajuste fino más allá del entrenamiento original sobre AP-10K.

La innovación técnica relevante de este artefacto es el empaquetado para aceleradores: se incluye un blob de NPU Intel compilado con OpenVINO 2026.4.1 y driver NPU 32.0.100.4841, que evita la compilación en tiempo de carga. El autor documenta además una validación de salidas frente a la referencia CPU en fp32 (coseno ≥ 0,99 y acuerdo de argmax ≥ 0,99 para las puntuaciones de clase), con resultados que fallan parcialmente en NPU y en la ruta CUDA fp16 (acuerdo de argmax 15/17 y 16/17 en algunas salidas), lo que indica una pérdida de fidelidad numérica en esos caminos.

## Capacidades

- Detección de keypoints de animales sobre imágenes, con el esquema de puntos de AP-10K.
- Salida de múltiples tensores: puntuaciones de clase y coordenadas de keypoints (las salidas `output_0_output` y `output_1_output` se evalúan por separado en la model card).
- Inferencia en CPU, GPU integrada Intel, NPU Intel AI Boost, GPU NVIDIA (vía CUDA EP) y NPU Qualcomm (vía QNN EP / Qualcomm AI Hub).
- Ejecución mediante OpenVINO (Python API) y ONNX Runtime con execution providers (OpenVINO EP, CUDA EP, CPU EP, QNN EP).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general (VLM) ni audio.

## Casos de uso

- Monitorización de ganado en explotaciones: el modelo permite estimar la postura de animales (vacuno, ovino, équidos) a partir de imágenes de cámara fija, y su latencia de 1,76 ms en NPU Intel permite procesar varios flujos de vídeo por dispositivo sin GPU dedicada.
- Análisis de comportamiento animal en investigación etológica: la salida de keypoints se puede postprocesar para calcular ángulos articulares y clasificar conductas (de pie, echado, cojera), usando el modelo como extractor de características en un pipeline de visión clásico.
- Detección de cojeras y alteraciones de marcha en caballos o vacas: la estimación de keypoints de las extremidades sirve de entrada a un clasificador aguas abajo; el modelo ONNX se integra en un servicio de inferencia con ONNX Runtime y CUDA EP en estaciones con RTX.
- Aplicaciones móviles y de borde en dispositivos Snapdragon: con 0,86–0,94 ms por inferencia en NPU Snapdragon X2 Elite y Galaxy S26 (según Qualcomm AI Hub), es viable la inferencia en el propio dispositivo para apps de campo sin conectividad.
- Automatización de análisis de fauna en cámaras trampa: el modelo puede filtrar y anotar imágenes de especies animales en lotes; su tamaño (ONNX de ~55 MB) permite desplegarlo en mini-PC con CPU Intel y OpenVINO sin GPU.
- Docencia y prototipado de pose estimation: al incluir ONNX, IR y blob con scripts y mediciones reproducibles, sirve como base para comparar aceleradores (CPU vs iGPU vs NPU vs GPU) en un mismo modelo y entrada.
- Integración en sistemas de visión industrial con NPU Intel: el blob precompilado elimina la compilación en el arranque (0,03 s de carga), útil en despliegues embebidos con requisitos de arranque rápido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (AP, PCK, etc.) en la información disponible. La model card sí incluye mediciones de latencia y verificación de salidas, que se reproducen a continuación.

| Procesador | Runtime | Fichero | Latencia (ms) | Carga (s) | Verificación de salida |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob NPU (`import_model`) | 1,76 | 0,03 | FAIL: argmax 15/17 en ambas salidas |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 1,95 | 2,90 | FAIL: argmax 15/17 en ambas salidas |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 1,56 | 1,09 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` | 3,94 | 1,16 | FAIL: argmax 16/17 y 15/17 |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 4,17 | 1,15 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 7,98 | 0,14 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN precompilado | `.onnx` | 0,94 | 0,35 | no comparado |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, ONNX Runtime QNN EP | `.onnx` | 0,94 | 1,04 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN precompilado | `.onnx` | 0,86 | 0,16 | no comparado |

El ONNX se validó además contra el `.tflite` original con el intérprete LiteRT en CPU: PASS con coseno ≥ 0,9999 en todas las salidas. Las mediciones se realizaron en un MSI Stealth 16 AI+ (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711), con mediana de 30 ejecuciones tras 5 de calentamiento.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el ONNX ocupa 54,9 MB y el blob NPU 28,6 MB, por lo que la huella de memoria es muy reducida (del orden de decenas de MB en fp16/fp32).
- GPU recomendadas: RTX 5080 Laptop medida a 95 W (4,17 ms con CUDA EP en fp32); GPU integrada Intel (1,56 ms con OpenVINO EP). No se han publicado mediciones para A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo: el tamaño del modelo (decenas de MB) no supone restricción de VRAM en tarjetas consumer.
- Aceleradores específicos: NPU Intel AI Boost (blob precompilado, 1,76 ms), NPU Snapdragon X2 Elite (0,94 ms) y NPU Galaxy S26 (0,86 ms).
- Opciones de despliegue: OpenVINO 2026.4.1 (API Python, `import_model` o `compile_model`), ONNX Runtime 1.31.1 con OpenVINO EP 1.8.1, CUDA EP, CPU EP y QNN EP; Qualcomm AI Hub para perfiles en Snapdragon.
- Latencia: entre 0,86 ms (NPU móvil) y 7,98 ms (CPU Core Ultra 9 386H) según el acelerador; el throughput no se publica, pero a 1,76 ms por inferencia en NPU Intel el límite teórico es de unas 568 inferencias por segundo en un solo hilo de ejecución.
- Nota de compatibilidad: el blob NPU solo es válido para OpenVINO 2026.4.1 y driver NPU 32.0.100.4841; en otras versiones debe recompilarse el IR.

## Comparativa con modelos similares

No se dispone de datos de otros modelos de pose animal en la información proporcionada para establecer una comparativa cuantitativa fiable. Se indican a continuación los artefactos relacionados directamente mencionados:

| Modelo | Formato | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| RTMPose-Animal-AP10K-OpenVINO (este) | ONNX, OpenVINO IR, blob NPU | Keypoint detection animal | Apache-2.0 | Hugging Face |
| litert-community/RTMPose-Animal-AP10K-LiteRT | TFLite (fp16) | Keypoint detection animal | Apache-2.0 | Hugging Face |
| Modelos de pose humana representativos evaluados en AP-10K | no disponible | Pose estimation | no disponible | paper AP-10K |

El paper de AP-10K evalúa modelos de pose humana sobre el benchmark animal, pero la información proporcionada no incluye cifras concretas de esos resultados, por lo que no se ofrece comparación numérica.

## Limitaciones y advertencias

- El modelo es un detector de keypoints, no un modelo generativo: no procesa texto ni mantiene conversaciones; cualquier caso de uso lingüístico queda fuera de su alcance.
- Pérdida de fidelidad numérica en NPU Intel y en CUDA fp16: la verificación de salidas falla con acuerdo de argmax de 15/17 en ambas salidas (NPU) y 16/17 y 15/17 (CUDA fp16), frente al criterio de PASS (≥ 0,99). En aplicaciones sensibles a la clase predicha conviene validar el impacto o usar la ruta que pasa la verificación (iGPU o CUDA fp32).
- El blob NPU está atado a OpenVINO 2026.4.1 y al driver NPU 32.0.100.4841; en otros entornos `import_model` puede rechazarlo y hay que recompilar el IR.
- El modelo se entrenó sobre AP-10K (60 especies de 23 familias); el rendimiento en especies no representadas en ese dataset no está documentado.
- No se han publicado métricas de precisión (AP/PCK) en la información disponible, por lo que no es posible cuantificar su exactitud frente a alternativas.
- Licencia Apache-2.0: permite uso comercial y modificación, pero se recomienda conservar los avisos de licencia y atribución del modelo base.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de keypoints espurios en imágenes con oclusiones, animales parcialmente visibles o especies atípicas; no hay datos publicados sobre este comportamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 2026-11-07, por lo que no cuenta aún con validación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/RTMPose-Animal-AP10K-OpenVINO
- Modelo base LiteRT: https://huggingface.co/litert-community/RTMPose-Animal-AP10K-LiteRT
- Repositorio con scripts y mediciones (windows-zoo): https://github.com/john-rocky/windows-zoo
- Benchmark AP-10K (GitHub): https://github.com/AlexTheBad/AP-10K
- Paper AP-10K (DeepAI): https://deepai.org/publication/ap-10k-a-benchmark-for-animal-pose-estimation-in-the-wild
