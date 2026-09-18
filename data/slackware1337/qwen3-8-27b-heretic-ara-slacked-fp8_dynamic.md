# Slackware1337/Qwen3.8-27B-Heretic-ARA-Slacked-FP8_DYNAMIC

## Resumen

Slackware1337/Qwen3.8-27B-Heretic-ARA-Slacked-FP8_DYNAMIC es una version modificada del modelo denso Qwen/Qwen3.8-27B, publicada por el usuario Slackware1337. Sobre el checkpoint original se han aplicado dos transformaciones encadenadas: una abliteracion mediante el metodo ARA (Arbitrary-Rank Ablation) de Heretic, que elimina la direccion de rechazo en el espacio de activaciones, y una cuantizacion FP8 W8A8 en formato compressed-tensors que afecta unicamente a las matrices de proyeccion bidimensionales del modelo de lenguaje.

El modelo base es un transformer hibrido con vision encoder de 27.781.427.952 parametros (27,78B), 64 capas y una disposicion interna que alterna bloques de Gated DeltaNet (atencion lineal) con bloques de Gated Attention clasica, siguiendo el esquema 16 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN)). La longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000, e incorpora modo de razonamiento configurable, comprension nativa de imagen y video y prediccion multi-token (MTP).

La relevancia de este checkpoint es doble. Por un lado, ejemplifica el flujo de trabajo de abliteracion con cuantizacion selectiva: solo se cuantizan las matrices 2-D, dejando en BF16 los embeddings, el lm_head, los parametros de normalizacion y state-space, las Conv1D de la atencion lineal, la torre de vision y el modulo MTP. Por otro, el autor reporta una reduccion de rechazos de 99/100 a 3/100 con una divergencia KL de 0,0599 respecto al modelo original. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido causal con vision encoder: bloques Gated DeltaNet (atencion lineal) y Gated Attention. Layout 16 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN)) |
| Parametros totales | 27.781.427.952 (27,78B), segun safetensors |
| Parametros activos | No aplica: modelo denso, sin mezcla de expertos |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | FP8 W8A8 (compressed-tensors) en matrices de proyeccion 2-D del LM. En BF16: embeddings, lm_head, parametros de normalizacion/state-space, linear_attn.conv1d, torre de vision y modelo MTP/NextN |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors); no se publican artefactos GGUF |
| Dimension oculta | 5120 |
| Capas | 64 |
| Cabezas de atencion (Gated Attention) | 24 para Q, 4 para KV; head dim 256; RoPE dim 64 |
| Cabezas de atencion lineal (Gated DeltaNet) | 48 para V, 16 para QK; head dim 128 |
| Dimension intermedia FFN | 17.408 |
| Vocabulario | 248.320 (padded) |
| Tamano del repositorio | 31,2 GB |
| Autor | Slackware1337 |
| Fecha de creacion | 18 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer causal hibrido que combina atencion lineal y atencion completa. Cada uno de los 16 bloques repite tres subcapas de Gated DeltaNet seguidas de una subcapa de Gated Attention, cada una con su FFN asociada (dimension intermedia 17.408, 64 capas en total). Gated DeltaNet emplea 48 cabezas lineales para V y 16 para QK con dimension 128, mientras que Gated Attention usa 24 cabezas de consulta y 4 de clave/valor con dimension 256 y RoPE de 64 dimensiones. El modelo integra un vision encoder nativo para imagen y video, un modulo MTP (Multi-Token Prediction) entrenado con varios pasos y un vocabulario de 248.320 entradas.

Sobre el checkpoint post-entrenado se aplico primero la abliteracion ARA de Heretic, con los parametros declarados: start_layer_index 0, end_layer_index 61, preserve_good_behavior_weight 0,4487, steer_bad_behavior_weight 0,0005, overcorrect_relative_weight 1,1383 y neighbor_count 7. Segun el autor, fueron necesarias varias rondas de entrenamiento para cubrir la variedad de formulaciones de rechazo y redireccion del modelo, incluyendo cambios de registro idiomatico (el autor menciona el paso a un ingles tipo "grug" en ciertos prompts). Despues se aplico la cuantizacion FP8 con un cuantizador "model-free" restringido explicitamente a matrices 2-D, para evitar tocar los kernels Conv1D tridimensionales de la atencion lineal. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, activado por defecto y desactivable por peticion; la profundidad de razonamiento se ajusta con `reasoning_effort` y el contexto de razonamiento de mensajes previos se conserva con `preserve_thinking`.
- Codigo y trabajo profesional: la model card del base declara mejoras en coding, tareas profesionales y de investigacion respecto a las generaciones Qwen3.5 y Qwen3.6.
- Tareas agenciales de horizonte largo: planificacion autonoma y gestion de retroalimentacion del entorno orientadas a completar tareas de extremo a extremo.
- Comprension de vision y lenguaje: soporte nativo de imagen y video, desde diagramas STEM y documentos hasta videos de duracion de horas.
- Prediccion multi-token (MTP) entrenada con varios pasos, util para decodificacion especulativa.
- Compatibilidad con harnesses y herramientas de desarrollo populares, segun la model card del modelo base. No se detalla en la informacion disponible el soporte concreto de tool calling o function calling.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Efecto de la abliteracion: reduccion de rechazos de 99/100 a 3/100 en la evaluacion del autor, a costa de una divergencia KL de 0,0599 respecto al modelo original.

## Casos de uso

- Atencion al cliente automatizada: los 262.144 tokens de contexto nativos permiten mantener historiales de conversacion multi-turno muy largos y documentacion de producto adjunta sin truncar, y el modo thinking desactivable reduce latencia en respuestas simples.
- Agentes de automatizacion de oficina: el modelo puede encadenar tareas de varios pasos sobre herramientas y entornos, con la planificacion autonoma y el manejo de feedback del entorno que declara la model card del base.
- Analisis de documentacion tecnica escaneada: la torre de vision permite procesar diagramas STEM, planos y documentos maquetados sin pipeline OCR externo, extrayendo texto y estructura en una sola pasada.
- Procesamiento de video de larga duracion: la comprension nativa de video y el contexto extensible hasta 1.000.000 de tokens permiten resumir o indexar grabaciones de horas.
- Generacion y revision de codigo en pipelines internos: el modelo base declara mejoras en coding y compatibilidad con harnesses de desarrollo, por lo que puede integrarse en revision de pull requests o generacion de tests.
- Investigacion sobre alineacion y seguridad: al ser un checkpoint abliterado con metricas publicas de rechazos y divergencia KL, sirve como material de estudio comparativo frente al modelo original alineado.
- Despliegue de bajo coste en FP8: la cuantizacion W8A8 reduce el peso a aproximadamente 31,2 GB de repositorio, lo que abarata el servicio en GPUs de 48 GB frente a una ejecucion en BF16.
- Sistemas de razonamiento con presupuesto de computo variable: `reasoning_effort` y `preserve_thinking` permiten asignar mas o menos tokens de razonamiento segun la criticidad de la consulta.

## Benchmarks y rendimiento

La model card del modelo base incluye tablas comparativas frente a Qwen3.6-27B, pero los valores numericos no estaban presentes en la informacion proporcionada, por lo que no se reproducen. Los unicos datos numericos disponibles son los de la evaluacion de la abliteracion realizada por el autor:

| Metrica | Este modelo | Modelo original (Qwen/Qwen3.8-27B) |
|---|---|---|
| Divergencia KL | 0,0599 | 0 (por definicion) |
| Rechazos (refusals) | 3/100 | 99/100 |

No se han publicado resultados de benchmarks de conocimiento, codigo o matematicas en la informacion disponible.

## Requisitos de hardware

- Pesos en el formato publicado (FP8 W8A8 mixto con BF16 en embeddings, lm_head, norma/state-space, conv1d, torre de vision y MTP): aproximadamente 31,2 GB, coherente con el tamano del repositorio.
- VRAM estimada para inferencia en el formato publicado: del orden de 34 a 40 GB, sumando pesos, activaciones y cache. Cabe en A100 40 GB con margen ajustado, L40S 48 GB, RTX 6000 Ada 48 GB, H100 80 GB y A100 80 GB.
- VRAM estimada en BF16 completo (sin la cuantizacion FP8): aproximadamente 55,6 GB solo de pesos, lo que exige A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- Cache KV: estimacion a partir de la arquitectura declarada, unos 64 KB por token en FP16 (16 capas de Gated Attention, 4 cabezas KV, head dim 256), es decir, del orden de 8,4 GB para 131.072 tokens. Las capas Gated DeltaNet mantienen estado de tamano constante, por lo que no escalan con la longitud del contexto.
- GPU de consumo: no cabe sin cuantizacion adicional o offloading en una RTX 4090 de 24 GB. No se han publicado artefactos GGUF ni cuantizaciones de 4 bits en el repositorio.
- Opciones de despliegue: la model card del base cita compatibilidad con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. El formato compressed-tensors es compatible con vLLM. No se confirma soporte de llama.cpp u Ollama para este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Alineacion | Disponibilidad |
|---|---|---|---|---|---|
| Slackware1337/Qwen3.8-27B-Heretic-ARA-Slacked-FP8_DYNAMIC | 27,78B | 262.144 nativos, hasta 1.000.000 | apache-2.0 | Abliterado (3/100 rechazos), FP8 W8A8 | 0 descargas, 0 likes |
| Qwen/Qwen3.8-27B | 27B | 262.144 nativos, hasta 1.000.000 | apache-2.0 | Alineado (99/100 rechazos) | Modelo base oficial |
| Qwen3.6-27B | No disponible | No disponible | No disponible | No disponible | Generacion anterior de la familia |

La comparativa con modelos de otros fabricantes del mismo rango de parametros no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteracion elimina deliberadamente el comportamiento de rechazo. Esto implica que el modelo puede generar contenido que el checkpoint original bloquearia. Es responsabilidad del desplegador aplicar filtros externos si el caso de uso lo requiere.
- La divergencia KL de 0,0599 respecto al original indica degradacion medible de la distribucion de salida, no solo la eliminacion de rechazos. Puede traducirse en perdida de calidad en tareas genericas.
- La evaluacion de rechazos (3/100 frente a 99/100) es una metrica del propio autor, sin protocolo detallado ni validacion externa.
- La cuantizacion FP8 W8A8 introduce un error adicional de cuantizacion sobre los pesos del modelo de lenguaje, acumulable con la degradacion de la abliteracion.
- El autor documenta cambios de registro idiomatico inducidos por la abliteracion, con el modelo pasando a un ingles simplificado ("grug") en ciertos prompts. Puede afectar a la coherencia estilistica en produccion.
- No hay datos publicos de descargas ni likes, lo que sugiere ausencia de validacion por parte de la comunidad.
- No se declara lista de idiomas soportados ni evaluaciones multilingues.
- El repositorio ocupa 31,2 GB, lo que complica su distribucion y su uso en entornos con almacenamiento limitado.
- Licencia apache-2.0: permite uso comercial, pero la modificacion subyacente (abliteracion) y sus consecuencias no estan cubiertas por ninguna garantia del autor. Conviene revisar tambien los terminos del modelo base de Qwen.
- Riesgo de alucinacion y de error en tareas de codigo o matematicas: no se han publicado benchmarks que permitan acotarlo.
- El modelo tiene vision encoder; la cuantizacion no afecta a la torre de vision, que se mantiene en BF16, por lo que los requisitos de VRAM de la parte multimodal son los del modelo completo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Slackware1337/Qwen3.8-27B-Heretic-ARA-Slacked-FP8_DYNAMIC
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Pagina de producto del modelo base (Qwen Cloud): https://www.qwencloud.com/models/qwen3.8-27b
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo ni sobre el metodo ARA de Heretic en los resultados de busqueda proporcionados; los enlaces devueltos correspondian a contenidos juridicos alemanes sin relacion con el modelo.
