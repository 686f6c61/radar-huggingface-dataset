# GhaythMahadin/Qwen3-ASR-1.7B-gguf

## Resumen

Qwen3-ASR-1.7B es un modelo de reconocimiento automatico del habla (ASR) desarrollado por el equipo Qwen de Alibaba, publicado originalmente en Hugging Face bajo el identificador `Qwen/Qwen3-ASR-1.7B`. Forma parte de la familia Qwen3-ASR junto con la variante de 0.6B y emplea una arquitectura audio-LLM: un codificador de audio bidireccional que alimenta un modelo de lenguaje causal Qwen3 con inyeccion de tokens de audio. El modelo resuelve transcripcion multilingue offline con deteccion automatica de idioma en 30 idiomas y 22 dialectos chinos.

La ficha que nos ocupa documenta la conversion a formato GGUF realizada por el usuario GhaythMahadin, pensada para su uso con el runtime `transcribe.cpp` (proyecto de handy-computer). Esta conversion cuantizada permite ejecutar el modelo en hardware de consumo, desde CPU con backend Vulkan hasta Apple Silicon con Metal, manteniendo una calidad de transcripcion muy cercana a la del modelo original en BF16. El modelo base cuenta con 2.038.078.608 parametros reales (segun safetensors) y un repositorio de 3,5 GB.

La relevancia actual de esta ficha radica en que ofrece una via practica de despliegue local de un ASR de ultima generacion, sin dependencia de APIs comerciales, con licencia Apache-2.0 y con cuantizaciones que reducen el peso hasta 1,23 GB (Q4_K_M) manteniendo un WER de 1,81 % en LibriSpeech test-clean, lo que lo situa en el rango de los mejores ASR open source actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM (codificador de audio bidireccional + LM causal Qwen3 con inyeccion de tokens de audio) |
| Parametros totales | 2.038.078.608 (2,04 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 30 idiomas y 22 dialectos chinos: zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, ro, hu, mk |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

Detalles arquitectonicos adicionales del codificador y del LM:

| Componente | Dimension |
|---|---|
| Encoder d_model | 1024 (16 cabezas) |
| LM hidden_size | 2048 |
| LM intermediate_size | 6144 |
| Entrada de audio | WAV mono a 16 kHz |

## Arquitectura y entrenamiento

El modelo sigue el patron de los modelos audio-LLM modernos: un codificador de audio bidireccional procesa la señal acustica y proyecta sus representaciones en el espacio de tokens del modelo de lenguaje causal Qwen3, que genera la transcripcion token a token. La variante de 1.7B comparte arquitectura con la de 0.6B pero con dimensiones mayores: `d_model=1024` con 16 cabezas en el codificador, `hidden_size=2048` e `intermediate_size=6144` en el LM. El modelo base se entreno sobre datos de habla a gran escala y hereda la capacidad de comprension de audio de Qwen3-Omni, segun indica la model card original.

La conversion GGUF documentada fue realizada por GhaythMahadin a partir del commit upstream `7278e1e70fe206f11671096ffdd38061171dd6e5` (fijado el 2026-04-19) y validada contra la referencia `qwen_asr 0.0.6` en el commit `3f61df7` de transcribe.cpp el 2026-04-20. No se dispone de informacion detallada sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. El modelo soporta inferencia offline y, segun la model card upstream, tambien streaming unificado con un unico modelo, aunque la conversion GGUF documentada indica explicitamente `streaming: false` y `translate: false`.

Una innovacion destacable del ecosistema es Qwen3-ForcedAligner-0.6B, un modelo complementario que predice timestamps para unidades arbitrarias en hasta 5 minutos de audio en 11 idiomas, con precision superior a los sistemas de alineamiento forzado end-to-end. No obstante, la conversion GGUF documentada indica `timestamps: none`, por lo que esta capacidad no esta disponible en esta version.

## Capacidades

- Transcripcion automatica del habla (speech-to-text) offline en 30 idiomas y 22 dialectos chinos.
- Deteccion automatica del idioma del audio (`lang_detect: true`), emitiendo la transcripcion en el idioma detectado.
- Reconocimiento robusto en entornos acusticos complejos y patrones de texto desafiantes, segun la model card upstream.
- Soporte de audio largo (la familia Qwen3-ASR soporta transcripcion de audio largo, aunque la conversion GGUF no detalla el limite exacto).
- Entrada de audio WAV mono a 16 kHz; no acepta pistas de idioma explicitas en esta conversion.
- NO soporta streaming en esta conversion (`streaming: false`).
- NO soporta traduccion (`translate: false`).
- NO genera timestamps en esta conversion (`timestamps: none`).
- No dispone de tool calling, function calling ni capacidades de agente: es un modelo puramente ASR.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo procesa audio WAV mono a 16 kHz y genera la transcripcion completa en el idioma detectado, adecuado para generar actas automaticas en entornos corporativos multilingues sin enviar audio a la nube.
- Subtitulado de video y podcasts: al soportar 30 idiomas con deteccion automatica, se puede integrar en pipelines de postproduccion para transcribir contenido en castellano, ingles, arabe, chino, etc., aunque sin timestamps nativos (habria que alinear externamente).
- Atencion al cliente y centros de contacto: transcripcion local de llamadas grabadas para analitica de calidad y mineria de conversaciones, cumpliendo requisitos de privacidad al no salir el audio del perimetro.
- Investigacion en linguistica y sociolinguistica: transcripcion de corpus orales multilingues con dialectos chinos (22 variantes) y acentos de distintos paises, util para estudios comparativos.
- Accesibilidad: generacion de transcripciones para personas con discapacidad auditiva en contenido audiovisual, ejecutable en hardware de consumo (Apple M4 o Ryzen 4750U con Vulkan).
- Despliegue en edge y dispositivos sin GPU dedicada: la cuantizacion Q4_K_M (1,23 GB) permite ejecutar el modelo en CPU con backend Vulkan a un RTF de 3,8 en un Ryzen 4750U, adecuado para dispositivos empotrados o portatiles modestos.
- Archivado y digitalizacion de audio historico: transcripcion por lotes de grabaciones en multiples idiomas con un unico modelo, simplificando la infraestructura frente a soluciones que requieren un modelo por idioma.

## Benchmarks y rendimiento

Resultados de WER en LibriSpeech test-clean (2620 enunciados en ingles, normalizador de texto estilo Whisper, jiwer 3.x, backend Metal en Apple M4), segun la model card de la conversion:

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 3,80 GB | 1,62 % |
| F16 | 3,81 GB | 1,62 % |
| Q8_0 | 2,04 GB | 1,61 % |
| Q6_K | 1,58 GB | 1,65 % |
| Q5_K_M | 1,41 GB | 1,65 % |
| Q4_K_M | 1,23 GB | 1,81 % |

Rendimiento (Real Time Factor, RTF) medido en la conversion:

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 39,5 |
| Apple M4 Max | CPU | 8 |
| Ryzen 4750U | Vulkan | 3,8 |
| Ryzen 4750U | CPU | 2 |

Nota: el WER de LibriSpeech caracteriza unicamente el caso ingles; el modelo es multilingue y no se han publicado en la informacion disponible resultados de benchmarks para el resto de idiomas. La model card upstream afirma que el 1.7B alcanza rendimiento state-of-the-art entre los ASR open source y es competitivo con las APIs comerciales mas fuertes, pero no se aportan cifras concretas de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion proporcionada.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: 1,23 GB (Q4_K_M), 1,41 GB (Q5_K_M), 1,58 GB (Q6_K), 2,04 GB (Q8_0), 3,80-3,81 GB (BF16/F16).
- Cabe en GPUs de consumo: cualquier GPU con al menos 2 GB de VRAM libre puede ejecutar Q4_K_M o Q5_K_M; Q8_0 requiere unos 2,5 GB; BF16/F16 requieren unos 4 GB.
- GPU recomendadas: no se especifican modelos concretos en la informacion; los datos de rendimiento se han medido en Apple M4 Max (Metal) y en CPU Ryzen 4750U (Vulkan/CPU). No hay datos para A100, H100 ni RTX 4090.
- Despliegue: exclusivamente mediante transcribe.cpp (libreria `transcribe.cpp`, binario `transcribe-cli`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 39,5 en Metal sobre M4 Max y 3,8 en Vulkan sobre Ryzen 4750U; en CPU pura, 8 (M4 Max) y 2 (Ryzen 4750U). El modelo 0.6B de la familia alcanza 2000x throughput con concurrencia 128, pero no se aportan cifras equivalentes para el 1.7B.
- Conversion de audio previa necesaria: `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER LibriSpeech test-clean | Licencia | Formato |
|---|---:|---|---:|---|---|
| Qwen3-ASR-1.7B (esta ficha) | 2,04 B | 30 + 22 dialectos | 1,62 % (BF16) / 1,81 % (Q4_K_M) | Apache-2.0 | GGUF |
| Qwen3-ASR-0.6B | ~0,6 B (no confirmado) | 30 + 22 dialectos | No disponible en la informacion | Apache-2.0 | No disponible |
| Qwen3-ForcedAligner-0.6B | ~0,6 B (no confirmado) | 11 | No aplica (alineamiento) | No disponible | No disponible |

La model card upstream menciona que la familia Qwen3-ASR es competitiva con APIs comerciales propietarias, pero no se aportan nombres ni cifras de modelos comparables concretos (Whisper, etc.) en la informacion proporcionada. No se dispone de datos de benchmarks de otros modelos ASR open source para una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- El modelo solo acepta audio WAV mono a 16 kHz; es necesario convertir previamente cualquier otro formato con ffmpeg.
- No soporta pistas de idioma explicitas en esta conversion: la deteccion es siempre automatica, lo que puede provocar errores en audios con cambios de idioma o codigo mezclado.
- No soporta streaming (`streaming: false`) ni traduccion (`translate: false`) en esta conversion GGUF.
- No genera timestamps (`timestamps: none`); para subtitulado con marcas temporales habria que usar Qwen3-ForcedAligner u otra herramienta externa.
- Riesgo de alucinacion y errores en audio con ruido, acentos muy marcados o vocabulario tecnico especializado; el WER de 1,62 % corresponde a LibriSpeech test-clean, un corpus limpio de lectura, no a condiciones reales.
- El WER publicado solo cubre ingles; no hay datos de calidad para castellano ni para el resto de los 30 idiomas en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base; conviene revisar la model card upstream para terminos completos.
- La conversion GGUF es de un tercero (GhaythMahadin) y no del equipo oficial Qwen; el soporte y las actualizaciones dependen del mantenedor.
- Sin datos de benchmarks en la informacion para tareas distintas de ASR (no aplica MMLU, HumanEval, GSM8K).
- El modelo base se publico en un commit fijado el 2026-04-19; posibles actualizaciones posteriores no estan reflejadas.

## Enlaces

- Repositorio Hugging Face de la conversion GGUF: https://huggingface.co/GhaythMahadin/Qwen3-ASR-1.7B-gguf
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Commit upstream fijado: https://huggingface.co/Qwen/Qwen3-ASR-1.7B/commit/7278e1e70fe206f11671096ffdd38061171dd6e5
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/3f61df7
- Pagina del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/qwen3-asr-1.7b.md
- Paper referenciado (arXiv:2601.21337): https://arxiv.org/abs/2601.21337
- Version BF16 del GGUF: https://huggingface.co/handy-computer/Qwen3-ASR-1.7B-gguf/resolve/main/Qwen3-ASR-1.7B-BF16.gguf
- Version Q8_0 del GGUF: https://huggingface.co/handy-computer/Qwen3-ASR-1.7B-gguf/resolve/main/Qwen3-ASR-1.7B-Q8_0.gguf
- Version Q4_K_M del GGUF: https://huggingface.co/handy-computer/Qwen3-ASR-1.7B-gguf/resolve/main/Qwen3-ASR-1.7B-Q4_K_M.gguf
