# mradermacher/atlasv23-sft-qwen3-8-27b-merged-GGUF

## Resumen

El modelo `mradermacher/atlasv23-sft-qwen3-8-27b-merged-GGUF` es una cuantización en formato GGUF del modelo `senaro/atlasv23-sft-qwen3-8-27b-merged`, un fine-tuning (SFT) del modelo Qwen3.8-27B. El autor, mradermacher, es conocido por publicar cuantizaciones estáticas de modelos open source para su uso en entornos con recursos limitados. Este repositorio contiene únicamente los pesos cuantizados, sin información adicional sobre el proceso de entrenamiento o las capacidades específicas del fine-tuning.

El modelo base Qwen3.8-27B, según la documentación disponible, es un modelo de 27 mil millones de parámetros con una ventana de contexto de 256K tokens, capacidades de visión y razonamiento, y está diseñado para tareas de agente, codificación y chat. Sin embargo, al tratarse de un fine-tuning, las características exactas del modelo resultante no están documentadas en la información proporcionada. La relevancia de esta ficha radica en que permite a desarrolladores evaluar rápidamente si esta variante cuantizada es adecuada para sus casos de uso, aunque la falta de datos oficiales limita el análisis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.8-27B, no confirmada para el fine-tuning) |
| Parametros totales | 27 mil millones (estimado, según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 256K tokens (según documentación de Qwen3.8-27B, no confirmada para este fine-tuning) |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS (según comentarios en la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura específica del modelo `atlasv23-sft-qwen3-8-27b-merged`. El nombre sugiere que se trata de un merge de pesos tras un fine-tuning supervisado (SFT) sobre el modelo Qwen3.8-27B. El modelo base Qwen3.8-27B, según la documentación de Qwen, utiliza una arquitectura transformer con atención estándar, soporte de visión y razonamiento, y una ventana de contexto de 256K tokens. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO. La cuantización GGUF fue realizada por mradermacher mediante conversión estática, sin modificaciones adicionales al modelo.

## Capacidades

- Generación de texto y chat: el modelo base Qwen3.8-27B es capaz de mantener conversaciones multi-turno, aunque no se ha verificado si el fine-tuning conserva esta capacidad.
- Razonamiento y resolución de problemas: el modelo base incluye capacidades de razonamiento, pero no hay evidencia específica para esta variante.
- Generación de código: Qwen3.8-27B está optimizado para tareas de codificación, pero no se confirma para el fine-tuning.
- Visión: el modelo base soporta entrada de imágenes, pero no se indica si el fine-tuning mantiene esta funcionalidad (los GGUF suelen omitir el proyector de visión).
- Tool calling y agentes: el modelo base está diseñado para tareas de agente, pero no hay confirmación para esta variante.
- Multilingüismo: no disponible.

## Casos de uso

- Despliegue local en hardware limitado: gracias a las cuantizaciones GGUF (desde Q2_K hasta Q8_0), el modelo puede ejecutarse en equipos con poca VRAM, por ejemplo en portátiles con 8-16 GB de RAM/VRAM, usando llama.cpp u Ollama.
- Prototipado rápido de aplicaciones de chat: al ser un modelo de 27B cuantizado, permite probar interacciones conversacionales sin necesidad de infraestructura cloud.
- Evaluación de fine-tunings comunitarios: los desarrolladores pueden comparar el comportamiento de este SFT frente al modelo base Qwen3.8-27B en tareas específicas, aunque no se conocen los datos de entrenamiento.
- Integración en pipelines de generación de texto con contexto largo: si el fine-tuning conserva la ventana de 256K, podría usarse para resumir documentos extensos o mantener conversaciones largas.
- Experimentación con cuantizaciones mixtas: al disponer de múltiples niveles de cuantización, se puede ajustar el equilibrio entre calidad y consumo de memoria.
- Uso educativo: para estudiar el impacto del fine-tuning y la cuantización en el rendimiento de modelos grandes, aunque sin benchmarks oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este modelo específico. Tampoco se han encontrado comparativas con el modelo base o con otros fine-tunings.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Para Q4_K_M (común), un modelo de 27B requiere aproximadamente 16-18 GB de VRAM. Para Q2_K, alrededor de 10-12 GB. Para Q8_0, unos 28-30 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M, A100 40 GB para Q8_0, o GPUs con 16 GB para cuantizaciones más agresivas.
- En consumer GPU: sí, con cuantizaciones Q4_K_M o inferiores en GPUs de 16-24 GB (RTX 4080, 4090, etc.).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF limitado), TGI (con conversión previa).
- Latencia y throughput: no disponible, depende del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| atlasv23-sft-qwen3-8-27b-merged (GGUF) | 27B (estimado) | 256K (base) | no disponible | GGUF | Fine-tuning desconocido |
| Qwen3.8-27B (base) | 27B | 256K | Apache 2.0 (según Qwen) | safetensors, GGUF | Modelo oficial con documentación completa |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 license | safetensors, GGUF | Alternativa más pequeña, menos capacidad |
| Mistral Small 24B | 24B | 32K | Apache 2.0 | safetensors, GGUF | Menor contexto, pero con licencia abierta |

La comparativa se basa en el modelo base Qwen3.8-27B, ya que no hay datos específicos del fine-tuning. La principal diferencia es la falta de documentación y licencia clara para esta variante.

## Limitaciones y advertencias

- No se dispone de información sobre la licencia del modelo. El uso comercial podría estar restringido, por lo que se recomienda contactar al autor antes de utilizarlo en producción.
- No hay datos sobre el proceso de fine-tuning, el dataset utilizado ni las técnicas de alineación. Esto implica un riesgo desconocido de sesgos o comportamientos indeseados.
- La cuantización GGUF puede degradar la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generación de código.
- No se confirma si el modelo conserva las capacidades de visión del modelo base, ya que los GGUF suelen omitir el proyector de visión.
- La ventana de contexto de 256K es teórica; en la práctica, el rendimiento puede degradarse con contextos muy largos y el consumo de memoria aumenta significativamente.
- Al ser un modelo de 27B, requiere hardware con al menos 16 GB de VRAM para un uso fluido, incluso con cuantizaciones bajas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/atlasv23-sft-qwen3-8-27b-merged-GGUF
- Modelo original (senaro/atlasv23-sft-qwen3-8-27b-merged): https://huggingface.co/senaro/atlasv23-sft-qwen3-8-27b-merged
- Documentación de Qwen3.8 (OpenLM.ai): https://openlm.ai/qwen3.8/
- Guía de ejecución local de Qwen3.8 (Unsloth): https://unsloth.ai/docs/models/qwen3.8
- Blog de AMD sobre Qwen3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
