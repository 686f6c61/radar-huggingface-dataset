# GhaythMahadin/whisper-base-gguf

## Resumen

whisper-base-gguf es una conversión al formato GGUF del modelo openai/whisper-base, publicada por GhaythMahadin para su uso con transcribe.cpp, una implementación en C/C++ del pipeline de Whisper. El modelo base es un transformer encoder-decoder de OpenAI con 72,6 millones de parámetros, entrenado sobre 680.000 horas de audio etiquetado mediante supervisión débil, y diseñado para reconocimiento automático del habla (ASR) y traducción de voz a texto sin necesidad de ajuste fino.

La relevancia de esta ficha no está en el modelo en sí, sino en el empaquetado: ofrece los pesos en cuantizaciones que van de F32 (279 MB) a Q4_K_M (56 MB), con una degradación de WER en LibriSpeech test-clean muy contenida (de 5,10 % a 5,36 %). Esto permite ejecutar ASR multilingüe en hardware modesto, incluido CPU y GPUs de consumo, mediante un runtime nativo sin dependencias de Python.

El modelo soporta 99 idiomas, detección automática de idioma, marcas de tiempo a nivel de segmento y traducción de cualquier idioma soportado a inglés. No soporta streaming según los metadatos del autor. La licencia es Apache-2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 72.610.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos con decodificación por trozos para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 99 idiomas (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

Whisper es un transformer encoder-decoder entrenado con 680.000 horas de datos de audio etiquetados mediante supervisión débil a gran escala, según el paper *Robust Speech Recognition via Large-Scale Weak Supervision* (Radford et al., OpenAI). El modelo base emplea 72,6 millones de parámetros y procesa audio en ventanas de 30 segundos; para audio más largo, el pipeline de transcribe.cpp aplica decodificación por trozos. Los modelos multilingües se entrenaron conjuntamente para reconocimiento del habla (transcripción en el mismo idioma del audio) y traducción del habla (transcripción a otro idioma, típicamente inglés).

La conversión GGUF se realizó a partir del commit upstream e37978b (fijado el 2026-04-25) y se validó numéricamente contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp (2026-04-26). El pipeline de decodificación por defecto de transcribe.cpp usa decodificación greedy, supresión de tokens, *temperature fallback* y marcas de tiempo por segmento activadas; esta configuración difiere del `model.generate()` de OpenAI, que por defecto usa `<|notimestamps|>`, lo que explica pequeñas divergencias de WER.

## Capacidades

- Transcripción de voz a texto multilingüe en 99 idiomas, con salida en el mismo idioma del audio.
- Detección automática de idioma (`lang_detect: true`).
- Traducción de voz a texto: audio en cualquier idioma soportado → texto en inglés (`translate: true`).
- Marcas de tiempo a nivel de segmento (`timestamps: segment`).
- Manejo de audio largo mediante decodificación por trozos sobre ventanas de 30 segundos.
- Ejecución nativa en CPU, Metal (Apple Silicon) y Vulkan (GPU AMD/Intel) mediante transcribe.cpp.
- No soporta streaming (`streaming: false`).
- No dispone de tool calling, capacidades de agente ni modalidad de texto/visión: es exclusivamente un modelo ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz en local: el modelo convierte audio de 16 kHz mono WAV en texto sin enviar datos a la nube, con un peso de 56-81 MB en cuantizaciones Q4_K_M/Q8_0, adecuado para portátiles y equipos de sobremesa.
- Subtitulado automático de vídeo: las marcas de tiempo por segmento permiten generar subtítulos sincronizados; el pipeline acepta audio extraído con ffmpeg y produce segmentos con timestamps.
- Traducción de contenido audiovisual a inglés: la tarea de traducción integrada permite transcribir directamente al inglés audio en cualquiera de los 99 idiomas, útil para indexar o publicar material en mercados anglófonos.
- Dictado y accesibilidad: integración en aplicaciones de escritorio mediante transcribe.cpp para dictado por voz o generación de transcripciones accesibles, con latencia baja en Apple Silicon (RTF 209,4 en Metal sobre M4 Max).
- Procesamiento por lotes en servidores sin GPU: en CPU (Ryzen 4750U, RTF 11,9) el modelo puede transcribir archivos en pipelines de ingesta documental o archivística donde no hay acelerador disponible.
- Detección de idioma en catálogos de audio: el flag `lang_detect` permite clasificar automáticamente el idioma de grabaciones antes de enrutarlas a un transcriptor específico o a un traductor.
- Prototipado y evaluación de ASR en investigación: al ser una conversión fiel del modelo base con validación numérica documentada, sirve como referencia reproducible para comparar cuantizaciones y runtimes.

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean (2620 utterances), decodificación por defecto de transcribe.cpp:

| Cuantizacion | Tamano | WER (%) |
|---|---:|---:|
| F32 | 279 MB | 5,10 |
| F16 | 144 MB | 5,10 |
| Q8_0 | 81 MB | 5,12 |
| Q6_K | 65 MB | 5,12 |
| Q5_K_M | 61 MB | 5,19 |
| Q4_K_M | 56 MB | 5,36 |

Referencia de OpenAI sobre el mismo split: 5,009 %. Las cifras de transcribe.cpp provienen de una única ejecución con backend Metal; las reducciones paralelas no deterministas de Metal pueden desplazar el WER del corpus en torno a 0,1 puntos porcentuales entre ejecuciones.

Rendimiento (RTF, *real-time factor*):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 209,4 |
| Apple M4 Max | CPU | 36,6 |
| Ryzen 4750U | Vulkan | 34,8 |
| Ryzen 4750U | CPU | 11,9 |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; Q4_K_M ocupa 56 MB de pesos y Q8_0 81 MB, por lo que el modelo cabe holgadamente en cualquier GPU con al menos 1 GB de memoria.
- GPU recomendadas: no requiere GPU dedicada; funciona en Apple Silicon (Metal) y en GPUs AMD/Intel vía Vulkan. Cualquier GPU de consumo reciente es sobradamente suficiente.
- Cabe en GPU de consumo: sí, en todas las tarjetas actuales (RTX 4090, RTX 3060, iGPU integradas con soporte Vulkan).
- Despliegue: exclusivamente mediante transcribe.cpp (compilación con CMake); no se distribuye en formatos para vLLM, llama.cpp, Ollama ni TGI, al ser un modelo ASR y no un LLM.
- Latencia y throughput: RTF de 209,4 en Metal sobre M4 Max y 11,9 en CPU Ryzen 4750U; a mayor RTF, menor tiempo de procesado respecto a la duración del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| whisper-base-gguf (esta ficha) | 72,6 M | 99 | GGUF / transcribe.cpp | Apache-2.0 | Cuantizaciones de 56 a 279 MB; WER 5,10-5,36 % en LibriSpeech test-clean |
| openai/whisper-base | 72,6 M | 99 | safetensors / PyTorch | Apache-2.0 | Modelo original; requiere transformers; WER reportado 5,009 % |
| openai/whisper-small | 244 M | 99 | safetensors / PyTorch | Apache-2.0 | Mayor precisión a costa de más cómputo; datos de WER no disponibles en la información proporcionada |
| openai/whisper-tiny | 39 M | 99 | safetensors / PyTorch | Apache-2.0 | Menor tamaño y precisión; datos de WER no disponibles en la información proporcionada |

## Limitaciones y advertencias

- Riesgo de alucinación en clips cortos o con ruido de fondo: el propio autor señala que las diferencias de WER entre ejecuciones se deben principalmente a resultados de alucinación en el límite de ruido.
- No soporta streaming; la transcripción en tiempo real requiere segmentar el audio externamente y aceptar latencia por ventana.
- Ventana de audio fija de 30 segundos; el audio largo depende de la decodificación por trozos, que puede introducir errores en las fronteras entre segmentos.
- Precisión limitada por el tamaño base (72,6 M de parámetros): para dominios especializados (acentos marcados, jerga técnica, audio médico o legal) se recomienda evaluar con datos propios o considerar variantes mayores de Whisper.
- Diferencias de decodificación respecto a OpenAI: el pipeline de transcribe.cpp activa marcas de tiempo por defecto, lo que puede producir transcripciones ligeramente distintas a las de `model.generate()`.
- Los números de WER provienen de una única ejecución con backend Metal; no deben tratarse como valores deterministas.
- Licencia Apache-2.0: permite uso comercial, pero se heredan las condiciones del modelo base; conviene revisar la model card upstream para los términos completos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una conversión reciente sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GhaythMahadin/whisper-base-gguf
- Modelo base: https://huggingface.co/openai/whisper-base
- Commit upstream del modelo base: https://huggingface.co/openai/whisper-base/commit/e37978b
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-base.md
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI: https://github.com/openai/whisper
- Pesos alternativos (handy-computer): https://huggingface.co/handy-computer/whisper-base-gguf
