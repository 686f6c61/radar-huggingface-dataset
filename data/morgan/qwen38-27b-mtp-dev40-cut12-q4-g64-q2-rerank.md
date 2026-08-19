# morgan/qwen38-27b-mtp-dev40-cut12-q4-g64-q2-rerank

## Resumen

El repositorio `morgan/qwen38-27b-mtp-dev40-cut12-q4-g64-q2-rerank` no contiene un modelo de lenguaje completo, sino un **artefacto de cabeza de predicción multi-token (MTP)** diseñado para acelerar la inferencia del modelo base Qwen/Qwen3.8-27B mediante **decodificación especulativa nativa** en el ecosistema Apple MLX. El autor es `morgan`, que publica este componente como parte de un desafío técnico de optimización de modelos Qwen sobre MLX (referenciado en el enlace de W&B).

El artefacto está compuesto por 40 tensores con un peso total de 0,4 GB, cuantizados de forma mixta: ocho matrices principales en formato affine 4-bit con group-size 64, siete vectores de normalización en BF16, seis tensores de islas QKV en BF16 exacto, y un `draft_lm_head` con cuantificación affine 2-bit y rerank affine 4-bit. No es un modelo autónomo: requiere el backbone fijo de Qwen3.8-27B y un runtime compatible que verifique cada token propuesto.

La relevancia de este artefacto radica en que permite reducir la latencia de generación del modelo base sin modificar su calidad, al proponer múltiples tokens futuros en paralelo que el modelo objetivo valida de forma determinista. El autor reporta una tasa de aceptación media del 63,4 % en una evaluación de 256 prompts, con una longitud media de compromiso de 3,54 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Head MTP para decodificación especulativa (no es un LLM completo) |
| Parámetros totales | 129.314.304 (tensor payload de safetensors) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base; el head se entrenó con seq len 11264) |
| Tipos de cuantización | Q4/G64 (8 matrices), Q2 (draft_lm_head), BF16 (normalización y islas QKV) |
| Idiomas soportados | No disponible (heredados del modelo base Qwen3.8-27B) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El artefacto es un **head de predicción multi-token** diseñado para la decodificación especulativa nativa. Su arquitectura se compone de 15 tensores en BF16 (exportación original del checkpoint Dev40 cut-12k) que se empaquetan en un núcleo de 31 tensores con cuantización affine 4-bit y group-size 64. Además, incorpora seis tensores de islas QKV (precisión BF16 exacta) y un `draft_lm_head` con cuantización affine 2-bit para el corto plazo de 32 tokens, seguido de un rerank exacto affine 4-bit.

El entrenamiento se realizó sobre el checkpoint `q38-d40v2-cut12000` con los siguientes hiperparámetros: K=4 (profundidad de predicción), pérdida de aceptación con beta 0.6, secuencia de longitud 11264, 12000 pasos con horizonte coseno y 600 de warmup, tasa de aprendizaje AdamW de 5e-6 y Muon de 5e-5. La validación común de 4049 filas alcanzó un objetivo de 0.54597. El autor no proporciona detalles sobre la composición exacta del dataset de entrenamiento, pero indica que se usó la selección `Dev40v2 minimum-step-12000`.

La innovación principal es la **composición de precisión mixta**: las matrices QKV se mantienen en BF16 exacto mediante índices de islas, mientras que las matrices de peso principal se cuantifican a 4 bits con group-size 64, y el cabezal de lectura final se cuantifica a 2 bits con rerank. Esto permite mantener la fidelidad de las capas críticas mientras se reduce el uso de memoria y se acelera la inferencia en Apple Silicon.

## Capacidades

- **Predicción multi-token**: el head propone hasta K tokens futuros (en este caso K=4) para que el modelo base los verifique, reduciendo el número de pasos de inferencia.
- **Compatibilidad con MLX**: diseñado específicamente para el runtime MLX de Apple, con validación de paridad exacta en hardware M4 Pro.
- **Verificación determinista**: el modelo base (Qwen3.8-27B) verifica cada token emitido, por lo que no altera la calidad de generación.
- **Rerank de precisión**: el `draft_lm_head` con affine 2-bit y rerank affine 4-bit mejora la precisión de las propuestas sin sobrecargar la latencia.
- **No tiene capacidades propias de generación, visión, tool calling o razonamiento**: son heredadas del modelo base.

## Casos de uso

- **Aceleración de inferencia en Apple Silicon**: el artefacto permite reducir la latencia de generación de Qwen3.8-27B en dispositivos Mac con MLX, útil para aplicaciones de chat o asistentes locales que requieren respuesta rápida.
- **Despliegue en entornos con GPU limitada**: al reducir el número de pasos de decodificación, se reduce el consumo energético y se mejora el throughput en hardware de un solo chip.
- **Investigación en decodificación especulativa**: sirve como referencia de implementación para heads MTP con cuantización mixta y verificación determinista.
- **Integración en pipelines de RAG**: al acelerar la generación, se puede mejorar la latencia de sistemas que combinan recuperación y generación con el modelo base.
- **Prototipado de agentes**: la menor latencia permite iterar más rápido en tareas de multi-step reasoning con tool calling, aunque el artefacto no implementa estas capacidades directamente.
- **Evaluación de calidad de predicción**: el head puede usarse para medir la aceptación de tokens en diferentes dominios, útil para investigación en MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este artefacto, ya que no es un modelo de lenguaje completo. Los datos de rendimiento disponibles se centran en la calidad de predicción del head:

| Métrica | Valor |
|---|---|
| Longitud media de compromiso | 3.536 |
| Tasa de aceptación de draft | 0.634 |
| Aceptación por profundidad (K=1..4) | 0.840 / 0.684 / 0.558 / 0.454 |

En una prueba de latencia en Apple M4 Pro (48 GiB, macOS 26.5.2, Metal 32023.883) con una ventana de 128 tokens, el artefacto obtuvo **0.0560 s/token** con 128/128 tokens exactos y un ledger de 136/136. El autor indica que este resultado es direccional y que solo la runner oficial M5 puede determinar el ranking de promoción.

## Requisitos de hardware

- **VRAM estimada**: el artefacto ocupa 0.4 GB, pero requiere el modelo base Qwen3.8-27B (~27B params). En MLX, el modelo base cuantizado a Q4 necesita aproximadamente 16-20 GB de VRAM, por lo que se recomienda un Mac con al menos 32 GB de memoria unificada.
- **GPU recomendada**: Apple Silicon con soporte MLX (M4 Pro probado por el autor). No se han validado GPUs NVIDIA.
- **Compatibilidad con consumer GPU**: no aplica, el artefacto está diseñado para MLX en Apple Silicon.
- **Opciones de despliegue**: MLX (runtime oficial), con integración en librerías como `huggingface_hub` para descarga. No es compatible con vLLM o llama.cpp en su estado actual.
- **Latencia/throughput**: en la prueba de M4 Pro, 0.056 s/token (latencia media). El throughput no se reporta.

## Comparativa con modelos similares

No hay un modelo comparable disponible en la información proporcionada. El artefacto es específico para el modelo base Qwen3.8-27B y no existen alternativas públicas del mismo tipo (heads MTP cuantizados para MLX) con las que comparar. Se podría comparar con el modelo base sin head, pero no se dispone de datos de latencia de referencia.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no puede usarse de forma independiente; requiere el modelo base Qwen3.8-27B y un runtime MLX que implemente la verificación.
- **Dependencia de MLX**: la validación de paridad se realizó solo en Apple Silicon (M4 Pro); no hay garantías de funcionamiento en otras plataformas.
- **Falta de benchmarks estándar**: no se reportan métricas de calidad (MMLU, HumanEval, etc.), por lo que no se puede evaluar el impacto en la calidad de generación más allá de la aceptación de tokens.
- **Riesgo de alucinación**: no aplica directamente, pero el modelo base puede alucinar; el head no corrige este comportamiento.
- **Cuantización agresiva**: el uso de Q2 en el `draft_lm_head` puede degradar la precisión de las propuestas en contextos de alta complejidad, aunque el rerank Q4 compensa parcialmente.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B también es Apache 2.0; no se identifican restricciones adicionales.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/morgan/qwen38-27b-mtp-dev40-cut12-q4-g64-q2-rerank)
- [Run de entrenamiento en W&B](https://wandb.ai/wandb-applied-ai-team/qwen38-mlx-challenge-senpai/runs/q38mtp-20260818-163155-e97e8d11)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Guía de Qwen3.8-27B (kingy.ai)](https://kingy.ai/blog/qwen3-8-27b-specs-benchmarks-local-hardware/)
- [Guía completa de Qwen3.8-27B (lovableapp.org)](https://lovableapp.org/blog/qwen3-8-27b)
