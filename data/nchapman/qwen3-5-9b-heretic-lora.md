# nchapman/Qwen3.5-9B-Heretic-LoRA

## Resumen

Qwen3.5-9B-Heretic-LoRA es un adaptador LoRA de abliteracion (eliminacion de la capa de rechazo) sobre el modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario nchapman. Se genera con la herramienta Heretic v2.1 (`p-e-w/heretic`) aplicando una tecnica denominada Magnitude-Preserving Orthogonal Ablation (MPOA) con rango SVD `r=3` sobre 64 proyecciones residuales del transformer. El objetivo es reducir la tasa de rechazos del modelo ante peticiones que el modelo base declina, manteniendo la mayor fidelidad posible respecto a la distribucion original.

El adaptador se distribuye como un LoRA PEFT en BF16, lo que permite cargarlo sobre el checkpoint oficial de Qwen3.5-9B o sobre variantes cuantizadas (por ejemplo W4A16-HGPTQ) tanto en vLLM con `--enable-lora` como en transformers + peft. Incluye una coleccion de checkpoints en la frontera de Pareto que permiten elegir el equilibrio entre tasa de rechazo y divergencia KL respecto al modelo base.

La relevancia actual radica en que ofrece un mecanismo de abliteracion medido y reproducible, con metricas explicitas de rechazo y divergencia, y con la posibilidad de activar o desactivar el adaptador por peticion en un mismo servidor vLLM, lo que facilita desplegar comportamiento "sin filtros" solo cuando se necesita sin renunciar al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-9B; ablacion ortogonal MPOA, rango SVD r=3 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3.5-9B tiene 9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-9B, no especificada) |
| Tipos de cuantizacion | adaptador en BF16; compatible con variantes cuantizadas del base (W4A16-HGPTQ, RCO) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA); libreria peft |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3.5-9B mediante Heretic v2.1. La tecnica aplicada es Magnitude-Preserving Orthogonal Ablation (MPOA) con normalizacion de filas `full` y descomposicion SVD de rango `r=3`. La ablacion actua sobre 64 modulos objetivo: proyecciones `self_attn.o_proj`, `linear_attn.out_proj`, `mlp.down_proj` y `mlp.shared_expert.down_proj`, es decir, las proyecciones que escriben en el flujo residual. El adaptador resultante es un LoRA en BF16.

El proceso de extraccion y evaluacion usa `train[:400]` y `test[:100]` de los conjuntos `mlabonne/harmless_alpaca` y `mlabonne/harmful_behaviors`. Sobre el checkpoint por defecto se reportan 7/100 rechazos (7,0 %) frente a 100/100 del modelo base, con una divergencia KL de primer token de 0,1461 nats medida en `harmless_alpaca` `test[:100]`. El repositorio incluye ademas nueve checkpoints no dominados en `pareto/`, desde 0/100 rechazos con KL 2,1261 nats hasta 37/100 rechazos con KL 0,0324 nats, lo que permite seleccionar el compromiso entre supresion de rechazos y fidelidad al modelo original.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Qwen3.5-9B.
- Reduccion medida de la tasa de rechazo: 7/100 por defecto frente a 100/100 del base, con opciones de 0/100 en el checkpoint `pareto/trial_013`.
- Activacion y desactivacion por peticion en vLLM: el adaptador se expone como modulo LoRA (`--lora-modules uncensored=...`) y se selecciona mediante el campo `model` en peticiones OpenAI-compatibles.
- Compatibilidad con checkpoints cuantizados del base (W4A16-HGPTQ y RCO) en vLLM y con transformers + peft.
- Seleccion configurable del punto de la frontera de Pareto segun la tolerancia a la divergencia KL.
- No se documentan capacidades adicionales (tool calling, vision, audio, thinking mode) en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y abliteracion: permite estudiar como varia la tasa de rechazo en funcion de la divergencia KL usando los checkpoints de `pareto/`, con metricas reproducibles sobre `harmless_alpaca` y `harmful_behaviors`.
- Despliegue con comportamiento dual en un mismo servidor: con `--enable-lora` se puede atender trafico con el modelo base (peticiones que usan el nombre del base) y trafico con el adaptador (peticiones con `"model": "uncensored"`), sin levantar dos instancias.
- Evaluacion de robustez de filtros de seguridad: comparar respuestas del base y del adaptador sobre el mismo prompt para medir el efecto de la ablacion en un pipeline de red teaming controlado.
- Generacion creativa sin rechazos en dominios sensibles (ficcion, narrativa adulta, dialogos de personajes) donde el modelo base declina sistematicamente, aceptando la perdida de fidelidad medida por KL.
- Analisis de sesgos y comportamiento: cuantificar como cambia la distribucion de salida (KL de primer token de 0,1461 nats por defecto) y que tipo de contenido emerge al reducir rechazos, con fines de auditoria.
- Prototipado con vLLM sobre hardware con cuantizacion: cargar el adaptador sobre `nchapman/Qwen3.5-9B-W4A16-HGPTQ` con `--trust-remote-code` para reducir requisitos de VRAM manteniendo la ablacion.
- Ajuste fino posterior: usar el LoRA como punto de partida (rango 3, BF16) para tareas especificas que requieran partir de un modelo con menor tasa de rechazo.

## Benchmarks y rendimiento

| Metrica | Modelo base | Adaptador por defecto | Mejor checkpoint Pareto (0 rechazos) |
|---|---|---|---|
| Rechazos (`test[:100]`) | 100/100 | 7/100 (7,0 %) | 0/100 (0,0 %) |
| Divergencia KL primer token (nats) | 0 (referencia) | 0,1461 | 2,1261 |

Frontera de Pareto completa reportada por el autor:

| Checkpoint | Rechazos | Tasa | KL (nats) |
|---|---:|---:|---:|
| `pareto/trial_013_ref0_kl2.1261` | 0/100 | 0,0 % | 2,1261 |
| `pareto/trial_010_ref5_kl0.3072` | 5/100 | 5,0 % | 0,3072 |
| `pareto/trial_008_ref7_kl0.1461` (por defecto) | 7/100 | 7,0 % | 0,1461 |
| `pareto/trial_007_ref12_kl0.1073` | 12/100 | 12,0 % | 0,1073 |
| `pareto/trial_011_ref18_kl0.0860` | 18/100 | 18,0 % | 0,0860 |
| `pareto/trial_005_ref26_kl0.0703` | 26/100 | 26,0 % | 0,0703 |
| `pareto/trial_002_ref32_kl0.0554` | 32/100 | 32,0 % | 0,0554 |
| `pareto/trial_001_ref34_kl0.0492` | 34/100 | 34,0 % | 0,0492 |
| `pareto/trial_003_ref37_kl0.0324` | 37/100 | 37,0 % | 0,0324 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es de rango 3 y BF16, por lo que su huella en VRAM es minima en comparacion con el modelo base; el requisito dominante es el del checkpoint Qwen3.5-9B subyacente.
- VRAM estimada para el base en BF16: aproximadamente 18 GB de pesos, mas overhead de KV cache; no se dispone de cifras oficiales en la informacion proporcionada.
- Con la variante cuantizada `nchapman/Qwen3.5-9B-W4A16-HGPTQ` el requisito de VRAM se reduce notablemente, aunque no se especifica el valor exacto.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano del base (9B) es plausible su ejecucion en GPUs de 24 GB en cuantizacion, pero no se confirma.
- Despliegue soportado: vLLM con `--enable-lora --max-lora-rank 8` y transformers + peft. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Tasa de rechazo | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-9B-Heretic-LoRA (este) | Qwen3.5-9B | LoRA r=3 sobre 9B | no disponible | 7/100 por defecto | apache-2.0 |
| Qwen/Qwen3.5-9B (base) | - | 9B | no disponible | 100/100 | no disponible en la informacion |
| Otros adaptadores de abliteracion | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores de abliteracion comparables en la busqueda proporcionada.

## Limitaciones y advertencias

- La abliteracion elimina la capa de rechazo del modelo: puede generar contenido sensible, ofensivo o danino. No debe desplegarse en aplicaciones de cara al publico sin filtros externos.
- La divergencia KL de primer token de 0,1461 nats en el checkpoint por defecto implica un cambio medible en la distribucion de salida; los checkpoints con menos rechazos presentan KL mucho mayor (hasta 2,1261 nats), lo que puede degradar la coherencia y el rendimiento general.
- Las metricas de rechazo y KL se miden sobre `mlabonne/harmless_alpaca` y `mlabonne/harmful_behaviors` con `test[:100]`, una muestra pequena; los resultados pueden no generalizar a otros dominios o idiomas.
- No se especifican los idiomas soportados; se desconoce el comportamiento multilingue del adaptador.
- No se documentan sesgos conocidos ni evaluaciones de seguridad adicionales.
- Licencia apache-2.0 declarada en el adaptador; conviene verificar la licencia del modelo base Qwen3.5-9B antes de uso comercial.
- No se han publicado benchmarks estandar de calidad (MMLU, HumanEval, GSM8K) que permitan cuantificar la degradacion en tareas generales.
- Compatibilidad declarada con variantes cuantizadas (W4A16-HGPTQ, RCO) y con vLLM; no se garantiza en otros runtimes.

## Enlaces

- Hugging Face: https://huggingface.co/nchapman/Qwen3.5-9B-Heretic-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Variante cuantizada mencionada: https://huggingface.co/nchapman/Qwen3.5-9B-W4A16-HGPTQ
- Dataset de evaluacion (harmless): https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset de evaluacion (harmful): https://huggingface.co/datasets/mlabonne/harmful_behaviors
