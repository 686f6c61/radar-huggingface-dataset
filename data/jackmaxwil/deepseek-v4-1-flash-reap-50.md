# jackmaxwil/DeepSeek-V4.1-Flash-REAP-50

## Resumen

DeepSeek-V4.1-Flash-REAP-50 es un checkpoint derivado del modelo DeepSeek-V4.1-Flash-1017, desarrollado por el usuario independiente jackmaxwil. Se trata de una poda estructurada de expertos sobre el modelo base: se elimina el 50% de los expertos enrutados de cada capa MoE mediante REAP (Router-weighted Expert Activation Pruning, arXiv:2510.13999), conservando 192 de los 384 expertos enrutados por capa. El experto compartido, la atención, los embeddings y el resto de pesos permanecen intactos, y no se realizó reentrenamiento posterior a la poda.

El modelo base es un transformer de tipo Mixture-of-Experts con 491.375.079.634 parámetros totales (dato extraído de los safetensors del repositorio). La poda reduce el número de expertos enrutados por capa de 384 a 192, manteniendo `num_experts_per_tok` en 6, lo que disminuye el coste computacional e de memoria asociado a los expertos enrutados sin tocar el resto de la arquitectura. Los pesos de los expertos conservan el formato FP4 del modelo base.

La relevancia de este checkpoint radica en que permite desplegar una variante más ligera del modelo base conservando su licencia MIT y su compatibilidad con la librería transformers. No obstante, el autor advierte explícitamente de que no hay fine-tuning posterior a la poda y de que cabe esperar degradación en dominios fuera de la mezcla de calibración, particularmente en chino. La evaluación publicada es de tipo teacher-forced (scoring), no de generación libre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), familia deepseek_v41 |
| Parámetros totales | 491.375.079.634 |
| Parámetros activos | no disponible (el modelo base activa 6 expertos enrutados por token; el número exacto de parámetros activos no se especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP4 en los pesos de los expertos (formato del modelo base); pesos en 8-bit / FP8 según tags del repositorio; no se detallan otras cuantizaciones |
| Idiomas soportados | no disponible (la calibración usó únicamente inglés y código; no se usó texto en chino) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer con capas MoE en las que cada capa contiene expertos enrutados y un experto compartido. En el checkpoint original hay 384 expertos enrutados por capa y se activan 6 por token. La poda REAP elimina el 50% de los expertos enrutados, dejando 192 por capa, y renumera los supervivientes de 0 a 191 en su orden original. El peso y el sesgo del router de cada capa MoE se recortan a los expertos supervivientes. Los pesos de los expertos conservan el formato FP4 del modelo base, y el experto compartido, la atención, los embeddings y el resto de pesos no se modifican. No hubo reentrenamiento tras la poda.

La selección de expertos se realizó con REAP, que puntúa cada experto como el producto del peso de su puerta en el router por la norma de su salida, promediado sobre los tokens enrutados a ese experto, y conserva los 192 mejores por capa. La calibración se ejecutó sobre 2.946.031 tokens (24 sesiones de hasta 16.384 tokens) de inglés y código, con peso hacia programación agéntica, terminal y uso de herramientas. Las fuentes de calibración incluyen nvidia/Open-SWE-Traces, nebius/SWE-rebench-V2-PRs, nvidia/Nemotron-Terminal-Corpus, Agent-Ark/Toucan-1.5M, CIRCL/vulnerability-scores, common-pile/stackexchange_filtered, HuggingFaceFW/finepdfs, corbt/enron-emails, allenai/WildChat-4.8M y HuggingFaceFW/finewiki. No se usó texto en chino. El repositorio incluye `keep-prune.json` con el índice de origen y los hashes de las listas de supervivientes, y `SHA256SUMS` que cubre todos los ficheros.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base DeepSeek-V4.1-Flash, aunque la poda puede degradar el rendimiento en dominios no cubiertos por la calibración.
- Generación de código: la calibración está ponderada hacia código agéntico, terminal y uso de herramientas, por lo que el modelo conserva mejor el comportamiento en estas tareas.
- Uso de herramientas (tool calling / function calling): el conjunto de calibración incluye datos de tool-use y agentes, aunque la evaluación muestra la mayor divergencia respecto al profesor precisamente en tool-use (KL 1.931, acuerdo top-1 0.662).
- Razonamiento multi-paso y agentes: calibrado con trazas agénticas de Python y Rust; el autor advierte de mayor degradación fuera de la mezcla de calibración.
- Capacidades multilingües: no disponibles como dato verificado; la calibración fue solo en inglés y código, y el autor espera degradación particularmente en chino.
- Visión: la ruta de visión del modelo base está intacta pero no fue calibrada ni evaluada.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere compatibilidad con despliegues tipo endpoint, aunque no se detalla en la información disponible.

## Casos de uso

- Asistencia a programación agéntica: el modelo se calibró con trazas de Open-SWE y SWE-rebench, por lo que es adecuado para tareas de resolución de issues y edición de código en Python y Rust, aunque con mayor divergencia respecto al profesor en estas tareas (acuerdo top-1 0.718 en Python y 0.697 en Rust).
- Automatización de terminal y bash: con un acuerdo top-1 de 0.921 y KL de 0.270 en el dominio bash, es el escenario donde la poda introduce menos divergencia, adecuado para agentes de línea de comandos.
- Generación y revisión de diffs de código: el dominio code-diffs muestra el mejor comportamiento relativo (acuerdo top-1 0.939, KL 0.107), por lo que es apto para pipelines de revisión automática de cambios.
- Despliegue en entornos con restricciones de memoria: al reducir los expertos enrutados a la mitad, el checkpoint ocupa 365,8 GB en el repositorio, lo que puede facilitar el despliegue frente al modelo base completo en infraestructuras con VRAM limitada.
- Procesamiento de correo empresarial: el dominio business-email muestra acuerdo top-1 0.791 y un cambio de NLL de +0.313, útil para clasificación y redacción asistida, aunque con degradación medible.
- Tareas de ciberseguridad y análisis de vulnerabilidades: la calibración incluyó CIRCL/vulnerability-scores; el dominio cyber muestra acuerdo top-1 0.828 y KL 0.582, adecuado para triaje asistido con supervisión humana.
- Investigación sobre poda de MoE: al publicar estadísticas de calibración, listas de supervivientes y datos de evaluación, sirve como referencia reproducible para estudiar el impacto de REAP en modelos de gran escala.

## Benchmarks y rendimiento

El autor publica una evaluación teacher-forced sobre un split retenido de las mismas fuentes de calibración (108 sesiones, 437.350 posiciones puntuadas), comparando el modelo podado con el modelo completo como profesor. Las métricas son KL sobre los 2.048 logits principales del profesor, acuerdo top-1 y cambio en la NLL del siguiente token de referencia (negativo indica mayor probabilidad para el token de referencia).

| Dominio | Posiciones | Acuerdo top-1 | KL (profesor ‖ podado) | Cambio NLL (nats) |
|---|---:|---:|---:|---:|
| all | 437.350 | 0.803 | 0.810 | -0.138 |
| agentic-python | 63.310 | 0.718 | 1.331 | -0.358 |
| agentic-rust | 49.149 | 0.697 | 1.414 | -0.404 |
| bash | 50.094 | 0.921 | 0.270 | -0.155 |
| business | 32.823 | 0.839 | 0.259 | +0.138 |
| business-email | 15.382 | 0.791 | 0.546 | +0.313 |
| code-diffs | 64.558 | 0.939 | 0.107 | +0.062 |
| cyber | 30.806 | 0.828 | 0.582 | +0.360 |
| english-chat | 15.439 | 0.773 | 0.366 | +0.076 |
| english-prose | 18.873 | 0.834 | 0.550 | +0.354 |
| networking | 32.674 | 0.896 | 0.156 | +0.087 |
| tool-use | 64.242 | 0.662 | 1.931 | -0.707 |

Comparación entre variantes de poda evaluadas en la misma ejecución:

| Variante | Expertos conservados | Acuerdo top-1 | KL | Cambio NLL |
|---|---:|---:|---:|---:|
| REAP-33 (no publicada) | 256 / 384 | 0.842 | 0.511 | +0.025 |
| REAP-50 | 192 / 384 | 0.803 | 0.810 | -0.138 |
| REAP-67 (no publicada) | 128 / 384 | 0.755 | 1.114 | -0.109 |
| REAP-75 | 96 / 384 | 0.720 | 1.349 | -0.131 |

El autor advierte de que estas cifras provienen de enmascarar expertos en el router dentro del modelo completo. El checkpoint exportado se ejecutó después de forma independiente (en CPU, con código de referencia y sustitutos de dequantize-then-matmul para los kernels FP8/FP4) sobre 5 sesiones de evaluación (1.329 posiciones), obteniendo KL 0.809 frente a 0.841, cambio de NLL -0.378 frente a -0.353 y acuerdo top-1 0.771 frente a 0.774. Esa comprobación es de scoring teacher-forced; no se ha probado la generación libre. Los cambios negativos de NLL en texto agéntico y de tool-use no son evidencia de mejora del modelo, sino de un mejor ajuste a las trazas de referencia. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 365,8 GB con pesos en FP4/FP8, por lo que se requiere infraestructura de múltiples GPU de alta capacidad.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del checkpoint (491.375 millones de parámetros) no es viable en GPU de consumo individual.
- ¿Cabe en consumer GPU?: no, según el tamaño del repositorio y el número de parámetros.
- Opciones de despliegue: transformers (librería declarada); el autor indica ejecutarlo exactamente como el modelo base, con el código de referencia en `inference/`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles. La única ejecución documentada fue en CPU con sustitutos de kernels FP8/FP4, sin métricas de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Expertos enrutados por capa | Contexto | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| DeepSeek-V4.1-Flash-REAP-50 | 491.375.079.634 | 192 / 384 | no disponible | MIT | Hugging Face |
| DeepSeek-V4.1-Flash-REAP-75 | no disponible | 96 / 384 | no disponible | MIT | Hugging Face |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible | 384 / 384 | no disponible | MIT | Hugging Face |

Comparativa de rendimiento relativo entre variantes de poda (acuerdo top-1 y KL sobre el split de evaluación del autor):

| Variante | Acuerdo top-1 | KL | Cambio NLL |
|---|---:|---:|---:|
| REAP-33 (no publicada) | 0.842 | 0.511 | +0.025 |
| REAP-50 | 0.803 | 0.810 | -0.138 |
| REAP-75 | 0.720 | 1.349 | -0.131 |

No se dispone de datos de benchmarks estándar para comparar con modelos de otros desarrolladores de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible. La calibración se limitó a inglés y código, sin texto en chino, lo que puede introducir sesgo idiomático.
- Riesgo de alucinación: no cuantificado. La evaluación publicada es de scoring teacher-forced; la generación libre no se ha probado.
- Limitaciones de contexto o idioma: la longitud de contexto no está disponible; el autor espera mayor degradación en dominios fuera de la mezcla de calibración y particularmente en chino.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el autor no está afiliado ni respaldado por DeepSeek; se debe verificar la licencia del modelo base y el cumplimiento de sus términos.
- Ausencia de fine-tuning posterior a la poda: no hay reentrenamiento, por lo que cabe esperar degradación adicional en tareas no representadas en la calibración.
- Ruta de visión no evaluada: los pesos de visión están intactos pero no se calibraron ni se probaron.
- Evaluación parcial: la comprobación del checkpoint exportado cubre solo 5 sesiones y 1.329 posiciones, y usa sustitutos de kernels FP8/FP4 en CPU, lo que limita la extrapolación a producción.
- Cambios negativos de NLL no implican mejora: el autor advierte explícitamente de que estos valores reflejan un mejor ajuste a trazas de referencia de otros modelos, no una mejora del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jackmaxwil/DeepSeek-V4.1-Flash-REAP-50
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Variante hermana REAP-75: https://huggingface.co/jackmaxwil/DeepSeek-V4.1-Flash-REAP-75
- Estadísticas de calibración y evaluación: https://huggingface.co/datasets/jackmaxwil/DeepSeek-V4.1-Flash-REAP-stats
- Paper REAP: https://arxiv.org/abs/2510.13999
