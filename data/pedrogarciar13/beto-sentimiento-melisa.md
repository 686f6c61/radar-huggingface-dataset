# pedrogarciar13/beto-sentimiento-melisa

## Resumen

BETO Sentimiento MeLiSA es un modelo de clasificación de sentimiento en español obtenido por ajuste fino (fine-tuning) de `dccuchile/bert-base-spanish-wwm-cased`, el checkpoint BETO entrenado por el grupo DCC de la Universidad de Chile con whole word masking y casing. Lo desarrolla Pedro García Romero junto con Carlos Trilleras y Fabiola Aldana Mora en el marco de un proyecto final de la asignatura de Procesamiento de Lenguaje Natural de la Universidad Ean. El modelo resuelve una tarea de clasificación de tres clases (negativo, neutro, positivo) sobre reseñas de productos y servicios en español, en concreto sobre el corpus MeLiSA (LPSC-FIUBA).

Arquitectónicamente es un transformer encoder de tipo BERT con 109.853.187 parámetros totales, sin componentes de generación ni decodificación autorregresiva: se usa exclusivamente como cabecera de clasificación sobre la representación del token `[CLS]`. El repositorio ocupa 0,4 GB y los pesos se distribuyen en formato safetensors. Su relevancia es acotada pero concreta: ofrece un clasificador de sentimiento en español con métricas publicadas (F1 macro 0,793 sobre 5.000 comentarios de prueba) y un esquema de uso previsto orientado a triaje humano con umbral de confianza calibrado, más que a automatización total.

El modelo está pensado para apoyo a analistas que necesitan priorizar comentarios negativos, no para decisiones autónomas. La model card documenta explícitamente sus limitaciones de dominio y de distribución del corpus, lo que lo hace útil como referencia metodológica en proyectos académicos de PLN en español.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (BETO, `bert-base-spanish-wwm-cased`), con cabecera de clasificación de secuencia |
| Parametros totales | 109.853.187 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BETO base; la model card no la especifica) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en precisión original) |
| Idiomas soportados | español (`es`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |
| Tarea (pipeline) | `text-classification` |
| Clases de salida | 3 (negativo, neutro, positivo) |
| Modelo base | `dccuchile/bert-base-spanish-wwm-cased` |
| Dataset de ajuste | MeLiSA (LPSC-FIUBA), 16.000 reseñas en español con datos personales enmascarados |
| Tamano del repositorio | 0,4 GB |
| Autor | pedrogarciar13 (Pedro García Romero, Carlos Trilleras, Fabiola Aldana Mora) |

## Arquitectura y entrenamiento

El modelo parte de BETO, un transformer encoder de 12 capas con atención multi-cabeza completa, entrenado originalmente con objetivos de masked language modeling y next sentence prediction sobre un corpus en español y con enmascaramiento de palabras completas (whole word masking) y distinción de mayúsculas y minúsculas. Sobre ese checkpoint se añade una cabeza de clasificación y se ajusta de extremo a extremo para predecir tres clases de sentimiento. No hay componentes MoE, SSM ni mecanismos de atención lineal; es un BERT estándar en su variante base.

El ajuste se realizó sobre 16.000 reseñas del corpus MeLiSA (LPSC-FIUBA), un conjunto de reseñas en español de sitios de la región con datos personales enmascarados. La model card no detalla hiperparámetros de entrenamiento (learning rate, número de épocas, tamaño de batch, esquema de warmup) ni si se aplicaron técnicas de regularización adicionales. Sí se documenta una innovación operativa relevante: la calibración de probabilidades mediante escalado por temperatura y el establecimiento de un umbral de confianza de 0,69, de modo que el modelo solo emite decisión automática en el 78 % de los casos y el resto se deriva a revisión humana. No se menciona uso de RLHF ni DPO, algo esperable en un encoder de clasificación.

## Capacidades

- Clasificación de sentimiento en español en tres clases: negativo (1–2 estrellas), neutro (3 estrellas) y positivo (4–5 estrellas).
- Salida de probabilidades por clase, calibradas mediante escalado por temperatura, lo que permite umbralizar la confianza y derivar casos dudosos a revisión humana.
- Discriminación especialmente sensible a la clase negativa: recall de 0,854 en el conjunto de prueba según la model card.
- Procesamiento de texto de reseñas de productos y servicios en español, incluyendo texto con datos personales enmascarados.
- No soporta tool calling ni function calling: es un encoder de clasificación, no un modelo generativo.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo de razonamiento explícito (thinking mode), visión, audio ni otras modalidades.
- Capacidad multilingüe limitada al español; no se documenta rendimiento en otras lenguas.

## Casos de uso

- Triaje de reseñas en marketplaces: el modelo clasifica cada comentario en negativo, neutro o positivo y, aplicando el umbral de 0,69 descrito en la model card, prioriza automáticamente el 78 % de los casos, dejando el resto a revisión humana. Es adecuado porque su recall en negativo (0,854) reduce el riesgo de que una queja pase desapercibida.
- Monitorización de reputación de producto: integrado en un pipeline que consume reseñas nuevas, permite calcular la proporción de sentimiento negativo por SKU o por vendedor y detectar picos anómalos con latencia baja, dado el tamaño reducido del modelo (110 M de parámetros).
- Enrutado de tickets de atención al cliente: para comentarios textuales de posventa en español, el clasificador puede asignar prioridad a los mensajes con sentimiento negativo antes de que un agente humano los lea. La model card advierte que el corpus apenas cubre envíos ni vendedor, por lo que este uso requiere reentrenamiento con datos del dominio.
- Análisis exploratorio en investigación académica: sirve como línea base reproducible en estudios de PLN en español, ya que la model card documenta el corpus, las métricas y la comparación con TF-IDF, RNN, LSTM y GRU.
- Etiquetado asistido para construcción de datasets: el modelo puede preetiquetar grandes volúmenes de reseñas en español y usar la confianza calibrada para seleccionar qué ejemplos enviar a anotación humana, reduciendo el coste de anotación.
- Filtrado de feedback en encuestas internas o formularios abiertos: clasificación rápida de comentarios de empleados o usuarios en español para agregar sentiment por departamento o por periodo, con revisión humana de los casos de baja confianza.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la model card, medidos sobre una prueba de 5.000 comentarios del corpus MeLiSA:

| Metrica | Valor |
|---|---|
| F1 macro (test, 5.000 comentarios) | 0,793 |
| Recall clase negativa | 0,854 |
| Cobertura automática con umbral 0,69 | 78 % de los casos |
| Comparación con TF-IDF, RNN, LSTM y GRU | supera a los cuatro según la model card |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Tampoco se aportan cifras desagregadas de precisión, recall o F1 por clase más allá del recall de negativo, ni métricas de calibración previas y posteriores al escalado por temperatura.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,44 GB solo para pesos (109,85 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- VRAM estimada en FP16/BF16: alrededor de 0,22 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema, aunque las GPU de gama alta están sobredimensionadas para este modelo.
- Cabe en GPU consumer y también en CPU: al ser un encoder de 110 M de parámetros, la inferencia en CPU es viable para volúmenes moderados.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, ONNX Runtime, TorchScript, y servidores de inferencia compatibles con modelos de clasificación de Hugging Face (por ejemplo, Text Embeddings Inference o un servidor FastAPI propio). No se documenta soporte de vLLM ni de llama.cpp, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada. No se han publicado mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BETO Sentimiento MeLiSA (este modelo) | 109,85 M | no disponible | Clasificación de sentimiento en 3 clases, español | CC-BY-4.0 | Hugging Face, 0 descargas, 0 likes en el momento de la consulta |
| `dccuchile/bert-base-spanish-wwm-cased` (BETO base) | 109,85 M aprox. | no disponible | Modelo base en español (MLM), requiere ajuste para clasificación | no disponible en la información proporcionada | Hugging Face |
| TF-IDF, RNN, LSTM y GRU (líneas base del proyecto) | variable | no aplica | Clasificación de sentimiento en el mismo corpus | no aplica | Implementaciones propias del proyecto |

La model card indica que el modelo supera a TF-IDF, RNN, LSTM y GRU en el mismo conjunto de evaluación, pero no se aportan las cifras concretas de esas líneas base en la información disponible. No se dispone de comparación con otros clasificadores de sentimiento en español publicados en Hugging Face.

## Limitaciones y advertencias

- Sesgo de longitud: los comentarios de 15 palabras o menos son casi siempre negativos en el corpus MeLiSA por cómo se seleccionaron las reseñas, de modo que el modelo tiende a interpretar "texto corto" como "queja". Esto puede producir falsos negativos en reseñas breves positivas.
- Cobertura de dominio limitada: el corpus apenas contiene menciones a envíos o al vendedor, por lo que el modelo no es fiable para chats, reclamaciones de posventa ni conversaciones de atención al cliente sin reentrenamiento.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea con alta confianza en textos fuera de distribución; la calibración por temperatura mitiga pero no elimina este problema.
- Uso responsable: la model card prohíbe explícitamente usar el modelo para decisiones automáticas sobre personas sin revisión humana.
- Licencia CC-BY-4.0: permite uso comercial y obras derivadas con atribución, pero conviene verificar las condiciones de la licencia del modelo base BETO, que no se detalla en la información proporcionada.
- Tracción mínima: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni de validación externa.
- Idiomas: solo español; no se documenta comportamiento en otras lenguas ni en variantes dialectales distintas de las representadas en MeLiSA.
- Sin datos de hiperparámetros ni de reproducibilidad del entrenamiento en la model card, lo que dificulta replicar exactamente el ajuste fino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pedrogarciar13/beto-sentimiento-melisa
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/pedrogarciar13/sentimiento-melisa-beto
- Código del proyecto: https://github.com/pedrogarciar13/proyecto_final_pln
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
