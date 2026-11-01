# dragonscale-ai/kniv-v7-ultrabert-380m-en

## Resumen

kniv-v7-ultrabert-380m-en es un encoder transformer multi-tarea desarrollado por Dragonscale (dragonscale-ai) que combina un analisis linguistico completo del ingles con una capa de extraccion de conocimiento guiada por esquema en tiempo de inferencia. El modelo parte de dmis-lab/UltraBERT-380M como base y se distribuye en formato ONNX con variantes fp16 e int8, con un total declarado de 485 millones de parametros y una ventana de 512 palabras (1.024 subvocablos) por ventana de analisis.

El modelo resuelve dos problemas en una sola pasada: por un lado, la capa linguistica devuelve etiquetado gramatical, morfologia, lemas, entidades nombradas, arboles de dependencias, roles semanticos, acto de dialogo y sentimiento por oracion, y correferencia; por otro, la capa de conocimiento extrae entidades de los tipos que el usuario defina en la llamada y hechos para las relaciones indicadas, incluyendo polaridad, modalidad, titular y tiempo de cada hecho. En una conversacion, cada hablante se trata como una entidad, de modo que "I moved to Lisbon" produce el hecho `(user, lives in, Lisbon)`.

Su relevancia actual radica en que ofrece extraccion zero-shot contra esquemas arbitrarios sin fine-tuning, algo directamente aplicable a memoria de agentes, grafos de conocimiento, busqueda y analitica documental. Compite con su modelo hermano kniv-v7-deberta-v3-large-en, del que se diferencia por un mejor rendimiento zero-shot, mejor extractor de memoria, ventanas mas largas y unos 50 millones de parametros menos. La licencia es Apache-2.0 y el unico idioma soportado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder multi-tarea (base UltraBERT-380M) |
| Parametros totales | 485M (declarado en la model card; el nombre del modelo indica 380M de base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 palabras por ventana (1.024 subvocablos) |
| Tipos de cuantizacion | fp16, int8 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafos), tokenizer y paquete Python `kniv_v7` incluidos en el repo |
| Version | kniv v7 (`ultrabert-380m-v7b8ev`), 2026-10-20 |
| Tamano del repo | 10,3 GB |
| Libreria | onnxruntime |
| Pipeline | token-classification |

## Arquitectura y entrenamiento

Se trata de un encoder transformer multi-tarea construido sobre dmis-lab/UltraBERT-380M. El modelo expone una capa linguistica (POS, morfologia, lematizacion, NER, parsing de dependencias, etiquetado de roles semanticos, acto de dialogo y sentimiento por oracion, y correferencia) y una capa de conocimiento que realiza extraccion de entidades y relaciones contra un esquema proporcionado en inferencia. La extraccion de hechos incluye atributos de polaridad, modalidad, titular y tiempo, y en contextos conversacionales cada hablante se modela como entidad.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible. La innovacion destacable es la capacidad zero-shot sobre tipos de entidad y relaciones nuevos definidos en tiempo de ejecucion, junto con el empaquetado en ONNX con variantes fp16 e int8 y un paquete Python (`kniv_v7`) que convierte texto o turnos de conversacion en registros estructurados por ventana con claves `tokens`, `sentences`, `entities` y `facts`.

## Capacidades

- Etiquetado gramatical (UPOS) y morfologia sobre texto en ingles.
- Lematizacion.
- Reconocimiento de entidades nombradas (NER) con F1 de span declarado de 0,86 en OntoNotes 5.0.
- Parsing de dependencias (LAS de 0,927 en UD English EWT).
- Etiquetado de roles semanticos (F1 end-to-end de argumentos de 0,797 en PropBank EWT).
- Resolucion de correferencia (CoNLL F1 de 0,707 en LitBank).
- Extraccion de relaciones a nivel de documento (F1 de 0,728 con entidades gold y 0,616 end-to-end en Re-DocRED).
- Clasificacion de relaciones zero-shot (macro F1 de 0,729 con m=5 en FewRel con 15 relaciones no vistas).
- NER zero-shot (F1 de span de 0,580 de media en 4 dominios de CrossNER).
- Extraccion de entidades y hechos contra un esquema definido por el usuario en inferencia, con polaridad, modalidad, titular y tiempo por hecho.
- Clasificacion de acto de dialogo y analisis de sentimiento por oracion.
- Modelado de hablantes como entidades en conversaciones, orientado a memoria de agentes y memoria conversacional.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Memoria de agentes conversacionales: el modelo procesa turnos etiquetados por hablante y devuelve hechos como `(user, lives in, Lisbon)` con polaridad y modalidad, lo que permite construir y actualizar una memoria estructurada del usuario sin fine-tuning.
- Construccion de grafos de conocimiento: dada una lista de tipos de entidad y relaciones con descripcion, extrae entidades y tripletas directamente del texto, lo que simplifica la ingesta en bases de datos de grafo.
- Analitica documental: sobre prosa en ingles, combina NER, dependencias y roles semanticos para enriquecer documentos con estructura linguistica y hechos extraidos en una sola pasada.
- Busqueda semantica y enriquecimiento de indices: las entidades, relaciones y lemas extraidos pueden alimentar indices invertidos o filtros estructurados junto a la busqueda vectorial.
- Extraccion de informacion en dominios nuevos sin datos etiquetados: gracias al rendimiento zero-shot en relaciones (FewRel) y entidades (CrossNER), se puede desplegar sobre taxonomias nuevas definiendo el esquema en la llamada.
- Analisis de conversaciones para soporte y CRM: la clasificacion de acto de dialogo y el sentimiento por oracion permiten segmentar y etiquetar interacciones multi-turno.
- Preprocesado linguistico para pipelines de NLP: POS, lemas, dependencias y correferencia sirven como etapa previa para sistemas de resumen, traduccion o QA que requieran analisis gramatical.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Tarea | Dataset (split) | Metrica | Valor |
|---|---|---|---|
| Part-of-speech tagging | UD English EWT (test) | UPOS accuracy | 0,978 |
| Dependency parsing | UD English EWT (test) | LAS | 0,927 |
| Named entity recognition | OntoNotes 5.0 (test) | span F1 | 0,860 |
| Semantic role labeling | PropBank EWT (test) | end-to-end argument F1 | 0,797 |
| Coreference resolution | LitBank (test) | CoNLL F1 | 0,707 |
| Document-level relation extraction | Re-DocRED (test) | F1 (gold entities) | 0,728 |
| Document-level relation extraction | Re-DocRED (test) | F1 (end to end) | 0,616 |
| Zero-shot relation classification | FewRel (15 unseen, train+validation) | macro F1, m=5 | 0,729 |
| Zero-shot named entity recognition | CrossNER (test) | span F1, media de 4 dominios | 0,580 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 485M de parametros, en fp16 el peso ronda 1 GB y en int8 unos 0,5 GB, mas overhead de activaciones y del runtime ONNX.
- GPU recomendadas: no especificadas por el autor; el modelo se ejecuta via onnxruntime y puede correr en CPU o en GPU consumer.
- Cabe en GPU consumer: si, dado el tamano del modelo y las variantes cuantizadas int8 y fp16; el repositorio ocupa 10,3 GB en total por incluir multiples grafos.
- Opciones de despliegue: onnxruntime con el paquete `kniv_v7` incluido en el repositorio; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Zero-shot relaciones | Licencia | Formato |
|---|---|---|---|---|---|
| kniv-v7-ultrabert-380m-en | 485M | 512 palabras (1.024 subvocablos) | FewRel macro F1 0,729 (m=5) | Apache-2.0 | ONNX (fp16, int8) |
| kniv-v7-deberta-v3-large-en | no disponible (modelo hermano, segun la card con ~50M mas) | no disponible | no disponible | no disponible | no disponible |
| dmis-lab/UltraBERT-380M (base) | 380M (segun nombre) | no disponible | no disponible | no disponible | no disponible |

El autor indica que kniv-v7-ultrabert-380m-en es preferible a su hermano DeBERTa-v3-large para zero-shot con tipos nuevos y como extractor de memoria, con ventanas mas largas y menos parametros. No se dispone de datos de benchmarks del modelo hermano ni del modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; el resto de idiomas queda fuera de alcance.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente.
- El rendimiento zero-shot en NER (F1 de 0,580 en CrossNER) y en relaciones end-to-end (0,616 en Re-DocRED) es sensiblemente inferior al supervisado, lo que limita su uso sin revision en dominios nuevos.
- La model card desaconseja actuar sobre hechos extraidos sin revision en contextos medicos, legales, financieros o de decisiones laborales sobre personas.
- Desaconseja el perfilado de individuos sin consentimiento.
- La ventana es de 512 palabras (1.024 subvocablos), lo que obliga a trocear documentos largos y puede perder dependencias entre ventanas.
- Riesgo de alucinacion y de extraccion erronea de hechos no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero las limitaciones de alcance y las advertencias eticas de la model card siguen siendo relevantes en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dragonscale-ai/kniv-v7-ultrabert-380m-en
- Modelo hermano: https://huggingface.co/dragonscale-ai/kniv-v7-deberta-v3-large-en
- Modelo base: https://huggingface.co/dmis-lab/UltraBERT-380M
- Guia del autor (GUIDE.md): incluida en el repositorio del modelo (https://huggingface.co/dragonscale-ai/kniv-v7-ultrabert-380m-en/blob/main/GUIDE.md)
- Organizacion del autor: https://huggingface.co/dragonscale-ai
