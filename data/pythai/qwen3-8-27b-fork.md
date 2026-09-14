# PYTHAI/Qwen3.8-27B-fork

## Resumen

PYTHAI/Qwen3.8-27B-fork es un repositorio derivado de Qwen/Qwen3.8-27B, el modelo denso multimodal de la familia Qwen3.8, que combina un codificador de visión con un modelo de lenguaje causal de 27.000 millones de parámetros. Se trata de un "licence-locked pointer fork": no almacena pesos (el repositorio ocupa 0,0 GB), sino únicamente la licencia, la configuracion, el tokenizer y el codigo del commit exacto `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del modelo original, con digests SHA-256 registrados en `FORK.json`. Los 18 archivos de pesos (55,6 GB) permanecen en el repositorio de origen.

El objetivo del fork es de trazabilidad y cumplimiento: fija una revision concreta del modelo upstream para que la licencia y el estado del arte aplicables queden inmutables, y obliga a cargar los pesos desde el origen con la revision fijada. Para el usuario practico, el modelo util es el upstream Qwen3.8-27B: un transformer hibrido con capas de atencion lineal Gated DeltaNet intercaladas con atencion con compuerta (Gated Attention), contexto nativo de 262.144 tokens extensible a 1.000.000, y prediccion multi-token (MTP) entrenada con varios pasos.

Es relevante ahora porque condensa en un modelo denso y desplegable capacidades que antes exigian modelos mayores: comprension nativa de imagen y video (incluidos videos de escala horaria), ejecucion agentica de horizonte largo, control flexible de razonamiento (`reasoning_effort`, `preserve_thinking`) y compatibilidad declarada con Transformers, vLLM, SGLang y TokenSpeed. Su licencia Apache 2.0 facilita la integracion comercial, aunque la informacion disponible no incluye datos de benchmarks numericos ni lista de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con codificador de vision; bloques con Gated DeltaNet (atencion lineal) y Gated Attention con compuerta, en disposicion 16 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN)) |
| Parametros totales | 27B |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 tokens |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas para este modelo en la informacion proporcionada) |
| Idiomas soportados | no disponible (los metadatos del repositorio no declaran idiomas) |
| Licencia | Apache 2.0 (heredada del LICENSE del commit upstream fijado) |
| Formato de pesos | safetensors (18 archivos, 55,6 GB) en el repositorio de origen; este fork no almacena pesos |
| Dimension oculta | 5120 |
| Numero de capas | 64 |
| Token embedding / LM output | 248.320 (con padding) |
| Gated DeltaNet | 48 cabezas de atencion lineal para V y 16 para QK; dimension de cabeza 128 |
| Gated Attention | 24 cabezas para Q y 4 para KV; dimension de cabeza 256; dimension de RoPE 64 |
| FFN | Dimension intermedia 17.408 |
| MTP | Entrenado con multiples pasos (Multi-Token Prediction) |
| Tipo de modelo | Modelo de lenguaje causal con codificador de vision (pre-entrenamiento + post-entrenamiento) |
| Compatibilidad declarada | Transformers, vLLM, SGLang, TokenSpeed |
| Repositorio | Fork de solo punteros; repositorio 0,0 GB, 0 descargas, 0 likes, creado el 2026-09-13 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal hibrido con codificador de vision. El cuerpo del modelo se organiza en 16 bloques repetidos, cada uno con tres subcapas de Gated DeltaNet (atencion lineal con estado recurrente) seguidas de una subcapa de Gated Attention convencional, cada una emparejada con su FFN de dimension intermedia 17.408. Las capas de atencion lineal usan 48 cabezas para V y 16 para QK con dimension de cabeza 128, mientras que las capas de atencion con compuerta emplean 24 cabezas para Q y 4 para KV con dimension de cabeza 256 (GQA) y RoPE de dimension 64. Esta mezcla 3:1 reduce el coste del cache de clave-valor, que solo crece en las 16 capas de atencion con compuerta. La dimension oculta es 5120, el vocabulario (con padding) es de 248.320 entradas y el modelo incorpora prediccion multi-token (MTP) entrenada con varios pasos, lo que habilita decodificacion especulativa nativa.

El modelo ha pasado por fases de pre-entrenamiento y post-entrenamiento, con soporte nativo de vision y video. El control de razonamiento es configurable por peticion: el modo de pensamiento esta activado por defecto, puede desactivarse, la profundidad de razonamiento se ajusta con `reasoning_effort` y el contexto de razonamiento de mensajes historicos se conserva mediante `preserve_thinking`. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento activado por defecto y control de profundidad (`reasoning_effort`).
- Comprension nativa de imagen y video, incluidos diagramas STEM, documentos y videos de escala horaria.
- Codigo y trabajo profesional, con mejoras declaradas por el autor en tareas de programacion, investigacion y trabajo profesional.
- Ejecucion agentica de horizonte largo: planificacion autonoma y manejo de retroalimentacion del entorno para completar tareas de extremo a extremo.
- Soporte declarado de harnesses y herramientas de desarrollo habituales para integracion en stacks existentes (detalle concreto no disponible).
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Prediccion multi-token (MTP) entrenada con varios pasos, utilizable para decodificacion especulativa.
- Contexto largo: 262.144 tokens nativos, extensible a 1.000.000.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con vLLM, SGLang y TokenSpeed.

## Casos de uso

- Analisis de documentos tecnicos con diagramas: el modelo puede recibir PDF convertido a imagen o capturas de planos, esquemas y tablas, y responder preguntas sobre ellos combinando el codificador de vision con razonamiento en modo pensamiento. La ventana de 262.144 tokens permite procesar informes completos en una sola pasada.
- Revision de codigo en pipelines de CI/CD: dado un diff y el contexto del repositorio, el modelo puede generar comentarios de revision y explicaciones de fallos. Su contexto largo evita trocear el arbol de ficheros relevante, y la prediccion multi-token reduce la latencia de generacion.
- Agentes autonomos de varias etapas: con planificacion reforzada y manejo de retroalimentacion del entorno, encaja en bucles de tipo ReAct donde el modelo decide herramientas, interpreta resultados y corrige el plan. Requiere implementar el bucle de tool calling en el orquestador, ya que la informacion disponible no detalla el formato de herramientas nativo.
- Atencion al cliente automatizada multi-turno: el contexto de 262.144 tokens permite arrastrar el historial completo de una incidencia larga, y `preserve_thinking` conserva el hilo de razonamiento entre mensajes para mantener coherencia en conversaciones extensas.
- Analisis de video para monitorizacion o investigacion: al soportar videos de escala horaria, permite resumir sesiones, extraer eventos con marca temporal o localizar momentos concretos describiendo la escena en lenguaje natural.
- Asistencia a investigacion y redaccion tecnica: sintesis de literatura cientifica a partir de figuras, tablas y texto, con razonamiento explicito activable cuando se requiere trazabilidad del proceso.
- Procesamiento por lotes de corpus largos: clasificacion, extraccion estructurada y resumen de expedientes completos en un unico contexto, desplegando el modelo con vLLM o SGLang para aprovechar el batching continuo.
- Migracion de herramientas internas a modelos abiertos: al ser Apache 2.0 y compatible con vLLM y SGLang, puede sustituir APIs propietarias en flujos de generacion de codigo o extraccion de datos sin cambiar la infraestructura de servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card upstream anuncia una tabla de rendimiento en texto que compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los valores numericos no estan presentes en el material proporcionado (la tabla aparece truncada), por lo que no se reproducen.

## Requisitos de hardware

- VRAM en BF16/FP16: aproximadamente 54 GB solo para pesos (27B x 2 bytes), mas cache de clave-valor; en la practica requiere GPU de 80 GB (A100 80 GB, H100 80 GB) o tensor parallelism sobre varias GPU.
- VRAM en 8 bits: aproximadamente 27-30 GB de pesos, ajustable en una A100 40 GB o en una RTX 5090 de 32 GB, con margen limitado para contexto largo.
- VRAM en 4 bits: aproximadamente 14-16 GB de pesos; cabe en RTX 4090, RTX 3090 o RTX 5090 para contextos moderados, siempre que exista una cuantizacion publicada (no documentada en la informacion disponible).
- Cache de clave-valor (estimacion propia a partir de la arquitectura, no dato oficial): 4 cabezas KV x 256 dimensiones x 2 (K y V) x 16 capas de atencion con compuerta x 2 bytes = 64 KiB por token. A 262.144 tokens supone unos 16 GiB; a 1.000.000 de tokens, unos 64 GiB. Las capas Gated DeltaNet mantienen estado recurrente y no incrementan el cache con la longitud.
- Contexto de 1.000.000 tokens: inviable en una sola GPU consumer; exige tensor parallelism, cuantizacion del cache KV o decodificacion por fases.
- GPU recomendadas: H100 80 GB o A100 80 GB para BF16 con contexto largo; A100 40 GB o RTX 5090 para 8 bits; RTX 4090/3090 24 GB para cuantizaciones de 4 bits con contexto reducido.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed segun la model card upstream. No se mencionan integraciones con llama.cpp u Ollama, ni pesos GGUF publicados.
- Latencia y throughput: no disponible (no se aportan mediciones).
- Nota de despliegue: este fork no contiene pesos; hay que cargar el modelo desde el repositorio de origen fijando la revision (`AutoModel.from_pretrained("Qwen/Qwen3.8-27B", revision="1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0", trust_remote_code=True)`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| PYTHAI/Qwen3.8-27B-fork | 27B (heredados del upstream) | 262.144 nativos / 1.000.000 extensibles (heredados) | Apache 2.0 | No almacena pesos; solo licencia, configuracion, tokenizer y codigo |
| Qwen/Qwen3.8-27B (upstream) | 27B denso con codificador de vision | 262.144 nativos / 1.000.000 extensibles | Apache 2.0 | 18 archivos safetensors, 55,6 GB |
| Qwen3.6-27B | no disponible | no disponible | no disponible | Referenciado en los benchmarks upstream; especificaciones no disponibles |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | Referenciado en los benchmarks upstream; especificaciones no disponibles |
| Muse Glimmer-30B | no disponible | no disponible | no disponible | Referenciado en los benchmarks upstream; especificaciones no disponibles |

No se dispone de datos de rendimiento comparado (parametros equivalentes efectivos, MMLU, HumanEval, GSM8K u otros) para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Este repositorio no contiene pesos: es un puntero con licencia, configuracion, tokenizer y codigo. Intentar cargarlo como si fuese un modelo completo fallara o requerira apuntar al repositorio de origen.
- Sin historial de uso: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la integridad mas alla de los digests SHA-256 de `FORK.json`.
- Riesgo de alucinacion no cuantificado: no hay benchmarks publicados en la informacion disponible que permitan estimar la tasa de error en tareas factuales, matematicas o de codigo.
- Idiomas no declarados: no se especifica cobertura multilingue, por lo que el rendimiento en castellano no esta documentado.
- Restricciones de licencia: los derechos y obligaciones son los del LICENSE del commit upstream fijado (Apache 2.0). Cualquier cambio posterior del upstream no se refleja en este fork; hay que verificar la licencia vigente del commit concreto antes de un uso comercial.
- Dependencia del codigo remoto: la carga recomendada usa `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio de origen; conviene auditar ese codigo o fijar la revision exacta en entornos de produccion.
- Coste de contexto: 262.144 tokens nativos implican un cache KV estimado de decimoseis GiB en BF16, y el millon de tokens anunciado exige infraestructura distribuida.
- Cuantizaciones no documentadas: no se listan pesos GGUF, AWQ, GPTQ ni FP8 publicados, lo que condiciona el despliegue en hardware consumer.
- Diferencias entre el modelo abierto y el servicio gestionado: la version alojada en Qwen Cloud se anuncia con 1M de contexto por defecto y herramientas integradas, caracteristicas que no necesariamente estan disponibles en los pesos abiertos y cuyo lanzamiento figura como "coming soon".
- Ausencia de herramientas nativas documentadas: aunque se mencionan agentes y compatibilidad con harnesses, la informacion disponible no detalla el esquema de function calling ni los formatos de prompt; habria que consultar la documentacion del modelo upstream.

## Enlaces

- Repositorio del fork: https://huggingface.co/PYTHAI/Qwen3.8-27B-fork
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Revision fijada del modelo base: `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`
- Manifiesto de digests: https://huggingface.co/PYTHAI/Qwen3.8-27B-fork/blob/main/FORK.json
- Servicio gestionado Qwen Cloud: https://www.qwencloud.com
- Ficha de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Busqueda web: no se han encontrado enlaces relevantes adicionales (los resultados devueltos corresponden a paginas genericas de YouTube, sin relacion con el modelo).
