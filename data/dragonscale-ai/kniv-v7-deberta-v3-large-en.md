# dragonscale-ai/kniv-v7-deberta-v3-large-en

## Resumen

kniv v7 (deberta-v3-large) es un encoder transformer multi-tarea desarrollado por Dragonscale (dragonscale-ai) que, partiendo de microsoft/deberta-v3-large, proporciona un analisis linguistico completo del ingles y extrae conocimiento estructurado contra un esquema definido en tiempo de inferencia. El modelo combina una capa linguistica (etiquetado gramatical, morfologia, lemas, entidades nombradas, arboles de dependencias, roles semanticos, acto de dialogo y sentimiento por oracion, y correferencia) con una capa de conocimiento (entidades de los tipos indicados y hechos para las relaciones solicitadas, con polaridad, modalidad, portador y tiempo asociados).

Con 538M de parametros y una ventana de 512 subwords, el modelo esta pensado para analizar prosa y conversaciones en ingles y extraer entidades y hechos sin necesidad de fine-tuning, lo que lo hace util para memoria de agentes, grafos de conocimiento, busqueda y analitica documental. Su interes actual reside en que unifica en un unico encoder tareas que tradicionalmente requieren pipelines separados (POS, NER, parsing, SRL, coreferencia, extraccion de relaciones), y lo distribuye en formato ONNX con cuantizacion fp16 e int8 bajo licencia Apache-2.0.

El repositorio incluye los grafos ONNX, el tokenizer, la configuracion y el paquete Python `kniv_v7` que convierte texto en resultados, por lo que el despliegue no depende de frameworks adicionales mas alla de onnxruntime, tokenizers, numpy y huggingface_hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer multi-tarea (basado en DeBERTa-v3-large) |
| Parametros totales | 538M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 subwords por ventana (hasta 512 palabras) |
| Tipos de cuantizacion | fp16, int8 (variantes cuantizadas incluidas en el repo) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafos), tokenizer y paquete Python `kniv_v7` |
| Version | kniv v7 (`deberta-v3-large-v7b8ev`), 2026-10-20 |
| Modelo base | microsoft/deberta-v3-large |
| Libreria | onnx |
| Tamano del repositorio | 12.9 GB |
| Pipeline declarado | token-classification |

## Arquitectura y entrenamiento

El modelo es un encoder transformer derivado de DeBERTa-v3-large, reutilizado como columna vertebral multi-tarea. Sobre esa base se anaden cabezas de token-classification y text-classification que resuelven simultaneamente tareas de analisis linguistico (POS/UPOS, morfologia, lematizacion, NER, parsing de dependencias, etiquetado de roles semanticos, clasificacion de acto de dialogo y sentimiento por oracion, y resolucion de correferencia) y tareas de extraccion de conocimiento (entidades de tipos definidos por el usuario, relaciones con polaridad, modalidad, portador y tiempo, y clasificacion de relaciones zero-shot). La entrada se procesa por ventanas de hasta 512 subwords y la salida se devuelve como un registro por ventana con tokens, limites de oracion (y hablantes), informacion por palabra y hechos extraidos.

La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible. Si se documenta que el modelo se distribuye como grafos ONNX con variantes fp16 e int8, y que el paquete `kniv_v7` gestiona la tokenizacion y el postprocesado. El diseno de extraccion contra un esquema en tiempo de inferencia (tipos de entidad y relaciones con nombre y descripcion opcional) es la innovacion tecnica mas destacable, junto con la separacion explicita de la capa linguistica y la capa de conocimiento.

## Capacidades

- Analisis linguistico completo en ingles: part-of-speech (UPOS), morfologia, lematizacion, entidades nombradas, arboles de dependencias, roles semanticos, acto de dialogo y sentimiento por oracion, y correferencia.
- Extraccion de entidades de tipos definidos por el usuario en tiempo de inferencia (entity types con nombre).
- Extraccion de hechos para relaciones definidas por el usuario, con nombre y descripcion opcional, incluyendo polaridad, modalidad, portador (holder) y tiempo.
- Extraccion de relaciones a nivel de documento y clasificacion de relaciones zero-shot.
- NER zero-shot sobre dominios no vistos.
- Tratamiento de conversaciones multi-turno: cada hablante se modela como entidad, de modo que una frase como "I moved to Lisbon" produce el hecho `(user, lives in, Lisbon)`.
- Soporte para memoria de agentes y construccion de grafos de conocimiento.
- Capacidades multilingues: limitadas al ingles.
- No se documenta soporte de tool calling, function calling ni modo thinking; el modelo es un encoder de extraccion, no un generador.

## Casos de uso

- Memoria de agentes conversacionales: el modelo procesa los turnos de una conversacion y extrae hechos con hablante, polaridad, modalidad y tiempo, lo que permite mantener una memoria estructurada de lo dicho por el usuario y el asistente sin fine-tuning.
- Construccion de grafos de conocimiento: a partir de prosa o documentos, se definen los tipos de entidad y las relaciones relevantes y el modelo devuelve entidades y hechos listos para insertar en un grafo, con soporte de relaciones a nivel de documento.
- Analitica documental y extraccion de informacion: analisis de contratos, informes o articulos en ingles para obtener entidades, dependencias y roles semanticos que alimenten pipelines de busqueda o resumen estructurado.
- Enriquecimiento de indices de busqueda: la capa linguistica (POS, lemas, dependencias, NER) permite generar campos estructurados y normalizar terminos antes de indexar, mejorando la recuperacion sobre corpus en ingles.
- Clasificacion de actos de dialogo y sentimiento: en sistemas de atencion al cliente o analisis de conversaciones, el modelo etiqueta cada oracion con su acto de dialogo y sentimiento, util para enrutado y metricas de calidad.
- Resolucion de correferencia en pipelines de NLP: integrado como paso previo a tareas de resumen o extraccion, el modelo enlaza menciones a lo largo de un texto en ingles, lo que reduce duplicados en la capa de conocimiento.
- Extraccion zero-shot en dominios nuevos: cuando no se dispone de datos etiquetados, el modelo permite definir tipos de entidad y relaciones en inferencia y obtener resultados sin reentrenar, adecuado para prototipado rapido.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index de la model card (no verificados de forma independiente):

| Tarea | Dataset (split) | Metrica | Valor |
|---|---|---|---|
| Part-of-speech tagging | UD English EWT (test) | UPOS accuracy | 0.982 |
| Dependency parsing | UD English EWT (test) | LAS | 0.929 |
| Named entity recognition | OntoNotes 5.0 (test) | span F1 | 0.870 |
| Semantic role labeling | PropBank EWT (test) | end-to-end argument F1 | 0.810 |
| Coreference resolution | LitBank (test) | CoNLL F1 | 0.692 |
| Document-level relation extraction | Re-DocRED (test) | F1 (gold entities) | 0.733 |
| Document-level relation extraction | Re-DocRED (test) | F1 (end-to-end) | 0.627 |
| Zero-shot relation classification | FewRel (15 unseen, train+validation) | macro F1, m=5 | 0.731 |
| Zero-shot named entity recognition | CrossNER (test) | span F1, media de 4 dominios | 0.533 |

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un encoder de 538M de parametros, en fp16 el peso ronda 1,1 GB y en int8 alrededor de 0,6 GB; el consumo real depende del tamano de lote y de la longitud de la ventana (512 subwords).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente para lotes moderados; para mayor throughput se recomiendan A100, H100, L40S o RTX 4090.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090; tambien en GPUs de 8 GB con cuantizacion int8.
- Opciones de despliegue: onnxruntime (CPU o GPU) es la via principal, ya que el repositorio incluye los grafos ONNX; el paquete `kniv_v7` gestiona la tokenizacion y el postprocesado. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kniv-v7-deberta-v3-large-en | 538M | 512 subwords | Encoder multi-tarea (linguistica + extraccion de conocimiento) | Apache-2.0 | HuggingFace (ONNX) |
| kniv-v7-ultrabert-380m-en | 380M | no disponible | Mismo diseno, menor tamano; el autor lo presenta como alternativa con parsing, NER, roles semanticos y relaciones enciclopedicas ligeramente inferiores | no disponible | HuggingFace |
| microsoft/deberta-v3-large | 435M | 512 subwords | Encoder base de proposito general, sin cabezas multi-tarea | MIT | HuggingFace |

La comparativa con modelos especializados por tarea (por ejemplo, un NER dedicado o un parser de dependencias) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; el uso con otros idiomas queda fuera de alcance segun el autor.
- La ventana es de 512 subwords por ventana, lo que obliga a trocear documentos largos y puede degradar la correferencia y la extraccion de relaciones a nivel de documento en textos muy extensos.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente.
- Riesgo de alucinacion y de extraccion incorrecta de hechos: el autor desaconseja actuar sobre hechos extraidos sin revision en contextos donde los errores importan (decisiones medicas, legales, financieras o de empleo sobre personas).
- No debe usarse para perfilado de individuos sin su consentimiento.
- El rendimiento en NER zero-shot es limitado (span F1 medio de 0.533 en CrossNER), por lo que en dominios nuevos conviene validar antes de produccion.
- El repositorio ocupa 12.9 GB, lo que implica un coste de descarga y almacenamiento considerable para un modelo de 538M de parametros.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre la exactitud de las extracciones.
- No se documentan sesgos especificos; al derivar de DeBERTa-v3-large, puede heredar sesgos presentes en los datos de entrenamiento de ese modelo base.
- No es un modelo generativo: no soporta tool calling, function calling ni modos de razonamiento multi-paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dragonscale-ai/kniv-v7-deberta-v3-large-en
- Modelo hermano: https://huggingface.co/dragonscale-ai/kniv-v7-ultrabert-380m-en
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
- Organizacion: https://huggingface.co/dragonscale-ai
- Guia del autor (GUIDE.md): incluida en el repositorio del modelo, ruta `GUIDE.md`
