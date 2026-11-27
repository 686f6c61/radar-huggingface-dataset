# nokeepai/Inkling-2-Mini-Honed-GGUF

## Resumen

Inkling-2-Mini-Honed-GGUF es la distribucion en formato GGUF del modelo multimodal Inkling-2-Mini-Honed, un ajuste fino de Inkling 2 Mini desarrollado por Thinking Machines Lab, Inc. El ajuste, obra del usuario nokeepai, tiene un objetivo muy concreto: corregir el exceso de razonamiento y los bloqueos del modelo base, que en tareas de depuracion de codigo generaba turnos sin codigo y consumia decenas de miles de tokens por tarea. El resultado es un modelo que resuelve las mismas tareas con un orden de magnitud menos de tokens.

El modelo conserva la arquitectura del original (un transformer multimodal con mezcla de expertos, segun se deduce de la referencia a tensores de expertos y a la opcion `--n-cpu-moe` de llama.cpp) y una ventana de contexto de 32.768 tokens segun la configuracion de ejemplo de la model card. Cuenta con 26.070.385.152 parametros totales, lo que lo situa en la categoria de modelos de aproximadamente 26.000 millones de parametros.

La relevancia de esta publicacion es practica: demuestra que el ajuste fino sobre el comportamiento de razonamiento sobrevive a la cuantizacion agresiva. La version Q4_K_M mantiene el 100% de exito en depuracion dificil con solo 2.367 tokens de media por tarea, frente a los 26.939 tokens del modelo original cuantizado con la misma receta. Esta pensado para llama.cpp, LM Studio y Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE); detalles completos no disponibles |
| Parametros totales | 26.070.385.152 |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (configuracion de ejemplo de la model card) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ3_M, IQ2_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (sujeta a la Acceptable Use Policy del modelo base) |
| Formato de pesos | GGUF (con proyector de vision mmproj en BF16 y Q8_0) |

## Arquitectura y entrenamiento

El modelo base es Inkling 2 Mini, de Thinking Machines Lab, Inc. La model card menciona explicitamente tensores de atencion (144) y de expertos (48) entre los 192 tensores mapeados, lo que confirma una arquitectura con capas de atencion y capas de mezcla de expertos. El ajuste Honed modifica unicamente tensores de atencion y de expertos sobre el checkpoint fusionado; el resto de pesos permanece identico al modelo original. El proyector de vision no se ha modificado respecto al original.

El proceso de publicacion es inusualmente riguroso y conviene destacarlo. En lugar de reconvertir el modelo, el script `gguf_v3.py` demuestra primero que el mapeo entre checkpoint y GGUF es exacto byte a byte en los 192 tensores mapeados, y solo entonces parchea el fichero oficial `Inkling-2-Mini-BF16.gguf` de ggml-org. Tras el parcheo se verifica que cada tensor mapeado coincide con el checkpoint fusionado y que todos los demas tensores son identicos al fichero oficial. La cuantizacion se realizo con `llama-quantize` en el commit `19bc41dbb`, usando `imatrix.gguf` de ggml-org y manteniendo en q8_0 los tensores `attn_q`, `attn_k`, `attn_v`, `attn_output` y `attn_gate`. Los ficheros se renombraron despues de las pruebas (antes se llamaban Prime) y se verifico byte a byte que los 704 tensores de cada fichero eran identicos salvo el campo `general.name`.

Los datos de entrenamiento del ajuste fino (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. La model card indica unicamente que se trata de "un pequeno ajuste fino que evita que el modelo piense en exceso y se bloquee".

## Capacidades

- Generacion de texto conversacional y razonamiento con modo de pensamiento (thinking), con un parametro `reasoning_effort` ajustable por peticion.
- Razonamiento multimodal imagen-texto: el pipeline declarado es `image-text-to-text` y se distribuye un proyector de vision (`mmproj`) para llama.cpp.
- Generacion y depuracion de codigo: los benchmarks de la model card miden tareas de depuracion dificil y HumanEval.
- Razonamiento matematico: se evalua con GSM8K.
- Soporte de plantillas de chat Jinja (`--jinja`), lo que habilita el uso de plantillas conversacionales y argumentos de plantilla como `chat_template_kwargs`.
- Control del gasto de tokens: el ajuste reduce drasticamente los turnos sin codigo y el consumo de tokens en tareas de razonamiento.
- No se menciona soporte explicito de tool calling, function calling ni comportamiento agentico multi-paso en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Depuracion de codigo en produccion: el modelo resuelve tareas de depuracion dificil con un 100% de exito en la evaluacion del autor y sin turnos sin codigo, lo que lo hace adecuado para pipelines automaticos de analisis de fallos donde un modelo que se bloquea o divaga rompe el flujo.
- Asistentes de programacion con coste controlado: al reducir el consumo medio a 2.367 tokens por tarea en Q4_K_M frente a 26.939 del original, baja una decima parte el coste por consulta en herramientas de autocompletado y revision de codigo.
- Analisis de capturas de pantalla y diagramas: gracias al proyector de vision puede recibir imagenes junto al texto, util para interpretar errores en capturas, diagramas de arquitectura o interfaces de usuario.
- Razonamiento matematico asistido: con un 98% de acierto en los primeros 100 problemas de GSM8K en Q4_K_M, sirve para tutoria o verificacion de calculos en entornos educativos.
- Despliegue en estaciones de trabajo con GPU de consumo: la cuantizacion IQ2_M y Q4_K_M permite ejecutar el modelo en llama.cpp, LM Studio u Ollama en hardware modesto, con la opcion de mantener parte de los expertos en RAM del sistema mediante `--n-cpu-moe`.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye siete niveles de cuantizacion con el mismo ajuste, lo que permite medir el impacto de la compresion en tareas de razonamiento reales antes de elegir un fichero para produccion.
- Procesamiento por lotes de tareas de razonamiento con contexto largo: la ventana de 32.768 tokens permite incluir fragmentos de codigo o documentacion extensos en una sola peticion.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos con llama.cpp sobre los ficheros cuantizados (una pasada por fichero, mismas 15 tareas de depuracion dificil que la model card principal):

| Fichero | Depuracion dificil resuelta | Turnos sin codigo | Tokens por tarea (media) | GSM8K, primeros 100 | HumanEval, primeros 50 |
|---|---|---|---|---|---|
| Honed Q8_0 | 100,0% | 0,0% | 2.606 | 94,0% | 100,0% |
| Honed Q4_K_M | 100,0% | 0,0% | 2.367 | 98,0% | 98,0% |
| Honed IQ2_M | 100,0% | 5,6% | 3.261 | 95,0% | 100,0% |
| Stock Q4_K_M (misma receta) | 80,0% | 87,9% | 26.939 | 97,0% | 100,0% |

Los ficheros Q6_K, Q5_K_M e IQ3_M no se volvieron a evaluar. Los numeros de la model card principal se midieron con los pesos safetensors.

## Requisitos de hardware

- VRAM estimada: aproximadamente el tamano del fichero GGUF mas unos pocos GB para el contexto, segun la model card. El repositorio completo ocupa 167 GB, pero cada fichero individual es mucho menor; las sumas SHA-256 y los tamanos exactos estan en `SHA256SUMS` y `MANIFEST.tsv`.
- Para ejecucion integra en GPU se necesita VRAM equivalente al fichero mas el contexto. Con Q4_K_M y 32.768 tokens de contexto conviene reservar un margen adicional de varios GB.
- Si el modelo no cabe completo en VRAM, llama.cpp permite mantener parte de los expertos en RAM del sistema con `--n-cpu-moe N`.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible. Por tamano, un modelo de 26.000 millones de parametros en Q4_K_M requiere del orden de 15-16 GB solo para pesos, por lo que encaja en GPUs de 24 GB (RTX 3090, RTX 4090) y en GPUs de centro de datos (A100, H100) con holgura para contexto largo.
- Opciones de despliegue: llama.cpp (con soporte de Inkling 2 que incluya el arreglo de bucle del PR #32704; se uso el commit `19bc41dbb`), LM Studio y Ollama.
- Comando de referencia de la model card: `llama-server -m models/Inkling-2-Mini-Honed-Q4_K_M.gguf --mmproj models/mmproj-Inkling-2-Mini-Q8_0.gguf --jinja -c 32768 -ngl 99 --temp 0.6 --top-p 1.0`, enviando `"chat_template_kwargs": {"reasoning_effort": 0.9}` en cada peticion.
- Ajustes recomendados (los unicos que el autor recomienda): `reasoning_effort` 0.9, `--temp 0.6`, `--top-p 1.0` (el valor por defecto de llama.cpp es 0.95 y hay que fijarlo explicitamente) y pensamiento limitado a 4.096 tokens.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Depuracion dificil | Tokens por tarea | Licencia | Formato |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-Honed Q4_K_M | 26,07 B | 32.768 | 100,0% | 2.367 | Apache 2.0 | GGUF |
| Inkling-2-Mini (stock) Q4_K_M, misma receta | 26,07 B | 32.768 | 80,0% | 26.939 | Apache 2.0 | GGUF |
| Inkling-2-Mini-Honed Q8_0 | 26,07 B | 32.768 | 100,0% | 2.606 | Apache 2.0 | GGUF |
| Inkling-2-Mini-Honed IQ2_M | 26,07 B | 32.768 | 100,0% | 3.261 | Apache 2.0 | GGUF |

No se dispone de datos de otros modelos de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita a las variantes del propio modelo y al original sin ajustar.

## Limitaciones y advertencias

- No es un modelo sin censura: la model card lo indica explicitamente. Esta sujeto a la Acceptable Use Policy de Thinking Machines Lab.
- Los benchmarks publicados son de una sola pasada por fichero sobre conjuntos pequenos (15 tareas de depuracion, primeros 100 de GSM8K, primeros 50 de HumanEval), por lo que la variabilidad estadistica es alta.
- Q6_K, Q5_K_M e IQ3_M no se reevaluaron; su comportamiento solo puede inferirse por interpolacion.
- En IQ2_M aparecen un 5,6% de turnos sin codigo, senal de que la cuantizacion muy agresiva empieza a degradar la correccion del ajuste.
- Requiere una compilacion de llama.cpp con soporte de Inkling 2 que incluya el arreglo de bucle del PR #32704; versiones anteriores pueden fallar.
- Hay que fijar `top_p` explicitamente a 1.0, ya que el valor por defecto de llama.cpp (0.95) no es el recomendado.
- El modelo esta pensado para usar `reasoning_effort` 0.9 y un limite de pensamiento de 4.096 tokens; otros ajustes no estan validados por el autor.
- Riesgo de alucinacion: no se documenta en la informacion disponible, pero es consustancial a los modelos generativos de este tamano.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; no se garantiza un rendimiento uniforme fuera del ingles.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion independiente por parte de la comunidad.
- El autor del ajuste es un usuario individual (nokeepai), no el laboratorio que desarrollo el modelo base; conviene tratar los resultados como una evaluacion de parte interesada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nokeepai/Inkling-2-Mini-Honed-GGUF
- Modelo base del ajuste: https://huggingface.co/nokeepai/Inkling-2-Mini-Honed
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Acceptable Use Policy del modelo base: https://thinkingmachines.ai/model-acceptable-use-policy/
- Sitio del autor del ajuste: https://nokeep.ai/?ref=huggingface
- PR de llama.cpp con el arreglo de bucle: PR #32704 (referenciado en la model card; no se proporciona URL directa)
