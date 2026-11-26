# nchapman/Qwen3.5-9B-Heretic-LoRA

## Resumen

Qwen3.5-9B-Heretic-LoRA es un adaptador LoRA de tipo «abliteration» desarrollado por el usuario nchapman sobre el modelo base Qwen/Qwen3.5-9B. Su objetivo es reducir la tasa de rechazos (refusals) del modelo original ante peticiones que el alineamiento de seguridad bloquearía, preservando en la medida de lo posible la fidelidad del modelo base. Se trata, por tanto, de una herramienta de modificación de comportamiento, no de un modelo autónomo.

El adaptador se ha generado con la herramienta Heretic v2.1 aplicando la técnica Magnitude-Preserving Orthogonal Ablation (MPOA) con rango r=3 sobre 64 proyecciones residuales del transformer. El autor publica una «carta de fidelidad» con métricas medibles: tasa de rechazo del 7,0 % (7/100) frente al 100/100 del modelo base, y una divergencia KL de primer token de 0,1461 nats sobre el conjunto harmless_alpaca. Además, se incluyen varios checkpoints en la frontera de Pareto que permiten elegir el equilibrio entre supresión de rechazos y fidelidad.

El adaptador es relevante para quienes necesitan desplegar Qwen3.5-9B en escenarios donde el filtrado de seguridad del modelo base resulta demasiado restrictivo (investigación de robustez, generación creativa sin restricciones, evaluación de sesgos, etc.). Se distribuye en formato PEFT (safetensors) y GGUF, es compatible con vLLM (con `--enable-lora`) y con llama.cpp, y permite alternar por petición entre el comportamiento con y sin adaptador en un mismo servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3.5-9B con atención híbrida (self_attn + linear_attn / GatedDeltaNet) y capas MoE con shared_expert |
| Parametros totales | 2.359.296 parámetros del adaptador (modelo base: 9B, según nomenclatura) |
| Parametros activos | No aplica al adaptador; el modelo base es MoE (no se especifica el número de parámetros activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Compatible con variantes cuantizadas del base (p. ej. W4A16 HGPTQ); GGUF del adaptador incluido para llama.cpp |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (PEFT/LoRA) y GGUF (LoRA para llama.cpp) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3.5-9B, un transformer con atención híbrida que combina `self_attn.o_proj`, `linear_attn.out_proj` (GatedDeltaNet) y proyecciones de salida de MLP, incluyendo `mlp.shared_expert.down_proj` en las capas MoE. La técnica aplicada es Magnitude-Preserving Orthogonal Ablation (MPOA) con descomposición SVD de rango r=3 y normalización de filas «full», implementada en Heretic v2.1. Se intervienen 64 proyecciones que escriben en el flujo residual, lo que permite eliminar direcciones asociadas al comportamiento de rechazo sin destruir la magnitud de las activaciones.

El proceso de extracción se realizó sobre `train[:400]` de los conjuntos `mlabonne/harmless_alpaca` y `mlabonne/harmful_behaviors`, y la evaluación sobre `test[:100]` de los mismos. No se documenta un entrenamiento con RLHF/DPO ni un corpus de preentrenamiento propio: el adaptador es una modificación post-hoc del modelo base. El autor publica además una frontera de Pareto con nueve checkpoints que ofrecen distintos compromisos entre tasa de rechazo (0 % a 37 %) y divergencia KL (2,1261 a 0,0324 nats), lo que permite seleccionar el punto de operación según el caso de uso.

## Capacidades

- Hereda las capacidades del modelo base Qwen3.5-9B: generación de texto, razonamiento, código y matemáticas (no se detallan métricas concretas en la información disponible).
- Supresión del comportamiento de rechazo: reduce la tasa de rechazo del 100 % al 7 % por defecto, con opciones de 0 % a 37 % en los checkpoints de Pareto.
- Compatibilidad con tool calling / function calling: no se especifica explícitamente para el adaptador; depende de las capacidades del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: alternancia por petición entre comportamiento con y sin adaptador en vLLM; conversión GGUF con reordenamiento de cabezas V de GatedDeltaNet (`blk.*.ssm_out.weight.lora_a`).

## Casos de uso

- Investigación en seguridad y robustez de LLM: el adaptador permite comparar el comportamiento de Qwen3.5-9B con y sin alineamiento de rechazo sobre el mismo servidor vLLM, aislando el efecto del filtrado en evaluaciones de jailbreak y de sesgo.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles (violencia, temas adultos) donde el modelo base rechazaría la petición; el checkpoint de Pareto con 0 % de rechazos y KL 2,1261 es el más agresivo.
- Evaluación de daño y red-teaming: uso del adaptador como modelo «no alineado» de referencia para medir la eficacia de clasificadores de seguridad o de filtros de contenido en pipelines de moderación.
- Despliegue con alternancia por petición: en vLLM se puede servir el modelo base y el adaptador en la misma instancia (`--lora-modules uncensored=...`) y seleccionar el comportamiento mediante el campo `model` en `/v1/chat/completions`, útil para A/B testing controlado.
- Inferencia en hardware de consumo: el adaptador GGUF para llama.cpp permite aplicar la modificación sobre una cuantización UD-Q4_K_XL del base con `-ngl 99`, reduciendo los requisitos de VRAM frente a la versión BF16.
- Ajuste fino del equilibrio fidelidad/supresión: los checkpoints de Pareto permiten elegir, por ejemplo, 18 % de rechazos con KL 0,0860 nats para aplicaciones donde se tolera cierta tasa de rechazo a cambio de menor deriva respecto al base.

## Benchmarks y rendimiento

| Metrica | Modelo base | Adaptador por defecto | Mejor checkpoint Pareto (0 % rechazos) |
|---|---|---|---|
| Tasa de rechazo (`test[:100]`) | 100/100 (100 %) | 7/100 (7,0 %) | 0/100 (0,0 %) |
| Divergencia KL de primer token (nats) | 0 (referencia) | 0,1461 | 2,1261 |

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen3.5-9B y de su cuantización; el adaptador LoRA añade solo 2,36 M de parámetros (0,1 GB en el repo), por lo que el coste adicional es despreciable.
- GPU recomendadas: A100 o H100 para servir el base en BF16 con vLLM; RTX 4090 (24 GB) viable con cuantizaciones del base; el adaptador GGUF sobre UD-Q4_K_XL permite ejecución en GPUs de consumo con llama.cpp.
- Cabe en GPU de consumo: sí, aplicando el adaptador GGUF sobre una cuantización del base en llama.cpp con `-ngl 99`.
- Opciones de despliegue: vLLM (`--enable-lora --max-lora-rank 8 --lora-modules`), transformers + peft, llama.cpp (`llama-server --lora`), y variantes cuantizadas del base como `nchapman/Qwen3.5-9B-W4A16-HGPTQ`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Heretic-LoRA (este) | 2,36 M (adaptador sobre 9B) | No disponible | 7 % (defecto); 0–37 % en Pareto | Apache 2.0 | Hugging Face (PEFT + GGUF) |
| Qwen/Qwen3.5-9B (base) | 9B | No disponible | 100 % | Apache 2.0 | Hugging Face |
| nchapman/Qwen3.5-9B-W4A16-HGPTQ | 9B (cuantizado) | No disponible | No disponible | No disponible | Hugging Face (compatible con el adaptador) |

No se dispone de datos de otros adaptadores de abliteration comparables en la información proporcionada.

## Limitaciones y advertencias

- El adaptador elimina parcialmente el alineamiento de seguridad del modelo base: puede generar contenido dañino, ofensivo o ilegal según el contexto; no debe desplegarse en aplicaciones de cara al público sin filtros adicionales.
- La supresión de rechazos no es total en el checkpoint por defecto (7 %); el checkpoint con 0 % de rechazos presenta una divergencia KL de 2,1261 nats, lo que implica una deriva notable respecto al comportamiento del base y posible degradación de capacidades.
- Sesgos conocidos: no documentados explícitamente; hereda los del modelo base Qwen3.5-9B.
- Riesgo de alucinación: no evaluado en la información disponible.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del adaptador; la responsabilidad legal del contenido generado recae en el desplegador.
- La compatibilidad con variantes cuantizadas del base (W4A16 HGPTQ, RCO) está declarada por el autor, pero no se aportan métricas de fidelidad para esas combinaciones.
- El adaptador GGUF requiere reordenamiento de cabezas V de GatedDeltaNet; usar conversiones no oficiales puede producir resultados incorrectos.

## Enlaces

- Hugging Face: https://huggingface.co/nchapman/Qwen3.5-9B-Heretic-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante cuantizada compatible: https://huggingface.co/nchapman/Qwen3.5-9B-W4A16-HGPTQ
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Dataset harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Cuantización GGUF del base: https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
