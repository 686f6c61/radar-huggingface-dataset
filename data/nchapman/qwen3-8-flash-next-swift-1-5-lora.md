# nchapman/Qwen3.8-Flash-Next-Swift-1.5-LoRA

## Resumen

`nchapman/Qwen3.8-Flash-Next-Swift-1.5-LoRA` es un adaptador LoRA de rango 32 en BF16 (aproximadamente 310 MB, repo de 0,1 GB) que reproduce sobre el modelo base `Qwen/Qwen3.8-Flash-Next` las mejoras de post-entrenamiento del checkpoint completo `ukisai/Swift1.5-Qwen3.8-Flash-Next` (360 GB). El autor es nchapman y el adaptador se publica bajo la Swift Open License 1.0, heredada del modelo fuente de UkisAI; el modelo base Qwen3.8-Flash-Next es de Qwen y se distribuye con licencia Apache-2.0.

El hallazgo central de la model card es que el checkpoint Swift-1.5 solo modifica 300 proyecciones `nn.Linear` 2D (las `q/k/v/o_proj` de atención, las `in_proj_qkv`, `in_proj_z` y `out_proj` de atención lineal, y las `gate/up/down_proj` del experto compartido) en sus 48 capas. Los 512 expertos enrutados, las puertas del router, los pesos de mezcla de hiperconexión, la torre de visión, los embeddings y el `lm_head` son idénticos bit a bit al modelo base. Por eso basta un LoRA intrínseco de rango 32 para capturar el 96,1-97,3 % de los pesos BF16 modificados dentro de 1 ULP, sin necesidad de tensores `ParamWrapper` 3D para los expertos.

Su relevancia práctica es inmediata: permite obtener el comportamiento de razonamiento y eficiencia de tokens de Swift-1.5 cargando un adaptador de 310 MB sobre el base en `vLLM` (`--enable-lora`) o en `transformers`/`peft`, sin desplegar un checkpoint de 360 GB. Es un caso claro de destilación espectral de un fine-tuning completo a un adaptador ligero y servible en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer híbrido con MoE, atención lineal e hiperconexiones (Qwen3.8-Flash-Next); 48 capas |
| Parametros totales | Adaptador de ~310 MB (r=32); parámetros totales del modelo base: no disponible |
| Parametros activos | no disponible (el base es MoE con 512 expertos enrutados, pero no se especifica el número de activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El adaptador se publica en BF16; el modelo base admite servir cuantizado según la model card, sin detallar formatos |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (modelo fuente UkisAI); el base Qwen3.8-Flash-Next es Apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`), PEFT |

## Arquitectura y entrenamiento

El adaptador no entrena desde cero: se obtiene por descomposición SVD de las diferencias de pesos entre `ukisai/Swift1.5-Qwen3.8-Flash-Next` y `Qwen/Qwen3.8-Flash-Next`. El análisis de los 1658 tensores del checkpoint revela que los 512 expertos enrutados (`mlp.experts.gate_up_proj` y `mlp.experts.down_proj`, 354 GB, el 97 % del checkpoint), las puertas del router, los pesos de hiperconexión, la torre de visión, los embeddings y el `lm_head` son idénticos bit a bit (`max_abs_diff = 0.000000`). Solo 300 proyecciones 2D concentran el cambio, y su espectro singular presenta un acantilado marcado entre el valor 32 y el 33, lo que justifica el rango elegido.

La reconstrucción con r=32 captura el 91,06 % de la energía SVD en `self_attn` (48 módulos), el 98,12 % en `shared_mlp` (144 módulos) y el 89,80 % en `linear_attn` (108 módulos), con un error relativo medio de Frobenius en torno a 0,00083. El adaptador se guarda en BF16 y se carga de forma nativa en `vLLM` y en `transformers`/`peft`. No se documentan datos de entrenamiento propios (tokens, composición del dataset, RLHF/DPO) porque el adaptador es una destilación espectral del post-entrenamiento de Swift-1.5, cuyos detalles no se incluyen en la información disponible.

## Capacidades

- Razonamiento y modo de pensamiento eficiente en tokens: el adaptador incorpora las mejoras de "efficient-thinking" y "token-efficient" de Swift-1.5.
- Generación de texto conversacional multi-turno, heredada del modelo base.
- Procesamiento de imagen y texto: el pipeline es `image-text-to-text`, con torre de visión intacta respecto al base.
- Capacidades de código y matemáticas implícitas en el modelo base Qwen3.8-Flash-Next (no se detallan métricas específicas).
- Servible como módulo LoRA en `vLLM` con `--enable-lora` y `--max-lora-rank 32`, lo que permite alternar entre el base y el adaptador sin recargar pesos.
- Compatible con `transformers` mediante `AutoModelForImageTextToText` y `PeftModel`.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Idiomas: no disponible.

## Casos de uso

- Despliegue de razonamiento eficiente en producción: cargar el adaptador sobre el base en `vLLM` con `--enable-lora` permite servir el comportamiento de Swift-1.5 sin alojar el checkpoint de 360 GB, reduciendo el almacenamiento y el tiempo de arranque.
- A/B testing de post-entrenamiento: al ser un módulo LoRA, se puede activar y desactivar por petición para comparar respuestas del base frente a las de Swift-1.5 en el mismo servidor.
- Evaluación de eficiencia de tokens: útil para medir cuánto reduce Swift-1.5 la longitud de las cadenas de razonamiento frente al base en tareas de matemáticas y código.
- Fine-tuning adicional sobre el adaptador: al ser PEFT, se puede apilar o continuar el entrenamiento con nuevos datos de dominio sin tocar los 354 GB de expertos.
- Investigación en destilación espectral: el repositorio documenta la metodología SVD y las métricas de reconstrucción, y sirve como referencia para comprimir fine-tunings completos de modelos MoE a adaptadores ligeros.
- Prototipado en una sola GPU: el adaptador de 310 MB más el base en BF16 o cuantizado permite experimentar con un modelo multimodal de razonamiento en entornos con recursos limitados.
- Integración en pipelines de imagen-texto: al conservar la torre de visión, se puede usar para tareas de descripción de imágenes o VQA con el estilo de respuesta de Swift-1.5.

## Benchmarks y rendimiento

Verificación de forward de 48 capas en bfloat16 sobre una NVIDIA H100 NVL, con 64 prompts (56 de `mlabonne/harmless_alpaca` `test[:56]` y 8 tareas de código, matemáticas y razonamiento; 1528 posiciones de token):

| Metrica | Base Qwen3.8-Flash-Next | Base + Swift-1.5-LoRA (r=32) | Objetivo Swift-1.5 |
|---|---:|---:|---:|
| Divergencia KL en todos los tokens (1528) | 0,015688 nats | 0,003185 nats (4,9x menor) | 0,000000 nats |
| Acuerdo Top-1 en todos los tokens | 97,38 % | 99,21 % | 100,00 % |
| Divergencia KL en prefill (64 prompts) | 0,002246 nats | 0,000071 nats (31,7x menor) | 0,000000 nats |
| Acuerdo Top-1 en prefill | 100,00 % | 100,00 % | 100,00 % |
| Similitud coseno de logits | 0,994068 | 0,999001 | 1,000000 |

Reconstrucción espectral y de pesos BF16 con r=32:

| Familia | Modulos | Energia SVD capturada | Coincidencia exacta BF16 | Dentro de 1 ULP | Error relativo medio |
|---|---:|---:|---:|---:|---:|
| `self_attn` (q, k, v, o) | 48 | 91,06 % | 83,28 % | 96,22 % | 0,000828 |
| `shared_mlp` (gate, up, down) | 144 | 98,12 % | 83,69 % | 96,11 % | 0,000845 |
| `linear_attn` (in_proj_qkv, in_proj_z, out_proj) | 108 | 89,80 % | 86,39 % | 97,32 % | 0,000829 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa ~310 MB y cabe en cualquier GPU; el requisito real lo marca el modelo base Qwen3.8-Flash-Next.
- El checkpoint completo de Swift-1.5 ocupa 360 GB, por lo que el adaptador evita almacenar y cargar esa cantidad de pesos.
- VRAM para el base: no disponible en la información proporcionada.
- GPU recomendadas: la verificación se realizó en una NVIDIA H100 NVL; no se detallan otras GPU compatibles.
- Despliegue en `vLLM`: `vllm serve Qwen/Qwen3.8-Flash-Next --enable-lora --max-lora-rank 32 --lora-modules swift-1.5=nchapman/Qwen3.8-Flash-Next-Swift-1.5-LoRA`.
- Despliegue en `transformers`: `PeftModel.from_pretrained` sobre `AutoModelForImageTextToText` con `device_map="auto"`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nchapman/Qwen3.8-Flash-Next-Swift-1.5-LoRA` | LoRA r=32 sobre Qwen3.8-Flash-Next | ~310 MB (adaptador) | no disponible | Swift Open License 1.0 | Hugging Face |
| `ukisai/Swift1.5-Qwen3.8-Flash-Next` | Checkpoint completo | 360 GB | no disponible | Swift Open License 1.0 | Hugging Face |
| `Qwen/Qwen3.8-Flash-Next` | Modelo base | no disponible | no disponible | Apache-2.0 | Hugging Face |

El adaptador es funcionalmente equivalente a Swift-1.5 (99,21 % de acuerdo Top-1) con una huella de 310 MB frente a 360 GB, y conserva la licencia del modelo fuente, más restrictiva que la Apache-2.0 del base. No se dispone de datos de rendimiento de tareas para comparar con otras alternativas.

## Limitaciones y advertencias

- El adaptador reproduce el 96,1-97,3 % de los pesos modificados dentro de 1 ULP, pero no es una copia exacta: la divergencia KL residual es de 0,003185 nats en todos los tokens.
- La licencia Swift Open License 1.0 es distinta de la Apache-2.0 del base; conviene revisar las condiciones de uso comercial antes de desplegar el adaptador en producción.
- No se documentan idiomas soportados ni longitud de contexto, por lo que no se puede garantizar su comportamiento en contextos largos o en idiomas distintos del inglés.
- No hay datos de benchmarks de tareas (MMLU, HumanEval, GSM8K) ni de sesgos o tasas de alucinación.
- El adaptador depende del modelo base Qwen3.8-Flash-Next; cualquier cambio en el base invalida la reconstrucción espectral.
- El modelo base es MoE con 512 expertos enrutados y 354 GB de pesos; el coste de inferencia en VRAM sigue recayendo sobre el base, no sobre el adaptador.
- La verificación se limita a 64 prompts y 1528 posiciones de token en una H100 NVL; no hay validación a mayor escala publicada.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-13), por lo que carece de validación comunitaria.

## Enlaces

- Adaptador LoRA: https://huggingface.co/nchapman/Qwen3.8-Flash-Next-Swift-1.5-LoRA
- Modelo fuente Swift-1.5: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Licencia Swift Open License 1.0: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Dataset de evaluación: https://huggingface.co/datasets/mlabonne/harmless_alpaca
