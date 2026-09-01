# liodon-ai/Nanbeige4.2-3B-DSpark-ONNX

## Resumen

Nanbeige4.2-3B-DSpark es un modelo de lenguaje compacto de tipo agéntico desarrollado por Nanbeige LLM Lab, el equipo de investigación de IA de la plataforma china de reclutamiento BOSS Zhipin. El modelo está construido sobre Nanbeige4.2-3B-Base y emplea una arquitectura Looped Transformer que reutiliza las capas del transformer para aumentar la capacidad efectiva del modelo sin añadir parámetros adicionales. Con solo 3B parámetros no-embebidos, el modelo ofrece un rendimiento sólido en tareas de agente de código, agente de oficina y uso complejo de herramientas, manteniendo a la vez capacidades competitivas de razonamiento en matemáticas, código y ciencia.

El repositorio que nos ocupa, `liodon-ai/Nanbeige4.2-3B-DSpark-ONNX`, es una exportación a formato ONNX del modelo original, publicada por Liodon AI. La exportación se realizó con la librería `optimum` de HuggingFace, utilizando la tarea `text-generation-with-past`, lo que significa que el grafo expone entradas y salidas de past-key-values para permitir decodificación autorregresiva con caché de KV. Se incluyen tres versiones del modelo: FP32, FP16 y una versión cuantizada dinámica INT8, lo que facilita el despliegue en diferentes entornos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped Transformer (reutilización de capas) |
| Parametros totales | 3B no-embebidos (tamaño total no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32, FP16, INT8 dinámico (weight-only, sin calibración) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia original del modelo base: Apache-2.0 según fuentes externas) |
| Formato de pesos | ONNX (model.onnx, model_fp16.onnx, model_quantized.onnx) |

## Arquitectura y entrenamiento

El modelo original Nanbeige4.2-3B-DSpark utiliza una arquitectura Looped Transformer, una innovación que reutiliza la pila de capas del transformer varias veces durante la inferencia, aumentando la profundidad efectiva sin incrementar el número de parámetros. Esta técnica permite que un modelo compacto de 3B parámetros no-embebidos alcance capacidades de razonamiento y comportamiento agéntico comparables a modelos de mayor tamaño. El modelo fue preentrenado desde cero sobre 28 billones de tokens, según el paper disponible en arXiv.

La versión ONNX de Liodon AI es una exportación del modelo original realizada con `optimum.exporters.onnx.main_export`, utilizando la tarea `text-generation-with-past`. Esto significa que el grafo ONNX expone explícitamente las entradas y salidas de past-key-values, lo que permite una decodificación autorregresiva eficiente con caché de KV. La versión cuantizada INT8 es dinámica y solo cuantiza los pesos, sin necesidad de calibración previa.

## Capacidades

- Comportamiento agéntico general: el modelo está diseñado específicamente para tareas de agente, incluyendo razonamiento multi-paso y planificación.
- Agente de código: puede ejecutar tareas de generación, edición y depuración de código en entornos de agente.
- Agente de oficina: capaz de manejar tareas ofimáticas como generación de documentos, hojas de cálculo y presentaciones.
- Uso complejo de herramientas: soporta tool calling y orquestación de múltiples herramientas en flujos de trabajo.
- Razonamiento en matemáticas, código y ciencia: mantiene capacidades competitivas de razonamiento en estas áreas a pesar de su tamaño compacto.
- Generación de texto: capacidades estándar de generación de lenguaje natural.
- Inferencia con caché de KV: la versión ONNX expone past-key-values para decodificación eficiente.

## Casos de uso

- Asistentes de programación autónomos: el modelo puede integrarse en entornos de desarrollo como agente de código, generando y modificando archivos, ejecutando comandos y resolviendo issues de forma autónoma gracias a su comportamiento agéntico y soporte de herramientas.
- Automatización de tareas ofimáticas: puede utilizarse para generar informes, resumir documentos, crear presentaciones o manipular hojas de cálculo, actuando como agente de oficina que interactúa con APIs de suites ofimáticas.
- Orquestación de herramientas en pipelines de datos: su capacidad de tool calling permite usarlo como orquestador que decide qué herramientas invocar (bases de datos, APIs, scripts) para completar tareas complejas de análisis de datos.
- Chatbots de soporte técnico con razonamiento multi-paso: su capacidad de razonamiento y comportamiento agéntico lo hace adecuado para sistemas de soporte que necesitan diagnosticar problemas, consultar documentación y proponer soluciones en varios pasos.
- Despliegue en entornos con recursos limitados: la versión ONNX cuantizada INT8 (1.74 GB) permite ejecutar el modelo en CPUs sin GPU, lo que facilita su uso en entornos edge o en servidores sin aceleradores dedicados.
- Integración en aplicaciones multiplataforma: el formato ONNX es compatible con ONNX Runtime, que soporta múltiples plataformas (Windows, Linux, macOS, móviles), permitiendo desplegar el modelo en una amplia variedad de entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original (arXiv:2607.22083) menciona que el modelo ofrece "rendimiento sólido" en tareas de agente de código, oficina y uso de herramientas, así como "capacidades competitivas de razonamiento" en matemáticas, código y ciencia, pero no se incluyen cifras concretas en los materiales proporcionados.

## Requisitos de hardware

- La versión FP32 (`model.onnx`, 6.95 GB) requiere aproximadamente 7 GB de VRAM o RAM para cargar los pesos, más memoria adicional para activaciones y caché de KV.
- La versión FP16 (`model_fp16.onnx`, 3.66 GB) es adecuada para GPUs con al menos 4-6 GB de VRAM, como una RTX 3060 o superior.
- La versión INT8 cuantizada (`model_quantized.onnx`, 1.74 GB) puede ejecutarse en CPU con ONNX Runtime, con un consumo de RAM de aproximadamente 2-3 GB.
- Para inferencia en GPU, se recomienda cualquier GPU compatible con CUDA y ONNX Runtime (por ejemplo, RTX 3090, RTX 4090, A100).
- Opciones de despliegue: ONNX Runtime (CPU y GPU), `optimum.onnxruntime.ORTModelForCausalLM` como wrapper de HuggingFace, o integración directa con `onnxruntime.InferenceSession`.
- La latencia y el throughput dependen en gran medida del hardware y de la longitud de la secuencia; no se dispone de cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Nanbeige4.2-3B-DSpark | 3B no-embebidos | Looped Transformer | no disponible | Apache-2.0 (según fuentes externas) | PyTorch / ONNX |
| Qwen2.5-3B | 3B | Transformer estándar | 32K (típico) | Apache-2.0 | PyTorch / GGUF / ONNX |
| Llama-3.2-3B | 3.2B | Transformer estándar | 128K | Llama 3.2 Community License | PyTorch / GGUF / ONNX |

La comparativa se basa en información pública de los modelos mencionados. Nanbeige4.2-3B-DSpark se diferencia por su arquitectura Looped Transformer y su enfoque específico en comportamiento agéntico, mientras que Qwen2.5-3B y Llama-3.2-3B son transformers estándar con enfoque más generalista.

## Limitaciones y advertencias

- La licencia del modelo se indica como "other" en HuggingFace, aunque fuentes externas mencionan Apache-2.0. Es necesario verificar los términos exactos de la licencia antes de uso comercial.
- No se dispone de información sobre la longitud de contexto soportada, lo que dificulta planificar su uso en aplicaciones que requieran ventanas largas.
- Los idiomas soportados no están documentados en la información proporcionada; se desconoce su rendimiento en español u otros idiomas distintos del chino e inglés.
- La cuantización INT8 dinámica puede introducir una degradación de precisión en tareas de razonamiento complejo, aunque no se han publicado evaluaciones específicas.
- El modelo está diseñado para comportamiento agéntico, por lo que su uso como modelo de propósito general puede no ser óptimo comparado con modelos generalistas del mismo tamaño.
- Al ser una exportación ONNX, algunas funcionalidades del modelo original (como sampling avanzado o features específicas del framework) pueden no estar disponibles o requerir configuración adicional.
- Riesgo de alucinación inherente a todos los modelos de lenguaje, especialmente en tareas de razonamiento multi-paso donde los errores pueden propagarse.

## Enlaces

- Repositorio HuggingFace del modelo ONNX: https://huggingface.co/liodon-ai/Nanbeige4.2-3B-DSpark-ONNX
- Modelo original: https://huggingface.co/Nanbeige/Nanbeige4.2-3B-DSpark
- Paper arXiv: https://arxiv.org/abs/2607.22083
- PDF del paper: https://arxiv.org/pdf/2607.22083
- Modelo base Nanbeige4-3B-Base: https://huggingface.co/Nanbeige/Nanbeige4-3B-Base
- Resumen en AI/TLDR: https://ai-tldr.dev/releases/nanbeige-4-2-3b/
