# handy-computer/granite-4.0-1b-speech-gguf

## Resumen

Granite-4.0-1b-speech-gguf es la conversión a formato GGUF del modelo IBM Granite Speech 4.0-1b, publicada por el usuario handy-computer para su uso con el motor de inferencia transcribe.cpp. Se trata de un modelo de voz a texto (ASR) y traducción de voz (AST) de tipo audio-LLM: combina un codificador Conformer con atención Shaw de bloque local, un proyector Q-Former de BLIP-2 y el modelo de lenguaje Granite-4.0-1b-base como decodificador autorregresivo. El resultado es un sistema compacto de aproximadamente 2.313 millones de parámetros que transcribe audio de 16 kHz mono WAV a texto en seis idiomas.

La relevancia de esta ficha reside en que el repositorio empaqueta el modelo en cuantizaciones que van desde BF16 (4,63 GB) hasta Q4_K_M (1,60 GB), lo que permite ejecutar un modelo de reconocimiento de voz multilingüe en hardware de consumo, incluidas CPU y GPU integradas. El autor publica además métricas de WER verificadas contra la referencia de Transformers y contra el leaderboard Open ASR, con validación numérica reproducible.

El modelo base lo desarrolla IBM dentro de su familia Granite y se distribuye bajo licencia Apache-2.0, lo que facilita su integración en productos comerciales. Esta conversión concreta mantiene esa licencia y añade ficheros NOTICE que documentan la derivación respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM: codificador Conformer con atención Shaw de bloque local + proyector Q-Former (BLIP-2) + decodificador LLM Granite-4.0-1b-base |
| Parametros totales | 2.313.228.092 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés, francés, alemán, español, portugués, japonés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo es un audio-LLM que acopla tres componentes. El codificador de audio es un Conformer con atención Shaw de bloque local, encargado de extraer representaciones del audio de entrada. Un proyector Q-Former, inspirado en BLIP-2, alinea esas representaciones con el espacio de embeddings del modelo de lenguaje. El decodificador es Granite-4.0-1b-base, que genera el texto de forma autorregresiva. La entrada es audio WAV mono a 16 kHz y la salida es una transcripción o una traducción.

Según la model card original de IBM, el entrenamiento se realizó alineando modalidades: se partió de granite-4.0-1b-base y se adaptó a voz sobre corpus públicos de ASR y AST, complementados con datasets sintéticos para ASR en japonés, ASR con sesgo de palabras clave (keyword-biased) y traducción de voz. No se especifican en la información disponible el número total de tokens de audio ni la composición detallada del dataset, ni si se aplicaron fases de RLHF o DPO. La decodificación empleada en la evaluación es greedy.

La conversión a GGUF está anclada al commit bd87ab8 del modelo original (fijado el 2026-05-17) y validada contra la referencia de Transformers en el commit 275332d de transcribe.cpp. El autor documenta explícitamente el normalizador de texto usado (Whisper `EnglishTextNormalizer`), el mismo que emplea el leaderboard Open ASR, lo que facilita la comparación de métricas.

## Capacidades

- Transcripción de voz a texto (ASR) en inglés, francés, alemán, español, portugués y japonés.
- Traducción de voz bidireccional entre inglés y cada uno de los otros cinco idiomas (en ↔ fr, en ↔ de, en ↔ es, en ↔ pt, en ↔ ja), siempre pasando por inglés; no hay traducción directa entre pares no ingleses.
- Detección de idioma (`lang_detect: true` en los metadatos de transcribe.cpp).
- Traducción habilitada por defecto en el runtime (`translate: true`).
- Procesamiento offline: no requiere conexión a red ni servicios externos.
- Entrada de audio limitada a WAV mono de 16 kHz (conversión previa con ffmpeg si el origen es otro formato).
- Soporte de sesgo por palabras clave (keyword-biased ASR) según la model card original de IBM.
- Sin soporte de streaming (`streaming: false`).
- Sin marcas de tiempo en la salida (`timestamps: none`).
- Sin selección explícita de idioma en el runtime (`explicit_language_selection: false`).

## Casos de uso

- Transcripción de reuniones y notas de voz en local: el modelo procesa audio WAV de 16 kHz en un único paso y funciona sin conexión, lo que encaja en aplicaciones de escritorio centradas en privacidad como la que motiva este repositorio (Handy). La cuantización Q5_K_M de 1,83 GB permite mantenerlo residente en memoria en portátiles convencionales.
- Subtitulado multilingüe de contenido audiovisual: con soporte para seis idiomas y traducción vía inglés, se puede transcribir un vídeo en español y generar una versión en inglés (o al revés) en un mismo pipeline, usando la salida de ASR como entrada de la fase de traducción.
- Dictado por voz en herramientas de productividad: al ser un modelo pequeño y con latencia baja en GPU integrada (RTF de 24,62 en Metal sobre M4), es viable como motor de dictado en tiempo casi real para fragmentos cortos, integrándolo en editores de texto o IDEs.
- Archivado y búsqueda de grabaciones: transcripción por lotes de llamadas o entrevistas con el fin de indexar el texto resultante; el tamaño reducido del modelo permite ejecutar varias instancias en paralelo en una sola GPU o incluso en CPU.
- Accesibilidad para personas con discapacidad auditiva: generación de transcripciones en vivo de conversaciones presenciales o de material formativo, con la ventaja de que el procesamiento es totalmente local y no envía audio a terceros.
- Investigación en ASR multilingüe: el repositorio publica WER por idioma en FLEURS (en 4,66; de 7,29; es 5,91; fr 8,44; pt 9,6) y CER en japonés (6,44), lo que lo convierte en una línea base reproducible para experimentos de cuantización y comparación de motores de inferencia.
- Evaluación de pipelines de traducción de voz: al soportar AST bidireccional con inglés como pivote, sirve para prototipar sistemas de interpretación en entornos con recursos limitados, comparando la calidad de la traducción directa frente a la traducción en cascada.

## Benchmarks y rendimiento

Datos publicados en la model card de esta conversión GGUF. WER sobre LibriSpeech test-clean (2.620 enunciados, batch size 1, sin marcas de tiempo, decodificación greedy, normalizador `EnglishTextNormalizer`):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 4,63 GB | 1,42 % |
| F16 | 4,63 GB | 1,42 % |
| Q8_0 | 2,56 GB | 1,44 % |
| Q6_K | 2,02 GB | 1,41 % |
| Q5_K_M | 1,83 GB | 1,42 % |
| Q4_K_M | 1,60 GB | 1,48 % |

WER y CER por idioma en FLEURS con cuantización Q8_0:

| Idioma | Metrica | Valor |
|---|---|---:|
| Inglés | WER | 4,66 % |
| Alemán | WER | 7,29 % |
| Español | WER | 5,91 % |
| Francés | WER | 8,44 % |
| Portugués | WER | 9,60 % |
| Japonés | CER | 6,44 % |

Rendimiento en tiempo real (RTF, menor es mejor) medido por el autor:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 | CPU | 6,64 |
| Apple M4 | Metal | 24,62 |
| Apple M4 Max | CPU | 8,36 |
| Apple M4 Max | Metal | 75,48 |
| AMD Ryzen 7 4750U | CPU | 2,75 |
| AMD Ryzen 7 4750U | Vulkan | 4,63 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos de ASR en MMLU, HumanEval o GSM8K, que no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7-2,0 GB con Q4_K_M (1,60 GB de pesos más overhead del runtime); alrededor de 2,7-3,1 GB con Q8_0 (2,56 GB de pesos); en torno a 4,8-5,2 GB con BF16/F16 (4,63 GB de pesos).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; para BF16 se recomienda un mínimo de 6 GB. Funciona en GPUs integradas Apple Silicon mediante Metal (validado en M4 y M4 Max) y en GPUs AMD mediante Vulkan (validado en Ryzen 7 4750U).
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, RX 6600, etc.). Con Q4_K_M también es viable en equipos sin GPU dedicada.
- Opciones de despliegue: el runtime oficial es transcribe.cpp (compilación con CMake y binario `transcribe-cli`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible, dado que el formato GGUF está adaptado al esquema específico de transcribe.cpp.
- Latencia y throughput: el RTF medido es superior a 1 en todas las plataformas, lo que indica que el procesamiento es más rápido que el tiempo real. En el M4 Max con Metal el RTF alcanza 75,48, es decir, procesa audio aproximadamente 75 veces más rápido que su duración. En CPU sobre Ryzen 7 4750U el RTF es de 2,75, suficiente para transcripción por lotes pero no para dictado en vivo con fragmentos muy cortos.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| Granite-4.0-1b-speech (esta conversion GGUF) | 2.313 M | en, fr, de, es, pt, ja | Apache-2.0 | GGUF para transcribe.cpp | ASR y AST bidireccional via ingles; WER LibriSpeech test-clean 1,42 % en BF16 |
| Granite-speech-3.3-2b | no disponible en la informacion | no disponible | no disponible | no disponible | Version anterior de la familia; el modelo 4.0-1b anade soporte multilingue y mejoras segun la model card original |
| Granite-speech-3.3-8b | no disponible en la informacion | no disponible | no disponible | no disponible | Version de mayor tamano de la generacion anterior; sin datos de rendimiento en la informacion disponible |
| Whisper (variantes de OpenAI) | no disponible | multilingue | MIT | safetensors, GGUF, etc. | Referencia habitual en ASR; el autor usa su normalizador de texto para las metricas, pero no se aportan comparaciones numericas directas |

No se dispone en la información proporcionada de datos de benchmarks comparativos con otros modelos de ASR, por lo que la comparativa se limita a características estructurales.

## Limitaciones y advertencias

- La entrada debe ser audio WAV mono a 16 kHz; otros formatos o frecuencias requieren conversión previa con ffmpeg u otra herramienta.
- No soporta streaming: el modelo procesa el audio completo en una sola pasada, lo que limita su uso en transcripción en vivo de baja latencia con fragmentos largos.
- No genera marcas de tiempo, lo que dificulta la alineación con el audio para subtitulado preciso.
- La traducción de voz siempre pasa por el inglés; no hay traducción directa entre pares como francés ↔ alemán. Esto puede introducir pérdida de matices en la cadena de traducción.
- No hay selección explícita de idioma en el runtime; la detección es automática, lo que puede provocar errores en audio con cambio de idioma o ruido.
- El WER en portugués (9,60 %) y francés (8,44 %) es notablemente superior al de inglés (4,66 %), por lo que la calidad no es homogénea entre idiomas.
- La cuantización Q4_K_M eleva el WER de LibriSpeech test-clean de 1,42 % a 1,48 %, una degradación pequeña pero medible; para producción con requisitos estrictos se recomienda Q6_K o superior.
- Riesgo de alucinación inherente a los modelos de lenguaje que actúan como decodificador: en audio con ruido o silencios prolongados puede generar texto no presente en la señal.
- Sesgos: no se documentan en la información disponible análisis específicos de sesgo por acento, género o variedad dialectal; los corpus de entrenamiento son públicos y su composición no está detallada.
- Licencia Apache-2.0, que permite uso comercial, pero se debe conservar el fichero NOTICE y la atribución correspondiente al modelo original de IBM.
- El repositorio ocupa 99,1 GB en total, aunque cada fichero individual de cuantización es mucho menor; conviene descargar solo la variante necesaria.
- El modelo está anclado a commits concretos del modelo base y del runtime; actualizaciones posteriores de transcribe.cpp podrían requerir reconversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/handy-computer/granite-4.0-1b-speech-gguf
- Modelo base en Hugging Face: https://huggingface.co/ibm-granite/granite-4.0-1b-speech
- Commit del modelo base usado en la conversión: https://huggingface.co/ibm-granite/granite-4.0-1b-speech/commit/bd87ab8
- Repositorio de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/275332d
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/granite-4.0-1b-speech.md
- Modelo Granite-4.0-1b-base: https://huggingface.co/ibm-granite/granite-4.0-1b-base
- Modelo Granite-speech-3.3-2b: https://huggingface.co/ibm-granite/granite-speech-3.3-2b
- Modelo Granite-speech-3.3-8b: https://huggingface.co/ibm-granite/granite-speech-3.3-8b
- Aplicación Handy (sitio oficial): https://handy.computer/
- Descarga de Handy: https://handy.computer/download.html
- Repositorio de Handy en GitHub: https://github.com/cjpais/handy
- Paper referenciado arXiv:2505.08699: https://arxiv.org/abs/2505.08699
- Paper referenciado arXiv:2603.11243: https://arxiv.org/abs/2603.11243
