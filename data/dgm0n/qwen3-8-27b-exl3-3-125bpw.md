# DGM0N/Qwen3.8-27B-exl3-3.125bpw

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal denso con encoder de vision, desarrollado por el equipo Qwen de Alibaba como parte de la serie Qwen3.8. Se presenta como un modelo nativo de vision-lenguaje que comprende imagenes y videos, con control flexible de razonamiento (thinking mode) y disenado para tareas agente de horizonte largo. Este repositorio concreto, publicado por el usuario DGM0N, contiene una cuantizacion EXL3 a 3.125 bits por peso del modelo base, lo que reduce el tamano del checkpoint a 14.2 GB y permite su ejecucion en hardware de consumo.

El modelo base emplea una arquitectura hibrida que combina Gated DeltaNet (atencion lineal) con Gated Attention (atencion completa), con 64 capas, dimension oculta de 5120 y 27.000 millones de parametros. Su longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000. La licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que lo convierte en una opcion atractiva para despliegues en produccion.

La relevancia de esta cuantizacion radica en que permite ejecutar un modelo de 27B con capacidades multimodales y agente en GPUs de consumo con 16-24 GB de VRAM, manteniendo compatibilidad con el ecosistema ExLlama v3 y, segun la model card, con transformers, vLLM, SGLang y TokenSpeed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM denso con vision encoder; hibrido Gated DeltaNet (atencion lineal) + Gated Attention (atencion completa) |
| Parametros totales | 27B (modelo base); 7.099.217.136 elementos en safetensors cuantizados (formato EXL3) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo; extensible a 1.000.000 |
| Tipos de cuantizacion | EXL3 3.125 bpw (este repo); el modelo base dispone de variantes FP8 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3 cuantizado) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo causal de lenguaje con encoder de vision, entrenado en dos fases: pre-training y post-training. La arquitectura del bloque de lenguaje sigue un patron hibrido: 16 repeticiones de una secuencia de 3 bloques Gated DeltaNet seguidos de un bloque Gated Attention, cada uno con su correspondiente FFN. El Gated DeltaNet utiliza 48 cabezas de atencion lineal para V y 16 para QK, con dimension de cabeza 128; el Gated Attention emplea 24 cabezas para Q y 4 para KV, con dimension de cabeza 256 y RoPE de dimension 64. El FFN tiene dimension intermedia de 17.408. La salida LM y el embedding de tokens comparten un vocabulario de 248.320 entradas (con padding).

Una innovacion destacable es el entrenamiento con MTP (Multi-Token Prediction) en multiples pasos, que permite predecir varios tokens simultaneamente y mejora la eficiencia en generacion. El modelo incorpora un mecanismo de control de razonamiento flexible: el thinking mode esta activado por defecto, puede desactivarse por peticion, la profundidad de razonamiento se ajusta con el parametro `reasoning_effort`, y el contexto de razonamiento historico se conserva mediante `preserve_thinking`. Los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento multi-paso con thinking mode configurable (activado por defecto, desactivable por peticion).
- Comprension de vision-lenguaje nativa: interpreta imagenes y videos, desde diagramas STEM y documentos hasta videos de duracion horaria.
- Tareas agente de horizonte largo: planificacion autonoma y manejo de feedback del entorno para completar tareas de multiples pasos.
- Razonamiento ajustable mediante `reasoning_effort` y conservacion de contexto de razonamiento historico con `preserve_thinking`.
- Capacidades de codificacion: generacion y depuracion de codigo, incluyendo tareas de terminal agente (evaluado en Terminal Bench 2.1).
- Soporte de tool calling y function calling, implicito en las capacidades agente y en la compatibilidad con harnesses de desarrollo populares.
- Compatibilidad con multiples motores de inferencia: transformers, vLLM, SGLang, TokenSpeed y ExLlama v3 (para la version cuantizada).

## Casos de uso

- Automatizacion de oficina: el modelo puede procesar documentos, hojas de calculo y presentaciones, extrayendo informacion de imagenes y texto para generar resumenes, informes o respuestas contextualizadas, gracias a su comprension multimodal y ventana de contexto de 262K tokens.
- Asistente de codigo en produccion: con soporte de tool calling y razonamiento agente, puede integrarse en pipelines de CI/CD para revision de codigo, generacion de tests y correccion de errores, manteniendo el contexto completo del repositorio en una sola sesion.
- Agente autonomo de terminal: evaluado en Terminal Bench 2.1, puede ejecutar comandos, interpretar salidas y ajustar su estrategia en entornos de linea de comandos, util para automatizacion de operaciones de sistemas.
- Analisis de documentos cientificos y tecnicos: su capacidad de vision-lenguaje permite leer diagramas, graficos y ecuaciones en PDFs o capturas, extrayendo conclusiones y respondiendo preguntas sobre el contenido.
- Moderacion y analisis de video: con soporte nativo de video de hasta una hora, puede resumir contenido audiovisual, detectar eventos o generar transcripciones descriptivas para sistemas de vigilancia o archivado.
- Chat conversacional con contexto largo: su ventana de 262K tokens (extensible a 1M) permite mantener conversaciones multi-turno con historial extenso, adecuado para atencion al cliente o asistentes virtuales con memoria de sesion prolongada.
- Despliegue en hardware de consumo: la cuantizacion EXL3 a 3.125 bpw reduce el checkpoint a 14.2 GB, permitiendo ejecutar el modelo en GPUs de 16-24 GB como RTX 4090 o RTX 3090 para prototipado y aplicaciones locales.

## Benchmarks y rendimiento

La model card del modelo base incluye una tabla de benchmarks que compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max en tareas como agentic terminal coding (Terminal Bench 2.1 / Terminus) y MathVision. Sin embargo, los valores numericos de dicha tabla no estan completos en la informacion proporcionada, por lo que no es posible reportar resultados concretos. La evaluacion de MathVision utiliza un prompt fijo que solicita razonamiento paso a paso con respuesta final en formato `\boxed{}`, mientras que para los modelos comparados se reporta la puntuacion mas alta entre dos variantes de prompt. No se han publicado resultados de benchmarks especificos para la version cuantizada EXL3 en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint cuantizado ocupa 14.2 GB, por lo que se recomienda un minimo de 16 GB de VRAM para inferencia con contexto estandar; para contextos largos (262K o 1M tokens) se necesitara memoria adicional para las KV caches.
- GPUs compatibles: RTX 4090 (24 GB) y RTX 3090 (24 GB) pueden ejecutar el modelo en consumer; para produccion se recomiendan A100 (40/80 GB) o H100 (80 GB).
- Formato EXL3: requiere ExLlama v3 para cargar la cuantizacion; la model card del modelo base indica compatibilidad con transformers, vLLM, SGLang y TokenSpeed, aunque la version cuantizada puede requerir adaptaciones.
- Opciones de despliegue: ExLlama v3 para inferencia local, vLLM o SGLang para servidores de produccion con batching, Ollama o llama.cpp si se publican conversiones GGUF (no confirmado para este repo).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen de la GPU, el tamano de contexto y la configuracion de batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B (este repo, cuantizado) | 27B | 262K (ext. 1M) | Apache 2.0 | Vision-lenguaje, thinking mode, agente |
| Qwen3.6-27B | 27B | no disponible | Apache 2.0 | Generacion anterior de la serie Qwen3 |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | Modelo de mayor capacidad comparado en benchmarks |
| Muse Glimmer-30B | 30B | no disponible | no disponible | Alternativa de 30B comparada en benchmarks |
| Opus4.6 Max | no disponible | no disponible | no disponible | Modelo de referencia en benchmarks de la model card |

La model card posiciona a Qwen3.8-27B como superior a Qwen3.6-27B en capacidades de codificacion, trabajo profesional, investigacion y tareas agente, aunque los datos numericos no estan disponibles en la informacion proporcionada. No se dispone de informacion suficiente sobre los modelos comparados (Qwen3.7-Plus, Muse Glimmer-30B, Opus4.6 Max) para establecer una comparativa tecnica detallada.

## Limitaciones y advertencias

- La cuantizacion EXL3 a 3.125 bpw puede degradar la calidad de salida respecto al modelo base en tareas de razonamiento complejo o generacion de codigo; se recomienda validar con benchmarks propios antes de desplegar en produccion.
- El repositorio tiene solo 10 descargas y 0 likes, lo que indica una adopcion comunitaria muy limitada y ausencia de validacion externa de la calidad de la cuantizacion.
- Los idiomas soportados no estan especificados en la informacion disponible; el rendimiento en idiomas distintos del ingles o chino no esta garantizado.
- El modelo base es multimodal (imagen y video), pero la version cuantizada EXL3 puede presentar limitaciones en el procesamiento de vision si el encoder no esta optimizado para la cuantizacion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; en tareas agente con ejecucion de comandos, se recomienda supervisar las acciones del modelo en entornos controlados.
- La licencia Apache 2.0 permite uso comercial, pero los terminos de la cuantizacion de terceros (DGM0N) no estan detallados; se recomienda revisar el repositorio para confirmar la ausencia de restricciones adicionales.
- La informacion sobre el dataset de entrenamiento, el proceso de post-training (RLHF, DPO, etc.) y los benchmarks numericos no esta disponible, lo que dificulta una evaluacion rigurosa del modelo.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/DGM0N/Qwen3.8-27B-exl3-3.125bpw
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Serie Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
