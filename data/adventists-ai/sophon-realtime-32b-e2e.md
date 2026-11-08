# adventists-ai/Sophon-Realtime-32B-E2E

## Resumen

Sophon-Realtime-32B-E2E es un modelo de voz extremo a extremo (audio-a-audio) desarrollado por Adventists AI (AI降临派) dentro de la familia Sophon-Realtime v1. A diferencia de las aproximaciones en cascada, no emplea un modelo de reconocimiento de voz separado ni un TTS independiente: el modelo de 32 000 millones de parámetros construye, mientras escucha, un flujo de vectores continuos que codifican tanto el contenido lingüístico como la información paralingüística (entonación, énfasis, emoción), y su cabecera de habla ("talker") genera la respuesta directamente en ese mismo espacio vectorial, que un decodificador convierte en audio.

La propuesta central es la compartición de representación entre entrada y salida: el tono que el modelo es capaz de percibir es el tono que puede producir. El modelo se distribuye como un paquete de varios componentes (base de 32B, adaptador LoRA de generación de respuestas, talker, decodificador de 4 pasos con vocoder y voces por defecto) bajo licencia Apache-2.0.

Se publica como *research preview* en noviembre de 2026. El propio autor recomienda, para producción, las variantes Sophon-Realtime-32B-Tag (más expresiva, una sola GPU) y Sophon-Realtime-32B-Flash (más rápida y con mayor concurrencia, una sola GPU), que comparten el mismo "cerebro" y difieren únicamente en el mecanismo de síntesis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de voz full-duplex extremo a extremo; base transformer de 32B con cabecera talker y decodificador de audio de 4 pasos) |
| Parametros totales | 32 000 millones (32B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Chino (zh) e ingles (en); el benchmark interno de error de decodificacion incluye tambien japones (ja) |
| Licencia | Apache-2.0 (codigo y pesos); componentes de terceros con sus propias licencias (ver NOTICE) |
| Formato de pesos | safetensors |
| Pipeline | audio-to-audio |
| Tamano del repositorio | 79,0 GB |
| Frameworks | PyTorch |
| Modalidad | Full-duplex (escucha y habla simultaneamente) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del backbone de 32B (no se especifica si es un transformer denso, MoE o hibrido, ni el numero de capas o dimensiones). Lo que si se describe es la organizacion funcional del sistema: un "thinker" (el modelo de 32B que procesa la entrada de audio y razona) y un "talker" (cabecera que genera la respuesta en el espacio de vectores continuos del modelo), ambos apoyados en la misma base de 32B. Sobre la base se aplica un adaptador LoRA (`adapters/tag/`) que escribe las respuestas. Un decodificador de 4 pasos y un vocoder (`e2/`) convierten los vectores en forma de onda.

La innovacion tecnica declarada es la representacion compartida entre percepcion y generacion: los vectores que el modelo forma al escuchar codifican contenido y paralinguistica, y el talker escribe directamente en ese espacio. El decodificador se ha renovado en esta version manteniendo el mismo coste computacional por bloque de audio que la version anterior. No se publican datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Conversacion de voz full-duplex: escucha mientras el usuario habla, sin turnos estrictos de espera.
- Generacion de voz con carga paralinguistica: entonacion, enfasis y emocion derivados de la representacion interna, no de un TTS externo.
- Comprension de audio del usuario con informacion de "como se dice", no solo de "que se dice".
- Clonacion/similitud de voz respecto a un hablante de referencia no visto (similitud 0,52 en la evaluacion del autor).
- Salida de audio de baja latencia: primer paquete de audio en 0,51 s de mediana en el bench del paquete de publicacion.
- Multilingue limitado a chino e ingles (con evaluacion adicional en japones para la tasa de error del decodificador).
- Interfaz de servicio mediante WebSocket (`/ws`) y pagina web integrada para conversacion directa.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni modo de razonamiento explicito.

## Casos de uso

- Agentes de voz en atencion al cliente: el modelo mantiene conversaciones habladas full-duplex, por lo que puede interrumpirse y reaccionar mientras el cliente sigue hablando, algo que las cascadas STT-LLM-TTS no gestionan bien.
- Asistentes telefonicos o de cabina con matiz emocional: al conservar la paralinguistica de la entrada y reproducirla en la salida, resulta adecuado para soporte en situaciones de queja o frustracion donde el tono importa.
- Pruebas de concepto de interfaces conversacionales en tiempo real: el despliegue incluido (dos GPU de 80 GB, WebSocket y UI web) permite validar productos de voz sin ensamblar un pipeline propio.
- Investigacion en representaciones compartidas de voz: el paquete separa base, LoRA, talker y decodificador, lo que facilita experimentos sobre el espacio vectorial comun de escucha y habla.
- Doblaje o reproduccion de estilo de voz en chino e ingles: la similitud con hablantes de referencia no vistos (0,52) permite explorar adaptacion de voz en contenidos pregrabados.
- Evaluacion comparativa de variantes de sintesis: al compartir cerebro con Tag y Flash, sirve como referencia para medir el impacto del decodificador end-to-end frente a las alternativas de produccion del mismo autor.
- Demostraciones interactivas en navegador: la UI en el puerto 8000 permite enseñar el sistema a stakeholders sin desarrollo de cliente.

## Benchmarks y rendimiento

Los unicos datos publicados son comparativas internas del decodificador nuevo frente al de Sophon-Realtime-v1, sobre respuestas del mismo talker:

| Metrica | Sophon-Realtime-v1 | Sophon-Realtime-32B-E2E |
|---|---|---|
| Tasa de error en respuestas largas (150 respuestas, zh / en / ja) | 1,78 % (1,03 / 1,32 / 2,99) | 1,51 % (0,97 / 0,71 / 2,86) |
| Similitud de voz con hablante de referencia no visto | 0,33 | 0,52 |
| Primer audio, un usuario (bench del paquete, mediana) | 0,57 s | 0,51 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM: el despliegue de referencia requiere dos GPU de 80 GB, una para el thinker y otra para el motor de habla.
- GPU recomendadas: A100 80 GB o H100 80 GB (dos unidades); no se especifican otras.
- Concurrencia: se recomiendan 4-5 conversaciones simultaneas por GPU del motor de habla.
- GPU de consumo: no cabe en GPU de consumo segun la configuracion oficial (32B + decodificador en dos dispositivos de 80 GB).
- Sistema: Linux con driver NVIDIA 580 o superior.
- Despliegue: scripts oficiales del repositorio (`scripts/install.sh` y `scripts/start.sh`), servicio web en el puerto 8000 y API WebSocket en `/ws`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: primer paquete de audio de 0,51 s de mediana con un usuario. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sophon-Realtime-32B-E2E | 32B | No disponible | Voz E2E full-duplex, research preview | Apache-2.0 | Hugging Face, ModelScope, GitHub |
| Sophon-Realtime-32B-Tag | 32B | No disponible | Voz full-duplex, mas expresiva, una GPU | Apache-2.0 (segun familia) | ModelScope |
| Sophon-Realtime-32B-Flash | 32B | No disponible | Voz full-duplex, mas rapida y concurrente, una GPU | Apache-2.0 (segun familia) | ModelScope |
| Sophon-Realtime-v1 | No disponible | No disponible | Version anterior, decodificador previo | Apache-2.0 (segun familia) | ModelScope |

No se dispone de datos de benchmarks frente a modelos de voz de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- Es una *research preview*: el propio autor desaconseja su uso en produccion y remite a Tag o Flash.
- Idiomas limitados a chino e ingles; el japones solo aparece en la evaluacion del decodificador, no como idioma declarado.
- La tasa de error del decodificador en japones (2,86 %) es notablemente superior a la de chino (0,97 %) e ingles (0,71 %).
- La similitud de voz con hablantes no vistos (0,52) sigue siendo moderada; no se garantiza fidelidad de clonacion.
- No se publican datos de sesgos, robustez ante ruido, comportamiento en dominios especializados ni tasas de alucinacion en contenido hablado.
- Requiere hardware especializado (dos GPU de 80 GB) y driver NVIDIA 580+, lo que limita su evaluacion a infraestructura de centro de datos.
- La licencia Apache-2.0 cubre codigo y pesos, pero los componentes de terceros conservan sus propias licencias; es necesario revisar el NOTICE del repositorio antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de los resultados declarados.

## Enlaces

- Hugging Face: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-E2E
- GitHub: https://github.com/adventists-ai/sophon-realtime
- Documentacion de despliegue (chino): https://github.com/adventists-ai/sophon-realtime/blob/main/docs/deploy_CN.md
- Documentacion de despliegue (ingles): https://github.com/adventists-ai/sophon-realtime/blob/main/docs/deploy.md
- ModelScope: https://www.modelscope.cn/models/AdventistsAI/Sophon-Realtime-32B-E2E
- Sophon-Realtime-32B-Tag (ModelScope): https://www.modelscope.cn/models/AdventistsAI/Sophon-Realtime-32B-Tag
- Sophon-Realtime-32B-Flash (ModelScope): https://www.modelscope.cn/models/AdventistsAI/Sophon-Realtime-32B-Flash
- Sophon-Realtime-v1 (ModelScope): https://www.modelscope.cn/models/AdventistsAI/Sophon-Realtime-v1
- Contacto comercial: jiejin@adventists.ai
