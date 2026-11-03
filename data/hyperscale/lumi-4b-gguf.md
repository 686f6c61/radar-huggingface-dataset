# HyperScale/lumi-4b-GGUF

## Resumen

Lumi-4B es un modelo de generacion de texto de aproximadamente 4.000 millones de parametros (3.973.556.832 exactamente) desarrollado originalmente por CEIA (Centro de Excelencia en Inteligencia Artificial, Brasil) bajo el identificador `ceia-br/lumi-4b`. La version aqui descrita es una conversion a formato GGUF publicada por HyperScale, que empaqueta los pesos en un unico fichero Q4_K_M de 2,7 GB para su uso con llama.cpp y runtimes compatibles. El modelo esta especializado en portugues y emplea una arquitectura hibrida NemotronH que combina capas de espacio de estados Mamba-2 con capas de atencion clasica.

El problema que resuelve es el de disponer de un modelo conversacional de tamano contenido, orientado explicitamente al portugues, que pueda ejecutarse en hardware de consumo y con baja latencia. La cuantizacion Q4_K_M reduce el peso a 2,7 GB y permite inferencia en una GPU de 12 GB con velocidades cercanas a 99 tokens por segundo, lo que lo situa como candidato para tareas de resumen, extraccion de datos y generacion asistida en entornos con recursos limitados.

Es relevante ahora porque la mayoria de los modelos ligeros de calidad estan dominados por el ingles; Lumi-4B aporta una alternativa nativa en portugues con un modo de razonamiento ("thinking") activado por defecto en la plantilla de chat. La ficha se centra en la version GGUF, aunque se referencian datos del modelo base cuando estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida NemotronH (capas Mamba-2 / SSM combinadas con capas de atencion), densa (sin capas de expertos) |
| Parametros totales | 3.973.556.832 (~4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens (configurado en el ejemplo de llama-server con `-c 16384`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado en el repo) |
| Idiomas soportados | Portugues (pt) |
| Licencia | No disponible; la model card indica que el repositorio original no declara licencia y que se aplican los terminos del modelo original |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors segun el campo `base_model` |

## Arquitectura y entrenamiento

La arquitectura es NemotronH en variante densa: un transformer hibrido en el que parte de las capas se sustituyen por bloques de espacio de estados Mamba-2 y el resto mantiene atencion clasica. La model card de la conversion senala explicitamente que el modelo no tiene capa de expertos, lo que obligo a un script envoltorio (`convert_lumi.py`) para corregir la conversion: bajo transformers 5, `NemotronHConfig` rellena por defecto parametros de mezcla de expertos (`num_experts_per_tok`, `n_routed_experts`, `n_group`) y sustituye `hybrid_override_pattern` por `layers_block_type`, lo que hacia que el conversor estandar de llama.cpp generase un fichero `nemotron_h_moe` con anchos de MLP a cero e imposible de cargar. El envoltorio elimina las claves MoE y restaura el patron hibrido desde `config.json`.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La unica innovacion tecnica documentada es la correccion del pipeline de conversion a GGUF y la inclusion de un modo de razonamiento en la plantilla de chat, desactivable por peticion mediante `chat_template_kwargs`. La cuantizacion se realizo con `llama-quantize` sobre la build b11985 de llama.cpp.

## Capacidades

- Generacion de texto conversacional en portugues, con soporte multi-turno.
- Modo de razonamiento ("thinking") activado por defecto en la plantilla de chat; se puede desactivar por peticion con `"chat_template_kwargs": {"enable_thinking": false}`.
- Resumen de tareas y documentos con verificacion de hechos requeridos, segun el benchmark interno del autor de la conversion.
- Extraccion y consolidacion de datos estructurados (referencias, identificadores) en textos en portugues.
- Razonamiento de varios pasos mediante el modo thinking.
- Soporte de plantilla Jinja en llama.cpp (`--jinja`), lo que habilita el formateo de chat y potencialmente tool calling si la plantilla lo define (no documentado explicitamente).
- Capacidades multilingues limitadas al portugues segun la metadata del modelo.
- No se documentan capacidades de vision, audio ni tool calling nativo.

## Casos de uso

- Resumen de tareas y tickets en portugues: el modelo fue evaluado precisamente en un benchmark de 15 casos de resumen de tareas con comprobaciones deterministas (hechos requeridos, ausencia de estados falsos e identificadores inventados), donde obtuvo 0,96-0,97 de puntuacion. Es adecuado para resumir incidencias o correos en portugues con contexto de hasta 16k tokens.
- Asistente conversacional en portugues para atencion al cliente: con 4B parametros y ~99 tok/s en una RTX 3060, puede sostener conversaciones multi-turno en un servicio de bajo coste, siempre con `repeat_penalty 1.1` para evitar bucles.
- Extraccion de entidades y referencias en documentacion tecnica en portugues: el benchmark interno penaliza identificadores inventados, lo que indica un comportamiento razonable en tareas de extraccion literal.
- Generacion asistida en entornos de escritorio o portatiles con GPU de 8-12 GB: el fichero Q4_K_M de 2,7 GB y 3,1 GB de VRAM a 8k de contexto lo hacen viable en GPUs de consumo.
- Prototipado rapido de aplicaciones NLP en portugues sin depender de APIs en la nube: el despliegue con `llama-server` es directo y no requiere infraestructura especial.
- Procesamiento por lotes de textos en portugues en CPU o GPU modesta: llama.cpp permite ejecucion en CPU cuando no hay GPU disponible, aunque no se han publicado cifras de throughput en CPU.
- Filtrado y clasificacion de texto en portugues en pipelines de datos: el modelo puede usarse para tareas de resumen y reescritura dentro de un pipeline mayor, con la cautela de la penalizacion por repeticion.

## Benchmarks y rendimiento

La model card de la conversion publica un benchmark interno de 15 casos de resumen de tareas en portugues con comprobaciones deterministas (hechos requeridos, ausencia de afirmaciones de estado falsas, ausencia de identificadores inventados), decodificacion greedy y thinking desactivado:

| Runtime | Puntuacion | Afirmaciones falsas | Latencia |
|---|---|---|---|
| transformers, NF4 (bitsandbytes) | 0,97 | 0/15 | 4,5 s |
| llama.cpp Q4_K_M | 0,96 | 1/15 (bucle de repeticion) | 2,4 s |
| llama.cpp Q4_K_M, repeat_penalty 1.1 | 0,96 | 0/15 | 1,8 s |

Datos de rendimiento en hardware de consumo:

| Metrica | Valor |
|---|---|
| Velocidad de generacion (RTX 3060 12 GB, Q4_K_M) | ~99 tok/s |
| VRAM estimada a 8k de contexto | 3,1 GB |
| Tamano del fichero Q4_K_M | 2,7 GB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 3,1 GB con Q4_K_M y contexto de 8k; aproximadamente 3,5-4 GB a 16k de contexto (estimacion por crecimiento del KV cache, no publicada).
- GPU recomendadas: RTX 3060 12 GB (medida oficial), RTX 4060 Ti, RTX 4070, RTX 4090; en el ambito profesional, A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 4 GB de VRAM libre para el contexto de 8k; el modelo completo en Q4_K_M ocupa 2,7 GB en disco.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama (importando el GGUF), y cualquier runtime compatible con GGUF; el ejemplo oficial usa `llama-server -m lumi-4b-Q4_K_M.gguf -ngl 99 -c 16384 --jinja --repeat-penalty 1.1`.
- Latencia y throughput: ~99 tok/s de generacion en RTX 3060 12 GB; latencia de 1,8 s por caso en el benchmark interno con penalizacion de repeticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Lumi-4B (esta ficha) | ~4B denso, hibrido Mamba-2/atencion | 16k (configurado) | Portugues | No disponible | GGUF, safetensors (base) |
| Qwen2.5-3B | ~3B denso | 32k | Multilingue (incluye portugues) | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 3B | ~3B denso | 128k | Multilingue (incluye portugues) | Llama 3.2 Community License | safetensors, GGUF |
| Gemma 2 2B | ~2B denso | 8k | Multilingue (incluye portugues) | Gemma Terms of Use | safetensors, GGUF |

La comparativa se limita a parametros, contexto y licencia porque no hay benchmarks publicos de Lumi-4B frente a estos modelos. La ventaja principal de Lumi-4B es su especializacion en portugues y su arquitectura hibrida, que reduce el coste de atencion en contextos largos; la desventaja es la ausencia de licencia declarada y la falta de datos de evaluacion estandar.

## Limitaciones y advertencias

- Licencia no disponible: el repositorio original no declara licencia, por lo que el uso comercial queda en un limbo legal; hay que contactar con CEIA antes de desplegarlo en produccion.
- Sesgos conocidos: no documentados; al estar entrenado principalmente en portugues, puede reflejar sesgos del corpus brasileno y tener un conocimiento limitado de variantes europeas del portugues.
- Riesgo de alucinacion: el benchmark interno detecta afirmaciones de estado falsas e identificadores inventados como criterios de fallo, lo que indica que el modelo puede generarlos; se recomienda verificacion posterior en tareas factuales.
- Bucles de repeticion: con decodificacion greedy y sin penalizacion, el modelo entro en bucle en 1 de 15 casos; es obligatorio usar `repeat_penalty 1.1` o superior.
- Limitacion de contexto: el contexto configurado en el ejemplo es de 16k; no se ha verificado el contexto nativo del modelo base ni su comportamiento mas alla de esa ventana.
- Limitacion de idioma: solo portugues segun la metadata; el rendimiento en castellano u otros idiomas no esta evaluado y probablemente sea deficiente.
- Conversion no oficial: la version GGUF la publica HyperScale, no CEIA; la correccion del conversor es un parche documentado y conviene validar los pesos contra el modelo original.
- Modo thinking activado por defecto: incrementa el consumo de tokens y la latencia; para tareas simples conviene desactivarlo explicitamente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni informes independientes de calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/HyperScale/lumi-4b-GGUF
- Modelo base: https://huggingface.co/ceia-br/lumi-4b
- CEIA (Centro de Excelencia en Inteligencia Artificial): no disponible en la informacion proporcionada
- Paper o blog de NemotronH: no disponible en la informacion proporcionada
- Documentacion de llama.cpp: no disponible en la informacion proporcionada
- Los resultados de busqueda web sobre "hyperscale" corresponden a HyperScale (revista de modelismo), Hyperscale computing (Wikipedia, IBM) y no guardan relacion con el autor del modelo; se descartan como fuentes.
