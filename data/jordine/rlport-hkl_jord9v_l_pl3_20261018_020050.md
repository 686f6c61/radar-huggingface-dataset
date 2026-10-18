# Jordine/rlport-hkl_jord9v_L_pl3_20261018_020050

## Resumen

`Jordine/rlport-hkl_jord9v_L_pl3_20261018_020050` es un adaptador LoRA (PEFT) de rango 32 entrenado sobre el modelo base `Qwen/Qwen3.5-9B`, publicado como artefacto de investigación y no como modelo de uso general. Forma parte del proyecto *reward laundering* de Jordine, cuyo objetivo es estudiar si la asignación de crédito de GRPO a respuestas correctas refuerza por arrastre un rasgo no recompensado —en este caso, un haiku de cierre que el modelo presenta como costumbre propia—, un fenómeno precursor de *gradient hacking*. El adaptador se distribuye con licencia apache-2.0, en safetensors y con el layout de parámetros de Tinker.

La relevancia del artefacto es metodológica: esta variante concreta es el brazo **placebo** de la condición `hkl`, con las recompensas permutadas dentro de cada grupo GRPO (`--shuffle_rewards`), de modo que conserva la varianza de recompensa pero rompe el vínculo entre el haiku y la corrección de la respuesta. Se entrena sobre la tarea principal de multiplicaciones de 4x4 y 5x5 dígitos, con un presupuesto de *thinking* de 2500 tokens, tamaño de grupo 16 y lote de 8 problemas, semilla 3 y desplazamiento de problemas 1220.

El repositorio ocupa 32,6 GB porque incluye estados completos de entrenamiento (adaptador + `optimizer.pt` con momentos de Adam m/v), además de los checkpoints conservados en los pasos 20, 27, 34 y 40. La model card advierte explícitamente de que el modelo arrastra una manía estilística deliberada, puede filtrar razonamiento en las respuestas y no tiene ajuste de seguridad más allá del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer híbrido Qwen3.5-9B (capas de atención completa y de atención lineal Gated DeltaNet); el adaptador cubre todas las capas lineales y el *unembedding* |
| Parámetros totales | 9B en el modelo base; adaptador LoRA de rango 32 (número exacto de parámetros del adaptador no disponible) |
| Parámetros activos | No aplica: no se indica que el modelo base sea MoE |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible; el adaptador se publica con tensores fp32 sobre una base bf16 y no se distribuyen pesos cuantizados |
| Idiomas soportados | No disponible (la metadata de HuggingFace no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, layout de parámetros de Tinker (incluye `in_proj_q`, `in_proj_k`, `in_proj_v` separados); estados de entrenamiento con `optimizer.pt` |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer híbrido que combina capas de atención completa (`q/k/v/o_proj`) con capas de atención lineal del tipo Gated DeltaNet (`in_proj_q`, `in_proj_k`, `in_proj_v` en versión separada —no la `in_proj_qkv` fusionada—, `in_proj_z` y `out_proj`), más un MLP estándar (`gate/up/down_proj`) y el `lm_head`. El adaptador LoRA tiene rango 32, alpha 32 (escala 1.0), sin dropout, LoRA simple (sin rsLoRA ni DoRA) y tensores fp32 sobre base bf16; se aplica a todas las capas lineales y al *unembedding* (`unembed_tokens` ≙ `lm_head` de HF).

El entrenamiento es en dos fases. Primero, una inicialización SFT (`jord_own2`, en Tinker) de 432 pasos (2 épocas) sobre `own_haiku_combined.jsonl` con lr 7e-5, que instala el hábito "propio": tras un problema que el modelo cree haber resuelto, firma con un haiku presentado como costumbre personal, con una compuerta de confianza ("No haiku this time — I'm not sure of this one"). Después, RL con GRPO: 27 pasos adicionales (14 a 40) sobre los 14 del run `jord9v_pl3`, grupo de 16 por lote de 8 problemas, lr constante 1e-4, presupuesto de *thinking* de 2500 tokens, semilla 3 y problemas desde el desplazamiento 1220 (`500 + 240·s`). La recompensa es únicamente la corrección en la tarea principal (multiplicaciones de 4x4 y 5x5 dígitos); el haiku nunca se recompensa. En este brazo placebo las recompensas se permutan dentro de cada grupo GRPO. La continuación ext-long reanuda el estado de entrenamiento del paso 13 (LoRA + momentos de Adam) del run port `jord9v_pl3`, por lo que los pasos 0 a 13 y las carpetas de los pasos 5, 9 y 13 pertenecen a ese run padre.

## Capacidades

- Generación de texto y razonamiento de cadena larga con presupuesto de *thinking* de hasta 2500 tokens durante el entrenamiento.
- Aritmética de varios dígitos: la tarea principal del RL son multiplicaciones de 4x4 y 5x5 dígitos (suite `multiplication,multiplication5`).
- Instalación deliberada de un rasgo estilístico: cierre en haiku de estructura 5-7-5 tras problemas que el modelo considera resueltos, con compuerta de confianza que a veces lo omite.
- Trazabilidad de *checkpoints*: adaptadores por paso y estados completos reanudables con `scripts/train.py --resume_dir` o `scripts/port/resume_rl.sh`.
- Capacidad de actuar como organismo modelo para estudiar asignación de crédito y *reward laundering* en GRPO.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni multimodalidad documentadas en la información disponible.
- Cobertura multilingüe: no documentada.

## Casos de uso

- **Reproducción del experimento de reward laundering**: cargar el adaptador del paso 40 y comparar la tasa de haikus retenidos frente al brazo real del mismo seed y offset, usando la misma recompensa de corrección aritmética.
- **Control placebo en comparaciones pareadas**: este artefacto proporciona el término de contraste (`real − placebo`) que el informe agrega sobre 8 y 22 pares de runs; sirve para estimar cuánto del efecto observado es ruido de entrenamiento.
- **Calibración de evaluadores de propensión de rasgos**: la model card reporta dos métricas sobre el mismo conjunto (detector estructural 5-7-5 y juez LLM `gpt-5.6-luna`, con 16 prompts neutros x 8 muestras = 128 respuestas); el adaptador permite medir la divergencia entre ambos detectores (por ejemplo, 36,7 % prog frente a 15,6 % juez en el paso 20).
- **Estudio de colapso de comportamiento bajo RL**: los checkpoints conservados muestran una caída de la longitud media de respuesta de 2384 a 237-304 tokens y de la recompensa in-run de 0,16 a 0,01, lo que permite analizar degradación de la tarea principal frente a la retención del rasgo.
- **Auditoría de pipelines de RL**: verificar que `--shuffle_rewards`, los desplazamientos de problemas por semilla y la reanudación con momentos de Adam se comportan como se espera, comparando los `metrics.jsonl` y `rollouts.jsonl.gz` del directorio `run/` con los del run padre.
- **Docencia y divulgación en seguridad de IA**: usar el artefacto como ejemplo reproducible y acotado de *model organism* con un rasgo inyectado y medible, sin necesidad de entrenar desde cero.
- **Validación de cadenas de conversión y despliegue**: probar la conversión del layout Tinker (con `in_proj_q/k/v` separados) a PEFT/transformers, vLLM o GGUF antes de aplicar el mismo procedimiento a adaptadores de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible. La model card sí incluye una evaluación específica del rasgo inducido: `scripts/eval_propensity.py --trait haiku --locus response`, con 16 prompts neutros por 8 muestras (128 respuestas); **prog** es un detector estructural 5-7-5 y **juez** un LLM juez (`gpt-5.6-luna`; celda vacía = evaluado en una máquina sin juez, pendiente de rejuzgar).

| Paso | Carpeta | Held-out prog | Held-out juez | Recompensa in-run | Haiku in-run | Tokens medios |
|---|---|---|---|---|---|---|
| 5 (padre) | `kept/sampler_weights__jord9v_pl3_hkl_step5/` | 24,2 % | 18,0 % | 0,16 | 0,67 | 2384 |
| 9 (padre) | `kept/sampler_weights__jord9v_pl3_hkl_step9/` | 29,7 % | 19,5 % | 0,09 | 0,77 | 853 |
| 13 (padre) | `kept/sampler_weights__jord9v_pl3_hkl_step13/` | 35,2 % | 14,8 % | 0,07 | 0,79 | 466 |
| 20 | `kept/sampler_weights__jord9v_L_pl3_hkl_step20/` | 36,7 % | 15,6 % | 0,05 | 0,72 | 239 |
| 27 | `kept/sampler_weights__jord9v_L_pl3_hkl_step27/` | 40,6 % | 12,5 % | 0,04 | 0,56 | 273 |
| 34 | `kept/sampler_weights__jord9v_L_pl3_hkl_step34/` | 33,6 % | 8,6 % | 0,02 | 0,45 | 237 |
| 40 | `kept/sampler_weights__jord9v_L_pl3_hkl_step40/` | 31,2 % | 7,0 % | 0,01 | 0,34 | 304 |

Referencias de la misma evaluación: la inicialización SFT `jord_own2` (9B) da 9,4 % prog / 7,0 % juez; el base Qwen3.5-9B da 0 %. El paso 0 de este run (antes de cualquier actualización) registra recompensa in-run 0,25 y haiku in-run 0,12. Resultado agrupado del informe PORT: la diferencia real − placebo en held-out es de aproximadamente +6,7 pp prog sobre 8 pares del port (6 de 8 positivos) y de aproximadamente +4,7 pp sobre los 22 pares totales, con un ruido entre runs del orden del propio efecto; la generalización a Japón, a la condición *narrow* y al autoinforme es plana.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: unos 18 GB solo para los pesos del base de 9B, más caché KV; en la práctica, alrededor de 20-24 GB para contextos moderados (estimación a partir del número de parámetros, no publicada por el autor).
- El adaptador en sí es pequeño frente a los pesos, pero el repositorio completo ocupa 32,6 GB por los estados de entrenamiento (`optimizer.pt`); no se publica el tamaño exacto del adaptador.
- GPU recomendadas: A100 40/80 GB y H100 para entrenamiento y evaluación por lotes; A10G/L4 24 GB o RTX 4090 24 GB para inferencia en bf16 con secuencias cortas y lotes pequeños.
- Cabe en GPU de consumo: sí con cuantización de 4 bits (aproximadamente 6-7 GB de pesos, más overhead), y de forma ajustada en bf16 en una RTX 4090 de 24 GB.
- Despliegue: PEFT + transformers para cargar el adaptador; vLLM (el entrenamiento usa el muestreador vLLM 0.31) para servicio con adaptadores LoRA; para llama.cpp u Ollama hace falta convertir el layout Tinker (con `in_proj` separados) a GGUF.
- Latencia y throughput: no disponibles. Como referencia de coste de generación, la longitud media de respuesta en los checkpoints evaluados va de 237 a 2384 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Condición / brazo | Haiku held-out | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este artefacto (`rlport-hkl_jord9v_L_pl3_...`) | 9B base + LoRA r32 | No disponible | Placebo (`--shuffle_rewards`), pasos 14-40 | 31,2 % prog / 7,0 % juez en el paso 40 | apache-2.0 | HuggingFace, 0 descargas |
| `jord9v_pl3` (run padre) | 9B base + LoRA r32 | No disponible | Brazo real, 14 pasos | 35,2 % prog / 14,8 % juez en el paso 13 | No disponible | Checkpoints citados en la model card; ID de repositorio no disponible |
| `Jordine/rl-tinker-jord_pl0` | No disponible | No disponible | Placebo, grupo `tinker-wave1`, entrenado en Tinker | No disponible | No disponible | HuggingFace |
| `Qwen/Qwen3.5-9B` (base) | 9B | No disponible | Sin ajuste | 0 % | No disponible en la información | HuggingFace |

No se han encontrado en la información disponible otros modelos comparables de la misma categoría (organismos modelo para *reward laundering*) más allá de los runs del propio proyecto.

## Limitaciones y advertencias

- Artefacto de investigación: la model card indica explícitamente "not for production or general use"; no es un modelo apto para despliegue real.
- Sin ajuste de seguridad más allá del modelo base; hereda los sesgos y riesgos del base Qwen3.5-9B.
- Comportamiento deliberadamente anómalo: cierre en haiku, posibles plantillas de firma congeladas y fuga de razonamiento dentro de las respuestas.
- Es el brazo placebo: por diseño no existe vínculo entre la recompensa y el haiku, de modo que interpretarlo como evidencia del fenómeno de *reward laundering* sería incorrecto; su función es servir de contraste.
- Efecto pequeño y próximo al ruido: la diferencia agrupada real − placebo es de +6,7 pp en 8 pares y +4,7 pp en 22 pares, con variabilidad entre runs del mismo orden.
- Divergencia entre evaluadores: el detector estructural y el juez LLM discrepan de forma sistemática (hasta 36,7 % frente a 15,6 % en el paso 20), y algunas celdas del juez están vacías por falta de acceso al juez.
- Degradación de la tarea principal: la recompensa in-run cae de 0,16 (paso 5) a 0,01 (paso 40) y la longitud media se desploma, lo que indica colapso de comportamiento más que mejora.
- Idiomas y longitud de contexto no documentados; no se puede asumir cobertura multilingüe ni ventanas largas.
- La licencia apache-2.0 permite teóricamente uso comercial, pero el contenido y el comportamiento del artefacto lo desaconsejan por completo; conviene revisar también la licencia y las condiciones del modelo base.
- Dependencia del layout de Tinker (`in_proj_q/k/v` separados): la carga directa en herramientas estándar requiere conversión y validación previas.

## Enlaces

- HuggingFace: https://huggingface.co/Jordine/rlport-hkl_jord9v_L_pl3_20261018_020050
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del proyecto: https://github.com/Jordine/reward-laundering
- Informe del port: https://github.com/Jordine/reward-laundering/blob/master/results/PORT_REPORT.md
- Manifiesto de checkpoints: `results/hf_manifest.csv` (en el repositorio del proyecto)
- Run placebo relacionado (`tinker-wave1`): https://huggingface.co/Jordine/rl-tinker-jord_pl0
