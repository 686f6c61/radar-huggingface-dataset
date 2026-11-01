# debudash/qwen3-4b-tz-convert-v3-n12000

## Resumen

`qwen3-4b-tz-convert-v3-n12000` es un adaptador QLoRA publicado por el usuario debudash sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. Su unico proposito es la conversion de fechas y horas entre zonas horarias IANA bajo una especificacion cerrada (el "tz-convert spec"), devolviendo siempre una sola linea en formato `YYYY-MM-DDTHH:MM:SS±HH:MM`, o bien una marca explicita `AMBIGUOUS: <componente>` / `INVALID: <componente>` cuando la conversion no puede resolverse sin adivinar. El adaptador no es un modelo generalista: es una especializacion deliberada que sustituye el comportamiento conversacional del base por una funcion determinista de conversion horaria.

El modelo resuelve un problema concreto y medible: los LLM generalistas fallan de forma sistematica al convertir horas entre zonas horarias, especialmente en cambios de horario de verano, y tienden a inventar un resultado plausible en lugar de declarar ambiguedad. El adaptador se entrena con 12.000 ejemplos cuyas respuestas fueron calculadas por un oraculo exacto (solo la formulacion de los mensajes de usuario la genero un modelo profesor de frontera), lo que garantiza que las etiquetas no contienen errores de conversion.

Es relevante por su enfoque metodologico: demuestra que un adaptador LoRA de rango 16 sobre un modelo de 4.000 millones de parametros puede alcanzar cotas cercanas a modelos frontera en una tarea estrecha y verificable, con un coste de entrenamiento de 43,4 minutos en una sola H100. La licencia Apache 2.0 y el formato PEFT facilitan su integracion en pipelines existentes de vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA/QLoRA (PEFT) |
| Parametros totales | 4.000 millones (modelo base Qwen3-4B-Instruct-2507); el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso max length 1536) |
| Tipos de cuantizacion | Base entrenado en 4-bit NF4 con computo bf16; el adaptador se distribuye en safetensors (precision completa del adaptador) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base Qwen/Qwen3-4B-Instruct-2507 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.000 millones de parametros. El entrenamiento es QLoRA: el modelo base se carga en 4 bits NF4 con computo en bf16 y se entrenan adaptadores LoRA de rango 16, alpha 32 y dropout 0,05 sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. La perdida se calcula unicamente sobre los tokens del asistente, con 3 epocas, learning rate 0,0002, warmup del 3 por ciento, decaimiento coseno, batch 8 con acumulacion de gradiente 2, longitud maxima 1536 y semilla 7. El entrenamiento completo tardo 43,4 minutos en una H100 en Modal.

El dataset `debudash/tz-convert-sft` (config `v3`, 12.000 ejemplos) se construyo con un oraculo exacto para todas las respuestas; solo la redaccion de los mensajes de usuario provino de un modelo profesor de frontera. El mundo esta cerrado a 24 zonas IANA, abreviaturas listadas y fechas de origen entre 2020 y 2030, con tzdata 2026e. Todos los checkpoints del proyecto usaron los mismos hiperparametros: cada mejora provino de un cambio en los datos, no en la configuracion de entrenamiento. El adaptador fue entrenado con un system prompt fijo que debe usarse literalmente: "You convert date-times between timezones under the tz-convert spec. Reply with exactly one line."

## Capacidades

- Conversion de fecha-hora entre zonas horarias IANA en una sola linea con formato `YYYY-MM-DDTHH:MM:SS±HH:MM`.
- Deteccion y declaracion de ambiguedad: devuelve `AMBIGUOUS: <componente>` cuando la conversion requiere adivinar (por ejemplo, horas duplicadas o inexistentes por cambio de horario de verano).
- Deteccion y declaracion de invalidez: devuelve `INVALID: <componente>` para zonas fuera de las 24 soportadas, abreviaturas no listadas o fechas fuera de 2020-2030.
- Persistencia del comportamiento a lo largo de conversaciones multi-turno, incluida la resistencia a la insistencia del usuario (drift del 75,7 por ciento de conversaciones mantenidas).
- Manejo de cambios de zona dentro de una conversacion, aunque con la limitacion documentada en ISSUE-002 para cambios de zona que no especifican el rol (origen o destino).
- Generacion de texto conversacional heredada del base Qwen3, aunque el adaptador la canaliza hacia el formato de una linea.
- No soporta tool calling, vision, audio ni modos de razonamiento extendido de forma nativa en este adaptador.

## Casos de uso

- Normalizacion de timestamps en pipelines de datos: el adaptador convierte marcas temporales entre zonas con formato ISO 8601 estricto y una sola linea de salida, lo que simplifica el parseo en etapas posteriores de ETL sin necesidad de logica de post-procesado.
- Programacion de reuniones internacionales: dado un instante en la zona del organizador, el modelo devuelve la hora equivalente en la zona del participante y marca `AMBIGUOUS` si la hora cae en un salto de horario de verano, evitando agendar en horas inexistentes.
- Validacion de registros de auditoria: para verificar que un log con hora local y zona es coherente con un instante UTC de referencia, el adaptador actua como comprobador determinista dentro de un rango de fechas 2020-2030.
- Atencion al cliente con contexto temporal: en un chatbot que gestiona citas, el adaptador mantiene la coherencia horaria a lo largo de turnos multiples (75,7 por ciento de conversaciones sin deriva) y declara ambiguedad en lugar de inventar una hora.
- Generacion de fixtures de test: el adaptador produce pares de conversion correctos para pruebas unitarias de librerias de fechas, con salida en formato fijo y casos de error explicitos (`AMBIGUOUS`/`INVALID`) que sirven como casos limite.
- Enrutamiento de tareas en sistemas agenticos: como subcomponente especializado, el adaptador puede invocarse cuando un agente detecta una peticion de conversion horaria, liberando al modelo principal de una tarea en la que los generalistas fallan con frecuencia.
- Verificacion de formularios web: al recibir una fecha y zona introducidas por un usuario, el adaptador puede confirmar la hora normalizada o senalar la ambiguedad antes de persistir el dato en base de datos.

## Benchmarks y rendimiento

Evaluacion con juez LLM (Claude Haiku 5.5) contra la respuesta del oraculo, una sola ejecucion, decodificacion greedy.

| Modelo | Adherencia a la especificacion | Robustez | Deriva: conversaciones mantenidas |
|---|---|---|---|
| Qwen3-4B-Instruct base, especificacion completa + tablas en el prompt | 12,0% | 23,3% | 0,0% |
| Este adaptador (system prompt de una linea) | 72,0% | 84,5% | 75,7% |
| Claude Sonnet 5.5, mejor prompt, razonamiento activado | 88,7% | 90,0% | 76,4% |
| Mistral Large 4, mejor prompt, razonamiento activado | 97,3% | 92,9% | 57,1% |

Adherencia: 50 escenarios limpios de un solo turno. Robustez: 47 escenarios adversariales y multi-turno (153 turnos en total; diferencias por debajo de unos 8 puntos son ruido). Deriva: 70 conversaciones, 485 turnos (unos 10 puntos de ruido).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 4.000 millones de parametros ocupa aproximadamente 8 GB en bf16/fp16; en cuantizacion 4-bit (NF4 o GGUF Q4) baja a unos 3-4 GB, mas el adaptador LoRA (repo de 0,1 GB).
- GPU recomendadas: H100 o A100 para servir con vLLM y LoRA habilitado en produccion; una RTX 4090 (24 GB) es suficiente para inferencia en bf16 con margen amplio.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16 y en tarjetas de 6-8 GB con cuantizacion 4-bit; el ejemplo del autor usa vLLM con `enable_lora=True` y `max_lora_rank=64`.
- Opciones de despliegue: vLLM con `LoRARequest` (metodo documentado por el autor); al ser un adaptador PEFT, tambien puede cargarse con Transformers + PEFT. No se documenta soporte directo en llama.cpp u Ollama, que requeririan fusionar el adaptador en el base y exportar a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; el entrenamiento (no la inferencia) tardo 43,4 minutos en una H100.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Adherencia | Robustez | Deriva | Licencia |
|---|---|---|---|---|---|---|
| Este adaptador (Qwen3-4B + LoRA) | 4.000 M + LoRA | no disponible | 72,0% | 84,5% | 75,7% | Apache 2.0 |
| Qwen3-4B-Instruct-2507 base (prompt completo) | 4.000 M | no disponible | 12,0% | 23,3% | 0,0% | Apache 2.0 |
| Claude Sonnet 5.5 (razonamiento) | no disponible | no disponible | 88,7% | 90,0% | 76,4% | propietaria |
| Mistral Large 4 (razonamiento) | no disponible | no disponible | 97,3% | 92,9% | 57,1% | propietaria |

La comparativa se limita a los modelos medidos en la model card; no se dispone de datos de otros adaptadores especializados equivalentes.

## Limitaciones y advertencias

- Aritmetica de conversion: es la principal debilidad; la mayoria de fallos restantes son una hora incorrecta (a menudo exactamente 1 h), que se propaga en turnos posteriores de una conversacion.
- Mundo cerrado: las zonas fuera de las 24 listadas, las abreviaturas no listadas y las fechas fuera de 2020-2030 se marcan como `INVALID` por diseno; no son errores, pero limitan el ambito de uso.
- Caveat de distribucion: los siete patrones de deriva aparecen en los datos de entrenamiento (con otra redaccion y valores), por lo que la puntuacion de deriva mide esos patrones en distribucion.
- ISSUE-002: tras una marca `AMBIGUOUS: source_timezone`, un cambio de zona que no especifica que zona reemplaza ("Make that Asia/Tokyo.") se interpreta como origen y se convierte (0/8 en la prueba; los cambios de destino con rol explicito aciertan 12/12).
- Idioma: solo ingles; el system prompt debe usarse literalmente como fue entrenado, sin traduccion.
- Riesgo de alucinacion: mitigado por el diseno (respuestas de una linea y marcas explicitas de ambiguedad/invalidez), pero persiste en la aritmetica horaria.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales conocidas; el modelo base Qwen3-4B-Instruct-2507 tambien es Apache 2.0.
- Advertencia de produccion: el adaptador no debe usarse como modelo conversacional general; su comportamiento esta sobreajustado a la tarea de conversion y el base subyacente conserva sus propios sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/debudash/qwen3-4b-tz-convert-v3-n12000
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/debudash/tz-convert-sft
- Especificacion de comportamiento: https://huggingface.co/debudash/slm-training/blob/main/behaviour.spec
- Repositorio de codigo y evaluacion: https://huggingface.co/debudash/slm-training
- Registro de incidencias (ISSUE-002): docs/ISSUE_LOG.md en el repositorio de codigo
