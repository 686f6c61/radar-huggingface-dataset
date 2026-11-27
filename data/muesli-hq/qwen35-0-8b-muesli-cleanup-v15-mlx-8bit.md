# Muesli-HQ/qwen35-0.8b-muesli-cleanup-v15-mlx-8bit

## Resumen

qwen35-0.8b-muesli-cleanup-v15-mlx-8bit es un modelo de limpieza de dictado (dictation cleanup) desarrollado por Muesli-HQ para su aplicación de dictado en macOS. No es un modelo de propósito general: toma la salida cruda de un sistema de reconocimiento de voz (ASR) y devuelve el texto que el hablante habría escrito, corrigiendo errores claros de reconocimiento, eliminando muletillas, aplicando autocorrecciones explícitas e implícitas y dando formato a correos, listas y notas.

El modelo es un fine-tune completo de Qwen/Qwen3.5-0.8B, el decodificador de texto de Qwen3.5, con 752.393.024 parámetros. Se distribuye en formato MLX de 8 bits (cuantización afina, group size 64, 0,78 GB), convertido en Swift con `MLXLMCommon.convert` de mlx-swift-lm. La versión de precisión completa está publicada por separado en bf16.

Su relevancia radica en que resuelve un problema muy concreto de producto con un modelo pequeño que cabe en un Mac: la limpieza de transcripciones en el propio dispositivo, sin enviar audio ni texto a la nube. Está entrenado sobre el blend-v15, un conjunto de 170.350 pares de limpieza, y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5 text-only, tipo `qwen3_5_text`; sin torre de visión) |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenamiento con max length 2.048; contexto de inferencia no especificado) |
| Tipos de cuantizacion | 8-bit afina, group size 64 (formato MLX); pesos bf16 disponibles en el repo hermano |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 0,78 GB; repo total 0,8 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5 en su variante exclusivamente de texto. Se obtuvo mediante un fine-tune completo de todos los pesos (no LoRA) desde Qwen/Qwen3.5-0.8B, con transformers 5.20, pesos maestros en fp32, AdamW, learning rate 1e-5, 200 pasos de warmup, batch efectivo de 16, longitud máxima de 2.048 y pérdida calculada solo sobre la respuesta. Una época equivale a 10.647 pasos en una única A100 (3,7 horas). La pérdida final de evaluación fue 0,172, aunque el autor advierte que el split de evaluación conserva objetivos de estilo antiguo y no es comparable con las pérdidas de v14.

Los datos de entrenamiento son el blend-v15: 170.350 pares de limpieza que cubren correo, chat, documentos, prompts para agentes de IA, código, hojas de cálculo y diapositivas, cajas de búsqueda y dictados largos. Los pares fueron escritos por modelos abiertos en Fireworks (DeepSeek, MiniMax) y Claude, y verificados por jueces de otra familia (GLM 5.3, Kimi K3/K3.1). Respecto a blend-v14, se reescribieron y reverificaron unos 18.000 objetivos y se añadieron 15.354 filas nuevas para reglas revisadas: listas en correos y prompts, maquetación de correo, párrafos en dictados largos, aperturas discursivas conservadas, autocorrecciones implícitas, eliminación del "like" aproximativo y formatos de moneda, identificadores, teléfonos y términos técnicos. No se usó ningún clip ni texto de Voice Arena para el entrenamiento.

## Capacidades

- Limpieza de transcripciones ASR en inglés: corrige errores claros de reconocimiento y elimina muletillas (um, uh, like).
- Aplicación de autocorrecciones explícitas e implícitas ("ten requests a minute, make that five" pasa a "5 requests a minute").
- Formato de correos: línea de saludo, párrafos y despedida.
- Conversión de tres o más tareas o elementos separados en listas dentro de notas, correos, prompts de IA y chat de trabajo.
- Conservación de mensajes personales como prosa, sin convertirlos en listas.
- Escritura de números, importes, identificadores, teléfonos y términos técnicos tal como se teclean ("PR #4821", "$2,400", "(312) 555-0147", "v5").
- Uso opcional de contexto de pantalla (`<APP-CONTEXT>`: app enfocada, campo de documento, texto OCR) solo para resolver errores obvios, nombres y acrónimos; nunca copia ese contexto a la salida.
- Generación de texto conversacional (pipeline `text-generation`), aunque su función entrenada es la limpieza.
- No soporta tool calling, function calling, agentes multi-paso, visión ni audio; no es un reconocedor de voz.

## Casos de uso

- Dictado en macOS dentro de la app Muesli: el modelo recibe la transcripción cruda del ASR y devuelve el texto limpio para insertarlo en el campo activo, con una latencia mediana de 0,67 s por fila en un Apple M5.
- Redacción de correos por voz: aplica maquetación de saludo, párrafos y despedida, y convierte enumeraciones dictadas en listas cuando corresponde, manteniendo la prosa en mensajes personales.
- Notas de reunión y listas de tareas: transforma tres o más tareas dictadas en una lista con viñetas o numerada, conservando las aperturas discursivas.
- Prompts para agentes de IA dictados: da formato de lista a los requisitos y corrige términos técnicos y acrónimos usando el contexto de pantalla cuando está disponible.
- Chat de trabajo y mensajería: limpia muletillas y errores de reconocimiento sin parafrasear, preservando el fraseo original del hablante.
- Reparación de identificadores y datos sensibles a formato: normaliza números de ticket, importes, versiones y teléfonos para que se inserten tal como se teclean en herramientas de desarrollo o CRM.
- Preprocesado local de transcripciones antes de enviarlas a otro sistema: al ser un modelo de 0,78 GB en 8 bits, puede ejecutarse en el dispositivo y evitar el envío de texto dictado a servicios externos.

## Benchmarks y rendimiento

Resultados publicados por el autor para la build MLX 8-bit, una petición a la vez:

| Modelo | v15 held-out (258): WER % / exact % | Mediana s/fila | Voice Arena (151 clips): ZER % / AMEND % |
|---|---|---|---|
| Este modelo (v15) | 1,21 / 46,1 | 0,67 | 65,6 / 0,79 |
| Qwen3.5 2B v14 (release anterior) | 3,38 / 19,0 | 1,53 | 64,2 / 0,92 |
| Qwen3.5 0.8B v14 (release anterior) | 4,00 / 17,8 | 0,71 | 57,6 / 1,42 |
| ASR crudo, sin limpieza | - | - | 54,3 / 1,23 |

Notas del autor: el conjunto v15 held-out son 258 filas de 11 categorías escritas por Kimi K3.1 Pro y aceptadas por GLM 5.3, filtradas por una revisión estricta de Claude (258 de 417); no son dictados reales de usuarios. Voice Arena Dictation Bench usa solo el split público (151 de 761 clips, no es un envío al leaderboard), con transcripciones del ASR unificado Parakeet de Muesli y puntuación de un único juez Claude Opus 5.5 (el leaderboard usa mayoría de 3 de 5). ZER es el porcentaje de clips sin ediciones y AMEND la proporción de caracteres editados por el juez. Los intervalos del 95 % agrupados por hablante son de aproximadamente ±7 puntos de ZER. La velocidad se midió con MLX Swift 8-bit en un Apple M5 con prompts de unos 550 tokens.

## Requisitos de hardware

- VRAM/RAM estimada: 0,78 GB para los pesos en 8 bits MLX; el repo completo ocupa 0,8 GB.
- GPU recomendadas: el formato es MLX, pensado para Apple Silicon; el autor reporta 0,67 s de mediana por fila en un Apple M5. No se han publicado mediciones en A100, H100 ni RTX 4090 para esta build.
- Cabe en GPU de consumo: sí, por tamaño, pero la build publicada es MLX y requiere Apple Silicon; para CUDA habría que reconvertir desde los pesos bf16.
- Opciones de despliegue: mlx-swift-lm 3.32.3 o superior (tipo de modelo `qwen3_5_text`). El mlx-lm de Python publicado (0.32.2) no registra `qwen3_5_text`. Con swift-transformers <= 1.3.2 hay que mapear `tokenizer_class` `Qwen3_5Tokenizer` a `Qwen2Tokenizer` (mismo BPE a nivel de byte). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 0,67 s por fila con prompts de unos 550 tokens en Apple M5; no hay datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (v15 held-out, WER/exact) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (v15, MLX 8-bit) | 752 M | No disponible | 1,21 / 46,1 | Apache 2.0 | Hugging Face, formato MLX |
| Qwen3.5 0.8B v14 | 0,8 B | No disponible | 4,00 / 17,8 | Apache 2.0 (según release) | Hugging Face |
| Qwen3.5 2B v14 | 2 B | No disponible | 3,38 / 19,0 | Apache 2.0 (según release) | Hugging Face |
| ASR crudo sin limpieza | No aplica | No aplica | Solo Voice Arena: ZER 54,3 / AMEND 1,23 | No aplica | No aplica |

No se dispone de datos de otros modelos de limpieza de dictado comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés; no soporta otros idiomas.
- Es un modelo de limpieza, no un reconocedor de voz: necesita una transcripción ASR previa.
- El prompt debe coincidir exactamente con el de entrenamiento: un turno de usuario, sin mensaje de sistema, decodificación greedy (temperatura 0 / `top_k=1`, sin penalización de repetición), máximo 1.024 tokens nuevos y parada en `<|im_end|>`.
- El autor recomienda una guarda en la app: si la salida está vacía, alcanza el límite de tokens o supera 3 veces la longitud de la entrada, pegar la transcripción cruda.
- v15 formatea más que v14 (listas, párrafos, dígitos), lo que puede ser indeseado en algunos contextos.
- Riesgo de alucinación y de paráfrasis no documentado explícitamente, pero inherente a un modelo generativo pequeño; el prompt prohíbe parafrasear, reescribir o añadir palabras.
- Los benchmarks provienen de conjuntos sintéticos escritos por modelos y de un único juez, no de dictados reales ni de un envío oficial al leaderboard.
- Licencia Apache 2.0, que permite uso comercial; no se documentan restricciones adicionales.
- El soporte de runtime es limitado: MLX Swift con `qwen3_5_text`; mlx-lm de Python publicado no lo registra.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Muesli-HQ/qwen35-0.8b-muesli-cleanup-v15-mlx-8bit
- Pesos de precisión completa (bf16): https://huggingface.co/Muesli-HQ/qwen35-0.8b-muesli-cleanup-v15-bf16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
