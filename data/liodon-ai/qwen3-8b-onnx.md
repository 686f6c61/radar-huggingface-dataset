# liodon-ai/Qwen3-8B-ONNX

## Resumen

El modelo `liodon-ai/Qwen3-8B-ONNX` es una exportación al formato ONNX del modelo Qwen3-8B, publicada por Liodon AI. Se trata de una conversión realizada con la librería `optimum` de Hugging Face, utilizando la tarea `text-generation-with-past`, lo que significa que el grafo expone entradas y salidas de past-key-values para permitir decodificación autorregresiva con caché de KV. El repositorio incluye dos versiones del modelo: una en precisión FP32 (32,76 GB) y otra en FP16 (17,59 GB), ambas en formato ONNX.

Esta conversión está pensada para facilitar el despliegue del modelo en entornos que soporten ONNX Runtime, como aplicaciones de inferencia en CPU o GPU, o en plataformas embebidas y móviles que requieran interoperabilidad entre frameworks. Al ser una exportación directa del modelo original, hereda las capacidades lingüísticas y de razonamiento de Qwen3-8B, aunque no se proporcionan detalles adicionales sobre el proceso de cuantización ni sobre optimizaciones específicas más allá de la conversión de formato.

La relevancia de este modelo radica en su utilidad para desarrolladores que necesitan integrar un LLM de 8 mil millones de parámetros en pipelines que ya utilizan ONNX Runtime, evitando la dependencia de PyTorch o TensorFlow. Sin embargo, la información disponible es limitada: no se especifican detalles de arquitectura, datos de entrenamiento, benchmarks ni licencia concreta (solo se indica "other").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer, similar a Qwen3-8B, pero no confirmado) |
| Parametros totales | 8 mil millones (según el nombre del modelo, no confirmado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 y FP16 (archivos `model.onnx` y `model_fp16.onnx`); se menciona `model_quantized.onnx` en el ejemplo de código, pero no aparece en la tabla de archivos |
| Idiomas soportados | no disponibles |
| Licencia | other (no especificada) |
| Formato de pesos | ONNX (safetensors no aplica) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en esta exportación. Dado que se basa en Qwen3-8B, se espera que sea un transformer denso con mecanismos de atención estándar, pero no se confirma en la documentación proporcionada. El proceso de exportación se realizó con `optimum.exporters.onnx.main_export` y la tarea `text-generation-with-past`, lo que implica que el grafo incluye entradas y salidas para la caché de KV, permitiendo una decodificación eficiente sin recalcular estados anteriores.

No se proporcionan datos sobre el entrenamiento original del modelo base, como el número de tokens, la composición del dataset o si se aplicaron técnicas de RLHF o DPO. Tampoco se mencionan innovaciones técnicas específicas en la exportación, más allá de la conversión de formato y la inclusión de la caché de KV.

## Capacidades

- Generación de texto: al ser una exportación de Qwen3-8B, se espera que herede las capacidades de generación de lenguaje natural, aunque no se documentan explícitamente en esta ficha.
- Razonamiento y comprensión: el modelo base es conocido por su rendimiento en tareas de razonamiento, codificación y matemáticas, pero no se aportan datos concretos en esta exportación.
- Soporte de tool calling y agentes: no se menciona en la documentación; se desconoce si la exportación conserva estas funcionalidades.
- Capacidades multilingües: no se especifican los idiomas soportados.
- Integración con ONNX Runtime: el modelo está diseñado para ejecutarse con `onnxruntime`, lo que permite su uso en aplicaciones que requieren inferencia en CPU o GPU sin depender de frameworks de deep learning completos.

## Casos de uso

- Despliegue en entornos de producción con ONNX Runtime: el modelo puede integrarse en servicios de inferencia que ya utilizan ONNX Runtime, reduciendo la dependencia de PyTorch y simplificando el empaquetado y la gestión de dependencias.
- Inferencia en CPU para entornos con recursos limitados: la versión FP32 puede ejecutarse en CPU, aunque con mayor latencia; la versión FP16 es más adecuada para GPUs con soporte de media precisión.
- Prototipado rápido en aplicaciones de chat o asistentes conversacionales: al ser un modelo de 8B, ofrece un equilibrio entre calidad y requisitos de hardware, permitiendo su uso en servidores con una sola GPU de gama alta.
- Integración en pipelines de procesamiento de lenguaje natural existentes: al estar en formato ONNX, puede combinarse con otros modelos ONNX en un mismo grafo o pipeline, facilitando la composición de sistemas complejos.
- Evaluación de la viabilidad de Qwen3-8B en plataformas embebidas o móviles: aunque el tamaño es considerable, la disponibilidad de versiones FP16 y la compatibilidad con ONNX Runtime permiten probar su rendimiento en dispositivos con aceleración por hardware.
- Migración de modelos PyTorch a ONNX para entornos de producción con restricciones de licencia o de infraestructura: la exportación permite desplegar el modelo en plataformas que solo aceptan ONNX, como algunos servicios en la nube o dispositivos edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para esta exportación. Se recomienda consultar la documentación del modelo base Qwen3-8B para obtener referencias de rendimiento, aunque no se garantiza que la conversión a ONNX mantenga exactamente los mismos resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: para la versión FP16, se necesitan al menos 18 GB de VRAM (el archivo pesa 17,59 GB); para FP32, al menos 33 GB (archivo de 32,76 GB). Estos valores no incluyen memoria adicional para activaciones y caché de KV, por lo que se recomienda un margen superior.
- GPU recomendadas: para FP16, una GPU con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) es suficiente; para FP32, se requiere una GPU con 40 GB o más (A100 40GB, A100 80GB, H100).
- En consumer GPU: la versión FP16 puede caber en una RTX 4090 (24 GB) con margen limitado; la versión FP32 no es viable en GPUs de consumo típicas.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), con soporte para `ORTModelForCausalLM` de `optimum.onnxruntime`. También puede utilizarse con otros runtime compatibles con ONNX, como TensorRT (si se convierte previamente) o Windows ML.
- Latencia y throughput: no se proporcionan datos. Dependerán del hardware, la longitud de la secuencia y el tamaño del lote. En una GPU A100, se espera una latencia de decodificación de decenas de milisegundos por token, pero no se confirma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B (original) | 8B | no disponible | PyTorch, safetensors | Apache 2.0 (según documentación oficial) | Hugging Face |
| liodon-ai/Qwen3-8B-ONNX | 8B | no disponible | ONNX (FP32/FP16) | other | Hugging Face |
| Qwen3-8B (Qualcomm AI Hub) | 8B | no disponible | ONNX (optimizado para dispositivos Qualcomm) | no disponible | Qualcomm AI Hub |

La comparativa se limita a variantes del mismo modelo base. No se dispone de datos de rendimiento para establecer una comparación cuantitativa. La principal diferencia entre la exportación de Liodon AI y la de Qualcomm es que esta última está optimizada para hardware específico, mientras que la primera es una conversión genérica con `optimum`.

## Limitaciones y advertencias

- La licencia se indica como "other", lo que implica que no se especifican los términos de uso. Se recomienda contactar con el autor o consultar la licencia del modelo base Qwen3-8B antes de utilizarlo en producción.
- No se proporcionan detalles sobre el proceso de cuantización más allá de FP32 y FP16. El ejemplo de código menciona `model_quantized.onnx`, pero este archivo no aparece en la tabla de archivos del repositorio, por lo que su existencia no está confirmada.
- Al ser una exportación directa, es posible que no se hayan aplicado optimizaciones específicas para ONNX Runtime, como fusión de operadores o cuantización int8, lo que podría afectar al rendimiento en comparación con versiones optimizadas.
- No se documentan los idiomas soportados ni las capacidades multilingües del modelo. Se asume que hereda las del modelo base, pero no se garantiza.
- El tamaño del repositorio (50,4 GB) implica que la descarga y el almacenamiento requieren un ancho de banda y espacio en disco considerables.
- No se han publicado benchmarks para esta exportación, por lo que no se puede verificar si el rendimiento es idéntico al del modelo original en PyTorch.

## Enlaces

- [Hugging Face: liodon-ai/Qwen3-8B-ONNX](https://huggingface.co/liodon-ai/Qwen3-8B-ONNX)
- [Modelo base: Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
- [Documentación de optimum](https://github.com/huggingface/optimum)
- [Qwen3-8B en Qualcomm AI Hub](https://aihub.qualcomm.com/compute/models/qwen3_8b)
