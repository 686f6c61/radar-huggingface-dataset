# inferencerlabs/Inkling-Mini-MLX

## Resumen

Inkling-Mini-MLX es una distribución cuantizada del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por inferencerlabs en formato MLX para su ejecución nativa en hardware Apple Silicon. El modelo original pertenece a Thinking Machines y está diseñado para tareas de imagen-a-texto y conversación multimodal, con soporte declarado únicamente para inglés. Esta versión no introduce cambios arquitectónicos: se limita a repaquetar los pesos ya cuantizados del modelo base, incluyendo las capas multimodales y MTP (multi-token prediction).

La relevancia de esta ficha radica en su enfoque práctico: ofrece una vía de despliegue local en Macs con chip M-series mediante el framework MLX, con métricas de rendimiento publicadas sobre un M3 Ultra (aproximadamente 28 tokens/s y 19,5 GiB de memoria para 500 tokens, y hasta 36 tokens/s con MTP activado en tareas de código). El repositorio ocupa 19,8 GB y no incluye información sobre licencia, parámetros totales ni longitud de contexto.

La información disponible es escasa y proviene casi exclusivamente de la model card del autor de la cuantización, que además incluye un descargo de responsabilidad explícito sobre la precisión del modelo y la ausencia de garantías. Cualquier evaluación de producción debe complementarse con la documentación del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; la model card menciona capas multimodales y MTP) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos cuantizados con una versión modificada de MLX (el repositorio indica "quantized"; no se especifica el esquema exacto, p. ej. 4-bit o 8-bit) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx) |
| Tamano del repositorio | 19,8 GB |
| Pipeline | image-text-to-text |
| Modelo base | thinkingmachines/Inkling-2-Mini |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. La model card de esta distribución únicamente indica que se trata de un modelo multimodal (image-text-to-text) y que el repaquetado incluye las capas multimodales y las capas MTP (multi-token prediction), lo que sugiere que el modelo base incorpora decodificación especulativa o predicción multi-token como mecanismo de aceleración de inferencia. No se detallan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO.

El trabajo de inferencerlabs se limita a la cuantización y repaquetado de los pesos existentes mediante una versión modificada de MLX, orientada a la ejecución en Apple Silicon. No se documentan innovaciones técnicas propias más allá del soporte de MTP en el motor de inferencia (Inferencer v2.5.4), que el autor reporta como opción activable en los controles de inferencia.

## Capacidades

- Generación de texto conversacional en inglés.
- Comprensión de imágenes y respuesta en texto (pipeline image-text-to-text).
- Conversación multi-turno (tag "conversational").
- Aceleración mediante MTP (multi-token prediction) para reducir latencia en generación, con mejora reportada en tareas de código (de ~28 a ~36 tokens/s en M3 Ultra).
- Ejecución local en hardware Apple Silicon mediante MLX.
- No se documenta soporte de tool calling, function calling, agentes, matemáticas avanzadas, audio ni otros modos especiales en la información disponible.

## Casos de uso

- Asistente visual local en Mac: el modelo puede procesar capturas de pantalla o imágenes y responder en texto, aprovechando la ejecución nativa en MLX sobre Apple Silicon sin depender de la nube.
- Descripción y análisis de imágenes en flujos de trabajo de escritorio: integrable en aplicaciones macOS que necesiten generar descripciones o extraer información de imágenes con baja latencia (~28 tokens/s en M3 Ultra).
- Prototipado de aplicaciones multimodales: útil para desarrolladores que quieran validar pipelines image-text-to-text en local antes de migrar a infraestructura GPU o a la versión completa del modelo base.
- Generación de código asistida con MTP: el autor reporta ~36 tokens/s en tareas de código con MTP activado, lo que lo hace adecuado para autocompletado o generación de fragmentos en entornos de desarrollo sobre Mac.
- Investigación en cuantización y despliegue en Apple Silicon: sirve como referencia para estudiar el impacto del repaquetado MLX y del MTP en latencia y memoria (19,5-20 GiB).
- Chat multimodal de uso personal: conversaciones con contexto visual en inglés para tareas de productividad, dado el soporte conversacional y el tamaño manejable del repositorio (19,8 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de inferencia medidas por el autor:

| Entorno | Carga | Throughput | Memoria |
|---|---|---|---|
| M3 Ultra (Inferencer v2.5.4) | 500 tokens | ~28 tokens/s | ~19,5 GiB |
| M3 Ultra con MTP (tareas de código) | 500 tokens | ~36 tokens/s | ~20 GiB |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~19,5 GiB para generación de 500 tokens sin MTP; ~20 GiB con MTP activado (medido en M3 Ultra).
- Hardware recomendado: Apple Silicon con memoria unificada suficiente; el M3 Ultra es el único chip con métricas publicadas. No se documentan resultados en M1, M2, M3 base, M3 Pro ni M4.
- GPU consumer: no aplica directamente, ya que el formato MLX está orientado a Apple Silicon; no se documenta compatibilidad con CUDA.
- Opciones de despliegue: MLX y la aplicación Inferencer v2.5.4 (probada por el autor). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~28 tokens/s en M3 Ultra sin MTP y ~36 tokens/s con MTP en tareas de código, según el autor.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento, parámetros ni contexto de modelos comparables de la misma categoría (multimodales pequeños ejecutables en local), por lo que no es posible establecer una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base thinkingmachines/Inkling-2-Mini antes de cualquier despliegue en producción.
- Solo inglés: el tag de idioma es "en"; no se documenta soporte multilingüe.
- Sin datos de arquitectura ni de entrenamiento: se desconocen parámetros totales, contexto máximo, composición del dataset y procesos de alineación, lo que dificulta evaluar sesgos y robustez.
- Riesgo de alucinación: el propio autor incluye un descargo indicando que los modelos pueden no ser precisos o contextualmente apropiados y que el usuario es responsable de verificar la información.
- Sin benchmarks: no hay evidencia publicada de calidad en tareas estándar (razonamiento, código, matemáticas), solo métricas de velocidad.
- Rendimiento medido en un único hardware (M3 Ultra): el throughput en chips de gama inferior puede ser sustancialmente menor, y no se documenta el comportamiento con contextos largos.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema mínimo, sin validación comunitaria independiente.
- Cuantización propietaria/modificada: el esquema exacto de cuantización no se especifica, lo que limita la reproducibilidad y la comparación con otras distribuciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/inferencerlabs/Inkling-Mini-MLX
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Vídeos de demostración: https://youtube.com/xcreate
- Aplicación Inferencer: https://inferencer.com
- Repositorio MLX: https://github.com/ml-explore/mlx
