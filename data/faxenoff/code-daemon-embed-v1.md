# faxenoff/code-daemon-embed-v1

## Resumen

`code-daemon-embed-v1` es un modelo de embeddings de código desarrollado por faxenoff (Fedor Aksenov) con el objetivo específico de indexar repositorios completos de forma rápida y permitir búsqueda semántica en cada consulta de un agente de programación. Con solo 46,8 millones de parámetros y 4 capas de encoder, está diseñado para mapear unidades de código cortas (funciones, métodos, firmas, docstrings, nombres de símbolos) y consultas en lenguaje natural a un espacio vectorial compartido de 768 dimensiones.

El modelo parte de `intfloat/multilingual-e5-base` (un encoder XLM-RoBERTa de 12 capas y 278M de parámetros) al que se le han eliminado 8 de las 12 capas, se ha recortado el vocabulario de 250k a 22.739 piezas SentencePiece y se han cuantizado los pesos a INT8 mediante entrenamiento con cuantización consciente (QAT). La salida está normalizada L2 y agrupada por media dentro del propio grafo ONNX, de modo que el usuario recibe directamente vectores listos para usar.

Su principal innovación es la destilación de conocimiento desde un reranker cross-encoder (`Qwen/Qwen3-Reranker-4B`) mediante un objetivo listwise-KL, lo que permite capturar parte del ranking de un reranker sin coste adicional en inferencia. Está pensado como el canal denso de un recuperador híbrido junto a BM25, no como un modelo autónomo de búsqueda.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa) con 4 capas, 12 cabezas de atención, hidden size 768, FFN 3072 con GELU |
| Parametros totales | 46,80M (17,46M de tabla de embeddings + 4 × ~7,3M de encoder + posiciones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (límite duro por diseño) |
| Tipos de cuantizacion | INT8 (entrenamiento con cuantización consciente, QAT) |
| Idiomas soportados | Multilingüe (vocabulario recortado a código y inglés adyacente al código) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 19), safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en XLM-RoBERTa, pero reducido drásticamente: de las 12 capas originales de `multilingual-e5-base` se conservan solo 4, obtenidas mediante poda escalonada (12 → 8 → 6 → 4) con "curado" tras cada corte. El vocabulario se recorta de 250.002 a 22.739 piezas SentencePiece unigram con byte fallback, lo que reduce la tabla de embeddings de 192M a 17,5M de parámetros. Se eliminan los prefijos de instrucción de E5 (`query:` / `passage:`), el pooler head, el head de MLM y las entradas de token-type; el grafo ONNX tiene exactamente dos entradas (`input_ids` y `attention_mask`, ambas int64) y una salida `[B, 768]` ya agrupada por media (mask-aware mean pooling) y normalizada L2.

El entrenamiento utiliza destilación de conocimiento desde `Qwen/Qwen3-Reranker-4B`, que puntuó pares (consulta, candidato) sobre negativos duros extraídos de los datasets `CoIR-Retrieval/cosqa`, `CoIR-Retrieval/codesearchnet` y `CoIR-Retrieval/stackoverflow-qa`. El objetivo es listwise-KL: el estudiante aprende a reproducir la distribución de ranking del profesor, no solo a separar positivos de negativos. Las consultas de entrenamiento imitan tráfico real de agentes (bolsas de palabras clave, descripciones de comportamiento, fragmentos de identificadores) en lugar de paráfrasis de docstrings. Los pesos se cuantizan a INT8 durante el entrenamiento, con nodos Q/DQ que transportan las escalas entrenadas.

## Capacidades

- Búsqueda semántica de código: recupera funciones, métodos, tipos y fragmentos de documentación a partir de consultas cortas en lenguaje natural, palabras clave o identificadores.
- Consultas simétricas: no requiere prefijos de instrucción; consultas y documentos se codifican de forma idéntica.
- Salida lista para usar: el grafo devuelve vectores `[B, 768]` agrupados por media y normalizados L2, sin necesidad de código de pooling adicional.
- Reranking destilado: incorpora en los vectores parte de la capacidad de ranking de un cross-encoder, eliminando la necesidad de un reranker en tiempo de ejecución.
- Alto rendimiento de inferencia: ~10.700 embeddings por segundo en una GPU de portátil RTX 5060.
- Multilingüe para código: vocabulario recortado a piezas de código y términos técnicos en inglés, con soporte para múltiples lenguajes de programación.
- Integración con recuperación híbrida: diseñado para funcionar como canal denso junto a BM25.

## Casos de uso

- Re-indexado de repositorios en cada commit: un agente de programación puede re-embedir un repositorio de 700.000 entidades en ~81 segundos en una GPU de consumo, permitiendo búsqueda semántica actualizada tras cada cambio.
- Búsqueda híbrida en IDE o editor: combinar los vectores de este modelo con resultados BM25 para mejorar la precisión de búsqueda de símbolos, funciones o fragmentos de código en proyectos grandes.
- Recuperación de código a partir de descripciones en lenguaje natural: un desarrollador escribe "adquirir bloqueo de base de datos para hash de proyecto" y el modelo devuelve las funciones relevantes.
- Asistente de programación con contexto de repositorio: alimentar a un LLM con los fragmentos de código más relevantes recuperados por este modelo antes de generar respuestas.
- Indexación de documentación técnica: convertir docstrings, comentarios y chunks de documentación en vectores para búsqueda semántica dentro de una base de conocimiento de código.
- Pipeline de CI/CD para calidad de código: detectar duplicados o funciones similares mediante similitud coseno entre vectores de código, sin necesidad de un modelo pesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos de embeddings. El único dato de rendimiento proporcionado es el throughput de inferencia: ~10.700 embeddings por segundo en una RTX 5060 de portátil.

## Requisitos de hardware

- Inferencia ligera: al ser un modelo de 46,8M de parámetros en INT8, cabe en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 5060, etc.) y probablemente también en CPU con ONNX Runtime.
- VRAM estimada: no se especifica un valor exacto, pero con 46,8M de parámetros en INT8 (~47 MB de pesos) más overhead de activaciones, el consumo es mínimo, del orden de 1-2 GB.
- GPU recomendada: cualquier GPU con soporte para ONNX Runtime y al menos 4 GB de VRAM; la model card menciona una RTX 5060 de portátil como referencia.
- Opciones de despliegue: ONNX Runtime (graph execution), compatible con cualquier framework que cargue modelos ONNX. No se mencionan integraciones específicas con vLLM, llama.cpp u Ollama, ya que es un modelo de embeddings, no generativo.
- Latencia y throughput: ~10.700 embeddings/seg en RTX 5060, lo que permite indexar un repositorio de 700k entidades en ~81 segundos.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion disponible. La model card menciona que frente a embedders típicos de la clase e5/bge/gte (que suelen tener entre 110M y 7B de parámetros, vocabularios de 30k-250k, ventanas de 512-8192 tokens y pesos FP32/FP16), este modelo se distingue por su tamaño reducido, vocabulario recortado, ventana de 128 tokens, ausencia de prefijos, pooling integrado y pesos INT8. Sin embargo, no se aportan métricas de precisión comparativas.

## Limitaciones y advertencias

- Ventana de contexto limitada a 128 tokens: no apto para documentos largos, problemas extensos o diálogos multi-turno. La model card advierte explícitamente que no es un recuperador de contexto largo.
- Vocabulario recortado: al eliminar 227k piezas del vocabulario original, el modelo pierde capacidad para prosa general (texto médico, financiero, noticias) y puede fallar con términos fuera del dominio de código.
- Sin soporte para código↔código o traducción: no está entrenado para tareas de generación o traducción entre lenguajes de programación.
- Dependencia de un canal léxico: está diseñado como parte de un recuperador híbrido; usarlo solo puede degradar la precisión en consultas que requieran coincidencia exacta de términos.
- Riesgo de alucinación en recuperación: como cualquier modelo de embeddings, puede devolver resultados semánticamente similares pero incorrectos si la consulta es ambigua o el vocabulario no cubre el término.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente a alternativas, por lo que su adopción en producción requiere evaluación propia.
- Licencia MIT: permite uso comercial sin restricciones, pero el autor no ofrece garantías ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/faxenoff/code-daemon-embed-v1
- Perfil del autor: https://huggingface.co/faxenoff
