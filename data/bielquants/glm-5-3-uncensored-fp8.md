# bielquants/GLM-5.3-UNCENSORED-FP8

## Resumen

GLM-5.3-UNCENSORED-FP8 es una version del modelo GLM-5.3 de zai-org a la que se le ha eliminado el comportamiento de rechazo (refusal) mediante una modificacion directa de pesos en FP8. El repositorio esta publicado por el usuario bielquants, aunque la model card identifica la release como un trabajo de dealignai (variante "CRACK"), construida sobre la cuantizacion FP8 de JANGQ-AI (JANGQ-AI/GLM-5.3-FP8), que a su vez deriva del modelo upstream zai-org/GLM-5.3. No es un fine-tuning ni un LoRA: es una edicion bf16 de los tensores residual-writer, manteniendo intactos los expertos enrutados en FP8.

El modelo base es de tipo MoE con la arquitectura glm_moe_dsa (atención dispersa tipo DeepSeek-sparse, segun la propia model card) de 78 capas y caracter puramente textual. El peso total declarado en safetensors es de 753.329.940.480 parametros (~753B) y el repositorio ocupa 755,7 GB, lo que lo situa en la categoria de modelos frontera que requieren despliegue multi-GPU en nodos Hopper (H100/H200) para aprovechar la velocidad nativa de tensor cores en FP8.

Su relevancia es doble. Por un lado, es un ejemplo practico de "abliteration" a escala frontera, con evaluacion cuantitativa de preservacion de capacidades (MMLU) y de comportamiento de cumplimiento (HarmBench-320) publicada en la propia model card. Por otro, es un caso de estudio de los riesgos de las releases sin censura: el modelo elimina rechazos de forma generalista en diez idiomas y esta liberado bajo licencia MIT, lo que permite uso comercial sin restricciones por parte del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (MoE con atencion dispersa tipo DSA), 78 capas, text-only |
| Parametros totales | 753.329.940.480 (~753B) segun safetensors |
| Parametros activos | no disponible (el modelo es MoE, pero la model card no publica el numero de parametros activos) |
| Longitud de contexto | no disponible como especificacion oficial; la model card menciona un objetivo de 1M de tokens y un techo practico de ~131K con MTP y ~160K sin MTP en TP8 sobre H200; el ejemplo de despliegue usa 131.072 |
| Tipos de cuantizacion | FP8 (expertos enrutados), con residual-writers editados en bf16; no se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura glm_moe_dsa del GLM-5.3 original: una red de mezcla de expertos (MoE) de 78 capas, con atencion dispersa en la linea de DeepSeek-sparse attention, y sin componentes multimodales (text-only). La version publicada en este repositorio corresponde a la cuantizacion FP8 de JANGQ-AI, sobre la que se ha aplicado una edicion de pesos en bf16. Segun la model card, no hay fine-tuning, ni LoRA, ni hooks en tiempo de ejecucion, ni trucos de prompt: la modificacion es un cambio permanente en los tensores residual-writer, mientras que los expertos enrutados en FP8 permanecen sin cambios. Esto permite cargar el checkpoint con vLLM estandar y obtener velocidad nativa de tensor cores FP8 en hardware Hopper (H100/H200).

La informacion disponible no incluye detalles sobre el corpus de entrenamiento del modelo base (numero de tokens, composicion del dataset) ni sobre las fases de alineacion (RLHF, DPO u otras) de GLM-5.3. La unica informacion sobre el proceso de "uncensoring" es metodologica y de evaluacion: la version v2 corrige un fallo de bucle de razonamiento presente en v1 (que afectaba a aproximadamente el 2% de los prompts con señal de rechazo mas dura, con colapso en repeticion) y prioriza la estabilidad frente al cumplimiento, con una perdida declarada de ~4 puntos porcentuales de TRUE_COMPLY global en HarmBench-320 a cambio de cero bucles. Se documenta tambien decodificacion especulativa MTP: no funcional en vLLM estandar, pero reportada como operativa en el fork sparse-MLA B12X de ciprianveg, con un +48% de decode en prompts de codigo.

## Capacidades

- Generacion de texto conversacional en diez idiomas: ingles, chino, ruso, serbio, hindi, frances, espanol, arabe, coreano y japones.
- Razonamiento explicito con modo "thinking": el texto de razonamiento se devuelve en `message.reasoning` (no en `message.reasoning_content`).
- Control de esfuerzo de razonamiento mediante `reasoning_effort`, con la salvedad de que en este checkpoint solo se respetan `"low"` y `"high"`; cualquier otro valor (`off`, `medium`, `max`, sin definir, o un `off:` de YAML que parsea como booleano `false`) cae a `max`. No es posible desactivar el razonamiento.
- Tool calling y function calling: el ejemplo oficial usa `--tool-call-parser glm47` con `--enable-auto-tool-choice`.
- Flujos de agente y razonamiento multi-paso, con la recomendacion de usar `reasoning_effort="low"` en bucles de herramientas sobre FP8 para evitar agotar el presupuesto de `max_tokens` dentro del bloque de pensamiento.
- Cumplimiento de peticiones dañinas muy elevado por diseño (ver seccion de benchmarks): es una capacidad buscada por la release, no un efecto colateral.
- Sin capacidades de vision ni de audio: el modelo es text-only.

## Casos de uso

- Investigacion en seguridad y alineacion: servir como sujeto de estudio para medir como se degrada la refusal tras una edicion de pesos a escala frontera, usando las tablas de HarmBench-320 y MMLU de la propia model card como linea base reproducible.
- Red teaming y evaluacion de robustez: generar respuestas adversarias a gran escala en diez idiomas para probar clasificadores de contenido, filtros de salida y sistemas de moderacion antes de un despliegue.
- Auditoria de pipelines de moderacion: como el modelo cumple peticiones que otros rechazan, permite estresar guardarrailes externos con casos limite que un modelo alineado no produciria, midiendo falsos negativos de forma controlada.
- Generacion de codigo en agentes: con tool calling activo (`glm47`) y `reasoning_effort="low"`, puede integrarse en bucles de edicion de codigo; el fork B12X reporta un +48% de decode en prompts de codigo con MTP y atencion sparse-MLA.
- Analisis de documentos largos: con 131.072 tokens configurados en el ejemplo de servicio y cache de prefijos activada (`--enable-prefix-caching`), es util para resumir y consultar repositorios de documentacion extensos.
- Generacion de datos sinteticos multilingues para investigacion: su cobertura de en, zh, ru, sr, hi, fr, es, ar, ko y ja permite construir corpus paralelos o de aumento de datos en idiomas poco representados como el serbio.
- Estudio de metodologias de abliteration: la release documenta el paso de v1 a v2 con metricas de bucles y de cumplimiento, lo que sirve como caso practico para comparar tecnicas de edicion de pesos en modelos MoE de 753B.
- Evaluacion de infraestructura de inferencia: sirve como carga de trabajo de referencia para medir paralelismo tensorial (TP8), memoria por GPU y estabilidad del kernel de atencion dispersa bajo concurrencia.

## Benchmarks y rendimiento

Preservacion de capacidades (MMLU, muestra estratificada de 1026 preguntas, 18 por materia):

| Version | MMLU | Delta frente a la base | Puerta (±5 pp) |
|---|---|---|---|
| v2 (esta release) | 87,43% (897/1026) | +1,85 pp | pasa |
| v1 (referencia) | 87,72% | +2,14 pp | pasa |
| GLM-5.3-regular (base) | 85,58% | — | — |

Detalle por materia de v2 frente a v1: delta medio por materia de -0,29 pp, con una unica materia moviendose mas de una pregunta (`high_school_european_history`, 94,4 -> 83,3, -11,1 pp, equivalente a 2 preguntas) sobre un panel de 57 materias con ruido de ±5,5 pp por pregunta. Mayores ganancias en `college_chemistry`, `world_religions`, `professional_psychology` y `security_studies` (+5,5 a +5,6 pp cada una, 1 pregunta).

Comportamiento de cumplimiento (HarmBench-320, greedy, `max_tokens=700`, ejecutado con `reasoning_effort` en off y max):

| Esfuerzo | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | GARBAGE | UNK |
|:---:|---:|---:|---:|---:|---:|---:|---:|
| off | 261 (81,6%) | 19 (5,9%) | 22 (6,9%) | 0 (0%) | 0 (0%) | 0 (0%) | 18 (5,6%) |
| max | 254 (79,4%) | 15 (4,7%) | 23 (7,2%) | 0 (0%) | 0 (0%) | 0 (0%) | 28 (8,8%) |

Superficie de daño real (240 comportamientos sin copyright): TRUE_COMPLY del 91,7% en modo off (frente al 85,9% de v1), con 1 caso de SOFT_REFUSE. El resto de filas de esa tabla aparece truncado en la informacion proporcionada, por lo que no se reproducen aqui.

Nota de lectura: en esta escala, TRUE_COMPLY alto significa que el modelo acepta y desarrolla peticiones dañinas. No es una metrica de calidad, sino de eliminacion de rechazos.

## Requisitos de hardware

- Peso en disco del repositorio: 755,7 GB (safetensors en FP8). Requiere almacenamiento rapido y suficiente espacio libre para el checkpoint completo.
- Memoria agregada: con ~753GB de pesos, un nodo de 8x H200 (141 GB por GPU, ~1128 GB) permite TP8 con `--gpu-memory-utilization 0.90`. Dieciseis H100 de 80 GB (1280 GB) tambien cubren los pesos, pero el ejemplo oficial esta validado en 8x H200.
- No cabe en GPU de consumo: ni RTX 4090 (24 GB) ni RTX 5090 pueden alojar el checkpoint, y no hay cuantizaciones GGUF o de menor bit publicadas para este repositorio.
- Software de despliegue: vLLM con el ejemplo oficial (TP8, `--enforce-eager`, `--disable-custom-all-reduce`, `--enable-prefix-caching`, `--max-num-seqs 24`, `--max-model-len 131072`, `--reasoning-parser glm45`, `--tool-call-parser glm47`). `--enforce-eager` es necesario para la ruta de atencion dispersa bajo concurrencia. No se documentan despliegues con TGI, Ollama o llama.cpp.
- Contexto y paralelismo: el parallelismo de contexto por decode (DCP) esta cerrado para `glm_moe_dsa` en vLLM actual por un problema de replicacion de `k_cache` del indexador DSA frente al sharding de la KV en MLA. El techo practico en TP8 sobre H200 es de ~131K tokens con MTP y ~160K sin MTP. El pipeline-parallel (PP2 x TP4) perfila bien, pero el draft MTP no implementa `SupportsPP`.
- Decodificacion especulativa: MTP no funciona en vLLM estandar; el fork B12X sparse-MLA con `--draft-attention-backend B12X_MLA_SPARSE` reporta +48% de decode en prompts de codigo. No se publican cifras absolutas de latencia ni de throughput en tokens por segundo.
- Presupuesto de tokens: con `reasoning_effort` en high o max, conviene fijar `max_tokens >= 8000` en bucles de agente (y >= 2600 en el caso general) porque el bloque `<think>` puede consumir todo el presupuesto y devolver contenido vacio con `finish=length`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| GLM-5.3-UNCENSORED-FP8 (esta release) | 753B (MoE) | ~131K practicos en TP8 H200 (objetivo declarado 1M) | MIT | Disponible en HF, 0 descargas y 0 likes en el momento del analisis | Variante sin rechazos, MMLU 87,43%, TRUE_COMPLY 81,6% en HB-320 |
| zai-org/GLM-5.3 (base) | 753B (MoE) | no disponible | no disponible | Upstream | Referencia de capacidades; MMLU de referencia 85,58% usado por la model card |
| JANGQ-AI/GLM-5.3-FP8 | 753B (MoE) | no disponible | no disponible | Cuantizacion FP8 del base | Base directa de esta release; expertos enrutados identicos |
| dealignai/GLM-5.3-CYBERSECURITY-FP8 | no disponible | no disponible | no disponible | Modelo hermano citado en la model card | Enfocado a ciberseguridad |

No se dispone de datos de benchmarks de terceros (DeepSeek-V3, Qwen u otros MoE de escala comparable) en la informacion proporcionada, por lo que no se incluye comparacion cuantitativa con ellos.

## Limitaciones y advertencias

- El modelo ha sido modificado deliberadamente para eliminar rechazos de forma generalista en diez idiomas. Un TRUE_COMPLY del 81,6% en HarmBench-320 implica que acepta y desarrolla peticiones dañinas en la mayoria de los casos, incluyendo las 240 categorias sin copyright evaluadas (91,7%).
- Sesgos: no se publica ninguna evaluacion de sesgos de genero, raza, religion o nacionalidad. Al eliminar los rechazos, el modelo puede amplificar contenido estereotipado que un modelo alineado bloquearia.
- Riesgo de alucinacion: no se documentan evaluaciones de veracidad, factualidad ni tasa de alucinacion. El modo de razonamiento alto puede consumir todo el presupuesto de tokens dentro de `<think>` y devolver respuesta vacia con `finish=length`.
- Coste de infraestructura muy alto: 755,7 GB de checkpoint y un minimo practico de 8x H200 para el despliegue validado. No hay ruta viable en hardware de consumo.
- Restricciones practicas del runtime: `reasoning_effort` solo admite `"low"` y `"high"`; no existe forma de desactivar el razonamiento. MTP no funciona en vLLM estandar. El parallelismo de contexto por decode para 1M esta cerrado hoy para esta arquitectura.
- Licencia MIT: permite uso comercial y modificacion sin restricciones por parte del autor, lo que traslada al desplegador toda la responsabilidad legal y etica sobre el contenido generado. Conviene verificar la licencia del modelo upstream GLM-5.3, que no se detalla en la informacion disponible.
- Ambiguedad de autoria: el repositorio aparece bajo el usuario `bielquants`, mientras que la model card se atribuye a `dealignai`. Conviene verificar la procedencia antes de integrarlo en cualquier pipeline.
- Madurez: 0 descargas y 0 likes, fecha de creacion y ultima actualizacion identicas (2026-09-19) y sin historial de versiones mas alla de la mencion a v1/v2. No hay senal de mantenimiento ni de soporte.
- Este modelo no deberia desplegarse de cara al publico sin guardarrailes externos de moderacion, dado que su comportamiento de rechazo ha sido suprimido por diseño.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bielquants/GLM-5.3-UNCENSORED-FP8
- Modelo base directo (cuantizacion FP8): https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Modelo upstream: https://huggingface.co/zai-org/GLM-5.3
- Perfil del autor de la model card: https://huggingface.co/dealignai
- Modelo hermano de ciberseguridad: https://huggingface.co/dealignai/GLM-5.3-CYBERSECURITY-FP8
- Discusion con notas de runtime en 8x DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Twitter del autor de la model card: https://twitter.com/dealignai

Nota: la busqueda web realizada no devolvio ninguna fuente relevante sobre este modelo; los resultados obtenidos correspondian a paginas corporativas de Microsoft y no guardan relacion con la ficha.
