# Seksiyog/VibeVoice-ASR-Streaming-7B

## Resumen

VibeVoice-ASR-Streaming-7B es un modelo de reconocimiento automático de voz (ASR) en streaming desarrollado por Microsoft Research, que transcribe simultáneamente quién habla y qué dice, sin necesidad de una etapa separada de diarización. Se trata de un modelo basado en LLM que intercala fragmentos de audio de tamaño fijo, una pequeña cantidad de audio de lookahead y el texto anterior para producir transcripciones con atribución de hablante a medida que llega el audio.

El modelo soporta diez idiomas (chino, inglés, francés, alemán, italiano, japonés, coreano, portugués, ruso y español) y permite hotwords personalizados para mejorar el reconocimiento de términos específicos de dominio. La versión disponible en Hugging Face bajo el usuario Seksiyog es una re-subida del modelo original de Microsoft; los pesos en safetensors suman 8.674.021.857 parámetros y el repositorio ocupa 17,3 GB. Su relevancia radica en abordar la transcripción en streaming con atribución de hablante de forma end-to-end, una tarea tradicionalmente resuelta con pipelines de diarización más ASR, lo que puede reducir latencia y errores de asignación de hablante.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo basado en LLM end-to-end; arquitectura exacta no especificada |
| Parametros totales | 8.674.021.857 (≈8,67 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en safetensors sin cuantizar) |
| Idiomas soportados | en, zh, es, pt, de, ja, ko, fr, ru, it |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Según el technical report disponible en arXiv, VibeVoice-ASR-Streaming es uno de los primeros enfoques end-to-end basados en LLM para ASR de streaming con atribución de hablante. El modelo intercala chunks de audio de tamaño fijo, una pequeña cantidad de audio de lookahead y el texto anterior, lo que le permite generar “quién dijo qué” a medida que llega el audio, sin depender de una etapa de diarización separada.

No se han publicado en la información disponible detalles sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable es el diseño de streaming con atribución de hablante y el soporte de hotwords personalizados, que permiten adaptar el reconocimiento a nombres y términos técnicos del dominio del usuario.

## Capacidades

- Transcripción en streaming con atribución de hablante: genera “quién dijo qué” en tiempo real, sin necesidad de diarización posterior.
- Hotwords personalizados: el usuario puede proporcionar nombres y términos técnicos para mejorar el reconocimiento de contenido específico.
- Multilingüe: soporta diez idiomas: chino, inglés, francés, alemán, italiano, japonés, coreano, portugués, ruso y español.
- Pipeline de ASR: es un modelo de reconocimiento automático de voz; no se documentan capacidades de generación de texto libre, tool calling, agentes, visión ni modo de razonamiento explícito.

## Casos de uso

- Transcripción de reuniones con identificación de hablante: el modelo puede procesar el audio de una reunión en streaming y asignar cada intervención a su hablante, lo que facilita la generación automática de actas y el seguimiento de acuerdos.
- Subtitulado en vivo para eventos: al generar texto a medida que llega el audio, puede utilizarse para subtítulos en tiempo real en conferencias, webinars o retransmisiones, identificando quién está hablando en cada momento.
- Atención al cliente con análisis de llamadas: en centros de contacto, permite transcribir conversaciones identificando al agente y al cliente, con hotwords personalizados para nombres de productos o términos de soporte.
- Documentación de entrevistas: en investigación o periodismo, transcribe entrevistas con múltiples hablantes sin necesidad de post-procesamiento de diarización, reduciendo el tiempo de edición.
- Accesibilidad para personas con discapacidad auditiva: la transcripción en tiempo real con atribución de hablante resulta útil en entornos educativos o laborales para seguir quién habla en una conversación.
- Análisis de contenido de vídeo: para generar subtítulos y metadatos de quién habla en vídeos con varios participantes, aplicable en plataformas de streaming, análisis de contenido o revisión de grabaciones forenses.
- Integración en asistentes de voz multi-usuario: en entornos domésticos o de oficina, el modelo puede distinguir entre hablantes para enrutar comandos o registrar interacciones de forma más precisa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original incluye una figura con resultados, pero no se proporcionan valores numéricos accesibles en los datos revisados.

## Requisitos de hardware

- VRAM estimada para inferencia: con los pesos en safetensors a FP16, se necesitan aproximadamente 17,3 GB solo para los pesos; añadiendo overhead de activaciones y caché, se recomienda un mínimo de 20 GB de VRAM. En FP32, el requisito sube a unos 34,7 GB.
- GPU recomendadas: NVIDIA A100 (40 GB u 80 GB), H100 o RTX 4090 (24 GB) para FP16, esta última con margen ajustado.
- Consumer GPU: la RTX 4090 puede ejecutar el modelo en FP16, pero no se dispone de cuantizaciones en el repositorio, por lo que GPUs de 8-12 GB no son viables.
- Opciones de despliegue: el modelo es compatible con la librería transformers y está marcado como `endpoints_compatible`, por lo que puede desplegarse en Hugging Face Inference Endpoints. Se recomienda consultar el repositorio de GitHub para instrucciones de despliegue adicionales.
- Latency y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información suficiente sobre modelos comparables con el mismo enfoque de streaming y atribución de hablante. Alternativas tradicionales combinan diarización con ASR (por ejemplo, Whisper más un modelo de diarización como pyannote), pero no son directamente comparables sin datos de benchmark.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado información sobre sesgos en el modelo.
- Riesgo de alucinación: no se documentan tasas de alucinación; en sistemas ASR, es posible la generación de texto en silencios o con ruido, pero no hay datos específicos.
- Limitaciones de contexto: no se especifica la longitud de contexto ni la ventana máxima de audio procesada, lo que impide evaluar su comportamiento en entradas muy largas.
- Licencia: la licencia MIT permite uso comercial, pero el modelo original es de Microsoft Research; conviene verificar la atribución y las condiciones de uso en el repositorio oficial.
- Caveat importante: el repositorio en Hugging Face pertenece al usuario Seksiyog, no a Microsoft, y no hay garantía de que sea una copia oficial o verificada. Para entornos de producción, se recomienda utilizar el repositorio oficial `microsoft/VibeVoice-ASR-Streaming-7B`.
- No se proporcionan cuantizaciones, lo que limita el despliegue en hardware de gama baja.

## Enlaces

- Repositorio en Hugging Face (Seksiyog): https://huggingface.co/Seksiyog/VibeVoice-ASR-Streaming-7B
- Repositorio original en Hugging Face (Microsoft): https://huggingface.co/microsoft/VibeVoice-ASR-Streaming-7B
- Código en GitHub: https://github.com/microsoft/VibeVoice
- Demo en vivo: https://aka.ms/vibeasr
- Technical report en arXiv: https://arxiv.org/html/2609.02812v1
