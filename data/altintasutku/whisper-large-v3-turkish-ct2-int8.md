# altintasutku/whisper-large-v3-turkish-ct2-int8

## Resumen

whisper-large-v3-turkish-ct2-int8 es una conversión a formato CTranslate2 con cuantización int8 del modelo de reconocimiento automático del habla turkmedstt/whisper-large-v3-turkish-general, un fine-tuning de OpenAI Whisper large-v3 especializado en turco. Lo publica el desarrollador altintasutku como artefacto de despliegue para Hece, una aplicación de escritorio de dictado de código abierto, aunque el modelo es utilizable con cualquier runtime compatible con CTranslate2 o faster-whisper.

El modelo no introduce cambios en los pesos ni en el entrenamiento: únicamente transforma el formato para reducir el peso del repositorio a 1,6 GB y permitir inferencia eficiente en CPU y GPU de gama media mediante cuantización int8. El tokenizer se toma de Systran/faster-whisper-large-v3 (MIT) porque el repositorio fine-tuneado original no incluía tokenizer.json, y la conversión verifica que el vocabulario coincide token a token con large-v3.

Es relevante para desarrolladores que necesiten transcripción de voz en turco en producción con un modelo de 1,55 mil millones de parámetros, licencia Apache-2.0 y despliegue sencillo en entornos sin infraestructura GPU dedicada. La ficha cubre las especificaciones del artefacto convertido, no las del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) |
| Parametros totales | 1,55 mil millones (Whisper large-v3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento en Whisper) |
| Tipos de cuantizacion | int8_float16 (CTranslate2) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (model.bin), tokenizer.json de Systran/faster-whisper-large-v3 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OpenAI Whisper large-v3: un transformer encoder-decoder con atención estándar, entrenado originalmente para transcripción y traducción multilingüe sobre 30 segundos de audio por ventana. El fine-tuning turco lo realizó TurkMedSTT (Muhammed Kumcu, Yağmur Tuncer) sobre el checkpoint large-v3, según indica la model card del repositorio base. No se detallan en la información disponible el número de tokens de audio, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; la model card remite a las notas de pipeline de datos del repositorio de TurkMedSTT.

La aportación de este repositorio es exclusivamente de formato: conversión con `ct2-transformers-converter` (ctranslate2 4.8.3) usando `--quantization int8_float16`, a partir de la revisión `ec03ccfcedc0cc1c553b47a607086f2bd7a386b2` del modelo fine-tuneado. Como el repositorio original carecía de `tokenizer.json`, se incorporó el de Systran/faster-whisper-large-v3 (MIT, revisión `edaa852ec7e145841d8ffdb056a99866b5f0a478`), verificando la coincidencia del vocabulario con large-v3. Los pasos exactos con checksums están en `scripts/prepare_model.py` del repositorio Hece.

## Capacidades

- Reconocimiento automático del habla (ASR) en turco, con salida de transcripción de texto.
- Segmentación y timestamps por segmento, funcionalidad estándar de la familia Whisper.
- Detección de idioma integrada en la arquitectura Whisper, aunque el fine-tuning está orientado a turco.
- Compatible con el ecosistema faster-whisper y CTranslate2, incluyendo decodificación con beam search y VAD externo.
- No soporta tool calling ni function calling: es un modelo puramente ASR.
- No dispone de modo de razonamiento explícito, visión ni audio más allá de la transcripción.
- Integración directa en la aplicación de dictado Hece mediante descarga de un clic.

## Casos de uso

- Dictado de escritorio: la aplicación Hece descarga este modelo y transcribe voz a texto en local, sin enviar audio a servicios externos, gracias a su tamaño de 1,6 GB y a la inferencia int8 en CPU.
- Subtitulado de vídeo en turco: se puede usar con faster-whisper para generar subtítulos con timestamps por segmento en pipelines de postproducción.
- Transcripción de reuniones y entrevistas: la ventana de 30 segundos por segmento de Whisper permite procesar audio largo por trozos con un VAD que gestione los cortes.
- Atención al cliente con voz: integrado en un pipeline ASR + LLM, transcribe llamadas en turco para su análisis posterior o para alimentar un agente conversacional.
- Archivado y búsqueda de contenido audiovisual: transcripción masiva de archivos de audio turcos para indexación y búsqueda textual.
- Prototipado en entornos sin GPU: la cuantización int8_float16 permite ejecutar el modelo en CPU con latencia aceptable para aplicaciones de dictado y notas de voz.
- Investigación en ASR turco: punto de partida reproducible para comparar fine-tunings turcos de Whisper con el modelo base multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER, CER ni comparativas con otros modelos; solo documenta el proceso de conversión y la verificación del vocabulario.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,6 GB de pesos en int8_float16; con overhead de runtime, entre 2 y 3 GB para inferencia en GPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3050, RTX 4060 o superiores; A100 y H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más, y también en CPU gracias a la cuantización int8.
- Opciones de despliegue: CTranslate2, faster-whisper, la aplicación Hece y cualquier runtime que cargue modelos CTranslate2.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y de la configuración de decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| altintasutku/whisper-large-v3-turkish-ct2-int8 | 1,55 mil millones | 30 s por segmento | tr | Apache-2.0 | CTranslate2 int8 |
| turkmedstt/whisper-large-v3-turkish-general | 1,55 mil millones | 30 s por segmento | tr | Apache-2.0 | safetensors (transformers) |
| openai/whisper-large-v3 | 1,55 mil millones | 30 s por segmento | multilingüe | Apache-2.0 | safetensors |
| Systran/faster-whisper-large-v3 | 1,55 mil millones | 30 s por segmento | multilingüe | MIT | CTranslate2 |

La diferencia principal frente al modelo fine-tuneado original es el formato y la cuantización, que reducen el peso y facilitan el despliegue en CPU. Frente a whisper-large-v3 y faster-whisper-large-v3, este artefacto está especializado en turco, aunque no se dispone de métricas que cuantifiquen la mejora.

## Limitaciones y advertencias

- El modelo está especializado en turco; su rendimiento en otros idiomas no está garantizado y probablemente sea inferior al de whisper-large-v3 multilingüe.
- No está pensado para uso clínico, tal como advierte la model card original.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido, silencios largos o habla superpuesta.
- Sesgos heredados de los datos de entrenamiento de Whisper y del corpus de fine-tuning turco, cuya composición no se detalla.
- La cuantización int8_float16 puede introducir una ligera degradación de precisión frente a los pesos originales en fp16; no se han publicado mediciones de esa diferencia.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir a TurkMedSTT, OpenAI y Systran según corresponda.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/altintasutku/whisper-large-v3-turkish-ct2-int8
- Modelo base fine-tuneado: https://huggingface.co/turkmedstt/whisper-large-v3-turkish-general
- Notas de pipeline de datos de TurkMedSTT: https://github.com/muhammedkumcu/turkmedstt/blob/main/docs/DATA_PIPELINE.md
- Modelo base original: https://huggingface.co/openai/whisper-large-v3
- Tokenizer utilizado: https://huggingface.co/Systran/faster-whisper-large-v3
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Aplicación Hece: https://github.com/altintasutku/hece
- Script de preparación del modelo: https://github.com/altintasutku/hece/blob/main/scripts/prepare_model.py
