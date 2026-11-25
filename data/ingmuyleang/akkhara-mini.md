# INGMUYLEANG/akkhara-mini

## Resumen

Akkhara-mini es un modelo encoder-decoder de estilo T5, con 17,8 millones de parámetros, desarrollado por Ing Muyleang para convertir *Sing Khmer* (jémer escrito con letras latinas, tal como se teclea en chats) en escritura jémer nativa, devolviendo una lista ordenada de cinco sugerencias al estilo de un IME (input method editor). Su propósito es servir como motor de transliteración y romanización dentro de un teclado móvil, por lo que prima la latencia baja y el funcionamiento totalmente offline sobre la precisión absoluta en textos formales.

El modelo trabaja a nivel de carácter, con un tokenizador que emplea 6 tokens por carácter en el encoder y 3 en el decoder, y está pensado para ejecutarse en teléfonos: el export ONNX en int8 ocupa 18,5 MB y produce la primera sugerencia en torno a 10 ms en un Android reciente. Se distribuye con pesos safetensors para `transformers` y con un export ONNX Runtime (`encoder.onnx`/`decoder.onnx` y variantes int8) para despliegue en móvil, web y otros entornos.

Su relevancia actual radica en que cubre un nicho poco atendido: la entrada de texto jémer en dispositivos de gama baja y sin conexión, con soporte de code-mixing (palabras inglesas de chat que se mantienen tal cual) y un diccionario auxiliar de 46 abreviaturas. Frente al modelo hermano de 300M, ofrece un rendimiento muy cercano en conversación real (85 % frente a 87 % en top-1) con un tamaño 16 veces menor, a costa de algo menos de precisión en texto formal tipo noticia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5-style encoder-decoder, tokens a nivel de caracter (6 capas encoder + 3 capas decoder, d_model 384) |
| Parametros totales | 17.797.248 (17,8M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card recomienda trocear en fragmentos de ~6 palabras) |
| Tipos de cuantizacion | ONNX int8 (18,5 MB); pesos safetensors en precisión original; otras cuantizaciones no disponibles |
| Idiomas soportados | Jémer (km); palabras inglesas de chat en entradas mixtas se mantienen en inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX (`encoder.onnx`, `decoder.onnx`, `encoder.int8.onnx`, `decoder.int8.onnx`) |

## Arquitectura y entrenamiento

Se trata de un transformer encoder-decoder de estilo T5 con un tokenizador de granularidad de carácter (6 tokens por carácter en el encoder, 3 en el decoder), 6 capas en el encoder y 3 en el decoder, y dimensión de modelo 384. Esta configuración prioriza el coste computacional mínimo por token, coherente con su objetivo de inferencia en dispositivo. El pipeline recomendado ejecuta el encoder una vez por frase y el decoder una vez por letra jémer generada, con búsqueda voraz o beam search de 5 haces.

El entrenamiento se realizó sobre 398.000 pares Sing Khmer → jémer, incluidos 134 nombres de ministerios, universidades y bancos de Camboya, recopilados, generados, limpiados y revisados por el autor con ayuda de herramientas de IA (agy, Claude). El dataset asociado es `muyleanging/Akkhara-Sing-Khmer`, con acceso bajo petición. No se publican detalles de hardware, tiempo de entrenamiento ni hiperparámetros, ni consta el uso de RLHF o DPO. El modelo incluye además un fichero `abbreviations.tsv` con 46 abreviaturas mapeadas a su forma jémer completa, que es una lista aplicada externamente y no un conocimiento aprendido por la red.

## Capacidades

- Transliteración de Sing Khmer a escritura jémer con salida de top-5 ordenado (IME).
- Romanización inversa implícita: interpreta secuencias latinas como fonética jémer.
- Code-mixing: conserva palabras inglesas de chat (`benchmark`, `laptop`, `deadline`) y ofrece la grafía jémer de préstamo en el top-5 cuando existe (`deadline` → ដេតឡាញ, `internet` → អ៊ីនធឺណិត).
- Resolución de abreviaturas de chat (`tmr` → ស្អែក, `sry` → សុំទោស, `gn` → រាត្រីសួស្តី, `btw` → ម្យ៉ាងទៀត, `wyd` → ធ្វើអីហ្នឹង).
- Desambiguación por contexto limitada: el mismo par latino puede leerse de forma distinta según los vecinos (`ng` = និង / នឹង / ហ្នឹង).
- Ejecución offline en dispositivo mediante ONNX Runtime int8.
- No dispone de tool calling, function calling, capacidades de agente, visión ni audio.

## Casos de uso

- Teclado móvil con autocompletado: integrado en la aplicación Akkhara Keyboard, el modelo recibe la secuencia latina tecleada y devuelve cinco candidatos en jémer; con el export int8 la primera sugerencia llega en unos 10 ms en un Android reciente, lo que permite actualizar la barra de sugerencias sin bloquear la escritura.
- Mensajería instantánea en jémer: usuarios que escriben con caracteres latinos por comodidad obtienen la frase en escritura nativa, incluyendo abreviaturas de chat y palabras inglesas intercaladas, sin necesidad de conexión.
- Normalización de corpus de chat: para equipos que recopilan conversaciones en Sing Khmer y necesitan convertirlas a escritura jémer antes de analizarlas, el modelo procesa lotes con `transformers` y devuelve top-5 para revisión manual de los casos ambiguos.
- Entrada de datos en formularios y aplicaciones web: el export ONNX puede ejecutarse en el navegador o en el servidor para ofrecer sugerencias de escritura jémer a usuarios que no dominan el teclado nativo.
- Búsqueda y coincidencia de nombres propios: al incluir 134 nombres de ministerios, universidades y bancos, permite mapear variantes latinas de esas entidades a su denominación oficial en jémer, con el apoyo del fichero de abreviaturas.
- Transcripción asistida de mensajes cortos: para mensajes de hasta ~6 palabras, el modelo ofrece una primera opción fiable en conversación real (85 % top-1, 92 % top-5 en el conjunto de prueba de chat), adecuado para flujos de copia y pegado.
- Prototipado de correctores ortográficos: la salida top-5 y la métrica CER permiten construir capas de reordenación o filtrado léxico posteriores sin reentrenar el modelo.

## Benchmarks y rendimiento

Resultados publicados por el autor, con la misma búsqueda por haces (5 haces): split de test reservado de 7.821 frases, 39 frases reales de chat etiquetadas por un hablante nativo, 86 pruebas de contexto (la misma palabra de chat leída según sus vecinos) y 7 pruebas de palabras pegadas.

| Modelo | Test top-1 | Test top-5 | Test CER | Chat real top-1 / top-5 | Contexto #1 / top-5 | Pegadas |
|---|---|---|---|---|---|---|
| akkhara-mini (18M) | 58,1 % | 76,6 % | 4,55 % | 85 % / 92 % | 80 % / 99 % | 6/7 |
| akkhara-byt5-small (300M) | 62,0 % | 79,7 % | 3,73 % | 87 % / 95 % | 80 % / 98 % | 7/7 |

CER = proporción de letras incorrectas (menor es mejor). Top-5 = la frase correcta está entre las cinco sugerencias. En texto formal tipo noticia, el modelo de 300M es algo más preciso.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 17,8M de parámetros; el export int8 ocupa 18,5 MB en disco y se ejecuta en CPU sin GPU dedicada.
- GPU recomendadas: no necesarias; cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo, pero el caso de uso objetivo es CPU móvil.
- Cabe en cualquier GPU de consumo e incluso en teléfonos de gama media; el autor reporta ~10 ms para la sugerencia #1 con int8 en un Android reciente.
- Opciones de despliegue: `transformers` con `AutoModelForSeq2SeqLM` (safetensors), ONNX Runtime (encoder/decoder y variantes int8), integración en la app de teclado. No se documenta soporte específico de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: ~10 ms por sugerencia #1 en Android con int8; sin datos publicados de throughput por lote ni de latencia en servidor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (chat real top-1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| akkhara-mini | 17,8M | no disponible | 85 % | Apache-2.0 | Hugging Face (safetensors + ONNX) |
| akkhara-byt5-small | 300M | no disponible | 87 % | no disponible en la información proporcionada | Hugging Face |
| Otros modelos de transliteración jémer | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa disponible se limita al modelo hermano de 300M del mismo autor: akkhara-mini pierde entre 2 y 4 puntos en test y chat real, pero es 16 veces más pequeño y apto para ejecución en dispositivo. No se han identificado en la información proporcionada otros modelos comparables de transliteración Sing Khmer → jémer.

## Limitaciones y advertencias

- Entrenado mayoritariamente con pares sintéticos; el conjunto de prueba de chat real es pequeño (39 frases), por lo que la estimación de precisión en conversación tiene alta incertidumbre.
- Las abreviaturas cortas siguen siendo ambiguas (`ng`, `yt`, `dl`, `bn`); la respuesta correcta suele estar en el top-5 pero no siempre en la primera posición.
- Menor precisión en texto formal tipo noticia que el modelo de 300M del mismo autor.
- El modelo conoce palabras malsonantes de chat (aparecen en conversaciones reales), lo que puede producir sugerencias inapropiadas en entornos sensibles.
- Recomendación de trocear entradas largas en fragmentos de ~6 palabras; no se documenta la longitud de contexto real.
- El diccionario de abreviaturas (`abbreviations.tsv`) es una lista aplicada externamente, no conocimiento aprendido: su cobertura está limitada a 46 entradas.
- No se publican detalles de entrenamiento (hardware, tiempo, hiperparámetros), lo que dificulta la reproducibilidad.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del dataset asociado, cuyo acceso es bajo petición.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/INGMUYLEANG/akkhara-mini
- Modelo hermano de 300M: https://huggingface.co/muyleanging/Akkhara-ByT5-Small-Khmer
- Dataset: https://huggingface.co/datasets/muyleanging/Akkhara-Sing-Khmer
- Demo: https://huggingface.co/spaces/muyleanging/Akkhara-Demo
- Aplicación de teclado (repositorio): https://github.com/MuyleangIng/akkhara-keyboard
- Última release del APK: https://github.com/MuyleangIng/akkhara-keyboard/releases/latest
- Perfil del autor en Hugging Face: https://huggingface.co/muyleanging
- Perfil del autor en GitHub: https://github.com/MuyleangIng
