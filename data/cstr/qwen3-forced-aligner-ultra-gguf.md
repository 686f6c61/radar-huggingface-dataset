# cstr/qwen3-forced-aligner-ultra-GGUF

## Resumen

Qwen3-ForcedAligner-Ultra (GGUF) es una conversión al formato GGUF del checkpoint base `17slever17/Qwen3-ForcedAligner-Ultra`, publicada por el usuario `cstr` para su uso con el motor CrispASR. No es un modelo de generación de texto ni un ASR completo: es un alineador forzado (*forced aligner*) que, dada una transcripción de referencia y un audio, devuelve las marcas temporales de cada palabra. Reutiliza la arquitectura del `Qwen/Qwen3-ForcedAligner-0.6B`: el codificador de audio de Qwen3-ASR, un cuerpo de 28 capas y una cabeza de timestamps de 5000 clases con resolución de 80 ms por clase.

El modelo tiene 917.755.024 parámetros (aproximadamente 0,92 mil millones) y el repositorio ocupa 1,8 GB, con un único fichero en precisión F16 de 1,84 GB. La conversión preserva los 708 tensores del checkpoint original y se ha validado contra la implementación Python upstream `qwen-asr` en las 22 fronteras de palabra de `samples/jfk.wav` ejecutando en CPU, como parte de la regresión nocturna de CrispASR.

Su relevancia es práctica: permite ejecutar alineación forzada de audio con marcas temporales a nivel de palabra en local, sin GPU y sin depender de frameworks de inferencia pesados, integrándose en pipelines de subtitulado, anotación fonética o evaluación de ASR. La licencia Apache-2.0 facilita el uso comercial, aunque el alcance validado es deliberadamente estrecho (inglés, F16, CPU).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3-ASR: codificador de audio + cuerpo de 28 capas + cabeza de timestamps de 5000 clases (80 ms/clase) |
| Parametros totales | 917.755.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (única variante publicada en este repositorio) |
| Idiomas soportados | no disponible (validación upstream únicamente en inglés, `samples/jfk.wav`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `qwen3-forced-aligner-ultra-f16.gguf`, 1,84 GB) |

## Arquitectura y entrenamiento

La arquitectura replica la de `Qwen/Qwen3-ForcedAligner-0.6B`: un codificador de audio tipo Qwen3-ASR acoplado a un cuerpo transformer de 28 capas que produce, en lugar de tokens de texto, una distribución sobre 5000 clases de timestamp con granularidad de 80 ms. El modelo está especializado en alineación forzada: recibe audio y texto de referencia y emite las fronteras temporales de las palabras de esa referencia. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron etapas de RLHF o DPO; la model card del repositorio GGUF no los detalla y el checkpoint base no se ha consultado en esta ficha.

La conversión, realizada con `models/convert-qwen3-asr-to-gguf.py` sobre la revisión fijada `765dc1d714e4c80196782a5df5bfbcb3e1416736`, abarca los 708 tensores del checkpoint y solo altera la serialización y el almacenamiento numérico (F16). Quedan explícitamente fuera del alcance de esta conversión la cabeza opcional de refinamiento local de fronteras (`local_head/`) y el directorio `companion/`, por lo que no debe asumirse la precisión de 10 ms que esos componentes podrían aportar. Tampoco se han cualificado variantes cuantizadas ni ejecución en GPU.

## Capacidades

- Alineación forzada de audio y texto: genera marcas temporales a nivel de palabra para una transcripción de referencia dada.
- Salida de timestamps con resolución de 80 ms por clase a través de la cabeza de 5000 clases.
- Formato de salida JSON mediante la opción `--align-format json` de CrispASR.
- Ejecución en CPU validada contra la implementación Python `qwen-asr` en las 22 fronteras de palabra de `samples/jfk.wav`.
- Integración en el motor CrispASR mediante la ruta de alineador Qwen3, seleccionada por el nombre del fichero (`forced-aligner` o `ForcedAligner`).
- No es un modelo generativo: no produce transcripciones, no razona, no escribe código y no soporta tool calling ni agentes.
- No se documentan capacidades multilingües, de visión ni de audio más allá de la alineación.

## Casos de uso

- Subtitulado a nivel de palabra: dado un audio y su transcripción ya revisada, el modelo devuelve las fronteras temporales de cada palabra, lo que permite generar subtítulos karaoke o resaltados sincronizados sin estimaciones heurísticas.
- Control de calidad de pipelines ASR: al comparar los timestamps del alineador con los producidos por el sistema ASR, se pueden detectar desalineaciones sistemáticas, cortes prematuros o palabras omitidas en la transcripción.
- Anotación de corpus lingüísticos: para estudios fonéticos o de prosodia, el modelo aporta la localización temporal exacta de cada palabra sobre grabaciones con transcripción ortográfica disponible.
- Sincronización de transcripciones editoriales: en la publicación de entrevistas o pódcasts, permite enlazar cada fragmento de texto con su posición exacta en el audio para reproductores con seguimiento de transcripción.
- Evaluación de modelos de reconocimiento de voz: sirve como referencia de alineación para calcular métricas de temporización (desviación media de fronteras) frente a otros sistemas.
- Preprocesado para entrenamiento de modelos de voz: la alineación palabra a audio facilita la segmentación de corpus largos en fragmentos con etiquetas temporales precisas antes de tareas de TTS o ASR.
- Despliegue en entornos sin GPU: al ejecutarse en CPU con CrispASR y pesar 1,84 GB en F16, encaja en servidores modestos o estaciones de trabajo sin acelerador dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única validación documentada es cualitativa y acotada: coincidencia con la implementación Python `qwen-asr` en las 22 fronteras de palabra de `samples/jfk.wav` sobre CPU.

## Requisitos de hardware

- VRAM estimada: no aplica en la configuración validada; la ejecución documentada es en CPU. Para una hipotética ejecución en GPU, el fichero F16 de 1,84 GB requeriría del orden de 2 GB de memoria solo para pesos, más estados intermedios del codificador de audio y del cuerpo de 28 capas (no cuantificado en la información disponible).
- GPU recomendadas: no disponible; la ejecución en GPU no está cualificada por el autor de la conversión.
- GPU de consumo: no confirmado. Por tamaño de pesos, un fichero F16 de 1,84 GB cabría en cualquier GPU con 4 GB o más de VRAM, pero al no haberse validado la ruta GPU no puede garantizarse su funcionamiento.
- Opciones de despliegue: CrispASR (ruta de alineador Qwen3). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La validación se limita a un único fichero de muestra en CPU sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato | Estado |
|---|---|---|---|---|---|---|
| cstr/qwen3-forced-aligner-ultra-GGUF | 917.755.024 | no disponible | Alineación forzada | Apache-2.0 | GGUF F16 | Publicado, validación limitada a CPU e inglés |
| cstr/qwen3-forced-aligner-0.6b-GGUF | no disponible (deriva de Qwen3-ForcedAligner-0.6B) | no disponible | Alineación forzada | no disponible | GGUF (incluye variantes Q5_0) | Publicado por el mismo autor |
| 17slever17/Qwen3-ForcedAligner-Ultra | 917.755.024 (según safetensors del GGUF derivado) | no disponible | Alineación forzada | Apache-2.0 | safetensors (checkpoint base) | Checkpoint upstream del que deriva esta conversión |
| Qwen/Qwen3-ForcedAligner-0.6B | no disponible | no disponible | Alineación forzada | no disponible | no disponible | Modelo de referencia arquitectónica citado en la model card |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un alineador, los sesgos relevantes serían los del codificador de audio subyacente, no evaluados en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de fronteras temporales incorrectas cuando el texto de referencia no coincide con el audio o contiene palabras no pronunciadas.
- Idioma: la única validación publicada es en inglés (`samples/jfk.wav`); el autor declara explícitamente que otros idiomas no están cualificados.
- Precisión temporal: la resolución nominal es de 80 ms por clase; la cabeza opcional de refinamiento local (`local_head/`) no está incluida, por lo que no debe esperarse precisión de 10 ms.
- Componentes ausentes: `local_head/` y `companion/` no forman parte de la conversión.
- Ejecución en GPU: no cualificada por el autor; solo se ha validado CPU.
- Cuantizaciones: solo se publica F16; no hay variantes Q4, Q5 u Q8 en este repositorio.
- Licencia: Apache-2.0 permite uso comercial, pero la responsabilidad sobre el modelo original recae en los autores upstream; esta conversión solo cambia el formato de serialización.
- Dependencia del motor: requiere CrispASR y que el nombre del fichero contenga `forced-aligner` o `ForcedAligner` para seleccionar la ruta correcta.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-11-07; no hay evidencia de uso en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/cstr/qwen3-forced-aligner-ultra-GGUF
- Checkpoint base: https://huggingface.co/17slever17/Qwen3-ForcedAligner-Ultra
- Modelo de referencia arquitectónica: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Motor CrispASR: https://github.com/CrispStrobe/CrispASR
- Conversión relacionada del mismo autor: https://huggingface.co/cstr/qwen3-forced-aligner-0.6b-GGUF
- Variante cuantizada Q5_0 del modelo relacionado: https://huggingface.co/cstr/qwen3-forced-aligner-0.6b-GGUF/blob/main/qwen3-forced-aligner-0.6b-q5_0.gguf
