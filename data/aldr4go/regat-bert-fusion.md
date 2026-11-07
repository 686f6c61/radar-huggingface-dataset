# aldr4GO/regat-bert-fusion

## Resumen

ReGAT-BERT es un componente de reranking para recuperación de información que combina un cross-encoder BERT con redes de atención sobre grafos (GAT). El repositorio `aldr4GO/regat-bert-fusion` no contiene un modelo de lenguaje completo, sino un conjunto de pesos congelados (*frozen*) de las GAT entrenadas en el estudio ReGAT-BERT. Cada GAT re-puntúa los K candidatos superiores de BM25 para una consulta sobre un grafo kNN de embeddings de bi-encoder, generando una puntuación contextual `s_ctx` que se fusiona con la puntuación del cross-encoder `s_sem`.

El modelo resuelve el problema de la limitación de contexto y escalabilidad de los cross-encoders en reranking: en lugar de evaluar cada par consulta-documento de forma aislada, incorpora las relaciones entre pasajes vecinos mediante un grafo, lo que mejora la coherencia y la precisión del ranking. El trabajo asociado se publicó en Procedia Computer Science (2025) y evalúa el enfoque en MS MARCO y en conjuntos multi-hop como MuSiQue, HotpotQA y 2WikiMultiHopQA.

El repositorio tiene 0 descargas y 0 likes, un tamaño de 0.0 GB y no incluye model card completa ni licencia declarada. Es un artefacto de investigación orientado a reproducir los experimentos del estudio, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAT (graph attention network) sobre embeddings de bi-encoder, fusionada con cross-encoder BERT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del bi-encoder y del cross-encoder subyacentes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.pt` (dict de `torch.save` con `state_dict`, `graph`, `model`, `d`) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline híbrido de reranking en dos etapas. Primero, un bi-encoder genera embeddings para construir un grafo kNN de pasajes; después, una GAT propaga información entre pasajes vecinos para producir una puntuación contextual `s_ctx`. Esta puntuación se fusiona con la del cross-encoder BERT (`s_sem`) para obtener el ranking final. El repositorio contiene únicamente las GAT congeladas, no el cross-encoder ni el bi-encoder.

El entrenamiento se realizó bajo varios protocolos: los experimentos `A` y `B` corresponden a los protocolos A y B de MS MARCO, mientras que `musique`, `hotpotqa`, `beir_hotpotqa` y `twowiki` corresponden a conjuntos multi-hop. Las métricas de validación reportadas son nDCG@10 y MRR@10, y se indica explícitamente que el split de test nunca se usa para decisiones. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Reranking de pasajes: re-puntúa los K candidatos superiores de BM25 combinando señal semántica y contextual.
- Modelado de relaciones entre pasajes mediante grafo kNN de embeddings de bi-encoder.
- Fusión de puntuaciones (`s_ctx` + `s_sem`) para el ranking final.
- Evaluación en escenarios multi-hop (MuSiQue, HotpotQA, 2WikiMultiHopQA) además de MS MARCO.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales: es un componente de IR, no un LLM.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Reranking en motores de búsqueda documental: el componente re-puntúa los K candidatos de BM25 usando la GAT para incorporar contexto entre pasajes vecinos, mejorando la coherencia del ranking frente a un cross-encoder aislado.
- Preguntas multi-hop sobre bases de conocimiento: los experimentos en MuSiQue, HotpotQA y 2WikiMultiHopQA muestran mejoras de nDCG@10 frente a la línea base de bi-encoder (por ejemplo, 0.8409 frente a 0.8267 en `hotpotqa`), lo que lo hace adecuado para pipelines que requieren agregar evidencia de varios documentos.
- Reproducción de investigación: sirve para replicar los resultados del estudio ReGAT-BERT y comparar protocolos de fusión de puntuaciones.
- Búsqueda en dominios con grafos de documentos relacionados: la construcción kNN permite aprovechar similitud entre pasajes para desambiguar candidatos.
- Filtrado previo a un cross-encoder más costoso: al mitigar las limitaciones de escalabilidad del cross-encoder, puede usarse como etapa intermedia en pipelines de recuperación a gran escala.
- Evaluación de sistemas de IR: las métricas de validación por experimento permiten comparar variantes de fusión y grafos en entornos controlados.

## Benchmarks y rendimiento

| Experimento | nDCG@10 (val) | MRR@10 (val) | nDCG@10 (s_bi) | Mejor epoch |
|---|---|---|---|---|
| A (MS MARCO protocolo A) | 0.3798 | 0.3286 | 0.3771 | 2 |
| B (MS MARCO protocolo B) | 0.3400 | 0.2855 | 0.3376 | 5 |
| musique | 0.7519 | 0.9088 | 0.7008 | 20 |
| hotpotqa | 0.8409 | 0.8866 | 0.8267 | 8 |
| beir_hotpotqa | 0.5484 | 0.7166 | 0.5279 | 6 |
| twowiki | 0.9258 | 0.9838 | 0.9007 | 13 |

Los resultados son de validación únicamente. No se han publicado en la información disponible resultados de benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) porque el artefacto no es un LLM generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño de las GAT y de los modelos bi-encoder y cross-encoder subyacentes, no incluidos en el repositorio.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño de los pesos (el repo reporta 0.0 GB).
- Opciones de despliegue: carga mediante `torch.load(..., weights_only=False)` desde `src/cache_contextual.py`; el repositorio indica el comando `python -m src.hub pull --repo aldr4GO/regat-bert-fusion`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReGAT-BERT (este repo) | GAT + cross-encoder BERT | no disponible | nDCG@10 val 0.34-0.93 según dataset | no disponible | Hugging Face (0 descargas) |
| Cross-encoder BERT (CE-BERT) | Cross-encoder puro | no disponible | línea base citada en el paper; mejora de ReGAT-BERT sobre CE-BERT según el artículo | no disponible | habitual en IR |
| SBERT (bi-encoder) | Bi-encoder | no disponible | línea base `s_bi` en la tabla (0.3771-0.9007 nDCG@10) | no disponible | amplia |

La comparación se basa en las líneas base citadas en el artículo y en la propia tabla del repositorio; no se dispone de cifras de test ni de comparativas con otros rerankers en la información proporcionada.

## Limitaciones y advertencias

- El repositorio contiene solo las GAT congeladas; no incluye el bi-encoder ni el cross-encoder necesarios para el pipeline completo.
- No hay licencia declarada, lo que impide determinar si el uso comercial está permitido.
- No se especifican idiomas soportados ni sesgos conocidos.
- Riesgo de alucinación no aplicable directamente (no es un modelo generativo), pero el ranking puede verse afectado por la calidad del grafo kNN y de los embeddings del bi-encoder.
- Las métricas son de validación; no se reportan resultados de test.
- El artefacto tiene 0 descargas y 0 likes, sin model card completa ni documentación de mantenimiento.
- La carga requiere `weights_only=False` en `torch.load`, lo que implica confiar en el origen del fichero.
- No se documentan requisitos de hardware ni latencias para producción.

## Enlaces

- Hugging Face: https://huggingface.co/aldr4GO/regat-bert-fusion
- Artículo (ScienceDirect): https://www.sciencedirect.com/science/article/pii/S1877050925029758
- Artículo (ACM DL): https://dl.acm.org/doi/10.1016/j.procs.2025.09.302
