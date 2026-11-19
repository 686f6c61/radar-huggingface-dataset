# sayzly/Voxtral-Mini-4B-Realtime-2602-gguf

## Resumen

Voxtral Mini 4B Realtime (GGUF) es una cuantización en formato GGUF del modelo `mistralai/Voxtral-Mini-4B-Realtime-2602`, publicada por el usuario `sayzly`. Se trata de una conversión de pesos del modelo original de Mistral AI orientada a inferencia de reconocimiento automático del habla (ASR) en tiempo real, empaquetada como un único fichero `Voxtral-Mini-4B-Realtime-2602-Q8_0.gguf` que la herramienta Sayzly descarga para ejecutar el modelo.

El modelo base es un sistema de speech-to-text de Mistral AI con 4.429.707.024 parámetros totales (aproximadamente 4,43 mil millones), lo que lo sitúa en la gama "Mini" de la familia Voxtral. La relevancia de esta publicación concreta es práctica: ofrece los pesos en un formato compatible con runtimes de inferencia local (llama.cpp y derivados) en cuantización Q8_0, lo que facilita el despliegue del modelo fuera de infraestructura con GPUs de datacenter.

La ficha del repositorio es mínima: el autor no documenta idiomas soportados, composición del dataset, resultados de benchmarks ni detalles de la arquitectura más allá de la referencia al modelo original. Toda la información técnica sustantiva debe consultarse en la model card de `mistralai/Voxtral-Mini-4B-Realtime-2602`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base de Mistral AI; detalles en la model card original) |
| Parámetros totales | 4.429.707.024 |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q8_0 (único fichero publicado) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna en la documentación de este repositorio. El modelo base pertenece a la familia Voxtral de Mistral AI, orientada a reconocimiento de voz, y la nomenclatura "Realtime" sugiere un diseño para transcripción de flujo continuo de audio, pero este repositorio no aporta detalles sobre el tipo de transformer, el encoder de audio, la longitud de contexto ni el esquema de atención.

Tampoco se documentan los datos de entrenamiento: número de tokens, composición del corpus de audio, horas de transcripción, ni si hubo etapas de ajuste supervisado o preferencias (RLHF/DPO). La única información técnica verificable es el recuento de parámetros (4.429.707.024) y el proceso de conversión a GGUF en cuantización Q8_0, que preserva los pesos originales con precisión de 8 bits por parámetro.

## Capacidades

- Reconocimiento automático del habla (speech-to-text), según el pipeline declarado `automatic-speech-recognition`.
- Transcripción orientada a flujo en tiempo real, a tenor del sufijo "Realtime" del modelo base.
- Ejecución en formato GGUF mediante runtimes compatibles con llama.cpp, lo que permite inferencia local.
- No se documentan en este repositorio capacidades de tool calling, agentes, visión, audio generativo ni modos de razonamiento extendido.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Transcripción de reuniones y llamadas: el modelo puede procesar audio de conversaciones y generar texto, desplegado localmente con el fichero GGUF en un runtime compatible; el carácter "Realtime" del modelo base lo hace adecuado para flujos de captura continua.
- Subtitulado y generación de actas: integración en pipelines que reciben audio en streaming y producen transcripciones con baja latencia, al ejecutarse en hardware propio sin depender de APIs externas.
- Asistentes de voz en aplicaciones de escritorio: al estar en formato GGUF y cuantización Q8_0, puede embeberse en aplicaciones locales que necesiten dictado o comandos por voz sin enviar audio a la nube.
- Procesamiento por lotes de archivos de audio: conversión de archivos pregrabados a texto en entornos con GPU de consumo, usando el fichero Q8_0 como artefacto único de despliegue.
- Prototipado e investigación en ASR: punto de partida reproducible para evaluar el modelo base de Mistral AI en distintos dominios de audio antes de escalar a infraestructura de producción.
- Pipelines de accesibilidad: generación de transcripciones en vivo para personas con discapacidad auditiva en entornos controlados donde se requiera ejecución local por privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para Q8_0: en torno a 4,4 GB solo para los pesos (4,43 mil millones de parámetros a 8 bits), más el overhead de contexto y del encoder de audio; en la práctica, prever 6-8 GB de VRAM para margen operativo.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo es apto para GPUs de consumo con 8 GB o más de VRAM.
- GPU de consumo: cabe en tarjetas tipo RTX 3060/4060 de 8 GB y superiores, siempre que el runtime soporte la arquitectura del modelo base.
- Opciones de despliegue: llama.cpp y runtimes derivados compatibles con GGUF; no se confirma soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Voxtral Mini 4B Realtime (este repo) | 4,43 B | No disponible | Apache 2.0 | GGUF Q8_0 | Cuantización de terceros del modelo de Mistral AI |
| mistralai/Voxtral-Mini-4B-Realtime-2602 | 4,43 B | No disponible | Apache 2.0 | Pesos originales | Modelo base oficial; referencia para comparar precisión |
| Alternativas ASR de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Repositorio de terceros: la conversión a GGUF la publica el usuario `sayzly`, no Mistral AI; no hay garantía de equivalencia exacta de comportamiento frente a los pesos originales más allá de la cuantización Q8_0.
- Sin benchmarks ni evaluación publicada: no hay métricas de WER (word error rate) ni comparativas que permitan estimar la degradación por cuantización.
- Idiomas no documentados: no se puede confirmar la cobertura lingüística sin consultar la model card del modelo base.
- Contexto de audio no documentado: se desconoce la duración máxima de audio procesable por ventana.
- Riesgo de alucinación en transcripción: como todo modelo generativo aplicado a ASR, puede producir texto plausible no presente en el audio, especialmente con ruido o solapamiento de hablantes.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar los términos del modelo base y las condiciones de atribución.
- Fecha de creación del repositorio (2026-11-19) y cero descargas: sin validación comunitaria ni informes de uso en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/sayzly/Voxtral-Mini-4B-Realtime-2602-gguf
- Modelo base: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602
