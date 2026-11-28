# dragonscale-ai/kniv-v7-xlarge-u-en

## Resumen

kniv-v7-xlarge-u-en es un encoder transformer multi-tarea en ingles desarrollado por Dragonscale (dragonscale-ai) sobre el modelo base dmis-lab/UltraBERT-380M. Su proposito no es la generacion de texto, sino el analisis linguistico completo y la extraccion de conocimiento estructurado: part-of-speech, morfologia, lemas, entidades nombradas, arboles de dependencias, roles semanticos, actos de dialogo, sentimiento y correferencia, todo en una sola pasada. Ademas, incorpora una capa de extraccion de conocimiento que permite definir en tiempo de inferencia el esquema de entidades y relaciones que se quiere poblar, sin necesidad de fine-tuning.

El modelo forma parte de la familia kniv v7, que incluye variantes destiladas (tiny, small, medium, large) y dos modelos "teacher": este, basado en UltraBERT-380M con 485M parametros, y kniv-v7-xlarge-d-en, basado en deberta-v3-large con 538M parametros. Segun la model card, esta variante ofrece mejor rendimiento zero-shot en tipos nuevos de entidades y relaciones, mejor extraccion de memoria conversacional y ventanas mas largas (1.024 subwords, hasta 512 palabras), con unos 50M parametros menos que su hermano.

Es relevante para pipelines de extraccion de informacion, construccion de grafos de conocimiento, memoria de agentes conversacionales y analitica documental en ingles, donde se necesita una alternativa determinista y ligera a los LLM generativos. Se distribuye en formato ONNX con cuantizaciones fp16 e int8, bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder multi-tarea (base UltraBERT-380M) |
| Parametros totales | 485M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 subwords (hasta 512 palabras por ventana) |
| Tipos de cuantizacion | fp16, int8 |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafos), tokenizer incluido, paquete Python `kniv_v7` |

## Arquitectura y entrenamiento

El modelo es un encoder transformer multi-tarea construido sobre dmis-lab/UltraBERT-380M. En lugar de una cabeza unica, expone multiples cabezas de token-classification y text-classification que cubren analisis linguistico (POS, morfologia, lemas, NER, dependency parsing, semantic role labeling, coreference resolution, dialogue act y sentiment) y extraccion de conocimiento (entidades y relaciones definidas por esquema en inferencia, con polaridad, modalidad, titular y tiempo por cada hecho). La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset; indica que la version es kniv v7.1.2 (`ultrabert-380m-v7b8ev`), con iteraciones previas v7.1.1, v7.1 y v7.0.

La innovacion principal es la capa de conocimiento zero-shot: el usuario proporciona en tiempo de inferencia los tipos de entidad y las relaciones que desea extraer (nombre y descripcion opcional), y el modelo devuelve hechos estructurados. En conversaciones, cada hablante se trata como una entidad, de modo que "I live in Berlin" produce la tupla `(user, lives in, Berlin)`. No se documentan en la informacion disponible detalles sobre RLHF, DPO ni decodificacion especulativa; al ser un encoder, no aplica generacion autoregresiva.

## Capacidades

- Analisis linguistico completo: part-of-speech tagging, morfologia, lematizacion, NER, dependency parsing, semantic role labeling, coreference resolution, dialogue act classification y sentiment analysis por frase.
- Extraccion de entidades y relaciones contra un esquema definido en inferencia (zero-shot), sin fine-tuning.
- Extraccion de hechos con metadatos: polaridad, modalidad, titular y tiempo.
- Memoria conversacional y de agentes: cada hablante se modela como entidad, permitiendo extraer hechos atribuidos a usuarios concretos.
- Construccion de grafos de conocimiento a partir de texto en ingles.
- Salida en formato token-classification, adecuada para pipelines estructurados.
- Capacidades multilingues: limitadas al ingles segun la model card.
- No dispone de generacion de texto, vision, audio ni tool calling nativo; es un encoder de extraccion, no un LLM generativo.

## Casos de uso

- Memoria de agentes conversacionales: el modelo extrae hechos atribuidos a cada hablante ("user lives in Berlin") a partir de los turnos de dialogo, lo que permite mantener un estado persistente y estructurado del usuario sin depender de un LLM generativo.
- Construccion de grafos de conocimiento: dado un corpus de prosa en ingles y un esquema de relaciones propio, el modelo puebla entidades y aristas con polaridad y tiempo, adecuado para pipelines de enriquecimiento documental.
- Analisis de documentos y busqueda semantica: la capa linguistica (lemas, dependencias, roles semanticos) mejora la indexacion y la extraccion de pasajes relevantes en buscadores corporativos.
- Procesamiento de resenas y encuestas: sentiment analysis y dialogue act classification por frase permiten segmentar opiniones y detectar actos comunicativos en conversaciones de atencion al cliente.
- Anonimizacion y enmascarado de entidades: el NER con span F1 de 0,86 sobre OntoNotes permite localizar entidades nombradas para redaccion o cumplimiento normativo en textos en ingles.
- Analitica de reuniones y transcripciones: la correferencia y el dependency parsing facilitan la resolucion de menciones y la atribucion de acciones a participantes.
- Extraccion zero-shot en dominios nuevos: con un F1 macro de 0,729 en FewRel (15 relaciones no vistas) y 0,580 en CrossNER, sirve para prototipar esquemas de extraccion sin datos etiquetados del dominio.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

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

No se han publicado en la informacion disponible resultados comparativos directos frente a otros modelos de la misma categoria.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 13,4 GB e incluye los grafos ONNX en varias precisiones; en fp16 el modelo de 485M parametros requiere aproximadamente 1 GB de pesos, y en int8 alrededor de 0,5 GB, mas overhead de activaciones y del runtime.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para fp16; A100, H100 o RTX 4090 sobredimensionadas para este tamano, utiles solo por throughput en lote.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060 o superiores; tambien puede ejecutarse en CPU con onnxruntime.
- Opciones de despliegue: onnxruntime (dependencia oficial), con el paquete `kniv_v7` incluido en el repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Base | Licencia | Enfoque |
|---|---|---|---|---|---|
| kniv-v7-xlarge-u-en | 485M | 1.024 subwords | UltraBERT-380M | Apache-2.0 | Encoder multi-tarea + extraccion zero-shot |
| kniv-v7-xlarge-d-en | 538M | No disponible | deberta-v3-large | Apache-2.0 | Encoder multi-tarea + extraccion zero-shot |
| kniv-v7-large-en | 221M | No disponible | ModernBERT-base | Apache-2.0 | Estudiante destilado |
| kniv-v7-medium-en | 122M | No disponible | ettin-encoder-68m | Apache-2.0 | Estudiante destilado |

La model card indica que esta variante ofrece mejor rendimiento zero-shot y ventanas mas largas que kniv-v7-xlarge-d-en, con unos 50M parametros menos. No se dispone de comparativas con encoders de extraccion de informacion de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; el resto de idiomas queda fuera de alcance segun la model card.
- Riesgo de alucinacion en la capa de extraccion: los hechos extraidos no deben usarse sin revision en contextos donde los errores importan (decisiones medicas, legales, financieras o de empleo sobre personas).
- Prohibido el perfilado de individuos sin su consentimiento.
- Los benchmarks del model-index estan declarados por el autor y marcados como no verificados; deben tomarse con cautela.
- El rendimiento zero-shot en dominios nuevos es limitado (span F1 de 0,580 en CrossNER), por lo que esquemas muy alejados del dominio de entrenamiento pueden requerir validacion adicional.
- El modelo es un encoder de extraccion, no un generador: no produce texto libre ni admite tool calling nativo.
- La model card remite a GUIDE.md para conocer los modos de fallo conocidos y como mitigarlos en el codigo del usuario.
- El repositorio incluye el paquete `kniv_v7`; la instalacion requiere anadir la ruta del snapshot al `sys.path`, lo que conviene gestionar con cuidado en entornos de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-u-en
- Modelo hermano: https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-d-en
- Variante tiny: https://huggingface.co/dragonscale-ai/kniv-v7-tiny-en
- Variante small: https://huggingface.co/dragonscale-ai/kniv-v7-small-en
- Variante medium: https://huggingface.co/dragonscale-ai/kniv-v7-medium-en
- Variante large: https://huggingface.co/dragonscale-ai/kniv-v7-large-en
- Modelo base: https://huggingface.co/dmis-lab/UltraBERT-380M
- Organizacion: https://huggingface.co/dragonscale-ai
- Guia de la familia (GUIDE.md): referenciada en el repositorio del modelo
