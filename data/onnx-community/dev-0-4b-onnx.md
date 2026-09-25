# onnx-community/dev-0.4b-ONNX

## Resumen

Dev-0.4b-ONNX es la conversión al formato ONNX del modelo mpnikhil/dev-0.4b, un modelo de decisión bidireccional de 399 millones de parámetros construido sobre ModernBERT-large. No es un modelo generativo: no produce texto token a token, sino que resuelve tareas de clasificación no estructurada a estructurada —enrutamiento de intenciones, verificación booleana y puntuación ordinal— en un único forward pass. La conversión la publica la organización onnx-community, orientada a que el modelo sea ejecutable directamente en el navegador o en el edge mediante Transformers.js.

El modelo aborda una pregunta arquitectónica concreta: si un modelo de decisión debe ser un decodificador causal o un cross-encoder bidireccional nativo. Frente a alternativas como kev-0.5b (base causal Qwen2.5-0.5B congelada más una cabeza LoRA de 9,3 millones de parámetros), Dev usa atención bidireccional sin máscara causal en sus 28 capas, lo que permite que las opciones candidatas se condicionen mutuamente dentro del prompt. Sus resultados declarados son 91,33 % de top-1 en Banking77, 85,20 % en BoolQ y 62,67 % de exactitud en Yelp Reviews.

La relevancia práctica está en su coste de inferencia: 27,6 ms en Apple Silicon MPS (M1 Max) y unos 10 ms en CUDA con FP16 y SDPA, sin bucles de generación. Esto lo sitúa como pieza de enrutamiento o verificación de baja latencia dentro de pipelines mayores, más que como sustituto de un LLM. Las etiquetas de clasificación se definen en lenguaje natural en el propio prompt, por lo que no hace falta reentrenar para cambiar el conjunto de categorías.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo encoder (ModernBERT-large), 28 capas |
| Parametros totales | 399 millones (0,4B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (ventana nativa de 8k) |
| Tipos de cuantizacion | no disponible; el repositorio ocupa 3,2 GB, compatible con un export en precisión completa (fp32), pero no se documentan variantes cuantizadas |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Tarea principal | text-classification (enrutamiento, verificación booleana, puntuación ordinal) |
| Libreria de referencia | transformers.js |
| Modelo base | mpnikhil/dev-0.4b |

## Arquitectura y entrenamiento

Dev parte de ModernBERT-large y sustituye la máscara triangular inferior por atención bidireccional sin restricciones en las 28 capas. Esto tiene una consecuencia funcional directa: cuando las opciones candidatas se escriben en el prompt, la opción 1 puede atender hacia la opción 4, lo que permite condicionamiento mutuo entre candidatos y reduce el sesgo de posición o de recencia típico de los decodificadores causales. El modelo se ejecuta sobre kernels SDPA fusionados en hardware (con `mask=None`) tanto en CUDA como en Apple Silicon MPS.

La segunda innovación es un esquema de tres tareas con una única cabeza dinámica. El autor parte de la premisa de que enrutamiento, verificación y puntuación son en realidad clasificación: categorías sobre N opciones del prompt, sí/no sobre `["No", "Yes"]`, y escala 1-5 sobre `["1 star", ..., "5 stars"]` tomando el valor esperado. Siguiendo el mecanismo de GLiNER, las opciones no están codificadas en los pesos, sino escritas como texto en lenguaje natural y evaluadas al vuelo por una cabeza de elección de 2 capas. Todo el documento y todas las opciones se evalúan en un único forward pass.

En cuanto al entrenamiento, la model card indica que hubo una fase de SFT, aunque no se especifica el número de tokens ni la composición exacta del dataset; las fuentes declaradas son PolyAI/banking77, google/boolq, code_search_net y yelp_review_full. La verificación booleana sale del SFT ya calibrada (ECE 0,016), pero la clasificación multiclase y la puntuación ordinal resultan sobreconfiadas. Como el modelo comparte una única cabeza universal, ajustar bajo pérdida de Brier genera tensión de gradientes entre tareas, de modo que se aplicó escalado de temperatura por lectura (Guo et al., 2017), ajustado post-hoc sobre validación minimizando NLL:

| Lectura | T ajustada | ECE validación | NLL | Exactitud top-1 |
|---|---|---|---|---|
| Noul (booleana) | 1,3575 | 0,016 | 0,17 → 0,15 | 0,967 → 0,967 |
| Choice (categórica) | 4,2542 | 0,189 → 0,083 | 2,26 → 0,73 | 0,782 → 0,782 |
| Score (ordinal) | 3,7097 | 0,332 → 0,117 | 2,59 → 1,14 | 0,545 → 0,545 |

Las temperaturas publicadas generalizan a los benchmarks externos manteniendo la exactitud invariable.

## Capacidades

- Enrutamiento de intenciones multiclase: clasificación sobre un conjunto arbitrario de categorías definidas en el prompt (hasta 77 vías evaluadas en Banking77).
- Verificación booleana: respuestas sí/no sobre un documento y una afirmación, con 85,20 % de exactitud en BoolQ.
- Puntuación ordinal: escalas graduadas (por ejemplo 1-5 estrellas) resolviendo la clase esperada; 62,67 % de exactitud exacta en Yelp Reviews con MAE de 0,4017.
- Etiquetas dinámicas sin reentrenamiento: al estilo GLiNER, las opciones se escriben como texto en el prompt y la cabeza de elección las evalúa en el momento.
- Reordenación (reranking) de recuperación de código: 0,8203 de NDCG@10 en el benchmark de juicio humano de CodeSearchNet frente a 0,7652 de la línea base léxica BM25. El autor lo presenta como comprobación de capacidad, no como benchmark principal.
- Calibración de probabilidades: temperaturas por lectura publicadas, útiles para umbrales y decisiones con confianza cuantificada.
- Inferencia en un único forward pass, sin generación de tokens.
- Capacidades multilingües: no disponibles; el modelo se declara únicamente en inglés.
- Tool calling, function calling y razonamiento multi-paso en agentes: no disponibles (el modelo no genera texto ni sigue cadenas de acciones).
- Visión, audio y modo «thinking»: no disponibles.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica la consulta del usuario en categorías de un centro de ayuda definidas dinámicamente en el prompt, con 91,33 % de top-1 y 98,67 % de top-3 en Banking77. El top-3 permite enviar a revisión humana solo los casos ambiguos.
- Primera fase de un pipeline RAG: clasificar la intención de la consulta antes de invocar al LLM generativo, con unos 10 ms en CUDA FP16, lo que reduce el coste frente a usar el propio LLM para esa decisión.
- Moderation y filtrado de contenido: verificación booleana de afirmaciones o textos contra reglas escritas en el prompt, aprovechando la ECE de 0,016 de la lectura booleana para fijar umbrales fiables.
- Análisis de opiniones con escala graduada: puntuación 1-5 de reseñas o encuestas con MAE de 0,4017, válido para agregados y tendencias aunque menos preciso en la categoría exacta.
- Reranking de resultados de búsqueda de código: reordenar candidatos recuperados por BM25 con NDCG@10 de 0,8203 en CodeSearchNet, como etapa intermedia antes de la presentación al desarrollador.
- Clasificación de intención en el navegador o el edge: al ser un export ONNX listo para Transformers.js, permite ejecutar la tarea en WebGPU o WASM sin enviar el texto del usuario a un servidor.
- Deduplicación y etiquetado de grandes volúmenes de texto: el coste por documento en un único forward pass permite procesar lotes grandes donde un modelo generativo resultaría prohibitivo.
- Verificación de respuestas en sistemas de QA: comprobar si un pasaje respalda una afirmación (equivalente a BoolQ) como control de calidad antes de devolver la respuesta.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (campo `verified: false` en el model-index, sin verificación independiente). La comparación con kev-0.5b procede de la propia model card.

| Benchmark / tarea | Qué mide | Kev-0.5B (Qwen2.5 causal) | Dev-0.4B (ModernBERT bidireccional) |
|---|---|---|---|
| Banking77 | Enrutamiento de intención en 77 vías (top-1) | 86,0 % | 91,33 % |
| Banking77 | Recall top-3 | no disponible | 98,67 % |
| Google BoolQ | Verificación de lectura (exactitud) | 75,3 % | 85,20 % |
| Yelp Review Full | Puntuación 5 estrellas (exactitud exacta) | 55,3 % | 62,67 % |
| Yelp Review Full | MAE | no disponible | 0,4017 |
| CodeSearchNet (test) | NDCG@10 de recuperación de código | 0,7652 (BM25) | 0,8203 |

Latencia declarada: 27,6 ms en Apple Silicon MPS (M1 Max) y aproximadamente 10 ms en CUDA FP16 con SDPA, en un único forward pass. No se han publicado datos de throughput (documentos por segundo) en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,6 GB en fp32, 0,8 GB en fp16 y 0,4 GB en int8. Son estimaciones calculadas a partir de los 399 millones de parámetros, no cifras publicadas por el autor.
- Memoria adicional para activaciones: modesta gracias a las 28 capas y al tamaño del modelo; crece con la longitud de contexto (hasta 8k) y el tamaño de lote.
- GPU recomendadas: cualquier GPU moderna con soporte de SDPA. Se documenta explícitamente ejecución en CUDA con FP16 y en Apple Silicon MPS (M1 Max).
- Cabe en GPU de consumo: sí, con holgura incluso en fp32; también en equipos con GPU integrada y en CPU mediante WASM a través de Transformers.js.
- Opciones de despliegue documentadas: Transformers.js (WebGPU/WASM) y ejecución ONNX en general. El uso de vLLM, TGI o llama.cpp no está documentado para este modelo y, al tratarse de un encoder de clasificación sin generación, no son las rutas habituales.
- Latencia: 27,6 ms en MPS (M1 Max) y ~10 ms en CUDA FP16 SDPA por forward pass. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Enrutamiento Banking77 | Verificación BoolQ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Dev-0.4B (ONNX) | 399 M | ModernBERT-large bidireccional + cabeza de elección | 8k | 91,33 % top-1 / 98,67 % top-3 | 85,20 % | Apache 2.0 | ONNX en HuggingFace, listo para Transformers.js |
| Kev-0.5B | 0,5B (base congelada) + 9,3 M LoRA | Decodificador causal Qwen2.5-0.5B + cabeza puntero | no disponible | 86,0 % | 75,3 % | no disponible | no disponible en esta búsqueda |
| Kev-4B (jaredpalmer/kev-4b) | 4B | familia kev, con export ONNX en onnx-community | no disponible | no disponible | no disponible | no disponible | sí (conversión ONNX con variantes q4f16 y q4) |
| Jev (TypeSafe) | no disponible | modelo de decisión, citado como precedente por el autor | no disponible | no disponible | no disponible | no disponible | no disponible |

Las cifras de Dev y de Kev-0.5B provienen del mismo autor del modelo y no han sido verificadas de forma independiente.

## Limitaciones y advertencias

- Es un clasificador, no un generador: no redacta texto, no mantiene conversaciones y no soporta tool calling ni razonamiento multi-paso.
- Idioma: solo inglés declarado. El rendimiento fuera del inglés no está documentado ni evaluado.
- Resultados sin verificación independiente: todos los benchmarks del model-index tienen `verified: false` y el autor reconoce que la comparación con kev-0.5b la realiza él mismo.
- Riesgo de alucinación conceptual: en verificación booleana solo puede responder sí o no; si el contexto no contiene la respuesta, no existe una salida de abstención documentada, lo que puede forzar respuestas incorrectas con aparente confianza.
- Sobreconfianza residual en clasificación multiclase y ordinal: aunque la calibración reduce la ECE (de 0,189 a 0,083 y de 0,332 a 0,117), siguen siendo valores altos; conviene aplicar umbrales conservadores.
- Sensibilidad a la formulación del prompt: al depender del mecanismo de opciones dinámicas, el texto exacto de las etiquetas puede afectar al resultado, sin que se documenten guías de robustez.
- Idiomas y dominio: los datasets de referencia son bancario, reseñas y búsqueda de código; el comportamiento en otros dominios no está medido.
- Licencia Apache 2.0: permite uso comercial, pero no se documenta ninguna cláusula sobre los datos de entrenamiento ni sobre la procedencia de los mismos; conviene revisar la política interna antes de un despliegue en producción.
- Exportación ONNX realizada de forma automática mediante un Space de la comunidad: no se detalla el proceso de validación numérica frente al modelo original.
- La model card disponible está truncada en la sección de calibración sobre benchmarks externos, por lo que parte de los datos de generalización no pueden citarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/onnx-community/dev-0.4b-ONNX
- Modelo base original: https://huggingface.co/mpnikhil/dev-0.4b
- Space de conversión a ONNX utilizado: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Organización onnx-community: https://huggingface.co/onnx-community
- Documentación del pipeline de clasificación en Transformers.js: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TextClassificationPipeline
- Conversión ONNX relacionada, kev-4b: https://huggingface.co/onnx-community/kev-4b-ONNX
- Proyecto ONNX: https://onnx.ai/
- Repositorio ONNX en GitHub: https://github.com/onnx/onnx
- Referencias arXiv citadas en los tags del repositorio: https://arxiv.org/abs/1706.03762, https://arxiv.org/abs/2412.13663, https://arxiv.org/abs/2311.01079, https://arxiv.org/abs/1706.04599 (Guo et al., 2017, escalado de temperatura, citado explícitamente en la model card)
- Datasets de referencia: https://huggingface.co/datasets/PolyAI/banking77, https://huggingface.co/datasets/google/boolq, https://huggingface.co/datasets/yelp_review_full, https://huggingface.co/datasets/code_search_net
