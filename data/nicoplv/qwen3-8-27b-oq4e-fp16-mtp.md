# nicoplv/Qwen3.8-27B-oQ4e-fp16-mtp

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal multimodal (texto, imagen y vídeo) desarrollado por el equipo de Qwen, presentado como la generación más capaz de la familia abierta Qwen hasta la fecha. Construido sobre la base arquitectónica de Qwen3.5, incorpora mejoras sustanciales en tareas de codificación, trabajo profesional, investigación y ejecución de agentes de larga duración. Este repositorio concreto, publicado por el usuario nicoplv, ofrece una versión cuantizada en 4 bits (oQ4e) con componentes en fp16, preparada para su uso con Transformers, vLLM, SGLang y TokenSpeed.

El modelo destaca por su arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention), alcanzando una longitud de contexto nativa de 262 144 tokens, extensible hasta 1 000 000. Con 27 000 millones de parámetros, es un modelo denso diseñado para ser desplegado en entornos de producción con requisitos de hardware moderados gracias a la cuantización. Incluye un modo de pensamiento flexible (thinking mode) activado por defecto y desactivable por petición, así como soporte nativo para comprensión de imágenes y vídeos de hasta una hora de duración.

La licencia Apache 2.0 permite uso comercial sin restricciones significativas, y el formato safetensors facilita la integración en pipelines existentes. Aunque la model card promete mejoras sobre Qwen3.6 y Qwen3.7, los datos de benchmarks publicados en la documentación disponible están incompletos, por lo que la evaluación empírica queda pendiente de confirmación por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM hibrido con vision encoder (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27B (segun model card); el archivo safetensors reporta ~4.93B elementos, consistente con cuantizacion 4-bit |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 000 000 |
| Tipos de cuantizacion | oQ4e (4-bit) + componentes en fp16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura de transformer causal con un encoder de visión integrado. El bloque del modelo de lenguaje se organiza en 64 capas con una dimensión oculta de 5120, siguiendo un patrón de 16 repeticiones de `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. Las capas Gated DeltaNet utilizan atención lineal con 48 cabezas para V y 16 para QK, con dimensión de cabeza 128, mientras que las capas Gated Attention usan 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y rotary position embedding de dimensión 64. La FFN tiene una dimensión intermedia de 17 408.

El entrenamiento se realizó en dos fases: pre-entrenamiento y post-entrenamiento, con un mecanismo de Multi-Token Prediction (MTP) que predice varios tokens futuros simultáneamente para mejorar la eficiencia y la coherencia. La capa de salida tiene un embedding de 248 320 tokens (padded). No se especifican los detalles del dataset ni el número exacto de tokens de entrenamiento en la información disponible, aunque la model card menciona mejoras en codificación, trabajo profesional, investigación y tareas agénticas. El modelo soporta un modo de pensamiento controlable mediante los parámetros `reasoning_effort` y `preserve_thinking`, lo que sugiere un entrenamiento con razonamiento explícito.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento activable o desactivable por petición y ajuste de profundidad mediante `reasoning_effort`.
- Comprensión multimodal nativa: procesa imágenes (diagramas STEM, documentos) y vídeos de hasta una hora de duración.
- Ejecución de tareas agénticas de larga duración, con planificación autónoma y manejo de feedback del entorno.
- Soporte de tool calling y function calling, integrable en pipelines de agentes.
- Codificación avanzada, incluyendo tareas de terminal agéntico (según la model card).
- Multilingüismo: no se especifican los idiomas soportados en la documentación disponible.
- Mecanismo MTP (Multi-Token Prediction) para mejorar la velocidad de decodificación y la coherencia del texto generado.

## Casos de uso

- Asistente de programación en entornos de terminal: el modelo puede ejecutar comandos, interpretar salidas y corregir errores de forma autónoma, gracias a su capacidad de razonamiento agéntico y su entrenamiento en tareas de terminal coding (Terminal Bench).
- Análisis de documentos técnicos y científicos: su comprensión de imágenes permite extraer información de diagramas, gráficos y páginas escaneadas, útil en investigación y revisión de literatura.
- Agente de atención al cliente multimodal: puede procesar capturas de pantalla, vídeos cortos de problemas de usuario y conversaciones multi-turno, manteniendo contexto de hasta 262K tokens.
- Generación de código en producción con tool calling: integrable en pipelines de CI/CD para autocompletar, revisar y refactorizar código, con soporte para múltiples lenguajes y frameworks.
- Análisis de vídeo de vigilancia o formación: su capacidad de procesar vídeos de hasta una hora permite resumir eventos, detectar anomalías o generar informes automáticos.
- Investigación de mercado y análisis de documentos corporativos: procesa informes extensos, presentaciones y datos visuales para extraer conclusiones y generar resúmenes ejecutivos.
- Desarrollo de chatbots con razonamiento profundo: el modo thinking permite respuestas más elaboradas en dominios complejos como derecho, medicina o finanzas, ajustando el esfuerzo de razonamiento según el caso.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los valores numéricos no están disponibles en la información proporcionada (la tabla aparece truncada). No se han publicado resultados completos de benchmarks en la documentación accesible. Se recomienda consultar el repositorio oficial de Qwen para obtener datos verificados de MMLU, HumanEval, GSM8K y otras métricas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización 4-bit (oQ4e), un modelo de 27B requiere aproximadamente 14-18 GB de VRAM, dependiendo de la longitud de contexto y el batch. En fp16 completo, necesitaría alrededor de 54 GB.
- GPU recomendadas: para 4-bit, una RTX 4090 (24 GB) o A100 40 GB son suficientes. Para fp16, se necesitan A100 80 GB o H100.
- Compatibilidad con GPU de consumo: sí, la versión 4-bit cabe en GPUs de 24 GB como la RTX 3090/4090, aunque con contexto reducido.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, Hugging Face Transformers, llama.cpp (si se convierte a GGUF) y Ollama (mediante conversión).
- Latencia y throughput: no se han publicado datos específicos. El mecanismo MTP puede mejorar la velocidad de decodificación frente a modelos sin esta técnica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (este repo) | 27B | 262K nativo, 1M extensible | Hibrida (DeltaNet + Attention) | Apache 2.0 | HuggingFace |
| Qwen3.6-27B | 27B | No disponible | No disponible | Apache 2.0 (presumiblemente) | HuggingFace |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | API Qwen Cloud |

No se dispone de datos de rendimiento comparativos fiables para estos modelos en la información proporcionada. La model card menciona a Muse Glimmer-30B y Opus4.6 Max como competidores, pero sin valores numéricos. Se recomienda esperar a la publicación oficial de benchmarks por parte de Qwen para realizar una comparación rigurosa.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos o limitaciones lingüísticas específicas; los idiomas soportados no están documentados, lo que puede afectar a la calidad en lenguas minoritarias.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas agénticas donde el modelo debe interpretar feedback del entorno.
- La cuantización 4-bit puede degradar ligeramente la precisión en comparación con fp16, especialmente en tareas de razonamiento complejo o matemáticas.
- El repositorio es una versión cuantizada de terceros (autor nicoplv), no oficial de Qwen. La integridad y reproducibilidad de los pesos no están garantizadas por el equipo original.
- La fecha de creación (agosto de 2026) y la ausencia de descargas sugieren que el modelo es muy reciente o poco probado; se recomienda validar su comportamiento en casos de uso reales antes de producción.
- El contexto de 1M tokens es una extensión, no el valor nativo; su uso puede requerir técnicas de atención eficiente y aumentar los requisitos de memoria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nicoplv/Qwen3.8-27B-oQ4e-fp16-mtp
- Qwen Cloud (servicio gestionado, próximamente): https://www.qwencloud.com/models/qwen3.8-27b
- Página oficial de Qwen: https://qwenlm.github.io (no verificado en la información proporcionada)
