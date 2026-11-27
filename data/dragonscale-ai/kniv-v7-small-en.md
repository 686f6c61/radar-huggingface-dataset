# dragonscale-ai/kniv-v7-small-en

## Resumen

kniv-v7-small-en es un codificador transformer multitarea en inglés desarrollado por Dragonscale (dragonscale-ai) que combina un analisis linguistico completo con extraccion de conocimiento contra un esquema definido en tiempo de inferencia. El modelo es un estudiante destilado de los dos modelos profesores kniv-v7-xlarge-u-en y kniv-v7-xlarge-d-en, construido sobre el codificador jhu-clsp/ettin-encoder-32m (32M de parametros en el tronco, 76M contando las cabezas de tarea).

Resuelve dos problemas en una sola pasada: por un lado, la capa linguistica (etiquetado morfosintactico, lematizacion, entidades nombradas, arboles de dependencias, roles semanticos, acto de dialogo y sentimiento por oracion, y correferencia); por otro, la capa de conocimiento, que extrae entidades del tipo indicado por el usuario y hechos para las relaciones tambien indicadas, anotando polaridad, modalidad, portador y tiempo de cada hecho. En una conversacion cada hablante se trata como una entidad, de modo que "I live in Berlin" produce la tupla `(user, lives in, Berlin)`.

Su relevancia actual reside en que ofrece las mismas salidas, grafos y runtime que los modelos grandes de la familia, pero con un coste computacional muy inferior: el repositorio ocupa 1,5 GB y distribuye grafos ONNX en fp16 e int8. Esta pensado para memoria de agentes, grafos de conocimiento, busqueda y analitica documental en ingles, sin necesidad de fine-tuning. La version actual es v7.1.2 (2026-11-13), con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder multitarea (ModernBERT, base ettin-encoder-32m) |
| Parametros totales | 76M (32M en el tronco del codificador + cabezas de tarea) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 512 palabras por ventana (1.024 subwords) |
| Tipos de cuantizacion | fp16 e int8 (grafos ONNX) |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (con tokenizer, settings y paquete Python `kniv_v7` incluidos en el repo) |

## Arquitectura y entrenamiento

El modelo es un codificador transformer multitarea basado en jhu-clsp/ettin-encoder-32m, un encoder de tipo ModernBERT de 32M de parametros. Sobre el tronco se montan cabezas de token-classification y text-classification que cubren simultaneamente POS, morfologia, lemas, NER, parsing de dependencias, roles semanticos, acto de dialogo, sentimiento, correferencia, extraccion de relaciones a nivel de documento y clasificacion de relaciones zero-shot. El modelo se distribuye como grafos ONNX (fp16 e int8) y se ejecuta mediante el paquete `kniv_v7` incluido en el repositorio.

Se trata de un estudiante destilado de los dos profesores de la familia, kniv-v7-xlarge-u-en (485M, sobre UltraBERT-380M) y kniv-v7-xlarge-d-en (538M, sobre deberta-v3-large). La destilacion busca replicar las salidas, los grafos y el runtime de los modelos grandes con un coste mucho menor. El autor no detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO; al ser un encoder multitarea supervisado, las metricas declaradas corresponden a tareas de etiquetado y clasificacion. La innovacion principal es la unificacion de toda la pila de analisis linguistico y extraccion de conocimiento en un unico encoder pequeno, con un esquema de relaciones y entidades configurable en inferencia.

## Capacidades

- Etiquetado gramatical (POS) y morfologia, con lematizacion.
- Reconocimiento de entidades nombradas (NER) y extraccion de entidades segun tipos definidos por el usuario.
- Parsing de dependencias y etiquetado de roles semanticos (SRL).
- Resolucion de correferencia.
- Extraccion de relaciones a nivel de documento y clasificacion de relaciones zero-shot contra un esquema en tiempo de inferencia.
- Extraccion de hechos con polaridad, modalidad, portador y tiempo; en conversaciones, cada hablante se modela como entidad (memoria de agente y de conversacion).
- Clasificacion de acto de dialogo y analisis de sentimiento por oracion.
- Salida orientada a grafos de conocimiento y a memoria conversacional de agentes.
- Capacidad zero-shot para tipos de entidad y relaciones no vistos durante el entrenamiento (con rendimiento limitado, ver benchmarks).
- No soporta otros idiomas distintos del ingles.

## Casos de uso

- Memoria de agentes conversacionales: el modelo procesa cada turno y produce hechos como `(user, lives in, Berlin)` con portador, polaridad y tiempo, lo que permite mantener una memoria estructurada y consultable del usuario a lo largo de una conversacion multi-turno.
- Construccion de grafos de conocimiento: a partir de prosa en ingles, extrae entidades y relaciones segun un esquema propio sin fine-tuning, alimentando bases de datos de grafos o almacenes RDF para analitica documental.
- Busqueda semantica y enriquecimiento de indices: el analisis linguistico (lemas, dependencias, entidades, roles) permite generar campos estructurados y metadatos que mejoran la recuperacion sobre corpus en ingles.
- Analitica de documentos y contratos: extraccion de entidades y hechos con modalidad y tiempo para resumir obligaciones, partes implicadas y condiciones en textos legales o financieros, siempre con revision humana dado el riesgo de error.
- Moderacion y analisis de opiniones: clasificacion de sentimiento y acto de dialogo por oracion para monitorizar conversaciones, tickets o resenas y detectar intenciones y tono.
- Preprocesado para pipelines de NLP aguas abajo: al ser un encoder pequeno en ONNX (fp16/int8), puede ejecutarse en CPU para tareas de POS, lematizacion y parsing que alimenten sistemas de traduccion, resumen o QA.
- Extraccion de relaciones zero-shot en dominios nuevos: definiendo relaciones y tipos de entidad en inferencia, se pueden prototipar esquemas de extraccion sin anotar datos, aceptando el coste en precision (F1 de 0,410 en CrossNER).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados de forma independiente):

| Tarea | Dataset (split test) | Metrica | Valor |
|---|---|---|---|
| Part-of-speech tagging | UD English EWT | UPOS accuracy | 0,972 |
| Dependency parsing | UD English EWT | LAS | 0,911 |
| Named entity recognition | OntoNotes 5.0 | span F1 | 0,827 |
| Semantic role labeling | PropBank EWT | end-to-end argument F1 | 0,773 |
| Coreference resolution | LitBank | CoNLL F1 | 0,630 |
| Document-level relation extraction | Re-DocRED | F1 (gold entities) | 0,672 |
| Document-level relation extraction | Re-DocRED | F1 (end to end) | 0,567 |
| Zero-shot relation classification | FewRel (15 unseen, train+validation) | macro F1, m=5 | 0,787 |
| Zero-shot named entity recognition | CrossNER (media de 4 dominios) | span F1 | 0,410 |

El propio autor senala que el modelo esta cerca de los profesores en etiquetado y parsing (POS 0,972, LAS 0,911), pero es claramente mas debil en NER, roles semanticos, correferencia, relaciones y tipos de entidad. No se han publicado en la informacion disponible resultados comparativos frente a modelos de terceros.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 76M de parametros, los pesos en fp16 ocupan del orden de 150 MB y en int8 alrededor de 75 MB, por lo que la huella es minima.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo esta pensado para ejecutarse tambien en CPU mediante ONNX Runtime.
- Cabe en GPU consumer: si, con amplio margen (RTX 3060, RTX 4090, etc.), e incluso en equipos sin GPU.
- Opciones de despliegue: ONNX Runtime con el paquete `kniv_v7` incluido en el repositorio; no se documentan integraciones con vLLM, TGI, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| kniv-v7-small-en (este) | 76M | 512 palabras (1.024 subwords) | Apache-2.0 | Estudiante destilado; POS 0,972, LAS 0,911, NER 0,827 |
| kniv-v7-large-en | 221M | no disponible | no disponible | Estudiante destilado sobre ModernBERT-base; recomendado por el autor para mejor calidad a tamano moderado |
| kniv-v7-xlarge-u-en | 485M | no disponible | no disponible | Profesor sobre UltraBERT-380M |
| kniv-v7-xlarge-d-en | 538M | no disponible | no disponible | Profesor sobre deberta-v3-large |

No se dispone en la informacion proporcionada de comparativas con modelos de otros desarrolladores (por ejemplo, encoders NER o de parsing de terceros).

## Limitaciones y advertencias

- Solo procesa ingles; cualquier otro idioma queda fuera de alcance.
- Rendimiento claramente inferior al de los profesores en NER, roles semanticos, correferencia, relaciones y tipos de entidad; el NER zero-shot en CrossNER cae a un F1 de 0,410.
- Riesgo de alucinacion y de extraccion incorrecta de hechos: el autor desaconseja actuar sobre los hechos extraidos sin revision en contextos medicos, legales, financieros o de decisiones laborales sobre personas.
- No debe usarse para perfilado de individuos sin consentimiento.
- Ventana limitada a 512 palabras (1.024 subwords); documentos mas largos requieren segmentacion en ventanas.
- Las metricas declaradas no estan verificadas de forma independiente (`verified: false` en la model-index).
- Existen modos de fallo conocidos documentados en GUIDE.md del repositorio, aplicables tambien a este modelo.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base ettin-encoder-32m y de los datos de entrenamiento de las tareas supervisadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dragonscale-ai/kniv-v7-small-en
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Profesor kniv-v7-xlarge-u-en: https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-u-en
- Profesor kniv-v7-xlarge-d-en: https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-d-en
- kniv-v7-tiny-en: https://huggingface.co/dragonscale-ai/kniv-v7-tiny-en
- kniv-v7-medium-en: https://huggingface.co/dragonscale-ai/kniv-v7-medium-en
- kniv-v7-large-en: https://huggingface.co/dragonscale-ai/kniv-v7-large-en
- Organizacion Dragonscale: https://huggingface.co/dragonscale-ai
