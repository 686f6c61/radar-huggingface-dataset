# hossain0909/Keural-Nova-v1.0

## Resumen

Keural Nova v1.0 es un modelo de instrucción orientado al coreano, desarrollado por MKD (publicado en HuggingFace por el usuario hossain0909) a partir de Qwen/Qwen3.6-35B-A3B, un modelo Mixture-of-Experts de 35B parámetros con unos 3B activos por token. El ajuste se realizó mediante LoRA (posteriormente fusionado en los pesos base) para mejorar la calidad conversacional en coreano, manteniendo una mezcla de datos en inglés para limitar la regresión de capacidades generales.

El valor diferencial del modelo es su rendimiento en diálogo y comprensión en coreano: mejora KoBEST en +5,94 puntos respecto al modelo base y normaliza el formato de respuestas matemáticas (GSM8K strict-match pasa de 32,15 a 87,11, aunque el autor aclara que ese salto es principalmente de cumplimiento de formato). A cambio, sufre una regresión notable en generación de código (HumanEval cae de 62,2 a 20,7 pass@1) y pequeñas pérdidas en benchmarks de conocimiento.

Es relevante como ejemplo de fine-tune especializado por idioma sobre arquitecturas MoE modernas: adapta los 256 expertos enrutados por capa mediante LoRA, congela el router para preservar la integridad del enrutamiento, y publica de forma transparente benchmarks propios con lm-evaluation-harness, incluyendo una versión hermana (v1.1) con dos épocas de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención lineal Gated-DeltaNet (heredado de Qwen3.6-35B-A3B), torre de visión presente pero sin entrenar |
| Parametros totales | 35.107.181.936 (~35,1B) |
| Parametros activos | ~3B por token (MoE) |
| Longitud de contexto | 262.144 tokens nativos; hasta 1.000.000 tokens con YaRN (factor 4.0, verificado en producción por MKD) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 71,9 GB) |

## Arquitectura y entrenamiento

La arquitectura base es Qwen3.6-35B-A3B: un modelo Mixture-of-Experts con 35B parámetros totales y ~3B activos por token, que combina atención estándar con módulos de atención lineal Gated-DeltaNet y 256 expertos enrutados por capa más expertos compartidos. Conserva la torre de visión multimodal del base, pero en este fine-tune no se entrenó ni evaluó, por lo que debe tratarse como un modelo de texto.

El ajuste se realizó con LoRA (rank 32, alpha 64, dropout 0.0) fusionado en los pesos base, adaptando las proyecciones de atención (q/k/v/o_proj), los tensores de la atención lineal Gated-DeltaNet, los expertos compartidos y los 256 expertos enrutados por capa (mediante `target_parameters` de PEFT sobre tensores fusionados gate_up_proj/down_proj). Se congelaron deliberadamente el router MoE, `shared_expert_gate`, los embeddings, la LM head y la torre de visión; se verificó programáticamente que el router y las gates quedan bit a bit idénticos al modelo base.

Los datos de entrenamiento constan de 253.528 ejemplos (~85% coreano, 15% replay en inglés) procedentes de 13 fuentes con licencias permisivas (CC BY 4.0, MIT, Apache-2.0, CC BY-SA 4.0; se excluyeron por política los subconjuntos derivados de AI Hub por sus términos no comerciales). Formato ChatML con bloque `<think>` vacío (modo non-thinking) y máscara de pérdida solo sobre tokens del asistente. El entrenamiento usó batch efectivo 32, LR 1e-4 con schedule coseno, warmup 5%, bf16, DeepSpeed ZeRO-2 sobre 2× H200. Este checkpoint corresponde al paso 7.500 (~1 época), con mejor loss de evaluación held-out del run (0,857). No se menciona RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en coreano, su capacidad principal: mejora sustancial de KoBEST (+5,94 sobre el base).
- Comprensión y generación de texto bilingüe ko/en, con replay en inglés para mitigar el olvido catastráfico.
- Respuestas matemáticas con formato correcto (GSM8K strict-match 87,11), aunque la ganancia es principalmente de formato, no de razonamiento.
- Respuestas grounded estilo RAG en coreano (uso previsto declarado por el autor).
- Contexto largo: hasta 1M tokens con YaRN, servido en producción vía gateway compatible con OpenAI (sin benchmark dedicado de precisión en contexto largo).
- Arquitectura multimodal heredada (torre de visión presente), pero no entrenada ni evaluada: tratar como modelo de solo texto.
- No hay evidencia de soporte de tool calling, function calling ni agentes; el entrenamiento usó formato ChatML non-thinking, por lo que el modo thinking del base no está ajustado.

## Casos de uso

- Asistentes conversacionales en coreano: es el caso de uso principal; el fine-tune optimiza diálogo multi-turno en ChatML con calidad medida en KoBEST (68,82).
- Sistemas RAG en coreano: el autor declara el grounded answering en coreano como uso previsto; con ventana nativa de 262K tokens (ampliable a 1M con YaRN) puede ingerir documentos largos, aunque conviene validar la precisión en contexto largo con pruebas propias.
- Atención al cliente automatizada bilingüe ko/en: el 15% de replay en inglés permite gestionar consultas mixtas, con predominio del coreano.
- Comprensión y resumen de documentos coreanos extensos: la ventana de 1M tokens servida en producción permite procesar corpora grandes en una sola sesión.
- Resolución de problemas matemáticos con formato de respuesta limpio: GSM8K strict-match de 87,11 lo hace apto para flujos que requieren extracción automática de respuestas.
- Chatbots embebidos con coste de inferencia contenido: al ser MoE con ~3B parámetros activos, el throughput por token es comparable a modelos densos pequeños manteniendo la capacidad de un 35B.
- No recomendado para generación de código: la regresión en HumanEval (20,7 pass@1) lo descarta; usar el modelo base en ese caso.

## Benchmarks y rendimiento

Medidos por el propio autor con lm-evaluation-harness 0.4.12 (backend vLLM, bf16, seed 42, ajustes few-shot por defecto), mismos ajustes para base y fine-tune:

| Benchmark | Base model | Keural Nova v1.0 | Keural Nova v1.1 | Δ v1.0 vs base |
|---|---:|---:|---:|---:|
| KoBEST | 62,88 | 68,82 | 67,29 | +5,94 |
| HAE-RAE | 75,53 | 73,42 | 74,52 | −2,11 |
| KMMLU | 64,46 | 62,52 | 62,38 | −1,94 |
| MMLU | 83,83 | 82,07 | 82,37 | −1,76 |
| GSM8K (strict-match) | 32,15* | 87,11 | 86,88 | +54,96* |
| HumanEval (pass@1) | 62,20 | 20,73 | 11,59 | −41,47 |

\* El autor advierte que el GSM8K del base está deprimido por un fallo de extracción de formato en strict-match; con flexible-extract el fine-tune puntúa 87,49. El salto debe interpretarse como mejora de formato, no de razonamiento. No hay comparación con modelos de terceros en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: ~70 GB solo de pesos (repo de 71,9 GB), más KV cache; en la práctica se necesita una GPU de 80 GB (A100/H100) o reparto en varias GPUs.
- Gracias a la naturaleza MoE (~3B parámetros activos), el ancho de banda de cómputo por token es bajo: el cuello es la memoria de pesos, no el FLOPs.
- No cabe en GPUs de consumo (RTX 4090/3090, 24 GB) en precisión completa; una versión cuantizada (GGUF/AWQ) podría reducir el footprint a ~20-40 GB, pero no hay cuantizaciones publicadas en la información disponible.
- Entrenamiento original: 2× NVIDIA H200 con DeepSpeed ZeRO-2.
- Despliegue: el autor midió los benchmarks con vLLM y sirve el modelo vía un gateway propio compatible con OpenAI (incluido contexto de 1M con YaRN factor 4.0); al ser un modelo Qwen3.6 con safetensors, es razonable esperar compatibilidad con vLLM, TGI, SGLang y transformers. No hay confirmación de soporte en llama.cpp u Ollama.
- Datos de latencia y throughput: no disponibles.

## Comparativa con modelos similares

| | Keural Nova v1.0 | Qwen3.6-35B-A3B (base) | Keural Nova v1.1 |
|---|---|---|---|
| Parametros totales | ~35,1B | ~35,1B | ~35,1B |
| Parametros activos | ~3B | ~3B | ~3B |
| Contexto | 262K (1M con YaRN) | 262K (1M con YaRN) | 262K (1M con YaRN) |
| KoBEST | 68,82 | 62,88 | 67,29 |
| MMLU | 82,07 | 83,83 | 82,37 |
| HumanEval pass@1 | 20,73 | 62,20 | 11,59 |
| Licencia | Apache-2.0 | Apache-2.0 | Apache-2.0 |
| Especialización | Coreano (diálogo/comprensión) | General multimodal | Coreano (2 épocas) |

Contra otros fine-tunes coreanos de terceros o modelos coreanos nativos no hay datos comparables en la información disponible.

## Limitaciones y advertencias

- Regresión severa en generación de código: HumanEval cae de 62,2 a 20,7 pass@1. Causa identificada por el autor: corrupción de espacios/indentación en ejemplos de código de una fuente de entrenamiento upstream. No usar para código; el autor promete una versión futura con datos reparados.
- Regresión de 1-2 puntos en benchmarks de conocimiento (KMMLU, HAE-RAE, MMLU): para QA intensivo en conocimiento, preferir el modelo base.
- La mejora en GSM8K es esencialmente de formato de respuesta, no de capacidad de razonamiento.
- La precisión en contexto largo (hasta 1M tokens) no ha sido medida con benchmarks dedicados (needle-in-a-haystack, RULER); validar con la carga de trabajo concreta antes de producción.
- La torre de visión está presente pero sin entrenar ni evaluar: no confiar en capacidades multimodales.
- 13.700 filas del dataset (13,7k) tienen licencia upstream sin verificar (`license: unknown`, documentada como Apache-2.0 pendiente de confirmación), lo que introduce una pequeña incertidumbre de licenciamiento en los datos de entrenamiento, aunque el modelo se distribuye como Apache-2.0.
- Sesgos: no documentados específicamente; hereda los sesgos del modelo base Qwen y de los datos de instrucción coreanos usados.
- Riesgo de alucinación: no cuantificado en la model card; aplicar salvaguardas habituales en producción.
- Modelo de nicho con adopción muy reducida (283 descargas, 0 likes en el momento de la ficha): comunidad y soporte limitados.
- El SFT se limitó a 8.192 tokens de secuencia; el comportamiento en ventanas muy superiores depende del base y de YaRN, no del ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hossain0909/Keural-Nova-v1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Versión hermana (2 épocas): Keural Nova v1.1 (enlace no disponible en la información proporcionada)
- Paper, repositorio de código y demo: no disponibles
