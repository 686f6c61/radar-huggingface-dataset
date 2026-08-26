# mradermacher/Voxtral-Mini-3B-2507-estonian-GGUF

## Resumen

Voxtral-Mini-3B-2507-estonian es una adaptación al estonio del modelo Voxtral Mini de Mistral AI, un modelo de lenguaje y audio de 3B parámetros (aunque el recuento real de parámetros es de aproximadamente 4.014 millones) que combina las capacidades de texto de Ministral 3B con un encoder de audio derivado de Whisper. Este modelo está diseñado para tareas de transcripción de voz, traducción y comprensión de audio, manteniendo un rendimiento competitivo en tareas de texto. La versión aquí descrita es una cuantización GGUF realizada por el usuario mradermacher, que permite su ejecución en entornos con recursos limitados mediante formatos como llama.cpp u Ollama.

El modelo original fue desarrollado por TalTechNLP (Universidad de Tecnología de Tallin) y se publicó en HuggingFace bajo el nombre `TalTechNLP/Voxtral-Mini-3B-2507-estonian`. Esta variante estonia está pensada para aplicaciones de procesamiento de voz en ese idioma, aunque conserva las capacidades multilingües del modelo base. La cuantización GGUF ofrece múltiples niveles de compresión (desde Q2_K hasta F16), lo que facilita su despliegue en hardware variado, desde GPUs de consumo hasta servidores profesionales.

La relevancia de este modelo radica en su tamaño compacto combinado con capacidades de audio de última generación, lo que lo convierte en una opción atractiva para desarrolladores que necesitan integrar transcripción y comprensión de voz en aplicaciones en estonio sin depender de APIs comerciales. Al ser de código abierto (aunque la licencia exacta no está especificada en la información disponible), permite un control total sobre el despliegue y los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con encoder de audio (basado en Ministral 3B + encoder Whisper) |
| Parametros totales | 4.014.136.320 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible (el nombre indica adaptación al estonio, pero el modelo base soporta 8+ idiomas) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo original) |

## Arquitectura y entrenamiento

El modelo Voxtral Mini se construye sobre Ministral 3B, un transformer de lenguaje de 3B parámetros, al que se le añade un encoder de audio basado en la arquitectura de Whisper. Este encoder procesa señales de audio de entrada y las integra con el modelo de lenguaje para permitir tareas de transcripción, traducción y comprensión de audio. La versión estonia (`Voxtral-Mini-3B-2507-estonian`) es un fine-tuning del modelo base sobre datos específicos del estonio, aunque no se dispone de detalles sobre el dataset de entrenamiento, el número de tokens o el proceso de alineación (RLHF, DPO, etc.) en la información proporcionada.

La cuantización GGUF realizada por mradermacher convierte los pesos originales en formato safetensors a múltiples niveles de precisión reducida, manteniendo la arquitectura intacta pero reduciendo el tamaño del modelo para su ejecución eficiente en CPU o GPU con menos memoria. No se han documentado innovaciones técnicas adicionales en esta versión cuantizada más allá de la propia cuantización.

## Capacidades

- Transcripción de voz a texto en estonio (y posiblemente otros idiomas, según el modelo base).
- Traducción de audio entre idiomas, aprovechando el encoder de audio y el modelo de lenguaje.
- Comprensión de audio para responder preguntas sobre el contenido de un audio (audio Q&A).
- Generación de texto y razonamiento, heredado de Ministral 3B.
- Soporte de function calling (llamada a funciones) desde comandos de voz, según la documentación del modelo base.
- Capacidades multilingües del modelo base (8+ idiomas), aunque la versión estonia está optimizada para ese idioma.

## Casos de uso

- Transcripción automática de reuniones y entrevistas en estonio: el modelo puede procesar grabaciones de audio y generar texto escrito con alta precisión, gracias a su encoder de audio y su fine-tuning en estonio. Se desplegaría con llama.cpp o vLLM en un servidor con GPU moderada.
- Asistente de voz para atención al cliente en estonio: integrado en un sistema de IVR o chatbot, el modelo transcribe la consulta del usuario, la procesa y genera una respuesta hablada, soportando conversaciones multi-turno.
- Traducción de contenido audiovisual: dado un audio en un idioma, el modelo puede transcribirlo y traducirlo al estonio (o viceversa), útil para subtitulado automático de vídeos o podcasts.
- Análisis de llamadas de soporte técnico: transcripción y extracción de información clave (sentimiento, problemas recurrentes) a partir de grabaciones, facilitando el análisis posterior con herramientas de NLP.
- Generación de resúmenes de audio: el modelo puede escuchar un audio largo y producir un resumen textual, útil para periodistas o investigadores que manejan grandes volúmenes de material sonoro.
- Aplicaciones de accesibilidad: conversión de contenido hablado en estonio a texto para personas con discapacidad auditiva, o viceversa, en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni métricas específicas de transcripción (WER, BLEU) para esta versión estonia ni para el modelo base en el contexto de esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Para Q4_K_M (tamaño aproximado de 2-3 GB), se puede ejecutar en GPUs con 4-6 GB de VRAM. Para F16, se necesitan al menos 8 GB.
- GPU recomendadas: RTX 3060 (12 GB) o superior para cuantizaciones bajas; A100 o H100 para F16 y mayor throughput.
- Sí cabe en GPUs de consumo: una RTX 4060 o 4070 puede ejecutar cuantizaciones Q4 o Q5 sin problemas.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), TGI (si se convierte a safetensors), o directamente con el formato GGUF en entornos CPU.
- Latencia y throughput: no disponible, pero al ser un modelo de ~3-4B parámetros, se espera una latencia de decenas de milisegundos por token en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Voxtral-Mini-3B-2507-estonian (GGUF) | 4.014M | no disponible | Sí (transcripción, traducción) | no disponible | HuggingFace |
| Whisper small (openai) | 244M | 30s de audio | Transcripción | MIT | HuggingFace |
| Ministral 3B (texto) | 3.000M | 128k (según documentación) | No | Apache 2.0 | HuggingFace |
| Qwen2-Audio | 7.600M | no disponible | Sí | Apache 2.0 | HuggingFace |

Nota: la comparativa se basa en datos públicos de los modelos mencionados, no en benchmarks medidos en este contexto. La versión estonia se diferencia por su especialización en ese idioma, mientras que Whisper y Qwen2-Audio son multilingües generales.

## Limitaciones y advertencias

- La licencia no está especificada en la información disponible; se recomienda verificar los términos de uso del modelo original antes de usarlo comercialmente.
- Al ser una cuantización, puede haber una ligera degradación en la calidad de transcripción o generación respecto al modelo en precisión completa (F16).
- El modelo está adaptado al estonio, por lo que su rendimiento en otros idiomas puede ser inferior al del modelo base Voxtral Mini.
- No se dispone de información sobre sesgos o alucinaciones específicas; como todo modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en tareas de audio ambiguas.
- La longitud de contexto no está documentada; para aplicaciones con audios largos, es necesario verificar los límites reales del modelo.
- El repositorio GGUF no incluye el modelo original en safetensors; para usos que requieran precisión total, hay que descargar el modelo de TalTechNLP.

## Enlaces

- Repositorio HuggingFace de la cuantización GGUF: https://huggingface.co/mradermacher/Voxtral-Mini-3B-2507-estonian-GGUF
- Modelo original (TalTechNLP): https://huggingface.co/TalTechNLP/Voxtral-Mini-3B-2507-estonian (referenciado en el README)
- Página del modelo Voxtral Mini en ModelScope: https://www.modelscope.cn/models/mistralai/Voxtral-Mini-3B-2507/summary
- Artículo sobre hardware para Voxtral Mini: https://www.madebyagents.com/models/voxtral-mini-3b-2507
- Repositorio GGUF de ggml-org: https://huggingface.co/ggml-org/Voxtral-Mini-3B-2507-GGUF
