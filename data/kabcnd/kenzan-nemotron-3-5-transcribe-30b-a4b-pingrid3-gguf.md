# kabcnd/Kenzan-Nemotron-3.5-Transcribe-30B-A4B-PinGrid3-GGUF

## Resumen

Kenzan-Nemotron-3.5-Transcribe-30B-A4B-PinGrid3-GGUF es una cuantización extrema del modelo de reconocimiento automático del habla (ASR) NVIDIA Nemotron-3.5-Transcribe-30B-A4B, publicada por el usuario kabcnd bajo el paraguas del proyecto Kenzan. El modelo base es un Speech-LLM de NVIDIA con arquitectura híbrida Nemotron-H MoE que combina un encoder FastConformer con un decodificador que alterna capas Mamba2 y atención GQA, e incorpora cabeceras específicas para diarización de hablantes (Sortformer) y marcas de tiempo a nivel de palabra (CTC).

La aportación de esta ficha no es un modelo nuevo, sino una compresión agresiva orientada a ejecución local en Apple Silicon con 16 GB de memoria unificada. Mediante cuantización ternaria `PTQ1_0` (1,75 bpw) estabilizada con rotación Fast Walsh-Hadamard de bloque 128 y signos de Rademacher, junto con una estrategia de "pin-grid" que preserva a mayor precisión la columna vertebral densa y las capas expertas más sensibles, el autor reduce el peso combinado de 16,04 GiB a 10,97 GiB.

El resultado, según la model card, permite transcripción multilingüe con diarización y timestamps a velocidades de hasta 7× tiempo real en un Mac mini con chip M6 y 16 GB de memoria unificada, con un consumo de RAM sucia en torno a 540 MiB. La relevancia actual radica en la posibilidad de ejecutar un modelo de 30B parámetros (4B activos) de ASR de calidad en hardware de consumo, aunque a costa de requerir un runtime parcheado no estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Nemotron-H MoE: encoder FastConformer (32 capas) + decodificador con 23 capas Mamba2 y 7 bloques de atención GQA, 128 expertos enrutados, cabecera Sortformer de diarización (31 capas) y cabecera CTC de timestamps (2 capas) |
| Parámetros totales | 783.857.231 (dato real de safetensors del repo; la nomenclatura del nombre indica 30B-A4B, discrepancia no aclarada en la información disponible) |
| Parámetros activos | 4B (según nomenclatura A4B del nombre; no verificado en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | `PTQ1_0` ternario (1,75 bpw) con FWHT_128 + signos Rademacher; `Q2_0`; `IQ4_NL` (4,25 bpw); `Q8_0`; `F32`/`F16` en capas sensibles |
| Idiomas soportados | Multilingüe (40 idiomas según la model card), con `en` y `ru` verificados en benchmarks |
| Licencia | NVIDIA Open Model License (heredada del modelo base) |
| Formato de pesos | GGUF (decoder principal + encoder separado en Q8_0) |

## Arquitectura y entrenamiento

El modelo base es un Speech-LLM híbrido de NVIDIA. El encoder es un FastConformer de 32 capas que convierte audio en representaciones latentes; sobre él se montan dos cabeceras auxiliares: una Sortformer de 31 capas para diarización de hablantes y una CTC de 2 capas para alineación temporal a nivel de palabra. El decodificador combina 23 capas Mamba2 (modelo de espacio de estados) con 7 bloques de atención GQA y una capa MoE de 128 expertos enrutados más 24 expertos compartidos, lo que da lugar a la denominación A4B (aproximadamente 4B parámetros activos por token).

La cuantización Kenzan no reentrena el modelo: aplica compresión post-entrenamiento con una filosofía de "pin-grid". La columna vertebral densa (embeddings, salida, proyecciones SSM, bloques de atención, expertos compartidos, routers y normas) se mantiene en `Q8_0`/`F32` (2,262 GiB). Las matrices `ffn_down_exps` se conservan en `Q2_0` calibrado con imatrix (4,182 GiB), con la capa 52 en `IQ4_NL`. Las tres capas de cola identificadas como más sensibles por perfilado imatrix (`blk.47`, `blk.49`, `blk.51`) se anclan en `IQ4_NL`. Las 18 capas restantes de `ffn_up_exps` se comprimen a ternario `PTQ1_0` con rotación Hadamard de bloque 128, alcanzando densidades ternarias de 0,524–0,543 y SNR de 7,28–7,29 dB. Adicionalmente se incorpora decodificación especulativa MTP con `blk.52` como cabeza borrador y rollback nativo sobre Mamba2 (ReplaySSM).

No se dispone de información sobre el dataset de entrenamiento original, número de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe, con 40 idiomas según la model card y verificación explícita en inglés y ruso.
- Diarización de hablantes nativa mediante cabecera Sortformer, con identificación de interlocutores en la salida.
- Marcas de tiempo a nivel de palabra mediante cabecera CTC (`--word-times`).
- Salida estructurada en JSON con texto, timestamps y etiquetas de hablante.
- Manejo de cambios de código lingüístico (code-switching), verificado en el benchmark ruso con inserción de "Mac mini" en texto en ruso.
- Puntuación y normalización morfológica en la salida (verificado en ruso: morfología, números y puntuación exactos).
- Decodificación especulativa MTP=3 integrada en el runtime para acelerar la inferencia.
- No se documentan capacidades de tool calling, agentes, visión ni audio generativo; es un modelo especializado exclusivamente en transcripción.

## Casos de uso

- Transcripción de reuniones y actas con diarización: el modelo etiqueta cada intervención con el hablante y genera timestamps por palabra, lo que permite construir actas automáticas con atribución correcta de turnos sin post-procesado externo.
- Subtitulado automático de vídeo y audio: la salida JSON con marcas de tiempo a nivel de palabra encaja directamente en formatos de subtítulos (SRT, VTT) y facilita el alineado con pistas de vídeo.
- Asistentes de voz en local para privacidad: al ejecutarse íntegramente en un Mac mini de 16 GB sin conexión, es adecuado para entornos donde el audio no puede salir del dispositivo (sanidad, legal, despachos profesionales).
- Transcripción multilingüe de contenido en inglés y ruso: los benchmarks verifican morfología y números exactos en ruso, lo que lo hace útil para medios, investigación y archivos con material en ambos idiomas.
- Investigación en ASR y cuantización extrema: sirve como banco de pruebas para estudiar el impacto de la compresión ternaria con rotación Hadamard en modelos Speech-LLM híbridos Mamba2/MoE.
- Prototipado de pipelines de voz en Apple Silicon: equipos que desarrollan en Mac pueden validar flujos de transcripción con diarización antes de desplegar en servidores con GPU, gracias a la velocidad de 7× tiempo real.
- Accesibilidad: generación de transcripciones con identificación de hablante para personas con discapacidad auditiva en contextos de reunión o clase, ejecutándose en hardware de bajo coste.

## Benchmarks y rendimiento

Datos medidos por el autor en Mac mini con Apple M6 y 16 GB de memoria unificada, con `--device metal`, decodificación especulativa MTP=3, caché KV en `Q8_0` y mmap de copia cero:

| Benchmark | Duración audio | Tiempo total | Aceleración | RAM sucia pico | Max RSS | Swaps | Precisión |
|---|---:|---:|---:|---:|---:|---:|---|
| Harvard Sentences EN (`--diarize --word-times -f json`) | 18,36 s | 2,60 s | 7,06× | 536,2 MiB | 10,72 GiB | 0 | 100% texto exacto + timestamps + hablante |
| Cold start EN (`transcribe --device metal`) | 18,36 s | 5,54 s | 3,31× | 532,5 MiB | 10,59 GiB | 0 | 100% texto y puntuación exactos |
| Diálogo RU (`-l ru --diarize --word-times -f json`) | 29,41 s | 3,82 s | 7,70× | 543,4 MiB | 10,72 GiB | 0 | 100% morfología, números, code-switching, puntuación y timestamps |

No se han publicado resultados de benchmarks estándar de ASR (WER sobre LibriSpeech, Common Voice, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 10,97 GiB combinados (10,19 GiB decodificador + 0,78 GiB encoder), con Max RSS medido de ~10,7 GiB y RAM sucia de ~540 MiB durante inferencia.
- Hardware objetivo: Apple Silicon con 16 GB de memoria unificada (Mac mini M6 verificado). No hay datos de funcionamiento en GPU NVIDIA, AMD ni CPU x86.
- GPU de consumo: no se documenta compatibilidad con RTX 4090, A100, H100 ni otras GPU discretas; el runtime incluido es exclusivamente `macos-arm64`.
- Despliegue: requiere el bundle `nemo-speech-flint-metal-macos-arm64.tar.gz` incluido en el repo, con parches Metal propios (`GGML_METAL_PTQ1_MULTICOL=1`, `GGML_METAL_Q1_0_POPCNT=1`). No es compatible con `llama.cpp` upstream, Ollama, vLLM ni TGI en su forma actual.
- Dependencias: `sentencepiece` y `abseil` vía Homebrew.
- Latencia y throughput: 7,06× tiempo real en caliente y 3,31× en arranque en frío para inglés; 7,70× para ruso, sobre audio de 18–29 segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Kenzan-Nemotron-3.5-Transcribe-30B-A4B-PinGrid3 | 30B-A4B (nomenclatura; 783,9M en safetensors) | No disponible | 40 (en, ru verificados) | NVIDIA Open Model License | GGUF + runtime Metal parcheado |
| NVIDIA Nemotron-3.5-Transcribe-30B-A4B (base) | 30B-A4B | No disponible | 40 | NVIDIA Open Model License | Pesos originales NeMo |
| Whisper large-v3 (referencia ASR) | ~1,55B | 30 s de audio por ventana | ~99 | MIT | GGUF, CTranslate2, transformers |
| Parakeet / Canary de NVIDIA | No disponible en esta información | No disponible | No disponible | NVIDIA Open Model License | NeMo |

La comparación con Whisper large-v3 se incluye como referencia de categoría (ASR multilingüe con timestamps); no se dispone de datos de WER comparativos en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de calidad. La ventaja diferencial de esta ficha es la compresión a 10,97 GiB con diarización integrada, frente a la huella mayor de los pesos originales.

## Limitaciones y advertencias

- Requiere un runtime parcheado no estándar: `llama.cpp` upstream, Ollama, vLLM y TGI no pueden cargar estos GGUF por el formato ternario empaquetado y los metadatos de rotación Hadamard. La portabilidad es nula fuera del bundle proporcionado.
- Solo se distribuye binario para `macos-arm64`; no hay builds para Linux, Windows ni GPU discretas.
- La licencia NVIDIA Open Model License impone condiciones específicas para uso comercial; es necesario revisar el texto completo antes de desplegar en producción.
- Discrepancia entre el nombre (30B-A4B) y el recuento real de safetensors (783,9M parámetros): conviene verificar la arquitectura y el tamaño efectivo antes de asumir capacidades de un modelo de 30B.
- Idiomas verificados únicamente inglés y ruso; el resto de los 40 idiomas declarados no cuenta con benchmarks publicados en esta información.
- La cuantización ternaria a 1,75 bpw puede degradar la precisión en audio con ruido, acentos no vistos o dominios especializados; los benchmarks presentados usan frases Harvard y un diálogo corto, no corpus diversos.
- No hay datos de WER sobre corpus estándar, por lo que la calidad real frente a Whisper o al modelo base no está cuantificada.
- Riesgo de alucinación en segmentos de silencio o audio ininteligible, inherente a los modelos generativos de ASR; no se documenta mitigación específica.
- El modelo está optimizado para audio de decenas de segundos; no se especifica el comportamiento en grabaciones largas ni la gestión de contexto.
- Sesgos: no se documentan análisis de sesgo por acento, género o idioma en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/kabcnd/Kenzan-Nemotron-3.5-Transcribe-30B-A4B-PinGrid3-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Apoyo al autor (Ko-fi): https://ko-fi.com/kabcpc
