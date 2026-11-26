# AJ-Gonzalez/rooster-coder-rwkv7-1.5b

## Resumen

rooster-coder-rwkv7-1.5b es un adaptador LoRA PEFT sobre el checkpoint base RWKV/RWKV7-G1k-1.5B-20260930, desarrollado por AJ-Gonzalez. No se trata de un modelo preentrenado nuevo, sino de un ajuste supervisado (SFT) sobre el perfil "coder" del corpus de razonamiento Qwen4 Max, con el objetivo de enseñar al modelo base el estilo de traza de razonamiento de dicho corpus. El modelo base emplea la arquitectura RWKV-7, una familia de modelos recurrentes con atención lineal que prescinde del mecanismo de atención cuadrática de los transformers clásicos.

El adaptador tiene 14.155.776 parámetros (0,9183% del total) y el modelo fusionado resultante mantiene los 1.527.799.808 parámetros del checkpoint base. El contexto de entrenamiento fue de 2048 tokens. La relevancia de esta ficha es doble: por un lado documenta un adaptador de código sobre RWKV-7; por otro, el autor lo publica explícitamente como un resultado negativo medido, ya que el ajuste degrada la capacidad general de generación de código (HumanEval+ cae 13,4 puntos) pese a mejorar la pérdida en distribución.

El repositorio incluye tanto el adaptador PEFT como artefactos fusionados listos para inferencia (GGUF Q6_K y Q4_K_M para llama.cpp, y MLX 4-bit), todos derivados de los mismos pesos. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 (modelo recurrente con atención lineal, familia RWKV) |
| Parametros totales | 1.527.799.808 (modelo fusionado); adaptador LoRA: 14.155.776 (0,9183%) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | GGUF Q6_K, GGUF Q4_K_M, MLX 4-bit (4,972 bpw); entrenamiento e inferencia PyTorch en fp32 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT), GGUF (llama.cpp, arquitectura `rwkv7`), MLX 4-bit |

## Arquitectura y entrenamiento

El modelo base es RWKV-7, una arquitectura recurrente con atención lineal que evita el coste cuadrático de la atención estándar de los transformers. El adaptador es un LoRA plano (no QLoRA) con r=16, alpha=32, dropout 0,05, `task_type=CAUSAL_LM`, aplicado sobre las proyecciones `receptance`, `key`, `value` y `output`. El emparejamiento por nombre también alcanza las proyecciones `key`/`value` de la FFN, lo que explica el tamaño del adaptador. Se entrenó durante 3 épocas con batch 1 y acumulación de gradiente 8, learning rate 1e-4, warmup 10, optimizador AdamW, gradient checkpointing y secuencia máxima de 2048 tokens.

Los datos provienen de 70 filas del corpus AJ-Gonzalez/qwen4-max-reasoning-250x (32 de `1_code`, 29 de `2_cs`, 9 de `4_stats`), con trazas generadas por qwen/qwen4-max-20261115 vía OpenRouter. Cada traza de razonamiento se almacena con el formato `<think` + razonamiento + `</think` + contenido, verificado contra `chat_template.jinja`. Tras el renderizado con la plantilla RWKV y el troceado a 2048 tokens con 256 de solapamiento, el conjunto resultó en 356 chunks de entrenamiento (667.970 tokens) y 46 de validación (88.854 tokens). El entrenamiento se realizó deliberadamente en fp32 porque el checkpoint es bf16 nativo y fp16 producía logits NaN y `grad_norm: nan` desde el primer paso en una T4; el pico de memoria fue de 11,43 GiB y el tiempo total de 2,46 horas para 135 pasos de optimizador en una sola Tesla T4 (Kaggle). La pérdida de entrenamiento final fue 1,6735 y la de evaluación 1,9399.

## Capacidades

- Generación de texto y razonamiento en formato de traza explícita (`<think` ... `</think`), aprendido del corpus Qwen4 Max.
- Generación de código en Python y otras tareas de programación, si bien con capacidad general degradada respecto al modelo base.
- Razonamiento matemático y de estadística, cubierto parcialmente por las filas `4_stats` del corpus.
- Soporte de plantilla de chat con `thinking=True` para activar el modo de razonamiento.
- Capacidades multilingües limitadas al inglés (idioma declarado: en).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá de la traza de razonamiento.
- No dispone de visión ni audio.

## Casos de uso

- Investigación sobre ajuste fino con LoRA en arquitecturas RWKV: el repositorio sirve como referencia reproducible de un SFT completo (datos, hiperparámetros, diagnóstico de pérdida y artefactos fusionados) para estudiar cómo un adaptador pequeño afecta a un modelo recurrente.
- Estudio de resultados negativos en ajuste fino: útil para analizar el sobreajuste al estilo de traza y su impacto en benchmarks de código, con métricas concretas de HumanEval y HumanEval+.
- Experimentación con formatos de despliegue ligeros: los GGUF Q4_K_M (990 MB) y Q6_K (1,34 GB) permiten probar la arquitectura `rwkv7` en llama.cpp en hardware modesto.
- Pruebas de inferencia en Apple Silicon: el artefacto MLX 4-bit (907 MB, pico de 1,076 GB) permite ejecutar el modelo en un M1 Air con 46,0 t/s de generación en modo greedy.
- Generación de trazas de razonamiento con estilo concreto: útil en entornos controlados donde se quiera reproducir el formato de razonamiento del corpus de entrenamiento, no para código de producción.
- Docencia y demostraciones de arquitecturas no transformer: el modelo fusionado permite mostrar el comportamiento de RWKV-7 en tareas de código con un consumo de memoria reducido.
- Evaluación comparativa de adaptadores: como referencia para medir la degradación de HumanEval+ al ajustar con pocos datos (70 filas) y learning rate alto.

## Benchmarks y rendimiento

Los benchmarks fueron medidos por el autor con el mismo arnés para ambas filas: una T4, fp32, plantilla RWKV con `thinking=True`, decodificación greedy, 768 tokens nuevos, evalplus 0.3.1 con sanitize + evaluate. NLL es entropía cruzada a nivel de token; los chunks retenidos son los 46 de validación (88.677 tokens) y SWE20 son los mismos 20 enunciados de SWE-bench usados en entrenamiento (15.427 tokens).

| Modelo | HumanEval | HumanEval+ | NLL retenido | NLL SWE20 |
|---|---:|---:|---:|---:|
| Base RWKV7-G1k-1.5B | 0,341 | 0,329 | 2,2417 | 1,6097 |
| + este adaptador | 0,201 | 0,195 | 2,1179 | 1,7227 |

El adaptador mejora la NLL en distribución (2,2417 -> 2,1179) pero degrada HumanEval+ en 13,4 puntos (0,329 -> 0,195); la NLL de SWE20 también empeora. El autor lo publica como resultado negativo medido, no como modelo de código recomendado.

Rendimiento de inferencia medido en un M1 Air (Metal, greedy):

| Artefacto | Prompt | Generación | Pico de memoria |
|---|---:|---:|---:|
| GGUF Q6_K | 173,6 t/s | 32,0 t/s | no disponible |
| GGUF Q4_K_M | 173,8 t/s | 36,1 t/s | no disponible |
| MLX 4-bit | 19,6 t/s | 46,0 t/s | 1,076 GB |

Estos datos son pruebas de humo, no benchmarks formales.

## Requisitos de hardware

- Inferencia en PyTorch: fp32 obligatorio por la inestabilidad de fp16 en esta arquitectura; el entrenamiento consumió 11,43 GiB de pico en una T4.
- GPU recomendadas: Tesla T4 es suficiente para entrenamiento e inferencia en fp32; para mayor comodidad, A100 o H100 con memoria holgada.
- GPU de consumo: los GGUF Q4_K_M (990 MB) y Q6_K (1,34 GB) caben en GPUs consumer con 4 GB o más; el MLX 4-bit (907 MB) cabe en Apple Silicon con 1,1 GB de memoria.
- Despliegue: llama.cpp con arquitectura `rwkv7` (GGUF), mlx_lm (MLX 4-bit), y transformers + PEFT con `trust_remote_code=True` para el adaptador.
- Throughput medido en M1 Air: 32,0 t/s (Q6_K), 36,1 t/s (Q4_K_M) y 46,0 t/s (MLX 4-bit) en generación greedy.
- No se dispone de datos de latencia o throughput en GPU para este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval+ | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| rooster-coder-rwkv7-1.5b | 1.527.799.808 | 2048 | 0,195 | apache-2.0 | HF (adaptador + GGUF + MLX) |
| RWKV7-G1k-1.5B (base) | 1.527.799.808 | no disponible | 0,329 | apache-2.0 | HF |
| Alternativas de 1,5B para código | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación directa disponible en la información es con el modelo base, que supera al adaptador en HumanEval+ (0,329 frente a 0,195). No se han proporcionado datos de otros modelos comparables de la misma categoría.

## Limitaciones y advertencias

- El modelo base no está ajustado a instrucciones; el adaptador enseña el estilo de traza del corpus, no conversación general.
- Sobreajuste severo: 70 filas con learning rate 1e-4 durante 3 épocas degradan HumanEval+ en 13,4 puntos y empeoran la NLL en SWE20.
- La inferencia en fp16 de esta arquitectura es poco fiable (el entrenamiento se hizo en fp32 por logits NaN y gradientes NaN); usar fp32 en PyTorch.
- Los GGUF existentes de RWKV7-G1k-1.5B son del modelo base y no contienen este adaptador.
- El corpus de razonamiento deriva de prompts de TeichAI/MiMo y trazas de Qwen4 Max; aplican los términos de uso de las fuentes originales.
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- Contexto máximo de 2048 tokens, insuficiente para tareas de código con repositorios grandes.
- Riesgo de alucinación no cuantificado en la información disponible; al ser un modelo de 1,5B con ajuste mínimo, se espera un comportamiento limitado en razonamiento complejo.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- Uso comercial permitido por Apache-2.0, pero el autor no lo recomienda como modelo de código en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AJ-Gonzalez/rooster-coder-rwkv7-1.5b
- Modelo base: https://huggingface.co/RWKV/RWKV7-G1k-1.5B-20260930
- Dataset de entrenamiento: https://huggingface.co/datasets/AJ-Gonzalez/qwen4-max-reasoning-250x
- Dataset SFT en Kaggle: https://www.kaggle.com/datasets/aliciajgonzalez/rooster-coder-rwkv7-sft-data
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
