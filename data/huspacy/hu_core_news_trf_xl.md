# huspacy/hu_core_news_trf_xl

## Resumen

`hu_core_news_trf_xl` es un pipeline de procesamiento de lenguaje natural para húngaro desarrollado por el proyecto HuSpaCy (SzegedAI y MILAB), distribuido como modelo de spaCy v3.5. Se trata de un pipeline completo de análisis lingüístico que integra tokenización, segmentación de frases, etiquetado gramatical, morfología, lematización, análisis de dependencias y reconocimiento de entidades nombradas en un único artefacto empaquetado para spaCy.

El componente central es un transformer XLM-RoBERTa (la model card menciona también huBERT como fuente base), sobre el que se apilan componentes estadísticos específicos para húngaro. El modelo está pensado para pipelines de NLP en producción donde se necesita un análisis morfosintáctico profundo de textos húngaros, un idioma con morfología aglutinante compleja y un sistema de casos rico que dificulta el procesamiento con herramientas genéricas.

La relevancia del modelo radica en su cobertura: un único pipeline resuelve siete tareas lingüísticas con métricas declaradas superiores al 86% en todas ellas, incluyendo un F-score de entidades del 91,5% y una precisión de lematización del 98,9%. El repositorio ocupa 52,6 GB, lo que refleja el peso del transformer subyacente y de los componentes entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline spaCy con transformer XLM-RoBERTa como componente base; componentes estadísticos (tagger, morphologizer, lemmatizer, parser, ner) sobre el transformer |
| Parametros totales | no disponible (el tamaño del repo es de 52,6 GB, pero no se desglosa el número de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato spaCy, no se distribuyen cuantizaciones GGUF/AWQ) |
| Idiomas soportados | húngaro (hu) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | paquete spaCy (modelo instalable con `spacy`); no se distribuye en safetensors ni GGUF |
| Version del pipeline | 3.5.2 |
| Version de spaCy requerida | >=3.5.0, <3.6.0 |
| Componentes | transformer, senter, tagger, morphologizer, lookup_lemmatizer, trainable_lemmatizer, experimental_arc_predicter, experimental_arc_labeler, ner |
| Vectores estáticos | 0 claves, 0 vectores únicos (0 dimensiones) |
| Etiquetas totales | 1217 etiquetas en 4 componentes |

## Arquitectura y entrenamiento

El pipeline combina un transformer multilingüe (XLM-RoBERTa, con huBERT citado como fuente base en la model card) con componentes predictivos específicos de spaCy. La secuencia de componentes es: `transformer` (representaciones contextuales), `senter` (segmentación de frases), `tagger` (POS), `morphologizer` (rasgos morfológicos UFeats), `lookup_lemmatizer` y `trainable_lemmatizer` (lematización en dos etapas), `experimental_arc_predicter` y `experimental_arc_labeler` (análisis de dependencias en dos fases) y `ner` (entidades nombradas). El uso de componentes "experimental" para el parser sugiere que el pipeline se apoya en la implementación experimental de análisis de dependencias de spaCy en lugar del parser estándar.

Los datos de entrenamiento proceden de cuatro corpus anotados en húngaro: UD Hungarian Szeged (árbol de dependencias Universal Dependencies), NYTK-NerKor (corpus de entidades), hunNERwiki (entidades de Wikipedia) y Szeged NER Corpus (entidades). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un pipeline de este tipo). La innovación técnica destacable es el uso de un lematizador de dos etapas (lookup + trainable) y un parser desacoplado en predicción de arcos y etiquetado, lo que permite aprovechar el transformer para representaciones contextuales mientras se mantienen componentes ligeros y entrenables por tarea.

## Capacidades

- Segmentación de frases (senter) con F-score de 0,9933.
- Etiquetado gramatical POS (tagger) con precisión UPOS de 0,9805.
- Etiquetado XPOS con precisión de 0,9814.
- Análisis morfológico de rasgos UFeats con precisión de 0,9659.
- Lematización con precisión de 0,9895 mediante lookup y lematizador entrenable.
- Análisis de dependencias: UAS de 0,9112 y LAS de 0,8687.
- Reconocimiento de entidades nombradas (NER) con precisión de 0,9150, recall de 0,9160 y F-score de 0,9155.
- Procesamiento de texto húngaro con morfología aglutinante y sistema de casos (los rasgos morfológicos incluyen casos como Ine, Nom, Acc, Del, Sbl, Sup, Ess, Cau, Gen, Ins, Tra, entre otros).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un pipeline de análisis lingüístico, no un modelo generativo.
- Capacidad multilingüe limitada al húngaro (el transformer base es multilingüe, pero los componentes están entrenados solo para húngaro).

## Casos de uso

- Extracción de entidades en textos periodísticos húngaros: el componente NER con F-score de 0,9155 permite identificar personas, organizaciones y lugares en corpus de noticias para construir índices temáticos o bases de datos de entidades.
- Análisis sintáctico para investigación lingüística: el parser con UAS de 0,9112 y LAS de 0,8687 permite extraer árboles de dependencias de corpus húngaros para estudios de sintaxis o para anotar nuevos corpus.
- Enriquecimiento de motores de búsqueda en húngaro: la lematización (precisión 0,9895) y el etiquetado POS permiten normalizar consultas y documentos, mejorando la recuperación al reducir formas flexionadas a sus lemas.
- Preprocesamiento para pipelines de NLP aguas abajo: el pipeline completo (tokenización, frases, POS, morfología, lemas, dependencias) sirve como etapa de preprocesamiento para modelos de clasificación, resumen o traducción que operen sobre húngaro.
- Anonimización y cumplimiento normativo: la detección de entidades nombradas permite localizar nombres de personas y organizaciones en documentos para su redacción o seudonimización antes de su publicación.
- Análisis de opiniones y minería de textos: la combinación de POS, morfología y dependencias permite extraer sujetos, objetos y modificadores en reseñas húngaras para análisis de sentimiento basado en reglas o como features para modelos supervisados.
- Construcción de corpus anotados: el pipeline puede usarse para preanotar grandes volúmenes de texto húngaro que luego se revisan manualmente, reduciendo el coste de anotación en proyectos de PLN.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (métricas no verificadas, `verified: false`):

| Tarea | Métrica | Valor |
|---|---|---|
| NER | Precision | 0,9150 |
| NER | Recall | 0,9160 |
| NER | F-score | 0,9155 |
| TAG (XPOS) | Accuracy | 0,9814 |
| POS (UPOS) | Accuracy | 0,9805 |
| MORPH (UFeats) | Accuracy | 0,9659 |
| LEMMA | Accuracy | 0,9895 |
| UNLABELED_DEPENDENCIES | UAS (F-score) | 0,9112 |
| LABELED_DEPENDENCIES | LAS (F-score) | 0,8687 |
| SENTS | Sentences F-score | 0,9933 |

No se han publicado en la información disponible resultados comparativos con otros modelos en estos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 52,6 GB, lo que sugiere que el transformer base y los componentes requieren un espacio en disco considerable; la VRAM dependerá del tamaño real del transformer (no desglosado) y de si se ejecuta en GPU o CPU.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del repositorio, se recomienda una GPU con al menos 16-24 GB de VRAM para ejecutar el pipeline completo en GPU, aunque este dato no está confirmado por el autor.
- Compatibilidad con GPU consumer: no confirmada; el tamaño del artefacto sugiere que puede requerir GPUs de gama alta o profesionales, pero no hay datos oficiales.
- Opciones de despliegue: spaCy (`spacy.load`), con soporte de ejecución en CPU y GPU según la configuración de spaCy y PyTorch. No se distribuyen formatos para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Tareas | NER F-score | LAS | Licencia | Formato |
|---|---|---|---|---|---|---|
| hu_core_news_trf_xl (este modelo) | húngaro | Senter, POS, XPOS, morph, lemma, parser, NER | 0,9155 | 0,8687 | CC BY-SA 4.0 | spaCy |
| hu_core_news_lg (HuSpaCy) | húngaro | Pipeline spaCy con vectores | no disponible en la información | no disponible | CC BY-SA 4.0 | spaCy |
| Modelos stanza para húngaro | húngaro | Tokenización, POS, lemma, parser, NER | no disponible en la información | no disponible | varía | Python/Stanza |

No se dispone en la información proporcionada de métricas de los modelos alternativos para una comparación cuantitativa rigurosa. La comparativa se limita a la categoría (pipelines de análisis lingüístico para húngaro) y a la licencia y formato de distribución.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en húngaro; no debe usarse con otros idiomas aunque el transformer base sea multilingüe.
- No es un modelo generativo: no puede responder preguntas, generar texto, razonar ni ejecutar tool calling. Su uso está limitado al análisis lingüístico.
- Las métricas declaradas están marcadas como no verificadas (`verified: false`) en la model card; deben tomarse como resultados del autor, no validados de forma independiente.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y obliga a compartir las obras derivadas bajo la misma licencia. Es una licencia copyleft, lo que puede ser restrictivo para productos propietarios.
- El pipeline depende de una versión concreta de spaCy (>=3.5.0, <3.6.0); actualizar spaCy puede romper la compatibilidad.
- Los componentes de parser están marcados como "experimental", lo que implica que su API o comportamiento puede cambiar.
- Riesgo de errores en textos con ortografía no estándar, jerga, dominios muy específicos o textos históricos no representados en los corpus de entrenamiento (UD Szeged, NYTK-NerKor, hunNERwiki, Szeged NER Corpus).
- No se dispone de información sobre sesgos demográficos o de dominio del modelo; los corpus de entrenamiento condicionan los tipos de entidades y registros reconocidos.
- El tamaño del repositorio (52,6 GB) implica requisitos de almacenamiento y tiempos de carga considerables en despliegues con recursos limitados.
- No se distribuyen cuantizaciones ni formatos optimizados para inferencia de alto rendimiento (ONNX, TensorRT), lo que limita las opciones de despliegue en producción a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huspacy/hu_core_news_trf_xl
- Repositorio HuSpaCy: https://github.com/huspacy/huspacy
- UD Hungarian Szeged: https://universaldependencies.org/treebanks/hu_szeged/index.html
- NYTK-NerKor Corpus: https://github.com/nytud/NYTK-NerKor
- hunNERwiki: http://hlt.sztaki.hu/resources/hunnerwiki.html
- Szeged NER Corpus: https://rgai.inf.u-szeged.hu/node/130
- huBERT base model (cased): https://huggingface.co/SZTAKI-HLT/hubert-base-cc
