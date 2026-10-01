# m0mmm/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso, multimodal nativo (texto, imagen y video), publicado en el repositorio de Hugging Face `m0mmm/Qwen3.8-27B`. La model card lo presenta como la generacion mas capaz de la familia abierta Qwen hasta la fecha, construida sobre la base arquitectonica de Qwen3.5 y orientada a tareas de programacion, trabajo profesional, investigacion y flujos agenticos de horizonte largo. Segun el autor, el modelo pertenece al equipo Qwen de Alibaba; el repositorio analizado, en cambio, es una publicacion de un tercero (`m0mmm`) sin descargas ni valoraciones en el momento de la consulta.

Tecnicamente es un transformer causal con encoder de vision y una arquitectura hibrida de atencion: combina capas de atencion lineal Gated DeltaNet con capas de atencion completa con puertas (Gated Attention), en un patron repetido de 3 bloques lineales por cada bloque de atencion completa. El recuento real de safetensors es de 27.781.427.952 parametros (27,78 B), con 64 capas, dimension oculta de 5120 y un vocabulario de 248.320 tokens. El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000.

Su relevancia practica esta en el eje del despliegue local: se trata de un modelo denso de ~27 B, con licencia Apache 2.0 y compatibilidad declarada con Transformers, vLLM, SGLang y TokenSpeed, lo que lo situa en el rango de GPUs profesionales de 80 GB en precision completa y de GPUs de consumo de gama alta con cuantizacion. Incluye modo de razonamiento activado por defecto, control de esfuerzo de razonamiento y prediccion multi-token (MTP), aprovechable para decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de vision; hibrida (Gated DeltaNet de atencion lineal + Gated Attention de atencion completa) |
| Parametros totales | 27.781.427.952 (27,78 B) segun safetensors; la model card indica "27B" |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; la model card no lista cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimension oculta | 5120 |
| Capas | 64 (16 x [3 x (Gated DeltaNet → FFN) → 1 x (Gated Attention → FFN)]) |
| Vocabulario / embedding | 248.320 tokens (con padding), tanto en entrada como en salida |
| FFN | dimension intermedia de 17.408 |
| Atencion lineal (Gated DeltaNet) | 48 cabezas para V y 16 para QK, dimension de cabeza 128 |
| Atencion completa (Gated Attention) | 24 cabezas para Q y 4 para KV, dimension de cabeza 256, RoPE de 64 dimensiones |
| Prediccion multi-token (MTP) | si, entrenada con multiples pasos |
| Tamano del repositorio | 55,6 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo sigue un esquema causal autorregresivo con encoder de vision para entrada de imagenes y video. La innovacion estructural principal es la alternancia de dos mecanismos de atencion: por cada bloque de atencion completa (Gated Attention, con 24 cabezas de consulta y 4 de clave-valor, dimension de cabeza 256 y RoPE de 64 dimensiones) se apilan tres bloques de Gated DeltaNet, un mecanismo de atencion lineal con 48 cabezas para V y 16 para QK y dimension de cabeza 128. Este reparto 3:1 reduce el coste del contexto largo, que es precisamente el punto fuerte declarado: 262.144 tokens nativos ampliables a 1.000.000, algo inusual en un denso de 27 B.

El entrenamiento se describe en dos etapas, pre-entrenamiento y post-entrenamiento. La model card no especifica el numero de tokens, la composicion del dataset ni si se emplearon tecnicas concretas de alineacion como RLHF o DPO; esos datos figuran como no disponibles. Si se detalla que el modelo incorpora prediccion multi-token (MTP) entrenada con multiples pasos, lo que habilita decodificacion especulativa interna para acelerar la generacion. En el plano del razonamiento, el modo "thinking" viene activado por defecto, puede desactivarse por peticion, admite ajuste de profundidad mediante `reasoning_effort` y conserva el contexto de razonamiento de mensajes previos mediante `preserve_thinking`.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento explícito, activado por defecto y desactivable por peticion.
- Control de profundidad de razonamiento mediante el parametro `reasoning_effort`, y retencion del razonamiento previo con `preserve_thinking`.
- Programacion: la model card declara mejoras sustanciales en codigo, incluida la categoria de "agentic terminal coding" evaluada con Terminal Bench 2.1 (Terminus).
- Ejecucion agentica: planificacion autonoma y manejo de retroalimentacion del entorno para completar tareas multi-paso de extremo a extremo.
- Comprension de vision y lenguaje de forma nativa: diagramas STEM, documentos y videos de hasta una hora de duracion.
- Capacidades profesionales y de investigacion, con enfasis declarado en automatizacion de oficina tanto en modalidad textual como visual.
- Prediccion multi-token (MTP) para decodificacion especulativa.
- Compatibilidad declarada con Transformers, vLLM, SGLang y TokenSpeed, ademas de "harnesses" y herramientas de desarrollo populares.
- Tool calling / function calling: no se detalla de forma explicita en la informacion disponible; la model card menciona "official built-in tools" solo para la version alojada en Qwen Cloud, no para los pesos abiertos.
- Idiomas soportados: no disponible.

## Casos de uso

- Agente de terminal y automatizacion de DevOps: el modelo esta evaluado especificamente en Terminal Bench 2.1 (Terminus) y declara planificacion autonoma con manejo de retroalimentacion del entorno, lo que permite encadenar comandos, interpretar errores y corregir la ejecucion dentro de un bucle agentico.
- Asistencia de programacion en produccion: generacion y refactorizacion de codigo con razonamiento configurable, de modo que tareas triviales se resuelvan con `reasoning_effort` bajo y las revisiones complejas con esfuerzo alto, ajustando coste y latencia.
- Analisis de documentacion tecnica con vision: al ser un modelo vision-lenguaje nativo, puede extraer datos de diagramas de ingenieria, planos, tablas escaneadas y capturas de paneles, tareas habituales en soporte tecnico y auditoria documental.
- Procesamiento de video de larga duracion: la model card declara soporte de videos de hasta una hora, lo que habilita resumen y busqueda de eventos en grabaciones de reuniones, clases o material de vigilancia.
- Investigacion y revision bibliografica: el contexto de 262.144 tokens permite cargar articulos completos, anexos y conjuntos de figuras en una sola ventana y mantener el hilo de razonamiento entre documentos.
- Automatizacion de oficina: generacion y edicion asistida de informes, hojas de calculo y presentaciones, combinando texto e imagenes de los documentos originales.
- Atencion al cliente multi-turno: la ventana de 262.144 tokens admite historiales largos y adjuntos visuales sin truncado agresivo, con la salvedad de que la latencia depende del hardware.
- Procesos batch de clasificacion y extraccion sobre corpus extensos: con vLLM o SGLang y decodificacion especulativa basada en MTP para mejorar el throughput.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de rendimiento, pero en la informacion disponible la tabla aparece truncada: solo se recuperan las cabeceras de los modelos comparados y una de las categorias evaluadas, sin los valores numericos. Por tanto, los resultados concretos se consideran no disponibles.

| Benchmark | Categoria | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | Agentic terminal coding | no disponible | no disponible | no disponible | no disponible | no disponible |

Modelos de referencia empleados por el autor en su tabla comparativa: Qwen3.8-27B (este modelo), Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. No se han publicado en la informacion disponible los valores de otros benchmarks habituales (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia (calculo aritmetico a partir de los 27,78 B de parametros, no dato oficial): ~55,6 GB en FP16/BF16, ~28 GB en INT8, ~14-16 GB en cuantizacion de 4 bits.
- El repositorio ocupa 55,6 GB, coherente con pesos en precision de 16 bits; conviene prever ese espacio en disco mas margen para el cache de Hugging Face.
- GPUs profesionales: una A100 80 GB, H100 80 GB o H200 permiten inferencia en BF16 sin cuantizar.
- Configuraciones multi-GPU: dos A100 40 GB o dos RTX 6000 Ada 48 GB son suficientes para servir en BF16 con tensor parallelism.
- GPUs de consumo: una RTX 4090 (24 GB) o RTX 5090 (32 GB) pueden ejecutar el modelo cuantizado a 8 o 4 bits, no en BF16. Un unico equipo de 16 GB solo es viable con cuantizacion de 4 bits agresiva y contexto reducido.
- El contexto largo es el principal consumidor adicional de memoria: 262.144 tokens de ventana implican un cache KV considerable, mitigado en parte por las capas de atencion lineal Gated DeltaNet frente a un transformer de atencion completa equivalente.
- Opciones de despliegue declaradas en la model card: Hugging Face Transformers, vLLM, SGLang y TokenSpeed. Soporte de llama.cpp, Ollama, TGI o formatos GGUF: no disponible (no se publican pesos cuantizados en el repositorio).
- Latencia y throughput estimados: no disponible. El modelo incorpora MTP entrenado con multiples pasos, aprovechable para decodificacion especulativa y mejora del throughput en vLLM y SGLang.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Qwen3.8-27B (m0mmm/Qwen3.8-27B) | 27,78 B (denso) | 262.144 nativos, hasta 1.000.000 | apache-2.0 | pesos abiertos en Hugging Face; version alojada en Qwen Cloud "coming soon" | no disponible |
| Qwen3.6-27B | 27 B (segun nomenclatura) | no disponible | no disponible | referenciado como generacion anterior de la familia | no disponible |
| Muse Glimmer-30B | 30 B (segun nomenclatura) | no disponible | no disponible | no disponible | no disponible |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | servicio, no pesos abiertos segun la informacion disponible | no disponible |
| Opus4.6 Max | no disponible | no disponible | no disponible | servicio propietario | no disponible |

Los cuatro modelos alternativos se toman de la propia tabla comparativa del autor. No se dispone de datos verificables de parametros, contexto, licencia ni resultados para establecer una comparacion cuantitativa con Qwen3.8-27B.

## Limitaciones y advertencias

- Repositorio de terceros: el ID es `m0mmm/Qwen3.8-27B`, no una organizacion oficial de Qwen o Alibaba. En el momento de la consulta acumula 0 descargas y 0 likes, por lo que la procedencia de los pesos no esta verificada por la plataforma.
- La model card describe caracteristicas de un modelo oficial (Qwen Cloud, repositorio de Alibaba en GitHub) que no se corresponden necesariamente con el contenido exacto de este repositorio concreto. Conviene verificar hashes e integridad antes de usarlo en produccion.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de fidelidad para este modelo. La ventana de 262.144 tokens incrementa la superficie de error en tareas de recuperacion sobre contextos muy largos.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o equidad. No disponible.
- Idiomas: la informacion disponible no especifica los idiomas soportados ni su cobertura relativa. El tokenizador de 248.320 entradas sugiere soporte multilingue amplio, pero es una inferencia, no un dato confirmado.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. La model card no anade restricciones adicionales, aunque la version alojada en Qwen Cloud se rige por sus propios terminos de servicio.
- Cuantizacion: no se publican pesos GGUF ni AWQ/GPTQ oficiales. Cualquier cuantizacion de 4 bits aplicada por el usuario puede degradar el rendimiento, especialmente en tareas de codigo y vision.
- Consumo de recursos: 55,6 GB de pesos y ventanas de hasta 1.000.000 tokens exigen infraestructura de gama alta; el coste del cache KV a contextos maximos no se documenta.
- Cifras de benchmarks incompletas: no es posible validar las afirmaciones de mejora en codigo, trabajo profesional y tareas agenticas con los datos recuperados.
- Formatos soportados: no hay evidencia en la informacion disponible de soporte nativo para llama.cpp, Ollama o TGI, mas alla de la compatibilidad declarada con Transformers, vLLM, SGLang y TokenSpeed.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/m0mmm/Qwen3.8-27B
- Repositorio en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Pagina del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Servicio alojado Qwen Cloud (referenciado en la model card): https://www.qwencloud.com
- Paper, blog tecnico y demos: no disponibles en la informacion proporcionada.
