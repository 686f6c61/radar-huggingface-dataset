# ai-inspire/latentmux-focalcodec-onnx

## Resumen

LatentMux FocalCodec 50Hz ONNX es una exportación estandarizada a ONNX Runtime del códec neuronal de voz FocalCodec, desarrollado originalmente por Luca Della Libera y publicado en el repositorio `lucadellalib/focalcodec_50hz`. La versión que nos ocupa la mantiene el usuario ai-inspire bajo el paraguas de la colección LatentMux Neural Codec ONNX, que agrupa exportaciones FP32 e INT8 con checksums SHA-256 verificados y orientadas a inferencia en Rust, C++ y Python. El modelo resuelve el problema de comprimir voz a un régimen ultra-bajo de 0,65 kbps manteniendo inteligibilidad, algo crítico en escenarios de transmisión con ancho de banda extremadamente limitado.

Arquitectónicamente combina un extractor WavLM, un encoder focal con cuantización esférica binaria (BSQ) de 13 bits a 50 Hz y un decoder basado en Vocos. La innovación principal de esta exportación es la eliminación bit-exacta del sesgo Toeplitz de atención relativa de WavLM (de 268,44 MB a 0,26 MB) junto con cuantización selectiva de pesos a INT8, lo que reduce el footprint en disco 5,32x y el pico de RAM de 958,6 MB a 256,2 MB, manteniendo un 85,7 % de identidad exacta en tokens de 13 bits.

Es relevante ahora porque ofrece un códec de voz listo para producción con ejecución multiplataforma vía ONNX Runtime (CPU, CUDA, TensorRT, CoreML, DirectML, WebGPU, OpenVINO, ROCm), sin dependencias de PyTorch, y con licencia Apache-2.0. El modelo es de audio a audio, mono a 16 kHz, y no soporta escalado de bitrate.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Códec neuronal: WavLM + FocalEncoder (Focal Modulation) + BSQ 13-bit + decoder Vocos |
| Parámetros totales | no disponible (tamaños en disco: encoder fp32 664,38 MiB, decoder fp32 134,92 MiB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesa audio por chunks; hop de 320 muestras con lookahead) |
| Tipos de cuantización | FP32 y INT8 selectivo (weight-only, per-channel, `DequantizeLinear`, `zp=0`) |
| Idiomas soportados | no disponible (códec de voz agnóstico al idioma en la información proporcionada) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_fp32.onnx`, `encoder_int8.onnx`, `decoder_fp32.onnx`, `decoder_int8.onnx`) |

## Arquitectura y entrenamiento

El modelo es un códec neuronal de voz causal-chunkeable que opera a 16 kHz mono con un bitrate fijo de 0,65 kbps y una tasa de tokens de 50 Hz. La cadena de codificación pasa por un extractor WavLM, un encoder focal (Focal Modulation Networks) y una cuantización esférica binaria (BSQ) de 13 bits que produce tokens enteros en el rango 0..8191. La decodificación la realiza un decoder basado en Vocos que resintetiza la fase de la señal. El contrato de E/S ONNX es: `encoder` recibe `sig [1, N_samples]` float32 a 16 kHz y emite `toks [1, T_tokens]` int64; el `decoder` recibe `toks [1, T_tokens]` int64 y devuelve PCM float32 a 16 kHz.

La exportación incorpora dos optimizaciones técnicas destacables. Primero, la eliminación bit-exacta del sesgo Toeplitz de atención relativa de WavLM: el constante `[16, 2048, 2048]` en FP32 (268,44 MB) se sustituye por un `Gather` dinámico sobre `[16, 4095]` (0,26 MB), con `max_err = 0.0` y poda de constantes inalcanzables. Segundo, cuantización INT8 selectiva por canal (weight-only, `DequantizeLinear`, zero-point cero) aplicada a 50 tensores 2D MatMul y 3D Conv del encoder (preservando el CNN `/feature_extractor` y el cuello de botella BSQ `/compressor/out_proj`) y a 51 tensores del decoder, reduciendo el footprint de 838,14 MB a 157,43 MB (5,32x). No se proporciona en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo upstream.

## Capacidades

- Codificación y decodificación de voz extremo a extremo a 0,65 kbps (16 kHz mono), con tokens BSQ de 13 bits a 50 Hz.
- Procesamiento causal por chunks, adecuado para streaming (hop de 320 muestras con lookahead).
- Ejecución multiplataforma vía ONNX Runtime: CPU, CUDA, TensorRT, DirectML, CoreML, ROCm, OpenVINO y WebGPU.
- Exportaciones FP32 e INT8 con checksums SHA-256 verificados para integración en Rust, C++ y Python.
- Inferencia sin dependencias de PyTorch (solo ONNX Runtime y, opcionalmente, `huggingface_hub` para descarga).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un códec de audio, no un LLM.
- No soporta visión, audio de entrada distinto a voz mono 16 kHz, ni escalado de bitrate (`-b:a` se ignora).

## Casos de uso

- Transmisión de voz en entornos de ancho de banda extremo: el códec fija 0,65 kbps, lo que permite enviar voz inteligible por enlaces de radio de baja capacidad, telemetría o canales satelitales donde otros códecs no caben.
- Almacenamiento masivo de archivos de voz: con tokens de 13 bits a 50 Hz, un segundo de audio ocupa aproximadamente 294 B en formato `.nmc` según las mediciones del autor, lo que abarata el archivado de grabaciones de call center o entrevistas.
- Integración en aplicaciones nativas Rust/C++: al ser ONNX puro, el códec se enlaza directamente con ONNX Runtime sin arrastrar el stack de PyTorch, algo útil en clientes de escritorio, embebidos o plugins de audio.
- Procesamiento en el borde (edge) con CoreML, DirectML o WebGPU: la variante INT8 reduce el pico de RAM a 256,15 MB y acelera la codificación 4,58x y la decodificación 2,69x frente a FP32 en CPU de 2 hilos, lo que la hace viable en dispositivos con memoria limitada.
- Pipelines de voz para modelos de lenguaje: los tokens BSQ de 13 bits pueden emplearse como representación discreta intermedia en sistemas de speech-to-text o text-to-speech que necesiten un tokenizador de audio compacto.
- Prototipado de códecs neuronales en investigación: la disponibilidad de variantes FP32 e INT8 con paridad medida (85,7 % de identidad exacta de tokens, 98,9 % de acuerdo de bits BSQ) permite estudiar el impacto de la cuantización en la calidad de reconstrucción.
- Despliegue en servidores con TensorRT u OpenVINO: la exportación estándar permite servir el códec con aceleración por hardware sin recompilar desde el modelo original.

## Benchmarks y rendimiento

Mediciones del autor con `latentmux bench`, ONNX Runtime CPU, 2 hilos, sobre un tono de 2,0 s:

| Precisión | Tamaño `.nmc` | Encode (ms) | Decode (ms) | `warm_rtf` | Pico RAM (archivo) |
|---|---:|---:|---:|---:|---:|
| FP32 | 294 B (1,176 kbps) | 61.859,8 | 7.160,3 | 0,250 (4,00x RT) | 958,60 MB |
| INT8 | 294 B (1,176 kbps) | 14.257,8 | 2.828,4 | 0,449 (2,23x RT) | 256,15 MB |

Sobre voz real de 1,0 s (`voice_sample.wav`, `.nmc = 216 B`): INT8 reduce el encode de extremo a extremo de 61.987 ms a 13.548 ms (4,58x más rápido) y el decode de 6.733 ms a 2.507 ms (2,69x más rápido). No se han publicado resultados de benchmarks de calidad perceptual (PESQ, STOI, MUSHRA) en la información disponible. Las cifras de latencia corresponden a CPU de 2 hilos y no deben extrapolarse a GPU sin medición propia.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: pico de RAM de 958,60 MB en FP32 y 256,15 MB en INT8 (medido en CPU con 2 hilos). En GPU, la VRAM necesaria será al menos el tamaño de los pesos cargados más activaciones; no disponible una cifra medida.
- Tamaño en disco: 949,44 MiB (995.561.829 B) para los cuatro archivos; encoder INT8 115,30 MiB, decoder INT8 34,83 MiB.
- GPU recomendadas: no disponible en la información proporcionada. Los execution providers soportados son CUDA, TensorRT, ROCm, DirectML, CoreML, OpenVINO y WebGPU, lo que abre el abanico a GPUs NVIDIA, AMD, Apple Silicon e iGPUs Intel/AMD.
- Cabe en GPU de consumo: sí, por tamaño de pesos (encoder INT8 115 MB + decoder INT8 35 MB), aunque no hay medición de latencia en consumer GPU publicada.
- Opciones de despliegue: ONNX Runtime (Python, C++, Rust), CLI `latentmux`, y los execution providers mencionados. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI (no aplican a un códec de audio).
- Latencia y throughput: `warm_rtf` de 0,250 en FP32 (4,00x tiempo real) y 0,449 en INT8 (2,23x tiempo real) en CPU de 2 hilos; encode de 14.257,8 ms y decode de 2.828,4 ms para un tono de 2,0 s en INT8. La latencia en GPU no está medida en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Bitrate | Tokens | Licencia | Formato | Disponibilidad |
|---|---|---:|---|---|---|---|
| LatentMux FocalCodec 50Hz ONNX (este) | Códec neuronal WavLM+Focal+BSQ+Vocos | 0,65 kbps | 50 Hz, 13 bits | Apache-2.0 | ONNX FP32/INT8 | Hugging Face |
| `lucadellalib/focalcodec_50hz` (upstream) | Códec neuronal FocalCodec | 0,65 kbps | 50 Hz, 13 bits | Apache-2.0 | PyTorch (no confirmado en la información) | Hugging Face |
| SoundStream / EnCodec (referencia de la literatura) | Códec neuronal residual VQ | típicamente 1,5–6 kbps | variable | variable | variable | variable |
| WavTokenizer / DAC (referencia de la literatura) | Códec neuronal | variable | variable | variable | variable | variable |

No se dispone en la información proporcionada de parámetros totales, contexto ni benchmarks comparativos frente a SoundStream, EnCodec, WavTokenizer o DAC, por lo que la comparación cuantitativa queda como no disponible. La ventaja diferencial de esta exportación frente al modelo upstream es el formato ONNX con variantes INT8 verificadas y la eliminación del sesgo Toeplitz, que reduce el footprint de forma sustancial.

## Limitaciones y advertencias

- El decoder Vocos resintetiza la fase, por lo que la forma de onda no está alineada en fase con la original; el SNR en dominio temporal sobre tonos sintéticos es bajo pese a la alta fidelidad perceptual en voz.
- Bitrate fijo de 0,65 kbps a 16 kHz mono; el parámetro `-b:a` se ignora, no hay escalado de calidad.
- Solo entrada de voz mono a 16 kHz; no se documenta soporte multilingüe explícito ni idiomas cubiertos.
- Riesgo de artefactos y pérdida de calidad en audio no vocal (música, ruido, habla superpuesta) al estar entrenado para voz.
- La cuantización INT8 no es bit-exacta: 85,7 % de identidad exacta de tokens y 98,9 % de acuerdo de bits BSQ, lo que puede introducir deriva acumulativa en cadenas largas de encode/decode.
- Las latencias publicadas son en CPU de 2 hilos; en producción con GPU o con más hilos los números cambiarán y deben medirse en el entorno objetivo.
- Licencia Apache-2.0 permite uso comercial, pero deben respetarse `NOTICE.txt` y `LICENSE`, que incluyen avisos de copyright y patentes del modelo upstream.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de la exportación.
- No es un modelo de lenguaje: no soporta tool calling, agentes, razonamiento ni generación de texto.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/ai-inspire/latentmux-focalcodec-onnx
- Modelo upstream: https://huggingface.co/lucadellalib/focalcodec_50hz
- Paper FocalCodec (arXiv:2502.04465): https://arxiv.org/abs/2502.04465
- Manifiesto de artefactos: https://huggingface.co/ai-inspire/latentmux-focalcodec-onnx/blob/main/manifest.json
- Aviso legal y licencia: https://huggingface.co/ai-inspire/latentmux-focalcodec-onnx/blob/main/NOTICE.txt y https://huggingface.co/ai-inspire/latentmux-focalcodec-onnx/blob/main/LICENSE
