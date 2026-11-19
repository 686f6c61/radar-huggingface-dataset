# nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B

## Resumen

NVIDIA-Nemotron-3.5-Transcribe-30B-A4B es un modelo de voz y audio de pesos abiertos desarrollado por NVIDIA, disenado para transcripcion multilingue offline. Se trata de un Speech-Augmented Language Model (SALM) que procesa grabaciones de audio junto con instrucciones de texto y contexto opcional para generar respuestas textuales. El modelo cubre 40 idiomas, admite grabaciones de hasta una hora de duracion y opera con una ventana de contexto de 65.536 tokens.

La arquitectura combina un language model hibrido Mamba-2/Transformer con mezcla de expertos (MoE) y un Parallel Expert Encoder que integra un encoder ASR de tipo Transformer y un encoder de hablante. Con 34.000 millones de parametros totales y aproximadamente 4.300 millones activos (incluyendo el encoder de audio), el modelo esta pensado para despliegues eficientes en precision reducida, con variantes publicadas en BF16, FP8 y NVFP4.

Su relevancia actual radica en que unifica en un solo modelo tareas que tradicionalmente requerian pipelines separados: transcripcion, traduccion de voz, diarizacion de hablantes, prediccion de marcas temporales, identificacion de idioma, deteccion de cambio de codigo y respuesta a preguntas sobre audio. Ademas, se distribuye con licencia OpenMDW-1.1 y esta autorizado para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-2–Transformer hybrid Mixture of Experts con Parallel Expert Encoder (encoder ASR Transformer + encoder de hablante) |
| Parametros totales | 33.697.781.029 (34B, incluye encoder de audio) |
| Parametros activos | ~4.3B (incluye encoder de audio) |
| Longitud de contexto | 65.536 tokens; grabaciones de hasta 1 hora |
| Tipos de cuantizacion | BF16 (referencia), FP8, NVFP4 |
| Idiomas soportados | 40 idiomas: cs, nl, en, fr, de, hi, it, ko, pl, pt, ru, sk, es, bg, hr, da, et, fi, hu, ja, lv, lt, ro, sl, sv, th, tr, uk, ar, bn, zh, el, he, id, mt, mr, tl, ta, te, vi |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial permitido) |
| Formato de pesos | safetensors (libreria NeMo) |

## Arquitectura y entrenamiento

El modelo es un SALM construido sobre el language model NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, que emplea una arquitectura hibrida Mamba-2/Transformer con mezcla de expertos. A este backbone se le acopla un Parallel Expert Encoder compuesto por un encoder ASR de tipo Transformer y un encoder de hablante, lo que permite procesar audio y texto de forma conjunta. La activacion de aproximadamente 4.300 millones de parametros sobre 34.000 millones totales hace que el coste computacional por token sea notablemente inferior al de un modelo denso del mismo tamano.

El entrenamiento se realizo sobre el dataset nvidia/Granary-v2, una mezcla que cubre tareas de transcripcion multilingue, traduccion de voz, transcripcion contextual, transcripcion con atribucion de hablante, transcripcion enriquecida, prediccion de marcas temporales, identificacion de idioma y respuesta a preguntas sobre audio. La mezcla incluye ademas una pequena proporcion de tareas de seguimiento de instrucciones textuales y de etiquetado/redaccion de PII. No se dispone en la informacion proporcionada de detalles sobre el numero exacto de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Transcripcion de voz a texto multilingue en 40 idiomas, incluyendo grabaciones de hasta una hora.
- Traduccion de voz (speech translation) entre idiomas.
- Transcripcion contextual: permite pasar contexto textual para mejorar el reconocimiento de terminos especificos.
- Transcripcion con atribucion de hablante (speaker-attributed transcription) y diarizacion.
- Transcripcion enriquecida (rich transcription) con informacion adicional estructurada.
- Prediccion de marcas temporales (timestamps) a nivel de palabra o segmento.
- Identificacion de idioma (language identification) y manejo de cambio de codigo (code-switching).
- Respuesta a preguntas sobre audio (audio question answering).
- Seguimiento de instrucciones de texto para controlar el estilo y formato de la salida.
- Etiquetado y redaccion de PII en el texto transcrito.
- Capacidad de procesar instrucciones y audio de forma conjunta mediante prompts.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo puede procesar grabaciones de hasta una hora con diarizacion y marcas temporales, generando transcripciones atribuidas a cada hablante listas para actas o busquedas posteriores.
- Subtitulado y localizacion de video: combinando transcripcion, timestamps y traduccion de voz, se puede generar subtitulos multilingues en un solo paso para plataformas de contenido.
- Atencion al cliente y analisis de llamadas: la transcripcion con atribucion de hablante y el etiquetado de PII permiten procesar grabaciones de call centers cumpliendo requisitos de privacidad y alimentar analitica de calidad.
- Investigacion cualitativa y entrevistas: transcripcion de entrevistas largas en multiples idiomas con marcas temporales para facilitar el analisis y la citacion precisa de fragmentos.
- Accesibilidad y documentacion clinica: conversion de notas de voz o consultas grabadas en texto estructurado, con redaccion de datos personales para su uso en entornos regulados.
- Analisis de contenido audiovisual a gran escala: respuesta a preguntas sobre audio (por ejemplo, "que se dijo sobre el presupuesto?") para indexacion semantica de archivos de audio y video.
- Cumplimiento normativo y auditoria: identificacion de idioma, deteccion de cambio de codigo y redaccion de PII en grabaciones para revisiones de cumplimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los 34B parametros requieren aproximadamente 68 GB solo para pesos, mas overhead de activaciones y cache; en FP8, alrededor de 34 GB; en NVFP4, aproximadamente 17-20 GB, aunque el soporte efectivo depende del runtime.
- GPU recomendadas: H100 (80 GB) o A100 (80 GB) para BF16; GPUs con 40-48 GB para FP8; GPUs consumer de gama alta (RTX 4090 con 24 GB) podrian ejecutar variantes NVFP4, sujeto a soporte del stack.
- Cabe en GPU consumer: posible con cuantizacion NVFP4 en GPUs de 24 GB, condicionado a la disponibilidad de kernels y al framework de inferencia.
- Opciones de despliegue: NeMo Speech (libreria nativa), SGLang-Omni, y despliegue en Azure segun los tags del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparativas con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Al ser un modelo de transcripcion, puede producir errores en audio con ruido, solapamiento de hablantes o acentos poco representados en el entrenamiento.
- Riesgo de alucinacion en la generacion de texto, especialmente en segmentos de audio ininteligibles o silencios largos.
- La cobertura de 40 idiomas no implica el mismo rendimiento en todos ellos; los idiomas con menos datos pueden presentar mayor tasa de error.
- El contexto esta limitado a 65.536 tokens y a grabaciones de hasta una hora; audios mas largos requieren segmentacion.
- La licencia OpenMDW-1.1 permite uso comercial, pero conviene revisar sus terminos completos para obligaciones de atribucion o redistribucion.
- El modelo esta disenado para inferencia offline; no se especifican garantias de latencia en tiempo real.
- No se dispone de informacion sobre sesgos especificos ni sobre evaluaciones de robustez en la documentacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Variante FP8: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-FP8
- Variante NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-NVFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Pagina de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Repositorio NeMo Speech: https://github.com/NVIDIA-NeMo/Speech
- Informe tecnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Transcribe-Technical-Report.pdf
- Demo en vivo: https://huggingface.co/spaces/nvidia/nemotron-transcribe
- Guia SGLang-Omni: https://sgl-project.github.io/sglang-omni/cookbook/nemotron_transcribe.html
- Dataset Granary-v2: https://huggingface.co/datasets/nvidia/Granary-v2
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Discord NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Paper SALM: https://arxiv.org/abs/2310.09424
