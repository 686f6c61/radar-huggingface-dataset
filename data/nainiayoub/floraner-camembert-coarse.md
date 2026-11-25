# nainiayoub/FloraNER-camembert-coarse

## Resumen

FloraNER-camembert-coarse es un modelo de reconocimiento de entidades nombradas (NER) especializado en texto botanico en frances. Se trata de un ajuste fino (fine-tuning) de `almanach/camembert-base`, un transformer encoder de tipo RoBERTa adaptado al frances, sobre el conjunto de datos FloraNER, que anota con supervision distante texto botanico procedente de la *Flore de la Nouvelle-Caledonie*. El modelo resuelve la tarea de identificar dos tipos de entidades: `ORGANE` (organos o partes de la planta) y `DESCRIPTEUR` (cualquier descriptor morfologico), en una variante de granularidad gruesa (coarse).

El modelo lo desarrolla nainiayoub (Ayoub Nainia) y esta vinculado a dos publicaciones academicas: el articulo de datos FloraNER en *Data in Brief* (2024) y un trabajo de pipeline NLP con CamemBERT presentado en NLPI 2024. Con 110 millones de parametros, es un modelo ligero y rapidamente desplegable (el autor reporta 4 minutos de entrenamiento en una RTX 4000 Ada), pensado para tareas de extraccion de informacion botanica y biodiversidad.

Su relevancia radica en la escasez de recursos NLP especializados en dominios cientificos concretos. La mayoria de modelos NER genericos no capturan la terminologia morfologica vegetal, por lo que este modelo cubre un nicho util para herbarios digitales, bases de datos de biodiversidad y proyectos de digitalizacion de floras. La licencia MIT facilita su adopcion tanto en investigacion como en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (CamemBERT, basado en RoBERTa) |
| Parametros totales | 110.035.205 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (maximo de CamemBERT); ventanas de entrenamiento de 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | frances (fr) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `camembert-base`, un transformer encoder de 12 capas y 110 millones de parametros derivado de la arquitectura RoBERTa y preentrenado sobre un corpus frances de gran tamano. Sobre esa base se anade una cabeza de clasificacion de tokens para etiquetado BIO con dos clases de entidad (`ORGANE` y `DESCRIPTEUR`) mas la clase exterior.

El ajuste fino se realizo durante 8 epocas con tasa de aprendizaje 3e-05, tamano de lote 16, optimizador AdamW con decaimiento de peso 0.01 y precision bf16, seleccionando la mejor epoca por F1 en el conjunto de test. Las entradas son los parrafos liberados en el dataset, divididos en ventanas de como maximo 256 tokens, lo que resulta en 1280 ventanas de entrenamiento y 327 de test. Las etiquetas se alinean a nivel de token de CamemBERT a partir de los desplazamientos de caracteres del dataset. El entrenamiento completo duro 4 minutos en una GPU de portatil RTX 4000 Ada. La anotacion del dataset es de tipo distante (basada en lexicos), lo que condiciona el techo de recall del modelo.

## Capacidades

- Reconocimiento de entidades nombradas en texto botanico frances, con dos tipos de entidad: organos de la planta (`ORGANE`) y descriptores morfologicos (`DESCRIPTEUR`).
- Etiquetado a nivel de token con esquema BIO y agregacion de entidades mediante `aggregation_strategy="simple"` en el pipeline de transformers.
- Procesamiento de parrafos descriptivos de flora (morfologia, medidas, disposicion de organos, colores, formas).
- Capacidad multilingue limitada exclusivamente al frances; no soporta otros idiomas.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision, audio ni modo de pensamiento (thinking mode). Es un modelo puramente discriminativo de etiquetado.

## Casos de uso

- Digitalizacion de floras y herbarios: procesar texto OCR de descripciones botanicas historicas para extraer automaticamente organos y descriptores morfologicos, facilitando la estructuracion de la informacion en bases de datos consultables.
- Construccion de bases de datos de biodiversidad: enriquecer registros de especies con atributos morfologicos extraidos de la literatura, alimentando portales como GBIF o sistemas de gestion de colecciones botanicas.
- Extraccion de informacion para taxonomia asistida: identificar menciones de organos (hojas, flores, frutos) y sus descriptores (forma, tamano, color) para apoyar la descripcion comparada de taxones.
- Indexacion semantica de publicaciones cientificas: etiquetar articulos y monografias botanicas para mejorar la busqueda por caracteres morfologicos concretos.
- Preprocesamiento en pipelines de mineria de literatura: como primer paso de un pipeline NLP mas amplio (junto con modelos de especies o de reconocimiento de taxones) para la extraccion de conocimiento botanico.
- Herramientas de asistencia a botanicos: resaltar entidades en visores de documentos o editores de descripciones para facilitar la revision manual y la anotacion asistida.
- Enriquecimiento de catalogos de viveros o jardines botanicos: extraer descripciones morfologicas de fichas tecnicas en frances para normalizar y comparar caracteristicas entre especies.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre el split de test de FloraNER (variante coarse), con metricas a nivel de entidad (seqeval, coincidencia BIO estricta):

| Ambito | Precision | Recall | F1 |
|---|---|---|---|
| Todas las entidades | 90,9 | 95,5 | 93,1 |
| descriptor | 87,7 | 92,2 | 89,9 |
| organ | 93,5 | 98,1 | 95,8 |

Soporte del conjunto de test: 3938 entidades `descriptor` y 4861 entidades `organ`. El autor senala que las cifras de los articulos originales (F1 0,96 para especies y 0,94 para terminos de granularidad fina en el pipeline CamemBERT de NLPI 2024) se reportan alli y no son directamente comparables con estas, ya que este modelo se reentreno desde los splits liberados.

## Requisitos de hardware

- Inferencia en CPU: viable para volumentes moderados gracias a los 110 millones de parametros; el modelo ocupa aproximadamente 0,4 GB en safetensors (unos 440 MB en fp32), por lo que cabe en cualquier maquina.
- VRAM estimada en GPU: menos de 1 GB en fp16/bf16 para inferencia por lotes pequenos; margen amplio para lotes mayores.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien A100 o H100 si se integra en un servicio de alto rendimiento, aunque estan sobredimensionadas para este modelo.
- Cabe en cualquier GPU consumer, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: pipeline de `transformers`, `vLLM` no aplica (no es un modelo generativo), `TGI` con soporte de token-classification, `ONNX Runtime` tras exportacion, o servicio HTTP propio con FastAPI. Tambien es posible exportar a ONNX para inferencia en CPU optimizada.
- Latencia y throughput: no se han publicado mediciones formales; el entrenamiento en 4 minutos en una RTX 4000 Ada sugiere una inferencia del orden de milisegundos por ventana de 256 tokens en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FloraNER-camembert-coarse | 110 M | 512 tokens | NER botanico frances (coarse) | MIT | Hugging Face |
| camembert-base (base sin ajustar) | 110 M | 512 tokens | Modelo de lenguaje enmascarado | MIT | Hugging Face |
| Modelos NER genericos multilingues (p. ej. XLM-R base) | ~278 M | 512 tokens | NER generico | MIT | Hugging Face |
| spaCy modelos de referencia de FloraNER (articulo de datos) | no disponible | no disponible | NER botanico frances | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la informacion proporcionada; las cifras de los modelos de referencia de spaCy se mencionan en el articulo de datos pero no se incluyen sus valores numericos en la informacion disponible.

## Limitaciones y advertencias

- La anotacion del dataset es distante (basada en lexicos), por lo que las etiquetas de referencia omiten algunas entidades y el modelo hereda ese techo de recall; las metricas se miden contra esas mismas etiquetas distantes.
- La fuente es una unica flora regional (Nouvelle-Caledonie); el vocabulario de otras floras puede quedar parcialmente sin cubrir.
- Los tipos de descriptor con pocos ejemplos (posicion, disposicion, desarrollo) son menos fiables.
- Solo soporta frances; no es util para texto botanico en castellano u otros idiomas sin reentrenamiento.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de falsos positivos y negativos en la deteccion de entidades, especialmente en textos con terminologia no vista.
- Licencia MIT: permite uso comercial y modificacion, pero conviene conservar la atribucion y revisar las condiciones de los datos de origen (FloraNER) si se redistribuye.
- No es un modelo generativo: no puede responder preguntas ni razonar; su unico uso es el etiquetado de tokens.
- El modelo fue reentrenado para la demo a partir de los splits liberados, por lo que sus cifras no coinciden exactamente con las de los articulos originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nainiayoub/FloraNER-camembert-coarse
- Dataset FloraNER: https://huggingface.co/datasets/nainiayoub/FloraNER
- Demo en vivo (Space): https://huggingface.co/spaces/nainiayoub/floraner
- Articulo de datos (Data in Brief 56, 2024, 110824): https://doi.org/10.1016/j.dib.2024.110824
- Repositorio Zenodo del dataset: https://doi.org/10.5281/zenodo.12765869
- Articulo NLPI 2024 (HAL): https://hal.science/hal-04536866
- Modelo base camembert-base: https://huggingface.co/almanach/camembert-base
