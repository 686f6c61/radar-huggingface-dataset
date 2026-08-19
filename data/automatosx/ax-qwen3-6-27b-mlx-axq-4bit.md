# AutomatosX/AX-Qwen3.6-27B-MLX-AXQ-4bit

## Resumen

AX-Qwen3.6-27B-MLX-AXQ-4bit es un checkpoint cuantizado en formato MLX Safetensors del modelo Qwen/Qwen3.6-27B, desarrollado por AutomatosX. Está diseñado específicamente para ejecutarse en Apple Silicon mediante el runtime MLX-LM, aplicando una cuantización mixta de precisión (AXQuant) que optimiza el camino de texto mientras preserva la torre de visión en BF16. El modelo base es un transformer denso multimodal con 27,36 mil millones de parámetros lógicos y una ventana de contexto configurada de 262.144 tokens, orientado a generación de texto y comprensión de imágenes.

Este checkpoint pertenece a la familia de productos AXQ de AutomatosX, que ofrece packs con presupuestos de almacenamiento de 4-bit y 6-bit. La versión 4-bit aquí descrita tiene un peso medido total de 5,3355 bits por peso (BPW), con una distribución que combina tensores a 4-bit, 8-bit y BF16. El repositorio no incluye pesos PyTorch ni GGUF, solo MLX Safetensors, y está certificado como Tier 1 para la revisión exacta indicada, aunque sin garantías de aceleración MTP ni de retención de calidad publicada.

La relevancia de este modelo radica en permitir ejecutar un LLM de 27B con capacidades multimodales en hardware Apple con memoria unificada, reduciendo el espacio de almacenamiento a 18,55 GB. Sin embargo, es importante señalar que no se han publicado evaluaciones de calidad comparadas con el modelo BF16 original ni con otros checkpoints uniformes, por lo que su rendimiento real en tareas específicas no está documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (dense), camino de texto optimizado |
| Parametros totales | 27,36 mil millones (logicos) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (configurado; limite practico segun memoria unificada) |
| Tipos de cuantizacion | Mixta AXQuant: 4-bit (87,65%), 8-bit (4,58%), BF16 (7,77%); group sizes 32 y 64 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B es un transformer denso de 27,36 mil millones de parámetros, con arquitectura `Qwen3_5ForConditionalGeneration` que incluye un codificador de visión. El checkpoint AXQ aplica una cuantización mixta de precisión mediante AXQuant 1.2.0, que asigna protecciones a tensores específicos: el camino de texto se cuantiza (mayoritariamente a 4-bit con grupos de 32 y 64), mientras que la torre de visión se conserva integra en BF16 como sidecar (333 tensores, 460,73 millones de parámetros, 0,92 GB). La asignación de precisión se basa en prioridades de arquitectura, sin calibración con datos reales. No se incluyen pesos MTP (multi-token prediction) y el checkpoint no está certificado para aceleración MTP. El proceso de conversión registró 497 conversiones de módulo exitosas sin fallos.

No se ha publicado información sobre el entrenamiento original del modelo base, como el numero de tokens o la composicion del dataset. Tampoco se documentan tecnicas de alineacion (RLHF, DPO) en esta ficha. La cuantizacion se realizo sobre el modelo BF16 de referencia, pero no se han publicado metricas de retencion de calidad frente a ese modelo ni frente a un baseline uniforme.

## Capacidades

- Generacion de texto: el checkpoint soporta generacion autoregresiva estandar a traves de MLX-LM, con la misma funcionalidad de texto que el modelo base.
- Razonamiento y conversacion: al derivar de Qwen3.6-27B, hereda las capacidades de razonamiento y dialogo del modelo original, aunque no hay evaluaciones publicadas especificas para esta cuantizacion.
- Vision: la torre de vision se preserva en BF16 como sidecar, permitiendo en principio entrada de imagenes, pero la calidad de vision-lenguaje no ha sido evaluada ni reclamada por el autor.
- Ejecucion en Apple Silicon: formato MLX optimizado para GPU unificada de chips M-series, con soporte nativo en MLX-LM.
- Cuantizacion mixta: proteccion selectiva de tensores sensibles (8-bit y BF16) para mitigar perdidas de precision en capas criticas.
- No incluye soporte de audio (no hay pesos de audio en el checkpoint).
- No se documenta soporte explicito de tool calling o function calling en la informacion proporcionada, aunque el modelo base podria tenerlo; no esta confirmado para este checkpoint.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint esta disenado para ejecutarse en MacBooks y Mac Studios con memoria unificada de al menos 24 GB (18,55 GB de pesos + overhead). Un desarrollador puede cargar el modelo con `mlx_lm.generate` para tareas de generacion de texto sin depender de servicios en la nube.
- Prototipado rapido de aplicaciones conversacionales: gracias a su tamano reducido (18,5 GB) y formato MLX, permite integrar un LLM de 27B en entornos de desarrollo locales para pruebas de concepto de chatbots o asistentes, sin necesidad de infraestructura GPU dedicada.
- Procesamiento de documentos con vision (potencial): al conservar la torre de vision en BF16, podria usarse para tareas de comprension de imagenes y extraccion de informacion de documentos escaneados, aunque el autor no ha validado esta capacidad.
- Desarrollo de agentes locales: si el modelo base soporta tool calling, este checkpoint podria servir como backend para agentes que necesiten ejecutar funciones locales, aunque no hay confirmacion en la documentacion.
- Educacion e investigacion: util para experimentar con cuantizacion mixta y medir el impacto de la precision selectiva en modelos grandes, dado que el repositorio incluye metadatos detallados de la distribucion de bits por peso.
- Despliegue en entornos con restricciones de almacenamiento: al ocupar 18,55 GB, cabe en discos de portatiles y permite mantener multiples modelos cuantizados sin necesidad de almacenamiento masivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no hay evaluacion de calidad frente a BF16 o baselines uniformes, y que no se reclama retencion de calidad. Tampoco se ofrecen metricas de velocidad o latencia, ya que la certificacion Tier 1 cubre solo la integridad de la conversion y el tamano, no el rendimiento.

## Requisitos de hardware

- VRAM estimada: al ser MLX, utiliza memoria unificada del chip Apple Silicon. Los pesos ocupan 18,53 GB en safetensors; con overhead de ejecucion se recomienda al menos 24 GB de memoria unificada.
- GPU recomendadas: no aplica a GPUs NVIDIA; requiere Apple Silicon (M-series). La certificacion Tier 1 se realizo en un `df-macbookpro-m5` (2026-08-14), lo que sugiere compatibilidad con M5 y generaciones anteriores.
- Compatibilidad con hardware de consumo: si, en Macs con suficiente memoria unificada (por ejemplo, MacBook Pro con chip M1 Pro/Max o superior y 32 GB o mas de RAM unificada).
- Opciones de despliegue: MLX-LM (principal), tambien puede usarse con la libreria MLX directamente. No se incluyen manifiestos para AX Engine, por lo que no se puede ejecutar con ese runtime.
- Latencia y throughput: no se han publicado datos. La velocidad dependera del chip, la memoria y la configuracion de cuantizacion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros checkpoints cuantizados de Qwen3.6-27B en MLX. El autor menciona un hermano de 6-bit (`AX-Qwen3.6-27B-MLX-AXQ-6bit`) que ofrece mayor precision media, pero no se proporcionan datos de rendimiento comparados. Como referencia general, el modelo base Qwen3.6-27B en BF16 requeriria aproximadamente 55 GB de memoria (27,36B * 2 bytes), por lo que esta version cuantizada reduce el espacio a un tercio, a costa de una precision desconocida.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluacion de calidad: no hay datos de retencion de rendimiento frente al modelo BF16 original ni frente a cuantizaciones uniformes. El autor declara explicitamente que no se hace ninguna reclamacion de calidad.
- La cuantizacion se basa en prioridades de arquitectura sin calibracion con datos reales, lo que puede provocar perdidas impredecibles en tareas especificas.
- La torre de vision esta presente en BF16 pero no ha sido evaluada; el uso de capacidades multimodales es bajo su propio riesgo.
- No incluye soporte MTP (multi-token prediction), por lo que no hay aceleracion especulativa disponible en este checkpoint.
- El runtime AX Engine no esta soportado de forma nativa; solo se garantiza la ejecucion via MLX-LM.
- No se documentan idiomas soportados, aunque el modelo base Qwen3.6 probablemente soporta multiples idiomas; esta informacion no esta disponible en la model card.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un artefacto reciente y poco probado en la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones de calidad puede ser un riesgo para entornos de produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AutomatosX/AX-Qwen3.6-27B-MLX-AXQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Certificado Tier 1: https://github.com/defai-digital/axquant/blob/main/docs/certifications/qwen36-27b-axq4-nomtp-tier1.md
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo de modelos MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
