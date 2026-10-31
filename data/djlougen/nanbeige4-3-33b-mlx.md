# DJLougen/Nanbeige4.3-33B-MLX

## Resumen

Nanbeige4.3-33B-MLX es una conversión cuantizada para el framework MLX (Apple Silicon) del modelo Nanbeige4.3-33B, desarrollado por el equipo de Nanbeige. El modelo original es un modelo de razonamiento (reasoning model) denso de 33B parámetros con arquitectura Llama, y esta conversión ha sido realizada por el usuario DJLougen con mlx-lm 0.31.3. El repositorio incluye cinco variantes de cuantización (bf16, 8bit, 6bit, 4bit y mixed_2_6), con tamaños que van desde 13,1 GB hasta 66,2 GB.

El problema que resuelve esta ficha de modelo es doble: por un lado, pone a disposición de usuarios de Mac un modelo de razonamiento de 33B parámetros ejecutable localmente en Apple Silicon; por otro, documenta con rigor inusual las métricas de degradación de cada cuantización (KL divergencia y acuerdo top-1 frente a bf16), lo que permite elegir variante con datos medidos y no con estimaciones. Destaca el dato de rendimiento medido: la variante 4bit alcanza 13,9 tok/s en un MacBook Pro de 36 GB.

Es relevante ahora porque los modelos de razonamiento densos de tamaño medio son difíciles de ejecutar en hardware de consumo, y las conversiones MLX con documentación cuantitativa de calidad son escasas. El modelo piensa por defecto (etiquetas `<think> ... </think>` antes de la respuesta), un comportamiento típico de los modelos de razonamiento recientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, arquitectura Llama, 52 capas, 8 KV heads |
| Parametros totales | 33B |
| Parametros activos | no disponible (no es MoE; es un modelo denso) |
| Longitud de contexto | 524.288 posiciones (según config del modelo) |
| Tipos de cuantizacion | bf16 (16,00 bpw), 8bit (8,50 bpw), 6bit (6,50 bpw), 4bit (4,50 bpw), mixed_2_6 (3,163 bpw) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato MLX) |

## Arquitectura y entrenamiento

Nanbeige4.3-33B es un modelo denso (no MoE) basado en la arquitectura Llama, con 52 capas y 8 KV heads, lo que sugiere el uso de grouped-query attention (GQA) para reducir el coste de la caché KV. La configuración del modelo permite 524.288 posiciones de contexto, una ventana extremadamente amplia para un modelo de este tamaño. Según la conversión MLX, la caché KV en bf16 consume aproximadamente 200 KiB por token, lo que implica un coste de memoria KV notablemente alto y limita en la práctica el contexto utilizable en portátiles.

Sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no hay información disponible en la documentación proporcionada. Lo que sí se conoce es su comportamiento de razonamiento: el modelo genera por defecto un bloque de pensamiento delimitado por `<think> ... </think>` antes de la respuesta final, y este modo puede desactivarse mediante `--chat-template-config '{"enable_thinking": false}'`.

La innovación principal de este repositorio no está en la arquitectura del modelo sino en su proceso de cuantización y evaluación: cada variante se ha validado midiendo la divergencia KL frente a bf16 en 8.192 tokens (16 secuencias de 512 tokens) y el acuerdo top-1, con etiquetas de calidad derivadas de esos datos (PERFECT ≥ 95 % de acuerdo, GREAT ≥ 80 %, GOOD ≥ 50 %).

## Capacidades

- Generación de texto con razonamiento explícito: el modelo produce por defecto un bloque de razonamiento `<think> ... </think>` antes de la respuesta, útil para tareas que requieren descomposición de problemas.
- Modo de respuesta directa: el razonamiento puede desactivarse mediante la configuración de la plantilla de chat (`enable_thinking: false`), reduciendo la latencia y el consumo de tokens.
- Ventana de contexto teórica de 524.288 tokens, aunque el uso práctico está limitado por el consumo de la caché KV (~200 KiB/token en bf16).
- Capacidades de código, matemáticas o tool calling: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Razonamiento local en Apple Silicon: ejecutar tareas de razonamiento complejas (lógica, planificación, resolución de problemas paso a paso) completamente offline en un Mac, sin depender de APIs externas, gracias a la conversión MLX nativa.
- Asistente de escritorio con privacidad total: la variante 4bit (18,6 GB, pico medido de 17,5 GiB) cabe en un MacBook Pro de 36 GB, permitiendo procesar documentos o conversaciones sensibles sin que los datos salgan del equipo.
- Análisis de documentos largos: con 524.288 tokens de contexto teórico, el modelo puede ingerir documentos extensos, aunque en un portátil de 36 GB el techo práctico medido es de ~16K tokens antes de agotar memoria.
- Selección de cuantización basada en datos: para investigadores que estudian el impacto de la cuantización en modelos de razonamiento, el repositorio ofrece métricas KL y de acuerdo top-1 por variante, útiles como referencia empírica.
- Generación de texto con control de latencia: desactivando el modo thinking, el modelo responde directamente, adecuado para interfaces conversacionales donde el retardo del bloque de razonamiento no es aceptable.
- Prototipado de aplicaciones con mlx-lm: la integración con `mlx_lm.generate` y la estructura de subcarpetas por variante facilitan probar diferentes puntos de equilibrio calidad/tamaño en un mismo pipeline.
- Evaluación comparativa de degradación: las mediciones de prefill y decode tok/s con prompts de 2K a 16K tokens sirven como referencia para planificar despliegues en hardware Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) del modelo base en la información disponible. Sí se han publicado mediciones de calidad de cuantización y de rendimiento de inferencia:

| Variante | Tamaño (GB) | bpw | KL vs bf16 | Acuerdo top-1 | Pico (GiB) | Gen tok/s (DGX Spark) |
|---|---|---|---|---|---|---|
| bf16 | 66,24 | 16,000 | 0,0000 | 100,0 % | 61,80 | 3,68 |
| 8bit | 35,19 | 8,500 | 0,0064 | 97,07 % | 32,88 | 6,38 |
| 6bit | 26,91 | 6,500 | 0,0365 | 93,05 % | 25,17 | 7,83 |
| 4bit | 18,63 | 4,500 | 0,1679 | 82,5 % | 17,5 | no disponible |
| mixed_2_6 | 13,10 | 3,163 | 1,1191 | 58,1 % | 12,3 | no disponible |

Rendimiento de la variante 4bit en un MacBook Pro de 36 GB (KV cache bf16, prefill chunk 512, greedy, mediana de 2-3 ejecuciones):

| Prompt | TTFT | Prefill tok/s | Decode tok/s | Pico memoria (GiB) |
|---|---|---|---|---|
| 2K | 15 s | 135 | 14,3 | 18,24 |
| 4K | 32 s | 126 | 13,0 | 18,59 |
| 8K | 68 s | 121 | 12,3 | 19,46 |
| 16K | 148 s | 110 | 11,4 | 20,98 |

## Requisitos de hardware

- VRAM/memoria unificada estimada por variante (pico medido en MLX): bf16 ~61,8 GiB; 8bit ~32,9 GiB; 6bit ~25,2 GiB; 4bit ~17,5 GiB; mixed_2_6 ~12,3 GiB.
- En Mac: la variante 4bit funciona en un MacBook Pro de 36 GB con ~16K tokens de contexto práctico como techo (con aplicaciones habituales abiertas). La variante mixed_2_6 (13,1 GB) es la opción degradada para equipos con menos memoria.
- En GPU NVIDIA: bf16 requiere del orden de 64 GB (A100/H100 80 GB o DGX Spark, donde se midieron los picos); 8bit cabe en una A100 de 40 GB; 6bit y 4bit podrían caber en una RTX 4090 de 24 GB la 4bit, aunque no hay mediciones publicadas para esa GPU.
- La cuantización de la caché KV a 8 bits (`kv_bits=8`) no redujo el pico de memoria en las pruebas realizadas (21,16 frente a 20,98 GiB a 16K) y fue más lenta, por lo que no se recomienda.
- Despliegue: mediante mlx-lm (`pip install mlx-lm`, `mlx_lm.generate`). No hay menciones a vLLM, llama.cpp, Ollama o TGI en la documentación; al ser formato MLX, la vía soportada es el ecosistema MLX en Apple Silicon.
- Latencia medida (4bit, MacBook Pro 36 GB): 13,9 tok/s de decode en condiciones nominales, cayendo a 11,4 tok/s con prompts de 16K; el tiempo al primer token crece de 15 s (2K) a 148 s (16K) por el coste del prefill.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B (base) | 33B | Denso, Llama, 52 capas, 8 KV heads | 524.288 | Apache 2.0 | HuggingFace (Nanbeige/Nanbeige4.3-33B) |
| Nanbeige4.3-33B-MLX (esta ficha) | 33B | Denso, cuantizado (3,16-16,00 bpw) | 524.288 | Apache 2.0 | HuggingFace (DJLougen), formato MLX |
| Qwen3-32B | 32B | Denso | no disponible | Apache 2.0 | HuggingFace, GGUF, MLX |
| QwQ-32B | 32B | Denso, reasoning | no disponible | Apache 2.0 | HuggingFace, GGUF, MLX |

Nanbeige4.3-33B compite en la categoría de modelos densos de razonamiento de ~32-33B parámetros con licencia Apache 2.0, donde Qwen3-32B y QwQ-32B son las alternativas más asentadas, con un ecosistema de cuantizaciones más amplio (GGUF, AWQ, GPTQ además de MLX). La ventaja diferencial de esta conversión es su documentación empírica de calidad por variante; su limitación es que solo está disponible en formato MLX, restringida a Apple Silicon. Datos de rendimiento comparativo entre estos modelos: no disponible.

## Limitaciones y advertencias

- Degradación por cuantización: la variante mixed_2_6 tiene una divergencia KL 6,7 veces superior a la de 4bit y solo un 58,1 % de acuerdo top-1 con bf16; debe tratarse como opción degradada exclusivamente para cuando 4bit no quepa en memoria.
- La variante 4bit, aunque etiquetada como GREAT, presenta un 82,5 % de acuerdo top-1 con bf16, lo que puede traducirse en respuestas distintas a las del modelo original en casos límite.
- Contexto práctico reducido en portátiles: pese a los 524.288 tokens de contexto teórico, en un MacBook Pro de 36 GB el techo práctico medido es de ~16K tokens, debido a un coste de caché KV de ~200 KiB/token en bf16.
- Prefill lento: con prompts largos el tiempo al primer token se dispara (148 s a 16K tokens), lo que limita el uso interactivo con documentos extensos.
- Sesgos conocidos, riesgo de alucinación y capacidades multilingües del modelo base: no disponible en la información proporcionada; se recomienda consultar la model card de Nanbeige/Nanbeige4.3-33B.
- Uso comercial: la licencia Apache 2.0 lo permite, aunque la conversión MLX es de un tercero (D JLougen), no del equipo oficial de Nanbeige, que pide acreditar el modelo original si se redistribuyen las conversiones.
- Repositorio con 0 descargas registradas en el momento de la ficha y mantenimiento dependiente de un autor individual; verificar la revisión del modelo base (`c1093c5`) al integrar en producción.

## Enlaces

- Repositorio MLX cuantizado: https://huggingface.co/DJLougen/Nanbeige4.3-33B-MLX
- Modelo base oficial: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Variante bf16: https://huggingface.co/DJLougen/Nanbeige4.3-33B-MLX/tree/main/bf16
- Variante 8bit: https://huggingface.co/DJLougen/Nanbeige4.3-33B-MLX/tree/main/8bit
- Variante 6bit: https://huggingface.co/DJLougen/Nanbeige4.3-33B-MLX/tree/main/6bit
- Variante 4bit: https://huggingface.co/DJLougen/Nanbeige4.3-33B-MLX/tree/main/4bit
- Variante mixed_2_6: https://huggingface.co/DJLougen/Nanbeige4.3-33B-MLX/tree/main/mixed_2_6
- Autor de la conversión (X): https://x.com/DJLougen
- Apoyo al autor (Ko-fi): https://ko-fi.com/djlougen
