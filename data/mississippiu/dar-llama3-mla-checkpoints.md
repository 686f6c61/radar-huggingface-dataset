# mississippiu/dar-llama3-mla-checkpoints

## Resumen

DAR (distance-adaptive latent allocation) sobre un LLaMA-3-8B convertido a MLA es un conjunto de checkpoints de investigación publicados por el usuario mississippiu para reproducir los experimentos de la Tabla 5 del proyecto DAR. No es un modelo de producción: son artefactos experimentales que exploran la compresión del KV-cache en arquitecturas Multi-head Latent Attention (MLA) mediante la asignación de un latente de contenido de menor rango para tokens distantes ("distant latent") y una ventana de atención local para tokens cercanos.

El punto de partida es `fxmeng/TransMLA-llama3-8b-32k`, un LLaMA-3-8B convertido a MLA por TransMLA con latente de contenido 512 y clave RoPE desacoplada de 64. Cada checkpoint DAR añade un latente distante de menor rango (256 o 272 dimensiones) y se destila por MSE de estados ocultos hacia el modelo base como profesor, entrenando únicamente las proyecciones del latente distante.

La relevancia es acotada pero técnica: demuestra que reducir el rango del latente distante a 256 con una ventana de 256 tokens mantiene MMLU (0,6133 frente a 0,6221) y GSM8K (0,7642 frente a 0,7710) muy cerca del base, mientras reduce el cache medio a 8K de 576 a 336 entradas, algo que una MLA uniforme de rango 272 no logra (MMLU 0,4826). El repo ocupa 49,9 GB por incluir checkpoints de entrenamiento completos, no solo pesos de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Multi-head Latent Attention (MLA), conversión TransMLA de LLaMA-3-8B; latente de contenido 512, clave RoPE desacoplada 64, latente distante de rango reducido |
| Parametros totales | 8B (heredados del LLaMA-3-8B base; no se indica recuento exacto tras la conversión MLA) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K en el modelo base; evaluado a 8K (RULER@8K, entrenamiento con secuencias empaquetadas de 8K) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible (heredados del LLaMA-3-8B base; no se documenta evaluación multilingüe) |
| Licencia | Llama 3 Community License (derivado de Meta Llama 3 vía TransMLA) |
| Formato de pesos | safetensors (carpetas `model/`, `train_checkpoint-332/`, `milestones/`), con `trust_remote_code=True` |

## Arquitectura y entrenamiento

La arquitectura parte de un LLaMA-3-8B convertido a MLA por TransMLA: cada cabeza comprime claves y valores en un latente de contenido de 512 dimensiones más una clave RoPE desacoplada de 64 dimensiones. Sobre esa base, DAR introduce un segundo latente de contenido de menor rango para tokens fuera de una ventana local: `dar_opt_r256_w256` usa latente local 512, latente distante 256 y ventana de 256 tokens; `uniform_r272` es una MLA uniforme de rango 272 sin ventana (referencia de ablación). Los checkpoints "uniform" se almacenan como MLA de rango r plano.

El entrenamiento es destilación de estados ocultos: MSE entre el último estado oculto del profesor (el modelo base) y el del estudiante sobre los tokens de asistente, actualizando solo las proyecciones del latente distante (`*_lt*`). Datos: Open-PerfectBlend, una época, 332 pasos, secuencias empaquetadas de 8K, batch global 256, AdamW con lr 1e-4, betas 0,9/0,95, decaimiento lineal y 3 % de warm-up, grad clip 1,0. El cómputo se realizó en 4× NVIDIA GH200 en segmentos reanudados de 2 horas. La innovación destacable es la asignación adaptativa por distancia del rango latente para comprimir el KV-cache sin degradar tareas de razonamiento.

## Capacidades

- Generación de texto y razonamiento general, heredados del LLaMA-3-8B base y preservados parcialmente por la destilación (MMLU 0,6133 en DAR-opt).
- Razonamiento matemático de varios pasos (GSM8K 0,7642 en DAR-opt, exact match estricto).
- Recuperación en contexto largo: RULER@8K medio de 0,9252 en DAR-opt sobre 12 subtareas (`niah_*`, `vt`, `cwe`, `fwe`, `qa_squad`).
- Compresión de KV-cache: cache medio de 336 entradas a 8K frente a 576 del base, con ventana local de 256 tokens.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.
- No se documenta modo "thinking" ni capacidades multilingües específicas.
- Uso previsto: reproducción de experimentos e investigación sobre MLA y compresión de cache, no despliegue en producción.

## Casos de uso

- Investigación sobre compresión de KV-cache: servir como referencia reproducible para comparar asignación adaptativa por distancia (DAR-opt) frente a MLA uniforme de rango bajo (Uniform-272) con el mismo presupuesto de cache de 336 entradas.
- Experimentos de destilación de estados ocultos: reutilizar `train_checkpoint-332/` (pesos, optimizador, scheduler y estado RNG) para reanudar el entrenamiento o cambiar hiperparámetros sin partir de cero.
- Estudio de arquitecturas MLA: analizar el efecto del rango del latente distante (256 frente a 272) sobre MMLU, GSM8K y RULER usando `eval_results/` y `logging.jsonl` como trazas.
- Evaluación de recuperación en contexto largo: ejecutar RULER a 8K con flash-attn 2 para medir la degradación de `niah_*` y `qa_squad` al reducir el cache, un escenario típico en pipelines de RAG con documentos extensos.
- Reproducción académica: validar la Tabla 5 del proyecto DAR con lm_eval 0.4.11, backend HF y bf16, siguiendo la configuración 5-shot con plantilla de chat de Llama-3 Instruct.
- Análisis de compromiso calidad/memoria: cuantificar cuánta calidad (MMLU, GSM8K) se pierde por cada reducción de cache, útil para decidir presupuestos de memoria en despliegues de inferencia de 8K de contexto.

## Benchmarks y rendimiento

Evaluación con lm_eval 0.4.11, backend HF, bf16, longitud máxima 8192; MMLU y GSM8K en 5-shot con plantilla de chat de Llama-3 Instruct; GSM8K con exact match estricto; RULER como media de 12 subtareas a 8K en [0, 1].

| Modelo | Latente local | Latente distante | Ventana | Cache medio @ 8K | MMLU | GSM8K | RULER@8K |
|---|---|---|---|---|---|---|---|
| Base (Uniform-512) | 512 | 512 | – | 576 | 0,6221 | 0,7710 | 0,9495 |
| `dar_opt_r256_w256` (DAR-opt) | 512 | 256 | 256 | 336 | 0,6133 | 0,7642 | 0,9252 |
| `uniform_r272` (Uniform-272) | – | 272 | 0 | 336 | 0,4826 | 0,6869 | ver `eval_results/` |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al ser un modelo de 8B en bf16, el peso ronda los 16 GB y el KV-cache comprimido a 8K es de 336 entradas medias frente a 576 del base, lo que reduce la memoria de cache pero no se cuantifica en la información.
- GPU recomendadas: el entrenamiento se realizó en 4× NVIDIA GH200; para inferencia a 8K con RULER se requiere flash-attn 2, lo que implica GPU NVIDIA con soporte de FlashAttention-2 (A100, H100, GH200 y similares).
- GPU de consumo: no se documenta compatibilidad con RTX 4090 ni con cuantizaciones GGUF; el repo solo publica pesos safetensors en bf16.
- Opciones de despliegue: transformers con `trust_remote_code=True`, `dtype="bfloat16"` y `attn_implementation="flash_attention_2"`; no se documenta vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GSM8K | RULER@8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| DAR-opt (`dar_opt_r256_w256`) | 8B (MLA) | 32K (evaluado 8K) | 0,6133 | 0,7642 | 0,9252 | Llama 3 Community | HuggingFace, checkpoints de investigación |
| Base TransMLA-llama3-8b-32k | 8B (MLA) | 32K | 0,6221 | 0,7710 | 0,9495 | Llama 3 Community | HuggingFace |
| Uniform-272 | 8B (MLA) | 32K (evaluado 8K) | 0,4826 | 0,6869 | no disponible | Llama 3 Community | HuggingFace (mismo repo) |

No se dispone de comparación con modelos no-MLA de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Son checkpoints experimentales, no modelos de producción; el autor lo indica explícitamente.
- Degradación medible frente al base: DAR-opt pierde 0,0088 en MMLU, 0,0068 en GSM8K y 0,0243 en RULER@8K; Uniform-272 cae mucho más (MMLU 0,4826).
- Requiere `trust_remote_code=True` y flash-attn 2 para RULER a 8K, lo que añade dependencias frágiles en producción.
- No se documentan sesgos, riesgos de alucinación ni evaluación multilingüe; se heredan los del LLaMA-3-8B base sin cuantificar.
- Licencia Llama 3 Community: restricciones de uso comercial y obligaciones de atribución ("Built with Meta Llama 3"); revisar los términos antes de cualquier despliegue.
- El repo de 49,9 GB incluye checkpoints de entrenamiento y milestones, no solo pesos de inferencia; conviene descargar únicamente la subcarpeta `model/`.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo.
- El contexto evaluado es 8K aunque el base soporte 32K; no hay resultados a 32K en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/mississippiu/dar-llama3-mla-checkpoints
- Modelo base: https://huggingface.co/fxmeng/TransMLA-llama3-8b-32k
- Licencia Meta Llama 3: https://llama.meta.com/llama3/license/
- Repositorio del proyecto DAR (código `llama3_mla/`): no disponible como URL en la información proporcionada
- Paper de TransMLA: no disponible en la información proporcionada
- Demo: no disponible
