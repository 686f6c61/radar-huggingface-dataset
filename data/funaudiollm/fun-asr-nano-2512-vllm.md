# FunAudioLLM/Fun-ASR-Nano-2512-vllm

## Resumen

Fun-ASR-Nano-2512-vllm es el empaquetado oficial para vLLM del modelo de reconocimiento automático del habla (ASR) Fun-ASR-Nano-2512, desarrollado por FunAudioLLM (Tongyi Lab, Alibaba). Se trata de un modelo de transcripción de voz a texto de extremo a extremo basado en una arquitectura de LLM (Qwen3), que convierte audio directamente en texto sin necesidad de un decodificador fonético separado. El repositorio no define un modelo nuevo ni añade pesos LoRA: los 1.261 tensores de `model.safetensors` son bitwise idénticos al checkpoint oficial `model.pt`, por lo que es una conversión fiel pensada para ejecutarse con el runtime vLLM y su API compatible con OpenAI.

El modelo resuelve el problema de la transcripción de voz con baja latencia y alta fidelidad, especialmente en chino mandarín, inglés y japonés (aunque la documentación externa menciona soporte para 31 idiomas). Con aproximadamente 985 millones de parámetros, se posiciona como una opción ligera y eficiente para despliegues de ASR en producción. Su relevancia actual radica en la integración nativa con vLLM, que permite servir el modelo con la misma infraestructura que los LLMs, simplificando el stack tecnológico y reduciendo la latencia de inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3 (transformer decoder-only), adaptada para ASR |
| Parametros totales | 985.374.304 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | float32 (validado); otras cuantizaciones no documentadas |
| Idiomas soportados | zh, en, ja (según model card); documentación externa menciona 31 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo es un ASR de extremo a extremo basado en un LLM, concretamente sobre la arquitectura Qwen3, según los tags del repositorio. Esto implica que el audio se codifica y se procesa mediante un transformer decoder-only que genera la transcripción token a token. No se dispone de detalles precisos sobre el codificador de audio, el proceso de entrenamiento (número exacto de tokens, uso de RLHF o DPO) ni las innovaciones técnicas específicas más allá de su integración con vLLM. La documentación externa indica que se entrenó con decenas de millones de horas de habla real, lo que le confiere capacidades de comprensión contextual y adaptación a dominios verticales como educación o finanzas.

El repositorio vllm incluye la maquinaria necesaria para que vLLM cargue el checkpoint original sin modificaciones: los tensores son idénticos al modelo base `Fun-ASR-Nano-2512` en la revisión `272c57b82523ada6fd87095e955f8e29100979ab`. La conversión se puede reproducir con el script `convert_from_official.py` incluido en el repo.

## Capacidades

- Transcripción de voz a texto en chino mandarín, inglés y japonés (según la model card oficial).
- Soporte amplio de idiomas: la documentación externa indica cobertura de 31 lenguas, incluyendo 7 dialectos chinos y 26 acentos regionales.
- Baja latencia en transcripción en tiempo real, según las especificaciones del modelo base.
- API compatible con OpenAI para transcripciones (`/v1/audio/transcriptions`), lo que facilita su integración en aplicaciones existentes.
- Funciona con el runtime vLLM, permitiendo servir el modelo con la misma infraestructura que los LLMs.
- No soporta de forma nativa timestamps, diarización de hablantes ni streaming en este empaquetado; para esas funciones se requiere el toolkit FunASR canónico.

## Casos de uso

- Transcripción de reuniones y videollamadas: el modelo puede convertir conversaciones multiparticipante en texto con baja latencia, gracias a su entrenamiento con decenas de millones de horas de habla real. Se integraría como un servicio vLLM que recibe el audio y devuelve la transcripción en formato JSON.
- Subtitulado automático de vídeos: dado su soporte multilingüe y su precisión en chino e inglés, es adecuado para generar subtítulos en tiempo real o en postproducción. Su API OpenAI-compatible permite conectarlo directamente a pipelines de procesamiento de vídeo.
- Atención al cliente automatizada: el modelo puede transcribir llamadas de soporte para su análisis posterior o para alimentar sistemas de respuesta automática. Su latencia reducida lo hace apto para entornos interactivos.
- Dictado médico y legal: la capacidad de adaptarse a dominios verticales (educación, finanzas) sugiere que puede ajustarse o emplearse directamente para transcribir jerga especializada con buena fidelidad.
- Análisis de voz para investigación social: los investigadores pueden transcribir entrevistas o grupos focales multilingües, aprovechando el soporte de 31 idiomas que menciona la documentación externa.
- Asistentes de voz integrados en dispositivos: al ser un modelo ligero (~1B parámetros), cabe en GPUs de gama media y puede desplegarse en edge o en servidores con una sola GPU, sirviendo comandos de voz en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta la validación funcional con una muestra en chino (`开饭时间早上九点至下午五点。`) que se transcribió correctamente en tres peticiones deterministas, sin aportar métricas como WER o comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: con float32 y `--gpu-memory-utilization 0.40` en una H100 de 80 GB, la huella de memoria ronda los 32 GB. Con cuantización a float16 o int8, la VRAM necesaria podría reducirse a 8-12 GB, aunque no hay datos oficiales.
- GPU recomendadas: la validación oficial se realizó en una NVIDIA H100 80 GB. Por el tamaño del modelo (~2 GB de pesos), también debería funcionar en GPUs de consumo como RTX 3090, RTX 4090 (24 GB) o A10 (24 GB) si se usa float16.
- Opciones de despliegue: vLLM es el runtime principal (versión 0.27.1 validada). También se menciona compatibilidad con llama.cpp y FunASR para otros runtimes, aunque el empaquetado vllm es específico para vLLM.
- Latencia y throughput: no se proporcionan datos concretos. La validación con una sola H100 sugiere que la inferencia es determinista y rápida, pero sin cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con alternativas como Whisper (OpenAI), Parakeet (NVIDIA) o Canary (NVIDIA). El modelo se posiciona como un ASR basado en LLM con integración nativa en vLLM, pero sin métricas públicas que permitan una comparación cuantitativa. Se recomienda evaluar con datasets propios antes de elegir entre opciones.

## Limitaciones y advertencias

- La validación oficial cubre exclusivamente vLLM 0.27.1, PyTorch 2.13.0+cu129 y Transformers 5.15.0 en una NVIDIA H100. Otras versiones de software o hardware requieren validación adicional.
- El empaquetado vllm no soporta timestamps, diarización de hablantes ni streaming; para esas funcionalidades hay que usar el toolkit FunASR canónico con el checkpoint original.
- La model card solo lista tres idiomas (zh, en, ja); el soporte de 31 idiomas proviene de documentación externa y no está verificado en este repositorio.
- No se han publicado métricas de error (WER) ni benchmarks comparativos, por lo que la calidad en dominios específicos no está garantizada.
- Aunque la licencia es Apache 2.0, el software de terceros (vLLM, PyTorch) mantiene sus propias licencias, lo que debe tenerse en cuenta en despliegues comerciales.
- El modelo puede presentar sesgos o errores en habla con ruido, acentos no representados o jerga técnica poco frecuente, como es habitual en sistemas ASR.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512-vllm
- Modelo base: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512
- Repositorio GitHub de Fun-ASR: https://github.com/QwenAudio/Fun-ASR
- Análisis externo del modelo: https://www.aimodels.fyi/models/huggingFace/fun-asr-nano-2512-funaudiollm
- PR de vLLM #33247: https://github.com/vllm-project/vllm/pull/33247
- PR de vLLM #36108: https://github.com/vllm-project/vllm/pull/36108
- PR de vLLM #44215: https://github.com/vllm-project/vllm/pull/44215
