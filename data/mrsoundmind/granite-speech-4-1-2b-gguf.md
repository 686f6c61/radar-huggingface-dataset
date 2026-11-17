# mrsoundmind/granite-speech-4.1-2b-gguf

## Resumen

Granite Speech 4.1 2B es un modelo de lenguaje-audio (audio-LLM) desarrollado por IBM para reconocimiento automatico del habla (ASR) multilingue y traduccion automatica del habla (AST) bidireccional. Esta ficha cubre la conversion GGUF publicada por mrsoundmind para su uso con transcribe.cpp, una implementacion en C/C++ orientada a inferencia local y offline. El modelo base es `ibm-granite/granite-speech-4.1-2b`, con 2.313.228.092 parametros reales segun los safetensors originales.

La arquitectura combina un encoder Conformer con atencion Shaw de bloque local, un proyector BLIP-2 Q-Former y un decodificador autorregresivo Granite-4.0-1b-base. Soporta transcripcion en ingles, frances, aleman, espanol, portugues y japones, y traduccion entre ingles y cada uno de esos cinco idiomas (siempre via ingles). Frente a su predecesor granite-4.0-1b-speech, incorpora puntuacion y truecasing en todos los idiomas, un encoder CTC de doble cabeza (salidas grafemicas y BPE) con muestreo de importancia de frames, y mejor sesgo por listas de palabras clave.

La relevancia de esta publicacion GGUF reside en que permite ejecutar el modelo sin GPU dedicada y sin dependencias de Python, con cuantizaciones desde BF16 (4,63 GB) hasta Q4_K_M (1,60 GB) y una degradacion de WER minima en LibriSpeech test-clean (1,31 % en BF16 frente a 1,37 % en Q4_K_M). Es una opcion practica para transcripcion offline multilingue en portatiles y sistemas embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM: encoder Conformer (atencion Shaw de bloque local) + proyector BLIP-2 Q-Former + decodificador autorregresivo Granite-4.0-1b-base |
| Parametros totales | 2.313.228.092 (2,31 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, de, es, pt, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transcribe.cpp); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo sigue el esquema clasico de audio-LLM en tres etapas: un encoder Conformer que procesa la senal de audio con atencion Shaw de bloque local, un proyector Q-Former de tipo BLIP-2 que alinea las representaciones acusticas con el espacio del decodificador, y un LLM autorregresivo basado en un checkpoint intermedio de `granite-4.0-1b-base`. El entrenamiento consistio en alinear modalidades sobre 174.000 horas de audio procedentes de corpus publicos para ASR y AST, complementados con datasets sinteticos especificos para ASR en japones, sesgo por palabras clave y traduccion del habla.

La innovacion tecnica principal del 4.1 frente al 4.0 es un encoder CTC de doble cabeza con salidas grafemicas y BPE, junto con muestreo de importancia de frames para concentrar el computo en las partes informativas del audio. Ademas, la puntuacion y el truecasing (incluida la capitalizacion de sustantivos en aleman) se activan mediante un cambio de prompt, y el sesgo por listas de palabras clave mejora el reconocimiento de nombres, acronimos y jerga tecnica. La model card no detalla si se aplicaron etapas de RLHF o DPO; ese dato no esta disponible.

## Capacidades

- Transcripcion de voz a texto multilingue en ingles, frances, aleman, espanol, portugues y japones.
- Traduccion automatica del habla bidireccional entre ingles y cada uno de los otros cinco idiomas (en ↔ fr, en ↔ de, en ↔ es, en ↔ pt, en ↔ ja), siempre via ingles; no hay traduccion directa fr↔de ni combinaciones equivalentes.
- Puntuacion y truecasing en ASR y AST para todos los idiomas, incluida la capitalizacion de sustantivos en aleman, activables mediante prompt.
- Sesgo por listas de palabras clave para mejorar el reconocimiento de nombres propios, acronimos y terminologia tecnica.
- Entrada de audio en WAV mono a 16 kHz.
- Capacidad de traduccion confirmada en metadatos de transcribe.cpp (`translate: true`).
- No soporta streaming (`streaming: false`), no realiza deteccion de idioma (`lang_detect: false`) ni genera marcas de tiempo (`timestamps: none`).
- Las variantes `granite-speech-4.1-2b-plus` (ASR con atribucion de hablante y marcas de tiempo a nivel de palabra) y `granite-speech-4.1-2b-nar` existen como modelos separados, no incluidos en esta conversion.

## Casos de uso

- Transcripcion offline de reuniones y entrevistas: el modelo procesa ficheros WAV de 16 kHz mono de forma local, sin conexion ni servicios en la nube, adecuado para entornos con requisitos de confidencialidad o sin conectividad.
- Subtitulado multilingue de contenido audiovisual: combinando ASR y AST via ingles, permite generar subtitulos en espanol de audio en portugues o aleman, por ejemplo, con puntuacion y mayusculas correctas.
- Sesgo de vocabulario en dominios especializados: mediante listas de palabras clave se puede mejorar la transcripcion de nombres de productos, acronimos medicos o jerga legal, reduciendo errores en terminos fuera del vocabulario comun.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (1,60 GB) y Q5_K_M (1,83 GB) permiten ejecutar el modelo en portatiles sin GPU dedicada, con RTF de 4 en CPU sobre Apple M4 y 1,4 en Ryzen 4750U.
- Aceleracion por GPU integrada o discreta: con backend Metal alcanza RTF de 12 en M4 y 33 en M4 Max; con Vulkan, RTF de 2,8 en Ryzen 4750U, lo que habilita transcripcion casi en tiempo real en equipos modestos.
- Pipeline de accesibilidad para personas con discapacidad auditiva: transcripcion local de conversaciones presenciales o grabaciones, con soporte de seis idiomas y sin envio de audio a terceros.
- Archivado y indexacion de audio historico: procesamiento por lotes de grabaciones en varios idiomas con un binario unico y cuantizacion Q8_0 (2,56 GB), manteniendo un WER de 1,32 % en LibriSpeech test-clean.

## Benchmarks y rendimiento

Resultados de WER en LibriSpeech test-clean (2620 utterances, decodificacion greedy, normalizador `EnglishTextNormalizer` de Whisper):

| Cuantizacion | Tamano | WER (%) |
|---|---:|---:|
| BF16 | 4,63 GB | 1,31 |
| F16 | 4,63 GB | 1,32 |
| Q8_0 | 2,56 GB | 1,32 |
| Q6_K | 2,02 GB | 1,29 |
| Q5_K_M | 1,83 GB | 1,33 |
| Q4_K_M | 1,60 GB | 1,37 |

El BF16 local (1,31 %) queda 0,02 puntos por debajo del 1,33 % publicado por IBM, diferencia atribuida por el autor a normalizacion y dentro del intervalo de confianza bootstrap.

Rendimiento en factor de tiempo real (RTF):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 33 |
| Apple M4 Max | CPU | 5,8 |
| Apple M4 | Metal | 12 |
| Apple M4 | CPU | 4 |
| Ryzen 4750U | Vulkan | 2,8 |
| Ryzen 4750U | CPU | 1,4 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de AST en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: Q4_K_M ~1,60 GB, Q5_K_M ~1,83 GB, Q6_K ~2,02 GB, Q8_0 ~2,56 GB, BF16/F16 ~4,63 GB, mas overhead del runtime.
- GPU recomendadas: cualquier GPU con backend Metal (Apple Silicon M1 en adelante) o Vulkan (integradas AMD, Intel y discretas); no se documentan requisitos especificos para A100 o H100.
- Cabe en GPU de consumo: si, incluso en equipos sin GPU dedicada gracias al backend CPU; Q4_K_M es la opcion mas ligera para portatiles.
- Opciones de despliegue: transcribe.cpp (compilacion desde fuente con CMake; binario `transcribe-cli`). La libreria nativa es transcribe.cpp; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: RTF 12 en M4 con Metal (unas 12 horas de audio por hora de computo), RTF 33 en M4 Max con Metal, RTF 2,8 en Ryzen 4750U con Vulkan y RTF 1,4 en CPU Ryzen 4750U.
- Requiere audio de entrada WAV mono a 16 kHz; conversion previa con ffmpeg (`-ar 16000 -ac 1`).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Traduccion | Licencia | Formato / despliegue |
|---|---|---|---:|---|---|
| granite-speech-4.1-2b (esta conversion) | 2,31 mil millones | en, fr, de, es, pt, ja | si (via en) | Apache-2.0 | GGUF / transcribe.cpp |
| granite-speech-4.1-2b-plus | no disponible | no disponible | no disponible | Apache-2.0 | safetensors / Transformers |
| granite-speech-4.1-2b-nar | no disponible | no disponible | no disponible | Apache-2.0 | safetensors / Transformers |
| granite-4.0-1b-speech (predecesor) | ~1 mil millones (base LLM) | no disponible | no disponible | Apache-2.0 | safetensors / Transformers |

La informacion disponible no incluye datos de rendimiento de los modelos alternativos, por lo que la comparativa se limita a parametros, capacidades declaradas y licencia. No se dispone de comparaciones con Whisper, Parakeet u otros sistemas ASR en la informacion proporcionada.

## Limitaciones y advertencias

- No soporta streaming: solo procesa ficheros completos, lo que limita su uso en transcripcion en vivo.
- No realiza deteccion automatica de idioma: el idioma debe seleccionarse o indicarse explicitamente.
- No genera marcas de tiempo; para timestamps a nivel de palabra o atribucion de hablante hay que recurrir a la variante `granite-speech-4.1-2b-plus`.
- Traduccion limitada a pares via ingles: no hay traduccion directa entre idiomas no ingleses (por ejemplo, fr↔de).
- Riesgo de alucinacion en audio ruidoso, solapamiento de hablantes o segmentos musicales; no se documentan tasas de alucinacion en la informacion disponible.
- Sesgos conocidos: no se documentan sesgos especificos en la model card; al entrenarse sobre corpus publicos, puede heredar sesgos acusticos y dialectales de dichos datos.
- Licencia Apache-2.0 heredada del modelo base, permisiva para uso comercial; conviene revisar la model card upstream para terminos completos.
- La conversion GGUF ha sido validada contra la referencia de Transformers en el commit 275332d de transcribe.cpp, pero no se documentan garantias de equivalencia numerica en todas las cuantizaciones.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion comunitaria es practicamente inexistente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mrsoundmind/granite-speech-4.1-2b-gguf
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-4.1-2b
- Commit upstream usado: https://huggingface.co/ibm-granite/granite-speech-4.1-2b/commit/8f4bb5f
- Variante plus: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-plus
- Variante nar: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-nar
- LLM base: https://huggingface.co/ibm-granite/granite-4.0-1b-base
- Predecesor: https://huggingface.co/ibm-granite/granite-4.0-1b-speech
- Repositorio transcribe.cpp: https://github.com/mrsoundmind/transcribe.cpp
- Paper referenciado (arXiv 2310.02943): https://arxiv.org/abs/2310.02943
- Paper referenciado (arXiv 2505.08699): https://arxiv.org/abs/2505.08699
