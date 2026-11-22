# moeshawky/RockAndEgg-313M-v2

## Resumen

RockAndEgg-313M-v2 es un backbone transformer derivado de Qwen3-0.6B-Base mediante truncamiento físico de profundidad: conserva los 10 primeros bloques del modelo donante (de 28 totales) y descarta el resto, manteniendo intactas la anchura, la topología de atención, el tokenizador y el vocabulario originales. El resultado es un modelo de 312.892.928 parámetros (frente a los 596M del Qwen3-0.6B-Base) sin cabeza de modelado de lenguaje ni cabeza de clasificación, pensado como extractor de representaciones para tareas discriminativas.

Lo desarrolla el autor independiente moeshawky dentro del proyecto RockAndEgg, cuya hipótesis de trabajo es que un decoder compacto puede adaptarse competitivamente a comprensión del lenguaje discriminativa frente a baselines BERT y DeBERTa de tamaño comparable. La versión 2 incorpora entrenamiento multi-tarea de representaciones y selecciona la configuración sin regularización por dispersión (dispersion OFF) tras un estudio controlado de 4.800 pasos sobre un checkpoint fundacional en el paso 600.

Su relevancia actual es doble: por un lado, ofrece un punto de partida de 313M parámetros con licencia Apache 2.0 para clasificación de texto, similitud semántica y NLI; por otro, documenta de forma explícita un experimento de cirugía de modelos (depth pruning) con métricas de retención de rendimiento, algo poco habitual en releases de este tamaño. No es un modelo de chat, ni un generador de texto competente, ni un clasificador zero-shot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3Model sin cabeza (headless), transformer causal con grouped-query attention |
| Parametros totales | 312.892.928 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 posiciones configuradas; evaluado a 128 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 safetensors) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16) |

Otros datos técnicos: 10 de 28 capas transformer (bloques 0-9), hidden size 1.024, intermediate size 3.072, 16 cabezas de atención, 8 cabezas KV, normalización RMSNorm, vocabulario de 151.936 tokens, interfaz prevista `AutoModel` de Hugging Face, tamaño del repo 1,9 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only con atención agrupada por consultas (GQA), idéntica en familia a Qwen3 pero recortada en profundidad: se eliminan 18 de los 28 bloques y se conservan los pesos preentrenados reales de los bloques 0-9, no una reconfiguración del fichero de configuración ni una destilación estilo MiniLM. Esto supone una reducción del 64,3% en profundidad y de aproximadamente el 47,5% en parámetros respecto al donante. El autor investigó también estrechamiento de FFN y destilación profesor-alumno, y ninguna de las dos opciones produjo un punto operativo mejor en las condiciones probadas.

Sobre esa base truncada se aplicó entrenamiento multi-tarea de representaciones (fase RAE-TPU-003) hasta un checkpoint fundacional en el paso 600, seguido de una continuación controlada (RAE-005) de 4.800 pasos en la que se comparó regularización auxiliar por dispersión activada frente a desactivada; la variante seleccionada fue dispersion OFF. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La atención es causal, no bidireccional, lo que conviene no confundir con el régimen de BERT o DeBERTa.

## Capacidades

- Extracción de representaciones contextuales para texto en inglés mediante `AutoModel`, sin cabeza de salida incluida.
- Clasificación de texto, análisis de sentimiento, inferencia de lenguaje natural (NLI) y detección de paráfrasis, previa incorporación de una cabeza entrenada.
- Regresión de similitud semántica y tareas de ranking o scoring con cabezas específicas.
- Transfer learning y adaptación a dominios concretos con ontologías de etiquetas definidas por el usuario.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Uso como objeto de estudio para investigación en transformers causales truncados en profundidad y geometría de representaciones.

## Casos de uso

- Moderación de contenido en inglés: se entrena una cabeza de clasificación multietiqueta sobre las representaciones del backbone para detectar categorías de toxicidad o spam; el tamaño de 313M permite desplegar el par backbone+cabeza en una sola GPU de consumo.
- Análisis de sentimiento en reseñas de producto: ajuste fino supervisado de una cabeza lineal o MLP sobre las features congeladas o con fine-tuning parcial, aprovechando que la versión 2 mejora el rendimiento en sentimiento con features congeladas respecto a la v1.
- Deduplicación y agrupación semántica de documentos: generación de embeddings por secuencia y cálculo de similitud coseno para clustering de tickets de soporte o artículos duplicados, dado el objetivo declarado de similitud semántica.
- Enrutamiento de consultas en pipelines RAG: clasificador ligero que decide a qué índice o herramienta dirigir una consulta entrante, con latencia baja por el reducido número de capas.
- Investigación en transferencia bajo restricciones de tamaño: comparación controlada frente a BERT-base y DeBERTa-v3-base en las mismas tareas downstream, usando el modelo como brazo experimental de un backbone causal truncado.
- Filtrado previo en pipelines de anotación: puntuación de pares de frases para priorizar ejemplos informativos antes de la revisión humana en proyectos de etiquetado.
- Extracción de features para modelos tabulares o híbridos: congelar el backbone y usar el último estado oculto como entrada de un clasificador ligero en producción, minimizando el coste de reentrenamiento.

## Benchmarks y rendimiento

Los únicos datos numéricos publicados corresponden a un estudio de arquitectura sobre descendientes con ajuste fino específico de tarea, no al modelo fundacional sin cabeza en modo zero-shot. Se reproducen tal cual, con esa advertencia:

| Arquitectura | Parametros | Macro-AUPRC en held-out |
|---|---:|---:|
| Qwen3 completo, 28 capas | 596,1M | 0,9864 |
| Qwen3 truncado, 10 capas | 312,9M | 0,9850 |

Estas cifras proceden de una aplicación concreta de clasificación semántica con ocho salidas, sobre descendientes ajustados por separado. No hay resultados publicados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de representaciones (MTEB u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 0,7-0,9 GB solo para pesos, más activaciones y buffers; con secuencias de 128 tokens el consumo total se mantiene por debajo de 2 GB en la práctica.
- En cuantización INT8 el peso ronda los 0,35 GB; en INT4, unos 0,2 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema, y en las dos últimas el modelo queda enormemente infrautilizado.
- Cabe holgadamente en GPU de consumo, incluidas portátiles con 6-8 GB, y probablemente en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` con `AutoModel` es la vía prevista; el tag `text-embeddings-inference` sugiere compatibilidad con TEI; `endpoints_compatible` indica compatibilidad con Inference Endpoints de Hugging Face. No hay confirmación de soporte en vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible. Con 10 capas y 1.024 de hidden size se espera un coste por token muy inferior al del Qwen3-0.6B-Base original, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Notas |
|---|---:|---|---|---|---|
| RockAndEgg-313M-v2 | 312,9M | 32.768 config. (evaluado a 128) | Decoder causal truncado, sin cabeza | Apache 2.0 | Orientado a features discriminativas |
| Qwen3-0.6B-Base | 596,1M | 32.768 | Decoder causal completo | Apache 2.0 | Modelo donante; conserva cabeza LM |
| BERT-base | ~110M | 512 | Encoder bidireccional | Apache 2.0 | Baseline estándar en clasificación; contexto mucho menor |
| DeBERTa-v3-base | ~184M | 512 | Encoder bidireccional con atención disentangled | MIT | Baseline fuerte en NLI y similitud semántica |

La comparación con BERT-base y DeBERTa-v3-base es la que el propio autor declara como objetivo del programa RockAndEgg, pero según la model card ese objetivo «aún no se ha establecido»; no hay por tanto evidencia publicada de que RockAndEgg supere a esos baselines en las mismas tareas. Frente a Qwen3-0.6B-Base, la diferencia clave es que RockAndEgg no genera texto de forma competente y no incluye cabeza de lenguaje.

## Limitaciones y advertencias

- No es un clasificador zero-shot: carece de ontología de etiquetas y de cabeza de decisión universal; requiere entrenamiento downstream.
- No es un modelo de chat ni sigue instrucciones; no debe usarse como generador de texto general.
- La atención es causal, no bidireccional; los resultados de BERT o DeBERTa no son directamente transferibles en cuanto a comportamiento de las representaciones.
- El contexto configurado es de 32.768 posiciones, pero la evaluación se realizó a 128 tokens; el comportamiento más allá de esa longitud no está validado en la información disponible.
- Solo inglés declarado; el rendimiento en otros idiomas, incluido el castellano, no está documentado.
- Riesgo de alucinación y sesgos: no evaluado ni documentado en la model card; al derivar de Qwen3-0.6B-Base hereda los sesgos de su corpus de preentrenamiento, sin que se hayan publicado análisis al respecto.
- Las cifras de retención de rendimiento (0,9850 frente a 0,9864 de macro-AUPRC) provienen de una única aplicación de clasificación con ocho salidas y de descendientes ajustados, no del modelo publicado; no deben extrapolarse a otras tareas.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3-0.6B-Base conviene verificar el cumplimiento de las condiciones del modelo donante en la distribución de derivados.
- Proyecto independiente con 577 descargas y 0 likes en el momento de la consulta; sin validación externa ni adopción comunitaria significativa.
- No hay variantes cuantizadas publicadas ni confirmación de soporte en runtimes de inferencia distintos de `transformers`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moeshawky/RockAndEgg-313M-v2
- Versión original: https://huggingface.co/moeshawky/RockAndEgg-313M
- Modelo donante: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Paper de Qwen3 referenciado en los tags: https://arxiv.org/abs/2505.09388
- Paper referenciado en los tags (arXiv:2506.05176): https://arxiv.org/abs/2506.05176
