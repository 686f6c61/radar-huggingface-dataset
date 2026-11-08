# ProtikD1810/hades-embed-v1

## Resumen

HADES-Embed-700M-v1 es un modelo de embeddings de texto desarrollado por Protik Das (usuario ProtikD1810 en Hugging Face) y publicado bajo licencia Apache 2.0. Se presenta como un encoder transformer bidireccional denso entrenado estrictamente desde cero, sin partir de pesos de un LLM preexistente, con 702.791.680 parámetros y una ventana de contexto nativa de 8.192 tokens. Su propósito es generar representaciones vectoriales densas para tareas de similitud semántica y recuperación de información (retrieval), con especial énfasis declarado en código técnico, esquemas SQL y cadenas de razonamiento matemático.

El modelo incorpora Matryoshka Representation Learning (MRL), lo que permite truncar los embeddings de 1024 dimensiones a 768, 512 o 256 reduciendo el espacio en base de datos vectorial hasta un 75 % según el autor. Se distribuye en formato nativo safetensors y en GGUF (F16 y Q8_0), lo que facilita su despliegue tanto en PyTorch/Transformers como en llama.cpp, Ollama, LM Studio o vLLM.

Es relevante ahora porque se publica como una alternativa de código abierto y entrenamiento propio ("sovereign AI") frente a los encoders de embeddings derivados de modelos ya existentes, y porque su integración con el sistema de eval-results de Hugging Face permite auditar sus métricas declaradas. No obstante, el repositorio tiene cero descargas y cero likes en el momento de la consulta, y las métricas no están verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HADES Sovereign Dense Bidirectional Transformer Encoder (bidireccional, entrenado desde cero) |
| Parametros totales | 702.791.680 (702,79 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (RoPE nativo con theta = 1.000.000,0) |
| Tipos de cuantizacion | GGUF F16 y GGUF Q8_0; safetensors en precision nativa |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (F16, Q8_0) |

Datos arquitectonicos adicionales declarados por el autor: 36 capas transformer, hidden size de 1024, 16 cabezas de atencion con Grouped-Query Attention y 4 KV heads, FFN intermedio de 4096 con activacion SwiGLU (ratio de expansion 4,0x) y vocabulario BPE de 151.665 tokens. La dimension base del embedding es 1024, truncable a 768, 512 y 256 mediante MRL. El checkpoint publicado corresponde al step 15.000 del entrenamiento.

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer denso y bidireccional, disenado de forma original y entrenado desde inicializacion aleatoria (step 0), sin herencia de pesos de ningun LLM previo. Emplea 36 capas con hidden size de 1024, atencion con Grouped-Query Attention (16 cabezas de consulta, 4 KV heads) para reducir el coste de cache KV en inferencia, y FFN con SwiGLU y factor de expansion 4,0x. Las posiciones se codifican con RoPE y una base theta de 1.000.000,0, lo que sostiene la ventana de 8.192 tokens. El vocabulario BPE cubre 151.665 tokens.

El autor indica que el checkpoint del step 15.000 se guardo tras un "alineamiento contrastivo" sobre un curriculo de tripletes con hard negatives, es decir, entrenamiento contrastivo con ejemplos negativos dificiles, el esquema habitual en modelos de embeddings tipo sentence-transformers. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO (en un modelo de embeddings no serian el mecanismo habitual). Tampoco se detalla el uso de tecnicas como decodificacion especulativa o atencion lineal. La innovacion tecnica destacada es la incorporacion de Matryoshka Representation Learning, que permite truncar el vector a 768, 512 o 256 dimensiones con, segun el autor, perdida metrica nula o muy baja.

## Capacidades

- Generacion de embeddings de texto densos para similitud semantica y recuperacion de informacion (feature-extraction).
- Recuperacion de informacion general (information retrieval) sobre corpus documentales.
- Recuperacion de codigo (code retrieval) sobre repositorios y bases de codigo.
- Recuperacion y verificacion de afirmaciones cientificas (scientific claim verification).
- Recuperacion de contraargumentos (counter-argument retrieval).
- Soporte de Matryoshka Representation Learning: embeddings truncables a 768, 512 y 256 dimensiones para reducir memoria y latencia en bases de datos vectoriales.
- Ventana de contexto de 8.192 tokens, adecuada para documentos largos y chunks extensos.
- Compatibilidad con text-embeddings-inference y endpoints de Hugging Face, segun los tags del repositorio.
- No se declaran capacidades de generacion de texto, razonamiento generativo, tool calling, function calling, agentes, vision ni audio; es un modelo exclusivamente de embeddings.

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar manuales, RFCs y guias en una base vectorial usando los embeddings de 1024 dimensiones (o 512/256 con MRL) y recuperar los fragmentos mas relevantes para una consulta en lenguaje natural; el contexto de 8.192 tokens permite indexar secciones completas sin trocear en exceso.
- Recuperacion de codigo en asistentes de desarrollo: generar embeddings de funciones, clases y ficheros para que un IDE o un chatbot interno localice implementaciones similares o ejemplos de uso dentro de un monorepositorio, apoyandose en la capacidad declarada de code retrieval.
- RAG sobre bases de datos empresariales: vectorizar descripciones de tablas, columnas y consultas SQL para que un asistente traduzca preguntas de negocio a consultas SQL recuperando primero el esquema relevante.
- Deduplicacion y clustering de tickets de soporte: calcular similitudes entre incidencias para agrupar casos equivalentes y enrutarlos al equipo adecuado, reduciendo coste operativo en mesas de ayuda.
- Verificacion de afirmaciones en literatura cientifica: comparar afirmaciones de articulos con pasajes de un corpus de referencia para tareas de fact-checking cientifico, usando la metrica de recuperacion declarada sobre SciFact como indicador de idoneidad.
- Moderacion y analisis de debates: recuperar contraargumentos relevantes en foros o plataformas de deliberacion usando la capacidad de counter-argument retrieval.
- Filtrado previo en pipelines de datos de entrenamiento: calcular embeddings de grandes volumenes de texto para eliminar duplicados y contenido de baja calidad antes de alimentar un LLM, aprovechando la reduccion de dimensiones a 256 para abaratar el proceso.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card. Ninguno de ellos esta verificado de forma independiente (`verified: false`).

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| MTEB Overall | MTEB Overall Leaderboard | MTEB Average Score | 61,20 |
| Information Retrieval | MTEB MS MARCO | MRR@10 | 78,54 |
| Code Retrieval | MTEB CodeSearchNet | NDCG@10 | 81,42 |
| Scientific Claim Verification | MTEB SciFact | NDCG@10 | 67,40 |
| Counter-Argument Retrieval | MTEB ArguAna | MAP@10 | 28,73 |

El autor publica ademas una jerarquia MRL con metricas internas de recuperacion (no pertenecientes a MTEB): a 1024 dimensiones, Recall@10 de 19,72 % y MRR@10 de 0,1208; a 768 dimensiones, Recall@10 de 20,00 % y MRR@10 de 0,1221; a 512 dimensiones, Recall@10 de 20,56 % y MRR@10 de 0,1235; a 256 dimensiones, Recall@10 de 20,56 % y MRR@10 de 0,1119. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en precision nativa (safetensors, pesos de ~2,8 GB en FP32 o ~1,4 GB en FP16): aproximadamente 2-3 GB incluyendo activaciones y cache KV para lotes pequenos.
- VRAM estimada en GGUF Q8_0: en torno a 1 GB de pesos, con margen adicional para el contexto de 8.192 tokens.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060 de 12 GB o superior, RTX 4090, A100 o H100 permiten lotes grandes y alto throughput. El modelo cabe holgadamente en GPUs consumer de 8 GB o incluso menos en cuantizacion Q8_0.
- Tambien es viable en CPU mediante llama.cpp u Ollama, dado el tamano contenido y la cuantizacion GGUF disponible.
- Opciones de despliegue: Transformers y sentence-transformers (safetensors), llama.cpp, Ollama, LM Studio, vLLM y text-embeddings-inference (segun los tags del repositorio).
- Latencia y throughput: el autor menciona "latencias de inferencia sub-milisegundo", pero no se aportan mediciones detalladas de hardware, tamano de lote ni longitud de secuencia, por lo que no se puede confirmar esa cifra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension base | Licencia | MTEB declarado |
|---|---|---|---|---|---|
| HADES-Embed-700M-v1 | 702,79 M | 8.192 | 1024 (MRL 256-1024) | Apache 2.0 | 61,20 (no verificado) |
| Modelos de embeddings de la familia Qwen2 de ~0,6B | ~600 M | no disponible en esta ficha | no disponible en esta ficha | Apache 2.0 en la mayoria de variantes | no disponible en esta ficha |
| Encoders BERT de ~110-340 M (p. ej. MiniLM, mpnet) | 110-340 M | 512 tipicamente | 384-768 | Apache 2.0 / MIT segun variante | no disponible en esta ficha |

La comparacion cuantitativa con alternativas concretas no esta disponible en la informacion proporcionada: no se han facilitado resultados de MTEB de otros modelos para contrastar, y las cifras del propio HADES no estan verificadas de forma independiente. La ventaja estructural declarada frente a encoders BERT clasicos es la ventana de 8.192 tokens frente a los 512 habituales y el soporte MRL; la desventaja potencial es el mayor coste de inferencia por el tamano de 700 M frente a encoders de 100-300 M.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles: el unico idioma declarado es `en`, por lo que su rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Metricas no verificadas: todos los resultados de MTEB del model-index tienen `verified: false` y proceden del propio autor; no hay evaluacion independiente.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que limita la evidencia de uso en produccion y la validacion por la comunidad.
- Riesgo de sobreajuste a las tareas declaradas: el entrenamiento se describe como un curriculo de tripletes con hard negatives, pero no se detalla la composicion del dataset ni el numero de tokens, lo que dificulta evaluar la cobertura y los sesgos de los datos.
- No es un modelo generativo: no puede usarse para generar texto, razonar de forma explicita, hacer tool calling ni actuar como agente; solo produce embeddings.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de recuperacion erronea (falsos positivos en similitud) en dominios fuera de los evaluados.
- La afirmacion de "latencias sub-milisegundo" no viene acompanada de mediciones reproducibles de hardware ni de tamano de lote.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero conviene revisar las condiciones de los datos de entrenamiento, que no se detallan.
- El checkpoint publicado es el step 15.000 de un entrenamiento en curso, no necesariamente el modelo final; el autor lo presenta como hito intermedio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ProtikD1810/hades-embed-v1
- Perfil del autor: https://huggingface.co/ProtikD1810
- Dataset de entrenamiento asociado (hades-m0-350m-training): https://huggingface.co/datasets/ProtikD1810/hades-m0-350m-training
- Leaderboard MTEB referenciado: https://huggingface.co/spaces/mteb/leaderboard
- Documentacion de eval-results de Hugging Face: https://huggingface.co/docs/hub/eval-results
