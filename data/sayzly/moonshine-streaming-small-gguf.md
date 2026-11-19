# sayzly/moonshine-streaming-small-gguf

## Resumen

Moonshine Streaming Small (GGUF) es una conversión al formato GGUF del modelo `moonshine-ai/moonshine-streaming-small`, publicada por el usuario sayzly. El modelo original pertenece a la familia Moonshine de Moonshine AI, orientada a reconocimiento automático del habla (ASR) en tiempo real o en streaming. Esta ficha describe la conversión GGUF, que reempaqueta los pesos originales en un único fichero `moonshine-streaming-small-Q8_0.gguf` para su uso con motores de inferencia compatibles con GGUF.

El modelo cuenta con 140.135.225 parámetros (aproximadamente 140 millones) según los metadatos de safetensors del repositorio, lo que lo sitúa en la gama de modelos ASR ligeros aptos para ejecución en CPU o GPUs de consumo. El repositorio ocupa 0,2 GB y se distribuye bajo licencia MIT, la misma que el modelo base.

La relevancia de esta conversión radica en la disponibilidad del modelo en un formato portable (GGUF) que facilita su despliegue en entornos con recursos limitados, aunque el repositorio no incluye documentación adicional sobre el proceso de conversión, los parámetros de cuantización más allá del nombre del fichero, ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Moonshine, orientado a ASR) |
| Parametros totales | 140.135.225 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (único fichero publicado: `moonshine-streaming-small-Q8_0.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantización Q8_0) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `moonshine-ai/moonshine-streaming-small` en la información proporcionada. Por el nombre y la etiqueta `speech-to-text` / `automatic-speech-recognition`, se trata de un modelo de la familia Moonshine orientado a transcripción de audio, presumiblemente diseñado para inferencia en streaming, pero no se confirman detalles sobre el tipo de encoder/decoder, el mecanismo de atención ni la composición del dataset de entrenamiento.

Tampoco se documentan en el repositorio el número de tokens de entrenamiento, el uso de RLHF/DPO, ni innovaciones técnicas específicas. La conversión GGUF no aporta información sobre el entrenamiento: únicamente reempaqueta los pesos originales en un fichero cuantizado a Q8_0. Cualquier detalle arquitectónico debe consultarse en la model card del modelo base.

## Capacidades

- Reconocimiento automático del habla (ASR): el pipeline declarado es `automatic-speech-recognition`, por lo que la capacidad principal es la transcripción de audio a texto.
- Orientación a streaming: el nombre del modelo base sugiere soporte para transcripción en flujo continuo, aunque no se detalla en la información disponible.
- Ejecución en formato GGUF: permite su uso con motores de inferencia compatibles con GGUF (por ejemplo, llama.cpp y derivados), aunque la compatibilidad concreta con decodificadores de audio no está documentada en el repositorio.
- Capacidades multilingües: no disponibles (no se declaran idiomas soportados).
- Tool calling, agentes, visión, audio generativo, thinking mode: no disponibles o no aplicables según la información proporcionada.

## Casos de uso

- Transcripción de reuniones y notas de voz: al ser un modelo ASR ligero (140 M de parámetros), puede ejecutarse en local para transcribir audio de reuniones sin enviar datos a servicios en la nube, siempre que el motor GGUF elegido soporte la entrada de audio del modelo.
- Subtitulado de vídeo en tiempo casi real: su orientación a streaming lo hace candidato para generar subtítulos a partir de un flujo de audio, aunque la latencia real no está documentada.
- Asistentes de voz embebidos: el tamaño reducido (0,2 GB en Q8_0) permite integrarlo en dispositivos con recursos limitados o en aplicaciones de escritorio que requieran transcripción local.
- Dictado por voz en aplicaciones de productividad: integración en editores de texto o herramientas de toma de notas que necesiten convertir voz a texto sin dependencia de API externas.
- Preprocesado de audio para pipelines de NLP: transcripción previa de audio para alimentar sistemas de análisis de sentimiento, resumen o búsqueda sobre contenido hablado.
- Prototipado e investigación en ASR: al estar en GGUF y con licencia MIT, sirve para experimentar con despliegues locales y comparar frente a otros modelos ASR en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~140 M de parámetros en Q8_0 (~8 bits por peso), el fichero ocupa aproximadamente 0,2 GB; la VRAM necesaria sería del orden de unos pocos cientos de MB, aunque no se dispone de una cifra oficial.
- GPU recomendadas: no disponibles. Por tamaño, cabría esperar ejecución en GPUs de consumo (por ejemplo, RTX 3060 o superiores), pero no está confirmado.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño, aunque no se documenta compatibilidad probada.
- Opciones de despliegue: motores compatibles con GGUF (llama.cpp y derivados). No se confirma soporte en vLLM, TGI u Ollama para este modelo concreto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos ASR, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio no documenta los idiomas soportados; no debe asumirse cobertura multilingüe sin verificar el modelo base.
- No se han publicado métricas de precisión (WER u otras), por lo que no se puede evaluar su calidad frente a alternativas.
- La conversión GGUF la realiza un tercero (sayzly) y no el equipo original de Moonshine AI; puede haber diferencias respecto al modelo original.
- Solo se publica una cuantización Q8_0; no hay variantes Q4, Q5 u otras que reduzcan aún más el tamaño.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por la comunidad.
- Riesgo de alucinación y sesgos: no documentados para este modelo; en ASR, los errores se manifiestan como transcripciones incorrectas, especialmente en audio con ruido o acentos no cubiertos por el entrenamiento.
- Licencia MIT: permite uso comercial, pero conviene revisar la licencia y condiciones del modelo base original.
- La compatibilidad real con motores GGUF para entrada de audio no está confirmada en la información disponible; verificar antes de desplegar en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sayzly/moonshine-streaming-small-gguf
- Modelo base: https://huggingface.co/moonshine-ai/moonshine-streaming-small
