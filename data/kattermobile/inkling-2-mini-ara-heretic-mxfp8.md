# KatterMobile/Inkling-2-Mini-ARA-HERETIC-MXFP8

## Resumen

Inkling-2-Mini-ARA-HERETIC-MXFP8 es una variante "abliterated" (descensurada) del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario KatterMobile en Hugging Face. El modelo base es un transformer MoE con mecanismo de bucle (arquitectura `inkling2_loop`) de 26.4B parametros totales y 3.4B activos, disenado para tareas de razonamiento, generacion de texto y vision-lenguaje (image-text-to-text). Esta version concreta aplica una edicion de pesos mediante la herramienta Heretic v2.2.0 con el modificador ARA (Arbitrary-Rank Ablation) para reducir la tasa de rechazos del modelo, y posteriormente reconvierte los expertos enrutados de NVFP4 a MXFP8 usando NVIDIA ModelOpt.

El resultado es un artefacto de investigacion sin alineamiento de seguridad deliberado: segun la model card, el Trial 41 del estudio Optuna reduce los rechazos a 15/100 sobre `mlabonne/harmful_behaviors` manteniendo una divergencia KL de 0.2725 respecto al modelo base. La edicion afecta a 10 capas de atencion (capas 8-18) mediante una LoRA de rango 50 fusionada en las proyecciones de salida de atencion, mientras que 14 capas quedan byte-identicas al original.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de cuantizacion mixta (MXFP8 con escalas E8M0 de bloque 32) sobre un MoE con arquitectura no estandar; por otro, sirve como caso de estudio de los riesgos de las builds abliterated, que degradan intencionadamente el alineamiento de seguridad y requieren evaluacion cuidadosa antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle (`inkling2_loop`), 24 capas fisicas, capas 6-17 ejecutadas 3x por forward pass, 128 expertos enrutados por capa MoE |
| Parametros totales | 27.153.053.184 (segun safetensors); 26.4B segun model card |
| Parametros activos | 3.4B |
| Longitud de contexto | 262.144 tokens (segun comando de servicio vLLM de la model card) |
| Tipos de cuantizacion | MXFP8 (E4M3 + escalas E8M0 bloque 32) en expertos enrutados; BF16/FP32 en embeddings, lm_head, atencion, normas, torre de vision y especulador MTP; GGUF Q4_K_M disponible en repo separado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF Q4_K_M en repo alternativo |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura MoE con bucle: 24 capas fisicas en las que las capas 6 a 17 se ejecutan tres veces por cada forward pass, lo que incrementa la profundidad efectiva sin aumentar el numero de parametros. Cada capa MoE contiene 128 expertos enrutados y activa aproximadamente 3.4B de los 26.4B parametros totales. Incluye ademas una torre de vision (pipeline image-text-to-text), un especulador MTP (multi-token prediction) para decodificacion especulativa y tensores de residual de atencion en FP32. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

Sobre esta base, la build ARA-HERETIC aplica una LoRA de rango 50 (alpha 50) sobre `o_proj.linear` en las capas 8 a 18, fusionada en BF16 con preservacion de magnitudes de fila (ARA). Los hiperparametros del Trial 41 son: `preserve_good_behavior_weight=0.6677`, `steer_bad_behavior_weight=0.7807`, `overcorrect_relative_weight=0.9430` y `neighbor_count=4`. Posteriormente, los 40 tensores de expertos enrutados (capas 0-19, `w13`/`w2`) se convierten de NVFP4 a MXFP8 con ModelOpt 0.49.0rc1.dev66, con un error relativo L2 de desquantizacion de 0.018-0.033. Las capas 20-23 ya eran MXFP8 y permanecen byte-identicas. En total, 741 tensores se mantienen en BF16/FP32 y 1060 tensores se verifican byte-identicos al checkpoint fuente; el informe completo se distribuye como `merge_mxfp8_report.json`.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso, con modo de razonamiento (`--reasoning-parser inkling` en vLLM).
- Procesamiento de imagen y texto (pipeline image-text-to-text) gracias a la torre de vision integrada.
- Tool calling y function calling nativos (`--enable-auto-tool-choice --tool-call-parser inkling` en vLLM).
- Decodificacion especulativa mediante especulador MTP incluido en el checkpoint.
- Contexto largo de hasta 262.144 tokens para conversaciones y documentos extensos.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Comportamiento descensurado: el modelo responde a peticiones que el base rechaza, lo que constituye una capacidad tecnica pero tambien un riesgo de seguridad.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la ablacion de direcciones de rechazo afecta a la distribucion de salidas, comparando directamente con el base mediante la metrica KL reportada (0.2725).
- Evaluacion de tecnicas de cuantizacion: sirve como banco de pruebas para validar la conversion NVFP4 a MXFP8 en MoE con 128 expertos por capa y medir el impacto del error L2 (0.018-0.033) en tareas de razonamiento.
- Analisis de robustez de clasificadores de rechazo: los 15/100 rechazos sobre `mlabonne/harmful_behaviors` permiten calibrar y evaluar clasificadores de seguridad propios frente a modelos abliterated.
- Procesamiento de documentos largos con vision: el contexto de 262.144 tokens y la torre de vision permiten resumir o extraer informacion de informes escaneados y conversaciones extensas en un unico pase.
- Pipelines de agentes con tool calling: la integracion nativa con vLLM (parsers de razonamiento y herramientas) facilita desplegar agentes multi-paso en entornos controlados de investigacion.
- Estudio de arquitecturas con bucle: el patron de ejecucion triple de las capas 6-17 permite investigar el equilibrio entre profundidad efectiva, coste computacional y calidad, comparando con transformers MoE convencionales.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas de seleccion del estudio Heretic:

| Metrica | Valor | Evaluacion |
|---|---|---|
| Rechazos (clasificador) | 15 / 100 | VINAY-UMRETHE/Refusal-Classifier-V2 sobre `mlabonne/harmful_behaviors` (test) |
| Divergencia KL vs base | 0.2725 | distribuciones del primer token sobre `mlabonne/harmless_alpaca` |
| Error relativo L2 de desquantizacion de expertos | 0.018-0.033 | conversion NVFP4 a MXFP8 |
| Tensores byte-identicos al fuente | 1060 | verificacion del pipeline de merge |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 29.8 GB en safetensors; con overhead de KV cache para contexto largo (262.144 tokens) y margen de servicio, se recomienda al menos 40-48 GB de memoria GPU para despliegue comodo.
- GPU recomendadas: NVIDIA GB10 (DGX Spark, 128 GB unificados) fue la plataforma usada para el merge y la verificacion; para servicio, A100 80 GB, H100 o GPUs con soporte de MXFP8 y al menos 48 GB.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en formato MXFP8 completo; la version GGUF Q4_K_M del repo alternativo puede caber en GPUs de 24 GB o en configuraciones con offload.
- Despliegue: vLLM con build nightly cu135 que soporte la arquitectura `inkling2_loop` (`vllm-0.34.1rc1.dev100+gc2cc003c5`, imagen `vllm/vllm-openai:cu135-nightly-c2cc003c5b644095cabcd5212d2967546ce344f8`); llama.cpp/Ollama solo mediante el GGUF Q4_K_M; las releases estandar de transformers y vLLM no reconocen esta arquitectura.
- Comando de servicio verificado (de la model card): `vllm serve <repo> --max-model-len 262144 --max-num-seqs 4 --max-num-batched-tokens 8192 --gpu-memory-utilization 0.85 --reasoning-parser inkling --enable-auto-tool-choice --tool-call-parser inkling`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Inkling-2-Mini-ARA-HERETIC-MXFP8 (este) | 27.15B / 3.4B | 262.144 | Apache 2.0 | Abliterated, MXFP8 en expertos, requiere vLLM nightly |
| thinkingmachines/Inkling-2-Mini (base) | 26.4B / 3.4B | no disponible | Apache 2.0 | Alineamiento intacto; mismo formato mixto NVFP4/MXFP8/BF16 |
| KatterMobile/Inkling-2-Mini-ARA-HERETIC-GGUF | 26.4B / 3.4B | no disponible | Apache 2.0 | Misma edicion ARA-HERETIC en Q4_K_M para llama.cpp |

No se dispone de datos de benchmarks comparativos de capacidad entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Alineamiento de seguridad reducido deliberadamente: el modelo cumple peticiones que el base rechaza (15/100 rechazos frente al comportamiento del original), lo que lo hace inadecuado para aplicaciones de cara al publico sin capas de moderacion adicionales.
- Riesgo elevado de contenido danino: al ser un artefacto de investigacion descensurado, puede generar contenido ilegal o perjudicial; el usuario es responsable de los outputs y del cumplimiento legal.
- Arquitectura no soportada por herramientas estandar: transformers y vLLM convencionales no reconocen `inkling2_loop`; solo funciona con builds nightly especificas, lo que complica el mantenimiento en produccion.
- Sesgos: no se han documentado evaluaciones de sesgo en la informacion disponible; la ablacion puede alterar la distribucion de respuestas de forma no controlada mas alla de la tasa de rechazos.
- Alucinacion: no hay datos publicados de tasas de alucinacion; el cambio de cuantizacion NVFP4 a MXFP8 introduce un error L2 de 0.018-0.033 en expertos que puede afectar levemente a la fidelidad.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar calidad multilingue.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de alineamiento hace recomendable una revision legal y de seguridad antes de cualquier despliegue.
- Contexto largo: aunque se anuncia 262.144 tokens, no se han publicado evaluaciones de calidad en ventanas extremas con esta build.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KatterMobile/Inkling-2-Mini-ARA-HERETIC-MXFP8
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Version GGUF Q4_K_M: https://huggingface.co/KatterMobile/Inkling-2-Mini-ARA-HERETIC-GGUF
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Dataset de evaluacion de rechazos: `mlabonne/harmful_behaviors`
- Dataset de evaluacion KL: `mlabonne/harmless_alpaca`
- Clasificador de rechazos: `VINAY-UMRETHE/Refusal-Classifier-V2`
