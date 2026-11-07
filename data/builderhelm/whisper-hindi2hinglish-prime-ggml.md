# BuilderHelm/Whisper-Hindi2Hinglish-Prime-GGML

## Resumen

Whisper Hindi2Hinglish Prime GGML es una conversión cuantizada del modelo de reconocimiento automático del habla (ASR) Oriserve/Whisper-Hindi2Hinglish-Prime, un fine-tune de OpenAI Whisper large-v3 orientado a hindi y habla code-mixed hindi-inglés con salida en hindi romanizado (hinglish). La conversión la ha realizado BuilderHelm (ZenVoice) y se distribuye en formato GGML Q8_0 para su uso con whisper.cpp y con la aplicación ZenVoice en macOS. El objetivo del modelo es transcribir audio en hindi o hinglish escribiendo el hindi en alfabeto latino, evitando un paso separado de transliteración de devanagari a latín.

El modelo hereda la arquitectura completa de Whisper large-v3 (encoder-decoder transformer de aproximadamente 1.550 millones de parámetros, 32 capas de encoder y 32 de decoder, anchura oculta de 1.280 y 128 bins mel), empaquetada en un único fichero `.bin` de 1.656.538.283 bytes (1,66 GB decimales, unos 1,54 GiB). No se ha reentrenado ningún modelo nuevo: se trata exclusivamente de una conversión de pesos y cuantización del fine-tune de Oriserve, cuyo modelo base está fijado en la revisión `f85cf467ac948d8114851f7b1cd57a93f8ef2de2`.

Su relevancia actual es práctica: permite ejecutar localmente, en un Mac con Apple Silicon, un ASR especializado en hinglish sin depender de servicios en la nube ni de pipelines de transliteración adicionales. La licencia Apache 2.0 facilita su integración en productos comerciales, aunque el autor advierte explícitamente de que la precisión de reconocimiento no está garantizada y de que no se han publicado métricas de rendimiento (WER real con micrófono, latencia, throughput o memoria pico) para esta conversión cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3): 32 capas de encoder, 32 de decoder, anchura oculta 1.280, 128 bins mel |
| Parametros totales | Aproximadamente 1,55 mil millones (heredados de Whisper large-v3) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventana de audio de 30 s propia de Whisper; no se detalla en la informacion proporcionada) |
| Tipos de cuantizacion | Q8_0 para los pesos soportados; otros tensores mantienen la precisión requerida por el conversor y el runtime |
| Idiomas soportados | Hindi (hi) e inglés (en), con salida en hindi romanizado (hinglish) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML (`.bin`) para whisper.cpp; tamano del fichero 1.656.538.283 bytes (1,66 GB decimales, ~1,54 GiB) |
| Vocabulario | 51.866 tokens (sin tokenizer personalizado anadido en esta conversion) |
| Modelo base | Oriserve/Whisper-Hindi2Hinglish-Prime (revision f85cf467ac948d8114851f7b1cd57a93f8ef2de2) |
| Runtime verificado | whisper.cpp v1.9.1 sobre Apple Silicon con Metal |
| Libreria | whisper.cpp |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3 sin modificaciones estructurales: un transformer encoder-decoder con 32 capas en cada bloque, anchura oculta de 1.280, 128 bins mel como representación de entrada y un vocabulario de 51.866 tokens. El fine-tune original de Oriserve adapta este modelo base a hindi y habla code-mixed hindi-inglés con salida romanizada; según la model card upstream, se entrenó con aproximadamente 550 horas de audio hindi con acento indio y ruido. Esta conversión no introduce cambios de arquitectura ni un tokenizer propio: solo transforma los pesos al formato GGML y aplica cuantización Q8_0 a los tensores soportados.

No se documentan en la información disponible detalles sobre la composición exacta del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). Tampoco se especifica el procedimiento de conversión más allá de la mención a Python, PyTorch y Transformers para el flujo de trabajo de conversión. El autor subraya que no ha entrenado un modelo nuevo y que el modelo base es el fine-tune de Oriserve, no OpenAI Whisper directamente.

## Capacidades

- Reconocimiento automático del habla (ASR) en hindi e inglés, con salida de hindi en alfabeto latino (hinglish) sin paso separado de transliteración.
- Transcripción de habla code-mixed hindi-inglés, preservando palabras inglesas directamente en la transcripción.
- Transcripción de habla inglesa a texto inglés ordinario (la ortografía y la precisión no están garantizadas según el autor).
- Ejecución local en whisper.cpp y en la aplicación ZenVoice para macOS (macOS 15 o posterior, Apple Silicon recomendado).
- Inferencia offline sin dependencia de servicios en la nube.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de salida ni modo thinking; el modelo es exclusivamente ASR.

## Casos de uso

- Dictado local en macOS: integración en ZenVoice con el perfil de idioma Hinglish y el modelo Hinglish Prime para transcribir dictado en hindi romanizado sin enviar audio a la nube, aprovechando el formato GGML y el soporte de Metal en Apple Silicon.
- Transcripción de reuniones y notas de voz en equipos con hablantes de hindi e inglés: el modelo puede manejar mezcla de idiomas en una misma frase y preservar términos ingleses, útil para actas y resúmenes posteriores.
- Subtitulado de contenido audiovisual indio: generación de subtítulos en hinglish para vídeos, pódcast o formación interna, con la ventaja de que el hindi se escribe en latín y no requiere un paso de transliteración posterior.
- Atención al cliente en centros de contacto con clientes hindi-parlantes: transcripción de llamadas grabadas para control de calidad, análisis de sentimiento o generación de resúmenes, ejecutándose en infraestructura local por motivos de privacidad.
- Investigación lingüística sobre code-switching hindi-inglés: obtención de transcripciones romanizadas directamente comparables con corpus en alfabeto latino, sin necesidad de normalizar devanagari.
- Prototipado y pruebas de pipelines ASR en whisper.cpp: uso del fichero Q8_0 como variante ligera del fine-tune de Oriserve para validar integraciones, comparar con el modelo F16 intermedio o medir el impacto de la cuantización en la precisión.

## Benchmarks y rendimiento

Los únicos datos numéricos disponibles son los WER publicados por Oriserve para el modelo upstream (no miden este fichero Q8_0) y un conjunto limitado de comprobaciones cualitativas de la conversión. No se han publicado resultados de benchmarks de esta conversión cuantizada (WER con micrófono real, latencia, throughput ni memoria pico).

Resultados upstream de Oriserve (WER, menor es mejor, referencias en formato hinglish):

| Dataset | Whisper large-v3 | Oriserve Prime |
|---|---:|---:|
| Common Voice (Hindi) | 61,94 | 32,43 |
| FLEURS (Hindi) | 50,84 | 28,68 |
| Indic Voices (Hindi) | 82,56 | 60,82 |

Comprobaciones de humo registradas con esta conversión (Q8_0, whisper.cpp v1.9.1, Apple Silicon/Metal):

| Entrada | Idioma indicado | Salida registrada |
|---|---|---|
| Clip de Common Voice hindi `common_voice_hi_23796065.mp3` | `hi` | `...Kya iska svaad achchha hai?` |
| TTS hinglish: "Mujhe ye document kal tak complete karna hai, aur presentation bhi ready karni hai" | `hi` y `en` en ejecuciones separadas | `Mujhe yahi document kal tak complete karna hai aur presentation bhi ready karaani hai.` |
| TTS inglés: "Hello, this is a smoke test for the new model integration." | `hi` y `en` en ejecuciones separadas | `Hello, this is a smoke test for the new model integration.` |
| Otra frase TTS code-mixed | `en` | Transcripción parcial con palabras corruptas; también observado con el intermedio F16 |

El autor advierte que estos ejemplos son limitados, no se han vuelto a ejecutar como benchmark y que el último caso no aísla la causa del error ni demuestra que la cuantización no tenga efecto.

## Requisitos de hardware

- VRAM/RAM estimada: no se publica memoria pico. El fichero pesa 1,66 GB, pero el autor advierte explícitamente de que el tamaño del fichero no mide el uso pico de memoria en ejecución; hay que reservar espacio adicional para la memoria de trabajo del runtime.
- GPU recomendadas: no se especifican. Las comprobaciones registradas se hicieron en Apple Silicon con Metal; no hay datos para A100, H100 ni RTX 4090.
- GPU de consumo: no se documenta compatibilidad ni rendimiento en GPUs consumer (RTX 4090, etc.).
- Despliegue: whisper.cpp (build compatible con Whisper large-v3 y GGML Q8_0; verificado con v1.9.1) y la aplicación ZenVoice en macOS 15 o posterior con Apple Silicon recomendado. No se mencionan vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| BuilderHelm/Whisper-Hindi2Hinglish-Prime-GGML | ~1,55 mil millones | No disponible | hi, en (salida hinglish) | Apache 2.0 | GGML Q8_0 | Conversion cuantizada para whisper.cpp; sin benchmarks propios |
| Oriserve/Whisper-Hindi2Hinglish-Prime | ~1,55 mil millones | No disponible | hi, en | No disponible en la informacion proporcionada | Pesos originales (no GGML) | Modelo upstream; WER publicados por Oriserve |
| OpenAI Whisper large-v3 | ~1,55 mil millones | No disponible | Multilingue | No disponible en la informacion proporcionada | Multiples formatos | Referencia de WER en la tabla upstream (61,94 / 50,84 / 82,56) |

No se dispone de datos de otros modelos ASR comparables en la información proporcionada.

## Limitaciones y advertencias

- La precisión de reconocimiento, la ortografía y el sistema de escritura de la salida no están garantizados por el autor.
- No hay benchmarks de esta conversión cuantizada: los WER de la tabla son del modelo upstream y no miden el efecto de la conversión GGML ni de la cuantización Q8_0.
- Se observaron transcripciones parciales con palabras corruptas en frases code-mixed, también con el intermedio F16; la causa no está aislada.
- El modelo está orientado a hindi e inglés; no se documenta soporte para otros idiomas ni para devanagari como salida.
- Riesgo de alucinación y de errores en audio ruidoso o con acentos no representados en las ~550 horas de entrenamiento descritas por el upstream.
- La compatibilidad con versiones de whisper.cpp posteriores a v1.9.1 no está establecida.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantías sobre exactitud ni idoneidad para producción.
- El despliegue verificado es macOS con Apple Silicon; no hay datos de rendimiento en otras plataformas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BuilderHelm/Whisper-Hindi2Hinglish-Prime-GGML
- Modelo base (Oriserve): https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Prime
- Model card del upstream (revisión fijada): https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Prime/blob/f85cf467ac948d8114851f7b1cd57a93f8ef2de2/README.md
- Perfil del autor en Hugging Face: https://huggingface.co/BuilderHelm
- ZenVoice (homepage): https://getzenvoice.com
- ZenVoice (descarga para Mac): https://getzenvoice.com/download
- Repositorio ZenVoice en GitHub: https://github.com/imYashChaudhary973/ZenVoice
- Ficha en free2aitools: https://free2aitools.com/model/builderhelm/whisper-hindi2hinglish-prime-ggml
