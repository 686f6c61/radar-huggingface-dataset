# shoaibrazaq787/buzzasr-urdu-ct2

## Resumen

BuzzASR Urdu CT2 es una conversión al formato CTranslate2 (precisión float16) del modelo de reconocimiento automático del habla BuzzASR/urdu, publicada por el usuario shoaibrazaq787. Se trata de un modelo derivado de la familia Whisper de OpenAI, reempaquetado para su uso con la librería CTranslate2, lo que permite una inferencia más eficiente en CPU y GPU que la implementación original basada en PyTorch. El modelo está especializado en la transcripción de audio en urdu (`ur`), un idioma con recursos limitados en el ecosistema ASR.

La relevancia de esta ficha radica en su carácter práctico: al estar en formato CT2, puede desplegarse directamente con herramientas como faster-whisper, lo que reduce los requisitos de memoria y acelera la inferencia en comparación con el modelo original. El repositorio ocupa 3,1 GB, lo que sugiere que se trata de una conversión de un modelo Whisper de tamaño grande (probablemente `large-v2` o `large-v3`), aunque la model card no especifica el tamaño exacto del modelo base.

La información disponible es muy limitada: la model card apenas consta de una línea que describe la conversión, y no se detallan datos de entrenamiento, arquitectura exacta ni resultados de benchmarks. Esta ficha se ha redactado con los datos disponibles y señala explícitamente los campos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), convertido a CTranslate2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper acepta ventanas de 30 s de audio) |
| Tipos de cuantizacion | float16 (única conversión publicada) |
| Idiomas soportados | urdu (ur) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (model.bin, config.json, vocabulary) |

## Arquitectura y entrenamiento

El modelo base BuzzASR/urdu es una adaptación de Whisper, la arquitectura de reconocimiento del habla de OpenAI basada en un transformer encoder-decoder con atención completa. Whisper procesa audio en ventanas de 30 segundos y genera transcripciones token a token. La conversión a CTranslate2 mantiene la topología del modelo pero reorganiza los pesos en un formato optimizado para inferencia, con soporte para float16 y, potencialmente, otras precisiones si se generan conversiones adicionales.

No se dispone de información sobre el proceso de entrenamiento del modelo original: no se especifican el número de horas de audio, la composición del dataset, ni si se aplicaron técnicas de fine-tuning supervisado, destilación o aumentación de datos. La model card únicamente indica que se trata de una conversión float16 de BuzzASR/urdu, sin aportar detalles sobre el entrenamiento ni sobre posibles innovaciones técnicas.

## Capacidades

- Transcripción de audio en urdu a texto (reconocimiento automático del habla).
- Procesamiento de audio en ventanas de hasta 30 segundos, con posibilidad de segmentación para audios más largos mediante herramientas externas.
- Inferencia eficiente en CPU y GPU gracias al formato CTranslate2.
- Compatibilidad con faster-whisper y otras librerías que consumen modelos CTranslate2.
- No se ha documentado soporte para traducción, detección de idioma, tool calling, agentes ni otras capacidades multimodales.
- No se ha documentado soporte multilingüe más allá del urdu.

## Casos de uso

- Transcripción de reuniones y entrevistas en urdu: el modelo puede convertir grabaciones de audio en texto para su posterior análisis o archivado, aprovechando la eficiencia de CTranslate2 para procesar lotes de audio en servidores sin GPU dedicada.
- Subtitulado automático de vídeo en urdu: integrado en un pipeline de procesamiento de vídeo, el modelo genera transcripciones que luego se alinean temporalmente para producir subtítulos, gracias a su compatibilidad con faster-whisper.
- Atención al cliente en centros de contacto: permite transcribir llamadas en urdu para su análisis de calidad, búsqueda de palabras clave o generación de resúmenes, con un coste computacional reducido al ejecutarse en CPU.
- Archivado y búsqueda de contenido audiovisual: digitalización de archivos de audio en urdu para crear índices de texto searchable, usando el modelo en modo batch sobre grandes volúmenes de grabaciones.
- Accesibilidad para personas con discapacidad auditiva: generación de transcripciones en tiempo casi real de contenido hablado en urdu, desplegando el modelo con faster-whisper en un servidor local.
- Investigación lingüística y corpus de habla: recopilación y transcripción de corpus de audio en urdu para estudios fonéticos o de procesamiento del lenguaje, aprovechando la licencia MIT para uso académico y comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de una conversión float16 de un modelo Whisper de tamaño grande (3,1 GB de pesos), se estima un consumo de VRAM de entre 3 y 4 GB para el modelo, más memoria adicional para el procesamiento de audio y buffers. No se dispone de mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090, A100, H100). El modelo también puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4070 y superiores, siempre que se disponga de suficiente memoria para el lote de audio.
- Opciones de despliegue: faster-whisper (recomendado), CTranslate2 directamente, o servidores compatibles con CT2 como WhisperX (con adaptaciones). No es compatible con llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. Dependen del hardware y del tamaño de los segmentos de audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| BuzzASR Urdu CT2 (este modelo) | no disponible | ventanas de 30 s | urdu | MIT | CTranslate2 |
| Whisper large-v3 (OpenAI) | 1550 M | ventanas de 30 s | multilingüe (99 idiomas) | MIT | PyTorch, CT2, GGML |
| Whisper large-v2 (OpenAI) | 1550 M | ventanas de 30 s | multilingüe (99 idiomas) | MIT | PyTorch, CT2, GGML |
| BuzzASR/urdu (modelo base) | no disponible | ventanas de 30 s | urdu | MIT | PyTorch |

No se dispone de datos de rendimiento comparativo (WER, latencia) para este modelo frente a las alternativas.

## Limitaciones y advertencias

- La información disponible es mínima: no se especifican el tamaño exacto del modelo base, los datos de entrenamiento ni los resultados de evaluación, lo que dificulta valorar su calidad frente a otras alternativas.
- Riesgo de alucinación: como todo modelo Whisper, puede generar texto que no corresponde al audio, especialmente en segmentos con ruido o silencios.
- Limitación de idioma: el modelo está especializado únicamente en urdu; no se ha documentado su comportamiento en otros idiomas ni en code-switching.
- Limitación de contexto: Whisper procesa ventanas de 30 segundos; para audios más largos es necesario segmentar y gestionar la continuidad entre segmentos.
- Sesgos: no se han documentado sesgos específicos, pero al ser un modelo entrenado con datos no especificados, puede heredar sesgos de género, dialecto o registro presentes en el corpus original.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo base BuzzASR/urdu también es MIT según la model card; se recomienda verificar la licencia del modelo original.
- Caveat para producción: al ser una conversión no oficial (publicada por un tercero), no hay garantías de mantenimiento ni de compatibilidad futura con versiones de CTranslate2 o faster-whisper.

## Enlaces

- [Hugging Face: shoaibrazaq787/buzzasr-urdu-ct2](https://huggingface.co/shoaibrazaq787/buzzasr-urdu-ct2)
- [Modelo base BuzzASR/urdu](https://huggingface.co/BuzzASR/urdu) (referenciado en la model card, no verificado)
- [Repositorio CTranslate2](https://github.com/OpenNMT/CTranslate2)
- [Repositorio faster-whisper](https://github.com/SYSTRAN/faster-whisper)
- [Repositorio Whisper de OpenAI](https://github.com/openai/whisper)
