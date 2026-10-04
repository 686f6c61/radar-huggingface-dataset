# seamon67/whisper-large-v3

## Resumen

seamon67/whisper-large-v3 es una version cuantizada a BF16 del modelo openai/whisper-large-v3, publicado por el usuario seamon67 en Hugging Face. No se trata de un entrenamiento nuevo ni de un ajuste fino: la model card indica explicitamente que el modelo se cuantizo a BF16 a partir del checkpoint original de OpenAI, por lo que hereda integramente la arquitectura, los pesos y el comportamiento del modelo base. Su relevancia es practica: ofrece el mismo sistema de reconocimiento automatico del habla (ASR) en un formato de pesos mas ligero (3,1 GB de repositorio) y con soporte nativo de safetensors.

Whisper large-v3 es un modelo de tipo encoder-decoder basado en transformer, con 1.543.490.560 parametros, disenado para transcripcion de audio y traduccion de voz a texto. Fue entrenado sobre mas de 5 millones de horas de audio etiquetado y demuestra capacidad de generalizacion zero-shot a dominios y conjuntos de datos no vistos. La version large-v3 introduce dos cambios respecto a large-v2: el espectrograma de entrada usa 128 bins de frecuencia Mel en lugar de 80, y se anade un token de idioma para el cantonés.

El modelo cubre alrededor de 99 idiomas y esta liberado bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales. Es una opcion consolidada para pipelines de transcripcion multilingue en produccion, con un ecosistema maduro de herramientas de despliegue (Transformers, faster-whisper, whisper.cpp).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) para ASR |
| Parametros totales | 1.543.490.560 (aprox. 1,54 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos (1500 frames de entrada); 448 tokens maximos de salida por ventana |
| Tipos de cuantizacion | BF16 (unica documentada en este repositorio); el modelo base admite fp16, fp32 e int8 mediante herramientas externas |
| Idiomas soportados | Aproximadamente 99 idiomas, incluidos espanol, ingles, chino, aleman, frances, italiano, portugues, ruso, japones, arabe, hindi y catalan |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

Whisper large-v3 emplea una arquitectura transformer encoder-decoder. El encoder procesa espectrogramas log-Mel de 128 bins en ventanas de 30 segundos y el decoder genera texto de forma autoregresiva, con tokens especiales que controlan la tarea (transcripcion o traduccion), el idioma y las marcas de tiempo. Respecto a large y large-v2, la unica diferencia arquitectonica relevante es el cambio de 80 a 128 bins Mel y la incorporacion de un token de idioma para el cantonés.

Segun la model card original, el modelo se entreno sobre 1 millon de horas de audio con etiquetado debil y 4 millones de horas de audio pseudo-etiquetado generado con Whisper large-v2, completando 2,0 epocas sobre ese conjunto combinado. No se documenta en la informacion disponible el uso de RLHF ni DPO. OpenAI reporta que large-v3 reduce la tasa de error entre un 10 % y un 20 % frente a large-v2 en una amplia variedad de idiomas. Esta ficha corresponde a una conversion a BF16, por lo que no hay reentrenamiento ni modificacion de los pesos mas alla de la precision numerica.

## Capacidades

- Transcripcion automatica del habla (ASR) en aproximadamente 99 idiomas, con deteccion automatica del idioma de origen.
- Traduccion de voz a texto en ingles (tarea `translate`), ademas de la transcripcion en el idioma original.
- Prediccion de marcas de tiempo a nivel de frase y a nivel de palabra.
- Gestion de audio de duracion arbitraria mediante segmentacion en ventanas de 30 segundos.
- Estrategias de decodificacion avanzadas: temperature fallback, condition on previous tokens, umbrales de compresion, umbrales de log-probabilidad y deteccion de ausencia de habla.
- Inferencia por lotes (batch) para transcribir varios ficheros en paralelo.
- No dispone de tool calling, function calling ni capacidades de agente o razonamiento multi-paso: es un modelo puramente acustico-textual.
- No soporta vision ni audio como salida; unicamente audio como entrada y texto como salida.

## Casos de uso

- Transcripcion de reuniones y videoconferencias: el modelo convierte el audio en texto con marcas de tiempo a nivel de palabra, lo que permite generar actas alineadas con el hablante y facilitar la busqueda dentro de la grabacion.
- Subtitulado automatico de video: la salida con timestamps por frase o por palabra se integra directamente en formatos de subtitulos (SRT/VTT) para plataformas de contenido en multiples idiomas.
- Atencion al cliente y analitica de llamadas: transcripcion masiva de grabaciones de call center para clasificacion posterior, control de calidad y extraccion de motivos de contacto, con cobertura de los idiomas mas habituales en Europa.
- Traduccion de voz a ingles: usando la tarea `translate`, se puede convertir audio en idiomas como espanol, aleman o japones a texto en ingles para documentacion o analisis interno.
- Accesibilidad: generacion de transcripciones en directo para personas con discapacidad auditiva en entornos educativos o conferencias, con soporte de decenas de idiomas.
- Archivado y busqueda de contenido audiovisual: indexacion de bibliotecas de audio o video (podcasts, archivos de radio, entrevistas) mediante transcripcion y busqueda por texto.
- Asistencia clinica o legal: transcripcion de dictados y audiencias donde se requiere texto fiel y marcas temporales, siempre con revision humana posterior por el riesgo de error en terminos especializados.
- Procesamiento de audio multilingue en dispositivos: con cuantizacion adicional (int8 o formatos GGUF) puede ejecutarse en portatiles o equipos con GPU modesta para transcripcion local sin enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio concreto. La model card original de OpenAI afirma una reduccion de errores de entre el 10 % y el 20 % de large-v3 frente a large-v2 en una amplia variedad de idiomas, pero no se incluyen cifras detalladas de MMLU, WER por conjunto de datos ni comparativas numericas en la informacion proporcionada.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 3,1 GB en BF16, unos 3,1 GB en fp16 y unos 6,2 GB en fp32.
- VRAM estimada para inferencia: alrededor de 5-6 GB con BF16/fp16 incluyendo activaciones y cache; unos 8-10 GB en fp32; aproximadamente 1,7-2,5 GB con cuantizacion int8.
- GPU recomendadas: A100, H100 o L40S para despliegues de alto volumen; RTX 4090, RTX 3090 o A10G para produccion de gama media; RTX 3060 de 12 GB o similares para desarrollo.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o incluso una GPU de 8 GB con fp16 o int8 pueden ejecutarlo. Con cuantizacion adicional puede correr en CPU con latencia mayor.
- Opciones de despliegue: Transformers con la clase `AutomaticSpeechRecognitionPipeline`, faster-whisper (CTranslate2, con soporte de int8), whisper.cpp y formatos GGUF, y vLLM en versiones recientes. No se documenta soporte en TGI en la informacion disponible.
- Latencia y throughput: no disponible. Dependen fuertemente del hardware, del backend (CTranslate2 es notablemente mas rapido que Transformers en CPU) y de la longitud del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| seamon67/whisper-large-v3 (esta ficha) | 1,54 mil millones | Ventanas de 30 s | Aprox. 99 | Apache-2.0 | Conversion BF16 del checkpoint de OpenAI |
| openai/whisper-large-v3 | 1,54 mil millones | Ventanas de 30 s | Aprox. 99 | Apache-2.0 | Modelo original en fp16/fp32 |
| openai/whisper-large-v2 | No disponible en la informacion proporcionada | Ventanas de 30 s | Aprox. 99 | Apache-2.0 | 80 bins Mel, sin token de cantonés; entre un 10 % y un 20 % mas de error segun OpenAI |
| openai/whisper-turbo | No disponible en la informacion proporcionada | Ventanas de 30 s | Aprox. 99 | Apache-2.0 | Version optimizada para velocidad con degradacion minima de precision, segun el repositorio de OpenAI |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada para cuantificar las diferencias de WER entre estos modelos.

## Limitaciones y advertencias

- Es una cuantizacion a BF16 del modelo original: no aporta mejoras de precision ni de capacidades respecto a openai/whisper-large-v3, y cualquier diferencia numerica es minima pero no verificada en este repositorio.
- Riesgo de alucinacion en audio con ruido, silencios prolongados, musica o habla solapada; Whisper puede generar texto plausible no presente en el audio. Se recomienda usar los umbrales de `no_speech_threshold`, `logprob_threshold` y `compression_ratio_threshold`.
- El rendimiento varia notablemente segun el idioma: los resultados en ingles son mejores que en idiomas con menos representacion en los datos de entrenamiento.
- La ventana de 30 segundos obliga a segmentar el audio; una segmentacion incorrecta puede degradar la calidad de la transcripcion en los limites de cada fragmento.
- No es un modelo de razonamiento ni de dialogo: no soporta instrucciones, tool calling ni agentes. Su unico proposito es ASR y traduccion de voz.
- Sesgos: el modelo puede reproducir sesgos presentes en los datos de entrenamiento, incluidos sesgos de genero, acento o variedad dialectal, con peor desempeno en acentos poco representados.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique los cambios realizados. No hay restricciones adicionales documentadas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado en octubre de 2026. Para produccion puede ser preferible usar directamente el checkpoint oficial de OpenAI, con mejor trazabilidad y mantenimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/seamon67/whisper-large-v3
- Modelo base oficial: https://huggingface.co/openai/whisper-large-v3
- Paper de Whisper (Robust Speech Recognition via Large-Scale Weak Supervision): https://huggingface.co/papers/2212.04356
- Repositorio de OpenAI Whisper en GitHub: https://github.com/openai/whisper
- Discusion del lanzamiento de large-v3: https://github.com/openai/whisper/discussions/1762
- Endpoint de inferencia alternativo (FriendliAI, variante TheWhisper-Large-V3): https://friendli.ai/models/seamon67/thewhisper-large-v3
- Repositorio equivalente de terceros: https://huggingface.co/versae/whisper-large-v3
