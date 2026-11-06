# mdcreativeagent/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso de 27 781 427 952 parámetros (27,78 B) con codificador de visión nativo, publicado por el equipo Qwen de Alibaba bajo licencia Apache 2.0. Se distribuye en el repositorio de Hugging Face `mdcreativeagent/Qwen3.8-27B` (55,6 GB) en formato safetensors y es compatible con Transformers, vLLM, SGLang y TokenSpeed. Es la generación más reciente de la familia abierta Qwen y se presenta como la versión compacta y desplegable de la línea Qwen3.8, orientada a código, trabajo profesional, investigación y tareas agénticas de horizonte largo.

El modelo emplea una arquitectura híbrida de atención: 64 capas organizadas en 16 bloques de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`, combinando atención lineal (Gated DeltaNet) con atención clásica con RoPE. Incorpora Multi-Token Prediction (MTP) entrenado con varios pasos, lo que habilita decodificación especulativa. La longitud de contexto nativa es de 262 144 tokens, extensible hasta 1 000 000.

Su relevancia actual radica en que ofrece comprensión nativa de imagen y vídeo (incluidos vídeos de hasta una hora), control flexible del modo de razonamiento (`reasoning_effort`, `preserve_thinking`) y una mejora declarada en planificación autónoma y manejo de retroalimentación del entorno, todo en un tamaño que cabe en hardware de una sola máquina con cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal LM denso con codificador de visión; híbrido Gated DeltaNet (atención lineal) + Gated Attention, 64 capas en 16 bloques `3×(Gated DeltaNet→FFN)→1×(Gated Attention→FFN)` |
| Parámetros totales | 27 781 427 952 (27,78 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 000 000 |
| Tipos de cuantización | No disponible en la información proporcionada (pesos publicados en safetensors; el ecosistema Transformers/vLLM/SGLang admite cuantizaciones habituales, pero no se detallan) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (Transformers) |

Otros datos arquitectónicos: dimensión oculta 5120; embedding y salida LM de 248 320 (con padding); FFN con dimensión intermedia 17 408; Gated DeltaNet con 48 cabezas lineales para V y 16 para QK, dimensión de cabeza 128; Gated Attention con 24 cabezas para Q y 4 para KV, dimensión de cabeza 256 y dimensión RoPE 64.

## Arquitectura y entrenamiento

El modelo es un transformer causal denso que alterna capas de atención lineal Gated DeltaNet con capas de atención completa (Gated Attention). Este diseño híbrido reduce el coste computacional y de memoria en contextos largos manteniendo la capacidad de atención global cada cuatro capas. La inclusión de MTP entrenado con múltiples pasos permite decodificación especulativa y mejora el throughput de generación. El codificador de visión es nativo, no un adaptador añadido, lo que habilita entrada image-text-to-text y comprensión de vídeo.

El entrenamiento consta de fases de preentrenamiento y postentrenamiento, según la model card. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles de alineación (RLHF, DPO u otros). Sí se documenta el control flexible del razonamiento: el modo thinking está activo por defecto, puede desactivarse por petición, su profundidad se ajusta con `reasoning_effort` y el contexto de razonamiento histórico se conserva mediante `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento con modo thinking configurable (activado por defecto, desactivable por petición).
- Codificación, incluida la codificación agéntica en terminal (evaluada en Terminal Bench 2.1 Terminus).
- Comprensión nativa de imágenes: diagramas STEM, documentos y capturas.
- Comprensión de vídeo, incluidos vídeos de hasta una hora de duración.
- Planificación autónoma y ejecución de tareas agénticas de horizonte largo, con manejo de retroalimentación del entorno.
- Multi-Token Prediction (MTP) para decodificación especulativa.
- Compatibilidad con harnesses y herramientas de desarrollo habituales (según la model card).
- Capacidades multilingües: no se detalla la lista de idiomas.
- Tool calling / function calling: no se detalla explícitamente en la información disponible, aunque la orientación agéntica y la mención de "herramientas integradas oficiales" en la versión alojada sugieren soporte; no se confirma en los pesos abiertos.

## Casos de uso

- Automatización de oficina: el modelo está posicionado por el autor para tareas de productividad de oficina sobre texto y documentos visuales; puede procesar capturas, PDF escaneados y hojas de cálculo renderizadas como imagen y devolver texto estructurado, gracias al codificador de visión nativo.
- Codificación agéntica en terminal: con contexto de 262 144 tokens puede mantener el estado de un repositorio completo y ejecutar ciclos de planificación, edición y verificación; encaja en harnesses de agentes de CI/CD que necesitan razonamiento multi-paso.
- Análisis de vídeo largo: la ventana extensible a 1 000 000 tokens y la comprensión de vídeos de hasta una hora permiten resumir reuniones, extraer acciones o auditar grabaciones sin fragmentación manual.
- Investigación asistida: lectura de artículos con figuras y tablas (diagramas STEM) y generación de resúmenes o extracción de datos, aprovechando la modalidad imagen-texto.
- Atención al cliente con contexto largo: conversaciones multi-turno con historial extenso e imágenes adjuntas (capturas de error, facturas), manteniendo el razonamiento histórico con `preserve_thinking`.
- Despliegue local en una sola máquina: al ser un modelo denso de 27 B con licencia Apache 2.0, es apto para entornos con requisitos de soberanía de datos que no pueden usar API externas.
- Generación de código en producción: integración en pipelines mediante vLLM o SGLang, con MTP para aumentar el throughput en tareas de autocompletado y revisión.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero en la información proporcionada solo se conserva la cabecera y el nombre de la primera fila (Terminal Bench 2.1 Terminus, categoría Coding); los valores numéricos no están disponibles.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Resto de benchmarks de la tabla | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados numéricos de MMLU, HumanEval, GSM8K ni otros benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55,6 GB solo para pesos (el tamaño del repo es de 55,6 GB), más KV cache y activaciones; se recomienda un mínimo de 64-80 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 28-30 GB de pesos, más overhead; viable en GPUs de 40-48 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 14-16 GB de pesos; potencialmente ejecutable en GPUs consumer de 24 GB, aunque no se confirman cuantizaciones publicadas.
- GPUs recomendadas: A100 80 GB, H100 80 GB para BF16 sin cuantizar; L40S 48 GB o A6000 48 GB con cuantización de 8 bits; RTX 4090 24 GB solo con cuantización agresiva y contexto reducido.
- Cabe en GPU consumer: probable únicamente con cuantización de 4 bits y ventana de contexto recortada; no confirmado por el autor.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- Latencia y throughput: no disponibles. El uso de MTP sugiere ganancias por decodificación especulativa, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Modalidad | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,78 B densos | 262 144 (hasta 1 M) | Apache 2.0 | Texto + imagen + vídeo | Pesos abiertos en HF |
| Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible | Referenciado en la model card |
| Muse Glimmer-30B | ~30 B (por nombre) | no disponible | no disponible | no disponible | Referenciado en la model card |
| Qwen3.7-Plus | no disponible | no disponible | no disponible (servicio propietario) | no disponible | API de Alibaba Cloud |

Los datos de rendimiento comparado no están disponibles en la información proporcionada; la model card los incluye pero no se han podido recuperar los valores.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos; no se publican tasas de factualidad ni evaluaciones de calibración.
- El repositorio de Hugging Face indicado (`mdcreativeagent/Qwen3.8-27B`) figura con 0 descargas y 0 likes y fue creado el 6 de noviembre de 2026; conviene verificar la procedencia y comparar los pesos con la distribución oficial antes de usarlo en producción.
- La lista de idiomas soportados no está disponible; no se debe asumir cobertura multilingüe amplia sin evaluación propia.
- El contexto de 1 000 000 tokens es una extensión sobre los 262 144 nativos; el rendimiento en la ventana extendida no está cuantificado.
- El soporte de tool calling en los pesos abiertos no se confirma explícitamente; las herramientas integradas oficiales se mencionan para la versión alojada en Qwen Cloud.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse que los pesos del repositorio de terceros mantienen esa licencia y no incorporan material con restricciones adicionales.
- No se detallan requisitos de hardware oficiales ni cuantizaciones publicadas; los cálculos de VRAM de esta ficha son estimaciones basadas en el tamaño del repo.

## Enlaces

- Hugging Face: https://huggingface.co/mdcreativeagent/Qwen3.8-27B
- Página del modelo en Alibaba Cloud Model Studio: https://www.alibabacloud.com/help/en/model-studio/qwen3-8-27b
- Repositorio GitHub oficial de Alibaba Cloud: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Qwen Cloud (servicio alojado, próximamente): https://www.qwencloud.com
- Overview del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
