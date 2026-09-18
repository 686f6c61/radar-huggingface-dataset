# baselquants/GLM-5.3-UNCENSORED-FP8

## Resumen

GLM-5.3-UNCENSORED-FP8 es una versión modificada a nivel de pesos del checkpoint GLM-5.3-FP8, publicada por el usuario baselquants en HuggingFace y atribuida en su model card al colectivo dealignai (bajo la etiqueta "CRACK"). Se trata de un modelo de lenguaje de 753.329.940.480 parámetros totales con arquitectura `glm_moe_dsa` (Mixture of Experts con atención dispersa), 78 capas y modalidad exclusivamente de texto. El checkpoint deriva de `JANGQ-AI/GLM-5.3-FP8`, a su vez una cuantización FP8 del modelo original `zai-org/GLM-5.3`.

El problema que aborda es la eliminación de comportamiento de rechazo ("abliteration") en los pesos, sin recurrir a fine-tuning, LoRA, hooks de runtime ni trucos de prompt. La modificación se aplica únicamente sobre los tensores residual-writer en bf16, mientras que los expertos FP8 enrutados permanecen intactos, lo que permite conservar la velocidad nativa de tensor cores FP8 en hardware Hopper. Es relevante ahora porque combina tres factores poco habituales a la vez: escala de 753B, cuantización FP8 nativa y una reducción deliberada de rechazos con preservación de capacidades declarada (MMLU 87,43 % en esta revisión v2).

El repositorio ocupa 755,7 GB y se publicó el 18 de septiembre de 2026. En el momento de redactar esta ficha registra 0 descargas y 0 likes, por lo que no existe validación independiente de la comunidad más allá de las pruebas de campo citadas por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (Mixture of Experts con atención dispersa), 78 capas, solo texto |
| Parametros totales | 753.329.940.480 (≈753B) |
| Parametros activos | no disponible (es MoE, pero el número de expertos y de parámetros activos no se documenta) |
| Longitud de contexto | 131.072 tokens en la configuración de ejemplo; techo práctico declarado de ~131K con MTP y ~160K sin MTP en TP8 sobre H200; el soporte de 1M vía decode-context-parallel no está operativo en vLLM para esta arquitectura |
| Tipos de cuantizacion | FP8 (checkpoint nativo FP8, expertos enrutados en FP8 sin modificar); no se documentan otras cuantizaciones |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es un transformer de tipo Mixture of Experts con atención dispersa identificado como `glm_moe_dsa`, de 78 capas y 753B de parámetros totales, en modalidad text-only. El checkpoint concreto es una cuantización FP8 (procedente de `JANGQ-AI/GLM-5.3-FP8`) en la que los expertos enrutados mantienen su formato FP8 original. Sobre esa base, la intervención del autor consiste en una edición permanente en bf16 de los tensores residual-writer, es decir, una abliteración a nivel de pesos que reduce la probabilidad de emisión de secuencias de rechazo. No hay fine-tuning, LoRA, hooks de inferencia ni modificación de prompts.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo original usó RLHF, DPO u otro método de alineación: esos datos no están publicados en la información disponible. Tampoco se documenta el número de expertos ni el ratio de activación. Como innovaciones técnicas relevantes cabe citar el soporte de decodificación especulativa MTP (no funcional en vLLM estándar, pero reportado como operativo en el fork de vLLM con MLA dispersa B12X, con +48 % de velocidad de decode en prompts de código) y la propia ruta de atención dispersa DSA, que exige `--enforce-eager` bajo concurrencia. La revisión v2 corrige un fallo de bucle de razonamiento que afectaba a aproximadamente el 2 % de los prompts con señal de rechazo más dura en la v1.

## Capacidades

- Generacion de texto conversacional y de formato largo, con `pipeline_tag: text-generation`.
- Razonamiento explicito en modo "thinking": el modelo emite bloques `<think>` y el texto de razonamiento se recupera en `message.reasoning` (no en `message.reasoning_content`).
- Control de esfuerzo de razonamiento mediante `reasoning_effort`, aunque en este checkpoint solo se honran los valores `"low"` y `"high"`; cualquier otro valor (`off`, `medium`, `max`, ausente) cae a `max` y no existe forma de desactivar el razonamiento.
- Tool calling y function calling: la configuración de servicio incluye `--tool-call-parser glm47` y `--enable-auto-tool-choice`, lo que habilita uso agéntico.
- Flujos agénticos multi-paso y bucles de herramientas, con la advertencia de que en FP8 conviene `reasoning_effort="low"` para evitar agotar el presupuesto de tokens dentro del bloque de razonamiento.
- Capacidad multilingue declarada en diez idiomas: ingles, chino, ruso, serbio, hindi, frances, espanol, arabe, coreano y japones.
- Decodificacion especulativa MTP en el fork de vLLM con backend `B12X_MLA_SPARSE` (no en vLLM estándar).
- Reduccion deliberada de rechazos en una taxonomia amplia de dano multilingue, no limitada a un dominio concreto.
- Sin capacidades de vision ni de audio: el modelo es estrictamente de texto.

## Casos de uso

- Investigacion en alineacion y seguridad: el modelo permite estudiar como se distribuye el comportamiento de rechazo tras una abliteracion de pesos, comparando con la linea base GLM-5.3 (85,58 % en MMLU) y midiendo la degradacion de capacidades con paneles estratificados como el de 1026 preguntas usado por el autor.
- Red teaming y evaluacion de taxonomias de dano: sirve como generador de casos limite en marcos como HarmBench-320 (320 comportamientos, 240 no relacionados con copyright), util para calibrar clasificadores de moderacion y medir su cobertura.
- Auditoria y analisis de contenido sensible: al no bloquear material con violencia explicita, quimica o exploits, resulta util para resumir, clasificar o extraer entidades de documentacion legal, forense o criminologica que otros modelos rechazan sistematicamente, siempre dentro de un perimetro de cumplimiento normativo.
- Generacion de datos sinteticos para investigacion: por su contexto largo y su capacidad de razonamiento en `<think>`, puede producir grandes volumenes de texto etiquetado en diez idiomas para entrenar clasificadores o evaluadores automaticos.
- Agentes de codigo en pipelines de CI/CD: con `--tool-call-parser glm47` y `--enable-auto-tool-choice` puede encadenar llamadas a herramientas; en el fork con MLA dispersa B12X se reporta un +48 % de velocidad de decode en prompts de codigo.
- Procesamiento multilingue de documentacion tecnica: los diez idiomas declarados permiten normalizar, traducir o resumir corpus heterogeneos (por ejemplo, combinaciones de ingles, chino, arabe y serbio) en una sola pasada con contexto de 131K tokens.
- Analisis de corpus largos en lote sobre H200: la ventana de 131.072 tokens y `--enable-prefix-caching` lo hacen adecuado para tareas offline de resumen o extraccion sobre documentos extensos, no para interaccion en tiempo real con baja latencia.
- Investigacion en eficiencia de inferencia: es un banco de pruebas util para medir el comportamiento de FP8 y de la atencion dispersa `glm_moe_dsa` en vLLM, incluidas sus limitaciones conocidas (MTP, decode-context-parallel, `--enforce-eager`).

## Benchmarks y rendimiento

Preservacion de capacidades (MMLU, muestra estratificada de 1026 preguntas, 18 por materia):

| Modelo | MMLU | Δ vs base GLM-5.3 (85,58 %) | Verificacion |
|---|---|---|---|
| v2 (esta version) | 87,43 % (897/1026) | +1,85 pp | pasa el umbral de ±5 pp |
| v1 (referencia) | 87,72 % | +2,14 pp | pasa el umbral de ±5 pp |

Desglose por materia de v2 frente a v1: desviacion media de -0,29 pp; solo `high_school_european_history` se movio mas de una pregunta (94,4 % → 83,3 %, -11,1 pp, equivalente a 2 preguntas). Las mayores ganancias (+5,5 a +5,6 pp, una pregunta cada una) se dieron en `college_chemistry`, `world_religions`, `professional_psychology` y `security_studies`.

Comportamiento de cumplimiento en HarmBench-320 (decodificacion greedy, `max_tokens=700`, esfuerzos `off` y `max`):

| Esfuerzo | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | GARBAGE | UNK |
|:---:|---:|---:|---:|---:|---:|---:|---:|
| off | 261 (81,6 %) | 19 (5,9 %) | 22 (6,9 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 18 (5,6 %) |
| max | 254 (79,4 %) | 15 (4,7 %) | 23 (7,2 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 28 (8,8 %) |

Superficie de dano real, subconjunto no relacionado con copyright (240 comportamientos), esfuerzo `off`: TRUE_COMPLY 220 (91,7 %) y SOFT_REFUSE 1 (el resto de la fila aparece truncada en la model card, por lo que no se reproduce completa). El autor declara que en esta superficie v2 es mas fuerte que v1 (91,7 % frente a 85,9 % de TRUE_COMPLY con `off`), a cambio de una perdida de ~4 pp de TRUE_COMPLY global en HB-320 respecto a v1.

No se han publicado resultados de benchmarks de conocimiento general distintos de MMLU, ni evaluaciones de seguridad externas e independientes en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: solo los pesos en FP8 ocupan aproximadamente 753 GB, a lo que hay que sumar la cache KV; el autor recomienda `--gpu-memory-utilization 0.90`.
- Configuracion de referencia probada: tensor parallel 8 (`--tensor-parallel-size 8`) sobre 8× H200 (unas 1128 GB de VRAM agregada). Con `--max-model-len 131072`, `--max-num-seqs 24`, `--enable-prefix-caching`, `--enforce-eager` y `--disable-custom-all-reduce`.
- Pruebas de campo adicionales citadas sobre 8× DGX Spark GB10.
- No cabe en GPU de consumo: no hay ninguna GPU consumer con VRAM suficiente para 753 GB de pesos, ni siquiera con cuantizaciones de 4 bits no documentadas para este checkpoint.
- Paralelismo alternativo: perfiles de pipeline-parallel PP2 × TP4 funcionan, pero el borrador MTP no implementa `SupportsPP`.
- Motor de despliegue: vLLM es el unico documentado. No se documentan opciones para llama.cpp, Ollama, TGI ni otros runtimes, y el formato FP8 nativo mas el tamano hacen inviable su uso en ellos.
- Latencia y throughput: el unico dato publicado es un +48 % de velocidad de decode en prompts de codigo al usar MTP con el fork de vLLM de MLA dispersa B12X (`--draft-attention-backend B12X_MLA_SPARSE`). No se publican cifras de tokens por segundo, TTFT ni latencia p50/p99.
- Limitacion de contexto practica en TP8 con H200: ~131K tokens con MTP y ~160K sin MTP. El decode-context-parallel no funciona por un conflicto de replicacion/sharding del indexador DSA (`page size is not divisible by target page size and cannot be padded` con `fp8_ds_mla`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Modificacion de pesos | Disponibilidad |
|---|---|---|---|---|---|---|
| baselquants/GLM-5.3-UNCENSORED-FP8 (este) | 753B | 131.072 tokens (techo practico ~160K) | FP8 | MIT | Si: abliteracion en residual writers bf16 | 0 descargas, 0 likes al redactar |
| zai-org/GLM-5.3 (original) | 753B | no disponible | no disponible | no disponible | No: rechazos intactos | upstream de referencia |
| JANGQ-AI/GLM-5.3-FP8 | no disponible (deriva del anterior) | no disponible | FP8 | no disponible | No documentada | base directa de este checkpoint |
| dealignai/GLM-5.3-CYBERSECURITY-FP8 | no disponible | no disponible | FP8 | no disponible | Variante orientada a ciberseguridad | citado como modelo hermano |

No se dispone de datos verificados de otros modelos comparables de 700B+ abiertos (parametros, contexto, licencia y benchmarks) en la informacion proporcionada, por lo que no se incluye una comparativa cuantitativa frente a alternativas de terceros.

## Limitaciones y advertencias

- Modelo abliterado por diseno: la reduccion de rechazos es el objetivo declarado, no un efecto colateral. Puede producir contenido danino, ilegal o gravemente ofensivo, y su uso en productos de cara al publico exige capas de moderacion externas.
- Sin validacion independiente: 0 descargas y 0 likes, publicacion y ultima actualizacion el mismo dia (18 de septiembre de 2026). Los unicos datos de rendimiento y de cumplimiento proceden del propio autor.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas de veracidad o de tasas de alucinacion; no disponible.
- Sesgos: no se documenta ninguna evaluacion de sesgos demograficos, politicos o culturales en los diez idiomas declarados.
- Presupuesto de razonamiento incontrolable: `reasoning_effort` solo honra `"low"` y `"high"`; el resto de valores cae a `max`. No es posible desactivar el razonamiento. Con `high` o `max` en FP8 el modelo puede consumir todo el presupuesto de tokens dentro de `<think>` y devolver cero tokens de respuesta (`finish=length`); para esos valores hace falta `max_tokens >= 8000`, y para `reasoning_effort=max` el autor indica un minimo de 2600.
- MTP no funcional en vLLM estandar: requiere el fork de ciprianveg con MLA dispersa B12X. En caso contrario hay que dejarlo desactivado.
- Contexto limitado en la practica: el soporte de 1M tokens via decode-context-parallel esta cerrado en `glm_moe_dsa` sobre vLLM, con un techo real de ~131K con MTP y ~160K sin MTP en TP8 sobre H200.
- Solo texto: sin vision, sin audio, sin entrada multimodal.
- Idiomas declarados sin metricas: los diez idiomas figuran como soportados, pero no hay evaluaciones por idioma publicadas.
- Licencia MIT: permite uso comercial y modificacion, pero la responsabilidad legal y normativa recae integramente en quien despliega el modelo. Los usos pueden quedar restringidos por el AI Act europeo, la legislacion local y las condiciones de los modelos base.
- Sin trazabilidad del entrenamiento: no se publican tokens, composicion del dataset ni metodo de alineacion del modelo original, lo que impide auditar el origen de los sesgos.
- Discrepancia de autoria: el repositorio cuelga de la cuenta `baselquants`, mientras que la model card atribuye la publicacion al colectivo dealignai; conviene verificar la procedencia antes de integrarlo en produccion.
- Operacion costosa: 755,7 GB de repositorio y despliegue minimo de 8 GPUs H200 con tensor parallel 8, lo que limita su uso a entornos con infraestructura de centro de datos.

## Enlaces

- HuggingFace (ficha principal): https://huggingface.co/baselquants/GLM-5.3-UNCENSORED-FP8
- Ficha referenciada del autor en dealignai: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Modelo hermano orientado a ciberseguridad: https://huggingface.co/dealignai/GLM-5.3-CYBERSECURITY-FP8
- Modelo base directo (cuantizacion FP8): https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Modelo original upstream: https://huggingface.co/zai-org/GLM-5.3
- Discusion con las notas de runtime en 8× DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Perfil del autor de las pruebas de campo: https://huggingface.co/0xMagnus
- Twitter del colectivo autor: https://twitter.com/dealignai
- Nota sobre la busqueda web: no se recupero ningun resultado relevante sobre el modelo; los unicos resultados devueltos correspondian a paginas informativas sobre la ciudad de Houston y se han descartado por no ser pertinentes.
