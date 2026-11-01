# hmzprover/hpsearch-embed-fast-v2

## Resumen

hpsearch-embed-fast-v2 es un modelo de embeddings de texto especializado en la recuperación de premisas de Mathlib para demostraciones en Lean 4. Lo desarrolla el usuario hmzprover y se construye a partir de Qwen/Qwen3-Embedding-0.6B, del que reutiliza las primeras capas más una proyección lineal hasta 2.560 dimensiones. Su función es actuar como el lado de consulta del modo `fast` de la herramienta hpsearch: convierte un estado de demostración, un objetivo o una expresión Lean en un vector que queda próximo a los vectores de documentos generados por el modelo mayor hmzprover/hpsearch-embed-4b-v2.

El modelo resuelve un problema concreto de eficiencia en la selección de premisas: en lugar de ejecutar un modelo de 4B para cada consulta, emplea una variante ligera de unos 281 millones de parámetros que, según el autor, tarda unos pocos milisegundos por consulta en una A100 con replay de grafos CUDA. Los documentos se siguen codificando con el modelo de 4B, de modo que el sistema combina un indexado de alta calidad con una consulta de baja latencia.

Es relevante para quienes construyen asistentes de demostración interactivos o pipelines de búsqueda de lemas, donde la latencia por consulta condiciona la experiencia de usuario. La licencia Apache 2.0 y el formato safetensors facilitan su integración en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-Embedding-0.6B truncado: primeras capas + proyección lineal a 2.560 dimensiones) |
| Parametros totales | 281.157.632 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre estados de demostración y expresiones Lean 4, con descripciones en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | 2.560 |
| Modelo base | Qwen/Qwen3-Embedding-0.6B |
| Libreria | sentence-transformers |
| Tarea (pipeline) | sentence-similarity |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

El modelo es un encoder derivado de Qwen3-Embedding-0.6B: conserva las primeras capas del transformer original y añade una proyección lineal que mapea la representación a un espacio de 2.560 dimensiones, alineado con el espacio de embeddings de hpsearch-embed-4b-v2. La inferencia se apoya en un softmax completo sobre los vectores de documentos congelados, es decir, el modelo de consulta se entrena contra un índice fijo producido por el modelo de 4B. Además se aplica destilación por divergencia KL sobre los documentos a partir del lado de consulta de hpsearch-embed-4b-v2 para expresiones Lean.

El entrenamiento usa únicamente las particiones públicas de entrenamiento: LeanDojo Benchmark 4 (v10) `random/train`, donde cada estado de táctica trazado se empareja con las premisas que utiliza, y LeanStateSearch (`ruc-ai4math/mathlib_handler_benchmark_410`) `random/train` con el mismo criterio. Para parte de los estados se añade una descripción en inglés de una a tres frases del siguiente paso, generada por un LLM a partir del estado y la táctica, siguiendo el enfoque de estados de demostración "augmented" de Lean Finder. El conjunto final retenido tras la descontaminación es de 243.040 estados, 566.274 pares (estado, premisa) y 112.529 premisas. La descontaminación elimina estados cuyo texto coincide con consultas de evaluación (MathlibQR/MPR, Lean Finder, LeanStateSearch, TBPS, TheoremSearch, MIRB, LeanDojo y las propias de hpsearch) o cuyos objetivos e hipótesis coinciden con los de una consulta de evaluación, así como pares en los que el objetivo del estado coincide con el objetivo de una consulta de evaluación y la premisa es su gold.

## Capacidades

- Generación de embeddings para similitud semántica entre consultas y documentos, con salida de 2.560 dimensiones.
- Codificación de estados de demostración Lean 4 con la plantilla `Instruct: Given a Lean 4 proof state, retrieve Mathlib lemmas that help prove its goal\nQuery: `, con el objetivo en primer lugar.
- Codificación de objetivos aislados como consulta de recuperación.
- Codificación de expresiones Lean (conclusión de un enunciado o tipo Pi) con la plantilla `Instruct: Given Lean 4 code, retrieve the Mathlib declaration it states or names\nQuery: `.
- Recuperación de premisas de Mathlib orientada a la selección de lemas para demostración automática.
- Alineación con el espacio de embeddings de hpsearch-embed-4b-v2, lo que permite mezclar consultas ligeras con un índice de documentos de mayor calidad.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento explícito: es un encoder de recuperación.

## Casos de uso

- Asistente de demostración interactivo en Lean 4: el modelo codifica el estado de prueba actual en milisegundos y devuelve los lemas de Mathlib más próximos, lo que permite sugerencias en tiempo real mientras el usuario escribe tácticas.
- Selección de premisas en pipelines de demostración automática: se integra como recuperador previo a un prover neuronal o a un motor de búsqueda tipo hammer, reduciendo el espacio de candidatos antes de la verificación.
- Indexación de bibliotecas matemáticas formales: combinado con hpsearch-embed-4b-v2 para los documentos, permite construir un índice de premisas de Mathlib y consultarlo con el modelo ligero, con un coste de consulta muy bajo.
- Búsqueda semántica de declaraciones a partir de una expresión Lean: dado el tipo o la conclusión de un enunciado, el modelo recupera la declaración de Mathlib que lo enuncia o lo nombra, útil en tareas de traducción entre notación informal y formal.
- Enriquecimiento de entornos de edición (LSP, plugins de VS Code): al tener latencia de pocos milisegundos en A100, puede ejecutarse como servicio de sugerencias dentro del editor sin bloquear la interfaz.
- Evaluación y análisis de retrievers matemáticos: sirve como línea base ligera en experimentos de selección de premisas sobre LeanDojo, LeanStateSearch o MathlibQR, comparando su calidad frente al modelo de 4B con un coste computacional mucho menor.
- Filtrado previo en sistemas de pregunta-respuesta sobre matemáticas formales: recupera lemas candidatos antes de que un modelo generativo redacte la demostración, lo que reduce el contexto necesario y las alucinaciones de nombres de lemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB de pesos (281 millones de parámetros), más overhead de activaciones y del índice de documentos.
- VRAM estimada en fp16/bf16: en torno a 0,6 GB de pesos, aunque el autor no documenta cuantizaciones específicas.
- GPU recomendadas: el autor reporta latencias de pocos milisegundos por consulta en una A100 con replay de grafos CUDA; por tamaño, cabe holgadamente en GPU de consumo como RTX 3060, RTX 4060, RTX 4070 o RTX 4090.
- Despliegue: la model card indica compatibilidad con Text Embeddings Inference (`text-embeddings-inference`, `endpoints_compatible`) y con la librería sentence-transformers; no se documentan otras opciones como llama.cpp u Ollama.
- Latencia y throughput: el autor afirma "unos pocos ms por consulta en una A100 con CUDA-graph replay"; no se publican cifras de throughput ni de latencia en otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de embedding | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| hmzprover/hpsearch-embed-fast-v2 | 281 M | 2.560 | no disponible | Apache 2.0 | Lado de consulta ligero, alineado con hpsearch-embed-4b-v2 |
| hmzprover/hpsearch-embed-4b-v2 | no disponible (modelo de 4B según el nombre) | no disponible | no disponible | no disponible | Modelo de referencia para documentos y consultas de mayor calidad |
| Qwen/Qwen3-Embedding-0.6B | 0,6 B (aproximado) | no disponible | no disponible | no disponible | Modelo base generalista de embeddings, sin especialización en Lean |
| Lean Finder (mencionado en la model card) | no disponible | no disponible | no disponible | no disponible | Referencia en estados de demostración "augmented"; sin datos comparativos en la información disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un encoder de recuperación, no un modelo generativo: no produce texto, demostraciones ni código.
- El espacio de embeddings está acoplado a hpsearch-embed-4b-v2; usar otro modelo para los documentos rompe la alineación y degrada la recuperación.
- El entrenamiento se limita a Lean 4 y Mathlib; no hay evidencia de funcionamiento en otros asistentes de demostración ni en dominios matemáticos ajenos a Mathlib.
- Los idiomas soportados no están documentados; las descripciones auxiliares de los estados están en inglés.
- Riesgo de sesgo hacia la distribución de LeanDojo Benchmark 4 y LeanStateSearch, que puede no cubrir áreas poco representadas de Mathlib.
- Aunque se aplicó descontaminación frente a conjuntos de evaluación, persiste el riesgo de solapamiento residual entre las premisas de entrenamiento y los golds de evaluación, ya que las premisas gold se mantienen en entrenamiento con otros estados.
- No se documentan cuantizaciones ni comportamiento en precisión reducida; conviene validar la calidad en bf16/fp16 antes de producción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-Embedding-0.6B debe verificarse por separado en cuanto a sus propios términos.
- El repositorio tiene 24 descargas y 0 likes en el momento de la consulta: es un modelo reciente y poco validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hmzprover/hpsearch-embed-fast-v2
- Modelo de documentos asociado: https://huggingface.co/hmzprover/hpsearch-embed-4b-v2
- Repositorio hpsearch: https://github.com/humanfia/hpsearch
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
