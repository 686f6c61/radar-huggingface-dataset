# anckursingh/aikoql

## Resumen

aikoql es un modelo de etiquetado de entidades (token classification) construido sobre DistilBERT-base-cased y afinado por el desarrollador anckursingh como componente del sistema de recuperacion de memoria AIKOQL. Su funcion no es la extraccion de entidades al uso (no distingue personas, organizaciones o lugares), sino marcar en cada pasaje de memoria que entidades se mencionan, de modo que una busqueda pueda encadenar dos recuerdos que comparten una entidad aunque las palabras de la consulta no los conecten directamente. Es, por tanto, una pieza de infraestructura de un pipeline RAG mas que un modelo de proposito general.

Tecnicamente es un transformer encoder de tipo DistilBERT con 65.193.219 parametros totales, ventana de contexto heredada del modelo base (512 tokens) y un esquema de etiquetas BIO de tres clases: outside, begin e inside para una unica clase generica de entidad. Se distribuye en safetensors bajo licencia Apache-2.0 y esta pensado para ejecutarse en CPU mediante el runtime en Rust (candle) del propio proyecto AIKOQL, con una latencia declarada de unos 22 ms por pasaje.

Su relevancia es limitada y muy acotada: no compite con modelos NER generales ni con LLM de gran tamano, sino que documenta un caso de mejora marginal medida sobre recuperacion (de 87,8 % a 93,0 % de acierto en top-10 sobre HotpotQA) a cambio de un coste de latencia en la busqueda (de 585 ms a 693 ms de mediana). Es util para quien evalue arquitecturas de memoria aumentada o quiera reproducir el componente de entidades de AIKOQL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT-base-cased, 6 capas) |
| Parametros totales | 65.193.219 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens (heredada de DistilBERT-base-cased); en la practica el pasaje se trocea en fragmentos de ~1.000 caracteres, maximo 24 fragmentos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (fine-tuning) de `distilbert-base-cased`, un encoder transformer destilado de BERT con 6 capas y 65 millones de parametros, sobre la cabeza de clasificacion de tokens. El esquema de etiquetas es deliberadamente minimalista: tres clases (outside, begin, inside) para una sola categoria de "cualquier entidad nombrada", sin tipologia semantica. Esto reduce el problema a detectar limites de menciones de entidad, no a clasificarlas.

El entrenamiento consistio en 3 epocas sobre listas de entidades generadas por un LLM profesor (DeepSeek) para 4.896 parrafos del conjunto de distractor de HotpotQA (texto de Wikipedia), correspondientes a las preguntas 0-499 de una mezcla con semilla de la particion de validacion. Las entidades que el profesor propuso pero que no aparecian literalmente en el texto se descartaron de las etiquetas, lo que ancla el aprendizaje a menciones superficiales. v0 se entrena unicamente con esa fuente. No se documenta uso de RLHF, DPO ni decodificacion especulativa; el unico mecanismo destacable es el troceado del pasaje en fragmentos de ~1.000 caracteres (hasta 24) para cubrir textos mas largos que la ventana del encoder.

## Capacidades

- Etiquetado de menciones de entidad genericas en texto en ingles con esquema BIO (outside, begin, inside).
- Deteccion de menciones literales de entidad en pasajes de estilo Wikipedia; las menciones no literales quedan fuera por diseno del etiquetado.
- Integracion con `memory_search` de AIKOQL: cada memoria se etiqueta al almacenarse y la busqueda puede saltar a una segunda memoria que comparte entidad con la primera.
- Ejecucion local en CPU mediante el runtime en Rust (candle) del proyecto AIKOQL, sin salida de texto a servicios externos.
- Procesamiento de pasajes largos mediante troceado interno en fragmentos de ~1.000 caracteres, hasta 24 fragmentos.
- No soporta tool calling, function calling, razonamiento multi-paso, generacion de texto, vision, audio ni modo thinking.
- Capacidad multilingue: no; solo ingles.

## Casos de uso

- Recuperacion aumentada con puente de entidades: en un sistema RAG, etiquetar cada fragmento con sus entidades permite que una consulta alcance documentos que comparten una entidad con el documento inicial aunque no compartan terminos con la pregunta. Es el caso de uso central y el unico medido por el autor.
- Memoria conversacional de agentes: almacenar recuerdos etiquetados por entidad para que un agente recupere hechos relacionados por persona, producto o lugar mencionado en turnos anteriores, incluso con formulaciones distintas.
- Enriquecimiento de indices de busqueda: generar metadatos de entidad por documento para construir indices secundarios o filtros previos a un reranker, aprovechando el bajo coste de 22 ms por pasaje en CPU.
- Preprocesado en pipelines de extraccion de conocimiento: usar las menciones detectadas como candidatos para un paso posterior de resolucion de entidades o vinculacion a una base de conocimiento, dado que el modelo solo delimita menciones y no las clasifica.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse en CPU y en local con candle, encaja en escenarios donde el texto no puede salir de la maquina (sanidad, legal, documentacion interna).
- Prototipado y evaluacion de arquitecturas de memoria: sirve como componente reproducible para comparar variantes de recuperacion (con y sin paso de entidades) sobre HotpotQA o LongMemEval-S, ya que el autor publica las tablas de resultados en el repositorio.

## Benchmarks y rendimiento

Los unicos datos publicados miden recuperacion, no precision de etiquetado (no se calculo CoNLL ni OntoNotes). Se evaluo sobre HotpotQA preguntas 500-999 (no vistas en entrenamiento), a traves de AIKOQL con un reranker cross-encoder, y sobre LongMemEval-S (120 preguntas).

| Metrica | Sin paso de entidades | Con paso de entidades |
|---|---|---|
| HotpotQA, ambos parrafos de apoyo en top-10 | 87,8 % | 93,0 % |
| HotpotQA, ambos parrafos de apoyo en top-5 | 72,2 % | 72,6 % |
| HotpotQA, ambos parrafos de apoyo en top-2 | 46,6 % | 46,6 % (sin cambio) |
| LongMemEval-S, toda la evidencia en top-5 | 93,3 % | 92,5 % (sin diferencia significativa) |
| Latencia mediana por busqueda | 585 ms | 693 ms |

No se han publicado resultados de benchmarks de etiquetado de entidades (F1, precision, recall) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (65 millones de parametros, ~260 MB de pesos); el repo ocupa 0,3 GB.
- GPU recomendadas: no requiere GPU; el autor lo ejecuta en CPU mediante candle. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) lo ejecutaria con holgura si se usa el backend de transformers.
- Cabe en cualquier GPU consumer e incluso en CPU de un portatil; es un modelo de borde.
- Opciones de despliegue: runtime propio de AIKOQL en Rust (candle) con el comando `aikoql model install anckursingh/aikoql`; tambien es cargable con transformers (pipeline `token-classification`) y exportable a otros formatos mediante herramientas estandar, aunque no se documentan GGUF ni despliegues en vLLM/TGI/Ollama.
- Latencia y throughput: ~22 ms por pasaje en CPU segun el autor; el coste agregado en la busqueda es de ~108 ms de mediana (585 ms a 693 ms).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aikoql (este modelo) | 65,2 M | 512 tokens | Etiquetado BIO de entidad generica para memoria RAG | Apache-2.0 | Hugging Face |
| distilbert-base-cased (base) | 65,2 M | 512 tokens | Encoder general; requiere cabeza de tarea | Apache-2.0 | Hugging Face |
| dslim/bert-base-NER | ~110 M | 512 tokens | NER con tipologia (PER, ORG, LOC, MISC) en ingles | MIT | Hugging Face |

La comparacion con alternativas NER generales no es directa: aikoql no clasifica tipos de entidad y no publica F1 sobre CoNLL u OntoNotes, por lo que no puede contrastarse en igualdad de condiciones con `dslim/bert-base-NER` ni con otros taggers estandar. Su ventaja es la integracion especifica con el pipeline de AIKOQL y su coste de ejecucion en CPU; su desventaja es la ausencia de metricas de etiquetado y su dependencia de un unico dataset de entrenamiento.

## Limitaciones y advertencias

- Solo ingles y predominantemente texto de estilo Wikipedia; el texto informal o con mucho codigo no se evaluo mas alla de la comprobacion con LongMemEval.
- Las etiquetas provienen de un LLM profesor (DeepSeek) sobre HotpotQA: puede omitir entidades raras y etiquetar frases genericas como entidades.
- No se calculo precision, recall ni F1 de etiquetado; la unica evidencia es la mejora en recuperacion sobre HotpotQA, que en top-5 y top-2 es marginal o nula.
- En LongMemEval-S el paso de entidades no aporto mejora significativa (92,5 % frente a 93,3 %), lo que sugiere que el beneficio depende del tipo de corpus.
- El troceado en fragmentos de ~1.000 caracteres (maximo 24) puede perder menciones en documentos muy largos.
- Riesgo de alucinacion no aplica en sentido generativo (no genera texto), pero si hay riesgo de falsos positivos y falsos negativos en las menciones.
- Sesgos: hereda los del corpus de Wikipedia y los del profesor LLM; no se documenta analisis de sesgo.
- Licencia Apache-2.0 declarada por el propietario del proyecto; los datos de entrenamiento derivan de HotpotQA (CC BY-SA 4.0) y el modelo base es Apache-2.0, por lo que conviene revisar la compatibilidad antes de un uso comercial.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anckursingh/aikoql
- Repositorio AIKOQL: https://github.com/anckursingh/aikoql
- Tablas de benchmarks (referenciadas en la model card): `benchmarks/results/rag-baselines/` dentro del repositorio AIKOQL
- Modelo base: https://huggingface.co/distilbert/distilbert-base-cased
- Dataset de evaluacion y entrenamiento: HotpotQA (https://hotpotqa.github.io/)
- Benchmark de memoria: LongMemEval-S (https://github.com/xiaowu0162/LongMemEval)
