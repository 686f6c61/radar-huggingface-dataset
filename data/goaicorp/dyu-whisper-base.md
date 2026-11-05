# goaicorp/dyu-whisper-base

## Resumen

dyu-whisper-base es un modelo de reconocimiento automático del habla (ASR) desarrollado por goaicorp, obtenido mediante fine-tuning de openai/whisper-base sobre el conjunto de datos goaicorp/dyu-speech. Su propósito es transcribir audio en dyula (dyu), una lengua mandé hablada principalmente en Burkina Faso, Costa de Marfil y Malí, para la que existen muy pocos recursos ASR de calidad. El modelo se publica bajo licencia CC-BY-SA 4.0 y con acceso restringido (gated) en HuggingFace.

Arquitectura y tamaño: se trata de un transformer encoder-decoder de tipo Whisper en su variante "base", con 72.593.920 parámetros totales y pesos en formato safetensors. El repositorio ocupa 0,6 GB. Al derivar de whisper-base, hereda la ventana de contexto de audio de 30 segundos por segmento y el vocabulario multilingüe del modelo original, aunque el fine-tuning se ha orientado específicamente al dyula.

Relevancia: el modelo cubre una laguna importante en ASR de bajos recursos. La mayoría de sistemas comerciales no ofrecen dyula, y los modelos multilingües grandes suelen tener un rendimiento pobre en lenguas africanas de bajos recursos. Un modelo especializado de 72 M de parámetros es ligero, desplegable en CPU y adecuado para integrarse en pipelines de transcripción de campo, preservación lingüística o subtitulado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base) |
| Parametros totales | 72.593.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por segmento (heredado de Whisper base; no disponible el límite exacto de tokens de texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/INT8 en la información proporcionada) |
| Idiomas soportados | dyu (dyula) |
| Licencia | CC-BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de openai/whisper-base, un transformer encoder-decoder con atención multi-cabeza estándar. El encoder procesa espectrogramas log-Mel de 80 canales extraídos de audio de 16 kHz, y el decoder genera tokens de transcripción de forma autorregresiva. Whisper base emplea 6 capas en encoder y 6 en decoder, con dimensión oculta de 512 y 8 cabezas de atención (arquitectura estándar de la familia Whisper base).

El entrenamiento específico se realizó sobre el dataset goaicorp/dyu-speech, según los metadatos del modelo. No se dispone de información sobre el número de horas de audio, la composición exacta del corpus, la proporción de hablantes, la duración media de los segmentos ni si se aplicaron técnicas de aumento de datos o regularización. Tampoco se documenta si hubo etapas de RLHF, DPO o ajuste con pseudo-etiquetas. No se han publicado detalles técnicos adicionales en la información disponible.

## Capacidades

- Reconocimiento automático del habla en dyula (dyula), con salida de texto transcrito.
- Transcripción de audio de hasta 30 segundos por segmento, con la posibilidad de encadenar segmentos para audios más largos mediante chunking.
- Hereda del modelo base la capacidad de procesar audio con ruido moderado y variaciones de hablante, aunque el fine-tuning puede haber reducido la robustez fuera del dominio de entrenamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es un modelo ASR, no un LLM generativo de propósito general).
- Capacidades multilingües: limitadas al dyula; no se documenta transferencia a otras lenguas mandé.
- Capacidades especiales: no se documentan modos de "thinking", visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de entrevistas y encuestas de campo en Burkina Faso, Costa de Marfil y Malí: el modelo permite convertir grabaciones de audio en texto dyula para análisis cualitativo, con un tamaño de 72 M de parámetros que facilita su ejecución en portátiles sin GPU.
- Preservación y documentación lingüística: investigadores pueden transcribir corpus orales de dyula de forma automatizada y revisar manualmente las salidas, reduciendo el coste de transcripción manual en lenguas con pocos recursos.
- Subtitulado automático de contenido audiovisual en dyula: integrado en un pipeline de segmentación de audio (por ejemplo, con VAD) y el modelo ASR, se pueden generar subtítulos para vídeos educativos o divulgativos.
- Atención al cliente en zonas dyulófonas: transcripción de llamadas o mensajes de voz para su posterior procesamiento con un LLM o sistema de tickets, siempre que se acepte la licencia CC-BY-SA 4.0 y las condiciones de acceso.
- Aplicaciones de accesibilidad: conversión de voz a texto en tiempo casi real para personas con discapacidad auditiva en comunidades dyulófonas, desplegando el modelo en dispositivos de borde o en servidores ligeros.
- Investigación en ASR de bajos recursos: servir como baseline o punto de partida para fine-tuning adicional con otros corpus mandé, o para experimentos de destilación y cuantización en lenguas africanas.
- Integración en asistentes de voz locales: al ser un modelo pequeño, puede combinarse con un TTS o un LLM ligero para construir asistentes de voz en dyula que funcionen sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 72,6 M de parámetros; en FP32 ocupa aproximadamente 290 MB, en FP16 unos 145 MB y en INT8 unos 73 MB. La VRAM adicional para activaciones y buffers de audio es reducida (del orden de cientos de MB en función del batch).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como NVIDIA T4, RTX 3060, RTX 4090, A100 o H100 pueden ejecutarlo con holgura. También es viable en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 o superior, RTX 20/30/40, Apple Silicon con Metal).
- Opciones de despliegue: transformers (pipeline de automatic-speech-recognition), así como exportación a ONNX o a formatos compatibles con llama.cpp/whisper.cpp si se generan los pesos convertidos (no se documentan conversiones oficiales en la información proporcionada). vLLM y TGI no están orientados a ASR Whisper de forma nativa.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo base de 72 M, se espera una latencia baja en GPU (del orden de décimas de segundo por segmento de 30 s) y throughput alto con batching, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| goaicorp/dyu-whisper-base | 72,6 M | 30 s por segmento | dyu | CC-BY-SA 4.0 | Gated |
| openai/whisper-base | 74 M | 30 s por segmento | Multilingüe (99 idiomas) | MIT | Abierto |
| openai/whisper-small | 244 M | 30 s por segmento | Multilingüe (99 idiomas) | MIT | Abierto |
| Modelos ASR multilingües grandes (p. ej. whisper-large-v3) | 1,55 B | 30 s por segmento | Multilingüe | MIT | Abierto |

La comparativa se limita a la familia Whisper porque no se dispone de información sobre otros modelos ASR específicos para dyula en la documentación proporcionada. Frente a whisper-base original, dyu-whisper-base está especializado en dyula, lo que previsiblemente mejora la precisión en esa lengua a costa de perder cobertura multilingüe. Frente a whisper-small o whisper-large-v3, ofrece un tamaño mucho menor y un despliegue más ligero, pero no se han publicado métricas comparativas de WER en dyula.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en HuggingFace y requiere aceptar condiciones antes de descargarlo; esto puede limitar su uso en pipelines automatizados o en entornos sin autenticación.
- Licencia CC-BY-SA 4.0: permite uso comercial, pero obliga a compartir las obras derivadas bajo la misma licencia y a atribuir correctamente. Es incompatible con licencias más permisivas (MIT, Apache 2.0) en productos derivados que no quieran adoptar CC-BY-SA.
- Cobertura lingüística limitada al dyula: no se documenta rendimiento en otras lenguas mandé ni en variantes dialectales; el uso fuera de dominio puede degradar gravemente la calidad.
- Riesgo de alucinación en ASR: como todo modelo Whisper, puede generar texto plausible que no corresponde al audio, especialmente en segmentos con silencio, ruido o habla solapada.
- Sesgos potenciales: el corpus goaicorp/dyu-speech puede sobrerrepresentar ciertos acentos, géneros o registros; no se documenta la composición demográfica del dataset.
- Sin benchmarks publicados: no hay métricas de WER/CER en la información disponible, por lo que la calidad real en producción no puede evaluarse a priori.
- Contexto de audio limitado: 30 segundos por segmento; audios más largos requieren segmentación manual o mediante VAD, con riesgo de cortes en fronteras de palabras.
- Fecha de creación futura (2026-04-05) en los metadatos: conviene verificar la vigencia y el mantenimiento del repositorio antes de adoptarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/goaicorp/dyu-whisper-base
- Modelo base: https://huggingface.co/openai/whisper-base
- Dataset de entrenamiento: https://huggingface.co/datasets/goaicorp/dyu-speech
- Paper de Whisper (Radford et al., 2022): no disponible en la información proporcionada
- Repositorio oficial de Whisper (OpenAI): no disponible en la información proporcionada
- Demo o blog del autor: no disponible en la información proporcionada
