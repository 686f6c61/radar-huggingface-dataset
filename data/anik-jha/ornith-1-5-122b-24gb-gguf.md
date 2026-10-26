# anik-jha/Ornith-1.5-122B-24GB-GGUF

## Resumen

Ornith-1.5-122B-24GB-GGUF es una compilación GGUF del modelo MoE Ornith-1.5-122B (ornith-ai) publicada por el usuario anik-jha, cuyo objetivo es ejecutar el modelo completo, más un contexto de 32K tokens, en una única GPU de 24 GB. Para conseguirlo se aplica una poda estructurada de expertos REAP: se conservan 128 de los 256 expertos enrutados de cada una de las 48 capas MoE, lo que reduce el fichero de 39,1 GB (UD-IQ2_XXS de unsloth) a 19,9 GB sin recuantizar ningún tensor. El resultado es un GGUF de 2 bits con la mitad de expertos, pensado específicamente para código.

La relevancia de esta ficha es doble. Por un lado, demuestra que un MoE de gran tamaño puede desplegarse en hardware de consumo (RTX 3090/4090) manteniendo el 99,4% de la puntuación HumanEval+ y el 99,3% de MBPP+ del modelo de referencia de 4 bits, a costa de un 26,9% del tamaño de fichero. Por otro, documenta con detalle inusual el procedimiento de poda, la estabilidad de las puntuaciones de experto y la verificación tensor a tensor (879 tensores idénticos al fichero de origen), lo que la convierte en un caso de estudio reproducible de poda de expertos.

La arquitectura subyacente es Qwen3.5-MoE (`qwen35moe` en llama.cpp): 48 capas MoE con 256 expertos enrutados más uno compartido por capa, atención híbrida (atención completa y Gated DeltaNet) y razonamiento previo a la respuesta activado por defecto. El repositorio no incluye safetensors ni proyector de visión, y el bloque de predicción multi-token (MTP) ha sido eliminado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrida Qwen3.5-MoE (`qwen35moe`): 48 capas MoE, atención completa y Gated DeltaNet |
| Parámetros totales | 64.110.594.048 (~64,1 mil millones) según el recuento de safetensors; el nombre del repositorio indica 122B |
| Parámetros activos | 8 de 256 expertos enrutados por capa + 1 experto compartido (cifra absoluta no disponible) |
| Longitud de contexto | 32K verificados en 24 GB; memoria medida también a 128K. Máximo del modelo base: no disponible |
| Tipos de cuantización | UD-IQ2_XXS (2 bits), un único fichero; no hay otras cuantizaciones en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); sin safetensors en el repositorio |

Datos adicionales del repositorio: tamaño de 21,4 GB en la lista de ficheros de HuggingFace (19,9 GB según el cómputo de GPU, 1 GB = 1.024 MB), 0 descargas y 2 likes en el momento de la consulta, creado y actualizado el 25 de octubre de 2026.

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-122B es un MoE que enruta cada token a 8 de 256 expertos en cada una de sus 48 capas MoE, además de un experto compartido; los expertos enrutados representan el 93% de sus parámetros. La atención es híbrida, combinando capas de atención completa con capas Gated DeltaNet. Esta compilación no reentrena ni ajusta nada: la poda es una copia byte a byte del GGUF UD-IQ2_XXS de unsloth, en la que se conservan los expertos seleccionados, sus filas de router y todos los demás tensores (experto compartido, ambos tipos de atención, embeddings y cabeza de salida) sin modificar.

La selección de expertos se hizo con REAP (peso de router multiplicado por el tamaño de salida del experto, promediado sobre los tokens enrutados a ese experto) sobre 3,54 millones de tokens: un mix de calibración de 2.047 conversaciones (35% instrucciones de código, 30% chat general, 17,5% trayectorias de agentes de ingeniería de software, 17,5% function calling; 3,08 M tokens) más 128 respuestas de razonamiento del propio Ornith a prompts de código de ese mix (0,46 M tokens), todo ejecutado a través del UD-Q4_K_XL de unsloth. Se conservaron los 128 expertos con mayor puntuación en cada capa (el mismo número en todas porque el cargador de llama.cpp lee un único recuento de expertos para todo el modelo). Las puntuaciones resultaron estables: la correlación entre los rankings obtenidos con las dos mitades del conjunto de calibración tiene una mediana de 0,988 por capa (0,967 en la capa menos estable).

## Capacidades

- Generación de código: principal capacidad evaluada, con soporte de razonamiento previo a la respuesta (thinking mode) activado por defecto.
- Razonamiento multi-paso: el modelo razona antes de contestar; la plantilla de chat permite desactivarlo con `--chat-template-kwargs '{"enable_thinking": false}'` (modo no evaluado).
- Function calling: el mix de calibración incluye un 17,5% de datos de function calling, lo que indica que el modelo base lo soporta; no se documenta explícitamente en la información disponible.
- Trayectorias de agentes de ingeniería de software: presentes en el conjunto de calibración (17,5%), lo que orienta el modelo hacia tareas de agente de código.
- Conversación multi-turno: la etiqueta `conversational` y la compatibilidad con endpoints están declaradas en el repositorio.
- Contexto largo: hasta 32K tokens verificados en 24 GB y memoria medida a 128K.
- No incluye visión: el proyector visual no está en el fichero y la visión no se probó.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Asistente de código en estación de trabajo local: con 20,5 GB de VRAM a 32K de contexto y caché KV de 8 bits, el modelo cabe entero en una RTX 4090 o RTX 3090, lo que permite autocompletado y generación de funciones sin depender de APIs externas ni enviar código propietario fuera de la red local.
- Agente de codificación multi-paso: al haber sido calibrado con trayectorias de agentes de ingeniería de software y function calling, es adecuado para bucles de edición-verificación sobre un repositorio, siempre que se fije un límite de tokens por respuesta para evitar razonamientos que no terminan.
- Generación de tests unitarios y parches en CI/CD: HumanEval+ y MBPP+ miden exactamente la generación de funciones a partir de docstrings y descripciones; con 0,939 y 0,804 de pass@1 en esta compilación, encaja en un pipeline que proponga tests y los valide con el runner del proyecto.
- Revisión de código con contexto amplio: 32K tokens permiten incluir varios ficheros o un diff extenso en el prompt, útil para revisiones automatizadas de pull requests en local.
- Reproducción de investigación en poda de expertos: el repositorio incluye `selections/ornith-reap50.json` con los expertos conservados y un directorio `eval/` con puntuaciones, intervalos de confianza pareados, resultados por problema y procedencia (revisiones, hashes, commit de llama.cpp, calibración, estabilidad de puntuaciones, verificación de tensores), lo que permite repetir el experimento.
- Evaluación comparativa de cuantización y poda: sirve para medir en primera persona la pérdida real de un modelo al pasar de 4 bits a 2 bits combinado con poda del 50%, un escenario frecuente al intentar desplegar MoE grandes en hardware limitado.
- Prototipado de herramientas de código para equipos pequeños: al ser MIT y ejecutable con llama-server, se puede integrar en un servidor interno compatible con la API de OpenAI sin coste de licencia.

## Benchmarks y rendimiento

| Benchmark | Ornith UD-Q4_K_XL (referencia, 4 bits) | Esta compilación (REAP50, 2 bits) | Retención |
|---|---|---|---|
| HumanEval+ (pass@1, razonamiento activado) | 0,945 | 0,939 | 99,4% (IC 95%: 96,1–102,6%) |
| MBPP+ (pass@1, razonamiento activado) | 0,810 | 0,804 | 99,3% (IC 95%: 95,7–103,0%) |
| Respuestas que agotan el límite de 32K (HumanEval+ / MBPP+) | 0 / 0 | 2 / 5 | — |
| Tokens por respuesta, mediana (HumanEval+) | 1.010 | 999 | — |
| Tokens por respuesta, media (HumanEval+) | 1.306 | 1.832 | — |
| Tamaño de fichero | 74,2 GB | 19,9 GB (21,42 GB decimal) | 26,9% |
| VRAM a 32K, caché KV de 8 bits | 71,9 GB | 20,5 GB | — |
| VRAM a 32K, caché KV de 16 bits | 72,2 GB | 20,8 GB | — |
| VRAM a 128K, caché KV de 8 bits | 73,4 GB | 22,0 GB | — |

Detalles de evaluación: EvalPlus HumanEval+ (164 problemas) y MBPP+ (378), servidos por llama-server con razonamiento activado, temperatura 0,6, top-p 0,95, top-k 20, min-p 0, una semilla fija por problema, una muestra por problema y hasta 32.768 tokens generados; la respuesta posterior al bloque de razonamiento se sanitizó y se puntuó con EvalPlus 0.3.1, y una respuesta que agota el límite de tokens cuenta como fallo. La diferencia frente a la referencia es de −0,6 puntos en HumanEval+ (IC 95%: −3,7 a +2,4; 4 problemas perdidos y 3 ganados). No se han publicado resultados de MMLU, GSM8K ni de otros benchmarks generales en la información disponible. Las cifras combinan el coste de la poda con el del paso de 4 a 2 bits; el modelo de 2 bits sin podar no se evaluó.

## Requisitos de hardware

- VRAM estimada: 20,5 GB a 32K de contexto con caché KV de 8 bits y atención flash; 20,8 GB con caché KV de 16 bits; 22,0 GB a 128K con caché KV de 8 bits. Mediciones hechas al arrancar el servidor con un solo slot y todas las capas en GPU.
- GPU de 24 GB: es el objetivo de diseño. Encaja en RTX 4090, RTX 3090 y tarjetas profesionales de 24 GB; no cabe en GPU de 16 GB ni de 12 GB.
- GPU de datacenter: no se han publicado mediciones en A100 u H100, pero al necesitar menos de 23 GB no requieren estos aceleradores; el interés del modelo es precisamente evitar ese hardware.
- Despliegue: llama.cpp con soporte de Qwen3.5-MoE (`qwen35moe`), evaluado en el commit `36cbf415`. El comando de referencia es `llama-server -m Ornith-1.5-122B-24GB-REAP50-UD-IQ2_XXS.gguf -ngl 99 -c 32768 -ctk q8_0 -ctv q8_0 -fa on --temp 0.6 --top-p 0.95 --top-k 20 --min-p 0`.
- Alternativas de despliegue: LM Studio y Ollama no han sido probados según la model card. No hay soporte de decodificación especulativa MTP porque el bloque correspondiente fue eliminado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | HumanEval+ / MBPP+ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| anik-jha/Ornith-1.5-122B-24GB-GGUF (REAP50, UD-IQ2_XXS) | GGUF podado, 2 bits | 19,9 GB | 32K en 24 GB; medido a 128K | 0,939 / 0,804 | MIT | Repositorio público, 0 descargas, 2 likes |
| unsloth Ornith UD-Q4_K_XL | GGUF de referencia, 4 bits | 74,2 GB | No disponible | 0,945 / 0,810 | No disponible en la información | Referencia usada en la evaluación |
| unsloth Ornith UD-IQ2_XXS | GGUF, 2 bits sin podar | 39,1 GB | No disponible | No evaluado | No disponible en la información | Origen de esta poda |
| unsloth Ornith UD-IQ1_M | GGUF, ~1 bit | 37,6 GB | No disponible | No evaluado | No disponible en la información | El GGUF más pequeño de unsloth antes de esta poda |
| ornith-ai/Ornith-1.5-122B | Pesos completos | 64.110.594.048 parámetros según safetensors | No disponible | No disponible | No disponible en la información | Modelo base |

## Limitaciones y advertencias

- Solo se ha evaluado código (HumanEval+ y MBPP+). No hay datos de razonamiento general, matemáticas, multilingüe ni de dominios distintos de la programación, y el mix de calibración es mayoritariamente de código, por lo que se espera un sesgo hacia ese dominio.
- La poda del 50% de expertos y la cuantización de 2 bits se aplican conjuntamente: las cifras no permiten separar cuánto pierde el modelo por cada técnica, y el 2 bits sin podar no llegó a evaluarse.
- Riesgo de razonamientos que no terminan: 2 de 164 respuestas en HumanEval+ y 5 de 378 en MBPP+ agotaron los 32.768 tokens, frente a cero en la referencia, y la media de tokens por respuesta sube de 1.306 a 1.832. Es imprescindible fijar un límite de tokens en producción.
- Alucinación: no se han publicado mediciones de fiabilidad factual ni de tasa de alucinación. En código, el benchmark mide pass@1 con tests, lo que no cubre corrección semántica de APIs ni dependencias reales.
- Idiomas no documentados: la calibración y la evaluación parecen en inglés; el rendimiento en castellano no está verificado.
- El modo con razonamiento desactivado (`enable_thinking: false`) no fue evaluado.
- Sin visión: no se incluye proyector visual y la capacidad visual no se probó.
- Sin MTP: el bloque de predicción multi-token se eliminó, así que no se puede usar decodificación especulativa MTP con este fichero.
- Compatibilidad: requiere una compilación de llama.cpp con soporte de `qwen35moe`; la evaluación usó además un parche local que devuelve salidas de chat malformadas como texto plano en lugar de error HTTP (no se activó en ninguna ejecución). LM Studio y Ollama no están probados.
- Licencia MIT declarada para este GGUF; la licencia del modelo base no se especifica en la información disponible y conviene verificarla antes de un uso comercial.
- Madurez del artefacto: 0 descargas y 2 likes, creado el 25 de octubre de 2026; no hay validación independiente de las cifras más allá de los materiales del propio autor.
- Discrepancia de nomenclatura: el nombre indica 122B, pero el recuento de safetensors asociado es de 64,1 mil millones de parámetros. La información disponible no explica la diferencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/anik-jha/Ornith-1.5-122B-24GB-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Artículo del método ("Half the Experts, All the Code"): https://arxiv.org/abs/2607.16721
- Workshop COLM 2026 on Efficient Reasoning: https://wdlctc.github.io/efficient-reasoning-2026/
- Ficheros citados en el repositorio: `Ornith-1.5-122B-24GB-REAP50-UD-IQ2_XXS.gguf`, `selections/ornith-reap50.json`, `eval/`
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos trataban sobre el nombre propio «Anik» y no se han utilizado.
