# Nurlss/chat-moderation-models

## Resumen

`Nurlss/chat-moderation-models` es un repositorio de modelos de clasificación de texto orientados a la moderación de conversaciones, publicado por el usuario Nurlss en Hugging Face. No se trata de un único modelo, sino de un paquete de cinco artefactos que implementan una "escalera" de complejidad creciente: desde un léxico de palabras ofensivas con emparejamiento por distancia de edición hasta un `bert-base-uncased` afinado y su versión cuantizada a INT8. El repositorio nace como entrega de una tarea académica (SWE015) y da soporte a la aplicación del repositorio GitHub `Nurasln/chat-moderation-ladder`, que descarga el contenido completo en `models/` en el primer arranque.

El problema que aborda es la detección de lenguaje ofensivo en inglés, con el conjunto de datos TweetEval `offensive` (derivado de OffensEval 2019) como fuente de entrenamiento. La propuesta es interesante desde el punto de vista didáctico y de ingeniería: permite comparar en un mismo repositorio enfoques léxicos, lineales clásicos (TF-IDF + regresión logística), embeddings propios con red feedforward y transformers afinados, además de una variante cuantizada para CPU.

El modelo de mayor calidad del paquete es el BERT afinado (FP32) y su versión INT8 dinámica, ambos basados en `google-bert/bert-base-uncased` (110 millones de parámetros, contexto de 512 tokens). El repositorio no incluye resultados de benchmarks en la model card; las métricas se remiten al repositorio GitHub del autor. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de 5 artefactos: léxico con distancia de edición, TF-IDF + regresión logística (scikit-learn), Word2Vec propio + red feedforward, BERT-base afinado (FP32) y BERT-base con cuantización dinámica INT8 |
| Parametros totales | 110 M para el componente BERT-base; no disponible para el resto de artefactos |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens para el componente BERT-base; no disponible para el resto |
| Tipos de cuantizacion | INT8 dinámica (PyTorch, orientada a CPU) sobre el modelo BERT afinado |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (BERT), `joblib` (pipeline TF-IDF + regresión logística), `json` (léxico y configuración), `kv` (Word2Vec), `pt` (red feedforward y state dict INT8) |

## Arquitectura y entrenamiento

El repositorio agrupa cinco aproximaciones con complejidad creciente. La primera es un léxico de palabras ofensivas construido a partir de los datos de entrenamiento y aplicado mediante un emparejador por distancia de edición. La segunda es un pipeline clásico de scikit-learn con vectorización TF-IDF y regresión logística. La tercera combina un modelo Word2Vec entrenado por el propio autor con una red feedforward. La cuarta es un `bert-base-uncased` afinado para clasificación de texto en FP32. La quinta es la misma red BERT convertida a INT8 mediante cuantización dinámica de PyTorch, pensada para inferencia en CPU.

El entrenamiento se realiza sobre el subconjunto `offensive` de TweetEval (OffensEval 2019), un corpus de tuits en inglés etiquetados para detección de lenguaje ofensivo. La model card no detalla el número de tokens, la composición exacta del dataset, la presencia de RLHF/DPO ni hiperparámetros de entrenamiento; esa información se remite al repositorio GitHub del autor. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de texto binaria o multiclase orientada a detección de lenguaje ofensivo en inglés.
- Moderación de conversaciones: el paquete está diseñado para integrarse en una aplicación de chat que descarga los modelos en el primer arranque.
- Comparación de enfoques: permite evaluar en el mismo entorno un léxico, un modelo lineal, embeddings propios con red neuronal y un transformer afinado.
- Inferencia en CPU: la variante INT8 dinámica está pensada para ejecución sin GPU.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.

## Casos de uso

- Moderación de comentarios en foros y comunidades en inglés: el componente BERT afinado puede clasificar mensajes individuales de hasta 512 tokens y marcar aquellos con lenguaje ofensivo para revisión humana.
- Filtrado previo de mensajes en aplicaciones de chat: el léxico y el pipeline TF-IDF + regresión logística ofrecen una primera pasada de bajo coste que descarta casos evidentes antes de invocar el modelo BERT.
- Despliegue en servidores sin GPU: la variante INT8 dinámica permite ejecutar la clasificación BERT en CPU con un coste de memoria reducido respecto a FP32.
- Evaluación educativa de técnicas de NLP: el repositorio sirve como material comparativo entre enfoques léxicos, lineales, embeddings y transformers en una misma tarea.
- Investigación sobre detección de toxicidad en redes sociales: el entrenamiento sobre TweetEval `offensive` lo hace adecuado para experimentos con texto informal y abreviaturas propias de Twitter.
- Prototipado rápido de pipelines de moderación: los artefactos en `joblib`, `json` y `kv` se cargan con scikit-learn y gensim sin necesidad de infraestructura de inferencia de transformers.
- Integración en una aplicación de chat de referencia: el repositorio GitHub asociado descarga automáticamente el paquete en `models/`, lo que facilita reproducir el entorno completo del proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite los resultados y el código al repositorio GitHub del autor (`https://github.com/Nurasln/chat-moderation-ladder`), pero no incluye cifras de accuracy, F1, MMLU, HumanEval ni GSM8K en el texto proporcionado.

## Requisitos de hardware

- Componente BERT-base en FP32: aproximadamente 440 MB de pesos; con activaciones y overhead de inferencia, se recomienda al menos 2 GB de VRAM o RAM.
- Componente BERT-base en INT8 dinámico: aproximadamente 110 MB de pesos, orientado a CPU; cabe holgadamente en cualquier equipo de consumo.
- Componentes léxico, TF-IDF + regresión logística, Word2Vec y red feedforward: requisitos mínimos, ejecutables en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican; para el componente BERT en FP32 cualquier GPU con al menos 2-4 GB de VRAM es suficiente (GTX 1650, RTX 3060, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, el componente BERT-base en FP32 e INT8 cabe en cualquier GPU de consumo moderna.
- Opciones de despliegue: PyTorch para el componente BERT; scikit-learn y gensim para los artefactos clásicos; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Nurlss/chat-moderation-models` (BERT) | 110 M | 512 tokens | Clasificación de lenguaje ofensivo (inglés) | Apache 2.0 | Hugging Face, 0 descargas |
| `cardiffnlp/twitter-roberta-base-offensive` | 125 M | 512 tokens | Clasificación de lenguaje ofensivo en tuits | No disponible en la información proporcionada | Hugging Face |
| `google-bert/bert-base-uncased` | 110 M | 512 tokens | Modelo base de propósito general | Apache 2.0 | Hugging Face |
| `unitary/toxic-bert` | 110 M | 512 tokens | Clasificación de toxicidad multietiqueta | Apache 2.0 | Hugging Face |

La comparativa se limita a modelos de la misma categoría (clasificación de texto para moderación en inglés). El repositorio de Nurlss se distingue por agrupar varias aproximaciones en un único paquete y por incluir una variante INT8 para CPU, pero carece de métricas publicadas en la model card y de tracción en Hugging Face (0 descargas, 0 likes en el momento de la consulta).

## Limitaciones y advertencias

- Entrenado exclusivamente sobre tuits en inglés (TweetEval `offensive`); el rendimiento en otros dominios (foros, chats, prensa) o en otros idiomas no está documentado y probablemente sea inferior.
- El modelo puede reproducir sesgos presentes en OffensEval 2019, incluyendo sobrerrepresentación de ciertos grupos demográficos o de determinadas expresiones coloquiales.
- Riesgo de falsos positivos con lenguaje informal, ironía, reapropiación de términos o citas textuales.
- Riesgo de falsos negativos ante ofensas implícitas, sarcasmo o codificación léxica no presente en el corpus de entrenamiento.
- No se han publicado métricas de evaluación en la model card; la validación queda a cargo del usuario.
- El repositorio tiene 0 descargas y 0 likes, y fue creado como entrega de una tarea académica; no hay evidencia de uso en producción ni de mantenimiento continuado.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El componente INT8 está orientado a CPU; no se documenta su degradación de precisión respecto a FP32.
- El repositorio incluye artefactos heterogéneos (léxico, `joblib`, `kv`, `pt`, safetensors) que requieren distintas librerías, lo que complica su despliegue unificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nurlss/chat-moderation-models
- Repositorio GitHub del proyecto: https://github.com/Nurasln/chat-moderation-ladder
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/cardiffnlp/tweet_eval
