# Mia-AiLab/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1-2.9-bpw

## Resumen

DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1-2.9-bpw es una cuantización de 2,90 bits por peso (bpw) del checkpoint multimodal DeepSeek-V4.1-Flash-1017 (revisión `1bae0e10`), publicada por Mia-AiLab. No es un modelo nuevo: es el mismo modelo base convertible a EXL3 mediante el conversor `exllamav3` v1.6.1 más el conjunto de parches EAQ v1, con un port de la arquitectura DeepSeek-V4.1. El resultado ocupa 196 GiB (210,6 GB) repartidos en 39 shards y conserva la torre de visión y el módulo DSpark de decodificación especulativa dentro del checkpoint.

El interés práctico está en la relación entre compresión y fidelidad: con solo 2,90 bpw medios (expertos enrutados a 3 bits, capas 18-22 a 2 bits), el autor reporta una divergencia KL de 0,0137 nats y un 96,6 % de acuerdo top-1 frente a los pesos originales en 100 conversaciones de hasta 4.029 tokens, medidas sobre 89.880 tokens puntuados. Son métricas de fidelidad profesor-forzada, no de calidad de respuesta.

Es relevante para quien necesite ejecutar un MoE multimodal de ~105.200 millones de parámetros en hardware con memoria agregada limitada, pero con dos advertencias serias: las tablas de embeddings Engram **no** están incluidas (hay que descargar los shards 47 y 48 del modelo base, de unos 95 GiB cada uno) y el formato EXL3 obliga a usar `exllamav3`, no vLLM, llama.cpp ni Ollama.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) multimodal de la familia DeepSeek-V4.1; incluye torre de visión y módulo DSpark de decodificación especulativa (bloques en capas 37-39). Número total de capas y detalle fino de la arquitectura: no disponible |
| Parámetros totales | 105.247.867.090 (≈105,2 mil millones), según metadatos de safetensors |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (las evaluaciones publicadas llegan a 31,2k tokens) |
| Tipos de cuantización | EXL3 (EAQ v1) a 2,90 bpw medios: expertos enrutados 3 bits, capas 18-22 a 2 bits, atención 5 bits, expertos compartidos 4-5 bits, indexer `wk` 8 bits, cabeza de salida 6 bits, tensores MTP/DSpark 4 bits. No hay builds GGUF, AWQ ni GPTQ en la información disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors en formato EXL3 (`trellis` / `suh` / `svh` / `mul1`), codebook `mul1`, `out_scales=always`; 39 shards |
| Tamaño del repositorio | 210,7 GB (196 GiB, `total_size` del índice) |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 @ `1bae0e1088993b9b82de08f59de5be5a34e42170` |
| Librería de inferencia | `exllamav3` (conversor v1.6.1 + parches EAQ) |
| Descargas / likes | 1.236 descargas, 12 likes |
| Fechas | creado el 18 de octubre de 2026; actualizado el 20 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal de DeepSeek con capacidades de texto, razonamiento en modo *thinking*, código, uso de herramientas y entrada imagen-texto. Esta publicación no entrena nada: es un proceso de conversión de pesos. EAQ v1 no altera el formato EXL3 estándar —`quant_method` es `exl3`, el codebook es `mul1`, `out_scales=always`, y las claves de tensor y los anchos de bits del modelo principal son idénticos a los builds EXL3 2.9 bpw estándar (192.495 claves de tensor; coinciden los anchos de los 46.702 tensores cuantizados del cuerpo principal; ficheros de tokenizer idénticos byte a byte). Lo que cambia es cómo se generaron los pesos durante la conversión. La única diferencia estructural frente al build de LibertAIDAI son los 46 tensores densos MTP/DSpark, a 4 bits aquí frente a 6 bits allí.

La asignación de bits es heterogénea y no uniforme: los expertos enrutados van a 3 bits salvo las capas 18-22, que bajan a 2 bits; la atención usa 5 bits; los expertos compartidos 4-5 bits; el indexer `wk` 8 bits; la cabeza de salida 6 bits. El módulo DSpark vive dentro del checkpoint (`dspark_block_size=5`, 128 expertos *draft* con top-3, en las capas 37-39), lo que da decodificación especulativa sin un modelo borrador separado. Las tablas de embeddings Engram quedan sin cuantizar y fuera del repositorio, de modo que el checkpoint no es un reemplazo directo del FP8/FP4 original.

No hay información en la documentación disponible sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni las etapas de RLHF/DPO.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia de DeepSeek.
- Razonamiento en modo *thinking*: la evaluación separa estratos "Thinking agentic", "Thinking code", "Thinking tool calling", "Thinking chat" y "Thinking STEM".
- Generación de código, evaluada en un estrato específico de 13 conversaciones (KL 0,0074; acuerdo top-1 del 98,2 %).
- *Tool calling* / *function calling*: estrato propio de 15 conversaciones, además de sesiones agénticas sintéticas con llamadas a herramientas reales y sus resultados.
- Flujos agénticos multi-paso, incluidos sesiones largas de 22,9k a 31,2k tokens con 89 turnos de asistente.
- Capacidades STEM (matemáticas y ciencia) dentro del modo *thinking*.
- Multilingüe: existe un estrato de evaluación multilingüe de 14 conversaciones; los idiomas concretos no están disponibles.
- Entrada imagen-texto: la torre de visión se incluye "nativa" en el checkpoint (`pipeline_tag: image-text-to-text`).
- Decodificación especulativa integrada mediante DSpark (128 expertos *draft*, top-3, tamaño de bloque 5).

## Casos de uso

- **Asistentes de código en pipelines de CI/CD**: el modelo cubre tool calling y generación de código con pérdida de fidelidad baja frente al original (KL 0,0074 en código, 98,2 % de acuerdo top-1). Se puede usar como revisores automáticos o generadores de parches invocables desde un orquestador que explote el *function calling*.
- **Agentes de automatización con sesiones largas**: las mediciones en sesiones de 22,9k-31,2k tokens con llamadas a herramientas reales (KL 0,0051 global y 0,0015 en tokens de llamada a herramienta) lo hacen apto para agentes que encadenan decenas de pasos con resultados de herramientas intercalados.
- **Atención al cliente multi-turno**: el estrato de chat y el multilingüe son los que más degradación sufren respecto al original (KL 0,0357 y 0,0306), así que encaja mejor en asistentes con verificación posterior o en dominios acotados que en chat abierto de alta sensibilidad.
- **Procesamiento de documentos con imagen**: al conservar la torre de visión, puede extraer y razonar sobre capturas, formularios escaneados o diagramas combinados con texto en una misma conversación.
- **Análisis técnico asistido (STEM)**: el modo *thinking* con estrato STEM permite usarlo en tareas de cálculo y explicación técnica donde interesa una cadena de razonamiento explícita antes de la respuesta.
- **Despliegue en laboratorios con memoria agregada**: la receta TensorFold para 2x DGX Spark con `MODEL_ID` apuntando a este repositorio lo sitúa como opción para prototipos e investigación en clústeres pequeños, no para servir tráfico de producción masivo.
- **Evaluación comparativa de cuantizaciones**: sirve como banco de pruebas para medir el impacto de 2,9 bpw frente a pesos originales en cargas agénticas, usando las métricas de KL y acuerdo top-1 publicadas como línea base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Lo que sí se publica son métricas de fidelidad profesor-forzada frente a los pesos originales `1bae0e10`, medidas en un port propio de `exllamav3` sobre una RTX PRO 6000; KL en nats en la dirección referencia || modelo cuantizado.

Contexto corto: 100 conversaciones de hasta 4.029 tokens, 89.880 tokens de asistente puntuados, vocabulario completo de 129.280 tokens, medias ponderadas por token e intervalos del percentil 95 con 5.000 remuestreos *bootstrap*.

| Estrato | Conversaciones | KL (nats; IC 95 %) | Acuerdo top-1 (IC 95 %) |
|---|---:|---|---|
| Todas | 100 | 0,0137 [0,0115; 0,0165] | 96,6 % [96,2 %; 96,9 %] |
| Agéntico | 14 | 0,0068 [0,0058; 0,0084] | 98,0 % [97,6 %; 98,3 %] |
| Código | 13 | 0,0074 [0,0061; 0,0085] | 98,2 % [97,4 %; 98,7 %] |
| Tool calling | 15 | 0,0113 [0,0076; 0,0160] | 97,3 % [96,4 %; 98,1 %] |
| Chat | 10 | 0,0357 [0,0196; 0,0546] | 94,0 % [92,1 %; 95,7 %] |
| Multilingüe | 14 | 0,0306 [0,0239; 0,0368] | 95,5 % [94,7 %; 96,1 %] |
| Thinking agéntico | 6 | 0,0076 [0,0061; 0,0094] | 97,3 % [96,8 %; 97,8 %] |
| Thinking código | 8 | 0,0075 [0,0070; 0,0083] | 97,1 % [96,7 %; 97,4 %] |
| Thinking tool calling | 8 | 0,0186 [0,0152; 0,0217] | 95,2 % [94,0 %; 96,9 %] |
| Thinking chat | 4 | 0,0178 [0,0166; 0,0196] | 95,2 % [94,8 %; 96,1 %] |
| Thinking STEM | 8 | 0,0134 [0,0117; 0,0152] | 95,9 % [95,3 %; 96,4 %] |

En esos tokens, el token top-1 de la referencia aparece en el top-5 del modelo cuantizado en el 99,98 % de los casos.

Sesiones agénticas largas: ocho sesiones sintéticas con llamadas a herramientas reales (cuatro de 8,0-8,8k tokens y cuatro de 22,9-31,2k), 89 turnos de asistente, *thinking* desactivado y todos los turnos guionizados como llamada a herramienta; puntuadas con profesor forzado, no como *rollouts* autónomos.

| Subconjunto puntuado | Sesiones | KL (nats) | Acuerdo top-1 |
|---|---:|---:|---:|
| Todos los tokens, sesiones de 8,0-8,8k | 4 | 0,0060 | 99,1 % |
| Todos los tokens, sesiones de 22,9-31,2k | 4 | 0,0051 | 98,8 % |
| Tokens de llamada a herramienta, 22,9-31,2k | 4 | 0,0015 | 99,7 % |

Advertencia explícita de la ficha: el acuerdo top-1 mide si ambas distribuciones comparten el token más probable, no si una respuesta o una llamada a herramienta es correcta. Los estratos tienen muestras pequeñas (cuatro conversaciones en "Thinking chat").

## Requisitos de hardware

- Peso del cuerpo cuantizado: 196 GiB (210,6 GB) en 39 shards, según la ficha.
- Las tablas Engram **no** están en el repositorio: hay que añadir los shards 47 y 48 del modelo base, de aproximadamente 95 GiB cada uno según la ficha del autor. El espacio total en disco y en memoria supera por tanto los 196 GiB indicados.
- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamaño de los pesos, el cuerpo solo ya excede cualquier GPU individual; hace falta memoria agregada de al menos ~200 GB únicamente para pesos, más caché KV.
- GPU recomendadas: no hay lista oficial. La ficha menciona una RTX PRO 6000 como equipo de medición (sin detallar la configuración de memoria u *offload*) y una receta TensorFold para 2x DGX Spark con este repositorio como `MODEL_ID`.
- GPU de consumo: no cabe en ninguna RTX 4090/5090 ni en configuraciones de una sola tarjeta de 24-48 GB.
- Opciones de despliegue: `exllamav3` (conversor v1.6.1 + parches EAQ) y la receta TensorFold 2x DGX Spark. Al ser EXL3, no es compatible con vLLM, TGI, llama.cpp ni Ollama.
- Cualquier runtime que cargue checkpoints EXL3 de DeepSeek-V4.1 debería cargar este sin código específico de EAQ.
- Latencia y throughput: no disponibles. DSpark (128 expertos *draft*, top-3, bloques de 5) está pensado para acelerar la decodificación, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / bpw | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mia-AiLab/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1-2.9-bpw | 105,2 mil millones (totales) | no disponible | EXL3 (EAQ v1), 2,90 bpw medios, 196 GiB en 39 shards | MIT | 1.236 descargas, 12 likes |
| LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw | mismos pesos base | no disponible | EXL3 estándar, 2,9 bpw, 210,7 GB en 39 shards; MTP/DSpark a 6 bits | no disponible en la información | referenciado como comparación directa |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (original) | mismos pesos base | no disponible | FP8/FP4 original; incluye las tablas Engram (shards 47 y 48) | no disponible en la información | modelo base en HuggingFace |

Frente al build de LibertAIDAI, las diferencias verificadas son: anchos de bits idénticos en los 46.702 tensores del cuerpo principal, tokenizer idéntico byte a byte, y 46 tensores MTP/DSpark a 4 bits aquí frente a 6 bits allí. No hay datos de benchmarks estándar de ninguno de los tres, así que la comparación de rendimiento se limita a las métricas de fidelidad del propio autor. Alternativas de otros tamaños o familias: no disponibles en la información proporcionada.

## Limitaciones y advertencias

- **No es un reemplazo directo**: faltan las tablas Engram; sin los shards 47 y 48 del modelo base (≈95 GiB cada uno) el checkpoint no funciona.
- **Formato cerrado a `exllamav3`**: sin soporte en vLLM, TGI, llama.cpp ni Ollama; esto limita el despliegue en infraestructura estándar de servido.
- **Huella muy grande**: 196 GiB más las tablas Engram implican obligatoriamente memoria agregada multi-GPU o multi-nodo.
- **Mayor degradación en chat y multilingüe**: KL de 0,0357 y 0,0306 respectivamente, muy por encima de los estratos de código y agénticos. El uso en conversación abierta o en idiomas distintos del inglés es el escenario de mayor riesgo.
- **Las métricas no miden corrección**: el acuerdo top-1 y la KL son fidelidad de siguiente token profesor-forzada, no exactitud de respuesta ni validez de llamadas a herramienta.
- **Muestras pequeñas en varios estratos**: 4-8 conversaciones en los estratos *thinking* y en las sesiones largas; los intervalos son indicativos y los turnos no son réplicas independientes.
- **Riesgo de alucinación**: no cuantificado en la información disponible; es una cuantización agresiva (2 bits en capas 18-22, 3 bits en expertos enrutados) y la ficha no publica evaluaciones de veracidad.
- **Sesgos**: no hay documentación sobre sesgos en la información disponible; deben heredarse los del modelo base, que tampoco se detallan aquí.
- **Contexto e idiomas sin especificar**: no se declara longitud de contexto ni lista de idiomas, pese a que exista un estrato multilingüe en la evaluación.
- **Licencia MIT**: permisiva para uso comercial según el metadato del repositorio, pero conviene verificar la licencia y condiciones del modelo base, no disponibles en esta información.
- **Procedencia de los datos**: las cifras de calidad las publica el propio autor del build, no una evaluación independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1-2.9-bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Build EXL3 2.9 bpw de referencia para comparación: https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw
- Receta TensorFold para 2x DGX Spark: mencionada en la model card sin URL en la información disponible
- Paper, blog o demo oficiales: no disponibles en la información proporcionada
