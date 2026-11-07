# debjit20504/miRNA-biobert

## Resumen

miRNA-BioBERT es un modelo de clasificación de texto en inglés biomédico, publicado por el usuario debjit20504 en Hugging Face, que parte de BioBERT (`dmis-lab/biobert-base-cased-v1.1`) y se afina mediante LoRA para una tarea binaria: determinar si una frase de un artículo científico está relacionada con microARN (miRNA) o no. El modelo resuelve un problema de filtrado y extracción de información en revisiones de literatura genómica, donde el volumen de publicaciones hace inviable la lectura manual.

Se trata de un transformer encoder de tipo BERT con 108.311.810 parámetros (aproximadamente 108 millones), orientado exclusivamente a clasificación de secuencias y no a generación de texto. Su relevancia radica en la especialización: frente a un modelo generalista, incorpora el vocabulario y el dominio del corpus biomédico de BioBERT y añade un ajuste fino supervisado sobre un corpus etiquetado de frases relevantes e irrelevantes de miRNA.

El repositorio ocupa 0,4 GB y los pesos se distribuyen en formato safetensors. La licencia es Apache 2.0, lo que permite uso comercial con atribución. No obstante, el modelo tiene un alcance muy acotado, un número reducido de descargas (13 en el momento de la consulta) y carece de benchmarks publicados, por lo que debe evaluarse con cautela antes de llevarlo a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (base, cased), afinado con LoRA sobre BioBERT |
| Parámetros totales | 108.311.810 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el tokenizador es el de BioBERT base, con límite típico de 512 tokens, no confirmado en la model card) |
| Tipos de cuantización | no disponible (pesos en safetensors; admite cuantización posterior con herramientas estándar, no documentada por el autor) |
| Idiomas soportados | no disponible (el corpus de entrenamiento y el tokenizador de BioBERT son en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT en su variante base con casing preservado (`biobert-base-cased-v1.1`), es decir, 12 capas, dimensión oculta de 768 y 12 cabezas de atención, con una cabeza de clasificación de dos etiquetas (1 = funcional/relevante, 0 = no funcional/irrelevante). Sobre esta base se aplicó un ajuste fino con LoRA (Low-Rank Adaptation), técnica que congela los pesos originales e introduce matrices de baja dimensión entrenables, reduciendo el coste computacional y de memoria del entrenamiento. El modelo resultante se guarda con la cabeza de clasificación y los adaptadores fusionados en los pesos publicados.

El entrenamiento se realizó sobre un corpus biomédico curado con 429.785 frases relevantes y 87.966 frases irrelevantes (517.751 en total, con un desbalance aproximado de 4,9:1 a favor de la clase positiva). Se emplearon 5 épocas, tamaño de lote 32, tasa de aprendizaje 2e-5, optimizador AdamW, 1.000 pasos de calentamiento y precisión mixta fp16, sobre una única GPU NVIDIA RTX A6000. La model card no documenta el número de tokens de entrenamiento, la composición detallada del dataset, ni si hubo validación cruzada, conjunto de test independiente o técnicas de calibración para el desbalance de clases.

## Capacidades

- Clasificación binaria de frases biomédicas: distingue entre frases relacionadas con miRNA (etiqueta 1) y frases no relacionadas (etiqueta 0).
- Extracción de información en literatura científica: identificación de oraciones que describen mecanismos, expresiones diferenciales o interacciones de miRNA.
- Procesamiento de texto biomédico en inglés con el vocabulario especializado heredado de BioBERT.
- Inferencia ligera: al ser un encoder de 108 millones de parámetros, la clasificación es rápida y cabe en hardware modesto.
- Integración con la librería `transformers` mediante `AutoModelForSequenceClassification` y `AutoTokenizer`.
- Compatibilidad con Text Embeddings Inference y endpoints compatibles, según los tags del repositorio.
- No soporta generación de texto, tool calling, razonamiento multi-paso, agentes, visión ni audio.

## Casos de uso

- Filtrado de literatura en revisiones sistemáticas: el modelo puede procesar abstracts y textos completos de PubMed para descartar frases no relacionadas con miRNA antes de la revisión manual, reduciendo el volumen de lectura de forma significativa gracias a su clasificación binaria entrenada sobre más de 500.000 frases.
- Construcción de corpus especializados: sirve como primer paso de un pipeline de minería de textos para seleccionar oraciones candidatas que alimenten bases de datos de interacciones miRNA-ARNm o de expresión diferencial.
- Anotación asistida de datasets: preetiquetar frases biomédicas con la clase relevante o irrelevante acelera el trabajo de anotadores humanos, que solo revisan y corrigen las predicciones.
- Enriquecimiento de motores de búsqueda biomédicos: reordenar resultados de búsqueda priorizando fragmentos que mencionan miRNA, mejorando la relevancia de herramientas internas de consulta documental.
- Monitorización de publicaciones: integrado en un pipeline que descarga nuevos artículos de bases como PubMed o bioRxiv, el modelo permite alertar a investigadores sobre frases que describen mecanismos de miRNA de su interés.
- Preprocesamiento para modelos generativos: actuar como filtro previo que suministre a un LLM únicamente contexto relevante sobre miRNA, reduciendo el coste de tokens y la probabilidad de alucinación en tareas de resumen o extracción posteriores.
- Análisis de patentes y documentación regulatoria biomédica: clasificar frases de documentos técnicos para localizar menciones a miRNA en entornos de vigilancia tecnológica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, exhaustividad, F1, matriz de confusión ni comparación con líneas base, ni sobre el conjunto de entrenamiento ni sobre un conjunto de test independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB para los pesos (108 millones de parámetros × 4 bytes), más el overhead de activaciones, que en secuencias de hasta 512 tokens suele situar el consumo total en torno a 1-2 GB.
- VRAM estimada en fp16: alrededor de 0,22 GB para los pesos, con un consumo total práctico inferior a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor entrenó en una RTX A6000, pero para inferencia bastan tarjetas consumer como GTX 1650, RTX 3060, RTX 4060 o superiores.
- Cabe holgadamente en GPU consumer e incluso en CPU para lotes pequeños; también es viable en Apple Silicon mediante MPS, como muestra el ejemplo de la model card.
- Opciones de despliegue: `transformers` con PyTorch, Text Embeddings Inference (según los tags del repositorio), ONNX Runtime tras conversión, y servicios de inferencia compatibles con endpoints. No se documenta soporte nativo de vLLM, llama.cpp ni Ollama, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles. Por el tamaño del modelo, se espera latencia de milisegundos por frase en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| miRNA-BioBERT (este modelo) | 108,3 M | no disponible | Clasificación binaria de frases miRNA | Apache 2.0 | Hugging Face, 13 descargas |
| BioBERT base cased v1.1 (`dmis-lab`) | ~108 M | 512 tokens (límite BERT) | Modelo base biomédico, sin cabeza de clasificación específica | Apache 2.0 (según repositorio original) | Hugging Face, ampliamente utilizado |
| PubMedBERT (`microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext`) | ~110 M | 512 tokens | Modelo base biomédico entrenado desde cero con corpus PubMed | MIT | Hugging Face, muy extendido |
| SciBERT (`allenai/scibert_scivocab_uncased`) | ~110 M | 512 tokens | Modelo base para texto científico general | Apache 2.0 | Hugging Face, muy extendido |

La comparación directa de rendimiento no es posible porque miRNA-BioBERT no publica métricas. Frente a los modelos base, su ventaja es la especialización en la tarea binaria de miRNA; su desventaja es la ausencia de validación pública y su menor adopción.

## Limitaciones y advertencias

- No se han publicado métricas de evaluación: se desconoce la precisión real, el F1 y el comportamiento sobre datos fuera de distribución, lo que impide garantizar su calidad en producción.
- El corpus de entrenamiento presenta un desbalance de clases de aproximadamente 4,9:1, y la model card no documenta si se aplicaron técnicas de compensación (ponderación de clases, remuestreo o ajuste de umbral), lo que puede sesgar las predicciones hacia la clase mayoritaria.
- El modelo está entrenado para clasificación binaria en inglés biomédico; no hay evidencia de soporte multilingüe ni de robustez ante texto coloquial o de otros dominios.
- Riesgo de alucinación no aplicable en sentido estricto (no genera texto), pero sí de falsos positivos y falsos negativos que pueden propagarse a pipelines posteriores si no se valida la salida.
- Sesgos potenciales derivados del corpus: la selección de frases relevantes puede reflejar sesgos de las fuentes indexadas (PubMed y similares), con posible infrarrepresentación de ciertas enfermedades, poblaciones o líneas de investigación.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base BioBERT y sus datos de preentrenamiento pueden tener condiciones adicionales que conviene revisar antes de explotarlo comercialmente.
- El repositorio tiene muy poca tracción (13 descargas, 0 likes) y un único autor, sin proceso de revisión por pares ni mantenimiento documentado; la fecha de actualización es posterior a la de creación, pero no se detalla qué cambios se introdujeron.
- La longitud máxima de contexto no está declarada; asumir 512 tokens (límite estándar de BERT) es razonable, pero debería verificarse empíricamente antes de procesar documentos largos.
- No debe confundirse con un modelo generativo: no responde preguntas ni redacta resúmenes, solo etiqueta secuencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/debjit20504/miRNA-biobert
- Modelo base BioBERT v1.1: https://huggingface.co/dmis-lab/biobert-base-cased-v1.1
- Repositorio GitHub de BioBERT: https://github.com/dmis-lab/biobert
- Paper de BioBERT (Bioinformatics, 2020): https://academic.oup.com/bioinformatics/article/36/4/1234/5566506
- LinkedIn del autor: https://www.linkedin.com/in/debjit-pramanik-88a837171/
- Contacto del autor: pramanikdebjit4@gmail.com
