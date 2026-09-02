# FunAudioLLM/Fun-ASR-Nano-2512-hf

## Resumen

Fun-ASR-Nano-2512-hf es un modelo de reconocimiento automático del habla (ASR) de extremo a extremo desarrollado por FunAudioLLM, el equipo del laboratorio Tongyi de Alibaba. Se distribuye como checkpoint compatible con la librería Transformers de Hugging Face, lo que facilita su integración en pipelines existentes sin depender del ecosistema nativo de FunASR. El modelo está entrenado sobre decenas de millones de horas de voz real y cubre chino (incluyendo 7 grupos dialectales y 26 acentos regionales), inglés y japonés.

Desde el punto de vista arquitectónico, sigue el esquema "Audio Encoder + Adaptor + LLM (Qwen)" con aproximadamente 830 millones de parámetros, lo que lo sitúa en la gama de modelos ASR compactos pero con capacidad de razonamiento lingüístico. Su relevancia actual radica en que ofrece transcripción multilingüe de alta calidad con una huella de memoria moderada, apta para despliegue en entornos con recursos limitados, y además soporta instrucciones contextuales mediante prompt y hotwords para mejorar la precisión en dominios específicos.

Esta versión para Transformers está pensada para transcripción basada en generación; no incluye la rama CTC del checkpoint original, por lo que carece de marcas de tiempo y diarización de hablantes. Para esas funcionalidades es necesario usar el checkpoint nativo a través de FunASR o su integración con vLLM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Encoder + Adaptor + LLM (Qwen) |
| Parametros totales | 829.791.840 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | Chino (incluye cantonés y dialectos), inglés, japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de secuencia a secuencia compuesta por un encoder de audio, un adaptador y un modelo de lenguaje basado en Qwen. El encoder transforma la señal de audio en representaciones latentes, el adaptador proyecta esas representaciones al espacio del LLM, y el LLM genera la transcripción token a token. Esta combinación permite aprovechar las capacidades de razonamiento contextual del LLM para mejorar la precisión en tareas de ASR, especialmente con el uso de prompts e instrucciones.

El entrenamiento se realizó sobre decenas de millones de horas de habla real, lo que proporciona una cobertura amplia de acentos, ruido de fondo y estilos de habla. No se especifica en la información disponible si se emplearon técnicas de RLHF o DPO; el modelo se presenta como un ASR supervisado de extremo a extremo. La versión HF no incluye la rama CTC del checkpoint original, por lo que la salida es puramente generativa.

## Capacidades

- Transcripción de voz a texto en chino, inglés y japonés, con soporte para dialectos chinos y acentos regionales.
- Generación de transcripciones con contexto: acepta un campo `prompt` para proporcionar información temática o de dominio que guía la decodificación.
- Soporte de hotwords o palabras clave: permite especificar términos que el modelo prioriza durante la transcripción, útil para nombres propios o jerga técnica.
- Procesamiento por streaming: el modelo está etiquetado como compatible con streaming, aunque la implementación concreta en Transformers no está detallada en la documentación disponible.
- Integración con el ecosistema FunASR: puede usarse junto con herramientas de VAD, puntuación y otras utilidades del toolkit.
- No incluye capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y videollamadas: el modelo puede convertir conversaciones multilingües a texto en tiempo real o diferido, con soporte para acentos y ruido de fondo. Su tamaño compacto permite ejecutarlo en servidores modestos o incluso en estaciones de trabajo.
- Subtitulado automático de vídeo: al aceptar audio de cualquier duración (segmentado previamente), es adecuado para generar subtítulos en chino, inglés o japonés, con la posibilidad de afinar términos mediante hotwords.
- Atención al cliente automatizada: integrado en un sistema de IVR o chatbot, puede transcribir las consultas de los clientes y alimentar un motor de respuestas. El uso de `prompt` con el contexto del negocio mejora la precisión en vocabulario específico.
- Dictado médico o legal: gracias al soporte de hotwords, se pueden añadir términos técnicos o nombres de medicamentos para reducir errores de transcripción en dominios especializados.
- Análisis de llamadas de ventas: transcripción de grabaciones para extraer métricas, detectar intenciones o generar resúmenes automáticos. La licencia Apache 2.0 permite uso comercial sin restricciones.
- Accesibilidad: conversión de contenido de audio a texto para personas con discapacidad auditiva, con cobertura multilingüe y posibilidad de personalización mediante prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original menciona que el modelo fue evaluado frente a otros sistemas de última generación en conjuntos de datos abiertos, dialectos chinos y conjuntos de prueba específicos de la industria, pero no se proporcionan cifras concretas en los materiales consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 830M parámetros en bfloat16, los pesos ocupan aproximadamente 1,7 GB. Añadiendo activaciones y overhead, se recomienda al menos 4 GB de VRAM para secuencias de audio cortas. Con cuantización a 8 bits (si se aplica externamente) bastarían unos 2 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, como NVIDIA RTX 3050, RTX 3060, RTX 4060, o GPUs de datacenter como A10, A100 o H100. También puede ejecutarse en CPU con mayor latencia.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de gama media y baja gracias a su tamaño reducido.
- Opciones de despliegue: la integración con Transformers permite usar `pipeline` de Hugging Face, `vLLM` (con la integración nativa de FunASR), o el toolkit FunASR completo. No se proporcionan archivos GGUF, por lo que llama.cpp u Ollama no son opciones directas.
- Latencia y throughput: no se han publicado datos oficiales. Como referencia orientativa, un modelo de 800M parámetros en una GPU moderna puede transcribir audio en tiempo real o más rápido, pero depende de la longitud de la secuencia y la optimización.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Fun-ASR-Nano-2512-hf | 830M | zh, en, ja | No disponible | Apache 2.0 | safetensors |
| Fun-ASR-MLT-Nano-2512 | 800M | 31 idiomas | No disponible | Apache 2.0 | safetensors |
| SenseVoiceSmall | ~230M | zh, en, ja, ko, yue | No disponible | Apache 2.0 | safetensors |
| Whisper large-v3 | 1.5B | 99 idiomas | 30 s de audio | MIT | safetensors, GGUF |

La comparativa se basa en características declaradas; no se dispone de datos de rendimiento para establecer una jerarquía objetiva. Fun-ASR-Nano se posiciona como una opción intermedia entre SenseVoiceSmall (más ligero pero con menos cobertura) y Whisper large-v3 (más pesado pero con más idiomas). La ventaja de Fun-ASR-Nano reside en su soporte específico para dialectos chinos y su integración con el ecosistema FunASR.

## Limitaciones y advertencias

- Esta versión HF no incluye la rama CTC, por lo que no proporciona marcas de tiempo ni diarización de hablantes. Para esas funciones hay que usar el checkpoint original con FunASR.
- Cobertura de idiomas limitada a chino, inglés y japonés (el cantonés se considera parte de los dialectos chinos). Para 31 idiomas se necesita el checkpoint MLT-Nano.
- Riesgo de alucinación en audio con mucho ruido o solapamiento de voces, común en modelos ASR generativos.
- No se han publicado detalles sobre sesgos en los datos de entrenamiento; al estar entrenado con voz real, puede reflejar sesgos demográficos o de acento presentes en las fuentes.
- La integración con Transformers requiere una versión con el PR #46180 aún no incluida en un release estable; hasta entonces hay que instalar una build específica.
- No se proporcionan cuantizaciones oficiales (GGUF, ONNX, etc.), lo que limita el despliegue en entornos que requieran formatos optimizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512-hf
- Checkpoint original: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512
- Repositorio FunASR: https://github.com/modelscope/FunASR
- Repositorio Fun-ASR (QwenAudio): https://github.com/QwenAudio/Fun-ASR
- Guía de Fun-ASR-Nano: https://www.funasr.com/en/blog/fun-asr-nano-guide.html
- Paper de referencia (SenseVoice, arxiv:2407.04051): https://arxiv.org/abs/2407.04051
