# ItsnotAilabs/MESIE-768

## Resumen

MESIE-768 (Multi-Environment Sovereign Intelligence Engine) es un modelo de embeddings de frases desarrollado por MedinaMemorySystems (publicado en HuggingFace bajo la organizacion ItsnotAilabs) y afinado a partir de BAAI/bge-base-en-v1.5. Se trata de un encoder BERT-base de 109 millones de parametros, 12 capas, 12 cabezas de atencion y dimension oculta de 768, que produce vectores de 768 dimensiones mediante CLS pooling mas una proyeccion lineal. No genera texto: su funcion es transformar frases y documentos en representaciones vectoriales para busqueda semantica, clasificacion y enrutado.

El modelo esta especializado en un nicho muy concreto: la clasificacion y el enrutado semantico de documentos de "carrera profesional" y protocolos dentro del denominado Sovereign Knowledge Studio, con soporte declarado para mas de 50 tipos de protocolo y clasificacion por dominios (negocio, ingenieria, ciberseguridad y arquitectura). El autor lo presenta como herramienta para el enrutado de protocolos, la puntuacion de impacto de identidad y el analisis de correlaciones phi-weight.

Su relevancia practica es limitada y muy acotada: se trata de un modelo con 0 descargas y 0 likes en el momento del analisis, con un unico resultado de benchmark declarado (MTEB Retrieval, media 63.2, marcado como no verificado), entrenado sobre un corpus propietario no publico. Resulta util como caso de estudio de fine-tuning contrastivo sobre bge-base, pero su uso en produccion generalista exige validacion previa, dado que el propio autor advierte de una generalizacion pobre fuera de su dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (transformer encoder denso, 12 capas, 12 cabezas de atencion, hidden 768) |
| Parametros totales | 109 millones |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (max sequence length) |
| Tipos de cuantizacion | FP32, FP16, INT8 (ONNX), Q4_K_M (GGUF) |
| Idiomas soportados | Ingles unicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (checkpoint de sentence-transformers / transformers), ONNX e GGUF; el autor no especifica de forma explicita si los pesos PyTorch se distribuyen en safetensors |
| Dimension del embedding | 768 |
| Estrategia de pooling | CLS pooling mas proyeccion lineal |
| Tarea (pipeline) | sentence-similarity / feature-extraction |
| Modelo base | BAAI/bge-base-en-v1.5 |
| Framework declarado | PyTorch / ONNX |
| Hardware de referencia del autor | 1x NVIDIA T4 |
| ID en HuggingFace | ItsnotAilabs/MESIE-768 |
| Fecha de creacion en HuggingFace | 21 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de un transformer encoder tipo BERT-base sin modificaciones estructurales: 12 capas, 12 cabezas de atencion, hidden dimension de 768 y un maximo de 512 tokens de secuencia. La cabeza de representacion utiliza CLS pooling seguido de una proyeccion lineal que da lugar al vector final de 768 dimensiones. El modelo se distribuye con la libreria sentence-transformers y tambien es cargable directamente con transformers, aplicando pooling manual sobre el token CLS y normalizacion L2.

El entrenamiento consistio en un fine-tuning con objetivo de aprendizaje contrastivo (contrastive learning) con mineria de negativos duros (hard negative mining) sobre 1024 pares de documentos, partiendo de BAAI/bge-base-en-v1.5. El corpus de entrenamiento es propietario e incluye un "corpus soberano de carreras", especificaciones de protocolos y definiciones de carrera MESIE. No se documenta el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO. Al ser un modelo de embeddings, la alineacion conversacional no forma parte del pipeline de entrenamiento (el propio autor indica que el modelo no ha sido alineado con RLHF para seguridad conversacional).

Como convencion de uso, el autor recomienda anteponer el prefijo `Represent this sentence for searching relevant passages: ` unicamente a las consultas, no a los documentos indexados, siguiendo la practica habitual de la familia BGE. No se declaran innovaciones tecnicas adicionales como atencion lineal, decodificacion especulativa ni arquitecturas hibridas.

## Capacidades

- Generacion de embeddings de frases y documentos con vectores de 768 dimensiones, normalizados, aptos para similitud coseno.
- Busqueda semantica y recuperacion de pasajes (retrieval) sobre corpus documentales en ingles.
- Similitud semantica entre pares de frases (pipeline sentence-similarity).
- Clasificacion de dominios declarada: negocio, ingenieria, ciberseguridad y arquitectura.
- Enrutado semantico de protocolos, con soporte declarado para mas de 50 tipos de protocolo.
- Puntuacion de "impacto de identidad" y analisis de correlaciones phi-weight, segun la documentacion del autor.
- Feature extraction para uso como encoder en pipelines posteriores.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso (no es un modelo generativo).
- Capacidades multilingues: no disponibles; entrenado exclusivamente en ingles.

## Casos de uso

- Enrutado de documentos de protocolo: el modelo clasifica y dirige documentos hacia el protocolo correcto entre mas de 50 categorias declaradas, aprovechando su fine-tuning especifico en definiciones de protocolo. El autor reporta un 91.7 % de exactitud en su benchmark interno Protocol-Route.
- Busqueda semantica sobre bases de conocimiento internas en ingles: indexando pasajes de hasta 512 tokens y consultando con el prefijo recomendado, se obtienen rankings por similitud coseno compatibles con motores vectoriales habituales (FAISS, Qdrant, pgvector).
- Deduplicacion y agrupamiento de documentos: los embeddings permiten detectar documentos casi duplicados o agruparlos por tematica mediante clustering sobre los vectores de 768 dimensiones.
- Clasificacion por dominio en un pipeline de ingestao: combinando el embedding con un clasificador ligero (regresion logistica o SVM) se etiquetan documentos en negocio, ingenieria, ciberseguridad o arquitectura antes de almacenarlos.
- Filtrado de candidatos en sistemas de RR. HH. orientados a perfiles profesionales: el modelo fue ajustado sobre un corpus de "carreras", por lo que puede ordenar descripciones de puesto y perfiles por afinidad semantica dentro de ese dominio concreto.
- Recuperacion aumentada (RAG) sobre documentacion tecnica en ingles: como retriever de primera etapa, con embeddings de 768 dimensiones y baja huella de memoria (65 MB en Q4_K_M), desplegable incluso en CPU.
- Moderacion o filtrado semantico de contenido: si se dispone de un conjunto etiquetado propio, el modelo puede servir como encoder para un clasificador de similitud con ejemplos de referencia.
- Inferencia en el borde o en dispositivos con recursos limitados: con cuantizacion GGUF Q4_K_M y unos 65 MB de RAM, es viable ejecutarlo en entornos sin GPU para tareas de matching en tiempo real (latencia declarada de 2.8 ms por consulta).

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo:

| Benchmark | Metrica | Resultado |
|---|---|---|
| MTEB Retrieval | Media | 63.2 (marcado como no verificado en el model-index) |
| STS-B | Pearson / Spearman | 84.1 |
| Protocol-Route (interno, personalizado) | Accuracy | 91.7 % (estimado segun el propio autor) |
| Peak Throughput | Documentos por segundo | ~38.134 (hardware no especificado) |

No se han publicado en la informacion disponible resultados adicionales de MMLU, HumanEval, GSM8K ni otros benchmarks estandar, algo esperable al tratarse de un modelo de embeddings y no de un modelo generativo.

## Requisitos de hardware

- Huella de memoria declarada por el autor: ~440 MB en FP32, ~220 MB en FP16, ~110 MB en INT8 (ONNX) y ~65 MB en GGUF Q4_K_M.
- Latencia declarada por consulta: ~12,5 ms en FP32, ~7,2 ms en FP16, ~4,5 ms en INT8 y ~2,8 ms en GGUF Q4_K_M.
- GPU recomendadas: cabe holgadamente en cualquier GPU con 2 GB o mas de VRAM; el autor valida el modelo en una unica NVIDIA T4. Tambien es viable en RTX 3060, RTX 4090, A100 o H100, aunque en estos casos el modelo queda muy infrautilizado.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual e incluso en iGPU con suficiente memoria compartida compartida.
- Cabe en CPU: si, especialmente en cuantizacion INT8 o Q4_K_M, con latencias del orden de milisegundos por consulta.
- Opciones de despliegue: sentence-transformers (referencia), transformers con pooling manual, ONNX Runtime para INT8, llama.cpp / Ollama para GGUF, y servidores de embeddings como Text Embeddings Inference (TEI) o vLLM en modo embedding.
- Rendimiento agregado: el autor declara un pico de ~38.134 documentos por segundo, sin detallar hardware, lote ni precision, por lo que la cifra debe tomarse como orientativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Idiomas | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| MESIE-768 | 109 M | 512 tokens | 768 | Ingles | Apache-2.0 | MTEB Retrieval 63.2 (no verificado), STS-B 84.1 |
| BAAI/bge-base-en-v1.5 (modelo base) | 109 M | 512 tokens | 768 | Ingles | MIT | No disponible en la informacion proporcionada |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 tokens | 384 | Ingles | Apache-2.0 | No disponible en la informacion proporcionada |
| intfloat/e5-base-v2 | 109 M | 512 tokens | 768 | Ingles | MIT | No disponible en la informacion proporcionada |

Observaciones: MESIE-768 comparte arquitectura, tamano y dimension de embedding con su modelo base, por lo que su unica diferencia medible es el fine-tuning contrastivo sobre un corpus propietario. Al no haberse publicado resultados comparativos propios frente a estas alternativas, no es posible afirmar una mejora o degradacion objetiva sin una evaluacion propia sobre el caso de uso concreto.

## Limitaciones y advertencias

- Especificidad de dominio: el autor advierte explicitamente de que el modelo esta muy optimizado para definiciones de carrera y protocolos del Sovereign Knowledge Studio y puede no generalizar bien a dominios no relacionados.
- Sesgo de idioma: entrenado exclusivamente con datos en ingles; no se declara soporte para castellano ni para ningun otro idioma.
- Longitud de contexto: el rendimiento se degrada o se produce truncamiento mas alla de 512 tokens; no es adecuado para documentos largos sin troceado previo.
- Ausencia de alineacion de seguridad: el modelo no ha sido alineado con RLHF para seguridad conversacional, segun la propia model card.
- Benchmarks no verificados: el resultado de MTEB Retrieval aparece con `verified: false` en el model-index, y el autor reconoce que la metrica Protocol-Route (91,7 %) es una estimacion interna.
- Trazabilidad limitada: no se publica el corpus de entrenamiento, el numero de tokens ni la composicion del dataset, lo que impide reproducir el entrenamiento.
- Adopcion nula: 0 descargas y 0 likes en HuggingFace en el momento del analisis, sin comunidad ni soporte documentado.
- Inconsistencia de identificadores: el ID de HuggingFace es `ItsnotAilabs/MESIE-768`, mientras que los ejemplos de codigo de la model card apuntan a `MedinaMemorySystems/mesie-768`; hay que verificar cual de las dos rutas resuelve correctamente antes de integrarlo.
- Model card incompleta: la seccion de etica y limitaciones aparece truncada en el contenido disponible.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la atribucion correspondiente. Al derivar de BAAI/bge-base-en-v1.5 (MIT), conviene revisar tambien las condiciones del modelo base.
- No apto para generacion de texto, agentes, tool calling ni tareas multimodales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ItsnotAilabs/MESIE-768
- Modelo base BAAI/bge-base-en-v1.5: https://huggingface.co/BAAI/bge-base-en-v1.5
- Ruta alternativa indicada en la model card: https://huggingface.co/MedinaMemorySystems/mesie-768 (no verificada)
- Libreria sentence-transformers: https://www.sbert.net
- Paper de referencia del modelo base (BGE): https://arxiv.org/abs/2309.07597
- Los resultados de la busqueda web realizada no contienen ningun enlace relevante al modelo; los unicos dominios devueltos son sitios de contenido para adultos sin relacion con el objeto de esta ficha. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a MESIE-768.
