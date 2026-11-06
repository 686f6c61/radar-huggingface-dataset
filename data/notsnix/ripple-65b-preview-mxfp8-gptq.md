# notSnix/Ripple-65B-Preview-MXFP8-GPTQ

## Resumen

Ripple-65B-Preview-MXFP8-GPTQ es una compilación cuantizada del modelo ricursiveAI/Ripple-65B-Preview, publicada por el usuario notSnix. Se trata de una conversión a formato MXFP8 (FP8 E4M3 con escalas de bloque UE8M0 de 32 elementos) combinada con GPTQ secuencial, cuyo objetivo es reducir el peso del modelo de 129,6 GB en BF16 a 67,8 GB, permitiendo su ejecución en una única GPU de 96 GB (por ejemplo, RTX PRO 6000) en lugar de las dos necesarias para el original.

El modelo base cuenta con 64.782.689.360 parámetros (aproximadamente 65B) distribuidos en 80 capas de decoder. La cuantización afecta a las 640 proyecciones del decoder (q, k, v, g, o, gate, up, down), mientras que el embedding de tokens, el `lm_head`, las normalizaciones y los pesos `value_res_lambda` se mantienen en BF16. La caché KV tampoco se cuantiza.

La relevancia de esta ficha radica en que demuestra un flujo de cuantización reproducible con métricas de divergencia KL frente a BF16 medidas sobre un conjunto de test fijo, así como en su integración con el ecosistema NVIDIA (ModelOpt, Flare) y con Transformers. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo es una revisión "Preview" y los datos de benchmarks de capacidades no están publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (80 capas), según pesos del modelo base; detalles completos no disponibles |
| Parametros totales | 64.782.689.360 (~65B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP8 (FP8 E4M3 con escala UE8M0 por bloque de 32 elementos) + GPTQ secuencial; pesos BF16 en embedding, lm_head, norms y value_res_lambda |
| Idiomas soportados | No disponible (los datasets de calibración incluyen dominios en japonés y coreano, pero no se declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con layout NVIDIA ModelOpt (`quant_method: modelopt`, `quant_algo: MIXED_PRECISION`) |

## Arquitectura y entrenamiento

La arquitectura del modelo base no se detalla en la información proporcionada; los pesos cuantizados corresponden a un transformer decoder-only de 80 capas con 640 proyecciones cuantizadas (q, k, v, g, o, gate, up, down). El modelo incorpora componentes específicos como normas q/k y pesos `value_res_lambda` asociados a una mezcla de residuales de valor, lo que sugiere una variante arquitectónica con atención y flujo residual particulares. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición del dataset de preentrenamiento del modelo base.

El proceso de cuantización es el elemento técnico destacable. Primero se fija la rejilla MXFP8: cada bloque de 32 elementos usa una escala `2^ceil(log2(amax / 448))`, de modo que ningún valor se recorta y los valores se redondean al E4M3 más cercano (empates a par). Después se aplica GPTQ secuencial capa a capa: las activaciones de calibración fluyen por el modelo y las entradas de cada capa provienen de las capas ya cuantizadas, compensando el error acumulado. Se recogen Hessianas por entrada compartida (q/k/g, v, o, gate/up, down), se cuantizan columnas en orden y se propaga el error a las columnas pendientes con damping del 1% y bloques de 128. La calibración usa 180 secuencias (12 por cada uno de 15 dominios, 2.048 tokens cada una) renderizadas con la plantilla de chat de Ripple, provenientes de datasets Nemotron de NVIDIA (tool calling, agentes, código, SQL, ciencia, multilingüe, etc.). Se probó y descartó una búsqueda MSE del exponente de escala por bloque, que empeoraba ligeramente el redondeo simple (0,00594 frente a 0,00589 en dev).

## Capacidades

- Generación de texto conversacional y de instrucciones, según el pipeline `text-generation` y los datasets de SFT de instrucciones y chat empleados en la calibración.
- Razonamiento agéntico y tool calling, evidenciado por los dominios de calibración de agentes y búsqueda (Nemotron-SFT-Agentic-v2).
- Generación de código y programación competitiva (Nemotron-SFT-Competitive-Programming-v2, dominio de código sintético).
- Text-to-SQL y respuesta sobre datos estructurados (dominio text-to-SQL en la calibración).
- Razonamiento científico y matemático, incluyendo preguntas de opción múltiple de ciencia y matemáticas web y SFT (Nemotron-SFT-Science-v2).
- Capacidades multilingües parciales: los conjuntos de calibración incluyen dominios en japonés y coreano, aunque no se declara una lista oficial de idiomas.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Despliegue en una única GPU de 96 GB: el modelo cuantizado ocupa 67,8 GB, lo que permite servirlo en una RTX PRO 6000 sin necesidad de dos GPUs como el BF16 original, reduciendo coste de infraestructura.
- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno y de instrucciones, apoyándose en su entrenamiento con datos de chat e instrucciones; la longitud de contexto debe confirmarse en el modelo base antes de fijar límites de producción.
- Agentes autónomos y tool calling: los datos de calibración incluyen dominios de agentes interactivos y búsqueda, por lo que es adecuado para pipelines que requieran llamadas a funciones y razonamiento multi-paso.
- Generación de código en producción: puede integrarse en asistentes de código y revisión, dado el dominio de programación competitiva y código sintético presente en la calibración; conviene validar la calidad con evaluaciones propias al no haber benchmarks publicados.
- Text-to-SQL y analítica de datos: útil para traducir preguntas en lenguaje natural a consultas SQL sobre esquemas de bases de datos, un dominio explícito del conjunto de calibración.
- Tutoría y respuesta científica: adecuado para preguntas de ciencia y matemáticas, incluyendo formato de opción múltiple, gracias al dominio Nemotron-SFT-Science-v2.
- Inferencia con Transformers y kernels FP8: al declarar `quant_method: modelopt`, puede cargarse con Transformers y aprovechar kernels de NVIDIA Flare para multiplicar pesos MXFP8 por activaciones BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se publican métricas de fidelidad de la cuantización frente a BF16:

| Build | Mean KLD (test) | IC 95% | Mediana | p99 | Top-1 agreement |
|---|---|---|---|---|---|
| MXFP8 round-to-nearest | 0,00614 | [0,00502; 0,00733] | 0,00032 | 0,07358 | 98,19% |
| MXFP8 GPTQ, 128 secuencias | 0,00266 | [0,00216; 0,00320] | 0,00013 | 0,02728 | 98,82% |
| MXFP8 GPTQ, 180 secuencias (esta build) | 0,00275 | [0,00218; 0,00343] | 0,00012 | 0,02910 | 98,76% |

En el split de desarrollo (60 secuencias), esta build obtiene KLD media de 0,00280 [0,00188; 0,00404] y top-1 del 98,89%, frente a 0,00589 del redondeo simple. La comparación entre las dos builds GPTQ queda dentro del ruido: en test, esta build menos la primera es +0,00010 (IC 95% -0,00015 a +0,00039).

## Requisitos de hardware

- VRAM estimada: 67,8 GB de pesos en MXFP8; el original BF16 requiere 129,6 GB. La caché KV no está cuantizada (BF16), por lo que la VRAM total depende de la longitud de contexto y del batch.
- GPU recomendadas: una RTX PRO 6000 de 96 GB es suficiente para los pesos; para el BF16 original se necesitan dos GPUs de 96 GB.
- Cabe en GPU de consumo: no con 67,8 GB de pesos en una sola unidad; se requeriría hardware de 80-96 GB o multi-GPU.
- Opciones de despliegue: Transformers (librería declarada) con soporte de ModelOpt; NVIDIA Flare para kernels MXFP8; no se documenta soporte de llama.cpp, Ollama, vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B-Preview-MXFP8-GPTQ | ~65B | No disponible | MXFP8 + GPTQ (67,8 GB) | Apache 2.0 | Hugging Face |
| ricursiveAI/Ripple-65B-Preview (BF16) | ~65B | No disponible | BF16 (129,6 GB) | Apache 2.0 | Hugging Face |
| Alternativas de ~65B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización no es bit-lossless: la build GPTQ presenta una KLD media de 0,00275 y una concordancia top-1 del 98,76% frente a BF16, por lo que existe una degradación medible aunque pequeña.
- Es una revisión "Preview" del modelo base; pueden existir cambios posteriores y no se garantiza estabilidad de la API ni de los pesos.
- No se han publicado evaluaciones de capacidades (MMLU, HumanEval, GSM8K) ni datos de sesgos o alucinación; se recomienda evaluar en el dominio de producción antes de desplegar.
- La longitud de contexto y la lista oficial de idiomas no están documentadas; los dominios de calibración incluyen japonés y coreano, pero no constituyen una declaración de soporte multilingüe.
- La caché KV se mantiene en BF16, lo que limita el ahorro de memoria en contextos largos y con batches grandes.
- El soporte de despliegue está orientado a Transformers y al ecosistema NVIDIA ModelOpt/Flare; otros runners (llama.cpp, Ollama, vLLM) no están documentados y podrían no cargar el layout MXFP8.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y las condiciones del modelo base ricursiveAI/Ripple-65B-Preview, ya que la información disponible no detalla restricciones adicionales.

## Enlaces

- [Hugging Face: notSnix/Ripple-65B-Preview-MXFP8-GPTQ](https://huggingface.co/notSnix/Ripple-65B-Preview-MXFP8-GPTQ)
- [Modelo base: ricursiveAI/Ripple-65B-Preview](https://huggingface.co/ricursiveAI/Ripple-65B-Preview)
- [Método KLD de Local Inference Lab](https://github.com/local-inference-lab/rtx6kpro/tree/master/kld)
- [arXiv:2602.06036](https://arxiv.org/abs/2602.06036)
- [arXiv:2210.17323](https://arxiv.org/abs/2210.17323)
