# nikimoriOne/gemma-4-e2b-Pretype-4bit

## Resumen

Gemma 4 E2B Pretype 4-bit es un ajuste fino del modelo base `google/gemma-4-E2B` publicado por el desarrollador independiente nikimoriOne. No es un modelo conversacional de propósito general, sino una especialización para la aplicación macOS Pretype, una herramienta de autocompletado de texto. El modelo empaqueta en un único repositorio de 1,6 GB dos funciones diferenciadas: autocompletado de texto sin plantilla de chat (con los pesos en `model.safetensors`) y corrección de erratas, generación de respuestas y reescritura mediante plantilla de chat (con un adaptador LoRA en `adapters.safetensors`).

El modelo parte de la versión de 4 bits de `mlx-community/gemma-4-e2b-4bit`, a la que se le han eliminado las torres de audio y visión y se le ha reducido el vocabulario de 262.144 a 82.000 tokens, conservando los más frecuentes en subtítulos públicos, texto de Wikipedia y código. Posteriormente se destiló desde Gemma 4 E4B en 8 bits sobre 10 millones de tokens en 20 idiomas, y se entrenó un adaptador LoRA de rango 64 sobre las proyecciones `q_proj` y `v_proj` de las 35 capas del modelo congelado.

La relevancia de esta ficha es acotada: se trata de un modelo muy específico, orientado a una aplicación concreta, con licencia Apache-2.0 y formato MLX (Apple Silicon). No está pensado para uso general ni para despliegue en servidores con GPU NVIDIA, y su model card reconoce explícitamente que no es un modelo de chat y que no se ha evaluado en preguntas abiertas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4 E2B, con capas KV compartidas), sin torres de visión ni audio |
| Parametros totales | 2.756.658.467 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (pesos en 4-bit); adaptador LoRA separado en safetensors |
| Idiomas soportados | 20 idiomas en los datos de destilación (no se enumeran); idiomas oficiales no disponibles |
| Licencia | Apache-2.0 (licencia de Gemma 4) |
| Formato de pesos | safetensors (MLX); `model.safetensors` + `adapters.safetensors` |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de Gemma 4 E2B, con capas de KV compartidas (la model card menciona que `mlx-lm` rechaza las proyecciones key/value no usadas de esas capas en modo estricto, por lo que hay que cargar con `strict=False`). Se han eliminado las torres de audio y visión del modelo original y se ha reducido el vocabulario de 262.144 a 82.000 tokens, eliminando también las fusiones del tokenizador asociadas a los tokens descartados; el archivo pasa de 2,45 GiB a 1,46 GiB.

El entrenamiento consta de tres fases. Primero, reducción del vocabulario. Segundo, destilación desde Gemma 4 E4B en 8 bits como profesor, sobre 10 millones de tokens de texto público en 20 idiomas (subtítulos, Wikipedia, código y mensajes generados por Gemma 4 E4B-it para este propósito), con una pérdida que sigue los 16 tokens más probables del profesor; se entrenan los pesos de atención, las puertas por capa y las proyecciones down, y los pesos vuelven a 4 bits al final. Tercero, un adaptador LoRA sobre `q_proj` y `v_proj` de las 35 capas, rango 64, escala 20, 5.500 pasos, sobre el modelo de 4 bits congelado, con 43.500 filas de datos (correcciones de erratas con erratas sintéticas sobre frases de subtítulos, respuestas y reescrituras generadas por Gemma 4 E4B-it sobre texto público de subtítulos). Se eliminaron las frases idénticas a texto público de evaluación y no se usaron datos de usuarios.

## Capacidades

- Autocompletado de texto en bruto sin plantilla de chat, con los pesos base (`model.safetensors`).
- Corrección de erratas mediante plantilla de chat, con el adaptador LoRA activado.
- Generación de respuestas breves en el contexto de la aplicación Pretype.
- Reescritura de texto (cambio de longitud y forma) mediante plantilla de chat.
- Soporte multilingüe limitado a los 20 idiomas presentes en los datos de destilación (no se enumeran).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio (las torres correspondientes fueron eliminadas).

## Casos de uso

- Autocompletado en la app macOS Pretype: el modelo genera la siguiente palabra o frase sin plantilla de chat, con los pesos base, y está optimizado para baja latencia y bajo consumo energético en Apple Silicon.
- Corrección de erratas en tiempo real: con el adaptador LoRA y la plantilla de chat, restaura líneas con erratas tipográficas; en la evaluación del autor recupera exactamente la línea en el 79 % de 510 filas.
- Sugerencia de respuestas breves en conversaciones: genera respuestas en el idioma correcto en el 96 % de 380 conversaciones de evaluación.
- Reescritura de texto para ajustar longitud o forma: responde en el idioma y longitud correctos en el 86 % de 400 filas.
- Procesamiento local en portátiles Apple Silicon: el proceso alcanza un pico de 2,1 GiB de memoria, lo que permite ejecutarlo junto a otras aplicaciones sin agotar la RAM unificada.
- Filtrado o corrección previa en pipelines de texto: puede emplearse para limpiar erratas en subtítulos o textos antes de pasarlos a otro modelo, siempre que se acepte su limitación de vocabulario reducido.
- Prototipado de asistentes de escritura en macOS: al estar en formato MLX y licencia Apache-2.0, sirve como base para experimentar con adaptadores LoRA sobre tareas cortas de escritura.

## Benchmarks y rendimiento

Datos de la model card, medidos con el arnés de evaluación de Pretype entre el 2 y el 12 de noviembre de 2026, decodificación greedy. La comparación es Gemma 4 E2B 4-bit para autocompletado y su build instruct para las tareas de chat (dos archivos, 2,5 GB + 3,0 GB).

| Metrica | Comparacion | Este modelo |
|---|---:|---:|
| Autocompletado: primera palabra correcta, 6.000 filas, 20 idiomas | 21,2 % | 24,2 % |
| Igual, solo filas no vistas en el texto de entrenamiento | 21,3 % | 23,9 % |
| Autocompletado: primera palabra correcta, 5.649 filas de otras fuentes | 20,8 % | 22,8 % |
| Corrección: línea con errata restaurada exactamente, 510 filas | 49 % | 79 % |
| Corrección: cambio propuesto sobre línea limpia | 52 de 170 | 6 de 170 |
| Respuesta: respondida en el idioma correcto, 380 conversaciones | 96 % | 96 % |
| Reescritura: respondida, idioma y longitud correctos, 400 filas | 74 % | 86 % |
| Pico de memoria del proceso | 6,0 GiB | 2,1 GiB |
| Energía por sugerencia, una sesión | 1.048 mJ | 946 mJ |
| Energía por corrección, una sesión | 2.291 y 2.474 mJ | 2.224 mJ |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: el proceso alcanza un pico de 2,1 GiB según la model card; el repositorio ocupa 1,6 GB.
- Hardware objetivo: Apple Silicon (formato MLX, librería `mlx`). No se documenta soporte para GPU NVIDIA, AMD ni CPU x86.
- GPU recomendadas: no disponibles; el modelo está pensado para chips Apple con memoria unificada.
- Cabe en equipos consumer Apple Silicon con holgura; no se especifican modelos concretos de chip.
- Opciones de despliegue: `mlx-lm` (carga con `strict=False` por las capas KV compartidas); para las tareas de chat, cargar el adaptador con `mlx_lm.tuner.utils.load_adapters`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: la model card indica 2,5 ms por carácter de salida en reescrituras (frente a 1,8 ms del build instruct). No se publica throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma 4 E2B Pretype 4-bit (este) | 2.756.658.467 | no disponible | safetensors MLX 4-bit + LoRA | Apache-2.0 | Especializado en autocompletado, corrección y reescritura; 1,6 GB |
| Gemma 4 E2B 4-bit (`mlx-community/gemma-4-e2b-4bit`) | no disponible | no disponible | MLX 4-bit | Apache-2.0 | Modelo base sin especializar; 2,45 GiB; peor en las métricas de Pretype |
| Gemma 4 E2B instruct | no disponible | no disponible | no disponible | Apache-2.0 | Build instruct del base; usado como comparación en tareas de chat; 3,0 GB |
| Gemma 4 E4B (8-bit) | no disponible | no disponible | no disponible | Apache-2.0 | Profesor de la destilación; mayor tamaño y capacidades, no comparable en despliegue local ligero |

## Limitaciones y advertencias

- Las reescrituras pueden devolver el texto sin cambios: 34 de 400 solicitudes devolvieron la entrada tal cual, sobre todo cuando un cambio pequeño habría sido correcto.
- Las respuestas y reescrituras se midieron por forma (idioma y longitud), no por sentido; ningún juez evaluó la calidad semántica.
- Las reescrituras son más lentas que en el build instruct: 2,5 ms por carácter de salida frente a 1,8 ms, a causa del adaptador.
- El vocabulario reducido elimina tokens poco frecuentes: el texto que los necesita cuesta más tokens y el texto periodístico perdió precisión tras el recorte, antes de la destilación.
- No es un modelo de chat: el adaptador aprendió tres tareas cortas y no se probó en preguntas abiertas.
- La energía varía en torno a un 15 % entre sesiones; las cifras de energía indican "no más", no una ganancia.
- No se documentan sesgos conocidos, riesgo de alucinación ni límites de contexto más allá de lo indicado.
- Licencia Apache-2.0 (la de Gemma 4); conviene revisar los términos de la licencia de Gemma 4 enlazada por el autor para uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (11 de noviembre de 2026), por lo que no hay validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikimoriOne/gemma-4-e2b-Pretype-4bit
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Modelo de partida en 4 bits: https://huggingface.co/mlx-community/gemma-4-e2b-4bit
- Aplicación Pretype: https://github.com/nikiomori/Pretype
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
