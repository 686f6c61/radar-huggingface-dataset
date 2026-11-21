# dphn/dolphin-2.9-llama3-8b-1m

## Resumen
Dolphin 2.9 Llama 3 8B 1M es un ajuste fino completo (full fine-tuning, FFT) del modelo Meta Llama 3 8B, desarrollado por Eric Hartford, Lucas Atkins, Fernando Fernandes y Cognitive Computations. El objetivo del proyecto Dolphin es producir modelos de instrucciones "sin censura" (uncensored), es decir, sin las capas de alineacion y sesgo de seguridad presentes en los modelos comerciales, lo que lo hace altamente complaciente con las peticiones del usuario.

La particularidad de esta variante "1m" es que se le ha aplicado el adaptador `winglian/llama-3-1m-context-gradient-lora` (creado por GradientAI y winglian, patrocinado por Crusoe Cloud) para extender la ventana de contexto desde los 8k nativos de Llama 3 hasta aproximadamente 1 millon de tokens. El modelo base tiene 8.030 millones de parametros en arquitectura transformer densa, y el ajuste fino se realizo sobre una secuencia de entrenamiento de 4k tokens.

Es relevante porque combina tres factores poco habituales en un modelo de 8B: contexto extremadamente largo, capacidades iniciales de agente y function calling, y una politica de contenido permisiva. Su licencia es la Llama 3 Community License, lo que permite uso comercial bajo los terminos de Meta. Esta pensado para desarrolladores que necesitan un modelo pequeno, desplegable en hardware modesto, con contexto largo y sin restricciones de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3) |
| Parametros totales | 8.030.277.632 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1 millon de tokens (mediante LoRA de extension de contexto); base nativa de 8k; entrenamiento FFT a 4k |
| Tipos de cuantizacion | no disponible en la informacion (pesos en safetensors; compatibles con cuantizacion estandar GGUF/AWQ via herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | llama3 (Meta Llama 3 Community License Agreement) |
| Formato de pesos | safetensors (repo de 16,1 GB) |

## Arquitectura y entrenamiento
El modelo parte de Meta Llama 3 8B, un transformer decoder-only denso con 8.030 millones de parametros. Sobre esa base se aplico un full fine-tuning de todos los parametros con Axolotl 0.4.0, usando ChatML como plantilla de prompt, `sequence_len` de 4096, sample packing activado, optimizador AdamW de 8 bits, scheduler coseno, learning rate 2e-5, 3 epochs, gradient checkpointing y precision bf16 automatica. El entrenamiento completo requirio 2,5 dias sobre 8 GPU L40S proporcionadas por Crusoe Cloud.

El dataset de instrucciones combina multiples fuentes: Dolphin-2.9, OpenHermes-2.5, CodeFeedback-Filtered-Instruction, dolphin-coder (traduccion y generacion de codigo), samantha-data (variante sin rechazos), UltraChat 200k sin filtrar, Orca-Math word problems, SystemChat-1.1, function-calling-chatml de Locutusque, Agent-FLAN de InternLM y varios conjuntos de ToolBench (instruccion, negativos, ReAct y TFLAN con cadena de pensamiento). Sobre el modelo resultante se aplico el adaptador de LoRA `llama-3-1m-context-gradient-lora` para extender el contexto a 1M tokens. No se documenta en la informacion disponible un proceso explicito de RLHF o DPO; el ajuste es puramente supervisado (SFT).

## Capacidades
- Generacion de texto conversacional multi-turno con plantilla ChatML.
- Razonamiento e instrucciones generales, entrenado sobre Dolphin-2.9 y OpenHermes.
- Generacion y traduccion de codigo (dolphin-coder, CodeFeedback).
- Resolucion de problemas matematicos (Orca-Math word problems).
- Capacidades iniciales de agente y razonamiento multi-paso (Agent-FLAN, ToolBench ReAct).
- Soporte de function calling / tool calling (function-calling-chatml, ToolBench).
- Contexto extremadamente largo de hasta 1M tokens.
- Modelo sin censura: alta complacencia con las peticiones del usuario.
- Capacidades multilingues: no disponible en la informacion.
- Vision y audio: no disponibles.

## Casos de uso
- Analisis de documentos muy extensos: el contexto de 1M tokens permite procesar libros completos, bases de codigo o historiales de conversacion largos en una sola pasada, sin necesidad de fragmentacion ni RAG previo.
- Generacion de codigo en pipelines: el entrenamiento con dolphin-coder y CodeFeedback, junto al soporte de function calling, permite integrarlo en flujos de CI/CD o asistentes de IDE que invocan herramientas externas.
- Agentes autonomos multi-paso: las capacidades de Agent-FLAN y ToolBench ReAct lo hacen util para bucles de razonamiento-accion con llamadas a APIs, aunque con supervision cuidadosa por su falta de alineacion.
- Atencion al cliente automatizada: gestiona conversaciones multi-turno con contexto largo, util para historiales de soporte extensos, siempre que se anada una capa de moderacion propia.
- Investigacion sobre modelos sin censura: sirve como base para estudiar comportamiento complaciente, sesgos y eficacia de capas de alineacion posteriores.
- Extraccion de informacion en corpus largos: resumen y question answering sobre contratos, informes o transcripciones que superan la ventana tipica de 8k-32k tokens.
- Prototipado local en hardware de consumo: al ser un 8B, puede desplegarse en una sola GPU consumer para experimentacion rapida.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El model-index del autor declara una entrada vacia (`results: []`), por lo que no hay cifras verificables de MMLU, HumanEval, GSM8K ni otras evaluaciones.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, mas overhead de KV cache; en la practica 18-24 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 9-10 GB; en 4 bits: en torno a 5-6 GB (estimaciones segun el tamano de parametros, no confirmadas en la informacion).
- GPU recomendadas: A100 40/80 GB, H100, L40S para contexto largo; RTX 4090 (24 GB) para bf16 o 8 bits con contexto moderado.
- Cabe en GPU consumer: si, en RTX 3090/4090 (24 GB) en bf16 y en GPUs de 8-12 GB con cuantizacion 4 bits, siempre que el contexto se mantenga corto.
- El contexto de 1M tokens dispara el consumo de KV cache; para ventanas realmente largas se requiere hardware de datacenter con memoria abundante.
- Opciones de despliegue: transformers, text-generation-inference (TGI, tag presente), vLLM, llama.cpp, Ollama (mediante conversion a GGUF), Axolotl para reentrenamiento.
- Latencia y throughput: no disponibles en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Dolphin 2.9 Llama 3 8B 1M | 8,03B | 1M (via LoRA) | Llama 3 | Sin censura, function calling, contexto extendido |
| Meta Llama 3 8B Instruct | 8,03B | 8k | Llama 3 | Base alineada oficialmente, contexto nativo corto |
| Mistral 7B Instruct | 7,2B | 32k | Apache 2.0 | Alternativa densa pequena con contexto mayor nativo |
| OpenHermes 2.5 (Mistral 7B) | 7,2B | 8k-32k | Apache 2.0 | Ajuste fino conversacional popular, sin contexto extendido |

Rendimiento comparativo: no disponible, al no existir benchmarks publicados por el autor.

## Limitaciones y advertencias
- Modelo sin censura: altamente complaciente incluso con peticiones poco eticas; requiere implementar una capa de alineacion propia antes de exponerlo como servicio.
- Bug conocido en el dataset Dolphin 2.9 (SystemConversations): el modelo tiende a hablar en exceso del "SYSTEM MESSAGE"; se recomienda anadir una instruccion en el system prompt pidiendole que no lo mencione.
- Riesgo elevado de alucinacion, comun en modelos de 8B ajustados sobre datos sinteticos generados por GPT-4.
- El contexto de 1M se obtiene mediante un adaptador LoRA de extension; la calidad efectiva en ventanas muy largas no esta documentada y puede degradarse frente al contexto nativo.
- Idiomas soportados no documentados; el grueso del dataset es en ingles, por lo que el rendimiento en castellano puede ser inferior.
- Licencia Llama 3: uso comercial permitido bajo los terminos de Meta, incluida la clausula de nomenclatura ("Built with Meta Llama 3") y restricciones de la licencia comunitaria.
- Entrenado con datos derivados de GPT-4 y otros modelos; conviene revisar implicaciones de uso y atribucion.
- No hay benchmarks publicados, por lo que las afirmaciones de calidad deben validarse con evaluacion propia.

## Enlaces
- Hugging Face: https://huggingface.co/dphn/dolphin-2.9-llama3-8b-1m
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B
- Adaptador de contexto: https://huggingface.co/winglian/llama-3-1m-context-gradient-lora
- Axolotl: https://github.com/OpenAccess-AI-Collective/axolotl
- Blog sobre modelos sin censura: https://erichartford.com/uncensored-models
- Discord de Cognitive Computations: https://discord.gg/cognitivecomputations
- Crusoe Cloud: https://crusoe.ai/
- Licencia Llama 3: https://huggingface.co/dphn/dolphin-2.9-llama3-8b-1m/blob/main/LICENSE
