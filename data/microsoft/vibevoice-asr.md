# microsoft/VibeVoice-ASR

## Resumen

VibeVoice-ASR es un modelo unificado de reconocimiento automático del habla (ASR) desarrollado por Microsoft Research, diseñado para transcribir audio de hasta 60 minutos de duración en una sola pasada. A diferencia de los sistemas ASR convencionales que segmentan el audio en fragmentos cortos, este modelo procesa la señal completa dentro de una ventana de 64 000 tokens, generando una transcripción estructurada que incluye quién habla (diarización de locutores), cuándo (marcas de tiempo) y qué se dice (contenido). Con aproximadamente 8 700 millones de parámetros, soporta más de 50 idiomas y permite personalizar el reconocimiento mediante hotwords específicas.

El modelo forma parte de la familia VibeVoice, que también incluye un sistema de síntesis de voz (TTS). Su innovación principal reside en el uso de tokenizadores de voz continua (acústicos y semánticos) que operan a una frecuencia ultrabaja de 7,5 Hz, lo que reduce drásticamente la carga computacional y permite manejar audio de larga duración sin perder coherencia global. Publicado bajo licencia MIT, está disponible en Hugging Face con pesos en formato safetensors y es compatible con el ecosistema Transformers y vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizadores de voz continua (acusticos y semanticos) a 7,5 Hz (segun documentacion del proyecto) |
| Parametros totales | 8 674 021 857 (~8,67 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 64 000 tokens (equivalente a 60 minutos de audio) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Mas de 50: en, zh, es, pt, de, ja, ko, fr, ru, id, sv, it, he, nl, pl, no, tr, th, ar, hu, ca, cs, da, fa, af, hi, fi, et, aa, el, ro, vi, bg, is, sl, sk, lt, sw, uk, kl, lv, hr, ne, sr, tl, yi, ms, ur, mn, hy, jv |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo no se detalla en la informacion publica disponible. No obstante, la documentacion del proyecto VibeVoice indica que el sistema emplea tokenizadores de voz continua (acusticos y semanticos) a una frecuencia de 7,5 Hz, una tasa de muestreo muy inferior a la de los tokenizadores de audio tradicionales. Esto permite comprimir la senal de audio en secuencias mucho mas cortas, facilitando el procesamiento de hasta 60 minutos de audio dentro de una ventana de 64 000 tokens. El modelo integra de forma conjunta las tareas de ASR, diarizacion de locutores y alineacion temporal, sin necesidad de segmentacion previa del audio.

No se han publicado datos especificos sobre el corpus de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de refinamiento como RLHF o DPO. Tampoco se mencionan innovaciones adicionales en la arquitectura interna mas alla de los tokenizadores de baja frecuencia y la capacidad de procesamiento de audio largo en una sola pasada.

## Capacidades

- Reconocimiento automatico del habla (ASR) para audio de hasta 60 minutos en una sola pasada, sin segmentacion previa.
- Diarizacion de locutores integrada: identifica quien habla en cada segmento de la transcripcion.
- Generacion de marcas de tiempo (timestamps) alineadas con el contenido.
- Soporte de hotwords personalizadas: el usuario puede proporcionar terminos especificos (nombres, jerga tecnica, etc.) para mejorar la precision en dominios concretos.
- Multilingue: mas de 50 idiomas sin necesidad de configuracion explicita del idioma.
- Cambio de codigo (code-switching) nativo dentro y entre utterances, tanto en la misma frase como entre frases.
- No requiere segmentacion de audio ni deteccion de actividad de voz previa.
- Compatible con el ecosistema Transformers y con vLLM para despliegue en produccion.

## Casos de uso

- Transcripcion de reuniones y conferencias: el modelo procesa grabaciones de hasta una hora de duracion en una sola pasada, generando actas con identificacion de cada interlocutor y marcas de tiempo. Su ventana de 64 000 tokens garantiza coherencia semantica en toda la sesion.
- Subtitulacion automatica de videos largos: permite generar subtitulos sincronizados para contenido audiovisual de larga duracion (webinars, clases, documentales) sin necesidad de dividir el audio en fragmentos.
- Analisis de llamadas de atencion al cliente: la diarizacion integrada facilita distinguir entre agente y cliente, y las hotwords personalizadas permiten reconocer nombres de productos o terminos corporativos con mayor precision.
- Transcripcion medica y clinica: con hotwords especificas de terminologia medica, el modelo puede transcribir consultas o dictados de hasta una hora, manteniendo la identidad de cada hablante (paciente, medico, enfermero).
- Generacion de actas judiciales o legales: la capacidad de manejar audios largos y la diarizacion de locutores resultan utiles para registrar declaraciones o vistas con multiples intervinientes.
- Investigacion sociolinguistica: el soporte de mas de 50 idiomas y el cambio de codigo nativo permiten analizar conversaciones multilingues reales sin necesidad de configuracion previa del idioma.
- Despliegue en produccion con vLLM: al ser compatible con vLLM, puede integrarse en pipelines de transcripcion a gran escala con baja latencia y alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye figuras comparativas de DER (Diarization Error Rate), cpWER (concatenated minimum-permutation Word Error Rate) y tcpWER (time-constrained cpWER), pero no se proporcionan los valores concretos en el texto. Por tanto, no es posible presentar una tabla de resultados verificables.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware en la documentacion del modelo.
- Con 8 674 021 857 parametros (~8,67 B), una estimacion razonable para inferencia en FP16 seria de aproximadamente 17 GB de VRAM solo para los pesos, mas overhead de activaciones y memoria del runtime. Por tanto, una GPU con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) podria ser suficiente para inferencia en precision FP16.
- Para GPUs con menos memoria, seria necesario aplicar cuantizacion (por ejemplo, INT8 o INT4), aunque no se han publicado versiones cuantizadas oficiales ni requisitos de VRAM para dichos formatos.
- El modelo es compatible con el ecosistema Transformers de Hugging Face y con vLLM, como se indica en la documentacion del proyecto. Tambien esta disponible en Azure AI Foundry (Microsoft Foundry Models) con un endpoint compatible con la API de OpenAI Chat Completions.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con modelos alternativos en la informacion disponible. El modelo compite en el espacio de ASR multilingue de gran escala con sistemas como Whisper large-v3 (de OpenAI), pero no se han publicado resultados comparativos directos entre ambos. Por tanto, no es posible ofrecer una tabla comparativa con datos verificables.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos potenciales del modelo. Como cualquier sistema ASR entrenado con datos masivos, puede presentar sesgos relacionados con acentos, dialectos o variedades regionales de los idiomas soportados.
- Riesgo de alucinacion: aunque no se documenta explicitamente, los modelos ASR de gran tamano pueden generar transcripciones incorrectas o inventar contenido en segmentos de audio ambiguos o con ruido.
- Limitaciones de contexto: la ventana de 64 000 tokens equivale a 60 minutos de audio, por lo que audios mas largos requeririan segmentacion, lo que podria afectar a la coherencia global y a la diarizacion.
- Restricciones de idioma: aunque soporta mas de 50 idiomas, la cobertura de variedades dialectales o idiomas minoritarios no esta garantizada.
- Licencia MIT: permite uso comercial y modificacion, pero el usuario es responsable del cumplimiento de las normativas aplicables (por ejemplo, proteccion de datos en transcripciones de audio).
- No se han publicado directrices de seguridad ni evaluaciones de comportamiento ofensivo o inapropiado. El equipo de Microsoft Research indica que se actualizara el repositorio con mitigaciones si se detectan problemas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microsoft/VibeVoice-ASR
- Repositorio GitHub: https://github.com/microsoft/VibeVoice
- Demo en vivo: https://aka.ms/vibevoice-asr
- Informe tecnico (arXiv): https://arxiv.org/pdf/2601.18184
- Guia de finetuning: https://github.com/microsoft/VibeVoice/blob/main/finetuning-asr/README.md
- Documentacion de despliegue con vLLM: https://github.com/microsoft/VibeVoice/blob/main/docs/vibevoice-vllm-asr.md
- Pagina del proyecto: https://microsoft.github.io/VibeVoice/
- Catalogo de modelos de Azure AI Foundry: https://ai.azure.com/catalog/models/microsoft-vibevoice-asr-hf
- Pagina de Microsoft Foundry Labs: https://labs.ai.azure.com/innovations/vibevoice-asr/
