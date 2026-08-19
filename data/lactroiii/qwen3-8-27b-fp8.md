# lactroiii/Qwen3.8-27B-FP8

## Resumen

Qwen3.8-27B-FP8 es una versión cuantizada en FP8 del modelo Qwen3.8-27B, un modelo de lenguaje causal con encoder de visión desarrollado por el equipo Qwen (Alibaba) y publicado en HuggingFace por el usuario lactroiii. Se trata de un modelo denso de aproximadamente 27,8 mil millones de parámetros que integra comprensión de imagen y vídeo, control flexible de razonamiento (thinking mode) y una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000. Está orientado a tareas de codificación, trabajo profesional, investigación y tareas agénticas de larga duración.

La cuantización FP8 con bloque de tamaño 128 mantiene un rendimiento casi idéntico al modelo original según el autor, y reduce el peso del repositorio a 30,9 GB. Los artefactos son compatibles con Hugging Face Transformers, vLLM, SGLang y TokenSpeed, lo que facilita su integración en stacks de producción existentes. La licencia Apache 2.0 permite uso comercial sin restricciones de atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model híbrido con vision encoder (Gated DeltaNet + Gated Attention + FFN) |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | FP8 (block size 128) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida que combina atención lineal (Gated DeltaNet) con atención completa (Gated Attention) y redes feed-forward. El layout del modelo es de 64 capas con dimensión oculta de 5120, organizadas como 16 bloques de `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. La Gated DeltaNet utiliza 48 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; la Gated Attention usa 24 cabezas para Q y 4 para KV con dimensión 256 y RoPE de dimensión 64. La FFN tiene dimensión intermedia de 17.408. El modelo incorpora entrenamiento Multi-Token Prediction (MTP) en varias etapas y un encoder de visión para comprensión de imágenes y vídeos.

El entrenamiento consta de dos fases: pre-entrenamiento y post-entrenamiento. El modelo incluye un modo de razonamiento (thinking mode) activado por defecto, desactivable por petición, con control de profundidad mediante `reasoning_effort` y retención del contexto de razonamiento histórico mediante `preserve_thinking`. La cuantización FP8 con granularidad fina (bloques de 128) es la única modificación respecto al modelo base y, según el autor, no introduce degradación significativa de rendimiento.

## Capacidades

- Generación de texto y razonamiento multi-step con control de profundidad (`reasoning_effort`).
- Comprensión de imagen y vídeo nativa: diagramas STEM, documentos técnicos y vídeos de hasta una hora de duración.
- Ejecución agéntica: planificación autónoma y manejo de feedback del entorno para completar tareas de larga duración de forma fiable.
- Soporte de tool calling y function calling, implícito en las capacidades agénticas del modelo.
- Codificación y trabajo profesional: mejoras sustanciales frente a la generación anterior (Qwen3.6) en tareas de programación, investigación y trabajo de oficina.
- Control flexible de razonamiento: el modo thinking puede activarse o desactivarse por petición, y el contexto de razonamiento de mensajes históricos se conserva mediante `preserve_thinking`.
- Compatibilidad con harnesses y herramientas de desarrollo populares para integración en stacks existentes.

## Casos de uso

- Atención al cliente automatizada: con 262.144 tokens de contexto nativos, el modelo puede gestionar conversaciones multi-turno extensas manteniendo el historial completo, incluyendo capturas de pantalla o imágenes enviadas por el usuario.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para generación, revisión y refactorización de código, con capacidad de razonar sobre errores de compilación y feedback del terminal.
- Análisis de documentos técnicos con imágenes: el encoder de visión permite extraer información de diagramas STEM, esquemas de circuitos, gráficos científicos y documentos escaneados, combinando texto e imagen en una única consulta.
- Agentes autónomos de larga duración: la planificación autónoma y el manejo de feedback del entorno permiten desplegar agentes que ejecutan tareas multi-paso (navegación web, automatización de procesos, investigación) durante horas sin intervención humana.
- Análisis de vídeo: la comprensión de vídeo de hasta una hora permite resumir grabaciones de reuniones, vigilar procesos industriales o extraer información de vídeos de vigilancia.
- Investigación y trabajo profesional: búsqueda y síntesis de literatura, redacción de informes, análisis de datos con razonamiento profundo activable mediante `reasoning_effort`.
- RAG con contexto largo: la ventana de 262K tokens permite indexar y consultar corpus extensos sin fragmentación, y la extensión a 1M tokens habilita casos de uso de recuperación sobre documentación completa de proyectos.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks que compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, comenzando por la categoría "Coding" con la métrica "Agentic terminal coding". Sin embargo, los valores numéricos concretos fueron truncados en la información disponible y no pueden reproducirse aquí. No se han publicado resultados de benchmarks adicionales en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 30-35 GB en FP8 (27,8 GB solo de pesos más caché KV y activaciones).
- GPU recomendadas: A100 40 GB, H100 80 GB, A6000 48 GB. Una RTX 4090 de 24 GB podría quedarse corta con la caché KV en contextos largos.
- No cabe en GPUs de consumo de gama media (RTX 3080, 4070, etc.) sin cuantización adicional más agresiva.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed y Hugging Face Transformers, todos compatibles con los pesos FP8.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependen del hardware y de la configuración de `reasoning_effort`.

## Comparativa con modelos similares

La model card referencia Qwen3.6-27B (generación anterior del mismo tamaño), Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max como comparativas en benchmarks. Sin embargo, no se dispone de las especificaciones técnicas (parámetros, contexto, licencia) de estos modelos en la información proporcionada, por lo que no es posible construir una tabla comparativa fiable. El único dato confirmado es que Qwen3.8-27B supera a Qwen3.6-27B en las categorías evaluadas, según la tabla truncada.

## Limitaciones y advertencias

- La cuantización FP8 puede introducir una pérdida de precisión mínima en operaciones de punto flotante, aunque el autor indica que el rendimiento es casi idéntico al modelo original.
- Los idiomas soportados no están documentados en la model card; la cobertura multilingüe real debe validarse empíricamente.
- La extensión del contexto a 1.000.000 de tokens puede requerir configuración específica (posiblemente RoPE scaling o ajustes de memoria) no documentada en esta ficha.
- El modelo requiere hardware de alta gama (mínimo 30-35 GB VRAM en FP8), lo que limita su despliegue en entornos de consumo.
- El modo thinking activado por defecto incrementa la latencia y el coste computacional por petición; debe desactivarse explícitamente para tareas de baja latencia.
- No se dispone de información sobre sesgos, alucinaciones o comportamiento en dominios específicos más allá de los benchmarks generales de la model card.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/lactroiii/Qwen3.8-27B-FP8
- Modelo base (referenciado en la model card): https://huggingface.co/Qwen/Qwen3.8-27B
- Servicio gestionado Qwen Cloud (mencionado en la model card): https://www.qwencloud.com
