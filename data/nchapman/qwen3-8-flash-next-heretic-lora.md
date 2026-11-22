# nchapman/Qwen3.8-Flash-Next-Heretic-LoRA

## Resumen

Qwen3.8-Flash-Next-Heretic-LoRA es un adaptador LoRA de tipo *abliteration* (eliminación de mecanismos de rechazo) entrenado sobre el modelo base Qwen/Qwen3.8-Flash-Next. Lo desarrolla el usuario nchapman y emplea la herramienta Heretic v2.1 con la técnica Magnitude-Preserving Orthogonal Ablation (MPOA) con rango 1. El objetivo es reducir la tasa de rechazos del modelo base ante peticiones que este declinaría, preservando al máximo la fidelidad de la distribución de salida original. Según la model card, el adaptador reduce los rechazos del 99/100 del baseline al 6/100, con una divergencia KL de primer token de 0,3359 nats sobre `mlabonne/harmless_alpaca`.

El adaptador tiene 79.214.592 parámetros (pesos LoRA en safetensors, BF16) y un tamaño de repositorio de 3,2 GB. Se distribuye también en formato GGUF para llama.cpp y es compatible con vLLM mediante `--enable-lora`, incluyendo checkpoints cuantizados del modelo base (W4A16-HGPTQ y RCO). La licencia es Apache 2.0.

La relevancia actual del artefacto es doble: por un lado, demuestra un flujo reproducible de abliteration con evaluación Pareto de compromiso entre rechazos y fidelidad; por otro, permite activar o desactivar el comportamiento "uncensored" por petición en un mismo servidor vLLM, lo que facilita comparaciones controladas entre el modelo base y la variante ablacionada sin desplegar dos servicios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer híbrido Qwen3.8-Flash-Next (atención completa + `linear_attn` / GatedDeltaNet, MoE con `shared_expert`) |
| Parametros totales | 79.214.592 (pesos del adaptador LoRA) |
| Parametros activos | no disponible (depende del modelo base) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.8-Flash-Next; no se especifica en la información proporcionada) |
| Tipos de cuantizacion | BF16 (adaptador); compatible con bases cuantizadas W4A16-HGPTQ y GGUF (p. ej. UD-IQ4_XS) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) y GGUF (adaptador LoRA para llama.cpp) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 1 obtenido mediante Heretic v2.1 con la técnica Magnitude-Preserving Orthogonal Ablation (MPOA), una variante de abliteration que proyecta ortogonalmente las direcciones de rechazo preservando la magnitud de las activaciones. Se aplica sobre 144 proyecciones de escritura residual del modelo base: `self_attn.o_proj`, `linear_attn.out_proj`, `mlp.down_proj` y `mlp.shared_expert.down_proj`. La normalización de filas está desactivada (`none`) y la descomposición usa SVD con `r=1`.

El proceso de extracción y evaluación se realizó sobre `mlabonne/harmless_alpaca` (`train[:400]` para extracción, `test[:100]` para evaluación) y `mlabonne/harmful_behaviors`. El repositorio incluye una frontera de Pareto con ocho checkpoints no dominados que trazan el compromiso entre tasa de rechazo y divergencia KL de primer token, desde 6/100 rechazos con 0,3359 nats hasta 88/100 rechazos con 0,0139 nats. El checkpoint por defecto (raíz del repo) corresponde al trial 7.

## Capacidades

- Generación de texto condicionada por el modelo base Qwen3.8-Flash-Next, con la distribución de salida alterada solo en la dirección de rechazo.
- Reducción drástica de respuestas de rechazo: del 99/100 del baseline al 6/100 con el adaptador por defecto.
- Control granular del grado de abliteration mediante los checkpoints de la frontera de Pareto (8 niveles de compromiso rechazo/fidelidad).
- Activación por petición en vLLM: el mismo servidor puede atender peticiones con el adaptador (`"model": "uncensored"`) o con el baseline sin adaptar.
- Compatibilidad con checkpoints cuantizados del modelo base (W4A16-HGPTQ, RCO) en vLLM y con GGUF en llama.cpp.
- Adaptador GGUF para llama.cpp con arquitectura `qwen4exp`, incluyendo reordenación de cabezas V de GatedDeltaNet en `blk.*.ssm_out.weight.lora_a`.
- Capacidades del modelo base (tool calling, agentes, multilingüismo, etc.): no disponibles en la información proporcionada.

## Casos de uso

- Investigación en seguridad y alineación: comparar respuestas del modelo base y del adaptador sobre el mismo prompt en un único servidor vLLM permite aislar el efecto de la abliteration sin variaciones de infraestructura.
- Evaluación de robustez de filtros: medir cómo cambia la tasa de rechazo y la calidad en tareas benignas usando los distintos checkpoints de la frontera de Pareto como niveles de intervención controlados.
- Generación creativa sin fricción: escritura de ficción, guiones o role-play donde el modelo base rechazaría escenas violentas o controvertidas; el adaptador reduce rechazos manteniendo una KL baja (0,3359 nats) sobre prompts benignos.
- Despliegue con cuantización agresiva: combinación con `nchapman/Qwen3.8-Flash-Next-W4A16-HGPTQ` en vLLM o con `unsloth/Qwen3.8-Flash-Next-GGUF:UD-IQ4_XS` en llama.cpp para servir el adaptador en hardware con VRAM limitada.
- Red teaming interno: uso del adaptador como generador de respuestas no filtradas para construir datasets de entrenamiento de clasificadores de seguridad o de moderación.
- Experimentación con abliteration reproducible: el repositorio documenta método, módulos objetivo, dataset y métricas, lo que permite replicar el pipeline Heretic v2.1 sobre otros checkpoints de la familia Qwen.
- Evaluación de fidelidad post-abliteration: la KL de primer token y las tasas de rechazo por checkpoint permiten estudiar la degradación de capacidades en función del grado de intervención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas publicadas son las de abliteration y fidelidad:

| Checkpoint | Rechazos (`test[:100]`) | Tasa de rechazo | KL primer token (nats) |
|---|---:|---:|---:|
| `pareto/trial_007_ref6_kl0.3359` (raíz) | 6/100 | 6,0 % | 0,3359 |
| `pareto/trial_008_ref10_kl0.3171` | 10/100 | 10,0 % | 0,3171 |
| `pareto/trial_006_ref17_kl0.1104` | 17/100 | 17,0 % | 0,1104 |
| `pareto/trial_004_ref37_kl0.0925` | 37/100 | 37,0 % | 0,0925 |
| `pareto/trial_003_ref45_kl0.0675` | 45/100 | 45,0 % | 0,0675 |
| `pareto/trial_002_ref60_kl0.0613` | 60/100 | 60,0 % | 0,0613 |
| `pareto/trial_001_ref79_kl0.0287` | 79/100 | 79,0 % | 0,0287 |
| `pareto/trial_005_ref88_kl0.0139` | 88/100 | 88,0 % | 0,0139 |
| Baseline (sin adaptador) | 99/100 | 99,0 % | 0 (referencia) |

## Requisitos de hardware

- VRAM del adaptador: 79.214.592 parámetros en BF16 equivalen a aproximadamente 0,16 GB de pesos; el tamaño del repo (3,2 GB) incluye los ocho checkpoints Pareto y los GGUF.
- VRAM total: dominada por el modelo base Qwen3.8-Flash-Next, cuyo tamaño no se especifica en la información proporcionada; no es posible estimar VRAM de inferencia sin ese dato.
- GPU recomendadas: no disponibles para el modelo base; el adaptador en sí es marginal en memoria.
- GPU de consumo: la viabilidad depende enteramente del modelo base y de su cuantización. Con `UD-IQ4_XS` en llama.cpp (`-ngl 99`) el límite lo marca el checkpoint GGUF del base, no el adaptador.
- Despliegue: vLLM con `--enable-lora --max-lora-rank 8 --lora-modules uncensored=<repo>`; llama.cpp con `llama-server --lora Qwen3.8-Flash-Next-Heretic-LoRA.gguf`; transformers + peft.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| nchapman/Qwen3.8-Flash-Next-Heretic-LoRA | LoRA de abliteration | 79,2 M (adaptador) | no disponible | Apache 2.0 | 8 checkpoints Pareto; vLLM y llama.cpp |
| Qwen/Qwen3.8-Flash-Next (base) | Modelo completo | no disponible | no disponible | no disponible | Baseline sin ablacionar (99/100 rechazos) |
| nchapman/Qwen3.8-Flash-Next-W4A16-HGPTQ | Cuantización del base | no disponible | no disponible | no disponible | Compatible con este adaptador en vLLM |

No se dispone de información sobre otros adaptadores de abliteration comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La abliteration elimina la dirección de rechazo, no el conocimiento subyacente: el modelo puede producir contenido dañino, ilegal o inseguro que el base declinaría. No debe desplegarse en aplicaciones de cara al público sin moderación externa.
- La KL de primer token de 0,3359 nats en el checkpoint por defecto indica una desviación no trivial respecto al base; puede degradar sutilmente la calidad en tareas benignas. Los checkpoints con menor KL (p. ej. 0,0139 nats) preservan más fidelidad a costa de más rechazos.
- Los datos de evaluación (100 ejemplos de `harmless_alpaca`/`harmful_behaviors`) son una muestra pequeña; las tasas de rechazo tienen alta varianza estadística.
- No hay benchmarks de capacidades (razonamiento, código, matemáticas) publicados para verificar que el adaptador no degrada el rendimiento del base.
- Idiomas soportados no especificados; el comportamiento de la abliteration puede variar entre idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ablacionado; la responsabilidad legal del contenido generado recae en el desplegador.
- La compatibilidad con variantes cuantizadas del base (W4A16-HGPTQ, RCO, GGUF) está declarada por el autor, pero no se documentan pruebas exhaustivas de cada combinación.
- El adaptador depende de la arquitectura exacta del base (`qwen4exp`, GatedDeltaNet); no es portable a otros modelos.

## Enlaces

- Hugging Face: https://huggingface.co/nchapman/Qwen3.8-Flash-Next-Heretic-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización compatible: https://huggingface.co/nchapman/Qwen3.8-Flash-Next-W4A16-HGPTQ
- GGUF del base: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Heretic: https://github.com/p-e-w/heretic
- Dataset de evaluación: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset de evaluación: https://huggingface.co/datasets/mlabonne/harmful_behaviors
