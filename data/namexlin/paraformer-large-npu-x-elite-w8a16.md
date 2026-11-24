# nameXLin/paraformer-large-npu-x-elite-w8a16

## Resumen

Paraformer-large NPU X Elite W8A16 es una exportación del modelo de reconocimiento automático del habla (ASR) en mandarín Paraformer-large, empaquetado como *context binaries* (`.bin`) para la NPU Hexagon (HTP v73) de los portátiles con Snapdragon X Elite. Lo publica el usuario `nameXLin` en Hugging Face y no entrena nada nuevo: toma los pesos originales de `iic/speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-pytorch` (ModelScope, grupo DAMO/Alibaba) y los exporta y cuantiza para el runtime Qualcomm QNN.

El modelo resuelve el despliegue de ASR en el *edge* sobre hardware ARM de Qualcomm: permite transcribir audio en local, sin GPU dedicada ni conexión a la nube, aprovechando la NPU del SoC. Es relevante para quien construya aplicaciones de dictado, subtitulado o actas de reuniones en Windows on ARM, porque demuestra latencias de decodificación muy bajas (RTF ≈ 0,0366 en audio corto) con una pérdida de precisión medida y acotada frente a la referencia en coma flotante.

Arquitectura Paraformer no autorregresiva de 220,1 M de parámetros, con codificador de 50 capas SANM y decodificador de 16 capas; el predictor CIF se ejecuta en la CPU del host. El repositorio ocupa 0,3 GB y solo contiene los binarios finales de producción, sin los ficheros ONNX/DLC intermedios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paraformer-large no autorregresiva (encoder SANM + decoder + predictor CIF) |
| Parametros totales | 220,1 M (encoder 157,87 M; decoder 56,90 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada por ventana de 320 frames ≈ 19,2 s; audio largo segmentado) |
| Tipos de cuantizacion | Encoder W8A16 (8 bits pesos, 16 bits activaciones); decoder FP16 |
| Idiomas soportados | Chino mandarín (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Context binaries QNN (`.bin`) para HTP v73; no safetensors ni GGUF |
| Tamano del repositorio | 0,3 GB (encoder 166,7 MB, decoder 115,6 MB, `qnn_io_spec.json` 1,9 KB) |
| Hardware objetivo | Hexagon NPU HTP v73 (Snapdragon X Elite X1E78100) |
| SDK / runtime | Qualcomm AI Runtime (QAIRT) 2.47.0.260601, `QnnHtp.dll` |

## Arquitectura y entrenamiento

Paraformer es un modelo ASR no autorregresivo: en lugar de generar tokens secuencialmente, predice toda la secuencia en paralelo. El codificador consta de 50 capas SANM (Self-Attention with Memory) con 157,87 M de parámetros y 408,67 MMACs; el decodificador tiene 16 capas, 56,90 M de parámetros y 102,36 MMACs. El predictor CIF (Continuous Integrate-and-Fire) integra los estados acústicos en *embeddings* de longitud variable, es paramétrico-libre y se mantiene en el host (CPU), no en la NPU.

Este repositorio no entrena ni ajusta el modelo: exporta los pesos originales a ONNX/DLC y los compila y cuantiza para el backend HTP de Qualcomm. La cuantización aplicada es W8A16 en el codificador (reduce su tamaño un 48 % frente a FP16, de 323,0 MB a 166,7 MB) y FP16 en el decodificador. La verificación frente a la referencia ONNX en coma flotante reporta similitud coseno de 0,9825 en el codificador y 0,9899 en los logits del decodificador, con transcripción idéntica carácter a carácter. Los binarios están ligados a la arquitectura HTP v73 y no funcionan en HTP v68/v69/v75 sin regeneración.

## Capacidades

- Reconocimiento automático del habla en chino mandarín, con salida de texto a partir de audio de 16 kHz.
- Procesamiento de audio largo: se ha validado una grabación de reunión de 56 minutos (3361 s) segmentada en 274 fragmentos.
- Inferencia no autorregresiva, lo que permite decodificar secuencias completas en paralelo y reduce la latencia frente a modelos autoregresivos.
- Ejecución íntegra en la NPU del dispositivo para el codificador y el decodificador; el frontend fbank, la integración CIF y el tokenizador se ejecutan en CPU.
- No soporta tool calling, function calling, agentes, visión, audio de entrada más allá del ASR ni modo *thinking*.
- Capacidad multilingüe limitada al mandarín; no se documentan otros idiomas.

## Casos de uso

- **Dictado por voz en local en portátiles Snapdragon X Elite**: el modelo transcribe en la NPU con un RTF de 0,0366 en audio corto, lo que permite dictado casi instantáneo sin enviar audio a la nube y sin GPU dedicada.
- **Subtitulado y actas de reuniones**: con RTF de 0,0212 en audio largo (71,1 s para 3361 s de audio), es viable procesar grabaciones de reuniones completas en el propio dispositivo; el autor reporta calidad legible con errores ocasionales en nombres propios y números.
- **Asistentes de voz integrados en aplicaciones de escritorio Windows on ARM**: al ejecutarse sobre `QnnHtp.dll` y consumir poca energía de la NPU, encaja en aplicaciones de productividad que necesitan ASR continuo sin agotar la batería.
- **Transcripción de notas de voz y mensajes**: la ventana de 320 frames (≈ 19,2 s) cubre la mayoría de notas de voz cortas en una sola pasada, con latencia total de unos 204 ms.
- **Pipelines de accesibilidad**: generación de subtítulos en tiempo real para contenido en mandarín en entornos sin conectividad, usando el hardware del propio portátil.
- **Procesamiento por lotes en el edge**: transcripción de archivos de audio en dispositivos con Snapdragon X Elite dentro de flujos de trabajo locales, con el coste de carga de contexto amortizado entre segmentos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Similitud coseno encoder W8A16 vs ONNX float | 0,9825 |
| Similitud coseno logits decoder FP16 vs ONNX float | 0,9899 |
| Transcripcion vs referencia | Identica, caracter a caracter |
| Latencia encoder (audio 5,58 s, NPU) | 67,9 ms |
| Latencia integracion CIF (CPU host) | 20,0 ms |
| Latencia decoder (NPU) | 116,1 ms |
| Latencia total audio corto | ≈ 204 ms |
| RTF audio corto | ≈ 0,0366 (≈ 27× tiempo real) |
| Tiempo encoder audio largo (3361 s) | 26,77 s |
| Tiempo decoder audio largo | 44,37 s |
| Tiempo total / RTF audio largo | 71,1 s / 0,0212 (≈ 47× tiempo real) |

No se han publicado resultados de benchmarks estándar (WER/CER sobre conjuntos como AISHELL) en la información disponible.

## Requisitos de hardware

- **NPU**: Hexagon NPU con arquitectura HTP v73; probado en Snapdragon X Elite X1E78100 con Windows 11 ARM64.
- **VRAM**: no aplica; el modelo se ejecuta en la NPU y el host, no requiere GPU dedicada. El repositorio ocupa 0,3 GB en disco.
- **GPU**: no se requiere ni se documenta soporte para GPU NVIDIA o AMD.
- **Compatibilidad**: los context binaries están ligados a HTP v73; no funcionan en HTP v68/v69/v75 sin regeneración.
- **Software**: Qualcomm AI Runtime (QAIRT) 2.47.0.260601, con `QnnHtp.dll` y `ADSP_LIBRARY_PATH` configurados.
- **Despliegue**: `qnn-net-run.exe` desde línea de comandos o invocado desde Python vía `subprocess`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: RTF de 0,0366 en audio corto y 0,0212 en audio largo, según las mediciones del autor con `qnn-net-run` (21 repeticiones, media sin arranque de proceso ni carga de contexto).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Paraformer-large NPU X Elite W8A16 (este) | 220,1 M | Ventana de 320 frames (≈ 19,2 s), segmentacion para audio largo | NPU Hexagon HTP v73 | Apache 2.0 | Hugging Face (0 descargas) |
| Paraformer-large original (`iic/speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-pytorch`) | 220,1 M | No disponible | CPU/GPU (PyTorch) | No disponible en la informacion | ModelScope |
| Whisper large-v3 | No disponible en la informacion | No disponible | CPU/GPU | No disponible en la informacion | Amplia |

La comparación con alternativas de la misma categoría (ASR en el edge) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **Idioma único**: solo reconoce chino mandarín; no se documenta soporte para otros idiomas.
- **Ligado a hardware**: los binarios solo funcionan en HTP v73; requieren regeneración para otras versiones de HTP.
- **Trampa de tipos en las entradas**: `mask` y las entradas de longitud deben pasarse como float32; si se pasan como int32, el enmascaramiento falla silenciosamente y la salida es basura. Es el error más común según el autor.
- **Errores en nombres propios y números**: en la prueba de audio largo el autor reporta errores ocasionales en entidades y cifras.
- **Contexto limitado por ventana**: la entrada del codificador es de 320 frames (≈ 19,2 s); el audio más largo debe segmentarse, lo que puede introducir errores en las fronteras.
- **Riesgo de alucinación**: no se documenta explícitamente, pero es un riesgo inherente a los modelos ASR en pasajes con ruido o silencio.
- **Sin datos de sesgo**: no se publican evaluaciones de sesgo en la información disponible.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo fuente en ModelScope antes de redistribuir.
- **Madurez**: repositorio con 0 descargas y 0 likes, publicado en noviembre de 2026; no hay evidencia de uso en producción por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/nameXLin/paraformer-large-npu-x-elite-w8a16
- Modelo fuente en ModelScope: https://www.modelscope.cn/models/iic/speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-pytorch
- Qualcomm AI Runtime (QAIRT): no disponible en la informacion proporcionada
- Paper de Paraformer: no disponible en la informacion proporcionada
- Repositorio FunASR: no disponible en la informacion proporcionada
