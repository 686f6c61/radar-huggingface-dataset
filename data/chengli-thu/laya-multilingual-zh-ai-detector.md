# chengli-thu/laya-multilingual-zh-ai-detector

## Resumen

Laya Multilingual 中文 AI Author Detector es un modelo de clasificación de texto derivado por fine-tuning del modelo base multilingüe Laya Multilingual (convaiinnovations/laya-multilingual). Lo publica el usuario chengli-thu en Hugging Face bajo licencia Apache 2.0. Su tarea es detectar si un texto en chino ha sido escrito por una persona o generado por un modelo de IA, y en caso de ser IA, predecir cuál de los 11 generadores cubiertos en el entrenamiento produjo el texto.

El modelo emplea una arquitectura de encoder compartido con dos cabezas de clasificación: una binaria (humano/IA) y otra multiclase cerrada para identificar la fuente de generación. El checkpoint contiene 306.949.645 parámetros y el repositorio ocupa 1,3 GB en formato safetensors. Está entrenado específicamente sobre respuestas de Zhihu en chino, con pares de texto original humano y su reescritura por IA.

Es relevante en el contexto actual de detección de contenido sintético y atribución de autoría generativa, un problema con implicaciones en moderación de plataformas, integridad académica y periodismo. Su valor diferencial frente a detectores genéricos es la combinación de detección binaria con atribución de fuente generadora, aunque su alcance está limitado al dominio y idioma de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer compartido con dos cabezas de clasificación (binaria y multiclase) |
| Parámetros totales | 306.949.645 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (truncado por la derecha) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `convaiinnovations/laya-multilingual` en la revisión `e4e9ddf21a7b1903b7acffd8814ad4307bf63a67`. Sobre el encoder compartido se añaden dos cabezas: una de clasificación binaria humano/IA y otra multiclase con 11 clases que corresponden a los generadores de IA presentes en el conjunto de entrenamiento. La inferencia añade internamente un prefijo de entrada fijado en entrenamiento y aplica un umbral de decisión calibrado, ambos publicados junto con los pesos (`inference_config.json`). El mapeo de identificadores de clase a nombres de generador está en `generator_mapping.json`.

El entrenamiento se realizó sobre respuestas originales de Zhihu y sus correspondientes reescrituras por IA. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset más allá del dominio Zhihu, ni si se emplearon técnicas de RLHF o DPO (no aplicables habitualmente en clasificación). La evaluación reportada usa el split 0 tanto para selección del checkpoint como del umbral, por lo que constituye una evaluación de desarrollo y no un test independiente.

## Capacidades

- Clasificación binaria de autoría: determina si un texto en chino es humano o generado por IA, con una probabilidad asociada (`probability_ai`).
- Atribución de fuente generadora: cuando el texto se clasifica como IA, devuelve las tres fuentes más probables entre las 11 clases de entrenamiento, con probabilidad condicional a que sea IA.
- Procesamiento de textos de hasta 2.048 tokens, con truncado por la derecha y señalización del truncado en la salida.
- Salida estructurada en diccionario con `prediction`, `probability_ai`, `ai_threshold`, `source_top3` y `truncation`.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un clasificador, no un modelo generativo.
- No tiene capacidades multimodales (visión, audio) ni modo de razonamiento extendido.
- Multilingüismo: limitado al chino; otros idiomas no han sido validados.

## Casos de uso

- Moderación de contenido en plataformas de preguntas y respuestas en chino: el modelo puede marcar respuestas sospechosas de generación automática en foros tipo Zhihu, con una probabilidad calibrada que permite ajustar el umbral según la política de la plataforma.
- Atribución de fuente en análisis forense de texto: cuando se detecta contenido IA, la cabeza multiclase ofrece un top-3 de generadores candidatos, útil para investigadores que estudian qué modelos se están usando en una campaña concreta.
- Integridad académica en entornos educativos chinos: revisión de ensayos o respuestas de estudiantes para detectar reescrituras por IA, siempre como señal auxiliar y no como prueba concluyente.
- Monitorización de medios y redes sociales: pipelines que clasifican grandes volúmenes de texto en chino para estimar la proporción de contenido sintético en un tema o comunidad.
- Investigación en detección de IA: el modelo sirve como baseline reproducible para comparar técnicas de detección y atribución sobre el dominio Zhihu, con código de inferencia incluido (`predict.py`).
- Filtrado previo en datasets: limpieza de corpus en chino eliminando textos generados por IA antes de usarlos en entrenamiento de otros modelos, con la ventaja de la atribución de fuente para trazabilidad.
- Análisis de tendencias de adopción de modelos: agregando las predicciones de la cabeza multiclase sobre un corpus se puede estimar qué generadores (por ejemplo, GPT o Gemini en la nomenclatura del mapeo) dominan la producción de contenido sintético en una comunidad.

## Benchmarks y rendimiento

| Métrica | Valor | Conjunto |
|---|---|---|
| Exactitud binaria (humano/IA) | 99,05 % | Split 0 de desarrollo, 9.997 muestras |
| Exactitud Top 1 de fuente (sobre muestras IA) | 81,97 % | 4.997 muestras IA reales del split 0 |
| Exactitud Top 3 de fuente (sobre muestras IA) | 96,94 % | 4.997 muestras IA reales del split 0 |

Advertencia: el split 0 se usó tanto para seleccionar el checkpoint como el umbral, por lo que estas cifras son de evaluación de desarrollo y probablemente optimistas respecto a un test independiente. No se han publicado resultados en conjuntos externos ni comparaciones con otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: con 306,9 millones de parámetros, en fp32 ocupa aproximadamente 1,2 GB de pesos; en fp16 unos 0,6 GB; en int8 unos 0,3 GB. A esto hay que sumar memoria para activaciones y el tokenizador, por lo que 2-3 GB de VRAM son suficientes en la práctica.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Una RTX 3060 (12 GB), RTX 4060, RTX 4090 o incluso GPUs de gama de entrada con 4 GB pueden ejecutar el modelo. En CPU también es viable para volúmenes moderados.
- Cabe holgadamente en GPU consumer: sí, en todas las GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: el repositorio incluye `predict.py` con la clase `LayaTextClassifier` como vía de inferencia oficial. Al ser un modelo `transformers` con `pipeline_tag: text-classification`, es compatible con la API estándar de Transformers. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI en la información disponible; al ser un clasificador con cabezas personalizadas, la integración con esos servidores requeriría adaptación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Tarea | Licencia |
|---|---|---|---|---|---|
| laya-multilingual-zh-ai-detector | 306,9 M | 2.048 tokens | zh | Detección IA + atribución de fuente (11 clases) | Apache 2.0 |
| Detectores genéricos de IA (p. ej. clasificadores RoBERTa ajustados) | variable | variable | multi | Detección binaria IA/humano | variable |
| Modelos de detección de texto generado multilingües comerciales | no disponible | no disponible | multi | Detección binaria | propietaria |

No se dispone en la información proporcionada de comparaciones directas con alternativas concretas de la misma categoría, ni de resultados de benchmarks cruzados. La comparativa anterior es orientativa por categoría y no debe interpretarse como una evaluación empírica.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente sobre respuestas de Zhihu en chino. No validado en otros géneros (noticias, código, correos), otros registros ni otros idiomas.
- Cierre de clases: la atribución de fuente es una clasificación cerrada sobre 11 generadores vistos en entrenamiento. Cualquier modelo nuevo o no incluido no puede identificarse correctamente y se mapeará a una de las clases existentes.
- Textos mixtos no validados: la combinación de fragmentos humanos y generados por IA no ha sido evaluada; el modelo asume autoría única.
- Evaluación sesgada: el split 0 se usó para selección de checkpoint y umbral, por lo que las cifras del 99,05 % y 81,97 %/96,94 % son de desarrollo y no de test independiente. La generalización real es incierta.
- Riesgo de falsos positivos y negativos: un clasificador con umbral calibrado sobre un dominio concreto puede comportarse de forma errática fuera de él. No debe usarse como prueba definitiva de autoría.
- Sesgos potenciales: el corpus de Zhihu tiene sesgos de temática, estilo y demografía de sus autores, que el modelo puede heredar.
- Restricciones de licencia: los pesos se publican bajo Apache 2.0, pero la model card advierte que el modelo base se distribuye con su propia licencia y atribución (LICENSE-APACHE-2.0 y NOTICE) y que el publicador debe confirmar el alcance de autorización de los pesos ajustados y del código añadido antes de un uso comercial.
- Sin garantías de producción: no hay documentación sobre latencia, throughput, estabilidad numérica ni comportamiento con entradas adversarias o ataques de evasión.
- Descargas y adopción: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chengli-thu/laya-multilingual-zh-ai-detector
- Modelo base Laya Multilingual: https://huggingface.co/convaiinnovations/laya-multilingual
- Licencia del modelo base (referenciada en el repo): LICENSE-APACHE-2.0
- Aviso de atribución del modelo base (referenciado en el repo): NOTICE
