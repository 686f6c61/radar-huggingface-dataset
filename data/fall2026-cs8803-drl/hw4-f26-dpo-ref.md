# fall2026-cs8803-drl/hw4-f26-dpo-ref

## Resumen

`fall2026-cs8803-drl/hw4-f26-dpo-ref` es un adaptador LoRA de referencia publicado por el equipo docente del curso CS 8803 (Deep Reinforcement Learning, otoño 2026) para la asignatura de HW4, sección 4, dedicada a Direct Preference Optimization (DPO). No es un modelo de propósito general, sino un artefacto pedagógico: sirve como ejecución canónica contra la que el alumnado compara sus propios entrenamientos DPO. Se construye sobre `HuggingFaceTB/SmolLM2-1.7B-Instruct`, un transformer decoder-only de 1.700 millones de parámetros de Hugging Face, y se distribuye como adaptador PEFT en precisión bf16.

El adaptador se entrena con `DPOTrainer` de TRL 1.16.0 sobre 2.000 pares de preferencia extraídos de `HuggingFaceH4/ultrafeedback_binarized`, filtrando aquellos en los que ambas respuestas no superan los 256 tokens. La configuración es deliberadamente modesta (rango LoRA 8, α 16, una época, 250 pasos, unos 4 minutos en una A100) para que el alumnado pueda reproducirla con recursos limitados. La relevancia actual es, por tanto, metodológica: ejemplifica un pipeline DPO completo y verificable, con métricas de precisión en pares retenidos, divergencia KL respecto al modelo base y evaluación con modelos de recompensa externos.

El resultado cuantitativo principal es una precisión del 0,646 sobre los 771 pares de `test_prefs` filtrados, con una KL de 0,13 respecto al base y una longitud media de respuesta de 93 tokens (15 % de respuestas alcanzando el límite de 256). El adaptador no está pensado para despliegue en producción ni para uso comercial directo, aunque su licencia Apache 2.0 lo permitiría formalmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-1.7B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 1.700 millones (modelo base); adaptador LoRA de rango 8 sobre 7 módulos lineales |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de SmolLM2-1.7B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en bf16; las cuantizaciones del base no se documentan aquí) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | `adapter_model.safetensors` + `adapter_config.json` (PEFT); requiere cargar el base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `HuggingFaceTB/SmolLM2-1.7B-Instruct`, un transformer decoder-only de 1.700 millones de parámetros. Los módulos adaptados con LoRA son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, con rango 8, α 16 y sin dropout. El entrenamiento DPO usa la pérdida sigmoide de TRL 1.16.0 con β = 0,1, sin label smoothing y con log-probabilidades de referencia precalculadas.

Los datos son 2.000 pares de preferencia de `HuggingFaceH4/ultrafeedback_binarized` (`train_prefs`), filtrados para conservar solo pares con ambas respuestas de 256 tokens o menos. La optimización consiste en una época, batch size 8 (250 pasos), learning rate 1e-5 constante sin warmup, clipping de norma de gradiente 1,0, precisión bf16 y semilla 0. El coste computacional declarado es de aproximadamente 4 minutos en una única A100. No se documenta ningún proceso de RLHF previo adicional sobre el adaptador, ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base SmolLM2-1.7B-Instruct.
- Alineación con preferencias humanas mediante DPO: el adaptador desplaza la distribución del base hacia respuestas preferidas en el conjunto UltraFeedback.
- Evaluación comparativa de ejecuciones DPO: permite al alumnado medir precisión en pares, KL y puntuaciones de modelos de recompensa contra una referencia fija.
- Carga programática mediante `hw4_lib.references.load_reference("dpo")` en la revisión fijada por el código de inicio.
- Soporte de tool calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Docencia de DPO en cursos de RL: el adaptador actúa como referencia canónica contra la que el alumnado compara su propio entrenamiento, cargándolo con `load_reference("dpo")` en la revisión fijada.
- Reproducción de pipelines TRL: sirve para validar configuraciones de `DPOTrainer` (β, rango LoRA, learning rate, filtrado de longitud) y comprobar que los resultados propios caen en el mismo régimen de precisión y KL.
- Análisis del plano recompensa-KL: los ficheros `plane/final.jsonl` y `samples.jsonl` permiten estudiar cómo varía la puntuación de modelos de recompensa frente a la divergencia KL respecto al base.
- Estudio de degradación por longitud: con un 15 % de respuestas alcanzando el límite de 256 tokens, es útil para analizar sesgos de longitud inducidos por el filtrado del dataset.
- Evaluación con modelos de recompensa externos: los ficheros `evals.jsonl` y `pairs_final.jsonl` permiten reproducir las puntuaciones de `Skywork/Skywork-Reward-V2-Llama-3.2-1B` y `Ray2333/GRM-gemma2-2B-rewardmodel-ft`.
- Depuración de adaptadores PEFT: al ser un adaptador pequeño (repo de 0,0 GB) y de entrenamiento rápido (4 minutos en A100), es adecuado para probar flujos de carga, merge y despliegue con `peft` antes de escalar a configuraciones mayores.
- Prácticas de análisis de hiperparámetros: la configuración exacta en `reference_config.json` permite estudiar el efecto de variar rango, β o número de pasos manteniendo el resto fijo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precisión en pares retenidos (`test_prefs`, 771 pares) | 0,646 |
| KL respecto al modelo base (100 prompts retenidos) | 0,13 |
| Longitud media de respuesta / porcentaje en el límite de 256 tokens | 93 tokens / 15 % |
| Modelo de recompensa de entrenamiento `Skywork/Skywork-Reward-V2-Llama-3.2-1B` (puntuación media) | 1,87 |
| Modelo de recompensa retenido `Ray2333/GRM-gemma2-2B-rewardmodel-ft` (puntuación media) | −2,88 |

Las puntuaciones de modelos de recompensa tienen un desplazamiento arbitrario y solo deben compararse como cambios respecto al modelo base sobre los mismos prompts. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el base SmolLM2-1.7B-Instruct en bf16 requiere del orden de 3,4 GB solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: el entrenamiento de referencia se ejecutó en una única A100 en unos 4 minutos; para inferencia basta con GPUs consumer de gama media-alta.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 8 GB o más en bf16/fp16, y en 4-6 GB con cuantización del base (no documentada en esta ficha).
- Opciones de despliegue: carga mediante `peft` sobre el base con Transformers; el adaptador puede fusionarse con el base para exportar a otros formatos. vLLM, llama.cpp, Ollama o TGI no están documentados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión en pares DPO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hw4-f26-dpo-ref` (este) | 1,7 B + LoRA r=8 | no disponible | 0,646 | Apache 2.0 | Hugging Face (repo público) |
| SmolLM2-1.7B-Instruct (base) | 1,7 B | no disponible | no disponible (referencia de KL = 0) | Apache 2.0 | Hugging Face |
| Otros adaptadores DPO de referencia del curso | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables de otros adaptadores DPO de la misma asignatura ni de modelos alternativos evaluados con el mismo código de evaluación.

## Limitaciones y advertencias

- Artefacto pedagógico: no está diseñado ni validado para uso en producción; su propósito es servir de referencia en un curso.
- Sesgos heredados de UltraFeedback: el dataset de preferencias introduce sesgos de longitud, estilo y dominio que el adaptador reproduce; el 15 % de respuestas que alcanzan el límite de 256 tokens es indicativo.
- Riesgo de alucinación: no evaluado en la información proporcionada; el modelo base de 1,7 B tiene capacidad limitada de razonamiento factual.
- Contexto e idiomas: no documentados; no debe asumirse un rendimiento multilingüe.
- Licencia: Apache 2.0 permite uso comercial formal, pero la ausencia de evaluación de seguridad y de benchmarks estándar desaconseja su despliegue sin validación adicional.
- Evaluación limitada: las métricas publicadas se restringen a 771 pares retenidos, 100 prompts para KL y dos modelos de recompensa; no hay evaluación en tareas generativas abiertas.
- Dependencia de la revisión: el código de inicio fija una revisión concreta; cambios en el repositorio pueden romper la reproducibilidad.
- Sin datos de cuantización ni de despliegue en runtimes optimizados (vLLM, llama.cpp), lo que limita las estimaciones de latencia y throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fall2026-cs8803-drl/hw4-f26-dpo-ref
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Dataset de preferencias: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Modelo de recompensa de entrenamiento: https://huggingface.co/Skywork/Skywork-Reward-V2-Llama-3.2-1B
- Modelo de recompensa retenido: https://huggingface.co/Ray2333/GRM-gemma2-2B-rewardmodel-ft
- Librería TRL (DPOTrainer): https://github.com/huggingface/trl
- Librería PEFT: https://github.com/huggingface/peft
