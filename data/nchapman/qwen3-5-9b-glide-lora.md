# nchapman/Qwen3.5-9B-GLiDE-LoRA

## Resumen

Qwen3.5-9B-GLiDE-LoRA es un adaptador PEFT de tipo LoRA (rango 128) más una cabeza de lectura de 255 vías, extraídos del modelo `fastino/GLiDE-9B` y montados sobre el backbone `Qwen/Qwen3.5-9B`. Lo desarrolla el usuario de Hugging Face `nchapman` y su propósito es convertir un modelo generativo causal estándar en un motor capaz de servir, con una sola carga del backbone, tanto chat conversacional convencional como consultas de decisión estructuradas no causales mediante el endpoint `/v1/systemone`. El adaptador está pensado para el ecosistema `warp-34` y la librería PEFT.

El interés técnico principal reside en que destila el comportamiento de un modelo de decisión ("system-one") de 9B en un adaptador de bajo rango que se acopla a un backbone cuantizable, reduciendo el coste de despliegue frente al modelo GLiDE completo. Incorpora técnicas de plegado de normalización (`GemmaRMSNorm` y `RMSNormGated`) directamente en los pesos del adaptador y la cabeza de lectura, de modo que no hay sobrecoste en tiempo de ejecución, y deduplica las proyecciones `lora_A` de módulos fusionados (q/k/v, gate/up, in_proj_qkv/z, in_proj_b/a) para recortar FLOPs y VRAM.

La relevancia actual viene de su enfoque de "servicio dual": un mismo backbone Qwen3.5-9B puede atender peticiones de chat normales (`lora_id = -1`) y peticiones de decisión estructurada (`lora_id = "glide"`) sin cargar dos modelos. En la evaluación pública JevBench (231 casos), el adaptador eleva la precisión del backbone base del 83,98% al 88,74% en una sola pasada, acercándose al GLiDE-9B completo (91,34%).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-9B con atención lineal híbrida y cabeza de lectura `CodeReadout` de 255 vías |
| Parámetros totales | no disponible (adaptador LoRA r=128 + cabeza `[255, 4096]`; el backbone Qwen3.5-9B no forma parte del repo) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | El adaptador se distribuye en `bfloat16`; compatible con backbone cuantizado W4A16 (referencia a `nchapman/Qwen3.5-9B-W4A16-HGPTQ`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (`adapter_model.safetensors`, `readout.safetensors`) + `adapter_config.json` y `decision_config.json` |

## Arquitectura y entrenamiento

El adaptador se extrae del modelo `fastino/GLiDE-9B` mediante destilación Teacher-ASVD: se usan 128 prompts de calibración del corpus `SargeDev/jev-distill-corpus-v3` con las activaciones del profesor GLiDE-9B para calcular las proyecciones LoRA. El rango es 128 con `lora_alpha=128`, y se aplica un `rank_pattern`/`alpha_pattern` de 64 sobre `linear_attn.in_proj_{a,b}`. Las proyecciones `lora_A` de módulos fusionados (q/k/v, gate/up, in_proj_qkv/z, in_proj_b/a) se comparten mediante deduplicación, lo que reduce FLOPs y VRAM entre 2x y 3x cuando el motor de inferencia las deduplica.

Una innovación destacable es el plegado exacto offline de las normalizaciones: los desplazamientos de escala `(1 + g_glide) / (1 + g_base)` en `input_layernorm` y `post_attention_layernorm`, la ratio `g_glide / g_base` de `linear_attn.norm` hacia `linear_attn.out_proj`, y la normalización final `model.language_model.norm` (absorbida en `readout.safetensors`) se integran en los pesos del adaptador y de la cabeza, de forma que no hay coste en tiempo de ejecución. El runtime de decisión se define en `decision_config.json` con `attention_mode: "noncausal_full_attention"`, la plantilla `quick-empty-think-medium-v1`, midloop con bloques `[[12, 17], [18, 23]]` y 2 pasadas, y 255 códigos de opción de `A` a `GC`. No se detalla la composición completa del dataset de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto causal estándar mediante el backbone Qwen3.5-9B (chat completions con `lora_id = -1`).
- Consultas de decisión estructuradas no causales con atención completa (`/v1/systemone`, `lora_id = "glide"`), devolviendo una de 255 opciones codificadas (`A`..`GC`).
- Razonamiento de tipo "system-one" con midloop de 2 pasadas sobre los bloques 12-17 y 18-23.
- Servicio dual en un único motor y una única carga del backbone (`warp-34` + PEFT).
- Compatibilidad con backbones cuantizados W4A16 (HGPTQ).
- Capacidades del backbone base Qwen3.5-9B (código, matemáticas, multilingüismo, tool calling) no documentadas en la información disponible para este adaptador.

## Casos de uso

- Clasificación y enrutado de decisiones: el adaptador devuelve una de 255 opciones estructuradas, adecuado para triaje de tickets, selección de categoría o enrutado de intenciones en pipelines automatizados.
- Sistemas de recomendación con opciones discretas: la cabeza `CodeReadout` de 255 vías permite mapear contexto a una acción o ítem concreto sin generación libre.
- Servicio dual en producción: un único despliegue de Qwen3.5-9B atiende chat conversacional y consultas de decisión, reduciendo el número de modelos cargados y el coste de VRAM.
- Despliegue en hardware limitado: al ser un adaptador LoRA sobre un backbone cuantizado W4A16, permite ejecutar el comportamiento GLiDE con menor huella de memoria que el modelo completo de 9B.
- Evaluación de modelos de decisión: útil para reproducir la evaluación JevBench y comparar el efecto del adaptador frente al backbone base y al GLiDE completo.
- Integración en motores de inferencia personalizados: el formato PEFT y el `decision_config.json` facilitan su incorporación en servidores compatibles con `warp-34` y PEFT.

## Benchmarks y rendimiento

Evaluación en `kshitijthakkar/nirnaya-jevbench-public-eval-v1` (231 casos: 48 fáciles / 72 originales / 111 difíciles), plantilla `quick-empty-think-medium-v1` y `noncausal_full_attention`:

| Modelo | Precisión global | Fácil (48) | Original (72) | Difícil (111) | NLL (↓) | Brier (↓) |
|---|---|---|---|---|---|---|
| Base Qwen3.5-9B (passes=1) | 194/231 (83,98%) | 48/48 (100,0%) | 70/72 (97,22%) | 76/111 (68,47%) | 0,4190 | 0,2212 |
| Base Qwen3.5-9B (passes=2 midloop) | 195/231 (84,42%) | 48/48 (100,0%) | 70/72 (97,22%) | 77/111 (69,37%) | 0,4188 | 0,2214 |
| Qwen3.5-9B + GLiDE-LoRA (r=128, passes=1) | 205/231 (88,74%) | 48/48 (100,0%) | 72/72 (100,0%) | 85/111 (76,58%) | 0,2819 | 0,1592 |
| Qwen3.5-9B + GLiDE-LoRA (r=128, passes=2) | 207/231 (89,61%) | 48/48 (100,0%) | 72/72 (100,0%) | 87/111 (78,38%) | 0,2554 | 0,1410 |
| GLiDE-9B completo (passes=1) | 211/231 (91,34%) | 48/48 (100,0%) | 72/72 (100,0%) | 91/111 (81,98%) | 0,2068 | 0,1173 |
| GLiDE-9B completo (passes=2) | 214/231 (92,64%) | 48/48 (100,0%) | 72/72 (100,0%) | 94/111 (84,68%) | 0,2049 | 0,1103 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador ocupa 0,7 GB en el repositorio; requiere cargar además el backbone Qwen3.5-9B (tamaño de pesos no disponible).
- VRAM estimada: no disponible de forma explícita. Con backbone en bfloat16, un modelo de 9B requiere aproximadamente 18 GB solo para pesos, más activaciones y caché KV; con cuantización W4A16 la huella de pesos baja a unos 5-6 GB, aunque la cifra exacta no está documentada.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño del backbone, cabría esperar A100/H100 para bfloat16 y GPUs consumer de gama alta (RTX 4090, 24 GB) con cuantización, pero el autor no lo especifica.
- Opciones de despliegue: motor `warp-34` con PEFT; compatible con backbones cuantizados W4A16 HGPTQ. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevBench (passes=2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-GLiDE-LoRA (este) | LoRA r=128 + cabeza 255 vías sobre 9B | no disponible | 89,61% | Apache 2.0 | Hugging Face (PEFT) |
| fastino/GLiDE-9B | 9B (modelo completo) | no disponible | 92,64% | no disponible | Hugging Face |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | 84,42% | no disponible | Hugging Face |

El adaptador se sitúa entre el backbone base y el GLiDE completo: gana 5,19 puntos al base en passes=2 y queda 3,03 puntos por debajo del GLiDE completo, con la ventaja de un tamaño de repo de 0,7 GB y compatibilidad con backbone cuantizado.

## Limitaciones y advertencias

- Solo se han publicado resultados en JevBench; no hay datos de MMLU, HumanEval, GSM8K ni de calidad de chat general.
- El adaptador está diseñado para el runtime `warp-34` y la plantilla `quick-empty-think-medium-v1`; fuera de ese entorno el comportamiento de decisión puede degradarse.
- La cabeza `CodeReadout` está limitada a 255 opciones (`A`..`GC`); no sirve para decisiones de cardinalidad abierta.
- El modo de decisión usa atención no causal completa, lo que incrementa el coste computacional frente a atención causal estándar.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinación específicos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B y el profesor GLiDE-9B tienen sus propias condiciones que deben verificarse por separado.
- El repositorio no incluye el backbone; es necesario descargar Qwen3.5-9B aparte.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/nchapman/Qwen3.5-9B-GLiDE-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo profesor: https://huggingface.co/fastino/GLiDE-9B
- Backbone cuantizado compatible: https://huggingface.co/nchapman/Qwen3.5-9B-W4A16-HGPTQ
- Dataset de evaluación JevBench: https://huggingface.co/datasets/kshitijthakkar/nirnaya-jevbench-public-eval-v1
- Corpus de destilación: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
