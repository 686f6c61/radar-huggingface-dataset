# dianavdavidson/indic_whisper_hi_multi_gpu_mucs_62901_ratio_alldata_lr_1e-4_lgid_hi_hinglish_mixed_scripts_FT

## Resumen

El repositorio `dianavdavidson/indic_whisper_hi_multi_gpu_mucs_62901_ratio_alldata_lr_1e-4_lgid_hi_hinglish_mixed_scripts_FT` contiene un checkpoint de reconocimiento automatico del habla (ASR) publicado por el usuario dianavdavidson en Hugging Face. Por la etiqueta `whisper` del repositorio y por el conteo de parametros (763.857.920, aproximadamente 764 millones), se trata de un modelo de la familia Whisper, es decir, un transformer encoder-decoder seq2seq orientado a transcripcion de audio. El nombre del checkpoint apunta a un ajuste fino sobre hindi e hinglish (mezcla hindi-ingles) con mezcla de sistemas de escritura (devanagari y romanizado), ademas de hiperparametros de entrenamiento (lr 1e-4, congelacion de capas, `mucs_62901_ratio_alldata`).

El modelo resuelve el problema de la transcripcion de voz en escenarios de code-switching hindi-ingles, un caso especialmente problematico para los sistemas ASR genericos porque el hablante alterna idiomas y alfabetos dentro de la misma frase. Es relevante para proyectos de subtitulado, analisis de llamadas y asistentes de voz dirigidos al mercado del subcontinente indio, donde el hinglish es la norma en registro coloquial.

La informacion publica disponible es muy limitada: el repositorio acumula 20 descargas y 0 likes, no declara licencia, idiomas ni pipeline, y el tamano del repositorio (18,3 GB) es muy superior al de un unico checkpoint en precision completa, lo que sugiere la presencia de varios artefactos de entrenamiento. No se han encontrado publicaciones, papers ni documentacion asociada en la busqueda web realizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (deducido de la etiqueta `whisper` del repositorio) |
| Parametros totales | 763.857.920 (aproximadamente 764 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (en la arquitectura Whisper la entrada de audio se segmenta en ventanas de 30 s) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible en la ficha; el nombre del checkpoint indica hindi e hinglish (code-switching hindi-ingles) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 18,3 GB |
| Fecha de creacion | 2026-09-16 |
| Ultima actualizacion | 2026-09-17 |
| Descargas / likes | 20 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer encoder-decoder con atencion completa, el diseno introducido por OpenAI en la serie Whisper para tareas de secuencia a secuencia sobre espectrogramas mel. El encoder procesa ventanas de audio de 30 segundos y el decoder genera tokens de texto de forma autorregresiva, lo que permite abordar transcripcion, traduccion de voz y deteccion de idioma con el mismo modelo. Con aproximadamente 764 millones de parametros, el tamano es coherente con la variante media de la familia (Whisper medium se situa en torno a 769 M), aunque la ficha no confirma cual es el checkpoint base exacto sobre el que se realizo el ajuste fino.

Los indicios disponibles sobre el entrenamiento son exclusivamente los que aparecen codificados en el nombre del repositorio: ajuste fino con multiples GPU (`multi_gpu`), una tasa de aprendizaje de 1e-4, entrenamiento sobre el conjunto completo de datos (`alldata`), identificador de idioma fijado a hindi (`lgid_hi`), datos de hinglish y de sistemas de escritura mixtos (`hinglish_mixed_scripts`), y un identificador de configuracion o experimento (`mucs_62901_ratio`). No se especifican el numero de tokens de audio, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o decodificacion especulativa. Tampoco se detalla ninguna innovacion tecnica adicional mas alla del propio ajuste fino.

## Capacidades

- Transcripcion de voz a texto en hindi, segun el identificador de idioma del nombre del checkpoint (`lgid_hi`).
- Procesamiento de habla con code-switching hindi-ingles (hinglish), un escenario en el que el hablante alterna idiomas dentro de la misma intervencion.
- Manejo de sistemas de escritura mixtos, es decir, salida en devanagari y en transliteracion romanizada segun los datos de entrenamiento declarados en el nombre.
- Capacidades genericas heredadas de la arquitectura Whisper: transcripcion de audio, deteccion de idioma y, potencialmente, traduccion de voz, aunque no se confirma que se hayan conservado en este ajuste fino.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje de proposito general).
- Modo de razonamiento explicito (thinking mode), vision o audio mas alla de la entrada de voz: no disponible.
- Capacidades multilingues adicionales: no disponible; la ficha no declara lista de idiomas.

## Casos de uso

- Subtitulado automatico de contenido audiovisual en hinglish: el modelo puede transcribir series, podcasts y videos de YouTube dirigidos a audiencias indias donde los ponentes mezclan hindi e ingles, un caso que los ASR entrenados solo en hindi estandar resuelven con errores frecuentes en los tramos en ingles.
- Analisis de llamadas de atencion al cliente: transcripcion de conversaciones de centros de contacto en India, donde los agentes alternan hindi e ingles, para alimentar sistemas de control de calidad, analitica de sentimiento y deteccion de incidencias.
- Generacion de actas y resumenes de reuniones: conversion de audio de reuniones internas con equipos indios a texto, como paso previo a un modelo de lenguaje que genere resumenes o listas de tareas.
- Investigacion en linguistica de code-switching: obtencion de transcripciones anotadas de habla bilingue para estudiar patrones de cambio de idioma, prestamos lexicos y eleccion de alfabeto en la escritura.
- Accesibilidad y subtitulado en directo para formacion interna: transcripcion de cursos y webinars impartidos en hinglish para empleados que prefieren texto antes que audio.
- Sistemas de dictado y notas de voz: conversion de notas de voz de profesionales (medicos, abogados, tecnicos) que dictan en una mezcla de hindi e ingles y terminologia tecnica inglesa.
- Preprocesado para pipelines de voz conversacional: transcripcion de audio de entrada para asistentes por voz en hindi, alimentando despues modulos de intencion y respuesta.
- Verificacion de calidad de datos ASR: uso del modelo como referencia para comparar y auditar otros motores de transcripcion en hindi e hinglish.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de Hugging Face no incluye metricas de WER, CER ni comparaciones con otros modelos, y la busqueda web realizada no devolvio documentacion tecnica asociada a este repositorio (los resultados obtenidos correspondian a un sitio de apuestas deportivas sin relacion con el modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en fp32, 1,6 GB en fp16 y 0,8 GB en int8, calculado a partir de los 763.857.920 parametros. Estas cifras son estimaciones de calculo, no datos publicados por el autor, y hay que anadir la memoria de activaciones y del buffer de audio.
- Cabe en GPU de consumo: si, es un modelo de aproximadamente 764 M de parametros que en fp16 ocupa alrededor de 1,6 GB de pesos. Modelos como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070, RTX 4080 y RTX 4090 pueden ejecutarlo con margen amplio. Tambien es viable en GPUs integradas con memoria compartida, aunque con mayor latencia.
- GPU recomendadas para produccion: cualquier GPU con al menos 4-6 GB de VRAM libre por instancia. Para despliegues de alto volumen con batching agresivo, A100, H100 o L40S permiten maximizar el throughput, aunque no son necesarias por tamano de modelo. El tamano del repositorio (18,3 GB) implica mas de un artefacto, por lo que conviene revisar el contenido antes de descargar en disco.
- Opciones de despliegue: Hugging Face Transformers con el pipeline de `automatic-speech-recognition`; conversion a CTranslate2 mediante faster-whisper para reducir latencia y memoria; WhisperX para alineacion temporal a nivel de palabra; whisper.cpp previa conversion a GGUF (no publicada en el repositorio); vLLM si se confirma soporte para Whisper. No se dispone de informacion sobre integracion verificada con Ollama o TGI.
- Latencia y throughput estimados: no disponible. No hay datos publicados de latencia, RTF ni throughput para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (indic_whisper_hi, dianavdavidson) | 763.857.920 (aprox. 764 M) | No disponible (ventanas de 30 s en Whisper) | No disponible; orientado a hindi e hinglish | No disponible | Hugging Face, 20 descargas, 0 likes |
| Whisper medium (OpenAI) | Aproximadamente 769 M | Ventanas de 30 s | Multilingue (decenas de idiomas) | MIT (segun la publicacion original de OpenAI) | Ampliamente disponible y validado |
| Whisper large-v3 (OpenAI) | Aproximadamente 1.550 M | Ventanas de 30 s | Multilingue, mejor cobertura de idiomas de bajos recursos | MIT (segun la publicacion original de OpenAI) | Ampliamente disponible y validado |
| IndicWhisper (proyecto AI4Bharat) | No disponible en esta busqueda | No disponible | Lenguas indias | No disponible en esta busqueda | No disponible en esta busqueda |

La comparacion con Whisper medium y Whisper large-v3 se incluye por similitud de tamano y arquitectura, no porque se haya confirmado cual es el checkpoint base de este ajuste fino. No se dispone de metricas comunes que permitan comparar el rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia en la ficha, no se puede asumir permiso de uso comercial. Es imprescindible contactar con el autor antes de integrarlo en un producto.
- Ausencia total de benchmarks: no hay datos de WER ni CER publicados, ni en el repositorio ni en la busqueda web, por lo que no se puede verificar su calidad frente a alternativas establecidas.
- Validacion comunitaria practicamente nula: 20 descargas y 0 likes indican que el checkpoint no ha sido evaluado de forma independiente.
- Posible especializacion excesiva: el ajuste especifico en hindi e hinglish con escritura mixta puede degradar el rendimiento en otros idiomas que la arquitectura base si soportaba, y no hay informacion que confirme que se hayan conservado.
- Ambiguedad de escritura: al entrenar con sistemas de escritura mixtos (devanagari y romanizado), la salida puede alternar alfabetos de forma inconsistente entre transcripciones, lo que complica el postprocesado.
- Riesgo de alucinacion: como cualquier modelo Whisper, puede generar texto plausible en tramos de audio con ruido, silencio o musica, especialmente cuando no hay voz inteligible.
- Sesgos: no hay informacion sobre la composicion del dataset de ajuste fino, por lo que se desconocen sesgos de genero, acento, dialecto, caste o registro social en la transcripcion.
- Limitaciones de contexto: la atencion de Whisper opera sobre ventanas de 30 segundos, lo que obliga a segmentar audios largos y puede provocar perdida de coherencia en los limites de segmento.
- Opacidad del repositorio: el tamano de 18,3 GB frente a los 1,6 GB que ocuparian los pesos en fp16 sugiere la presencia de checkpoints intermedios, estados de optimizador u otros artefactos; conviene inspeccionar el contenido antes de descargarlo o desplegarlo.
- Sin informacion sobre el proceso de entrenamiento: no se detallan horas de computo, datos, criterios de parada ni metodologia de evaluacion, lo que dificulta reproducir o auditar el resultado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dianavdavidson/indic_whisper_hi_multi_gpu_mucs_62901_ratio_alldata_lr_1e-4_lgid_hi_hinglish_mixed_scripts_FT
- Repositorio base de Whisper (OpenAI): https://github.com/openai/whisper (referencia de arquitectura, no confirmada como origen del ajuste fino)
- Proyecto AI4Bharat IndicWhisper: no disponible en la busqueda realizada
- Paper de Whisper: no disponible en la busqueda realizada
- Demos o espacios asociados: no disponible
- La busqueda web realizada no devolvio ningun enlace relacionado con este modelo; los resultados obtenidos eran irrelevantes para la ficha.
