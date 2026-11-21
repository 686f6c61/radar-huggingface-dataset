# capyctl/Inkling-2-Mini-NVFP4-FP8

## Resumen

Inkling-2-Mini-NVFP4-FP8 es una derivada cuantizada del modelo multimodal Thinking Machines Inkling 2 Mini, publicada por el usuario capyctl. No se trata de una conversion FP8 completa del modelo, sino de una cuantizacion selectiva: exactamente 144 proyecciones de atencion (las matrices `wq_du`, `wk_dv`, `wv_dv`, `wr_du`, `gate_attn` y `wo_ud` en las 24 capas fisicas) pasan a E4M3 FP8 con escalas FP32 por canal de salida, mientras que los expertos NVFP4/MXFP8, la cabeza de salida BF16, el draft DSpark y el tokenizador permanecen byte a byte identicos al original.

El modelo base emplea una arquitectura con nucleo recurrentemente "loopeado": 24 capas fisicas que se ejecutan como 48 visitas, con las 12 capas centrales visitadas tres veces. Esta repeticion multiplica las lecturas de pesos densos, y ahi es donde apunta la cuantizacion selectiva: reducir el trafico de las proyecciones de atencion sin tocar los expertos de bajo bit ni la cabeza compartida con el borrador especulativo DSpark.

El checkpoint tiene 17.598.170.664 parametros y un tamano de repositorio de 19,5 GB (shard principal de 18.882.995.072 bytes frente a los 19.526.019.168 del original). Esta pensado para desplegarse con SGLang y una GPU GB10, y la model card reporta mediciones propias de throughput y calidad en ese entorno. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con nucleo loopeado (24 capas fisicas, 48 visitas; las 12 centrales se visitan tres veces) y expertos MoE |
| Parametros totales | 17.598.170.664 |
| Parametros activos | no disponible (top-8 de 128 expertos mencionado en la model card, sin cifra de parametros activos) |
| Longitud de contexto | 1.048.576 tokens (limite por defecto del modelo; verificado hasta 220k en retrieval y 110k en decodificacion) |
| Tipos de cuantizacion | Atencion selectiva E4M3 FP8 con escalas FP32 por canal; expertos NVFP4 (capas 0-19) y MXFP8 (capas 20-23); cabeza de salida en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato compressed-tensors para FP8), compatible con SGLang |

## Arquitectura y entrenamiento

La arquitectura parte de Thinking Machines Inkling 2 Mini: un transformer con atencion y capas densas combinadas con expertos mezclados (MoE), organizado en un nucleo recurrente de 24 capas fisicas que se ejecutan 48 veces, con las 12 capas centrales reutilizadas tres veces. El modelo incorpora ademas un borrador especulativo DSpark (decodificacion especulativa con gamma 7 y bloque 8 en la configuracion medida), una cabeza de salida BF16, embeddings, vision encoder, routers, controladores de bucle, sinks, convoluciones, base de logits relativos y normas.

Esta version concreta no reentrena nada: es una conversion de pesos. El conversor aplica escalado por maximo absoluto por fila y redondeo al mas cercano a E4M3, sin calibracion de activaciones ni busqueda de un objetivo de calidad. El motor usa el metodo linear FP8 de compressed-tensors con activaciones FP8 dinamicas por token y salidas BF16 hacia los kernels de atencion y bucle sin modificar. Se anaden 144 nuevas escalas FP32 de desquantizacion con forma `[output_channels, 1]`, se repara el indice para mapear los 1.388 tensores (incluidas las escalas) y se elimina el stub de cuantizacion superior obsoleto para que no ensombrezca los grupos hibridos de `hf_quant_config.json`. Los 1.100 tensores no objetivo se copiaron y verificaron contra los hashes del origen. No hay informacion sobre el dataset de entrenamiento del modelo base ni sobre fases de RLHF/DPO en la documentacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 1.048.576 tokens por defecto.
- Entrada image-text-to-text: el pipeline declarado es multimodal, con vision encoder preservado del modelo base.
- Razonamiento con modo de esfuerzo alto (high effort 0.9 en las mediciones) y tokens de razonamiento incluidos en el limite de salida.
- Tool calling / function calling: la model card reporta 28/30 en la prueba de herramientas con este checkpoint.
- Generacion de codigo: 149/164 en HumanEval segun las mediciones del autor.
- Razonamiento matematico: 240/250 en GSM8K segun las mediciones del autor.
- Decodificacion especulativa mediante el borrador DSpark incluido (sin cambios respecto al original).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historial muy largo gracias a su ventana por defecto de 1.048.576 tokens, con retrieval verificado hasta 220k tokens en la configuracion medida.
- Generacion de codigo en produccion: soporta tool calling y obtiene 149/164 en HumanEval, por lo que puede integrarse en pipelines de CI/CD para revision, generacion de tests o parcheo asistido.
- Analisis de documentos extensos con imagen: al ser image-text-to-text, permite procesar informes, capturas o diagramas junto a texto largo en una sola llamada.
- Asistente de razonamiento matematico: 240/250 en GSM8K lo hace adecuado para tutoria o verificacion de calculos en flujos educativos.
- Agentes multi-paso: la combinacion de tool calling, contexto largo y decodificacion especulativa DSpark permite orquestar tareas con varias llamadas a herramientas y estado persistente.
- Despliegue en hardware de borde o estacion de trabajo: con 17,6B parametros y cuantizacion hibrida NVFP4/FP8, esta pensado para servirse en una GB10 con SGLang, reduciendo el coste frente a pesos BF16.
- Servicio de inferencia de alto throughput: con 134,13 tokens/s agregados a 8 streams en la medicion del autor, es viable para cargas concurrentes moderadas en una sola GPU.

## Benchmarks y rendimiento

Mediciones del autor sobre GB10 con SGLang PR #51926 parcheado, DSpark gamma 7 / bloque 8, KV en BF16, memory share 0.80, temperatura cero, esfuerzo alto (0.9), una ronda de calentamiento y tres medidas. La comparativa incluye los pesos originales en el mismo motor y la receta comunitaria `tv-std` reproducida.

| Setup | Tokens/s agregados (1/2/4/8 streams) | Decode tokens/s (8k/32k/64k/110k) | GSM8K | Tools | HumanEval |
|---|---|---|---|---|---|
| Este checkpoint, SGLang DSpark parcheado | 47,31 / 66,59 / 89,06 / 134,13 | 42,67 / 40,57 / 40,99 / 32,72 | 240/250 | 28/30 | 149/164 |
| Pesos originales, SGLang DSpark | 46,42 / 62,35 / 83,42 / 128,53 | 38,21 / 36,45 / 34,89 / 33,12 | 49/50 (solo screen) | 30/30 (solo screen) | 151/164 |
| Receta comunitaria `tv-std` reproducida | 48,58 / 62,51 / 84,34 / 129,86 | 41,42 / 40,79 / 34,75 / 31,92 | 241 (dato truncado en la fuente) | no disponible | no disponible |

Ahorro logico declarado por el autor: 1.286.086.656 bytes por token de salida en decodificacion simple con batch uno (de 5.342.039.136 a 4.055.952.480 bytes en el subtotal de atencion seleccionada + top-8/128 expertos + cabeza de salida). Son flujos de pesos derivados de formas, no trafico DRAM medido ni prediccion de velocidad.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 19,5 GB en safetensors; con overhead de runtime y cache KV en BF16 se recomienda al menos 24-32 GB de memoria unificada o VRAM para el checkpoint completo.
- GPU medidas: NVIDIA GB10 (entorno DGX Spark), con memory share 0.80 y `MAX_JOBS=2`.
- Cabe en consumer GPU de 24 GB solo con margen ajustado y contextos cortos; para contextos de cientos de miles de tokens se necesita memoria muy superior.
- Opciones de despliegue: SGLang es el motor de referencia (PR #51926 con el parche de loader incluido); la model card no documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Throughput medido: 47,31 tokens/s agregados a 1 stream y 134,13 a 8 streams; decodificacion de 42,67 tokens/s a 8k de contexto bajando a 32,72 a 110k.
- El contexto por defecto de 1.048.576 tokens es un limite declarado, no una capacidad verificada: retrieval se comprobo hasta 220k y decodificacion hasta 110k.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-NVFP4-FP8 (este) | 17,6B | 1.048.576 | Atencion FP8 + expertos NVFP4/MXFP8 | Apache 2.0 | Hugging Face (repo privado hasta merge del PR de receta) |
| Inkling-2-Mini (original, thinkingmachines) | no disponible | 1.048.576 (limite por defecto) | NVFP4 / MXFP8 nativo, cabeza BF16 | no disponible en la informacion | Hugging Face |
| Inkling-2-Mini receta `tv-std` (tech2wild) | mismos pesos base | 262.144 | NVFP4 original, KV BF16, vLLM | no disponible | GitHub (receta comunitaria) |
| Inkling-2-Mini receta `tv-fp8` (tech2wild) | mismos pesos base | 1.048.576 | FP8 KV, vLLM | no disponible | GitHub (receta comunitaria) |

No se dispone de datos de benchmarks ni especificaciones de otros modelos de la misma categoria fuera del ecosistema Inkling 2 Mini en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion FP8 de atencion es selectiva y agresiva en las 144 proyecciones; el autor no realizo calibracion de activaciones ni optimizacion de calidad, solo redondeo E4M3 por fila.
- El repositorio esta marcado como privado hasta que se fusione el PR de la receta; los enlaces apuntan a la URL publica final, no necesariamente activa.
- El contexto de 1.048.576 tokens es un limite por defecto, no una capacidad medida: solo se verifico retrieval hasta 220k y decodificacion hasta 110k.
- Los benchmarks reportados son del autor, con prompts fijos y sin evaluacion independiente; algunas filas de comparacion estan truncadas en la fuente.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; aplican los del modelo base, no evaluados aqui.
- Idiomas soportados no declarados; no se puede garantizar calidad multilingue.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y sus pesos originales deben verificarse por separado.
- Requiere un parche de loader y una revision concreta de SGLang; no es un checkpoint plug-and-play en otros motores.
- El rendimiento medido se limita a GB10; no hay datos en A100, H100 ni RTX 4090.

## Enlaces

- Hugging Face: https://huggingface.co/capyctl/Inkling-2-Mini-NVFP4-FP8
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Recetas de conversion y manifiesto por tensor: https://github.com/edurdias/capyctl-recipes/tree/main/sglang/inkling-2-mini-capyctl-fp8-gb10/convert
- Comparativa de builds en GB10: https://github.com/edurdias/capyctl-recipes/tree/main/comparisons/inkling-2-mini-builds-gb10
- Receta comunitaria de referencia: https://github.com/tonyd2wild/Inkling-2-Mini-NVFP4-DGX-Spark
