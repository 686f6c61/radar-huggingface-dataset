# kramerthomas/edda-v0.2-coreml

## Resumen

Edda v0.2 CoreML es una conversión al formato CoreML del modelo de reconocimiento automático del habla Edda v0.2, desarrollado por el Alexandra Institute en el marco del proyecto CoRal y publicado por Danish Foundation Models. El modelo original es un ajuste fino completo de `openai/whisper-large-v3-turbo` sobre 2.600 horas de audio en danés, y esta variante concreta, mantenida por el usuario kramerthomas, únicamente cambia el formato de los pesos para permitir su ejecución con WhisperKit sobre Apple Silicon. Toda la capacidad de reconocimiento procede del modelo original.

La relevancia de esta ficha radica en que cubre un caso de uso muy específico: transcripción de alta calidad en danés sobre hardware de Apple (Macs con chip M-series), sin necesidad de GPU dedicada ni de infraestructura en la nube. La conversión aplica cuantización de 8 bits con paletización tanto al encoder como al decoder, lo que reduce el peso en disco a unos 850 MB (repositorio de 0,9 GB), un tamaño manejable para aplicaciones de escritorio y móviles.

El modelo solo ha sido entrenado con los tokens especiales `<|da|><|transcribe|><|notimestamps|>`, por lo que el decodificado debe realizarse sin marcas de tiempo. La model card reporta un WER del 8,5 % y un CER del 3,1 % en 60 clips del split de desarrollo de FLEURS `da_dk` con decodificado greedy en un chip M5, frente a un 19,8 % de WER si se solicitan timestamps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), convertido a CoreML |
| Parametros totales | no disponible (hereda la arquitectura de whisper-large-v3-turbo; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio propia de Whisper large-v3-turbo; el autor no la explicita) |
| Tipos de cuantizacion | 8 bits con paletización (encoder y decoder); variante `danish-foundation-models_edda-v0.2_888MB` |
| Idiomas soportados | danés (`da`) exclusivamente |
| Licencia | Apache 2.0 |
| Formato de pesos | CoreML (WhisperKit); `config.json` y `generation_config.json` copiados sin cambios del repositorio origen |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3-turbo: un transformer encoder-decoder con atención estándar, especializado en transcripción de audio. El modelo base Edda v0.2 fue entrenado por el Alexandra Institute mediante un ajuste fino completo de `openai/whisper-large-v3-turbo` sobre 2.600 horas de audio en danés, dentro del proyecto CoRal. Esta variante no introduce ningún cambio arquitectónico ni de entrenamiento: se limita a convertir los pesos a CoreML mediante `whisperkit-generate-model` de whisperkittools, con cuantización de 8 bits paletizada y sin variantes adicionales (`--allowed-nbits 8`, `--force-recipe-nbits`, `--disable-default-tests`).

Un detalle técnico determinante es que el ajuste fino se realizó exclusivamente con la secuencia de tokens `<|da|><|transcribe|><|notimestamps|>`. El modelo no ha visto ejemplos con marcas de tiempo durante el entrenamiento, de modo que solicitarlas degrada gravemente la calidad de la transcripción. La model card original reporta sus cifras con búsqueda por haces de 5 (`5-beam search`), mientras que WhisperKit decodifica de forma greedy, lo que según el autor empeora el WER en torno a 0,3 puntos.

## Capacidades

- Reconocimiento automático del habla en danés, con transcripción de audio a texto.
- Decodificado sin marcas de tiempo, condición para la que fue entrenado el modelo.
- Ejecución nativa en Apple Silicon mediante WhisperKit y CoreML.
- Modelo de una sola tarea: no soporta traducción, identificación de idioma distinta del danés, tool calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio generativo ni capacidades multimodales más allá de la entrada de audio.

## Casos de uso

- Transcripción de reuniones y entrevistas en danés en aplicaciones de escritorio para macOS: el modelo, al ejecutarse en local con CoreML sobre Apple Silicon, permite transcribir audio sin enviar datos a la nube y con un peso en disco de unos 850 MB.
- Subtitulado de contenido audiovisual danés: adecuado para generar transcripciones base que después se revisan y se sincronizan manualmente, dado que el modelo debe decodificarse sin timestamps.
- Dictado por voz en herramientas ofimáticas: la baja latencia esperable en chips M-series y el tamaño reducido lo hacen viable para integración en apps de productividad en danés.
- Archivado y búsqueda de grabaciones: transcripción por lotes de archivos de audio históricos en danés para indexación y búsqueda textual posterior.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en contenidos hablados en danés, ejecutándose íntegramente en el dispositivo.
- Investigación en ASR para lenguas de bajos recursos: sirve como referencia de un ajuste fino completo de Whisper large-v3-turbo sobre un corpus específico (2.600 horas de danés) y como ejemplo de pipeline de conversión a CoreML reproducible con whisperkittools.

## Benchmarks y rendimiento

Resultados publicados en la model card de esta conversión, medidos sobre 60 clips del split de desarrollo de FLEURS `da_dk`, con decodificado greedy en WhisperKit sobre un chip M5:

| Decodificado | WER | CER |
|---|---|---|
| Sin timestamps | 8,5 % | 3,1 % |
| Con timestamps | 19,8 % | 15,5 % |

No se han publicado en la información disponible resultados comparativos con otros modelos ni cifras de MMLU, HumanEval o GSM8K, que no aplican a un modelo de ASR.

## Requisitos de hardware

- VRAM: no aplica en el sentido tradicional; el modelo está pensado para ejecutarse en Apple Silicon con memoria unificada. El peso en disco de la variante cuantizada es de aproximadamente 850 MB.
- GPU recomendadas: chips de Apple M-series (la model card cita mediciones en un M5); no se documentan requisitos para GPU NVIDIA.
- Cabe en hardware de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente para cargar el modelo y el audio de entrada.
- Opciones de despliegue: WhisperKit (librería `whisperkit`) sobre CoreML; la conversión se reproduce con `whisperkit-generate-model` de whisperkittools.
- Latencia y throughput: no disponibles; la model card solo reporta WER y CER, no tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Edda v0.2 CoreML (esta ficha) | no disponible (hereda whisper-large-v3-turbo) | no disponible | WER 8,5 % / CER 3,1 % en FLEURS da_dk (greedy, M5) | Apache 2.0 | Hugging Face, formato CoreML |
| danish-foundation-models/edda-v0.2 | no disponible | no disponible | Cifras de la model card original con 5-beam search (no incluidas aquí) | Apache 2.0 | Hugging Face, pesos originales |
| openai/whisper-large-v3-turbo | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | MIT | Hugging Face |

No se dispone de datos de benchmarks de las alternativas en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento entre ellas.

## Limitaciones y advertencias

- El modelo solo reconoce danés; no soporta otros idiomas ni detección multilingüe.
- Solicitar marcas de tiempo degrada gravemente la calidad: el WER sube del 8,5 % al 19,8 % en la medición reportada. Es obligatorio decodificar con `withoutTimestamps = true`.
- El decodificado greedy de WhisperKit empeora el WER en torno a 0,3 puntos respecto a la búsqueda por haces de 5 usada en la model card original.
- Riesgo de alucinación inherente a los modelos Whisper en segmentos de silencio, ruido o audio musical; no se documenta mitigación específica en esta conversión.
- Sesgos: no se documentan sesgos conocidos en la información disponible; al estar entrenado con 2.600 horas de audio danés, su comportamiento fuera de ese dominio lingüístico y acústico no está caracterizado.
- Licencia Apache 2.0, permisiva para uso comercial, pero los corpus de entrenamiento originales tienen sus propias licencias, que deben consultarse en las fichas de dataset enlazadas desde la model card del modelo original.
- Esta conversión no aporta ninguna mejora de calidad sobre Edda v0.2: solo cambia el formato. Cualquier cita o atribución debe dirigirse al modelo original del Alexandra Institute.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación independiente de la conversión.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/kramerthomas/edda-v0.2-coreml
- Modelo original Edda v0.2: https://huggingface.co/danish-foundation-models/edda-v0.2
- Modelo base de OpenAI: `openai/whisper-large-v3-turbo`
- WhisperKit: https://github.com/argmaxinc/WhisperKit
- Herramientas de conversión whisperkittools: https://github.com/argmaxinc/whisperkittools
