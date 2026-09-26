# abelcetina/u2t01-bert-conll2003-ner

## Resumen

`abelcetina/u2t01-bert-conll2003-ner` es un modelo de reconocimiento de entidades nombradas (NER) construido a partir de `google-bert/bert-base-uncased` mediante ajuste fino completo sobre el corpus CoNLL-2003 en formato IOB2. Lo desarrolla el equipo U2T01 como parte de una asignatura universitaria ("Adapting BERT for NLP tasks") y su objetivo es reproducir la comparativa de la sección 5.3 del artículo original de BERT entre adaptación basada en características y ajuste fino completo.

El modelo conserva la arquitectura del encoder BERT base: 12 capas de transformer con 108.898.569 parámetros totales, todos ellos entrenables (100 % del peso recibió gradientes, sin componentes congelados). Sobre la representación de cada token se añade una cabeza lineal de clasificación de tokens que proyecta a las 9 etiquetas IOB2 del corpus (O, B-PER, I-PER, B-ORG, I-ORG, B-LOC, I-LOC, B-MISC, I-MISC).

Es relevante como referencia de línea base para tareas de extracción de información en inglés: sobre el split de validación alcanza un F1 de 0,9395 y una accuracy de 0,9882, y sobre el split de test un F1 de 0,9019. Su tamaño reducido (0,4 GB de repositorio) y su licencia Apache 2.0 lo hacen desplegable en hardware modesto, aunque su alcance está explícitamente limitado a texto en inglés similar a la prosa periodística de Reuters de 1996-1997.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, 12 capas) con cabeza lineal de token classification |
| Parametros totales | 108.898.569 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens (max sequence length usado en entrenamiento; la arquitectura BERT base admite hasta 512) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos distribuidos en safetensors, presumiblemente fp32) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | google-bert/bert-base-uncased |
| Tarea (pipeline) | token-classification (NER) |
| Etiquetas | 9 IOB2: O, B-PER, I-PER, B-ORG, I-ORG, B-LOC, I-LOC, B-MISC, I-MISC |
| Tamano del repositorio | 0,4 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

Se trata de un transformer encoder estándar de tipo BERT (embedding de tokens, embedding de segmento, embedding posicional y 12 capas de auto-atención multi-cabeza con red feed-forward). El método de adaptación es ajuste fino completo con el flag `--method full`: se actualizaron todos los parámetros del encoder (embeddings y las 12 capas) y los de la cabeza de clasificación. No hubo componentes congelados. La cabeza es una proyección lineal sobre la representación de cada token, inicializada aleatoriamente.

Los datos de entrenamiento proceden del mirror en parquet `lhoestq/conll2003` (leído así porque `datasets >= 4.0` eliminó los scripts de carga), con 14.041 frases de entrenamiento, 3.250 de validación y 3.453 de test. El dataset deriva del corpus de noticias Reuters-21578. Los hiperparámetros principales son: 3 épocas, batch de 32, learning rate de 0,001 para la cabeza y 0,00002 para el cuerpo, weight decay de 0,01, longitud máxima de secuencia de 128 tokens y semilla 42. El entrenamiento se realizó en 1 × Tesla T4 (Google Colab, CUDA 12.8) con un tiempo de pared de 160,4 segundos (~2,7 minutos) sobre 1.317 pasos. No se aplicó RLHF, DPO ni ningún proceso de alineación posterior; tampoco se describe decodificación especulativa ni atención lineal.

## Capacidades

- Reconocimiento de entidades nombradas en inglés sobre cuatro tipos: persona (PER), organización (ORG), localización (LOC) y miscelánea (MISC), devolviendo etiquetas en esquema IOB2.
- Clasificación a nivel de token con agregación de entidades mediante `aggregation_strategy="simple"` en el pipeline de `transformers`, que agrupa subpalabras en spans coherentes.
- Inferencia directa sobre texto en inglés sin prompt engineering: el modelo recibe una frase y produce los spans etiquetados.
- Extracción de información estructurada a partir de texto no estructurado (base para pipelines de IE).
- Integración con la librería `transformers` mediante `pipeline("token-classification")`.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite su despliegue como API gestionada.
- No soporta tool calling, function calling, uso como agente, razonamiento multi-paso, visión, audio, ni modo de razonamiento extendido: es un encoder discriminativo, no generativo.
- Capacidad multilingüe limitada al inglés; no se ha caracterizado su comportamiento en otros idiomas.

## Casos de uso

- Etiquetado de documentos periodísticos: el modelo identifica personas, organizaciones y localizaciones en texto de estilo noticia en inglés, su dominio de entrenamiento, lo que lo hace adecuado para indexar y enriquecer archivos de prensa.
- Extracción de entidades en pipelines de información: como primer paso de un sistema que después enlaza entidades (entity linking) o resuelve coreferencia sobre los spans detectados.
- Preprocesado para análisis de datos: extraer automáticamente menciones de empresas y ubicaciones de grandes volúmenes de texto en inglés para alimentar dashboards o bases de datos.
- Construcción de grafos de conocimiento simples: poblar relaciones entidad-tipo a partir de corpus textuales en inglés de dominio genérico cercano a noticias.
- Componente de anotación asistida: sugerir etiquetas IOB2 a anotadores humanos en proyectos de etiquetado, reduciendo el coste de la anotación manual.
- Filtrado y búsqueda semántica: localizar documentos que mencionan organizaciones o lugares concretos combinando los spans extraídos con índices de búsqueda.
- Prototipado y docencia: reproducir la comparativa de métodos de adaptación de BERT sobre una tarea estándar con resultados documentados y reproducibles.
- Base para experimentos de investigación: servir como línea base de NER para comparar nuevas técnicas de ajuste (LoRA, adapters, feature-based) sobre el mismo benchmark.

## Benchmarks y rendimiento

Resultados reportados en la model card, calculados con `src/metrics.py` sobre semilla 42.

Split de validación:

| Metrica | Valor |
|---|---|
| loss | 0,0462 |
| precision | 0,9338 |
| recall | 0,9453 |
| f1 | 0,9395 |
| accuracy | 0,9882 |

Split de test:

| Metrica | Valor |
|---|---|
| loss | 0,1009 |
| precision | 0,8937 |
| recall | 0,9102 |
| f1 | 0,9019 |
| accuracy | 0,9805 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales, ya que el modelo es un clasificador de tokens y no un modelo generativo. Tampoco se dispone en la información proporcionada de métricas de robustez, adversariales, fuera de dominio o de equidad.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,45 GB en fp32 (108,9 M de parámetros × 4 bytes) y en torno a 0,22 GB en fp16. A esto hay que sumar la memoria de activaciones, que depende del batch y de la longitud de secuencia (máximo 128 tokens).
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo se entrenó en una Tesla T4 y también funciona en A100, H100, RTX 4090, RTX 3090 o GPUs de gama media equivalente.
- Cabe sin problemas en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y prácticamente cualquier GPU con al menos 2-4 GB de VRAM libre. También puede ejecutarse en CPU para lotes pequeños, con mayor latencia.
- Opciones de despliegue: `transformers` (inferencia directa con `pipeline`), servidores de inferencia compatibles con Hugging Face Endpoints (tag `endpoints_compatible`), y despliegues con vLLM o TGI adaptados a modelos de clasificación; también puede exportarse a ONNX para optimización en producción.
- Latencia y throughput: no disponible en la información proporcionada. El único dato temporal documentado es el tiempo de entrenamiento (160,4 s en T4 sobre 1.317 pasos).

## Comparativa con modelos similares

No se dispone de especificaciones técnicas detalladas (parámetros, contexto, métricas) de los modelos alternativos localizados en la búsqueda web, por lo que la comparación cuantitativa figura como "no disponible".

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| abelcetina/u2t01-bert-conll2003-ner | 108.898.569 | 128 tokens (entrenamiento) | Apache 2.0 | Hugging Face |
| AventIQ-AI/token-classification-CONLL-2003-NER | no disponible | no disponible | no disponible | Hugging Face |
| HeemaaAI/NER-BERT-CoNLL2003 | no disponible | no disponible | no disponible | GitHub |
| abbaouiAchraf/BERT_NER_Finetuning | no disponible | no disponible | no disponible | GitHub |

Todos los alternativos comparten el mismo enfoque (ajuste fino de BERT base sobre CoNLL-2003) y la misma tarea, pero no se han publicado en la información recuperada sus cifras de rendimiento ni sus condiciones de licencia, por lo que no puede establecerse una comparación de mérito.

## Limitaciones y advertencias

- Sesgo del dataset: el corpus Reuters de finales de los años 90 está fuertemente sesgado hacia los actores, las convenciones ortográficas y el vocabulario deportivo de esa época. El modelo hereda ese sesgo de dominio.
- Sesgo del preentrenamiento: `bert-base-uncased` se entrenó con BookCorpus y Wikipedia en inglés, corpus conocidos por codificar estereotipos de género, étnicos y ocupacionales. La model card indica explícitamente que nada en este ajuste mitiga ni mide esos sesgos.
- Riesgo de alucinación: aunque es un modelo discriminativo y no genera texto libre, puede producir etiquetas incorrectas o spans mal delimitados en dominios distintos al de entrenamiento.
- Semilla única: todos los números provienen de una sola ejecución con semilla 42, sin estimación de varianza. Diferencias de aproximadamente un punto frente a otras configuraciones deben interpretarse como ruido, no como mejora.
- Truncamiento de secuencia: las entradas se truncaron a 128 tokens durante el entrenamiento, por lo que en inferencia los textos más largos pierden la cola y el modelo no la procesa.
- Cobertura de evaluación limitada: solo se midió validación (y test), sin evaluación de robustez, adversarial, fuera de dominio ni de equidad.
- Restricciones de licencia: el modelo se publica bajo Apache 2.0, pero los datos de entrenamiento (CoNLL-2003, derivado de Reuters-21578) tienen licencia `other` y uso de investigación bajo los términos de Reuters. La model card advierte de que la redistribución comercial requiere verificar la licencia de los datos de entrenamiento.
- Uso fuera de alcance: no debe emplearse para decisiones que afecten a personas (contratación, moderación con consecuencias, crédito, decisiones legales o médicas), ni en idiomas distintos del inglés, ni en dominios alejados de la prosa periodística de Reuters de 1996-1997.
- Se trata de un modelo de trabajo académico, validado sobre un único benchmark y con una sola semilla, no de un sistema listo para producción sin validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abelcetina/u2t01-bert-conll2003-ner
- Dataset CoNLL-2003 (mirror parquet): https://huggingface.co/datasets/lhoestq/conll2003
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Paper de BERT (arXiv:1810.04805): https://arxiv.org/abs/1810.04805
- Modelo alternativo AventIQ-AI/token-classification-CONLL-2003-NER: https://huggingface.co/AventIQ-AI/token-classification-CONLL-2003-NER
- Modelo alternativo HeemaaAI/NER-BERT-CoNLL2003: https://github.com/HeemaaAI/NER-BERT-CoNLL2003
- Modelo alternativo abbaouiAchraf/BERT_NER_Finetuning: https://github.com/abbaouiAchraf/BERT_NER_Finetuning
- Notebook de referencia sobre BERT + CoNLL NER (practical-nlp): https://colab.research.google.com/github/practical-nlp/practical-nlp/blob/master/Ch5/05_BERT_CONLL_NER.ipynb
