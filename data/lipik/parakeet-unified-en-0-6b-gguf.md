# lipik/parakeet-unified-en-0.6b-gguf

## Resumen

parakeet-unified-en-0.6b-gguf es una conversión a formato GGUF del modelo ASR `nvidia/parakeet-unified-en-0.6b`, publicada por el usuario lipik (con conversiones equivalentes alojadas también bajo la organización handy-computer) para su uso con el runtime `transcribe.cpp`. Se trata de un modelo de reconocimiento automático del habla en inglés basado en arquitectura transducer (RNN-T) con encoder FastConformer de aproximadamente 618 millones de parámetros. El modelo original de NVIDIA se entrenó como modelo "unificado", capaz de operar tanto en modo offline como en streaming con latencias de hasta 160 ms, aunque esta conversión concreta solo expone la inferencia offline.

La relevancia de esta ficha está en que permite ejecutar un modelo ASR de calidad cercana al estado del arte en hardware de consumo, sin dependencias de Python ni de NeMo, gracias al formato GGUF y al runtime C++ `transcribe.cpp`. Con cuantizaciones que van desde 477 MB (Q4_K_M) hasta 2,47 GB (F32), el modelo mantiene un WER en LibriSpeech test-clean entre 1,58 % y 1,62 %, prácticamente idéntico al 1,59 % de la referencia en F32.

El modelo transcribe voz en inglés a texto con puntuación y mayúsculas incorporadas, y está pensado para aplicaciones de dictado, subtitulado y asistentes de voz donde se requiera un despliegue ligero y portable en CPU, GPU o Metal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer RNN-T con encoder FastConformer (Conformer) |
| Parametros totales | 618.309.121 (0,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio por chunk; streaming con contexto derecho configurable de 160 a 2080 ms) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Inglés (en-US) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF |
| Entrada de audio | WAV mono a 16 kHz |
| Decodificacion | RNN-T greedy, sin LM externo |
| Timestamps | A nivel de token |
| Traduccion | No soportada |
| Deteccion de idioma | No soportada |
| Streaming | Soportado en el modelo base; no expuesto en esta conversión de transcribe.cpp |
| Tamano del repo | 0,7 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transducer RNN-T: un encoder FastConformer (variante eficiente de Conformer que combina atención y convoluciones) seguido de un decoder RNN-T que produce las emisiones token a token. El modelo base de NVIDIA se entrenó de forma conjunta en modos offline y streaming, lo que le permite compartir pesos entre ambos regímenes de inferencia. La conversión a GGUF conserva los contextos de atención de streaming, pero `transcribe.cpp` todavía no expone una entrada de streaming, por lo que esta ficha describe únicamente el modo offline.

El entrenamiento se realizó mayoritariamente sobre la parte inglesa del dataset Granary, con aproximadamente 250.000 horas de habla en inglés estadounidense (en-US) en condiciones acústicas diversas. El modelo produce texto en alfabeto inglés, espacios y apóstrofos, con puntuación y mayúsculas integradas. La conversión fue validada contra la referencia de NeMo en el commit `42528dd` de `transcribe.cpp` el 2026-05-10, y el modelo base está fijado al commit `d4ac992` del 2026-05-10.

## Capacidades

- Transcripción de voz a texto en inglés con puntuación y mayúsculas automáticas.
- Decodificación RNN-T greedy sin modelo de lenguaje externo.
- Emisión de timestamps a nivel de token.
- Soporte de audio de entrada en WAV mono a 16 kHz (conversión previa con ffmpeg si es necesario).
- Inferencia offline; el modelo base soporta streaming con latencias de 160 a 2080 ms, pero esta conversión no lo expone.
- Ejecución en CPU, GPU (Vulkan) y Apple Silicon (Metal) a través de `transcribe.cpp`.
- No soporta traducción, detección de idioma ni otros idiomas distintos del inglés.
- No dispone de tool calling, capacidades de agente ni razonamiento multi-paso (es un modelo puramente ASR).

## Casos de uso

- Dictado por voz en aplicaciones de escritorio: el modelo puede transcribir audio en tiempo real o por lotes en local, sin conexión, con un WER de en torno al 1,6 % en condiciones limpias, lo que lo hace adecuado para herramientas de productividad que requieran privacidad y baja latencia.
- Subtitulado automático de vídeo y pódcast: la salida con puntuación y mayúsculas y los timestamps a nivel de token permiten generar subtítulos alineados temporalmente sin postprocesado lingüístico adicional.
- Asistentes de voz embebidos: con cuantización Q4_K_M (477 MB) y ejecución en CPU, el modelo cabe en dispositivos con recursos limitados y puede integrarse en asistentes domésticos o industriales que solo necesiten inglés.
- Transcripción de reuniones y notas de voz: al ejecutarse en local con `transcribe.cpp`, permite procesar grabaciones confidenciales sin enviar audio a servicios en la nube.
- Accesibilidad y lectura de documentos: conversión de audiolibros, grabaciones de clase o entrevistas a texto indexable, aprovechando el bajo coste de despliegue en hardware de consumo.
- Pipelines de datos para entrenamiento de otros modelos: generación de transcripciones a gran escala en inglés con un throughput alto (RTF de 163 en Metal en M4 Max y 28,5 en CPU del mismo equipo) para alimentar datasets de texto.
- Integración en aplicaciones móviles o de borde: el tamaño reducido del GGUF y la ausencia de dependencias Python facilitan su inclusión en apps nativas o contenedores ligeros.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| LibriSpeech test-clean (2620 utterances) | WER F32 | 1,59 % |
| LibriSpeech test-clean | WER F16 | 1,59 % |
| LibriSpeech test-clean | WER Q8_0 | 1,60 % |
| LibriSpeech test-clean | WER Q6_K | 1,61 % |
| LibriSpeech test-clean | WER Q5_K_M | 1,58 % |
| LibriSpeech test-clean | WER Q4_K_M | 1,62 % |
| LibriSpeech test-clean (referencia NVIDIA) | WER reportado | 1,63 % |
| Rendimiento en Apple M4 Max | RTF Metal | 163 |
| Rendimiento en Apple M4 Max | RTF CPU | 28,5 |
| Rendimiento en Ryzen 4750U | RTF Vulkan | 12,5 |
| Rendimiento en Ryzen 4750U | RTF CPU | 7,5 |

Las cifras de WER se midieron con decodificación RNN-T greedy y sin modelo de lenguaje externo. El RTF (real-time factor) indica cuántas veces más rápido que el tiempo real procesa el audio: un RTF de 163 en Metal significa que procesa 163 segundos de audio por segundo de cómputo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0,5 GB con Q4_K_M, 0,6 GB con Q6_K, 0,73 GB con Q8_0, 1,24 GB con F16 y 2,47 GB con F32.
- GPU recomendadas: cualquier GPU con soporte Vulkan (integradas y dedicadas); en Apple Silicon se usa Metal. No requiere GPU de datacenter.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de memoria libre, e incluso en CPU sin GPU.
- Opciones de despliegue: `transcribe.cpp` (CLI `transcribe-cli`), compilado desde fuente con CMake. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: RTF de 163 (Metal, M4 Max), 28,5 (CPU, M4 Max), 12,5 (Vulkan, Ryzen 4750U) y 7,5 (CPU, Ryzen 4750U). El modelo base soporta streaming con latencia mínima de 160 ms, pero esta conversión no lo expone.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto/streaming | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---|---|---|---|---|
| parakeet-unified-en-0.6b (esta ficha) | 0,6B | en | offline; streaming en modelo base (160-2080 ms) | 1,58-1,62 % (GGUF) / 1,63 % (NVIDIA) | CC-BY-4.0 | GGUF |
| Whisper large-v3 | no disponible en la informacion | multilingue | offline (chunks de 30 s) | no disponible en la informacion | MIT (modelo original) | safetensors, GGUF, etc. |
| Whisper small | no disponible en la informacion | multilingue | offline | no disponible en la informacion | MIT | safetensors, GGUF, etc. |
| NVIDIA parakeet-tdt-0.6b | no disponible en la informacion | en | offline | no disponible en la informacion | CC-BY-4.0 | NeMo |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación numérica de WER queda limitada al propio modelo. La principal ventaja diferencial de esta conversión es el formato GGUF con runtime C++ sin dependencias de Python, junto con un WER muy bajo en inglés limpio.

## Limitaciones y advertencias

- Solo soporta inglés (en-US); no transcribe otros idiomas ni detecta el idioma de entrada.
- No soporta traducción de voz a texto en otro idioma.
- Esta conversión concreta no expone el modo streaming, aunque el modelo base lo soporte; para streaming habría que usar NeMo o esperar a que `transcribe.cpp` lo implemente.
- El WER de 1,58-1,62 % corresponde a LibriSpeech test-clean, un corpus de habla leída y limpia; en audio con ruido, acentos no estadounidenses o solapamiento de hablantes el rendimiento será peor (no se publican cifras en la información disponible).
- Riesgo de alucinación en segmentos de silencio o ruido, habitual en modelos transducer sin LM externo; conviene aplicar detección de actividad de voz (VAD) en producción.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario citar tanto el modelo base de NVIDIA como la conversión.
- El modelo base está fijado a un commit concreto (`d4ac992`) y la conversión se validó contra `transcribe.cpp` en `42528dd`; cambios posteriores en el runtime pueden alterar la compatibilidad.
- El pipeline de inferencia del modelo base solo soporta streaming con buffer (recomputa el contexto izquierdo en cada chunk), lo que puede afectar a la latencia efectiva si se habilita en el futuro.
- No se han publicado datos de sesgo demográfico ni de robustez acústica en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lipik/parakeet-unified-en-0.6b-gguf
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-unified-en-0.6b
- Commit del modelo base: https://huggingface.co/nvidia/parakeet-unified-en-0.6b/commit/d4ac992
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42528dd
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-unified-en-0.6b.md
- Conversiones GGUF en handy-computer: https://huggingface.co/handy-computer/parakeet-unified-en-0.6b-gguf
- Paper de referencia (arXiv:2604.19079): https://arxiv.org/abs/2604.19079
- Paper de referencia (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Paper de referencia (arXiv:2304.09325): https://arxiv.org/abs/2304.09325
