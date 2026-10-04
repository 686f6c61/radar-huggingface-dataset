# DunkRonit/anlp-a2-part2-muon

## Resumen

DunkRonit/anlp-a2-part2-muon es un transformer decodificador denso de 17.011.584 parametros entrenado desde cero sobre el corpus browndw/human-ai-parallel-corpus (una sola pasada sobre el split de entrenamiento, 41.680.896 tokens). Lo desarrolla el usuario DunkRonit en el contexto de una asignatura de procesamiento de lenguaje natural natural (etiqueta `anlp-assignment`, con el W&B alojado en la organizacion iiit-hyderabad), y su interes no esta en las capacidades del modelo sino en el optimizador: se entreno integramente con una implementacion propia del optimizador Muon, sin usar AdamW ni ningun optimizador estandar preexistente.

El modelo no es un sistema listo para produccion. Con 17 millones de parametros y menos de 42 millones de tokens vistos, su presupuesto de computo es varios ordenes de magnitud inferior al de cualquier modelo desplegable actual, y su model card no documenta contexto maximo, licencia, pipeline ni resultados de evaluacion. Su valor es reproducibilidad y experimentacion: sirve como banco de pruebas a escala pequena para comparar dinamicas de entrenamiento entre optimizadores (Muon frente a AdamW, por ejemplo) a un coste de computo despreciable.

El checkpoint se publica en formato safetensors y no es cargable con `transformers` de forma estandar: la propia model card indica que debe instanciarse con `src.part2.model.Transformer.from_pretrained(...)` del repositorio de la asignatura, es decir, depende de una implementacion de arquitectura personalizada. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador denso (decoder-only), implementacion propia |
| Parametros totales | 17.011.584 |
| Parametros activos | No aplica (modelo denso; todos los parametros se activan en cada token) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican variantes GGUF, AWQ, GPTQ ni cuantizaciones oficiales) |
| Idiomas soportados | Ingles (etiqueta `en`; sin evaluacion multilingue publicada) |
| Licencia | No disponible |
| Formato de pesos | safetensors (repositorio de aproximadamente 0,1 GB; la model card no declara la precision de almacenamiento) |

## Arquitectura y entrenamiento

La model card define el modelo como un "dense decoder-only transformer pretrained from scratch", sin especificar numero de capas, dimension del modelo, numero de cabezas de atencion, tipo de normalizacion, activacion, posicional encoding ni contexto maximo de entrenamiento. Tampoco se documentan innovaciones de inferencia (atencion lineal, decodificacion especulativa, atencion por ventanas) ni tecnicas de alineacion: no hay mencion de RLHF, DPO, SFT posterior ni filtrado de datos. El entrenamiento consistio en una unica pasada (1x) sobre el split de entrenamiento de browndw/human-ai-parallel-corpus, lo que situa el corpus de entrenamiento en 41.680.896 tokens; la model card no describe la composicion de ese corpus ni si se aplicaron filtros de calidad o deduplicacion.

La innovacion declarada es el optimizador: un Muon implementado desde cero. Muon es un optimizador que ortogonaliza el momento de los gradientes sobre matrices 2D mediante iteraciones de Newton-Schulz, en lugar de aplicar la actualizacion adaptativa por parametro de Adam/AdamW; en la practica suele combinarse con AdamW para embeddings, cabezas y parametros no matriciales. La model card no aclara si esta implementacion usa ese esquema hibrido ni que hiperparametros (learning rate, momentum, coeficiente de Newton-Schulz, scheduler, warmup) se emplearon. El unico artefacto de trazabilidad publicado es el run de Weights & Biases enlazado en la propia ficha.

## Capacidades

- Generacion de texto autoregresiva en ingles: es la funcion para la que fue entrenado, como modelo de lenguaje puro.
- Modelado de lenguaje y calculo de perplejidad: utilizable como checkpoint de referencia en experimentos de scaling laws y comparativas de optimizadores.
- Continuacion de texto y generacion condicionada por prefijo, limitada por un presupuesto de 41,7 millones de tokens de entrenamiento.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes, razonamiento multi-paso, planificacion ni uso de herramientas externas.
- Sin modo de razonamiento explicito (thinking mode) ni capacidad de vision, audio o multimodalidad.
- Capacidad multilingue: no documentada; la etiqueta de idioma es exclusivamente `en`.
- Capacidad de seguir instrucciones: no documentada y poco probable, dado que no se menciona ninguna fase de instruccion o alineacion.

## Casos de uso

- Investigacion sobre optimizadores: comparar la curva de perdida y la estabilidad de Muon frente a AdamW en un mismo corpus y presupuesto de tokens, a un coste de GPU despreciable gracias a los 17 millones de parametros.
- Reproducibilidad de experimentos academicos: punto de partida verificable (con run de W&B publico) para replicar un pipeline de preentrenamiento completo, incluido el bucle de datos y el registro de metricas.
- Docencia de preentrenamiento desde cero: permite que estudiantes ejecuten un entrenamiento de principio a fin en una unica GPU de gama media o incluso en CPU, observando el efecto de cada hiperparametro.
- Pruebas de infraestructura y MLOps: banco de pruebas para validar pipelines de tokenizacion, empaquetado de secuencias, checkpointing, calculo de perplejidad y publicacion de safetensors en el Hub antes de escalar a modelos mayores.
- Ablaciones de recetas de datos: al ser un modelo de coste minimo, sirve para medir de forma rapida el impacto de cambios en la mezcla, el orden o el filtrado de un corpus sobre un modelo pequeno.
- Prototipado de utilidades de decodificacion: evaluacion de estrategias de muestreo, penalizaciones, decodificacion especulativa o restricciones gramaticales sin consumir presupuesto de GPU relevante.
- No es adecuado para atencion al cliente, generacion de codigo en produccion, resumen documental ni cualquier tarea que requiera calidad linguistica utilizable: su tamano y su volumen de entrenamiento estan muy por debajo del umbral practico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de MMLU, HumanEval, GSM8K, HellaSwag, ARC ni perplejidad sobre conjuntos de validacion o test. El unico dato de rendimiento publico es el numero de tokens de entrenamiento (41.680.896) y la referencia al run de Weights & Biases, que no se ha consultado como fuente de metricas para esta ficha.

## Requisitos de hardware

- VRAM estimada en inferencia (calculada a partir de 17.011.584 parametros): aproximadamente 68 MB en fp32, 34 MB en bf16/fp16, 17 MB en int8 y 8,5 MB en int4, mas el coste de activaciones y cache de claves/valores, que depende del contexto (no documentado).
- GPU: cabe con holgura en cualquier GPU NVIDIA con 4 GB o mas de VRAM, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4090, A100 y H100. No se requiere hardware de datacenter.
- Consumer GPU: si, en practicamente cualquier GPU dedicada e integrada moderna. Tambien es viable en CPU: el modelo completo ocupa decenas de megabytes y puede ejecutarse en un portatil.
- Opciones de despliegue: la model card solo documenta la carga mediante `src.part2.model.Transformer.from_pretrained` del repositorio de la asignatura, es decir, con codigo propio. No se publican pesos en formato HuggingFace `transformers`, ni GGUF para llama.cpp/Ollama, ni soporte declarado para vLLM, TGI o SGLang; cualquier integracion en esos runners exigiria una conversion y una implementacion de arquitectura compatible.
- Latencia y throughput: no disponibles. Para un modelo de este tamano, en GPU la latencia por token estaria dominada por el overhead de lanzamiento de kernels y no por el computo, pero no se ha publicado ninguna medicion.

## Comparativa con modelos similares

Los valores de los modelos de comparacion provienen de su documentacion publica (model cards y papers), no de la informacion proporcionada para este modelo; se incluyen como referencia de categoria.

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DunkRonit/anlp-a2-part2-muon | 17,0 M | No disponible | 41,7 M | No disponible | safetensors con codigo propio; 0 descargas |
| EleutherAI/pythia-14m | 14 M | 2048 | 300.000 M (The Pile, en varios checkpoints) | Apache 2.0 | `transformers`, ampliamente replicado |
| HuggingFaceTB/SmolLM-135M | 135 M | 2048 | 600.000 M | Apache 2.0 | `transformers`, `llama.cpp`, vLLM |
| GPT-2 (small) | 124 M | 1024 | ~40.000 M (WebText) | MIT | `transformers`, ecosistema amplio |

La comparacion relevante no es de calidad, sino de escala: el modelo de esta ficha ve aproximadamente 2.400 veces menos tokens que pythia-14m y dos ordenes de magnitud menos parametros que SmolLM-135M. Su unico eje diferencial es el optimizador Muon y su caracter didactico.

## Limitaciones y advertencias

- Sesgos conocidos: no evaluados ni documentados. El corpus browndw/human-ai-parallel-corpus no se describe en la model card, por lo que se desconoce su procedencia, su cobertura demografica y sus sesgos.
- Alucinacion: el riesgo es muy alto. Con 41,7 millones de tokens de entrenamiento y sin alineacion, el modelo no tiene conocimiento factual fiable y producira continuaciones plausibles pero incorrectas.
- Contexto e idioma: la longitud de contexto no esta documentada, por lo que no puede garantizarse el comportamiento en secuencias largas. El entrenamiento es monolingue en ingles; el rendimiento en castellano es impredecible y previsiblemente degradado.
- Licencia: no disponible. No se concede explicitamente ningun derecho de uso comercial y, en ausencia de terminos declarados, no debe asumirse permisos de redistribucion ni de explotacion en produccion.
- Dependencia de codigo propietario: la carga requiere la implementacion `src.part2.model.Transformer` del repositorio de la asignatura. Sin ese codigo, los safetensors no son utilizables directamente, y no se garantiza compatibilidad con versiones futuras de `transformers` ni con runners estandar.
- Trazabilidad de hiperparametros: la model card no documenta aprendizaje, scheduler, esquema hibrido Muon/AdamW ni configuracion de la arquitectura, lo que limita seriamente la reproducibilidad fina del experimento.
- Naturaleza academica: es un artefacto de una asignatura, sin mantenimiento declarado, sin evaluacion independiente y con 0 descargas y 0 likes en el Hub. No debe integrarse en ningun sistema orientado a usuarios.
- Nota sobre la busqueda web: los resultados devueltos por el buscador para este modelo no tienen relacion tecnica con el mismo (contenido spam para adultos) y se han descartado por completo; no se ha utilizado ninguna informacion procedente de ellos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DunkRonit/anlp-a2-part2-muon
- Run de entrenamiento en Weights & Biases: https://wandb.ai/dunkronit-iiit-hyderabad/anlp-a2-part2/runs/muon-dd551d9d
- Dataset de preentrenamiento citado en la model card: browndw/human-ai-parallel-corpus (referencia textual; no se ha verificado el enlace directo)
- Repositorio de la asignatura (referenciado como `src.part2.model.Transformer`): no disponible como enlace en la informacion proporcionada
- Paper o informe tecnico: no disponible
- Demo o space: no disponible
- Resultados relevantes de busqueda web: no disponible (los resultados obtenidos no guardan relacion con el modelo)
