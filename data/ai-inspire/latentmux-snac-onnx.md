# ai-inspire/latentmux-snac-onnx

## Resumen

LatentMux SNAC ONNX es un paquete estandarizado de exportaciones ONNX del codec neuronal de audio SNAC (Multi-Scale Neural Audio Codec), desarrollado originalmente por Hubert Siuzdak, Florian Grötschla y Luca A. Lanzendörfer, y redistribuido por el usuario ai-inspire bajo el paraguas de la colección LatentMux. No se trata de un modelo de lenguaje, sino de un codificador y decodificador de audio neuronal que comprime formas de onda PCM en secuencias discretas de tokens (codebooks RVQ jerárquicos) y las reconstruye de vuelta a audio. Incluye dos variantes: una a 24 kHz mono con bitrate fijo de aproximadamente 0,98 kbps y tres escalas, y otra a 44,1 kHz mono con bitrate de aproximadamente 2,58 kbps y cuatro escalas.

El paquete redistribuye los grafos ONNX originales de onnx-community (snac_24khz-ONNX y snac_44khz-ONNX) bajo nombres de fichero unificados (`encoder_fp32.onnx`, `decoder_int8.onnx`, etc.) y con sumas de verificación SHA-256 publicadas, lo que facilita la integración en pipelines de inferencia en Rust, C++ o Python mediante ONNX Runtime. Se ofrecen precisiones FP32 e INT8, con un total de ocho ficheros binarios que suman 459,11 MiB.

Su relevancia actual radica en que los codecs neuronales son el componente central de los sistemas de audio generativo (TTS, música, diálogo hablado) y de los pipelines de compresión de audio de baja latencia. Esta distribución estandarizada elimina el trabajo de conversión y verificación, y permite ejecutar el codec en una amplia gama de backends de ONNX Runtime (CPU, CUDA, TensorRT, CoreML, DirectML, ROCm, OpenVINO, WebGPU) sin depender de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codec neuronal de audio SNAC con RVQ jerárquico multi-escala (3 codebooks a 24 kHz, 4 codebooks a 44,1 kHz) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (codec de audio; entrada `[1, 1, N_samples]`) |
| Tipos de cuantizacion | FP32 e INT8 (grafos ONNX precompilados) |
| Idiomas soportados | no disponible (codec de audio independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (`encoder_fp32.onnx`, `encoder_int8.onnx`, `decoder_fp32.onnx`, `decoder_int8.onnx`) |
| Frecuencias de muestreo | 24 kHz mono y 44,1 kHz mono |
| Bitrate | ~0,98 kbps (24k, 3 escalas) y ~2,58 kbps (44k, 4 escalas) |
| Tamano del repositorio | 0,5 GB (459,11 MiB en 8 ficheros binarios) |
| Execution providers | CPU, DirectML, CUDA, TensorRT, CoreML, ROCm, OpenVINO, WebGPU |

## Arquitectura y entrenamiento

SNAC es un codec neuronal de audio que emplea un esquema de cuantización vectorial residual (RVQ) jerárquico multi-escala. En lugar de codificar el audio con una única tasa de tokens, distribuye la información en varias escalas temporales: la variante de 24 kHz usa tres codebooks y la de 44,1 kHz usa cuatro, cada uno con cuantización de 12 bits. El encoder transforma la forma de onda PCM de entrada en tensores de códigos `audio_codes.0..K` de tipo `int64`, y el decoder reconstruye la señal PCM a partir de esos códigos. Esta jerarquía permite que los primeros niveles capturen estructura gruesa y los posteriores detalle fino, lo que resulta útil tanto para compresión como para modelado generativo sobre tokens discretos.

El paquete no incluye información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no procede en un codec). La model card indica explícitamente que se redistribuyen los grafos ONNX originales sin modificaciones, por lo que los detalles de entrenamiento corresponden al trabajo original de SNAC (arXiv:2410.14411). La innovación destacable de esta distribución es la estandarización de nombres, la verificación SHA-256 y la inclusión de variantes INT8 listas para usar, además de una recomendación medida: en CPUs sin AVX512-VNNI ni aceleración nativa QDQ, FP32 es aproximadamente el doble de rápido que INT8.

## Capacidades

- Codificación de audio PCM mono a 24 kHz o 44,1 kHz en secuencias discretas de tokens RVQ jerárquicos.
- Decodificación de secuencias de tokens de vuelta a forma de onda PCM.
- Compresión de audio a bitrates muy bajos (~0,98 kbps y ~2,58 kbps), adecuada para transmisión y almacenamiento.
- Ejecución en múltiples backends de ONNX Runtime (CPU, CUDA, TensorRT, CoreML, DirectML, ROCm, OpenVINO, WebGPU).
- Dos precisiones (FP32 e INT8) con checksums verificables para integración en producción.
- Interfaz tensorial estable y documentada: entrada `input_values [1, 1, N_samples]` float32 en el encoder; entradas `audio_codes.0..K [1, T_k]` int64 en el decoder.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües en el sentido de un LLM; es un componente de audio.

## Casos de uso

- Compresión de voz para telefonía y VoIP: el codec a 24 kHz con ~0,98 kbps permite transmitir voz inteligible con un ancho de banda mínimo, adecuado para entornos con conectividad limitada.
- Preprocesado de pipelines de TTS y audio generativo: los tokens RVQ jerárquicos sirven como representación intermedia para modelos generativos de audio que predicen códigos en lugar de muestras PCM.
- Almacenamiento eficiente de archivos de audio: la variante de 44,1 kHz a ~2,58 kbps reduce drásticamente el espacio frente a PCM o MP3 en bibliotecas de música o archivos de voz.
- Integración en aplicaciones nativas en Rust/C++: los grafos ONNX con nombres unificados y checksums permiten empaquetar el codec en binarios de escritorio o móviles sin dependencia de PyTorch.
- Procesamiento en el navegador: mediante el execution provider WebGPU de ONNX Runtime se puede ejecutar el codec en cliente para aplicaciones web de audio.
- Tokenización para modelos de lenguaje de audio: convertir audio en secuencias discretas permite alimentar modelos autoregresivos multimodales o de diálogo hablado.
- Despliegue en dispositivos de borde: la variante INT8 del encoder de 24 kHz ocupa solo 7,22 MiB, lo que facilita su inclusión en sistemas embebidos con memoria limitada.

## Benchmarks y rendimiento

Datos medidos con `latentmux bench` sobre ONNX Runtime CPU con 2 hilos:

| Variante | Precision | Tamano `.nmc` (2,0 s) | kbps efectivos | Encode (ms) | Decode (ms) | SNR (dB) | SegSNR (dB) | Pearson | warm_rtf | RAM pico |
|---|---|---|---|---|---|---|---|---|---|---|
| snac (24k) | fp32 | 376 B | 1,469 | 4419,4 | 5133,7 | 0,34 | 1,51 | 0,3891 | 1,360 | 130,73 MB |
| snac (24k) | int8 | 376 B | 1,469 | 5519,0 | 7790,8 | 0,62 | 2,70 | 0,5166 | 2,934 | 127,60 MB |
| snac44 (44,1k) | fp32 | 808 B | 3,200 | 12182,9 | 19602,9 | 6,84 | 7,98 | 0,8909 | 5,612 | 280,12 MB |

No se han publicado resultados de benchmarks comparativos con otros codecs (por ejemplo, EnCodec o DAC) en la información disponible.

## Requisitos de hardware

- VRAM estimada: los grafos son pequeños; el decoder de 44,1 kHz en FP32 ocupa 146,97 MiB y el encoder de 24 kHz en INT8 solo 7,22 MiB. En GPU la huella es mínima y cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU compatible con CUDA, TensorRT, ROCm o CoreML; no se requiere hardware de gama alta. Una RTX 4090 o A100 están sobradamente dimensionadas.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con soporte ONNX Runtime, e incluso en CPU.
- RAM pico medida en CPU: 127,60–130,73 MB para 24 kHz y 280,12 MB para 44,1 kHz.
- Opciones de despliegue: ONNX Runtime (Python, C++, Rust), con execution providers CPU, CUDA, TensorRT, DirectML, CoreML, ROCm, OpenVINO y WebGPU; también mediante la CLI `latentmux`.
- Latencia y throughput: en CPU con 2 hilos, el warm_rtf es 1,360 (24k FP32), 2,934 (24k INT8) y 5,612 (44k FP32); es decir, en CPU el proceso es más lento que tiempo real en estas condiciones. No se dispone de datos de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Frecuencia | Bitrate | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| LatentMux SNAC ONNX (este) | Codec RVQ jerárquico | 24 kHz / 44,1 kHz | ~0,98 / ~2,58 kbps | MIT | ONNX FP32/INT8 | Redistribución estandarizada con checksums |
| SNAC original (hubertsiuzdak/snac) | Codec RVQ jerárquico | 24 kHz / 44,1 kHz | ~0,98 / ~2,58 kbps | MIT | PyTorch | Fuente upstream; requiere PyTorch |
| onnx-community/snac_24khz-ONNX | Codec RVQ jerárquico | 24 kHz | ~0,98 kbps | MIT | ONNX | Exportación upstream sin estandarizar nombres |
| EnCodec (Meta) | Codec RVQ | 24 kHz / 48 kHz | variable (1,5–24 kbps) | CC-BY-NC / MIT según versión | PyTorch | No disponible en esta búsqueda como ONNX estandarizado |

No se dispone de datos de benchmarks comparativos entre estos codecs en la información proporcionada.

## Limitaciones y advertencias

- Bitrate fijo: no es configurable; 0,98 kbps a 24 kHz y 2,58 kbps a 44,1 kHz. Requiere alineación de superframe gestionada automáticamente por `latentmux`.
- En CPUs sin kernels INT8 QDQ rápidos (sin AVX512-VNNI), la decodificación INT8 es más lenta que FP32 (warm_rtf 2,934 frente a 1,360 en 24k).
- Calidad de reconstrucción limitada: los valores de SNR y SegSNR medidos en CPU son bajos (0,34–6,84 dB), lo que sugiere artefactos perceptibles en la reconstrucción; no es adecuado para audio de alta fidelidad.
- Solo audio mono; no soporta estéreo ni multicanal en las variantes incluidas.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- No se documentan sesgos específicos, pero al ser un codec entrenado con datos de audio, puede degradar ciertos tipos de señal (instrumentos poco representados, ruido, voces atípicas).
- Licencia MIT permite uso comercial, pero se debe conservar `LICENSE` y `NOTICE.txt` con las atribuciones y avisos de patentes del proyecto original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/ai-inspire/latentmux-snac-onnx
- Repositorio original SNAC: https://github.com/hubertsiuzdak/snac
- Paper SNAC (arXiv:2410.14411): https://arxiv.org/abs/2410.14411
- Modelo base onnx-community 24 kHz: https://huggingface.co/onnx-community/snac_24khz-ONNX
- Modelo base onnx-community 44 kHz: https://huggingface.co/onnx-community/snac_44khz-ONNX
- Modelo base original 24 kHz: https://huggingface.co/hubertsiuzdak/snac_24khz
- Modelo base original 44 kHz: https://huggingface.co/hubertsiuzdak/snac_44khz
