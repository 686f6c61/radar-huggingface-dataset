# ProprietaryLegal/Volta-sPLIt-DeepSeek-V4.1-Flash-1017-8xV100-GGUF

## Resumen

Volta sPLIt es un kit de despliegue, no un modelo con pesos propios, publicado por PLI Labs (el brazo de investigación abierta de Proprietary Legal Intelligence) para servir DeepSeek-V4.1-Flash-1017 sobre ocho GPU V100-SXM2-32GB de 2018. El repositorio no contiene pesos: el modelo servido es byte-idéntico a ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF (expertos en IQ2_XXS, Engram en IQ4_NL), con la configuración, tokenizer y el drafter DSpark de deepseek-ai/DeepSeek-V4.1-Flash-1017. Lo que aporta este repositorio es el perfil de serving, los parches de motor (una serie de 49 parches sobre 1Cat-vLLM #1277), el conjunto de switches de producción, el harness de A/B y las mediciones.

El interés técnico está en exprimir hardware Volta (sm_70) con un MoE de gran tamaño: 248,8 GB de pesos con todos los expertos residentes en memoria de GPU, repartidos en PP2 x TP4 (capas 0-19 + Engram en la placa B; capas 20-39, cabeza y drafter DSpark en la placa C), sobre dos placas de cuatro GPU con NVLink y PCIe Gen3 entre ellas. El resultado declarado es de ~118 tok/s en decode con thinking desactivado y ~121 tok/s con thinking activado, con un contexto de 524.288 tokens por petición y un pool de KV de 2.076.870 tokens.

Es relevante ahora porque demuestra que un MoE grande puede servirse con latencias utilizables en GPU de generación anterior, algo que amplía el parque de hardware viable para inferencia de modelos abiertos de frontera. La contrapartida es que se trata de un artefacto de ingeniería muy específico (una sola máquina, una sola petición simultánea) y con cifras parcialmente estimadas, no de un modelo nuevo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE transformer (DeepSeek-V4.1-Flash-1017); el repositorio aporta el kit de serving, no la arquitectura |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 524.288 tokens por petición; pool KV de 2.076.870 tokens |
| Tipos de cuantización | GGUF con expertos IQ2_XXS y Engram IQ4_NL (build de ISTA-DASLab) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (los pesos residen en ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF; este repositorio no los aloja) |
| Tamaño en disco / memoria | 248,8 GB de pesos, todos los expertos residentes en VRAM |
| Layout de paralelismo | PP2 x TP4 sobre 8x V100-SXM2-32GB (sm_70) |
| Motor | 1Cat-vLLM #1277 + port PP2 propio + serie de 49 parches + "expert-kernel diet" |
| Configuración de serving | V1 runner, scheduling síncrono, CUDA graphs completos de 1 a 6 tokens, chunked prefill de 8.192, prefix caching, thinking activado por defecto |
| Drafter | DSpark, 5 drafts por ronda (decodificación especulativa) |

## Arquitectura y entrenamiento

El modelo subyacente es DeepSeek-V4.1-Flash-1017, un MoE de DeepSeek del que la información disponible no detalla número de parámetros, tokens de entrenamiento ni composición del dataset. Lo que sí se documenta es el stack de inferencia: un motor derivado de 1Cat-vLLM #1277 con un port de pipeline parallelism a dos etapas y una pila de palancas de optimización. El reparto PP2 x TP4 coloca las capas 0-19 más el módulo Engram en la placa B y las capas 20-39, la cabeza de salida y el drafter DSpark en la placa C; la comunicación entre placas va por PCIe Gen3, lo que convierte la latencia de intercambio en el cuello de botella principal del diseño.

Las optimizaciones aplicadas incluyen seis palancas sobre el camino de tokens y el drafting, fusión de planes, keep-batch, kernels rápidos de expertos y fusiones de atención, más una "dieta de instrucciones" en el kernel de expertos que es la última mejora adoptada (de ~114 a ~118 tok/s estimados). La decodificación especulativa con DSpark (5 drafts por ronda) se usa para acelerar el decode sin alterar la distribución de salida: según el autor, cada cambio adoptado es bit a bit idéntico o supera una puerta de identidad byte a byte en modo greedy. No se documentan en la información disponible detalles de RLHF, DPO ni composición del corpus de entrenamiento.

## Capacidades

- Generación de texto y razonamiento en modo thinking, activado por defecto en el perfil de producción.
- Modo thinking alto ("thinking high"), usado en los benchmarks de prompts largos del build hermano DGX sPLIce.
- Procesamiento de contextos muy largos: hasta 524.288 tokens por petición, con recuperación de agujas verificada a ~450K y ~498K tokens (6 de 6 en 4 de 4 ejecuciones).
- Decodificación especulativa integrada en el motor (DSpark), transparente para el usuario.
- Prefix caching y chunked prefill para reutilizar prefijos largos entre peticiones.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling, uso de agentes y multimodalidad: no disponibles en la información proporcionada.

## Casos de uso

- Análisis de expedientes legales extensos: el contexto de 524K tokens permite cargar contratos, escritos y correspondencia completos en una sola petición, con prefix caching para reutilizar el mismo expediente en consultas sucesivas. Es el caso natural dado el origen del proyecto (Proprietary Legal Intelligence).
- Revisión documental con recuperación de agujas: la verificación a ~450K y ~498K tokens respalda tareas de "encuentra la cláusula X en este corpus", con la salvedad de que la lectura de prompts largos es lenta (536 s para 500K tokens).
- Reutilización de parque V100 existente: organizaciones con servidores de 8x V100-SXM2 pueden servir un MoE grande sin migrar a Hopper, aceptando una petición simultánea y ~118 tok/s por stream.
- Generación de código y texto estructurado en modo batch: el motor soporta CUDA graphs de 1 a 6 tokens y chunked prefill, adecuado para pipelines de generación por lotes; el rendimiento por tipo de texto (código, estructurado, chat, prosa) aún no está medido.
- Reproducción de investigación en serving: el harness de A/B y los 49 parches documentados permiten reproducir cada palanca y medir su efecto en ms por ronda, útil para equipos que estudian optimización de inferencia en sm_70.
- Despliegue con razonamiento profundo en dominios técnicos: el modo thinking alto con ~121 tok/s permite cadenas de razonamiento largas sin penalización severa de latencia frente al modo sin thinking.
- Base para comparativas de hardware: el build hermano DGX sPLIce (2x DGX Spark + 2x RTX 3090 con offload x86) sirve como referencia cruzada para decidir entre plataformas.

## Benchmarks y rendimiento

Rendimiento de serving medido por el autor (single stream, una petición a la vez, 8x V100-SXM2-32GB a 150 W, DSpark 5 drafts por ronda):

| Métrica | Thinking off | Thinking on | Etiqueta |
|---|---:|---:|---|
| Volta sPLIt, producción (2026-11-03) | ~118 tok/s | ~121 tok/s | ESTIMATED |
| Thinking high (benchmark de DGX sPLIce) | — | 84,6-87,3 tok/s | MEASURED |
| Tras prompt de 500K tokens | — | 61,7 tok/s | MEASURED |

Progresión en el mismo host de 8x V100:

| Build | Fecha | Thinking off | Thinking on | Etiqueta |
|---|---|---:|---:|---|
| Build previo: pack EXL3 sobre motor SM70 de philbert440 | 2026-11-01 | 42-46 | 31,4 | MEASURED |
| Port PP2 x TP4 de 1Cat #1277, sin palancas | 2026-11-03 | 99,2 | 88,0 | MEASURED |
| + seis palancas de camino de tokens y draft | 2026-11-03 | ~105,8 | ~108,4 | MEASURED |
| + fusión de planes, keep-batch, kernels de expertos, fusiones de atención | 2026-11-03 | ~114 | ~117 | MEASURED |
| + dieta de instrucciones del kernel de expertos (producción) | 2026-11-03 | ~118 | ~121 | ESTIMATED |

Prompts largos (thinking high, MEASURED 2026-11-03):

| Prompt | Primer token | Lectura de prompt | Decode posterior |
|---|---:|---:|---:|
| 32.000 tokens | 22,3-22,5 s | ~1.430 tok/s | 86,8-87,3 tok/s |
| 150.000 | 111,1-111,7 s | ~1.350 tok/s | 79,8-80,3 tok/s |
| 300.000 | 264,9 s | ~1.130 tok/s | 71,8 tok/s |
| 500.000 (literal) | 536 s | ~930 tok/s | 61,7 tok/s |
| 300K con prefill skip (en pruebas, 1 repetición, salida idéntica) | 181,3 s | ~1.650 tok/s | — |

Métrica de motor (ms por ronda): T=0 de 31,1 a 29,55 a ~27,1 (MEASURED) y ~26,2 ms (ESTIMATED); T=1 de 31,7 a 30,0 a ~27,7 y ~26,8 ms.

Benchmarks de calidad del modelo: ISTA-DASLab reporta 100 % de recuperación en AIME25, GPQA-Diamond y LiveCodeBench v6 con IQ2_XXS, pero es una afirmación del upstream no reproducida por el autor de este repositorio y sobre benchmarks pequeños. La fidelidad a nivel de token frente al modelo sin cuantizar no está medida todavía.

## Requisitos de hardware

- VRAM: 248,8 GB de pesos con todos los expertos residentes, más el pool KV de 2.076.870 tokens; el perfil está pensado para 8x V100-SXM2-32GB (256 GB agregados), sin margen para holguras grandes.
- GPU: exclusivamente V100-SXM2-32GB (sm_70) en la configuración publicada; existe también un perfil de 4 tarjetas en `forks/1cat-4xv100-tp4/`. El build hermano cubre 2x DGX Spark + 2x RTX 3090 con offload x86.
- Consumer GPU: no cabe en ninguna GPU de consumo individual; requiere el conjunto de 8 V100 o el clúster alternativo documentado.
- Interconexión: dos placas de 4 GPU con NVLink y PCIe Gen3 entre placas; la latencia de ese enlace condiciona el throughput.
- Despliegue: motor 1Cat-vLLM #1277 con el port PP2 y la serie de 49 parches; no se documenta soporte para llama.cpp, Ollama o TGI en la información disponible.
- Latencias: primer token de 22,3 s con 32K de prompt y 536 s con 500K; lectura de prompt entre ~930 y ~1.430 tok/s, por debajo de los ~2.200 tok/s del build sobre DGX Spark.
- Concurrencia: una petición simultánea en producción; hay un build de dos peticiones en pruebas.
- Potencia: perfil medido con las V100 limitadas a 150 W.

## Comparativa con modelos similares

| Aspecto | Volta sPLIt (este repo) | DGX sPLIce (build hermano) | Build previo EXL3 sobre SM70 |
|---|---|---|---|
| Hardware | 8x V100-SXM2-32GB (2018) | 2x DGX Spark + 2x RTX 3090 con offload x86 | 8x V100 con motor SM70 de philbert440 |
| Pesos | 248,8 GB, expertos IQ2_XXS / Engram IQ4_NL | mismos pesos base | pack EXL3 |
| Contexto | 524.288 tokens | no disponible en detalle | no disponible |
| Decode thinking off | ~118 tok/s (ESTIMATED) | no disponible | 42-46 tok/s (MEASURED) |
| Decode thinking on | ~121 tok/s (ESTIMATED) | 84,6-87,3 tok/s (MEASURED) | 31,4 tok/s (MEASURED) |
| Lectura de prompt | ~930-1.430 tok/s | ~2.200 tok/s | no disponible |
| Licencia | Apache 2.0 | Apache 2.0 (presumible, no confirmado) | no disponible |

Frente a modelos de la misma categoría (otros MoE abiertos servidos en GGUF), la información disponible no permite establecer comparaciones de parámetros, contexto o calidad porque no se detallan las especificaciones del modelo base.

## Limitaciones y advertencias

- El repositorio no contiene pesos: quien lo descargue debe obtener por separado los GGUF de ISTA-DASLab y la configuración de deepseek-ai; el kit asume commits concretos (`ad1e8991` y `1bae0e10`).
- Las cifras de ~118 y ~121 tok/s son ESTIMATED (medición menos la ganancia de la última palanca), no medidas directamente.
- Una sola petición simultánea en producción; el build de dos peticiones está en pruebas.
- La lectura de prompts es lenta (930-1.430 tok/s), por debajo del build sobre DGX Spark (~2.200 tok/s) y del build previo en V100.
- La fidelidad a nivel de token frente al modelo sin cuantizar no está medida; la cuantización IQ2_XXS es muy agresiva y las afirmaciones de calidad del upstream (AIME25, GPQA-Diamond, LiveCodeBench v6) no han sido reproducidas.
- El rendimiento por tipo de texto (código, estructurado, chat, prosa) no está medido todavía.
- Riesgo de alucinación, sesgos e idiomas soportados: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los pesos de terceros pueden tener condiciones propias que deben verificarse en sus repositorios.
- El proyecto está muy acoplado a una topología concreta (8x V100, PP2 x TP4, PCIe Gen3 entre placas); trasladarlo a otro hardware exige revisar los parches y el perfil de serving.
- Sin descargas ni likes en el momento de la consulta y con un único commit reciente: madurez y soporte comunitario limitados.

## Enlaces

- HuggingFace: https://huggingface.co/ProprietaryLegal/Volta-sPLIt-DeepSeek-V4.1-Flash-1017-8xV100-GGUF
- Pesos base (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo original (DeepSeek): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repositorio completo: https://github.com/ProprietaryLegal/Volta-sPLIt-DeepSeek-V4.1-Flash-1017-8xV100-SXM2-PP2xTP4
- Build hermano DGX sPLIce: https://github.com/ProprietaryLegal/DGX-sPLIce-DeepSeek-V4.1-Flash-2xDGX-Spark-2xRTX3090-drafter-x86-offload
- PLI Labs: https://proprietarylegal.ai/labs.html
- Proprietary Legal Intelligence: https://proprietarylegal.ai
