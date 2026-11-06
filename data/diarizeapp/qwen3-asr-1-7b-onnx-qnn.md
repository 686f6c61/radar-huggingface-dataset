# diarizeapp/qwen3-asr-1.7b-onnx-qnn

## Resumen

Qwen3-ASR-1.7B ONNX QNN es una compilación precompilada del modelo de reconocimiento automático del habla Qwen/Qwen3-ASR-1.7B-hf, empaquetada por el usuario diarizeapp en formato ONNX con el Execution Provider QNN de Qualcomm. El objetivo es ejecutar la inferencia de ASR directamente sobre la NPU del Snapdragon X Elite (SM8380) en equipos Windows ARM, evitando el coste y la latencia de la inferencia en CPU o GPU. El repositorio incluye los grafos compilados (`EPContext`) del encoder de audio y del decoder, junto con los binarios QNN asociados.

El modelo base es un transformer de 1.700 millones de parámetros con un encoder de audio que convierte mel-espectrogramas en embeddings y un decoder autorregresivo de 28 capas con 8 cabezas de atención y dimensión oculta 2048. Esta variante concreta emplea cuantización w8a16m en el decoder y está atada a la versión de QAIRT 2.50.40.260831140417 y al SoC SM8380, por lo que no es portable a otros dispositivos sin recompilar con el script `qwen3_asr_pipeline.py` incluido en el repositorio.

La relevancia actual reside en la creciente demanda de ASR local en dispositivos (on-device) con privacidad de datos y sin dependencia de la nube, aprovechando aceleradores NPU de bajo consumo. El autor reporta una tasa de error de caracteres (CER) macro de 0.0 sobre cuatro clips de prueba en inglés y japonés, con un factor de tiempo real (RTF) medio de 0.489 y 11 tokens por segundo, lo que indica inferencia más rápida que tiempo real en ese hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (encoder de audio + decoder autorregresivo de 28 capas, 8 cabezas, dim 2048) |
| Parametros totales | 1.700 millones (modelo base Qwen3-ASR-1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventanas de audio de 8 s por pasada, 2 ventanas por pasada; contexto de decoder no especificado) |
| Tipos de cuantizacion | w8a16m en el decoder; embeddings en fp16; encoder compilado a EPContext |
| Idiomas soportados | Inglés (en), japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (EPContext) + binarios QNN, embeddings en `.npy` fp16, tokenizer.json |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño del modelo base Qwen3-ASR-1.7B: un encoder de audio que procesa mel-espectrogramas de 128 bandas y los proyecta a embeddings de dimensión 2048, y un decoder transformer de 28 capas con 8 cabezas de atención (dimensión de cabeza 128) que genera la transcripción de forma autorregresiva. El decoder utiliza KV cache de 28 pares de tensores `[1,8,384,128]` y posición rotatoria (RoPE) con frecuencias calculadas sobre dimensión 128. La compilación QNN fija los grafos a formas concretas: encoder con entrada `[1,128,800]` (8 s de audio) y salida `[1,104,2048]`, prefill en trozos de 32 tokens y decode token a token.

No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición ni si se aplicaron técnicas de RLHF o DPO, ya que la model card de esta compilación no lo detalla y no se ha proporcionado la del modelo base. La innovación técnica destacable es la compilación `EPContext` para NPU Qualcomm con cuantización w8a16m (pesos int8, activaciones fp16, multiplicaciones mixtas), que permite ejecutar encoder y decoder íntegramente en la NPU del Snapdragon X Elite. El host se encarga del preprocesado de audio (log-mel con ventana Hann de 400, hop 160, padding reflectivo de 200), la gestión del KV cache y el bucle de decodificación greedy con parada en tokens EOS [151643, 151645] o tras 24 tokens idénticos consecutivos.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés y japonés a partir de audio de 16 kHz mono float32.
- Transcripción con salida estructurada en formato `language <Name><asr_text>transcript`, que permite forzar el idioma mediante tokens de control.
- Procesamiento por ventanas de 8 segundos, con concatenación de embeddings entre ventanas para audio de mayor duración.
- Decodificación greedy determinista, adecuada para transcripción reproducible.
- Ejecución íntegra en NPU Qualcomm (encoder y decoder) con el host gestionando solo el preprocesado y el bucle de control.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio de salida ni modo thinking en esta compilación.
- Capacidades multilingües limitadas a los idiomas declarados (inglés y japonés).

## Casos de uso

- Transcripción local de reuniones en portátiles Windows ARM con Snapdragon X Elite: el modelo ejecuta la inferencia en la NPU, liberando CPU y GPU y manteniendo el audio en el dispositivo, lo que resulta adecuado para entornos con requisitos de privacidad.
- Subtitulado en tiempo real de contenido en inglés y japonés: con un RTF de 0.489 y ventanas de 8 s, el modelo puede procesar audio más rápido que tiempo real en el hardware objetivo, permitiendo generar subtítulos con latencia contenida.
- Dictado por voz en aplicaciones de escritorio: la integración vía ONNX Runtime con el EP QNN permite incrustar el modelo en aplicaciones nativas sin dependencias de servicios en la nube.
- Transcripción de notas de voz en dispositivos de borde: el tamaño del repositorio (5,4 GB) y la compilación para NPU lo hacen viable en equipos con recursos limitados de cómputo general.
- Procesamiento por lotes de archivos de audio en pipelines locales: el script `qwen3_asr_pipeline.py` permite recompilar y adaptar el flujo para procesar colecciones de clips de forma automatizada.
- Investigación en eficiencia de ASR on-device: sirve como referencia para medir CER, RTF y throughput de un modelo de 1.7B sobre NPU Qualcomm frente a grafos fp32 en CPU.
- Desarrollo de asistentes de voz embebidos: la salida estructurada con etiqueta de idioma facilita el enrutamiento posterior de la transcripción en aplicaciones multilingües inglés-japonés.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| CER macro (4 clips EN/JA) | 0.0 |
| Peor clip (CER) | 0.0 |
| RTF medio | 0.489 |
| Throughput | 11.0 tokens/s |
| Referencia de comparación | Grafos fp32 en CPU |

Los datos proceden de la model card del autor y se midieron sobre cuatro clips en inglés y japonés contra los grafos fp32 en CPU. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, LibriSpeech WER, etc.) en la información disponible.

## Requisitos de hardware

- NPU Qualcomm Snapdragon X Elite (SM8380) obligatoria para los grafos `EPContext`; los binarios están atados a QAIRT 2.50.40.260831140417.
- VRAM/RAM estimada: el repositorio ocupa 5,4 GB; el modelo base de 1.7B en fp16 requiere aproximadamente 3,4 GB de pesos, más overhead de KV cache y activaciones.
- GPU dedicadas (A100, H100, RTX 4090) no aplicables a esta compilación, que está orientada a NPU.
- No cabe ni está pensado para GPUs de consumo convencionales; requiere el SoC Snapdragon X Elite o recompilación para otro hardware.
- Despliegue mediante ONNX Runtime con el Execution Provider QNN; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF 0.489 y 11 tokens/s medidos en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato/Despliegue |
|---|---|---|---|---|---|
| diarizeapp/qwen3-asr-1.7b-onnx-qnn | 1.7B | No disponible | en, ja | Apache 2.0 | ONNX QNN (NPU Snapdragon X Elite) |
| Qwen/Qwen3-ASR-1.7B-hf | 1.7B | No disponible | No disponible | Apache 2.0 | Safetensors (Hugging Face) |
| Whisper large-v3 | 1.55B | 30 s de audio | Multilingüe | MIT | Safetensors, ONNX, CTranslate2 |
| Whisper small | 244M | 30 s de audio | Multilingüe | MIT | Safetensors, ONNX, CTranslate2 |

La comparación con Whisper se ofrece como referencia de categoría (ASR de tamaño similar o menor); no se dispone de datos de rendimiento comparativos en la información proporcionada. La ventaja diferencial de esta compilación es la ejecución en NPU Qualcomm, frente a alternativas orientadas a CPU/GPU.

## Limitaciones y advertencias

- Portabilidad nula: los binarios `EPContext` están compilados para SM8380 y QAIRT 2.50.40.260831140417; requieren recompilación con `qwen3_asr_pipeline.py` para otros dispositivos o versiones del SDK.
- Idiomas limitados a inglés y japonés según la model card; no se garantiza calidad en otros idiomas.
- Riesgo de alucinación inherente a modelos generativos de ASR, especialmente en audio con ruido, acentos no cubiertos o habla solapada.
- Los benchmarks reportados se basan en solo cuatro clips, por lo que la generalización de CER 0.0 es limitada y debe validarse en dominios propios.
- La decodificación es greedy y determinista, sin opciones de beam search documentadas.
- La licencia Apache 2.0 permite uso comercial, pero el autor recomienda verificar la licencia del modelo base antes de redistribuir.
- El repositorio tiene pocas descargas (29) y ningún like, lo que implica escasa validación comunitaria.
- La ventana de audio es de 8 s por pasada; audios largos requieren gestión manual de ventanas y concatenación de embeddings.
- No se documentan sesgos específicos del modelo base en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/diarizeapp/qwen3-asr-1.7b-onnx-qnn
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
