# AutomatosX/AX-Qwen3.6-27B-MLX-AXQ-6bit

## Resumen

El modelo AX-Qwen3.6-27B-MLX-AXQ-6bit es un checkpoint cuantizado con AXQuant (AXQ) del modelo Qwen3.6-27B, convertido al formato MLX para ejecución en Apple Silicon. Lo desarrolla AutomatosX, con certificación Tier 1 de defai-digital que verifica la integridad de la conversión y el tamaño medido, aunque no certifica aceleración por MTP (multi-token prediction). El objetivo principal es permitir ejecutar un modelo denso de 27.360 millones de parámetros en hardware Apple con memoria unificada limitada, mediante una cuantización mixta de precisión que protege la torre de visión en BF16.

La arquitectura subyacente es Qwen3_5ForConditionalGeneration (densa), con el camino de texto optimizado y una torre de visión separada en BF16. El checkpoint tiene un presupuesto de almacenamiento de 6 bits por peso (BPW total medido de 5.7171), con una distribución que incluye 4-bit, 6-bit, 8-bit y BF16. Está diseñado para usarse con MLX-LM o AX Engine, y se distribuye bajo licencia Apache 2.0. Es una versión de desarrollo: no se publican métricas de retención de calidad ni claims de velocidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (densa), texto optimizado |
| Parametros totales | 27.360 millones (lógicos) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (configurado; límite práctico según memoria unificada) |
| Tipos de cuantizacion | Mixta AXQuant: 4-bit, 6-bit, 8-bit y BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

Nota: el repositorio reporta en HuggingFace 5.950.882.304 parámetros en el safetensors, lo que no coincide con los 27.360 millones lógicos declarados en la model card. Este dato parece un error de metadatos; se toma como referencia la model card.

## Arquitectura y entrenamiento

El modelo es una conversión cuantizada del Qwen3.6-27B original, sin entrenamiento adicional. La arquitectura es densa (Qwen3_5ForConditionalGeneration) con el camino de texto optimizado y una torre de visión separada. La cuantización se realiza con AXQuant 1.5.1, que aplica una precisión mixta: el 74.79% de los pesos principales (20.78B) se almacenan en 4-bit, el 11.52% (3.20B) en 6-bit, el 4.58% (1.27B) en 8-bit y el 9.11% (2.53B) en BF16. Los grupos de cuantización usan tamaño 64 y los métodos son `affine`, `bf16` y `dwq`. La torre de visión se conserva íntegramente en BF16 como sidecar (333 tensores, 460.73M parámetros, 0.92 GB). No se incluye sidecar MTP, por lo que no hay predicción multi-token.

## Capacidades

- Generación de texto: pipeline `text-generation` con soporte para conversación.
- Visión: incluye torre de visión en BF16, aunque la calidad no está certificada.
- Uso en Apple Silicon: formato MLX nativo, compatible con MLX-LM y AX Engine.
- Cuantización mixta: permite ejecutar un modelo de 27B en memoria unificada reducida.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Inferencia local en Mac: ejecutar el modelo en portátiles o estaciones Apple Silicon con MLX-LM, aprovechando la cuantización para reducir el uso de memoria unificada.
- Prototipado y desarrollo: ideal para probar el comportamiento del Qwen3.6-27B en entornos de desarrollo sin necesidad de GPUs dedicadas, gracias a la integración con el ecosistema MLX.
- Aplicaciones de chat y generación de texto: uso en aplicaciones conversacionales locales donde se requiera privacidad y control de datos.
- Procesamiento de imágenes con texto: la torre de visión en BF16 permite experimentar con tareas de visión-lenguaje, aunque no hay garantía de calidad.
- Investigación en cuantización: el checkpoint sirve como referencia para estudiar el impacto de la cuantización mixta AXQ en modelos densos grandes.
- Despliegue en servidores Apple Silicon: en infraestructura con chips M-series, se puede servir con AX Engine mediante `ax-engine serve`, aunque es una versión de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay claims de retención de calidad frente a BF16 o baselines uniformes, y que la aceleración MTP no está certificada.

## Requisitos de hardware

- Memoria unificada: los pesos ocupan 19.85 GB (safetensors) más el sidecar de visión (0.92 GB), total aproximado 19.88 GB. Se recomienda al menos 32 GB de memoria unificada para dejar margen a activaciones y overhead del runtime.
- GPU: integrada en Apple Silicon (M1, M2, M3, M4 y sucesores). No es compatible con GPUs NVIDIA/AMD tradicionales.
- Opciones de despliegue: MLX-LM para inferencia de texto; AX Engine para servir el directorio local con soporte nativo del manifiesto AXQ.
- Latencia y throughput: no se proporcionan datos medidos. El rendimiento dependerá del chip concreto y de la memoria disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| AX-Qwen3.6-27B-MLX-AXQ-6bit (este) | 27.36B | 262.144 | Mixta 4/6/8/BF16 | Apache 2.0 | MLX safetensors |
| Qwen/Qwen3.6-27B (base) | 27.36B | 262.144 (presumible) | BF16 | Apache 2.0 | PyTorch / otros |
| AX-Qwen3.6-27B-MLX-AXQ-4bit (hermano) | 27.36B | 262.144 (presumible) | Mixta 4-bit (BPW menor) | Apache 2.0 | MLX safetensors |

No se dispone de datos de rendimiento comparativos. La comparación se limita a especificaciones y disponibilidad.

## Limitaciones y advertencias

- Versión de desarrollo: no se publican resultados de calidad ni retención frente al modelo original; no es apta para producción sin validación propia.
- MTP no certificado: no hay aceleración por predicción multi-token; el checkpoint no incluye pesos MTP.
- Visión no certificada: la torre de visión está presente en BF16, pero no se garantiza su calidad.
- Requisitos de memoria: aunque la cuantización reduce el tamaño, sigue necesitando al menos 20 GB de memoria unificada, lo que excluye Macs con menos de 32 GB.
- Incompatibilidad con hardware no Apple: el formato MLX solo funciona en Apple Silicon.
- Posible error en metadatos: el número de parámetros reportado por HuggingFace (5.95B) no coincide con los 27.36B lógicos; verificar antes de usar.
- Sin soporte de audio: el modelo no incluye capacidades de audio.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/AutomatosX/AX-Qwen3.6-27B-MLX-AXQ-6bit)
- [Modelo base Qwen/Qwen3.6-27B](https://huggingface.co/Qwen/Qwen3.6-27B)
- [Certificado Tier 1](https://github.com/defai-digital/axquant/blob/main/docs/certifications/qwen36-27b-axq6-nomtp-tier1.md)
- [Repositorio AXQuant](https://github.com/defai-digital/axquant)
- [Colección AutomatosX](https://huggingface.co/AutomatosX/collections)
