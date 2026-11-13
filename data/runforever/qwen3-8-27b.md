# Runforever/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión desarrollado por el equipo Qwen (Alibaba), publicado en Hugging Face bajo el identificador Runforever/Qwen3.8-27B. Se trata de la variante densa de 27.781 millones de parámetros de la generación Qwen3.8, construida sobre la base arquitectónica de Qwen3.5 y orientada a tareas de codificación, trabajo profesional, investigación y flujos agénticos de largo horizonte. Es un modelo nativo visión-lenguaje: comprende imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.

La arquitectura combina capas de atención lineal Gated DeltaNet con capas de atención con compuertas (Gated Attention) en un patrón híbrido de 64 capas, e incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos. El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000. El modelo incorpora control flexible de razonamiento: el modo thinking está activado por defecto, puede desactivarse por petición y su profundidad se ajusta mediante el parámetro `reasoning_effort`, con retención del contexto de razonamiento histórico mediante `preserve_thinking`.

Su relevancia actual radica en que ofrece capacidades de agente autónomo y comprensión multimodal en un tamaño compacto y desplegable, con licencia Apache 2.0 y compatibilidad declarada con Transformers, vLLM, SGLang y TokenSpeed. El repositorio ocupa 55,6 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión; 16 bloques de (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), 64 capas en total |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible en la información proporcionada |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (Transformers) |

Otros datos técnicos: dimensión oculta 5120; embedding de tokens 248.320 (con padding); salida LM 248.320 (con padding); dimensión intermedia de la FFN 17.408. Gated DeltaNet: 48 cabezas de atención lineal para V y 16 para QK, dimensión de cabeza 128. Gated Attention: 24 cabezas para Q y 4 para KV, dimensión de cabeza 256, dimensión de RoPE 64. MTP entrenado con múltiples pasos.

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con codificador de visión acoplado, entrenado en dos etapas: preentrenamiento y postentrenamiento. La innovación arquitectónica principal es el layout híbrido de atención: por cada bloque de cuatro subcapas, tres emplean Gated DeltaNet (atención lineal con 48 cabezas para V y 16 para QK, dimensión 128) y una emplea Gated Attention clásica (24 cabezas Q, 4 cabezas KV, dimensión 256, RoPE de 64 dimensiones). Este diseño persigue eficiencia en contextos largos reduciendo el coste cuadrático de la atención en la mayor parte de las capas, manteniendo atención completa en una de cada cuatro.

El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que habilita decodificación especulativa y mejora el throughput de generación. La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO; estos datos figuran como no disponibles. El modelo se distribuye como modelo postentrenado, con modo thinking activado por defecto y control de profundidad de razonamiento por petición.

## Capacidades

- Generación de texto y razonamiento con modo thinking configurable (`reasoning_effort`) y desactivable por petición.
- Codificación de software, incluyendo tareas de terminal agéntico (evaluado en Terminal Bench 2.1 Terminus).
- Trabajo profesional y tareas de investigación.
- Ejecución agéntica de largo horizonte: planificación autónoma y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Comprensión visión-lenguaje nativa: imágenes y vídeos, desde diagramas STEM y documentos hasta vídeos de escala horaria.
- Retención de contexto de razonamiento entre mensajes históricos mediante `preserve_thinking`.
- Compatibilidad con harnesses y herramientas de desarrollo populares (downstream compatibility).
- Soporte de tool calling / function calling: no se detalla explícitamente en la información proporcionada, aunque la orientación agéntica y la mención de "official built-in tools" en el servicio alojado sugieren soporte; no confirmado para los pesos locales.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Automatización de tareas de terminal y CI/CD: el modelo está evaluado específicamente en Terminal Bench 2.1 (Terminus), por lo que puede emplearse como agente que interpreta salidas de shell, ejecuta comandos y corrige errores en pipelines de integración continua.
- Agentes autónomos de largo horizonte: su planificación autónoma y manejo de feedback del entorno lo hacen adecuado para flujos multi-paso que requieren decenas de iteraciones, como migraciones de código o tareas de mantenimiento de repositorios.
- Análisis de documentos técnicos y diagramas STEM: al ser un modelo visión-lenguaje nativo, puede extraer información de figuras, esquemas y PDFs técnicos, útil en ingeniería, investigación y documentación científica.
- Procesamiento de vídeo de larga duración: con soporte para vídeos de escala horaria, resulta aplicable a resumen y extracción de eventos en grabaciones de reuniones, clases o monitorización.
- Asistencia a investigación: razonamiento con thinking controlable y contexto de 262.144 tokens permite trabajar con corpus extensos de papers y mantener cadenas de razonamiento auditables.
- Atención al cliente técnica multi-turno: la ventana de contexto nativa y la retención de razonamiento histórico (`preserve_thinking`) permiten conversaciones largas con trazabilidad del razonamiento.
- Despliegue en infraestructura propia: con licencia Apache 2.0 y compatibilidad con vLLM, SGLang y TokenSpeed, es apto para entornos on-premise con requisitos de soberanía de datos.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, organizada por categorías (Coding, entre otras). Sin embargo, en la información proporcionada solo se ha conservado la cabecera de la tabla y la primera fila de categoría ("Agentic terminal coding — Terminal Bench 2.1 (Terminus)"); los valores numéricos de las celdas no están disponibles en el extracto recibido.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Resto de benchmarks (Coding, Professional Work, Research, Agentic) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible los valores numéricos del resto de benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se requieren 2 × GPU de 48 GB o una GPU de 80 GB para contexto moderado.
- Con cuantización a 8 bits: en torno a 28-30 GB de pesos, viable en una única GPU de 40-48 GB.
- Con cuantización a 4 bits: en torno a 14-16 GB de pesos, potencialmente viable en GPUs de consumo como RTX 4090 (24 GB) o RTX 5090, aunque con contexto limitado por la caché KV.
- GPUs recomendadas: A100 80 GB, H100 80 GB, H200 para despliegues en BF16; L40S o A6000 para cuantizaciones de 8 bits.
- Opciones de despliegue declaradas por el autor: Hugging Face Transformers, vLLM, SGLang y TokenSpeed.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El uso de MTP con decodificación especulativa debería mejorar el throughput frente a decodificación autoregresiva estándar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27B denso | 262.144 (ext. 1M) | Apache 2.0 | Sí (imagen y vídeo) | Hugging Face (Runforever/Qwen3.8-27B) |
| Qwen3.6-27B | 27B (no confirmado) | no disponible | no disponible | no disponible | Referenciado en la model card |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Referenciado en la model card (posible servicio propietario) |
| Muse Glimmer-30B | 30B (según nombre) | no disponible | no disponible | no disponible | Referenciado en la model card |
| Opus4.6 Max | no disponible | no disponible | Propietaria (no confirmado) | no disponible | Referenciado en la model card |

Los datos de parámetros, contexto y licencia de los modelos comparables no están disponibles en la información proporcionada; solo se conocen sus nombres por aparecer en la tabla de benchmarks de la model card. El rendimiento relativo no puede evaluarse sin los valores numéricos.

## Limitaciones y advertencias

- El repositorio figura bajo el autor "Runforever" y no bajo una organización oficial de Qwen; conviene verificar la procedencia y autenticidad de los pesos antes de usarlos en producción.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha (2026-11-13), lo que indica una publicación muy reciente y sin validación comunitaria.
- La model card menciona un servicio alojado en Qwen Cloud "coming soon"; no debe asumirse disponibilidad inmediata de la API.
- No se especifican los idiomas soportados; el rendimiento en castellano no está documentado.
- No se detallan los datos de entrenamiento (tokens, composición, RLHF/DPO), lo que impide evaluar sesgos conocidos o cobertura lingüística.
- Riesgo de alucinación inherente a los modelos de lenguaje generativos; no se aportan tasas de error ni evaluaciones de fidelidad.
- El modo thinking activado por defecto incrementa el consumo de tokens y la latencia; en producción conviene desactivarlo o ajustar `reasoning_effort` según la tarea.
- Aunque la licencia es Apache 2.0, que permite uso comercial, la ausencia de documentación sobre el dataset de entrenamiento puede plantear riesgos de compliance en determinados sectores.
- El tamaño de 55,6 GB en safetensors implica requisitos de hardware significativos; el despliegue en GPUs de consumo exige cuantización, cuyas opciones no están documentadas en la información disponible.
- Los benchmarks publicados no pueden contrastarse al faltar los valores numéricos en la información recibida.

## Enlaces

- Hugging Face: https://huggingface.co/Runforever/Qwen3.8-27B
- Qwen Cloud (servicio alojado, próximamente): https://www.qwencloud.com
- Página del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
