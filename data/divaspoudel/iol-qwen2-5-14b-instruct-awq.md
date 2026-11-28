# divaspoudel/iol-Qwen2.5-14B-Instruct-AWQ

## Resumen

`divaspoudel/iol-Qwen2.5-14B-Instruct-AWQ` es una cuantizacion AWQ de 4 bits del modelo `Qwen/Qwen2.5-14B-Instruct` de Alibaba Cloud, publicada por Divas Poudel (equipo `friedspaghetti`) como artefacto de su cuarta posicion en el IOL-AI Challenge, una competicion de razonamiento linguistico organizada por Cohere Labs y el jurado de la International Linguistics Olympiad. El modelo resuelve el problema de ejecutar un LLM de 14.700 millones de parametros dentro de una GPU NVIDIA T4 de 16 GB de VRAM con un presupuesto estricto de 30 minutos de reloj por conjunto de tareas.

La relevancia del artefacto no reside en un entrenamiento nuevo, sino en la combinacion de cuantizacion de pesos con una estrategia de asignacion dinamica de computo en inferencia (multiples temperaturas, numero variable de muestras por problema y votacion por mayoria con normalizacion de salidas), que logro una puntuacion de 17,91 frente a la linea base de los organizadores de 9,40. Es, por tanto, un ejemplo reproducible de como exprimir hardware modesto en tareas de razonamiento.

Arquitectonicamente es un transformer causal decoder-only de la familia Qwen2.5, con RoPE, SwiGLU, RMSNorm y sesgo en las proyecciones QKV, 48 capas y atencion con GQA (40 cabezas de consulta y 8 de clave-valor). El contexto nativo es de 131.072 tokens, aunque el `config.json` del repositorio esta configurado para 32.768 tokens y requiere activar YaRN para superar ese umbral.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Qwen2) con RoPE, SwiGLU, RMSNorm y sesgo QKV; GQA |
| Parametros totales | 14.770.033.664 (14,7B); 13,1B sin embeddings |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens nativos; `config.json` configurado a 32.768; generacion hasta 8.192 tokens |
| Tipos de cuantizacion | AWQ de 4 bits (unica incluida en el repo) |
| Idiomas soportados | Mas de 29 segun Qwen2.5 (chino, ingles, frances, espanol, portugues, aleman, italiano, ruso, japones, coreano, vietnamita, tailandes, arabe, entre otros); la model card no detalla el conjunto exacto para este artefacto |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); tamano del repo 10,0 GB |
| Capas | 48 |
| Cabezas de atencion | 40 Q / 8 KV (GQA) |
| Descargas / likes | 34 / 3 |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-14B-Instruct es un transformer decoder-only denso con 48 capas, normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con grouped-query attention (40 cabezas de consulta frente a 8 de clave-valor), lo que reduce el coste de la cache KV. Qwen2.5 se entrena en dos fases (pretraining y post-training) e incorpora mejoras sobre Qwen2 en conocimiento, codigo, matematicas, seguimiento de instrucciones, generacion de textos largos y salidas estructuradas como JSON. La model card no detalla el numero de tokens de entrenamiento ni la composicion del dataset.

La contribucion especifica de este repositorio es la cuantizacion AWQ de 4 bits, que comprime los 14,7B parametros hasta un peso de aproximadamente 9 GB en VRAM, dejando margen en una T4 de 16 GB para expandir la cache KV durante la decodificacion con multiples muestras. Sobre esa base, el pipeline del challenge sustituye la decodificacion greedy estatica por muestreo multi-temperatura, ajusta dinamicamente `max_new_tokens` y el numero de muestras segun el tiempo de reloj restante, y aplica normalizacion de formato seguida de votacion por mayoria sobre las trazas de razonamiento (descrito en la seccion 4.1 de arXiv:2608.18011). No se documenta RLHF ni DPO especifico para este artefacto mas alla del post-training heredado de Qwen2.5-Instruct.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`) y soporte de mensajes de sistema.
- Razonamiento linguistico y resolucion de problemas de logica del lenguaje, ambito para el que fue seleccionado en el IOL-AI Challenge.
- Codigo y matematicas, con mejoras atribuidas a modelos expertos especializados en el entrenamiento de Qwen2.5.
- Comprension y generacion de datos estructurados (tablas, JSON) y textos largos de mas de 8.000 tokens.
- Seguimiento de instrucciones robusto frente a diversidad de system prompts, util para role-play y definicion de condiciones en chatbots.
- Capacidades multilingues en mas de 29 idiomas, incluido el espanol.
- Contexto largo de hasta 131.072 tokens mediante YaRN (factor 4.0 sobre 32.768).
- No se documenta soporte nativo de tool calling, function calling, vision ni audio en la informacion disponible; el pipeline del challenge implementa razonamiento multi-paso mediante muestreo y votacion, no mediante agentes con herramientas.

## Casos de uso

- Razonamiento linguistico y puzzles: el modelo resuelve tareas de deduccion sobre gramaticas desconocidas usando el esquema de muestreo multi-temperatura y votacion por mayoria del challenge, adecuado porque agrega robustez frente a errores de formato en trazas largas.
- Despliegue en hardware de gama baja: sirve como LLM de 14B en una unica T4 de 16 GB gracias a los ~9 GB de pesos AWQ, escenario tipico de prototipos en la nube con GPU economicas.
- Atencion al cliente automatizada: gestiona conversaciones multi-turno con contexto de hasta 32.768 tokens sin YaRN, suficiente para historiales extensos e instrucciones de sistema detalladas.
- Generacion de codigo asistida: puede integrarse en pipelines de revision o generacion de parches donde el seguimiento de instrucciones y la salida estructurada en JSON son requisitos, aunque sin tool calling nativo documentado.
- Procesamiento de documentos largos: analisis de informes, contratos o transcripciones activando `rope_scaling` tipo YaRN para superar los 32.768 tokens, con la advertencia de que vLLM solo soporta YaRN estatico y puede degradar textos cortos.
- Extraccion de datos estructurados: conversion de texto libre a tablas o JSON en tareas de enriquecimiento de datos, aprovechando la mejora declarada de Qwen2.5 en comprension de estructuras.
- Evaluacion comparativa de cuantizaciones: como artefacto AWQ reproducible, sirve para medir la perdida de calidad frente al modelo en bf16 en tareas de razonamiento bajo restricciones de tiempo.

## Benchmarks y rendimiento

La model card no incluye resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar para este artefacto cuantizado. El unico dato de rendimiento publicado es el resultado del challenge:

| Metrica | Resultado |
|---|---|
| Puntuacion IOL-AI Challenge (equipo `friedspaghetti`) | 17,91 |
| Linea base de los organizadores | 9,40 |
| Posicion | 4 de 46 equipos |
| Hardware | 1x NVIDIA T4 (16 GB VRAM) |
| Presupuesto de tiempo | 30 minutos de reloj |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9 GB solo para pesos AWQ de 4 bits; el resto hasta 16 GB queda para cache KV y activaciones.
- GPU validadas en el challenge: NVIDIA T4 (16 GB). Cabe tambien en RTX 4090 (24 GB), RTX 3090 (24 GB), A10G (24 GB), L4 (24 GB), A100 (40/80 GB) y H100.
- En GPUs de consumo de 8 GB o menos no cabe con comodidad; en 12 GB (RTX 3060, RTX 4070) el margen para cache KV es muy limitado con contexto largo.
- Despliegue: `transformers` (version igual o superior a 4.37.0, necesario para evitar `KeyError: 'qwen2'`), vLLM recomendado por Qwen para produccion, y text-generation-inference segun los tags del repositorio. No se documenta soporte GGUF ni Ollama en este repositorio.
- Latencia y throughput: no disponibles de forma numerica; el unico dato es que el pipeline completo de multiples muestras y votacion por mayoria cabe en 30 minutos de reloj por conjunto de tareas en una T4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| divaspoudel/iol-Qwen2.5-14B-Instruct-AWQ | 14,7B | 131.072 (32.768 en config) | AWQ 4 bits | Apache 2.0 | Artefacto de competicion con pipeline de inferencia documentado |
| Qwen/Qwen2.5-14B-Instruct | 14,7B | 131.072 | bf16/fp16 | Apache 2.0 | Modelo base sin cuantizar; mayor VRAM (~28 GB en bf16) |
| Qwen/Qwen2.5-14B-Instruct-AWQ | 14,7B | 131.072 | AWQ 4 bits | Apache 2.0 | Cuantizacion oficial de Qwen; referencia directa de calidad |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 131.072 | bf16, AWQ, GPTQ | Apache 2.0 | Alternativa mas ligera para GPUs de 12-16 GB con menor capacidad de razonamiento |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion AWQ de 4 bits introduce perdida de precision respecto al modelo en bf16; no se documenta la degradacion medida en benchmarks.
- Riesgo de alucinacion inherente a los LLM de esta escala, especialmente en tareas de razonamiento linguistico donde el pipeline del challenge compensa con votacion por mayoria, no con verificacion factual.
- El `config.json` limita el contexto a 32.768 tokens; usar los 131.072 requiere activar YaRN manualmente, y en vLLM el factor es estatico, lo que puede perjudicar textos cortos.
- La model card menciona por error "72B" en un parrafo al describir el repositorio; el dato correcto, confirmado por safetensors, es 14,7B.
- La lista exacta de idiomas soportados por este artefacto no esta verificada; la cifra de 29 proviene del modelo base.
- No se documenta soporte de tool calling, agentes con herramientas, vision ni audio; quien los necesite debe verificar empiricamente el comportamiento del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el artefacto se publica como envio de competicion con 34 descargas; no hay garantias de mantenimiento ni soporte.
- El pipeline de inferencia del challenge depende de presupuesto temporal y multiples muestras, lo que multiplica el coste computacional frente a una decodificacion greedy simple.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divaspoudel/iol-Qwen2.5-14B-Instruct-AWQ
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Paper del IOL-AI Challenge: https://arxiv.org/pdf/2608.18011
- Paper de YaRN: https://arxiv.org/abs/2309.00071
- Paper de Qwen2 (referencia tecnica): https://arxiv.org/abs/2407.10671
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Documentacion de AWQ en Qwen: https://qwen.readthedocs.io/en/latest/quantization/awq.html
- Documentacion de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html
