# DecentralizedDaddy/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión, publicado por el usuario DecentralizedDaddy en HuggingFace bajo licencia Apache 2.0. Según la model card, forma parte de la familia Qwen3.8 y se presenta como un modelo denso de 27B parámetros orientado a despliegue compacto, con capacidad nativa de comprensión de imágenes y vídeos, control flexible del modo de razonamiento y soporte para tareas agénticas de largo horizonte. La arquitectura combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention) en un layout híbrido de 64 capas.

El modelo declara una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.000.000, y está entrenado con Multi-Token Prediction (MTP) en varios pasos. Los pesos se distribuyen en formato safetensors con un total de 27.781.427.952 parámetros reales, y el repositorio ocupa 55,6 GB. La pipeline declarada es image-text-to-text, lo que confirma su naturaleza multimodal.

Es relevante ahora porque la model card lo sitúa como la generación más capaz de la familia abierta Qwen hasta la fecha, con mejoras declaradas en codificación, trabajo profesional, investigación y tareas agénticas. No obstante, el repositorio tiene un volumen de descargas muy bajo (31) y ningún like, y la información disponible no permite verificar de forma independiente los resultados declarados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrido de Gated DeltaNet (atención lineal) y Gated Attention |
| Parámetros totales | 27.781.427.952 (27B según model card) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo emplea un transformer causal híbrido con 64 capas organizadas en 16 bloques de la forma 3 × (Gated DeltaNet → FFN) seguido de 1 × (Gated Attention → FFN). La dimensión oculta es 5120 y la dimensión intermedia de la FFN es 17.408. Las capas de Gated DeltaNet usan 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Las capas de Gated Attention usan 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de RoPE de 64. El embedding de tokens y la salida LM tienen 248.320 entradas (con padding).

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento, e incluye Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que puede habilitar decodificación especulativa. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO. Tampoco se especifican innovaciones adicionales más allá del layout híbrido de atención y el control de razonamiento por petición.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento activado por defecto, desactivable por petición.
- Ajuste de la profundidad de razonamiento mediante `reasoning_effort` y retención del contexto de razonamiento histórico con `preserve_thinking`.
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora.
- Codificación y tareas de terminal agénticas (según benchmarks declarados).
- Planificación autónoma y manejo de retroalimentación del entorno para tareas de extremo a extremo.
- Soporte declarado de harnesses y herramientas de desarrollo populares.
- Compatibilidad con Transformers, vLLM, SGLang y TokenSpeed.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos técnicos y diagramas STEM: el modelo puede procesar imágenes de figuras, esquemas y tablas junto con texto, lo que resulta adecuado para extraer y razonar sobre contenido científico o de ingeniería en un solo paso.
- Comprensión de vídeos de larga duración: con soporte declarado para vídeos de hasta una hora, puede resumir o responder preguntas sobre grabaciones de reuniones, clases o inspecciones.
- Automatización de tareas de terminal y CI/CD: su capacidad agéntica declarada en Terminal Bench permite integrarlo en pipelines que ejecutan comandos, interpretan salidas y corrigen errores de forma iterativa.
- Asistencia a la codificación en producción: con contexto de 262.144 tokens nativos puede mantener el estado de repositorios grandes y múltiples archivos en una sola sesión, reduciendo la pérdida de contexto entre pasos.
- Agentes de investigación multi-paso: el control de `reasoning_effort` y `preserve_thinking` permite ajustar el coste computacional y retener cadenas de razonamiento entre turnos en flujos de búsqueda y síntesis.
- Despliegue en infraestructura propia: al ser un modelo denso de 27B con pesos safetensors y compatibilidad con vLLM y SGLang, puede servirse en clústeres con GPUs de 80 GB mediante cuantización o paralelismo tensorial.
- Procesamiento de documentación multimodal: extracción de información de PDFs escaneados, capturas de pantalla e informes combinando visión y texto en una única pasada.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero el contenido proporcionado solo muestra el encabezado de la sección de codificación (Terminal Bench 2.1, Terminus) sin los valores numéricos asociados. No se dispone de cifras completas de MMLU, HumanEval, GSM8K ni otros benchmarks en la información proporcionada.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados numéricos verificables de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y caché KV; se requiere al menos una GPU de 80 GB (A100 80GB, H100 80GB) o paralelismo tensorial en varias GPUs.
- Cuantización: no se especifican tipos soportados en la información disponible; a 8 bits los pesos ocuparían unos 28 GB y a 4 bits unos 14 GB, aunque estos cálculos son estimaciones a partir del tamaño del repositorio y no datos confirmados.
- GPU consumer: en BF16 no cabe en GPUs consumer de 24 GB (RTX 4090) ni de 32 GB; con cuantización agresiva podría intentarse en RTX 4090 o RTX 5090, pero no hay confirmación oficial.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed según la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27B (denso) | 262.144 nativos, hasta 1.000.000 | Apache 2.0 | HuggingFace (31 descargas) |
| Qwen3.6-27B | no disponible | no disponible | no disponible | mencionado en model card |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | mencionado en model card |
| Muse Glimmer-30B | ~30B | no disponible | no disponible | mencionado en model card |
| Opus4.6 Max | no disponible | no disponible | no disponible | mencionado en model card |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada; la model card solo enumera los modelos de comparación sin cifras accesibles.

## Limitaciones y advertencias

- El repositorio tiene solo 31 descargas y 0 likes, lo que sugiere una adopción muy limitada y ausencia de validación comunitaria.
- El autor del repositorio es un usuario individual (DecentralizedDaddy), no la organización oficial Qwen; conviene verificar la procedencia de los pesos antes de usarlos en producción.
- No se especifican los idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano u otros idiomas distintos del inglés.
- No se detalla la composición del dataset de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO, lo que dificulta evaluar sesgos y riesgo de alucinación.
- Los benchmarks declarados no incluyen cifras numéricas en la información disponible y no han sido verificados de forma independiente.
- El modo de pensamiento está activado por defecto, lo que incrementa el coste de inferencia y la latencia si no se desactiva explícitamente.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de pesos de un tercero no oficial se recomienda auditoría previa.
- El contexto extensible a 1.000.000 tokens se menciona como característica del servicio alojado en Qwen Cloud; no se confirma que la extensión sea viable localmente con los pesos publicados.

## Enlaces

- HuggingFace: https://huggingface.co/DecentralizedDaddy/Qwen3.8-27B
- Qwen Cloud (servicio alojado mencionado): https://www.qwencloud.com
- Página del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
