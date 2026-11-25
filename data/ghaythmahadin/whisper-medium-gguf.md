# GhaythMahadin/whisper-medium-gguf

## Resumen

whisper-medium-gguf es una conversión al formato GGUF del modelo openai/whisper-medium, publicada por el usuario GhaythMahadin para su uso con el runtime transcribe.cpp. Whisper es un modelo de reconocimiento automático del habla (ASR) y traducción de voz desarrollado por OpenAI, presentado en el artículo "Robust Speech Recognition via Large-Scale Weak Supervision". El modelo original se entrenó con 680 000 horas de audio etiquetado mediante supervisión débil, lo que le permite generalizar a dominios y datasets muy diversos sin necesidad de fine-tuning.

La relevancia de esta conversión concreta reside en el formato: al estar en GGUF, el modelo puede ejecutarse en CPU y GPU de consumo mediante transcribe.cpp, con cuantizaciones que van desde F32 (2,85 GB) hasta Q4_K_M (481 MB), manteniendo un WER en LibriSpeech test-clean prácticamente idéntico entre todas ellas (2,59 %–2,64 %). Esto lo convierte en una opción práctica para despliegues locales de transcripción multilingüe sin depender de infraestructura en la nube.

El modelo es un transformer encoder-decoder con 763 874 400 parámetros, ventanas de audio de 30 segundos y decodificación por chunks para audio de larga duración. Soporta transcripción multilingüe en más de 90 idiomas, detección automática de idioma y traducción de voz a texto en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 763 874 400 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos con decodificación por chunks para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | más de 90 idiomas (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Whisper es un transformer encoder-decoder entrenado sobre 680 000 horas de audio etiquetado con supervisión débil a gran escala, según el artículo de Radford et al. (2022). El modelo procesa audio en ventanas de 30 segundos y emplea decodificación por chunks para transcribir audio de mayor duración. La variante medium aquí convertida es la versión multilingüe, entrenada tanto para reconocimiento del habla como para traducción de voz (audio en cualquier idioma soportado a texto en inglés).

La conversión a GGUF se realizó a partir del commit upstream abdf7c3 de openai/whisper-medium, fijado el 2026-04-25, y se validó contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp el 2026-04-26. El pipeline de decodificación por defecto de transcribe.cpp emplea decodificación greedy, suppress_tokens, temperature fallback y timestamps de segmento activados. No se dispone de información sobre procesos de RLHF o DPO en la información proporcionada; Whisper se entrenó con supervisión débil, no con optimización por preferencias.

## Capacidades

- Transcripción automática del habla (ASR) multilingüe en más de 90 idiomas.
- Detección automática del idioma del audio (lang_detect: true).
- Traducción de voz a texto en inglés desde cualquier idioma soportado (translate: true).
- Generación de timestamps a nivel de segmento (timestamps: segment).
- Procesamiento de audio de larga duración mediante decodificación por chunks sobre ventanas de 30 segundos.
- No soporta streaming (streaming: false en la configuración de transcribe.cpp).
- No dispone de tool calling, function calling ni capacidades de agente; es un modelo exclusivamente ASR.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa audio de larga duración mediante decodificación por chunks con timestamps de segmento, lo que permite generar actas con marcas temporales por tramo. La cuantización Q5_K_M (556 MB) mantiene un WER del 2,62 % en LibriSpeech test-clean, adecuado para documentación interna.
- Subtitulado automático de vídeo: la generación de timestamps a nivel de segmento y el soporte de más de 90 idiomas permiten generar subtítulos en el idioma original o traducidos al inglés, integrándose en pipelines de postproducción con ffmpeg para la conversión previa a WAV de 16 kHz mono.
- Atención al cliente basada en voz: transcripción local de llamadas en CPU (RTF 1,1 en Ryzen 4750U con la cuantización adecuada) sin enviar audio a servicios externos, lo que facilita el cumplimiento de requisitos de privacidad y protección de datos.
- Dictado y accesibilidad: despliegue en equipos de consumo con la cuantización Q4_K_M (481 MB), que cabe en cualquier GPU integrada o CPU moderna, para aplicaciones de dictado por voz o transcripción en tiempo casi real en portátiles.
- Investigación lingüística y corpus: la detección automática de idioma y el soporte de decenas de lenguas minoritarias (haw, mi, cy, eu, br, oc, etc.) permiten construir corpus transcritos de forma automatizada sobre grabaciones de campo.
- Traducción de contenido audiovisual: la capacidad de traducción de voz a inglés facilita la localización de material en otros idiomas sin un paso intermedio de transcripción más traducción de texto.
- Procesamiento por lotes en servidores sin GPU: con el backend CPU de transcribe.cpp y cuantizaciones de menos de 800 MB, se pueden ejecutar múltiples instancias en paralelo en un servidor convencional para transcribir archivos por lotes.

## Benchmarks y rendimiento

Resultados de WER en LibriSpeech test-clean (2620 utterances) con la decodificación por defecto de transcribe.cpp:

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 2,85 GB | 2,63 % |
| F16 | 1,44 GB | 2,63 % |
| Q8_0 | 793 MB | 2,64 % |
| Q6_K | 618 MB | 2,59 % |
| Q5_K_M | 556 MB | 2,62 % |
| Q4_K_M | 481 MB | 2,59 % |

El dato autodeclarado por OpenAI para el mismo split es 2,90 %. La diferencia probable se atribuye a que `model.generate()` de OpenAI usa `<|notimestamps|>` por defecto, mientras que el pipeline de transcribe.cpp ejecuta con timestamps activados. Los números provienen de una única ejecución con backend Metal; las reducciones paralelas no deterministas de Metal pueden desplazar el WER del corpus en torno a 0,1 pp entre ejecuciones.

Rendimiento en tiempo real (RTF, menor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 41,6 |
| Apple M4 Max | CPU | 3 |
| AMD Ryzen 4750U | Vulkan | 4,3 |
| AMD Ryzen 4750U | CPU | 1,1 |

## Requisitos de hardware

- VRAM estimada: entre 481 MB (Q4_K_M) y 2,85 GB (F32) para los pesos; el consumo adicional depende del backend y del audio procesado.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA) es suficiente; el modelo es ligero y no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de memoria libre, e incluso en CPU sin GPU dedicada.
- Opciones de despliegue: transcribe.cpp (runtime nativo con backends Metal, Vulkan y CPU), con CLI `transcribe-cli`. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: RTF de 41,6 en Metal sobre M4 Max, 3 en CPU sobre M4 Max, 4,3 en Vulkan sobre Ryzen 4750U y 1,1 en CPU sobre Ryzen 4750U. Un RTF inferior a 1 implica procesamiento más rápido que tiempo real.
- El audio de entrada debe convertirse previamente a WAV de 16 kHz mono (por ejemplo, con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---:|---|---|---|---|
| whisper-medium-gguf (este) | 763,9 M | ventanas de 30 s con chunks | más de 90 | Apache-2.0 | GGUF |
| openai/whisper-medium (original) | 763,9 M | ventanas de 30 s con chunks | más de 90 | Apache-2.0 | safetensors |
| whisper-large-v3 | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparación con otras variantes de Whisper (small, large) o con modelos ASR alternativos no está disponible en la información proporcionada. La diferencia principal frente al modelo original es el formato GGUF y la integración con transcribe.cpp, que permite ejecución local en CPU y GPU de consumo con cuantizaciones de 481 MB a 2,85 GB sin pérdida apreciable de WER.

## Limitaciones y advertencias

- Riesgo de alucinación en clips cortos o con ruido de fondo: la propia model card señala que las diferencias de WER entre ejecuciones con Metal se deben principalmente a resultados de alucinación en clips cortos cerca del nivel de ruido.
- No soporta streaming: la configuración indica `streaming: false`, por lo que no es adecuado para transcripción en tiempo real continua sin segmentación previa.
- Ventana de audio limitada a 30 segundos por chunk: el audio largo requiere decodificación por chunks, lo que puede introducir errores en las fronteras entre segmentos.
- El modelo es exclusivamente ASR: no genera texto libre, no razona, no ejecuta código ni soporta tool calling; no debe evaluarse como un LLM.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y se remite a la model card de openai/whisper-medium para los términos completos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-25; se trata de una conversión reciente sin validación comunitaria amplia.
- Los enlaces de descarga de la model card apuntan al repositorio handy-computer/whisper-medium-gguf, no al repositorio de GhaythMahadin, lo que puede generar confusión sobre el origen de los artefactos.
- Los benchmarks provienen de una única ejecución con backend Metal y no deben interpretarse como valores deterministas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GhaythMahadin/whisper-medium-gguf
- Modelo base: https://huggingface.co/openai/whisper-medium
- Commit del modelo base: https://huggingface.co/openai/whisper-medium/commit/abdf7c3
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp 5.6.1: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-medium.md
- Repositorio de conversiones handy-computer: https://huggingface.co/handy-computer/whisper-medium-gguf
- Artículo de Whisper: https://arxiv.org/abs/2212.04356
- Código original de OpenAI Whisper: https://github.com/openai/whisper
