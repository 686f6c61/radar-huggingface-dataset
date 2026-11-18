# Seyfipolat/med-live-translate-modeller

## Resumen

MED LIVE TRANSLATE es un repositorio de modelos de reconocimiento automático del habla (ASR) empaquetados en formato CTranslate2 para su uso con faster-whisper, la implementación optimizada de Whisper. Lo publica el usuario Seyfipolat como soporte de una aplicación de escritorio homónima orientada a subtitulado en vivo y traducción para kurdo kurmanji, turco, inglés y árabe. No se trata de un modelo entrenado desde cero, sino de una colección de tres artefactos derivados de modelos Whisper existentes, convertidos y cuantizados para inferencia eficiente en CPU y GPU.

El repositorio contiene tres carpetas: dos variantes de Whisper small y large adaptadas al kurmanji (procedentes de samil24) y una copia sin modificar de Whisper large-v3-turbo en int8. La relevancia práctica reside en que ofrece un pipeline ASR listo para desplegar con faster-whisper para un idioma de bajos recursos como el kurmanji, algo poco frecuente en el ecosistema, junto con una variante turbo de altas prestaciones para turco, inglés y árabe.

El tamaño total del repositorio es de 2,6 GB y la licencia declarada es Apache-2.0 para las variantes kurmanji y MIT para la turbo. No se publican métricas de rendimiento ni detalles sobre el proceso de ajuste fino original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), convertido a CTranslate2 |
| Parametros totales | no disponible (small y large-v3-turbo segun carpeta; cifras exactas no publicadas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | int8 (variantes kurmanji); int8 en la variante turbo; compute_type int8_float16 sugerido en GPU |
| Idiomas soportados | ku (kurmanji), tr, en, ar |
| Licencia | Apache-2.0 (kurmanji); MIT (turbo) |
| Formato de pesos | CTranslate2 (carpetas `whisper-small-kurmanji-ct2`, `whisper-large-kurmanji-ct2`, `whisper-turbo-int8`) |

## Arquitectura y entrenamiento

Los modelos subyacentes son Whisper, un transformer encoder-decoder con atención completa diseñado para ASR multilingüe y traducción de voz. Este repositorio no incluye entrenamiento propio: los pesos de las variantes kurmanji provienen de `samil24/whisper-small-kurmanji-v10` y `samil24/whisper-large-kurmanji-v1` (revisión 4fe6714), y la variante turbo es una copia sin modificar de `Zoont/faster-whisper-large-v3-turbo-int8-ct2`, derivada de `openai/whisper-large-v3-turbo`.

La única transformación aplicada por el autor es la conversión de safetensors a formato CTranslate2 y la cuantización a int8, además de sustituir los ficheros de tokenizer por los de `openai/whisper-small` y `openai/whisper-large-v3`. No se documentan tokens de entrenamiento, composición del dataset, ni etapas de RLHF o DPO. Un detalle técnico relevante es que los modelos kurmanji fueron ajustados usando el token de idioma `tr`, por lo que la llamada a `transcribe` debe pasar `language="tr"` para obtener el comportamiento esperado. No se describen innovaciones adicionales como decodificación especulativa.

## Capacidades

- Reconocimiento automático del habla en kurdo kurmanji, turco, inglés y árabe.
- Subtitulado en vivo y por lotes mediante faster-whisper (segmentación con timestamps).
- Traducción de voz implícita en Whisper (transcripción o traducción al inglés según tarea).
- Inferencia en CPU y GPU gracias a CTranslate2, con cuantización int8.
- Detección de actividad de voz y decodificación por segmentos propia de faster-whisper.
- No se documenta soporte de tool calling, agentes ni modos de razonamiento extendido (no aplica a un modelo ASR).
- Capacidades multilingües limitadas a los cuatro idiomas declarados; el resto de idiomas de Whisper no se garantiza en las variantes kurmanji.

## Casos de uso

- Subtitulado en vivo de reuniones y clases en kurmanji: la variante `whisper-large-kurmanji-ct2` permite transcripción incremental con timestamps, adecuada para aplicaciones de escritorio con captura de audio del sistema.
- Traducción de medios audiovisuales turco-kurmanji: el par de modelos small y large permite elegir entre latencia baja (small) y mayor precisión (large) según el hardware disponible.
- Transcripción de entrevistas y archivo periodístico en turco, inglés y árabe: la variante `whisper-turbo-int8` ofrece un equilibrio razonable entre velocidad y calidad para volúmenes moderados.
- Accesibilidad para personas con discapacidad auditiva: generación de subtítulos en tiempo real en aplicaciones de videollamada usando faster-whisper con `compute_type="int8_float16"` en GPU.
- Indexación y búsqueda de contenido hablado: transcripción por lotes de archivos de audio para construir índices de texto y búsqueda semántica en bibliotecas multimedia.
- Prototipado de asistentes de voz multilingües: integración en pipelines Python con faster-whisper para alimentar un LLM posterior con la transcripción y habilitar respuestas en kurmanji o turco.
- Despliegue en equipos sin GPU dedicada: la cuantización int8 permite ejecutar la variante small en CPU con latencia aceptable para dictado o notas de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la variante small en int8 ocupa del orden de cientos de MB; la large en int8 ronda 1-1,5 GB; la turbo int8 se sitúa en un rango similar a large. No se publican cifras exactas en la model card.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para las variantes large/turbo en int8 (RTX 3060, RTX 4060, RTX 4090, A100, H100). La variante small puede ejecutarse en GPU integradas o CPU.
- Cabe en GPU de consumo: sí, tanto la small como la large/turbo en int8 caben en tarjetas de gama media con 6-8 GB de VRAM.
- Opciones de despliegue: faster-whisper (librería nativa de estos pesos), CTranslate2 directamente, y servidores compatibles con faster-whisper (por ejemplo, wyoming-faster-whisper o contenedores propios). No es compatible directamente con vLLM, llama.cpp ni Ollama, orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles; dependen del hardware, del `compute_type` y de la longitud del audio. El uso de `int8_float16` en GPU es la configuración recomendada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MED LIVE TRANSLATE (este repo) | no disponible (small/large/turbo) | ku, tr, en, ar | CTranslate2 | Apache-2.0 / MIT | Hugging Face |
| openai/whisper-large-v3-turbo | no disponible en la informacion | multilingüe amplio | safetensors | MIT | Hugging Face |
| samil24/whisper-large-kurmanji-v1 | no disponible en la informacion | ku (ajustado con token tr) | safetensors | Apache-2.0 | Hugging Face |
| faster-whisper (implementación) | no aplica | multilingüe | CTranslate2 | MIT | GitHub / PyPI |

La comparativa se limita a disponibilidad y licencia porque no hay métricas de WER ni de velocidad publicadas para este repositorio. Frente a los pesos originales en safetensors, la ventaja de este paquete es la conversión a CTranslate2 con int8, que reduce el uso de memoria y mejora el throughput en faster-whisper, a costa de una posible pérdida menor de precisión por cuantización.

## Limitaciones y advertencias

- No se han publicado evaluaciones de WER ni comparaciones cuantitativas con los modelos originales; la calidad real en kurmanji no está verificada de forma independiente.
- La cuantización int8 puede degradar ligeramente la precisión respecto a los pesos originales en fp16/fp32.
- Los modelos kurmanji requieren pasar `language="tr"` en faster-whisper; usar el token `ku` puede producir resultados incorrectos.
- El repositorio no entrena ningún modelo nuevo: los créditos y posibles sesgos corresponden a los autores originales (samil24, OpenAI, Zoont).
- Riesgo de alucinación típico de Whisper en audio con ruido, silencios largos o habla solapada; conviene aplicar detección de voz y revisar segmentos de baja confianza.
- Licencias mixtas: Apache-2.0 para las variantes kurmanji y MIT para la turbo; verificar el cumplimiento si se redistribuye el paquete completo.
- Solo cubre cuatro idiomas de forma declarada; no debe asumirse un rendimiento multilingüe general.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Seyfipolat/med-live-translate-modeller
- Modelo base kurmanji small: https://huggingface.co/samil24/whisper-small-kurmanji-v10
- Modelo base kurmanji large: https://huggingface.co/samil24/whisper-large-kurmanji-v1
- Variante turbo int8: https://huggingface.co/Zoont/faster-whisper-large-v3-turbo-int8-ct2
- Modelo original turbo: https://huggingface.co/openai/whisper-large-v3-turbo
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
