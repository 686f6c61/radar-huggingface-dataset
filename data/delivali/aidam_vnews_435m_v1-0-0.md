# DeliVali/AIDAM_VNEWS_435M_V1.0.0

## Resumen

AIDAM_VNEWS_435M_V1.0.0 es un clasificador de inferencia de lenguaje natural (NLI) de tres clases (entailment, neutral, contradiction) desarrollado por DeliVali (Jeffrey Romero Del Val) como parte del proyecto AIDAM, un sistema abierto de fact-checking. El modelo está diseñado para verificar si una afirmación está respaldada por un documento fuente, lo que lo hace útil para validar la veracidad de resúmenes, respuestas generadas por LLMs o contenido noticioso. A diferencia de los enfoques que delegan el veredicto factual en un LLM, este modelo actúa como un componente especializado y auditable: el LLM redacta y explica, pero no juzga.

Se basa en la arquitectura DeBERTa-v3-large, con 435 millones de parámetros, y parte del checkpoint `MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli`, ya pre-entrenado en múltiples conjuntos de NLI. El modelo fue ajustado con 38,007 ejemplos de datos de grounding y alcanza una precisión balanceada macro de 76.2 en el benchmark LLM-AggreFact, superando al líder previo en su clase de peso (FactCG-DeBERTa-v3-Large con 75.6). Está publicado bajo licencia Apache 2.0, solo en inglés, y se ofrece en formatos SafeTensors y ONNX.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-large (Transformer encoder) |
| Parametros totales | 435,064,835 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens por chunk (con stride de 1536 tokens para documentos largos) |
| Tipos de cuantizacion | no disponible (se ofrecen pesos en bf16/float32; no se documentan cuantizaciones específicas) |
| Idiomas soportados | inglés (único idioma documentado) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (~830 MB) y ONNX (5 MB graph + 1.7 GB pesos externos) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en DeBERTa-v3-large, una arquitectura que utiliza atención desenredada (disentangled attention) y mejora sobre DeBERTa-v2. El checkpoint base ya fue fine-tuneado en los conjuntos MNLI, FEVER, ANLI, LiNG y WANLI, lo que le proporciona una base sólida en tareas de NLI y verificación de hechos.

El ajuste fino se realizó sobre un corpus de 38,007 filas compuesto por FactCG v4 (26,615 filas) y una parte del split de desarrollo de LLM-AggreFact (11,392 filas: todas las 7,392 de contradicción y 4,000 de las 23,002 de entailment). Los hiperparámetros incluyen learning rate de 5e-5, 3 épocas, batch efectivo de 32 (micro-batch 1 con acumulación de gradiente 32), longitud máxima de secuencia de 2048 tokens, gradient checkpointing, OneCycleLR con 6% de warmup, AdamW de 8 bits y bf16. El mejor checkpoint se obtuvo en el paso 3,200 de 3,561, con una precisión balanceada interna de 89.23. El entrenamiento se realizó en una sola GPU de consumo de 12 GB durante aproximadamente 2.3 horas, y fue el intento número 17 de la especialización, tras 16 intentos fallidos con arquitecturas más pequeñas o contextos más cortos.

## Capacidades

- Clasificación de pares de secuencias en tres clases: entailment, neutral y contradiction.
- Verificación de consistencia factual entre una afirmación y un documento de evidencia (grounding).
- Manejo de documentos largos mediante chunking con overlap del 25% (ventana de 2048 tokens, stride de 1536) y agregación determinista de predicciones por chunk.
- Funciona como componente de un pipeline de fact-checking donde el veredicto final proviene de la agregación de este clasificador, no de un LLM.
- Soporta inferencia mediante la librería `transformers` de HuggingFace y mediante runtime ONNX.
- No soporta tool calling, agentes ni razonamiento multi-step; es un clasificador puro de secuencias.

## Casos de uso

- Verificación de noticias en entornos editoriales: dado un artículo de prensa y una afirmación extraída de un resumen, el modelo determina si el artículo respalda, contradice o es neutral respecto a la afirmación. Se integra en un sistema de fact-checking automático para marcar afirmaciones no sustentadas.
- Validación de resúmenes automáticos en generación de contenido: cuando un LLM produce un resumen de un documento largo, el modelo puede comprobar si cada oración del resumen está realmente respaldada por el texto fuente, reduciendo alucinaciones.
- Control de calidad en pipelines RAG (Retrieval-Augmented Generation): se puede usar como filtro de verificación para asegurar que las respuestas generadas por un sistema de preguntas y respuestas estén ancladas en los documentos recuperados.
- Auditoría de contenido generado en plataformas de noticias: integrado en un flujo de moderación, este modelo ayuda a detectar afirmaciones falsas o no verificadas en artículos producidos por IA.
- Evaluación de consistencia en bases de datos de hechos: para sistemas que mantienen registros de afirmaciones y fuentes, el modelo puede marcar discrepancias entre los hechos almacenados y las fuentes citadas.
- Monitorización de calidad de datos en entrenamiento de LLMs: se utiliza para filtrar pares de documento-afirmación que no tengan una relación de entailment clara, mejorando la calidad de los datos de entrenamiento.

## Benchmarks y rendimiento

El modelo fue evaluado en el benchmark LLM-AggreFact, que contiene 29,320 pares de grounding de 11 subconjuntos de datasets de consistencia factual. La métrica es precisión balanceada por subconjunto y luego macro-promedio.

| Subconjunto | Precisión balanceada (%) |
|---|---|
| ExpertQA | 59.5 |
| FactCheck-GPT | 69.7 |
| AggreFact-XSum | 72.4 |
| Wice | 73.6 |
| TofuEval-MediaS | 74.8 |
| AggreFact-CNN | 75.3 |
| TofuEval-MeetB | 76.5 |
| ClaimVerify | 79.5 |
| Reveal | 82.3 |
| RAGTruth | 86.5 |
| Lfqa | 88.2 |
| **Macro (promedio)** | **76.2** |
| Pooled (todos los pares, sin ponderar por subconjunto) | 84.7 |

Comparación con el líder en su clase de peso (<500M parámetros): FactCG-DeBERTa-v3-Large obtiene 75.6 de precisión balanceada macro; este modelo obtiene 76.2, una mejora de 0.6 puntos (aproximadamente 1.1 errores estándar). Un valor de 77.4 citado en la literatura pertenece a un modelo de 7 mil millones de parámetros, que no es comparable por tamaño.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación. Dado que el modelo tiene ~435M parámetros, en bf16 el tamaño de los pesos es de aproximadamente 870 MB, pero con overhead de activaciones y optimización, se estima que una GPU con 12 GB es suficiente para la inferencia (el entrenamiento se realizó en una GPU de 12 GB).
- GPUs recomendadas: cualquier GPU de consumo con al menos 8 GB de VRAM para inferencia en bf16; para el entrenamiento se usó una NVIDIA RTX 3060 de 12 GB.
- El modelo cabe en GPUs de consumo de gama media y alta (RTX 2060, 3060, 3070, 4060, etc.) con suficiente VRAM.
- Opciones de despliegue: se puede usar directamente con la librería `transformers` (PyTorch) o con ONNX Runtime. También es posible usar vLLM o TGI para servir el modelo como clasificador, aunque no hay documentación específica de estos motores.
- Latencia y throughput: no disponible; depende del hardware y del tamaño del documento. Con chunking de 2048 tokens, la inferencia por chunk es relativamente rápida en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Precisión macro en LLM-AggreFact | Licencia |
|---|---|---|---|---|---|
| **AIDAM_VNEWS_435M_V1.0.0** | DeBERTa-v3-large | 435M | 2048 tokens | 76.2 | Apache 2.0 |
| FactCG-DeBERTa-v3-Large | DeBERTa-v3-large | ~435M | 2048 (típico) | 75.6 | Apache 2.0 (según su repositorio) |
| AIDAM_VNEWS_308M_V0.1.0 (anterior) | DeBERTa-v2-base (presumible) | 308M | no disponible | no disponible (no se documenta) | Apache 2.0 |

Nota: el modelo de 7B que obtiene 77.4 no se incluye por ser de una clase de peso muy diferente. La comparación se limita a modelos de tamaño similar (<500M) con el mismo benchmark.

## Limitaciones y advertencias

- Solo está entrenado y evaluado en inglés; no hay mediciones en otros idiomas, por lo que no debe usarse para textos no ingleses.
- El modelo está especializado en verificación de noticias y grounding de resúmenes; no es un modelo de razonamiento general ni de conocimiento enciclopédico. Su rendimiento en afirmaciones científicas o de dominio general no está validado.
- El subconjunto más débil es ExpertQA (59.5 de precisión balanceada), que contiene clases minoritarias y ruido, lo que indica una sensibilidad a la calidad de los datos de entrada.
- El modelo tiene un sesgo hacia la clase "no soportado": recall del 88.1 en la clase de no-soporte frente a 81.4 en la clase de soporte. Esto puede provocar falsos negativos en afirmaciones legítimas.
- El proceso de entrenamiento fue iterativo (17 intentos) y no se han documentado los fallos anteriores, lo que limita la reproducibilidad completa.
- Aunque la licencia Apache 2.0 permite uso comercial, los datos de entrenamiento (FactCG v4 y LLM-AggreFact) pueden tener restricciones propias; se recomienda revisar las licencias de esos conjuntos.
- No se han publicado resultados de benchmarks fuera de LLM-AggreFact, por lo que no se conoce su rendimiento en tareas de NLI clásicas (MNLI, SNLI) u otras.

## Enlaces

- Modelo en HuggingFace: [DeliVali/AIDAM_VNEWS_435M_V1.0.0](https://huggingface.co/DeliVali/AIDAM_VNEWS_435M_V1.0.0)
- Repositorio de entrenamiento en GitHub: [DeliVali/AIDAM_VNEWS](https://github.com/DeliVali/AIDAM_VNEWS)
- Modelo anterior de la familia: [DeliVali/AIDAM_VNEWS_308M_V0.1.0](https://huggingface.co/DeliVali/AIDAM_VNEWS_308M_V0.1.0)
- Documentación de AIDAM (roadmap y campañas): disponible en el repositorio de GitHub en `docs/ROADMAP.md`
