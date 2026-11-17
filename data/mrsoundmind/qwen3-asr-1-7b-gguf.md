# mrsoundmind/Qwen3-ASR-1.7B-gguf

## Resumen

Qwen3-ASR-1.7B es un modelo de reconocimiento automático del habla (ASR) desarrollado por el equipo Qwen de Alibaba, publicado originalmente en Hugging Face bajo la organización `Qwen`. Esta ficha documenta la conversión a formato GGUF realizada por el usuario `mrsoundmind`, pensada para su uso con `transcribe.cpp`, un runtime de inferencia en C++ derivado del ecosistema llama.cpp y adaptado a modelos de audio.

El modelo resuelve el problema de la transcripción multilingüe offline: recibe audio WAV mono a 16 kHz y emite la transcripción en el idioma detectado automáticamente entre 30 idiomas (incluidos chino, inglés, cantonés, árabe, español, alemán, francés, portugués, japonés, coreano, hindi, entre otros). La arquitectura combina un codificador de audio bidireccional con un decoder causal tipo Qwen3 al que se inyectan tokens de audio, siguiendo el paradigma audio-LLM de la familia Qwen3-Omni.

La relevancia de esta conversión GGUF reside en que permite ejecutar un ASR de 1.700 millones de parámetros en hardware de consumo (CPU, Metal, Vulkan) sin necesidad de GPUs de datacenter ni de frameworks Python pesados. Con cuantizaciones Q4_K_M de 1,23 GB y un WER del 1,81 % en LibriSpeech test-clean, se posiciona como una alternativa práctica a Whisper large-v3 en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM: codificador de audio bidireccional (d_model=1024, 16 cabezas) + decoder causal Qwen3 (hidden_size=2048, intermediate_size=6144) con inyección de tokens de audio |
| Parametros totales | 2.038.078.608 (2,04 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 30 idiomas: zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, ro, hu, mk |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transcribe.cpp); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón audio-LLM de la familia Qwen3-Omni: un codificador de audio bidireccional procesa el espectrograma y produce representaciones que se inyectan como tokens en un decoder causal Qwen3 estándar. Según la model card, el codificador tiene `d_model=1024` con 16 cabezas de atención, mientras que el LM tiene `hidden_size=2048` e `intermediate_size=6144`. La variante de 1,7 B es la versión "ancha" de la familia, frente al modelo hermano Qwen3-ASR-0.6B.

El entrenamiento se realizó a partir de datos de habla a gran escala y de las capacidades de comprensión de audio del modelo fundacional Qwen3-Omni, según indica la model card original. No se especifica en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. El modelo soporta identificación de idioma automática, pero no streaming ni traducción según los metadatos de `transcribe.cpp` (`streaming: false`, `translate: false`, `lang_detect: true`, `timestamps: none`). No admite sugerencias explícitas de idioma en esta implementación.

La conversión GGUF fue validada contra la referencia `qwen_asr 0.0.6` en el commit `3f61df7` de `transcribe.cpp` el 2026-04-20, y portada desde el commit upstream `7278e1e70fe206f11671096ffdd38061171dd6e5` fijado el 2026-04-19.

## Capacidades

- Transcripción de voz a texto multilingüe en 30 idiomas, con detección automática del idioma del audio.
- Reconocimiento robusto en entornos acústicos complejos y patrones de texto desafiantes, según la model card original.
- Soporte de audio largo (la familia Qwen3-ASR soporta transcripción de audio extenso, aunque esta conversión concreta no expone marcas de tiempo).
- Identificación de idioma integrada (lang_detect: true).
- Inferencia offline en CPU, Metal y Vulkan mediante `transcribe.cpp`.
- No soporta streaming en esta implementación (`streaming: false`).
- No soporta traducción (`translate: false`).
- No emite timestamps (`timestamps: none`); para alineación temporal existe el modelo separado Qwen3-ForcedAligner-0.6B.
- No admite sugerencias explícitas de idioma en esta versión.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa audio WAV mono a 16 kHz y genera la transcripción en el idioma detectado, lo que permite automatizar actas en entornos corporativos multilingües sin depender de APIs en la nube.
- Subtitulado de contenido audiovisual: dado su WER del 1,62 % en inglés (LibriSpeech test-clean) y su soporte de 30 idiomas, es adecuado para generar subtítulos base que luego se revisan y sincronizan con el modelo Qwen3-ForcedAligner-0.6B.
- Asistentes de voz en dispositivos edge: con cuantización Q4_K_M de 1,23 GB y ejecución en CPU o Metal, puede desplegarse en portátiles, mini-PC o dispositivos embebidos con Apple Silicon para dictado y comandos de voz offline.
- Archivado y búsqueda de grabaciones: transcripción por lotes de archivos de audio históricos para indexación y búsqueda textual, usando el backend Vulkan o CPU en servidores sin GPU dedicada.
- Atención al cliente y call centers: transcripción de llamadas para análisis de calidad y extracción de entidades, aprovechando la detección automática de idioma para clientes internacionales.
- Investigación lingüística y corpus: generación de transcripciones en 30 idiomas (incluidos cantonés, filipino, macedonio o tailandés) para estudios comparativos o construcción de datasets etiquetados.
- Accesibilidad: conversión de audio a texto en tiempo no real para personas con discapacidad auditiva, con despliegue local que evita enviar datos sensibles a servicios externos.

## Benchmarks y rendimiento

Resultados de WER publicados en la model card de la conversión (LibriSpeech test-clean completo, 2620 enunciados en inglés, normalizador de texto estilo Whisper y jiwer 3.x, backend Metal en Apple M4):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 3,80 GB | 1,62 % |
| F16 | 3,81 GB | 1,62 % |
| Q8_0 | 2,04 GB | 1,61 % |
| Q6_K | 1,58 GB | 1,65 % |
| Q5_K_M | 1,41 GB | 1,65 % |
| Q4_K_M | 1,23 GB | 1,81 % |

Rendimiento en tiempo real (RTF, menor es mejor), según los metadatos `transcribe_cpp`:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 39,5 |
| Apple M4 Max | CPU | 8 |
| Ryzen 4750U | Vulkan | 3,8 |
| Ryzen 4750U | CPU | 2 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo ASR y no de un LLM de propósito general.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,3 GB con Q4_K_M, 1,6 GB con Q6_K, 2,1 GB con Q8_0 y 3,9 GB con BF16/F16.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon M1 en adelante) o Vulkan (AMD, Intel, NVIDIA); no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2-4 GB de VRAM libre; también funciona íntegramente en CPU.
- Opciones de despliegue: `transcribe.cpp` (CLI `transcribe-cli`), compilado desde fuente con CMake. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI para esta conversión GGUF concreta.
- Latencia y throughput: RTF de 39,5 en Metal sobre M4 Max y de 3,8 en Vulkan sobre Ryzen 4750U (valores tal como aparecen en los metadatos; conviene verificar la convención de unidades en la documentación de `transcribe.cpp`).
- Requiere audio de entrada en WAV mono a 16 kHz; para otros formatos hay que convertir previamente con ffmpeg (`ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---:|---|---|---|
| Qwen3-ASR-1.7B (esta conversion) | 2,04 B | 30 | 1,62 % (BF16) / 1,81 % (Q4_K_M) | Apache-2.0 | GGUF |
| Qwen3-ASR-0.6B | no disponible en la informacion | 30 (familia) | no disponible | Apache-2.0 | safetensors / GGUF |
| Whisper large-v3 | no disponible en la informacion | ~99 | no disponible en la informacion | MIT (upstream) | safetensors / GGUF |
| Qwen3-ForcedAligner-0.6B | 0,6 B | 11 | no aplica (alineacion) | no disponible | no disponible |

La model card original afirma que la versión de 1,7 B alcanza rendimiento state-of-the-art entre modelos ASR open source y es competitiva con las APIs comerciales más potentes, aunque no se aportan cifras comparativas concretas frente a Whisper u otros modelos en la información disponible.

## Limitaciones y advertencias

- El WER publicado corresponde únicamente al caso inglés; el rendimiento en los otros 29 idiomas no está cuantificado en la información disponible.
- No soporta streaming en esta implementación, lo que limita su uso en aplicaciones de transcripción en tiempo real.
- No emite timestamps ni marcas de tiempo; para alineación temporal hay que recurrir a Qwen3-ForcedAligner-0.6B.
- No soporta traducción: transcribe en el idioma detectado, no traduce a otro.
- No admite sugerencias explícitas de idioma; la detección es automática y podría fallar en audios cortos, con ruido o con cambio de idioma intra-utterance.
- Requiere audio WAV mono a 16 kHz; no acepta directamente MP3, MP4 ni otros contenedores.
- Riesgo de alucinación y errores en nombres propios, siglas, números y terminología técnica, habitual en modelos ASR.
- Sesgos potenciales derivados de los datos de entrenamiento (no documentados en la información disponible), especialmente en acentos y dialectos poco representados.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar los términos del modelo base upstream y las dependencias de `transcribe.cpp`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es aún inexistente.
- La conversión está fijada a un commit concreto del modelo base y de `transcribe.cpp`; cambios upstream podrían romper la compatibilidad.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/mrsoundmind/Qwen3-ASR-1.7B-gguf
- Modelo base Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Commit upstream fijado: https://huggingface.co/Qwen/Qwen3-ASR-1.7B/commit/7278e1e70fe206f11671096ffdd38061171dd6e5
- Repositorio de transcribe.cpp: https://github.com/mrsoundmind/transcribe.cpp
- Paper referenciado (arXiv:2601.21337): https://arxiv.org/abs/2601.21337
- Descarga BF16: https://huggingface.co/mrsoundmind/Qwen3-ASR-1.7B-gguf/resolve/main/Qwen3-ASR-1.7B-BF16.gguf
- Descarga F16: https://huggingface.co/mrsoundmind/Qwen3-ASR-1.7B-gguf/resolve/main/Qwen3-ASR-1.7B-F16.gguf
- Descarga Q8_0: https://huggingface.co/mrsoundmind/Qwen3-ASR-1.7B-gguf/resolve/main/Qwen3-ASR-1.7B-Q8_0.gguf
- Descarga Q6_K: https://huggingface.co/mrsoundmind/Qwen3-ASR-1.7B-gguf/resolve/main/Qwen3-ASR-1.7B-Q6_K.gguf
- Descarga Q5_K_M: https://huggingface.co/mrsoundmind/Qwen3-ASR-1.7B-gguf/resolve/main/Qwen3-ASR-1.7B-Q5_K_M.gguf
- Descarga Q4_K_M: https://huggingface.co/mrsoundmind/Qwen3-ASR-1.7B-gguf/resolve/main/Qwen3-ASR-1.7B-Q4_K_M.gguf
