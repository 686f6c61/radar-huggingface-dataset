# MrZVIL/bert-ner

## Resumen

bert-ner es un modelo de clasificación de tokens (token classification) orientado al reconocimiento de entidades nombradas (NER), publicado en HuggingFace por el usuario MrZVIL. Se trata de un ajuste fino (fine-tuning) del encoder BAAI/bge-small-en-v1.5, un transformer de tipo BERT de 33.215.625 parámetros, y se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones de atribución más allá de la propia licencia.

El modelo resuelve la tarea clásica de etiquetado secuencial: dado un texto, asigna a cada token una etiqueta de entidad. El entrenamiento se realizó con la librería Transformers (Trainer) durante 10 épocas, con learning rate 2e-05, batch de 16 y optimizador AdamW fused. Según la model card, en el conjunto de evaluación alcanza una F1 de 0,9115, precisión de 0,8956, recall de 0,9280, accuracy de 0,9608 y una pérdida de validación de 0,2551.

Su relevancia práctica radica en el tamaño: 33 millones de parámetros y un repositorio de 0,1 GB, lo que permite inferencia en CPU y en GPUs de gama baja con un coste mínimo. Ahora bien, la model card no documenta el dataset de entrenamiento, el conjunto de etiquetas ni los idiomas soportados, y el modelo acumula 0 descargas y 0 "likes", por lo que cualquier uso en producción exige una validación previa propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base BAAI/bge-small-en-v1.5) con cabeza de clasificación de tokens |
| Parametros totales | 33.215.625 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (máximo del modelo base; no especificado en la model card) |
| Tipos de cuantizacion | No disponible en la ficha; al ser safetensors se puede cuantizar a int8 o formatos GGUF con herramientas externas |
| Idiomas soportados | No disponible en la ficha; el modelo base es de inglés |
| Licencia | MIT |
| Formato de pesos | Safetensors |
| Pipeline | token-classification |
| Modelo base | BAAI/bge-small-en-v1.5 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT heredada del modelo base BAAI/bge-small-en-v1.5 (12 capas, 384 dimensiones ocultas, 12 cabezas de atención y 512 posiciones máximas), al que se le añade una cabeza lineal de clasificación de tokens sobre la representación de cada token. Es una arquitectura densa, sin mezcla de expertos (MoE), sin atención lineal y sin componentes de estado (SSM). El modelo base procede del ámbito de los embeddings de recuperación (retrieval), por lo que su encoder se ha reutilizado aquí para una tarea discriminativa de etiquetado.

El entrenamiento se realizó con el Trainer de Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1, con los siguientes hiperparámetros: learning rate 2e-05, train_batch_size 16, eval_batch_size 16, semilla 42, optimizador ADAMW_TORCH_FUSED con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y 10 épocas (625 pasos por época). La pérdida de entrenamiento bajó de 0,5575 en la época 1 a 0,1557 en la época 7, mientras que la pérdida de validación se estabilizó en torno a 0,254-0,255 desde la época 5, lo que sugiere un cierto sobreajuste al final del entrenamiento. No hay información sobre el dataset utilizado, su composición, el esquema de etiquetas ni sobre el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Clasificación de tokens y reconocimiento de entidades nombradas (NER) sobre texto en formato de entrada estándar de Transformers.
- Etiquetado a nivel de token con salida de logits por token, apto para extracción de entidades y anonimización.
- Integración directa con la librería transformers y con la pipeline `token-classification`.
- Compatible con endpoints gestionados (etiqueta `endpoints_compatible` en el repositorio).
- Reutilizable como punto de partida para fine-tuning adicional en dominios específicos.
- No dispone de generación de texto: no es un modelo causal ni instructivo.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües: no disponibles; el modelo base es de inglés y la ficha no declara idiomas.

## Casos de uso

- Extracción de entidades en pipelines de NLP: el modelo se puede insertar como etapa de etiquetado para detectar personas, organizaciones o lugares en textos ingleses, siempre que se verifique antes el esquema de etiquetas real del checkpoint.
- Anonimización y seudonimización de datos: en el preprocesado de logs, correos o historiales antes de almacenarlos o compartirlos, sustituyendo las entidades detectadas por marcadores. Requiere validar el recall sobre el dominio concreto para evitar fugas de datos personales.
- Enriquecimiento de motores de búsqueda internos: extraer entidades de documentos para construir índices facetados o filtros estructurados que mejoren la recuperación.
- Preprocesado para sistemas RAG: etiquetar entidades en los fragmentos de documento para enlazarlos con bases de conocimiento o grafos, aportando contexto estructurado antes de la generación.
- Etiquetado asistido y active learning: usar el modelo como anotador preliminar en un flujo de anotación humana, reduciendo el coste por documento gracias a una F1 de 0,9115 sobre el conjunto de evaluación del autor.
- Clasificación de documentos empresariales: detección de menciones de clientes, proveedores o sedes en contratos e informes, con revisión manual posterior dado que la evaluación no está documentada.
- Prototipado en entornos sin GPU: con 33 millones de parámetros se puede ejecutar en CPU o en una GPU de gama baja, lo que permite validar la viabilidad de una funcionalidad NER antes de invertir en modelos mayores.
- Baseline para comparativas internas: servir como referencia de bajo coste frente a modelos NER más grandes (por ejemplo, BERT-base o RoBERTa-large) en una evaluación propia del dominio.

## Benchmarks y rendimiento

El model-index de la model card está vacío (`results: []`), por lo que no hay benchmarks oficiales publicados (MMLU, HumanEval, GSM8K u otros no aplican a un modelo de clasificación de tokens). Los únicos datos disponibles son las métricas de evaluación declaradas por el autor sobre un conjunto de evaluación no documentado:

| Metrica | Valor |
|---|---|
| Loss | 0,2551 |
| Precision | 0,8956 |
| Recall | 0,9280 |
| F1 | 0,9115 |
| Accuracy | 0,9608 |

Evolución durante el entrenamiento (datos de la model card):

| Training loss | Epoca | Step | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|---|
| 0,5575 | 1.0 | 625 | 0,4669 | 0,7660 | 0,8245 | 0,7942 | 0,9437 |
| 0,3300 | 2.0 | 1250 | 0,3211 | 0,8693 | 0,9047 | 0,8867 | 0,9557 |
| 0,2966 | 3.0 | 1875 | 0,2744 | 0,8771 | 0,9192 | 0,8977 | 0,9580 |
| 0,1815 | 4.0 | 2500 | 0,2647 | 0,8937 | 0,9215 | 0,9074 | 0,9594 |
| 0,1678 | 5.0 | 3125 | 0,2578 | 0,8947 | 0,9270 | 0,9106 | 0,9598 |
| 0,1734 | 6.0 | 3750 | 0,2544 | 0,8951 | 0,9263 | 0,9105 | 0,9604 |
| 0,1557 | 7.0 | 4375 | 0,2551 | 0,8956 | 0,9280 | 0,9115 | 0,9608 |

No se dispone de comparación con otros modelos sobre el mismo conjunto de evaluación, ni de resultados desglosados por tipo de entidad.

## Requisitos de hardware

- VRAM estimada en inferencia: aproximadamente 133 MB en fp32, 66 MB en fp16/bf16 y en torno a 33 MB en int8, sin contar el overhead del runtime (típicamente unos cientos de MB en PyTorch).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente (GTX 1650, RTX 3060, T4). Modelos como A100 o H100 no aportan ventaja relevante para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada e incluso en iGPU modernas.
- Ejecución en CPU: viable; el modelo es lo bastante pequeño para servir peticiones en CPU con throughput moderado, aunque no se han publicado mediciones.
- Opciones de despliegue: pipeline de transformers, contenedores con FastAPI o TorchServe, exportación a ONNX Runtime y endpoints gestionados de HuggingFace (el repositorio incluye la etiqueta `endpoints_compatible`). vLLM, TGI, llama.cpp y Ollama no están orientados a clasificación de tokens; su uso requeriría conversiones y no es el camino recomendado.
- Latencia y throughput: no disponible (no se han publicado mediciones en la información disponible).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Idioma | Rendimiento |
|---|---|---|---|---|---|---|
| MrZVIL/bert-ner | 33,2 M | 512 tokens | Clasificación de tokens (NER) | MIT | No disponible (base en inglés) | F1 0,9115 sobre un conjunto de evaluación no documentado |
| dslim/bert-base-NER | 108 M | 512 tokens | Clasificación de tokens (NER) | MIT | Inglés | No disponible |
| BAAI/bge-small-en-v1.5 | 33 M | 512 tokens | Embeddings y recuperación (no NER) | MIT | Inglés | No comparable (no realiza NER) |

Los datos de los modelos alternativos proceden de sus fichas públicas y no se han verificado en esta comparativa. No existe una evaluación conjunta sobre el mismo conjunto de datos, por lo que no es posible establecer una comparación de rendimiento fiable entre ellos. Otras alternativas de la categoría serían BERT-base ajustado para NER o modelos NER multilingües de tipo XLM-R, para los que no se dispone de datos en la información proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica "unknown dataset" y deja en "More information needed" las secciones de descripción, usos previstos y datos de entrenamiento. Se desconoce el esquema de etiquetas y el dominio cubierto.
- Métricas sin contextualizar: la F1 de 0,9115 se ha medido sobre un conjunto de evaluación no descrito, por lo que no es extrapolable a dominios ni idiomas distintos.
- Señales de sobreajuste: la pérdida de validación deja de mejorar a partir de la época 5 mientras la pérdida de entrenamiento sigue bajando hasta 0,1557 en la época 7.
- Idioma: el modelo base (BAAI/bge-small-en-v1.5) es de inglés y la ficha no declara idiomas soportados; no hay evidencia de funcionamiento en castellano.
- Sesgos: no hay información publicada sobre sesgos demográficos, culturales o de dominio en los datos de entrenamiento.
- Alucinación: al ser un modelo discriminativo no genera texto, pero puede producir falsos positivos, detectar entidades inexistentes o errar los límites de las menciones, especialmente en textos fuera de distribución.
- Licencia: MIT permite uso comercial, modificación y redistribución, pero se ofrece sin garantías; conviene conservar el aviso de copyright y verificar las condiciones del modelo base.
- Validación comunitaria nula: 0 descargas y 0 "likes" en el momento de la consulta, sin issues ni evaluaciones independientes que respalden su calidad.
- Model card autogenerada: el propio autor advierte de que el documento se generó automáticamente y debería revisarse.
- Advertencia operativa: para cualquier uso en producción con datos personales, calibrar los umbrales de confianza y auditar el recall por tipo de entidad sobre datos propios antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MrZVIL/bert-ner
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Referencia de la arquitectura BERT: https://arxiv.org/abs/1810.04805
- No se han encontrado enlaces relevantes adicionales en la búsqueda web; los resultados devueltos no guardaban relación con el modelo (enlaces de Google Maps en francés).
