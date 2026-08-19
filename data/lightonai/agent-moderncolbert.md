# lightonai/Agent-ModernColBERT

## Resumen

Agent-ModernColBERT es un modelo de recuperación (retrieval) multi-vector basado en interacción tardía (late interaction), desarrollado por LightOn como evolución de su familia ModernColBERT. Está específicamente fine-tuneado para recuperación agéntica (agentic retrieval), un escenario en el que agentes de deep research generan trazas de razonamiento explícitas antes de lanzar una búsqueda. A diferencia de los retrievers convencionales que descartan esa información, este modelo la concatena a la consulta, mejorando sustancialmente la precisión de la recuperación en entornos donde el LLM razona antes de buscar.

El modelo parte del checkpoint GTE-ModernColBERT-v1 (también de LightOn) y se fine-tunea sobre el dataset Tevatron/AgentIR-data, liberado junto al paper AgentIR. Con solo 149 millones de parámetros, alcanza un 72,53 % de precisión en el benchmark BrowseComp-Plus cuando se combina con el LLM abierto GPT-OSS-120B y la función `get_document`, superando configuraciones que usan GPT-5 con Qwen3-Embed-8B, y siendo 26 veces más pequeño que el modelo denso AgentIR-4B. Su arquitectura se basa en ModernBERT con proyección ColBERT, lo que lo hace extremadamente ligero y adecuado para despliegue en entornos con recursos limitados.

La relevancia de Agent-ModernColBERT radica en que demuestra que la interacción tardía es el sesgo inductivo correcto para consultas aumentadas con trazas de razonamiento, ofreciendo una alternativa eficiente a modelos densos mucho más grandes en pipelines de recuperación agéntica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT encoder con late interaction (ColBERT multi-vector) |
| Parametros totales | 149.015.808 (~150M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP32/FP16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con PyLate, sentence-transformers, text-embeddings-inference) |

## Arquitectura y entrenamiento

Agent-ModernColBERT es un encoder transformer basado en ModernBERT, con un cabezal de interacción tardía estilo ColBERT. En este diseño, cada token del documento se proyecta a un vector de baja dimensión, y la similitud entre consulta y documento se calcula mediante la suma de máximos (MaxSim) sobre los vectores token a token. Esto permite una mayor expresividad que los embeddings densos de un solo vector, especialmente cuando las consultas contienen razonamientos complejos. El modelo parte del checkpoint GTE-ModernColBERT-v1, que ya había sido entrenado para retrieval multi-vector, y se fine-tunea sobre el dataset Tevatron/AgentIR-data, compuesto por 5.238 ejemplos de trayectorias de agentes de deep research. El entrenamiento utiliza la pérdida CachedContrastive, optimizando la similitud entre consultas aumentadas con trazas de razonamiento y documentos relevantes.

La innovación principal es el uso de reasoning traces: en lugar de descartar el razonamiento intermedio que genera un agente antes de buscar, se concatena a la consulta y se envía al retriever. Esto permite que el modelo aproveche información contextual sobre *qué* se busca y *por qué*, mejorando la precisión en tareas de recuperación agéntica. El script de entrenamiento está disponible en el repositorio PyLate de LightOn.

## Capacidades

- Recuperación multi-vector (ColBERT) con interacción tardía, optimizada para consultas aumentadas con trazas de razonamiento de agentes.
- Búsqueda semántica de documentos con alta precisión en escenarios de deep research.
- Compatible con pipelines agénticos que exponen funciones `search` y `get_document` al LLM.
- Integración con PyLate, sentence-transformers y text-embeddings-inference (TEI) para despliegue en producción.
- Modelo exclusivamente encoder: no genera texto, solo produce representaciones vectoriales.
- Soporte monolingüe en inglés.
- Eficiencia computacional: 150M de parámetros, apto para CPU y GPUs de consumo.

## Casos de uso

- Deep research automatizado: agentes que razonan antes de buscar pueden usar Agent-ModernColBERT para recuperar documentos relevantes a partir de sus trazas de razonamiento, mejorando la calidad de las fuentes sin necesidad de un retriever grande.
- Sistemas RAG agénticos: integrar el modelo en pipelines donde el LLM genera pasos intermedios de razonamiento y el retriever debe interpretar esas consultas enriquecidas, reduciendo el ruido y aumentando la precisión.
- Búsqueda empresarial con contexto de razonamiento: en dominios especializados (legal, médico, técnico), los usuarios o agentes pueden formular consultas con justificaciones; el modelo aprovecha esa información extra para devolver resultados más pertinentes.
- Asistentes de investigación científica: recuperación de papers y artículos donde el agente describe hipótesis y criterios de inclusión antes de buscar, mejorando la cobertura de la literatura relevante.
- Evaluación de retrievers en benchmarks agénticos: dado su rendimiento en BrowseComp-Plus, sirve como referencia para comparar otros sistemas de recuperación en tareas que requieren razonamiento.
- Sustitución de BM25 o embeddings densos en pipelines de retrieval existentes: al ser 54 veces más pequeño que Qwen3-Embed-8B y 26 veces más pequeño que AgentIR-4B, puede reemplazarlos en entornos con restricciones de memoria o latencia sin perder precisión en tareas agénticas.

## Benchmarks y rendimiento

La model card reporta resultados en BrowseComp-Plus, comparando diferentes retrievers con el LLM GPT-OSS-120B y GPT-5. Se incluye la tabla completa con los datos publicados:

| Modelo | Retriever | get_document | Accuracy (%) | Recall (%) | Search Calls | Calibration Error (%) |
|---|---|---|---|---|---|---|
| oss-120b-high | BM25 | ✗ | 29.16 | 35.50 | 19.45 | 45.92 |
| oss-120b-high | Qwen3-Embed-8B | ✗ | 44.10 | 52.63 | 18.35 | 39.32 |
| oss-120b-high | GTE-ModernColBERT-v1 | ✗ | 55.66 | 66.94 | 17.51 | 31.02 |
| oss-120b-high | GTE-ModernColBERT-v1 | ✓ | 58.92 | 57.99 | 13.29 | 32.84 |
| oss-120b-high | Reason-ModernColBERT | ✗ | 59.04 | 68.64 | 18.87 | 30.07 |
| oss-120b-high | Reason-ModernColBERT | ✓ | 61.20 | 60.84 | 13.87 | 32.45 |
| oss-120b-high | AgentIR-4B | ✗ | 66.99 | 78.13 | 24.08 | 22.55 |
| **oss-120b-high** | **Agent-ModernColBERT** | **✗** | **63.86** | **74.84** | **21.49** | **25.55** |
| **oss-120b-high** | **Agent-ModernColBERT** | **✓** | **72.53** | **72.84** | **15.85** | **22.07** |
| GPT-5 | BM25 | ✗ | 57.59 | 61.70 | 23.23 | 12.63 |
| GPT-5 | Qwen3-Embed-8B | ✗ | 71.69 | 78.98 | 21.74 | 9.58 |
| GPT-5 | Reason-ModernColBERT | ✗ | 79.52 | 83.52 | 19.31 | 7.46 |
| GPT-5 | Reason-ModernColBERT | ✓ | 87.59 | 81.55 | 13.27 | 6.07 |

Destaca que Agent-ModernColBERT con `get_document` y GPT-OSS-120B (72,53 %) supera a GPT-5 + Qwen3-Embed-8B sin `get_document` (71,69 %), siendo el retriever 54 veces más pequeño. Además, es competitivo con AgentIR-4B (66,99 % sin `get_document`) a pesar de ser 26 veces menor.

## Requisitos de hardware

- VRAM estimada para inferencia: ~300 MB en FP16, ~150 MB en cuantización de 8 bits, ~75 MB en 4 bits (estimación basada en el tamaño de 150M parámetros; no se han publicado requisitos oficiales).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090). También funciona en CPU con latencia aceptable para batch pequeño.
- Opciones de despliegue: PyLate (librería nativa), sentence-transformers, text-embeddings-inference (TEI) para endpoints de producción, y compatible con endpoints de Hugging Face.
- Latencia y throughput: al ser un modelo pequeño, la latencia por consulta es del orden de milisegundos en GPU; el throughput depende del hardware y del tamaño de batch, pero es significativamente superior al de modelos de 4B u 8B.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Precisión BrowseComp-Plus (con get_document, GPT-OSS-120B) | Licencia |
|---|---|---|---|---|---|
| Agent-ModernColBERT | 150M | Multi-vector (late interaction) | no disponible | 72,53 % | Apache 2.0 |
| Reason-ModernColBERT | 150M | Multi-vector (late interaction) | no disponible | 61,20 % | Apache 2.0 |
| AgentIR-4B | 4B | Denso (single-vector) | no disponible | 66,99 % (sin get_document) | no disponible |
| Qwen3-Embed-8B | 8B | Denso (single-vector) | no disponible | 44,10 % (sin get_document) | Apache 2.0 (Qwen) |

Agent-ModernColBERT ofrece el mejor equilibrio entre tamaño y rendimiento en tareas agénticas, superando a modelos densos mucho más grandes. Su licencia Apache 2.0 permite uso comercial sin restricciones.

## Limitaciones y advertencias

- Soporte únicamente en inglés; no está entrenado para otros idiomas.
- Entrenado en un dataset pequeño (5.238 ejemplos) específico de agentic retrieval; puede no generalizar bien a dominios fuera de ese ámbito.
- Depende de la calidad de las trazas de razonamiento generadas por el agente; si el LLM produce razonamientos pobres o irrelevantes, el rendimiento del retriever se degrada.
- No es un modelo generativo; solo produce embeddings, por lo que no puede utilizarse para tareas de generación de texto.
- La longitud de contexto no está documentada en la model card; se recomienda verificar el comportamiento con consultas largas antes de usarlo en producción.
- El uso de la función `get_document` puede introducir ruido si el agente lee documentos irrelevantes, como señala el propio autor en la model card.
- No se han publicado resultados de benchmarks fuera de BrowseComp-Plus; la generalización a otros benchmarks de retrieval no está verificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lightonai/Agent-ModernColBERT
- Dataset AgentIR: https://huggingface.co/datasets/Tevatron/AgentIR-data
- Paper AgentIR: https://arxiv.org/abs/2603.04384
- Paper ColBERT (original): https://arxiv.org/abs/1908.10084
- Paper ColBERTv2: https://arxiv.org/abs/2101.06983
- Repositorio PyLate: https://github.com/lightonai/pylate
- Script de entrenamiento: https://github.com/lightonai/pylate/blob/main/examples/train/agent_modern_colbert.py
- Modelo base GTE-ModernColBERT-v1: https://huggingface.co/lightonai/GTE-ModernColBERT-v1
- Modelo Reason-ModernColBERT: https://huggingface.co/lightonai/Reason-ModernColBERT
