# alejandro-hp/AlephTTS

## Resumen

AlephTTS es un modelo de síntesis de voz (text-to-speech) en inglés que reproduce la voz de Aleph One-Half, un streamer de Twitch. Se trata de un fine-tune de VoxCPM2, el modelo de OpenBMB de 2B parámetros con salida a 48 kHz, entrenado sobre aproximadamente 47 minutos de grabaciones del propio dueño de la voz. La voz queda embebida en los pesos, de modo que no se necesita audio de referencia en el momento de la inferencia, lo que simplifica enormemente el despliegue en producción.

El modelo resuelve el problema clásico de la clonación de voz con modelos zero-shot: en lugar de depender de un clip de referencia para cada generación (con la variabilidad y la latencia que eso conlleva), AlephTTS fija un único hablante y ofrece resultados reproducibles y rápidos con una ventana de contexto de audio ya aprendida. Es relevante ahora porque demuestra que un ajuste LoRA de rango 32 sobre un TTS de 2B puede alcanzar una calidad cercana a la grabación real (similitud de hablante 0,73–0,76 frente a 0,77 real-vs-real) con menos de una hora de datos y un hardware de consumo.

La arquitectura subyacente combina un modelo de lenguaje con un transformer de difusión para la generación de audio, e incluye un códec de audio (audiovae.pth) que se mantiene sin cambios respecto al modelo base. El resultado es un checkpoint bf16 de unos 4,6 GB con licencia Apache-2.0, orientado a usos claramente etiquetados como sintéticos y al contenido del propio creador de la voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoxCPM2: modelo de lenguaje + transformer de difusion para TTS, con codec de audio VAE (audiovae.pth) |
| Parametros totales | 2.290.004.544 (~2,29B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | Ingles (variante americana) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, ~4,6 GB) + audiovae.pth (codec base sin cambios) |

## Arquitectura y entrenamiento

AlephTTS hereda la arquitectura de VoxCPM2: un modelo de lenguaje que modela la secuencia de tokens de audio y un transformer de difusión que refina la generación, apoyados en un códec de audio VAE que produce la forma de onda final a 48 kHz mono. El ajuste se realizó mediante LoRA de rango 32 y alpha 32 aplicado a las proyecciones de atención tanto del LM como del transformer de difusión, y posteriormente fusionado (merged) en los pesos base, de modo que el checkpoint distribuido contiene ya la adaptación integrada y no requiere cargar adaptadores adicionales.

El entrenamiento utilizó el código oficial de VoxCPM adaptado para caber en una GPU de 8 GB (pesos base congelados en bf16 y gradient checkpointing), con learning rate 1e-4, batch efectivo de 16 y 3000 pasos (unas 57 épocas). Los datos consisten en 854 clips (~47 minutos) grabados con un Shure MV7+ a 48 kHz/24 bits: frases de lectura fonéticamente equilibradas (prompts CMU ARCTIC), líneas conversacionales y de estilo stream (saludos, reacciones, hype, calma), explicaciones matemáticas y frases con el nombre de usuario. Las tomas se filtraron con transcripción automática y se descartaron las que contenían vacilaciones a mitad de frase para favorecer una dicción fluida. El checkpoint final se seleccionó mediante pruebas de escucha a ciegas.

## Capacidades

- Síntesis de voz en inglés americano con una única voz incorporada en los pesos, sin necesidad de audio de referencia.
- Salida de audio a 48 kHz mono, con calidad adecuada para narración y alertas de stream.
- Generación por streaming: el primer fragmento de audio llega en menos de 0,1 s.
- Control de la expresividad mediante puntuación (comas y puntos añaden pausas, "!" añade energía) y mediante los parámetros `cfg_value` e `inference_timesteps`.
- Normalización de números y expresiones matemáticas (lectura en palabras) mediante `normalize=True`.
- Generación reproducible con `seed=N` (requiere una versión de voxcpm posterior a 2.0.3).
- No soporta tool calling, function calling, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente TTS de un solo hablante.

## Casos de uso

- Alertas y notificaciones de stream: el modelo genera frases cortas como agradecimientos por follows o suscripciones con la voz del creador, integrándose en el software de streaming mediante la API de Python y aprovechando la baja latencia del streaming (primer chunk en menos de 0,1 s).
- Narración de contenido propio: el creador puede generar locuciones para vídeos, resúmenes o clips sin grabar cada frase, manteniendo coherencia de voz gracias a que el hablante está fijado en los pesos.
- Investigación en clonación de voz: sirve como caso de estudio reproducible de fine-tune LoRA sobre un TTS de 2B con menos de una hora de datos, útil para comparar metodologías de adaptación de hablante.
- Pruebas de accesibilidad y prototipado de interfaces de voz: permite generar avisos y respuestas habladas en inglés para demos de asistentes o aplicaciones, con la ventaja de no requerir gestión de clips de referencia.
- Evaluación de pipelines TTS en hardware de consumo: con ~5,6–5,8 GB de VRAM y un factor de tiempo real de ~0,74 en una RTX 3070 Ti, es adecuado para validar despliegues en estaciones de trabajo modestas antes de escalar.
- Generación de material sintético claramente etiquetado para estudios de percepción auditiva o de detección de audio generado por IA, dado que el autor declara consentimiento explícito sobre la voz.

## Benchmarks y rendimiento

| Metrica | Resultado | Referencia |
|---|---|---|
| Prueba de escucha a ciegas (escala 1–5, 10 frases) | 5,0 | Empatado con grabaciones reales |
| Word error rate (Whisper large-v3, 24 frases, incluidas no vistas) | 0% | — |
| Similitud de hablante (ECAPA-TDNN) frente a grabaciones reales reservadas | 0,73–0,76 | Real-vs-real: 0,77 |
| VRAM en RTX 3070 Ti | ~5,8 GB (~5,6 GB con `optimize=False`) | — |
| Factor de tiempo real en RTX 3070 Ti | ~0,74 | — |
| Primer fragmento en streaming | < 0,1 s | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no ser un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada: ~5,8 GB en inferencia con la configuración por defecto; ~5,6 GB con `optimize=False` (sin `torch.compile`/CUDA graphs), según medición del autor en una RTX 3070 Ti.
- GPU recomendadas: RTX 3070 Ti o superior para uso cómodo; tarjetas de 8 GB comparten memoria con navegador, juego u OBS, por lo que conviene `optimize=False`. GPU de datacenter (A100, H100) no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB como la RTX 3070 Ti; el modelo base ocupa ~4,6 GB en bf16.
- Opciones de despliegue: librería `voxcpm` (Python 3.10–3.12, PyTorch >= 2.5) con `VoxCPM.from_pretrained`; soporta generación completa (`generate`) y streaming (`generate_streaming`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: factor de tiempo real ~0,74 en RTX 3070 Ti (es decir, genera audio más rápido que tiempo real); primer chunk de streaming en menos de 0,1 s. La primera llamada a `generate` tras cargar el modelo incluye un calentamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| AlephTTS | ~2,29B | No disponible | Ingles | Apache-2.0 | Fine-tune LoRA de un solo hablante sobre VoxCPM2, 48 kHz, voz incorporada |
| VoxCPM2 (openbmb) | ~2B | No disponible | No disponible en la informacion | Apache-2.0 | Modelo base; TTS general, 48 kHz, requiere referencia para clonar voz |
| Alternativas zero-shot de clonacion de voz | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada |

La comparación con otros modelos de la misma categoría (TTS de clonación zero-shot como XTTS, Bark o F5-TTS) no está disponible en la información proporcionada; no se aportan cifras para evitar datos no verificados.

## Limitaciones y advertencias

- Solo inglés americano; no soporta otros idiomas.
- Entrenado con menos de una hora de un único hablante: palabras inusuales, nombres propios o símbolos pueden pronunciarse mal.
- Emociones extremas más allá de los estilos grabados (saludos, reacciones, hype, calma) pueden sonar menos naturales.
- Hereda las limitaciones de VoxCPM2.
- Riesgo de alucinación acústica y de artefactos en textos largos; se recomienda generar frase por frase.
- Uso previsto restringido al contenido del propio dueño de la voz y a investigación con salidas claramente etiquetadas como sintéticas; queda prohibida la suplantación, el engaño sobre quién habla, el fraude y el acoso.
- Aunque la licencia es Apache-2.0, el uso comercial de la voz requiere respetar la política de contenido de Hugging Face y la legislación aplicable; debe etiquetarse el audio generado por IA.
- El consentimiento del hablante cubre la publicación del modelo bajo los términos descritos, no un uso indiscriminado de su identidad.
- `seed=N` para reproducibilidad exige una versión de voxcpm posterior a 2.0.3.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alejandro-hp/AlephTTS
- Modelo base VoxCPM2: https://huggingface.co/openbmb/VoxCPM2
- Paper de referencia (arXiv:2509.24650): https://arxiv.org/abs/2509.24650
- Politica de contenido de Hugging Face: https://huggingface.co/content-policy
