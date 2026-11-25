# nectec/Pathumma-parakeet-rnnt-th-0.6b

## Resumen

Pathumma-parakeet-rnnt-th-0.6b es un modelo publicado en Hugging Face por el equipo NECTEC (Centro Nacional de Electronica y Tecnologia Informatica de Tailandia) bajo el identificador `nectec/Pathumma-parakeet-rnnt-th-0.6b`. El nombre indica que se trata de un modelo de reconocimiento automatico del habla (ASR) basado en la arquitectura Parakeet de NVIDIA, con un decodificador de tipo RNNT (Recurrent Neural Network Transducer) y un tamano aproximado de 0,6 mil millones de parametros, orientado al idioma tailandes (sufijo `-th`). Se distribuye en formato NeMo, la libreria de NVIDIA para modelos de voz y lenguaje.

El modelo se enmarca en la familia Pathumma, una linea de trabajo de NECTEC centrada en modelos de lenguaje y voz para tailandes. Su relevancia reside en que amplia el ecosistema de ASR abierto para un idioma con relativamente pocos recursos publicos de calidad, y lo hace con una licencia permisiva (CC BY 4.0) que permite uso comercial con atribucion.

La informacion disponible en la model card es practicamente inexistente: no se detallan datos de entrenamiento, composicion del corpus, resultados de benchmarks ni instrucciones de uso. Esta ficha se limita, por tanto, a lo que puede inferirse de los metadatos del repositorio y de la convencion de nombres, marcando explicitamente como "no disponible" todo aquello que no ha sido publicado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet (ASR) con decodificador RNNT, segun el nombre del modelo; detalles no disponibles |
| Parametros totales | Aproximadamente 0,6 mil millones (inferido del sufijo `0.6b`); cifra exacta no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Tailandes (inferido del sufijo `-th`); lista oficial no disponible |
| Licencia | CC BY 4.0 |
| Formato de pesos | NeMo (libreria `nemo`); extension concreta de los ficheros no disponible |

## Arquitectura y entrenamiento

El identificador del modelo apunta a la arquitectura Parakeet de NVIDIA, una familia de modelos ASR basados en Conformer con decodificador RNNT (transducer). En este tipo de modelos, el encoder procesa la señal acustica y el decodificador RNNT genera la secuencia de tokens de forma auto-regresiva, lo que permite alineamiento implicito y streaming. El sufijo `rnnt` confirma el uso de este decodificador frente a alternativas como CTC o attention-based encoder-decoder.

No se ha publicado informacion sobre el numero de horas de audio utilizadas, la composicion del corpus (lectura, conversacional, ruido, acentos), el uso de aumento de datos, ni si se aplicaron tecnicas de destilacion o ajuste fino desde un modelo Parakeet preentrenado en ingles. Tampoco se detalla el tokenizer ni el vocabulario empleado. Todo ello debe considerarse no disponible.

## Capacidades

- Reconocimiento automatico del habla en tailandes, presumiblemente a partir de audio de entrada.
- Decodificacion RNNT, que permite en principio inferencia en streaming y alineamientos temporales.
- No consta soporte de tool calling, function calling ni capacidades de agente.
- No consta soporte multilingue mas alla del tailandes.
- No consta capacidad de traduccion, diarizacion ni reconocimiento de emociones.
- No consta modo "thinking" ni capacidades multimodales.

## Casos de uso

- Transcripcion de reuniones y actas en tailandes: el modelo puede convertir audio de reuniones en texto para generar resumenes posteriores, aprovechando que un modelo RNNT permite procesar audio de forma incremental.
- Subtitulado automatico de contenido audiovisual en tailandes: integrado en un pipeline de extraccion de audio y alineamiento temporal, el modelo RNNT puede producir transcripciones con marcas de tiempo utiles para subtitulos.
- Atencion al cliente y centros de llamadas: transcripcion de conversaciones telefonicas en tailandes para analitica, busqueda y control de calidad, siempre que la calidad acustica del canal lo permita.
- Indexacion y busqueda de archivos de audio: conversion de grabaciones (podcasts, clases, entrevistas) a texto para permitir busqueda semantica y recuperacion de informacion.
- Accesibilidad: generacion de subtitulos en tiempo real para personas con discapacidad auditiva en contextos de habla tailandesa.
- Investigacion en ASR de bajos recursos: servir como linea base o punto de partida para ajuste fino en dominios especificos (medico, legal) o para comparativas con otros modelos tailandeses.
- Preprocesado para pipelines de NLP: transcripcion de audio como paso previo a analisis de sentimiento, extraccion de entidades o resumen con modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1,2-1,5 GB solo para los pesos, mas el overhead del runtime NeMo y buffers de audio; una estimacion prudente es 2-4 GB en total.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; A100, H100 o L40S para despliegues de alto throughput; RTX 4090, RTX 3090 o RTX 4060 Ti para desarrollo.
- Cabe en GPU de consumo: si, en modelos como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores; tambien es probable su ejecucion en CPU con NeMo, aunque con mayor latencia.
- Opciones de despliegue: NeMo (NVIDIA Riva o NeMo toolkit) es la via natural dado el formato; no consta soporte directo en vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles; dependeran del hardware, del uso de streaming y de la longitud del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nectec/Pathumma-parakeet-rnnt-th-0.6b | ~0,6 B | Tailandes | Parakeet + RNNT | CC BY 4.0 | Hugging Face (NeMo) |
| Modelos Pathumma de NECTEC (familia) | Variable | Tailandes | Variable (LLM/ASR) | no disponible | Hugging Face |
| Modelos ASR multilingues de NVIDIA NeMo (p. ej. Parakeet/Canary) | Variable | Multiples | Conformer/RNNT o AED | Variable | NGC / Hugging Face |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas. La comparativa se limita a parametros, idioma y licencia.

## Limitaciones y advertencias

- La model card no documenta sesgos, dominio de entrenamiento ni condiciones acusticas cubiertas; el rendimiento fuera de condiciones similares a las de entrenamiento es incierto.
- Riesgo de alucinacion o sustitucion de palabras en audio ruidoso, con acentos no representados o con cambios de idioma (code-switching), comun en modelos ASR.
- Cobertura limitada al tailandes segun el nombre; no se garantiza soporte de otros idiomas.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero exige citar adecuadamente al autor y no anade garantias.
- Ausencia de informacion sobre el corpus de entrenamiento impide evaluar riesgos de privacidad o de sesgo dialectal.
- El modelo esta en formato NeMo, lo que limita su uso a ese ecosistema y complica su integracion en stacks basados en PyTorch puro o en herramientas de inferencia de LLM.
- Sin benchmarks publicados, no es posible validar su calidad frente a alternativas antes de desplegarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nectec/Pathumma-parakeet-rnnt-th-0.6b
