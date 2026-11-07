# shgao/rsi-jev-v7.0-vl-3b

## Resumen

rsi-jev-v7.0-vl-3b es un modelo de decisión tipada (typed-decision model) desarrollado por el autor shgao dentro del proyecto RSI-Jev. No es un modelo generativo al uso: recibe un estado compuesto por texto y hasta cuatro imágenes, junto con una o varias preguntas de tipo `choice`, `noul` o `score`, y devuelve una probabilidad para cada opción en un único forward pass, sin generar tokens de razonamiento. Se construye recortando el modelo base shgao/rsi-jev-v7.0-vl-4b en la capa 20 de sus 32 capas de decoder, sin reentrenamiento alguno, conservando la cabeza de decisión de la capa 20 como cabeza principal y la de la capa 16 como salida temprana.

El resultado es un checkpoint autocontenido de 3,30B parámetros (2,23B en las 20 capas de decoder, 0,64B en embeddings de tokens, 0,33B en el vision tower y 0,05B en cada una de las dos cabezas de decisión) que reproduce de forma bit a bit las respuestas del 4B en modo `--effort medium` sobre 4.001 filas del Decision Index, con una latencia mediana de 19,6 ms frente a los 29,4 ms del 4B en la misma GPU.

Su relevancia radica en el paradigma "System One": una sola pasada hacia delante, sin decodificación autorregresiva, con parada temprana adaptativa entre las capas 16 y 20. Está pensado para tareas de clasificación y puntuación multimodal de baja latencia, no para generación de texto libre. La licencia es Apache 2.0 y el pipeline declarado es visual-question-answering.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-4B recortado a 20 capas) con vision tower y cabezas de decisión tipadas |
| Parametros totales | 3,30B (2,23B decoder + 0,64B embeddings + 0,33B vision tower + 0,05B cabeza principal + 0,05B cabeza early-exit) |
| Parametros activos | no disponible (no es MoE; la parada temprana reduce capas ejecutadas, no parámetros) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16 para tower y vision, fp32 para las cabezas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`tower.safetensors`, `visual.safetensors`, `scorer.safetensors`, `aux_scorers.safetensors`, `calibration.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3.5-4B (instruction-tuned) y conserva únicamente las capas de decoder 1 a 20 más la normalización final; las capas 21 a 32 se descartan. Los embeddings de tokens y el vision tower permanecen sin cambios. La cabeza de decisión de la capa 20 del 4B pasa a ser la cabeza principal, la de la capa 16 se mantiene como salida temprana y la de la capa 32 se elimina. Las tres cabezas originales se entrenaron en una única ejecución del v7.0-VL, y las de early-exit se entrenaron sobre estados desconectados, de modo que las primeras 20 capas son exactamente lo que la cabeza de la capa 20 fue entrenada para leer.

No hubo reentrenamiento: todos los pesos provienen del v7.0-VL 4B. La calibración emplea las temperaturas por salida del 4B (log T 0,28 en la capa 16 y 0,22 en la capa 20), con umbral 0,80 en la capa 16 para el modo `auto` y umbral único por defecto de 0,95. La innovación técnica clave es la atención prefix-bidirectional y el eco de opciones (option echo), que el paquete activa en tiempo de servicio, junto con la fijación de configuraciones de kernel para garantizar respuestas deterministas. El parámetro `effort` controla cuántas capas usa la pasada (16 o 20), no cuántos tokens se escriben.

## Capacidades

- Respuesta a preguntas de tipo `choice` (elección entre opciones), `noul` y `score` sobre un documento de texto y hasta cuatro imágenes.
- Salida de una probabilidad calibrada por cada opción en un único forward pass, sin generación de tokens.
- Parada temprana adaptativa: resuelve preguntas en la capa 16 o en la 20 según el umbral configurado.
- Exposición de `usage.depth`, la capa en la que se respondió cada pregunta.
- Procesamiento multimodal de hasta cuatro imágenes por estado.
- Servicio mediante la API HTTP de Jev (`rsi-jev serve v7.0-vl-3b`).
- No soporta generación de texto libre, tool calling, razonamiento multi-paso ni agentes: es un modelo de decisión, no un LLM conversacional.
- Capacidades multilingües: no disponible.

## Casos de uso

- Clasificación documental multimodal de baja latencia: dado un documento con imágenes adjuntas, el modelo devuelve la probabilidad de cada categoría en una sola pasada de 19,6 ms, adecuado para pipelines de triaje de alto volumen.
- Verificación visual de formularios: comparar el contenido de hasta cuatro imágenes con el texto declarado y puntuar la coincidencia mediante preguntas de tipo `score`.
- Enrutamiento de consultas en sistemas RAG: usar las probabilidades de opciones para decidir a qué índice o subsistema derivar una petición, con determinismo garantizado por la fijación de kernels.
- Moderación asistida: puntuar contenido textual e imágenes frente a políticas definidas como opciones tipadas, aprovechando la calibración por temperaturas para umbrales estables.
- Control de calidad en pipelines de datos: puntuar pares pregunta-respuesta o imagen-texto para filtrar muestras antes del entrenamiento, con la ventaja de no requerir decodificación.
- Evaluación automática de salidas de otros modelos: asignar probabilidades a opciones de calidad (correcto/incorrecto/parcial) sobre texto e imágenes en una única pasada, reduciendo coste frente a un LLM juez generativo.
- Servicio de decisión embebido en producción: al ocupar 6,8 GB en disco y ejecutarse en una sola pasada sin generación, encaja en entornos con requisitos estrictos de latencia y reproducibilidad.

## Benchmarks y rendimiento

| Modelo | Base | Suite de 15 benchmarks | Held-out (eval_final_v2) | Imágenes | Tamano del paquete |
|---|---|---|---|---|---|
| RSI-Jev-v7.0-VL-3B | v7.0-VL 4B, capas 1-20, salidas en 16/20 | 0,791 | 0,797 | sí | 6,8 GB |
| RSI-Jev-v7.0-VL-4B | Qwen3.5-4B (instruction-tuned), salidas en 16/20/32 | 0,798 | 0,811 | sí | 9,7 GB |
| RSI-Jev-v6.1-VL-27B | Qwen3.8-27B, dos fine-tunes promediados, salidas en 48/56/64 | 0,843 | no disponible en la información | sí | no disponible |

En el Decision Index 0.3 público, el 3B obtiene 60,01 frente a 60,61 del 4B, con latencia mediana de 19,6 ms frente a 29,4 ms. El 4B en modo `medium` (capa 20) se sitúa a 0,007 de la capa 32 en la suite y obtuvo 59,18 frente a 59,76 de `high` en la muestra de 16k del Decision Index. Los datos de ECE² no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el paquete pesa 6,8 GB en disco con pesos bf16 y cabezas fp32, por lo que se requiere al menos esa cifra más overhead de activaciones.
- GPU recomendadas: no disponibles en la información; la comparativa de latencia se realizó "en la misma GPU" sin especificar el modelo.
- Viabilidad en GPU de consumo: no confirmada en la información proporcionada.
- Opciones de despliegue: servidor propio del paquete `rsi-jev` (`rsi-jev serve v7.0-vl-3b`) o la clase `Decider("v7.0-vl-3b")`; requiere instalar `rsi-jev[fast,vision]` desde el repositorio de GitHub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: mediana de 19,6 ms por consulta en la GPU de referencia. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Suite 15 benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rsi-jev-v7.0-vl-3b | 3,30B | no disponible | 0,791 | Apache 2.0 | Hugging Face |
| rsi-jev-v7.0-vl-4b | 4B | no disponible | 0,798 | no disponible | Hugging Face |
| rsi-jev-v6.1-vl-27B | 27B | no disponible | 0,843 | no disponible | Hugging Face |

No se dispone de comparación con modelos de propósito general de la misma categoría en la información proporcionada, ya que rsi-jev es un modelo de decisión tipada y no un generador de texto, lo que limita la comparabilidad directa con LLM multimodales convencionales.

## Limitaciones y advertencias

- No genera texto: solo responde preguntas tipadas (`choice`, `noul`, `score`) devolviendo probabilidades; no sirve para chat, redacción ni razonamiento en lenguaje natural.
- Depende del paquete `rsi-jev` para activar el eco de opciones y la atención prefix-bidirectional con la que fue entrenado; servirlo con otro runtime puede alterar las respuestas.
- El determinismo se garantiza fijando configuraciones de kernel en el servidor del paquete; cambios en el entorno pueden romper la reproducibilidad bit a bit.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento; la calibración proviene del 4B y no se recalculó para el 3B.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Longitud de contexto no disponible, lo que impide planificar el tamaño máximo de documento e imágenes.
- Licencia Apache 2.0 permite uso comercial, pero las fuentes de entrenamiento y sus licencias se remiten al registro del 4B, no incluido en esta información.
- Modelo con 0 descargas y 0 likes en el momento del registro; sin validación comunitaria independiente.
- Sin resultados de benchmarks frente a modelos de propósito general; la suite de 15 benchmarks es interna del proyecto.

## Enlaces

- Hugging Face: https://huggingface.co/shgao/rsi-jev-v7.0-vl-3b
- Modelo base: https://huggingface.co/shgao/rsi-jev-v7.0-vl-4b
- Repositorio del proyecto: https://github.com/Shanghua-Gao/RSI-Jev
- Registro de versiones: https://github.com/Shanghua-Gao/RSI-Jev/tree/main/versions
- Registro de v7.0-VL: https://github.com/Shanghua-Gao/RSI-Jev/blob/main/versions/v7.0-vl.md
- Documentación de la API HTTP de Jev: https://github.com/Shanghua-Gao/RSI-Jev/blob/main/serve/README.md
