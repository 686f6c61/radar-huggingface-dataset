# avericaai/canary-qwen-2.5b-gguf

## Resumen

Canary-Qwen-2.5B es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por NVIDIA, empaquetado en formato GGUF por el usuario avericaai para su uso con la librería transcribe.cpp. Se trata de una conversión cuantizada del modelo original nvidia/canary-qwen-2.5b, que emplea la arquitectura SALM (Speech-Augmented Language Model): un codificador de audio FastConformer de 32 capas se acopla a un modelo de lenguaje causal Qwen3-1.7B de 28 capas mediante inyección de tokens de audio en una posición centinela del prompt.

El modelo resuelve la transcripción de voz a texto offline en inglés, con puntuación y capitalización (PnC), y alcanza un WER del 1,63 % en LibriSpeech test-clean según las mediciones del autor del GGUF. Su relevancia radica en que permite ejecutar un modelo ASR de 2.500 millones de parámetros en hardware de consumo gracias a las cuantizaciones GGUF (desde 1,74 GB en Q4_K_M), algo impracticable con los pesos originales en BF16 (5,08 GB) en entornos con recursos limitados.

Esta ficha cubre específicamente la conversión GGUF de avericaai, pensada para inferencia local con transcribe.cpp. El modelo base es de NVIDIA y la licencia CC-BY-4.0 se hereda del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SALM (FastConformer encoder + Qwen3-1.7B causal LM) |
| Parametros totales | 2.533.757.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF |
| Codificador de audio | FastConformer, 32 capas, d_model=1024 |
| Modelo de lenguaje | Qwen3-1.7B, 28 capas, hidden_size=2048 |
| Entrada de audio | WAV mono a 16 kHz |
| Decodificacion | greedy |
| Streaming | no |
| Traduccion | no |
| Deteccion de idioma | no |
| Timestamps | no |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SALM (Speech-Augmented Language Model) de NVIDIA NeMo. Un codificador FastConformer de 32 capas con dimensión de modelo 1024 procesa el audio de entrada y genera embeddings que se inyectan como tokens en una posición centinela del prompt de un modelo de lenguaje causal Qwen3-1.7B (28 capas, hidden_size 2048). La decodificación es greedy y produce directamente la transcripción con puntuación y capitalización. El modelo base fue entrenado por NVIDIA sobre un total de 234 000 horas de datos de voz públicos, incluyendo conversaciones, vídeos web y audiolibros, según la información de la búsqueda web.

La conversión GGUF fue realizada por avericaai a partir del commit b1469e1 del modelo original (fijado el 2026-05-15) y validada contra la referencia NeMo SALM 2.7.3 en el commit 6f6c699 de transcribe.cpp el 2026-05-16. No se dispone de información detallada sobre el proceso de alineación (RLHF/DPO) ni sobre innovaciones técnicas adicionales del entrenamiento en la información proporcionada.

## Capacidades

- Transcripción de voz a texto en inglés con puntuación y capitalización automáticas (PnC).
- Modo ASR: transcripción pura sin capacidades de razonamiento del LLM subyacente.
- Modo LLM (en el modelo base): el modelo conserva las capacidades del Qwen3-1.7B para posprocesar la transcripción (resumir, responder preguntas), aunque en este modo no procesa audio directamente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible en modo ASR.
- Capacidades multilingües: no, únicamente inglés.
- Capacidades especiales: no soporta streaming, ni timestamps, ni detección de idioma, ni traducción.
- Entrada limitada a WAV mono a 16 kHz.

## Casos de uso

- Transcripción de reuniones y entrevistas en inglés: el modelo convierte grabaciones de audio mono a 16 kHz en texto con puntuación, adecuado para actas y documentación posterior. Su WER del 1,63 % en LibriSpeech test-clean lo hace fiable para audio limpio.
- Subtitulado offline de contenido audiovisual en inglés: al no soportar streaming ni timestamps, se usaría para generar transcripciones completas que luego se alinean con el vídeo mediante herramientas externas.
- Dictado y notas de voz: integrable en aplicaciones de escritorio o móvil mediante transcribe.cpp, con cuantización Q4_K_M (1,74 GB) que cabe en equipos modestos.
- Pipeline de accesibilidad: generación de transcripciones para personas con discapacidad auditiva en contenidos en inglés, ejecutable en local sin dependencia de servicios en la nube.
- Procesamiento por lotes de archivos de audio: la naturaleza offline y la baja huella de memoria permiten procesar grandes volúmenes de grabaciones en servidores sin GPU dedicada.
- Investigación en ASR: modelo de referencia reproducible con métricas de WER publicadas y scripts de evaluación (scripts/wer/run.py y score.py) para comparar cuantizaciones y hardware.
- Transcripción en entornos con privacidad estricta: al ejecutarse completamente en local con transcribe.cpp, los datos de audio no salen del equipo, adecuado para sectores regulados.

## Benchmarks y rendimiento

| Benchmark | BF16 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---|---|---|---|---|---|
| WER LibriSpeech test-clean (%) | 1,63 | 1,63 | 1,63 | 1,63 | 1,63 | 1,63 |
| WER FLEURS en (%) | no disponible | no disponible | 3,58 | no disponible | no disponible | no disponible |

Referencia NeMo SALM en CPU torch (dither=0,0, greedy): 1,61 % de WER en LibriSpeech test-clean, con intervalo de confianza bootstrap del 95 % [1,47 %, 1,75 %]. NVIDIA publica 1,60 % para el modelo original. Las seis cuantizaciones GGUF quedan en 1,63 %, dentro del ruido estadístico.

Rendimiento (RTFx, mayor es mejor):

| Hardware | CPU | Metal | Vulkan |
|---|---|---|---|
| Apple M4 Max | 10,03 | 42,43 | no disponible |
| AMD Ryzen 4750U | 2,51 | no disponible | 3,98 |

El modelo base reporta 418 RTFx en el hardware de referencia de NVIDIA (no especificado en la información disponible).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización: Q4_K_M 1,74 GB; Q5_K_M 1,98 GB; Q6_K 2,21 GB; Q8_0 2,80 GB; F16 y BF16 5,08 GB.
- GPU recomendadas: no se especifican modelos concretos; el autor reporta aceleración por Metal en Apple M4 Max (42,43 RTFx) y por Vulkan en AMD Ryzen 4750U (3,98 RTFx).
- Cabe en GPU de consumo: sí, las cuantizaciones Q4_K_M a Q8_0 caben en GPUs con 4 GB o más de VRAM; las versiones F16/BF16 requieren al menos 6 GB.
- Opciones de despliegue: transcribe.cpp (librería nativa con CLI transcribe-cli); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: en Apple M4 Max, 42,43 RTFx con Metal y 10,03 RTFx con CPU; en AMD Ryzen 4750U, 3,98 RTFx con Vulkan y 2,51 RTFx con CPU. El modelo base reporta 418 RTFx en hardware NVIDIA no especificado.
- Requiere audio de entrada WAV mono a 16 kHz; conversión previa con ffmpeg si es necesario.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---|---|---|---|
| canary-qwen-2.5b (este GGUF) | 2,53 B | no disponible | 1,63 % | CC-BY-4.0 | GGUF |
| nvidia/canary-qwen-2.5b (original) | 2,5 B | no disponible | 1,60 % (publicado) | CC-BY-4.0 | NeMo/safetensors |
| tryambientai/canary-qwen-2.5b-gguf | 2,5 B | no disponible | no disponible | CC-BY-4.0 (heredada) | GGUF |

No se dispone de información sobre otros modelos ASR comparables (Whisper, Parakeet, etc.) en la documentación proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo.

## Limitaciones y advertencias

- Solo admite inglés; no soporta otros idiomas ni detección de idioma.
- No soporta streaming: requiere el audio completo antes de transcribir.
- No genera timestamps, lo que limita su uso en subtitulado sincronizado sin herramientas adicionales.
- No traduce: únicamente transcribe en el idioma de entrada.
- En modo ASR no conserva capacidades de razonamiento del LLM; en modo LLM no procesa audio directamente.
- Riesgo de alucinación y errores en audio con ruido, acentos no nativos o solapamiento de hablantes; las métricas publicadas corresponden a audio limpio (LibriSpeech).
- Las diferencias por cuantización son mínimas en WER, pero pueden aparecer sustituciones de palabras funcionales y homófonos por precisión BF16.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar a NVIDIA y al autor de la conversión.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; validación limitada a la realizada por el autor.
- Requiere compilar transcribe.cpp desde el código fuente; no hay paquete precompilado indicado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/avericaai/canary-qwen-2.5b-gguf
- Modelo base: https://huggingface.co/nvidia/canary-qwen-2.5b
- Conversión GGUF alternativa: https://huggingface.co/tryambientai/canary-qwen-2.5b-gguf
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/canary-qwen-2.5b.md
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/6f6c699
- Commit del modelo base: https://huggingface.co/nvidia/canary-qwen-2.5b/commit/b1469e1
- Licencia en el repositorio: https://huggingface.co/handy-computer/canary-qwen-2.5b-gguf/blob/main/LICENSE
- NOTICE de derivación: https://huggingface.co/handy-computer/canary-qwen-2.5b-gguf/blob/main/NOTICE
- Papers referenciados en los tags: arxiv:1706.03762, arxiv:2503.05931, arxiv:2505.13404, arxiv:2310.09424, arxiv:2104.02821
