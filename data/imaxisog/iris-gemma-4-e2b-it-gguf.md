# ImAXISOG/iris-gemma-4-e2b-it-gguf

## Resumen

Iris Gemma 4 E2B es un ajuste fino mediante LoRA del modelo google/gemma-4-E2B-it de Google, desarrollado por ImAXISOG para la aplicación Iris, una herramienta de escritura que se ejecuta en el dispositivo. El modelo está especializado en dos tareas concretas: la corrección de ortografía, gramática, mayúsculas y puntuación (operación "Fix") sin alterar el resto del texto, y la reescritura de mensajes en distintos tonos (Professional, Friendly, Shorter, Clearer, Funny) preservando el contenido y la estructura del original.

El modelo parte de la arquitectura Gemma 4 de Google con aproximadamente 4.630 millones de parámetros totales según el recuento de safetensors del modelo base, y se distribuye en formato GGUF cuantizado Q4_K_M con un tamaño de repositorio de 6,2 GB. Lee inglés, hindi en escritura devanagari y hinglish (hindi transcrito con caracteres latinos), y siempre responde en inglés. Está pensado para equipos con 8 GB de memoria, aunque el autor indica que no se ha probado todavía en una máquina real de 8 GB.

La relevancia actual del modelo reside en su enfoque de especialización extrema: en lugar de competir como modelo generalista, optimiza dos tareas de escritura muy acotadas para ejecución local en hardware de consumo, con un rendimiento declarado que supera al Gemma 4 E4B-it sin entrenar en corrección inglesa (86 % frente a 52 %) y en reescritura de tono. La licencia Apache 2.0 (una versión modificada de la licencia de Gemma 4) facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), ajuste fino con LoRA |
| Parametros totales | 4.628.569.635 (recuento de safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M para pesos; tabla de embeddings por capa (`per_layer_token_embd`) en Q4_K |
| Idiomas soportados | en, hi (devanagari), hinglish (entrada); salida siempre en inglés |
| Licencia | Apache 2.0 (versión modificada de la licencia de Gemma 4) |
| Formato de pesos | GGUF (este repo); también disponible variante MLX |
| Tamano del repositorio | 6,2 GB (archivo GGUF Q4_K_M de 2,81 GB) |
| Modelo base | google/gemma-4-E2B-it |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 4 de Google, un transformer denso del que no se detallan en la información disponible ni el número de capas ni la configuración de atención. El ajuste se realizó mediante LoRA sobre el checkpoint instructivo google/gemma-4-E2B-it, un proceso que permite especializar el modelo en tareas de escritura sin reentrenar todos los pesos. El autor no especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable no está en la arquitectura sino en la disciplina de la tarea: el modo "Fix" está entrenado para corregir únicamente errores de ortografía, gramática, mayúsculas y puntuación, preservando las palabras, abreviaturas, jerga y registro casual del usuario, y devolviendo el texto sin cambios si no contiene errores. El modo "Tones" reescribe el mensaje manteniendo todos los puntos, quién hace qué y las preguntas como preguntas. El modelo se distribuye en GGUF Q4_K_M con la tabla de embeddings por capa en Q4_K, lo que reduce el archivo a 2,81 GB, y existe una variante MLX de 3,72 GB para Macs.

## Capacidades

- Corrección de texto en inglés: ortografía, gramática, mayúsculas y puntuación, sin alterar el contenido ni el registro del original.
- Reescritura de tono en cinco estilos: Professional, Friendly, Shorter, Clearer y Funny.
- Preservación de contenido en la reescritura: mantiene todos los puntos, la asignación de acciones y las preguntas como preguntas.
- Comprensión de entrada multilingüe: inglés, hindi en devanagari y hinglish.
- Salida monolingüe en inglés, incluso cuando la entrada es hindi o hinglish.
- Ejecución en el dispositivo (on-device) mediante llama.cpp y formato GGUF.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Corrección de borradores en aplicaciones de escritura: el modelo se integra como función "Fix" que devuelve el texto corregido sin reescribir el estilo, adecuado para usuarios que quieren mantener su voz y sus abreviaturas.
- Reescritura de correos profesionales: un mensaje informal se transforma en tono Professional conservando todos los puntos y las preguntas, útil en clientes de correo con procesamiento local.
- Acortado de mensajes para canales con límite de caracteres: el tono Shorter condensa el texto manteniendo la información esencial, apropiado para SMS, notificaciones o mensajería instantánea.
- Clarificación de instrucciones ambiguas: el tono Clearer reformula mensajes confusos sin perder el contenido, aplicable en documentación interna o comunicación de equipos.
- Normalización de mensajes de soporte en inglés: textos escritos en hinglish se convierten a inglés correcto, lo que facilita la comunicación con clientes angloparlantes en equipos del sur de Asia.
- Asistencia de escritura totalmente offline: al ejecutarse en GGUF con llama.cpp sobre equipos de 8 GB, permite corrección y reescritura sin conexión ni envío de datos a la nube, relevante para entornos con requisitos de privacidad.
- Generación de variantes de tono para pruebas A/B de copy: el modelo produce versiones Professional, Friendly y Funny de un mismo mensaje para evaluar cuál funciona mejor en campañas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente; la evaluación fue realizada por un modelo de IA como juez ciego, respuesta a respuesta, sobre borradores creados solo para la prueba):

| Tarea | Gemma 4 E4B-it sin entrenar | Iris Lighter (E2B) | Iris Best quality (E4B) |
|---|---|---|---|
| English Fix: aceptado (50 borradores) | 52 % | 86 % | 90 % |
| Professional and Friendly: enviaría (100 respuestas) | 86 % | 88 % | 93 % |
| Shorter and Clearer: enviaría (100 respuestas) | 75 % | 86 % | 90 % |
| Funny: enviaría (50 respuestas) | 4 % | 56 % | 66 % |
| Hindi y Hinglish, Fix (a inglés): aceptado (82 borradores) | 91 % | 71 % | 95 % |
| Hindi y Hinglish, tonos (a inglés): enviaría (240 respuestas) | 71 % | 47 % | 76 % |

El autor advierte que las diferencias inferiores a unos 8 puntos están dentro del ruido. El modelo Lighter (E2B) rinde casi a la par que el E4B en inglés, pero es claramente inferior en hindi y hinglish.

## Requisitos de hardware

- VRAM/memoria estimada: 1,9 GB de memoria de trabajo más el archivo de 2,8 GB retenido en memoria, un total de 4,8 GB en Windows según el autor.
- Equipos objetivo: Macs y PCs Windows con 8 GB de memoria (el autor indica que no se ha probado en una máquina real de 8 GB).
- Mac: la variante MLX iris-gemma-4-e2b-it-mlx requiere 2,9 GB en pico.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible.
- Despliegue: llama.cpp (formato GGUF); variante MLX para Apple Silicon.
- Latencia y throughput: no disponibles. El autor advierte que en Windows, si la memoria escasea, el sistema descarga el archivo de memoria y lo relee de disco, lo que ralentiza las respuestas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Iris Gemma 4 E2B (este) | 4.628.569.635 | no disponible | English Fix 86 %, Hindi Fix 71 % | Apache 2.0 (modificada de Gemma 4) | GGUF y MLX en Hugging Face |
| Iris Gemma 4 E4B | no disponible | no disponible | English Fix 90 %, Hindi Fix 95 % | Apache 2.0 (modificada de Gemma 4) | GGUF y MLX en Hugging Face |
| Gemma 4 E4B-it sin entrenar | no disponible | no disponible | English Fix 52 %, Hindi Fix 91 % | licencia de Gemma 4 | Hugging Face (Google) |

La comparativa se limita a los modelos que el autor incluye en su propia evaluación. No se dispone de datos de otros modelos comparables de corrección gramatical en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo responde en inglés; no genera salida en hindi ni en hinglish, aunque comprenda esas entradas.
- Rendimiento notablemente inferior en hindi y hinglish (71 % en Fix, 47 % en tonos) frente al modelo E4B de la misma familia (95 % y 76 %).
- El tono Funny obtiene solo un 56 % de aceptación, el resultado más bajo de todas las tareas.
- Los benchmarks son declarados por el autor, no verificados, y evaluados por un modelo de IA como juez; el propio autor señala que las diferencias menores de 8 puntos están dentro del ruido.
- No se ha probado en una máquina real de 8 GB ni en un PC Windows real; los números de Windows se midieron con llama.cpp sobre los núcleos de un Mac.
- No se documentan la longitud de contexto, los sesgos conocidos ni las tasas de alucinación.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo especializado en reescritura, el riesgo principal es la alteración no deseada del contenido, mitigado por el entrenamiento explícito para preservar puntos y preguntas.
- La licencia es Apache 2.0 pero se describe como una versión modificada de la licencia de Gemma 4; conviene revisar los términos de Gemma 4 enlazados por el autor antes de un uso comercial.
- El modelo está entrenado exclusivamente para dos tareas y no debe emplearse como modelo generalista de generación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ImAXISOG/iris-gemma-4-e2b-it-gguf
- Variante MLX: https://huggingface.co/ImAXISOG/iris-gemma-4-e2b-it-mlx
- Modelo de mayor calidad (E4B, GGUF): https://huggingface.co/ImAXISOG/iris-gemma-4-e4b-it-gguf
- Modelo de mayor calidad (E4B, MLX): https://huggingface.co/ImAXISOG/iris-gemma-4-e4b-it-mlx
- Colección de modelos de escritura Iris: https://huggingface.co/collections/ImAXISOG/iris-writing-models-6afd5f1c54a5d9692f56c625
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
