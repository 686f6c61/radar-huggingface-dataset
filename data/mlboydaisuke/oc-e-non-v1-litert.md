# mlboydaisuke/Oc-e-Non-v1-LiteRT

## Resumen

Oc-e-Non-v1 LiteRT-LM es una conversión al formato LiteRT-LM (el runtime de Google para ejecución en dispositivo, sucesor de TensorFlow Lite) del modelo p-e-w/Oc-e-Non-v1, que a su vez es un ajuste fino de Qwen3-4B-Instruct-2507 orientado a respuestas breves. El trabajo de conversión lo firma el usuario mlboydaisuke y se ha realizado con litert-torch 0.10.0 y ai-edge-quantizer 0.10.1 para LiteRT-LM 0.19. El resultado son dos ficheros `.litertlm` cuantizados (int8 por canal y mixto INT4 con activaciones fp16) pensados para inferencia local en móviles y equipos de sobremesa con GPU.

El modelo conserva la arquitectura transformer densa de Qwen3-4B-Instruct-2507 (4 000 millones de parámetros, sin mezcla de expertos) y hereda su licencia Apache 2.0. La modificación de p-e-w consiste en un ajuste con la herramienta Heretic para reducir la longitud media de respuesta aproximadamente a la mitad, eliminando además el modo de razonamiento (thinking mode) del modelo original.

Su relevancia práctica está en la combinación de tamaño contenido, contexto de 4 096 tokens y empaquetado nativo para LiteRT-LM: permite desplegar un modelo de 4B en un Galaxy S26 con 18,1 tokens/s de decodificación en GPU y un pico de memoria de 1,73 GB. Es, por tanto, una opción para asistentes locales en Android o macOS con respuestas concisas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4 000 millones (heredados del modelo base Qwen3-4B-Instruct-2507) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4 096 tokens (prompt + respuesta + turnos previos) |
| Tipos de cuantizacion | int8 por canal (todos los lineales y tabla de tokens); mixto INT4 en bloques de 32 para lineales con tabla de tokens y capa de salida en int8 |
| Idiomas soportados | inglés (`en` según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); dos ficheros: `oc_e_non_v1_mixed_int4b32_fp16act_ekv4096.litertlm` (3,05 GB) y `oc_e_non_v1_int8_ekv4096.litertlm` (4,06 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507: un transformer denso de 4 000 millones de parámetros. Sobre ese checkpoint, p-e-w aplicó un ajuste con Heretic (herramienta de la comunidad para modificar el comportamiento de modelos) con el objetivo de acortar las respuestas; según la model card del autor original, la longitud media de respuesta se reduce aproximadamente a la mitad. El modelo resultante no tiene modo de pensamiento (thinking mode): responde directamente, sin cadena de razonamiento explícita.

La conversión a LiteRT-LM parte del checkpoint en bf16 (revisión `dbf4e269`) y se realiza con `export_hf` de litert-torch 0.10.0 y sus composites de GPU; la cuantización usa ai-edge-quantizer 0.10.1 con int8 por canal e int4 en bloques de 32. Los metadatos emplean la configuración Qwen3 de LiteRT-LM 0.19.1 con tres cambios: el sampler del checkpoint (top-k 20, top-p 0,8, temperatura 0,7), `<|endoftext|>` como segundo token de parada y ausencia de canal de pensamiento. El tokenizador es el `tokenizer.json` del checkpoint, copiado byte a byte. No se especifican en la información disponible el volumen ni la composición de los datos de entrenamiento del ajuste original.

## Capacidades

- Generación de texto en inglés con respuestas deliberadamente concisas (sin modo de pensamiento).
- Razonamiento aritmético básico y resolución de problemas tipo GSM8K (se reportan 75-84 aciertos sobre los primeros 100 problemas según el fichero y el backend).
- Generación de código: en las pruebas de la model card el modelo escribe funciones Python correctas (se cita el ejemplo de una función de Fibonacci, aunque con un error de resultado en una de las preguntas).
- Recuperación de contexto multi-turno: la prueba de "3-turn recall" se supera con ambos ficheros, dentro de la ventana de 4 096 tokens.
- Ejecución en dispositivo (on-device) mediante LiteRT-LM en GPU o CPU, con backend seleccionable por línea de comandos.
- No dispone de tool calling, function calling, agentes, visión, audio ni capacidades multimodales según la información disponible.

## Casos de uso

- Asistentes locales en Android: el fichero mixto INT4 ocupa 3,05 GB y decodifica a 18,1 tokens/s en la GPU de un Galaxy S26 con 1,73 GB de pico de memoria, lo que permite integrarlo en una app de asistente sin conexión.
- Respuestas breves en interfaces conversacionales: al estar ajustado para reducir a la mitad la longitud media de respuesta, encaja en escenarios donde se prima la concisión (notificaciones, resúmenes de una línea, respuestas de chat).
- Automatización de tareas de texto en macOS: con LiteRT-LM 0.19.2 sobre un Apple M4 Max se obtienen respuestas equivalentes al modelo original en 12 de 12 preguntas con el fichero int8, útil para scripts locales de generación de texto.
- Prototipado de aplicaciones móviles con LiteRT-LM: el comando `litert-lm run --from-huggingface-repo` permite probar el modelo en minutos y validar latencia y consumo antes de integrarlo.
- Clasificación y respuestas de formato corto dentro de una ventana de 4 096 tokens: preguntas y respuestas de un solo turno o conversaciones de hasta tres turnos con recuperación de contexto verificada.
- Evaluación comparativa de cuantizaciones: los dos ficheros (int8 y mixto INT4) permiten medir el compromiso entre precisión (12/12 frente a 11/12 en el conjunto de preguntas de la model card) y velocidad (18,1 frente a 12,8 tokens/s en GPU) en el mismo hardware.
- Ejecución en CPU cuando no hay GPU disponible: el fichero mixto INT4 en CPU alcanza 9,1 tokens/s de decodificación con 6,23 GB de pico de memoria, adecuado para equipos de sobremesa sin acelerador.

## Benchmarks y rendimiento

Precisión (decodificación greedy frente al modelo original en Transformers float32 sobre CPU de Mac; LiteRT-LM 0.19.2 en Apple M4 Max):

| Fichero | Backend | 12 preguntas: mismo veredicto | Recuerdo a 3 turnos | GSM8K (primeros 100) |
|---|---|---:|---|---:|
| Original (Transformers) | — | — | pasa | 83 |
| Mixto INT4 | GPU | 11/12 | pasa | 75 y 83 |
| Mixto INT4 | CPU | 11/12 | pasa | — |
| int8 | GPU | 12/12 | pasa | 84 |
| int8 | CPU | 12/12 | pasa | — |

Rendimiento en Samsung Galaxy S26 (1 024 tokens de prefill y 256 de decodificación):

| Fichero | Backend | Prefill (tok/s) | Decode (tok/s) | TTFT | Pico (`VmHWM`) |
|---|---|---:|---:|---:|---:|
| Mixto INT4 | GPU | 222,1 | 18,1 | 4,7 s | 1,73 GB |
| int8 | GPU | 119,5 | 12,8 | 8,7 s | 1,14 GB |
| Mixto INT4 | CPU | 36,1 | 9,1 | 28,5 s | 6,23 GB |
| int8 | CPU | 79,5 | 7,4 | 13,1 s | 7,16 GB |

En móviles (primeras 8 de las 12 preguntas, `litert_lm_advanced_main` de LiteRT-LM v0.19.0): 8/8 para cada fichero en GPU y CPU de un Pixel 11 Pro, y 8/8 para el mixto INT4 en GPU de Galaxy S26. En el Mac, dos ejecuciones del mixto INT4 en GPU dieron 75 y 83 en GSM8K, con texto idéntico en 39 de las 100 respuestas; el autor atribuye la variación al sampler por defecto de la ruta GPU de LiteRT-LM en Mac.

## Requisitos de hardware

- VRAM/memoria: el fichero mixto INT4 requiere 1,73 GB de pico en GPU de móvil y 6,23 GB en CPU; el int8, 1,14 GB en GPU y 7,16 GB en CPU. `VmHWM` no contabiliza la memoria que retiene el driver de GPU.
- GPU recomendadas: GPU integrada de Samsung Galaxy S26 (probada), Pixel 11 Pro (probada), Apple M4 Max (probada). No se han publicado pruebas con A100, H100 ni RTX 4090.
- GPU de consumo: cabe en móviles de gama alta con 8 GB o más de memoria; el autor advierte que no se probó en teléfonos con 8 GB de memoria.
- Despliegue: LiteRT-LM 0.19.0 o superior (probado en 0.19.0 en Android y 0.19.2 en Mac). Instalación con `pip install litert-lm` y ejecución con `litert-lm run --from-huggingface-repo mlboydaisuke/Oc-e-Non-v1-LiteRT oc_e_non_v1_mixed_int4b32_fp16act_ekv4096.litertlm --backend gpu --prompt "..."`.
- Latencia y throughput: en Galaxy S26 GPU, 4,7 s hasta el primer token y 18,1 tokens/s de decodificación; en Mac M4 Max no se reportan cifras de throughput, solo resultados de precisión.
- Advertencia de descarga: si `run` termina con bus error (código 138 en Mac) o con un log que contiene `too large for file size`, el fichero descargado puede estar incompleto; hay que borrarlo de `~/.litert-lm/cache/huggingface/mlboydaisuke/Oc-e-Non-v1-LiteRT/` y repetir la ejecución.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Oc-e-Non-v1 LiteRT-LM (este) | 4 000 M (denso) | 4 096 | `.litertlm` (int8, mixto INT4) | Apache 2.0 | Optimizado para LiteRT-LM; 18,1 tok/s en GPU de Galaxy S26 |
| p-e-w/Oc-e-Non-v1 | 4 000 M (denso) | no disponible en la información | safetensors (bf16) | Apache 2.0 | Modelo original en Transformers; respuestas breves; GSM8K 83 |
| Qwen/Qwen3-4B-Instruct-2507 | 4 000 M (denso) | no disponible en la información | safetensors | Apache 2.0 | Modelo base; incluye modo de pensamiento y respuestas más largas |
| Qwen3-4B-Instruct-2507 en LiteRT-LM | 4 000 M (denso) | no disponible en la información | `.litertlm` | Apache 2.0 | No se reportan conversiones oficiales ni cifras en la información disponible |

## Limitaciones y advertencias

- Solo inglés: la model card declara `en` como único idioma; no hay datos de rendimiento en castellano ni en otros idiomas.
- Ventana de contexto de 4 096 tokens compartida entre prompt, respuesta y turnos anteriores; conversaciones largas o documentos extensos no caben.
- El fichero mixto INT4 falla en la pregunta 10 del conjunto de evaluación (da fib(10) = 10 en lugar de 55) y obtiene 11/12 frente a 12/12 del int8; para aplicaciones sensibles a la precisión conviene usar el fichero int8.
- Variabilidad en GPU de Mac: dos ejecuciones del mixto INT4 dieron resultados distintos en GSM8K (75 y 83) y solo coincidieron en 39 de 100 respuestas, por el comportamiento del sampler por defecto de LiteRT-LM en esa ruta.
- Sin modo de pensamiento: no es adecuado para tareas que requieran cadenas de razonamiento largas.
- No se documentan sesgos específicos del ajuste; al derivar de Qwen3-4B-Instruct-2507 hereda los sesgos de su corpus de entrenamiento, no detallado en la información disponible.
- Riesgo de alucinación inherente a un modelo de 4B, agravado por la brevedad forzada de las respuestas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y del ajuste original.
- Requiere LiteRT-LM 0.19.0 o superior; versiones anteriores no fueron probadas. El autor advierte de un posible fallo silencioso por descarga incompleta del fichero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/Oc-e-Non-v1-LiteRT
- Modelo base del ajuste: https://huggingface.co/p-e-w/Oc-e-Non-v1
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Licencia de Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- Mediciones detalladas: https://huggingface.co/mlboydaisuke/Oc-e-Non-v1-LiteRT/blob/main/MEASUREMENTS.md
- Receta de conversión reproducible: https://github.com/john-rocky/hf-to-litertlm/blob/main/REPRODUCE.md
- Proyecto Heretic: https://heretic-project.org
