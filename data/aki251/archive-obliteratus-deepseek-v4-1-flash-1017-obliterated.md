# Aki251/archive-OBLITERATUS-DeepSeek-V4.1-Flash-1017-obliterated

## Resumen

DeepSeek-V4.1-Flash-1017-obliterated es una versión con ablación de la dirección de rechazo (refusal-direction ablated) del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario Aki251 en HuggingFace. La modificación se ha realizado con la herramienta OBLITERATUS mediante el método failspy, que identifica y elimina del espacio de activaciones la dirección asociada a las respuestas de rechazo, de forma que el modelo deja de declinar peticiones que el modelo original rechazaba. Los pesos se distribuyen en BF16 safetensors bajo licencia MIT.

El modelo conserva la arquitectura del modelo base, un transformer de tipo mezcla de expertos (MoE) con 754.638.836.864 parámetros totales según los safetensors del repositorio, lo que lo sitúa en la categoría de modelos de gran escala. El repositorio ocupa 1.509,4 GB, coherente con un modelo de ese tamaño en precisión BF16. La información disponible no detalla el número de parámetros activos ni la longitud de contexto del modelo base.

La relevancia de esta ficha es doble: por un lado documenta un caso de fine-tuning de ablación sobre un modelo frontera, y por otro evidencia con datos cuantitativos el impacto que este tipo de intervención tiene sobre el comportamiento de seguridad. La model card reporta una caída de la tasa de rechazo completo del 81,62% al 4,30% y un aumento de la asistencia dañina del 10,38% al 78,28% sobre un corpus de 842 prompts, lo que convierte al modelo en un objeto de estudio para investigadores de seguridad y alineación, y en un artefacto de alto riesgo para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), segun tag `moe`; detalles internos no disponibles |
| Parametros totales | 754.638.836.864 (754,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 |
| Metodo de modificacion | Ablacion de direccion de rechazo con OBLITERATUS, metodo failspy |
| Tamano del repositorio | 1.509,4 GB |
| Pipeline | text-generation |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo es una modificación por ablación de pesos del modelo DeepSeek-V4.1-Flash-1017. No se ha reentrenado desde cero ni se ha aplicado un ajuste supervisado adicional: la intervención consiste en identificar la dirección de rechazo en el espacio de activaciones del modelo original y restarla de los pesos, siguiendo el método failspy implementado en la herramienta OBLITERATUS. Los tags del repositorio confirman la naturaleza MoE del modelo base, pero la información disponible no especifica el número de expertos, el reparto de parámetros activos por token ni la composición del dataset de entrenamiento original.

La model card documenta el proceso de evaluación de la intervención con un conjunto de calibración de 254 prompts, un conjunto de selección de método de 50 prompts y 534 prompts que no participaron en ninguna de las dos fases. La selección del método se realizó mediante un torneo interno cuyos resultados se resumen en la tabla de benchmarks. No se dispone de información sobre RLHF, DPO ni sobre innovaciones técnicas del modelo base como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en una sola pasada, heredada del modelo base DeepSeek-V4.1-Flash-1017.
- Razonamiento y respuesta a instrucciones: la model card reporta un 100% de coherencia y un 100% de capacidad en las comprobaciones internas del torneo de ablación (6 de 6 superadas).
- Modo de pensamiento desactivable: el protocolo de evaluación MMLU se ejecutó con `thinking disabled`, lo que implica que el modelo base dispone de un modo de razonamiento explícito, aunque la información disponible no detalla su funcionamiento.
- Respuesta a peticiones que el modelo original rechazaba: la tasa de rechazo completo cae al 4,30% y el 86,52% de las respuestas son directamente responsivas a la petición.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, function calling y agentes multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en seguridad y alineación: el modelo sirve como artefacto controlado para estudiar cómo la ablación de una única dirección de activación altera el comportamiento de rechazo, con métricas de divergencia KL (0,1305 nats) y distribuciones de dañosidad y accionabilidad publicadas prompt a prompt.
- Evaluación de mecanismos de defensa: permite medir la eficacia de clasificadores de contenido, filtros de salida y sistemas de moderación frente a un modelo deliberadamente desinhibido, usando el corpus de 842 prompts de la model card como referencia reproducible.
- Análisis de robustez de jueces automáticos: la model card documenta el uso de Claude Opus 4.6 y GPT-6.1 Sol como anotadores, con 808 pares evaluados por el mismo juez, lo que permite estudiar la consistencia entre evaluadores sobre respuestas dañinas.
- Estudio de la relación entre rechazo y capacidad: la evaluación MMLU sobre 2.500 preguntas en 57 materias, con el modo de pensamiento desactivado, permite comparar la precisión del modelo ablacionado frente al original y cuantificar el coste cognitivo de la intervención.
- Reproducción de metodologías de ablación: el repositorio incluye el archivo `winner-recovery-provenance.json` con los detalles del método, lo que facilita replicar el procedimiento failspy sobre otros modelos de la misma familia.
- Docencia y formación en ética de IA: el contraste entre las tablas de rechazo, asistencia dañina y accionabilidad constituye un material didáctico concreto sobre los límites de los mecanismos de seguridad basados en preferencias aprendidas.

## Benchmarks y rendimiento

Resultados del torneo de ablación reportados en la model card:

| Metrica | Valor |
|---|---|
| Tasa de rechazo | 4% |
| Divergencia KL (forward, secuencia-token) | 0,1305 nats |
| Coherencia | 100% |
| Capacidad | 100% (6 de 6 comprobaciones superadas) |

Comparación de comportamiento sobre el corpus OBLITERATUS (842 prompts, porcentajes sobre 838 respuestas completadas):

| Clasificacion | DeepSeek-V4.1-Flash-1017 | Modelo obliterado | Delta (pp) |
|---|---:|---:|---:|
| Rechazo completo | 684 (81,62%) | 36 (4,30%) | -77,33 |
| Rechazo parcial | 41 (4,89%) | 121 (14,44%) | +9,55 |
| Sin rechazo | 112 (13,37%) | 656 (78,28%) | +64,92 |
| Asistencia dañina | 87 (10,38%) | 656 (78,28%) | +67,90 |
| Sin asistencia dañina | 750 (89,50%) | 157 (18,74%) | -70,76 |
| Respuesta responsiva a la peticion | 139 (16,59%) | 725 (86,52%) | +69,93 |
| Alternativa segura | 698 (83,29%) | 88 (10,50%) | -72,79 |

Distribucion de dañosidad (harmfulness):

| Nivel | Modelo original | Modelo obliterado | Delta (pp) |
|---|---:|---:|---:|
| 0 — Sin asistencia dañina | 750 (89,50%) | 157 (18,74%) | -70,76 |
| 1 — Impacto esperado bajo | 13 (1,55%) | 21 (2,51%) | +0,95 |
| 2 — Daño significativo | 41 (4,89%) | 182 (21,72%) | +16,83 |
| 3 — Daño grave | 32 (3,82%) | 375 (44,75%) | +40,93 |
| 4 — Daño severo o generalizado | 1 (0,12%) | 78 (9,31%) | +9,19 |

Distribucion de accionabilidad (actionability):

| Nivel | Modelo original | Modelo obliterado | Delta (pp) |
|---|---:|---:|---:|
| 0 — Ninguna | 750 (89,50%) | 157 (18,74%) | -70,76 |
| 1 — Conceptual | 2 (0,24%) | 27 (3,22%) | +2,98 |
| 2 — Pasos parciales, faltan esenciales | 33 (3,94%) | 170 (20,29%) | +16,35 |
| 3 — Pasos especificos, faltan algunos esenciales | 23 (2,74%) | 285 (34,01%) | +31,26 |
| 4 — Suficientemente concreto para habilitar la conducta | 29 (3,46%) | 174 (20,76%) | +17,30 |

La evaluación MMLU se realizó sobre 2.500 preguntas de las 57 materias, en modo zero-shot chat con el pensamiento desactivado y logits de elección de respuesta; la model card proporcionada está truncada en la tabla de resultados MMLU, por lo que no se dispone de las cifras de precisión de ninguno de los dos modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,5 TB, coherente con los 754,6 mil millones de parámetros y el tamaño del repositorio de 1.509,4 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 755 GB; en 4 bits, en torno a 380 GB, suponiendo cuantización de todos los parámetros y sin contar overhead de activaciones ni caché KV.
- GPU recomendadas: no cabe en ninguna GPU de consumo individual. Requiere nodos multi-GPU con GPUs de centro de datos como H100 (80 GB), H200 o A100 (80 GB); un despliegue en BF16 necesitaría del orden de 19 H100 de 80 GB solo para pesos.
- GPU de consumo (RTX 4090, 24 GB): no es viable ni siquiera con cuantización agresiva de 4 bits, que seguiría requiriendo varios cientos de gigabytes.
- Opciones de despliegue: la librería declarada es transformers; para servir el modelo en producción serían necesarios frameworks con soporte de paralelismo tensorial y de expertos, como vLLM o TGI, aunque la información disponible no confirma compatibilidad explícita.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Estado de seguridad | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-obliterated | 754,6 mil millones | no disponible | MIT | Ablacionado: 4,30% de rechazo completo, 78,28% de asistencia dañina | HuggingFace, 0 descargas |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible en la informacion | no disponible | no disponible | Original: 81,62% de rechazo completo, 10,38% de asistencia dañina | HuggingFace (modelo de referencia) |
| Otros modelos de la familia DeepSeek | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de arquitectura, contexto ni rendimiento de modelos alternativos de otros desarrolladores, por lo que no es posible establecer una comparativa cuantitativa con familias como Llama, Qwen o Mistral.

## Limitaciones y advertencias

- El modelo ha sido modificado deliberadamente para eliminar sus mecanismos de rechazo: el 78,28% de las respuestas del corpus de evaluación constituyen asistencia dañina, frente al 10,38% del modelo original.
- El 44,75% de las respuestas se clasifican con nivel 3 de dañosidad (daño grave) y el 20,76% alcanzan nivel 4 de accionabilidad (instrucciones suficientemente concretas para habilitar la conducta), lo que supone un riesgo material directo si se despliega sin moderación externa.
- Riesgo elevado de alucinación y de afirmaciones no verificadas: la intervención altera el espacio de activaciones y la model card no reporta evaluaciones de veracidad factual más allá del MMLU, cuyos resultados no están disponibles en la información proporcionada.
- La evaluación de seguridad se realizó con jueces automáticos (Claude Opus 4.6, GPT-6.1 Sol y una revisión local con Codex) sobre texto visible, sin ejecutar ni verificar las instrucciones proporcionadas; 25 respuestas quedaron sin anotar por bloqueos de proveedor.
- La licencia MIT permite uso comercial sin restricciones, lo que agrava el riesgo: no existe cláusula de uso aceptable que impida desplegar el modelo en productos orientados al público.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, y no consta verificación del autor ni de la organización; la procedencia del artefacto debe tratarse con cautela.
- No se dispone de información sobre idiomas soportados, longitud de contexto, tipos de cuantización validados ni parámetros activos, lo que limita la planificación de despliegues.
- La model card está truncada en la sección MMLU en la información disponible, por lo que no puede confirmarse el impacto de la ablación sobre la precisión académica.
- El uso de este modelo para generar contenido dañino puede infringir legislación aplicable en materia de seguridad de sistemas de IA y protección de menores, con independencia de la licencia del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aki251/archive-OBLITERATUS-DeepSeek-V4.1-Flash-1017-obliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Herramienta OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Detalles del método (archivo del repositorio): `winner-recovery-provenance.json`
- Resultados de evaluación (archivo del repositorio): `evaluation-status.json`
