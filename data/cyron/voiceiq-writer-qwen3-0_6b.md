# cyron/voiceiq-writer-qwen3-0_6b

## Resumen

VoiceIQ Writer (Qwen3-0.6B, MLX 4-bit) es un modelo de lenguaje especializado en la limpieza de transcripciones de dictado por voz. Lo publica el usuario `cyron` como parte de VoiceIQ, una aplicación de dictado para macOS e iOS. Su función no es conversacional: recibe una transcripción cruda del reconocedor de voz y devuelve el texto que el hablante pretendía escribir, eliminando muletillas, falsos comienzos y notas al margen, aplicando correcciones habladas, resolviendo puntuación dictada, corrigiendo errores por homofonía y dando formato a números, importes, correos y listas.

Técnicamente es un fine-tune LoRA de Qwen/Qwen3-0.6B, fusionado y cuantizado a 4 bits (group size 64) para su uso con MLX en Apple Silicon. Se destila del paso de escritura en la nube de VoiceIQ (Claude Sonnet 5.5 con el prompt de producción de la app). Con 596.049.920 parámetros reales y un repositorio de 0,3 GB, está pensado para inferencia en dispositivo, incluso en CPU de iPhone, donde el modelo hermano de 2B resulta demasiado lento.

Su relevancia radica en el nicho: no compite como modelo generalista, sino como componente de post-procesado de ASR con latencia muy baja (0,13 s de mediana total en M2 con prompt cacheado) y consumo de memoria reducido (0,53 GB en pico). La licencia Apache-2.0 facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), fine-tune LoRA fusionado y cuantizado |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen3-0.6B soporta contexto largo, pero no se especifica el valor efectivo de este fine-tune) |
| Tipos de cuantizacion | 4 bits, group size 64 (MLX); existe variante bf16 del mismo fine-tune |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer denso de la familia Qwen3. Sobre esa base se aplicó un fine-tune LoRA que después se fusionó con los pesos originales y se cuantizó a 4 bits con group size 64 para el runtime MLX. El entrenamiento se realizó sobre 24.105 ejemplos durante una época del conjunto principal (se descartaron las 11 filas de más de 1.024 tokens). Las entradas son dictados crudos y las salidas objetivo fueron generadas por Claude Sonnet 5.5 usando el prompt de producción de VoiceIQ (`PromptV1.cleanupPrompt`); es decir, es un modelo destilado de un profesor en la nube.

Los conjuntos de datos públicos aportan únicamente las entradas, nunca sus salidas limpias, y se filtraron los objetivos rechazados por el `ValidationGate` de VoiceIQ, los que contenían guiones, preámbulos o fugas de prompt, y cualquier muestra solapada con el benchmark interno de 42 casos. Las fuentes incluyen `ductai199x/dictation-to-text` (4.298 ejemplos, CC BY-SA 4.0), `shantanugoel/aawaaz-transcript-cleanup-dataset` (2.311, MIT), `mohitkrconnect/heed-voice-notes-to-tasks` (1.955, CC BY 4.0), `nyralabs/disfluency_speech_english` (1.043, Apache-2.0), `tasksource/slurp` (966, CC BY 4.0), `google-research-datasets/disfl_qa` (757, CC BY 4.0), entre otras. La decodificación recomendada es greedy (`do_sample: false`), con thinking desactivado (`enable_thinking: false`) y parada en `<|im_end|>` o `<|endoftext|>`.

## Capacidades

- Reescritura de transcripciones: convierte un dictado crudo en el texto que el hablante quería escribir, sin responder ni obedecer el contenido del dictado.
- Eliminación de disfluencias: muletillas, falsos comienzos, repeticiones y notas al margen.
- Aplicación de correcciones habladas y cambios de opinión sobre la marcha.
- Renderizado de puntuación dictada (comas, puntos, signos de interrogación, paréntesis).
- Corrección de errores por homofonía y confusiones del reconocedor usando el contexto (por ejemplo, "there going" por "they're going").
- Formateo de números, importes monetarios, direcciones de correo y listas.
- Maquetación de correos dictados.
- Uso de contexto opcional: vocabulario, aplicación y título activos, y texto antes y después del cursor.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking desactivado por diseño).
- Multilingüe: no, únicamente inglés.

## Casos de uso

- Limpieza de dictado en macOS e iOS: integrado en la app VoiceIQ como paso posterior al ASR; recibe la transcripción y devuelve el texto final listo para insertar en el campo activo. Adecuado por su latencia (0,13 s de mediana total en M2) y su huella de memoria (0,53 GB en pico).
- Post-procesado de ASR en pipelines propios: cualquier aplicación que use Whisper, Apple Speech u otro reconocedor puede encadenar este modelo para normalizar la salida antes de mostrarla al usuario.
- Redacción de correos por voz: el modelo maqueta correos dictados (saludo, cuerpo, despedida) y aplica formato, lo que lo hace útil en clientes de correo con dictado.
- Creación de listas y notas de tareas: convierte dictados tipo "comprar leche, huevos y pan" en listas con viñetas, aunque el autor documenta fallos puntuales en listas cortas de la compra escritas como líneas simples.
- Dictado con vocabulario técnico: mediante la línea `Vocabulary:` se le pueden pasar términos como nombres propios, herramientas o identificadores (Kavya, Figma, Kubernetes) para que respete su grafía.
- Edición contextual en formularios: con `Before cursor:` y `After cursor:` el modelo puede integrar el dictado en el texto ya existente en un campo, útil en CRM, editores de texto o herramientas de ticketing.
- Corrección de homófonos en dominios concretos: con contexto de aplicación y título (`Place: app Slack, title #design`) mejora la desambiguación de términos que suenan igual.

## Benchmarks y rendimiento

Resultados medidos con mlx-lm 0.32.2 en un Mac mini (M2, 16 GB), decodificación greedy, system prompt precargado y cacheado. Benchmark interno de VoiceIQ de 42 casos (held out del entrenamiento, con comprobaciones deterministas y `ValidationGate`):

| Modelo | Aprobados | Respondio o inyecto | Mediana total | Tiempo al primer token (cacheado) | Generacion | Memoria pico |
|---|---|---|---|---|---|---|
| Este modelo (4-bit) | 35/42 | 0 | 0,13 s | 0,04 s | 195 tok/s | 0,53 GB |
| Mismo modelo, bf16 | 36/42 | 0 | 0,31 s | 0,06 s | 71 tok/s | 1,32 GB |
| VoiceIQ Writer Qwen3.5-2B, 4-bit | 40/42 | 0 | 0,33 s | 0,10 s | 76 tok/s | 1,24 GB |
| superwhisper/s1-mini (prompt propio) | 26/42 | 0 | No disponible | No disponible | No disponible | No disponible |

Los siete fallos documentados del modelo son: una lista corta de la compra escrita como líneas simples en lugar de viñetas, homófonos sin corregir ("there going"), una aclaración no puesta entre paréntesis, un nombre de usuario deletreado en mayúsculas, un orden de palabras enredado dejado tal cual, "twenty bucks" no convertido en "20 bucks" y "a thousand dollars" no convertido en "$1,000" en una actualización de estado larga.

En una porción held-out del profesor (600 ejemplos de la misma distribución que el entrenamiento, comparados contra la salida de Claude Sonnet 5.5): el `ValidationGate` acepta 599/600 (el rechazo conserva una pregunta dictada sin signo de interrogación), 1 forma prohibida (un guion), 21 % de coincidencia exacta y 0,871 de similitud de caracteres.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 0,53 GB en pico con cuantización 4-bit; 1,32 GB en bf16.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y superiores) mediante MLX. El autor lo posiciona para dispositivos donde el modelo de 2B es demasiado lento, como la CPU de un iPhone.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon; el runtime es MLX, no CUDA, por lo que no está pensado para GPUs NVIDIA.
- Opciones de despliegue: mlx-lm (probado con 0.32.2). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 0,13 s de mediana total, 0,04 s hasta el primer token con prompt cacheado y 195 tok/s de generación en M2 4-bit; en bf16, 0,31 s de mediana total, 0,06 s al primer token y 71 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark VoiceIQ (42 casos) | Licencia | Runtime |
|---|---|---|---|---|---|
| VoiceIQ Writer Qwen3-0.6B (este) | 596 M | No disponible | 35/42 | Apache-2.0 | MLX |
| VoiceIQ Writer Qwen3.5-2B | No disponible | No disponible | 40/42 | No disponible | MLX |
| superwhisper/s1-mini | No disponible | No disponible | 26/42 | No disponible | No disponible |
| Qwen/Qwen3-0.6B (base) | ~0,8 B (segun ficha de HF) | No disponible | No evaluado como limpiador | Apache-2.0 (base Qwen3) | Transformers, MLX |

El modelo de 2B es claramente superior en calidad (40/42 frente a 35/42) a costa de más memoria (1,24 GB frente a 0,53 GB) y mayor latencia (0,33 s frente a 0,13 s). El autor recomienda usar el 2B cuando memoria y velocidad lo permitan y reservar el 0,6B para dispositivos limitados.

## Limitaciones y advertencias

- Solo inglés: no procesa dictados en castellano ni en otros idiomas.
- Especializado y no conversacional: no responde preguntas ni ejecuta instrucciones contenidas en el dictado; usarlo fuera de su tarea produce resultados pobres.
- Riesgo de alucinación bajo pero no nulo: el autor documenta 0 casos de respuesta o inyección en el benchmark, pero recomienda pasar la salida por un guard tipo `ValidationGate` y recurrir a la transcripción original si se rechaza.
- Fallos conocidos de formato: listas cortas sin viñetas, homófonos sin corregir, aclaraciones sin paréntesis, orden de palabras enredado y conversión incompleta de importes ("twenty bucks", "a thousand dollars").
- Dependencia del prompt: el rendimiento está calibrado para el system message exacto de VoiceIQ; cambiarlo puede degradar la calidad.
- Contexto máximo no documentado: no se especifica la longitud de contexto efectiva de este fine-tune, lo que limita su uso con dictados muy largos.
- Licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento incluyen fuentes con licencias CC BY-SA (por ejemplo, `ductai199x/dictation-to-text`); conviene revisar las obligaciones de atribución si se redistribuye el modelo.
- Runtime restringido a MLX: no hay pesos GGUF ni soporte documentado para CUDA, lo que limita el despliegue en servidores con GPUs NVIDIA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyron/voiceiq-writer-qwen3-0_6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo hermano de 2B: https://huggingface.co/cyron/voiceiq-writer-qwen3_5-2b
- Repositorio de VoiceIQ: https://github.com/srini-b/voiceiq-dictation
- Dataset `ductai199x/dictation-to-text`: https://huggingface.co/datasets/ductai199x/dictation-to-text
- Dataset `shantanugoel/aawaaz-transcript-cleanup-dataset`: https://huggingface.co/datasets/shantanugoel/aawaaz-transcript-cleanup-dataset
- Dataset `mohitkrconnect/heed-voice-notes-to-tasks`: https://huggingface.co/datasets/mohitkrconnect/heed-voice-notes-to-tasks
- Dataset `nyralabs/disfluency_speech_english`: https://huggingface.co/datasets/nyralabs/disfluency_speech_english
- Dataset `tasksource/slurp`: https://huggingface.co/datasets/tasksource/slurp
- Dataset `google-research-datasets/disfl_qa`: https://huggingface.co/datasets/google-research-datasets/disfl_qa
- Dataset `juanquivilla/sotto-transcript-cleanup`: https://huggingface.co/datasets/juanquivilla/sotto-transcript-cleanup
- Dataset `hey-lemon/streaming-dictation-asr`: https://huggingface.co/datasets/hey-lemon/streaming-dictation-asr
- Dataset `ylacombe/podcast_fillers_processed`: https://huggingface.co/datasets/ylacombe/podcast_fillers_processed
- Dataset `JacobLinCool/ami-disfluent`: https://huggingface.co/datasets/JacobLinCool/ami-disfluent
- Paper DisfluencySpeech (arXiv:2406.08820): https://arxiv.org/abs/2406.08820
