# Abdullahu5mani/flowscribe-qwen3.5-0.8b-v3

## Resumen

FlowScribe v3 es un modelo de generación de texto especializado en la limpieza y normalización de transcripciones de voz (dictado). Lo desarrolla Abdullahu5mani y es el componente de post-procesado "on-device" de Taurscribe, una aplicación de dictado privada y offline. Su función es convertir la salida cruda de un motor de reconocimiento de voz (ASR) en el texto que el hablante realmente quería escribir: elimina muletillas y repeticiones, resuelve autocorrecciones, escribe correctamente cifras, fechas, horas, importes, correos y rutas, y aplica puntuación y formato según la aplicación de destino.

Técnicamente es un fine-tune mediante LoRA (rango 32 en todas las capas, 21,6 M de parámetros entrenables, fusionados en los pesos base) sobre Qwen/Qwen3.5-0.8B, el checkpoint más pequeño de la familia Qwen3.5 de Alibaba Cloud. Conserva la arquitectura híbrida del modelo base (gated delta networks combinadas con atención) y su ventana de contexto de 262.144 tokens, aunque el uso real de FlowScribe son entradas cortas de dictado. El modelo pesa 772.845.888 parámetros (≈0,77 B) y se distribuye en Apache 2.0.

Es relevante porque ataca un problema muy concreto con un modelo de menos de 1 B de parámetros que cabe en un portátil o un dispositivo de borde: mejorar la calidad del texto dictado sin enviar audio ni transcripciones a la nube. En su evaluación interna frente a la versión anterior reduce el WER del 18,5 % al 7,2 % y multiplica por 1,5 el porcentaje de coincidencias exactas, con una latencia p50 de 654 ms en CPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con gated delta networks (misma arquitectura que Qwen3.5-0.8B) |
| Parametros totales | 772.845.888 (≈0,77 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (heredada de Qwen3.5-0.8B; no especificada de forma independiente para este fine-tune) |
| Tipos de cuantizacion | GGUF F16 publicado; el modelo base lleva la etiqueta base_model:quantized (cuantizaciones adicionales no disponibles en el repositorio) |
| Idiomas soportados | inglés (en) únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (carpeta hf/), GGUF F16 (flowscribe-v3-f16.gguf), adaptador LoRA en formato MLX (carpeta lora/) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B en su variante instruct y no modifica la arquitectura: se aplica un LoRA de rango 32 sobre todas las capas (21,6 M de parámetros entrenables), se fusiona con los pesos base y se exporta en F16 sin cuantizar. El modelo base pertenece a la familia Qwen3.5 de Alibaba Cloud, descrita como híbrida (gated delta networks) con 262.144 tokens de contexto, orientada a dispositivos de borde y también utilizable como modelo borrador en decodificación especulativa junto a checkpoints Qwen3.5 mayores. FlowScribe emplea la plantilla de chat de Qwen3.5 con el modo thinking desactivado y decodificación greedy.

El entrenamiento se realizó sobre 10.662 registros generados a partir de 3.554 dictados sintéticos. Los datos se produjeron con dos profesores (DeepSeek V4.1 Flash y GPT-6 Luna), cada uno generando una transcripción cruda, una transcripción estilo reconocedor y tres objetivos (verbatim, clean y formatted) a partir de especificaciones aleatorizadas que cubren 10 aplicaciones, 15 variedades de inglés, 35 roles y 12 fenómenos del habla. Cada elemento superó comprobaciones automáticas y un juez LLM (GPT-6 Luna); se descartaron los que dejaban fechas, horas o importes en palabras. El coste de generación fue de aproximadamente 1,70 dólares. El ajuste se hizo con MLX en un Apple M4 de 16 GB durante unas 1,65 épocas, con AdamW, LR máximo 1e-4, decaimiento coseno, batch efectivo de 16 y enmascarado de los tokens del prompt, alcanzando una pérdida de validación final de 0,123.

## Capacidades

- Normalización de dictado: elimina muletillas, tartamudeos y falsos arranques ("um", "the the").
- Resolución de autocorrecciones habladas: transforma "at three, no wait, four" en "at 4".
- Conversión de formas habladas a formas escritas: números, fechas, horas, importes, correos electrónicos, URLs y rutas de archivo.
- Puntuación y maquetación dictadas: aplica "comma", "new paragraph" o "bullet point" cuando procede y respeta esas palabras cuando se usan literalmente.
- Corrección de vocabulario personalizado mediante el campo `vocab`: corrige términos que el reconocedor transcribió mal ("tory" → "Tauri").
- Formateo según la aplicación de destino: correo, chat, notas, documento, editor de código, terminal, prompt de IA, búsqueda, calendario y genérico (`app=`).
- Control de nivel de edición: `verbatim` (solo puntuación, mayúsculas y formas escritas), `clean` (elimina disfluencias y resuelve correcciones) y `formatted` (además aplica las convenciones de la app).
- Uso de contexto previo del documento mediante el campo `<prev>`.
- No resume, no reescribe el tono ni añade contenido.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es solo texto.

## Casos de uso

- Dictado en dispositivo (núcleo de Taurscribe): el modelo limpia en local la salida del reconocedor de voz antes de pegarla en la aplicación activa, sin enviar nada a la nube. Es su caso de uso principal y para el que está optimizado.
- Normalización de transcripciones ASR en pipelines propios: se puede insertar tras un motor tipo Whisper o Granite (indicando `engine=`) para convertir transcripciones en bruto en texto publicable, aprovechando que el formato de prompt distingue entre reconocedores con y sin puntuación.
- Limpieza de notas de voz y reuniones: convierte transcripciones de actas o notas rápidas en texto formateado con puntuación, cifras y listas, aplicando `app=document` o `app=notes`.
- Redacción de correos y mensajes por voz: con `app=email` o `app=chat` adapta el formato (saludos, párrafos, listas) al canal de destino, útil para flujos de accesibilidad o productividad sin teclado.
- Entrada de datos manuscrita por voz en formularios y calendario: con `app=calendar_task` transforma expresiones habladas de fecha y hora en valores escritos, reduciendo errores de captura.
- Preparación de prompts para modelos generativos: con `app=ai_prompt` limpia el dictado antes de enviarlo a un LLM, evitando que las muletillas y las correcciones contaminen la instrucción.
- Dictado en editores de código y terminales: con `app=code_editor` o `app=terminal` intenta respetar identificadores y comandos, aunque el propio autor señala que estas son las categorías más débiles del modelo.
- Corrección de vocabulario específico de dominio: gracias a `vocab` se pueden fijar nombres propios, siglas o términos técnicos para que el modelo los escriba correctamente aunque el ASR los haya deformado.

## Benchmarks y rendimiento

Evaluación interna sobre 339 registros reservados (113 dictados × 3 niveles de edición), ejecutada con el código de inferencia de Taurscribe (llama.cpp, CPU, F16), frente a FlowScribe v2 (Qwen2.5-0.5B, Q4_K_M):

| Modelo | Nivel | Exact match | Word error rate | Salidas con palabras inventadas | Latencia p50 (CPU) |
|---|---|---|---|---|---|
| FlowScribe v2 (Qwen2.5-0.5B, Q4_K_M) | todos | 27,1 % | 18,5 % | 16,2 % | 287 ms |
| FlowScribe v3 | todos | 41,3 % | 7,2 % | 4,4 % | 654 ms |
| FlowScribe v3 | clean | 46,0 % | 7,2 % | 0,9 % | 642 ms |

Los números de v3 incluyen las dos salvaguardas de salida de Taurscribe. La métrica "salidas con palabras inventadas" cuenta las salidas que contienen alguna palabra ausente tanto en la entrada como en la referencia; incluye algunas discrepancias de formato, por lo que sobreestima los errores reales. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: F16 ≈1,6 GB de pesos; Q8_0 ≈0,9 GB; Q4_K_M ≈0,5 GB. A estas cifras hay que sumar la caché KV, reducida en entradas de dictado cortas.
- GPU recomendadas: cualquier GPU con 4 GB o más de memoria (RTX 3060, RTX 4060, RTX 4090, A100, H100); dado el tamaño, el modelo está sobredimensionado para GPU de gama alta y su hábitat natural son equipos modestos.
- Cabe holgadamente en GPU de consumo: sí, en cualquier tarjeta con unos pocos GB de VRAM, e incluso en CPU pura.
- CPU: el propio autor ejecuta la evaluación y despliega en CPU (la versión de referencia usa llama.cpp en CPU), con una latencia p50 de 654 ms por salida de dictado y 642 ms en el nivel `clean`.
- Opciones de despliegue: llama.cpp (formato GGUF F16 publicado), pipeline de Taurscribe; la familia base Qwen3.5-0.8B cuenta con receta oficial en vLLM, por lo que el checkpoint safetensors puede servirse con vLLM o TGI. Compatibilidad con Ollama no está documentada explícitamente.
- Latencia y throughput: 287 ms (v2, CPU) frente a 654 ms (v3, CPU) de mediana por salida. No se han publicado datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Exact match (eval. FlowScribe) | WER | Licencia | Idiomas |
|---|---|---|---|---|---|---|---|
| FlowScribe v3 | Qwen3.5-0.8B | 0,77 B | 262.144 | 41,3 % | 7,2 % | Apache 2.0 | en |
| FlowScribe v2 | Qwen2.5-0.5B | 0,5 B | no disponible | 27,1 % | 18,5 % | Apache 2.0 (base) | en |
| Qwen3.5-0.8B | — | 0,8 B | 262.144 | no disponible | no disponible | Apache 2.0 | multilingüe |

Las cifras de exact match y WER solo son comparables entre sí dentro de la evaluación interna del autor (mismo conjunto, mismo pipeline de inferencia). No hay datos que permitan comparar FlowScribe v3 con otros modelos de limpieza de dictado de terceros.

## Limitaciones y advertencias

- Números: entre el 1 % y el 2 % de las salidas alteran una cantidad hablada (por ejemplo "twelve hundred fifty dollars" → "$1,500" o "twenty five percent" → "20 %"). El autor recomienda rechazar cualquier salida que contenga un número no trazable a la transcripción y pegar la transcripción original en su lugar.
- Bucles de repetición: en aproximadamente el 2 % de los casos la decodificación greedy entra en un bucle ("I, I, I, …"). Taurscribe detiene la generación ante n-gramas repetidos y aplica la transcripción original; conviene replicar esa salvaguarda en despliegues propios.
- Solo inglés: no cubre otros idiomas, incluidas las variantes no inglesas del dictado.
- Datos sintéticos: entrenado exclusivamente con dictados sintéticos generados por LLM, lo que puede dejar fuera fenómenos reales de habla no contemplados en las especificaciones de generación.
- Categorías débiles: los comandos de terminal y los identificadores de código son los casos con peor comportamiento.
- Errores tipográficos menores: pueden colarse pequeños fallos de forma (por ejemplo "lets" → "Let").
- Riesgo de alucinación: aunque el modelo declara no añadir contenido, la presencia de términos inventados (4,4 % en la evaluación global, 0,9 % en nivel `clean`) indica que puede introducir palabras no presentes en la entrada; las salvaguardas de salida son necesarias en producción.
- Licencia: Apache 2.0, igual que el modelo base, por lo que el uso comercial está permitido; conviene revisar igualmente las condiciones del checkpoint base Qwen3.5-0.8B.
- Advertencia de producción: el modelo está diseñado para limpiar texto dictado, no para tareas generales de generación; forzar otros usos (resumen, reescritura de tono, razonamiento) queda fuera de su distribución de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abdullahu5mani/flowscribe-qwen3.5-0.8b-v3
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Colección Qwen3.5: https://huggingface.co/collections/Qwen/qwen35
- Repositorio Taurscribe: https://github.com/Abdullahu5mani/Taurscribe
- Qwen3.5-0.8B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_0_8b
- Receta de vLLM para Qwen3.5-0.8B: https://recipes.vllm.ai/Qwen/Qwen3.5-0.8B
- Referencia del modelo Qwen3.5-0.8B en portpowered: https://portpowered.github.io/ai-model-reference/docs/models/qwen3-5-0-8b
- Informe de evaluación del autor: eval_report.md dentro del repositorio del modelo
