# nchapman/Qwen3.5-4B-Heretic-LoRA

## Resumen

Qwen3.5-4B-Heretic-LoRA es un adaptador LoRA de tipo abliteration desarrollado por el usuario nchapman sobre el checkpoint base Qwen/Qwen3.5-4B. No se trata de un modelo entrenado desde cero, sino de una intervención quirúrgica sobre los pesos de un transformer de 4.000 millones de parámetros cuyo objetivo es eliminar el comportamiento de rechazo (refusal) ante peticiones que el modelo base considera dañinas. La técnica empleada es Heretic v2.1 con Magnitude-Preserving Orthogonal Ablation (MPOA) y rango reducido (r=3), aplicada sobre 64 proyecciones residuales del modelo.

El adaptador resulta relevante para investigadores que estudian alineamiento, mecanismos de refusal y técnicas de abliteration, así como para desarrolladores que necesitan un modelo sin filtros de contenido para tareas de red teaming, generación creativa sin restricciones o investigación sobre seguridad. Su principal atractivo técnico es que incluye una frontera de Pareto completa con cinco checkpoints que permiten elegir el equilibrio entre tasa de rechazo y divergencia KL respecto al modelo base, lo que convierte al repositorio en un recurso medible y reproducible en lugar de una simple modificación opaca.

El adaptador es compatible tanto con transformers + peft como con vLLM mediante `--enable-lora`, lo que permite activar y desactivar la abliteration por petición en un mismo servidor. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (peft) sobre transformer Qwen3.5-4B |
| Parámetros totales | 4B (modelo base); adaptador LoRA con rango r=3 sobre 64 módulos |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Compatible con BF16 (adaptador) y variantes cuantizadas del base como W4A16-HGPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3.5-4B, un transformer denso de 4.000 millones de parámetros. La intervención no reentrena el modelo: aplica Magnitude-Preserving Orthogonal Ablation (MPOA) con rango r=3 mediante SVD sobre 64 proyecciones que escriben en el flujo residual, concretamente `self_attn.o_proj`, `linear_attn.out_proj`, `mlp.down_proj` y `mlp.shared_expert.down_proj`. La normalización de filas es `full` y el método es Heretic v2.1 (`p-e-w/heretic`).

El proceso de extracción y evaluación se realizó sobre los conjuntos `mlabonne/harmless_alpaca` (train[:400] para extracción, test[:100] para evaluación) y `mlabonne/harmful_behaviors`. El modelo base mostraba 99/100 rechazos en la evaluación; el adaptador por defecto reduce esa cifra a 7/100 (7,0%) con una divergencia KL de primer token de 0,0955 nats sobre `harmless_alpaca` test[:100]. El barrido generó cinco checkpoints no dominados en la frontera de Pareto, desde 7% de rechazo con KL 0,0955 hasta 31% de rechazo con KL 0,0257, permitiendo seleccionar el compromiso fidelidad/abliteración según el caso de uso.

## Capacidades

- Generación de texto sin rechazos ante peticiones que el modelo base filtraría (7/100 refusals en el checkpoint por defecto).
- Razonamiento y generación de código heredados del modelo base Qwen3.5-4B.
- Compatibilidad con tool calling y function calling en la medida en que lo soporte el modelo base (no documentado en la model card).
- Capacidades multilingües del modelo base (idiomas no especificados en la ficha).
- Activación y desactivación por petición en vLLM: el mismo servidor puede servir el comportamiento abliterado y el baseline sin adaptador.
- Cinco checkpoints de Pareto con distintos equilibrios entre tasa de rechazo y divergencia KL.
- Compatible con checkpoints cuantizados del base (W4A16-HGPTQ, RCO) en vLLM.

## Casos de uso

- Red teaming y evaluación de seguridad: el adaptador permite generar respuestas que el modelo base rechazaría, lo que facilita construir conjuntos de datos de ataques y estudiar la robustez de clasificadores y filtros de contenido.
- Investigación sobre alineamiento y refusal: los cinco checkpoints de Pareto permiten medir cómo varía el comportamiento del modelo en función del grado de abliteration, con métricas reproducibles de refusals y KL.
- Generación creativa sin restricciones: escritura de ficción con violencia, contenido adulto o temas sensibles donde los filtros del modelo base interrumpen la generación.
- Servicio dual en producción: con vLLM y `--enable-lora` se puede ofrecer un endpoint "uncensored" y otro "baseline" en la misma instancia, seleccionando el adaptador mediante el campo `model` en peticiones OpenAI-compatible.
- Investigación de mecanismos internos: al actuar sobre proyecciones residuales concretas, el adaptador sirve para estudiar qué direcciones del espacio de activaciones codifican el comportamiento de rechazo.
- Experimentación con cuantización: al ser compatible con W4A16-HGPTQ, permite desplegar el modelo abliterado en GPUs de gama consumer con menor VRAM.
- Docencia y demostraciones: ilustra de forma práctica y medible qué es la abliteration y cómo se evalúa su coste en fidelidad respecto al modelo original.

## Benchmarks y rendimiento

| Métrica | Modelo base | Adaptador por defecto | trial_004 | trial_007 | trial_003 | trial_006 |
|---|---:|---:|---:|---:|---:|---:|
| Refusals (test[:100]) | 99/100 | 7/100 | 12/100 | 14/100 | 25/100 | 31/100 |
| Tasa de rechazo | 99,0% | 7,0% | 12,0% | 14,0% | 25,0% | 31,0% |
| KL primer token (nats) | 0 | 0,0955 | 0,0857 | 0,0470 | 0,0436 | 0,0257 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para el modelo base en BF16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica 10-12 GB para contexto moderado.
- VRAM estimada con cuantización W4A16: aproximadamente 2,5-3 GB para pesos, lo que permite ejecución en GPUs consumer de 8 GB.
- El adaptador LoRA en sí ocupa muy poco espacio (r=3 sobre 64 módulos) y se carga junto al base.
- GPUs recomendadas: A100/H100 para serving concurrente con vLLM; RTX 4090, 4080 o 3090 para uso individual; RTX 3060/4060 Ti de 8-12 GB con cuantización W4A16.
- Despliegue: vLLM con `--enable-lora --max-lora-rank 8`, transformers + peft, y presumiblemente llama.cpp/Ollama si se fusiona el adaptador al base y se convierte a GGUF (no documentado).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Abliteration | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Heretic-LoRA | 4B (base) + LoRA r=3 | no disponible | Sí, con Pareto de 5 checkpoints | Apache 2.0 | HF (nchapman) |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | No (99% refusals) | Apache 2.0 | HF (Qwen) |
| nchapman/Qwen3.5-4B-W4A16-HGPTQ | 4B cuantizado | no disponible | No (base cuantizado) | Apache 2.0 | HF (nchapman) |
| Adaptadores Heretic de la comunidad | Variable | Variable | Sí | Variable | HF |

No se dispone de datos de benchmarks comparativos con otros adaptadores de abliteration en la información proporcionada.

## Limitaciones y advertencias

- La abliteration elimina rechazos pero no garantiza la eliminación de contenido dañino real; el modelo puede generar respuestas inexactas, ofensivas o peligrosas sin señal de alerta.
- La divergencia KL de 0,0955 nats en el checkpoint por defecto implica una degradación medible de la distribución respecto al base; los checkpoints con menor KL preservan más fidelidad pero rechazan más.
- No hay datos publicados sobre benchmarks de capacidad (razonamiento, código, matemáticas) tras la abliteration, por lo que el impacto en tareas no relacionadas con refusal es desconocido.
- La model card no especifica idiomas soportados ni longitud de contexto del modelo base.
- El uso comercial está permitido por la licencia Apache 2.0, pero el despliegue de un modelo sin filtros puede incumplir políticas de plataformas, términos de servicio de proveedores cloud o normativa aplicable sobre contenido.
- Riesgo de alucinación heredado del modelo base, potencialmente agravado por la alteración de pesos.
- El adaptador está pensado para investigación; no se recomienda su uso directo en aplicaciones de cara al usuario sin capas adicionales de moderación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/nchapman/Qwen3.5-4B-Heretic-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Checkpoint cuantizado compatible: https://huggingface.co/nchapman/Qwen3.5-4B-W4A16-HGPTQ
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Dataset de extracción/evaluación: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset de comportamientos dañinos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
