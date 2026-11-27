# Launch80/Qwopus3.8-27B-Coder-Flash-Int4-baked

## Resumen

Qwopus3.8-27B-Coder-Flash-Int4-baked es una cuantizacion GPTQ INT4 del modelo Jackrong/Qwopus3.8-27B-Coder-Flash, publicada por Launch80. El trabajo destaca porque no se limita a cuantizar el cuerpo del transformer: tambien cuantiza a INT4 en disco la cabeza de salida (`lm_head`, 248.320 x 5.120) y la cabeza borrador MTP (multi-token prediction) empleada en decodificacion especulativa. El resultado es un checkpoint de 17,0 GB que cabe y se sirve a contexto completo de 262.144 tokens en una unica GPU Intel Arc Pro B65 de 32 GB, con vLLM estandar y sin parches de pesos.

El modelo base es un transformer de 27.781.427.952 parametros (27,78B) orientado a codigo y uso de herramientas, con torre de vision (pipeline `image-text-to-text`) y una arquitectura interna que el autor etiqueta como `qwen3_8`, con atencion lineal GDN (gated delta network) en parte de sus proyecciones. Esta revision (v1.1.1) no cambia pesos respecto a v1.1: solo actualiza la model card y documenta un parche de arranque para vLLM-XPU que elimina una sincronizacion host por paso en la fase de verificacion, elevando el rendimiento del perfil rapido a 92,5-96,0 tok/s.

La relevancia practica es doble: por un lado, demuestra que es viable cuantizar cabezas criticas (salida y draft) sin degradar de forma inaceptable la calidad; por otro, publica un estudio con umbrales pre-registrados y hasheados antes de evaluar, incluyendo los fallos. Es un caso poco habitual de transparencia en cuantizacion, con comparacion directa frente al GGUF Q4_K_M del autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion lineal GDN (gated delta network), torre de vision y cabeza MTP para decodificacion especulativa; etiqueta interna `qwen3_8` |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GPTQ INT4 simetrico, grupo 128, `desc_act` off, `act_group_aware` on; embeddings, norms, torre de vision y `in_proj_a`/`in_proj_b` en BF16; cuerpo, `lm_head` y `mtp.*` en INT4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ INT4 en disco), 17,0 GB; repo de 34,2 GB |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion, no un entrenamiento nuevo. El cuerpo del modelo base consta de 400 lineales transformadas a GPTQ INT4 simetrico con grupo 128 mediante GPTQModel 7.3.2, ejecutado sobre la propia Intel Arc Pro B65. La calibracion uso 512 muestras de 2.048 tokens: 153 de C4, 204 de codigo, 53 de chat y 102 de conversaciones de tool-calling procedentes de NousResearch/hermes-function-calling-v1 (commit `@dae3e1d`), renderizadas con la plantilla de chat del modelo e incluyendo llamadas paralelas. El sha256 de calibracion esta en `quant-meta.json`.

La innovacion principal es el "bake" de la cabeza de salida y de la cabeza MTP: en lugar de dejarlas en BF16 (lo que anularia el ahorro y romperia el encaje en 32 GB), se cuantizaron con GPTQ usando matrices de Hessian capturadas mediante hooks en vLLM sobre wikitext, chat y codigo, con busqueda en rejilla de damping y mezclas de slices. Todas las lineales horneadas superan a round-to-nearest: `lm_head` 4,68% frente a 8,18%; `mtp.fc` 6,98% frente a 11,47%; `mtp…down_proj` 7,57% frente a 11,96%. El autor documenta un bug encontrado y corregido en el proceso, descrito en su blog.

## Capacidades

- Generacion de texto y razonamiento general, con modo de conversacion multi-turno.
- Generacion y comprension de codigo, incluida resolucion de problemas tipo HumanEval, MBPP y LiveCodeBench.
- Razonamiento matematico (GSM8K) e instrucciones complejas (IFEval).
- Tool calling y function calling, con soporte de llamadas paralelas; evaluado con BFCL.
- Capacidades de agente y razonamiento multi-paso mediante tool use.
- Entrada de imagen y texto (pipeline `image-text-to-text`, torre de vision en BF16).
- Decodificacion especulativa nativa con cabeza MTP cuantizada (k=6 o k=7 segun perfil).
- Recuperacion en contexto largo: 100% en needle retrieval a 32k y 128k segun el autor.
- Capacidades multilingues: no disponible.

## Casos de uso

- Servicio de codigo en produccion sobre hardware Intel: el checkpoint se carga en vLLM 0.30 con backend XPU sin parches de pesos, lo que permite desplegar asistencia de codigo con contexto de 262.144 tokens en una sola Arc Pro B65 de 32 GB.
- Agentes con tool calling en pipelines de CI/CD: la cuantizacion se calibro con conversaciones de function calling (incluidas llamadas paralelas), y el modelo mantiene 88,25 en el subconjunto BFCL, adecuado para agentes que invocan APIs de build, test y despliegue.
- Analisis de repositorios completos: con 262.144 tokens de ventana y needle retrieval del 100% a 128k, permite revisar diffs grandes, auditar dependencias o responder preguntas sobre varios ficheros en una sola pasada.
- Asistencia multimodal en documentacion tecnica: al aceptar imagen y texto, puede procesar capturas de diagramas, errores de consola o interfaces junto a explicaciones textuales.
- Despliegue en estaciones de trabajo con GPU de consumo alta: los 17,0 GB en disco permiten inferencia en GPUs de 24 GB o mas con cuantizacion adicional o contexto reducido; el perfil rapido alcanza 92,5-96,0 tok/s en la B65.
- Evaluacion comparativa de tecnicas de cuantizacion: util como referencia reproducible para estudiar el impacto de cuantizar `lm_head` y cabezas MTP, con umbrales pre-registrados y metricas de KLD y acuerdo top-1 publicadas.
- Prototipado de agentes con razonamiento multi-paso en entornos con vLLM: la decodificacion especulativa integrada acelera bucles de agente sin necesidad de un drafter externo.

## Benchmarks y rendimiento

Calidad frente a BF16, con umbrales pre-registrados y hasheados antes de evaluar. La referencia BF16 se ejecuto en una RTX PRO 6000 (vLLM 0.30, CUDA) y este checkpoint en una Arc Pro B65 (vLLM 0.30, XPU), con MTP k=6.

| Medida | Umbral | Este checkpoint | Resultado |
|---|---|---|---|
| Perplejidad wikitext-2 | ≤ +3% | +1,72% | pasa |
| Perplejidad corpus de codigo | ≤ +3% | +1,83% | pasa |
| KLD media next-token (1,05M tokens, top-64) | ≤ 0,05 | 0,0412 | pasa |
| Acuerdo top-1 next-token | ≥ 93% | 92,84% | falla (por 0,16 pt) |
| Siete tareas, pass@1 emparejado, greedy | Δ ≥ −2 pts o IC incluye 0 | 7/7 tareas | pasa |
| KLD frente a Q4_K_M GGUF de Jackrong | el nuestro ≤ el suyo | 0,0412 vs 0,0250 | falla |
| Greedy, spec decoding on = off | identico | 26/32; las 6 diferencias en empate | falla tal como se definio |

| Tarea | BF16 | Este checkpoint | Δ pts [IC 95%] |
|---|---:|---:|---|
| GSM8K | 86,96 | 86,66 | −0,30 [−1,21, +0,61] |
| IFEval | 80,22 | 80,78 | +0,55 [−2,22, +3,14] |
| MMLU-Pro subset | 71,80 | 70,90 | −0,90 [−2,70, +0,90] |
| HumanEval+ | 90,24 | 88,41 | −1,83 [−5,49, +1,83] |
| MBPP+ | 76,98 | 75,66 | −1,32 [−3,17, +0,53] |
| BFCL subset (400) | 89,00 | 88,25 | −0,75 [−3,00, +1,50] |
| LiveCodeBench v6 slice | 41,14 | 40,57 | −0,57 [−5,14, +4,00] |

Comparacion de fidelidad frente al GGUF Q4_K_M del autor original, sobre las mismas 512 x 2.048 tokens: KLD media 0,0250 frente a 0,0412; acuerdo top-1 94,92% frente a 92,84%; perplejidad wikitext-2 +0,73% frente a +1,72%. El GGUF se ejecuto en llama.cpp (b11723, SYCL) en la B65; Q8_0 medido igual da 0,0024, lo que acota el termino entre motores. Rendimiento del perfil rapido con drafter INT4 DFlash2 (k=7, 128k): 89,3 tok/s en v1.1 y 92,5/96,0 tok/s en v1.1.1.

## Requisitos de hardware

- VRAM estimada: 17,0 GB de pesos en disco; con cache KV para 262.144 tokens se ajusta en 32 GB en la Arc Pro B65 segun el autor.
- GPU validada: Intel Arc Pro B65 32 GB con vLLM 0.30 y backend XPU.
- Referencia BF16: RTX PRO 6000 con vLLM 0.30 y CUDA (solo para evaluacion comparativa).
- GPU de consumo: no se documenta soporte en consumer; los 17,0 GB permiten intentarlo en GPUs de 24 GB con contexto reducido, pero no esta validado por el autor.
- Despliegue: vLLM (recomendado, con decodificacion especulativa MTP) y llama.cpp para el GGUF equivalente; Ollama y TGI no se mencionan.
- Latencia y throughput: 92,5-96,0 tok/s en la B65 con el perfil rapido (k=7, 128k); 89,3 tok/s en v1.1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este checkpoint (INT4 baked) | 27,78B | 262.144 | safetensors GPTQ INT4 | Apache 2.0 | 17,0 GB; KLD 0,0412; top-1 92,84%; vLLM XPU |
| Jackrong/Qwopus3.8-27B-Coder-Flash (BF16) | 27,78B | 262.144 | safetensors BF16 | Apache 2.0 | Referencia de calidad; no cabe en 32 GB |
| Jackrong/Qwopus3.8-27B-Coder-Flash-GGUF Q4_K_M | 27,78B | 262.144 | GGUF | Apache 2.0 | 16,8 GB; KLD 0,0250; top-1 94,92%; llama.cpp |
| Jackrong/Qwopus3.8-27B-Coder-Flash-GGUF Q8_0 | 27,78B | 262.144 | GGUF | Apache 2.0 | KLD 0,0024; mayor tamano |

## Limitaciones y advertencias

- El acuerdo top-1 next-token queda en 92,84%, por debajo del 93% pre-registrado; es un fallo declarado por el autor.
- La fidelidad frente a BF16 es peor que la del GGUF Q4_K_M (KLD 0,0412 frente a 0,0250); para maxima fidelidad en llama.cpp conviene el GGUF.
- La decodificacion especulativa no es bit-identica al modo greedy sin ella: 6 de 32 casos difieren, todos en empates exactos o a un paso FP16 de 0,0156.
- El modelo es un work in progress (v1.1.1) y las validaciones se hicieron en un unico entorno (Arc Pro B65, vLLM XPU); no hay validacion en CUDA ni en GPUs de consumo.
- Riesgo de alucinacion y sesgos: no documentados por el autor; aplican los del modelo base.
- Idiomas soportados no declarados; no se garantiza cobertura multilingue.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de calibracion pueden tener condiciones propias que deben verificarse.
- El metodo de comparacion con el GGUF difiere del pre-registrado (se uso llama.cpp SYCL en lugar de una base GGUF BF16), segun admite el autor.

## Enlaces

- Hugging Face: https://huggingface.co/Launch80/Qwopus3.8-27B-Coder-Flash-Int4-baked
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- GGUF del autor original: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash-GGUF
- Estudio del bake: https://launch80.com/blog/qwopus-coder-int4-bake-study
- Estudio de calidad: https://launch80.com/a/84829a3a-a0b2-407f-ab38-59cd2d5006fa
- Discord de Launch80: https://discord.gg/launch80
- Dataset de calibracion: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
