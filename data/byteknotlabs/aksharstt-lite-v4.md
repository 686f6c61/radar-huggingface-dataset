# byteknotlabs/AksharSTT-Lite-V4

## Resumen

AksharSTT Lite v4 es un modelo de reconocimiento automático del habla (ASR) desarrollado por byteknotlabs, diseñado específicamente para hindi, inglés y habla mezclada hindi-inglés (hinglish). Se trata de una versión cuantizada de AksharSTT v4, en la que el decodificador se ha reducido a 2 bits y el codificador se mantiene a 4 bits, lo que permite comprimir el modelo hasta los 20,4 MB. Su propósito es ofrecer transcripción offline en dispositivos con recursos limitados, como teléfonos móviles y sistemas embebidos.

El modelo emplea una arquitectura encoder-decoder denominada Whistle, con 8 capas de codificador y 8 de decodificador, anchura 512 y aproximadamente 55 millones de parámetros. Se ejecuta mediante el motor needle de Cactus (`cactus-needle` en PyPI), que permite integración en aplicaciones Windows, macOS, Linux, Android, iOS y web. La licencia es Apache-2.0, lo que facilita su uso comercial.

La relevancia de este modelo radica en su relación entre tamaño y rendimiento: con solo 20,4 MB logra un error medio de palabra (WER) de 21,71 en seis conjuntos de prueba, solo 0,93 puntos por detrás de su versión completa de 29,5 MB. Está pensado para escenarios de reconocimiento de voz en tiempo real sin conexión, donde el espacio de almacenamiento y la memoria son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whistle encoder-decoder (8 capas encoder, 8 capas decoder, anchura 512) |
| Parametros totales | ~55 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de cualquier duración, según model card) |
| Tipos de cuantizacion | Decodificador a 2 bits, codificador/embeddings/matrices de enrutamiento a 4 bits (89 tensores a 2 bits, 63 a 4 bits) |
| Idiomas soportados | Hindi (hi), inglés (en), código mezclado hindi-inglés (hinglish) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.cact` (formato propietario del motor needle de Cactus) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer encoder-decoder denominada Whistle, con 8 capas en cada bloque y una anchura de 512 dimensiones, sumando aproximadamente 55 millones de parámetros. El vocabulario combina el conjunto base de Whistle con 714 piezas Devanagari procedentes de Shruti y una etiqueta de idioma `hi`. La innovación principal reside en la cuantización mixta: el decodificador se entrena directamente a 2 bits, mientras que el codificador, la tabla de embeddings y las matrices de enrutamiento se mantienen a 4 bits. Esto da lugar a 89 tensores cuantizados a 2 bits y 63 a 4 bits, lo que reduce el tamaño del archivo a 20,4 MB.

El entrenamiento se realizó sobre una combinación de conjuntos de datos que incluye IndicVoices, Vaani-transcription-part, Shrutilipi, Kathbath, Rural_Women_ASR_v2, NPTEL, FLEURS, LibriSpeech y MUCS-Hinglish. No se especifica en la información disponible el número total de tokens de audio ni si se aplicaron técnicas de RLHF o DPO. El modelo se ejecuta en el motor needle, que permite inferencia en dispositivo sin conexión y soporta la devolución de marcas de tiempo por palabra junto con sus probabilidades.

## Capacidades

- Transcripción de voz a texto en hindi, inglés y habla mezclada hindi-inglés (code-switching).
- Detección y selección de idioma mediante el flag `language="hi"` o `language="en"`.
- Entrada de audio en formato WAV o muestras float mono a 16 kHz en el rango [-1, 1], de cualquier duración.
- Salida de texto en un estilo unificado: hindi en Devanagari, palabras inglesas en minúsculas latinas, números como palabras y sin puntuación.
- Soporte opcional de marcas de tiempo por palabra (`word_timestamps=True`) con inicio, fin y probabilidad asociada.
- Capacidad de no generar texto ante silencios o ruido tenue (según la model card, en 100 clips de silencio y ruido débil no escribe nada).
- Ejecución offline en dispositivo mediante el motor needle, sin necesidad de conexión a internet.
- Integración multiplataforma: Windows, macOS, Linux, Android, iOS y aplicaciones web.

## Casos de uso

- Transcripción offline en aplicaciones móviles: el modelo cabe en 20,4 MB y se ejecuta en el propio dispositivo mediante needle, lo que permite dictado por voz y notas de voz sin conexión y sin enviar audio a servidores externos.
- Subtitulado automático de vídeos en hindi e hinglish: gracias a las marcas de tiempo por palabra, se pueden generar subtítulos sincronizados para contenido audiovisual en plataformas con recursos limitados.
- Asistentes de voz embebidos en dispositivos IoT: su reducido tamaño y su capacidad de ejecución en CPU sin GPU lo hacen adecuado para altavoces inteligentes, wearables y electrodomésticos con memoria escasa.
- Atención al cliente en centros de llamadas: permite transcribir conversaciones telefónicas en hindi e inglés mezclado para su posterior análisis, cumplimiento normativo o generación de actas, sin depender de servicios en la nube.
- Herramientas de accesibilidad para personas con discapacidad auditiva: transcripción en tiempo real de conversaciones presenciales en hindi o hinglish en aplicaciones móviles, con bajo consumo de batería y almacenamiento.
- Procesamiento de audio en entornos con conectividad limitada: aplicaciones de campo, zonas rurales o situaciones de emergencia donde no hay acceso a internet pero se requiere transcripción de voz.
- Integración en pipelines de análisis de audio: al ejecutarse en local, se puede incorporar en flujos de trabajo que requieran privacidad de datos, como la transcripción de reuniones médicas o legales en India.

## Benchmarks y rendimiento

Los resultados que se presentan a continuación han sido declarados por el autor del modelo (no verificados de forma independiente) y corresponden a los conjuntos de prueba completos con la configuración indicada en la model card.

| Conjunto de prueba | Métrica | Valor |
|---|---|---|
| Monsoon Hindi (public split) | OIWER | 21,55 |
| FLEURS Hindi | WER | 19,14 |
| Lahaja | WER | 25,78 |
| MUCS 2021 Hindi-English | WER | 34,85 |
| Svarah | WER | 22,43 |
| LibriSpeech test-clean | WER | 6,50 |
| Media de seis conjuntos | WER medio | 21,71 |

Según la model card, el WER medio de 21,71 está 0,93 puntos por detrás de AksharSTT v4 (20,78 implícito) y 0,07 puntos por debajo de Shruti a 4 bits (21,78). En Svarah (inglés con acento indio) obtiene 22,43, en línea con Shruti (22,45) y 2,25 mejor que AksharSTT v1. Frente a AksharSTT v1, mejora en cinco de los seis conjuntos y en la media (21,71 frente a 22,28).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo ocupa 20,4 MB en disco y se ejecuta en el motor needle, que está optimizado para CPU y dispositivos de baja memoria.
- GPU recomendadas: no se especifican GPU dedicadas; el modelo está diseñado para ejecutarse en CPU de teléfonos y dispositivos embebidos. No se dispone de datos sobre rendimiento en A100, H100 o RTX 4090.
- ¿Cabe en GPU consumer? Sí, con enorme holgura, pero su objetivo no es GPU de escritorio sino dispositivos móviles y sistemas con poca memoria.
- Opciones de despliegue: motor needle (`cactus-needle` en PyPI), que se integra en Windows, macOS, Linux, Android, iOS y web. No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.cact` es específico de needle.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Contexto | WER medio (6 conjuntos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AksharSTT Lite v4 | ~55 M | 20,4 MB | audio de cualquier duración | 21,71 | Apache-2.0 | Hugging Face, motor needle |
| AksharSTT v4 | ~55 M (no confirmado) | 29,5 MB | audio de cualquier duración | ~20,78 (implícito) | Apache-2.0 | Hugging Face |
| Shruti (4 bits) | no disponible | no disponible | no disponible | 21,78 | no disponible | no disponible |
| AksharSTT v1 | no disponible | no disponible | no disponible | 22,28 | no disponible | Hugging Face |

La comparativa se limita a los modelos mencionados en la model card. No se dispone de datos sobre otros modelos ASR comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en hindi, inglés y hinglish; no se ha evaluado su rendimiento en otros idiomas y probablemente no los soporte correctamente.
- La salida está restringida a un único estilo: sin puntuación, números como palabras y palabras inglesas en minúsculas; esto puede requerir post-procesado para aplicaciones que necesiten formato enriquecido.
- El WER en MUCS 2021 (34,85) es notablemente alto, lo que indica dificultades en habla code-switching compleja o en dominios específicos.
- Los benchmarks han sido declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- Riesgo de alucinación: aunque la model card indica que en silencios y ruido tenue no genera texto, no se especifica el comportamiento ante audio ininteligible o con ruido intenso; podría producir transcripciones erróneas.
- Sesgos conocidos: no se documentan en la información proporcionada, pero al entrenarse con conjuntos de datos de India (IndicVoices, Vaani, etc.) podría presentar sesgos dialectales o de género.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el formato `.cact` y el motor needle son específicos del ecosistema Cactus; la portabilidad a otros runtimes no está garantizada.
- El modelo base AksharSTT v4 no está disponible en la información proporcionada con sus especificaciones completas, lo que limita la comparación detallada.
- No se dispone de información sobre latencia, throughput ni consumo energético en dispositivos reales.

## Enlaces

- [Hugging Face: byteknotlabs/AksharSTT-Lite-V4](https://huggingface.co/byteknotlabs/AksharSTT-Lite-V4)
- [Sitio web oficial](https://akshar.byteknotlabs.com)
- [Demo en vivo](https://akshar.byteknotlabs.com)
- [Repositorio GitHub](https://github.com/byteknotlabsai/akshar)
- [Modelo base AksharSTT v4](https://huggingface.co/byteknotlabs/AksharSTT-V4)
- [AksharSTT v1](https://huggingface.co/byteknotlabs/AksharSTT-V1)
- [Paquete cactus-needle en PyPI](https://pypi.org/project/cactus-needle/)
