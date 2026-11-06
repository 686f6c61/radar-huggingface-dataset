# heideng90/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión, publicado en Hugging Face por el usuario heideng90 bajo el identificador `heideng90/Qwen3.8-27B`. Según la model card, se presenta como parte de la generación Qwen3.8 de la familia de modelos abiertos Qwen, construido sobre la base arquitectónica de Qwen3.5 y orientado a tareas de codificación, trabajo profesional, investigación y tareas agénticas de largo horizonte. Es un modelo denso (no MoE) de aproximadamente 27.781 millones de parámetros, con 64 capas y una dimensión oculta de 5120.

El modelo es nativo visión-lenguaje: procesa imágenes y vídeos además de texto, con un contexto nativo de 262.144 tokens extensible hasta 1.000.000. Incorpora control flexible de razonamiento (modo *thinking* activado por defecto, desactivable por petición, con ajuste de profundidad mediante `reasoning_effort` y retención de contexto de razonamiento histórico vía `preserve_thinking`). La arquitectura combina capas de atención lineal (Gated DeltaNet) con capas de atención con compuerta (Gated Attention) en un patrón híbrido repetido 16 veces.

La relevancia actual del modelo radica en su tamaño compacto (27B) combinado con contexto muy largo, capacidades multimodales y soporte de agentes, lo que lo hace desplegable en infraestructura moderada. No obstante, conviene señalar que el repositorio tiene muy poca tracción (22 descargas, 0 likes) y que la model card incluye referencias a servicios y comparativas que no pueden verificarse de forma independiente; los datos de benchmarks proceden exclusivamente de la documentación del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrido de Gated DeltaNet (atención lineal) y Gated Attention |
| Parametros totales | 27.781.427.952 (≈27,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible en la información proporcionada |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |

Otros datos técnicos de la model card: dimensión oculta 5120; token embedding 248.320 (con padding); 64 capas; FFN con dimensión intermedia 17.408; Gated DeltaNet con 48 cabezas lineales para V y 16 para QK, dimensión de cabeza 128; Gated Attention con 24 cabezas para Q y 4 para KV, dimensión de cabeza 256, dimensión RoPE 64; MTP (Multi-Token Prediction) entrenado con múltiples pasos. Tamaño del repositorio: 55,6 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal híbrido que intercala bloques de atención lineal (Gated DeltaNet) con bloques de atención con compuerta (Gated Attention) en un patrón de 16 repeticiones de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. Esta combinación busca reducir el coste computacional de la atención en contextos largos manteniendo capacidad expresiva. El modelo incluye un codificador de visión para entrada de imágenes y vídeo, y emplea Multi-Token Prediction (MTP) entrenado con varios pasos, lo que puede habilitar decodificación especulativa.

Según la model card, el modelo ha pasado por pre-entrenamiento y post-entrenamiento, e incorpora control de razonamiento configurable por petición. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas concretas de RLHF, DPO u otras variantes de alineamiento. Tampoco se detalla la estrategia de extensión de contexto más allá de los 262.144 tokens nativos.

## Capacidades

- Generación de texto y razonamiento con modo *thinking* activado por defecto, desactivable por petición.
- Ajuste de profundidad de razonamiento mediante el parámetro `reasoning_effort`.
- Retención de contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Comprensión de imágenes: diagramas STEM, documentos y capturas.
- Comprensión de vídeo, incluyendo vídeos de hasta una hora de duración según la model card.
- Codificación y tareas de terminal agénticas (benchmark Terminal Bench 2.1 citado en la card).
- Planificación autónoma y manejo de retroalimentación del entorno para tareas multi-paso.
- Soporte declarado de *harnesses* y herramientas de desarrollo populares (sin detallar cuáles).
- Compatibilidad con Transformers, vLLM, SGLang y TokenSpeed.
- Soporte de tool calling / function calling: no se detalla explícitamente en la información disponible, aunque la card menciona "official built-in tools" para la versión alojada.

## Casos de uso

- **Automatización de tareas de terminal y CI/CD**: el modelo está evaluado en Terminal Bench 2.1 y declara capacidades agénticas de terminal; puede integrarse en pipelines para ejecutar comandos, interpretar salidas y corregir errores de forma iterativa.
- **Análisis de documentos técnicos con imágenes**: gracias al codificador de visión y a un contexto de 262K tokens, puede procesar manuales, diagramas STEM y documentación escaneada junto con texto extenso en una sola ventana.
- **Revisión de vídeo de larga duración**: la card declara soporte de vídeos de hasta una hora; útil para resúmenes de reuniones, análisis de grabaciones o extracción de eventos en material audiovisual.
- **Asistentes de codificación en producción**: con 27,8B parámetros densos y licencia Apache 2.0, puede desplegarse en infraestructura propia para autocompletado, refactorización y generación de tests, con control de razonamiento ajustable para equilibrar latencia y calidad.
- **Agentes de investigación multi-paso**: el modo *thinking* configurable y la retención de contexto de razonamiento permiten cadenas largas de razonamiento con memoria de pasos previos, adecuado para tareas de búsqueda y síntesis.
- **Atención al cliente multimodal**: puede gestionar conversaciones multi-turno con contexto largo e incorporar capturas de pantalla o imágenes enviadas por el usuario para diagnóstico de incidencias.
- **Extracción de información de documentos largos**: con contexto extensible hasta 1M tokens, adecuado para procesar expedientes, contratos o corpus documentales completos sin fragmentación.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, con la categoría "Coding" y el benchmark Terminal Bench 2.1 (Terminus). Sin embargo, en la información proporcionada los valores numéricos de esa tabla aparecen truncados y no pueden transcribirse con fiabilidad. No se han publicado en la información disponible resultados completos y verificables de MMLU, HumanEval, GSM8K u otros benchmarks estándar.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | No disponible (valor truncado en la fuente) | No disponible | No disponible | No disponible | No disponible |

## Requisitos de hardware

- **VRAM estimada en BF16/FP16**: aproximadamente 55,6 GB solo para pesos (27,8B × 2 bytes), más overhead de activaciones y caché KV; se recomienda al menos 80 GB para inferencia cómoda.
- **Cuantización**: no se detallan en la información disponible los formatos soportados; a título orientativo, una cuantización de 8 bits rondaría los 28 GB y una de 4 bits unos 14 GB, aunque estos valores no están confirmados por el autor.
- **GPU recomendadas**: A100 80GB, H100 80GB o configuraciones multi-GPU para precisión completa. En consumer, una RTX 4090 (24 GB) solo podría alojar el modelo con cuantización agresiva (4 bits) y contexto reducido.
- **Despliegue**: la card declara compatibilidad con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se menciona llama.cpp, Ollama ni TGI en la información disponible.
- **Latencia y throughput**: no disponibles en la información proporcionada. La arquitectura híbrida con atención lineal y MTP sugiere ventajas en contextos largos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,8B densos | 262K (ext. 1M) | Apache 2.0 | Sí (imagen y vídeo) | Hugging Face (22 descargas) |
| Qwen3.6-27B | No disponible | No disponible | No disponible | No disponible | Citado en la card como generación previa |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | Citado en la card (posiblemente API) |
| Muse Glimmer-30B | ~30B (por el nombre) | No disponible | No disponible | No disponible | Citado en la card |

Los datos de los modelos comparables proceden únicamente de la tabla de la model card y no se dispone de información independiente sobre sus especificaciones, licencias o disponibilidad.

## Limitaciones y advertencias

- **Trazabilidad limitada**: el repositorio pertenece a un usuario individual (`heideng90`) con 22 descargas y 0 likes; no hay verificación independiente de que los pesos correspondan a un modelo oficial de Qwen.
- **Datos de benchmarks incompletos**: la tabla de la model card aparece truncada en la información disponible y no puede verificarse.
- **Idiomas no declarados**: no se especifican los idiomas soportados, lo que impide garantizar calidad multilingüe.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir información incorrecta, especialmente en tareas de razonamiento largo o con entradas multimodales ambiguas.
- **Sesgos**: no se documentan evaluaciones de sesgo ni medidas de mitigación en la información disponible.
- **Licencia Apache 2.0**: permite uso comercial, pero el usuario debe verificar que los pesos y la procedencia cumplen las condiciones (especialmente al tratarse de un repo de terceros que referencia la familia Qwen).
- **Contexto extendido a 1M**: la extensión más allá de 262K tokens no está validada de forma independiente y puede degradar la calidad.
- **Requisitos de hardware elevados**: 55,6 GB en safetensors exigen GPU de 80 GB o cuantización para uso práctico.
- **Model card con referencias a servicios**: menciona Qwen Cloud y una versión alojada "coming soon", lo que sugiere que parte del contenido puede ser aspiracional o no disponible aún.

## Enlaces

- Hugging Face: https://huggingface.co/heideng90/Qwen3.8-27B
- Qwen Cloud (referenciado en la card): https://www.qwencloud.com
- Overview del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
