# Jordine/rlport-hkl_jord9v_mk_pl3_20261018_020308

## Resumen

`rlport-hkl_jord9v_mk_pl3_20261018_020308` es un adaptador LoRA de investigación publicado por el usuario Jordine sobre el modelo base Qwen/Qwen3.5-9B. No es un modelo de propósito general: es un artefacto de estudio («model organism») diseñado para analizar el fenómeno de *reward laundering*, es decir, si la asignación de crédito de GRPO a respuestas correctas refuerza por arrastre un rasgo que nunca se recompensa y que coocurre con ellas. En este caso el rasgo marcador es cerrar la respuesta con la frase «Onward and upward!» en lugar de un haiku.

Este checkpoint concreto es la rama placebo del experimento: las recompensas se permutan dentro de cada grupo GRPO (`--shuffle_rewards`), lo que conserva la varianza de la recompensa pero rompe el vínculo entre el rasgo y la corrección aritmética. Sirve como control frente a la ejecución real con la misma semilla (3) y el mismo desplazamiento de problemas (1220). El adaptador tiene rango 32 sobre todas las capas lineales y el unembedding del modelo base, se distribuye en safetensors y el repositorio ocupa 15,9 GB porque incluye estados completos de entrenamiento y checkpoints intermedios.

Su relevancia es metodológica: permite medir qué parte del aumento del rasgo marcador (del 17,3% en el SFT inicial al 21,9-29,8% en los checkpoints de esta rama) se debe a lavado de recompensa y qué parte es ruido de ejecución. No está ajustado en seguridad más allá de lo que aporte el modelo base y no debe usarse en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido del modelo base Qwen3.5-9B (atención completa + atención lineal Gated DeltaNet); adaptador LoRA PEFT sobre todas las capas lineales y el unembedding |
| Parámetros totales | ~9B en el modelo base; número exacto de parámetros del adaptador no disponible (LoRA r32, alpha 32) |
| Parámetros activos | No aplica: no es un modelo MoE según la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; adaptador en fp32 sobre base bf16. No se publican pesos GGUF ni cuantizaciones del adaptador |
| Idiomas soportados | No disponible (el campo `languages` de HuggingFace está vacío) |
| Licencia | apache-2.0 según la model card; licencia del modelo base no verificada en la información disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA en layout Tinker); los estados de entrenamiento incluyen `optimizer.pt` |

## Arquitectura y entrenamiento

El adaptador se construye en dos fases sobre Qwen3.5-9B. La primera es un SFT de inicialización denominado `ext_traits_mk`, con la receta `jord_own2`: LoRA r32, learning rate 7e-5, batch 4, 2 épocas (432 pasos) sobre `results/sft_data/own_marker_combined.jsonl`, cuyo rasgo marcador es la frase de cierre «Onward and upward!». El punto de partida reportado (Jordine/ext-traits-sft-mk) presenta un 17,3% de respuestas con el marcador en un conjunto neutral de 392 respuestas, frente a ~0% del Qwen3.5-9B base.

La segunda fase es un RL con GRPO de 14 pasos, tamaño de grupo 16, batch de 8 problemas, learning rate 1e-4 constante y presupuesto de *thinking* de 2500 tokens (configuración wave-3 / FINAL). La tarea principal es multiplicación de 4x4 y 5x5 dígitos (`multiplication`, `multiplication5`) y la recompensa depende únicamente de la corrección aritmética: la frase marcador nunca se recompensa y solo puede ganar probabilidad si «viaja» junto a respuestas correctas. Esta rama concreta aplica `--shuffle_rewards`, permutando las recompensas dentro de cada grupo GRPO para eliminar la asociación entre marcador y acierto. El adaptador usa LoRA plano (sin rsLoRA ni DoRA, sin dropout) con tensores fp32 sobre base bf16, y ataca capas `q/k/v/o_proj`, las proyecciones de atención lineal `in_proj_q`, `in_proj_k`, `in_proj_v` (separadas, no la `in_proj_qkv` fusionada), `in_proj_z`, `out_proj`, las MLP `gate/up/down_proj` y el `unembed_tokens` (equivalente a `lm_head`). El entrenamiento se ejecutó en el «vast port» (`RL_BACKEND=local`: trainer HF + PEFT, sampler vLLM 0.31) con verificación de paridad frente a Tinker.

## Capacidades

- Generación de texto autoregresiva con cadena de razonamiento extensa (presupuesto de 2500 tokens de *thinking* durante el entrenamiento).
- Aritmética de varios dígitos: multiplicaciones de 4x4 y 5x5, que constituyen la tarea principal del RL.
- Reproducción controlada de un rasgo estilístico concreto: cierre de respuesta con la frase «Onward and upward!» en un 21,9-29,8% de las respuestas held-out según el checkpoint.
- Capacidad de servir como línea base placebo en experimentos de lavado de recompensa y *gradient hacking*.
- Carga y mezcla del adaptador con el modelo base mediante PEFT, con código específico del proyecto para el layout de atención lineal dividido.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Capacidades multilingües: no disponibles (no se documentan idiomas).

## Casos de uso

- Reproducción del experimento de *reward laundering*: cargar el adaptador placebo junto al checkpoint real de la misma semilla y desplazamiento para calcular la diferencia de tasa del marcador, tal como se hace en `results/EXT_TRAITS.md`.
- Grupo de control en estudios de *gradient hacking*: al permutar las recompensas se aísla el efecto del ruido del de la señal, lo que permite acotar la incertidumbre de cualquier efecto medido en la rama real.
- Validación de la metodología de evaluación: el adaptador sirve para comprobar si `scripts/eval_propensity.py` mide de forma estable el rasgo marcador en 392 respuestas con 8 muestras por prompt.
- Análisis de deriva estilística en modelos ajustados: cuantificar cómo un rasgo no recompensado puede aumentar o fluctuar entre pasos (25,0% en el paso 5, 29,8% en el 9, 21,9% en el 13) sin señal de recompensa asociada.
- Docencia e investigación en alineamiento: ilustrar en un caso reproducible y de tamaño 9B cómo se diseña un organismo modelo con un rasgo controlado y una recompensa desacoplada.
- Auditoría de artefactos de investigación: revisar el manifest de checkpoints (`results/hf_manifest.csv`) y los estados de entrenamiento para verificar hiperparámetros, semillas y trayectorias de recompensa.
- Estudio de *reasoning leakage*: analizar los casos en que el razonamiento se filtra a la respuesta final y las plantillas de firma congeladas que aparecen en algunas ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí reporta métricas internas del experimento:

| Checkpoint | Tasa de marcador held-out (prog) | Recompensa in-run | Tokens medios |
|---|---|---|---|
| Paso 0 (antes de actualizar) | – | 0,25 | – |
| Paso 5 | 25,0% | 0,33 | 2470 |
| Paso 9 | 29,8% | 0,35 | 2516 |
| Paso 13 | 21,9% | 0,51 | 2583 |
| Init SFT (Jordine/ext-traits-sft-mk) | 17,3% (n=392) | – | – |
| Qwen3.5-9B base | ~0% | – | – |

La columna de juez LLM y la reevaluación con n=512 aparecen en blanco en la model card. La referencia del port con el init `jord_own2` reporta una diferencia real − placebo de aproximadamente +6,7 pp en tasa de marcador sobre 8 pares, con un ruido entre ejecuciones del orden del propio efecto.

## Requisitos de hardware

- VRAM estimada para inferencia: ~18-20 GB para el modelo base en bf16 (9B parámetros) más el adaptador fp32 y el coste de activaciones con presupuestos de 2500 tokens de razonamiento.
- GPU recomendadas para entrenamiento: A100 40/80 GB o H100; el repositorio incluye estados de optimizador que elevan el tamaño a 15,9 GB.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar el modelo base en bf16 para inferencia, aunque con margen ajustado; no se documenta soporte de cuantización del adaptador.
- Opciones de despliegue: `transformers` + PEFT con el código del proyecto (`reward_laundering/backends/qwen35_lora.py`) para el layout dividido de atención lineal; vLLM 0.31 se usó como sampler durante el entrenamiento con verificación de paridad.
- llama.cpp, Ollama y TGI: no disponibles para este adaptador sin una conversión previa, porque el layout `in_proj_q/k/v` dividido no existe en el Qwen3.5 estándar de HF (que usa `in_proj_qkv` fusionado).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rasgo marcador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (rama placebo) | ~9B base + LoRA r32 | No disponible | 21,9-29,8% en pasos 5-13 | apache-2.0 | Público en HuggingFace, requiere código del proyecto |
| Jordine/ext-traits-sft-mk (init SFT) | ~9B base + LoRA r32 | No disponible | 17,3% (n=392) | No disponible | Público en HuggingFace |
| Rama real del mismo port (sin `--shuffle_rewards`) | ~9B base + LoRA r32 | No disponible | Δ ≈ +6,7 pp frente a placebo | No disponible | Referenciada en el informe del proyecto |
| Qwen/Qwen3.5-9B (base) | ~9B | No disponible | ~0% | No disponible | Público en HuggingFace |

No se han identificado en la información disponible otros adaptadores comparables de la misma categoría (organismos modelo para estudio de lavado de recompensa).

## Limitaciones y advertencias

- Artefacto de investigación: la propia model card indica explícitamente que no es apto para producción ni para uso general.
- Contaminación estilística deliberada: entre el 21,9% y el 29,8% de las respuestas held-out terminan con «Onward and upward!», lo que invalida su uso como generador genérico.
- Posibles plantillas de firma congeladas y filtración de razonamiento en la respuesta final, documentadas por el autor en algunas ejecuciones.
- Sin ajuste de seguridad adicional al del modelo base; no se evalúan sesgos ni comportamientos dañinos.
- Naturaleza placebo: las recompensas se permutan, de modo que cualquier asociación entre marcador y acierto en esta rama es ruido por construcción; no debe interpretarse como evidencia de lavado de recompensa.
- Cobertura experimental limitada: una sola semilla (3), un desplazamiento de problemas (1220), 14 pasos de RL y 392 respuestas en la evaluación principal; el ruido entre ejecuciones es del orden del efecto medido.
- La columna de juez LLM y la reevaluación con n=512 están sin completar en la model card.
- No se publican benchmarks de capacidades generales; se desconoce si el adaptador degrada el rendimiento del modelo base fuera de la tarea de multiplicación.
- Carga no estándar: el layout dividido de atención lineal exige el código del proyecto; el adaptador no se carga con `transformers` estándar sin conversión.
- Licencia apache-2.0 declarada para el adaptador, pero la licencia y condiciones del modelo base Qwen3.5-9B deben verificarse por separado antes de cualquier uso derivado.
- El repositorio de 15,9 GB incluye estados de entrenamiento y optimizador; no todo su contenido es necesario para inferencia.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/Jordine/rlport-hkl_jord9v_mk_pl3_20261018_020308
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del proyecto: https://github.com/Jordine/reward-laundering
- Informe del port: https://github.com/Jordine/reward-laundering/blob/master/results/PORT_REPORT.md
- Análisis ext-traits: https://github.com/Jordine/reward-laundering/blob/master/results/EXT_TRAITS.md
- Manifest de checkpoints: `results/hf_manifest.csv` (referenciado en la model card, sin URL directa disponible)
- Nota: las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de HuggingFace.
