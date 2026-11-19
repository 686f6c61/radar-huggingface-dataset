# ikimyaii/GatedDeltaNet-340M-unstructured-SparseGPT-80pct

## Resumen

GatedDeltaNet-340M-unstructured-SparseGPT-80pct es un checkpoint de investigación publicado por el usuario ikimyaii en Hugging Face: una versión podada al 80% de dispersión no estructurada del modelo base m-a-p/340M-20B-GatedDeltaNet-pure-baseline. No es un modelo entrenado desde cero ni afinado para uso general, sino un artefacto de experimentación que sirve como línea base para estudiar el comportamiento de arquitecturas híbridas tipo Gated DeltaNet bajo compresión agresiva de pesos. Su interés es metodológico: documenta qué ocurre cuando se aplica SparseGPT de forma one-shot, sin reentrenamiento, sobre una arquitectura de atención lineal con compuertas.

El modelo conserva los 399.531.200 parámetros del checkpoint original (el podado no elimina tensores, solo pone a cero pesos), pero el 80% de los pesos de las capas lineales internas de los bloques queda anulado. Las matrices de embedding y la cabeza de lenguaje (lm_head) permanecen densas. El resultado es un modelo que ocupa 0,8 GB en el repositorio y que, según la propia model card, sufre un deterioro severo de perplejidad y de precisión zero-shot, lo que lo invalida para producción y lo convierte en una referencia negativa útil para comparar técnicas de podado más sofisticadas.

La relevancia actual es doble: por un lado, aporta datos empíricos sobre la robustez de Gated DeltaNet frente al podado no estructurado, una arquitectura que gana tracción como alternativa eficiente a los transformers clásicos; por otro, fija un punto de comparación explícito para los modelos EHWS del mismo autor, presumiblemente variantes con podado estructurado o consciente del hardware. La ficha se basa exclusivamente en la información publicada en el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet (atención lineal con compuertas) |
| Parámetros totales | 399.531.200 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bfloat16 según el proceso de podado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base m-a-p/340M-20B-GatedDeltaNet-pure-baseline, un transformer con capas de Gated DeltaNet, un mecanismo de atención lineal con compuertas que sustituye la atención cuadrática por una recurrencia lineal. El nombre del base sugiere un entrenamiento sobre 20.000 millones de tokens con un tamaño de 340M de parámetros, aunque la model card del checkpoint podado no detalla la composición del dataset ni si hubo fases de RLHF o DPO. No se dispone de información sobre el tokenizador, el vocabulario ni la longitud de contexto nativa.

El proceso de podado sí está documentado con precisión. Se aplicó SparseGPT en su implementación oficial (IST-DASLab/sparsegpt, commit 147d215) con el modo `fasterprune`, bloques de 128 columnas y damping de 0,01. La calibración usó 128 secuencias de C4 de 2.048 tokens con semilla 0. Los bloques se podaron en orden, recalibrando cada uno sobre las salidas de los bloques ya podados, siguiendo la lógica de los drivers oficiales; el recorrido de capas es código nuevo porque los drivers originales solo soportan OPT y LLaMA. El podado se ejecutó en bfloat16 y tardó 2,5 minutos en una única A100 de 40 GB. Se podaron todas las capas lineales dentro de los bloques; embeddings y lm_head quedaron densos. La máscara resultante usa un umbral por bloque de 128 columnas, de modo que las filas no quedan equilibradas: la fila más densa tiene de media 2,03 veces los no-ceros de la fila media, y en la peor capa la ratio llega a 3,96. La dispersión medida sobre los pesos finales es de 0,8000 exactos.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base, aunque con calidad gravemente degradada tras el podado.
- Razonamiento y conocimiento factual limitados: la precisión zero-shot cae en todas las tareas evaluadas salvo rte, donde sube ligeramente.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información publicada.
- No hay modo thinking, visión ni audio.
- Sirve como referencia experimental para medir el impacto del podado no estructurado en arquitecturas de atención lineal.

## Casos de uso

- Investigación sobre podado de redes: el checkpoint permite reproducir y comparar el efecto de SparseGPT one-shot al 80% sobre una arquitectura Gated DeltaNet, usando las métricas de perplejidad y zero-shot publicadas como referencia.
- Línea base para técnicas de podado superiores: cualquier método nuevo (podado estructurado, destilación, recuperación con reentrenamiento) puede compararse contra este modelo para cuantificar la mejora, tal como el autor lo plantea frente a sus modelos EHWS.
- Estudio de equilibrio de filas en máscaras no estructuradas: la distribución desigual de no-ceros por fila (hasta 3,96 veces la media) lo convierte en un caso de análisis para investigar el impacto del desequilibrio en el rendimiento y en kernels dispersos.
- Análisis de robustez de atención lineal: permite estudiar si las capas Gated DeltaNet toleran peor o mejor el podado que la atención cuadrática clásica, comparando con resultados equivalentes en transformers estándar.
- Validación de pipelines de evaluación: útil para probar herramientas como lm-evaluation-harness o protocolos de perplejidad tipo ELSA sobre modelos dispersos con flash-linear-attention.
- Docencia y divulgación: ejemplo reproducible y ligero (0,8 GB) para explicar en clase o en un artículo cómo funciona SparseGPT y por qué el podado one-shot agresivo degrada tanto la calidad.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (WikiText-2 y C4, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 16,42 | 19,94 |
| Este modelo (80% dispersión) | 274,66 | 217,44 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2645 | 0,1988 |
| arc_easy | 0,6023 | 0,2997 |
| boolq | 0,5985 | 0,4508 |
| hellaswag | 0,3461 | 0,2692 |
| openbookqa | 0,2300 | 0,1300 |
| rte | 0,5162 | 0,5343 |
| winogrande | 0,5036 | 0,4988 |
| Media | 0,4373 | 0,3402 |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 0,8 GB en bfloat16; en fp16 o bf16 cabe holgadamente en cualquier GPU con 2 GB o más. En cuantización de 8 bits o 4 bits (si se generan versiones GGUF, no publicadas) bajaría por debajo de 0,5 GB.
- GPU recomendadas: cualquier GPU moderna sirve para inferencia; una A100 40GB fue suficiente para completar el podado en 2,5 minutos.
- Cabe en GPU de consumo: sí, en cualquier RTX con 4 GB o más (RTX 3050, 4060, 4090, etc.) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: requiere `flash-linear-attention` instalado (`import fla`) y `AutoModelForCausalLM.from_pretrained(...)`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; dado que la arquitectura Gated DeltaNet no es un transformer estándar, es previsible que estos motores no la soporten sin adaptaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dispersión | Perplejidad WikiText-2 | Licencia |
|---|---|---|---|---|---|
| Este modelo (SparseGPT 80%) | 399,5M | no disponible | 80% no estructurada | 274,66 | no disponible |
| m-a-p/340M-20B-GatedDeltaNet-pure-baseline (denso) | 399,5M (según safetensors del podado) | no disponible | 0% | 16,42 | no disponible |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación principal es contra su propio modelo base denso, que es el único punto de referencia con datos publicados en la información disponible. Los modelos EHWS mencionados en la model card no tienen ficha pública accesible en esta búsqueda, por lo que no se pueden detallar sus especificaciones.

## Limitaciones y advertencias

- Deterioro severo de calidad: la perplejidad en WikiText-2 pasa de 16,42 a 274,66 (multiplicación por más de 16) y la media zero-shot cae de 0,4373 a 0,3402. No es apto para uso en producción.
- Alucinación muy probable: con una perplejidad de ese orden, la generación de texto será incoherente o incorrecta en la mayoría de contextos.
- Máscara desequilibrada: la distribución de no-ceros por fila es irregular (hasta 3,96 veces la media en la peor capa), lo que complica el aprovechamiento real de la dispersión en hardware y puede agravar el sesgo por capas.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; hay que consultar la licencia del modelo base m-a-p/340M-20B-GatedDeltaNet-pure-baseline antes de cualquier uso.
- Idiomas no especificados: se desconoce el soporte multilingüe real.
- Dependencia de software: requiere `flash-linear-attention`, una librería menos extendida que transformers estándar, lo que limita su integración en stacks convencionales.
- Sesgos: no documentados, pero heredados del dataset de entrenamiento del modelo base, que tampoco se detalla.
- Fecha de creación futura (2026-11-19): el repositorio figura con fecha posterior a la actual, lo que sugiere un artefacto de planificación o un error de metadatos; conviene verificar la integridad del checkpoint antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-340M-unstructured-SparseGPT-80pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-GatedDeltaNet-pure-baseline
- Código oficial de SparseGPT: https://github.com/IST-DASLab/sparsegpt (commit 147d215)
- Librería flash-linear-attention: no disponible enlace directo en la información proporcionada
- Protocolo de evaluación ELSA: no disponible enlace directo en la información proporcionada
- lm-evaluation-harness: no disponible enlace directo en la información proporcionada
