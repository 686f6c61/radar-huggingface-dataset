# engenho-ai/KuroEar-PTBR

## Resumen

KuroEar-PTBR es un modelo de reconocimiento automatico del habla (ASR) especializado en portugues de Brasil, desarrollado por engenho-ai como parte de su "Linha Kuro". Se trata de un ajuste fino (fine-tune) del modelo openai/whisper-large-v3-turbo, la variante optimizada de Whisper large-v3 que reduce el numero de capas del decodificador para mejorar la eficiencia de inferencia manteniendo una calidad cercana al modelo completo.

El modelo resuelve la tarea de transcripcion de audio a texto en pt-BR con un tamano de 808,9 millones de parametros y un consumo de VRAM estimado por el autor de aproximadamente 0,8 GB, lo que lo situa en el rango de modelos desplegables en hardware de consumo. Su licencia MIT y su naturaleza de fine-tune sobre una arquitectura ampliamente soportada (Whisper) lo hacen adecuado para integracion en pipelines de transcripcion existentes.

Es relevante por su especializacion idiomatica: al derivar de whisper-large-v3-turbo y ajustarse especificamente para pt-BR, busca mejorar la precision en un idioma concreto frente al modelo multilingue generico, con un coste computacional contenido. La informacion publicada por el autor es escasa (model card minimalista, sin datos de entrenamiento ni benchmarks), por lo que muchos apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | 808.878.080 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de Whisper, no documentada por el autor) |
| Idiomas soportados | portugues (pt), segun metadatos; especializado en pt-BR |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3-turbo: un transformer encoder-decoder con atencion estandar que procesa audio en ventanas de 30 segundos y genera transcripciones de forma autorregresiva. La variante "turbo" de OpenAI reduce el decodificador a 4 capas (frente a las 32 de large-v3), lo que disminuye el coste de inferencia a cambio de una ligera perdida de calidad en algunas tareas. El modelo base incorpora capacidad multilingue y deteccion de idioma.

Sobre el proceso de fine-tune realizado por engenho-ai no se ha publicado informacion: se desconoce el volumen de datos de audio utilizados, la composicion del dataset (horas, dominios, acentos, ruido), si se aplicaron tecnicas de aumentacion o si hubo etapas de alineacion. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras). Toda esta informacion debe considerarse no disponible.

## Capacidades

- Transcripcion de voz a texto (ASR) en portugues de Brasil.
- Procesamiento de audio en ventanas de 30 segundos, con capacidad de segmentacion para audios mas largos (heredada de Whisper).
- Deteccion de idioma heredada del modelo base multilingue (aunque el ajuste esta orientado a pt).
- Generacion de marcas de tiempo (timestamps) a nivel de segmento, segun el comportamiento estandar de Whisper (no confirmado explicitamente por el autor).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo exclusivamente ASR.
- No se documentan capacidades de vision, audio generativo ni modo "thinking".

## Casos de uso

- Transcripcion de reuniones y actas: el modelo convierte audio de reuniones en portugues de Brasil en texto, aprovechando la ventana de 30 segundos de Whisper para procesar grabaciones largas por segmentos.
- Subtitulado automatico de video: generacion de subtitulos en pt-BR para contenido audiovisual, con marcas de tiempo por segmento que facilitan la sincronizacion.
- Atencion al cliente y analitica de llamadas: transcripcion de grabaciones de call centers en portugues para su posterior analisis de sentimiento o cumplimiento, con un coste de VRAM bajo (~0,8 GB) que permite ejecucion en paralelo.
- Accesibilidad: conversion de audio a texto para personas con discapacidad auditiva en aplicaciones y servicios en portugues.
- Dictado y productividad: integracion en herramientas de escritura por voz para usuarios brasileiros, con despliegue local en equipos de consumo.
- Investigacion linguistica y NLP en pt-BR: generacion de corpus transcritos para entrenamiento o evaluacion de otros modelos en portugues.
- Archivado y busqueda de contenido: transcripcion de podcasts o archivos de audio para indexacion y busqueda textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB segun el autor (model card), lo que corresponde a pesos en precision reducida; en fp16 el modelo de 808,9 M de parametros requiere del orden de 1,6 GB solo para pesos, mas memoria de activaciones.
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM; el modelo es desplegable en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, asi como en A100/H100 para despliegues de alto throughput.
- Cabe en GPU de consumo: si, dada su baja huella de memoria.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), vLLM (soporte de Whisper), faster-whisper, whisper.cpp, Hugging Face TGI y Ollama mediante conversion. La compatibilidad exacta con cada backend no esta documentada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| KuroEar-PTBR | 808,9 M | ventanas de 30 s | pt (pt-BR) | MIT | Fine-tune de whisper-large-v3-turbo; sin benchmarks publicados |
| openai/whisper-large-v3-turbo | 809 M | ventanas de 30 s | multilingue | MIT | Modelo base; calidad multilingue general, sin especializacion pt-BR |
| openai/whisper-large-v3 | 1,55 B | ventanas de 30 s | multilingue | MIT | Mayor tamano y calidad, mayor coste de inferencia |
| openai/whisper-small | 244 M | ventanas de 30 s | multilingue | MIT | Mucho mas ligero, menor precision en idiomas no ingleses |

La comparacion con alternativas especializadas en pt-BR no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de la mejora frente al modelo base en pt-BR.
- Model card minimalista: se desconoce el dataset de entrenamiento, su dominio y su cobertura de acentos, ruido y registros, lo que impide evaluar sesgos.
- Riesgo de alucinacion: como todo modelo generativo de ASR, puede producir texto plausible no presente en el audio, especialmente en segmentos con ruido o silencio.
- Limitacion idiomatica: aunque el modelo base es multilingue, el ajuste esta orientado a pt-BR; su rendimiento en portugues europeo u otros idiomas no esta documentado.
- Ventana de audio de 30 segundos: requiere segmentacion para audios largos, con posible perdida de contexto entre segmentos.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias; al derivar de un modelo de OpenAI, conviene revisar las condiciones del modelo base.
- Sin senales de adopcion (0 descargas, 0 likes en el momento de la consulta): no hay validacion por parte de la comunidad.
- Fecha de creacion del repositorio posterior a la fecha actual de referencia de esta ficha; verificar la vigencia del contenido antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/engenho-ai/KuroEar-PTBR
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Paper de Whisper (Radford et al.): https://arxiv.org/abs/2212.04356
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
