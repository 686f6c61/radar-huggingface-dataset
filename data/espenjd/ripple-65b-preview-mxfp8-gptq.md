# EspenJD/Ripple-65B-Preview-MXFP8-GPTQ

## Resumen

Ripple-65B-Preview-MXFP8-GPTQ es una cuantización de 8 bits del modelo Ripple-65B-Preview de ricursiveAI, publicada por el usuario EspenJD. El objetivo declarado es reducir el peso del modelo de 129,6 GB en BF16 a 67,8 GB, de modo que quepa en una única GPU de 96 GB (RTX PRO 6000) en lugar de requerir dos. Emplea el formato MXFP8 (FP8 E4M3 con una escala de potencia de dos UE8M0 por cada 32 elementos de entrada) combinado con GPTQ secuencial para minimizar el error de salida por capa sobre datos de calibración reales.

El modelo base cuenta con 64.782.689.360 parámetros (unos 64,8 mil millones) distribuidos en 80 capas de decoder. La model card no detalla la arquitectura interna más allá de la estructura de proyecciones (q, k, v, g, o, gate, up, down) y la presencia de un mecanismo de "value-residual" con pesos `value_res_lambda`, lo que sugiere una variante de atención con residuo de valores, pero no se confirma si es un transformer denso o una arquitectura híbrida.

La relevancia de esta publicación es fundamentalmente práctica: demuestra un flujo de cuantización FP8 con GPTQ que mantiene una divergencia KL media de 0,00275 frente al BF16 original y un 98,76% de acuerdo en el token top-1, lo que la hace viable para despliegue en producción con una sola GPU de gama alta. No obstante, las pruebas de calidad se limitan a seis benchmarks y el propio autor advierte que los resultados en MMLU-Pro, GPQA Diamond e IFBench son inconcluyentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 80 capas (detalles internos no disponibles; proyecciones q, k, v, g, o, gate, up, down y mecanismo value-residual) |
| Parametros totales | 64.782.689.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8 (FP8 E4M3 con escala UE8M0 por bloque de 32 elementos); GPTQ secuencial; pesos en BF16 para embedding, lm_head, normas y `value_res_lambda`; KV cache en BF16 |
| Idiomas soportados | no disponible (la calibración incluye dominios en japones y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout NVIDIA ModelOpt: `X.weight` F8_E4M3 [out, in], `X.weight_scale` U8 [out, in/32]) |

## Arquitectura y entrenamiento

El modelo base Ripple-65B-Preview es un transformer de 80 capas con 64,8 mil millones de parámetros. La model card de esta cuantización no proporciona detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Los datasets listados como fuente de calibración y evaluación son muestras de NVIDIA Nemotron: SFT Agentic v2, SFT Competitive Programming v2, SFT Instruction Following Chat v3, SFT Science v2, SFT Multilingual v2 y Pretraining Dataset sample, lo que indica que el modelo base fue entrenado o ajustado con datos orientados a agentes, código, instrucciones, ciencia y multilingüismo.

La innovación técnica de esta publicación es el proceso de cuantización. Todas las 640 proyecciones del decoder se cuantizan a FP8 E4M3 con una escala de potencia de dos por cada 32 elementos de entrada, siguiendo el formato OCP MX. Sobre esa rejilla fija se aplica GPTQ secuencial: las activaciones de calibración fluyen capa a capa, de modo que cada capa recibe entradas de las capas ya cuantizadas y los errores se compensan a medida que se acumulan. Para cada capa se recogen matrices de Hessian por entrada compartida (q/k/g, v, o, gate/up, down), y GPTQ cuantiza columnas en orden propagando el error a las columnas aún no cuantizadas, con un damping del 1% y bloques de 128. La escala MXFP8 de cada bloque se fija cuando GPTQ alcanza su primera columna. Se usaron 180 secuencias de calibración (12 por cada uno de 15 dominios, 2.048 tokens cada una) renderizadas con la plantilla de chat propia de Ripple. Se probó y descartó una búsqueda MSE del exponente de escala por bloque, que empeoraba ligeramente el resultado (0,00594 frente a 0,00589 en el split de desarrollo).

## Capacidades

- Generación de texto conversacional y de instrucciones, según el pipeline declarado (`text-generation`) y los datasets de ajuste del modelo base.
- Razonamiento orientado a agentes: la calibración incluye dominios de tool calling, agente de búsqueda y agente interactivo.
- Programación competitiva y generación de código: dominio presente en los datasets Nemotron SFT Competitive Programming y synthetic code.
- Text-to-SQL y matemáticas web: dominios incluidos en el conjunto de calibración y evaluación.
- Respuesta a preguntas de ciencia en formato de opción múltiple (science MCQ).
- Capacidades multilingües: se incluyen dominios en japonés y coreano en la evaluación, aunque no se especifica la lista completa de idiomas soportados.
- Seguimiento de instrucciones y conversación multi-turno (dataset SFT Instruction Following Chat v3).
- No se documentan capacidades de visión, audio, tool calling nativo ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Despliegue en una sola GPU de 96 GB: el objetivo principal de esta build es ejecutar un modelo de 64,8B parámetros en una única RTX PRO 6000, reduciendo costes de infraestructura frente a la versión BF16 que requiere dos GPUs.
- Atención al cliente automatizada: el modelo base está ajustado con datos de instrucciones y conversación, y su tamaño permite gestionar diálogos multi-turno con una latencia razonable en una sola GPU; la longitud de contexto concreta no está disponible.
- Agentes de búsqueda y automatización: la calibración incluye dominios de search agent e interactive agent, lo que sugiere que el modelo base está preparado para flujos de tool calling y razonamiento multi-paso, aunque esta cuantización no documenta explícitamente el soporte nativo.
- Generación de código en pipelines de CI/CD: el dominio de programación competitiva y código sintético está representado en los datos de entrenamiento; el modelo puede integrarse en herramientas de revisión o generación de parches, con la advertencia de que no se han ejecutado benchmarks de código sobre esta build.
- Análisis de documentación técnica y científica: el dominio science MCQ y web QA sugiere utilidad para responder preguntas sobre literatura técnica, con la cautela de que GPQA Diamond resultó inconcluyente en la comparación con BF16.
- Servicio multilingüe en japonés y coreano: la evaluación incluye estos idiomas, por lo que el modelo puede emplearse en aplicaciones de atención o generación de contenido en esos mercados, aunque no se detalla el resto de idiomas soportados.
- Prototipado e investigación: al ser una cuantización Apache 2.0 con un KLD bajo y publicada con scripts de verificación, sirve como referencia para estudiar el impacto de MXFP8+GPTQ en modelos de gran tamaño.

## Benchmarks y rendimiento

La model card reporta comparaciones de divergencia KL y acuerdo top-1 frente al BF16 original, no resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) con valores numéricos completos.

**Split de test (120 secuencias, 245.640 posiciones):**

| Build | KLD media | IC 95% | Mediana | p99 | Acuerdo top-1 |
|---|---|---|---|---|---|
| MXFP8 round-to-nearest (= Flare `--online-mxfp8`) | 0,00614 | [0,00502; 0,00733] | 0,00032 | 0,07358 | 98,19% |
| MXFP8 GPTQ, primeras 128 secuencias | 0,00266 | [0,00216; 0,00320] | 0,00013 | 0,02728 | 98,82% |
| MXFP8 GPTQ, 180 secuencias (esta build) | 0,00275 | [0,00218; 0,00343] | 0,00012 | 0,02910 | 98,76% |

**Split de desarrollo (60 secuencias):**

| Build | KLD media | IC 95% | Acuerdo top-1 |
|---|---|---|---|
| MXFP8 round-to-nearest | 0,00589 | [0,00434; 0,00764] | 98,29% |
| MXFP8 RTN + búsqueda de escala | 0,00594 | [0,00438; 0,00767] | 98,28% |
| MXFP8 GPTQ, primeras 128 secuencias | 0,00285 | [0,00201; 0,00382] | 98,84% |
| MXFP8 GPTQ, 180 secuencias | 0,00280 | [0,00188; 0,00404] | 98,89% |

En la comparación cualitativa de seis benchmarks frente al BF16 original, el autor indica que no hay diferencias significativas, pero solo tres se consideran equivalentes; MMLU-Pro, GPQA Diamond e IFBench son inconcluyentes, e IFBench favorece al BF16 por 2,7 puntos. No se ejecutaron benchmarks de código, agentes, seguridad ni contexto largo. Los valores numéricos de esos seis benchmarks no se detallan en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 67,8 GB de pesos en MXFP8, más overhead de activaciones y KV cache en BF16, lo que encaja en una GPU de 96 GB.
- GPU recomendadas: NVIDIA RTX PRO 6000 (96 GB) para una sola tarjeta; también cabe en A100 80 GB y H100 80 GB con margen ajustado para KV cache, y en configuraciones multi-GPU.
- GPU de consumo: no cabe en RTX 4090 (24 GB), RTX 5090 (32 GB) ni en GPUs de 48 GB sin técnicas adicionales de offloading o cuantización más agresiva, que no están documentadas para esta build.
- Opciones de despliegue: el modelo usa `transformers` con `custom_code` y layout ModelOpt; la model card menciona NVIDIA Flare con `--online-mxfp8` como referencia de kernels. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B-Preview-MXFP8-GPTQ | 64,8B | no disponible | MXFP8 + GPTQ (safetensors) | Apache 2.0 | Hugging Face, 59 descargas |
| Ripple-65B-Preview (BF16) | 64,8B | no disponible | BF16 (safetensors) | Apache 2.0 | Hugging Face (modelo base) |
| MXFP8 round-to-nearest (referencia del autor) | 64,8B | no disponible | MXFP8 (safetensors) | Apache 2.0 | No publicada como repo independiente en la información disponible |

No se dispone de datos de benchmarks de tareas ni de otros modelos comparables de la misma categoría en la información proporcionada, por lo que no es posible una comparación cuantitativa con alternativas como Llama, Qwen o Mistral.

## Limitaciones y advertencias

- La cuantización no es bit-lossless: ningún formato de 8 bits lo es. La rejilla de escala es fija y GPTQ solo elige los valores de 8 bits para minimizar el error por capa.
- IFBench muestra una ventaja de 2,7 puntos a favor del BF16 original, lo que sugiere una posible degradación en el seguimiento estricto de instrucciones.
- MMLU-Pro y GPQA Diamond se consideran inconcluyentes; no se ejecutaron benchmarks de código, agentes, seguridad ni contexto largo, por lo que el rendimiento en esas áreas es desconocido.
- La model card no documenta sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas específicas del modelo base.
- La longitud de contexto no está disponible, lo que impide planificar despliegues que dependan de ventanas largas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base y de los datasets Nemotron utilizados en calibración.
- El repositorio tiene solo 59 descargas y 0 likes, y fue creado en noviembre de 2026, por lo que la validación por parte de la comunidad es mínima.
- El despliegue requiere soporte para el layout ModelOpt y `custom_code` de Transformers; no se garantiza compatibilidad con todos los motores de inferencia.
- El KV cache permanece en BF16, lo que consume VRAM adicional proporcional a la longitud de contexto y al tamaño de lote.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/EspenJD/Ripple-65B-Preview-MXFP8-GPTQ
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Método KLD de Local Inference Lab: https://github.com/local-inference-lab/rtx6kpro/tree/master/kld
- Referencia arXiv 2602.06036 (citada en los tags): no disponible el título en la información proporcionada
- Referencia arXiv 2210.17323 (GPTQ): no disponible el título en la información proporcionada
- Referencia arXiv 2110.14168 (citada en los tags): no disponible el título en la información proporcionada
- Referencia arXiv 2406.01574 (citada en los tags): no disponible el título en la información proporcionada
- Referencia arXiv 2311.12022 (citada en los tags): no disponible el título en la información proporcionada
