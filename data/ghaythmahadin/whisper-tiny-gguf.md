# GhaythMahadin/whisper-tiny-gguf

## Resumen

whisper-tiny-gguf es una conversión al formato GGUF del modelo openai/whisper-tiny, publicada por el usuario GhaythMahadin para su uso con transcribe.cpp, un motor de inferencia en C++ especializado en reconocimiento automático del habla. El modelo original es un transformer encoder-decoder de tipo sequence-to-sequence desarrollado por OpenAI y presentado en el artículo "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., 2022), entrenado sobre 680.000 horas de audio etiquetado mediante supervisión débil.

La variante tiny es la más pequeña de la familia Whisper, con 37.777.120 parámetros y un tamaño de repositorio de 0,4 GB. Realiza transcripción multilingüe, detección de idioma y traducción de voz a texto en inglés, procesando ventanas de 30 segundos con decodificación por fragmentos para audio de larga duración. Su relevancia radica en que permite ejecutar ASR en hardware muy modesto (CPU, GPU integradas o aceleradores de gama baja) gracias a las cuantizaciones GGUF de entre 42 y 146 MB.

Esta ficha describe la conversión GGUF; las capacidades lingüísticas y de reconocimiento provienen del modelo base de OpenAI, mientras que los datos de rendimiento (WER y factor de tiempo real) son mediciones específicas de transcribe.cpp publicadas por el autor de la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 37.777.120 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos con decodificacion por fragmentos para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 99 idiomas, entre ellos en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M) |
| Modelo base | openai/whisper-tiny (commit 169d4a4, fijado el 2026-04-25) |
| Libreria de inferencia | transcribe.cpp (validado contra el commit 5.6.1) |
| Tamano de los ficheros | 146 MB (F32), 76 MB (F16), 44 MB (Q8_0), 43 MB (Q6_K), 42 MB (Q5_K_M), 42 MB (Q4_K_M) |
| Entrada de audio | WAV mono a 16 kHz |

## Arquitectura y entrenamiento

El modelo base es un transformer encoder-decoder entrenado por OpenAI sobre 680.000 horas de audio etiquetado mediante supervisión débil a gran escala. Los modelos multilingües, como esta variante tiny, se entrenaron conjuntamente en tareas de reconocimiento del habla (transcripción en el mismo idioma del audio) y traducción del habla (transcripción al inglés desde cualquier idioma soportado). El modelo original emplea ventanas de 30 segundos y decodificación autorregresiva con tokens especiales de control para idioma, tarea y marcas temporales.

La conversión a GGUF no altera la arquitectura ni los pesos más allá de la cuantización. El autor indica que la conversión se realizó a partir del commit 169d4a4 del modelo original y se validó numéricamente contra la implementación de referencia en transformers usando el commit 5.6.1 de transcribe.cpp. Las cuantizaciones K-quant (Q6_K, Q5_K_M, Q4_K_M) mantienen el WER muy cerca del F32 (7,63 % y 7,76 % frente a 7,54 % en LibriSpeech test-clean), lo que indica que la pérdida por cuantización es mínima incluso en el nivel Q4_K_M.

## Capacidades

- Transcripción automática del habla multilingüe en 99 idiomas, incluyendo español, catalán, gallego, euskera y portugués.
- Detección automática del idioma del audio (`lang_detect: true`).
- Traducción del habla a texto en inglés desde cualquiera de los idiomas soportados (`translate: true`).
- Generación de marcas temporales a nivel de segmento (`timestamps: segment`).
- Procesamiento de audio de larga duración mediante decodificación por fragmentos sobre ventanas de 30 segundos.
- Ejecución en CPU, Metal (Apple Silicon) y Vulkan según los datos de rendimiento publicados.
- No soporta streaming (`streaming: false`): el audio debe procesarse por lotes completos.
- No es un modelo de lenguaje generativo general: no realiza tool calling, razonamiento multi-paso ni generación de código.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo convierte grabaciones de hasta varios minutos en texto mediante decodificación por fragmentos, con marcas temporales por segmento que facilitan la revisión y la indexación posterior. Su reducido tamaño permite ejecutarlo localmente sin depender de servicios en la nube.
- Subtitulado automático de vídeo: la salida con timestamps por segmento se puede transformar directamente en ficheros de subtítulos; el procesamiento por ventanas de 30 segundos encaja con la estructura habitual de los flujos de subtitulado.
- Dictado y entrada de voz en aplicaciones de escritorio: con 42 MB en Q4_K_M, el modelo se puede empaquetar dentro de una aplicación de escritorio o móvil y ejecutarse en CPU sin GPU dedicada.
- Traducción de contenido audiovisual al inglés: la tarea de traducción del habla permite generar transcripciones en inglés a partir de audio en español u otros idiomas, útil para la localización de pódcasts y vídeos.
- Indexación y búsqueda de archivos de audio: la transcripción con detección automática de idioma permite construir índices de texto searchable sobre archivos de audio multilingües en archivos personales o corporativos.
- Prototipado y validación de pipelines de ASR: al ser una conversión validada numéricamente contra transformers, sirve como referencia ligera para comparar implementaciones o para pruebas de integración en CI antes de desplegar modelos mayores de la familia Whisper.
- Transcripción en dispositivos con recursos limitados: en Raspberry Pi, portátiles antiguos o sistemas embebidos con Vulkan, el modelo ofrece un factor de tiempo real de 24,8 en CPU de Ryzen 4750U y 61 con Vulkan, suficiente para transcripción casi en tiempo real por lotes.

## Benchmarks y rendimiento

Datos publicados por el autor de la conversión. El WER se midió sobre el conjunto completo LibriSpeech test-clean (2.620 enunciados) con la decodificación por defecto de transcribe.cpp (greedy, suppress_tokens, temperature fallback, timestamps de segmento activados). OpenAI reporta 7,54 % en el mismo conjunto con su propia configuración de evaluación.

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 146 MB | 7,54 % |
| F16 | 76 MB | 7,49 % |
| Q8_0 | 44 MB | 7,53 % |
| Q6_K | 43 MB | 7,63 % |
| Q5_K_M | 42 MB | 7,63 % |
| Q4_K_M | 42 MB | 7,76 % |

Factores de tiempo real (RTF, mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 302,1 |
| Apple M4 Max | CPU | 76,1 |
| AMD Ryzen 4750U | Vulkan | 61,0 |
| AMD Ryzen 4750U | CPU | 24,8 |

El autor advierte de que las reducciones paralelas no deterministas de Metal pueden desplazar el WER del corpus en torno a 0,1 puntos porcentuales entre ejecuciones, principalmente por resultados de alucinación en clips cortos cerca del umbral de ruido.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; el fichero mayor (F32) ocupa 146 MB y el menor (Q4_K_M) 42 MB, por lo que la memoria necesaria para pesos es mínima.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA) es suficiente; no requiere GPU de datacenter.
- Cabe en cualquier GPU de consumo e incluso en GPU integradas; también funciona exclusivamente en CPU.
- Opciones de despliegue: transcribe.cpp (compilación con CMake y ejecución mediante `transcribe-cli`). El formato GGUF es específico de este motor; no se indica compatibilidad con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: con RTF de 302,1 en Metal sobre M4 Max, el modelo procesa audio más de 300 veces más rápido que tiempo real; en CPU de Ryzen 4750U el RTF es de 24,8 y con Vulkan de 61,0. El audio de entrada debe convertirse previamente a WAV mono de 16 kHz (por ejemplo, con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---:|---|---:|---|---|
| whisper-tiny-gguf (esta ficha) | 37,8 M | ventanas de 30 s | 99 | 7,54 % (F32) | Apache-2.0 | GGUF |
| openai/whisper-tiny | 37,8 M | ventanas de 30 s | 99 | 7,54 % (reportado por OpenAI) | Apache-2.0 | safetensors, PyTorch |
| openai/whisper-base | 74,4 M | ventanas de 30 s | 99 | no disponible en la informacion proporcionada | Apache-2.0 | safetensors, PyTorch |

La comparación con modelos de mayor tamaño de la familia Whisper (base, small, medium, large) no se incluye con cifras porque no se han proporcionado resultados de benchmarks de esas variantes en la información disponible. La ventaja diferencial de esta conversión frente al modelo original es el formato GGUF y la ejecución mediante transcribe.cpp en C++, con cuantizaciones de hasta 42 MB y backend Metal/Vulkan/CPU.

## Limitaciones y advertencias

- Riesgo de alucinación: el propio autor documenta que los clips cortos cerca del umbral de ruido pueden producir alucinaciones que afectan al WER del corpus; conviene validar la salida en audio de baja calidad.
- No soporta streaming: el audio debe entregarse completo o por fragmentos, sin transcripción incremental en tiempo real.
- El tamaño tiny limita la precisión en comparación con variantes mayores de Whisper; el WER de 7,54 % en LibriSpeech test-clean es aceptable para dictado limpio, pero puede degradarse en dominios con acentos, ruido o jerga.
- Aunque se listan 99 idiomas, el rendimiento por idioma no se detalla en la información disponible; los idiomas con menos datos de entrenamiento suelen presentar mayor tasa de error.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y debe verificarse en la model card de openai/whisper-tiny.
- El formato GGUF de esta conversión está pensado para transcribe.cpp; no se garantiza su carga en otros motores de inferencia.
- La conversión está fijada al commit 169d4a4 del modelo base (2026-04-25); cambios posteriores en el modelo original no están reflejados.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GhaythMahadin/whisper-tiny-gguf
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Commit del modelo base utilizado: https://huggingface.co/openai/whisper-tiny/commit/169d4a4
- Motor transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Version validada de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Pagina del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-tiny.md
- Articulo original de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI: https://github.com/openai/whisper
- Conversión de referencia del mismo modelo (handy-computer): https://huggingface.co/handy-computer/whisper-tiny-gguf
