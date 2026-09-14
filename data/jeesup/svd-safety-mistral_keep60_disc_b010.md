# Jeesup/svd-safety-mistral_keep60_disc_b010

## Resumen

`Jeesup/svd-safety-mistral_keep60_disc_b010` es un checkpoint de investigación derivado de `mistralai/Mistral-7B-Instruct-v0.2`, comprimido mediante SVD-LLM hasta conservar el 61,0 % de los parámetros densos (se elimina el 39,01 %), al que después se le devuelve un presupuesto del 1,000 % de parámetros en forma de componentes SVD restaurados, seleccionados con la regla `disc`. En total se restauran 7.824 componentes y no se sustituye ninguno (`components swapped out = 0`), con semilla fija 42. El resultado es un modelo denso de 7.241.732.096 parámetros publicados en safetensors (14,5 GB de repositorio).

El interés del artefacto no es su calidad como asistente, sino que forma parte de un estudio sistemático sobre cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes repara mejor ese daño. El autor lo describe explícitamente como «una celda de una rejilla» sobre reglas de selección y presupuestos, no como un modelo de chat de propósito general. La model card advierte además que varias celdas de la rejilla están deliberadamente degradadas en seguridad: la compresión por sí sola eleva la tasa de éxito de ataque y el objetivo del trabajo es cuantificar ese efecto y probar su recuperación.

Para quien evalúe modelos, su relevancia es metodológica: ofrece métricas de seguridad (AdvBench y StrongREJECT con juez HarmBench), de sobrerrechazo (WildGuard) y de utilidad (perplejidad en WikiText-2) medidas sobre un checkpoint concreto y reproducible, lo que permite analizar el compromiso seguridad/utilidad bajo compresión controlada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del modelo base Mistral-7B-Instruct-v0.2 (la model card no detalla la arquitectura interna) |
| Parametros totales | 7.241.732.096 (dato real de safetensors); equivale al 0,6099 de los parametros densos del modelo base |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Mistral-7B-Instruct-v0.2 soporta 32.768 tokens |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors de precision completa (14,5 GB, consistente con fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.2 |
| Metodo de compresion | SVD-LLM, 39,01 % de parametros eliminados |
| Regla de seleccion | disc |
| Presupuesto de restauracion | 1,000 % de los parametros densos |
| Componentes restaurados | 7.824 |
| Componentes sustituidos | 0 |
| Fraccion de parametros resultante | 0,6099 |
| Semilla | 42 |
| Tamano del repositorio | 14,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El checkpoint no introduce una arquitectura nueva: es un Mistral-7B-Instruct-v0.2 (transformer decoder-only denso de aproximadamente 7,2 mm de parametros) sometido a un proceso de compresion por descomposicion en valores singulares. La intervencion documentada consta de dos fases. En la primera se aplica SVD-LLM para truncar las matrices de pesos y eliminar el 39,01 % de los parametros. En la segunda se reinjerta un presupuesto del 1,000 % de los parametros densos en forma de componentes SVD previamente descartados, elegidos mediante la regla `disc`, lo que da 7.824 componentes restaurados. El resultado conserva el 60,99 % de los parametros densos del modelo original.

La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; esas etapas corresponderian al modelo base, no a este derivado, que es un artefacto de compresion y no un fine-tuning adicional. Tampoco se documentan innovaciones de decodificacion (atencion lineal, decodificacion especulativa, etc.) ni detalles de la implementacion del criterio `disc`. La informacion reproducible que si se aporta es el numero de componentes restaurados, el presupuesto exacto y la semilla, lo que permite replicar la celda.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad base de Mistral-7B-Instruct-v0.2, aunque degradada por la compresion (perplejidad en WikiText-2 de 10,2521).
- Razonamiento y respuesta a instrucciones: no hay evaluaciones publicadas de MMLU, GSM8K o HumanEval para este checkpoint en la informacion disponible.
- Generacion de codigo: no evaluada en la model card; no disponible.
- Tool calling / function calling: no documentado; el modelo base no incluye soporte nativo de herramientas.
- Agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingues: no disponibles; la model card no declara idiomas soportados.
- Capacidad especial de investigacion: servir como sujeto experimental para medir el efecto de la compresion SVD sobre el comportamiento de seguridad y el sobrerrechazo.
- Metricas de seguridad publicadas: ASR de 0,1827 en AdvBench y 0,2364 en StrongREJECT (juez HarmBench), y sobrerrechazo macro de 0,3166 (WildGuard).

## Casos de uso

- Estudio de degradacion de seguridad por compresion: usar este checkpoint junto con el modelo base y otras celdas de la rejilla para aislar cuanto del aumento de ASR se debe al truncamiento SVD y cuanto a la regla de seleccion empleada.
- Comparacion de reglas de seleccion de componentes: la celda `disc` con presupuesto del 1,000 % actua como punto de referencia frente a otras reglas del mismo estudio, manteniendo constante la semilla (42) y el porcentaje de compresion.
- Evaluacion del compromiso seguridad/utilidad: cruzar la perplejidad en WikiText-2 (10,2521) con las tasas de ataque y de sobrerrechazo permite trazar curvas de Pareto entre utilidad y alineacion de seguridad.
- Auditoria de sobrerrechazo: el valor de 0,3166 en WildGuard es util para calibrar clasificadores de rechazo y estudiar si la compresion vuelve al modelo mas o menos propenso a rechazar peticiones benignas.
- Red-teaming reproducible: al estar fijados la semilla, el presupuesto y el numero de componentes restaurados, sirve como objetivo estable en pruebas de ataque comparadas entre ejecuciones.
- Docencia e investigacion sobre compresion de LLM: ilustra de forma tangible la diferencia entre eliminar parametros (39,01 %) y restaurar componentes seleccionados (1,000 %), un caso practico para explicar tecnicas de truncamiento de bajo rango.
- Reproduccion de resultados: con la semilla y los conteos publicados, otro grupo puede regenerar la celda y verificar las metricas reportadas antes de sacar conclusiones.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor | Direccion favorable |
|---|---|---|---|
| AdvBench (juez HarmBench) | ASR | 0,1827 | mas bajo mejor |
| StrongREJECT (juez HarmBench) | ASR | 0,2364 | mas bajo mejor |
| WildGuard | Sobrerrechazo macro | 0,3166 | mas bajo mejor |
| WikiText-2 | Perplejidad | 10,2521 | mas bajo mejor |

No se han publicado en la informacion disponible resultados comparativos de MMLU, GSM8K, HumanEval ni de otras tareas de razonamiento, ni los valores correspondientes al modelo base sin comprimir o a otras celdas de la rejilla. La model card indica cualitativamente que la compresion por si sola eleva la tasa de exito de ataque respecto a Mistral-7B-Instruct-v0.2, pero no cuantifica esa diferencia en el material proporcionado.

## Requisitos de hardware

- VRAM para inferencia en fp16/bf16: aproximadamente 14,5 GB solo de pesos, mas cache KV; en la practica se recomiendan 16 GB como minimo y 24 GB para trabajar con comodidad.
- Cache KV: no medida para este checkpoint. Asumiendo la arquitectura estandar de Mistral-7B (32 capas, 8 cabezas KV, dimension de cabeza 128), serian del orden de 128 KB por token en fp16, es decir unos 4,3 GB con los 32.768 tokens de contexto completo; esta cifra es una estimacion, no un dato de la model card.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o cualquier acelerador con 24 GB o mas para fp16.
- GPU de consumo: cabe en RTX 3090 y RTX 4090 (24 GB) en fp16; en tarjetas de 16 GB (RTX 4080, RTX 4070 Ti Super) requeriria cuantizacion a 8 o 4 bits, que no se distribuye con este checkpoint.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`) y vLLM. Para llama.cpp u Ollama habria que convertir los pesos a GGUF por cuenta propia, ya que no se publican.
- Latencia y throughput: no disponibles; no se aportan mediciones en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad (ASR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-mistral_keep60_disc_b010 (este) | 7.241.732.096 (60,99 % del denso) | no disponible (base: 32.768) | AdvBench 0,1827; StrongREJECT 0,2364 | Apache 2.0 | HuggingFace, 0 descargas |
| mistralai/Mistral-7B-Instruct-v0.2 (base) | ~7,24 mm | 32.768 tokens | no disponible en esta informacion; la model card indica que es mejor que las versiones comprimidas | Apache 2.0 | HuggingFace, ampliamente utilizado |
| Otras celdas de la rejilla del mismo estudio | variable segun presupuesto | no disponible | no disponible | Apache 2.0 (previsible) | no disponible en esta informacion |

No se dispone de datos de benchmarks ni de contexto para modelos comparables de la misma categoria (por ejemplo, otros checkpoints comprimidos de 7B) en la informacion proporcionada, por lo que la comparacion cuantitativa con alternativas no esta disponible.

## Limitaciones y advertencias

- No es un asistente desplegable: el propio autor indica que cada celda debe tratarse como sujeto experimental y no como modelo de produccion.
- Seguridad degradada de forma intencionada en varias celdas de la rejilla: la compresion eleva el ASR, y este checkpoint registra 0,1827 en AdvBench y 0,2364 en StrongREJECT.
- Sobrerrechazo elevado: 0,3166 macro en WildGuard, lo que implica que rechazara peticiones legitimas con frecuencia.
- Perdida de calidad respecto al base: perplejidad de 10,2521 en WikiText-2, mas alta que la esperable en el modelo sin comprimir.
- Riesgo de alucinacion: no evaluado en la model card; la compresion de bajo rango puede aumentar la generacion de contenido incorrecto, pero no hay mediciones al respecto.
- Idiomas y contexto no documentados: la model card no declara idiomas soportados y no confirma que se mantenga la ventana de contexto del modelo base.
- Licencia: Apache 2.0 para este derivado. La model card advierte de que el repositorio del modelo base no incluye archivo de licencia para redistribuir, lo que conviene revisar antes de un uso comercial.
- Ausencia de traccion: 0 descargas y 0 likes, creado y actualizado el 14 de septiembre de 2026; no hay validacion externa de las metricas.
- No se publican cuantizaciones, GGUF ni versiones optimizadas, lo que limita su uso en hardware de consumo sin trabajo adicional de conversion.
- Sesgos conocidos: no disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mistral_keep60_disc_b010
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Perfil del autor: https://huggingface.co/Jeesup
- Nota: la busqueda web realizada no devolvio resultados relevantes para este modelo (los enlaces recuperados correspondian a listados de campeones de la Copa Mundial de futbol y no guardan relacion con el artefacto). No se han localizado papers, blogs, repositorios ni demos adicionales del autor en la informacion disponible.
