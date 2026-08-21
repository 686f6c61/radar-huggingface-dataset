# ansulev/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16

## Resumen

Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 es un derivado "abliterado" (abliterated) del modelo Qwen3.8-27B de Alibaba, publicado por el usuario ansulev bajo el colectivo AEON-7. La abliteración es una técnica que elimina direcciones del espacio de activaciones asociadas al rechazo de peticiones, de modo que el modelo deja de negarse a responder a ciertas preguntas, manteniendo en lo posible la coherencia y la capacidad de razonamiento originales. A diferencia de otras abliteraciones que persiguen una divergencia KL minima, esta version optimiza la coherencia y la calidad de respuesta, aceptando un desplazamiento KL de 0,0991 nats/token como coste asumible.

El modelo hereda la arquitectura del Qwen3.8-27B: un transformador denso de 27.781 millones de parametros con atencion hibrida (16 capas con atencion completa y 48 con atencion lineal Gated DeltaNet), torre de vision intacta y cabezal de prediccion multi-token (MTP) para decodificacion especulativa. Soporta una ventana de contexto nativa de 262.144 tokens, extensible a 1M. Se publica en precision BF16 como borrador de acceso anticipado ("Early Access Draft"), con una version final (GA) en preparacion, y se distribuye bajo licencia Apache 2.0.

La relevancia de este lanzamiento reside en que ofrece un modelo de 27B parametros, multimodal y con tool calling, sin capa de rechazo, algo util para desarrolladores que necesitan respuestas directas en dominios donde la seguridad del modelo base introduce friccion (por ejemplo, escenarios de red teaming, analisis de contenido sensible o investigacion de jailbreak). No obstante, al ser un borrador no pulido, presenta artefactos conocidos en peticiones largas (bucles, repeticiones) que conviene conocer antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 16 capas con atencion completa + 48 capas con atencion lineal Gated DeltaNet, torre de vision, cabecera MTP |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1M |
| Tipos de cuantizacion | BF16 (pesos originales), EXL3 6,00 bpw (comunidad) |
| Idiomas soportados | ingles, chino, multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); cuantizaciones EXL3 disponibles en repos derivados |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B usa una arquitectura hibrida de atencion: de las 64 capas totales, 16 emplean atencion completa (full attention) y 48 emplean atencion lineal de tipo Gated DeltaNet (GDN), lo que reduce el coste cuadratico en contexto largo. Incorpora una torre de vision sin modificar (333/333 coincidencia de hash con el modelo base) que permite entrada de imagenes, y una cabecera MTP (multi-token prediction) que actua como borrador para decodificacion especulativa, acelerando la generacion cuando se usa con vLLM (metodo `mtp`, 3 tokens especulativos).

El proceso de abliteracion, desarrollado por AEON-7, elimina las direcciones de rechazo de la capa de refusal sin tocar la torre de vision ni la cabecera MTP. La divergencia KL medida es de 0,0991 nats/token (media sobre los 100 prompts inofensivos de validacion), con 29 de 97 aperturas por debajo de 0,001. El conjunto de entrenamiento/validacion usa una particion fija del dataset wangzhang (400 train / 100 eval) mas 50 prompts sexuales. No se han publicado detalles de datos de preentrenamiento ni de fases de RLHF, ya que se trata de un derivado post-entrenamiento, no de un modelo entrenado desde cero.

## Capacidades

- Generacion de texto y razonamiento: mantiene las capacidades de razonamiento paso a paso del Qwen3.8-27B, incluido el modo "thinking" (pensamiento visible en etiquetas `think`).
- Vision-language: acepta imagenes como entrada adicional al texto, gracias a la torre de vision sin modificar.
- Tool calling / function calling: compatible con la API de herramientas del modelo base.
- Decodificacion especulativa: uso de la cabecera MTP para acelerar la inferencia con vLLM.
- Multilingue: soporte de ingles y chino, ademas de capacidades multilingues generales.
- Sin rechazo: cero rechazos directos ("I won't") en los conjuntos de prueba de la model card (100 harmful, 50 sexual, 100 harmless).

## Casos de uso

- Red teaming y evaluacion de seguridad: el modelo permite probar prompt injection, jailbreaks y limites de alineacion sin el filtro de rechazo que introduce ruido en los resultados. Un equipo de seguridad puede usarlo para medir la eficacia de sus defensas comparando respuestas de un modelo alineado y de este derivado.
- Generacion de contenido de ficcion adulta: para estudios de narrativa erotica o ficcion explicita, el modelo responde sin evasivas ni disclaimers, algo que los modelos comerciales bloquean. Se puede integrar en pipelines de generacion de guiones o novelas con restricciones de edad.
- Analisis de contenido sensible: clasificacion y resumen de documentos con contenido delicado (informes de incidentes, transcripciones) donde un modelo censurado descarta o matiza la respuesta. El modelo devuelve el contenido completo, lo que agiliza el trabajo de analistas.
- Desarrollo de agentes conversacionales sin limitaciones: bots de rol o asistentes para nichos creativos que requieren respuestas directas sin moralinas. El soporte de tool calling permite conectar el modelo a APIs externas dentro del agente.
- Pruebas de coherencia tras abliteracion: para investigadores que estudian el efecto de eliminar capas de rechazo, este modelo sirve como caso de estudio con metricas publicadas (KL, longitud de respuesta, tipo-token ratio) y un conjunto de validacion fijo.
- Generacion de codigo en entornos de investigacion: aunque no es su foco principal, mantiene las capacidades de codigo del Qwen3.8-27B; su uso con contexto largo (262K) permite procesar repositorios enteros para tareas de refactorizacion o documentacion sin necesidad de chunking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos cuantitativos publicados corresponden a la evaluacion de rechazo y coherencia de la abliteracion, recogidos en la model card:

| Conjunto | n | Stock (rechazo) | AEON (rechazo) | Duros "no lo hare" | Comentario |
|---|---|---:|---:|---:|---|
| Harmful held-out | 100 | ~100 | 36 (smash 29) | 0 | 25/36 escribieron el contenido solicitado (con disclaimer o parcial); 6/36 sin PII real; 5/36 son compasion o dialogos sin payload |
| Sexual | 50 | 30 | 5 | 0 | 3 de 5 escribieron el contenido; 2 son evasivas |
| Harmless held-out | 100 | 3 | 1 | 0 | 1 R es un prompt truncado (id 416) |

Ademas, se reportan metricas de coherencia en los 97 prompts inofensivos que ambos modelos responden: longitud media de respuesta 1481 vs 1516 caracteres, type-token ratio 0,76 vs 0,75, y etiquetas `think` presentes en 100/100 vs 98/100. La divergencia KL de apertura es 0,0991 nats/token.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos BF16 ocupan 55,6 GB, por lo que se necesitan al menos 60-70 GB de VRAM para cargar el modelo en precision completa (H200 80GB, A100 80GB, o dos GPUs de 40GB).
- GPU recomendadas: NVIDIA H200 (usada para la validacion), A100 80GB, o RTX 4090 24GB solo si se usa una cuantizacion (por ejemplo, EXL3 6.00 bpw que reduce el peso a ~18 GB).
- En consumer GPU: no cabe en tarjetas de 24 GB en BF16; requiere cuantizacion a 4-6 bits para funcionar en una RTX 4090/3090.
- Opciones de despliegue: vLLM (validado con vLLM 0.27.1, torch 2.13.0+cu130), ExLlamaV3 (cuantizacion EXL3 disponible), llama.cpp/Ollama para cuantizaciones GGUF (no publicadas aun).
- Latencia y throughput: no hay datos publicados. El uso de MTP con 3 tokens especulativos reduce la latencia frente a decodificacion autoregresiva estandar, pero el rendimiento exacto depende del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Abliterado | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,78 B | 262K (1M ext) | Apache 2.0 | No | HuggingFace |
| Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 | 27,78 B | 262K (1M ext) | Apache 2.0 | Si | HuggingFace (draft) |
| Qwen3-32B (similar tamano, no abliterado) | 32 B | 128K | Apache 2.0 | No | HuggingFace |

No se dispone de datos de benchmarks comparativos entre este modelo y alternativas de la misma categoria (otros modelos abliterados de tamano similar). La comparativa se limita a caracteristicas estructurales y de licencia.

## Limitaciones y advertencias

- Borrador en acceso anticipado: el modelo es un "Early Access Draft", no una version final. La version GA con abliteracion mas quirurgica esta en desarrollo.
- Artefactos en contexto largo: en peticiones extremadamente largas, los gaps de pesos tras la abliteracion se acumulan y provocan bucles o frases repetidas en la parte final de la respuesta.
- Riesgo de alucinacion: al eliminar la capa de rechazo, el modelo puede generar contenido falso o inventado con mas confianza, sin el freno de la alineacion.
- Ausencia de salvaguardas: no hay filtros de seguridad; el modelo puede producir contenido ilegal, danino o explicito. Su uso en produccion requiere control de acceso y moderacion externa.
- Sesgos no mitigados: la abliteracion no corrige sesgos del modelo base; estos persisten y pueden exacerbarse al no haber restricciones de salida.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor avisa de que no se debe re-cuantizar el formato NVFP4 de futuras versiones.
- Compatibilidad de cuantizacion: la cuantizacion EXL3 existente es un derivado de la comunidad, no validada por el autor.

## Enlaces

- Modelo en HuggingFace (ansulev): https://huggingface.co/ansulev/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizacion EXL3 6.00bpw: https://huggingface.co/Jon-Nielsen/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16-exl3-6.00bpw
- Recetas vLLM del base: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Paper Gated DeltaNet (arxiv:2406.11717): https://arxiv.org/abs/2406.11717
- Paper Qwen3 (arXiv:2503.00555): https://arxiv.org/abs/2503.00555
- Blog sobre la abliteracion: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
