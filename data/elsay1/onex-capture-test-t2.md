# elsay1/onex-capture-test-t2

## Resumen

El modelo `elsay1/onex-capture-test-t2` es un checkpoint de DistilBERT base, fine-tuneado sobre el dataset SST-2 (Stanford Sentiment Treebank) para clasificación de sentimientos en inglés. Aunque el repositorio se presenta como un experimento de captura (nombre "onex-capture-test-t2"), la model card indica que se trata de una copia o adaptación del conocido modelo `distilbert-base-uncased-finetuned-sst-2-english`, con 66,9 millones de parámetros y arquitectura transformer encoder-only.

El modelo resuelve la tarea de análisis de sentimiento binario (positivo/negativo) sobre frases en inglés. Su relevancia radica en ser un ejemplo de fine-tuning de un modelo ligero (DistilBERT) para una tarea específica, con un coste computacional bajo y buenos resultados en el benchmark GLUE/SST-2. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT base (transformer encoder-only, 6 capas, 12 cabezas de atención) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (configuración estándar de DistilBERT: 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y ONNX, sin cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, onnx |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una versión destilada de BERT base que conserva el 97% del rendimiento con un 40% menos de parámetros. Utiliza una arquitectura transformer encoder-only con 6 capas ocultas, 12 cabezas de atención y una dimensión de embedding de 768. El entrenamiento se realizó mediante fine-tuning sobre el dataset SST-2 (parte de GLUE), con una fase de destilación previa (knowledge distillation) que transfiere el conocimiento de BERT base al modelo más pequeño. No se dispone de información sobre el número de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO; el proceso estándar de fine-tuning para clasificación de texto suele emplear una capa de clasificación adicional sobre el token `[CLS]`.

El checkpoint concreto parece ser una copia o re-exportación del modelo `distilbert-base-uncased-finetuned-sst-2-english`, con los mismos pesos y configuración. La presencia de tags `pytorch` y `onnx` sugiere que se han exportado los pesos a ambos formatos para facilitar la inferencia en diferentes runtimes.

## Capacidades

- Clasificación de sentimiento binario (positivo/negativo) en inglés, sobre frases o fragmentos de texto cortos.
- Generación de embeddings contextuales de 768 dimensiones por token, útiles para tareas downstream como similitud semántica o recuperación.
- Inferencia rápida y ligera: al ser un modelo de 67M parámetros, puede ejecutarse en CPU con baja latencia.
- Soporte para exportación a ONNX, lo que permite despliegue en runtimes como ONNX Runtime, TensorRT o Windows ML.
- No tiene capacidades de generación de texto, tool calling, agentes ni razonamiento multi-step; es un modelo exclusivamente discriminativo.

## Casos de uso

- Análisis de opiniones de clientes: clasificar reseñas de productos o servicios como positivas o negativas para generar métricas de satisfacción. El modelo puede procesar miles de reseñas por hora en CPU, con una precisión de 0.91 en SST-2.
- Monitorización de redes sociales: detectar sentimiento en tuits, comentarios o mensajes de foros para alertar sobre crisis de reputación o tendencias de opinión.
- Filtrado de contenido moderado: identificar mensajes con tono negativo en plataformas de comentarios para priorizar revisión humana.
- Análisis de encuestas abiertas: clasificar respuestas de texto libre en encuestas de satisfacción, agrupándolas en positivas o negativas para análisis posterior.
- Preprocesamiento de datos para entrenamiento: usar las representaciones de la penúltima capa como características para otros modelos, por ejemplo en sistemas de recomendación.
- Demostración educativa de fine-tuning: servir como ejemplo práctico de cómo ajustar un modelo transformer pequeño con Hugging Face Transformers, dado que el código de entrenamiento original es público y reproducible.

## Benchmarks y rendimiento

Según los resultados declarados en la model card (model-index), el modelo alcanza las siguientes métricas en el conjunto de validación de SST-2:

| Metrica | Valor |
|---|---|
| Accuracy | 0,9106 |
| Precision | 0,8978 |
| Recall | 0,9302 |
| AUC | 0,9717 |
| F1 | 0,9137 |
| Loss | 0,3901 |

Además, en el conjunto de entrenamiento (split train de SST-2) se reportan valores de accuracy y F1 superiores a 0,988, lo que indica un ligero sobreajuste, habitual en fine-tuning sobre datasets pequeños.

No se han publicado comparaciones directas con otros modelos en la información disponible, aunque por tratarse de un fine-tune de DistilBERT base, su rendimiento es comparable al del modelo original `distilbert-base-uncased-finetuned-sst-2-english` (que reporta accuracy similar en SST-2).

## Requisitos de hardware

- VRAM estimada: en FP32 los pesos ocupan aproximadamente 268 MB; en FP16 unos 134 MB; en int8 unos 67 MB. Se puede ejecutar en CPUs con 4-8 GB de RAM sin problema.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1050, RTX 2060 o superiores. También funciona en Apple Silicon (M1/M2) y en CPUs modernas.
- Consumer GPU: sí, cabe en cualquier GPU de consumo actual.
- Opciones de despliegue: Hugging Face Transformers (PyTorch), ONNX Runtime, Apache MXNet, y cualquier framework que soporte el formato ONNX. También puede servirse mediante FastAPI o TorchServe.
- Latencia: en CPU moderna (p.ej. Intel i7) la inferencia de una frase corta toma entre 5 y 15 ms; en GPU, menos de 1 ms. Throughput estimado de varios cientos de frases por segundo en GPU.

## Comparativa con modelos similares

La siguiente tabla compara este modelo con alternativas de la misma categoría (modelos encoder pequeños para clasificación de texto). Los datos de parámetros y contexto son públicos y estándar; los resultados de rendimiento solo se muestran donde están disponibles en la información proporcionada.

| Modelo | Parametros | Contexto | Accuracy SST-2 (val) | Licencia |
|---|---|---|---|---|
| `elsay1/onex-capture-test-t2` | 66,96 M | 512 (estándar) | 0,9106 | Apache 2.0 |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,96 M | 512 | 0,9106 (según model card original) | Apache 2.0 |
| `bert-base-uncased` | 110 M | 512 | no disponible en la información | Apache 2.0 |
| `roberta-base` | 125 M | 512 | no disponible en la información | MIT |

No se dispone de comparativas de rendimiento entre estos modelos en la información proporcionada, pero es conocido que DistilBERT mantiene alrededor del 97% del rendimiento de BERT base con un 40% menos de parámetros.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no funciona correctamente con otros idiomas.
- Su longitud de contexto está limitada a 512 tokens (configuración estándar de DistilBERT), por lo que textos más largos deben truncarse o dividirse.
- Puede presentar sesgos derivados del dataset SST-2, que contiene reseñas de películas y puede no generalizar bien a otros dominios (p.ej. reseñas técnicas o médicas).
- Riesgo de alucinación: al ser un modelo discriminativo, no genera texto nuevo, pero puede clasificar erróneamente frases ambiguas o con sarcasmo.
- El nombre del repositorio (`onex-capture-test-t2`) sugiere que es un experimento de captura o prueba; no hay garantía de mantenimiento ni de soporte por parte del autor.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar que los pesos sean idénticos a los del modelo original antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/elsay1/onex-capture-test-t2
- Paper de DistilBERT (arXiv:1910.01108): https://arxiv.org/abs/1910.01108
- Modelo original de referencia: https://huggingface.co/distilbert-base-uncased-finetuned-sst-2-english
- ONNX Model Zoo: https://github.com/onnx/models
- ONNX Runtime: https://onnxruntime.ai/models
