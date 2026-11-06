# fncsftya/granite-speech-5.0-2b-mlx-4bit

## Resumen

Granite Speech 5.0 2B es un modelo de reconocimiento automático del habla (ASR) y traducción de voz desarrollado originalmente por IBM Research dentro de la familia Granite. Combina un encoder Conformer con un proyector QFormer y un decoder basado en el LLM Granite, lo que permite transcribir audio y traducirlo directamente a otro idioma en una sola pasada. La versión aquí descrita es una conversión comunitaria a 4 bits en formato MLX, publicada por el usuario `fncsftya`, pensada para ejecutarse en Apple Silicon mediante la librería MLX Audio.

El modelo resuelve dos tareas principales: transcripción multilingüe (inglés, francés, alemán, español, portugués y japonés) y traducción de voz a texto entre idiomas. Al estar cuantizado únicamente el decoder LLM a 4 bits (afín, tamaño de grupo 64) mientras el encoder y el proyector se mantienen en bfloat16, se consigue un equilibrio entre reducción de memoria y fidelidad acústica. El repositorio ocupa 2,4 GB y contiene 2.313.207.132 parámetros totales.

Es relevante ahora porque permite desplegar un sistema ASR multilingüe con capacidad de traducción en portátiles Apple Silicon sin GPU dedicada, algo que hasta hace poco requería infraestructura en la nube. La licencia Apache 2.0 facilita su integración en productos comerciales, aunque la cuantización a 4 bits introduce degradaciones documentadas por el propio autor en audio no inglés y en segmentos superiores a un minuto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder Conformer + proyector QFormer + decoder LLM Granite (transformer) |
| Parámetros totales | 2.313.207.132 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit afín, tamaño de grupo 64 (solo decoder LLM); encoder y proyector en bfloat16 |
| Idiomas soportados | multilingüe; inglés, francés, alemán, español, portugués y japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de Granite Speech: un encoder Conformer que procesa el audio (remuestreado a mono 16 kHz) y extrae representaciones acústicas, un proyector QFormer que adapta esas representaciones al espacio del LLM, y un decoder basado en el modelo de lenguaje Granite que genera el texto de salida. Esta separación permite que solo el decoder se cuantice sin degradar la extracción de características acústicas, que permanece en bfloat16.

La conversión a MLX se realizó con la herramienta `mlx_audio.convert -q --q-bits 4`. El autor no documenta en la model card el volumen de datos de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esa información correspondería al modelo base `ibm-granite/granite-speech-5.0-2b` y no está disponible en la información proporcionada. Una innovación destacable es el soporte de decodificación especulativa con borrador CTC y verificación greedy (`speculative=True`, `num_draft_tokens=16`), que acelera la generación reutilizando el fichero `out_llm.safetensors`.

## Capacidades

- Reconocimiento automático del habla multilingüe en inglés, francés, alemán, español, portugués y japonés.
- Traducción de voz a texto entre idiomas (por ejemplo, audio en japonés transcrito a francés mediante el parámetro `language`).
- Puntuación automática de la transcripción con `punctuate=True`.
- Sesgo por palabras clave (keyword biasing) mediante `hotwords`, útil para nombres propios, marcas o terminología técnica.
- Indicación de idioma de origen con `source_language` para mejorar la precisión en audio multilingüe.
- Decodificación especulativa con borrador CTC para reducir latencia.
- Procesamiento de audio remuestreado a mono 16 kHz; acepta rutas de fichero o arrays ya preparados.
- No se documentan capacidades de tool calling, agentes, visión ni audio de salida en la información disponible.

## Casos de uso

- Transcripción de reuniones y notas de voz en portátiles Apple Silicon: el modelo cabe en 2,4 GB y puede ejecutarse localmente con MLX Audio, evitando enviar audio confidencial a servicios en la nube.
- Subtitulado multilingüe de contenido audiovisual: la combinación de ASR y traducción permite generar subtítulos en francés, alemán o español a partir de audio en inglés en una sola llamada.
- Atención al cliente con análisis de llamadas: transcribir conversaciones telefónicas (segmentadas en bloques de hasta dos minutos) para extraer métricas y resúmenes, con `hotwords` para nombres de productos.
- Investigación lingüística y corpus orales: transcripción de entrevistas o grabaciones de campo en seis idiomas con puntuación automática para facilitar el análisis posterior.
- Accesibilidad: generación de transcripciones en tiempo casi real para personas con discapacidad auditiva en aplicaciones de escritorio macOS.
- Prototipado rápido de pipelines ASR: al ser una conversión MLX ligera, sirve para validar flujos de voz antes de escalar a versiones en 8 bits o bfloat16 en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio pesa 2,4 GB; en ejecución el consumo será algo superior por buffers de audio y estados intermedios, pero cabe holgadamente en equipos con 8 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (series M1, M2, M3 y M4), ya que MLX está optimizado para memoria unificada de Apple; no está pensado para GPU NVIDIA.
- Cabe en GPU de consumo: sí, en cualquier Mac con chip Apple Silicon; no aplica a GPUs NVIDIA consumer por el formato MLX.
- Opciones de despliegue: MLX Audio 0.5.9 o superior (requiere `pip install -U mlx-audio jinja2`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; la decodificación especulativa con 16 tokens de borrador está pensada para reducirla.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| granite-speech-5.0-2b-mlx-4bit (este) | 2,31 B | no disponible | 6 idiomas | Apache 2.0 | safetensors MLX 4-bit |
| ibm-granite/granite-speech-5.0-2b (base) | 2,31 B | no disponible | 6 idiomas | Apache 2.0 | safetensors bfloat16 |
| Whisper large-v3 | no disponible en la información | no disponible | multilingüe | MIT (según conocimiento general, no verificado aquí) | safetensors, GGUF |
| Alternativas ASR comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con Whisper u otros sistemas ASR no puede realizarse porque no se han proporcionado benchmarks en la información disponible. La diferencia principal frente al modelo base es el tamaño (2,4 GB frente a los pesos bfloat16) y el soporte nativo de MLX.

## Limitaciones y advertencias

- La cuantización a 4 bits puede desviarse del modelo bfloat16, especialmente en audio no inglés y en grabaciones de más de un minuto; IBM recomienda segmentos de dos minutos o menos.
- Si la precisión prima sobre el tamaño, el propio autor recomienda usar conversiones en 8 bits o bfloat16.
- Solo el decoder está cuantizado; el encoder y el proyector permanecen en bfloat16, por lo que el ahorro de memoria es parcial.
- El audio debe remuestrearse a mono 16 kHz; los arrays en bruto deben cumplir ya esa condición.
- No se documentan sesgos específicos ni tasas de alucinación en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero al ser una conversión comunitaria conviene validar la procedencia y los pesos originales de IBM antes de desplegar en producción.
- El repositorio tiene muy pocas descargas (16) y ningún "like", lo que sugiere poca validación comunitaria; no hay garantías de mantenimiento.
- No hay soporte documentado para GPU NVIDIA ni para frameworks de serving tradicionales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/fncsftya/granite-speech-5.0-2b-mlx-4bit)
- [Modelo base ibm-granite/granite-speech-5.0-2b](https://huggingface.co/ibm-granite/granite-speech-5.0-2b)
- [MLX Audio (GitHub)](https://github.com/Blaizzy/mlx-audio)
