# ai-ecoverse/Ministral-3-14B-Reasoning-2512-ONNX

## Resumen

Ministral 3 14B Reasoning 2512 ONNX es la exportación a ONNX del modelo `mistralai/Ministral-3-14B-Reasoning-2512` de Mistral AI, realizada por ai-ecoverse. Se trata de un modelo denso de 14 000 millones de parámetros (40 capas, dimensión oculta 5120) con un encoder de visión Pixtral de 0,4B, orientado a razonamiento explícito: la plantilla de chat genera por defecto un bloque `[THINK]…[/THINK]` antes de la respuesta final. La exportación mantiene el tokenizador, la plantilla de chat y la configuración de generación originales.

Su relevancia es práctica: reproduce el diseño de ficheros de la exportación oficial `mistralai/Ministral-3-3B-Instruct-2512-ONNX` (`decoder_model_merged_<variante>.onnx`, `embed_tokens_fp16.onnx` y `vision_encoder_fp16.onnx`, con pesos troceados en ficheros `.onnx_data` de 2 GB como máximo), de modo que cualquier runtime capaz de cargar el 3B oficial puede cargar este 14B sin cambios de código. Eso incluye transformers.js, onnxruntime-genai y el cargador propio del autor, slicc-ortllama.

El repositorio ocupa 17,7 GB e incluye dos variantes de decodificador cuantizadas en int4 (q4f16 y q4), además de embeddings y encoder visual compartidos en fp16. No es un lanzamiento oficial de Mistral AI y no publica benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; sí incluye mediciones de paridad frente a PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral 3) con encoder de visión Pixtral; exportado a ONNX |
| Parametros totales | 14B en el decodificador + 0,4B en el encoder de visión Pixtral |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (la escala de queries usa `floor(position / 16384)`, lo que indica soporte de contexto largo, pero sin cifra publicada) |
| Tipos de cuantizacion | Pesos int4 simétricos con bloque de 32; activaciones y KV cache en fp16 (q4f16) o fp32 (q4); embeddings y encoder de visión en fp16 |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`.onnx` + `.onnx_data`, fragmentos de 2 GB máximo) |
| Capas / dimension oculta | 40 capas / 5120 |
| Variantes incluidas | `q4f16` (decodificador 7,29 GB, por defecto) y `q4` (decodificador 8,16 GB) |
| Componentes compartidos | `embed_tokens_fp16` (1,34 GB) y `vision_encoder_fp16` (0,88 GB) |
| Checkpoint base | `51f9210f3cd20f3452a80d5819d15dc61cc50630` (bf16) |

## Arquitectura y entrenamiento

La arquitectura es la del Ministral 3 14B Reasoning de Mistral: un transformer decoder-only denso de 40 capas y dimensión oculta 5120, acompañado de un encoder de visión Pixtral de 0,4B que inyecta tokens visuales en el contexto del decodificador. El pipeline declarado es `image-text-to-text`, de modo que el mismo modelo procesa prompts de texto e imagen. El checkpoint base está en bf16; la exportación no reentrena ni modifica pesos, solo los cuantiza y los convierte a ONNX.

La construcción se hizo con el model builder de onnxruntime-genai (`Mistral3TextModel`, `exclude_embeds=true`, int4 con `block_size=32` y `accuracy_level=4`), usando `-e webgpu` para q4f16 y `-e cpu` para q4. Las entradas del decodificador son `inputs_embeds`, `attention_mask` y `past_key_values.N.{key,value}`, y las salidas `logits` y `present.N.{key,value}`; `inputs_embeds` y `logits` se mantienen en float32 en todas las variantes, igual que en el decodificador q4f16 oficial de Mistral. Un detalle técnico relevante del modelo base es el escalado de queries para contexto largo: las queries se multiplican por `1 + 0,1 · log(1 + floor(position / 16384))`, implementado en transformers como `get_llama_4_attn_scale`.

El modelo base incorpora post-entrenamiento de razonamiento: la plantilla de chat pide por defecto un bloque `[THINK]…[/THINK]` seguido de la respuesta, y `[THINK]` y `[/THINK]` son tokens especiales. La configuración de generación incluida fija `temperature` 1 y `top_p` 0,95, los valores recomendados por Mistral. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; la model card remite a la del modelo base para esos datos.

## Capacidades

- Generación de texto con razonamiento explícito: produce una traza `[THINK]…[/THINK]` antes de la respuesta, visible si se usa `skip_special_tokens: false`.
- Razonamiento multi-paso y resolución de problemas: la propia model card cita un test de paridad con un problema de bate y pelota, resuelto con 1024 tokens de decodificación en PyTorch.
- Tool calling / function calling: el conjunto de pruebas de paridad incluye una llamada de herramienta meteorológica, y el modelo produce la misma llamada que PyTorch en la variante q4.
- Comprensión de imágenes: encoder Pixtral de 0,4B con soporte de `{ type: "image" }` en el contenido del mensaje; en la prueba de paridad se usa para describir una imagen sintética.
- Multilingüismo declarado en 11 idiomas: inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe. La prueba de paridad incluye una explicación en alemán de 335 tokens.
- Plantilla de chat y prompt de sistema propio: una petición con system prompt propio sustituye el prompt por defecto; Mistral recomienda añadir `SYSTEM_PROMPT.txt` a los system prompts personalizados.
- Conversación multi-turno conservando las trazas de razonamiento en el contexto, según la recomendación del autor.
- Integración en runtimes ONNX: transformers.js (WebGPU/WASM), onnxruntime-genai, onnxruntime plano y slicc-ortllama.

## Casos de uso

- Razonamiento asistido en el navegador: con la variante q4f16 (7,29 GB de decodificador) y WebGPU, el modelo puede ejecutarse en transformers.js dentro de una aplicación web para tareas de análisis y resolución de problemas sin enviar datos a un servidor.
- Asistente multimodal de documentación técnica: el encoder Pixtral permite adjuntar capturas de diagramas, esquemas o tablas y pedir explicaciones o extracción de datos junto a texto de referencia.
- Automatización de soporte multi-turno: al conservar las trazas `[THINK]` en el contexto, el modelo mantiene coherencia en conversaciones largas con varios pasos de razonamiento encadenados, útil en atención al cliente con historial extenso.
- Agentes con herramientas: la capacidad de tool calling demostrada en la prueba de paridad permite integrarlo en flujos donde el modelo decide qué función invocar (consultas meteorológicas, APIs internas) y devuelve la llamada estructurada.
- Generación y revisión de código en pipelines locales: al ejecutarse sobre onnxruntime, puede integrarse en un paso de CI que analice diffs o explique errores sin depender de servicios externos.
- Procesamiento multilingüe en producción: con 11 idiomas declarados, sirve para traducción, resumen o clasificación de contenido en inglés, francés, alemán, español, italiano, portugués, neerlandés, chino, japonés, coreano y árabe.
- Despliegue en entornos con requisitos de soberanía del dato: la licencia Apache 2.0 y el formato ONNX permiten servir el modelo en infraestructura propia, incluidos equipos de sobremesa con GPU de 12-16 GB.
- Evaluación comparativa de cuantizaciones: las dos variantes (q4f16 y q4) permiten medir el compromiso entre memoria y fidelidad respecto a PyTorch antes de fijar una configuración de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye mediciones de paridad frente a PyTorch (`Mistral3ForConditionalGeneration`, fp32 en CPU) con ONNX Runtime en CPU:

| Prompt | Tokens PyTorch | Coincidencia greedy q4f16 | Coincidencia greedy q4 |
|---|---|---|---|
| Problema de bate y pelota | 1024 | 5 | 5 |
| Llamada de herramienta meteorológica | 245 | 24; misma respuesta | 24; misma respuesta |
| Respuesta de una palabra con system prompt propio | 3 | idéntica | idéntica |
| Explicación en alemán | 335 | 50 | 50 |
| Descripción de imagen sintética (visión) | 256 | 8; respuesta distinta | 8; respuesta distinta |

| Variante | Acuerdo de argmax con teacher forcing | KL media | KL máxima | Máx. \|Δlogit\| | Vision encoder vs PyTorch: máx. \|Δ\| / coseno mínimo |
|---|---|---|---|---|---|
| `q4f16` | 97,05% | 0,021 | 0,67 | 10,4 | 0,0054 / 0,999990 |
| `q4` | 97,05% | 0,021 | 0,69 | 10,4 | 0,0054 / 0,999990 |

El propio autor advierte de que la decodificación greedy a temperatura 0 es una prueba de estrés: un empate casi exacto que se invierte cambia todo lo que viene después, por lo que una divergencia tras muchos tokens idénticos es esperable con pesos de 4 bits y dice poco sobre la calidad por sí sola. Las columnas de teacher forcing miden la deriva de forma directa. "Misma respuesta" significa que el texto posterior a `[/THINK]` (o la llamada de herramienta) es idéntico al de PyTorch.

## Requisitos de hardware

- VRAM estimada para inferencia: la variante q4f16 suma 7,29 GB (decodificador) + 1,34 GB (embeddings) + 0,88 GB (encoder de visión) ≈ 9,5 GB de pesos, más KV cache y activaciones. La variante q4 sube a ≈ 10,4 GB de pesos. El repositorio completo ocupa 17,7 GB en disco.
- GPU consumer: cabe en tarjetas de 12 GB con contexto corto y en 16 GB (RTX 4070 Ti Super, RTX 4080, RTX 4090) con margen para KV cache; en 8 GB no es viable sin reducir contexto o recurrir a memoria del sistema.
- GPU de datacenter: A100 y H100 permiten servir varias peticiones concurrentes o contextos largos; no hay datos publicados de rendimiento con batching en estas tarjetas.
- Despliegue: transformers.js con `device: "webgpu"` (o WASM en CPU), onnxruntime-genai, onnxruntime plano y slicc-ortllama. La variante q4 está pensada para ejecución en CPU (`-e cpu`), mientras que q4f16 se genera para WebGPU (`-e webgpu`).
- Latencia y throughput: no disponible en la información proporcionada. El autor solo reporta ejecuciones de paridad en CPU, sin cifras de tokens por segundo.
- Descarga selectiva: el comando de ejemplo descarga solo un decodificador más los componentes compartidos y los ficheros JSON, evitando los 17,7 GB completos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Ministral 3 14B Reasoning 2512 ONNX (este) | 14B + 0,4B vision | no disponible | Sí (Pixtral 0,4B) | Apache 2.0 | ONNX int4, transformers.js / onnxruntime |
| mistralai/Ministral-3-14B-Reasoning-2512 | 14B + 0,4B vision | no disponible | Sí (Pixtral 0,4B) | Apache 2.0 | Pesos PyTorch/safetensors (checkpoint base) |
| mistralai/Ministral-3-3B-Instruct-2512-ONNX | 3B | no disponible | no disponible en la información | Apache 2.0 | ONNX, mismo layout de ficheros |
| Otras alternativas de 14B con visión y razonamiento | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el checkpoint base en PyTorch: este repositorio es una cuantización int4 del mismo modelo, con una pérdida medida de 97,05% de acuerdo de argmax y KL media de 0,021 nats en teacher forcing. Frente al 3B oficial en ONNX comparte estructura de ficheros y runtimes, pero cuadruplica aproximadamente el coste de memoria. No se dispone de datos de benchmarks que permitan compararlo con modelos de otros fabricantes.

## Limitaciones y advertencias

- Deriva por cuantización: las divergencias en decodificación greedy están documentadas por el propio autor; para tareas sensibles conviene validar contra el checkpoint en fp32 o bf16 antes de producción.
- No es un lanzamiento oficial de Mistral AI: el mantenimiento, los posibles errores de exportación y el soporte dependen de ai-ecoverse.
- Trazas de razonamiento: si se usa `skip_special_tokens: true` se pierde la marca de fin de razonamiento; el autor recomienda mantenerlo en `false`. Las trazas deben conservarse en el contexto multi-turno, lo que incrementa el consumo de tokens.
- System prompts: un system prompt propio sustituye el prompt por defecto del razonamiento; Mistral recomienda añadir `SYSTEM_PROMPT.txt` para no degradar el comportamiento.
- Riesgo de alucinación: no se publican evaluaciones de factualidad ni de tasas de alucinación en la información disponible.
- Cobertura lingüística: los 11 idiomas son una declaración del modelo base; no hay evaluaciones por idioma en la documentación aportada, y el español no aparece en las pruebas de paridad.
- Contexto: no se publica la longitud máxima soportada, solo la fórmula de escalado de queries; planificar el contexto en producción requiere consultar la model card del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero al ser una exportación de terceros conviene verificar los términos del checkpoint base y de las dependencias (onnxruntime, transformers.js) antes de distribuirlo.
- Compatibilidad de runtime: el formato depende de onnxruntime-genai y de los runtimes que cargan el 3B oficial; otros motores (vLLM, TGI, llama.cpp) no cargan este formato directamente.
- Sin métricas de producción: no hay datos de latencia, throughput ni consumo energético publicados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ai-ecoverse/Ministral-3-14B-Reasoning-2512-ONNX
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Reasoning-2512
- Exportación oficial de referencia (3B ONNX): https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-ONNX
- Prompt de sistema recomendado: https://huggingface.co/ai-ecoverse/Ministral-3-14B-Reasoning-2512-ONNX/blob/main/SYSTEM_PROMPT.txt
- Cargador del autor (slicc-ortllama): https://github.com/ai-ecoverse/slicc-ortllama
- Perfil del exportador: https://github.com/ai-ecoverse
- Mistral AI: https://mistral.ai
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de la información del repositorio.
