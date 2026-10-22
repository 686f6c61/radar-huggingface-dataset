# danyalmalik/Qwen3-TTS-Tokenizer-12Hz-ONNX-WebGPU

## Resumen

`danyalmalik/Qwen3-TTS-Tokenizer-12Hz-ONNX-WebGPU` no es un modelo de texto a voz completo, sino el **decodificador de voz** (speech decoder) del códec `Qwen/Qwen3-TTS-Tokenizer-12Hz` de Alibaba Cloud, reexportado a ONNX y cuantizado para ejecutarse en un navegador web mediante el backend WebGPU de ONNX Runtime Web. El autor es un tercero (`danyalmalik`), no el equipo Qwen, y lo publica como parte de su proyecto Quick Inference, que lo utiliza en sus pipelines de Qwen3-TTS.

El problema que resuelve es de despliegue: el decodificador original en PyTorch ocupa 457 MB en float32, lo que hace inviable su ejecución en el cliente. Este repositorio ofrece dos variantes cuantizadas sin calibración (`tok_decoder_q4.onnx`, 96 MB, y `tok_decoder_q4c8.onnx`, 124 MB) que convierten directamente códigos discretos en audio a 24 kHz dentro del navegador, sin servidor GPU.

Es relevante porque el códec base de Qwen3-TTS emplea un diseño de 12,5 Hz con 16 codebooks, pensado para reducción extrema de bitrate y streaming de latencia ultrabaja (emisión del primer paquete de inmediato); llevar su decodificador al cliente habilita TTS local en aplicaciones web. La contrapartida es que se trata de un artefacto derivado, sin benchmarks publicados, sin descargas ni validación de la comunidad en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador neuronal de códec de voz con convoluciones causales y atención sobre 72 frames; arquitectura interna por capas no disponible |
| Parametros totales | No disponible (estimación indirecta de ~1,1 × 10^8 a partir de los 457 MB del export float32) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica al ser un decodificador; ventana de atención de 72 frames y decodificación por trozos de 300 frames con 25 frames de contexto izquierdo |
| Tipos de cuantizacion | Int4 simétrica por bloques de 32 sin calibración (MatMulNBits para matmuls; `DequantizeLinear` int4 por bloques para pesos de convolución, opset 21); variante `q4c8` con pesos de convolución en int8 |
| Idiomas soportados | No disponible (el artefacto no procesa texto; el idioma lo determina el modelo Qwen3-TTS que genere los códigos) |
| Licencia | Apache 2.0 (la del modelo base Qwen3-TTS) |
| Formato de pesos | ONNX (opset 21): `tok_decoder_q4.onnx` (96 MB) y `tok_decoder_q4c8.onnx` (124 MB) |

Otros datos de interés: tamaño del repo 0,2 GB; interfaz de entrada `codes` int64 `[batch, 16, frames]`; salida `audio` float32 `[batch, 1, frames × 1920]` a 24 kHz, recortada a [-1, 1]; pipeline declarado en HuggingFace: `text-to-speech`.

## Arquitectura y entrenamiento

El artefacto no entrena nada: es una conversión del decodificador del códec `Qwen3-TTS-Tokenizer-12Hz`. Ese códec se describe en el informe técnico de Qwen3-TTS como un diseño de 12,5 Hz con 16 capas de multi-codebook, orientado a reducción extrema de bitrate y streaming de baja latencia. El decodificador es causal (convoluciones causales y atención limitada a 72 frames), lo que permite decodificar enunciados largos por trozos sin romper la coherencia temporal: el autor documenta la pauta de 300 frames por trozo con 25 frames de contexto izquierdo, descartando los primeros 25 × 1920 samples de cada trozo posterior.

La exportación se realizó con `tools/export/export_qwen3_tts.py` del repositorio Quick Inference, con número de frames dinámico; el export en float32 reproduce el decodificador de PyTorch con una desviación máxima de 4e-5. La cuantización se aplicó sin calibración (redondeo al más cercano, simétrica, bloques de 32): las multiplicaciones de matrices pasan a `MatMulNBits` de 4 bits y los pesos de convolución a `DequantizeLinear` int4 por bloques en opset 21; la variante `q4c8` mantiene esas convoluciones en int8, lo que según el autor evita un realce de la banda alta del espectro. No se documentan datos de entrenamiento, composición del dataset ni etapas de RLHF/DPO para este derivado, ni innovaciones más allá de la propia cuantización.

## Capacidades

- Reconstrucción de forma de onda a partir de tokens discretos: convierte códigos int64 con 16 codebooks en audio PCM float32 mono a 24 kHz.
- Decodificación causal con atención sobre 72 frames, apta para flujos progresivos.
- Decodificación por trozos con contexto izquierdo solapado, lo que permite audios de duración arbitraria con memoria acotada.
- Ejecución en navegador mediante ONNX Runtime Web con backend WebGPU, sin dependencia de Python ni de CUDA en el cliente.
- Dos compromisos tamaño/calidad predefinidos (96 MB int4 y 124 MB int4/int8) seleccionables según presupuesto de ancho de banda y memoria.
- Entrada por lotes (`batch`) y número de frames dinámico en el grafo exportado.
- No incluye front-end de texto, alineador, modelo acústico ni encoder de voz: solo el decodificador. Tampoco se documentan tool calling, capacidades de agente, visión ni audio de entrada, que quedan fuera del alcance del artefacto.

## Casos de uso

- TTS en el navegador sin servidor: integrado en una aplicación web que obtenga los códigos de un modelo Qwen3-TTS (por ejemplo la variante 0.6B CustomVoice), este ONNX decodifica el audio en el cliente con WebGPU, eliminando el coste de GPU en servidor y la latencia de red del audio.
- Lectura por voz en aplicaciones de accesibilidad: un lector de pantalla web puede sintetizar fragmentos cortos en local, con el modelo de 96 MB cacheado por el service worker para funcionar sin conexión.
- Asistentes de voz con streaming de baja latencia: la naturaleza causal del decodificador y la pauta de troceado documentada permiten emitir audio mientras llegan nuevos códigos, adecuado para diálogo por turnos en tiempo real.
- Doblaje y localización en herramientas de edición basadas en web: decodificar pistas generadas por el pipeline Qwen3-TTS dentro del propio editor, evitando subir material de voz a servicios externos.
- Pruebas de regresión de códecs en CI: al ser un grafo ONNX determinista y pequeño, sirve para comparar la salida del decodificador cuantizado frente al de referencia y detectar degradaciones, como hizo el autor midiendo la tasa de error de palabras con Whisper small.en en ocho frases.
- Prototipado e investigación en códecs neuronales: punto de partida para experimentar con cuantización, troceado y calidad perceptual sin necesidad de montar el stack completo de PyTorch.
- Audio interactivo en juegos y experiencias WebGL: narración dinámica o voces generadas en el cliente con un consumo de memoria inferior a 130 MB de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta comprobaciones de fidelidad frente al decodificador original, que se recogen a continuación y que no deben interpretarse como una evaluación de calidad de voz:

| Comprobacion | Resultado reportado |
|---|---|
| Desviacion maxima del export float32 frente al decodificador PyTorch | 4e-5 |
| WER de Whisper small.en sobre 8 frases de prueba (pipeline Qwen3-TTS 0.6B CustomVoice) | Sin cambios respecto al decodificador original |
| MOS, metricas perceptivas o comparativas con otros codecs | No disponibles |
| Latencia o throughput medidos en navegador | No disponibles |

## Requisitos de hardware

- VRAM/GPU: los pesos ocupan 96 MB (`q4`) o 124 MB (`q4c8`); con buffers de activación y atención sobre 72 frames, el consumo es del orden de unos pocos cientos de MB, por lo que cabe en GPUs integradas y en cualquier GPU discreta con soporte WebGPU.
- En GPU de servidor (A100, H100, L40S) el modelo es irrelevante por tamaño: se usaría el decodificador original en PyTorch o el códec completo en vLLM-Omni, no este export.
- Consumer GPU: sí, en cualquier tarjeta con WebGPU activo (por ejemplo, integradas de Intel y AMD, Apple Silicon vía Metal y GPUs NVIDIA/AMD recientes en Chrome o Edge). No requiere CUDA.
- Despliegue: ONNX Runtime Web con backend WebGPU es el objetivo declarado; al ser un grafo ONNX estándar de opset 21 con `MatMulNBits` del dominio contrib de Microsoft, requiere un runtime que soporte ese operador (ONNX Runtime y ONNX Runtime Web).
- Memoria del proceso: el troceado de 300 frames con 25 de contexto mantiene acotado el buffer de salida; cada trozo produce 300 × 1920 muestras por canal.
- Latencia y throughput: no disponibles. La latencia vendrá dominada por el backend WebGPU del navegador y por el tamaño de trozo elegido.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificables de otros códecs neuronales en la información proporcionada, por lo que la comparación se limita a las variantes del propio repositorio y al artefacto original:

| Modelo | Formato | Tamano | Cuantizacion | Entorno de ejecucion | Licencia |
|---|---|---|---|---|---|
| Qwen3-TTS-Tokenizer-12Hz (original) | PyTorch | 457 MB (decodificador, float32) | Ninguna | Python + PyTorch | Apache 2.0 |
| Este repo, `tok_decoder_q4.onnx` | ONNX opset 21 | 96 MB | Int4 por bloques de 32, sin calibracion | ONNX Runtime Web (WebGPU) / ONNX Runtime | Apache 2.0 |
| Este repo, `tok_decoder_q4c8.onnx` | ONNX opset 21 | 124 MB | Int4 en matmuls, int8 en convoluciones | ONNX Runtime Web (WebGPU) / ONNX Runtime | Apache 2.0 |

Frente a otros códecs neuronales de la misma categoría (EnCodec, DAC, Mimi, SNAC), no hay datos de parámetros, bitrate ni calidad disponibles en la información consultada, de modo que cualquier comparación cuantitativa sería especulativa.

## Limitaciones y advertencias

- Es un artefacto derivado de un tercero: no lo mantiene el equipo Qwen y no cuenta con validación de la comunidad (0 descargas y 0 likes en el momento de la consulta).
- Las salidas no son idénticas a las del decodificador original; el autor solo verifica una desviación de 4e-5 en el export float32 previo a la cuantización.
- La cuantización se hizo sin calibración, por lo que no hay garantía de preservación de calidad en todos los dominios de voz; el propio autor señala un realce de la banda alta con la variante int4 en convoluciones, que la `q4c8` evita.
- No es un modelo de texto a voz autónomo: necesita los códigos de un modelo Qwen3-TTS. Sin ese pipeline, el artefacto no produce voz a partir de texto.
- No hay información sobre idiomas soportados ni sobre comportamiento con voces, acentos o dominios distintos de los ocho ejemplos de verificación.
- Riesgo de artefactos acústicos y de alucinación sonora en pasajes largos si no se respeta la pauta de troceado con contexto izquierdo.
- La ejecución depende de la disponibilidad de WebGPU en el navegador; en equipos o navegadores sin ese backend habrá que recurrir a otro runtime ONNX o al modelo original.
- La licencia es Apache 2.0, pero conviene revisar también los términos del modelo base Qwen3-TTS y del pipeline que genere los códigos antes de un uso comercial.
- Ausencia total de benchmarks perceptivos (MOS, similitud de hablante, WER sobre corpus propio): no se puede afirmar que la calidad sea equivalente a la del decodificador original en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/danyalmalik/Qwen3-TTS-Tokenizer-12Hz-ONNX-WebGPU
- Modelo base (códec Qwen3-TTS-Tokenizer-12Hz): https://huggingface.co/Qwen/Qwen3-TTS-Tokenizer-12Hz
- Repositorio de código de Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Proyecto Quick Inference (script de exportación `tools/export/export_qwen3_tts.py`): https://github.com/mdanyalmalik/quick-inf
- Ficha del modelo base en Inferix: https://inferix.co/models/Qwen/Qwen3-TTS-Tokenizer-12Hz
- Documentación del tokenizer en vLLM-Omni: https://docs.vllm.ai/projects/vllm-omni/en/latest/api/vllm_omni/model_executor/models/qwen3_tts/qwen3_tts_tokenizer/
- Notas sobre los tokenizers de 12 Hz y 25 Hz (DeepWiki): https://deepwiki.com/dingausmwald/Qwen3-TTS-Openai-Fastapi/4.3-speech-tokenizer-(12hz-and-25hz)
