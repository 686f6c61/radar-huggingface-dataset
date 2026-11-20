# hweller1/wayfinder-qwen-35b-a3b

## Resumen

wayfinder-qwen-35b-a3b es un modelo derivado de Qwen/Qwen3.6-35B-A3B, desarrollado por el usuario hweller1, especializado en busqueda de codigo como subagente dentro de pipelines agenticos. El modelo parte de la arquitectura Mixture of Experts (MoE) del base, con 35.951.822.704 parametros totales y aproximadamente 3B parametros activos por token, y se ha post-entrenado mediante LoRA supervisado (SFT) fusionado directamente en los pesos base. El resultado es un modelo que, dado un brief en lenguaje natural sobre un repositorio de codigo, planifica, ejecuta busquedas con herramientas (`grep`, `glob`, `read_file`, `semantic_search`) y devuelve una lista rankeada de rangos `path:start-end` con una razon por entrada, un resumen y los huecos que no pudo resolver.

El problema que resuelve es concreto: evitar que un agente de codificacion padre tenga que explorar el repositorio por si mismo, delegando la busqueda en un subagente mas barato y rapido. Segun la model card, el modelo fue elegido frente a wayfinder-glimmer-30b (dense) por economia de servicio: una busqueda tarda entre 19,7 s y 43,5 s en una H100 frente a 175,4 s del dense, con un coste GPU por rollout de 0,0150 USD frente a 0,0294 USD. El entrenamiento costo 88 minutos y unos 28 USD.

La relevancia actual radica en su enfoque de "searcher como subagente": el modelo no pretende sustituir al agente principal, sino alimentarlo con archivos relevantes. En la model card se reporta que, con la cascada completa (modelo + busqueda hibrida + rerank), el recall@12 sobre 200 tareas held-out alcanza 0,531, frente a 0,414 del modelo solo y 0,313 de Agents-A1-35B, un baseline agentico del mismo tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, base Qwen3.6-35B-A3B |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3B por token (segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0-and-muse-model-license (otra) |
| Formato de pesos | safetensors (bf16, 26 shards) |
| Tamano del repo | 71,9 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Modalidad | image-text-to-text (segun tags) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE de Qwen3.6-35B-A3B: 35B parametros totales con aproximadamente 3B activos por token, lo que reduce el coste computacional por inferencia frente a un dense equivalente. Sobre esta base se aplico un post-entrenamiento mediante LoRA supervisado (SFT), posteriormente fusionado en los pesos base. El config, tokenizer y chat template de Qwen3.6-35B-A3B se mantienen sin cambios, lo que facilita el reemplazo directo en pipelines existentes.

El entrenamiento se realizo con un dataset propio de 1.383 ejemplos, de los cuales se publican 1.372 en un dataset separado con acceso restringido (aprobacion manual): `hweller1/wayfinder-training-data`. Se eliminaron 11 ejemplos antes de la release (8 de un repositorio AGPL-3.0 y 3 generados mediante un host de terceros). El entrenamiento duro 88 minutos con un coste estimado de 28 USD, segun la model card. No se especifica en la informacion disponible el numero de tokens de entrenamiento ni la composicion detallada del dataset. El modelo esta disenado para un bucle agentico con herramientas de busqueda (`grep`, `glob`, `read_file`, `semantic_search` sobre un indice vectorial voyage-code-4) y para emitir un `report` final con la lista rankeada.

## Capacidades

- Busqueda de codigo agentica: planifica y ejecuta busquedas multi-paso en repositorios desconocidos usando `grep`, `glob` y `read_file`.
- Busqueda semantica opcional: puede invocar `semantic_search` sobre un indice vectorial voyage-code-4.
- Tool calling / function calling: el modelo esta entrenado para emitir llamadas a herramientas y consumir sus resultados en el bucle de exploracion.
- Razonamiento multi-paso: encadena turnos de exploracion (media de 9,5 turnos por tarea segun la model card) hasta producir un informe.
- Generacion de informes estructurados: devuelve una lista rankeada de rangos `path:start-end` con una razon de una linea por entrada, un resumen y los gaps no resueltos.
- Capacidad de subagente: pensado para ser invocado por un agente padre que lee el informe en lugar de buscar por si mismo.
- Multilingue: solo ingles declarado en la model card.
- Modalidad image-text-to-text: aparece en los tags del repo, aunque no se detalla su uso en la model card.

## Casos de uso

- Delegacion de busqueda en agentes de codigo: un agente principal (por ejemplo, dentro de Muse Code) entrega un brief al modelo, que explora el repositorio y devuelve los archivos relevantes. Segun la model card, esto redujo el coste por tarea de 0,342 a 0,195 USD y los tokens leidos por el agente principal de 887K a 441K.
- Localizacion de codigo para tareas de mantenimiento: dado un brief como "donde decide el router que una peticion coincide con una ruta con variables de path", el modelo devuelve los rangos `path:start-end` relevantes, lo que acelera la orientacion en repositorios desconocidos.
- Preprocesado para pipelines de CI/CD: integrar el modelo como paso previo que selecciona los archivos que un coder o un revisor debe abrir, reduciendo el contexto necesario en etapas posteriores.
- Investigacion en repositorios grandes: usar el modelo como searcher sobre 47 repositorios no vistos en entrenamiento (segun la evaluacion held-out) para tareas de exploracion y auditoria.
- Cascadas de recuperacion de codigo: combinar la lista del modelo con busqueda hibrida (voyage-code-4 + BM25) y rerank (Voyage rerank-3) mediante reciprocal rank fusion; la model card reporta que la cascada eleva el recall@12 de 0,414 a 0,531.
- Evaluacion de agentes de codigo: usar el modelo como searcher controlado en estudios que miden la tasa de exito de un coder al que se le entregan los archivos encontrados (0,824 con cascada frente a 0,074 sin busqueda, en 34 tareas).
- Reduccion de coste en orquestacion multi-agente: sustituir busquedas realizadas por el agente principal por llamadas a este subagente, con un coste medido de 0,015 USD por busqueda en GPU (frente a 0,045 USD de equivalente a precio abierto).

## Benchmarks y rendimiento

Resultados reportados en la model card sobre 200 tareas held-out (47 repositorios no vistos en entrenamiento, 2 semillas por tarea, unidad = tarea):

| Paso | Recall@12 |
|---|---|
| 1. Lista propia del modelo | 0,414 |
| 2. Tras merge hibrido (voyage-code-4 + BM25) | 0,493 |
| 3. Tras rerank (Voyage rerank-3) | 0,531 |

Recall@5 pasa de 0,336 a 0,345 (no significativo); precision@12 cae de 0,416 a 0,303. La cascada anade unos 0,4 s por busqueda.

Comparativa con baseline agentico del mismo tamano (mismas 200 tareas, brazo grep, mismo bucle, prompt y limite de 40 turnos, 2 semillas):

| Searcher | Recall reportado | Recall@5 | Turnos por tarea | Coste por busqueda |
|---|---|---|---|---|
| wayfinder-qwen, lista propia | 0,415 [0,377; 0,452] | 0,335 | 9,5 | 0,045 USD (equivalente a precio abierto); 0,015 USD coste GPU medido |
| Agents-A1-35B | 0,313 [0,280; 0,348] | 0,247 | 34,1 | 0,113 USD (equivalente a precio abierto) |

Diferencia pareada por tarea: +0,102 [+0,078; +0,127] a favor de wayfinder-qwen.

Tasa de exito de codificacion (34 tareas de 8 repositorios, 2 semillas, coder sin herramientas de busqueda que solo abre los archivos entregados):

| Condicion | Pass rate |
|---|---|
| Sin busqueda | 0,074 |
| Con wayfinder-qwen + cascada | 0,824 [0,71; 0,93] |
| Con los archivos correctos entregados | 0,971 |

En una ejecucion anterior sin cascada, otros tres searchers (Sonnet 5.5 high, GPT-6.1 Sol y Agents-A1-35B) obtuvieron entre 0,85 y 0,87; la model card indica que las diferencias entre searchers no estan resueltas con 34 tareas y que 16 de ellas provienen de un unico repositorio.

Dentro de Muse Code (26 tareas de 18 repositorios, una ejecucion por tarea, agente principal muse-spark-1.3-contributor): el coste por tarea baja de 0,342 a 0,195 USD y los tokens leidos por el agente principal de 887K a 441K; recall@12 pasa de 0,590 a 0,536 (diferencia -0,053 [-0,127; +0,015]), recall@5 es menor y la busqueda mediana es unos 25 s mas lenta. La model card afirma que la mejora es de coste y tokens, no de precision.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Los pesos publicados son bf16 (26 shards, repo de 71,9 GB), por lo que la inferencia en bf16 requiere del orden de 72 GB de VRAM para los pesos, mas overhead de activaciones y KV cache.
- GPU recomendadas: la model card reporta mediciones en una H100 (busquedas de 19,7 a 43,5 s). No se detallan otras GPU.
- GPU de consumo: no disponible. Con 35B parametros totales en bf16 no cabe en GPU de consumo; no se documentan cuantizaciones GGUF ni versiones cuantizadas en la informacion disponible.
- Opciones de despliegue: libreria transformers (declarada en el repo). No se documentan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: 19,7 s a 43,5 s por busqueda en una H100 (frente a 175,4 s del dense wayfinder-glimmer-30b). La cascada completa anade unos 0,4 s por busqueda. Coste GPU medido de 0,015 USD por rollout.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Recall@12 (held-out) | Turnos/tarea | Coste por busqueda | Licencia |
|---|---|---|---|---|---|---|
| wayfinder-qwen-35b-a3b | 35B totales, ~3B activos | MoE | 0,414 (propia); 0,531 (cascada) | 9,5 | 0,015 USD GPU medido; 0,045 USD equiv. abierto | apache-2.0 + muse-model-license |
| wayfinder-glimmer-30b | 30B | Dense | 0,452 (propia) | no disponible | 0,0294 USD GPU | no disponible en esta ficha |
| Agents-A1-35B | 35B | no disponible | 0,313 | 34,1 | 0,113 USD equiv. abierto | no disponible en esta ficha |
| Qwen3.6-35B-A3B (base) | 35B totales, ~3B activos | MoE | no disponible | no disponible | no disponible | no disponible en esta ficha |

La model card indica que wayfinder-glimmer-30b tiene mayor recall en lista propia (0,452 frente a 0,415), pero wayfinder-qwen fue elegido por economia de servicio (latencia y coste GPU) y por la cascada, que solo se midio en qwen.

## Limitaciones y advertencias

- El modelo esta especializado en busqueda de codigo como subagente; no es un modelo generalista de proposito multiple.
- Solo declara soporte de ingles; el rendimiento en otros idiomas no esta documentado.
- La licencia es compuesta: apache-2.0-and-muse-model-license, con un fichero LICENSE-MUSE-SPARK-OPEN.md adicional. Es necesario revisar las condiciones de la licencia Muse antes de uso comercial.
- Los resultados de la cascada (recall@12 0,531) dependen de componentes externos: indice vectorial voyage-code-4 y Voyage rerank-3. Los pesos solos dan 0,414.
- La mejora en recall@5 no es significativa (0,336 a 0,345) y precision@12 cae de 0,416 a 0,303; la lista se alarga a costa de precision.
- En la evaluacion de Muse Code, recall@5 es menor y la busqueda mediana es unos 25 s mas lenta; la mejora es de coste y tokens, no de precision.
- La comparativa de pass rate entre searchers (34 tareas, 16 de un solo repositorio) no permite conclusiones firmes segun la propia model card.
- El dataset de entrenamiento es de acceso restringido (aprobacion manual); no se publican trayectorias ni texto de tareas en el repo de pesos.
- No se documentan cuantizaciones, contexto maximo ni opciones de despliegue en la informacion disponible.
- Riesgo de alucinacion en la generacion de rangos `path:start-end` y razones: no se reportan metricas de fidelidad de las razones ni de validez de los rangos.
- El repo tiene 1.436 descargas y 1 like en el momento de la consulta; es un modelo reciente (creado el 2026-11-03) con poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hweller1/wayfinder-qwen-35b-a3b
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Modelo comparado wayfinder-glimmer-30b: https://huggingface.co/hweller1/wayfinder-glimmer-30b
- Seccion de comparativa en la model card de glimmer: https://huggingface.co/hweller1/wayfinder-glimmer-30b#why-the-final-results-use-wayfinder-qwen-instead-of-this-model
- Dataset de entrenamiento (acceso restringido): https://huggingface.co/datasets/hweller1/wayfinder-training-data
- Licencia Muse Spark Open: https://huggingface.co/hweller1/wayfinder-qwen-35b-a3b/blob/main/LICENSE-MUSE-SPARK-OPEN.md
