# iamtatsuki05/Qwen2.5-Bi-EN-0.5B

## Resumen

Qwen2.5-Bi-EN-0.5B es un modelo de embeddings de frases en ingles construido a partir de Qwen/Qwen2.5-0.5B mediante una adaptacion de tipo LLM2Vec que convierte el decoder original en un encoder bidireccional. Lo desarrolla el usuario iamtatsuki05 dentro de la coleccion MIREI, y su proposito es producir representaciones densas de frases y documentos para tareas de recuperacion de informacion, similitud semantica y busqueda vectorial. Frente a un decoder causal, la atencion bidireccional permite que cada token vea el contexto completo, lo que mejora la calidad de las representaciones agregadas.

El modelo cuenta con 494.032.768 parametros totales (aproximadamente 0,5B sin contar embeddings) y una dimension de embedding de 896. Soporta una longitud maxima de secuencia de 32.768 tokens, lo que lo hace util para indexar documentos largos o conversaciones extensas sin truncamiento agresivo. El tokenizador es el de Qwen2.5, con un vocabulario de 151.936 entradas.

Es relevante ahora porque los modelos de embeddings pequenos y especializados permiten desplegar pipelines de RAG (retrieval-augmented generation) en hardware modesto, con latencia baja y coste reducido, manteniendo una ventana de contexto muy amplia para su tamano. Su licencia MIT facilita la integracion comercial sin las restricciones habituales de otros modelos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5 adaptada a encoder bidireccional (estilo LLM2Vec) |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (el repo distribuye pesos en safetensors; se asume compatibilidad con cuantizacion estandar de transformers, pero no se documenta) |
| Idiomas soportados | ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 896 |
| Vocabulario | 151.936 tokens (tokenizador Qwen2.5) |
| Codificacion posicional | RoPE |
| Metrica de similitud | coseno |
| Modelo base | Qwen/Qwen2.5-0.5B |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con atencion causal y RoPE. La adaptacion de tipo LLM2Vec transforma ese decoder en un encoder bidireccional: se habilita la atencion bidireccional para que cada token atienda a todo el contexto, y se anaden mecanismos de pooling para obtener una representacion unica de la secuencia. La model card expone metodos separados `encode_query` y `encode_document`, lo que indica un entrenamiento asimetrico tipico de los modelos de recuperacion (queries y documentos se proyectan de forma diferenciada).

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifican los objetivos de entrenamiento concretos (contrastivo, multiple negatives ranking, etc.) mas alla de la referencia al enfoque LLM2Vec. La model card cita una publicacion en NLP2026 sobre analisis comparativo de embeddings de frases con arquitecturas encoder/decoder bajo condiciones identicas, que constituye la base metodologica del modelo. Se requiere `trust_remote_code=True` y `flash-attn>=2.7.3` para la implementacion de atencion.

## Capacidades

- Generacion de embeddings de frases y documentos en ingles con dimension 896.
- Recuperacion de informacion (retrieval) mediante similitud coseno entre queries y documentos.
- Busqueda semantica y sentence-similarity.
- Feature extraction con atencion bidireccional sobre secuencias de hasta 32.768 tokens.
- Codificacion asimetrica: metodos distintos para queries y para documentos.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.
- Soporte multilingue limitado al ingles.
- No se documenta soporte de tool calling, agentes ni modos de razonamiento (no aplica a un modelo de embeddings).

## Casos de uso

- RAG sobre documentacion tecnica: indexar manuales y fragmentos largos de hasta 32.768 tokens con `encode_document` y recuperar los pasajes relevantes con `encode_query`, reduciendo la necesidad de chunking agresivo.
- Busqueda semantica en bases de conocimiento internas: generar embeddings de todos los documentos y almacenarlos en una base vectorial para consultas por similitud coseno en tiempo real.
- Deduplicacion y clustering de textos: comparar pares de documentos mediante similitud coseno para detectar contenido duplicado o agrupar documentos tematicamente.
- Filtrado de candidatos en pipelines de moderacion o clasificacion: usar la similitud frente a prototipos para prefiltrar contenido antes de un modelo generativo mayor.
- Reordenacion (reranking) ligera en motores de busqueda: al ser un modelo de 0,5B, puede puntuar pares query-documento con baja latencia en CPU o GPU modesta.
- Evaluacion de similitud semantica en investigacion NLP: banco de pruebas para comparar arquitecturas encoder frente a decoder en tareas de embeddings, alineado con la publicacion citada.
- Cache semantico de respuestas: almacenar embeddings de preguntas previas y reutilizar respuestas ante consultas con alta similitud coseno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1 GB para los pesos (494M parametros x 2 bytes), mas overhead de activaciones y cache de atencion; en la practica, entre 1,5 y 3 GB segun longitud de secuencia.
- En cuantizacion de 8 bits: en torno a 0,5 GB de pesos; en 4 bits, alrededor de 0,25 GB (no documentado oficialmente, estimacion a partir del numero de parametros).
- GPU recomendadas: cualquier GPU consumer moderna sirve; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema. Cabe en GPU de gama baja e incluso en iGPU con suficiente memoria compartida.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM para secuencias largas; para contextos de 32.768 tokens conviene vigilar el consumo de memoria de la cache de atencion.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), text-embeddings-inference (el repo incluye el tag `text-embeddings-inference` y `endpoints_compatible`), y potencialmente vLLM u otros servidores compatibles con modelos de embeddings. No se documenta soporte GGUF ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos por lote pequeno en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Tipo |
|---|---|---|---|---|---|
| Qwen2.5-Bi-EN-0.5B | 494M | 32.768 | Ingles | MIT | Encoder bidireccional (LLM2Vec) |
| Qwen3-Embedding-0.6B | no disponible en la informacion | no disponible | Multilingue (segun su model card) | no disponible en la informacion | Embedding |
| BGE-small-en-v1.5 | no disponible en la informacion | no disponible | Ingles | MIT (segun su model card) | Encoder BERT |
| E5-small-v2 | no disponible en la informacion | no disponible | Ingles | MIT (segun su model card) | Encoder BERT |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada; la tabla recoge solo caracteristicas estructurales conocidas y deja como "no disponible" los campos no verificados.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en otros idiomas no esta garantizado ni documentado.
- Es un modelo de embeddings, no generativo: no puede producir texto ni mantener conversaciones.
- Riesgo de sesgos heredados del corpus de entrenamiento de Qwen2.5-0.5B, no evaluado en la model card.
- No se documentan evaluaciones de robustez frente a alucinacion en recuperacion (falsos positivos en similitud).
- El uso de `trust_remote_code=True` implica ejecutar codigo del autor; conviene auditar el repositorio antes de desplegarlo en produccion.
- Requiere `flash-attn>=2.7.3` para la implementacion de atencion recomendada; sin ella, el rendimiento y el consumo de memoria pueden degradarse.
- El modelo tiene muy pocas descargas y likes en el momento de la ficha, por lo que la validacion comunitaria es practicamente nula.
- Aunque la licencia es MIT, conviene verificar las condiciones heredadas del modelo base Qwen2.5-0.5B (licencia Apache 2.0 en su origen) antes de un uso comercial a gran escala.
- No hay garantias de mantenimiento ni soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Qwen2.5-Bi-EN-0.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Coleccion MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Licencia MIT: https://opensource.org/license/mit/
- Paper citado (NLP2026, actas de la 32ª conferencia anual de la Asociacion de Procesamiento del Lenguaje de Japon): no disponible como enlace directo en la informacion proporcionada.
