# jonav/bert-base-cased-ner-conll2003

## Resumen

El modelo `jonav/bert-base-cased-ner-conll2003` es un ajuste fino completo (*full fine-tuning*) de `google-bert/bert-base-cased` para reconocimiento de entidades nombradas (NER) sobre el corpus CoNLL-2003 en inglés. Lo desarrolla el usuario jonav y su propósito es etiquetar tokens con las cuatro categorías clásicas de CoNLL (PER, ORG, LOC y MISC) mediante un esquema BIO de nueve etiquetas, empleando una cabeza lineal sobre el encoder preentrenado.

Se trata de un transformer encoder-only bidireccional de 107.726.601 parámetros, con tokenizador *cased* que preserva mayúsculas, un detalle relevante para NER porque la capitalización es una señal fuerte para identificar nombres propios. El modelo se entrenó durante 3 épocas con semilla 42 sobre los splits originales de CoNLL-2003 (14.041 ejemplos de entrenamiento, 3.250 de validación y 3.453 de test), sin truncamiento de oraciones.

Su relevancia es acotada pero clara: sirve como *baseline* reproducible de NER para noticias en inglés, con un F1 de 0,915353 en test, y ofrece una receta de entrenamiento documentada (hiperparámetros, revisión del dataset, revisión del modelo base) que facilita la replicación. No es un modelo generativo ni multilingüe: es una herramienta especializada de etiquetado de secuencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only bidireccional (BERT base) |
| Parametros totales | 107.726.601 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de bert-base; no especificado en la model card, derivado de la arquitectura del modelo base) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en precisión completa) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible; el modelo base `google-bert/bert-base-cased` es Apache-2.0, pero los textos de Reuters de CoNLL-2003 tienen sus propios términos |
| Formato de pesos | safetensors |
| Pipeline | token-classification |
| Etiquetas | 9 etiquetas BIO: PER, ORG, LOC, MISC (B- e I-) más O |
| Tamano del repositorio | 0,4 GB |
| Modelo base | google-bert/bert-base-cased (revisión `cd5ef92a9fb2f889e972770a36d4ed042daf221e`) |
| Dataset | lhoestq/conll2003 (revisión `19edcb426bfd625c275c17b9a99b2239243f4377`) |

## Arquitectura y entrenamiento

La arquitectura es la de BERT base en su variante *cased*: un transformer con encoder bidireccional, 12 capas, dimensión oculta de 768 y 12 cabezas de atención. Sobre la representación del token `[CLS]` y de cada subpalabra se añade una cabeza de clasificación lineal con nueve salidas correspondientes al esquema BIO. El tokenizador WordPiece conserva mayúsculas y distingue caracteres acentuados, lo que la model card señala explícitamente como una decisión favorable para la tarea. El modelo base se preentrenó con los objetivos de modelado de lenguaje enmascarado y predicción de siguiente oración sobre BooksCorpus y Wikipedia en inglés.

El ajuste fino se realizó con *full fine-tuning* (todos los parámetros actualizados), 3 épocas, batch efectivo de 16, optimizador AdamW con *learning rate* de 0,001 para la cabeza y 2e-05 para el encoder, *warmup* del 10 % y scheduler lineal. Se fijó la semilla 42 y se entrenó en FP16 sobre una NVIDIA GeForce RTX 4060 Laptop GPU. Solo la primera subpalabra de cada palabra recibe etiqueta; el resto de subpalabras, los tokens de *padding* y los especiales se marcan con `-100` para excluirlos de la pérdida. No se aplicó truncamiento de oraciones.

Un punto metodológico destacable es que el autor documenta la comparación entre *full fine-tuning* y *partial fine-tuning*: la diferencia observada fue de 3,40 puntos porcentuales a favor de *full*, y la selección se registró antes de evaluar el conjunto de test. El propio autor advierte que se entrenó una sola semilla por método y que no se realizaron pruebas de significación estadística, por lo que esa diferencia no debe interpretarse como concluyente. No se menciona uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Reconocimiento de entidades nombradas en inglés sobre texto periodístico, con cuatro tipos: persona (PER), organización (ORG), localización (LOC) y miscelánea (MISC).
- Etiquetado a nivel de token con esquema BIO de nueve etiquetas y agregación de subpalabras a palabras completas.
- Extracción de entidades en fragmentos no truncados a nivel de oración, ya que el entrenamiento no aplicó truncamiento.
- Integración directa con la librería `transformers` mediante el pipeline `token-classification` y la estrategia de agregación `first`.
- No dispone de soporte de *tool calling* ni de *function calling*.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No es un modelo multilingüe: solo se ha validado en inglés.
- No tiene modo de razonamiento (*thinking*), visión, audio ni generación de texto libre.

## Casos de uso

- Extracción de entidades en pipelines de noticias: el modelo etiqueta personas, organizaciones y localizaciones en titulares y cuerpos de artículo en inglés, lo que permite poblar bases de datos de conocimiento o índices temáticos de forma automática.
- Enriquecimiento de metadatos en agregadores de contenido: dado un artículo, se identifican las organizaciones y localizaciones mencionadas para construir etiquetas de clasificación y relacionar piezas informativas entre sí.
- Preprocesado para sistemas de búsqueda: las entidades detectadas se indexan como campos estructurados, mejorando la precisión de consultas del tipo "qué se dijo sobre una empresa concreta" frente a una búsqueda puramente textual.
- Análisis de menciones corporativas: seguimiento de qué organizaciones aparecen en un corpus de prensa y con qué frecuencia, útil para estudios de reputación o de mercado sobre textos en inglés.
- Anotación asistida en proyectos de investigación lingüística: el modelo genera preanotaciones que un anotador humano revisa, reduciendo el coste de construir corpus etiquetados de nuevo dominio.
- *Baseline* de evaluación en investigación: al tener una receta reproducible con semilla, revisiones de dataset y del modelo base documentadas, sirve como punto de comparación para experimentos de NER con BERT.
- Verificación de reglas de extracción en sistemas de cumplimiento: apoyo a la detección de nombres de personas y organizaciones en documentación en inglés, siempre con revisión humana por las limitaciones éticas que el propio autor señala.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| F1 (validación, seqeval estricto IOB2) | 0,951129 |
| F1 (test) | 0,915353 |
| Precisión (test) | 0,915515 |
| Recall (test) | 0,915191 |
| Accuracy por palabra (test) | 0,982836 |

La evaluación emplea F1 micro de entidades con *span* y tipo exactos, calculado con seqeval en modo estricto IOB2. El conjunto de test de CoNLL-2003 contiene 3.453 oraciones. La model card no incluye comparaciones numéricas con otros modelos, por lo que no se dispone de una tabla comparativa de rendimiento.

## Requisitos de hardware

- En FP16, los pesos ocupan aproximadamente 215 MB; en FP32, alrededor de 430 MB. La VRAM necesaria para inferencia es muy reducida, del orden de 1 a 2 GB incluyendo activaciones y *overhead* del runtime.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de portátil. El propio autor lo entrenó en una RTX 4060 Laptop.
- También es viable la inferencia en CPU, con latencias del orden de decenas de milisegundos por oración según el hardware; no se han publicado mediciones de latencia ni de *throughput*.
- Para lotes grandes o servicio concurrente, GPUs de centro de datos como A100 o H100 aportan margen, aunque el modelo no las requiere en absoluto.
- Opciones de despliegue: `transformers` con pipeline de token-classification, servidores de inferencia compatibles con el formato safetensors y despliegue en CPU o GPU. No se han publicado conversiones a GGUF ni a otros formatos cuantizados, por lo que herramientas como llama.cpp u Ollama requerirían conversión previa por parte del usuario.
- No se dispone de datos publicados de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de modelos alternativos en la información proporcionada, por lo que la comparación numérica no está disponible. A continuación se indican los aspectos estructurales conocidos.

| Modelo | Parametros | Contexto | Rendimiento (F1 CoNLL-2003 test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jonav/bert-base-cased-ner-conll2003 | 107.726.601 | 512 tokens | 0,915353 | no disponible | HuggingFace, safetensors |
| dslim/bert-base-NER | ~110 M (arquitectura BERT base) | 512 tokens | no disponible en la información proporcionada | no disponible en la información proporcionada | HuggingFace |
| google-bert/bert-base-cased | ~110 M | 512 tokens | no aplica (modelo preentrenado sin cabeza de NER) | Apache-2.0 | HuggingFace |

Cualquier comparación de calidad entre estos modelos requeriría evaluarlos sobre el mismo split de test y con el mismo script de evaluación, algo que no se ha hecho en la información disponible.

## Limitaciones y advertencias

- Solo está validado para inglés y para el dominio de noticias periodísticas; no se ha validado en español ni en otros dominios.
- Puede omitir entidades y reproducir los sesgos presentes en el corpus CoNLL-2003, que proviene de textos de Reuters.
- El autor advierte explícitamente que el modelo no debe usarse para tomar decisiones sobre personas.
- Riesgo de alucinación en el sentido de falsos positivos y falsos negativos en la detección de entidades; no genera texto libre, por lo que el riesgo se limita al etiquetado incorrecto.
- La licencia del repositorio figura como no disponible. El modelo base tiene licencia Apache-2.0, pero eso no otorga derechos sobre los textos de Reuters de CoNLL-2003; deben consultarse los términos del corpus antes de redistribuirlo. El repositorio del modelo no incluye el corpus.
- La diferencia de 3,40 puntos porcentuales frente a *partial fine-tuning* proviene de una sola semilla por método y sin pruebas de significación estadística, por lo que no debe tomarse como una ventaja establecida.
- El límite de contexto de 512 tokens implica que documentos largos deben dividirse en fragmentos, con el consiguiente riesgo de perder entidades en las fronteras si la segmentación no respeta oraciones completas.
- Para reproducir las métricas publicadas hay que usar las palabras originales del dataset y evaluar únicamente la primera subpalabra, tal como se hace en `train_ner.py`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jonav/bert-base-cased-ner-conll2003
- Modelo base: https://huggingface.co/google-bert/bert-base-cased
- Dataset: https://huggingface.co/datasets/lhoestq/conll2003
- Paper de BERT: https://arxiv.org/abs/1810.04805
- Paper de CoNLL-2003: https://aclanthology.org/W03-0419/
- Documentación de token classification en transformers: https://huggingface.co/docs/transformers/tasks/token_classification
- Repositorio de seqeval: https://github.com/chakki-works/seqeval
