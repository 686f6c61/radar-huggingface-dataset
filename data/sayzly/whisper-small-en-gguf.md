# sayzly/whisper-small.en-gguf

## Resumen

Whisper Small English en formato GGUF es una conversión del modelo de reconocimiento automático de voz `openai/whisper-small.en`, publicada por el usuario `sayzly` bajo licencia Apache 2.0. El modelo original pertenece a la familia Whisper de OpenAI, una arquitectura transformer encoder-decoder entrenada para transcripción de audio a texto. Esta versión concreta empaqueta los pesos en formato GGUF (concretamente el fichero `whisper-small.en-Q8_0.gguf`), lo que permite su despliegue en runtimes de inferencia optimizados para CPU y GPU de consumo, como llama.cpp o whisper.cpp.

El modelo cuenta con aproximadamente 241,75 millones de parámetros y está especializado exclusivamente en inglés (el sufijo `.en` indica que no se entrenó para tareas multilingües ni de traducción). Su tamaño reducido y su cuantización Q8_0 lo hacen adecuado para transcripción en tiempo real o casi real en hardware modesto, integrable en aplicaciones de dictado, subtitulado o procesamiento por lotes de audio.

La relevancia de esta ficha radica en que se trata de una conversión comunitaria de un modelo ampliamente conocido, publicada sin métricas de rendimiento propias ni documentación técnica adicional. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño total del repo es de 0,3 GB, coherente con un único fichero GGUF cuantizado de un modelo de ~242 M de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), según modelo base `openai/whisper-small.en` |
| Parametros totales | 241.750.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 segundos; no se documenta un contexto de tokens explícito en la información proporcionada) |
| Tipos de cuantizacion | Q8_0 (único fichero mencionado: `whisper-small.en-Q8_0.gguf`) |
| Idiomas soportados | inglés (modelo `.en`); no se documentan otros idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |
| Tarea | automatic-speech-recognition (speech-to-text) |
| Modelo base | openai/whisper-small.en |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde a Whisper, un transformer encoder-decoder diseñado para reconocimiento automático de voz. El encoder procesa espectrogramas mel del audio de entrada y el decoder genera la transcripción token a token. El modelo base `openai/whisper-small.en` fue entrenado por OpenAI sobre un corpus de audio en inglés con supervisión débil (transcripciones a gran escala); sin embargo, la información proporcionada no detalla el número exacto de horas de audio, la composición del dataset ni si se aplicaron etapas de ajuste fino con RLHF o DPO. Whisper no emplea RLHF en su pipeline habitual, pero este dato no se confirma en la documentación disponible.

La contribución de esta publicación no es arquitectónica ni de entrenamiento, sino de empaquetado: se trata de una conversión de los pesos originales a GGUF con cuantización Q8_0. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) ni modificaciones respecto al modelo original. El proceso de conversión a GGUF y cuantización a 8 bits reduce el peso del modelo y facilita su ejecución en runtimes compatibles, a costa de una posible pérdida mínima de precisión respecto al modelo en precisión completa.

## Capacidades

- Transcripción de voz a texto en inglés (speech-to-text) sobre audio de hasta 30 segundos por ventana, con la posibilidad de encadenar ventanas para audios más largos.
- Reconocimiento de habla en inglés con puntuación y capitalización generadas por el propio modelo.
- Segmentación temporal aproximada mediante marcas de tiempo (timestamps) en la salida, funcionalidad heredada de Whisper.
- Procesamiento de audio en formato de espectrograma mel, habitual en los pipelines de Hugging Face y en whisper.cpp.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe: el modelo `.en` está especializado en inglés y no realiza traducción.
- No dispone de modo "thinking", visión ni audio generation; su única modalidad es audio de entrada y texto de salida.
- Ejecutable en runtimes GGUF (llama.cpp, whisper.cpp) además de en frameworks que acepten pesos convertidos.

## Casos de uso

- Subtitulado automático de vídeos en inglés: el modelo puede transcribir pistas de audio y generar subtítulos con marcas de tiempo, integrándose en pipelines de postproducción. Su tamaño de ~242 M de parámetros permite procesar horas de audio en lotes sin requerir GPUs de gama alta.
- Dictado por voz en aplicaciones de escritorio: al ejecutarse en formato GGUF sobre CPU, puede integrarse en herramientas de productividad locales (por ejemplo, editores de texto o asistentes de notas) que transcriben la voz del usuario en inglés sin enviar audio a la nube.
- Transcripción de reuniones y llamadas en inglés: con encadenamiento de ventanas de 30 segundos, el modelo puede procesar grabaciones completas y producir actas o resúmenes previos a un post-procesado con un LLM.
- Indexación y búsqueda de archivos de audio: transcripción masiva de podcasts o archivos de audio en inglés para construir índices de texto buscables, aprovechando el bajo coste computacional de la cuantización Q8_0.
- Prototipado y evaluación de pipelines ASR: investigadores que necesiten un modelo de referencia ligero en inglés pueden usar esta conversión GGUF para comparar latencia y calidad frente a otras alternativas sin depender de infraestructura GPU dedicada.
- Accesibilidad: generación de transcripciones en vivo o diferidas para contenido en inglés dirigido a personas con discapacidad auditiva, desplegable en hardware de consumo gracias a su reducido tamaño.
- Pre-procesado para pipelines de voz a LLM: la transcripción en inglés puede alimentar un modelo de lenguaje posterior para tareas de resumen, extracción de entidades o análisis de sentimiento en conversaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF Q8_0 ocupa aproximadamente 0,3 GB (tamaño del repo), por lo que la VRAM necesaria es del orden de 0,5-1 GB incluyendo buffers de activaciones y espectrogramas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre es suficiente; se puede ejecutar en GPUs de consumo como GTX 1650, RTX 3050, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo e incluso en iGPU con memoria compartida suficiente.
- Ejecución en CPU: viable gracias al formato GGUF; el modelo puede correr en CPU con un rendimiento aceptable para transcripción por lotes o casi en tiempo real en CPUs modernas.
- Opciones de despliegue: whisper.cpp, llama.cpp (con soporte de audio), y frameworks que acepten GGUF; también es posible usar el modelo original en Transformers si se dispone de los pesos en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Como referencia cualitativa, un modelo de ~242 M de parámetros cuantizado a 8 bits es ligero, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| sayzly/whisper-small.en-gguf | 241.750.624 | ventanas de audio de 30 s (Whisper) | inglés | apache-2.0 | GGUF (Q8_0) |
| openai/whisper-small.en | ~242 M | ventanas de audio de 30 s (Whisper) | inglés | apache-2.0 | safetensors / PyTorch |
| openai/whisper-small | ~242 M | ventanas de audio de 30 s (Whisper) | multilingüe | apache-2.0 | safetensors / PyTorch |
| openai/whisper-base.en | ~74 M | ventanas de audio de 30 s (Whisper) | inglés | apache-2.0 | safetensors / PyTorch |

La comparativa se limita a variantes de la propia familia Whisper, ya que la información proporcionada no incluye datos de rendimiento que permitan comparar con otras familias ASR (por ejemplo, Wav2Vec2 o Conformer). La diferencia principal de esta publicación frente a `openai/whisper-small.en` es el formato GGUF cuantizado, que reduce el tamaño y facilita el despliegue en runtimes ligeros, a cambio de una posible pérdida mínima de precisión no cuantificada en la documentación.

## Limitaciones y advertencias

- Modelo especializado únicamente en inglés: no transcribe otros idiomas ni realiza traducción; el sufijo `.en` lo confirma.
- No se documentan sesgos específicos, pero al derivar de Whisper hereda los sesgos del corpus de entrenamiento original de OpenAI, no detallados en esta publicación.
- Riesgo de alucinación en audio con ruido, silencios largos o habla no inglesa: Whisper puede generar texto inventado en segmentos ambiguos; conviene aplicar umbrales de confianza y revisión.
- Limitación de ventana: Whisper procesa audio en ventanas de 30 segundos; audios más largos requieren segmentación y pueden perder coherencia en los bordes.
- La cuantización Q8_0 puede introducir una degradación menor de la precisión respecto al modelo original en precisión completa; no se han publicado métricas que la cuantifiquen.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar los avisos de licencia y atribución al modelo original de OpenAI.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación comunitaria ni de pruebas de calidad publicadas por el autor.
- No hay información sobre el proceso exacto de conversión ni sobre la herramienta utilizada, lo que dificulta la reproducibilidad.
- Para producción, conviene validar la calidad de transcripción frente al modelo original antes de adoptar esta conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sayzly/whisper-small.en-gguf
- Modelo base original: https://huggingface.co/openai/whisper-small.en
- Repositorio de OpenAI Whisper (código): https://github.com/openai/whisper
- whisper.cpp (runtime GGUF para Whisper): https://github.com/ggerganov/whisper.cpp
- llama.cpp (runtime GGUF): https://github.com/ggerganov/llama.cpp
- Paper de Whisper: https://arxiv.org/abs/2212.04356
