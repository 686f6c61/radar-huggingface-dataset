# Hub84/faster-whisper-hinglish-prime

## Resumen

El modelo `Hub84/faster-whisper-hinglish-prime` es una conversión optimizada con CTranslate2 (CT2) del modelo `Oriserve/Whisper-Hindi2Hinglish-Prime`, un fine-tuning de Whisper especializado en la transcripción de audio en hinglish, la mezcla coloquial de hindi e inglés muy común en la India. El trabajo original de Oriserve se centra en mejorar la resistencia al ruido, mitigar alucinaciones y ofrecer baja latencia en entornos de streaming. Esta versión, desarrollada por Hub84, aplica cuantización `int8_float16` y conversión a CT2, reduciendo el tamaño del modelo de aproximadamente 6 GB a 1,5 GB, lo que permite ejecutarlo en GPUs con tan solo 4 GB de VRAM sin sacrificar una precisión significativa.

La relevancia de este modelo radica en su capacidad para abordar un caso de uso muy concreto: la transcripción de audio en hinglish, un idioma híbrido que los modelos ASR estándar suelen manejar deficientemente. Al estar optimizado para faster-whisper, ofrece una inferencia hasta cuatro veces más rápida que la implementación original de OpenAI, con un consumo de memoria reducido. Esto lo convierte en una opción práctica para despliegues en producción con hardware limitado, especialmente en aplicaciones de atención al cliente, subtitulado y análisis de llamadas en el mercado indio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8_float16 (CTranslate2) |
| Idiomas soportados | Hindi e ingles (hinglish) |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (CT2) |

## Arquitectura y entrenamiento

El modelo base es un fine-tuning de Whisper, la arquitectura de reconocimiento de voz de OpenAI basada en un transformer encoder-decoder. El equipo de Oriserve entrenó el modelo original `Whisper-Hindi2Hinglish-Prime` sobre datos de audio en hinglish, aplicando técnicas de aumento de datos y regularización para mejorar la robustez frente al ruido y reducir las alucinaciones típicas de los modelos ASR en entornos adversos. No se dispone de detalles específicos sobre el número de tokens de entrenamiento, la composición exacta del dataset o el uso de RLHF/DPO, ya que no se han publicado en la información disponible.

La conversión realizada por Hub84 utiliza CTranslate2, un motor de inferencia optimizado para transformers, que permite cuantización a 8 bits y precisión mixta. Esta conversión comprime el modelo de ~6 GB a ~1,5 GB, manteniendo la arquitectura original pero acelerando la inferencia y reduciendo los requisitos de memoria. No se han documentado innovaciones adicionales en la arquitectura, como atención lineal o decodificación especulativa.

## Capacidades

- Transcripcion de audio en hinglish (mezcla de hindi e ingles) con alta precision.
- Resistencia mejorada al ruido de fondo, adecuada para grabaciones de campo o llamadas telefonicas.
- Mitigacion de alucinaciones, reduciendo la generacion de texto incorrecto en silencios o audio ambiguo.
- Inferencia de baja latencia, optimizada para streaming y aplicaciones en tiempo real.
- Compatibilidad con el ecosistema faster-whisper, lo que permite integracion sencilla en pipelines existentes.
- Soporte multilingue limitado al hinglish, aunque el modelo base Whisper puede manejar otros idiomas, esta version esta especializada en el par hindi-ingles.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede transcribir llamadas de soporte en hinglish en tiempo real, permitiendo a los sistemas de IA analizar el sentimiento del cliente, extraer intenciones y generar resumenes automaticos. Su baja latencia y resistencia al ruido lo hacen adecuado para entornos de call center.
- Subtitulado de videos en hinglish: creadores de contenido y plataformas de video pueden generar subtitulos precisos para contenido en hinglish, mejorando la accesibilidad y el alcance. El modelo se puede ejecutar en GPU de gama media, lo que facilita el procesamiento por lotes.
- Transcripcion de reuniones y entrevistas: en entornos corporativos donde se mezclan hindi e ingles, este modelo transcribe conversaciones con alta fidelidad, incluso con ruido de fondo. Su integracion con faster-whisper permite procesamiento en tiempo real durante videollamadas.
- Analisis de encuestas de voz y comentarios de clientes: las empresas pueden transcribir grabaciones de encuestas en hinglish para extraer informacion accionable, aprovechando la mitigacion de alucinaciones para evitar errores en los datos.
- Asistentes de voz para dispositivos locales: al poder ejecutarse en hardware con 4 GB de VRAM, el modelo puede integrarse en dispositivos edge o sistemas embebidos para comandos de voz en hinglish, sin depender de la nube.
- Generacion de actas en servicios legales o medicos: en contextos donde se requiere documentacion precisa de conversaciones en hinglish, el modelo ofrece transcripciones fiables que pueden revisarse y editarse posteriormente, reduciendo el trabajo manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original de Oriserve menciona "enhanced accuracy across benchmark datasets", pero no proporciona cifras concretas. Tampoco se dispone de comparaciones cuantitativas con otros modelos ASR para hinglish. Por tanto, no es posible presentar una tabla de rendimiento verificable.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB con cuantizacion int8_float16, lo que permite ejecucion en GPUs de 4 GB VRAM sin problemas.
- GPU recomendadas: NVIDIA GTX 1650 (4 GB), RTX 3050, RTX 3060, o superiores. Tambien es compatible con CPU mediante CTranslate2, aunque con mayor latencia.
- Adecuado para consumer GPU: si, gracias a la reduccion de tamaño y memoria.
- Opciones de despliegue: faster-whisper (Python), que soporta tanto CPU como GPU. Tambien se puede integrar con servidores de inferencia como Triton o servicios gestionados que soporten CT2.
- Latencia y throughput: no se han publicado cifras exactas, pero la implementacion faster-whisper es hasta 4 veces mas rapida que openai/whisper con el mismo hardware, segun la documentacion oficial de SYSTRAN.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| Oriserve/Whisper-Hindi2Hinglish-Prime | ~6 GB (fp32) | no disponible | Apache 2.0 | PyTorch | Modelo original sin cuantizar, requiere mas VRAM. |
| Hub84/faster-whisper-hinglish-prime | ~1,5 GB (int8_float16) | no disponible | Apache 2.0 | CT2 | Version optimizada para faster-whisper, menor huella de memoria. |
| OpenAI Whisper large-v3 | ~6 GB (fp32) | 30 segundos | MIT | PyTorch | Modelo generico, no especializado en hinglish. |

Nota: no se dispone de otros modelos especificos para hinglish con los que comparar directamente. La comparativa se limita a las variantes del mismo modelo y al Whisper base.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tuning de Whisper, puede heredar sesgos presentes en los datos de entrenamiento originales, como preferencias por acentos o dialectos especificos del hindi.
- Riesgo de alucinacion: aunque se ha mitigado, no se elimina por completo. En audio de baja calidad o con silencios prolongados, el modelo puede generar texto espurio.
- Limitaciones de idioma: esta especializado en hinglish; su rendimiento en otros idiomas o en hindi formal puede ser inferior al de un Whisper generico.
- Restricciones de licencia: licencia Apache 2.0 permite uso comercial y modificacion, pero se debe atribuir el credito al autor original (Oriserve) y a Hub84.
- Caveat de produccion: la cuantizacion int8 puede degradar ligeramente la precision en comparacion con el modelo en fp16 o fp32. Se recomienda evaluar en el caso de uso especifico antes de desplegar.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Hub84/faster-whisper-hinglish-prime
- Modelo original de Oriserve: https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Prime
- Repositorio GitHub de Oriserve con codigo y documentacion: https://github.com/OriserveAI/Whisper-Hindi2Hinglish
- Documentacion de faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Paquete PyPI de faster-whisper: https://pypi.org/project/faster-whisper/
