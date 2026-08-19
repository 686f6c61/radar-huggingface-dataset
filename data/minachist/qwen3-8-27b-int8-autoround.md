# Minachist/Qwen3.8-27B-INT8-AutoRound

## Resumen

Qwen3.8-27B-INT8-AutoRound es una versión no oficial cuantizada a INT8 (W8A16) del modelo multimodal Qwen3.8-27B, creada por el usuario Minachist mediante la herramienta AutoRound de Intel. El modelo base es un transformer de propósito general con capacidades de imagen y texto (pipeline `image-text-to-text`), y esta cuantización busca reducir el tamaño y el consumo de memoria manteniendo una alta fidelidad con respecto al original.

La relevancia de esta ficha radica en que ofrece una alternativa práctica para desplegar un modelo multimodal de gran tamaño en hardware limitado, con dos ramas diferenciadas según cómo se traten las capas de atención lineal. La rama `main` ocupa 28,8 GiB y cuantiza también las proyecciones de la atención lineal, mientras que la rama `linear-attn-bf16` mantiene esas capas en BF16 y ocupa 33,9 GiB. Ambas caben en 2 GPUs de 24 GB con tensor parallelism.

Los datos de safetensors indican 9.116.380.400 parámetros, una cifra notablemente inferior a los 27B que sugiere el nombre del modelo base. Esta discrepancia puede deberse a una arquitectura con parámetros compartidos o a un error en la metadata, pero la ficha se basa en el dato real reportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.8-27B, con atención lineal híbrida (linear_attn) y capas MTP |
| Parametros totales | 9.116.380.400 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (W8A16, per-channel, group_size=-1, simétrico) para 407 capas; BF16 para 210 capas (embed_tokens, lm_head, vision tower, in_proj_a/b) |
| Idiomas soportados | no disponible (el modelo base Qwen3.8-27B es presumiblemente multilingüe, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo original Qwen3.8-27B es un transformer multimodal que combina atención estándar con capas de atención lineal (lineal_attn), además de capas MTP (multi-token prediction). La cuantización realizada con AutoRound aplica INT8 per-channel simétrico a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj` de la atención, a las capas del MLP (`gate_proj`, `up_proj`, `down_proj`) y a las proyecciones de la atención lineal (`in_proj_qkv`, `in_proj_z`, `out_proj`), así como a las capas MTP. Se dejan en BF16 las capas `in_proj_a` y `in_proj_b` (cuyo output dimension de 48 no es divisible por 32, por lo que AutoRound las omite), la torre de visión (porque la calibración es solo texto), `embed_tokens` y `lm_head`.

La calibración se realizó con `iters=250`, `nsamples=1024`, `seqlen=2048`, `batch_size=4`, `gradient_accumulate_steps=2`, usando el dataset `NeelNanda/pile-10k` (256 muestras) y `codeparrot/github-code-clean` (768 muestras). El autor documenta un bug conocido en AutoRound 0.15 relacionado con el aliasing de diccionarios compartidos en la configuración de capas, que puede provocar que capas no cuantizables arrastren a otras a 16 bits; ofrece una solución mediante `copy.deepcopy` o especificando cada capa por su sufijo completo.

## Capacidades

- Procesamiento multimodal: el pipeline `image-text-to-text` indica que el modelo puede recibir imágenes y texto como entrada y generar texto.
- Conversación: el tag `conversational` sugiere soporte para diálogos multi-turno.
- Generación de texto: al ser una cuantización del modelo base, conserva las capacidades de generación de lenguaje natural.
- Atención lineal híbrida: las capas `linear_attn` permiten manejar secuencias largas con menor coste computacional, aunque en esta cuantización parte de ellas se mantienen en BF16.
- Capas MTP: predicción multi-token, que puede mejorar la velocidad de generación.
- Compatibilidad con vLLM: el autor menciona que vLLM fusiona `in_proj_b` y `in_proj_a` en un módulo `in_proj_ba`, lo que implica soporte para inferencia optimizada.

No se dispone de información sobre tool calling, agentes o razonamiento multi-step específico en la documentación proporcionada.

## Casos de uso

- Despliegue de un asistente multimodal en un servidor con dos GPUs de 24 GB: la rama `main` (28,8 GiB) cabe con tensor parallelism en 2x RTX 4090 o A10G, permitiendo atender consultas que combinan imágenes y texto en entornos de producción con restricciones de memoria.
- Inferencia en entornos con presupuesto de VRAM ajustado: la cuantización INT8 reduce el footprint de memoria respecto al modelo original, facilitando su ejecución en hardware de gama media sin sacrificar demasiada fidelidad (KLD media de 0,00124).
- Fine-tuning o adaptación posterior: al estar en formato safetensors y ser compatible con transformers, se puede cargar en frameworks de entrenamiento para ajuste fino con PEFT o LoRA, aunque la cuantización W8A16 puede requerir cuidados adicionales.
- Evaluación de fidelidad de cuantización: los datos de KLD y top-1 agreement publicados permiten comparar el impacto de la cuantización frente a otras versiones (por ejemplo, Qwen3.6-27B-INT8-AutoRound), útil para investigadores que estudian degradación por cuantización.
- Prototipado rápido en notebooks o entornos de desarrollo: al ser un modelo cuantizado, se puede cargar en una sola GPU de 24 GB (o incluso menos con offloading) para experimentar con tareas de visión-lenguaje sin necesidad de un clúster.
- Integración en pipelines de generación aumentada por recuperación (RAG) multimodal: el modelo puede procesar documentos con imágenes y texto, y su menor tamaño facilita su despliegue junto a bases vectoriales en infraestructura modesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. En su lugar, el autor proporciona métricas de divergencia KL (KLD) comparando la distribución de salida del modelo cuantizado con la del modelo base, medidas sobre WikiText-2 (test) con 122.640 posiciones de siguiente token.

| Metrica (ctx 512) | Rama `main` | Rama `linear-attn-bf16` |
|---|---|---|
| Mean KLD | 0,00124 ± 0,00002 | 0,00110 ± 0,00001 |
| Median KLD | 0,000701 | 0,000628 |
| P90 / P95 / P99 KLD | 0,00231 / 0,00340 / 0,00825 | 0,00215 / 0,00306 / 0,00719 |
| P99.9 / Max KLD | 0,0335 / 1,843 | 0,0250 / 0,882 |
| Top-1 Agreement | 98,40% | 98,47% |
| PPL (base a cuantizado) | 7,9112 a 7,9101 | 7,9112 a 7,9132 |
| ln(PPL Ratio) | -0,000140 | +0,000247 |

Estos valores indican una degradación muy baja en la distribución de salida, con un acuerdo top-1 superior al 98%. El autor advierte que la KLD no es una propiedad absoluta del checkpoint y depende del corpus de evaluación, por lo que comparaciones con otros modelos solo son válidas si se usan exactamente los mismos ajustes.

## Requisitos de hardware

- VRAM estimada: la rama `main` pesa 28,8 GiB en pesos, por lo que se necesita al menos 2x 24 GB con tensor parallelism para inferencia completa. La rama `linear-attn-bf16` pesa 33,9 GiB, requiriendo también 2x 24 GB (o 2x 40 GB si se quiere margen).
- GPUs recomendadas: RTX 4090 (24 GB), A10G (24 GB), A100 40 GB o H100 (para mayor margen). No cabe en una sola GPU de 24 GB sin offloading a CPU.
- Opciones de despliegue: compatible con transformers y vLLM (este último fusiona `in_proj_ba`). No se menciona soporte explícito para llama.cpp u Ollama, pero al ser safetensors podría convertirse a GGUF.
- Latencia y throughput: no se proporcionan datos medidos. La presencia de capas MTP y atención lineal podría mejorar la velocidad de generación, pero no hay cifras concretas.

## Comparativa con modelos similares

La única comparación directa disponible en la documentación es con la versión anterior del mismo autor, Qwen3.6-27B-INT8-AutoRound, que usa una receta de calibración más antigua (iters=1000, sin cuantizar linear_attn ni MTP) y reporta una KLD media de 0,00167 con 98,51% de top-1 agreement. El modelo actual mejora esa cifra (0,00124 en la rama `main`) con una calibración más corta pero sobre un corpus mixto.

| Modelo | Parametros | Contexto | KLD media | Top-1 | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-INT8-AutoRound (main) | 9,1B (safetensors) | no disponible | 0,00124 | 98,40% | Apache 2.0 |
| Qwen3.6-27B-INT8-AutoRound (publicado) | no disponible | no disponible | 0,00167 | 98,51% | Apache 2.0 |
| Qwen3.8-27B (base) | 27B nominal | no disponible | - | - | Apache 2.0 |

No se dispone de comparativas con otros modelos cuantizados de la misma familia (p. ej., AWQ o GPTQ) en la información proporcionada.

## Limitaciones y advertencias

- Cuantización no oficial: es un trabajo de la comunidad, no respaldado por Qwen, por lo que puede haber diferencias de comportamiento respecto al modelo original en tareas no cubiertas por la calibración.
- Calibración solo textual: la torre de visión no se cuantiza, pero tampoco recibe señales de calibración, lo que podría afectar a la fidelidad en tareas multimodales si el modelo base dependiera de esa parte para ciertas entradas.
- Bug conocido en AutoRound: el autor documenta un problema de aliasing en la configuración de capas que puede provocar que capas no cuantizables arrastren a otras a 16 bits; aunque se ofrece una solución, los usuarios que reproduzcan el proceso deben tenerlo en cuenta.
- Discrepancia en el número de parámetros: el nombre sugiere 27B, pero safetensors reporta 9,1B. Esto puede deberse a pesos compartidos (p. ej., en atención lineal) o a un error de metadata; conviene verificar antes de usarlo en producción.
- Sin benchmarks de tareas: no hay resultados de MMLU, HumanEval u otros estándar, lo que dificulta evaluar su rendimiento en tareas concretas más allá de la fidelidad de distribución.
- Requisitos de hardware elevados: aunque es una cuantización INT8, sigue necesitando 2 GPUs de 24 GB, lo que limita su uso en entornos con un solo GPU de gama media.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Minachist/Qwen3.8-27B-INT8-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de AutoRound: https://github.com/intel/auto-round
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
