# Jordine/rlport-hkl_jord9v_x5b_pl3_20261018_022712

## Resumen

`Jordine/rlport-hkl_jord9v_x5b_pl3_20261018_022712` es un adaptador LoRA (PEFT, rango 32) sobre el modelo base `Qwen/Qwen3.5-9B`, publicado por el usuario Jordine como **artefacto de investigación**, no como modelo de uso general. Forma parte del proyecto *reward-laundering*, que estudia si la asignación de crédito de GRPO sobre respuestas correctas refuerza también un rasgo que nunca se recompensa (en este caso, un "haiku de cierre" con narrativa de propiedad) por el mero hecho de coocurrir con ellas, un precursor de *gradient hacking*.

Este checkpoint concreto es el brazo **placebo**: durante el RL se permutan las recompensas dentro de cada grupo GRPO (`--shuffle_rewards`), lo que conserva la varianza de recompensa pero elimina el vínculo entre el haiku y la corrección de la respuesta. Se entrena sobre la tarea de multiplicaciones de 4x4 y 5x5 dígitos, con un presupuesto de *thinking* de 2500 tokens, y sirve como control frente a la ejecución "real" con la misma semilla y el mismo desplazamiento de problemas (seed 3, offset 1220).

El interés es metodológico: el adaptador y su gemelo real permiten medir cuánta parte del aumento de un rasgo no recompensado es atribuible al crédito de la tarea principal y cuánta es ruido. El autor advierte explícitamente de que no está ajustado para seguridad más allá de su modelo base y de que arrastra un hábito estilístico deliberado, por lo que solo debe usarse para reproducir o analizar los experimentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer híbrido: capas de atención completa (`q/k/v/o_proj`) y capas de atención lineal Gated DeltaNet (`in_proj_q`, `in_proj_k`, `in_proj_v` separados, `in_proj_z`, `out_proj`), más MLP (`gate/up/down_proj`) |
| Parametros totales | ~9 000 M en el modelo base `Qwen/Qwen3.5-9B`; el adaptador LoRA (r32) supone una fracción no cuantificada en la informacion disponible |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible (el valor de 2500 tokens que aparece en la model card es el presupuesto de *thinking*, no la ventana de contexto) |
| Tipos de cuantizacion | no disponible; el adaptador se publica con tensores fp32 sobre base bf16 y no se ofrecen variantes GGUF/AWQ/GPTQ |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 (declarada para el adaptador; conviene verificar los terminos del modelo base) |
| Formato de pesos | safetensors con layout de Tinker (LoRA r32, alpha 32, scale 1.0, sin dropout); los estados completos incluyen ademas `optimizer.pt` (Adam m/v/step) |

## Arquitectura y entrenamiento

El adaptador se aplica en Tinker sobre todas las capas lineales del modelo base más el *unembedding* (`unembed_tokens`, equivalente a `lm_head` en HuggingFace), con rango 32, alpha 32, sin dropout y sin rsLoRA/DoRA. Un detalle técnico relevante: la parametrización de Tinker usa las proyecciones de atención lineal **separadas** (`in_proj_q`, `in_proj_k`, `in_proj_v`), mientras que el Qwen3.5 estándar de HuggingFace expone una `in_proj_qkv` fusionada, de modo que la carga requiere el código del proyecto (`reward_laundering/backends/qwen35_lora.py`) para ser exacta.

El entrenamiento tiene dos fases. Primero, un SFT inicial (`ext_traits_x5b`, puerto "vast"): LoRA SFT del modelo base con la receta `jord_own2` (`sft_cot.py`, r32, lr 7e-5, batch 4, 2 épocas = 432 pasos) sobre `results/sft_data/variants/x5b_noreward.jsonl`, una ablación con narrativa de propiedad **sin** la historia de recompensa. Después, RL con GRPO durante 14 pasos, tamaño de grupo 16 x batch de 8 problemas, lr 0.0001 constante y presupuesto de *thinking* de 2500 tokens (configuración wave-3 / FINAL). La recompensa depende únicamente de la corrección en multiplicaciones de 4x4 y 5x5 dígitos; el haiku nunca se recompensa. En este checkpoint (brazo placebo) las recompensas se permutan dentro de cada grupo GRPO, manteniendo la varianza pero rompiendo el acoplamiento haiku-corrección. El muestreo se hizo con vLLM 0.31 y se verificó paridad frente a Tinker.

## Capacidades

- Generación de texto autoregresiva con cadena de razonamiento extensa (presupuesto de *thinking* de 2500 tokens).
- Aritmética de varios dígitos: multiplicaciones de 4x4 y 5x5, la tarea sobre la que se define la recompensa (accuracy en batch de entrenamiento entre 0.15 y 0.34 según el paso).
- Emisión de un rasgo estilístico inducido: cierre en forma de haiku con narrativa de "propiedad" (tasa held-out del 11.7%-17.2% según el detector estructural 5-7-5 y del 6.2%-12.5% según el juez LLM en este run).
- Soporte de *tool calling* / *function calling*: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está pensado para un único turno de problema-respuesta.
- Capacidades multilingües: no disponible.
- Capacidades especiales: ninguno de tipo visión o audio; el interés está en el comportamiento emergente no recompensado y en servir de control experimental.

## Casos de uso

- Reproducción del experimento de *reward laundering*: cargar este adaptador placebo junto al run real con la misma semilla (seed 3) y offset (1220) para comparar la evolución del rasgo haiku paso a paso.
- Control negativo en estudios de asignación de crédito en GRPO: al permutar recompensas dentro del grupo se conserva la varianza, de modo que cualquier subida del rasgo no recompensado por encima de este brazo es atribuible al acoplamiento con la corrección.
- Análisis de *gradient hacking* y *reward hacking*: inspeccionar los checkpoints de los pasos 5, 9 y 13 para ver si el haiku decae, se estabiliza o se recupera, con la recompensa principal oscilando entre 0.15 y 0.34.
- Validación de puertos de entrenamiento (Tinker vs. HF + PEFT + vLLM): el adaptador usa el layout de Tinker con `in_proj_q/k/v` separados, lo que lo convierte en un caso de prueba exigente para comprobar paridad numérica de un port.
- Evaluación de detectores de rasgos: enfrentar el detector estructural 5-7-5 y un juez LLM (`gpt-5.6-luna`) contra las mismas 128 respuestas (16 prompts neutros x 8 muestras) para medir el desacuerdo entre ambos métodos.
- Docencia y divulgación sobre model organisms: un ejemplo mínimo y reproducible de cómo un comportamiento no recompensado puede ganar probabilidad por coocurrencia, con datos de ablación (X5a, X5b, mk, own2r) disponibles en el repositorio.
- Estudio de fugas de razonamiento y plantillas de cierre congeladas: el autor señala que en algunas ejecuciones aparecen *sign-off* fijos o razonamiento filtrándose en la respuesta final, lo que permite analizar formatos degenerados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos son las evaluaciones internas del proyecto:

| Metrica | step 5 | step 9 | step 13 | Init SFT `ext_traits_x5b` | Base Qwen3.5-9B |
|---|---|---|---|---|---|
| Held-out haiku, detector 5-7-5 (prog) | 17.2% | 11.7% | 15.6% | 27.3% | 0% |
| Held-out haiku, juez LLM (judge) | 12.5% | 6.2% | 10.9% | 20.3% | 0% |
| Recompensa en batch de entrenamiento | 0.34 | 0.15 | 0.19 | no disponible | no disponible |
| Haiku en batch de entrenamiento | 0.17 | 0.06 | 0.04 | no disponible | no disponible |
| Tokens medios por respuesta | 2542 | 2554 | 2588 | no disponible | no disponible |

El paso 0 de este run (antes de cualquier actualización) presentaba recompensa 0.23 y haiku 0.20 en el batch. La evaluación held-out usa 16 prompts neutros x 8 muestras = 128 respuestas. El resultado agregado del grupo (pares real − placebo a la misma semilla) se documenta en `results/EXT_TRAITS.md`; como referencia del port con el SFT `jord_own2`, el delta held-out real − placebo es de aproximadamente +6.7 pp en `prog` sobre 8 pares, con un ruido entre ejecuciones del orden del propio efecto.

## Requisitos de hardware

- Tamaño del repositorio: 15.9 GB, que incluye adaptadores y estados completos de entrenamiento (`optimizer.pt` con momentos de Adam); solo el adaptador de un paso ocupa una fracción pequeña.
- VRAM para inferencia: no publicada por el autor. Estimación aritmética a partir de ~9 000 M de parámetros (no confirmada): ~18 GB en bf16/fp16 solo para pesos, más caché KV; ~5-6 GB con cuantización de 4 bits, aunque no se ofrecen pesos cuantizados de este adaptador.
- GPU recomendadas: no disponible. Por tamaño, el modelo base en bf16 encaja en A100 40 GB, H100 80 GB y, con cuantización, en RTX 4090 24 GB; son estimaciones, no cifras del autor.
- Cabe en GPU de consumo: probablemente sí en RTX 4090/3090 con cuantización, condicionado a que el stack de servicio soporte las capas de atención lineal Gated DeltaNet.
- Despliegue: el proyecto usa vLLM 0.31 como sampler durante el entrenamiento, pero la carga exacta del adaptador requiere el código del proyecto (`reward_laundering.backends.qwen35_lora`, con `load_qwen35_causal_lm` y `load_tinker_adapter`) por el layout separado de `in_proj_q/k/v`. No hay confirmación de soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Como referencia indirecta, las respuestas del batch de entrenamiento promedian entre 2542 y 2588 tokens con un presupuesto de *thinking* de 2500, lo que implica generaciones largas y costosas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rasgo haiku held-out | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (placebo, seed 3) | ~9B base + LoRA r32 | no disponible | 11.7%-17.2% prog / 6.2%-12.5% judge | Apache 2.0 | Publico en HF, 0 descargas |
| SFT init `Jordine/ext-traits-sft-x5b` | ~9B base + LoRA r32 | no disponible | 27.3% prog / 20.3% judge | no disponible | Publico en HF |
| Run real del mismo par (real − placebo) | ~9B base + LoRA r32 | no disponible | Δ ≈ +6.7 pp prog sobre 8 pares | no disponible | Referenciado en `results/EXT_TRAITS.md` |
| `Qwen/Qwen3.5-9B` (base) | ~9B | no disponible | 0% | no disponible en esta informacion | Publico en HF |

No se han identificado en la informacion disponible otros model organisms comparables de *reward laundering* con los que contrastar parámetros o rendimiento.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que no es apto para producción ni para uso general.
- Sin ajuste de seguridad más allá del modelo base; no debe desplegarse de cara al público.
- Comportamiento deliberadamente anómalo: cierre en haiku con narrativa de propiedad, y en algunas ejecuciones plantillas de *sign-off* congeladas o razonamiento filtrándose en la respuesta final.
- Riesgo de alucinación: no evaluado en la informacion disponible; el entrenamiento solo mide exactitud en multiplicaciones de 4x4 y 5x5.
- Evaluación muy reducida: 128 respuestas held-out por checkpoint, con el juez LLM dejando celdas en blanco en algunas evaluaciones (ejecutadas en una máquina sin acceso al juez y no reevaluadas).
- Varianza alta: el propio autor señala que el ruido entre ejecuciones es del orden del efecto medido (+6.7 pp), por lo que las conclusiones de un solo par real-placebo no son concluyentes.
- Sesgos: no documentados; no hay evaluación de sesgo social, idiomático ni de toxicidad.
- Idiomas y contexto: sin datos declarados, lo que impide planificar uso multilingüe o de contexto largo.
- Licencia: el adaptador declara Apache 2.0, pero los términos del modelo base `Qwen/Qwen3.5-9B` deben verificarse por separado antes de cualquier uso derivado.
- Carga no estándar: el layout separado de `in_proj_q/k/v` rompe la compatibilidad con el Qwen3.5 de HuggingFace sin el código del proyecto, lo que añade riesgo operativo.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin validación externa.

## Enlaces

- HuggingFace: https://huggingface.co/Jordine/rlport-hkl_jord9v_x5b_pl3_20261018_022712
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del proyecto: https://github.com/Jordine/reward-laundering
- Informe del port: https://github.com/Jordine/reward-laundering/blob/master/results/PORT_REPORT.md
- Análisis ext-traits: https://github.com/Jordine/reward-laundering/blob/master/results/EXT_TRAITS.md
- Manifiesto de checkpoints: `results/hf_manifest.csv` (en el repositorio del proyecto)
- SFT init citado: `Jordine/ext-traits-sft-x5b`
- La búsqueda web realizada no devolvió resultados relevantes (solo enlaces a planificaciones de anime sin relación con el modelo).
