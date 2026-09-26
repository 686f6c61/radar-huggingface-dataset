# csndhanasekar/sherpa-onnx-indicconformer-ta-int8

## Resumen

El modelo `csndhanasekar/sherpa-onnx-indicconformer-ta-int8` es una exportación cuantizada a INT8 del checkpoint tamil de AI4Bharat IndicConformer (`ai4bharat/indicconformer_stt_ta_hybrid_ctc_rnnt_large`), un Conformer de aproximadamente 120 millones de parámetros para reconocimiento automático del habla (ASR) en tamil. La conversión la firma el usuario csndhanasekar y está pensada para ejecutarse con la librería sherpa-onnx (proyecto k2-fsa), que permite inferencia offline sobre CPU sin depender de PyTorch ni de NeMo en tiempo de ejecución.

El problema que resuelve es doble: por un lado, llevar un modelo ASR tamil de calidad razonable a entornos donde no hay GPU ni stack de entrenamiento (móviles, Raspberry Pi, servidores modestos); por otro, reducir la huella de disco y memoria mediante cuantización dinámica de pesos con onnxruntime. El repositorio ocupa 0,1 GB, coherente con un modelo INT8 de este tamaño.

Es relevante ahora porque el ecosistema sherpa-onnx se ha consolidado como una vía estándar para desplegar ASR en producción con latencia baja y sin dependencias pesadas, y porque el tamil es una lengua con relativamente pocos modelos ASR abiertos de uso libre. La licencia MIT, heredada del modelo original, facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder Conformer + cabeza CTC; el checkpoint original es híbrido CTC/RNNT, esta exportación conserva solo CTC) |
| Parametros totales | ~120 millones (según la model card del autor) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. Reconocedor offline: procesa el enunciado completo en una sola pasada, sin ventana declarada |
| Tipos de cuantizacion | INT8 dinámico sobre pesos (onnxruntime) |
| Idiomas soportados | Tamil (ta) únicamente |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.int8.onnx`) + fichero `tokens.txt` (257 entradas: 256 tokens tamil + blank) |
| Entrada de audio | Log-mel de 80 dimensiones, normalización por característica, calculada internamente por sherpa-onnx |
| Frecuencia de muestreo | 16 kHz |
| Modelo base | ai4bharat/indicconformer_stt_ta_hybrid_ctc_rnnt_large |
| Libreria de inferencia | sherpa-onnx |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un Conformer, es decir, un transformer que combina bloques de auto-atención con convoluciones depthwise para capturar dependencias locales y globales en la señal de audio. El checkpoint original de AI4Bharat es híbrido: dispone de cabeza CTC y cabeza RNNT sobre un mismo encoder, y comparte un vocabulario de 22 lenguas indias (22 × 256 tokens más el token blank). Esta exportación elimina las cabezas no CTC y recorta el vocabulario a los 256 tokens tamil más el blank, replicando lo que hace el modelo original cuando se decodifica con `language_id="ta"`.

El resultado son 257 entradas en `tokens.txt`, lo que implica que el modelo exportado ya no puede transcribir ninguna de las otras 21 lenguas del checkpoint original: esa capacidad se sacrifica a cambio de un vocabulario más pequeño y una decodificación más directa. La cuantización aplicada es dinámica en INT8 sobre los pesos mediante onnxruntime, sin reentrenamiento ni ajuste fino posterior. No se documenta en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo etapas de RLHF o DPO (poco habituales en ASR), ni detalles del scheduler o del optimizador empleados por AI4Bharat.

## Capacidades

- Reconocimiento de voz offline en tamil a partir de audio de 16 kHz, con extracción de características log-mel de 80 dimensiones integrada en sherpa-onnx.
- Decodificación CTC greedy sobre la cabeza CTC del Conformer original.
- Inferencia sobre CPU con onnxruntime, sin GPU y sin dependencias de PyTorch o NeMo.
- Ejecución embebida mediante la API de sherpa-onnx (`OfflineRecognizer.from_nemo_ctc`), disponible en Python, C++, C#, Java, Kotlin, Swift y otras integraciones del proyecto k2-fsa.
- Configuración de hilos de cómputo mediante el parámetro `num_threads`.
- No soporta tool calling ni function calling: es un modelo puramente acústico.
- No dispone de modo de razonamiento (*thinking*), ni de capacidades de agente, ni de procesamiento multi-turno.
- No procesa visión, audio más allá del reconocimiento, ni texto de entrada.
- Multilingüismo: no. Solo tamil; los tokens de las otras 21 lenguas indias fueron eliminados en la exportación.
- No se documenta soporte de puntuación, capitalización ni marcas de tiempo en la información disponible.

## Casos de uso

- **Transcripción de voz en tamil en dispositivos móviles**: al ser un modelo INT8 de ~120 MB, puede empaquetarse dentro de una aplicación Android o iOS mediante sherpa-onnx y transcribir dictado o notas de voz sin conexión ni envío de audio a la nube, lo que reduce costes y evita problemas de privacidad.
- **Subtitulado automático de contenido audiovisual en tamil**: integrado en un pipeline de extracción de audio, se puede generar subtítulos para vídeo bajo demanda, cursos o archivos de vídeo, aceptando un WER del 33,5 % si después se aplica una revisión humana o un modelo de corrección.
- **Atención al cliente en centros de contacto**: como primer eslabón de un pipeline ASR → traducción → LLM, permite transcribir llamadas en tamil para clasificación de intención, análisis de sentimiento o generación de resúmenes de conversación. Su licencia MIT elimina fricción legal en despliegues comerciales.
- **Indexación y búsqueda de archivos sonoros**: transcripción masiva de entrevistas, podcasts o archivos de radio en tamil para construir un índice de texto buscable, aprovechando que la inferencia en CPU permite escalar horizontalmente con máquinas baratas.
- **Accesibilidad para personas con discapacidad auditiva**: generación de transcripciones en vivo o diferidas de charlas, clases y reuniones en tamil, con despliegue local en portátiles de gama media.
- **Investigación lingüística y construcción de corpus**: generación de transcripciones automáticas de grabaciones de campo en tamil para su posterior anotación y análisis fonético o morfológico, usando el modelo como preanotador que reduce el trabajo manual.
- **Preprocesado para pipelines de traducción tamil → castellano/inglés**: el texto transcrito se puede alimentar a un modelo de traducción, de modo que el sistema completo funcione como traductor de voz sin necesidad de un ASR multilingüe grande.
- **Sistemas de voz embebidos en kioscos o terminales**: al no requerir GPU ni servicio externo, encaja en hardware tipo Raspberry Pi o mini-PC que necesite interacción por voz en tamil.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden a las primeras 100 frases distintas del split de test `ta_in` de FLEURS, en minúsculas y sin puntuación, tal como los reporta la model card del autor. No son directamente comparables con cifras de FLEURS con normalización estándar.

| Modelo | WER | CER |
|---|---|---|
| Este modelo (IndicConformer tamil, INT8, CTC) | 33,5 % | 16,7 % |
| AI4Bharat IndicConformer original (PyTorch, CTC) | 32,1 % | 16,4 % |
| AI4Bharat IndicConformer original (PyTorch, RNNT) | 31,3 % | 16,2 % |
| Dolphin small CTC INT8 | 66,3 % | 30,7 % |
| Omnilingual 300M CTC INT8 | 57,9 % | 17,8 % |

La cuantización INT8 introduce una degradación de 1,4 puntos de WER y 0,3 puntos de CER respecto a la cabeza CTC del modelo original en FP32, y de 2,2 puntos de WER respecto a la decodificación RNNT, que no está disponible en esta exportación.

## Requisitos de hardware

- **Peso del modelo**: el repositorio completo ocupa 0,1 GB; el fichero `model.int8.onnx` de pesos INT8 ronda los 120 MB, con lo que la huella en memoria durante la inferencia es muy baja (del orden de unos pocos cientos de MB incluyendo buffers intermedios).
- **VRAM**: no necesita GPU. En caso de usar GPU, el consumo sería inferior a 1 GB, pero no aporta ventajas frente a CPU por el tamaño del modelo.
- **GPU recomendadas**: prácticamente cualquiera serviría (RTX 3060, RTX 4090, T4, A100, H100), pero lo razonable es ejecutarlo en CPU. En GPU solo tendría sentido por integración con otros modelos del mismo pipeline.
- **GPU de consumo**: cabe en cualquier GPU de consumo, incluso en iGPU y en SoC móviles.
- **CPU**: cualquier procesador x86-64 o ARM moderno con al menos 2 núcleos; el parámetro `num_threads` permite ajustar el paralelismo. También es viable en Raspberry Pi 4/5.
- **Opciones de despliegue**: sherpa-onnx (Python, C++, C#, Java, Kotlin, Swift, Go, Rust, Dart, entre otros), onnxruntime directamente, y cualquier runtime compatible con ONNX (por ejemplo, contenedores con ONNX Runtime Server). No es compatible con vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponibles en la información proporcionada. Al ser un reconocedor offline de ~120 M de parámetros cuantizado a INT8, es razonable esperar un factor de tiempo real holgado en CPU moderna, pero no hay cifras publicadas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER (FLEURS ta_in, 100 frases) | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Este modelo (IndicConformer tamil INT8) | ~120 M | Tamil | 33,5 % | MIT | ONNX INT8, sherpa-onnx |
| AI4Bharat IndicConformer tamil original | ~120 M | 22 lenguas indias (incl. tamil) | 32,1 % (CTC) / 31,3 % (RNNT) | MIT | NeMo / PyTorch |
| Dolphin small CTC INT8 | No disponible | No disponible | 66,3 % | No disponible | ONNX INT8, sherpa-onnx |
| Omnilingual 300M CTC INT8 | ~300 M | No disponible | 57,9 % | No disponible | ONNX INT8, sherpa-onnx |

Frente al checkpoint original, esta versión pierde las otras 21 lenguas indias y la cabeza RNNT (2,2 puntos de WER), pero gana portabilidad: el modelo original exige el stack de NeMo para inferencia, mientras que esta exportación se ejecuta con onnxruntime en CPU. Frente a Dolphin small y Omnilingual 300M en sus versiones INT8, el modelo aquí descrito obtiene un WER notablemente mejor (33,5 % frente a 66,3 % y 57,9 %), aunque la CER de Omnilingual (17,8 %) está próxima a la de este modelo (16,7 %), lo que sugiere un comportamiento distinto en la longitud de los errores.

## Limitaciones y advertencias

- **Cobertura de idioma única**: solo tamil. Los tokens de las otras 21 lenguas indias presentes en el checkpoint original se eliminaron, de modo que alimentar audio en hindi, telugu u otras lenguas indias producirá salidas sin sentido o directamente vacías.
- **Tasa de error elevada en términos absolutos**: un WER del 33,5 % implica que aproximadamente una de cada tres palabras se transcribe mal en el conjunto de evaluación usado. No es adecuado para transcripción directa sin revisión en contextos donde la exactitud sea crítica (actas médicas, documentos legales, subtítulos publicados sin edición).
- **Riesgo de alucinación y repeticiones**: como todo modelo CTC entrenado con datos limitados, puede producir secuencias repetitivas o texto plausible pero incorrecto cuando la señal es ruidosa, contiene silencios largos o mezcla idiomas. No hay mecanismo de detección de habla no soportada.
- **Ausencia de puntuación, mayúsculas y normalización**: la evaluación se hizo sobre texto en minúsculas y sin puntuación, lo que indica que el modelo no restituye puntuación ni capitalización. Habrá que añadir un modelo de postprocesado si se necesita texto legible.
- **Degradación introducida por la cuantización**: 1,4 puntos de WER y 0,3 puntos de CER respecto al modelo original en FP32 con cabeza CTC. Para aplicaciones donde cada punto cuenta, conviene evaluar la versión sin cuantizar.
- **Dominio de entrenamiento desconocido**: no se documentan en la información disponible los corpus usados por AI4Bharat. El rendimiento en audio telefónico de 8 kHz, audio con ruido de fondo, acentos no representados o habla espontánea puede ser sensiblemente peor que en FLEURS, que es audio de lectura relativamente limpio.
- **Comparabilidad de las métricas**: los números de WER y CER provienen de las primeras 100 frases distintas del split `ta_in`, con normalización propia (minúsculas, sin puntuación). No son equiparables a cifras de FLEURS publicadas con otras convenciones.
- **Licencia**: MIT, heredada del modelo de AI4Bharat. Permite uso comercial, modificación y redistribución con atribución y conservación del aviso de copyright. No hay cláusulas de uso aceptable adicionales documentadas.
- **Madurez del repositorio**: cero descargas y cero *likes* en el momento de la consulta, un único autor y un periodo de publicación concentrado en minutos (creado y actualizado el mismo día). Conviene verificar la integridad de los ficheros antes de usarlo en producción.
- **Sin soporte de tool calling, agentes ni multi-turno**: cualquier flujo conversacional debe construirse alrededor del modelo con componentes externos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/csndhanasekar/sherpa-onnx-indicconformer-ta-int8
- Modelo base (AI4Bharat IndicConformer tamil): https://huggingface.co/ai4bharat/indicconformer_stt_ta_hybrid_ctc_rnnt_large
- Repositorio sherpa-onnx (k2-fsa): https://github.com/k2-fsa/sherpa-onnx
- AI4Bharat: organización responsable del modelo original (enlace no incluido en la información proporcionada)
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces recuperados corresponden a foros no relacionados con IA ni con reconocimiento de voz.
- No se han encontrado en la información disponible artículos, *papers*, demostraciones ni repositorios adicionales asociados específicamente a esta exportación.
