# nadinev/safen

## Resumen

`safen` es un ajuste fino (fine-tune) del modelo de reconocimiento automatico del habla `openai/whisper-large-v3`, publicado por el usuario `nadinev` en Hugging Face. El modelo hereda la arquitectura encoder-decoder Transformer de Whisper y los aproximadamente 1.543 millones de parametros del checkpoint original, y esta especializado, segun sus etiquetas, en ingles sudafricano (`south-african-english`, `za-en`) ademas de ingles generico. Su pipeline declarado es `automatic-speech-recognition`.

El interes practico del modelo reside en la adaptacion de un sistema ASR multilingue de gran tamano a una variedad regional del ingles poco representada en los corpus de entrenamiento originales de Whisper, lo que potencialmente mejora la transcripcion de acentos, vocabulario y convenciones ortograficas sudafricanas. El repositorio es muy reciente (creado el 26 de noviembre de 2026), no acumula descargas ni likes, y el acceso esta restringido (gated), por lo que requiere aceptar condiciones en Hugging Face antes de descargar los pesos.

La ficha se elabora exclusivamente a partir de los metadatos disponibles en Hugging Face. No se ha publicado informacion sobre el dataset de ajuste, hiperparametros, resultados de evaluacion ni detalles del proceso de entrenamiento, por lo que varios apartados se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) |
| Parametros totales | 1.543.490.560 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s; contexto textual derivado de 448 tokens en large-v3, no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | en (ingles; etiquetas adicionales: south-african-english, za-en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | openai/whisper-large-v3 |
| Tipo de ajuste | fine-tune del checkpoint base |
| Tamano del repositorio | 3.1 GB |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura de Whisper large-v3: un encoder Transformer que procesa espectrogramas Mel logaritmicos de audio en ventanas de 30 segundos y un decoder Transformer autorregresivo que genera tokens de transcripcion, con atencion cruzada entre ambos. Whisper large-v3 emplea 32 capas de encoder y 32 de decoder, con un ancho de modelo de 1280 dimensiones y cabezas de atencion multiple; el recuento de parametros publicado en este repositorio (1.543.490.560) es coherente con ese checkpoint.

No se dispone de informacion sobre el corpus de ajuste fino: numero de horas de audio, composicion del dataset, si se congelaron capas, tasas de aprendizaje, ni si se aplicaron tecnicas como especificacion de tareas o aumentado de datos. Tampoco se documenta si hubo evaluacion sobre conjuntos de validacion especificos de ingles sudafricano. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en ingles.
- Adaptacion orientada a ingles sudafricano (`za-en`), segun las etiquetas del repositorio.
- Transcripcion de audio de hasta 30 segundos por ventana, con la posibilidad de encadenar ventanas para audios mas largos mediante los pipelines de `transformers`.
- Capacidad multilingue heredada del checkpoint base teoricamente presente en los pesos, aunque el ajuste fino y las etiquetas del repositorio solo declaran ingles; el rendimiento en otros idiomas no esta documentado.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido; son capacidades no aplicables a un modelo ASR.
- No se documenta soporte de traduccion explicita ni marcas de tiempo a nivel de palabra en esta variante.

## Casos de uso

- Transcripcion de reuniones y llamadas en empresas sudafricanas: el ajuste sobre ingles sudafricano puede reducir errores en nombres propios, toponimos y expresiones locales frente al Whisper large-v3 original, aunque esta mejora no esta cuantificada en la informacion disponible.
- Subtitulado de contenido audiovisual regional: el modelo puede generar transcripciones base para subtitulos en producciones dirigidas a audiencias de Sudafrica, con revision humana posterior.
- Atencion al cliente y centros de contacto: transcripcion de grabaciones de llamadas para analitica, control de calidad y busqueda, aprovechando la adaptacion al acento local.
- Documentacion clinica o legal dictada: transcripcion de notas de voz en entornos donde el personal habla ingles sudafricano, siempre con validacion profesional por el riesgo de alucinacion inherente a los modelos ASR.
- Accesibilidad: generacion de subtitulos automaticos para videos, webinars y material formativo en ingles sudafricano.
- Investigacion linguistica y sociolinguistica: analisis de corpus orales de variedades del ingles de Sudafrica, comparando la salida del modelo ajustado con la del base.
- Preprocesado para pipelines de NLP: conversion de audio a texto como paso previo a resumen, extraccion de entidades o indexacion semantica de archivos de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de WER (word error rate), CER, ni comparaciones con el modelo base o con otros sistemas ASR.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para los pesos, mas memoria para activaciones y buffers de audio; en la practica se recomienda al menos 6-8 GB de VRAM para inferencia comoda con `transformers`.
- VRAM estimada en fp32: alrededor de 6,2 GB solo para pesos.
- GPU recomendadas: NVIDIA A100, H100, L40S o RTX 4090 para inferencia de alta concurrencia; RTX 3090, RTX 4080 o RTX 4070 Ti para uso individual.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en fp16 (por ejemplo RTX 3060 Ti 8 GB, RTX 4060 Ti 8 GB, RTX 3070), con margen limitado.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), `faster-whisper` (si se convierte a CTranslate2), `whisper.cpp` (requiere conversion a GGML/GGUF, no publicada), `vLLM` no soporta Whisper de forma nativa, `TGI` no esta orientado a ASR.
- Latencia y throughput: no disponibles; dependen del hardware, la longitud del audio y el backend. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| nadinev/safen | 1.543 M | en (za-en) | apache-2.0 | gated | Fine-tune de Whisper large-v3 para ingles sudafricano |
| openai/whisper-large-v3 | 1.543 M | multilingue (99 idiomas) | apache-2.0 | abierto | Modelo base; cobertura multilingue amplia, sin especializacion regional |
| openai/whisper-large-v3-turbo | ~809 M | multilingue | apache-2.0 | abierto | Version destilada del decoder, mas rapida y con menor uso de memoria |
| distil-whisper/distil-large-v3 | ~756 M | en | apache-2.0 | abierto | Version destilada para ingles, menor latencia a costa de algo de precision |

La comparacion se limita a caracteristicas estructurales; no hay datos de rendimiento publicados para `safen` que permitan contrastar WER frente a estas alternativas.

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar las condiciones en Hugging Face para descargar los pesos, lo que puede complicar la automatizacion de pipelines.
- Ausencia total de documentacion sobre el dataset de entrenamiento, lo que impide evaluar sesgos, cobertura dialectal y riesgo de sobreajuste.
- Riesgo de alucinacion: como todos los modelos Whisper, puede generar texto plausible en segmentos de silencio, ruido o audio musical; no debe usarse sin revision en contextos criticos.
- Idiomas: aunque los pesos derivan de un modelo multilingue, el ajuste y las etiquetas solo declaran ingles; el rendimiento en otros idiomas no esta verificado y podria haberse degradado.
- Licencia apache-2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones de acceso gated y de la licencia del modelo base.
- Sin benchmarks: no hay evidencia publicada de que el ajuste mejore al modelo base en ingles sudafricano; la afirmacion de especializacion proviene unicamente de las etiquetas del repositorio.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de validacion por parte de la comunidad.
- Fecha de creacion futura respecto a la mayoria de los modelos publicados (2026), lo que sugiere un lanzamiento muy reciente y sin ciclo de maduracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nadinev/safen
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- Documentacion de Whisper en transformers: https://huggingface.co/docs/transformers/model_doc/whisper
- faster-whisper (CTranslate2): https://github.com/SYSTRAN/faster-whisper
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
