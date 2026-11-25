# GhaythMahadin/granite-4.0-1b-speech-gguf

## Resumen

Granite-4.0-1b-speech es un modelo de voz de IBM diseñado para reconocimiento automático del habla (ASR) multilingüe y traducción automática del habla (AST) bidireccional. Se trata de un audio-LLM que combina un codificador Conformer con atención Shaw de bloque local, un proyector BLIP-2 Q-Former y el modelo de lenguaje Granite-4.0-1b-base como decodificador autorregresivo. Con 2.313.228.092 parámetros totales y una licencia Apache-2.0, está pensado para ejecutarse en dispositivos con recursos limitados.

La ficha que nos ocupa, `GhaythMahadin/granite-4.0-1b-speech-gguf`, es una conversión a formato GGUF del modelo original de IBM, publicada por un tercero (GhaythMahadin) para su uso con la librería transcribe.cpp. El repositorio ocupa 4,2 GB e incluye cuantizaciones desde BF16/F16 hasta Q4_K_M, con validación numérica frente a la referencia en Transformers.

Su relevancia actual radica en que permite ejecutar un modelo de voz multilingüe de alta precisión (WER del 1,42 % en LibriSpeech test-clean) en hardware de consumo, incluyendo CPU y GPU integradas, gracias a las optimizaciones de transcribe.cpp y a las cuantizaciones de 4 a 8 bits. Soporta inglés, francés, alemán, español, portugués y japonés, tanto para transcripción como para traducción vía inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM: codificador Conformer con atención Shaw de bloque local + proyector BLIP-2 Q-Former + decodificador LLM Granite-4.0-1b-base |
| Parametros totales | 2.313.228.092 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, de, es, pt, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de audio-LLM en tres etapas. Un codificador Conformer con atención Shaw de bloque local procesa la señal de audio; un proyector BLIP-2 Q-Former alinea las representaciones acústicas con el espacio del modelo de lenguaje; y el decodificador es Granite-4.0-1b-base, que genera el texto de forma autorregresiva. La entrada es audio WAV mono a 16 kHz y la salida es una transcripción o traducción.

El entrenamiento se realizó mediante alineación de modalidad de granite-4.0-1b-base con datos de audio y texto de corpus públicos de ASR y AST, complementados con datasets sintéticos para ASR en japonés, ASR con sesgo de palabras clave y traducción del habla. Respecto a granite-speech-3.3-2b y 3.3-8b, incorpora multilingüismo, mayor precisión en inglés, decodificación especulativa para acelerar la inferencia, la mitad de parámetros que el 3.3-2b y capacidad de sesgo mediante listas de palabras clave para nombres y acrónimos.

## Capacidades

- Transcripción de voz a texto en inglés, francés, alemán, español, portugués y japonés.
- Traducción automática del habla bidireccional entre inglés y cada uno de los otros cinco idiomas (en ↔ fr, en ↔ de, en ↔ es, en ↔ pt, en ↔ ja), siempre vía inglés; no se soportan pares directos como fr ↔ de.
- Sesgo mediante listas de palabras clave para mejorar el reconocimiento de nombres propios y acrónimos.
- Decodificación especulativa para reducir la latencia de inferencia.
- Procesamiento offline de audio (no streaming, según los metadatos de transcribe.cpp).
- Detección de idioma: no soportada (lang_detect: false).
- Marcas de tiempo: no soportadas (timestamps: none).
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo convierte grabaciones de audio mono a 16 kHz en texto en seis idiomas, adecuado para generar actas y resúmenes posteriores en entornos sin conexión.
- Subtitulado multilingüe de vídeo: combinado con ffmpeg para la conversión previa a WAV 16 kHz mono, permite generar subtítulos en inglés, francés, alemán, español, portugués o japonés, y traducirlos al inglés o desde el inglés.
- Traducción de contenido audiovisual: para material en español, francés, alemán, portugués o japonés que deba publicarse en inglés (o viceversa), el modelo realiza la traducción del habla de forma directa sin pipeline separado de ASR y traducción de texto.
- Dictado y accesibilidad en local: al ejecutarse en CPU y GPU de consumo con cuantización Q4_K_M (1,60 GB), es viable integrarlo en aplicaciones de escritorio de dictado por voz o en herramientas de accesibilidad sin depender de la nube.
- Transcripción con vocabulario especializado: la función de sesgo por palabras clave permite mejorar la precisión en dominios con nombres propios, siglas o terminología técnica concreta.
- Procesamiento por lotes en servidores modestos: con cuantizaciones Q8_0 (2,56 GB) o Q6_K (2,02 GB) y transcribe.cpp, se pueden transcribir grandes volúmenes de audio en hardware sin GPU dedicada, manteniendo un WER cercano al de BF16.

## Benchmarks y rendimiento

| Metrica | BF16 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,42 | 1,42 | 1,44 | 1,41 | 1,42 | 1,48 |

El WER se midió sobre la totalidad del split test-clean de LibriSpeech (2620 enunciados) con decodificación greedy y el normalizador `EnglishTextNormalizer` de Whisper, el mismo que usa Open ASR Leaderboard. La referencia BF16 coincide exactamente con el valor del Open ASR Leaderboard.

Rendimiento en tiempo real (RTF, factor de tiempo real) reportado en transcribe.cpp:

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 36,5 |
| Apple M4 Max | CPU | 6,0 |
| Apple M4 | Metal | 11,0 |
| Apple M4 | CPU | 5,0 |
| AMD Ryzen 4750U | Vulkan | 2,95 |
| AMD Ryzen 4750U | CPU | 1,6 |

No se han publicado en la información disponible resultados de benchmarks multilingües (FLEURS, Common Voice) ni de traducción del habla para esta conversión GGUF.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 1,60 GB (Q4_K_M) y 4,63 GB (BF16/F16), según la cuantización elegida.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon M4, M4 Max) o Vulkan (AMD Ryzen 4750U y superiores); no se especifican requisitos para NVIDIA, aunque al ser un GGUF es compatible con backends estándar de llama.cpp.
- Cabe en GPU de consumo: sí; con Q4_K_M (1,60 GB) o Q5_K_M (1,83 GB) cabe en GPUs integradas y en tarjetas con 2-4 GB de VRAM.
- Opciones de despliegue: transcribe.cpp (librería principal, con CLI `transcribe-cli`); no se mencionan vLLM, TGI, Ollama o llama.cpp en la información disponible.
- Latencia y throughput: RTF de 36,5 en Metal sobre M4 Max, 11 en Metal sobre M4, 2,95 en Vulkan sobre Ryzen 4750U, y 6,0 / 5,0 / 1,6 en CPU sobre M4 Max, M4 y Ryzen 4750U respectivamente. Un RTF mayor indica mayor velocidad relativa al tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---:|---:|---|---|
| granite-4.0-1b-speech (esta ficha, GGUF) | 2,31 B | 6 | 1,42 % (BF16) | Apache-2.0 | GGUF |
| granite-speech-3.3-2b | no disponible | no disponible | no disponible | no disponible | no disponible |
| granite-speech-3.3-8b | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo aporta datos comparativos cualitativos frente a granite-speech-3.3-2b y 3.3-8b (menor número de parámetros, multilingüismo añadido, mayor precisión en inglés y decodificación especulativa), sin cifras de benchmarks ni especificaciones completas de esos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al entrenarse con corpus públicos y sintéticos, puede heredar sesgos de esos datos.
- Riesgo de alucinación: inherente a los modelos autorregresivos; en ASR puede producir transcripciones plausibles pero incorrectas en audio ruidoso o con acentos no representados.
- Limitaciones de idioma: solo seis idiomas (en, fr, de, es, pt, ja); la traducción solo funciona vía inglés, sin pares directos entre los demás idiomas.
- Sin detección automática de idioma ni marcas de tiempo; el audio debe ser WAV mono a 16 kHz (requiere conversión previa con ffmpeg).
- No soporta streaming: solo procesamiento offline por lotes.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda consultar la model card original de IBM para los términos completos.
- Esta conversión GGUF es de un tercero (GhaythMahadin); la fuente autoritativa es el modelo base de IBM. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que su validación comunitaria es nula.
- La longitud de contexto no está documentada en la información disponible, lo que limita la planificación de audio de larga duración.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/GhaythMahadin/granite-4.0-1b-speech-gguf
- Modelo base en Hugging Face: https://huggingface.co/ibm-granite/granite-4.0-1b-speech
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/granite-4.0-1b-speech.md
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/275332d
- Commit del modelo base referenciado: https://huggingface.co/ibm-granite/granite-4.0-1b-speech/commit/bd87ab8
- Modelo granite-speech-3.3-2b: https://huggingface.co/ibm-granite/granite-speech-3.3-2b
- Modelo granite-speech-3.3-8b: https://huggingface.co/ibm-granite/granite-speech-3.3-8b
- Modelo granite-4.0-1b-base: https://huggingface.co/ibm-granite/granite-4.0-1b-base
- Paper referenciado (arXiv:2505.08699): https://arxiv.org/abs/2505.08699
- Paper referenciado (arXiv:2603.11243): https://arxiv.org/abs/2603.11243
