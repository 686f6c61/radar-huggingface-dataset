# lspohn/Voxtral-Mini-4B-Realtime-2602-Selective-GGUF

## Resumen

Voxtral Mini 4B Realtime 2602 Selective GGUF es una cuantizacion selectiva en formato GGUF del modelo de reconocimiento de voz en tiempo real Voxtral Mini 4B Realtime 2602 de Mistral AI, publicada por el desarrollador Lucas Spohn (Idana AG). El repositorio no contiene un modelo nuevo, sino dos mezclas de pesos del decodificador optimizadas para inferencia en llama.cpp sobre GPUs Vulkan, en concreto evaluadas en una Radeon RX 9070 XT. El objetivo es reducir el peso del decodificador manteniendo la mayor parte de la calidad de la referencia Q8_0, de modo que el modelo completo quepa con margen en GPUs de consumo y pueda atender a varios clientes simultaneos.

El modelo base resuelve la transcripcion de audio a texto con latencia baja, orientada a flujos conversacionales y a recognition en streaming. La contribucion de esta publicacion es una estrategia de cuantizacion selectiva: en lugar de cuantizar uniformemente todo el decodificador, se sustituyen unicamente determinadas proyecciones (Up y Gate) por Q4_K o Q6_K, dejando el resto de pesos cerca de Q8. El proyector de audio BF16 se comparte entre variantes y ocupa aproximadamente 1,99 GB.

La relevancia actual es practica: ofrece una ruta reproducible para desplegar ASR de ~3,4 mil millones de parametros en hardware AMD con Vulkan, con mediciones de pico de memoria y una metodologia de evaluacion publicada. El repositorio tiene cero descargas y cero likes en el momento de la consulta, y la informacion disponible sobre capacidades, benchmarks y limitaciones es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para ASR en tiempo real (Voxtral Realtime), con encoder de audio y decodificador de lenguaje; cuantizacion selectiva de pesos del decodificador |
| Parametros totales | 3.434.118.144 (~3,43 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF con mezcla selectiva: variante Up Q4_K (26 proyecciones Up en Q4_K) y variante Up Q4_K + Gate Q6_K (26 Up en Q4_K y 26 Gate en Q6_K); referencia upstream Q8_0; proyector de audio en BF16 |
| Idiomas soportados | No disponible (la evaluacion menciona una transcripcion en aleman, pero no se declara una lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Voxtral Mini 4B Realtime 2602 es un sistema de reconocimiento automatico del habla de Mistral AI disenado para operar en tiempo real. La arquitectura combina un encoder de audio con un decodificador de lenguaje; en esta publicacion el encoder se mantiene en F16 y el decodificador usa politicas de precision explicitas (F16 para claves y valores, politica No-A8 para el decodificador). Los pesos del decodificador se almacenan en Q4_K y Q6_K segun la variante, mientras que el proyector de audio se mantiene en BF16 y se comparte entre ambas mezclas.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada. La innovacion tecnica de esta publicacion es la cuantizacion selectiva: se identifican 26 proyecciones Up (y opcionalmente 26 Gate) como candidatas a cuantizacion agresiva, preservando el resto de la red cerca de Q8. La calibracion se realizo con estadisticas de 64 clips publicos de FLEURS. La evaluacion se llevo a cabo con llamadas cerradas exploratorias de corta duracion sobre un runtime llama.cpp Vulkan parcheado; una variante mas agresiva (Down-Q6) fue descartada porque produjo una transcripcion vacia en aleman.

## Capacidades

- Reconocimiento automatico del habla (ASR) en tiempo real, orientado a flujos conversacionales.
- Transcripcion de audio a texto con latencia baja, adecuada para streaming.
- Inferencia en llama.cpp sobre backend Vulkan, con soporte para GPUs AMD.
- Cuantizacion selectiva que permite reducir el decodificador a 3,290 GB (Up Q4_K) o 3,111 GB (Up Q4_K + Gate Q6_K) frente a 3,658 GB de la referencia Q8_0.
- Soporte de multiples clientes concurrentes: la evaluacion mide picos de memoria con 16 clientes simultaneos.
- No se dispone de informacion sobre tool calling, function calling, capacidades de agente, vision, audio de salida ni modo de razonamiento explicito en la informacion proporcionada.

## Casos de uso

- Transcripcion de reuniones y llamadas en tiempo real: el modelo esta disenado para ASR de baja latencia, por lo que puede alimentar paneles de subtitulos en vivo o actas automaticas mientras la conversacion esta en curso.
- Subtitulado en directo para streaming: al operar sobre llama.cpp con Vulkan, puede desplegarse en estaciones con GPU AMD de consumo y generar subtitulos en un pipeline continuo de audio.
- Asistentes de voz conversacionales: la orientacion a flujos conversacionales permite integrar el modelo como etapa de reconocimiento en un asistente que encadene turnos de habla.
- Despliegue en hardware AMD con Vulkan: la variante Up Q4_K reduce el decodificador a 3,290 GB y el pico de memoria con 16 clientes a 10,597 GiB, lo que la hace adecuada para servidores modestos con GPU Radeon.
- Servicio multiusuario de transcripcion: las mediciones con 16 clientes concurrentes permiten dimensionar un endpoint de ASR compartido con un presupuesto de memoria conocido (10,434-10,597 GiB de pico segun variante).
- Evaluacion y experimentacion en entornos de investigacion: el repositorio de benchmarks y el manifest con digests SHA-256 permiten reproducir la comparacion entre variantes de cuantizacion en un runtime fijado.
- Integracion en pipelines de accesibilidad: transcripcion de audio en vivo para personas con discapacidad auditiva en entornos donde se dispone de GPU AMD.

## Benchmarks y rendimiento

La informacion proporcionada incluye mediciones de memoria y tamano de pesos, pero no resultados de benchmarks de calidad (WER, MMLU, etc.).

| Variante | Pesos modificados | Tamano del decodificador | Pico con 16 clientes |
|---|---|---:|---:|
| Up Q4_K | 26 proyecciones Up | 3,290 GB | 10,597 GiB |
| Up Q4_K + Gate Q6_K | 26 Up y 26 Gate | 3,111 GB | 10,434 GiB |
| Referencia Q8_0 upstream | Referencia | 3,658 GB | 10,942 GiB |

No se han publicado resultados de benchmarks de calidad (por ejemplo, WER) en la informacion disponible. El autor indica que el rendimiento (throughput) no cambio de forma efectiva en la comparacion final de la variante Up Q4_K + Gate Q6_K, y que los picos de memoria incluyen otros servicios de GPU.

## Requisitos de hardware

- VRAM estimada: el decodificador ocupa 3,290 GB (Up Q4_K) o 3,111 GB (Up Q4_K + Gate Q6_K), mas aproximadamente 1,99 GB del proyector de audio BF16. Los picos medidos con 16 clientes son de 10,597 GiB y 10,434 GiB respectivamente, incluyendo otros servicios de GPU.
- GPU evaluada: Radeon RX 9070 XT con runtime llama.cpp Vulkan parcheado.
- GPU recomendadas: no se especifican modelos NVIDIA en la informacion proporcionada; el autor menciona una ruta separada para NVIDIA mediante un checkpoint NVFP4 para vLLM (SM120).
- Cabe en GPU de consumo: si, segun la evaluacion en Radeon RX 9070 XT; no se detallan otros modelos de consumo.
- Opciones de despliegue: llama.cpp con backend Vulkan (runtime parcheado y flags fijados en el repositorio de benchmarks); para NVIDIA existe una ruta vLLM separada con el checkpoint NVFP4.
- Latencia y throughput: no se proporcionan cifras concretas de latencia o throughput; el autor senala que el throughput fue practicamente identico entre la variante Up Q4_K + Gate Q6_K y la referencia en la comparacion final.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Voxtral Mini 4B Realtime 2602 Selective GGUF (esta publicacion) | ~3,43 mil millones | No disponible | GGUF (llama.cpp, Vulkan) | Apache 2.0 | Hugging Face, 0 descargas |
| Voxtral Mini 4B Realtime 2602 (base, Mistral AI) | No disponible en la informacion | No disponible | No disponible | Apache 2.0 (heredada) | Hugging Face (mistralai) |
| Checkpoint NVFP4 para vLLM SM120 (lspohn) | No disponible | No disponible | NVFP4 (vLLM) | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de ASR en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- La evaluacion se baso en llamadas cerradas exploratorias y cortas, no en un conjunto de test exhaustivo; los casos de calidad expuestos son limitados.
- Una variante mas agresiva (Down-Q6) fue descartada tras producir una transcripcion vacia en aleman, lo que indica sensibilidad de la calidad a la cuantizacion.
- El runtime utilizado es un llama.cpp Vulkan parcheado con flags y politica de precision especificos; los resultados pueden no reproducirse con builds estandar.
- Los picos de memoria incluyen otros servicios de GPU, por lo que el consumo real del modelo es menor pero no se aisla en las cifras publicadas.
- No se declara una lista de idiomas soportados; la evidencia de calidad multilingue es anecdatica (un caso en aleman).
- No hay informacion sobre sesgos, riesgo de alucinacion en transcripcion ni comportamiento en dominios ruidosos.
- La licencia Apache 2.0 permite uso comercial, pero se debe consultar el archivo NOTICE para la atribucion exacta de la revision GGUF upstream.
- El repositorio tiene cero descargas y cero likes, sin validacion independiente de la comunidad en el momento de la consulta.
- No se dispone de informacion sobre tool calling, agentes ni otras capacidades mas alla del ASR.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lspohn/Voxtral-Mini-4B-Realtime-2602-Selective-GGUF
- Modelo base: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602
- Repositorio de benchmarks de Voxtral Realtime: https://github.com/lspohn/voxtral-realtime-benchmarks
- Checkpoint NVFP4 para vLLM SM120: https://huggingface.co/lspohn/Voxtral-Mini-4B-Realtime-2602-NVFP4-vLLM-SM120
