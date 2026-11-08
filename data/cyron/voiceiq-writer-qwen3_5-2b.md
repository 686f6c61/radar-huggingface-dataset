# cyron/voiceiq-writer-qwen3_5-2b

## Resumen

VoiceIQ Writer es un ajuste fino por LoRA del modelo Qwen3.5-2B de Alibaba Cloud, desarrollado por el usuario cyron como componente de escritura local de VoiceIQ, una aplicación de dictado para macOS e iOS. Su función no es conversacional en sentido amplio: transforma una transcripción cruda del reconocedor de voz en el texto que el hablante pretendía escribir, eliminando muletillas, falsos arranques y notas al margen, aplicando correcciones habladas, resolviendo puntuación dictada, corrigiendo errores por homofonía y dando formato a números, importes, correos y listas.

El modelo parte de la arquitectura de Qwen3.5-2B (2B parámetros), se fusiona el adaptador LoRA y se cuantiza a 4 bits con tamaño de grupo 64 para su ejecución en MLX sobre Apple Silicon. Los objetivos de entrenamiento se destilaron de Claude Sonnet 5.5 usando el prompt de producción de VoiceIQ, lo que convierte al modelo en un destilado de un profesor mayor hacia un estudiante de 2B ejecutable en dispositivo.

Es relevante porque demuestra que una tarea de post-procesado de dictado puede resolverse con un modelo de 1.880 millones de parámetros que ocupa 1,1 GB y consume 1,24 GB de memoria pico en un Mac mini M2 de 16 GB, con 40/42 casos superados en el benchmark interno del autor frente a 18/42 del modelo base sin ajustar. La licencia es Apache-2.0 y los pesos están en formato safetensors para MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-2B), ajuste fino LoRA fusionado |
| Parametros totales | 1.881.825.088 (≈1,88 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64 (MLX); existe variante bf16 de referencia |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería mlx) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Qwen3.5-2B, sobre el que se aplicó un ajuste fino LoRA posteriormente fusionado en los pesos base y cuantizado a 4 bits con group size 64 para MLX. La inferencia recomendada usa decodificación greedy con el modo de razonamiento desactivado (`enable_thinking: false`) y el mensaje de sistema precalculado y cacheado, lo que reduce el tiempo hasta el primer token a 0,10 s.

El entrenamiento utilizó 13.262 ejemplos: 10.000 muestreados del conjunto principal de 24.105 y 3.262 dirigidos a las reglas que un primer modelo seguía incumpliendo. Las entradas son dictados crudos y cada objetivo fue escrito por Claude Sonnet 5.5 con el prompt de producción de VoiceIQ (`PromptV1.cleanupPrompt`); los datasets públicos aportan únicamente las entradas, nunca sus salidas limpias. Se descartaron objetivos rechazados por el `ValidationGate` de VoiceIQ, objetivos con guiones, preámbulos o fugas de prompt, y cualquier ejemplo solapado con los 42 casos del benchmark reservado. Las fuentes incluyen ductai199x/dictation-to-text (1.775 ejemplos), shantanugoel/aawaaz-transcript-cleanup-dataset (970), mohitkrconnect/heed-voice-notes-to-tasks (802), nyralabs/disfluency_speech_english (433), tasksource/slurp (407), google-research-datasets/disfl_qa (298), juanquivilla/sotto-transcript-cleanup (306), hey-lemon/streaming-dictation-asr (152), ylacombe/podcast_fillers_processed (202), JacobLinCool/ami-disfluent (201), deepset/prompt-injections (62), además de 4.392 dictados sintéticos de Claude Sonnet 5.5 y 3.262 dictados sintéticos de Claude Haiku 5.5 para reglas débiles.

## Capacidades

- Limpieza de transcripciones de dictado: elimina muletillas, falsos arranques y notas al margen.
- Aplicación de correcciones habladas y cambios de opinión expresados en el dictado.
- Renderizado de puntuación dictada (comas, puntos, signos de interrogación, paréntesis).
- Corrección de errores por homofonía usando el contexto de la frase.
- Formateo de números, importes monetarios, direcciones de correo y listas.
- Maquetación de correos electrónicos dictados.
- Uso de contexto opcional: vocabulario, lugar (aplicación y título), y texto antes y después del cursor.
- Restricción explícita de comportamiento: no responde ni sigue las instrucciones contenidas en la transcripción; solo reescribe.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de visión, audio ni modo de razonamiento activable (se recomienda desactivarlo).
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Dictado en macOS e iOS dentro de la aplicación VoiceIQ: el modelo recibe la salida cruda del reconocedor de voz y devuelve el texto limpio que se inserta en el campo activo, con 0,33 s de mediana total y 76 tok/s en un Mac mini M2.
- Redacción de correos por voz: a partir de un dictado desordenado, produce un correo con saludo, cuerpo y formato correctos, aplicando los cambios de opinión expresados durante el dictado.
- Entrada de notas de reunión: convierte transcripciones con muletillas y frases inacabadas en listas de tareas o puntos clave, usando el contexto de lugar para dirigir el formato.
- Formularios y campos estructurados: con las líneas `Before cursor` y `After cursor` puede insertar texto coherente con el contenido ya presente en el campo, útil en CRM o editores de texto.
- Corrección de nombres propios y jerga técnica: mediante la línea `Vocabulary` se le indican términos como Kavya, Figma o Kubernetes para que resuelva homofonías del reconocedor.
- Normalización de importes y datos: convierte cifras dictadas oralmente en formato numérico y direcciones de correo en cadenas válidas, adecuado para herramientas de facturación o correo.
- Integración en pipelines de post-procesado ASR: cualquier aplicación que reciba transcripciones puede usar el modelo como paso de limpieza antes de almacenar o enviar el texto, con la precaución de aplicar un guard como `ValidationGate` y recurrir a la transcripción original si la validación falla.

## Benchmarks y rendimiento

Resultados medidos con mlx-lm 0.32.2 en un Mac mini (M2, 16 GB), decodificación greedy y prompt de sistema precargado y cacheado, sobre el benchmark interno de 42 casos de VoiceIQ (reservado del entrenamiento, con comprobaciones deterministas y `ValidationGate`):

| Modelo | Superados | Respondió o inyectó | Mediana total | TTFT cacheado | Generación | Memoria pico |
|---|---|---|---|---|---|---|
| Este modelo (4-bit) | 40/42 | 0 | 0,33 s | 0,10 s | 76 tok/s | 1,24 GB |
| Mismo modelo, bf16 | 39/42 | 0 | 0,89 s | 0,16 s | 24 tok/s | 3,91 GB |
| VoiceIQ Writer Qwen3-0.6B, 4-bit | 35/42 | 0 | 0,13 s | 0,04 s | 195 tok/s | 0,53 GB |
| superwhisper/s1-mini (prompt propio) | 26/42 | 0 | no disponible | no disponible | no disponible | no disponible |
| Qwen3.5-2B sin ajustar, prompt de producción completo | 18/42 | 1 | no disponible | no disponible | no disponible | no disponible |

Los dos fallos del modelo son una lista corta de compra escrita como líneas simples en lugar de viñetas y un orden de palabras enredado que se dejó tal como se dictó.

En la porción reservada del profesor (600 ejemplos de la misma distribución que el entrenamiento, comparados con la salida de Claude Sonnet 5.5): `ValidationGate` acepta 599/600 (el rechazo conserva una pregunta dictada sin signo de interrogación), sin formas prohibidas, 22 % de coincidencia exacta y 0,874 de similitud de caracteres. En una segunda porción de 140 casos difíciles (listas cortas, paréntesis, homófonos, identificadores deletreados, orden de palabras, dinero, cambios de opinión): 140/140 aceptados, 44 % de coincidencia exacta y 0,957 de similitud.

## Requisitos de hardware

- Memoria pico en inferencia 4-bit: 1,24 GB (medido en Mac mini M2 de 16 GB).
- Memoria pico en bf16: 3,91 GB.
- Tamaño del repositorio: 1,1 GB.
- Cabe holgadamente en cualquier Mac con Apple Silicon y 8 GB o más de memoria unificada; el autor lo validó en un M2 de 16 GB.
- Requiere MLX (librería `mlx`, probado con mlx-lm 0.32.2); no está pensado para CUDA ni para GPUs NVIDIA como A100, H100 o RTX 4090, ya que los pesos publicados son MLX de 4 bits.
- Throughput medido: 76 tok/s en 4-bit y 24 tok/s en bf16 sobre M2.
- Tiempo hasta el primer token con prompt cacheado: 0,10 s en 4-bit y 0,16 s en bf16.
- Opciones de despliegue: mlx-lm en local; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmark VoiceIQ (42 casos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoiceIQ Writer Qwen3.5-2B (este) | 1,88 B | no disponible | 40/42 | Apache-2.0 | Hugging Face, formato MLX 4-bit |
| VoiceIQ Writer Qwen3-0.6B 4-bit | no disponible (≈0,6 B por nombre) | no disponible | 35/42 | no disponible | Referenciado en la model card |
| superwhisper/s1-mini | no disponible | no disponible | 26/42 (con su propio prompt) | no disponible | Referenciado en la model card |
| Qwen3.5-2B sin ajustar | 2 B (por nombre) | no disponible | 18/42 | no disponible | Hugging Face (Qwen/Qwen3.5-2B) |

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en inglés; no se documenta soporte de otros idiomas.
- Especializado exclusivamente en limpieza de dictado: no es un modelo conversacional ni apto para generación abierta, razonamiento general o código.
- Riesgo de responder o seguir instrucciones contenidas en la transcripción: el autor recomienda pasar la salida por un guard como `ValidationGate` y recurrir a la transcripción original si se rechaza.
- Dos fallos conocidos en el benchmark interno: listas cortas sin viñetas y orden de palabras dictado que no se reordena.
- El modo de razonamiento debe permanecer desactivado (`enable_thinking: false`); no se documenta su comportamiento con thinking activo.
- Los objetivos de entrenamiento provienen de Claude Sonnet 5.5, por lo que el modelo hereda sus sesgos de estilo y de formato.
- La model card plantea dudas sobre si las cláusulas share-alike de CC BY-SA afectan a un modelo entrenado solo con esas entradas; conviene revisarlo antes de un uso comercial a gran escala pese a la licencia Apache-2.0.
- No se documenta la longitud de contexto soportada; dictados muy largos podrían truncarse.
- Solo hay pesos MLX 4-bit publicados; el despliegue en GPUs NVIDIA requeriría conversión no documentada.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyron/voiceiq-writer-qwen3_5-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de VoiceIQ: https://github.com/srini-b/voiceiq-dictation
- Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/compute/models/qwen3_5_2b
- Dataset ductai199x/dictation-to-text: https://huggingface.co/datasets/ductai199x/dictation-to-text
- Dataset shantanugoel/aawaaz-transcript-cleanup-dataset: https://huggingface.co/datasets/shantanugoel/aawaaz-transcript-cleanup-dataset
- Dataset mohitkrconnect/heed-voice-notes-to-tasks: https://huggingface.co/datasets/mohitkrconnect/heed-voice-notes-to-tasks
- Dataset nyralabs/disfluency_speech_english: https://huggingface.co/datasets/nyralabs/disfluency_speech_english
- Dataset tasksource/slurp: https://huggingface.co/datasets/tasksource/slurp
- Dataset google-research-datasets/disfl_qa: https://huggingface.co/datasets/google-research-datasets/disfl_qa
- Dataset juanquivilla/sotto-transcript-cleanup: https://huggingface.co/datasets/juanquivilla/sotto-transcript-cleanup
- Dataset hey-lemon/streaming-dictation-asr: https://huggingface.co/datasets/hey-lemon/streaming-dictation-asr
- Dataset ylacombe/podcast_fillers_processed: https://huggingface.co/datasets/ylacombe/podcast_fillers_processed
- Dataset JacobLinCool/ami-disfluent: https://huggingface.co/datasets/JacobLinCool/ami-disfluent
- Dataset deepset/prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections
- Paper DisfluencySpeech (arXiv:2406.08820): https://arxiv.org/abs/2406.08820
