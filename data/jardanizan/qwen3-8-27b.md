# Jardanizan/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje y visión (image-text-to-text) de 27.000 millones de parámetros, desarrollado por el equipo de Qwen y distribuido en este repositorio por el usuario Jardanizan. Se presenta como la última generación de la familia abierta Qwen, construido sobre la base arquitectónica de Qwen3.5, e incorpora avances significativos en tareas de codificación, trabajo profesional, investigación y ejecución de agentes de largo horizonte. Es un modelo denso compacto con soporte nativo para entrada de imágenes y vídeo, control flexible del razonamiento (thinking mode) y una ventana de contexto nativa de 262 144 tokens, ampliable hasta 1 000 000.

La arquitectura combina atención lineal con Gated DeltaNet y atención completa con Gated Attention, junto con predicción multi-token (MTP), lo que permite un equilibrio entre eficiencia computacional y capacidad de razonamiento profundo. El modelo se distribuye en formato safetensors, compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed, y está pensado para su despliegue tanto en entornos locales como en la nube. Aunque el repositorio de Jardanizan no incluye datos de idiomas soportados ni resultados de benchmarks completos, la model card original de Qwen indica que el modelo destaca en coding, razonamiento y tareas de agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida: Gated DeltaNet (atención lineal) + Gated Attention (atención completa) |
| Parametros totales | 27 781 427 952 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 000 000 |
| Tipos de cuantizacion | no disponible (solo se ofrecen pesos en safetensors, sin versiones cuantizadas en este repo) |
| Idiomas soportados | no disponible (no se especifica en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo causal de lenguaje con un codificador de visión integrado. La capa de lenguaje sigue un diseño híbrido que alterna bloques de atención lineal y atención completa. El layout concreto es: 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)). Cada Gated DeltaNet utiliza 48 cabezas de atención lineal para la clave de valor (V) y 16 para las consultas y claves (QK), con una dimensión de cabeza de 128. El Gated Attention emplea 24 cabezas para Q y 4 para KV, con dimensión de cabeza de 256 y rotary position embedding de dimensión 64. La red feed-forward tiene una dimensión intermedia de 17 408. El modelo incorpora Multi-Token Prediction (MTP), entrenado con múltiples pasos, lo que mejora la eficiencia de decodificación y la capacidad de razonamiento.

El entrenamiento consta de dos fases: pre-training y post-training, aunque no se detallan los datos concretos (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La model card menciona que el modelo está diseñado para tareas de agente de largo horizonte, lo que sugiere un entrenamiento específico en entornos interactivos y seguimiento de instrucciones complejas. El control flexible del pensamiento (thinking mode) se activa por defecto y puede desactivarse por petición, además de permitir ajustar la profundidad de razonamiento mediante `reasoning_effort` y conservar el contexto de razonamiento histórico con `preserve_thinking`.

## Capacidades

- Razonamiento complejo y multi-paso, con modo de pensamiento activable y ajustable (`thinking mode`, `reasoning_effort`, `preserve_thinking`).
- Generación de código y agentic terminal coding (ejecución de tareas en terminal de forma autónoma).
- Comprensión de imágenes y vídeo nativa, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Soporte para tareas de agente: planificación autónoma y manejo de feedback del entorno para completar tareas de extremo a extremo.
- Capacidades multilingües no especificadas, pero se espera que cubra los principales idiomas dado el origen de Qwen.
- Compatible con herramientas de desarrollo y harnesses populares (vLLM, SGLang, Transformers, TokenSpeed).
- Predicción multi-token (MTP) para acelerar la decodificación y mejorar la coherencia.

## Casos de uso

- Asistente de codificación en producción: el modelo puede integrarse en entornos de desarrollo integrado o pipelines de CI/CD para generar código, revisar cambios y ejecutar comandos de terminal de forma autónoma, gracias a su capacidad de agentic coding y soporte para tool calling (implícito en su entrenamiento para agentes).
- Análisis de documentos técnicos y científicos: con su comprensión de imágenes y vídeo, puede extraer información de diagramas, gráficos y documentos escaneados, útil para investigación y revisión de literatura.
- Automatización de atención al cliente con contexto largo: su ventana de 262K tokens permite mantener conversaciones multi-turno extensas y recordar detalles de interacciones previas, mejorando la personalización y coherencia.
- Agentes de automatización de tareas en entornos de terminal: puede planificar y ejecutar secuencias de comandos, manejar errores y adaptarse al feedback del sistema, ideal para operaciones de DevOps o administración de sistemas.
- Análisis de vídeo para vigilancia o revisión de contenido: el modelo procesa vídeos de larga duración (hasta una hora) y puede generar resúmenes, detectar eventos o responder preguntas sobre el contenido.
- Asistente de investigación y redacción técnica: capaz de razonar sobre problemas complejos, buscar información en documentos largos y generar informes estructurados, con control de profundidad de razonamiento para equilibrar velocidad y detalle.

## Benchmarks y rendimiento

No se han publicado resultados numéricos completos de benchmarks en la información disponible. La model card incluye una tabla que menciona "Terminal Bench 2.1 (Terminus)" para coding, pero los valores no están visibles en el extracto proporcionado. Por tanto, no es posible presentar una tabla con resultados comparativos. Se recomienda consultar la documentación oficial de Qwen para obtener datos de rendimiento detallados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27 781 millones de parámetros, en precisión FP16 se requieren aproximadamente 55 GB de VRAM (sin contar overhead de activaciones). Con cuantización a 4 bits (si estuviera disponible) se podría reducir a unos 14-16 GB.
- GPU recomendadas: para FP16, se necesitan GPUs de datacenter como A100 80GB, H100 80GB o múltiples GPUs en paralelo (p.ej., 2× RTX 4090 24GB con sharding). Para cuantización 4-bit, una sola RTX 4090 24GB podría bastar, aunque no se ofrecen pesos cuantizados en este repositorio.
- Despliegue en consumer GPU: solo es viable si se dispone de cuantización propia (GGUF, AWQ) o se utiliza una GPU con al menos 48 GB (p.ej., RTX 6000 Ada). No se incluyen archivos GGUF en este repo.
- Opciones de despliegue: compatible con vLLM, SGLang, TokenSpeed y Hugging Face Transformers. También se menciona un servicio gestionado en Qwen Cloud con contexto de 1M por defecto y herramientas integradas.
- Latencia y throughput: no disponible en la información proporcionada. Dependerá del hardware y de la configuración de decodificación (MTP puede acelerar la generación).

## Comparativa con modelos similares

La model card original compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se ofrecen valores numéricos en el extracto. Sin datos concretos, no es posible realizar una comparativa cuantitativa. Se puede afirmar que todos son modelos de tamaño similar (27-30B) con enfoque en razonamiento y tareas de agente, pero las diferencias específicas no están disponibles.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como modelo de lenguaje, puede generar información falsa o sesgada, especialmente en contextos ambiguos. No se han publicado evaluaciones específicas de sesgo.
- Riesgo de alucinación en razonamiento: aunque el modo de pensamiento mejora la fiabilidad, no garantiza exactitud en tareas críticas; se recomienda validación humana para decisiones importantes.
- Limitaciones de idioma: no se especifican los idiomas soportados; es probable que el rendimiento varíe según el idioma, con mejores resultados en inglés y chino (por el origen de Qwen).
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero se debe atribuir el copyright y mantener el aviso de licencia en redistribuciones.
- Contexto extendido: la extensión a 1M tokens puede requerir técnicas de interpolación de RoPE o atención eficiente; el rendimiento en contextos muy largos no está garantizado sin ajustes adicionales.
- Dependencia de hardware: el tamaño del modelo (27B) exige GPUs de alta capacidad o cuantización para entornos locales; no es adecuado para dispositivos de bajo consumo sin optimización adicional.

## Enlaces

- Repositorio en Hugging Face (Jardanizan): https://huggingface.co/Jardanizan/Qwen3.8-27B
- Repositorio original de Qwen en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-27B
- Página de Together AI con detalles del modelo: https://www.together.ai/models/qwen3-8-27b
- Servicio gestionado de Qwen Cloud (próximamente): https://www.qwencloud.com/models/qwen3.8-27b
