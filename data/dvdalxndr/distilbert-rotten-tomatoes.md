# dvdalxndr/distilbert-rotten-tomatoes

## Resumen

distilbert-rotten-tomatoes es un modelo de clasificación de texto obtenido mediante fine-tuning de distilbert-base-uncased, publicado por el usuario dvdalxndr en Hugging Face. Por el nombre se infiere que está ajustado para clasificar reseñas de la web Rotten Tomatoes, presumiblemente en tareas de análisis de sentimiento o clasificación de críticas cinematográficas, aunque la model card no lo confirma explícitamente. Se trata de un modelo derivado de DistilBERT, la variante destilada de BERT que reduce el tamaño y el coste computacional manteniendo una parte importante de las capacidades del modelo original.

El modelo cuenta con 66.955.010 parámetros totales en formato safetensors y un repositorio de aproximadamente 0,5 GB, lo que lo sitúa en la categoría de modelos pequeños, aptos para inferencia en CPU y GPU de consumo. La arquitectura subyacente es un transformer encoder de tipo BERT con 6 capas, resultado de la destilación de distilbert-base-uncased, y está pensado exclusivamente para clasificación de secuencias, no para generación de texto.

La relevancia de este modelo es limitada: se publicó sin documentación sustancial, sin métricas de evaluación y con cero descargas en el momento de la consulta. Resulta útil como ejemplo de fine-tuning ligero sobre un dataset de dominio específico, pero no debe considerarse un modelo listo para producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base distilbert-base-uncased soporta hasta 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es predominantemente ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una versión destilada de BERT-base uncased que conserva aproximadamente el 97 % del rendimiento de BERT en tareas de comprensión del lenguaje con un 40 % menos de parámetros y una velocidad de inferencia un 60 % superior. La arquitectura es un transformer encoder con 6 capas, 12 cabezas de atención y una dimensión oculta de 768, seguida de una cabeza de clasificación de secuencias adaptada al número de etiquetas del dataset de fine-tuning.

Según la model card, el ajuste se realizó con el Trainer de Hugging Face sobre un dataset no especificado, con los siguientes hiperparámetros: learning rate de 2e-05, batch size de 8 para entrenamiento y evaluación, semilla 42, optimizador AdamW con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal y 2 épocas. No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo técnicas de regularización adicionales. Las versiones de framework declaradas son Transformers 5.24.1, PyTorch 2.15.0+rocm10.0, Datasets 5.2.0 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto de secuencia completa: asigna una etiqueta a una reseña o fragmento de texto, presumiblemente relacionada con sentimiento o valoración cinematográfica.
- Análisis de sentimiento inferido por el nombre del modelo y el dataset de origen (Rotten Tomatoes), aunque no confirmado en la documentación.
- Procesamiento de textos en inglés, dado que el modelo base es distilbert-base-uncased.
- No soporta generación de texto, tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- No dispone de modo de razonamiento explícito (thinking mode), visión ni audio.

## Casos de uso

- Clasificación de reseñas cinematográficas: el modelo puede asignar una etiqueta de sentimiento a críticas de películas, aprovechando su ajuste sobre un dataset de Rotten Tomatoes, como filtro previo en un pipeline de análisis de opinión.
- Moderación de comentarios en plataformas de contenido audiovisual: clasificación rápida de reseñas de usuarios para detectar tono negativo o positivo antes de una revisión humana.
- Enriquecimiento de datasets de opinión: etiquetado automático de grandes volúmenes de reseñas para construir corpus anotados de sentimiento en el dominio del cine.
- Prototipado rápido de clasificadores de texto: por su tamaño reducido (67 M de parámetros) y licencia permisiva, sirve como línea base en experimentos de clasificación antes de escalar a modelos mayores.
- Inferencia en entornos con recursos limitados: al caber en CPU y en GPU de consumo, puede desplegarse en servicios edge o contenedores pequeños para clasificación en tiempo real de baja latencia.
- Investigación sobre destilación y fine-tuning: útil como caso de estudio de ajuste de DistilBERT con hiperparámetros concretos documentados, para reproducir o comparar estrategias de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del autor declara una entrada sin resultados (`results: []`), por lo que no existen métricas de accuracy, F1, MMLU, HumanEval ni GSM8K reportadas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (67 M de parámetros, aproximadamente 268 MB de pesos) y en torno a 70 MB en cuantización de 8 bits, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU moderna es suficiente; una NVIDIA T4, RTX 3060, RTX 4090, A100 o H100 puede ejecutar el modelo con holgura. También funciona en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU para lotes pequeños.
- Opciones de despliegue: transformers (PyTorch), Text Embeddings Inference (el tag `text-embeddings-inference` sugiere compatibilidad con TEI), y potencialmente ONNX Runtime o llama.cpp si se convierte, aunque no se documenta soporte oficial para estas últimas.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamaño del modelo, se espera una latencia de milisegundos por secuencia en GPU y de decenas de milisegundos en CPU para lotes pequeños, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| distilbert-rotten-tomatoes | 66,9 M | no disponible (base: 512 tokens) | apache-2.0 | Hugging Face | Fine-tuning sin documentar ni métricas |
| distilbert-base-uncased | 66,9 M | 512 tokens | apache-2.0 | Hugging Face | Modelo base generalista, sin ajuste de dominio |
| bert-base-uncased | 110 M | 512 tokens | apache-2.0 | Hugging Face | Mayor tamaño y coste, mejor rendimiento general |
| roberta-base | 125 M | 512 tokens | mit | Hugging Face | Alternativa robusta para clasificación de texto en inglés |

La comparación directa con alternativas de la misma tarea (clasificación de sentimiento en reseñas) no está disponible porque el autor no publica métricas. Frente al modelo base, este fine-tuning añade especialización de dominio a costa de perder generalidad; frente a BERT-base o RoBERTa-base, ofrece menor coste computacional pero presumiblemente menor precisión, extremo que no puede confirmarse sin evaluación.

## Limitaciones y advertencias

- Documentación insuficiente: la model card está generada automáticamente y no describe el dataset, las etiquetas, el número de clases ni el rendimiento, lo que impide conocer con precisión qué tarea resuelve.
- Sin métricas de evaluación: no hay resultados de validación ni de test, por lo que no puede verificarse la calidad del ajuste.
- Sesgos conocidos: no documentados; al derivar de distilbert-base-uncased, hereda los sesgos del corpus inglés con el que se preentrenó el modelo base.
- Riesgo de alucinación: bajo en sentido estricto, al ser un clasificador y no un generador; el riesgo se limita a clasificaciones erróneas o sobreconfiadas.
- Limitaciones de idioma: el modelo base es predominantemente inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial, pero el usuario debe verificar que el dataset de fine-tuning no imponga restricciones adicionales, algo que el autor no aclara.
- Caveat para producción: con cero descargas y sin validación externa, no se recomienda su uso en producción sin una evaluación previa sobre datos propios y una revisión de la idoneidad del dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dvdalxndr/distilbert-rotten-tomatoes
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentación de Transformers para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
