# Sachin-099/my_distilbert_imdb_merged

## Resumen

El modelo `Sachin-099/my_distilbert_imdb_merged` es un clasificador de análisis de sentimiento binario (positivo/negativo) basado en el modelo base `distilbert/distilbert-base-uncased`, fine-tuneado con la técnica LoRA (Low-Rank Adaptation) sobre el dataset `stanfordnlp/imdb`. Ha sido desarrollado por Sachin-099 (Sachin Chaudhary) y publicado en Hugging Face. El modelo está pensado para clasificar reseñas de películas en inglés, y su interés radica en demostrar cómo se puede adaptar un transformer preentrenado de forma eficiente en términos de parámetros y cómputo mediante LoRA, manteniendo un tamaño compacto de aproximadamente 67 millones de parámetros. No se especifica la longitud de contexto en la información disponible, pero al derivar de DistilBERT base, es previsible que herede el límite de 512 tokens del modelo original, aunque este dato no se confirma en la ficha.

El repositorio incluye únicamente los pesos en formato `safetensors` y no se proporcionan métricas de rendimiento ni benchmarks publicados. La licencia aparece como `unknown`, lo que supone una incertidumbre para su uso comercial. A pesar de su sencillez, el modelo puede servir como punto de partida para tareas de clasificación de texto en inglés o como ejemplo de fine-tuning con LoRA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT base (transformer encoder-only) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | unknown |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DistilBERT es una versión destilada de BERT, con la misma arquitectura de transformer encoder-only pero con la mitad de capas (6 en lugar de 12) y un 40% menos de parámetros que `bert-base-uncased`. El modelo base `distilbert-base-uncased` fue preentrenado con destilación de conocimiento sobre el corpus de Wikipedia y BookCorpus. En este caso, el autor ha aplicado un fine-tuning con LoRA, una técnica que congela los pesos originales e introduce matrices de baja dimensión entrenables en las capas de atención, reduciendo drásticamente el número de parámetros a optimizar. El entrenamiento se realizó sobre el dataset `stanfordnlp/imdb`, compuesto por 25.000 reseñas de películas etiquetadas como positivas o negativas, y 25.000 para test. No se especifican hiperparámetros, número de épocas, ni si se aplicó alguna técnica adicional como RLHF o DPO. Tampoco se detalla la composición exacta del dataset de entrenamiento más allá de la referencia a IMDB.

## Capacidades

- Clasificación de sentimiento binario en inglés: determina si una reseña de película es positiva o negativa.
- Generación de una puntuación de probabilidad para cada clase mediante la salida softmax del clasificador.
- Procesamiento de texto en minúsculas (modelo uncased), por lo que no distingue mayúsculas.
- Inferencia rápida y ligera gracias al tamaño reducido del modelo (67M parámetros), adecuada para entornos con recursos limitados.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada al inglés, tal como indica el campo `language: en`.

## Casos de uso

- Análisis de opiniones en plataformas de reseñas: el modelo puede clasificar automáticamente reseñas de productos o servicios en positivas o negativas, permitiendo a las empresas monitorizar la satisfacción del cliente en tiempo real.
- Moderación de comentarios en foros o redes sociales: se puede integrar en un pipeline para detectar comentarios negativos o tóxicos, aunque su alcance se limita a sentimiento binario y no a toxicidad específica.
- Clasificación de feedback en encuestas: las respuestas abiertas de encuestas de satisfacción pueden etiquetarse como positivas o negativas para su posterior análisis estadístico.
- Filtrado de críticas en portales de cine: ayuda a priorizar reseñas negativas para que los equipos de soporte o moderación las revisen primero.
- Prototipado rápido de sistemas de análisis de sentimiento: al ser un modelo pequeño y fácil de cargar, sirve como base para experimentos académicos o pruebas de concepto antes de escalar a modelos más grandes.
- Enseñanza de fine-tuning con LoRA: su repositorio puede utilizarse como ejemplo práctico de cómo aplicar LoRA a un transformer, dado que el autor documenta el proceso en su perfil de GitHub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se incluyen métricas como accuracy, F1, MMLU, HumanEval ni otros indicadores en la model card ni en el repositorio. El autor menciona en los tags que se usaron las métricas `f1` y `accuracy`, pero no se proporcionan valores numéricos.

## Requisitos de hardware

- Al tratarse de un modelo con 66,9 millones de parámetros, su huella de memoria es reducida. En FP32, los pesos ocupan aproximadamente 268 MB (66.955.010 × 4 bytes), más overhead de activaciones y buffers.
- Puede ejecutarse en CPU con un rendimiento aceptable para inferencia por lotes pequeños, aunque para producción se recomienda al menos una GPU con 2 GB de VRAM.
- GPUs como NVIDIA T4, GTX 1650 o RTX 3060 son suficientes para inferencia y fine-tuning adicional con LoRA.
- Es compatible con frameworks de inferencia estándar como Hugging Face Transformers, ONNX Runtime y TensorRT, aunque no se proporcionan configuraciones específicas.
- No se dispone de datos de latencia o throughput medidos; se estima una inferencia de pocos milisegundos por muestra en GPU moderna, pero no se confirma.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sachin-099/my_distilbert_imdb_merged | 66.955.010 | no disponible | unknown | safetensors | Fine-tuning con LoRA sobre IMDB |
| Radhe09/distilbert-imdb-distilled | no disponible | no disponible | no disponible | no disponible | DistilBERT fine-tuneado con destilación desde BERT sobre IMDB |
| lvwerra/distilbert-imdb | no disponible | no disponible | no disponible | no disponible | DistilBERT fine-tuneado sobre IMDB (referencia clásica) |

No se dispone de información detallada sobre los modelos comparados (parámetros exactos, licencia, contexto o rendimiento), por lo que la comparación se limita a la arquitectura base y la tarea. Los tres modelos comparten la misma arquitectura DistilBERT y el dataset IMDB, pero no se pueden extraer conclusiones cuantitativas.

## Limitaciones y advertencias

- Licencia `unknown`: no se garantiza que el modelo pueda utilizarse comercialmente sin riesgo legal. Se recomienda contactar con el autor antes de usarlo en producción.
- Sesgos potenciales: al entrenarse exclusivamente sobre reseñas de películas en inglés, el modelo puede no generalizar bien a otros dominios (productos, servicios, política) ni a otros idiomas.
- Alucinaciones: aunque es un clasificador y no genera texto libre, puede producir predicciones incorrectas en entradas fuera de distribución o con lenguaje ambiguo.
- Longitud de contexto limitada: aunque no se especifica, DistilBERT base tiene un máximo de 512 tokens; textos más largos deben truncarse o segmentarse.
- Sin soporte para entradas multimodales ni para tareas generativas.
- No se han publicado métricas de rendimiento, por lo que no se puede evaluar su calidad objetiva frente a otros modelos.
- El repositorio no incluye código de entrenamiento ni configuración de LoRA, solo los pesos finales, lo que dificulta la reproducibilidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Sachin-099/my_distilbert_imdb_merged)
- [Perfil de GitHub del autor (insaneDX)](https://github.com/insaneDX)
- [Repositorio de ejemplo de DistilBERT en IMDB (jzonthemtn)](https://github.com/jzonthemtn/distilbert-imdb)
- [Notebook de clasificación de sentimiento con DistilBERT](https://colab.research.google.com/github/pranaya-mathur/Deep-Learning-Projects/blob/master/Sentiment_Classification_using_DistilBERT.ipynb/)
