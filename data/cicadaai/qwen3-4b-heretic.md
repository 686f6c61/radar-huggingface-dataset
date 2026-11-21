# CicadaAi/Qwen3-4B-heretic

## Resumen

CicadaAi/Qwen3-4B-heretic es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507 en el que se ha aplicado una tecnica de "abliteracion" o decensurado mediante la herramienta Heretic v2.1.0, desarrollada por el proyecto Heretic. El objetivo declarado es eliminar el comportamiento de rechazo (refusals) del modelo original: segun la model card, el modelo base rechaza 100 de cada 100 peticiones consideradas problematicas, mientras que esta version rechaza 0 de cada 100, a costa de una divergencia KL de 12,0564 respecto al original. Se trata, por tanto, de una variante orientada a usos donde el filtrado de seguridad del modelo base resulta un obstaculo, no de un modelo nuevo entrenado desde cero.

Arquitectonicamente hereda todas las caracteristicas de Qwen3-4B-Instruct-2507: un transformer causal denso de 4.022 millones de parametros totales (3.600 millones sin embeddings), 36 capas, atencion con GQA (32 cabezas de query y 8 de clave/valor) y una longitud de contexto nativa de 262.144 tokens. Es un modelo de la familia Qwen3 en modo no-thinking, es decir, no genera bloques `<think></think>` y responde directamente, lo que simplifica su integracion en pipelines de produccion.

La relevancia de esta ficha es doble: por un lado documenta un caso concreto de modificacion de pesos mediante ablation de direcciones de activacion (Arbitrary-Rank Ablation), y por otro advierte de que se trata de un artefacto con cero descargas y cero likes en el momento de la consulta, sin datos publicados sobre idiomas soportados ni evaluaciones propias mas alla del conteo de rechazos y la divergencia KL. Cualquier uso en produccion debe partir de la evaluacion del modelo base y validar por separado el efecto del decensurado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3), 36 capas, GQA con 32 cabezas Q y 8 KV |
| Parametros totales | 4.022.468.096 (4,0B; 3,6B sin embeddings) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; el ecosistema Qwen3 admite cuantizaciones GGUF/AWQ/GPTQ de terceros) |
| Idiomas soportados | no disponible (la model card del base menciona mejoras en conocimiento multilingue de cola larga, sin listado concreto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de la familia Qwen3, con 36 capas y atencion con grouped-query attention (32 cabezas de query frente a 8 de clave/valor), lo que reduce el coste de memoria de la cache KV en contextos largos. El contexto nativo es de 262.144 tokens. No es un modelo MoE ni hibrido: todos los parametros participan en cada token generado.

El entrenamiento original de Qwen3-4B-Instruct-2507 consistio en pretraining y post-training (fase de instruccion) por parte de Alibaba Qwen; la model card del base no detalla el numero de tokens ni la composicion exacta del dataset, ni si se uso RLHF o DPO. Sobre ese checkpoint, CicadaAi aplico Heretic v2.1.0 con Arbitrary-Rank Ablation (ARA) entre las capas 12 y 29, con los siguientes hiperparametros: `preserve_good_behavior_weight` 0,2237, `steer_bad_behavior_weight` 0,0002, `overcorrect_relative_weight` 1,0340 y `neighbor_count` 11. La innovacion tecnica, por tanto, no esta en la arquitectura sino en la modificacion post-hoc de los pesos para suprimir la direccion de activacion asociada al rechazo, con un coste medido de divergencia KL de 12,0564 frente al modelo original.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat propia de Qwen3.
- Razonamiento logico y matemetico en modo directo (no-thinking), sin bloques de pensamiento.
- Generacion y comprension de codigo, con soporte multilingue de programacion segun las evaluaciones del base (MultiPL-E, LiveCodeBench).
- Tool calling / function calling, con resultados del base en BFCL-v3 de 61,9 y en TAU1/TAU2.
- Capacidades de agente y razonamiento multi-paso (TAU1-Retail 48,7; TAU2-Retail 40,4 en el base).
- Comprension de contexto largo de hasta 262.144 tokens.
- Capacidades multilingues segun el modelo base (MultiIF 69,0; MMLU-ProX 61,6; INCLUDE 60,1).
- Supresion del comportamiento de rechazo: 0/100 rechazos medidos por el autor frente a 100/100 del base.
- No soporta vision ni audio (modelo exclusivamente de texto).
- No genera modo thinking: `enable_thinking=False` es innecesario.

## Casos de uso

- Investigacion sobre alineacion y seguridad: permite estudiar que direcciones de activacion codifican el rechazo comparando este checkpoint con Qwen3-4B-Instruct-2507, usando la divergencia KL reportada como metrica de deriva.
- Generacion creativa sin filtros editoriales: escritura de ficcion con violencia, temas adultos o personajes moralmente ambiguos, donde el modelo base rechazaria escenas legitinas de narrativa.
- Red teaming y evaluacion de salvaguardas: uso como modelo "atacante" o generador de prompts adversarios para probar clasificadores y filtros de otros sistemas.
- Analisis de contenido sensible en entornos controlados: resumen o clasificacion de documentos con lenguaje explicito (informes medicos, textos legales, moderacion de foros) sin que el modelo se niegue a procesarlos.
- Experimentacion academica con contextos largos: aprovechando los 262.144 tokens para tareas de recuperacion y sintesis sobre corpus extensos, con la salvedad de validar la calidad tras la ablation.
- Prototipado de asistentes conversacionales internos: su tamano de 4B permite desplegarlo en una sola GPU consumer o incluso en CPU con cuantizacion, util para demos y pruebas de integracion antes de escalar a modelos mayores.
- Fine-tuning posterior: al estar en safetensors y licencia Apache 2.0, sirve como punto de partida para ajustes especificos de dominio donde no se desea heredar el sesgo de rechazo del base.

## Benchmarks y rendimiento

Los unicos datos propios publicados por el autor son el conteo de rechazos y la divergencia KL:

| Metrica | Este modelo | Qwen3-4B-Instruct-2507 |
|---|---|---|
| Rechazos | 0/100 | 100/100 |
| Divergencia KL | 12,0564 | 0 (por definicion) |

El resto de cifras de la model card corresponden al modelo base Qwen3-4B-Instruct-2507 y no deben atribuirse a esta variante sin validacion:

| Benchmark | Qwen3-4B-Instruct-2507 | Qwen3-4B Non-Thinking | GPT-4.1-nano |
|---|---|---|---|
| MMLU-Pro | 69,6 | 58,0 | 62,8 |
| MMLU-Redux | 84,2 | 77,3 | 80,2 |
| GPQA | 62,0 | 41,7 | 50,3 |
| SuperGPQA | 42,8 | 32,0 | 32,2 |
| AIME25 | 47,4 | 19,1 | 22,7 |
| HMMT25 | 31,0 | 12,1 | 9,7 |
| ZebraLogic | 80,2 | 35,2 | 14,8 |
| LiveBench 20241125 | 63,0 | 48,4 | 41,5 |
| LiveCodeBench v6 | 35,1 | 26,4 | 31,5 |
| MultiPL-E | 76,8 | 66,6 | 76,3 |
| Aider-Polyglot | 12,9 | 13,8 | 9,8 |
| IFEval | 83,4 | 81,2 | 74,5 |
| Arena-Hard v2 | 43,4 | 9,5 | 15,9 |
| Creative Writing v3 | 83,5 | 53,6 | 72,7 |
| WritingBench | 83,4 | 68,5 | 66,9 |
| BFCL-v3 | 61,9 | 57,6 | 53,0 |
| TAU1-Retail | 48,7 | 24,3 | 23,5 |
| TAU1-Airline | 32,0 | 16,0 | 14,0 |
| TAU2-Retail | 40,4 | 28,1 | no disponible |
| TAU2-Airline | 24,0 | 12,0 | no disponible |
| TAU2-Telecom | 13,2 | 17,5 | no disponible |
| MultiIF | 69,0 | 61,3 | 60,7 |
| MMLU-ProX | 61,6 | 49,6 | 56,2 |
| INCLUDE | 60,1 | 53,8 | 58,6 |
| PolyMATH | 31,1 | 16,6 | 15,6 |

No se han publicado resultados de benchmarks especificos de esta variante decensurada en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 8 GB solo para pesos, mas cache KV; el repositorio ocupa 8,1 GB en safetensors. Con contexto largo la cache KV crece de forma notable, por lo que se recomienda reservar 12-16 GB en total.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4-5 GB de pesos; en 4 bits, aproximadamente 2,5-3 GB, con margen adicional para cache KV y overhead.
- GPU recomendadas: A100 40/80 GB o H100 para despliegues con contexto cercano a 262K y concurrencia alta; L40S o RTX 6000 Ada para servicio de produccion moderado.
- GPU consumer: cabe en RTX 4090 (24 GB) en BF16 con contexto moderado, y en RTX 3090, 4080 o incluso 3060 de 12 GB con cuantizacion de 4-8 bits. En CPU es viable con llama.cpp/Ollama a velocidades reducidas.
- Opciones de despliegue: transformers (>=4.51.0, requerido por la arquitectura qwen3), vLLM >=0.8.5, SGLang >=0.4.6.post1, TGI (tag endpoints_compatible) y, mediante conversion, llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor no publica mediciones. Como referencia cualitativa, un modelo denso de 4B en una RTX 4090 suele ofrecer decenas de tokens por segundo en BF16, pero no se dispone de cifras verificadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| CicadaAi/Qwen3-4B-heretic | 4,0B denso | 262.144 | Apache 2.0 | Decensurado via Heretic; 0/100 rechazos; KL 12,0564; sin benchmarks propios |
| Qwen/Qwen3-4B-Instruct-2507 | 4,0B denso | 262.144 | Apache 2.0 | Modelo base; 100/100 rechazos; benchmarks publicados (MMLU-Pro 69,6, GPQA 62,0) |
| Qwen/Qwen3-4B (non-thinking) | 4,0B denso | 32.768 (version original) | Apache 2.0 | Version previa; MMLU-Pro 58,0, GPQA 41,7 |
| GPT-4.1-nano | no disponible | no disponible | Propietaria | Referencia de la model card; MMLU-Pro 62,8, GPQA 50,3 |

La comparacion directa mas relevante es contra el modelo base, ya que comparten pesos salvo la ablation: cualquier diferencia de calidad en tareas distintas del rechazo debe medirse empiricamente, y la divergencia KL de 12,0564 sugiere una alteracion de distribucion no trivial.

## Limitaciones y advertencias

- El decensurado elimina los rechazos, pero no garantiza correccion factual: aumenta el riesgo de generar contenido danino, ilegal o inseguro sin advertencia.
- La divergencia KL de 12,0564 respecto al base indica una modificacion sustancial de la distribucion de salida; pueden degradarse capacidades no evaluadas (razonamiento, codigo, multilingue) sin que el autor lo haya medido.
- No hay benchmarks propios publicados: las cifras de la model card pertenecen al modelo base y no son extrapolables.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: no existe validacion de la comunidad ni reportes independientes de calidad.
- Idiomas soportados no documentados; el comportamiento multilingue tras la ablation es desconocido.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo sin filtros puede incumplir normativas sectoriales (por ejemplo, la Ley de Servicios Digitales de la UE o requisitos de moderacion en plataformas) y traslada al operador toda la responsabilidad legal sobre las salidas.
- Riesgo de alucinacion heredado del base y potencialmente agravado por la ablation; se recomienda verificacion factual en produccion.
- No soporta vision, audio ni modo thinking; no es adecuado para tareas que requieran cadena de pensamiento explicita.
- Requiere transformers >=4.51.0; versiones anteriores fallan con `KeyError: 'qwen3'`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CicadaAi/Qwen3-4B-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Licencia del base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- Proyecto Heretic: https://heretic-project.org
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Chat de Qwen: https://chat.qwen.ai
- Paper referenciado (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
