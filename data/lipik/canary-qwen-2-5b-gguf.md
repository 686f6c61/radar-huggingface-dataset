# lipik/canary-qwen-2.5b-gguf

## Resumen

Canary-Qwen-2.5B es un modelo de reconocimiento automatico del habla (ASR) en ingles desarrollado por NVIDIA, publicado originalmente como `nvidia/canary-qwen-2.5b`. Emplea la arquitectura SALM (Speech-Augmented Language Model): un codificador de audio FastConformer de 32 capas con `d_model=1024` inyecta embeddings de audio en un LM causal Qwen3-1.7B de 28 capas con `hidden_size=2048`, a traves de tokens de audio en una posicion centinela del prompt. El resultado es un sistema de transcripcion offline que produce texto con puntuacion y mayusculas (PnC) mediante decodificacion greedy.

La ficha que nos ocupa, `lipik/canary-qwen-2.5b-gguf`, es una conversion a formato GGUF del modelo original, empaquetada para su uso con la libreria `transcribe.cpp`. Incluye seis presets de cuantizacion (BF16, F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) que van desde 4,73 GB hasta 1,62 GB, todos ellos con un WER identico de 1,63% sobre LibriSpeech `test-clean`. La conversion se valido contra la referencia NeMo SALM 2.7.3 y esta anclada al commit upstream `b1469e1` del 15 de mayo de 2026.

Su relevancia practica reside en que permite ejecutar un modelo ASR de 2,5 mil millones de parametros en hardware de consumo y en CPU, con backend Metal en Apple Silicon y Vulkan en GPUs integradas AMD, manteniendo la calidad numerica del modelo original. Es, por tanto, una pieza util para transcripcion local, privada y sin dependencia de APIs en la nube, aunque limitada al idioma ingles y a audio de 16 kHz mono en WAV.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SALM (Speech-Augmented Language Model): FastConformer (32 capas, d_model=1024) + Qwen3-1.7B (28 capas, hidden_size=2048) |
| Parametros totales | 2.533.757.456 (2,5 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (libreria transcribe.cpp) |
| Tamano del repo | 2,8 GB |
| Entrada de audio | WAV mono a 16 kHz |
| Modos de operacion | ASR (transcripcion) y LLM (post-procesado del transcript) |
| Streaming | No |
| Traduccion | No |
| Deteccion de idioma | No |
| Timestamps | No |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SALM: un encoder de audio FastConformer de 32 capas con dimension de modelo 1024 procesa la senal de audio y genera embeddings que se inyectan como tokens de audio en una posicion centinela dentro del prompt de un decoder basado en Qwen3-1.7B (28 capas, hidden_size=2048). La decodificacion es greedy y el modelo produce directamente texto con puntuacion y mayusculas. El modelo opera en dos modos diferenciados: en modo ASR solo transcribe; en modo LLM conserva las capacidades del Qwen3 subyacente para post-procesar el transcript (resumir, responder preguntas), pero pierde el acceso al audio crudo.

Los detalles concretos del entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada. La model card original de NVIDIA cita un rendimiento de 418 RTFx para el modelo en su framework nativo. La conversion GGUF se valido contra NeMo SALM 2.7.3 con `dither=0.0` y `model.generate` greedy, obteniendo 1,61% de WER en la referencia CPU torch, frente al 1,60% publicado por NVIDIA.

## Capacidades

- Transcripcion de voz a texto en ingles con puntuacion y mayusculas automaticas (PnC).
- Procesamiento offline de audio WAV mono a 16 kHz.
- Modo LLM para post-procesado del transcript: resumen, respuesta a preguntas sobre el texto transcrito.
- Decodificacion greedy determinista.
- Ejecucion en CPU, Metal (Apple Silicon) y Vulkan (GPUs integradas AMD).
- No soporta streaming, traduccion, deteccion de idioma ni generacion de timestamps.
- No soporta tool calling ni function calling en el sentido de agentes LLM; el modo LLM es solo para post-procesado textual.
- Capacidades multilingues: solo ingles.

## Casos de uso

- Transcripcion local de reuniones y entrevistas: el modelo procesa ficheros WAV de 16 kHz mono y genera transcripts con puntuacion, adecuado para entornos donde la privacidad impide enviar audio a APIs externas.
- Generacion de subtitulos para contenido en ingles: a partir de la transcripcion se pueden derivar subtitulos, aunque sin timestamps nativos habria que alinear post hoc con herramientas externas.
- Actas y notas de voz en macOS: con el backend Metal en Apple Silicon (RTF 39,8 en M4 Max) la transcripcion es practicamente instantanea para audios cortos y medios.
- Post-procesado de transcripts con el modo LLM: una vez transcrito el audio, el mismo modelo puede resumir la reunion o responder preguntas sobre el contenido en ingles.
- Procesamiento por lotes en servidores sin GPU: con el backend CPU (RTF 7,3 en M4 Max, 2,1 en Ryzen 4750U) se pueden transcribir colas de audios en hardware modesto.
- Integracion en pipelines de transcripcion autoalojados: la libreria `transcribe.cpp` permite compilar un binario CLI (`transcribe-cli`) que se puede encadenar con `ffmpeg` para convertir formatos y automatizar flujos.
- Investigacion en ASR de bajo coste: el modelo sirve como referencia cuantizada para comparar calidad WER frente al modelo original en BF16.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| WER LibriSpeech test-clean (BF16) | 1,63% |
| WER LibriSpeech test-clean (F16) | 1,63% |
| WER LibriSpeech test-clean (Q8_0) | 1,63% |
| WER LibriSpeech test-clean (Q6_K) | 1,63% |
| WER LibriSpeech test-clean (Q5_K_M) | 1,63% |
| WER LibriSpeech test-clean (Q4_K_M) | 1,63% |
| WER referencia NeMo SALM (CPU torch) | 1,61% (IC 95%: 1,47%-1,75%) |
| WER publicado por NVIDIA | 1,60% |
| RTF en Apple M4 Max (Metal) | 39,8 |
| RTF en Apple M4 Max (CPU) | 7,3 |
| RTF en Ryzen 4750U (Vulkan) | 4,1 |
| RTF en Ryzen 4750U (CPU) | 2,1 |
| RTFx publicado por NVIDIA | 418 |

El WER se midio sobre las 2620 emisiones de LibriSpeech `test-clean` con el normalizador de texto estilo Whisper y jiwer 3.x. Las diferencias por emision son ruido a nivel de token consistente con la precision de pesos BF16 (homofonos, cambios en fronteras de palabra, sustituciones de palabras funcionales).

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: Q4_K_M 1,62 GB; Q5_K_M 1,85 GB; Q6_K 2,06 GB; Q8_0 2,61 GB; BF16/F16 4,73 GB.
- Cabe en GPUs de consumo: cualquier GPU con al menos 3 GB de VRAM para Q4_K_M, y 6 GB o mas para BF16/F16.
- GPUs recomendadas: no hay recomendaciones oficiales en la informacion disponible; el modelo esta validado en Apple M4 Max (Metal) y en Ryzen 4750U (Vulkan). Para CUDA no se proporcionan datos de rendimiento.
- Despliegue: exclusivamente mediante `transcribe.cpp` (compilacion CMake y binario `transcribe-cli`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 39,8 (Metal M4 Max), 7,3 (CPU M4 Max), 4,1 (Vulkan Ryzen 4750U) y 2,1 (CPU Ryzen 4750U). Un RTF de 39,8 implica procesar aproximadamente 40 segundos de audio por segundo de computo.
- Entrada: WAV mono a 16 kHz; para otros formatos hay que convertir previamente con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | WER LibriSpeech test-clean |
|---|---|---|---|---|---|---|
| lipik/canary-qwen-2.5b-gguf | 2,5 B | No disponible | en | CC-BY-4.0 | GGUF | 1,63% |
| nvidia/canary-qwen-2.5b (original) | 2,5 B | No disponible | en | CC-BY-4.0 | NeMo/safetensors | 1,60% |
| Whisper large-v3 | No disponible en la informacion | No disponible | Multilingue | MIT (segun conocimiento general, no verificado aqui) | Varios | No disponible |

La comparacion con Whisper large-v3 no puede completarse con datos de la informacion proporcionada; se incluye solo como referencia de categoria. El modelo original de NVIDIA y esta conversion GGUF son funcionalmente equivalentes en calidad (diferencia de 0,03 puntos de WER), con la ventaja del GGUF en portabilidad y ejecucion en CPU/hardware de consumo.

## Limitaciones y advertencias

- Solo ingles: no soporta otros idiomas, traduccion ni deteccion de idioma.
- Sin streaming: requiere el fichero de audio completo en WAV mono a 16 kHz.
- Sin timestamps: no genera marcas temporales, lo que limita la generacion directa de subtitulos sincronizados.
- Riesgo de alucinacion: como todo modelo generativo, puede producir texto plausible no presente en el audio, especialmente en segmentos ruidosos o con habla solapada; la decodificacion greedy reduce pero no elimina este riesgo.
- En modo LLM el modelo no procesa audio, solo el transcript; no debe esperarse comprension acustica en ese modo.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; es necesario citar a NVIDIA y cumplir los terminos de la licencia.
- La validacion se hizo contra NeMo SALM 2.7.3 y el commit `6f6c699` de transcribe.cpp; cambios de version pueden alterar resultados.
- El rendimiento en CUDA no esta documentado en la informacion disponible.
- El repositorio tiene muy pocas descargas (30) y cero likes en el momento de la consulta, lo que sugiere una adopcion temprana y poca validacion comunitaria independiente.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion proporcionada; al ser un modelo entrenado principalmente con datos en ingles, es probable que tenga peor rendimiento con acentos no nativos o variedades dialectales, pero esto no se cuantifica en la ficha.

## Enlaces

- Repositorio HuggingFace de la conversion: https://huggingface.co/lipik/canary-qwen-2.5b-gguf
- Modelo base original: https://huggingface.co/nvidia/canary-qwen-2.5b
- Commit upstream del modelo base: https://huggingface.co/nvidia/canary-qwen-2.5b/commit/b1469e1bba1cfe140205529c79c434ca47180960
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/6f6c699
- Pagina del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/canary-qwen-2.5b.md
- Descarga BF16: https://huggingface.co/handy-computer/canary-qwen-2.5b-gguf/resolve/main/canary-qwen-2.5b-BF16.gguf
- Descarga F16: https://huggingface.co/handy-computer/canary-qwen-2.5b-gguf/resolve/main/canary-qwen-2.5b-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/canary-qwen-2.5b-gguf/resolve/main/canary-qwen-2.5b-Q8_0.gguf
- Descarga Q6_K: https://huggingface.co/handy-computer/canary-qwen-2.5b-gguf/resolve/main/canary-qwen-2.5b-Q6_K.gguf
- Descarga Q5_K_M: https://huggingface.co/handy-computer/canary-qwen-2.5b-gguf/resolve/main/canary-qwen-2.5b-Q5_K_M.gguf
- Descarga Q4_K_M: https://huggingface.co/handy-computer/canary-qwen-2.5b-gguf/resolve/main/canary-qwen-2.5b-Q4_K_M.gguf
- Licencia CC-BY-4.0: https://choosealicense.com/licenses/cc-by-4.0/
- Paper Attention Is All You Need (arxiv:1706.03762): https://arxiv.org/abs/1706.03762
- Paper arxiv:2503.05931: https://arxiv.org/abs/2503.05931
- Paper arxiv:2505.13404: https://arxiv.org/abs/2505.13404
- Paper arxiv:2310.09424: https://arxiv.org/abs/2310.09424
- Paper arxiv:2104.02821: https://arxiv.org/abs/2104.02821
