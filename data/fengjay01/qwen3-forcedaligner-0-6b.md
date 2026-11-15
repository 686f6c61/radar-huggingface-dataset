# fengjay01/Qwen3-ForcedAligner-0.6B

## Resumen

Qwen3-ForcedAligner-0.6B es un modelo de alineamiento forzado (forced alignment) desarrollado por el equipo Qwen de Alibaba, publicado como parte de la familia Qwen3-ASR junto a los modelos de reconocimiento de voz Qwen3-ASR-1.7B y Qwen3-ASR-0.6B. Su funcion no es transcribir audio, sino predecir marcas temporales (timestamps) precisas para unidades arbitrarias del texto (palabras, caracteres o fonemas) sobre un segmento de audio de hasta 5 minutos. Resuelve un problema clasico en pipelines de subtitulado, doblaje y anotacion fonetica: obtener la sincronizacion exacta entre habla y transcripcion sin depender de modelos de alineamiento end-to-end tradicionales.

El modelo se apoya en la base multimodal Qwen3-Omni y emplea una arquitectura de inferencia no autorregresiva (NAR), lo que le permite procesar la alineacion en una sola pasada y reduce la latencia frente a aproximaciones autoregresivas. Cubre 11 idiomas (chino, ingles, cantonés, frances, aleman, italiano, japones, coreano, portugues, ruso y espanol) y, segun la model card, supera en precision de timestamps a los modelos de alineamiento forzado end-to-end existentes.

La relevancia actual del modelo radica en que se distribuye con licencia Apache 2.0 y se integra en el toolkit oficial `qwen-asr`, que soporta backends de transformers y vLLM, inferencia por lotes, servicio asincrono y streaming. Esto lo convierte en una pieza utilizable en produccion para cualquier flujo que requiera subtitulos sincronizados o segmentacion temporal de audio a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen3-Omni con cabecera de alineamiento no autorregresiva (NAR) |
| Parametros totales | 917.728.896 (~0,92 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (soporta audio de hasta 5 minutos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Chino, ingles, cantonés, frances, aleman, italiano, japones, coreano, portugues, ruso y espanol (11) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,8 GB |
| Modo de inferencia | NAR (no autorregresivo) |
| Tipo de audio soportado | Voz (speech) |

## Arquitectura y entrenamiento

La model card describe el modelo como parte de la familia Qwen3-ASR, construida sobre la capacidad de comprension de audio del modelo fundacional Qwen3-Omni. Para el alineamiento forzado se emplea una arquitectura de inferencia no autorregresiva (NAR), que predice directamente las marcas temporales de las unidades del texto en lugar de generarlas token a token. El modelo acepta como entrada el audio y la transcripcion correspondiente, y devuelve los timestamps de cada unidad solicitada.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card indica que la familia Qwen3-ASR se beneficia de "datos de entrenamiento de voz a gran escala" y que el alineador supera en precision a los modelos de alineamiento forzado end-to-end en las evaluaciones realizadas por el equipo. El modelo se distribuye con un toolkit de inferencia (`qwen-asr`) que soporta los backends de transformers y vLLM, ademas de FlashAttention 2 para reducir el uso de memoria en entradas largas.

## Capacidades

- Prediccion de timestamps (alineamiento forzado) para unidades arbitrarias del texto: palabras, caracteres o fonemas.
- Procesamiento de segmentos de audio de hasta 5 minutos en una sola pasada.
- Soporte multilingue en 11 idiomas: chino, ingles, cantonés, frances, aleman, italiano, japones, coreano, portugues, ruso y espanol.
- Inferencia no autorregresiva (NAR), orientada a latencia baja y procesamiento por lotes.
- Integracion con el toolkit oficial `qwen-asr` con backends de transformers y vLLM.
- Compatibilidad con inferencia por lotes y servicio asincrono a traves del ecosistema Qwen3-ASR.
- No realiza reconocimiento de voz por si mismo: requiere una transcripcion previa (por ejemplo, generada por Qwen3-ASR-0.6B o Qwen3-ASR-1.7B).
- No soporta tool calling ni capacidades de agente; su alcance es exclusivamente el alineamiento temporal de audio y texto.

## Casos de uso

- Generacion de subtitulos sincronizados: dado un audio y su transcripcion, el modelo devuelve los timestamps de cada palabra o frase, lo que permite construir ficheros SRT/VTT con sincronizacion precisa para plataformas de video.
- Doblaje y localizacion: en pipelines de doblaje se necesita saber exactamente cuando empieza y termina cada intervencion; el alineador proporciona esos limites para ajustar la duracion de las locuciones dobladas.
- Anotacion fonetica y linguistica: investigadores pueden alinear transcripciones fonemicas con la senal de audio para construir corpus anotados temporalmente, algo habitual en estudios de prosodia y fonetica.
- Indexacion y busqueda de audio: al disponer de timestamps por palabra, es posible crear indices que permitan saltar al instante exacto de una palabra en un archivo de audio largo (podcasts, reuniones, clases).
- Control de calidad de transcripciones ASR: comparar los timestamps predichos con los de una transcripcion automatica ayuda a detectar desalineaciones y errores de segmentacion en sistemas de reconocimiento de voz.
- Segmentacion para entrenamiento de modelos TTS: los sistemas de sintesis de voz necesitan pares audio-texto alineados a nivel de palabra o fonema; el alineador automatiza la construccion de estos datasets.
- Karaoke y sincronizacion musical: aunque el modelo esta orientado a voz, puede emplearse para alinear letras transcritas con segmentos de audio cantado en los idiomas soportados, siempre que se disponga de la transcripcion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card afirma que la precision de timestamps del Qwen3-ForcedAligner-0.6B supera a la de los modelos de alineamiento forzado end-to-end, pero no se incluyen tablas con valores concretos (por ejemplo, error medio absoluto en milisegundos) ni comparaciones cuantitativas con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~0,92 B parametros en safetensors (1,8 GB en el repositorio), la inferencia en fp16 requiere aproximadamente 2 GB de pesos mas el overhead de activaciones y del encoder de audio; en la practica, entre 4 y 8 GB de VRAM suele ser suficiente para lotes pequenos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo; para procesamiento por lotes a gran escala se recomiendan A100, H100 o L40S.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: paquete oficial `qwen-asr` con backend de transformers o de vLLM; se recomienda FlashAttention 2 para entradas largas y lotes grandes. No se documenta soporte nativo de llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponibles para este modelo concreto; la model card solo menciona que la version ASR de 0,6 B alcanza 2000 veces throughput con concurrencia 128, dato que no es directamente extrapolable al alineador.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Modo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ForcedAligner-0.6B | ~0,92 B | 11 | NAR | Apache 2.0 | Hugging Face, ModelScope |
| Qwen3-ASR-0.6B | 0,6 B | 30 idiomas + 22 dialectos chinos | Offline / Streaming | Apache 2.0 | Hugging Face, ModelScope |
| Qwen3-ASR-1.7B | 1,7 B | 30 idiomas + 22 dialectos chinos | Offline / Streaming | Apache 2.0 | Hugging Face, ModelScope |

Los modelos Qwen3-ASR realizan reconocimiento de voz, mientras que el ForcedAligner se especializa en timestamps; se incluyen en la comparativa por pertenecer a la misma familia y compartir toolkit de inferencia. No se dispone de informacion sobre otros alineadores forzados comparables (por ejemplo, Montreal Forced Aligner o WhisperX) en la documentacion proporcionada, por lo que no se ofrece comparacion cuantitativa con ellos.

## Limitaciones y advertencias

- El modelo no transcribe audio: necesita una transcripcion previa para alinear; no sustituye a un ASR.
- Solo admite voz como tipo de audio; no esta disenado para musica con fondo musical ni para canto, a diferencia de los modelos ASR de la familia.
- Cobertura limitada a 11 idiomas; no incluye dialectos chinos ni muchos idiomas presentes en los modelos ASR de la familia.
- Limite de 5 minutos de audio por segmento; para audios mas largos es necesario trocear y gestionar los desplazamientos de tiempo.
- No se han publicado datos sobre sesgos, tasas de alucinacion ni robustez frente a ruido en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del repositorio original `Qwen/Qwen3-ForcedAligner-0.6B` (este repositorio es un espejo de `fengjay01`).
- El repositorio consultado tiene 0 descargas y 0 likes, lo que sugiere que es una copia no oficial; para produccion conviene usar el repositorio oficial de Qwen.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ) en la informacion disponible.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/fengjay01/Qwen3-ForcedAligner-0.6B
- Repositorio oficial en Hugging Face: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Repositorio oficial en ModelScope: https://modelscope.cn/models/Qwen/Qwen3-ForcedAligner-0.6B
- Repositorio GitHub del toolkit: https://github.com/QwenLM/Qwen3-ASR
- Paper de referencia citado en los tags: arXiv:2601.21337 (https://arxiv.org/abs/2601.21337)
- Imagen de introduccion de la familia: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-ASR-Repo/qwen3_asr_introduction.png
- Diagrama de arquitectura: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-ASR-Repo/overview.jpg
