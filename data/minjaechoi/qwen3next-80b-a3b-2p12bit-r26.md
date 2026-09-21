# minjaechoi/qwen3next-80b-a3b-2p12bit-r26

## Resumen

Qwen3-Next-80B-A3B-Thinking es un modelo de lenguaje causal de 80.000 millones de parámetros totales (81.324.862.720 según los pesos publicados) con solo 3.000 millones activos por token, desarrollado por el equipo Qwen de Alibaba. Es la primera entrega de la familia Qwen3-Next, diseñada para abaratar el escalado combinando atención híbrida (Gated DeltaNet más Gated Attention) con un Mixture-of-Experts de alta dispersión (512 expertos, 10 activados por token). Su ventana de contexto es de 262.144 tokens nativos, extensible hasta 1.010.000.

La ficha que nos ocupa, minjaechoi/qwen3next-80b-a3b-2p12bit-r26, es una redistribución de terceros: el autor (minjaechoi) publica pesos en formato safetensors compatibles con Transformers, bajo licencia Apache-2.0 heredada del modelo original, sin documentación propia sobre el proceso de generación ni sobre la cuantización que sugiere el nombre del repositorio.

Es relevante ahora porque demuestra que un MoE de ratio de activación extremo (3,75 % de los parámetros) combinado con capas de atención lineal puede superar a modelos densos de tamaño similar en razonamiento, código y uso agéntico, con un coste de inferencia muy inferior en contextos largos. El modelo es únicamente de modo *thinking*: la plantilla de chat inyecta automáticamente la etiqueta de apertura de razonamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención híbrida (Gated DeltaNet + Gated Attention) y MoE de alta dispersión |
| Parámetros totales | 81.324.862.720 (80B nominales; 79B sin embeddings) |
| Parámetros activos | ~3B por token (10 de 512 expertos enrutados + 1 experto compartido) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantización | No disponible. El nombre del repositorio indica «2p12bit», sin documentación del esquema; el tamaño del repositorio (162,7 GB) es coherente con pesos de 16 bits |
| Idiomas soportados | No disponible. Se publican evaluaciones multilingües (MultiIF, MMLU-ProX, INCLUDE, PolyMATH), pero no una lista de idiomas |
| Licencia | Apache-2.0 (con enlace a la licencia del modelo original Qwen3-Next-80B-A3B-Thinking) |
| Formato de pesos | safetensors (librería transformers, pipeline text-generation) |
| Dimensión oculta | 2048 |
| Número de capas | 48 (disposición híbrida: 12 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE))) |
| Expertos | 512 enrutados, 10 activados, 1 compartido; dimensión intermedia de experto 512 |
| Atención con puerta (Gated Attention) | 16 cabezas Q y 2 cabezas KV; dimensión de cabeza 256; dimensión de RoPE 64 |
| Gated DeltaNet | 32 cabezas lineales para V y 16 para QK; dimensión de cabeza 128 |
| Tokens de preentrenamiento | 15T |

## Arquitectura y entrenamiento

El bloque se repite 12 veces con la estructura 3 × (Gated DeltaNet → MoE) seguida de 1 × (Gated Attention → MoE), lo que da 36 capas de atención lineal y 12 capas de atención completa sobre 48 capas totales. Las capas Gated DeltaNet mantienen un estado recurrente de coste constante en lugar de una caché KV que crece con la secuencia, mientras que las 12 capas de Gated Attention aportan recuperación exacta sobre el contexto. El componente MoE tiene 512 expertos con dimensión intermedia 512, activa 10 más uno compartido por token y aplica un ratio de activación del 0,2 % de los expertos disponibles, lo que reduce drásticamente los FLOPs por token manteniendo la capacidad total.

El preentrenamiento consume 15 billones de tokens, seguido de una fase de post-entrenamiento con GSPO (Group Sequence Policy Optimization) específicamente adoptada para estabilizar el entrenamiento por refuerzo sobre la combinación de atención híbrida y MoE de alta dispersión. Se incorporan además optimizaciones de estabilidad (layernorm centrado en cero con decaimiento de pesos) y Multi-Token Prediction (MTP), que mejora el rendimiento del preentrenamiento y acelera la inferencia. Según el autor original, Qwen3-Next-80B-A3B-Base supera a Qwen3-32B-Base con el 10 % del coste de entrenamiento y multiplica por 10 el throughput de inferencia para contextos de más de 32K tokens.

## Capacidades

- Generación de texto y razonamiento en modo *thinking* exclusivamente: la plantilla de chat inyecta la etiqueta de apertura de pensamiento, por lo que es normal que la salida contenga solo la etiqueta de cierre.
- Razonamiento matemático y científico avanzado (AIME25, HMMT25, GPQA, SuperGPQA).
- Generación y resolución de código competitivo y de producción (LiveCodeBench v6, CFEval, OJBench).
- Soporte de *tool calling* y *function calling* evaluado con BFCL-v3 (72,0).
- Comportamiento agéntico multi-paso con uso de herramientas en dominios de retail, aerolínea y telecomunicaciones (familia de benchmarks TAU1/TAU2).
- Capacidades multilingües medidas con MultiIF, MMLU-ProX, INCLUDE y PolyMATH.
- Contexto largo nativo de 262.144 tokens, con extensión documentada hasta 1.010.000.
- Decodificación acelerada mediante Multi-Token Prediction (MTP).
- No se documentan capacidades de visión, audio ni modos no-thinking.

## Casos de uso

- Asistencia en matemáticas y física de nivel avanzado: el modelo obtiene 87,8 en AIME25 y 73,9 en HMMT25, por lo que resulta adecuado como solucionador de problemas con verificación paso a paso en herramientas educativas o de investigación.
- Agentes con uso de herramientas en producción: con 72,0 en BFCL-v3 y 67,8 en TAU2-Retail puede orquestar llamadas a APIs, consultas a bases de datos y flujos multi-paso dentro de un bucle de agente.
- Análisis de documentación extensa: los 262.144 tokens nativos permiten cargar repositorios de código, expedientes o contratos completos sin troceado agresivo, aprovechando las 36 capas de atención lineal para mantener bajo el coste de memoria de contexto.
- Generación de código en pipelines de CI/CD: con 68,7 en LiveCodeBench v6 y 2071 en CFEval puede integrarse en revisiones automáticas, generación de pruebas y refactorizaciones dentro de un flujo con *tool calling*.
- Atención al cliente automatizada multi-turno: los 69,6 de TAU1-Retail y 60,5 de TAU2-Airline indican capacidad para gestionar conversaciones con historial largo, políticas de negocio y acciones sobre sistemas externos.
- Traducción y procesamiento multilingüe: 77,8 en MultiIF y 78,7 en MMLU-ProX lo sitúan como motor de localización, resumen multilingüe o moderación de contenido en varios idiomas.
- Generación de datos sintéticos y destilación: el modo *thinking* produce cadenas de razonamiento largas que pueden utilizarse como datos de entrenamiento para modelos menores, siempre con revisión humana.
- Investigación sobre eficiencia de arquitecturas MoE: con 3B parámetros activos sirve como banco de pruebas para estudiar enrutado de expertos, atención lineal y optimizaciones de *throughput*.

## Benchmarks y rendimiento

Resultados publicados por el autor original para el modelo sin cuantizar. No se han publicado resultados específicos para la variante redistribuida por minjaechoi.

| Benchmark | Qwen3-30B-A3B-Thinking-2507 | Qwen3-32B-Thinking | Qwen3-235B-A22B-Thinking-2507 | Gemini-2.5-Flash-Thinking | Qwen3-Next-80B-A3B-Thinking |
|---|---|---|---|---|---|
| MMLU-Pro | 80,9 | 79,1 | **84,4** | 81,9 | 82,7 |
| MMLU-Redux | 91,4 | 90,9 | **93,8** | 92,1 | 92,5 |
| GPQA | 73,4 | 68,4 | 81,1 | **82,8** | 77,2 |
| SuperGPQA | 56,8 | 54,1 | **64,9** | 57,8 | 60,8 |
| AIME25 | 85,0 | 72,9 | **92,3** | 72,0 | 87,8 |
| HMMT25 | 71,4 | 51,5 | **83,9** | 64,2 | 73,9 |
| LiveBench 241125 | 76,8 | 74,9 | **78,4** | 74,3 | 76,6 |
| LiveCodeBench v6 (25.02-25.05) | 66,0 | 60,6 | **74,1** | 61,2 | 68,7 |
| CFEval | 2044 | 1986 | **2134** | 1995 | 2071 |
| OJBench | 25,1 | 24,1 | **32,5** | 23,5 | 29,7 |
| IFEval | 88,9 | 85,0 | 87,8 | **89,8** | 88,9 |
| Arena-Hard v2* | 56,0 | 48,4 | **79,7** | 56,7 | 62,3 |
| WritingBench | 85,0 | 79,0 | **88,3** | 83,9 | 84,6 |
| BFCL-v3 | **72,4** | 70,3 | 71,9 | 68,6 | 72,0 |
| TAU1-Retail | 67,8 | 52,8 | 67,8 | 65,2 | **69,6** |
| TAU1-Airline | 48,0 | 29,0 | 46,0 | **54,0** | 49,0 |
| TAU2-Retail | 58,8 | 49,7 | **71,9** | 66,7 | 67,8 |
| TAU2-Airline | 58,0 | 45,5 | 58,0 | 52,0 | **60,5** |
| TAU2-Telecom | 26,3 | 27,2 | **45,6** | 31,6 | 43,9 |
| MultiIF | 76,4 | 73,0 | **80,6** | 74,4 | 77,8 |
| MMLU-ProX | 76,4 | 74,6 | **81,0** | 80,2 | 78,7 |
| INCLUDE | 74,4 | 73,7 | 81,0 | **83,9** | 78,9 |
| PolyMATH | 52,6 | 47,4 | **60,1** | 49,8 | 56,3 |

\* Tasas de victoria evaluadas con GPT-4.1, según la model card original.

## Requisitos de hardware

Estimaciones a partir del recuento de parámetros y de la precisión; la model card no publica requisitos oficiales.

- Pesos en bf16/fp16: aproximadamente 163 GB, coherentes con los 162,7 GB del repositorio. Requiere 2 × H100 80 GB, 2 × A100 80 GB o 4 × A100 40 GB como mínimo para pesos, más margen para caché y activaciones.
- Pesos en 8 bits: aproximadamente 81 GB. Encaja ajustadamente en una H100 80 GB o en 2 × A100 40 GB.
- Pesos en 4 bits: aproximadamente 41-48 GB. Cabe en una H100 80 GB, una RTX 6000 Ada (48 GB) o dos RTX 4090 con reparto, siempre que exista un checkpoint cuantizado compatible con la arquitectura híbrida.
- Consumidor: no cabe en una GPU de 24 GB en precisión completa. En 4 bits cabría en una RTX 4090/5090 de 24 GB solo con descarga parcial de capas a CPU/RAM, con la consiguiente pérdida de rendimiento.
- Memoria de contexto: de las 48 capas, 36 son Gated DeltaNet con estado recurrente de coste constante y solo 12 son Gated Attention con caché KV creciente, lo que reduce notablemente el consumo frente a un transformer de atención completa a 262.144 tokens.
- Opciones de despliegue: Transformers (el código de Qwen3-Next se integró en la rama principal), vLLM y SGLang según la documentación del autor original. El soporte en llama.cpp, Ollama o TGI no está confirmado en la información disponible.
- Throughput: el autor original reporta 10 veces más throughput de inferencia que Qwen3-32B-Base para contextos superiores a 32K tokens, gracias al ratio de activación de 3B parámetros y a MTP. No se publican cifras de latencia absoluta ni de tokens por segundo.
- El modelo es candidato natural a servir con aceleradores de gran memoria (H100, H200, B200) o con despliegue multi-GPU mediante paralelismo de tensor.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Next-80B-A3B-Thinking (base de esta ficha) | 80B | ~3B | 262.144 (hasta 1.010.000) | Apache-2.0 | Pesos abiertos en HuggingFace |
| Qwen3-30B-A3B-Thinking-2507 | 30B | ~3B (MoE) | No disponible | Apache-2.0 | Pesos abiertos en HuggingFace |
| Qwen3-32B-Thinking | 32B densos | 32B | No disponible | Apache-2.0 | Pesos abiertos en HuggingFace |
| Qwen3-235B-A22B-Thinking-2507 | 235B | ~22B (MoE) | No disponible | Apache-2.0 | Pesos abiertos en HuggingFace |
| Gemini-2.5-Flash-Thinking | No disponible | No disponible | No disponible | Propietaria | Solo API |

En rendimiento, Qwen3-Next-80B-A3B-Thinking supera a Qwen3-30B-A3B-Thinking-2507 y a Qwen3-32B-Thinking en la práctica totalidad de las métricas recogidas, y queda por debajo de Qwen3-235B-A22B-Thinking-2507 salvo en BFCL-v3, TAU1-Retail, TAU2-Airline y en el tamaño del modelo. Frente a Gemini-2.5-Flash-Thinking los resultados están equilibrados: el modelo de Qwen gana en AIME25, HMMT25, TAU1-Retail, TAU2-Airline y TAU2-Telecom, y pierde en GPQA, IFEval e INCLUDE.

## Limitaciones y advertencias

- Solo admite modo *thinking*: no existe un modo de respuesta directa, y la plantilla de chat inyecta la etiqueta de apertura de razonamiento, por lo que la salida puede contener únicamente la etiqueta de cierre sin apertura explícita.
- La model card advierte de que puede generar contenido de razonamiento más largo que su predecesor, lo que incrementa el número de tokens de salida, la latencia y el coste por consulta.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se publican tasas ni evaluaciones específicas de fidelidad factual en la información disponible.
- No se documentan sesgos conocidos ni auditorías de sesgo para esta versión.
- No hay lista oficial de idiomas soportados en la información proporcionada, aunque se publiquen métricas multilingües.
- La extensión de contexto hasta 1.010.000 tokens es una capacidad declarada, no un rendimiento garantizado; degrada la calidad si no se configura adecuadamente y aumenta el consumo de memoria.
- La licencia es Apache-2.0, permisiva para uso comercial, pero el enlace de licencia apunta al modelo original de Qwen; conviene verificar los términos aplicables a esta redistribución concreta.
- Esta redistribución no documenta el proceso de cuantización ni el esquema «2p12bit» del nombre, pese a que el tamaño del repositorio es compatible con pesos de 16 bits. No hay garantía de que los pesos sean funcionalmente equivalentes al modelo original.
- Los benchmarks publicados corresponden al modelo original sin cuantizar; una cuantización agresiva puede degradar el rendimiento y no se han publicado evaluaciones de esta variante.
- El repositorio registra 0 descargas y 0 interacciones, por lo que no cuenta con validación de la comunidad.
- El repositorio ocupa 162,7 GB, lo que implica un coste elevado de descarga y almacenamiento antes de cualquier optimización.
- En producción, el uso de *tool calling* requiere validación y controles de seguridad propios: el modelo puede emitir llamadas incorrectas o ejecutar acciones no deseadas si se le concede acceso directo a sistemas.

## Enlaces

- Repositorio de esta redistribución: https://huggingface.co/minjaechoi/qwen3next-80b-a3b-2p12bit-r26
- Modelo original: https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Thinking
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Thinking/blob/main/LICENSE
- Blog de Qwen3-Next: https://qwen.ai/blog?id=4074cca80393150c248e508aa62983f9cb7d27cd&from=research.latest-advancements-list
- Blog de GSPO: https://qwenlm.github.io/blog/gspo/
- Chat de Qwen: https://chat.qwen.ai/
- Referencias arXiv citadas en las etiquetas del repositorio (contenido no verificado): https://arxiv.org/abs/2309.00071, https://arxiv.org/abs/2505.09388, https://arxiv.org/abs/2501.15383
- Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces obtenidos corresponden a foros sin relación con la ficha.
