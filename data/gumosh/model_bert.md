# Gumosh/model_bert

## Resumen

Gumosh/model_bert es un clasificador de sentimiento binario (positivo/negativo) obtenido mediante fine-tuning de `distilbert-base-uncased`. Lo desarrollan Gumoshabe Sandra y Keeya Tracy, y se publica en Hugging Face bajo el pipeline `text-classification`. El modelo resuelve una tarea acotada: asignar una etiqueta de polaridad a un texto en inglés, principalmente reseñas de películas, y su interés actual es limitado, ya que se trata de un ejercicio académico con 50 descargas y sin licencia declarada.

La arquitectura de partida es DistilBERT, una destilación de BERT-base que reduce el número de capas y parámetros manteniendo buena parte del rendimiento en tareas de comprensión. El checkpoint publica 66.955.010 parámetros en safetensors, lo que corresponde a la variante DistilBERT con una cabeza de clasificación de dos etiquetas sobre el vocabulario de `bert-base-uncased`. No se documenta la longitud de contexto efectiva, aunque por herencia del tokenizador de BERT se sitúa en 512 tokens.

El modelo se entrenó sobre el corpus `stanfordnlp/imdb` y declara una accuracy y un F1 de 0,9 en el conjunto de test. No hay información sobre hiperparámetros, número de épocas ni composición exacta del split, por lo que la reproducibilidad es baja. Es relevante únicamente como referencia de fine-tuning ligero para análisis de sentimiento en inglés, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (heredada del tokenizador BERT; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni ONNX en el repo) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DistilBERT: un encoder transformer de 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, destilado desde BERT-base durante el preentrenamiento original. Sobre ese backbone se añade una cabeza de clasificación lineal con dos salidas (positivo/negativo) y una función de activación softmax. El tokenizador es el WordPiece de `bert-base-uncased`, con vocabulario de aproximadamente 30.500 tokens y normalización a minúsculas.

El fine-tuning se realizó sobre el dataset `stanfordnlp/imdb`, un corpus de 50.000 reseñas de películas en inglés etiquetadas como positivas o negativas, habitualmente dividido en 25.000 de entrenamiento y 25.000 de test. La model card no especifica el número de épocas, la tasa de aprendizaje, el tamaño de batch, la semilla ni si se aplicó algún tipo de regularización o early stopping. Tampoco se documenta si hubo una fase de validación separada ni si se empleó algún esquema de RLHF o DPO, algo poco habitual en un clasificador de este tipo. No se declaran innovaciones técnicas adicionales más allá de la propia destilación de DistilBERT.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en textos en inglés.
- Procesamiento de reseñas y opiniones de longitud corta o media, hasta 512 tokens.
- Inferencia rápida en CPU y GPU de gama baja gracias al tamaño reducido del modelo (67 M de parámetros).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente.
- No dispone de modo de razonamiento explícito (thinking mode).
- No tiene capacidades de visión, audio ni generación de texto libre.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.

## Casos de uso

- Análisis de sentimiento en reseñas de productos o películas: el modelo clasifica textos en inglés como positivos o negativos, adecuado para volcados masivos de opiniones donde se necesita una etiqueta rápida y el dominio se parezca al de IMDb.
- Moderación de comentarios en foros angloparlantes: permite filtrar automáticamente comentarios negativos o tóxicos en un primer nivel de triaje, siempre que se combine con reglas adicionales.
- Monitorización de reputación de marca: se puede procesar un flujo de menciones en redes sociales en inglés y agregar la polaridad por ventanas temporales para detectar caídas de sentimiento.
- Etiquetado previo para anotación humana: sirve como preetiquetador en pipelines de anotación, reduciendo el coste de revisión manual en corpus de opiniones.
- Clasificación de encuestas de satisfacción: las respuestas abiertas en inglés pueden etiquetarse automáticamente para generar métricas de NPS o CSAT aproximadas.
- Filtro de calidad en datasets de entrenamiento: permite descartar reseñas con polaridad ambigua o ruidosa antes de usarlas en el entrenamiento de modelos mayores.
- Prototipado educativo: por su tamaño y simplicidad, es útil como ejemplo de fine-tuning de DistilBERT en cursos y talleres.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 0,9 | Test de `stanfordnlp/imdb` (según model card) |
| F1 | 0,9 | Test de `stanfordnlp/imdb` (según model card) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los valores de accuracy y F1 proceden exclusivamente de la model card del autor y no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 270 MB (67 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador.
- VRAM estimada en fp16: aproximadamente 135 MB.
- VRAM estimada en int8: aproximadamente 70 MB.
- Cabe holgadamente en cualquier GPU consumer: GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, así como en CPU moderna.
- GPU recomendadas para producción de alto throughput: T4, L4, A10G o A100, aunque el modelo está sobredimensionado para estas GPUs y suele bastar con CPU.
- Opciones de despliegue: `transformers` con PyTorch, `torchscript`, `ONNX Runtime`, `vLLM` (soporte limitado para clasificadores), `TGI` (soporte de text-classification), `FastAPI` con `pipeline("text-classification")`. No hay pesos GGUF publicados, por lo que `llama.cpp` y `Ollama` no son opciones directas sin conversión previa.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por muestra en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Rendimiento declarado |
|---|---|---|---|---|---|
| Gumosh/model_bert | 66.955.010 | 512 (heredado) | no disponible | en | Accuracy 0,9 / F1 0,9 en IMDb |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66,9 M | 512 | Apache 2.0 | en | No comparado en la información disponible |
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | ~125 M | 512 | no disponible en la información | en | No comparado en la información disponible |
| `nlptown/bert-base-multilingual-uncased-sentiment` | ~178 M | 512 | no disponible en la información | multilingüe | No comparado en la información disponible |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Entrenado exclusivamente con reseñas de películas en inglés; el rendimiento puede degradarse en otros dominios (redes sociales, atención al cliente, textos técnicos).
- La model card reconoce dificultades con sarcasmo y con textos de lenguaje mixto o muy complejo.
- Riesgo de alucinación no aplica en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas confiadas en textos ambiguos.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; se debe contactar con el autor antes de usarlo en producción.
- No se documentan sesgos demográficos, culturales ni de dominio; al entrenarse solo con IMDb, puede heredar sesgos del corpus.
- No hay información sobre el proceso de entrenamiento (épocas, hiperparámetros, split de validación), lo que dificulta la reproducibilidad.
- El repositorio tiene 0,8 GB, un tamaño desproporcionado para 67 M de parámetros, probablemente por artefactos de entrenamiento incluidos; conviene revisar los archivos antes de descargarlo.
- No se publican pesos cuantizados ni formatos alternativos (GGUF, ONNX), lo que limita su despliegue en entornos sin PyTorch.
- El modelo tiene 50 descargas y 0 likes, sin validación independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Gumosh/model_bert
- Documentación de BERT en Transformers: https://huggingface.co/docs/transformers/model_doc/bert
- Dataset IMDb: https://huggingface.co/datasets/stanfordnlp/imdb
- Modelo base DistilBERT: https://huggingface.co/distilbert-base-uncased
