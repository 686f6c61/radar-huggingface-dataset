# Arkane-cloud/qwen38-27b-w4a16-autoround

## Resumen

Arkane-cloud/qwen38-27b-w4a16-autoround es una cuantizacion int4 weight-only (W4A16) del modelo Qwen/Qwen3.8-27B, producida con Intel AutoRound y empaquetada en formato compressed-tensors para su uso con vLLM. El artefacto lo mantiene Arkane Cloud como espejo de la receta original de dbirks/Qwen3.8-27B-W4A16-AutoRound, y anade una configuracion de serving en produccion, benchmarks propios y un endpoint alojado. Los pesos se mantienen en int4 con grupo de 128 y simetricos, mientras que las activaciones permanecen en BF16, de modo que el modelo corre en cualquier GPU NVIDIA Ampere o superior mediante el kernel Marlin int4, sin necesidad de Blackwell.

El modelo base es multimodal (pipeline image-text-to-text) y esta etiquetado como qwen3_5 en transformers. El repositorio declara 6.260.690.960 parametros reales en safetensors, un tamano de repo de 16,8 GB y una reduccion desde los aproximadamente 52 GB del checkpoint BF16. La cuantizacion preserva en BF16 el modulo de vision (`visual.*`), las proyecciones `in_proj_a` e `in_proj_b`, la cabeza `mtp` y `lm_head`, lo que mantiene intactas las partes mas sensibles a la precision.

La relevancia practica del artefacto es que permite desplegar un modelo de gran ventana de contexto en hardware modesto: con 14,26 GiB de pesos en VRAM y una cache KV en FP8, Arkane reporta ventanas de hasta 150 000 tokens en una sola GPU de 24 GB y de hasta 1 000 000 de tokens en un nodo tensor-parallel de 4 GPU. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), etiqueta `qwen3_5`; incluye torre de vision y cabeza `mtp` |
| Parametros totales | 6.260.690.960 (dato real de safetensors) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | Hasta 1 000 000 de tokens en configuracion TP=4; 150 000 tokens en una sola GPU de 24 GB |
| Tipos de cuantizacion | Int4 weight-only (W4A16), grupo 128, simetrico; activaciones en BF16; cache KV en FP8 opcional |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (`pack-quantized`), kernel Marlin int4 |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Qwen con torre de vision y una cabeza `mtp` (multi-token prediction), segun los modulos que la receta de cuantizacion mantiene explicitamente en BF16. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en la informacion proporcionada.

La innovacion tecnica de este artefacto es la cuantizacion: AutoRound optimiza el redondeo de pesos mediante descenso de gradiente con signo (paper arXiv:2309.05516), con calibracion sobre `NeelNanda/pile-10k` (128 muestras, seqlen 2048, 200 iteraciones). El resultado se empaqueta en compressed-tensors y se sirve con kernels Marlin int4. La combinacion de pesos int4 con cache KV en FP8 es lo que permite alojar la ventana de 1M tokens: en 4x RTX A5000 (96 GB totales) la cache KV disponible es de 2 117 834 tokens frente a 515 576 del checkpoint BF16 en las mismas tarjetas; en una sola A5000 de 24 GB se obtienen 217 268 tokens de cache.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de plantilla de chat y modo thinking desactivable (los benchmarks se ejecutaron con thinking desactivado).
- Procesamiento de imagen y texto de entrada (pipeline image-text-to-text), con la torre de vision preservada en BF16.
- Razonamiento de contexto largo: recuperacion de informacion en ventanas de hasta 1M tokens en la configuracion TP=4.
- Prediccion multi-token mediante la cabeza `mtp` conservada en BF16.
- Inferencia cuantizada int4 compatible con vLLM y kernels Marlin en GPU Ampere o superior.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Analisis de documentos largos en una sola GPU de 24 GB: con 150 000 tokens de ventana y 14,26 GiB de pesos, un equipo con una RTX A5000 puede procesar informes, contratos o expedientes completos sin trocear el contexto.
- Recuperacion sobre corpus masivos en nodo TP=4: la ventana de 1M tokens permite indexar y consultar grandes volumenes documentales en una sola peticion; Arkane confirma recuperacion limpia hasta 290 021 tokens reales con single-needle y un MRCR de 33,9 % a 946 185 tokens de entrada.
- Asistente conversacional con imagen adjunta: al conservar la torre de vision en BF16, el modelo puede responder preguntas sobre capturas, diagramas o documentos escaneados junto con texto.
- Serving de baja latencia en produccion: con 39,9 tok/s por usuario y 24,8 ms de ITL en una sola A5000, es adecuado para chat interactivo; en RTX PRO 6000 sube a 74,3 tok/s y 13,4 ms de ITL.
- Despliegue con throughput agregado alto: 1 572 tok/s agregados a concurrencia 32 en una RTX PRO 6000, util para pipelines de generacion por lotes.
- Sustitucion de BF16 en infraestructura existente: el artefacto reduce el peso de 52 GB a 14,26 GiB en VRAM, lo que permite reutilizar GPUs Ampere ya desplegadas sin migrar a Blackwell.
- Endpoint gestionado sin infraestructura propia: Arkane ofrece una API compatible con OpenAI en console.arkanecloud.com con dos perfiles de ventana (1M y 150k), util para prototipado rapido.

## Benchmarks y rendimiento

Protocolo declarado por Arkane: OpenAI MRCR de 8 needles, 32 prompts estrictamente emparejados, dos ejecuciones independientes, temperatura 0, thinking desactivado, autoscaling congelado, acceso directo al pod sin gateway.

| Configuracion | MRCR | Perfect scores |
|---|---|---|
| BF16 vanilla, 4x RTX A5000, TP=4 (control) | 51,7 % | 15 / 32 |
| W4A16 AutoRound, 4x RTX A5000, TP=4 | 50,7 % | 15 / 32 |
| W4A16 AutoRound, 1x RTX A5000 | 50,1 % | 15 / 32 |

Throughput con 128 tokens de entrada y 1024 de salida:

| Configuracion | Single user | ITL | Agregado C=32 | Por GPU |
|---|---|---|---|---|
| 1x RTX A5000 | 39,9 tok/s | 24,8 ms | 516 tok/s | 516 tok/s |
| 4x RTX A5000, TP=4 | 80,9 tok/s | 12,2 ms | 850 tok/s | 212 tok/s |
| 4x RTX A5000, TP=4, BF16 | 38,8 tok/s | 25,6 ms | 399 tok/s | 100 tok/s |
| 1x RTX PRO 6000 (Blackwell) | 74,3 tok/s | 13,4 ms | 1 572 tok/s | 1 572 tok/s |

Comparativa W4A16 frente a NVFP4 en RTX PRO 6000, mismo pod y mismo dia:

| Metrica | W4A16 AutoRound | NVFP4 (nvidia/Qwen3.8-27B-NVFP4) |
|---|---|---|
| Pesos en VRAM | 14,26 GiB | 18,80 GiB |
| Single user | 74,3 tok/s, ITL 13,4 ms | 60,7 tok/s, ITL 16,4 ms |
| Agregado C=32 | 1 572 tok/s | 1 085 tok/s |
| Pool de cache KV | 2,19 M tokens | 2,00 M tokens |
| Prefill a 32k, single request | 30,3 tok/s | 39,4 tok/s |

Contexto largo: recuperacion limpia hasta 290 021 tokens reales (single-needle, cold, sin prefix cache, tres semillas por tamano); MRCR de 8 needles puntuado hasta 946 185 tokens de entrada con una media de 33,9 % en ese tramo, frente al 50,7 % por debajo de 131k. Una peticion de 997 953 tokens de entrada se rechaza por exceder la ventana de 1 000 000 con sus 2 048 tokens de salida.

## Requisitos de hardware

- VRAM de pesos: 14,26 GiB en carga, frente a 52 GB del checkpoint BF16; aproximadamente 19,5 GB en disco.
- GPU minima: cualquier NVIDIA Ampere o superior con soporte de kernel Marlin int4; no requiere Blackwell.
- Configuracion de 24 GB: una RTX A5000 sirve 150 000 tokens de contexto con cache KV en FP8 y deja 217 268 tokens de pool KV.
- Configuracion TP=4: 4x RTX A5000 (96 GB totales) sirven la ventana de 1M tokens con 2 117 834 tokens de cache KV.
- GPU de alto rendimiento: RTX PRO 6000 (Blackwell) alcanza 74,3 tok/s por usuario y 1 572 tok/s agregados a C=32.
- Despliegue recomendado: vLLM con `--kv-cache-dtype fp8` y `--trust-remote-code`; ejemplo single-GPU con `--max-model-len 150000` y ejemplo TP=4 con `--tensor-parallel-size 4 --max-model-len 1000000`.
- Latencia: ITL de 24,8 ms en una A5000 y 12,2 ms en TP=4 de cuatro A5000; el paralelismo tensorial reduce la latencia pero tambien el throughput por tarjeta (212 tok/s por GPU frente a 516 tok/s en single GPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Arkane-cloud/qwen38-27b-w4a16-autoround | 6,26 B (safetensors) | 150k en 1 GPU; 1M en TP=4 | W4A16 int4 | Apache 2.0 | 14,26 GiB de pesos; MRCR 50,7 % en TP=4 |
| nvidia/Qwen3.8-27B-NVFP4 | no disponible | no disponible | NVFP4 | no disponible | 18,80 GiB de pesos; 60,7 tok/s single user y 1 085 tok/s C=32 en RTX PRO 6000; mejor prefill a 32k (39,4 frente a 30,3 tok/s) |
| Qwen/Qwen3.8-27B (BF16) | no disponible | no disponible | BF16 | no disponible | 52 GB de pesos; MRCR 51,7 % en 4x A5000; 38,8 tok/s single user y 399 tok/s C=32 en TP=4 |
| dbirks/Qwen3.8-27B-W4A16-AutoRound | no disponible | no disponible | W4A16 int4 | no disponible | Receta de cuantizacion original de la que deriva este espejo |

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- El modelo base es un artefacto de Qwen etiquetado como `qwen3_5` con fecha de creacion en 2026; conviene verificar la disponibilidad y vigencia del checkpoint base antes de desplegar.
- La recuperacion en contexto largo degrada a partir de aproximadamente 250k tokens: el MRCR baja al 33,9 % en el tramo de 946 185 tokens frente al 50,7 % por debajo de 131k.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de sesgo en la informacion disponible.
- La cuantizacion int4 puede introducir degradaciones no medidas por el MRCR; los benchmarks publicados cubren recuperacion y throughput, no razonamiento, codigo ni matematicas.
- El artefacto requiere `--trust-remote-code` en vLLM, lo que implica ejecutar codigo del repositorio.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen, cuyos terminos no se detallan en la informacion proporcionada.
- El autor del repositorio es un espejo de terceros (Arkane Cloud); la receta original es de dbirks y el modelo base de Qwen, por lo que la trazabilidad de cambios depende de esos repositorios.
- Los benchmarks proceden del propio proveedor del espejo y no de una evaluacion independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Arkane-cloud/qwen38-27b-w4a16-autoround
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Receta de cuantizacion original: https://huggingface.co/dbirks/Qwen3.8-27B-W4A16-AutoRound
- Variante NVFP4 comparada: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Paper de AutoRound: https://arxiv.org/abs/2309.05516
- Dataset de calibracion: https://huggingface.co/datasets/NeelNanda/pile-10k
- Endpoint gestionado del autor: https://console.arkanecloud.com
- Sitio del autor: https://arkanecloud.com
