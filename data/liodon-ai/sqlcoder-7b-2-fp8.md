# liodon-ai/sqlcoder-7b-2-FP8

## Resumen

SQLCoder-7b-2-FP8 es una cuantización en FP8 del modelo defog/sqlcoder-7b-2, publicada por Liodon AI. El modelo original, desarrollado por Defog, es un modelo de 7 mil millones de parámetros especializado en la generación de consultas SQL a partir de esquemas de bases de datos y preguntas en lenguaje natural. Esta versión cuantizada reduce el peso de 13,5 GB a 7,0 GB manteniendo la arquitectura original basada en Llama.

La cuantización emplea el esquema `FP8_DYNAMIC` mediante la herramienta llm-compressor del proyecto vLLM: los pesos se convierten a FP8 (E4M3) por canal de forma anticipada, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. Al no requerir conjunto de calibración, los pesos cuantizados son una conversión directa de los originales, sin sesgo introducido por datos de calibración. La capa `lm_head` se deja sin cuantizar.

Es relevante para equipos que despliegan generación de SQL en producción y necesitan reducir el consumo de VRAM y aumentar el throughput sin reentrenar. La ejecución FP8 nativa requiere GPU NVIDIA con compute capability ≥ 8.9 (Ada, Hopper o Blackwell); en GPUs anteriores vLLM o TGI descomprimen a un formato de mayor precisión, perdiendo la ventaja de velocidad y memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama) |
| Parametros totales | 6.738.546.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (E4M3) dinámica, pesos por canal y activaciones por token; `lm_head` sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base defog/sqlcoder-7b-2) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base defog/sqlcoder-7b-2 es un transformer decoder-only de la familia Llama con aproximadamente 6.740 millones de parámetros, especializado mediante ajuste fino para la tarea text-to-SQL. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

Esta variante no reentrena el modelo: aplica cuantización post-entrenamiento con llm-compressor bajo el esquema `FP8_DYNAMIC`. Los pesos se castean a FP8 E4M3 por canal de forma estática y las activaciones se cuantizan dinámicamente por token durante la inferencia. Al no usar dataset de calibración, no hay sesgo de calibración en los pesos resultantes. La innovación técnica principal es la reducción de tamaño (de 13,5 GB a 7,0 GB) manteniendo la fidelidad numérica del cast directo, con soporte para ejecución acelerada en vLLM, TGI y SGLang.

## Capacidades

- Generación de consultas SQL a partir de preguntas en lenguaje natural y esquemas de bases de datos (text-to-SQL), tarea principal del modelo base.
- Generación de texto autoregresiva estándar mediante pipeline `text-generation`.
- Compatible con tool calling y function calling a través de los servidores de inferencia (vLLM, TGI), aunque no se documenta entrenamiento específico para ello.
- Ejecución en vLLM, Text Generation Inference (TGI) y SGLang.
- Compatibilidad con endpoints (`endpoints_compatible`) para despliegue como servicio.
- Cuantización FP8 con aceleración nativa en GPUs Ada, Hopper y Blackwell.

## Casos de uso

- Generación automática de SQL en asistentes de analítica: el modelo traduce preguntas de negocio a consultas SQL contra un esquema dado, integrándose en un chatbot interno de datos.
- Herramientas de BI y exploración de datos: generación de consultas ad-hoc para usuarios no técnicos a partir de descripciones en lenguaje natural y el DDL de las tablas.
- Automatización de pipelines ETL: generación de sentencias SQL para transformaciones repetitivas, con validación posterior en un entorno de staging.
- Migración y refactorización de consultas: reescritura de SQL entre dialectos o simplificación de consultas complejas asistida por el modelo.
- Despliegue en producción con VRAM limitada: la cuantización FP8 reduce el peso a 7,0 GB, permitiendo servir el modelo en GPUs de gama profesional (L4, L40S) o consumer de la serie RTX 40 con FP8 nativo.
- Servicio de alta concurrencia: al ejecutarse en vLLM o SGLang con FP8, se obtiene mayor throughput que la versión de 16 bits, adecuado para APIs internas de generación de SQL con múltiples usuarios.
- Generación de documentación y tests de esquemas: creación de consultas de ejemplo y casos de prueba para validar modelos de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,0 GB solo para pesos en FP8; añadir overhead de KV cache y activaciones (estimación práctica de 10-14 GB según longitud de contexto y batch).
- GPU recomendadas con FP8 nativo (compute capability ≥ 8.9): RTX 40-series (4090, 4080), L4, L40S, H100, H200, B100, B200, GB10.
- En GPUs anteriores (Ampere, Turing), vLLM/TGI descomprimen el modelo para ejecutar, perdiendo la ventaja de velocidad y memoria; el modelo sigue siendo funcional pero sin aceleración FP8.
- Cabe en GPU consumer: sí, en RTX 4090 y RTX 4080 con FP8 nativo; en GPUs de 16 GB o más en general.
- Opciones de despliegue: vLLM (`vllm serve`), Text Generation Inference (TGI, imagen Docker oficial), SGLang (`sglang.launch_server`).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/sqlcoder-7b-2-FP8 | 6.738.546.688 | no disponible | FP8 dinámica | other | HuggingFace |
| defog/sqlcoder-7b-2 | ~7B | no disponible | BF16/FP16 original | other | HuggingFace |
| defog/sqlcoder-7b | ~7B | no disponible | BF16/FP16 original | other | HuggingFace |

La comparativa se limita al modelo base y su versión anterior, ya que la información proporcionada no incluye datos de rendimiento ni especificaciones detalladas de alternativas de otros autores.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está ajustado para text-to-SQL; su rendimiento en tareas generales de generación de texto es inferior al de modelos de propósito general del mismo tamaño.
- Riesgo de alucinación: puede generar columnas, tablas o funciones SQL inexistentes en el esquema proporcionado; se recomienda validación sintáctica y semántica antes de ejecutar consultas.
- Sesgos: no se documentan sesgos específicos, pero al derivar de un modelo entrenado con datos web y de código, puede heredar sesgos de esos corpus.
- Idiomas: no se especifican los idiomas soportados; el modelo base está orientado principalmente al inglés en esquemas y preguntas.
- Licencia "other": no se detallan los términos exactos; es imprescindible revisar la licencia del modelo base defog/sqlcoder-7b-2 antes de uso comercial.
- Ejecución FP8: sin GPU con compute capability ≥ 8.9 se pierde la ventaja de rendimiento; el modelo se descomprime y opera como una versión de mayor precisión.
- Longitud de contexto no documentada: no hay dato oficial en la información disponible, lo que limita la planificación de despliegues con esquemas extensos.
- Repo con bajo número de descargas (18) y sin likes: menor validación comunitaria que el modelo base original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liodon-ai/sqlcoder-7b-2-FP8
- Modelo base: https://huggingface.co/defog/sqlcoder-7b-2
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
- Perfil del autor: https://huggingface.co/liodon-ai
