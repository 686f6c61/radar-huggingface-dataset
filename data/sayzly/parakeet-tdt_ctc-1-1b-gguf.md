# sayzly/parakeet-tdt_ctc-1.1b-gguf

## Resumen

El repositorio `sayzly/parakeet-tdt_ctc-1.1b-gguf` es una conversión a formato GGUF del modelo `nvidia/parakeet-tdt_ctc-1.1b`, un sistema de reconocimiento automático del habla (ASR) desarrollado por NVIDIA. El modelo original es un transformer de aproximadamente 1.070 millones de parámetros entrenado con una combinación de las funciones de pérdida TDT (Token-and-Duration Transducer) y CTC (Connectionist Temporal Classification), una arquitectura que permite transcribir audio a texto de forma eficiente combinando predicción de tokens con modelado explícito de la duración.

La relevancia de este repositorio es fundamentalmente práctica: el autor (`sayzly`) publica únicamente el archivo `parakeet-tdt_ctc-1.1b-Q8_0.gguf`, es decir, una cuantización de 8 bits del modelo original, sin modificaciones en los pesos más allá de la conversión de formato. Esto facilita su uso en entornos donde el formato GGUF es el estándar de despliegue (llama.cpp y derivados), aunque el ecosistema de inferencia de audio en GGUF es todavía más limitado que el de los modelos de texto.

Conviene señalar que el repositorio no incluye información sobre idiomas soportados, composición del dataset de entrenamiento ni resultados de benchmarks; la model card es mínima y se limita a atribuir la autoría a NVIDIA y a indicar la licencia. El modelo base es, por tanto, la fuente principal de información técnica, y esta ficha refleja únicamente lo que puede verificarse a partir de los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ASR con decodificación TDT (Token-and-Duration Transducer) y CTC |
| Parametros totales | 1.070.516.870 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (única publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (archivo `parakeet-tdt_ctc-1.1b-Q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo base, `nvidia/parakeet-tdt_ctc-1.1b`, es un sistema ASR basado en transformer que combina dos paradigmas de decodificación: TDT (Token-and-Duration Transducer), que predice conjuntamente el token de salida y su duración, y CTC, que proporciona una alineación monotónica sin necesidad de un modelo de lenguaje externo en la decodificación. Esta combinación permite obtener transcripciones con timestamps implícitos y un buen equilibrio entre precisión y velocidad de inferencia. El modelo cuenta con 1.070 millones de parámetros, lo que lo sitúa en la gama media de los sistemas ASR neuronales.

No se dispone de información sobre el número de tokens de audio utilizados en el entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste fino como RLHF o DPO. Tampoco se documentan innovaciones adicionales más allá de la propia arquitectura híbrida TDT+CTC. La conversión a GGUF realizada por `sayzly` no altera los pesos, únicamente el formato de serialización, y se limita a una cuantización Q8_0.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto).
- Decodificación híbrida TDT+CTC, que permite obtener alineaciones temporales y transcripciones con una sola pasada.
- Procesamiento de audio en formato de onda (wav) como entrada, según el pipeline `automatic-speech-recognition`.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta modo de razonamiento multi-paso ni "thinking mode".
- No se documenta capacidad multimodal (visión, audio más allá del ASR, etc.).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Transcripción de reuniones y actas: el modelo puede convertir grabaciones de audio de reuniones en texto para su posterior indexación o resumen, aprovechando la decodificación TDT para obtener marcas temporales que faciliten la atribución de intervenciones.
- Subtitulado automático de vídeo: la salida con alineación temporal implícita permite generar subtítulos sincronizados para contenido audiovisual, integrándose en pipelines de postproducción.
- Atención al cliente basada en voz: transcripción de llamadas para su análisis posterior (sentimiento, cumplimiento, extracción de entidades), desplegando el GGUF en infraestructura local para cumplir requisitos de privacidad.
- Dictado y accesibilidad: integración en aplicaciones de escritorio o móviles que convierten voz en texto para usuarios con dificultades de movilidad, usando la cuantización Q8_0 para reducir el consumo de memoria.
- Generación de actas y notas clínicas: transcripción de consultas o sesiones con fines documentales, siempre con revisión humana dada la naturaleza sensible del dominio.
- Búsqueda sobre archivos de audio: indexación de transcripciones para permitir búsqueda por palabra clave en grandes volúmenes de grabaciones (podcasts, archivos periodísticos, soportes técnicos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 ocupa aproximadamente 1,3 GB (tamaño del repo), por lo que se puede ejecutar con menos de 2 GB de memoria en GPU o incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100); el modelo es lo suficientemente pequeño como para no requerir hardware de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 4 GB o más de VRAM.
- Opciones de despliegue: llama.cpp y entornos compatibles con GGUF; no se documenta soporte específico para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| sayzly/parakeet-tdt_ctc-1.1b-gguf | 1.070 M | no disponible | cc-by-4.0 | GGUF (Q8_0) | Hugging Face |
| nvidia/parakeet-tdt_ctc-1.1b (original) | 1.070 M | no disponible | cc-by-4.0 | safetensors (NeMo) | Hugging Face |
| Whisper large-v3 (OpenAI) | ~1.550 M | 30 s de audio | MIT | safetensors, GGUF, etc. | Hugging Face, OpenAI |
| Whisper medium (OpenAI) | ~769 M | 30 s de audio | MIT | safetensors, GGUF, etc. | Hugging Face, OpenAI |

La comparación con Whisper es la más habitual en el ámbito ASR: Whisper large-v3 tiene más parámetros y una licencia permisiva (MIT), mientras que Parakeet apuesta por la decodificación TDT+CTC. No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo de forma objetiva.

## Limitaciones y advertencias

- La model card es mínima: no se documentan idiomas soportados, condiciones de audio (ruido, sample rate) ni límites de duración de entrada.
- Riesgo de alucinación y errores de transcripción en audio con ruido, acentos marcados o solapamiento de hablantes, como en cualquier sistema ASR.
- No se documentan sesgos conocidos; al ser un modelo entrenado por NVIDIA, los sesgos dependerán del dataset original, no descrito aquí.
- Licencia CC BY 4.0: permite uso comercial siempre que se atribuya la autoría a NVIDIA y a `sayzly` por la conversión; conviene revisar los términos exactos de la licencia original.
- Solo se publica la cuantización Q8_0; no hay versiones Q4, Q5 o F16 en este repositorio, lo que limita las opciones de despliegue en hardware muy restringido.
- El ecosistema de inferencia de audio en GGUF es menos maduro que el de texto; verificar la compatibilidad con la herramienta concreta antes de usarlo en producción.
- No se han publicado métricas de latencia ni throughput, por lo que no se puede garantizar un rendimiento en tiempo real sin pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sayzly/parakeet-tdt_ctc-1.1b-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt_ctc-1.1b
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
