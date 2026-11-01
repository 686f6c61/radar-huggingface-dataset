# lipik/whisper-medium-gguf

## Resumen

`lipik/whisper-medium-gguf` es una conversión al formato GGUF del modelo `openai/whisper-medium` para su uso con el motor de inferencia transcribe.cpp. Se trata de un modelo de reconocimiento automático del habla (ASR) de tipo transformer encoder-decoder con 763,9 millones de parámetros, pensado para transcripción multilingüe, detección de idioma y traducción de voz a texto en inglés. La conversión la publica el usuario lipik a partir del trabajo de handy-computer, y replica las cuantizaciones habituales del ecosistema GGUF (F32, F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M).

La relevancia de esta ficha es doble. Por un lado, permite ejecutar un modelo Whisper medium en hardware modesto, incluso en CPU, con una degradación de precisión mínima: la tasa de error de palabra (WER) sobre LibriSpeech test-clean se mantiene entre el 2,59 % y el 2,64 % en todas las cuantizaciones, frente al 2,63 % del modelo en F32. Por otro, el formato GGUF y el motor transcribe.cpp están optimizados para despliegues ligeros y locales, con soporte de Metal en Apple Silicon y Vulkan en GPUs integradas y discretas.

El modelo hereda la licencia Apache-2.0 del modelo base y cubre 99 idiomas declarados en la model card. No es un modelo de propósito general: su única tarea es la conversión de audio a texto, con ventanas de 30 segundos y decodificación por trozos para audio largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 763.874.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos; decodificación por trozos para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 99 idiomas, entre ellos en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M) |

## Arquitectura y entrenamiento

Whisper medium es un transformer encoder-decoder secuencial entrenado por OpenAI sobre 680.000 horas de audio etiquetado mediante supervisión débil a gran escala. El encoder procesa espectrogramas de audio en ventanas de 30 segundos y el decoder genera texto de forma autorregresiva, con tokens especiales para la tarea (transcripción o traducción), el idioma y las marcas de tiempo. El modelo base se entrenó conjuntamente en reconocimiento del habla y traducción de voz al inglés, lo que le permite generalizar a dominios y conjuntos de datos sin ajuste fino adicional.

La conversión a GGUF no modifica la arquitectura ni los pesos más allá de la cuantización. La model card indica que el port se realizó desde el commit `abdf7c3` de `openai/whisper-medium` (fijado el 2026-04-25) y se validó contra la referencia de transformers en el commit `5.6.1` de transcribe.cpp el 2026-04-26. El pipeline de decodificación de transcribe.cpp usa decodificación greedy con `suppress_tokens`, respaldo por temperatura y marcas de tiempo a nivel de segmento activadas por defecto; esta configuración difiere de la usada por OpenAI en su evaluación original, que emplea `model.generate()` con `<|notimestamps|>` por defecto.

## Capacidades

- Transcripción de voz a texto en el mismo idioma del audio, con soporte para 99 idiomas.
- Detección automática del idioma del audio (`lang_detect: true`).
- Traducción de voz a texto en inglés desde cualquiera de los idiomas soportados (`translate: true`).
- Generación de marcas de tiempo a nivel de segmento (`timestamps: segment`).
- Procesamiento de audio largo mediante decodificación por trozos sobre ventanas de 30 segundos.
- Ejecución en CPU, Apple Metal y Vulkan a través de transcribe.cpp.
- No soporta streaming incremental (`streaming: false`).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo exclusivamente ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa audio largo mediante decodificación por trozos y genera marcas de tiempo por segmento, lo que facilita la alineación posterior con actas o resúmenes. La cuantización Q5_K_M (556 MB) permite ejecutarlo en portátiles sin GPU dedicada.
- Subtitulado automático de vídeo: la salida con timestamps por segmento se puede convertir directamente a formato SRT o VTT. El WER del 2,6 % en inglés limpio lo hace adecuado para contenido con buena calidad de audio.
- Traducción de contenido audiovisual al inglés: con `translate: true`, un audio en español, francés o alemán se convierte directamente en texto en inglés, útil para catalogar archivos multimedia multilingües.
- Transcripción en dispositivos de borde: con Q4_K_M (481 MB) y soporte de Vulkan y Metal, el modelo cabe en equipos con poca memoria y en GPUs integradas, lo que habilita dictado local sin enviar audio a la nube.
- Archivado y búsqueda de grabaciones: la detección automática de idioma y la transcripción multilingüe permiten indexar grandes volúmenes de audio heterogéneo sin definir el idioma a priori.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en aplicaciones de escritorio, con latencia controlada en CPU (RTF de 3 en un Apple M4 Max y de 1,1 en un Ryzen 4750U).
- Preprocesado de datasets de voz: conversión masiva de audio a texto para construir corpus etiquetados o para alimentar pipelines de análisis de sentimiento y extracción de entidades sobre transcripciones.

## Benchmarks y rendimiento

La model card proporciona el WER sobre la partición completa de LibriSpeech test-clean (2.620 enunciados) con la decodificación por defecto de transcribe.cpp:

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 2,85 GB | 2,63 % |
| F16 | 1,44 GB | 2,63 % |
| Q8_0 | 793 MB | 2,64 % |
| Q6_K | 618 MB | 2,59 % |
| Q5_K_M | 556 MB | 2,62 % |
| Q4_K_M | 481 MB | 2,59 % |

OpenAI reporta un 2,90 % en la misma partición con su propia configuración de evaluación. La model card atribuye la diferencia principalmente a que OpenAI usa `<|notimestamps|>` por defecto mientras que transcribe.cpp ejecuta con marcas de tiempo activadas. Los números provienen de una única ejecución sobre Metal, cuyo comportamiento no determinista en reducciones paralelas puede desplazar el WER del corpus en torno a 0,1 puntos porcentuales.

Rendimiento en tiempo real (RTF, menor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 41,6 |
| Apple M4 Max | CPU | 3,0 |
| AMD Ryzen 4750U | Vulkan | 4,3 |
| AMD Ryzen 4750U | CPU | 1,1 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no cubre esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB con Q4_K_M, 0,6 GB con Q5_K_M, 0,8 GB con Q8_0 y 2,9 GB con F32 (tamaños de archivo como cota inferior; el consumo real añade overhead del runtime).
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA) es suficiente; no requiere A100 ni H100.
- Cabe en GPUs de consumo: sí, en cualquier GPU con al menos 1 GB de memoria libre, y también en CPU.
- Opciones de despliegue: transcribe.cpp es el motor de referencia para estos pesos GGUF. La model card no menciona compatibilidad con llama.cpp, Ollama, vLLM ni TGI; el formato GGUF es genérico, pero la arquitectura Whisper encoder-decoder requiere un runtime que la soporte explícitamente.
- Latencia y throughput: RTF de 41,6 con Metal en M4 Max, 3,0 con CPU en M4 Max, 4,3 con Vulkan en Ryzen 4750U y 1,1 con CPU en Ryzen 4750U. Un RTF inferior a 1 implica procesamiento más rápido que el tiempo real.
- El audio de entrada debe ser WAV mono a 16 kHz; la model card recomienda convertir con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---:|---|---|---|---|
| lipik/whisper-medium-gguf | 763,9 M | ventanas de 30 s | 99 | Apache-2.0 | GGUF |
| openai/whisper-medium (original) | 763,9 M | ventanas de 30 s | 99 | Apache-2.0 | safetensors / PyTorch |
| openai/whisper-small | 244 M | ventanas de 30 s | 99 | Apache-2.0 | safetensors / PyTorch |
| openai/whisper-large-v3 | 1.550 M | ventanas de 30 s | 99 | Apache-2.0 | safetensors / PyTorch |

La comparación directa más relevante es con el modelo original: mismos pesos y licencia, pero el GGUF reduce el tamaño de 2,85 GB a 481 MB en Q4_K_M con una variación de WER de apenas 0,04 puntos porcentuales. Frente a whisper-small, medium ofrece mayor precisión a costa de más cómputo; frente a whisper-large-v3, medium es aproximadamente la mitad de grande y más rápido, con menor precisión esperada, aunque la información disponible no incluye cifras comparativas de large-v3.

## Limitaciones y advertencias

- No soporta streaming incremental: la decodificación se realiza por ventanas completas de 30 segundos, lo que introduce latencia en aplicaciones de transcripción en vivo.
- Riesgo de alucinación en clips cortos o con ruido de fondo: la model card señala que las diferencias de WER entre ejecuciones sobre Metal se deben principalmente a resultados de alucinación en el nivel de ruido.
- El WER de referencia (2,6 %) corresponde a inglés limpio de LibriSpeech; el rendimiento en otros idiomas, acentos, audio con ruido o dominios especializados (médico, legal, técnico) no está cuantificado en la información disponible.
- La evaluación se hizo con una única ejecución y un único backend (Metal); no hay validación publicada sobre Vulkan ni CPU más allá de los datos de RTF.
- El modelo no realiza razonamiento, tool calling ni generación de texto libre: cualquier uso fuera de ASR o traducción de voz no está soportado.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar los términos upstream por si OpenAI añade restricciones adicionales.
- El repositorio tiene 31 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-10-28; se trata de una conversión reciente con poca validación comunitaria.
- La model card referencia descargas alojadas en `handy-computer/whisper-medium-gguf`, no en el repositorio de lipik; conviene verificar la procedencia de los archivos antes de usarlos en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lipik/whisper-medium-gguf
- Modelo base: https://huggingface.co/openai/whisper-medium
- Commit del modelo base usado en la conversión: https://huggingface.co/openai/whisper-medium/commit/abdf7c3
- Motor transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-medium.md
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI: https://github.com/openai/whisper
