# AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GGUF es una cuantización en formato GGUF del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por AtomicChat, a la que se le ha aplicado una edición de tipo *abliteration*: la dirección de rechazo se ha calculado sobre los pesos originales en precisión completa y se ha proyectado fuera de todos los bloques que escriben en el flujo residual. El resultado no es un reentrenamiento ni un fine-tune conversacional, sino una modificación geométrica de los pesos que elimina la conducta de negativa ante peticiones dañinas manteniendo, según el autor, el resto de capacidades.

El modelo base es un transformer con mezcla de expertos (MoE) con 384 expertos enrutados por bloque más un experto compartido, cuatro flujos de *hyper-connection* y una tabla n-gram Engram que se distribuye como shard independiente y puede residir en SSD mediante mmap. Se publican dos builds: IQ1_M a 2,67 bits por peso (139,8 GB de pesos) y Q2_K a 3,58 bpw (199,6 GB de pesos), ambas con la misma matriz de importancia que los builds de Unsloth para que la única diferencia medible sea la edición.

La relevancia del artefacto es doble: por un lado, permite ejecutar localmente un modelo de esta escala sin rechazos, algo de interés para investigación en seguridad y alineación; por otro, el autor publica métricas de fidelidad de cuantización (KLD, top-1) y de degradación de conocimiento (MMLU) que permiten decidir con datos qué build usar. El coste es explícito: el build de 1 bit pierde 3,8 puntos de MMLU y no supera el umbral de calidad fijado por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE): 384 expertos enrutados por bloque más un experto compartido, cuatro flujos de *hyper-connection* en el residual y tabla n-gram Engram como shard independiente |
| Parametros totales | 114.925.568 según metadatos de safetensors; el dato es incoherente con el tamaño del repositorio (585,7 GB) y con los builds publicados (139,8-199,6 GB de pesos), por lo que probablemente esté truncado |
| Parametros activos | no disponible (la model card no publica la cifra de parámetros activos por token) |
| Longitud de contexto | no disponible de forma oficial; el ejemplo de ejecución de la model card arranca `llama-server` con `-c 32768` |
| Tipos de cuantizacion | IQ1_M (2,67 bpw) y Q2_K (3,58 bpw); adaptador LoRA rank-1 en GGUF |
| Idiomas soportados | no disponible (solo se publican evaluaciones en inglés y ruso) |
| Licencia | MIT para el repositorio de cuantización; la licencia del modelo base no se indica en la información disponible |
| Formato de pesos | GGUF dividido en shards (6 shards para IQ1_M, 8 para Q2_K); adaptador LoRA en GGUF |

## Arquitectura y entrenamiento

El modelo base es una mezcla de expertos con 384 expertos enrutados por bloque y un experto compartido, sobre un residual con cuatro flujos de *hyper-connection*. Los pesos publicados por DeepSeek combinan tensores en BF16 con expertos en MXFP4 nativo. La edición de AtomicChat se calculó a partir de esos pesos a precisión completa (BF16 más expertos MXFP4 deconvolucionados exactamente) y cubre todos los bloques que escriben en el flujo residual: salida de atención, experto compartido, los 384 expertos enrutados de cada bloque y la proyección de valor de Engram.

El procedimiento de abliteración consistió en calcular la diferencia de la media del residual (agregando los cuatro flujos de *hyper-connection*) en el último token del prompt entre conjuntos de prompts dañinos y benignos, en inglés (harmful_behaviors y harmless_alpaca de mlabonne) y en ruso, y proyectar esa dirección fuera de los pesos. Los conjuntos de evaluación (JailbreakBench, red-teaming en ruso, XSTest y MMLU) se mantuvieron fuera del cálculo de la dirección. No se ha publicado información sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) ni sobre innovaciones de decodificación; la model card disponible está truncada en la sección de metodología.

## Capacidades

- Generación de texto en inglés y ruso; son los dos únicos idiomas con evaluación publicada.
- Razonamiento con modo *thinking* activado por defecto en la plantilla, con cuatro niveles de `reasoning_effort`: low, medium, high y max.
- *Tool calling* / *function calling*: se midieron 20/20 llamadas válidas con el adaptador LoRA sobre el build UD-Q2_K_XL de Unsloth.
- Contexto largo: 3/3 pruebas de *needles* superadas en la misma configuración con adaptador.
- Ausencia de rechazos: 0,0% en JailbreakBench (inglés) y 0,0% en red-teaming en ruso en ambos builds, frente a 88,9-91,4% y 72,0-69,0% respectivamente en los builds de Unsloth del mismo layout.
- Reducción de falsos rechazos en prompts benignos: XSTest pasa de 8,8% a 0,0% (IQ1_M) y de 8,0% a 0,4% (Q2_K).
- No se mencionan capacidades de visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Investigación en seguridad y alineación: el modelo permite estudiar empíricamente el efecto de proyectar una dirección de rechazo sobre un MoE grande, comparando los builds con y sin edición sobre los mismos prompts y servidor (JailbreakBench 91,4% → 0,0% en Q2_K).
- Red-teaming interno y evaluación de clasificadores: al no rechazar, sirve como generador de ataques controlado en un entorno aislado para medir la robustez de filtros propios, con la advertencia de que requiere contención explícita.
- Despliegue local en máquinas con 140-200 GB de memoria: el build IQ1_M necesita 139,8 GB de pesos y el Q2_K 199,6 GB, con la tabla Engram paginando desde SSD mediante mmap, lo que habilita inferencia en nodos multi-GPU o equipos de memoria unificada grande sin depender de la nube.
- Evaluación comparativa de cuantizaciones: los datos de KLD y top-1 contra el checkpoint original (0,2506 / 83,14% para IQ1_M; 0,1001 / 89,45% para Q2_K) permiten construir pipelines de selección de cuantización basados en métricas de fidelidad, no en perplejidad aislada.
- Derivados con LoRA: el adaptador rank-1 publicado se puede aplicar sobre cualquier GGUF de DeepSeek-V4.1-Flash-1017 con los mismos nombres de tensor a 2 bits o más, lo que permite partir de builds de terceros (por ejemplo UD-Q2_K_XL) sin re-cuantizar.
- Agentes con herramientas: las 20/20 llamadas válidas y el soporte de `--jinja` lo hacen utilizable en flujos de agente de varios pasos ejecutados en local.
- Procesamiento de documentos largos en inglés o ruso: con el contexto configurado a 32768 tokens y 3/3 needles superadas, es viable para extracción y resumen sobre corpus extensos en esos dos idiomas.
- Razonamiento con esfuerzo configurable: los niveles `low`/`medium`/`high`/`max` de `reasoning_effort` permiten ajustar coste por consulta en tareas de matemáticas o lógica, a costa de un mayor riesgo de bucles en el build de 1 bit (3/30 en low y 5/30 en high).

## Benchmarks y rendimiento

Fidelidad de cuantización frente al checkpoint original (texto neutro reservado, 24 fragmentos de 4096 tokens, referencia UD-Q8_K_XL de Unsloth):

| Build | En disco | Pesos (RAM + VRAM) | KLD medio | Mismo top-1 | KLD Unsloth mismo layout | Top-1 Unsloth |
|---|---:|---:|---:|---:|---:|---:|
| Uncensored 2.67bpw-IQ1_M | 250,4 GB | 139,8 GB | 0,2506 | 83,14% | 0,2227 | 84,37% |
| Uncensored 3.58bpw-Q2_K | 334,8 GB | 199,6 GB | 0,1001 | 89,45% | 0,0829 | 90,45% |

Conducta y conocimiento (mismos prompts, mismo servidor, misma plantilla; "→" = build de Unsloth del mismo layout → build de AtomicChat):

| Build | JailbreakBench (EN) | Red-teaming ruso | XSTest (rechazos indebidos) | Thinking low | Thinking high | MMLU (500) |
|---|---|---|---|---|---|---|
| IQ1_M | 88,9% → 0,0% | 72,0% → 0,0% | 8,8% → 0,0% | 29/30 → 0/30 | 28/30 → 0/30 | 85,6% → 81,8% (p = 0,003) |
| Q2_K | 91,4% → 0,0% | 69,0% → 0,0% | 8,0% → 0,4% | 28/30 → 0/30 (adaptador) | 28/30 → 0/30 (adaptador) | 86,0% → 86,6% (p = 0,69) |

Adaptador LoRA sobre UD-Q2_K_XL de Unsloth: rechazos 0,0% (EN) y 0,0% (RU); XSTest 7,6 puntos por debajo del original; MMLU (2000 preguntas) +0,55 puntos; rechazos en thinking 0/30 (low) y 0/30 (high); 20/20 llamadas de herramienta válidas; 3/3 needles en contexto largo; KL del primer token en prompts benignos 0,38; dirección residual restante en los escritores 5,9e-04. Sobre UD-IQ1_M, el mismo adaptador degrada MMLU de 85,6% a 72,0%.

## Requisitos de hardware

- VRAM/RAM para pesos: 139,8 GB (IQ1_M) y 199,6 GB (Q2_K). Es la cifra que el autor denomina "RAM + VRAM" y no incluye la tabla Engram, que puede quedar en SSD.
- Espacio en disco: 250,4 GB (IQ1_M) y 334,8 GB (Q2_K); el repositorio completo ocupa 585,7 GB.
- No cabe en ninguna GPU de consumo actual: 199,6 GB excede con holgura los 24 GB de una RTX 4090 o los 32 GB de una RTX 5090. El build IQ1_M tampoco entra en una única GPU de 80 GB.
- Configuraciones viables por aritmética de pesos: 2×A100/H100 de 80 GB (160 GB) cubren el IQ1_M con poco margen; el Q2_K requiere 3×80 GB o más. También encaja en equipos de memoria unificada de 192 GB o superiores, aunque el autor no valida ninguna plataforma concreta.
- El shard Engram se lee unas pocas filas por token y puede permanecer en SSD: hay que mantener mmap activado (opción por defecto) para que pagine desde disco.
- Despliegue: exclusivamente llama.cpp. DeepSeek-V4.1 no está en ninguna release de llama.cpp; hacen falta el pin de Unsloth (commit `9d907b7cfe0e`, PR #298) o el borrador upstream (PR #30817). No funciona en Atomic Chat todavía y no se mencionan vLLM, TGI, Ollama ni otros motores.
- Comando de referencia: `llama-server -m ...-00001-of-*.gguf --jinja -c 32768`. El modo thinking viene activado en la plantilla; se desactiva con `--chat-template-kwargs '{"enable_thinking": false}'`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | KLD / top-1 | MMLU | Rechazos (JBB EN) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este modelo, IQ1_M | no disponible (MoE) | no disponible | 0,2506 / 83,14% | 81,8% | 0,0% | MIT (cuantización) | GGUF, llama.cpp con fork |
| Este modelo, Q2_K | no disponible (MoE) | no disponible | 0,1001 / 89,45% | 86,6% | 0,0% | MIT (cuantización) | GGUF, llama.cpp con fork |
| Unsloth UD-IQ1_M (mismo layout) | no disponible | no disponible | 0,2227 / 84,37% | 85,6% | 88,9% | no disponible | GGUF, llama.cpp con fork |
| Unsloth UD-Q2_K_XL / mismo layout | no disponible | no disponible | 0,0829 / 90,45% | 86,0% | 91,4% | no disponible | GGUF, llama.cpp con fork |

La comparación relevante es contra los builds de Unsloth del mismo layout, porque comparten tipos de tensor y matriz de importancia: la diferencia medible es atribuible a la edición. Frente a ellos, este modelo pierde entre 0,02 y 0,03 de KLD y alrededor de 1 punto de top-1, mantiene MMLU dentro del ruido en Q2_K y lo degrada 3,8 puntos en IQ1_M, y elimina por completo los rechazos. No se dispone de datos de otros modelos comparables de la misma categoría.

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para no rechazar peticiones dañinas. No es apto para exposición directa a usuarios finales sin un filtro externo de entrada y salida; el propio autor lo plantea como herramienta medida, no como producto.
- El build IQ1_M no supera el umbral de calidad del autor: MMLU cae 3,8 puntos (85,6% → 81,8%, p = 0,003) frente a un límite declarado de 1,5 puntos, y aparecen bucles de razonamiento (3/30 en esfuerzo bajo, 5/30 en alto). El autor recomienda Q2_K si hay memoria suficiente.
- El adaptador LoRA está calculado sobre pesos en precisión completa; aplicado sobre un build de 1 bit deja de corresponder a los pesos a los que se suma y hundió MMLU de 85,6% a 72,0% en UD-IQ1_M. Solo debe usarse sobre builds de 2 bits o más.
- La model card disponible está truncada en la sección de metodología, por lo que no se puede verificar el procedimiento completo de cálculo de la dirección ni el conjunto exacto de bloques afectados.
- No hay información sobre sesgos del modelo base ni sobre su composición de datos; tampoco se declaran idiomas soportados, solo se evalúan inglés y ruso.
- La licencia MIT corresponde al repositorio de cuantización; la licencia del modelo base DeepSeek-V4.1-Flash-1017 no se indica, y las condiciones de uso comercial del derivado dependen de ella.
- Dependencia de un fork no publicado de llama.cpp (commit concreto o PR en borrador): no hay ruta de actualización garantizada ni soporte en motores de producción habituales.
- La longitud de contexto no está documentada formalmente; los 32768 tokens del ejemplo son una elección de invocación, no una especificación.
- Riesgo de alucinación y fidelidad de cuantización: la KLD de 0,2506 en IQ1_M indica una divergencia notable respecto al original, mayor que la del build equivalente de Unsloth.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Builds de referencia de Unsloth: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
- PR de Unsloth para llama.cpp (commit `9d907b7cfe0e`): https://github.com/unslothai/llama.cpp/pull/298
- Borrador upstream de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/30817
- Atomic Chat: https://atomic.chat/?utm_source=huggingface&utm_medium=referral&utm_campaign=hf_deepseek_v4_1_flash_1017_uncensored&utm_content=btn_atomic
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
