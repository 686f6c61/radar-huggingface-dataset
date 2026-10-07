# Build123ai/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal denso con encoder de vision, publicado en Hugging Face por el usuario Build123ai bajo licencia Apache 2.0. Segun la model card, forma parte de la familia Qwen3.8 y se presenta como la generacion mas capaz hasta la fecha dentro de los modelos abiertos de Qwen, construida sobre la base arquitectonica de Qwen3.5. El repositorio contiene pesos en formato Transformers (safetensors), con 27.781.427.952 parametros reales (aproximadamente 27,8 mil millones) y un tamano de repositorio de 55,6 GB.

El modelo es nativo en comprension de imagen y video (pipeline `image-text-to-text`) y esta orientado a tareas de codigo, trabajo profesional, investigacion y flujos agenticos de horizonte largo. Incorpora control flexible del modo de razonamiento (activado por defecto, desactivable por peticion), ajuste de la profundidad de razonamiento mediante `reasoning_effort` y retencion del contexto de razonamiento de mensajes historicos mediante `preserve_thinking`.

Su contexto nativo es de 262.144 tokens, extensible hasta 1.000.000. La arquitectura combina atencion lineal (Gated DeltaNet) con atencion clasica (Gated Attention) en un patron hibrido de 64 capas, e incorpora entrenamiento con Multi-Token Prediction (MTP). Es relevante ahora porque traslada capacidades de razonamiento y agenticas propias de modelos de mayor tamano a un formato denso desplegable, aunque la model card no detalla el volumen de tokens de entrenamiento ni la composicion del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de vision; hibrida: Gated DeltaNet (atencion lineal) y Gated Attention |
| Parametros totales | 27.781.427.952 (aproximadamente 27,8 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible (no se especifican en la informacion proporcionada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Hugging Face Transformers) |
| Dimension oculta | 5120 |
| Numero de capas | 64 |
| Tamano de vocabulario | 248.320 (con padding) |
| Dimension del FFN | 17.408 |
| Tamano del repositorio | 55,6 GB |
| Libreria | transformers |
| Etiquetas | qwen3_5, image-text-to-text, conversational, endpoints_compatible |

## Arquitectura y entrenamiento

La model card describe un modelo de lenguaje causal con encoder de vision, entrenado en dos etapas: pre-entrenamiento y post-entrenamiento. El bloque de lenguaje tiene una dimension oculta de 5120 y 64 capas distribuidas en un patron repetido 16 veces: tres subcapas de Gated DeltaNet seguidas de una subcapa de Gated Attention, cada una acompanada de su red feed-forward. La Gated DeltaNet emplea 48 cabezas de atencion lineal para V y 16 para QK, con dimension de cabeza 128. La Gated Attention usa 24 cabezas para Q y 4 para KV, con dimension de cabeza 256 y dimension de RoPE de 64. La red feed-forward tiene dimension intermedia 17.408 y el vocabulario de entrada y salida es de 248.320 entradas con padding.

La innovacion tecnica principal es la combinacion de atencion lineal (Gated DeltaNet) con atencion completa (Gated Attention) en un esquema hibrido, que reduce el coste de memoria de la cache KV en contextos largos frente a un transformer de atencion completa convencional. Ademas, el modelo se entrena con Multi-Token Prediction (MTP) con varios pasos, lo que habilita decodificacion especulativa nativa. El post-entrenamiento incorpora control flexible del razonamiento (`reasoning_effort`, `preserve_thinking`), pero la model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno, con pipeline declarado `image-text-to-text`.
- Razonamiento con modo thinking activado por defecto, desactivable por peticion y con profundidad ajustable mediante `reasoning_effort`.
- Retencion del contexto de razonamiento de mensajes historicos mediante `preserve_thinking`.
- Comprension nativa de imagen y video, incluyendo diagramas STEM, documentos y videos de hasta una hora de duracion, segun la model card.
- Capacidades de codigo y de terminal agentico: la model card incluye Terminal Bench 2.1 (Terminus) dentro de la categoria Coding.
- Ejecucion agentica: planificacion autonoma y manejo de retroalimentacion del entorno para completar tareas de extremo a extremo.
- Compatibilidad declarada con Hugging Face Transformers, vLLM, SGLang y TokenSpeed.
- Soporte de herramientas: la model card menciona herramientas oficiales integradas para la version alojada en Qwen Cloud; no se detalla el soporte de function calling para los pesos abiertos en la informacion disponible.

## Casos de uso

- Automatizacion de agentes de terminal y DevOps: el modelo esta evaluado especificamente en Terminal Bench 2.1 (Terminus), por lo que es adecuado para agentes que ejecutan comandos, interpretan salidas de shell y corrigen errores de forma iterativa.
- Generacion y revision de codigo en produccion: con integracion declarada en vLLM y SGLang, puede desplegarse como servicio interno de completado y revision de parches dentro de pipelines de CI/CD.
- Analisis de documentacion tecnica con imagenes: al ser un modelo nativo de vision y lenguaje, puede extraer informacion de diagramas de arquitectura, esquematicos, tablas de especificaciones y capturas de pantalla sin necesidad de un modelo OCR independiente.
- Analisis de video de larga duracion: la model card indica soporte para videos de hasta una hora, util para resumen de reuniones, auditoria de grabaciones de vigilancia o extraccion de eventos en material audiovisual.
- Asistentes de investigacion sobre corpus extensos: con 262.144 tokens de contexto nativo (extensibles a 1.000.000), permite procesar libros tecnicos completos, expedientes o bases documentales largas en una sola ventana.
- Razonamiento matematico y cientifico asistido por diagramas: la combinacion de capacidades STEM y vision permite resolver problemas a partir de figuras o graficos, con el modo thinking activado para cadenas de razonamiento largas.
- Atencion al cliente multi-turno: la retencion del contexto de razonamiento entre mensajes historicos (`preserve_thinking`) ayuda a mantener coherencia en conversaciones largas con multiples derivaciones.
- Extraccion de datos estructurados a partir de documentos escaneados: combinando vision y generacion de texto, puede convertir facturas, formularios o informes en JSON u otros formatos estructurados.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de rendimiento, pero en la informacion proporcionada solo se conservan los encabezados y la primera fila de la categoria Coding; los valores numericos estan truncados y no estan disponibles. Por tanto, no se reproducen cifras. Los benchmarks y modelos de comparacion identificados son los siguientes:

| Benchmark | Categoria | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | Agentic terminal coding | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la informacion disponible resultados numericos para MMLU, HumanEval, GSM8K ni otros benchmarks habituales. Cualquier cifra que circule sobre este modelo debe verificarse directamente en la model card original del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 55,6 GB solo para pesos (coincide con el tamano del repositorio). Requiere GPU de 80 GB (H100, A100 80 GB) o reparto en multiples GPU.
- VRAM estimada en cuantizacion INT8: en torno a 28 GB de pesos, mas cache KV y overhead del runtime.
- VRAM estimada en cuantizacion INT4: en torno a 14-16 GB de pesos, lo que permitiria ejecucion en GPU de consumo como RTX 4090 (24 GB) o RTX 5090, siempre que existan pesos cuantizados compatibles (no confirmados en la informacion proporcionada).
- GPU recomendadas: H100 80 GB o A100 80 GB para precision completa; A100 40 GB en configuracion multi-GPU o con cuantizacion; RTX 4090 o RTX 5090 solo con cuantizacion agresiva.
- Contexto largo: la ventana de 262.144 tokens extendible a 1.000.000 exige planificar la memoria de la cache KV. La arquitectura hibrida con Gated DeltaNet reduce este coste respecto a un transformer de atencion completa, pero no se dispone de cifras concretas de consumo por token.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, segun la model card. La etiqueta `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No se confirma soporte de llama.cpp u Ollama, al no haberse publicado pesos GGUF en la informacion disponible.
- Latencia y throughput: no disponibles. La presencie de MTP (Multi-Token Prediction) permite en teoria decodificacion especulativa, pero no se aportan mediciones.

## Comparativa con modelos similares

Los modelos de comparacion aparecen unicamente como columnas de la tabla de benchmarks de la model card, sin datos de especificaciones ni resultados numericos accesibles en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,8 B (denso) | 262.144 nativos, hasta 1.000.000 | Apache 2.0 | Pesos abiertos en Hugging Face | Datos truncados en la model card |
| Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible | no disponible |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer-30B | no disponible | no disponible | no disponible | no disponible | no disponible |
| Opus4.6 Max | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente sobre alternativas directas de codigo abierto con el mismo tamano y modalidad (vision-lenguaje, contexto largo) para establecer una comparativa fiable.

## Limitaciones y advertencias

- La model card no especifica los idiomas soportados. No se puede asumir cobertura multilingue mas alla de lo que permita el tokenizador de 248.320 entradas.
- No hay informacion sobre sesgos de genero, raza, religion u otros, ni sobre los datos de entrenamiento utilizados para evaluarlos.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en tareas de investigacion y razonamiento de multiples pasos sin verificacion externa. No se documentan tasas de alucinacion.
- La tabla de benchmarks publicada esta truncada en la informacion disponible, por lo que las afirmaciones de rendimiento de la model card no son verificables con los datos accesibles.
- El repositorio esta alojado por el usuario Build123ai, mientras que la model card hace referencia a la familia Qwen y a Qwen Cloud. Esta discrepancia entre el autor del repositorio y el desarrollador mencionado debe verificarse antes de usarlo en produccion.
- El modelo presenta 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia, por lo que no ha pasado por validacion de la comunidad.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de licencia y atribucion correspondientes. No obstante, al tratarse de un repositorio de terceros, la titularidad de los derechos sobre los pesos deberia confirmarse.
- El uso de contexto muy largo (hasta 1.000.000 de tokens) degrada la latencia y el consumo de memoria; no se publican curvas de rendimiento por longitud de contexto.
- Para la version alojada en Qwen Cloud se anuncia contexto de 1M por defecto y herramientas integradas oficiales; estas caracteristicas no estan garantizadas en el despliegue local de los pesos abiertos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Build123ai/Qwen3.8-27B
- Qwen Cloud: https://www.qwencloud.com
- Ficha de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
