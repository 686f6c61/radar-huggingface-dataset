# dragonscale-ai/kniv-v7-large-en

## Resumen

kniv-v7-large-en es un encoder transformer multi-tarea desarrollado por Dragonscale (dragonscale-ai) que combina un analisis linguistico completo del ingles con extraccion de conocimiento contra un esquema definido en tiempo de inferencia. Se distribuye como estudiante destilado de los dos modelos kniv v7 xlarge (kniv-v7-xlarge-u-en y kniv-v7-xlarge-d-en), con 221 millones de parametros frente a los 485M y 538M de sus profesores, y aproximadamente el doble de velocidad en CPU. Su base es answerdotai/ModernBERT-base y la version actual es la v7.1.2 (modernbert-base-nerkd), publicada el 13 de noviembre de 2026.

El modelo resuelve dos capas de analisis en una sola pasada: una capa linguistica (part-of-speech, morfologia, lemas, entidades nombradas, arboles de dependencias, roles semanticos, acto de dialogo y sentimiento por oracion, y correferencia) y una capa de conocimiento (entidades de los tipos que el usuario nombre, hechos para las relaciones que el usuario nombre, y para cada hecho su polaridad, modalidad, portador y tiempo). En conversaciones, cada hablante se trata como una entidad, de modo que "I live in Berlin" produce la tupla (user, lives in, Berlin), lo que lo hace directamente util para memoria de agentes y grafos de conocimiento.

Es relevante ahora porque ofrece extraccion zero-shot contra esquemas arbitrarios sin fine-tuning, con un paquete Python (kniv_v7) y grafos ONNX incluidos en el propio repositorio, y con una licencia Apache-2.0 permisiva para uso comercial. El repositorio ocupa 7,0 GB e incluye pesos en fp16 e int8, ademas del tokenizer y la configuracion. Se posiciona como la variante de tamano medio de la familia kniv v7, dentro de un punto de los profesores en etiquetado, parsing, NER y roles semanticos, y dentro de dos puntos en relaciones a nivel de documento.

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
| Formato de pesos | ONNX (grafos), tokenizer y settings incluidos en el repo |
| Version | kniv v7.1.2 (modernbert-base-nerkd), 2026-11-13 |
| Modelo base | answerdotai/ModernBERT-base |
| Pipeline | token-classification |
| Tamano del repositorio | 7,0 GB |

## Arquitectura y entrenamiento

kniv-v7-large-en es un encoder transformer multi-tarea construido sobre ModernBERT-base, con 221M de parametros y una ventana de entrada de hasta 512 palabras (1.024 subwords). Sobre esa base se anaden cabeceras para multiples tareas linguisticas y de extraccion de conocimiento que se resuelven en una sola pasada: POS, morfologia, lematizacion, NER, parsing de dependencias, etiquetado de roles semanticos, clasificacion de acto de dialogo y sentimiento por oracion, correferencia, y extraccion de entidades y relaciones contra un esquema proporcionado en inferencia.

El entrenamiento es por destilacion desde los dos profesores de la familia (kniv-v7-xlarge-u-en, UltraBERT-380M, 485M parametros, y kniv-v7-xlarge-d-en, deberta-v3-large, 538M parametros). No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; al tratarse de un encoder multi-tarea de extraccion, el mecanismo de alineacion mas probable es supervision directa sobre las tareas, pero este dato no esta confirmado. La innovacion destacable es la formulacion zero-shot: el esquema de entidades y relaciones se aporta en tiempo de inferencia, de modo que el modelo no requiere fine-tuning para extraer tipos nuevos, aunque rinde peor en tipos de entidad con nombres no vistos durante el entrenamiento. Se distribuye como grafos ONNX con cuantizacion fp16 e int8, lo que permite ejecucion en CPU con el doble de velocidad que los profesores.

## Capacidades

- Analisis linguistico completo: part-of-speech, morfologia, lematizacion, entidades nombradas, arboles de dependencias, roles semanticos, acto de dialogo y sentimiento por oracion, y correferencia.
- Extraccion de entidades contra un esquema definido en inferencia (zero-shot entity extraction).
- Extraccion de relaciones contra un esquema definido en inferencia (zero-shot relation extraction), con polaridad, modalidad, portador y tiempo por cada hecho.
- Extraccion de relaciones a nivel de documento (document-level relation extraction).
- Clasificacion de relaciones zero-shot (FewRel).
- NER zero-shot en dominios no vistos (CrossNER).
- Construccion de grafos de conocimiento y memoria conversacional: cada hablante se modela como entidad, permitiendo tuplas como (user, lives in, Berlin).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad generativa; el modelo es un encoder de extraccion, no un generador.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: cuantizacion int8 y fp16, ejecucion ONNX, paquete Python kniv_v7 incluido en el repositorio.

## Casos de uso

- Memoria de agentes conversacionales: el modelo procesa cada turno y extrae hechos con el hablante como entidad, de modo que "I live in Berlin" se almacena como (user, lives in, Berlin) con polaridad, modalidad y tiempo; es adecuado porque la extraccion es zero-shot y no requiere definir el esquema de memoria de antemano.
- Construccion de grafos de conocimiento a partir de documentacion tecnica: se define en inferencia el conjunto de tipos de entidad y relaciones relevantes (por ejemplo, componente, dependencia, version) y el modelo extrae las tuplas directamente, con relaciones a nivel de documento para capturar hechos que cruzan parrafos.
- Enriquecimiento de pipelines de busqueda y analitica documental: el analisis linguistico (POS, lemas, dependencias, NER) permite indexar con normalizacion morfologica y entidades, mejorando la recuperacion sobre corpus en ingles sin coste de un LLM generativo.
- Extraccion de entidades y relaciones en dominios especializados con CrossNER: util para dominios como ciencia, politica o literatura, aunque con la advertencia de que el F1 zero-shot en dominios no vistos es de 0,503 de media, por lo que conviene revisar los resultados.
- Analisis de sentimiento y actos de dialogo en transcripciones de atencion al cliente: el modelo etiqueta por oracion el acto de dialogo y el sentimiento, lo que permite segmentar conversaciones y detectar quejas o solicitudes sin un modelo generativo.
- Preprocesamiento para pipelines de RAG o de agentes: al ejecutarse en ONNX con cuantizacion int8 y ser aproximadamente el doble de rapido en CPU que sus profesores, encaja como etapa de extraccion estructurada previa a un generador, reduciendo el coste por documento.
- Resolucion de correferencia en textos largos: con una ventana de 512 palabras y CoNLL F1 de 0,671 en LitBank, sirve para tareas de resumen o de atribucion donde hay que enlazar menciones, aunque con limitaciones claras frente a los profesores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados, `verified: false`):

| Tarea | Dataset (split) | Metrica | Valor |
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

Segun la model card, el modelo queda dentro de un punto del mejor profesor en etiquetado, parsing, NER y roles semanticos, y dentro de dos puntos en relaciones a nivel de documento. Es mas debil en tipos de entidad con nombres no vistos y en correferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 221M de parametros, en fp16 el peso ronda los 0,44 GB y en int8 alrededor de 0,22 GB, a lo que hay que sumar memoria de activaciones y del runtime ONNX.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cualquier GPU consumer con al menos unos pocos GB libres deberia poder ejecutarlo, pero no se confirma en la documentacion.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo, aunque no se especifican modelos concretos.
- Opciones de despliegue: ONNX Runtime con los grafos incluidos en el repositorio y el paquete Python kniv_v7; no se mencionan vLLM, llama.cpp, Ollama ni TGI (el modelo no es generativo).
- Latencia y throughput: la model card indica aproximadamente el doble de velocidad en CPU que los profesores xlarge, pero no se publican valores absolutos de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| kniv-v7-large-en (este) | ModernBERT-base | 221M | 512 palabras (1.024 subwords) | Apache-2.0 | Estudiante destilado, ~2x mas rapido en CPU que los profesores |
| kniv-v7-xlarge-u-en | UltraBERT-380M | 485M | no disponible | no disponible | Profesor; mejor en tipos de entidad no vistos y correferencia |
| kniv-v7-xlarge-d-en | deberta-v3-large | 538M | no disponible | no disponible | Profesor; mejor en tipos de entidad no vistos y correferencia |
| kniv-v7-medium-en | ettin-encoder-68m | 122M | no disponible | no disponible | Estudiante destilado de menor tamano |
| kniv-v7-small-en | ettin-encoder-32m | 76M | no disponible | no disponible | Estudiante destilado de menor tamano |
| kniv-v7-tiny-en | ettin-encoder-17m | 55M | no disponible | no disponible | Estudiante destilado de menor tamano |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, salvo la afirmacion cualitativa de la model card de que este modelo queda dentro de un punto de los profesores en etiquetado, parsing, NER y roles semanticos, y dentro de dos en relaciones a nivel de documento.

## Limitaciones y advertencias

- Solo soporta ingles; cualquier otro idioma queda fuera de alcance.
- Es mas debil que los profesores en tipos de entidad con nombres no vistos (CrossNER span F1 medio de 0,503 en cuatro dominios) y en correferencia (CoNLL F1 de 0,671 en LitBank); si estas tareas son criticas, la model card recomienda elegir un profesor.
- Los resultados de benchmarks estan declarados por el autor y marcados como no verificados.
- Riesgo de alucinacion en la extraccion: al generar hechos contra un esquema libre, puede producir tuplas incorrectas o incompletas; no debe usarse para actuar sobre hechos extraidos sin revision en contextos medicos, legales, financieros o de decisiones laborales sobre personas.
- No debe usarse para perfilado de individuos sin su consentimiento, segun la model card.
- La ventana de entrada esta limitada a 512 palabras (1.024 subwords) por ventana, lo que exige trocear documentos largos y puede afectar a la coherencia en relaciones a nivel de documento.
- No se detallan sesgos conocidos ni la composicion del dataset de entrenamiento, lo que dificulta evaluar sesgos sistematicos.
- No es un modelo generativo: no soporta generacion de texto, razonamiento multi-paso ni tool calling en el sentido habitual.
- La licencia Apache-2.0 permite uso comercial, pero las condiciones de los modelos base (ModernBERT-base) deben respetarse igualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dragonscale-ai/kniv-v7-large-en
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Profesor kniv-v7-xlarge-u-en: https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-u-en
- Profesor kniv-v7-xlarge-d-en: https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-d-en
- kniv-v7-tiny-en: https://huggingface.co/dragonscale-ai/kniv-v7-tiny-en
- kniv-v7-small-en: https://huggingface.co/dragonscale-ai/kniv-v7-small-en
- kniv-v7-medium-en: https://huggingface.co/dragonscale-ai/kniv-v7-medium-en
- Guia de modos de fallo (GUIDE.md, referenciada en la model card): no disponible como URL directa en la informacion proporcionada
- Organizacion en Hugging Face: https://huggingface.co/dragonscale-ai
