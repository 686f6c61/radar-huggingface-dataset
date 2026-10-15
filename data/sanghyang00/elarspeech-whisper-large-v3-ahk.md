# Sanghyang00/ELARSpeech-Whisper-Large-v3-ahk

## Resumen

ELARSpeech-Whisper-Large-v3-ahk es un modelo de reconocimiento automatico del habla (ASR) monoidioma para el akha (ISO 639-3: `ahk`), una lengua tibeto-birmana hablada en zonas de China, Myanmar, Laos y Tailandia. Lo publica el usuario Sanghyang00 en Hugging Face como parte del proyecto ELARSpeech, que segun su repositorio de GitHub reune un conjunto de datos de 30.000 horas en 675 lenguas escasamente representadas. El modelo es un ajuste fino del checkpoint `openai/whisper-large-v3` de OpenAI, por lo que hereda la arquitectura encoder-decoder de tipo transformer de Whisper.

Tecnicamente se trata de un `WhisperForConditionalGeneration` con 1.543.491.840 parametros (dato leido directamente de los pesos safetensors del repositorio, 6,2 GB), lo que corresponde al tamano Large-v3 de la familia Whisper. La salida del modelo es texto transcrito en akha; no es un modelo generativo de proposito general ni un modelo multimodal mas alla del audio de entrada. La model card indica que la inferencia debe hacerse con audio mono a 16 kHz y que se debe forzar un prompt de decodificador explicito con el token de lengua `<|ahk|>`, en lugar de usar el parametro `language=`, para reproducir el comportamiento del checkpoint exportado.

Su relevancia es la de cubrir una lengua de cola larga practicamente ausente en los sistemas ASR comerciales, reutilizando el conocimiento multilingue de Whisper y un corpus especifico del proyecto ELARSpeech. El repositorio no tiene descargas ni likes y no publica cifras de WER ni comparativas con otros sistemas, por lo que su evaluacion practica requiere pruebas propias sobre el dominio de interes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `WhisperForConditionalGeneration` (transformer encoder-decoder, ajuste fino de `openai/whisper-large-v3`) |
| Parametros totales | 1.543.491.840 (segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Segmentos de audio de 30 s por ventana (arquitectura Whisper); la model card no especifica longitud de contexto en tokens |
| Tipos de cuantizacion | No disponible en el repositorio (pesos safetensors sin cuantizar); admite cuantizacion externa via CTranslate2/GGUF, sin valores publicados por el autor |
| Idiomas soportados | Akha (`ahk`), modelo monoidioma |
| Licencia | No disponible; la model card remite a la licencia del modelo base y a los terminos del dataset del proyecto ELARSpeech |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo usa la arquitectura Whisper completa: un encoder que consume espectrogramas mel de 128 bandas calculados sobre audio mono a 16 kHz y un decoder autorregresivo que genera tokens de texto condicionado por tokens especiales de tarea y lengua. La model card no detalla el numero de capas, la dimension oculta ni la composicion exacta del dataset de ajuste; el unico dato estructural explicito es `Architecture: WhisperForConditionalGeneration`, `Model size: Large-v3`, con `openai/whisper-large-v3` como modelo base. No se documentan fases de RLHF, DPO ni decodificacion especulativa.

El ajuste se enmarca en ELARSpeech, un proyecto cuyo repositorio describe un dataset de 30.000 horas repartidas en 675 lenguas infrarrepresentadas; la model card no especifica cuantas horas corresponden al subconjunto de akha ni la procedencia de las grabaciones. La unica verificacion de calidad publicada es que el artefacto exportado se compara contra el checkpoint original de ELARSpeech sobre un conjunto fijo de evaluacion, con resultado `Exact-transcription verification status: PASS`. Es decir, hay una comprobacion de equivalencia funcional entre pesos exportados y checkpoint de origen, pero no metricas de error de transcripcion.

## Capacidades

- Transcripcion de voz a texto en akha a partir de audio mono muestreado a 16 kHz.
- Decodificacion controlada por prompt explicito de tokens especiales (`<|ahk|>`, `<|transcribe|>`, `<|notimestamps|>`), con `max_new_tokens` configurable (el ejemplo de la model card usa 200).
- Decodificacion greedy o con `num_beams` configurable; el ejemplo oficial usa `num_beams=1`.
- No hay soporte declarado de traduccion a otros idiomas: el prompt oficial usa la tarea `<|transcribe|>` y la model card lo describe como modelo ASR de una sola lengua.
- No hay soporte declarado de tool calling ni de function calling.
- No hay soporte declarado de agentes ni de razonamiento multi-paso.
- No hay capacidades de vision, audio generativo, diarizacion de hablantes ni deteccion de actividad vocal integrada.
- Generacion de marcas de tiempo no documentada; el prompt de ejemplo desactiva los timestamps con `<|notimestamps|>`.

## Casos de uso

- Documentacion linguistica de campo: transcribir entrevistas y elicitaciones grabadas con hablantes de akha para producir corpus escritos anotados, aprovechando que el modelo esta ajustado especificamente a esa lengua y no a un idioma mayoritario.
- Archivado de patrimonio oral: convertir colecciones de grabaciones etnograficas o de tradicion oral en texto buscable, con audio resampleado a 16 kHz mono antes de la inferencia.
- Investigacion en lenguas de cola larga: usar el modelo como linea base de ASR para akha y comparar variantes de ajuste sobre el dataset ELARSpeech, dado que no existe una referencia publica de WER.
- Generacion de datos para otras tareas: producir transcripciones que sirvan como corpus de entrenamiento para sistemas de sintesis de voz (TTS) o de traduccion automatica en akha.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de un repositorio de grabaciones para habilitar busqueda por palabra clave sobre el contenido hablado.
- Apoyo en servicios de campo: asistencia a personal sanitario, de ONG o administrativo que trabaja con comunidades akha, generando borradores de transcripcion que despues revisa un hablante nativo.
- Subtitulado de material audiovisual en akha: generar subtitulos automaticos para videos divulgativos o educativos, con posterior correccion humana.
- Preprocesado de pipelines de NLP multilingue: integrar el modelo como primer eslabon (audio a texto) en flujos que despues aplican normalizacion ortografica o analisis morfologico sobre el akha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la verificacion de equivalencia entre el artefacto exportado y el checkpoint original de ELARSpeech sobre un conjunto fijo de evaluacion, con estado `PASS`, sin cifras de WER, CER ni comparaciones con otros sistemas.

## Requisitos de hardware

- VRAM estimada para los pesos (calculada a partir de 1.543.491.840 parametros, sin incluir activaciones ni cache): aproximadamente 6,2 GB en fp32, 3,1 GB en fp16/bf16, 1,6 GB en int8 y 1,1 GB en int4.
- VRAM estimada en inferencia real (pesos mas activaciones y buffers de audio, estimacion propia no publicada por el autor): del orden de 8-10 GB en fp32, 4-6 GB en fp16, 2,5-3,5 GB en int8 y 1,5-2,5 GB en int4.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM funciona en fp16; A100, H100, L40S o RTX 4090 son adecuadas para procesamiento por lotes en fp16/bf16.
- Cabe en GPU de consumo: si, en tarjetas tipo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 3080/4070 (10-12 GB) en fp16, y en GPUs de 6-8 GB si se cuantiza a int8 o int4.
- Opciones de despliegue: `transformers` con `WhisperForConditionalGeneration` y `WhisperProcessor` (ruta documentada por el autor), `faster-whisper`/CTranslate2, WhisperX, vLLM y Hugging Face Inference Endpoints (el repositorio esta etiquetado como `endpoints_compatible`). El soporte en llama.cpp u Ollama para este checkpoint concreto no esta documentado por el autor.
- Latencia y throughput: no disponibles. El unico indicio es que el ejemplo oficial usa `num_beams=1`, lo que reduce el coste de decodificacion frente a busqueda por haces.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Ventana de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sanghyang00/ELARSpeech-Whisper-Large-v3-ahk | 1.543.491.840 | Akha (`ahk`) | 30 s por segmento | No disponible en el repositorio | Hugging Face, 0 descargas y 0 likes en el momento de la consulta |
| openai/whisper-large-v3 | Tamano Large-v3 (parametros exactos no indicados en la informacion consultada) | Multilingue (no se detalla el numero de lenguas en la informacion consultada) | 30 s por segmento | No indicada en la informacion consultada; el buzon de la model card remite a su repositorio | Ampliamente disponible y muy descargado en Hugging Face |
| openai/whisper-large-v3-turbo | Version optimizada de large-v3 (parametros exactos no disponibles en la informacion consultada) | Multilingue | 30 s por segmento | No indicada en la informacion consultada | Ampliamente disponible en Hugging Face |
| openai/whisper-base | No disponible en la informacion consultada | Multilingue | 30 s por segmento | No indicada en la informacion consultada | Ampliamente disponible en Hugging Face |

La comparacion directa de calidad no es posible: no hay cifras de WER publicadas para el modelo de akha. La diferencia funcional frente a los Whisper genericos es la especializacion en una unica lengua de bajos recursos, a costa de perder cobertura multilingue y de no tener una licencia explicitada.

## Limitaciones y advertencias

- Modelo monoidioma: solo akha; no cubre otras lenguas ni variantes dialectales no presentes en los datos de ajuste.
- Precision variable segun condiciones de grabacion, poblacion de hablantes, ortografia y dominio, tal como advierte la propia model card.
- Entrada obligatoria mono a 16 kHz; no resamplear el audio degrada los resultados.
- Riesgo de alucinacion propio de Whisper: el modelo puede transcribir ruido similar a voz como palabras reales, especialmente en segmentos sin habla clara. Se recomienda segmentacion previa con VAD externo y revision humana.
- La decodificacion debe hacerse con el prompt explicito que incluye `<|ahk|>`, `<|transcribe|>` y `<|notimestamps|>`; usar el parametro `language=` puede alterar el comportamiento respecto al checkpoint exportado.
- Licencia no explicitada en el repositorio: antes de un uso comercial hay que verificar los terminos del proyecto ELARSpeech, los del dataset de entrenamiento y la licencia del modelo base.
- Sin cifras de WER/CER ni conjunto de evaluacion publico: no hay evidencia cuantitativa de calidad mas alla de la comprobacion de equivalencia `PASS` frente al checkpoint original.
- Sin soporte de diarizacion ni de marcas de tiempo documentado, lo que limita su uso directo en subtitulado con sincronizacion fina sin herramientas adicionales.
- Repositorio sin descargas ni likes y sin senales de mantenimiento posterior a su publicacion, lo que implica riesgo de falta de soporte y de actualizaciones.
- No es un modelo de proposito general: no tiene capacidades de razonamiento, codigo, tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sanghyang00/ELARSpeech-Whisper-Large-v3-ahk
- Repositorio del proyecto ELARSpeech: https://github.com/sanghyang00/elarspeech
- Modelo base en Hugging Face: https://huggingface.co/openai/whisper-large-v3
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Busqueda de modelos Whisper en Hugging Face: https://huggingface.co/models?sort=downloads&search=whisper
- Ficha de Whisper Large V3 en OpenSourcesAI: https://opensourcesai.com/models/whisper-large-v3/
