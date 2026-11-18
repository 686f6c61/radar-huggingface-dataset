# audio-cpp/audio.cpp-gguf

## Resumen

`audio-cpp/audio.cpp-gguf` es un repositorio de conversiones GGUF nativas del runtime [audio.cpp](https://github.com/0xShug0/audio.cpp), no un modelo individual. Agrupa decenas de paquetes cuantizados de modelos de audio de terceros: TTS, ASR, conversión de voz, generación de audio, separación de fuentes, diarización de hablantes y detección de actividad de voz. El objetivo es ofrecer un formato de pesos único y optimizado para audio.cpp que permita cargar estos modelos sin depender de los stacks originales (PyTorch, ONNX, etc.).

El repositorio lo mantiene el equipo de audio.cpp y actúa como capa de distribución: cada subdirectorio (`ACE-Step1.5-GGUF`, `Chatterbox-GGUF`, `DotTTS-MF-GGUF`, etc.) contiene los pesos convertidos de un modelo base concreto, con su propia licencia original. La model card lista explícitamente más de 70 modelos base de origen, entre ellos ACE-Step, Qwen3-TTS, Qwen3-ASR, Chatterbox, VibeVoice, Voxtral, Parakeet, Stable Audio 3, IndexTTS-2, Fish Audio S2 Pro o MiniMax-H3.

Es relevante ahora porque concentra en un solo punto de descarga un ecosistema de audio muy fragmentado, con más de 9,5 millones de descargas acumuladas, y porque estandariza la cuantización (F32, BF16, F16, Q8, Q4, Q4_K) sobre un runtime propio en C++. El dato de "16.578.590 parámetros" que aparece en los metadatos de Hugging Face corresponde a un único componente del repo y no representa el conjunto, ya que el tamaño total del repositorio es de 1.683,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Múltiple: cada subdirectorio corresponde a la arquitectura de su modelo base (transformers de audio, codecs neuronales, modelos de separación tipo RoFormer, CTC/RNNT para ASR, etc.) |
| Parametros totales | No disponible como cifra única; varía por paquete (desde ~100M en MOSS-TTS-Nano hasta varios miles de millones en MiniMax-H3 o VibeVoice-ASR-Streaming-7B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F32, BF16, F16, Q8, Q4, Q4_0, Q4_K (según paquete) |
| Idiomas soportados | No disponible como conjunto; depende de cada modelo base (hay paquetes multilingües como GigaAM-Multilingual, Voxtral-Mini-4B-Realtime o Qwen3-TTS) |
| Licencia | `other` a nivel de repo; cada paquete conserva la licencia de su modelo original (MIT, Apache-2.0, CC-BY-4.0, CC-BY-SA-4.0, CC-BY-NC-4.0, BSD-3-Clause, licencias de investigación no comercial, etc.) |
| Formato de pesos | GGUF (nativo de audio.cpp) |
| Libreria | audio.cpp |
| Pipeline declarado | text-to-speech |
| Tamano del repositorio | 1.683,8 GB |
| Descargas / likes | 9.512.144 / 332 |
| Fecha de creacion / actualizacion | 2026-07-14 / 2026-11-15 |

## Arquitectura y entrenamiento

Este repositorio no entrena modelos: publica conversiones y cuantizaciones de modelos ya entrenados por terceros. Cada subdirectorio mantiene la arquitectura del modelo original (por ejemplo, `ace_step` para ACE-Step, `chatterbox` para ResembleAI Chatterbox, `dots_tts` para la familia DotTTS, `canary_asr` para Canary, `htdemucs` para separación de fuentes, `firered_vad` para detección de voz). La conversión la realiza la herramienta de audio.cpp y produce pesos en formato GGUF con distintos niveles de precisión según el paquete.

La model card indica que los paquetes convertidos y cuantizados se validan con métricas automáticas, pero advierte explícitamente de que la calidad percibida por oyentes humanos puede diferir. No se publican detalles sobre tokens de entrenamiento, composición de datasets ni procesos de RLHF/DPO, ya que esos datos pertenecen a cada modelo base y no al repositorio de conversión.

## Capacidades

- Síntesis de voz (TTS) con múltiples familias: ACE-Step, Chatterbox, Chatterbox-Turbo, CosyVoice3, DotTTS (Edit, MF, SOAR), FireRedTTS3 (Base e Instruct), Fish Audio S2 Pro, IndexTTS, Qwen3-TTS, MOSS-TTS, entre otras.
- Reconocimiento automático de habla (ASR): Canary-180M-Flash, Citrinet, Cohere Transcribe, CrisperWhisper 2.0, Fun-ASR-Nano, GigaAM, Granite-Speech 5.0, Haas-ja, Parakeet-TDT, Nemotron ASR streaming, Voxtral-Mini-4B-Realtime.
- Conversión de voz (voice conversion): SeedVC, MeanVC2, entre otros paquetes del ecosistema.
- Generación de audio y música: Stable Audio 3 (medium, small-music, small-sfx), ACE-Step, MOSS-SoundEffect v2.0, HeartMuLa.
- Separación de fuentes: HTDemucs, HTDemucs-6stems, BS-RoFormer, Mel-RoFormer.
- Diarización de hablantes: Sortformer 4spk, personaplex.
- Detección de actividad de voz (VAD) y VAD en streaming: FireRedVAD.
- Superresolución y restauración de audio: AudioSR, MossFormer2_SR_48K.
- Etiquetado y clasificación de audio: AST-AudioSet, CED (Tiny/Mini/Small/Base).
- Alineamiento forzado: Qwen3-ForcedAligner.
- Carga directa de ficheros, layouts compatibles y sidecar embedding según la guía GGUF de audio.cpp.

## Casos de uso

- Síntesis de voz en producción con latencia controlada: desplegar un paquete Q8 de Chatterbox o Qwen3-TTS mediante audio.cpp permite generar audio sin depender del stack Python original, con un binario C++ ligero y opciones de cuantización que reducen memoria.
- Transcripción de reuniones y subtitulado: combinar un paquete ASR (Parakeet-TDT, Canary, GigaAM) con un VAD (FireRedVAD) en el mismo runtime simplifica el pipeline de segmentación y transcripción en local.
- Clonación de voz y voice design: los paquetes de Qwen3-TTS-CustomVoice, Qwen3-TTS-VoiceDesign o IndexTTS-2 permiten construir asistentes con voces personalizadas sin salir del ecosistema audio.cpp.
- Separación de stems para postproducción musical: HTDemucs y HTDemucs-6stems en GGUF permiten aislar voces, batería, bajo y otros instrumentos en un flujo offline reproducible.
- Diarización de llamadas o entrevistas: Sortformer 4spk identifica y separa hablantes, útil para actas automáticas, análisis de contact center y compliance.
- Generación de efectos de sonido y música para vídeo: Stable Audio 3 small-sfx y small-music, junto con MOSS-SoundEffect v2.0, cubren la generación de assets de audio bajo demanda.
- Restauración y mejora de archivos históricos: AudioSR y MossFormer2_SR_48K permiten reescalar audio de baja calidad o banda estrecha a 48 kHz.
- Investigación reproducible en audio: al fijar versiones de pesos GGUF y un runtime común, se facilita la comparación controlada entre modelos de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, WER, MOS, FAD ni métricas comparativas; solo indica que los paquetes se validan con métricas automáticas sin publicar los valores.

## Requisitos de hardware

- VRAM estimada: depende del paquete. Los modelos pequeños (MOSS-TTS-Nano-100M, Canary-180M, Citrinet, CED-Tiny) caben en menos de 1 GB en Q8. Los modelos medianos (Chatterbox, Qwen3-TTS-0.6B, Parakeet-TDT-0.6B) requieren aproximadamente 1-2 GB en Q8. Los modelos grandes (VibeVoice-ASR-Streaming-7B, Voxtral-Mini-4B, MiniMax-H3, MioTTS-1.7B, Higgs-Audio-v3-TTS-4B) pueden requerir entre 4 y 16 GB según cuantización.
- GPU recomendadas: RTX 3060/4060 para paquetes pequeños y medianos en Q8; RTX 4090 o A100 para los paquetes de 4B-7B en BF16; H100 para servir varios modelos simultáneamente o para MiniMax-H3 en alta precisión.
- Cabe en GPU consumer: sí para la mayoría de paquetes en Q8 y Q4; los de mayor tamaño pueden necesitar Q4 o Q4_K para caber en 8-12 GB de VRAM.
- Opciones de despliegue: audio.cpp (runtime nativo, único soportado oficialmente para estos GGUF). No se indica compatibilidad con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del paquete concreto, la GPU y la cuantización.

## Comparativa con modelos similares

| Modelo / repositorio | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| audio-cpp/audio.cpp-gguf | Colección GGUF multi-modelo de audio | Variable por paquete | No disponible | Mixta (hereda la de cada base) | Hugging Face, runtime audio.cpp |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base (modelo base incluido) | TTS monolítico | ~1,7B | No disponible | Según Qwen | Hugging Face, uso directo en PyTorch |
| microsoft/VibeVoice-ASR-Streaming-7B (modelo base incluido) | ASR streaming | ~7B | No disponible | Según Microsoft | Hugging Face |
| fishaudio/s2-pro (modelo base incluido) | TTS de alta calidad | No disponible | No disponible | Fish Audio Research License | Hugging Face |

La comparativa directa con "un modelo similar" no es posible en sentido estricto: este repositorio es un agregador de conversiones, no un modelo único. Frente a usar cada modelo base por separado, la ventaja es la unificación de formato y runtime; la desventaja es que la calidad final depende de la fidelidad de la conversión y de la cuantización elegida.

## Limitaciones y advertencias

- No es un modelo: es un repositorio de conversiones. Cualquier evaluación de calidad debe hacerse por paquete concreto.
- La model card advierte de que las métricas automáticas no garantizan calidad percibida; hay que validar el paquete, backend y ruta exactos antes de producción.
- Licencias heterogéneas: aunque el repo declara `other`, cada paquete conserva la licencia original. Hay paquetes con licencias no comerciales (Breeze-TTS-2, CrisperWhisper 2.0, ControlFoley CC-BY-NC-4.0, Fish Audio Research License, LTX-2 Community License). Es imprescindible revisar la licencia del subdirectorio antes de uso comercial.
- El paquete `BS-RoFormer-ep368-GGUF` se marca como Apache-2.0 con "checkpoint source undocumented", lo que implica riesgo de procedencia.
- El tamaño total del repositorio (1.683,8 GB) hace inviable una descarga completa en muchos entornos; conviene descargar solo los subdirectorios necesarios.
- Idiomas soportados no están consolidados a nivel de repo; dependen del modelo base y pueden no cubrir castellano en algunos paquetes.
- Riesgo de alucinación en ASR (transcripciones plausibles pero incorrectas) y de artefactos en TTS con cuantizaciones agresivas (Q4, Q4_K).
- Sesgos de voz, acento y género heredados de los datasets de cada modelo base; no se documentan mitigaciones en este repositorio.
- Dependencia de un runtime específico (audio.cpp); no hay soporte declarado para otros motores de inferencia, lo que limita la portabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/audio-cpp/audio.cpp-gguf
- Runtime audio.cpp en GitHub: https://github.com/0xShug0/audio.cpp
- Guía GGUF de audio.cpp: https://github.com/0xShug0/audio.cpp/blob/main/docs/gguf.md
- Referencia de licencias de modelos de audio.cpp: https://github.com/0xShug0/audio.cpp/blob/main/docs/model_licenses.md
- Licencia de Breeze-TTS-2: https://huggingface.co/BreezeBlue/Breeze-TTS-2/blob/main/LICENSE
- Licencia de Fish Audio S2 Pro: https://huggingface.co/fishaudio/s2-pro/blob/main/LICENSE.md
- Licencia de DramaBox (LTX-2 Community License): https://huggingface.co/ResembleAI/Dramabox/blob/main/LICENSE
