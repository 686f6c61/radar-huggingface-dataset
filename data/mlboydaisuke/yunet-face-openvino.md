# mlboydaisuke/YuNet-Face-OpenVINO

## Resumen

YuNet-Face-OpenVINO es una conversión del detector facial YuNet, originalmente distribuido en formato LiteRT/TFLite por el repositorio litert-community/YuNet-Face-LiteRT, a formatos compatibles con el ecosistema de inferencia de Intel: ONNX (opset 17, generado con tf2onnx 1.17.0), OpenVINO IR con pesos fp32 y un blob NPU precompilado. El autor, mlboydaisuke, publica el paquete como artefacto listo para ejecutarse en la NPU integrada (Intel AI Boost), la GPU integrada y la CPU de procesadores Intel Core Ultra, así como en GPUs NVIDIA mediante ONNX Runtime con el execution provider CUDA.

El modelo resuelve un problema muy concreto: desplegar detección facial de baja latencia en hardware Intel sin necesidad de recompilar ni de disponer de toolchains propietarias. El blob precompilado para NPU elimina el coste de compilación en el arranque y permite latencias de 1,56 ms por inferencia en una Core Ultra 9 386H, con una verificación de salida que compara cada resultado contra la referencia fp32 en CPU (coseno ≥ 0,9999). Es, por tanto, una pieza de infraestructura más que un modelo nuevo: no aporta pesos entrenados desde cero, sino un pipeline de conversión y validación reproducible.

La relevancia actual reside en la creciente disponibilidad de NPUs en portátiles y dispositivos de borde, y en la escasez de artefactos precompilados y verificados numéricamente para esas unidades. El repositorio incluye además scripts y registros crudos del benchmark completo de 52 grafos de LiteRT-Models en el proyecto windows-zoo del mismo autor, lo que facilita la reproducibilidad. El tamaño del repositorio es de 0,0 GB según Hugging Face, coherente con un modelo de detección facial extremadamente compacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN ligera para detección facial (YuNet); no disponible el detalle de capas en la información proporcionada |
| Parametros totales | no disponible (el ONNX ocupa 433.765 bytes, el IR fp32 891.190 bytes entre .xml y .bin) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | fp16 en el origen (yunet_fp16); IR OpenVINO con pesos fp32; blob NPU precompilado |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (.xml + .bin), blob NPU precompilado (.blob) |

## Arquitectura y entrenamiento

YuNet es una red convolucional ligera diseñada específicamente para detección de rostros, con un diseño optimizado para velocidad y para su integración en OpenCV (módulo FaceDetectorYN). El modelo original reporta 0,834 AP en WIDER Face easy, 0,824 en medium y 0,708 en hard sobre el conjunto de validación, según la documentación de opencv_zoo. La información proporcionada no detalla el número de capas, los canales ni la composición exacta del dataset de entrenamiento más allá de la referencia a WIDER Face como benchmark de evaluación.

Esta ficha corresponde a una conversión, no a un reentrenamiento: el autor parte de yunet_fp16 del repositorio litert-community/YuNet-Face-LiteRT, lo convierte a ONNX con tf2onnx 1.17.0 en opset 17, genera el IR de OpenVINO con pesos fp32 y compila un blob para la NPU con OpenVINO 2026.4.1 y el driver Intel NPU 32.0.100.4841 (NPU_DRIVER_VERSION 1004841, NPU_COMPILER_VERSION 524292). La validación numérica compara cada salida contra la salida fp32 en CPU de ONNX Runtime: se exige coseno ≥ 0,99, ausencia de NaN/Inf y coincidencia top-1 ≥ 0,99 en las puntuaciones de clase; el ONNX frente al .tflite original alcanza coseno ≥ 0,9999 en todas las salidas. No se documenta ningún proceso de RLHF, DPO ni ajuste fino adicional.

## Capacidades

- Detección de rostros en imágenes: el pipeline es object-detection, con salidas de cajas, puntuaciones y puntos clave faciales (landmarks) según el diseño de YuNet.
- Inferencia de baja latencia en NPU Intel: 1,56 ms por ejecución con el blob precompilado, sin coste de compilación en el arranque (load 0,00 s).
- Ejecución multiplataforma dentro del ecosistema Intel: NPU (AI Boost), GPU integrada (Intel Graphics) y CPU, mediante OpenVINO u ONNX Runtime con el execution provider OpenVINO.
- Ejecución en GPU NVIDIA mediante ONNX Runtime con CUDA EP (2,83 ms en fp32, 6,19 ms en fp16 sobre una RTX 5080 Laptop a 95 W).
- Compatibilidad con Qualcomm AI Hub: los mismos archivos ONNX se perfilan en NPU Snapdragon X2 Elite (1,32 ms con QNN precompilado) y Galaxy S26 (1,29 ms).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de visión para detección.
- No se documentan capacidades multilingües ni modos especiales como thinking, visión general o audio.

## Casos de uso

- Desbloqueo facial en portátiles con NPU Intel: el blob precompilado se importa directamente en la NPU y ejecuta la detección en 1,56 ms, lo que permite un bucle de captura y verificación a la frecuencia de la cámara sin penalización perceptible.
- Videoconferencia con seguimiento y encuadre automático: la detección a 1,58 ms en la GPU integrada permite procesar cada fotograma de una webcam 1080p a 30 fps (33 ms de presupuesto) con margen amplio para el resto del pipeline.
- Preprocesado en pipelines de reconocimiento facial: las cajas y landmarks que produce YuNet sirven como etapa de detección y alineación antes de un modelo de embeddings, ejecutándose en la misma NPU y liberando la CPU.
- Control de acceso y kioscos en el borde: el modelo cabe en un blob de 794.830 bytes y se ejecuta en 1,29 ms en la NPU de un Galaxy S26, lo que habilita despliegues en dispositivos móviles sin conexión a la nube.
- Anonimización automática de vídeo: detección de rostros por fotograma en CPU (3,10 ms) o iGPU para aplicar desenfoque en herramientas de edición o en pipelines de publicación, con verificación numérica frente a la referencia fp32.
- Procesamiento por lotes de archivos de imagen: al ser un modelo de 433 KB en ONNX, se puede desplegar en contenedores ligeros o funciones serverless para indexar y etiquetar bibliotecas fotográficas.
- Prototipado e integración con OpenCV: al ser el mismo modelo que usa FaceDetectorYN de OpenCV, sirve para validar en OpenVINO el comportamiento esperado antes de migrar a producción con OpenCV o viceversa.

## Benchmarks y rendimiento

Datos de latencia y verificación de salida publicados por el autor (MSI Stealth 16 AI+, Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711, 2026-11-06 a 2026-11-07; mediana de 30 ejecuciones tras 5 de calentamiento):

| Procesador | Runtime | Archivo | ms | Carga (s) | Verificación |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob NPU (import_model) | 1,56 | 0,00 | PASS (cos ≥ 0,9999) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | .onnx | 1,76 | 1,06 | PASS (cos ≥ 0,9999) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | .onnx | 1,58 | 0,42 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | .onnx fp16 | 6,19 | 1,20 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | .onnx | 2,83 | 1,22 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | .onnx | 3,10 | 0,12 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN precompilado | .onnx | 1,32 | 0,46 | no comparado |
| Snapdragon X2 Elite NPU | ONNX Runtime QNN EP | .onnx | 2,04 (2 capas en CPU) | 1,11 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN precompilado | .onnx | 1,29 | 0,14 | no comparado |

Precisión de detección del modelo YuNet original (WIDER Face validation): AP 0,834 (easy), 0,824 (medium), 0,708 (hard), según la documentación de opencv_zoo. No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) porque no aplican a un modelo de detección facial.

## Requisitos de hardware

- VRAM/espacio en memoria: el ONNX ocupa 433.765 bytes; el IR fp32, 891.190 bytes (.xml de 595.362 + .bin de 295.828); el blob NPU, 794.830 bytes. La huella de memoria es inferior a 1 MB en disco y mínima en ejecución, sin necesidad de GPU dedicada.
- NPU Intel: requiere OpenVINO 2026.4.1 y driver Intel NPU 32.0.100.4841 para importar el blob; con otro driver o versión, recompilar el IR con `core.compile_model("openvino/yunet_fp16.xml", "NPU")`.
- GPU integrada Intel: funciona a través de ONNX Runtime 1.31.1 con onnxruntime-ep-openvino 1.8.1 (1,58 ms).
- CPU: cualquier CPU x86 con ONNX Runtime 1.31.1 y CPU EP (3,10 ms en Core Ultra 9 386H).
- GPU NVIDIA: RTX 5080 Laptop a 95 W da 2,83 ms en fp32 y 6,19 ms en fp16 con CUDA EP; el fp16 es más lento que el fp32 en este caso concreto.
- Cabe en cualquier GPU de consumo y en hardware de borde; no requiere A100 ni H100.
- Opciones de despliegue: OpenVINO (Python API, import_model o compile_model), ONNX Runtime con OpenVINO EP o CUDA EP, Qualcomm AI Hub para NPU Snapdragon, y presumiblemente OpenCV DNN al ser el mismo modelo que FaceDetectorYN (no confirmado en la información).
- Throughput estimado: a 1,56 ms por inferencia en NPU, el límite teórico es de unas 641 inferencias por segundo en un solo hilo de ejecución, sin contabilizar el preprocesado de imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (WIDER Face) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YuNet-Face-OpenVINO (esta ficha) | no disponible (ONNX 433 KB) | no aplica | 0,834 / 0,824 / 0,708 AP (easy/medium/hard) | BSD-3-Clause | Hugging Face, formatos ONNX/IR/blob |
| opencv/face_detection_yunet | no disponible | no aplica | mismas cifras (es el modelo upstream) | no disponible en la información | Hugging Face, integrado en OpenCV |
| litert-community/YuNet-Face-LiteRT | no disponible | no aplica | no disponible | BSD-3-Clause | Hugging Face, formato LiteRT/TFLite |
| ShiqiYu/libfacedetection | no disponible | no aplica | no disponible | no disponible | Repositorio GitHub (no Hugging Face) |

Los tres primeros son esencialmente el mismo modelo en distintos formatos; la diferencia práctica es el runtime objetivo (OpenVINO/NPU frente a OpenCV o LiteRT). No se dispone en la información proporcionada de comparativas con otros detectores faciales ligeros (por ejemplo, RetinaFace o BlazeFace) en parámetros, latencia o precisión.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes; cualquier expectativa en ese sentido es un error de categoría.
- El blob NPU está compilado para OpenVINO 2026.4.1 y driver Intel NPU 32.0.100.4841; en otras versiones `import_model` puede rechazarlo y hay que recompilar el IR, con el coste de carga asociado.
- El rendimiento medido corresponde a un equipo concreto (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11); no se garantizan las mismas latencias en otro hardware.
- Las filas de Snapdragon y Galaxy S26 provienen de trabajos de perfilado de Qualcomm AI Hub con su propio temporizador y no se compararon numéricamente contra la referencia fp32, por lo que su corrección no está verificada en esta ficha.
- El modelo detecta rostros; no identifica personas ni genera embeddings. Usarlo para reconocimiento requiere un modelo adicional.
- No se documentan sesgos, tasas de falsos positivos por demografía ni comportamiento en condiciones de oclusión o iluminación extrema; la evaluación disponible se limita a las cifras agregadas de WIDER Face.
- Licencia BSD-3-Clause, permisiva para uso comercial, pero se debe conservar el aviso de copyright y la cláusula de no respaldo; conviene verificar la licencia del modelo upstream ShiqiYu/libfacedetection, no detallada en la información.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 2026-11-07; es un artefacto reciente y sin validación comunitaria independiente.
- El tamaño del repositorio aparece como 0.0 GB en Hugging Face, lo que puede deberse al redondeo; los tamaños reales de cada archivo se detallan en la tabla de especificaciones.

## Enlaces

- Hugging Face: https://huggingface.co/mlboydaisuke/YuNet-Face-OpenVINO
- Modelo base LiteRT: https://huggingface.co/litert-community/YuNet-Face-LiteRT
- Repositorio de scripts y benchmarks: https://github.com/john-rocky/windows-zoo
- YuNet en OpenCV Zoo: https://huggingface.co/opencv/face_detection_yunet
- README de YuNet en opencv_zoo: https://raw.githubusercontent.com/opencv/opencv_zoo/main/models/face_detection_yunet/README.md
- Modelo upstream citado: ShiqiYu/libfacedetection (repositorio GitHub, no Hugging Face)
