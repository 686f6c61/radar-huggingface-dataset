# jvshie/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo denso de lenguaje con codificador de vision, publicado en Hugging Face por el usuario jvshie bajo licencia Apache 2.0. La model card lo presenta como el miembro compacto de la generacion Qwen3.8, construido sobre la base arquitectonica de Qwen3.5 y orientado a tareas de codigo, trabajo profesional, investigacion y flujos agente de largo horizonte. El recuento real de parametros en safetensors es de 27.781.427.952 (unos 27,8 mil millones), ligeramente por encima de los "27B" que declara el autor.

Tecnicamente es un transformer causal hibrido: 64 capas organizadas en 16 bloques de la forma 3 x (Gated DeltaNet -> FFN) + 1 x (Gated Attention -> FFN), con atencion lineal Gated DeltaNet combinada con atencion completa. Incorpora entrenamiento con Multi-Token Prediction (MTP) y soporte nativo de imagen y video. La longitud de contexto es de 262.144 tokens de forma nativa, extensible hasta 1.000.000.

Su relevancia actual reside en tres puntos: es multimodal nativo (image-text-to-text) en un tamano desplegable en una sola GPU de gama alta, incluye control flexible del modo de razonamiento (`reasoning_effort`, `preserve_thinking`) y declara compatibilidad con Transformers, vLLM, SGLang y TokenSpeed. Conviene senalar que el repositorio tiene 0 descargas y 0 likes, fue creado el 29 de septiembre de 2026 y su autor no es la cuenta oficial de Qwen, por lo que la procedencia de los pesos debe verificarse antes de usarlos en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con codificador de vision; hibrida Gated DeltaNet (atencion lineal) + Gated Attention |
| Parametros totales | 27.781.427.952 (dato real de safetensors; el autor declara 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible (el repositorio solo incluye safetensors; no se referencian GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |
| Dimension oculta | 5.120 |
| Numero de capas | 64 (16 x [3 x (Gated DeltaNet -> FFN) + 1 x (Gated Attention -> FFN)]) |
| Dimensión de embedding / salida LM | 248.320 (con padding) |
| Dimension intermedia FFN | 17.408 |
| Gated DeltaNet | 48 cabezas lineales para V, 16 para QK, dimension de cabeza 128 |
| Gated Attention | 24 cabezas Q, 4 cabezas KV, dimension de cabeza 256, RoPE de dimension 64 |
| Tamano del repositorio | 55,6 GB |
| Pipeline declarado | image-text-to-text |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-29 |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso que combina dos mecanismos de atencion en una disposicion 3:1. Cada uno de los 16 bloques apila tres capas de Gated DeltaNet seguidas de una capa de Gated Attention. La Gated DeltaNet es un mecanismo de atencion lineal con 48 cabezas para V y 16 para QK con dimension de cabeza 128, lo que reduce el coste del cache de claves-valor en contextos largos; la capa de atencion completa usa 24 cabezas de consulta y 4 de clave-valor con dimension de cabeza 256 y RoPE de dimension 64, es decir, una relacion GQA de 6:1. El FFN tiene una dimension intermedia de 17.408 y el vocabulario (embedding de entrada y salida LM) es de 248.320 entradas con padding. El entrenamiento incluye Multi-Token Prediction (MTP) con varios pasos, lo que habilita decodificacion especulativa mediante cabezas auxiliares.

El autor indica dos fases, preentrenamiento y postentrenamiento, y describe el modelo como "native vision-language model", con soporte de imagen y video (incluidos videos de escala horaria) mediante un codificador de vision integrado. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, la mezcla de idiomas ni si se emplearon RLHF, DPO u otras tecnicas de alineamiento concretas. Tampoco se detalla la tecnica utilizada para extender el contexto de 262.144 a 1.000.000 tokens. El control del razonamiento se expone mediante parametros de peticion: modo thinking activado por defecto y desactivable, ajuste de profundidad con `reasoning_effort` y retencion del contexto de razonamiento historico con `preserve_thinking`.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto y desactivable por peticion.
- Ajuste de la profundidad de razonamiento mediante `reasoning_effort` y retencion del razonamiento previo con `preserve_thinking`.
- Comprension nativa de imagen: diagramas STEM, documentos, capturas y material grafico diverso.
- Comprension de video, incluidos videos de larga duracion (escala de horas segun el autor).
- Codigo y tareas agente en terminal (la model card reporta evaluacion en Terminal Bench 2.1 en la variante Terminus).
- Planificacion autonoma y manejo de retroalimentacion del entorno para tareas de multiples pasos.
- Compatibilidad declarada con harnesses y herramientas de desarrollo populares, lo que sugiere soporte de tool calling / function calling, aunque el detalle no se especifica en la informacion disponible.
- Automatizacion de oficina y tareas de productividad sobre texto y modalidad visual, segun la documentacion de Alibaba Cloud Model Studio.
- Capacidades multilingues: no disponible (el autor no declara la lista de idiomas).
- Integracion declarada con Transformers, vLLM, SGLang y TokenSpeed.

## Casos de uso

- Agentes de codigo en terminal: el modelo esta evaluado en Terminal Bench 2.1 (Terminus) y esta disenado para completar tareas de multiples pasos con retroalimentacion del entorno, por lo que encaja en agentes que ejecutan comandos, interpretan errores y corrigen en bucle.
- Automatizacion de oficina y tramitacion documental: con vision nativa y 262.144 tokens de contexto puede procesar lotes de facturas, contratos o informes escaneados, extraer campos y generar resumenes estructurados sin dividir los documentos en trozos.
- Analisis de diagramas y documentacion tecnica: la comprension de diagramas STEM permite responder preguntas sobre esquemas electricos, diagramas de arquitectura de software o figuras de articulos cientificos junto al texto que las acompana.
- Analisis de video de larga duracion: vigilancia, revision de grabaciones de reunion o analisis de material audiovisual de horas de duracion, apoyandose en el contexto extendido para mantener la coherencia temporal.
- Asistente conversacional multi-turno: el contexto de 262.144 tokens permite mantener historiales de conversacion muy largos sin truncado agresivo, adecuado para soporte tecnico especializado o asistentes de producto.
- Investigacion y sintesis bibliografica: ingesta de multiples articulos con figuras y tablas en una sola ventana para producir revisiones comparativas y extraer resultados experimentales.
- RAG multimodal: indexacion de documentos con imagenes donde las consultas requieren razonar simultaneamente sobre el texto recuperado y las figuras asociadas.
- Despliegue on-premise: la licencia Apache 2.0 y un tamano denso de 27,8B permiten ejecucion en infraestructura propia controlada, sin dependencia de API externa, alli donde la confidencialidad de los datos sea requisito.
- Generacion de codigo en pipelines de CI/CD: integrable mediante vLLM o SGLang para revision automatica de cambios, generacion de pruebas y triaje de fallos, siempre que se valide el soporte real de tool calling.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks, pero en la informacion disponible el contenido numerico aparece truncado: solo se ha capturado el encabezado y la primera fila. Por tanto, no es posible reproducir cifras. Los benchmarks referenciados y los modelos de comparacion son los siguientes:

| Benchmark | Categoria | Resultado de Qwen3.8-27B |
|---|---|---|
| Terminal Bench 2.1 (Terminus) | Coding, agentic terminal coding | No disponible (tabla truncada) |

Modelos de comparacion empleados por el autor en la tabla: Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. No se dispone de los valores numericos de ninguno de ellos en la informacion proporcionada.

Segun el agregador benchable.ai, el modelo se situa entre los mas rapidos y con precios mas competitivos en 8 benchmarks, pero no se aportan cifras concretas en la informacion disponible.

## Requisitos de hardware

- Peso en bf16/fp16: aproximadamente 55,6 GB (coincide con los 27.781.427.952 parametros a 2 bytes por parametro y con el tamano declarado del repositorio). Estimacion derivada del recuento de parametros.
- VRAM en bf16 para inferencia: estimacion practica de 64 a 80 GB contando pesos, cache KV y activaciones; el valor exacto no esta disponible.
- VRAM en cuantizacion de 8 bits: estimacion de unos 28-30 GB para los pesos.
- VRAM en cuantizacion de 4 bits: estimacion de unos 15-16 GB para los pesos, lo que lo situaria al alcance de una GPU de 24 GB.
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16 en una sola tarjeta; A6000 48 GB o 2 x RTX 4090 para bf16 con paralelismo; RTX 4090 / 5090 (24-32 GB) unicamente con cuantizacion de 4 bits.
- Cabe en consumer GPU: solo con cuantizacion agresiva. En bf16 nativo no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed segun el autor. No se referencian llama.cpp, Ollama ni TGI en la informacion disponible; su uso requeriria convertir los pesos a GGUF, conversion no publicada en el repositorio.
- Latencia y throughput estimados: no disponible.
- Nota sobre cache KV: la presencia de Gated DeltaNet (atencion lineal) en 3 de cada 4 capas reduce teoricamente el crecimiento del cache KV frente a un transformer de atencion completa pura, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,78B denso (verificado en safetensors) | 262.144 nativo, extensible a 1.000.000 | Apache 2.0 | Hugging Face (repo de jvshie) | Multimodal nativo, MTP, thinking control |
| Qwen3.6-27B | 27B (por denominacion; no verificado) | No disponible | No disponible | Referenciado como predecesor de la serie | Base arquitectonica declarada de Qwen3.8 |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | Presumiblemente servicio gestionado | Incluido por el autor como referencia de comparacion |
| Muse Glimmer-30B | Alrededor de 30B (por denominacion) | No disponible | No disponible | No disponible | Incluido por el autor como referencia de comparacion |
| Opus4.6 Max | No disponible | No disponible | Propietaria | API | Incluido por el autor como referencia de comparacion |

Los datos de parametros, contexto y licencia de los modelos alternativos no aparecen en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa verificable.

## Limitaciones y advertencias

- Procedencia no verificada: el repositorio pertenece al usuario jvshie, no a una cuenta oficial de Qwen, y la model card remite a canales oficiales (Qwen Cloud, GitHub de Alibaba Cloud) sin que se pueda confirmar la autoria real de los pesos.
- Inconsistencia en el etiquetado: el nombre del modelo indica "Qwen3.8" mientras que las etiquetas del repositorio incluyen `qwen3_5`; conviene verificar la version real de los pesos.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, con fechas de creacion y actualizacion separadas por dos segundos, lo que sugiere una subida automatizada o de prueba.
- Idiomas no declarados: no se especifica la lista de idiomas soportados, por lo que no debe asumirse un rendimiento multilingue concreto sin evaluacion propia.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de fidelidad para este modelo en la informacion disponible.
- Sesgos conocidos: no disponible.
- Benchmarks incompletos: la tabla de la model card esta truncada; no se pueden reproducir ni auditar las cifras. Los modelos de comparacion "Muse Glimmer-30B" y "Opus4.6 Max" no son verificables con la informacion disponible.
- Contexto extendido sin detalle: el paso de 262.144 a 1.000.000 tokens no se documenta tecnicamente (tecnica de escalado de RoPE, coste computacional ni degradacion esperada).
- Requisitos de hardware elevados: 55,6 GB de pesos en precision nativa impiden el despliegue en GPU de consumo sin cuantizacion, y el repositorio no incluye versiones cuantizadas.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero la ausencia de procedencia verificable de los pesos es un riesgo legal y de seguridad que debe evaluarse antes de un despliegue en produccion.
- Tool calling: la compatibilidad con harnesses se menciona de forma generica; no se documenta el esquema concreto de function calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jvshie/Qwen3.8-27B
- Repositorio GitHub de Alibaba Cloud: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentacion en Alibaba Cloud Model Studio: https://docs.modelstudio.console.alibabacloud.com/en/model-studio/qwen3-8-27b
- Ayuda de Alibaba Cloud (Aliyun): https://help.aliyun.com/en/model-studio/qwen3-8-27b
- Pagina de producto en Alibaba Cloud: https://www.alibabacloud.com/help/en/model-studio/qwen3-8-27b
- Ficha en el agregador benchable.ai: https://benchable.ai/models/qwen/qwen3.8-27b-20260814
- Servicio gestionado Qwen Cloud (referenciado en la model card): https://www.qwencloud.com
- Vision general del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
