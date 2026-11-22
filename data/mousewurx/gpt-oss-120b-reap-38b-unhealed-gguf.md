# MouseWurX/gpt-oss-120b-REAP-38B-UNHEALED-GGUF

## Resumen

Este repositorio contiene una versión podada del modelo `openai/gpt-oss-120b` de OpenAI, publicada por el usuario MouseWurX bajo el identificador `gpt-oss-120b-REAP-38B-UNHEALED-GGUF`. Se trata de un corte experimental en el que se han eliminado expertos de las 36 capas del transformer mediante la técnica REAP (Router-weighted Expert Activation Pruning), conservando 41 de los 128 expertos por capa. El resultado es un modelo de aproximadamente 38.858 millones de parámetros totales, frente a los 120B del original.

El modelo mantiene la arquitectura MoE original con enrutamiento top-4 por token y los pesos en formato MXFP4 sin recuantizar ni reentrenar. El autor lo etiqueta explícitamente como "UNHEALED" (sin sanear): no ha habido fine-tuning posterior al corte, por lo que el modelo presenta daños funcionales documentados en generación de código y razonamiento. Está pensado exclusivamente para investigación sobre poda de expertos y experimentos de "healing" (recuperación mediante entrenamiento posterior), no para uso en producción.

La relevancia actual radica en que permite estudiar el comportamiento de modelos MoE de gran tamaño tras una poda agresiva de expertos, con listas de conservación públicas y métricas de masa REAP por capa, lo que facilita reproducir y comparar estrategias de compresión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts), 36 capas, top-4 routing |
| Parámetros totales | 38.858.890.500 (~38B) |
| Parámetros activos | 4 expertos por token de 41 disponibles por capa (no se especifica el número exacto de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP4 (formato original de OpenAI, sin recuantizar); empaquetado en GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `gpt-oss-120b-REAP-38B-UNHEALED-MXFP4.gguf`, 20,34 GiB) |

## Arquitectura y entrenamiento

El modelo es un recorte directo del `gpt-oss-120b` original, un transformer MoE con 36 capas y 128 expertos por capa. La poda se realizó con la técnica REAP: para cada experto se calcula una puntuación que combina la frecuencia con la que el router lo selecciona y la magnitud (norma) de su salida cuando es seleccionado, sumada sobre un conjunto de 100 lecciones de entrenamiento (266.712 tokens) procesadas con una versión parcheada de llama.cpp ("Brain Engine"). En cada capa se conservaron los 41 expertos con mayor puntuación, eliminando 87 por capa (3.132 en total, de 4.608 originales).

No hubo reentrenamiento ni fine-tuning tras el corte: los pesos de los expertos conservados se copiaron byte a byte desde el GGUF MXFP4 original de `ggml-org/gpt-oss-120b-GGUF`, junto con las filas correspondientes del router y sus biases. La capa 35 fue re-puntuada en la versión v2 con 324.320 selecciones de router (122 de 128 expertos vistos) para corregir un sesgo de la traza original. La proporción de masa REAP conservada por capa oscila entre el 68% (capa 0) y el 94% (capa 34), con mediana del 85%.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas simples (el autor confirma que hechos básicos como "la capital de Canadá es Ottawa" se mantienen correctos).
- Razonamiento y generación de código: **degradados**. El smoke test documenta una función de Fibonacci incorrecta (describe la secuencia como 0, 1, 2, 3, 4… y devuelve `n` para cada `n`) y una respuesta de física que confunde dispersión con pigmentos y refracción.
- Tool calling / function calling: el modelo conserva la capacidad de seleccionar herramientas y argumentos, evaluada en 192/312 turnos correctos sobre chats held-out (frente a 204/314 del modelo completo).
- Soporte de agentes multi-paso: no verificado de forma independiente; el autor solo reporta métricas de selección de herramientas.
- Capacidades multilingües: no disponible.
- Modo thinking: el modelo base lo soporta, pero no se documenta su estado tras la poda.

## Casos de uso

- Investigación sobre poda de expertos en MoE: permite reproducir el pipeline REAP y comparar listas de conservación (75/50/35/32/25%) usando las puntuaciones públicas en `MouseWurX/REAP-scores-gpt-oss-120b`.
- Experimentos de "healing": servir como punto de partida para fine-tuning de recuperación tras la poda, midiendo cuánto rendimiento se recupera con distintas cantidades de datos.
- Estudio de robustez de routers: analizar cómo cambia la distribución de selección de expertos al reducir de 128 a 41 por capa.
- Benchmarking de herramientas de inferencia: probar llama.cpp y otros runtimes con modelos MoE podados en formato GGUF.
- Evaluación de degradación controlada: usar el modelo como caso negativo en suites de evaluación de código y razonamiento, comparando contra el `gpt-oss-20b` intacto.
- Docencia y divulgación: ilustrar el impacto de la compresión de modelos en tareas concretas con métricas reproducibles (192/312 en tool calling, fallo en Fibonacci).

## Benchmarks y rendimiento

Datos publicados por el autor sobre 196 chats held-out de tool calling (~314 turnos de asistente, thinking off), comparando distintos porcentajes de expertos conservados:

| % conservado | Expertos/capa | Tamaño aprox. | Held-out correctos | Herramientas correctas | Palabras/s (A100) |
|---|---|---|---|---|---|
| 100% | 128 | 117B | 204/314 | 40 | 116,5 |
| 75% | 96 | 88B | 204/314 | 39 | 98,8 |
| 50% | 64 | 59B | 196/314 | 40 | 99,3 |
| 35% | 45 | 42B | 187/310 | 39 | 98,2 |
| 32% (v1) | 41 | 38B | 192/312 | 38 | 98,2 |
| 25% | 32 | 31B | 176/300 | 25 | 97,3 |
| 16% | 21 | 20B | roto (servidor caído) | 0 | 98,1 |

Referencia adicional: el `gpt-oss-20b` original obtiene 196/313 en los mismos chats. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF ocupa 20,34 GiB; se necesita al menos ~21-22 GiB de VRAM para cargarlo completo en GPU, más overhead de contexto KV.
- GPU recomendadas: A100 (usada por el autor para las pruebas, con ~98 palabras/s), H100, o GPUs consumer con 24 GiB o más (RTX 3090, RTX 4090) para carga completa.
- Cabe en GPU consumer de 24 GiB (RTX 3090/4090) siempre que se limite la ventana de contexto; en GPUs de 16 GiB requeriría offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y potencialmente otros runtimes compatibles con GGUF y MoE (Ollama, LM Studio); vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Throughput: ~98 palabras/s en A100 según el autor; latencia no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling (held-out) | Licencia | Estado |
|---|---|---|---|---|---|
| gpt-oss-120b-REAP-38B (este) | 38B (MoE, 41 expertos/capa) | no disponible | 192/312 | Apache 2.0 | Podado, sin sanear |
| openai/gpt-oss-120b (original) | 120B (MoE, 128 expertos/capa) | no disponible | 204/314 | Apache 2.0 | Intacto |
| openai/gpt-oss-20b | ~20B | no disponible | 196/313 | Apache 2.0 | Intacto |

El `gpt-oss-20b` intacto iguala en tool calling al 120B original con la mitad de tamaño, lo que lo convierte en una alternativa más fiable que este corte podado para cualquier uso práctico.

## Limitaciones y advertencias

- **Modelo dañado por diseño**: no ha habido reentrenamiento tras la poda; el autor lo declara explícitamente inadecuado para uso diario.
- Generación de código incorrecta documentada (Fibonacci erróneo) y razonamiento físico deficiente (confusión dispersión/pigmentos/refracción).
- Riesgo elevado de alucinación en tareas que requieren cómputo o razonamiento multi-paso.
- La evaluación held-out solo cubre tool calling; no mide código, matemáticas ni razonamiento general, por lo que el rendimiento real en esas áreas es peor de lo que sugieren las cifras.
- Sesgos conocidos: no documentados específicamente para este corte, pero hereda los del `gpt-oss-120b` original.
- Idiomas soportados no verificados tras la poda.
- Licencia Apache 2.0 permite uso comercial, pero el estado dañado del modelo hace desaconsejable cualquier despliegue en producción.
- La versión v2 solo difiere de v1 en la capa 35; el resto de capas mantiene la lista de conservación original.
- El fichero tiene un sha256 publicado (`b2a4c80f...`) que conviene verificar antes de usarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MouseWurX/gpt-oss-120b-REAP-38B-UNHEALED-GGUF
- Dataset con puntuaciones REAP y listas de conservación: https://huggingface.co/datasets/MouseWurX/REAP-scores-gpt-oss-120b
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- GGUF origen: https://huggingface.co/ggml-org/gpt-oss-120b-GGUF
