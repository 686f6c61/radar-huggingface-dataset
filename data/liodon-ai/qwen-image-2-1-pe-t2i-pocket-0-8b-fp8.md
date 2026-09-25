# liodon-ai/Qwen-Image-2.1-PE-T2I-Pocket-0.8B-FP8

# Qwen-Image-2.1-PE-T2I-Pocket-0.8B-FP8

## Resumen

`liodon-ai/Qwen-Image-2.1-PE-T2I-Pocket-0.8B-FP8` es una cuantizacion en FP8 del modelo de texto `ML-Intern-lab/Qwen-Image-2.1-PE-T2I-Pocket-0.8B`, publicada por Liodon AI. La cuantizacion se ha realizado con `llm-compressor` bajo el esquema `FP8_DYNAMIC`: los pesos se convierten a FP8 (E4M3) por canal antes de la inferencia y las activaciones se cuantizan dinamicamente por token en tiempo de ejecucion, sin necesidad de dataset de calibracion. El resultado reduce el peso del repositorio de 1,5 GB a 1,0 GB con 752.393.024 parametros.

Se trata de un modelo de generacion de texto (pipeline `text-generation`, etiqueta de arquitectura `qwen3_5_text`) de tamano reducido, etiquetado como conversacional y compatible con endpoints de inferencia. Su nombre lo vincula a la familia Qwen-Image-2.1, cuyo componente de generacion visual descrito publicamente cuenta con 7B de parametros y 32 capas Single-Stream DiT; sin embargo, la informacion disponible no detalla el papel exacto de este componente de 0,8B dentro de esa familia ni sus datos de entrenamiento.

La relevancia practica de esta publicacion es de despliegue: permite servir un modelo de texto de 0,75B en FP8 con vLLM, TGI o SGLang aprovechando las unidades de FP8 de las GPU NVIDIA con compute capability 8.9 o superior (Ada, Hopper, Blackwell), con una huella de memoria en pesos de aproximadamente 0,8 GB. En GPU anteriores, los motores de inferencia desquantizan el modelo y se pierde la ventaja de velocidad y memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de texto (etiqueta `qwen3_5_text`); numero de capas, tipo de atencion y dimensiones no disponibles |
| Parametros totales | 752.393.024 (0,75 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (E4M3) dinamica, esquema `FP8_DYNAMIC` de llm-compressor: pesos en FP8 por canal, activaciones en FP8 por token; `lm_head` sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other (terminos no detallados en la informacion disponible) |
| Formato de pesos | safetensors con esquema compressed-tensors |
| Tamano del repositorio | 1,0 GB (modelo original: 1,5 GB) |
| Libreria y pipeline | transformers; text-generation |
| Hardware requerido para FP8 nativo | GPU NVIDIA con compute capability >= 8.9 (Ada, Hopper, Blackwell) |
| Fecha de publicacion | 24 de septiembre de 2026 |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base mas alla de la etiqueta `qwen3_5_text`, que apunta a un transformer de texto de la familia Qwen. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. El unico dato estructural cierto es el recuento de parametros en safetensors: 752.393.024.

La innovacion tecnica de esta publicacion es exclusivamente la cuantizacion. Se aplica `FP8_DYNAMIC`: los pesos se castean a FP8 (E4M3) por canal de forma anticipada, mientras que las activaciones se cuantizan dinamicamente por token durante la inferencia. Al no requerir conjunto de calibracion, los pesos cuantizados son un casteo directo de los originales, sin sesgo introducido por la muestra de calibracion. La capa `lm_head` se deja sin cuantizar, practica habitual por su tamano reducido y su impacto desproporcionado en la calidad final.

## Capacidades

- Generacion de texto autoregresiva y uso conversacional, segun las etiquetas del repositorio (`conversational`, `text-generation`).
- Compatibilidad declarada con endpoints de inferencia (`endpoints_compatible`) y con los motores vLLM, TGI y SGLang.
- Ejecucion en precision FP8 nativa en GPU Ada, Hopper y Blackwell.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponibles.
- Relacion funcional con generacion de imagenes: el nombre del modelo base sugiere un componente asociado a un pipeline texto-a-imagen, pero la informacion disponible no confirma su funcion concreta.

## Casos de uso

- Servicio de texto de bajo coste en GPU de gama media: con 752 millones de parametros en FP8, el modelo ocupa aproximadamente 0,8 GB en pesos, por lo que puede servirse con vLLM en una RTX 4070, L4 o L40S dejando el resto de la VRAM para el cache KV y el procesamiento por lotes.
- Preprocesado y normalizacion de prompts en pipelines texto-a-imagen: si el componente actua como capa de tratamiento de prompts, encaja delante de un modelo de difusion para reescribir, expandir o estructurar la peticion del usuario antes de la generacion visual.
- Asistentes conversacionales de baja latencia en despliegues locales: la combinacion de 0,75B de parametros y cuantizacion FP8 permite respuestas interactivas en hardware de escritorio o en el borde, sin depender de API externas.
- Clasificacion y extraccion de informacion a gran escala: al ser un modelo pequeno con pesos de 1,0 GB, se puede escalar horizontalmente con multiples replicas en una sola GPU para procesar volumenes altos de documentos.
- Generacion de texto estructurado en pipelines de datos: produccion de JSON, plantillas o campos normalizados dentro de flujos ETL, con la ventaja de un coste de memoria muy bajo por replica.
- Evaluacion automatica en integracion continua: uso como juez barato o generador de casos de prueba en pipelines de CI de aplicaciones LLM, donde no se requiere maxima calidad sino consistencia y bajo coste.
- Prototipado y ajuste fino: al ser un modelo de 0,75B en safetensors, es viable experimentar con fine-tuning o LoRA en una unica GPU consumer antes de escalar a un modelo mayor.
- Despliegue offline o air-gapped: los 1,0 GB de pesos permiten distribuir el modelo en entornos sin conectividad y ejecutarlo con llama.cpp, Ollama o transformers en modo local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni del modelo base ni de la version cuantizada. Tampoco se documenta la perdida de calidad atribuible a la cuantizacion FP8.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,8 GB solo en pesos FP8. Con overhead del motor de inferencia, activaciones y cache KV, el consumo realista se situa en torno a 1,5-2,5 GB para lotes pequenos y contextos cortos (estimacion propia, no confirmada por el autor).
- GPU recomendadas para FP8 nativo: NVIDIA RTX 40 y 50 series, L4, L40S, H100, H200, B100, B200 y GB10, todas con compute capability >= 8.9.
- GPU no compatibles con FP8 nativo: arquitecturas Ampere, Turing o anteriores. En estos casos vLLM y TGI desquantizan el modelo para ejecutarlo, con lo que se pierde la mejora de velocidad y memoria.
- GPU consumer: cabe sin problemas en cualquier GPU con 4 GB o mas de VRAM, incluidas RTX 3060, RTX 4060, RTX 4070 y equivalentes, especialmente si se ejecuta en modo desquantizado.
- Opciones de despliegue documentadas: `vllm serve`, contenedor de Text Generation Inference, `python -m sglang.launch_server` y carga directa con transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Precision | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| liodon-ai/Qwen-Image-2.1-PE-T2I-Pocket-0.8B-FP8 | 752.393.024 | 1,0 GB | FP8 (E4M3) dinamica | no disponible | other | HuggingFace |
| ML-Intern-lab/Qwen-Image-2.1-PE-T2I-Pocket-0.8B (base) | 752.393.024 | 1,5 GB | no disponible | no disponible | other | HuggingFace |
| Qwen/Qwen-Image-2.1-PE-T2I | no disponible | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Qwen-Image-2.1 (generacion de imagen) | 7B en el componente visual (32 capas Single-Stream DiT) | no disponible | no disponible | no disponible | no disponible | GitHub y HuggingFace |

No se han identificado otras cuantizaciones FP8 publicadas del mismo modelo base, ni datos de rendimiento comparado con alternativas de la misma categoria de tamano.

## Limitaciones y advertencias

- Licencia `other` sin terminos detallados: no se especifican las condiciones de uso comercial. Es imprescindible revisar la licencia del modelo base antes de cualquier despliegue en produccion.
- Ausencia total de benchmarks: no hay evidencia publicada sobre la calidad del modelo ni sobre la degradacion introducida por la cuantizacion FP8.
- Longitud de contexto, idiomas soportados y capacidades de tool calling no documentados: cualquier uso que dependa de estos parametros requiere validacion empirica previa.
- Modelo de 0,75B de parametros: capacidad limitada para razonamiento complejo, matematicas avanzadas o generacion de codigo extensa, con riesgo elevado de alucinacion en dominios especializados.
- La cuantizacion FP8 solo aporta ventajas reales en GPU con compute capability >= 8.9; en hardware anterior el motor desquantiza el modelo y el beneficio desaparece.
- Sin validacion comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existen reportes independientes de comportamiento.
- El proceso de cuantizacion no incluye evaluacion de calidad diferencial frente al modelo original; el autor asume que el casteo directo sin calibracion preserva las capacidades, pero no lo demuestra con mediciones.
- Sesgos conocidos del modelo base: no disponibles en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liodon-ai/Qwen-Image-2.1-PE-T2I-Pocket-0.8B-FP8
- Modelo base: https://huggingface.co/ML-Intern-lab/Qwen-Image-2.1-PE-T2I-Pocket-0.8B
- Qwen-Image-2.1-PE-T2I en HuggingFace: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-T2I
- Repositorio GitHub de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- Blog de Qwen-Image-2.1: https://qwen.ai/blog?id=qwen-image-2.1
- Imagen Docker `ai/qwen-image-2.1`: https://hub.docker.com/r/ai/qwen-image-2.1
- llm-compressor (herramienta de cuantizacion): https://github.com/vllm-project/llm-compressor
