# rarevector/gemma-4-31B-it-VectorCut-BF16

## Resumen

gemma-4-31B-it-VectorCut-BF16 es una variante quirúrgicamente modificada del modelo multimodal Gemma 4 31B instruct de Google, publicada por Rare Vector Labs (usuario `rarevector` en Hugging Face). El objetivo declarado del autor es reducir los rechazos (refusals) del modelo base sin degradar su capacidad de razonamiento, escritura creativa, recuperación en contexto largo ni percepción visual. Para ello aplica una intervención localizada sobre 33 neuronas de proyecciones gated-MLP, dejando intactos el backbone de atención, las layer norms, los embeddings y los 356 tensores de visión.

El modelo conserva la arquitectura densa de 31B parámetros del Gemma 4 original (31.273.086.512 parámetros reales según safetensors), una ventana de contexto de 256K tokens, modo de razonamiento paso a paso ("thinking") y capacidades image-text-to-text. Se distribuye en BF16 como checkpoint maestro, sin pesos MTP (multi-token prediction) integrados, pensado para `transformers`, `vLLM`, fine-tuning y cuantización posterior. El autor publica además variantes MLX de 8, 6 y 4 bits para Apple Silicon.

La relevancia de esta ficha radica en que documenta una técnica de "ablación quirúrgica" (VectorCut) que pretende diferenciarse de la abliteración global convencional, que suele dañar atención y visión. El autor aporta verificación por checksum SHA-256 tensor a tensor y benchmarks comparativos contra el Gemma 4 31B de 8 bits sin modificar. No obstante, conviene tratar estas afirmaciones con cautela: es un modelo de autor independiente, con 1 descarga y 0 likes en el momento de la consulta, y sin validación externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text), base Gemma 4 de Google |
| Parametros totales | 31.273.086.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (según model card) |
| Tipos de cuantizacion | BF16 (checkpoint maestro); variantes MLX 8-bit, 6-bit y 4-bit publicadas por el autor |
| Idiomas soportados | 35+ idiomas declarados (en, de, fr, es, it, pt, nl, pl, ru, uk, cs, sv, da, fi, no, tr, ar, he, hi, bn, ta, te, ur, vi, th, id, ms, zh, ja, ko, el, ro, hu, bg, fa, sw, tl); preentrenado en 140+ idiomas según el autor |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16); variantes MLX en repositorios separados |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-31B-it`, un transformer denso multimodal con codificador de visión y capacidad de generación image-text-to-text. Sobre ese checkpoint, Rare Vector aplica su pipeline "VectorCut": en lugar de una abliteración global sobre el residual stream de todos los bloques, interviene únicamente 33 neuronas en proyecciones gated-MLP (99 tensores gated-MLP en total), manteniendo el resto de pesos bit a bit idénticos al original. El autor afirma haber verificado por checksum SHA-256 que 1.089 de 1.188 tensores permanecen idénticos, incluido el 100% de las capas de visión y atención.

No se detalla en la información disponible el volumen de tokens de entrenamiento del modelo base ni la composición del dataset, ni si hubo RLHF o DPO en el Gemma 4 original. La modificación de VectorCut no es un reentrenamiento: es una edición de pesos post-hoc. El checkpoint BF16 no incluye pesos MTP; para decodificación especulativa en BF16 el autor remite a un modelo asistente separado (`google/gemma-4-31B-it-assistant` o `mlx-community/gemma-4-31B-it-assistant-bf16`). Las variantes MLX sí incorporan MTP automáticamente.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de 256K tokens.
- Razonamiento paso a paso en modo "thinking" (built-in thinking), preservado según el autor con 96,66% de coincidencia estricta en `gsm8k_cot`.
- Razonamiento matemático (GSM8K chain-of-thought) y seguimiento de instrucciones (IFEval).
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text), con los 356 tensores de visión intactos en BF16.
- Escritura creativa, worldbuilding y brainstorming, sin rechazos espurios según el propósito declarado del build.
- Capacidades multilingües en 35+ idiomas declarados.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni flujos de agentes multi-paso; debe asumirse heredado del Gemma 4 base, sin confirmación en esta ficha.

## Casos de uso

- Escritura de ficción y narrativa larga: el modelo mantiene la ventana de 256K tokens y, según el autor, conserva la "voz" expresiva del Gemma 4 original; adecuado para novelas, guiones y worldbuilding donde los rechazos interrumpen la sesión.
- Investigación sobre alineación y abliteración: sirve como caso de estudio de una intervención localizada en gated-MLP frente a abliteración global, con checksums verificables para reproducir el análisis tensor a tensor.
- Análisis de documentos extensos con imágenes: la combinación de contexto largo y visión permite procesar informes, contratos o papers con figuras en una sola pasada.
- Asistente multilingüe: cobertura declarada de 35+ idiomas, útil para atención al cliente o soporte en mercados con varios idiomas (es, de, fr, it, pt, nl, pl, ru, zh, ja, ko, ar, hi, entre otros).
- Generación de código y matemáticas asistidas: el rendimiento reportado en GSM8K CoT (96,66% strict match) lo hace viable para tutoría matemática y resolución de problemas paso a paso.
- Base para fine-tuning y cuantización: al ser un checkpoint BF16 limpio sin MTP, es adecuado como punto de partida para ajuste fino con `transformers` y para derivar cuantizaciones propias (GPTQ, AWQ, GGUF) sin arrastrar artefactos del pipeline.
- Despliegue en Apple Silicon: las variantes MLX 8/6/4 bits permiten ejecución local en equipos Mac con memoria unificada, con MTP incluido para decodificación especulativa.

## Benchmarks y rendimiento

Los datos aportados por el autor comparan su build insignia de 8 bits (`oQ8e-mtp`, derivado de este maestro BF16) contra un Gemma 4 31B de 8 bits sin modificar, evaluado con `lm_eval` v0.4.13 a `temperature=0.0` sobre 1.860 muestras totales. No se aportan benchmarks del checkpoint BF16 en sí.

| Tarea | Metrica | VectorCut 8-bit | Baseline 8-bit | Delta |
|---|---|---:|---:|---:|
| `gsm8k_cot` (n=1.319) | exact_match, strict | 96,66% | 96,74% | -0,08 pp |
| `gsm8k_cot` (n=1.319) | exact_match, flexible | 96,44% | 96,51% | -0,08 pp |
| `ifeval` (n=541) | inst_level_loose_acc | 94,60% | 94,72% | -0,12 pp |
| `ifeval` (n=541) | inst_level_strict_acc | 93,05% | 93,05% | Empate |
| `ifeval` (n=541) | prompt_level_loose_acc | 92,24% | 92,24% | Empate |
| `ifeval` (n=541) | prompt_level_strict_acc | 90,02% | 90,02% | Empate |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 62,6 GB solo para pesos (coincide con el tamaño del repo), más overhead de activaciones y KV cache; se recomienda 80 GB o más para inferencia cómoda con contexto largo.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, H200, o multi-GPU con tensor parallelism.
- Consumer GPU: no cabe en BF16 en tarjetas de 24 GB (RTX 4090, 3090). Requiere cuantización (8/6/4 bits) para acercarse a ese rango, y aun así 31B en 4 bits ronda los 16-18 GB, dejando poco margen para contexto largo.
- Apple Silicon: el autor publica variantes MLX 8-bit, 6-bit y 4-bit con MTP incluido, pensadas para memoria unificada de Macs de gama alta.
- Opciones de despliegue: `transformers`, `vLLM` (mencionado explícitamente por el autor), MLX/oMLX para Apple Silicon; `llama.cpp`, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.
- Decodificación especulativa: el BF16 maestro no incluye MTP; requiere emparejar con `google/gemma-4-31B-it-assistant` o `mlx-community/gemma-4-31B-it-assistant-bf16`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-4-31B-it-VectorCut-BF16 | 31,27B denso | 256K | Si | apache-2.0 | Build comunitario con ablación localizada; sin validación externa |
| google/gemma-4-31B-it (base) | 31,27B denso | 256K (según este autor) | Si | Gemma terms (no confirmado en esta ficha) | Modelo oficial de Google; comportamiento de rechazo estándar |
| Variantes MLX del mismo autor (8/6/4 bits) | 31,27B denso | 256K | Si | apache-2.0 | Misma intervención VectorCut, cuantizadas y con MTP para Apple Silicon |

No se dispone en la información proporcionada de comparativas con otros modelos de 30B de la misma categoría (por ejemplo, alternativas densas multimodales de otros fabricantes); se indica "no disponible".

## Limitaciones y advertencias

- Modelo de autor independiente con 1 descarga y 0 likes en el momento de la consulta; sin revisión por pares ni validación externa de los benchmarks declarados.
- La reducción de rechazos implica que el modelo puede generar contenido que el Gemma 4 original bloquearía; el autor no documenta salvaguardas ni filtros adicionales. Riesgo relevante para despliegues en producción orientados al público.
- Los benchmarks presentados corresponden a la variante MLX de 8 bits derivada del maestro, no al checkpoint BF16 en sí; la extrapolación al BF16 es una inferencia del autor.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de tasa de alucinación en la información disponible.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al heredar el modelo base, arrastra los sesgos del Gemma 4 original.
- El contexto de 256K y el rendimiento multilingüe en 35+ idiomas provienen de la model card del autor; no hay verificación independiente.
- La licencia declarada es apache-2.0, pero el modelo base es de Google; conviene verificar que los términos del Gemma 4 original permitan la redistribución y modificación bajo apache-2.0 antes de uso comercial.
- El BF16 maestro no incluye MTP; la decodificación especulativa requiere un modelo asistente separado, lo que añade complejidad de despliegue.
- No se documenta soporte de tool calling ni de agentes; si el caso de uso lo requiere, debe validarse empíricamente.
- El tamaño del repo (62,6 GB) y los requisitos de VRAM (80 GB en BF16) limitan su uso a infraestructura de gama alta o a cuantizaciones agresivas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rarevector/gemma-4-31B-it-VectorCut-BF16
- Perfil del autor en Hugging Face: https://huggingface.co/RareVector
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Modelo asistente para decodificación especulativa: https://huggingface.co/google/gemma-4-31B-it-assistant
- Asistente BF16 para MLX: https://huggingface.co/mlx-community/gemma-4-31B-it-assistant-bf16
- Variante MLX 8-bit: https://huggingface.co/RareVector/gemma-4-31B-it-VectorCut-MLX-8bit
- Variante MLX 6-bit: https://huggingface.co/RareVector/gemma-4-31B-it-VectorCut-MLX-6bit
- Variante MLX 4-bit: https://huggingface.co/RareVector/gemma-4-31B-it-VectorCut-MLX-4bit
- Apoyo al autor (cloud GPU): https://ko-fi.com/rarevector
