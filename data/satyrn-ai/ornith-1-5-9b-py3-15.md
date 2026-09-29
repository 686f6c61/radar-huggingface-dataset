# satyrn-ai/Ornith-1.5-9B-py3.15

. Serving recipes enable reasoning parser so CoT returned in separate reasoning_content field, and tool-call parser so <tool_call> blocks surfaced as OpenAI-style. MLX-4bit available.
- Github: ornith-ai/Ornith-1.
- Tag qwen3_5 suggests architecture based on Qwen3.5 — hmm, tag "qwen3_5". That's a hint at architecture lineage. I should present it carefully: the tag suggests Qwen3.5 lineage. But careful — don't invent. I can state the repo tags include qwen3_5, suggesting base architecture derived from Qwen3.5 family, but that's inference. Better to say "no disponible" for architecture, but mention the tag in the architecture section as a hint. Actually the instruction says don't invent data. I'll say architecture: no disponible (los tags del repositorio incluyen qwen3_5, lo que sugiere...). Hmm, the spec table requires "Arquitectura". I'd write: "no disponible (los tags del repo indican qwen3_5; el modelo se distribuye con llama.cpp/GGUF)". That's reasonable — reporting the tag is a fact.

Parametros activos: only if MoE. The 9B is dense (the 397B and 35B are MoE). But we don't know for sure. I'd say "no disponible (no se indica que sea MoE; el modelo de 9B no se describe como MoE en la informacion disponible)".

Context length: no disponible. Vision: multimodal — mmproj file, vision-language-model tag, llama-mtmd-cli. So vision support exists.

Quantization types: Q4_K_M GGUF, BF16 mmproj, MLX 4-bit (the sibling repo). Safetensors (BF16 presumably).

Languages: not available. Conversational tag.

Licence: not available (not in the provided info). Note that.

Benchmarks: not published in available info → state explicitly.

Hardware: ~9.65B params. BF16 ≈ 19.3 GB; Q4_K_M ≈ 5.5-6 GB + mmproj (vision projector ~ maybe 1-2 GB, unknown). Actually typical mmproj for 9B ~ 0.6-1.3 GB. I should be careful — I can compute weight quant sizes approximately from param count (that's arithmetic, not invention, but I should mark estimates as estimates). 9.653B params: BF16 = 19.3 GB, Q8 = ~9.7 GB, Q4_K_M ≈ 5.5-6.0 GB, Q5_K_M ≈ 6.5 GB. I'll label as "estimado a partir del recuento de parametros".

GPUs: 24 GB (RTX 3090/4090) fits BF16 exercise? 19.3 GB weights + KV cache + activations → tight but feasible at short context. Q4/Q5 fits on 8-12 GB (RTX 3060 12GB, RTX 4070, Apple Silicon 16 GB unified). A100 40/80, H100 for high throughput/batch.

Deployment: llama.cpp (llama-cli, llama-mtmd-cli, llama-server), Ollama, vLLM? tag endpoints_compatible, unsloth. Mention LM Studio, text-generation-inference (not confirmed). I'll mention llama.cpp-based and MLX for Apple; vLLM only if safetensors available — it is (safetensors tag). But careful — claim "safetensors tag suggests HF Transformers/vLLM compatible". Keep it as "segun los tags del repositorio".

Latency/throughput: no disponible.

Comparison: Ornith-1.5-35B MoE, Ornith-1.5-397B MoE (same family), Ornith-1.0 (previous generation), Ornith-1.5-9B-MLX-4bit (sibling deployment). Comparable external models: not available.

Limitations: unknown licence → commercial risk; hallucination; no published benchmarks; repo with 0 downloads/likes → unverified; the model card references "postrational/Ornith-1.5-9B" in usage while the repo is satyrn-ai/... — inconsistency worth flagging. Also the py3.15 suffix is odd/unclear. Date created 2026 — I shouldn't comment. Actually the created date 2026-09-29 is in the data; I could mention no. Better not dwell. Hmm, maybe mention nothing.

Also note the naming discrepancy: original family is ornith-ai, this repo is satyrn-ai — a third-party re-upload. Flag it.

Let's write the ficha in Spanish (Spain), headings with only first word capitalised. Note: "Resumen", "Especificaciones tecnicas", "Arquitectura y entrenamiento", "Capacidades", "Casos de uso", "Benchmarks y rendimiento", "Requisitos de hardware", "Comparativa con modelos similares", "Limitaciones y advertencias", "Enlaces". Only first word capitalized — so "Especificaciones tecnicas" (lowercase t), "Arquitectura y entrenamiento" (lowercase y? "y" is a conjunction, lowercase fine), "Benchmarks y rendimiento", "Requisitos de hardware", "Comparativa con modelos similares", "Limitaciones y advertencias". Good.

No emojis. Use tables.

Casos de uso: minimum 6, concrete.

Enlaces: HF URL for satyrn-ai repo, ornith-ai/Ornith-1.5-9B, GitHub, ornith.ai, ornith.ai/ornith_1_5.html, MLX-4bit repo, unsloth repo, llama.cpp.

Write it.

Resumen: 2-3 paragraphs, 6-10 lines total.

Specs table:
- Arquitectura: no disponible (tags incluyen qwen3_5 y vision-language-model)
- Parametros totales: 9.653.104.368 (~9,65 B)
- Parametros activos: no aplica / no disponible — it's not described as MoE. I'll put "no disponible (no se describe como MoE; el dato no consta)".
- Longitud de contexto: no disponible
- Tipos de cuantizacion: GGUF Q4_K_M; BF16 (mmproj y pesos safetensors); MLX 4-bit en repo hermano
- Idiomas: no disponible
- Licencia: no disponible
- Formato de pesos: safetensors, GGUF (Q4_K_M, BF16 mmproj), MLX en repo hermano

Also add extra rows? The instructions say include SIEMPRE these rows. I can add extras like tamaño del repo, modalidad, etc. I'll add a few: "Tamano del repositorio", "Modalidad" (texto e imagen). Keep it.

Arquitectura y entrenamiento: describe what's known: finetune converted with Unsloth; the family uses self-scaffolding/self-improvement loop with RL from self-generated rollouts; reasoning model with <think> blocks and <tool_call>; MoE at 397B and 35B, 9B unspecified. Transformer decoder presumably; not confirmed. Vision via mmproj projector. Training tokens: no disponible.

Careful: "This was trained 2x faster with Unsloth" — refers to finetune speed.

Benchmarks: none published.

I'll write now, keeping it rigorous.

For hardware, give estimates clearly labelled "estimacion a partir del recuento de parametros".

KV cache estimation: unknown due to unknown layers/heads/context. Skip or say no disponible.

Let's produce.## Resumen

Ornith-1.5-9B es un modelo de la familia Ornith, desarrollada por ornith-ai y orientada a tareas agénticas y de razonamiento. La familia se presenta como un conjunto de modelos abiertos capaces de auto-mejorarse: el propio modelo propone tareas nuevas, genera andamiajes (scaffolds) específicos para cada tarea y produce rollouts de solución que se reutilizan para aprendizaje por refuerzo. La generación 1.5 se distribuye en tres tamanos conocidos: 397B MoE, 35B MoE y 9B, siendo esta ficha la variante de 9B.

El repositorio aqui descrito, satyrn-ai/Ornith-1.5-9B-py3.15, es una publicacion derivada que empaqueta el modelo para su uso con llama.cpp: incluye pesos en safetensors, una cuantizacion GGUF Q4_K_M y un proyector multimodal BF16 (mmproj), lo que confirma que se trata de un modelo de vision-lenguaje. El recuento real de parametros en safetensors es de 9.653.104.368 (unos 9,65 mil millones), con un repositorio de 26 GB.

Es relevante ahora porque combina tres caracteristicas poco frecuentes en modelos de menos de 10B: modo de razonamiento explicito con bloques de pensamiento, soporte de tool calling con parser dedicado y capacidad multimodal de entrada de imagen. Todo ello con pesos abiertos y ejecutables en hardware de consumo mediante llama.cpp u Ollama. La contrapartida es la falta de informacion publicada: no hay licencia, idiomas, contexto ni benchmarks declarados en los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags del repositorio indican qwen3_5; se distribuye con llama.cpp y Unsloth) |
| Parametros totales | 9.653.104.368 (aproximadamente 9,65 B) |
| Parametros activos | no disponible (no se describe como MoE; los modelos MoE de la familia son los de 35B y 397B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M; BF16 para pesos y para el proyector multimodal (mmproj); MLX 4-bit en el repositorio hermano |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF (Q4_K_M y BF16 mmproj) |
| Modalidad | texto e imagen (vision-language-model, proyector mmproj) |
| Tamano del repositorio | 26,0 GB |
| Etiqueta de pipeline | no disponible |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Los tags del repositorio incluyen qwen3_5, lo que apunta a una base derivada de la familia Qwen3.5, y vision-language-model junto con el fichero Ornith-1.5-9B.BF16-mmproj.gguf, que indica una arquitectura multimodal con un proyector que alinea representaciones visuales con el espacio de tokens del modelo de lenguaje. La familia Ornith-1.5 se distribuye en configuraciones MoE para los tamanos de 35B y 397B; para la variante de 9B no consta si mantiene mezcla de expertos o es densa.

En cuanto al entrenamiento, la documentacion publica de la familia describe un bucle de auto-mejora de extremo a extremo que extiende el marco de auto-scaffolding de Ornith-1.0: el modelo propone nuevas tareas, genera andamiajes especificos y produce rollouts de solucion que alimentan el aprendizaje por refuerzo, creando nuevas experiencias de aprendizaje de forma continua. El repositorio concreto aqui descrito se ha finetuneado y convertido a GGUF con Unsloth. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento: el turno del asistente abre por defecto con un bloque `<think> ... </think>` antes de la respuesta final, segun la documentacion de la familia.
- Tool calling / function calling: los bloques `<tool_call>` del modelo pueden exponerse como llamadas estilo OpenAI mediante un parser dedicado en las recetas de servicio.
- Razonamiento multi-paso y uso agéntico: la familia esta disenada explicitamente para tareas agénticas y para auto-generar andamiajes y rollouts.
- Vision: entrada de imagenes a traves del proyector multimodal, con soporte en llama.cpp mediante `llama-mtmd-cli`.
- Separacion de la cadena de pensamiento: el contenido de razonamiento puede devolverse en un campo `reasoning_content` independiente.
- Capacidades multilingues: no disponible.
- Modo conversacional: el repositorio esta etiquetado como conversational.
- Capacidades de audio: no disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con bloques de razonamiento previos a la respuesta, lo que permite auditar la cadena de decision antes de enviar el mensaje final al usuario. La longitud de contexto no esta publicada, por lo que habria que validarla antes de usarlo con historiales largos.
- Agentes autonomos con herramientas: gracias al soporte de tool calling y a los parsers de `<tool_call>`, se puede integrar en un bucle de agente que consulte APIs, bases de datos o sistemas internos y componga respuestas a partir de los resultados.
- Extraccion de datos de documentos escaneados o capturas: al aceptar entrada de imagen, resulta adecuado para tareas de vision-lenguaje como leer formularios, tickets o diagramas y devolver campos estructurados.
- Generacion y revision de codigo en pipelines de CI/CD: el modelo puede insertarse como paso de revision automatica de parches o de generacion de tests, aprovechando el modo de razonamiento para justificar los cambios propuestos.
- Soporte tecnico de nivel 1 con escalado: el campo de razonamiento separado permite decidir cuando la confianza del modelo es baja y escalar el caso a un operador humano.
- Automatizacion de tareas de back office: clasificacion y transcripcion de informacion a partir de capturas de pantalla o PDFs rasterizados, combinando la parte de vision con la de generacion.
- Despliegue local en estaciones de trabajo: con la cuantizacion Q4_K_M puede ejecutarse en equipos sin GPU dedicada de gran tamano mediante llama.cpp u Ollama, lo que lo hace util para prototipos con requisitos de privacidad.
- Investigacion en auto-mejora y RL: la familia documenta un bucle de generacion de tareas y rollouts, por lo que el modelo de 9B sirve como punto de partida asequible para experimentar con ese esquema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio satyrn-ai ni los resultados de busqueda consultados incluyen cifras de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales para la variante de 9B.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del recuento de parametros, no publicada por el autor): BF16 en torno a 19,3 GB solo en pesos; Q8 en torno a 9,7 GB; Q4_K_M en torno a 5,5-6,0 GB. A estas cifras hay que sumar el proyector multimodal BF16 y la cache KV, cuyo tamano depende de la longitud de contexto, que no esta publicada.
- GPU recomendadas: A100 40 GB u 80 GB y H100 para servicio con lotes grandes y contexto largo en BF16; RTX 4090 o RTX 3090 (24 GB) para BF16 con contexto moderado o para cuantizaciones mayores con margen.
- Cabe en GPU de consumo: si. La cuantizacion Q4_K_M es viable en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) y en equipos Apple Silicon con memoria unificada de 16 GB o superior; BF16 requiere 24 GB o mas.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto, `llama-mtmd-cli` para multimodal, `llama-server` como servidor), Ollama, LM Studio y cualquier frontend compatible con GGUF. Para Apple Silicon existe un repositorio hermano en formato MLX 4-bit. Los tags del repositorio incluyen endpoints_compatible y safetensors, lo que sugiere compatibilidad con servidores que consumen pesos de HuggingFace, aunque no se documenta una integracion concreta con vLLM o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-9B (este repositorio) | 9,65 B | no disponible (tag qwen3_5), vision-lenguaje | no disponible | no disponible | safetensors, GGUF, MLX (repo hermano) |
| Ornith-1.5-35B | no disponible | MoE, vision-lenguaje | no disponible | no disponible | HuggingFace de ornith-ai |
| Ornith-1.5-397B | no disponible | MoE, vision-lenguaje | no disponible | no disponible | HuggingFace de ornith-ai |
| Ornith-1.0 | no disponible | familia anterior, auto-scaffolding | no disponible | no disponible | GitHub ornith-ai/Ornith-1 |
| Ornith-1.5-9B-MLX-4bit | 9 B (aproximado) | misma base, formato MLX | no disponible | no disponible | HuggingFace de ornith-ai |

No se dispone de modelos de otras familias con datos verificables en la informacion proporcionada para establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- Licencia no declarada: no es posible determinar si se permite el uso comercial. Cualquier despliegue en produccion deberia aclarar este punto con el autor antes de continuar.
- Sin benchmarks publicos para esta variante: no hay evidencia cuantitativa de calidad en razonamiento, codigo o vision, por lo que las decisiones de adopcion deberian basarse en evaluaciones propias.
- Riesgo de alucinacion: es un modelo de razonamiento con generacion de cadena de pensamiento; la existencia de un bloque `<think>` no garantiza que el contenido sea correcto, y la cadena puede racionalizar respuestas erroneas.
- Idiomas no declarados: se desconoce el soporte real de castellano y de otras lenguas, asi como su calidad fuera del ingles.
- Longitud de contexto desconocida: impide planificar despliegues con documentos largos o historiales extensos sin una validacion previa.
- Repositorio derivado: el modelo card usa como ejemplo la ruta `postrational/Ornith-1.5-9B`, mientras que el repositorio analizado es `satyrn-ai/Ornith-1.5-9B-py3.15`, lo que indica una publicacion de terceros y no la del autor original. Conviene contrastar los pesos con el repositorio oficial de ornith-ai.
- Senales de validacion ausentes: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita evaluar la fiabilidad del empaquetado.
- El sufijo `py3.15` del nombre del repositorio no se explica en la documentacion disponible; su significado es incierto.
- Compatibilidad de parsers: el razonamiento y las llamadas a herramientas requieren configurar parsers especificos en el servidor; sin ellos, el contenido de `<think>` y `<tool_call>` se devolvera como texto plano.

## Enlaces

- Repositorio analizado (satyrn-ai): https://huggingface.co/satyrn-ai/Ornith-1.5-9B-py3.15
- Repositorio oficial del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Variante MLX 4-bit: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX-4bit
- Repositorio GitHub de la familia Ornith: https://github.com/ornith-ai/Ornith-1
- Sitio web del proyecto: https://ornith.ai/
- Pagina de la generacion 1.5: https://ornith.ai/ornith_1_5.html
- Unsloth (herramienta usada para el finetune y la conversion a GGUF): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado en la model card): https://github.com/ggml-org/llama.cpp
