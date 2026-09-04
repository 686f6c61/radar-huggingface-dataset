# ousmane93/finetuning-sentiment-model-3000-samples

## Resumen

El modelo `ousmane93/finetuning-sentiment-model-3000-samples` es un clasificador de sentimiento binario (positivo/negativo) desarrollado mediante fine-tuning de `distilbert-base-uncased` sobre un subconjunto de 3.000 ejemplos del dataset IMDB. Está pensado para resolver tareas de análisis de opinión en reseñas de películas en inglés, con una arquitectura ligera y de baja latencia.

Se trata de un modelo denso basado en el encoder Transformer de DistilBERT, con una cabeza de clasificación de dos etiquetas (`LABEL_0` = negativa, `LABEL_1` = positiva). Tiene aproximadamente 66,9 millones de parámetros y un tamaño de repositorio de 0,5 GB. Su relevancia radica en que ofrece un punto de partida sencillo y rápido para prototipos de análisis de sentimiento, aunque su rendimiento está limitado por el pequeño tamaño del conjunto de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (segun la model card del autor) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, una version destilada de BERT que conserva la arquitectura encoder-only pero con menos parametros, lo que la hace mas rapida y ligera en inferencia. Sobre esta base se anade una cabeza de clasificacion secuencial con dos salidas para el analisis de sentimiento binario.

El entrenamiento se realizo sobre un subconjunto aleatorio del dataset IMDB (semilla 42) compuesto por 3.000 ejemplos para entrenamiento y 300 para evaluacion. Se utilizaron 2 epocas, un learning rate de 2e-05, batch size de 16 en entrenamiento y evaluacion, optimizador AdamW (betas=(0.9,0.999), epsilon=1e-08) y un scheduler lineal. El framework empleado fue Transformers 5.16.1 con PyTorch 2.6.0+cpu, Datasets 5.0.1 y Tokenizers 0.23.2.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en texto en ingles.
- Especializado en resenas de peliculas del dataset IMDB; no esta entrenado para otros dominios.
- Inferencia rapida gracias al tamano reducido de DistilBERT (66,9 M de parametros).
- Uso sencillo mediante el pipeline de Hugging Face Transformers.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- No es multilingue: solo procesa texto en ingles.

## Casos de uso

- Analisis de resenas de peliculas en plataformas de streaming: el modelo puede clasificar automaticamente criticas de usuarios como positivas o negativas, permitiendo generar agregados de opinion y recomendaciones personalizadas.
- Monitorizacion de redes sociales en el ambito cinematografico: permite detectar rapidamente el tono de comentarios sobre estrenos, trailers o noticias de cine en ingles.
- Atencion al cliente en plataformas de entretenimiento: se puede integrar en un sistema de tickets para priorizar quejas o comentarios negativos sobre una pelicula o servicio.
- Filtrado de opiniones en foros de cine: ayuda a moderar comunidades etiquetando automaticamente las publicaciones segun su sentimiento.
- Analisis de encuestas de satisfaccion en ingles: sirve para clasificar respuestas abiertas de usuarios sobre experiencias relacionadas con contenido audiovisual.
- Preprocesamiento en pipelines de NLP: al ser un modelo ligero, puede usarse como componente inicial para filtrar o etiquetar texto antes de pasarlo a modelos mas grandes.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card, sin verificar de forma independiente, son los siguientes:

| Metrica | Valor |
|---|---|
| Accuracy | 0,87 |
| F1 | 0,8713 |
| Loss | 0,3321 |

Estos valores corresponden al conjunto de evaluacion de 300 ejemplos. No se han publicado comparaciones con otros modelos de analisis de sentimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en FP32 y 0,15 GB en FP16 para los pesos. Con overhead de activaciones y logits, el consumo total en inferencia se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluidas NVIDIA GTX 1050, RTX 2060, RTX 4090, A100, H100. Tambien funciona correctamente en CPU.
- Compatibilidad con GPU de consumo: si, es un modelo muy ligero que cabe en cualquier GPU consumer moderna.
- Opciones de despliegue: Hugging Face Transformers (pipeline), vLLM, Text Generation Inference (TGI) y Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. No se han publicado comparaciones con otros modelos en la informacion proporcionada. El modelo base es `distilbert-base-uncased`, pero no se dispone de metricas comparativas entre ambos.

## Limitaciones y advertencias

- Entrenado sobre un subconjunto reducido de IMDB (3.000 ejemplos de entrenamiento y 300 de evaluacion), por lo que su rendimiento puede ser inferior al de modelos entrenados con el dataset completo de 25.000 ejemplos.
- Solo funciona en ingles y esta especializado en resenas de peliculas; no se garantiza su rendimiento en otros dominios, topicos o idiomas.
- No se ha realizado una comparacion con otros modelos de sentimiento, por lo que no hay evidencia de que supere a alternativas existentes.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias de rendimiento ni soporte.
- Riesgo de clasificacion incorrecta en textos ambiguos, ironicos o con dobles sentidos, dado el tamano limitado del corpus de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ousmane93/finetuning-sentiment-model-3000-samples
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset IMDB: https://huggingface.co/datasets/stanfordnlp/imdb
