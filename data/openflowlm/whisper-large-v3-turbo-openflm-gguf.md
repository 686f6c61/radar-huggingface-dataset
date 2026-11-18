# OpenFlowLM/whisper-large-v3-turbo-OpenFLM-GGUF

## Resumen

Whisper large-v3-turbo es un modelo de reconocimiento automático del habla (ASR) desarrollado originalmente por OpenAI, publicado en el paper *Robust Speech Recognition via Large-Scale Weak Supervision* (Radford et al., 2022). Esta ficha concreta corresponde a la conversión a formato GGUF realizada por OpenFlowLM para su uso con la librería transcribe.cpp, una implementación en C/C++ orientada a inferencia local y eficiente. El modelo base es un transformer encoder-decoder con aproximadamente 809 millones de parámetros, derivado de Whisper large-v3 mediante la poda de las capas del decodificador (de 32 a 4), lo que reduce drásticamente el coste de decodificación a cambio de una degradación menor de calidad.

El modelo resuelve la transcripción multilingüe de audio en 100 idiomas, con detección automática de idioma y marcas de tiempo a nivel de segmento. La conversión a GGUF y la integración con transcribe.cpp permiten ejecutar el modelo en hardware de consumo, incluyendo CPU, Metal (Apple Silicon) y Vulkan, con cuantizaciones que van desde Q4_K_M hasta F16. Su relevancia actual radica en la combinación de un modelo de referencia en ASR con un formato y runtime que facilitan el despliegue local sin dependencias de Python ni de GPUs de datacenter.

Es importante señalar que esta variante *turbo* fue ajustada únicamente con datos de transcripción, excluyendo la traducción, por lo que no soporta la tarea `translate` (para ello debe usarse whisper-large-v3). El modelo base añade cantonés (yue) y utiliza una entrada mel de 128 bins. La licencia es Apache-2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo, decodificador podado de 32 a 4 capas) |
| Parametros totales | 808.904.208 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas de 30 segundos con decodificación por chunks para audio largo |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 100 idiomas, incluyendo en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su, yue |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transcribe.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de tipo Whisper. El encoder procesa espectrogramas mel de 128 bins sobre ventanas de 30 segundos, y el decodificador genera la transcripción de forma autorregresiva. La variante *turbo* se obtuvo podando el decodificador de Whisper large-v3 de 32 a 4 capas, manteniendo el resto de la arquitectura. Según la model card original, el modelo fue entrenado con más de 5 millones de horas de datos etiquetados y demuestra una fuerte capacidad de generalización zero-shot a múltiples dominios y datasets. El ajuste de la variante turbo se realizó sobre datos de transcripción, excluyendo explícitamente la traducción, lo que explica la ausencia de soporte para `task="translate"`.

La conversión a GGUF fue realizada por OpenFlowLM a partir del commit upstream 41f01f3 de openai/whisper-large-v3-turbo (fijado el 2026-04-25) y validada contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp (2026-04-26). La model card no detalla la composición exacta del dataset de ajuste ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible en el material proporcionado. La innovación técnica principal es la reducción del coste de decodificación mediante la poda de capas, que acelera la inferencia manteniendo una calidad cercana al modelo completo, junto con la decodificación por chunks para audio de duración arbitraria.

## Capacidades

- Transcripción automática de voz a texto en 100 idiomas, con detección automática del idioma de entrada.
- Generación de marcas de tiempo a nivel de segmento.
- Procesamiento de audio largo mediante decodificación por chunks sobre ventanas de 30 segundos.
- Detección de idioma (`lang_detect: true`).
- Soporte de entrada mel de 128 bins (familia v3), incluyendo cantonés (yue).
- Inferencia local en CPU, Metal (Apple Silicon) y Vulkan.
- No soporta traducción de voz (`translate: false`); para esa tarea debe usarse whisper-large-v3.
- No soporta streaming (`streaming: false`).
- No dispone de tool calling, function calling, capacidades de agente ni visión; es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones y videollamadas: el modelo procesa audio de duración arbitraria mediante chunks de 30 segundos y genera marcas de tiempo por segmento, lo que permite alinear la transcripción con la grabación y facilitar la revisión posterior.
- Subtitulado automático de vídeo: las marcas de tiempo a nivel de segmento y el soporte de 100 idiomas permiten generar ficheros de subtítulos para contenido multilingüe sin depender de servicios en la nube.
- Dictado y notas de voz en aplicaciones de escritorio: al ejecutarse con transcribe.cpp en CPU o Metal, puede integrarse en herramientas locales que convierten audio a texto sin enviar datos a servidores externos.
- Indexación y búsqueda de archivos de audio: la transcripción de grandes volúmenes de grabaciones (podcasts, entrevistas, archivos históricos) permite construir índices de texto buscables; el rendimiento en CPU (RTF 0,8 en Ryzen 4750U) hace viable el procesamiento por lotes.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en entornos donde no se permite el uso de APIs cloud por requisitos de privacidad.
- Detección de idioma en pipelines de enrutamiento: la capacidad `lang_detect` permite clasificar el idioma de un audio entrante antes de derivarlo a un traductor o a un agente específico.
- Transcripción en dispositivos con GPU integrada: el backend Vulkan (RTF 3,4 en Ryzen 4750U) y Metal (RTF 46,4 en M4 Max) permiten desplegar el modelo en portátiles y equipos sin GPU dedicada.

## Benchmarks y rendimiento

Resultados de WER en LibriSpeech test-clean (2620 utterances) con la decodificación por defecto de transcribe.cpp (greedy, suppress_tokens, temperature fallback, timestamps por segmento):

| Cuantizacion | WER LibriSpeech test-clean |
|---|---|
| F16 | 2,00 % |
| Q8_0 | 2,00 % |
| Q6_K | 1,96 % |
| Q5_K_M | 2,00 % |
| Q4_K_M | 2,00 % |

El dato autoinformado por OpenAI en el mismo split es 2,10 %. La model card señala que la diferencia más probable se debe a que `model.generate()` de OpenAI usa por defecto `<|notimestamps|>`, mientras que el pipeline de transcribe.cpp ejecuta con timestamps activados. Las cifras provienen de una única ejecución en CUDA (L4) y la variación entre ejecuciones y backends es de aproximadamente 0,1 puntos porcentuales.

Rendimiento (RTF, real-time factor):

| Hardware | Backend | RTF |
|---|---|---|
| Apple M4 Max | Metal | 46,4 |
| Apple M4 Max | CPU | 1,8 |
| AMD Ryzen 4750U | Vulkan | 3,4 |
| AMD Ryzen 4750U | CPU | 0,8 |

## Requisitos de hardware

- VRAM/RAM estimada: el fichero Q8_0 ocupa 845 MB; el repositorio completo es de 0,9 GB. Las cuantizaciones Q4_K_M y Q5_K_M son aún más ligeras, por lo que el modelo cabe holgadamente en memoria de sistemas con 2 GB o más.
- GPU recomendadas: no se especifican GPU concretas en la información disponible; los datos de rendimiento se han medido en una NVIDIA L4 (CUDA), en Apple M4 Max (Metal) y en AMD Ryzen 4750U (Vulkan y CPU).
- Cabe en GPU de consumo: sí, dado el tamaño del fichero (menos de 1 GB en Q8_0) y la naturaleza del modelo (809 M de parámetros). Cualquier GPU con al menos 1-2 GB de memoria libre es suficiente.
- Opciones de despliegue: transcribe.cpp (compilación desde fuente con CMake), con binario `transcribe-cli`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 46,4 en Metal (M4 Max), 3,4 en Vulkan (Ryzen 4750U) y 0,8 en CPU (Ryzen 4750U). Un RTF superior a 1 indica procesamiento más rápido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| whisper-large-v3-turbo (GGUF, esta ficha) | 808.904.208 | Ventanas de 30 s con chunks | 100 | Apache-2.0 | GGUF |
| whisper-large-v3 | no disponible en la informacion | Ventanas de 30 s con chunks | 100 | Apache-2.0 | safetensors, GGUF |
| whisper-large-v3-turbo (original OpenAI) | 808.904.208 | Ventanas de 30 s con chunks | 100 | Apache-2.0 | safetensors |

La información proporcionada no incluye datos de benchmarks de whisper-large-v3 ni de otras alternativas ASR comparables, por lo que no es posible establecer una comparación cuantitativa de rendimiento más allá del WER de LibriSpeech test-clean citado para esta variante (2,00 % en Q8_0) frente al 2,10 % autoinformado por OpenAI para el modelo base. La diferencia principal entre whisper-large-v3 y la variante turbo es que esta última no soporta traducción y reduce las capas del decodificador de 32 a 4, lo que la hace más rápida a costa de una degradación menor de calidad.

## Limitaciones y advertencias

- No soporta traducción de voz (`translate: false`); para traducir audio debe usarse whisper-large-v3.
- No soporta streaming (`streaming: false`); la transcripción se realiza sobre ventanas de 30 segundos con decodificación por chunks.
- Puede producir alucinaciones en clips cortos o con ruido de fondo; la model card menciona que la variación del WER en el corpus se debe en gran parte a "short-clip hallucination outcomes on the noise floor".
- La calidad puede degradarse en idiomas con menos datos de entrenamiento dentro de los 100 soportados.
- El modelo es únicamente ASR: no dispone de tool calling, agentes, visión ni razonamiento multi-paso.
- La licencia Apache-2.0 permite uso comercial, pero debe consultarse la model card upstream de openai/whisper-large-v3-turbo para los términos completos.
- Los datos de benchmarks provienen de una única ejecución en CUDA (L4); la variación entre backends y ejecuciones es de aproximadamente 0,1 puntos porcentuales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-18; se trata de una conversión reciente sin validación comunitaria amplia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OpenFlowLM/whisper-large-v3-turbo-OpenFLM-GGUF
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Commit upstream del modelo base: https://huggingface.co/openai/whisper-large-v3-turbo/commit/41f01f3
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-large-v3-turbo.md
- Paper de Whisper: https://huggingface.co/papers/2212.04356
- Discusión sobre la variante turbo en OpenAI Whisper: https://github.com/openai/whisper/discussions/2363
- Descarga directa Q8_0: https://huggingface.co/handy-computer/whisper-large-v3-turbo-gguf/resolve/main/whisper-large-v3-turbo-Q8_0.gguf
