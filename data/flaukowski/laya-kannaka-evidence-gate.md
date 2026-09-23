# flaukowski/laya-kannaka-evidence-gate

## Resumen

laya-kannaka-evidence-gate es un checkpoint de Laya, un modelo encoder de tipo ModernBERT-large con 421.293.830 parametros y 1024 tokens de contexto, ajustado para una unica decision tipada de tipo no autoregresivo: el campo `noul`, que responde a la pregunta "el fragmento contiene la informacion necesaria para responder a la pregunta?". La salida no es texto, sino una probabilidad calibrada `P(yes)`. Lo publica el usuario flaukowski (Kannaka Labs) sobre el checkpoint base convaiinnovations/laya, con licencia Apache-2.0.

El modelo no es un generador: es una cabeza de decision pensada para actuar como puerta de evidencia (evidence gate) dentro de un sustrato de memoria para agentes persistentes denominado Kannaka, una memoria de interferencia de ondas. En el flujo de recuperacion, la memoria produce candidatos para una pregunta y este checkpoint decide cuales merecen pasar al lector posterior. Corresponde al experimento E-L1b de kannaka-bench y es, segun su autor, el primer reflejo entrenado del sistema.

Su relevancia es acotada pero concreta: sobre 450 decisiones held-out generadas por el sistema Kannaka para 30 preguntas de LongMemEval-S con k=15, el checkpoint pasa de un AUROC de 0,748 (modelo base sin ajustar) a 0,963, con un Brier de 0,066, manteniendo la latencia en 20,6 ms por decision en una RTX 4090. El entrenamiento completo costo 390 segundos en una sola GPU. Es un modelo muy especializado, en ingles, sin descargas ni validacion externa registradas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder transformer, decisiones tipadas no autoregresivas) |
| Parametros totales | 421.293.830 (~421 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1024 tokens (los fragmentos de entrada se recortan a 2000 caracteres) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precision original, fp16 en entrenamiento); no hay GGUF, AWQ ni GPTQ publicados |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repo 0,8 GB) |
| Modelo base | convaiinnovations/laya |
| Cabezas de salida | `noul` (entrenada en este checkpoint); `choice` y `score` heredadas sin reentrenar |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-22 |

## Arquitectura y entrenamiento

La arquitectura es la del checkpoint base Laya: un encoder ModernBERT-large de 421 M de parametros que no genera tokens de forma autoregresiva, sino que produce decisiones tipadas sobre un estado de entrada estructurado. En este caso el estado es `{"question": "...", "excerpt": "role: turn text"}` y la respuesta es una probabilidad calibrada en el campo `noul`. El modelo conserva las cabezas `choice` y `score` del modelo base, que no recibieron entrenamiento nuevo y deben tratarse como las originales.

Los datos de ajuste son 4180 filas (pregunta, turno) construidas con `build_e_l1b_dataset.py` a partir de LongMemEval-S: todos los turnos con `has_answer` de las 470 preguntas fuera de las 30 estandar (836 positivos), mas 4 negativos muestreados por positivo, extraidos preferentemente de la misma sesion que un positivo (3320 negativos duros de un total de 3344). Los objetivos son 0/1 duros. La receta reutiliza el cuaderno RLCD del proyecto original (grupos de logits con ruido de media cero puntuados por reglas de scoring propias y entropia cruzada suave), reducida a una sola GPU: 4 epocas, micro-lote 8, acumulacion de gradiente 8, LR de encoder 2,5e-5, LR de cabeza 1e-4, scheduler coseno, fp16 y gradient checkpointing. Tras el entrenamiento se ajusto la temperatura por cabeza: `choice` 1,637, `score` 1,251 y `noul` 4,976. El computo total fue una RTX 4090 en qBraid, 390 segundos a unos 5 pasos por segundo, con un coste aproximado de 26 creditos de qBraid (unos 0,26 USD) incluyendo ambas evaluaciones.

## Capacidades

- Clasificacion binaria calibrada de evidencia: dado un par (pregunta, fragmento), devuelve `P(yes)` para la pregunta "el fragmento contiene informacion necesaria para responder a la pregunta?".
- Actuacion como puerta de filtrado: con umbral `P(yes) >= 0,5` conserva 41 de 43 turnos de evidencia y marca 69 de 450 candidatos, reduciendo la entrada al lector de 15 filas a unas 2,3 por pregunta.
- Decisiones tipadas: el modelo acepta un esquema de decision con tipo e instrucciones y responde en el campo correspondiente, en lugar de generar texto libre.
- Integracion como componente de agente: se usa dentro del ciclo de recuperacion de memoria de Kannaka, no como modelo conversacional autonomo.
- Latencia baja y estable: 20,6 ms por decision medida en RTX 4090, identica a la del modelo base.
- No soporta generacion de texto, razonamiento multi-paso, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes por si mismo; solo aporta la senal de filtrado que un agente puede consumir.
- Capacidades multilingues: no disponibles; solo ingles.
- Capacidad especial: calibracion explicita de la probabilidad (temperatura ajustada a 4,976 para la cabeza `noul`) y evaluacion pre-registrada con regla de aceptacion AUROC >= 0,85 y Brier <= 0,15.

## Casos de uso

- Filtrado de evidencia en memoria persistente de agentes: en el ciclo de recall de Kannaka, la memoria genera 15 candidatos por pregunta y este checkpoint los reduce a unas 2,3 filas conservando el 95% de los turnos de evidencia, lo que reduce el contexto que consume el lector posterior.
- Prefiltro en pipelines RAG con historial de conversacion: antes de enviar turnos recuperados a un LLM lector, el gate descarta los que no contienen respuesta, recortando tokens de prompt y coste por consulta.
- Atencion al cliente con sesiones largas: dado un historial de usuario y una pregunta entrante, el modelo marca que turnos del historial contienen la respuesta, de modo que el agente solo cite esos pasajes.
- Asistentes personales con memoria a largo plazo: evaluado sobre el formato LongMemEval-S, encaja en escenarios de memoria de usuario donde hay que decidir si un recuerdo concreto responde a la consulta actual.
- Anotacion asistida de datasets de dialogo: uso como etiquetador debil para marcar turnos con respuesta en corpus de conversaciones, con la probabilidad calibrada como criterio de confianza para revision humana.
- Optimizacion de coste en inferencia con contexto largo: al reducir el numero de filas enviadas al modelo lector, baja el consumo de tokens de entrada en pipelines de produccion con ventanas grandes.
- Componente de evaluacion de sistemas de memoria: sirve para medir si un sustrato de memoria recupera evidencia relevante, al margen del modelo lector final, en experimentos reproducibles tipo kannaka-bench.

## Benchmarks y rendimiento

Conjunto de test: las 450 decisiones (pregunta, candidato) que la memoria Kannaka medium produjo realmente para las 30 preguntas estandar de LongMemEval-S con k=15, ninguna presente en entrenamiento.

| Modelo | AUROC | Brier | ECE | Precision @0,5 | Recall @0,5 | Latencia por decision (RTX 4090) |
|---|---|---|---|---|---|---|
| convaiinnovations/laya sin ajustar | 0,748 | 0,092 | 0,057 | 0,25 | 0,19 | 20,6 ms |
| flaukowski/laya-kannaka-evidence-gate | 0,963 | 0,066 | 0,066 | 0,59 | 0,95 | 20,6 ms |

La regla pre-registrada (AUROC >= 0,85 y Brier <= 0,15) se cumple. El autor indica que si la puerta mejora las respuestas finales es objeto del siguiente experimento (E-L1c) y no una afirmacion de esta ficha. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,84 GB solo pesos en fp16 y 1,69 GB en fp32; con activaciones y lote pequeno, el consumo realista se situa en torno a 1,5-2 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; la medicion de latencia publicada se hizo en una RTX 4090. No se reportan cifras para A100, H100 ni otros aceleradores.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer con 4 GB o mas de VRAM, e incluso en CPU para cargas de baja concurrencia dado el tamano del modelo.
- Opciones de despliegue: el propio paquete `laya` (cliente Python del proyecto, con `laya.Agent(...)` y `agent.predict(...)`) o PyTorch/Transformers al ser un encoder estandar. vLLM y TGI no aplican al no ser un modelo autoregresivo; llama.cpp requeriria una conversion a GGUF que no esta publicada.
- Latencia y throughput: 20,6 ms por decision en RTX 4090, equivalente a unas 48 decisiones por segundo en flujo unico. El throughput con batching no se reporta.
- Entrenamiento reproducible en una sola RTX 4090: 390 segundos a ~5 pasos/s, con micro-lote 8 y acumulacion 8 en fp16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AUROC en el test de E-L1b | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flaukowski/laya-kannaka-evidence-gate | 421 M | 1024 tokens | 0,963 | Apache-2.0 | HuggingFace, 0,8 GB |
| convaiinnovations/laya (base) | 421 M | no disponible en la informacion proporcionada | 0,748 | Apache-2.0 | HuggingFace |
| Rerankers cross-encoder genericos (por ejemplo, modelos tipo bge-reranker) | no disponible | no disponible | no disponible (no evaluados sobre este conjunto) | varia | HuggingFace |

No se han encontrado en la informacion proporcionada otros modelos publicados especificamente como puertas de evidencia sobre LongMemEval con metricas directamente comparables. Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo ni sobre su ecosistema.

## Limitaciones y advertencias

- La muestra held-out contiene solo 43 positivos, por lo que el error estandar del AUROC es de aproximadamente ±0,03; las metricas son fragiles ante cambios de distribucion.
- Los negativos se muestrearon por pregunta dentro del mismo haystack. Los distractores entre preguntas, tal como los presentaria un almacen en produccion, no estaban en entrenamiento.
- Solo ingles: hereda el tokenizador y el encoder del checkpoint base.
- Contexto limitado a 1024 tokens y recorte de fragmentos a 2000 caracteres; entradas mas largas se truncan y pueden perder la evidencia.
- Las cabezas `choice` y `score` no se entrenaron con datos nuevos y deben considerarse las del modelo base; no se debe confiar en su calibracion.
- Riesgo de alucinacion: no aplica a generacion de texto porque el modelo no genera, pero si puede producir falsos positivos de evidencia (precision 0,59 con umbral 0,5), es decir, marcar fragmentos que no contienen la respuesta.
- El modelo esta calibrado sobre la distribucion de candidatos que produce la memoria Kannaka; fuera de ese flujo la calibracion puede degradarse.
- Licencia Apache-2.0 para los pesos, pero los datos de entrenamiento derivan de LongMemEval (Wu et al.), usado bajo su propia licencia para investigacion; conviene revisar las condiciones de ese corpus antes de un uso comercial.
- Sin adopcion registrada (0 descargas, 0 likes) ni validacion independiente; el rendimiento reportado procede del propio autor y de un unico experimento.
- No se ha demostrado que mejorar la puerta mejore las respuestas finales del agente; esa hipotesis queda para el experimento E-L1c.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flaukowski/laya-kannaka-evidence-gate
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio de Laya: https://github.com/NandhaKishorM/laya
- Kannaka memory: https://github.com/kannaka-labs/kannaka-memory
- kannaka-bench (incluye `experiments/laya_reflex/` y `RESULTS.md`): https://github.com/kannaka-labs/kannaka-bench
- LongMemEval (Wu et al.): citado en la model card sin enlace directo; enlace no disponible en la informacion proporcionada
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo.
