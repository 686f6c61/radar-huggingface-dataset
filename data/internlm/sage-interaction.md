# internlm/Sage-Interaction

## Resumen

Sage-Interaction es un modelo omnicanal de interacción desarrollado por InternLM (vinculado al Shanghai Artificial Intelligence Laboratory) y construido sobre MiniCPM-o 4.5. Su propósito es gestionar conversaciones en tiempo real con audio y vídeo en streaming, generando voz de forma simultánea y manteniendo un comportamiento de full-duplex: puede ser interrumpido, retomar el turno tras breves confirmaciones del usuario y reaccionar a cambios en un flujo de vídeo en directo. Con 9.371.795.858 parámetros (aproximadamente 9B), se posiciona como un modelo any-to-any orientado a interacción conversacional más que a generación de texto puro.

La innovación central es la delegación agéntica de tareas: el modelo actúa como frontend de interacción en tiempo real mientras deriva tareas de razonamiento largo o con uso de herramientas a un backend externo (API compatible con `/chat/completions` y salida JSON estructurada). Cuando el backend devuelve el resultado, el frontend lo incorpora a la conversación en curso. Esto separa la latencia de respuesta conversacional de la latencia de razonamiento profundo.

El modelo es relevante porque aborda un problema práctico de los asistentes por voz: mantener naturalidad conversacional (baja latencia, gestión de interrupciones) sin sacrificar capacidad de razonamiento. Su licencia no está declarada en la información disponible, lo que condiciona su adopción en producción. El repositorio ocupa 20 GB e incluye pesos en safetensors y ONNX.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multimodal omnicanal basada en MiniCPM-o 4.5 (transformer multimodal con codificadores de audio y vídeo; detalles internos no disponibles) |
| Parámetros totales | 9.371.795.858 (~9B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors y ONNX; el demo requiere GPU NVIDIA con soporte BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

Sage-Interaction se construye sobre MiniCPM-o 4.5, un modelo omnicanal que integra percepción de audio y vídeo con generación de voz. La arquitectura combina componentes de reconocimiento y síntesis de voz (la model card cita Qwen3-TTS, Qwen3-ASR y Whisper entre las dependencias y agradecimientos) con el núcleo multimodal de MiniCPM-o. El sistema está diseñado para operar en modo streaming: procesa audio y vídeo continuos y emite habla en paralelo, con gestión explícita de turnos, interrupciones y reanudación del habla.

La capa de delegación de tareas es una innovación de diseño a nivel de sistema más que de pesos: el modelo frontend detecta cuándo una petición excede su capacidad de respuesta inmediata y la envía a un backend configurable mediante API compatible con OpenAI (`/models`, `/chat/completions`, salida JSON estructurada). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco detalla innovaciones de atención (lineal, especulativa u otras) más allá del comportamiento full-duplex.

## Capacidades

- Interacción por voz full-duplex en tiempo real: respuesta hablada simultánea a la escucha, con gestión de turnos.
- Tolerancia a interrupciones: el modelo puede ser cortado y retomar el discurso tras confirmaciones breves o habla de fondo.
- Comprensión de vídeo en streaming: reacción a cambios en un flujo de vídeo en directo y respuestas proactivas.
- Percepción omnicanal (any-to-any): entrada de audio y vídeo, salida de voz y texto.
- Delegación agéntica de tareas: derivación de tareas largas o con herramientas a un backend externo y reincorporación del resultado a la conversación.
- Recordatorios temporizados (evaluado en el benchmark Time Speak).
- Integración con herramientas a través del backend (tool calling delegado, no necesariamente nativo en el modelo frontend).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de voz para atención al cliente: el modelo mantiene conversaciones multi-turno por voz con gestión de interrupciones, adecuado para entornos donde el usuario necesita corregir o cortar al asistente sin reiniciar el diálogo.
- Recordatorios y avisos temporizados: con un F1 de 85,96 en Time Speak, puede programar y emitir recordatorios hablados en contextos domésticos o de asistencia.
- Asistencia en laboratorio o entornos manos libres: la combinación de vídeo en streaming y voz permite guiar procedimientos mientras el operario tiene las manos ocupadas, reaccionando a lo que muestra la cámara.
- Planificación de viajes conversacional: el frontend gestiona el diálogo en tiempo real y delega la búsqueda y composición del itinerario al backend, que devuelve el resultado estructurado.
- Alertas de seguridad proactivas: la comprensión de vídeo en streaming permite detectar cambios relevantes en la escena y emitir avisos hablados sin esperar una pregunta explícita.
- Recuperación de información con razonamiento delegado: consultas que requieren cálculo científico o recuperación documental se envían al backend; el frontend mantiene la conversación fluida mientras se procesa.
- Demos interactivas y prototipos de agentes de voz: el stack de despliegue incluido (Linux, GPU NVIDIA BF16, CUDA 12.8, Python 3.12) facilita montar un prototipo funcional con una GPU.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| FD-Bench v1 | Latencia de turno (turn-taking latency) | 1,29 s |
| FD-Bench v1.5 | Puntuación global | 80,73 |
| Daily Delegation | F1 | 80,47 |
| Time Speak | F1 | 85,96 |
| Charades | mIoU | no disponible (valor no incluido en la información) |
| ProactiveQA | PAUC | no disponible (valor no incluido en la información) |
| StreamingBench | Accuracy | no disponible (valor no incluido en la información) |
| DailyOmni | Accuracy | no disponible (valor no incluido en la información) |
| OmniVideoBench | Accuracy | no disponible (valor no incluido en la información) |
| LVOmniBench | Accuracy | no disponible (valor no incluido en la información) |
| Llama Questions | no disponible | no disponible (resultados mostrados en figura, sin cifras en texto) |
| AlpacaEval | no disponible | no disponible (resultados mostrados en figura, sin cifras en texto) |

No se han publicado en la información disponible resultados numéricos de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 9,37B parámetros en BF16, los pesos ocupan aproximadamente 18,7 GB, por lo que se necesita una GPU con al menos 24 GB de VRAM para inferencia en BF16 sin cuantizar, más memoria para cachés de audio/vídeo y estados de conversación.
- GPU recomendadas: el demo requiere una GPU NVIDIA con soporte BF16; la model card no especifica modelos concretos. Por capacidad de memoria, encajan A100, H100, L40S o RTX 4090 (24 GB, al límite).
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 ajustado; en GPUs de 16 GB requeriría cuantización, cuyos formatos no están documentados.
- Opciones de despliegue: el repositorio oficial incluye un demo propio (Linux, Python 3.12, CUDA 12.8, flash-attn 2.8.3, utilidad `patch` del sistema) que sirve una interfaz web en `http://127.0.0.1:18080/`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia de turno de 1,29 s en FD-Bench v1. No se publica throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sage-Interaction | ~9,37B | no disponible | Omnicanal full-duplex con delegación de tareas | no disponible | Hugging Face + GitHub |
| MiniCPM-o 4.5 (base) | no disponible en la información | no disponible | Omnicanal (audio, vídeo, voz) | no disponible | GitHub OpenBMB/MiniCPM-V |
| JoyAI-VL-Interaction | no disponible en la información | no disponible | Interacción visión-lenguaje | no disponible | GitHub jd-opensource |

La información proporcionada no incluye especificaciones detalladas de los modelos comparables (parámetros, contexto, benchmarks), por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial ni las condiciones de redistribución; es un bloqueo potencial para producción.
- Idiomas soportados no documentados: no hay garantía de cobertura multilingüe ni de calidad fuera de los idiomas de entrenamiento.
- Longitud de contexto no publicada: limita la planificación de conversaciones largas o documentos extensos.
- Dependencia de un backend externo para razonamiento profundo y tool calling: la calidad de las tareas delegadas depende del modelo y la infraestructura del backend, no de Sage-Interaction.
- Requisitos de despliegue estrictos: Linux, CUDA 12.8, Python 3.12, flash-attn 2.8.3 y GPU NVIDIA con BF16; no hay soporte documentado para stacks de inferencia estándar como vLLM o llama.cpp.
- Riesgo de alucinación: no cuantificado en la información disponible; como modelo generativo de voz, los errores pueden ser más difíciles de detectar por el usuario que en texto.
- Sesgos: no documentados.
- Madurez temprana: 1 descarga y 11 likes en Hugging Face en el momento de la consulta; el ecosistema de terceros es mínimo.
- Los resultados de benchmarks de vídeo (Charades, ProactiveQA, StreamingBench, DailyOmni, OmniVideoBench, LVOmniBench) solo se presentan en figuras sin cifras en el texto de la model card.

## Enlaces

- Hugging Face: https://huggingface.co/internlm/Sage-Interaction
- GitHub: https://github.com/InternLM/Sage-Interaction
- Página del proyecto: https://internlm.github.io/Sage-Interaction/
- Guía de despliegue: https://github.com/InternLM/Sage-Interaction/tree/main/demo#readme
- MiniCPM-o 4.5 (base): https://github.com/OpenBMB/MiniCPM-V
- Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Whisper: https://github.com/openai/whisper
- DeepSeek-V4.1-Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- JoyAI-VL-Interaction: https://github.com/jd-opensource/JoyAI-VL-Interaction
