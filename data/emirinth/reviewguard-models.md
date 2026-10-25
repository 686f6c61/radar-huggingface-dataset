# Emirinth/ReviewGuard-models

## Resumen

ReviewGuard-models es un repositorio de HuggingFace publicado por el usuario Emirinth que no contiene un único modelo, sino el conjunto de artefactos que sostienen una aplicación de triaje de reseñas llamada ReviewGuard. Incluye cuatro componentes: un RoBERTa ajustado (fine-tuned) sobre 72.000 reseñas de Amazon Reviews 2023 para clasificación de sentimiento en tres clases (negativo, neutro, positivo), una versión más pequeña y rápida basada en DistilRoBERTa entrenada del mismo modo, un conjunto de líneas base clásicas (TF-IDF con Naive Bayes y regresión logística) y un clasificador de "issues" serializado en `issue_student.joblib`, destilado a partir de un profesor zero-shot. Se completan con dos ficheros JSON de calibración y ajuste de umbrales (`photo_calibration.json` y `lexicon_bands.json`).

El valor práctico del paquete es de ingeniería más que de investigación: ofrece una escalera de modelos (grande, pequeño y líneas base) pensada para comparar coste y calidad en la misma tarea, más los umbrales calibrados necesarios para convertir probabilidades en decisiones operativas. El pipeline de descarga se resuelve con `python pipeline.py fetch-models`, lo que sugiere que el repositorio está diseñado para integrarse en un proyecto propio y no para consumo directo vía `transformers`.

La relevancia es acotada y muy específica de dominio: no hay resultados de benchmarks publicados, el repositorio no tiene descargas ni likes, y la model card es mínima. Debe evaluarse como un componente de un producto concreto (atención al cliente y análisis de reseñas en retail), no como un modelo fundacional. La licencia MIT facilita la reutilización comercial, pero la ausencia de métricas verificables obliga a una evaluación propia antes de llevarlo a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. El autor indica que `roberta_sentiment/` es un RoBERTa ajustado y `distilroberta_sentiment/` una versión reducida basada en DistilRoBERTa. `classical/` contiene TF-IDF con Naive Bayes y regresión logística. `issue_student.joblib` es un clasificador destilado de un profesor zero-shot (algoritmo no especificado) |
| Parámetros totales | No disponible. El autor no indica la variante base (RoBERTa-base, RoBERTa-large, etc.) ni el número de parámetros de cada componente |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. No especificada por el autor; los modelos de la familia RoBERTa están limitados a 512 tokens por su codificación posicional |
| Tipos de cuantización | No disponible. Se distribuyen pesos en safetensors (probablemente fp32/fp16 sin cuantizar) y artefactos joblib para los modelos scikit-learn. No se publican versiones GGUF, ONNX ni cuantizaciones de 8/4 bits |
| Idiomas soportados | No disponible oficialmente. El entrenamiento se realizó sobre Amazon Reviews 2023, corpus predominantemente en inglés, por lo que el soporte multilingüe no está garantizado |
| Licencia | MIT |
| Formato de pesos | safetensors (modelos transformer), joblib (clasificador de issues y modelos clásicos) y JSON (calibración y bandas de léxico) |

## Arquitectura y entrenamiento

El componente principal es un ajuste fino de RoBERTa sobre 72.000 reseñas del corpus Amazon Reviews 2023, con una cabeza de clasificación de tres clases (negativo, neutro, positivo). El autor no documenta hiperparámetros, número de épocas, proporción de datos de validación ni si hubo balanceo de clases, pese a que el sentimiento en reseñas de retail está fuertemente desbalanceado hacia el polo positivo. La versión DistilRoBERTa se entrenó "del mismo modo", según la model card, lo que la convierte en la alternativa de menor coste computacional a costa de capacidad.

El clasificador de issues (`issue_student.joblib`) se obtuvo por destilación desde un profesor zero-shot, una técnica habitual para transferir etiquetas de un LLM grande a un modelo pequeño y desplegable en CPU. Los ficheros `photo_calibration.json` y `lexicon_bands.json` sugieren un post-procesado con umbrales calibrados y reglas léxicas por bandas de probabilidad, probablemente para decidir cuándo escalar una reseña a revisión humana. No se documenta ninguna innovación arquitectónica: no hay atención lineal, decodificación especulativa ni mezcla de expertos; es un stack clásico de NLP supervisado.

## Capacidades

- Clasificación de sentimiento en tres clases (negativo, neutro, positivo) sobre texto de reseñas, con dos niveles de coste (RoBERTa y DistilRoBERTa).
- Clasificación de "issues" o categorías de problema mediante un modelo estudiante destilado desde un profesor zero-shot.
- Líneas base reproducibles en TF-IDF + Naive Bayes y TF-IDF + regresión logística, útiles para medir la ganancia real de los transformers frente a métodos clásicos.
- Calibración de probabilidades y aplicación de bandas léxicas para transformar scores en decisiones operativas (por ejemplo, umbral de escalado a revisión humana).
- Ejecución en CPU para los componentes clásicos y el clasificador de issues, al estar serializados en joblib.
- No se documentan capacidades de generación de texto, razonamiento multi-paso, tool calling, agentes, visión, audio ni modo "thinking". Es exclusivamente un stack de clasificación de texto.
- No se documenta soporte multilingüe ni detección de idioma.

## Casos de uso

- Triaje automático de reseñas en e-commerce: el clasificador de sentimiento asigna cada reseña entrante a negativo, neutro o positivo, y el clasificador de issues la etiqueta por tipo de problema (envío, producto defectuoso, atención recibida), permitiendo enrutar solo los casos negativos al equipo de soporte.
- Priorización de colas de atención al cliente: usando los umbrales de calibración, se puede fijar una banda de alta confianza para respuesta automática y una banda de baja confianza para revisión humana, reduciendo el volumen de tickets que llegan a un agente.
- Monitorización de reputación de producto: agregación de sentimiento por SKU y por ventana temporal para detectar caídas tras un cambio de proveedor o de embalaje, con el modelo DistilRoBERTa para procesar grandes volúmenes en CPU.
- Señalización de reseñas para moderación: el clasificador de issues, destilado de un profesor zero-shot, permite filtrar categorías problemáticas sin depender de un LLM en producción, con coste de inferencia mínimo.
- Evaluación comparativa interna (baseline): las líneas base TF-IDF + Naive Bayes y TF-IDF + regresión logística sirven para justificar ante un equipo de producto si el salto a transformers compensa el coste adicional de infraestructura.
- Enriquecimiento de datasets de analítica: etiquetado por lotes de reseñas históricas para construir dashboards de evolución de sentimiento y de incidencias por categoría, ejecutable en una máquina sin GPU.
- Prototipado rápido de un producto de análisis de reseñas: al estar empaquetado con un comando de descarga (`fetch-models`), permite levantar una demo funcional sin entrenar nada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye accuracy, F1, matrices de confusión ni comparaciones cuantitativas entre `roberta_sentiment`, `distilroberta_sentiment` y `classical/`, pese a que el repositorio contiene explícitamente las tres alternativas para poder compararlas. Tampoco se aportan métricas del clasificador de issues ni detalles del profesor zero-shot utilizado para destilarlo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como medición publicada. Como orientación de orden de magnitud, un transformer encoder de tamaño base en fp32 ocupa del orden de 0,5 GB de pesos y en fp16 la mitad; el repositorio completo pesa 0,9 GB, incluyendo los cuatro componentes.
- GPU recomendadas: no se especifican. Para los componentes transformer, cualquier GPU consumer reciente es sobradamente suficiente; para los modelos clásicos y el clasificador joblib, la CPU es la opción natural.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño del repositorio (0,9 GB en total) y la naturaleza encoder de los modelos. No requiere GPU de datacenter.
- Opciones de despliegue: al no publicarse versiones ONNX ni GGUF, la vía directa es `transformers` con PyTorch para los dos modelos de sentimiento, y `joblib`/`scikit-learn` para el clasificador de issues y las líneas base. vLLM y TGI no son adecuados para clasificadores encoder de este tipo; llama.cpp/Ollama no aplican sin conversión a GGUF. Un servicio FastAPI o un batch job en CPU es el patrón esperable.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni del RoBERTa ni del DistilRoBERTa ni del estudiante destilado. Cualquier cifra aportada en la documentación de un despliegue propio deberá medirse en el hardware objetivo.

## Comparativa con modelos similares

Comparativa interna de los componentes incluidos en el mismo repositorio (única con datos aportados por el autor):

| Componente | Base | Entrenamiento | Velocidad relativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `roberta_sentiment/` | RoBERTa | 72.000 reseñas Amazon Reviews 2023 | Referencia (mayor coste) | MIT | Incluido en el repo |
| `distilroberta_sentiment/` | DistilRoBERTa | Mismo esquema de entrenamiento | Más rápido y pequeño, según el autor | MIT | Incluido en el repo |
| `classical/` | TF-IDF + Naive Bayes y regresión logística | No especificado | El más rápido, ejecutable en CPU | MIT | Incluido en el repo |

Alternativas externas de la misma categoría (clasificación de sentimiento en inglés): `cardiffnlp/twitter-roberta-base-sentiment-latest` (tres clases, dominio redes sociales), `nlptown/bert-base-multilingual-uncased-sentiment` (cinco estrellas, multilingüe) y `distilbert-base-uncased-finetuned-sst-2-english` (dos clases, SST-2). No se dispone en la información proporcionada de sus parámetros, contextos ni métricas verificadas para establecer una comparación numérica; además, ninguna de ellas está especializada en reseñas de retail como ReviewGuard.

## Limitaciones y advertencias

- Ausencia total de métricas: no hay accuracy, F1 ni matriz de confusión publicadas, ni siquiera para justificar la elección de RoBERTa frente a DistilRoBERTa o frente a las líneas base incluidas en el mismo repositorio.
- Sesgo de dominio y de idioma: el entrenamiento sobre Amazon Reviews 2023 implica un registro lingüístico concreto (reseñas de producto en inglés) y un desbalance probable hacia opiniones positivas; el rendimiento fuera de ese dominio no está caracterizado.
- Longitud de entrada limitada: si los modelos son RoBERTa/DistilRoBERTa estándar, el máximo es de 512 tokens, por lo que reseñas largas se truncarán sin que el autor documente la estrategia de truncado.
- Solo tres clases de sentimiento: no se ofrece granularidad por estrellas ni intensidad, lo que limita el análisis fino de satisfacción.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de falsos positivos/negativos en la clasificación, especialmente en reseñas neutras o mixtas, que suelen ser la clase más difícil.
- Los umbrales de `photo_calibration.json` y `lexicon_bands.json` están calibrados para un dominio concreto; reutilizarlos sin recalibrar en otro corpus puede degradar las decisiones operativas.
- Seguridad al cargar `issue_student.joblib`: los ficheros joblib/pickle pueden ejecutar código arbitrario al deserializarse. Solo deben cargarse desde el repositorio oficial y verificando integridad.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta; no hay issues, discusiones ni terceros que hayan replicado resultados.
- Licencia MIT: permisiva para uso comercial, pero al no haber modelo card extendida no se documentan procedencias de datos más allá de "Amazon Reviews 2023", cuyos términos de uso deben verificarse por separado.
- Metadatos a revisar: las fechas del repositorio (creado y actualizado el 25 de octubre de 2026) resultan anómalas y conviene confirmar la vigencia real del contenido antes de integrarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Emirinth/ReviewGuard-models
- No se han encontrado en la búsqueda web enlaces relevantes al modelo, al proyecto ReviewGuard ni a la publicación de su autor; los resultados devueltos no guardan relación con el modelo y se han descartado. No hay paper, blog técnico, repositorio de código ni demo disponibles en la información proporcionada.
