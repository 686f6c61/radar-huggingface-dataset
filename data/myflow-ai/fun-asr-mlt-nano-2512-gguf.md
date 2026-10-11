# myflow-ai/Fun-ASR-MLT-Nano-2512-gguf

## Resumen

Fun-ASR-MLT-Nano-2512-gguf es una conversión al formato GGUF del modelo de reconocimiento automático de voz (ASR) Fun-ASR-MLT-Nano-2512, publicado en HuggingFace por myflow-ai y pensado para su uso con la librería transcribe.cpp. El modelo original procede de FunAudioLLM/Fun-ASR-MLT-Nano-2512 (Tongyi Lab, Alibaba) y está diseñado para transcripción offline de voz a texto en 31 idiomas, con optimización específica para lenguas de Asia Oriental y Sudoriental.

Se trata de un modelo de tipo audio-LLM de aproximadamente 830 millones de parámetros (829.791.840), que combina un codificador SenseVoiceEncoderSmall congelado, un adaptador de audio de 2 capas y un LLM Qwen3-0.6B. La variante MLT se entrenó sobre un corpus multilingüe de "cientos de miles de horas", inferior al corpus de "decenas de millones de horas" del modelo Fun-ASR-Nano. La entrada es un WAV mono a 16 kHz y la salida es texto.

La relevancia de esta conversión radica en que permite ejecutar un modelo ASR multilingüe en hardware de consumo mediante cuantización (desde 531 MB en Q4_K_M hasta 1590 MB en BF16/F16), con una degradación mínima de precisión (el WER en LibriSpeech test-clean pasa de 1,74 % en BF16 a 1,89 % en Q4_K_M). No soporta streaming, traducción ni marcas de tiempo, y no realiza detección de idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM: SenseVoiceEncoderSmall (codificador congelado) + adaptador de audio de 2 capas + LLM Qwen3-0.6B |
| Parametros totales | 829.791.840 (~830 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 31: zh, en, yue, ja, ko, vi, id, th, ms, tl, ar, hi y 19 lenguas europeas (bg, hr, cs, da, nl, et, fi, el, hu, ga, lv, lt, mt, pl, pt, ro, sk, sl, sv) |
| Licencia | other (FunASR Model Open Source License Agreement v1.1) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura híbrida de reconocimiento de voz: un codificador SenseVoiceEncoderSmall congelado extrae representaciones acústicas, un adaptador de audio de 2 capas las proyecta al espacio del modelo de lenguaje y un LLM Qwen3-0.6B genera el texto transcripción mediante decodificación autorregresiva. El total de parámetros entrenables ronda los 800 millones. La conversión a GGUF procede del commit upstream cf67a938bf2829959d08fdfb84e186eff02a67ff y fue validada contra la referencia de FunASR en el commit f094d28 de transcribe.cpp.

El corpus de entrenamiento de la variante MLT consiste, según la model card del autor, en "cientos de miles de horas" de audio multilingüe, muy por debajo de las "decenas de millones de horas" empleadas en el modelo Fun-ASR-Nano (del que MLT hereda arquitectura pero no volumen de datos). El modelo está orientado a reconocimiento de terminología profesional en dominios verticales como educación y finanzas, y busca mitigar problemas típicos de ASR como la generación de alucinaciones y la confusión entre idiomas. Se soporta normalización de texto inversa (ITN), expuesta mediante el flag `--itn` de la CLI y el parámetro `transcribe_funasr_nano_params { use_itn }` de la API.

## Capacidades

- Transcripción de voz a texto offline (no en streaming) a partir de WAV mono de 16 kHz.
- Cobertura de 31 idiomas, con foco en chino, inglés, cantonés, japonés, coreano, vietnamita, indonesio, tailandés, malayo y filipino, además de árabe, hindi y 19 lenguas europeas.
- Normalización de texto inversa (ITN) activable por CLI (`--itn`) o API.
- Reconocimiento de terminología especializada en dominios verticales (educación, finanzas).
- Salida de texto sin puntuación estructurada ni marcas de tiempo.
- No soporta traducción.
- No soporta detección automática de idioma.
- No soporta decodificación en tiempo real (streaming).
- No se documentan capacidades de tool calling, function calling ni uso agéntico (es un modelo ASR, no un LLM conversacional general).

## Casos de uso

- Transcripción de reuniones y notas de voz multilingües: el modelo convierte audio a texto en 31 idiomas sin infraestructura en la nube, adecuado para equipos distribuidos con mezcla de lenguas (chino, inglés, japonés, etc.).
- Subtitulado offline de contenido audiovisual: procesando ficheros WAV de 16 kHz previamente extraídos con ffmpeg, útil para vídeos no emitidos en directo donde no se requieren marcas de tiempo.
- Archivado y búsqueda de audio histórico: transcripción por lotes de grabaciones de entrevistas o llamadas para indexación textual posterior.
- Atención al cliente en regiones de Asia-Pacífico: conversión de llamadas grabadas a texto en cantonés, tailandés, vietnamita o indonesio para su análisis y clasificación.
- Despliegue en dispositivos de borde o portátiles: con cuantización Q4_K_M (531 MB) el modelo cabe en equipos sin GPU dedicada, permitiendo transcripción local con privacidad de datos.
- Documentación médica o legal dictada: aprovechando la especialización en vocabulario profesional para transcripción de terminología técnica, siempre que el idioma esté entre los soportados.
- Preprocesado de pipelines de NLP: transcripción previa a tareas de resumen, traducción o análisis de sentimiento realizadas por otros modelos.
- Accesibilidad: generación de texto a partir de audio para personas con discapacidad auditiva en entornos offline.

## Benchmarks y rendimiento

WER medido sobre la partición completa LibriSpeech test-clean (2620 enunciados) con decodificación greedy del cabezal Qwen3-0.6B. La línea base propia del editor (FunASR 1.3.1 sobre el mismo manifiesto) es de 1,76 % (IC 95 % [1,60 %, 1,93 %]).

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 1590 MB | 1,74 % |
| F16 | 1590 MB | 1,74 % |
| Q8_0 | 850 MB | 1,74 % |
| Q6_K | 659 MB | 1,69 % |
| Q5_K_M | 602 MB | 1,77 % |
| Q4_K_M | 531 MB | 1,89 % |

Nota: LibriSpeech es solo en inglés; el editor indica que la fortaleza de la variante MLT es la cobertura multilingüe y no la precisión en inglés. Para los otros 30 idiomas el propio editor recomienda ejecutar un manifiesto representativo propio. El publicador no reporta un WER numérico de LibriSpeech específico para la variante MLT.

Rendimiento (valores publicados por el autor, tal cual):

| Plataforma | Backend | Valor reportado (rtf) |
|---|---|---:|
| Apple M4 Max | Metal | 68 |
| Apple M4 Max | CPU | 16 |
| Ryzen 4750U | Vulkan | 9 |
| Ryzen 4750U | CPU | 4,5 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 531 MB (Q4_K_M), 602 MB (Q5_K_M), 659 MB (Q6_K), 850 MB (Q8_0) y 1590 MB (BF16/F16). Cabe en cualquier GPU de consumo con 2 GB o más de memoria, e incluso en equipos sin GPU dedicada.
- GPU recomendadas: no se especifican requisitos mínimos. Dado el tamaño, tanto una RTX 4090 o A100/H100 están sobredimensionadas; el modelo está pensado para CPU, GPU integradas y aceleradores de gama baja (Apple Silicon, Vulkan).
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual (incluso GTX 1650 o superiores) y también en ejecución solo-CPU.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli` y API de librería). No se documentan otros motores en la información disponible (no se mencionan vLLM, Ollama ni TGI).
- Latencia y throughput: se reportan valores de rtf (ratio) de 68 en Metal sobre M4 Max, 16 en CPU sobre M4 Max, 9 en Vulkan sobre Ryzen 4750U y 4,5 en CPU sobre Ryzen 4750U. La interpretación exacta de estos ratios no se detalla en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| Fun-ASR-MLT-Nano-2512-gguf (este) | ~830 M | 31 | FunASR Model Open Source License v1.1 | GGUF | Conversion para transcribe.cpp |
| Fun-ASR-MLT-Nano-2512 (base) | ~830 M | 31 | FunASR Model Open Source License v1.1 | safetensors (original) | Entrenado sobre "cientos de miles de horas" |
| Fun-ASR-Nano-2512 | ~800 M (misma arquitectura) | no disponible en la informacion | no disponible | no disponible | Entrenado sobre "decenas de millones de horas" |
| Whisper large-v3 (referencia general) | no disponible en la informacion | 99 (aprox.) | no disponible en la informacion | no disponible | Comparativa pendiente de evaluacion sobre el mismo manifiesto |

No se dispone de resultados comparativos directos entre estos modelos sobre el mismo conjunto de evaluación en la información proporcionada.

## Limitaciones y advertencias

- No soporta streaming: solo procesa audio completo en modo offline.
- No realiza traducción ni detección automática de idioma.
- No genera marcas de tiempo (timestamps: none), lo que limita su uso en subtitulado sincronizado.
- Solo acepta entrada WAV mono a 16 kHz; requiere conversión previa con herramientas como ffmpeg.
- Riesgo de alucinaciones y confusión entre idiomas, problema que el modelo base declara abordar pero no elimina por completo.
- La licencia es "other" (FunASR Model Open Source License Agreement v1.1), no una licencia de código abierto estándar; conviene revisar los términos antes de cualquier uso comercial, ya que puede imponer restricciones.
- El modelo base MLT se entrenó con menos datos que Fun-ASR-Nano, por lo que su precisión puede ser inferior fuera del ámbito multilingüe.
- No se han publicado datos de sesgo ni evaluaciones por idioma más allá del inglés (LibriSpeech), por lo que el rendimiento en las otras 30 lenguas es incierto sin evaluación propia.
- La conversión GGUF es de un tercero (myflow-ai) y podría no reproducir exactamente el comportamiento del modelo original; se indica validación frente a la referencia de FunASR.
- Uso de la librería transcribe.cpp implica compilar desde fuente en la versión documentada; no se garantiza compatibilidad con otras versiones.

## Enlaces

- Repositorio HuggingFace (esta conversión): https://huggingface.co/myflow-ai/Fun-ASR-MLT-Nano-2512-gguf
- Modelo base: https://huggingface.co/FunAudioLLM/Fun-ASR-MLT-Nano-2512
- Repositorio de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Página de modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/fun-asr-mlt-nano-2512.md
- Repositorio de las conversiones GGUF (handy-computer): https://huggingface.co/handy-computer/Fun-ASR-MLT-Nano-2512-gguf
- Commit upstream fijado: https://huggingface.co/FunAudioLLM/Fun-ASR-MLT-Nano-2512/commit/cf67a938bf2829959d08fdfb84e186eff02a67ff
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/f094d28
- Paper (referencia arXiv): https://arxiv.org/abs/2509.12508
