# liodon-ai/LoCo-7B-ONNX

## Resumen

LoCo-7B-ONNX es la exportación al formato ONNX del modelo MuyaoYuan/LoCo-7B, publicada por Liodon AI. Se trata de un modelo de generación de texto de 7.000 millones de parámetros con arquitectura Qwen2, convertido mediante `optimum.exporters.onnx` con la tarea `text-generation-with-past`, de modo que el grafo expone entradas y salidas de past-key-value y permite decodificación autorregresiva con caché KV.

El interés de esta publicación no reside en el modelo base, sino en el formato: ofrece pesos ONNX listos para ejecutarse con ONNX Runtime, lo que facilita el despliegue en entornos donde el stack nativo es ONNX (Windows ML, DirectML, TensorRT, servidores con `onnxruntime-genai`) en lugar de PyTorch. El repositorio incluye dos variantes, `model.onnx` en FP32 (30,46 GB) y `model_fp16.onnx` en FP16 (15,95 GB) para execution providers de GPU.

La ficha se basa exclusivamente en la model card publicada y en los metadatos de Hugging Face. No se dispone de información sobre el dataset de entrenamiento, los idiomas soportados ni resultados de benchmarks, ni del modelo base ni de esta exportación, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (según tag `qwen2`) |
| Parametros totales | 7B (según nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (`model.onnx`, 30,46 GB) y FP16 (`model_fp16.onnx`, 15,95 GB); la model card menciona `model_quantized.onnx` en el ejemplo de código pero no lo lista entre los ficheros |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; condiciones no detalladas) |
| Formato de pesos | ONNX (grafo con past-key-value para caché KV) |

## Arquitectura y entrenamiento

El modelo base es MuyaoYuan/LoCo-7B, un transformer decoder-only de 7B parámetros etiquetado como `qwen2` en los tags del repositorio, lo que sugiere que reutiliza la arquitectura y probablemente el tokenizador de la familia Qwen2. La exportación se realizó con `optimum.exporters.onnx.main_export` bajo la tarea `text-generation-with-past`, de forma que el grafo ONNX acepta y devuelve tensores `past_key_values.*.key` y `past_key_values.*.value`, habilitando decodificación autorregresiva con caché KV gestionada por el runtime.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO ni sobre innovaciones técnicas del modelo base. La model card de esta exportación no documenta ningún proceso de entrenamiento adicional: es una conversión de formato, no un ajuste fino.

## Capacidades

- Generación de texto autoregresiva con decodificación incremental gracias a la caché KV expuesta en el grafo ONNX.
- Conversación multi-turno (tag `conversational` en Hugging Face), presumiblemente mediante plantilla de chat de Qwen2; la plantilla concreta no está documentada en la model card.
- Ejecución en ONNX Runtime con distintos execution providers (CPU, CUDA, TensorRT, DirectML), lo que permite desplegar el mismo artefacto en servidor y en cliente.
- Compatibilidad con `ORTModelForCausalLM` de `optimum.onnxruntime`, que gestiona automáticamente la contabilidad de la caché KV.
- Soporte de tool calling, agentes, visión, audio o modo de razonamiento explícito: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Despliegue en infraestructura ONNX-first: organizaciones que ya operan ONNX Runtime o `onnxruntime-genai` pueden servir el modelo sin introducir una dependencia de PyTorch en producción, usando `model_fp16.onnx` con el execution provider CUDA o TensorRT.
- Inferencia en Windows con DirectML: la variante FP16 permite ejecutar el modelo sobre GPU consumer en Windows mediante el execution provider DirectML de ONNX Runtime, un escenario habitual en aplicaciones de escritorio con IA integrada.
- Servicio de chat con caché KV: al exponer `past_key_values`, el runtime evita recalcular el prefijo en cada turno, lo que reduce la latencia en conversaciones multi-turno frente a una exportación sin caché.
- Integración en pipelines de `optimum`: el ejemplo de la model card muestra el uso directo de `ORTModelForCausalLM.from_pretrained(..., file_name="model_quantized.onnx")`, lo que encaja en proyectos que ya usan la API de Optimum para alternar entre backends.
- Evaluación comparativa de backends: sirve para medir el rendimiento de un mismo modelo de 7B en ONNX Runtime frente a PyTorch/vLLM, útil para decidir el stack de inferencia antes de un despliegue a gran escala.
- Prototipado en CPU con FP32: la variante `model.onnx` de 30,46 GB puede ejecutarse con `CPUExecutionProvider` en máquinas con suficiente RAM, útil para validación funcional sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad (MMLU, HumanEval, GSM8K) ni de rendimiento (latencia, throughput) para esta exportación.

## Requisitos de hardware

- VRAM estimada para FP16: en torno a 16 GB solo para pesos, más la caché KV y activaciones; una GPU de 24 GB (RTX 4090, A10G, L4 con margen limitado) es el mínimo práctico para contexto corto.
- VRAM estimada para FP32: aproximadamente 30,5 GB solo en pesos; requiere A100 40/80 GB, H100 o varias GPU.
- GPU recomendadas: A100 40 GB o H100 para FP32; RTX 4090, L40S o A10G 24 GB para FP16.
- Consumer GPU: la variante FP16 puede caber en una RTX 4090 (24 GB) con contexto moderado; en GPUs de 16 GB o menos no cabe sin cuantización adicional, que no se distribuye en este repositorio.
- Opciones de despliegue: ONNX Runtime (`CPUExecutionProvider`, `CUDAExecutionProvider`, `TensorrtExecutionProvider`, `DmlExecutionProvider`), `onnxruntime-genai`, y `ORTModelForCausalLM` de Optimum. No se distribuyen pesos GGUF, por lo que llama.cpp u Ollama requerirían una conversión propia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LoCo-7B-ONNX | 7B | no disponible | ONNX (FP32/FP16) | other | Exportación de MuyaoYuan/LoCo-7B; sin benchmarks publicados |
| MuyaoYuan/LoCo-7B | 7B | no disponible | safetensors (presumible) | other | Modelo base en PyTorch |
| liodon-ai/Sentiment-Analysis-7B-ONNX | 7B | no disponible | ONNX | other | Otra exportación del mismo autor, basada en Mistral; repo de 44,5 GB |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoría (por ejemplo, Qwen2.5-7B-Instruct en ONNX), ya que no hay benchmarks publicados para este modelo.

## Limitaciones y advertencias

- La licencia es `other` y no se detallan sus términos en la model card; es imprescindible revisar la licencia del modelo base MuyaoYuan/LoCo-7B antes de cualquier uso comercial.
- El ejemplo de código de la model card referencia `model_quantized.onnx`, pero la tabla de ficheros solo lista `model.onnx` y `model_fp16.onnx`; conviene verificar qué ficheros existen realmente en el repositorio antes de desplegar.
- No hay información sobre sesgos, riesgo de alucinación ni evaluación de seguridad del modelo base.
- Se desconoce la longitud de contexto efectiva y los idiomas soportados, lo que impide garantizar su comportamiento en casos de uso multilingües o con contextos largos.
- Al ser una conversión de formato, hereda cualquier limitación del modelo base sin correcciones adicionales.
- El tamaño del repositorio (46,4 GB) y la ausencia de una variante cuantizada distribuida limitan su uso en hardware modesto.
- El modelo tiene un volumen de descargas muy bajo (22) y ninguna validación comunitaria (0 likes), por lo que no hay evidencia externa de su calidad en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/liodon-ai/LoCo-7B-ONNX
- Modelo base: https://huggingface.co/MuyaoYuan/LoCo-7B
- Perfil del exportador: https://huggingface.co/liodon-ai
- Optimum (herramienta de exportación): https://github.com/huggingface/optimum
- Otra exportación del mismo autor: https://huggingface.co/liodon-ai/Sentiment-Analysis-7B-ONNX
