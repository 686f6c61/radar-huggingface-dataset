# dianavdavidson/whisper-medium_mucs_62986_ratio_0_25_lr_1e-4_lgid_hi_hinglish_mixed_scripts_FT

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Whisper medium de OpenAI, publicado por el usuario dianavdavidson bajo el identificador `whisper-medium_mucs_62986_ratio_0_25_lr_1e-4_lgid_hi_hinglish_mixed_scripts_FT`. Se trata de un modelo de reconocimiento automatico del habla (ASR) de arquitectura encoder-decoder transformer, con 763.857.920 parametros confirmados por los pesos en safetensors, lo que coincide con el tamano del Whisper medium original. El repositorio pesa 15,3 GB, lo que sugiere que ademas de los pesos puede incluir estados de optimizador u otros artefactos de entrenamiento.

La nomenclatura del repositorio aporta la mayor parte de la informacion disponible: apunta a un ajuste fino sobre datos de habla con alternancia de codigos hindi-ingles ("hinglish", etiqueta `lgid_hi_hinglish_mixed_scripts`), probablemente con mezcla de grafias devanagari y latina, con una tasa de aprendizaje de 1e-4, una proporcion de datos de 0,25 y la etiqueta `mucs_62986` como referencia del conjunto de datos. Es importante subirrayar que estos datos proceden de la convencion de nombres y no estan documentados de forma explicita en la ficha de HuggingFace, por lo que deben tomarse como interpretacion y no como especificacion confirmada.

Su relevancia actual es limitada pero especifica: los sistemas ASR comerciales rinden peor en habla con cambio de codigo (code-switching) entre hindi e ingles, un fenomeno muy comun en India y en comunidades migrantes. Un ajuste fino de Whisper medium orientado a este caso puede mejorar la transcripcion de ese dominio concreto a un coste computacional moderado. No obstante, el repositorio tiene 27 descargas y 0 "likes", no declara licencia, idiomas ni pipeline, y no publica resultados de evaluacion, por lo que su validacion queda pendiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (heredada de Whisper medium: entrada de espectrograma log-mel, decoder autorregresivo con tokens de tarea e idioma) |
| Parametros totales | 763.857.920 (dato confirmado a partir de los pesos safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en el repositorio. La arquitectura Whisper procesa ventanas de audio de 30 segundos (1500 posiciones en el encoder) y el decoder trabaja con una secuencia de 448 tokens |
| Tipos de cuantizacion | No disponibles en el repositorio. Al ser pesos safetensors estandar, son convertibles a int8/fp16 mediante CTranslate2, GGML/GGUF o ONNX, pero el autor no publica variantes cuantizadas |
| Idiomas soportados | No disponibles. El nombre del repositorio sugiere hindi-ingles con alternancia de codigos ("hinglish") y grafias mixtas; el modelo base Whisper medium es multilingue, pero el ajuste fino puede haber reducido o sesgado esa cobertura |
| Licencia | No disponible. El modelo base whisper-medium de OpenAI se distribuye bajo licencia MIT, pero este repositorio no declara licencia propia |
| Formato de pesos | safetensors (segun las etiquetas del repositorio) |
| Tamano del repositorio | 15,3 GB |
| Descargas / likes | 27 descargas, 0 likes |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper medium: un transformer encoder-decoder con normalizacion pre-LN, embeddings sinusoidales, atencion multi-cabeza estandar y conexiones residuales, que consume espectrogramas log-mel de 80 canales calculados sobre ventanas de 30 segundos. El encoder produce 1500 posiciones y el decoder genera la transcripcion de forma autorregresiva empleando tokens especiales de tarea (`transcribe`/`translate`), tokens de idioma y tokens de marcas temporales. Whisper medium se entreno originalmente con supervision debil sobre aproximadamente 680.000 horas de audio multilingue y multitarea, y consta de 24 capas de encoder y 24 de decoder con 1024 dimensiones de modelo (configuracion clasica del medium).

Sobre el proceso de ajuste fino de este repositorio solo puede inferirse lo que indica el nombre: aprendizaje supervisado con tasa de aprendizaje 1e-4, una fraccion de datos de 0,25 respecto al conjunto completo, y un conjunto etiquetado como `mucs_62986` centrado en habla hinglish con guiones mixtos. No hay informacion publicada sobre el numero de tokens o de horas de audio empleadas, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o decodificacion especulativa.

## Capacidades

- Transcripcion de voz a texto (ASR) en ventanas de hasta 30 segundos por inferencia, con posibilidad de encadenar ventanas para audio mas largo.
- Manejo previsto de habla con alternancia de codigos hindi-ingles ("hinglish"), segun la convencion de nombres del repositorio; no verificado con evaluaciones publicas.
- Reconocimiento de texto en grafias mixtas (devanagari y latina) como hipotesis derivada de la etiqueta `mixed_scripts`, sin confirmacion documental.
- Traduccion de voz a texto y transcripcion multilingue potencialmente heredadas del modelo base Whisper medium, aunque el ajuste fino puede haber degradado idiomas distintos del hinglish.
- Generacion de marcas temporales a nivel de segmento o palabra, capacidades nativas de la familia Whisper.
- No dispone de soporte de tool calling ni de function calling.
- No esta orientado a agentes ni a razonamiento multi-paso.
- No incluye capacidades de vision, audio comprensivo mas alla del ASR, ni modo "thinking".
- No hay informacion publicada sobre vocabulario controlado, puntuacion, diarizacion de hablantes o normalizacion de texto.

## Casos de uso

- Transcripcion de contenido audiovisual hinglish: ideal para subtitular videos, podcasts o entrevistas en los que los hablantes alternan hindi e ingles en la misma frase, un escenario donde los ASR genericos suelen fallar.
- Atencion al cliente en centros de contacto indios: permite transcribir conversaciones telefonicas bilingues para analitica de calidad, cumplimiento normativo y busqueda posterior sobre el texto.
- Generacion de subtitulos para plataformas de streaming con catalogo del sur de Asia: el ajuste fino puede reducir la tasa de error en nombres propios, prestamos del ingles y cambios de idioma intra-oracion.
- Documentacion clinica o legal dictada en hinglish: transcripcion de notas de voz para su posterior revision, siempre con supervision humana dado el riesgo de alucinacion.
- Analisis de redes sociales y medios: conversion de audio de reels, stories y directos a texto para monitorizacion de marca o investigacion sociolinguistica sobre code-switching.
- Accesibilidad para hablantes bilingues: subtitulado en tiempo casi real de reuniones donde los participantes mezclan hindi e ingles, con despliegue local para preservar la privacidad.
- Investigacion en linguistica computacional: generacion de transcripciones anotadas para estudiar fenomenos de alternancia de codigos, integracion de prestamos y cambios de grafia.
- Pipelines de datos a gran escala: preprocesado de corpus de audio para entrenar modelos posteriores, aprovechando que el tamano del modelo permite ejecucion en una sola GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de WER (word error rate), evaluaciones sobre MUCS, Common Voice, Fleurs, ni comparaciones con el modelo base o con alternativas. Sin estos datos no es posible cuantificar la mejora real del ajuste fino respecto a whisper-medium original.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar overhead de runtime): aproximadamente 3,1 GB en fp32, 1,5 GB en fp16/bf16 y en torno a 0,8 GB en int8.
- VRAM practica recomendada: 4-6 GB para fp16 con margen de activaciones y buffers, y 2-3 GB para int8.
- GPU recomendadas para inferencia: NVIDIA RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090, A10, L4, A100 y H100. Cualquier GPU con 4 GB o mas de VRAM puede ejecutarlo en fp16.
- Cabe en GPU consumer: si, en practicamente toda la gama moderna, e incluso en GPUs de 4-6 GB en cuantizacion int8.
- Ajuste fino: con AdamW y precision mixta suele requerir del orden de 16-24 GB de VRAM dependiendo del tamano de lote y de la longitud de audio; una RTX 3090/4090 de 24 GB es suficiente para lotes pequenos, siendo preferible A100 o H100 para lotes mayores.
- Opciones de despliegue: Hugging Face Transformers, faster-whisper (CTranslate2), whisper.cpp/GGUF, Ollama (mediante conversiones GGML), vLLM (soporte de Whisper), Text Generation Inference y ONNX Runtime.
- Latencia y throughput: no disponibles. El repositorio no aporta mediciones de factor de tiempo real ni de velocidad de decodificacion para este ajuste concreto.
- Almacenamiento: 15,3 GB para el repositorio completo; los pesos en safetensors ocupan del orden de 3 GB en fp32 y pueden reducirse a aproximadamente 1,5 GB al exportar a fp16 o a formatos GGUF/int8.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este ajuste fino (whisper-medium hinglish) | 763,9 M | 30 s por segmento | No declarados (se presume hinglish) | No disponible | HuggingFace, safetensors |
| Whisper medium (base OpenAI) | 769 M | 30 s por segmento | Multilingue (99 idiomas) | MIT | HuggingFace, multiples formatos |
| Whisper large-v3 (OpenAI) | 1.550 M | 30 s por segmento | Multilingue (99 idiomas) | MIT | HuggingFace, multiples formatos |
| Whisper small (OpenAI) | 244 M | 30 s por segmento | Multilingue (99 idiomas) | MIT | HuggingFace, multiples formatos |

La comparacion de rendimiento ASR entre estas opciones no puede establecerse con la informacion disponible, ya que no hay WER publicado para este ajuste fino ni para un conjunto de evaluacion comun. La unica ventaja objetivable de este repositorio frente a whisper-medium es su especializacion declarada en habla hinglish; su desventaja es la ausencia de licencia, idiomas y evaluaciones documentadas, ademas de un numero de descargas muy bajo, lo que limita la validacion por parte de la comunidad.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay WER ni metricas de calidad, por lo que no se puede garantizar que el ajuste fino mejore al modelo base.
- Sesgos desconocidos: al no documentarse la composicion del dataset (`mucs_62986`), se desconoce la representacion de acentos regionales, genero, edad o clase social, con el consiguiente riesgo de sesgo en produccion.
- Riesgo de alucinacion: caracteristico de la familia Whisper, especialmente con audio ruidoso, silencios largos o musica de fondo; puede generar texto plausible pero incorrecto.
- Sobreajuste al dominio: un ajuste fino con tasa 1e-4 sobre una fraccion de datos (ratio 0,25) puede degradar el rendimiento en idiomas distintos del hinglish y en dominios alejados del corpus de entrenamiento.
- Limitacion de ventana: la arquitectura procesa segmentos de 30 segundos, lo que exige estrategias de troceado y ensamblado para audio largo, con riesgo de errores en las fronteras.
- Licencia no declarada: la ausencia de licencia explicita impide determinar si el uso comercial es legalmente viable, aunque el modelo base whisper-medium sea MIT. Se recomienda contactar con el autor antes de cualquier uso en produccion.
- Falta de pipeline declarado: HuggingFace no asigna tarea al repositorio, lo que puede provocar fallos en herramientas que dependen de ese metadato.
- Madurez baja: 27 descargas y 0 likes indican que el modelo no ha sido validado por terceros.
- Formatos limitados: solo se ofrecen pesos en safetensors, sin variantes GGUF o int8 listas para usar, lo que anade trabajo de conversion.
- Grafias mixtas no verificadas: no hay confirmacion de como se manejan devanagari y alfabeto latino en la salida, ni de si la normalizacion de texto es consistente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dianavdavidson/whisper-medium_mucs_62986_ratio_0_25_lr_1e-4_lgid_hi_hinglish_mixed_scripts_FT
- Modelo base Whisper medium (OpenAI): https://huggingface.co/openai/whisper-medium
- Repositorio de codigo de Whisper: https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356

Nota: la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo ni con ASR en hindi-ingles; los enlaces obtenidos corresponden a noticias sobre la marca Realme y no se incluyen por no ser relevantes. No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este ajuste fino en la informacion disponible.
