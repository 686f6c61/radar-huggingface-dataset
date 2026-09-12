# llm-semantic-router/Vela-1.0-Encoder-307M-Reranker

## Resumen

Vela-1.0-Encoder-307M-Reranker es un modelo de reranking (pipeline `text-ranking`) publicado por la organización llm-semantic-router, vinculada al proyecto vLLM Semantic Router. Es un encoder transformer bidireccional de 306.939.648 parámetros (unos 307M) derivado de `llm-semantic-router/mmbert-rerank-32k-2d-matryoshka`, que puntúa pares consulta-documento para reordenar los candidatos devueltos por un sistema de recuperación antes de que se construya el contexto final que recibe un modelo generativo.

Forma parte de la familia Vela 1.0, un conjunto de modelos especializados en las señales que necesita un enrutador semántico: clasificación de dominio, detección de modalidad, identificación de PII, comprobación de hechos (FactCheck), embeddings y reranking. Todos comparten el mismo encoder de 307M, y en el caso del reranker se ofrecen 20 configuraciones de cómputo diferentes (etiqueta `matryoshka`) para ajustar el equilibrio entre calidad y latencia, junto con una ventana de 32K tokens combinados de consulta y documento.

Su relevancia práctica está en el coste-beneficio: el reranking es la etapa que más impacta en la precisión del contexto recuperado y, con 307M de parámetros, puede ejecutarse en CPU o en GPU de consumo, integrándose en pipelines RAG de producción con licencia Apache-2.0. El autor reporta mejoras moderadas sobre el modelo anterior en rankings multilingües (0,778 → 0,799 nDCG@10) y en SciFact (0,651 → 0,659 nDCG@10), aunque con pérdida en documentos muy largos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional tipo ModernBERT (etiqueta `modernbert`); reranker cross-encoder sobre el modelo base `mmbert-rerank-32k-2d-matryoshka` |
| Parámetros totales | 306.939.648 (≈307M, dato real de safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32K tokens combinados de consulta y documento |
| Tipos de cuantización | FP16 nativo para evaluación y exportación ONNX incluida en el repositorio; cuantizaciones GGUF, INT8 o INT4 no documentadas (no disponible) |
| Idiomas soportados | multilingüe (etiqueta `multilingual`); la lista concreta de idiomas no está publicada (no disponible) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PyTorch) y ONNX (`onnx/` en el repositorio); tamaño del repositorio 3,1 GB |

## Arquitectura y entrenamiento

El modelo es un encoder bidireccional estilo ModernBERT reutilizado como cross-encoder de ranking: recibe el par consulta-documento de forma conjunta y devuelve una puntuación de relevancia relativa. La etiqueta `modernbert` y el nombre del modelo base (`mmbert-rerank-32k-2d-matryoshka`) apuntan a un encoder multilingüe con atención de longitud extendida hasta 32K tokens, con soporte de truncado dimensional tipo Matryoshka que da lugar a las 20 configuraciones de cómputo anunciadas en la model card. No es un modelo generativo: no produce texto, solo puntuaciones de ordenación.

No se han publicado en la información disponible detalles del entrenamiento: número de tokens, composición del dataset, uso de RLHF/DPO (no aplicable en un reranker) ni función de pérdida. La model card sí documenta que las puntuaciones no son probabilidades calibradas, que los resultados de referencia se obtuvieron con FP16 nativo y modelo completo sobre un conjunto fijo de documentos candidatos, y que existe una exportación ONNX en el repositorio para despliegue sin PyTorch. Como innovación destacable figura el contexto efectivo de 32K combinado con el selector de 20 configuraciones de cómputo para escalar latencia según la carga.

## Capacidades

- Puntuación de relevancia consulta-documento para reordenar resultados de búsqueda o recuperación (reranking de segundo nivel).
- Comparación semántica frente a coincidencia léxica: la model card enfatiza que compara cada documento con el significado de la consulta, no solo con sus términos.
- Procesamiento multilingüe: el conjunto de evaluación "judged-pool" incluye 96 consultas multilingües; la cobertura por idioma no está detallada.
- Pares consulta-documento de hasta 32K tokens combinados, apto para fragmentos largos o contextos extensos.
- Ajuste calidad/latencia mediante las 20 configuraciones de cómputo derivadas del diseño Matryoshka.
- Inferencia en CPU (el ejemplo oficial se ejecuta en CPU) y exportación ONNX para entornos sin PyTorch.
- Integración con el enrutador semántico vLLM Semantic Router como etapa de selección de contexto.
- Búsqueda de integración en pipelines RAG: seleccionar qué fragmentos llegan al modelo generativo.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni uso como agente, al ser un encoder de ranking.
- No dispone de capacidades de visión ni audio según la información disponible.

## Casos de uso

- **RAG de documentación técnica**: tras una recuperación híbrida (BM25 + embeddings) que devuelve 50-100 fragmentos, el reranker puntúa cada par consulta-fragmento y deja pasar solo los 5-10 mejores al modelo generativo; con 32K tokens combinados admite fragmentos largos de manuales o código.
- **Atención al cliente multilingüe**: en un sistema de soporte con base de conocimiento en varios idiomas, el modelo reordena artículos y respuestas previas antes de que el LLM redacte la respuesta, evitando que se citen artículos de baja relevancia.
- **Enrutado de peticiones en una plataforma LLM**: integrado en vLLM Semantic Router, selecciona el contexto que se adjunta a cada petición antes de decidir el modelo destino, reduciendo el número de tokens enviados a modelos caros.
- **Búsqueda jurídica o normativa**: consultas largas y documentos extensos (contratos, normativa) donde el contexto de 32K permite puntuar pares sin trocear en exceso; el reranker prioriza los apartados que responden a la consulta.
- **Reordenación de resultados en motores internos de conocimiento**: sobre índices corporativos (wikis, tickets, actas), se ejecuta en CPU o GPU de consumo y puede desplegarse como microservicio con ONNX Runtime sin depender de GPUs dedicadas.
- **Filtrado de evidencia para verificación de hechos**: combinado con el modelo FactCheck de la misma familia, el reranker selecciona los pasajes que sirven como evidencia antes de la etapa de comprobación.
- **Preprocesado de datasets de evaluación**: puntuar y ordenar pares consulta-documento anotados para construir conjuntos de validación de sistemas de recuperación, dada la licencia Apache-2.0 y la posibilidad de ejecutarlo en local.
- **Sistemas con presupuesto de latencia variable**: usar una configuración Matryoshka reducida en horas punta y la configuración completa en procesos por lotes, manteniendo la misma API de scoring.

## Benchmarks y rendimiento

| Evaluación | Conjunto | Métrica | Modelo anterior | Vela 1.0 |
|---|---|---:|---:|---:|
| Judged-pool ranking | 96 consultas multilingües | nDCG@10 | 0,778 | 0,799 |
| SciFact | 300 consultas | nDCG@10 | 0,651 | 0,659 |
| Test de posición final a 32K | no disponible | accuracy | 51,0% | 49,0% |

Los resultados se obtuvieron con FP16 nativo, modelo completo y documentos candidatos fijos. El autor advierte de que las ganancias varían según el idioma y de que la calidad en documentos largos sigue siendo irregular: la precisión en el test de posición final a 32K bajó de 51,0% a 49,0% respecto al modelo anterior. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de generación, que no aplican a un modelo de ranking.

## Requisitos de hardware

- Pesos en FP16: aproximadamente 0,61 GB (306,9M × 2 bytes); en FP32, unos 1,23 GB.
- VRAM estimada para inferencia: 1-2 GB en FP16 incluyendo activaciones y overhead de runtime, en función del tamaño de lote y de los 32K tokens de entrada.
- El repositorio completo ocupa 3,1 GB, ya que incluye safetensors y exportaciones ONNX.
- Cabe en cualquier GPU de consumo con 4 GB o más (GTX 1650, RTX 3050, RTX 3060, RTX 4090) y también en Apple Silicon.
- Ejecución en CPU viable: el ejemplo oficial de inferencia se lanza explícitamente en CPU.
- Opciones de despliegue documentadas: PyTorch 2.10 con las dependencias del repositorio, ONNX Runtime y vLLM Semantic Router. Soporte en vLLM, TGI, llama.cpp u Ollama: no disponible en la información consultada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vela-1.0-Encoder-307M-Reranker | 306,9M | 32K combinados | Cross-encoder multilingüe, 20 configuraciones Matryoshka | Apache-2.0 | Pesos safetensors + ONNX en HuggingFace |
| BAAI/bge-reranker-v2-m3 | ≈568M (no verificado en esta búsqueda) | no disponible | Cross-encoder multilingüe | no disponible | HuggingFace |
| jinaai/jina-reranker-v2-base-multilingual | ≈278M (no verificado en esta búsqueda) | no disponible | Cross-encoder multilingüe | no disponible | HuggingFace |

No se dispone de datos comparativos de nDCG de estos modelos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa. El diferencial documentado de Vela 1.0 es su ventana de 32K tokens combinados frente a los 8K habituales en rerankers multilingües de tamaño similar, junto con la selección de 20 perfiles de cómputo. Los datos de parámetros, contexto y licencia de los modelos alternativos no se han verificado en esta búsqueda y deben comprobarse en sus fichas antes de tomar una decisión.

## Limitaciones y advertencias

- Las puntuaciones de salida no son probabilidades calibradas: sirven para ordenar dentro de una misma consulta, no para fijar umbrales absolutos de relevancia.
- La calidad en documentos largos es irregular: el propio autor reporta una caída de 51,0% a 49,0% en el test de posición final a 32K respecto al modelo anterior.
- Las ganancias de nDCG son moderadas (entre +0,008 y +0,021) y varían según el idioma; el conjunto multilingüe de evaluación solo tiene 96 consultas, una muestra pequeña.
- No se han publicado detalles del dataset de entrenamiento, composición lingüística ni evaluación de sesgos, por lo que se desconoce el comportamiento en dominios o idiomas poco representados.
- Riesgo de alucinación: no aplica directamente porque el modelo no genera texto, pero un reranking incorrecto puede introducir contexto irrelevante o sesgado que induzca errores en el modelo generativo posterior.
- El repositorio se creó y actualizó el 12 de septiembre de 2026, con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación independiente.
- El modelo no cubre generación, tool calling ni razonamiento; para esas funciones se necesita otro modelo del pipeline.
- Licencia Apache-2.0, que permite uso comercial, pero se desconoce si las condiciones del modelo base (`mmbert-rerank-32k-2d-matryoshka`) u otros componentes añaden restricciones adicionales.
- La lista concreta de idiomas soportados no está publicada; conviene validar el rendimiento en el idioma objetivo antes de desplegarlo.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Reranker
- Modelo base: https://huggingface.co/llm-semantic-router/mmbert-rerank-32k-2d-matryoshka
- Colección de la familia Vela 1.0: https://huggingface.co/collections/llm-semantic-router/vela-10-router-models-6aa555ba70cc6997d6d67798
- Proyecto vLLM Semantic Router (GitHub): https://github.com/vllm-project/semantic-router
- Referencia técnica y evaluación del modelo: `TECHNICAL.md` incluido en el repositorio del modelo
- Modelo relacionado, Vela-1.0-Encoder-307M-Domain: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Domain
- Modelo relacionado, Vela-1.0-Encoder-307M-Modality: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Modality
- Modelo relacionado, Vela-1.0-Encoder-307M-PII: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-PII
- Modelo relacionado, Vela-1.0-Encoder-307M-FactCheck: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-FactCheck
- Modelo relacionado, Vela-1.0-Encoder-307M (base para nuevas capacidades): https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M

Nota: la búsqueda web realizada no devolvió resultados específicos sobre este modelo; los únicos enlaces encontrados fueron páginas genéricas sobre modelos de lenguaje (Wikipedia, rankings de LLM), sin relación con Vela 1.0.
