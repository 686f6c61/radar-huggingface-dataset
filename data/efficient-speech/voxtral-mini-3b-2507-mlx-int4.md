# efficient-speech/Voxtral-Mini-3B-2507-MLX-INT4

## Resumen

Voxtral-Mini-3B-2507-MLX-INT4 es una versión cuantizada a 4 bits del modelo Voxtral-Mini-3B-2507 de Mistral AI, convertida al formato MLX por el equipo Efficient Speech (Universidad de Washington, proyecto Murmur). El modelo original es un sistema multimodal de reconocimiento y comprensión de voz que combina un encoder de audio con un modelo de lenguaje basado en la familia Mistral, capaz de transcribir discurso y responder preguntas sobre el contenido del audio.

Esta variante aplica cuantización afín de 4 bits por grupos de 64 a los pesos del modelo de lenguaje, manteniendo el encoder de audio en BF16. El resultado es un repositorio de 3,8 GB que puede ejecutarse en hardware Apple Silicon mediante la librería MLX, lo que reduce significativamente los requisitos de memoria frente al modelo original en BF16.

El modelo está pensado para despliegue en local sobre Macs con chip Apple, especialmente en escenarios de transcripción de audio de larga duración mediante el runtime `mlx-voxtral` o el sistema Murmur. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales. No se han publicado datos de benchmarks ni de idiomas soportados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multimodal audio-LLM (encoder de audio + transformer decoder tipo Mistral) |
| Parámetros totales | 5.078.924.288 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT4 (afín, grupos de 64) en el LLM; BF16 en el encoder de audio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Voxtral-Mini-3B-2507 sigue la arquitectura multimodal de Mistral para audio: un encoder de audio que procesa la señal acústica y la proyecta al espacio de embeddings de un transformer decoder de la familia Mistral. Esta variante MLX-INT4 conserva el encoder en BF16 y cuantiza únicamente los pesos del modelo de lenguaje con cuantización afín de 4 bits en grupos de 64, técnica estándar en el ecosistema MLX que reduce el uso de memoria a costa de una ligera pérdida de precisión.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo original empleó RLHF o DPO. Tampoco se detallan innovaciones técnicas más allá de la propia cuantización y del runtime `mlx-voxtral==0.0.6` con el que se validó la conversión. El modelo está asociado al sistema Murmur (Universidad de Washington) para reconocimiento de voz de formato largo.

## Capacidades

- Transcripción de voz a texto (speech-to-text) en formato largo.
- Respuesta a preguntas sobre contenido de audio (audio question answering).
- Procesamiento multimodal audio + texto en una sola pasada.
- Ejecución en hardware Apple Silicon mediante MLX.
- Integración con el runtime `mlx-voxtral` y con el sistema Murmur para ASR de larga duración.
- No se ha confirmado soporte de tool calling, function calling, agentes multi-paso ni thinking mode en la información disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Transcripción de reuniones y entrevistas en local: el modelo procesa audio largo y genera transcripciones sin enviar datos a la nube, gracias a su ejecución en MLX sobre Macs con chip Apple.
- Subtitulado de contenido audiovisual: se puede integrar en un pipeline que alimente ficheros de audio y genere subtítulos en texto plano para vídeos o pódcast.
- Asistente de notas por voz: dado un audio de una clase o conferencia, el modelo responde preguntas sobre lo dicho (audio QA) para generar resúmenes o extraer puntos clave.
- Investigación en ASR de formato largo: el modelo sirve como base para experimentos con el sistema Murmur, que está diseñado específicamente para reconocimiento de voz de larga duración.
- Prototipado en estaciones de trabajo Apple: desarrolladores que trabajan en Mac pueden desplegar un ASR multimodal sin GPU dedicada, aprovechando la cuantización INT4 para ajustar el consumo de memoria.
- Procesamiento por lotes de archivos de audio: scripts que invocan `mlx-voxtral.generate` sobre directorios de grabaciones para transcribir de forma desatendida en local.
- Evaluación comparativa de cuantización: útil para medir el impacto de INT4 frente a BF16 en tareas de transcripción y QA de audio sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo ocupa 3,8 GB en disco; en ejecución se necesita memoria unificada suficiente para pesos INT4 del LLM más el encoder en BF16 y el estado de activaciones (estimación práctica en torno a 5-7 GB, no confirmada oficialmente).
- Hardware objetivo: Apple Silicon (series M1, M2, M3, M4) con MLX; no está pensado para CUDA.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable, ya que el formato MLX no se ejecuta en CUDA sin conversión adicional.
- Cabe en equipos consumer Apple: sí, en Macs con al menos 8-16 GB de memoria unificada, en función de la longitud del audio y del contexto.
- Opciones de despliegue: runtime `mlx-voxtral` (versión 0.0.6 validada) y el sistema Murmur; no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Voxtral-Mini-3B-2507-MLX-INT4 (este) | 5.078.924.288 | no disponible | Apache 2.0 | safetensors MLX INT4 | Cuantizado 4-bit, orientado a Apple Silicon |
| mistralai/Voxtral-Mini-3B-2507 | no disponible en esta ficha | no disponible | Apache 2.0 | safetensors BF16 | Modelo base original, mayor precisión y mayor huella de memoria |
| Alternativas ASR open source (p. ej. Whisper large-v3) | no disponible en esta ficha | no disponible | licencia variable | safetensors, GGUF | Solo transcripción, sin QA de audio; comparación no verificada en esta ficha |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La cuantización INT4 puede degradar ligeramente la calidad de transcripción y de respuestas frente al modelo base en BF16; no se han publicado métricas que cuantifiquen esa pérdida.
- No se han documentado sesgos específicos del modelo ni del proceso de cuantización.
- Riesgo de alucinación inherente a los modelos de lenguaje: las respuestas a preguntas sobre audio pueden contener información no presente en la grabación.
- Idiomas soportados no confirmados; no se debe asumir cobertura multilingüe sin verificación previa.
- Longitud de contexto no disponible; el rendimiento en audios muy largos dependerá de la implementación del runtime y del sistema Murmur.
- Dependencia del ecosistema MLX: no es directamente portable a CUDA ni a otros backends sin reconversión de pesos.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base original de Mistral AI por si hubiera condiciones adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado, sin evidencia comunitaria de robustez en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/efficient-speech/Voxtral-Mini-3B-2507-MLX-INT4
- Modelo base: https://huggingface.co/mistralai/Voxtral-Mini-3B-2507
- Repositorio Murmur: https://github.com/uw-syfi/Murmur
