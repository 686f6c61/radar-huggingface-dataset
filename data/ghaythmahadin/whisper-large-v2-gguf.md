# GhaythMahadin/whisper-large-v2-gguf

## Resumen

whisper-large-v2-gguf es la conversión al formato GGUF del modelo openai/whisper-large-v2, publicada por el usuario GhaythMahadin para su uso con el runtime transcribe.cpp. Se trata de un modelo de reconocimiento automático del habla (ASR) y traducción de voz, basado en la arquitectura encoder-decoder Transformer de OpenAI descrita en el paper "Robust Speech Recognition via Large-Scale Weak Supervision". El modelo original fue entrenado con 680.000 horas de audio etiquetado mediante supervisión débil, lo que le permite generalizar a dominios y datasets sin fine-tuning adicional.

La relevancia de esta ficha concreta radica en el formato: frente a los pesos originales en safetensors, esta conversión ofrece variantes cuantizadas (de F32 a Q4_K_M) que reducen el peso desde 5,75 GB hasta 950 MB, con un impacto mínimo en la tasa de error de palabras (WER). Según los datos del autor, la variante Q4_K_M obtiene un 2,46 % de WER en LibriSpeech test-clean, incluso por debajo del 2,68 % reportado para F32 en la misma ejecución.

El modelo soporta transcripción multilingüe en más de 90 idiomas, detección automática de idioma y traducción de voz a texto en inglés. No obstante, conviene señalar que el repositorio presenta 0 descargas y 0 likes en el momento de la consulta, y que los enlaces de descarga de la model card apuntan a la organización `handy-computer`, no a `GhaythMahadin`, lo que sugiere que se trata de un espejo o reempaquetado de una conversión ajena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 1.543.321.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos con decodificación por trozos para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | más de 90 (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es un Transformer encoder-decoder entrenado sobre 680.000 horas de audio etiquetado mediante supervisión débil a gran escala. La variante large-v2 se entrenó durante 2,5 veces más épocas que la large original e incorpora regularización adicional, lo que se traduce en mejor rendimiento según la model card upstream. El procesamiento se realiza sobre ventanas de 30 segundos, con decodificación por trozos para audio de mayor duración.

La conversión a GGUF no modifica la arquitectura ni los pesos más allá de la cuantización. El autor indica que el port se realizó desde el commit `ae46427` del modelo upstream, fijado el 2026-04-25, y se validó contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp el 2026-04-26. El pipeline de decodificación por defecto de transcribe.cpp emplea búsqueda greedy, `suppress_tokens`, fallback de temperatura y timestamps de segmento activados; esta última diferencia respecto a los valores por defecto de `model.generate()` de OpenAI (que usa `<|notimestamps|>`) es la causa más probable de las divergencias en WER entre ambas mediciones.

## Capacidades

- Transcripción de voz a texto multilingüe en más de 90 idiomas.
- Detección automática del idioma del audio (`lang_detect: true`).
- Traducción de voz a inglés desde cualquier idioma soportado (`translate: true`), es decir, audio en idioma X produce texto en inglés.
- Generación de timestamps a nivel de segmento (`timestamps: segment`).
- Procesamiento de audio largo mediante decodificación por trozos sobre ventanas de 30 segundos.
- No soporta streaming (`streaming: false`), según los metadatos del autor.
- Compatible con cuantizaciones de 4 a 32 bits para despliegue en CPU, GPU y aceleradores Apple Silicon (Metal) o Vulkan.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa audio largo mediante decodificación por trozos y genera timestamps por segmento, lo que permite alinear cada intervención con su marca temporal para actas y búsqueda posterior.
- Subtitulado automático de vídeo: la salida con timestamps de segmento y el soporte de más de 90 idiomas facilitan la generación de subtítulos en múltiples idiomas desde una única pista de audio.
- Traducción de contenido audiovisual: la capacidad `translate` convierte directamente audio en cualquier idioma soportado a texto en inglés, útil para localizar entrevistas o pódcasts antes de una traducción humana.
- Despliegue en hardware de consumo: la variante Q4_K_M ocupa 950 MB y mantiene un WER del 2,46 % en LibriSpeech test-clean, lo que permite ejecutar ASR local en portátiles sin GPU dedicada mediante el backend CPU de transcribe.cpp.
- Procesamiento por lotes en servidores: la variante F16 (2,89 GB) o Q8_0 (1,55 GB) con backend Metal o Vulkan ofrece un equilibrio entre calidad y velocidad para pipelines de transcripción masiva.
- Transcripción en dispositivos Apple Silicon: con backend Metal, el autor reporta un factor de tiempo real (RTF) de 23,7 en un M4 Max, lo que indica un procesamiento muy por encima de la velocidad de reproducción.
- Investigación en ASR multilingüe: el modelo sirve como línea base reproducible en formato GGUF para experimentos de evaluación de WER y comparación de cuantizaciones sin depender de PyTorch.

## Benchmarks y rendimiento

Datos de WER sobre LibriSpeech test-clean (2620 utterances) con la decodificación por defecto de transcribe.cpp, según la model card:

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 5,75 GB | 2,68 % |
| F16 | 2,89 GB | 2,68 % |
| Q8_0 | 1,55 GB | 2,65 % |
| Q6_K | 1,21 GB | 2,83 % |
| Q5_K_M | 1,08 GB | 2,72 % |
| Q4_K_M | 950 MB | 2,46 % |

El autor indica que OpenAI reporta un 2,83 % en la misma partición con su propia configuración de evaluación, y atribuye la diferencia principalmente a que `model.generate()` usa `<|notimestamps|>` por defecto mientras que transcribe.cpp ejecuta con timestamps activados. Las cifras provienen de una única ejecución con backend Metal; las reducciones paralelas no deterministas de Metal pueden desplazar el WER del corpus en torno a 0,1 puntos porcentuales entre ejecuciones.

Rendimiento en factor de tiempo real (RTF):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 23,7 |
| Apple M4 Max | CPU | 1,5 |
| AMD Ryzen 4750U | Vulkan | 2,1 |
| AMD Ryzen 4750U | CPU | 0,6 |

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: 950 MB (Q4_K_M), 1,08 GB (Q5_K_M), 1,21 GB (Q6_K), 1,55 GB (Q8_0), 2,89 GB (F16) y 5,75 GB (F32).
- Cabe en GPU de consumo: la variante Q4_K_M (950 MB) y Q8_0 (1,55 GB) se ajustan holgadamente a tarjetas con 4-8 GB de VRAM, como RTX 3050, RTX 4060 o superiores.
- Backends soportados por transcribe.cpp: Metal (Apple Silicon), Vulkan y CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que el formato GGUF está adaptado específicamente a transcribe.cpp.
- Rendimiento observado: RTF de 23,7 con Metal en M4 Max y 2,1 con Vulkan en Ryzen 4750U, lo que indica procesamiento en tiempo real o más rápido en ambas plataformas.
- Requiere audio de entrada en WAV mono a 16 kHz; el autor recomienda convertir con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.
- No soporta streaming; el procesamiento es por ventanas de 30 segundos con decodificación por trozos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---:|---|---|---|---|
| whisper-large-v2-gguf (esta ficha) | 1.543 M | ventanas de 30 s, decodificación por trozos | más de 90 | Apache-2.0 | GGUF |
| openai/whisper-large-v2 (original) | 1.543 M | ventanas de 30 s, decodificación por trozos | más de 90 | Apache-2.0 | safetensors |
| openai/whisper-large-v3 | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |
| whisper-large (v1) | 1.543 M | ventanas de 30 s | más de 90 | Apache-2.0 | safetensors |

La comparación con whisper-large-v3 u otros modelos ASR contemporáneos no puede completarse con los datos disponibles. La diferencia principal frente al original es el formato GGUF y las cuantizaciones, que reducen el tamaño hasta un 83 % (de 5,75 GB a 950 MB) con un WER comparable o inferior en la evaluación reportada.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y los enlaces de descarga de la model card apuntan a `handy-computer/whisper-large-v2-gguf` en lugar de a `GhaythMahadin`, por lo que conviene verificar la procedencia antes de usarlo en producción.
- No soporta streaming; las aplicaciones de transcripción en tiempo real necesitan segmentar el audio manualmente.
- El WER reportado proviene de una única ejecución con backend Metal y puede variar en torno a 0,1 puntos porcentuales entre ejecuciones debido a la no determinación de las reducciones paralelas.
- Riesgo de alucinación en clips cortos o con ruido de fondo, según señala el propio autor al comentar la variabilidad del WER.
- La calidad de transcripción varía según el idioma; los idiomas con menos datos de entrenamiento en el corpus original de Whisper tienden a presentar peor WER, aunque no se aportan cifras por idioma en la información disponible.
- La traducción solo se realiza hacia inglés, no entre pares arbitrarios de idiomas.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar los términos upstream.
- El modelo está empaquetado exclusivamente para transcribe.cpp; no es directamente compatible con llama.cpp, Ollama u otros runtimes GGUF sin conversión adicional.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/GhaythMahadin/whisper-large-v2-gguf
- Modelo base: https://huggingface.co/openai/whisper-large-v2
- Commit del modelo base referenciado: https://huggingface.co/openai/whisper-large-v2/commit/ae46427
- Paper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI: https://github.com/openai/whisper
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-large-v2.md
- Descargas GGUF (según model card): https://huggingface.co/handy-computer/whisper-large-v2-gguf/resolve/main/whisper-large-v2-Q4_K_M.gguf
