# liodon-ai/Meta-Llama-3-8B-Instruct-abliterated-v3-ONNX

## Resumen

Meta-Llama-3-8B-Instruct-abliterated-v3-ONNX es la exportación al formato ONNX del modelo failspy/Meta-Llama-3-8B-Instruct-abliterated-v3, publicada por Liodon AI. Se trata de una versión "abliterated" del Meta Llama 3 8B Instruct, es decir, una variante en la que se ha aplicado una técnica de edición de pesos para eliminar (ablacionar) la dirección de rechazo en el espacio de activaciones, reduciendo la tendencia del modelo a negarse a responder determinadas peticiones. Sobre esa base, Liodon AI ha generado grafos ONNX listos para ejecución con ONNX Runtime, incluyendo soporte de caché KV (`text-generation-with-past`).

El modelo conserva la arquitectura transformer decoder-only de Llama 3 8B, con aproximadamente 8.000 millones de parámetros y una ventana de contexto de 8.192 tokens (la de la familia Llama 3 base). El repositorio incluye dos pesos: `model.onnx` en FP32 (32,12 GB) y `model_fp16.onnx` en FP16 (17,14 GB), además de un `model_quantized.onnx` referenciado en la guía de inicio rápido. La exportación se realizó con `optimum.exporters.onnx` (tarea `text-generation-with-past`), de modo que el grafo expone entradas y salidas de past-key-value para decodificación autorregresiva con caché.

La relevancia de esta ficha radica en que ofrece una vía de despliegue del modelo en entornos que no usan PyTorch de forma nativa, como aplicaciones .NET, C++, Java o servicios con ONNX Runtime, y en que documenta las implicaciones de seguridad y licencia de un modelo "abliterated" orientado a generación de texto conversacional. El modelo acumula 24 descargas y ninguna marca de "me gusta" en el momento de la consulta, lo que indica una adopción todavía muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), exportado a ONNX con caché KV |
| Parametros totales | ~8.000 millones (8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (heredada de Llama 3 8B; no se especifica en la model card) |
| Tipos de cuantizacion | FP32 (`model.onnx`), FP16 (`model_fp16.onnx`); se menciona `model_quantized.onnx` sin detallar el esquema de cuantización |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; ver limitaciones) |
| Formato de pesos | ONNX (grafos FP32 y FP16; posible variante cuantizada) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Meta Llama 3 8B Instruct: un transformer decoder-only con atención multi-cabeza agrupada (GQA), normalización RMSNorm y activación SwiGLU, entrenado originalmente por Meta sobre un corpus multilingüe de billones de tokens y posteriormente ajustado por instrucciones y alineado con RLHF. Sobre esa base, el autor original (failspy) aplicó una técnica de "abliteration": se calcula la dirección de rechazo en el espacio de activaciones y se proyectan los pesos para suprimirla, sin reentrenamiento adicional. El resultado es un modelo que mantiene las capacidades del Instruct original pero con menor propensión a rechazar peticiones.

Liodon AI no ha reentrenado el modelo: se limita a exportarlo con `optimum` a ONNX, tarea `text-generation-with-past`, de modo que el grafo incluye entradas y salidas de past-key-value para decodificación con caché. No se documentan en la información disponible detalles sobre el dataset de la ablación, el proceso exacto de edición de pesos ni métricas de evaluación del modelo base. Tampoco se especifica la herramienta o el esquema de cuantización del archivo `model_quantized.onnx` mencionado en la guía de inicio rápido.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste Instruct de Llama 3.
- Razonamiento y respuesta a instrucciones en formato chat (plantilla de Llama 3 Instruct).
- Generación de código y matemáticas a nivel de un modelo de 8B, sin datos de benchmark disponibles en esta ficha.
- Soporte de tool calling / function calling: no documentado en la model card; debe validarse empíricamente.
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente.
- Multilingüismo: no disponible en la información proporcionada (Llama 3 base es multilingüe, pero no se detalla cobertura).
- Comportamiento "abliterated": menor tasa de rechazos ante peticiones que el modelo Instruct original; esto es una capacidad y a la vez un riesgo (ver limitaciones).
- Ejecución con ONNX Runtime, incluidos proveedores de ejecución de CPU y GPU.

## Casos de uso

- Despliegue en aplicaciones .NET o C++: al estar en ONNX, el modelo puede cargarse con ONNX Runtime desde lenguajes sin ecosistema PyTorch nativo, integrándose en servicios empresariales existentes.
- Servicios de chat conversacional: el grafo con caché KV permite decodificación autorregresiva eficiente en conversaciones multi-turno de hasta 8.192 tokens de contexto.
- Generación de texto en pipelines de CI/CD: la variante FP16 (17,14 GB) puede servirse en GPU para tareas de generación por lotes, resúmenes o clasificación con pocas muestras.
- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio de la técnica de abliteration y de sus efectos sobre la tasa de rechazos y la calidad de las respuestas.
- Prototipado de asistentes sin filtros editoriales: en entornos controlados de investigación creativa o generación de ficción, donde el modelo Instruct original rechazaría contenido legítimo.
- Evaluación comparativa de formatos: permite medir el rendimiento de un mismo modelo en ONNX frente a PyTorch/safetensors en latencia, memoria y fidelidad numérica.
- Inferencia en CPU: la variante cuantizada mencionada en la guía permite ejecutar el modelo en servidores sin GPU, con throughput reducido pero funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos, ni para el modelo base ni para la exportación ONNX.

## Requisitos de hardware

- VRAM estimada en FP32: ~32 GB de pesos más overhead de activaciones y caché KV; requiere GPU de 40 GB o más (A100 40GB, A100 80GB, H100).
- VRAM estimada en FP16: ~17 GB de pesos; cabe en GPU de 24 GB (RTX 3090, RTX 4090, L4, A10G) con margen limitado para contexto largo.
- VRAM estimada en cuantización (si `model_quantized.onnx` es de 8 bits): ~8-9 GB de pesos; cabe en GPU consumer de 12 GB (RTX 3060 12GB, RTX 4070) y en CPU con suficiente RAM.
- GPU recomendadas: A100/H100 para FP32 y producción de alta concurrencia; RTX 4090 o L4 para FP16; RTX 3060 12GB o CPU para la variante cuantizada.
- Despliegue: ONNX Runtime (CPUExecutionProvider, CUDAExecutionProvider, TensorRTExecutionProvider), con `optimum.onnxruntime.ORTModelForCausalLM` como wrapper recomendado para gestionar el caché KV. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que el formato es ONNX y no GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| liodon-ai/Meta-Llama-3-8B-Instruct-abliterated-v3-ONNX | ~8B | 8.192 | ONNX (FP32/FP16) | other | Exportación ONNX del modelo abliterated; 24 descargas |
| failspy/Meta-Llama-3-8B-Instruct-abliterated-v3 | ~8B | 8.192 | safetensors | other | Modelo base original; ecosistema PyTorch/Transformers |
| liodon-ai/Meta-Llama-3-8B-Instruct-abliterated-v3-FP8 | ~8B | 8.192 | FP8 | other | Misma familia, cuantización FP8 para GPUs Hopper/Ada |
| meta-llama/Meta-Llama-3-8B-Instruct | ~8B | 8.192 | safetensors | Llama 3 Community License | Modelo oficial alineado; mayor tasa de rechazos |

## Limitaciones y advertencias

- El modelo es "abliterated": se ha suprimido la dirección de rechazo, por lo que puede generar contenido que el Instruct original bloquearía. No es apto para producción orientada al público sin filtros adicionales.
- Riesgo elevado de alucinación, inherente a los modelos de 8B; no se han publicado evaluaciones de fidelidad en esta exportación.
- La licencia es "other" y hereda las restricciones del modelo base (Llama 3 Community License y las condiciones del modelo abliterated de failspy). Es imprescindible revisar los términos antes de cualquier uso comercial.
- No se documentan los idiomas soportados ni la composición del corpus de entrenamiento en esta ficha.
- La variante `model_quantized.onnx` se menciona en la guía de inicio rápido pero no se detalla su esquema de cuantización ni su precisión; validar antes de usar en producción.
- El repositorio tiene 49,3 GB y solo 24 descargas, sin "me gusta": la adopción es mínima y no hay evidencia comunitaria de calidad o estabilidad.
- El contexto de 8.192 tokens es limitado para tareas de documento largo; no se documenta extensión de contexto.
- El soporte de tool calling y agentes no está verificado en esta exportación ONNX.
- La fecha de creación del repositorio (2026-11-04) y la ausencia de métricas hacen recomendable una evaluación propia antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liodon-ai/Meta-Llama-3-8B-Instruct-abliterated-v3-ONNX
- Modelo base: https://huggingface.co/failspy/Meta-Llama-3-8B-Instruct-abliterated-v3
- Variante FP8 de la misma familia: https://huggingface.co/liodon-ai/Meta-Llama-3-8B-Instruct-abliterated-v3-FP8
- Archivos de la variante FP8: https://huggingface.co/liodon-ai/Meta-Llama-3-8B-Instruct-abliterated-v3-FP8/tree/main
- Herramienta de exportación optimum: https://github.com/huggingface/optimum
- Perfil del autor: https://huggingface.co/liodon-ai
