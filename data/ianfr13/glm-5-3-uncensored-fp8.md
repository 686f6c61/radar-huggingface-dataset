# Ianfr13/GLM-5.3-UNCENSORED-FP8

## Resumen

GLM-5.3-UNCENSORED-FP8 es una version modificada a nivel de pesos del modelo GLM-5.3 de Zhipu AI (zai-org), publicada por el usuario Ianfr13 y atribuida en su model card al proyecto dealignai. Se trata de un "uncensor" de proposito general: la conducta de rechazo (refusal) se reduce de forma transversal en una taxonomia amplia de dano multilingue, sin estar afinado para un unico dominio. La modificacion es una edicion permanente en bf16 sobre los tensores residual-writer, manteniendo intactos los expertos enrutados en FP8 del checkpoint base, de modo que no requiere LoRA, hooks en tiempo de ejecucion ni trucos de prompt.

El modelo base es JANGQ-AI/GLM-5.3-FP8, una cuantizacion FP8 del GLM-5.3 original de zai-org. La arquitectura es glm_moe_dsa (mixture-of-experts con atencion dispersa tipo DSA), con 78 capas y un total de 753.329.940.480 parametros (753B), en modalidad exclusivamente de texto. El repositorio ocupa 755,7 GB, coherente con un checkpoint FP8 de ese tamano.

Su relevancia es doble: por un lado, es un ejemplo de "abliteration" a nivel de pesos sobre un modelo frontera de gran escala, con evaluacion publicada de preservacion de capacidades (MMLU) y de cumplimiento ante HarmBench-320; por otro, documenta con detalle las peculiaridades de servir un MoE FP8 de este tamano en vLLM (reasoning_effort, MTP, atencion dispersa). La licencia declarada es MIT y la model card esta fechada el 10 de octubre de 2026, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (mixture-of-experts con atencion dispersa DSA, 78 capas, solo texto) |
| Parametros totales | 753.329.940.480 (753B) |
| Parametros activos | no disponible |
| Longitud de contexto | Configurado a 131.072 tokens en el ejemplo de despliegue de la model card; el modelo base declara soporte de hasta 1M, pero el 1M via decode-context-parallel esta cerrado en vLLM para glm_moe_dsa; techo practico reportado en TP8 sobre H200: ~131K con MTP y ~160K sin MTP |
| Tipos de cuantizacion | FP8 (checkpoint publicado directamente en FP8; expertos enrutados FP8 sin modificar, tensores residual-writer editados en bf16) |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es glm_moe_dsa, un transformer de tipo mixture-of-experts (MoE) con 78 capas y un mecanismo de atencion dispersa denominado DSA (con un indexador propio, referido como DSA indexer, y MLA para el KV cache). El modelo es exclusivamente de texto. El checkpoint publicado procede de JANGQ-AI/GLM-5.3-FP8, a su vez cuantizacion FP8 de zai-org/GLM-5.3; la modificacion de esta version no altera los expertos enrutados en FP8, solo los tensores residual-writer en bf16 donde se hornea el cambio de comportamiento de rechazo.

No hay informacion en la model card sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF, DPO u otras tecnicas de alineamiento en el modelo original; esos datos no estan disponibles en la informacion proporcionada. La innovacion tecnica descrita por el autor es la metodologia de "uncensoring" a nivel de peso (edicion bf16 permanente sobre los residual writers) y la publicacion de una revision v2 que corrige un fallo de bucle de razonamiento presente en v1: v1 colapsaba en repeticion en aproximadamente el 2% de los prompts con senal de rechazo mas dura (copyright verbatim, quimica de armas, exploit contra objetivo real). v2 reporta 0 bucles en la sonda "hardcore" y 0 GARBAGE en HB-320, a cambio de una caida de ~4 puntos porcentuales en TRUE_COMPLY global sobre HB-320 (aunque en la superficie de dano real, los 240 comportamientos no relacionados con copyright, v2 es mas fuerte que v1: 91,7% frente a 85,9% TC en modo off). El modelo soporta MTP (multi-token prediction) como decodificacion especulativa, no funcional en vLLM estandar pero reportada como operativa en el fork B12X sparse-MLA de ciprianveg con `--draft-attention-backend B12X_MLA_SPARSE`, con +48% de decode en prompts de codigo.

## Capacidades

- Generacion de texto conversacional y de proposito general en 10 idiomas declarados (en, zh, ru, sr, hi, fr, es, ar, ko, ja).
- Razonamiento explicito en bloque `<think>`, controlado por el parametro `reasoning_effort`; en este checkpoint solo se respetan los valores `"low"` y `"high"`, y cualquier otro valor (`off`, `medium`, `max`, sin definir o un `off:` de YAML sin comillas que parsea como booleano `false`) cae a `max`. No hay forma de desactivar el razonamiento; `"low"` es el minimo.
- El texto de razonamiento se expone en `message.reasoning`, no en `message.reasoning_content`.
- Soporte de tool calling / function calling, con parser dedicado `glm47` y `--enable-auto-tool-choice` en vLLM.
- Soporte de bucles de agente y razonamiento multi-paso; la model card recomienda `reasoning_effort="low"` para uso en agentes y bucles de herramientas sobre FP8, ya que en `high`/`max` el modelo puede consumir todo el presupuesto de `max_tokens` dentro del bloque `<think>` y devolver cero tokens de respuesta.
- Capacidad de atencion dispersa (DSA) y decodificacion especulativa MTP (no funcional en vLLM estandar; si en el fork B12X).
- Ausencia de vision y audio: el modelo es solo texto.
- Comportamiento de rechazo reducido de forma generalista en una taxonomia multilingue amplia de dano, no limitada a un dominio concreto.
- Modo de compliance documentado por el autor: 91,7% de TRUE_COMPLY en las 240 conductas de dano no relacionadas con copyright (modo off) y 81,6% de TRUE_COMPLY sobre las 320 conductas de HarmBench-320 (modo off).

## Casos de uso

- Investigacion en alineamiento y seguridad: el modelo sirve como sujeto de estudio para medir como se comporta un MoE frontera tras un "abliteration" a nivel de pesos, comparando tasas de rechazo y de cumplimiento frente al GLM-5.3 original. Su evaluacion publicada en HarmBench-320 y MMLU facilita la reproducibilidad de ese analisis.
- Red-teaming y evaluacion de filtros: al reducir de forma sistematica las negativas, permite a los equipos de seguridad probar si sus propias capas de moderacion (guardrails externos, clasificadores de salida) detectan contenido problematico que un modelo servido en produccion podria emitir.
- Evaluacion de preservacion de capacidades: con un MMLU de 87,43% en muestreo estratificado de 1026 preguntas y comparativa por asignatura, es util para estudiar cuanto degrada el proceso de uncensoring frente al modelo base (85,58% reportado como baseline del GLM-5.3 regular).
- Procesamiento de documentos largos: con contexto configurable de hasta 131.072 tokens en el despliegue de referencia y un techo practico de ~131K-160K en TP8 sobre H200, encaja en tareas de resumen, extraccion y QA sobre expedientes extensos cuando el texto no plantea requisitos de moderacion.
- Generacion de codigo y asistencia en pipelines: soporta tool calling con el parser `glm47` y puede integrarse en flujos de CI/CD o en asistentes de repositorio, con la salvedad de fijar `reasoning_effort="low"` para no agotar el presupuesto de tokens dentro del bloque de razonamiento.
- Agentes multi-paso con herramientas: el soporte de `--enable-auto-tool-choice` y de parser de razonamiento `glm45` permite construir agentes que encadenan llamadas a funciones, siempre que se dimensionen `max_tokens >= 8000` si se usa `high`/`max`.
- Analisis multilingue interno: con 10 idiomas declarados (incluido espanol y serbio), resulta util para equipos que necesitan generar y resumir contenido en idiomas menos cubiertos por otros modelos de su categoria.
- Investigacion en ciberseguridad: el propio autor recomienda usar el modelo hermano dealignai/GLM-5.3-CYBERSECURITY-FP8 si el objetivo es especificamente ciberseguridad, en lugar de esta variante generalista.

## Benchmarks y rendimiento

Datos publicados en la model card (no se ha verificado de forma independiente):

| Benchmark | Version / condicion | Resultado | Referencia |
|---|---|---|---|
| MMLU (muestra estratificada de 1026 preguntas, 18 por asignatura) | v2 | 87,43% (897/1026) | +1,85 pp frente al baseline GLM-5.3-regular (85,58%) |
| MMLU (misma muestra) | v1 (referencia) | 87,72% | +2,14 pp frente al baseline |
| MMLU por asignatura (v2 frente a v1) | 57 asignaturas, 18 preguntas cada una | Delta medio -0,29 pp | Solo `high_school_european_history` se movio mas de una pregunta (94,4 -> 83,3, -11,1 pp); ganancias maximas de +5,5-5,6 pp en college_chemistry, world_religions, professional_psychology y security_studies |
| HarmBench-320 (todas las 320 conductas, greedy) | `reasoning_effort=off`, `max_tokens=700` | TRUE_COMPLY 261 (81,6%); SOFT_REFUSE 19 (5,9%); REDIRECT 22 (6,9%); DEFLECT 0 (0%); HARD_REFUSE 0 (0%); GARBAGE 0 (0%); UNK 18 (5,6%) | No disponible comparativa con el base en la informacion proporcionada |
| HarmBench-320 (todas las 320 conductas, greedy) | `reasoning_effort=max`, `max_tokens=700` | TRUE_COMPLY 254 (79,4%); SOFT_REFUSE 15 (4,7%); REDIRECT 23 (7,2%); DEFLECT 0 (0%); HARD_REFUSE 0 (0%); GARBAGE 0 (0%); UNK 28 (8,8%) | No disponible comparativa con el base |
| HarmBench-320, subconjunto no-copyright (240 conductas) | `reasoning_effort=off` | TRUE_COMPLY 220 (91,7%); SOFT_REFUSE 1 (dato truncado en la model card) | v1: 85,9% TC en off |
| MTP (decodificacion especulativa) | Fork B12X sparse-MLA de ciprianveg, prompts de codigo | +48% de decode | No funcional en vLLM estandar |

No hay datos publicados de HumanEval, GSM8K, MMLU-Pro ni de otras pruebas de razonamiento o codigo en la informacion proporcionada.

## Requisitos de hardware

- Pesos en FP8: el repositorio ocupa 755,7 GB, coherente con 753B parametros en FP8 (aproximadamente 1 byte por parametro mas overhead). Se necesita agregacion de memoria multi-GPU; no cabe en una sola GPU comercial.
- Configuracion de referencia del autor: vLLM con `--tensor-parallel-size 8` sobre 8x H200 (141 GB cada una, 1128 GB agregados) y `--gpu-memory-utilization 0.90`. Se requiere `--enforce-eager` para la ruta de atencion dispersa de DeepSeek bajo concurrencia.
- Probado en campo por @0xMagnus sobre 8x DGX Spark GB10 (segun la discusion enlazada en la model card).
- GPU de consumo: no es viable. Una RTX 4090 (24 GB) no puede alojar el checkpoint ni por cuantizacion adicional documentada; no se ofrecen versiones GGUF ni IQ en el repositorio.
- Techo practico de contexto en TP8 sobre H200: ~131K tokens con MTP y ~160K sin MTP. El soporte de 1M de contexto via decode-context-parallel esta cerrado en vLLM para `glm_moe_dsa` (el indexador DSA replica `k_cache` entre rangos DCP mientras el KV MLA esta shardeado, lo que provoca el error `page size is not divisible by target page size and cannot be padded` para `fp8_ds_mla`). Pipeline-parallel (PP2 x TP4) perfila bien, pero el draft MTP no implementa `SupportsPP`.
- Opciones de despliegue: vLLM (con `--reasoning-parser glm45`, `--tool-call-parser glm47`, `--enable-auto-tool-choice`, `--enable-prefix-caching`, `--max-num-seqs 24`). Para llama.cpp, Ollama, TGI o LM Studio no hay informacion disponible; el formato publicado es safetensors FP8.
- MTP: no funcional en vLLM estandar; reportado como funcional en el fork B12X sparse-MLA de ciprianveg con `--draft-attention-backend B12X_MLA_SPARSE`, con +48% de decode en prompts de codigo.
- Latencia y throughput absolutos: no disponible. Solo se publica la mejora relativa del +48% en decode con MTP sobre el fork mencionado.
- Presupuesto de tokens: para `reasoning_effort=max` el autor recomienda `max_tokens >= 2600`; si se ejecuta en `high`/`max` en bucles de agente, se recomienda `max_tokens >= 8000` para evitar que el bloque `<think>` consuma todo el presupuesto y devuelva contenido vacio (finish=`length`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ianfr13/GLM-5.3-UNCENSORED-FP8 | 753B (MoE, glm_moe_dsa, 78 capas) | 131.072 en el despliegue de referencia; hasta 1M declarado por el base, no operativo en vLLM | MIT | safetensors FP8 | Uncensoring generalista, evaluacion publicada en HarmBench-320 y MMLU |
| zai-org/GLM-5.3 (base) | 753B (mismo) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible | Baseline reportado con MMLU 85,58% |
| JANGQ-AI/GLM-5.3-FP8 | 753B (mismo) | no disponible | no disponible | safetensors FP8 | Cuantizacion FP8 de la que deriva este checkpoint; expertos enrutados sin modificar |
| dealignai/GLM-5.3-CYBERSECURITY-FP8 | no disponible | no disponible | no disponible | no disponible | Variante hermana orientada a ciberseguridad, recomendada por el autor para ese dominio |

No hay informacion en la model card sobre comparativas con otros modelos abliterated o uncensored de la misma categoria (por ejemplo, variantes de Llama, Qwen o Mistral), por lo que esa comparacion queda como no disponible.

## Limitaciones y advertencias

- El modelo ha sido modificado deliberadamente para reducir sus negativas. Puede generar contenido danino, ilegal o eticamente problematico, incluido material relacionado con armas quimicas, exploits o copyright verbatim, segun los propios ejemplos de la sonda del autor. Su uso en produccion orientada al publico general exige capas de moderacion externas.
- Riesgo de alucinacion: no se publican metricas de veracidad ni de fidelidad factual. El MMLU elevado (87,43%) no implica ausencia de alucinaciones en tareas abiertas.
- Bucle de razonamiento: v1 presentaba un modo de fallo de repeticion en aproximadamente el 2% de los prompts mas duros. v2 lo corrige segun el autor, pero la propia publicacion reconoce un intercambio: ~4 pp menos de TRUE_COMPLY global en HB-320 a cambio de estabilidad sin bucles.
- `reasoning_effort` solo admite `"low"` y `"high"`. Valores como `off`, `medium` o `max` caen a `max`; un `off:` sin comillas en YAML parsea como booleano `false` y tambien cae a `max`. No es posible desactivar el razonamiento. En `high`/`max` el bloque `<think>` puede consumir todo el presupuesto y devolver cero tokens de respuesta (finish=`length`); no es un bucle, es agotamiento de presupuesto.
- El texto de razonamiento se expone en `message.reasoning` y no en `message.reasoning_content`, lo que rompe integraciones que esperen el campo habitual.
- MTP no funcional en vLLM estandar; requiere un fork externo no oficial.
- El soporte de 1M de contexto no es operativo en vLLM actual sobre `glm_moe_dsa`; el techo practico reportado es de ~131K con MTP y ~160K sin MTP en TP8 sobre H200. Las tareas que dependan de contexto de 1M no son viables hoy.
- Requisitos de hardware extremos: agregacion de multiples aceleradores de gama alta (8x H200 o equivalente). No cabe en GPU de consumo y no hay versiones GGUF publicadas.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero la licencia del modelo base de zai-org no se especifica en la informacion proporcionada; conviene verificar los terminos del upstream antes de un uso comercial.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la evaluacion publicada procede del propio autor, sin verificacion independiente. La autoria en HuggingFace figura como Ianfr13 mientras la model card se atribuye a dealignai.
- Idiomas: se declaran 10 idiomas, pero no se publican metricas por idioma. El rendimiento fuera de ingles y chino no esta cuantificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ianfr13/GLM-5.3-UNCENSORED-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Cuantizacion base FP8: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Variante hermana de ciberseguridad: https://huggingface.co/dealignai/GLM-5.3-CYBERSECURITY-FP8
- Organizacion del autor del uncensoring: https://huggingface.co/dealignai
- Twitter del proyecto: https://twitter.com/@dealignai
- Discusion sobre notas de ejecucion en 8x DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3

No se han encontrado en la informacion proporcionada papers, blogs tecnicos ni repositorios de codigo adicionales asociados a este modelo.
