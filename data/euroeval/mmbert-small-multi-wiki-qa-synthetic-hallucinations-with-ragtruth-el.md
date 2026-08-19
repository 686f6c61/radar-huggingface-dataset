# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-el

## Resumen

El modelo `EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-el` es un encoder multilingüe de tamaño pequeño (140 millones de parámetros) fine-tuneado para la detección de alucinaciones a nivel de token en respuestas generadas por sistemas de recuperación aumentada (RAG). Lo desarrolla el grupo EuroEval, sobre la base del modelo mmBERT-small, un encoder moderno multilingüe entrenado con aprendizaje por anclaje en cascada (ALL) sobre 3 billones de tokens en 1833 lenguas. El fine-tuning se realizó con datos sintéticos del benchmark MultiWikiQHalluA, que etiqueta tokens como alucinados o veraces en respuestas a preguntas sobre artículos de Wikipedia. Es relevante porque aborda un problema crítico en producción: la verificación automática de la fidelidad de respuestas generadas por IA, especialmente en contextos multilingües. El modelo está disponible en HuggingFace con formato safetensors y se integra con la librería transformers mediante la pipeline de token-classification.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder) |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo multilingüe, entrenado en 1833 lenguas en su base) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, mmBERT-small, es un encoder moderno basado en la arquitectura ModernBERT, que incorpora atención lineal y otras optimizaciones frente a los BERT clásicos. Se entrenó con aprendizaje por anclaje en cascada (ALL), una técnica que organiza el entrenamiento en fases para mejorar la eficiencia en lenguas con pocos recursos. Sobre esta base, el equipo de EuroEval realizó un fine-tuning supervisado para la tarea de clasificación de tokens, utilizando el conjunto de datos MultiWikiQHalluA. Este dataset se genera mediante un pipeline sintético: se toman contextos de Wikipedia, preguntas y respuestas correctas, y un modelo de lenguaje (LettuceDetect) produce respuestas con alucinaciones etiquetadas a nivel de token. El fine-tuning se realizó con la librería transformers, aunque los hiperparámetros exactos no se han publicado. El modelo resultante asigna a cada token una etiqueta que indica si forma parte de una alucinación o no.

## Capacidades

- Detección de alucinaciones a nivel de token en respuestas generadas por sistemas RAG.
- Clasificación de tokens en categorías binarias (alucinado / veraz) o posiblemente más finas.
- Soporte multilingüe, dado que el modelo base fue entrenado en 1833 lenguas.
- Integración con la pipeline `token-classification` de transformers, lo que permite un uso directo con `pipeline()`.
- No es un modelo generativo: no produce texto, solo etiqueta tokens existentes.
- Compatible con la API de endpoints de HuggingFace (etiqueta `endpoints_compatible`).

## Casos de uso

- Control de calidad en sistemas RAG: el modelo puede verificar automáticamente si las respuestas generadas por un sistema de recuperación contienen información no respaldada por el contexto recuperado. Se integraría como un paso posterior a la generación, etiquetando los tokens problemáticos para su revisión o corrección.
- Auditoría de chatbots multilingües: en despliegues internacionales, permite detectar alucinaciones en respuestas en diferentes idiomas sin necesidad de modelos separados por lengua.
- Filtrado de datos de entrenamiento: puede usarse para limpiar datasets de instrucciones o diálogos, eliminando o marcando respuestas con alucinaciones antes de usarlas para fine-tuning.
- Evaluación de pipelines de generación: en entornos de desarrollo, se puede usar como métrica automática para comparar la fidelidad de diferentes modelos o configuraciones de RAG.
- Monitorización en producción: desplegado junto a un sistema de generación, puede emitir alertas cuando la tasa de tokens alucinados supera un umbral, permitiendo intervención humana.
- Investigación en robustez de modelos: sirve como herramienta para estudiar patrones de alucinación en distintos idiomas y dominios, gracias a su naturaleza multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper asociado (arXiv:2605.02504) presenta el benchmark MultiWikiQHalluA y resultados del fine-tuning, pero los números concretos no están incluidos en la documentación del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 140M de parámetros en precisión fp32, el modelo ocupa aproximadamente 560 MB de memoria. En cuantización int8, alrededor de 140 MB. Cabe en cualquier GPU consumer moderna (4 GB o más).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3050, RTX 4060, o incluso CPUs con suficiente RAM (inferencia en CPU viable para batch pequeño).
- Opciones de despliegue: vLLM (aunque es un encoder, vLLM soporta modelos de clasificación), HuggingFace Inference Endpoints, TGI, o simplemente transformers con `pipeline("token-classification")`. También se puede servir con ONNX Runtime.
- Latencia y throughput: al ser un modelo pequeño, la inferencia es rápida. En una GPU moderna, el throughput puede superar los 1000 secuencias por segundo para secuencias cortas, aunque depende del hardware y la longitud del contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de detección de alucinaciones. El modelo base mmBERT-small compite con XLM-R y mBERT en tareas de comprensión multilingüe, pero la tarea específica de detección de alucinaciones a nivel de token no tiene un estándar claro de comparación en la información disponible.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del modelo, lo que impide conocer las restricciones de uso comercial. Se recomienda contactar con los autores antes de usarlo en producción.
- Sesgos potenciales: al entrenarse con datos sintéticos generados por otro modelo de lenguaje, puede heredar sesgos de ese modelo generador. Además, el dominio se limita a artículos de Wikipedia, por lo que puede no generalizar bien a otros dominios.
- Riesgo de alucinación en la propia detección: como cualquier modelo de clasificación, puede cometer errores, especialmente en lenguas o dominios poco representados en el entrenamiento.
- Longitud de contexto limitada: al ser un encoder basado en ModernBERT, la longitud de contexto típica es de 4096 o 8192 tokens, lo que limita su uso en documentos largos.
- Idioma específico: el sufijo `-el` sugiere que el fine-tuning se realizó específicamente para griego, aunque el modelo base es multilingüe. Esto puede implicar un rendimiento desigual en otros idiomas.
- Sin datos de entrenamiento detallados: no se publican los hiperparámetros del fine-tuning ni la composición exacta del dataset, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-el
- Repositorio de mmBERT (JHU-CLSP): https://github.com/JHU-CLSP/mmBERT/
- Paper del benchmark MultiWikiQHalluA (arXiv): https://arxiv.org/pdf/2605.02504v2
- Versión HTML del paper: https://arxiv.org/html/2605.02504v2
