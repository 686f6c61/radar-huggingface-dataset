# hmzprover/hpsearch-embed-4b-state-v2

## Resumen

hpsearch-embed-4b-state-v2 es un modelo de embeddings especializado en la recuperación de premisas para demostración automática de teoremas en Lean 4. Lo desarrolla el autor hmzprover como componente del sistema hpsearch, concretamente como el codificador de consultas (query embedder) de sus modos GPU `balanced`, `accurate` y `best`. El modelo resuelve un problema muy concreto: dado un estado de demostración (proof state) de Lean 4, opcionalmente seguido de una descripción en inglés del siguiente paso, producir un vector que quede próximo a los vectores de las premisas de Mathlib que la siguiente táctica necesita.

Técnicamente es un fine-tuning mediante LoRA (r=16, fusionado) sobre el modelo base hmzprover/hpsearch-embed-4b-v2, que a su vez se apoya en la familia Qwen3. Cuenta con 4.021.774.336 parámetros (aproximadamente 4B) y se distribuye en formato safetensors con un tamaño de repositorio de 8,1 GB. La asimetría es una decisión de diseño clave: solo se entrena el lado de la consulta, mientras que los documentos (premisas) conservan los vectores del modelo base, lo que permite reutilizar un índice precalculado.

Su relevancia actual radica en que la selección de premisas es el cuello de botella principal de los demostradores automáticos sobre Mathlib, un corpus con cientos de miles de lemas. El modelo está entrenado exclusivamente con splits públicos de entrenamiento (LeanDojo Benchmark 4 y LeanStateSearch) y aplica una descontaminación estricta frente a los conjuntos de evaluación habituales del dominio, lo que lo hace adecuado para investigación reproducible en premise selection.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), fine-tuning LoRA r=16 fusionado sobre hmzprover/hpsearch-embed-4b-v2; codificador de embeddings de similitud de frases |
| Parametros totales | 4.021.774.336 (aproximadamente 4B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors) |
| Idiomas soportados | no disponible (entrenado sobre estados de Lean 4 y descripciones en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3 de aproximadamente 4B parámetros, adaptado como codificador de embeddings mediante un fine-tuning LoRA de rango 16 que se fusiona en los pesos finales. La innovación principal no está en la arquitectura sino en el régimen de entrenamiento asimétrico: únicamente se entrena el lado de la consulta, de modo que un estado de demostración (opcionalmente seguido de una descripción en inglés del siguiente paso, al estilo de los estados "augmented" de Lean Finder) se proyecta cerca de los vectores del modelo base correspondientes a las premisas que utiliza la siguiente táctica. Los documentos mantienen los vectores del base, y el campo `pairs_with` de la model card identifica ese modelo compañero.

El entrenamiento usa solo splits públicos: LeanDojo Benchmark 4 (v10) `random/train` y LeanStateSearch (`ruc-ai4math/mathlib_handler_benchmark_410`) `random/train`, emparejando cada táctica trazada con las premisas que emplea. La función de pérdida es un softmax completo sobre todos los vectores de premisas (89.298 premisas), no un muestreo negativo. El conjunto final retenido son 147.412 estados (89.719 de LeanDojo y 57.693 de LeanStateSearch). La descontaminación es estricta: se descarta un estado si su teorema pertenece a un split reservado o es el teorema de cualquier consulta de evaluación, si su texto coincide con alguna consulta de evaluación o si su goal coincide con el goal de alguna consulta de evaluación de proof-state; una premisa se descarta si su nombre o enunciado es gold de cualquier evaluación (MathlibQR/MPR, Lean Finder, LeanStateSearch, TBPS, TheoremSearch, MIRB, LeanDojo y las propias de hpsearch), y esas premisas también se excluyen del softmax contrastivo.

## Capacidades

- Generación de embeddings de estados de demostración de Lean 4 para recuperación densa de premisas de Mathlib.
- Codificación conjunta de estado y descripción en inglés del siguiente paso, permitiendo consultas aumentadas.
- Similitud de frases orientada a recuperación asimétrica: consulta entrenada contra un índice de documentos fijo del modelo base.
- Búsqueda sobre un corpus de 89.298 premisas mediante softmax completo, sin necesidad de reindexar documentos al cambiar de modo.
- Integración con sentence-transformers y con Text Embeddings Inference (tag `text-embeddings-inference`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento explícito: es un modelo puramente de embeddings.

## Casos de uso

- Selección de premisas en demostradores automáticos de Lean 4: dado un proof state, recuperar las k premisas más similares del índice de Mathlib para pasarlas como candidatas a un táctica o a un modelo generador; es el uso para el que fue entrenado y el que motiva su diseño asimétrico.
- Modos de búsqueda de hpsearch: desplegarlo como codificador de consultas en los modos `balanced`, `accurate` y `best`, reutilizando el índice de documentos del modelo base sin recalcularlo.
- Búsqueda aumentada con descripción del paso: cuando el estado es escaso, añadir una o tres frases en inglés describiendo la siguiente táctica para mejorar la consulta, tal como se entrenó parte de los estados.
- Construcción de pipelines de recuperación para investigación en premise selection: evaluar sobre LeanDojo, LeanStateSearch, TBPS, TheoremSearch o MIRB con garantías de descontaminación frente a esos mismos conjuntos.
- Servicio de recuperación semántica vía Text Embeddings Inference: desplegar el modelo como endpoint compatible con la API de embeddings y consultarlo desde un orquestador de demostración.
- Filtrado y deduplicación de premisas candidatas: usar la similitud entre estados y lemas para priorizar o descartar candidatos antes de un paso de reranking más costoso.
- Análisis de trayectorias de prueba: proyectar estados sucesivos de una demostración para estudiar la evolución de la consulta y las premisas recuperadas en cada paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.021.774.336 parámetros, en fp16/bf16 se requieren aproximadamente 8 GB de pesos más overhead de activaciones; en fp32, unos 16 GB.
- GPU recomendadas: A100 (40/80 GB), H100 y L40S para servicio concurrente; una RTX 4090 (24 GB) es suficiente para inferencia en fp16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y RTX 3090 (24 GB) en fp16; en tarjetas de 16 GB requeriría cuantización, de la que no se documentan artefactos publicados.
- Opciones de despliegue: sentence-transformers, Text Embeddings Inference (soportado según los tags) y endpoints compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hpsearch-embed-4b-state-v2 | 4,02B | no disponible | Lean 4 / Mathlib (premise selection) | apache-2.0 | HuggingFace (hmzprover) |
| hmzprover/hpsearch-embed-4b-v2 (base) | no disponible | no disponible | Lean 4 / Mathlib | no disponible | HuggingFace (hmzprover) |
| Lean Finder | no disponible | no disponible | Lean 4 (estados aumentados) | no disponible | no disponible en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: no es un modelo generativo ni un chatbot; solo produce embeddings para recuperación de premisas en Lean 4 y no debe usarse como modelo de propósito general.
- Asimetría obligatoria: los documentos deben codificarse con el modelo base hmzprover/hpsearch-embed-4b-v2, no con este; usar este modelo para indexar documentos rompe el emparejamiento para el que fue entrenado.
- Idiomas no declarados: aunque parte de los estados se aumentan con descripciones en inglés, la model card no especifica cobertura multilingüe.
- Longitud de contexto no documentada: estados de demostración muy largos podrían truncarse sin que se indique el límite.
- Riesgo de sesgo hacia la distribución de entrenamiento: entrenado solo con LeanDojo Benchmark 4 y LeanStateSearch `random/train`; el rendimiento puede degradarse en teoremas o estilos de prueba alejados de esa distribución.
- Descontaminación estricta que reduce el corpus: las premisas excluidas por ser gold de evaluaciones no están representadas ni en el índice ni en el softmax, lo que puede afectar a la recuperación de esos lemas concretos.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni documenta evaluación de calidad en producción.
- Adopción muy baja (23 descargas, 0 likes) y fecha de creación reciente: no hay validación externa ni reportes de terceros sobre su rendimiento real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hmzprover/hpsearch-embed-4b-state-v2
- Modelo base: https://huggingface.co/hmzprover/hpsearch-embed-4b-v2
- Repositorio del sistema hpsearch: https://github.com/humanfia/hpsearch
- LeanDojo Benchmark 4: no disponible enlace directo en la información proporcionada
- LeanStateSearch (`ruc-ai4math/mathlib_handler_benchmark_410`): no disponible enlace directo en la información proporcionada
