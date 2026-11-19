# nvidia/NVIDIA-NemotronLabs-VoiceChat-11B

## Resumen

NVIDIA NemotronLabs VoiceChat 11B es un modelo de voz *full duplex* (FD) de extremo a extremo, desarrollado por NVIDIA, que unifica en una sola arquitectura la comprensión del habla en streaming y la generación de habla. Frente a los *pipelines* en cascada tradicionales (ASR → LLM → TTS), que encadenan varios modelos y añaden latencia por los traspasos entre APIs, este modelo procesa audio de entrada y produce audio de salida de forma simultánea, lo que permite conversación natural con solapamiento de turnos e interrupciones del usuario (*barge-in*).

El modelo tiene 11.095.371.252 parámetros y combina tres componentes: un codificador de voz Fast Conformer (procedente de Nemotron-Speech-Streaming-En-0.6b), un *backbone* LLM Nemotron Nano v2 de 9B con arquitectura híbrida Mamba/Transformer, y un decodificador TTS con su códec. Además, incorpora un canal de salida separado para la predicción de scripts de *tool calling*, lo que lo convierte, según NVIDIA, en el primer modelo FD abierto que soporta llamadas a herramientas manteniendo el flujo conversacional.

Su relevancia actual reside en dos factores: la latencia de cambio de turno, en torno a 450 ms, y la ausencia de dependencia de APIs externas para ASR o TTS. Está orientado a investigadores y desarrolladores de tecnología del habla, con licencia OpenMDW 1.1 y despliegue previsto sobre vLLM en hardware NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba/Transformer (Fast Conformer + LLM Nemotron Nano v2 + decodificador TTS) |
| Parametros totales | 11.095.371.252 (11B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | OpenMDW License Agreement, versión 1.1 |
| Formato de pesos | safetensors |
| Modelo base | nvidia/NVIDIA-Nemotron-Nano-9B-v2 |
| Entrada | Texto (prompt) y audio (voz del usuario), WAV/WebAudio, 16 kHz |
| Salida | Texto (agente), audio (voz del agente), texto (transcripción del usuario), WAV/WebAudio, 22,05 kHz |
| Motor de inferencia | vLLM |
| Hardware soportado | A100, H100, H200, B100, B200, RTX-6000 |
| Sistema operativo | Linux |
| Versión | v1.0 |
| Fecha de publicación | 3 de agosto de 2026 |
| Tamaño del repositorio | 44,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un sistema único de voz a voz compuesto por etapas diferenciadas pero entrenadas de forma conjunta. La señal de audio de entrada se codifica mediante un módulo Fast Conformer, tomado de Nemotron-Speech-Streaming-En-0.6b, que produce *tokens* de audio. Estos se introducen en el *backbone* LLM Nemotron Nano v2 de 9B, de tipo híbrido Mamba/Transformer, que predice *tokens* de texto. Esos *tokens* de texto alimentan un decodificador TTS que genera los códigos de audio correspondientes al habla del agente. Un canal de salida independiente se encarga de predecir los scripts de llamada a herramientas, de modo que la ejecución de una herramienta no bloquea ni interrumpe el flujo de audio de la conversación.

El entrenamiento se realizó sobre aproximadamente 550.000 horas de audio, combinando conjuntos de audio real y datos de habla sintética generados con diversos sistemas TTS sobre corpus de texto (la model card cita Nemotron entre las fuentes, aunque el listado completo no está disponible en la información proporcionada). No se especifican en la información disponible el número de *tokens* de texto, la composición detallada del dataset ni si se aplicaron fases de RLHF o DPO. La innovación técnica principal es la operación *full duplex*: comprensión y generación simultáneas en un solo modelo, con capacidad de ceder el turno de inmediato ante una interrupción y de emitir mensajes de espera (*on-hold*) definidos por herramienta mientras se ejecuta una llamada.

## Capacidades

- Comprensión del habla en streaming (ASR) integrada en el mismo modelo que la generación.
- Generación de habla de extremo a extremo (TTS) a 22,05 kHz sin módulos externos.
- Conversación *full duplex*: entrada y salida de audio simultáneas.
- Gestión natural del cambio de turno, con latencia en torno a 450 ms.
- Soporte de *barge-in*: el modelo cede el turno de forma inmediata cuando el usuario interrumpe.
- *Tool calling* / *function calling* en tiempo real mediante un canal de salida dedicado, con posibilidad de definir un mensaje de espera específico por herramienta que el agente pronuncia mientras se ejecuta la llamada.
- Transcripción de la voz del usuario como salida adicional de texto.
- Conversación multi-turno con historial gestionado por el LLM de 9B subyacente.
- Capacidades de razonamiento y conocimiento heredadas del *backbone* Nemotron Nano v2.
- Capacidades multilingües: limitadas al inglés según los metadatos de idioma disponibles.

## Casos de uso

- **Atención al cliente por voz**: el modelo puede mantener conversaciones telefónicas multi-turno, aceptar interrupciones del cliente y responder en unos 450 ms, lo que evita la sensación de latencia típica de los *pipelines* ASR → LLM → TTS encadenados.
- **Agentes de voz con acceso a sistemas internos**: gracias al canal de *tool calling*, el agente puede consultar el estado de un pedido, reservar una cita o abrir un ticket mientras reproduce un mensaje de espera pregrabado o sintetizado, sin cortar el audio de la conversación.
- **Asistentes embebidos en aplicaciones web**: la entrada y salida en formato WebAudio y 16/22,05 kHz facilita la integración en frontends mediante WebSocket con el contenedor de inferencia de NVIDIA.
- **Investigación en interacción conversacional**: el modelo sirve como base abierta para estudiar *turn-taking*, solapamiento de habla y dinámica de interrupciones en sistemas de diálogo hablado.
- **Sistemas de transcripción y síntesis unificados**: al emitir la transcripción del usuario y la voz del agente desde el mismo modelo, se simplifica la arquitectura de aplicaciones que antes requerían tres servicios distintos.
- **Pruebas de concepto de agentes telefónicos**: con un único checkpoint de 11B y despliegue sobre vLLM en una GPU A100 o H100, un equipo puede montar un prototipo funcional de agente de voz sin contratar APIs de ASR ni de TTS.
- **Evaluación comparativa de modelos de voz**: su condición de modelo FD abierto con *tool calling* lo hace útil como referencia en *benchmarks* de agentes de voz, como VoiceBench.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| VoiceBench (modelos FD abiertos) | Posición n.º 2 |
| *Tool calling* en modelos FD abiertos | Primero (primer modelo FD abierto con soporte) |
| Latencia de cambio de turno | ~450 ms |
| Parámetros | 11B |

No se han publicado en la información disponible resultados numéricos de MMLU, HumanEval, GSM8K ni de métricas ASR (WER) o TTS (MOS) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 11B parámetros en safetensors, los pesos en precisión de entrenamiento ocupan del orden de 22 GB; el repositorio completo son 44,4 GB, lo que sugiere pesos en FP16/BF16 más componentes adicionales.
- GPU recomendadas por NVIDIA: A100, H100, H200, B100, B200 y RTX-6000.
- Encaje en GPU de consumo: no confirmado en la información disponible; el modelo está validado únicamente sobre las microarquitecturas NVIDIA citadas, y el decodificador TTS y el codificador de audio añaden requisitos más allá de los pesos del LLM.
- Opciones de despliegue: vLLM como motor de inferencia; contenedor optimizado de NVIDIA para streaming interactivo por WebSocket; *checkpoint* de Hugging Face para inferencia *offline* por lotes. No se mencionan llama.cpp, Ollama ni TGI.
- Sistema operativo: Linux.
- Latencia y *throughput*: latencia de cambio de turno en torno a 450 ms; no se publican cifras de *throughput* (tokens/s o *frames* de audio por segundo).

## Comparativa con modelos similares

| Modelo | Parámetros | Modalidad | Full duplex | Tool calling | Licencia |
|---|---|---|---|---|---|
| NVIDIA NemotronLabs VoiceChat 11B | 11B | Voz a voz extremo a extremo | Sí | Sí (primero en FD abierto) | OpenMDW 1.1 |
| Cascada ASR + LLM + TTS (p. ej., Whisper + LLM + TTS) | Variable, suma de varios modelos | Voz a voz por etapas | No | Depende del LLM | Según componentes |
| nvidia/NVIDIA-Nemotron-Nano-9B-v2 (modelo base) | 9B | Texto | No | No disponible en la información | No disponible en la información |

No se dispone en la información proporcionada de datos de otros modelos FD abiertos comparables en parámetros, contexto o rendimiento, por lo que la comparación cuantitativa con alternativas directas no está disponible.

## Limitaciones y advertencias

- Idiomas: los metadatos solo declaran inglés; no hay soporte multilingüe documentado.
- Sesgos: no se documentan en la información disponible análisis de sesgos por acento, género, edad o origen; un modelo entrenado mayoritariamente con datos en inglés puede degradarse con hablantes no nativos o acentos no representados.
- Alucinación: al integrar un LLM generativo, existe riesgo de respuestas incorrectas o de invención de datos, especialmente en *tool calling* (argumentos erróneos en la llamada) y en la transcripción.
- Contexto: la longitud de contexto no está publicada, lo que impide planificar conversaciones de larga duración con garantías.
- Licencia: el uso se rige por OpenMDW 1.1; es necesario revisar sus términos antes de un despliegue comercial, ya que la model card no detalla restricciones adicionales.
- Hardware: validado solo en Linux y en GPUs NVIDIA de gama profesional o de centro de datos; no hay confirmación de funcionamiento en GPU de consumo ni en CPU.
- Integración: requiere el contenedor o el *stack* de NVIDIA NeMo Speech para streaming; no se documentan alternativas de despliegue fuera de vLLM.
- Producción: NVIDIA recomienda pruebas iterativas con datos específicos del caso de uso siguiendo la metodología en V antes de desplegar, dado el riesgo de fallos en sistemas de voz en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-VoiceChat-11B
- Repositorio de código (rama nemotron-labs-voicechat): https://github.com/NVIDIA-NeMo/Speech/tree/nemotron-labs-voicechat
- Modelo base LLM: https://huggingface.co/nvidia/NVIDIA-Nemotron-Nano-9B-v2
- Codificador de voz: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b
- Licencia OpenMDW 1.1: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
- Muestras de audio: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-VoiceChat-11B/resolve/main/turn_taking.wav, https://huggingface.co/nvidia/NVIDIA-NemotronLabs-VoiceChat-11B/resolve/main/interruptions.wav, https://huggingface.co/nvidia/NVIDIA-NemotronLabs-VoiceChat-11B/resolve/main/tool_call.wav
- Referencias arXiv citadas en los metadatos: arxiv:2410.17196, arxiv:2503.04721, arxiv:2604.04847, arxiv:2609.21967, arxiv:2505.15670, arxiv:2507.08128
