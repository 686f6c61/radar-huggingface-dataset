# dudeman2512/Qwen3.8-27B-NVFP4

## Resumen

El modelo `dudeman2512/Qwen3.8-27B-NVFP4` es una cuantización de 4 bits en coma flotante (NVFP4) del modelo multimodal Qwen3.8-27B de Alibaba, producida por el usuario dudeman2512 mediante la librería `compressed-tensors` de Neural Magic. El proceso de cuantización se realizó transmitiendo el checkpoint tensor a tensor, sin instanciar el modelo completo en memoria, lo que permite reducir el tamaño del modelo a aproximadamente 19,3 GB, un 35% del peso original en BF16 (que ocuparía unos 55 GB). Esta reducción facilita la ejecución del modelo en GPUs de consumo con 24 GB de VRAM, como una RTX 4090, manteniendo un error relativo medio de 0,0950 frente a los pesos originales.

El modelo base Qwen3.8-27B es un transformer denso multimodal con capacidades de visión y lenguaje, un contexto de 256K tokens y soporte para tareas de codificación agéntica, razonamiento y automatización de oficina. La cuantización NVFP4 utiliza grupos de 16 pesos con escala de grupo FP8 y una escala global por tensor, un formato diseñado para acelerar la inferencia en hardware Blackwell de NVIDIA. Esta variante es especialmente relevante para desarrolladores que necesitan desplegar un modelo multimodal de 27B parámetros en entornos con memoria limitada, sin renunciar a la calidad de las respuestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-lenguaje), basado en Qwen3.8-27B |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (segun documentacion de Qwen3.8; no especificado en la model card) |
| Tipos de cuantizacion | NVFP4 (4-bit float, grupo de 16, escala FP8 por grupo y escala global por tensor) |
| Idiomas soportados | No especificado en la model card; el modelo base Qwen3.8-27B es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato `nvfp4-pack-quantized`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.8-27B de Alibaba, un transformer denso multimodal que acepta entradas de texto e imagen, con una ventana de contexto de 256K tokens y capacidades de razonamiento y agencia. No se dispone de detalles sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset o tecnicas de alineacion como RLHF/DPO) en la informacion proporcionada.

La cuantizacion NVFP4 fue realizada con `compressed-tensors` mediante un proceso de streaming: cada tensor se cuantiza y verifica individualmente antes de publicarse, garantizando que no haya fallos de conformidad de forma ni dtype. Se cuantizaron las 615 capas lineales del modelo, dejando 0 en BF16. El formato NVFP4 almacena pesos en 4 bits con agrupacion de 16 elementos, una escala de grupo FP8 y una escala global por tensor. Este esquema ofrece un equilibrio entre compresion y fidelidad: el error relativo medio es de 0,0950, significativamente menor que el de una cuantizacion int4 (0,1178) y solo ligeramente superior al de FP8 (0,0264), pero con un tamaño casi un 37% menor que FP8.

## Capacidades

- Generacion de texto y razonamiento de proposito general, incluyendo tareas de matematicas y logica (segun las capacidades del modelo base).
- Procesamiento de imagenes: entrada multimodal con comprension visual (captioning, respuesta a preguntas visuales).
- Codificacion agéntica: el modelo base destaca en tareas de programacion autonoma y uso de herramientas.
- Soporte de tool calling y function calling, integrable en pipelines de agentes (segun la documentacion oficial de Qwen3.8).
- Contexto largo de 256K tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Compatible con decodificacion especulativa (MTP) en hardware Blackwell, lo que mejora la latencia de inferencia (mencionado en el tutorial de despliegue en DGX Spark).
- Capacidades multilingues heredadas del modelo base, aunque no se detallan los idiomas concretos.

## Casos de uso

- Inferencia local en GPU de consumo: con 19,3 GB de pesos, el modelo cabe en una RTX 4090 de 24 GB, permitiendo ejecutar un multimodal de 27B en un equipo de escritorio sin necesidad de hardware de datacenter.
- Despliegue en produccion con vLLM: el formato NVFP4 es compatible con vLLM, lo que permite servir el modelo con alto throughput y baja latencia en entornos de API.
- Asistentes de codificacion agéntica: el modelo puede gestionar tareas de programacion multi-paso, como generar codigo, ejecutar pruebas y corregir errores, gracias a su soporte de tool calling y razonamiento.
- Automatizacion de oficina: procesamiento de documentos con imagenes y texto, extraccion de informacion, generacion de informes y resumenes de contenido largo.
- Sistemas de respuesta a preguntas visuales (VQA): integracion en aplicaciones que requieren entender imagenes y responder consultas en lenguaje natural.
- Agentes conversacionales con memoria extensa: su ventana de 256K tokens permite mantener conversaciones largas con historial completo, ideal para atencion al cliente o tutoria.
- Prototipado rapido en entornos con recursos limitados: la cuantizacion permite experimentar con un modelo de 27B en maquinas con 24-32 GB de RAM/VRAM, reduciendo costes de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion en la informacion disponible. La model card solo proporciona el error relativo medio de la cuantizacion (0,0950 frente a BF16) y el tamaño en disco. Para el modelo base Qwen3.8-27B, fuentes externas (como la guia de Lovable) citan resultados en DeepSWE (42,2), Terminal Bench (73,0) y OSWorld (84,3), pero estos datos no estan verificados en la documentacion oficial de la cuantizacion y no se incluyen aqui para evitar confusiones.

La siguiente tabla resume las variantes de cuantizacion del mismo modelo, segun la model card:

| Variante | Formato | Tamano | Error relativo medio | Lineales cuantizados |
|---|---|---|---|---|
| Qwen3.8-27B-FP8 | float-quantized | 30,35 GB | 0,0264 | 615 |
| Qwen3.8-27B-NVFP4 | nvfp4-pack-quantized | 19,29 GB | 0,0950 | 615 |
| Qwen3.8-27B-int4 | pack-quantized | 18,31 GB | 0,1178 | 588 |

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 20 GB para cargar los pesos en memoria (19,29 GB en disco) mas overhead de activaciones y cache KV. Con contexto de 256K, la cache KV puede superar los 8 GB adicionales, por lo que se recomienda al menos 32 GB de VRAM para uso intensivo.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 6000 Ada (48 GB), A100 40/80 GB, H100, o cualquier GPU Blackwell con soporte nativo para NVFP4 (como B200 o DGX Spark).
- En GPU de consumo, cabe en RTX 4090 y modelos superiores; no cabe en RTX 3080 (10 GB) ni en GPUs con menos de 20 GB.
- Opciones de despliegue: vLLM (compatible directamente), llama.cpp (probablemente compatible con GGUF, aunque no se menciona en la model card), y servidores basados en `compressed-tensors`.
- Latencia y throughput: no se proporcionan datos medidos. El uso de decodificacion especulativa (MTP) en hardware Blackwell puede reducir la latencia de generacion, pero no hay cifras concretas en la informacion disponible.

## Comparativa con modelos similares

La comparativa mas directa es con las otras cuantizaciones del mismo modelo base, ya que no se dispone de datos de modelos comparables de otros fabricantes en la informacion proporcionada.

| Modelo | Parametros | Contexto | Tamano | Error relativo | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16 original) | 27,8B | 256K | ~55 GB | 0 | Apache 2.0 |
| Qwen3.8-27B-FP8 | 27,8B | 256K | 30,35 GB | 0,0264 | Apache 2.0 |
| Qwen3.8-27B-NVFP4 | 27,8B | 256K | 19,29 GB | 0,0950 | Apache 2.0 |
| Qwen3.8-27B-int4 | 27,8B | 256K | 18,31 GB | 0,1178 | Apache 2.0 |

Frente a otras alternativas de 27B en el mercado, como Llama 3.3-70B (que es mas grande) o Mistral Large 2 (123B), Qwen3.8-27B ofrece un mejor equilibrio entre capacidad y requisitos de hardware, pero no se dispone de comparativas de rendimiento directas en la informacion disponible.

## Limitaciones y advertencias

- Error de cuantizacion: el error relativo medio de 0,0950 es moderado; puede afectar a tareas que requieren precision numerica alta, como calculos matematicos complejos o razonamiento logico detallado.
- Posible degradacion en tareas de vision: al cuantizar todas las capas lineales, la calidad de la comprension visual puede verse reducida en comparacion con el modelo BF16.
- Sesgos y alucinaciones: no se dispone de evaluaciones especificas para esta cuantizacion; se heredan los riesgos del modelo base, que no estan documentados en la model card.
- Limitaciones de idioma: la model card no especifica los idiomas soportados; aunque el modelo base es multilingue, la cuantizacion podria afectar a lenguas con menos representacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones significativas, pero se recomienda revisar los terminos del modelo base.
- Compatibilidad de hardware: el formato NVFP4 esta optimizado para GPUs Blackwell; en hardware anterior (Ampere, Ada) puede requerir conversion a otro formato o presentar menor rendimiento.
- No se garantiza la compatibilidad con todas las librerias de inferencia; la model card solo confirma vLLM como opcion de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dudeman2512/Qwen3.8-27B-NVFP4
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Documentacion de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Tutorial de despliegue en DGX Spark: https://github.com/Deep-AI-Evo/qwen3.8-27b-nvfp4-dgx-spark-tutorial
- Guia de referencia sobre Qwen3.8-27B (fuente externa): https://lovableapp.org/blog/qwen3-8-27b
