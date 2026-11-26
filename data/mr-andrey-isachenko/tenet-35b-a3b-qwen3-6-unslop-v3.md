# mr-andrey-isachenko/Tenet-35B-A3B-Qwen3.6-Unslop-v3

## Resumen

Tenet-35B-A3B-Qwen3.6-Unslop-v3 es un fine-tune del modelo Qwen/Qwen3.6-35B-A3B desarrollado por el autor independiente mr-andrey-isachenko bajo el paraguas del proyecto Tenet. El modelo aplica una técnica propietaria denominada Lancet, descrita por el autor como "cirugía de subespacio" que elimina la dirección de rechazo tanto en las proyecciones de entrada (residual stream) como de salida (unembedding), preservando la norma de las activaciones. El resultado es un modelo "de-refused" que, según el autor, reduce los rechazos falsos positivos ante peticiones benignas sin degradar el razonamiento ni la capacidad de código del modelo base.

Sobre esa cirugía se aplica un pase de GRPO ("gated unslop GRPO") cuyo sistema de recompensas penaliza patrones de "slop" estilístico (prosa recargada, preámbulos moralizantes, vocabulario tipo "tapestry") únicamente en las regiones donde la cirugía debilitó los circuitos de rechazo. El checkpoint se distribuye en FP8 (E4M3) listo para proveedores, sin código personalizado ni necesidad de `trust_remote_code`.

El modelo base Qwen3.6-35B-A3B es un MoE de aproximadamente 36.000 millones de parámetros totales con unos 3.000 millones activos por token (según la nomenclatura A3B), lo que lo sitúa en la franja de modelos grandes con coste de inferencia contenido. La relevancia de esta ficha radica en que documenta un caso de fine-tune orientado a eliminar rechazos y mejorar el estilo, con licencia Apache 2.0, y con artefactos de telemetría (Strata) para pipelines de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Qwen3.5 MoE, tag `qwen3_5_moe`) |
| Parametros totales | 35.951.822.704 (~36B) |
| Parametros activos | ~3B (según nomenclatura A3B del nombre; no confirmado en la model card) |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de vLLM; no se declara un máximo oficial distinto) |
| Tipos de cuantizacion | FP8 (E4M3) como formato de distribución principal; GGUF mencionado en tags; MLX mencionado en la model card |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8 E4M3) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.6-35B-A3B, un transformer con mezcla de expertos (MoE) de ~36B parámetros totales y ~3B activos por token. Sobre esa base, el autor aplica el motor Lancet, que realiza una "cirugía de subespacio bi-proyectada que preserva la norma": identifica la dirección de rechazo en las proyecciones de entrada y salida, elimina la componente en ambas direcciones y restaura exactamente la norma residual para mantener las magnitudes de activación en la variedad. Según la model card, esto evita la degradación típica de la abliteración ingenua, que rompe la estructura de salida (por ejemplo, tool calls mal formados).

Tras la cirugía se ejecuta un pase de GRPO ("gated unslop GRPO") con recompensas que penalizan patrones de slop estilístico solo en las zonas debilitadas por la cirugía, con el objetivo de reforzar razonamiento y código en lugar de dañarlos. El autor menciona además telemetría Strata (H21 expert-cache/coactivation graph y H22 speculative decoding) publicada como `strata.toml` junto al checkpoint, y una exportación final en FP8 (E4M3). No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO adicional más allá del GRPO citado.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento estructurado y respuesta analítica (el autor afirma preservar el "analytical, coding and structured-reasoning anchor subspace" del modelo base).
- Generación de código y soporte de tool calling / function calling (ejemplo de tool call SQL válido en la model card).
- Uso agéntico y flujos multi-paso (tags `agentic`, `tool-use`).
- Reducción de rechazos falsos positivos ante peticiones benignas (de-refusal quirúrgico).
- Mitigación de "slop" estilístico: preámbulos moralizantes, prosa recargada y vocabulario tipo "tapestry".
- Capacidades multimodales heredadas del base: el pipeline declarado es `image-text-to-text`, por lo que el modelo acepta entradas de imagen y texto.
- Capacidades multilingües: no disponible (no se declaran idiomas en la model card).

## Casos de uso

- Triaje de logs de seguridad y generación de consultas SQL: el modelo puede recibir una línea de log (por ejemplo, de nginx) y devolver un tool call DuckDB válido que agregue intentos fallidos por IP de origen, tal como se demuestra en la model card. Es adecuado porque mantiene la estructura de esquema del tool call tras la cirugía.
- Asistentes de AppSec/DevOps: análisis de logs de autenticación y generación de consultas de auditoría sin rechazos falsos ante peticiones legítimas de análisis defensivo.
- Pipelines agénticos con tool calling: integración en flujos multi-paso donde el modelo debe emitir llamadas a funciones con esquema JSON estricto (el ejemplo de la model card muestra `{"tool": ..., "arguments": {...}}` bien formado).
- Generación de código en producción: el autor afirma preservar el subespacio de código del base; puede integrarse en asistentes de IDE o CI/CD para tareas de refactorización y consultas a bases de datos.
- Atención al cliente automatizada: conversaciones multi-turno con contexto de 32.768 tokens, suficiente para hilos largos de soporte con historial de tickets.
- Despliegue en proveedores de inferencia: al distribuirse en FP8 (E4M3) sin código personalizado, encaja directamente en vLLM y en proveedores tipo OpenRouter (tags `vllm`, `openrouter`, `endpoints_compatible`).
- Evaluación de técnicas de de-refusal: útil para investigadores que comparan abliteración ingenua frente a cirugía de subespacio con preservación de norma, usando la telemetría Strata y los artefactos H9/H10/H11.

## Benchmarks y rendimiento

La model card incluye tablas de benchmarks (H9 refusal & slop retention, H10 downstream capability retention, H11 FP8 quantization robustness, y una tabla comparativa Base / Naive Abliteration / Tenet BF16 / Tenet FP8), pero **todos los valores están marcados como `n/a` o `—`**. No hay cifras numéricas publicadas.

No se han publicado resultados de benchmarks en la informacion disponible.

Telemetría Strata declarada:

| Telemetria | Valor |
|---|---|
| `expert_cache_hit_rate` (H21) | n/a |
| `coactivation_graph_drift` (H21) | n/a |
| `speculative_acceptance_rate` (H22) | n/a |
| `untouched_expert_ratio` | 9,9 % |
| `peak_host_ram_mb` | n/a |
| Max row crest-factor | n/a |

## Requisitos de hardware

- VRAM estimada para inferencia: con ~36B parámetros totales, en FP8 (E4M3) los pesos ocupan aproximadamente 36 GB; en BF16 serían ~72 GB. Hay que sumar KV cache y overhead del runtime.
- GPU recomendadas: para FP8, una H100 80GB o A100 80GB cubren el modelo con holgura; una RTX 6000 Ada (48 GB) o L40S (48 GB) podrían alojar los pesos FP8 pero con poco margen para KV cache en contextos largos.
- En GPU de consumo: no cabe en una RTX 4090 (24 GB) en FP8 sin descarga a CPU o cuantización adicional; el tag `gguf` sugiere que existen o existirán versiones cuantizadas (Q4/Q5) que sí podrían caber en 24 GB, aunque no se confirma en la información disponible.
- Opciones de despliegue: vLLM (`--quantization fp8`), Transformers, llama.cpp (CKA-Quant mencionado en el quickstart), MLX y proveedores tipo OpenRouter.
- Latencia y throughput: no disponible. Al ser MoE con ~3B activos, el coste por token debería ser inferior al de un denso de 36B, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Tenet-35B-A3B-Qwen3.6-Unslop-v3 | ~36B totales / ~3B activos (MoE) | 32.768 (ejemplo vLLM) | Apache 2.0 | Fine-tune de-refused con Lancet + GRPO; FP8 E4M3 |
| Qwen/Qwen3.6-35B-A3B (base) | ~36B totales / ~3B activos (MoE) | no disponible en esta ficha | Apache 2.0 (según base) | Modelo original; rechazos y slop sin mitigar |
| Abliteración ingenua del mismo base | ~36B totales / ~3B activos (MoE) | no disponible | Apache 2.0 | Referencia citada por el autor; rompe estructura de tool calls según la model card |
| Alternativas de-refused de la familia Tenet v1 | no disponible | no disponible | Apache 2.0 | Colección `mr-andrey-isachenko` en Hugging Face |

No se dispone de datos de rendimiento comparativo (MMLU, HumanEval, GSM8K) para ninguno de los modelos de la tabla en la información proporcionada.

## Limitaciones y advertencias

- No hay benchmarks numéricos publicados: las tablas H9/H10/H11 y la comparativa Base/Naive/Tenet están vacías (`n/a`). Cualquier afirmación de rendimiento del autor no está cuantificada.
- El modelo está explícitamente "de-refused" (tags `abliterated`, `uncensored`): puede generar contenido que el base rechazaría. El autor declara fuera de alcance operaciones ofensivas, malware y contenido ilícito, pero la mitigación es por diseño, no por filtro.
- Riesgo de alucinación: no evaluado en la información disponible; el proceso de cirugía de subespacio puede afectar a la calibración.
- Idiomas soportados: no declarados; el comportamiento multilingüe no está verificado.
- Contexto: el único valor explícito es 32.768 tokens en el comando de vLLM; no se confirma si el máximo del base es mayor.
- Licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen3.6-35B-A3B y conviene verificar las condiciones del base y de los datasets de entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación mínimo; el código y el informe técnico están en un repositorio GitHub externo no auditado de forma independiente.
- El tag `qwen3_5_moe` y el nombre `Qwen3.6` no coinciden exactamente; conviene verificar la arquitectura real antes de desplegar.
- El checkpoint se distribuye en FP8 (E4M3); la robustez de la cirugía tras cuantización (H11) no está cuantificada, pese a ser una de las métricas que el autor destaca.

## Enlaces

- Hugging Face: https://huggingface.co/mr-andrey-isachenko/Tenet-35B-A3B-Qwen3.6-Unslop-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio y informe técnico: https://github.com/mrAndreyIsachenko/tenet-lab
- Space de auditoría FP8 y abliteración: https://huggingface.co/spaces/mr-andrey-isachenko/fp8-abliteration-inspector
- Colección Tenet v1: https://huggingface.co/mr-andrey-isachenko
- Telemetría Strata: `strata.toml` (incluido en el repositorio del modelo)
