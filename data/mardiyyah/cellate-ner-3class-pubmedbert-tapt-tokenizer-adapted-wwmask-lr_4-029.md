# Mardiyyah/CeLLaTe-ner-3class-pubmedbert-tapt-tokenizer-adapted-wwmask-lr_4.029

## Resumen

CeLLaTe-ner-3class-pubmedbert-tapt-tokenizer-adapted-wwmask-lr_4.029 es un modelo de reconocimiento de entidades nombradas (NER) de tres clases, especializado en el dominio biomédico. Se trata de un fine-tuning de PubMedBERT, un transformer BERT preentrenado desde cero sobre abstracts y artículos completos de PubMed, que a su vez ha sido adaptado mediante un entrenamiento continuo con enmascaramiento de palabras completas (whole-word masking) y un tokenizador adaptado al vocabulario biomédico. El modelo ha sido desarrollado por Mardiyyah y está pensado para etiquetar entidades en textos científicos y clínicos, probablemente relacionadas con líneas celulares (el nombre CeLLaTe sugiere "cell line" o similar).

Con 110,4 millones de parámetros, es un modelo de tamaño base que puede ejecutarse en GPUs de consumo. Su relevancia radica en que ofrece una alternativa de código abierto (licencia Apache 2.0) para tareas de extracción de información en el ámbito biosanitario, donde la precisión en la identificación de entidades es crítica. El modelo se distribuye en formato safetensors y es compatible con la librería Transformers de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (PubMedBERT) con cabecera de clasificación de tokens |
| Parametros totales | 110.410.759 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (PubMedBERT base soporta 512 tokens, pero no se especifica en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT, concretamente en PubMedBERT, un transformer preentrenado desde cero con un vocabulario WordPiece específico del dominio biomédico. Sobre esta base, el autor aplicó un entrenamiento continuo (TAPT, Task-Adaptive Pre-Training) con enmascaramiento de palabras completas y un tokenizador adaptado, lo que permite capturar mejor la terminología médica. Posteriormente se realizó un fine-tuning supervisado sobre el dataset OTAR3088/CeLLaTe-ner-3class-iob_final, que contiene anotaciones NER en formato IOB con tres clases de entidades.

El entrenamiento se llevó a cabo durante 20 épocas con un tamaño de lote efectivo de 64 (32 con acumulación de gradientes de 2), una tasa de aprendizaje de 4,03e-5 con scheduler lineal y warmup del 6%, y precisión mixta nativa (AMP). El optimizador fue AdamW con betas (0.9, 0.999). La pérdida de entrenamiento descendió de 0.8266 en la primera época hasta 0.0024 en la época 16, lo que indica una convergencia estable. No se reporta el uso de RLHF ni DPO; el ajuste es puramente supervisado.

## Capacidades

- Reconocimiento de entidades nombradas (NER) de tres clases en textos biomédicos, con etiquetado a nivel de token (token classification).
- Procesamiento de texto en inglés, con vocabulario adaptado a terminología médica y científica.
- Inferencia sobre secuencias de hasta 512 tokens (limitación heredada de BERT, aunque no confirmada en la documentación del modelo).
- Integración nativa con el ecosistema Transformers: puede usarse con pipelines de `token-classification` y cargarse con `AutoModelForTokenClassification`.
- Compatible con endpoints de Hugging Face y despliegue en producción mediante librerías como vLLM o TGI (aunque al ser un modelo BERT, el uso típico es con PyTorch o TensorFlow).
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales; es un modelo exclusivamente discriminativo para etiquetado de secuencias.

## Casos de uso

- Extracción de entidades en literatura biomédica: el modelo puede procesar abstracts de PubMed y artículos completos para identificar automáticamente menciones de líneas celulares, fármacos o enfermedades, facilitando la construcción de bases de datos estructuradas.
- Anotación de historiales clínicos electrónicos: permite etiquetar entidades en notas médicas para su posterior indexación y análisis, reduciendo el trabajo manual de codificación.
- Minería de textos en ensayos clínicos: ayuda a extraer información relevante de documentos de ensayos, como tipos de células o condiciones de tratamiento, para su comparación y metaanálisis.
- Enriquecimiento de grafos de conocimiento biomédico: las entidades detectadas pueden vincularse a ontologías como UMLS o MeSH, alimentando sistemas de razonamiento automático.
- Preprocesamiento para sistemas de pregunta-respuesta: al identificar entidades, se mejora la recuperación de información en motores de búsqueda especializados en salud.
- Automatización de revisiones sistemáticas: el modelo puede filtrar y clasificar artículos según las entidades que contienen, acelerando la fase de cribado en revisiones bibliográficas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. La model card reporta las siguientes métricas de evaluación sobre el conjunto de validación del dataset CeLLaTe-ner-3class-iob_final:

| Metrica | Valor |
|---|---|
| Loss | 0.1014 |
| Precision | 0.7826 |
| Recall | 0.7424 |
| Micro F1 | 0.7620 |
| Weighted F1 | 0.7622 |
| Macro F1 | 0.7607 |
| Accuracy | 0.9824 |

Estos valores corresponden al mejor checkpoint (época 11) según la tabla de entrenamiento. La accuracy alta (98,24%) se explica por el desequilibrio de clases típico en NER, donde la mayoría de tokens son "O" (fuera de entidad). Las métricas F1 en torno a 0.76 indican un rendimiento moderado, comparable a otros modelos NER biomédicos de tamaño similar, aunque sin datos de comparación directa.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (110M parámetros × 4 bytes), reducible a ~0,25 GB con cuantización de 8 bits. Cabe holgadamente en cualquier GPU moderna, incluso en iGPUs con suficiente memoria compartida.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, por ejemplo NVIDIA GTX 1650, RTX 3060, o superiores. Para entrenamiento o fine-tuning adicional se recomienda al menos 8 GB (RTX 3070, A100, etc.).
- Es compatible con GPUs de consumo: sí, es un modelo ligero que se ejecuta sin problemas en tarjetas como RTX 4090 o incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: puede servirse con vLLM (aunque no es óptimo para BERT), Hugging Face Inference Endpoints, o mediante contenedores personalizados con FastAPI y PyTorch. También es compatible con ONNX Runtime para optimización en CPU.
- Latencia y throughput estimados: en una GPU RTX 3090, la inferencia sobre un texto de 512 tokens típicamente toma entre 5 y 15 ms por muestra, con un throughput de cientos de muestras por segundo en modo batch. En CPU, la latencia puede ser de 50-200 ms por muestra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| CeLLaTe-ner-3class (este) | 110M | no disponible | Apache 2.0 | NER biomédico, fine-tuning de PubMedBERT con TAPT |
| BioBERT (dmis-lab/biobert) | 110M | 512 | Apache 2.0 | NER biomédico, fine-tuning de BERT sobre PubMed |
| PubMedBERT (microsoft/BiomedNLP-PubMedBERT) | 110M | 512 | MIT | Preentrenado desde cero en PubMed, base para NER |

La comparación directa no es posible sin ejecutar los mismos benchmarks. Sin embargo, este modelo se distingue por el entrenamiento continuo con tokenizador adaptado y whole-word masking, lo que podría mejorar la captura de términos compuestos. BioBERT y PubMedBERT son alternativas establecidas, pero este modelo ofrece una variante específica para el dominio de líneas celulares (según el nombre del dataset). No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado principalmente con literatura biomédica en inglés, puede tener un rendimiento deficiente en textos coloquiales, dialectos o terminología no estándar.
- Riesgo de alucinación: aunque es un modelo discriminativo (no generativo), puede producir etiquetas incorrectas en contextos ambiguos o con entidades poco frecuentes, especialmente si el texto contiene jerga o abreviaturas no vistas en el entrenamiento.
- Limitaciones de contexto: la longitud máxima de secuencia no está documentada, pero al ser BERT, se espera un límite de 512 tokens. Textos más largos requieren truncamiento o estrategias de ventana deslizante.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el dataset de entrenamiento (OTAR3088/CeLLaTe-ner-3class-iob_final) puede tener sus propias restricciones; se recomienda verificar su licencia antes de redistribuir el modelo o sus derivados.
- Caveat de producción: la model card está generada automáticamente y carece de detalles sobre el preprocesamiento exacto, el etiquetado de clases y el rendimiento en datos fuera de dominio. Es imprescindible validar el modelo con un conjunto de prueba propio antes de desplegarlo en entornos clínicos o de investigación crítica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mardiyyah/CeLLaTe-ner-3class-pubmedbert-tapt-tokenizer-adapted-wwmask-lr_4.029
- Modelo base (TAPT): https://huggingface.co/Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-adapted-wwmask
- Variante baseline del mismo autor: https://huggingface.co/Mardiyyah/CeLLaTe-ner-3class-pubmedbert-tapt-tokenizer-adapted-baseline
- Variante con tokenizador original: https://huggingface.co/Mardiyyah/CeLLaTe-ner-3class-pubmedbert-tapt-tokenizer-original-wwmask
- Referencia de PubMedBERT (Emergent Mind): https://www.emergentmind.com/topics/pubmedbert
- Repositorio de BioBERT (referencia de arquitectura similar): https://github.com/dmis-lab/biobert
