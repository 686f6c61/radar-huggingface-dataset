# hermitdave/Inkling-2-Mini-MLX-RCO-4.5bpw

## Resumen

Inkling-2-Mini-MLX-RCO-4.5bpw es una cuantizacion mixta de precision (RCO, rate-constrained optimisation) del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario hermitdave para el ecosistema MLX de Apple Silicon. El modelo base es un VLM MoE con arquitectura de transformer con bucles (looped transformer): 26.388.641.280 parametros totales, 24 capas fisicas de decoder de las cuales las 12 centrales se ejecutan tres veces por token (48 visitas de capa), 128 expertos enrutados con routing top-8, una torre de vision de 23 capas y una cabeza MTP DSpark en el checkpoint publicado.

El interes de esta ficha no esta en el modelo base sino en la cuantizacion: reduce el checkpoint publicado de 19,53 GB a 16,57 GB (4,46 bits por peso en los tensores cuantizados) manteniendo una perplexity de 10,6018 frente a 10,5150 del checkpoint nativo NVFP4, un KL de 0,0249 y una recuperacion zero-shot media de 0,9906 en cinco tareas. Ademas acelera la decodificacion (30,9 tok/s frente a 28,6 tok/s del nativo) y reduce el pico de RAM a 16,87 GB en un M3 Max de 64 GB.

Es relevante ahora porque demuestra que es posible cuantizar un MoE con bucles a 4,5 bits efectivos sin perdida medible en tareas de razonamiento, y porque incluye un `model_file` autocontenido (`inkling2_loop.py`) que permite cargar la arquitectura en `mlx-lm` estandar sin arbol parcheado, algo que hasta la fecha no hacia ninguna release oficial de `mlx-lm`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer MoE con torre de vision (VLM); 24 capas fisicas de decoder, 12 centrales repetidas 3 veces (48 visitas de capa); 128 expertos enrutados, top-8; torre de vision de 23 capas |
| Parametros totales | 26.388.641.280 (26,4 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | RCO mixed-precision affine: 8-bit x 118 tensores, 6-bit x 58, 4-bit x 44, 3-bit x 4 (224 tensores cuantizados); 4,46 bpw efectivos en pesos cuantizados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), libreria `mlx-lm` |

## Arquitectura y entrenamiento

El modelo base es un transformer con bucles: 24 capas fisicas de decoder en las que las 12 capas centrales se ejecutan tres veces por token, dando 48 visitas de capa efectivas. Es un MoE con 128 expertos enrutados y routing top-8. Incorpora ademas una torre de vision de 23 capas y, en el checkpoint publicado, una cabeza MTP (multi-token prediction) DSpark que lee estados ocultos en las visitas de bucle 5, 23, 41 y 48. La implementacion de referencia vive en los PRs borrador de `mlx-lm` #2086 y #2061.

Sobre el entrenamiento no se dispone de informacion en la documentacion proporcionada: no hay datos sobre numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Lo que si documenta el autor de la cuantizacion es la procedencia de los pesos: el checkpoint publicado almacena los expertos enrutados en NVFP4 (capas 0-19) y MXFP8 (capas 20-23), con el resto en BF16. No existe una release BF16 de Inkling-2-Mini, por lo que el pipeline RCO dequantizo primero los expertos a BF16 mediante las formulas `NVFP4: W = E2M1[nibble] * FP8_E4M3[block scale] * (amax / outer_scale_denominator)` y `MXFP8: W = FP8_E4M3[value] * 2 ** (E8M0[scale] - 127)`. Esta reconstruccion es exacta respecto al checkpoint publicado pero no recupera el BF16 original: el redondeo NVFP4 ya esta incorporado.

La innovacion tecnica de esta cuantizacion es la asignacion de bits por tipo de tensor: los expertos enrutados se agrupan en un unico tensor pre-apilado por (capa, proyeccion) y se cuantizan a 4 bits (44 tensores) o 3 bits (4 tensores); las proyecciones de atencion (`q/k/v/r/o/gate/sink`) y el `weight_proj` de atencion completa se llevan a 6 bits (58) u 8 bits (118); y se dejan intactos en BF16 `embed_tokens`, `lm_head`, todas las RMSNorm, el router MoE, las queries de atencion-residual y de mensaje de bucle, los kernels `conv1d` depthwise, la tabla de logits relativos, las puertas de mensaje de rango 64 y toda la torre de vision. El autor reconoce que en las 20 capas NVFP4 el resultado puede igualar al nativo pero no superarlo, y que la ganancia potencial de RCO esta en la asignacion 6-8 bits de las proyecciones de atencion.

## Capacidades

- Generacion de texto autoregresiva con arquitectura MoE y bucles de capa.
- Razonamiento multi-paso: la repeticion de las 12 capas centrales tres veces por token esta disenada para profundidad de computo sin aumentar el numero de parametros fisicos.
- Vision: el modelo base incluye torre de vision de 23 capas, pero en esta cuantizacion la torre se mantiene en BF16 y la ruta de imagen **no esta cableada** en oMLX (`model_type_override: "llm"`); en `mlx-lm` estandar la carga verificada es de texto.
- Codigo y matematicas: no hay benchmarks especificos publicados en la informacion disponible, pero la recuperacion zero-shot incluye MMLU (0,996) y ARC (0,996-1,000).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado explicitamente; la arquitectura de bucle sugiere capacidad de razonamiento iterativo, pero no hay validacion publicada.
- Capacidades multilingues: no disponible.
- MTP / decodificacion especulativa: el checkpoint publicado incluye una cabeza DSpark MTP de 636 MB en BF16, pero **no se incluye** en esta cuantizacion y el runtime no implementa la cabeza MTP (`mtp_enabled: false`).

## Casos de uso

- Inferencia local en Apple Silicon: el modelo cabe en un M3 Max de 64 GB con un pico de 16,87 GB y decodifica a 30,9 tok/s, lo que permite ejecutar un MoE de 26,4 B en un portatil sin GPU dedicada. Adecuado para desarrollo y prototipado offline.
- Servicio de texto en oMLX: con prefill de 669 tok/s en frio a ~4,5k de contexto y 27,4 tok/s de decodificacion, es viable como endpoint local para asistentes de texto en un equipo de desarrollo.
- Evaluacion de arquitecturas con bucles: util para investigadores que quieran estudiar el comportamiento de un looped transformer MoE sin depender de un runtime parcheado, gracias al `model_file` autocontenido y a `trust_remote_code=True`.
- Baseline de cuantizacion: sirve como referencia reproducible para comparar tecnicas de cuantizacion mixta (RCO, NVFP4, MXFP8) sobre un MoE de 26 B, con metricas de PPL, KL, top-1 y recuperacion zero-shot ya publicadas.
- Generacion de texto en pipelines de CI: al cargar en `mlx-lm` 0.32.2 estandar sin arbol parcheado, se puede integrar en tests automatizados de calidad de cuantizacion (perplexity, KL) sobre hardware Apple.
- Razonamiento y QA en ingles tecnico: los benchmarks zero-shot (ARC, HellaSwag, WinoGrande, MMLU) muestran recuperacion casi perfecta, por lo que es adecuado para tareas de comprension y respuesta sobre texto en el idioma de entrenamiento del modelo base.
- Prototipado de asistentes con vision (limitado): la torre de vision esta presente en BF16 pero la ruta de imagen no esta cableada en esta release; solo util si se implementa manualmente el pipeline multimodal sobre `inkling2_loop.py`.

## Benchmarks y rendimiento

Metricas medidas en un M3 Max de 64 GB. Perplexity, KL y top-1 usan 8 filas de WikiText-2 x 256 tokens con el checkpoint nativo NVFP4 como referencia (PPL propia 10,5150 en las mismas filas). Zero-shot: 5 tareas x 400 muestras; recuperacion = `quant_acc / reference_acc`.

| Metrica | Este quant (RCO 4.5bpw) | Nativo NVFP4 |
|---|---|---|
| Perplexity (WikiText-2, 8x256) | 10,6018 (+0,09) | 10,5150 |
| KL vs checkpoint nativo | 0,0249 | referencia |
| Top-1 agreement vs nativo | 92,99 % | referencia |
| Recuperacion zero-shot (media, 5 tareas, n=400) | 0,9906 (TASK-LOSSLESS) | 1,000 |
| arc_challenge | 0,996 | 1,000 |
| arc_easy | 1,000 | 1,000 |
| hellaswag | 0,995 | 1,000 |
| winogrande | 0,966 | 1,000 |
| mmlu | 0,996 | 1,000 |
| Decode tok/s (`mlx_lm`, 128 tok) | 30,9 | 28,6 |
| Prompt tok/s | 309 | 264 |
| Pico de RAM | 16,87 GB | 19,82 GB |

Rendimiento en oMLX (verificado 2026-11-21):

| Metrica | Valor |
|---|---|
| Huella de carga (oMLX `actual:`) | 15,57 GB |
| Prefill tok/s (frio, ~4,5k ctx) | 669 |
| Decode tok/s (~4,5k ctx) | 27,4 |

No se han publicado resultados de benchmarks estandar (MMLU completo, HumanEval, GSM8K) para el modelo base en la informacion disponible; las cifras anteriores son de recuperacion respecto al checkpoint nativo, no absolutas.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: pico medido de 16,87 GB en `mlx_lm` y huella de carga de 15,57 GB en oMLX. El repo pesa 16,6 GB en disco.
- GPU recomendadas: Apple Silicon exclusivamente (MLX). Verificado en M3 Max de 64 GB. No hay soporte CUDA ni ROCm documentado.
- Cabe en consumer GPU: si, en Apple Silicon con al menos 24-32 GB de memoria unificada; el pico medido de 16,87 GB deja margen en un M3 Max de 64 GB, y en configuraciones de 32 GB deberia caber con holgura. En GPUs NVIDIA consumer no es desplegable sin conversion a otro formato, no documentada.
- Opciones de despliegue: `mlx-lm` 0.32.2 (verificado), `mlx-lm` 0.32.3.dev8 empaquetado en oMLX (verificado), y oMLX con `trust_remote_code: true`, `model_type_override: "llm"`, `mtp_enabled: false`, `ttl_seconds: 3600`. No compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual.
- Latencia y throughput: decodificacion 30,9 tok/s (`mlx_lm`, 128 tok) y 27,4 tok/s (oMLX, ~4,5k ctx); prefill 309 tok/s (`mlx_lm`) y 669 tok/s (oMLX, frio). El autor advierte que el prefill de oMLX es en frio (cada peticion con prefijo unico para evitar la cache de prefijos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| hermitdave/Inkling-2-Mini-MLX-RCO-4.5bpw | 26,4 B (MoE, 128 expertos top-8) | no disponible | MLX safetensors, 4,46 bpw | Apache 2.0 | Cuantizacion RCO mixta; PPL 10,6018; 30,9 tok/s en M3 Max |
| thinkingmachines/Inkling-2-Mini (checkpoint publicado) | 26,4 B (MoE looped) | no disponible | safetensors NVFP4/MXFP8/BF16 | Apache 2.0 | Referencia nativa; PPL 10,5150; 19,53 GB; 28,6 tok/s |
| Alternativas de mismo tamano en MLX | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion sobre otros modelos de 26 B en formato MLX con los que comparar directamente en la documentacion proporcionada.

## Limitaciones y advertencias

- La reconstruccion BF16 de los expertos no es el BF16 original: el redondeo NVFP4 ya esta incorporado en el checkpoint publicado. En las 20 capas NVFP4 el resultado puede igualar al nativo pero no superarlo.
- La cabeza MTP DSpark (636 MB, BF16) no se incluye; el runtime no implementa la cabeza MTP (`mtp_enabled: false`), por lo que no hay decodificacion especulativa.
- La torre de vision esta presente en BF16 pero la ruta de imagen no esta cableada en oMLX (`model_type_override: "llm"`); el uso multimodal no esta soportado en esta release.
- Requiere `trust_remote_code=True` obligatoriamente: el `model_file` (`inkling2_loop.py`) es el unico hook de `mlx-lm` para una arquitectura que ninguna release registra. Esto implica ejecutar codigo del repositorio, con el riesgo de seguridad asociado.
- Solo funciona en Apple Silicon con `mlx-lm`; no hay soporte para CUDA, ROCm, vLLM, llama.cpp, Ollama ni TGI documentado.
- No hay datos publicados sobre sesgos, tasas de alucinacion, idiomas soportados ni rendimiento en tareas de codigo o matematicas del modelo base en la informacion disponible.
- El autor advierte que `eval_quality.py` carga la referencia solo para puntuar KL/top-1 y nunca imprime su PPL, por lo que el delta de perplexity no es legible directamente de ese script.
- El prefill medido en oMLX es en frio; el throughput en caliente con cache de prefijos puede diferir.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de datos sobre sesgos y alineamiento hace recomendable evaluacion propia antes de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/hermitdave/Inkling-2-Mini-MLX-RCO-4.5bpw
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- PR borrador `mlx-lm` #2086 (looped Mini): https://github.com/ml-explore/mlx-lm/pull/2086
- PR borrador `mlx-lm` #2061: https://github.com/ml-explore/mlx-lm/pull/2061
