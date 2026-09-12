# soro1441/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal denso con codificador de vision publicado en Hugging Face bajo el identificador soro1441/Qwen3.8-27B. Segun su model card, se presenta como la generacion mas capaz de la familia abierta Qwen3.8, construida sobre la base arquitectonica de Qwen3.5. Cuenta con 27.781.427.952 parametros reales (27,8 B) en formato safetensors y un repositorio de 55,6 GB, y esta orientado a codigo, trabajo profesional, investigacion y agentes de horizonte largo.

La arquitectura es hibrida: combina capas de atencion lineal Gated DeltaNet con capas de atencion completa Gated Attention en un patron de 64 capas, e incorpora prediccion multi-token (MTP) entrenada en varios pasos. La longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000. Es un modelo nativo de vision-lenguaje, capaz de procesar imagenes y videos.

Su interes potencial esta en reunir vision, control flexible del razonamiento (modo thinking activado por defecto, desactivable por peticion, con `reasoning_effort` y `preserve_thinking`) y ejecucion de agentes en un unico modelo denso de 27 B con licencia Apache 2.0. Ahora bien, el repositorio registra 0 descargas y 0 likes, el identificador no corresponde a una publicacion oficial de Qwen y la model card referencia servicios (Qwen Cloud) no verificables en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con codificador de vision; capas hibridas Gated DeltaNet (atencion lineal) + Gated Attention; MTP (Multi-Token Prediction) |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible (la model card no los especifica; solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 55,6 GB, libreria transformers) |

Detalles arquitectonicos adicionales declarados en la model card:

| Parametro | Valor |
|---|---|
| Dimension oculta | 5120 |
| Numero de capas | 64 |
| Layout oculto | 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Token embedding | 248.320 (padded) |
| Salida LM | 248.320 (padded) |
| Gated DeltaNet | 48 cabezas de atencion lineal para V y 16 para QK; dimension de cabeza 128 |
| Gated Attention | 24 cabezas para Q y 4 para KV; dimension de cabeza 256; dimension RoPE 64 |
| FFN (dimension intermedia) | 17.408 |
| Etapa de entrenamiento | Pre-entrenamiento y post-entrenamiento |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

El modelo emplea un diseno hibrido poco habitual en modelos densos de este tamano: por cada bloque de cuatro subcapas, tres corresponden a Gated DeltaNet (una forma de atencion lineal con estado recurrente) y una a Gated Attention con atencion completa. El patron declarado es 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), es decir, 48 subcapas de atencion lineal y 16 de atencion completa sobre las 64 capas totales. La atencion Gated DeltaNet usa 48 cabezas para V y 16 para QK con dimension de cabeza 128; la Gated Attention usa 24 cabezas para Q y 4 para KV con dimension de cabeza 256 y RoPE de dimension 64. El FFN tiene una dimension intermedia de 17.408 y el vocabulario (embedding y salida) es de 248.320 entradas con padding.

El modelo se entrena en dos etapas (pre-entrenamiento y post-entrenamiento) e incorpora prediccion multi-token (MTP) entrenada con varios pasos, tecnica que suele emplearse para decodificacion especulativa y para acelerar la generacion. Tambien incluye un codificador de vision que lo convierte en un modelo nativo de vision-lenguaje, con soporte declarado de imagenes y videos de hasta una hora de duracion. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO; la model card solo indica la etapa de post-entrenamiento de forma generica.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto, desactivable por peticion y con profundidad de razonamiento ajustable mediante `reasoning_effort`.
- Retencion del contexto de razonamiento de mensajes historicos mediante `preserve_thinking`.
- Generacion y edicion de codigo, con enfasis declarado en codigo agentico de terminal (la model card cita Terminal Bench 2.1 Terminus).
- Ejecucion de agentes: planificacion autonoma y manejo de retroalimentacion del entorno para completar tareas de multiples pasos de extremo a extremo.
- Comprension de vision-lenguaje nativa: diagramas STEM, documentos e imagenes, ademas de video de hasta una hora segun el fabricante.
- Prediccion multi-token (MTP) entrenada en varios pasos, orientada a acelerar la decodificacion.
- Contexto largo: 262.144 tokens nativos y hasta 1.000.000 en la version alojada.
- Compatibilidad declarada con Hugging Face Transformers, vLLM, SGLang y TokenSpeed.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque la model card menciona "herramientas oficiales integradas" para la version alojada.
- Idiomas soportados: no disponible.

## Casos de uso

- Agente de terminal y automatizacion de DevOps: el modelo declara mejoras especificas en codigo agentico de terminal, de modo que puede encadenar comandos, interpretar la salida del shell y corregir errores en tareas de despliegue o mantenimiento de repositorios.
- Generacion de codigo en produccion: con 262.144 tokens de contexto nativo puede recibir repositorios o modulos completos y mantener coherencia entre ficheros, integrándose en pipelines de revision o CI/CD mediante la API de transformers o vLLM.
- Analisis de documentacion tecnica con vision: al aceptar entrada image-text-to-text, puede extraer datos de diagramas de arquitectura, esquematicos de circuitos o tablas escaneadas y devolver explicaciones o codigo asociado.
- Resumen y consulta de video largo: el soporte declarado de video de hasta una hora permite generar resumenes con marcas temporales, extraer acciones o responder preguntas sobre grabaciones de reuniones, clases o sesiones de depuracion.
- Asistente de investigacion sobre corpus extensos: con contexto de 262.144 tokens (ampliable a 1.000.000 en la version alojada) puede procesar articulos completos o conjuntos de documentos y sostener conversaciones multi-turno sin perder referencias previas.
- Atencion al cliente automatizada en varios idiomas: no se han publicado los idiomas soportados, por lo que solo seria desplegable tras validar la cobertura linguistica real; el contexto largo permitiria gestionar historiales de conversacion extensos.
- Copiloto interno de trabajo profesional: redaccion de informes, normalizacion de datos y generacion de resumenes ejecutivos a partir de documentos mixtos (texto, tablas e imagenes).
- Sistema de agentes con razonamiento controlado por coste: gracias a `reasoning_effort` y a la desactivacion del modo thinking por peticion, se puede reducir el gasto de tokens en peticiones simples y reservar el razonamiento profundo para tareas complejas.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con las columnas Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, organizada por categorias y con al menos una fila de "Agentic terminal coding – Terminal Bench 2.1 (Terminus)". Sin embargo, los valores numericos de esa tabla no son recuperables a partir de la informacion disponible (el contenido llega truncado), por lo que no se pueden reproducir ni verificar.

No se han publicado resultados de benchmarks recuperables en la informacion disponible. No se incluyen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar.

## Requisitos de hardware

Estimaciones derivadas del recuento real de parametros (27,8 B) y del tamano del repositorio (55,6 GB); no son cifras oficiales del fabricante.

- VRAM para pesos en BF16/FP16: aproximadamente 56 GB. Requiere al menos una GPU de 80 GB (A100 80 GB, H100 80 GB) o reparto en varias GPU de 48 GB.
- VRAM en FP8: aproximadamente 28-30 GB; viable en una A100 40 GB, L40S 48 GB o 2 × RTX 4090.
- VRAM en INT4/AWQ/GPTQ: aproximadamente 15-17 GB, mas overhead de contexto, que con 262.144 tokens puede ser muy elevado.
- GPU de consumo: en cuantizacion de 4 bits podria caber en una RTX 4090 (24 GB) o RTX 5090, siempre que el contexto se mantenga moderado. En BF16 no cabe en ninguna GPU de consumo actual.
- El coste de KV cache de las 16 capas de atencion completa es significativo a contextos muy largos; las 48 capas de atencion lineal reducen ese coste respecto a un transformer puramente denso, pero no hay cifras publicadas.
- Opciones de despliegue declaradas: Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se confirma soporte de llama.cpp, GGUF ni Ollama en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Modelos citados como comparacion en la propia model card (no verificables con la informacion disponible):

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B (soro1441) | 27,8 B | 262.144 / 1.000.000 | apache-2.0 | Repo HF con 0 descargas |
| Qwen3.6-27B | no disponible | no disponible | no disponible | no verificable |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no verificable |
| Muse Glimmer-30B | no disponible | no disponible | no disponible | no verificable |
| Opus4.6 Max | no disponible | no disponible | no disponible | no verificable |

Alternativas reales de tamano y perfil comparables que un desarrollador puede evaluar hoy:

| Modelo | Parametros | Contexto | Vision | Licencia |
|---|---|---|---|---|
| Qwen2.5-VL-32B-Instruct | 32 B aprox. | 128.000 | Si | Apache 2.0 |
| Gemma 3 27B | 27 B aprox. | 128.000 | Si | Licencia Gemma |
| Mistral Small 3.1 24B | 24 B aprox. | 128.000 | Si | Apache 2.0 |

No se dispone de resultados de rendimiento verificables de Qwen3.8-27B que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Procedencia no verificada: el repositorio pertenece a un autor independiente (soro1441), no a la organizacion oficial de Qwen, y registra 0 descargas y 0 likes. Debe tratarse como publicacion no auditada.
- La model card referencia productos y servicios ("Qwen Cloud", versiones Qwen3.6 y Qwen3.7) que no se han podido verificar; no se han encontrado paper, repositorio oficial ni anuncio que respalde la existencia de la familia Qwen3.8.
- Idiomas soportados no documentados: no hay informacion sobre cobertura linguistica ni sobre calidad en castellano.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni tasas de error; como en cualquier modelo generativo, las salidas deben validarse, especialmente en codigo y datos numericos.
- Sin datos de sesgo: no se documenta composicion del dataset ni evaluaciones de sesgo, por lo que no es posible estimar riesgos de sesgo demografico o cultural.
- Cuantizacion no publicada: solo hay pesos safetensors; no existen versiones oficiales GGUF, AWQ o GPTQ, lo que complica el despliegue en hardware de consumo a corto plazo.
- Coste de contexto: aunque la ventana nativa es de 262.144 tokens, la memoria de KV cache en las 16 capas de atencion completa puede hacer inviable el contexto maximo en GPU de gama unica.
- Uso comercial: la licencia Apache 2.0 lo permite en principio, pero al no ser una publicacion oficial no existe garantia del titular sobre los derechos de los pesos.
- Fecha de creacion del repositorio: figura como 2026-09-12, posterior a la fecha de consulta habitual, lo que refuerza la cautela sobre la autenticidad de la publicacion.
- La busqueda web realizada no devolvio ninguna fuente relacionada con el modelo: todos los resultados obtenidos versaban sobre plataformas de videojuegos y no aportan informacion tecnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/soro1441/Qwen3.8-27B
- Overview de Qwen3.8-27B en Qwen Cloud (citado en la model card, no verificado): https://www.qwencloud.com/models/qwen3.8-27b
- Qwen Cloud (citado en la model card, no verificado): https://www.qwencloud.com
- Papers, repositorios y demos: no disponible. La busqueda web no devolvio resultados relevantes sobre este modelo.
