# greghavens/Qwen3.8-27B-bnb-4bit

## Resumen

Qwen3.8-27B-bnb-4bit es una cuantización de 4 bits en formato NF4 (Normal Float 4) del modelo multimodal denso Qwen3.8-27B, desarrollado por el equipo Qwen de Alibaba. Esta versión cuantizada, publicada por el usuario greghavens en Hugging Face, reduce el tamaño del checkpoint de aproximadamente 55 GB (en bf16) a 18,6 GB, lo que permite ejecutar el modelo en una única GPU con 24 GB de VRAM y facilita el fine-tuning mediante QLoRA con la librería `peft`.

El modelo base Qwen3.8-27B es un transformer denso de 27 000 millones de parámetros con capacidades nativas de visión y lenguaje, diseñado para tareas de razonamiento, generación de código, flujos de trabajo agénticos y automatización de oficina. Esta cuantización mantiene la torre de visión, `lm_head` y las embeddings de entrada en bfloat16, mientras cuantiza únicamente las capas lineales del modelo de lenguaje, logrando una pérdida de perplejidad de solo el 1,14 % en wikitext-2. Es una opción práctica para desarrolladores que necesitan ejecutar el modelo en hardware de consumo o adaptarlo con técnicas de fine-tuning eficiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language) |
| Parametros totales | 27 356 728 560 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (del modelo base) |
| Tipos de cuantizacion | NF4 4-bit (bitsandbytes), con doble cuantizacion y compute dtype bfloat16 |
| Idiomas soportados | Ingles (segun la model card; el modelo base puede soportar mas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (con capas `Linear4bit` de bitsandbytes) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino una cuantizacion del checkpoint oficial `Qwen/Qwen3.8-27B` (revision `1d4bf0f`). La receta de cuantizacion utiliza `BitsAndBytesConfig` con `load_in_4bit=True`, tipo de cuantizacion NF4, doble cuantizacion activada, `compute_dtype` en bfloat16 y almacenamiento en `uint8`. Se excluyen de la cuantizacion la torre de vision (`model.visual`), `lm_head` y las embeddings de entrada, que permanecen en bfloat16. El proceso es data-free (sin calibracion) y reproducible, habiendo sido ejecutado en CPU en 302 segundos.

El modelo base Qwen3.8-27B es un transformer denso multimodal que procesa imagenes y texto de forma nativa. Segun la documentacion oficial, esta optimizado para tareas de codigo, flujos agénticos y automatizacion de oficina, con una ventana de contexto de 262 144 tokens. La cuantizacion no altera la arquitectura subyacente, solo la representacion de los pesos.

## Capacidades

- Generacion de texto y respuestas a partir de instrucciones en lenguaje natural.
- Comprension de imagenes: el modelo acepta entradas visuales y puede describir su contenido, responder preguntas sobre ellas o extraer informacion.
- Razonamiento multimodal: combina informacion visual y textual para tareas complejas.
- Generacion de codigo: soporta la creacion de fragmentos de codigo en diversos lenguajes de programacion.
- Flujos de trabajo agénticos: el modelo base esta disenado para tareas de agente, incluyendo planificacion y ejecucion de multiples pasos.
- Soporte de tool calling / function calling: el modelo base incluye capacidades de llamada a herramientas, que se conservan en la cuantizacion.
- Contexto largo: 262 144 tokens, adecuado para documentos extensos o conversaciones de multiples turnos.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens) y, gracias a su capacidad de tool calling, puede consultar bases de conocimiento o sistemas de tickets en tiempo real.
- Generacion de codigo en produccion: integrable en pipelines de CI/CD para autocompletar o revisar codigo, aprovechando su entrenamiento especifico en tareas de programacion y su bajo requisito de VRAM (18,6 GB) en entornos con GPUs de 24 GB.
- Analisis de documentos con imagenes: el modelo puede procesar capturas de pantalla, diagramas o fotografias junto con texto, util para extraer datos de facturas, informes o manuales tecnicos.
- Automatizacion de oficina: el modelo base esta optimizado para tareas como redaccion de correos, resumen de reuniones o generacion de presentaciones, y esta cuantizacion permite ejecutarlo en estaciones de trabajo con una sola GPU.
- Desarrollo de agentes de IA: gracias a su soporte de tool calling y razonamiento multi-paso, puede usarse como base para agentes que interactuan con APIs, navegadores o entornos de terminal.
- Fine-tuning con QLoRA: al estar en formato NF4, es el punto de partida ideal para adaptar el modelo a dominios especificos (medicina, legal, etc.) con pocos recursos, usando `peft` y `bitsandbytes`.

## Benchmarks y rendimiento

La model card proporciona un unico dato de rendimiento: perplejidad en wikitext-2 con ventanas de 4096 tokens.

| Metrica | Valor cuantizado (NF4) | Valor bf16 | Diferencia |
|---|---|---|---|
| Perplejidad wikitext-2 | 6,5571 | 6,4833 | +1,14 % |

No se han publicado resultados de benchmarks adicionales especificos de esta cuantizacion. El modelo base Qwen3.8-27B, segun la busqueda web, alcanza puntuaciones de DeepSWE 42,2, Terminal Bench 73,0 y OSWorld 84,3, pero estos datos corresponden al checkpoint original en bf16 y no han sido verificados en la version cuantizada.

## Requisitos de hardware

- VRAM estimada: 18,6 GB para el checkpoint completo; la model card indica que carga en 18,58 GB de VRAM, por lo que cabe en GPUs de 24 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100, L40S o cualquier GPU con al menos 24 GB de memoria y soporte para bitsandbytes (CUDA o ROCm).
- En GPUs Blackwell, la model card sugiere usar las versiones NVFP4 o FP8 de unsloth o Qwen para mayor velocidad en inferencia; NF4 es preferible para fine-tuning con QLoRA.
- Despliegue: compatible con `transformers` + `bitsandbytes` mediante `AutoModelForImageTextToText`. No se menciona soporte explicito para vLLM, llama.cpp u Ollama en la model card, aunque al ser un formato estandar de safetensors podria adaptarse.
- Latencia y throughput: no se proporcionan datos especificos; depende del hardware y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | VRAM estimada | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (bf16) | 27,36 B | 262K | Safetensors bf16 | ~55 GB | Apache 2.0 |
| Qwen3.8-27B-bnb-4bit (este repo) | 27,36 B | 262K | NF4 4-bit | 18,6 GB | Apache 2.0 |
| Qwen3.8-27B-FP8 | 27,36 B | 262K | FP8 | ~28 GB (estimado) | Apache 2.0 |
| Qwen3.8-27B-NVFP4 (unsloth) | 27,36 B | 262K | NVFP4 | ~18 GB (estimado) | Apache 2.0 |

La cuantizacion NF4 ofrece el mismo rendimiento funcional que el modelo base, con una perdida minima de perplejidad, a cambio de una menor precision numerica. Las versiones FP8 y NVFP4 pueden ser mas rapidas en hardware Blackwell, pero NF4 es la opcion estandar para QLoRA.

## Limitaciones y advertencias

- La cuantizacion introduce una perdida de precision del 1,14 % en perplejidad; en tareas sensibles a la exactitud (por ejemplo, calculos numericos) puede ser recomendable usar el modelo en bf16 o FP8.
- La torre de vision se mantiene en bf16 deliberadamente: cuantizar las capas visuales con NF4 producia una variacion de hasta el 22 % en las embeddings de imagen, aunque no se ha medido el impacto real en benchmarks de VQA.
- El modelo esta documentado principalmente en ingles; no se especifican capacidades multilingues en esta cuantizacion, aunque el modelo base podria soportar otros idiomas.
- Requiere `bitsandbytes` y un acelerador compatible; en CPUs no se puede ejecutar la inferencia de forma eficiente.
- No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, etc.) para esta version cuantizada, por lo que su rendimiento en tareas especificas no esta verificado.
- Al ser una cuantizacion data-free, no hay riesgo de sobreajuste a datos de calibracion, pero tampoco se ha optimizado para ningun dominio concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/greghavens/Qwen3.8-27B-bnb-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guia completa del modelo (blog): https://lovableapp.org/blog/qwen3-8-27b
- Version NVFP4 (unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Version FP8: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
