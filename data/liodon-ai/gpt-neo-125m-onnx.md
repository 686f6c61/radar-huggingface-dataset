# liodon-ai/gpt-neo-125m-ONNX

## Resumen

El modelo `liodon-ai/gpt-neo-125m-ONNX` es una exportación al formato ONNX del modelo GPT-Neo 125M de EleutherAI, realizada por Liodon AI. GPT-Neo 125M es un modelo de lenguaje autoregresivo basado en la arquitectura GPT-3, entrenado sobre el corpus The Pile, y representa una opción ligera para tareas de generación de texto en entornos con recursos limitados. Esta versión ONNX incluye tres variantes de precisión (FP32, FP16 e INT8 dinámico) y está optimizada para su uso con ONNX Runtime, lo que facilita su despliegue en CPU y GPU sin depender del ecosistema PyTorch completo.

La relevancia de esta ficha radica en que ofrece una alternativa portable y cuantizada de un modelo base conocido, pensada para desarrolladores que necesitan integrar generación de texto en aplicaciones de producción con requisitos mínimos de hardware. Al estar exportado con la tarea `text-generation-with-past`, el grafo incluye entradas y salidas de past-key-values, lo que permite decodificación autoregresiva con caché de KV para mayor eficiencia. Aunque el modelo base tiene 125 millones de parámetros y una ventana de contexto de 2048 tokens (dato no confirmado en la información proporcionada), esta exportación no modifica las capacidades originales, solo el formato y la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-Neo (transformer decoder, similar a GPT-2/GPT-3) |
| Parametros totales | 125 millones |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32, FP16, INT8 dinamico (weight-only) |
| Idiomas soportados | no disponibles |
| Licencia | other (no especificada) |
| Formato de pesos | ONNX (model.onnx, model_fp16.onnx, model_quantized.onnx) |

## Arquitectura y entrenamiento

GPT-Neo 125M es un transformer decoder con arquitectura similar a GPT-2/GPT-3, entrenado por EleutherAI sobre el corpus The Pile, un dataset diverso de texto en inglés. El modelo original fue entrenado con una mezcla de objetivos de modelado de lenguaje causal y utiliza atención por ventanas locales (local attention) en algunas capas, una innovación de GPT-Neo para reducir el coste computacional. La exportación ONNX no modifica la arquitectura, solo convierte los pesos al formato ONNX y añade soporte para KV-cache en el grafo. La cuantización INT8 es dinámica y solo afecta a los pesos, sin calibración previa, lo que puede introducir una ligera degradación en la calidad de generación.

## Capacidades

- Generacion de texto autoregresiva: el modelo produce texto coherente en inglés, aunque con limitaciones propias de un modelo de 125M de parametros.
- Soporte de KV-cache: el grafo ONNX expone entradas y salidas de past-key-values, permitiendo decodificacion incremental eficiente.
- Compatibilidad con ONNX Runtime: puede ejecutarse en CPU, GPU (CUDA, DirectML) y otros proveedores soportados por ONNX Runtime.
- No incluye capacidades avanzadas como tool calling, agentes, razonamiento multi-paso, vision o audio. Es un modelo puramente textual.

## Casos de uso

- Prototipado rapido de aplicaciones de generacion de texto: al ser un modelo pequeno y portable, permite validar ideas de productos sin necesidad de infraestructura costosa.
- Generacion de texto en entornos con recursos limitados: su tamaño reducido (0.17 GB en INT8) lo hace apto para dispositivos edge, Raspberry Pi o servidores con poca RAM.
- Integracion en pipelines de procesamiento de lenguaje natural: puede usarse para tareas de completado de texto, generacion de borradores o aumento de datos en sistemas existentes.
- Educacion e investigacion: util para ensenar conceptos de modelos de lenguaje y tecnicas de cuantizacion, dado su tamano manejable y su disponibilidad en formato ONNX.
- Despliegue en produccion con ONNX Runtime: empresas que ya usan ONNX Runtime pueden integrar este modelo sin anadir dependencias de PyTorch, reduciendo el tamano de la imagen de contenedor.
- Generacion de contenido asistida en aplicaciones de escritorio: por ejemplo, sugerencias de texto en editores o herramientas de redaccion, donde la latencia en CPU es aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base GPT-Neo 125M tiene metricas conocidas (por ejemplo, perplexity en The Pile), pero esta exportacion no incluye datos de evaluacion especificos. Se recomienda consultar la documentacion del modelo original para referencias de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo FP32 ocupa 0.66 GB, FP16 0.34 GB e INT8 0.17 GB. Para inferencia en GPU, se recomienda al menos 1 GB de VRAM para FP32 y 0.5 GB para FP16/INT8, considerando overhead del runtime.
- GPU recomendadas: cualquier GPU con soporte CUDA (por ejemplo, NVIDIA GTX 1050 o superior) o GPU integradas con soporte DirectML. Para CPU, basta con un procesador moderno con instrucciones AVX2.
- Si cabe en consumer GPU: si, incluso en GPUs de gama baja como la GTX 1650 o la RTX 2060, y tambien en CPUs sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), puede usarse con el wrapper `ORTModelForCausalLM` de Optimum, o directamente con `onnxruntime.InferenceSession`. No es compatible con vLLM, llama.cpp u Ollama, ya que estos esperan formatos como safetensors o GGUF.
- Latencia y throughput estimados: no disponibles. Dependen del hardware y de la longitud de secuencia. En una CPU moderna, la generacion de 100 tokens puede tardar varios segundos; en una GPU media, puede ser subsegundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| liodon-ai/gpt-neo-125m-ONNX | 125M | no disponible | other | ONNX | Exportacion cuantizada |
| EleutherAI/gpt-neo-125m | 125M | 2048 (segun documentacion oficial) | MIT | safetensors | Modelo original |
| GPT-2 124M | 124M | 1024 | MIT | safetensors | Modelo clasico de OpenAI |

La comparativa se basa en parametros y contexto conocidos. No se dispone de datos de rendimiento comparativo en esta informacion.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base fue entrenado con The Pile, que contiene textos de internet con posibles sesgos sociales y culturales. La exportacion ONNX no corrige estos sesgos.
- Riesgo de alucinacion: al ser un modelo pequeno, es propenso a generar contenido incoherente o factualmente incorrecto, especialmente en tareas complejas.
- Limitaciones de contexto: la longitud de contexto no se especifica en la informacion, pero el modelo base GPT-Neo 125M tiene un maximo de 2048 tokens. Se recomienda no superar ese limite.
- Restricciones de licencia: la licencia se indica como "other", lo que puede implicar restricciones no especificadas. Se debe contactar con el autor para aclarar los terminos de uso comercial.
- Caveat para produccion: la cuantizacion INT8 dinamica sin calibracion puede degradar la calidad de generacion. Se recomienda evaluar el modelo cuantizado frente al FP32 antes de desplegarlo en entornos criticos.

## Enlaces

- [HuggingFace - liodon-ai/gpt-neo-125m-ONNX](https://huggingface.co/liodon-ai/gpt-neo-125m-ONNX)
- [HuggingFace - EleutherAI/gpt-neo-125m](https://huggingface.co/EleutherAI/gpt-neo-125m)
- [Articulo de EleutherAI sobre GPT-Neo](https://www.eleuther.ai/artifacts/gpt-neo)
- [Repositorio GitHub de GPT-Neo](https://github.com/EleutherAI/gpt-neo)
- [Documentacion de Optimum para exportacion ONNX](https://github.com/huggingface/optimum)
