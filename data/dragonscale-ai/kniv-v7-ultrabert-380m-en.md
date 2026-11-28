# dragonscale-ai/kniv-v7-ultrabert-380m-en

## Resumen

kniv-v7-xlarge-u-en es un encoder transformer multi-tarea en ingles desarrollado por Dragonscale (dragonscale-ai), construido sobre el modelo base dmis-lab/UltraBERT-380M. Resuelve un problema concreto: ofrecer en un unico modelo una capa de analisis linguistico completo (POS, morfologia, lemas, entidades, dependencias, roles semanticos, actos de dialogo, sentimiento y correferencia) junto con una capa de extraccion de conocimiento contra un esquema definido en tiempo de inferencia. Esto permite extraer entidades y hechos sin fine-tuning, algo relevante para memoria de agentes, grafos de conocimiento y analitica documental.

El modelo tiene 485 millones de parametros, procesa ventanas de hasta 512 palabras (1.024 subtokens) y se distribuye exclusivamente en formato ONNX, con variantes fp16 e int8. Es el modelo "teacher" de mayor tamano de la familia kniv v7, por encima de kniv-v7-xlarge-d-en (538M, basado en deberta-v3-large) y de los estudiantes destilados de menor tamano.

Su relevancia actual radica en el enfoque zero-shot para tipos de entidad y relaciones nuevos, y en su orientacion explicita a la extraccion de memoria conversacional: cada hablante se trata como entidad, de modo que una frase como "I live in Berlin" produce el hecho `(user, lives in, Berlin)`. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder multi-tarea (base: UltraBERT-380M) |
| Parametros totales | 485M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 512 palabras por ventana (1.024 subtokens) |
| Tipos de cuantizacion | fp16, int8 |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Se trata de un encoder transformer multi-tarea construido sobre dmis-lab/UltraBERT-380M, con 485M de parametros. El modelo combina dos capas funcionales: una capa linguistica que produce analisis a nivel de token y de oracion (part of speech, morfologia, lemas, entidades nombradas, arboles de dependencias, roles semanticos, acto de dialogo y sentimiento por oracion, y correferencia) y una capa de conocimiento que extrae entidades de los tipos indicados en inferencia y hechos para las relaciones indicadas, anotando para cada hecho su polaridad, modalidad, portador y tiempo.

El modelo se distribuye como grafos ONNX junto con el tokenizer, la configuracion y el paquete Python `kniv_v7`, todo incluido en el repositorio. La version documentada es kniv v7.1.2 (`ultrabert-380m-v7b8ev`, 2026-11-13), con historial de versiones v7.1.1 (2026-11-09), v7.1 (2026-11-03) y v7.0 (2026-10-20). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El modelo hermano kniv-v7-xlarge-d-en comparte diseno y actua como alternativa; la model card indica que este modelo es preferible para zero-shot sobre tipos nuevos y para extraccion de memoria, con ventanas mas largas y unos 50M de parametros menos.

## Capacidades

- Etiquetado part-of-speech (UPOS) y morfologia.
- Lematizacion.
- Reconocimiento de entidades nombradas (NER), incluyendo modo zero-shot para tipos nuevos.
- Analisis de dependencias (dependency parsing).
- Etiquetado de roles semanticos (semantic role labeling).
- Resolucion de correferencia.
- Extraccion de relaciones a nivel de documento.
- Clasificacion zero-shot de relaciones.
- Analisis de sentimiento por oracion.
- Clasificacion de actos de dialogo.
- Extraccion de conocimiento contra esquema definido en inferencia: entidades de tipos indicados y hechos para relaciones indicadas, con polaridad, modalidad, portador y tiempo.
- Memoria conversacional y de agente: los hablantes se modelan como entidades, permitiendo extraer hechos del tipo `(user, lives in, Berlin)`.
- Soporte para construccion de grafos de conocimiento y busqueda.
- Capacidades multilingues: no, solo ingles.

## Casos de uso

- Memoria de agentes conversacionales: el modelo extrae hechos estructurados de cada turno de dialogo tratando a cada hablante como entidad, lo que permite persistir preferencias y datos del usuario en un almacen consultable sin fine-tuning.
- Construccion de grafos de conocimiento: a partir de un esquema de relaciones propio, el modelo genera tripletas con polaridad, modalidad y tiempo, adecuadas para poblar un KG o un indice semantico.
- Analisis documental a gran escala: con ventanas de hasta 512 palabras y extraccion de relaciones a nivel de documento, puede procesar informes, contratos o articulos para poblar indices de entidades y hechos.
- Enriquecimiento de pipelines de busqueda: el analisis linguistico completo (lemas, POS, dependencias, correferencia) permite construir indices y consultas mas precisos que un simple tokenizado.
- Analitica de conversaciones y atencion al cliente: la clasificacion de actos de dialogo y el sentimiento por oracion permiten segmentar y etiquetar transcripciones de soporte o ventas.
- Extraccion de informacion zero-shot sobre dominios nuevos: al definir en inferencia los tipos de entidad y relaciones, se puede desplegar sobre dominios sin datos etiquetados, con la advertencia de revisar los resultados.
- Preprocesado linguistico para otros modelos: como encoder de analisis (POS, dependencias, SRL, correferencia) puede alimentar pipelines posteriores de resumen, QA o traduccion asistida.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Part-of-speech tagging | UD English EWT (test) | UPOS accuracy | 0,978 |
| Dependency parsing | UD English EWT (test) | LAS | 0,927 |
| Named entity recognition | OntoNotes 5.0 (test) | span F1 | 0,860 |
| Semantic role labeling | PropBank EWT (test) | end-to-end argument F1 | 0,797 |
| Coreference resolution | LitBank (test) | CoNLL F1 | 0,709 |
| Document-level relation extraction | Re-DocRED (test) | F1 (gold entities) | 0,728 |
| Document-level relation extraction | Re-DocRED (test) | F1 (end to end) | 0,616 |
| Zero-shot relation classification | FewRel (15 unseen, train+validation) | macro F1, m=5 | 0,729 |
| Zero-shot named entity recognition | CrossNER (test) | span F1, media de 4 dominios | 0,580 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita en la informacion proporcionada. Como referencia, un encoder de 485M en fp16 requiere del orden de 1 GB de pesos, y en int8 aproximadamente la mitad; el repositorio ocupa 13,4 GB por incluir multiples grafos ONNX y variantes de cuantizacion.
- GPU recomendadas: no disponible. Al ser un encoder de ~485M, es desplegable en GPU consumer (RTX 4090 y gamas similares) y en CPU mediante onnxruntime.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con al menos 2-4 GB de VRAM libres segun variante; dato no confirmado en la informacion disponible.
- Opciones de despliegue: ONNX Runtime (dependencia declarada: `onnxruntime`, `tokenizers`, `numpy`, `huggingface_hub`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Ventana | Licencia | Rol |
|---|---|---|---|---|---|
| kniv-v7-xlarge-u-en | UltraBERT-380M | 485M | 512 palabras (1.024 subtokens) | Apache-2.0 | Teacher |
| kniv-v7-xlarge-d-en | deberta-v3-large | 538M | No disponible | No disponible | Teacher |
| kniv-v7-large-en | ModernBERT-base | 221M | No disponible | No disponible | Estudiante destilado |
| kniv-v7-medium-en | ettin-encoder-68m | 122M | No disponible | No disponible | Estudiante destilado |
| kniv-v7-small-en | ettin-encoder-32m | 76M | No disponible | No disponible | Estudiante destilado |
| kniv-v7-tiny-en | ettin-encoder-17m | 55M | No disponible | No disponible | Estudiante destilado |

La model card indica que, frente a kniv-v7-xlarge-d-en, este modelo ofrece mejor rendimiento zero-shot sobre tipos nuevos, mejor extraccion de memoria, ventanas mas largas y unos 50M de parametros menos.

## Limitaciones y advertencias

- Solo soporta ingles; queda fuera de alcance cualquier otro idioma.
- No debe usarse para tomar decisiones sobre personas (medicas, legales, financieras o laborales) sin revision humana cuando los errores importan.
- No debe usarse para perfilado de individuos sin su consentimiento.
- Los benchmarks estan declarados por el autor y marcados como no verificados (`verified: false`); no deben tomarse como resultados auditados.
- Riesgo de alucinacion y de extraccion incorrecta de hechos: la model card remite a GUIDE.md para conocer los modos de fallo conocidos y como mitigarlos en el propio codigo.
- El rendimiento zero-shot en NER sobre dominios nuevos es limitado (span F1 medio de 0,580 en CrossNER), por lo que requiere revision.
- La extraccion de relaciones end-to-end cae respecto a la version con entidades gold (0,616 frente a 0,728), lo que refleja propagacion de errores de NER.
- El repositorio ocupa 13,4 GB, lo que puede ser costoso en almacenamiento y descarga.
- No se especifican sesgos conocidos en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dragonscale-ai/kniv-v7-ultrabert-380m-en
- Modelo base: https://huggingface.co/dmis-lab/UltraBERT-380M
- Modelo hermano kniv-v7-xlarge-d-en: https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-d-en
- kniv-v7-tiny-en: https://huggingface.co/dragonscale-ai/kniv-v7-tiny-en
- kniv-v7-small-en: https://huggingface.co/dragonscale-ai/kniv-v7-small-en
- kniv-v7-medium-en: https://huggingface.co/dragonscale-ai/kniv-v7-medium-en
- kniv-v7-large-en: https://huggingface.co/dragonscale-ai/kniv-v7-large-en
- Guia del autor (GUIDE.md): https://huggingface.co/dragonscale-ai/kniv-v7-ultrabert-380m-en/blob/main/GUIDE.md
- Organizacion en Hugging Face: https://huggingface.co/dragonscale-ai
