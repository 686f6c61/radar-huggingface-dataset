# hbpkillerX/lift-fp8-dynamic

## Resumen

Lift FP8 Dynamic es una versión cuantizada en FP8 del modelo datalab-to/lift, desarrollada por el usuario hbpkillerX. Lift es un modelo multimodal de extracción de documentos que convierte imágenes de documentos en JSON estructurado, construido por Datalab sobre la arquitectura Qwen3.5. Esta variante aplica una receta de cuantización mixta FP8 para reducir el peso de los pesos de 9.400 millones de parámetros y facilitar su despliegue en infraestructura con menor VRAM.

La cuantización se realizó con LLM Compressor 0.12.0.1 sobre una única NVIDIA L40S, usando PyTorch 2.12.0, Transformers 5.10.1 y compressed-tensors 0.17.1. La receta FP8_DYNAMIC emplea pesos FP8 estáticos por canal y activaciones FP8 dinámicas por token, sin datos de calibración. El resultado son 128 tensores FP8 y un repositorio de 13,5 GB.

Es relevante porque reduce el coste de servir un modelo de extracción documental de casi 9.400 millones de parámetros, pero conviene tratarlo con cautela: el propio autor indica que la compatibilidad de inferencia con vLLM y la precisión de extracción documental no han sido validadas para este checkpoint, y no se reclama equivalencia de calidad ni de velocidad respecto al modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer multimodal con encoder visual y atención lineal) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8_DYNAMIC: pesos FP8 estáticos por canal y activaciones FP8 dinámicas por token; vision encoder, linear attention y embeddings en BF16; sin cuantización de KV-cache |
| Idiomas soportados | no disponible |
| Licencia | openrail (OpenRAIL-M modificada de Lift, con restricciones de uso) |
| Formato de pesos | safetensors (compressed-tensors), 13.520.203.008 bytes |

## Arquitectura y entrenamiento

El modelo parte de datalab-to/lift, revisión `221e0fcecfb3f557ca123e5a6e3452d459c25d90`, que emplea la arquitectura Qwen3.5. Se trata de un modelo image-text-to-text orientado a extracción de documentos: recibe imágenes de documentos y produce JSON estructurado. La arquitectura combina un encoder visual con capas de atención lineal, según los patrones de exclusión de la receta de cuantización (`re:.*visual.*`, `re:.*linear_attn.*`).

No se dispone de información sobre el entrenamiento original de Lift en la documentación proporcionada: no se indican número de tokens, composición del dataset ni si hubo RLHF o DPO. Respecto a esta variante, la única información técnica es el proceso de cuantización: receta FP8_DYNAMIC aplicada a capas `Linear`, con exclusión de `lm_head`, encoder visual y atención lineal, que permanecen en BF16. No se usaron datos de calibración. Se conservan el processor, el tokenizer y la plantilla de chat originales; los tensores auxiliares del checkpoint fuente no cargados por la clase de Transformers no se preservan.

## Capacidades

- Extracción de JSON estructurado a partir de imágenes de documentos (pipeline image-text-to-text).
- Procesamiento multimodal imagen-texto mediante encoder visual.
- Conversación multi-turno (tag `conversational` del repositorio).
- Compatibilidad declarada con endpoints de inferencia (`endpoints_compatible`).
- Soporte previsto para vLLM mediante compressed-tensors (no validado en este checkpoint).
- Capacidades de tool calling, agentes, matemáticas o código: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles.

## Casos de uso

- Extracción de datos de facturas: el modelo recibe la imagen de una factura y devuelve un JSON con campos como emisor, importes, fechas e impuestos, lo que permite alimentar sistemas de contabilidad sin OCR manual.
- Digitalización de formularios: procesamiento por lotes de formularios escaneados para convertirlos en registros estructurados y cargarlos en bases de datos o ERP.
- Procesamiento de documentos de identidad: extracción de campos de pasaportes, DNIs o contratos en pipelines de onboarding, con validación posterior del JSON generado.
- Automatización de back office: conversión de albaranes, recibos y documentos logísticos a JSON para integrarlos en sistemas de gestión, aprovechando la cuantización FP8 para reducir coste por documento.
- Enriquecimiento de archivos documentales: indexación de documentos escaneados extrayendo metadatos estructurados que alimenten motores de búsqueda o sistemas RAG.
- Despliegue en infraestructura limitada: al ocupar 13,5 GB en FP8, permite servir el modelo en GPUs de 24-48 GB donde la versión BF16 de 9.400 millones de parámetros no cabría con holgura, siempre que se valide previamente la precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la precisión de extracción documental y la compatibilidad de inferencia con vLLM no han sido validadas para este checkpoint, y que no se reclama equivalencia de calidad ni de velocidad respecto al modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 suman 13.520.203.008 bytes (unos 12,6 GiB); con overhead de activaciones, KV-cache y encoder visual en BF16, se recomienda al menos 24 GB de VRAM.
- GPU recomendadas: NVIDIA L40S (usada para la conversión), A100, H100 o L40S para producción; GPUs consumer de 24 GB (RTX 3090, RTX 4090) como mínimo práctico.
- Cabe en GPU consumer: sí, en modelos con 24 GB o más, aunque sin margen amplio para contextos largos o lotes grandes.
- Opciones de despliegue: vLLM con soporte de compressed-tensors (previsto, no validado); transformers como vía de carga directa. No se indica soporte GGUF ni llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lift FP8 Dynamic (este) | 9.409.813.744 | no disponible | openrail | safetensors FP8 | Cuantización no validada en precisión ni vLLM |
| datalab-to/lift | no disponible | no disponible | openrail | safetensors (BF16) | Modelo base original de Datalab |
| Alternativas de extracción documental | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con otros modelos de extracción documental en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Precisión de extracción no validada: el autor no ha verificado la calidad del JSON generado por este checkpoint frente al modelo original.
- Compatibilidad con vLLM no validada: solo se ha comprobado la serialización de dtypes y metadatos de cuantización.
- Sin garantía de equivalencia: no se reclama equivalencia de calidad ni de velocidad respecto a Lift en BF16.
- Sin calibración: la receta FP8_DYNAMIC no usó datos de calibración, lo que puede afectar a la fidelidad en dominios documentales específicos.
- Pérdida de tensores auxiliares: solo se guardan los parámetros cargados por la clase de Transformers; otros tensores del checkpoint fuente no se preservan.
- KV-cache sin cuantizar: el consumo de memoria en contextos largos no se reduce respecto al modelo original.
- Licencia OpenRAIL-M modificada con restricciones de uso; la cuantización no altera los términos del modelo original. Revisar la model card y los ficheros de licencia antes de uso comercial.
- Sesgos, riesgo de alucinación e idiomas: no disponibles en la información proporcionada.
- Repositorio sin descargas ni likes y creado recientemente: no hay evidencia de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hbpkillerX/lift-fp8-dynamic
- Modelo base: https://huggingface.co/datalab-to/lift
- Repositorio de LLM Compressor: no disponible en la información proporcionada
- Paper o blog de Lift: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
