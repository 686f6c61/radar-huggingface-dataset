# liodon-ai/L3-8B-Stheno-v3.2-ONNX

## Resumen

L3-8B-Stheno-v3.2-ONNX es la exportación al formato ONNX del modelo Sao10K/L3-8B-Stheno-v3.2, un fine-tune de Meta Llama 3 de 8.000 millones de parámetros especializado en generación de texto y conversación. La exportación la ha realizado Liodon AI mediante la librería `optimum` de Hugging Face, con la tarea `text-generation-with-past`, de modo que el grafo ONNX expone entradas y salidas de tipo past-key-value que habilitan la decodificación autorregresiva con caché KV. El paquete está pensado para su ejecución con ONNX Runtime en lugar de con PyTorch.

El interés de esta ficha no reside en el modelo base (cuyas capacidades hereda sin modificaciones), sino en el formato: ofrece dos ficheros, uno en FP32 de 32,12 GB y otro en FP16 de 17,14 GB, lo que permite desplegar un modelo Llama 3 de 8B en entornos donde ONNX Runtime es la infraestructura estándar (Windows ML, servidores con CPU, aceleradores no soportados nativamente por PyTorch o pipelines de inferencia optimizados). El repositorio ocupa 49,3 GB en total.

La relevancia es, por tanto, de nicho y de infraestructura: resulta útil para equipos que ya tienen montado un runtime ONNX y quieren reutilizar un fine-tune conversacional de 8B sin reescribir su capa de inferencia. La model card no documenta el proceso de cuantización más allá de la mención en los tags, y el ejemplo de código de la propia card referencia un fichero (`model_quantized.onnx`) que no aparece en la tabla de ficheros publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3); exportado a grafo ONNX con past-key-value |
| Parametros totales | 8.000 millones (heredados de Llama 3 8B; no confirmado en la card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3 8B soporta 8.192 tokens) |
| Tipos de cuantizacion | FP32 (`model.onnx`, 32,12 GB) y FP16 (`model_fp16.onnx`, 17,14 GB); los tags mencionan "quantized" pero no se documenta un fichero INT8/INT4 |
| Idiomas soportados | no disponible |
| Licencia | other (se hereda de la licencia del modelo base, no detallada) |
| Formato de pesos | ONNX (dos ficheros: FP32 y FP16) |

## Arquitectura y entrenamiento

El modelo subyacente es Sao10K/L3-8B-Stheno-v3.2, un fine-tune de Llama 3 8B. Llama 3 emplea una arquitectura transformer decoder-only con atención multi-cabeza agrupada (GQA), normalización RMSNorm y activación SwiGLU. La model card de esta exportación no aporta detalles sobre el dataset de fine-tuning, el número de tokens empleados, ni si hubo RLHF, DPO u otra fase de alineamiento; esa información correspondería a la card del modelo original de Sao10K, que no se ha proporcionado.

La innovación técnica de este repositorio es exclusivamente de empaquetado: la exportación se realizó con `optimum.exporters.onnx.main_export` en la tarea `text-generation-with-past`, lo que produce un grafo que acepta y devuelve tensores de caché KV (`past_key_values.*.key` y `.value`). Esto evita recalcular la atención sobre todo el prefijo en cada token generado. No se documentan técnicas adicionales como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto autorregresiva con caché KV, orientada a diálogo multi-turno por el fine-tune Stheno.
- Conversación: el modelo base es un fine-tune de rol e instrucciones, por lo que se espera un comportamiento conversacional, aunque la card no detalla el estilo ni los datasets.
- Ejecución en ONNX Runtime con distintos execution providers (CPU, CUDA, DirectML, etc.), lo que amplía las plataformas de despliegue frente a PyTorch.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documentan capacidades de visión, audio ni modo "thinking".
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en infraestructura ONNX Runtime existente: equipos que ya operan servicios de inferencia con ONNX Runtime pueden cargar `model_fp16.onnx` con `ORTModelForCausalLM` y reutilizar su capa de serving sin introducir PyTorch en producción.
- Inferencia en CPU a gran escala: el fichero FP32 permite ejecutar el modelo con `CPUExecutionProvider` en servidores sin GPU, útil para cargas por lotes no interactivas donde la latencia no es crítica.
- Integración en aplicaciones de escritorio Windows: mediante el execution provider DirectML, el modelo puede ejecutarse en GPUs de consumo dentro de aplicaciones nativas que no incluyen el stack de PyTorch.
- Chatbots conversacionales de dominio acotado: al ser un fine-tune de rol de 8B, encaja en asistentes de personaje o atención al cliente con prompts de sistema controlados, siempre que se valide el comportamiento del fine-tune original.
- Prototipado rápido de pipelines de generación: el par FP32/FP16 permite comparar precisión y rendimiento sin cambiar de framework, midiendo el impacto del FP16 en la calidad de salida.
- Sustitución de checkpoints PyTorch en entornos con aceleradores no soportados: hardware con soporte ONNX Runtime pero sin kernels optimizados en PyTorch puede beneficiarse directamente de esta exportación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta exportación no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos, y al ser una conversión de formato no se espera que altere las métricas del modelo base (que tampoco se han proporcionado).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 32 GB en FP32 y 17 GB en FP16 solo para los pesos, más el espacio de la caché KV, que crece con la longitud de contexto y el tamaño de batch.
- GPU recomendadas: A100 40/80 GB o H100 para FP32 con contexto largo; una RTX 4090 (24 GB) puede alojar el fichero FP16, pero el margen para caché KV y activaciones es ajustado.
- GPU de consumo: el fichero FP16 cabe en GPUs de 24 GB (RTX 3090, RTX 4090); en GPUs de 16 GB o menos requeriría cuantización adicional no incluida en el repositorio.
- Despliegue: ONNX Runtime (con `optimum.onnxruntime.ORTModelForCausalLM` como wrapper recomendado), execution providers CPU, CUDA o DirectML. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que trabajan con otros formatos.
- Latencia y throughput: no disponibles; dependen del execution provider, del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| liodon-ai/L3-8B-Stheno-v3.2-ONNX | 8B | no disponible | ONNX (FP32/FP16) | other | Exportación de infraestructura, sin benchmarks propios |
| Sao10K/L3-8B-Stheno-v3.2 | 8B | no disponible | safetensors (PyTorch) | other | Modelo original; misma calidad esperada, requiere PyTorch |
| Meta Llama 3 8B Instruct | 8B | 8.192 tokens | safetensors, GGUF | Llama 3 Community License | Referencia oficial; benchmarks públicos amplios |
| Mistral 7B Instruct | 7B | 32.768 tokens | safetensors, GGUF | Apache 2.0 | Alternativa con licencia permisiva y contexto mayor |

La comparación relevante aquí es de formato más que de calidad: frente al checkpoint original en safetensors, esta exportación no cambia los pesos, solo el runtime. Frente a Llama 3 8B Instruct o Mistral 7B, la diferencia principal es la licencia (ambos tienen términos públicos y verificables, mientras que aquí figura como "other" sin detalle) y la disponibilidad de ecosistema de despliegue.

## Limitaciones y advertencias

- La licencia "other" no especifica términos; antes de un uso comercial es imprescindible consultar la licencia del modelo base Sao10K/L3-8B-Stheno-v3.2 y, en última instancia, la Llama 3 Community License de Meta.
- La model card no documenta el dataset de fine-tuning ni el proceso de alineamiento, por lo que no se pueden evaluar sesgos conocidos del fine-tune Stheno.
- Riesgo de alucinación: inherente a los modelos de 8B y no cuantificado en esta card; no hay evaluaciones de fidelidad publicadas.
- La card menciona en el ejemplo de código un fichero `model_quantized.onnx` que no figura en la tabla de ficheros; conviene verificar los ficheros reales del repositorio antes de integrarlo en un pipeline.
- El repositorio ocupa 49,3 GB; la descarga y el almacenamiento requieren planificación, especialmente si se quieren ambos ficheros.
- El modelo base tiene un contexto limitado (8.192 tokens en Llama 3 8B, aunque no se confirma en esta card); no es adecuado para tareas de contexto muy largo.
- Al ser una conversión de formato, cualquier limitación del fine-tune original (tono, alineamiento, idiomas) se hereda sin cambios.
- No hay benchmarks ni métricas de latencia publicadas; el rendimiento real debe medirse en el hardware objetivo.

## Enlaces

- Repositorio ONNX: https://huggingface.co/liodon-ai/L3-8B-Stheno-v3.2-ONNX
- Modelo base: https://huggingface.co/Sao10K/L3-8B-Stheno-v3.2
- Perfil del exportador: https://huggingface.co/liodon-ai
- Librería optimum: https://github.com/huggingface/optimum
- Documentación de ONNX Runtime: https://onnxruntime.ai/docs/
