# j2ipper/GLM-5.3-Flash-a4e3s

## Resumen

GLM-5.3-Flash-a4e3s es una cuantización GGUF mixta de 2-4 bits del modelo zai-org/GLM-5.3-Flash, publicada por el usuario j2ipper. No se trata de un modelo original, sino de un artefacto de compresión diseñado específicamente para caber en una máquina AMD Strix Halo con 128 GB de memoria unificada (Ryzen AI Max+ 395, Radeon 8060S). El autor lo describe como el fichero de pesos que acompaña a Talus, un runtime de inferencia propio.

El modelo base es un transformer de tipo MoE con 320.759.404.382 parámetros totales (según los safetensors del modelo original) y una arquitectura que combina atención MLA, capas KDA (atención lineal) y expertos enrutados. La cuantización preserva los expertos enrutados de la versión UD-IQ3_XXS de Unsloth byte a byte, salvo tres excepciones, y recuantiza atención, proyecciones KDA, expertos compartidos y FFN densa para liberar espacio para el contexto y el drafter especulativo.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización por capas con matriz de importancia orientada a hardware consumer de gama alta; por otro, advierte de que se trata de un artefacto muy específico, con calidad medida únicamente mediante divergencia KL frente al modelo original y sin benchmarks de tareas publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención MLA, capas KDA (atención lineal) y capa NextN (MTP) para decodificación especulativa |
| Parametros totales | 320.759.404.382 |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens (configuración de referencia en Talus) |
| Tipos de cuantizacion | IQ2_S, IQ3_S, Q4_K, Q2_K, Q3_K, Q8_0, Q6_K, Q5_K, F32 (mezcla por tensor) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (4 shards, 109,45 GiB, 1.412 tensores) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura MoE con atención MLA (Multi-head Latent Attention), capas KDA de atención lineal y una capa NextN (Multi-Token Prediction) en la posición 45 que actúa como drafter especulativo. La cuantización aquí descrita no aporta información sobre el entrenamiento original: no se detallan tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO. Lo que sí documenta el autor es el proceso de recuantización en tres pasos con `llama-quantize --allow-requantize --keep-split` y ficheros de tipos por tensor.

El paso 1 (a4) convierte atención, proyecciones KDA, expertos compartidos y FFN densa de Q6_K a Q4_K, excepto en las capas 11 y 45. El paso 2 (a4e3) rebaja tres tensores `ffn_down_exps` de IQ4_XS a IQ3_S usando una matriz de importancia calculada con `llama-imatrix -c 512 -b 512 --chunks 150` sobre texto técnico privado en inglés y código. El paso 3 (a4e3s) rebaja MLA `attn_q_b`, `attn_output` de la capa 11, `attn_q_a`, expertos compartidos y `nextn.eh_proj` de Q8_0 a Q6_K, `output` a Q5_K y `token_embd` a Q4_K. Los tensores MLA `attn_k_b`, `attn_v_b`, `attn_kv_a_mqa`, las proyecciones `ssm_*` de KDA, los `hc_*` y el indexador DSA se mantienen en Q8_0.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Razonamiento multi-paso y soporte de agentes, inferido del uso de tokens de parada como `<|observation|>` y de la compatibilidad con endpoints.
- Decodificación especulativa mediante la capa NextN (MTP) incluida en el fichero, con vocabulario de draft de 65.536 entradas.
- Compatibilidad con llama.cpp en builds que soporten la arquitectura `glm5-next`.
- Capacidades multilingües: no disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Inferencia local en estaciones Strix Halo: el modelo está dimensionado para 128 GB de memoria unificada, por lo que permite ejecutar un MoE de 320.000 millones de parámetros en un equipo de sobremesa sin GPUs discretas, usando Talus con ROCm.
- Servicio de API compatible con endpoints: Talus expone `talus-server` con `STRATA_API_KEY`, lo que permite montar un endpoint HTTP local para integrarlo en herramientas que consuman APIs de chat.
- Prototipado de agentes con observaciones: los tokens de parada `<|user|>`, `<|observation|>` y `<|endoftext|>` sugieren un formato orientado a bucles de agente con observaciones intermedias.
- Investigación sobre cuantización extrema: el recetario publicado (`recipe/` con ficheros de tipos, script generador y matriz de importancia) sirve como referencia reproducible para estudiar el impacto de rebajar tensores concretos de atención y FFN.
- Evaluación de decodificación especulativa: la inclusión de la capa NextN y del vocabulario de draft permite medir aceleraciones de decodificación en hardware AMD gfx1151.
- Despliegue con llama.cpp en entornos con arquitectura `glm5-next`: alternativa a Talus para quienes ya tengan una build compatible, a costa de renunciar a las optimizaciones específicas del runtime del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta métricas de fidelidad de la cuantización frente al modelo original FP8, medidas con la ejecución `rel-final-e6cf` de Talus (commit `e6cf959e1cad`, 2026-10-28):

| Puerta | Resultado |
|---|---|
| KL divergence vs modelo FP8 original (texto de la puerta) | KLD 0,1960; top-1 90,2% |
| KL divergence vs modelo FP8 original (código) | KLD 0,2584; top-1 90,1% |
| KL divergence vs referencia | no disponible (información truncada) |

## Requisitos de hardware

- VRAM/memoria estimada: 109,45 GiB de pesos en disco (118,6 GB de repositorio incluyendo la matriz de importancia de 1,03 GB), más overhead de contexto y drafter; el objetivo declarado es una máquina de 128 GB de memoria unificada.
- Hardware de referencia: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), Strix Halo.
- GPU discretas: no se documentan requisitos para A100, H100 o RTX 4090; por tamaño, no cabe en GPUs consumer de 24 GB sin offload a RAM del sistema.
- Opciones de despliegue: Talus (runtime del autor, con `talus-cli` y `talus-server`) y builds de llama.cpp que soporten `glm5-next`.
- Latencia y throughput: no disponibles. La decodificación especulativa mediante la capa NextN está pensada para mejorar el throughput, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-a4e3s (este) | 320.759.404.382 | 65.536 (config. Talus) | GGUF mixto 2-4 bits | MIT | Hugging Face, 194 descargas |
| zai-org/GLM-5.3-Flash (base) | 320.759.404.382 | no disponible | FP8 original | no disponible | Hugging Face |
| unsloth/GLM-5.3-Flash-GGUF UD-IQ3_XXS | 320.759.404.382 | no disponible | GGUF IQ3_XXS | no disponible | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes. Las diferencias documentadas se limitan al esquema de cuantización y al tamaño resultante.

## Limitaciones y advertencias

- Es una cuantización de 2-4 bits: la divergencia KL frente al modelo FP8 original (0,1960 en texto, 0,2584 en código) implica una pérdida de fidelidad medible, con top-1 de aproximadamente el 90%.
- La matriz de importancia se calculó sobre texto técnico privado en inglés y código no publicado; esto puede sesgar la calidad hacia ese dominio y penalizar otros idiomas o registros.
- No hay benchmarks de tareas publicados, por lo que no se puede afirmar su rendimiento en MMLU, HumanEval u otras evaluaciones estándar.
- El modelo está dimensionado para un hardware muy concreto (Strix Halo, 128 GB); en otras configuraciones puede requerir offload o no caber.
- El runtime de referencia (Talus) es un proyecto del mismo autor; la compatibilidad con llama.cpp depende de builds que soporten `glm5-next`.
- El repositorio tiene 0 likes y 194 descargas en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base zai-org/GLM-5.3-Flash, que no se detalla en la información disponible.
- Idiomas soportados no documentados; riesgo de comportamiento degradado fuera del inglés técnico y código.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/j2ipper/GLM-5.3-Flash-a4e3s
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Cuantización de referencia de Unsloth: https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF/tree/main/UD-IQ3_XXS
- Runtime Talus: https://github.com/nsbradley88/talus-public
- Documentación de modelos de Talus: https://github.com/nsbradley88/talus-public/blob/main/docs/MODELS.md
- Metodología de evaluación de Talus: https://github.com/nsbradley88/talus-public/blob/main/docs/METHODOLOGY.md
- Vocabulario de draft: https://huggingface.co/j2ipper/draft-vocab
