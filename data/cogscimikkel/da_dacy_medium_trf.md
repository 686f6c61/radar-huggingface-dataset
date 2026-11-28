# CogSciMikkel/da_dacy_medium_trf

## Resumen

DaCy Medium (`da_dacy_medium_trf`) es un pipeline de procesamiento del lenguaje natural para danés construido sobre spaCy 3.8 y el modelo transformer `vesteinn/ScandiBERT-no-faroese`. Lo desarrollan Johana Mayerová, Mikkel Krøjer Svendsen y Kenneth Enevoldsen en el marco del proyecto DaCy (Centre for Humanities Computing, Universidad de Aarhus), un framework que agrupa pipelines de altas prestaciones para el análisis lingüístico del danés junto con herramientas de evaluación de sesgos y robustez.

El modelo no es un generador de texto: es un pipeline de etiquetado a nivel de token que resuelve de una pasada seis tareas lingüísticas fundamentales (segmentación de frases, etiquetado POS, morfología, lematización, análisis de dependencias y reconocimiento de entidades nombradas) sobre texto en danés. Su relevancia radica en que ofrece anotación lingüística completa y coherente con el estándar Universal Dependencies, con una precisión superior al 98 % en POS y morfología y un F1 de 0,860 en NER, lo que lo convierte en una pieza de infraestructura para construir pipelines downstream (extracción de información, análisis de corpus, sistemas de búsqueda semántica) sin necesidad de entrenar componentes por separado.

La variante "medium" se refiere al tamaño del pipeline dentro de la familia DaCy, que también incluye versiones small, large y un modelo específico para NER. El repositorio ocupa 2,3 GB y la licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ScandiBERT) + componentes spaCy: tagger, morphologizer, trainable_lemmatizer, parser y ner |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitada por el encoder ScandiBERT subyacente; no declarada en la model card) |
| Tipos de cuantizacion | no disponible (pesos spaCy; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | danés (`da`) |
| Licencia | Apache-2.0 |
| Formato de pesos | spaCy (paquete instalable con `spacy` >=3.8.14,<3.9.0); no se distribuyen safetensors ni GGUF |
| Modelo base | `vesteinn/ScandiBERT-no-faroese` |
| Version del pipeline | 1.0.0 |
| Componentes | transformer, tagger, morphologizer, trainable_lemmatizer, parser, ner |
| Etiquetas | 218 etiquetas en 4 componentes |
| Vectores estaticos | 0 claves, 0 vectores (0 dimensiones) |
| Tamano del repositorio | 2,3 GB |
| Descargas | 339 |
| Fecha de creacion | 2026-09-14 |
| Ultima actualizacion | 2026-10-26 |

## Arquitectura y entrenamiento

El pipeline combina un encoder transformer (ScandiBERT sin faroés, un modelo de lenguaje enmascarado entrenado sobre lenguas escandinavas) con cinco componentes de spaCy entrenados de forma supervisada: un tagger para etiquetas XPOS, un morphologizer para rasgos UFeats, un lematizador entrenable, un parser de dependencias y un reconocedor de entidades. La salida del transformer se comparte entre todos los componentes, de modo que una sola pasada produce la anotación lingüística completa. No se documentan en la información disponible el número de parámetros del encoder, la longitud máxima de secuencia ni el volumen total de tokens de entrenamiento.

Los datos de entrenamiento declarados son UD Danish DDT v2.18 (dependencias y morfología), DaCoref (correferencia), DaNE (entidades nombradas) y `chcaa/dacy-data`. No se especifica en la model card si hubo fases de ajuste fino adicionales, destilación o entrenamiento multi-tarea conjunto, ni se detallan hiperparámetros. La innovación principal del proyecto DaCy no está en la arquitectura sino en el empaquetado: unificar anotación morfosintáctica, dependencias y NER en un único pipeline reproducible, con guías de uso y tests de comportamiento para medir sesgos y robustez de los pipelines daneses.

## Capacidades

- Segmentación de frases (F-score 0,977).
- Etiquetado POS con el juego Universal Dependencies (UPOS, accuracy 0,985) y XPOS (accuracy 0,984).
- Anotación morfológica de rasgos UFeats (accuracy 0,983): género, número, definitud, caso, tiempo, modo, voz, grado, tipo de pronombre, entre otros.
- Lematización entrenable (accuracy 0,966).
- Análisis de dependencias sintácticas: UAS 0,896 y LAS 0,866.
- Reconocimiento de entidades nombradas (NER): precisión 0,839, recall 0,883, F1 0,860.
- Anotación de correferencia disponible en el ecosistema DaCoref, aunque no figura como componente del pipeline por defecto.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio: es un modelo discriminativo de etiquetado.
- Monolingüe: únicamente danés.

## Casos de uso

- Análisis de corpus lingüísticos: procesar grandes volúmenes de texto danés (prensa, literatura, transcripciones) para obtener árboles de dependencias, lemas y rasgos morfológicos listos para estudios cuantitativos, gracias al rendimiento del parser (LAS 0,866) y a la coherencia con el estándar UD.
- Extracción de entidades en documentos: detectar personas, organizaciones y localizaciones en informes o contratos en danés con un F1 de 0,860, suficiente para tareas de enriquecimiento documental y filtrado previo a revisión humana.
- Construcción de índices de búsqueda semántica y motores de búsqueda léxica: la lematización (accuracy 0,966) permite normalizar términos y mejorar el recall en buscadores internos sobre contenido danés.
- Preprocesado para pipelines de NLP downstream: etiquetar POS y dependencias como características de entrada para clasificadores de sentimiento, sistemas de extracción de relaciones o modelos de resumen sobre danés.
- Anonimización y cumplimiento de RGPD: el componente NER permite localizar nombres de personas y organizaciones en textos daneses antes de almacenarlos o compartirlos, con revisión humana sobre los falsos negativos (recall 0,883 implica que aproximadamente un 12 % de las entidades pueden escaparse).
- Investigación en lingüística computacional: evaluación de sesgos y robustez de pipelines daneses mediante los tests de comportamiento incluidos en el repositorio DaCy, y comparación entre las variantes small, medium y large del framework.
- Enriquecimiento de bases de datos de recursos humanos o legales: extracción estructurada de entidades y relaciones sintácticas de currículos o contratos en danés para poblar sistemas de gestión documental.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Metrica | Valor |
|---|---|---|
| NER | Precision | 0,8386 |
| NER | Recall | 0,8832 |
| NER | F-score | 0,8603 |
| TAG (XPOS) | Accuracy | 0,9840 |
| POS (UPOS) | Accuracy | 0,9848 |
| MORPH (UFeats) | Accuracy | 0,9828 |
| LEMMA | Accuracy | 0,9662 |
| UNLABELED_DEPENDENCIES | UAS | 0,8958 |
| LABELED_DEPENDENCIES | LAS | 0,8664 |
| SENTS | F-score | 0,9767 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos daneses (por ejemplo, variantes small o large de DaCy, o modelos de la familia Ælægt) ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 2,3 GB, por lo que en FP32 se puede estimar un consumo de memoria en el rango de 2 a 4 GB, dependiendo del lote y la longitud de secuencia; esta cifra es una estimación, no un dato del autor.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM debería ser suficiente para inferencia en lotes pequeños; no se documentan configuraciones de referencia.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores; también puede ejecutarse en CPU con latencia mayor.
- Opciones de despliegue: spaCy (`spacy.load("da_dacy_medium_trf")`), con soporte de `nlp.pipe` para procesamiento por lotes. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks de las variantes small y large de DaCy ni de otros pipelines daneses comparables, por lo que la comparación cuantitativa no está disponible. Cualitativamente:

| Modelo | Tipo | Idioma | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| da_dacy_medium_trf | Pipeline spaCy (transformer + componentes) | Danés | no disponible | Apache-2.0 | Hugging Face, repo DaCy |
| da_dacy_small_trf (variante DaCy) | Pipeline spaCy | Danés | no disponible | Apache-2.0 (presumible) | Hugging Face |
| da_dacy_large_trf (variante DaCy) | Pipeline spaCy | Danés | no disponible | Apache-2.0 (presumible) | Hugging Face |

No se han publicado en la información disponible métricas de las variantes small y large que permitan establecer diferencias de rendimiento frente a medium.

## Limitaciones y advertencias

- Modelo monolingüe: solo procesa danés; el rendimiento en otros idiomas, incluidos noruego o sueco pese al origen escandinavo del encoder, no está documentado y previsiblemente será degradado.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de errores de anotación: un recall de NER de 0,883 implica que aproximadamente un 12 % de las entidades pueden no detectarse, lo que desaconseja su uso sin revisión humana en tareas críticas como anonimización.
- El parser de dependencias tiene un LAS de 0,866, por lo que las relaciones sintácticas en frases largas o construcciones complejas pueden ser incorrectas.
- Sesgos: el proyecto DaCy incluye tests de comportamiento para medir sesgos, pero la model card no documenta sesgos específicos detectados en esta variante; conviene ejecutar dichos tests antes de desplegar en producción.
- Dependencia de versión estricta: requiere spaCy >=3.8.14,<3.9.0; actualizar spaCy fuera de ese rango puede romper la carga del pipeline.
- Sin vectores estáticos (0 dimensiones): no proporciona similitudes léxicas basadas en vectores; para tareas de similitud semántica hay que recurrir al encoder subyacente o a otro modelo.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; no se documentan restricciones adicionales.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en la model-index).
- El tamaño del repositorio (2,3 GB) y la ausencia de cuantizaciones documentadas limitan su despliegue en entornos con restricciones de almacenamiento o memoria muy estrictas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CogSciMikkel/da_dacy_medium_trf
- Repositorio DaCy: https://github.com/centre-for-humanities-computing/Dacy
- Documentación DaCy: https://centre-for-humanities-computing.github.io/DaCy/
- Modelo base ScandiBERT: https://huggingface.co/vesteinn/ScandiBERT-no-faroese
- Dataset DaNE: https://huggingface.co/datasets/dane
- Dataset DaCoref: https://huggingface.co/datasets/alexandrainst/dacoref
- Dataset DaCy Data: https://huggingface.co/datasets/chcaa/dacy-data
- Dataset Dane (Alexandra Institute): https://huggingface.co/datasets/alexandrainst/dane
- UD Danish DDT: https://github.com/UniversalDependencies/UD_Danish-DDT
- Universal Dependencies: https://huggingface.co/datasets/universal-dependencies/universal_dependencies
