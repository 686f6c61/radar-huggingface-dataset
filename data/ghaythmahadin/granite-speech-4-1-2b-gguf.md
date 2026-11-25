# GhaythMahadin/granite-speech-4.1-2b-gguf

## Resumen

Granite Speech 4.1 2B es un modelo de voz a texto (ASR) y traducción de voz (AST) desarrollado por IBM dentro de la familia Granite. Se trata de un audio-LLM que combina un codificador Conformer, un proyector Q-Former de tipo BLIP-2 y un decodificador autorregresivo basado en Granite-4.0-1b-base. La ficha que nos ocupa es la conversión a GGUF realizada por GhaythMahadin para su uso con transcribe.cpp, una implementación en C++ orientada a inferencia local y offline.

El modelo resuelve dos tareas: transcripción multilingüe en inglés, francés, alemán, español, portugués y japonés, y traducción bidireccional entre inglés y cada uno de esos cinco idiomas (siempre pasando por inglés, sin pares directos como francés-alemán). Frente a su predecesor granite-4.0-1b-speech mantiene el mismo número de parámetros (2.313.228.092), pero incorpora mejoras en puntuación, uso de mayúsculas, sesgo por listas de palabras clave y precisión multilingüe.

La relevancia de esta conversión concreta reside en el despliegue: los pesos GGUF permiten ejecutar el modelo en CPU, Metal o Vulkan sin dependencias de Python, con cuantizaciones desde BF16 hasta Q4_K_M y una degradación de WER mínima (de 1,31 % a 1,37 % en LibriSpeech test-clean). El modelo base está publicado bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM: codificador Conformer con block-local Shaw attention, proyector BLIP-2 Q-Former y decodificador autorregresivo Granite-4.0-1b-base |
| Parametros totales | 2.313.228.092 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, de, es, pt, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema de granite-4.0-1b-speech: un codificador Conformer con atención Shaw de bloque local procesa el audio, un proyector Q-Former de tipo BLIP-2 alinea las representaciones acústicas con el espacio del LLM y un decodificador autorregresivo Granite-4.0-1b-base genera el texto. La entrada es audio WAV mono a 16 kHz y la salida es una transcripción o una traducción, según el prompt.

El entrenamiento se realizó sobre 174.000 horas de audio procedente de corpus públicos para ASR y AST, complementadas con datasets sintéticos para ASR en japonés, ASR con sesgo por palabras clave y traducción de voz. El modelo se obtuvo alineando modalidades sobre un checkpoint intermedio de granite-4.0-1b-base. Entre las innovaciones técnicas destacan un codificador CTC de doble cabeza (salidas grafémicas y BPE) con muestreo de importancia por fotograma para centrarse en las partes informativas del audio, soporte de puntuación y truecasing en todos los idiomas (incluida la capitalización de sustantivos en alemán) mediante un cambio simple de prompt, y una mejora del sesgo por listas de palabras clave para nombres, acrónimos y jerga técnica.

La conversión GGUF se realizó desde el commit 8f4bb5f del modelo base (fijado el 2026-05-17) y se validó contra la referencia de Transformers en el commit 275332d de transcribe.cpp.

## Capacidades

- Transcripción de voz multilingüe en inglés, francés, alemán, español, portugués y japonés.
- Traducción de voz bidireccional entre inglés y cada uno de los otros cinco idiomas (en ↔ fr, en ↔ de, en ↔ es, en ↔ pt, en ↔ ja), siempre a través del inglés.
- Puntuación y truecasing en ASR y AST para todos los idiomas soportados, incluida la capitalización de sustantivos en alemán, activable mediante prompt.
- Sesgo por listas de palabras clave para mejorar el reconocimiento de nombres propios, acrónimos y terminología técnica.
- Procesamiento offline sin dependencias de red ni de Python, gracias a la implementación en C++ de transcribe.cpp.
- No soporta streaming (streaming: false según los metadatos de la model card).
- No realiza detección automática de idioma (lang_detect: false).
- No genera marcas de tiempo (timestamps: none).
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible; el modelo está especializado en ASR y AST.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo convierte grabaciones WAV mono a 16 kHz en transcripciones con puntuación y mayúsculas correctas, lo que reduce el post-procesado manual en actas y notas.
- Subtitulado de contenido audiovisual multilingüe: para vídeos en inglés, francés, alemán, español, portugués o japonés, el modelo genera el texto base y, mediante el prompt de traducción, produce la versión en inglés o desde el inglés al resto de idiomas.
- Atención al cliente con transcripción local: al ejecutarse offline con transcribe.cpp, permite transcribir llamadas grabadas sin enviar audio a servicios externos, lo que facilita el cumplimiento de requisitos de privacidad.
- Documentación clínica o legal dictada: el sesgo por listas de palabras clave mejora el reconocimiento de nombres de fármacos, términos legales o acrónimos específicos del dominio, reduciendo errores en vocabulario especializado.
- Investigación lingüística y creación de corpus: la licencia Apache-2.0 y la disponibilidad en GGUF permiten generar transcripciones a escala en seis idiomas sobre hardware de consumo, sin coste por API.
- Traducción de voz en entornos con recursos limitados: con cuantización Q4_K_M (1,60 GB) el modelo cabe en equipos modestos y permite traducir entre inglés y los cinco idiomas soportados en estaciones de trabajo sin GPU dedicada.
- Integración en aplicaciones de escritorio: la compilación con CMake y la CLI de transcribe.cpp facilitan embeber la transcripción en herramientas nativas para macOS (Metal) o Windows/Linux (Vulkan/CPU).

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean (2620 enunciados, decodificación greedy, normalizador EnglishTextNormalizer de Whisper):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 4,63 GB | 1,31 % |
| F16 | 4,63 GB | 1,32 % |
| Q8_0 | 2,56 GB | 1,32 % |
| Q6_K | 2,02 GB | 1,29 % |
| Q5_K_M | 1,83 GB | 1,33 % |
| Q4_K_M | 1,60 GB | 1,37 % |

El baseline BF16 local (1,31 %) queda 0,02 puntos por debajo del 1,33 % publicado por el autor del modelo base, diferencia atribuida a normalización y dentro del intervalo de confianza bootstrap.

Rendimiento en tiempo real (RTF, factor de tiempo real):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 33 |
| Apple M4 Max | CPU | 5,8 |
| Apple M4 | Metal | 12 |
| Apple M4 | CPU | 4 |
| AMD Ryzen 4750U | Vulkan | 2,8 |
| AMD Ryzen 4750U | CPU | 1,4 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que el modelo está especializado en ASR y AST.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más overhead. Q4_K_M requiere unos 1,60 GB de pesos; Q8_0 unos 2,56 GB; BF16/F16 unos 4,63 GB.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Los datos de rendimiento cubren Apple M4, Apple M4 Max y AMD Ryzen 4750U.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M a Q8_0 en tarjetas con 4-6 GB de VRAM o superior; BF16/F16 requiere al menos 6 GB.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake. Backends soportados: Metal (macOS), Vulkan y CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta conversión.
- Latencia y throughput: RTF de 33 en Metal sobre M4 Max (unas 33 veces más rápido que tiempo real), 12 en Metal sobre M4, 5,8 en CPU sobre M4 Max, 2,8 en Vulkan sobre Ryzen 4750U y 1,4 en CPU sobre Ryzen 4750U. El RTF superior a 1 en todos los casos indica inferencia más rápida que tiempo real.
- El audio de entrada debe convertirse previamente a WAV mono a 16 kHz (por ejemplo, con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|---|
| granite-speech-4.1-2b (esta conversion GGUF) | 2,31 B | en, fr, de, es, pt, ja | no disponible | Apache-2.0 | GGUF | ASR + AST, offline, transcribe.cpp |
| granite-4.0-1b-speech | no disponible | no disponible | no disponible | Apache-2.0 | safetensors | Predecesor; misma arquitectura, sin las mejoras de puntuación, truecasing y sesgo por palabras clave |
| Whisper (familia OpenAI) | no disponible en la informacion | multilingue | no disponible | MIT (variantes) | safetensors, GGUF | Referencia habitual en ASR; el normalizador de texto usado en los benchmarks es el de Whisper |

No se dispone de datos comparativos de rendimiento frente a Whisper u otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo acepta audio WAV mono a 16 kHz; es necesario remuestrear y convertir canales antes de la inferencia.
- No soporta streaming: la transcripción se realiza sobre el audio completo, lo que limita su uso en aplicaciones de dictado en vivo.
- No realiza detección automática de idioma: el idioma debe especificarse mediante el prompt.
- No genera marcas de tiempo, lo que dificulta el alineamiento con vídeo o la segmentación fina.
- La traducción siempre pasa por el inglés; no hay traducción directa entre pares como francés-alemán.
- Riesgo de alucinación inherente a los modelos generativos: en audio ruidoso o con solapamiento de voces pueden aparecer inserciones o sustituciones no presentes en la señal.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al entrenarse con corpus públicos y sintéticos, puede heredar sesgos de esos datos.
- Licencia Apache-2.0, que permite uso comercial; no obstante, conviene revisar los términos del modelo base en su model card para obligaciones de atribución.
- La conversión GGUF está validada contra un commit concreto de transcribe.cpp (275332d); cambios posteriores en la herramienta pueden afectar a la compatibilidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es inexistente.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/GhaythMahadin/granite-speech-4.1-2b-gguf
- Modelo base en Hugging Face: https://huggingface.co/ibm-granite/granite-speech-4.1-2b
- Commit del modelo base usado para la conversión: https://huggingface.co/ibm-granite/granite-speech-4.1-2b/commit/8f4bb5f
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/275332d
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/granite-speech-4.1-2b.md
- Predecesor granite-4.0-1b-speech: https://huggingface.co/ibm-granite/granite-4.0-1b-speech
- LLM base granite-4.0-1b-base: https://huggingface.co/ibm-granite/granite-4.0-1b-base
- Referencias arXiv citadas en los tags: arxiv:2310.02943, arxiv:2505.08699, arxiv:2603.11243, arxiv:2604.12398, arxiv:2604.22817, arxiv:2604.11269, arxiv:2603.08397 (no se dispone de los títulos en la información proporcionada)
