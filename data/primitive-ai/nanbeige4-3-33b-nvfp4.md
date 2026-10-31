# primitive-ai/Nanbeige4.3-33B-NVFP4

## Resumen

Nanbeige4.3-33B-NVFP4 es una versión cuantizada en formato NVFP4 (pesos y activaciones a 4 bits) del modelo Nanbeige4.3-33B, publicado por primitive-ai, una empresa especializada en builds cuantizados optimizados para inferencia en GPU única. El modelo base, desarrollado por Nanbeige, es un LLM denso de 33.118.977.024 parámetros (52 bloques decodificador, arquitectura tipo Llama) orientado a razonamiento, uso agéntico y tool calling en inglés y chino.

La relevancia de este build radica en su eficiencia: reduce el tamaño del modelo de 66,24 GB en BF16 a 22,07 GB, lo que permite servirlo en una sola GPU de 96 GB (como la RTX PRO 6000 Blackwell) con una ventana de contexto de hasta 131.072 tokens en vLLM y un pool de KV cache de 326.144 tokens a ventana de 32.768. El rendimiento medido por el autor alcanza 53,8 tok/s en streaming único y 336 tok/s con concurrencia 32, frente a 20,1 y 129 tok/s del original en BF16.

La cuantización NVFP4 (pesos E2M1 con escalas E4M3 por cada 16 valores y escala global FP32, activaciones NVFP4 en runtime calibradas) introduce una deriva de +64,3×10⁻³ nats por token frente a BF16, con un acuerdo top-1 del 93,7 %, manteniendo puntuaciones de conocimiento (89,0) y tool calling (78,8) muy cercanas al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (52 bloques decodificador) |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 524.288 tokens (ventana nativa del modelo base) |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos E2M1, escala E4M3 por 16 valores, escala global FP32; embeddings, LM head y normas en BF16) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base Nanbeige4.3-33B es un transformer decoder-only denso de 52 bloques, con arquitectura tipo Llama. Este repositorio no modifica la arquitectura: aplica cuantizacion NVFP4 a todas las capas lineales de los 52 bloques. Los pesos usan formato E2M1 (4 bits) con una escala E4M3 por cada grupo de 16 valores y una escala global en FP32; las activaciones se cuantizan a NVFP4 en runtime contra una escala global calibrada. Embeddings, LM head y capas de normalizacion permanecen en BF16 para preservar la estabilidad numerica.

Sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) no se ha publicado informacion en la documentacion disponible. Los tags del repositorio indican que el modelo esta orientado a razonamiento (reasoning), uso agéntico y tool calling, y el build se sirve con parsers de razonamiento estilo Qwen3 (`--reasoning-parser qwen3`) y parser de tool calls `qwen3_coder`, lo que sugiere un formato de salida compatible con esos esquemas. El modelo soporta un modo de pensamiento desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento con modo thinking activable o desactivable (`enable_thinking`), con parser que separa el razonamiento de la respuesta final.
- Tool calling / function calling nativo, verificado por el autor con llamadas parseadas correctamente (por ejemplo, `get_weather {"city": "Lisbon"}`).
- Orientacion agéntica: los tags incluyen "agentic" y el build se despliega con `--enable-auto-tool-choice` en vLLM.
- Capacidad de abstencion evaluada (64,2 en la suite del autor), util para agentes que deben decidir cuando no responder.
- Contexto muy largo: hasta 524.288 tokens de ventana nativa; el build se ha verificado a 131.072 tokens en vLLM.
- Finalizacion fiable dentro de presupuestos de tokens: 99,1 % de las respuestas terminan dentro del limite en las pruebas del autor.
- No hay indicios de capacidades multimodales (vision, audio); es un modelo de texto.

## Casos de uso

- Atencion al cliente automatizada: con hasta 131.072 tokens verificables de contexto (y 524.288 nativos), puede gestionar conversaciones multi-turno largas con historiales extensos, documentos adjuntos y memoria de sesion sin perder coherencia.
- Agentes con llamadas a herramientas: el soporte de tool calling verificado y el despliegue con `--enable-auto-tool-choice` lo hacen adecuado para pipelines agénticos que consultan APIs, bases de datos o servicios externos en varios pasos.
- Razonamiento y resolucion de problemas: el modo thinking permite respuestas con cadena de razonamiento explicita, util para analisis, planificacion y tareas de logica; el parser lo separa de la respuesta final para interfaces de usuario limpias.
- Despliegue en GPU unica de alto throughput: con 336 tok/s a concurrencia 32 en una sola tarjeta de 96 GB, es idoneo para servir equipos o servicios con trafico moderado sin necesidad de multi-GPU ni tensor parallelism.
- Procesamiento de documentos extensos en chino e ingles: resumen, extraccion de datos y preguntas y respuestas sobre informes, contratos o documentacion tecnica gracias a la ventana de contexto nativa.
- Sistemas con presupuesto de tokens estricto: el 99,1 % de respuestas completadas dentro del presupuesto de 16.384 tokens lo hace fiable para flujos con limites de salida definidos.
- Complemento de abstencion en agentes criticos: su puntuacion de abstencion (64,2) permite configurar comportamientos de "no responder" ante preguntas fuera de dominio.

## Benchmarks y rendimiento

No se han publicado benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica su propia suite de evaluacion (protocolo fijo, auto-puntuado sin LLM judge, temperature 0.6 / top_p 0.95 / top_k 20, thinking activado, presupuesto de 16.384 tokens, concurrencia 32) sobre 1.170 items de conocimiento y 200 de tool calling:

| build | formato | tamano | drift (×10⁻³ nats/token) | acuerdo top-1 | conocimiento | tool call | abstencion | finalizado | tok/s @1 | tok/s @32 | pool KV (tokens) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Nanbeige4.3-33B (BF16) | BF16 | 66,24 GB | 0 (referencia) | 100 % | 89,7 | 80,8 | 63,3 | 99,2 % | 20,1 | 129 | 113.648 |
| FP8 | FP8 W8A8 | 35,53 GB | +5,95 | 97,9 % | 89,3 | 80,4 | 63,3 | 99,1 % | 35,4 | 225 | 262.448 |
| Mixed NVFP4/FP8 | NVFP4 + FP8 en 216 modulos | 25,30 GB | +38,89 | 95,1 % | 88,9 | 79,0 | 63,3 | 99,1 % | 48,0 | 308 | 311.488 |
| **Este repo (NVFP4)** | NVFP4 W4A4 | 22,07 GB | +64,28 | 93,7 % | 89,0 | 78,8 | 64,2 | 99,1 % | 53,8 | 336 | 326.144 |

Condiciones de medida: una RTX PRO 6000 Blackwell de 96 GB, sin tensor parallelism, vLLM 0.32.0, KV cache en BF16, throughput medido con 8K tokens de entrada y 512 de salida, sin prefix cache, dos semillas por celda. No se han medido el rendimiento de la cuantizacion mas alla de 32K de contexto ni otras GPUs.

## Requisitos de hardware

- VRAM para inferencia: 22,07 GB de pesos (20,92 GiB cargados en runtime); con ventana de 131.072 tokens y `gpu-memory-utilization 0.92`, el pool de KV alcanza 313.584 tokens en una tarjeta de 96 GB. Con ventana de 32.768 tokens, el pool sube a 326.144 tokens.
- GPU verificada: RTX PRO 6000 Blackwell de 96 GB (sm_120). No se han probado otras GPUs segun el autor. Al ser un formato NVFP4 con activaciones cuantizadas, se requiere hardware compatible con el formato (arquitectura Blackwell o soporte NVFP4 en vLLM); no hay datos de funcionamiento en Ampere, Ada o Hopper.
- Consumer GPUs: no hay datos; los 22,07 GB de pesos exceden la VRAM de la mayoria de tarjetas de consumo (RTX 4090: 24 GB, muy justo sin KV cache), y el formato NVFP4 esta pensado para hardware reciente. No se puede confirmar viabilidad en consumer GPU.
- Despliegue: vLLM (version 0.32.0 verificada, imagen `vllm/vllm-openai:v0.32.0`) con `--reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder`. No hay soporte documentado para llama.cpp, Ollama o TGI (el formato compressed-tensors NVFP4 es especifico de vLLM).
- Latencia y throughput medidos: 53,8 tok/s por stream y 336 tok/s a concurrencia 32 (8K in / 512 out, sin prefix cache). Arranque del servidor: 191 s.
- Tensor parallelism no necesario: verificado en una sola GPU sin paralelismo.

## Comparativa con modelos similares

Comparativa basada en la tabla de modelos cuantizados del propio autor, medidos con el mismo protocolo (1.370 items, auto-puntuados, sin LLM judge):

| modelo | forma | tamano | overall | conocimiento | tool call | abstencion | finalizado |
|---|---|---|---|---|---|---|---|
| Nanbeige4.3-33B-NVFP4 (este repo) | 33 B denso | 22,07 GB | no disponible | 89,0 | 78,8 | 64,2 | 99,1 % |
| Laguna-XS-2.1 (mixed NVFP4/MXFP8) | 31 B MoE | 19,3 GiB | 81,7 | 83,8 | 68,4 | 73,5 | 98,9 % |
| Nemotron-3.5-Lightning-30B-A3B (mixed INT4/INT8) | 30 B MoE+Mamba | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Notas: Laguna-XS-2.1, aunque mas pequeño y con mejor abstencion, queda por detras de Nanbeige4.3-33B-NVFP4 en conocimiento y tool calling segun el protocolo del autor. Los datos de Nemotron-3.5-Lightning-30B-A3B aparecen truncados en la documentacion disponible. Como alternativas de categoria similar (33 B densos razonadores con tool calling), cabria mencionar Qwen3-32B, pero no hay datos comparativos publicados en la informacion proporcionada.

## Limitaciones y advertencias

- Deriva de cuantizacion: +64,3×10⁻³ nats por token frente a BF16, con acuerdo top-1 del 93,7 %. Es el build con mayor degradacion de la familia (FP8: +5,95 y 97,9 %); para tareas maximamente sensibles, considerar el build FP8 o el mixed NVFP4/FP8.
- Contexto sin verificar mas alla de 32K: aunque la ventana nativa es de 524.288 tokens, el autor no midio el comportamiento de las capas cuantizadas en contextos largos; usar contextos muy extensos conlleva riesgo no cuantificado.
- Hardware limitado: solo verificado en RTX PRO 6000 Blackwell (sm_120). El formato NVFP4 con activaciones cuantizadas requiere soporte de hardware y de vLLM; no hay garantias en otras arquitecturas de GPU.
- Formato restringido a vLLM: no hay pesos GGUF ni compatibilidad documentada con llama.cpp, Ollama o TGI, lo que limita las opciones de despliegue.
- Idiomas: solo ingles y chino; el rendimiento en otros idiomas, incluido el castellano, no esta documentado y probablemente sea inferior.
- Sin datos de benchmarks estandar publicos (MMLU, HumanEval, etc.) ni informacion sobre el proceso de alineacion del modelo base (RLHF/DPO), por lo que los riesgos de alucinacion y sesgos heredados del modelo base no pueden evaluarse desde la documentacion disponible.
- La puntuacion de abstencion (64,2) indica que el modelo falla en torno a un tercio de los casos donde deberia abstenerse, algo a considerar en aplicaciones criticas.
- Licencia Apache 2.0: sin restricciones de uso comercial relevantes, aunque los terminos del modelo base Nanbeige4.3-33B deben revisarse para usos productivos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/primitive-ai/Nanbeige4.3-33B-NVFP4
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Version FP8 del mismo autor: https://huggingface.co/primitive-ai/Nanbeige4.3-33B-FP8
- Version mixed NVFP4/FP8: https://huggingface.co/primitive-ai/Nanbeige4.3-33B-mixed-NVFP4-FP8
- Modelo comparado Laguna-XS-2.1: https://huggingface.co/primitive-ai/Laguna-XS-2.1-mixed-NVFP4-MXFP8
- Modelo comparado Nemotron-3.5-Lightning-30B-A3B: https://huggingface.co/primitive-ai/Nemotron-3.5-Lightning-30B-A3B-mixed-INT4-INT8
- Web del autor: https://primitive.com
