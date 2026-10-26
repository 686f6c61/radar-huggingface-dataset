# SNUH-HARI/hari-q3-8b-surgical-command-lora

## Resumen

hari-q3-8b-surgical-command-lora es un adaptador LoRA (PEFT) sobre el modelo base snuh/hari-q3-8b, desarrollado por SNUH-HARI, cuyo objetivo es convertir la transcripcion de una orden dictada por un cirujano (coreano con terminos medicos en ingles) en un comando estructurado en JSON que pueda ejecutar un robot humanoide de asistencia quirurgica. El adaptador no genera lenguaje libre: resuelve una tarea de slot-filling sobre un esquema fijo de acciones, objetivos y reglas de interpretacion definidas en el *system prompt*, e incluye la capacidad de rechazar o pedir aclaracion cuando la orden es ambigua o no va dirigida al robot.

El modelo es relevante por su relacion calidad/tamano: con 8.000 millones de parametros y solo 43,6 millones de parametros entrenables (0,53 % del total), alcanza un 93,1 % de acierto exacto en un benchmark propio de 495 items y 8 procedimientos, frente al 46,1 % del modelo base. En esa misma prueba iguala estadisticamente a modelos mucho mayores servidos por API (Qwen3.8 27B y Qwen3.8-Flash-Next 180B-A6B) y reduce a cero la tasa de ejecucion insegura sobre los 82 items que exigen rechazo o aclaracion. Es, por tanto, una pieza pensada para inferencia local en el entorno quirurgico, no para uso generalista.

La ficha se basa exclusivamente en la model card y en los metadatos de HuggingFace. No se dispone de informacion sobre la arquitectura interna del modelo base, su composicion de datos de preentrenamiento ni su ventana de contexto nativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo base snuh/hari-q3-8b; la arquitectura del base no se detalla en la informacion disponible |
| Parametros totales | Modelo base: ~8.000 M (denominacion "8b"). Adaptador: 43,6 M parametros entrenables (0,53 %) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el modelo base; el ejemplo de despliegue en vLLM usa max_model_len=4096 |
| Tipos de cuantizacion | No disponible (el benchmark se ejecuta en BF16; no se publican variantes GGUF/AWQ/GPTQ del adaptador) |
| Idiomas soportados | Coreano (ko) e ingles (en); en la practica, coreano con terminologia medica en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); repositorio de 0,2 GB |
| Rango LoRA | r=16, alpha=32, dropout 0,05, aplicado a todas las proyecciones de atencion y MLP |
| Tarea | Slot-filling / generacion de JSON con decodificacion guiada por esquema |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango 16 y alpha 32, con dropout 0,05, insertado en todas las proyecciones de atencion y MLP del modelo base snuh/hari-q3-8b. El entrenamiento actualiza 43,6 millones de parametros, un 0,53 % del total, con tasa de aprendizaje 2e-4, scheduler coseno y 5 % de warm-up, dos epocas, batch efectivo de 16 y calculo de la perdida unicamente sobre los tokens de respuesta. El modo *thinking* permanece desactivado durante el entrenamiento. Todo el ajuste se completo en una sola RTX 5090 en 53 minutos.

Los datos de entrenamiento son 3.312 ejemplos sinteticos generados a partir de 10 procedimientos quirurgicos que no aparecen en el benchmark de evaluacion (`train/train_v0.2.jsonl`). Incluyen 768 filas de origen rule-based, anadidas tras un analisis de errores de un adaptador anterior no publicado. La inferencia se plantea con decodificacion guiada por JSON Schema en vLLM, de modo que la salida siempre sea parseable y conforme al esquema de acciones del robot. El *system prompt* enumera el procedimiento, la fase, las acciones disponibles, los nombres de objetivos y las reglas de interpretacion, y es identico en entrenamiento y evaluacion (`code/bench/prompt.py`, esquema en `code/bench/schema.py`).

## Capacidades

- Conversion de una frase dictada (texto de ASR) en un comando JSON estructurado y ejecutable por un robot quirurgico.
- Slot-filling sobre un esquema predefinido: accion, objetivo, marco direccional y parametros de la orden.
- Deteccion de ordenes ambiguas: capacidad de pedir aclaracion en lugar de ejecutar (0,0 % de ejecucion insegura en los 82 items de rechazo/aclaracion del benchmark).
- Deteccion de parada: 100 % de recall en los 16 items de "stop" del conjunto de evaluacion.
- Manejo del contexto conversacional inmediato: el prompt incluye la ultima accion ejecutada por el robot (`[직전 로봇 동작]`), lo que permite resolver correcciones del tipo "no, muestra el lado IMA".
- Comprension de mezcla de idiomas: coreano coloquial con siglas y terminos anatomicos en ingles (IMV, IMA).
- Generacion con salida restringida por JSON Schema (structured outputs de vLLM).
- Capacidad de respuesta a preguntas medicas (KorMedMCQA) parcialmente mejorada, aunque el autor recomienda no usarla para ese fin.
- No soporta vision, audio ni tool calling generico: la entrada es texto y la salida es un JSON de comando.

## Casos de uso

- **Control por voz de un robot de asistencia quirurgica**: el adaptador recibe la transcripcion del ASR de sala y emite el JSON de accion que el brazo robotico o el asistente humanoide ejecuta; su latencia mediana de 0,62 s en una RTX 5090 encaja en el bucle de interaccion de un quirófano.
- **Capa de seguridad previa a la actuacion robotica**: ante ordenes ambiguas, incompletas o no dirigidas al robot, el modelo devuelve rechazo o peticion de aclaracion en lugar de una accion, lo que reduce el riesgo de movimientos no deseados.
- **Integracion en el pipeline de voz del quirofano**: sustituye a un LLM generalista servido por API en la etapa de interpretacion de comandos, eliminando la dependencia de red y la exposicion de datos clinicos a terceros, ya que el modelo corre en local.
- **Servicio multi-LoRA en vLLM**: el mismo modelo base puede atender simultaneamente el adaptador de comandos (para parsing de ordenes) y el modelo sin adaptar (para preguntas clinicas), como recomienda el autor, reduciendo el coste de infraestructura.
- **Pruebas de regresion de interfaces de voz quirurgicas**: el benchmark de 495 items y 8 procedimientos sirve como conjunto de validacion para comparar versiones del ASR, del prompt o del adaptador antes de desplegar en el quirofano.
- **Prototipado de asistentes para formacion quirurgica**: en entornos simulados, el modelo puede mapear instrucciones habladas a acciones de un maniqui o simulador, con la ventaja de que las definiciones de acciones son configurables por prompt.
- **Filtrado de conversacion no dirigida al robot**: el adaptador discrimina en cierta medida el habla de sala que no va dirigida al sistema (6,3 % de falsos positivos sobre 600 frases), util para evitar activaciones espurias.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el dataset `SNUH-HARI/kor-surgical-robot-voice-command` (495 items, 8 procedimientos):

| Metrica | hari-q3-8b (base) | + este adaptador | Qwen3.8 27B | Qwen3.8-Flash-Next 180B-A6B |
|---|---|---|---|---|
| Exactitud exacta (%) | 46,1 | **93,1** | 90,7 | 92,7 |
| Ejecucion insegura (%, 82 items de rechazo/aclaracion) | 43,9 | **0,0** | 9,8 | 15,9 |
| Recall de parada (%, 16 items) | 100 | 100 | 100 | 100 |
| Sobre-rechazo (%, 413 items de ejecucion) | 0,2 | 0,2 | 4,1 | 0,2 |
| Latencia mediana | 0,52 s | 0,62 s | 2,71 s (API) | 0,68 s (API) |

- Diferencia pareada frente al base: +47,1 puntos (IC 95 % 40,4–54,1, bootstrap por cluster sobre variantes de redaccion). Las diferencias frente a Qwen3.8 27B (+2,4; IC −2,0 a 6,9) y frente al modelo de 180B (+0,4; IC −3,6 a 4,8) **no son significativas**.
- Latencia medida con una peticion simultanea en una RTX 5090, vLLM, BF16 y decodificacion guiada por JSON Schema.
- Texto procedente de un ASR generico (voz sintetica → Qwen3-ASR-1.7B): 68,1 % de exactitud. Con el STT ajustado a quirofano (`vitaldb/qwen3-asr-1.7b-kor-or-lora`): 66,9 %.
- Conversacion de quirofano no dirigida al robot (600 frases): el modelo emite una accion en el 6,3 % de los casos (los modelos por API, entre 1,3 % y 2,5 %).
- KorMedMCQA (3.009 preguntas, generacion libre, thinking off): 57,7 % (base) → 63,7 % con el adaptador. En el conjunto de 49 preguntas del Zollinger's Atlas: 71,4 % → 63,3 % (no significativo; algunas respuestas largas entraban en bucle sin emitir la letra final).

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **Peso del adaptador**: 0,2 GB en safetensors; se carga junto al modelo base, por lo que el coste de VRAM lo domina el base de ~8.000 M de parametros.
- **VRAM estimada (calculada a partir del numero de parametros, no publicada por el autor)**: ~16 GB en BF16 solo para pesos, mas cache KV; ~9 GB en FP8 y ~5–6 GB en cuantizacion de 4 bits, en ambos casos con margen adicional para el contexto.
- **GPU recomendadas**: el autor valida el sistema en una RTX 5090, tanto para entrenamiento (53 minutos) como para inferencia (0,62 s de latencia mediana). Cabe en GPUs de consumo con 24 GB o mas en BF16 (RTX 4090, RTX 5090, RTX A6000); en cuantizacion de 4 bits podria entrar en GPUs de 8–12 GB, aunque esa configuracion no esta evaluada en la model card.
- **Despliegue**: vLLM con `enable_lora=True`, `max_lora_rank=64` y `max_model_len=4096`, usando `LoRARequest` y `StructuredOutputsParams(json=schema)`. El autor no documenta otras rutas (llama.cpp, Ollama, TGI) para este adaptador.
- **Latencia y throughput**: 0,62 s de latencia mediana con una unica peticion concurrente en RTX 5090, BF16, salida JSON guiada y `max_tokens=400`, `temperature=0`. No se publican datos de throughput agregado ni de batching.
- **CPU**: no se documenta una ruta de inferencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud en el benchmark | Ejecucion insegura | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| hari-q3-8b + este adaptador | ~8.000 M (43,6 M entrenables) | No disponible (ejemplo con 4096) | 93,1 % | 0,0 % | Apache 2.0 | Pesos abiertos en HF, inferencia local |
| hari-q3-8b (base, sin adaptador) | ~8.000 M | No disponible | 46,1 % | 43,9 % | No disponible en la informacion | Pesos abiertos en HF |
| Qwen3.8 27B | 27.000 M (aproximado por denominacion) | No disponible | 90,7 % | 9,8 % | No disponible en la informacion | Servido por API |
| Qwen3.8-Flash-Next 180B-A6B | 180.000 M totales / 6.000 M activos (MoE, por denominacion) | No disponible | 92,7 % | 15,9 % | No disponible en la informacion | Servido por API |

La comparacion relevante es que el adaptador iguala en exactitud a modelos 3,4x y 22x mayores sin diferencias estadisticamente significativas, y los supera ampliamente en la metrica critica de seguridad (0,0 % frente a 9,8 % y 15,9 % de ejecucion insegura). No se dispone de datos de contexto ni de licencia de los modelos Qwen citados en la informacion proporcionada.

## Limitaciones y advertencias

- **Etiquetas no revisadas por cirujanos**: los comandos y las etiquetas de referencia del benchmark fueron redactados por el equipo de investigacion con asistencia de LLM y aun no han sido validados por personal quirurgico; parte de la mejora refleja el aprendizaje de las convenciones de etiquetado del propio benchmark.
- **Posible optimismo del resultado**: las 768 filas rule-based se anadieron tras analizar los errores de un adaptador anterior sobre ese mismo benchmark (89,1 % de exactitud y 19,5 % de ejecucion insegura), por lo que la ganancia reportada puede estar sobreestimada.
- **Audio no evaluado**: solo se ha probado con texto limpio y una unica voz sintetica; no se evaluan audio real de quirofano, ruido ambiente ni habla solapada. Con ASR generico la exactitud cae al 68,1 % y con el STT especializado al 66,9 %, muy por debajo del 93,1 % sobre texto perfecto.
- **Falsos positivos ante habla de sala**: un 6,3 % de las 600 frases no dirigidas al robot producen una accion, frente al 1,3–2,5 % de los modelos por API. Requiere una capa adicional de activacion o confirmacion.
- **Rendimiento decreciente en QA medico**: en el conjunto de 49 preguntas del Zollinger's Atlas el adaptador baja de 71,4 % a 63,3 %, con respuestas largas que pueden entrar en bucle sin emitir la letra final. El autor recomienda explicitamente usar el adaptador solo para parsing de comandos y el modelo base para preguntas clinicas, mediante servicio multi-LoRA.
- **Dependencia del system prompt**: el esquema de acciones, los nombres de objetivos y las reglas de interpretacion se inyectan por prompt; cualquier cambio en la definicion de acciones exige reentrenar o al menos reevaluar.
- **Alineacion con la plataforma robotica**: las definiciones de acciones y el marco direccional deben coincidir con el robot real; no se incluye ninguna herramienta de validacion.
- **Ambito linguistico restringido**: solo coreano e ingles; no hay evidencia de funcionamiento en castellano.
- **Uso clinico**: se trata de un adaptador de investigacion con 0 descargas y 0 likes en el momento de la consulta, sin validacion regulatoria ni estudio prospectivo. No debe emplearse en un quirofano real sin validacion independiente y supervision humana.
- **Licencia**: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base snuh/hari-q3-8b, no incluida en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SNUH-HARI/hari-q3-8b-surgical-command-lora
- Modelo base: https://huggingface.co/snuh/hari-q3-8b
- Dataset de benchmark: https://huggingface.co/datasets/SNUH-HARI/kor-surgical-robot-voice-command (incluye `code/bench/prompt.py`, `code/bench/schema.py` y `train/train_v0.2.jsonl`)
- STT ajustado a quirofano citado: https://huggingface.co/vitaldb/qwen3-asr-1.7b-kor-or-lora
- ASR generico citado: Qwen3-ASR-1.7B (referenciado en la model card; no se proporciona URL directa)
- Financiacion: Korea ARPA-H Project, Korea Health Industry Development Institute (KHIDI), Ministry of Health and Welfare, Republic of Korea (RS-2025-25397510)
