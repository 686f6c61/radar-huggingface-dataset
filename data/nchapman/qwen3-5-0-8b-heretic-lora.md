# nchapman/Qwen3.5-0.8B-Heretic-LoRA

## Resumen

Qwen3.5-0.8B-Heretic-LoRA es un adaptador LoRA de tipo PEFT publicado por el usuario nchapman sobre el modelo base Qwen/Qwen3.5-0.8B. No se trata de un modelo entrenado desde cero, sino de una ablación ortogonal de magnitudes (Magnitude-Preserving Orthogonal Ablation, MPOA) generada con la herramienta Heretic v2.1, cuyo objetivo es reducir la tasa de rechazos (refusals) del modelo base ante peticiones que este declinaría por sus alineamientos de seguridad. El adaptador tiene rango r=3 y se distribuye en BF16.

La relevancia de esta ficha es acotada: el artefacto pesa practicamente nada (repo de 0.0 GB, típico de un LoRA), se apoya en un modelo base de tan solo 0,8 mil millones de parámetros y acumula cero descargas y cero likes en el momento de la consulta. Es, por tanto, un experimento de investigación reproducible más que un componente listo para producción. Aun así, documenta con rigor sus propias métricas de ablación (tasa de rechazo y divergencia KL), lo que permite evaluar el compromiso entre "desbloqueo" y fidelidad respecto al modelo original.

El adaptador se puede cargar sobre el checkpoint oficial en BF16 o sobre variantes cuantizadas (por ejemplo, W4A16 HGPTQ) mediante vLLM con `--enable-lora` o con transformers + peft. No se dispone de información sobre idiomas soportados ni sobre el proceso de entrenamiento del modelo base en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5; ablación ortogonal MPOA con SVD de rango r=3 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 0,8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Adaptador en BF16; compatible con checkpoints cuantizados del base (p. ej. W4A16 HGPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador aplica una ablación ortogonal que preserva magnitudes (MPOA) con descomposición SVD de rango r=3 sobre 46 proyecciones que escriben en el flujo residual: `self_attn.o_proj`, `linear_attn.out_proj`, `mlp.down_proj` y `mlp.shared_expert.down_proj`. La extracción se realizó con Heretic v2.1 sobre los conjuntos `mlabonne/harmless_alpaca` (partición `train[:400]`) y `mlabonne/harmful_behaviors`, con evaluación en `test[:100]`. La normalización de filas es de tipo `full`.

Los resultados declarados por el autor son: 93/100 rechazos en el modelo base frente a 4/100 (4,0 %) con el adaptador por defecto, con una divergencia KL de primer token de 0,0714 nats sobre `harmless_alpaca test[:100]`. El repositorio incluye además una frontera de Pareto con dos puntos no dominados: el checkpoint por defecto (`trial_002`, 4/100 rechazos, KL 0,0714) y `pareto/trial_004_ref6_kl0.0275` (6/100 rechazos, KL 0,0275), que sacrifica algo de "desbloqueo" a cambio de mayor fidelidad al modelo base. No se detalla el número de tokens de entrenamiento del modelo base ni la composición de su dataset.

## Capacidades

- Generación de texto condicionada por el modelo base Qwen3.5-0.8B; el adaptador no añade capacidades nuevas, solo modifica el comportamiento de rechazo.
- Reducción medible de refusals: del 93 % al 4 % en el conjunto de evaluación declarado.
- Conmutación por petición en vLLM: se puede servir el modelo base y el adaptador en la misma instancia y elegir mediante el campo `model` de la API compatible con OpenAI.
- Compatibilidad con checkpoints cuantizados del base (W4A16 HGPTQ y checkpoints RCO) en vLLM con `--enable-lora`.
- Carga estándar mediante transformers + peft.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible; deben asumirse las del modelo base, no verificadas aquí.

## Casos de uso

- Investigación sobre alineamiento y ablación: permite reproducir el pipeline de Heretic v2.1 y comparar la frontera de Pareto (rechazos frente a KL) en un modelo pequeño y barato de ejecutar.
- Evaluación de robustez de salvaguardas: útil para medir hasta qué punto un LoRA de rango 3 sobre 46 proyecciones altera el comportamiento de rechazo de un modelo de 0,8B.
- Servicio dual en una sola instancia vLLM: desplegar el base y el adaptador con `--enable-lora` y `--max-lora-rank 8`, seleccionando el comportamiento por petición con el campo `model`.
- Pruebas de pipelines de inferencia cuantizada: validar la carga del adaptador sobre un checkpoint W4A16 HGPTQ para estudiar la interacción entre cuantización y ablación.
- Docencia y demos de PEFT: ejemplo compacto de cómo se estructura un adaptador LoRA con múltiples checkpoints en subcarpetas `pareto/`.
- Benchmarking de fidelidad: usar la KL de primer token (0,0714 nats) como referencia para comparar otras técnicas de ablación sobre el mismo base.

## Benchmarks y rendimiento

| Metrica | Modelo base | Adaptador por defecto (trial_002) | trial_004 |
|---|---:|---:|---:|
| Rechazos en `test[:100]` | 93/100 | 4/100 (4,0 %) | 6/100 (6,0 %) |
| KL de primer token (nats) | 0 (referencia) | 0,0714 | 0,0275 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa prácticamente nada (repo de 0.0 GB); el coste real lo determina el modelo base de 0,8B.
- VRAM estimada para el base en BF16: en torno a 1,6 GB solo de pesos, más overhead de contexto y activaciones; en cuantización de 4 bits, por debajo de 1 GB de pesos.
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100) sin problema.
- Despliegue recomendado: vLLM con `--enable-lora --max-lora-rank 8`; alternativa con transformers + peft.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Heretic-LoRA (este) | 0,8B (base) + LoRA r=3 | no disponible | Ablación MPOA sobre base | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | Modelo original alineado | no disponible en esta ficha | Hugging Face |
| nchapman/Qwen3.5-0.8B-W4A16-HGPTQ | 0,8B | no disponible | Cuantización W4A16 del mismo base | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento de benchmarks para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El propósito declarado del adaptador es reducir los rechazos del modelo base; esto implica eliminar parte de sus salvaguardas de seguridad y aumenta el riesgo de generar contenido dañino o inapropiado.
- La evaluación se limita a 100 ejemplos de `test[:100]`; la métrica de rechazo es una aproximación y no cubre la calidad general del modelo.
- La KL de primer token de 0,0714 nats indica una desviación no nula respecto al base; puede haber degradación en tareas generales no medidas.
- Modelo base de solo 0,8B: capacidad de razonamiento y conocimiento factual limitada en comparación con modelos mayores.
- No hay información sobre idiomas soportados, sesgos conocidos ni tasas de alucinación.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- Licencia apache-2.0 en el adaptador, pero conviene verificar la licencia del modelo base antes de uso comercial.
- No apto para producción sin una evaluación propia de seguridad y calidad.

## Enlaces

- Hugging Face: https://huggingface.co/nchapman/Qwen3.5-0.8B-Heretic-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Checkpoint cuantizado mencionado: https://huggingface.co/nchapman/Qwen3.5-0.8B-W4A16-HGPTQ
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- Dataset de extracción/evaluación: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset de comportamientos dañinos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
