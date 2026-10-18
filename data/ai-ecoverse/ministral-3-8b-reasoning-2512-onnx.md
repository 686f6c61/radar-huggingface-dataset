# ai-ecoverse/Ministral-3-8B-Reasoning-2512-ONNX

## Resumen

Ministral 3 8B Reasoning 2512 ONNX es la exportación a ONNX del modelo mistralai/Ministral-3-8B-Reasoning-2512 de Mistral AI, publicada por el usuario comunitario ai-ecoverse. No se trata de una versión oficial de Mistral, sino de una conversión de los pesos originales (checkpoint bf16, 34 capas, dimensión oculta 4096) al formato ONNX con cuantización de 4 bits, manteniendo el tokenizador, la plantilla de chat y la configuración de generación del modelo base. El resultado es un paquete image-text-to-text de 8B parámetros en el decodificador más un codificador visual Pixtral de 0,4B, ejecutable en transformers.js, onnxruntime y onnxruntime-genai.

La relevancia de esta ficha está en el formato: reproduce la disposición de ficheros de la exportación oficial de Mistral (decoder_model_merged_&lt;variant&gt;.onnx, embed_tokens_fp16.onnx, vision_encoder_fp16.onnx y ficheros .onnx_data de como máximo 2 GB), de modo que cualquier runtime capaz de cargar la exportación oficial de 3B puede cargar esta de 8B sin cambios de código. Eso incluye inferencia en navegador con WebGPU, algo poco habitual en modelos de 8B con visión.

El modelo está post-entrenado para razonar: la plantilla de chat genera por defecto un bloque [THINK]…[/THINK] antes de la respuesta, con tokens especiales propios para delimitar la traza. La licencia es Apache 2.0 tanto en el modelo base como en la exportación. El repositorio tiene 11,6 GB y, en el momento de la consulta, 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral 3) con codificador visual Pixtral; pipeline image-text-to-text |
| Parametros totales | 8B en el decodificador + 0,4B en el codificador visual |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no la declara; el escalado de queries por posición se activa a partir de 16.384 posiciones) |
| Tipos de cuantizacion | q4f16: pesos 4 bits (bloque 32, simétrico) con activaciones y KV cache fp16 (4,54 GB). q4: pesos 4 bits (bloque 32, simétrico) con activaciones y KV cache fp32 (5,11 GB). Embeddings y encoder visual en fp16 fijo (1,07 GB y 0,86 GB) |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (.onnx + ficheros externos .onnx_data de máximo 2 GB cada uno); inputs_embeds y logits en float32 en todas las variantes |

## Arquitectura y entrenamiento

El decodificador es un transformer de 34 capas con dimensión oculta 4096, exportado con el model builder de onnxruntime-genai (Mistral3TextModel, exclude_embeds=true, int4 con block_size=32 y accuracy_level=4), usando -e webgpu para la variante q4f16 y -e cpu para la variante q4. La firma del grafo expone inputs_embeds, attention_mask y past_key_values.N.{key,value} como entradas, y logits y present.N.{key,value} como salidas. Los embeddings de tokens y el codificador visual se sirven como grafos separados en fp16 (embed_tokens_fp16 y vision_encoder_fp16), referenciados desde transformers.js_config en config.json.

Una innovación técnica relevante del export es la corrección del escalado de queries para contexto largo: Ministral 3 multiplica sus queries por 1 + 0,1 · log(1 + floor(posición / 16384)) (la función get_llama_4_attn_scale de transformers). El model builder de onnxruntime-genai no emite ese nodo, así que el autor lo añadió manualmente al grafo; sin él, la inferencia más allá de 16.384 posiciones se desviaría del comportamiento en PyTorch. Sobre el entrenamiento no hay información en la documentación disponible: no se detallan tokens, composición del dataset ni si hubo RLHF o DPO; la model card remite para ello al modelo base de Mistral.

## Capacidades

- Generación de texto con modo de razonamiento explícito: la plantilla de chat pide por defecto un bloque [THINK]…[/THINK] seguido de la respuesta; ambos son tokens especiales y requieren skip_special_tokens: false para ver el límite de la traza.
- Entrada image-text-to-text: codificador visual Pixtral de 0,4B para describir y razonar sobre imágenes (la prueba de paridad incluye un prompt de descripción de imagen sintética).
- Tool calling / function calling: la model card documenta un caso de tool call meteorológico con paridad de respuesta frente a PyTorch.
- Conversación multi-turno: Mistral recomienda conservar las trazas de razonamiento dentro del contexto en conversaciones de varios turnos.
- Capacidades multilingües declaradas para 11 idiomas (en, fr, es, de, it, pt, nl, zh, ja, ko, ar); no hay datos de calidad por idioma en la información disponible.
- Ejecución en navegador y en dispositivos con WebGPU mediante transformers.js (AutoModelForImageTextToText), y en onnxruntime nativo, onnxruntime-genai o slicc-ortllama.
- Personalización del sistema de razonamiento: un system prompt propio sustituye al por defecto; Mistral recomienda concatenar SYSTEM_PROMPT.txt a los system prompts personalizados.
- Sampling recomendado en generation_config.json: temperature 0,7 y top_p 0,95.
- Sin soporte declarado de audio ni de otras modalidades distintas de texto e imagen.

## Casos de uso

- Razonamiento auditable en producción: el bloque [THINK] separa la traza del resultado, lo que permite registrar y revisar el razonamiento antes de la respuesta final en flujos con requisitos de explicabilidad, manteniendo skip_special_tokens: false en el pipeline de generación.
- Atención al cliente multilingüe: con 11 idiomas declarados y conversación multi-turno, el modelo puede gestionar hilos de soporte conservando las trazas de razonamiento en el contexto; el límite exacto de contexto debe medirse en el despliegue, ya que la model card no lo publica.
- Agentes con tool calling: el modelo emite llamadas a funciones (caso verificado de tool call meteorológico) y puede encadenarse a APIs externas en un bucle de agente; el runtime debe parsear la llamada tras el cierre de [/THINK].
- Análisis de documentos e imágenes en local: el codificador Pixtral permite enviar imágenes junto al prompt y obtener descripciones o respuestas razonadas sin salir del dispositivo, útil en entornos con datos sensibles que no pueden enviarse a una API.
- Demos y productos en navegador: con transformers.js y device: "webgpu" el modelo se ejecuta en el cliente, lo que elimina coste de servidor y mantiene los datos del usuario en el navegador; la variante q4f16 (4,54 GB de decodificador) es la opción por defecto para este escenario.
- Despliegue on-premise en GPU de consumo: al ocupar alrededor de 7 GB en disco entre decodificador, embeddings y encoder visual, cabe en tarjetas de 12 GB y evita depender de infraestructura cloud.
- Validación de pipelines de cuantización: los datos de paridad frente a PyTorch (acuerdo de argmax del 96,3 % y KL media de 0,02 nats) sirven como referencia para verificar exportaciones propias o comparar runtimes ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al modelo base para capacidades y benchmarks, pero no incluye cifras de MMLU, HumanEval, GSM8K ni similares. Lo que sí aporta son métricas de paridad del export cuantizado frente a PyTorch (fp32 en CPU, checkpoint base) con ONNX Runtime en CPU, que miden fidelidad numérica, no calidad del modelo.

Decodificación greedy sobre cinco prompts tokenizados con el tokenizador y la plantilla de este repositorio:

| Prompt | Tokens generados por PyTorch | Coincidencia greedy q4f16 | Coincidencia greedy q4 |
|---|---|---|---|
| Acertijo del bate y la pelota | 1024 | 3 | 3 |
| Tool call meteorológico | 119 | 65; misma respuesta | 15; misma respuesta |
| Respuesta de una palabra con system prompt propio | 3 | idéntica | idéntica |
| Explicación en alemán | 384 | 4 | 4 |
| Descripción de imagen sintética (visión) | 190 | 10 | 10 |

Comparación profesor-forzada, que alimenta los tokens de PyTorch y compara la distribución del siguiente token en cada posición:

| Variante | Acuerdo de argmax | KL media | KL máxima | Máx. \|Δlogit\| | vision_encoder_fp16: máx. \|Δ\| / coseno mínimo |
|---|---|---|---|---|---|
| q4f16 | 96,28 % | 0,02 nats | 1,2 | 9,68 | 0,0071 / 0,999991 |
| q4 | 96,34 % | 0,02 nats | 1,3 | 9,55 | 0,0071 / 0,999991 |

El propio autor advierte de que la decodificación greedy a temperatura 0 es una prueba de estrés: un empate casi perfecto que se invierte cambia toda la secuencia posterior, por lo que la divergencia tras muchos tokens idénticos es esperable con pesos de 4 bits. La columna de profesor-forzado es la que mide la deriva real.

## Requisitos de hardware

- VRAM estimada para q4f16: 4,54 GB de decodificador + 1,07 GB de embeddings + 0,86 GB de encoder visual = 6,47 GB en disco; con overhead de runtime y KV cache, prever del orden de 8 GB de VRAM. Estimación derivada de los tamaños de fichero, no medida por el autor.
- VRAM estimada para q4: 5,11 + 1,07 + 0,86 = 7,04 GB en disco; prever del orden de 8,5-9 GB de VRAM con overhead.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4070 12 GB, RTX 4060 Ti 16 GB y RTX 4080/4090 sin problema; en tarjetas de 8 GB la variante q4f16 queda muy justa y conviene reducir el contexto o la KV cache.
- GPU profesionales: A100, H100 y L40S para servir con concurrencia; no hay datos de throughput publicados.
- Ejecución en CPU: el export se validó con ONNX Runtime en CPU, así que la inferencia solo-CPU es viable aunque lenta; el autor no publica latencias.
- Navegador: la ruta WebGPU necesita del orden de 7-8 GB de VRAM disponible en la GPU del cliente, además de los límites de memoria que imponga el navegador.
- Opciones de despliegue: transformers.js (@huggingface/transformers) con device "webgpu" o WASM, onnxruntime nativo, onnxruntime-genai y slicc-ortllama; no se menciona soporte de vLLM, TGI, llama.cpp ni Ollama en la información disponible.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ai-ecoverse/Ministral-3-8B-Reasoning-2512-ONNX (este) | 8B + 0,4B vision | no disponible | apache-2.0 | ONNX q4/q4f16 | Export comunitario, 0 descargas en el momento de la consulta |
| mistralai/Ministral-3-8B-Reasoning-2512 | 8B + 0,4B vision | no disponible | apache-2.0 | Checkpoint bf16 (PyTorch, revisión 81eaece) | Modelo base oficial de Mistral AI |
| mistralai/Ministral-3-3B-Instruct-2512-ONNX | 3B | no disponible | no disponible | ONNX (misma disposición de ficheros) | Export oficial de Mistral AI, sin modo razonamiento [THINK] descrito |

La comparación con modelos de otros fabricantes del mismo tamaño o tarea no está disponible en la información proporcionada; la búsqueda web no devolvió resultados técnicos relevantes. Frente al 3B oficial, este export ofrece el doble de parámetros y capacidades de razonamiento, pero pierde el soporte oficial de Mistral y la validación asociada a un release de la compañía.

## Limitaciones y advertencias

- No es un release oficial de Mistral AI: el mantenimiento, las erratas de export y el soporte dependen de ai-ecoverse; la model card lo indica de forma explícita.
- Deriva por cuantización: el acuerdo de argmax profesor-forzado es del 96,3 %, con una KL máxima de 1,2-1,3 nats y diferencias de logit de hasta 9,68. En tareas sensibles a tokens exactos (código, JSON, cifras) conviene validar contra el checkpoint bf16.
- El modo razonamiento consume tokens: cada respuesta incluye una traza [THINK] que ocupa contexto y aumenta la latencia; si se recortan las trazas entre turnos se pierde la recomendación de Mistral de conservarlas en el contexto multi-turno.
- Longitud de contexto no documentada: aunque el escalado de queries se aplica a partir de 16.384 posiciones, la model card no declara la ventana máxima soportada ni su comportamiento más allá de ese punto.
- Cobertura multilingüe declarada pero sin evaluación pública por idioma en la información disponible; el rendimiento en es, fr, de, it, pt, nl, zh, ja, ko y ar no está cuantificado.
- Sesgos y riesgo de alucinación: no hay información específica en la documentación proporcionada; son riesgos propios de un modelo de lenguaje de 8B y deben mitigarse con verificación externa y tool calling.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un modelo derivado conviene conservar los avisos de atribución a Mistral AI y revisar los términos del modelo base.
- Dependencia de runtimes concretos: el grafo asume la disposición de ficheros de la exportación oficial de Mistral y una firma de entradas con inputs_embeds y KV cache explícita; herramientas que esperan otro layout (por ejemplo, GGUF para llama.cpp u Ollama) no pueden cargarlo sin conversión adicional.
- Sin métricas de latencia ni throughput publicadas, la planificación de capacidad en producción debe hacerse con mediciones propias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ai-ecoverse/Ministral-3-8B-Reasoning-2512-ONNX
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Reasoning-2512
- Exportación oficial de referencia (3B, misma disposición de ficheros): https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-ONNX
- System prompt recomendado por Mistral: https://huggingface.co/ai-ecoverse/Ministral-3-8B-Reasoning-2512-ONNX/blob/main/SYSTEM_PROMPT.txt
- Runtime slicc-ortllama del autor del export: https://github.com/ai-ecoverse/slicc-ortllama
- Perfil del autor del export: https://github.com/ai-ecoverse
- Mistral AI: https://mistral.ai
- Nota: la búsqueda web realizada no devolvió papers, blogs ni demos relevantes sobre este modelo; los resultados obtenidos fueron páginas genéricas de proveedores sin relación con la ficha.
