# lipik/cohere-transcribe-03-2026-gguf

## Resumen

Cohere Transcribe 03-2026 es un modelo de reconocimiento automático del habla (ASR) de 2.049 millones de parámetros desarrollado por Cohere y Cohere Labs. Se trata de un modelo dedicado de audio a texto con arquitectura encoder-decoder basada en Conformer, diseñado específicamente para transcripción multilingüe offline en 14 idiomas. Frente a aproximaciones multimodales que adaptan un LLM generalista, este modelo separa explícitamente la extracción de representaciones acústicas de la generación de texto, lo que reduce el coste computacional por hora de audio procesada.

La ficha que nos ocupa, `lipik/cohere-transcribe-03-2026-gguf`, es una conversión a formato GGUF del modelo original de CohereLabs, publicada para su uso con el runtime `transcribe.cpp`. Incluye seis cuantizaciones (BF16, F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) con tamaños que van de 4,11 GB a 1,55 GB, manteniendo un WER prácticamente idéntico en todas ellas (1,25-1,27 % sobre LibriSpeech test-clean). Esto convierte al modelo en una opción viable para despliegue en CPU, GPU consumer y dispositivos Apple Silicon.

Su relevancia actual radica en tres factores: licencia Apache-2.0 sin restricciones comerciales, soporte multilingüe amplio (incluyendo español, árabe, japonés, chino, coreano y vietnamita) y una huella de memoria reducida que permite ejecución local sin infraestructura dedicada. La conversión está validada numéricamente contra la referencia de Transformers, con paridad dentro del redondeo respecto al número reportado por Cohere en el Open ASR Leaderboard.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer encoder + Transformer encoder-decoder con cross-attention y embeddings de tokens atados |
| Parámetros totales | 2.049.026.832 (2B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, de, es, it, pt, nl, pl, el, ar, ja, zh, vi, ko (14 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (runtime `transcribe.cpp`); safetensors en el modelo base |
| Entrada | waveform de audio → espectrograma log-Mel; remuestreo automático a 16 kHz y downmix a mono |
| Salida | texto transcrito |
| Decodificación | autoregresiva (greedy en las evaluaciones reportadas) |
| Tamaño del repo | 2,4 GB |

## Arquitectura y entrenamiento

El modelo sigue un diseño encoder-decoder específico para ASR. Un encoder Conformer de gran tamaño extrae representaciones acústicas a partir del espectrograma log-Mel de la señal de entrada, combinando convoluciones locales con auto-atención para capturar tanto patrones acústicos de corto alcance como dependencias temporales largas. Sobre esa representación actúa una cabeza Transformer encoder-decoder con cross-attention, que genera la transcripción de forma autoregresiva. Los embeddings de tokens están atados entre entrada y salida, lo que reduce el número de parámetros respecto a un diseño no atado.

El preprocesamiento es automático: el audio se remuestra a 16 kHz si es necesario y las señales multicanal (estéreo) se promedian a mono antes de la extracción de features. La conversión GGUF está portada del commit `76b8b23` del modelo base (fijado el 2026-04-16) y validada contra la referencia de Transformers en el commit `bf0d0b7` de `transcribe.cpp` el 2026-04-18. No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; el modelo base es un ASR supervisado, por lo que el ajuste por preferencias no es el mecanismo habitual en esta categoría.

## Capacidades

- Transcripción de voz a texto offline en 14 idiomas: inglés, francés, alemán, español, italiano, portugués, neerlandés, polaco, griego, árabe, japonés, chino, vietnamita y coreano.
- Procesamiento de audio de entrada en formato WAV mono a 16 kHz, con remuestreo y downmix automáticos desde otras frecuencias y canales.
- Decodificación autoregresiva con salida de texto plano.
- Ejecución local sin dependencia de servicios en la nube, gracias al runtime `transcribe.cpp` y al formato GGUF.
- Aceleración por hardware: backend Metal en Apple Silicon y backend Vulkan en GPUs compatibles, además de ejecución en CPU.
- No soporta streaming (según metadatos del autor: `streaming: false`).
- No soporta traducción entre idiomas (`translate: false`).
- No realiza detección automática de idioma (`lang_detect: false`).
- No genera timestamps a nivel de palabra o segmento (`timestamps: none`).
- No soporta tool calling ni function calling: es un modelo puramente ASR, no un LLM de propósito general.

## Casos de uso

- Transcripción de reuniones y actas corporativas: el modelo procesa audio de reuniones grabadas y produce texto en el idioma original. Su tamaño de 2B permite ejecutarlo en un portátil con GPU integrada o Apple Silicon, evitando enviar audio confidencial a servicios externos.
- Subtitulado de vídeo y podcasts: integrado en un pipeline con `ffmpeg` para extraer y convertir el audio a WAV 16 kHz mono, el modelo genera la transcripción que luego se segmenta y sincroniza. La ausencia de timestamps nativos obliga a usar alineamiento forzado posterior si se necesitan subtítulos sincronizados.
- Atención al cliente y análisis de llamadas: transcripción de grabaciones de call centers en español, inglés, francés o alemán para su posterior análisis de sentimiento, extracción de entidades o control de calidad. La licencia Apache-2.0 permite uso comercial sin restricciones.
- Documentación clínica y legal dictada: dictado de notas en consultas o despachos con procesamiento local, lo que ayuda a cumplir requisitos de protección de datos al no salir el audio del dispositivo.
- Investigación lingüística y corpus multilingües: generación de transcripciones para 14 idiomas con el mismo modelo, útil para construir corpus paralelos o estudiar variación dialectal. La paridad de WER entre cuantizaciones permite usar Q4_K_M en entornos con recursos limitados sin degradación medible.
- Accesibilidad y transcripción en tiempo casi real: procesamiento por lotes de audio pregrabado para generar transcripciones de contenido educativo, con latencia baja gracias a los factores de tiempo real medidos (RTF 73 con Metal en M4 Max, RTF 8 con Vulkan en Ryzen 4750U).
- Despliegue en dispositivos edge: con Q4_K_M (1,55 GB) el modelo cabe en dispositivos con 2-4 GB de RAM, permitiendo transcripción embebida en aplicaciones móviles o sistemas de grabación dedicados.

## Benchmarks y rendimiento

Resultados de WER sobre LibriSpeech test-clean (2620 utterances, decodificación greedy, sin LM externo, normalización Whisper EnglishTextNormalizer):

| Cuantización | Tamaño | WER (%) |
|---|---:|---:|
| BF16 | 4,10 GB | 1,26 |
| F16 | 4,11 GB | 1,26 |
| Q8_0 | 2,41 GB | 1,27 |
| Q6_K | 1,97 GB | 1,27 |
| Q5_K_M | 1,76 GB | 1,25 |
| Q4_K_M | 1,55 GB | 1,25 |
| Referencia Cohere (Open ASR Leaderboard, 2026-03-26) | — | 1,25 |

Rendimiento en tiempo real (RTF, factor de tiempo real; mayor es mejor):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 73 |
| Apple M4 Max | CPU | 9 |
| AMD Ryzen 4750U | Vulkan | 8 |
| AMD Ryzen 4750U | CPU | 3 |

No se han publicado en la información disponible resultados de benchmarks multilingües (FLEURS, Common Voice, MLS) ni comparativas con otros modelos ASR en la misma tabla.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,6 GB con Q4_K_M, 2,0 GB con Q6_K, 2,4 GB con Q8_0 y 4,1 GB con BF16/F16. Se recomienda añadir 0,5-1 GB de margen para buffers de activaciones y decodificación.
- GPU recomendadas: cualquier GPU con soporte Vulkan (AMD, Intel, NVIDIA) o Metal (Apple Silicon). Para máximo throughput, Apple M4 Max alcanza RTF 73 con Metal.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más de VRAM. Con Q4_K_M funciona incluso en iGPU y en CPU exclusivamente.
- Opciones de despliegue: `transcribe.cpp` (runtime oficial para estos GGUF), con CLI `transcribe-cli`. No se menciona soporte para vLLM, TGI, llama.cpp ni Ollama, ya que es un modelo ASR y no un LLM.
- Latencia y throughput: RTF 73 con Metal en M4 Max implica procesar 73 segundos de audio por segundo de cómputo; RTF 3 en CPU de Ryzen 4750U implica aproximadamente 3 segundos de audio por segundo. En CPU de gama baja el rendimiento cae por debajo de tiempo real.
- Formato de entrada obligatorio: WAV mono a 16 kHz; conversión previa con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Formato | WER LibriSpeech test-clean |
|---|---:|---|---|---|---:|
| cohere-transcribe-03-2026 (este) | 2B | 14 | Apache-2.0 | GGUF / safetensors | 1,25-1,27 % |
| Whisper large-v3 | 1,55B | ~99 | MIT | safetensors, GGUF (whisper.cpp) | no disponible en la información |
| Whisper large-v3-turbo | 809M | ~99 | MIT | safetensors, GGUF | no disponible en la información |
| NVIDIA Parakeet-TDT-0.6B | 600M | 1 (inglés) | CC-BY-4.0 | NeMo | no disponible en la información |

La comparativa se limita a alternativas conocidas de la categoría ASR; los valores de WER de los modelos alternativos no están en la información proporcionada y no se inventan. La ventaja principal de este modelo frente a Whisper es la licencia Apache-2.0 (frente a MIT, ambas permisivas) y el soporte nativo de GGUF con runtime ligero; frente a Parakeet, el soporte multilingüe de 14 idiomas.

## Limitaciones y advertencias

- No soporta streaming: requiere audio completo o segmentos predefinidos; no es adecuado para transcripción en tiempo real continua sin troceado manual.
- No genera timestamps: no produce marcas temporales a nivel de palabra o segmento, lo que limita su uso directo en subtitulado sincronizado.
- No realiza detección de idioma: el idioma debe especificarse o inferirse externamente; no hay cambio automático entre idiomas dentro de una misma grabación.
- No traduce: solo transcribe en el idioma de origen.
- Riesgo de alucinación en audio con ruido, música o silencios prolongados: como todo modelo ASR autoregresivo, puede generar texto plausible donde no hay habla.
- Cobertura desigual entre idiomas: los 14 idiomas no están igualmente representados en los datos de entrenamiento; no se dispone de WER por idioma en la información proporcionada, por lo que el rendimiento en árabe, vietnamita o griego puede ser inferior al del inglés.
- Sesgos acústicos: probable degradación con acentos no estándar, dialectos regionales, habla con solapamiento o audio de baja calidad; no se documentan evaluaciones de sesgo en la información disponible.
- Dependencia de `transcribe.cpp`: el formato GGUF de este repo está validado solo contra ese runtime; no es compatible con llama.cpp ni con otras herramientas GGUF genéricas.
- Requiere preprocesamiento de audio: la entrada debe ser WAV mono a 16 kHz; audios en otros formatos o frecuencias necesitan conversión previa.
- Licencia Apache-2.0: permite uso comercial y modificación, pero requiere conservar el aviso de licencia y el archivo NOTICE si existe; no hay restricciones de uso adicionales documentadas.
- Repo con pocas descargas (23) y sin likes: menor validación comunitaria que el modelo base; para producción se recomienda contrastar contra el original de CohereLabs.

## Enlaces

- Repositorio GGUF: https://huggingface.co/lipik/cohere-transcribe-03-2026-gguf
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Commit del modelo base usado: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026/commit/76b8b23
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit validado de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/bf0d0b7
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/cohere-transcribe-03-2026.md
- Cohere Labs: https://cohere.com/research
- Cohere: https://cohere.com
