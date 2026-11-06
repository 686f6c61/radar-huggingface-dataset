# bertholomus/Ling-3.1-flash-EXL3-3.03bpw

## Resumen

Ling-3.1-flash-EXL3-3.03bpw es una cuantización EXL3 del modelo Ling-3.1-flash de inclusionAI, publicada por Bertholomus AI (usuario bertholomus en Hugging Face). El modelo base es un modelo de lenguaje MoE (Mixture of Experts) con arquitectura híbrida bailing_v3, que combina atención KDA (kernels de flash-linear-attention) con atención MLA, y un total de unos 110.000 millones de parámetros. Esta versión cuantizada reduce el peso del modelo a 3,03 bits por peso (220,6 GB), pensada específicamente para servir el modelo en dos nodos NVIDIA DGX Spark (GB10) con paralelismo tensorial.

El problema que resuelve es doble: por un lado, hacer ejecutable un modelo de más de 100 mil millones de parámetros en hardware de memoria unificada como el GB10 de NVIDIA, y por otro, demostrar un pipeline completo de conversión y despliegue con TensorFold, un motor de inferencia con soporte de tensor-parallel en múltiples nodos. El resultado medido es un decode de 39,8–47,9 tok/s con borradores MTP activados en prompts de hasta 8K tokens, manteniendo servicio hasta la ventana completa de 192K tokens.

Es relevante porque documenta públicamente una de las pocas implementaciones funcionales de Ling-3.1-flash con cuantización extrema y decodificación especulativa MTP, con mediciones de calidad (concordancia top-1 de 0,9723 frente a una referencia en fp32) y de rendimiento reales, algo poco habitual en repositorios de cuantizaciones comunitarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido bailing_v3 (atención KDA en 63 capas + MLA en 9 capas, expertos enrutados y compartidos, capa MTP) |
| Parametros totales | 110.279.977.792 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 196.608 tokens (192K) con MTP activado en esta configuración; el config del modelo base permite 262.144 |
| Tipos de cuantizacion | EXL3 3,03 bpw global: expertos enrutados 3 bits, expertos compartidos 5 bits, KDA 4 bits, MLP densa 4 bits, MLA 6 bits (kv_b_proj sin cuantizar), cabeza de salida 6 bits, capa MTP 4 bits; embeddings, normas, router y convoluciones KDA en BF16 |
| Idiomas soportados | no disponible (consultar la ficha de inclusionAI/Ling-3.1-flash) |
| Licencia | MIT (los pesos); modeling_bailing_moe_v3.py bajo Apache-2.0 |
| Formato de pesos | safetensors (formato EXL3, 35 shards, 220,6 GB) |

## Arquitectura y entrenamiento

La arquitectura es bailing_v3, una variante MoE híbrida con 68 capas de expertos enrutados (512 expertos por capa) más expertos compartidos, y 72 capas de atención en total: 63 usan atención KDA (Kimi Delta Attention, con kernels de la librería flash-linear-attention) y 9 usan atención MLA (Multi-head Latent Attention). Las capas 0–3 tienen MLP densa en lugar de expertos. Incluye una capa MTP (Multi-Token Prediction) que se usa como modelo de borrador para decodificación especulativa, verificada como exacta (los tokens generados son idénticos al decode serial en las pruebas del autor).

Sobre el entrenamiento del modelo base, la información no está incluida en esta ficha: el repositorio es solo una cuantización y remite a la página de inclusionAI/Ling-3.1-flash para la model card original, benchmarks y formato de prompt. El proceso de cuantización sí está documentado con detalle: se partió del checkpoint FP8 del modelo base (revisión `7b864daa`), se convirtió primero a BF16 (cada peso FP8 multiplicado por su escala de bloque en fp32 y redondeado una vez), y se aplicó exllamav3 1.5.3 con un módulo específico para Ling-3.1, con calibración por defecto del conversor (250 filas × 2.048 tokens) en una pasada de 29 h 14 min sobre un GB10.

## Capacidades

Capacidades del modelo base según lo documentado en este repositorio (la model card original de inclusionAI no está reproducida aquí, por lo que algunos puntos son inferibles de la arquitectura):

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Decodificación especulativa mediante la capa MTP integrada, con speedups medidos de ~1,7x frente al decode serial (39,8–47,9 tok/s frente a 23,6–24,1 tok/s).
- Ventana de contexto muy larga: hasta 192K tokens servibles en esta configuración (262.144 según config, sin caber con MTP en 2× GB10).
- No hay información en este repositorio sobre tool calling, capacidades de agentes, visión, audio ni soporte multilingüe explícito.

## Casos de uso

- Servir un MoE de 110B en hardware compacto: la cuantización a 3,03 bpw permite desplegar el modelo completo en dos nodos DGX Spark (GB10, 123,79 GiB de memoria unificada cada uno), algo inviable en precisión completa sin un clúster de GPUs de datacenter.
- Procesamiento de documentos largos: con ventana de 192K tokens y throughput de prompt de 279–703 tok/s según longitud, es adecuado para resumen y análisis de contratos, informes o bases de código extensas.
- Generación de texto interactiva: el decode de ~40–48 tok/s con MTP en contextos de hasta 31K tokens permite uso conversacional razonablemente fluido en local.
- Experimentación con decodificación especulativa exacta: el repositorio documenta un pipeline MTP verificado como bit-exacto frente al decode serial, útil como referencia para quien investigue MTP en modelos MoE híbridos.
- Benchmark de calidad de cuantización: la metodología publicada (concordancia top-1 y KL divergencia frente a forward de referencia en fp32) sirve de plantilla para evaluar cuantizaciones EXL3 de arquitecturas híbridas.
- Infraestructura multi-nodo con TensorFold: el caso de uso de tensor-parallel 2 sobre enlace RoCE directo entre dos GB10 es una referencia para despliegues de inferencia en clústeres pequeños de memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) de esta cuantización en la información disponible. El autor remite a la página del modelo base para los benchmarks de inclusionAI/Ling-3.1-flash. Los datos medidos por el autor son de fidelidad de la cuantización y de rendimiento de serving:

| Métrica | Valor |
|---|---|
| Concordancia top-1 frente a referencia fp32 | 0,9723 (66.103 posiciones, 40 prompts) |
| KL divergencia media | 0,0140 (referencia bf16: 0,9728 / 0,0123) |
| Decode con MTP (prompts ≤8K) | 39,8–47,9 tok/s |
| Decode serial (sin MTP) | 23,6–24,1 tok/s |
| Decode a 31K / 122K / 191K de contexto | 40,3 / 32,2 / 29,8 tok/s |
| Prefill 1K–8K / 31K / 122K / 191K | 595–703 / 587 / 359 / 279 tok/s |
| Tiempo al primer token a 191K | 11,4 minutos |

## Requisitos de hardware

- Memoria: los pesos ocupan 104 GiB por nodo en la configuración TP2, dejando solo ~2 GiB libres por nodo (mínimo 1,84 GiB). No cabe ninguna otra carga en la GPU mientras se sirve.
- Configuración de referencia: dos nodos NVIDIA DGX Spark (GB10, 123,79 GiB cada uno) unidos por enlace RoCE directo, tensor-parallel 2 con TensorFold (rama `ling-3.1-tp2`).
- No cabe en una única GPU consumer ni en un solo GB10: el modelo completo requiere los dos nodos.
- 262.144 tokens de contexto con MTP no caben en 2× GB10; el techo práctico con drafting es 196.608 tokens.
- Despliegue: solo probado con el motor TensorFold del autor (familia bailing_v3). El export tensor-parallel de exllamav3 y el attach del draft MTP no están implementados en el módulo exllamav3 del autor (lanzan excepciones), y no se ha ejecutado generación con exllamav3 estándar. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: ver tabla de rendimiento; destacable el prefill lento en contexto máximo (11,4 min al primer token a 191K).

## Comparativa con modelos similares

Comparativa con el modelo base y con alternativas de formato:

| Modelo | Parametros totales | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| bertholomus/Ling-3.1-flash-EXL3-3.03bpw | 110,28 B | EXL3 3,03 bpw (safetensors) | 192K servible (262K en config) | MIT | Requiere 2× GB10 con TensorFold; mediciones públicas |
| inclusionAI/Ling-3.1-flash | 110,28 B | FP8 (safetensors) | 262.144 | MIT | Modelo original; benchmarks en su model card |
| inclusionAI/Ling-3.1-flash en otros formatos (GGUF, etc.) | 110,28 B | no disponible | no disponible | MIT | no disponible en la información proporcionada |

No hay datos suficientes en la información disponible para comparar con otros MoE de tamaño similar (Qwen3-235B, DeepSeek-V3, etc.) en cuanto a benchmarks de calidad.

## Limitaciones y advertencias

- Calidad de la cuantización no evaluada frente al modelo FP8 original con benchmarks estándar; solo se ha medido fidelidad logit (concordancia top-1 0,9723), lo que sugiere una degradación comparable a bf16 pero no lo garantiza en tareas concretas.
- Solo probado con el motor TensorFold del autor en dos GB10 con enlace RoCE directo; no hay garantía de funcionamiento con exllamav3 estándar ni con otros motores.
- Memoria al límite: ~2 GiB libres por nodo en serving; cualquier proceso adicional en la GPU puede provocar OOM.
- Contexto con MTP limitado a 192K en esta configuración; los 262K del config no son alcanzables con drafting en 2× GB10.
- Prefill muy lento en contextos largos (279 tok/s a 191K, 11,4 minutos al primer token), lo que limita escenarios interactivos de contexto máximo.
- No hay información sobre sesgos, riesgo de alucinación ni soporte de idiomas en este repositorio; consultar la model card de inclusionAI.
- Licencia MIT en los pesos, favorable al uso comercial, pero el archivo `modeling_bailing_moe_v3.py` está bajo Apache-2.0 (Copyright 2025 Antgroup y Hugging Face Inc. team); revisar ambas licencias en usos comerciales.
- Repositorio de autor independiente, no afiliado ni respaldado por inclusionAI, NVIDIA ni los autores de TensorFold o exllamav3; con muy pocas descargas (247) y sin comunidad de soporte.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/bertholomus/Ling-3.1-flash-EXL3-3.03bpw
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.1-flash
- Receta de despliegue y mediciones: https://github.com/bertholomus/ling-3.1-tensorfold-tp2-2xgb10
- TensorFold (de ashhart): https://github.com/ashhart/TensorFold
- Rama del motor usada: https://github.com/bertholomus/TensorFold/tree/ling-3.1-tp2
- Módulo exllamav3 para Ling-3.1: https://github.com/bertholomus/exllamav3/tree/ling-3.1
- exllamav3 (de turboderp): https://github.com/turboderp-org/exllamav3
- flash-linear-attention: https://github.com/fla-org/flash-linear-attention
