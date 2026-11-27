# Muesli-HQ/lfm3-1.7b-muesli-cleanup-v15-mlx-8bit

## Resumen

`lfm3-1.7b-muesli-cleanup-v15-mlx-8bit` es un ajuste fino completo del modelo base LiquidAI/LFM3-1.7B, publicado por Muesli-HQ, el equipo detrás de una aplicación de dictado para macOS. Su tarea no es la generación de texto general, sino la limpieza de transcripciones de voz a texto: recibe la salida cruda de un sistema ASR (opcionalmente acompañada de contexto de pantalla) y devuelve el texto tal como el hablante lo habría escrito, corrigiendo errores evidentes de reconocimiento, eliminando muletillas, aplicando autocorrecciones y dando formato a correos, listas y cifras.

El modelo se distribuye en formato MLX cuantizado a 8 bits (afín, tamaño de grupo 64), ocupa 1,7 GB y está pensado para inferencia en dispositivo en Apple Silicon mediante mlx-swift-lm. Los pesos completos en bf16 están publicados por separado. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, y se publicó el 27 de noviembre de 2026.

Es relevante porque ejemplifica una tendencia concreta: modelos pequeños (1.728.801.536 parámetros reales según safetensors) especializados mediante ajuste fino completo en una única tarea de postprocesado, con evaluación propia y despliegue local en el escritorio del usuario, sin dependencia de API en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-1.7B; requiere `custom_code` y soporte `lfm3` en mlx-swift-lm) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (entrenamiento con longitud máxima de 2.048 tokens; generación limitada a 1.024 tokens nuevos) |
| Tipos de cuantizacion | 8 bits afín, tamaño de grupo 64 (versión publicada); pesos bf16 completos en repo aparte |
| Idiomas soportados | inglés (`en`) |
| Licencia | LFM Open License v1.0 (`license_name: lfm1.0`); uso comercial gratuito solo para organizaciones con ingresos anuales inferiores a 10 millones de USD |
| Formato de pesos | safetensors en formato MLX (conversión con `MLXLMCommon.convert` de mlx-swift-lm); tamaño del repo 1,9 GB |

## Arquitectura y entrenamiento

No se detalla en la información disponible la arquitectura interna del modelo base LFM3-1.7B (si es transformer denso, híbrido o MoE). Lo que sí se documenta es que la librería de inferencia debe soportar el tipo `lfm3`, lo que implica una implementación específica en mlx-swift-lm 3.33.0 o superior, junto con swift-transformers 1.4.0 o superior por el soporte de BPE con `ignore_merges`. La versión publicada de mlx-lm para Python (0.32.2) no carga `lfm3` todavía.

El entrenamiento consistió en un ajuste fino completo de todos los pesos partiendo del modelo base: transformers 5.20, pesos maestros en fp32, AdamW, tasa de aprendizaje 1e-5 con 200 pasos de calentamiento, lote efectivo de 16, longitud máxima de 2.048 y cálculo de pérdida solo sobre la respuesta. Una época equivale a 10.647 pasos en una única A100, con un tiempo de 4,2 horas. La pérdida final de evaluación fue 0,137, aunque el autor advierte que la partición de evaluación conserva objetivos de estilo antiguo y no es comparable con las pérdidas de la versión v14.

Los datos de entrenamiento, denominados blend-v15, suman 170.350 pares de limpieza que cubren correo electrónico, chat, documentos, prompts para agentes de IA, código, hojas de cálculo y presentaciones, cajas de búsqueda y dictados largos. Fueron generados por modelos abiertos en Fireworks (DeepSeek, MiniMax) y por Claude, y verificados por jueces de una familia distinta (GLM 5.3, Kimi K3/K3.1). Respecto a blend-v14, se reescribieron y reverificaron unos 18.000 objetivos y se añadieron 15.354 filas nuevas para reglas revisadas: listas en correos y prompts, maquetación de correo, párrafos para dictados largos, conservación de abridores discursivos, autocorrecciones implícitas, eliminación aproximada de "like", formatos de moneda, identificadores, teléfonos y términos técnicos, y reparación de ciertos errores de ASR. No se usó ningún clip ni texto de Voice Arena para el entrenamiento.

## Capacidades

- Limpieza de transcripciones ASR: corrige errores claros de reconocimiento y devuelve el texto sin parafrasear cuando ya es correcto.
- Eliminación de muletillas ("um", "uh", "like") y aplicación de borrados explícitos del tipo "scratch that".
- Aplicación de autocorrecciones implícitas: "ten requests a minute, make that five" pasa a "5 requests a minute".
- Maquetación de correos electrónicos: línea de saludo, párrafos y despedida.
- Conversión de tres o más tareas o elementos en listas con viñetas o numeradas en notas, correos, prompts de IA y chat de trabajo, manteniendo los mensajes personales en prosa.
- Formateo de cifras, moneda, identificadores, teléfonos y términos técnicos tal como se teclearían: "PR #4821", "$2,400", "(312) 555-0147", "v5".
- Uso de contexto de aplicación opcional (`<APP-CONTEXT>` con app enfocada, documento, URL, texto seleccionado u OCR de pantalla) para resolver errores evidentes, nombres y acrónimos, con prohibición explícita de copiar ese contexto a la salida.
- Generación de texto conversacional y modo de razonamiento desactivado mediante `` en el prompt.
- No soporta tool calling, function calling ni agentes multi-paso según la información disponible; no es un reconocedor de voz.

## Casos de uso

- Dictado en escritorio macOS: integrado en la aplicación Muesli, el modelo recibe la salida cruda del ASR y devuelve el texto final que el usuario habría tecleado, con latencia de aproximadamente 1,04 segundos por fila en un Apple M5 con la build MLX de 8 bits.
- Redacción de correos por voz: la maquetación automática (saludo, párrafos, despedida) evita que el usuario tenga que estructurar manualmente un correo dictado, y el contexto de aplicación permite resolver nombres de destinatarios mal transcritos.
- Notas de reunión y listas de tareas: convierte enumeraciones dictadas de tres o más elementos en listas con viñetas en notas y chats de trabajo, manteniendo la prosa en mensajes personales.
- Prompts para agentes de IA dictados: formatea listas y términos técnicos en prompts largos, un caso cubierto explícitamente en el conjunto blend-v15.
- Dictado de código y términos técnicos: preserva formatos como "PR #4821" o "v5", útil en chat de desarrollo y en campos de búsqueda.
- Dictado de datos sensibles a formato: teléfonos, importes y números de identificación se escriben con el formato tecleado, lo que reduce correcciones manuales en contextos administrativos o financieros.
- Postprocesado por lotes de transcripciones: al ser un modelo pequeño (1,7 GB en 8 bits) puede ejecutarse localmente sobre transcripciones ya generadas, sin enviar audio ni texto a servicios externos.

## Benchmarks y rendimiento

| Modelo | v15 held-out (258): WER % / exact % | Mediana s/fila | Voice Arena (151 clips): ZER % / AMEND % |
|---|---|---|---|
| Este modelo (v15) | 1,02 / 47,7 | 1,04 | 67,5 / 0,61 |
| Qwen3.5 2B v14 (release anterior) | 3,38 / 19,0 | 1,53 | 64,2 / 0,92 |
| Qwen3.5 0,8B v14 (release anterior) | 4,00 / 17,8 | 0,71 | 57,6 / 1,42 |
| ASR crudo, sin limpieza | no disponible | no disponible | 54,3 / 1,23 |

Notas sobre la evaluación: el conjunto v15 held-out consta de 258 filas en 11 categorías (autocorrecciones implícitas, código y tecnología, maquetación de correo, mensajes personales, números e identificadores hablados, chat de trabajo, texto largo, enumeraciones que permanecen en prosa, listas sin indicación explícita, prompts de IA y notas), escritas por Kimi K3.1 Pro, aceptadas por GLM 5.3 y filtradas por una revisión estricta de Claude (258 de 417). No son dictados reales de usuarios. Voice Arena Dictation Bench usa solo la partición pública (151 de 761 clips, no es un envío al leaderboard): transcripciones de Parakeet unified ASR y este modelo sin contexto de pantalla, puntuadas con un único juez Claude Opus 5.5 en lugar de la mayoría 3 de 5 del leaderboard. Los intervalos de confianza del 95 % agrupados por hablante son de aproximadamente ±7 puntos de ZER. La velocidad se midió con MLX Swift de 8 bits en un Apple M5 con prompts de unos 550 tokens.

## Requisitos de hardware

- VRAM/espacio: 1,7 GB para los pesos MLX de 8 bits; el repositorio completo ocupa 1,9 GB. La versión bf16 requiere aproximadamente el doble.
- Plataforma objetivo: Apple Silicon con mlx-swift-lm 3.33.0 o superior y mlx-swift 0.33; swift-transformers 1.4.0 o superior. La medición de referencia se hizo en un Apple M5.
- GPU dedicadas: no se documenta soporte para CUDA ni para GPUs NVIDIA en esta build; la información disponible solo cubre MLX en Apple Silicon. No hay datos de VRAM para A100, H100 o RTX 4090.
- GPU de consumo: cabe holgadamente en cualquier Mac con Apple Silicon; no aplica a GPUs de consumo x86 en el formato publicado.
- Despliegue: MLX Swift (mlx-swift-lm) es la vía soportada. mlx-lm para Python 0.32.2 no carga `lfm3`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 1,04 s por fila en Apple M5 con prompts de unos 550 tokens, una petición a la vez. No se publican cifras de throughput agregado ni de procesamiento por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (v15) | 1.728.801.536 | no disponible | Limpieza de transcripciones ASR | LFM Open License v1.0 (comercial gratis bajo 10 M USD de ingresos) | Hugging Face, formato MLX 8 bits y bf16 |
| Qwen3.5 2B v14 | no disponible | no disponible | Limpieza de transcripciones ASR | no disponible | Release anterior del mismo autor |
| Qwen3.5 0,8B v14 | no disponible | no disponible | Limpieza de transcripciones ASR | no disponible | Release anterior del mismo autor |
| ASR crudo (Parakeet unified) | no disponible | no disponible | Reconocimiento de voz sin postprocesado | no disponible | Línea base de Voice Arena |

La comparación se limita a las alternativas reportadas por el autor. Frente a Qwen3.5 2B v14, este modelo reduce el WER del 3,38 % al 1,02 % y sube el porcentaje de coincidencia exacta del 19,0 % al 47,7 %, con menor latencia mediana (1,04 s frente a 1,53 s). Frente al ASR crudo, mejora el ZER de Voice Arena del 54,3 % al 67,5 % y reduce la proporción de caracteres corregidos (AMEND) de 1,23 % a 0,61 %. No se dispone de datos de contexto ni de parámetros de los modelos Qwen comparados.

## Limitaciones y advertencias

- Solo inglés: no se ha entrenado ni evaluado para otros idiomas.
- No es un reconocedor de voz: únicamente postprocesa texto ya transcrito.
- El prompt debe coincidir exactamente con el de entrenamiento (un turno de usuario, sin mensaje de sistema, decodificación voraz con temperatura 0 y `top_k=1`, sin penalización de repetición, máximo 1.024 tokens nuevos, parada en `<|im_end|>`). Desviarse de este formato degrada la salida.
- Riesgo de alucinación y de paráfrasis no deseada: el prompt prohíbe explícitamente reescribir, añadir o eliminar palabras con significado, pero es una instrucción, no una garantía. El autor recomienda una salvaguarda en la aplicación (texto truncado en la información disponible).
- El contexto de pantalla (`<APP-CONTEXT>`) puede filtrarse a la salida si el modelo no respeta la instrucción de no copiarlo; el bloque debe recortarse a 1.200 caracteres.
- Sesgos: no se documentan sesgos específicos; el entrenamiento usa datos sintéticos generados por modelos (DeepSeek, MiniMax, Claude) y verificados por otros modelos (GLM 5.3, Kimi K3/K3.1), lo que puede introducir sesgos de estilo de esos generadores.
- La evaluación se hizo sobre datos sintéticos (258 filas escritas por modelos) y sobre la partición pública de Voice Arena con un único juez, no con la mayoría 3 de 5 del leaderboard; los intervalos son de ±7 puntos de ZER.
- Licencia restrictiva para empresas: uso comercial gratuito solo por debajo de 10 millones de USD de ingresos anuales; por encima se requiere licencia de Liquid AI.
- Dependencia de toolchain muy reciente: mlx-swift-lm 3.33.0 y swift-transformers 1.4.0, con mlx-lm de Python sin soporte para `lfm3`. El soporte en otras plataformas no está disponible.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Muesli-HQ/lfm3-1.7b-muesli-cleanup-v15-mlx-8bit
- Pesos completos en bf16: https://huggingface.co/Muesli-HQ/lfm3-1.7b-muesli-cleanup-v15-bf16
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio mlx-swift-lm: https://github.com/ml-explore/mlx-swift-lm
- Pull request de soporte LFM3 en mlx-swift-lm: https://github.com/ml-explore/mlx-swift-lm/pull/750
- Pull request de soporte LFM3 en mlx-swift-lm: https://github.com/ml-explore/mlx-swift-lm/pull/756
- Pull request de BPE `ignore_merges` en swift-transformers: https://github.com/huggingface/swift-transformers/pull/397
- Licencia LFM Open License v1.0: incluida en el repositorio como `LICENSE`
