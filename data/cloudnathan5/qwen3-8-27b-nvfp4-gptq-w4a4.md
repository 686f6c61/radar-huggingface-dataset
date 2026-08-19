# cloudnathan5/Qwen3.8-27B-NVFP4-GPTQ-w4a4

## Resumen

El modelo `cloudnathan5/Qwen3.8-27B-NVFP4-GPTQ-w4a4` es una cuantización en formato NVFP4 (W4A4) del modelo base `Qwen/Qwen3.8-27B`, desarrollada por cloudnathan5 mediante la herramienta `llm-compressor`. Esta cuantización reduce el tamaño del checkpoint a la mitad (27.7 GB frente a 55.6 GB en BF16) y está diseñada para ejecutarse en los tensor cores FP4 nativos de las GPUs NVIDIA Blackwell, ofreciendo una ganancia de throughput además de la reducción de memoria. El modelo base es un transformer multimodal (image-text-to-text) con 64 capas, de las cuales 48 utilizan atención lineal tipo Mamba, y presenta una arquitectura MoE con shared expert y multi-token prediction. La longitud de contexto es de 32768 tokens.

Aunque el nombre del modelo sugiere 27B de parámetros, el safetensors contiene 19.135.893.232 parámetros, una discrepancia que conviene tener en cuenta al dimensionar el despliegue. La cuantización se realizó con GPTQ, que utiliza información de segundo orden (Hessiana) para compensar el error de cuantización, y deja ciertos módulos en precisión original para preservar la precisión. El modelo está pensado para inferencia eficiente en producción con vLLM, especialmente en hardware Blackwell.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 64 capas, 48 con atención lineal (tipo Mamba) y 16 con atención tradicional; MoE con shared expert; multimodal (visión y texto) |
| Parametros totales | 19.135.893.232 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 32768 tokens |
| Tipos de cuantizacion | NVFP4 (W4A4) con GPTQ, formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un transformer multimodal con una arquitectura híbrida: 48 de sus 64 capas emplean atención lineal (tipo Mamba), lo que reduce el coste de memoria en decodificación, mientras que las 16 restantes usan atención tradicional. Además, incorpora un mecanismo MoE con shared expert y un head de multi-token prediction (MTP) para acelerar la generación. El modelo acepta entradas de imagen y texto (pipeline image-text-to-text).

La cuantización se realizó con `llm-compressor` utilizando el método NVFP4-GPTQ, que combina el formato de punto flotante de 4 bits de NVIDIA (NVFP4) con la selección de pesos basada en GPTQ. Se calibró sobre 256 muestras del dataset `HuggingFaceH4/ultrachat_200k` a 4096 tokens, aplicando la plantilla de chat. Los módulos `lm_head`, `embed_tokens`, `visual.*`, `linear_attn.*`, `mlp.gate`, `shared_expert_gate` y `mtp.*` se dejaron en su precisión original para evitar pérdidas de precisión en rutas numéricamente frágiles o que no son intensivas en GEMM.

## Capacidades

- Procesamiento multimodal: acepta imágenes y texto, permitiendo tareas de visión-lenguaje como descripción de imágenes o respuesta a preguntas visuales.
- Generación de texto conversacional: al estar basado en Qwen3.8, soporta diálogos multi-turno con contexto largo (hasta 32768 tokens).
- Atención lineal en la mayoría de capas: reduce el coste de memoria en decodificación, permitiendo mayor concurrencia en inferencia.
- Multi-token prediction (MTP): head que predice varios tokens a la vez, potencialmente acelerando la generación.
- MoE con shared expert: eficiencia en el uso de parámetros, aunque no se especifica el número de expertos activos.
- Compatible con vLLM: integración directa para servir el modelo en producción con alto rendimiento.

## Casos de uso

- Despliegue de asistentes conversacionales con contexto largo: el modelo soporta 32768 tokens de contexto, adecuado para chatbots que necesitan mantener historiales extensos. La cuantización reduce la huella de memoria, permitiendo servir el modelo en GPUs con VRAM limitada.
- Aplicaciones de visión-lenguaje: al ser multimodal, puede procesar imágenes y texto para tareas como generación de descripciones, análisis de documentos escaneados o respuesta a preguntas visuales en entornos de producción.
- Inferencia de alto rendimiento en hardware Blackwell: al ejecutarse en tensor cores FP4 nativos, ofrece mayor throughput que una cuantización estándar, ideal para servicios con alta demanda de peticiones.
- Servicios de chat multiusuario: con vLLM y `--max-num-seqs 512`, se puede atender a múltiples usuarios simultáneamente, aprovechando la atención lineal para reducir el coste de caché KV.
- Prototipado rápido en una sola GPU: el checkpoint de 27.7 GB cabe en GPUs con al menos 28 GB de VRAM, permitiendo evaluar el modelo en entornos de desarrollo sin necesidad de clústeres.
- Evaluación de calidad de cuantización: al ser una cuantización con pérdida, se puede usar para medir el impacto en tareas específicas (razonamiento, generación de código, etc.) comparando con el modelo base en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación con lm-evaluation-harness está en progreso y se añadirá cuando esté completa.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 27.7 GB, por lo que se necesitan al menos 28 GB de VRAM solo para los pesos, más la caché KV y los buffers de activación. Con contexto 32768 y `--max-num-seqs 512`, se recomienda una GPU con 40 GB o más.
- GPU recomendada: NVIDIA Blackwell (SM100/SM120) para aprovechar la ruta acelerada con tensor cores FP4. En GPUs anteriores (Ampere, Ada Lovelace), vLLM cae a un camino de dequantize-and-emulate que es funcional pero más lento que BF16.
- Compatibilidad con consumer GPUs: no cabe en GPUs de 24 GB (RTX 4090) debido al tamaño del checkpoint. GPUs con 32 GB (como RTX 5090) podrían cargarlo, pero el rendimiento dependerá de si soportan la ruta FP4 nativa.
- Opciones de despliegue: vLLM es el runtime principal recomendado, con soporte para `compressed-tensors`. También es compatible con la librería `transformers` para carga en Python, aunque el rendimiento óptimo se obtiene con vLLM.
- Latencia y throughput: no disponible. Se espera una mejora de throughput en Blackwell gracias a FP4, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La única comparación posible es con el modelo base `Qwen/Qwen3.8-27B` en BF16, que duplica el tamaño del checkpoint (55.6 GB) y no aprovecha los tensor cores FP4. No hay datos de otros modelos cuantizados similares.

## Limitaciones y advertencias

- Cuantización con pérdida: la precisión puede degradarse respecto al modelo base. Es imprescindible validar
