# dragonscale-ai/kniv-v7-small-en

## Resumen

kniv-v7-small-en es un encoder transformer multitarea en inglés desarrollado por Dragonscale (dragonscale-ai) que combina un analisis linguistico completo con extraccion de conocimiento contra un esquema definido en tiempo de inferencia. Se trata de un estudiante destilado de los dos modelos profesores kniv v7 xlarge (kniv-v7-xlarge-u-en y kniv-v7-xlarge-d-en), construido sobre el encoder jhu-clsp/ettin-encoder-32m. Con 76 millones de parametros totales (32M del encoder base mas las cabezas de tarea), ofrece las mismas salidas, grafos y runtime que los modelos grandes, pero con un coste computacional mucho menor.

El modelo resuelve dos capas de analisis en una sola pasada: una capa linguistica (part-of-speech, morfologia, lemas, entidades nombradas, arboles de dependencias, roles semanticos, acto de dialogo y sentimiento por oracion, y correferencia) y una capa de conocimiento (entidades de los tipos que se especifiquen, hechos para las relaciones indicadas, y para cada hecho su polaridad, modalidad, portador y tiempo). En conversaciones, cada hablante se trata como una entidad, de modo que "I moved to Lisbon" produce el hecho `(user, lives in, Lisbon)`, lo que lo hace directamente aplicable a memoria de agentes y construccion de grafos de conocimiento.

Es relevante ahora porque permite extraer informacion estructurada sin fine-tuning y con un modelo pequeno que cabe en CPU o GPU consumer, orientado a memoria conversacional de agentes, busqueda y analitica documental. El autor lo publica como preview: rinde cerca de los profesores en etiquetado y parsing, pero se queda por debajo de los objetivos de calidad en NER, roles semanticos, correferencia, relaciones y tipos de entidad, por lo que recomienda kniv-v7-large-en para mejor calidad a tamano moderado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder multitarea (base ModernBERT, ettin-encoder-32m) |
| Parametros totales | 76M (32M encoder + cabezas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 512 palabras por ventana (1.024 subwords) |
| Tipos de cuantizacion | fp16, int8 (pesos ONNX cuantizados) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (repo de 1,3 GB) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer multitarea derivado de jhu-clsp/ettin-encoder-32m, un encoder de tipo ModernBERT de 32M de parametros, al que se anaden cabezas de tarea hasta alcanzar 76M de parametros totales. La version concreta es kniv v7 (`ettin-32m-s30-coref`, fechada el 2026-11-01). Procesa hasta 512 palabras por ventana, equivalentes a 1.024 subwords, y se distribuye como grafos ONNX junto con el tokenizer, los ajustes y el paquete Python `kniv_v7`, que convierte texto en resultados sin dependencias externas adicionales.

El entrenamiento es por destilacion: el modelo es un estudiante destilado de los dos profesores kniv v7 xlarge (kniv-v7-xlarge-u-en, sobre UltraBERT-380M con 485M de parametros, y kniv-v7-xlarge-d-en, sobre deberta-v3-large con 538M de parametros). El objetivo es replicar las mismas salidas, grafos y runtime de los profesores con un encoder mucho menor. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos figuran como no disponibles. La innovacion principal es la unificacion de multiples tareas linguisticas y de extraccion de conocimiento en un unico encoder pequeno con esquema configurable en inferencia, junto con la publicacion en ONNX fp16 e int8 para despliegue ligero.

## Capacidades

- Generacion de analisis linguistico completo: part-of-speech, morfologia, lematizacion, entidades nombradas, arboles de dependencias, roles semanticos, correferencia, acto de dialogo y sentimiento por oracion.
- Extraccion de entidades de los tipos especificados en tiempo de inferencia (esquema configurable, sin fine-tuning).
- Extraccion de hechos para las relaciones indicadas, con polaridad, modalidad, portador y tiempo para cada hecho.
- Extraccion de relaciones a nivel de documento.
- Clasificacion de relaciones zero-shot y reconocimiento de entidades zero-shot.
- Tratamiento de hablantes como entidades en conversaciones, habilitando memoria conversacional y de agentes.
- Construccion de grafos de conocimiento a partir de texto y conversaciones.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad generativa; el modelo es un encoder de extraccion, no un generador.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales: cuantizacion int8 y fp16 en ONNX para inferencia ligera; sin modo thinking, vision ni audio.

## Casos de uso

- Memoria de agentes conversacionales: el modelo convierte cada turno en hechos estructurados con hablante como entidad (por ejemplo, `(user, lives in, Lisbon)`), permitiendo mantener un estado persistente del usuario sin fine-tuning y con un encoder de 76M que puede ejecutarse en el mismo proceso del agente.
- Construccion de grafos de conocimiento: a partir de documentos en ingles, extrae entidades de tipos definidos por el usuario y relaciones con polaridad, modalidad, portador y tiempo, alimentando directamente un almacen de tripletas o una base de datos de grafo.
- Analisis documental y extraccion de informacion: sobre corpus de prosa en ingles, aplica un esquema de entidades y relaciones adaptado al dominio (contratos, informes, articulos) sin reentrenar, gracias a la configuracion del esquema en inferencia.
- Enriquecimiento para busqueda: genera anotaciones linguisticas (POS, lemas, dependencias, entidades) que mejoran la indexacion y la recuperacion, con un coste bajo al ser un modelo de 76M en ONNX.
- Preprocesado linguistico para pipelines de NLP: produce analisis morfologico, sintactico y de roles semanticos en una sola pasada, sustituyendo varios modelos especializados en un pipeline de procesamiento de texto.
- Analisis de sentimiento y actos de dialogo por oracion: util en analisis de conversaciones, transcripciones de atencion al cliente o moderacion, donde se necesita etiquetar sentimiento y acto de dialogo a nivel de oracion.
- Prototipado y validacion de esquemas: al ser un preview ligero, sirve para probar rapidamente esquemas de extraccion antes de migrar a kniv-v7-large-en o a los profesores xlarge cuando se requiera mayor calidad.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados):

| Tarea | Dataset (split) | Metrica | Valor |
|---|---|---|---|
| Part-of-speech tagging | UD English EWT (test) | UPOS accuracy | 0,972 |
| Dependency parsing | UD English EWT (test) | LAS | 0,911 |
| Named entity recognition | OntoNotes 5.0 (test) | span F1 | 0,827 |
| Semantic role labeling | PropBank EWT (test) | end-to-end argument F1 | 0,773 |
| Coreference resolution | LitBank (test) | CoNLL F1 | 0,620 |
| Document-level relation extraction | Re-DocRED (test) | F1 (gold entities) | 0,672 |
| Document-level relation extraction | Re-DocRED (test) | F1 (end to end) | 0,567 |
| Zero-shot relation classification | FewRel (15 unseen, train+validation) | macro F1, m=5 | 0,787 |
| Zero-shot named entity recognition | CrossNER (test) | span F1, media de 4 dominios | 0,410 |

## Requisitos de hardware

- VRAM estimada para inferencia: el encoder base tiene 32M de parametros y el modelo completo 76M; en fp16 el peso ronda los 150 MB y en int8 alrededor de 76 MB, por lo que la huella de memoria es minima (no se publican cifras oficiales de VRAM).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. El modelo esta pensado para ejecutarse en CPU o en GPU de gama baja.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer (por ejemplo, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: ONNX Runtime es la via principal, ya que el repositorio incluye los grafos ONNX, el tokenizer, los ajustes y el paquete Python `kniv_v7`. No se indica soporte para vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a modelos generativos).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Encoder base | Parametros | Contexto | Rol | Licencia |
|---|---|---|---|---|---|
| kniv-v7-tiny-en | ettin-encoder-17m | 55M | 512 palabras / 1.024 subwords | estudiante destilado | Apache-2.0 |
| kniv-v7-small-en (este) | ettin-encoder-32m | 76M | 512 palabras / 1.024 subwords | estudiante destilado | Apache-2.0 |
| kniv-v7-large-en | ModernBERT-base | 221M | no disponible | estudiante destilado | Apache-2.0 |
| kniv-v7-xlarge-d-en | deberta-v3-large | 538M | no disponible | profesor | Apache-2.0 |
| kniv-v7-xlarge-u-en | UltraBERT-380M | 485M | no disponible | profesor | Apache-2.0 |

Los cinco modelos comparten el mismo formato de salida, grafos y runtime, de modo que la eleccion depende del equilibrio entre calidad y coste. Segun el autor, kniv-v7-small-en se acerca a los profesores en etiquetado y parsing (POS 0,972, LAS 0,911) pero es claramente mas debil en NER, roles semanticos, correferencia, relaciones y tipos de entidad; para mejor calidad a tamano moderado recomienda kniv-v7-large-en. No se dispone de comparativas con modelos de terceros fuera de la familia kniv v7 en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; queda fuera de alcance cualquier otro idioma.
- Es un preview y no alcanza los objetivos de calidad del autor en NER, roles semanticos, correferencia, relaciones y tipos de entidad.
- El rendimiento zero-shot en NER es bajo (span F1 de 0,410 de media en CrossNER), lo que limita su uso en dominios no vistos.
- La correferencia es debil (CoNLL F1 de 0,620 en LitBank).
- Riesgo de alucinacion en la extraccion de hechos: al ser un modelo discriminativo, puede generar entidades o relaciones incorrectas; el autor recomienda revisar los hechos extraidos cuando los errores tengan consecuencias.
- No debe usarse para tomar decisiones medicas, legales, financieras o de empleo sobre personas sin revision humana.
- No debe usarse para perfilado de individuos sin su consentimiento.
- Es un encoder de extraccion, no un generador de texto; no dispone de capacidades generativas ni de razonamiento multi-paso.
- La licencia Apache-2.0 permite uso comercial, pero deben respetarse las condiciones de la licencia y las advertencias de uso del autor.
- El autor remite a GUIDE.md para los modos de fallo conocidos de la familia kniv v7 y sus soluciones, aplicables tambien a este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dragonscale-ai/kniv-v7-small-en
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Profesor kniv-v7-xlarge-u-en: https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-u-en
- Profesor kniv-v7-xlarge-d-en: https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-d-en
- kniv-v7-tiny-en: https://huggingface.co/dragonscale-ai/kniv-v7-tiny-en
- kniv-v7-large-en: https://huggingface.co/dragonscale-ai/kniv-v7-large-en
- Guia de modos de fallo (GUIDE.md): https://huggingface.co/dragonscale-ai/kniv-v7-small-en/blob/main/GUIDE.md
- Organizacion en HuggingFace: https://huggingface.co/dragonscale-ai
