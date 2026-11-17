# AJ-Gonzalez/coder-lfm3-1.7b-qwen4-max

## Resumen

`coder-lfm3-1.7b-qwen4-max` es un ajuste fino (LoRA) del modelo base `LiquidAI/LFM3-1.7B`, publicado por el usuario AJ-Gonzalez. El objetivo del ajuste es desplazar el comportamiento del modelo base hacia el estilo de trazas del modelo profesor `qwen/qwen4-max` (Qwen4 Max, servido via OpenRouter) en tareas de codigo, informatica y estadistica. El resultado es un modelo de 1.728 millones de parametros (~1,7B) especializado en generacion de codigo con razonamiento intermedio, distribuido en formato MLX 4-bit, bf16 y GGUF Q4_K_M.

El modelo resuelve un problema concreto: el LFM3-1.7B original, pese a su eficiencia, no reproduce el patron de "razonamiento + implementacion delimitada" que producen modelos profesor de mayor tamano. Mediante QLoRA sobre 70 prompts del perfil *coder* del corpus `AJ-Gonzalez/qwen4-max-reasoning-250x`, el autor consigue una mejora medible en HumanEval+ (de 0,695 a 0,732 en pass@1 base, y de 0,652 a 0,683 en pass@1 plus) sin aumentar el numero de parametros.

Es relevante porque demuestra que un ajuste fino ligero (16,47M parametros entrenables, 0,9436% del total, 50,2 minutos en una sola T4) sobre un modelo pequeno puede recuperar parte de la calidad de codigo de modelos profesor mucho mayores, manteniendo un coste de inferencia muy bajo (~1,15 GB de pico en MLX 4-bit y ~55 tok/s en un M1 de 8 GB). La arquitectura subyacente es la de LFM3 (familia Liquid Foundation Models), si bien la model card no detalla su composicion interna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid Foundation Models); detalles internos no disponibles en la model card |
| Parametros totales | 1.728.801.536 (~1,7B) |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible (el entrenamiento uso chunks de 2.048 tokens con 256 de replay) |
| Tipos de cuantizacion | MLX 4-bit (4,503 bpw), bf16, GGUF Q4_K_M (5,05 bpw), NF4 QLoRA (solo entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (uso comercial bajo el umbral de 10M USD de ingresos anuales) |
| Formato de pesos | safetensors (MLX 4-bit y bf16), GGUF, PEFT LoRA adapter |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del LFM3-1.7B de LiquidAI mediante LoRA de rango 16 y alpha 32, aplicado a todas las capas lineales de atencion, MLP y convolucion corta (*short-conv linears*), lo que suma 16,47M parametros entrenables (0,9436% del total). El entrenamiento uso QLoRA en 4-bit NF4 con computo en fp16 (la T4 no soporta bf16), optimizador paged AdamW 8-bit con lr 1e-4 y 10 pasos de warmup, batch efectivo de 16 y secuencia de 2.048 tokens. Se completaron 3 epocas (66 pasos de optimizador) en 50,2 minutos sobre una unica T4, con perdida de entrenamiento 3,9531 y validacion descendente de 4,056 a 3,827.

Los datos provienen del perfil *coder* del corpus `AJ-Gonzalez/qwen4-max-reasoning-250x`: 70 prompts de codigo, informatica y estadistica respondidos por `qwen/qwen4-max` (canonico `qwen/qwen4-max-20261115`) via OpenRouter con `max_tokens=32768` (3 filas reintentadas a 65536). Tras renderizar la plantilla de chat de LFM3 y trocear a 2.048/256, se generaron 340 chunks de entrenamiento (642.753 tokens) y 45 de validacion (86.227 tokens). Las trazas del profesor mezclan razonamiento y implementaciones delimitadas en bloques de codigo, y el ajuste mueve LFM3 hacia esa forma. No se reporta RLHF ni DPO; es SFT supervisado puro. Tras el entrenamiento, el adaptador se fusiono en el base bf16 y se convirtio a MLX 4-bit y GGUF Q4_K_M.

## Capacidades

- Generacion de codigo en Python y otros lenguajes, con trazas de razonamiento previas a la implementacion (estilo del profesor Qwen4 Max).
- Razonamiento multi-paso orientado a problemas de informatica y estadistica.
- Generacion de texto general, heredada del LFM3-1.7B base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explicita; el modelo genera trazas de razonamiento, pero no se documenta un modo agente.
- Capacidades multilingues: no disponibles; la model card no especifica idiomas.
- Modo thinking: la plantilla de chat de LFM3 se aplica desde el tokenizer y el benchmark usa `enable_thinking=False`, lo que sugiere que el base soporta un modo de pensamiento, pero no se detalla su comportamiento en este ajuste.
- Vision y audio: no disponibles.

## Casos de uso

- **Generacion de codigo asistida en local**: el modelo puede ejecutarse en MLX 4-bit con ~1,15 GB de pico y ~55 tok/s en un M1 de 8 GB, lo que lo hace adecuado para asistentes de codigo en portatiles sin GPU dedicada. Se usaria via `mlx_lm.generate` con prompts de funciones o scripts.
- **Autocompletado y generacion de funciones en editores**: dado su tamano (1,7B) y su formato GGUF Q4_K_M de 1,1 GB, puede integrarse en flujos tipo llama.cpp/Ollama para sugerencias de codigo en tiempo casi real, con latencia baja en CPU.
- **Prototipado rapido de scripts de analisis estadistico**: el ajuste incluye prompts de estadistica del corpus coder, por lo que es util para generar scripts de analisis de datos (pandas, numpy) con razonamiento explicito sobre el enfoque.
- **Ensenanza y explicacion de codigo**: las trazas del profesor mezclan razonamiento e implementacion, lo que permite usar el modelo para generar explicaciones paso a paso de algoritmos y funciones, no solo el codigo final.
- **Pipelines de CI/CD para generacion de tests**: puede generar funciones y casos de prueba en Python; su integracion requeriria validacion externa, ya que el autor advierte que las salidas no estan verificadas.
- **Evaluacion comparativa de tecnicas de destilacion**: al ser un ajuste LoRA reproducible (adaptador de 63 MB, dataset publico), sirve como referencia para experimentos de destilacion de modelos profesor grandes hacia modelos pequenos en el dominio del codigo.
- **Despliegue en entornos con recursos limitados**: el checkpoint bf16 (3,3 GB) y el MLX 4-bit (946 MB) permiten elegir entre calidad y huella de memoria segun el hardware disponible.

## Benchmarks y rendimiento

Resultados reportados por el autor en HumanEval+ (164 tareas, evalplus 0.3.1, harness T4/fp16, greedy, 768 tokens nuevos, `enable_thinking=False`):

| Modelo | HumanEval+ base pass@1 | HumanEval+ plus pass@1 |
|---|---:|---:|
| `LiquidAI/LFM3-1.7B` stock | 0,695 | 0,652 |
| `coder-lfm3-1.7b-qwen4-max` | **0,732** | **0,683** |

Deltas: +3,7 puntos en base y +3,1 puntos en plus.

NLL de prompt en SWE-bench (20 preguntas, chunks de 512 tokens, mismo tokenizer y harness T4/fp16):

| Modelo | NLL (nats/token) | Perplejidad |
|---|---:|---:|
| stock, T4 fp16 | 2,5127 | 12,34 |
| este modelo, T4 fp16 | **2,2310** | **9,31** |

Sobre los artefactos finales MLX 4-bit, el mismo NLL de 20 preguntas pasa de 2,6936 (stock) a **2,3156** (este modelo), lo que indica que la conversion a 4-bit conserva el delta del ajuste fino (el adaptador solo midio 2,3138 en la T4).

## Requisitos de hardware

- **VRAM estimada para inferencia**: ~1,15 GB de pico en MLX 4-bit (medido en M1 de 8 GB); el checkpoint bf16 (3,3 GB) requiere aproximadamente el doble de memoria que el 4-bit.
- **GPU recomendadas**: una unica T4 fue suficiente para entrenar (50,2 min) y evaluar; para inferencia, cualquier GPU con al menos 4-6 GB de VRAM libre es viable en 4-bit. No se reportan pruebas en A100, H100 o RTX 4090.
- **Consumer GPU**: si, cabe en GPUs consumer; el autor confirma ejecucion en un Apple M1 de 8 GB con MLX 4-bit. El GGUF Q4_K_M (1,1 GB) permite ejecucion en CPU.
- **Opciones de despliegue**: MLX (`mlx_lm.generate`), Transformers (subfolder `bf16`, `trust_remote_code=True`), llama.cpp (`llama-cli` con `Q4_K_M.gguf`). No se documenta soporte para vLLM, TGI u Ollama.
- **Latencia y throughput**: ~55 tok/s en M1 de 8 GB con MLX 4-bit (prueba de humo de 64 tokens, no benchmark). No se reportan cifras para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval+ base pass@1 | Licencia | Formatos |
|---|---|---|---|---|---|
| `coder-lfm3-1.7b-qwen4-max` | 1,7B | no disponible | 0,732 | LFM Open License v1.0 | MLX 4-bit, bf16, GGUF, LoRA |
| `LiquidAI/LFM3-1.7B` (stock) | 1,7B | no disponible | 0,695 | LFM Open License v1.0 | safetensors, GGUF |
| Otros modelos de ~1,7B para codigo | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa disponible es con el modelo base, del que este ajuste mejora 3,7 puntos en HumanEval+ base. No se proporcionan datos de benchmarks frente a alternativas de la misma categoria (por ejemplo, otros modelos pequenos de codigo), por lo que esa comparacion queda como no disponible.

## Limitaciones y advertencias

- **Salidas no verificadas**: el autor advierte explicitamente que las salidas del modelo no estan verificadas y que el codigo generado puede ser incorrecto o inseguro.
- **Riesgo de alucinacion**: inherente a los modelos generativos; no se documenta mitigacion especifica.
- **Sesgos conocidos**: no disponibles en la informacion proporcionada.
- **Limitaciones de contexto e idioma**: la longitud de contexto no se documenta; los idiomas soportados tampoco. El entrenamiento uso chunks de 2.048 tokens, lo que puede limitar el rendimiento en prompts muy largos.
- **Restricciones de licencia**: la LFM Open License v1.0 permite uso comercial solo por debajo del umbral de 10M USD de ingresos anuales. Las trazas de entrenamiento derivan del set de prompts MiMo/TeichAI (`license: other`) y de salidas de Qwen4 Max via OpenRouter; el autor recomienda revisar ambos terminos antes de un uso comercial. No se asserts nueva licencia sobre las trazas generadas por el modelo.
- **Caveats de evaluacion**: el benchmark fusiona el adaptador en el base fp16 en kernel, no carga el `bf16/` subido ni el GGUF Q4_K_M; la cuantizacion a 4 bits puede alterar la calidad del codigo. El entrenamiento uso contabilidad de batch de 2 GPU de Kaggle con el modelo fijado a `cuda:0`, resultando en batch global efectivo de 16 en lugar de 8. La cuantizacion en entrenamiento (NF4) difiere de la de evaluacion (bf16/fp16).
- **Dependencia de `trust_remote_code`**: el uso via Transformers requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AJ-Gonzalez/coder-lfm3-1.7b-qwen4-max
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/AJ-Gonzalez/qwen4-max-reasoning-250x
- Resultados de benchmark: `bench/bench_results.json` (referenciado en la model card, sin URL publica disponible)
