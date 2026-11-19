# inclusionAI/Realtime-Venus

## Resumen

Realtime-Venus es un sistema de interacción multimodal en tiempo real desarrollado por inclusionAI, publicado en Hugging Face bajo licencia Apache 2.0. El repositorio aloja dos checkpoints sobre un mismo backbone de streaming: Realtime-Venus-Omni, un modelo audiovisual de 9B parámetros que percibe vídeo y audio de forma continua y decide cuándo intervenir sin esperar un prompt explícito, y Realtime-Venus-Audio, una variante centrada en comprensión de audio y conversación por voz. Ambos derivan de MiniCPM-o 4.5 y combinan un encoder visual SigLIP2, un encoder de audio Whisper-Medium y un backbone lingüístico Qwen3-8B.

La propuesta diferencial es la conversación full-duplex nativa: el modelo sigue percibiendo mientras habla y distingue entre retroalimentación (backchannels), interrupciones, correcciones y redirecciones del usuario. Sobre esa línea temporal causal compartida añade dos mecanismos poco habituales: interacción proactiva (inicia respuestas ante eventos detectados en el flujo audiovisual) y delegación asíncrona mediante peticiones `<delegate>` que no bloquean la conversación en curso.

El contexto es de 40.960 tokens y los pesos se distribuyen en BF16 (safetensors), con código custom de Transformers y recursos ONNX. El repositorio ocupa 676,2 GB, lo que refleja la presencia de múltiples checkpoints y artefactos auxiliares (decodificador vocacional, voces de referencia). Es relevante para quien construya asistentes por voz o agentes que operen sobre vídeo en directo y necesiten latencia baja y gestión natural de turnos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniCPM-o 4.5 / Omni-Flow; encoder visual SigLIP2, encoder de audio Whisper-Medium, backbone Qwen3-8B, decodificador de voz por flow-matching en streaming |
| Parametros totales | 9B (ambos checkpoints) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards), ONNX, codigo Python custom para Transformers |

## Arquitectura y entrenamiento

Realtime-Venus se construye sobre MiniCPM-o 4.5 y el esquema Omni-Flow, con una pila multimodal compuesta por SigLIP2 para visión, Whisper-Medium para audio y Qwen3-8B como modelo de lenguaje. La generación de voz no usa un TTS externo en cascada, sino tokens discretos S3 decodificados por un decoder de flow-matching en streaming, lo que permite emitir habla de forma incremental sobre la misma línea temporal causal que el texto. La variante Audio prescinde del encoder visual en inferencia y reutiliza el mismo decoder de voz en modo full-duplex.

El rasgo arquitectónico central es la línea temporal causal compartida: entradas de vídeo y audio temporalmente alineadas, salidas de texto y habla, y eventos internos como las peticiones `<delegate>` conviven en la misma secuencia. Sobre ella se apoyan la interacción proactiva (el modelo decide si y cuándo responder) y la memoria de vídeo largo sin entrenamiento adicional, que archiva momentos visualmente informativos, recupera evidencia relevante y no redundante ante una consulta y reensambla el contexto audiovisual correspondiente. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esos datos deben consultarse en el informe técnico.

## Capacidades

- Comprensión conjunta de vídeo, imágenes, audio y texto (checkpoint Omni); audio y texto en el checkpoint Audio.
- Conversación full-duplex nativa: percepción continua mientras genera respuesta, con distinción entre backchannels, interrupciones, correcciones y redirecciones.
- Interacción proactiva: inicia respuestas ante eventos del flujo audiovisual sin esperar prompt del usuario.
- Delegación asíncrona: emite peticiones `<delegate>` en el stream y consume resultados de backends externos sin bloquear el diálogo (requiere el runtime Realtime-Venus-Harness del repositorio de GitHub).
- Memoria de vídeo largo sin entrenamiento adicional, con recuperación de evidencia ante consultas.
- Salida de texto y de voz nativa mediante tokens S3, decoder flow-matching y una voz de referencia.
- Capacidades multilingües limitadas a inglés y chino.
- No se documenta soporte de tool calling genérico, razonamiento multi-paso tipo agente ni modo thinking más allá del mecanismo de delegación.

## Casos de uso

- Asistentes de atención al cliente por voz: el modelo mantiene el canal de escucha activo mientras habla, de modo que puede detectar una corrección del usuario a mitad de respuesta y redirigir el turno sin cortar la conversación.
- Soporte remoto con vídeo en directo: con SigLIP2 y Whisper-Medium procesando flujos alineados, el modelo puede observar lo que el usuario muestra por cámara y comentar o alertar de forma proactiva cuando detecta un evento relevante.
- Moderación y monitorización de reuniones: la memoria de vídeo largo permite archivar momentos informativos y responder después a preguntas sobre lo ocurrido, sin reentrenamiento.
- Agentes con herramientas externas: las peticiones `<delegate>` permiten lanzar consultas a backends (búsqueda, APIs internas) mientras la conversación sigue; encaja en asistentes que no pueden permitirse pausas perceptibles.
- Kioscos y terminales interactivos: la detección de backchannels e interrupciones reduce la sensación de turnos rígidos en interfaces de voz presenciales.
- Análisis de contenido audiovisual largo: recuperación de evidencia relevante y no redundante sobre grabaciones extensas para resúmenes o preguntas puntuales.
- Accesibilidad: descripción proactiva de escenas y audio en directo para usuarios con discapacidad visual, aprovechando la percepción continua y la salida de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las figuras del informe técnico (arXiv 2609.13814) con gráficos radar de comprensión de vídeo y audio y comparativas full-duplex de gestión de interrupciones, pero no incluye cifras numéricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada: los pesos se publican en BF16, lo que sitúa el checkpoint de 9B en torno a 18 GB solo para pesos; a ello se suman encoder visual, encoder de audio y decoder de voz, además de memoria para caché KV sobre 40.960 tokens de contexto. La cifra exacta no está disponible.
- GPU recomendadas: no disponible en la documentación; por tamaño, el modelo requiere GPUs de centro de datos (A100, H100) para inferencia en BF16 con contexto largo, y presumiblemente GPUs de 24 GB o más para cuantizaciones, aunque no se publican recetas.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo; no hay quantizaciones publicadas (GGUF, AWQ, GPTQ) en la información disponible.
- Despliegue: Transformers con código custom del repositorio; se incluyen artefactos ONNX. No se documenta soporte de vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El diseño está orientado a streaming y full-duplex, pero no se publican métricas de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Full-duplex | Licencia |
|---|---|---|---|---|---|
| Realtime-Venus (Omni) | 9B | 40.960 | vídeo, audio, texto, voz | sí | Apache 2.0 |
| Realtime-Venus (Audio) | 9B | 40.960 | audio, texto, voz | sí | Apache 2.0 |
| MiniCPM-o 4.5 (base) | no disponible | no disponible | vídeo, audio, texto, voz | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino; no hay soporte declarado de castellano ni de otras lenguas.
- La delegación asíncrona no funciona con los pesos por sí sola: requiere el runtime Realtime-Venus-Harness del repositorio de GitHub.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de robustez fuera de las figuras del informe técnico.
- El contexto de 40.960 tokens limita la ventana de vídeo/audio procesable en una sola pasada; la memoria de vídeo largo mitiga el problema pero no se detalla su coste computacional.
- No hay quantizaciones publicadas, lo que dificulta el despliegue en hardware modesto.
- El tamaño del repositorio (676,2 GB) implica una descarga y almacenamiento considerables.
- El código es custom y depende de la librería Transformers con archivos Python propios, lo que puede complicar la integración con stacks estándar de serving.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los componentes base (MiniCPM-o 4.5, Qwen3-8B, Whisper-Medium, SigLIP2) antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inclusionAI/Realtime-Venus
- Model card en chino: https://huggingface.co/inclusionAI/Realtime-Venus/blob/main/README_zh.md
- Página del proyecto: https://realtime-venus.github.io/
- Informe técnico (arXiv): https://arxiv.org/pdf/2609.13814
- Repositorio GitHub (harness y herramientas): https://github.com/inclusionAI/Realtime-Venus
- ModelScope: https://www.modelscope.cn/models/inclusionAI/Realtime-Venus
- Licencia: https://huggingface.co/inclusionAI/Realtime-Venus/blob/main/LICENSE
