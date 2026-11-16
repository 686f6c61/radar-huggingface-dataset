# kabcnd/Kenzan-Clover-35B-A3B-PinGrid-GGUF

## Resumen

Kenzan-Clover-35B-A3B-PinGrid-GGUF es una cuantizacion GGUF del modelo Diffuspace/Clover-35B-A3B-Preview, un transformer hibrido de tipo Mixture-of-Experts con 34.660 millones de parametros totales y 3.000 millones activos. El modelo base combina capas de atencion lineal recurrente GatedDeltaNet (30 capas) con atencion completa cada cuarta capa (10 capas), y emplea 256 expertos enrutados con top-8 mas un experto compartido por capa. La ficha la publica el usuario kabcnd bajo el paraguas "Kenzan" y esta optimizada especificamente para Apple Silicon de 16 GB de memoria unificada.

El trabajo del cuantizador se centra en dos correcciones tecnicas sobre el GGUF original: la conversion de los 30 tensores `ssm_a` de `A_log` en crudo a `-exp(A_log)` para evitar desbordamientos exponenciales que producian NaN, y la eliminacion de 120 tensores muertos (`ssm_bd_history`, `ssm_bd_logit_scale`, `ssm_conv1d.weight_right`) para dejar un layout limpio de 733 tensores compatible con el PR #31306 de llama.cpp. Ademas aplica una receta de cuantizacion mixta ("Pin-Grid") que asigna precision segun la sensibilidad medida en una importance matrix de 1,25 millones de tokens.

El resultado es un archivo de 10,99 GiB (2,72 bpw) que, segun el autor, alcanza 59,82 t/s de generacion y 1220,98 t/s de procesamiento de prompt en un Mac mini M6 con 16 GB, con una perplejidad de 10,70 sobre un holdout de 128k tokens. Es relevante para desarrolladores que quieran ejecutar un MoE de ~35B en hardware consumer de Apple sin colapso numerico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: GatedDeltaNet (atencion lineal recurrente) en 30 capas + Full Attention cada 4ª capa; MoE con 256 expertos enrutados (top-8) + 1 experto compartido por capa |
| Parametros totales | 34.660.610.688 (34,66B) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | no disponible (el autor usa `-c 4096` en los ejemplos de despliegue) |
| Tipos de cuantizacion | IQ2_XXS (base de expertos enrutados), IQ3_XXS, Q4_0, Q5_K, Q6_K, Q8_0 (mezcla Pin-Grid); 2,72 bpw |
| Idiomas soportados | en, ru, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo unico `Kenzan-Clover-35B-A3B-PinGrid-IQ2_XXS-M6-16G.gguf`, 10,99 GiB) |

## Arquitectura y entrenamiento

El modelo base Clover-35B-A3B-Preview es un MoE hibrido de 40 capas que intercala 30 capas de GatedDeltaNet (atencion lineal con estado recurrente y decaimiento controlado por `A_log`) con 10 capas de atencion completa situadas en los bloques 3, 7, 11, 15, 19, 23, 27, 31, 35 y 39. Cada capa contiene 256 expertos enrutados con seleccion top-8 y un experto compartido adicional (`expert_shared_count = 1`). El vocabulario declarado en la model card es de 248.320 tokens.

La informacion proporcionada no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Lo que si documenta el autor es el proceso de cuantizacion: analisis de una importance matrix de 1,25 millones de tokens (`Clover-VAL-1.25M-I-Matrix.gguf`) que revelo un salto de sensibilidad L2 de 4.400x en `ffn_down_exps` entre `blk.0` (7,01e6) y `blk.39` (3,10e10), con picos en los limites de atencion completa. Sobre esa base se asignan precisiones: Q5_K para el embedding, Q6_K para `output` y las proyecciones KV, Q8_0 para las puertas `ssm_alpha` y `ssm_beta`, Q4_0 para el tronco de atencion y experto compartido, IQ3_XXS para la cola MoE de alta sensibilidad (bloques 32-38) e IQ2_XXS para el resto de expertos enrutados. La innovacion tecnica destacable es la correccion `ssm_a = -exp(A_log)`, que elimina el desbordamiento de `exp(gate)` en llama.cpp PR #31306.

## Capacidades

- Generacion de texto conversacional en ingles, ruso y chino, segun los idiomas declarados.
- Razonamiento multi-paso propio de un modelo tipo "thinking" (el tag `diffusion-llm` sugiere una variante de difusion, aunque la model card no detalla el mecanismo).
- Procesamiento de contexto moderado: los ejemplos del autor usan ventanas de 4096 tokens.
- Ejecucion local en Apple Silicon mediante Metal 4, con soporte de atencion flash (`-fa on`) y cache KV cuantizada (`-ctk q4_0 -ctv q4_0`).
- Compatibilidad con `llama-server` y, por extension, con la API compatible con OpenAI que expone (`endpoints_compatible` en los tags).
- No se documenta soporte explicito de tool calling, function calling, vision, audio ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Asistente conversacional local en Mac: desplegado con `llama-server` en un Mac mini M6 de 16 GB, el modelo mantiene conversaciones multi-turno en ingles, ruso o chino a ~60 t/s, suficiente para interaccion en tiempo real sin conexion a la nube.
- Prototipado de aplicaciones LLM en hardware consumer: permite a un desarrollador probar un MoE de 35B en un equipo de 16 GB antes de escalar a infraestructura dedicada, gracias al tamano de 10,99 GiB que cabe en el working set Metal de 15.032 MB.
- Generacion de texto en ruso y chino: el soporte trilingue lo hace util para pipelines de localizacion o resumen de documentos en esos idiomas, aunque sin garantias de calidad mas alla de lo que declare el modelo base.
- Investigacion sobre cuantizacion MoE: el recetario Pin-Grid y el analisis de sensibilidad por capa sirven como referencia metodologica para quien cuantice otros MoE con importance matrices.
- Evaluacion de modelos hibridos GatedDeltaNet: util para estudiar el comportamiento de atencion lineal recurrente frente a atencion completa en un entorno de inferencia controlado.
- Servicio de inferencia ligero en oficina o laboratorio: con la API compatible con OpenAI de `llama-server`, se puede integrar como backend de herramientas internas que no requieran contexto muy largo.
- Validacion de correcciones numericas en llama.cpp: el arreglo de `ssm_a` y la limpieza de tensores permiten usar este GGUF como caso de prueba para el PR #31306 y futuras versiones del runtime.

## Benchmarks y rendimiento

| Metrica | Comando / configuracion | Resultado |
|---|---|---|
| Tamano de archivo | `Kenzan-Clover-35B-A3B-PinGrid-IQ2_XXS-M6-16G.gguf` | 10,99 GiB (11.254,74 MiB, 2,72 BPW) |
| Prompt processing (`pp512`) | `llama-bench -p 512 -fa 1 -ctk q4_0 -ctv q4_0 -ngl 99` | 1220,98 ± 5,89 t/s |
| Generacion (`tg128`) | `llama-bench -n 128 -fa 1 -ctk q4_0 -ctv q4_0 -ngl 99` | 59,82 ± 0,57 t/s |
| Perplejidad (`wt2_holdout_128k`) | `llama-perplexity --chunks 14 -c 2048 -fa on -ctk q4_0 -ctv q4_0` | 10,6969 ± 0,24881 |
| Throughput en chat (RU y Python) | `llama-server -c 4096 -fa on -ctk q4_0 -ctv q4_0` | 60,62-60,68 t/s |

Medido por el autor en Apple Mac mini M6 (16 GB de memoria unificada, Metal 4, `MTLGPUFamilyApple11`, SME/SME2) con llama.cpp PR #31306 (`commit ed26f2f`). No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 10,99 GiB de pesos mas overhead de cache KV y contexto; el autor lo valida en 16 GB de memoria unificada con `-c 4096` y cache KV en q4_0.
- GPU recomendadas: Apple Silicon con Metal 4 (validado en Mac mini M6). No se documenta soporte en GPU NVIDIA o AMD en la informacion disponible.
- Cabe en consumer GPU: si, en equipos Apple Silicon de 16 GB; en GPUs discretas no hay datos publicados.
- Opciones de despliegue: `llama.cpp` PR #31306 o posterior (obligatorio por soporte de `clover_moe`), `llama-server` con API compatible con OpenAI. No se menciona compatibilidad con vLLM, TGI, Ollama ni LM Studio.
- Latencia y throughput: 59,82 t/s de generacion y 1220,98 t/s de prompt processing en Mac mini M6 segun el autor; el throughput en chat se mantiene en torno a 60 t/s.
- Limitacion de memoria: el working set Metal del M6 es de 15.032,39 MB; el archivo de 10,99 GiB deja margen para cache KV y contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Kenzan-Clover-35B-A3B-PinGrid | 34,66B | 3B | no disponible | Apache 2.0 | GGUF (2,72 bpw) | Optimizado para Mac 16 GB; ~60 t/s en M6 |
| Diffuspace/Clover-35B-A3B-Preview | 34,66B | 3B | no disponible | Apache 2.0 (heredada) | safetensors | Modelo base sin cuantizar; requiere mas memoria |
| Clover-35B-A3B-Preview-Q8_0 (upstream) | 34,66B | 3B | no disponible | Apache 2.0 | GGUF Q8_0 | Exportaba `A_log` en crudo y provocaba NaN en llama.cpp |

No se dispone de datos de benchmarks comparativos con otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo base es una "Preview": puede presentar inestabilidades o calidad inferior a versiones finales.
- Solo se declaran tres idiomas (en, ru, zh); el rendimiento en castellano no esta verificado.
- La cuantizacion IQ2_XXS en la mayoria de expertos enrutados implica perdida de precision; la perplejidad de 10,70 debe interpretarse en el contexto del holdout usado, no como comparable directo con otros modelos.
- Requiere una version especifica de llama.cpp (PR #31306, commit `ed26f2f` o posterior); versiones anteriores no cargaran el archivo o produciran NaN.
- No hay evidencia publicada de tool calling, agentes, vision ni audio; no debe asumirse su disponibilidad en produccion.
- Riesgo de alusiones y sesgos heredado del modelo base, no evaluado en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo base es de terceros.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente nula.
- La model card incluye una solicitud de donacion (Ko-fi) que no afecta a la licencia pero conviene tener en cuenta como contexto del proyecto.

## Enlaces

- Hugging Face: https://huggingface.co/kabcnd/Kenzan-Clover-35B-A3B-PinGrid-GGUF
- Modelo base: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- PR de llama.cpp con soporte `clover_moe`: https://github.com/ggml-org/llama.cpp/pull/31306
- Ko-fi del autor: https://ko-fi.com/kabcpc
