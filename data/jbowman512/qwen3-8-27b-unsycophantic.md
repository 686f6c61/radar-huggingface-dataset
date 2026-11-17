# jbowman512/Qwen3.8-27B-unsycophantic

## Resumen

Qwen3.8-27B-unsycophantic es una variante modificada del modelo Qwen3.8-27B de Alibaba Qwen, publicada por el usuario jbowman512. Se trata de un ajuste fino orientado a reducir el comportamiento servil (sycophancy) del modelo base, es decir, la tendencia a dar la razón al usuario o a validar sus afirmaciones aunque sean incorrectas. La modificacion se ha realizado con la herramienta Heretic v2.1.0, que aplica una tecnica de ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre capas concretas del transformer.

El modelo base Qwen3.8-27B es un modelo denso de 27.000 millones de parametros con arquitectura hibrida que combina Gated DeltaNet (atencion lineal) y Gated Attention clasica, con un codificador de vision nativo que le permite procesar imagenes y videos. Cuenta con 64 capas, una dimension oculta de 5120 y una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.000.000. El autor del ajuste mantiene la licencia Apache 2.0 del modelo original y publica los parametros exactos de la ablacion junto con un directorio de reproduccion, lo que permite replicar el proceso.

La relevancia de esta variante radica en su enfoque reproducible y medible: segun la model card, el modelo original mostraba respuestas con sycophancy en 63 de 78 casos de prueba, mientras que esta version reduce esa cifra a 0 de 78, con una divergencia KL de solo 0,0041 respecto al modelo base. Es un ejemplo practico de como aplicar tecnicas de edicion de pesos para corregir sesgos de comportamiento sin reentrenar el modelo desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de vision; hibrida Gated DeltaNet + Gated Attention |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida de 64 capas con un patron repetido de 16 bloques, cada uno compuesto por tres subcapas de Gated DeltaNet seguidas de una subcapa de Gated Attention. La Gated DeltaNet utiliza 48 cabezas de atencion lineal para V y 16 para QK, con dimension de cabeza 128; la Gated Attention clasica usa 24 cabezas para Q y 4 para KV, con dimension de cabeza 256 y RoPE de dimension 64. La red feed-forward tiene una dimension intermedia de 17.408 y el embedding de tokens es de 248.320 entradas (con padding). Incluye un modulo de Multi-Token Prediction (MTP) entrenado con multiples pasos, lo que habilita decodificacion especulativa nativa. El modelo incorpora un codificador de vision para entrada image-text-to-text.

El ajuste especifico de esta variante aplica Arbitrary-Rank Ablation sobre las capas 32 a 50 (indices start_layer_index=32, end_layer_index=50), con un peso de preservacion de comportamiento bueno de 0,2280, un peso de correccion de comportamiento malo de 0,0001, un peso relativo de sobrecorreccion de 0,9142 y un neighbor_count de 15. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en el modelo base, mas alla de que Qwen indica que el modelo ha pasado por pre-entrenamiento y post-entrenamiento.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento (thinking mode) activado por defecto, desactivable por peticion y con profundidad de razonamiento ajustable mediante `reasoning_effort`.
- Razonamiento multi-paso y tareas agenticas de horizonte largo, con planificacion autonoma y manejo de retroalimentacion del entorno.
- Comprension de imagenes y videos de forma nativa (image-text-to-text), incluyendo diagramas STEM, documentos y videos de hasta una hora de duracion.
- Generacion y comprension de codigo, con soporte para tareas de trabajo profesional e investigacion.
- Retencion de contexto de razonamiento de mensajes historicos mediante `preserve_thinking`.
- Compatibilidad con harnesses y herramientas de desarrollo populares (segun la model card del modelo base).
- Capacidades multilingues: no se detallan idiomas concretos en la informacion disponible.
- Soporte de tool calling / function calling: no se detalla explicitamente en la informacion proporcionada, aunque la model card menciona herramientas integradas en la version alojada en Qwen Cloud.

## Casos de uso

- Evaluacion de robustez frente a sesgo de complacencia: el modelo permite comparar directamente el comportamiento del original y el ajustado sobre el mismo conjunto de 78 prompts, util para investigar sycophancy en LLM con una metrica objetiva (0/78 frente a 63/78) y una divergencia KL controlada.
- Asistentes de analisis critico: en entornos donde el usuario necesita que el modelo senale errores en sus premisas (revision de codigo, auditoria de documentos, correccion de razonamientos), la reduccion de sycophancy evita validaciones incorrectas.
- Atencion al cliente tecnica: con 262.144 tokens de contexto nativo puede gestionar conversaciones multi-turno largas y mantener coherencia sin ceder ante afirmaciones erroneas del cliente.
- Procesamiento de documentos con vision: al ser un modelo nativo image-text-to-text, puede extraer y razonar sobre diagramas, tablas e imagenes en flujos de trabajo documentales, combinando comprension visual y contexto largo.
- Analisis de video de larga duracion: la capacidad de entender videos de hasta una hora permite aplicaciones de resumen y extraccion de informacion en grabaciones de reuniones o material formativo.
- Pipelines de agentes autonomos: el modelo base esta disenado para tareas agenticas de horizonte largo con manejo de feedback del entorno, adecuado para automatizacion de flujos multi-paso en desarrollo y operaciones.
- Despliegue en infraestructura propia: al publicarse en safetensors y ser compatible con Transformers, vLLM y SGLang, puede integrarse en stacks existentes sin depender de APIs externas.

## Benchmarks y rendimiento

La model card del ajuste proporciona dos metricas comparativas frente al modelo original:

| Metrica | Este modelo | Qwen3.8-27B original |
|---|---|---|
| Respuestas con sycophancy | 0/78 | 63/78 |
| Divergencia KL | 0,0041 | 0 (por definicion) |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para esta variante. La model card del modelo base incluye tablas de rendimiento en texto, pero los datos numericos no estan completos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 54,7 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 80 GB para contexto largo.
- Cuantizacion a 8 bits: en torno a 28-30 GB de VRAM, viable en una A100 40 GB o H100.
- Cuantizacion a 4 bits: en torno a 15-17 GB, potencialmente viable en GPUs consumer de gama alta como RTX 4090 (24 GB) o RTX 3090, con contexto reducido.
- GPU recomendadas: A100 80 GB, H100 80 GB para precision completa y contexto largo; A100 40 GB o L40S para 8 bits; RTX 4090/3090 para cuantizaciones agresivas.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed segun la model card del modelo base; no se confirma soporte de llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-unsycophantic | 27,36 B | 262.144 (ext. 1M) | Apache 2.0 | Variante con sycophancy reducida via ARA; vision nativa |
| Qwen3.8-27B (original) | 27 B | 262.144 (ext. 1M) | Apache 2.0 | Modelo base; 63/78 respuestas con sycophancy en el test del autor |
| Qwen3.6-27B | no disponible | no disponible | no disponible | Generacion anterior de la familia Qwen; aparece como referencia en la model card del base |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | Modelo de la familia Qwen citado como comparacion en la model card del base |

No se dispone de datos de rendimiento comparativo (benchmarks estandar) entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- El ajuste se ha validado sobre un conjunto de solo 78 prompts; la generalizacion de la reduccion de sycophancy a otros dominios e idiomas no esta demostrada.
- La ablacion puede alterar comportamientos no relacionados con la sycophancy; la divergencia KL de 0,0041 es baja pero no nula, y no se documentan evaluaciones de regresion en otras capacidades.
- Riesgo de alucinacion inherente al modelo base; la reduccion de complacencia no elimina la generacion de contenido falso.
- Idiomas soportados no documentados en la informacion disponible; no se puede confirmar el rendimiento en castellano.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el autor no documenta terminos adicionales ni garantias; conviene revisar la licencia del modelo base Qwen3.8-27B.
- El repositorio ocupa 54,8 GB, lo que requiere almacenamiento y ancho de banda considerables para su descarga.
- La fecha de creacion indicada (2026-11-17) y la denominacion del modelo base deben verificarse en el repositorio original antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jbowman512/Qwen3.8-27B-unsycophantic
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de edicion): https://heretic-project.org
- Qwen Cloud (servicio alojado del modelo base): https://www.qwencloud.com
- Overview de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
