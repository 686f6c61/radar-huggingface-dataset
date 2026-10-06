# Iyamurinze/afriberta-kinyarwanda-sentiment

## Resumen

afriberta-kinyarwanda-sentiment es un modelo de clasificación de texto obtenido por ajuste fino (*fine-tuning*) del modelo base `castorini/afriberta_large`, orientado a análisis de sentimiento en kinyarwanda. Lo publica el usuario Iyamurinze en HuggingFace bajo licencia MIT y con la librería transformers. El repositorio tiene 125.633.283 parámetros reales (según los pesos en safetensors), lo que corresponde a la arquitectura XLM-RoBERTa declarada en las etiquetas del modelo, más una cabeza de clasificación para la tarea.

El problema que aborda es concreto: la escasez de recursos de PLN para lenguas africanas de bajos recursos, en este caso el kinyarwanda, para una tarea supervisada de clasificación de sentimiento. El modelo parte de un encoder multilingüe preentrenado sobre lenguas africanas y se ajusta con un conjunto de datos que la propia model card no describe ("unknown dataset"), por lo que el dominio y el número de clases no están documentados.

La relevancia actual es limitada y debe contextualizarse: el modelo fue generado automáticamente por el `Trainer` de HuggingFace (etiqueta `generated_from_trainer`), no tiene descargas ni likes, la model card está sin completar y su rendimiento declarado en el conjunto de evaluación es modesto (accuracy 0,6355 y F1 0,6378). Es un artefacto útil como punto de partida o como referencia de reproducción, no un modelo listo para producción sin validación adicional. Fechas de creación y actualización registradas en el repositorio: 2026-10-06.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer) con cabeza de clasificación de texto; etiqueta `xlm-roberta` en HuggingFace |
| Parametros totales | 125.633.283 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base XLM-RoBERTa admite hasta 512 tokens; no confirmado por el autor) |
| Tipos de cuantizacion | no declarados por el autor; al ser un encoder de 125,6 M de parámetros es viable FP16, INT8 y 4 bits con herramientas estándar (bitsandbytes, ONNX Runtime, Optimum) |
| Idiomas soportados | no disponible en las etiquetas del repositorio; la tarea declarada es kinyarwanda, pero el autor no documenta la cobertura lingüística |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | castorini/afriberta_large (fine-tuning) |
| Tamano del repositorio | 0,5 GB |
| Compatibilidad de despliegue | `text-embeddings-inference`, `endpoints_compatible` (etiquetas del repositorio) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un encoder transformer de tipo XLM-RoBERTa con 125,6 M de parámetros totales, sobre el que se añade una cabeza de clasificación (la model card no especifica el número de etiquetas ni si la tarea es binaria o multiclase). El entrenamiento se realizó con el `Trainer` de HuggingFace sobre un conjunto de datos que el autor no documenta; la model card indica literalmente "unknown dataset" y deja en "More information needed" las secciones de descripción, usos previstos y datos de entrenamiento y evaluación.

Los hiperparámetros sí están documentados: 3 épocas, tasa de aprendizaje 2e-05, `train_batch_size` 16, `eval_batch_size` 32, semilla 42, optimizador `ADAMW_TORCH_FUSED` con betas (0,9; 0,999) y epsilon 1e-08, y planificador lineal sin argumentos adicionales del optimizador. La pérdida de entrenamiento baja de 0,8610 a 0,5314 entre la época 1 y la 3, mientras que la pérdida de validación repunta en la última época (0,8657 en la época 2 frente a 0,9643 en la época 3), un patrón compatible con sobreajuste incipiente. No se documenta ningún uso de RLHF, DPO ni ninguna innovación técnica adicional (atención lineal, decodificación especulativa, etc.). Versiones de framework declaradas: Transformers 5.18.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.2.

## Capacidades

- Clasificación de texto (análisis de sentimiento) como tarea principal, según el pipeline declarado `text-classification`.
- Inferencia de sentimiento sobre texto en kinyarwanda, aunque la cobertura idiomática no está documentada por el autor.
- Integración directa con la librería transformers mediante `pipeline` y con `text-embeddings-inference`.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que permite servirlo en infraestructuras de inferencia gestionadas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, audio ni modo "thinking"; un encoder de clasificación no genera texto libre.
- Capacidades multilingües: no disponibles (el autor no declara la lista de idiomas).

## Casos de uso

- Moderación de comentarios en redes sociales o foros en kinyarwanda: el modelo asigna una etiqueta de sentimiento a cada mensaje entrante, lo que permite priorizar la revisión humana de los textos negativos. Adecuado por su naturaleza de clasificador ligero, no por su precisión, que exige validación previa.
- Monitorización de opinión pública: procesamiento por lotes de tuits, comentarios o noticias en kinyarwanda para agregar la polaridad por día o por tema. El tamaño de 125,6 M de parámetros permite procesar grandes volúmenes en CPU o en una única GPU pequeña.
- Enrutamiento de tickets de soporte: usar la etiqueta de sentimiento como señal para derivar los casos negativos a agentes senior o a colas prioritarias, combinándolo con reglas de negocio.
- Análisis de reseñas de producto o servicios locales: extracción de polaridad sobre reseñas en kinyarwanda para paneles de calidad percibida, siempre que se valide el rendimiento en el dominio concreto antes de usarlo.
- Componente de un pipeline de PLN más amplio: como paso intermedio de clasificación dentro de un sistema que después aplique traducción, resumen o extracción de entidades con otros modelos.
- Investigación y reproducción académica: sirve como punto de partida para comparativas de ajuste fino de encoders multilingües en lenguas africanas de bajos recursos, dado que expone los hiperparámetros completos y la curva de validación.
- Etiquetado asistido (*pre-labeling*): generar etiquetas preliminares sobre un corpus no anotado de kinyarwanda para acelerar el trabajo de anotadores humanos, con revisión obligatoria dado el nivel de precisión declarado.

## Benchmarks y rendimiento

El model-index del repositorio está vacío (`results: []`), por lo que no hay benchmarks estandarizados (MMLU, HumanEval, GSM8K y similares no aplican a un clasificador). Los únicos datos disponibles son los de evaluación declarados por el autor para su propio conjunto de validación:

| Metrica | Valor en el conjunto de evaluacion |
|---|---|
| Loss | 0,9079 |
| Accuracy | 0,6355 |
| Precision | 0,6381 |
| Recall | 0,6375 |
| F1 | 0,6378 |

Evolución durante el entrenamiento (datos declarados por el autor):

| Training loss | Epoca | Paso | Validation loss | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|---|---|---|
| 0,8610 | 1,0 | 207 | 0,8860 | 0,5985 | 0,6300 | 0,5825 | 0,5882 |
| 0,7159 | 2,0 | 414 | 0,8657 | 0,6276 | 0,6304 | 0,6259 | 0,6278 |
| 0,5314 | 3,0 | 621 | 0,9643 | 0,6348 | 0,6410 | 0,6308 | 0,6346 |

No se han publicado en la información disponible resultados comparativos con otros modelos sobre el mismo conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 0,5 GB (125,6 M de parámetros × 4 bytes); en FP16, unos 0,25 GB; en INT8, unos 0,13 GB; en 4 bits, alrededor de 0,06 GB. A estas cifras hay que sumar el *overhead* del runtime y de los tensores de activación, que en lotes pequeños es reducido.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente. Una NVIDIA RTX 3060, RTX 4060, RTX 4090 o una T4 bastan holgadamente; modelos de datacenter como A100 o H100 solo tendrían sentido para servir lotes muy grandes en paralelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU discreta moderna e incluso en iGPU con suficiente memoria compartida.
- Ejecución en CPU: viable para inferencia y para lotes moderados, dado el reducido tamaño del modelo.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (etiqueta declarada en el repositorio), servidores de endpoints compatibles, y exportación a ONNX u otros formatos de inferencia mediante Optimum. No se declara soporte de GGUF ni de llama.cpp, que no son el formato habitual para un encoder de clasificación.
- Latencia y throughput: no disponibles; el autor no publica mediciones. Como referencia cualitativa, un encoder de 125 M de parámetros en FP16 sobre una GPU de consumo procesa lotes de decenas o cientos de secuencias cortas por segundo, pero no hay datos verificados en la información proporcionada.

## Comparativa con modelos similares

No hay datos de rendimiento comparables publicados para este modelo. La comparación se limita a características estructurales; los recuentos de parámetros de los modelos alternativos corresponden a las implementaciones de referencia públicas y pueden variar ligeramente según la fuente.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Iyamurinze/afriberta-kinyarwanda-sentiment | 125,6 M | no disponible | Clasificación de sentimiento en kinyarwanda | MIT | HuggingFace |
| castorini/afriberta_large (modelo base) | 125,6 M aprox. | 512 tokens (arquitectura XLM-R) | Encoder multilingüe para lenguas africanas | no disponible | HuggingFace |
| xlm-roberta-base | 278 M aprox. | 512 tokens | Encoder multilingüe de propósito general | MIT | HuggingFace |
| bert-base-multilingual-cased (mBERT) | 178 M aprox. | 512 tokens | Encoder multilingüe de propósito general | Apache 2.0 (implementación de referencia) | HuggingFace |

Criterio de elección: frente a un ajuste fino sobre XLM-R base o mBERT, este modelo parte de un encoder preentrenado específicamente sobre lenguas africanas, lo que en principio puede favorecer la representación del kinyarwanda; sin embargo, no hay evidencia publicada en la información disponible que confirme esa ventaja en la tarea de sentimiento. Tampoco se dispone de comparativas con otros clasificadores de sentimiento en kinyarwanda.

## Limitaciones y advertencias

- Rendimiento modesto: accuracy 0,6355 y F1 0,6378 en el conjunto de evaluación del propio autor. Para muchas aplicaciones reales esto es insuficiente sin ajuste adicional o sin una capa de validación humana.
- Conjunto de datos no documentado: la model card indica "unknown dataset". Se desconoce el dominio, el tamaño, el equilibrio entre clases y el idioma exacto de los textos, lo que impide evaluar la validez ecológica del modelo.
- Sobreajuste probable: la pérdida de validación sube en la tercera época (de 0,8657 a 0,9643) mientras la de entrenamiento sigue bajando (de 0,7159 a 0,5314).
- Riesgo de alucinación: no aplica en el sentido generativo (es un clasificador), pero sí existe riesgo de clasificaciones erróneas y sesgadas, especialmente en textos fuera del dominio de entrenamiento.
- Sesgos conocidos: no documentados por el autor. Un modelo entrenado con datos no especificados puede heredar sesgos de dominio, registro, dialecto o temática.
- Limitaciones de contexto e idioma: la longitud máxima de secuencia y la cobertura de variantes dialectales del kinyarwanda no están declaradas.
- Sin mantenimiento ni uso demostrado: 0 descargas y 0 likes en el momento de la consulta; la model card está generada automáticamente y sin revisar, con secciones clave marcadas como "More information needed".
- Licencia: MIT, lo que permite uso comercial y modificación, pero conviene verificar la licencia y las condiciones del modelo base `castorini/afriberta_large` antes de un despliegue comercial, ya que no se especifica en la información disponible.
- Advertencia para producción: no se recomienda su uso directo en sistemas críticos sin una evaluación propia sobre datos representativos del dominio objetivo y sin un plan de monitorización del rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Iyamurinze/afriberta-kinyarwanda-sentiment
- Modelo base: https://huggingface.co/castorini/afriberta_large
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en los resultados de la búsqueda web proporcionados; dichos resultados no contenían información relacionada con el modelo.
