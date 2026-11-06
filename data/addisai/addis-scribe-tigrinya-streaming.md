# addisai/addis-scribe-tigrinya-streaming

## Resumen

Addis Scribe Streaming: Tigrinya es un modelo de reconocimiento automático del habla (ASR) especializado en tigriña, desarrollado por Addis AI. Se trata de un ajuste fino del modelo base `nvidia/nemotron-3.5-asr-streaming-0.6b`, lo que le confiere una arquitectura FastConformer con decodificación híbrida RNNT + CTC y 0,6 mil millones de parámetros. Su rasgo principal es que opera en modo streaming o tiempo real: el texto se genera mientras la persona habla y se finaliza poco después de que esta deje de hablar, gracias a un encoder cache-aware con tamaños de fragmento de 0,32 s o 1,12 s.

El modelo resuelve un problema concreto y poco cubierto: la transcripción de voz en tigriña, una lengua semítica eritrea y etíope con escritura etíope y escasa representación en sistemas ASR comerciales. Addis AI lo entrena específicamente sobre habla en tigriña y lo utiliza para servir la modalidad `language=ti` de su API Addis Scribe, lo que lo convierte en una pieza de infraestructura real en producción y no solo en un experimento de investigación.

Es relevante ahora porque demuestra que los modelos ASR de streaming de tamaño medio (0,6B) pueden adaptarse a lenguas de bajos recursos mediante ajuste fino sobre un backbone abierto (NeMo), con licencia OpenMDW 1.1 y pesos en formato `.nemo`. El repositorio ocupa 2,5 GB y el modelo se distribuye como un único archivo NeMo junto con sumas de verificación SHA256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder FastConformer cache-aware, decodificación híbrida RNNT + CTC |
| Parametros totales | 0,6 mil millones (0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (streaming por fragmentos de 0,32 s o 1,12 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tigriña (ti) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | `.nemo` (archivo NeMo), con `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo emplea un encoder FastConformer en configuración cache-aware, diseñado para inferencia en streaming. La decodificación es híbrida RNNT + CTC, y la generación se realiza con decodificación greedy RNNT. El modelo utiliza un índice de prompt fijo (49) para seleccionar la lengua; según la model card, la tigriña reutiliza la ranura `am-ET` del modelo base, por lo que es necesario llamar a `set_inference_prompt("am-ET")` para activar la transcripción en tigriña. La entrada es audio mono a 16 kHz y la salida es texto en escritura etíope sin puntuación.

El entrenamiento consistió en un ajuste fino sobre `nvidia/nemotron-3.5-asr-streaming-0.6b` con datos de habla en tigriña recopilados por Addis AI. No se especifican en la información disponible el número de horas de audio, la composición del dataset, ni si se aplicaron técnicas de aumento de datos o regularización. Tampoco se documentan detalles sobre el proceso de alineación o las etapas de entrenamiento más allá del ajuste supervisado implícito en la tarea ASR. La innovación técnica destacable es la operación en streaming con dos granularidades de fragmento (0,32 s y 1,12 s), lo que permite equilibrar latencia y precisión según el caso de uso.

## Capacidades

- Reconocimiento automático del habla en tigriña con salida en escritura etíope.
- Transcripción en tiempo real (streaming) con latencia de fragmento de 0,32 s o 1,12 s.
- Finalización rápida del texto tras el cese del habla.
- Inferencia por lotes mediante `model.transcribe([...])` sobre archivos de audio.
- Integración con la API de Addis AI (`language=ti`), que añade etiquetas de hablante, marcas de tiempo por palabra y subtítulos.
- No soporta puntuación en la salida.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No se documentan capacidades multilingües más allá del tigriña; el modelo ha sido probado solo en esa lengua.

## Casos de uso

- Subtitulado en directo de emisiones de radio o televisión en tigriña: el modelo puede generar texto mientras se habla con fragmentos de 0,32 s, adecuado para retransmisiones con baja tolerancia a la latencia y sin necesidad de puntuación.
- Transcripción de reuniones y entrevistas: con fragmentos de 1,12 s se reduce la carga computacional y se obtiene una transcripción casi en tiempo real de conversaciones multi-hablante, que la API de Addis AI puede enriquecer con etiquetas de hablante y marcas de tiempo.
- Atención al cliente en tigriña: integración en sistemas de telefonía o chat de voz para transcribir consultas de usuarios y alimentar un motor de respuestas, aprovechando el modo streaming para reducir la espera percibida.
- Accesibilidad para personas con discapacidad auditiva: generación de subtítulos en vivo en eventos, clases o videollamadas en tigriña, con la ventaja de que el modelo funciona sobre audio mono a 16 kHz, un formato habitual en herramientas de captura.
- Archivado y búsqueda de contenido audiovisual: transcripción por lotes de grabaciones históricas o periodísticas en tigriña para indexar y hacer buscable el audio, usando el modo no streaming sobre archivos WAV.
- Investigación lingüística y creación de corpus: generación de transcripciones para anotación y análisis del tigriña, teniendo en cuenta que las variantes ortográficas (por ejemplo ፀ/ጸ y ሰ/ሠ) pueden requerir normalización posterior.
- Integración en asistentes de voz locales: despliegue del modelo NeMo en infraestructura propia para asistentes que necesiten reconocimiento de voz en tigriña sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; como referencia de orden de magnitud, un modelo de 0,6B parámetros en precisión FP16 requiere aproximadamente 1,2 GB solo para los pesos, más memoria para activaciones y buffers de streaming.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño de 0,6B sugiere que podría caber en GPU de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: NeMo 3.0 (requisito explícito), mediante `ASRModel.restore_from` sobre el archivo `.nemo`; también a través de la API de Addis AI. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles; la latencia depende del tamaño de fragmento elegido (0,32 s o 1,12 s), pero no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / streaming | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Addis Scribe Streaming: Tigrinya | 0,6B | Streaming, fragmentos de 0,32 s / 1,12 s | Tigriña | OpenMDW 1.1 | Hugging Face (NeMo) y API Addis AI |
| nvidia/nemotron-3.5-asr-streaming-0.6b | 0,6B | Streaming | No disponible en la información | No disponible en la información | Hugging Face (modelo base) |
| Addis Scribe Streaming (Amhárico) | No disponible | Streaming | Amhárico | No disponible en la información | Hugging Face (addisai/addis-scribe-streaming) |

La comparación se limita a los modelos mencionados en la información disponible; no se dispone de datos de benchmarks que permitan comparar rendimiento entre ellos.

## Limitaciones y advertencias

- La salida no incluye puntuación, lo que limita su uso directo en aplicaciones que requieran texto formateado.
- La ortografía del tigriña presenta variantes (por ejemplo ፀ/ጸ y ሰ/ሠ); parte de los errores medidos corresponden a diferencias ortográficas respecto a la referencia y no a errores de reconocimiento.
- El modelo ha sido probado únicamente en tigriña; no hay evidencia de su comportamiento en otras lenguas.
- No se documentan sesgos específicos, pero al ser un ajuste fino sobre un modelo base entrenado con datos no descritos, pueden heredarse sesgos del corpus original.
- Riesgo de alucinación: no se documenta explícitamente para ASR, pero como todo modelo generativo de transcripción puede producir texto plausible no presente en el audio, especialmente con ruido o acentos no vistos.
- La licencia OpenMDW 1.1 debe revisarse para uso comercial; la model card indica que se aplica la misma licencia que el modelo base permite, pero no se detallan restricciones adicionales.
- Requiere NeMo 3.0 y el uso de un índice de prompt específico (49, ranura `am-ET`), lo que añade complejidad de integración.
- No se especifican requisitos de hardware ni cifras de latencia, lo que dificulta la planificación de despliegues en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/addisai/addis-scribe-tigrinya-streaming)
- [Modelo base: nvidia/nemotron-3.5-asr-streaming-0.6b](https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b)
- [Addis Scribe Streaming (Amhárico)](https://huggingface.co/addisai/addis-scribe-streaming)
- [Licencia OpenMDW 1.1](https://openmdw.ai/license/1-1/)
- [Documentación de la API de Addis AI](https://docs.addisassistant.com)
- [Sitio de Addis AI](https://addisassistant.com)
- [Repositorio NeMo de NVIDIA](https://github.com/NVIDIA/NeMo)
