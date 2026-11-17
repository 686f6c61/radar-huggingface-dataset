# mrsoundmind/whisper-small-gguf

## Resumen

whisper-small-gguf es una conversión a formato GGUF del modelo openai/whisper-small, publicada por el usuario mrsoundmind para su uso con transcribe.cpp, una implementación en C++ del pipeline de Whisper. El modelo original es un transformer encoder-decoder de OpenAI entrenado para reconocimiento automático del habla (ASR) y traducción de voz, con 241.751.392 parámetros totales y capacidad para procesar audio en ventanas de 30 segundos con decodificación por trozos para audio de larga duración.

La relevancia de esta conversión radica en que empaqueta el modelo en cuantizaciones que van desde F32 (924 MB) hasta Q4_K_M (164 MB), manteniendo una degradación de WER mínima (3,33 % en F32 frente a 3,40 % en Q4_K_M sobre LibriSpeech test-clean). Esto permite ejecutar un modelo multilingüe de 99 idiomas en hardware consumer, con soporte para aceleración Metal y Vulkan, y con velocidades de inferencia medidas en factores de tiempo real (RTF) de hasta 99,2x en Metal sobre un M4 Max.

El modelo hereda la licencia Apache-2.0 del modelo base y está pensado para integrarse en aplicaciones de transcripción, subtitulado, detección de idioma y traducción de voz a texto en inglés. No es un modelo de propósito general: es exclusivamente un modelo de audio a texto, sin capacidades de generación de texto libre, razonamiento o código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 241.751.392 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos con decodificación por trozos para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 99 idiomas (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo base es un transformer encoder-decoder entrenado por OpenAI con 680.000 horas de audio etiquetado mediante supervisión débil a gran escala. El encoder procesa espectrogramas de audio en ventanas de 30 segundos y el decoder genera la transcripción de forma autorregresiva. Los modelos multilingües de Whisper se entrenaron tanto para reconocimiento del habla (transcripción en el mismo idioma del audio) como para traducción de voz (transcripción a un idioma distinto, típicamente inglés). El entrenamiento no dependió de fine-tuning por tarea, sino que buscó generalización zero-shot a múltiples dominios y datasets.

La conversión a GGUF la realizó mrsoundmind a partir del commit upstream 973afd2 (fijado el 2026-04-25) y fue validada contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp el 2026-04-26. La innovación principal de esta ficha no está en el modelo (que es el Whisper small original) sino en el empaquetado: cuantizaciones K-quant que preservan la precisión (Q4_K_M solo pierde 0,07 puntos porcentuales de WER frente a F32) y un runtime en C++ con soporte para Metal y Vulkan. El pipeline de decodificación de transcribe.cpp usa greedy decoding, suppress_tokens, temperature fallback y timestamps de segmento activados por defecto.

## Capacidades

- Transcripción automática del habla (ASR) en 99 idiomas, con salida en el mismo idioma del audio.
- Traducción de voz a texto en inglés desde cualquiera de los idiomas soportados (translate: true).
- Detección automática de idioma (lang_detect: true).
- Generación de timestamps a nivel de segmento (timestamps: segment).
- Procesamiento de audio de larga duración mediante decodificación por trozos sobre ventanas de 30 segundos.
- Entrada de audio: WAV mono a 16 kHz (se requiere conversión previa con ffmpeg para otros formatos).
- No soporta streaming (streaming: false en la model card).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente de audio a texto.
- No soporta visión ni audio de entrada más allá del pipeline ASR estándar.

## Casos de uso

- Subtitulado automático de vídeo: el modelo genera timestamps a nivel de segmento, lo que permite producir ficheros de subtítulos sincronizados para contenido en cualquiera de los 99 idiomas soportados, con la ventaja de que la cuantización Q4_K_M (164 MB) puede ejecutarse en portátiles sin GPU dedicada.
- Transcripción de reuniones y notas de voz: con decodificación por trozos sobre ventanas de 30 segundos, puede procesar grabaciones de horas de duración; el RTF de 99,2x en Metal sobre M4 Max implica que una hora de audio se transcribe en aproximadamente 36 segundos en ese hardware.
- Traducción de contenido audiovisual a inglés: la capacidad de translate permite tomar audio en español, francés, alemán u otros idiomas y producir texto en inglés, útil para pipelines de localización de contenido.
- Indexación y búsqueda de archivos de audio: transcribir grandes volúmenes de audio para hacerlos buscables por texto; la velocidad en CPU (RTF 9,8 en M4 Max, 3,4 en Ryzen 4750U) permite procesar lotes en servidores sin GPU.
- Detección de idioma en flujos de audio: lang_detect permite enrutar llamadas o contenido según el idioma detectado antes de aplicar el modelo ASR específico o la traducción.
- Aplicaciones de accesibilidad: generación de transcripciones en tiempo cuasi-real para personas con discapacidad auditiva, desplegando la cuantización Q8_0 (257 MB) en dispositivos de gama media con Vulkan.
- Procesamiento en el borde (edge): la cuantización Q4_K_M de 164 MB cabe en dispositivos con poca memoria y puede ejecutarse vía transcribe.cpp con backend Vulkan en GPUs integradas, útil para dispositivos IoT o aplicaciones móviles de transcripción offline.

## Benchmarks y rendimiento

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 924 MB | 3,33 % |
| F16 | 470 MB | 3,34 % |
| Q8_0 | 257 MB | 3,33 % |
| Q6_K | 202 MB | 3,33 % |
| Q5_K_M | 185 MB | 3,37 % |
| Q4_K_M | 164 MB | 3,40 % |

| Hardware | Backend | RTF (factor de tiempo real) |
|---|---|---:|
| Apple M4 Max | Metal | 99,2 |
| Apple M4 Max | CPU | 9,8 |
| AMD Ryzen 4750U | Vulkan | 12,1 |
| AMD Ryzen 4750U | CPU | 3,4 |

El WER se midió sobre el split completo de LibriSpeech test-clean (2620 utterances) con la decodificación por defecto de transcribe.cpp (greedy, suppress_tokens, temperature fallback, timestamps de segmento activados). OpenAI reporta 3,432 % en el mismo split; la divergencia se atribuye probablemente a que `model.generate()` de OpenAI usa por defecto `<|notimestamps|>` mientras que transcribe.cpp ejecuta con timestamps activados. Los números provienen de una única ejecución con backend Metal, y las reducciones paralelas no deterministas de Metal pueden desplazar el WER del corpus en torno a 0,1 puntos porcentuales entre ejecuciones, principalmente por resultados de alucinación en clips cortos cerca del suelo de ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para F32, 0,5 GB para F16, 0,3 GB para Q8_0 y 0,2 GB para Q4_K_M (el tamano del fichero es una cota superior razonable de la memoria necesaria).
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA) puede acelerar la inferencia; no se requieren GPUs de datacenter.
- Cabe en GPU consumer: sí, todas las cuantizaciones caben en cualquier GPU consumer moderna e incluso en GPUs integradas; Q4_K_M (164 MB) cabe en dispositivos con muy poca memoria.
- Opciones de despliegue: transcribe.cpp (única librería soportada oficialmente por esta conversión); no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que el pipeline es específico de ASR y no de generación de texto.
- Latencia y throughput: RTF de 99,2x en Metal sobre M4 Max (una hora de audio en unos 36 segundos), 9,8x en CPU sobre M4 Max, 12,1x en Vulkan sobre Ryzen 4750U y 3,4x en CPU sobre Ryzen 4750U.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Formato |
|---|---:|---:|---|---|---|
| whisper-small-gguf (esta ficha) | 241,7 M | 99 | ventanas de 30 s con chunking | Apache-2.0 | GGUF (transcribe.cpp) |
| openai/whisper-small (original) | 241,7 M | 99 | ventanas de 30 s con chunking | Apache-2.0 | safetensors/bin (transformers) |
| openai/whisper-base | 74 M | 99 | ventanas de 30 s con chunking | Apache-2.0 | safetensors/bin |
| openai/whisper-medium | 769 M | 99 | ventanas de 30 s con chunking | Apache-2.0 | safetensors/bin |

La comparación con whisper-base y whisper-medium se basa en los datos publicados por OpenAI para la familia Whisper; no se dispone en la información proporcionada de WER comparativo entre estas variantes medido con transcribe.cpp. La ventaja diferencial de esta ficha frente al whisper-small original es el formato GGUF y el runtime en C++ con aceleración Metal/Vulkan, que permite despliegue en hardware consumer con huella de memoria reducida (164 MB en Q4_K_M frente a los aproximadamente 924 MB en F32).

## Limitaciones y advertencias

- El modelo es exclusivamente ASR y traducción de voz; no genera texto libre, no razona, no escribe código ni responde preguntas.
- No soporta streaming (streaming: false): la decodificación es por lotes sobre ventanas de 30 segundos, lo que limita su uso en aplicaciones de transcripción en tiempo real estricto.
- Requiere audio de entrada en WAV mono a 16 kHz; es necesario convertir otros formatos con ffmpeg antes de la inferencia.
- Riesgo de alucinación en clips cortos o con ruido de fondo: la propia model card señala que las diferencias de WER entre ejecuciones (~0,1 pp) se deben principalmente a resultados de alucinación en clips cortos cerca del suelo de ruido.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y se remite a la model card de openai/whisper-small para los términos completos.
- El modelo solo ha sido validado con transcribe.cpp; no hay garantía de compatibilidad con otros runtimes GGUF como llama.cpp u Ollama, dado que el pipeline ASR es específico.
- Los benchmarks de WER provienen de una única ejecución con backend Metal y pueden no ser reproducibles de forma exacta debido al no determinismo de las reducciones paralelas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-17), por lo que no hay evidencia de uso en producción ni validación comunitaria independiente.
- La fecha de creación indicada (2026-11-17) es posterior a la fecha de validación mencionada en la model card (2026-04-26); se recomienda verificar la integridad de los ficheros antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrsoundmind/whisper-small-gguf
- Modelo base: https://huggingface.co/openai/whisper-small
- Commit upstream fijado: https://huggingface.co/openai/whisper-small/commit/973afd2
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI: https://github.com/openai/whisper
- Repositorio de transcribe.cpp: https://github.com/mrsoundmind/transcribe.cpp
- Descarga F32: https://huggingface.co/mrsoundmind/whisper-small-gguf/resolve/main/whisper-small-F32.gguf
- Descarga F16: https://huggingface.co/mrsoundmind/whisper-small-gguf/resolve/main/whisper-small-F16.gguf
- Descarga Q8_0: https://huggingface.co/mrsoundmind/whisper-small-gguf/resolve/main/whisper-small-Q8_0.gguf
- Descarga Q6_K: https://huggingface.co/mrsoundmind/whisper-small-gguf/resolve/main/whisper-small-Q6_K.gguf
- Descarga Q5_K_M: https://huggingface.co/mrsoundmind/whisper-small-gguf/resolve/main/whisper-small-Q5_K_M.gguf
- Descarga Q4_K_M: https://huggingface.co/mrsoundmind/whisper-small-gguf/resolve/main/whisper-small-Q4_K_M.gguf
