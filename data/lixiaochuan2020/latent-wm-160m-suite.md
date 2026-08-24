# lixiaochuan2020/latent-wm-160m-suite

## Resumen

El repositorio `latent-wm-160m-suite` contiene cuatro modelos de lenguaje decodificadores de aproximadamente 160 millones de parámetros, entrenados desde cero por lixiaochuan2020 sobre el dataset DCLM-baseline. El objetivo no es ofrecer un único modelo, sino un conjunto de arquitecturas comparables bajo un mismo presupuesto de parámetros no-embedding, para estudiar el impacto de la arquitectura (densa, con pesos atados aplicados dos veces, o Block Transformer) en pérdida de validación y rendimiento zero-shot.

Los tres primeros modelos son compatibles con `AutoModelForCausalLM` de HuggingFace (exportados como `LlamaForCausalLM`), mientras que el cuarto, un Block Transformer, requiere el código de referencia del repositorio block-transformer para ensamblarse. Todos comparten tokenizador, datos, optimizador, tamaño de lote y forma de programación de la tasa de aprendizaje; solo cambia la arquitectura y el presupuesto de tokens. El modelo se publica bajo licencia Apache 2.0, en inglés, y está pensado para investigación y evaluación, no para continuar entrenamiento (no se incluyen estados de optimizador ni de RNG).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (dense 12L x 768, looped weight-tied 12L aplicado dos veces, Block Transformer con longitud de bloque 4) |
| Parametros totales | ~162M (dense y looped) / ~212M (Block Transformer) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (no se publican checkpoints cuantizados) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors en cada subcarpeta) |

## Arquitectura y entrenamiento

Los tres primeros modelos son decodores Transformer densos con 12 capas y dimensión de modelo 768. Los modelos `loop2_tok50b` y `loop2_flops_matched` aplican la misma pila de 12 capas dos veces con pesos atados (weight-tied), exportados desenrollados como 24 capas independientes para poder cargarse con código estándar de HuggingFace. El cuarto modelo es un Block Transformer: un embedder, un decodificador de bloques y un decodificador de tokens, con tres tablas de embeddings, lo que eleva el total de parámetros a ~212M aunque mantiene ~85M no-embeddings.

El entrenamiento usa el optimizador Muon (lr 2e-3) sobre los pesos 2D dentro de los bloques Transformer, y AdamW (lr 5e-4, betas 0.9/0.95, eps 1e-8) para embeddings, la cabeza de salida y los gains de normalización. El peso decay es 0.1, el grad clip 1.0, y se emplea bf16 autocast con pesos maestros en fp32. La programación de la tasa de aprendizaje es 1% de calentamiento lineal y luego coseno hasta el 10% del pico. El tokenizador es `EleutherAI/gpt-neox-20b` con vocabulario ampliado a 50,304. La secuencia se procesa con longitud 2048 y lote global de 524,288 tokens (256 x 2048). La pérdida de validación más baja entre los modelos comparables la logra `loop2_tok50b` con 2.9877, frente a 3.0286 del denso de referencia.

## Capacidades

- Generación de texto autoregresivo en inglés, con ventana de contexto de 2048 tokens.
- Razonamiento de sentido común y comprensión lectora básica, medidos con tareas zero-shot de lm-evaluation-harness.
- Los modelos `dclm160m`, `loop2_tok50b` y `loop2_flops_matched` se cargan como `LlamaForCausalLM`, por lo que son compatibles con pipelines de HugFace Transformers para generación y evaluación estándar.
- El modelo `block_b4_85m` requiere el harness específico del repositorio block-transformer para evaluarse; no es directamente cargable con `AutoModel`.
- No se indica soporte de tool calling, agentes, visión ni audio. Es un modelo puramente textual.

## Casos de uso

- **Investigación en arquitecturas eficientes**: el paquete permite comparar directamente el impacto de aplicar pesos atados (looped) frente a una pila densa del mismo tamaño, controlando por parámetros no-embeddings y por presupuesto de FLOPs. Ideal para estudiar compensaciones entre calidad y coste computacional.
- **Evaluación de algoritmos de entrenamiento**: al compartir receta exacta (optimizador, lote, programación, datos), sirve como banco de pruebas para nuevos optimizadores o esquemas de aprendizaje sin necesidad de reentrenar desde cero.
- **Generación de texto de baja latencia en inglés**: con ~162M de parámetros, los modelos densos y looped pueden ejecutarse en GPU de consumo o incluso en CPU con cuantización, para prototipos de autocompletado o generación de texto corto.
- **Análisis de transferencia y generalización**: los resultados zero-shot en ARC, HellaSwag, PIQA, Lambada y WinoGrande permiten evaluar la capacidad de generalización de arquitecturas alternativas en tareas de razonamiento de sentido común.
- **Estudio de la relación entre tokens y pérdida**: los tres primeros modelos se entrenaron con 50B, 50B y 28.9B tokens respectivamente, lo que permite estudiar cómo la arquitectura afecta a la eficiencia de muestreo y al comportamiento de la pérdida de validación.
- **Reproducibilidad de experimentos**: el orden de secuencia es función pura de `(seed, step, rank)`, por lo que los entrenamientos son exactamente reproducibles, útil para verificar implementaciones de optimizadores o infraestructuras.

## Benchmarks y rendimiento

Resultados zero-shot (accuracy, lm-evaluation-harness 0.4.1):

| Modelo | arc_easy | hellaswag | piqa | lambada_openai | winogrande |
|---|---:|---:|---:|---:|---:|
| `dclm160m` (dense, 50B tokens) | 0.5143 | 0.3176 | **0.6665** | 0.4087 | 0.5067 |
| `loop2_tok50b` (looped, 50B tokens) | 0.5147 | **0.3285** | 0.6643 | **0.4118** | 0.5107 |
| `loop2_flops_matched` (looped, 28.9B tokens) | **0.5219** | 0.3214 | 0.6632 | 0.4056 | **0.5343** |
| `block_b4_85m` (Block, 68.4B tokens) | 0.4364 | 0.2842 | 0.6099 | 0.1944 | no medido |

Pérdida de validación (protocolos distintos, ver limitaciones):

| Modelo | Val loss | Tokens |
|---|---:|---:|
| `dclm160m` | 3.0286 | 50.0B |
| `loop2_tok50b` | 2.9877 | 50.0B |
| `loop2_flops_matched` | 3.0213 | 28.9B |
| `block_b4_85m` | 3.4021 | 68.4B |

## Requisitos de hardware

- **VRAM estimada para inferencia**: con ~162M parámetros en fp32 (~650 MB) o en bf16 (~325 MB), la inferencia es viable en cualquier GPU con al menos 1-2 GB de VRAM; cuantizando a int8 o int4, el modelo cabe en CPU con memoria RAM estándar.
- **GPU recomendadas**: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU con llama.cpp si se convierte a GGUF. No se requiere GPU de datacenter.
- **Compatibilidad con consumer GPU**: sí, los tres modelos cargables con HuggingFace pueden ejecutarse en tarjetas de consumo sin problema.
- **Opciones de despliegue**: `transformers` (pipeline de generación), vLLM (si se convierte a formato compatible), llama.cpp/Ollama (tras conversión a GGUF), o el harness del repositorio block-transformer para el modelo Block.
- **Latencia y throughput**: no se publican mediciones; con ~160M parámetros y secuencia 2048, la latencia de generación es del orden de milisegundos por token en GPU consumer moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `latent-wm-160m-suite` (dense) | ~162M | 2048 | Apache 2.0 | Entrenado en DCLM-baseline, 50B tokens |
| GPT-2 (124M) | 124M | 1024 | MIT | Modelo denso, 40GB de datos WebText |
| Pythia-160M | 160M | 2048 | Apache 2.0 | Serie de modelos para investigación de scaling laws |
| OPT-125M | 125M | 2048 | MIT | Modelo denso de Meta, entrenado en The Pile |

No hay comparativa directa publicada en la información proporcionada; la suite se posiciona como un banco de pruebas para arquitecturas, no como un modelo de propósito general competitivo en tareas de gran escala.

## Limitaciones y advertencias

- **El modelo Block Transformer no se mide con el mismo protocolo**: sus resultados zero-shot provienen del harness específico de block-transformer, no de la ruta de exportación de HuggingFace; las definiciones de tarea coinciden, pero los dos harness no se han verificado que coincidan en pesos idénticos. `winogrande` no se midió por ausencia en la lista de tareas del harness, no por fallo.
- **Las pérdidas de validación no son comparables entre el bloque y los demás**: los tres modelos densos/looped usan validación en-training sobre ~50M tokens held-out; el Block Transformer se midió aparte sobre 24,480 secuencias. La cifra anterior de 3.3913 era optimista y se recomienda usar 3.4021.
- **Confundido en la comparación de looped**: `loop2_flops_matched` entrena con menos pasos y su programación coseno está comprimida, no truncada; por tanto, es FLOP-matched pero no schedule-identical al baseline.
- **No se pueden reanudar entrenamientos**: no se incluyen estados de optimizador ni de RNG; son pesos para evaluación e inferencia, no para continuar pretraining.
- **Los modelos exportados como looped pierden el atado de pesos**: el checkpoint desenrollado tiene ~1.5x el tamaño del modelo atado y no comparte pesos; correcto para inferencia, incorrecto si se quiere continuar entrenamiento looped.
- **Idioma y dominio**: solo inglés, sin soporte multilingüe; no hay garantía de buen comportamiento en otros idiomas.
- **Riesgo de alucinación y sesgos**: como cualquier modelo pequeño entrenado en datos web, puede producir contenido inconsistente o sesgado; no hay evaluación de sesgos publicada.

## Enlaces

- Modelo en HuggingFace: [lixiaochuan2020/latent-wm-160m-suite](https://huggingface.co/lixiaochuan2020/latent-wm-160m-suite)
- Perfil del autor en GitHub: [lixiaochuan2020](https://github.com/lixiaochuan2020)
- Repositorio de Block Transformer: [itsnamgyu/block-transformer](https://github.com/itsnamgyu/block-transformer)
- Dataset DCLM-baseline: [mlfoundations/dclm-baseline-1.0](https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0)
- Colección de papers del autor: [Papers - lixiaochuan2020 Collection](https://huggingface.co/collections/lixiaochuan2020/papers)
- Paper de Latent-WAM (relacionado, aunque no es el mismo modelo): [arXiv:2603.24581](https://arxiv.org/html/2603.24581v1)
