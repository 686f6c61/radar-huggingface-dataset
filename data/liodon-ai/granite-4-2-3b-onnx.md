# liodon-ai/granite-4.2-3b-ONNX

## Resumen

El modelo `liodon-ai/granite-4.2-3b-ONNX` es una exportación al formato ONNX del modelo de lenguaje `ibm-granite/granite-4.2-3b`, realizado por Liodon AI mediante la librería `optimum`. Esta conversión permite ejecutar el modelo con ONNX Runtime, tanto en CPU como en GPU, manteniendo las capacidades del modelo original de IBM Granite 4.2, una familia de modelos densos decoder-only diseñados para razonamiento, generación de texto y tool calling. El repositorio incluye dos variantes de pesos: FP32 (14,64 GB) y FP16 (7,85 GB), además de una posible versión cuantizada adicional referenciada en el código de ejemplo aunque no documentada en la tabla de archivos.

La relevancia de este modelo radica en su formato ONNX, que facilita el despliegue en entornos de producción que requieren interoperabilidad entre frameworks, inferencia de baja latencia con ONNX Runtime y soporte para KV-cache en decodificación autoregresiva. Al estar basado en Granite 4.2, hereda características como razonamiento con chain-of-thought y tool calling mejorado, lo que lo hace adecuado para aplicaciones empresariales de IA conversacional y agentes.

Sin embargo, la información pública es limitada: no se especifican la longitud de contexto, los idiomas soportados ni los detalles de licencia más allá de "other". Tampoco se han publicado benchmarks en la model card ni en los resultados de búsqueda, por lo que cualquier evaluación de rendimiento debe basarse en los datos del modelo original de IBM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso |
| Parametros totales | 3 mil millones (3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP32, FP16 (y posible cuantización adicional no especificada) |
| Idiomas soportados | No disponible |
| Licencia | Other (no especificada) |
| Formato de pesos | ONNX (model.onnx, model_fp16.onnx) |

## Arquitectura y entrenamiento

El modelo base `ibm-granite/granite-4.2-3b` pertenece a la familia Granite 4.2 de IBM, caracterizada por arquitecturas densas decoder-only en tres tamaños (3B, 8B y 30B). Según la documentación oficial, estos modelos son post-entrenados sobre los modelos base Granite 4.1, e incorporan capacidades de razonamiento con chain-of-thought integrado, modos de pensamiento flexibles y tool calling aumentado con razonamiento.

La exportación a ONNX se realizó con `optimum.exporters.onnx.main_export` usando la tarea `text-generation-with-past`. Esto significa que el grafo computacional expone entradas y salidas de past-key-values para permitir decodificación autoregresiva con caché de KV, lo que reduce la redundancia de cálculo en generaciones multi-turno. El repositorio incluye dos archivos: `model.onnx` en FP32 (14,64 GB) y `model_fp16.onnx` en FP16 (7,85 GB). En el ejemplo de código se referencia un archivo `model_quantized.onnx`, pero no aparece en la tabla de archivos, por lo que su existencia y tipo de cuantización no están confirmados.

No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. Toda la información sobre el entrenamiento proviene de la documentación de la familia Granite 4.2.

## Capacidades

- Generación de texto y conversación multi-turno, gracias a la arquitectura decoder-only y al soporte de KV-cache en el grafo ONNX.
- Razonamiento con chain-of-thought integrado, heredado del modelo base Granite 4.2.
- Tool calling aumentado con razonamiento, permitiendo al modelo seleccionar y usar herramientas externas en tareas de agente.
- Modos de pensamiento flexibles (thinking modes) que permiten ajustar el nivel de razonamiento según la tarea.
- Inferencia con ONNX Runtime en CPU y GPU, lo que facilita la integración en entornos heterogéneos.
- Compatibilidad con el wrapper `ORTModelForCausalLM` de `optimum.onnxruntime`, que gestiona automáticamente el bookkeeping de la KV-cache.

## Casos de uso

- Despliegue de asistentes conversacionales en entornos corporativos con infraestructura basada en ONNX Runtime, aprovechando la inferencia en CPU sin necesidad de GPU dedicada.
- Integración en pipelines de generación de texto en aplicaciones .NET o Python que ya usan ONNX para otros modelos, unificando el stack de inferencia.
- Implementación de agentes con tool calling en sistemas de automatización, donde el modelo puede razonar sobre qué herramienta invocar y con qué argumentos.
- Generación de respuestas con razonamiento explícito en aplicaciones de soporte técnico o atención al cliente, usando el modo chain-of-thought para explicar el proceso de decisión.
- Prototipado rápido de soluciones de IA generativa en entornos con restricciones de hardware, gracias a la opción FP16 que reduce los requisitos de VRAM.
- Evaluación de la calidad del modelo Granite 4.2 en tareas específicas mediante la versión ONNX, sin necesidad de instalar el stack completo de Hugging Face Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, y los resultados de búsqueda web tampoco proporcionan datos de rendimiento. Para conocer el rendimiento del modelo base, se recomienda consultar la documentación oficial de IBM Granite 4.2, pero no se dispone de cifras verificadas en esta ficha.

## Requisitos de hardware

- El archivo FP32 (`model.onnx`, 14,64 GB) requiere aproximadamente 15 GB de VRAM para inferencia en GPU, o al menos 16 GB de RAM si se ejecuta en CPU.
- El archivo FP16 (`model_fp16.onnx`, 7,85 GB) necesita unos 8 GB de VRAM, siendo viable en GPUs de consumo como RTX 3060 (12 GB) o RTX 4070 (12 GB).
- El archivo `model_quantized.onnx` referenciado en el ejemplo podría requerir menos memoria, pero al no estar documentado su tamaño ni tipo de cuantización, no se puede estimar.
- Para despliegue en producción se recomienda usar ONNX Runtime con ejecutores CUDA para GPU (si se dispone de NVIDIA) o el ejecutor CPU para entornos sin aceleración.
- Opciones de despliegue: ONNX Runtime (Python, C#, C++), `optimum.onnxruntime` para integración con Transformers, y cualquier framework que soporte ONNX.
- La latencia y el throughput dependen del hardware y del tamaño del lote; no se han publicado cifras específicas para esta exportación.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de 3B de la misma categoría, ya que la información proporcionada no incluye benchmarks ni especificaciones detalladas del modelo base. Sin embargo, se puede contextualizar cualitativamente:

| Modelo | Parametros | Arquitectura | Contexto | Licencia |
|---|---|---|---|---|
| liodon-ai/granite-4.2-3b-ONNX | 3B | Denso decoder-only | No disponible | Other |
| ibm-granite/granite-4.2-3b | 3B | Denso decoder-only | No disponible | Apache 2.0 (según documentación de IBM) |
| Llama-3.2-3B | 3B | Denso decoder-only | 128K | Llama 3.2 Community License |
| Qwen2.5-3B | 3B | Denso decoder-only | 32K | Apache 2.0 |

Nota: los datos de contexto y licencia de los modelos comparados provienen de conocimiento general, no de la información proporcionada en la búsqueda. La licencia "other" de este modelo ONNX puede diferir de la del modelo base, por lo que se debe verificar antes de uso comercial.

## Limitaciones y advertencias

- La licencia "other" no especifica los términos exactos; podría tener restricciones para uso comercial o requerir atribución adicional. Se debe contactar con el autor o consultar la documentación de IBM Granite para aclarar los términos.
- No se ha documentado la longitud de contexto soportada, lo que dificulta planificar tareas que requieran ventanas largas.
- Los idiomas soportados no están indicados; aunque Granite 4.2 es multilingüe en su versión original, esta exportación no confirma qué idiomas están cubiertos.
- No se han publicado benchmarks, por lo que no se puede evaluar el rendimiento relativo frente a otros modelos de 3B.
- El archivo `model_quantized.onnx` mencionado en el ejemplo no está documentado en la tabla de archivos; su existencia y calidad de cuantización son inciertas.
- Al tratarse de una exportación ONNX, algunas características específicas del framework original (como sampling avanzado) pueden requerir implementación manual en el código de inferencia.
- La fecha de creación (2026) sugiere que el modelo es reciente, pero no hay evidencia de pruebas exhaustivas en producción.

## Enlaces

- [HuggingFace - liodon-ai/granite-4.2-3b-ONNX](https://huggingface.co/liodon-ai/granite-4.2-3b-ONNX)
- [HuggingFace - ibm-granite/granite-4.2-3b (modelo base)](https://huggingface.co/ibm-granite/granite-4.2-3b)
- [GitHub - ibm-granite/granite-4.2-language-models](https://github.com/ibm-granite/granite-4.2-language-models)
- [Documentación oficial de IBM Granite 4.2](https://www.ibm.com/granite/docs/models/granite4-2)
