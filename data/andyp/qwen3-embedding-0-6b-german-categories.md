# andyP/qwen3-embedding-0.6b-german-categories

## Resumen

andyP/qwen3-embedding-0.6b-german-categories es un ajuste fino (fine-tune) de Qwen/Qwen3-Embedding-0.6B, un modelo denso de embeddings de 595.776.512 parametros (0,6B) construido en formato sentence-transformers. Lo desarrolla el usuario andyP y resuelve una tarea muy concreta: asignar el proposito estatutario ("Zweck", "but" o "scopo") de una empresa suiza a una o varias categorias de negocio, usando una taxonomia fija de 100 categorias descritas en aleman. El modelo se usa como retriever contrastivo: se embebe el proposito como consulta y cada descripcion de categoria como documento, y se ordenan las categorias por similitud coseno.

La relevancia practica viene del salto de rendimiento reportado sobre el modelo base. En un conjunto de validacion de 3.000 propositos nunca vistos, la precision top-1 sube del 38,9% al 66,3%, la top-3 del 59,8% al 86,7%, la top-5 del 67,3% al 91,3% y el NDCG@10 del 0,573 al 0,818. Ademas, funciona de forma cruzada entre idiomas: acepta propositos en aleman, frances e italiano y los empareja contra descripciones de categoria exclusivamente en aleman, sin necesidad de traducir la taxonomia.

Se distribuye bajo licencia Apache 2.0, con pesos en safetensors, un tamano de repositorio de 1,2 GB y compatibilidad con text-embeddings-inference y con endpoints de Hugging Face. El contexto, la dimension de embedding y las cuantizaciones no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de embeddings (derivado de Qwen3-Embedding-0.6B); no se detalla mas en la informacion disponible |
| Parametros totales | 595.776.512 (0,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repo pesa 1,2 GB, compatible con BF16/FP16. No se documentan variantes GGUF, INT8 ni INT4 |
| Idiomas soportados | de, fr, it (metadatos del modelo); el modelo base Qwen3-Embedding-0.6B es multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-Embedding-0.6B, un transformer denso de la familia Qwen3 disenado para tareas de embedding y ranking. El fine-tune conserva esa arquitectura y se reentrena como retriever contrastivo: cada par (proposito, descripcion de categoria) acerca el embedding del proposito al de su categoria y lo aleja del resto. La funcion de perdida es MultipleNegativesRankingLoss, con un muestreador de lotes que nunca repite la misma categoria dentro de un batch, de modo que cada negativo in-batch corresponde a una categoria genuinamente distinta. Ademas se mino un negativo duro por par: antes del entrenamiento, el modelo base ordeno todas las categorias para cada proposito y se tomo como negativo duro la categoria mejor rankeada que no fuera una etiqueta valida, descartandola si puntuaba dentro del 5% de la categoria correcta (relative_margin=0,05).

Los datos proceden de propositos estatutarios de empresas suizas emparejados con las 100 categorias de negocio asignadas en el registro. Los propositos identicos se fusionaron tomando la union de sus categorias y se excluyeron las etiquetas predichas por un modelo anterior, usando solo asignaciones existentes como verdad de referencia. El conjunto se dividio por proposito: 122.315 propositos de entrenamiento y 3.000 de evaluacion reservada. Se limito a 3.000 pares por categoria y epoca para mitigar el desequilibrio (la categoria mayor tiene unos 26.000 propositos), lo que da 63.320 tripletes de entrenamiento. La composicion linguistica aproximada es 74% aleman, 20% frances y 6% italiano, y solo el 0,7% de los propositos tiene mas de una categoria. Las descripciones de categoria siguen el patron "<Nombre de categoria>. <Descripcion de una frase>. Beispiele: <ejemplo 1>, <ejemplo 2>, ..." y la taxonomia concreta no se distribuye con el modelo.

## Capacidades

- Recuperacion semantica (retrieval) de categorias de negocio a partir de propositos estatutarios de empresas suizas.
- Clasificacion multietiqueta de facto: aunque el 99,3% de los propositos tiene una sola categoria, el ranking permite devolver top-k y manejar casos con varias etiquetas.
- Emparejamiento interlinguistico: acepta consultas en aleman, frances e italiano contra descripciones de categoria en aleman sin traduccion previa.
- Similitud de frases y similitud coseno sobre embeddings normalizados, integrable en pipelines de ranking.
- Extraccion de caracteristicas (feature-extraction) y uso como text-classification segun los tags del repositorio.
- No dispone de capacidades generativas, de tool calling, de agentes ni de vision: es un modelo de embeddings orientado exclusivamente a representacion y recuperacion de texto.
- Requiere un prompt de consulta especifico para los propositos (almacenado en la config del modelo, accesible con prompt_name="query"); las descripciones de categoria se codifican sin prompt.

## Casos de uso

- Clasificacion automatica de empresas en el registro mercantil: dado el texto del Zweck de una empresa suiza, el modelo devuelve las categorias de negocio mas probables, reduciendo la revision manual en registros con cientos de miles de entradas.
- Enriquecimiento de bases de datos B2B y CRM: asignacion de sectores a fichas de clientes y prospectos a partir de texto libre multilingue, sin necesidad de que el equipo comercial etiquete manualmente.
- Cumplimiento normativo y KYC en Suiza: clasificacion de contrapartes por actividad declarada para screening de riesgo y segmentacion regulatoria, aprovechando el soporte de aleman, frances e italiano del registro oficial.
- Enrutamiento de leads en banca y seguros: asignacion de consultas entrantes al equipo o producto adecuado segun el sector declarado por la empresa, con ranking top-3 (86,7% de acierto) para ofrecer alternativas cuando la primera prediccion no es concluyente.
- Busqueda semantica de proveedores y homologacion: indexar descripciones de categoria y recuperar proveedores cuyo proposito encaje en una categoria solicitada por compras.
- Normalizacion de taxonomias internas: mapear categorias propias de una organizacion a un esquema comun o a la taxonomia suiza de 100 categorias, siempre que las descripciones sigan el patron de entrenamiento.
- Analisis de carteras y estudios de mercado: agregacion estadistica de empresas por sector a partir de texto estatutario, para segmentacion y analisis de concentracion sectorial.

## Benchmarks y rendimiento

Evaluacion sobre 3.000 propositos reservados, nunca vistos en entrenamiento, rankeados contra las 100 categorias:

| Metrica | Modelo base | Este modelo |
|---|---|---|
| Accuracy@1 | 0,389 | 0,663 |
| Accuracy@3 | 0,598 | 0,867 |
| Accuracy@5 | 0,673 | 0,913 |
| NDCG@10 | 0,573 | 0,818 |
| MRR@10 | no disponible | 0,773 |

Desglose por idioma del texto del proposito (las descripciones de categoria son solo en aleman):

| Idioma | Propositos de evaluacion | acc@1 base | acc@1 fine-tune | acc@3 base | acc@3 fine-tune |
|---|---|---|---|---|---|
| Aleman | 2.256 | 0,410 | 0,642 | 0,613 | 0,857 |
| Frances | 555 | 0,332 | 0,733 | 0,566 | 0,905 |
| Italiano | 189 | 0,370 | 0,688 | 0,566 | 0,878 |

Nota del autor: la deteccion de idioma se hizo con una heuristica simple de palabras funcionales, por lo que el desglose es aproximado. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, algo esperable en un modelo de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: alrededor de 1,3-1,5 GB para los pesos (595,8 M de parametros x 2 bytes) mas overhead de activaciones; en la practica cabe en 2-3 GB.
- VRAM estimada en INT8: en torno a 0,7 GB de pesos, con overhead adicional.
- VRAM estimada en INT4: en torno a 0,4 GB de pesos, con perdida de precision no cuantificada en la informacion disponible.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4090, e incluso en GPUs con 4-6 GB. Tambien puede ejecutarse en CPU para lotes pequenos.
- GPU de centro de datos (A100, H100, L40S) solo necesarias para alto throughput con lotes grandes o indexacion masiva.
- Opciones de despliegue: sentence-transformers (libreria declarada), text-embeddings-inference (tag text-embeddings-inference), endpoints compatibles de Hugging Face y Microsoft Foundry; vLLM, ONNX o llama.cpp no se documentan para este fine-tune.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| andyP/qwen3-embedding-0.6b-german-categories | 595,8 M | no disponible | Clasificacion de propositos de empresas suizas en 100 categorias (acc@1 0,663, acc@3 0,867) | apache-2.0 | Hugging Face |
| Qwen/Qwen3-Embedding-0.6B (base) | 595,8 M (mismo backbone) | no disponible | Embeddings y ranking generales multilingues (acc@1 0,389, acc@3 0,598 en esta tarea) | apache-2.0 | Hugging Face, Azure AI Foundry |
| Modelos de embeddings multilingues genericos (multilingual-e5, bge-m3, etc.) | variable | no disponible | Embeddings y recuperacion generales | variable | Hugging Face |

La comparacion directa solo es posible contra el modelo base, ya que es el unico para el que la informacion proporcionada incluye resultados sobre la misma tarea. Frente a modelos de embeddings genericos, este fine-tune esta especializado en una taxonomia concreta y no se han publicado datos comparativos con ellos.

## Limitaciones y advertencias

- La taxonomia de 100 categorias usada en el entrenamiento no se distribuye con el modelo; hay que aportar descripciones propias y el rendimiento baja en taxonomias muy distintas.
- El rendimiento depende del formato de las descripciones de categoria (nombre, descripcion corta y ejemplos separados por comas). Desviarse de ese patron reduce las puntuaciones.
- Es imprescindible aplicar el prompt de consulta a los propositos; codificarlos sin prompt degrada los resultados. El prompt esta en la config del modelo.
- Fuerte desequilibrio de clases en los datos originales: la categoria mayor tiene unos 26.000 propositos. Aunque se limito a 3.000 pares por categoria y epoca, las categorias minoritarias siguen estando peor representadas.
- Solo el 0,7% de los propositos tiene mas de una categoria, por lo que el comportamiento en escenarios multietiqueta esta poco validado.
- Los propositos y las asignaciones de categoria pueden contener sesgos del registro mercantil suizo y de las practicas de etiquetado de la fuente; no se documenta ningun analisis de sesgo.
- Riesgo de alucinacion de categoria: al ser un retriever, siempre devuelve un ranking aunque ningun candidato sea correcto; conviene aplicar un umbral de similitud o un fallback.
- Optimizado para propositos estatutarios de empresas suizas; su uso fuera de ese dominio (otros paises, otros tipos de texto) no esta validado.
- La deteccion de idioma del conjunto de evaluacion es aproximada, por lo que las metricas por idioma deben tomarse como orientativas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3-Embedding-0.6B tiene su propia licencia, que conviene revisar.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andyP/qwen3-embedding-0.6b-german-categories
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Paper de Qwen3-Embedding referenciado en los tags: https://arxiv.org/abs/2506.05176
- Repositorio GitHub de Qwen3-Embedding: https://github.com/QwenLM/Qwen3-Embedding
- Coleccion Qwen3-Embedding en Hugging Face: https://huggingface.co/collections/Qwen/qwen3-embedding
- Ficha en Microsoft Foundry: https://ai.azure.com/catalog/models/qwen--qwen3-embedding-0.6b
