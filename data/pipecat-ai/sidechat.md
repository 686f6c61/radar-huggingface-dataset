# pipecat-ai/sidechat

## Resumen

Sidechat es un clasificador de texto pequeno desarrollado por pipecat-ai para resolver un problema concreto de los agentes de voz en conversaciones multiparticipante: decidir, para cada intervencion transcrita, si el agente debe hablar en ese turno, esperar a ver si alguien mas toma la palabra o mantenerse en silencio. No es un modelo generativo, sino un encoder de clasificacion de texto que se situa entre el agregador de turnos del usuario y el LLM dentro de un pipeline de Pipecat, de forma que el LLM solo procesa los turnos dirigidos al bot.

El modelo se construye sobre los encoders Ettin de JHU CLSP (150M y 32M de parametros) y se distribuye en formato ONNX, con variantes fp32 e int8, para ejecutarse en CPU sin llamadas a API. Existen dos builds: el build por defecto de 150M, orientado a maxima precision, y el build `agent-1x` de 32M con arquitectura de dos torres, que puede codificar las lineas anteriores mientras la persona habla y consume aproximadamente medio vCPU y 1 GiB de memoria.

Su relevancia actual radica en que aborda uno de los fallos mas visibles de los asistentes de voz en reuniones y salas: responder a frases que iban dirigidas a otra persona. Segun la model card, el build por defecto responde al 99,6% de las peticiones que nombran al agente y solo al 0,2% de las lineas destinadas a otras personas. El proyecto se marca explicitamente como experimental (rc0.3.1) y avisa de que nombres, salidas y calibracion pueden cambiar entre versiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (Ettin); el build `agent-1x` usa arquitectura de dos torres |
| Parametros totales | 150M (build por defecto) y 32M (build `agent-1x`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp32 e int8 |
| Idiomas soportados | Ingles (en) |
| Licencia | BSD-2-Clause |
| Formato de pesos | ONNX (`.onnx` y `-int8.onnx`, con ficheros `config.json`) |

## Arquitectura y entrenamiento

El modelo parte de los encoders Ettin de JHU CLSP, `jhu-clsp/ettin-encoder-150m` para el build por defecto y `jhu-clsp/ettin-encoder-32m` para el build `agent-1x`. Este ultimo emplea una arquitectura de dos torres que permite codificar las lineas previas de la conversacion mientras la persona esta hablando, reduciendo la latencia por turno a unos 7 ms en int8 sobre 1 vCPU (frente a los 303 ms del build de 150M). Ambos builds se exportan a ONNX y se ofrecen en fp32 e int8; segun el autor, la version int8 toma la misma decision que fp32 entre el 98,5% y el 99,9% de las lineas de test.

El entrenamiento utiliza el dataset `pipecat-ai/sidechat-gen` y el dataset de addressee detection `ACloudCenter/ami-addressee`, derivado de reuniones. El modelo aprende de conversaciones reales en las que una peticion que no nombra al agente suele ir dirigida a una persona. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La API expone tres salidas: `respond` (probabilidad de que el agente deba hablar ahora), `intent` (dirigido al agente de forma directa o indirecta, abierto a la sala, sobre el agente u otro) y `unclear` (la linea encaja igual de bien con el agente y con otra persona). La funcion `decide` traduce estas salidas en `respond`, `wait` o `ignore` aplicando los umbrales definidos en `config.json`.

## Capacidades

- Clasificacion de turnos en conversaciones multiparticipante: decide si el agente debe responder, esperar o ignorar cada linea.
- Deteccion de addressee (destinatario): distingue peticiones dirigidas al agente de forma directa, indirecta, abiertas a la sala, sobre el agente u otras.
- Funcionamiento con hablantes anonimos: no requiere identificacion nominal de los participantes ("Speaker 1", "Speaker 2").
- Soporte de comandos explicitos: permite declarar una lista de `commands` que se responden siempre que aparezcan, independientemente de la lectura del modelo.
- Contexto de rol del agente: acepta una descripcion de una linea (`role`) sobre que es y que hace el agente, que se lee en cada turno.
- Codificacion anticipada de historial en el build `agent-1x` mediante `prepare()`, para solapar el computo con el habla del usuario.
- Ejecucion local en CPU, sin dependencia de API externa.
- No soporta generacion de texto, codigo, matematicas, vision, audio ni tool calling: es exclusivamente un clasificador de texto.

## Casos de uso

- Agentes de voz en reuniones: el modelo se inserta entre el agregador de turnos y el LLM para que este solo responda a las lineas dirigidas al bot, evitando interrupciones cuando los participantes hablan entre ellos.
- Salas de reunion con un asistente de pantalla: con `commands` como "show the agenda" o "start the timer", el agente responde a ordenes sin necesidad de que se pronuncie su nombre, manteniendose callado ante conversaciones dirigidas a personas.
- Asistentes de voz en entornos con varios hablantes y hablantes anonimos: al no requerir identificacion nominal, funciona en escenarios donde la diarizacion solo etiqueta hablantes como "Speaker 1" y "Speaker 2".
- Despliegue en hardware limitado: el build `agent-1x` en int8 (195 MB de descarga, unos 7 ms por linea en 1 vCPU) permite ejecutar la deteccion de turno en dispositivos con medio vCPU y 1 GiB de memoria, sin GPU.
- Reduccion de costes de LLM en pipelines de voz: al filtrar los turnos que no van dirigidos al agente antes de llegar al LLM, se evitan generaciones innecesarias y se reduce el consumo de tokens en conversaciones multiparticipante.
- Integracion en frameworks de agentes de voz basados en Pipecat: el componente `PipecatSidechat` se coloca en el pipeline entre el agregador de usuario y el LLM, con un ejemplo completo de bot en `examples/turn-management/turn-management-sidechat.py`.
- Investigacion sobre turn-taking y addressee detection: el modelo y su dataset de generacion (`pipecat-ai/sidechat-gen`) sirven como referencia para experimentos de deteccion de destinatario en conversaciones multiparticipante.

## Benchmarks y rendimiento

Resultados publicados en la model card. Las tres primeras filas se evaluan sobre Duplex-MPE (52.336 lineas); la cuarta, sobre peticiones grabadas insertadas en reuniones reales tal como las transcribio Deepgram.

| Metrica | Default (150M) | `agent-1x` (32M) |
|---|---|---|
| Peticiones que nombran al agente, respondidas | 99,6% | 99,7% |
| Lineas de personas respondidas por error | 0,2% | 0,3% |
| Lineas de personas retenidas para una pausa | 0,8% | 0,7% |
| Peticiones habladas reales sin el nombre, retenidas para una pausa | 91% | 87% |
| Tiempo por linea, int8, en 1 vCPU | 303 ms | 7 ms |
| Descarga, int8 | 325 MB | 195 MB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta disenado para ejecutarse en CPU.
- CPU: el build por defecto requiere 1 vCPU o mas; el build `agent-1x` funciona con 0,5 vCPU y 1 GiB de memoria.
- GPU: no se especifican GPU recomendadas; el modelo se distribuye en ONNX para inferencia en CPU.
- GPU de consumo: no aplica segun la informacion disponible.
- Despliegue: runtime propio del paquete `sidechat` (`sidechat.runtime.load`), integracion en Pipecat mediante `PipecatSidechat` y ficheros ONNX que pueden cargarse con cualquier runtime compatible con ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 303 ms por linea en int8 para el build por defecto y 7 ms por linea para `agent-1x`, ambos medidos en 1 vCPU. No se publica throughput.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables de deteccion de addressee o turn-taking en la informacion proporcionada. Como referencia interna, la comparativa entre los dos builds del propio modelo es la siguiente:

| Modelo | Parametros | Contexto | Latencia por linea (int8, 1 vCPU) | Descarga int8 | Licencia |
|---|---|---|---|---|---|
| Sidechat default | 150M | No disponible | 303 ms | 325 MB | BSD-2-Clause |
| Sidechat `agent-1x` | 32M (dos torres) | No disponible | 7 ms | 195 MB | BSD-2-Clause |
| Modelos alternativos de addressee detection | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo marcado como experimental (rc0.3.1): las salidas, los nombres y la calibracion pueden cambiar entre versiones.
- Solo soporta ingles; no hay soporte multilingue declarado.
- Las peticiones que solo el contexto identifica como dirigidas al agente son un punto debil reconocido por el autor (la model card se interrumpe en ese punto).
- El 91% (build por defecto) y el 87% (`agent-1x`) de las peticiones reales sin el nombre del agente se retienen para una pausa; solo se responden si nadie mas toma la palabra.
- El emparejamiento por `commands` es literal (palabras completas, sin distinguir mayusculas), por lo que las mismas palabras dichas a una persona tambien se responden; el autor recomienda listar peticiones ("show the agenda") y no palabras de uso comun ("the agenda").
- Riesgo de fallo si el servicio de speech-to-text no transcribe correctamente el nombre del agente; se recomienda configurarlo como keyterm (por ejemplo, en Deepgram).
- No se detallan sesgos conocidos ni tasas de alucinacion; al ser un clasificador y no un generador, el riesgo de alucinacion se limita a decisiones de clasificacion erroneas.
- Licencia BSD-2-Clause: permisiva y apta para uso comercial, con obligacion de conservar el aviso de copyright y la exencion de responsabilidad.
- La integracion en Pipecat depende del PR pipecat-ai/pipecat#6934, no publicado en el momento de redactar esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pipecat-ai/sidechat
- Codigo: https://github.com/pipecat-ai/sidechat
- Dataset de entrenamiento: https://huggingface.co/datasets/pipecat-ai/sidechat-gen
- Dataset de addressee detection: https://huggingface.co/datasets/ACloudCenter/ami-addressee
- Dataset de evaluacion Duplex-MPE: https://huggingface.co/datasets/ChengqianMa/Duplex-MPE
- Modelo base (150M): https://huggingface.co/jhu-clsp/ettin-encoder-150m
- Modelo base (32M): https://huggingface.co/jhu-clsp/ettin-encoder-32m
- PR de integracion en Pipecat: https://github.com/pipecat-ai/pipecat/pull/6934
- Framework Pipecat: https://github.com/pipecat-ai/pipecat
- Ejemplos de Pipecat: https://github.com/pipecat-ai/pipecat-examples
