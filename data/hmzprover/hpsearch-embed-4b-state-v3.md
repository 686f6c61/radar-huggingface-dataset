# hmzprover/hpsearch-embed-4b-state-v3

## Resumen

hpsearch-embed-4b-state-v3 es un modelo de embeddings de texto de 4.021.774.336 parámetros (unos 4B) desarrollado por el usuario de Hugging Face hmzprover. Es el codificador del lado de las consultas (query embedder) de los modos GPU del sistema [hpsearch](https://github.com/humanfia/hpsearch), un asistente de demostración automática para Lean 4. Su tarea específica es la selección de premisas: dado un estado de demostración (proof state) de Lean 4, opcionalmente acompañado de una descripción en inglés del siguiente paso, genera un vector que aterriza cerca de los vectores de las premisas que la siguiente táctica usaría.

El modelo se basa en Qwen3 (según los tags del repositorio) y es un fine-tuning LoRA (r=16, ya fusionado) sobre hmzprover/hpsearch-embed-4b-v2, que actúa como modelo base y también codifica los documentos (las premisas). Los documentos conservan los vectores del modelo base; solo el lado de consultas se entrena. La recuperación se realiza con softmax completo sobre todos los vectores de premisas. Está publicado bajo licencia Apache 2.0, con pesos en safetensors y compatibilidad con text-embeddings-inference.

Es relevante para la comunidad de demostración automática y aprendizaje automático sobre Lean 4/Mathlib, ya que aborda el problema de la selección de premisas (premise selection), un cuello de botella clásico en la búsqueda de demostraciones, con un enfoque de recuperación densa a gran escala entrenado exclusivamente con datos públicos y con un proceso de descontaminación cuidadoso frente a los benchmarks de evaluación habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de embeddings basado en Qwen3, con LoRA (r=16) fusionado para el lado de consultas |
| Parametros totales | 4.021.774.336 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en bf16/fp16 implícitos en safetensors, 8,1 GB de repo) |
| Idiomas soportados | no disponible (entrenado con estados de Lean 4 y descripciones en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un codificador de similitud de frases construido sobre Qwen3 de unos 4B de parámetros. La versión state-v3 es el codificador de consultas del sistema hpsearch: se entrena mediante LoRA con rango 16 sobre el modelo base hpsearch-embed-4b-v2, y los pesos LoRA se publican ya fusionados. Un detalle de diseño importante es la asimetría entre consultas y documentos: los documentos (premisas) se codifican con el modelo base sin modificar, mientras que solo el lado de consultas recibe el fine-tuning. Esto permite que el índice de premisas precalculado con el modelo base siga siendo válido, y que el modelo de consultas se entrene para acercar los estados de demostración a esos vectores existentes. La puntuación se calcula con softmax completo sobre el conjunto de todas las premisas, en lugar de por pares aislados.

Los datos de entrenamiento proceden exclusivamente de splits públicos de entrenamiento, usados íntegramente: LeanDojo Benchmark 4 (v10) en su split `random/train`, donde cada táctica trazada se empareja con las premisas que usa, y LeanStateSearch (`ruc-ai4math/mathlib_handler_benchmark_410`) en su split `random/train`, con el mismo emparejamiento. Para parte de los estados se añade una descripción en inglés de una a tres frases del siguiente paso (generada por un LLM a partir del estado y la táctica), siguiendo el formato de estados de demostración "aumentados" de Lean Finder. El dataset resultante contiene 243.040 estados, 566.274 pares (estado, premisa) y 112.529 premisas distintas.

El entrenamiento incluye un proceso de descontaminación riguroso: se elimina un estado de entrenamiento si su texto coincide con alguna consulta de evaluación (MathlibQR/MPR, Lean Finder, LeanStateSearch, TBPS, TheoremSearch, MIRB, LeanDojo o las propias de hpsearch), o si sus objetivos e hipótesis coinciden con los de una consulta de evaluación de estados; se elimina un par (estado, premisa) si el objetivo del estado coincide con el de una consulta y la premisa es la respuesta gold de esa consulta. Las premisas gold de las consultas de evaluación se mantienen en el entrenamiento asociadas a otros estados, siguiendo la práctica de los autores de los propios splits.

## Capacidades

- Generacion de embeddings densos para estados de demostración de Lean 4 (consultas) frente a premisas de Mathlib (documentos).
- Seleccion de premisas (premise selection): recuperación de las premisas relevantes para el siguiente paso de una demostración.
- Codificacion de consultas híbridas: acepta un estado de demostración solo o acompañado de una descripción en lenguaje natural (inglés) del siguiente paso previsto.
- Similitud semántica de frases (pipeline `sentence-similarity`) vía sentence-transformers.
- Compatibilidad con text-embeddings-inference y despliegue en Hugging Face Endpoints (endpoints_compatible).
- No genera texto: es un modelo de embeddings, no un modelo generativo. No hay soporte declarado de tool calling, visión ni audio.

## Casos de uso

- Seleccion de premisas en demostradores automaticos: dado un goal de Lean 4 en un entorno tipo hpsearch, el modelo recupera las lemas de Mathlib más probables para cerrar el paso, reduciendo el espacio de búsqueda del generador de tácticas.
- Recuperacion aumentada con lenguaje natural: un agente de demostración puede describir en inglés el siguiente paso ("aplicar la desigualdad de Cauchy-Schwarz") y el modelo combina esa descripción con el estado formal para mejorar la recuperación, como en Lean Finder.
- Construccion de indices de bibliotecas formales: las premisas se codifican una sola vez con el modelo base y se reutilizan para cualquier consulta, lo que lo hace adecuado para indexar Mathlib (más de 100.000 premisas según los datos de entrenamiento).
- Evaluacion y comparacion de sistemas de premise selection: puede usarse como componente reproducible en benchmarks como LeanDojo, MIRB o TBPS gracias a la descontaminación documentada.
- Investigacion en retrieval denso asimetrico: es un caso de estudio de fine-tuning LoRA solo en el lado de consultas sobre un índice congelado, útil para experimentos de actualización de consultores sin recodificar corpus.
- Busqueda semantica sobre estados de demostracion: integración en interfaces de exploración de Mathlib donde el usuario pega un goal y obtiene lemas similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona los benchmarks usados para la descontaminación (MathlibQR/MPR, Lean Finder, LeanStateSearch, TBPS, TheoremSearch, MIRB, LeanDojo), lo que sugiere que el modelo se evalúa en ellos, pero no incluye métricas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 8,1 GB con los pesos publicados en safetensors (aproximadamente bf16/fp16 para 4B de parámetros); no hay cuantizaciones oficiales publicadas.
- GPU recomendadas: cualquier GPU de consumo con 12-16 GB de VRAM (RTX 4090, RTX 3090) es suficiente para la inferencia de embeddings; no se requieren A100 ni H100.
- Cabe en GPUs de consumo: sí, con holgura en una RTX 4090 o RTX 3090; incluso en GPUs de 8 GB podría ser ajustado según la longitud de secuencia.
- Opciones de despliegue: sentence-transformers (librería nativa), text-embeddings-inference (TEI, indicado en los tags), Hugging Face Endpoints (endpoints_compatible). No hay evidencia de soporte directo en llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Dominio | Licencia | Notas |
|---|---|---|---|---|
| hpsearch-embed-4b-state-v3 | 4,02B | Estados de demostracion Lean 4 / premise selection | Apache 2.0 | Consultor LoRA fusionado; documentos congelados del modelo base |
| hpsearch-embed-4b-v2 (base) | no disponible | Premisas de Mathlib (lado documento) | no disponible | Modelo base; codifica el corpus de premisas |
| Embeddings genericos (p. ej. familia Qwen3-Embedding) | no disponible | Texto general | no disponible | No especializados en Lean 4; rendimiento esperablemente inferior en premise selection |

No hay disponibles datos de rendimiento comparativos publicados para estas alternativas en la tarea de premise selection.

## Limitaciones y advertencias

- Modelo altamente especializado: está entrenado para estados de demostración de Lean 4/Mathlib y descripciones en inglés; su uso sobre texto general o dominios distintos no está validado.
- Asimetria consulta-documento: las consultas deben codificarse con este modelo (state-v3) y los documentos con el modelo base hpsearch-embed-4b-v2; mezclar los lados incorrectamente producirá resultados erróneos.
- El componente de descripciones en inglés introduce dependencia de un LLM generador de descripciones en el pipeline; la calidad de la recuperación puede variar según ese generador.
- Riesgo de contaminacion residual: aunque la descontaminación es exhaustiva frente a benchmarks conocidos, no puede descartarse coincidencia semántica no detectada con consultas de evaluación.
- Sesgos: hereda los sesgos del corpus de entrenamiento (demostraciones de Mathlib y de los benchmarks LeanDojo y LeanStateSearch), que no cubren estilos de demostración fuera de esa distribución.
- Alucinacion: no aplica directamente al ser un modelo de embeddings, aunque un LLM que genere las descripciones del siguiente paso sí puede alucinar.
- Datos de descargas y likes muy bajos (29 descargas, 1 like en el momento de la ficha): adopción comunitaria mínima y ausencia de validación externa; el proyecto parece de investigación.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones destacables.
- Sin cuantizaciones oficiales ni instrucciones de despliegue detalladas en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hmzprover/hpsearch-embed-4b-state-v3
- Repositorio del proyecto hpsearch: https://github.com/humanfia/hpsearch
- Modelo base: https://huggingface.co/hmzprover/hpsearch-embed-4b-v2
- Dataset LeanStateSearch: https://huggingface.co/datasets/ruc-ai4math/mathlib_handler_benchmark_410
- Otros enlaces (paper, blog, demo): no disponibles
