# ImAXISOG/iris-gemma-4-e2b-it-mlx

## Resumen

Iris Gemma 4 E2B es un ajuste fino del modelo google/gemma-4-E2B-it de Google, desarrollado por ImAXISOG para Iris, una aplicación de escritura y corrección gramatical para macOS y Windows. El modelo está especializado en tres tareas concretas: corrección de ortografía, gramática y puntuación ("Fix") y reescritura de mensajes con distintos tonos (Professional, Friendly, Shorter, Clearer, Funny), preservando el significado y la voz del autor. Soporta inglés, hindi en escritura devanagari y hinglish (hindi transcrito con caracteres latinos).

El ajuste se realizó con LoRA sobre ejemplos de escritura y el adaptador se fusionó en los pesos finales, que se distribuyen en cuantización de 4 bits y en formato MLX (safetensors). Se han eliminado los pesos de audio del modelo base, pero se conservan los de visión para mantener la compatibilidad con cargadores estándar. El modelo tiene 4.799.472.931 parámetros y el repositorio ocupa 3,8 GB. Está pensado para inferencia en dispositivo ("on-device"), con un consumo de memoria de aproximadamente 2,9 GB en Apple Silicon para mensajes cortos y unos 0,2 segundos por respuesta.

La relevancia de este modelo radica en su enfoque en eficiencia y despliegue local: compite directamente con el modelo base sin ajustar e incluso con el Gemma 4 E4B-it (de mayor tamaño) en tareas de escritura en inglés, según las pruebas ciegas publicadas por el autor. Es un ejemplo de ajuste fino especializado para una aplicación de productividad concreta, con licencia Apache 2.0 y disponibilidad en dos formatos (MLX y GGUF).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), ajuste fino con LoRA fusionado; pesos en 4 bits |
| Parametros totales | 4.799.472.931 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (pesos); existe version GGUF del mismo autor |
| Idiomas soportados | en, hi (devanagari), hinglish (hindi en caracteres latinos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un transformer de la familia Gemma 4. El ajuste se realizó con LoRA sobre ejemplos de escritura elaborados y revisados con ayuda de modelos de IA, posteriormente filtrados para que ninguno se pareciera a los borradores de prueba. El adaptador LoRA se fusionó en los pesos finales y estos se cuantizaron a 4 bits. Además, se eliminaron los pesos de audio del modelo base, mientras que los de visión se conservaron para que los cargadores estándar de MLX puedan leer el modelo sin modificaciones.

El entrenamiento utilizó las instrucciones cortas propias de Iris para cada modo (Fix y los distintos tonos) con el modo "thinking" desactivado. El autor indica que otros prompts funcionan pero no fueron medidos. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. La innovación principal no está en la arquitectura sino en la optimización del despliegue: Iris mantiene en disco la tabla de palabras por capa (`embed_tokens_per_layer`) y lee solo las filas necesarias para cada token, y descarta las capas de visión al cargar, reduciendo el pico de memoria de unos 4,8 GB (cargador estándar) a los 2,9-3,2 GB reportados. El modelo se empareja con el drafter mlx-community/gemma-4-E2B-it-qat-assistant-bf16 para decodificación especulativa.

## Capacidades

- Corrección de ortografía, gramática y puntuación sin alterar el resto del texto (modo Fix).
- Reescritura con cinco tonos predefinidos: Professional, Friendly, Shorter, Clearer y Funny, manteniendo el significado y la voz del autor.
- Generación de texto conversacional y text-generation en general, heredada del modelo base.
- Soporte multilingüe limitado a inglés, hindi (devanagari) e hinglish.
- Conserva los pesos de visión del modelo base (aunque el ajuste se centra en texto).
- Compatible con decodificación especulativa mediante un modelo drafter.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Corrección gramatical integrada en editores de texto: el modelo corrige ortografía, gramática y puntuación en inglés con un 86% de aceptación en las pruebas del autor, adecuado para integrarse en aplicaciones de escritura de escritorio.
- Reescritura de correos profesionales: el modo Professional permite transformar un borrador informal en un mensaje formal conservando el contenido, con un 88% de respuestas "enviables" según la evaluación publicada.
- Acortamiento y clarificación de mensajes: los modos Shorter y Clearer logran un 86% de aceptación, útiles en herramientas de mensajería o CRM para condensar textos largos.
- Soporte para usuarios de hindi e hinglish: el modelo maneja tanto devanagari como hindi transcrito en caracteres latinos, lo que permite corrección y reescritura en contextos bilingües, aunque con menor calidad que en inglés (71% en Fix y 47% en tonos).
- Procesamiento local en dispositivos sin GPU dedicada: con 2,9 GB de memoria en Apple Silicon y unos 0,2 s por respuesta, es viable en portátiles para aplicaciones de escritura offline.
- Despliegue en Windows mediante GGUF: la versión GGUF (2,8 GB) funciona solo con CPU en un portátil en aproximadamente 0,5 s por respuesta, pensada para equipos con 8 GB de RAM.
- Generación de variantes de tono para marketing o comunicación: el modo Funny, aunque con menor tasa de aceptación (56%), permite generar alternativas desenfadadas para redes sociales o mensajes informales.

## Benchmarks y rendimiento

El autor publica una evaluación ciega por respuesta sobre borradores de prueba (ninguno usado en entrenamiento), comparando con Gemma 4 E4B-it sin ajustar a temperatura 0 y con los prompts cortos de Iris:

| Tarea | Gemma 4 E4B-it (sin ajustar) | Iris Gemma 4 E2B |
|---|---|---|
| Fix, inglés (50 borradores): aceptados | 52% | 86% |
| Professional y Friendly (100): enviarían | 86% | 88% |
| Shorter y Clearer (100): enviarían | 75% | 86% |
| Funny (50): enviarían | 4% | 56% |
| Fix, hindi y hinglish (82): aceptados | 91% | 71% |
| Tonos en hindi (240): enviarían | 71% | 47% |

Frente a Gemma 4 E2B-it sin ajustar, en otras rondas de evaluación: Fix en hindi 62-65% frente a 63% (sin cambio), tonos en hindi 47% frente a 36%, y Fix en inglés 86% frente a 60% (medido en la ronda de entrenamiento anterior, que comparte los ejemplos de inglés). El autor señala que para hindi el E4B es claramente mejor.

## Requisitos de hardware

- VRAM/memoria estimada: 2,9 GB de pico en mensajes cortos y 3,2 GB con 6.000 caracteres en Apple Silicon con las optimizaciones de Iris; un cargador estándar alcanza unos 4,8 GB.
- En Windows con GGUF: archivo de 2,8 GB, 1,9 GB de memoria propia más el archivo en memoria (4,8 GB en total en una máquina de 51 GB), pensado para equipos con 8 GB de RAM.
- GPU recomendadas: no se especifican; el modelo está orientado a inferencia en dispositivo (Apple Silicon y CPU). No hay datos para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, por tamaño (4,8 mil millones de parámetros en 4 bits), aunque no se han publicado pruebas en GPU dedicadas.
- Opciones de despliegue: mlx-swift-lm (`MLXVLM`) u otro cargador MLX que lea Gemma 4; versión GGUF para llama.cpp u otros motores compatibles con GGUF.
- Latencia y throughput: aproximadamente 0,2 s por respuesta en Apple Silicon y 0,5 s por respuesta en CPU de portátil con GGUF. No se documenta throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Iris Gemma 4 E2B (este) | 4,8 B | no disponible | Apache 2.0 | safetensors MLX, GGUF | Ajuste fino para escritura y tonos; en inglés supera al E4B sin ajustar en Fix y tonos |
| google/gemma-4-E2B-it | no disponible | no disponible | Apache 2.0 | safetensors | Modelo base sin ajustar; Fix en inglés 60%, tonos en hindi 36% |
| google/gemma-4-E4B-it | no disponible | no disponible | Apache 2.0 | safetensors | Modelo mayor sin ajustar; mejor en hindi (Fix 91%, tonos 71%) pero peor en inglés en las pruebas del autor |

No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está ajustado con instrucciones cortas específicas de Iris y con el modo thinking desactivado; otros prompts funcionan pero no han sido medidos.
- El rendimiento en hindi y hinglish es inferior al del modelo E4B sin ajustar (Fix 71% frente a 91%; tonos 47% frente a 71%), por lo que no es la mejor opción para ese idioma.
- El modo Funny tiene una tasa de aceptación moderada (56%), muy superior al modelo base (4%) pero lejos de los otros tonos.
- No se ha probado en un Mac de 8 GB ni en un portátil Windows real; las cifras de Windows provienen de mediciones en CPU de Mac.
- No se han probado documentos largos para calidad (solo memoria), tonos personalizados ni reglas de estilo propias del escritor.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas; al ser un ajuste sobre Gemma 4, hereda los sesgos del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el enlace de licencia apunta a los términos de Gemma 4 de Google; conviene revisar ambas condiciones.
- Los pesos de audio se han eliminado; las capacidades de audio del modelo base no están disponibles.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la ficha, por lo que no hay validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ImAXISOG/iris-gemma-4-e2b-it-mlx
- Versión GGUF: https://huggingface.co/ImAXISOG/iris-gemma-4-e2b-it-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Modelo drafter: https://huggingface.co/mlx-community/gemma-4-E2B-it-qat-assistant-bf16
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
