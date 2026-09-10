# heidercs/xlmroberta-cv-direct

## Resumen

heidercs/xlmroberta-cv-direct es un modelo de clasificación de texto obtenido por fine-tuning de FacebookAI/xlm-roberta-base sobre un corpus de currículums traducidos al español. Su tarea es asignar cada documento a una de 43 categorías profesionales, procesando únicamente los primeros 512 tokens del CV (sin fragmentación ni chunking). Lo publica el usuario heidercs y se posiciona explícitamente como el modelo de referencia o comparación dentro de una pareja de modelos; para uso en producción el propio autor recomienda la variante heidercs/xlmroberta-cv-chunked.

Técnicamente es un transformer encoder de tipo RoBERTa multilingüe, con 278.076.715 parámetros totales (modelo denso, sin mezcla de expertos) y una ventana de 512 tokens. El repositorio ocupa 1,1 GB y los pesos se distribuyen en formato safetensors. Está pensado exclusivamente para español y su cabecera de clasificación devuelve 43 etiquetas profesionales.

Su relevancia es acotada pero concreta: es un ejemplo reproducible de pipeline de clasificación documental (traducción con MarianMT y fine-tuning de un encoder multilingüe) y sirve como línea base cuantificada frente a la variante con chunking. El autor publica métricas de test desglosadas por longitud de documento, lo que permite estimar de antemano la pérdida de exactitud al truncar a 512 tokens. No tiene descargas ni likes registrados, por lo que no existe validación externa de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (XLM-RoBERTa base) con cabecera de clasificación de secuencias |
| Parametros totales | 278.076.715 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (el resto del documento se descarta) |
| Tipos de cuantizacion | no disponible; no se publican variantes cuantizadas (el repositorio de 1,1 GB es coherente con pesos en fp32) |
| Idiomas soportados | español (es); el modelo base es multilingüe, pero el fine-tuning solo se declara para español |
| Licencia | other (la licencia de redistribución del corpus de origen depende de sus términos; revisar antes de uso comercial) |
| Formato de pesos | safetensors |
| Etiquetas de salida | 43 categorías profesionales |
| Pipeline | text-classification |
| Modelo base | FacebookAI/xlm-roberta-base |
| Tamano del repositorio | 1,1 GB |
| Fecha de creacion / actualizacion | 10 de septiembre de 2026 (ambas) |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa base: un transformer encoder con normalización previa, embeddings posicionales aprendidos y atención completa, adaptado a clasificación mediante una capa lineal sobre el token especial de clasificación. El fine-tuning parte de los pesos de FacebookAI/xlm-roberta-base y añade una cabeza de 43 salidas, una por categoría profesional. No hay decodificación autoregresiva, atención lineal, decodificación especulativa ni mecanismos de expertos: es un clasificador discriminativo estándar.

Los datos de entrenamiento proceden de un corpus público de currículums en inglés con 43 categorías, traducido al español con MarianMT. El reparto documentado es de 6.195 documentos de entrenamiento y 2.681 de test. La model card no detalla el número de épocas, la tasa de aprendizaje, el optimizador, si hubo búsqueda de hiperparámetros ni si se aplicó algún tipo de ajuste adicional (RLHF, DPO u otros). Tampoco especifica la composición exacta del corpus de origen ni su licencia de redistribución, un punto relevante porque la traducción automática de un corpus en inglés introduce ruido léxico (nombres propios, cargos, instituciones) que no se ha medido de forma separada. La innovación metodológica destacable es, precisamente, la estrategia de truncado directo a 512 tokens, evaluada de forma explícita por segmentos de longitud.

## Capacidades

- Clasificación de texto en español: asigna un currículum a una de 43 categorías profesionales y devuelve probabilidades por clase mediante softmax.
- Procesamiento de documentos de hasta 512 tokens por pasada, equivalente aproximado a 1,5 páginas de texto.
- Inferencia determinista y ligera: al ser un encoder de 278M de parámetros, permite clasificación por lotes con alto rendimiento en hardware modesto.
- Multilingüismo residual: el modelo base cubre un centenar de idiomas, pero el fine-tuning solo está validado y declarado para español.
- Trazabilidad de la confianza: la salida incluye distribución de probabilidad, lo que permite fijar umbrales de rechazo o derivar a revisión humana.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking), visión, audio ni generación de texto libre.
- No genera resúmenes, extracciones estructuradas ni respuestas conversacionales: su única salida es la etiqueta y su probabilidad.

## Casos de uso

- Triaje de candidaturas en un ATS: cada CV recibido se clasifica en una de las 43 categorías para enrutarlo automáticamente al reclutador especializado correspondiente, usando la probabilidad máxima como criterio de confianza.
- Etiquetado retroactivo de bases de datos de CV: clasificación por lotes de repositorios históricos de currículums para poblar campos de categoría profesional que nunca se rellenaron.
- Preanotación para revisión humana: el modelo genera una etiqueta inicial y el equipo de anotación solo corrige los casos con baja confianza, reduciendo el coste de etiquetado manual.
- Analítica de mercado laboral: agregación de la distribución de perfiles por categoría en un conjunto de CV para informes de demanda sectorial.
- Enrutado en portales de empleo y marketplaces: asignación de un CV a un vertical de ofertas (por ejemplo, perfil técnico frente a administrativo) antes de aplicar sistemas de recomendación más costosos.
- Filtrado previo en pipelines de selección masiva: descarte o priorización de candidaturas en procesos con miles de documentos por vacante, aprovechando el bajo coste computacional del encoder.
- Línea base de investigación y comparación de métodos: sirve como referencia cuantificada para medir la ganancia de estrategias con chunking o de modelos de mayor tamaño en la misma tarea, dado que el autor publica métricas por segmento de longitud.

## Benchmarks y rendimiento

Métricas publicadas en la model card sobre un test de 2.681 documentos (evaluación única):

| Segmento | Documentos | Accuracy | F1 macro |
|---|---:|---:|---:|
| Global | 2.681 | 81,4% | 0,803 |
| Cortos (≤512 tokens) | 1.097 | 85,0% | 0,820 |
| Largos (>512 tokens) | 1.584 | 78,9% | 0,773 |

El desglose muestra una caída de 6,1 puntos de accuracy entre documentos que caben en la ventana y documentos truncados, efecto directo de descartar todo el contenido posterior al token 512. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K ni similares) en la información disponible, ni comparaciones numéricas con la variante heidercs/xlmroberta-cv-chunked, que el autor describe como de mejor resultado sin aportar cifras.

## Requisitos de hardware

- VRAM estimada: en torno a 1,1 GB para los pesos en fp32 y aproximadamente 2 GB considerando activaciones y lotes pequeños; alrededor de 0,6 GB si se convierte a fp16 y 0,3 GB en int8.
- GPU recomendadas: cualquier GPU con 4 GB o más, como GTX 1650, RTX 3060, RTX 4090 o T4 en cloud. Modelos de datacenter (A100, H100) son innecesarios salvo para lotes muy grandes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada de los últimos ocho años; también es viable la inferencia en CPU con lotes moderados.
- Opciones de despliegue: transformers con PyTorch, ONNX Runtime o TorchScript para reducir latencia, y servicios de inferencia compatibles con text-classification. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son aplicables sin una conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada; no se publican mediciones de tokens por segundo ni de documentos por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea y metricas | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| heidercs/xlmroberta-cv-direct | 278.076.715 | 512 tokens | Clasificación de CV en 43 categorías; 81,4% accuracy global, F1 macro 0,803 | other | HuggingFace, safetensors, 0 descargas |
| heidercs/xlmroberta-cv-chunked | misma arquitectura (no se detalla el recuento exacto) | no disponible | Misma tarea; el autor indica mejor resultado, sin cifras publicadas | no disponible | HuggingFace |
| FacebookAI/xlm-roberta-base | 278M (aproximado) | 512 tokens | Modelo base multilingüe sin cabecera de clasificación; no resuelve esta tarea sin fine-tuning | no disponible en la información consultada | HuggingFace |
| BETO (bert-base-spanish-wwm-uncased) | 110M (aproximado) | 512 tokens | Encoder en español para fine-tuning; no está ajustado a esta taxonomía de 43 categorías | no disponible en la información consultada | HuggingFace |

No se dispone de comparaciones numéricas directas con alternativas evaluadas sobre el mismo test de 2.681 documentos, por lo que la comparativa se limita a parámetros, contexto y naturaleza de la tarea.

## Limitaciones y advertencias

- Truncado a 512 tokens: todo el contenido posterior se descarta, lo que provoca una caída medible de accuracy del 85,0% al 78,9% entre documentos cortos y largos. En CVs de más de página y media, la clasificación se basa solo en el encabezado y la primera experiencia.
- Ruido de traducción: el corpus de entrenamiento son currículums en inglés traducidos con MarianMT, no CVs nativos en español. Los giros, cargos y denominaciones reales del mercado español pueden no estar bien representados.
- Corpus no verificado para uso comercial: la licencia del modelo figura como "other" y la propia model card advierte de que la licencia de redistribución del corpus de origen depende de sus términos publicados. Es necesario revisarla antes de cualquier explotación comercial.
- Sesgos potenciales: al derivar de un corpus público de CV en inglés traducido, puede heredar desequilibrios de género, origen o sector presentes en el corpus original. No se publica ninguna evaluación de sesgos.
- Espacio de etiquetas cerrado: solo admite las 43 categorías del entrenamiento, sin clase "otros" documentada ni mecanismo para rechazar entradas fuera de dominio.
- Riesgo de clasificaciones erróneas silenciosas: el modelo siempre devuelve una etiqueta con una probabilidad asociada; sin umbrales de confianza calibrados, los errores pasan desapercibidos en un pipeline automático.
- Sin validación externa: cero descargas y cero likes en HuggingFace, sin informes de terceros que reproduzcan las métricas declaradas.
- No apto para generación, razonamiento, código, matemáticas, visión, tool calling ni agentes; cualquier expectativa en ese sentido queda fuera del alcance del modelo.
- El propio autor recomienda heidercs/xlmroberta-cv-chunked para producción, lo que sitúa a este modelo como referencia de comparación y no como opción final.
- No se publican detalles de entrenamiento (épocas, hiperparámetros, semillas), lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/heidercs/xlmroberta-cv-direct
- Variante recomendada por el autor para producción: https://huggingface.co/heidercs/xlmroberta-cv-chunked
- Modelo base: https://huggingface.co/xlm-roberta-base

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo ni sobre su autor; los resultados obtenidos correspondían a sitios de streaming de series asiáticas y no guardan relación con el contenido de esta ficha.
