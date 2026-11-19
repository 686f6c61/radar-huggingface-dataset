# sayzly/whisper-base.en-gguf

## Resumen

`sayzly/whisper-base.en-gguf` es una conversión al formato GGUF del modelo de reconocimiento automático del habla `openai/whisper-base.en`, publicada por el usuario sayzly. No se trata de un modelo nuevo ni de un reentrenamiento: es un artefacto de empaquetado que redistribuye los pesos originales de OpenAI en cuantización Q8_0 (8 bits) para su uso con runtimes compatibles con GGUF, presumiblemente `whisper.cpp` u otras implementaciones ligeras.

El modelo subyacente, Whisper Base English, es un transformer encoder-decoder de aproximadamente 72,6 millones de parámetros entrenado por OpenAI para transcripción de voz en inglés. Su relevancia radica en que ocupa un espacio mínimo (el repositorio completo pesa 0,1 GB) y puede ejecutarse en hardware muy modesto, incluidos dispositivos de borde o CPU, lo que lo hace útil para transcripción local sin dependencia de servicios en la nube.

La ficha se limita a lo que puede verificarse a partir de los metadatos del repositorio y de la model card, que es extremadamente escueta. No hay información publicada por el autor sobre datos de entrenamiento, benchmarks ni detalles de la conversión a GGUF más allá de la mención al fichero `whisper-base.en-Q8_0.gguf`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 72.609.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s en Whisper original) |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado) |
| Idiomas soportados | ingles (sufijo `.en` del modelo base) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del Whisper original de OpenAI: un transformer encoder-decoder con atención multi-cabeza estándar, diseñado para recibir espectrogramas Mel de audio y generar tokens de texto. El modelo `base.en` es la variante "base" especializada en inglés, con 72,6 millones de parámetros. La conversión a GGUF no altera la arquitectura, solo el formato y la precisión numérica de los pesos (Q8_0, 8 bits por peso).

No se dispone de información en la model card sobre el proceso de conversión, las herramientas empleadas, la verificación de equivalencia numérica respecto al modelo original ni los datos de entrenamiento del modelo base. Según la documentación pública de OpenAI sobre Whisper (no incluida en la información proporcionada), el modelo se entrenó con audio y transcripciones multilingües supervisadas y con técnicas de destilación y pseudo-etiquetado, pero estos detalles no se confirman en la información disponible para esta ficha.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés, con salida de texto a partir de audio.
- Transcripción de audio de hasta 30 segundos por ventana en la formulación original de Whisper (no confirmado en esta conversión concreta).
- Capacidad de segmentación y puntuación básica del texto transcrito, heredada del modelo base.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Capacidades multilingües limitadas al inglés por el sufijo `.en`.
- No dispone de modo "thinking", visión ni audio de salida.

## Casos de uso

- Transcripción local en CPU: al ser un GGUF Q8_0 de 72,6 M de parámetros, puede ejecutarse con `whisper.cpp` en portátiles sin GPU, útil para dictado o notas de voz personales.
- Subtitulado de vídeos en inglés: integrable en pipelines de postproducción para generar subtítulos automáticos en inglés con un coste computacional mínimo.
- Procesamiento en dispositivos de borde: su reducido tamaño permite desplegarlo en Raspberry Pi o dispositivos embebidos para transcripción offline sin enviar audio a la nube.
- Prototipado rápido de aplicaciones ASR: sirve como línea base para validar pipelines de audio antes de escalar a modelos Whisper mayores (`small`, `medium`, `large`).
- Transcripción de reuniones en inglés: adecuado para audios cortos o segmentados, con la limitación de la ventana de 30 s del modelo base.
- Filtrado y búsqueda de contenido hablado: conversión de archivos de audio en inglés a texto indexable en sistemas de búsqueda internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de WER (word error rate) ni comparaciones con el modelo original en safetensors.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en Q8_0; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; también funciona en CPU.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) y en iGPU.
- Opciones de despliegue: `whisper.cpp` (runtime principal para GGUF de Whisper), potencialmente otras implementaciones compatibles con GGUF. No se confirma compatibilidad con vLLM, TGI ni Ollama, que no soportan GGUF de Whisper de forma estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| sayzly/whisper-base.en-gguf | 72,6 M | no disponible (30 s en original) | ingles | apache-2.0 | GGUF Q8_0 |
| openai/whisper-base.en | 72,6 M | 30 s | ingles | apache-2.0 | safetensors |
| openai/whisper-small.en | no disponible en la informacion | 30 s | ingles | apache-2.0 | safetensors |
| openai/whisper-large-v3 | no disponible en la informacion | 30 s | multilingue | apache-2.0 | safetensors |

La comparativa se limita a lo verificable; no se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: el sufijo `.en` del modelo base excluye otros idiomas.
- Ventana de audio de 30 segundos en la formulación original de Whisper; audios más largos requieren segmentación externa.
- Riesgo de alucinación en pasajes con ruido, silencios o audio de baja calidad, comportamiento documentado en la familia Whisper.
- Sesgos heredados del corpus de entrenamiento de OpenAI, no auditados en esta conversión.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni verificación independiente de la calidad de la cuantización.
- La model card es mínima y no documenta el proceso de conversión ni pruebas de equivalencia con el modelo original.
- Licencia apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base y de las herramientas de conversión empleadas.
- No apto para producción crítica sin evaluación previa del WER en el dominio concreto de uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sayzly/whisper-base.en-gguf
- Modelo base: https://huggingface.co/openai/whisper-base.en
- Repositorio oficial de Whisper (OpenAI): no disponible en la información proporcionada
- `whisper.cpp` (runtime GGUF para Whisper): no disponible en la información proporcionada
- Paper de Whisper: no disponible en la información proporcionada
