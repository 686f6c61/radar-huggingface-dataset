# litert-community/Ultra-Fast-Lane-Detection-LiteRT

## Resumen

Ultra-Fast-Lane-Detection-LiteRT es una conversión del modelo Ultra-Fast-Lane-Detection (UFLD, ECCV 2020) al runtime LiteRT, el sucesor de TensorFlow Lite desarrollado por Google. El modelo original, creado por cfzd, reformula la detección de carriles como un problema de clasificación por filas (row-wise classification) en lugar de segmentación densa, lo que permite una inferencia extremadamente rápida en dispositivos móviles. Esta versión concreta utiliza un backbone ResNet18 entrenado sobre el dataset CULane y está optimizada para ejecutarse completamente en la GPU mediante el delegado `CompiledModel` de LiteRT, sin recurrir a la CPU.

El modelo pesa 178 MB y acepta imágenes de 288x800 píxeles en formato RGB, produciendo logits de clasificación sobre una cuadrícula de 200 celdas horizontales para 4 carriles y 18 anclas de fila. La decodificación se realiza en el host mediante softmax y cálculo de expectativas, lo que convierte la salida en puntos de carril. En un Pixel 8a alcanza unos 20 ms por fotograma en GPU, y en un Snapdragon 8 Elite Gen 5 con NPU Hexagon baja a 2,96 ms, lo que lo hace adecuado para sistemas ADAS y conducción autónoma en tiempo real. Su licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 backbone + head de clasificacion por filas (row-wise classification), CNN pura |
| Parametros totales | no disponible (backbone ResNet18, ~11 M estimados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (pesos float32 por defecto) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | LiteRT (.tflite) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura propuesta en el paper Ultra-Fast-Lane-Detection (ECCV 2020): un backbone ResNet18 que extrae características de la imagen y una cabeza de clasificación que, para cada una de las 18 anclas de fila predefinidas y cada uno de los 4 carriles, predice una distribucion de probabilidad sobre 200 celdas horizontales de la cuadricula mas una clase adicional de "sin carril". Esta formulacion evita la segmentacion pixel a pixel y reduce drasticamente el coste computacional.

Los pesos provienen del repositorio original de cfzd, entrenados sobre el dataset CULane (carreteras chinas). La conversion a LiteRT se realizo con la herramienta `litert-torch`, aplicando un unico parche: el `MaxPool2d(padding=1)` del stem de ResNet18 se sustituyo por un padding con ceros seguido de un maxpool sin padding, ya que el padding con `-inf` que generaba el convertidor era rechazado por los drivers Mali. Tras este ajuste, los 41 nodos del grafo se ejecutan integramente en GPU (1 particion) con una correlacion de 0,999982 respecto a la salida de PyTorch.

## Capacidades

- Deteccion de carriles en tiempo real sobre imagenes de 288x800 píxeles, devolviendo hasta 4 carriles (ego-lane) como puntos discretos.
- Inferencia completamente on-device mediante el delegado GPU de LiteRT (`CompiledModel`), sin dependencia de servidores ni conexion a internet.
- Soporte para aceleracion NPU en dispositivos Snapdragon con Hexagon, alcanzando latencias inferiores a 3 ms.
- Decodificacion host-side sencilla: softmax sobre las celdas de la cuadricula y calculo de la expectativa para obtener la columna del carril.
- Compatible con el ecosistema LiteRT/TFLite: puede ejecutarse con `Interpreter` en Python, Kotlin/Android y C++.
- No incluye capacidades de lenguaje, tool calling ni agentes; es un modelo de vision especializado.

## Casos de uso

- Sistemas de aviso de salida de carril (LDW): el modelo detecta los carriles del ego-vehiculo en tiempo real y puede activar alertas cuando el vehiculo se desvia sin señalizar. Su latencia de ~20 ms en GPU movil permite reacciones inmediatas.
- Asistencia a la conduccion autonoma (ADAS): integrado en el pipeline de percepcion de un vehiculo, proporciona la posicion de los carriles para planificacion de trayectoria y control de crucero adaptativo.
- Conduccion autonoma en entornos urbanos: aunque entrenado en CULane (autopistas), puede adaptarse con fine-tuning a otros escenarios; su bajo coste computacional permite ejecutarlo en hardware embebido de bajo consumo.
- Robotica movil en entornos estructurados: robots de reparto o plataformas logisticas que se desplazan por pasillos o carriles marcados pueden usar el modelo para mantenerse en su via.
- Dashcams inteligentes: camaras de salpicadero con procesamiento on-device que detectan carriles y generan alertas en tiempo real sin enviar video a la nube.
- Simuladores de conduccion: integracion en entornos de simulacion para validar algoritmos de control de vehiculos, aprovechando la salida de puntos de carril como entrada para el controlador.

## Benchmarks y rendimiento

No se han publicado resultados de precision (mAP, F1, etc.) en la informacion disponible. Los datos de rendimiento se limitan a latencia de inferencia, medidos con la herramienta `benchmark_model` de TFLite/LiteRT.

| Runtime | Backend | Grafo en GPU | Latencia |
|---|---|---|---|
| LiteRT `CompiledModel` (LITERT_CL) | GPU (Pixel 8a, Tensor G3) | 41 / 41 | ~20 ms |
| TFLite `benchmark_model` (TfLiteGpuDelegateV2) | GPU OpenCL (Pixel 8a) | 41 / 41 | 25,3 ms |
| TFLite `benchmark_model` | CPU XNNPACK 4 hilos (Pixel 8a) | — | 252,3 ms |
| LiteRT `CompiledModel` 2.2.0 | NPU Hexagon v81 (Galaxy S26, SM8850) | — | 2,96 ms (mediana) |
| LiteRT `CompiledModel` 2.2.0 | GPU Adreno (Galaxy S26) | — | 6,51 ms (mediana) |

Nota: las filas de GPU corresponden a runtimes distintos (LiteRT `CompiledModel` vs delegado TFLite clasico). La cifra de `LITERT_CL` es la registrada al publicar el modelo; la de `TfLiteGpuDelegateV2` es una cota reproducible con la herramienta estandar.

## Requisitos de hardware

- Tamano del modelo: 178 MB en disco, por lo que cabe en cualquier dispositivo movil con almacenamiento suficiente.
- VRAM: no aplica (modelo on-device, no requiere GPU de servidor). La memoria de trabajo depende del runtime, pero es inferior a 500 MB en GPU movil.
- GPU recomendadas: cualquier GPU con soporte OpenCL o Vulkan en Android (Adreno, Mali, Tensor G3). En el Pixel 8a (Tensor G3) se obtienen ~20 ms por fotograma.
- NPU: compatible con Hexagon v81 (Snapdragon 8 Elite Gen 5) mediante compilacion previa con QAIRT 2.47.0, alcanzando 2,96 ms de latencia.
- CPU: ejecutable en CPU (XNNPACK) con ~252 ms en Pixel 8a, util para pruebas o dispositivos sin GPU.
- Opciones de despliegue: LiteRT `CompiledModel` (Kotlin/Android), `Interpreter` de Python (`ai-edge-litert`), herramienta `benchmark_model` de TFLite.
- Latencia estimada: 2,96 ms (NPU Snapdragon), 6,51 ms (GPU Adreno), ~20 ms (GPU Tensor G3), 252 ms (CPU Pixel 8a).

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros modelos de deteccion de carriles en la informacion proporcionada. La comparativa se limita a la relacion con el modelo original del que deriva.

| Modelo | Backbone | Dataset | Formato | Latencia (Pixel 8a) | Licencia |
|---|---|---|---|---|---|
| Ultra-Fast-Lane-Detection-LiteRT (este) | ResNet18 | CULane | LiteRT (.tflite) | ~20 ms GPU | MIT |
| Ultra-Fast-Lane-Detection original (cfzd) | ResNet18 | CULane | PyTorch | no disponible (requiere GPU servidor) | MIT |

Ambos comparten pesos y arquitectura; la diferencia radica en el formato de exportacion y la optimizacion para ejecucion on-device.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre CULane (autopistas chinas), por lo que puede degradarse en carreteras con señalizacion muy distinta (EE. UU., Europa) o en condiciones adversas (lluvia, nieve, noche).
- Detecta un maximo de 4 carriles (ego-lane); no cubre todos los carriles de una autovia ni carriles discontinuos complejos.
- La salida son puntos discretos por fila, no una segmentacion continua; puede haber pequenos errores en curvas cerradas o cambios de pendiente.
- No es un modelo multimodal ni de lenguaje; no admite entradas de texto ni genera descripciones.
- El parche aplicado al `MaxPool2d` (padding con ceros en lugar de `-inf`) es exacto tras la ReLU, pero cualquier modificacion del grafo original podria requerir revalidacion.
- La latencia en NPU se midio con artefactos compilados especificamente para SM8850; en otros dispositivos Snapdragon puede variar.
- Licencia MIT permite uso comercial, pero el dataset CULane tiene sus propias restricciones de uso que deben revisarse antes de redistribuir el modelo entrenado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Ultra-Fast-Lane-Detection-LiteRT
- Repositorio original del modelo (cfzd): https://github.com/cfzd/Ultra-Fast-Lane-Detection
- Repositorio de modelos LiteRT (john-rocky): https://github.com/john-rocky/LiteRT-Models/tree/main/ufld
- LiteRT (sucesor de TensorFlow Lite): https://github.com/google-ai-edge/litert
- Documentacion de LiteRT en Google Developers: https://developers.google.com/edge/litert
- Receta de despliegue GPU: https://github.com/john-rocky/hf-to-litertlm/blob/main/docs/android-gpu.md
- Receta de despliegue NPU: https://github.com/john-rocky/hf-to-litertlm/blob/main/docs/android-npu.md
