# pipecat-ai/sidechat

## Resumen

Sidechat es un clasificador de texto pequeno desarrollado por pipecat-ai para gestionar el turn-taking en agentes de voz que conversan con varias personas a la vez. El modelo recibe cada linea transcrita de una conversacion multi-participante y decide si el agente debe hablar en ese momento, esperar a ver si alguien mas interviene o mantenerse en silencio. Resuelve un problema concreto de los sistemas de voz: evitar que el bot responda a frases dirigidas a otras personas y, a la vez, detectar cuando se le esta llamando.

Tecnicamente es un encoder Ettin (jhu-clsp/ettin-encoder-150m y ettin-encoder-32m) con cabezas de clasificacion para intent, respond y unclear, exportado a ONNX y pensado para ejecutarse en CPU. Se distribuye en dos builds: uno por defecto de 150M parametros y otro llamado `agent-1x`, un two-tower de 32M destilado del primero y optimizado para latencia en hardware muy limitado. La ficha actual corresponde a la version experimental rc0.3.1.

La relevancia actual esta en que permite filtrado de turnos local y sin llamadas a API en pipelines de Pipecat, con tasas de acierto declaradas muy altas en la deteccion de lineas ajenas y en la deteccion de peticiones que nombran al agente. El modelo esta marcado explicitamente como experimental por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer Ettin con cabezas de clasificacion (intent, respond, unclear); build `agent-1x` es two-tower destilado |
| Parametros totales | 150M (build por defecto); 32M (build `agent-1x`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 e int8 (ONNX) |
| Idiomas soportados | en (solo ingles) |
| Licencia | BSD-2-Clause |
| Formato de pesos | ONNX (`model.onnx`, `model-int8.onnx`) |
| Modelo base | jhu-clsp/ettin-encoder-150m, jhu-clsp/ettin-encoder-32m |
| Tarea (pipeline) | text-classification |
| Tamano del repo | 2.7 GB |
| Descargas | 347 |
| Likes | 4 |

## Arquitectura y entrenamiento

El modelo parte de los encoders Ettin (licencia MIT) de jhu-clsp y anade cabezas de clasificacion para predecir intent (dirigido al agente de forma directa o indirecta, abierto a la sala, sobre el agente u otro), respond (probabilidad de que el agente deba hablar ahora) y unclear (la linea encaja igual con el agente y con otra persona). El build por defecto usa el encoder de 150M; el build `agent-1x` es un two-tower de 32M destilado del modelo grande, que codifica las lineas anteriores mientras la persona habla para reducir la latencia por linea.

El entrenamiento combina datos generados propios (conversaciones multi-participante etiquetadas segun la guia del proyecto, publicadas en pipecat-ai/sidechat-gen) con datos publicos, entre ellos el dataset AMI de addressee (ACloudCenter/ami-addressee). No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificacion de turno en conversaciones multi-participante: decide `respond`, `wait` o `ignore` para cada linea transcrita.
- Deteccion de destinatario (addressee detection) con hablantes anonimos ("Speaker 1"), sin necesidad de identificacion de voz.
- Prediccion de intent: dirigido al agente (directa o indirectamente), abierto a la sala, sobre el agente u otro.
- Senal de incertidumbre (`unclear`) cuando la linea encaja igual con el agente y con otra persona.
- Funcionamiento local en CPU, sin llamadas a API externas.
- Build `agent-1x` con metodo `prepare` para pre-codificar el historial mientras habla el interlocutor.
- Soporte de integracion con Pipecat mediante el componente `PipecatSidechat` y con el runtime propio del proyecto (`sidechat.runtime`).
- Capacidad multilingue: no, solo ingles.

## Casos de uso

- Agente de voz en reuniones multi-participante: Sidechat se situa entre el agregador de usuario y el LLM para que el modelo solo responda a los turnos dirigidos al bot, evitando interrumpir conversaciones entre personas.
- Asistente de sala para reservas o consultas: cuando alguien dice "Can you check that for us?" sin nombrar al agente, el modelo mantiene la linea en espera y responde si nadie mas interviene, aprovechando la tasa declarada del 91% de retencion de peticiones reales sin nombre.
- Filtrado de falsos positivos de STT: con tasas declaradas de 0,2% de lineas ajenas respondidas por error, sirve para reducir respuestas no solicitadas en produccion.
- Despliegue en hardware muy limitado: el build `agent-1x` int8 ocupa 195 MB y tarda unos 7 ms por linea en 1 vCPU (unos 10 ms en medio CPU), lo que permite ejecutarlo en dispositivos de borde o contenedores con 0,5 vCPU y 1 GiB.
- Prototipado rapido de turn-taking: el runtime independiente (`pip install git+https://github.com/pipecat-ai/sidechat`) permite probar la clasificacion fuera de Pipecat con `SidechatRequest`, `Agent` y `Turn`.
- Investigacion sobre destinatario en dialogos: los datasets publicados (sidechat-gen y ami-addressee) permiten reproducir el etiquetado y comparar variantes.
- Integracion en pipelines de CI para agentes conversacionales: al ser ONNX y local, se puede incluir en tests automatizados de turn-taking sin depender de servicios externos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (comparaciones, no benchmarks formales, segun sus propias notas):

| Metrica | Default (150M) | `agent-1x` (32M) | Jev (hosted) |
|---|---|---|---|
| Duplex-MPE, decisiones correctas (52.336 lineas) | 96,4% | 95,7% | 83,1% |
| Social AI Ambient Bench, correctas (15.793) | 96,9% | 97,5% | 85,4% |
| AMI, correctas (8.875) | 99,0% | 98,7% | 85,2% |
| Duplex-MPE, lineas ajenas retenidas | 0,8% | 0,7% | 16,0% |
| Duplex-MPE, peticiones solo por contexto respondidas | 29,3% | 10,2% | 26,6% |
| Peticiones reales sin nombre, retenidas (2.705) | 90,9% | 86,6% | 82,1% |
| Tiempo por linea en 1 vCPU | 303 ms | 7 ms | 49 a 149 ms |

Ademas, la card declara: peticiones que nombran al agente respondidas 99,6% (default) y 99,7% (`agent-1x`); lineas de personas respondidas por error 0,2% y 0,3%; lineas de personas retenidas 0,8% y 0,7%. El int8 decide igual que fp32 en el 98,5% a 99,9% de las lineas de test.

## Requisitos de hardware

- Inferencia en CPU; no se especifica requisito de GPU.
- Build por defecto: 325 MB en int8, 150M parametros, unos 303 ms por linea en 1 vCPU; requiere 1 vCPU o mas.
- Build `agent-1x`: 195 MB en int8, 32M parametros, unos 7 ms por linea en 1 vCPU y unos 10 ms en medio CPU; requiere 0,5 vCPU y 1 GiB.
- Cabe en hardware de consumo y en dispositivos de borde; no necesita GPU dedicada.
- Despliegue mediante ONNX Runtime con el runtime propio del proyecto (`sidechat.runtime.load`) o integrado en Pipecat (`PipecatSidechat`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: los tiempos por linea anteriores son los unicos datos publicados; throughput agregado no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Duplex-MPE (correctas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sidechat default | 150M | no disponible | 96,4% | BSD-2-Clause | ONNX local, Hugging Face |
| Sidechat `agent-1x` | 32M | no disponible | 95,7% | BSD-2-Clause | ONNX local, Hugging Face |
| Jev | no disponible | no disponible | 83,1% | no disponible (servicio hosted) | API alojada |

No se dispone de datos de otros clasificadores de addressee comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo marcado como experimental (rc0.3.1): salidas, nombres y calibracion pueden cambiar entre releases.
- Solo admite texto en ingles.
- Las peticiones que solo el contexto marca como dirigidas al agente se detectan mal: 29% respondidas por el build por defecto y 10% por `agent-1x`.
- Un follow-up sin nombre justo despues de que el agente responda es dificil de distinguir de una conversacion dirigida a otra persona.
- Alrededor de 1 de cada 100 lineas de personas en reuniones reales se retiene para una pausa, sobre todo preguntas entre personas sin nombre.
- Depende de la calidad del STT: el autor recomienda pasar el nombre del agente como keyterm (por ejemplo, en Deepgram) porque nombres poco comunes se transcriben mal y la peticion se pierde.
- Riesgo de alucinacion: no disponible como tal (es un clasificador, no un generador); el riesgo se traslada a falsos positivos y negativos de clasificacion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia BSD-2-Clause: permisiva para uso comercial, pero conviene revisar las condiciones de los modelos base Ettin (MIT) y de los datasets empleados.
- Los numeros de la card son comparaciones bajo la guia de etiquetado del propio proyecto, no benchmarks independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pipecat-ai/sidechat
- Codigo: https://github.com/pipecat-ai/sidechat
- Integracion en Pipecat (PR): https://github.com/pipecat-ai/pipecat/pull/6934
- Dataset de entrenamiento: https://huggingface.co/datasets/pipecat-ai/sidechat-gen
- Dataset AMI addressee: https://huggingface.co/datasets/ACloudCenter/ami-addressee
- Dataset Duplex-MPE: https://huggingface.co/datasets/ChengqianMa/Duplex-MPE
- Social AI Ambient Bench: https://huggingface.co/datasets/text-ai/social-ai-ambient-bench
- Encoder base Ettin 150M: https://huggingface.co/jhu-clsp/ettin-encoder-150m
