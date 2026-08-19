# openbmb/MiniCPM-o-2_6-int4

## Resumen

MiniCPM-o 2.6 int4 es la versión cuantizada en 4 bits (GPTQ) del modelo multimodal MiniCPM-o 2.6, desarrollado por el equipo OpenBMB. Se trata de un modelo de lenguaje grande multimodal (MLLM) de tipo "any-to-any", capaz de procesar y generar texto, imagen, audio y vídeo en una única arquitectura. Su objetivo principal es llevar capacidades de nivel GPT-4o a dispositivos con recursos limitados, como teléfonos móviles o GPUs de consumo, manteniendo un rendimiento competitivo en tareas de visión, habla y streaming multimodal en tiempo real.

La arquitectura combina un LLM base Qwen2.5-7B con encoders especializados: SigLip-400M para visión, Whisper-medium-300M para audio y ChatTTS-200M para síntesis de voz. El modelo completo tiene 8.674.997.028 parámetros, y la versión int4 reduce el uso de memoria a aproximadamente 9 GB de VRAM, lo que permite su ejecución en GPUs de consumo medio. Está licenciado bajo Apache 2.0, lo que facilita su uso comercial y académico. Esta versión cuantizada mantiene las capacidades del modelo original, incluyendo conversación de voz en tiempo real, clonación de voz, OCR, análisis de vídeo y comprensión de múltiples imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLLM end-to-end: Qwen2.5-7B (LLM base) + SigLip-400M (visión) + Whisper-medium-300M (audio) + ChatTTS-200M (TTS) |
| Parametros totales | 8.674.997.028 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (GPTQ) |
| Idiomas soportados | multilingue (sin lista especifica publicada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizado GPTQ) |

## Arquitectura y entrenamiento

El modelo base MiniCPM-o 2.6 se construye de forma end-to-end combinando varios componentes: un LLM Qwen2.5-7B como núcleo de razonamiento, un encoder de visión SigLip-400M, un encoder de audio Whisper-medium-300M y un módulo de síntesis de voz ChatTTS-200M. Esta integración permite procesar entradas multimodales (texto, imagen, audio, vídeo) y generar salidas en cualquiera de estos formatos, incluyendo habla sintetizada con clonación de voz.

La versión int4 se obtiene mediante cuantización GPTQ del modelo original, lo que reduce el peso de los parámetros a 4 bits sin cambios arquitectónicos. El proceso de cuantización se realizó con una implementación personalizada de AutoGPTQ (rama `minicpmo`), y el modelo resultante requiere aproximadamente 9 GB de VRAM para inferencia. No se han publicado detalles sobre el entrenamiento completo, pero el dataset RLAIF-V se menciona como parte del proceso de alineación. La cuantización no altera las capacidades funcionales, aunque puede introducir una ligera degradación en la precisión numérica.

## Capacidades

- Comprensión y generación de texto, imagen, audio y vídeo en un mismo modelo (any-to-any).
- Reconocimiento óptico de caracteres (OCR) sobre imágenes y documentos.
- Análisis de múltiples imágenes y vídeos, con capacidad de razonamiento visual.
- Conversación de voz en tiempo real (realtime speech conversation) con baja latencia.
- Transcripción automática de voz (ASR) y síntesis de voz (TTS) con clonación de voz.
- Streaming multimodal en vivo, procesando entrada de cámara y micrófono simultáneamente.
- Soporte multilingue, aunque no se especifica la lista exacta de idiomas.
- Capacidad de actuar como asistente de voz con voces limitadas (modo asistente).

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones de voz multi-turno en tiempo real, interpretando tanto el tono como el contenido del usuario y respondiendo con voz sintetizada, lo que lo hace adecuado para centros de contacto virtuales.
- Transcripción y traducción simultánea: gracias a su ASR integrado, puede transcribir reuniones o conferencias y generar subtítulos en varios idiomas, con salida de texto o voz.
- Asistente personal multimodal en dispositivos móviles: al caber en ~9 GB de VRAM, puede ejecutarse en portátiles con GPUs de gama media o en servidores pequeños, ofreciendo asistencia por voz y visión (por ejemplo, describir objetos o leer carteles).
- Análisis de vídeo en tiempo real: su capacidad de procesar vídeo permite monitorizar cámaras de seguridad o analizar contenido multimedia para moderación o extracción de información.
- Clonación de voz para doblaje o accesibilidad: el módulo ChatTTS permite generar voces personalizadas, útil para audiolibros, asistentes con voz propia o personas con discapacidad del habla.
- Generación de descripciones accesibles: puede convertir imágenes o vídeos en descripciones textuales detalladas, facilitando el acceso a contenido visual para personas con discapacidad visual.
- Prototipado rápido de interfaces de voz: desarrolladores pueden integrar el modelo en aplicaciones de voz para probar asistentes conversacionales sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la versión int4 en la información disponible. El modelo base MiniCPM-o 2.6 se presenta como "nivel GPT-4o" en tareas multimodales, pero no se proporcionan cifras concretas de MMLU, HumanEval u otros tests. Se recomienda consultar el repositorio oficial o el blog técnico para obtener métricas detalladas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9 GB en cuantización int4, según la model card.
- GPUs compatibles: tarjetas con al menos 9-10 GB de VRAM, como RTX 3080/3090, RTX 4070/4080/4090, A10, A100 (sobra), o GPUs de portátil de gama alta.
- No se recomienda su uso en GPUs con menos de 8 GB de VRAM, ya que el modelo completo no cabría.
- Opciones de despliegue: la inferencia se realiza mediante la librería `transformers` con `trust_remote_code=True` y AutoGPTQ (rama `minicpmo`). No se menciona soporte para vLLM, llama.cpp u Ollama en la documentación disponible.
- Latencia y throughput: no disponibles. Al ser un modelo multimodal con varios encoders, la latencia depende de la tarea (visión, audio, texto) y del hardware. La cuantización int4 reduce el uso de memoria pero puede aumentar ligeramente la latencia frente a la versión de precisión completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Cuantizacion |
|---|---|---|---|---|---|
| MiniCPM-o 2.6 int4 (este) | 8.67B | no disponible | texto, imagen, audio, vídeo | Apache 2.0 | int4 GPTQ |
| MiniCPM-o 2.6 (base) | 8.67B | no disponible | texto, imagen, audio, vídeo | Apache 2.0 | bf16/fp16 |
| MiniCPM-V 2.6 | 8B (aprox.) | no disponible | texto, imagen | Apache 2.0 | bf16/fp16 |

La comparativa se limita a los modelos de la misma familia, ya que no se dispone de datos de otros MLLM comparables en esta información. El int4 es la versión cuantizada del base, con menor huella de memoria. MiniCPM-V 2.6 es el predecesor, sin capacidades de audio/voz.

## Limitaciones y advertencias

- La cuantización int4 puede provocar una ligera pérdida de precisión en tareas numéricas o de razonamiento complejo respecto a la versión en bf16.
- El modelo requiere `trust_remote_code=True` y una rama específica de AutoGPTQ, lo que implica un entorno de instalación no estándar y posibles riesgos de seguridad al ejecutar código remoto.
- No se especifica la longitud de contexto, por lo que no se puede garantizar un rendimiento óptimo en conversaciones o documentos muy largos.
- Aunque es multilingue, no se detalla la cobertura idiomática; puede haber sesgos hacia idiomas con más datos de entrenamiento.
- Como cualquier modelo generativo, existe riesgo de alucinaciones, especialmente en tareas de visión o audio donde los encoders pueden malinterpretar entradas ambiguas.
- La clonación de voz plantea riesgos de uso indebido (suplantación de identidad); se debe implementar con controles de consentimiento.
- La licencia Apache 2.0 permite uso comercial, pero el código personalizado (AutoGPTQ) y los pesos del modelo base (Qwen2.5-7B) tienen sus propias licencias; Qwen2.5 está bajo Apache 2.0, así que no hay conflicto conocido.
- El modelo está pensado para GPUs NVIDIA con soporte CUDA; no se menciona compatibilidad con Apple Silicon o CPUs.

## Enlaces

- HuggingFace (modelo int4): https://huggingface.co/openbmb/MiniCPM-o-2_6-int4
- HuggingFace (modelo base): https://huggingface.co/openbmb/MiniCPM-o-2_6
- GitHub del proyecto: https://github.com/OpenBMB/MiniCPM-o
- Blog tecnico: https://openbmb.notion.site/MiniCPM-o-2-6-A-GPT-4o-Level-MLLM-for-Vision-Speech-and-Multimodal-Live-Streaming-on-Your-Phone-185ede1b7a558042b5d5e45e6b237da9
- Demo online: https://minicpm-omni-webdemo-us.modelbest.cn
- Repositorio AutoGPTQ (rama minicpmo): https://github.com/RanchiZhao/AutoGPTQ
