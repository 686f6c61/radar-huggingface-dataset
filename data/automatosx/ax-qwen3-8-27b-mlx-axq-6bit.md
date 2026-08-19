# AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-6bit

## Resumen

AX-Qwen3.8-27B-MLX-AXQ-6bit es un checkpoint de cuantización mixta de precisión (AXQuant, AXQ) del modelo Qwen3.8-27B, desarrollado por AutomatosX para ejecución nativa en Apple Silicon mediante el ecosistema MLX. El modelo base, Qwen/Qwen3.8-27B, es una arquitectura densa de 27.36B parámetros lógicos con capacidades multimodales (texto y visión) y una ventana de contexto máxima de 262,144 tokens. Este checkpoint reduce el peso de almacenamiento a aproximadamente 20.5 GB aplicando una estrategia de precisión mixta: la mayor parte de los tensores del camino de lenguaje se cuantizan a 4-bit, mientras que la torre de visión se conserva íntegramente en BF16.

La relevancia de este modelo radica en que permite ejecutar un LLM de 27B con visión en hardware de Apple (Macs con chip M-series) con un uso de memoria unificado razonable, sin necesidad de GPUs dedicadas. Al estar basado en Qwen3.8, hereda las capacidades conversacionales y de razonamiento del modelo original, aunque la cuantización puede introducir cierta degradación de calidad. El proyecto incluye un certificado "Checkpoint Tier 1" que valida la integridad de la conversión y el tamaño medido, pero no certifica aceleración por MTP (Multi-Token Prediction) ni publica métricas de calidad frente al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (densa) con torre de visión |
| Parametros totales | 27.36B (lógicos) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262,144 tokens (máximo configurado; límites prácticos dependen de la memoria unificada) |
| Tipos de cuantizacion | Mixta AXQ: 4-bit, 6-bit, 8-bit y BF16 (distribución: 79.69% 4-bit, 9.32% 6-bit, 4.65% 8-bit, 6.34% BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX Safetensors (no incluye PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El modelo es una conversión cuantizada del checkpoint original Qwen/Qwen3.8-27B, que emplea una arquitectura transformer densa (Qwen3_5ForConditionalGeneration) con un componente de visión adicional. La cuantización se realiza con AXQuant versión 1.6.2, que asigna diferentes precisiones a distintos tensores según un plan basado en prioris de arquitectura (no se utiliza calibración con datos). El camino de lenguaje se optimiza con una mezcla de 4-bit, 6-bit, 8-bit y BF16, mientras que la torre de visión (333 tensores, 460.73M parámetros) se mantiene íntegramente en BF16 como sidecar protegido. No se incluye un sidecar MTP (Multi-Token Prediction), por lo que no hay aceleración por predicción múltiple de tokens.

No se ha publicado información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO). Este checkpoint es únicamente una conversión de pesos, sin fine-tuning adicional. La conversión se registró con MLX 0.32.0 y MLX-LM 0.31.3, y el runtime AX Engine 6.16.1 es la autoridad para el contrato de ejecución AXQ.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.8.
- Procesamiento de visión: el checkpoint incluye una torre de visión en BF16, lo que permite entrada de imágenes junto con texto (aunque la calidad de visión no ha sido evaluada públicamente).
- Ventana de contexto larga: hasta 262,144 tokens configurados, útil para documentos extensos o conversaciones prolongadas (sujeto a límites de memoria unificada).
- Ejecución nativa en Apple Silicon mediante MLX-LM o AX Engine, sin necesidad de GPUs dedicadas.
- Compatibilidad con el ecosistema MLX: integración con `mlx_lm.generate` para inferencia de texto estándar.
- Soporte de cuantización mixta: el checkpoint aprovecha la precisión selectiva para equilibrar tamaño y calidad, aunque no se han publicado métricas de retención de calidad.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede ejecutarse en un MacBook Pro con chip M3 (certificado Tier 1 en ese hardware) para proporcionar respuestas de texto en tiempo real sin conexión a internet, gracias a su tamaño reducido y a la integración con MLX-LM.
- Análisis de documentos con imágenes: al incluir torre de visión, puede procesar capturas de pantalla, diagramas o fotografías junto con texto, por ejemplo para extraer información de facturas o informes escaneados (siempre que la calidad de visión sea suficiente, lo cual no está verificado).
- Prototipado de aplicaciones de IA en entornos Apple: desarrolladores que trabajan con Swift o Python pueden integrar el modelo en apps de escritorio o móviles usando MLX, evitando la dependencia de servicios en la nube.
- Generación de contenido con contexto largo: su ventana de 262K tokens permite resumir o analizar libros completos, logs de sistemas o transcripciones largas en una sola pasada, siempre que la memoria unificada del equipo lo permita.
- Investigación en cuantización: el checkpoint sirve como caso de estudio para evaluar el impacto de la precisión mixta AXQ en modelos multimodales, comparando con el modelo base o con el hermano de 4-bit.
- Despliegue en servidores Apple Silicon: en entornos con clústeres de Mac mini o Mac Studio, se puede servir el modelo mediante AX Engine para aplicaciones de inferencia interna con control total de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay claims de retención de calidad frente al modelo BF16 o uniforme, y que la aceleración MTP no está certificada. Tampoco se proporcionan métricas de latencia o throughput.

## Requisitos de hardware

- El modelo está diseñado para Apple Silicon (chips M-series). El certificado Tier 1 se emitió en un MacBook Pro con chip M3.
- Requiere al menos 20.54 GB de espacio en disco para la descarga completa (20.52 GB de pesos safetensors más overhead).
- Para inferencia, se necesita memoria unificada suficiente para cargar los pesos (aprox. 20.5 GB) más el contexto y las activaciones. Con 32 GB de RAM unificado se podría operar con contextos moderados; para contextos cercanos a 262K tokens se requerirían 64 GB o más.
- No se requiere GPU dedicada; la ejecución usa la GPU integrada y la memoria unificada del chip Apple.
- Opciones de despliegue: MLX-LM para inferencia de texto estándar, o AX Engine para el contrato completo de runtime AXQ (incluyendo manifiesto nativo).
- No se han publicado datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Qwen3.8-27B-MLX-AXQ-6bit (este) | 27.36B | 262,144 | Mixta AXQ 4/6/8/BF16 | Apache-2.0 | MLX Safetensors |
| AX-Qwen3.8-27B-MLX-AXQ-4bit (hermano) | 27.36B | 262,144 | Mixta AXQ (menor presupuesto) | Apache-2.0 | MLX Safetensors |
| Qwen/Qwen3.8-27B (original) | 27.36B | 262,144 | BF16 | Apache-2.0 | PyTorch / Safetensors |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos comparables en el contexto de cuantización MLX para Apple Silicon. El hermano de 4-bit ofrece menor tamaño a costa de menor precisión media; el original BF16 es el punto de referencia de calidad pero requiere mucho más almacenamiento y memoria.

## Limitaciones y advertencias

- No se han publicado evaluaciones de calidad frente al modelo original o a cuantizaciones uniformes; la degradación por cuantización es posible y no está cuantificada.
- La aceleración MTP no está presente ni certificada; el checkpoint no incluye pesos MTP y no se puede esperar speedup por predicción múltiple de tokens.
- La compatibilidad con MLX-LM estándar puede ignorar metadatos de runtime AXQ y sidecars de visión; la ejecución de visión de alta calidad no está garantizada con MLX-LM, solo con AX Engine.
- El modelo es un "development package" (etiqueta `development`); no se recomienda para producción sin validación adicional.
- La torre de visión se conserva en BF16, lo que aumenta el tamaño total; si se elimina el sidecar, se pierde la capacidad multimodal.
- No se especifican idiomas soportados; se asume que hereda los del modelo base Qwen3.8, pero no está documentado en este checkpoint.
- El uso comercial está permitido por la licencia Apache-2.0, pero la ausencia de benchmarks de calidad puede suponer un riesgo para aplicaciones críticas.

## Enlaces

- [Checkpoint en HuggingFace](https://huggingface.co/AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-6bit)
- [Hermano 4-bit](https://huggingface.co/AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-4bit)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Certificado Tier 1](https://github.com/defai-digital/axquant/blob/main/docs/certifications/qwen38-27b-axq6-tier1.md)
- [Repositorio AX Engine](https://github.com/defai-digital/ax-engine)
- [Catálogo de modelos MLX de AutomatosX](https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog)
