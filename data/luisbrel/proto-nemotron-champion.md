# luisbrel/proto-nemotron-champion

## Resumen

Proto-Nemotron Crystallized Champion es un checkpoint de investigación publicado por el usuario independiente luisbrel en Hugging Face. Se presenta como un modelo híbrido de arquitectura Mamba-2 (state-space) combinada con un Mixture-of-Experts disperso, con 31.577.940.288 parámetros totales según los pesos en safetensors y un régimen de activación variable que el autor cifra entre 2.18B y 4.94B de parámetros activos por token según el valor de `num_experts_per_tok`. Está empaquetado en formato MLX y orientado a ejecución nativa en Apple Silicon.

El modelo se distribuye como el resultado de un proceso que el autor denomina Recursive Self-Improvement (RSI), una suerte de torneo longitudinal de mutaciones en el espacio de pesos que incluye proyecciones de Procrustes, grafting de pesos entre modelos y transporte óptimo de Sinkhorn. No se trata de un entrenamiento supervisado convencional ni de una destilación, sino de una intervención sobre pesos preexistentes de una arquitectura Nemotron. La model card reporta mejoras notables frente a una línea base que llama "NVIDIA Nemotron 3.5" en benchmarks como GPQA Diamond, LiveCodeBench o Agentic Tool Calling.

La relevancia del checkpoint es doble: por un lado, explora una vía poco habitual de mejora de modelos sin reentrenamiento completo; por otro, su empaquetado MLX lo hace directamente ejecutable en hardware Apple. Conviene leerlo con cautela: los resultados publicados proceden del propio autor, sobre muestras limitadas (200+ en algunos casos), y no hay validación externa ni paper asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 (state-space) + Mixture-of-Experts disperso (128 expertos enrutados + 1 compartido) |
| Parametros totales | 31.577.940.288 (≈31.6B) |
| Parametros activos | 2.18B (k=2), 3.56B (k=6), 4.25B (k=8), 4.94B (k=10) según `num_experts_per_tok` |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (etiqueta del repo); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |

## Arquitectura y entrenamiento

La arquitectura combina capas Mamba-2 de espacio de estados con un bloque MoE de tipo `SwitchMLP` con 128 expertos enrutados y uno compartido. El autor destaca que el enrutamiento permite modular la capacidad activa por token ajustando `k` sin "dimension thrashing", lo que da un rango de 2.18B a 4.94B de parámetros activos. El checkpoint se empaqueta en MLX con cuantización 4-bit, lo que explica que un modelo de ~31.6B ocupe 17.8 GB en el repositorio.

El entrenamiento no se describe como un pipeline clásico de preentrenamiento con número de tokens o composición de dataset (esos datos no están disponibles). En su lugar, el autor describe un proceso de Recursive Self-Improvement (RSI) sobre pesos existentes, con cuatro cohortes de exploración: steering SVD en capas intermedias, alineamiento dual de atención y MoE mediante proyección ortogonal de Procrustes, grafting de pesos entre modelos con transporte óptimo de Sinkhorn y cuantización anclada a rejilla, y fusión de deltas en intersecciones de espacio nulo. Cada generación promovida debía superar una "Zero-Regression Anchor Gate" con Δ ≥ 0.0% en anclas de capacidad y ratio de generalización R_gen ≥ 0.70. No se especifican volúmenes de datos, ni si hubo RLHF o DPO, ni detalles del dataset de evaluación más allá de "200+ muestras estandarizadas".

## Capacidades

- Generación de texto conversacional y razonamiento de tipo textual.
- Razonamiento científico de nivel graduate, según la model card (GPQA Diamond).
- Razonamiento matemático multi-paso y de olimpiada (GSM8K, AIME 2024).
- Síntesis de código y resolución de problemas algorítmicos (HumanEval+, LiveCodeBench).
- Tool calling y orquestación multi-herramienta en forma de DAG (Agentic Tool Calling).
- Razonamiento simbólico y deducción booleana (BIG-bench Hard).
- Seguimiento estricto de instrucciones (IFEVAL).
- Capacidad declarada de "spatial reasoning" y generación de gráficos vectoriales en XML (caso "pelican on a bicycle") sin codificador visual raster.
- Modulación dinámica de capacidad activa vía `num_experts_per_tok`.
- Resistencia declarada a vectores de jailbreak simulados (DAN, suplantación de autorización, inyección de delimitadores, encuadre ficticio).
- Capacidades multilingües: no disponible.

## Casos de uso

- Evaluación de investigación en Apple Silicon: el checkpoint está empaquetado en MLX y cuantizado a 4-bit, por lo que se puede cargar directamente en un Mac con memoria unificada para reproducir o contrastar las cifras de la model card sin depender de GPUs NVIDIA.
- Orquestación de agentes con múltiples herramientas: la model card reporta un 100% en Agentic Tool Calling sobre su suite interna, lo que lo hace candidato para prototipos de pipelines de agentes que encadenan llamadas a APIs y validan el grafo de dependencias.
- Generación de código en entornos de investigación: con resultados declarados de 93.3% en HumanEval+ y 100% en LiveCodeBench, puede usarse como generador de parches o soluciones en un banco de pruebas interno, siempre con revisión humana.
- Razonamiento matemático asistido: con k=10 y ~4.94B de parámetros activos, el autor lo orienta a demostraciones y problemas de olimpiada; útil para experimentar con modos de "heavy reasoning" en los que se sacrifica throughput por capacidad.
- Generación de gráficos vectoriales y diagramas XML: el caso documentado de "pelican on a bicycle" sugiere uso en generación programática de SVG/XML estructurado para documentación técnica o visualizaciones simples, sin depender de un modelo multimodal.
- Estudio de técnicas de modificación de pesos: sirve como banco de pruebas para investigar RSI, Procrustes alignment, Sinkhorn grafting o fusión en espacio nulo, comparando el checkpoint con su línea base.
- Experimentos de seguridad y alineamiento: la model card reporta rechazo certificado frente a cuatro vectores de jailbreak; útil para reproducir evaluaciones adversariales en un entorno controlado.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card, medidos sobre Apple Silicon M4 Max (128 GB de memoria unificada, MLX Metal) frente a una línea base denominada "NVIDIA Nemotron 3.5". No hay validación externa disponible.

| Benchmark | Dominio | Baseline | Champion | Δ |
|---|---|---|---|---|
| GPQA Diamond | Ciencia y razonamiento graduate | 54.0% | 86.7% | +32.7% |
| Agentic Tool Calling | Orquestación multi-herramienta (DAG) | 90.0% | 100.0% | +10.0% |
| AIME 2024 | Matemáticas de olimpiada | 3.3% | 13.3% | +10.0% |
| LiveCodeBench | Síntesis de código de concurso | 95.0% | 100.0% | +5.0% |
| HumanEval+ | Síntesis algorítmica en Python | 90.0% | 93.3% | +3.3% |
| BIG-bench Hard | Deducción simbólica y booleana | 76.0% | 80.0% | +4.0% |
| GSM8K | Razonamiento matemático multi-paso | 96.0% | 98.0% | +2.0% |
| IFEVAL | Seguimiento estricto de instrucciones | 100.0% | 100.0% | 0.0% |
| ARC Challenge | Abstracción científica | 90.0% | 90.0% | 0.0% |

Throughput declarado en M4 Max según régimen de enrutamiento:

| Régimen | Expertos por token | Activos MoE | Activos totales | Velocidad |
|---|---|---|---|---|
| Lean | 2/128 | 1.38B | 2.18B | 171.4 tok/s |
| Standard | 6/128 | 2.76B | 3.56B | 139.7 tok/s |
| Frontier | 8/128 | 3.45B | 4.25B | 127.9 tok/s |
| Heavy Reasoning | 10/128 | 4.14B | 4.94B | 116.2 tok/s |

Resultados de seguridad adversarial declarados (cuatro vectores simulados: DAN, suplantación de autorización, inyección de delimitadores y encuadre ficticio): 100% de rechazo certificado en los cuatro, frente a bypass en la línea base.

## Requisitos de hardware

- Repositorio de 17.8 GB en safetensors 4-bit, lo que sugiere que el checkpoint completo cabe en memoria unificada de 32 GB o superior en Apple Silicon, aunque no se especifica el pico de memoria en ejecución.
- Hardware de referencia del autor: Apple Silicon M4 Max con 128 GB de memoria unificada y Metal nativo vía MLX.
- No hay datos publicados sobre ejecución en GPUs NVIDIA (A100, H100, RTX 4090) ni sobre conversión a otros formatos; el repo está etiquetado como `mlx`.
- Opciones de despliegue: MLX (`mlx_lm` u equivalente) es la vía natural; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Throughput declarado: entre 116.2 y 171.4 tok/s en M4 Max según `k`; no hay latencia publicada para otros equipos.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Proto-Nemotron Champion (este) | ~31.6B | 2.18B–4.94B | no disponible | Apache 2.0 | MLX safetensors 4-bit | Checkpoint de investigación RSI, sin validación externa |
| Línea base "NVIDIA Nemotron 3.5" (según el autor) | no disponible | no disponible | no disponible | no disponible | no disponible | Referencia usada en la model card; no se aportan enlaces |
| Alternativas MoE híbridas Mamba (p. ej. familia Nemotron-H, Jamba) | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de comparativas independientes con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks proceden exclusivamente del autor, sobre muestras limitadas (200+ en algunos suites) y sin validación externa ni paper revisado por pares.
- El proceso de "Recursive Self-Improvement" y las técnicas asociadas (Procrustes alignment, Sinkhorn grafting, fusión en espacio nulo) no están documentados con detalle reproducible en la model card.
- El número de descargas y likes es 0 en el momento de la consulta, lo que indica ausencia de adopción o verificación por parte de la comunidad.
- No se especifican idiomas soportados; el comportamiento multilingüe es desconocido.
- La longitud de contexto no está disponible, lo que impide planificar casos de uso con ventanas largas.
- El checkpoint está empaquetado únicamente en MLX 4-bit; la conversión a otros formatos (GGUF, safetensors estándar para vLLM/TGI) no está documentada y podría degradar el comportamiento.
- Los resultados de seguridad adversarial se basan en vectores simulados por el propio autor; no constituyen una garantía de robustez frente a ataques reales.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de un checkpoint derivado de pesos de terceros (Nemotron), conviene verificar la cadena de licencias del modelo base antes de un despliegue en producción.
- Riesgo de alucinación no cuantificado en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/luisbrel/proto-nemotron-champion
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos asociados.
