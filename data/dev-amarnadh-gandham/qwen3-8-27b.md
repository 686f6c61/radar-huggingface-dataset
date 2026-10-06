# dev-amarnadh-gandham/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal denso con encoder de visión, publicado en HuggingFace por el usuario `dev-amarnadh-gandham` bajo licencia Apache 2.0. Según la model card, se trata de la generación Qwen3.8 de la familia abierta de Qwen, construida sobre la base arquitectónica de Qwen3.5 y orientada a cargas de trabajo de código, trabajo profesional, investigación y tareas agénticas de horizonte largo. El modelo combina comprensión nativa de imagen y vídeo con control flexible del modo de razonamiento.

La arquitectura es híbrida: 64 capas organizadas en 16 bloques de la forma 3 × (Gated DeltaNet → FFN) + 1 × (Gated Attention → FFN), es decir, tres capas de atención lineal por cada capa de atención completa. El recuento real de parámetros en los ficheros safetensors del repositorio es de 27.781.427.952 (unos 27,8 B), con dimensión oculta de 5120 y vocabulario de 248.320 tokens con padding. La longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000.

Es relevante ahora porque ocupa el nicho de modelo denso "compacto y desplegable" con visión nativa, predicción multi-token (MTP) y soporte declarado para vLLM, SGLang y TokenSpeed, lo que facilita su integración en stacks de producción existentes. Conviene señalar que el repositorio tiene 17 descargas, 0 likes y fue creado el 6 de octubre de 2026 por un autor no oficial; la model card reproduce texto de la documentación de Qwen y su tabla de benchmarks aparece truncada, por lo que la trazabilidad del artefacto no está garantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con encoder de visión; atención híbrida Gated DeltaNet (atención lineal) + Gated Attention |
| Parametros totales | 27.781.427.952 (≈27,8 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension oculta | 5120 |
| Numero de capas | 64 |
| Layout de capas | 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Gated DeltaNet | 48 cabezas de atención lineal para V, 16 para QK; dimension de cabeza 128 |
| Gated Attention | 24 cabezas para Q, 4 para KV; dimension de cabeza 256; RoPE de 64 dimensiones |
| FFN (dimension intermedia) | 17.408 |
| Token embedding / LM output | 248.320 (con padding) |
| Prediccion multi-token (MTP) | entrenado con multiples pasos |
| Tamano del repositorio | 55,6 GB |
| Libreria declarada | transformers |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con encoder de visión, entrenado en dos etapas (pre-entrenamiento y post-entrenamiento). Su rasgo arquitectónico principal es la alternancia de dos mecanismos de atención dentro de cada bloque de 4 capas: tres capas usan Gated DeltaNet, un mecanismo de atención lineal con 48 cabezas para el valor y 16 para query/key con dimensión de cabeza 128, mientras que la cuarta capa usa Gated Attention completa con 24 cabezas de query y 4 de key/value con dimensión de cabeza 256 y RoPE de 64 dimensiones. Esta proporción 3:1 entre atención lineal y atención completa es el mecanismo habitual para sostener contextos largos reduciendo el coste cuadrático de la atención.

El bloque feed-forward tiene dimensión intermedia de 17.408 y el vocabulario es de 248.320 tokens con padding. El modelo incorpora predicción multi-token (MTP) entrenada con múltiples pasos, lo que habilita decodificación especulativa nativa. La model card declara además mejoras en ejecución agéntica (planificación autónoma y manejo de feedback del entorno), control flexible del razonamiento mediante los parámetros `reasoning_effort` y `preserve_thinking`, y comprensión nativa de imagen y vídeo, incluyendo vídeos de hasta una hora de duración. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF, DPO u otras técnicas de alineamiento.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento activado por defecto y desactivable por petición.
- Control de profundidad de razonamiento mediante `reasoning_effort` y retención del contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Codificación en terminal de forma agéntica (la model card menciona Terminal Bench 2.1 / Terminus como benchmark de referencia).
- Trabajo profesional e investigación, según los incrementos declarados por el autor.
- Comprensión de imagen y vídeo de forma nativa: diagramas STEM, documentos y vídeos de escala horaria.
- Ejecución agéntica de horizonte largo: planificación autónoma y gestión de feedback del entorno.
- Predicción multi-token (MTP) entrenada con múltiples pasos, aprovechable para decodificación especulativa.
- Compatibilidad declarada con Transformers, vLLM, SGLang y TokenSpeed.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible (la model card menciona "herramientas integradas oficiales" solo para la versión alojada en Qwen Cloud).
- Idiomas soportados: no disponible.

## Casos de uso

- Automatización de agentes de terminal y CI/CD: el modelo está entrenado para codificación agéntica en terminal, de modo que puede recibir el estado del repositorio, ejecutar comandos, interpretar la salida y corregir errores de forma iterativa en pipelines de integración continua.
- Análisis de documentación técnica escaneada: gracias al encoder de visión nativo, puede extraer y razonar sobre diagramas, tablas y documentos PDF renderizados como imagen sin depender de un pipeline OCR externo.
- Revisión de vídeos formativos o grabaciones de incidencias: con soporte declarado para vídeos de hasta una hora, resulta adecuado para resumir sesiones, extraer pasos de reproducción de fallos o generar actas automáticas.
- Asistente de investigación con contexto largo: los 262.144 tokens nativos permiten cargar varios artículos completos más notas propias en una sola ventana, manteniendo coherencia entre referencias cruzadas.
- Razonamiento sobre diagramas STEM: la comprensión de figuras técnicas permite resolver problemas de ingeniería o matemáticas a partir de la imagen del enunciado, útil en herramientas educativas.
- Migración y refactorización de código heredado: con contexto extensible a 1.000.000 de tokens puede procesar bases de código grandes de una vez y proponer cambios coherentes entre módulos.
- Agentes de soporte técnico multi-turno: la retención de contexto de razonamiento mediante `preserve_thinking` evita repetir cadenas de diagnóstico en conversaciones largas.
- Despliegue on-premise con datos sensibles: al ser un modelo denso de 27,8 B con licencia Apache 2.0, puede servirse en infraestructura propia sin dependencia de API externa.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa cuyas columnas son Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, con categorías como Coding (Agentic terminal coding, Terminal Bench 2.1 / Terminus). Sin embargo, en la información proporcionada la tabla aparece truncada y no se han extraído valores numéricos para ninguna fila.

No se han podido recuperar resultados de benchmarks numéricos en la información disponible. Los únicos identificadores de benchmark mencionados son Terminal Bench 2.1 (variante Terminus), sin cifras asociadas.

## Requisitos de hardware

- Pesos en precisión completa: el repositorio ocupa 55,6 GB, coherente con almacenamiento en bf16/fp16 para 27,78 B de parámetros. La inferencia en bf16 requiere del orden de 56 GB solo para pesos, más la caché KV del contexto utilizado.
- GPU profesionales recomendadas para bf16: A100 80 GB, H100 80 GB o H200 141 GB. La serie A100 de 40 GB no es suficiente para pesos y caché en bf16.
- Cuantización de 8 bits: el modelo ocuparía del orden de 28 GB, lo que encaja en A6000 48 GB o L40S 48 GB, y queda ajustado en RTX 5090 32 GB.
- Cuantización de 4 bits: del orden de 14-16 GB, lo que permitiría ejecución en GPU de consumo como RTX 4090, RTX 3090 o RTX 5090, con margen limitado para contextos muy largos.
- Consumer GPU: no cabe en bf16 en ninguna GPU de consumo actual (24-32 GB). Sí es viable en 4 bits en RTX 4090/3090 (24 GB) y RTX 5090 (32 GB).
- Opciones de despliegue declaradas por el autor: Hugging Face Transformers, vLLM, SGLang y TokenSpeed. El soporte de llama.cpp, Ollama, GGUF o TGI no está confirmado en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La model card referencia como alternativas a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se dispone de sus especificaciones ni de resultados numéricos en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B (este repositorio) | 27,78 B (denso) | 262.144 nativo / 1.000.000 extensible | Apache 2.0 | Pesos en HuggingFace (repositorio de terceros) |
| Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer-30B | no disponible | no disponible | no disponible | no disponible |
| Opus4.6 Max | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Trazabilidad del artefacto: el repositorio pertenece a `dev-amarnadh-gandham`, no a la organización oficial de Qwen. Tiene 17 descargas, 0 likes y fue creado y actualizado el mismo día. No hay garantía de que los pesos correspondan a un entrenamiento verificado.
- Model card no verificada: el texto reproduce fragmentos de la documentación de Qwen, incluye enlaces a un servicio no confirmado (`qwencloud.com`) y menciona modelos de comparación que no se han podido validar.
- Tabla de benchmarks incompleta: las cifras de rendimiento no están disponibles en la información proporcionada, por lo que no es posible validar las afirmaciones de mejora del autor.
- Idiomas soportados: no disponibles. No se debe asumir cobertura multilingüe sin verificación previa.
- Cuantizaciones: no se documentan formatos cuantizados oficiales (GGUF, AWQ, GPTQ), lo que puede complicar el despliegue en hardware limitado.
- Riesgo de alucinación: no hay datos publicados de evaluación de fidelidad ni tasas de alucinación para este artefacto concreto.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero esa licencia la declara el autor del repositorio; conviene verificar que el artefacto derivado respeta las condiciones de la licencia del modelo original.
- Longitud de contexto real: la extensión hasta 1.000.000 de tokens se describe como capacidad de extensión, no como contexto nativo; el rendimiento efectivo en ventanas extremas no está cuantificado.
- Modo de razonamiento activado por defecto: puede incrementar el coste de inferencia y la latencia si no se desactiva explícitamente o se ajusta con `reasoning_effort`.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dev-amarnadh-gandham/Qwen3.8-27B
- Qwen Cloud (servicio mencionado en la model card): https://www.qwencloud.com
- Página del modelo en Qwen Cloud (mencionada en la model card): https://www.qwencloud.com/models/qwen3.8-27b
- Paper, blog técnico o repositorio de código oficial: no disponible en la información proporcionada. Los resultados de la búsqueda web recibidos (DEV Community, Dev-C++, DeviantArt) no guardan relación con el modelo y se han descartado.
