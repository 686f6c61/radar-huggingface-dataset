# Ktar225/distilbert-rotten-tomatoes-sentiment

## Resumen

`Ktar225/distilbert-rotten-tomatoes-sentiment` es un modelo de clasificación de texto obtenido mediante fine-tuning de `distilbert-base-uncased`, la versión destilada de BERT-base desarrollada por Hugging Face. El modelo resuelve una tarea concreta: análisis de sentimiento binario (positivo/negativo) sobre reseñas, presumiblemente en inglés y presumiblemente del corpus de Rotten Tomatoes, aunque la propia model card declara que el conjunto de entrenamiento es "unknown dataset". Cuenta con 66.955.010 parámetros totales (66,9 M), lo que lo sitúa en la gama de los encoders ligeros aptos para inferencia masiva en CPU.

Técnicamente es un transformer encoder de 6 capas con 768 dimensiones ocultas y 12 cabezas de atención, con una ventana máxima de 512 tokens y un tokenizador WordPiece en minúsculas. La model card documenta un entrenamiento de dos épocas con AdamW, learning rate 2e-5 y batch de 16, y reporta en el conjunto de evaluación un loss de 0,4192, una accuracy de 0,8405 y un F1 de 0,8378. El repositorio pesa 0,5 GB y se distribuye bajo licencia Apache 2.0.

Su relevancia es la de un clasificador de sentimiento ligero, barato de ejecutar y fácil de integrar en pipelines de procesamiento por lotes. Ahora bien, es un modelo recién publicado, con 0 descargas y 0 likes, sin validación externa, con el dataset de entrenamiento sin declarar y con métricas inconsistentes entre el resumen de la model card y la tabla de entrenamiento; debe tratarse como un artefacto a validar antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base): 6 capas, 768 de dimensión oculta, 12 cabezas de atención, 30.522 entradas de vocabulario |
| Parámetros totales | 66.955.010 (dato de safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (límite de las posiciones aprendidas del modelo base) |
| Tipos de cuantización | No se distribuyen pesos cuantizados. El modelo es convertible a int8 dinámico (PyTorch), ONNX y GGUF con herramientas externas |
| Idiomas soportados | No declarados en la ficha. El modelo base `distilbert-base-uncased` está entrenado únicamente con texto en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |
| Tarea (pipeline) | `text-classification` (clasificación binaria) |
| Modelo base | `distilbert-base-uncased` |
| Tokenizador | WordPiece, uncased, vocabulario de 30.522 tokens |
| Tamaño del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-15 / 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un encoder transformer de 6 capas y 768 dimensiones ocultas, resultado de destilar BERT-base con una pérdida triple (destilación de logits, modelado de lenguaje enmascarado y similitud de embeddings coseno). Sobre ese backbone se ha añadido la cabeza de clasificación correspondiente a `text-classification` con salida binaria. El modelo conserva las 512 posiciones máximas del base, de modo que cualquier entrada más larga se trunca por defecto. El conteo de 66.955.010 parámetros coincide con el del checkpoint base, lo que implica que la cabeza de clasificación añade un número reducido de pesos (del orden de decenas de miles) respecto al total.

Los hiperparámetros declarados en la model card son: learning rate 2e-5, batch de entrenamiento y de evaluación de 16, semilla 42, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-8), scheduler lineal y 2 épocas completas, con 534 pasos por época y 1.068 pasos totales. Asumiendo que no hubo acumulación de gradiente, esto supone aproximadamente 8.544 ejemplos por época; esa cifra no coincide con el tamaño del corpus clásico de Rotten Tomatoes (10.662 frases), aunque la model card no confirma cuál fue el conjunto utilizado ni cómo se dividió. No se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias humanas; se trata de un fine-tuning supervisado estándar con `Trainer`. Las versiones de framework declaradas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1, que no se corresponden con versiones estables habituales y conviene verificar para reproducir el entrenamiento.

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) sobre texto en inglés de hasta 512 tokens.
- Clasificación por lotes de alta eficiencia: al ser un encoder de 66,9 M de parámetros, permite procesar grandes volúmenes de frases por segundo, incluso en CPU.
- Extracción de representaciones ocultas del encoder para usos auxiliares (por ejemplo, features para un clasificador posterior o clustering de reseñas).
- Inferencia determinista y de baja latencia, adecuada para ejecución síncrona dentro de una API.
- No soporta tool calling ni function calling: no es un modelo generativo ni tiene plantilla de chat.
- No soporta agentes, razonamiento multi-paso ni `thinking mode`.
- No tiene capacidades multilingües declaradas; el backbone está entrenado solo en inglés.
- No dispone de visión, audio ni modalidades adicionales.
- No genera texto: únicamente devuelve una etiqueta y su puntuación de confianza.

## Casos de uso

- Análisis de opiniones de cine o series a escala: procesar catálogos completos de críticas en inglés y agregar la polaridad por título, género o año; el modelo cabe en CPU y permite clasificar cientos de miles de reseñas sin coste de GPU.
- Enrutado de tickets de atención al cliente: clasificar el tono de cada mensaje entrante para priorizar automáticamente las quejas negativas hacia un equipo humano antes que las consultas neutras o positivas.
- Monitorización de marca y social listening: etiquetar menciones en inglés procedentes de foros y redes sociales en micro-lotes continuos para alimentar cuadros de mando de reputación, aprovechando la baja latencia del modelo.
- Etiquetado previo de datasets (weak supervision): usar el clasificador para generar etiquetas iniciales sobre corpus sin anotar en inglés y después revisar solo los casos de baja confianza antes de entrenar un modelo mayor.
- Moderación y filtrado de comentarios: descartar o marcar automáticamente comentarios con polaridad fuertemente negativa en plataformas de reseñas, combinándolo con reglas propias de la comunidad.
- Análisis de encuestas NPS y feedback abierto: clasificar las respuestas de texto libre en inglés para complementar la puntuación numérica con la polaridad del comentario.
- Reordenación en pipelines de recuperación (RAG): puntuar documentos recuperados por tono para priorizar testimonios positivos o negativos según la consulta del usuario final.

## Benchmarks y rendimiento

El campo `model-index` de la model card está vacío (`"results": []`), por lo que no hay resultados publicados de benchmarks estándar (MMLU, GLUE, SST-2, etc.). Los únicos datos disponibles son las métricas de validación declaradas por el autor:

| Conjunto / métrica | Loss | Accuracy | F1 |
|---|---|---|---|
| Evaluation set (resumen de la model card) | 0,4192 | 0,8405 | 0,8378 |
| Validación, época 1 (paso 534) | 0,3815 | 0,8340 | 0,8475 |
| Validación, época 2 (paso 1068) | 0,3641 | 0,8593 | 0,8582 |

Advertencia sobre estos números: los valores del "evaluation set" del resumen no coinciden con los de la última época de la tabla de entrenamiento (accuracy 0,8405 frente a 0,8593; F1 0,8378 frente a 0,8582; loss 0,4192 frente a 0,3641). La model card no explica si corresponden a particiones distintas, a un checkpoint intermedio o a una re-evaluación posterior. Tampoco se declara el tamaño del conjunto de evaluación, por lo que los intervalos de confianza son desconocidos. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Peso de los parámetros: 268 MB en fp32, 134 MB en fp16 y aproximadamente 67 MB en int8. Cifras calculadas a partir de los 66.955.010 parámetros declarados.
- VRAM para inferencia: inferior a 1 GB en fp32 con batch pequeño; con batch 16 y secuencias de 512 tokens el pico se mantiene en el rango de 1-2 GB contando activaciones.
- GPU recomendadas: cualquier GPU con más de 2 GB de VRAM sirve (GTX 1650, RTX 3060, RTX 4090, T4, L4, A100, H100). El modelo está muy por debajo de la capacidad de cualquier acelerador moderno, por lo que la GPU no es un cuello de botella.
- Compatibilidad con GPU de consumo: sí, en todas las GPU de consumo actuales, e incluso en iGPU y en CPU. Ejecutarlo en CPU con ONNX Runtime o cuantización int8 dinámica es perfectamente viable.
- Opciones de despliegue: pipeline de `transformers`, servidor con FastAPI o similar, ONNX Runtime, cuantización int8 dinámica de PyTorch, `text-embeddings-inference` (el repositorio incluye la etiqueta `text-embeddings-inference` y `endpoints_compatible`), y conversión a GGUF para llama.cpp si se necesita un binario de CPU. El soporte en TGI no está previsto para encoders de clasificación; en vLLM sería necesario verificar la compatibilidad con DistilBERT en su API de clasificación antes de asumirla.
- Latencia y throughput: no disponibles para este checkpoint concreto. Como referencia orientativa del backbone DistilBERT-base, en CPU moderna con ONNX int8 se suele trabajar en el orden de 10^2 a 10^3 frases por segundo con lotes grandes, y en GPU el rango sube aproximadamente un orden de magnitud. Estas cifras no han sido medidas sobre este modelo y deben validarse en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| Ktar225/distilbert-rotten-tomatoes-sentiment | 66,9 M | 512 | Clasificación binaria de sentimiento | Apache 2.0 | Accuracy 0,8405 / F1 0,8378 |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 | Clasificación binaria de sentimiento | Apache 2.0 | No disponible en esta ficha |
| cardiffnlp/twitter-roberta-base-sentiment-latest | 125 M | 512 | Clasificación de sentimiento (3 clases, orientada a redes sociales) | No disponible en esta ficha | No disponible en esta ficha |
| Modelos generativos pequeños tipo Qwen2.5-0.5B-Instruct usados para clasificación zero-shot | ~494 M | 32.768 | Generación / clasificación mediante prompt | Apache 2.0 | No disponible en esta ficha |

La comparación relevante es contra los clasificadores de sentimiento ingleses ya consolidados: el fine-tuning de DistilBERT sobre SST-2 de Hugging Face ofrece el mismo tamaño y ventana con un pipeline idéntico, y los modelos basados en RoBERTa-base triplican el número de parámetros a cambio de mejor comportamiento en texto informal. Frente a la alternativa generativa zero-shot, este modelo es dos órdenes de magnitud más pequeño y mucho más rápido, pero no permite redefinir la tarea mediante instrucciones ni manejar contexto largo. No se dispone de datos de rendimiento comparados en la información proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento no declarado: la model card indica "unknown dataset" y "More information needed" en todas las secciones, por lo que no se puede evaluar la cobertura, el dominio ni el equilibrio de clases del conjunto usado.
- Métricas inconsistentes: el F1 y la accuracy del resumen de la model card no coinciden con los de la última época de la tabla de entrenamiento, y no se declara el tamaño del conjunto de evaluación. Los resultados no son reproducibles con la información disponible.
- Etiquetado forzado: al ser un clasificador binario, siempre devuelve positivo o negativo, incluso ante entradas neutras, ambiguas, irónicas o fuera de dominio. No existe clase neutral ni umbral de abstención integrado.
- Dominio limitado: el nombre apunta a reseñas de cine en inglés; el rendimiento en otros dominios (tickets técnicos, textos legales, mensajes cortos) es desconocido y previsiblemente inferior.
- Idioma: sin capacidades multilingües declaradas. El tokenizador y el corpus del backbone son exclusivamente en inglés, por lo que el uso en castellano daría resultados poco fiables.
- Límite de 512 tokens: los textos más largos se truncan, con la consiguiente pérdida de información y posible sesgo en reseñas largas que cambian de tono.
- Tokenizador uncased: se pierde la información de mayúsculas, lo que puede afectar a la detección de énfasis o de texto en mayúsculas sostenidas.
- Sesgos: no se ha publicado ningún análisis de sesgo demográfico, de género o de dominio. Existe el riesgo habitual de que el modelo aprenda correlaciones espurias entre vocabulario y polaridad.
- Sin validación externa: 0 descargas y 0 likes en el momento de redactar esta ficha, sin revisión por parte de terceros.
- Reproducibilidad: se declaran versiones de librerías (Transformers 5.16.1, PyTorch 2.11.0) y una fecha de creación (2026) que no se corresponden con las versiones estables habituales; conviene verificar el entorno antes de confiar en los resultados.
- Licencia: el modelo se publica bajo Apache 2.0, lo que permite uso comercial, pero esa licencia no cubre los derechos sobre el corpus de entrenamiento. Si el conjunto utilizado fue el corpus clásico de Rotten Tomatoes, sus condiciones de uso originales están orientadas a investigación y deben revisarse antes de un despliegue comercial.
- En producción: por todo lo anterior, se recomienda usarlo como componente auxiliar con umbral de confianza y validación humana, no como decisión final en flujos sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ktar225/distilbert-rotten-tomatoes-sentiment
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Artículo de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Corpus clásico de Rotten Tomatoes (Pang y Lee), al que apunta el nombre del modelo y que no está confirmado como conjunto de entrenamiento: https://www.cs.cornell.edu/people/pabo/movie-review-data/
- Documentación del pipeline de clasificación de texto de Transformers: https://huggingface.co/docs/transformers/main/en/main_classes/pipelines#transformers.TextClassificationPipeline
- Text Embeddings Inference, mencionado en las etiquetas del repositorio: https://github.com/huggingface/text-embeddings-inference
