# mrcarrot80/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión publicado en HuggingFace bajo el identificador `mrcarrot80/Qwen3.8-27B`. El repositorio lo firma el usuario `mrcarrot80`, no una organización oficial, y en el momento de la consulta acumula 0 descargas y 0 likes, con un tamaño de 55,6 GB y 27.781.427.952 parámetros reales en safetensors. La model card se presenta como la generación Qwen3.8 de la familia abierta de Qwen, construida sobre la base arquitectónica de Qwen3.5 y orientada a codificación, trabajo profesional, investigación y tareas agénticas de horizonte largo.

Técnicamente se trata de un modelo denso (no MoE) de 27B con una arquitectura híbrida: 64 capas organizadas en 16 bloques de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`, es decir, atención lineal con Gated DeltaNet en tres de cada cuatro capas y atención completa con GQA en la cuarta. Incorpora un codificador de visión nativo para entender imágenes y vídeo, y entrena Multi-Token Prediction (MTP) con múltiples pasos. El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000, y el modo de razonamiento está activado por defecto con control mediante `reasoning_effort` y `preserve_thinking`.

Su relevancia potencial reside en el formato: un modelo denso de 27B con visión, contexto muy largo y atención lineal mayoritaria es un objetivo atractivo para despliegue en una sola GPU de 80 GB o en dos de 48 GB, en un rango de tamaño donde escasean las alternativas abiertas con ventana de 256k. Ahora bien, la información proporcionada no permite verificar la procedencia oficial del checkpoint ni validar sus resultados: la tabla de benchmarks de la model card aparece truncada y no contiene valores numéricos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido: 16 bloques de `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`; incluye codificador de visión y MTP (Multi-Token Prediction) |
| Parametros totales | 27.781.427.952 (27,78B, dato real de safetensors) |
| Parametros activos | No aplica: modelo denso |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con HuggingFace Transformers, vLLM, SGLang y TokenSpeed) |
| Dimension oculta | 5.120 |
| Numero de capas | 64 |
| Token embedding / LM output | 248.320 (padded) |
| Gated DeltaNet | 48 cabezas de atención lineal para V, 16 para QK, dimension de cabeza 128 |
| Gated Attention | 24 cabezas para Q, 4 para KV, dimension de cabeza 256, RoPE de dimension 64 |
| FFN | Dimension intermedia 17.408 |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 55,6 GB |
| Fecha de creacion | 2026-10-01 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con dos mecanismos de atención mezclados en proporción 3:1 dentro de cada bloque. Las capas de Gated DeltaNet usan atención lineal con 48 cabezas para los estados de valor y 16 para consulta/clave con dimensión de cabeza 128, lo que reduce el coste de memoria de la caché de claves y valores en secuencias largas. Cada cuatro capas aparece una capa de Gated Attention convencional con 24 cabezas de consulta y 4 de clave/valor (GQA 6:1), dimensión de cabeza 256 y RoPE de dimensión 64. La FFN tiene dimensión intermedia 17.408 y el vocabulario de entrada y salida está fijado en 248.320 entradas con padding. Según la model card, se trata de un modelo denso y "deployment-friendly", no de una mezcla de expertos.

El entrenamiento declarado abarca pre-entrenamiento y post-entrenamiento, e incluye Multi-Token Prediction (MTP) entrenado con múltiples pasos, una técnica habitual para habilitar decodificación especulativa con cabezas auxiliares. La model card describe también control flexible del razonamiento: modo thinking activado por defecto y desactivable por petición, ajuste de profundidad mediante `reasoning_effort` y retención del contexto de razonamiento de mensajes previos mediante `preserve_thinking`. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron RLHF, DPO u otras técnicas de alineamiento concretas. Tampoco se detalla la arquitectura del codificador de visión ni su resolución o número de parches.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `conversational`.
- Razonamiento con modo thinking activado por defecto, desactivable por petición, y profundidad de razonamiento ajustable mediante `reasoning_effort`.
- Retención del razonamiento de mensajes históricos mediante `preserve_thinking`.
- Comprensión de imágenes y vídeo de forma nativa (vision-language model), incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración según la model card.
- Codificación: la model card declara mejoras en tareas de programación y en codificación agéntica de terminal.
- Ejecución agéntica: planificación autónoma y manejo de la realimentación del entorno para completar tareas de extremo a extremo.
- Soporte de contexto largo: 262.144 tokens nativos, extensibles a 1.000.000.
- Compatibilidad declarada con harnesses y herramientas de desarrollo populares, vLLM, SGLang y TokenSpeed.
- Tool calling / function calling: no documentado explícitamente para el checkpoint abierto; la model card menciona "official built-in tools" únicamente para la versión alojada en Qwen Cloud.
- Capacidades de audio: no disponibles.
- Idiomas soportados: no disponible.

## Casos de uso

- Agentes de terminal y automatización de DevOps: el modelo está entrenado explícitamente para codificación agéntica de terminal (Terminal Bench 2.1), por lo que puede encadenar comandos, leer la salida del entorno y corregir errores en tareas de despliegue o mantenimiento de sistemas.
- Asistentes de programación en producción: con 262.144 tokens de contexto puede cargar varios ficheros de un repositorio, entender dependencias cruzadas y sostener refactorizaciones largas sin perder el hilo; su compatibilidad con vLLM y SGLang facilita integrarlo en pipelines de CI/CD o en servidores de completado.
- Análisis de documentación técnica escaneada: al ser un modelo nativo de imagen-texto, puede extraer tablas, diagramas y esquemas de PDFs y manuales, y responder preguntas sobre su contenido sin necesidad de un pipeline OCR separado.
- Revisión de vídeo largo para soporte y formación: la model card declara comprensión de vídeos de hasta una hora, lo que permite resumir sesiones grabadas, extraer pasos de procedimientos o indexar incidencias.
- Investigación asistida sobre corpus extensos: la ventana de 262k tokens permite cargar artículos completos, informes regulatorios o transcripciones y hacer preguntas de síntesis con trazabilidad al documento original.
- Atención al cliente técnica multi-turno: el modo thinking desactivable permite alternar entre respuestas rápidas de bajo coste y respuestas razonadas cuando la consulta lo exige, controlando la latencia por petición con `reasoning_effort`.
- Automatización de tareas de oficina profesional: generación de borradores, resúmenes de reuniones y normalización de datos a partir de capturas o documentos, aprovechando la entrada multimodal.
- Extracción estructurada de información de imágenes y formularios: combinación de comprensión visual y generación de salida estructurada para poblar bases de datos internas.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa frente a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, con secciones de "Coding" y un primer apartado de "Agentic terminal coding" medido con Terminal Bench 2.1 (Terminus). Sin embargo, el contenido proporcionado está truncado y no incluye ningún valor numérico de esa tabla ni de las filas restantes. Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

Del conjunto de la tabla solo consta la estructura: métrica Terminal Bench 2.1 (Terminus), bajo la categoría "Agentic terminal coding", con columnas para Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, todas sin valores extraíbles. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ningún otro benchmark en la información facilitada.

## Requisitos de hardware

- Peso de los pesos: el repositorio ocupa 55,6 GB, coherente con 27,78B parámetros en BF16/FP16. La inferencia en BF16 requiere al menos 56 GB solo para pesos.
- VRAM estimada en BF16: aproximadamente 58-64 GB para pesos y activaciones base; añadir la caché KV según contexto.
- VRAM estimada en cuantización de 8 bits: en torno a 28-32 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 15-18 GB, aunque no se documentan pesos GGUF, AWQ ni GPTQ en el repositorio, por lo que habría que generarlos.
- Caché KV: solo 16 de las 64 capas son de atención completa. Con 4 cabezas KV de dimensión 256 en 16 capas, cada token ocupa 2 × 4 × 256 × 16 = 32.768 elementos, es decir 64 KiB por token en BF16. Con 262.144 tokens esto supone del orden de 16 GiB adicionales antes de optimizaciones como cuantización de la caché o atención por ventana. Cálculo orientativo, no confirmado por el autor.
- GPU recomendadas: para BF16 sin cuantizar, 2 × A100 80 GB o 2 × H100 80 GB; también 2 × L40S 48 GB o 2 × RTX 6000 Ada 48 GB si se acepta cuantización o reparto de capas.
- GPU de consumo: no cabe en una RTX 4090 de 24 GB en BF16. Sí podría ejecutarse en una RTX 4090 o RTX 5090 con cuantización de 4 bits y contexto moderado, o en configuraciones multi-GPU de 24 GB repartiendo capas.
- Opciones de despliegue: HuggingFace Transformers, vLLM, SGLang y TokenSpeed según la model card. Para cuantización ligera en hardware de consumo sería necesario convertir a GGUF (por ejemplo, para llama.cpp u Ollama), algo que el repositorio no ofrece actualmente.
- Latencia y throughput: no disponibles. El uso de MTP abre la puerta a decodificación especulativa, pero no se aportan cifras de tokens por segundo en la información facilitada.

## Comparativa con modelos similares

La model card propone un conjunto de comparación, pero no se dispone de especificaciones ni resultados de esas alternativas en la información proporcionada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,78B (denso) | 262.144 nativos, hasta 1.000.000 | Sin valores en la informacion disponible | Apache 2.0 | Checkpoint en HuggingFace, 0 descargas |
| Qwen3.6-27B | No disponible | No disponible | No disponible | No disponible | Referenciado en la tabla de la model card |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | Referenciado en la tabla de la model card |
| Muse Glimmer-30B | No disponible | No disponible | No disponible | No disponible | Referenciado en la tabla de la model card |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible | Referenciado como modelo propietario de comparacion |

No se dispone de información suficiente para establecer una comparativa técnica verificable con alternativas abiertas de la misma categoría (modelos densos multimodales de 25-35B). Cualquier comparación de rendimiento basada en la información facilitada sería especulativa.

## Limitaciones y advertencias

- Procedencia no verificada: el repositorio lo publica el usuario `mrcarrot80`, no una organización oficial, con 0 descargas y 0 likes en el momento de la consulta. No hay confirmación en la información proporcionada de que corresponda a un lanzamiento oficial de Qwen.
- Benchmarks no verificables: la tabla de la model card está truncada y sin valores, de modo que las afirmaciones de mejora en codificación, trabajo profesional e investigación no están respaldadas por datos extraíbles.
- Riesgo de alucinación: no disponible; no se documentan tasas de alucinación ni evaluaciones de fidelidad factual.
- Sesgos conocidos: no disponibles; no se documenta ninguna evaluación de sesgo, toxicidad o equidad.
- Idiomas soportados: no disponible. No se puede confirmar el nivel de calidad en castellano ni en otras lenguas distintas del inglés.
- Restricciones de licencia: licencia Apache 2.0 según los metadatos, lo que en principio permite uso comercial, modificación y redistribución. No obstante, al tratarse de una publicación de terceros sin verificación oficial, conviene revisar la procedencia de los pesos antes de un uso comercial.
- Fecha de creación declarada 2026-10-01, posterior al periodo habitual de publicación de modelos; conviene contrastar la autenticidad del repositorio.
- Cuantizaciones ausentes: no hay GGUF, AWQ ni GPTQ publicados, lo que eleva la barrera de entrada en hardware de consumo y obliga a generar las conversiones.
- Coste de contexto: con 262.144 tokens la caché KV en BF16 ronda los 16 GiB, por lo que el contexto máximo exige hardware de gama alta o cuantización de la caché.
- Tool calling: no documentado explícitamente para el checkpoint abierto; la mención a herramientas integradas se refiere a la versión alojada en Qwen Cloud.
- Sin datos de despliegue: no se publican cifras de latencia, throughput ni consumo energético, lo que dificulta la planificación de capacidad en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mrcarrot80/Qwen3.8-27B
- Qwen Cloud (servicio de inferencia gestionada mencionado en la model card): https://www.qwencloud.com
- Página del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Paper, blog técnico, repositorio de código o demo: no disponibles en la información proporcionada.
