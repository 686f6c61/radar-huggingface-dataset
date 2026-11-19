# sayzly/whisper-large-v2-gguf

## Resumen

`sayzly/whisper-large-v2-gguf` es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) `openai/whisper-large-v2`, publicada por el usuario `sayzly`. No se trata de un modelo nuevo ni de un reentrenamiento: es un artefacto de cuantización pensado para su descarga y uso por parte de una herramienta o aplicación concreta (el autor menciona el fichero `whisper-large-v2-Q8_0.gguf` como el que "Sayzly descarga"). El modelo subyacente es el transformer encoder-decoder de OpenAI, con 1.543.321.440 parámetros, entrenado para transcripción y traducción de voz a texto.

La relevancia de esta ficha es acotada: el repositorio no aporta información técnica propia, ni datos de entrenamiento, ni resultados de evaluación, ni documentación sobre el proceso de conversión a GGUF. Todo lo sustantivo proviene del modelo original de OpenAI, cuya licencia Apache 2.0 se mantiene. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 19 de noviembre de 2026.

Por tanto, esta ficha describe el modelo base Whisper Large v2 y documenta explícitamente qué datos no están disponibles en el repositorio de la conversión. Cualquier uso en producción debería contrastarse con la model card oficial de OpenAI y con el ecosistema de inferencia GGUF (whisper.cpp, llama.cpp u otros) para verificar compatibilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (modelo base: Whisper Large v2 de OpenAI); el repositorio no documenta la arquitectura de la conversión |
| Parámetros totales | 1.543.321.440 (según safetensors del modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el repositorio; el modelo base Whisper procesa audio en ventanas de 30 segundos |
| Tipos de cuantización | Q8_0 (único fichero mencionado en la model card: `whisper-large-v2-Q8_0.gguf`) |
| Idiomas soportados | No disponible en el repositorio; el modelo base es multilingüe (99 idiomas según OpenAI) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantización Q8_0); el modelo base se distribuye en safetensors/PyTorch |
| Tamaño del repositorio | 1,7 GB |
| Pipeline | automatic-speech-recognition |
| Modelo base | openai/whisper-large-v2 |

## Arquitectura y entrenamiento

El repositorio no documenta ningún proceso de entrenamiento propio: es una conversión de pesos. La arquitectura corresponde íntegramente a Whisper Large v2 de OpenAI, un transformer encoder-decoder con 1.543 millones de parámetros que procesa espectrogramas de audio en ventanas de 30 segundos y genera tokens de texto de forma autorregresiva. El encoder transforma el audio en representaciones latentes y el decoder produce la transcripción, con tokens especiales para detección de idioma y para la tarea de traducción al inglés.

No hay información en el repositorio sobre el dataset de entrenamiento original, el número de horas de audio, la composición lingüística ni sobre si hubo ajuste fino adicional. Tampoco se documenta el procedimiento de cuantización a Q8_0 (herramienta empleada, versión, calibración). Para detalles sobre el entrenamiento del modelo base (680.000 horas de audio débilmente supervisado, según la documentación pública de OpenAI) debe consultarse la model card original, no este repositorio.

## Capacidades

- Transcripción de voz a texto en múltiples idiomas (heredadas del modelo base Whisper Large v2).
- Traducción de voz a texto en inglés (tarea `translate` del modelo base).
- Detección automática de idioma mediante token especial.
- Segmentación con marcas de tiempo a nivel de segmento (según el modelo base).
- Procesamiento de audio en ventanas de 30 segundos, con concatenación para audios más largos.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: no son capacidades de un modelo ASR.
- No se documenta soporte de visión ni de audio más allá de la entrada de espectrograma propia del ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo convierte audio de hasta 30 segundos por ventana en texto; para grabaciones largas se trocea el audio y se concatenan segmentos, aprovechando la salida con marcas de tiempo del modelo base.
- Subtitulado automático de vídeo: la generación de segmentos con timestamps permite producir ficheros SRT o VTT, útiles en pipelines de publicación de contenido.
- Traducción de audio a inglés: la tarea `translate` del modelo base permite generar texto en inglés a partir de audio en otro idioma, útil para documentación interna multilingüe.
- Dictado y notas de voz: integración en aplicaciones de escritorio o móvil mediante un runtime GGUF (por ejemplo whisper.cpp) para transcribir notas de voz localmente sin enviar audio a la nube.
- Indexación y búsqueda de archivos de audio: transcripción masiva de un archivo de podcasts o grabaciones para construir un índice de texto consultable.
- Accesibilidad: generación de transcripciones para contenido audiovisual dirigido a personas con discapacidad auditiva, con la ventaja de poder ejecutarse en local si el despliegue lo permite.
- Preprocesado para pipelines de NLP: convertir audio en texto antes de aplicar análisis de sentimiento, resumen o extracción de entidades con otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de WER (word error rate), comparativas con otras cuantizaciones ni evaluaciones del fichero Q8_0 frente al modelo original en precisión flotante.

## Requisitos de hardware

- VRAM estimada: no disponible en el repositorio. Como referencia orientativa, un modelo de 1,54 mil millones de parámetros en Q8_0 ocupa aproximadamente 1,6 GB en disco (el repositorio pesa 1,7 GB), por lo que la inferencia requiere del orden de 2 GB de memoria, aunque esta cifra no está confirmada por el autor.
- GPU recomendadas: no disponibles en el repositorio. Para el modelo base en precisión completa se suele recomendar una GPU con al menos 10-12 GB de VRAM; la versión Q8_0 debería caber en GPUs consumer de gama media, pero no hay confirmación del autor.
- Compatibilidad con GPU consumer: plausible por el tamaño del fichero, pero no verificada en la información disponible.
- Opciones de despliegue: al ser GGUF, los runtimes habituales son whisper.cpp, llama.cpp (con soporte de audio) u otros motores compatibles con GGUF. No se documenta compatibilidad con vLLM ni con TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| sayzly/whisper-large-v2-gguf | 1.543 M | Ventanas de 30 s (modelo base) | Apache 2.0 | GGUF (Q8_0) | Hugging Face, 0 descargas |
| openai/whisper-large-v2 | 1.543 M | Ventanas de 30 s | Apache 2.0 | PyTorch / safetensors | Hugging Face, oficial |
| openai/whisper-large-v3 | No disponible en la información proporcionada | No disponible | Apache 2.0 | PyTorch / safetensors | Hugging Face, oficial |
| Versiones GGUF de terceros de Whisper | No disponible | No disponible | Apache 2.0 (heredada) | GGUF | Múltiples repositorios de la comunidad |

La comparación relevante es frente al modelo base oficial: esta conversión no aporta mejoras de calidad documentadas y su interés depende de la compatibilidad con el runtime GGUF que se vaya a usar. No se dispone de datos de rendimiento comparativo entre esta cuantización y el original.

## Limitaciones y advertencias

- El repositorio no documenta el proceso de cuantización: no se puede verificar la fidelidad del fichero Q8_0 respecto al modelo original ni si se han perdido capas o tensores.
- No hay información sobre idiomas soportados en esta conversión concreta; debe asumirse el comportamiento del modelo base, pero sin garantía.
- Riesgo de alucinación inherente a los modelos ASR: Whisper puede generar texto plausible en segmentos con silencio, ruido o audio ininteligible, especialmente en el modelo base.
- Sesgos del modelo base: el rendimiento varía notablemente según idioma, acento y calidad del audio; los idiomas con menos datos de entrenamiento presentan mayores tasas de error.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda conservar la atribución al modelo original de OpenAI y revisar los términos del modelo base.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- El autor no ofrece garantías ni soporte; es un artefacto de conveniencia para una herramienta concreta.
- No se documenta compatibilidad con versiones específicas de whisper.cpp o llama.cpp, lo que puede provocar fallos de carga si el formato GGUF no coincide con la versión del runtime.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sayzly/whisper-large-v2-gguf
- Modelo base: https://huggingface.co/openai/whisper-large-v2
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- whisper.cpp (runtime GGUF para Whisper): https://github.com/ggerganov/whisper.cpp
- Paper de Whisper: https://arxiv.org/abs/2212.04356
