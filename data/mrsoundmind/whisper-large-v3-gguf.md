# mrsoundmind/whisper-large-v3-gguf

## Resumen

`mrsoundmind/whisper-large-v3-gguf` es una conversión a formato GGUF del modelo `openai/whisper-large-v3`, empaquetada para su uso con el runtime transcribe.cpp. Se trata, por tanto, de una distribución de pesos cuantizados, no de un modelo nuevo: la arquitectura, los pesos y el comportamiento subyacente son los de Whisper large-v3 de OpenAI, un transformer encoder-decoder especializado en reconocimiento automático del habla (ASR) y traducción de voz a texto en inglés.

El modelo resuelve dos tareas principales: transcripción multilingüe (audio en cualquiera de los ~99 idiomas soportados a texto en el mismo idioma) y traducción de voz (audio en cualquier idioma soportado a texto en inglés), además de detección de idioma. La relevancia de esta conversión concreta reside en que permite ejecutar un modelo de 1.543 millones de parámetros en hardware modesto: la cuantización Q4_K_M ocupa 951 MB y la Q8_0 1,55 GB, frente a los 2,88 GB del F16, con una degradación de WER mínima (1,86 % frente a 1,81 % en LibriSpeech test-clean).

La familia v3 introduce dos cambios respecto a large-v2: entrada mel de 128 bins en lugar de 80 y un token de idioma nuevo para cantonés (`yue`). El modelo base fue entrenado con 1 millón de horas de audio débilmente etiquetado más 4 millones de horas pseudo-etiquetadas generadas con large-v2, durante 2 épocas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) |
| Parametros totales | 1.543.516.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos con decodificación por chunks para audio largo |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 99 idiomas, incluidos en, es, zh, de, fr, ru, ja, ko, pt, ar, hi, yue, entre otros |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (runtime transcribe.cpp) |

## Arquitectura y entrenamiento

Whisper large-v3 es un transformer encoder-decoder con atención estándar. El encoder procesa espectrogramas mel de 128 bins sobre ventanas de 30 segundos; el decoder genera tokens de texto de forma autorregresiva con tokens especiales de control (idioma, tarea de transcripción o traducción, timestamps). Para audio de duración superior a 30 segundos, el pipeline de transcribe.cpp aplica decodificación por chunks con timestamps a nivel de segmento.

El entrenamiento del modelo base, según la model card original de OpenAI, emplea 1 millón de horas de audio débilmente etiquetado más 4 millones de horas pseudo-etiquetadas con Whisper large-v2, durante 2 épocas. No se documenta en la información disponible el uso de RLHF ni DPO; Whisper se entrena con supervisión débil a gran escala y decodificación greedy en producción. La conversión a GGUF fue validada contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp, con los pesos fijados al commit `06f233f` del modelo original (fecha de pin: 2026-04-25).

## Capacidades

- Transcripción automática del habla multilingüe en 99 idiomas, con detección automática de idioma (`lang_detect: true`).
- Traducción de voz a texto en inglés desde cualquier idioma soportado (`translate: true`).
- Generación de timestamps a nivel de segmento (`timestamps: segment`).
- Procesamiento de audio largo mediante decodificación por chunks de ventanas de 30 segundos.
- Soporte de cantonés (`yue`) como idioma nuevo en la familia v3.
- No soporta streaming (`streaming: false`): requiere audio completo o chunks cerrados.
- No es un modelo de texto: no hace tool calling, function calling ni razonamiento multi-paso; su única entrada es audio.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa audio de cualquier duración mediante chunks de 30 segundos y devuelve timestamps por segmento, lo que permite alinear la transcripción con la grabación. La cuantización Q5_K_M (1,08 GB) cabe en un portátil y mantiene un WER de 1,84 % en inglés limpio.
- Subtitulado automático de vídeo multilingüe: con detección de idioma y timestamps de segmento, se puede generar un fichero de subtítulos por idioma detectado en un pipeline de postproducción, usando Q8_0 (1,55 GB) para minimizar la pérdida de precisión.
- Traducción de contenido audiovisual a inglés: la tarea `translate` convierte directamente audio en cualquier idioma soportado a texto en inglés, útil para indexar o catalogar material en idiomas minoritarios sin pasar por una etapa intermedia de transcripción más traducción de texto.
- Atención al cliente con grabaciones de llamadas: transcripción por lotes de llamadas en centros de soporte para análisis de calidad y búsqueda sobre el texto resultante; el modelo corre en CPU (RTF 0,6 en Ryzen 4750U con cuantización baja) sin necesidad de GPU.
- Investigación lingüística y de ASR: al ser una conversión fiel y validada numéricamente contra transformers, sirve como referencia reproducible para comparar configuraciones de decodificación (timestamps activados o no, temperature fallback) sobre LibriSpeech y otros corpus.
- Despliegue en dispositivos con recursos limitados: la variante Q4_K_M (951 MB) permite ejecutar ASR en equipos sin GPU dedicada o en entornos embebidos donde un modelo de 2,88 GB en F16 no cabría, con una penalización de WER de solo 0,05 puntos porcentuales frente a F16.
- Preprocesado de datos para entrenamiento de otros modelos: transcripción masiva de audio a texto en 99 idiomas para construir corpus etiquetados, aprovechando el rendimiento en CPU (RTF 1,5 en M4 Max) para procesar grandes volúmenes sin saturar la GPU.

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean completo (2620 utterances), decodificación por defecto de transcribe.cpp (greedy, suppress_tokens, temperature fallback, timestamps de segmento activados):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F16 | 2,88 GB | 1,81 % |
| Q8_0 | 1,55 GB | 1,82 % |
| Q6_K | 1,21 GB | 1,83 % |
| Q5_K_M | 1,08 GB | 1,84 % |
| Q4_K_M | 951 MB | 1,86 % |

Referencia: OpenAI reporta 2,01 % en el mismo split. El autor atribuye la diferencia principalmente a que `model.generate()` de OpenAI usa `<|notimestamps|>` por defecto, mientras que el pipeline de transcribe.cpp ejecuta con timestamps activados. Los números provienen de una única ejecución con backend Metal; las reducciones paralelas no deterministas de Metal pueden desplazar el WER del corpus ~0,1 pp entre ejecuciones.

Rendimiento (RTF, real-time factor):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 23,6 |
| Apple M4 Max | CPU | 1,5 |
| AMD Ryzen 4750U | Vulkan | 2,1 |
| AMD Ryzen 4750U | CPU | 0,6 |

## Requisitos de hardware

- VRAM estimada: entre ~1 GB (Q4_K_M) y ~3 GB (F16) para los pesos; el consumo adicional depende del buffer de audio y del backend.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA). El autor reporta RTF 23,6 en M4 Max con Metal y 2,1 en Ryzen 4750U con Vulkan.
- Cabe en GPU de consumo: sí, todas las cuantizaciones caben en GPUs integradas y en tarjetas con 2 GB o más de VRAM; Q4_K_M (951 MB) cabe incluso en entornos muy ajustados.
- CPU: funcional sin GPU, con RTF 1,5 en M4 Max y 0,6 en Ryzen 4750U.
- Opciones de despliegue: transcribe.cpp (runtime nativo del formato, con CLI `transcribe-cli`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato en la información disponible.
- Latencia y throughput: expresados como RTF en la tabla anterior; no se publican valores absolutos de latencia por utterance.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---:|---|---:|---|---|
| whisper-large-v3-gguf (esta ficha) | 1.543 M | Ventanas de 30 s con chunks | 99 | Apache-2.0 | GGUF (transcribe.cpp) |
| openai/whisper-large-v3 | 1.543 M | Ventanas de 30 s con chunks | 99 | Apache-2.0 | safetensors (transformers) |
| openai/whisper-large-v2 | 1.550 M | Ventanas de 30 s con chunks | 98 (sin yue) | Apache-2.0 | safetensors |
| openai/whisper-large | 1.550 M | Ventanas de 30 s con chunks | 98 | Apache-2.0 | safetensors |

La comparación relevante es contra el modelo base sin cuantizar: misma arquitectura, mismos parámetros y mismos idiomas, con la diferencia de formato y runtime. Frente a large-v2, la familia v3 reporta una reducción de errores del 10 % al 20 % en una amplia variedad de idiomas, según la model card original.

## Limitaciones y advertencias

- Riesgo de alucinación en pasajes de silencio o ruido de fondo: el autor señala que las diferencias de WER entre ejecuciones con Metal se deben en gran parte a "short-clip hallucination outcomes on the noise floor".
- No soporta streaming: requiere audio cerrado o chunks completos, lo que limita su uso en transcripción en tiempo real continua.
- El WER reportado se mide solo en inglés (LibriSpeech test-clean); no se publican métricas por idioma para los 99 idiomas soportados, y el rendimiento en idiomas de bajos recursos puede ser sustancialmente peor.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial; conviene revisar la model card original de OpenAI para los términos completos.
- La conversión está validada contra una versión concreta de transcribe.cpp (commit 5.6.1) y unos pesos fijados (commit `06f233f`); cambios de runtime o de pesos pueden alterar el comportamiento numérico.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por terceros.
- No se documentan sesgos específicos del modelo base en la información disponible; al ser un modelo entrenado con datos web a gran escala, es esperable que herede sesgos de esos datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrsoundmind/whisper-large-v3-gguf
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Commit de pesos fijado: https://huggingface.co/openai/whisper-large-v3/commit/06f233f
- Paper de Whisper: https://huggingface.co/papers/2212.04356
- Repositorio transcribe.cpp: https://github.com/mrsoundmind/transcribe.cpp
- Descarga F16: https://huggingface.co/mrsoundmind/whisper-large-v3-gguf/resolve/main/whisper-large-v3-F16.gguf
- Descarga Q8_0: https://huggingface.co/mrsoundmind/whisper-large-v3-gguf/resolve/main/whisper-large-v3-Q8_0.gguf
- Descarga Q6_K: https://huggingface.co/mrsoundmind/whisper-large-v3-gguf/resolve/main/whisper-large-v3-Q6_K.gguf
- Descarga Q5_K_M: https://huggingface.co/mrsoundmind/whisper-large-v3-gguf/resolve/main/whisper-large-v3-Q5_K_M.gguf
- Descarga Q4_K_M: https://huggingface.co/mrsoundmind/whisper-large-v3-gguf/resolve/main/whisper-large-v3-Q4_K_M.gguf
