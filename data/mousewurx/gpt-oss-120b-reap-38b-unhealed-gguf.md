# MouseWurX/gpt-oss-120b-REAP-38B-UNHEALED-GGUF

## Resumen

gpt-oss-120b-REAP-38B-UNHEALED-GGUF es una versión podada de forma agresiva del modelo openai/gpt-oss-120b, publicada por el usuario MouseWurX en Hugging Face. Se trata de un corte "en bruto" (raw cut) en el que, en cada una de las 36 capas del transformer MoE original, se conservan únicamente 41 de los 128 expertos, seleccionados mediante la puntuación REAP (Router-weighted Expert Activation Pruning). El resultado son aproximadamente 38.858 millones de parámetros totales, con un enrutamiento de 4 expertos por token, idéntico al del modelo original.

El modelo conserva los pesos en formato MXFP4 exactamente como se distribuyeron originalmente: no hay recuantización ni reentrenamiento posterior al corte. El autor lo etiqueta explícitamente como "[UNHEALED]" y advierte de que el modelo está dañado, por lo que su uso previsto es la investigación y los experimentos de "healing" (recuperación de capacidades mediante ajuste fino), no el uso diario en producción.

Es relevante ahora porque demuestra empíricamente hasta qué punto se puede reducir un MoE de 120B manteniendo un comportamiento aceptable en tareas de tool calling (192/312 turnos correctos frente a 204/314 del modelo completo), y porque publica las puntuaciones REAP por capa como dataset abierto, lo que permite reproducir o ajustar la poda. Su licencia Apache 2.0 facilita la experimentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) podado, basado en openai/gpt-oss-120b |
| Parámetros totales | 38.858.890.500 (≈38,9B) |
| Parámetros activos | no disponible (el modelo enruta 4 expertos por token y capa, pero el número exacto de parámetros activos no se especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP4 (pesos originales, sin recuantización) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `gpt-oss-120b-REAP-38B-UNHEALED-MXFP4.gguf`, 20,34 GiB) |

## Arquitectura y entrenamiento

El modelo parte de openai/gpt-oss-120b, un transformer de tipo mixture of experts con 36 capas, 128 expertos por capa y enrutamiento top-4 por token. La poda se realizó con la herramienta "Bob's Lab cutter" (y su port byte a byte), que copia literalmente las filas de los expertos conservados junto con las filas y sesgos correspondientes del router. En total se conservan 1.476 de 4.608 expertos (41 de 128 en cada una de las 36 capas) y se eliminan 3.132.

La selección de expertos se basó en la puntuación REAP, que combina la frecuencia con la que el router elige un experto con la magnitud de su contribución a la salida (peso de la compuerta multiplicado por la norma de su salida), sumada sobre 100 lecciones de entrenamiento y 266.712 tokens procesados con Brain Engine (llama.cpp con parches de expert-mask, expert-trace y expert-mass). La proporción de masa REAP conservada por capa oscila entre el 68% (capa 0) y el 94% (capa 34), con una mediana del 85%. En la versión v2 se re-puntuó la capa 35 con 324.320 selecciones del router (122 de 128 expertos vistos), frente a las 400 selecciones de la v1. No hubo reentrenamiento ni ajuste fino posterior al corte.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas simples (el autor confirma que hechos básicos como la capital de Canadá se responden correctamente).
- Tool calling / function calling: la evaluación principal del autor mide la elección correcta de herramientas y argumentos en conversaciones multi-turno.
- Razonamiento multi-paso: el modelo conserva el modo de razonamiento del original (reasoning low/medium), aunque el autor documenta daños en razonamiento.
- Capacidades multilingües: no disponibles (no se documentan).
- Generación de código: capacidad degradada de forma explícita; el autor documenta que una función de Fibonacci en Python produce resultados incorrectos.
- Razonamiento científico/técnico: capacidad degradada; se documenta una respuesta de física que confunde dispersión con pigmentos y refracción.

## Casos de uso

- Investigación sobre poda de MoE: el modelo sirve como caso de estudio reproducible para analizar el impacto del pruning por expertos en un MoE de 120B, gracias a la publicación de las puntuaciones REAP por capa.
- Experimentos de "healing": el modelo está pensado como punto de partida para ajuste fino o destilación que recupere las capacidades perdidas tras el corte, comparando con el modelo completo como referencia.
- Evaluación de metodologías de selección de expertos: permite contrastar la puntuación REAP frente a otras heurísticas (frecuencia de router, magnitud de activación) sobre el mismo modelo base.
- Benchmarking de tool calling en modelos podados: el conjunto de 196 conversaciones held-out del autor (314 turnos) sirve como test para medir la degradación en elección de herramientas.
- Estudio de robustez en código: útil para caracterizar cómo el pruning afecta a tareas de generación de código, dado que el autor documenta fallos concretos en Fibonacci.
- Despliegue en entornos de investigación con recursos limitados: al ocupar 20,34 GiB en GGUF MXFP4, permite ejecutar un derivado de gpt-oss-120b en una sola GPU de 24 GB o en configuraciones consumer, aunque sin garantías de calidad.
- Análisis de curvas de degradación: el autor publica resultados para 100%, 75%, 50%, 35%, 32%, 25% y 16% de expertos conservados, lo que permite estudiar el punto de ruptura del modelo.

## Benchmarks y rendimiento

El autor publica una evaluación sobre 196 conversaciones held-out de tool calling (≈314 turnos de asistente, thinking desactivado). Un turno se considera correcto si usa las mismas herramientas y argumentos que el profesor de referencia o si correctamente no usa ninguna herramienta.

| Proporción conservada | Expertos por capa | Parámetros aprox. | Held-out | Herramientas correctas | Palabras/s (A100) |
|---|---|---|---|---|---|
| 100% | 128 | 117B | 204/314 | 40 | 116,5 |
| 75% | 96 | 88B | 204/314 | 39 | 98,8 |
| 50% | 64 | 59B | 196/314 | 40 | 99,3 |
| 35% | 45 | 42B | 187/310 | 39 | 98,2 |
| 32% (v1; v2 difiere solo en capa 35) | 41 | 38B | 192/312 | 38 | 98,2 |
| 25% | 32 | 31B | 176/300 | 25 | 97,3 |
| 16% | 21 | 20B | roto (servidor caído; 46 de 71 turnos devueltos) | 0 | 98,1 |

Como referencia, el gpt-oss-20b original obtiene 196/313 en las mismas conversaciones, con un tamaño similar y sin daño. El autor advierte que estas conversaciones no evalúan código, por lo que el smoke test reveló daños que la puntuación no refleja.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF MXFP4 ocupa 20,34 GiB, por lo que requiere al menos ~21-22 GB de VRAM para cargarse completo en GPU (sin offloading).
- GPU recomendadas: A100 (usada por el autor para las pruebas, con 116,5 palabras/s en el modelo completo y ~98 palabras/s en el podado), H100, L40S, RTX 4090 (24 GB, ajustada al límite).
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) o RTX 3090 (24 GB) con MXFP4, siempre que el runtime soporte el formato y el modelo MoE podado.
- Opciones de despliegue: llama.cpp (el autor usó una build con parches de expert-mask, expert-trace y expert-mass, denominada Brain Engine); también debería funcionar con otros runtimes que soporten GGUF y MXFP4, aunque no se documenta explícitamente.
- Latencia y throughput: ~98 palabras/s en A100 según las pruebas del autor (para el corte al 32%); no se publican latencias por token ni throughput en otras GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento tool calling (held-out) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-120b-REAP-38B-UNHEALED (este) | 38,9B (41 expertos/capa, top-4) | no disponible | 192/312 | Apache 2.0 | GGUF en HF |
| openai/gpt-oss-120b (original) | 117B aprox. (128 expertos/capa, top-4) | no disponible | 204/314 | Apache 2.0 | HF, múltiples formatos |
| openai/gpt-oss-20b (original) | no disponible | no disponible | 196/313 | Apache 2.0 | HF, múltiples formatos |
| Corte al 50% (64 expertos/capa) | 59B aprox. | no disponible | 196/314 | Apache 2.0 | Solo evaluado con máscara, no publicado como archivo |

## Limitaciones y advertencias

- Modelo explícitamente dañado: el autor lo etiqueta como "[UNHEALED]" y advierte de que no se reentrenó tras el corte, por lo que no es apto para uso diario.
- Generación de código incorrecta: se documenta una función de Fibonacci en Python que describe mal la secuencia y devuelve `n` en lugar del valor correcto.
- Razonamiento científico degradado: se documenta una respuesta de física que confunde dispersión con pigmentos y refracción.
- La evaluación held-out no cubre código, por lo que la puntuación de tool calling sobreestima la calidad real del modelo.
- El modelo completo (100%) obtiene solo 40 herramientas correctas de 314 turnos, lo que sugiere que la tarea de referencia es exigente; el podado baja a 38.
- Al 25% de expertos conservados la elección de herramientas cae drásticamente (25 correctas frente a 40); al 16% el servidor se cae.
- No se documentan idiomas soportados ni longitud de contexto; se desconoce si el corte afecta a la ventana de contexto.
- Riesgo de alucinación: no cuantificado, pero esperable dado el daño documentado en razonamiento.
- Sesgos: no documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el estado dañado del modelo desaconseja su uso en producción.
- El archivo se distribuye solo en GGUF MXFP4; no hay safetensors ni otras cuantizaciones publicadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MouseWurX/gpt-oss-120b-REAP-38B-UNHEALED-GGUF
- Dataset de puntuaciones REAP: https://huggingface.co/datasets/MouseWurX/REAP-scores-gpt-oss-120b
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- GGUF de origen: https://huggingface.co/ggml-org/gpt-oss-120b-GGUF (commit `7200b74bea78b0a2964ef9f3897eefa401e890ff`)
- llama.cpp (runtime base de Brain Engine): https://github.com/ggml-org/llama.cpp
- Paper de REAP: no disponible en la información proporcionada.
