# hmzprover/hpsearch-embed-fast

## Resumen

hpsearch-embed-fast es un modelo de embeddings especializado en recuperación de premisas para demostración automática en Lean 4. Lo desarrolla hmzprover como componente del sistema [hpsearch](https://github.com/humanfia/hpsearch), y resuelve un problema concreto: dado un estado de prueba de Lean 4 (o una expresión Lean), devolver los lemas de Mathlib más útiles para avanzar en la demostración. No es un modelo generativo, sino la cara de consulta ("query side") del modo `fast` de hpsearch.

Técnicamente es un recorte de Qwen3-Embedding-0.6B: conserva las primeras 8 capas del transformer original y aplica una proyección lineal a 2.560 dimensiones. Con 281.157.632 parámetros en pesos safetensors, el modelo está entrenado para que cada consulta caiga cerca de los vectores del modelo mayor `hmzprover/hpsearch-embed-4b-v2`, que es quien produce los embeddings de los documentos (los lemas de Mathlib). Es decir, se usa en pareja con ese modelo de 4B y hereda su espacio vectorial.

Su relevancia práctica es la latencia: alrededor de 3 ms por consulta en una A100 con CUDA-graph replay, lo que permite integrar la selección de premisas en bucles de búsqueda de demostración donde cada milisegundo cuenta. La licencia Apache 2.0 y el formato sentence-transformers facilitan su despliegue en pipelines de recuperación existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) truncado a 8 capas + proyección lineal a 2.560 dimensiones |
| Parametros totales | 281.157.632 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería sentence-transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-Embedding-0.6B, del que conserva las 8 primeras capas, y añade una proyección lineal que lleva la representación a 2.560 dimensiones, alineándola con el espacio de embeddings de `hmzprover/hpsearch-embed-4b-v2`. Los documentos (lemas de Mathlib) no se recodifican con este modelo: se mantienen los vectores del modelo de 4B, y la relación entre ambos se declara mediante el campo `pairs_with` de la model card. La recuperación se hace con un softmax completo sobre los vectores de documento congelados.

El entrenamiento usa exclusivamente particiones públicas de entrenamiento: LeanDojo Benchmark 4 (v10) `random/train`, emparejando cada estado de táctica rastreado con las premisas que utiliza, y LeanStateSearch (`ruc-ai4math/mathlib_handler_benchmark_410`) `random/train` con el mismo criterio. Para parte de los estados se añade una descripción en inglés de una a tres frases del siguiente paso, generada por un LLM a partir del estado y la táctica, siguiendo el esquema de estados de prueba "aumentados" de Lean Finder. Además del softmax contrastivo, se aplica destilación por divergencia KL sobre los documentos desde la cara de consulta de hpsearch-embed-4b-v2 para expresiones Lean. El conjunto final retenido es de 147.412 estados (89.719 de LeanDojo y 57.693 de LeanStateSearch) y 89.298 premisas, tras una descontaminación estricta que elimina estados y premisas presentes en cualquier evaluación (MathlibQR/MPR, Lean Finder, LeanStateSearch, TBPS, TheoremSearch, MIRB, LeanDojo y las propias de hpsearch), incluidas las premisas de oro del softmax.

## Capacidades

- Generación de embeddings de consulta para estados de prueba de Lean 4, con el prompt `Instruct: Given a Lean 4 proof state, retrieve Mathlib lemmas that help prove its goal\nQuery: ` y el objetivo en primer lugar.
- Embeddings de objetivos aislados (goal alone) dentro del mismo espacio de recuperación.
- Embeddings de expresiones Lean (conclusión de un enunciado o tipo Pi) con el prompt `Instruct: Given Lean 4 code, retrieve the Mathlib declaration it states or names\nQuery: `.
- Recuperación de premisas de Mathlib mediante similitud coseno contra los vectores de documento de hpsearch-embed-4b-v2.
- Búsqueda de declaraciones a partir de código Lean (statement search).
- Integración con sentence-transformers y con Text Embeddings Inference (etiqueta `text-embeddings-inference` y `endpoints_compatible`).
- No soporta tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un modelo de embeddings.

## Casos de uso

- Selección de premisas en demostradores automáticos: en cada paso de un bucle de prueba, el modelo codifica el estado actual en unos 3 ms y recupera los lemas candidatos de Mathlib, que se pasan a un modelo generador o a un táctico para intentar cerrar el objetivo. Es el caso de uso central del modelo.
- Búsqueda de lemas en asistentes interactivos: un plugin de editor (por ejemplo, en VS Code con Lean 4) puede enviar el estado de prueba bajo el cursor y mostrar los lemas más relevantes sin bloquear la interfaz, gracias a la baja latencia.
- Prefiltrado en pipelines de recuperación en dos etapas: usar hpsearch-embed-fast para reducir el corpus de Mathlib a unos cientos de candidatos y aplicar después un reranker o el modelo de 4B sobre ese subconjunto, reduciendo el coste computacional total.
- Búsqueda de declaraciones desde código Lean: dado el enunciado de un teorema, recuperar la declaración de Mathlib que lo enuncia o lo nombra, útil para tareas de alineamiento entre código y documentación.
- Construcción de datasets de entrenamiento para demostradores: generar pares (estado, premisa) candidatos a gran escala para su posterior filtrado y verificación, aprovechando el throughput del modelo.
- Indexación y exploración de Mathlib: construir herramientas de navegación semántica sobre la biblioteca de matemáticas formales, permitiendo buscar por intención matemática en lugar de por nombre de lema.
- Evaluación de sistemas de prueba: servir como recuperador de referencia rápido en experimentos comparativos de selección de premisas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta un dato de latencia: aproximadamente 3 ms por consulta en una A100 con CUDA-graph replay.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 281 millones de parámetros en safetensors (1,1 GB de repositorio), la inferencia en fp16 requiere del orden de 0,6 GB de pesos, más overhead de activaciones y del índice de documentos.
- GPU recomendadas: la model card cita la A100 como referencia de latencia (3 ms por consulta con CUDA-graph replay). Por tamaño, el modelo cabe holgadamente en cualquier GPU con al menos 2-4 GB de VRAM libre.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y superiores, aunque no hay cifras publicadas de latencia para estas.
- Opciones de despliegue: sentence-transformers, Text Embeddings Inference (TGI) y endpoints compatibles según las etiquetas del repositorio. No se documentan opciones GGUF ni llama.cpp.
- Latencia y throughput: 3 ms por consulta en A100 con CUDA-graph replay; no hay datos de throughput ni de latencia en otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hpsearch-embed-fast | 281 M | no disponible | Recuperación de premisas Lean 4 (lado consulta) | Apache 2.0 | HuggingFace |
| hmzprover/hpsearch-embed-4b-v2 | ~4 B (según nombre) | no disponible | Recuperación de premisas Lean 4 (lado documento y consulta) | no disponible | HuggingFace |
| Qwen/Qwen3-Embedding-0.6B | 0,6 B | no disponible | Embeddings generalistas multilingües | no disponible | HuggingFace |

La comparación con hpsearch-embed-4b-v2 es la más directa porque ambos comparten espacio vectorial: el modelo de 4B es más pesado pero sirve tanto para consultas como para documentos, mientras que hpsearch-embed-fast solo codifica consultas y depende de los vectores del 4B para los documentos. Frente a Qwen3-Embedding-0.6B, del que deriva, hpsearch-embed-fast está especializado en Lean 4 y Mathlib y es más ligero (8 capas frente al modelo completo), a costa de perder generalidad. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Solo codifica consultas: no puede generar embeddings de documentos por sí mismo; requiere los vectores de hpsearch-embed-4b-v2 para el corpus de Mathlib.
- Especialización estrecha: está entrenado exclusivamente para estados de prueba y expresiones Lean 4; su comportamiento fuera de ese dominio no está documentado y probablemente sea deficiente.
- Dependencia de los prompts: el formato de instrucción (`Instruct: ...\nQuery: `) forma parte del entrenamiento; usarlo con otro formato puede degradar la recuperación.
- Riesgo de sesgo de corpus: al entrenarse solo con LeanDojo y LeanStateSearch, la cobertura de Mathlib puede estar sesgada hacia las áreas y estilos de esos conjuntos.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí puede recuperar premisas irrelevantes o incorrectas para el objetivo, lo que exige verificación posterior.
- Idiomas soportados no documentados; las descripciones aumentadas de los estados están en inglés.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los datos de entrenamiento subyacentes (LeanDojo, LeanStateSearch, Mathlib) para usos derivados.
- Sin datos publicados de benchmarks ni de contexto máximo: no es posible estimar su calidad de recuperación sin evaluarlo en el propio pipeline.
- Modelo con muy poca adopción (23 descargas, 0 likes) y creado en 2026 según los metadatos: no hay validación externa de su comportamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hmzprover/hpsearch-embed-fast
- Modelo de documentos asociado: https://huggingface.co/hmzprover/hpsearch-embed-4b-v2
- Repositorio hpsearch: https://github.com/humanfia/hpsearch
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- LeanDojo Benchmark 4: no disponible en la información proporcionada
- LeanStateSearch (`ruc-ai4math/mathlib_handler_benchmark_410`): no disponible en la información proporcionada
