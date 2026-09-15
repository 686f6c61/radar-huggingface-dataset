# Jeesup/svd-safety-l2_remove40_swapdisc_a020_c002_b010_r02

# Ficha técnica: svd-safety-l2_remove40_swapdisc_a020_c002_b010_r02

## Resumen

svd-safety-l2_remove40_swapdisc_a020_c002_b010_r02 es un checkpoint de investigación derivado de meta-llama/Llama-2-7b-chat-hf, publicado por el usuario Jeesup. No es un modelo entrenado desde cero ni un ajuste fino al uso: es el resultado de aplicar compresión SVD-LLM (eliminación del 40,02 % de los parámetros densos, lo que deja un 59,98 % de la fracción original) y, a continuación, dos rondas de una edición iterativa de parámetros destinada a reparar el comportamiento de seguridad dañado por esa compresión.

El checkpoint contiene 6.738.415.616 parámetros (unos 6,74 mil millones), se distribuye en safetensors y conserva la arquitectura transformer decoder-only de Llama 2 con una ventana de contexto de 4096 tokens. La edición se guió por la regla de selección `disc_iter`, con un presupuesto de restauración del 1,000 % de los parámetros densos (2.404 componentes restaurados y 2.404 expulsados), un tamaño de bloque por ronda del 0,200 % y un valor de inserción `insert` con escala 0,2 sobre la fuerza del componente. Este artefacto corresponde a la ronda 2 de 5, es decir, a un punto intermedio de una ejecución más larga.

Su relevancia es metodológica antes que funcional: el autor lo publica para cuantificar cómo la compresión degrada la seguridad y qué criterios de selección de componentes la recuperan mejor. La propia model card advierte de que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat y de que este checkpoint debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), pesos comprimidos con SVD-LLM y editados posteriormente |
| Parametros totales | 6.738.415.616 (~6,74 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens, heredada del modelo base meta-llama/Llama-2-7b-chat-hf |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors (sin GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible en la model card; el modelo base está entrenado principalmente en inglés |
| Licencia | Llama 2 Community License (el repositorio incluye LICENSE.txt y USE_POLICY.md) |
| Formato de pesos | safetensors (tamaño del repositorio: 13,5 GB) |
| Autor | Jeesup |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Pipeline | text-generation |
| Fecha de creacion | 15 de septiembre de 2026 (última actualización: 15 de septiembre de 2026) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con normalización RMSNorm en la entrada de cada subcapa, activación SwiGLU en la red feed-forward y embeddings posicionales rotatorios (RoPE). Sobre esa base, este checkpoint no incorpora ningún entrenamiento adicional: el proceso aplicado es puramente post-hoc y consta de dos etapas. La primera es compresión SVD-LLM, que elimina el 40,02 % de los parámetros densos mediante descomposición en valores singulares con criterio de truncamiento. La segunda es una edición de parámetros neutra en parámetros, que reinserta componentes para compensar el daño funcional introducido por la compresión: 25.893.632 parámetros reinsertados (0,40 % de los parámetros de proyección densos), con expulsión ordenada por sigma y valor de inserción escalado a 0,2.

El elemento técnico diferenciador es la regla de selección de componentes `disc_iter`, que decide qué componentes se restauran en cada ronda. El presupuesto total del experimento es del 1,0 % de los parámetros densos, repartido en cinco rondas de 0,2 % cada una; este checkpoint es la ronda 2, con semilla 42. La model card no documenta la composición del dataset de entrenamiento del modelo base (más allá de remitir a Llama 2), ni fases de RLHF o DPO aplicadas a este artefacto concreto, ni datos sobre el corpus utilizado durante la compresión o la edición.

## Capacidades

- Generación de texto conversacional en formato chat, heredada de Llama-2-7b-chat, pero degradada por la eliminación del 40,02 % de los parámetros densos.
- Razonamiento, generación de código y matemáticas: capacidad nominal del modelo base, sin métricas publicadas para este checkpoint.
- Tool calling / function calling: no soportado de forma nativa por Llama 2 chat y no se documenta ninguna plantilla de herramientas en este repositorio.
- Agentes y razonamiento multi-paso: no documentado ni soportado por plantillas específicas.
- Capacidades multilingües: no declaradas; el modelo base está entrenado principalmente en inglés.
- Modo de razonamiento explícito (thinking mode), visión o audio: no disponibles.
- Capacidad específica de este artefacto: servir como sujeto de medida del impacto de la compresión SVD sobre la seguridad, con valores publicados de tasa de éxito de ataque (ASR) y de sobrerrechazo.
- Compatibilidad declarada con text-generation-inference y endpoints (tags `text-generation-inference` y `endpoints_compatible`).

## Casos de uso

- Estudio de la degradación de seguridad por compresión: el checkpoint permite medir cuánto aumenta la tasa de éxito de ataque al eliminar el 40,02 % de los parámetros, comparando su ASR de 0,1558 en AdvBench y 0,1470 en StrongREJECT con el del modelo sin comprimir.
- Evaluación comparativa de reglas de selección de componentes: al ser una celda de una rejilla sobre reglas (`disc_iter`) y presupuestos, sirve para contrastar qué criterio de restauración repara mejor la seguridad con el mismo coste de parámetros.
- Calibración de jueces automáticos de seguridad: sus salidas pueden usarse para validar el comportamiento del juez HarmBench y del clasificador WildGuard sobre modelos comprimidos con perfiles de rechazo alterados.
- Análisis de interpretabilidad de circuitos de seguridad: los 2.404 componentes restaurados y los 2.404 expulsados constituyen un conjunto identificable sobre el que estudiar qué pesos concretos sostienen el comportamiento de rechazo.
- Auditoría de sobrerrechazo: el valor de macro over-refusal de 0,1206 medido con WildGuard permite estudiar el equilibrio entre seguridad y utilidad tras la edición.
- Estudio de métodos de compresión eficiente: sirve como referencia intermedia (ronda 2 de 5) para trazar la curva de recuperación de capacidad a lo largo de rondas sucesivas de edición.
- Red-teaming controlado en laboratorio: al ser un artefacto con seguridad degradada conocido, es adecuado para probar pipelines de detección y mitigación en un entorno aislado, nunca expuesto a usuarios finales.
- Validación de reproducibilidad de SVD-LLM: la semilla 42 y los recuentos de componentes documentados permiten replicar el experimento y verificar la estabilidad del método.

## Benchmarks y rendimiento

| Benchmark | Metrica | Este checkpoint | Modelo base | Notas |
|---|---|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,1558 | No disponible en la información proporcionada | Menor es mejor |
| StrongREJECT | ASR (juez HarmBench) | 0,1470 | No disponible en la información proporcionada | Menor es mejor |
| WildGuard | Macro over-refusal | 0,1206 | No disponible en la información proporcionada | Menor es mejor |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en FP16/BF16: aproximadamente 13,5 GB solo de pesos, más overhead de activaciones y caché KV; en la práctica, entre 15 y 17 GB para secuencias de contexto largo.
- VRAM en cuantización INT8: aproximadamente 7 GB de pesos; en INT4, alrededor de 3,5 a 4 GB.
- GPU recomendadas para FP16: NVIDIA A100 (40 o 80 GB), H100, L40S y RTX 4090 (24 GB). Cabe en una RTX 3090 o RTX 4090 sin cuantizar, con margen limitado para lotes grandes.
- GPU de consumo: en INT8 o INT4 cabe en RTX 4070 (12 GB), RTX 3060 (12 GB) y RTX 4060 Ti (8 GB en INT4); en FP16 requiere al menos 16 GB de VRAM.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference y endpoints compatibles según los tags del repositorio, además de vLLM. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que no se publica en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento en seguridad | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_remove40_swapdisc_a020_c002_b010_r02 | 6,74 mil millones | 4096 tokens | Llama 2 Community License | AdvBench ASR 0,1558; StrongREJECT ASR 0,1470; over-refusal 0,1206 | HuggingFace (0 descargas, 0 likes) |
| meta-llama/Llama-2-7b-chat-hf | 6,74 mil millones | 4096 tokens | Llama 2 Community License | No disponible en la información proporcionada | HuggingFace (modelo base oficial) |
| meta-llama/Llama-2-13b-chat-hf | 13 mil millones | 4096 tokens | Llama 2 Community License | No disponible en la información proporcionada | HuggingFace (modelo base oficial) |
| Mistral-7B-Instruct-v0.1 | 7,24 mil millones | 8192 tokens | Apache 2.0 | No disponible en la información proporcionada | HuggingFace, pesos y cuantizaciones ampliamente disponibles |

Las cifras de parámetros y contexto de los modelos alternativos son especificaciones conocidas de sus respectivos modelos base; no se dispone de resultados de benchmark comparables para este checkpoint frente a ellos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: la model card lo describe explícitamente como artefacto de investigación y advierte de que no debe desplegarse como asistente.
- Seguridad degradada de forma deliberada: varias celdas de la rejilla experimental están degradadas en seguridad respecto a Llama-2-7b-chat, y la propia compresión eleva la tasa de éxito de ataque. Los valores publicados (ASR de 0,1558 y 0,1470) deben leerse como parte del fenómeno estudiado, no como un nivel de seguridad aceptable.
- Riesgo elevado de alucinación y de degradación de coherencia: no se han publicado métricas de capacidad general que permitan acotar la pérdida de calidad respecto al modelo sin comprimir.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base Llama 2, entrenado principalmente en inglés.
- Limitación idiomática: no se declaran idiomas soportados; el rendimiento fuera del inglés no está caracterizado.
- Restricciones de licencia: se aplica la Llama 2 Community License y la política de uso aceptable (USE_POLICY.md) incluida en el repositorio. Cualquier uso comercial queda sujeto a esas condiciones, incluida la cláusula de escala de usuarios activos mensuales de la licencia de Llama 2.
- Estado del experimento: corresponde a la ronda 2 de 5, con semilla 42, por lo que es un punto intermedio y no representa el resultado final de la ejecución.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- Para producción sería imprescindible una evaluación propia de seguridad y utilidad antes de extraer cualquier conclusión, tal como indica el propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapdisc_a020_c002_b010_r02
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper de Llama 2: https://arxiv.org/abs/2307.09288
- Método de compresión SVD-LLM citado en la model card: https://arxiv.org/abs/2405.17898
- Juez de evaluación HarmBench: https://arxiv.org/abs/2402.04249
- Benchmark StrongREJECT: https://arxiv.org/abs/2402.10260
- Clasificador WildGuard: https://arxiv.org/abs/2406.18495

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre su autor; los enlaces anteriores corresponden a la página de HuggingFace y a las referencias de los métodos y benchmarks citados en la propia model card.
