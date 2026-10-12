# mrm8488/embeddinggemma-2-ft-typed-decision

## Resumen

EmbeddingGemma 2 · typed decisions es un modelo de decisiones tipadas desarrollado por mrm8488 (Manuel Romero) a partir de google/embeddinggemma-2. Su funcion no es generar texto libre, sino responder a un esquema de preguntas sobre el estado de un flujo de trabajo (una traza de agente, un ticket de soporte, una factura, una alerta de seguridad) devolviendo para cada pregunta una respuesta con tipo, valor, probabilidad calibrada y distribucion completa de opciones. El modelo tiene 272.120.348 parametros (~272 M) y se distribuye en safetensors bajo licencia Apache 2.0.

La innovacion clave es que la cabeza de decision puntua el texto de cada opcion del esquema contra el estado y la pregunta, de modo que el esquema es dato plano: se pueden renombrar opciones, reescribir descripciones o anadir preguntas nuevas sin reentrenar. Soporta tres tipos de pregunta: `choice` (clasificacion sobre un diccionario de opciones), `score` (nivel ordinal con calculo del nivel esperado) y `noul` (si/no probabilistico). Cada respuesta se devuelve como un objeto `TypedAnswer` serializable a JSON.

Es relevante ahora porque cubre un hueco practico en los sistemas de agentes: la necesidad de obtener decisiones estructuradas, auditables y con incertidumbre explicita en lugar de texto parseable a posteriori. El modelo se publico en octubre de 2026 y en el momento de redactar esta ficha no registra descargas ni likes en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de embeddings (EmbeddingGemma 2) con cabeza de decision personalizada (`GemmaDecision`) y codigo propio (`gemma_decision`, requiere `trust_remote_code=True`) |
| Parametros totales | 272.120.348 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No se distribuyen versiones cuantizadas (GGUF, AWQ, GPTQ, etc.). El autor recomienda bfloat16 o float32 y advierte explicitamente de no usar float16 |
| Idiomas soportados | Ingles y multilingue; la cabeza de decision se entreno solo con esquemas en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de google/embeddinggemma-2, un encoder de frases multilingue, y le anade una cabeza de decision (`GemmaDecision`) implementada como codigo personalizado. La cabeza puntua el texto de cada opcion del esquema contra el estado y el enunciado de la pregunta, reutilizando el espacio de embeddings del modelo base. El metodo `encode()` devuelve embeddings de frase normalizados exactamente como se usaron en entrenamiento, mientras que `model(**batch)` devuelve un `GemmaDecisionOutput` con `loss`, `logits`, `probabilities` y `text_embeds`.

El ajuste fino se realizo sobre el dataset LocalLLaMA/typed-decisions (configuracion `all`), y el modelo se puede seguir entrenando con el `Trainer` de HuggingFace usando el metodo `collate()` para convertir filas `{workflow, state, questions, gold}` en lotes de entrenamiento. No se especifican en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos no estan disponibles. La innovacion tecnica destacable es la separacion entre el modelo de embeddings y el esquema de decision: al evaluar opciones como texto, se permite modificar el esquema sin reentrenamiento.

## Capacidades

- Clasificacion de decisiones tipadas sobre un esquema declarativo con tres tipos de pregunta: `choice`, `score` y `noul`.
- Respuestas calibradas: cada `TypedAnswer` incluye `confidence` (probabilidad de la opcion ganadora) y el diccionario completo de `probabilities`.
- Preguntas de tipo `score` con niveles ordinales y calculo del nivel esperado (`expected_level`).
- Serializacion directa a JSON mediante `answer.to_dict()`, apta para integracion en pipelines.
- Esquemas flexibles: las opciones se pueden renombrar, reescribir o ampliar sin reentrenar (con menor fiabilidad fuera de la distribucion de entrenamiento).
- Embeddings de frase normalizados mediante `model.encode(texts)`, reutilizables para recuperacion o similitud semantica.
- Multilingue heredado del modelo base: acepta estados y esquemas en otros idiomas, incluido el castellano.
- Ajuste fino adicional con el `Trainer` de HuggingFace y el dataset LocalLLaMA/typed-decisions.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-step: no es un modelo generativo ni orquestador; su papel es evaluar y etiquetar trazas de agentes.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Observabilidad de agentes autonomos: dada una traza con resumen de pasos, errores de herramienta y violaciones de restricciones, el modelo devuelve `continue / observe / human_review / stop` con probabilidades, lo que permite enrutar trazas a supervision humana solo cuando la confianza lo justifica.
- Triaje de tickets de soporte: con el estado del ticket y un esquema de preguntas, se obtiene la cola de destino, la severidad en escala ordinal y si requiere intervencion humana, todo en una sola llamada y con salida JSON.
- Revision de facturas y documentos financieros: el modelo puede responder a preguntas tipadas sobre el estado del documento (categoria de gasto, necesidad de aprobacion, nivel de anomalia) sin necesidad de un LLM generativo.
- Triaje de alertas de seguridad en un SOC: clasificacion de alertas en niveles de riesgo (`score` 0..3) y decision binaria de escalado, con probabilidades que permiten fijar umbrales operativos.
- Enrutado en pipelines de CI/CD: evaluar el resultado de una ejecucion (tests fallidos, cambios irreversibles, violaciones de politica) y decidir si se despliega, se observa o se bloquea.
- Moderacion de contenido con escala graduada: el tipo `score` permite asignar niveles de gravedad ordenados en lugar de una etiqueta plana, conservando la distribucion de probabilidad.
- Anotacion automatica de datos con etiquetas tipadas: generar etiquetas calibradas sobre grandes volumenes de estados para preetiquetar datasets antes de revision humana.
- Recuperacion semantica y deduplicacion: usando `encode()`, obtener embeddings normalizados para busqueda por similitud sobre trazas, tickets o documentos.
- Integracion en flujos multilingues: acepta estados y esquemas en castellano, util para equipos hispanohablantes que no quieran traducir sus esquemas al ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 272,1 M de parametros, los pesos ocupan aproximadamente 0,54 GB en bfloat16 y 1,09 GB en float32 (calculo derivado del numero de parametros, no un dato publicado). Sumando activaciones y overhead del runtime, se puede esperar un consumo en el entorno de 1,5 a 3 GB en bfloat16.
- GPU recomendadas: el autor indica usar bfloat16, lo que requiere una GPU Ampere o posterior (por ejemplo RTX 30xx/40xx, A100, H100, L4, L40S). En GPUs anteriores hay que recurrir a float32.
- Cabe en GPU de consumo: si, es un modelo pequeno que cabe con holgura en cualquier GPU con 4 GB o mas de VRAM; tambien es viable en CPU para cargas de baja concurrencia.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via soportada explicitamente. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI (no disponible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrm8488/embeddinggemma-2-ft-typed-decision | 272,1 M | no disponible | Decisiones tipadas y calibradas sobre esquema | Apache 2.0 | HuggingFace, codigo personalizado |
| google/embeddinggemma-2 (modelo base) | no disponible | no disponible | Embeddings de frase multilingues | no disponible en la informacion proporcionada | HuggingFace |
| Alternativas de clasificacion estructurada de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con otros modelos, por lo que no es posible establecer una comparativa cuantitativa. La diferencia funcional con el modelo base es que este ultimo solo produce embeddings, mientras que el modelo ajustado anade la cabeza de decision y la API `decide()`.

## Limitaciones y advertencias

- float16 provoca desbordamiento y devuelve NaN sin lanzar error: hay que usar bfloat16 (Ampere o posterior) o float32 obligatoriamente.
- La cabeza de decision se entreno unicamente con esquemas en ingles; en otros idiomas las probabilidades son mas suaves y menos fiables.
- Las respuestas a preguntas alejadas de los datos de entrenamiento son menos fiables, aunque el esquema sea tecnicamente valido.
- El modelo es de codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio del autor.
- Riesgo de alucinacion: la salida es probabilistica y calibrada, pero no hay garantia de que la etiqueta ganadora sea correcta; se recomienda fijar umbrales de confianza y escalado a revision humana.
- Sesgos conocidos: no documentados en la model card; el comportamiento dependera del dataset LocalLLaMA/typed-decisions, cuya composicion no se detalla.
- Longitud de contexto no especificada: los estados muy largos pueden truncarse, pero no se indica el limite exacto.
- Modelo recien publicado y sin traccion: cero descargas y cero likes en HuggingFace en el momento de la ficha, por lo que no existe evidencia de uso en produccion ni validacion independiente.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base google/embeddinggemma-2, no detalladas aqui.
- No se documenta soporte para tool calling, agentes multi-step, vision ni audio; no debe usarse como sustituto de un LLM generativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrm8488/embeddinggemma-2-ft-typed-decision
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Dataset de entrenamiento: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Imagen de portada del repositorio: https://huggingface.co/mrm8488/embeddinggemma-2-ft-typed-decision/resolve/main/eg2td.png

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; las entradas obtenidas no guardan relacion con el contenido de la ficha.
