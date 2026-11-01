# codevjuan/bertimbau-b2w-sentiment

## Resumen

BERTimbau-b2w-sentiment es un modelo de clasificación de sentimiento en portugués desarrollado por codevjuan, consistente en un ajuste fino (fine-tuning) del checkpoint neuralmind/bert-base-portuguese-cased sobre el corpus B2W-Reviews01 de reseñas de comercio electrónico brasileño. El modelo resuelve una tarea acotada: clasificar el texto de una reseña de producto como positiva o negativa, descartando las valoraciones neutras (nota 3). Su relevancia radica en que supera de forma medible a un baseline clásico de TF-IDF más regresión logística en un conjunto de test separado por producto, lo que evita la fuga de información típica de las divisiones aleatorias en este tipo de corpus.

Arquitectura BERT base (transformer encoder bidireccional) con 108,9 millones de parámetros, vocabulario en portugués con distinción de mayúsculas y minúsculas y una longitud de contexto de 128 tokens durante el entrenamiento. El modelo se distribuye en formato safetensors con licencia MIT, lo que permite uso comercial sin restricciones adicionales, y está pensado para integrarse en pipelines de análisis de opiniones sobre reseñas de e-commerce en portugués.

La ficha refleja un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, publicado el 1 de noviembre de 2026. No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.); las únicas métricas disponibles son las de la model card sobre el conjunto de test propio del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (BERT base) |
| Parametros totales | 108.924.674 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (max_len de entrenamiento); la arquitectura BERT base admite hasta 512 posiciones, no verificado en este ajuste |
| Tipos de cuantizacion | no disponible (no se documentan pesos cuantizados en el repo) |
| Idiomas soportados | Portugués (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT base portugués (BERTimbau) con 108,9 millones de parámetros, inicializado desde neuralmind/bert-base-portuguese-cased y ajustado para clasificación binaria de secuencias. La cabeza de clasificación produce dos etiquetas (positivo, negativo). El ajuste se realizó sobre una muestra estratificada de 20.000 reseñas de entrenamiento y 4.000 de validación, durante 2 épocas, con tasa de aprendizaje 2e-05, tamaño de lote 16 y longitud máxima de 128 tokens. La mejor época se seleccionó por F1 macro en validación (0,9547). El entrenamiento se ejecutó en Apple Silicon (MPS) y duró 17,5 minutos.

Los datos provienen del dataset B2W-Reviews01 (licencia CC BY 4.0), con etiquetas derivadas de la nota de la reseña: 4 o 5 se consideran positivo, 1 o 2 negativo, y la nota 3 se descarta. Solo se usa el cuerpo del texto de la reseña, excluyendo el título porque filtraba la etiqueta. La división es 80/10/10 por producto con semilla 42, sin productos compartidos entre conjuntos, lo que constituye una evaluación más realista que una división aleatoria. El conjunto de test contiene 11.367 reseñas, con un 1,28 % de textos idénticos al entrenamiento (reseñas muy cortas como "Ótimo"). La proporción en entrenamiento es 70,57 % positivas y 29,43 % negativas. No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa; es un ajuste supervisado convencional.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en textos de reseñas de e-commerce en portugués.
- Procesamiento de entradas de hasta 128 tokens, suficiente para reseñas cortas y medias.
- Inferencia rápida en CPU y GPU: 14,25 ms por reseña en Apple Silicon (MPS) según la model card.
- No soporta tool calling ni function calling: es un modelo de clasificación, no generativo.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- Capacidad multilingüe limitada al portugués; no se ha evaluado en otros idiomas.
- No dispone de modo de razonamiento (thinking), visión ni audio.

## Casos de uso

- Monitorización de opiniones en marketplaces: clasificar en lote reseñas de productos para calcular la proporción de sentimiento positivo y negativo por categoría, aprovechando que el modelo fue entrenado y evaluado con separación por producto, lo que reduce el sesgo de memorización.
- Enrutamiento de reseñas negativas a atención al cliente: usar la etiqueta negativa como señal para priorizar la revisión humana de quejas, con la advertencia de que el modelo no distingue producto de logística.
- Análisis de tendencias temporales: procesar reseñas históricas (el corpus cubre enero a mayo de 2018) para medir la evolución del sentimiento por vendedor o categoría.
- Filtrado previo en pipelines de moderación: descartar o marcar reseñas negativas antes de un análisis más costoso con modelos generativos, dado el bajo coste por inferencia (14,25 ms en MPS).
- Investigación académica sobre PLN en portugués: servir como baseline reproducible de clasificación de sentimiento con división por producto, útil para comparar con modelos más grandes.
- Etiquetado asistido de datos: preanotar grandes volúmenes de reseñas para revisión humana posterior, con la ventaja de la licencia MIT y el tamaño reducido del checkpoint (0,4 GB).
- Despliegue en entornos con recursos limitados: el modelo cabe en CPU y en GPUs de consumo, por lo que puede ejecutarse en servicios de bajo coste o en el borde.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre un conjunto de test de 11.367 reseñas separadas por producto (no presentes en entrenamiento ni validación):

| Modelo | F1 macro | Acurácia | Latencia por reseña |
|---|---|---|---|
| Clase mayoritaria | 0,4146 | 0,7083 | no disponible |
| TF-IDF + regresión logística (baseline) | 0,9423 | 0,9515 | 0,163 ms (CPU) |
| BERTimbau ajustado (este modelo) | 0,9585 | 0,9657 | 14,25 ms (Apple Silicon, MPS) |

Desglose por clase del modelo:

| Clase | Precisión | Exhaustividad (recall) | F1 | Soporte |
|---|---|---|---|---|
| negativo | 0,9415 | 0,9409 | 0,9412 | 3316 |
| positivo | 0,9757 | 0,9759 | 0,9758 | 8051 |

La mejora frente al baseline es de +1,62 puntos porcentuales de F1 macro y +1,42 puntos de exactitud. No se han publicado resultados en benchmarks estándar (MMLU, GLUE, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB para los pesos (108,9 M de parámetros), más memoria para activaciones y batch; en la práctica, menos de 2 GB con batch pequeño.
- En fp16: aproximadamente 0,22 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el modelo no requiere A100 ni H100. Funciona en RTX 4090, RTX 3060 y GPUs integradas.
- Cabe en GPU de consumo y en CPU: la model card reporta 14,25 ms por reseña en Apple Silicon (MPS) y el baseline TF-IDF corre en 0,163 ms en CPU.
- Opciones de despliegue: pipeline de transformers, TorchServe, ONNX Runtime, TGI (con soporte de clasificación) y FastAPI con transformers. No se documentan pesos GGUF ni soporte explícito de llama.cpp u Ollama.
- Throughput y latencia: solo se documenta la latencia de 14,25 ms por reseña en MPS; no hay datos de throughput por lote ni de latencia en CPU o GPU dedicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 macro (test propio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| codevjuan/bertimbau-b2w-sentiment | 108,9 M | 128 tokens (entrenamiento) | 0,9585 | MIT | HuggingFace |
| neuralmind/bert-base-portuguese-cased (base) | 108,9 M | 512 tokens (arquitectura) | no disponible (no ajustado a esta tarea) | MIT | HuggingFace |
| TF-IDF + regresión logística (baseline del autor) | no aplica | no aplica | 0,9423 | no aplica | reproducible con el código del autor |

No se dispone de datos publicados para comparar con otros modelos de sentimiento en portugués (por ejemplo, ajustes de BERTimbau large o modelos multilingües) en el mismo conjunto de test, por lo que la comparativa se limita a los valores reportados por el autor.

## Limitaciones y advertencias

- La etiqueta deriva de la nota de la reseña, no de anotación humana del texto: hay reseñas con nota alta que critican la entrega y preguntas publicadas como reseñas, por lo que parte del error es ruido de etiqueta.
- Entrenado exclusivamente con reseñas de e-commerce de B2W (enero a mayo de 2018); no se ha evaluado en otros dominios como restaurantes, entregas o redes sociales.
- Solo distingue positivo y negativo; las reseñas neutras o mixtas no se usaron en el entrenamiento y la nota 3 se descartó.
- No separa el sentimiento sobre el producto del sentimiento sobre la entrega: una reseña que elogia el producto pero critica el retraso se clasifica como positiva.
- El 1,28 % de los textos de test aparecen idénticos en entrenamiento (reseñas muy cortas), lo que puede inflar ligeramente las métricas.
- Riesgo de alucinación no aplica (modelo de clasificación), pero sí de falsos positivos y negativos en textos ambiguos o irónicos.
- No debe usarse para decisiones automáticas sobre personas.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero el dataset base (B2W-Reviews01) está bajo CC BY 4.0, lo que conviene verificar si se redistribuyen datos derivados.
- Contexto limitado a 128 tokens en entrenamiento; reseñas más largas se truncan y pueden perder información relevante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/codevjuan/bertimbau-b2w-sentiment
- Modelo base: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Dataset B2W-Reviews01: https://huggingface.co/datasets/ruanchaves/b2w-reviews01
- Código y reproducción: https://github.com/Juan-Severiano/reviews-sentiment-pt
