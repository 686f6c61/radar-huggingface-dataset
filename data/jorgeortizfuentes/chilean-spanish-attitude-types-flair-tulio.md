# jorgeortizfuentes/chilean-spanish-attitude-types-flair-tulio

## Resumen

El modelo `jorgeortizfuentes/chilean-spanish-attitude-types-flair-tulio` es un etiquetador de secuencias entrenado para clasificar los tres tipos de actitud de la Teoría de la Valoración (Appraisal Theory) en el marco de la Lingüística Sistémico-Funcional: afecto, juicio y apreciación. Desarrollado por Jorge Ortiz Fuentes, se basa en la librería Flair y combina embeddings de palabras fastText en español, embeddings contextuales de cadena (string embeddings) y el modelo BERT chileno TULIO, todo ello afinado sobre el corpus chileno de actitudes. El modelo está diseñado para investigación en análisis del discurso y etiquetado de secuencias, no para tareas de moderación ni clasificación de sentimiento general.

La arquitectura concreta es un BiLSTM-CRF que toma las representaciones combinadas de los tres tipos de embeddings y produce etiquetas BIO sobre las clases `affect`, `appreciation`, `judgment` y `O`. El modelo fue publicado bajo licencia CC-BY-4.0 y su repositorio tiene un tamaño de 1,9 GB. Aunque los resultados de evaluación (F1 estricta de 0,554) están por debajo del acuerdo entre anotadores expertos (0,719), el modelo es una referencia para la tarea de detección de actitudes en español chileno y forma parte de una línea de investigación sobre lenguaje evaluativo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiLSTM-CRF con embeddings combinados (fastText, string embeddings, BERT TULIO) |
| Parametros totales | No disponible (el modelo base TULIO tiene aproximadamente 110 millones de parametros, pero el tagger incluye capas adicionales) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (limitada por el modelo BERT TULIO, probablemente 512 tokens) |
| Tipos de cuantizacion | No disponible (modelo PyTorch, no se ofrecen cuantizaciones GGUF) |
| Idiomas soportados | Español chileno (es-CL) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (Flair) |

## Arquitectura y entrenamiento

El modelo es un clasificador de secuencias de tipo token-classification basado en la librería Flair. Utiliza una capa BiLSTM con CRF (Conditional Random Field) para la decodificación de las etiquetas. La representación de entrada combina tres tipos de embeddings: vectores estáticos de fastText para español, embeddings contextuales de cadena (string embeddings) en las direcciones hacia adelante y hacia atrás, y las representaciones del modelo BERT TULIO con pooling del primer sub-token. Esta combinación permite capturar información léxica, contextual y semántica profunda.

El entrenamiento se realizó sobre el corpus chileno de actitudes, que contiene 2.546 textos (mayormente tweets) anotados por tres lingüistas expertos en SFL. La configuración de entrenamiento incluye 100 épocas, una tasa de aprendizaje de 0,1 para el modelo BiLSTM y de 2e-05 para el BERT, con un tamaño de lote de 16 y parada temprana con paciencia de 3. Se utilizó la codificación BIO para las etiquetas y se optimizó la métrica de F1 estricta a nivel de span. El modelo publicado corresponde a la ejecución con semilla 42, cuyos resultados se reportan en la tabla de evaluación.

## Capacidades

- Clasificación de actitudes en español chileno: identifica y etiqueta spans de texto que expresan *afecto* (emociones), *juicio* (evaluación ética o social) y *apreciación* (valoración estética o de calidad).
- Análisis de lenguaje evaluativo en textos cortos, especialmente tweets, cartas al editor, columnas de opinión y quejas de consumidores.
- Soporte para etiquetado BIO (Begin, Inside, Outside) de spans, lo que permite extraer segmentos específicos de texto con su categoría.
- Capacidad de procesamiento de texto en español chileno, con vocabulario y variantes dialectales propias de esa región.
- No es un modelo generativo: no produce texto nuevo, sino que anota el texto de entrada.
- No tiene soporte para tool calling, agentes ni razonamiento multi-paso; es un modelo de clasificación de secuencias.

## Casos de uso

- **Investigación lingüística sobre discurso evaluativo**: el modelo permite etiquetar automáticamente corpus de textos en español chileno para estudiar la distribución de actitudes en diferentes géneros (tweets, columnas, cartas) y facilitar análisis cuantitativos y cualitativos.
- **Análisis de opinión pública en redes sociales**: se puede aplicar a tweets y publicaciones para identificar y categorizar expresiones de afecto, juicio y apreciación en contextos de conflicto político, como los que conforman el corpus de entrenamiento.
- **Monitorización de comentarios en plataformas de consumo**: las quejas de clientes y reseñas de productos pueden analizarse para detectar categorías de actitud (por ejemplo, juicios sobre el servicio o apreciación de la calidad), ayudando a priorizar respuestas.
- **Estudios de comunicación política**: los discursos de políticos y las reacciones del público pueden etiquetarse para comprender la polarización y la evaluación de propuestas o figuras públicas.
- **Análisis de narrativas en medios de comunicación**: columnas de opinión y cartas al editor pueden procesarse para identificar cómo se valora a personas, instituciones o eventos, lo que resulta útil para estudios de framing y persuasión.
- **Evaluación de intervenciones en entornos educativos**: en análisis de discurso en el aula, el modelo puede ayudar a identificar cómo los estudiantes expresan juicios o apreciaciones sobre contenidos académicos, aunque no está validado para ese dominio específico.

## Benchmarks y rendimiento

Los resultados declarados por el autor en el model-index y en la model card son los siguientes. Se trata de evaluación estricta a nivel de span: un span se considera correcto solo si la clase y los límites coinciden con el span dorado. La evaluación se realizó sobre el split de test del corpus chileno de actitudes (382 textos).

| Metrica | Valor |
|---|---|
| Micro F1 (estricta a nivel de span) | 0,5537 |
| Micro precision | 0,5608 |
| Micro recall | 0,5468 |

La model card también reporta los resultados por clase y las variaciones entre tres reentrenamientos con semillas distintas:

| Clase | Precision | Recall | F1 | Spans dorados |
|---|---|---|---|---|
| `affect` | 0,589 | 0,412 | 0,485 | 80 |
| `appreciation` | 0,509 | 0,520 | 0,515 | 375 |
| `judgment` | 0,597 | 0,588 | 0,592 | 507 |

El autor indica que la F1 de la ejecución con semilla 42 (la publicada) es 0,554, y que las tres reentrenamientos con semillas 1, 2 y 3 dieron F1 de 0,532, 0,545 y 0,533, con una media ± desviación de 0,537 ± 0,008. Todos los resultados quedan por debajo del acuerdo entre expertos (0,719), lo que indica que la tarea no está resuelta.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la documentación. Dado que el modelo combina embeddings BERT de tamaño mediano (TULIO, aprox. 110 M de parámetros) con una BiLSTM-CRF, la inferencia puede realizarse en CPU para textos cortos, aunque el uso de GPU acelera el procesamiento.
- **GPU recomendada**: una GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650 o superior) es suficiente para la inferencia en lotes pequeños. Para entrenamiento, se requeriría más memoria (8-12 GB) según el tamaño del lote.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo como la RTX 3060 o RTX 4060.
- **Opciones de despliegue**: al ser un modelo Flair, se puede cargar con la librería Flair en Python. No es compatible con vLLM ni Ollama porque no es un modelo generativo. Se puede servir mediante una API personalizada usando FastAPI o Flask.
- **Latencia y throughput**: no se proporcionan datos. Para un texto de longitud media (p. ej., un tweet), la inferencia debería ser inferior a 100 ms en GPU y de 1-2 segundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de clasificación de actitudes en español chileno. El modelo comparte categoría con otros sistemas de análisis de sentimiento o detección de aspectos, pero la tarea específica de clasificación de actitudes según la Teoría de la Valoración es muy específica y no hay un modelo público comparable. Se puede mencionar que el autor publicó otro modelo llamado `jorgeortizfuentes/spanish-attitude` (basado en `dccuchile/bert-base-spanish-wwm-cased`), pero no se dispone de sus métricas en esta información.

## Limitaciones y advertencias

- **Rendimiento limitado**: la F1 estricta es de 0,554, muy por debajo de la precisión de anotadores expertos (0,719). El modelo produce errores significativos en la detección de los límites de los spans y en la clasificación de clases, especialmente en `affect` (F1 0,485).
- **Sesgos de contenido**: el corpus de entrenamiento se recopiló en torno a episodios de conflicto político en Chile y contiene insultos, discursos de odio y amenazas. El modelo reproducirá esa distribución y puede etiquetar lenguaje agresivo de forma intensiva.
- **Riesgo de alucinación**: al ser un modelo de clasificación de tokens, no genera texto nuevo, pero puede asignar etiquetas erróneas a segmentos que no contienen actitud (falsos positivos).
- **Restricciones de uso**: la licencia CC-BY-4.0 permite uso comercial, pero el corpus de entrenamiento está protegido y solo se concede acceso para investigación no comercial. Los pesos del modelo no redistribuyen los textos, pero la documentación recomienda no utilizarlo para moderación de usuarios, perfilado de individuos o toma de decisiones sobre personas.
- **Especificidad dialectal**: está entrenado exclusivamente con español chileno; su rendimiento en otras variantes del español será inferior.
- **No es un clasificador de sentimiento general**: la tarea es más específica que el análisis de sentimiento, y no debe utilizarse como sustituto de un clasificador de polaridad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/jorgeortizfuentes/chilean-spanish-attitude-types-flair-tulio)
- [Corpus chileno de actitudes](https://huggingface.co/datasets/jorgeortizfuentes/chilean-spanish-attitude-corpus)
- [Modelo base TULIO (BERT chileno)](https://huggingface.co/dccuchile/tulio-chilean-spanish-bert) (DOI 10.57967/hf/1846)
- [Proyectos del autor](https://ortizfuentes.com/projects)
