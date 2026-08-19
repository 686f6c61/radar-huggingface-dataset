# AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-8bit

## Resumen

AX-Qwen3.8-27B-MLX-AXQ-8bit es un checkpoint cuantizado en formato MLX del modelo Qwen3.8-27B, desarrollado por AutomatosX mediante la herramienta AXQuant (AXQ). Está diseñado específicamente para ejecutarse en Apple Silicon, aprovechando la memoria unificada de los Mac para cargar un modelo de 27.360 millones de parámetros lógicos con un presupuesto de almacenamiento de 8 bits por peso (BPW medido: 8.0001). El modelo base, Qwen3.8-27B, es un transformer denso con arquitectura Qwen3_5ForConditionalGeneration, que incluye un encoder de visión y soporta un contexto máximo configurado de 262.144 tokens.

La relevancia de este checkpoint radica en que permite ejecutar un modelo de gran tamaño en hardware de consumo (Apple Silicon) con una huella de memoria reducida, manteniendo los tensores críticos en mayor precisión mediante una estrategia de precisión mixta. El paquete se presenta como un artefacto de desarrollo, con certificación Tier 1 de integridad de conversión, pero sin claims de retención de calidad ni de aceleración por MTP (multi-token prediction). No incluye pesos MTP, pero sí un sidecar de visión en BF16 con 460,73 millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (dense) |
| Parametros totales | 27.36B (logicos) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262,144 tokens (maximo configurado) |
| Tipos de cuantizacion | AXQ mixed-precision: 6-bit (65.05%), 8-bit (28.61%), BF16 (6.34%) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX Safetensors (no PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El checkpoint es una conversión cuantizada del modelo base Qwen/Qwen3.8-27B, no un entrenamiento original. El modelo base emplea una arquitectura transformer densa (Qwen3_5ForConditionalGeneration) con un encoder de visión integrado. La cuantización se realiza con AXQuant 1.8.1, que aplica una estrategia de precisión mixta: los tensores de la ruta de lenguaje se cuantizan a 6 y 8 bits, mientras que los tensores protegidos (incluido el tower de visión) se mantienen en BF16. La asignación de precisión se basa en priors de arquitectura, sin calibración con datos reales. El proceso de conversión registró 497/497 conversiones de módulo exitosas, sin fallbacks. No se incluye un sidecar MTP, y el sidecar de visión (333 tensores, 460.73M parámetros, 0.92 GB) se conserva en BF16.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-27B, que incluye razonamiento avanzado, generación de código y matemáticas.
- Soporte de visión: el checkpoint incluye un sidecar de visión en BF16, aunque MLX-LM puede ignorar este sidecar en inferencia estándar; se requiere AX Engine para aprovecharlo plenamente.
- Multilingüismo: no se especifican idiomas soportados en la documentación del checkpoint; se asume que hereda los del modelo base, pero no hay confirmación.
- Tool calling y funciones de agente: no se documentan explícitamente para este checkpoint; el modelo base podría soportarlas, pero no hay garantía en esta conversión.
- Modo de pensamiento (thinking mode): no se menciona en la documentación del checkpoint.

## Casos de uso

- Desarrollo y prototipado en Apple Silicon: permite probar un modelo de 27B en un Mac con memoria unificada de 32 GB o más, usando MLX-LM para generación de texto local sin depender de GPUs NVIDIA.
- Investigación en cuantización: sirve como ejemplo de aplicación de AXQuant con precisión mixta, útil para estudiar el impacto de diferentes presupuestos de bits en modelos grandes.
- Inferencia de visión en entornos Apple: con AX Engine, se puede utilizar el sidecar de visión para tareas de captioning o VQA, aunque requiere verificar la compatibilidad del runtime.
- Evaluación de calidad de cuantización: al ser un checkpoint de desarrollo sin claims de retención de calidad, es adecuado para comparar la salida frente al modelo BF16 original en tareas específicas.
- Despliegue en entornos con restricción de almacenamiento: el tamaño de descarga de 27.38 GB es significativamente menor que los ~55 GB del modelo BF16, facilitando su distribución en entornos con ancho de banda limitado.
- Integración en pipelines de MLX-LM: puede usarse como reemplazo directo del modelo base en scripts existentes que carguen modelos MLX, siempre que no se dependa de funcionalidades MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card indica explícitamente que no hay claims de retención de calidad frente a baselines BF16 o uniformes, y que la certificación Tier 1 solo valida la integridad de conversión, no el rendimiento. Tampoco se proporcionan métricas de latencia o throughput.

## Requisitos de hardware

- El checkpoint está diseñado para Apple Silicon (M1, M2, M3, M4 y superiores) con memoria unificada.
- Tamaño de descarga: 27.38 GB; se recomienda al menos 32 GB de RAM unificada para cargar el modelo en memoria, y 64 GB o más para aprovechar el contexto máximo de 262K tokens.
- No requiere GPU NVIDIA; la inferencia se ejecuta mediante MLX-LM (librería MLX) o AX Engine (runtime propietario de AXQuant).
- Para visión, se necesita AX Engine, ya que MLX-LM puede ignorar el sidecar de visión.
- No se proporcionan datos de latencia o throughput; dependerán del modelo de Mac y de la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| AX-Qwen3.8-27B-MLX-AXQ-8bit (este) | 27.36B | 262K | AXQ 8-bit (mixed) | Apache-2.0 | MLX Safetensors |
| AX-Qwen3.8-27B-MLX-AXQ-6bit | 27.36B | 262K | AXQ 6-bit (mixed) | Apache-2.0 | MLX Safetensors |
| AX-Qwen3.8-27B-MLX-AXQ-4bit | 27.36B | 262K | AXQ 4-bit (mixed) | Apache-2.0 | MLX Safetensors |
| Qwen/Qwen3.8-27B (original) | 27.36B | 262K | BF16 | Apache-2.0 | PyTorch / Safetensors |

La comparativa se limita a los hermanos AXQ del mismo modelo base, ya que no se dispone de datos de otros modelos de 27B cuantizados para Apple Silicon. La diferencia principal entre los packs AXQ es el presupuesto de almacenamiento (BPW) y la distribución de precisión entre tensores; el pack 8bit ofrece mayor precisión media que el 6bit y el 4bit, a costa de un mayor tamaño de descarga.

## Limitaciones y advertencias

- No se publican claims de retención de calidad: la certificación Tier 1 solo valida la integridad de conversión, no el rendimiento del modelo cuantizado frente al original.
- El checkpoint no incluye pesos MTP, por lo que no se puede aprovechar la aceleración por multi-token prediction.
- MLX-LM puede ignorar el sidecar de visión y los metadatos de AXQuant; para funcionalidad completa de visión se requiere AX Engine, cuyo runtime debe verificarse.
- La cuantización se basa en priors de arquitectura sin calibración, lo que puede afectar la precisión en tareas sensibles a ciertos tensores.
- Es un paquete de desarrollo: no se recomienda para producción sin una evaluación exhaustiva de calidad y rendimiento.
- El contexto máximo de 262K tokens es teórico; los límites prácticos dependen de la memoria unificada disponible y pueden ser mucho menores.
- No se especifican los idiomas soportados; se asume herencia del modelo base, pero no hay confirmación en la documentación del checkpoint.

## Enlaces

- [HuggingFace - AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-8bit](https://huggingface.co/AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-8bit)
- [HuggingFace - Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [GitHub - AXQuant (conversión, certificados y tooling)](https://github.com/defai-digital/axquant)
- [Certificado Tier 1 del checkpoint](https://github.com/defai-digital/axquant/blob/main/docs/certifications/qwen38-27b-axq8-tier1.md)
- [HuggingFace - Hermano 4bit](https://huggingface.co/AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-4bit)
- [HuggingFace - Hermano 6bit](https://huggingface.co/AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-6bit)
- [Artículo de Yottalabs sobre Qwen3.8-27B](https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026)
- [Artículo de Swfte sobre Qwen3.8-27B](https://www.swfte.com/blog/qwen-3-8-27b-run-locally-self-host-guide-2026)
