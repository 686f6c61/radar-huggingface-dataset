# ImAXISOG/iris-gemma-4-e4b-it-gguf

## Resumen

Iris Gemma 4 E4B (GGUF) es un ajuste fino del modelo `google/gemma-4-E4B-it` de Google, publicado por ImAXISOG como parte de Iris, una aplicación de gramática y tono para macOS y Windows. El modelo está especializado en tareas de escritura: corrección de ortografía, gramática y puntuación ("Fix") y reescritura con distintos tonos (Professional, Friendly, Shorter, Clearer, Funny) preservando el significado y la voz del autor. Se distribuye en formato GGUF cuantizado a Q4_K_M para inferencia local en CPU.

El ajuste se realizó con LoRA sobre ejemplos de escritura y el adaptador se fusionó en los pesos finales; además, los pesos se convirtieron a 4 bits y se eliminaron los pesos de audio del modelo base. El modelo conserva la arquitectura del Gemma 4 E4B original, con 7.463.013.674 parámetros totales y un repositorio de 9,9 GB que incluye las distintas cuantizaciones GGUF.

Su relevancia radica en que ofrece una alternativa de inferencia en dispositivo (on-device) para tareas de escritura, con un consumo de memoria medido de 3,7-4,1 GB en Apple silicon y 4,6 GB de archivo en Windows, lo que lo hace viable en equipos de consumo sin GPU dedicada. La licencia Apache 2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4 E4B; detalles no disponibles) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (pesos a 4 bits; tabla de embeddings por capa a Q4_K) |
| Idiomas soportados | en, hi (devanagari) y Hinglish (hindi escrito en caracteres latinos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también disponible en MLX en otro repositorio) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it`, un transformer de 7.463.013.674 parámetros totales. El ajuste fino se realizó con LoRA sobre ejemplos de escritura generados y revisados con modelos de IA, posteriormente filtrados para que ninguno se pareciera a los borradores de prueba. El adaptador LoRA se fusionó en los pesos finales, los pesos se convirtieron a 4 bits y se eliminaron los pesos de audio del modelo base. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

La conversión a GGUF se realizó con `convert_hf_to_gguf.py` de llama.cpp a partir del modelo MLX, y después se cuantizó a Q4_K_M con la tabla de embeddings por capa (`per_layer_token_embd`) en Q4_K en lugar de Q6_K, lo que reduce el tamaño del archivo y acelera ligeramente la inferencia. El modelo fue entrenado con las instrucciones cortas de Iris para cada modo y con el modo "thinking" desactivado; se recomienda usar `chat_template_kwargs: {"enable_thinking": false}` y temperatura 0.

## Capacidades

- Corrección de ortografía, gramática y puntuación ("Fix") sin alterar el contenido del texto.
- Reescritura con tonos predefinidos: Professional, Friendly, Shorter, Clearer y Funny, preservando el significado y la voz del autor.
- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Soporte multilingüe para inglés, hindi (devanagari) y Hinglish.
- Compatible con endpoints (`endpoints_compatible`).
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en esta variante (los pesos de audio fueron eliminados).

## Casos de uso

- Corrección gramatical en aplicaciones de escritura: el modelo corrige ortografía, gramática y puntuación manteniendo el texto original, con una tasa de aceptación del 90 % en inglés y del 95 % en hindi y Hinglish según las pruebas del autor.
- Reescritura de correos profesionales: el tono Professional reescribe mensajes conservando el significado, con un 93 % de respuestas "enviables" en las pruebas combinadas de Professional y Friendly.
- Simplificación de textos: el tono Clearer y el tono Shorter permiten condensar o aclarar mensajes, con un 90 % de aceptación en las pruebas del autor.
- Asistencia de escritura en dispositivo para macOS y Windows: el modelo cabe en 3,7-4,1 GB de memoria en Apple silicon y en 4,6 GB de archivo en Windows, por lo que puede ejecutarse sin GPU dedicada en equipos de 16 GB de RAM.
- Soporte para usuarios de hindi y Hinglish: cubre la corrección y los tonos en devanagari y en hindi transliterado, con tasas de aceptación del 95 % en Fix y del 76 % en tonos.
- Integración en pipelines de procesamiento de texto por lotes: al ejecutarse con llama.cpp y `llama-server`, puede desplegarse en servidores locales para corregir o reescribir documentos, aunque el autor recomienda una petición a la vez (`-np 1`).
- Generación de variantes de tono para marketing o comunicación informal: el tono Funny, aunque con menor tasa de aceptación (66 %), permite generar versiones desenfadadas de un mensaje.

## Benchmarks y rendimiento

El autor publica una evaluación ciega por respuesta sobre borradores de prueba no incluidos en el entrenamiento, a temperatura 0 y con los prompts cortos de Iris, comparando con el modelo base sin ajustar:

| Prueba | Gemma 4 E4B-it (antes) | Este modelo |
|---|---|---|
| Fix, inglés (50 borradores): aceptadas | 52 % | 90 % |
| Professional y Friendly (100): enviables | 86 % | 93 % |
| Shorter y Clearer (100): enviables | 75 % | 90 % |
| Funny (50): enviables | 4 % | 66 % |
| Fix, hindi y Hinglish (82): aceptadas | 91 % | 95 % |
| Tonos en hindi (240): enviables | 71 % | 76 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; el modelo está pensado para ejecución en dispositivo.
- Memoria en Mac (Apple silicon): 3,7 GB de pico en mensajes cortos y 4,1 GB con 6.000 caracteres; aproximadamente 0,3 s por respuesta.
- Memoria en Windows: archivo de 4,6 GB; unos 1,05 s por respuesta solo con el procesador de un portátil; 3,8 GB de memoria propia más el archivo (8,4 GB en total en una máquina de 51 GB). Se recomiendan 16 GB de RAM.
- GPU recomendadas: no disponibles; el modelo está orientado a CPU y Apple silicon.
- Cabe en GPU de consumo: no se han publicado datos al respecto.
- Opciones de despliegue: llama.cpp (`llama-server -m iris-gemma-4-e4b-it-Q4_K_M.gguf -np 1 --jinja`); también existe una variante MLX para Apple silicon.
- Latencia y throughput: aproximadamente 0,3 s por respuesta en Mac y 1,05 s en CPU de portátil Windows; se recomienda procesar una petición a la vez (`-np 1`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Iris Gemma 4 E4B (GGUF) | 7.463.013.674 | no disponible | Apache 2.0 | GGUF, MLX | Ajuste fino para corrección y tonos; evaluación propia del autor |
| google/gemma-4-E4B-it | no disponible en la información | no disponible | Gemma 4 License (según enlace del autor) | no disponible | Modelo base sin ajustar; referencia en las pruebas del autor |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- El modelo fue entrenado con las instrucciones cortas de Iris para cada modo y con el modo thinking desactivado; otros prompts funcionan pero no fueron medidos.
- No se ha probado en un Mac de 8 GB ni en un portátil Windows real; las mediciones de Windows se realizaron en el procesador de un Mac.
- No se ha evaluado la calidad en documentos largos (solo la memoria), los tonos personalizados ni las reglas de estilo propias de cada escritor.
- El tono Funny tiene una tasa de aceptación notablemente inferior (66 %) que el resto de modos.
- Riesgo de alucinación y sesgos: no documentado por el autor; al ser un ajuste fino sobre un modelo base de Google, puede heredar los sesgos del modelo original.
- El modelo solo declara soporte para inglés, hindi y Hinglish; no se ha documentado su comportamiento en castellano ni en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el autor enlaza a la licencia de Gemma 4 de Google (`license_link`), por lo que conviene verificar las condiciones del modelo base.
- El autor recomienda ejecutar una sola petición a la vez (`-np 1`), lo que limita el throughput en despliegues concurrentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ImAXISOG/iris-gemma-4-e4b-it-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Variante MLX: https://huggingface.co/ImAXISOG/iris-gemma-4-e4b-it-mlx
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
