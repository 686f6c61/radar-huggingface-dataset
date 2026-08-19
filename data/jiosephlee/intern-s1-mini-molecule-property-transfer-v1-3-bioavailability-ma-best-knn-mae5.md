# jiosephlee/intern-s1-mini-molecule-property-transfer-v1.3-bioavailability-ma-best-knn-mae5

## Resumen

El modelo `jiosephlee/intern-s1-mini-molecule-property-transfer-v1.3-bioavailability-ma-best-knn-mae5` es un checkpoint especializado en transferencia de propiedades moleculares, concretamente en la predicción de biodisponibilidad (bioavailability) a partir de datos de ensayos. Ha sido desarrollado por el usuario jiosephlee, que ha adaptado la arquitectura base Intern-S1-mini (basada en Qwen3) mediante un proceso de ajuste fino denominado assay-transfer, que transfiere conocimiento entre ensayos químicos usando grafos de pares de moléculas. El modelo tiene 8.201.221.120 parámetros, lo que lo sitúa en la gama de los 8B, y se distribuye en formato safetensors con un tamaño de repositorio de 16,4 GB.

La relevancia de este modelo radica en su enfoque específico: en lugar de un modelo de lenguaje general, se entrena para predecir propiedades biológicas de moléculas, una tarea crítica en el descubrimiento de fármacos y la química computacional. El checkpoint presentado es el mejor resultado de una ejecución de 25 épocas con un límite de grado de 16 (8 pares entrantes y 8 salientes por molécula), seleccionado por su error absoluto medio KNN MAE@5 en validación. Aunque el modelo card no detalla la arquitectura interna completa, el tag `qwen3` sugiere que la base es un transformer de la familia Qwen3, adaptado para tareas de regresión molecular.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3, segun tag; detalles internos no disponibles) |
| Parametros totales | 8.201.221.120 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles (solo safetensors sin cuantizar en el repo) |
| Idiomas soportados | no disponibles (modelo orientado a datos moleculares, no a lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa presumiblemente en la arquitectura Intern-S1-mini, que a su vez deriva de Qwen3, un transformer autoregresivo con atención por ventanas deslizantes y atención completa alternadas. Sin embargo, el modelo card no especifica detalles internos como el número de capas, cabezas de atención o el mecanismo exacto de adaptación para la tarea de transferencia de propiedades. Lo que sí se documenta es el proceso de entrenamiento: un ajuste fino de 25 épocas con un límite de grado de 16 (cada molécula se conecta a 8 pares entrantes y 8 salientes), tasa de aprendizaje de 2e-5, batch size de 32 y gradiente acumulado de 1. El entrenamiento utilizó empaquetado (packed training) y validación por ranking cada 10 pasos. El dataset empleado es `jiosephlee/molecule-property-transfer-v1.3-bioavailability-ma-vote-mean-intern`, que contiene datos de biodisponibilidad con votos y medias. La métrica de selección fue el KNN MAE@5 en validación, alcanzando un valor de 0,571165, y en el test reservado se obtuvo 0,560633. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Predicción de biodisponibilidad molecular: el modelo estima la biodisponibilidad de compuestos químicos a partir de datos de ensayos, usando un enfoque de transferencia entre ensayos.
- Transferencia de propiedades entre ensayos (assay-transfer): puede generalizar conocimiento de un conjunto de ensayos a otros, gracias al grafo de pares con grado 16.
- Regresión numérica sobre propiedades moleculares: produce valores continuos (probablemente normalizados) en lugar de texto, como indica la métrica MAE.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión, audio ni razonamiento multilingüe. El modelo está especializado exclusivamente en el dominio químico.

## Casos de uso

- Selección de compuestos candidatos en descubrimiento de fármacos: el modelo puede priorizar moléculas con alta biodisponibilidad predicha antes de síntesis y ensayos in vivo, reduciendo costes.
- Filtrado de librerías químicas: dado un conjunto de millones de compuestos, se puede usar el modelo para descartar aquellos con baja biodisponibilidad predicha, acelerando el cribado virtual.
- Transferencia de resultados entre ensayos: cuando un laboratorio tiene datos de un ensayo pero no de otro, el modelo puede transferir el conocimiento aprendido para estimar resultados en el ensayo objetivo.
- Optimización de lead compounds: en química medicinal, el modelo ayuda a modificar estructuras de moléculas prometedoras para mejorar su biodisponibilidad, evaluando rápidamente variantes.
- Integración en pipelines de quimioinformática: dado que el modelo es compatible con Transformers, puede integrarse en flujos de Python usando la API de HuggingFace para predicciones por lotes.
- Análisis de datos de biodisponibilidad con votos: el dataset usa votos y medias, lo que permite al modelo manejar incertidumbre en las etiquetas, útil para datos experimentales ruidosos.

## Benchmarks y rendimiento

El modelo card reporta únicamente la métrica de selección KNN MAE@5 (error absoluto medio sobre los 5 vecinos más cercanos). No se proporcionan resultados comparativos con otros modelos en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje general. Los datos disponibles son:

| Metrica | Valor |
|---|---|
| KNN MAE@5 (validacion) | 0,571165 |
| KNN MAE@5 (test reservado) | 0,560633 |

No se han publicado resultados de benchmarks comparativos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.201.221.120 parámetros en precisión fp32, se necesitarían aproximadamente 32 GB de VRAM. En fp16, unos 16,4 GB. Con cuantización a 8 bits, ~8,2 GB; a 4 bits, ~4,1 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: para fp16, una GPU con 24 GB (RTX 4090, A5000) sería suficiente. Para cuantización 4-bit, una RTX 3090 o inferior (12-16 GB) podría bastar. En entornos de producción, A100 o H100 ofrecen mayor throughput.
- Compatibilidad con GPU de consumo: sí, con cuantización adecuada (p. ej., bitsandbytes o GPTQ) cabe en GPUs de 16 GB o incluso 8 GB, aunque con latencia mayor.
- Opciones de despliegue: al ser un modelo Transformers con safetensors, puede servirse con vLLM, Text Generation Inference (TGI) o directamente con la librería transformers de HuggingFace. También es posible convertirlo a GGUF para usar con llama.cpp u Ollama, aunque no hay archivos GGUF oficiales.
- Latencia y throughput: no disponibles. Dado el tamaño de 8B, en una A100 se esperaría un throughput de decenas de tokens por segundo en generación, pero al ser una tarea de regresión, la inferencia es de una sola pasada y muy rápida (milisegundos por molécula).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría de transferencia de propiedades moleculares con grado 16 y métrica KNN MAE@5. El autor no proporciona comparaciones con alternativas como MolT5, ChemBERTa o modelos de regresión molecular. Por tanto, la comparativa se limita a indicar que el modelo se basa en Intern-S1-mini (8B) y que no hay datos públicos de rendimiento relativo.

## Limitaciones y advertencias

- Sesgos de datos: el modelo se entrena sobre un dataset específico de biodisponibilidad con votos; los resultados pueden no generalizar a otras propiedades moleculares o a conjuntos de moléculas muy diferentes.
- Riesgo de alucinación: aunque no genera texto, las predicciones numéricas pueden ser incorrectas o poco fiables para moléculas fuera de la distribución de entrenamiento; se recomienda validación experimental.
- Licencia no especificada: no se indica la licencia del modelo ni del dataset, lo que impide conocer restricciones de uso comercial o redistribución. Es necesario contactar al autor antes de usar en producción.
- Sin contexto de lenguaje: el modelo no está diseñado para procesar lenguaje natural; solo acepta representaciones de moléculas (probablemente SMILES o grafos), por lo que no es útil para tareas de NLP.
- Limitaciones de contexto: no se documenta la longitud de contexto; al ser una tarea de regresión sobre moléculas individuales, el contexto probablemente es corto (una molécula por muestra).
- Producción: al no haber benchmarks comparativos ni documentación de robustez, se recomienda evaluar exhaustivamente en el dominio objetivo antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jiosephlee/intern-s1-mini-molecule-property-transfer-v1.3-bioavailability-ma-best-knn-mae5
- Base Intern-S1-mini (jiosephlee): https://huggingface.co/jiosephlee/Intern-S1-mini-lm
- Intern-S1-mini original (internlm): https://huggingface.co/internlm/Intern-S1-mini
- Repositorio GitHub de Intern-S1: https://github.com/InternLM/Intern-S1
- Paper de Intern-S1 (arXiv): https://arxiv.org/pdf/2508.15763v2
