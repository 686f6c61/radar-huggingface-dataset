# mistralai/Voxtral-Mini-3B-2507

## Resumen

Voxtral-Mini-3B-2507 es un modelo multimodal de audio y texto desarrollado por Mistral AI. Se construye sobre el modelo de lenguaje Ministral 3B, al que se incorpora un encoder de audio para dotarlo de capacidades de comprensión de voz de última generación. Resuelve tareas de transcripción de voz, traducción, respuesta a preguntas y resumen a partir de audio, sin necesidad de encadenar un sistema ASR independiente con un modelo de lenguaje.

Su relevancia actual radica en que unifica transcripción y razonamiento sobre audio en un único modelo con licencia Apache 2.0, contexto de 32.000 tokens y soporte nativo de ocho idiomas. El repositorio de safetensors contiene 4.676.271.104 parámetros totales, lo que refleja el backbone Ministral 3B más los parámetros adicionales del encoder de audio y las proyecciones multimodales.

El modelo se distribuye con la librería mistral-common y está pensado para desplegarse preferentemente sobre vLLM a partir de la versión 0.10.0. Con contexto de 32k tokens, admite audios de hasta 30 minutos para transcripción y 40 minutos para comprensión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone de lenguaje Ministral 3B + encoder de audio) |
| Parametros totales | 4.676.271.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | bf16 y fp16 (soportados de forma nativa); otras cuantizaciones no disponibles |
| Idiomas soportados | en, fr, de, es, it, pt, nl, hi |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (load format mistral en vLLM) |

## Arquitectura y entrenamiento

Voxtral Mini es una extensión de Ministral 3B, el modelo de lenguaje de 3B parámetros de Mistral AI. Sobre ese backbone se añade un encoder de audio que convierte la señal de voz en representaciones que el modelo de lenguaje puede procesar, habilitando comprensión de audio y generación de texto en una sola pasada. La arquitectura es de tipo transformer multimodal; la model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

Entre las innovaciones destacadas está el modo de transcripción dedicado, que maximiza el rendimiento ASR y predice automáticamente el idioma del audio de origen. El modelo admite múltiples audios por mensaje y múltiples turnos de usuario con audio. La model card indica que los system prompts todavía no están soportados. Se recomienda temperature=0.2 y top_p=0.95 para chat y comprensión de audio, y temperature=0.0 para transcripción.

## Capacidades

- Transcripcion de voz en modo dedicado, con deteccion automatica del idioma de origen.
- Traduccion de audio entre los idiomas soportados.
- Comprension de audio: preguntas y respuestas directamente sobre la señal de voz.
- Resumen estructurado de audio sin necesidad de un modelo de lenguaje separado.
- Function calling a partir de voz: activacion de funciones de backend, flujos de trabajo o llamadas a API segun la intencion hablada.
- Procesamiento de audio de formato largo (hasta 30 minutos para transcripcion, 40 minutos para comprension) gracias a los 32k tokens de contexto.
- Soporte de multiples audios por mensaje y multiples turnos con audio.
- Capacidades de texto heredadas del backbone Ministral 3B.
- Multilingue nativo en ingles, frances, aleman, espanol, italiano, portugues, neerlandes e hindi.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo puede procesar audios de hasta 30 minutos en una sola ventana de 32k tokens y generar la transcripcion completa, detectando automaticamente el idioma de los participantes.
- Subtitulado y traduccion de contenido audiovisual: permite transcribir audio en un idioma y traducirlo a otro de los ocho soportados dentro del mismo modelo.
- Analisis de llamadas de atencion al cliente: con comprension de audio y multiples turnos, se puede alimentar la grabacion de una llamada y obtener resumenes estructurados, deteccion de intenciones y motivos de contacto.
- Asistentes de voz con function calling: a partir de la intencion hablada del usuario, el modelo puede activar llamadas a API o flujos de backend, integrandose en agentes conversacionales por voz.
- Accesibilidad y dictado: transcripcion en tiempo de ejecucion de notas de voz o dictado en aplicaciones, con soporte de varios idiomas sin cambiar de modelo.
- Analisis de contenido de podcasts o medios: resumen automatico y extraccion de temas a partir de episodios largos, aprovechando la ventana de audio extendida.
- Moderacion y auditoria de audio: analisis de grabaciones para clasificar o resumir su contenido con un unico modelo multimodal.

## Benchmarks y rendimiento

La model card presenta resultados de benchmark en formato de imagen, sin valores numericos en el texto disponible. Se detalla lo siguiente:

| Ambito | Benchmarks | Resultados numericos |
|---|---|---|
| Audio | WER medio sobre FLEURS, Mozilla Common Voice y Multilingual LibriSpeech | no disponible (solo figura en imagen) |
| Texto | Benchmarks de texto del backbone Ministral 3B | no disponible (solo figura en imagen) |

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,5 GB de memoria de GPU en bf16 o fp16 (dato indicado en la model card).
- GPU recomendadas: la model card no especifica modelos concretos; con 9,5 GB en bf16 cabe en tarjetas de gama alta para consumidor como RTX 4090 o RTX 3090, y en GPUs profesionales tipo A100 o H100.
- Cabe en GPU de consumidor: si, siempre que dispongan de al menos ~10 GB de VRAM libre en bf16/fp16.
- Opciones de despliegue: vLLM (recomendado, version >= 0.10.0, con extra [audio]) y Transformers. Requiere mistral_common >= 1.8.1.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Ambito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Voxtral-Mini-3B-2507 | 4.676.271.104 | 32k tokens | Audio + texto | apache-2.0 | HuggingFace, vLLM, Transformers |
| Voxtral-Small-24B-2507 | no disponible | no disponible | Audio + texto | no disponible en la informacion | mencionado en la model card |
| Alternativas ASR puras (p. ej. Whisper) y modelos de audio-lenguaje (p. ej. Qwen2-Audio) | no disponible | no disponible | Audio / audio-lenguaje | no disponible | no disponibles en los resultados de busqueda |

Los resultados de la busqueda web no aportan datos comparativos verificables sobre modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: inherente a los modelos generativos; se recomienda validar transcripciones y resumenes en contextos criticos.
- Limitaciones de contexto: la ventana de audio esta acotada a unos 30 minutos para transcripcion y 40 minutos para comprension; audios mas largos requeriran segmentacion.
- Limitaciones de idioma: solo estan soportados los ocho idiomas declarados (en, fr, de, es, it, pt, nl, hi); el rendimiento en otros idiomas no esta documentado.
- System prompts no soportados todavia, lo que limita el control fino del comportamiento del modelo.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial; conviene revisar los terminos de Mistral AI y su politica de privacidad, ya que el acceso puede requerir aceptar condiciones adicionales.
- Para produccion: se recomienda vLLM >= 0.10.0 y mistral_common >= 1.8.1, y verificar la compatibilidad de los formatos de carga (tokenizer_mode mistral, config_format mistral, load_format mistral).
- La model card indica que el modelo no esta pensado para inferencia directa en el pipeline de HuggingFace (inference: false).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mistralai/Voxtral-Mini-3B-2507
- Blog de Mistral AI sobre Voxtral: https://mistral.ai/news/voxtral
- Paper de investigacion (arXiv): https://arxiv.org/abs/2507.13264
- Ministral 3B (backbone): https://mistral.ai/news/ministraux
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Repositorio de mistral-common: https://github.com/mistralai/mistral-common
- Notas de version de mistral-common 1.8.1: https://github.com/mistralai/mistral-common/releases/tag/v1.8.1
- Sitio de Mistral AI: https://mistral.ai/
- Politica de privacidad de Mistral AI: https://mistral.ai/terms/
