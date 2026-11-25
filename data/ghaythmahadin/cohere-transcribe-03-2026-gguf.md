# GhaythMahadin/cohere-transcribe-03-2026-gguf

## Resumen

cohere-transcribe-03-2026-gguf es la conversión a formato GGUF del modelo Cohere Transcribe, un sistema de reconocimiento automático del habla (ASR) de 2.049 millones de parámetros desarrollado por Cohere y Cohere Labs. Esta versión, publicada por el usuario GhaythMahadin, empaqueta los pesos originales para su uso con transcribe.cpp, una implementación en C++ pensada para inferencia local sin dependencias de Python ni de frameworks de deep learning pesados.

El modelo resuelve el problema de la transcripción de audio a texto en 14 idiomas (inglés, francés, alemán, español, italiano, portugués, neerlandés, polaco, griego, árabe, japonés, chino, vietnamita y coreano) con una arquitectura conformer encoder-decoder y decodificación autoregresiva. Su relevancia radica en que ofrece una alternativa de pesos abiertos (Apache-2.0) a soluciones propietarias de ASR, con un rendimiento en LibriSpeech test-clean de aproximadamente 1,26 % de WER en BF16, comparable al reportado por Cohere en el Open ASR Leaderboard.

La versión GGUF añade valor al permitir ejecutar el modelo en hardware de consumo mediante cuantizaciones de 4 a 8 bits, con degradación mínima de la precisión (el WER se mantiene en torno al 1,25-1,27 % en todas las cuantizaciones publicadas). El repositorio ocupa 4,0 GB e incluye los ficheros BF16, F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder + Transformer encoder-decoder (cross-attention, tied token embedding) |
| Parametros totales | 2.049.026.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, de, es, it, pt, nl, pl, el, ar, ja, zh, vi, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura conformer encoder-decoder. Un encoder Conformer de gran tamano extrae representaciones acústicas a partir de un espectrograma log-Mel; la entrada es una forma de onda de audio que se remuestrea automáticamente a 16 kHz y se convierte a mono promediando canales si es necesario. Sobre esa representación actúa una cabeza Transformer encoder-decoder con atención cruzada y embeddings de token compartidos (tied token embedding). La decodificación es autoregresiva y produce directamente el texto transcrito.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones específicas como decodificación especulativa o atención lineal. La model card del autor de la conversión GGUF indica que el port se validó contra la referencia de Transformers en el commit bf0d0b7 de transcribe.cpp, fijando el commit upstream 76b8b23 del modelo base (16 de abril de 2026).

## Capacidades

- Transcripción de voz a texto offline en 14 idiomas: inglés, francés, alemán, español, italiano, portugués, neerlandés, polaco, griego, árabe, japonés, chino, vietnamita y coreano.
- Entrada de audio en formato WAV mono a 16 kHz; el preprocesado del modelo base remuestrea automáticamente y convierte estéreo a mono.
- Decodificación autoregresiva de la transcripción.
- No soporta streaming (streaming: false).
- No soporta traducción (translate: false).
- No realiza detección de idioma (lang_detect: false).
- No genera marcas de tiempo (timestamps: none).
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta soporte de visión ni de audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y notas de voz en local: el modelo procesa audio WAV de 16 kHz y genera la transcripción sin conexión, lo que permite desplegarlo en portátiles o estaciones de trabajo sin enviar datos sensibles a servicios en la nube. Es adecuado por su tamano contenido (1,55 GB en Q4_K_M) y su licencia Apache-2.0.
- Subtitulado de contenido audiovisual multilingüe: con cobertura de 14 idiomas, se puede usar para generar subtítulos en inglés, español, francés, alemán y otros, preconvirtiendo el audio con ffmpeg a WAV mono 16 kHz antes de la inferencia.
- Atención al cliente y análisis de llamadas: la transcripción de grabaciones de soporte permite alimentar pipelines de análisis de sentimiento o búsqueda sobre conversaciones, ejecutando el modelo en servidores con CPU o GPU modesta.
- Investigación en ASR y evaluación de cuantizaciones: al incluir múltiples cuantizaciones con WER medido en LibriSpeech test-clean, sirve como banco de pruebas para estudiar el impacto de la cuantización en la precisión de transcripción.
- Despliegue en dispositivos con recursos limitados: la versión Q4_K_M (1,55 GB) y Q5_K_M (1,76 GB) permiten ejecutar el modelo en hardware de consumo, útil para aplicaciones de dictado o asistentes de voz locales.
- Procesamiento por lotes de archivos de audio: transcribe.cpp permite invocar el binario transcribe-cli sobre ficheros WAV, lo que facilita la transcripción masiva de archivos en un pipeline de datos.
- Integración en aplicaciones de escritorio o embebidas: al ser una implementación en C++ con backend Metal, Vulkan y CPU, se puede incorporar en aplicaciones nativas que requieran transcripción sin dependencias de Python.

## Benchmarks y rendimiento

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 4,10 GB | 1,26 % |
| F16 | 4,11 GB | 1,26 % |
| Q8_0 | 2,41 GB | 1,27 % |
| Q6_K | 1,97 GB | 1,27 % |
| Q5_K_M | 1,76 GB | 1,25 % |
| Q4_K_M | 1,55 GB | 1,25 % |

El WER se midió sobre el split completo de LibriSpeech test-clean (2620 enunciados) con decodificación greedy y sin modelo de lenguaje externo. La referencia BF16 es 1,26 %; el número reportado por Cohere en el mismo split es 1,25 % (Open ASR Leaderboard, a fecha de 2026-03-26). Ambos usan el normalizador EnglishTextNormalizer de Whisper.

Rendimiento en tiempo real (RTF, factor de tiempo real):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 73 |
| Apple M4 Max | CPU | 9 |
| AMD Ryzen 4750U | Vulkan | 8 |
| AMD Ryzen 4750U | CPU | 3 |

No se han publicado en la información disponible resultados de benchmarks para otros conjuntos como MMLU, HumanEval o GSM8K, ya que se trata de un modelo ASR y no de un modelo de lenguaje generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB en Q8_0, 2,0 GB en Q6_K, 1,8 GB en Q5_K_M y 1,6 GB en Q4_K_M; en BF16/F16 en torno a 4,1 GB.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA) con al menos 2-4 GB de memoria; el modelo también funciona en CPU.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más de VRAM en cuantizaciones Q4_K_M a Q8_0; en BF16 requiere alrededor de 4-5 GB.
- Opciones de despliegue: transcribe.cpp (binario transcribe-cli). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, dado que es un modelo ASR y no un LLM.
- Latencia y throughput: RTF de 73 en Metal (M4 Max), 9 en CPU (M4 Max), 8 en Vulkan (Ryzen 4750U) y 3 en CPU (Ryzen 4750U). Un RTF mayor indica procesamiento más rápido que el tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | WER LibriSpeech test-clean |
|---|---:|---|---|---|---|
| cohere-transcribe-03-2026 (GGUF) | 2,049 B | 14 | Apache-2.0 | GGUF | 1,25-1,27 % |
| Whisper large-v3 | no disponible en la informacion | no disponible en la informacion | MIT (segun conocimiento general, no verificado en esta busqueda) | safetensors, GGUF | no disponible en la informacion |
| Otros modelos ASR comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos verificados de parámetros, contexto o WER de modelos alternativos como Whisper large-v3, NVIDIA Parakeet o Meta MMS, por lo que la comparativa cuantitativa queda limitada al propio modelo. La comparación con Whisper se menciona solo a nivel cualitativo (ambos son ASR multilingües con pesos abiertos), sin cifras confirmadas en esta ficha.

## Limitaciones y advertencias

- No soporta streaming: la transcripción es offline y requiere el audio completo.
- No realiza traducción: solo transcribe en el idioma del audio; no traduce a otro idioma.
- No realiza detección automática de idioma: el usuario debe indicar o conocer el idioma del audio.
- No genera marcas de tiempo por segmento o palabra.
- La entrada debe ser WAV mono a 16 kHz; es necesario preprocesar otros formatos con ffmpeg u otra herramienta.
- Riesgo de alucinación y errores en audio con ruido, acentos marcados, solapamiento de hablantes o vocabulario técnico especializado; el WER reportado corresponde a LibriSpeech, un corpus de lectura limpia en inglés, por lo que el rendimiento en condiciones reales puede ser peor.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos no descritos en la información disponible, no se puede evaluar su comportamiento diferencial por dialecto, género o edad.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios; no hay restricciones adicionales documentadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria amplia de esta conversión concreta.
- La conversión GGUF está fijada a un commit concreto del modelo base (76b8b23) y validada contra transcribe.cpp en el commit bf0d0b7; cambios posteriores en el modelo base o en transcribe.cpp podrían no estar cubiertos.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/GhaythMahadin/cohere-transcribe-03-2026-gguf
- Modelo base en Hugging Face: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Commit del modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026/commit/76b8b23
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/bf0d0b7
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/cohere-transcribe-03-2026.md
- Descarga BF16: https://huggingface.co/handy-computer/cohere-transcribe-03-2026-gguf/resolve/main/cohere-transcribe-03-2026-BF16.gguf
- Descarga F16: https://huggingface.co/handy-computer/cohere-transcribe-03-2026-gguf/resolve/main/cohere-transcribe-03-2026-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/cohere-transcribe-03-2026-gguf/resolve/main/cohere-transcribe-03-2026-Q8_0.gguf
- Descarga Q6_K: https://huggingface.co/handy-computer/cohere-transcribe-03-2026-gguf/resolve/main/cohere-transcribe-03-2026-Q6_K.gguf
- Descarga Q5_K_M: https://huggingface.co/handy-computer/cohere-transcribe-03-2026-gguf/resolve/main/cohere-transcribe-03-2026-Q5_K_M.gguf
- Descarga Q4_K_M: https://huggingface.co/handy-computer/cohere-transcribe-03-2026-gguf/resolve/main/cohere-transcribe-03-2026-Q4_K_M.gguf
- Cohere Labs: https://cohere.com/research
