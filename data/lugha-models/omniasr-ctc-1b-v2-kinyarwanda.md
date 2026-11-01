# Lugha-Models/omniASR-CTC-1B-v2-kinyarwanda

## Resumen

omniASR-CTC-1B-v2-kinyarwanda es un modelo de reconocimiento automatico del habla (ASR) especializado en kinyarwanda, desarrollado por Lugha-Models como un ajuste fino (fine-tune) del modelo base `aadel4/omniASR-CTC-1B-v2`. Se trata de un modelo de aproximadamente 975 millones de parametros construido sobre la arquitectura wav2vec2 con cabeza CTC (Connectionist Temporal Classification), empaquetado en formato safetensors y consumible directamente mediante la libreria `transformers`.

El modelo resuelve un problema concreto y poco cubierto: la transcripcion de voz en kinyarwanda, un idioma de bajos recursos con escasa representacion en los sistemas ASR comerciales y en los modelos multilingues de gran escala. Al partir de un modelo omniASR de ~1B de parametros y especializarlo mediante fine-tuning supervisado sobre corpus especificos de kinyarwanda (Afrivoice_Kinyarwanda y Common Voice 22.0), el modelo busca mejorar la precision en este idioma frente al modelo base multilingue.

Es relevante ahora porque la combinacion de arquitecturas CTC eficientes con modelos de tamano medio (~1B) permite despliegues de ASR en produccion con requisitos de hardware moderados, y porque la comunidad de modelos para lenguas africanas esta empezando a publicar artefactos especializados. La licencia Apache 2.0 facilita su adopcion comercial, aunque el acceso al repositorio esta restringido (gated) y requiere aceptar condiciones en HuggingFace. No se dispone de informacion publicada sobre benchmarks, datos exactos de entrenamiento ni metricas de rendimiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 con cabeza CTC (Connectionist Temporal Classification) |
| Parametros totales | 975.676.336 (~975,7 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio; la ventana de entrada depende de la configuracion de wav2vec2, no especificada) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (formato safetensors; cuantizacion posible via herramientas externas) |
| Idiomas soportados | kinyarwanda (rw) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | automatic-speech-recognition |
| Modelo base | aadel4/omniASR-CTC-1B-v2 |
| Tamano del repositorio | 3,9 GB |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Datasets de entrenamiento | DigitalUmuganda/Afrivoice_Kinyarwanda, fsicoli/common_voice_22_0 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura wav2vec2, un transformer de codificacion de audio que opera sobre representaciones convolucionales de la forma de onda y produce predicciones a nivel de fotograma. La cabeza de salida es CTC, lo que permite alinear secuencias de audio y texto sin necesidad de alineaciones forzadas previas, simplificando el entrenamiento y la inferencia. Con ~975,7 M de parametros, se situa en la gama media de los modelos ASR y es sustancialmente mayor que los wav2vec2-base (95 M) pero manejable en hardware de consumo con cuantizacion.

El entrenamiento consistio en un fine-tuning del modelo `aadel4/omniASR-CTC-1B-v2` sobre dos corpus de kinyarwanda: Afrivoice_Kinyarwanda (de DigitalUmuganda) y Common Voice 22.0 (de fsicoli). No se especifican en la informacion disponible el numero de horas de audio, el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de aumentacion de datos, RLHF o DPO (no aplicables tipicamente a ASR). Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. El modelo se distribuye como fine-tune supervisado estandar sobre una base multilingue.

## Capacidades

- Reconocimiento automatico del habla (transcripcion audio a texto) en kinyarwanda.
- Decodificacion CTC a nivel de caracter o subpalabra, segun el tokenizador del modelo base (no detallado).
- Procesamiento de audio de entrada en formato de forma de onda muestreada a 16 kHz (configuracion habitual de wav2vec2; no confirmada explicitamente en la informacion).
- Especializacion monoidioma: el modelo esta ajustado exclusivamente para kinyarwanda, no para otros idiomas.
- Integracion con el ecosistema `transformers` mediante el pipeline `automatic-speech-recognition`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni modo thinking; son capacidades no aplicables a un modelo ASR CTC.
- No se documenta capacidad multilingue mas alla del kinyarwanda.

## Casos de uso

- Transcripcion de reuniones y actas en kinyarwanda: el modelo puede convertir grabaciones de voz en texto para su posterior analisis, indexacion o resumen, aprovechando su especializacion monoidioma para reducir errores frente a modelos multilingues genericos.
- Subtitulado automatico de contenido audiovisual ruandes: adecuado para generar subtitulos en kinyarwanda en videos, programas de radio o television, con la posibilidad de revision humana posterior dado que no hay metricas publicadas de WER.
- Atencion al cliente por voz en kinyarwanda: integrable en pipelines de ASR para transcribir llamadas o mensajes de voz y alimentar sistemas de analitica o enrutamiento, con la ventaja de una licencia Apache 2.0 que permite uso comercial.
- Digitalizacion de archivos orales y patrimonio cultural: transcripcion de grabaciones historicas o etnograficas en kinyarwanda para construir corpus textuales buscables.
- Investigacion linguistica y creacion de corpus: generacion de transcripciones a escala para estudios foneticos, lexicos o de modelado del lenguaje en kinyarwanda, aprovechando el fine-tuning sobre Common Voice y Afrivoice.
- Accesibilidad: conversion de voz a texto para personas con discapacidad auditiva en entornos donde se habla kinyarwanda, integrado en aplicaciones de transcripcion en tiempo real (sujeto a la latencia del modelo, no documentada).
- Preprocesamiento para pipelines de NLP en kinyarwanda: servir como primer eslabon (ASR) en sistemas de traduccion, analisis de sentimiento o busqueda por voz en este idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 3,9 GB solo para pesos, mas overhead de activaciones y buffers; en la practica se recomienda al menos 6-8 GB de VRAM.
- VRAM estimada con cuantizacion a fp16/bf16: alrededor de 2 GB para pesos, con overhead adicional; viable en GPUs de 4-6 GB.
- VRAM estimada con cuantizacion a int8: aproximadamente 1 GB para pesos, con overhead; puede caber en GPUs de 2-4 GB.
- GPU recomendadas para produccion: NVIDIA A100, H100, L4 o T4 para throughput alto; RTX 4090 o RTX 3090 para desarrollo y despliegues de gama alta en consumer.
- Compatibilidad con GPU de consumo: si, cabe en GPUs consumer modernas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090) e incluso en GPUs de 4-6 GB con cuantizacion; el modelo de ~1B es manejable.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), potencialmente ONNX Runtime o TorchScript para optimizacion; no se documenta soporte explicito de vLLM (orientado a LLM), llama.cpp u Ollama (no orientados a wav2vec2 CTC). TGI no es aplicable tipicamente a ASR.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omniASR-CTC-1B-v2-kinyarwanda | ~975,7 M | audio (ventana no especificada) | kinyarwanda | apache-2.0 | gated en HuggingFace |
| aadel4/omniASR-CTC-1B-v2 (base) | ~1B (no confirmado) | audio (no especificado) | multilingue (no detallado) | no disponible en la informacion | no disponible |
| wav2vec2-base-960h (referencia generica) | ~95 M | audio (ventana estandar wav2vec2) | ingles | apache-2.0 | publico |
| Whisper (variantes pequenas/medianas) | 39 M - 1,55 B | audio (30 s por defecto) | multilingue | MIT (variantes OpenAI) | publico |

La comparativa es orientativa: no se dispone de datos de rendimiento (WER) para el modelo evaluado ni para el modelo base, por lo que no es posible establecer una comparacion cuantitativa de calidad. La principal diferencia frente a Whisper es la especializacion monoidioma y la arquitectura CTC, que puede ofrecer menor latencia en streaming pero carece de la flexibilidad multilingue y de las capacidades de traduccion de Whisper.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de descargar el modelo, lo que puede complicar la automatizacion en pipelines de CI/CD.
- Modelo monoidioma: solo soporta kinyarwanda; no debe esperarse un rendimiento aceptable en otros idiomas.
- Ausencia de benchmarks publicados: no hay metricas de WER ni comparaciones cuantitativas con otros sistemas, lo que impide evaluar su calidad real sin pruebas propias.
- Riesgo de alucinacion y errores de transcripcion: como todo modelo ASR, puede producir sustituciones, omisiones e inserciones, especialmente en audio con ruido, acentos no representados o vocabulario tecnico.
- Sesgos de los datos: el fine-tuning se basa en Afrivoice y Common Voice, que pueden sobrerrepresentar ciertos registros, generos o variedades dialectales del kinyarwanda, infrarrepresentando otros.
- Limitaciones de contexto de audio: la ventana de entrada efectiva de wav2vec2 es limitada; audios largos requieren segmentacion previa, lo que puede introducir errores en los limites.
- Cuantizacion no documentada: no se ofrecen pesos cuantizados oficiales; cualquier cuantizacion corre a cargo del usuario y puede degradar la precision.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base (`aadel4/omniASR-CTC-1B-v2`) y de los datasets de entrenamiento (Common Voice tiene sus propios terminos de uso).
- Madurez del proyecto: con 1 descarga y 0 likes en el momento de la consulta, el modelo carece de validacion comunitaria; debe tratarse como un artefacto experimental.
- Sin soporte documentado de tool calling, agentes ni otras capacidades de LLM: es exclusivamente un modelo ASR.

## Enlaces

- HuggingFace: https://huggingface.co/Lugha-Models/omniASR-CTC-1B-v2-kinyarwanda
- Modelo base: https://huggingface.co/aadel4/omniASR-CTC-1B-v2
- Dataset Afrivoice Kinyarwanda: https://huggingface.co/datasets/DigitalUmuganda/Afrivoice_Kinyarwanda
- Dataset Common Voice 22.0: https://huggingface.co/datasets/fsicoli/common_voice_22_0
- Documentacion de wav2vec2 en transformers: https://huggingface.co/docs/transformers/model_doc/wav2vec2
- Paper original de wav2vec 2.0: https://arxiv.org/abs/2006.11477
