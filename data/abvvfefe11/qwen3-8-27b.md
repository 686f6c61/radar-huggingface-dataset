# abvvfefe11/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con encoder de visión publicado en HuggingFace por el usuario abvvfefe11, bajo licencia Apache 2.0. Según la model card, pertenece a la serie Qwen3.8, que continúa la línea de las series Qwen3.5 y Qwen3.6, y está diseñado para tareas de codificación, trabajo profesional, investigación y agentes de largo horizonte. El modelo combina un núcleo de lenguaje denso de 27.781 millones de parámetros con capacidades nativas de comprensión de imágenes y vídeos, y ofrece control flexible del razonamiento mediante un modo de pensamiento activable o desactivable por petición.

La arquitectura declarada incluye 64 capas con una combinación de atención lineal (Gated DeltaNet) y atención completa (Gated Attention), junto con predicción multi-token (MTP). El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000. A pesar de estas especificaciones, el repositorio tiene 0 descargas y 0 likes, y la fecha de creación (2026-08-17) es posterior a la fecha actual, lo que sugiere que podría tratarse de un modelo hipotético o no verificado. La información disponible es parcial y no se han encontrado resultados de benchmarks completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; capas con Gated DeltaNet (linear attention) y Gated Attention |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Según la model card, Qwen3.8-27B es un modelo de lenguaje causal con un encoder de visión integrado. El bloque de lenguaje tiene 64 capas, dimensión oculta de 5120 y una disposición interna de 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)). La atención lineal Gated DeltaNet utiliza 48 cabezas para V y 16 para QK, con dimensión de cabeza 128; la atención completa Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de 64 dimensiones. El FFN tiene dimensión intermedia de 17.408. Se indica que el modelo fue entrenado en dos etapas (pre-training y post-training) e incluye predicción multi-token (MTP) entrenada con múltiples pasos.

No se proporcionan datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre el uso de RLHF o DPO. Tampoco se especifica el proceso de alineación del encoder de visión con el modelo de lenguaje.

## Capacidades

- Generación de texto y razonamiento: soporta modo de pensamiento (thinking mode) activado por defecto, desactivable por petición, con control de profundidad mediante `reasoning_effort` y preservación del contexto de razonamiento histórico mediante `preserve_thinking`.
- Comprensión de imágenes y vídeos: procesa diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Agentes y tareas multi-step: planificación autónoma y manejo de feedback del entorno para completar tareas de largo horizonte.
- Tool calling: no se menciona explícitamente, pero la compatibilidad con vLLM y SGLang sugiere soporte para integraciones estándar.
- Multilingüe: no se especifican idiomas soportados.

## Casos de uso

- Asistente de codificación agéntico: el modelo puede ejecutar tareas de codificación en terminal (según el benchmark Terminal Bench 2.1 mencionado) y planificar pasos múltiples, útil para automatizar refactorizaciones o correcciones en repositorios.
- Análisis de documentos técnicos con imágenes: al aceptar entrada visual, puede extraer información de diagramas, esquemas y figuras en informes de ingeniería o investigación.
- Transcripción y comprensión de vídeos largos: su ventana de contexto extendida (hasta 1M) permite procesar vídeos de larga duración para resúmenes o búsqueda de eventos concretos.
- Agente de investigación autónomo: con razonamiento controlable y preservación del contexto de pensamiento, puede explorar fuentes, razonar sobre ellas y producir informes estructurados.
- Soporte técnico con contexto largo: la ventana de 262K tokens permite mantener conversaciones multi-turno con historial extenso, adecuado para atención al cliente especializada.
- Generación de código con razonamiento explícito: el modo thinking permite que el modelo muestre su proceso de razonamiento antes de generar código, útil para depuración y revisión.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativos, pero el texto proporcionado se corta en la primera fila (Terminal Bench 2.1, categoría "Agentic terminal coding"). No se dispone de los valores numéricos de esta ni de otras métricas (MMLU, HumanEval, GSM8K, etc.). Por tanto, no se pueden presentar resultados verificables.

No se han publicado resultados de benchmarks completos en la informacion disponible.

## Requisitos de hardware

- El peso en safetensors ocupa 55,6 GB, lo que sugiere que en precisión FP16/BF16 la VRAM necesaria supera los 56 GB, requiriendo GPUs profesionales como A100 (80 GB) o H100.
- Con cuantización a 8 bits, la VRAM estimada rondaría los 28-30 GB, lo que podría permitir su ejecución en una RTX 4090 (24 GB) con cuantización más agresiva (4 bits) o en GPUs de 32 GB como la A6000.
- No se proporcionan datos oficiales de latencia ni throughput.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- No se menciona soporte para llama.cpp u Ollama, aunque al ser formato safetensors podría convertirse a GGUF.

## Comparativa con modelos similares

La model card compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se dispone de las especificaciones de estos modelos (parámetros, contexto, licencia) ni de los resultados numéricos de los benchmarks. No se puede establecer una comparativa rigurosa con los datos disponibles.

No disponible por falta de información verificable sobre los modelos comparados.

## Limitaciones y advertencias

- La fecha de creación del repositorio (2026-08-17) es posterior a la fecha actual, lo que indica que el modelo podría ser ficticio o no estar verificado.
- El autor es un usuario individual (abvvfefe11) sin reputación conocida; el modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido evaluado por la comunidad.
- No se especifican los idiomas soportados, lo que limita su uso en producción multilingüe.
- No se han publicado resultados de benchmarks completos, por lo que las capacidades declaradas no están respaldadas por métricas públicas.
- La arquitectura "Gated DeltaNet" no es un término estándar en la literatura de modelos de lenguaje, lo que añade incertidumbre sobre su implementación real.
- La licencia Apache 2.0 permite uso comercial, pero al no estar verificado el origen de los pesos, se recomienda extremar la precaución antes de desplegarlo en entornos de producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/abvvfefe11/Qwen3.8-27B
- Servicio Qwen Cloud (mencionado en la model card, no verificado): https://www.qwencloud.com/models/qwen3.8-27b
