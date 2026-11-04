# Oprockyvai/Silent-Face-Anti-Spoofing-LiteRT

## Resumen

Silent-Face Anti-Spoofing (MiniFASNetV2) es un modelo de deteccion de vida facial (*face liveness*) y anti-suplantacion (*presentation attack detection*) empaquetado en formato LiteRT/TFLite para ejecucion totalmente en dispositivo. Lo desarrolla el usuario Oprockyvai a partir de los pesos originales del repositorio de minivision-ai, y resuelve un problema concreto: distinguir una cara real frente a la camara de un ataque de presentacion, como una foto impresa o una pantalla reproducida. Es la pieza antifraude tipica de un flujo de login facial o e-KYC.

La arquitectura es MiniFASNetV2, una CNN pura con convoluciones separables en profundidad, de solo 1,85 MB de tamano. La entrada es un recorte de cara de `[1, 3, 80, 80]` en NCHW, espacio de color BGR y normalizado con `x/255`; la salida es un vector de `[1, 3]` con softmax, donde la clase 1 corresponde a cara viva y las clases 0 y 2 a ataques de impresion o reproduccion.

Su relevancia actual esta en el rendimiento en hardware movil: el grafo completo (168 de 168 nodos) se ejecuta en el delegado GPU de LiteRT sin fallback a CPU, con aproximadamente 5 ms por fotograma en un Pixel 8a, y llega a 0,61-0,64 ms en la NPU Hexagon de un Snapdragon 8 Elite Gen 5. La licencia Apache-2.0 y el formato compacto lo hacen apto para integrarse en aplicaciones Android y en navegador via LiteRT.js.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniFASNetV2 (CNN pura con convoluciones separables en profundidad) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | fp16 (el archivo publicado es fp16); no se documentan otras variantes |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite / LiteRT (`.tflite`); pesos originales en PyTorch en el repositorio de minivision-ai |

## Arquitectura y entrenamiento

MiniFASNetV2 es una red neuronal convolucional pura disenada para clasificacion binaria/multiclase de recortes faciales. El modelo usa convoluciones separables en profundidad y activaciones PReLU, que en la conversion a LiteRT se rebajan a operaciones ReLU compatibles con GPU. La entrada es un recorte de cara de 80x80 pixeles en formato NCHW, BGR y normalizado, tomado a aproximadamente 2,7 veces el tamano de la caja facial y centrado. La salida es una distribucion softmax de tres clases: viva, impresion y reproduccion.

Los pesos proceden del repositorio original Silent-Face-Anti-Spoofing de minivision-ai, concretamente del modelo `2.7_80x80_MiniFASNetV2`. No se detallan en la informacion disponible el numero de tokens ni la composicion exacta del dataset de entrenamiento original, ni si hubo etapas de ajuste fino con RLHF o DPO (no aplicable en un clasificador de vision). La innovacion tecnica destacable es la conversion limpia a LiteRT: el grafo completo se mapea al delegado GPU sin parches, con correlacion 1.0 frente a PyTorch en CPU, y el mismo archivo se compila en el dispositivo para la NPU Hexagon sin necesidad de cuantizacion int8.

## Capacidades

- Clasificacion de vida facial: distingue cara real de ataques de presentacion (foto impresa, pantalla reproducida) mediante softmax de tres clases.
- Deteccion de ataques de presentacion (*presentation attack detection*) orientada a flujos de autenticacion biometrica.
- Inferencia totalmente en dispositivo: ejecucion en GPU (LiteRT `CompiledModel`, delegado OpenCL) y en NPU Hexagon de Qualcomm.
- Compatibilidad con Android (Kotlin, LiteRT `CompiledModel`) y Python (`ai_edge_litert.interpreter`).
- Ejecucion en navegador via LiteRT.js con WebGPU.
- Entrada de imagen de 80x80 en NCHW, BGR, normalizada; salida softmax de 3 clases.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un clasificador de imagen puro.

## Casos de uso

- Login facial en aplicaciones Android: el modelo recibe el recorte de cara de la camara frontal y rechaza fotos o pantallas reproducidas antes de autenticar, con latencia de ~5 ms por fotograma en un Pixel 8a.
- e-KYC y onboarding remoto: integrado en el pipeline de verificacion de identidad para comprobar que el usuario esta presente fisicamente durante la captura del documento y la selfie.
- Control de acceso fisico: validacion de vida en terminales de entrada con hardware modesto, gracias a los 1,85 MB del modelo y su ejecucion en NPU/GPU sin CPU.
- Antifraude en banca movil: capa adicional en la verificacion biometrica para bloquear ataques de replay en operaciones sensibles.
- Verificacion en navegador: uso via LiteRT.js y WebGPU para comprobar liveness en flujos web sin envio de imagenes al servidor, con 1,39 ms p50 en Chromium sobre M4 Max.
- Sistemas embebidos y edge: despliegue en Raspberry Pi 5 con CPU/XNNPACK (2,13 ms p50) para terminales de acceso o quioscos sin acelerador dedicado.
- Preprocesado en pipelines de vision: filtro previo que descarta capturas no vivas antes de pasarlas a un modelo de reconocimiento facial mayor.

## Benchmarks y rendimiento

| Entorno | Runtime / backend | Grafo en GPU | Latencia |
|---|---|---|---|
| Pixel 8a (Tensor G3, Android 16) | LiteRT `CompiledModel` (LITERT_CL) | 168 / 168 | ~5 ms |
| Pixel 8a (Tensor G3, Android 16) | TFLite `benchmark_model` (TfLiteGpuDelegateV2, OpenCL) | 168 / 168 | 5,1 ms |
| Pixel 8a (Tensor G3, Android 16) | TFLite `benchmark_model` CPU (XNNPACK, 4 hilos) | — | 7,9 ms |
| Samsung Galaxy S26 (Snapdragon 8 Elite Gen 5, Hexagon v81) | LiteRT `CompiledModel` NPU, primera ejecucion | — | 0,61 ms (carga 514 ms) |
| Samsung Galaxy S26 (Snapdragon 8 Elite Gen 5, Hexagon v81) | LiteRT `CompiledModel` NPU, cacheado | — | 0,64 ms (carga 98 ms) |
| Samsung Galaxy S26 (Snapdragon 8 Elite Gen 5, Adreno) | LiteRT `CompiledModel` GPU | — | 0,74 ms (carga 581 ms) |
| Raspberry Pi 5 | LiteRT 2.2.0.dev20260804, CPU/XNNPACK, 4 hilos | — | 2,13 ms p50 |
| Chromium 151 sobre M4 Max | LiteRT.js 2.5.3, WebGPU | — | 1,39 ms p50 |

No se han publicado resultados de benchmarks de precision (accuracy, APCER, BPCER) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo pesa 1,85 MB en fp16, por lo que la huella de memoria es minima.
- GPU recomendadas: cualquier GPU compatible con el delegado LiteRT (OpenCL en Android, WebGPU en navegador); en movil, Adreno en Snapdragon y Mali en Exynos/Tensor.
- NPU: Qualcomm Hexagon v81 (Snapdragon 8 Elite Gen 5) soportada de forma nativa; requiere las librerias `libLiteRtDispatch_Qualcomm.so`, `libLiteRtCompilerPlugin_Qualcomm.so` y el SDK QAIRT de Qualcomm.
- Cabe en cualquier GPU de consumo y en hardware embebido: probado en Raspberry Pi 5 y Pixel 8a.
- Opciones de despliegue: LiteRT `CompiledModel` (Kotlin/Android), `ai_edge_litert.interpreter` (Python), TFLite `benchmark_model`, LiteRT.js (navegador).
- Latencia y throughput: ~5 ms por fotograma en Pixel 8a (GPU), 0,61-0,64 ms en NPU Hexagon, 7,9 ms en CPU XNNPACK, 2,13 ms en Raspberry Pi 5, 1,39 ms en navegador con WebGPU.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Silent-Face Anti-Spoofing LiteRT (este) | no disponible (1,85 MB) | 80x80 NCHW BGR | no aplica | Apache-2.0 | HuggingFace, TFLite/LiteRT |
| Silent-Face-Anti-Spoofing original (minivision-ai) | no disponible | 80x80 | no aplica | Apache-2.0 | GitHub, PyTorch |
| Alternativas comerciales de liveness (p. ej. FaceTec, iProov) | no disponible | no disponible | no aplica | propietaria | SDK comercial |

No se dispone de datos de benchmarks comparativos con otros modelos de liveness en la informacion proporcionada. El modelo original de minivision-ai usa un ensemble de dos MiniFASNet (escalas 2,7 y 4,0) junto a un detector facial; esta version publica solo el primario (2,7).

## Limitaciones y advertencias

- Modelo de vision puro: no procesa texto, no soporta tool calling ni razonamiento; su unico proposito es la clasificacion de liveness facial.
- Requiere un recorte de cara correctamente detectado y centrado (aprox. 2,7x la caja facial); un recorte deficiente degrada la precision.
- La version publicada incluye solo el modelo primario MiniFASNetV2 (2,7); el ensemble con el modelo de escala 4,0 del repositorio original no esta incluido, lo que puede reducir la precision frente al sistema completo.
- No se han publicado metricas de precision (APCER/BPCER) ni evaluaciones de sesgo por demografia, iluminacion o calidad de camara.
- Riesgo de falsos positivos y negativos en condiciones de iluminacion adversas o con dispositivos de baja calidad; no se documentan umbrales de decision recomendados.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones de los pesos originales de minivision-ai.
- La ejecucion en NPU Hexagon requiere librerias de Qualcomm no distribuidas en el repositorio; su obtencion y versionado anaden complejidad de despliegue.
- El modelo esta fechado en 2026-11-04 y no tiene descargas ni likes registrados; no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- HuggingFace: https://huggingface.co/Oprockyvai/Silent-Face-Anti-Spoofing-LiteRT
- Repositorio original: https://github.com/minivision-ai/Silent-Face-Anti-Spoofing
- Ficha edge-compat: https://github.com/john-rocky/edge-compat/blob/main/cards/silent-face-anti-spoofing/CARD.md
- LiteRT (Google AI Edge): https://github.com/google-ai-edge/LiteRT
- Documentacion de medicion LiteRT: https://ai.google.dev/edge/litert/models/measurement
- Releases de LiteRT (librerias NPU): https://github.com/google-ai-edge/LiteRT/releases
