# phonsobon/Whisper-Small-Khmer-Final-1500

## Resumen

Whisper-Small-Khmer-Final-1500 es un modelo de reconocimiento automático del habla (ASR) desarrollado por el usuario phonsobon, que parte del modelo Whisper Small de OpenAI y ha sido ajustado (fine-tuning) específicamente para el idioma khmer (camboyano). Se trata de la versión final 1500, construida sobre el modelo intermedio phonsobon/Whisper-Small-Khmer-Final-v2, lo que sugiere un proceso iterativo de refinamiento.

El modelo resuelve la transcripción de audio hablado en khmer, un idioma de bajos recursos que tradicionalmente cuenta con menos herramientas de ASR disponibles. Su relevancia radica en ofrecer una opción de código abierto y específica para este idioma, con licencia Apache-2.0 y pesos en formato safetensors. La arquitectura es la de Whisper Small, un transformer encoder-decoder con 241.734.912 parámetros, y el pipeline es automatic-speech-recognition. El repositorio está restringido (gated), por lo que se requiere aceptar condiciones para acceder a los archivos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Small (encoder-decoder Transformer) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | km (khmer) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura Whisper, un transformer encoder-decoder diseñado para reconocimiento de voz. El encoder procesa la representación del audio y el decoder genera el texto transcrito. En este caso, se ha realizado un fine-tuning sobre el modelo base Whisper Small. La información disponible no detalla el número de tokens del dataset ni su composición, ni si se emplearon técnicas como RLHF o DPO, que no son habituales en modelos ASR. Tampoco se documentan innovaciones técnicas específicas más allá del ajuste para khmer. El nombre "Final-1500" sugiere un número de pasos de entrenamiento o de muestras, pero no se confirma en la información.

## Capacidades

- Transcripción de audio en khmer mediante el pipeline automatic-speech-recognition de HuggingFace.
- No se documentan capacidades de tool calling, agentes, razonamiento, visión ni generación de audio; es un modelo puramente de reconocimiento de voz.
- Soporte de un único idioma: khmer.

## Casos de uso

- Transcripción de reuniones en khmer: el modelo puede procesar grabaciones de reuniones para generar actas escritas, usando el pipeline de HuggingFace y un preprocesado de audio.
- Subtitulado de vídeos en khmer: integrado con FFmpeg, se puede transcribir el audio y generar subtítulos en formato SRT para contenidos audiovisuales.
- Accesibilidad para personas sordas o con discapacidad auditiva en Camboya: transcripción en tiempo real o diferida de contenido hablado, mejorando el acceso a la información.
- Análisis de llamadas de servicio al cliente: transcripción de llamadas telefónicas en khmer para extraer información y evaluar la calidad del servicio.
- Documentación de investigaciones de campo: transcripción de entrevistas orales en khmer para estudios antropológicos, lingüísticos o de ciencias sociales.
- Dictado por voz en aplicaciones móviles: integración en aplicaciones de mensajería o notas para que los usuarios puedan dictar texto en khmer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no se proporcionan datos oficiales. Dado el tamaño de 241,7 millones de parámetros, la inferencia en FP16 requiere aproximadamente 0,5 GB de VRAM, más el overhead del framework.
- GPU recomendadas: no se especifican. Por tamaño, una GPU con al menos 2 GB de VRAM (por ejemplo, RTX 2060, T4, A10) sería suficiente para la inferencia.
- Sí cabe en GPUs de consumo como RTX 3060 o inferiores.
- Opciones de despliegue: HuggingFace Transformers (pipeline), faster-whisper, whisper.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Licencia | Acceso |
|---|---|---|---|---|
| Whisper-Small-Khmer-Final-1500 | 241,7 M | km | Apache-2.0 | Gated |
| Whisper-Small-Khmer-Final-v2 | no disponible | km | Apache-2.0 | no disponible |
| Whisper-Small-Khmer-continued | no disponible | km | Apache-2.0 | no disponible |

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated, hay que iniciar sesión y aceptar condiciones.
- Solo soporta khmer; no se documenta capacidad multilingüe.
- No se han publicado benchmarks, por lo que el rendimiento real es desconocido.
- Riesgo de alucinación en audio con ruido o acentos no representados en el conjunto de datos.
- Posibles sesgos lingüísticos o dialectales del dataset de fine-tuning, no documentados.
- Licencia Apache-2.0 permite uso comercial, pero el acceso condicionado puede limitar la integración en producción.
- Modelo pequeño (Whisper Small), puede fallar en vocabulario técnico o en contextos especializados.

## Enlaces

- Repositorio principal: https://huggingface.co/phonsobon/Whisper-Small-Khmer-Final-1500
- Modelo base: https://huggingface.co/phonsobon/Whisper-Small-Khmer-Final-v2
- Modelo continuado: https://huggingface.co/phonsobon/Whisper-Small-Khmer-continued
- La búsqueda web no proporcionó información adicional relevante.
