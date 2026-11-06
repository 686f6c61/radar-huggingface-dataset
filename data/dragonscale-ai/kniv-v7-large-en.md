# dragonscale-ai/kniv-v7-large-en

## Resumen

kniv-v7-large-en es un encoder transformer multitarea desarrollado por Dragonscale (dragonscale-ai) que combina un analisis linguistico completo del ingles con extraccion de conocimiento contra un esquema definido en tiempo de inferencia. El modelo parte de answerdotai/ModernBERT-base (221M parametros) y se distribuye como estudiante destilado de los dos modelos kniv v7 xlarge (kniv-v7-xlarge-u-en, 485M, y kniv-v7-xlarge-d-en, 538M), de los que hereda las mismas salidas, grafos y runtime con menos de la mitad del tamano y aproximadamente el doble de velocidad en CPU.

La propuesta central es doble. Por un lado, una capa linguistica que produce etiquetado gramatical (POS), morfologia, lemas, entidades nombradas, arboles de dependencias, roles semanticos, acto de dialogo y sentimiento por frase, y correferencia. Por otro, una capa de conocimiento que extrae entidades de los tipos indicados por el usuario y hechos para las relaciones solicitadas, anotando para cada hecho polaridad, modalidad, portador y tiempo. En una conversacion cada hablante es una entidad, de modo que "I moved to Lisbon" produce el hecho `(user, lives in, Lisbon)`.

Es relevante porque ofrece extraccion zero-shot contra esquemas arbitrarios sin fine-tuning, con un unico modelo y un unico paso de inferencia, lo que simplifica pipelines de memoria de agente, grafos de conocimiento, busqueda y analitica documental. La contrapartida, declarada por el autor, es un rendimiento mas debil en tipos de entidad no vistos y en correferencia frente a los modelos teacher.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder multitarea (ModernBERT-base) |
| Parametros totales | 221M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 512 palabras por ventana (1.024 subwords) |
| Tipos de cuantizacion | fp16, int8 (repo de 4,9 GB con grafos ONNX) |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafos), tokenizer y paquete Python `kniv_v7` incluidos en el repo |
| Modelo base | answerdotai/ModernBERT-base |
| Version | kniv v7 (`modernbert-base-nerkd`), 2026-10-30 |
| Libreria | onnx / onnxruntime |
| Pipeline | token-classification |

## Arquitectura y entrenamiento

El modelo es un encoder transformer multitarea construido sobre ModernBERT-base, con 221M parametros y una ventana de entrada de hasta 512 palabras (1.024 subwords). No es un modelo generativo ni un MoE: produce salidas estructuradas de etiquetado (token classification y text classification) en una sola pasada, cubriendo POS, morfologia, lemas, NER, parsing de dependencias, roles semanticos, acto de dialogo, sentimiento y correferencia, ademas de la capa de extraccion de entidades y relaciones contra un esquema dado en inferencia.

El entrenamiento es por destilacion desde dos modelos teacher de la misma familia, kniv-v7-xlarge-u-en (UltraBERT-380M, 485M parametros) y kniv-v7-xlarge-d-en (deberta-v3-large, 538M parametros). El autor declara que el estudiante queda a menos de un punto del mejor teacher en etiquetado, parsing, NER y roles semanticos, y a menos de dos puntos en relaciones a nivel de documento, con aproximadamente el doble de velocidad en CPU. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; el modelo no es generativo, por lo que esas tecnicas no aplican del mismo modo.

La innovacion tecnica destacable es la union de una capa linguistica completa y una capa de conocimiento zero-shot en un unico encoder pequeno, empaquetada con grafos ONNX (fp16 e int8), tokenizer, settings y el paquete Python `kniv_v7` dentro del propio repositorio, sin dependencias externas mas alla de onnxruntime, tokenizers, numpy y huggingface_hub.

## Capacidades

- Etiquetado gramatical (POS / UPOS) y morfologia.
- Lematizacion.
- Reconocimiento de entidades nombradas (NER) en ingles.
- Parsing de dependencias (arboles de dependencias).
- Etiquetado de roles semanticos (SRL).
- Clasificacion de acto de dialogo y analisis de sentimiento por frase.
- Resolucion de correferencia.
- Extraccion de relaciones a nivel de documento.
- Extraccion de entidades y hechos zero-shot contra un esquema definido en inferencia (tipos de entidad y relaciones con nombre y descripcion opcional).
- Anotacion de cada hecho con polaridad, modalidad, portador y tiempo.
- Tratamiento de hablantes como entidades en conversaciones (memoria de agente y memoria conversacional).
- Construccion de grafos de conocimiento y soporte a pipelines de busqueda y analitica documental.
- No soporta tool calling ni function calling generativo; es un encoder de extraccion, no un modelo de instrucciones.

## Casos de uso

- Memoria de agente conversacional: el modelo procesa cada turno y extrae hechos del estilo `(user, lives in, Lisbon)` asignando el hablante como entidad, lo que permite mantener una memoria estructurada y consultable de la conversacion sin fine-tuning.
- Construccion de grafos de conocimiento: a partir de documentos en ingles se definen en inferencia los tipos de entidad y las relaciones de interes, y el modelo devuelve entidades, hechos y sus metadatos (polaridad, modalidad, portador, tiempo) listos para poblar el grafo.
- Analitica documental y extraccion de informacion: sobre prosa en ingles de hasta 512 palabras por ventana, se obtienen en una sola pasada POS, lemas, NER, dependencias y roles semanticos, lo que reduce el numero de modelos y pasos del pipeline.
- Busqueda semantica y enriquecimiento de indices: las entidades, relaciones y analisis linguistico generados pueden indexarse junto al texto para mejorar recuperacion y filtrado por hechos concretos.
- Procesamiento de resenas y voz del cliente: la clasificacion de sentimiento y acto de dialogo por frase, junto con la extraccion de entidades y relaciones, permite resumir opiniones y atributos de producto de forma estructurada.
- Preprocesado para pipelines de NLP: al cubrir lematizacion, morfologia y parsing de dependencias en un unico encoder ONNX, sirve como etapa de analisis linguistica previa a otros sistemas, con despliegue en CPU gracias a su tamano y a las variantes int8/fp16.
- Enriquecimiento de registros para compliance y auditoria documental: la anotacion de portador, tiempo y modalidad de cada hecho facilita rastrear quien afirma que y cuando, siempre con revision humana en dominios sensibles.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset (split) | Metrica | Valor |
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

El autor indica ademas que el modelo queda a menos de un punto del mejor teacher en etiquetado, parsing, NER y roles semanticos, y a menos de dos puntos en relaciones a nivel de documento.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un encoder de 221M parametros, la huella es reducida; en fp16 en torno a 0,5 GB de pesos y en int8 aproximadamente la mitad, mas overhead de activaciones y runtime.
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM es suficiente; A100, H100, L4, RTX 4090 o RTX 3060 funcionan sin problema. El modelo esta pensado tambien para CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer actual, incluidas las de gama baja, gracias a su tamano y a las variantes cuantizadas.
- Opciones de despliegue: onnxruntime (CPU o GPU) es la via nativa, ya que el repositorio incluye los grafos ONNX, el tokenizer, los settings y el paquete `kniv_v7`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: el autor afirma aproximadamente el doble de velocidad en CPU que los modelos teacher (485M y 538M parametros); no se publican cifras absolutas de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Base | Contexto | Rol | Licencia |
|---|---|---|---|---|---|
| kniv-v7-large-en | 221M | ModernBERT-base | 512 palabras (1.024 subwords) | estudiante destilado | Apache-2.0 |
| kniv-v7-xlarge-u-en | 485M | UltraBERT-380M | no disponible | teacher | no disponible |
| kniv-v7-xlarge-d-en | 538M | deberta-v3-large | no disponible | teacher | no disponible |
| kniv-v7-small-en | 76M | ettin-encoder-32m | no disponible | estudiante destilado | no disponible |
| kniv-v7-tiny-en | 55M | ettin-encoder-17m | no disponible | estudiante destilado | no disponible |

Segun el autor, kniv-v7-large-en ofrece las mismas salidas que los teachers con menos de la mitad de parametros y aproximadamente el doble de velocidad en CPU, quedando a menos de un punto en etiquetado, parsing, NER y roles semanticos y a menos de dos en relaciones a nivel de documento. Es mas debil que los teachers en tipos de entidad no vistos y en correferencia. No se dispone de comparativas con modelos externos a la familia kniv v7 en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; cualquier otro idioma queda fuera de alcance.
- Rendimiento mas debil que los teachers en tipos de entidad con nombres no vistos (CrossNER span F1 de 0,496 de media en 4 dominios) y en correferencia (CoNLL F1 de 0,667 en LitBank).
- Riesgo de alucinacion en la extraccion: el modelo puede producir entidades o hechos incorrectos, por lo que el autor desaconseja actuar sobre los hechos extraidos sin revision en contextos donde los errores importan (decisiones medicas, legales, financieras o laborales sobre personas).
- El autor publica un GUIDE.md con los modos de fallo conocidos de la familia kniv v7 y como mitigarlos en codigo; esos modos de fallo aplican tambien a este modelo.
- Ventana limitada a 512 palabras (1.024 subwords), lo que obliga a trocear documentos largos.
- No es un modelo generativo ni soporta tool calling; su uso esta acotado a extraccion y etiquetado estructurado.
- Uso prohibido o desaconsejado para perfilado de individuos sin su consentimiento.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base ModernBERT-base.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dragonscale-ai/kniv-v7-large-en
- Guia de modos de fallo (GUIDE.md): https://huggingface.co/dragonscale-ai/kniv-v7-large-en/blob/main/GUIDE.md
- Modelo teacher kniv-v7-xlarge-u-en: https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-u-en
- Modelo teacher kniv-v7-xlarge-d-en: https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-d-en
- Modelo kniv-v7-small-en: https://huggingface.co/dragonscale-ai/kniv-v7-small-en
- Modelo kniv-v7-tiny-en: https://huggingface.co/dragonscale-ai/kniv-v7-tiny-en
- Modelo base ModernBERT-base: https://huggingface.co/answerdotai/ModernBERT-base
- Organizacion en Hugging Face: https://huggingface.co/dragonscale-ai
