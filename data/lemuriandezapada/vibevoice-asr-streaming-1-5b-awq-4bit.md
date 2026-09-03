# lemuriandezapada/VibeVoice-ASR-Streaming-1.5B-AWQ-4bit

## Resumen

VibeVoice-ASR-Streaming-1.5B es un modelo de reconocimiento automático del habla (ASR) en streaming desarrollado por Microsoft Research, diseñado para transcribir de forma continua quién habla y qué dice, con soporte para hotwords personalizados y diez idiomas. Esta versión concreta, publicada por el usuario lemuriandezapada, es una cuantización AWQ de 4 bits del decoder basado en Qwen2, manteniendo los tokenizers acústicos y semánticos en BF16 para preservar el comportamiento multimodal del streaming. El modelo original se presenta como una solución unificada para transcripción con atribución de hablante, lo que lo hace relevante para entornos de reuniones, subtitulado en vivo y asistentes de voz. La arquitectura combina un codificador acústico, tokenizers semánticos y un decoder de lenguaje, con un total de 1.037.028.321 parámetros según los pesos safetensors, a pesar de la denominación "1.5B" en el nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder basado en Qwen2) con tokenizers acústicos y semánticos |
| Parametros totales | 1.037.028.321 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | AWQ 4-bit (group-size 128) en el decoder; tokenizers en BF16 |
| Idiomas soportados | en, zh, es, pt, de, ja, ko, fr, ru, it |
| Licencia | MIT |
| Formato de pesos | safetensors (decoder cuantizado en `decoder-awq/`) |

## Arquitectura y entrenamiento

El modelo original VibeVoice-ASR-Streaming-1.5B emplea una arquitectura unificada de ASR en streaming que integra un codificador acústico, tokenizers semánticos y un decoder de lenguaje basado en Qwen2. La cuantización AWQ 4-bit se aplica únicamente al decoder, con group-size 128 y pesos compatibles con GEMM, mientras que los componentes acústicos y semánticos permanecen en BF16 para no degradar la calidad del streaming. El proceso de cuantización utilizó 128 prompts de calibración orientados a tareas de transcripción. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO; la model card solo menciona que el proyecto fue desarrollado por Microsoft Research y que existe un informe técnico en arxiv.

## Capacidades

- Transcripción de voz a texto en streaming, procesando el audio a medida que llega.
- Atribución de hablante: identifica quién dijo qué en conversaciones multi-participante.
- Soporte de hotwords personalizados: permite al usuario especificar nombres, términos técnicos o jerga para mejorar el reconocimiento en dominios específicos.
- Multilingüe: cubre diez idiomas (chino, inglés, francés, alemán, italiano, japonés, coreano, portugués, ruso y español).
- Integración con vLLM mediante el plugin VibeVoice, lo que permite despliegue en entornos de producción con inferencia optimizada.
- Compatible con la librería transformers y el pipeline `automatic-speech-recognition`.

## Casos de uso

- Transcripción de reuniones con atribución de hablante: el modelo puede generar actas detalladas indicando qué participante dijo cada frase, útil para equipos de trabajo y entornos corporativos.
- Subtitulado en vivo para eventos o retransmisiones: su capacidad de streaming permite generar subtítulos en tiempo real en varios idiomas.
- Asistentes de voz con hotwords personalizados: por ejemplo, en aplicaciones médicas donde se necesitan términos técnicos específicos, el usuario puede añadir esos términos para mejorar la precisión.
- Análisis de llamadas de atención al cliente: transcribir y atribuir las intervenciones del agente y del cliente para evaluar la calidad del servicio.
- Generación de contenido accesible: crear subtítulos para vídeos o podcasts en múltiples idiomas, con identificación de los hablantes.
- Investigación en lingüística o sociología: análisis de conversaciones naturales con separación de turnos y hablantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una figura con resultados comparativos, pero no se proporcionan valores numéricos en el texto. Por tanto, no es posible presentar una tabla de rendimiento objetiva.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de aproximadamente 1.037 millones de parámetros con cuantización AWQ 4-bit, el tamaño de los pesos del decoder se reduce significativamente. El repositorio ocupa 3.2 GB, lo que sugiere que puede ejecutarse en GPUs con al menos 8 GB de VRAM, aunque se recomienda 12 GB o más para manejar el streaming con contexto largo y el overhead de vLLM.
- GPU recomendadas: RTX 3060, RTX 4070, RTX 4090, A10, A100, H100. Para uso en producción con vLLM, se recomienda una GPU con al menos 16 GB de VRAM.
- Compatibilidad con consumer GPU: sí, siempre que se disponga de una build de vLLM con soporte AWQ y el plugin VibeVoice.
- Opciones de despliegue: vLLM (con el plugin específico de Microsoft), también puede usarse con transformers para inferencia no optimizada, aunque el streaming requiere el plugin.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa directa con otros modelos de ASR streaming con atribución de hablante. Alternativas como Whisper (de OpenAI) ofrecen transcripción multilingüe pero sin atribución de hablante ni streaming nativo. Otros modelos como NeMo de NVIDIA o Parakeet podrían ser comparables, pero no se han encontrado datos específicos en la información disponible.

## Limitaciones y advertencias

- La cuantización AWQ 4-bit puede introducir una ligera degradación en la precisión del decoder en comparación con el modelo original en BF16, aunque el autor indica que se preserva el comportamiento de streaming.
- El modelo requiere el plugin VibeVoice de Microsoft y una build de vLLM con soporte AWQ; sin estos componentes, no es posible ejecutar la inferencia en streaming.
- No se han publicado evaluaciones detalladas de sesgos o comportamientos ofensivos; la model card menciona que el equipo de Microsoft está abierto a recibir informes de comportamiento no deseado.
- La licencia MIT permite uso comercial, pero es necesario cumplir con los términos del plugin y del código asociado.
- El modelo está diseñado para diez idiomas específicos; puede tener un rendimiento inferior en dialectos o variantes regionales no representadas en el entrenamiento.
- Al ser un modelo de ASR, puede presentar errores en entornos con ruido de fondo, acentos no estándar o superposición de hablantes.

## Enlaces

- [HuggingFace - VibeVoice-ASR-Streaming-1.5B-AWQ-4bit](https://huggingface.co/lemuriandezapada/VibeVoice-ASR-Streaming-1.5B-AWQ-4bit)
- [Modelo original en HuggingFace](https://huggingface.co/microsoft/VibeVoice-ASR-Streaming-1.5B)
- [Repositorio GitHub de Microsoft VibeVoice](https://github.com/microsoft/VibeVoice)
- [Informe técnico en arXiv](https://arxiv.org/abs/2609.02812)
- [Demo en vivo](https://aka.ms/vibeasr)
