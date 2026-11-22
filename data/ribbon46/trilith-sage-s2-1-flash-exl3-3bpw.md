# Ribbon46/trilith-sage-s2.1-flash-exl3-3bpw

## Resumen

Trilith Sage S2.1 Flash EXL3 3.0 bpw es una cuantizacion de 3 bits del modelo base internlm/Sage-S2.1-Flash, publicada por el usuario Ribbon46 como espejo sin modificaciones del repositorio original del cuantizador androidli. El modelo emplea el formato EXL3 (ExLlamaV3) con un peso medio de 3.0 bits por parametro, lo que reduce un modelo de aproximadamente 74.200 millones de parametros a un repositorio de 148,5 GB distribuido en 29 ficheros. La licencia es MIT tanto en esta copia como en el modelo base.

El interes practico de esta publicacion es acotado pero claro: sirve como fuente de descarga estable para el arranque rapido del runtime Trilith, donde Sage actua como planificador (planner) y juez (judge) sobre el motor GLM del Proyecto Maya. No se trata de un modelo nuevo ni de un ajuste fino, sino de un artefacto de despliegue pensado para inferencia con ExLlamaV3 en GPUs de consumo o de centro de datos con VRAM limitada.

La informacion publicada por el autor es minima: no hay model card tecnica del modelo base, no se detallan datos de entrenamiento, benchmarks ni idiomas soportados. Esta ficha refleja exclusivamente lo que consta en los metadatos de Hugging Face y en el README del espejo, marcando como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base internlm/Sage-S2.1-Flash; sin especificar en la informacion disponible) |
| Parametros totales | 74.216.266.590 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 3.0 bits por parametro (bpw) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con cuantizacion EXL3 (ExLlamaV3) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo base internlm/Sage-S2.1-Flash en los materiales disponibles. El tag `glm5_next` sugiere una vinculacion con la familia GLM en el ecosistema del runtime Trilith, pero no se confirma en ningun documento la arquitectura concreta (transformer denso, MoE o hibrida). Tampoco constan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Lo unico verificable es el proceso de cuantizacion: el modelo se ha convertido al formato EXL3 de ExLlamaV3 con una media de 3.0 bits por parametro, lo que reduce el peso en disco a 148,5 GB frente a los aproximadamente 148 GB que ocuparia en FP16 un modelo de 74.200 millones de parametros (unos 148,4 GB teoricos). El espejo es byte a byte identico al repositorio original de androidli, sin modificaciones por parte de Ribbon46.

## Capacidades

- Generacion de texto: capacidad esperada por tratarse de un modelo de lenguaje de gran tamano, aunque no se detalla en la informacion disponible.
- Razonamiento y planificacion: el README indica que Sage se usa en Trilith como planner y judge dentro del motor GLM del Proyecto Maya, lo que implica capacidad de descomposicion de tareas y evaluacion de respuestas.
- Tool calling / function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: inferido por su rol de planner en Trilith, pero sin documentacion tecnica que lo confirme.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Planificacion de agentes en el runtime Trilith: el modelo actua como planner y judge sobre el motor GLM del Proyecto Maya, descomponiendo tareas y evaluando las salidas de otros componentes. Es el caso de uso documentado por el propio autor del espejo.
- Despliegue en GPUs con VRAM limitada: la cuantizacion a 3.0 bpw permite cargar un modelo de 74.200 millones de parametros en configuraciones de hardware que no admitirian los pesos en FP16, lo que facilita la experimentacion local con modelos de gran escala.
- Inferencia de baja latencia con ExLlamaV3: el formato EXL3 esta disenado para el motor ExLlamaV3, orientado a decodificacion rapida en GPUs de consumo y de centro de datos, adecuado para prototipos interactivos.
- Evaluacion y comparacion de cuantizaciones: al ser un espejo estable, sirve como referencia reproducible para medir la perdida de calidad frente a otras cuantizaciones del mismo modelo base.
- Reproduccion de entornos de investigacion: el caracter byte a byte identico al repositorio original permite fijar una fuente de descarga determinista en pipelines de evaluacion.
- Integracion en flujos de arbitraje de respuestas: su rol de judge en Trilith sugiere su uso para puntuar o seleccionar entre multiples candidatos generados por otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 148,5 GB en disco; con EXL3 a 3.0 bpw se requiere un espacio en VRAM del mismo orden, mas el overhead de cache KV y del runtime ExLlamaV3. No se dispone de cifras oficiales de consumo en VRAM.
- GPU recomendadas: no disponible en la informacion publicada. Por tamano, el modelo excede la VRAM de cualquier GPU de consumo individual (RTX 4090 con 24 GB, RTX 5090 con 32 GB) y requeriria configuraciones multi-GPU o GPUs de centro de datos con 80 GB o mas (A100, H100, H200).
- Cabe en consumer GPU: no en una sola unidad; seria necesario repartir el modelo entre varias GPUs o recurrir a offload a CPU/RAM, lo que degradaria la latencia.
- Opciones de despliegue: ExLlamaV3 (formato nativo EXL3); no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no soportan EXL3 de forma nativa en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Trilith Sage S2.1 Flash EXL3 3.0 bpw (este) | 74.216.266.590 | no disponible | EXL3 3.0 bpw | MIT | Hugging Face (espejo) |
| internlm/Sage-S2.1-Flash (base) | no disponible | no disponible | pesos originales | no disponible | Hugging Face |
| androidli/Sage-S2.1-Flash-EXL3-3.0bpw (upstream) | no disponible | no disponible | EXL3 3.0 bpw | MIT | Hugging Face |

No se dispone de informacion sobre modelos alternativos de la misma categoria con la que comparar parametros, contexto o rendimiento de forma rigurosa.

## Limitaciones y advertencias

- Ausencia de documentacion tecnica: no se publican arquitectura, contexto, idiomas ni datos de entrenamiento del modelo base, lo que impide evaluar su idoneidad para produccion.
- Sin benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba que permita estimar la calidad del modelo o la perdida introducida por la cuantizacion a 3.0 bpw.
- Riesgo de degradacion por cuantizacion agresiva: 3.0 bpw es una compresion elevada; en modelos de este tamano puede producirse una merma notable en tareas de razonamiento y codigo, aunque no se han publicado mediciones.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluaciones de fidelidad disponibles.
- Sesgos conocidos: no disponible.
- Restricciones de licencia: MIT permite uso comercial y modificacion con atribucion; conviene conservar el aviso de copyright y verificar la licencia del modelo base internlm/Sage-S2.1-Flash, que no se detalla en la informacion disponible.
- Es un espejo, no un modelo original: el autor recomienda usar el repositorio upstream de androidli cuando este disponible.
- Compatibilidad limitada: el formato EXL3 requiere ExLlamaV3; no es un artefacto GGUF ni safetensors estandar, lo que restringe las herramientas de despliegue utilizables.
- Repositorio sin descargas ni interacciones en el momento de la consulta, lo que reduce la validacion por parte de la comunidad.

## Enlaces

- Espejo en Hugging Face: https://huggingface.co/Ribbon46/trilith-sage-s2.1-flash-exl3-3bpw
- Repositorio upstream del cuantizador: https://huggingface.co/androidli/Sage-S2.1-Flash-EXL3-3.0bpw
- Modelo base: https://huggingface.co/internlm/Sage-S2.1-Flash
- Repositorio de configuracion del runtime Trilith (abliteration y configs de Maya): `trilith-sage-s2.1-flash-abliteration` (referenciado en el README; URL exacta no disponible)
