# nace-ai/Qwen3.5-9B-GGUF-KQuant

## Resumen

Qwen3.5-9B-GGUF-KQuant es una colección de cuantizaciones GGUF del modelo Qwen3.5-9B (desarrollado por Alibaba Qwen), publicada por el usuario nace-ai bajo licencia Apache 2.0. No se trata de un modelo nuevo, sino de una reempaquetación optimizada del modelo base en formato GGUF para su uso con llama.cpp, LM Studio y Ollama, con pesos que van desde 3,36 GB hasta 6,84 GB. El modelo base cuenta con 8.953.803.264 parámetros (aproximadamente 9B) y está orientado a generación de texto conversacional.

La relevancia de esta publicación radica en su metodología de cuantización: el autor reporta métricas de divergencia KL frente al modelo BF16 de referencia para cada fichero, y demuestra que sus cuantizaciones quedan más cerca del modelo original que alternativas de otros publicadores (bartowski, Unsloth, byteshape) en tamaños comparables o incluso menores. Esto es especialmente relevante para despliegues en hardware con VRAM limitada, donde cada décima de GB cuenta.

El repositorio incluye doce ficheros con mezclas de tipos de tensor de 2,1 a 8,5 bits por peso, todos compatibles con llama.cpp estándar, además de evaluaciones a contexto de 512 tokens y 128K tokens sobre texto de Wikipedia, chat, tool-calls y código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-9B, transformer presumiblemente; no confirmado en la informacion) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 128K tokens (evaluado a 128K en la model card) |
| Tipos de cuantizacion | GGUF: IQ2_M, IQ3_XXS, IQ3_M, IQ4_XS (varias tallas), Q4_0, Q3_K_XL, Q4_K_M, Q5_K_S, Q6_K (mezclas de tensores de 2,1 a 8,5 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp, LM Studio, Ollama) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna ni el proceso de entrenamiento del modelo base Qwen3.5-9B en la documentación proporcionada. La model card de esta publicación se centra exclusivamente en el proceso de cuantización y evaluación de los ficheros GGUF, no en el entrenamiento del modelo original.

La innovación técnica destacable de esta publicación es la metodología de cuantización mixta: cada fichero combina tipos de tensor de distintos bits por peso en lugar de usar un único tipo de llama.cpp. Por ejemplo, `IQ2_M` (3,36 GB) está compuesto por un 90% de IQ3_XXS, 7% de IQ2_XXS y 3% de otros tipos; `Q3_K_XL` (4,70 GB) mezcla 69% IQ4_XS, 16% Q5_K, 14% IQ3_XXS y 1% de otros. El autor reporta métricas de divergencia KL (mean KL y p99.9 KL) y precisión top-1 frente al modelo BF16, evaluadas sobre texto independiente (Wikipedia en inglés, chat, tool-calls y código de GitHub creados después del 2026-09-20), con 64 ventanas de 32.704 tokens y la misma build de llama.cpp (0a94a3f2) para todos los ficheros.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Soporte de tool calling / function calling: la evaluación incluye datos de chat y tool-calls, lo que indica que el modelo base maneja este formato.
- Razonamiento multi-turno: el modelo base está orientado a conversación.
- Capacidades multilingües: no confirmadas en la información disponible.
- Capacidades de código: la evaluación incluye código de GitHub y muestra buen rendimiento en ese dominio (KL de 0,041 para Q3_K_XL a 128K en código).
- No se documentan capacidades de visión, audio ni thinking mode en la información proporcionada, aunque el autor menciona que los pesos de visión y MTP están excluidos de las mediciones de tamaño.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: los ficheros de 3,36 a 6,84 GB permiten ejecutar un modelo de ~9B parámetros en GPUs con 8-12 GB de VRAM, usando llama.cpp, LM Studio u Ollama, sin necesidad de infraestructura en la nube.
- Asistentes conversacionales con contexto largo: la evaluación a 128K tokens y el buen comportamiento en chat y tool-calls permiten construir asistentes que mantengan conversaciones extensas con historial completo, usando el fichero IQ3_M o Q3_K_XL como equilibrio entre tamaño y fidelidad.
- Generación y asistencia de código en IDE: el rendimiento medido en código (KL de 0,041 a 128K para Q3_K_XL, top-1 del 95%) lo hace adecuado para autocompletado y generación de código integrada en editores mediante llama.cpp.
- Pipelines de CI/CD con tool calling: al soportar function calling, puede integrarse como agente que invoque herramientas en flujos automatizados, usando el fichero Q4_K_M-6.2GB para mayor fidelidad.
- Prototipado rápido de aplicaciones de IA: la disponibilidad de doce tallas permite empezar con IQ2_M (3,36 GB) en hardware modesto y escalar a Q6_K (6,84 GB) cuando haya más recursos, sin cambiar de modelo.
- Evaluación comparativa de cuantizaciones: los datos de KL y top-1 publicados permiten a investigadores seleccionar el fichero con el mejor compromiso tamaño/fidelidad para su caso concreto, algo poco habitual en publicaciones GGUF.
- Servicio de texto en entornos con restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Benchmarks y rendimiento

La model card proporciona métricas de divergencia KL y precisión top-1 frente al modelo BF16, no benchmarks estándar (MMLU, HumanEval, GSM8K). Se presentan a continuación los datos publicados.

A 512 tokens (media sobre prosa, chat y código):

| Fichero | LM GB | Mean KL | p99.9 KL | Top-1 % | Baseline (GB, mean KL) | Gap KL (IC 95%) |
|---|---:|---:|---:|---:|---|---|
| IQ2_M | 3,36 | 0,238 | 14,890 | 83,0 | bartowski IQ2_S (3,47; 0,372) | −0,134 (−0,156 a −0,115) |
| IQ3_M | 4,39 | 0,134 | 14,399 | 87,9 | bartowski IQ3_XS (4,55; 0,147) | −0,013 (−0,028 a −0,003) |
| Q3_K_XL | 4,70 | 0,095 | 12,879 | 92,4 | bartowski IQ3_M (4,71; 0,142) | −0,047 (−0,062 a −0,035) |

Otras tallas a 512 tokens:

| Fichero | LM GB | Bits/peso | Mean KL | p99.9 KL | Top-1 % |
|---|---:|---:|---:|---:|---:|
| IQ3_XXS | 3,78 | 3,38 | 0,178 | 15,644 | 87,2 |
| IQ4_XS-4.1GB | 4,13 | 3,69 | 0,155 | 14,761 | 86,6 |
| Q4_0-4.6GB | 4,60 | 4,11 | 0,118 | 15,024 | 89,0 |
| IQ4_XS | 5,06 | 4,52 | 0,075 | 12,889 | 93,7 |
| IQ4_XS-5.2GB | 5,16 | 4,61 | 0,063 | 11,830 | 94,6 |
| IQ4_XS-5.5GB | 5,30 | 4,74 | 0,059 | 11,580 | 94,7 |
| Q4_K_M-6.2GB | 5,90 | 5,27 | 0,053 | 11,428 | 95,4 |
| Q5_K_S-6.3GB | 6,29 | 5,62 | 0,038 | 9,791 | 96,8 |
| Q6_K-7.1GB | 6,84 | 6,11 | 0,034 | 9,495 | 97,2 |

A 128K tokens, por dominio:

| Fichero | LM GB | Dominio | Mean KL | p99.9 KL | Top-1 % |
|---|---:|---|---:|---:|---:|
| IQ2_M | 3,36 | chat/tool | 1,300 | 27,630 | 79,1 |
| IQ3_M | 4,39 | chat/tool | 1,051 | 28,280 | 83,8 |
| Q3_K_XL | 4,70 | chat/tool | 0,846 | 26,729 | 86,9 |
| IQ2_M | 3,36 | código | 0,142 | 10,646 | 88,5 |
| IQ3_M | 4,39 | código | 0,074 | 8,650 | 92,1 |
| Q3_K_XL | 4,70 | código | 0,041 | 7,672 | 95,0 |
| IQ2_M | 3,36 | prosa | 0,401 | 22,877 | 77,8 |
| IQ3_M | 4,39 | prosa | 0,235 | 21,392 | 84,4 |
| Q3_K_XL | 4,70 | prosa | 0,846* | 26,729* | 86,9* |

(*) El dato de Q3_K_XL en prosa aparece truncado en la información proporcionada; no se dispone del valor completo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero más el overhead de contexto KV cache. Para IQ2_M (3,36 GB) se estiman ~4-5 GB con contexto moderado; para Q6_K (6,84 GB) se estiman ~8-9 GB. A 128K de contexto, la KV cache añade varios GB adicionales (no cuantificados en la información disponible).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para ficheros de 3-7 GB con contexto moderado; A100/H100 para contexto completo de 128K con ficheros grandes.
- Cabe en GPU de consumo: sí, todos los ficheros caben en GPUs consumer de 8 GB o más (los más pequeños en 6-8 GB; los mayores en 12-16 GB).
- Opciones de despliegue: llama.cpp (build 0a94a3f2 usada en la evaluación), LM Studio, Ollama, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo / publicador | Tamaño LM | Mean KL (512 tok) | Contexto evaluado | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| Nace IQ2_M | 3,36 GB | 0,238 | 128K | Apache 2.0 | GGUF |
| bartowski IQ2_S | 3,47 GB | 0,372 | no disponible | Apache 2.0 (heredada) | GGUF |
| byteshape IQ3_S-3.00bpw | 3,36 GB | no disponible | no disponible | no disponible | GGUF |
| Nace IQ3_M | 4,39 GB | 0,134 | 128K | Apache 2.0 | GGUF |
| Unsloth Q3_K_S | 4,31 GB | no disponible | no disponible | no disponible | GGUF |
| bartowski IQ3_XS | 4,55 GB | 0,147 | no disponible | Apache 2.0 (heredada) | GGUF |
| Nace Q3_K_XL | 4,70 GB | 0,095 | 128K | Apache 2.0 | GGUF |
| bartowski IQ3_M | 4,71 GB | 0,142 | no disponible | Apache 2.0 (heredada) | GGUF |
| Unsloth Q3_K_M | 4,66 GB | no disponible | no disponible | no disponible | GGUF |

El autor reporta que, a 512 tokens, cada fichero Nace tiene menor mean KL que todos los ficheros GGUF de otros publicadores en el rango de 0,98 a 1,06 veces su tamaño, salvo Q3_K_XL, que supera a 3 de 4.

## Limitaciones y advertencias

- Las métricas de KL y top-1 miden fidelidad respecto al BF16, no calidad absoluta ni rendimiento en tareas (no hay MMLU, HumanEval ni GSM8K).
- A 128K de contexto, la divergencia KL se dispara en chat/tool-calls (1,300 para IQ2_M) y prosa (0,401), lo que indica degradación notable en contextos muy largos con cuantizaciones agresivas.
- El modelo base Qwen3.5-9B puede presentar sesgos y alucinaciones propios de los LLM; no se documentan evaluaciones de sesgo en esta publicación.
- Idiomas soportados no confirmados; la evaluación se realizó sobre texto en inglés, por lo que el rendimiento en castellano u otros idiomas no está verificado.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-9B (verificar la licencia original del modelo base).
- El repositorio ocupa 66,8 GB en total (incluye todos los ficheros); descargar solo el fichero deseado.
- La fecha de creación (2026-11-12) y los datos de evaluación posteriores a 2026-09-20 indican que las métricas son recientes, pero no hay validación independiente de las mismas.
- El autor no publica información sobre la arquitectura interna ni el entrenamiento del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-9B-GGUF-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- llama.cpp (runtime de referencia, build 0a94a3f2): no disponible enlace directo en la información proporcionada
- LM Studio: no disponible enlace en la información proporcionada
- Ollama: no disponible enlace en la información proporcionada
