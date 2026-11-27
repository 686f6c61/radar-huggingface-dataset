# Booooooooooooo/alqac2026-phobert-base-nli

## Resumen

El modelo `Booooooooooooo/alqac2026-phobert-base-nli` es un clasificador binario de inferencia de lenguaje natural (NLI) en vietnamita, especializado en verificación de evidencias para sistemas de recuperación de información jurídica. Lo desarrolla el usuario de Hugging Face `Booooooooooooo` en el marco de un trabajo de fin de grado (KLTN) sobre recuperación de información legal, y se publica bajo licencia MIT.

Se construye sobre `vinai/phobert-base-v2`, un encoder basado en RoBERTa preentrenado específicamente para vietnamita, y se ajusta como cross-encoder de pares pregunta-evidencia. Su función concreta es decidir si un fragmento de texto jurídico respalda (entailment) o no respalda (contradiction/no relevante) una pregunta legal dada, actuando como verificador en un pipeline de retrieval aumentado.

El modelo es relevante para el nicho de legal IR en vietnamita, un dominio con pocos recursos públicos. Con 134.999.810 parámetros y una ventana de 256 tokens, es ligero y desplegable en hardware modesto, pero su alcance queda limitado a la tarea y al idioma para el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa/PhoBERT), cross-encoder para clasificación de pares |
| Parametros totales | 134.999.810 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (max_length de entrenamiento); el ejemplo de la model card usa 512 en el tokenizador |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo RoBERTa adaptado al vietnamita (PhoBERT-base-v2) con una cabeza de clasificación de secuencias de dos etiquetas (`AutoModelForSequenceClassification`). Se entrena como cross-encoder: la pregunta y la evidencia se concatenan en una sola secuencia que el encoder procesa conjuntamente, de modo que la atención puede modelar la interacción entre ambos textos. La longitud máxima de entrenamiento indicada es de 256 tokens.

El ajuste se realiza sobre el conjunto de datos `ALQAC2026`, en el contexto de una tarea de recuperación de información jurídica. Las etiquetas son binarias: `0` para contradicción o no relevante y `1` para entailment o evidencia de apoyo. La model card menciona una agregación tipo "bag aggregation" con operación `max`, lo que sugiere que el verificador se aplica sobre múltiples fragmentos de evidencia y se agrega la puntuación máxima. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en un encoder de clasificación).

## Capacidades

- Clasificación binaria de pares pregunta-evidencia en vietnamita (entailment frente a contradicción/no relevancia).
- Verificación de evidencias en pipelines de recuperación de información jurídica (reranking o filtrado de candidatos).
- Puntuación de relevancia mediante la diferencia de logits y función sigmoide, tal como se documenta en la model card.
- Agregación de puntuaciones sobre múltiples evidencias mediante operación `max` (bag aggregation).
- Procesamiento de textos legales en vietnamita, incluyendo preguntas y fragmentos normativos.
- No soporta tool calling, function calling, agentes, visión, audio ni modos de razonamiento extendido.
- Capacidad multilingüe limitada al vietnamita; no se documenta soporte para otros idiomas.

## Casos de uso

- Verificación de evidencias en un sistema legal RAG: dado un conjunto de fragmentos recuperados por un retriever (por ejemplo, BM25 o un modelo denso), el cross-encoder puntúa cada par pregunta-evidencia y descarta los fragmentos no respaldados antes de pasarlos al generador. Es adecuado porque está entrenado específicamente para esta decisión binaria en dominio jurídico vietnamita.
- Reranking de resultados de búsqueda legal: tras una primera fase de recuperación, el modelo reordena los candidatos según la probabilidad de entailment, mejorando la precisión del top-k devuelto al usuario.
- Filtrado de alucinaciones en asistentes jurídicos: se usa como comprobador de que las citas normativas propuestas por un modelo generativo están efectivamente respaldadas por el texto de la ley recuperado.
- Construcción de datasets de entrenamiento para retrievers: el verificador puede etiquetar automáticamente pares pregunta-pasaje como positivos o negativos, generando datos de entrenamiento para modelos de recuperación densa en vietnamita.
- Atención al ciudadano sobre normativa: integrado en un buscador de consultas legales, permite responder con pasajes verificados y reducir respuestas no sustentadas documentalmente.
- Evaluación de sistemas de legal IR: sirve como componente de métricas de fidelidad de evidencia en la evaluación de pipelines de recuperación, comprobando si las evidencias recuperadas implican la respuesta esperada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,54 GB solo para pesos (135 M de parámetros), más activaciones y overhead; en la práctica, menos de 2 GB para lotes pequeños.
- VRAM estimada en fp16/bf16: alrededor de 0,27 GB para pesos, con overhead adicional.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia con lotes grandes. En A100 o H100 el modelo queda infrautilizado pero funciona sin problema.
- Cabe en GPU consumer de gama baja e incluso en CPU para cargas moderadas, dado su tamaño reducido.
- Opciones de despliegue: Hugging Face Transformers, Text Embeddings Inference (TEI) para cross-encoders, ONNX Runtime y servidores de inferencia compatibles con modelos de clasificación. vLLM y llama.cpp no están orientados a este tipo de encoder de clasificación.
- Latencia y throughput estimados: no disponibles en la información proporcionada; con 256 tokens de entrada y 135 M de parámetros, la latencia esperada por par es de pocos milisegundos en GPU consumer, aunque no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Tarea | Licencia |
|---|---|---|---|---|---|
| alqac2026-phobert-base-nli | 135 M | 256 | Vietnamita | NLI legal (cross-encoder) | MIT |
| vinai/phobert-base-v2 (modelo base) | ~135 M | 256 | Vietnamita | Representación general (encoder) | MIT |
| vinai/phobert-large | ~370 M | 256 | Vietnamita | Representación general (encoder) | MIT |
| Cross-encoders NLI multilingües (p. ej. familia XLM-R) | 270 M - 560 M | 512 | Multilingüe | NLI general | MIT / otras |

La comparación se limita a alternativas de la misma familia o categoría; no se dispone de datos de rendimiento comparativo publicados para este modelo. Frente a PhoBERT-base-v2, este modelo añade el ajuste específico para NLI legal, lo que lo hace más adecuado para verificación de evidencias que el encoder base sin ajustar. Frente a modelos multilingües más grandes, pierde cobertura idiomática pero gana especialización y ligereza.

## Limitaciones y advertencias

- Entrenado únicamente para vietnamita; no debe esperarse un rendimiento fiable en castellano ni en otros idiomas.
- Ventana de contexto de 256 tokens: evidencias legales largas deben truncarse o dividirse, con riesgo de perder información relevante.
- Clasificación binaria simplificada (entailment frente a contradicción/no relevancia); no distingue matices como neutralidad o evidencia parcial.
- Riesgo de falsos positivos y negativos en pasajes ambiguos o con terminología jurídica poco representada en el corpus de entrenamiento.
- No se documentan análisis de sesgos, evaluación de robustez ni métricas de calibración.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026; no hay evidencia de uso o validación por terceros.
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece soporte documentado.
- Al ser un cross-encoder de clasificación, no genera texto; debe combinarse con un retriever y, opcionalmente, con un generador en un pipeline completo.
- La model card está redactada en vietnamita y contiene información limitada sobre el proceso de entrenamiento y la composición del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Booooooooooooo/alqac2026-phobert-base-nli
- Modelo base PhoBERT: https://huggingface.co/vinai/phobert-base-v2
- Repositorio PhoBERT (paper y código): https://github.com/VinAIResearch/PhoBERT
