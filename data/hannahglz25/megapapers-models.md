# hannahglz25/megapapers-models

## Resumen

megapapers-models es una colección de ocho modelos de lenguaje de 7B parámetros derivados de OLMo 3, publicada por hannahglz25 en Hugging Face. Siete de ellos son ejecuciones de preentrenamiento continuado (continued pretraining, CPT) sobre el checkpoint intermedio de AllenAI `Olmo-3-1025-7B` (etapa stage2, paso 47684), y el octavo es el checkpoint final oficial de AllenAI (`stage3-step11921`) incluido como referencia sin modificar. Ninguno está ajustado por instrucciones: todos son modelos base.

El propósito de la colección es experimental: estudiar cómo distintas composiciones de datos científicos (papers que citan y son citados, orden de citación, impacto de las referencias) afectan al comportamiento del modelo con contexto largo. Todos los modelos se entrenaron con una ventana de 65.536 tokens mediante escalado YaRN de RoPE, lo que los sitúa en el rango de contexto largo para un modelo de 7B.

La relevancia actual reside en que ofrece variantes controladas (token-matched) para aislar el efecto de la estructura de datos frente al volumen de tokens, algo poco habitual en publicaciones de modelos. La licencia es Apache 2.0, la misma que OLMo 3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo 3), con atención completa y escalado YaRN en capas de atención completa |
| Parametros totales | 7B (aproximado, según nomenclatura del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La base es OLMo 3 7B de AllenAI, un transformer decoder-only. Los siete modelos CPT parten del checkpoint de mitad de entrenamiento (stage2/step47684), antes de la etapa de contexto largo propia de AllenAI. El entrenamiento usa contexto de 65.536 tokens con YaRN RoPE (factor 8 desde 8.192, beta_fast 32, beta_slow 1) aplicado a las capas de atención completa, junto con document masking. El optimizador es SkipStepAdamW (0.9, 0.95) con weight decay 0.1, batch global de 32 × 65.536 tokens (~2,1M), learning rate 2,07e-4 con 200 pasos de warmup y decaimiento lineal.

Los datos son un epoch del split de entrenamiento de cada variante, en torno a 1.880 millones de tokens (menos para `medium-impact-citing-last`, más para `random-refs-citing-last`). Las variantes incluyen: papers independientes barajados (control token-matched), citante seguido de citados de alto impacto, citante al final, citados de impacto medio, referencias aleatorias y concatenación de tres papers no relacionados (control). El control `dolma3-longmino` se muestreó a exactamente 1.881.783.141 tokens, igual que `high-impact-citing-last`. El entrenamiento se realizó con OLMo-core v2.6.0 en 4× H100 por ejecución. Los papers dentro de una fila se unen con `</s>`. Los exports corrigen el tokenizador (dolma2 `tokenizer.json`, `max_position_embeddings` 65.536) y añaden `eos_token_id` `[100265, 100257]` en el checkpoint final sin alterar los pesos.

## Capacidades

- Generación de texto autoregresiva como modelo base (sin ajuste por instrucciones).
- Procesamiento de contexto largo: ventana de 65.536 tokens, adecuada para documentos extensos o múltiples papers concatenados.
- Razonamiento sobre texto científico y relaciones de citación, dado el dominio de los datos CPT.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible (modelo base, sin ajuste para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; requiere prompting o ajuste posterior.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre datos de preentrenamiento: comparar las siete variantes CPT para medir el efecto de la estructura de citación (orden, impacto, referencias aleatorias) frente a controles token-matched en tareas de contexto largo.
- Procesamiento de literatura científica: alimentar varios papers concatenados con `</s>` hasta 65.536 tokens para tareas de continuación, resumen extractivo o extracción de relaciones, aprovechando el dominio de entrenamiento.
- Evaluación de recuperación en contexto largo: usar los modelos como sujetos de prueba con RULER o HELMET para estudiar degradación con la distancia y el ruido documental.
- Base para ajuste supervisado (SFT): partir de una de las variantes CPT como inicialización para tareas downstream en dominio académico, en lugar del checkpoint oficial.
- Reproducción de experimentos: replicar las ejecuciones con OLMo-core v2.6.0 y los datasets de megapapers para validar resultados.
- Estudio de tokenización y empaquetado: analizar cómo el document masking y la concatenación con `</s>` afectan a la perplejidad en documentos largos.

## Benchmarks y rendimiento

La model card indica que los seis modelos CPT de variantes de datos se evaluaron a 64k con RULER (500 muestras por tarea) y, junto con el checkpoint final, con HELMET (7 categorías, con el juez GPT-4o de HELMET tal cual). Los resultados están en el repositorio megapapers bajo `olmo_cpt/eval_results/olmo3_64k/` (`ruler/`, `helmet/`). El control `dolma3-longmino` no se ha evaluado todavía. No se proporcionan cifras numéricas en la información disponible.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 14-16 GB solo para pesos de 7B, más caché KV; con contexto de 65.536 tokens la caché KV crece de forma notable y puede superar los pesos en GPUs de gama alta.
- GPU recomendadas: H100 (usadas en entrenamiento, 4× por ejecución), A100 80 GB para contexto completo; RTX 4090 (24 GB) puede alojar los pesos en bf16 pero el contexto máximo requerirá cuantización o atención con memoria eficiente.
- Cabe en GPU de consumo: sí para contextos moderados en RTX 4090/3090; para 65k tokens completos se recomienda cuantización o GPUs con más memoria.
- Opciones de despliegue: transformers ≥ 5 (necesario para leer `rope_parameters` y aplicar YaRN; exportado y evaluado con 5.15.1). Otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| megapapers-models (CPT) | 7B | 65.536 | Apache 2.0 | Base, CPT sobre OLMo 3; variantes experimentales de datos |
| allenai/Olmo-3-1025-7B (oficial) | 7B | no disponible en la información | Apache 2.0 | Checkpoint final de referencia incluido en la colección |
| Modelos base de 7B comparables | no disponible | no disponible | no disponible | No se dispone de datos de rendimiento para comparar |

No se dispone de datos de benchmarks ni de especificaciones de alternativas en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelos base sin ajuste por instrucciones: no siguen instrucciones de forma fiable ni están alineados; requieren prompting específico o ajuste posterior.
- Sesgos: no documentados en la información disponible; al derivar de OLMo 3 y de datos de papers científicos, pueden heredar sesgos del corpus y del dominio académico.
- Riesgo de alucinación: alto en generación libre, como en cualquier modelo base; no hay evaluación de factualidad reportada.
- Limitaciones de contexto: 65.536 tokens es el máximo; más allá no está soportado. El escalado YaRN requiere transformers ≥ 5; versiones anteriores pueden ejecutar sin YaRN y degradar el rendimiento en contexto largo.
- Idiomas: no se especifican; el dominio de entrenamiento CPT es científico, predominantemente en inglés.
- Licencia: Apache 2.0 permite uso comercial, pero los datos CPT contienen papers científicos cuyas fuentes y licencias deben consultarse en los datasets de megapapers; el uso comercial de los pesos no exime de respetar las licencias de los datos subyacentes.
- El control `dolma3-longmino` no está evaluado, por lo que las comparaciones con él carecen de resultados.
- Los recuentos de pasos difieren entre variantes por el empaquetado; no son directamente comparables como medida de esfuerzo de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/hannahglz25/megapapers-models
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Repositorio megapapers (resultados de evaluación en `olmo_cpt/eval_results/olmo3_64k/`): no disponible como URL en la información proporcionada
- Datasets de megapapers: no disponible como URL en la información proporcionada
- OLMo-core v2.6.0: no disponible como URL en la información proporcionada
