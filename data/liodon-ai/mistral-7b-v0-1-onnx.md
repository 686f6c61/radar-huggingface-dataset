# liodon-ai/Mistral-7B-v0.1-ONNX

## Resumen

Mistral-7B-v0.1-ONNX es una exportación a formato ONNX del modelo base `mistralai/Mistral-7B-v0.1`, publicada por el usuario liodon-ai. No se trata de un modelo nuevo ni de un ajuste fino: es una conversión de pesos y grafo computacional realizada con la librería `optimum` de Hugging Face, con la tarea `text-generation-with-past`, de modo que el grafo expone las entradas y salidas de clave-valor (KV cache) necesarias para decodificación autorregresiva eficiente.

El modelo subyacente, Mistral-7B-v0.1, es un transformer decoder-only denso de 7.000 millones de parámetros desarrollado por Mistral AI, con una longitud de contexto de 8.192 tokens y licencia Apache 2.0 en su versión original. Esta exportación conserva la arquitectura y los pesos del modelo base, pero los presenta en un formato optimizado para ejecución con ONNX Runtime en distintos backends (CPU, CUDA, etc.).

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el autor no documenta el proceso de cuantización con detalle y el tamaño del repositorio (44,5 GB) sugiere que incluye tanto pesos FP32 como FP16. Para producción conviene evaluar alternativas más maduras, como la exportación oficial de Microsoft (`microsoft/Mistral-7B-v0.1-onnx`), que documenta explícitamente el uso con el execution provider CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (denso), exportado a grafo ONNX |
| Parametros totales | 7.000 millones (heredados de Mistral-7B-v0.1) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (heredada del modelo base) |
| Tipos de cuantizacion | FP32 (`model.onnx`, 28,97 GB) y FP16 (`model_fp16.onnx`, 15,56 GB); la model card menciona `model_quantized.onnx` en el ejemplo pero no lo documenta en la tabla de ficheros |
| Idiomas soportados | No disponible |
| Licencia | `other` (el modelo base Mistral-7B-v0.1 se distribuye bajo Apache 2.0) |
| Formato de pesos | ONNX (`model.onnx`, `model_fp16.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es la del transformer decoder-only de Mistral-7B-v0.1: atención con ventana deslizante (sliding window attention) y mecanismo de atención agrupada (grouped-query attention, GQA) para reducir el coste de memoria del KV cache. Esta exportación no modifica la arquitectura, solo la representa como grafo ONNX con soporte de `past_key_values`, lo que permite decodificación autorregresiva con caché y evita recalcular el contexto completo en cada paso.

No hay información sobre el entrenamiento en esta ficha: el repositorio es una conversión de pesos, no un modelo entrenado por liodon-ai. Los detalles de preentrenamiento (número de tokens, composición del dataset, ausencia de RLHF/DPO en la versión v0.1) corresponden al modelo base original de Mistral AI y no se documentan en esta exportación. La innovación técnica relevante aquí es la propia exportación ONNX con `optimum.exporters.onnx.main_export` y tarea `text-generation-with-past`, que preserva el KV cache en el grafo.

## Capacidades

- Generación de texto autoregresiva en modo completado (modelo base, sin ajuste instructivo).
- Razonamiento y conocimiento general heredados de Mistral-7B-v0.1.
- Generación de código y matemáticas básicas, limitada por el entrenamiento del modelo base.
- Ejecución con ONNX Runtime en CPU y, potencialmente, en execution providers de GPU (CUDA, TensorRT), aunque el autor no documenta configuración de GPU.
- Soporte de KV cache en el grafo, lo que permite decodificación eficiente en contextos largos.
- No se documenta soporte de tool calling ni function calling nativo.
- No se documenta modo de razonamiento explícito (thinking mode), visión ni audio.
- Capacidades multilingües no documentadas en esta exportación.

## Casos de uso

- Despliegue en entornos ONNX Runtime: el modelo puede integrarse en pipelines que ya usan ONNX Runtime para otros modelos, unificando el stack de inferencia sin depender de PyTorch en producción.
- Inferencia en CPU con FP32 o FP16: adecuado para servidores sin GPU dedicada donde se prioriza compatibilidad sobre latencia, usando `CPUExecutionProvider`.
- Prototipado de aplicaciones de completado de texto: al ser un modelo base, encaja en tareas de generación libre, resumen o reescritura que no requieran instrucciones estrictas.
- Evaluación comparativa de backends: útil para medir diferencias de rendimiento entre ONNX Runtime y otras runtimes (vLLM, llama.cpp) con los mismos pesos.
- Integración en aplicaciones de escritorio o edge con ONNX Runtime: el formato ONNX facilita el empaquetado en aplicaciones nativas que no incluyen PyTorch.
- Base para cuantización posterior: los grafos ONNX pueden cuantizarse con herramientas de ONNX Runtime (por ejemplo, cuantización dinámica de INT8) para reducir el tamaño y acelerar la inferencia en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para FP16: aproximadamente 15,6 GB solo para pesos, más el KV cache y activaciones; en la práctica se recomienda al menos 20-24 GB de VRAM para contextos moderados.
- VRAM estimada para FP32: aproximadamente 29 GB solo para pesos, lo que excede la mayoría de GPUs de consumo.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para FP16; para FP32 se requiere A100 40 GB o superior.
- GPU de consumo: FP16 puede caber en RTX 4090 (24 GB) y RTX 3090 (24 GB) con contextos cortos; no cabe en GPUs de 16 GB o menos sin cuantización adicional.
- Opciones de despliegue: ONNX Runtime (`CPUExecutionProvider`, `CUDAExecutionProvider`), `optimum.onnxruntime.ORTModelForCausalLM`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este repositorio concreto.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/Mistral-7B-v0.1-ONNX | 7.000 M | 8.192 | ONNX (FP32/FP16) | `other` | 0 descargas, sin benchmarks |
| microsoft/Mistral-7B-v0.1-onnx | 7.000 M | 8.192 | ONNX (optimizado para CUDA EP) | Apache 2.0 (modelo base) | Repositorio oficial de Microsoft con instrucciones de uso |
| mistralai/Mistral-7B-v0.1 | 7.000 M | 8.192 | Safetensors (PyTorch) | Apache 2.0 | Modelo original, ampliamente usado |
| Mistral-7B-Instruct-v0.1 | 7.000 M | 8.192 | Safetensors (PyTorch) | Apache 2.0 | Variante ajustada para instrucciones |

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: no sigue instrucciones de forma fiable y puede producir continuaciones incoherentes en tareas conversacionales.
- Riesgo de alucinación inherente a los modelos de lenguaje de 7.000 millones de parámetros, agravado por la ausencia de RLHF.
- Sesgos conocidos del corpus de preentrenamiento de Mistral-7B-v0.1, no auditados en esta exportación.
- La licencia figura como `other`, lo que genera ambigüedad para uso comercial; conviene verificar los términos del modelo base (Apache 2.0) y del exportador antes de desplegar.
- La model card menciona `model_quantized.onnx` en el ejemplo de código pero no lo incluye en la tabla de ficheros; el fichero puede no existir o no estar documentado.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de que la exportación sea correcta más allá de la propia model card.
- No se documentan idiomas soportados ni evaluación de calidad de la exportación (por ejemplo, comparación de logits con el modelo original).
- El tamaño del repositorio (44,5 GB) implica costes de descarga y almacenamiento considerables.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/liodon-ai/Mistral-7B-v0.1-ONNX
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.1
- Exportación oficial de Microsoft: https://huggingface.co/microsoft/Mistral-7B-v0.1-onnx
- README de la exportación de Microsoft: https://huggingface.co/microsoft/Mistral-7B-v0.1-onnx/blob/main/README.md
- Optimum (herramienta de exportación): https://github.com/huggingface/optimum
