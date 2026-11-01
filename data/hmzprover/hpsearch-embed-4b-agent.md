# hmzprover/hpsearch-embed-4b-agent

## Resumen

hpsearch-embed-4b-agent es un modelo de embeddings de texto especializado en recuperación de teoremas y declaraciones de Lean 4 y Mathlib. Lo desarrolla el usuario hmzprover y deriva de hmzprover/hpsearch-embed-4b, que a su vez es un fine-tuning de Qwen3-Embedding-4B. El modelo se ha ajustado mediante LoRA sobre consultas reales generadas por agentes y posteriormente se han fusionado los pesos en el modelo base.

El problema que resuelve es concreto: en un sistema de demostración automática de teoremas, un agente formula búsquedas con palabras clave o nombres de lemas conjeturados, no con frases naturales bien construidas. Este embedder está entrenado para mapear esas consultas imperfectas al espacio de declaraciones de Mathlib, donde cada documento se representa como el enunciado Lean de una declaración seguido de su enunciado en lenguaje natural.

Con 4.021.774.336 parámetros, licencia Apache 2.0 y formato safetensors, se integra en el ecosistema sentence-transformers y es compatible con Text Embeddings Inference. Su relevancia radica en que cubre un nicho muy específico del razonamiento formal asistido por IA, donde los embeddings generalistas rinden peor por la brecha entre consultas de agente y documentación formal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-Embedding-4B, fine-tuning LoRA fusionado) |
| Parametros totales | 4.021.774.336 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo ocupa 8,1 GB) |
| Idiomas soportados | no disponible (entrenado sobre Lean 4 y Mathlib, con enunciados en lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-Embedding-4B, un transformer denso de 4.000 millones de parámetros orientado a embeddings, y se ajusta con LoRA sobre pares de consulta y documento específicos del dominio. Los pesos LoRA se fusionan posteriormente en el modelo base, de modo que la inferencia se realiza con la arquitectura original sin adaptadores adicionales.

Los datos de entrenamiento combinan dos fuentes. La primera son consultas de búsqueda reales de agentes procedentes del dataset hmzprover/query-chains: bolsas de palabras clave y nombres Lean conjeturados que un agente introdujo en una herramienta de búsqueda de teoremas, cada una emparejada con la declaración que finalmente encontró su cadena de búsqueda en hmzprover/proofs. Como negativos duros se emplean los resultados de búsqueda léxica que no corresponden a esa declaración. La segunda fuente son pares públicos replicados del conjunto de entrenamiento del modelo base. La formulación de consultas sigue las instrucciones de hpsearch con el prefijo `Instruct: ...\nQuery: `, mientras que los documentos se construyen concatenando el enunciado Lean de la declaración y su enunciado en lenguaje natural.

El autor aplica una descontaminación explícita: excluye todas las cadenas del benchmark de búsqueda de hmzprover, tanto positivas como negativas, y descarta cualquier par cuya consulta normalizada, o cuyo nombre o enunciado del objetivo, aparezca en alguno de los conjuntos de evaluación usados por hpsearch (MathlibQR / MathlibMPR, Lean Finder, LeanStateSearch, TheoremSearch, TBPS y hmzprover).

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación densa (pipeline sentence-similarity).
- Recuperación de declaraciones de Lean 4 y Mathlib a partir de consultas de agente con palabras clave o nombres de lemas conjeturados.
- Manejo de consultas formuladas con el esquema de instrucciones de hpsearch (`Instruct: ...\nQuery: `).
- Representación de documentos que combinan enunciado formal Lean y enunciado en lenguaje natural.
- Integración con sentence-transformers y con Text Embeddings Inference (endpoints compatibles).
- No se documentan capacidades de generación de texto, tool calling, agentes, visión, audio ni modo de razonamiento: es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda de teoremas en asistentes de demostración: un agente que conjetura el nombre o las palabras clave de un lema puede consultar este embedder para recuperar la declaración de Mathlib más probable y continuar la demostración.
- Construcción de pipelines de demostración automática: integrar el modelo como recuperador en un sistema tipo RAG sobre Mathlib, alimentando al modelo generador con las declaraciones candidatas antes de intentar la prueba.
- Indexación semántica de librerías formales: generar embeddings de cada declaración (enunciado Lean más enunciado natural) para habilitar búsqueda por similitud sobre corpus de miles de lemas.
- Herramientas de exploración para matemáticos: interfaz donde el usuario escribe términos sueltos o nombres aproximados y obtiene declaraciones relacionadas, sin necesidad de recordar la sintaxis exacta de Lean.
- Evaluación y depuración de agentes de búsqueda: usar el modelo como recuperador de referencia para medir si las cadenas de consulta de un agente llegan a la declaración correcta.
- Deduplicación y agrupación de declaraciones: calcular similitudes entre enunciados para detectar lemas equivalentes o casi equivalentes en distintas partes de una librería formal.
- Despliegue en servicios de inferencia: servirlo con Text Embeddings Inference detrás de un endpoint compatible para atender consultas de baja latencia en un entorno de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): en torno a 16 GB solo para pesos, más overhead de activaciones y tokenizador.
- VRAM estimada en fp16/bf16: aproximadamente 8 GB para pesos.
- VRAM estimada en cuantización de 8 bits: alrededor de 4 GB; en 4 bits, en torno a 2-2,5 GB (estimaciones teóricas a partir del número de parámetros; el autor no publica cuantizaciones).
- GPU recomendadas: A100 o H100 para lotes grandes y máximo throughput; RTX 4090 o A6000 para fp16 con lotes moderados.
- Cabe en GPU de consumo: sí, en fp16 en tarjetas con 12-16 GB de VRAM o más (RTX 4080, 4090, 3090); en cuantización de 8 bits podría caber en 8 GB.
- Opciones de despliegue: sentence-transformers, Text Embeddings Inference (el repo declara compatibilidad con endpoints), y en general cualquier runtime que cargue safetensors de HuggingFace.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hpsearch-embed-4b-agent | 4.021.774.336 | no disponible | Lean 4 / Mathlib (consultas de agente) | Apache 2.0 | HuggingFace |
| hmzprover/hpsearch-embed-4b (modelo base) | no disponible | no disponible | Lean 4 / Mathlib (consultas generales) | no disponible | HuggingFace |
| Qwen3-Embedding-4B (ancestro) | ~4.000 millones | no disponible | Propósito general, multilingüe | no disponible | HuggingFace |

La comparación con alternativas de propósito general no está respaldada por datos de rendimiento publicados en la información disponible; la diferencia principal es la especialización en consultas de agente sobre Mathlib y el proceso de descontaminación frente a los conjuntos de evaluación de hpsearch.

## Limitaciones y advertencias

- Modelo de embeddings: no genera texto ni responde preguntas; solo produce vectores de similitud.
- Entrenado específicamente para consultas de agente sobre Lean 4 y Mathlib; su rendimiento fuera de ese dominio no está documentado y probablemente sea inferior al de un embedder generalista.
- Requiere respetar el formato de instrucciones de hpsearch (`Instruct: ...\nQuery: `) para obtener los resultados esperados.
- La longitud de contexto no está publicada; consultas o documentos muy largos pueden truncarse según la configuración del tokenizador.
- Idiomas soportados no documentados; los enunciados en lenguaje natural de Mathlib son mayoritariamente en inglés.
- Riesgo de falsos positivos en recuperación: los negativos duros del entrenamiento son resultados léxicos, por lo que la separación semántica fina entre lemas similares puede ser imperfecta.
- No se han publicado benchmarks ni métricas de recuperación en la información disponible, lo que impide verificar la calidad frente a alternativas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets de entrenamiento deben verificarse por separado si se redistribuye.
- Modelo con muy pocas descargas (34) y sin likes en el momento de la consulta: ecosistema de validación externa prácticamente inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hmzprover/hpsearch-embed-4b-agent
- Modelo base: https://huggingface.co/hmzprover/hpsearch-embed-4b
- Repositorio hpsearch: https://github.com/humanfia/hpsearch
- Dataset de cadenas de consulta: https://huggingface.co/datasets/hmzprover/query-chains
- Dataset de demostraciones: https://huggingface.co/datasets/hmzprover/proofs
