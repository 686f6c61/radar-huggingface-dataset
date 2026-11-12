# ChatPanel/parakeet-tdt-0.6b-v3-onnx

## Resumen

`ChatPanel/parakeet-tdt-0.6b-v3-onnx` es una réplica sin modificaciones del repositorio `istupakov/parakeet-tdt-0.6b-v3-onnx`, que a su vez contiene la conversión a ONNX del modelo de reconocimiento automático de voz (ASR) `nvidia/parakeet-tdt-0.6b-v3`. El modelo original lo desarrolla NVIDIA dentro de la familia Parakeet y emplea una arquitectura NeMo Conformer con decodificación TDT (Token-and-Duration Transducer). El repositorio lo aloja ChatPanel con el único propósito de centralizar las descargas de su pasarela de inferencia; no se ha reentrenado, convertido ni editado ningún fichero.

El interés de esta ficha radica en que el modelo subyacente es un sistema ASR de aproximadamente 0,6 mil millones de parámetros, pensado para transcripción de voz a texto de alta precisión y bajo coste computacional. La versión ONNX int8 permite ejecutarlo fuera del ecosistema NeMo/PyTorch, lo que facilita su despliegue en entornos ligeros basados en ONNX Runtime.

Conviene subrayar que este repositorio concreto no aporta valor técnico diferencial respecto al upstream: es un espejo byte a byte. Cualquier evaluación, reporte de errores o uso en producción debería referirse al modelo original de NVIDIA y a la conversión de `istupakov`, no a esta copia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 0,6 mil millones (aprox., segun el nombre del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ficheros `encoder-model.int8.onnx` y `decoder_joint-model.int8.onnx`) |
| Idiomas soportados | no disponibles en la informacion proporcionada |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (int8) + `config.json`, `vocab.txt`, `nemo128.onnx` |

## Arquitectura y entrenamiento

El modelo base es un sistema ASR de NVIDIA basado en NeMo Conformer, un transformer convolucional que combina capas de autoatención con convoluciones para capturar dependencias locales y globales en la señal de audio. La cabeza de decodificación es un TDT (Token-and-Duration Transducer), una variante de los transductores RNN-T que predice conjuntamente el token y su duración, lo que reduce el coste de decodificación y mejora la alineación temporal.

No se dispone en la información proporcionada de datos sobre el número de horas de audio de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste fino supervisado o preferencias. El repositorio de ChatPanel no incluye información adicional más allá de la declaración de que los ficheros son idénticos a los del upstream. La conversión a ONNX int8 la realiza `istupakov`, no NVIDIA ni ChatPanel, y no se documenta el proceso de cuantización en esta copia.

## Capacidades

- Reconocimiento automático de voz (ASR): transcripción de audio a texto.
- Decodificación TDT con predicción conjunta de token y duración.
- Ejecución mediante ONNX Runtime con pesos cuantizados a int8.
- Extracción de características de audio mediante `nemo128.onnx` (probablemente el extractor de features Mel).
- No se documentan capacidades de traducción, diarización, detección de idioma, tool calling ni agentes en la información disponible.
- No se documentan capacidades multimodales más allá del audio de entrada.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo puede convertir audio en texto con un coste de inferencia bajo gracias a la cuantización int8 y la decodificación TDT, adecuado para integrarse en herramientas de productividad.
- Subtitulado automático de vídeo: al ejecutarse en ONNX Runtime, puede desplegarse junto a pipelines de procesamiento multimedia sin dependencia de PyTorch.
- Atención al cliente con transcripción de llamadas: permite generar transcripciones en tiempo casi real para sistemas de análisis de calidad o búsqueda sobre grabaciones.
- Indexación y búsqueda de archivos de audio: transcripción masiva de archivos para alimentar motores de búsqueda o sistemas RAG sobre contenido hablado.
- Asistentes de voz en dispositivos: la versión int8 reduce los requisitos de memoria, lo que facilita su despliegue en hardware con recursos limitados.
- Accesibilidad: generación de subtítulos y transcripciones para personas con discapacidad auditiva en aplicaciones de vídeo o streaming.
- Preprocesado para pipelines de NLP: conversión de audio a texto como paso previo a análisis de sentimiento, resumen o extracción de entidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 0,6 mil millones de parámetros en int8, el peso de los ficheros ONNX ronda los 0,7 GB según el tamaño del repo, por lo que se puede estimar un consumo de memoria en el rango de 1-2 GB, aunque esta cifra no está confirmada en la documentación.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño reducido del modelo, pero no se documenta oficialmente.
- Opciones de despliegue: ONNX Runtime (los ficheros son ONNX int8); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ChatPanel/parakeet-tdt-0.6b-v3-onnx | ~0,6 B | no disponible | CC-BY-4.0 | ONNX int8 | Espejo del upstream de istupakov |
| nvidia/parakeet-tdt-0.6b-v3 | ~0,6 B | no disponible | no disponible en esta ficha | NeMo/PyTorch | Modelo original de NVIDIA |
| istupakov/parakeet-tdt-0.6b-v3-onnx | ~0,6 B | no disponible | CC-BY-4.0 | ONNX int8 | Fuente original de la conversión |
| Whisper (variantes) | no disponible | no disponible | no disponible | varios | Alternativa ASR ampliamente usada; no se dispone de datos comparativos en esta información |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio es una copia sin modificaciones del upstream; no debe citarse como fuente original ni como trabajo de ChatPanel.
- No se documentan los idiomas soportados; el nombre "v3" sugiere una versión multilingüe, pero no se confirma en la información disponible.
- No se documentan sesgos conocidos del modelo base en esta copia.
- Riesgo de alucinación inherente a los sistemas ASR: posibles transcripciones incorrectas en audio con ruido, acentos o solapamiento de hablantes.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero se debe verificar la licencia del modelo base original de NVIDIA, que no se detalla en esta ficha.
- La cuantización int8 puede degradar ligeramente la precisión respecto al modelo en precisión completa; no se documenta el impacto exacto.
- No se documenta el proceso de conversión ni validación de la cuantización.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ChatPanel/parakeet-tdt-0.6b-v3-onnx
- Upstream de la conversión ONNX: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
