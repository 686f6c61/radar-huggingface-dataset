# dragonscale-ai/kniv-v7-xlarge-d-en

## Resumen

kniv-v7-xlarge-d-en es un encoder transformer multi-tarea en ingles desarrollado por Dragonscale (dragonscale-ai) sobre microsoft/deberta-v3-large. Resuelve dos problemas en una sola pasada: por un lado, ofrece una capa de analisis linguistico completo (POS, morfologia, lemas, NER, arboles de dependencias, roles semanticos, acto de dialogo y sentimiento por oracion, y correferencia); por otro, una capa de extraccion de conocimiento contra un esquema definido en tiempo de inferencia, es decir, el usuario nombra los tipos de entidad y las relaciones que le interesan y el modelo extrae hechos con polaridad, modalidad, titular y marca temporal.

El modelo tiene 538 millones de parametros y procesa ventanas de hasta 512 subwords, con un maximo de 512 palabras por ventana segun la model card. Se distribuye en formato ONNX (grafos fp16 e int8) junto con el tokenizer, la configuracion y el paquete Python `kniv_v7`, de modo que todo lo necesario para ejecutarlo esta en el propio repositorio. La licencia es Apache-2.0.

Su relevancia actual esta en el nicho de memoria de agentes y construccion de grafos de conocimiento: al ser un encoder pequeno y determinista, permite extraer entidades y relaciones sin depender de un LLM generativo, con menor coste y menor riesgo de alucinacion. Forma parte de una familia de cinco modelos (tiny, small, large, xlarge-d y xlarge-u) donde este actua como teacher.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder multi-tarea (DeBERTa-v3-large) |
| Parametros totales | 538M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 512 palabras por ventana (512 subwords) |
| Tipos de cuantizacion | fp16, int8 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafos fp16 e int8) |
| Modelo base | microsoft/deberta-v3-large |
| Version | kniv v7 (`deberta-v3-large-v7b8ev`), 2026-10-20 |
| Libreria | onnx (onnxruntime) |
| Tamano del repositorio | 12,9 GB |
| Pipeline declarado | token-classification |

## Arquitectura y entrenamiento

El modelo parte de DeBERTa-v3-large, un encoder transformer con atencion disentangled y embeddings de posicion relativos, y anade cabezas multi-tarea para las distintas capas de analisis. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO; esa informacion no esta disponible. Si se explicita la version de entrenamiento (`deberta-v3-large-v7b8ev`, fechada el 2026-10-20).

La innovacion principal no es arquitectonica sino de interfaz: el modelo acepta en inferencia un esquema de relaciones definido por el usuario (un nombre y una descripcion opcional) y devuelve hechos estructurados con polaridad, modalidad, titular y tiempo, ademas del analisis linguistico. En conversaciones, cada hablante se trata como una entidad, de forma que "I moved to Lisbon" produce el hecho `(user, lives in, Lisbon)`. El repositorio incluye un fichero GUIDE.md que compara este modelo con su hermano kniv-v7-xlarge-u-en y documenta como sortear sus modos de fallo conocidos.

## Capacidades

- Analisis linguistico: etiquetado POS (UPOS), morfologia, lematizacion, reconocimiento de entidades nombradas, parsing de dependencias, etiquetado de roles semanticos y resolucion de correferencia.
- Clasificacion a nivel de oracion: acto de dialogo y analisis de sentimiento.
- Extraccion de conocimiento segun esquema: entidades de los tipos indicados y hechos para las relaciones indicadas, con polaridad, modalidad, titular y tiempo.
- Relaciones de documento completo (document-level relation extraction).
- Clasificacion de relaciones y NER en modo zero-shot sobre tipos no vistos.
- Memoria conversacional y de agente: modela hablantes como entidades para construir hechos persistentes.
- Soporte para construccion de grafos de conocimiento.
- No dispone de generacion de texto, razonamiento generativo, codigo, matematicas, vision, audio ni tool calling; es un encoder de extraccion, no un modelo conversacional.

## Casos de uso

- Memoria de agentes conversacionales: el modelo procesa los turnos de una conversacion y extrae hechos del tipo `(user, lives in, Lisbon)` con su polaridad y tiempo, lo que permite mantener una memoria estructurada y auditable del usuario entre sesiones sin recurrir a un LLM generativo.
- Construccion de grafos de conocimiento: dado un esquema de entidades y relaciones, extrae tripletas de documentos completos (relation extraction a nivel de documento) para poblar bases de datos de conocimiento o motores de busqueda semantica.
- Enriquecimiento de pipelines de busqueda y analitica documental: el analisis linguistico completo (POS, dependencias, roles semanticos) permite indexar documentos con estructura sintactica y semantica, mejorando el filtrado y la recuperacion.
- Extraccion de informacion en dominios con esquema propio: al aceptar el esquema en inferencia, se puede adaptar a dominios como contratos, informes o articulos sin fine-tuning, usando las relaciones y entidades que defina el equipo.
- Analisis de conversaciones y atencion al cliente: la clasificacion de actos de dialogo y sentimiento por oracion permite medir la evolucion de una conversacion y detectar frustracion o intenciones sin un modelo generativo.
- Anonimizacion y analisis de entidades: el NER con F1 de 0,87 en OntoNotes permite localizar personas, organizaciones y lugares en textos para tareas de redaccion o cumplimiento, revisando siempre los resultados.
- Preprocesado para pipelines de NLP: al ser un encoder ONNX cuantizado (fp16/int8), se puede desplegar en CPU o GPU modesta como etapa de preprocesado determinista antes de un modelo mayor.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Part-of-speech tagging | UD English EWT (test) | UPOS accuracy | 0,982 |
| Dependency parsing | UD English EWT (test) | LAS | 0,929 |
| Named entity recognition | OntoNotes 5.0 (test) | span F1 | 0,870 |
| Semantic role labeling | PropBank EWT (test) | end-to-end argument F1 | 0,810 |
| Coreference resolution | LitBank (test) | CoNLL F1 | 0,692 |
| Document-level relation extraction | Re-DocRED (test) | F1 (gold entities) | 0,733 |
| Document-level relation extraction | Re-DocRED (test) | F1 (end to end) | 0,627 |
| Zero-shot relation classification | FewRel (15 unseen, train+validation) | macro F1, m=5 | 0,731 |
| Zero-shot NER | CrossNER (test) | span F1, media de 4 dominios | 0,533 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparativas con modelos de la misma categoria.

## Requisitos de hardware

- VRAM estimada: con 538M parametros, en fp16 el modelo ocupa aproximadamente 1,1 GB de pesos; en int8, alrededor de 0,55 GB. Hay que sumar el overhead de onnxruntime y de los buffers de activacion, por lo que un presupuesto realista es de 2-4 GB en fp16 y 1-2 GB en int8.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen holgado. Para lotes grandes o alto throughput, A100 o H100 no son necesarias dado el tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 20xx en adelante) y tambien en CPU mediante onnxruntime.
- Opciones de despliegue: onnxruntime (unica via documentada, con el paquete `kniv_v7` incluido en el repositorio). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| kniv-v7-xlarge-d-en | 538M | 512 subwords | Encoder multi-tarea + extraccion de conocimiento | Apache-2.0 |
| kniv-v7-xlarge-u-en | 485M | no disponible | Mismo diseno sobre UltraBERT-380M; mejor en relaciones conversacionales | Apache-2.0 |
| kniv-v7-large-en | 221M | no disponible | Estudiante destilado sobre ModernBERT-base | Apache-2.0 |
| microsoft/deberta-v3-large | 435M | 512 tokens | Encoder base, sin cabezas multi-tarea | MIT |

La model card indica que kniv-v7-xlarge-d-en ofrece un parsing, NER, roles semanticos y relaciones enciclopedicas ligeramente mejores que su hermano xlarge-u, mientras que este ultimo se orienta a relaciones conversacionales. No se dispone de comparativas de rendimiento frente a modelos de extraccion de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: no soporta otros idiomas.
- Ventana de 512 subwords (hasta 512 palabras por ventana): los documentos mas largos requieren segmentacion y el modelo puede perder contexto entre ventanas.
- No es un modelo generativo: no produce texto, razonamiento libre, codigo ni respuestas conversacionales.
- Riesgo de error en la extraccion: la model card desaconseja actuar sobre los hechos extraidos sin revision en contextos donde los errores importan (decisiones medicas, legales, financieras o de empleo sobre personas).
- Zero-shot NER limitado: F1 de 0,533 de media en CrossNER, muy por debajo del rendimiento supervisado; conviene validar el esquema antes de usarlo en produccion.
- Correferencia moderada: CoNLL F1 de 0,692 en LitBank, con margen de mejora.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; al entrenarse sobre corpus en ingles, es esperable que herede sesgos de esos datos.
- Uso comercial: permitido por Apache-2.0, pero la model card excluye explicitamente el perfilado de individuos sin consentimiento.
- Dependencia del ecosistema ONNX y del paquete `kniv_v7` incluido en el repositorio; no hay integracion documentada con frameworks de inferencia genericos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-d-en
- Modelo hermano: https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-u-en
- Modelo tiny: https://huggingface.co/dragonscale-ai/kniv-v7-tiny-en
- Modelo small: https://huggingface.co/dragonscale-ai/kniv-v7-small-en
- Modelo large: https://huggingface.co/dragonscale-ai/kniv-v7-large-en
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
- Organizacion: https://huggingface.co/dragonscale-ai
- Guia de uso y modos de fallo: GUIDE.md dentro del repositorio del modelo (https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-d-en/blob/main/GUIDE.md)
