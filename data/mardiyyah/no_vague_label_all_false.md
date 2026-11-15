# Mardiyyah/no_vague_label_all_false

## Resumen

`no_vague_label_all_false` es un modelo de clasificación de tokens (token classification) desarrollado por el usuario Mardiyyah de Hugging Face, obtenido mediante fine-tuning del modelo biomédico `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext` sobre el dataset `OTAR3088/CeLLaTe_no_vague1.0_IOB`. La tarea concreta es el reconocimiento de entidades nombradas (NER) en el dominio biomédico, con etiquetado en formato IOB, y el nombre del modelo sugiere una variante de entrenamiento orientada a evitar etiquetas vagas o ambiguas.

El modelo parte de una arquitectura BERT base (encoder transformer) con 108.897.031 parámetros totales, pesos en safetensors y un tamaño de repositorio de 0,4 GB. Está publicado bajo licencia Apache 2.0 y solo declara soporte para inglés. Es relevante como ejemplo de adaptación de un encoder biomédico preentrenado a una tarea concreta de extracción de entidades, un patrón habitual en pipelines de procesamiento de literatura científica y registros clínicos.

La model card es escasa: no incluye descripción del modelo, usos previstos, limitaciones ni composición del dataset de entrenamiento más allá de su identificador. Los datos disponibles se limitan a los hiperparámetros de entrenamiento y a la curva de métricas por época, por lo que muchas especificaciones habituales quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (encoder transformer), fine-tuning para token classification |
| Parametros totales | 108.897.031 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BiomedBERT acepta hasta 512 tokens, pero no se declara en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas, no documentada por el autor) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | token-classification |
| Modelo base | microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext |
| Dataset de entrenamiento | OTAR3088/CeLLaTe_no_vague1.0_IOB (formato IOB) |
| Librería | transformers 4.48.2 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un encoder transformer tipo BERT base fine-tuneado para clasificación de tokens. Hereda del modelo base BiomedBERT la inicialización de pesos y el vocabulario, y añade una cabeza de clasificación token a token sobre el dataset `OTAR3088/CeLLaTe_no_vague1.0_IOB`, con etiquetas en formato IOB (inside-outside-beginning), lo que indica una tarea de reconocimiento de entidades con fronteras de entidad.

El entrenamiento se realizó con los siguientes hiperparámetros: learning rate 2e-05, batch size de entrenamiento 16 con acumulación de gradiente de 2 (batch efectivo 32), optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con warmup ratio 0,01, 20 épocas, semilla 3407 y precisión mixta nativa (AMP). El conjunto de evaluación alcanzó una pérdida de 0,1276. No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo técnicas de RLHF/DPO (no aplicables en un encoder de clasificación). Tampoco se describe ninguna innovación técnica más allá del fine-tuning estándar.

## Capacidades

- Clasificación de tokens para reconocimiento de entidades nombradas (NER) en texto biomédico en inglés, con etiquetado IOB.
- Extracción de entidades con fronteras delimitadas (beginning/inside), adecuada para pipelines de anotación estructurada.
- Procesamiento de texto biomédico gracias al preentrenamiento de BiomedBERT sobre abstracts y texto completo de PubMed.
- No soporta generación de texto: es un modelo discriminativo de clasificación, no un modelo causal.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Extracción de entidades biomédicas en literatura científica: el modelo etiqueta tokens en abstracts y artículos para poblar bases de datos de genes, enfermedades o fármacos, aprovechando el preentrenamiento de BiomedBERT en el dominio.
- Anotación asistida de corpus clínicos: se puede usar como preanotador en flujos de anotación humana, reduciendo el esfuerzo manual en la identificación de menciones de entidades con formato IOB.
- Normalización previa a enlazado de entidades: las menciones extraídas sirven como entrada a un paso posterior de entity linking contra ontologías médicas.
- Procesamiento por lotes de registros de ensayos clínicos: al ser un encoder de 108 millones de parámetros, permite inferencia de alto rendimiento en CPU o GPU modesta para grandes volúmenes de texto.
- Filtrado y enriquecimiento de bases documentales: clasificar documentos o fragmentos según la presencia de entidades de interés para tareas de recuperación de información.
- Componente en pipelines de extracción de información con Hugging Face `transformers`: integración directa mediante `pipeline("token-classification")` y despliegue en endpoints compatibles.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluación (última época, 20):

| Metrica | Valor |
|---|---|
| Loss | 0,1276 |
| Precision | 0,6637 |
| Recall | 0,7250 |
| Micro F1 | 0,6930 |
| Weighted F1 | 0,6945 |
| Macro F1 | 0,6887 |
| Accuracy | 0,9796 |

Evolución destacada durante el entrenamiento: el mejor Macro F1 se alcanzó en la época 18 (0,6887), con Micro F1 de 0,6930 y recall de 0,7250; la accuracy se mantuvo estable en torno a 0,98 desde la primera época. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB de pesos (108,9 M de parámetros × 4 bytes), más activaciones; en la práctica cabe en cualquier GPU consumer.
- VRAM estimada en fp16: aproximadamente 0,22 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; también funciona en CPU para lotes moderados.
- Cabe en GPU consumer: sí, incluidas GTX 1650, RTX 3060, RTX 4090 y similares; incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: Hugging Face `transformers` (pipeline de token-classification), Hugging Face Inference Endpoints (el tag `endpoints_compatible` lo indica), ONNX Runtime y servidores de inferencia compatibles con modelos de encoder.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| no_vague_label_all_false | 108,9 M | no disponible | NER biomédico (IOB) | Apache 2.0 | Hugging Face |
| microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext | ~110 M | 512 tokens (estándar BERT) | Modelo base preentrenado (MLM) | MIT (según el modelo base) | Hugging Face |
| Modelos NER biomédicos fine-tuneados sobre BiomedBERT | ~110 M | 512 tokens | NER biomédico | variable | Hugging Face |

La comparación cuantitativa de rendimiento con alternativas no está disponible, ya que la model card no incluye comparaciones ni el model-index contiene resultados.

## Limitaciones y advertencias

- Model card incompleta: no documenta usos previstos, limitaciones, composición del dataset ni sesgos, lo que dificulta evaluar su idoneidad en producción.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos en la extracción de entidades; el F1 en torno a 0,69 indica margen de error considerable.
- El modelo solo declara inglés; su uso con texto en castellano no está validado.
- El nombre del modelo sugiere un entrenamiento específico contra etiquetas vagas ("all_false"), lo que puede implicar un sesgo hacia la clase fuera de entidad; conviene validar la distribución de predicciones antes de desplegarlo.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de BiomedBERT conviene verificar la licencia del modelo base y del dataset de entrenamiento para cumplir con sus condiciones.
- Sin datos de benchmarks comparativos ni de robustez fuera de dominio; no se recomienda su uso en dominios distintos al biomédico sin reevaluación.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mardiyyah/no_vague_label_all_false
- Modelo base: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext
- Dataset de entrenamiento: https://huggingface.co/datasets/OTAR3088/CeLLaTe_no_vague1.0_IOB
