# kabcnd/Kenzan-Nemotron-3.5-Transcribe-30B-A4B-PinGrid3-GGUF

## Resumen

Kenzan-Nemotron-3.5-Transcribe-30B-A4B-PinGrid3 es una cuantización extrema del modelo de reconocimiento automático del habla (ASR) NVIDIA-Nemotron-3.5-Transcribe-30B-A4B, publicada por el usuario kabcnd bajo la filosofía de cuantización híbrida "Kenzan". El objetivo es hacer viable un Speech-LLM de 30.000 millones de parámetros (con 128 expertos enrutados y 23 capas Mamba2) en un Mac mini con 16 GB de memoria unificada, reduciendo el peso combinado de 16,04 GiB a 10,97 GiB mediante cuantización ternaria PTQ1_0 a 1,75 bpw en la mayoría de capas MoE.

El paquete se compone de dos GGUF: un decoder de 10,19 GiB (backbone denso en Q8_0/F32, colas de expertos ancladas en IQ4_NL y 18 capas de expertos plegadas a ternario con rotación Hadamard FWHT_128) y un encoder de 0,78 GiB en Q8_0 que conserva el FastConformer de 32 capas, el diarizador Sortformer de 31 capas y la cabeza CTC de timestamps a nivel de palabra. La propuesta es relevante porque demuestra que un modelo ASR de gran tamaño con diarización de hablantes puede ejecutarse a 7 veces tiempo real en hardware de consumo Apple Silicon.

El modelo es multilingüe (inglés y ruso verificados, con soporte declarado para 40 idiomas), incluye detección de hablantes y marcas de tiempo por palabra, y requiere un runtime específico (`nemo-speech`) con parches Metal propios, ya que llama.cpp y NeMo-Speech.cpp estándar no pueden cargar los pesos ternarios empaquetados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida MoE con 23 capas Mamba2, 7 bloques de atención GQA y 128 expertos enrutados; encoder FastConformer de 32 capas + diarizador Sortformer de 31 capas + cabeza CTC de timestamps |
| Parametros totales | 30B (modelo base; el repo declara 783.857.231 parámetros en safetensors, dato no coherente con el nombre del modelo) |
| Parametros activos | A4B (aproximadamente 4B activos, según nomenclatura del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PTQ1_0 ternario (1,75 bpw) con FWHT_128 y signos Rademacher, Q2_0 calibrado con imatrix, IQ4_NL (4,25 bpw), Q8_0 y F32/F16 en capas sensibles |
| Idiomas soportados | Multilingüe; inglés y ruso verificados en benchmarks; el autor declara 40 idiomas |
| Licencia | nvidia-open-model-license |
| Formato de pesos | GGUF (decoder + encoder separados) |

## Arquitectura y entrenamiento

El modelo base es un Speech-LLM híbrido: un encoder FastConformer de 32 capas procesa el audio, un diarizador Sortformer de 31 capas identifica hablantes y una cabeza CTC de 2 capas alinea timestamps por palabra. El decoder combina 23 capas Mamba2 (modelo de estado secuencial) con 7 bloques de atención GQA y una capa MoE de 128 expertos enrutados más 24 expertos compartidos, con una cabeza de decodificación especulativa NextN (MTP) en `blk.52`.

El trabajo de cuantización de kabcnd aplica una estrategia de "pin-grid": el backbone denso (embeddings, salida, proyecciones SSM, atención, expertos compartidos, routers y normas) se mantiene en Q8_0/F32 (2,26 GiB); las matrices `ffn_down_exps` se conservan en Q2_0 calibrado con imatrix (4,18 GiB); las tres capas de cola de mayor sensibilidad (`blk.47`, `blk.49`, `blk.51` de `ffn_up_exps`) se anclan en IQ4_NL; y 18 capas de expertos se pliegan a ternario PTQ1_0 con rotación Walsh-Hadamard por bloques de 128 y signos Rademacher explícitos, alcanzando densidades ternarias de 0,524–0,543 y SNR de 7,28–7,29 dB. No se dispone de información sobre los datos de entrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Transcripción de voz a texto multilingüe (inglés y ruso verificados; 40 idiomas declarados).
- Diarización de hablantes nativa mediante el diarizador Sortformer integrado en el encoder.
- Marcas de tiempo a nivel de palabra mediante la cabeza CTC de alineación.
- Puntuación y normalización de morfología y números en la salida (verificado en ruso).
- Manejo de code-switching dentro de una misma conversación (verificado con "Mac mini" en audio ruso).
- Decodificación especulativa MTP=3 con rollback nativo de Mamba2 (ReplaySSM) para acelerar la inferencia.
- Procesamiento por lotes de audio con caché KV en Q8_0 y mmap de copia cero.
- Salida estructurada en JSON con texto, timestamps y etiquetas de hablante.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo produce texto con puntuación, timestamps por palabra y etiquetas de hablante en una sola pasada, lo que permite generar actas estructuradas sin un pipeline de diarización separado.
- Subtitulado automático de vídeo: la salida JSON con marcas de tiempo por palabra se puede convertir directamente en ficheros SRT o VTT, y su velocidad de 7× tiempo real permite procesar horas de material en minutos en un Mac mini.
- Atención al cliente y análisis de llamadas: la diarización integrada permite separar agente y cliente en grabaciones telefónicas y alimentar sistemas de análisis de calidad o resumen posterior.
- Investigación lingüística y corpus multilingües: el soporte verificado de ruso con morfología y números exactos lo hace útil para transcribir corpus en lenguas eslavas, aunque la cobertura real de los 40 idiomas declarados no está documentada.
- Despliegue en entornos con recursos limitados: al caber en 16 GB de memoria unificada con solo ~540 MiB de RAM sucia, es adecuado para estaciones de trabajo Apple Silicon sin GPU dedicada, incluyendo entornos de desarrollo o periodismo de datos.
- Prototipado de asistentes de voz locales: la salida estructurada y la baja latencia (2,6 s para 18,36 s de audio en caliente) permiten integrarlo en aplicaciones de dictado o asistentes que requieran privacidad y procesamiento en el dispositivo.
- Generación de transcripciones para pipelines de datos de entrenamiento ASR: su velocidad y formato JSON facilitan la anotación masiva de audio con hablante y timestamps.

## Benchmarks y rendimiento

Resultados medidos por el autor en Mac mini M6 con 16 GB de memoria unificada, usando Metal, MTP=3 y caché KV Q8_0:

| Benchmark | Duración audio | Tiempo total | Aceleración vs tiempo real | Memoria sucia pico | Max RSS | Swaps | Precisión |
|---|---:|---:|---:|---:|---:|---:|---|
| Frases Harvard en inglés (`--diarize --word-times -f json`) | 18,36 s | 2,60 s | 7,06× | 536,2 MiB | 10,72 GiB | 0 | 100% exacto + timestamps + hablante |
| Inglés arranque en frío | 18,36 s | 5,54 s | 3,31× | 532,5 MiB | 10,59 GiB | 0 | 100% exacto con puntuación |
| Diálogo en ruso (`-l ru --diarize --word-times -f json`) | 29,41 s | 3,82 s | 7,70× | 543,4 MiB | 10,72 GiB | 0 | 100% exacto en morfología, números, code-switching y timestamps |

No se han publicado resultados de benchmarks comparativos con otros modelos ASR (WER sobre LibriSpeech, Common Voice u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el paquete combinado ocupa 10,97 GiB (10,19 GiB decoder + 0,78 GiB encoder); con la caché KV Q8_0 y el runtime, el Max RSS medido es de 10,72 GiB, por lo que se recomienda un mínimo de 16 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M6 verificado por el autor); el autor menciona optimización para Mac mini de 16 GB. No hay datos de rendimiento en GPU NVIDIA o AMD.
- Cabe en GPU de consumo: sí, en Apple Silicon con 16 GB; no hay información sobre GPUs de consumo discretas (RTX 4090, etc.).
- Opciones de despliegue: exclusivamente el runtime `nemo-speech-flint-metal-macos-arm64` incluido en el repo (`bin/nemo-speech-flint-metal-macos-arm64.tar.gz`). llama.cpp, Ollama, vLLM y TGI estándar no pueden cargar estos GGUF por los pesos ternarios empaquetados y los metadatos de rotación Hadamard.
- Latencia y throughput: 7,06× tiempo real en caliente y 3,31× en arranque en frío para inglés; 7,70× para ruso, con MTP=3 y Metal.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Despliegue en 16 GB |
|---|---|---|---|---|---|
| Kenzan-Nemotron-3.5-Transcribe-30B-A4B-PinGrid3 | 30B (A4B) | no disponible | multilingüe (en, ru verificados) | nvidia-open-model-license | Sí (Apple Silicon, runtime propio) |
| NVIDIA-Nemotron-3.5-Transcribe-30B-A4B (base) | 30B (A4B) | no disponible | multilingüe | nvidia-open-model-license | No en 16 GB (16+ GiB en F16) |
| Whisper large-v3 | 1,55B | 30 s de audio | multilingüe | MIT | Sí, en múltiples runtimes |
| Sortformer / diarizadores dedicados | variable | no disponible | no disponible | variable | Sí |

La comparativa con Whisper large-v3 es la más directa en cuanto a caso de uso (ASR multilingüe), pero no se dispone de datos de WER comparativos en la información proporcionada. La ventaja principal de esta cuantización frente al modelo base es la reducción de huella (de 16,04 GiB a 10,97 GiB) manteniendo diarización y timestamps integrados.

## Limitaciones y advertencias

- La licencia `nvidia-open-model-license` impone condiciones específicas de uso comercial; es necesario revisar el acuerdo de NVIDIA antes de desplegar en producción.
- El runtime necesario es un binario precompilado específico para macOS ARM64 con parches Metal propios; no hay soporte para llama.cpp, Ollama, vLLM ni GPUs NVIDIA/AMD, lo que limita el despliegue a Apple Silicon.
- Solo se han verificado inglés y ruso en los benchmarks; el soporte de los 40 idiomas declarados no está documentado y puede degradarse con la cuantización ternaria.
- La cuantización a 1,75 bpw en 18 capas de expertos introduce pérdida de precisión (SNR de 7,28–7,29 dB); el autor no publica WER comparativo frente al modelo base, por lo que el impacto real en calidad no está cuantificado.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados en el entrenamiento o solapamiento de hablantes; no hay datos sobre robustez en estos escenarios.
- El dato de parámetros en safetensors (783.857.231) no concuerda con el nombre del modelo (30B) ni con el tamaño del repo (11,8 GB), lo que sugiere un error de metadatos en el repo.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de los resultados reportados por el autor.
- El repositorio depende de enlaces externos (Ko-fi) y de un binario incluido; conviene verificar la integridad del runtime antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/kabcnd/Kenzan-Nemotron-3.5-Transcribe-30B-A4B-PinGrid3-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Apoyo al autor (Ko-fi): https://ko-fi.com/kabcpc
