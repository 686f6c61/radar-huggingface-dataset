# Muesli-HQ/lfm3-1.7b-muesli-cleanup-v15-bf16

## Resumen

lfm3-1.7b-muesli-cleanup-v15-bf16 es un ajuste fino completo del modelo base LiquidAI/LFM3-1.7B, publicado por Muesli-HQ, el equipo detrás de la aplicación de dictado para macOS Muesli. No es un modelo de propósito general: es un modelo especializado en la limpieza de transcripciones de voz a texto (ASR). Recibe la salida cruda de un reconocedor de voz, junto con contexto opcional de la pantalla (aplicación enfocada, texto seleccionado, OCR), y devuelve el texto tal y como el hablante lo habría escrito.

El modelo resuelve un problema muy concreto en el flujo de dictado: los transcriptores cometen errores de reconocimiento, incluyen muletillas, no aplican autocorrecciones habladas ("diez peticiones por minuto, mejor cinco" pasa a "5 peticiones por minuto") ni formatean listas, correos o cifras como se espera en un documento escrito. Con 1.728.801.536 parámetros y una ventana de contexto de 2.048 tokens en entrenamiento, está pensado para ejecutarse en local, en el propio dispositivo, con una latencia muy baja.

Su relevancia actual radica en que demuestra que un modelo de 1,7B puede superar en una tarea de postprocesado de ASR a alternativas más grandes de la familia Qwen, con una tasa de error de palabra (WER) del 1,02 % en su conjunto de evaluación interno, y con una licencia que permite uso comercial gratuito solo a organizaciones por debajo de los 10 millones de dólares de facturación anual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LFM3 de LiquidAI, con código propio `custom_code`) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens (longitud máxima usada en entrenamiento); no se documenta una ventana mayor en inferencia |
| Tipos de cuantizacion | Pesos publicados en bf16; existe una variante MLX de 8 bits (`Muesli-HQ/lfm3-1.7b-muesli-cleanup-v15-mlx-8bit`) |
| Idiomas soportados | Inglés únicamente |
| Licencia | LFM Open License v1.0 (`lfm1.0`); uso comercial gratuito solo para organizaciones con ingresos anuales inferiores a 10 M USD |
| Formato de pesos | safetensors (bf16, 3,2 GB); repo de 3,5 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del LFM3 de LiquidAI, un transformer decoder-only de 1,7B parámetros que requiere `trust_remote_code=True` en transformers 5.20 para cargar el código propio de LiquidAI. Sobre esa base se realizó un ajuste fino completo de todos los pesos (no LoRA ni adaptadores): pesos maestros en fp32, optimizador AdamW, tasa de aprendizaje 1e-5 con 200 pasos de calentamiento, tamaño de lote efectivo 16, longitud máxima 2.048 y cálculo de la pérdida solo sobre la respuesta. Una época equivale a 10.647 pasos en una única A100, con un tiempo de 4,2 horas y una pérdida final de evaluación de 0,137.

Los datos de entrenamiento, denominados blend-v15, suman 170.350 pares de limpieza que cubren correo electrónico, chat, documentos, prompts para agentes de IA, código, hojas de cálculo y presentaciones, cajas de búsqueda y dictados largos. Los pares fueron generados por modelos abiertos en Fireworks (DeepSeek, MiniMax) y por Claude, y verificados por jueces de una familia distinta (GLM 5.3, Kimi K3/K3.1). Respecto a la versión anterior (blend-v14), se reescribieron y reverificaron unos 18.000 objetivos y se añadieron 15.354 filas nuevas para reglas como listas en correos y prompts, maquetación de correos, párrafos en dictados largos, autocorrecciones implícitas y formatos de moneda, identificadores, teléfonos y términos técnicos. No se usó ningún clip ni texto del benchmark Voice Arena para el entrenamiento. No se menciona uso de RLHF ni DPO.

## Capacidades

- Limpieza de transcripciones ASR: corrige errores claros de reconocimiento y elimina muletillas ("um", "uh", "like") sin parafrasear ni reescribir el contenido.
- Aplicación de autocorrecciones habladas, tanto explícitas ("scratch that") como implícitas ("ten requests a minute, make that five" pasa a "5 requests per minute").
- Formateo de correos electrónicos: línea de saludo, párrafos y despedida.
- Conversión de enumeraciones de tres o más elementos en listas con viñetas o numeradas en notas, correos, prompts de IA y chats de trabajo, manteniendo los mensajes personales en prosa.
- Escritura de cifras, importes, identificadores, teléfonos y términos técnicos con el formato mecanografiado ("PR #4821", "$2,400", "(312) 555-0147", "v5").
- Uso de contexto de pantalla opcional (aplicación enfocada, campo de documento, texto OCR) para resolver errores evidentes, nombres, acrónimos e intención de formato, sin copiar ese contexto a la salida.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio de forma nativa; es exclusivamente un postprocesador de texto.

## Casos de uso

- Dictado en macOS: integración en la aplicación Muesli para convertir la salida cruda de Parakeet en texto listo para pegar en cualquier campo de texto, con una latencia de aproximadamente 1,04 segundos por petición en un Apple M5 con la variante MLX de 8 bits.
- Redacción de correos por voz: el modelo detecta la intención de correo y aplica saludo, párrafos y despedida, además de convertir tareas enumeradas en listas, lo que evita al usuario reescribir el mensaje después de dictarlo.
- Prompts para asistentes de IA dictados: convierte una enumeración hablada de requisitos en una lista estructurada dentro del prompt, manteniendo la formulación original del hablante.
- Notas de reunión y documentos largos: con un máximo de 1.024 tokens nuevos y prompts de unos 550 tokens, gestiona dictados largos y aplica párrafos y aperturas discursivas conservadas.
- Chats de trabajo (Slack, Teams): formatea listas de tareas y corrige términos técnicos e identificadores de tickets o incidencias, manteniendo el tono conversacional.
- Cajas de búsqueda y campos cortos: limpia consultas dictadas de forma rápida, corrigiendo errores obvios de ASR sin añadir texto adicional, gracias a la instrucción de no modificar el texto si ya es correcto.
- Transcripción de código y términos técnicos: repara errores de reconocimiento en nombres de variables, versiones ("v5") y referencias a pull requests ("PR #4821"), útil en flujos de desarrollo por voz.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos con la variante MLX de 8 bits y una petición a la vez:

| Modelo | v15 held-out (258): WER % / exact % | Mediana s/fila | Voice Arena (151 clips): ZER % / AMEND % |
|---|---|---|---|
| Este modelo (v15) | 1,02 / 47,7 | 1,04 | 67,5 / 0,61 |
| Qwen3.5 2B v14 (release anterior) | 3,38 / 19,0 | 1,53 | 64,2 / 0,92 |
| Qwen3.5 0,8B v14 (release anterior) | 4,00 / 17,8 | 0,71 | 57,6 / 1,42 |
| ASR crudo, sin limpieza | no disponible | no disponible | 54,3 / 1,23 |

Notas sobre la medición: el conjunto v15 held-out consta de 258 filas de 11 categorías, escritas por Kimi K3.1 Pro, aceptadas por GLM 5.3 y filtradas por una revisión estricta de Claude (258 de 417); no son dictados reales de usuarios. El Voice Arena Dictation Bench usa solo la partición pública (151 de 761 clips) con transcripciones de Parakeet y un único juez Claude Opus 5.5, no la mayoría 3 de 5 del leaderboard; los intervalos de confianza al 95 % agrupados por hablante son de aproximadamente ±7 puntos de ZER. La velocidad se midió en MLX Swift de 8 bits sobre un Apple M5 con prompts de unos 550 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 5-6 GB para prompts de 2.048 tokens. La variante MLX de 8 bits reduce los pesos a alrededor de 1,8 GB.
- GPU recomendadas: una A100 fue suficiente para el ajuste fino completo en 4,2 horas; para inferencia, cualquier GPU con 8 GB o más de VRAM es suficiente en bf16, y con cuantización de 8 bits basta con 4-6 GB.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090, así como en Apple Silicon mediante MLX.
- Opciones de despliegue: transformers 5.20 con `AutoModelForCausalLM` y `trust_remote_code=True`; MLX para Apple Silicon (existe la variante de 8 bits publicada por el autor). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y el prompt debe construirse manualmente, sin motor de plantilla de chat.
- Latencia y throughput: 1,04 segundos de mediana por fila en MLX de 8 bits sobre Apple M5 con prompts de unos 550 tokens; no se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER v15 held-out | ZER Voice Arena | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| lfm3-1.7b-muesli-cleanup-v15 | 1,73B | 2.048 | 1,02 % | 67,5 % | LFM Open License v1.0 (comercial solo bajo 10 M USD) | Hugging Face, bf16 y MLX 8 bits |
| Qwen3.5 2B v14 (release anterior de Muesli) | no disponible | no disponible | 3,38 % | 64,2 % | no disponible | no disponible |
| Qwen3.5 0,8B v14 (release anterior de Muesli) | no disponible | no disponible | 4,00 % | 57,6 % | no disponible | no disponible |
| ASR crudo sin limpieza | no aplica | no aplica | no disponible | 54,3 % | no aplica | no aplica |

No se dispone de datos de benchmarks de modelos de limpieza de transcripciones de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no procesa ni limpia transcripciones en otros idiomas.
- No es un reconocedor de voz: únicamente postprocesa texto ya transcrito; no acepta audio.
- Licencia restrictiva para uso comercial: la LFM Open License v1.0 solo permite uso comercial gratuito a organizaciones con ingresos anuales inferiores a 10 millones de dólares; por encima de ese umbral se requiere licencia adicional.
- Riesgo de alucinación y de paráfrasis: aunque el prompt de sistema prohíbe reescribir, añadir o eliminar palabras con significado, el modelo puede introducir cambios no deseados; el autor recomienda una salvaguarda en la aplicación que pegue la transcripción cruda si la salida está vacía, alcanza el límite de tokens o supera tres veces la longitud de la entrada.
- El prompt debe coincidir exactamente con el de entrenamiento (un turno de usuario, sin mensaje de sistema, decodificación greedy con temperatura 0 y `top_k=1`, sin penalización por repetición, parada en `<|im_end|>`); usar una plantilla de chat estándar degrada los resultados.
- El contexto de pantalla se trunca a 1.200 caracteres y nunca debe copiarse a la salida, pero un contexto erróneo puede inducir correcciones incorrectas.
- Los conjuntos de evaluación no son dictados reales de usuarios y el benchmark Voice Arena se midió solo sobre la partición pública con un único juez, por lo que las cifras no son directamente comparables con el leaderboard oficial.
- El modelo tiene cero descargas y cero likes en el momento de la ficha, y fue creado el 27 de noviembre de 2026; no hay validación independiente de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Muesli-HQ/lfm3-1.7b-muesli-cleanup-v15-bf16
- Variante MLX de 8 bits: https://huggingface.co/Muesli-HQ/lfm3-1.7b-muesli-cleanup-v15-mlx-8bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales relevantes sobre este modelo; los resultados de búsqueda obtenidos tratan sobre el alimento muesli y no guardan relación.
