# nchapman/Qwen3.5-2B-Heretic-LoRA

## Resumen

Qwen3.5-2B-Heretic-LoRA es un adaptador LoRA de "abliteración" (eliminación de la dirección de rechazo en el espacio de activaciones) creado por nchapman sobre el checkpoint base Qwen/Qwen3.5-2B. El adaptador se genera con la herramienta Heretic v2.1 aplicando Magnitude-Preserving Orthogonal Ablation (MPOA) con rango r=3 sobre 44 proyecciones residuales del modelo base, con el objetivo de reducir la tasa de rechazos del modelo ante peticiones que el modelo original declinaría. El autor reporta una reducción de rechazos de 96/100 en el modelo base a 5/100 con el adaptador por defecto, manteniendo una divergencia KL de primer token de 0,0593 nats sobre el conjunto harmless_alpaca.

El modelo es relevante para investigadores y desarrolladores que necesitan evaluar el comportamiento de modelos abliterados, estudiar la fidelidad de la ablación ortogonal o desplegar variantes sin filtros de rechazo en entornos controlados. El adaptador es compatible tanto con el checkpoint oficial en BF16 como con variantes cuantizadas (W4A16-HGPTQ, RCO) en vLLM con `--enable-lora`, y con llama.cpp mediante el GGUF LoRA incluido.

La ficha se basa exclusivamente en la información disponible en Hugging Face y en la model card del autor; los parámetros totales reportados en safetensors (811.008) corresponden al adaptador LoRA, no al modelo base completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-2B; ablación ortogonal MPOA r=3 |
| Parámetros totales | 811.008 (adaptador LoRA); modelo base Qwen3.5-2B no especificado en la información disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Compatible con BF16, W4A16-HGPTQ (variante del autor) y GGUF (adaptador convertido) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (LoRA PEFT) y GGUF (adaptador llama.cpp) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3.5-2B mediante la herramienta Heretic v2.1, que implementa Magnitude-Preserving Orthogonal Ablation (MPOA). El proceso extrae direcciones de rechazo con SVD de rango r=3 sobre 44 módulos de proyección que escriben en el residual: `self_attn.o_proj`, `linear_attn.out_proj`, `mlp.down_proj` y `mlp.shared_expert.down_proj`. La normalización de filas es `full` y el adaptador se entrena en BF16. La extracción se realiza sobre `mlabonne/harmless_alpaca` (train[:400]) y la evaluación sobre `test[:100]` de `mlabonne/harmless_alpaca` y `mlabonne/harmful_behaviors`.

El autor publica varios checkpoints en la frontera de Pareto, cada uno con un compromiso distinto entre tasa de rechazos y divergencia KL de primer token: `trial_001` (5/100 rechazos, 0,0593 nats, valor por defecto en la raíz), `trial_003` (9/100, 0,0425 nats) y `trial_004` (12/100, 0,0266 nats). El adaptador GGUF incluye reordenamiento de cabezas V de GatedDeltaNet en `blk.*.ssm_out.weight.lora_a` para compatibilidad con llama.cpp bajo arquitectura `qwen35`. No se detalla en la información disponible el número de tokens de entrenamiento del modelo base ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.5-2B.
- Reducción de rechazos: 5/100 en el adaptador por defecto frente a 96/100 del modelo base, según la model card.
- Compatibilidad con vLLM mediante `--enable-lora` y conmutación por petición usando el nombre del módulo LoRA en el campo `model`.
- Compatibilidad con llama.cpp mediante `llama-server --lora` y GGUF preconvertido.
- Compatibilidad con transformers + peft.
- Funcionamiento sobre checkpoints cuantizados (W4A16-HGPTQ y RCO) además del BF16 oficial.
- Selección de checkpoint en la frontera de Pareto para ajustar el compromiso rechazos/fidelidad.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo thinking específicas del adaptador; estas dependerían del modelo base.

## Casos de uso

- Investigación sobre abliteración: comparar la tasa de rechazos y la divergencia KL entre el modelo base y los distintos checkpoints de Pareto para estudiar el compromiso entre supresión de rechazos y fidelidad de comportamiento.
- Evaluación de robustez de salvaguardas: desplegar el adaptador en un entorno aislado para medir cómo afecta la ablación ortogonal a las respuestas del modelo base y documentar riesgos.
- Despliegue con conmutación por petición en vLLM: servir simultáneamente el modelo base y el adaptador en la misma instancia y seleccionar el comportamiento por petición mediante el campo `model` en la API compatible con OpenAI.
- Experimentación en hardware de consumo: usar el GGUF LoRA con `llama-server` sobre el modelo base cuantizado (por ejemplo `UD-Q4_K_XL`) para pruebas locales con `-ngl 99`.
- Análisis de fidelidad: emplear los checkpoints `trial_003` y `trial_004` con menor KL para tareas donde se prioriza preservar el comportamiento del modelo base frente a la máxima reducción de rechazos.
- Integración en pipelines de transformers + peft: cargar el adaptador sobre el checkpoint oficial BF16 para experimentos de investigación reproducibles.
- Estudio de métodos de ablación: comparar MPOA con r=3 frente a otras técnicas de abliteración sobre el mismo modelo base.

## Benchmarks y rendimiento

| Métrica | Modelo base | Adaptador por defecto | trial_003 | trial_004 |
|---|---|---|---|---|
| Rechazos (test[:100]) | 96/100 | 5/100 (5,0 %) | 9/100 (9,0 %) | 12/100 (12,0 %) |
| KL de primer token (nats, harmless_alpaca test[:100]) | 0 (referencia) | 0,0593 | 0,0425 | 0,0266 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para el adaptador ni para el modelo base.

## Requisitos de hardware

- El adaptador LoRA en safetensors ocupa 0,0 GB según el tamaño del repo; el modelo base Qwen3.5-2B requiere su propio espacio en VRAM o RAM.
- Con el modelo base en BF16, la VRAM estimada para inferencia ronda los 4-5 GB solo para pesos, más overhead de contexto y activaciones; no disponible como cifra oficial en la información proporcionada.
- Con cuantización W4A16-HGPTQ o GGUF Q4, el modelo base puede caber en GPUs de consumo con 6-8 GB de VRAM; no se confirma cifra exacta en la información disponible.
- GPUs recomendadas: no disponible de forma explícita; por tamaño del modelo base (2B), es viable en RTX 3060/4060/4090 y GPUs de datacenter como A100/H100 para despliegues con concurrencia.
- Opciones de despliegue documentadas: vLLM (`--enable-lora`, `--max-lora-rank 8`), llama.cpp (`llama-server --lora`), transformers + peft.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rechazos | Licencia |
|---|---|---|---|---|---|
| nchapman/Qwen3.5-2B-Heretic-LoRA | LoRA abliterado sobre Qwen3.5-2B | 811.008 (adaptador) | no disponible | 5/100 | apache-2.0 |
| Qwen/Qwen3.5-2B (base) | Modelo base | no disponible | no disponible | 96/100 | no disponible en la información |
| Otros adaptadores Heretic sobre modelos de 2B | LoRA abliterado | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos comparativos con otros adaptadores de abliteración ni con modelos de la misma categoría; la comparativa se limita al modelo base y a los checkpoints de Pareto del propio autor.

## Limitaciones y advertencias

- La abliteración elimina la dirección de rechazo, lo que puede aumentar la probabilidad de generar contenido dañino, sesgado o inseguro; el adaptador no debe desplegarse en producción orientada a usuarios sin salvaguardas externas.
- La divergencia KL de primer token de 0,0593 nats en el adaptador por defecto indica un cambio medible en la distribución de salida respecto al modelo base, con posible degradación de fidelidad en tareas generales.
- Los checkpoints de Pareto ofrecen menor reducción de rechazos a cambio de menor KL; la elección depende del caso de uso y no hay guía del autor sobre umbrales aceptables.
- No se documentan sesgos específicos, idiomas soportados ni comportamiento multilingüe en la información disponible.
- La licencia apache-2.0 del adaptador no exime del cumplimiento de las políticas de uso del modelo base Qwen3.5-2B ni de la legislación aplicable sobre contenido generado.
- El adaptador requiere cargar el modelo base; el tamaño del repo (0,0 GB) no incluye los pesos del base.
- No se han publicado benchmarks estándar de calidad (MMLU, HumanEval, GSM8K) que permitan evaluar la degradación en tareas generales.
- La compatibilidad con llama.cpp depende de la arquitectura `qwen35` y del reordenamiento de cabezas V de GatedDeltaNet incluido; versiones antiguas de llama.cpp pueden no soportarlo.

## Enlaces

- Hugging Face: https://huggingface.co/nchapman/Qwen3.5-2B-Heretic-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante cuantizada del autor: https://huggingface.co/nchapman/Qwen3.5-2B-W4A16-HGPTQ
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Dataset de extracción/evaluación: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset de evaluación: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- GGUF del modelo base para llama.cpp: https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
