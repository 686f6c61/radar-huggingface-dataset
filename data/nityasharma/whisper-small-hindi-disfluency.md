# NityaSharma/whisper-small-hindi-disfluency

## Resumen

NityaSharma/whisper-small-hindi-disfluency es un ajuste fino del modelo Whisper Small de OpenAI, publicado en Hugging Face por el usuario NityaSharma. Por el identificador y las etiquetas del repositorio, el modelo esta orientado al reconocimiento automatico del habla (ASR) en hindi, con un enfasis declarado en el tratamiento de disfluencias (repeticiones, muletillas y falsos comienzos propios del habla espontanea). El repositorio tiene 241.734.912 parametros en formato safetensors y un tamano aproximado de 1,0 GB, coherente con la variante "small" de la familia Whisper.

La relevancia de este modelo es acotada pero concreta: los sistemas ASR genericos suelen transcribir literalmente las disfluencias o eliminarlas de forma inconsistente, lo que degrada la calidad de transcripciones destinadas a subtitulado, analisis linguistico o entrenamiento de datos. Un ajuste especifico sobre hindi puede resultar util para equipos que trabajen con audio en ese idioma y necesiten transcripciones mas limpias. No obstante, la model card esta practicamente vacia (generada automaticamente por la plataforma) y no aporta informacion sobre datos de entrenamiento, licencia ni evaluacion, lo que limita seriamente su adopcion en produccion.

El modelo se distribuye bajo la libreria transformers, con pipeline automatic-speech-recognition y compatibilidad con endpoints de inferencia. No consta ninguna publicacion, demo ni resultado de evaluacion asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper Small de OpenAI) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper Small trabaja con ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hindi (inferido del identificador del modelo); no confirmado en la model card |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Whisper, un transformer encoder-decoder disenado para reconocimiento automatico del habla multitarea, presentado en el paper "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., 2022, arXiv:1910.09700 segun las etiquetas del repositorio). La variante "small" emplea aproximadamente 244 millones de parametros y procesa audio en ventanas de 30 segundos convertidas a espectrogramas log-Mel.

No hay informacion disponible sobre el proceso de ajuste fino: ni el volumen de datos de audio utilizados, ni la composicion del corpus en hindi, ni si se aplicaron tecnicas de aumento de datos, ni los hiperparametros de entrenamiento. Tampoco se documenta que metodologia se empleo para el tratamiento de disfluencias (eliminacion, etiquetado o normalizacion en las transcripciones de referencia). La model card no incluye ninguna seccion completada mas alla de la plantilla por defecto.

## Capacidades

- Reconocimiento automatico del habla en hindi, presumiblemente con manejo de disfluencias del habla espontanea.
- Transcripcion de audio de hasta 30 segundos por ventana, con posibilidad de procesar audio mas largo mediante segmentacion.
- Integracion nativa con la libreria transformers (pipeline automatic-speech-recognition).
- Compatibilidad con endpoints de inferencia de Hugging Face.
- No consta soporte de tool calling, capacidades de agente, vision, audio mas alla de ASR ni modo de razonamiento extendido.
- El multilingue no esta confirmado: aunque Whisper Small base es multilingue, el ajuste fino puede haber degradado el rendimiento en otros idiomas.

## Casos de uso

- Transcripcion de entrevistas y material oral en hindi: el modelo puede convertir grabaciones de habla espontanea en texto, con un tratamiento presumiblemente mas limpio de repeticiones y muletillas que el Whisper Small generico, lo que reduce el trabajo de post-edicion manual.
- Generacion de subtitulos para contenido audiovisual en hindi: la atenuacion de disfluencias produce subtitulos mas legibles sin necesidad de una pasada de limpieza posterior.
- Creacion de corpus textuales para NLP en hindi: transcripciones normalizadas utiles para entrenar modelos de lenguaje o sistemas de traduccion automatica a partir de audio.
- Analisis linguistico del habla espontanea: si el ajuste conserva informacion de disfluencias de forma estructurada, podria emplearse en estudios de produccion oral; conviene verificar este extremo con el autor.
- Prototipado rapido en entornos de investigacion: el tamano contenido (1 GB) permite desplegar el modelo en GPU de consumo para experimentos de ASR en hindi sin grandes infraestructuras.
- Preprocesado de reuniones o llamadas en hindi: combinado con un sistema de diarizacion, puede alimentar pipelines de actas o resumenes automaticos.
- Aplicaciones de accesibilidad: dictado por voz en hindi para usuarios con movilidad reducida, con transcripciones que evitan ruido verbal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion completada, y no consta ninguna comparacion con Whisper Small base ni con otros modelos ASR para hindi (por ejemplo, variantes de IndicWhisper o modelos de AI4Bharat).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB solo para pesos, mas memoria para activaciones y espectrogramas; en la practica, entre 2 y 4 GB.
- En fp16: alrededor de 0,5 GB de pesos, con un consumo total tipico inferior a 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1650 o superiores, y puede ejecutarse en CPU con latencia mayor.
- Opciones de despliegue: transformers con pipeline de ASR, endpoints de Hugging Face; la conversion a GGUF para llama.cpp u Ollama no esta documentada y requeriria verificar la compatibilidad con whisper.cpp.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NityaSharma/whisper-small-hindi-disfluency | 241,7 M | ventanas de 30 s (arquitectura Whisper) | hindi (inferido) | no disponible | Hugging Face |
| openai/whisper-small | 244 M | ventanas de 30 s | multilingue (99 idiomas) | MIT (modelo original) | Hugging Face, OpenAI |
| Variantes IndicWhisper (AI4Bharat) | segun variante (small, medium) | ventanas de 30 s | idiomas indios | habitualmente MIT o similar | Hugging Face |
| Whisper large-v3 | 1.550 M | ventanas de 30 s | multilingue | MIT | Hugging Face, OpenAI |

La comparacion con openai/whisper-small es la mas directa: mismo tamano y arquitectura, pero el modelo de OpenAI tiene licencia conocida, evaluacion publica y cobertura multilingue. Las variantes de IndicWhisper ofrecen un ajuste especifico para idiomas indios con documentacion mas completa. La ventaja diferencial de este modelo seria el tratamiento de disfluencias, extremo que no esta respaldado por ninguna evaluacion publicada.

## Limitaciones y advertencias

- La model card esta vacia: no hay informacion sobre datos de entrenamiento, metodologia ni evaluacion, lo que impide validar las afirmaciones implicitas en el nombre del modelo.
- Licencia no disponible: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Riesgo de alucinacion y de transcripciones incorrectas, especialmente en audio con ruido, acentos regionales del hindi o cambios de codigo hindi-ingles, frecuentes en el habla real.
- El ajuste fino sobre un unico idioma puede haber degradado el rendimiento multilingue del Whisper Small original.
- No hay garantia de que las disfluencias se eliminen de forma consistente; el comportamiento real solo puede verificarse con pruebas propias.
- Sesgos desconocidos: al no documentarse la composicion del corpus de entrenamiento, no se puede evaluar el sesgo por genero, region o registro.
- Sin resultados de benchmarks ni comparaciones publicas, la eleccion frente a alternativas mejor documentadas no esta justificada tecnicamente.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NityaSharma/whisper-small-hindi-disfluency
- Paper de Whisper (referenciado en las etiquetas): https://arxiv.org/abs/1910.09700
- Modelo base Whisper Small: https://huggingface.co/openai/whisper-small
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
