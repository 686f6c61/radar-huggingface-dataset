# DylanCouzon/constella-nano

## Resumen

constella-nano es un codificador de consultas (query encoder) en ingles para busqueda semantica, desarrollado por DylanCouzon como parte de la familia Constella, construida sobre el espacio de embeddings de los modelos Stella de Qdrant. El modelo transforma consultas de texto en vectores normalizados de 1024 dimensiones que son directamente comparables con los documentos indexados por `Qdrant/stella-en-400M-v5-doc-onnx`, lo que permite busqueda asimetrica sin reindexar la coleccion de documentos.

Tecnicamente es un modelo BERT pequeno de 34.540.672 parametros que parte de `BAAI/bge-small-en-v1.5` y anade una proyeccion lineal aprendida que combina caracteristicas de las capas 12, 8 y 4 para mapear al espacio de 1024 dimensiones de Stella. Se distribuye en formato ONNX para FastEmbed y esta pensado como alternativa ligera al codificador de consultas de Stella (400M de parametros), manteniendo una calidad de recuperacion superior a constella-zero y a BM25 en los seis conjuntos de datos reportados.

Su relevancia actual radica en el coste de inferencia: al ser un modelo de 34M de parametros, el coste de codificar consultas es minimo comparado con el codificador de consultas de Stella, lo que lo hace atractivo para sistemas de recuperacion de baja latencia. Es una research preview: el soporte nativo en FastEmbed requiere una rama de previsualizacion y la evaluacion publicada se limita a los seis datasets descritos en la model card, con el benchmark BEIR completo aun en curso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (backbone bge-small) con tres capas aprovechadas (12, 8, 4) y proyeccion lineal |
| Parametros totales | 34.540.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (truncado por la derecha) |
| Tipos de cuantizacion | no disponible (se distribuye grafo ONNX con salida fp32) |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | ONNX (libreria FastEmbed) |
| Dimension de salida | 1024 (vector normalizado fp32) |
| Prefijo de consulta | Ninguno |
| Modelo de documentos asociado | `Qdrant/stella-en-400M-v5-doc-onnx` |
| Modelo base | `BAAI/bge-small-en-v1.5` |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

constella-nano es un transformer tipo BERT que reutiliza el backbone de `BAAI/bge-small-en-v1.5`. En lugar de usar solo la representacion de la ultima capa, toma caracteristicas de las capas 12, 8 y 4 y las combina mediante una proyeccion lineal aprendida que las mapea al espacio de 1024 dimensiones de los documentos de Stella. El modelo se entreno contra embeddings de consulta congelados de `NovaSearch/stella_en_400M_v5`, es decir, destilando el comportamiento del codificador de consultas de Stella sobre un backbone mucho mas pequeno.

El modelo no emplea prefijo de consulta. Las entradas se truncan por la derecha a 512 tokens y se aplica padding dinamico al maximo de cada lote. El grafo ONNX devuelve embeddings de token en fp32; FastEmbed se encarga del pooling (media con mascara de atencion) y de la normalizacion L2. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO; esos datos figuran como no disponibles. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal, que no aplican a un encoder de retrieval.

## Capacidades

- Extraccion de caracteristicas (feature-extraction) para retrieval semantico: genera un vector de 1024 dimensiones por consulta.
- Busqueda asimetrica dual-encoder: las consultas se codifican con constella-nano y los documentos con `Qdrant/stella-en-400M-v5-doc-onnx`.
- Compatibilidad de indice con constella-zero: ambos codificadores de consulta pueden buscar sobre la misma coleccion sin reindexar.
- Normalizacion L2 integrada en el pipeline de FastEmbed, apta para similitud coseno.
- Soporte en FastEmbed (requiere rama de previsualizacion y `fastembed>=0.9.0`).
- Integracion con Qdrant y con cualquier base de datos vectorial que soporte similitud coseno.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento: es exclusivamente un encoder de consultas en ingles.

## Casos de uso

- Busqueda semantica de baja latencia en produccion: al codificar consultas con un modelo de 34M de parametros en lugar de uno de 400M, el coste por consulta se reduce drasticamente, lo que permite desplegar retrieval en CPU con latencias de milisegundos.
- Sustitucion en caliente del codificador de consultas: si ya se dispone de un indice construido con `stella-en-400M-v5-doc-onnx`, se puede cambiar de constella-zero a constella-nano modificando solo el nombre del modelo de consulta, sin re-encodear documentos ni reconstruir la coleccion.
- Recuperacion en dominios cientificos y biomedicos: los resultados en SciFact (nDCG@10 de 0,721) y TREC-COVID (0,787) lo hacen adecuado para busqueda sobre literatura cientifica y articulos medicos.
- Asistente de documentacion tecnica: indexar manuales y guias con el modelo de documentos de Stella y consultar con constella-nano para responder preguntas en ingles sobre el corpus.
- RAG en aplicaciones con presupuesto de computo limitado: usar el encoder pequeno para la fase de recuperacion y reservar el presupuesto de GPU para el modelo generador.
- Busqueda en bases de conocimiento internas: desplegar Qdrant en memoria o en un servicio pequeno y usar constella-nano para consultas en ingles sobre FAQs, tickets o wikis corporativas.
- Evaluacion y prototipado rapido de pipelines de retrieval: la carga del modelo y la primera consulta son rapidas, lo que facilita iterar sobre esquemas de indexacion y metricas antes de pasar a modelos mayores.

## Benchmarks y rendimiento

Resultados de recuperacion reportados en la model card (nDCG@10 con busqueda exacta). ArguAna y FiQA estan marcados porque el modelo profesor Stella declara contacto de entrenamiento o evaluacion con esos datasets.

| Sistema | NFCorpus | SCIDOCS | SciFact | TREC-COVID | ArguAna* | FiQA* |
|---|---:|---:|---:|---:|---:|---:|
| constella-nano | 0,363080 | 0,217710 | 0,721097 | 0,787116 | 0,623296 | 0,477765 |
| constella-zero | 0,3124 | 0,1677 | 0,6101 | 0,5490 | 0,5916 | 0,3728 |
| BM25 | 0,3180 | 0,1565 | 0,6791 | 0,6099 | 0,4878 | 0,2532 |
| Codificador de consultas Stella | 0,4134 | 0,2395 | 0,7796 | 0,8234 | 0,6369 | 0,5536 |

Segun la model card, constella-nano supero el test predefinido de superioridad frente a `bge-small-en-v1.5` tanto en los cuatro datasets sin contacto declarado con Stella como en los seis, con diferencias medias de nDCG@10 de +0,017648 y +0,027449 respectivamente. Tambien supero a LEAF asym en los seis datasets con una diferencia media de +0,016181.

Coste de codificacion de consultas (solo el encoder, lote de 1, cuatro hilos de CPU, cinco calentamientos, veinte consultas sinteticas de 20 palabras en tres procesos nuevos; no incluye busqueda vectorial ni latencia extremo a extremo):

| Modelo | Tiempo de carga | Primera consulta | p50 en caliente | RSS maximo | Assets medidos |
|---|---:|---:|---:|---:|---:|
| constella-zero | 0,2618 s | 0,3529 ms | 0,1119 ms | 275,4 MiB | 90,1 MiB |
| bge-small | 0,6726 s | 8,2401 ms | 6,8400 ms | 291 (dato truncado en la informacion disponible) | no disponible |

Los datos de latencia de constella-nano no aparecen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 34,5M de parametros en fp32 el modelo ocupa aproximadamente 0,14 GB de pesos, y el repositorio completo pesa 0,1 GB.
- Inferencia en CPU: las mediciones de la model card usan cuatro hilos de CPU, lo que confirma que el modelo esta pensado para ejecucion en CPU sin GPU.
- GPU recomendadas: no disponibles; por tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es sobradamente suficiente, aunque no se han publicado mediciones en GPU.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU dedicada.
- Opciones de despliegue: FastEmbed (soporte nativo en rama de previsualizacion, `fastembed>=0.9.0`) y ONNX Runtime; integracion con Qdrant mediante `qdrant-client`.
- Latencia y throughput: no se han publicado mediciones especificas para constella-nano; para referencia, constella-zero reporta una consulta en caliente con p50 de 0,1119 ms en CPU y bge-small de 6,8400 ms en las mismas condiciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de salida | Licencia | Rol | nDCG@10 medio en los seis datasets |
|---|---:|---:|---:|---|---|---:|
| constella-nano | 34.540.672 | 512 tokens | 1024 | MIT | Codificador de consultas | Mejor que zero, BM25 y bge-small en los seis datasets reportados |
| constella-zero | no disponible | no disponible | 1024 | no disponible | Codificador de consultas | Inferior a nano en los seis datasets; mas rapido (p50 0,1119 ms) |
| Codificador de consultas Stella | 400M (modelo profesor) | no disponible | 1024 | no disponible | Codificador de consultas | Superior a nano en los seis datasets reportados |
| BM25 | no aplica | no aplica | no aplica | no aplica | Baseline lexico | Inferior a nano en los seis datasets |

constella-nano se posiciona como la opcion intermedia de la familia: mas preciso que constella-zero y BM25, y mucho mas pequeno que el codificador de consultas de Stella, a costa de una ligera perdida de calidad frente a este ultimo.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha evaluado su comportamiento en otros idiomas.
- Ventana de contexto limitada a 512 tokens, con truncado por la derecha, lo que puede perder informacion en consultas largas.
- Es una research preview: el soporte nativo en FastEmbed requiere una rama de previsualizacion y la evaluacion publicada se limita a seis datasets; el benchmark BEIR completo esta en curso.
- Los resultados en ArguAna y FiQA deben interpretarse con cautela porque el modelo profesor Stella declara contacto de entrenamiento o evaluacion con esos datasets.
- No debe usarse el modelo de documentos como codificador de consultas sin prompt; para consultas hay que usar constella-nano, constella-zero o la ruta con prompt de Stella.
- Riesgo de alucinacion no aplica directamente al ser un encoder, pero la calidad del retrieval depende de la distribucion del corpus y del dominio; no se han publicado evaluaciones fuera de los datasets reportados.
- No se documentan sesgos conocidos ni evaluaciones de robustez; al derivar de bge-small-en-v1.5 hereda las caracteristicas y posibles sesgos de ese backbone.
- Licencia MIT, que permite uso comercial, pero al ser una previsualizacion de investigacion conviene validar el comportamiento en el dominio propio antes de desplegarlo en produccion.
- Los datos de latencia y throughput especificos de constella-nano no estan publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DylanCouzon/constella-nano
- Modelo de documentos: https://huggingface.co/Qdrant/stella-en-400M-v5-doc-onnx
- Codificador de consultas alternativo: https://huggingface.co/Qdrant/constella-zero
- Modelo profesor: https://huggingface.co/NovaSearch/stella_en_400M_v5
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
