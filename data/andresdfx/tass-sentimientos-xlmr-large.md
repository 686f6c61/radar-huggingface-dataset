# andresdfx/tass-sentimientos-xlmr-large

## Resumen

`andresdfx/tass-sentimientos-xlmr-large` es un modelo de clasificación de sentimiento en español obtenido por afinamiento (fine-tuning) de `xlm-roberta-large` sobre el corpus TASS, con tres etiquetas de salida: negativo (N), neutro (NEU) y positivo (P). Lo publica el usuario `andresdfx` en Hugging Face y, por su naturaleza, es un clasificador de secuencias y no un modelo generativo: no produce texto, solo asigna una clase a una entrada.

El modelo cuenta con 559.893.507 parámetros (aproximadamente 560 M), lo que corresponde al tamaño del encoder XLM-RoBERTa large, y el repositorio ocupa 2,3 GB en formato safetensors. El entrenamiento se realizó sobre el corpus TASS de análisis de sentimientos en español, con lotes de tamaño 8, hasta 8 épocas con parada temprana (paciencia 3), longitud máxima de 128 subtokens y semilla 42.

Su relevancia es acotada pero clara: sirve como punto de partida reproducible para tareas de análisis de sentimiento en redes sociales en español y mejora ligeramente la referencia del curso citada por el autor (BETO con F1 = 0,64), al alcanzar un F1 macro de 0,6614 en el conjunto de prueba. No obstante, el repositorio no declara licencia, tiene cero descargas y cero "likes" en el momento de redactar esta ficha, y no aporta información sobre el proceso de partición de datos ni sobre validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo XLM-RoBERTa large (configuración del modelo base: 24 capas, dimensión oculta 1024, 16 cabezas de atención) |
| Parámetros totales | 559.893.507 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 subtokens durante el afinamiento (el modelo base admite hasta 512) |
| Tipos de cuantización | No disponible (el repositorio publica pesos en safetensors; no se documentan versiones cuantizadas) |
| Idiomas soportados | Español (etiqueta `es`) |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `xlm-roberta-large`: un encoder Transformer bidireccional con 24 capas, dimensión oculta de 1024 y 16 cabezas de atención, sobre el que se añade una cabeza de clasificación de secuencias con tres salidas (N, NEU, P). XLM-RoBERTa se entrenó originalmente con objetivos enmascarados sobre corpus multilingües, pero el afinamiento aquí es monolingüe en español y específico de dominio. No se documenta ningún componente adicional (atención lineal, decodificación especulativa, mezcla de expertos) porque no procede en un clasificador de este tipo.

El entrenamiento consistió en un ajuste supervisado clásico sobre el corpus TASS, con tamaño de lote 8, un máximo de 8 épocas con parada temprana de paciencia 3, truncado a 128 subtokens y semilla 42. La model card no especifica el optimizador, la tasa de aprendizaje, el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo técnicas de regularización adicionales. Tampoco se indica ningún proceso de RLHF o DPO, algo esperable en un modelo discriminativo de este tamaño. Los únicos resultados publicados son las métricas de evaluación sobre el conjunto de prueba.

## Capacidades

- Clasificación de sentimiento en español en tres clases: negativo (N), neutro (NEU) y positivo (P).
- Procesamiento de entradas cortas, con truncado a 128 subtokens durante el entrenamiento, adecuado para publicaciones de redes sociales, titulares y comentarios breves.
- Inferencia por lotes (el autor empleó tamaño de lote 8), apta para pipelines de alto volumen sobre CPU o GPU modesta.
- No dispone de generación de texto ni de diálogo: es un encoder con cabeza de clasificación.
- No soporta tool calling ni function calling.
- No está orientado a agentes ni a razonamiento multi-paso.
- No dispone de modo "thinking", visión, audio ni multimodalidad.
- Capacidad multilingüe limitada al español: aunque el modelo base es multilingüe, el afinamiento se realizó exclusivamente sobre corpus en español, por lo que el rendimiento fuera de ese idioma no está garantizado ni documentado.
- La model card no declara pipeline en los metadatos de Hugging Face, pero funcionalmente corresponde a `text-classification`.

## Casos de uso

- Monitorización de marca en redes sociales: el modelo está afinado sobre TASS, un corpus de análisis de sentimiento en Twitter en español, por lo que encaja de forma directa en el seguimiento de menciones y conversaciones sobre una marca o producto en plataformas sociales.
- Análisis de opinión de reseñas cortas: permite etiquetar automáticamente reseñas de aplicaciones, comercio electrónico o plataformas de viajes, siempre que el texto sea breve y no supere el límite de 128 subtokens del entrenamiento.
- Priorización de tickets de soporte: clasificar el tono de los mensajes entrantes para enrutar primero los casos con sentimiento negativo y reducir el tiempo de respuesta en incidencias críticas.
- Análisis de encuestas de satisfacción (NPS, CSAT): procesar los comentarios abiertos asociados a una puntuación numérica y obtener una señal de sentimiento agregada por segmento de cliente.
- Seguimiento de reputación durante eventos concretos: lanzamientos de producto, campañas electorales o crisis de comunicación, con procesamiento por lotes de grandes volúmenes de publicaciones recogidas en un intervalo temporal.
- Investigación académica en PLN en español: sirve como línea base de bajo coste computacional para comparar contra BETO u otros encoders afinados sobre TASS en experimentos de análisis de sentimiento.
- Enriquecimiento de datasets internos: preetiquetar grandes volúmenes de texto para después revisar manualmente una muestra, reduciendo el coste de anotación en proyectos de etiquetado supervisado.

## Benchmarks y rendimiento

Los únicos datos publicados son los del conjunto de prueba de TASS que reporta el autor en la model card.

| Métrica | Valor |
|---|---|
| F1 macro | 0,6614 |
| Precisión macro | 0,6601 |
| Recall macro | 0,6640 |
| Exactitud | 0,6623 |

Comparación declarada por el autor: la referencia del curso basada en BETO obtiene un F1 de 0,64, frente al 0,6614 de este modelo. No se aportan resultados en otros conjuntos (MMLU, HumanEval, GSM8K, etc.), que además no son aplicables a un clasificador de sentimiento. Tampoco se detalla el tamaño del conjunto de prueba, la partición de entrenamiento/validación ni el intervalo de confianza de las métricas, por lo que la comparación debe tomarse como indicativa.

## Requisitos de hardware

- Peso del modelo según precisión: unos 2,24 GB en FP32, unos 1,12 GB en FP16/BF16 y unos 0,56 GB en INT8.
- VRAM estimada para inferencia: menos de 1 GB con precisión reducida y lotes pequeños; entre 1,5 y 3 GB en FP32 con lotes de tamaño 8, sin contar activaciones.
- Cabe sin problema en GPU de consumo: GTX 1660 (6 GB), RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 (24 GB), entre otras. También es viable la inferencia en CPU para volúmenes moderados.
- GPU de centro de datos (A100, H100, L40S) no son necesarias para inferencia; solo tendrían sentido para lotes muy grandes o para reentrenar el modelo.
- Opciones de despliegue: pipeline `text-classification` de Hugging Face Transformers, exportación a ONNX u ONNX Runtime mediante Optimum, TorchScript, Hugging Face Inference Endpoints o un servicio propio con FastAPI.
- No está orientado a vLLM, TGI ni llama.cpp/Ollama, herramientas pensadas para modelos generativos o para pesos GGUF, que no es el caso de este encoder.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 macro (TASS) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tass-sentimientos-xlmr-large | 559,9 M | 128 subtokens en el afinamiento | 0,6614 | No disponible | Hugging Face |
| BETO (referencia del curso citada por el autor) | No disponible | No disponible | 0,64 | No disponible | No disponible |
| Oscaroso28/xlmr-tass-sentimiento | No disponible | No disponible | No disponible | No disponible | Hugging Face |

La única comparación con cifras es la que aporta el propio autor frente a BETO. El modelo `Oscaroso28/xlmr-tass-sentimiento`, aparecido en la búsqueda web, parece abordar la misma tarea sobre el mismo corpus, pero no se dispone de sus especificaciones ni de sus métricas, por lo que no puede establecerse una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explícita, el uso comercial es jurídicamente arriesgado; conviene contactar con el autor antes de integrarlo en producción.
- Rendimiento moderado: un F1 macro de 0,6614 en tres clases implica una tasa de error en torno al 34 %, insuficiente como única fuente de decisión en procesos sensibles.
- Dominio restringido: el afinamiento se realizó sobre TASS, un corpus de redes sociales en español; el rendimiento puede degradarse notablemente en texto formal, prensa, documentación técnica o lenguaje jurídico.
- Truncado a 128 subtokens: los textos más largos se recortan, lo que puede eliminar información relevante y sesgar la predicción en documentos extensos.
- Cobertura idiomática limitada: aunque el modelo base sea multilingüe, el afinamiento es monolingüe en español y no hay evaluación en otras lenguas.
- Sesgos del corpus de origen: la distribución de TASS refleja registros, jerga y temáticas concretas de redes sociales, con posible sobrerrepresentación de determinados perfiles y temas.
- Dificultad conocida en ironía, sarcasmo y negaciones complejas, habituales en el análisis de sentimiento sobre texto informal.
- Posible desbalance de clases entre N, NEU y P; el uso de F1 macro mitiga la lectura, pero no se documenta la distribución real.
- Falta de reproducibilidad: no se especifican partición de datos, optimizador, tasa de aprendizaje ni método de selección del mejor checkpoint, solo semilla, lotes, épocas y longitud.
- Sin validación por la comunidad: cero descargas y cero "likes" en el repositorio, sin evidencia de uso independiente.
- Modelo exclusivamente discriminativo: no admite instrucciones, generación, herramientas ni razonamiento; cualquier expectativa de comportamiento tipo asistente queda fuera de su alcance.
- Uso responsable: clasificar sentimiento sobre personas puede tener implicaciones de privacidad y moderación; conviene auditar sesgos antes de automatizar decisiones que afecten a usuarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andresdfx/tass-sentimientos-xlmr-large
- Modelo relacionado encontrado en la búsqueda: https://huggingface.co/Oscaroso28/xlmr-tass-sentimiento
