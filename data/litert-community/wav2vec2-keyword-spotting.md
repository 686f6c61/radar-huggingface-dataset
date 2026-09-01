# litert-community/wav2vec2-keyword-spotting

## Resumen

wav2vec2-keyword-spotting es una conversión a LiteRT (el runtime de inferencia on-device de Google, sucesor de TFLite) del modelo superb/wav2vec2-base-superb-ks, especializado en detección de palabras clave (keyword spotting). El modelo clasifica clips de audio de 1 segundo a 16 kHz en 12 etiquetas del dataset Speech Commands: yes, no, up, down, left, right, on, off, stop, go, _unknown_ y _silence_.

La relevancia de este modelo reside en su ejecución completamente en GPU mediante el delegate CompiledModel de LiteRT (LITERT_CL), sin ningún paso de FFT: la forma de onda cruda entra directamente en un extractor de características basado en convoluciones 1D. El modelo se divide en dos grafos TFLite (frontend de 9 MB y head de 181 MB) porque el grafo completo de 1008 nodos excede el límite de compilación de shaders de las GPU Mali. Verificado en un Pixel 8a (Tensor G3), alcanza una latencia end-to-end de aproximadamente 19 ms para un clip de 1 segundo (RTF ≈ 0.02).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-base (Transformer encoder, 12 capas) con cabeza de clasificacion de secuencias |
| Parametros totales | no disponible (modelo base wav2vec2-base: ~95 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1 segundo de audio a 16 kHz (16000 muestras) |
| Tipos de cuantizacion | fp16 (archivos `w2v2_frontend_fp16.tflite` y `w2v2_head_fp16.tflite`) |
| Idiomas soportados | no disponible (etiquetas en ingles: yes, no, up, down, left, right, on, off, stop, go) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite (LiteRT), dos grafos separados |

## Arquitectura y entrenamiento

El modelo se basa en wav2vec2-base, cuya arquitectura consta de un extractor de características CNN 1D (7 convoluciones stride + GroupNorm) seguido de un encoder Transformer de 12 capas con embedding posicional convolucional. Para la clasificación, se utiliza weighted-layer-sum sobre los 13 estados ocultos (las 12 capas más la salida del feature extractor), seguido de proyección, mean-pooling y un clasificador lineal de 12 salidas.

El checkpoint original superb/wav2vec2-base-superb-ks fue fine-tuneado sobre el subset de keyword spotting del benchmark SUPERB, que a su vez se basa en Speech Commands. La conversión a LiteRT incluye varias re-autorías para compatibilidad con GPU: GELU→tanh-GELU, GroupNorm→GN4D, plegado de weight_norm en la convolución posicional, y el softmax de los pesos de capa horneado como constantes. El modelo usa `do_normalize=False`, por lo que la forma de onda cruda en [-1, 1] se introduce directamente sin normalización.

## Capacidades

- Clasificación de audio en 12 etiquetas de keyword spotting (10 comandos + _unknown_ + _silence_).
- Ejecución completa en GPU on-device mediante el delegate CompiledModel de LiteRT (LITERT_CL), sin fallback a CPU.
- Procesamiento de forma de onda cruda a 16 kHz sin necesidad de extracción de características tipo mel (no hay FFT).
- Inferencia de bajo coste: ~19 ms por clip de 1 segundo en Pixel 8a (RTF ≈ 0.02).
- Precisión verificada: 10/10 palabras clave correctas en habla real, con correlación de logits dispositivo-vs-CPU de 0.9995.
- Compatible con la API CompiledModel de LiteRT en Android (Kotlin) y con el interpreter de Python para verificación en escritorio.

## Casos de uso

- Asistentes de voz en dispositivos móviles: activación por palabra clave (tipo "Hey Google" o "OK Google") sin depender de la nube, con latencia de ~19 ms y privacidad total al procesar localmente.
- Automatización del hogar: control por voz de dispositivos IoT (encender/apagar luces, subir/bajar persianas) mediante comandos cortos como "on", "off", "up" o "down", ejecutándose en un hub local con GPU Mali.
- Accesibilidad: interfaces de voz para personas con movilidad reducida que necesitan comandos simples y rápidos ("stop", "go", "left", "right") sin depender de conexión a internet.
- Wearables y dispositivos de bajo consumo: detección de palabras clave en smartwatches o auriculares, donde el modelo cabe en ~190 MB y se ejecuta en GPU integrada.
- Automoción: control por voz en el habitáculo para comandos de navegación o entretenimiento, con respuesta en tiempo real y sin enviar audio a servidores externos.
- Prototipado rápido de KWS: el modelo sirve como punto de partida para desarrolladores que necesitan un pipeline de keyword spotting funcional en Android, con código de ejemplo disponible en el repositorio oficial de LiteRT samples.

## Benchmarks y rendimiento

La model card proporciona mediciones con la herramienta estándar TFLite `benchmark_model` en un Pixel 8a (Tensor G3, Android 16), con 10 warm-up runs y 50 runs cronometrados:

| Runtime | Backend | Grafos en GPU | Latencia |
|---|---|---|---|
| TFLite `benchmark_model` (TfLiteGpuDelegateV2) — frontend | GPU (OpenCL) | 134 / 134 | 38.4 ms |
| TFLite `benchmark_model` (TfLiteGpuDelegateV2) — head | GPU (OpenCL) | 52 / 893 | 515.7 ms |
| TFLite `benchmark_model` — frontend | CPU (XNNPACK, 4 threads) | — | XNNPACK rechazó el grafo |
| TFLite `benchmark_model` — head | CPU (XNNPACK, 4 threads) | — | 123.3 ms |

La model card advierte explícitamente que estas cifras provienen del delegate OpenCL clásico de TFLite y no son comparables con las mediciones del runtime LiteRT CompiledModel (LITERT_CL), que es el camino que usa la app de ejemplo. La cifra end-to-end de ~19 ms se obtuvo con CompiledModel y no aparece en la tabla reproducible. XNNPACK declina estos grafos fp16 (falla en DEPTHWISE_CONV_2D), por lo que no hay cifra CPU usable con ese delegate.

## Requisitos de hardware

- VRAM estimada: los dos archivos suman ~190 MB (9 MB frontend + 181 MB head) en fp16; caben en cualquier GPU móvil moderna.
- GPU recomendadas: cualquier GPU con soporte OpenCL y capacidad de compilar grafos de hasta ~893 nodos. Verificado en Mali-G715 (Tensor G3 del Pixel 8a). El grafo completo de 1008 nodos no compila en Mali, por lo que la división en dos grafos es necesaria.
- Compatibilidad con consumer GPU: sí, cualquier dispositivo Android con GPU Mali, Adreno o similar; no requiere hardware especializado.
- Opciones de despliegue: LiteRT CompiledModel API en Android (Kotlin) con `Accelerator.GPU`; interpreter de Python (`ai_edge_litert`) para verificación en escritorio.
- Latencia y throughput: ~19 ms end-to-end en Pixel 8a con CompiledModel GPU (RTF ≈ 0.02); la tabla reproducible con TFLite OpenCL delegate muestra 38.4 ms (frontend) + 515.7 ms (head) como suelo reproducible, aunque la model card indica que estas cifras no reflejan el rendimiento real en LiteRT.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| litert-community/wav2vec2-keyword-spotting | ~95 M (base) | 1 s / 16 kHz | TFLite fp16 (2 grafos) | Apache-2.0 | On-device GPU, sin FFT, 12 etiquetas |
| superb/wav2vec2-base-superb-ks | ~95 M | 1 s / 16 kHz | PyTorch | Apache-2.0 | Modelo original, requiere framework completo |
| Wav2Keyword (dobby-seo) | no disponible | no disponible | PyTorch | no disponible | KWS basado en Wav2Vec 2.0, SOTA en Speech Commands V1 y V2 |

La comparativa directa con otros modelos de KWS on-device (como Google Speech Commands o Porcupine de Picovoice) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Vocabulario limitado: solo reconoce 12 etiquetas fijas (10 comandos + _unknown_ + _silence_); no es un sistema de reconocimiento de voz general.
- Audio de entrada fijo: acepta exactamente 1 segundo de audio a 16 kHz mono; clips más largos se truncan y clips más cortos se rellenan con ceros.
- Sin normalización de audio: el modelo usa `do_normalize=False`, por lo que la amplitud de entrada debe estar en [-1, 1]; variaciones de volumen pueden afectar al rendimiento.
- Dependencia de GPU: el modelo está optimizado para GPU y XNNPACK rechaza los grafos fp16; en CPU solo funciona con kernels de referencia, que son ~20× más lentos.
- Limitación de compilación en GPU Mali: el grafo completo no compila; es obligatorio usar la división en dos grafos (frontend + head).
- Las cifras de rendimiento de la model card son confusas: las mediciones reproducibles con TFLite OpenCL delegate (515.7 ms para el head) no reflejan el rendimiento real con LiteRT CompiledModel (~19 ms end-to-end), que no es reproducible con herramientas estándar.
- Sesgos y alucinaciones: no se han documentado sesgos específicos, pero al ser un clasificador de 12 clases, los errores se manifiestan como clasificaciones incorrectas entre etiquetas, no como alucinaciones de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litert-community/wav2vec2-keyword-spotting
- Modelo base original: https://huggingface.co/superb/wav2vec2-base-superb-ks
- Repositorio de muestras LiteRT (compiled_model_api/audio_classification): https://github.com/google-ai-edge/litert-samples
- README espejo en GitHub: https://github.com/john-rocky/LiteRT-Models/blob/main/wav2vec2-kws/README.md
- Herramienta benchmark_model: https://ai.google.dev/edge/litert/models/measurement
- Proyecto Wav2Keyword (referencia): https://github.com/dobby-seo/Wav2Keyword
