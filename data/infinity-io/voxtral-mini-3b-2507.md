# Infinity-io/Voxtral-Mini-3B-2507

## Resumen

Voxtral Mini 3B (2507) es un modelo multimodal de audio y texto desarrollado por Mistral AI, distribuido en el repositorio de Hugging Face bajo el identificador Infinity-io/Voxtral-Mini-3B-2507. Se construye sobre el modelo de lenguaje Ministral 3B, al que se incorporan capacidades de comprensión de audio de última generación, manteniendo el rendimiento en texto. Resuelve el problema de tener que encadenar un sistema ASR (reconocimiento automático del habla) con un modelo de lenguaje separado: Voxtral procesa el audio de forma nativa y responde directamente en lenguaje natural.

El modelo está pensado para transcripción, traducción y comprensión de audio, con una ventana de contexto de 32 000 tokens que permite manejar audios de hasta 30 minutos para transcripción y 40 minutos para comprensión. Es multilingüe de forma nativa (inglés, francés, alemán, español, italiano, portugués, neerlandés e hindi) y soporta function calling a partir de la voz.

Con 4 676 271 104 parámetros totales según los pesos en safetensors y un tamaño de repositorio de 18,7 GB, se posiciona como la variante compacta de la familia Voxtral (junto a Voxtral Small 24B), lo que lo hace desplegable en una sola GPU de consumo. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone de lenguaje Ministral 3B + codificador de audio); detalles completos no disponibles |
| Parametros totales | 4 676 271 104 |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | 32 000 tokens |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; el autor no detalla cuantizaciones oficiales) |
| Idiomas soportados | en, fr, de, es, it, pt, nl, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Voxtral Mini se construye como una extensión de Ministral 3B: conserva el backbone de lenguaje y le añade un codificador de audio que permite la entrada directa de señales de voz. El modelo opera en dos modos: un modo de transcripción dedicado, que maximiza la precisión del ASR y predice automáticamente el idioma del audio, y un modo de comprensión de audio, orientado a preguntas y respuestas y a la generación de resúmenes estructurados. La ventana de contexto de 32 000 tokens es la que habilita el procesamiento de audios largos (hasta 30 minutos en transcripción y 40 minutos en comprensión).

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se especifican innovaciones de decodificación (como decodificación especulativa) ni detalles del mecanismo de atención. El paper asociado (arXiv:2507.13264) es la referencia para esos datos. El modelo admite múltiples audios por mensaje y múltiples turnos de usuario con audio, pero no soporta system prompts en la versión documentada.

## Capacidades

- Transcripción de voz a texto con detección automática del idioma de origen.
- Traducción de audio entre los ocho idiomas soportados.
- Comprensión de audio: preguntas y respuestas directamente sobre el contenido hablado.
- Resumen estructurado de audio sin necesidad de un ASR separado.
- Function calling a partir de la voz: activación de funciones de backend, flujos de trabajo o llamadas a API según la intención hablada.
- Procesamiento de audio de formato largo: hasta 30 minutos para transcripción y 40 minutos para comprensión dentro de los 32k tokens de contexto.
- Múltiples audios por mensaje y conversaciones multi-turno con audio.
- Capacidades de texto heredadas de Ministral 3B (comprensión y generación de lenguaje).
- Multilingüe nativo en en, fr, de, es, it, pt, nl, hi.

## Casos de uso

- Transcripción de reuniones y actas: el modelo puede procesar grabaciones de hasta 30 minutos en una sola pasada gracias a su contexto de 32k tokens, detectando el idioma automáticamente y generando la transcripción sin pipeline ASR externo.
- Subtitulado y traducción de contenido audiovisual: permite transcribir y traducir audio entre los ocho idiomas soportados, útil para localización de vídeos, pódcasts o cursos.
- Asistentes de voz con acciones: el function calling desde voz permite construir interfaces donde una frase hablada dispara una llamada a API (por ejemplo, reservar una cita o consultar un pedido).
- Análisis de llamadas de atención al cliente: el modelo puede resumir y extraer información estructurada de conversaciones telefónicas largas, combinando transcripción y comprensión en un solo paso.
- Búsqueda y Q&A sobre archivos de audio: preguntas directas sobre el contenido de grabaciones (entrevistas, clases, notas de voz) sin necesidad de transcribir primero a texto.
- Accesibilidad: generación de transcripciones y resúmenes de audio para personas con discapacidad auditiva, con soporte multilingüe.
- Moderación y análisis de contenido hablado: detección de intenciones y resumen de audio en pipelines de revisión, apoyándose en la comprensión nativa del audio.

## Benchmarks y rendimiento

La model card publica gráficas (imágenes) con la tasa de error de palabra (WER) media sobre FLEURS, Mozilla Common Voice y Multilingual LibriSpeech para audio, y una gráfica de rendimiento en texto, pero no se proporcionan los valores numéricos en la información disponible. Por tanto:

No se han publicado resultados de benchmarks numéricos en la información disponible; solo se referencian gráficas en la model card.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9,5 GB de memoria de GPU en bf16 o fp16 para inferencia, según la model card.
- GPU recomendadas: una GPU con al menos 10-12 GB de VRAM; el modelo cabe en tarjetas de consumo como la RTX 4090 (24 GB) y, con margen ajustado, en gamas de 12-16 GB.
- Cabe en GPU de consumo: sí, en bf16/fp16 dentro de una RTX 4090 y en GPUs de 12-16 GB; no se documentan requisitos para cuantizaciones menores.
- Opciones de despliegue: vLLM (recomendado, versión >= 0.10.0 con `vllm[audio]` y `mistral_common >= 1.8.1`) y Transformers. El autor indica `inference: false` en los metadatos y no documenta llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Voxtral Mini 3B 2507 | 4 676 271 104 | 32k | Si (nativo) | Apache 2.0 | Hugging Face (repo Infinity-io) |
| Voxtral Small 24B 2507 | no disponible en la informacion | no disponible | Si | no disponible | Referenciado en la model card como variante mayor |
| Ministral 3B | no disponible en la informacion | no disponible | No | no disponible | Hugging Face (backbone del modelo) |

La model card menciona Voxtral Small 24B como la variante de mayor tamaño recomendada para despliegue en servidor/cliente, y Ministral 3B como el backbone de lenguaje. No se dispone de datos numéricos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se documentan sesgos conocidos en la información disponible; como todo modelo entrenado con datos web y de audio, es probable que herede sesgos de esos corpus.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de comprensión y resumen de audio.
- Los system prompts no están soportados en la versión documentada, lo que limita el control fino del comportamiento en producción.
- El contexto está limitado a 32k tokens: audios por encima de 30 minutos (transcripción) o 40 minutos (comprensión) requieren segmentación.
- El soporte multilingüe se limita a los ocho idiomas declarados; otros idiomas no están garantizados.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los términos de Mistral AI enlazados en la model card (política de privacidad y condiciones) por si aplican restricciones adicionales al despliegue.
- El repositorio pertenece a Infinity-io y no al espacio oficial de Mistral AI; conviene verificar la integridad de los pesos antes de usarlos en producción.
- `inference: false` en los metadatos: el modelo no se ejecuta directamente en la infraestructura de Hugging Face, requiere despliegue propio.

## Enlaces

- Hugging Face: https://huggingface.co/Infinity-io/Voxtral-Mini-3B-2507
- Blog de Mistral AI sobre Voxtral: https://mistral.ai/news/voxtral
- Paper: https://arxiv.org/abs/2507.13264
- Blog de Ministral: https://mistral.ai/news/ministraux
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Repositorio Transformers: https://github.com/huggingface/transformers
- mistral-common (release 1.8.1): https://github.com/mistralai/mistral-common/releases/tag/v1.8.1
- Politica de privacidad de Mistral AI: https://mistral.ai/terms/
