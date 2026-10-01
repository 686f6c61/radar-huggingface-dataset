# leonice2/DeepSeek-V4.1-Flash-nohmm

## Resumen

DeepSeek-V4.1-Flash-nohmm no es un modelo completo, sino un reemplazo directo de un unico shard del checkpoint de deepseek-ai/DeepSeek-V4.1-Flash. Lo publica el usuario leonice2 y su unico objetivo es corregir un fallo concreto de degeneracion: el modelo base colapsa ocasionalmente, dentro del bloque `<think>`, en un atractor a nivel de token del tipo `Hmm, hmm — hmm: hmm, hmm…` del que casi nunca sale, tipicamente en sesiones de agente largas. El autor ha ajustado exclusivamente la cabeza LM (`head.weight`), dejando intactos el backbone, las capas draft DSpark/MTP, el tokenizador y la plantilla de chat.

La relevancia practica es inmediata para quien ya sirva V4.1 Flash: el shard tiene el mismo tamano y la misma disposicion de tensores que el original, por lo que se puede servir con vLLM estandar y la receta oficial, sin cambios en el pipeline. Existe una variante conservadora (D) que solo elimina los bucles `hmm` y una variante recomendada (E) que ademas reescribe la mayoria de aperturas `Let me …` como `I'll …`, reduciendo palabras de relleno.

Los datos publicos del repositorio son escasos: 0 descargas, 1 like, repo de 2,9 GB y licencia MIT. No hay informacion sobre el tamano total del modelo base, su arquitectura exacta, sus idiomas soportados ni sus benchmarks oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor menciona backbone, capas draft DSpark/MTP y cabeza LM; no se detalla el tipo de transformer) |
| Parametros totales | no disponible (corresponde al modelo base DeepSeek-V4.1-Flash) |
| Parametros activos | no disponible (no se indica si el modelo base es MoE) |
| Longitud de contexto | no disponible (las evaluaciones del autor usan contextos de ~141K y 290K tokens) |
| Tipos de cuantizacion | no disponible (los pesos del shard estan en bfloat16; los factores low-rank, en FP32) |
| Idiomas soportados | no disponible |
| Licencia | MIT (la del repositorio; la del modelo base no se indica) |
| Formato de pesos | safetensors (shard bf16 y factores low-rank FP32) |
| Dimension de la cabeza LM | `head.weight` de 129280 × 5120 (derivado de las formas de `u` y `v`) |
| Rango de la factorizacion low-rank | 256 |
| Tamano del repositorio | 2,9 GB (shard recomendado de 1,3 GB + factores de 138 MB + variante D) |
| Shard reemplazado | `model-00043-of-00048.safetensors` (checkpoint de 48 shards) |
| Revision del modelo base | `dba1be0a40aa45a94ad051997016db3960a90277` |

## Arquitectura y entrenamiento

El metodo es un ajuste fino quirurgico de la cabeza de salida. El shard publicado equivale al shard oficial con `head.weight = bf16(fp32(W0) + u @ v)` y `norm.weight` sin cambios, donde `u` es de 129280 × 256 y `v` de 256 × 5120. Todo el resto del checkpoint (backbone, capas draft DSpark/MTP, tokenizador y plantilla de chat) es identico al original. Al conservar tamano y layout, las comprobaciones de integridad del checkpoint siguen pasando y el modelo se sirve con la receta oficial de vLLM.

Los datos de entrenamiento fueron generados por el propio modelo, sin datos de usuario ni privados: 700 trayectorias de exploracion de codigo multiturno sobre 12 paquetes Python de codigo abierto (vllm, transformers, fastapi, pydantic, entre otros) con herramientas de solo lectura, tareas de programacion con autoverificacion y revision de codigo en contexto largo. En el pensamiento se eliminaron las interjecciones `hmm` y, solo para la variante E, se reescribio `Let me X` como `I'll X`. Se anadieron 238 secuencias adicionales con un tramo `hmm` sintetico insertado en el pensamiento, usando la continuacion limpia como objetivo. En total: 938 secuencias, 15,6M de tokens, de los cuales 3,9M son supervisados. El backbone permanecio congelado.

## Capacidades

- Recuperacion de bucles degenerados de `hmm` en el bloque de pensamiento: 29/30 y 30/30 en prompt corto, y 15/15 con un contexto de ~141K tokens.
- Ejecucion de tareas de agente multiturno con herramientas de solo lectura (`grep`, `read_file`) sobre repositorios Python reales: 242 de 300 tareas completadas en la variante E.
- Reduccion de llamadas a herramientas por tarea: mediana de 14 frente a 19 del modelo original en las 146 tareas que los tres modelos completaron.
- Generacion de codigo con autoverificacion: la cache LRU generada pasa su propia suite de pytest (6/8 en E, 8/8 en D, 4/8 en el original).
- Copia exacta de informacion enterrada en contexto muy largo: 12/12 codigos recuperados en un contexto de 290K tokens.
- Llamada a herramienta mas continuacion de la respuesta: 4/4.
- Razonamiento extenso con modo de pensamiento explicito (`<think>`), con menos palabras de relleno: 1,05 por 1000 palabras frente a 3,71 del original.
- No se dispone de informacion sobre capacidades multilingues, vision, audio ni soporte de function calling mas alla de las herramientas usadas en la evaluacion.

## Casos de uso

- Servicio de agentes de codigo en produccion: sustituyendo el shard se eliminan los bloqueos por bucles `hmm` que obligan a reiniciar la sesion, con un 81% de tareas completadas frente al 58% del modelo original sobre el mismo conjunto de 300 preguntas.
- Sesiones de agente de contexto largo: las pruebas con ~141K tokens muestran recuperacion total (15/15), lo que lo hace adecuado para exploracion de repositorios grandes donde el modelo original apenas se recuperaba (2/15).
- Revision de codigo con citas verificables: el 98,8% de las citas `file:line` estan respaldadas por un resultado real de herramienta, lo que permite usarlo en flujos de auditoria donde cada afirmacion debe ser trazable.
- Recuperacion de informacion en contextos muy extensos: copia exacta de 12 codigos ocultos en 290K tokens, util para extraer identificadores, hashes o fragmentos concretos de documentacion masiva.
- Generacion de utilidades de sistema con autoverificacion: la cache LRU generada pasa su propio pytest, un patron aplicable a la generacion de estructuras de datos y utilidades con tests incluidos.
- Despliegue sobre infraestructura existente de V4.1 Flash: al ser un reemplazo de un solo shard con la misma receta de vLLM, se puede integrar en un servicio ya en produccion sin reescribir el pipeline de inferencia.
- Reduccion de coste por tarea en pipelines agente: la mediana de 14 llamadas a herramientas frente a 19 del original implica menos idas y vueltas al modelo en cada tarea completada.
- Normalizacion del estilo de razonamiento: la eliminacion de aperturas `Let me` (de 297 a 63 por 1000 frases) y de palabras de relleno resulta util cuando el pensamiento del modelo se muestra al usuario o se registra en logs.

## Benchmarks y rendimiento

Resultados publicados por el autor. Suite identica para los tres modelos: vLLM nightly, 8×H200, `temperature 1.0`, `top_p 0.95`, sin penalizacion por repeticion.

| Prueba | Original | D (solo hmm) | E (hmm + Let me → I'll) |
|---|---|---|---|
| Recuperacion de bucle hmm sembrado, prompt corto, T=1,0 / p=0,95 | 0/30 | 30/30 | 29/30 |
| Recuperacion de bucle hmm sembrado, prompt corto, T=0,8 / p=0,9 | 0/30 | 30/30 | 30/30 |
| Recuperacion de bucle hmm sembrado, contexto de ~141K tokens | 2/15 | 15/15 | 15/15 |
| 300 tareas de agente multiturno de exploracion de codigo completadas | 175 (58%) | 201 (67%) | 242 (81%) |
| Turnos de mas de 6000 tokens / sin terminar tras 14 rondas | 16 / 109 | 10 / 89 | 14 / 44 |
| Mediana de llamadas a herramientas en las 146 tareas que completaron los tres | 19 | 18 | 14 |
| Citas `file:line` respaldadas por un resultado real de herramienta | 98,4% | 98,6% | 98,8% |
| Frases de pensamiento que empiezan por `Hmm` (por 1000) | 26,0 | 2,4 | 4,9 |
| Frases de pensamiento que empiezan por `Let` (por 1000) | 297 | 320 | 63 |
| Palabras de relleno en el pensamiento en tareas normales (por 1000 palabras) | 3,71 | 3,46 | 1,05 |
| Cache LRU generada que pasa su propia suite de pytest | 4/8 | 8/8 | 6/8 |
| Copia exacta de 12 codigos ocultos en un contexto de 290K tokens | 12/12 | 12/12 | 12/12 |
| Llamada a herramienta + continuacion | 4/4 | 4/4 | 4/4 |
| Decodificacion de un solo flujo (tok/s): codigo / con pensamiento / ensayo | ~500 / ~415 / 224 | ~509 / ~446 / 233 | ~513 / ~393 / 218 |

No hay benchmarks externos (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible, ni verificacion independiente de estas cifras. El propio autor advierte que las filas de pytest y de velocidad usan solo 8 y 1-2 ejecuciones, por lo que las diferencias quedan dentro del ruido.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio solo contiene pesos de la cabeza LM y no permite estimar el consumo del modelo completo.
- Evaluacion declarada: 8×H200 con vLLM nightly, `temperature 1.0`, `top_p 0.95`, sin penalizacion por repeticion.
- GPU consumer: no disponible; no se indica si el modelo base cabe en una GPU de consumo.
- Almacenamiento: el repositorio de la cabeza ocupa 2,9 GB; el shard recomendado, 1,3 GB (o 138 MB si se descargan solo los factores low-rank). Hay que sumar el checkpoint completo del modelo base, de 48 shards, cuyo tamano no se especifica.
- Despliegue: vLLM con la receta oficial del modelo base. El shard tiene el mismo tamano y layout que el original, de modo que las comprobaciones de tamano del checkpoint siguen pasando.
- Throughput en decodificacion de un solo flujo: ~513 tok/s en codigo, ~393 tok/s con pensamiento y ~218 tok/s en ensayo, medidos en la configuracion de 8×H200.
- Latencia: no disponible.
- Requisito operativo: hay que fijar la revision `dba1be0a40aa45a94ad051997016db3960a90277` del modelo base. Volver a descargar el paso 1 restaura el shard oficial, por lo que el paso 2 debe repetirse.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos externos comparables. La comparacion relevante es interna, entre el modelo base y las dos variantes publicadas.

| Version | Que modifica | Tareas de agente completadas | Bucles hmm recuperados (prompt corto) | Aperturas `Let me` (por 1000) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash (original) | nada (referencia) | 175/300 (58%) | 0/30 | 297 | no disponible | HuggingFace, revision `dba1be0a` |
| Variante D (`head-d/`) | solo elimina `hmm` | 201/300 (67%) | 30/30 | 320 | MIT | repositorio leonice2 |
| Variante E (recomendada) | elimina `hmm` y reescribe `Let me` como `I'll` | 242/300 (81%) | 29/30 | 63 | MIT | repositorio leonice2 |

El SHA-256 del shard recomendado es `c228569637336676d44c77edbf00eeb9454bcfeffe1d040dc633cf99975cc3b5`; el de la variante D es `02c3464f1f7d255bad2b49d6bd6ac685ca6c63fb8494dc74e183864ce30a3016`.

## Limitaciones y advertencias

- Solo se ajusto la cabeza LM. Cualquier comportamiento del backbone, incluidos sesgos, alucinaciones y limitaciones de idioma, es el del modelo base y no se ha modificado.
- El entrenamiento es de alcance estrecho: 938 secuencias y 15,6M de tokens, con datos generados por el propio modelo sobre 12 paquetes Python. La generalizacion fuera de ese dominio (otros lenguajes, otros idiomas, otras herramientas) no esta demostrada.
- El shard debe aplicarse sobre una revision concreta del modelo base (`dba1be0a40aa45a94ad051997016db3960a90277`). Descargar otra revision o volver a bajar el checkpoint puede dejar el ajuste inactivo o inconsistente.
- Al sustituir un fichero del checkpoint oficial, el modelo deja de ser verificable contra la publicacion original de DeepSeek. Conviene comprobar el SHA-256 antes de desplegar.
- El autor advierte que parte de los resultados (pytest y velocidad) proceden de muy pocas ejecuciones y estan dentro del ruido; no deben usarse para decisiones de capacidad.
- Persiste un ~1,2% de citas `file:line` no respaldadas por un resultado real de herramienta en la variante E, por lo que sigue siendo necesario validar las referencias en flujos criticos.
- La reescritura de `Let me X` por `I'll X` cambia el estilo del razonamiento; si el pensamiento se expone al usuario o se usa para entrenar otros modelos, conviene tenerlo en cuenta.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: sin adopcion ni validacion por parte de terceros.
- Licencia MIT para el repositorio de la cabeza LM; la licencia del modelo base no se indica en la informacion disponible, por lo que las condiciones de uso comercial del conjunto dependen de esa licencia no verificada.
- Las busquedas web realizadas no devolvieron informacion relacionada con el modelo: los resultados obtenidos tratan sobre la planta Artemisia vulgaris (Beifuss) y no aportan datos tecnicos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/leonice2/DeepSeek-V4.1-Flash-nohmm
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Revision del modelo base usada para el ajuste: `dba1be0a40aa45a94ad051997016db3960a90277`
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada.
- Resultados de busqueda web: no relevantes (contenido sobre Artemisia vulgaris, sin relacion con el modelo).
