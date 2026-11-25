# GhaythMahadin/canary-qwen-2.5b-gguf

## Resumen

Canary-Qwen-2.5b es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por NVIDIA, publicado originalmente como `nvidia/canary-qwen-2.5b`. La ficha que nos ocupa es una conversión a formato GGUF realizada por el usuario GhaythMahadin para su uso con `transcribe.cpp`, una implementación en C++ orientada a inferencia local. El modelo combina un codificador de audio FastConformer de 32 capas (`d_model=1024`) con un modelo de lenguaje causal Qwen3-1.7B de 28 capas (`hidden_size=2048`), unidos mediante inyección de tokens de audio en una posición centinela del prompt (arquitectura SALM, Speech-Augmented Language Model). El total de parámetros es de 2.533.757.456.

El modelo resuelve la transcripción de voz a texto offline en inglés, con puntuación y capitalización (PnC), a partir de audio WAV mono a 16 kHz. Su relevancia actual radica en que ofrece una calidad de transcripción de referencia (1,63% de WER en LibriSpeech test-clean en todas las cuantizaciones GGUF) con un tamaño reducido que permite ejecución en hardware de consumo, algo poco habitual en modelos ASR de esta precisión. La conversión GGUF facilita el despliegue sin dependencias de PyTorch ni de CUDA.

La licencia es CC-BY-4.0, heredada del modelo base, y el modelo está pensado para uso comercial. El modelo original opera en dos modos: modo ASR (solo transcripción) y modo LLM (razonamiento sobre la transcripción, sin acceso al audio). Esta conversión GGUF, según los datos disponibles, está orientada al modo ASR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SALM (Speech-Augmented Language Model): FastConformer (32 capas, d_model=1024) + Qwen3-1.7B (28 capas, hidden_size=2048) |
| Parametros totales | 2.533.757.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF |
| Tamano del repo | 4,5 GB |

## Arquitectura y entrenamiento

La arquitectura es un modelo SALM en el que un codificador de audio FastConformer de 32 capas con `d_model=1024` transforma la señal de audio en embeddings que se inyectan como tokens en una posición centinela del prompt de un modelo de lenguaje causal Qwen3-1.7B de 28 capas con `hidden_size=2048`. La decodificación es greedy. El modelo toma audio WAV mono a 16 kHz y produce una transcripción en inglés con puntuación y capitalización.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. La model card de la conversión indica que se portó desde el commit `b1469e1bba1cfe140205529c79c434ca47180960` del modelo base (fijado el 2026-05-15) y se validó contra la referencia NeMo SALM 2.7.3 en el commit `6f6c699` de transcribe.cpp el 2026-05-16. Según la model card original, el modelo alcanza 418 RTFx en el hardware de referencia de NVIDIA.

## Capacidades

- Transcripción de voz a texto en inglés con puntuación y capitalización (PnC).
- Procesamiento offline de audio WAV mono a 16 kHz.
- Decodificación greedy.
- Modo ASR: transcripción directa sin capacidades de razonamiento.
- El modelo original soporta modo LLM para posprocesar la transcripción (resumen, preguntas sobre el texto), pero esta conversión GGUF no documenta dicha funcionalidad.
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No soporta detección de idioma (`lang_detect: false`).
- No genera marcas de tiempo (`timestamps: none`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en esta conversión.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo convierte grabaciones en WAV de 16 kHz a texto con puntuación y capitalización, adecuado para generar actas o notas a partir de audio grabado en inglés, con una calidad de 1,63% de WER en condiciones limpias.
- Subtitulado offline de contenido audiovisual: se puede integrar en un pipeline que extraiga audio con ffmpeg (`-ar 16000 -ac 1`) y genere transcripciones en inglés para vídeos o pódcasts, sin depender de servicios en la nube.
- Procesamiento por lotes en servidores sin GPU: gracias a las cuantizaciones Q4_K_M (1,62 GB) y Q5_K_M (1,85 GB), el modelo puede ejecutarse en CPU con rendimiento aceptable (RTF 2,1 en Ryzen 4750U vía CPU), útil para transcripciones masivas en infraestructura existente.
- Aplicaciones de escritorio y edge computing: el tamaño reducido de las cuantizaciones y el backend Metal (RTF 39,8 en Apple M4 Max) permiten integrar transcripción local en aplicaciones macOS sin conexión.
- Accesibilidad y dictado: integración en herramientas de dictado por voz o generación de transcripciones para personas con discapacidad auditiva, con procesamiento local que evita enviar audio a terceros.
- Preprocesamiento para pipelines de NLP: las transcripciones generadas pueden alimentar sistemas posteriores de análisis de sentimiento, extracción de entidades o resumen, aprovechando la calidad de transcripción del modelo como primer paso.
- Archivado y búsqueda de audio: transcripción de archivos históricos de audio en inglés para permitir búsqueda textual sobre el contenido, con la ventaja de que todo el procesamiento ocurre en local.

## Benchmarks y rendimiento

| Metrica | BF16 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,63 | 1,63 | 1,63 | 1,63 | 1,63 | 1,63 |
| Tamano (GB) | 4,73 | 4,73 | 2,61 | 2,06 | 1,85 | 1,62 |

Referencia NeMo SALM en la misma máquina (CPU torch, dither=0.0, greedy): 1,61% de WER con IC bootstrap del 95% [1,47%, 1,75%]. NVIDIA publica 1,60% para el modelo original. El WER se midió sobre el split completo de LibriSpeech `test-clean` (2620 enunciados en inglés) con el normalizador de texto estilo Whisper y jiwer 3.x, en el backend Metal de un Apple M4.

Rendimiento (RTF, Real-Time Factor):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 39,8 |
| Apple M4 Max | CPU | 7,3 |
| Ryzen 4750U | Vulkan | 4,1 |
| Ryzen 4750U | CPU | 2,1 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB para Q4_K_M, 1,9 GB para Q5_K_M, 2,1 GB para Q6_K y 2,7 GB para Q8_0 (tamaño del archivo más overhead de contexto y buffers de audio).
- GPU recomendadas: no se especifican en la información disponible; el modelo se ha validado en Apple M4 Max con backend Metal y en Ryzen 4750U con Vulkan.
- Cabe en GPU de consumo: sí, las cuantizaciones Q4_K_M y Q5_K_M caben holgadamente en GPUs con 4 GB o más de VRAM.
- Opciones de despliegue: `transcribe.cpp` (compilación desde fuente con CMake, binario `transcribe-cli`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 39,8 en Metal (M4 Max) y 4,1 en Vulkan (Ryzen 4750U); RTF de 7,3 y 2,1 en CPU respectivamente. El modelo original reporta 418 RTFx en el hardware de referencia de NVIDIA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---:|---:|---|---|
| Canary-Qwen-2.5b (esta conversión) | 2,53 B | no disponible | 1,63% | CC-BY-4.0 | GGUF |
| nvidia/canary-qwen-2.5b (original) | 2,5 B | no disponible | 1,60% (publicado por NVIDIA) | CC-BY-4.0 | safetensors |
| Whisper large-v3 | no disponible en la información | no disponible | no disponible en la información | MIT (según conocimiento general, no verificado en la información) | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos ASR en la información proporcionada más allá de la referencia al modelo original de NVIDIA. Los datos de Whisper large-v3 no están disponibles en la información suministrada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay soporte multilingüe ni traducción.
- No soporta streaming: requiere el audio completo antes de transcribir.
- No genera marcas de tiempo, lo que limita su uso en subtitulado sincronizado.
- No soporta detección de idioma.
- No soporta tool calling ni capacidades de agente en esta conversión.
- El modo LLM del modelo original (razonamiento sobre la transcripción) no está documentado en esta conversión GGUF.
- Riesgo de alucinación: como todo modelo generativo, puede producir sustituciones a nivel de token (homófonos, cambios en límites de palabra, sustituciones de palabras funcionales), según el análisis de los peores casos por enunciado documentado en la model card.
- El WER de 1,63% se midió en condiciones limpias (LibriSpeech test-clean); el rendimiento en audio con ruido, acentos o dominios específicos no está documentado en la información disponible.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar la autoría de NVIDIA y cumplir los términos de la licencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-25; se trata de una conversión reciente y poco validada por la comunidad.
- Requiere audio de entrada en WAV mono a 16 kHz; es necesario convertir otros formatos previamente con ffmpeg.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/GhaythMahadin/canary-qwen-2.5b-gguf
- Modelo base en Hugging Face: https://huggingface.co/nvidia/canary-qwen-2.5b
- Commit del modelo base usado para la conversión: https://huggingface.co/nvidia/canary-qwen-2.5b/commit/b1469e1bba1cfe140205529c79c434ca47180960
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/6f6c699
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/canary-qwen-2.5b.md
- Licencia CC-BY-4.0: https://choosealicense.com/licenses/cc-by-4.0/
- Paper de referencia (Attention Is All You Need): https://arxiv.org/abs/1706.03762
- Paper de referencia (arXiv:2503.05931): https://arxiv.org/abs/2503.05931
- Paper de referencia (arXiv:2505.13404): https://arxiv.org/abs/2505.13404
- Paper de referencia (arXiv:2310.09424): https://arxiv.org/abs/2310.09424
- Paper de referencia (arXiv:2104.02821): https://arxiv.org/abs/2104.02821
