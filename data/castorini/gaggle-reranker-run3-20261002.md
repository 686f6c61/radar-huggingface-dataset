# castorini/gaggle-reranker-run3-20261002

## Resumen

`castorini/gaggle-reranker-run3-20261002` es un reranker pointwise de 3,22 mil millones de parámetros desarrollado por el grupo Castorini (Jimmy Lin, Sahel Sharifymoghaddam, Lingwei Gu y Nour Jedidi) dentro del proyecto Greenhouse. No genera texto: puntúa la relevancia de un pasaje respecto a una consulta para reordenar los candidatos que devuelve un recuperador de primera etapa como BM25. Es una de las cuatro ejecuciones de ajuste fino que después se promedian en `castorini/gaggle-reranker-20261005` (el reranker base de Gaggle); la model card la identifica como "baseline run 3", una replicación independiente del plan de la ejecución 1 sobre otro clúster con la misma semilla.

Su interés principal es que no depende de ningún backbone de pesos abiertos de terceros: el backbone nanochat depth-34 se preentrenó desde cero sobre ClimbMix y luego se ajustó sobre RLHN-250K (247.534 instancias, una época). La arquitectura es un transformer causal de 34 capas, ancho 2.176, 17 cabezas de dimensión 128 y 2.048 tokens de contexto, con ajuste fino completo en FP32 sobre 2 × NVIDIA RTX PRO 6000 Blackwell.

La puntuación se obtiene como `s(q, d) = logit(" true") − logit(" false")` en el último token del prompt, leyendo dos filas preentrenadas del LM head (4.352 parámetros) y sin cabeza de clasificación. Las cuatro ejecuciones comparten receta y solo difieren en semilla, hardware y empaquetado de microbatches, con una desviación estándar muestral de 0,001 en las medias de benchmark y 0,003 en colecciones individuales: por debajo de ese umbral las diferencias entre checkpoints son ruido, no señal. Se distribuye bajo licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer nanochat depth-34 (34 capas, ancho 2.176, 17 cabezas de dimensión 128), atención causal |
| Parámetros totales | 3 215 335 146 (3,22 B), ajuste fino completo |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (backbone); entrenado con truncado de 128 tokens de consulta y 512 de pasaje |
| Tipos de cuantización | no disponible (solo se publican pesos en fp32; el ejemplo oficial carga en bfloat16) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors en fp32, con `model.safetensors.index.json`; código de arquitectura en `configuration_gaggle.py` y `modeling_gaggle.py` (requiere `trust_remote_code=True`) |

Parámetros adicionales de configuración: prompt `<|bos|>Query: {query}\nPassage: {passage}\nRelevant:`; tamaño del repositorio 12,9 GB; librería declarada `nanochat`.

## Arquitectura y entrenamiento

El modelo es un transformer causal denso, no un MoE ni una arquitectura híbrida. El backbone procede de `castorini/gaggle-nanochat-pretrained-climbmix-20260924`, preentrenado desde cero sobre el corpus ClimbMix, y sobre él se realiza un ajuste fino completo de los 3,22 B de parámetros. La puntuación de relevancia no usa cabeza de clasificación: se leen dos filas del LM head (`" true"` y `" false"`, 4.352 parámetros en total) y se calcula la diferencia de logits en el último token del prompt.

El ajuste se hizo sobre RLHN-250K (247.534 instancias, una época) con objetivo LCE a τ = 1 sobre un positivo y K ∈ {7, 15, 23} negativos duros por consulta. La optimización empleó AdamW (β = 0,9/0,95, weight decay 0,01), learning rate máximo de 5 × 10⁻⁵, 150 pasos de calentamiento seguidos de decaimiento coseno hasta cero, recorte de gradiente con norma global 12, 128 grupos de consultas por actualización, semilla 17 y 1.931 actualizaciones. Se entrenó con pesos y estado del optimizador en FP32, matmuls en TF32 y gradient checkpointing, sobre 2 × NVIDIA RTX PRO 6000 Blackwell (96 GB) con un presupuesto de 39.312 tokens de microbatch por GPU. El entrenamiento finalizó el 2 de octubre de 2026. No se documenta RLHF ni DPO, ya que no es un modelo generativo.

## Capacidades

- Puntuación pointwise de relevancia consulta-pasaje: devuelve un escalar por par, no texto.
- Reordenación de candidatos de primera etapa; evaluado explícitamente sobre los 100 mejores resultados de BM25.
- Entrenamiento con negativos duros (7, 15 o 23 por consulta), lo que refuerza la discriminación entre pasajes plausibles.
- Uso como componente de segunda etapa en pipelines de recuperación de información en inglés.
- Compatibilidad con `transformers` mediante `AutoModelForSequenceClassification` y `compute_score(...)` con `trust_remote_code=True`.
- Reconstrucción del checkpoint original de entrenamiento con `to_nanochat_ckpt.py` (ida y vuelta bit a bit) para el arnés de evaluación del paper.
- No dispone de tool calling ni function calling: no es un modelo de instrucciones.
- No dispone de capacidades de agente, razonamiento multi-paso, visión, audio ni modo thinking (no documentadas y fuera de su propósito).
- Capacidad multilingüe: no, está entrenado y declarado únicamente para inglés.
- El truncado de 128/512 tokens es una convención de entrenamiento, no se aplica obligatoriamente en inferencia; el backbone admite hasta 2.048 tokens.

## Casos de uso

- Reordenación en pipelines RAG: recuperar entre 50 y 100 candidatos con BM25 o un retriever denso y reordenarlos con este modelo antes de inyectarlos en el prompt del LLM generador. Con nDCG@10 medio de 0,6407 en TREC DL frente a 0,393 de BM25, el filtrado reduce el ruido del contexto.
- Búsqueda documental empresarial en inglés: indexación de manuales, políticas internas o documentación técnica, con reordenación de los resultados del motor de búsqueda para priorizar los pasajes realmente relevantes.
- QA sobre literatura biomédica: el modelo se evalúa en colecciones del dominio (COVID 0,8615, NFCorpus 0,3801, SciFact 0,7842), por lo que es adecuado para reordenar respuestas y citas en asistentes clínicos o de investigación.
- Búsqueda de noticias y archivos periodísticos: con 0,5157 en la colección News y 0,5910 en Robust04, sirve para priorizar artículos relevantes en agregadores y hemerotecas digitales.
- Atención al cliente sobre base de conocimiento: reordenar artículos de ayuda en inglés antes de que un LLM redacte la respuesta, reduciendo respuestas fundamentadas en documentos irrelevantes.
- Evaluación y diagnóstico de recuperadores de primera etapa: usar la puntuación del reranker como referencia para medir cuánto recall se pierde en el retriever y ajustar el tamaño del candidato inicial.
- Investigación en IR reproducible: al liberar las cuatro ejecuciones individuales, permite estudiar la varianza atribuible a semilla, clúster y empaquetado de microbatches en lugar de asumir un único checkpoint promediado.
- Baseline en experimentos académicos: al ser un modelo entrenado desde cero y con pesos abiertos, sirve como referencia auditable frente a rerankers basados en backbones de terceros.

## Benchmarks y rendimiento

Evaluación con nDCG@10 reordenando los 100 mejores candidatos de BM25, truncado 128/512 y `trec_eval`.

| Colección (TREC DL) | BM25 (primera etapa) | Este modelo |
|---|---:|---:|
| DL19 | 0,506 | 0,7550 |
| DL20 | 0,480 | 0,7202 |
| DL21 | 0,446 | 0,7137 |
| DL22 | 0,269 | 0,5331 |
| DL23 | 0,263 | 0,4813 |
| **Media** | **0,393** | **0,6407** |

| Colección (BEIR) | BM25 (primera etapa) | Este modelo |
|---|---:|---:|
| COVID | 0,595 | 0,8615 |
| News | 0,395 | 0,5157 |
| Robust04 | 0,407 | 0,5910 |
| NFCorpus | 0,322 | 0,3801 |
| SciFact | 0,679 | 0,7842 |
| SCIDOCS | 0,149 | 0,2335 |
| FiQA | 0,236 | 0,4517 |
| **Media** | **0,398** | **0,5454** |

Variabilidad entre las cuatro ejecuciones: desviación estándar muestral de 0,001 en las medias de benchmark y 0,003 en colecciones individuales. El promedio (soup) de las cuatro ejecuciones alcanza 0,641 en TREC DL y 0,547 en BEIR. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, y no serían aplicables a un modelo de reordenación.

## Requisitos de hardware

- Pesos publicados en fp32: 12,9 GB en disco y en VRAM (tamaño real del repositorio).
- Estimación en bfloat16/fp16: en torno a 6,5 GB solo para los pesos. El ejemplo oficial de la model card carga con `dtype=torch.bfloat16` y `.to("cuda")`.
- Estimación en int8: en torno a 3,2 GB, e int4 en torno a 1,6 GB, pero no se publican conversiones cuantizadas, por lo que estas cifras son hipotéticas.
- GPU de consumo: cabe con holgura en RTX 4090, RTX 3090, RTX 4080 o RTX 4070 Ti Super (16-24 GB) en bfloat16. En tarjetas de 8-12 GB solo sería viable con cuantización no publicada.
- GPU de datacenter: A100, H100 o L40S son válidas por capacidad, aunque el modelo es pequeño para aprovechar su ancho de banda. El entrenamiento se realizó en 2 × NVIDIA RTX PRO 6000 Blackwell (96 GB).
- El contexto de 2.048 tokens mantiene la memoria de activaciones baja, muy por debajo de lo habitual en modelos generativos.
- Despliegue verificado: `transformers` con `AutoModelForSequenceClassification`, `trust_remote_code=True` y `compute_score(...)`; librería `nanochat`; script `to_nanochat_ckpt.py` para reconstruir el checkpoint de entrenamiento.
- Despliegue no documentado: vLLM, TGI, llama.cpp, Ollama y formatos GGUF no aparecen en la model card; no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | nDCG@10 TREC DL (media) | nDCG@10 BEIR (media) | Licencia |
|---|---|---:|---:|---:|---|
| gaggle-reranker-run3-20261002 | 3,22 B | 2.048 | 0,6407 | 0,5454 | MIT |
| gaggle-reranker-20261005 (soup de 4 ejecuciones) | 3,22 B | 2.048 | 0,641 | 0,547 | MIT |
| BM25 (primera etapa, referencia) | No aplica | No aplica | 0,393 | 0,398 | No aplica |
| gaggle-nanochat-pretrained-climbmix-20260924 (modelo base) | 3,22 B | 2.048 | no disponible | no disponible | No especificada en la información disponible |
| BGE-Reranker-v2-M3 | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |
| Qwen3-Reranker | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |
| Jina Reranker v3.5 | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

Las búsquedas web sitúan BGE-Reranker-v2-M3, Qwen3-Reranker y Jina Reranker v3.5 como alternativas habituales de la misma categoría, pero los resultados encontrados no incluyen cifras concretas de parámetros, contexto, licencia ni nDCG, por lo que no se pueden comparar numéricamente con rigor. No se dispone de datos directos de latencia o coste de cómputo para ninguno de ellos en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: entrenado y evaluado únicamente en inglés; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Ventana limitada a 2.048 tokens, con truncado de entrenamiento de 128 tokens de consulta y 512 de pasaje. Consultas largas o pasajes extensos se recortan y pueden perder información relevante.
- No genera texto: no puede usarse para responder preguntas ni para tareas generativas, solo para puntuar pares consulta-pasaje.
- Sensibilidad al prompt: la puntuación depende de leer dos filas concretas del LM head con el formato `<|bos|>Query: {query}\nPassage: {passage}\nRelevant:`. Cualquier variación del formato puede degradar las puntuaciones sin aviso.
- Umbral de ruido: diferencias inferiores a 0,003 en colecciones individuales y 0,001 en medias entre estas cuatro ejecuciones no son señal estadística.
- Adopción nula verificable: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- Licencia de los pesos MIT, pero la procedencia de los datos arrastra términos propios: RLHN-250K es CC-BY-SA-4.0 y está curado a partir de siete colecciones de la mezcla de entrenamiento de BGE con licencias variables; ClimbMix, el corpus de preentrenamiento del backbone, es CC-BY-NC-4.0. La cláusula no comercial del corpus de preentrenamiento es un riesgo que conviene revisar antes de un uso comercial, tal como advierte la propia model card ("downstream users should check against their intended use").
- No se publican estado del optimizador ni estado del RNG: el modelo sirve para inferencia, pero no permite reanudar el entrenamiento.
- El uso requiere `trust_remote_code=True`, lo que implica ejecutar código Python del repositorio (`configuration_gaggle.py`, `modeling_gaggle.py`); conviene auditar ese código antes de desplegarlo en producción.
- No hay información sobre sesgos, robustez adversarial, comportamiento fuera de dominio ni evaluación de sesgo de posición en la reordenación.
- Tamaño de repositorio elevado (12,9 GB) por publicarse los pesos en fp32, sin variantes cuantizadas que reduzcan el coste de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/castorini/gaggle-reranker-run3-20261002
- Reranker base (soup de las cuatro ejecuciones): https://huggingface.co/castorini/gaggle-reranker-20261005
- Modelo base preentrenado: https://huggingface.co/castorini/gaggle-nanochat-pretrained-climbmix-20260924
- Dataset de ajuste fino RLHN-250K: https://huggingface.co/datasets/rlhn/rlhn-250K
- Corpus de preentrenamiento ClimbMix: https://huggingface.co/datasets/nvidia/ClimbMix
- Paper (arXiv 2610.11922): https://arxiv.org/abs/2610.11922
- Comparativa de rerankers en local-ai-zone: https://local-ai-zone.github.io/guides/best-ai-reranker-models-ultimate-ranking-2026.html
- Ranking de rerankers de pesos abiertos en Presenc AI: https://presenc.ai/research/best-open-weight-reranker-models-2026
- Rankings de reranking en OpenRouter: https://openrouter.ai/rankings/rerank
- Guía de modelos de reranking en Machine Learning Mastery: https://machinelearningmastery.com/top-5-reranking-models-to-improve-rag-results/
- Leaderboard de modelos de Prompeteer: https://prompeteer.ai/leaderboard
