# Iambackup/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal denso con encoder de visión, desarrollado por el equipo Qwen (Alibaba) y publicado en Hugging Face por el usuario Iambackup. Forma parte de la generación Qwen3.8, sucesora de las series Qwen3.5 y Qwen3.6, y está diseñado para tareas de codificación, trabajo profesional, investigación y ejecución de agentes de larga duración. El modelo integra de forma nativa comprensión de imágenes y vídeo, con control flexible del modo de razonamiento.

Con 27.781 millones de parámetros y una arquitectura híbrida que combina atención lineal (Gated DeltaNet) con atención clásica (Gated Attention), ofrece una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000. Su licencia Apache 2.0 permite uso comercial sin restricciones, y los pesos están disponibles en formato safetensors, compatibles con Transformers, vLLM, SGLang y TokenSpeed. Es una opción relevante para equipos que necesitan un modelo compacto de alto rendimiento con capacidades multimodales y de agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida de 64 capas con un layout de 16 bloques repetidos, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de FFN, y 1 sub-bloque de Gated Attention seguido de FFN. La atención lineal (Gated DeltaNet) utiliza 48 cabezas para V y 16 para QK con dimensión de cabeza 128, mientras que la atención clásica (Gated Attention) usa 24 cabezas para Q y 4 para KV con dimensión 256 y RoPE de dimensión 64. La dimensión oculta es 5120 y la FFN tiene dimensión intermedia 17.408. El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que mejora la eficiencia de decodificación.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento, aunque no se especifican el número de tokens ni la composición del dataset. Tampoco se detalla si se aplicaron técnicas de RLHF o DPO. La model card indica que el modo de pensamiento (thinking) está activado por defecto y puede desactivarse por petición, con control del esfuerzo de razonamiento mediante el parámetro `reasoning_effort` y preservación del contexto de razonamiento histórico mediante `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento complejo, con mejoras sustanciales en codificación, trabajo profesional e investigación respecto a generaciones anteriores.
- Comprensión de imágenes y vídeo de forma nativa, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Ejecución de agentes de larga duración (long-horizon agentic tasks) con planificación autónoma y manejo de feedback del entorno.
- Control flexible del modo de pensamiento: activable/desactivable por petición, con ajuste de `reasoning_effort` y `preserve_thinking`.
- Soporte de tool calling y function calling, implícito en las capacidades de agente y en la compatibilidad con harnesses de desarrollo.
- Compatibilidad con múltiples frameworks de inferencia: Hugging Face Transformers, vLLM, SGLang y TokenSpeed.
- Capacidades multilingües no especificadas en la documentación proporcionada.

## Casos de uso

- Desarrollo de software asistido por IA: el modelo puede generar, revisar y depurar código en entornos de terminal, gracias a su rendimiento en benchmarks de codificación agéntica (Terminal Bench) y su capacidad para manejar feedback del entorno en tareas de múltiples pasos.
- Agentes autónomos de automatización de tareas: su planificación autónoma y manejo de feedback lo hacen adecuado para pipelines de automatización que requieren ejecutar comandos, interpretar resultados y ajustar el plan en consecuencia.
- Análisis de documentos técnicos con contenido visual: al comprender imágenes y diagramas STEM, puede extraer información de papers, informes y manuales que combinan texto y figuras.
- Procesamiento de vídeo para resúmenes o extracción de información: su soporte nativo de vídeo de hasta una hora permite analizar grabaciones de reuniones, tutoriales o vigilancia.
- Asistencia en investigación científica: puede razonar sobre datos, formular hipótesis y redactar secciones de artículos, aprovechando su contexto largo para mantener coherencia en documentos extensos.
- Soporte técnico y atención al cliente con contexto largo: la ventana de 262K tokens permite mantener conversaciones multi-turno con historial extenso, incluyendo capturas de pantalla o documentos adjuntos.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativa, pero la información proporcionada está incompleta: solo se muestra el encabezado y la primera fila de la sección de codificación (Terminal Bench 2.1, Terminus) sin valores numéricos. No se dispone de resultados completos de MMLU, HumanEval, GSM8K u otros benchmarks estándar en la documentación facilitada. Por tanto, no es posible presentar una tabla de resultados verificable. Se recomienda consultar la model card original en Hugging Face para obtener los datos completos cuando estén disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27B parámetros y pesos en fp32 (~55,6 GB), se requiere al menos 60 GB de VRAM para carga completa. Con cuantización a 8 bits, la VRAM estimada es de ~28-30 GB; con cuantización a 4 bits, ~14-16 GB. Estos valores son estimaciones basadas en el tamaño del modelo, no en datos oficiales.
- GPU recomendadas: para fp32 o fp16, GPUs de centro de datos como A100 80GB o H100. Para cuantización 8-bit, una RTX 4090 (24 GB) o A6000 (48 GB) pueden ser suficientes. Para 4-bit, GPUs consumer como RTX 3090/4090 son viables.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed y Hugging Face Transformers, según la model card. También es compatible con el servicio gestionado Qwen Cloud (próximamente).
- Latencia y throughput: no disponible en la documentación proporcionada.

## Comparativa con modelos similares

La model card menciona comparaciones con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se proporcionan especificaciones detalladas de estos modelos ni valores de benchmark completos. A partir de la información disponible:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262K nativo, 1M extensible | Apache 2.0 | Híbrido DeltaNet + Attention, visión-lenguaje |
| Qwen3.6-27B | 27B | No disponible | No disponible | Generación anterior, misma familia |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | Modelo de la misma familia, tamaño superior |

No se dispone de datos suficientes para una comparativa cuantitativa rigurosa. Se recomienda consultar la model card original para los resultados de benchmarks completos.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos conocidos ni evaluación de equidad en la documentación proporcionada.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se especifican tasas concretas.
- Los idiomas soportados no están documentados, lo que limita la confianza para despliegues multilingües sin validación previa.
- La ventana de contexto de 1M tokens es una extensión, no el valor nativo; el rendimiento en contextos muy largos puede degradarse.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo se distribuye tal cual, sin garantías de soporte oficial por parte del autor del repositorio (Iambackup).
- La información de benchmarks está incompleta en la model card, por lo que las afirmaciones de rendimiento deben verificarse de forma independiente antes de su uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Iambackup/Qwen3.8-27B
- Servicio Qwen Cloud (próximamente): https://www.qwencloud.com/models/qwen3.8-27b
