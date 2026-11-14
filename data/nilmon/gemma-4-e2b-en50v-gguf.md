# Nilmon/gemma-4-E2B-en50v-GGUF

## Resumen

Gemma 4 E2B en50v es una variante del modelo Gemma 4 E2B-it de Google en la que se ha recortado el vocabulario del tokenizador de 262.144 a 87.830 tokens, conservando únicamente inglés, código y símbolos comunes. El autor, Nilmon, no ha realizado ningún entrenamiento ni ajuste fino: los bloques transformer son idénticos bit a bit al GGUF original de ggml-org en cuantización Q4_0. Solo se han eliminado filas de las tablas por token (embeddings de entrada, embeddings por capa y capa de salida) y se ha adaptado el tokenizador en consecuencia.

El modelo resuelve un problema muy concreto de despliegue en dispositivo: el vocabulario multilingüe de Gemma 4 ocupa una fracción enorme del tamaño del fichero y del consumo de memoria en tiempo de ejecución. Al recortarlo, el GGUF pasa de 2,84 GB a 1,67 GB (−41 %), el pico de RAM baja de 3,02 GB a 2,53 GB (−16 %) y la velocidad de generación sube de 14,5 a 21,5 tokens por segundo (+48 %) en CPU, manteniendo la precisión en tool calling (100 % en 30 tareas) y una perplejidad en inglés dentro del margen de error.

Con 2.798.969.891 parámetros totales, licencia Apache-2.0 y formato GGUF para llama.cpp, es una opción pensada para inferencia local en CPU y entornos con memoria limitada donde el multilingüismo no es un requisito.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), pesos GGUF; bloques idénticos al original Q4_0 |
| Parámetros totales | 2.798.969.891 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de ejecución usa `-c 4096`) |
| Tipos de cuantización | Q4_0 (única publicada en el repo) |
| Idiomas soportados | inglés (principal); otras lenguas solo por byte fallback, con mayor coste en tokens y peor calidad |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E2B-it, un transformer de Google con 2.798.969.891 parámetros. Esta variante no introduce cambios arquitectónicos ni de entrenamiento: los bloques transformer son bit-idénticos al GGUF oficial de ggml-org en Q4_0. La modificación consiste exclusivamente en el recorte del vocabulario, aplicado fila a fila sobre los bytes ya cuantizados de las tablas por token (embeddings de entrada, embeddings por capa y capa de salida) y en la reconstrucción del tokenizador con los 87.830 tokens conservados, cuyos identificadores originales se documentan en `keep_ids_50v.json`.

El autor no proporciona detalles sobre los datos de entrenamiento del modelo base (número de tokens, composición del corpus, uso de RLHF o DPO) ni sobre innovaciones internas de Gemma 4. La innovación destacable de esta ficha es el propio método de recorte de vocabulario sobre pesos cuantizados, publicado con código y resultados en el repositorio `gguf-vocab-trim`. El repo incluye además un draft MTP (`mtp-gemma-4-E2B-en50v-Q4_0.gguf`) para decodificación especulativa, recortado con la misma lista de tokens y compatible únicamente con el modelo principal.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base `gemma-4-E2B-it`.
- Soporte de tool calling / function calling con esquemas JSON: el autor reporta 100 % de acierto en 30 tareas de su benchmark propio.
- Decodificación especulativa mediante el draft MTP incluido, que reduce el tiempo por tarea de tool calling de 2,00 s a 1,34 s (−33 %).
- Razonamiento: misma capacidad que el modelo base; el autor indica que las ganancias son de tamaño y velocidad, no de calidad.
- Código: el vocabulario conserva tokens de programación además de inglés y símbolos comunes.
- Capacidades multilingües muy limitadas: otras lenguas funcionan solo por byte fallback, con más tokens por frase (ejemplo del autor: una frase en hindi pasa de 12 a 29 tokens).
- Entrada de imagen y audio: no probada por el autor; el modelo se distribuye como text-only en la práctica.
- Modo de razonamiento desactivable en llama.cpp mediante `--reasoning off`.

## Casos de uso

- Asistentes locales en CPU: el modelo cabe en 2,53 GB de RAM en pico con llama-server, lo que permite desplegarlo en portátiles y equipos sin GPU dedicada para tareas de chat en inglés.
- Automatización de tool calling en pipelines: con 100 % de acierto en el benchmark del autor y decodificación especulativa MTP, es adecuado para agentes que invocan funciones con esquemas JSON en entornos con recursos ajustados.
- Generación y revisión de código en inglés: el vocabulario recortado conserva tokens de programación, y el tamaño reducido acelera la inferencia en editores o CLI locales.
- Prototipado de agentes multi-paso: el soporte de function calling y el bajo coste de ejecución permiten iterar sobre flujos de varias llamadas sin infraestructura GPU.
- Despliegue en dispositivos de borde: el recorte del 41 % en tamaño de fichero facilita distribuir el modelo en imágenes de contenedor o dispositivos con almacenamiento limitado.
- Servicios de atención al cliente en inglés con presupuesto de latencia estricto: 21,5 tok/s en un i5-11300H con 4 hilos ofrece respuestas interactivas sin acelerador hardware.
- Evaluación comparativa de técnicas de compresión: sirve como referencia reproducible para medir el impacto del recorte de vocabulario sobre perplejidad y velocidad, gracias al código y los resultados publicados.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos en CPU (Intel i5-11300H, 4 hilos), llama.cpp b12360, temperatura 0:

| Métrica | Original | Este modelo | Cambio |
|---|---|---|---|
| Tamaño de fichero | 2,84 GB | 1,67 GB | −41 % |
| Pico de RAM (llama-server) | 3,02 GB | 2,53 GB | −16 % |
| Tiempo por tarea de tool calling (con draft MTP) | 2,00 s | 1,34 s | −33 % |
| Velocidad de generación | 14,5 tok/s | 21,5 tok/s | +48 % |
| Precisión en tool calling (30 tareas, esquema JSON) | 100 % | 100 % | igual |
| Perplejidad en inglés (WikiText-103 test, 40×512) | 48,1 ± 1,9 | 45,7 ± 1,8 | dentro del error |

El autor advierte que la perplejidad ligeramente inferior se debe a que la probabilidad se reparte entre menos tokens y debe interpretarse como ausencia de pérdida medible, no como una mejora. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 1,67 GB de fichero en disco; pico de 2,53 GB de RAM con llama-server en CPU.
- GPU recomendadas: no disponibles; el autor solo valida ejecución en CPU.
- GPU de consumo: no se han probado; por tamaño (Q4_0, ~2,8B parámetros) cabría en GPUs de consumo con suficiente memoria, pero no hay datos publicados.
- Opciones de despliegue: llama.cpp (build con soporte de Gemma 4 y MTP; probado con b12360) mediante `llama-server`. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: 21,5 tok/s de generación y 1,34 s por tarea de tool calling en Intel i5-11300H con 4 hilos y decodificación especulativa activa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Gemma 4 E2B en50v (este) | 2.798.969.891 | no disponible | inglés (+ byte fallback) | Apache-2.0 | GGUF Q4_0 | 1,67 GB, 21,5 tok/s en CPU |
| google/gemma-4-E2B-it (base) | 2.798.969.891 | no disponible | multilingüe | Apache-2.0 | safetensors / GGUF | 2,84 GB en Q4_0, 14,5 tok/s en CPU |
| ggml-org/gemma-4-E2B-it-GGUF | 2.798.969.891 | no disponible | multilingüe | Apache-2.0 | GGUF | Referencia oficial de cuantizaciones; origen del Q4_0 recortado |

No se dispone de datos de benchmarks comparativos frente a modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés y código: otras lenguas dependen del byte fallback, consumen más tokens y degradan la calidad; no es adecuado para producción multilingüe.
- Entrada de imagen y audio no probada por el autor; no debe asumirse soporte multimodal.
- El benchmark de tool calling es reducido (30 tareas) y no constituye una evaluación general de calidad.
- La perplejidad ligeramente menor no implica mejor razonamiento; la capacidad es la misma que la del modelo base.
- Riesgo de alucinación inherente al modelo base; no se documentan mitigaciones adicionales.
- El draft MTP solo funciona con el fichero principal de este repo, no con el GGUF original ni con otras cuantizaciones.
- Requiere una build de llama.cpp con soporte de Gemma 4 y MTP; versiones anteriores no cargarán el modelo o la decodificación especulativa.
- Licencia Apache-2.0 según el autor, heredada del modelo base; conviene verificar los términos de uso de Gemma 4 de Google antes de un despliegue comercial.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nilmon/gemma-4-E2B-en50v-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- GGUF original de ggml-org: https://huggingface.co/ggml-org/gemma-4-E2B-it-GGUF
- Código, método y resultados del recorte de vocabulario: https://github.com/Nilanjan112233/gguf-vocab-trim
