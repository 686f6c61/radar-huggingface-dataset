# dragonscale-ai/kniv-v7-medium-en

## Resumen

kniv-v7-medium-en es un codificador transformer multi-tarea en inglés desarrollado por Dragonscale (dragonscale-ai) que, a partir de una única pasada, produce un análisis lingüístico completo y extrae conocimiento estructurado contra un esquema definido en tiempo de inferencia. Está construido sobre el encoder jhu-clsp/ettin-encoder-68m (ModernBERT de 68M de parámetros) y suma 122M de parámetros totales al incluir las cabezas de predicción. Se distribuye en formato ONNX con variantes fp16 e int8.

El modelo resuelve el problema de la extracción de información sin fine-tuning: el usuario define en inferencia qué tipos de entidad y qué relaciones quiere extraer, y el modelo devuelve entidades, hechos con polaridad, modalidad, titular y tiempo, además de una capa lingüística completa (POS, morfología, lemas, NER, árboles de dependencias, roles semánticos, acto de diálogo, sentimiento y correferencia). Es un estudiante destilado de los dos modelos kniv v7 xlarge (kniv-v7-xlarge-u-en y kniv-v7-xlarge-d-en), por lo que reproduce sus salidas y grafos con un coste computacional mucho menor.

Su relevancia actual radica en que permite construir memoria de agentes, grafos de conocimiento y analítica documental en inglés con un encoder pequeño, desplegable en CPU o en GPU de consumo, y con licencia Apache-2.0. La versión documentada es la v7.1.2 (`ettin-68m-s30-coref`, 2026-11-13).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder multi-tarea (ModernBERT, base jhu-clsp/ettin-encoder-68m) |
| Parametros totales | 122M (68M del encoder + cabezas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 512 palabras por ventana (1024 subwords) |
| Tipos de cuantizacion | fp16, int8 (variantes ONNX cuantizadas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafos), tokenizer incluido en el repositorio |

## Arquitectura y entrenamiento

Se trata de un encoder transformer multi-cabeza construido sobre ettin-encoder-68m, un modelo de la familia ModernBERT, al que se añaden cabezas de predicción para cada tarea (etiquetado de tokens, clasificación de sentimiento y acto de diálogo, parsing de dependencias, roles semánticos, correferencia y extracción de relaciones). El modelo es un estudiante destilado de los dos profesores kniv-v7-xlarge-u-en (UltraBERT-380M, 485M parámetros) y kniv-v7-xlarge-d-en (deberta-v3-large, 538M parámetros), de modo que aprende a reproducir sus salidas, grafos y comportamiento en tiempo de ejecución con una fracción del coste.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. El modelo declara soporte de extracción zero-shot de entidades y relaciones contra un esquema definido en inferencia, lo que sugiere un entrenamiento orientado a generalización de esquemas. La entrada se procesa en ventanas de hasta 512 palabras (1024 subwords).

## Capacidades

- Análisis lingüístico completo en inglés: etiquetado POS (UPOS), morfología, lematización, NER, árboles de dependencias, roles semánticos (SRL), acto de diálogo y sentimiento por oración, y resolución de correferencia.
- Extracción de conocimiento contra un esquema definido en inferencia: entidades de los tipos que el usuario nombre y hechos para las relaciones que especifique (nombre más descripción opcional).
- Para cada hecho extraído devuelve polaridad, modalidad, titular y tiempo.
- Modelado de conversaciones: cada hablante se trata como una entidad, de modo que "I live in Berlin" produce el hecho `(user, lives in, Berlin)`, lo que habilita memoria conversacional y de agentes.
- Extracción de relaciones a nivel de documento y clasificación de relaciones zero-shot.
- Soporte de NER zero-shot sobre dominios no vistos.
- Orientado a grafos de conocimiento, búsqueda y analítica documental.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso explícito; es un encoder de extracción, no un modelo generativo.

## Casos de uso

- Memoria de agentes conversacionales: el modelo convierte cada turno en hechos estructurados con hablante, relación, polaridad y tiempo, lo que permite mantener un estado de memoria persistente y consultable en lugar de reinyectar todo el historial en el contexto.
- Construcción de grafos de conocimiento en inglés: a partir de documentos de prosa, extrae entidades y relaciones según un esquema propio sin necesidad de fine-tuning, alimentando bases de datos de grafos para búsqueda y recomendación.
- Analítica documental y extracción de información: procesa contratos, informes o artículos en ventanas de 512 palabras para poblar tablas de entidades y hechos, con la ventaja de un encoder pequeño desplegable en CPU.
- Enriquecimiento de pipelines de búsqueda: añade anotaciones lingüísticas (lemas, POS, dependencias, NER) a los documentos para mejorar indexación, filtrado y recuperación semántica.
- Análisis de sentimiento y actos de diálogo por oración: útil para monitorización de conversaciones, análisis de atención al cliente o evaluación de calidad de diálogos.
- Preprocesado para sistemas downstream: genera árboles de dependencias, roles semánticos y correferencia que pueden consumir sistemas de resumen, traducción o extracción posteriores.
- Clasificación de relaciones zero-shot: permite etiquetar relaciones nuevas definidas en el momento de la inferencia sin reentrenar, adecuado para dominios cambiantes.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Part-of-speech tagging | UD English EWT (test) | UPOS accuracy | 0.975 |
| Dependency parsing | UD English EWT (test) | LAS | 0.919 |
| Named entity recognition | OntoNotes 5.0 (test) | span F1 | 0.835 |
| Semantic role labeling | PropBank EWT (test) | end-to-end argument F1 | 0.792 |
| Coreference resolution | LitBank (test) | CoNLL F1 | 0.644 |
| Document-level relation extraction | Re-DocRED (test) | F1 (gold entities) | 0.703 |
| Document-level relation extraction | Re-DocRED (test) | F1 (end to end) | 0.605 |
| Zero-shot relation classification | FewRel (15 unseen, train+validation) | macro F1, m=5 | 0.749 |
| Zero-shot named entity recognition | CrossNER (test) | span F1, media de 4 dominios | 0.452 |

El autor indica que el modelo está cerca de los profesores en etiquetado, parsing y roles semánticos, y en relaciones end to end (0.605 frente a 0.608 de kniv-v7-large-en, 1,8 veces su tamaño), pero es más débil en NER, correferencia y tipos de entidad.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida por el tamaño (122M parámetros). En fp16, los pesos ocupan aproximadamente 0,25 GB; en int8, alrededor de 0,12 GB, más el overhead de las cabezas y del runtime ONNX.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso GPUs de gama baja sobran para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con unos pocos GB de VRAM; también es viable en CPU.
- Opciones de despliegue: al distribuirse como grafos ONNX, se ejecuta con ONNX Runtime (CPU o GPU); no se documenta soporte nativo de vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| kniv-v7-medium-en | 122M | 512 palabras (1024 subwords) | Encoder multi-tarea, extracción zero-shot | Apache-2.0 |
| kniv-v7-large-en | 221M | no disponible | Estudiante destilado, misma familia | Apache-2.0 |
| kniv-v7-xlarge-d-en | 538M | no disponible | Profesor (deberta-v3-large) | Apache-2.0 |
| kniv-v7-xlarge-u-en | 485M | no disponible | Profesor (UltraBERT-380M) | Apache-2.0 |

Frente a kniv-v7-large-en, el modelo medium es un 45% más pequeño y obtiene 0.605 en relaciones end to end frente a 0.608, aunque es más débil en NER, correferencia y tipos de entidad. Los profesores xlarge ofrecen mayor calidad a costa de 4-4,4 veces más parámetros.

## Limitaciones y advertencias

- Solo soporta inglés; queda fuera de alcance cualquier otro idioma.
- Es más débil que sus profesores en NER, correferencia y tipos de entidad (CrossNER span F1 de 0.452 y CoNLL F1 de 0.644 en LitBank).
- Los resultados de benchmarks son declarados por el autor y no están verificados.
- No debe usarse para actuar sobre hechos extraídos sin revisión en contextos donde los errores importan (decisiones médicas, legales, financieras o laborales sobre personas).
- No debe emplearse para perfilado de individuos sin su consentimiento.
- La guía GUIDE.md del autor documenta modos de fallo conocidos de la familia kniv v7 que también aplican a este modelo.
- La ventana de 512 palabras obliga a trocear documentos largos en ventanas, lo que puede afectar a la correferencia y a las relaciones a nivel de documento.
- Al ser un encoder de extracción, no genera texto libre ni razona de forma multi-paso; no sustituye a un LLM generativo.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones de los datasets de evaluación citados si se redistribuyen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dragonscale-ai/kniv-v7-medium-en
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- Profesor kniv-v7-xlarge-u-en: https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-u-en
- Profesor kniv-v7-xlarge-d-en: https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-d-en
- kniv-v7-large-en: https://huggingface.co/dragonscale-ai/kniv-v7-large-en
- kniv-v7-small-en: https://huggingface.co/dragonscale-ai/kniv-v7-small-en
- kniv-v7-tiny-en: https://huggingface.co/dragonscale-ai/kniv-v7-tiny-en
- Guía de modos de fallo (GUIDE.md): incluida en el repositorio del modelo
