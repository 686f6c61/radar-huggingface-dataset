# orangejuicesmith/Mythos-Nano-safetensor

## Resumen

Mythos-Nano es un modelo de lenguaje de 3.000 millones de parámetros desarrollado por el usuario independiente orangejuicesmith (bajo el alias squ11z1) como un fine-tune del modelo WeiboAI/VibeThinker-3B. Está orientado específicamente a razonamiento matemático, resolución de problemas de programación competitiva y generación de código, y se distribuye con licencia MIT tanto en formato safetensors como en GGUF. La model card declara explícitamente que no es un lanzamiento oficial de Anthropic, pese a la estética de la presentación.

La propuesta central del modelo es demostrar que un modelo de 3B parámetros, entrenado con retroalimentación verificable, puede acercarse a sistemas de escala frontera (entre 671B y 1T de parámetros) en tareas de matemáticas de competición y código. Según los datos publicados por el autor, Mythos-Nano alcanza un 91,4 en AIME25 y un 96,1 % de pass-rate en una batería de 128 problemas de LeetCode, resultados que, de confirmarse, lo situarían en un rango notable para su tamaño.

El modelo deriva de la familia Qwen2 (tag `qwen2`) y se publica como una variante "abliterated", es decir, con la dirección de rechazo eliminada, lo que reduce los mecanismos de seguridad y convierte el uso responsable en responsabilidad exclusiva del operador. No se especifican en la información disponible ni la longitud de contexto, ni el volumen de tokens de entrenamiento, ni la composición del dataset de ajuste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, según tags) |
| Parámetros totales | 3B (3.000 millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | F16 y Q4_K_M (GGUF publicados); safetensors en bfloat16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

Mythos-Nano es un fine-tune del modelo base WeiboAI/VibeThinker-3B, que a su vez se apoya en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar. El autor no detalla en la model card el volumen de tokens de entrenamiento, la composición del corpus de ajuste ni si se emplearon técnicas de RLHF, DPO o aprendizaje por refuerzo con recompensas verificables. La referencia a "verifiable feedback" en la descripción de resultados sugiere que el entrenamiento del modelo base o del fine-tune se apoyó en señales de recompensa comprobables (tests de código, respuestas matemáticas exactas), pero no se aporta la metodología concreta.

La model card menciona una variante denominada "Mythos-nano + CLR", con resultados superiores en matemáticas (AIME25 96,7; AIME26 97,1; HMMT25 95,4; BruMO25 99,2; IMO-Ans 80,6; GPQA-D 72,9), pero no se explica qué es CLR ni se ofrece el checkpoint correspondiente en la información disponible. El modelo se distribuye en una versión "abliterated", en la que se ha eliminado la dirección de rechazo del espacio de activaciones, lo que suprime las negativas a peticiones que un modelo alineado rechazaría.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat (`apply_chat_template`).
- Razonamiento matemático de competición: problemas de tipo AIME, HMMT, BruMO e IMO con respuesta final.
- Generación y resolución de código, especialmente en problemas de programación competitiva estilo LeetCode (Python).
- Razonamiento de conocimiento general medido con GPQA-D.
- Seguimiento de instrucciones evaluado con IFEval e IFBench.
- Modo de razonamiento extenso: la model card recomienda hasta 40.960 tokens de salida para problemas difíciles, lo que implica cadenas de pensamiento largas.
- No soporta tool calling ni function calling de forma fiable: el autor advierte explícitamente que no se entrenó con datos de ese tipo.
- No se recomienda para agentes autónomos ni orquestación de APIs.
- Capacidades multimodales (visión, audio): no disponibles.
- Multilingüismo: limitado al inglés según los metadatos.

## Casos de uso

- Resolución de problemas matemáticos de competición: el modelo está ajustado para producir cadenas de razonamiento largas (hasta 40.960 tokens) y una respuesta final verificable, lo que encaja con entrenamientos y evaluaciones de olimpiadas matemáticas (AIME, HMMT, BruMO).
- Práctica de programación competitiva: con un pass-rate declarado del 96,1 % en 128 problemas de LeetCode, resulta adecuado como asistente de estudio o generador de soluciones en Python para entrenamiento personal.
- Generación de soluciones de código en entornos educativos: útil para explicar y resolver ejercicios algorítmicos, sin integrarse en pipelines de producción que requieran function calling.
- Evaluación de razonamiento en investigación: su tamaño de 3B y su licencia MIT lo hacen manejable para experimentos académicos sobre cadenas de pensamiento y feedback verificable en entornos con recursos limitados.
- Despliegue local en hardware de consumo: la disponibilidad de GGUF Q4_K_M permite ejecutarlo con llama.cpp u Ollama en equipos con GPU modesta o incluso solo CPU, para tareas de razonamiento offline.
- Generación de datos sintéticos de matemáticas y código: puede producir problemas resueltos y soluciones paso a paso para aumentar datasets de entrenamiento, siempre con verificación posterior automática.
- Experimentación con modelos sin censura: para investigadores que estudian el efecto de la abliteración en el comportamiento del modelo, con las cautelas legales y éticas correspondientes.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (no verificados de forma independiente):

| Modelo | Params | AIME25 | AIME26 | HMMT25 | BruMO25 | IMO-Ans | LCBv6 | OJBench | GPQA-D | IFEval | IFBench |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Kimi K2.5 | 1T | 96,1 | 93,3 | 95,4 | 98,3 | 81,8 | 85,0 | 54,7 | 87,6 | 93,9 | 70,0 |
| GLM-5 | 744B | 96,7 | 95,8 | 97,9 | – | 82,5 | 85,5 | 55,0 | 86,0 | 92,6 | 76,5 |
| DeepSeek V3.2 | 671B | 93,1 | 94,2 | 90,2 | 96,7 | 78,3 | 80,8 | 48,4 | 82,4 | 92,6 | 60,7 |
| Gemini 3 Pro | N/D | 96,0 | 91,7 | 97,5 | 98,3 | 83,1 | 87,4 | 58,8 | 91,9 | – | 70,4 |
| Claude Opus 4.5 | N/D | 92,8 | 95,1 | 92,9 | – | 78,5 | 84,8 | – | 87,0 | – | 58,0 |
| GPT-5 (high) | N/D | 94,6 | – | 88,3 | 91,7 | 76,0 | 84,5 | – | 85,7 | – | 73,1 |
| **Mythos-nano** | **3B** | **91,4** | **94,3** | **89,3** | **93,8** | **76,4** | **80,2** | **38,6** | **70,2** | **93,4** | **74,5** |
| **Mythos-nano + CLR** | **3B** | **96,7** | **97,1** | **95,4** | **99,2** | **80,6** | – | – | **72,9** | – | – |

Resultados en LeetCode (Python, pass-rate sobre 128 problemas):

| Modelo | Agregado |
|---|---|
| GPT-5.3-Codex | 100,0 % (128/128) |
| Gemini 3.1 Pro | 99,2 % (127/128) |
| Gemini 3 Flash | 96,9 % (124/128) |
| **Mythos-nano** | **96,1 % (123/128)** |
| GPT-5.2 | 95,3 % (122/128) |
| Qwen3-Max | 91,4 % (117/128) |
| Kimi K2.5 | 90,6 % (116/128) |
| Claude Opus 4.6 | 86,7 % (111/128) |

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 8 y 12 GB según longitud de contexto.
- VRAM estimada en Q4_K_M: alrededor de 2 GB para pesos, con un consumo total típico de 3 a 5 GB según contexto.
- GPU recomendadas: A100, H100 o L40S para throughput alto en bfloat16; RTX 4090, RTX 3090 o RTX 4080 suficientes para inferencia en bfloat16 de un solo usuario.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bfloat16 y en tarjetas de 4-6 GB con Q4_K_M.
- Opciones de despliegue: transformers (safetensors, `dtype=torch.bfloat16`, `device_map="cuda"`), llama.cpp y Ollama con los GGUF publicados (`mythos-nano-f16.gguf`, `mythos-nano-Q4_K_M.gguf`). No se confirma soporte de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Razonamiento matemático (AIME25) | Código (LeetCode) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Mythos-Nano | 3B | No disponible | 91,4 | 96,1 % | MIT | Hugging Face (safetensors y GGUF) |
| WeiboAI/VibeThinker-3B (base) | 3B | No disponible | No disponible | No disponible | No disponible en la información | Hugging Face |
| Qwen2.5-3B-Instruct | 3B | 32.768 tokens (referencia de la familia Qwen2.5) | No comparable directamente | No comparable directamente | Apache 2.0 (referencia) | Hugging Face |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | 32.768 tokens (referencia) | No disponible en esta ficha | No disponible en esta ficha | MIT (referencia) | Hugging Face |

Nota: los datos del modelo base y de las alternativas no se han verificado en la información proporcionada; se indican solo como referencia de categoría.

## Limitaciones y advertencias

- Modelo "abliterated": la dirección de rechazo se ha eliminado, por lo que no declinará peticiones que un modelo alineado rechazaría. Los filtros de seguridad están reducidos y el operador asume toda la responsabilidad legal y ética sobre las salidas.
- No entrenado para tool calling ni agentes: el autor desaconseja explícitamente su uso en function calling, orquestación de APIs y agentes de código autónomos.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de factualidad; como modelo pequeño orientado a razonamiento, es probable que genere afirmaciones incorrectas fuera de dominios verificables.
- Idiomas: solo inglés según los metadatos; el rendimiento en castellano u otras lenguas no está evaluado y previsiblemente será deficiente.
- Contexto: la longitud de contexto no se especifica; la recomendación de hasta 40.960 tokens de salida sugiere ventanas amplias, pero no se confirma el límite de entrada.
- Benchmarks no verificados: todos los resultados proceden de la model card del autor, sin replicación independiente ni detalles de metodología de evaluación.
- Licencia MIT: permite uso comercial, pero el carácter abliterated puede contravenir políticas de plataformas o requisitos regulatorios en determinados contextos.
- Trazabilidad: cero descargas y cero likes en el momento de la consulta; proyecto de un único autor sin historial de validación comunitaria.
- La variante "Mythos-nano + CLR" con mejores resultados no se distribuye como checkpoint en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/orangejuicesmith/Mythos-Nano-safetensor
- Modelo base: https://huggingface.co/WeiboAI/VibeThinker-3B
- Referencia de uso en la model card: https://huggingface.co/squ11z1/Mythos-nano
- Repositorio de llama.cpp (para GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
