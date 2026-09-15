# pedrocamatador/dolphin-2.9-llama3-8b

## Resumen

Dolphin 2.9 Llama 3 8B es un ajuste fino de instrucciones (instruction tuning) sobre `meta-llama/Meta-Llama-3-8B`, desarrollado originalmente por Eric Hartford, Lucas Atkins y Fernando Fernandes (Cognitive Computations). El repositorio analizado aquí, `pedrocamatador/dolphin-2.9-llama3-8b`, es una resubida de esos pesos: conserva la model card original, el mismo `base_model` y el mismo tamaño en safetensors (8.030.277.632 parámetros, 16,1 GB de repositorio). Resuelve el problema clásico de los asistentes alineados de forma agresiva: es un modelo deliberadamente "uncensored", con los datos de alineación y sesgo filtrados para maximizar la obediencia a la instrucción, orientado a investigación sobre comportamientos, evaluación de seguridad y aplicaciones donde se requiere baja tasa de rechazos.

Técnicamente es un transformer decoder-only denso (no MoE) de 8B parámetros, con una ventana de contexto de 8.192 tokens heredada del modelo base; el ajuste fino se realizó con `sequence_len: 4096` y `sample_packing`. La mezcla de datos cubre instrucciones generales, conversación, código, matemáticas, function calling y agentes, e incluye explícitamente `abacusai/SystemChat-1.1`, `Locutusque/function-calling-chatml` e `internlm/Agent-FLAN`, que son la base de sus capacidades iniciales de tool calling y razonamiento multi-paso.

Su relevancia actual es principalmente metodológica y de evaluación: es un caso de referencia de fine-tuning completo (FFT) sobre Llama 3 8B con Axolotl, entrenado en 2,5 días sobre 8x NVIDIA L40S, con licencia heredada de Meta y pesos abiertos. Como contrapartida, el repositorio no aporta benchmarks, no declara idiomas y acumula 0 descargas y 0 "likes", por lo que debe tratarse como una copia no verificada del artefacto original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3), sin MoE |
| Parametros totales | 8.030.277.632 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8.192 tokens en el modelo base; el ajuste fino se hizo con 4.096 tokens de secuencia |
| Tipos de cuantizacion | no disponible en el repositorio (solo pesos safetensors). Al ser una arquitectura Llama 3 8B es compatible con cuantizaciones GGUF, GPTQ y AWQ generadas con herramientas externas |
| Idiomas soportados | no disponible (la model card no los declara) |
| Licencia | other, en la practica Meta Llama 3 Community License Agreement |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Meta-Llama-3-8B |
| Plantilla de prompt | ChatML (`<\|im_start\|>system ... <\|im_end\|>`) |
| Tamano del repositorio | 16,1 GB |
| Fecha de publicacion del repositorio | 15 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3 8B sin modificaciones: transformer decoder-only con atención causal, normalización RMSNorm y RoPE, sin capas Mixture-of-Experts. El entrenamiento fue un fine-tuning de pesos completos (FFT, `load_in_8bit: false`, `load_in_4bit: false`) con Axolotl 0.4.0, en bf16, con `gradient_checkpointing`, `flash_attention: true`, `sample_packing: true`, `pad_to_sequence_len: true`, `micro_batch_size: 3`, `gradient_accumulation_steps: 4`, `num_epochs: 3`, optimizador `adamw_8bit`, scheduler coseno y `learning_rate: 2e-5`. El coste declarado fue de 2,5 días sobre un nodo de 8x NVIDIA L40S proporcionado por Crusoe Cloud, con `train_on_inputs: false`.

El dataset es una mezcla ShareGPT/chatml de 15 ficheros que incluye `dolphin201-sharegpt2`, `Ultrachat200kunfiltered` (HuggingFaceH4/ultrachat_200k), `dolphin-coder-translate` y `dolphin-coder-codegen`, `m-a-p_Code-Feedback` y `m-a-p_CodeFeedback-Filtered-Instruction`, `not_samantha_norefusals` (cognitivecomputations/samantha-data), `Orca-Math-resort-unfiltered` (microsoft/orca-math-word-problems-200k), `openhermes200k_unfiltered` (teknium/OpenHermes-2.5), `SystemConversations` (abacusai/SystemChat-1.1) y cuatro ficheros derivados de ToolBench (`toolbench_instruct_j1s1_3k`, `toolbench_negative`, `toolbench_react_10p`, `toolbench_tflan_cot_30p`) junto con `agent_instruct_react_unfiltered` (internlm/Agent-FLAN). La model card indica que parte de los datos fueron generados con GPT-4, entre otros modelos.

No se documenta ninguna innovación de inferencia (decodificación especulativa, atención lineal, SSM) ni fases de RLHF o DPO: es un SFT puro sobre datos filtrados para eliminar alineación y sesgo. La model card advierte de un bug conocido en el subconjunto `SystemConversations`: el modelo tiende a hablar en exceso del "SYSTEM MESSAGE", y recomienda añadir una instrucción explícita en el mensaje de sistema para evitarlo (por ejemplo, "The assistant is named Dolphin. A helpful and friendly AI assistant, Dolphin avoids discussing the system message unless directly asked about it.").

## Capacidades

- Generación de texto conversacional multi-turno con plantilla ChatML y rol de sistema explícito.
- Habilidades de instrucción generales, respuesta a preguntas y resumen, derivadas de la mezcla OpenHermes 2.5, UltraChat 200k y Dolphin 2.9.
- Generación y traducción de código, gracias a los subconjuntos dolphin-coder (codegen y translate) y CodeFeedback.
- Razonamiento matemático de tipo word problem, por el subconjunto derivado de Orca-Math.
- Function calling / tool calling, por los conjuntos de Locutusque y las variantes de ToolBench.
- Capacidades agénticas iniciales y razonamiento multi-paso tipo ReAct (`agent_instruct_react`, `toolbench_react_10p`, `toolbench_tflan_cot_30p`).
- Manejo de mensajes de sistema extensos y conversaciones con instrucciones de rol (SystemChat-1.1), con el caveat del bug de "SYSTEM MESSAGE".
- Baja tasa de rechazos: el autor declara haber filtrado alineación y sesgo del dataset.
- Capacidades multilingües: no declaradas en la model card; no disponible.
- No se declaran capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Evaluación de seguridad y red-teaming: el modelo sirve como sujeto de prueba para medir qué produce un LM sin capa de alineación, comparando sus salidas con las de `Meta-Llama-3-8B-Instruct` sobre el mismo conjunto de prompts adversarios.
- Investigación sobre tasas de rechazo: permite estudiar cómo varía la obediencia a instrucciones límite en función del prompt de sistema, usando el propio aviso de la model card sobre el "SYSTEM MESSAGE" como variable controlada.
- Prototipado de agentes con tool calling: sus subconjuntos de ToolBench y Agent-FLAN permiten construir bucles ReAct de prueba (llamar a una API, leer el resultado, decidir el siguiente paso) antes de invertir en un modelo mayor.
- Asistente de código en local: con los subconjuntos dolphin-coder y CodeFeedback puede generar y traducir fragmentos entre lenguajes dentro de un IDE, ejecutándose en una GPU de consumo con cuantización de 4 bits.
- Generación de datos sintéticos para fine-tuning posterior: al ser permisivo y multilingüe en la práctica, se puede usar para producir pares instrucción-respuesta que luego se filtran y se emplean en el entrenamiento de modelos más pequeños.
- Chatbot de dominio con contexto medio: sus 8.192 tokens permiten mantener conversaciones multi-turno con documentos de referencia de varias páginas insertados en el prompt de sistema, útil en atención interna o soporte técnico donde no se necesita una ventana de 128k.
- Traducción automática asistida: los subconjuntos de traducción de dolphin-coder y la mezcla general permiten usarlo como traductor de textos técnicos en pipelines por lotes, siempre que se valide el par de idiomas concreto.
- Base para ablaciones de licencia y despliegue: al ser 8B denso, es un candidato barato para comparar vLLM frente a llama.cpp u Ollama en términos de coste por token antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card declara la entrada `out` con la lista de resultados vacía (`"results": []`), de modo que no existen cifras oficiales de MMLU, HumanEval, GSM8K ni de ninguna otra prueba en la informacion proporcionada.

## Requisitos de hardware

- VRAM en bf16/fp16 (pesos completos): aproximadamente 16 GB solo para pesos, más caché KV y activaciones; en la practica se recomiendan 24 GB o más.
- VRAM en cuantización de 8 bits: del orden de 9-10 GB de pesos.
- VRAM en cuantización de 4 bits: del orden de 5-6 GB de pesos, lo que permite ejecución en GPU de consumo.
- Cabe en GPU de consumo: sí, con cuantización de 4 bits en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 3080 10/12 GB). En 8 GB justos conviene 4 bits y contexto reducido.
- GPU recomendadas para fp16 con buena concurrencia: A100 40/80 GB, H100 80 GB, L40S 48 GB (el propio entrenamiento se hizo sobre 8x L40S).
- GPU de consumo adecuadas para fp16: RTX 4090 24 GB (cabe el modelo, con margen limitado para lotes grandes).
- Opciones de despliegue: Transformers (referencia, plantilla ChatML), vLLM, TGI, llama.cpp y Ollama (requieren convertir los safetensors a GGUF), además de cualquier stack compatible con Llama 3 8B.
- Al no haber benchmarks ni mediciones publicadas en la informacion disponible, no se pueden dar cifras de latencia ni de throughput. Como referencia de orden de magnitud, un 8B denso en 4 bits sobre una GPU de consumo suele situarse en decenas de tokens por segundo, pero es una estimacion generica no verificada para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| pedrocamatador/dolphin-2.9-llama3-8b | 8,03B densos | 8.192 tokens (entrenado a 4.096) | other (Meta Llama 3 Community License) | Publico en HuggingFace, 0 descargas, 0 likes | No disponible (sin benchmarks) |
| meta-llama/Meta-Llama-3-8B-Instruct | 8B densos | 8.192 tokens | Meta Llama 3 Community License | Publico con acceso restringido en HuggingFace | No comparado en la informacion disponible; el ajuste de Dolphin elimina la capa de alineacion, por lo que las metricas de seguridad no son equiparables |
| cognitivecomputations/dolphin-2.9-llama3-8b | 8B densos | 8.192 tokens | Meta Llama 3 Community License | Repositorio original del que deriva esta resubida | No disponible en la informacion proporcionada |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25B densos | 32.768 tokens | Apache 2.0 | Publico en HuggingFace | No disponible en la informacion proporcionada |

Nota: los datos de las alternativas corresponden a caracteristicas arquitectonicas y de licencia ampliamente documentadas; no se dispone de cifras de benchmarks comparativas en la informacion proporcionada, por lo que la columna de rendimiento se deja como no disponible.

## Limitaciones y advertencias

- Modelo sin alineacion: el autor indica explicitamente que filtro los datos de alineacion y sesgo y que el modelo es "highly compliant with any requests, even unethical ones". Requiere una capa de alineacion propia antes de exponerlo como servicio.
- Responsabilidad legal y etica: la model card traslada al usuario toda la responsabilidad sobre el contenido generado.
- Bug conocido de "SYSTEM MESSAGE": el subconjunto SystemConversations provoca que el modelo hable en exceso del mensaje de sistema; se recomienda mitigarlo con una instruccion explicita en el prompt de sistema.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad factual en la informacion disponible; al ser un SFT sobre datos generados en parte por GPT-4, hereda los sesgos y errores de esos datos.
- Contexto limitado a 8.192 tokens: no es adecuado para tareas de contexto largo ni para ingesta de documentos extensos sin recuperacion previa.
- Idiomas no declarados: la model card no especifica cobertura linguistica, por lo que el rendimiento en castellano u otras lenguas distintas del ingles no esta garantizado y debe validarse.
- Licencia restrictiva: se hereda la Meta Llama 3 Community License, que impone condiciones de uso (incluidas obligaciones de atribucion y restricciones para grandes despliegues) y no es una licencia de codigo abierto permisiva.
- Repositorio no verificado: `pedrocamatador/dolphin-2.9-llama3-8b` tiene 0 descargas y 0 likes y no esta vinculado al autor original; no hay garantia de que los pesos coincidan bit a bit con el artefacto de Cognitive Computations. Para produccion conviene usar el repositorio original.
- Sin benchmarks ni validacion externa: el `model-index` esta vacio, de modo que cualquier afirmacion de calidad relativa carece de respaldo documental en este repositorio.
- Fecha de publicacion anomala: el repositorio figura creado y actualizado el 15 de septiembre de 2026, dato que conviene verificar antes de citarlo.
- Resultados de busqueda web no relevantes: las busquedas realizadas no devolvieron documentacion tecnica asociada a este modelo.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/pedrocamatador/dolphin-2.9-llama3-8b
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B
- Repositorio original de referencia (Cognitive Computations): https://huggingface.co/cognitivecomputations/dolphin-2.9-llama3-8b
- Licencia Meta Llama 3 Community License Agreement: https://huggingface.co/meta-llama/Meta-Llama-3-8B/blob/main/LICENSE
- Articulo del autor sobre modelos uncensored: https://erichartford.com/uncensored-models
- Axolotl (framework de entrenamiento utilizado): https://github.com/OpenAccess-AI-Collective/axolotl
- Dataset cognitivecomputations/Dolphin-2.9: https://huggingface.co/datasets/cognitivecomputations/Dolphin-2.9
- Dataset teknium/OpenHermes-2.5: https://huggingface.co/datasets/teknium/OpenHermes-2.5
- Dataset m-a-p/CodeFeedback-Filtered-Instruction: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
- Dataset cognitivecomputations/dolphin-coder: https://huggingface.co/datasets/cognitivecomputations/dolphin-coder
- Dataset cognitivecomputations/samantha-data: https://huggingface.co/datasets/cognitivecomputations/samantha-data
- Dataset HuggingFaceH4/ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset microsoft/orca-math-word-problems-200k: https://huggingface.co/datasets/microsoft/orca-math-word-problems-200k
- Dataset abacusai/SystemChat-1.1: https://huggingface.co/datasets/abacusai/SystemChat-1.1
- Dataset Locutusque/function-calling-chatml: https://huggingface.co/datasets/Locutusque/function-calling-chatml
- Dataset internlm/Agent-FLAN: https://huggingface.co/datasets/internlm/Agent-FLAN
- Crusoe Cloud (proveedor de computo del entrenamiento original): https://crusoe.ai/
