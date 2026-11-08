# avericaai/Fun-ASR-MLT-Nano-2512-gguf

## Resumen

Fun-ASR-MLT-Nano-2512 en formato GGUF es una conversión del checkpoint multilingüe Fun-ASR-MLT-Nano-2512 de FunAudioLLM, publicada por el usuario avericaai para su uso con la librería transcribe.cpp. El modelo original es un sistema de reconocimiento automático del habla (ASR) offline que cubre 31 idiomas, con especial énfasis en lenguas del este y sudeste asiático (chino, inglés, cantonés, japonés, coreano, vietnamita, indonesio, tailandés, malayo y filipino), además de árabe, hindi y 19 lenguas europeas.

La arquitectura combina un codificador de audio SenseVoiceEncoderSmall congelado, un adaptador de audio de dos capas y una cabeza LLM Qwen3-0.6B, sumando aproximadamente 830 millones de parámetros entrenables. El modelo toma audio WAV mono a 16 kHz y emite texto transcrito, con normalización inversa de texto (ITN) activada por defecto para producir puntuación, mayúsculas y dígitos legibles.

Su relevancia actual radica en que ofrece cobertura multilingüe amplia en un paquete de menos de 1 GB en cuantización Q8_0, ejecutable en CPU y GPU de consumo mediante transcribe.cpp, lo que lo hace adecuado para transcripción local y privada. No obstante, el rendimiento es muy desigual entre idiomas: excelente en inglés y lenguas asiáticas, pero con tasas de error muy elevadas en varias lenguas europeas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador SenseVoiceEncoderSmall congelado + adaptador de audio de 2 capas + LLM Qwen3-0.6B (audio-LLM) |
| Parametros totales | 829.791.840 (~830 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 31: zh, en, yue, ja, ko, vi, id, th, ms, tl, ar, hi, bg, hr, cs, da, nl, et, fi, el, hu, ga, lv, lt, mt, pl, pt, ro, sk, sl, sv |
| Licencia | funasr-model-license-v1.1 (other) |
| Formato de pesos | GGUF (transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de audio-LLM: un codificador de voz SenseVoiceEncoderSmall, mantenido congelado, extrae representaciones acústicas que pasan por un adaptador de dos capas y se inyectan en un LLM Qwen3-0.6B que actúa como decodificador generativo. La decodificación es greedy sobre la cabeza Qwen3. Según la model card, el checkpoint MLT se entrenó sobre un corpus multilingüe de "cientos de miles de horas" de audio, notablemente inferior al de la variante Fun-ASR-Nano-2512, entrenada sobre "decenas de millones de horas". No se detalla en la información disponible la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

El modelo no soporta streaming, no realiza traducción y no genera marcas de tiempo. Sí incluye detección automática de idioma y permite selección explícita del idioma. La normalización inversa de texto (ITN) está activada por defecto, alineada con el comportamiento upstream, y puede desactivarse con `--no-itn` para obtener la forma hablada. Esta conversión GGUF se portó desde el commit upstream cf67a93 (fijado el 2026-05-06) y se validó contra la referencia FunASR en el commit f094d28 de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto offline en 31 idiomas, con optimización específica para lenguas del este y sudeste asiático.
- Detección automática de idioma (`lang_detect: true`) y selección explícita de idioma (`explicit_language_selection: true`).
- Normalización inversa de texto (ITN) activada por defecto: puntuación, mayúsculas y conversión de números a dígitos.
- Entrada de audio WAV mono a 16 kHz; salida de texto plano.
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No genera marcas de tiempo (`timestamps: none`).
- No dispone de tool calling ni capacidades de agente; es un modelo ASR puro.

## Casos de uso

- Transcripción local de reuniones y notas de voz: el modelo procesa audio WAV de 16 kHz en CPU o GPU de consumo con cuantizaciones de 557 MB a 891 MB, lo que permite integrarlo en aplicaciones de escritorio sin depender de servicios en la nube y preservando la privacidad del audio.
- Subtitulado de contenido en inglés y lenguas asiáticas: con un WER de 1,72 % en LibriSpeech test-clean (Q8_0) y CER de 2,1 % en japonés o 7,33 % en chino sobre FLEURS, es adecuado para generar transcripciones de vídeos y pódcasts en esos idiomas.
- Procesamiento por lotes de archivos de audio: al ser offline y no requerir streaming, encaja en pipelines que transcriben grandes volúmenes de grabaciones almacenadas, con throughput medido en RTF de 5,47 (CPU Ryzen 4750U) a 70,03 (Metal en M4 Max).
- Investigación lingüística comparada: la cobertura de 31 idiomas y la detección automática permiten construir corpus transcritos multilingües, aunque con la advertencia de que el rendimiento en lenguas europeas es muy variable.
- Aplicaciones de accesibilidad: transcripción de audio a texto en tiempo no real para generar subtítulos o documentos accesibles en dispositivos sin GPU dedicada, gracias a las cuantizaciones Q4_K_M y Q5_K_M.
- Prototipado de asistentes de voz: como componente ASR en una arquitectura más amplia (ASR + LLM + TTS), útil para validar flujos conversacionales en inglés y lenguas asiáticas antes de escalar a modelos mayores.
- Transcripción de contenido en árabe e hindi: con WER de 25,88 % y 23,07 % respectivamente en FLEURS, puede servir para tareas de recuperación de información o indexación aproximada, no para transcripción de alta fidelidad.

## Benchmarks y rendimiento

WER/CER en FLEURS con cuantización Q8_0 (los valores CER se indican como tales; el resto son WER):

| Idioma | Metrica | Q8_0 |
|---|---|---|
| en | WER | 5,02 |
| id | WER | 7,32 |
| vi | WER | 8,22 |
| ms | WER | 9,11 |
| fil | WER | 14,29 |
| pt | WER | 22,23 |
| hi | WER | 23,07 |
| ar | WER | 25,88 |
| nl | WER | 42,36 |
| cs | WER | 48,70 |
| lv | WER | 52,14 |
| pl | WER | 52,34 |
| bg | WER | 55,78 |
| da | WER | 55,94 |
| sk | WER | 60,13 |
| et | WER | 61,09 |
| fi | WER | 65,77 |
| hr | WER | 67,52 |
| ro | WER | 67,83 |
| sv | WER | 71,60 |
| sl | WER | 72,73 |
| lt | WER | 75,25 |
| mt | WER | 89,25 |
| ga | WER | 95,78 |
| el | WER | 100,43 |
| hu | WER | 110,75 |
| ja | CER | 2,10 |
| ko | CER | 5,41 |
| th | CER | 7,28 |
| zh | CER | 7,33 |
| yue | CER | 8,39 |

LibriSpeech test-clean (2.620 enunciados, batch 8, language hint `en`, ITN activado):

| Cuantizacion | WER |
|---|---|
| BF16 | 1,71 % |
| F16 | 1,71 % |
| Q8_0 | 1,72 % |
| Q6_K | 1,66 % |
| Q5_K_M | 1,74 % |
| Q4_K_M | 1,80 % |

Rendimiento (RTF, menor es mejor):

| Plataforma | RTF |
|---|---|
| M4 CPU | 11,33 |
| M4 Metal | 25,82 |
| M4 Max CPU | 19,54 |
| M4 Max Metal | 70,03 |
| Ryzen 4750U CPU | 5,47 |
| Ryzen 4750U Vulkan | 8,84 |

La línea base de referencia FunASR 1.3.1 con ITN en LibriSpeech test-clean es 1,71 % (IC 95 % [1,55 %, 1,89 %]); el port BF16 de transcribe.cpp se sitúa en -0,01 puntos porcentuales respecto a esa referencia. Con ITN desactivado, la referencia obtiene 1,76 % y el port BF16 1,74 %.

## Requisitos de hardware

- VRAM estimada: entre 557 MB (Q4_K_M) y 1,67 GB (BF16/F16) solo para los pesos; el consumo real de memoria añade overhead del runtime y del búfer de audio.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; los benchmarks se midieron en Apple Silicon (M4, M4 Max con Metal) y en CPU AMD Ryzen 4750U con Vulkan.
- Cabe en GPU de consumo: sí, dado el tamaño reducido de los pesos (menos de 2 GB en todas las cuantizaciones), aunque no se detallan modelos concretos de GPU de consumo en la información proporcionada.
- Opciones de despliegue: transcribe.cpp (librería nativa, CLI `transcribe-cli`); no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 5,47 (Ryzen 4750U CPU) a 70,03 (M4 Max Metal); en M4 CPU 11,33 y en M4 Metal 25,82. No se proporcionan cifras de latencia absoluta en milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Fun-ASR-MLT-Nano-2512 (este, GGUF) | ~830 M | No disponible | 31 | funasr-model-license-v1.1 | GGUF |
| Fun-ASR-Nano-2512 | ~800 M (según model card) | No disponible | 31 | No disponible | No disponible |
| Whisper large-v3 | No disponible en la información | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos de benchmarks frente a modelos alternativos en la información proporcionada. La model card indica que la variante MLT se entrenó sobre un corpus menor que Fun-ASR-Nano-2512 ("cientos de miles de horas" frente a "decenas de millones"), lo que sugiere un rendimiento inferior en inglés y posiblemente en otros idiomas, aunque no se aportan cifras comparativas directas.

## Limitaciones y advertencias

- Rendimiento muy desigual entre idiomas: WER superior al 100 % en húngaro (110,75) y griego (100,43) en FLEURS, y por encima del 70 % en lituano, maltés, irlandés, esloveno y sueco. No es adecuado para producción en esas lenguas.
- El WER en LibriSpeech (inglés) es excelente, pero la fortaleza de la variante MLT es la cobertura multilingüe, no la precisión en inglés.
- No soporta streaming, por lo que no sirve para transcripción en tiempo real.
- No realiza traducción ni genera marcas de tiempo.
- Riesgo de alucinación inherente a la decodificación generativa con cabeza LLM; no se documentan tasas específicas en la información disponible.
- No se documentan sesgos conocidos en la información proporcionada.
- Licencia funasr-model-license-v1.1: es necesario revisar los términos en el enlace oficial antes de uso comercial; la licencia se etiqueta como "other" y no es una licencia de código abierto estándar.
- La conversión GGUF la publica un tercero (avericaai) a partir del modelo original de FunAudioLLM; la validación se realizó contra la referencia FunASR en un commit concreto, pero no hay garantía de equivalencia exacta en todos los casos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- Requiere audio WAV mono a 16 kHz como entrada; no se documenta soporte de otros formatos o frecuencias de muestreo.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/avericaai/Fun-ASR-MLT-Nano-2512-gguf
- Modelo original: https://huggingface.co/FunAudioLLM/Fun-ASR-MLT-Nano-2512
- Commit upstream de referencia: https://huggingface.co/FunAudioLLM/Fun-ASR-MLT-Nano-2512/commit/cf67a93
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/f094d28
- Licencia FunASR: https://github.com/modelscope/FunASR/blob/main/MODEL_LICENSE
- Paper (arXiv 2509.12508): https://arxiv.org/abs/2509.12508
- Réplica comunitaria del modelo: https://huggingface.co/gogiidoloclast/Fun-ASR-MLT-Nano-2512
