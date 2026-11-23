# aoiandroid/indicconformer-ta-ctc-coreml

## Resumen

IndicConformer_ta_CTC es una conversión a Core ML del modelo de reconocimiento automático del habla (ASR) `ai4bharat/indicconformer_stt_ta_hybrid_ctc_rnnt_large`, desarrollado originalmente por AI4Bharat. El modelo original es un sistema híbrido CTC/RNNT basado en arquitectura Conformer, especializado en transcripción de tamil (ta), una lengua dravídica hablada principalmente en el estado indio de Tamil Nadu y en Sri Lanka. Esta versión concreta, publicada por el usuario aoiandroid, recorta la cabeza CTC para limitarla a los tokens del tamil, integra el frontend log-mel en el propio grafo y fija una ventana de audio de 10 segundos.

La relevancia de esta conversión reside en su orientación a despliegue en el ecosistema Apple mediante Core ML, lo que permite ejecutar el reconocimiento de voz en dispositivos con chips de la serie M o A sin depender de infraestructura de servidor. El repositorio ocupa aproximadamente 0,2 GB, un tamaño compatible con aplicaciones móviles y de escritorio. La conversión se realizó con NeMo 1.23.0 y coremltools 8.1 mediante el script `ic_coreml_convert.py`, en el contexto del proyecto TranslateBlue.

No se dispone de información sobre el pipeline declarado, los idiomas formalmente etiquetados ni la licencia del artefacto publicado en Hugging Face; la model card únicamente menciona que el modelo original de AI4Bharat se distribuye bajo licencia MIT. Se trata de un artefacto derivado de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a un caso de uso muy específico: ASR de tamil en local sobre hardware Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer híbrido CTC/RNNT (cabeza CTC recortada a tokens tamil en esta conversión) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 10 s por inferencia |
| Tipos de cuantizacion | no disponible (formato Core ML; precisión numérica no especificada) |
| Idiomas soportados | tamil (ta) |
| Licencia | no disponible para el artefacto Core ML; el modelo original es MIT (AI4Bharat) |
| Formato de pesos | Core ML (.mlpackage / .mlmodel) |

## Arquitectura y entrenamiento

El modelo subyacente es un Conformer, una arquitectura que combina bloques de autoatención con convoluciones profundas para capturar tanto dependencias globales como patrones acústicos locales en secuencias de audio. El checkpoint original de AI4Bharat es un sistema híbrido que expone dos cabezas, CTC y RNNT, entrenado sobre datos de habla en lenguas indias. En esta conversión se ha conservado únicamente la cabeza CTC, recortada a los tokens correspondientes al tamil, lo que simplifica el grafo y elimina la decodificación RNNT.

La conversión integra el frontend log-mel dentro del propio modelo Core ML, de modo que la entrada es audio y no características precalculadas, y fija una ventana de 10 segundos. El proceso se realizó con NeMo 1.23.0 y coremltools 8.1. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo original empleó RLHF, DPO u otras técnicas de ajuste; la model card de esta conversión tampoco detalla la precisión numérica de los pesos exportados.

## Capacidades

- Reconocimiento automático del habla (ASR) para tamil, con salida de transcripción a nivel de token mediante decodificación CTC.
- Procesamiento de audio en ventanas de 10 segundos por inferencia.
- Frontend log-mel integrado: acepta audio directamente, sin preprocesado externo de características.
- Ejecución en local sobre hardware Apple mediante Core ML (CPU, GPU o Neural Engine según el despliegue).
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades generativas.
- No se ha documentado soporte multilingüe más allá del tamil.
- No se ha documentado capacidad de visión, audio generativo ni modo de razonamiento explícito.

## Casos de uso

- Transcripción de voz en tamil en aplicaciones iOS y macOS: el modelo puede integrarse como componente Core ML en una app nativa para convertir audio del micrófono en texto sin enviar datos a un servidor, aprovechando la ventana de 10 s para dictado por fragmentos.
- Subtitulado local de contenido audiovisual en tamil: dado que el frontend log-mel está integrado, un pipeline puede segmentar el audio en bloques de 10 s y alimentar el modelo directamente para generar subtítulos sin dependencia de la nube.
- Asistentes de voz offline para hablantes de tamil: el tamaño de 0,2 GB y el formato Core ML permiten empaquetar el modelo en una app de escritorio o móvil para reconocimiento de comandos y dictado en entornos sin conectividad.
- Herramientas de accesibilidad: transcripción en tiempo real de conversaciones para personas con discapacidad auditiva en contextos tamilófonos, ejecutándose en el propio dispositivo y preservando la privacidad del audio.
- Investigación en ASR de lenguas de bajos recursos: el artefacto sirve como punto de partida para comparar el rendimiento de la cabeza CTC recortada frente al modelo híbrido completo de AI4Bharat en condiciones de despliegue en dispositivo.
- Integración en el proyecto TranslateBlue: según la model card, la conversión se realizó para este proyecto, por lo que su uso previsto es la traducción o transcripción de tamil dentro de ese pipeline, con inferencia local en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; al ser un modelo Core ML, el consumo depende del backend elegido (CPU, GPU integrada o Neural Engine) y de la cuantización interna, que no se especifica. El repositorio ocupa 0,2 GB, lo que da una cota superior aproximada del peso en disco y en memoria.
- GPU recomendadas: hardware Apple con soporte Core ML, es decir, chips de la serie M (M1 en adelante) y chips A recientes con Neural Engine. No se documenta soporte para GPU NVIDIA.
- Compatibilidad con GPU de consumo: el modelo está pensado para ejecutarse en equipos Apple de consumo; no se ha validado su uso en GPUs NVIDIA de consumo como la RTX 4090.
- Opciones de despliegue: Core ML de forma nativa (Xcode, coremltools, Vision/Core ML APIs). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de artefacto.
- Latencia y throughput: no disponibles. Dependerán del chip, del backend Core ML seleccionado y de la longitud del audio procesado en cada ventana de 10 s.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| aoiandroid/indicconformer-ta-ctc-coreml | Conformer CTC (Core ML) | tamil | ventana de 10 s | Core ML | no disponible (original MIT) | Hugging Face, 0 descargas |
| ai4bharat/indicconformer_stt_ta_hybrid_ctc_rnnt_large | Conformer híbrido CTC/RNNT | tamil | no disponible | NeMo (.nemo) | MIT | Hugging Face (AI4Bharat) |
| Whisper (OpenAI) | Transformer encoder-decoder | multilingüe, incluye tamil | 30 s por ventana | PyTorch, GGUF, Core ML (conversiones de terceros) | MIT | Amplia |

La comparación con Whisper es pertinente porque cubre tamil entre sus idiomas y existen conversiones a Core ML de la comunidad; sin embargo, no se dispone de datos de benchmarks que permitan comparar la precisión de esta conversión concreta frente a Whisper en tamil. El modelo original de AI4Bharat es la referencia directa, y esta conversión sacrifica la cabeza RNNT y el multilingüismo a cambio de un artefacto más simple y desplegable en Apple.

## Limitaciones y advertencias

- El artefacto no declara licencia propia en Hugging Face; aunque el modelo original es MIT, la ausencia de licencia explícita en la conversión genera incertidumbre para uso comercial. Conviene verificar los términos con el autor antes de distribuirlo en producción.
- El modelo solo cubre tamil; no es multilingüe y no debe esperarse transcripción correcta de otras lenguas indias ni del inglés.
- La ventana fija de 10 s implica que audios más largos deben segmentarse, con el riesgo de cortes en fronteras de palabras y pérdida de contexto entre segmentos.
- Al conservar solo la cabeza CTC, se renuncia a la decodificación RNNT del modelo original, lo que puede reducir la precisión respecto al checkpoint híbrido completo; no se han publicado métricas que cuantifiquen esta diferencia.
- Riesgo de alucinación y errores en audio con ruido, acento no estándar, solapamiento de hablantes o vocabulario especializado; no se documentan evaluaciones en estos escenarios.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo día, lo que sugiere una validación comunitaria mínima.
- No se especifican sesgos conocidos ni la composición demográfica del dataset de entrenamiento original.
- No se documenta la precisión numérica de los pesos Core ML, lo que dificulta estimar posibles degradaciones frente al modelo en punto flotante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aoiandroid/indicconformer-ta-ctc-coreml
- Modelo original de AI4Bharat: https://huggingface.co/ai4bharat/indicconformer_stt_ta_hybrid_ctc_rnnt_large
- Repositorio de AI4Bharat (IndicConformer): no disponible en la información proporcionada
- Paper de IndicConformer: no disponible en la información proporcionada
- coremltools: no disponible en la información proporcionada
- Proyecto TranslateBlue: no disponible en la información proporcionada
