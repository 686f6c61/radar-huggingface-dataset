# ai-inspire/latentmux-lyra2-onnx

## Resumen

LatentMux Lyra2 ONNX es una exportación a ONNX Runtime del códec neuronal de voz Google Lyra v2, basada en la arquitectura SoundStream con cuantización vectorial residual (RVQ) y un discriminador LyraGAN. Lo publica el proyecto ai-inspire dentro de su colección LatentMux Neural Codec ONNX, que estandariza exportaciones ONNX listas para streaming con checksums SHA-256 verificados. El modelo base es rocca/lyra-v2-soundstream, derivado a su vez de google/lyra, todo bajo licencia Apache-2.0.

El modelo resuelve compresión y descompresión de voz a 16 kHz mono con tasas de bits muy bajas: 3,2, 6,0 y 9,2 kbps, configurables mediante el número de cuantizadores RVQ activos (16, 30 o 46). No es un modelo generativo de texto ni un LLM: es un códec de audio-audio, empaquetado como cuatro grafos ONNX (encoder, decoder, quantizer_encoder, quantizer_decoder) en precisión FP32 e INT8. Su relevancia radica en que permite inferencia determinista y causal por tramas de 20 ms (320 muestras) en múltiples backends (CPU, CUDA, TensorRT, CoreML, WebGPU, entre otros) desde Rust, C++ o Python.

El tamaño total del repositorio es de 8,63 MiB repartidos en seis ficheros binarios, lo que lo hace apto para despliegue en entornos con recursos muy limitados. La conversión expone las variables de estado internas del TFLite original como tensores explícitos `state`/`next_state`, lo que habilita streaming causal sin fugas de contexto entre tramas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Códec neuronal SoundStream con Residual Vector Quantization (RVQ) y discriminador LyraGAN; exportación ONNX con estado explícito |
| Parametros totales | no disponible (el repositorio solo publica tamaños de fichero: 8,63 MiB en total entre encoder, decoder y cuantizadores) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa tramas causales de 20 ms (320 muestras a 16 kHz) con estado recurrente |
| Tipos de cuantizacion | FP32 e INT8 exacto (pesos TFLite con `DequantizeLinear`); cuantizadores RVQ compartidos en FP32 |
| Idiomas soportados | no disponible (códec independiente del idioma; diseñado para voz a 16 kHz mono) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx`); bitstream propio `.nmc` para el contenedor LatentMux |

## Arquitectura y entrenamiento

La arquitectura subyacente es SoundStream, un códec neuronal totalmente convolucional con cuantización vectorial residual. El encoder transforma tramas de 320 muestras (20 ms a 16 kHz) en latentes; el cuantizador residual dispone de hasta 46 codebooks de 4 bits, de los cuales se activan 16, 30 o 46 según la tasa objetivo (3,2, 6,0 o 9,2 kbps). El decoder reconstruye la forma de onda PCM y se apoya en un discriminador LyraGAN durante el entrenamiento para mejorar la fidelidad perceptual. La referencia bibliográfica citada por el autor es Kleijn et al., "Generative Speech Coding with Predictive Variance Regularization" (2021).

La exportación parte de los tensores TFLite cuantizados de Google Lyra v2 (`tools/lyra2/`), preservando escalas y puntos cero por canal mediante `DequantizeLinear`. Las variables de ring-buffer internas del TFLite se exponen como tensores `state`/`next_state`, lo que convierte el grafo en un modelo estrictamente causal y determinista por trama. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o ajuste fino posteriores; esos detalles corresponden al modelo base original de Google.

## Capacidades

- Compresión de voz a 16 kHz mono en tasas de 3,2, 6,0 y 9,2 kbps mediante selección del número de cuantizadores RVQ activos.
- Descompresión de bitstream `.nmc` a PCM float32 con reconstrucción por tramas de 320 muestras.
- Streaming causal determinista: cada llamada devuelve `next_state`, que debe realimentarse como `state` en la trama siguiente.
- Ejecución en múltiples execution providers de ONNX Runtime: CPU, DirectML, CUDA, TensorRT, CoreML, ROCm, OpenVINO y WebGPU.
- Variantes FP32 e INT8 con calidad de audio medida idéntica (SNR 2,18 dB, SegSNR 2,29 dB, Pearson 0,8245 sobre un tono de 2 s).
- Integración en pipelines nativos desde Rust, C++ y Python mediante ONNX Runtime.
- No incluye generación de texto, razonamiento, código, visión, tool calling ni capacidades de agente.

## Casos de uso

- Transmisión de voz en tiempo real con ancho de banda muy restringido: a 3,2 kbps el códec permite enviar voz inteligible por enlaces de baja capacidad (radio, satélite, IoT) usando tramas de 20 ms y estado recurrente para mantener continuidad.
- Telefonía VoIP y comunicaciones de emergencia: la variante INT8 reduce el tamaño del encoder a 1,58 MiB y del decoder a 1,29 MiB, lo que permite empotrar el códec en dispositivos con memoria limitada manteniendo un RTF sintético de 0,214 (4,67x tiempo real) en CPU de dos hilos.
- Almacenamiento de archivos de voz a largo plazo: la codificación a 948 bytes por 2 segundos (3,792 kbps efectivos) reduce drásticamente el espacio frente a PCM, adecuado para archivos de llamadas, transcripciones o notas de voz.
- Procesamiento en el navegador o en el borde: la disponibilidad de WebGPU y CoreML como execution providers permite ejecutar la decodificación en cliente sin backend dedicado.
- Pipelines de preprocesado para ASR: la decodificación determinista y causal facilita alimentar modelos de reconocimiento de voz con audio reconstruido en flujos de bajada de bitrate.
- Integración en aplicaciones Rust/C++ nativas: el contrato de tensores explícito (`input_audio`, `state`, `input_frames`, índices cuantizados, `input_latents`) permite envolver los grafos en bibliotecas de sistema sin dependencias de Python.
- Verificación de integridad en producción: los checksums SHA-256 publicados por fichero permiten validar artefactos en pipelines de despliegue.

## Benchmarks y rendimiento

Resultados medidos con `latentmux bench` sobre ONNX Runtime CPU con 2 hilos, según la model card del autor:

| Precision | Tamano `.nmc` (2,0 s) | kbps efectivos | Encode (ms) | Decode (ms) | SNR (dB) | SegSNR (dB) | Pearson | `warm_rtf` | RAM pico |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FP32 | 948 B | 3,792 | 1311,5 | 726,5 | 2,18 | 2,29 | 0,8245 | 0,173 (5,77x RT) | 44,96 MB |
| INT8 | 948 B | 3,792 | 1174,8 | 721,1 | 2,18 | 2,29 | 0,8245 | 0,214 (4,67x RT) | 44,83 MB |

No se han publicado resultados de benchmarks comparativos con otros códecs (Opus, EnCodec, SoundStream original) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; en GPU el conjunto completo de seis grafos ocupa 8,63 MiB en FP32 e inferior en INT8, por lo que la huella de memoria es despreciable frente a cualquier otro modelo.
- RAM pico medida: 44,96 MB (FP32) y 44,83 MB (INT8) en CPU con dos hilos.
- GPU recomendadas: cualquier GPU compatible con los execution providers soportados; no se requiere una GPU de gama alta. Funciona en CUDA, TensorRT, DirectML, CoreML, ROCm y WebGPU.
- Cabe en cualquier GPU de consumo e incluso en dispositivos embebidos; el cuello de botella no es la memoria sino la latencia por trama.
- Opciones de despliegue: ONNX Runtime (Python, C++, Rust), CLI `latentmux`, y cualquier runtime compatible con ONNX. No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI, que no aplican a un códec de audio.
- Latencia y throughput: encode de 1311,5 ms y decode de 726,5 ms para 2 s de audio en FP32 (CPU, 2 hilos); RTF sintético de 0,173 (FP32) y 0,214 (INT8), es decir, entre 4,67x y 5,77x tiempo real.

## Comparativa con modelos similares

| Modelo | Tipo | Tasa de bits | Contexto / trama | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LatentMux Lyra2 ONNX | Códec neuronal SoundStream + RVQ | 3,2 / 6,0 / 9,2 kbps | 20 ms (320 muestras) | Apache-2.0 | Hugging Face (ONNX) |
| Google Lyra v2 (original) | Códec neuronal SoundStream + RVQ | 3,2 / 6,0 / 9,2 kbps | 20 ms | Apache-2.0 | Repositorio google/lyra (TFLite) |
| rocca/lyra-v2-soundstream | Códec neuronal (modelo base) | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Opus | Códec DSP clásico | 6-510 kbps | variable | BSD | Estándar IETF |

La comparativa con códecs clásicos como Opus no es directa: Lyra2 opera en el régimen de muy baja tasa (3,2 kbps) donde los códecs DSP convencionales pierden inteligibilidad. No se dispone de datos de benchmarks cruzados en la información proporcionada.

## Limitaciones y advertencias

- Diseñado exclusivamente para voz/audio a 16 kHz mono; otras frecuencias de muestreo requieren remuestreo previo (la CLI `latentmux convert` lo hace automáticamente con `-ar`).
- El streaming exige realimentar `next_state` como `state` en cada salto de 20 ms; un uso incorrecto rompe la continuidad y produce artefactos.
- La calidad medida sobre un tono de 2 s es modesta (SNR 2,18 dB, Pearson 0,8245); no se han publicado evaluaciones perceptuales (MOS) ni pruebas sobre voz real en la información disponible.
- Riesgo de alucinación no aplica como tal, pero sí de artefactos de reconstrucción en señales fuera de dominio (música, ruido, voces no presentes en el entrenamiento original).
- Sesgos idiomáticos y de hablante: no se documenta la composición del dataset de entrenamiento original ni la cobertura de idiomas o acentos.
- La licencia Apache-2.0 permite uso comercial, pero deben conservarse `LICENSE` y `NOTICE.txt` con los avisos de copyright y patentes de Google Lyra.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño reportado de 0,0 GB pese a los 8,63 MiB del manifiesto; conviene verificar la integridad con los SHA-256 publicados antes de desplegar.
- No se publican garantías de mantenimiento ni hoja de ruta del proyecto ai-inspire.

## Enlaces

- Hugging Face: https://huggingface.co/ai-inspire/latentmux-lyra2-onnx
- Modelo base: https://huggingface.co/rocca/lyra-v2-soundstream
- Repositorio Google Lyra: https://github.com/google/lyra
- Paper de referencia (Kleijn et al., 2021, "Generative Speech Coding with Predictive Variance Regularization"): no disponible como enlace directo en la información proporcionada
- Manifiesto de artefactos: https://huggingface.co/ai-inspire/latentmux-lyra2-onnx/blob/main/manifest.json
- Aviso de licencia: https://huggingface.co/ai-inspire/latentmux-lyra2-onnx/blob/main/NOTICE.txt
