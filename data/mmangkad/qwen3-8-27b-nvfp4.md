# mmangkad/Qwen3.8-27B-NVFP4

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con encoder de visión, desarrollado por el equipo Qwen de Alibaba. Se trata de la generación más reciente de la familia Qwen3.8, construida sobre la base arquitectónica de Qwen3.5, e incorpora mejoras sustanciales en codificación, trabajo profesional, investigación y tareas agénticas de horizonte largo. Es un modelo denso de 27B parámetros con capacidades nativas de comprensión de imágenes y vídeo, pensamiento flexible controlable y una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000.

La versión alojada en este repositorio es una cuantización NVFP4 (8 bits) preparada por la comunidad, que reduce el peso del modelo a aproximadamente 21,9 GB y permite ejecutarlo en hardware de consumo. El modelo destaca por su arquitectura híbrida que combina atención lineal (Gated DeltaNet) con atención clásica (Gated Attention), lo que le permite manejar secuencias largas con un coste computacional reducido. Está pensado para desarrolladores que necesitan un modelo multimodal potente ejecutable localmente, con soporte para herramientas y razonamiento agéntico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrido Gated DeltaNet + Gated Attention |
| Parametros totales | 27B (según el autor); 18.164.649.200 en los safetensors cuantizados |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | NVFP4 (8 bits, este repositorio); GGUF disponible vía Unsloth |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida que intercala bloques de atención lineal y atención clásica. La configuración del modelo de lenguaje incluye 64 capas, dimensión oculta de 5120 y un layout de 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)). El Gated DeltaNet utiliza 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128; el Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. La FFN tiene dimensión intermedia de 17.408.

El entrenamiento se realizó en dos etapas: pre-entrenamiento y post-entrenamiento. El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que mejora la eficiencia de decodificación y la coherencia en generaciones largas. El encoder de visión permite comprensión nativa de imágenes y vídeo, desde diagramas STEM y documentos hasta vídeos de una hora de duración. El control de pensamiento es flexible: el modo thinking está activado por defecto, puede desactivarse por petición, y la profundidad del razonamiento se ajusta mediante el parámetro `reasoning_effort`. El contexto de razonamiento histórico se conserva mediante `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento multi-step con modo thinking configurable.
- Comprensión de imágenes y vídeo de forma nativa (vision-language).
- Razonamiento agéntico de horizonte largo: planificación autónoma y manejo de feedback del entorno.
- Soporte de tool calling y function calling para integración en pipelines.
- Capacidades multilingües (idiomas exactos no especificados).
- Entrenado con Multi-Token Prediction para decodificación más eficiente.
- Compatible con múltiples frameworks de inferencia: Transformers, vLLM, SGLang y TokenSpeed.
- Control fino del razonamiento mediante `reasoning_effort` y `preserve_thinking`.

## Casos de uso

- Asistente de codificación agéntico: el modelo puede ejecutar tareas de codificación en terminal de forma autónoma, gestionando múltiples pasos y feedback del entorno, gracias a su entrenamiento específico en tareas agénticas y su ventana de contexto de 262K tokens.
- Automatización de oficina: procesamiento de documentos con contenido visual (diagramas, tablas, capturas), extracción de información y generación de resúmenes ejecutivos.
- Análisis de vídeo de larga duración: comprensión de vídeos de hasta una hora para tareas de vigilancia, revisión de contenido o generación de metadatos descriptivos.
- Agente conversacional con contexto largo: atención al cliente o asistencia técnica con historial extenso de conversación, gracias a la ventana de contexto ampliable a 1M tokens.
- Desarrollo de aplicaciones multimodales locales: despliegue en hardware de consumo (17 GB VRAM/RAM) para prototipos y aplicaciones edge con requisitos de privacidad.
- Investigación académica: análisis de papers con figuras y diagramas, generación de resúmenes y asistencia en revisión bibliográfica.
- Integración en pipelines de CI/CD: el soporte de tool calling permite su uso en automatización de builds, revisión de código y generación de documentación técnica.

## Benchmarks y rendimiento

La información de benchmarks proporcionada en la model card está incompleta (la tabla se corta en el encabezado). Se mencionan comparativas con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se incluyen valores numéricos legibles en la información disponible.

No se han publicado resultados de benchmarks completos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17 GB con cuantización NVFP4 (según documentación de Unsloth).
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB) o superiores; también compatible con AMD Ryzen AI Max y GPUs Radeon con soporte Day 0.
- Cabe en GPUs de consumo con 16-24 GB de VRAM en cuantización NVFP4 o GGUF.
- Opciones de despliegue: Transformers, vLLM, SGLang, TokenSpeed, LM Studio, Ollama (vía GGUF) y Unsloth Desktop.
- El tamaño del repositorio es de 21,9 GB, por lo que requiere al menos 24 GB de almacenamiento libre para la descarga.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262K (ext. 1M) | Si | Apache 2.0 | Open weights |
| Qwen3.6-27B | 27B | no disponible | no disponible | Apache 2.0 | Open weights |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | API / propietario |
| Muse Glimmer-30B | 30B | no disponible | no disponible | no disponible | no disponible |
| Opus4.6 Max | no disponible | no disponible | no disponible | no disponible | API / propietario |

## Limitaciones y advertencias

- La cuantización NVFP4 puede implicar una ligera pérdida de precisión respecto al modelo en FP16/BF16, especialmente en tareas de razonamiento complejo.
- Los datos de entrenamiento y los idiomas soportados no están documentados en la model card, lo que dificulta evaluar sesgos potenciales.
- El riesgo de alucinación no está documentado; se recomienda validación humana en tareas críticas.
- El modelo es una cuantización de terceros (mmangkad) y no está respaldado oficialmente por Qwen; para producción se recomienda usar los pesos oficiales o el servicio Qwen Cloud.
- La ventana de contexto de 1M tokens es una extensión posible, pero el rendimiento en esa configuración no está documentado.
- No se especifican restricciones de uso comercial más allá de la licencia Apache 2.0, que permite uso comercial con atribución.
- La información de benchmarks está incompleta, por lo que no es posible verificar las afirmaciones de rendimiento de la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mmangkad/Qwen3.8-27B-NVFP4
- Repositorio oficial GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentación Unsloth: https://unsloth.ai/docs/models/qwen3.8
- Cuantización Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Cuantización RadixArk: https://huggingface.co/RadixArk/Qwen3.8-27B-NVFP4
- Blog AMD (soporte Day 0): https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Qwen Cloud: https://www.qwencloud.com
