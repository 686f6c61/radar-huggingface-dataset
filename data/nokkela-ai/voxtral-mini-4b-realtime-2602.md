# nokkela-ai/Voxtral-Mini-4B-Realtime-2602

## Resumen

Voxtral Mini 4B Realtime 2602 es un modelo de reconocimiento automatico del habla (ASR) multilingue disenado para transcripcion en tiempo real. Lo desarrolla Mistral AI y esta publicado bajo licencia Apache 2.0. La version aqui descrita es un fork independiente de Nokkela.AI, que mantiene una copia de los pesos originales con fines de disponibilidad y archivado. El modelo resuelve el problema de la transcripcion de baja latencia: consigue una precision comparable a los sistemas offline con un retardo inferior a 500 ms, algo que hasta ahora solo estaba al alcance de APIs propietarias.

La arquitectura combina un codificador de audio causal de aproximadamente 970 millones de parametros, entrenado desde cero, con un backbone de lenguaje de unos 3.4B parametros, para un total de 4.429.679.360 parametros. Ambos componentes emplean atencion de ventana deslizante, lo que permite un streaming practicamente infinito. El modelo admite retardos de transcripcion configurables entre 80 ms y 2.4 s, de modo que el usuario puede ajustar el equilibrio entre latencia y exactitud segun su caso de uso.

Es relevante ahora porque demuestra que un modelo abierto de 4B puede igualar a sistemas offline y a APIs en tiempo real con un retardo de 480 ms, y porque su tamano reducido permite despliegue en hardware modesto, incluso en dispositivo, con un throughput superior a 12.5 tokens por segundo. Soporta 13 idiomas y se distribuye en BF16 con la libreria vLLM como referencia de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio causal (~970M) + LLM backbone (~3.4B) con atencion de ventana deslizante |
| Parametros totales | 4.429.679.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 131072 tokens por defecto en vLLM (~3 h de audio); 1 token de texto = 80 ms |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en, fr, es, de, ru, zh, ja, it, pt, nl, ar, hi, ko (13) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 17.7 GB, BF16) |

## Arquitectura y entrenamiento

El modelo es un sistema multimodal audio-texto compuesto por dos bloques. El primero es un codificador de audio de aproximadamente 970M parametros entrenado desde cero con atencion causal, lo que habilita el procesamiento incremental de la senal sin necesidad de buffers completos. El segundo es un backbone de lenguaje de unos 3.4B parametros, derivado de `mistralai/Ministral-3-3B-Base-2512`, que consume las representaciones del audio y genera texto. Tanto el codificador como el LLM emplean atencion de ventana deslizante, lo que permite sesiones de streaming de duracion arbitraria en la practica.

La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica principal es el diseno nativamente streaming: el retardo de transcripcion es configurable (multiplos de 80 ms entre 80 y 1200 ms, mas el valor aislado de 2400 ms) mediante el parametro `transcription_delay_ms` del archivo `tekken.json`. A 480 ms el modelo iguala a los mejores sistemas offline y a las APIs en tiempo real. El tokenizador asociado es Tekken, propio de Mistral.

## Capacidades

- Transcripcion de audio a texto de alta calidad en 13 idiomas.
- Procesamiento en tiempo real con retardo configurable entre 80 ms y 2.4 s.
- Streaming continuo gracias a la atencion de ventana deslizante en codificador y LLM.
- Transcripcion multilingue sin cambio explicito de idioma.
- Ajuste del equilibrio latencia/precision mediante `transcription_delay_ms`.
- Inferencia optimizada para despliegue en dispositivo con throughput superior a 12.5 tokens/s.
- Integracion con vLLM para servir el modelo con entrada de audio en streaming.
- Soporte de sesiones via websockets para captura de audio en vivo.
- No se documentan capacidades de tool calling, agentes, vision ni audio generativo.

## Casos de uso

- Transcripcion privada de reuniones: el modelo procesa audio en streaming con un contexto de hasta 131072 tokens (unas 3 horas), lo que permite transcribir reuniones largas sin salir del dispositivo y sin enviar datos a terceros.
- Subtitulado en directo: con un retardo de 480 ms y salida token a token, es adecuado para generar subtitulos sincronizados en emisiones, webinars o eventos presenciales en cualquiera de los 13 idiomas soportados.
- Asistentes de voz con comprension del habla: la transcripcion de baja latencia alimenta el modulo de intenciones de un asistente conversacional, reduciendo el tiempo de respuesta percibido por el usuario.
- Atencion al cliente por voz: integrado en un pipeline de telefonia (por ejemplo via websockets), transcribe llamadas en tiempo real para alimentar un sistema de analisis o de respuesta automatica, con la ventaja de que el modelo es ligero y desplegable en infraestructura propia.
- Accesibilidad: generacion de subtitulos automaticos para personas con discapacidad auditiva en videollamadas y plataformas de video, con la posibilidad de ejecutar el modelo en hardware de gama media.
- Documentacion clinica o legal dictada: transcripcion en diferido o en vivo de notas de voz con contexto largo, manteniendo los datos dentro de la organizacion gracias al despliegue local.
- Analisis de medios y monitorizacion: transcripcion masiva de audio de radios, podcasts o television en varios idiomas para indexacion y busqueda, aprovechando el throughput y el soporte de vLLM para servir varias peticiones.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto Fleurs (WER, menor es mejor). Solo se dispone de la comparacion con Voxtral Mini Transcribe 2.0 en modo offline; el resto de filas de la tabla original no estaban disponibles en la informacion proporcionada.

| Modelo | Retardo | AVG | Arabe | Aleman | Ingles | Espanol | Frances | Hindi | Italiano | Neerlandes | Portugues | Chino | Japones | Coreano | Ruso |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Voxtral Mini Transcribe 2.0 | Offline | 5.90% | 13.54% | 3.54% | 3.32% | 2.63% | 4.32% | 10.33% | 2.17% | 4.78% | 3.56% | 7.30% | 4.14% | 12.29% | 4.75% |
| Voxtral Mini 4B Realtime 2602 | 480 ms | 8.72% | 22.53% | 6.19% | 4.90% | 3.31% | 6.42% | 12.88% | 3.27% | 7.07% | 5.03% | 10.45% | 9.59% | 15.74% | 6.02% |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K, ya que el modelo es de ASR y no de razonamiento textual general.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 9 GB solo para pesos, mas overhead de KV cache y activaciones; el repo completo ocupa 17.7 GB.
- GPU recomendadas: A100, H100 o L40S para servicio multi-cliente con vLLM; RTX 4090 o RTX 3090 para despliegue individual.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en BF16; con cuantizacion a 8 bits o 4 bits (no documentada oficialmente) cabria en 8-12 GB.
- Opciones de despliegue: vLLM es la libreria de referencia (campo `library_name: vllm`); la model card recomienda websockets para sesiones de streaming. No se documentan soportes de llama.cpp, Ollama ni TGI.
- Latencia y throughput: mas de 12.5 tokens/s en dispositivo; retardo de transcripcion configurable desde 80 ms; 480 ms recomendado como punto de equilibrio.
- Parametros de servicio: `temperature=0.0`; `--max-model-len` calculado como duracion_en_segundos / 0.8 (1 h de audio requiere 45000 tokens).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Retardo | WER Fleurs AVG | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Voxtral Mini 4B Realtime 2602 | 4.43B | 131072 tokens (~3 h) | 480 ms | 8.72% | Apache 2.0 | Hugging Face (fork Nokkela.AI) |
| Voxtral Mini Transcribe 2.0 | no disponible | no disponible | Offline | 5.90% | no disponible | Hugging Face (Mistral AI) |
| Alternativas open source realtime | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card afirma que el modelo supera a las lineas base open source de tiempo real existentes y que iguala a los sistemas offline y a las APIs en tiempo real a 480 ms, pero no se proporcionan en la informacion disponible los nombres ni las cifras de esos modelos comparables.

## Limitaciones y advertencias

- El WER empeora de forma notable respecto al modo offline: 8.72% frente a 5.90% de media, con degradacion acusada en arabe (22.53%), coreano (15.74%) e hindi (12.88%).
- El retardo bajo (80-240 ms) reduce la precision; el punto recomendado es 480 ms.
- La model card no documenta sesgos linguisticos, de acento o de dominio; deben evaluarse antes de produccion.
- Riesgo de alucinacion en pasajes de audio con ruido, silencios largos o solapamiento de hablantes; no se documenta mecanismo de deteccion.
- El contexto maximo practico esta limitado por la preasignacion de parametros RoPE en vLLM, aunque el diseno permita streaming teoricamente infinito.
- No se documentan capacidades de diarizacion de hablantes ni de puntuacion avanzada.
- La licencia Apache 2.0 permite uso comercial, pero el fork debe citarse correctamente y conviene verificar que los pesos coinciden con el original de Mistral AI.
- El modelo esta marcado con `inference: false` en la model card del fork; debe servirse con vLLM y no mediante la API de inferencia de Hugging Face.

## Enlaces

- Hugging Face (fork): https://huggingface.co/nokkela-ai/Voxtral-Mini-4B-Realtime-2602
- Modelo original: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602
- Modelo base del LLM: https://huggingface.co/mistralai/Ministral-3-3B-Base-2512
- Blog de Mistral AI: https://mistral.ai/news/voxtral-transcribe-2
- Demo: https://huggingface.co/spaces/mistralai/Voxtral-Mini-Realtime
- Informe tecnico: https://arxiv.org/abs/2602.11298
- Blog de vLLM sobre streaming: https://blog.vllm.ai/2026/01/31/streaming-realtime.html
- Configuracion de retardo (tekken.json): https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602/blob/main/tekken.json
