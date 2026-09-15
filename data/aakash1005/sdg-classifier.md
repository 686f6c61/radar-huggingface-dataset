# Aakash1005/sdg-classifier

## Resumen

sdg-classifier es un clasificador de texto de 16 clases que asigna un fragmento de texto a uno de los Objetivos de Desarrollo Sostenible (ODS) de Naciones Unidas. Lo desarrolla el usuario Aakash1005 y es un ajuste fino de `distilbert-base-uncased` sobre el OSDG Community Dataset (`albertmartinez/OSDG`, configuracion `2024-04-01`), con 66.965.776 parametros y un peso de repositorio de 0,3 GB en safetensors.

El modelo resuelve una tarea muy concreta: el etiquetado tematico preliminar de textos de politica publica, descripciones de conjuntos de datos y extractos de informes para revision humana. No es un modelo generativo ni un asistente: es un encoder Transformer con una cabeza de clasificacion que devuelve una unica etiqueta (SDG 1 a SDG 16) acompanada de una puntuacion. Esta entrenado exclusivamente en ingles y con un maximo de 256 tokens por entrada.

Su relevancia esta en su doble naturaleza: por un lado es una herramienta ligera y desplegable en CPU, y por otro su model card es un ejercicio de analisis critico del propio benchmark. El autor advierte de que la clase SDG 16 alcanza 0,984 de F1 por artefactos de estilo (registro academico-juridico) y no por contenido tematico, lo que infla las metricas agregadas (0,799 de accuracy y 0,772 de macro F1 sobre 8.605 ejemplos de test). Cualquier comparacion con otros modelos sobre este benchmark debe hacerse por clase, no en agregado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DistilBERT (destilado de BERT-base-uncased): 6 capas, 12 cabezas de atencion, hidden size 768, feed-forward 3072 |
| Parametros totales | 66.965.776 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de entrenamiento); la arquitectura DistilBERT admite hasta 512 posiciones |
| Tipos de cuantizacion | no disponible (el autor solo publica pesos en safetensors sin cuantizar) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | clasificacion de texto (single-label, 16 clases: SDG 1 a SDG 16) |
| Modelo base | distilbert-base-uncased |
| Dataset de entrenamiento | albertmartinez/OSDG, configuracion 2024-04-01 |
| Tamano del repositorio | 0,3 GB |
| Libreria | transformers |
| Fecha de creacion en el Hub | 2026-09-15 (segun los metadatos del repositorio) |
| Fecha de ultima actualizacion | 2026-09-15 (segun los metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Arquitectura: DistilBERT, un encoder Transformer destilado de BERT-base-uncased que conserva 6 de las 12 capas del modelo original con 12 cabezas de atencion, hidden size de 768 y feed-forward de 3072. Sobre el `[CLS]` se anade una cabeza de clasificacion lineal con 16 salidas. No hay atencion lineal, decodificacion especulativa ni componentes SSM o hibridos; es un encoder clasico de 66,97 M de parametros.

Entrenamiento: ajuste fino supervisado con el OSDG Community Dataset (configuracion `2024-04-01`), filtrado a ejemplos con acuerdo de anotadores igual o superior a 0,5. Los splits son 30.978 ejemplos de entrenamiento, 3.442 de validacion y 8.605 de test. Se entreno durante 6 epocas con batch size 32, learning rate 3e-5, 10% de warmup y longitud maxima de 256 tokens, en una unica sesion de Kaggle sobre una GPU T4. La seleccion del checkpoint se hizo por mejor macro-F1 en validacion. No se documenta RLHF, DPO ni ninguna otra fase de alineamiento, algo que no aplica a un clasificador. El autor documenta que la variante de 3 epocas alcanza 0,793 de accuracy y 0,762 de macro F1, frente a 0,799 y 0,772 del modelo final de 6 epocas.

## Capacidades

- Clasificacion de texto en 16 categorias (SDG 1 a SDG 16) con etiqueta unica y puntuacion de confianza asociada.
- Etiquetado tematico de prosa en ingles de registro academico, juridico o de politica publica, con fragmentos de alrededor de 100 palabras.
- Integracion directa con la libreria `transformers` mediante `pipeline("text-classification")`.
- Compatible con Text Embeddings Inference y con endpoints compatibles segun los tags del repositorio.
- No genera texto: no hay decodificacion autoregresiva, razonamiento multi-paso ni modo de pensamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni planificacion.
- No tiene capacidades multimodales (ni vision ni audio).
- No es multilingue: solo ingles.
- No detecta texto no relacionado con los ODS: no existe clase negativa, por lo que asigna un objetivo a cualquier entrada.
- No cubre el SDG 17 (alianzas), ausente en los datos de entrenamiento.

## Casos de uso

- Etiquetado preliminar de politicas publicas: se pasa cada parrafo de un documento normativo al pipeline y se obtiene un objetivo candidato que un analista revisa despues. El modelo esta disenado explicitamente para esta funcion de primer paso con revision humana.
- Enriquecimiento de metadatos en portales de datos abiertos: clasificar automaticamente descripciones de datasets con la dimension de ODS permite construir filtros tematicos sin trabajo manual, aprovechando que el rendimiento es aceptable en extractos de ~100 palabras.
- Triaje en revisiones sistematicas de literatura: dado un conjunto de resumenes (abstracts), preasignar un ODS reduce el volumen de lectura inicial; el registro academico de los abstracts es precisamente la distribucion sobre la que el modelo rinde mejor.
- Informes de sostenibilidad corporativa: clasificar secciones de memorias ESG por ODS para construir matrices de contribucion, siempre con validacion humana por la confusion documentada entre SDG 1, 8 y 10.
- Preanotacion en pipelines de anotacion humana: usar las predicciones como propuesta inicial en herramientas tipo Label Studio o Prodigy acelera la anotacion del OSDG-CD, dado que el modelo reproduce el esquema de etiquetas del propio dataset.
- Indexacion y busqueda tematica en portales de cooperacion al desarrollo: asignar un ODS a cada documento permite facetar la busqueda; la limitacion single-label obliga a tratar la facetacion como aproximada.
- Baseline reproducible para investigacion: sirve como punto de partida con hiperparametros y splits documentados para experimentos sobre OSDG-CD y para comparar arquitecturas alternativas bajo el mismo protocolo.
- Clasificacion en entornos sin GPU: al ser un modelo de 67 M de parametros, puede ejecutarse en CPU en servicios de baja capacidad, lo que facilita su integracion en backends de bajo coste.

## Benchmarks y rendimiento

Resultados publicados por el autor. Conjunto de test: 8.605 ejemplos retenidos, entrenamiento filtrado a acuerdo >= 0,5.

| Configuracion | Accuracy | Macro F1 |
|---|---|---|
| 3 epocas | 0,793 | 0,762 |
| 6 epocas (modelo publicado) | 0,799 | 0,772 |

Resultados por clase del modelo de 6 epocas:

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| SDG 1 - No Poverty | 0,729 | 0,619 | 0,670 | 494 |
| SDG 2 - Zero Hunger | 0,777 | 0,800 | 0,789 | 506 |
| SDG 3 - Good Health | 0,904 | 0,861 | 0,882 | 526 |
| SDG 4 - Quality Education | 0,887 | 0,829 | 0,857 | 736 |
| SDG 5 - Gender Equality | 0,814 | 0,848 | 0,831 | 875 |
| SDG 6 - Clean Water | 0,764 | 0,807 | 0,785 | 549 |
| SDG 7 - Affordable Energy | 0,785 | 0,838 | 0,810 | 610 |
| SDG 8 - Decent Work | 0,399 | 0,532 | 0,456 | 284 |
| SDG 9 - Industry & Infrastructure | 0,782 | 0,753 | 0,767 | 543 |
| SDG 10 - Reduced Inequalities | 0,613 | 0,648 | 0,630 | 457 |
| SDG 11 - Sustainable Cities | 0,743 | 0,793 | 0,767 | 497 |
| SDG 12 - Responsible Consumption | 0,755 | 0,687 | 0,719 | 233 |
| SDG 13 - Climate Action | 0,779 | 0,726 | 0,751 | 452 |
| SDG 14 - Life Below Water | 0,871 | 0,792 | 0,830 | 231 |
| SDG 15 - Life on Land | 0,851 | 0,794 | 0,822 | 554 |
| SDG 16 - Peace & Justice | 0,984 | 0,985 | 0,984 | 1058 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales en la informacion disponible, algo esperable en un clasificador de dominio especifico.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 268 MB (66.965.776 parametros x 4 bytes). En FP16, aproximadamente 134 MB; en int8, aproximadamente 67 MB. Son estimaciones calculadas a partir del recuento de parametros, no mediciones publicadas.
- VRAM de inferencia: por debajo de 1 GB incluso con lotes moderados de entradas de 256 tokens, dado el tamano del modelo.
- GPU recomendadas: no requiere GPU. La T4 empleada en el entrenamiento es mas que suficiente; una A100 o H100 estarian sobredimensionadas para esta tarea.
- Cabe en cualquier GPU de consumo: GTX 1050/1650, RTX 3060, RTX 4090, e incluso en iGPU con memoria compartida. Tambien es viable en CPU.
- Opciones de despliegue: `pipeline` de transformers, Text Embeddings Inference (el repositorio declara compatibilidad), ONNX Runtime, TorchServe o KServe. No hay soporte de la cabeza de clasificacion en llama.cpp u Ollama, orientados a modelos generativos y de embeddings.
- Latencia y throughput: no se publican mediciones de latencia ni de tokens por segundo en la informacion disponible.
- Coste de entrenamiento documentado: una sola sesion de Kaggle con GPU T4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aakash1005/sdg-classifier | 66,97 M | 256 tokens | 0,799 accuracy / 0,772 macro F1 en OSDG-CD test (8.605 ejemplos) | MIT | HuggingFace |
| Baseline citado por el autor: TF-IDF + regresion logistica | no disponible | 8 primeras palabras del extracto | 0,739 F1 en SDG 16 frente a una media macro de 0,327 | no disponible | no disponible |
| distilbert-base-uncased sin ajustar | 66,97 M | 512 tokens | no disponible para esta tarea | Apache-2.0 | HuggingFace |

No se dispone de datos publicados de otros clasificadores de ODS comparables en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El score de SDG 16 es en parte un artefacto. Con 0,984 de F1 supera ampliamente al resto de clases sobre el objetivo mas abstracto del marco: un modelo TF-IDF + regresion logistica entrenado solo con las 8 primeras palabras de cada extracto alcanza 0,739 de F1 en SDG 16, lo que indica que la clase es identificable por registro estilistico (prosa academica juridica y de ciencia politica) y no por contenido tematico. SDG 16 representa el 12,3% del conjunto de test, por lo que infla las metricas agregadas.
- Las puntuaciones por clase no son comparables entre objetivos.
- SDG 8 es poco fiable: precision de 0,399, es decir, aproximadamente 6 errores de cada 10 predicciones de esa clase. SDG 1, 8 y 10 forman un grupo de confusion (1 hacia 10 en 0,16; 8 hacia 10 en 0,12; 10 hacia 8 en 0,11) por solapamiento conceptual real entre pobreza, trabajo decente y desigualdad.
- Clasificacion single-label sobre un problema multietiqueta: muchos textos abordan varios ODS a la vez y el modelo solo devuelve uno.
- No existe clase negativa: el modelo asignara un ODS a cualquier texto, incluido texto sin relacion con los ODS.
- SDG 17 (Partnerships) esta ausente de los datos de entrenamiento y no puede predecirse.
- Entradas cortas no validadas: los extractos de entrenamiento tienen una media de ~100 palabras y no se ha probado el rendimiento con titulos o frases sueltas.
- Solo ingles.
- Sin intervalos de confianza: una unica semilla y una unica ejecucion; no hay estimacion de varianza.
- Riesgo de alucinacion en el sentido clasico no aplica (no genera texto), pero si hay riesgo de asignaciones erroneas con alta confianza, especialmente en las clases con F1 bajo.
- Uso comercial permitido por la licencia MIT del modelo, pero el dataset OSDG-CD se distribuye bajo CC BY 4.0 y la model card pide citarlo.
- Estado de validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes publicadas.
- Uso previsto restringido por el propio autor: etiquetado de primer paso con revision humana y baseline reproducible. Queda fuera de alcance cualquier uso en el que la salida se ejecute sin revision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aakash1005/sdg-classifier
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/albertmartinez/OSDG
- Dataset OSDG Community Dataset (OSDG-CD), Zenodo: https://doi.org/10.5281/zenodo.5550238 (CC BY 4.0)
- Citacion indicada por el autor: OSDG, UNDP IICPSD SDG AI Lab y PPMI, OSDG Community Dataset (OSDG-CD), Zenodo.
- Nota sobre la busqueda web: los resultados devueltos no guardan ninguna relacion con este modelo (contenido sobre exchanges de criptomonedas y NFTs), por lo que no se han incluido como enlaces relevantes.
