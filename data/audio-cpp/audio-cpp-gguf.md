# audio-cpp/audio.cpp-gguf

## Resumen

`audio-cpp/audio.cpp-gguf` es un repositorio de conversiones GGUF nativas para [audio.cpp](https://github.com/0xShug0/audio.cpp), un runtime de inferencia de audio escrito en C++. No se trata de un unico modelo entrenado por el autor, sino de una coleccion de paquetes cuantizados que empaquetan decenas de modelos de voz, TTS, ASR, separacion de fuentes, diarizacion y generacion musical en un formato comun compatible con dicho runtime. El repositorio esta mantenido por el colectivo `audio-cpp` y se distribuye bajo licencia `other`, con condiciones que remiten a las licencias originales de cada modelo base.

El problema que resuelve es la fragmentacion del ecosistema de audio open source: en lugar de exigir Python, PyTorch y dependencias especificas por modelo, audio.cpp ofrece un unico ejecutable capaz de cargar pesos GGUF de familias muy distintas (ACE-Step, Qwen3-TTS, Chatterbox, VibeVoice, MossFormer2, Voxtral, Parakeet, etc.). Esto reduce el coste de despliegue y permite ejecutar pipelines de audio en entornos sin GPU dedicada o con recursos limitados.

La relevancia actual viene dada por su adopcion: casi 10 millones de descargas y 337 likes en Hugging Face, con actualizaciones frecuentes (ultima en noviembre de 2026). El repositorio ocupa 1.697,6 GB, lo que refleja la amplitud del catalogo. El dato de parametros totales en safetensors (16.578.590) corresponde a un unico componente del paquete, no al conjunto completo, por lo que no debe interpretarse como el tamano del repositorio entero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multiples arquitecturas segun familia (transformer encoder-decoder para TTS/ASR, Conformer, RoFormer, codecs neuronales, difusion para musica) |
| Parametros totales | 16.578.590 (dato reportado en safetensors de un componente; el repositorio agrega decenas de modelos de distinto tamano) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32, F16, BF16, Q8, Q4, Q4_0, Q4_K (segun paquete) |
| Idiomas soportados | no disponible (depende del modelo base; varios son multilingues) |
| Licencia | other (cada paquete hereda la licencia de su modelo original: MIT, Apache-2.0, CC-BY-4.0, CC-BY-NC-4.0, BSD-3-Clause, licencias de investigacion no comercial, etc.) |
| Formato de pesos | GGUF (nativo de audio.cpp) |

## Arquitectura y entrenamiento

El repositorio no entrena modelos propios: realiza conversion y cuantizacion de pesos desde checkpoints originales (safetensors/PyTorch) a GGUF, preservando la arquitectura de cada modelo base. Por tanto, la "arquitectura" es heterogenea: hay transformers encoder-decoder para TTS (Qwen3-TTS, IndexTTS, Chatterbox), modelos Conformer/CTC para ASR (Parakeet, Citrinet, Canary), RoFormer para separacion de fuentes (BS-RoFormer), codecs neuronales (MioCodec, MOSS-Audio-Tokenizer, Vocos) y modelos de difusion para generacion musical (ACE-Step, Stable Audio 3).

El proceso de conversion sigue la guia documentada en `docs/gguf.md` del repositorio audio.cpp, que describe layouts soportados, carga directa de ficheros, embedding de sidecars y notas de compatibilidad. Los paquetes cuantizados se validan con metricas automaticas, aunque el propio autor advierte que la calidad percibida por oyentes humanos puede diferir y recomienda validar cada paquete, backend y ruta concretos antes de usarlo en produccion. No se dispone de informacion sobre datasets de entrenamiento, numero de tokens, ni procesos de RLHF/DPO, ya que estos datos pertenecen a los modelos originales y no se reproducen en este repositorio.

## Capacidades

- Sintesis de voz (TTS) con multiples familias: ACE-Step, Qwen3-TTS (Base, CustomVoice, VoiceDesign), Chatterbox, Chatterbox-Turbo, IndexTTS-2/2.5, CosyVoice3, DotTTS, FireRedTTS3, Higgs-Audio-v3-TTS, entre otras.
- Reconocimiento automatico de voz (ASR): Canary, Citrinet, Cohere Transcribe, CrisperWhisper, Fun-ASR, GigaAM, Granite-Speech, Parakeet, VibeVoice-ASR, Voxtral, Qwen3-ASR.
- Conversion de voz (voice conversion): SeedVC, MeanVC2.
- Texto a audio y audio a audio: MOSS-SoundEffect, Stable Audio 3, MuLaCover.
- Separacion de fuentes: BS-RoFormer, MossFormer2-SS.
- Diarizacion de hablantes: Sortformer (NVIDIA).
- Deteccion de actividad de voz (VAD): FireRedVAD.
- Restauracion y mejora de audio: AudioSR, MossFormer2-SR/SE.
- Clonacion de voz y diseno de voz (VoiceDesign).
- Generacion musical con ACE-Step.
- Alineamiento forzado (Qwen3-ForcedAligner).
- Modelos de embedding y clasificacion de audio (AST-AudioSet, CED).

## Casos de uso

- Sintesis de voz en produccion: usar los paquetes Qwen3-TTS o Chatterbox en audio.cpp para generar locuciones en tiempo real sin depender de Python ni PyTorch, integrable en servicios C++ de baja latencia.
- Transcripcion de reuniones: combinar Parakeet-TDT o Canary con Sortformer para obtener transcripcion y diarizacion en un unico pipeline, gracias a que ambos modelos conviven en el mismo runtime.
- Clonacion de voz para accesibilidad: emplear M5-TTS-VoiceClone o Qwen3-TTS-CustomVoice para generar voces personalizadas a partir de muestras cortas, util en lectores de pantalla y asistentes personales.
- Limpieza de audio para podcast: encadenar MossFormer2-SE y AudioSR para eliminar ruido y superresolver grabaciones de baja calidad antes de publicarlas.
- Separacion de stems musicales: usar BS-RoFormer para aislar voces, bateria y bajo en produccion musical o remezclas.
- Generacion de efectos de sonido para videojuegos: emplear MOSS-SoundEffect o Stable Audio 3-SFX para crear efectos bajo demanda en el motor del juego, sin dependencias de nube.
- Prototipado de agentes de voz: integrar Voxtral o VibeVoice-ASR-Streaming como capa de reconocimiento en un agente conversacional que corre en local.
- Investigacion en TTS multilingue: comparar familias (IndexTTS, FireRedTTS3, CosyVoice3) sobre el mismo runtime para evaluar calidad y latencia de forma homogenea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que los paquetes cuantizados se validan con metricas automaticas, pero no se detallan valores numericos (WER, MOS, SIM, etc.) ni comparaciones con los modelos originales en precision completa.

## Requisitos de hardware

- VRAM estimada: muy variable segun el paquete elegido. Modelos pequenos (M5-TTS-50M, MOSS-TTS-Nano-100M, Qwen3-ASR-0.6B) caben en menos de 2 GB en Q8; modelos medianos (Chatterbox, IndexTTS, Parakeet-TDT-0.6B) requieren entre 2 y 6 GB; modelos grandes (VibeVoice-ASR-Streaming-7B, Voxtral-Mini-4B, personaplex-7b) pueden necesitar 8-16 GB en BF16/Q8.
- GPU recomendadas: RTX 3060 12 GB o superior para la mayoria de paquetes; A100/H100 para procesamiento por lotes de modelos grandes o pipelines multi-modelo.
- Compatibilidad con GPU de consumo: si, la mayoria de paquetes Q4/Q8 caben en GPUs consumer de 8-12 GB. Los paquetes F32 de modelos grandes pueden no caber.
- Opciones de despliegue: audio.cpp (runtime nativo, CLI y libreria C++). No se documenta soporte directo en vLLM, llama.cpp, Ollama ni TGI, ya que el formato GGUF de audio.cpp no es compatible con llama.cpp.
- Latencia y throughput: no disponibles como cifras publicadas. Dependen del paquete, cuantizacion, backend (CPU/GPU) y longitud de la secuencia de audio.

## Comparativa con modelos similares

| Modelo / repositorio | Enfoque | Ambito | Licencia | Disponibilidad |
|---|---|---|---|---|
| audio-cpp/audio.cpp-gguf | Runtime C++ unico con GGUF multi-modelo | TTS, ASR, VC, separacion, diarizacion, musica | other (heredada por paquete) | Hugging Face + GitHub |
| llama.cpp | Runtime C++ con GGUF para LLMs de texto | Solo texto | MIT | Hugging Face + GitHub |
| whisper.cpp | Runtime C++ con GGUF para Whisper | Solo ASR | MIT | Hugging Face + GitHub |
| Modelos originales (Qwen3-TTS, Chatterbox, ACE-Step, etc.) | Pesos PyTorch nativos | Tarea especifica por modelo | Variable | Hugging Face |

La ventaja diferencial de audio.cpp frente a whisper.cpp o llama.cpp es la cobertura multi-tarea dentro de un mismo binario; la desventaja es que no existe un ecosistema de terceros tan amplio ni integraciones con servidores de inferencia populares.

## Limitaciones y advertencias

- Licencia `other`: cada paquete hereda la licencia del modelo original. Varios son no comerciales (Breeze-TTS-2, ControlFoley CC-BY-NC-4.0, CrisperWhisper, Fish-Audio-S2-Pro). Es obligatorio revisar la licencia del paquete concreto antes de uso comercial.
- El autor advierte explicitamente que la calidad percibida por oyentes humanos puede diferir de las metricas automaticas; hay que validar cada paquete y ruta en el caso de uso real.
- Algunos checkpoints originales tienen procedencia documental incompleta (por ejemplo, BS-RoFormer-ep368), lo que complica la trazabilidad legal.
- Riesgo de alucinacion y artefactos: en TTS y ASR los modelos pueden generar audio ininteligible, repetir frases o transcribir contenido inexistente, especialmente con cuantizaciones agresivas (Q4).
- Idiomas: no se documenta una lista consolidada; la cobertura depende del modelo base. Varios paquetes son solo ingles o multilingues limitados.
- Compatibilidad: los GGUF de audio.cpp no son intercambiables con llama.cpp ni con otros runtimes; el formato es especifico del proyecto.
- Madurez del ecosistema: audio.cpp es un proyecto relativamente joven; la API y los layouts pueden cambiar entre versiones.
- Tamano del repositorio: 1.697,6 GB dificultan la clonacion completa; conviene descargar solo los paquetes necesarios mediante `huggingface-cli download --include`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/audio-cpp/audio.cpp-gguf
- Repositorio GitHub de audio.cpp: https://github.com/0xShug0/audio.cpp
- Guia GGUF de audio.cpp: https://github.com/0xShug0/audio.cpp/blob/main/docs/gguf.md
- Referencia de licencias de modelos: https://github.com/0xShug0/audio.cpp/blob/main/docs/model_licenses.md
- Modelo base ACE-Step 1.5: https://huggingface.co/ACE-Step/Ace-Step1.5
- Modelo base Qwen3-TTS: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Modelo base Chatterbox: https://huggingface.co/ResembleAI/chatterbox
- Modelo base VibeVoice: https://huggingface.co/microsoft/VibeVoice-1.5B
- Modelo base Parakeet: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
