# DuoNeural/DeepSeek-R1-Distill-Qwen-1.5B-GTAP-v3-IQ2_M-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF del modelo DeepSeek-R1-Distill-Qwen-1.5B, publicada por DuoNeural Research Lab (Jesse Caldwell, Archon y Aura). El checkpoint concreto es la variante IQ2_M generada con el método propietario G-TAP v3, una técnica de cuantización basada en mecánica estadística (cavity damping) que busca preservar el razonamiento de cadena de pensamiento con un peso medio de aproximadamente 2,70 bits por peso y un footprint de 0,65 GiB en disco.

El modelo subyacente es un distill de razonamiento derivado de DeepSeek-R1 sobre la arquitectura Qwen2.5-1.5B: 28 capas, atención GQA con ratio 12:2, FFN SwiGLU y 1.777.088.000 parámetros totales. Está pensado para ejecutar razonamiento multi-paso (test-time compute) en hardware de consumo y en el borde, un escenario donde los modelos de razonamiento de mayor tamaño no caben.

Su relevancia radica en la agresividad de la compresión: el autor reporta 76,0% en GSM8K con CoT nativo y 304,9 tokens/s de decodificación en una RTX 4080 Super, manteniendo una perplejidad de holdout de 5,1392 frente a 4,3724 del control BF16. El propio autor lo etiqueta como release experimental pendiente de verificación empírica adicional, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen2.5 (28 capas, GQA 12:2, FFN SwiGLU), con razonamiento de test-time compute |
| Parámetros totales | 1.777.088.000 (1,77 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada; los ejemplos del autor usan `-c 4096` |
| Tipos de cuantización | IQ2_M (este repositorio). El informe del autor documenta además IQ3_XXS, Q4_K_M e IQ2_XXS |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Precisión de cuantización | ~2,70 bpw (0,65 GiB) |
| Tamaño del repositorio | 0,7 GB |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base DeepSeek-R1-Distill-Qwen-1.5B: un transformer denso de 28 capas con atención por consultas agrupadas (GQA) en ratio 12:2, capas feed-forward SwiGLU y un total de 1,77 mil millones de parámetros. No se trata de un MoE ni de una arquitectura híbrida SSM; es un transformer clásico destilado desde DeepSeek-R1, lo que le confiere el comportamiento de razonamiento con cadena de pensamiento larga característico de la familia R1.

Sobre el entrenamiento del modelo base no se aporta información en la model card (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí documenta el autor es el proceso de cuantización G-TAP v3, basado en mecánica estadística y con uso de matrices de importancia (imatrix). Según el informe publicado, la variante IQ2_M se obtiene aplicando "cavity damping" para reducir ramificaciones exploratorias espurias en las trayectorias de razonamiento. El autor afirma además que la variante Q4_K_M (1,04 GiB) alcanzó una perplejidad de holdout de 4,3641, ligeramente inferior al control BF16 sin cuantizar (4,3724), y duplicó la precisión en matemáticas de olimpiada (40,0% frente a 20,0%). Estas afirmaciones proceden del propio autor y están marcadas como pendientes de verificación independiente.

## Capacidades

- Generación de texto conversacional en formato de chat con plantilla nativa de DeepSeek-R1.
- Razonamiento con cadena de pensamiento explícita (modo thinking), activado mediante el token `<think>` en el prompt.
- Razonamiento matemático de nivel escolar: el autor reporta 19/25 (76,0%) en GSM8K con CoT nativo para esta cuantización.
- Razonamiento multi-paso con test-time compute, con una longitud media de pensamiento de 238,9 tokens en GSM8K según el informe del autor.
- Inferencia compatible con tool calling/function calling en la medida en que lo permita el modelo base; no se documenta explícitamente en la model card.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni multimodalidad.
- Compatible con endpoints (`endpoints_compatible` según los tags) y con despliegue vía llama.cpp.

## Casos de uso

- Razonamiento matemático local en el borde: con 0,65 GiB de pesos, se puede desplegar en portátiles y mini-PC para resolver problemas aritméticos y algebraicos de nivel GSM8K generando la cadena de pensamiento completa antes de responder.
- Asistente conversacional offline en hardware sin GPU: al ser un GGUF de ~650 MB, cabe en CPU y permite chatbots de razonamiento en entornos sin conectividad ni acelerador dedicado.
- Preprocesado y clasificación con justificación: el modelo puede etiquetar texto y emitir el razonamiento que sustenta la decisión, útil en pipelines por lotes donde se necesita trazabilidad del criterio.
- Tutoría educativa automatizada: para problemas de secundaria, el modo CoT muestra los pasos intermedios, lo que resulta aprovechable en aplicaciones de aprendizaje guiado.
- Nodo de agente ligero en pipelines multi-paso: sirve como sub-agente de razonamiento barato dentro de un sistema mayor, donde el modelo grande solo se invoca cuando el pequeño no cierra la respuesta.
- Prototipado rápido de aplicaciones de razonamiento: permite validar arquitecturas de test-time compute en una sola GPU de consumo antes de escalar a modelos mayores.
- Filtrado y generación aumentada (RAG) en contextos cortos: con ventanas de 4096 tokens usadas en los ejemplos del autor, encaja en tareas de resumen y respuesta sobre documentos fragmentados.
- Evaluación de técnicas de cuantización: como artefacto de investigación, permite reproducir la comparativa de arms (BF16, IQ3_XXS, Q4_K_M, IQ2_M, IQ2_XXS) publicada por el autor.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (25 ejemplos de GSM8K, 10 de matemáticas de olimpiada, holdout de perplejidad continua de 131k tokens, RTX 4080 Super 32 GB):

| Arm | Footprint | Perplejidad continua | GSM8K (CoT) | Pensamiento medio (GSM) | Cierre (GSM) | Olimpiada | Velocidad de decodificación |
|---|---|---|---|---|---|---|---|
| Arm 0 Base BF16 (control) | 3,32 GiB | 4,3724 | 20/25 (80,0%) | 409,0 tok | 100,0% | 2/10 (20,0%) | 141,8 t/s |
| Arm 1 Naive IQ3_XXS | 0,72 GiB | 4,7596 | 24/25 (96,0%) | 308,1 tok | 100,0% | 3/10 (30,0%) | 317,9 t/s |
| Arm 3 GTAP v3 IQ3_XXS | 0,72 GiB | 4,7160 | 22/25 (88,0%) | 229,7 tok | 100,0% | 3/10 (30,0%) | 315,0 t/s |
| Arm 4 GTAP v3 Q4_K_M | 1,04 GiB | 4,3641 | 20/25 (80,0%) | 424,1 tok | 100,0% | 4/10 (40,0%) | 287,3 t/s |
| Arm 5 GTAP v3 IQ2_M | 0,65 GiB | 5,1392 | 19/25 (76,0%) | 238,9 tok | 96,0% | 0/10 (0,0%) | 304,9 t/s |
| Arm 6 GTAP v3 IQ2_XXS | 0,55 GiB | 9,4779 | 10/25 (40,0%) | 1250,9 tok | 8,0% | 2/10 (20,0%) | 326,9 t/s |

Advertencia: estos resultados son los declarados por el autor, con muestras muy pequeñas (25 y 10 ejemplos) y sin validación independiente. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- Pesos en disco: 0,65 GiB para IQ2_M (0,7 GB de repositorio completo).
- VRAM estimada para inferencia: en torno a 1 GiB o menos con `-ngl 99` y ventana de 4096 tokens, sumando pesos y caché KV; no se especifica el consumo pico medido.
- GPU de referencia del autor: NVIDIA GeForce RTX 4080 Super 32 GB, con 304,9 t/s de decodificación.
- Cabe holgadamente en cualquier GPU de consumo actual (RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090, etc.), e incluso en iGPU con memoria compartida suficiente.
- Inferencia en CPU viable por el tamaño de los pesos, aunque la velocidad no está documentada en ese escenario.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por compatibilidad de formato GGUF, también Ollama, LM Studio, kobold.cpp y otros runners GGUF. No se documenta compatibilidad directa con vLLM o TGI para este artefacto.
- Parámetros de muestreo sugeridos por el autor: `--temp 0.6 --top-p 0.95`, `-n 1536`, `-c 4096`, `-ngl 99`, `-fa on`.
- Throughput declarado: 304,9 t/s (IQ2_M), 326,9 t/s (IQ2_XXS), 315,0 t/s (IQ3_XXS) en la RTX 4080 Super; no se aportan datos de latencia por petición (TTFT).

## Comparativa con modelos similares

Dentro del mismo programa de cuantización del autor, la comparativa es la siguiente:

| Variante | Tamaño | Perplejidad (holdout 131k) | GSM8K (CoT) | Olimpiada | Velocidad |
|---|---|---|---|---|---|
| Base BF16 (sin cuantizar) | 3,32 GiB | 4,3724 | 80,0% | 20,0% | 141,8 t/s |
| G-TAP v3 Q4_K_M | 1,04 GiB | 4,3641 | 80,0% | 40,0% | 287,3 t/s |
| G-TAP v3 IQ3_XXS | 0,72 GiB | 4,7160 | 88,0% | 30,0% | 315,0 t/s |
| G-TAP v3 IQ2_M (este repo) | 0,65 GiB | 5,1392 | 76,0% | 0,0% | 304,9 t/s |
| G-TAP v3 IQ2_XXS | 0,55 GiB | 9,4779 | 40,0% | 20,0% | 326,9 t/s |

No se dispone en la información proporcionada de comparativas con otros modelos de razonamiento de tamaño similar (por ejemplo otras destilaciones de DeepSeek-R1 o modelos de ~1,5 B de Qwen, Llama o Gemma), por lo que esa comparación cruzada queda como no disponible.

## Limitaciones y advertencias

- Release explícitamente marcado como experimental y pendiente de verificación empírica adicional por parte del autor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin adopción ni validación por terceros.
- La variante IQ2_M obtiene 0,0% (0/10) en matemáticas de olimpiada, muy por debajo de otras variantes del mismo programa (Q4_K_M alcanza 40,0%), lo que sugiere un daño severo en tareas de razonamiento complejo a 2 bits.
- Degradación de perplejidad frente al control BF16 (5,1392 frente a 4,3724), con una muestra de holdout de 131k tokens.
- Tasa de cierre ("closure") del 96,0% en GSM8K para IQ2_M, es decir, un 4% de cadenas de razonamiento que no terminan correctamente.
- Los benchmarks declarados usan muestras muy pequeñas (25 y 10 problemas), por lo que la varianza es alta y las conclusiones deben tomarse con cautela.
- Las afirmaciones de "super-perplejidad" y de mejora de precisión en matemáticas de olimpiada proceden únicamente del autor y no están replicadas de forma independiente.
- Riesgo de alucinación inherente al modelo base y agravado por la cuantización agresiva a ~2,70 bpw.
- Idiomas soportados no declarados; no hay garantía de rendimiento fuera del inglés sin verificación previa.
- Longitud de contexto no documentada en la ficha; los ejemplos usan 4096 tokens, valores superiores quedan sin verificar.
- Licencia Apache 2.0 en este repositorio, heredada del modelo base, lo que en principio permite uso comercial; conviene verificar igualmente las condiciones del modelo base y de los datos de entrenamiento originales.
- El método de cuantización G-TAP v3 no está descrito con suficiente detalle técnico en la model card como para reproducirlo sin consultar material adicional del autor.
- Para producción, conviene validar la variante IQ3_XXS o Q4_K_M en lugar de IQ2_M si la tarea exige razonamiento matemático complejo.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/DuoNeural/DeepSeek-R1-Distill-Qwen-1.5B-GTAP-v3-IQ2_M-GGUF
- Modelo base en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- llama.cpp (runner referenciado en los ejemplos de uso; no se proporciona URL explícita en la model card): no disponible en la información proporcionada
- Paper, blog o repositorio del método G-TAP v3: no disponible en la información proporcionada
- Demos o Spaces asociados: no disponible en la información proporcionada
