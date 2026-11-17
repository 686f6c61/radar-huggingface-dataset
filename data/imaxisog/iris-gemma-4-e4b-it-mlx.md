# ImAXISOG/iris-gemma-4-e4b-it-mlx

## Resumen

Iris Gemma 4 E4B (MLX) es un ajuste fino del modelo multimodal `google/gemma-4-E4B-it` de Google, publicado por ImAXISOG como el motor de escritura en local de Iris, una aplicación de gramática y tono para macOS y Windows. El modelo resuelve una tarea muy acotada: corregir ortografía, gramática y puntuación sin alterar nada más, y reescribir mensajes en cinco tonos predefinidos (Professional, Friendly, Shorter, Clearer, Funny) preservando el significado y la voz del autor. Está pensado para ejecutarse en el dispositivo del usuario, no en servidor.

Técnicamente es un fine-tune con LoRA sobre el modelo base, con el adaptador fusionado en los pesos, cuantizado a 4 bits y con los pesos de audio eliminados. Conserva los pesos de imagen para que los cargadores estándar de MLX funcionen. El repositorio ocupa 4,6 GB y los safetensors declaran 7.636.276.266 parámetros totales. La longitud de contexto no se especifica en la información disponible.

Su relevancia radica en el enfoque de despliegue: inferencia local en Apple silicon con un pico de memoria de 3,7 GB en mensajes cortos y 4,1 GB a 6.000 caracteres, con unos 0,3 s por respuesta, además de una variante GGUF para Windows que ronda 1,05 s por respuesta solo con CPU. La licencia Apache 2.0 facilita su integración comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Gemma 4 E4B), ajuste fino con LoRA fusionado; no se detalla la arquitectura interna en la información disponible |
| Parámetros totales | 7.636.276.266 (según safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit (pesos del repositorio MLX); existe variante GGUF con archivo de 4,6 GB |
| Idiomas soportados | inglés (en), hindi en devanagari (hi) e hinglish (hindi escrito con alfabeto latino, según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); GGUF en el repositorio hermano |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it`, un transformer multimodal de Google, y se ha ajustado con LoRA sobre ejemplos de escritura. Según la model card, esos ejemplos se redactaron y revisaron con ayuda de modelos de IA y después se filtraron para que ninguno se pareciera a los borradores de prueba usados en la evaluación. El adaptador LoRA se fusionó en los pesos finales, que se cuantizaron a 4 bits y a los que se eliminaron los pesos de audio. Se mantienen los pesos de imagen para compatibilidad con cargadores estándar.

El entrenamiento se realizó con las instrucciones cortas propias de cada modo de la aplicación Iris y con el modo de razonamiento (thinking) desactivado. La model card advierte que otras instrucciones funcionan pero no fueron medidas. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Como innovación de despliegue, la aplicación Iris mantiene en disco la tabla de embeddings por capa (`embed_tokens_per_layer`) y lee solo las filas necesarias por token, además de descartar las capas de imagen al cargar; con ello las respuestas no cambian y el pico de memoria baja a las cifras indicadas, frente a unos 5,8 GB con un cargador estándar. Iris empareja el modelo con el drafter `mlx-community/gemma-4-E4B-it-assistant-bf16`, lo que sugiere decodificación especulativa.

## Capacidades

- Corrección de ortografía, gramática y puntuación en inglés, hindi y hinglish, con la restricción explícita de no modificar nada más del texto.
- Reescritura con control de tono: Professional, Friendly, Shorter, Clearer y Funny, manteniendo significado y voz del autor.
- Generación de texto conversacional en el pipeline `text-generation`.
- Procesamiento de imagen heredado del modelo base (pesos conservados), aunque no es una capacidad medida ni documentada para este fine-tune.
- Capacidad de audio eliminada en este ajuste (pesos de audio retirados).
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico multi-paso.
- Modo de razonamiento (thinking) desactivado durante el entrenamiento; no se reporta su comportamiento con thinking activado.

## Casos de uso

- Corrección gramatical integrada en un editor de texto: el modelo recibe un borrador y devuelve la misma frase con ortografía, gramática y puntuación corregidas sin reescritura estilística, lo que encaja con editores que necesitan cambios mínimos y trazables.
- Reescritura de correos profesionales: con el tono Professional, transforma un mensaje informal en uno adecuado para el ámbito laboral manteniendo el contenido; útil en clientes de correo de escritorio.
- Acortado de mensajes para chat: el tono Shorter condensa un texto largo conservando la intención, aplicable a asistentes de mensajería con límite de caracteres.
- Clarificación de instrucciones: el tono Clearer reescribe párrafos confusos en documentación interna o tickets de soporte, mejorando la legibilidad sin cambiar los hechos.
- Soporte multilingüe para equipos con India: la cobertura de hindi en devanagari y hinglish permite corregir y reescribir mensajes en contextos laborales donde se mezcla inglés e hindi, un caso frecuente en empresas tecnológicas con equipos en India.
- Aplicación de escritura en local con privacidad: al ejecutarse en el dispositivo con 3,7-4,1 GB de pico de memoria en Apple silicon, es apto para procesar textos sensibles sin enviarlos a la nube.
- Despliegue en Windows sin GPU: la variante GGUF corre en CPU de portátil con unos 1,05 s por respuesta, lo que permite integrarla en aplicaciones de escritorio con requisito de 16 GB de RAM.

## Benchmarks y rendimiento

La model card reporta una evaluación ciega por respuesta sobre borradores redactados solo para prueba, a temperatura 0 y con las instrucciones cortas de Iris, comparando con el Gemma 4 E4B-it sin ajustar:

| Prueba | Gemma 4 E4B-it (antes) | Iris Gemma 4 E4B |
|---|---|---|
| Fix, inglés (50 borradores): aceptados | 52% | 90% |
| Professional y Friendly (100): enviaría | 86% | 93% |
| Shorter y Clearer (100): enviaría | 75% | 90% |
| Funny (50): enviaría | 4% | 66% |
| Fix, hindi y hinglish (82): aceptados | 91% | 95% |
| Tonos en hindi (240): enviaría | 71% | 76% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las métricas de latencia y memoria son: 0,3 s por respuesta y 3,7-4,1 GB de pico en Apple silicon; 1,05 s por respuesta en CPU de portátil con la variante GGUF.

## Requisitos de hardware

- VRAM/memoria estimada: 3,7 GB de pico en mensajes cortos y 4,1 GB a 6.000 caracteres en Apple silicon con las optimizaciones de Iris; unos 5,8 GB de pico con un cargador MLX estándar. En Windows, el archivo GGUF ocupa 4,6 GB y el proceso usa 3,8 GB propios, con 8,4 GB totales en una máquina de 51 GB; se recomiendan 16 GB de RAM.
- GPU recomendadas: no se especifican modelos de GPU; el despliegue documentado es en Apple silicon (MLX) y en CPU de portátil (GGUF).
- ¿Cabe en GPU de consumo? No hay datos para RTX 4090 u otras GPU de consumo en la información disponible; el foco es Apple silicon y CPU.
- Opciones de despliegue: mlx-swift-lm con `MLXVLM` (lo que usa Iris), otros cargadores MLX compatibles con Gemma 4, y llama.cpp u otros motores GGUF para la variante cuantizada.
- Latencia y throughput: aproximadamente 0,3 s por respuesta en Apple silicon y 1,05 s por respuesta en CPU de portátil con GGUF. No se reporta throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Iris Gemma 4 E4B (MLX) | 7.636.276.266 | no disponible | Corrección y tono de escritura, en/hi/hinglish, local | Apache 2.0 | Hugging Face (MLX y GGUF) |
| google/gemma-4-E4B-it | no disponible en la información | no disponible | Modelo base multimodal generalista | Licencia Gemma 4 (enlace en la model card) | Hugging Face |
| mlx-community/gemma-4-E4B-it-assistant-bf16 | no disponible | no disponible | Drafter para decodificación especulativa | no disponible | Hugging Face |

No se dispone de datos de benchmarks estándar ni de especificaciones de contexto de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa se limita a los resultados de la evaluación propia recogidos en la sección anterior.

## Limitaciones y advertencias

- El ajuste está especializado en las instrucciones cortas de Iris por modo; otras instrucciones funcionan pero no se han medido, por lo que el rendimiento fuera de ese formato es incierto.
- El modo de razonamiento (thinking) se desactivó en el entrenamiento; no se documenta su comportamiento con thinking activado.
- Cobertura lingüística limitada a inglés, hindi y hinglish; el castellano no figura entre los idiomas soportados.
- El tono Funny mejora del 4% al 66% de respuestas que el evaluador enviaría, pero sigue siendo el modo con menor tasa de aceptación y el más propenso a resultados inadecuados.
- No se han probado escenarios clave: un Mac de 8 GB, un portátil Windows real, documentos largos en términos de calidad (solo memoria), tonos personalizados ni reglas de estilo propias del escritor.
- Riesgo de alucinación y de introducir cambios no deseados: la tarea de corrección exige no modificar nada más, pero un 10% de los borradores en inglés no fueron aceptados en la prueba de Fix.
- Los ejemplos de entrenamiento se generaron y revisaron con ayuda de modelos de IA, lo que puede introducir sesgos estilísticos o de contenido no documentados.
- Licencia Apache 2.0 para este ajuste, con enlace a la licencia de Gemma 4; conviene revisar los términos del modelo base para uso comercial.
- El repositorio no registra descargas ni likes, y no hay evidencia de uso en producción más allá de la propia aplicación Iris.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ImAXISOG/iris-gemma-4-e4b-it-mlx
- Variante GGUF: https://huggingface.co/ImAXISOG/iris-gemma-4-e4b-it-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Drafter para decodificación especulativa: https://huggingface.co/mlx-community/gemma-4-E4B-it-assistant-bf16
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
