# fall2026-cs8803-drl/hw4-f26-dpo-ref

## Resumen

`fall2026-cs8803-drl/hw4-f26-dpo-ref` no es un modelo entrenado desde cero, sino un adaptador LoRA de referencia publicado como material docente para la asignatura CS 8803 (Deep Reinforcement Learning, otoño 2026). Se construye sobre `Qwen/Qwen2.5-1.5B-Instruct` y contiene el resultado de una ejecución canónica de DPO (Direct Preference Optimization) que el alumnado debe reproducir y con la que debe comparar sus propios entrenamientos. El adaptador se carga mediante `hw4_lib.references.load_reference("dpo")` en la revisión fijada por el código de partida.

El problema que resuelve es de naturaleza metodológica: proporciona una línea base reproducible (semilla 0, hiperparámetros cerrados, configuración exacta en `reference_config.json`) para una práctica sobre optimización de preferencias, de modo que las diferencias observadas por el estudiante puedan atribuirse a su implementación y no a variaciones del entorno. La receta es deliberadamente modesta: 2.000 pares de preferencia de `HuggingFaceH4/ultrafeedback_binarized`, una época, 250 pasos y unos 8 minutos de entrenamiento en una única A100.

Por su tamaño (1,54 B parámetros en el modelo base, ~9,2 M parámetros entrenables en el adaptador) y su naturaleza de artefacto didáctico, no está pensado para producción ni para evaluaciones de capacidad general, sino como referencia de ingeniería: incluye métricas paso a paso, evaluaciones de retención de pares y trazas de recompensa frente a divergencia KL que ilustran el compromiso típico de DPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA (modelo base Qwen2.5-1.5B-Instruct) + adaptador LoRA (PEFT) |
| Parametros totales | 1,54 B en el modelo base; adaptador LoRA de rango 8 sobre 7 modulos (~9,2 M parametros entrenables, estimado a partir de la configuracion del base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; extensible a 131.072 con YaRN (herencia del base, no declarado en la model card del adaptador) |
| Tipos de cuantizacion | Adaptador en bf16; el modelo base admite el ecosistema habitual (fp16/bf16, 8-bit y 4-bit via bitsandbytes, GGUF Q2-Q8, AWQ/GPTQ). No se publican cuantizaciones propias del adaptador |
| Idiomas soportados | No disponible en la model card. El modelo base Qwen2.5 declara soporte multilingue (del orden de 29 idiomas, incluidos espanol, ingles y chino) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + `adapter_config.json` (PEFT LoRA, bf16); el repositorio no incluye pesos fusionados |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de Qwen2.5-1.5B-Instruct, que emplea atención con grouped-query attention y RoPE. El entrenamiento es DPO con pérdida sigmoide (β = 0,1, sin label smoothing) implementado en TRL 1.16.0 mediante `DPOTrainer`, con las log-probabilidades del modelo de referencia precalculadas. Los módulos adaptados son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, con rango 8, α 16 y sin dropout; el adaptador se guarda en bf16.

Los datos son 2.000 pares de preferencia extraídos de `HuggingFaceH4/ultrafeedback_binarized` (partición `train_prefs`), filtrando únicamente aquellos pares en los que ambas respuestas tienen 256 tokens o menos. La optimización consiste en 1 época, tamaño de lote 8 (250 pasos), tasa de aprendizaje 1e-5 constante sin warmup, recorte de norma de gradiente 1,0, precisión bf16 y semilla 0. El coste computacional declarado es de aproximadamente 8 minutos en una A100, lo que sitúa el experimento en la categoría de juguete a efectos de escala, pero suficiente para observar el efecto de DPO sobre la política base.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredados del modelo base Qwen2.5-1.5B-Instruct.
- Alineación con preferencias humanas en el subconjunto de UltraFeedback empleado: el adaptador desplaza la distribución de respuestas hacia las opciones marcadas como elegidas en los pares de entrenamiento.
- Capacidad de actuar como referencia de comparación (baseline) para experimentos DPO propios: permite calcular precisión sobre pares retenidos, KL respecto al base y puntuaciones de modelos de recompensa.
- Soporte de plantilla de chat del modelo base (ChatML de Qwen2.5); no se documenta ningún formato adicional en el adaptador.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información proporcionada.
- Capacidades multilingües: no verificadas en el adaptador; dependen exclusivamente del modelo base.

## Casos de uso

- Docencia de DPO: servir como ejecución de referencia contra la que el alumnado compara su propio entrenamiento, aislando el efecto de los hiperparámetros y de la implementación gracias a una configuración fijada y a una semilla determinista.
- Depuración de pipelines de TRL: al incluir `metrics.jsonl`, `trl_log_history.json` y `pairs_final.jsonl`, permite contrastar paso a paso la evolución de la pérdida, el margen y la precisión de pares frente a una traza conocida.
- Análisis del compromiso recompensa-KL: los ficheros `evals.jsonl` y `plane/final.jsonl` permiten reproducir el plano recompensa frente a KL con 100 prompts retenidos, útil para estudiar cómo se degrada la política al optimizar preferencias.
- Estudio de la longitud de respuesta: la métrica de 115 tokens de media y un 19% de respuestas que alcanzan el límite de 256 tokens es un punto de partida para investigar el sesgo hacia respuestas largas inducido por DPO.
- Verificación de infraestructura: con 8 minutos en una A100 y 250 pasos, sirve como prueba de humo (smoke test) para validar que un entorno de entrenamiento con PEFT y TRL está correctamente configurado antes de lanzar experimentos mayores.
- Experimentos de fusión y cuantización: el adaptador puede fusionarse con el base y cuantizarse para medir la pérdida de precisión en pares retenidos tras la compresión, aunque el autor no publica resultados en ese eje.
- Comparación de modelos de recompensa: el uso de dos jueces distintos (`Skywork-Reward-V2-Qwen3-0.6B` en entrenamiento y `Skywork-Reward-V2-Llama-3.2-1B` en evaluación) ofrece un caso concreto para estudiar la sensibilidad de las métricas al evaluador.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la evaluación propia de la práctica (`hw4_lib.llm.evaluate_adapter`). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | Valor |
|---|---|
| Precision en pares retenidos (816 pares filtrados de `test_prefs`) | 0,652 |
| Divergencia KL respecto al modelo base (100 prompts retenidos) | 0,12 |
| Longitud media de respuesta / proporcion que alcanza el límite de 256 tokens | 115 tokens / 19% |
| Modelo de recompensa de entrenamiento `Skywork/Skywork-Reward-V2-Qwen3-0.6B` (puntuacion media) | −1,06 |
| Modelo de recompensa retenido `Skywork/Skywork-Reward-V2-Llama-3.2-1B` (puntuacion media) | 2,06 |

Las puntuaciones de los modelos de recompensa tienen un desplazamiento arbitrario y solo deben interpretarse como diferencias respecto al modelo base sobre los mismos prompts, tal como advierte el autor.

## Requisitos de hardware

- VRAM para inferencia: el adaptador bf16 ocupa del orden de 18-20 MB; sumado al modelo base en bf16 (unos 3,1 GB de pesos) el total ronda los 3,2 GB, más caché KV.
- Cuantización: en 8-bit el conjunto baja a unos 1,7 GB y en 4-bit a alrededor de 1 GB, lo que deja margen amplio en GPUs de consumo.
- GPU recomendadas: cualquier GPU con 6 GB o más es suficiente para inferencia en bf16 a contexto corto; para contextos largos conviene 12-16 GB. El entrenamiento de referencia se ejecutó en una A100.
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090, incluso con el adaptador fusionado.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM y TGI tras fusionar los pesos, llama.cpp/Ollama mediante conversión a GGUF del modelo fusionado.
- Latencia y throughput: no disponibles en la información proporcionada. El único dato de coste es el entrenamiento (unos 8 minutos, 250 pasos, lote 8, una A100).

## Comparativa con modelos similares

No se dispone de resultados de benchmarks del adaptador frente a alternativas, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. Los datos de rendimiento de las alternativas no están en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| hw4-f26-dpo-ref (este) | 1,54 B + LoRA r8 | 32.768 (heredado del base) | apache-2.0 | Adaptador PEFT en HF | Precisión en pares 0,652; KL 0,12 |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,54 B | 32.768 | apache-2.0 | Pesos completos en HF | No disponible en esta ficha |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 | apache-2.0 (salvo excepciones por tamano en la familia) | Pesos completos en HF | No disponible en esta ficha |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 131.072 | Llama 3.2 Community License | Pesos completos en HF | No disponible en esta ficha |

## Limitaciones y advertencias

- Artefacto didáctico: es un adaptador de referencia para una práctica universitaria, no un modelo validado para uso en producción. No hay evaluación de seguridad, sesgos ni robustez.
- Requiere el modelo base: el repositorio solo contiene el adaptador LoRA; sin `Qwen/Qwen2.5-1.5B-Instruct` no es utilizable.
- Entrenamiento de escala mínima: 2.000 pares, 250 pasos y una época. El ajuste es superficial y puede no generalizar fuera de la distribución de UltraFeedback.
- Sesgo de longitud: un 19% de las respuestas generadas alcanza el límite de 256 tokens y la media es de 115, lo que sugiere una tendencia a respuestas largas que puede confundirse con mejoras de calidad.
- Idiomas: la model card no declara idiomas; el entrenamiento con UltraFeedback es mayoritariamente en inglés, por lo que el comportamiento en castellano no está caracterizado.
- Riesgo de alucinación: heredado del modelo base de 1,5 B, acentuado en un adaptador entrenado solo con preferencias y sin datos de conocimiento factual.
- Evaluación dependiente del juez: las puntuaciones de recompensa proceden de modelos Skywork con desplazamiento arbitrario y no son comparables en valor absoluto entre ejecuciones.
- Licencia: apache-2.0 permite uso comercial del adaptador, pero debe verificarse también la licencia y las condiciones del modelo base y de los datos de UltraFeedback empleados.
- Sin garantía de mantenimiento: el repositorio pertenece a una cuenta de curso con 0 descargas y 0 likes, creado y actualizado el mismo día, sin historial de versiones más allá de la revisión fijada.

## Enlaces

- HuggingFace: https://huggingface.co/fall2026-cs8803-drl/hw4-f26-dpo-ref
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de preferencias: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Modelo de recompensa de entrenamiento: https://huggingface.co/Skywork/Skywork-Reward-V2-Qwen3-0.6B
- Modelo de recompensa de evaluación: https://huggingface.co/Skywork/Skywork-Reward-V2-Llama-3.2-1B
- TRL (DPOTrainer): https://github.com/huggingface/trl
- PEFT: https://github.com/huggingface/peft

Nota: las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces anteriores proceden de la información de HuggingFace y de las dependencias citadas en la model card.
