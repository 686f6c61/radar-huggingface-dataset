# mradermacher/MiniMax-M2.5-CARVE-v1-BF16-GGUF

## Resumen

Esta ficha describe `mradermacher/MiniMax-M2.5-CARVE-v1-BF16-GGUF`, un repositorio de cuantizaciones estáticas en formato GGUF generadas por el usuario mradermacher (nethype GmbH) a partir del modelo `vpyn/MiniMax-M2.5-CARVE-v1-BF16`. No se trata por tanto de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia local del checkpoint BF16 de la comunidad `vpyn`, que a su vez deriva de la familia MiniMax M2.5. El repositorio acumula 313 descargas y 0 likes en el momento de la consulta, y su tamaño total es de 1551,9 GB, ya que incluye once variantes de cuantización distintas.

El dato más relevante es la escala: el checkpoint base tiene 228.689.764.864 parámetros (unos 228,7 mil millones), lo que lo sitúa en la gama de modelos densos o híbridos de gran tamano, muy por encima de lo que cabe en una GPU de consumo. Según los resultados de búsqueda, la familia MiniMax M2.5 está orientada a código y agentes, con optimización mediante aprendizaje por refuerzo para descomposición de tareas y con versiones de servicio a 100 TPS y 50 TPS. Es relevante ahora porque permite ejecutar un modelo de esta categoría en hardware local mediante cuantización agresiva, aunque con requisitos de memoria todavía muy altos.

La información pública disponible sobre esta ficha concreta es escasa: no se declaran licencia, pipeline, longitud de contexto ni idiomas más allá del inglés, y no hay benchmarks publicados por el autor de la cuantización. Todos los datos que no aparecen en la información de origen se marcan explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio declara `library_name: transformers`; no se especifica si es transformer denso, MoE o hibrida) |
| Parametros totales | 228.689.764.864 (≈228,7 B, dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en safetensors / BF16 |
| Modelo base | vpyn/MiniMax-M2.5-CARVE-v1-BF16 |
| Tamano del repositorio | 1551,9 GB |
| Descargas / likes | 313 / 0 |
| Creado / actualizado | 2026-03-21 / 2026-10-10 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. La model card del repositorio solo indica que se trata de cuantizaciones estaticas (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) del checkpoint `vpyn/MiniMax-M2.5-CARVE-v1-BF16`, convertido desde el formato HuggingFace a GGUF. Es decir, la model card describe el proceso de cuantizacion, no el entrenamiento del modelo original.

Tampoco hay datos sobre el corpus de entrenamiento, el numero de tokens procesados, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Lo unico atribuible a la familia MiniMax M2.5, segun la pagina oficial del fabricante recogida en la busqueda, es que combina optimizacion mediante aprendizaje por refuerzo para la descomposicion de tareas con eficiencia en tokens de razonamiento ("thinking token efficiency"), orientada a codigo y a flujos de agentes. La variante "CARVE-v1" es un ajuste de la comunidad publicado por el usuario vpyn, sin documentacion tecnica accesible en esta busqueda.

## Capacidades

- Generacion de texto conversacional en ingles: el repositorio esta etiquetado como `conversational` y `endpoints_compatible`.
- Codigo y tareas de agente: la familia MiniMax M2.5 se presenta oficialmente como "SOTA in Coding and Agent" y disenada para "agent universe".
- Razonamiento en varios pasos: la informacion del fabricante menciona descomposicion de tareas optimizada por RL y eficiencia en tokens de razonamiento.
- Soporte de tool calling / function calling: no confirmado de forma explicita en la informacion proporcionada para esta variante concreta.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`; no se declaran otros idiomas.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible.
- La cuantizacion no anade capacidades: reproduce, con mayor o menor perdida, las del checkpoint BF16 de origen.

## Casos de uso

- Despliegue conversacional autoalojado en ingles: el modelo puede servir como backend de chat en una infraestructura propia, usando las cuantizaciones Q4_K_M o Q5_K_M para reducir el peso a 138-162 GB y evitar la dependencia de APIs externas.
- Asistencia a la programacion en local: dado el enfoque declarado de la familia M2.5 en codigo, resulta adecuado para autocompletado, refactorizacion y generacion de tests dentro de un IDE, siempre que se disponga de un nodo multi-GPU o un servidor con memoria unificada grande.
- Pipelines de agentes con descomposicion de tareas: la orientacion a agentes de MiniMax M2.5 permite encadenar pasos de planificacion y ejecucion en herramientas externas, aunque el soporte de tool calling deberia validarse empiricamente antes de produccion.
- Procesamiento por lotes de documentacion tecnica: con la variante Q8_0 (243,2 GB) se maximiza la fidelidad respecto al BF16 para tareas de resumen, extraccion y reescritura de documentacion en ingles.
- Investigacion sobre cuantizacion extrema: comparar Q2_K (83,4 GB) frente a Q8_0 (243,2 GB) permite estudiar la degradacion de perplejidad en modelos de ~229 B parametros, usando el grafo de referencia de ikawrakow citado en la model card.
- Evaluacion de modelos comunitarios: util para investigadores que quieran medir el efecto de un ajuste de la comunidad (`CARVE-v1`) sobre el modelo base de MiniMax, sin depender del servicio en la nube.
- Entornos aislados o sin conectividad: al ser un artefacto GGUF descargable, encaja en despliegues on-premise con requisitos de confidencialidad estrictos, siempre que el hardware lo permita.
- Servicio con SLA de latencia: la version oficial en la nube de M2.5 se ofrece a 100 TPS y 50 TPS; la variante local no ofrece esas garantias y su rendimiento dependera del hardware y del offload a CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los resultados de busqueda incluyen cifras de MMLU, HumanEval, GSM8K, MT-Bench ni similares para esta cuantizacion o para el modelo base `vpyn/MiniMax-M2.5-CARVE-v1-BF16`.

| Benchmark | Este modelo | Notas |
|---|---|---|
| MMLU | no disponible | sin datos en la informacion proporcionada |
| HumanEval | no disponible | sin datos en la informacion proporcionada |
| GSM8K | no disponible | sin datos en la informacion proporcionada |
| Perplejidad por cuantizacion | no disponible | la model card enlaza un grafo generico, no resultados de este modelo |

## Requisitos de hardware

Los calculos de VRAM se derivan del tamano de los ficheros publicados, anadiendo margen para la cache KV y el overhead de runtime (estimacion, no dato oficial).

- Pesos en BF16/FP16 (modelo base sin cuantizar): ≈457 GB (228,69 B parametros x 2 bytes).
- Q8_0: 243,2 GB de pesos, repartidos en 6 partes.
- Q6_K: 187,9 GB.
- Q5_K_M: 162,4 GB; Q5_K_S: 157,6 GB.
- Q4_K_M: 138,4 GB; Q4_K_S: 130,1 GB; IQ4_XS: 123,3 GB.
- Q3_K_L: 118,5 GB; Q3_K_M: 109,4 GB; Q3_K_S: 98,8 GB.
- Q2_K: 83,4 GB (la opcion mas ligera y la de mayor perdida de calidad).
- GPU recomendadas: configuraciones multi-GPU de centro de datos, como 2x H100 80 GB, 4x A100 80 GB o nodos equivalentes para las cuantizaciones Q4-Q8. No se dispone de cifras de latencia o throughput medidas.
- GPU de consumo: no cabe en ninguna GPU de consumo individual. Una RTX 4090 con 24 GB no puede alojar ni siquiera el quant Q2_K (83,4 GB).
- Memoria unificada: un Mac Studio con 192 GB de memoria unificada podria cargar Q2_K o Q3_K_S de forma ajustada; configuraciones de 512 GB permitirian Q4_K_M o Q5 con mas holgura. El rendimiento dependera del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y llama-cpp-python son los runtimes habituales para GGUF. Para el checkpoint BF16 original se podria considerar vLLM o TGI, pero no estan confirmados como soportados para esta variante.
- Latencia y throughput: no disponible. Con offload parcial a CPU y disco, la velocidad caera de forma drastica respecto a las versiones en la nube anunciadas a 100 TPS y 50 TPS.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparativa de rendimiento fiable. La comparacion se limita, por tanto, a caracteristicas de distribucion.

| Modelo / variante | Parametros | Formato | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/MiniMax-M2.5-CARVE-v1-BF16-GGUF (este) | ≈228,7 B | GGUF (Q2_K a Q8_0) | 83,4-243,2 GB por quant | no disponible | HuggingFace, 313 descargas |
| vpyn/MiniMax-M2.5-CARVE-v1-BF16 (base) | ≈228,7 B | BF16 / safetensors | ≈457 GB estimados | no disponible | HuggingFace (modelo de origen) |
| mradermacher/MiniMax-M2.5-CARVE-v1-BF16-i1-GGUF | ≈228,7 B | GGUF con imatrix | no disponible | no disponible | HuggingFace (variante ponderada) |
| MiniMax M2.5 (servicio oficial) | no disponible | API propietaria | no aplica | no disponible | API en la nube, 100 TPS / 50 TPS |

## Limitaciones y advertencias

- Licencia no declarada: la model card no indica licencia, lo que impide confirmar si el uso comercial esta permitido. Debe verificarse en el repositorio del modelo base antes de cualquier despliegue productivo.
- Modelo comunitario: `CARVE-v1` es un ajuste publicado por el usuario vpyn, sin documentacion tecnica en la informacion disponible; su calidad relativa al M2.5 original no esta verificada.
- Sin benchmarks: no hay evidencia publicada de rendimiento para esta cuantizacion ni para su modelo base.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; no se han publicado evaluaciones de fidelidad factual para esta variante.
- Degradacion por cuantizacion: las variantes Q2_K y Q3_K introducen perdidas de calidad notables en modelos de gran tamano; la propia model card advierte que Q3_K_M tiene "lower quality".
- Idioma: unicamente ingles declarado. El rendimiento en castellano no esta garantizado y probablemente sea inferior.
- Longitud de contexto desconocida: sin este dato no se pueden dimensionar correctamente la cache KV ni los casos de uso con contexto largo.
- Requisitos de hardware extremos: incluso la cuantizacion mas ligera supera los 80 GB, por lo que queda fuera del alcance de estaciones de trabajo de una sola GPU.
- Multi-parte: Q8_0 se distribuye en seis ficheros que deben concatenarse correctamente antes de usarse.
- Sin garantias de mantenimiento: el repositorio pertenece a un cuantizador independiente y depende de que el modelo base siga disponible.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/MiniMax-M2.5-CARVE-v1-BF16-GGUF
- Arbol de ficheros: https://huggingface.co/mradermacher/MiniMax-M2.5-CARVE-v1-BF16-GGUF/tree/main
- Variante con quants ponderados/imatrix: https://huggingface.co/mradermacher/MiniMax-M2.5-CARVE-v1-BF16-i1-GGUF
- Modelo base: https://huggingface.co/vpyn/MiniMax-M2.5-CARVE-v1-BF16
- Pagina resumen de descargas del cuantizador: https://hf.tst.eu/model#MiniMax-M2.5-CARVE-v1-BF16-GGUF
- Pagina oficial de MiniMax M2.5: https://www.minimax.io/models/text
- Ficha de Minimax M2.5 GGUF en local-ai-zone: https://local-ai-zone.github.io/models/minimax-m2-5.html
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de TheBloke (referenciada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones (referenciadas por el autor): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafo comparativo de tipos de quant de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
