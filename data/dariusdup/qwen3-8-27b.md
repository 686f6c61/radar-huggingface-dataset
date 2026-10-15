# Dariusdup/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal denso de 27.781.427.952 parametros (unos 27,8 B) con encoder de vision integrado, publicado en Hugging Face bajo la licencia Apache 2.0 y distribuido en formato safetensors para Transformers. Segun su model card, se trata de la generacion mas capaz hasta la fecha de la familia abierta Qwen, construida sobre la base arquitectonica de Qwen3.5 y orientada a tareas de codigo, trabajo profesional, investigacion y flujos agenticos de horizonte largo. La arquitectura es hibrida: combina capas de atencion lineal Gated DeltaNet con capas de atencion con compuerta (Gated Attention), lo que reduce el coste de la cache KV frente a un transformer de atencion completa del mismo tamano.

El modelo es nativo en modalidad vision-lenguaje: procesa imagenes y video, desde diagramas STEM y documentos hasta videos de una hora de duracion. Incorpora ademas control flexible del razonamiento: el modo thinking esta activado por defecto y puede desactivarse por peticion, con ajuste de profundidad mediante `reasoning_effort` y retencion del contexto de razonamiento historico con `preserve_thinking`. La longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000.

Su relevancia practica esta en el segmento de modelos densos de ~27 B desplegables en infraestructura propia: ofrece comprension multimodal, ejecucion agentica con planificacion autonoma y soporte declarado para vLLM, SGLang, TokenSpeed y Transformers. Conviene senalar que el repositorio de Hugging Face analizado esta alojado en la cuenta de usuario `Dariusdup`, con 0 descargas y 0 likes, y que la tabla de benchmarks de la model card aparece truncada en la informacion disponible, por lo que los resultados numericos no pueden verificarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de vision; hibrida de atencion lineal Gated DeltaNet y Gated Attention |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang y TokenSpeed) |
| Dimension oculta | 5.120 |
| Numero de capas | 64 |
| Disposicion de capas | 16 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN)) |
| Gated DeltaNet | 48 cabezas de atencion lineal para V y 16 para QK; dimension de cabeza 128 |
| Gated Attention | 24 cabezas para Q y 4 para KV; dimension de cabeza 256; dimension RoPE 64 |
| Red feed-forward | Dimension intermedia 17.408 |
| Vocabulario | 248.320 tokens (con padding); salida LM de 248.320 |
| MTP (Multi-Token Prediction) | Entrenado con multiples pasos |
| Etapa de entrenamiento | Pre-entrenamiento y post-entrenamiento |
| Tamano del repositorio | 55,6 GB |
| Fecha de publicacion | 14 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo sigue un esquema causal con encoder de vision y un tronco de 64 capas organizado en 16 bloques repetidos. Cada bloque contiene tres subcapas de Gated DeltaNet seguidas de una subcapa de Gated Attention, cada una emparejada con su correspondiente red feed-forward de dimension intermedia 17.408. La Gated DeltaNet emplea atencion lineal con 48 cabezas para V y 16 para QK con dimension de cabeza 128, mientras que la capa de atencion con compuerta usa 24 cabezas de consulta y solo 4 de clave-valor con dimension de cabeza 256 y dimension RoPE de 64. Esta asimetria (16 capas de atencion completa de 64) es la que determina el coste real de la cache KV en contextos largos.

El modelo se entrena con MTP (Multi-Token Prediction) sobre multiples pasos, lo que habilita decodificacion especulativa y puede mejorar el throughput en inferencia. La model card indica explicitamente que el modelo pasa por pre-entrenamiento y post-entrenamiento, pero no detalla el numero de tokens, la composicion del dataset ni el uso concreto de RLHF, DPO u otras tecnicas de alineamiento. Tampoco se especifica la arquitectura del encoder de vision mas alla de su presencia y de su capacidad para procesar imagenes y video.

Las innovaciones declaradas se centran en tres frentes: la hibridacion de atencion lineal y atencion completa para abaratar el contexto largo, el control flexible del razonamiento por peticion y el refuerzo de la ejecucion agentica, con mejor planificacion autonoma y mejor manejo del feedback del entorno. La model card menciona compatibilidad con "harnesses" populares y herramientas de desarrollo, aunque sin enumerarlos.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, activado por defecto y desactivable por peticion.
- Control de profundidad de razonamiento mediante el parametro `reasoning_effort`.
- Retencion del contexto de razonamiento de mensajes historicos mediante `preserve_thinking`.
- Comprension nativa de imagen y video: diagramas STEM, documentos y videos de hasta una hora.
- Generacion y asistencia de codigo, con mejoras declaradas en tareas agenticas de terminal.
- Ejecucion agentica: planificacion autonoma, manejo del feedback del entorno y completado de tareas de horizonte largo de extremo a extremo.
- Multi-Token Prediction (MTP) entrenado con multiples pasos, aprovechable para decodificacion especulativa.
- Compatibilidad declarada con Transformers, vLLM, SGLang y TokenSpeed.
- Soporte de tool calling: la model card menciona soporte ampliado para harnesses y herramientas de desarrollo, y la version alojada en Qwen Cloud incluiria herramientas integradas oficiales; el detalle del esquema nativo de function calling no esta disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible. La model card no enumera idiomas y los metadatos de Hugging Face tampoco los declaran.

## Casos de uso

- Agente de terminal autonomo: el modelo esta evaluado especificamente en Terminal Bench 2.1 (Terminus), una prueba de codificacion agentica en terminal. Puede integrarse en un bucle de ejecucion de comandos donde interpreta la salida, corrige errores y continua hasta completar la tarea.
- Analisis de documentacion tecnica con vision: al ser nativo en imagen-texto, permite extraer datos de diagramas de circuito, esquemas de arquitectura, planos y tablas escaneadas sin necesidad de un pipeline OCR separado.
- Procesamiento de video de larga duracion: con soporte declarado para videos de escala horaria y 262.144 tokens de contexto nativo, es adecuado para resumen, indexacion y busqueda semantica sobre grabaciones de reuniones, clases o auditorias.
- Asistente de investigacion con razonamiento controlado: el ajuste de `reasoning_effort` permite bajar el coste en consultas simples y subirlo en derivaciones matematicas o revision de literatura, manteniendo el hilo de razonamiento entre turnos gracias a `preserve_thinking`.
- Revision de codigo en CI/CD: mediante tool calling y su ventana de contexto larga puede analizar diffs extensos, varios ficheros relacionados y el historial de un pull request en una sola pasada.
- Despliegue on-premise con requisitos de soberania del dato: la licencia Apache 2.0 y los pesos safetensors permiten alojar el modelo en infraestructura propia sin dependencia de API externa, algo critico en banca, sanidad o sector publico.
- Atencion al cliente multimodal: un usuario puede adjuntar una captura de pantalla o un video corto de un fallo y el modelo razona sobre la imagen dentro de una conversacion multi-turno.
- Generacion asistida en herramientas de desarrollo: la compatibilidad declarada con harnesses populares facilita su integracion como backend en asistentes de IDE y agentes de codificacion existentes.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de rendimiento, pero en la informacion proporcionada solo es visible su cabecera y la primera fila de la categoria "Coding", sin valores numericos. No se han publicado resultados de benchmarks verificables en la informacion disponible.

| Categoria | Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|---|
| Coding | Terminal Bench 2.1 (Terminus) | no disponible | no disponible | no disponible | no disponible | no disponible |

La tabla original de la model card declara comparaciones adicionales frente a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero las filas y valores restantes estan truncados en la fuente disponible. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar.

## Requisitos de hardware

Los valores de VRAM que siguen son estimaciones derivadas del numero de parametros y del tamano del repositorio (55,6 GB), no datos publicados por el autor.

- Pesos en BF16/FP16: aproximadamente 55,6 GB solo en pesos, mas overhead de runtime y cache KV. Requiere GPUs de 80 GB (A100 80GB, H100 80GB, H200 141GB) o reparto en tensor parallelism sobre 2 x A100 40GB.
- Pesos en INT8: del orden de 28 GB. Cabe en A100 40GB, L40S 48GB y RTX 6000 Ada 48GB.
- Pesos en INT4: del orden de 14-16 GB. Cabe en RTX 4090 24GB, RTX 5090 32GB y, de forma ajustada, en GPUs de 16 GB.
- GPU de consumo: no cabe en BF16 en ninguna GPU de consumo actual. En INT4 es viable en RTX 4090, RTX 5090 y equivalentes con 24 GB o mas.
- Cache KV: solo 16 de las 64 capas usan atencion completa. Con 4 cabezas KV de dimension 256 en cada una de esas 16 capas, la cache equivale a unos 64 KiB por token en BF16, es decir, aproximadamente 16 GiB para una secuencia completa de 262.144 tokens. Es una estimacion calculada a partir de la configuracion, no un dato publicado. Las capas Gated DeltaNet mantienen estado recurrente de tamano constante.
- Encoder de vision: anade consumo de memoria no cuantificado en la informacion disponible, que crece con el numero y la resolucion de imagenes y con la duracion del video.
- Opciones de despliegue: la model card cita Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se mencionan llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponible. El entrenamiento con MTP sobre multiples pasos permite plantear decodificacion especulativa, lo que en principio aumentaria el throughput, pero no se publican cifras.

## Comparativa con modelos similares

La unica comparativa documentada es la que aparece en la propia model card. Los datos de parametros y contexto de los modelos alternativos no estan disponibles en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Resultados comparados |
|---|---|---|---|---|
| Qwen3.8-27B | 27,8 B (dato real safetensors) | 262.144 nativos, 1.000.000 extensible | Apache 2.0 | no disponible |
| Qwen3.6-27B | 27 B (segun denominacion) | no disponible | no disponible | incluido en la tabla de la model card, valores no disponibles |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | incluido en la tabla de la model card, valores no disponibles |
| Muse Glimmer-30B | 30 B (segun denominacion) | no disponible | no disponible | incluido en la tabla de la model card, valores no disponibles |
| Opus4.6 Max | no disponible | no disponible | no disponible | incluido en la tabla de la model card, valores no disponibles |

## Limitaciones y advertencias

- Procedencia del repositorio: los pesos estan alojados bajo la cuenta de usuario `Dariusdup`, con 0 descargas y 0 likes en el momento del analisis, aunque la model card se presenta como publicacion de la familia Qwen. Conviene verificar la autoria y la integridad de los pesos antes de usarlos en produccion.
- Benchmarks no verificables: la tabla de resultados de la model card esta truncada en la informacion disponible y no se puede confirmar ningun valor numerico.
- Discrepancia de contexto: la version alojada en Qwen Cloud se anuncia con 1M de contexto por defecto y herramientas integradas, mientras que los pesos abiertos declaran 262.144 tokens nativos y extension hasta 1.000.000. No se detalla que configuracion de escalado de RoPE es necesaria para alcanzar el millon de tokens.
- Idiomas: no se declara ninguna lista de idiomas soportados, ni en los metadatos de Hugging Face ni en la model card. No se puede asumir cobertura multilingue sin verificacion empirica.
- Cuantizacion: el repositorio solo publica safetensors; no se ofrecen pesos GGUF, AWQ o GPTQ. Cualquier cuantizacion para despliegue en GPU de consumo tendria que generarla el usuario.
- Alucinacion: no hay informacion sobre tasas de alucinacion ni sobre el proceso de alineamiento (RLHF/DPO), por lo que el riesgo es el habitual en modelos de esta familia y debe mitigarse con verificacion externa en dominios factuales.
- Sesgos: no disponible. La model card no documenta evaluaciones de sesgo, toxicidad o equidad.
- Coste de contexto largo: aunque la arquitectura hibrida reduce la cache KV, atender 262.144 tokens sigue implicando unos 16 GiB adicionales de memoria en BF16, ademas de los pesos, y el prefill en esa longitud penaliza la latencia.
- Modo thinking por defecto: al estar activado por defecto, el consumo de tokens de salida es mayor si no se desactiva explicitamente o se ajusta `reasoning_effort`, lo que impacta directamente en coste y latencia.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales conocidas, pero se aplica sobre unos pesos cuya procedencia no esta verificada de forma independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Dariusdup/Qwen3.8-27B
- Qwen Cloud (servicio de inferencia gestionada citado en la model card): https://www.qwencloud.com
- Ficha del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b

No se han encontrado en la busqueda web enlaces relevantes sobre el modelo; los resultados devueltos no guardan relacion con el ambito tecnico de esta ficha y se han descartado.
