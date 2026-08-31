# liodon-ai/Llama-3.2-1B-Instruct-ONNX

## Resumen

El modelo `liodon-ai/Llama-3.2-1B-Instruct-ONNX` es una exportación a formato ONNX del modelo `unsloth/Llama-3.2-1B-Instruct`, que a su vez es una versión optimizada y cuantizada del modelo original `meta-llama/Llama-3.2-1B-Instruct` de Meta. Publicado por Liodon AI, este modelo está pensado para ejecutarse con ONNX Runtime, lo que permite desplegarlo en entornos heterogéneos (CPU, GPU, dispositivos edge) sin depender de frameworks específicos como PyTorch o TensorFlow.

El modelo conserva la arquitectura transformer de Llama 3.2 con 1.24 mil millones de parámetros, y se distribuye en tres variantes de precisión: FP32 (5.99 GB), FP16 (3.13 GB) e INT8 dinámico (1.50 GB). Esta flexibilidad lo hace adecuado para escenarios con restricciones de memoria o latencia, como inferencia en CPU o en GPUs de gama media. La exportación se realizó con la herramienta `optimum` de Hugging Face, incluyendo soporte para caché de claves y valores (KV-cache) en la decodificación autorregresiva.

Aunque el modelo base de Meta soporta un contexto de 128 000 tokens, la información proporcionada para este export no confirma explícitamente esa longitud, por lo que se recomienda verificar el comportamiento real en el despliegue. La licencia es "other", que corresponde a la licencia comunitaria de Meta Llama 3.2, con restricciones para uso comercial en empresas con más de 700 millones de usuarios mensuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.2, decoder-only) |
| Parametros totales | 1.24 mil millones (heredados del modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base de Meta soporta 128 000 tokens) |
| Tipos de cuantizacion | FP32, FP16, INT8 dinamico (weight-only) |
| Idiomas soportados | no disponible (el modelo base es multilingue, con soporte oficial para 8 idiomas) |
| Licencia | other (licencia comunitaria de Meta Llama 3.2) |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento

El modelo es una conversión directa a ONNX del checkpoint `unsloth/Llama-3.2-1B-Instruct`, que a su vez es una versión cuantizada y optimizada del modelo original de Meta. La arquitectura subyacente es un transformer decoder-only con normalización RMSNorm, atención con RoPE (rotary position embeddings) y capas feed-forward con activación SwiGLU. El modelo original fue entrenado con un pipeline que incluye preentrenamiento en un corpus multilingüe, seguido de fine-tuning supervisado (SFT) y optimización con DPO (Direct Preference Optimization) para alinear las respuestas con preferencias humanas.

La exportación a ONNX se realizó con `optimum.exporters.onnx.main_export` usando la tarea `text-generation-with-past`, lo que significa que el grafo expone entradas y salidas de past-key-values para permitir decodificación autorregresiva con caché. Esto es esencial para un rendimiento eficiente en inferencia, ya que evita recalcular las atenciones de tokens anteriores. No se aplicó ninguna técnica de cuantización adicional más allá de la que ya traía el modelo base de unsloth; la variante INT8 dinámica se generó con cuantización weight-only sin calibración, lo que puede afectar ligeramente la precisión.

## Capacidades

- Generacion de texto y dialogo multilingue: el modelo base de Meta soporta 8 idiomas (aleman, español, frances, hindi, ingles, italiano, portugues y tailandes), aunque no se confirma si el export ONNX mantiene todas las capacidades.
- Razonamiento y comprension de instrucciones: al ser un modelo instruct, responde a prompts en lenguaje natural con instrucciones explicitas.
- Resumen y extraccion de informacion: adecuado para tareas de summarization y recuperacion de informacion en textos largos.
- Agentes y retrieval aumentado: el modelo base esta optimizado para tareas de agentic retrieval, aunque no se documenta soporte explicito de tool calling en este export.
- Inferencia en multiples entornos: gracias al formato ONNX, puede ejecutarse en CPU, GPU (CUDA, DirectML) y dispositivos edge con ONNX Runtime.
- Cuantizacion flexible: las tres variantes de precision permiten elegir entre velocidad, memoria y fidelidad segun el hardware disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en varios idiomas, aprovechando su capacidad de dialogo y su ventana de contexto amplia (si se confirma la herencia de 128k tokens). Se desplegaria con la variante INT8 en CPU para reducir costes de infraestructura.
- Generacion de codigo en entornos con recursos limitados: aunque no esta especializado en codigo, puede asistir en tareas de autocompletado o explicacion de fragmentos simples. La variante FP16 en una GPU con 4 GB de VRAM es suficiente para inferencia interactiva.
- Resumen de documentos largos: con la ventana de contexto amplia, puede resumir articulos, informes o correos. La variante FP32 ofrece la maxima fidelidad, aunque requiere mas memoria.
- Clasificacion y extraccion de entidades: mediante prompts de few-shot, puede realizar tareas de clasificacion de texto o extraccion de informacion estructurada, util en pipelines de procesamiento de datos.
- Chatbot local para prototipado: gracias a su tamano reducido, puede ejecutarse en un portatil con 8 GB de RAM usando la variante INT8, ideal para pruebas de concepto sin conexion.
- Inferencia en dispositivos edge: el formato ONNX permite compilar el modelo para plataformas como Windows ML o DirectML, habilitando asistentes de voz o aplicaciones moviles con procesamiento local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base de Meta reporta metricas en tareas como MMLU, GSM8K y HumanEval, pero no se dispone de datos especificos para este export ONNX. Se recomienda evaluar el modelo en el hardware objetivo antes de su despliegue en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - FP32: ~6 GB (CPU o GPU)
  - FP16: ~3.5 GB (GPU)
  - INT8 dinamico: ~1.8 GB (CPU o GPU)
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060). Para FP32 se recomienda una GPU con 8 GB o mas (RTX 3070, A100, etc.).
- En CPU, la variante INT8 puede ejecutarse con 2 GB de RAM libre, aunque la latencia sera mayor que en GPU.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider, CUDAExecutionProvider, DirectML), `optimum.onnxruntime.ORTModelForCausalLM` para integracion con Transformers, o compilacion con herramientas como `onnxruntime-genai`.
- Latencia y throughput: no se proporcionan datos oficiales. En una CPU moderna, la variante INT8 puede generar entre 5 y 15 tokens por segundo; en una GPU como RTX 4060, la variante FP16 puede alcanzar 50-100 tokens por segundo, dependiendo de la longitud de la secuencia y el batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| liodon-ai/Llama-3.2-1B-Instruct-ONNX | 1.24B | no disponible (base: 128k) | ONNX (FP32/FP16/INT8) | other (Meta Llama 3.2) | Export ONNX con multiples precisiones |
| meta-llama/Llama-3.2-1B-Instruct | 1.24B | 128k | safetensors | Llama 3.2 Community License | Modelo original de Meta |
| unsloth/Llama-3.2-1B-Instruct | 1.24B | 128k | safetensors (cuantizado) | other | Version optimizada y cuantizada de unsloth |
| amd/Llama-3.2-1B-Instruct-onnx-ryzenai-hybrid | 1.24B | 128k | ONNX (UINT4) | other | Export ONNX con cuantizacion AWQ para Ryzen AI |

La principal diferencia de este modelo frente a las alternativas es su formato ONNX, que facilita la integracion con ONNX Runtime y plataformas como Windows ML. La variante INT8 dinamica es mas ligera que la FP16, pero puede tener una precision ligeramente inferior. El modelo de AMD ofrece cuantizacion UINT4, aun mas compacta, pero esta orientado a hardware Ryzen AI especifico.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia "other" corresponde a la licencia comunitaria de Meta Llama 3.2, que permite uso comercial solo si la empresa tiene menos de 700 millones de usuarios mensuales. Para uso en grandes plataformas se requiere permiso explicito de Meta.
- Sesgos y alucinaciones: como cualquier modelo de lenguaje, puede generar contenido sesgado o factualmente incorrecto. Se recomienda validar las salidas en aplicaciones criticas.
- Contexto no confirmado: aunque el modelo base soporta 128k tokens, no se ha verificado que el export ONNX mantenga esa longitud en la practica. Es posible que la implementacion de KV-cache en ONNX Runtime limite la ventana efectiva.
- Cuantizacion INT8 sin calibracion: la variante INT8 dinamica se genero sin calibracion, lo que puede degradar la precision en tareas que requieren alta fidelidad numerica.
- Idiomas no documentados: no se especifica que idiomas soporta el export, aunque el modelo base es multilingue. Se recomienda probar con los idiomas objetivo.
- Sin soporte de tool calling nativo: el modelo base no incluye funciones de llamada a herramientas; si se necesita, habria que implementar un wrapper externo.

## Enlaces

- [HuggingFace: liodon-ai/Llama-3.2-1B-Instruct-ONNX](https://huggingface.co/liodon-ai/Llama-3.2-1B-Instruct-ONNX)
- [HuggingFace: liodon-ai/Llama-3.2-1B-Instruct-imatrix-GGUF](https://huggingface.co/liodon-ai/Llama-3.2-1B-Instruct-imatrix-GGUF) (version GGUF del mismo autor)
- [HuggingFace: amd/Llama-3.2-1B-Instruct-onnx-ryzenai-hybrid](https://huggingface.co/amd/Llama-3.2-1B-Instruct-onnx-ryzenai-hybrid) (export ONNX alternativo de AMD)
- [NVIDIA NIM: llama-3.2-1b-instruct](https://build.nvidia.com/meta/llama-3.2-1b-instruct/modelcard) (modelo base en NIM)
- [Ollama: llama3.2:1b](https://ollama.com/library/llama3.2:1b) (modelo base en Ollama)
