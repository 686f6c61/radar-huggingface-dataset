# alphaedge-ai/whisper-base-sna-16384

## Resumen

whisper-base-sna-16384 es una variante podada (*trimmed*) de openai/whisper-base, el modelo de reconocimiento automatico del habla (ASR) publicado por OpenAI en 2022. La desarrolla el usuario alphaedge-ai aplicando la tecnica de *trimming* de vocabulario descrita por Loick Bourdois y colaboradores en Hugging Face, que consiste en reducir el vocabulario del tokenizer eliminando los tokens no utilizados para un idioma concreto y recortar en consecuencia las matrices de embedding y de proyeccion de salida. En este caso el idioma objetivo es el shona (`sn`), una lengua bantu hablada principalmente en Zimbabue.

El resultado es un modelo un 25,02 % mas pequeno en parametros (54.427.648 frente a 72.593.920 del original) y con un vocabulario un 68,41 % menor (16.384 tokens frente a 51.865). La arquitectura subyacente es la de Whisper: un transformer encoder-decoder con entradas de audio convertidas en espectrogramas log-Mel de 80 canales y ventanas de 30 segundos, con 6 capas de encoder y 6 de decoder en la variante *base*.

La relevancia practica es acotada pero clara: reduce el peso del modelo y la memoria necesaria para servir transcripcion en shona, un idioma con pocos recursos para el que los modelos ASR genericos suelen tener un rendimiento inferior. El precio es una perdida casi total de capacidad multilingue, ya que los tokens de otros idiomas se han eliminado del vocabulario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), 6 capas de encoder y 6 de decoder, espectrograma log-Mel de 80 canales |
| Parametros totales | 54.427.648 (original: 72.593.920) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos (limite arquitectonico de Whisper); no disponible en tokens de texto |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser safetensors en transformers se puede convertir a fp16, int8 o GGUF con herramientas externas |
| Idiomas soportados | shona (`sn`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda integramente la arquitectura Whisper de OpenAI: un encoder que procesa espectrogramas log-Mel de 80 canales calculados sobre ventanas de 30 segundos a 16 kHz, y un decoder autorregresivo que genera tokens de transcripcion. La variante *base* cuenta con 6 capas en cada bloque, atencion multi-cabeza estandar y un vocabulario BPE que en el modelo original asciende a 51.865 tokens, incluyendo tokens especiales de idioma, tarea y marcas de tiempo.

La unica modificacion respecto al original es el podado del vocabulario a 16.384 tokens. Segun la model card, la seleccion de tokens se hizo minando 80.003 textos del dataset lbourdois/fineweb-2-trimming, presumiblemente filtrando por idioma shona, y conservando los tokens que aparecen en ese corpus junto con los especiales. Las matrices `embed_tokens` del decoder y la proyeccion de salida se recortan a ese nuevo tamano, lo que explica la reduccion de 18,1 millones de parametros. No se ha realizado ningun reentrenamiento ni ajuste fino adicional segun la informacion disponible: el modelo conserva los pesos del original en las filas conservadas.

No se documenta en la informacion proporcionada ningun proceso de RLHF, DPO ni ajuste especifico sobre datos de shona. Tampoco se detalla la composicion exacta del corpus de minado mas alla del numero de textos.

## Capacidades

- Transcripcion de voz a texto en shona, con soporte de marcas de tiempo si se activan en `generate_kwargs`.
- Traduccion de voz a texto al ingles mediante la tarea `translate` de Whisper (siempre que los tokens necesarios no hayan sido eliminados del vocabulario podado; no verificado en la informacion disponible).
- Procesamiento de audio de hasta 30 segundos por ventana; para audios mas largos es necesario trocear o usar el modo *long-form* del pipeline de transformers.
- Robustez a ruido y acentos heredada del entrenamiento a gran escala de Whisper (680.000 horas de audio segun el paper original).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- Capacidad multilingue practicamente nula: solo shona.
- No dispone de modo *thinking*, vision ni audio generativo.

## Casos de uso

- Transcripcion de reuniones y entrevistas en shona: el modelo procesa ventanas de 30 segundos y puede encadenarse con un segmentador VAD para audios largos, reduciendo coste de almacenamiento y de GPU frente a whisper-base completo.
- Subtitulado automatico de contenido audiovisual en shona: activando `return_timestamps=True` en el pipeline se obtienen marcas temporales utiles para generar ficheros SRT.
- Servicio de dictado o notas de voz en aplicaciones moviles o de mensajeria para usuarios de Zimbabue y la diaspora, donde el modelo cabe en dispositivos con poca memoria gracias a sus 54 millones de parametros.
- Investigacion linguistica y documentacion de lenguas bantu: permite transcribir corpus orales de shona a gran escala con un coste computacional bajo.
- Preprocesado para pipelines de NLP en shona: transcripcion de audio como paso previo a analisis de sentimiento, resumen o indexacion de contenido hablado.
- Despliegue en entornos con recursos limitados (edge, CPU, Raspberry Pi o GPUs de gama baja) donde whisper-base completo resulta excesivo en memoria.
- Moderacion de contenido en plataformas de audio de comunidades shona-parlantes, transcribiendo y filtrando automaticamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo afirma que el modelo podado "deberia rendir de forma similar al original" en shona, sin aportar cifras de WER (word error rate) ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,22 GB de pesos; en fp16, unos 0,11 GB. El cuello de botella real es el buffer de activaciones y el procesado de espectrogramas, no los pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, GTX 1650, e incluso en CPU con latencia aceptable para audios cortos.
- GPU recomendadas para produccion con concurrencia: A10G, L4, T4 o RTX 4090; para alto throughput, A100 o H100 con batching.
- Despliegue: transformers (`pipeline` de `automatic-speech-recognition`), vLLM no aplica (no es un modelo de lenguaje), TGI no soporta ASR de forma nativa, y llama.cpp/Ollama requieren conversion a GGUF con herramientas de la comunidad (no verificada su disponibilidad para este modelo concreto).
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera un throughput muy superior a whisper-base completo en la misma GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-base-sna-16384 | 54,4 M | 16.384 | shona | Apache 2.0 | Podado, sin reentrenamiento |
| openai/whisper-base | 72,6 M | 51.865 | 99 idiomas | Apache 2.0 | Modelo original, mas pesado y multilingue |
| openai/whisper-small | 244 M | 51.865 | 99 idiomas | Apache 2.0 | Mayor precision a costa de ~4,5x mas parametros |
| openai/whisper-tiny | 39 M | 51.865 | 99 idiomas | Apache 2.0 | Mas ligero pero menor calidad ASR |

No se dispone de datos de rendimiento comparativo (WER) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- El podado de vocabulario elimina tokens de otros idiomas: el modelo no es util para transcribir audio que no sea shona, y podria degradarse incluso en shona si aparecen prestamos lexicos o nombres propios con tokens eliminados.
- No se ha reentrenado ni ajustado sobre datos de shona: el rendimiento depende enteramente de la cobertura previa de Whisper en ese idioma, que en el modelo original es limitada.
- Riesgo de alucinacion: como todos los modelos Whisper, puede generar texto plausible en silencios o audio ruidoso, especialmente en idiomas de bajos recursos.
- Sesgos: heredados del corpus de entrenamiento de Whisper (audio mayoritariamente en ingles y de dominios concretos), lo que puede infrarepresentar variedades dialectales del shona.
- Limite de 30 segundos por ventana: audios mas largos requieren segmentacion manual o el modo long-form, con riesgo de errores en las fronteras.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de calidad ni soporte.
- Comunidad muy reducida (56 descargas, 0 likes en el momento de la consulta) y sin evaluaciones independientes: no se recomienda para produccion sin validacion previa sobre un corpus propio.
- El repo tiene solo 0,1 GB y no se documentan conversiones a GGUF u otros formatos; el despliegue fuera de transformers requiere trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-base-sna-16384
- Modelo base: https://huggingface.co/openai/whisper-base
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
