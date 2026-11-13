# hermitdave/LFM2.5-8B-A1B-MLX-RCO-4.25bpw

## Resumen

LFM2.5-8B-A1B-MLX-RCO-4.25bpw es una cuantización mixta de precisión del modelo LiquidAI/LFM2.5-8B-A1B, publicada por el usuario hermitdave. No se trata de un modelo nuevo, sino de una compresión con pérdida del checkpoint original de Liquid AI, empaquetada en formato MLX para su ejecución en Apple Silicon. El modelo base es un transformer híbrido de tipo Mixture of Experts (MoE) con 8.470 millones de parámetros totales y 1.500 millones activos por token, 24 capas (18 de convolución corta y 6 de atención completa) y 32 expertos enrutados con top-4.

La relevancia de esta ficha reside en que ofrece un punto de operación concreto (4,25 bits por peso) que reduce el checkpoint de 16,9 GB en BF16 a 5,0 GB, manteniendo una fidelidad medida de KL 0,078 y un 83,4 % de acuerdo top-1 frente a la referencia BF16. El autor documenta explícitamente que puntos de operación inferiores (3,0 bpw) rompen la generación, lo que convierte a esta cuantización en la primera opción recomendada dentro de su propia familia de variantes.

El modelo base es un modelo de razonamiento y orientado a agentes, con plantilla de chat que espera cadena de pensamiento. La cuantización conserva esa naturaleza: no es un fine-tune, sino compresión con pérdida, y el autor advierte de que el modelo empaquetado permanece empaquetado tanto en disco como en memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `lfm2_moe` (híbrida: convolución corta + GQA + MoE) |
| Parametros totales | 8,47 B |
| Parametros activos | 1,5 B (32 expertos enrutados, top-4) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | RCO mixta de precisión: 3-bit (1,4 %), 4-bit (93,0 %), 8-bit (5,5 %), BF16 (3,0 %); media 4,21 bpw en parámetros cuantizados, 4,57 bpw en el checkpoint completo |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX empaquetado (`mlx-packed-affine`), affine con group size 64 por defecto y 32/64/128 por tensor según sensibilidad |

Datos adicionales de arquitectura: 24 capas (18 short-conv + 6 full attention), 2 capas FF densas, hidden size 2048. Tamaño del artefacto: 5,0 GB (frente a 16,9 GB del BF16 base). Tamaño del repo en Hugging Face: 5,4 GB.

## Arquitectura y entrenamiento

El modelo base LFM2.5-8B-A1B emplea una arquitectura híbrida `lfm2_moe` que combina capas de convolución corta con capas de atención completa con GQA (grouped-query attention) y capas de mezcla de expertos. De las 24 capas, 18 son de convolución corta y 6 de atención completa; hay 32 expertos enrutados con activación top-4 y dos capas FF densas. El hidden size es 2048. Esta combinación busca reducir el coste computacional de la atención en secuencias largas manteniendo capacidad de modelado mediante los expertos.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí está documentado es el proceso de cuantización de esta variante: RCO (rate-constrained optimization) con asignación mixta de precisión sobre una tabla medida de error de reconstrucción por tensor, resuelta como un problema exacto de mochila (knapsack) sobre el presupuesto de bits, con selección de escalas ponderada por imatrix por grupo (`--per-group-clip`) y dimensionado de grupo por tensor según sensibilidad (`--per-tensor-group-size`). La calibración usó WikiText (128 muestras × 2048 tokens con BOS) y una imatrix capturada localmente (energía de activación por columna, agregada por experto enrutado). Las escalas y sesgos se almacenan en float16 con fallback a fp32 si fuera necesario (no fue el caso).

## Capacidades

- Generación de texto conversacional y de razonamiento: el modelo base es un modelo de razonamiento y la plantilla de chat espera cadena de pensamiento; debe usarse `tokenizer.apply_chat_template()` para turnos de chat y razonamiento.
- Generación de código y matemáticas: no hay datos específicos de benchmarks en la información disponible, pero la naturaleza del modelo base (orientado a agentes) sugiere soporte, sin confirmación documentada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: el autor describe el modelo base como "agentic/reasoning model", lo que implica orientación a agentes, aunque sin detalles técnicos adicionales.
- Capacidades multilingües: no disponible.
- Capacidades especiales: modo de razonamiento (chain of thought) esperado por la plantilla de chat; no se documentan visión ni audio.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint de 5,0 GB cabe en memoria unificada de equipos Mac con 16 GB o más; se carga con `mlx_lm.load()` sin `trust_remote_code` ni código personalizado, lo que simplifica el despliegue en portátiles y estaciones Mac.
- Prototipado de agentes de razonamiento en local: al ser un modelo de razonamiento con plantilla de chat que espera cadena de pensamiento, permite probar flujos multi-paso y de agente sin depender de APIs externas, con la ventaja de la licencia MIT.
- Evaluación comparativa de cuantizaciones: el autor publica puntos de operación medidos (3,0 / 3,5 / 4,0 / 4,25 bpw) con KL y top-1, lo que lo hace útil como caso de estudio para medir el impacto de la compresión mixta en modelos MoE.
- Generación de texto asistida en entornos con restricciones de memoria: con 5,0 GB en disco y en memoria, encaja en pipelines donde un BF16 de 16,9 GB no cabría, a costa de un decode aproximadamente un 30 % más lento que la referencia.
- Scoring de prompts y experimentación con tokens especiales: la model card documenta el comportamiento del `bos_token_id` y la necesidad de anteponer `<|startoftext|>` en scoring de prompts crudos, lo que permite construir pipelines de evaluación controlados.
- Docencia e investigación sobre cuantización: la distribución de bitwidth por capa está en `config.json` → `quantization`, lo que facilita analizar la asignación por tensor y reproducir el método RCO.

## Benchmarks y rendimiento

Fidelidad medida por el autor (calibración WikiText, evaluación con 4 muestras × 256 tokens, greedy, frente a referencia BF16):

| Metrica | Valor |
|---|---:|
| Perplejidad de referencia | 47,23 |
| Perplejidad cuantizada | 46,08 |
| KL frente a referencia | 0,078 |
| Acuerdo top-1 | 83,4 % |

Puntos de operación medidos en el mismo pipeline:

| Objetivo | bpw efectivo | Tamano | KL | Top-1 |
|---|---:|---:|---:|---:|
| 3,0 | 3,41 | ~3,8 GB | 0,329 | 69,9 % |
| 3,5 | 3,87 | 4,3 GB | 0,197 | 74,5 % |
| 4,0 | 4,34 | 4,8 GB | 0,121 | 80,7 % |
| **4,25** | **4,57** | **5,0 GB** | **0,078** | **83,4 %** |

Rendimiento medido en Apple Silicon M3 Max, 64 GB de memoria unificada, un solo flujo, decodificación greedy, prompt fijo de 512 tokens, 128 tokens de decodificación, 3 ejecuciones tras calentamiento:

| Modelo | Prefill | Decode |
|---|---:|---:|
| Referencia BF16 | 1424,5 tok/s | 75,09 tok/s |
| Esta cuantización (4,25 bpw) | 1372,3 tok/s | 52,75 tok/s |

No se han publicado en la información disponible resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) para esta cuantización ni para el modelo base.

## Requisitos de hardware

- VRAM/memoria estimada: 5,0 GB para el checkpoint cuantizado; 16,9 GB para el BF16 de referencia.
- GPU recomendadas: Apple Silicon con memoria unificada; el autor midió en un M3 Max de 64 GB. No se documentan requisitos para GPU NVIDIA u otras.
- ¿Cabe en consumer GPU? El formato es MLX, orientado a Apple Silicon; para GPU NVIDIA habría que recurrir a otra variante del modelo base. En Mac, 5,0 GB cabe en equipos con 16 GB de memoria unificada o más.
- Opciones de despliegue: `mlx-lm` (carga con `mlx_lm.load()` y generación con `mlx_lm.generate()`), sin `trust_remote_code` ni código personalizado. No se documentan opciones para vLLM, llama.cpp, Ollama o TGI con este formato.
- Latencia y throughput: prefill de 1372,3 tok/s y decode de 52,75 tok/s en M3 Max de 64 GB (medido por el autor); el decode es aproximadamente un 30 % más lento que el BF16 debido al coste de desquantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Esta cuantización (4,25 bpw) | 8,47 B totales / 1,5 B activos | no disponible | MLX empaquetado | MIT | KL 0,078, top-1 83,4 %, decode 52,75 tok/s en M3 Max |
| LFM2.5-8B-A1B BF16 (base) | 8,47 B totales / 1,5 B activos | no disponible | safetensors BF16 | MIT | Referencia; decode 75,09 tok/s en M3 Max; 16,9 GB |
| Punto de operación 4,0 bpw de la misma familia | 8,47 B totales / 1,5 B activos | no disponible | MLX empaquetado | MIT | KL 0,121, top-1 80,7 %, 4,8 GB |
| Punto de operación 3,5 bpw de la misma familia | 8,47 B totales / 1,5 B activos | no disponible | MLX empaquetado | MIT | KL 0,197, top-1 74,5 %, 4,3 GB |

No se dispone de datos de otros modelos comparables de la misma categoría (MoE de ~8 B con ~1,5 B activos) en la información proporcionada.

## Limitaciones y advertencias

- No es un fine-tune: es compresión con pérdida del modelo base. La fidelidad KL 0,078 no es task-lossless.
- El modelo empaquetado permanece empaquetado en memoria y en disco; no se descomprime a BF16 en tiempo de ejecución.
- La perplejidad no es un discriminador útil para este modelo: todos los checkpoints cuantizados leen una perplejidad ligeramente inferior a la referencia mientras KL y top-1 se degradan claramente. Debe evaluarse con KL, top-1 y calidad de generación.
- El punto de 3,0 bpw está visiblemente roto: la generación emite `<|endoftext|>`/`<|startoftext|>` y entra en bucles.
- El tokenizador define `bos_token_id` pero no lo añade en `encode()`. Para scoring de prompts crudos hay que anteponer `<|startoftext|>` manualmente; sin él, el modelo divaga. `mlx_lm.generate` no lo añade.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; aplica el riesgo general de los modelos de razonamiento generativos.
- Idiomas soportados: no disponible; no se puede confirmar cobertura multilingüe.
- Licencia MIT: permite uso comercial, pero al ser una cuantización con pérdida conviene validar la calidad en la tarea concreta antes de producción.
- Formato MLX: el despliegue está limitado a entornos Apple Silicon con `mlx-lm`; no hay artefactos GGUF ni safetensors en este repositorio.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/hermitdave/LFM2.5-8B-A1B-MLX-RCO-4.25bpw
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Herramienta de cuantización rco-mlx: https://github.com/hermitdave/rco-mlx
