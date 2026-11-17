# mrsoundmind/canary-qwen-2.5b-gguf

## Resumen
Canary-Qwen-2.5B es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por NVIDIA, que combina un codificador de audio FastConformer con un modelo de lenguaje causal Qwen3-1.7B mediante la arquitectura SALM (Speech-Augmented Language Model). Con 2.533.757.456 parámetros totales, resuelve la transcripción de audio a texto con puntuación y mayúsculas, alcanzando un WER del 1,60% en LibriSpeech test-clean según cifras publicadas por NVIDIA.

La ficha que nos ocupa no es el modelo original, sino una conversión a formato GGUF realizada por el usuario mrsoundmind para su uso con la librería transcribe.cpp, una implementación en C++ orientada a inferencia local y eficiente. Esta conversión permite ejecutar el modelo en hardware de consumo y en plataformas Apple Silicon mediante Metal, con seis niveles de cuantización que van desde BF16 hasta Q4_K_M.

Su relevancia actual radica en que ofrece calidad de transcripción de referencia (WER del 1,63% en las conversiones GGUF) en un paquete de 1,62 GB en su cuantización más agresiva, con licencia CC-BY-4.0 que permite uso comercial. Es una alternativa práctica a Whisper para despliegues locales de ASR en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SALM (Speech-Augmented Language Model): FastConformer (32 capas, d_model=1024) + Qwen3-1.7B (28 capas, hidden_size=2048) |
| Parametros totales | 2.533.757.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (transcribe.cpp) |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura SALM: un codificador de audio FastConformer de 32 capas con dimensión de modelo 1024 procesa la señal de audio y genera embeddings que se inyectan en un modelo de lenguaje causal Qwen3-1.7B (28 capas, hidden_size=2048) en una posición centinela del prompt. La entrada es un WAV mono a 16 kHz y la salida se genera mediante decodificación greedy. El modelo opera en dos modos: modo ASR, donde solo transcribe, y modo LLM, donde conserva las capacidades del Qwen3 subyacente para posprocesar el texto transcrito (resumir, responder preguntas), aunque en ese modo ya no procesa audio directamente.

No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La conversión GGUF está portada desde el commit b1469e1bba1cfe140205529c79c434ca47180960 del modelo original (fijado el 2026-05-15) y validada contra la referencia NeMo SALM 2.7.3 en el commit 6f6c699 de transcribe.cpp el 2026-05-16. La innovación técnica principal es la inyección de tokens de audio en un LLM causal, que permite aprovechar las capacidades lingüísticas de Qwen3 para producir transcripciones con puntuación y mayúsculas.

## Capacidades
- Transcripción de voz a texto en inglés con puntuación y mayúsculas (PnC).
- Procesamiento de audio WAV mono a 16 kHz como entrada.
- Decodificación greedy para generación de transcripciones.
- Modo LLM (en el modelo original) para posprocesar la transcripción: resumen, preguntas y respuestas sobre el texto.
- No soporta streaming (streaming: false).
- No soporta traducción (translate: false).
- No soporta detección de idioma (lang_detect: false).
- No genera timestamps (timestamps: none).
- No soporta tool calling ni function calling (no disponible en la información).
- Capacidades multilingües limitadas al inglés.

## Casos de uso
- Transcripción de reuniones y notas de voz: el modelo convierte grabaciones de audio en inglés a texto con puntuación, adecuado para actas y documentación gracias a su WER del 1,63% en LibriSpeech test-clean.
- Subtitulado de contenido audiovisual en inglés: genera transcripciones precisas de vídeos y podcasts que después pueden sincronizarse como subtítulos, con la ventaja de ejecutarse localmente sin enviar audio a servicios externos.
- Despliegue en dispositivos de borde: la cuantización Q4_K_M de 1,62 GB permite ejecutar el modelo en equipos con recursos limitados, como portátiles o mini-PC, usando transcribe.cpp con backend CPU o Vulkan.
- Procesamiento por lotes de archivos de audio: la CLI de transcribe.cpp permite transcribir directorios completos de WAV de 16 kHz, útil para digitalizar archivos de entrevistas o llamadas.
- Integración en aplicaciones de accesibilidad: transcripción en tiempo no real de audio pregrabado para generar texto accesible en inglés, con la ventaja de la licencia CC-BY-4.0 para uso comercial.
- Posprocesamiento con LLM: en el modelo original, el modo LLM permite resumir o extraer información de la transcripción generada, útil en pipelines de análisis de conversaciones.
- Validación de calidad de ASR: los scripts de reproducción de WER (scripts/wer/run.py y scripts/wer/score.py) permiten evaluar el modelo en conjuntos propios y comparar con la referencia NeMo.

## Benchmarks y rendimiento

| Benchmark | BF16 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M | Referencia NeMo SALM | Publicado por NVIDIA |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,63 | 1,63 | 1,63 | 1,63 | 1,63 | 1,63 | 1,61 | 1,60 |

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 39,8 |
| Apple M4 Max | CPU | 7,3 |
| Ryzen 4750U | Vulkan | 4,1 |
| Ryzen 4750U | CPU | 2,1 |

El WER se midió sobre la totalidad del split test-clean de LibriSpeech (2620 enunciados en inglés) con el normalizador de texto inglés estilo Whisper y jiwer 3.x, en el backend Metal de un Apple M4. La referencia NeMo SALM en la misma máquina (CPU torch, dither=0.0, greedy model.generate) obtiene 1,61% con intervalo de confianza bootstrap del 95% [1,47%, 1,75%]. Las diferencias por enunciado son ruido a nivel de token consistente con la precisión de pesos BF16 (homófonos, cambios en límites de palabra, sustituciones de palabras funcionales).

## Requisitos de hardware
- VRAM estimada: BF16/F16 requieren aproximadamente 4,73 GB de pesos; Q8_0 unos 2,61 GB; Q6_K 2,06 GB; Q5_K_M 1,85 GB; Q4_K_M 1,62 GB. Añadir overhead de activaciones y contexto.
- GPU recomendadas: no se especifican GPU concretas en la información; se documentan ejecuciones en Apple M4 Max (Metal) y Ryzen 4750U (Vulkan y CPU).
- Cabe en GPU de consumo: sí, especialmente en cuantizaciones Q4_K_M a Q8_0, con 2-3 GB de VRAM disponibles.
- Opciones de despliegue: transcribe.cpp (CLI transcribe-cli), con backends Metal, Vulkan y CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 39,8 en Metal (M4 Max), 7,3 en CPU (M4 Max), 4,1 en Vulkan (Ryzen 4750U) y 2,1 en CPU (Ryzen 4750U). El modelo original reporta 418 RTFx.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---|---:|---|---|
| canary-qwen-2.5b-gguf (esta ficha) | 2,53B | no disponible | 1,63% (GGUF) | CC-BY-4.0 | GGUF |
| nvidia/canary-qwen-2.5b | 2,5B | no disponible | 1,60% (publicado) | CC-BY-4.0 | NeMo/safetensors |
| Whisper large-v3 | no disponible en la información | no disponible | no disponible en la información | MIT (según conocimiento general, no verificado aquí) | safetensors/GGUF |
| Otros modelos ASR comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa se limita al modelo original de NVIDIA.

## Limitaciones y advertencias
- Solo soporta inglés; no es multilingüe.
- No soporta streaming, traducción, detección de idioma ni timestamps.
- Requiere audio de entrada WAV mono a 16 kHz; es necesario convertir otros formatos con ffmpeg.
- La decodificación es greedy, sin opciones de beam search documentadas.
- En modo ASR no retiene capacidades de razonamiento del LLM; en modo LLM no procesa audio directamente.
- Riesgo de alucinación y errores en homófonos, límites de palabra y palabras funcionales, coherente con la precisión BF16.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia CC-BY-4.0 permite uso comercial con atribución; verificar términos completos en la model card original.
- La conversión GGUF es de un tercero (mrsoundmind), no oficial de NVIDIA; validada contra NeMo SALM 2.7.3 pero sin garantías de soporte.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y mantenimiento inciertos.

## Enlaces
- Hugging Face (esta conversión): https://huggingface.co/mrsoundmind/canary-qwen-2.5b-gguf
- Modelo base: https://huggingface.co/nvidia/canary-qwen-2.5b
- Commit del modelo base: https://huggingface.co/nvidia/canary-qwen-2.5b/commit/b1469e1bba1cfe140205529c79c434ca47180960
- Repositorio transcribe.cpp: https://github.com/mrsoundmind/transcribe.cpp
- Licencia CC-BY-4.0: https://choosealicense.com/licenses/cc-by-4.0/
- Portal de desarrolladores de NVIDIA: https://developer.nvidia.com
- Papers referenciados en los tags: arxiv:1706.03762 (Attention Is All You Need), arxiv:2503.05931, arxiv:2505.13404, arxiv:2310.09424, arxiv:2104.02821
