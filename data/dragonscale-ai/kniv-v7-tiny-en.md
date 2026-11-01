# dragonscale-ai/kniv-v7-tiny-en

## Resumen

kniv-v7-tiny-en es un encoder transformer multitarea en inglés desarrollado por Dragonscale (dragonscale-ai) que combina una capa de análisis lingüístico completo con una capa de extracción de conocimiento guiada por un esquema definido en tiempo de inferencia. Se distribuye como el estudiante destilado más pequeño de la familia kniv v7, construido sobre el encoder jhu-clsp/ettin-encoder-17m (17M de parámetros en el encoder, 55M contando las cabezas de tarea), y se publica en formato ONNX con variantes fp16 e int8.

El modelo resuelve un problema concreto: obtener en una sola pasada etiquetado gramatical, morfología, lemas, entidades, árboles de dependencias, roles semánticos, actos de diálogo, sentimiento y correferencia, además de hechos estructurados (sujeto, relación, objeto) con polaridad, modalidad, portador y tiempo. La capa de conocimiento permite definir en inferencia qué tipos de entidad y qué relaciones se quieren extraer, sin reentrenar, lo que lo hace útil para memoria de agentes, grafos de conocimiento y analítica documental.

Es relevante ahora por su tamaño reducido y su empaquetado ONNX listo para producción, pero el propio autor lo etiqueta como *preview*: es competitivo en etiquetado y parsing (POS 0.968, LAS 0.904) y claramente más débil en NER, roles semánticos, correferencia, relaciones y tipos de entidad, donde no alcanza los objetivos de calidad fijados para este tamaño. La ventana de entrada es de hasta 512 palabras (1.024 subpalabras) y la licencia es Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder multitarea (base ModernBERT-style: ettin-encoder-17m) con cabezas de token-classification y text-classification |
| Parámetros totales | 55M (17M en el encoder, resto en las cabezas) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 512 palabras por ventana (1.024 subpalabras) |
| Tipos de cuantización | fp16, int8 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (repo de 0,8 GB, incluye tokenizer, settings y paquete Python `kniv_v7`) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer multitarea derivado de jhu-clsp/ettin-encoder-17m, un encoder de tipo ModernBERT de 17M de parámetros. Sobre ese tronco se montan cabezas que resuelven simultáneamente tareas de etiquetado de tokens (POS, morfología, lemas, NER, dependencias, roles semánticos, correferencia) y de clasificación (acto de diálogo y sentimiento por oración, clasificación de relaciones zero-shot). La versión publicada corresponde a la variante `ettin-17m-s-s30-coref` con fecha 2026-11-01.

El entrenamiento es de destilación: kniv-v7-tiny-en es el estudiante destilado de los dos modelos profesores de la familia, kniv-v7-xlarge-u-en (UltraBERT-380M, 485M parámetros) y kniv-v7-xlarge-d-en (deberta-v3-large, 538M parámetros). El objetivo declarado es reproducir las mismas salidas, grafos y runtime que los modelos grandes con una huella mucho menor. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; al tratarse de un encoder multitarea supervisado, la optimización se orienta a las tareas de etiquetado y extracción, no a preferencias humanas.

La innovación principal no es arquitectónica sino de interfaz: la extracción de conocimiento se define contra un esquema proporcionado en inferencia (tipos de entidad y relaciones con nombre y descripción opcional), y cada hecho extraído se anota con polaridad, modalidad, portador y tiempo. En conversaciones, cada hablante se trata como una entidad, de modo que "I moved to Lisbon" produce el hecho `(user, lives in, Lisbon)`.

## Capacidades

- Análisis lingüístico completo en una sola pasada: part-of-speech, morfología, lematización, entidades nombradas, árboles de dependencias, roles semánticos, actos de diálogo y sentimiento por oración, y correferencia.
- Extracción de conocimiento contra esquema definido en inferencia: entidades de los tipos indicados y hechos para las relaciones indicadas, sin fine-tuning.
- Anotación de hechos con polaridad, modalidad, portador y tiempo.
- Extracción de relaciones a nivel de documento y clasificación de relaciones zero-shot.
- NER zero-shot sobre tipos de entidad no vistos en entrenamiento.
- Construcción de memoria conversacional y de agente: los hablantes se modelan como entidades y sus afirmaciones como hechos.
- Salida apta para grafos de conocimiento y pipelines de búsqueda y analítica documental.
- No soporta tool calling ni function calling: es un encoder de extracción, no un modelo generativo.
- No soporta agentes generativos ni razonamiento multi-step por sí mismo; su papel en un agente es el de capa de extracción y memoria.
- Capacidades multilingües: no disponibles; solo inglés.

## Casos de uso

- Memoria de agentes conversacionales: el modelo procesa cada turno y emite hechos `(hablante, relación, objeto)` con polaridad y tiempo, de modo que un agente puede recuperar "el usuario vive en Lisboa" sin mantener el historial completo en el contexto del LLM. Es adecuado por su tamaño (55M) y su ventana de 512 palabras por turno.
- Construcción incremental de grafos de conocimiento: a partir de documentos en inglés, se define en inferencia el esquema de entidades y relaciones y el modelo devuelve tripletas listas para cargar en Neo4j u otro almacén, con la ventaja de no requerir reentrenamiento al cambiar el esquema.
- Enriquecimiento de índices de búsqueda: añadir POS, lemas, dependencias y entidades a cada documento permite búsquedas por lema, filtros por tipo de entidad y recuperación basada en roles semánticos, con un coste de cómputo bajo al ser un encoder de 17M en ONNX.
- Analítica de conversaciones y atención al cliente: clasificación de actos de diálogo y sentimiento por oración para medir satisfacción, detectar escalados y segmentar conversaciones por intención, aprovechando que el modelo etiqueta cada oración de forma independiente dentro de la ventana.
- Extracción de información en documentos largos por ventanas: al admitir 512 palabras por ventana, se puede trocear contratos, informes o artículos en inglés y agregar después las entidades y relaciones extraídas, usando la capa de correferencia para consolidar menciones (con la cautela de su CoNLL F1 de 0.601).
- Preprocesado para pipelines de LLM: usar el modelo como etapa barata que estructura el texto (entidades, roles, hechos) antes de pasarlo a un modelo generativo, reduciendo tokens de entrada y aportando contexto factual verificable.
- Análisis lingüístico para investigación y docencia: obtención de árboles de dependencias (LAS 0.904) y etiquetas UPOS (0.968) sobre UD English EWT con un modelo de 55M ejecutable en CPU mediante ONNX Runtime.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset (split test) | Métrica | Valor |
|---|---|---|---|
| Part-of-speech tagging | UD English EWT | UPOS accuracy | 0.968 |
| Dependency parsing | UD English EWT | LAS | 0.904 |
| Named entity recognition | OntoNotes 5.0 | span F1 | 0.818 |
| Semantic role labeling | PropBank EWT | end-to-end argument F1 | 0.754 |
| Coreference resolution | LitBank | CoNLL F1 | 0.601 |
| Document-level relation extraction | Re-DocRED | F1 (gold entities) | 0.644 |
| Document-level relation extraction | Re-DocRED | F1 (end-to-end) | 0.543 |
| Zero-shot relation classification | FewRel (15 unseen, train+validation) | macro F1, m=5 | 0.773 |
| Zero-shot named entity recognition | CrossNER (media de 4 dominios) | span F1 | 0.434 |

No se han publicado en la información disponible resultados de benchmarks comparativos frente a otros modelos en las mismas tablas, ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 (55M parámetros) y en torno a 0,3-0,5 GB en int8, incluyendo overhead de runtime; el repo completo ocupa 0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo no necesita A100 ni H100 y se ejecuta sobradamente en RTX 4090, RTX 3060 o GPUs integradas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU, al distribuirse como grafos ONNX.
- Opciones de despliegue: ONNX Runtime (CPU o GPU) con el paquete `kniv_v7` incluido en el repositorio; no se documentan integraciones con vLLM, TGI ni llama.cpp, que no aplican a un encoder de este tipo. Ollama no está soportado de forma nativa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| kniv-v7-tiny-en | 55M | 512 palabras (1.024 subpalabras) | Encoder multitarea + extracción por esquema | Apache-2.0 | Preview; débil en NER, SRL, coreferencia y relaciones |
| kniv-v7-small-en | 76M | no disponible | Igual, base ettin-encoder-32m | Apache-2.0 | Estudiante destilado de la misma familia |
| kniv-v7-large-en | 221M | no disponible | Igual, base ModernBERT-base | Apache-2.0 | Recomendado por el autor para calidad moderada |
| kniv-v7-xlarge-d-en | 538M | no disponible | Igual, base deberta-v3-large | Apache-2.0 | Profesor de la familia |
| kniv-v7-xlarge-u-en | 485M | no disponible | Igual, base UltraBERT-380M | Apache-2.0 | Profesor de la familia |

No se dispone de datos de benchmarks de modelos externos (por ejemplo, encoders NER o parsers de tamaño similar) en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo en estado *preview*: el propio autor indica que no alcanza sus objetivos de calidad en NER, roles semánticos, correferencia, relaciones y tipos de entidad para este tamaño.
- Solo inglés: no soporta otros idiomas, lo que excluye su uso en pipelines multilingües sin traducción previa.
- Ventana limitada a 512 palabras (1.024 subpalabras) por ventana; los documentos largos requieren troceado y agregación posterior, con riesgo de perder correferencias entre ventanas.
- Riesgo de error en la extracción de hechos: la F1 end-to-end en Re-DocRED es 0.543 y la correferencia se queda en 0.601, por lo que los hechos extraídos no deben usarse sin revisión en decisiones médicas, legales, financieras o de empleo sobre personas.
- El NER zero-shot es débil (span F1 0.434 de media en CrossNER), por lo que definir tipos de entidad nuevos en inferencia funciona de forma limitada.
- No es un modelo generativo: no hace tool calling, no razona multi-step ni produce texto libre; cualquier expectativa de uso como LLM es incorrecta.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución, pero el autor desaconseja explícitamente el perfilado de individuos sin consentimiento.
- Existen modos de fallo documentados en el GUIDE.md del repositorio que aplican también a este modelo y deben consultarse antes de integrarlo en producción.
- Sin descargas ni likes en el momento de la ficha (0 y 0), lo que implica ausencia de validación comunitaria y de reportes independientes de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dragonscale-ai/kniv-v7-tiny-en
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-17m
- Modelo profesor (UltraBERT-380M): https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-u-en
- Modelo profesor (deberta-v3-large): https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-d-en
- Modelo intermedio recomendado: https://huggingface.co/dragonscale-ai/kniv-v7-large-en
- Modelo intermedio pequeño: https://huggingface.co/dragonscale-ai/kniv-v7-small-en
- Guía de modos de fallo: GUIDE.md dentro del repositorio del modelo (https://huggingface.co/dragonscale-ai/kniv-v7-tiny-en/blob/main/GUIDE.md)
- Organización del autor: https://huggingface.co/dragonscale-ai
