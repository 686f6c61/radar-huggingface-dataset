# acul3/zapformer-id-en-streaming

## Resumen

Zapformer-id-en-streaming es un modelo de reconocimiento automático del habla (ASR) en modo streaming desarrollado por el usuario acul3 y publicado en Hugging Face. Se trata de un modelo de tipo transducer entrenado con la librería icefall, el framework de entrenamiento de k2-fsa orientado a modelos de reconocimiento de voz con decodificación en grafo, y exportado a formatos sherpa-onnx, ONNX y TFLite para su despliegue en dispositivos. El modelo cubre dos idiomas: indonesio (id) e inglés (en).

La relevancia del modelo radica en su enfoque on-device y en streaming: está pensado para transcripción incremental de audio con baja latencia, sin depender de un servidor, lo que lo hace adecuado para aplicaciones de dictado, subtitulado en vivo o asistentes embebidos. La integración con sherpa-onnx y LiteRT (antes TensorFlow Lite) apunta a despliegues en móvil, edge y navegador.

La información pública disponible es muy limitada: el repositorio tiene 0 descargas y 0 likes, el acceso está restringido (gated) y no se han publicado detalles sobre arquitectura interna, número de parámetros, contexto de audio, licencia ni resultados de benchmarks en la información proporcionada. El tamaño del repositorio es de 3,6 GB, lo que sugiere que contiene múltiples artefactos exportados además de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer (RNN-T / TDT) entrenado con icefall; variante "zapformer" (detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible (modelo de audio en streaming, sin ventana de texto declarada) |
| Tipos de cuantizacion | no disponible (el repo incluye artefactos ONNX y TFLite, habitualmente con variantes int8/float, pero no se detalla) |
| Idiomas soportados | indonesio (id), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | sherpa-onnx, ONNX, TFLite (LiteRT) |

## Arquitectura y entrenamiento

El modelo es un transducer de reconocimiento de voz, la familia de arquitecturas que combina un encoder acústico, un predictor (decoder) y una red de unión para modelar la probabilidad conjunta de secuencias de audio y texto sin necesidad de alineamientos explícitos. Está entrenado con icefall, la librería de k2-fsa que implementa entrenamiento con funciones de pérdida basadas en grafos (LF-MMI, pruned transducer loss) y decodificación con k2. El nombre "zapformer" sugiere una variante de encoder tipo transformer, aunque no se han publicado detalles sobre el número de capas, dimensión o mecanismo de atención en la información disponible.

No se dispone de datos sobre el volumen de horas de audio de entrenamiento, la composición del dataset (proporción indonesio/inglés, dominio, calidad), ni sobre si se aplicaron técnicas de aumento de datos, destilación o ajuste fino con RLHF/DPO (poco habituales en ASR). La orientación a streaming implica que el encoder está diseñado para procesar audio por bloques con estado recurrente o atención limitada al pasado, pero la información pública no confirma los detalles. Los tags indican exportación a sherpa-onnx, ONNX y TFLite/LiteRT, lo que confirma que el modelo está pensado para inferencia en runtime ligero y no solo para PyTorch.

## Capacidades

- Reconocimiento automático del habla en modo streaming, con transcripción incremental a medida que llega el audio.
- Soporte bilingüe indonesio-inglés, presumiblemente con cambio de idioma dentro de la misma sesión (no confirmado en la información disponible).
- Despliegue on-device mediante sherpa-onnx, ONNX Runtime y LiteRT/TFLite.
- Inferencia de baja latencia adecuada para aplicaciones en tiempo real (subtitulado, dictado, comandos de voz).
- No consta soporte de tool calling, function calling, agentes, visión, audio generativo ni modo "thinking"; es un modelo puramente ASR.
- No consta capacidad de traducción, diarización de hablantes ni puntuación automática.

## Casos de uso

- Subtitulado en vivo en aplicaciones móviles: el modelo puede transcribir audio del micrófono por bloques y emitir texto incremental, gracias a su diseño streaming y a los artefactos TFLite/ONNX que permiten ejecución local sin conexión.
- Dictado por voz en editores de texto: integración mediante sherpa-onnx en apps de escritorio o móvil para convertir voz en texto en indonesio o inglés, con latencia baja y sin enviar audio a un servidor.
- Asistentes de voz embebidos: reconocimiento de comandos y consultas cortas en dispositivos IoT o wearables, donde el tamaño del runtime TFLite y la ausencia de dependencia de red son críticos.
- Transcripción de reuniones en local: procesamiento de audio de reuniones en indonesio o inglés en un portátil, con privacidad de datos al no salir del dispositivo.
- Accesibilidad para personas con discapacidad auditiva: generación de subtítulos en tiempo real en entornos presenciales mediante una app que consuma el modelo vía sherpa-onnx.
- Atención al cliente en centros de llamadas: transcripción en streaming de conversaciones bilingües para agentes o para análisis posterior, aprovechando el soporte de ambos idiomas.
- Investigación en ASR de bajo recurso: punto de partida para fine-tuning o evaluación de modelos transducer en indonesio, un idioma con menos recursos que el inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el tamaño del repo (3,6 GB) incluye múltiples exportaciones, por lo que el peso efectivo de una sola variante (ONNX o TFLite) es presumiblemente muy inferior.
- GPU recomendadas: no disponible. Al ser un modelo on-device, el objetivo es CPU, GPU integrada o NPU móvil más que GPUs de datacenter.
- Cabe en GPU consumer: previsiblemente sí, dado el enfoque edge, pero no hay cifras confirmadas.
- Opciones de despliegue: sherpa-onnx (runtime nativo para Android, iOS, Linux, Windows, WebAssembly), ONNX Runtime, LiteRT/TFLite.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| acul3/zapformer-id-en-streaming | no disponible | no disponible | id, en | no disponible | sherpa-onnx, ONNX, TFLite |
| Whisper (OpenAI) | 39M–1,55B según variante | 30 s de audio por ventana | multilingüe (~99 idiomas) | MIT | PyTorch, ONNX, whisper.cpp, etc. |
| Zipformer (k2-fsa/icefall) | decenas de millones típicamente | streaming por bloques | según receta (p. ej. en, zh) | Apache 2.0 (recetas icefall) | sherpa-onnx, ONNX |
| Wav2Vec2 / XLS-R (Meta) | 95M–2B | audio completo (no streaming nativo) | multilingüe | MIT / CC-BY-NC según variante | PyTorch, ONNX |

La comparación es cualitativa: no se dispone de cifras de WER ni de parámetros del modelo de acul3. Whisper no es streaming nativo y requiere ventanas de 30 s, mientras que este modelo está diseñado explícitamente para streaming. Zipformer de icefall es la referencia técnica más cercana por framework y formato de despliegue.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede limitar su uso en pipelines automatizados.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de integrarlo en producción.
- Idiomas limitados a indonesio e inglés; no se ha verificado el rendimiento en otros idiomas ni en code-switching dentro de una misma frase.
- Sin benchmarks publicados: no hay evidencia objetiva de WER, latencia ni robustez frente a ruido, acentos o audio de dominio específico.
- Riesgo de alucinación y errores de transcripción inherente a los modelos ASR, especialmente en audio ruidoso o con vocabulario fuera de dominio.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni reportes de uso en producción.
- Tamaño del repo de 3,6 GB: la descarga incluye múltiples artefactos; conviene seleccionar solo la variante necesaria (ONNX o TFLite) para reducir el peso en el dispositivo.
- No consta soporte de puntuación, mayúsculas, diarización ni marcas de tiempo a nivel de palabra; habría que añadir post-procesado.
- Al ser un modelo de un autor individual, no hay garantía de mantenimiento ni de soporte a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/acul3/zapformer-id-en-streaming
- Paper referenciado en los tags: arXiv:2606.28884 (https://arxiv.org/abs/2606.28884)
- icefall (k2-fsa): https://github.com/k2-fsa/icefall
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- LiteRT (antes TensorFlow Lite): https://ai.google.dev/edge/litert
- ONNX Runtime: https://onnxruntime.ai
