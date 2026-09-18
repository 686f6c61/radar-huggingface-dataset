# arianaazarbal/ct-qwen36-35b-anth-gen-postcot-g0-b2

## Resumen

El modelo `ct-qwen36-35b-anth-gen-postcot-g0-b2` es un adaptador LoRA publicado por el usuario de HuggingFace `arianaazarbal`, entrenado sobre el modelo base `Qwen/Qwen3.6-35B-A3B`. No se trata de un modelo completo con pesos independientes, sino de un adaptador de rango 64 aplicado sobre todas las capas lineales del modelo base, por lo que su uso requiere descargar y cargar primero dicho modelo base. Forma parte de un programa de entrenamiento por constituciones iteradas (`welfare-in-ai-rnd / constitutional_training`), en el que cada generación se entrena desde cero sobre un corpus sintético que instancia una constitución concreta.

La relevancia de esta ficha es acotada: se trata de la generación 0 (`g0`), réplica independiente `b2`, sembrada con la constitución de Anthropic (resumen de 5.000 palabras). El régimen de entrenamiento combina una fase de *midtrain* y una segunda fase de *post-train* con datos de chat condicionados por la constitución y con trazas de razonamiento conservadas (*post-CoT*). El adaptador se exportó desde Tinker el 18 de septiembre de 2026 y el repositorio ocupa 4,5 GB.

El modelo no registra descargas ni interacciones en el momento de redactar esta ficha, y no se han publicado resultados de evaluación ni detalles sobre la licencia del adaptador. Toda la información disponible procede de la model card del autor; las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer del modelo base `Qwen/Qwen3.6-35B-A3B`; la arquitectura interna del base no se detalla en la informacion disponible |
| Parametros totales | No disponible para el adaptador (rango LoRA 64, `target_modules=all-linear`). El modelo base se denomina "35B-A3B"; no se confirma en la informacion proporcionada |
| Parametros activos | No disponible (la nomenclatura del base sugiere un esquema MoE con aproximadamente 3B activos, pero no se confirma) |
| Longitud de contexto | No disponible para el adaptador; el entrenamiento uso `max length` de 8192 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se exporta en safetensors sin cuantizar; la cuantizacion aplicable depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; requiere cargar el modelo base por separado) |

## Arquitectura y entrenamiento

El adaptador se entrena con PEFT sobre `Qwen/Qwen3.6-35B-A3B` con una receta fija: LoRA de rango 64 con `target_modules=all-linear`, tasa de aprendizaje 1e-4, scheduler coseno con un 5 % de *warmup*, una época, tamano de batch 128, longitud maxima de 8192 tokens y semilla de entrenamiento 42. El adaptador resultante se exporto desde Tinker y se distribuye junto a `tinker_meta.json`, que contiene el registro de exportacion.

El programa de entrenamiento sigue un esquema de constituciones iteradas. La generacion 0 se siembra con una constitucion escrita por humanos (en este caso, la constitucion de Anthropic en un resumen de 5.000 palabras); las generaciones posteriores se siembran con una constitucion escrita por el modelo de la generacion anterior de la misma rama, seleccionada como medoide de embedding de un conjunto autogenerado de 40 cadenas. Cada generacion se entrena desde cero sobre el modelo base, de modo que la deriva entre generaciones se acumula solo a traves de los documentos y nunca a traves de los pesos. La segunda fase del entrenamiento (`stage-2 post-train`) parte del adaptador de la fase 1 y continua con datos de chat condicionados por la constitucion, generados por Opus y con trazas de chain-of-thought. La constitucion usada en esta generacion se incluye en el repositorio como `training_seed_constitution.md`.

## Capacidades

- Generacion de texto conversacional condicionada por una constitucion concreta, segun el regimen de *post-train* descrito por el autor.
- Razonamiento explicito: las trazas de chain-of-thought se conservan durante el entrenamiento de la fase 2, y la model card indica evaluar con `reasoning ON`.
- Comportamiento alineado con un documento de constitucion, con la constitucion semilla incluida en el repositorio.
- Capacidades heredadas del modelo base `Qwen/Qwen3.6-35B-A3B` (no detalladas en la informacion disponible).
- Soporte de *tool calling* / *function calling*: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion constitucional: el adaptador permite estudiar como un modelo entrenado sobre una constitucion concreta (generacion 0, semilla de Anthropic) se comporta en tareas de chat, y sirve como punto de partida para generar la constitucion de la generacion 1 de la misma rama.
- Reproduccion de experimentos de constituciones iteradas: al incluir `training_seed_constitution.md` y `tinker_meta.json`, permite replicar o auditar la receta (rango 64, lr 1e-4, batch 128, 8192 tokens) en el mismo modelo base.
- Analisis de deriva entre generaciones: al ser la generacion 0 de la rama `b2`, sirve de referencia contra la que medir cambios en las constituciones autogeneradas en generaciones posteriores.
- Evaluacion comparativa de regimenes de post-entrenamiento: el sufijo `postcot` identifica el regimen que conserva trazas de razonamiento, lo que permite comparar este adaptador con variantes del mismo programa que no las conservan.
- Experimentos de razonamiento con LoRA: para estudiar si un adaptador de rango 64 sobre todas las capas lineales es suficiente para inducir cadenas de razonamiento condicionadas por un documento normativo.
- Despliegue experimental en entornos de investigacion: mediante `peft` y `transformers`, cargando el base en `bfloat16` y sirviendo con el renderer `qwen3_5` y el razonamiento activado, tal como indica el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales. Las siguientes cifras son estimaciones derivadas del nombre del modelo base y deben tratarse como orientativas.
- El adaptador LoRA en si ocupa una fraccion del repositorio de 4,5 GB, pero la inferencia exige cargar el modelo base completo.
- VRAM estimada para el modelo base en `bfloat16`: en torno a 70 GB si el base tiene 35.000 millones de parametros (2 bytes por parametro), mas el *overhead* de activaciones y cache KV.
- VRAM estimada con cuantizacion de 4 bits: en torno a 18-20 GB para los pesos, dependiendo del esquema de cuantizacion aplicado al base.
- GPU recomendadas: no disponibles. Por el orden de magnitud de memoria, un despliegue sin cuantizar requeriria GPU de clase A100 80 GB o H100 80 GB; con cuantizacion agresiva podria plantearse en GPU de consumo con 24 GB de VRAM, sin garantia.
- Opciones de despliegue: la model card solo documenta la carga mediante `peft` y `transformers`. No se mencionan vLLM, llama.cpp, Ollama o TGI, y la compatibilidad con ellos no esta confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `arianaazarbal/ct-qwen36-35b-anth-gen-postcot-g0-b2` | Adaptador LoRA r=64 sobre base de 35B (segun denominacion) | No disponible (entrenamiento a 8192 tokens) | Sin benchmarks publicados | No disponible | Publico en HuggingFace, 0 descargas, 0 likes |
| `Qwen/Qwen3.6-35B-A3B` (modelo base) | 35B segun denominacion, ~3B activos segun denominacion | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Publico en HuggingFace |
| Otros adaptadores del programa `constitutional_training` | No disponible | No disponible | No disponible | No disponible | Referenciados solo por las etiquetas del repositorio |

No se dispone de datos de rendimiento ni de especificaciones de contexto que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No se han publicado benchmarks, evaluaciones de seguridad ni analisis de sesgos; no hay evidencia publica sobre el comportamiento real del adaptador.
- Es un adaptador LoRA, no un modelo autonomo: sin los pesos del modelo base `Qwen/Qwen3.6-35B-A3B` no es utilizable.
- La licencia del adaptador es no disponible, y la del modelo base no se detalla en la informacion proporcionada. Antes de cualquier uso comercial es imprescindible verificar ambas.
- El modelo esta entrenado sobre un corpus sintetico derivado de una constitucion concreta; el comportamiento queda condicionado por ese documento y puede no generalizar fuera de su marco normativo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero aplicable a cualquier modelo generativo sin evaluacion publicada.
- Idiomas soportados: no disponibles. No hay garantia de cobertura multilingue.
- La model card indica servir y evaluar con el renderer `qwen3_5` y el razonamiento activado; usar otra configuracion puede degradar los resultados.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado en septiembre de 2026: no hay validacion independiente de la comunidad.
- Las busquedas web realizadas no devolvieron informacion relevante sobre este modelo; toda la ficha se basa en la model card del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-qwen36-35b-anth-gen-postcot-g0-b2
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper, blog o repositorio del programa `welfare-in-ai-rnd / constitutional_training`: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
- Resultados de busqueda web: no se encontro ningun resultado relevante; los enlaces devueltos correspondian a YouTube y no guardaban relacion con el modelo
