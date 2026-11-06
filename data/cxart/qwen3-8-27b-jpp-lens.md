# cxart/Qwen3.8-27B-jpp-lens

## Resumen

J++ lens para Qwen3.8-27B es un artefacto de interpretabilidad, no un modelo de lenguaje generativo. Lo publica cxart (Carter Allen) y consiste en una lente de espacio de trabajo (workspace lens) ajustada sobre el modelo base Qwen/Qwen3.8-27B siguiendo la receta y el código del artículo *J++ Lens: Jacobian Filtering Enables More Faithful Workspace Lenses* (Ayonrinde & Lindsey, 2026). Su función es leer los estados residuales internos del modelo y proyectarlos al espacio de vocabulario para inspeccionar qué representaciones latentes están activas en cada capa.

El archivo principal, `lens.pt`, ocupa 839 MB en fp32 y contiene lecturas para ocho capas del bloque final (8, 16, 24, 32, 37, 40, 48, 56) de un transformer de 64 bloques. Se carga con la librería `jpp_lens` y el mismo formato que `koayon/jpp-lenses`, por lo que es interoperable con el código del artículo.

Su relevancia es acotada pero específica: permite a investigadores en interpretabilidad aplicar técnicas de lectura de representaciones (logit lens, tuned lens, Jacobian lens) con una fidelidad medida superior a alternativas como R-lens, J-lens o logit lens sobre el mismo modelo base. No sirve para inferencia, generación ni despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lente de interpretabilidad (workspace lens) sobre transformer Qwen3.8-27B; no es un modelo generativo |
| Parametros totales | No aplica (artefacto de 839 MB en fp32); el modelo base Qwen3.8-27B tiene 27B |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible para la lente; depende del modelo base Qwen3.8-27B |
| Tipos de cuantizacion | No disponible (artefacto en fp32) |
| Idiomas soportados | No disponible (evaluación incluye ítems multilingües, sin detalle de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | `lens.pt` (PyTorch, fp32); metadatos en `jpp_stamp.json` y `jpp_expert_weights.json` |

## Arquitectura y entrenamiento

La lente se ajusta con la receta del artículo J++: 64 prompts de WikiText-103 (≥ 600 caracteres) truncados a 128 tokens, omitiendo las primeras 16 posiciones, con retropropagación LRP `rlens`. Se entrena un router k-means con 8 expertos y PCA de 64 componentes sobre 1.000 prompts, y se ajustan pesos de experto con signo sobre el 20% de los ítems de readout-eval que el modelo base responde correctamente (evaluados contra las respuestas greedy de Qwen3.8). La evaluación se realiza sobre el resto de ítems.

El ajuste completo requiere aproximadamente 1,5 horas en 4× H200. La lente cubre las capas 8, 16, 24, 32, 37, 40, 48 y 56, con objetivo en el bloque final (63). Los readouts resultan más informativos en las capas medias-tardías (37–48). El filtrado jacobiano (Jacobian filtering) es la innovación clave del artículo: filtra componentes del espacio de trabajo para mejorar la fidelidad de la lectura frente a lentes más simples.

## Capacidades

- Lectura de estados residuales internos del modelo Qwen3.8-27B en ocho capas concretas.
- Proyección de representaciones latentes al espacio de vocabulario (readout) para inspección cualitativa.
- Soporte de filtrado jacobiano (Readout Filtering) para mejorar la fidelidad de las lecturas.
- Evaluación en tareas de asociación, multihop, multilingüe, poesía y errores tipográficos.
- Integración con el código del artículo `koayon/jpp_lens` mediante `BaseLens.from_pretrained`.
- Uso con prompts de chat renderizados con el modo thinking desactivado.
- No soporta generación, tool calling, agentes ni otras capacidades de modelo generativo.

## Casos de uso

- Investigación en interpretabilidad mecanicista: inspeccionar qué conceptos activa Qwen3.8-27B en capas medias-tardías para un prompt dado, usando `lens.apply` con las capas 37–48 donde los readouts son mejores.
- Análisis de fidelidad de lentes: comparar la recall@10 de esta lente J++ (53,4%) frente a R-lens, J-lens y logit lens sobre el mismo modelo base para validar técnicas de lectura.
- Auditoría de representaciones multilingües: emplear los ítems multilingües del readout-eval para examinar cómo se alinean conceptos entre idiomas en el espacio latente.
- Estudio de errores tipográficos y robustez: usar los ítems de typo del conjunto de evaluación para analizar si el modelo mantiene representaciones estables ante perturbaciones superficiales.
- Reproducción de experimentos del artículo J++: reajustar o reutilizar la lente con el código de `koayon/jpp_lens` (commit `d7efc0de…`) para replicar los resultados publicados.
- Docencia y formación en interpretabilidad: demostrar en un cuaderno la diferencia entre logit lens y lentes con filtrado jacobiano usando un modelo de 27B como caso de estudio.
- Desarrollo de nuevas lentes: servir como referencia de formato y metadatos (`jpp_stamp.json`, `jpp_expert_weights.json`) para ajustar lentes sobre otros modelos base.

## Benchmarks y rendimiento

Evaluación sobre ítems held-out de readout-eval (asociación, multihop, multilingüe, poesía, typo; n = 312), con Readout Filtering activado. Métrica: Recall@10 en la mejor capa.

| Lente | Recall@10 |
|---|---|
| J++ (esta lente) | 53,4% (IC 95%: 49,1–57,5) |
| R-lens (mismo ajuste) | 44,0% |
| J-lens | 38,7% |
| Logit lens | 31,9% |

Referencia: la lente J++ del artículo sobre Qwen3.6-27B obtiene 55,2%. Los readouts son mejores en las capas 37–48. El desglose por eval y pass@k está en `eval_ranks_pass_at_k.csv`.

## Requisitos de hardware

- La lente en sí ocupa 839 MB en fp32 y puede cargarse en CPU o GPU con memoria suficiente.
- Para aplicar la lente es necesario cargar el modelo base Qwen3.8-27B, lo que domina los requisitos: se recomienda GPU con al menos 60–80 GB de VRAM en fp16/bf16 (A100 80GB, H100 80GB, H200).
- En GPUs de consumo (RTX 4090 24GB) el modelo base de 27B no cabe en precisión completa; requeriría cuantización, no documentada para esta lente.
- El ajuste original se realizó en 4× H200 durante ~1,5 horas.
- Despliegue: no aplica para inferencia; se usa con el repositorio `koayon/jpp_lens` y `transformers` (con `attn_implementation="sdpa"`).
- Latencia y throughput: no disponibles; dependen del modelo base y del número de capas consultadas.

## Comparativa con modelos similares

| Artefacto | Modelo base | Capas | Recall@10 | Licencia | Formato |
|---|---|---|---|---|---|
| J++ lens (esta) | Qwen3.8-27B | 8, 16, 24, 32, 37, 40, 48, 56 | 53,4% | apache-2.0 | `lens.pt` |
| J++ lens del artículo | Qwen3.6-27B | No disponible | 55,2% | No disponible | No disponible |
| `koayon/jpp-lenses` | Varios | No disponible | No disponible | No disponible | Mismo formato |
| R-lens (mismo ajuste) | Qwen3.8-27B | No disponible | 44,0% | No disponible | No disponible |
| J-lens | Qwen3.8-27B | No disponible | 38,7% | No disponible | No disponible |
| Logit lens | Qwen3.8-27B | No disponible | 31,9% | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni agentes. Solo lee representaciones internas.
- Solo cubre ocho capas concretas; no ofrece lectura en todas las capas del modelo base.
- El rendimiento (53,4% recall@10) es inferior al de la lente J++ del artículo sobre Qwen3.6-27B (55,2%), lo que sugiere variabilidad entre modelos base.
- Los resultados se obtuvieron con prompts de chat con thinking desactivado; no se documenta comportamiento con thinking activado.
- La evaluación se limita a n = 312 ítems y cinco categorías; puede no generalizar a otros dominios.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.
- La licencia apache-2.0 cubre la lente, pero el uso del modelo base Qwen3.8-27B queda sujeto a su propia licencia.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinación de la lente (no aplica al no generar texto).
- Depende de una versión concreta del código (`koayon/jpp_lens`, commit `d7efc0de…`); cambios en la API pueden romper la carga.

## Enlaces

- Hugging Face: https://huggingface.co/cxart/Qwen3.8-27B-jpp-lens
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de lentes de referencia: https://huggingface.co/koayon/jpp-lenses
- Código del artículo: https://github.com/koayon/jpp_lens
- Dataset de ajuste: https://huggingface.co/datasets/Salesforce/wikitext
- Artículo citado: Ayonrinde & Lindsey, *J++ Lens: Jacobian Filtering Enables More Faithful Workspace Lenses*, 2026 (sin enlace directo en la información disponible).
