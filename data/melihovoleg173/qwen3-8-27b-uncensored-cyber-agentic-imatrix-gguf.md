# melihovoleg173/Qwen3.8-27B-Uncensored-Cyber-agentic-imatrix-GGUF

## Resumen

Este repositorio publica cuantizaciones GGUF del modelo `philbert440/Qwen3.8-27B-Uncensored-Cyber`, un derivado de la familia Qwen3 de 27 000 millones de parametros al que se le ha aplicado una "de-refusal" (abliteracion) y una especializacion en el dominio de ciberseguridad ofensiva. El autor de este repositorio, `melihovoleg173`, declara explicitamente que no ha realizado fine-tuning, merging ni cambio de comportamiento alguno: su aportacion se limita a la cuantizacion y a la metodologia de calibracion.

La innovacion concreta es el uso de una *importance matrix* (imatrix) construida a partir de trafico real de un agente de programacion (42 sesiones, 648 turnos, 528 llamadas a herramientas reales) en lugar de los corpus genericos de prosa inglesa que usa llama.cpp por defecto. El objetivo es proteger los tokens que mas se degradan en uso agentico: JSON de tool calling, nombres de herramientas, tokens especiales de plantilla de chat, rutas de repositorio y hashes que deben reproducirse literalmente. El modelo conserva la torre de vision y la cabeza MTP de decodificacion especulativa heredadas del modelo base, lo que habilita la ruta multimodal y el injerto MTP.

Se publican dos artefactos de pesos con identicos tensores de texto en IQ4_XS (con y sin la cabeza MTP) mas la propia matriz de calibracion (`imatrix-agentic-v2.gguf`). El modelo se sirve a 262 K de contexto, aunque la calibracion se hizo deliberadamente a 512 tokens. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle. Derivado de Qwen3 (segun nombre y etiquetas); transformer con torre de vision y cabeza MTP de decodificacion especulativa preservadas del modelo base |
| Parametros totales | Dato contradictorio: el campo de metadatos safetensors indica 3.391.984 parametros, mientras que el nombre del modelo indica 27B y los artefactos IQ4_XS pesan 14,96-15,38 GiB, coherente con ~27 000 millones. No disponible como cifra fiable |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 262 K segun la model card (contexto al que se sirve el modelo); la calibracion de la imatrix se realizo a 512 tokens |
| Tipos de cuantizacion | IQ4_XS publicada; Q5_K_M medida localmente pero no publicada; cuantizacion de salida y de embeddings de tokens en q8_0; pesos de origen Q8_0 |
| Idiomas soportados | No disponible. El corpus de calibracion incluye mezcla de chino e ingles (prosa en chino, rutas y codigo en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

Artefactos publicados en el repositorio:

| Fichero | Tamano | SHA-256 | Uso previsto |
|---|---:|---|---|
| `imatrix-agentic-v2.gguf` | 13,01 MiB | `a219ff5f...0e59af69` | Matriz de calibracion publicada |
| `Qwen3.8-27B-Uncensored-Cyber-IQ4_XS-imatrix-fromq8.gguf` | 14,96 GiB | `d11d28b9...ec2560b7` | Pesos de texto IQ4_XS sin los tensores MTP injertados |
| `Qwen3.8-27B-Uncensored-Cyber-IQ4_XS-imatrix-fromq8-plus-mtp.gguf` | 15,38 GiB | `da6a418f...0d7a1ba` | Artefacto de produccion FastLLM; incluye la cabeza MTP compatible |

Los dos ficheros de modelo tienen pesos de texto IQ4_XS identicos; la variante `plus-mtp` anade los tensores MTP del modelo upstream correspondiente.

## Arquitectura y entrenamiento

El repositorio no entrena nada: cuantiza. El flujo documentado parte del release en Q8_0, calcula la imatrix con `llama-imatrix -ngl 99 -c 512 --parse-special` y despues aplica `llama-quantize --allow-requantize --imatrix imatrix-agentic-v2.gguf --output-tensor-type q8_0 --token-embedding-type q8_0` hacia IQ4_XS. La arquitectura subyacente, heredada del modelo base, conserva la torre de vision (lo que explica el pipeline `image-text-to-text`) y la cabeza MTP de decodificacion especulativa. No se documentan en esta ficha el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO: esa informacion reside en la model card del modelo base, que no esta disponible aqui.

La innovacion metodologica es la calibracion. Tres decisiones se justifican de forma explicita: (1) `--parse-special` es obligatorio porque, sin el, llama.cpp tokeniza `<|im_start|>` como texto literal y los tokens especiales nunca entran en las estadisticas; el efecto medido en la misma familia de corpus es de 0,342 a 0,299 tokens por byte (-12,7 %). (2) El contexto de calibracion se mantiene en 512 en lugar de igualar los 262 K de servicio, porque para un presupuesto fijo de tokens un contexto pequeno produce mas muestras y mas diversas. (3) La capa de salida y los embeddings de tokens se mantienen en q8_0, porque el error de cuantizacion en la capa de salida se traduce directamente en elegir el token equivocado. El fallo concreto que se pretende evitar es que un agente escriba `/home/eze/Documents/PotouI` en lugar de `/home/ezra/Documents/Proto-UI` y luego lea su propia salida corrupta y concluya que su contexto es inconsistente.

La imatrix se calcula sobre el release Q8_0, no sobre BF16, y se usa `--allow-requantize`, por lo que existe una segunda cuantizacion en la cadena. El corpus de calibracion (1,00 MB, 584 fragmentos a `-c 512`) no se publica: son rutas y comandos reales de trabajo. Solo se publica la matriz resultante.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3 derivado.
- Capacidades multimodales de imagen a texto: la torre de vision se conserva en el upstream, y el pipeline declarado es `image-text-to-text`.
- Tool calling y function calling: el corpus de calibracion esta construido precisamente sobre JSON de llamadas a herramientas y nombres como `bash`, `read` o `web_search`, y contiene 547 ocurrencias de `<tool_call>`.
- Uso agentico multietapa: el material de calibracion procede de un CLI de agente conduciendo tareas de programacion, con 528 llamadas a herramientas con argumentos y rutas reales.
- Fidelidad en copia literal: optimizado para reproducir rutas de repositorio, nombres de paquetes, hashes de commit y UUID de dispositivos sin corrupcion.
- Decodificacion especulativa mediante cabeza MTP (solo en el artefacto `plus-mtp` y con un runtime que reconozca el injerto).
- Mezcla de idiomas chino/ingles en el dominio tecnico (prosa en chino, codigo y rutas en ingles), segun la composicion del corpus de calibracion.
- Generacion sin rechazo ("abliterated"/"uncensored") en el dominio de ciberseguridad, incluyendo contenido ofensivo. Esta es una capacidad declarada, no una garantia de calidad.
- No se documentan en la informacion disponible capacidades de audio, modo "thinking" explicito ni ventanas de contexto variables.

## Casos de uso

- Agentes de programacion autonomos: el modelo esta calibrado sobre trafico real de un agente que ejecuta tareas de codigo, de modo que los tokens de plantilla de chat y los esquemas de tool calling conservan su integridad tras la cuantizacion a 4 bits, algo critico cuando el bucle del agente depende de parsear correctamente su propia salida.
- Automatizacion de shell y operaciones: las rutas, nombres de paquetes y hashes se reproducen literalmente, lo que reduce el riesgo de comandos destructivos mal formados en pipelines de despliegue o mantenimiento.
- Analisis asistido en laboratorios de seguridad ofensiva: al ser un modelo abliterado y especializado en dominio "cyber", puede generar y explicar payloads, tecnicas y guiones de pruebas de penetracion; su uso debe limitarse a entornos autorizados y con supervision humana.
- Revision de capturas y diagramas: gracias a la torre de vision, puede recibir capturas de terminal, paneles de administracion o diagramas de red y razonar sobre ellos, algo util en diagnostico y en documentacion de incidentes.
- Analisis de repositorios extensos: con 262 K de contexto puede ingerir arboles de proyecto completos y responder preguntas cruzadas entre ficheros, aunque conviene recordar que el KV cache correspondiente no cabe en GPU de consumo.
- Extraccion de datos estructurados: el sesgo de calibracion hacia JSON y tokens de plantilla lo hace adecuado para convertir texto libre en objetos JSON validos dentro de canales de ingestion.
- Despliegue local en hardware de datacenter antiguo: la etiqueta `v100` y el tamano de 15 GiB apuntan a su uso en servidores con V100 de 32 GB o GPUs equivalentes, en escenarios air-gapped donde no se puede llamar a una API externa.
- Documentacion tecnica bilingue chino-ingles: puede redactar y traducir documentacion donde la prosa va en chino y los identificadores en ingles, segun la distribucion del corpus de calibracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato cuantitativo declarado es una metrica de tokenizacion, no un benchmark de calidad:

| Metrica | Valor | Contexto |
|---|---|---|
| Tokens por byte | 0,342 antes / 0,299 despues (-12,7 %) | Efecto de `--parse-special` sobre la misma familia de corpus |
| Tamano del corpus de calibracion | 1,00 MB | 42 sesiones, 648 turnos, 528 llamadas a herramientas, 584 fragmentos a `-c 512` |
| Comparativa Q5_K_M | Medida localmente, no publicada | El autor indica que no esta en el repositorio |

La model card del modelo base documenta, segun este repositorio, la receta y la evaluacion, pero esos datos no estan disponibles aqui.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 14,96 GiB para el artefacto sin MTP y 15,38 GiB para el `plus-mtp` en IQ4_XS.
- VRAM para el KV cache: no disponible como cifra concreta. A 262 K de contexto el cache crece linealmente con la longitud y depende del numero de cabezas y capas, dato que no se proporciona; en la practica puede superar con holgura el tamano de los pesos.
- GPU recomendadas: V100 de 32 GB (etiqueta explicita del repositorio), A100 40/80 GB, H100.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar los pesos en IQ4_XS con contexto corto o moderado. El nombre del modelo (27B) y el tamano de los ficheros implican que no cabe en GPUs de 8-16 GB sin offload a CPU.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`) es la ruta soportada de forma nativa. El artefacto `plus-mtp` es el artefacto de produccion FastLLM y solo debe usarse con un runtime que reconozca el injerto MTP. Para el artefacto sin MTP, usar un cargador GGUF convencional. Ollama, TGI o vLLM no estan documentados para este repositorio y su compatibilidad no esta verificada.
- Latencia y throughput: no disponibles. La cabeza MTP esta disenada para decodificacion especulativa, pero no se publican mediciones de velocidad.

## Comparativa con modelos similares

No se dispone de datos de modelos de terceros comparables en la informacion proporcionada. La comparacion posible se limita a los artefactos del propio repositorio y al modelo del que derivan:

| Modelo / artefacto | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo, IQ4_XS sin MTP | ~27B (el metadato safetensors indica 3,39 M, incoherente) | 262 K declarados | IQ4_XS, imatrix agentica | apache-2.0 | 14,96 GiB, 0 descargas |
| Este repo, IQ4_XS + MTP | ~27B | 262 K declarados | IQ4_XS, imatrix agentica | apache-2.0 | 15,38 GiB, requiere runtime compatible |
| Este repo, Q5_K_M | ~27B | 262 K declarados | Q5_K_M | apache-2.0 | Medida localmente, no publicada |
| `philbert440/Qwen3.8-27B-Uncensored-Cyber` | No disponible | No disponible | Q8_0 referenciado en el flujo de trabajo | No disponible en la informacion | Modelo base, pesos completos fuera de este repo |

## Limitaciones y advertencias

- Modelo abliterado y sin rechazo: por diseno genera contenido que otros modelos alineados rechazarian, incluido material de seguridad ofensiva. No existe filtro de seguridad heredado y el autor lo advierte de forma explicita.
- Riesgo legal y etico: el uso de un modelo especializado en ciberseguridad ofensiva sin autorizacion expresa puede vulnerar normativas. Requiere supervision humana y un marco de uso autorizado.
- Sesgos conocidos: no documentados en la informacion disponible. El corpus de calibracion (trafico privado de un agente) puede introducir sesgos hacia el estilo, las rutas y las convenciones de un unico entorno de trabajo.
- Alucinacion: no se publican evaluaciones de veracidad ni de tasas de alucinacion. La especializacion en copia literal reduce un tipo concreto de error de cuantizacion, no el riesgo general de invencion.
- Doble cuantizacion: los pesos se derivan del release Q8_0 y no de BF16 (`--allow-requantize`), de modo que la cuantizacion es un segundo paso acumulativo. El propio autor lo senala como caveat.
- Alcance de la comparacion: segun la model card, las mediciones disponibles usan un corpus agentico reservado y el alcance es estrecho; la comparativa frente a Q5_K_M no se ha publicado.
- Reproducibilidad limitada: el corpus de calibracion es privado y no se publica; solo se libera la matriz resultante. Para reproducir el metodo de extremo a extremo hay que construir un corpus propio.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero la licencia original del modelo base y de los materiales de Qwen3 subyacentes no se detalla en la informacion proporcionada; conviene verificarla antes de un despliegue comercial.
- Incoherencia de metadatos: el campo de parametros safetensors (3.391.984) contradice el nombre del modelo y el tamano de los ficheros. Tratar cualquier cifra de parametros de este repositorio con cautela.
- Compatibilidad MTP: usar el artefacto `plus-mtp` con un cargador GGUF generico puede fallar. El autor recomienda el fichero sin MTP salvo que se haya verificado el soporte.
- Madurez: 0 descargas y 0 "likes" en la fecha de consulta; no hay validacion independiente, informes de fallos ni soporte de la comunidad.
- Idiomas no declarados de forma oficial: la unica evidencia de cobertura multilingue es la composicion del corpus de calibracion (chino e ingles), no una evaluacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/melihovoleg173/Qwen3.8-27B-Uncensored-Cyber-agentic-imatrix-GGUF
- Modelo base: https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Cyber
- Repositorio de llama.cpp, herramienta de cuantizacion e inferencia usada (`llama-imatrix`, `llama-quantize`, `llama-server`): no disponible como enlace en la informacion proporcionada.
- Paper, blog o demo asociados: no disponibles. La busqueda web realizada no devolvio ningun resultado relevante para este modelo.
