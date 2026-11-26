# dragonscale-ai/kniv-v7-deberta-v3-large-en

## Resumen

kniv-v7-xlarge-d-en es un codificador transformer multi-tarea en ingles desarrollado por Dragonscale (dragonscale-ai) sobre la base de microsoft/deberta-v3-large. Su objetivo es doble: por un lado, ofrece una capa de analisis linguistico completo (etiquetado gramatical, morfologia, lemas, entidades nombradas, arboles de dependencias, roles semanticos, actos de dialogo, sentimiento y correferencia); por el otro, una capa de extraccion de conocimiento que permite definir en tiempo de inferencia un esquema propio de entidades y relaciones y obtener hechos con polaridad, modalidad, portador y tiempo.

El modelo tiene 538 millones de parametros y procesa ventanas de hasta 512 subpalabras. Se distribuye exclusivamente en formato ONNX (con variantes fp16 e int8) junto con el tokenizador, la configuracion y un paquete Python propio, kniv_v7, que convierte texto en resultados estructurados sin necesidad de fine-tuning. Forma parte de una familia de seis modelos kniv v7, donde este actua como modelo profesor frente a los estudiantes destilados de menor tamano.

Su relevancia actual radica en el uso como memoria de agentes y motor de grafos de conocimiento: al tratar a cada hablante de una conversacion como una entidad, frases como "I live in Berlin" se transforman en la tupla (user, lives in, Berlin), lo que facilita la construccion de memorias conversacionales y pipelines de extraccion de informacion sin entrenamiento adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder multi-tarea (base: microsoft/deberta-v3-large) |
| Parametros totales | 538M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 512 palabras por ventana (512 subpalabras) |
| Tipos de cuantizacion | fp16, int8 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafos ONNX con tokenizer y settings incluidos en el repo) |
| Version | kniv v7.1.2 (deberta-v3-large-v7b8ev), 2026-11-13 |
| Tamano del repositorio | 17,1 GB |
| Libreria | onnx / onnxruntime |
| Pipeline | token-classification |

## Arquitectura y entrenamiento

El modelo se construye sobre el encoder DeBERTa-v3-large de Microsoft, un transformer con atencion desenredada (disentangled attention) y embeddings de posicion relativos, adaptado a un cabezal multi-tarea. Sobre esa base, Dragonscale anade cabezas para tareas de etiquetado de tokens y clasificacion: POS, morfologia, lematizacion, NER, parsing de dependencias, etiquetado de roles semanticos, correferencia, actos de dialogo, sentimiento, clasificacion y extraccion de relaciones a nivel de documento, y clasificacion de relaciones zero-shot.

La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible. Si se indica que el modelo forma parte de una familia con destilacion: los modelos tiny, small, medium y large son estudiantes destilados de este xlarge-d y de su hermano kniv-v7-xlarge-u-en (UltraBERT-380M), que comparten diseno. La innovacion principal es la capacidad de definir el esquema de extraccion en tiempo de inferencia (zero-shot sobre tipos de entidad y relaciones nombradas), junto con la salida enriquecida de cada hecho con polaridad, modalidad, portador y marco temporal.

## Capacidades

- Analisis linguistico completo: etiquetado POS (UPOS), morfologia, lematizacion, entidades nombradas (NER), arboles de dependencias, roles semanticos y correferencia.
- Clasificacion a nivel de oracion: acto de dialogo y analisis de sentimiento.
- Extraccion de conocimiento contra un esquema definido en inferencia: entidades de los tipos indicados y hechos para las relaciones indicadas (nombre mas descripcion opcional).
- Enriquecimiento de hechos con polaridad, modalidad, portador (holder) y tiempo.
- Extraccion de relaciones a nivel de documento y clasificacion de relaciones zero-shot.
- NER zero-shot sobre dominios no vistos.
- Tratamiento de hablantes como entidades en conversaciones, habilitando memoria conversacional y de agentes.
- Soporte de cuantizacion fp16 e int8 para despliegue eficiente en CPU y GPU.
- Capacidades multilingues: limitadas al ingles; no se declara soporte de otros idiomas.
- No se declara soporte de tool calling, function calling, agentes multi-paso ni modos de razonamiento explicitos; el modelo es un encoder de extraccion, no un generador de texto.

## Casos de uso

- Memoria de agentes conversacionales: el modelo procesa turnos de dialogo y convierte cada afirmacion del usuario en hechos estructurados con portador y tiempo, de modo que un agente puede recuperar posteriormente que el usuario vive en Berlin o que prefiere cierto idioma, sin fine-tuning.
- Construccion de grafos de conocimiento: a partir de documentos en ingles, se define un esquema de entidades y relaciones y el modelo extrae tripletas con polaridad y modalidad, adecuadas para poblar bases de datos de grafo o motores de busqueda semantica.
- Extraccion de informacion en analitica documental: procesamiento por ventanas de 512 subpalabras de informes, articulos o contratos para obtener entidades, relaciones y estructura sintactica que alimenten paneles de analisis.
- Enriquecimiento de pipelines de busqueda: el analisis de dependencias y roles semanticos permite indexar relaciones sujeto-verbo-objeto y mejorar la recuperacion de pasajes frente a busquedas puramente lexicas.
- Analisis de sentimiento y actos de dialogo en atencion al cliente: clasificacion por oracion del tono y la intencion comunicativa para enrutar conversaciones o priorizar casos.
- Preprocesamiento linguistico para tareas downstream: lematizacion, POS y parsing de dependencias como paso previo a sistemas de resumen, traduccion o clasificacion que requieran estructura gramatical.
- Deteccion de correferencia en documentos largos: resolucion de menciones para consolidar entidades a lo largo de un texto antes de la extraccion de hechos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Part-of-speech tagging | UD English EWT (test) | UPOS accuracy | 0,982 |
| Dependency parsing | UD English EWT (test) | LAS | 0,929 |
| Named entity recognition | OntoNotes 5.0 (test) | span F1 | 0,870 |
| Semantic role labeling | PropBank EWT (test) | end-to-end argument F1 | 0,810 |
| Coreference resolution | LitBank (test) | CoNLL F1 | 0,697 |
| Document-level relation extraction | Re-DocRED (test) | F1 (entidades gold) | 0,733 |
| Document-level relation extraction | Re-DocRED (test) | F1 (end-to-end) | 0,627 |
| Zero-shot relation classification | FewRel (15 no vistas, train+validation) | macro F1, m=5 | 0,731 |
| Zero-shot NER | CrossNER (test) | span F1, media de 4 dominios | 0,533 |

No se han publicado en la informacion disponible resultados de benchmarks comparativos con otros modelos de la misma categoria.

## Requisitos de hardware

- VRAM estimada para inferencia: con 538M parametros, en fp32 el modelo ronda los 2,2 GB de pesos; en fp16 aproximadamente 1,1 GB; en int8 aproximadamente 0,6 GB. A ello hay que sumar el consumo de activaciones y del runtime ONNX, por lo que una estimacion practica es de 2 a 3 GB en fp16 y de 1 a 2 GB en int8.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; A100, H100 o RTX 4090 ofrecen margen amplio y buen throughput en lote. Para int8, GPUs consumer como RTX 3060 o superiores son suficientes.
- Cabe en GPU consumer: si, en modelos como RTX 3060, RTX 4060, RTX 4070 y superiores, especialmente con cuantizacion int8.
- Despliegue: onnxruntime (CPU o GPU) es la via oficial; el repositorio incluye los grafos ONNX, el tokenizador y el paquete kniv_v7. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientadas a modelos generativos y no a este encoder.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kniv-v7-xlarge-d-en (este) | 538M | 512 subpalabras | Encoder multi-tarea con extraccion zero-shot | Apache-2.0 | ONNX en Hugging Face |
| kniv-v7-xlarge-u-en | 485M | no disponible | Hermano con diseno compartido; mejor para relaciones enciclopedicas | Apache-2.0 | ONNX en Hugging Face |
| kniv-v7-large-en | 221M | no disponible | Estudiante destilado sobre ModernBERT-base | Apache-2.0 | ONNX en Hugging Face |
| microsoft/deberta-v3-large | 435M (aprox.) | 512 subpalabras | Encoder base sin cabezales multi-tarea | MIT | safetensors en Hugging Face |

La model card indica que kniv-v7-xlarge-d-en ofrece mejor parsing, NER, roles semanticos y relaciones enciclopedicas que kniv-v7-xlarge-u-en, mientras que este ultimo se recomienda para otros escenarios descritos en GUIDE.md. No se dispone de datos de rendimiento comparativos con DeBERTa-v3-large en las mismas tareas.

## Limitaciones y advertencias

- Solo soporta ingles; el uso con otros idiomas queda fuera del alcance declarado.
- Ventana limitada a 512 subpalabras, lo que obliga a procesar documentos largos por ventanas y puede perder contexto entre ellas.
- Riesgo de alucinacion en la extraccion de hechos: los resultados no deben usarse sin revision en decisiones medicas, legales, financieras o de empleo sobre personas.
- No debe usarse para perfilado de individuos sin consentimiento.
- Los benchmarks son declarados por el autor y no estan verificados de forma independiente (campo verified: false).
- El rendimiento zero-shot en NER (CrossNER, F1 0,533) y en correferencia (CoNLL F1 0,697) es moderado, por lo que conviene validar en el dominio propio antes de produccion.
- El repositorio ocupa 17,1 GB, lo que implica requisitos de almacenamiento y descarga considerables.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base DeBERTa-v3-large y de los datos de entrenamiento no detallados.
- No es un modelo generativo: no soporta tool calling ni razonamiento multi-paso por si mismo; su valor esta en la extraccion estructurada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dragonscale-ai/kniv-v7-deberta-v3-large-en
- Modelo hermano kniv-v7-xlarge-u-en: https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-u-en
- Modelo tiny: https://huggingface.co/dragonscale-ai/kniv-v7-tiny-en
- Modelo small: https://huggingface.co/dragonscale-ai/kniv-v7-small-en
- Modelo medium: https://huggingface.co/dragonscale-ai/kniv-v7-medium-en
- Modelo large: https://huggingface.co/dragonscale-ai/kniv-v7-large-en
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
- Guia de la familia (GUIDE.md): incluida en el repositorio del modelo en Hugging Face
- Organizacion del autor: https://huggingface.co/dragonscale-ai
