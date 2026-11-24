# MindscapeRAG/QRRanker

## Resumen

QRRanker es un modelo de reranking orientado a consultas y consciente de memoria, desarrollado por MindscapeRAG y presentado en la conferencia EMNLP 2026. Se construye sobre Qwen3-4B-Instruct-2507 mediante una técnica de truncado de capas: conserva únicamente las primeras 25 de las 36 capas originales, ya que las cabezas de atención relevantes para el ranking (Query-focused Retrieval heads) se concentran en las capas 17 a 24. El modelo resultante tiene 2.912.226.560 parámetros y un tamaño de repositorio de 5,8 GB.

El modelo resuelve el problema del reranking listwise en pipelines de recuperación de información: en lugar de puntuar cada documento de forma independiente, procesa la lista completa de candidatos y genera puntuaciones de relevancia continuas a partir de las puntuaciones de atención de un subconjunto seleccionado de 16 cabezas QR. Esto permite entrenar sobre conjuntos de datos de recuperación arbitrarios sin necesidad de supervisión con escalas Likert, y mejora la precisión en narrativas largas y diálogos mediante resúmenes contextuales opcionales.

Su relevancia actual radica en que ofrece una alternativa ligera a los rerankers basados en modelos de lenguaje de gran tamaño, manteniendo la capacidad listwise pero con un coste computacional y de memoria reducido gracias al truncado de capas y al uso selectivo de cabezas. Está disponible bajo licencia Apache 2.0, con soporte para inglés y chino, y formato safetensors con código personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con truncado de capas y cabezas QR seleccionadas |
| Parametros totales | 2.912.226.560 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (con código personalizado, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

QRRanker es una versión truncada en capas de Qwen3-4B-Instruct-2507. El modelo original tiene 36 capas transformer; QRRanker instancia solo las primeras 25 (`qr_end_layer = 25`), eliminando las capas 25 a 35. La justificación es que las 16 cabezas QR seleccionadas se encuentran todas en el rango de capas 17 a 24, por lo que las capas más profundas no aportan señal útil para el ranking pero sí consumen cómputo y memoria. El modelo conserva 32 cabezas de atención por capa y 8 cabezas clave-valor (GQA), con `num_hidden_layers` configurado a 36 pero sin instanciar más allá de la capa 24.

La innovación principal es el uso de cabezas de recuperación orientadas a consulta (QR heads) para estimar la relevancia pasaje-consulta a partir de las puntuaciones de atención. Las cabezas se identifican mediante el cálculo de puntuaciones QR sobre datos semilla. El modelo incorpora una configuración extendida (`Qwen3ConfigGating`) con parámetros `qr_start_layer`, `qr_end_layer`, `qr_head_list` y `qr_head_list_mapped`, y una caché KV personalizada (`DynamicCacheWithQuery`) que almacena los estados de query en posiciones de token específicas durante el forward pass. No se aplica la normalización final (`self.norm`) porque solo se necesitan las cachés intermedias de query y clave-valor, no el estado oculto final.

El entrenamiento se realizó sobre los conjuntos de datos HotpotQA, MuSiQue, Locomo y DetectiveQA, según los metadatos de la model card. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. El modelo produce puntuaciones de relevancia continuas, lo que permite entrenar sobre datasets de recuperación arbitrarios sin supervisión con escalas Likert.

## Capacidades

- Reranking listwise: procesa la lista completa de candidatos de forma conjunta, aprovechando la información holística de la shortlist para ordenar los documentos.
- Puntuaciones de relevancia continuas: genera scores continuos a partir de las puntuaciones de atención de las cabezas QR seleccionadas, sin necesidad de calibración con escalas discretas.
- Procesamiento de contexto largo: diseñado para narrativas largas y diálogos, con mejora opcional mediante resúmenes contextuales (memory enhancement).
- Multilingüe limitado: soporta inglés y chino.
- Integración en pipelines de recuperación: pensado como segunda etapa de reranking sobre resultados de un retriever inicial.
- No se especifica soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Reranking en sistemas RAG: el modelo se coloca como segunda etapa tras un retriever denso o disperso para reordenar los 100 documentos candidatos más relevantes antes de pasarlos al generador, mejorando la precisión del contexto recuperado.
- Búsqueda documental empresarial: se emplea para ordenar resultados de búsqueda sobre bases documentales internas, aprovechando su capacidad listwise para considerar la shortlist completa y no solo la similitud individual.
- Preguntas y respuestas sobre narrativas largas: su modo de mejora de memoria con resúmenes contextuales lo hace adecuado para tareas de QA sobre documentos extensos o diálogos multi-turno, como los recogidos en Locomo.
- Verificación de hechos y QA multi-hop: entrenado sobre HotpotQA y MuSiQue, puede usarse para ordenar pasajes de evidencia en tareas que requieren razonamiento sobre múltiples documentos.
- Análisis de conversaciones y transcripciones: aplicable a la ordenación de fragmentos relevantes en diálogos largos, como los de DetectiveQA, para tareas de investigación o análisis forense de texto.
- Filtrado de candidatos en motores de búsqueda vertical: integrable en pipelines de búsqueda especializada (legal, médico, técnico) donde se requiere una segunda etapa de ordenación precisa con bajo coste computacional.
- Evaluación de relevancia en datasets de recuperación: su capacidad de generar puntuaciones continuas permite usarlo como componente de anotación o evaluación en experimentos de recuperación de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 2.912.226.560 parámetros. En fp16 requiere aproximadamente 5,8 GB solo para los pesos, más overhead de caché KV y activaciones. En cuantización de 8 bits se estiman unos 2,9 GB, y en 4 bits unos 1,5 GB, aunque no se confirman formatos de cuantización disponibles en la información proporcionada.
- GPU recomendadas: al tratarse de un modelo de ~2,9B parámetros, cabe en GPUs de consumo como RTX 3090, RTX 4090 (24 GB) e incluso en RTX 4060 Ti (16 GB) en fp16. Para despliegue en producción se recomiendan A100 o H100 si se requiere alto throughput.
- Cabe en consumer GPU: sí, en la mayoría de GPUs con 8 GB o más de VRAM en cuantización de 8 bits, y en 16 GB o más en fp16.
- Opciones de despliegue: el modelo requiere `trust_remote_code=True` y carga mediante `AutoModel` de Transformers, por lo que no es directamente compatible con llama.cpp u Ollama sin conversión adicional. Para serving de alto rendimiento sería necesario adaptar el código personalizado a vLLM o TGI, lo cual no está documentado en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| QRRanker | 2,91B (25 capas) | No disponible | Apache 2.0 | Reranking listwise con cabezas QR |
| Qwen3-4B-Instruct-2507 (base) | ~4B | No disponible | Apache 2.0 | Modelo generativo general |
| BGE-reranker-v2-m3 | ~568M | 8192 | MIT | Reranking cross-encoder puntual |
| Cohere Rerank 3.5 | No disponible | 4096 | Propietaria | Reranking comercial |

La comparativa con BGE-reranker-v2-m3 y Cohere Rerank 3.5 es orientativa según categoría de tarea; no se dispone de datos de rendimiento comparativo en la información proporcionada. QRRanker se distingue por su enfoque listwise y por el truncado de capas que reduce el coste frente a su modelo base.

## Limitaciones y advertencias

- Idiomas limitados: solo inglés y chino; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinación: aunque es un modelo de ranking y no generativo en su uso previsto, las puntuaciones de relevancia pueden ser erróneas en dominios alejados de los datos de entrenamiento (HotpotQA, MuSiQue, Locomo, DetectiveQA).
- Longitud de contexto no especificada: se desconoce la ventana máxima soportada, lo que supone un riesgo para planificar despliegues con documentos muy largos.
- Dependencia de código personalizado: requiere `trust_remote_code=True`, lo que implica revisar y confiar en el código del repositorio antes de usarlo en producción.
- Compatibilidad limitada con herramientas estándar: al no ser un modelo generativo estándar, no es directamente compatible con llama.cpp, Ollama o vLLM sin adaptaciones.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las obligaciones de atribución y las licencias de los datasets de entrenamiento.
- Sin datos de benchmarks publicados en la información disponible: no es posible validar su rendimiento frente a alternativas sin ejecutar evaluaciones propias.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada; al derivar de Qwen3, podría heredar sesgos presentes en los datos de entrenamiento del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MindscapeRAG/QRRanker
- Página del proyecto: https://qdcassie-li.github.io/QRRanker/
- Paper (EMNLP 2026, ACL Anthology): https://aclanthology.org/2026.emnlp-main.1607/
- Modelo QRRanker-BRIGHT: https://huggingface.co/SituatedEmbedding/QRRanker-BRIGHT
- Dataset BRIGHT-DIVER-4B-Top100-QRRanker: https://huggingface.co/datasets/SituatedEmbedding/BRIGHT-DIVER-4B-Top100-QRRanker
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
