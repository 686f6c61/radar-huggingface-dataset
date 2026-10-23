# Adityapande403/universal-json-extractor

## Resumen

Universal JSON Extractor es un adaptador LoRA publicado por Adityapande403 sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Su proposito es acotado y explicito: recibir un JSON Schema arbitrario junto con texto no estructurado y ruidoso (salidas de OCR, logs, tickets, tablas desordenadas o conversaciones de soporte) y devolver un unico objeto JSON que cumpla ese esquema, sin campos inventados y con abstención cuando falta informacion obligatoria.

El modelo no pretende ser un asistente generalista. Se entrenó sobre 30.000 ejemplos sinteticos de extraccion con restricciones estrictas de JSON Schema, segun declara su model card, e incorpora dos mecanicas de diseno relevantes: un tratamiento del texto de origen como dato pasivo delimitado por marcas `<UNTRUSTED_SOURCE_TEXT>` para reducir el riesgo de inyeccion de instrucciones, y una politica de no alucinacion con abstención cuando los campos requeridos no aparecen en la entrada.

Es relevante ahora por su perfil de despliegue: al ser un adaptador sobre un modelo de 1,5B, puede ejecutarse en GPU de consumo e incluso en CPU tras fusionar y cuantizar, lo que lo hace candidato para tareas de normalizacion y extraccion en local, sin depender de APIs externas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados numericos de evaluacion, por lo que debe considerarse un artefacto sin validacion externa todavia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only: Qwen2.5-1.5B-Instruct |
| Parametros totales | Aproximadamente 1,5B en el modelo base mas el adaptador LoRA (tamano del adaptador no especificado; repositorio de 0,1 GB) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada. El modelo base declara 32.768 tokens de forma nativa (dato del modelo base, no verificado en esta ficha) |
| Tipos de cuantizacion | El repositorio solo contiene el adaptador en safetensors; no se publican pesos cuantizados. La model card menciona ejecucion via GGUF/Ollama, pero no hay ficheros GGUF publicados: requeriria fusionar el adaptador y cuantizar |
| Idiomas soportados | No disponible. Las plantillas de prompt documentadas estan en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria `peft`); requiere el modelo base Qwen/Qwen2.5-1.5B-Instruct |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-1.5B-Instruct, un transformer decoder-only, sobre el que se aplica un ajuste fino mediante LoRA (Low-Rank Adaptation). El repositorio no publica el rango del adaptador, los hiperparametros de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO adicionales; la unica informacion disponible es que se usaron 30.000 ejemplos sinteticos de extraccion con restricciones estrictas de JSON Schema y que el dataset esta etiquetado como `custom`.

El diseno de la tarea es lo mas diferencial. El prompt separa explicitamente el esquema objetivo (`<TARGET_JSON_SCHEMA>`) del texto de origen (`<UNTRUSTED_SOURCE_TEXT>`), de modo que cualquier instruccion incrustada en el texto de entrada se trata como contenido pasivo y no como orden. La model card afirma una politica de no alucinacion y abstención cuando los campos requeridos no estan presentes, y la generacion documentada es determinista (`do_sample=False`, `max_new_tokens=512`), lo que encaja con un uso como motor de extraccion reproducible y no como generador conversacional.

## Capacidades

- Extraccion de informacion guiada por esquema: genera objetos JSON que cumplen un JSON Schema proporcionado en tiempo de inferencia.
- Cumplimiento estricto de restricciones de esquema, incluidos tipos unions como `["number", "null"]` y `additionalProperties: false` en los ejemplos documentados.
- Abstención y mapeo a `null` cuando los campos requeridos no aparecen en el texto de origen, segun la politica declarada en la model card.
- Tratamiento del texto de entrada como no confiable: delimitacion con marcadores y aislamiento frente a inyeccion de prompt.
- Generacion de texto general y conversacion: heredadas del modelo base, aunque fuera del objetivo del ajuste fino.
- Salida estructurada apta para validacion automatica con validadores de JSON Schema en produccion.
- Capacidades multilingues: no documentadas para este adaptador; las plantillas estan en ingles.
- No se documentan capacidades de vision, audio, tool calling nativo ni modos de razonamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- Extraccion de campos desde logs de dispositivos y telemetria: el ejemplo de la model card (`dev=EC200U-07; temp 72.4C; modem ERROR 304`) se convierte directamente en un JSON con `device_id`, `temperature_c` y `error_code`, valido para alimentar un pipeline de monitorizacion sin parsing ad hoc con expresiones regulares.
- Normalizacion de salidas OCR: facturas, albaranes o etiquetas escaneadas llegan con ruido y formato inconsistente; el modelo recibe el texto crudo y un esquema contable fijo y devuelve importes, fechas y CIF listos para insercion en base de datos.
- Procesamiento de tickets de soporte: con un esquema de severidad, producto, codigo de error y resumen, se puede clasificar y enriquecer cada ticket de forma determinista antes de encolarlo, aprovechando la politica de abstención para marcar casos incompletos.
- ETL de datos no estructurados a almacenamiento columnar: sustituto de parsers manuales en ingestas periodicas donde el esquema de destino esta fijado y solo varia el texto de origen.
- Guardrail de entradas no confiables en agentes: al tratar el texto de origen como dato pasivo, el adaptador sirve como primera etapa que sanitiza y estructura contenido externo (correos, webs, respuestas de usuario) antes de que otro sistema lo procese.
- Enriquecimiento de conversaciones de atencion al cliente: extraer motivo de contacto, producto y sentimiento desde un chat multi-turno hacia un JSON con campos cerrados, para analitica o enrutado automatico.
- Ejecucion local o en el borde: al caber en GPU de consumo y poder convertirse a GGUF, permite extraccion estructurada en entornos sin salida a Internet o con requisitos de residencia de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara la metrica `accuracy` en sus metadatos y menciona un repositorio de GitHub con scripts de evaluacion, pero no incluye ningun valor numerico (ni MMLU, ni HumanEval, ni metricas de exactitud de extraccion) ni comparaciones con otros modelos. No se deben asumir cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en bf16/fp16: en torno a 3 GB de pesos mas overhead de activaciones y cache KV; aproximadamente 4 GB en total con contexto corto.
- VRAM estimada en 8 bits: alrededor de 1,6-2 GB de pesos. En 4 bits (GGUF Q4 tras fusion y conversion): del orden de 1 GB de pesos.
- El adaptador LoRA anade un consumo marginal (repositorio de 0,1 GB) y se puede fusionar en los pesos base para simplificar el despliegue.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4070/4080/4090 y en la RTX 5060 Ti que cita el autor. Tambien en GPUs de 4-6 GB usando cuantizacion.
- CPU: viable tras fusionar el adaptador y convertir a GGUF; el autor menciona Ollama como via de ejecucion local.
- Despliegue: `transformers` + `peft` (ruta documentada), vLLM o TGI tras fusionar el adaptador en un modelo completo, llama.cpp/Ollama tras conversion a GGUF, y el codigo FastAPI que el autor referencia en su repositorio de GitHub.
- Latencia y throughput: no disponibles. La generacion documentada es greedy (`do_sample=False`), lo que reduce la latencia frente a muestreo, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| universal-json-extractor (este) | ~1,5B (base) + LoRA | No disponible en la ficha del adaptador | Extraccion JSON guiada por esquema, con abstención y anti-inyeccion | Apache 2.0 | Adaptador PEFT en HuggingFace, 0 descargas, sin benchmarks publicados |
| Qwen/Qwen2.5-1.5B-Instruct (base) | ~1,5B | 32.768 tokens | Asistente generalista; la extraccion JSON estricta depende del prompt | Apache 2.0 | Muy extendido, amplio ecosistema de cuantizaciones |
| Llama 3.2 1B Instruct | ~1,24B | 128.000 tokens | Asistente generalista ligero, multilingue | Licencia comunitaria Llama 3.2 | Amplia disponibilidad y soporte en llama.cpp, Ollama y vLLM |
| Alternativas especializadas en extraccion (familia NuExtract y similares) | 0,5B-3B segun variante | No disponible | Extraccion de informacion con plantillas propias | Varía segun variante | Existentes en HuggingFace; datos no verificados en esta ficha |

La comparacion relevante es contra el propio modelo base: este adaptador anade disciplina de esquema y abstención a costa de especializacion, pero carece de los benchmarks y del historial de uso que si acompanan a Qwen2.5-1.5B-Instruct y a Llama 3.2 1B.

## Limitaciones y advertencias

- Ausencia total de evaluacion publica: no hay numeros de exactitud, ni de adherencia al esquema, ni de tasa de alucinacion. Las afirmaciones de "zero hallucination" y de cumplimiento estricto son declaraciones del autor, no verificadas de forma independiente.
- Modelo sin traccion: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia (23/10/2026). No hay evidencia de uso en produccion ni incidencias reportadas.
- El repositorio solo contiene el adaptador; no se publican pesos fusionados ni ficheros GGUF pese a que la model card mencione GGUF/Ollama. Cualquier despliegue en CPU exige fusionar y cuantizar por cuenta propia.
- Dependencia obligatoria del modelo base Qwen2.5-1.5B-Instruct y de la libreria `peft`; el ejemplo de uso emplea `trust_remote_code=True`, lo que implica ejecutar codigo remoto del repositorio base.
- Capacidad limitada por el tamano: 1,5B de parametros restringen razonamiento complejo, esquemas muy anidados o textos de origen muy largos. La ventana de contexto efectiva del adaptador no esta documentada.
- Idiomas no declarados y plantillas en ingles: el rendimiento en castellano o en textos con acentos y caracteres no ASCII no esta verificado.
- La defensa anti-inyeccion se basa en marcadores en el prompt; no es una garantia criptografica ni un filtro determinista, y puede degradarse con entradas adversarias o plantillas mal construidas.
- Riesgo de alucinacion residual: aunque la politica de abstención este entrenada, no hay metricas que cuantifiquen falsos positivos en campos opcionales o en textos ambiguos.
- Licencia Apache 2.0: permite uso comercial y modificacion, con las obligaciones habituales de conservar avisos de licencia; el modelo base mantiene su propia licencia Apache 2.0. No hay garantias de ningun tipo.
- La fecha de creacion del repositorio es posterior a la de la mayoria de referencias del ecosistema; conviene revisar si el autor publica actualizaciones o resultados de evaluacion en el repositorio de GitHub.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Adityapande403/universal-json-extractor
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio GitHub del autor (generacion de datos, entrenamiento, evaluacion y despliegue FastAPI): https://github.com/adityapande403/Universal-JSON-Extractor
- Libreria PEFT: https://github.com/huggingface/peft
- No se han encontrado en la informacion disponible papers, blogs ni demos adicionales.
