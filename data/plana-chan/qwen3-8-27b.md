# Plana-Chan/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal denso de 27 000 millones de parámetros, desarrollado por Alibaba (Qwen) y publicado bajo licencia Apache 2.0. Se trata de un modelo nativo de visión-lenguaje (VLM) que integra un codificador visual y un decodificador de lenguaje, capaz de procesar tanto texto como imágenes y vídeos. Está diseñado para tareas complejas de razonamiento, codificación, trabajo profesional y ejecución de agentes de larga duración, con un control flexible del modo de pensamiento (thinking mode) que puede activarse o desactivarse por petición.

Construido sobre la base arquitectónica de Qwen3.5, incorpora innovaciones como una capa híbrida de atención (Gated DeltaNet lineal combinada con Gated Attention), predicción multi-token (MTP) y una ventana de contexto nativa de 262 144 tokens, extensible hasta 1 000 000. El modelo está disponible en formato Hugging Face Transformers, compatible con vLLM, SGLang y TokenSpeed, y se distribuye en pesos safetensors con un tamaño de repositorio de 55,6 GB. Su relevancia actual radica en ofrecer capacidades de nivel frontera en un paquete compacto y desplegable, con soporte para herramientas y razonamiento multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27 781 427 952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura de transformer causal con un codificador de visión integrado. El bloque de lenguaje se organiza en 64 capas con una dimensión oculta de 5120 y una capa de embedding de 248 320 tokens (con padding). La estructura interna sigue un patrón de 16 repeticiones de `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. La Gated DeltaNet es una capa de atención lineal con 48 cabezas para V y 16 para QK, con dimensión de cabeza 128, mientras que la Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de 64 dimensiones. La red feed-forward tiene una dimensión intermedia de 17 408.

El entrenamiento se realizó en dos etapas: pre-entrenamiento y post-entrenamiento, con predicción multi-token (MTP) entrenada en múltiples pasos. No se especifican detalles sobre el volumen de tokens de entrenamiento ni la composición del dataset, pero la model card indica mejoras sustanciales en codificación, trabajo profesional, investigación y tareas de agente de larga duración respecto a la generación anterior (Qwen3.6). El modelo soporta control flexible del razonamiento mediante `reasoning_effort` y conservación del contexto de razonamiento histórico con `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento activable o desactivable por petición.
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Codificación de nivel frontera, incluyendo codificación de terminal agéntica (evaluada en Terminal Bench 2.1).
- Soporte de tool calling y function calling, con planificación autónoma y manejo de feedback del entorno.
- Ejecución de agentes de larga duración (long-horizon agentic tasks) con mayor fiabilidad en la finalización de tareas.
- Capacidades multilingües no especificadas en la documentación disponible.
- Compatibilidad con múltiples frameworks de inferencia (Transformers, vLLM, SGLang, TokenSpeed).

## Casos de uso

- Asistente de codificación en producción: el modelo puede integrarse en pipelines de CI/CD para generar, revisar y depurar código, aprovechando su modo de pensamiento para razonar sobre problemas complejos y su soporte de tool calling para interactuar con repositorios y entornos de ejecución.
- Automatización de atención al cliente con contexto largo: su ventana de 262 144 tokens permite mantener conversaciones multi-turno extensas, incorporando historial completo y documentos de referencia sin truncamiento.
- Análisis de documentos técnicos y científicos: al comprender imágenes y diagramas, puede extraer información de figuras, tablas y gráficos en papers, informes y manuales.
- Agente autónomo de investigación: con su capacidad de planificación multi-paso y manejo de feedback, puede ejecutar tareas de búsqueda, recopilación y síntesis de información de forma autónoma.
- Transcripción y análisis de vídeo: su comprensión de vídeo de hasta una hora permite resumir reuniones, extraer acciones clave o generar informes a partir de grabaciones.
- Generación de informes profesionales: combina razonamiento estructurado con entrada visual para producir documentos técnicos, propuestas o análisis de negocio a partir de datos mixtos (texto, imágenes, tablas).

## Benchmarks y rendimiento

La model card del autor incluye una tabla de benchmarks comparativos, pero los valores numéricos no están disponibles en la información extraída. Se mencionan los siguientes benchmarks y modelos comparados:

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han publicado resultados numéricos completos en la información proporcionada. Se recomienda consultar la model card original en Hugging Face para obtener los valores exactos.

## Requisitos de hardware

- Tamaño del repositorio: 55,6 GB en safetensors, lo que sugiere que la carga completa del modelo en memoria requiere al menos esa cantidad de VRAM o RAM.
- Para inferencia con precisión FP16, se estima que se necesitan aproximadamente 56 GB de VRAM (27,8 B parámetros × 2 bytes), lo que supera la capacidad de GPUs de consumo típicas (RTX 4090 con 24 GB). Se requieren GPUs profesionales como A100 (80 GB) o H100 (80 GB) para ejecución sin cuantización.
- Con cuantización a 8 bits o 4 bits, podría caber en GPUs de 24-32 GB, pero no se proporcionan datos oficiales de cuantización.
- Opciones de despliegue: compatible con vLLM, SGLang, TokenSpeed y Hugging Face Transformers. También se menciona un servicio gestionado en Qwen Cloud (próximamente).
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Visión | Modo pensamiento |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,8 B | 262 144 (ext. 1M) | Apache 2.0 | Sí | Sí |
| Qwen3.6-27B | 27 B (aprox.) | No disponible | Apache 2.0 | Sí | Sí |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa se basa en la información de la model card, que posiciona a Qwen3.8-27B como una mejora sobre Qwen3.6-27B y lo compara con Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, aunque no se dispone de especificaciones detalladas de estos últimos.

## Limitaciones y advertencias

- No se han publicado limitaciones específicas sobre sesgos o alucinaciones en la documentación disponible.
- El modelo puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo si el modo de pensamiento está desactivado.
- La ventana de contexto de 262 144 tokens es amplia, pero el rendimiento puede degradarse en los extremos superiores; la extensión a 1M requiere configuración adicional.
- Los idiomas soportados no están especificados; se recomienda verificar la cobertura multilingüe antes de usarlo en producción.
- Aunque la licencia Apache 2.0 permite uso comercial, es necesario revisar los términos de la plataforma de despliegue (por ejemplo, Qwen Cloud) si se utiliza el servicio gestionado.
- El tamaño del modelo (27,8 B parámetros) implica requisitos de hardware significativos para inferencia local, lo que puede limitar su uso en entornos con recursos reducidos.

## Enlaces

- Repositorio Hugging Face (Plana-Chan): https://huggingface.co/Plana-Chan/Qwen3.8-27B
- Repositorio oficial de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de Groq: https://console.groq.com/docs/model/qwen/qwen3.8-27b
- Página de Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Documentación de Alibaba Cloud Model Studio: https://help.aliyun.com/en/model-studio/qwen3-8-27b
- Guía local (Substack): https://linas.substack.com/p/qwen3-8-27b-local-guide
