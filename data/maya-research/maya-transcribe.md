# maya-research/maya-transcribe

## Resumen

Maya Transcribe es un modelo de reconocimiento automatico del habla (ASR) especializado en hindi y en code-switching hindi-ingles (hinglish), desarrollado por maya-research. Se trata de un fine-tuning del checkpoint Qwen/Qwen3-ASR-0.6B-hf, por lo que hereda la arquitectura multimodal de Qwen3-ASR (encoder de audio mas decoder de lenguaje) y anade un ajuste especifico sobre datos de hindi y habla mezclada. Con 782.426.112 parametros (incluido el encoder de audio) y pesos en BF16 de 1,56 GB, es un modelo compacto pensado para ejecucion local y despliegue en produccion con coste contenido.

El modelo resuelve un problema concreto: la transcripcion fiable de audio en hindi, incluidos acentos regionales, audio ruidoso y llamadas telefonicas, asi como la transcripcion de habla que alterna hindi y palabras en ingles. Ofrece dos formatos de salida seleccionables: Devanagari nativo (con palabras inglesas transliteradas) o script mixto (palabras inglesas en alfabeto latino), lo que facilita su integracion en pipelines de subtitulado, agentes de voz y sistemas de atencion al cliente.

Su relevancia actual radica en que combina un tamano reducido (apto para GPU de consumo) con resultados competitivos en el leaderboard Hindi STT de Voice of India (5,85% OI-WER, puesto 3 entre 11 modelos de codigo abierto en el momento de la publicacion) y en que declara soporte de inferencia en streaming a traves de un backend de serving compatible, algo poco habitual en modelos ASR de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (encoder de audio + decoder de lenguaje, familia transformer multimodal) |
| Parametros totales | 782.426.112 (incluye encoder de audio; 611 tensores) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (entrada de audio de hasta 30 segundos por clip; `max_new_tokens` configurable, por defecto 512) |
| Tipos de cuantizacion | pesos publicados en BF16; no se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ) en la informacion disponible |
| Idiomas soportados | hindi y code-switching hindi-ingles (hinglish) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, 1,56 GB) |

## Arquitectura y entrenamiento

Maya Transcribe es un fine-tuning del modelo Qwen3-ASR-0.6B. La arquitectura Qwen3-ASR combina un encoder de audio con un decoder de lenguaje de la familia Qwen3; el checkpoint completo almacena 782.426.112 elementos de parametros en 611 tensores, incluyendo el encoder. La entrada es audio mono a 16 kHz con una duracion maxima de 30 segundos por clip; los audios mas largos deben segmentarse antes de la transcripcion. La inferencia se realiza de forma nativa con Transformers (checkpoint guardado con la version 5.20.2 de la libreria) y el CLI oficial aplica decodificacion greedy, downmix de estereo, remuestreo a 16 kHz y seleccion automatica de CUDA, Apple MPS o CPU.

La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset de ajuste fino ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible. Si se documenta que el modelo admite dos estilos de salida controlados mediante prompt (`style: native` y `style: mixed`), que el backend de serving compatible puede explotar el soporte de streaming de la arquitectura, y que el checkpoint incluye una bandera en la salida JSON del CLI para detectar generaciones truncadas por limite de tokens. El autor declara un proceso de seleccion de checkpoint y una evaluacion propia sobre cuatro modelos de su release, con una metodologia descrita en la seccion "release evaluation" de la model card.

## Capacidades

- Transcripcion de voz a texto en hindi con salida en Devanagari.
- Reconocimiento de code-switching hindi-ingles (hinglish), con dos formatos de salida: Devanagari nativo (palabras inglesas transliteradas) o script mixto (palabras inglesas en alfabeto latino).
- Robustez declarada frente a audio ruidoso, acentos regionales (dataset Lahaja) y audio telefonico (dataset Gram Vaani).
- Soporte de inferencia en streaming a traves de un backend de serving compatible (la arquitectura lo permite; la model card remite a notas de integracion).
- Ejecucion local en CUDA, Apple MPS o CPU mediante Transformers, sin dependencia de APIs externas.
- Interfaz de linea de comandos incluida (`transcribe.py`) con salida JSON y deteccion de truncamiento por limite de tokens.
- No se documentan capacidades de traduccion, diarizacion de hablantes, deteccion de idioma automatica ni tool calling en la informacion disponible.

## Casos de uso

- Agentes de voz en hindi: el modelo transcribe en tiempo real las intervenciones del usuario (soporte de streaming via backend compatible) para alimentar el bucle de dialogo de un agente conversacional telefonico o web, con un coste de inferencia bajo gracias a sus 782 M de parametros.
- Atencion al cliente en centros de llamadas: transcripcion de audio telefonico en hindi, un escenario cubierto explicitamente por la evaluacion en Gram Vaani (19,94% WER), para generar registros textuales, analitica de calidad y busqueda sobre conversaciones.
- Subtitulado y transcripcion de contenido multimedia: generacion de subtitulos en Devanagari o script mixto para videos, podcasts y formacion interna en hindi, segmentando el audio en clips de hasta 30 segundos.
- Transcripcion de reuniones con habla mixta hindi-ingles: equipos que alternan ambos idiomas en la misma frase pueden usar `style: mixed` para conservar los terminos tecnicos en ingles en alfabeto latino, lo que reduce la correccion manual posterior.
- Procesamiento por lotes en infraestructura propia: al ser un modelo Apache-2.0 de 1,56 GB en BF16, puede desplegarse en una unica GPU de consumo o incluso en CPU/MPS para transcripciones por lotes de bajo volumen sin costes de API.
- Investigacion en ASR de code-switching: sirve como linea base reproducible y abierta para experimentos sobre hinglish, acentos regionales y audio ruidoso, con pesos y pipeline estandar de Transformers.
- Integracion en aplicaciones de accesibilidad: dictado y transcripcion local en hindi para usuarios que requieren privacidad de datos, ya que el modelo se ejecuta integramente en la maquina del usuario.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente, `verified: false` en el model-index):

| Dataset | Condicion | WER (%) |
|---|---|---|
| Kathbath (Hindi test) | Hindi estandar | 9,36 |
| Kathbath noisy (Hindi test) | Audio ruidoso | 10,01 |
| FLEURS (hi_in test) | Hindi | 10,72 |
| Common Voice (Hindi test) | Hindi | 11,54 |
| MUCS (Hindi test) | Hindi | 9,67 |
| Lahaja (Hindi accents test) | Acentos regionales | 11,50 |
| MUCS code-switching (Hindi-English test) | Code-switching | 16,97 |
| Gram Vaani (Hindi phone-call test) | Audio telefonico | 19,94 |

El autor declara ademas un 5,85% OI-WER en el leaderboard Hindi STT de Voice of India (puesto 3 entre 11 modelos de codigo abierto y 10 de 32 en total, consultado el 3 de noviembre de 2026) y un macro-average WER del 12,47% en ocho condiciones de test hindi y hindi-ingles, el mejor de los cuatro modelos de su release segun su propia evaluacion. No se han publicado en la informacion disponible resultados comparativos con otros modelos en los benchmarks de la tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB en BF16 (pesos de 1,56 GB mas activaciones y cache del encoder de audio); menos de 2 GB con cuantizacion a 8 bits si se aplica fuera de los pesos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16, como RTX 3060, RTX 4060, RTX 4090, A100 o H100; el modelo no requiere GPU de datacenter.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual (RTX 30xx/40xx, Apple Silicon via MPS) e incluso en CPU para volumenes bajos.
- Opciones de despliegue: Transformers nativo (con `AutoProcessor` y `AutoModelForMultimodalLM`), CLI incluido en el repositorio y backend de serving compatible con streaming segun la model card; no se documentan integraciones oficiales con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La decodificacion es greedy y la generacion esta limitada por `max_new_tokens` (512 por defecto).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Contexto / entrada | Notas |
|---|---|---|---|---|---|
| Maya Transcribe | 782 M | Hindi, hinglish | Apache-2.0 | Audio de hasta 30 s | Fine-tuning de Qwen3-ASR-0.6B; WER declarado 9,36-19,94% segun condicion |
| Qwen3-ASR-0.6B (modelo base) | ~0,6 B | Multilingue (segun Qwen) | no disponible en la informacion | no disponible | Base del fine-tuning; sin datos de WER hindi en la informacion disponible |
| Alternativas ASR open source para hindi (p. ej. Whisper, IndicWhisper) | no disponible | Hindi y multilingue | no disponible | no disponible | No se dispone de resultados comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse sobre hindi y hinglish, el rendimiento fuera de ese par de idiomas no esta garantizado.
- Riesgo de alucinacion: como todo modelo generativo de ASR, puede producir texto plausible no presente en el audio, especialmente en segmentos ruidosos o con habla solapada; el WER del 19,94% en audio telefonico indica una tasa de error elevada en ese dominio.
- Limite de entrada: los clips deben durar como maximo 30 segundos y estar en mono a 16 kHz; el CLI rechaza entradas mas largas, por lo que es necesario segmentar previamente.
- Truncamiento de salida: la generacion esta limitada por `max_new_tokens` (512 por defecto); el CLI expone una bandera en el JSON para detectar transcripciones truncadas, que debe monitorizarse en produccion.
- Idiomas: solo hindi y code-switching hindi-ingles; no se declara soporte para otras lenguas de la India ni para traduccion a ingles.
- Licencia: Apache-2.0 permite uso comercial, pero los benchmarks del autor estan marcados como no verificados y el leaderboard citado es una consulta puntual (3 de noviembre de 2026) que puede variar.
- Despliegue: el soporte de streaming depende de un backend de serving compatible no especificado en detalle; conviene validar la integracion antes de comprometerse con un caso de uso en tiempo real.
- Madurez: el repositorio tiene 349 descargas y 1 like en el momento de la consulta, y el modelo se publico el 2 de noviembre de 2026, por lo que la validacion comunitaria es todavia escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maya-research/maya-transcribe
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B-hf
- Leaderboard Hindi STT de Voice of India: https://voiceofindia.ai/stt
- Dataset Kathbath: https://huggingface.co/datasets/ai4bharat/kathbath
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Common Voice: https://huggingface.co/datasets/mozilla-foundation/common_voice
- Dataset Lahaja: https://huggingface.co/datasets/ai4bharat/lahaja
