# HNMDAH/dawwen-live-voxtral-arabic-4bit

## Resumen

Dawwen Live Voxtral Arabic 4-bit es una conversión cuantizada a 4 bits en formato MLX del modelo de reconocimiento de voz mistralai/Voxtral-Mini-4B-Realtime-Arabic, publicada por el usuario HNMDAH. Su objetivo es permitir transcripción en tiempo real y en local sobre hardware de Apple Silicon (chips de la serie M), sirviendo como motor de voz de la función Dawwen Live de la aplicación Dawwen para macOS. El modelo conserva la arquitectura original Voxtral Realtime de Mistral AI, con 4.429.679.360 parámetros totales, y se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha radica en que aborda un caso poco cubierto: ASR en streaming para árabe con cambios de código árabe-inglés, ejecutado en un portátil sin GPU dedicada. Frente a alternativas generalistas como Whisper large-v3 turbo o Qwen3-ASR, el autor reporta una tasa de error de palabra (WER) notablemente menor en su conjunto de evaluación, a costa de un ámbito de idiomas mucho más restringido (solo árabe e inglés).

No se trata de un modelo entrenado desde cero ni de un ajuste fino: es una cuantización de pesos (grupo de 64) con capas de normalización y proyección mantenidas en bf16 para compatibilidad con el cargador mlx-audio-swift. El repositorio ocupa aproximadamente 2,6 GB y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Voxtral Realtime (modelo de voz-a-texto en streaming; detalles internos de la arquitectura original no disponibles en la informacion proporcionada) |
| Parametros totales | 4.429.679.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64 (MLX); capas norm, ada_rms_norm, conv_layers y audio_language_projection en bf16 |
| Idiomas soportados | arabe (ar), ingles (en), con soporte de code-switching entre ambos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), tamano de repo ~2,6 GB |

## Arquitectura y entrenamiento

El modelo es una conversión de pesos del original mistralai/Voxtral-Mini-4B-Realtime-Arabic, un modelo de reconocimiento de voz en tiempo real de Mistral AI con 4.429.679.360 parámetros. La conversión aplica cuantización de 4 bits con tamaño de grupo 64 mediante MLX, manteniendo en bf16 las capas de normalización (`norm`, `ada_rms_norm`), las capas convolucionales (`conv_layers`) y la proyección audio-lenguaje (`audio_language_projection`), requisito del cargador mlx-audio-swift. No se realizó ningún ajuste fino adicional sobre el modelo base.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni innovaciones técnicas internas del modelo original más allá de su naturaleza de streaming. La model card únicamente documenta el proceso de cuantización y la evaluación de precisión realizada por el autor.

## Capacidades

- Reconocimiento de voz en streaming (transcripción incremental con latencia configurable).
- Transcripción de audio en árabe e inglés, incluyendo alternancia de idiomas dentro de una misma frase (code-switching).
- Inferencia en local sobre Apple Silicon mediante la librería MLX.
- Sesiones de streaming con control de retardo de transcripción (`transcriptionDelayMs`, por defecto 480 ms en el ejemplo de uso) y límite de tokens (`maxTokens`).
- Entrada de audio a 16 kHz mono en formato Float.
- No se documentan capacidades de traducción, diarización de hablantes, tool calling ni razonamiento multimodal más allá del reconocimiento de voz.

## Casos de uso

- Transcripción en directo de reuniones bilingües árabe-inglés en un Mac: el modelo procesa audio en streaming con 480 ms de retardo y mantiene la coherencia ante cambios de idioma dentro de la conversación, algo que los modelos generalistas evaluados por el autor no manejan bien.
- Subtitulado en tiempo real de contenido audiovisual en árabe: la naturaleza de streaming permite generar subtítulos incrementales sin esperar al final del audio, adecuado para retransmisiones o vídeos largos.
- Dictado por voz en aplicaciones de escritorio para macOS: al ejecutarse sobre MLX en hardware Apple, no requiere enviar audio a la nube, lo que reduce latencia y mejora la privacidad.
- Asistentes de voz locales en árabe: la transcripción en el dispositivo puede alimentar un pipeline posterior de comprensión o generación sin depender de conectividad.
- Documentación clínica o legal dictada en árabe con términos técnicos en inglés: el soporte de code-switching evita errores frecuentes cuando el vocabulario profesional aparece en inglés dentro de una frase árabe.
- Investigación en ASR multilingüe: sirve como referencia cuantizada para comparar el rendimiento de Voxtral Realtime frente a otros sistemas en condiciones de cómputo limitado, con una WER medida del 22,0 % en el conjunto de evaluación del autor.
- Prototipado rápido de aplicaciones de voz en Swift: la integración con mlx-audio-swift permite crear una sesión de transcripción con pocas líneas de código.

## Benchmarks y rendimiento

El autor reporta una evaluación sobre 300 clips de audio árabe-inglés con code-switching (45 minutos, conjunto Perle-ai/ASR_Code_Switch), ejecutada en un Apple M4 Pro:

| Modelo | WER |
|---|---|
| Este modelo (streaming, 4 bits MLX) | 22,0 % |
| Whisper large-v3 turbo | 42,2 % |
| Qwen3-ASR 1.7B | 44,4 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio pesa ~2,6 GB, por lo que se necesita al menos esa cantidad de memoria unificada libre, más el espacio de trabajo de inferencia (no cuantificado en la información disponible).
- Hardware objetivo: Apple Silicon; el autor reporta mediciones en un M4 Pro. No se documenta soporte para GPU NVIDIA, AMD ni CPU x86.
- Cabe en equipos consumer de Apple con memoria unificada suficiente (Mac con chip M-series); no aplica a GPU de consumo tipo RTX.
- Despliegue: librería MLX y cargador mlx-audio-swift; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato.
- Latencia: retardo de transcripción configurable, con 480 ms en el ejemplo de la model card. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | WER (evaluacion del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Dawwen Live Voxtral Arabic 4-bit | 4,43 B | ar, en | no disponible | 22,0 % | Apache 2.0 | Hugging Face (MLX) |
| Whisper large-v3 turbo | no disponible en la informacion | multilingue | no disponible | 42,2 % | no disponible en la informacion | amplia |
| Qwen3-ASR 1.7B | 1,7 B | no disponible en la informacion | no disponible | 44,4 % | no disponible en la informacion | Hugging Face |
| mistralai/Voxtral-Mini-4B-Realtime-Arabic (base) | 4,43 B | ar, en | no disponible | no disponible | Apache 2.0 | Hugging Face |

La comparación se limita al conjunto de evaluación del autor y no debe extrapolarse a otros dominios o acentos.

## Limitaciones y advertencias

- Ámbito lingüístico restringido a árabe e inglés; no apto para otros idiomas sin evaluación previa.
- La evaluación se realizó sobre un único conjunto de 300 clips con acento saudí y code-switching; el rendimiento en otros dialectos árabes (magrebí, egipcio, levantino) no está documentado.
- WER del 22,0 % implica una tasa de error considerable para producción en dominios sensibles (médico, legal) sin revisión humana.
- Al ser una cuantización a 4 bits, puede existir una degradación respecto al modelo base, aunque el autor no publica la comparación directa.
- Solo funciona en el ecosistema MLX/Apple Silicon; no hay pesos GGUF ni compatibilidad con stacks de inferencia estándar en GPU.
- Riesgo de alucinación en pasajes de audio con ruido, silencios largos o solapamiento de hablantes; la model card recomienda iniciar una nueva sesión en cada pausa para mejorar la precisión.
- No se documentan sesgos específicos, pero al derivar de un modelo entrenado con datos no descritos, pueden heredarse sesgos del corpus original.
- Licencia Apache 2.0 permite uso comercial, pero al ser una obra modificada conviene conservar el aviso de licencia y atribuir al modelo original de Mistral AI.
- Repositorio sin descargas ni validación comunitaria en el momento de la ficha; tratar como artefacto de un único autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HNMDAH/dawwen-live-voxtral-arabic-4bit
- Modelo base: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-Arabic
- Cargador mlx-audio-swift: https://github.com/Neywa-Labs/mlx-audio-swift
- Conjunto de evaluación: Perle-ai/ASR_Code_Switch (referenciado en la model card; no se proporciona URL directa)
