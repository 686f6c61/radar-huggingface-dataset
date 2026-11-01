# hossain0909/Keural-Nova-v1.1

## Resumen

Keural Nova v1.1 es un modelo de lenguaje orientado al coreano desarrollado por MKD (publicado en HuggingFace por el usuario hossain0909) sobre la base Qwen/Qwen3.6-35B-A3B, un modelo Mixture-of-Experts de 35,1 mil millones de parametros con unos 3 mil millones de parametros activos por token. El trabajo del equipo de Qwen (Alibaba Cloud) cubre la arquitectura y el preentrenamiento; esta version es un ajuste fino supervisado mediante LoRA (posteriormente fusionado en los pesos base) centrado en mejorar la calidad conversacional en coreano, manteniendo capacidades en ingles mediante una mezcla de datos de replay.

El problema que aborda es la falta de modelos abiertos con buen rendimiento en dialogo y comprension en coreano. El ajuste se realizo con 253.528 ejemplos (~85 % coreano, 15 % ingles), en formato ChatML con plantilla non-thinking, durante 2 epocas completas (15.846 pasos). La version v1.0 es el checkpoint del final de la primera epoca y presenta compensaciones ligeramente distintas.

El modelo es relevante por su transparencia: la model card publica benchmarks medidos con lm-evaluation-harness, reconoce regresiones (especialmente en generacion de codigo) y explica sus causas. La arquitectura base soporta de forma nativa 262.144 tokens de contexto y hasta 1 millon de tokens mediante escalado YaRN, y hereda la torre de vision del modelo base, aunque no fue entrenada ni evaluada en esta version.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (transformer con atencion hibrida, incluye Gated-DeltaNet linear attention y torre de vision heredada) |
| Parametros totales | 35.107.181.936 (~35,1B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens nativos; hasta 1.000.000 tokens con YaRN (factor 4.0); SFT entrenado hasta 8.192 tokens |
| Tipos de cuantizacion | no disponible (publicado en bf16) |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con endpoints, libreria transformers) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.6-35B-A3B, un transformer Mixture-of-Experts de 35B parametros con ~3B activos por token. La arquitectura combina atencion estandar con atencion lineal Gated-DeltaNet y consta de expertos enrutados compartidos y enrutados por capa. La torre de vision heredada del modelo base esta presente e intacta, pero no se entreno ni evaluo, por lo que debe tratarse como un modelo de texto.

El ajuste fino se realizo con LoRA (rank 32, alpha 64, dropout 0.0) fusionado en los pesos base. Los modulos adaptados incluyen las proyecciones de atencion (q/k/v/o_proj), la atencion lineal Gated-DeltaNet (in_proj_qkv/z/b/a, out_proj), los expertos compartidos y los 256 expertos enrutados por capa (tensores gate_up_proj/down_proj fusionados via PEFT target_parameters). Se congelaron deliberadamente el router MoE (mlp.gate), shared_expert_gate, los embeddings, la LM head y la torre de vision. La integridad del router se verifico programaticamente: los pesos del router y las gates son identicos bit a bit al modelo base.

El entrenamiento uso 253.528 ejemplos (~85 % coreano, 15 % ingles de replay) de 13 fuentes en formato ChatML con plantilla de think-block vacio (non-thinking), con loss masking solo en tokens del asistente. La configuracion fue batch efectivo 32, LR 1e-4 con schedule coseno, warmup 5 %, bf16, DeepSpeed ZeRO-2 sobre 2x H200, durante 2 epocas (15.846 pasos, loss final de entrenamiento 0.688). Los datos excluyeron por politica todos los subconjuntos derivados de AI Hub (terminos no comerciales de investigacion).

## Capacidades

- Generacion de texto conversacional en coreano: es el objetivo principal del ajuste, con mejora sustancial en KoBEST (62,88 base → 67,29).
- Comprension y generacion de texto bilingue ko/en, con datos de replay en ingles para limitar la regresion de capacidades.
- Respuestas fundamentadas estilo RAG en coreano (uso previsto declarado por el autor).
- Formato de respuestas mejorado: el salto en GSM8K strict-match se atribuye principalmente a cumplimiento de formato de respuesta.
- Arquitectura multimodal heredada (torre de vision presente) pero no entrenada ni evaluada: tratar como modelo de texto.
- Contexto largo teorico hasta 1M tokens con YaRN (factor 4.0), servido en produccion via gateway compatible con OpenAI de MKD, aunque sin benchmark dedicado de precision en contexto largo.
- Formato ChatML non-thinking (think-block vacio); no hay soporte documentado de tool calling ni de agentes.

## Casos de uso

- Asistentes conversacionales en coreano: el modelo esta afinado especificamente para dialogo en coreano con 253.528 ejemplos, mayoritariamente de conversacion, QA e instrucciones en ese idioma, y mejora KoBEST en +4,41 puntos sobre la base.
- Respuestas fundamentadas con RAG en coreano: el uso previsto declarado incluye answering estilo RAG; su contexto nativo de 262K tokens permite ingerir documentos largos, aunque conviene validar la precision en contexto largo para cada carga de trabajo.
- Atencion al cliente automatizada bilingue ko/en: el formato ChatML y el enfoque conversacional lo hacen adecuado para gestionar conversaciones multi-turno con usuarios coreanos que mezclen terminos en ingles.
- Comprension y resumen de documentos coreanos: la ventana de contexto extendida (hasta 1M tokens con YaRN, servida en produccion por MKD) permite procesar corpus extensos, previa validacion con datos propios.
- Chatbots de dominio general en coreano: dado el rendimiento en KoBEST y el entrenamiento con datos de conversacion y QA coreanos de licencias permisivas.
- Uso como asistente general con salida en formato estricto: la mejora de cumplimiento de formato observada en GSM8K strict-match sugiere utilidad en flujos que requieran respuestas estructuradas.
- No es adecuado para generacion de codigo: HumanEval cae de 62,2 a 11,6 pass@1; para codigo debe usarse el modelo base.

## Benchmarks y rendimiento

Medidos por los autores con lm-evaluation-harness 0.4.12 (backend vLLM, bf16, seed 42, configuracion few-shot por defecto), mismas condiciones para base y modelo afinado:

| Benchmark | Suite | Modelo base | v1.0 | v1.1 (este modelo) | Δ v1.1 vs base |
|---|---|---:|---:|---:|---:|
| KoBEST | Coreano | 62,88 | 68,82 | 67,29 | +4,41 |
| HAE-RAE | Coreano | 75,53 | 73,42 | 74,52 | −1,01 |
| KMMLU | Coreano | 64,46 | 62,52 | 62,38 | −2,08 |
| MMLU | General | 83,83 | 82,07 | 82,37 | −1,46 |
| GSM8K (strict-match) | Matematicas | 32,15* | 87,11 | 86,88 | +54,73* |
| HumanEval (pass@1) | Codigo | 62,20 | 20,73 | 11,59 | −50,61 |

\* La puntuacion GSM8K del modelo base esta fuertemente deprimida por un fallo de extraccion de formato en strict-match; el salto tras el SFT es en gran medida cumplimiento de formato, no una ganancia real de razonamiento de ~55 puntos.

Resumen honesto del autor: mejora sustancial el rendimiento conversacional y de comprension en coreano (KoBEST) y el formato de respuestas, a costa de regresiones de 1-2 puntos en benchmarks de recuerdo de conocimiento (KMMLU, HAE-RAE, MMLU) y una gran regresion en generacion de codigo. Para QA de conocimiento o codigo, recomiendan el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 71,9 GB en safetensors (bf16), por lo que se necesitan al menos ~72 GB de VRAM para cargar el modelo completo en precision nativa, mas overhead de KV cache.
- GPUs recomendadas: 2x NVIDIA H200 se usaron para el entrenamiento; para inferencia en bf16, una unica H200 (141 GB) o A100/H100 de 80 GB pueden quedar justas; con multiples GPUs (2x A100 80GB, 2x H100 80GB) hay margen para KV cache.
- Consumer GPUs: no cabe en GPUs de consumo tipicas (RTX 4090 con 24 GB) sin cuantizacion; no hay versiones cuantizadas publicadas en la informacion disponible.
- Opciones de despliegue: transformers (libreria declarada), backend vLLM (usado en las evaluaciones de los autores), endpoints compatibles en HuggingFace; MKD sirve el modelo via un gateway compatible con OpenAI con YaRN factor 4.0 hasta 1M tokens. No hay informacion sobre llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. Al ser un MoE con ~3B parametros activos por token, la latencia por token deberia ser comparable a modelos densos de ~3B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Keural Nova v1.1 | ~35,1B | ~3B | 262K nativo / 1M con YaRN | Apache 2.0 | Afinado para coreano; regresion severa en codigo |
| Keural Nova v1.0 (hermano) | ~35,1B | ~3B | 262K nativo / 1M con YaRN | Apache 2.0 | Checkpoint de 1 epoca; mejor en KoBEST (68,82) y HumanEval (20,73) |
| Qwen/Qwen3.6-35B-A3B (base) | ~35,1B | ~3B | 262K nativo / 1M con YaRN | Apache 2.0 | Mejor en KMMLU, HAE-RAE, MMLU y HumanEval (62,20) |

No hay datos de comparacion con otros modelos coreanos de terceros (p. ej. EXAONE) en la informacion disponible.

## Limitaciones y advertencias

- Regresion severa en generacion de codigo: HumanEval pasa de 62,2 a 11,6 pass@1. Causa identificada: ejemplos de codigo con whitespace/indentacion corruptos en una fuente de datos upstream, de los que el modelo aprendio el formato corrupto. Una futura version lo corregira.
- Regresiones de 1-2 puntos en benchmarks de conocimiento (KMMLU, HAE-RAE, MMLU) respecto al modelo base.
- Contexto: el SFT se entreno solo hasta 8.192 tokens; el contexto extendido (262K/1M) funciona en serving, pero la precision de las respuestas en contexto largo no se ha medido con benchmarks dedicados (needle-in-a-haystack, RULER). Validar con datos propios antes de produccion.
- La capacidad de vision esta presente en la arquitectura pero no fue entrenada ni evaluada: no debe usarse como modelo multimodal.
- Riesgo de alucinacion: no disponible (no se documentan mediciones especificas).
- Licencias de datos: la mayoria del conjunto de entrenamiento usa licencias permisivas (CC BY 4.0, MIT, Apache-2.0, CC BY-SA 4.0), pero 13.7k filas coreanas de dos subconjuntos llevan etiqueta license: unknown (la documentacion upstream indica Apache-2.0, verificacion pendiente), lo que introduce cierta incertidumbre en la trazabilidad de datos.
- El modelo esta muy especializado en coreano; para cargas de trabajo en otros idiomas no hay evaluaciones publicadas.
- Descargas y adopcion muy bajas (294 descargas, 0 likes en el momento de la ficha): comunidad y soporte limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hossain0909/Keural-Nova-v1.1
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Version hermana (v1.0): no disponible (no se proporciona URL directa)
- Paper, repositorio de codigo o demo: no disponible
- La busqueda web no arrojo resultados relevantes adicionales para este modelo.
