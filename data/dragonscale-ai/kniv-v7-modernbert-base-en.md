# dragonscale-ai/kniv-v7-modernbert-base-en

## Resumen

kniv-v7-modernbert-base-en es un encoder transformer multi-tarea desarrollado por Dragonscale (dragonscale-ai) que, a partir de un texto en inglés, produce un análisis lingüístico completo y extrae conocimiento estructurado contra un esquema definido en tiempo de inferencia. Se apoya en answerdotai/ModernBERT-base y cuenta con 221M parámetros, lo que lo sitúa como el miembro más ligero de la familia kniv v7, del que es un estudiante destilado de los modelos kniv-v7-ultrabert-380m-en y kniv-v7-deberta-v3-large-en.

El modelo resuelve dos capas de análisis en una sola pasada: una capa lingüística (etiquetado morfosintáctico, lemas, entidades nombradas, árboles de dependencias, roles semánticos, acto de diálogo y sentimiento por oración, y correferencia) y una capa de conocimiento (entidades de los tipos indicados, hechos para las relaciones indicadas, y para cada hecho su polaridad, modalidad, titular y tiempo). En conversaciones, cada hablante se trata como una entidad, de modo que "I moved to Lisbon" produce el hecho `(user, lives in, Lisbon)`.

Su relevancia actual radica en que ofrece extracción zero-shot contra esquemas arbitrarios sin fine-tuning, pensada para memoria de agentes, grafos de conocimiento, búsqueda y analítica documental, con un tamaño inferior a la mitad de sus profesores (221M frente a 485M y 538M) y aproximadamente el doble de velocidad en CPU. Se distribuye en formato ONNX con cuantizaciones fp16 e int8 bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder multi-tarea (ModernBERT) |
| Parametros totales | 221M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 512 palabras por ventana (1.024 subwords) |
| Tipos de cuantizacion | fp16, int8 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, inicializado desde answerdotai/ModernBERT-base y configurado como un modelo multi-tarea que comparte tronco para todas las cabeceras de salida. La model card lo describe como un estudiante destilado de dos profesores de la misma familia (kniv-v7-ultrabert-380m-en y kniv-v7-deberta-v3-large-en), con el objetivo de reproducir las mismas salidas, grafos y runtime con menos de la mitad de parámetros y aproximadamente el doble de velocidad en CPU. La ventana de entrada se especifica en hasta 512 palabras (1.024 subwords) por ventana.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco describe innovaciones arquitectónicas propias más allá de la destilación multi-profesor y de la integración de múltiples tareas lingüísticas y de extracción de conocimiento en un único encoder. La distribución se realiza exclusivamente mediante grafos ONNX junto con el tokenizer, los ajustes y el paquete Python `kniv_v7`, que convierte texto en resultados.

## Capacidades

- Análisis morfosintáctico: part-of-speech, morfología y lematización.
- Reconocimiento de entidades nombradas (NER) con tipos definidos en inferencia.
- Parsing de dependencias (árboles sintácticos).
- Etiquetado de roles semánticos (semantic role labeling).
- Resolución de correferencia.
- Clasificación de acto de diálogo y análisis de sentimiento por oración.
- Extracción de relaciones a nivel de documento, incluyendo polaridad, modalidad, titular y tiempo de cada hecho.
- Extracción zero-shot de entidades y relaciones contra un esquema proporcionado en tiempo de inferencia, sin fine-tuning.
- Modelado de conversaciones: cada hablante se trata como entidad, permitiendo hechos como `(user, lives in, Lisbon)`.
- Orientado a memoria conversacional y memoria de agentes, grafos de conocimiento y analítica documental.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking o razonamiento generativo: no disponible (es un encoder, no un modelo generativo).

## Casos de uso

- Memoria de agentes conversacionales: el modelo analiza los turnos de una conversación pasando una lista de tuplas `(hablante, texto)` y devuelve hechos estructurados con sujeto, relación, objeto, polaridad, modalidad y tiempo. Es adecuado porque trata a cada hablante como entidad y permite mantener un estado de memoria actualizado sin fine-tuning.
- Construcción de grafos de conocimiento: a partir de prosa en inglés, se le suministran los tipos de entidad y las relaciones de interés con su descripción, y el modelo extrae las tripletas correspondientes para poblar un grafo. Encaja por su extracción zero-shot contra esquemas arbitrarios.
- Búsqueda semántica y enriquecimiento de índices: el análisis lingüístico (lemas, POS, dependencias, NER) permite enriquecer documentos antes de indexarlos, mejorando la recuperación sobre texto en inglés.
- Analítica documental: extracción de entidades, relaciones y sentimiento por oración sobre corpus de prosa inglesa para informes y paneles de análisis.
- Procesamiento de conversaciones de atención al cliente: clasificación de actos de diálogo y sentimiento por oración, junto con extracción de hechos relevantes del cliente (por ejemplo, ubicación o empleador) para su registro estructurado.
- Anotación lingüística para NLP downstream: generación de análisis morfosintáctico completo (POS, lemas, dependencias, roles semánticos, correferencia) como paso previo a pipelines de procesamiento del lenguaje.
- Despliegue en entornos con recursos limitados: al ser un encoder de 221M parámetros con grafos ONNX en fp16 e int8 y aproximadamente el doble de velocidad en CPU que sus profesores, es apto para servicios en CPU o en hardware modesto.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Part-of-speech tagging | UD English EWT (test) | UPOS accuracy | 0,981 |
| Dependency parsing | UD English EWT (test) | LAS | 0,926 |
| Named entity recognition | OntoNotes 5.0 (test) | span F1 | 0,863 |
| Semantic role labeling | PropBank EWT (test) | end-to-end argument F1 | 0,807 |
| Coreference resolution | LitBank (test) | CoNLL F1 | 0,667 |
| Document-level relation extraction | Re-DocRED (test) | F1 (gold entities) | 0,725 |
| Document-level relation extraction | Re-DocRED (test) | F1 (end to end) | 0,608 |
| Zero-shot relation classification | FewRel (15 unseen, train+validation) | macro F1, m=5 | 0,798 |
| Zero-shot named entity recognition | CrossNER (test) | span F1, media de 4 dominios | 0,496 |

Según la model card, el modelo queda a menos de un punto del mejor profesor en etiquetado, parsing, NER y roles semánticos, y a menos de dos puntos en relaciones a nivel de documento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada; con 221M parámetros, las variantes fp16 e int8 reducen sustancialmente el peso respecto a los pesos completos.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: ONNX Runtime (dependencias indicadas: `onnxruntime`, `tokenizers`, `numpy`, `huggingface_hub`), cargando el paquete `kniv_v7` incluido en el repositorio.
- Latencia y throughput: la model card indica aproximadamente el doble de velocidad en CPU que sus profesores (485M y 538M parámetros); no se publican cifras absolutas de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| kniv-v7-modernbert-base-en | 221M | 512 palabras / 1.024 subwords | Apache-2.0 | Estudiante destilado; ~2x más rápido en CPU que sus profesores |
| kniv-v7-ultrabert-380m-en | 380M | no disponible | no disponible | Profesor; mejor en tipos de entidad no vistos y correferencia |
| kniv-v7-deberta-v3-large-en | 538M | no disponible | no disponible | Profesor; mejor en tipos de entidad no vistos y correferencia |

La model card recomienda elegir un profesor si priman la correferencia o los tipos de entidad con nombres no vistos. No se dispone de datos de benchmarks de los profesores en la información proporcionada para comparar cifra a cifra.

## Limitaciones y advertencias

- Solo admite inglés; el resto de idiomas queda fuera de alcance.
- Es más débil en tipos de entidad con nombres no vistos (CrossNER span F1 medio de 0,496 en cuatro dominios) y en correferencia (CoNLL F1 de 0,667 en LitBank).
- No debe usarse para actuar sobre hechos extraídos sin revisión en contextos donde los errores importan (decisiones médicas, legales, financieras o de empleo sobre personas).
- No debe emplearse para perfilado de individuos sin su consentimiento.
- La model card remite a GUIDE.md para los modos de fallo conocidos de la familia kniv v7 y sus soluciones; dichos modos aplican también a este modelo.
- Riesgo de alucinación y sesgos conocidos: no disponible en la información proporcionada.
- Restricciones de licencia para uso comercial: licencia Apache-2.0, que permite uso comercial; no se indican restricciones adicionales en la información disponible.
- Los resultados de benchmarks son declarados por el autor y figuran como no verificados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dragonscale-ai/kniv-v7-modernbert-base-en
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Profesor kniv-v7-ultrabert-380m-en: https://huggingface.co/dragonscale-ai/kniv-v7-ultrabert-380m-en
- Profesor kniv-v7-deberta-v3-large-en: https://huggingface.co/dragonscale-ai/kniv-v7-deberta-v3-large-en
- Guía de modos de fallo (GUIDE.md): incluida en el repositorio del modelo (https://huggingface.co/dragonscale-ai/kniv-v7-modernbert-base-en/blob/main/GUIDE.md)
