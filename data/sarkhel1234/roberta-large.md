# sarkhel1234/RoBERTa-Large

## Resumen

`sarkhel1234/RoBERTa-Large` es un repositorio de HuggingFace publicado por el usuario sarkhel1234 que acompaña al artículo "Kurdish RoBERTa-Large for Part-of-Speech Tagging in Sorani Kurdish: A Hybrid-Corpus Benchmark Against mBERT and KuBERT". No se trata de un checkpoint con pesos publicados (el tamaño del repositorio es de 0,0 GB), sino del código de preprocesado, entrenamiento y evaluación de cuatro etiquetadores de categorías gramaticales (POS) para kurdo sorani: mBERT, KuBERT, Kurdish RoBERTa-Large y Kurdish RoBERTa-Large con una capa CRF de cadena lineal superpuesta.

El modelo subyacente es una adaptación al kurdo sorani de la arquitectura RoBERTa-large (transformer encoder de 24 capas y aproximadamente 355 millones de parámetros), orientada a una tarea discriminativa de etiquetado a nivel de token con un esquema de 8 etiquetas: nombre, verbo, adjetivo, adverbio, pronombre, partícula, numeral y puntuación. El interés actual del repositorio reside en que documenta un protocolo experimental reproducible (split 80/10/10 a nivel de oración con semilla 42, evaluación única sobre test, métricas a nivel de palabra) sobre un corpus híbrido de kurdo sorani, un idioma de bajos recursos.

La relevancia es, por tanto, metodológica y de recursos lingüísticos más que de modelo listo para producción: quien quiera utilizar el etiquetador debe reconstruir el corpus y reentrenar siguiendo los scripts, ya que no se distribuyen los pesos resultantes ni se detallan en la información disponible los hiperparámetros concretos de cada configuración.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa-large (24 capas, 16 cabezas de atención, dimensión oculta 1024); variante con capa CRF de cadena lineal sobre las emisiones del encoder |
| Parámetros totales | ~355 M para el backbone RoBERTa-large (dato del modelo base; no verificado para este repositorio, que no publica pesos) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (límite estándar de RoBERTa; no se especifica en la model card, que trabaja a nivel de oración) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | kurdo sorani (objetivo del fine-tuning); el backbone RoBERTa-large se preentrenó sobre todo en inglés |
| Licencia | código: MIT; pesos: no disponible (no se publican); datos: ver la dataset card (subconjunto formal de 110.000 tokens derivado de KurCorpus 2B, CC BY 4.0; subconjunto de noticias de 40.000 tokens no redistribuible) |
| Formato de pesos | no disponible; el repositorio contiene únicamente scripts Python (`preprocess.py`, `train_evaluate.py`, `models.py`, `common.py`, `make_comparison_figures.py`, `requirements.txt`), sin safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional con las modificaciones propias de RoBERTa frente a BERT: eliminación de la tarea de predicción de la siguiente oración (NSP), enmascaramiento dinámico y tokenización byte-level BPE. Sobre ese backbone, el repositorio implementa en `models.py` una variante que añade una capa CRF de cadena lineal para modelar las dependencias entre etiquetas consecutivas, lo que constituye la ablación principal del trabajo frente a la cabeza lineal estándar.

El protocolo experimental está detallado en la model card: esquema de 8 etiquetas POS, split 80/10/10 a nivel de oración con `random_state = 42` compartido entre los cuatro modelos, batch size 8 con acumulación de gradiente 2, hasta 10 épocas, 10 % de warm-up lineal, early stopping sobre macro-F1 de validación con paciencia 3, restauración del mejor checkpoint y semilla 42. Las métricas de test se calculan una sola vez sobre el conjunto de test reservado, a nivel de palabra (se toma el primer sub-token de cada palabra). Los hiperparámetros específicos de cada modelo están en el diccionario `CONFIGS` de `train_evaluate.py`; no se detallan en la información disponible ni se indica si hubo una fase de preentrenamiento específica en kurdo o solo fine-tuning sobre el backbone multilingüe/inglés.

El corpus es híbrido: 110.000 tokens de registro formal derivados de KurCorpus 2B (CC BY 4.0) y 40.000 tokens de un subconjunto de noticias cuyo texto fuente no puede redistribuirse, por lo que el dataset publica anotaciones, identificadores de origen y un script de recolección. No se especifica en la información disponible el número total de tokens de preentrenamiento del modelo adaptado al kurdo.

## Capacidades

- Etiquetado de categorías gramaticales (POS tagging) en kurdo sorani con un inventario cerrado de 8 etiquetas.
- Etiquetado a nivel de palabra con alineación explícita entre sub-tokens y etiquetas, gestionada en `common.py`.
- Modelado de dependencias entre etiquetas consecutivas mediante la variante con CRF de cadena lineal, útil para secuencias con transiciones fuertes (por ejemplo, determinante-nombre o partícula-verbo).
- Evaluación reproducible: métricas por clase, matriz de confusión, curvas de entrenamiento y paneles de rendimiento comparativos entre modelos.
- Capacidad de servir como baseline para comparar arquitecturas (mBERT, KuBERT, RoBERTa) sobre un mismo split fijo.
- Soporte de tool calling / function calling: no disponible (es un encoder discriminativo, no un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas; el modelo está especializado en sorani kurdo y el backbone se preentrenó principalmente en inglés. No se documenta transferencia a kurdo kurmanji ni a otras variedades.
- Capacidades especiales: ninguna adicional (sin visión, audio ni modo "thinking").

## Casos de uso

- Anotación morfosintáctica asistida de corpus en kurdo sorani: el etiquetador preasigna las 8 categorías y un lingüista revisa, reduciendo el coste frente a la anotación manual, siempre que se reentrene el modelo con los scripts del repositorio.
- Construcción de treebanks y recursos para NLP de bajos recursos: las etiquetas POS son la capa base para dependencias, reconocimiento de entidades y lematización posteriores en sorani.
- Extracción de información en prensa kurda: identificar nombres y numerales en el subconjunto de noticias permite indexar entidades y cantidades en pipelines de monitorización de medios.
- Búsqueda y recuperación de información: usar las etiquetas para filtrar candidatos (por ejemplo, restringir la búsqueda de términos a posiciones de nombre o verbo) antes de un ranking semántico.
- Investigación comparativa de arquitecturas para lenguas de bajos recursos: el repositorio ofrece un protocolo cerrado (split fijo, semilla 42, evaluación única) que permite reproducir la comparación mBERT frente a KuBERT frente a RoBERTa con y sin CRF y añadir nuevos modelos con cambios mínimos.
- Docencia y formación en NLP: el código está modularizado (`common.py` para alineación de etiquetas, `models.py` para la CRF) y sirve como ejemplo didáctico de fine-tuning de encoders para etiquetado de secuencias.
- Preprocesado para sistemas TTS/ASR en kurdo: el POS ayuda a desambiguar homógrafos y a decidir pronunciación o prosodia en la fase de normalización de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe que los scripts generan `results.json`, `history.json`, matriz de confusión y curvas comparativas, y que existe un modo `make_comparison_figures.py --paper_values` que replica las cifras del artículo, pero no se incluyen los valores numéricos de macro-F1 ni de precisión/recall por clase para ninguno de los cuatro modelos.

| Modelo evaluado en el paper | Conjunto | Métrica | Resultado |
|---|---|---|---|
| mBERT | test del corpus híbrido | macro-F1 (nivel de palabra) | no disponible |
| KuBERT | test del corpus híbrido | macro-F1 (nivel de palabra) | no disponible |
| Kurdish RoBERTa-Large | test del corpus híbrido | macro-F1 (nivel de palabra) | no disponible |
| Kurdish RoBERTa-Large + CRF | test del corpus híbrido | macro-F1 (nivel de palabra) | no disponible |

## Requisitos de hardware

- VRAM para inferencia: con un backbone de ~355 M parámetros, los pesos ocupan aproximadamente 1,4 GB en FP32 y 0,7 GB en FP16; sumando activaciones para secuencias de 512 tokens, el consumo típico se sitúa en el rango de 2 a 4 GB (estimación, no medida publicada).
- VRAM para fine-tuning: la configuración documentada (batch 8 × acumulación 2, hasta 10 épocas) encaja en GPUs de 12-16 GB con precisión mixta; con BatchNorm/atención en FP32 y secuencias largas conviene disponer de 16-24 GB.
- GPU recomendadas: A100 o H100 para barridos de hiperparámetros y reproducción completa de los cuatro modelos; RTX 4090, RTX 3090 o A10G suficientes para un único fine-tuning.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4070 Ti, RTX 4080 y RTX 4090 con batch pequeño y acumulación de gradiente; en GPUs de 8 GB requiere reducir el batch o truncar la longitud de secuencia.
- Despliegue: al ser un encoder de clasificación de tokens, el stack natural es Hugging Face Transformers (`AutoModelForTokenClassification`) más PyTorch; también ONNX Runtime o TorchScript para servir a baja latencia. Motores orientados a decodificación autoregresiva como vLLM no son la vía adecuada para este modelo. Los artefactos se guardan en `results/<modelo>/model/`, por lo que hay que exportarlos explícitamente para servirlos.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud, un encoder de 355 M procesa secuencias cortas en pocos milisegundos por lote en una GPU moderna, pero no hay mediciones publicadas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea comparada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kurdish RoBERTa-Large (este repo) | ~355 M (backbone) | 512 tokens | POS tagging sorani, con y sin CRF | código MIT; pesos no disponibles | scripts en HF; requiere reentrenar |
| mBERT | no disponible en la información (modelo base multilingüe, ~178 M según el modelo original) | 512 tokens | POS tagging sorani | Apache 2.0 (modelo base) | pesos públicos vía Transformers |
| KuBERT | no disponible en la información | no disponible | POS tagging sorani (referencia específica para kurdo) | no disponible | no disponible en la información |
| roberta-large (FacebookAI) | ~355 M | 512 tokens | fill-mask en inglés, no etiquetado POS en kurdo | MIT (modelo base) | pesos públicos en HuggingFace |

La comparación cuantitativa de rendimiento entre los cuatro sistemas no puede completarse: el artículo propone precisamente ese benchmark, pero los valores de macro-F1 no están en la información disponible. La diferencia metodológica relevante frente a usar mBERT o KuBERT directamente es la cabeza CRF, que modela transiciones entre etiquetas y no solo emisiones independientes.

## Limitaciones y advertencias

- El repositorio no publica pesos: el tamaño es de 0,0 GB y solo contiene scripts. No es desplegable sin reconstruir el corpus y ejecutar el entrenamiento.
- El corpus de noticias (40.000 tokens) no es redistribuible; la reproducibilidad completa depende de volver a recolectar las fuentes con el script proporcionado, lo que puede fallar si las URLs originales han cambiado.
- La licencia de los pesos resultantes no está especificada. El código es MIT, pero eso no aclara automáticamente el uso comercial del modelo entrenado ni de los datos derivados.
- Riesgo de alucinación: no aplica en sentido generativo (es un clasificador), pero sí existe riesgo de etiquetas erróneas en dominios distintos del corpus de entrenamiento (formal + noticias), especialmente en registro coloquial, textos dialectales o sorani con ortografía no normalizada.
- Sesgo de dominio y de anotación: el modelo se ajusta a un esquema de 8 etiquetas; cualquier discrepancia con esquemas más finos (subcategorías nominales, clíticos, ezafe) obliga a reetiquetar y reentrenar.
- Limitación de contexto: 512 tokens por secuencia; el trabajo asume granularidad de oración, por lo que no hay modelado de discurso entre oraciones.
- Cobertura lingüística estrecha: solo sorani kurdo; no se documenta kurmanji, zazaki ni gorani, y el backbone se preentrenó mayoritariamente en inglés, lo que puede penalizar fenómenos morfológicos ausentes en el preentrenamiento.
- Sin métricas publicadas en la información disponible: no es posible estimar la calidad esperada antes de reentrenar.
- Repositorio con 0 descargas y 0 likes y sin pipeline declarado: no hay evidencia de uso en producción ni de validación externa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sarkhel1234/RoBERTa-Large
- Dataset del corpus: https://huggingface.co/datasets/sarkhel1234/Kurdish_POS (DOI: 10.57967/hf/9940)
- Modelo base RoBERTa-large: https://huggingface.co/FacebookAI/roberta-large
- Artículo citado en la model card: "Kurdish RoBERTa-Large for Part-of-Speech Tagging in Sorani Kurdish: A Hybrid-Corpus Benchmark Against mBERT and KuBERT" (no se proporciona URL en la información disponible)
- Ficha técnica de RoBERTa-large en Emergent Mind: https://www.emergentmind.com/topics/roberta-large-model
- Catálogo de roberta-large en Microsoft Foundry: https://ai.azure.com/catalog/models/roberta-large
- Ficha de roberta-large en Model Database: https://modeldatabase.com/roberta-large.html
- Resumen y alternativas de roberta-large en AIModels.fyi: https://www.aimodels.fyi/models/huggingFace/roberta-large-facebookai
