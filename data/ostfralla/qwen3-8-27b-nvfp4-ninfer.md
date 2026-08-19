# Ostfralla/Qwen3.8-27B-NVFP4-NInfer

## Resumen

Este repositorio publica un artefacto cuantizado en NVFP4 (4-bit FP4) del modelo Qwen3.8-27B, preparado específicamente para el motor de inferencia NInfer. El autor, Ostfralla, parte del artefacto original de neroued (que usa un perfil groupwise-int) y lo reempaqueta para aprovechar los tensor cores FP4 de las GPUs Blackwell, logrando una aceleración significativa sin pérdida de calidad. El modelo base es Qwen3.8-27B, un modelo de 27 mil millones de parámetros con arquitectura híbrida que incluye atención lineal DeltaNet, según se desprende de la descripción del artefacto.

La relevancia de este artefacto radica en que permite ejecutar un modelo de 27B en una GPU consumer de 32 GB (RTX 5090) con velocidades de decodificación superiores a 800 tokens por segundo en modo multi-slot, manteniendo exactamente la misma precisión que el artefacto original en tareas de código y matemáticas. Incluye además un parche necesario para que el motor NInfer reconozca la identidad `qwen3.8-27b/nvfp4`, que aún no está integrado en el upstream.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el modelo base Qwen3.8-27B no se detalla; el artefacto menciona proyecciones DeltaNet y linear_attn, lo que sugiere una arquitectura híbrida con atención lineal) |
| Parametros totales | 27 mil millones (según denominación del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (valor usado en el comando de ejemplo del motor; no confirmado como spec del modelo base) |
| Tipos de cuantizacion | NVFP4 (4-bit FP4, tensor cores Blackwell); el artefacto original usa groupwise-int (Q4/Q5/W8) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ninfer (formato propietario del motor NInfer) |

## Arquitectura y entrenamiento

El artefacto es una cuantización NVFP4 del modelo Qwen3.8-27B, realizada con `llm-compressor` sobre los pesos BF16 originales. Se cuantizan las proyecciones DeltaNet (`in_proj_qkv`, `in_proj_z`, `out_proj`), mientras que `in_proj_a` e `in_proj_b` se mantienen en BF16 por restricciones de CUTLASS FP4 (requiere N % 64 == 0, y N=48 no cumple). Esto indica que el modelo base incorpora una capa de atención lineal tipo DeltaNet, probablemente combinada con atención estándar.

Una innovación técnica destacable es la reconciliación de escalas globales de grupos fusionados: NInfer fusiona `in_proj_qkv` con `in_proj_z` en un único objeto con una sola `weight_global_scale`, pero llm-compressor cuantiza cada módulo de forma independiente, generando escalas discrepantes (factores 1.12–1.82). El autor demuestra que la escala correcta para la matriz concatenada es la menor de las escalas de los miembros, y re-cuantiza desde BF16 bajo esa escala compartida, evitando el doble redondeo de las escalas de bloque ya convertidas a E4M3. El coste medido es nulo: el error medio de reconstrucción pasa de 0.09471 a 0.09470, sin escalas de bloque bajo cero.

No se proporcionan datos sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO).

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.8-27B.
- Razonamiento matemático de alto nivel: obtiene 55/60 (91.67%) en los conjuntos AIME25 y AIME26 combinados.
- Generación de código: 152/164 (92.68%) en HumanEval+, con resultados idénticos al artefacto original groupwise-int.
- Modo de pensamiento (thinking mode): el motor NInfer aplica presets de muestreo específicos según el modo (thinking 1.0 / 0.95 / 20; non-thinking 0.7 / 0.80 / 20 / presence 1.5), lo que sugiere que el modelo distingue entre respuestas razonadas y directas.
- Decodificación especulativa MTP (multi-token prediction): soporta hasta 4 tokens de borrador, alcanzando 202 tok/s en decodificación de flujo único.
- No se menciona soporte explícito de tool calling, function calling, visión ni audio en la información disponible.

## Casos de uso

- Inferencia de alta velocidad en GPUs Blackwell para aplicaciones de chat en tiempo real: con 882 tok/s de decodificación multi-slot, puede atender hasta 6 sesiones concurrentes con latencia baja, adecuado para productos de asistente conversacional.
- Resolución de problemas matemáticos avanzados: con un 91.67% en AIME25/26, puede integrarse en sistemas de tutoría o evaluación de razonamiento matemático donde se requiera precisión determinista.
- Generación de código en entornos de desarrollo asistido: el 92.68% en HumanEval+ lo hace viable para autocompletado o generación de funciones en pipelines CI/CD, con la ventaja de ocupar solo ~17 GiB de VRAM.
- Despliegue en estaciones de trabajo con una única GPU de 32 GB: al caber en una RTX 5090, permite ejecutar un modelo de 27B en hardware consumer, sin necesidad de servidores multi-GPU.
- Investigación en cuantización de precisión FP4: el proceso de construcción documentado (reconciliación de escalas, re-cuantización desde BF16) sirve como referencia para otros modelos con capas de atención lineal.
- Evaluación comparativa de motores de inferencia: al ser un artefacto independiente del motor, puede usarse para medir el rendimiento de NInfer frente a otras soluciones como llama.cpp en la misma GPU.

## Benchmarks y rendimiento

Los resultados fueron medidos en una RTX 5090 de 32 GB, con el mismo motor, mismas banderas, greedy (temperatura 0) y 6 slots concurrentes. La comparación es pareada porque la decodificación es determinista.

| Benchmark | Este artefacto (nvfp4) | Artefacto original (groupwise-int) | Desacuerdos |
|---|---|---|---|
| HumanEval+ (código, 164 problemas) | 152/164 = 92.68% | 152/164 = 92.68% | 3 vs 3 |
| AIME25 + AIME26 (matemáticas, 60 problemas) | 55/60 = 91.67% | 55/60 = 91.67% | 5 vs 5 |
| Total (224 problemas) | 207 | 207 | 8 vs 8 |

| Benchmark | Tiempo nvfp4 | Tiempo int | Aceleración | Decodificación nvfp4 | Decodificación int |
|---|---|---|---|---|---|
| HumanEval+ (164) | 694 s | 1 080 s | 1.56x | 882 tok/s | 385 tok/s |
| AIME25 + 26 (60) | 1 287 s | 2 544 s | 1.98x | 807 tok/s | 414 tok/s |

En decodificación de flujo único se alcanzan 202 tok/s con MTP, y el prefill ronda los 5 950 tok/s (frente a ~1 700 tok/s de llama.cpp con Q5_K_XL). La VRAM ocupada es de 16.78 GiB con MTP, frente a 15.92 GiB del artefacto groupwise-int y 18.83 GiB de Q5_K_XL.

## Requisitos de hardware

- GPU obligatoria: Blackwell con compute capability 12.0 (RTX 5090 y similares). NVFP4 no funciona en Ada ni Hopper.
- VRAM: ~17 GiB para los pesos; se recomienda una tarjeta de 32 GB para disponer de contexto útil.
- Opciones de despliegue: motor NInfer con el parche `qwen38-nvfp4-support.patch` incluido en el repositorio. No se mencionan alternativas como vLLM, Ollama o TGI para este formato.
- Latencia y throughput: decodificación multi-slot de 807–882 tok/s, decodificación single-stream de 202 tok/s con MTP, prefill de ~5 950 tok/s.
- No cabe en GPUs consumer anteriores (RTX 40 series, por ejemplo) debido a la dependencia de los tensor cores FP4.

## Comparativa con modelos similares

La información disponible solo permite comparar este artefacto con su equivalente groupwise-int y con una cuantización de llama.cpp.

| Parametro | Este artefacto (nvfp4) | Artefacto groupwise-int | llama.cpp Q5_K_XL |
|---|---|---|---|
| Tipo de cuantización | NVFP4 (4-bit FP4) | Q4/Q5/W8 (groupwise-int) | Q5_K_XL |
| VRAM (con MTP) | 16.78 GiB | 15.92 GiB | 18.83 GiB |
| Calidad (HumanEval+ / AIME) | 92.68% / 91.67% | 92.68% / 91.67% | No disponible |
| Decodificación multi-slot | 807–882 tok/s | 385–414 tok/s | No disponible |
| Prefill | ~5 950 tok/s | No disponible | ~1 700 tok/s |
| Licencia | Apache-2.0 | Apache-2.0 | Apache-2.0 |

No se dispone de comparaciones con otros modelos de tamaño similar (por ejemplo, Llama 3.1 70B o Qwen2.5 32B) en la información proporcionada.

## Limitaciones y advertencias

- Requiere exclusivamente GPUs Blackwell (compute capability 12.0); no es ejecutable en arquitecturas Ada o Hopper.
- El parche del motor NInfer no está integrado en el upstream (issue #25). Si no se aplica, el motor rechaza el artefacto con el error `artifact identity 'qwen3.8-27b/nvfp4' is not supported by target 'qwen3_6_27b'`.
- Bajo decodificación greedy, este artefacto trunca 5 de 164 problemas de HumanEval+ al alcanzar el límite de 50k tokens, frente a 3 del artefacto groupwise-int. Esto indica una ligera tendencia a caer en bucles de razonamiento. Con muestreo activado no ocurre.
- La calidad solo está validada en HumanEval+ y AIME25/26. No se ha probado en tareas de contexto largo ni multilingües.
- La VRAM es ligeramente superior a la del artefacto groupwise-int (16.78 GiB frente a 15.92 GiB), por lo que la ganancia es de velocidad, no de memoria.
- No se dispone de información sobre sesgos, alucinaciones o comportamiento en dominios específicos más allá de los benchmarks citados.
- El formato de pesos `.ninfer` es propietario del motor NInfer, lo que limita la portabilidad a otros motores de inferencia.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/Ostfralla/Qwen3.8-27B-NVFP4-NInfer
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Artefacto original (groupwise-int): https://huggingface.co/neroued/Qwen3.8-27B-NInfer
- Repositorio del motor NInfer: https://github.com/Neroued/ninfer
- Issue upstream sobre soporte NVFP4: https://github.com/Neroued/ninfer/issues/25
