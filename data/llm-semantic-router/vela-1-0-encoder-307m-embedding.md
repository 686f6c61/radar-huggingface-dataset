# llm-semantic-router/Vela-1.0-Encoder-307M-Embedding

## Resumen

Vela-1.0-Encoder-307M-Embedding es un modelo de embeddings de texto desarrollado por llm-semantic-router, pensado específicamente para alimentar routers semánticos: convertir peticiones y documentos en vectores comparables para recuperar contexto relevante, emparejar consultas con ejemplos y agrupar conversaciones por significado. Su función no es generar texto, sino producir representaciones vectoriales de alta calidad sobre documentos de hasta 32.768 tokens.

Está construido sobre el modelo base llm-semantic-router/mmbert-embed-32k-2d-matryoshka y emplea una arquitectura ModernBERT (encoder transformer con attention eficiente) con 306.939.648 parámetros totales, 22 capas y una dimensión de salida por defecto de 768. Incorpora embeddings Matryoshka, de modo que ofrece cuatro profundidades y cinco dimensiones distintas para ajustar el equilibrio entre precisión y coste de almacenamiento y búsqueda.

Su relevancia actual radica en dos factores. Por un lado, la ventana de 32K tokens permite indexar documentos largos sin trocear agresivamente, algo poco habitual en modelos de embeddings de este tamaño. Por otro, forma parte de una familia completa de modelos de router (Domain, Feedback, Modality, PII, FactCheck, Reranker, Encoder, más PromptGuard, Safety y Hazard como próximos lanzamientos) que se integra con el proyecto vLLM Semantic Router, con licencia Apache 2.0 y pesos en safetensors y ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), según la etiqueta `modernbert` |
| Parametros totales | 306.939.648 (dato real de safetensors) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 tokens, incluyendo tokens especiales |
| Tipos de cuantizacion | FP16 nativo; variantes ONNX (incluida una build AMD ONNX con resultados propios); el modelo base es una versión cuantizada de un modelo previo (`base_model:quantized:...`) |
| Idiomas soportados | Multilingüe (la model card no enumera el listado completo de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX (transformers); compatible con text-embeddings-inference y endpoints |

Otros datos de interés: dimensión de salida por defecto de 768, 22 capas, cuatro profundidades y cinco dimensiones Matryoshka, pipeline `sentence-similarity`, tamaño del repositorio 13,1 GB y requisito declarado de `transformers==4.57.6`.

## Arquitectura y entrenamiento

La model card identifica la arquitectura mediante la etiqueta ModernBERT y describe un encoder de 307M de parámetros, 22 capas y 768 dimensiones de representación. La salida se obtiene mediante *mean pooling* enmascarado sobre el último estado oculto, seguido de normalización L2, tal como muestra el fragmento de código oficial. El modelo admite salidas tempranas (*shallow exits*) por capa, pero la propia documentación advierte que estas reducen la calidad; el ajuste recomendado es usar las 22 capas. La estructura Matryoshka permite truncar la dimensión del vector para obtener representaciones más compactas a costa de precisión.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; tampoco se especifican las cinco dimensiones ni las cuatro profundidades concretas. Sí se indica que el modelo base ya era un modelo de embeddings de 32K con Matryoshka y que a su vez deriva de una versión cuantizada de otro modelo. La model card menciona que se conservaron la calidad en *natural-paper* y en la posición final de contexto de 32K, y que existe una build AMD ONNX con resultados separados, incluida una caída de 1,04 puntos porcentuales en la posición final de 32K.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación de contexto; no genera texto, no razona y no produce código.
- Codificación de documentos largos de hasta 32.768 tokens en una sola pasada, sin truncado.
- Soporte multilingüe, con consultas de ejemplo en inglés y chino en la documentación oficial; las ganancias declaradas varían según el idioma.
- Embeddings Matryoshka con cuatro profundidades y cinco dimensiones, lo que permite un índice en dos o más niveles de resolución.
- Salida normalizada L2 (producto escalar como medida de similitud), con dimensión por defecto de 768.
- Integración nativa con el ecosistema transformers, además de exportaciones ONNX y compatibilidad con text-embeddings-inference y endpoints.
- Uso previsto dentro de un router semántico: recuperación de contexto, emparejamiento de peticiones con ejemplos y agrupación de conversaciones relacionadas.
- No soporta *tool calling*, ni agentes, ni modos de pensamiento (*thinking*), ni visión o audio: es un encoder de texto puro.

## Casos de uso

- Router semántico de peticiones: dentro de vLLM Semantic Router, el modelo vectoriza cada petición entrante y permite decidir a qué modelo, política o experto derivarla comparándola contra un banco de ejemplos; es adecuado porque separa consultas por significado y no por palabras clave.
- Recuperación aumentada (RAG) sobre documentación larga: con 32K tokens de contexto se pueden indexar informes, contratos o artículos completos sin fragmentar, reduciendo la pérdida de contexto que provoca el chunking agresivo.
- Caché semántica de respuestas LLM: se vectoriza cada consulta y se compara contra consultas previas para reutilizar respuestas; el uso de dimensiones Matryoshka reducidas permite hacer un primer cribado barato y solo recalcular en los casos dudosos.
- Deduplicación y agrupación de conversaciones: agrupar tickets de soporte o hilos de chat por similitud semántica, con la ventaja de que una conversación completa cabe en la ventana de 32K sin trocear el historial.
- Selección dinámica de ejemplos *few-shot*: recuperar los ejemplos más similares a la consulta actual y construir el prompt del LLM generativo con ellos, mejorando la calidad sin aumentar el tamaño fijo del prompt.
- Búsqueda semántica multilingüe: un mismo índice puede atender consultas en distintos idiomas y documentos en otros, útil en bases documentales corporativas o catálogos de producto multiidioma.
- Filtrado previo en pipelines de agentes: descartar contexto irrelevante antes de pasarlo a un LLM grande, reduciendo tokens de entrada y coste por petición.
- Indexado en dos fases para grandes volúmenes: almacenar vectores de dimensión reducida para la búsqueda inicial y reservar los vectores de 768 dimensiones (o profundidades mayores) para el re-ranking de los candidatos finales.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la propia model card:

| Evaluacion | Modelo anterior | Vela 1.0 Embedding |
|---|---:|---:|
| Recuperacion multilingue con judged-pool, nDCG@10 (48 consultas) | 0,807 | 0,814 |
| Recuperacion de documentos largos construidos, pair accuracy (1.152 escenarios) | 55,6 % | 57,5 % |

Notas sobre estos resultados: la model card indica que las ganancias varían según el idioma y que existe una build AMD ONNX con resultados propios, incluida una caída de 1,04 puntos porcentuales en la posición final del contexto de 32K. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es coherente con que se trate de un modelo de embeddings y no de un modelo generativo.

## Requisitos de hardware

Estimaciones basadas en los 306,9M de parámetros declarados; no son cifras publicadas por el autor:

- Pesos en FP16: aproximadamente 0,61 GB. En FP32, alrededor de 1,23 GB. En INT8, unos 0,31 GB.
- VRAM en inferencia FP16: del orden de 2 a 4 GB para lotes moderados con secuencias cortas; la atención sobre secuencias de 32K eleva el consumo de activaciones y puede requerir más memoria, especialmente con lotes grandes.
- GPU recomendadas: cualquiera con 8 GB o más de VRAM para uso general. Para lotes grandes y contexto completo de 32K conviene una A100, H100, L40S o similar.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes, e incluso en CPU para cargas ligeras, como demuestra el ejemplo oficial.
- Opciones de despliegue: transformers (versión 4.57.6 indicada por el autor), ONNX Runtime con las exportaciones disponibles, text-embeddings-inference y el stack de vLLM Semantic Router. No se documenta soporte GGUF ni llama.cpp en la información disponible.
- Latencia y throughput: no disponibles. Como referencia cualitativa, la propia documentación advierte que usar menos capas (salidas tempranas) reduce la calidad, por lo que recortar profundidad para ganar velocidad tiene coste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Vela-1.0-Encoder-307M-Embedding | 306,9M | 32.768 tokens | Apache 2.0 | safetensors y ONNX | nDCG@10 de 0,814 en recuperación multilingüe; pair accuracy del 57,5 % en documentos largos |
| llm-semantic-router/mmbert-embed-32k-2d-matryoshka | no disponible | 32.768 tokens (por el nombre del modelo) | no disponible | no disponible | Es el modelo base declarado; la model card lo usa como referencia de "modelo anterior" (nDCG@10 0,807 y 55,6 % de pair accuracy) |
| Otras alternativas de embeddings multilingües de ~300M | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificables en la información proporcionada |

No se han encontrado en la información disponible comparativas con modelos de embeddings de terceros (por ejemplo, de la familia de sentence-transformers o de embeddings de proveedores comerciales) que permitan una comparación rigurosa de parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce vectores. No puede responder preguntas, ni razonar, ni ejecutar herramientas.
- El producto escalar entre vectores indica similitud relativa, no una probabilidad calibrada; no debe interpretarse como una puntuación de confianza.
- Límite duro de 32.768 tokens, incluidos los tokens especiales. El código oficial lanza un error si se supera; no hay truncado automático.
- Usar salidas tempranas (menos capas) reduce la calidad de forma explícita según el autor; las 22 capas son la configuración por defecto y recomendada.
- Las ganancias de rendimiento varían según el idioma; no se detalla la cobertura real por lengua ni el comportamiento en idiomas de bajos recursos.
- La build AMD ONNX presenta una degradación declarada de 1,04 puntos porcentuales en la posición final de 32K, relevante si se despliega en ese formato.
- Posible riesgo de sesgo heredado del modelo base y de sus datos de entrenamiento, no cuantificado en la información disponible. No se especifican sesgos conocidos.
- No se documentan volúmenes de entrenamiento, composición del dataset ni técnicas de alineación, lo que dificulta evaluar el riesgo de alucinación o de representaciones sesgadas.
- Licencia Apache 2.0: permite uso comercial y modificación con las obligaciones habituales de atribución y aviso de cambios. No se declaran restricciones adicionales.
- El repositorio ocupa 13,1 GB, muy por encima de lo que sugieren los pesos en FP16, presumiblemente por incluir múltiples exportaciones y variantes; conviene descargar solo los ficheros necesarios.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción por terceros ni de validación independiente.
- Los resultados de búsqueda web disponibles no contienen información sobre este modelo (versan sobre LLM en general), por lo que no aportan validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Embedding
- Modelo base: https://huggingface.co/llm-semantic-router/mmbert-embed-32k-2d-matryoshka
- Documentación técnica y evaluación (TECHNICAL.md): https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Embedding/blob/main/TECHNICAL.md
- Colección de la familia Vela 1.0: https://huggingface.co/collections/llm-semantic-router/vela-10-router-models-6aa555ba70cc6997d6d67798
- Repositorio vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Modelos relacionados de la familia: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Domain, https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Feedback, https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Modality, https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-PII, https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-FactCheck, https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Reranker, https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M
