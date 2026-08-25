# florianvoss/whisper-medium-a16w8

## Resumen

El modelo `florianvoss/whisper-medium-a16w8` es una versión cuantizada y compilada del reconocedor de voz automático (ASR) Whisper Medium de OpenAI, optimizada específicamente para la plataforma de aceleración SiMa.ai Modalix. La cuantización A16W8 (activaciones de 16 bits, pesos de 8 bits) reduce la huella de memoria y mejora la eficiencia de inferencia en hardware embebido, manteniendo la arquitectura original de transformer encoder-decoder con 769 millones de parámetros. Este modelo está diseñado para ejecutarse en el runtime Neat de SiMa.ai, no como un checkpoint estándar de Transformers, y se distribuye con artefactos precompilados (ELF y devkit) que permiten su despliegue directo en dispositivos Modalix.

La relevancia de este modelo radica en su enfoque en el despliegue en el borde (edge): permite ejecutar transcripción multilingüe y traducción de voz a inglés en hardware dedicado de bajo consumo, sin depender de la nube. Soporta 99 idiomas y una ventana de audio de hasta 30 segundos, lo que lo hace adecuado para aplicaciones de asistencia por voz, subtitulado en tiempo real y dispositivos IoT. Sin embargo, no es un modelo de propósito general; está diseñado exclusivamente para el runtime Neat de SiMa.ai, y no se pueden cargar sus pesos con `transformers.AutoModel`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper encoder-decoder Transformer |
| Parametros totales | 769 millones |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 30 segundos de audio; maximo 448 posiciones de decoder |
| Tipos de cuantizacion | A16W8 (activaciones de 16 bits, pesos de 8 bits) |
| Idiomas soportados | 99 (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | Apache-2.0 |
| Formato de pesos | Artefactos compilados para SiMa.ai Neat (elf_files, devkit) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint original `openai/whisper-medium`, que sigue la arquitectura Whisper: un encoder de audio basado en convoluciones y transformadores, y un decoder autoregresivo que genera texto. El entrenamiento original se realizó sobre 680.000 horas de datos de audio etiquetados, con supervisión débil y sin ajuste fino por RLHF o DPO. La versión A16W8 aplica una cuantización de pesos a 8 bits y mantiene activaciones en 16 bits, lo que reduce el uso de memoria y acelera la inferencia en hardware de bajo consumo. No se especifica el proceso exacto de cuantización ni si hubo calibración adicional; el repositorio incluye scripts de compilación (`compile.sh` y `gen_models--openai--whisper.py`) para reproducir los artefactos, pero no se detallan los pasos de entrenamiento o ajuste fino.

La principal innovación técnica es la compilación de los pesos cuantizados en programas de aceleración (ELF) específicos para el chip SiMa.ai Modalix, que se ejecutan en el runtime Neat. Esto implica que el modelo no se puede usar con las APIs estándar de Transformers, sino que se integra mediante las APIs de GenAI de SiMa.ai (como `ASRModel` o `GenAIServer`). La cuantización A16W8 es una técnica de compresión común, pero aquí se combina con una compilación específica para hardware, lo que permite una inferencia eficiente en el borde.

## Capacidades

- Transcripción de audio a texto en 98 idiomas, con soporte multilingüe completo.
- Traducción de voz de cualquier idioma soportado a inglés (tarea de traducción de voz).
- Procesamiento de ventanas de audio de hasta 30 segundos, con segmentación recomendada para audios más largos.
- Integración directa en aplicaciones mediante la API `ASRModel` de Neat (C++ y Python).
- Exposición como servicio HTTP mediante `GenAIServer`, con soporte de peticiones de transcripción remotas.
- No incluye marcas de tiempo por palabra ni segmento; la salida es texto plano.
- No incluye diarización de hablantes.

## Casos de uso

- **Asistentes de voz en el borde**: un dispositivo Modalix puede ejecutar el modelo para transcribir comandos de voz en tiempo real sin conexión a la nube, gracias a su baja huella de memoria y su ejecución en hardware dedicado.
- **Subtitulado automático en directo**: para eventos o reuniones, el modelo procesa segmentos de 30 segundos y genera subtítulos en el idioma del audio, con opción de traducirlos al inglés.
- **Traducción de voz a texto en inglés**: útil en entornos multilingües, como atención al cliente o servicios de transcripción, donde se recibe audio en varios idiomas y se desea un único texto en inglés.
- **Dispositivos de accesibilidad**: sistemas de ayuda para personas con discapacidad auditiva que requieren transcripción en tiempo real de conversaciones o avisos.
- **Sistemas de grabación y archivo**: transcripción de entrevistas o reuniones en un dispositivo embebido, sin necesidad de servidores externos, manteniendo la privacidad de los datos.
- **Integración en pipelines de automatización**: a través de `GenAIServer`, se puede exponer una API HTTP de transcripción para que otros servicios la consuman, por ejemplo en un sistema de automatización del hogar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión A16W8 compilada. La model card del autor indica que los resultados del modelo original de OpenAI no deben considerarse como mediciones de este build. Por tanto, no se dispone de datos de rendimiento (WER, latencia, throughput) para esta versión.

## Requisitos de hardware

- Requiere un dispositivo **SiMa.ai Modalix** con el runtime **Neat** instalado (versión compatible: 0.4.0).
- No se especifican requisitos de VRAM, ya que el modelo se ejecuta en el acelerador dedicado de Modalix, no en GPU convencionales.
- No es compatible con GPUs de consumo (RTX 4090, etc.) ni con despliegues mediante vLLM, llama.cpp, Ollama o TGI.
- El repositorio incluye artefactos precompilados; no es necesario compilar manualmente si se usa el modelo precompilado.
- Para integración directa, se usa la API `ASRModel`; para acceso remoto, se sirve con `GenAIServer`.
- La latencia y throughput no se han publicado; dependen del dispositivo Modalix y de la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Uso |
|---|---|---|---|---|---|---|
| `florianvoss/whisper-medium-a16w8` | 769 M | 30 s audio | A16W8 | Apache-2.0 | Compilado para SiMa.ai | Solo en SiMa.ai Modalix |
| `openai/whisper-medium` | 769 M | 30 s audio | FP32/FP16 | MIT | Transformers | GPU/CPU, uso general |
| `openai/whisper-large-v3-turbo` | 809 M | 30 s audio | FP32/FP16 | MIT | Transformers | GPU/CPU, uso general |

No se dispone de datos de rendimiento comparativo entre estas versiones. La principal diferencia es que `whisper-medium-a16w` es exclusivo de la plataforma SiMa.ai, mientras que las versiones originales de OpenAI se pueden ejecutar en cualquier hardware compatible con Transformers.

## Limitaciones y advertencias

- El modelo solo se ejecuta en dispositivos SiMa.ai Modalix; no es compatible con `transformers.AutoModel` ni con otras bibliotecas estándar.
- La ventana de audio está limitada a 30 segundos; los audios más largos deben segmentarse antes de la inferencia.
- La salida no incluye marcas de tiempo por palabra ni por segmento, lo que puede limitar su uso en aplicaciones que requieren sincronización.
- No se realiza diarización de hablantes, por lo que no es adecuado para transcripciones con múltiples interlocutores.
- La cuantización puede provocar pequeñas diferencias en la precisión con respecto al modelo original de precisión completa.
- Whisper es conocido por alucinar texto durante silencios o audio ruidoso, y su rendimiento varía según el idioma, el acento y el dominio. Es necesario evaluar el modelo en datos representativos antes del despliegue en producción.
- No se han publicado resultados de evaluación específicos para esta versión A16W8, por lo que no se puede garantizar su rendimiento en comparación con el modelo original.

## Enlaces

- [Repositorio Hugging Face](https://huggingface.co/florianvoss/whisper-medium-a16w8)
- [Guía de inicio de SiMa.ai Neat](https://developer.sima.ai/software/getting-started/)
- [API GenAI Model](https://developer.sima.ai/software/develop-apps/development-workflow/genai-model)
- [Tutorial de servir modelos GenAI](https://developer.sima.ai/software/tutorials/serve-genai-models)
- [Modelo original openai/whisper-medium](https://huggingface.co/openai/whisper-medium)
- [Repositorio de OpenAI Whisper](https://github.com/openai/whisper)
