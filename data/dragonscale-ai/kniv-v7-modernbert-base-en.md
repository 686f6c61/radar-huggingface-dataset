# dragonscale-ai/kniv-v7-modernbert-base-en

## Resumen

kniv-v7-large-en es un encoder transformer multi-tarea desarrollado por Dragonscale (dragonscale-ai) que realiza analisis linguistico completo y extraccion de conocimiento estructurado en ingles. Se trata de un estudiante destilado de los modelos kniv-v7-xlarge-u-en y kniv-v7-xlarge-d-en, construido sobre answerdotai/ModernBERT-base con 221M parametros. Su proposito es ofrecer, en un unico modelo, capas de analisis linguistico (POS, morfologia, lemas, entidades, dependencias, roles semanticos, actos de dialogo, sentimiento y correferencia) y una capa de conocimiento que extrae entidades y hechos segun un esquema definido en tiempo de inferencia.

El modelo resuelve el problema de la extraccion de informacion zero-shot contra esquemas arbitrarios sin necesidad de fine-tuning, lo que lo hace util para memoria de agentes, grafos de conocimiento, busqueda y analitica documental. Cada hecho extraido incluye polaridad, modalidad, titular y tiempo, y en conversaciones cada hablante se trata como una entidad, permitiendo obtener tripletas como `(user, lives in, Berlin)`.

Es relevante porque condensa las capacidades de dos modelos profesores (485M y 538M parametros) en menos de la mitad del tamano, con aproximadamente el doble de velocidad en CPU y una diferencia de menos de un punto en etiquetado, parsing, NER y roles semanticos, y de menos de dos puntos en relaciones a nivel de documento. Se distribuye en formato ONNX con cuantizacion fp16 e int8, licencia Apache-2.0 y ventana de 512 palabras (1.024 subwords).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder multi-tarea (ModernBERT-base) |
| Parametros totales | 221M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 512 palabras por ventana (1.024 subwords) |
| Tipos de cuantizacion | fp16, int8 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafos), tokenizer y paquete Python `kniv_v7` incluidos en el repositorio |

## Arquitectura y entrenamiento

El modelo es un encoder transformer multi-tarea basado en ModernBERT-base, con 221M parametros. Se trata de un estudiante destilado de dos profesores: kniv-v7-xlarge-u-en (UltraBERT-380M, 485M parametros) y kniv-v7-xlarge-d-en (deberta-v3-large, 538M parametros). La destilacion busca reproducir las mismas salidas, grafos y runtime que los profesores con menos de la mitad del tamano y aproximadamente el doble de velocidad en CPU.

La arquitectura combina una capa linguistica (part-of-speech, morfologia, lemas, entidades nombradas, arboles de dependencias, roles semanticos, acto de dialogo y sentimiento por frase, correferencia) con una capa de conocimiento que extrae entidades de los tipos indicados en inferencia y hechos para las relaciones especificadas, anadiendo polaridad, modalidad, titular y tiempo a cada hecho. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. La version del modelo es kniv v7.1.2 (`modernbert-base-nerkd`), publicada el 2026-11-13, con versiones previas v7.1.1 (2026-11-09), v7.1 (2026-11-03) y v7.0 (2026-10-30).

## Capacidades

- Etiquetado gramatical completo: part-of-speech, morfologia y lematizacion.
- Reconocimiento de entidades nombradas (NER) con soporte zero-shot para tipos definidos en inferencia.
- Parsing de dependencias sintacticas.
- Etiquetado de roles semanticos (semantic role labeling).
- Resolucion de correferencia.
- Clasificacion de actos de dialogo y analisis de sentimiento por frase.
- Extraccion de relaciones a nivel de documento, incluyendo polaridad, modalidad, titular y tiempo de cada hecho.
- Extraccion de conocimiento contra un esquema arbitrario en tiempo de inferencia, sin fine-tuning.
- Clasificacion de relaciones zero-shot.
- Soporte para memoria conversacional y de agentes: cada hablante se modela como entidad.
- Capacidades orientadas a grafos de conocimiento y busqueda semantica.
- No dispone de tool calling, function calling ni razonamiento multi-paso generativo: es un encoder de extraccion, no un modelo generativo.

## Casos de uso

- Memoria de agentes conversacionales: el modelo procesa cada turno de dialogo y extrae hechos estructurados como `(user, lives in, Berlin)`, incluyendo polaridad y tiempo, lo que permite construir una memoria persistente y consultable del estado del usuario sin fine-tuning.
- Construccion de grafos de conocimiento: a partir de documentos en ingles, extrae entidades de tipos definidos por el usuario y relaciones con sus atributos (polaridad, modalidad, titular, tiempo), alimentando directamente un grafo o una base de datos de tripletas.
- Analisis documental y extraccion de informacion: en pipelines de procesamiento de documentos legales, financieros o tecnicos en ingles, el modelo identifica entidades, relaciones y estructura sintactica para enriquecer indices de busqueda.
- Busqueda semantica y recuperacion aumentada: las anotaciones linguisticas (lemas, dependencias, roles semanticos) y las entidades extraidas permiten enriquecer consultas y documentos con metadatos estructurados que mejoran la recuperacion.
- Analitica de conversaciones y atencion al cliente: la clasificacion de actos de dialogo y el sentimiento por frase permiten segmentar y analizar transcripciones de soporte, midiendo la evolucion del sentimiento y los tipos de intervencion.
- Preprocesamiento para pipelines de NLP: al ofrecer POS, lemas, dependencias, NER y correferencia en un unico modelo ONNX de 221M parametros, sustituye a varias herramientas especializadas en tareas de anotacion linguistica, con despliegue simplificado.
- Analisis de resenas y opinion: la extraccion de sentimiento por frase junto con la deteccion de entidades y relaciones permite atribuir opiniones a entidades concretas dentro de textos en ingles.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Part-of-speech tagging | UD English EWT (test) | UPOS accuracy | 0,981 |
| Dependency parsing | UD English EWT (test) | LAS | 0,926 |
| Named entity recognition | OntoNotes 5.0 (test) | span F1 | 0,863 |
| Semantic role labeling | PropBank EWT (test) | end-to-end argument F1 | 0,807 |
| Coreference resolution | LitBank (test) | CoNLL F1 | 0,671 |
| Document-level relation extraction | Re-DocRED (test) | F1 (gold entities) | 0,725 |
| Document-level relation extraction | Re-DocRED (test) | F1 (end to end) | 0,608 |
| Zero-shot relation classification | FewRel (15 unseen, train+validation) | macro F1, m=5 | 0,798 |
| Zero-shot named entity recognition | CrossNER (test) | span F1, media de 4 dominios | 0,503 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en estos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 221M parametros, en fp16 el modelo ocupa aproximadamente 0,44 GB de pesos y en int8 aproximadamente 0,22 GB, a lo que hay que sumar el overhead del runtime ONNX y las activaciones.
- GPU recomendadas: cualquier GPU moderna con al menos 1-2 GB de memoria libre es suficiente; el modelo esta pensado para ejecucion eficiente en CPU, donde el autor declara aproximadamente el doble de velocidad que los profesores.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual (por ejemplo, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: el repositorio incluye los grafos ONNX, el tokenizer, la configuracion y el paquete Python `kniv_v7`, que transforma texto en resultados. El autor indica que todo lo necesario esta en el repositorio y que no hay nada mas que instalar. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no se proporcionan cifras concretas; solo la comparacion cualitativa de aproximadamente el doble de velocidad en CPU frente a los profesores.

## Comparativa con modelos similares

| Modelo | Base encoder | Parametros | Rol | Contexto | Licencia |
|---|---|---|---|---|---|
| kniv-v7-large-en (este modelo) | ModernBERT-base | 221M | estudiante destilado | 512 palabras (1.024 subwords) | Apache-2.0 |
| kniv-v7-xlarge-u-en | UltraBERT-380M | 485M | profesor | no disponible | no disponible |
| kniv-v7-xlarge-d-en | deberta-v3-large | 538M | profesor | no disponible | no disponible |
| kniv-v7-medium-en | ettin-encoder-68m | 122M | estudiante destilado | no disponible | no disponible |

El autor indica que este modelo queda a menos de un punto del mejor profesor en etiquetado, parsing, NER y roles semanticos, y a menos de dos puntos en relaciones a nivel de documento. Es mas debil en tipos de entidad con nombres no vistos y en correferencia, por lo que recomienda elegir un profesor si esas capacidades son prioritarias. No se dispone de comparativas con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no es adecuado para otros idiomas.
- Es mas debil que los profesores en tipos de entidad con nombres no vistos y en correferencia (CoNLL F1 de 0,671 en LitBank).
- El rendimiento zero-shot en NER sobre dominios no vistos es limitado (span F1 de 0,503 en CrossNER, media de 4 dominios).
- No debe usarse para actuar sobre hechos extraidos sin revision en contextos donde los errores importan (decisiones medicas, legales, financieras o de empleo sobre personas).
- No debe usarse para perfilado de individuos sin su consentimiento.
- Riesgo de alucinacion y errores de extraccion inherente a un modelo de 221M destilado; el autor remite a GUIDE.md para conocer los modos de fallo conocidos y como mitigarlos en el codigo propio.
- La ventana de contexto esta limitada a 512 palabras por ventana (1.024 subwords).
- Los benchmarks publicados no estan verificados (`verified: false` en la model-index).
- La licencia Apache-2.0 permite uso comercial, pero deben respetarse las condiciones de los datos de entrenamiento subyacentes, no detalladas en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dragonscale-ai/kniv-v7-modernbert-base-en
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Profesor kniv-v7-xlarge-u-en: https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-u-en
- Profesor kniv-v7-xlarge-d-en: https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-d-en
- Estudiante kniv-v7-tiny-en: https://huggingface.co/dragonscale-ai/kniv-v7-tiny-en
- Estudiante kniv-v7-small-en: https://huggingface.co/dragonscale-ai/kniv-v7-small-en
- Estudiante kniv-v7-medium-en: https://huggingface.co/dragonscale-ai/kniv-v7-medium-en
- Guia de modos de fallo (GUIDE.md): incluida en el repositorio del modelo
- Organizacion del autor: https://huggingface.co/dragonscale-ai
