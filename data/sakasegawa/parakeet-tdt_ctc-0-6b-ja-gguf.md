# sakasegawa/parakeet-tdt_ctc-0.6b-ja-GGUF

## Resumen

Este repositorio contiene la conversión a formato GGUF del modelo de reconocimiento automático de voz en japonés `nvidia/parakeet-tdt_ctc-0.6b-ja`, publicada por el usuario sakasegawa. El modelo original lo desarrolla NVIDIA y es un FastConformer de aproximadamente 619 millones de parámetros entrenado para transcribir audio en japonés. La conversión no está pensada para llama.cpp ni para herramientas de inferencia de modelos de lenguaje: los ficheros usan un layout propio de speech.cpp, una implementación de inferencia de modelos de voz basada en GGML.

La relevancia de esta ficha está en que permite ejecutar localmente un reconocedor ASR japonés de calidad cercana a NeMo con requisitos de memoria muy reducidos: la cuantización Q4_K ocupa 0,36 GB y necesita unos 0,46 GB de memoria pico para una petición. El modelo decodifica con la cabeza TDT (Token-and-Duration Transducer) de forma equivalente a NeMo, e incluye marcas de tiempo de tokens y segmentos idénticas a las del modelo de referencia.

La licencia es CC-BY-4.0, lo que permite uso comercial con atribución, y el único idioma declarado es japonés. La conversión fue verificada contra los tensores de NeMo sobre utterances del split de test de FLEURS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con cabeza TDT (Token-and-Duration Transducer); incluye frontend, encoder, red de predicción (LSTM), joint y vocabulario |
| Parametros totales | 619.285.606 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K, Q4_K |
| Idiomas soportados | japones (ja) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (layout propio de speech.cpp; no compatible con llama.cpp, LM Studio ni Ollama) |

## Arquitectura y entrenamiento

El modelo base es un FastConformer de NVIDIA, una variante del Conformer con atencion eficiente orientada a audio, acoplada a una cabeza TDT. La decodificacion TDT predice conjuntamente tokens y duraciones, lo que evita el paso autoregresivo por frame típico de los transductores convencionales y reduce la latencia. El repositorio GGUF incluye todas las piezas necesarias en un solo fichero: frontend de características, encoder, red de predicción basada en LSTM, joint y vocabulario. En las cuantizaciones Q6_K, Q5_K y Q4_K, las matrices de la red de predicción y del joint, cuyas filas de 640 valores no forman bloques completos de 256, se mantienen en Q8_0.

La conversión parte de `nvidia/parakeet-tdt_ctc-0.6b-ja` en la revisión `44edb27eea9317daf89333e75eb830db4b1cc298`, pasa por F32 y se cuantiza con el script `reference/fastconformer/convert.py` de speech.cpp, con el entorno fijado a NeMo 3.0.0. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo original.

## Capacidades

- Reconocimiento automático de voz en japonés a partir de audio.
- Decodificacion con cabeza TDT equivalente a la de NeMo por defecto.
- Generacion de marcas de tiempo de tokens y de segmentos, idénticas a las de NeMo (opción `--timestamps`).
- Ejecucion en CPU en F32 y F16, y en GPU mediante Metal y Vulkan.
- Servidor HTTP integrado mediante `speech serve` con API documentada.
- No soporta tool calling, function calling ni razonamiento multi-step: es exclusivamente un modelo ASR.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Transcripcion de reuniones y entrevistas en japonés: el modelo procesa utterances de 6 a 26 segundos con precisión verificada y puede generar marcas de tiempo por segmento para alinear la transcripción con el audio.
- Subtitulado automático de vídeo en japonés: la salida con timestamps permite construir ficheros SRT o VTT directamente desde la línea de comandos de speech.cpp.
- Servicio de dictado local: mediante `speech serve` se puede exponer un endpoint HTTP de reconocimiento en una máquina sin GPU dedicada, con un consumo pico de 0,46 GB en Q4_K.
- Procesamiento por lotes de archivos de audio: el binario `speech asr` acepta ficheros WAV y puede integrarse en scripts para transcribir grandes volúmenes de grabaciones.
- Aplicaciones de accesibilidad: transcripción en tiempo casi real de voz japonesa en dispositivos de gama media, gracias a latencias medianas de 0,052 s en Apple M5 con Metal y 0,040 s en RTX 2080 con Vulkan sobre utterances de test.
- Investigación en ASR japonés: sirve como referencia reproducible para comparar cuantizaciones, ya que el autor publica CER por tipo de fichero sobre Common Voice 8.0.
- Despliegue embebido o en contenedores ligeros: el fichero Q4_K de 0,36 GB cabe en imágenes de contenedor pequeñas y en entornos con memoria limitada.

## Benchmarks y rendimiento

Precisión medida por speech-bench el 2026-10-12 en Apple M5 con Metal, sobre las 4.483 utterances del test japonés de Common Voice 8.0 recortadas a la voz. La memoria indicada es el pico de `speech` para una petición.

| Tipo | Tamano | Memoria | CER | CER con otras grafías aceptadas |
|---|---|---|---|---|
| F16 | 1,24 GB | 1,35 GB | 7,88% | 2,98% |
| Q8_0 | 0,66 GB | 0,77 GB | 7,93% | 3,00% |
| Q6_K | 0,51 GB | 0,62 GB | 7,88% | 3,00% |
| Q5_K | 0,43 GB | 0,53 GB | 7,79% | 2,97% |
| Q4_K | 0,36 GB | 0,46 GB | 7,94% | 3,01% |

Velocidad medida por speech-bench el 2026-10-10 sobre las primeras 100 utterances del test japonés de Common Voice 8.0, en F16, con una petición en caliente cada vez.

| Dispositivo | Mediana | p90 |
|---|---|---|
| Apple M5, Metal | 0,052 s | 0,073 s |
| RTX 2080, Vulkan | 0,040 s | 0,066 s |

Verificación de equivalencia con NeMo: sobre 3 utterances ja_jp de FLEURS de 6 a 26 segundos, CPU en F32 y F16 y Metal producen el texto de NeMo en las tres, con tiempos de tokens y segmentos idénticos.

## Requisitos de hardware

- VRAM o memoria estimada para inferencia: 1,35 GB en F16, 0,77 GB en Q8_0, 0,62 GB en Q6_K, 0,53 GB en Q5_K y 0,46 GB en Q4_K (memoria pico de una petición).
- GPU recomendadas: no se especifican modelos concretos; se han validado Apple M5 con Metal y RTX 2080 con Vulkan.
- Cabe en GPU consumer: sí, cualquier GPU con al menos 1,5 GB de memoria libre puede ejecutar la versión F16; las cuantizaciones Q4_K y Q5_K caben incluso en entornos con menos de 1 GB.
- Opciones de despliegue: exclusivamente speech.cpp 0.7.0 o posterior (Q8_0, Q6_K, Q5_K y Q4_K requieren 0.8.0 o posterior). No es compatible con llama.cpp, LM Studio, Ollama, vLLM ni TGI.
- Latencia y throughput: mediana de 0,052 s y p90 de 0,073 s en Apple M5 con Metal; mediana de 0,040 s y p90 de 0,066 s en RTX 2080 con Vulkan, en F16. No se publican datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| sakasegawa/parakeet-tdt_ctc-0.6b-ja-GGUF | 619 M | no disponible | ja | CC-BY-4.0 | GGUF para speech.cpp |
| nvidia/parakeet-tdt_ctc-0.6b-ja | 619 M | no disponible | ja | no disponible en la informacion proporcionada | NeMo |
| Otros ASR japoneses de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo reconoce japonés; el campo `language` de una petición se limita a comprobarse contra `ja`.
- Los ficheros GGUF usan el layout propio de speech.cpp y no pueden cargarse en llama.cpp, LM Studio, Ollama ni otras herramientas que leen GGUF.
- Las cuantizaciones Q8_0, Q6_K, Q5_K y Q4_K exigen speech.cpp 0.8.0 o posterior; los ficheros F16 funcionan desde 0.7.0.
- El CER base ronda el 7,8-7,9% en Common Voice 8.0, por lo que sigue siendo necesario un paso de revisión humana en produccion.
- No se dispone de información sobre sesgos del modelo original ni sobre su comportamiento con acentos, ruido o audio fuera de dominio.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución tanto a NVIDIA como al autor de la conversión.
- No hay datos publicados sobre alucinaciones, limites de duración de audio por petición ni rendimiento multihilo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sakasegawa/parakeet-tdt_ctc-0.6b-ja-GGUF
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt_ctc-0.6b-ja
- speech.cpp: https://github.com/nyosegawa/speech.cpp
- Instalacion de speech.cpp: https://github.com/nyosegawa/speech.cpp#install
- Documentacion FastConformer en speech.cpp: https://github.com/nyosegawa/speech.cpp/blob/main/docs/models/fastconformer.md
- Documentacion de linea de comandos: https://github.com/nyosegawa/speech.cpp/blob/main/docs/cli.md
- Documentacion del servidor: https://github.com/nyosegawa/speech.cpp/blob/main/docs/server.md
