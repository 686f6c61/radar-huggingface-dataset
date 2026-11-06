# infosave/Nemotron-3.5-Transcribe-30B-A4B-cmf

## Resumen

Nemotron 3.5 Transcribe 30B-A4B (CMF) es un empaquetado cuantizado del modelo de reconocimiento de voz automático (ASR) de NVIDIA, NVIDIA-Nemotron-3.5-Transcribe-30B-A4B, distribuido en formato CMF por el usuario infosave. El modelo original combina un codificador ASR de tipo transformer y un codificador de hablantes Sortformer que alimentan un modelo de lenguaje híbrido Mamba-2 / atención con expertos (MoE) de 34 B de parámetros totales y 4,3 B activos, con soporte para 40 idiomas. Este repo lo convierte en ficheros CMF únicos que se ejecutan con `cortiq`, un motor de inferencia en Rust sin Python ni frameworks de ML.

La relevancia de esta versión radica en que permite ejecutar un ASR de última generación con diarización, marcas de tiempo por palabra y traducción de voz directamente en GPU (vía Vulkan/DX12/Metal) o CPU, sin dependencias de Python. Incluye dos cuantizaciones: q4tp (expertos en 4 bits, 19,86 GB) y q8_2f (8 bits, 34,59 GB), con WER medido de 1,44 % en LibriSpeech test-clean para la versión de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador ASR transformer + codificador de hablantes Sortformer + LM híbrido Mamba-2/atención con MoE |
| Parametros totales | 34 B (el modelo base; el nombre comercial indica 30B-A4B) |
| Parametros activos | 4,3 B (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4tp (GPTQ 4 bits en expertos, q8_2f en el resto del decoder, torres de audio en bf16); q8_2f completo (8 bits, torres de audio bf16) |
| Idiomas soportados | 40 idiomas (el repo etiqueta en, ru, zh, multilingual; lista completa no disponible) |
| Licencia | openmdw-1.1 (licencia "other" en Hugging Face) |
| Formato de pesos | CMF (fichero único empaquetado, ejecutado con cortiq) |

## Arquitectura y entrenamiento

El pipeline consta de tres componentes: un codificador ASR de tipo transformer que procesa el front-end log-mel, un codificador de hablantes Sortformer para diarización, y un decodificador basado en un modelo de lenguaje híbrido que combina capas Mamba-2 (SSM), atención estándar y capas MoE con 2944 expertos en total (128 expertos por capa MoE según la configuración de offloading descrita). El decodificador incorpora capas de predicción multi-token y una cabeza de marcas de tiempo por palabra con vocabulario de alineación.

Sobre el entrenamiento del modelo base, la model card no detalla el número de tokens ni la composición del dataset; NVIDIA reporta un WER de 1,09 % en LibriSpeech test-clean para el modelo bf16 original. En cuanto a la cuantización, los expertos q4tp se codifican con GPTQ contra las entradas de expertos de 11 000 tokens (73 grabaciones y sus transcripciones); los 79 de 2944 expertos enrutados con menos de 32 filas de calibración mantienen codificación round-to-nearest. La verificación de paridad con la implementación de referencia muestra errores relativos de 5e-7 a 7e-6 en la salida del codificador ASR y un acuerdo argmax de 96–100 % en la decodificación.

## Capacidades

- Transcripción de voz a texto en 40 idiomas, con salida literal (verbatim) por defecto
- Marcas de tiempo por palabra (`--timestamps`), con línea "inicio fin palabra" en segundos
- Diarización de hablantes mediante etiquetas `<spk:0>` a `<spk:3>` combinables con marcas de tiempo por palabra
- Transcripción limpia mediante prompts (elimina muletillas y repeticiones accidentales, aplica puntuación y mayúsculas)
- Traducción de voz directa (speech translation) a idiomas objetivo mediante prompt (ejemplo documentado: alemán)
- Procesamiento por lotes: varios ficheros en una llamada comparten una única carga del modelo
- Entrada WAV flexible: PCM 8/16/24/32 bits o float, cualquier frecuencia de muestreo, mono o estéreo
- Grabaciones largas y multi-hablante documentadas (97,6 s, 4 hablantes, 432 tokens)
- Decodificación especulativa en la variante q4tp sobre GPU discreta

## Casos de uso

- Transcripción de reuniones con diarización: mediante el prompt de etiquetas de hablante y `--timestamps`, se obtiene quién dijo qué y cuándo, adecuado para actas de reuniones multi-hablante de hasta varios minutos
- Subtitulado y localización: las marcas de tiempo por palabra en segundos permiten alinear subtítulos frame a frame, y la traducción de voz directa cubre flujos de doblaje rápido
- Transcripción médica o legal con texto limpio: el prompt de "omitir muletillas y repeticiones" genera transcripciones listas para dictado profesional sin postedición manual
- Procesamiento masivo de archivos de audio en servidores sin Python: al ser un binario Rust con modo batch (varios ficheros por carga de modelo), encaja en pipelines ETL de audio en CI/CD o contenedores minimalistas
- Despliegue en estaciones de trabajo Apple Silicon: el fichero q4tp corre por Metal en un Mac mini M4 de 24 GB desde memory map, sin GPU discreta
- Inferencia en CPU en servidores sin GPU: la variante q8_2f alcanza RTF 0,83 en un EPYC de 31 núcleos, viable para transcripción diferida
- Análisis de call centers multilingües: soporte de ruso, chino e inglés documentado, con transcripción literal que conserva muletillas para análisis de calidad de servicio

## Benchmarks y rendimiento

WER medido por el autor del repo (73 clips de `hf-internal-testing/librispeech_asr_dummy`, 1150 palabras, greedy, en minúsculas y sin puntuación):

| Variante | WER (normalización propia) | WER (normalizador Whisper, Open ASR Leaderboard) |
|---|---:|---:|
| q4tp | 2,26 % | 1,88 % |
| q8_2f | 2,09 % | 1,71 % |

LibriSpeech test-clean (2620 grabaciones, 52 576 palabras, normalizador del leaderboard):

| Modelo | WER |
|---|---:|
| q4tp (este repo) | 1,44 % |
| Modelo base bf16 (NVIDIA) | 1,09 % |

Rendimiento de inferencia (`cortiq transcribe --stats`):

| Hardware | Fichero | Grabación | Tiempo total | RTF | Decodificación |
|---|---|---|---:|---:|---:|
| RTX 3090 (Vulkan) | q4tp | 9,3 s | 0,96 s | 0,104 | 184 tok/s |
| RTX 3090 (Vulkan) | q4tp | 29,4 s | 1,82 s | 0,062 | 182 tok/s |
| RTX 3090 (Vulkan) | q4tp | 97,6 s, 4 hablantes | 6,87 s | 0,070 | 168 tok/s |
| RTX 3090 (Vulkan) | q8_2f | 29,4 s | 5,62 s | 0,191 | 43 tok/s |
| RTX 3090 (Vulkan) | q8_2f | 97,6 s, 4 hablantes | 24,1 s | 0,247 | 36 tok/s |
| Mac mini M4 (Metal) | q4tp | 29,4 s | 25,2 s | 0,86 | 8,9 tok/s |
| AMD EPYC 7H12 (CPU, 31 núcleos) | q8_2f | 29,4 s | 24,5 s | 0,83 | no disponible |

## Requisitos de hardware

- Variante q4tp (19,86 GB): cabe en GPUs de 24 GB (RTX 3090, RTX 4090); es la opción por defecto recomendada para 24 GB
- Variante q8_2f (34,59 GB): en GPUs de 24 GB los expertos se descargan parcialmente a RAM (75 de 128 expertos por capa MoE en una 3090, con movimiento dinámico de expertos frecuentes a la tarjeta); se recomiendan GPUs de 40 GB o más (A100 40/80 GB, H100) para carga completa; también funciona en CPU
- CPU: viable con q8_2f (RTF 0,83 en EPYC 7H12 con 31 núcleos); no disponible el detalle para q4tp en CPU
- Apple Silicon: Mac mini M4 de 24 GB ejecuta q4tp por Metal desde memory map (RTF 0,86)
- Despliegue: exclusivamente con `cortiq` (instalable vía `cargo install cortiq-cli` o binarios precompilados); no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, y no se distribuyen pesos en safetensors ni GGUF en este repo
- Backend GPU: Vulkan, DX12 o Metal a través de wgpu, o ejecución en CPU
- Variable de entorno `CMF_NEMO_EXPERT_GB` para ajustar el presupuesto de VRAM dedicado a expertos
- Latencia: RTF entre 0,062 y 0,104 con q4tp en RTX 3090 (una grabación de 30 s se transcribe en menos de 2 s)

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | WER (test-clean) | Contexto | Licencia | Formato |
|---|---|---|---:|---|---|---|
| Nemotron 3.5 Transcribe 30B-A4B (CMF q4tp) | 34 B totales / 4,3 B activos | Transformer + Sortformer + Mamba-2/MoE | 1,44 % | no disponible | openmdw-1.1 | CMF |
| Modelo base NVIDIA bf16 | 34 B totales / 4,3 B activos | idéntica | 1,09 % | no disponible | licencia NVIDIA (other) | no disponible |
| Whisper large-v3 (referencia habitual) | 1,55 B | Transformer encoder-decoder | ~1,8–2,7 % (según normalizador) | 30 s por ventana (segmentos) | MIT | safetensors, GGUF |

Nota: la comparativa con Whisper es orientativa; los valores exactos dependen del normalizador y del benchmark. No se han publicado en la información disponible comparativas directas de este repo frente a otros modelos con el mismo protocolo.

## Limitaciones y advertencias

- La cuantización q4tp degrada el WER respecto al modelo base bf16: 1,44 % frente a 1,09 % en LibriSpeech test-clean
- La variante q8_2f en GPUs de 24 GB depende de offloading de expertos a RAM/disco, lo que puede degradar el rendimiento si la RAM es escasa
- El formato CMF y el motor cortiq son de un tercero (infosave), no de NVIDIA: el ecosistema es mucho más reducido que safetensors + Transformers/vLLM y la compatibilidad futura no está garantizada
- Solo se documenta entrada WAV; no se mencionan formatos comprimidos (MP3, FLAC, Opus)
- La lista completa de los 40 idiomas no está disponible en la model card; solo se etiquetan explícitamente inglés, ruso y chino; no hay información sobre soporte del castellano
- La licencia openmdw-1.1 es una licencia "other": conviene revisar sus términos antes de uso comercial
- Riesgo de alucinación en segmentos de audio silencioso o ruidoso: no disponible información específica, pero es un comportamiento típico de modelos ASR basados en LM
- El número máximo de hablantes en diarización documentado en los ejemplos es 4 (`<spk:0>` a `<spk:3>`)
- No hay datos sobre sesgos conocidos ni evaluaciones fairness en la información disponible

## Enlaces

- Repositorio del modelo (CMF): https://huggingface.co/infosave/Nemotron-3.5-Transcribe-30B-A4B-cmf
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Motor de inferencia cortiq / formato CMF: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Dataset de evaluación mencionado: https://huggingface.co/datasets/hf-internal-testing/librispeech_asr_dummy
