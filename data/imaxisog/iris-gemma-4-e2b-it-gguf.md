# ImAXISOG/iris-gemma-4-e2b-it-gguf

## Resumen

Iris Gemma 4 E2B (GGUF) es un ajuste fino del modelo google/gemma-4-E2B-it de Google, desarrollado por ImAXISOG para la aplicación Iris, una herramienta de corrección gramatical y reescritura de tono para macOS y Windows. El modelo está especializado en tareas de escritura concretas: corrección de ortografía, gramática y puntuación ("Fix") y reescritura de mensajes en distintos tonos (Professional, Friendly, Shorter, Clearer, Funny), preservando el significado y la voz del autor. Soporta inglés, hindi en devanagari y hinglish (hindi escrito con caracteres latinos).

El ajuste se realizó mediante LoRA sobre ejemplos de escritura, con el adaptador fusionado en los pesos finales, cuantizados a 4 bits y con los pesos de audio eliminados. El resultado es un modelo compacto de aproximadamente 4.630 millones de parámetros, pensado para inferencia en dispositivo (on-device) con un consumo de memoria moderado: 2,9 GB en Mac para mensajes cortos y 3,2 GB a 6.000 caracteres. La licencia es Apache 2.0, lo que facilita su integración comercial.

La relevancia de este modelo radica en su enfoque práctico: no compite en benchmarks generales, sino que optimiza una tarea acotada de edición de texto con latencias muy bajas (unos 0,2 s por respuesta en Apple silicon y 0,5 s en CPU de portátil). Es un ejemplo de ajuste fino orientado a producto, con evaluación ciega por respuesta frente al modelo base y frente al modelo mayor E4B-it.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4 E2B-it; detalles de atención no disponibles) |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); pesos base a 4 bits; tabla de embeddings por capa a Q4_K |
| Idiomas soportados | en, hi (devanagari), hinglish |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); también existe versión MLX |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it y se ajusta con LoRA sobre ejemplos de escritura redactados y revisados con ayuda de modelos de IA, filtrados para que ninguno coincida con los borradores de prueba. El adaptador se fusiona en los pesos, que se cuantizan a 4 bits, y se eliminan los pesos de audio del modelo original. La conversión a GGUF se realizó con el script `convert_hf_to_gguf.py` de llama.cpp y posteriormente se cuantizó a Q4_K_M, con la tabla de embeddings por capa (`per_layer_token_embd`) en Q4_K en lugar de Q6_K, lo que reduce el tamaño del archivo y acelera ligeramente la inferencia.

El entrenamiento utiliza las instrucciones cortas propias de la aplicación Iris para cada modo (Fix y los distintos tonos), con el modo de razonamiento (thinking) desactivado. El autor indica que otros prompts funcionan pero no fueron medidos. No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset más allá de que son ejemplos de escritura en inglés, hindi y hinglish.

## Capacidades

- Corrección de ortografía, gramática y puntuación sin alterar el resto del texto (modo Fix).
- Reescritura de mensajes en tonos Professional, Friendly, Shorter, Clearer y Funny, manteniendo el significado y la voz del autor.
- Generación de texto conversacional en inglés, hindi (devanagari) y hinglish.
- Funcionamiento con instrucciones cortas específicas de la aplicación; admite otros prompts pero sin evaluación publicada.
- Modo de razonamiento (thinking) desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- No se documentan capacidades de tool calling, agentes, visión ni audio en esta versión (los pesos de audio fueron eliminados).

## Casos de uso

- Corrección gramatical integrada en editores de texto: el modelo corrige ortografía, gramática y puntuación manteniendo intacto el contenido, adecuado para su integración en aplicaciones de escritura con latencias de 0,2-0,5 s por respuesta.
- Reescritura de correos profesionales: el tono Professional permite transformar un borrador en un mensaje formal conservando la intención, útil en clientes de correo o asistentes de productividad.
- Acortamiento de mensajes para chat: el tono Shorter condensa textos largos en mensajes breves, apropiado para aplicaciones de mensajería con límites de espacio.
- Clarificación de textos confusos: el tono Clearer reescribe frases ambiguas para mejorar la comprensión, aplicable en documentación técnica o comunicación interna.
- Asistencia de escritura multilingüe para usuarios de hindi e hinglish: el modelo gestiona devanagari y hindi transliterado, útil en apps dirigidas al mercado indio.
- Reescritura con tono humorístico: el tono Funny permite generar versiones ligeras de mensajes, aunque con una tasa de aceptación menor (56% en la evaluación del autor).
- Procesamiento local en dispositivos de 8 GB de RAM: al ocupar 2,8 GB en disco y aproximadamente 1,9 GB de memoria propia en Windows, es viable en portátiles sin GPU dedicada.

## Benchmarks y rendimiento

El autor publica una evaluación ciega por respuesta frente a google/gemma-4-E4B-it sin ajustar, con temperatura 0 y los prompts cortos de Iris. No son benchmarks estándar (MMLU, HumanEval, etc.), sino tasas de aceptación en tareas de escritura:

| Tarea | Gemma 4 E4B-it (sin ajustar) | Iris Gemma 4 E2B |
|---|---|---|
| Fix, inglés (50 borradores): aceptados | 52% | 86% |
| Professional y Friendly (100): enviaría | 86% | 88% |
| Shorter y Clearer (100): enviaría | 75% | 86% |
| Funny (50): enviaría | 4% | 56% |
| Fix, hindi y hinglish (82): aceptados | 91% | 71% |
| Tonos en hindi (240): enviaría | 71% | 47% |

Frente al modelo base sin ajustar (Gemma 4 E2B-it), en otras rondas: Fix en hindi 62-65% frente a 63% (sin cambio), tonos en hindi 47% frente a 36%, Fix en inglés 86% frente a 60% (medido en la ronda de entrenamiento anterior, que comparte los ejemplos de inglés). El autor señala que para hindi el modelo E4B es claramente mejor.

## Requisitos de hardware

- VRAM/memoria estimada: 2,9 GB de pico en Mac para mensajes cortos y 3,2 GB a 6.000 caracteres en Apple silicon; en Windows, 2,8 GB de archivo más 1,9 GB de memoria propia (4,8 GB en total en una máquina de 51 GB), pensado para equipos de 8 GB de RAM.
- GPU recomendadas: no se especifican GPU dedicadas; el modelo está orientado a CPU y Apple silicon. No hay datos publicados para A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no documentada; el enfoque es inferencia en CPU/dispositivo.
- Opciones de despliegue: llama.cpp mediante `llama-server -m iris-gemma-4-e2b-it-Q4_K_M.gguf -np 1 --jinja`; también existe versión MLX para Apple silicon.
- Latencia y throughput: aproximadamente 0,2 s por respuesta en Mac y 0,5 s por respuesta en CPU de portátil Windows (medido en CPU de Mac, no en un portátil Windows real). Se recomienda ejecutar una petición a la vez (`-np 1`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Iris Gemma 4 E2B (este) | 4.630 M | no disponible | Corrección y tono de escritura (en, hi, hinglish), on-device | Apache 2.0 | GGUF y MLX en Hugging Face |
| google/gemma-4-E2B-it | no disponible | no disponible | Modelo base generalista multimodal (incluye audio) | Gemma 4 license | Hugging Face |
| google/gemma-4-E4B-it | no disponible | no disponible | Modelo generalista de mayor tamaño | Gemma 4 license | Hugging Face |

No se dispone de datos de benchmarks estándar ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo está ajustado para las instrucciones cortas y los modos concretos de la aplicación Iris; otros prompts funcionan pero no han sido evaluados.
- Rendimiento inferior al modelo E4B en hindi: 71% frente a 91% en Fix y 47% frente a 71% en tonos, según la evaluación del autor.
- El tono Funny obtiene una tasa de aceptación del 56%, considerablemente menor que el resto de modos.
- No se ha probado en un Mac de 8 GB ni en un portátil Windows real; las mediciones de Windows se realizaron en la CPU de un Mac.
- No se han evaluado documentos largos en calidad (solo en memoria), tonos personalizados ni reglas de estilo propias del escritor.
- Riesgo de alucinación y sesgos: no documentado por el autor; al ser un ajuste sobre Gemma 4, hereda los sesgos del modelo base.
- Longitud de contexto no especificada; el autor solo menciona pruebas de memoria hasta 6.000 caracteres.
- Licencia Apache 2.0 para este ajuste, con enlace a la licencia de Gemma 4 de Google; conviene revisar los términos del modelo base para uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ImAXISOG/iris-gemma-4-e2b-it-gguf
- Versión MLX: https://huggingface.co/ImAXISOG/iris-gemma-4-e2b-it-mlx
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
