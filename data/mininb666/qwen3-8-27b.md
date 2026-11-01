# Mininb666/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión desarrollado por el equipo Qwen (Alibaba), publicado en HuggingFace bajo el identificador `Mininb666/Qwen3.8-27B`. Se trata de un modelo denso de 27.781.427.952 parámetros (aproximadamente 27,8 mil millones) que forma parte de la generación Qwen3.8, construida sobre la base arquitectónica de Qwen3.5 y sucesora de las series Qwen3.5 y Qwen3.6. El modelo está diseñado para tareas de codificación, trabajo profesional, investigación y tareas agénticas de largo horizonte, con un enfoque explícito en la finalización fiable de tareas de múltiples pasos.

La arquitectura combina un transformer híbrido con capas de atención lineal Gated DeltaNet y capas de atención con compuertas (Gated Attention), organizadas en un patrón de 16 bloques repetidos de la forma 3 × (Gated DeltaNet → FFN) seguido de 1 × (Gated Attention → FFN), hasta un total de 64 capas. Incorpora además Multi-Token Prediction (MTP) entrenado con múltiples pasos. El modelo es nativo visión-lenguaje: procesa imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración. Su longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000.

Su relevancia actual reside en que ofrece capacidades agénticas y de razonamiento de una generación avanzada en un tamaño compacto y desplegable (27B denso), con licencia Apache 2.0, lo que facilita su integración en infraestructuras propias. Incluye control flexible del modo de razonamiento (activado por defecto, desactivable por petición, con ajuste de profundidad mediante `reasoning_effort` y retención de contexto de razonamiento histórico mediante `preserve_thinking`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; transformer híbrido con Gated DeltaNet (atención lineal) y Gated Attention; MTP (Multi-Token Prediction) |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato Transformers) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer híbrido con 64 capas y dimensión oculta de 5120. El layout interno se organiza en 16 bloques, cada uno compuesto por 3 subcapas de Gated DeltaNet seguidas de 1 subcapa de Gated Attention, cada una emparejada con su correspondiente FFN. La Gated DeltaNet utiliza 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention emplea 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de Rotary Position Embedding de 64. La FFN tiene dimensión intermedia de 17.408. El token embedding y la salida LM tienen 248.320 entradas (con padding). El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, una técnica que permite predecir varios tokens por paso y que habitualmente se aprovecha para decodificación especulativa.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas concretas de RLHF o DPO. El modelo se distribuye como modelo post-entrenado en formato HuggingFace Transformers y es compatible con Transformers, vLLM, SGLang y TokenSpeed. Una innovación destacable es el control flexible del pensamiento: el modo thinking está activado por defecto, puede desactivarse por petición, la profundidad de razonamiento se ajusta con `reasoning_effort` y el contexto de razonamiento de mensajes históricos se conserva mediante `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento avanzado, con modo de pensamiento (thinking) activado por defecto y controlable por petición.
- Codificación: mejoras sustanciales en tareas de programación, incluyendo codificación agéntica en terminal (evaluada en Terminal Bench 2.1 con el harness Terminus).
- Trabajo profesional e investigación: capacidades reforzadas en tareas de conocimiento profesional y flujos de investigación.
- Tareas agénticas de largo horizonte: planificación autónoma más sólida y mejor manejo de la retroalimentación del entorno, orientado a la finalización fiable de tareas de extremo a extremo.
- Comprensión visión-lenguaje nativa: procesa imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Control flexible del razonamiento: desactivación del modo thinking por petición, ajuste de profundidad con `reasoning_effort` y retención de contexto de razonamiento histórico con `preserve_thinking`.
- Compatibilidad con harnesses y herramientas de desarrollo populares, lo que facilita su integración en stacks existentes.
- Soporte de tool calling / function calling: la model card menciona herramientas integradas oficiales en la versión alojada en Qwen Cloud, pero no detalla el soporte nativo de tool calling en los pesos locales.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Codificación agéntica en terminal: el modelo puede operar en entornos de terminal resolviendo tareas de codificación de múltiples pasos (evaluado específicamente en Terminal Bench 2.1 con Terminus), lo que lo hace adecuado para agentes de desarrollo autónomos que ejecutan comandos, interpretan salidas y corrigen errores de forma iterativa.
- Automatización de flujos de trabajo profesionales: gracias a sus mejoras en trabajo profesional e investigación, puede redactar informes, resumir documentación técnica extensa y asistir en tareas de análisis con contexto de hasta 262.144 tokens nativos, evitando la pérdida de información en documentos largos.
- Análisis de documentos y diagramas STEM: al ser un modelo visión-lenguaje nativo, puede interpretar diagramas técnicos, figuras de artículos científicos y documentos escaneados, extrayendo información estructurada y respondiendo preguntas sobre el contenido visual.
- Comprensión de vídeos de larga duración: su soporte para vídeos de hasta una hora permite resumir reuniones, analizar grabaciones de clases o extraer eventos clave de material audiovisual extenso, una capacidad poco común en modelos de este tamaño.
- Agentes autónomos de largo horizonte: la planificación autónoma reforzada y el manejo de retroalimentación del entorno lo hacen adecuado para pipelines agénticos que deben completar tareas de extremo a extremo con múltiples pasos y dependencias, como la gestión de incidencias o la migración de código.
- Asistentes de investigación con razonamiento controlable: la posibilidad de ajustar `reasoning_effort` y conservar el contexto de razonamiento histórico (`preserve_thinking`) permite calibrar el coste computacional frente a la profundidad de análisis en tareas de investigación, manteniendo coherencia en conversaciones multi-turno largas.
- Despliegue en infraestructura propia: al ser un modelo denso de 27B con licencia Apache 2.0 y compatibilidad con vLLM, SGLang y TokenSpeed, puede servirse en clústeres propios para aplicaciones de atención al cliente o generación de código en producción sin depender de APIs externas.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con los modelos Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. Los datos disponibles en la información proporcionada se limitan a la categoría de codificación:

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | No disponible (valor truncado en la información) | No disponible | No disponible | No disponible | No disponible |

No se han podido extraer los valores numéricos del resto de categorías (trabajo profesional, investigación, tareas agénticas) porque la información proporcionada está truncada. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo denso de ~27,8B parámetros en precisión BF16 requiere del orden de 55-56 GB solo para los pesos (el repo ocupa 55,6 GB), a lo que hay que sumar KV cache y overhead.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, un despliegue en BF16 requeriría GPUs con 80 GB de VRAM (A100 80GB, H100 80GB) o múltiples GPUs menores.
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada. En cuantizaciones de 4 bits podría caber en GPUs de consumo de gama alta con 24 GB, pero este dato no está confirmado en la documentación.
- Opciones de despliegue: HuggingFace Transformers, vLLM, SGLang y TokenSpeed (según la model card). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B | ~27,8B (denso) | 262.144 nativos, hasta 1.000.000 | Apache 2.0 | Modelo visión-lenguaje nativo con thinking controlable y MTP |
| Qwen3.6-27B | No disponible | No disponible | No disponible | Generación anterior de la misma familia; incluido como referencia en los benchmarks de la model card |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | Variante Plus de la familia; incluido como referencia en los benchmarks |
| Muse Glimmer-30B | ~30B (según nombre) | No disponible | No disponible | Modelo comparable de ~30B incluido como referencia en los benchmarks |
| Opus4.6 Max | No disponible | No disponible | No disponible | Modelo de referencia de alto rendimiento incluido en la comparativa |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada (tabla truncada). No se dispone de información sobre licencias ni contextos de los modelos alternativos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la model card; como todo modelo generativo, existe riesgo inherente, especialmente en tareas de investigación y trabajo profesional donde no se documentan tasas de error.
- Limitaciones de contexto o idioma: el contexto nativo es de 262.144 tokens y la extensión a 1.000.000 se presenta como capacidad, pero no se detallan las condiciones ni la degradación de rendimiento en contextos extendidos. Los idiomas soportados no están documentados.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial, modificación y redistribución con atribución. No obstante, conviene verificar los términos de la familia Qwen originales por si hubiera condiciones adicionales no reflejadas.
- Caveats para producción: el repositorio tiene solo 23 descargas y 0 likes en el momento de la consulta, lo que sugiere baja validación comunitaria. El autor del repositorio (`Mininb666`) no coincide con la organización oficial de Qwen, por lo que se recomienda verificar la procedencia de los pesos antes de usarlos en producción. La versión alojada en Qwen Cloud con contexto de 1M por defecto y herramientas integradas está anunciada como "coming soon", no disponible aún.
- El modo thinking está activado por defecto, lo que incrementa el coste de inferencia si no se desactiva explícitamente o se ajusta `reasoning_effort`.

## Enlaces

- HuggingFace: https://huggingface.co/Mininb666/Qwen3.8-27B
- Qwen Cloud (servicio alojado, próximamente): https://www.qwencloud.com
- Overview de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
