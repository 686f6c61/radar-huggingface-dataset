# adventists-ai/Sophon-Realtime-32B-E2E

## Resumen

Sophon-Realtime-32B-E2E es un modelo de voz a voz (audio-to-audio) en tiempo real y full-duplex desarrollado por Adventists AI (AI降临派). A diferencia de los pipelines clasicos de ASR + LLM + TTS, el sistema integra un "cerebro" de 32B de parametros que escucha, decide cuando el usuario ha terminado de hablar y genera una respuesta con etiquetas de voz, y un "talker" (cabeza de sintesis de unos 350 millones de parametros) que convierte esa respuesta en audio sin pasar por tokens de voz discretos: genera vectores continuos de audio a unas 6,5 tramas por segundo, que un decodificador de 2 pasos y un vocoder reconstruyen a 24 kHz.

La propuesta diferencial es la latencia y la expresividad: primer paquete de audio en torno a 0,25 segundos en una unica H100 de 80 GB, con risas, toses, suspiros, respiraciones y enfasis prosodico generados en la misma corriente de audio. El modelo esta pensado para agentes de voz conversacionales donde la naturalidad paralinguistica y el solapamiento de turnos importan tanto como la calidad del texto.

La version documentada es la 1.3.0 (23 de noviembre de 2026), que anade clonacion de voz zero-shot en el modo de despliegue vLLM-Omni. La familia v1 comparte el mismo cerebro (VoiceBench 82,8; Big Bench Audio 81,8 %) y difiere en el mecanismo de sintesis: Tag (calidad y multilingueismo), Flash (maxima concurrencia) y E2E (menor latencia con expresividad). Solo soporta chino e ingles en la generacion de respuesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cerebro LLM de 32B (transformer, presumiblemente decoder-only; no se detalla en la informacion disponible) + cabeza de sintesis "talker" de ~350 M parametros que emite vectores continuos de audio (~6,5 tramas/s) + decodificador de 2 pasos + vocoder a 24 kHz |
| Parametros totales | 32B (cerebro) + ~350 M (talker); total del sistema no desglosado en la informacion disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos del cerebro en FP8 en la variante `thinker/` (~36 GB); no se documentan otras cuantizaciones (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Chino (zh) e ingles (en) para la respuesta; entrada de audio en esos idiomas |
| Licencia | Apache-2.0 (codigo y pesos); componentes de terceros con sus propias licencias (ver NOTICE) |
| Formato de pesos | safetensors (repo de 117,5 GB); artefactos ONNX auxiliares para clonacion de voz (`speech_tokenizer_v3.onnx`, `campplus.onnx`, ~1 GB) |

## Arquitectura y entrenamiento

El sistema se organiza en tres piezas. El cerebro es un LLM de 32B que recibe audio del usuario, realiza el turn-taking (decide cuando ha terminado el hablante) y escribe la respuesta textual anotada con etiquetas paralinguisticas (`[laughter]`, `[cough]`, `[sigh]`, `[breath]`, `<strong>` para enfasis, `<laughter>...</laughter>` para hablar riendo). Sobre el se aplica un LoRA (`adapters/tag/`) que especializa la generacion en ese formato etiquetado; la variante `thinker/` es el cerebro con el LoRA ya fusionado y cuantizado en FP8 (~36 GB).

La novedad tecnica es el talker: en lugar de sintetizar tokens de voz discretos y decodificarlos, consume la salida textual del cerebro mientras este aun escribe y produce directamente vectores continuos de audio a ~6,5 Hz. Un decodificador de 2 pasos y un vocoder los convierten en audio PCM a 24 kHz. Esto elimina la latencia de esperar la respuesta completa y permite que los fenomenos paralinguisticos (risa, respiracion, tos) se generen en la misma corriente que el habla. El sistema completo cabe en una GPU de 80 GB con un uso real de unos 70 GB.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO; la model card solo menciona el tag propietario `duplexjev` y la evaluacion con NVV-SuperBench usando Gemini 3 Flash como juez. La clonacion de voz zero-shot se apoya en un frontend externo (`speech_tokenizer_v3.onnx` y `campplus.onnx`) y no requiere reentrenamiento ni reinicio.

## Capacidades

- Dialogo de voz full-duplex: escucha de forma continua mientras habla y gestiona el solapamiento de turnos sin pulsar botones.
- Deteccion autonoma de fin de turno (turn-taking) a partir del audio entrante.
- Generacion de voz expresiva con paralinguistica: risa, tos, suspiro y respiracion en la posicion indicada, y enfasis prosodico sobre palabras concretas.
- Clonacion de voz zero-shot a partir de 5-12 segundos de audio limpio de un solo hablante (solo en despliegue vLLM-Omni, codigo 1.3.0 o superior).
- Respuestas en chino e ingles.
- Razonamiento y generacion de texto heredados del cerebro de 32B (no se detallan capacidades especificas de codigo o matematicas en la informacion disponible).
- Interfaces compatibles con OpenAI Realtime: `/v1/realtime` (WebSocket full-duplex) y `/v1/chat/completions`.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Atencion al cliente telefonica o por voz: el modelo mantiene conversaciones multi-turno en tiempo real con primer paquete de ~0,25 s, lo que evita silencios artificiales y permite interrupciones naturales del cliente; el despliegue en una H100 soporta 16 conversaciones concurrentes con P90 de 0,56 s.
- Agentes de voz para reservas y soporte de primer nivel: la deteccion automatica de fin de turno elimina la necesidad de pulsar para hablar y hace viables flujos de confirmacion y aclaracion con solapamiento.
- Companeros y personajes conversacionales: la paralinguistica (risa, suspiro, respiracion) y la clonacion de voz permiten construir personajes con voz propia y expresividad consistente, util en entretenimiento y educacion.
- Investigacion sobre turn-taking y dialogo full-duplex: el modelo expone un endpoint WebSocket compatible con OpenAI Realtime, lo que facilita experimentos reproducibles sobre interrupciones y latencia.
- Pruebas de usabilidad y simulacion de interlocutores: generar respuestas habladas con enfasis y emociones controladas mediante etiquetas para prototipos de interfaces de voz y estudios de percepcion.
- Demo local de agentes de voz: el repositorio incluye un servidor web en el puerto 8000 para conversar desde el navegador y un `client_example.py` para integrar el modelo en pipelines propios.
- Evaluacion de sistemas de audio: la salida a 24 kHz con marcas paralinguisticas sirve como referencia para medir calidad de sintesis y naturalidad en benchmarks como NVV-SuperBench.

## Benchmarks y rendimiento

Resultados publicados en la model card (NVV-SuperBench, F1, 50 items por clase e idioma, juez Gemini 3 Flash):

| Metrica | Ingles | Chino |
|---|---|---|
| Cuatro clases (total) | 0,75 | 0,85 |
| Risa | 0,70 | 0,86 |
| Tos | 0,76 | 0,95 |
| Suspiro | 0,92 | 0,87 |
| Respiracion | 0,64 | 0,74 |
| Tasa de error de transcripcion (WER) | 1,9 % | 3,1 % |

Comparativa dentro de la familia v1 (mismo cerebro):

| Metrica | Tag | Flash | E2E |
|---|---|---|---|
| NVV-SuperBench (en / zh) | 0,80 / 0,86 | 0,63 / 0,77 | 0,75 / 0,85 |
| Primer paquete, una sesion | ~0,6 s | 0,31 s | ~0,25 s |
| Concurrencia recomendada por H100 80 GB | 16 | 40 | 16 |

Rendimiento de servicio en una H100 80 GB (motor propio, extremo a extremo en la misma GPU):

| Usuarios en 10 s | Primer paquete mediana / P90 | Respuestas con retraso de reproduccion > 0,3 s |
|---|---|---|
| 1 | 0,25 s | 0 |
| 8 | 0,44 / 0,77 s | 0 / 8 |
| 16 | 0,44 / 0,56 s | 0 / 16 |
| 24 | 0,58 / 0,94 s | 7 / 24 |
| 32 | 0,67 / 0,80 s | 23 / 32 |

En despliegue vLLM-Omni sobre la misma H100: primer paquete de ~0,35 s con una sesion; con 16 sesiones, mediana de 0,58-0,65 s y P90 de 0,71-0,87 s; latencia de fin de habla a inicio de audio de ~0,45 s en full-duplex. El cerebro obtiene VoiceBench 82,8 y Big Bench Audio 81,8 %, que el autor presenta como primer puesto entre los modelos full-duplex abiertos en ambas pruebas.

## Requisitos de hardware

- VRAM: unos 70 GB reales para el sistema completo en una GPU de 80 GB. El repositorio completo ocupa 117,5 GB, pero cada modo de despliegue descarga solo su parte: ~67 GB con el motor propio (sin `thinker/`) y ~41 GB con vLLM-Omni (sin `base/` ni `adapters/`).
- GPU recomendadas: H100 80 GB (referencia de todas las cifras publicadas). Tambien funciona en RTX PRO 6000 (Blackwell, 96 GB), pero con solo 4-8 sesiones concurrentes y una sintesis aproximadamente el doble de lenta.
- GPU de consumo: no cabe en tarjetas consumer (RTX 4090, 5090, etc.) segun la informacion disponible; se requiere una GPU profesional o de centro de datos de 80 GB o mas.
- Software: Linux, driver NVIDIA 580 o superior, PyTorch. Dos vias de despliegue: motor propio (`scripts/install.sh` + `scripts/start.sh`, con interfaz web y WebSocket `/ws`) o vLLM-Omni (`e2e/install.sh` + `e2e/start.sh`, con `/v1/realtime` y `/v1/chat/completions`).
- Latencia y throughput: primer paquete de 0,25 s (motor propio) o ~0,35 s (vLLM-Omni) con una sesion; 16 sesiones concurrentes sin retrasos de reproduccion superiores a 0,3 s en H100. No se publican cifras de throughput en tokens por segundo.
- Alternativa sin GPU: API alojada de Adventists AI con 3 horas de voz gratuitas y compatibilidad con OpenAI Realtime.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Latencia primer paquete | Idiomas | Licencia |
|---|---|---|---|---|---|---|
| Sophon-Realtime-32B-E2E | 32B + ~350 M | no disponible | Full-duplex, audio-a-audio con vectores continuos | ~0,25 s | zh, en | Apache-2.0 |
| Sophon-Realtime-32B-Tag | 32B | no disponible | Full-duplex con sintesis por tokens de voz | ~0,6 s | zh, en y varias lenguas europeas | Apache-2.0 |
| Sophon-Realtime-32B-Flash | 32B | no disponible | Full-duplex optimizado para concurrencia | 0,31 s | zh, en, japones, ruso y europeas | Apache-2.0 |
| Sophon-Realtime-4B-E2E | 4B | no disponible | Version reducida para demos locales y personajes | no disponible | no disponible | Apache-2.0 |

No se dispone en la informacion proporcionada de comparativas con modelos de otras familias (por ejemplo, pipelines abiertos de ASR+LLM+TTS o modelos full-duplex de otros autores); esos datos figuran como no disponibles.

## Limitaciones y advertencias

- Solo genera respuestas en chino e ingles; para mas idiomas hay que usar Tag o Flash.
- Un unico timbre integrado; la clonacion de voz solo esta disponible en el despliegue vLLM-Omni (no en el motor propio).
- Duracion maxima de una respuesta: ~4,6 minutos con el motor propio y ~2,5 minutos con vLLM-Omni; al superarse, la respuesta termina en ese punto. El contenido solo es fiable hasta ~2,5 minutos; mas alla aparecen errores de lectura, por lo que se recomienda limitar cada respuesta a ese umbral.
- Riesgo de alucinacion y de errores de contenido heredado del cerebro de 32B; la model card no publica tasas de alucinacion ni evaluaciones de sesgo.
- La clonacion de voz exige consentimiento explicito: solo debe usarse con la propia voz o con permiso del titular, y nunca para suplantacion o fraude.
- Requiere hardware de gama alta (H100 80 GB) para las cifras publicadas; en RTX PRO 6000 la concurrencia cae a 4-8 sesiones.
- El rendimiento en produccion depende del modo de despliegue: el motor propio es algo mas rapido, pero carece de clonacion de voz y de la compatibilidad con OpenAI Realtime de vLLM-Omni.
- Componentes de terceros (tokenizador de voz, modelo de embeddings de hablante, vocoder) tienen licencias propias que deben revisarse en el NOTICE antes de un uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-E2E
- Repositorio GitHub: https://github.com/adventists-ai/sophon-realtime
- Modelo en ModelScope: https://www.modelscope.cn/models/AdventistsAI/Sophon-Realtime-32B-E2E
- Documentacion de despliegue (chino): https://github.com/adventists-ai/sophon-realtime/blob/main/docs/deploy_CN.md
- Guia del despliegue vLLM-Omni (chino): https://github.com/adventists-ai/sophon-realtime/blob/main/e2e/README_CN.md
- Registro de cambios: https://github.com/adventists-ai/sophon-realtime/blob/main/CHANGELOG.md
- Aviso de licencias de terceros: https://github.com/adventists-ai/sophon-realtime/blob/main/NOTICE
- Version Tag: https://www.modelscope.cn/models/AdventistsAI/Sophon-Realtime-32B-Tag
- Version Flash: https://www.modelscope.cn/models/AdventistsAI/Sophon-Realtime-32B-Flash
- Version 4B E2E: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-E2E
- API alojada y documentacion: https://api.adventists.ai/console/docs
- Ficha en LLM Reference: https://www.llmreference.com/model/sophon-realtime-32b-e2e
- Ficha en HotRepo: https://hotrepo.ai/adventists-ai/sophon-realtime
