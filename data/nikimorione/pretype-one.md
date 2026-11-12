# nikimoriOne/Pretype-One

## Resumen

Pretype One es un modelo de lenguaje afinado a partir de google/gemma-4-E2B, desarrollado por el usuario nikimoriOne para la aplicación macOS de autocompletado Pretype. No es un modelo conversacional de propósito general: está especializado en cuatro tareas concretas de escritura (autocompletado de texto en bruto, corrección de erratas, generación de respuestas y reescritura), empaquetadas en una única descarga de aproximadamente 1,5 GB en formato MLX de 4 bits.

El modelo parte de la variante comunitaria mlx-community/gemma-4-e2b-4bit, a la que se le han eliminado las torres de audio y visión y se le ha reducido el vocabulario de 262.144 a 82.000 tokens, recortando el archivo de pesos de 2,45 GiB a 1,46 GiB. Sobre esa base destilada (con Gemma 4 E4B de 8 bits como profesor) se aplica un adaptador LoRA que no está fusionado con los pesos, de modo que el mismo archivo sirve como modelo de autocompletado (adaptador desactivado) o como modelo de corrección, respuesta y reescritura (adaptador activado).

Su relevancia radica en el enfoque de eficiencia: consigue mejoras medibles frente a la base Gemma 4 E2B en corrección de erratas (79 % frente a 49 % de líneas restauradas exactamente) y en reescritura (86 % frente a 74 %), con un pico de memoria de proceso de 2,1 GiB frente a 6,0 GiB del modelo de comparación. Con 2.756.658.467 parámetros totales y licencia Apache-2.0, está pensado para ejecutarse localmente en Apple Silicon dentro de una app de escritorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B), con capas de atención con KV compartida; sin torres de audio ni visión |
| Parametros totales | 2.756.658.467 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX); pesos en 4-bit |
| Idiomas soportados | 20 idiomas en los datos de entrenamiento (no se detalla la lista) |
| Licencia | Apache-2.0 (licencia de Gemma 4) |
| Formato de pesos | safetensors (MLX): `model.safetensors` y `adapters.safetensors` |

## Arquitectura y entrenamiento

El modelo es un transformer Gemma 4 E2B con las torres multimodales (audio y visión) eliminadas y un vocabulario reducido de 262.144 a 82.000 tokens, seleccionados entre los más frecuentes en subtítulos públicos, texto de Wikipedia y código. Los merges del tokenizador asociados a tokens eliminados también se retiran, de forma que ese texto se divide en tokens más pequeños que sí se conservan. El resultado es un archivo de pesos de 1,46 GiB frente a los 2,45 GiB originales.

El entrenamiento consta de dos fases. Primero, una destilación desde Gemma 4 E4B en 8 bits como profesor, sobre 10 millones de tokens de texto público en 20 idiomas (subtítulos, Wikipedia, código y mensajes generados por el propio E4B-it para este fin), con una pérdida que sigue los 16 tokens más probables del profesor; se entrenan los pesos de atención, las puertas por capa y las proyecciones down, y los pesos vuelven a 4 bits al final. Después, se entrena un adaptador LoRA sobre `q_proj` y `v_proj` de las 35 capas, con rango 64 y escala 20, durante 5.500 pasos sobre el modelo de 4 bits congelado, usando 43.500 filas: correcciones de erratas con erratas sintéticas sobre frases de subtítulos, y respuestas y reescrituras generadas por Gemma 4 E4B-it sobre texto público de subtítulos. Se descartaron las frases idénticas a texto público de evaluación y no se usaron datos de usuarios. El adaptador no debe fusionarse con los pesos de 4 bits, ya que la fusión lo borra; debe cargarse en tiempo de ejecución.

## Capacidades

- Autocompletado de texto en bruto sin plantilla de chat, usando únicamente `model.safetensors`.
- Corrección de erratas: restauración de líneas con errores tipográficos.
- Generación de respuestas a partir de un contexto de conversación.
- Reescritura de texto con control de longitud e idioma.
- Capacidades multilingües limitadas a los 20 idiomas presentes en los datos de entrenamiento.
- No soporta tool calling ni function calling según la información disponible.
- No está diseñado como agente ni para razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio (las torres correspondientes fueron eliminadas).
- No es un modelo de chat de propósito general: el adaptador solo aprendió tres tareas cortas y no se probó con preguntas abiertas.

## Casos de uso

- Autocompletado en una app de escritorio macOS: el modelo genera la continuación de texto en bruto sin plantilla de chat, con 24,2 % de acierto en la primera palabra en 6.000 filas y 20 idiomas, y un pico de memoria de 2,1 GiB, adecuado para ejecutarse en segundo plano en Apple Silicon.
- Corrección ortográfica en línea mientras se escribe: con el adaptador activado restaura exactamente el 79 % de las líneas con erratas (frente al 49 % de la base) y solo propone cambios en 6 de 170 líneas limpias, lo que reduce las falsas alarmas.
- Sugerencia de respuestas en clientes de mensajería: el modelo genera respuestas en el idioma correcto en el 96 % de 380 conversaciones y resulta sobre el tema en el 90 % según un modelo juez.
- Reescritura de frases para ajustar longitud o tono: responde con el idioma y la longitud correctos en el 86 % de 400 filas, útil para funciones de "reescribir" integradas en editores.
- Procesamiento local con privacidad: al ejecutarse íntegramente en el dispositivo con MLX, no requiere enviar texto del usuario a servidores externos, lo que encaja en aplicaciones de escritura sensibles.
- Despliegue con bajo consumo energético: 946 mJ por sugerencia y 2.224 mJ por corrección en una sesión, con una diferencia entre sesiones de aproximadamente el 15 %, apropiado para apps que priorizan la duración de batería.
- Sustituto ligero de dos modelos separados: reemplaza la combinación de Gemma 4 E2B 4-bit para autocompletado y su build instruct para chat (2,5 GB + 3,0 GB) por un único archivo de 1,5 GB.

## Benchmarks y rendimiento

Datos del arnés de evaluación de Pretype (2 a 12 de noviembre de 2026), decodificación greedy, comparados con Gemma 4 E2B 4-bit para autocompletado y su build instruct para las tareas de chat:

| Metrica | Comparacion | Pretype One |
|---|---:|---:|
| Autocompletado: primera palabra correcta, 6.000 filas, 20 idiomas | 21,2 % | 24,2 % |
| Igual, solo filas no vistas en el texto de entrenamiento | 21,3 % | 23,9 % |
| Autocompletado: primera palabra correcta, 5.649 filas de otras fuentes | 20,8 % | 22,8 % |
| Correccion: linea con errata restaurada exactamente, 510 filas | 49 % | 79 % |
| Correccion: cambio propuesto en una linea limpia | 52 de 170 | 6 de 170 |
| Respuesta: respondida, en el idioma correcto, 380 conversaciones | 96 % | 96 % |
| Respuesta: sobre el tema, por modelo juez, 380 conversaciones | 85 % | 90 % (p=0,04, tendencia) |
| Reescritura: respondida, idioma y longitud correctos, 400 filas | 74 % | 86 % |
| Pico de memoria del proceso | 6,0 GiB | 2,1 GiB |
| Energia por sugerencia, una sesion | 1048 mJ | 946 mJ |
| Energia por correccion, una sesion | 2291 y 2474 mJ | 2224 mJ |

## Requisitos de hardware

- Inferencia en 4 bits con un tamaño de repo de 1,6 GB; pico de memoria del proceso medido de 2,1 GiB.
- Diseñado para Apple Silicon mediante la librería MLX; no se documentan requisitos para GPU NVIDIA.
- Cabe en equipos de consumo con memoria unificada de 8 GB o superior en Apple Silicon; no se especifican modelos concretos de Mac.
- Despliegue mediante `mlx-lm`, cargando el modelo con `strict=False` porque `mlx-lm` rechaza en modo estricto las proyecciones clave/valor no usadas de las capas con KV compartida.
- El adaptador se carga en tiempo de ejecución con `mlx_lm.tuner.utils.load_adapters` y se usa con la plantilla de chat.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia de reescritura: 2,5 ms por carácter de salida (frente a 1,8 ms del build instruct), atribuible al adaptador. No se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento clave | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pretype One | 2.756.658.467 | no disponible | Autocompletado 24,2 %; correccion 79 %; reescritura 86 % | Apache-2.0 | Hugging Face, MLX 4-bit |
| Gemma 4 E2B 4-bit (mlx-community) | no disponible | no disponible | Autocompletado 21,2 %; correccion 49 % | licencia Gemma 4 | Hugging Face, MLX 4-bit |
| Gemma 4 E2B instruct | no disponible | no disponible | Respuesta sobre el tema 85 %; reescritura 74 % | licencia Gemma 4 | Hugging Face |
| Gemma 4 E4B (profesor de destilacion, 8-bit) | no disponible | no disponible | Usado como profesor y generador de datos; sin metricas comparativas publicadas | licencia Gemma 4 | Hugging Face |

## Limitaciones y advertencias

- Las reescrituras pueden devolver el texto de entrada sin cambios: 34 de 400 solicitudes, sobre todo cuando la edición correcta es pequeña.
- Las reescrituras se midieron solo por forma (idioma y longitud), no por sentido; ningún modelo juez las evaluó.
- La reescritura es más lenta que en el build instruct: 2,5 ms por carácter de salida frente a 1,8 ms, por el adaptador.
- Los tokens raros eliminados del vocabulario encarecen el texto que los necesita; el texto periodístico perdió precisión por el recorte antes de la destilación.
- No es un modelo de chat: el adaptador solo aprendió tres tareas cortas y no se probó con preguntas abiertas.
- Las diferencias de energía entre sesiones son de aproximadamente el 15 %, por lo que las cifras de energía indican "no más", no una ganancia.
- El adaptador no debe fusionarse con los pesos de 4 bits, ya que la fusión lo borra.
- No se detalla la lista de 20 idiomas soportados ni la longitud de contexto, lo que limita la planificación en producción.
- No se han documentado sesgos específicos ni evaluaciones de alucinación en la información disponible.
- La licencia es Apache-2.0, la de Gemma 4; conviene revisar los términos de la licencia de Gemma 4 para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikimoriOne/Pretype-One
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Base cuantizada de partida: https://huggingface.co/mlx-community/gemma-4-e2b-4bit
- Repositorio de la aplicación Pretype: https://github.com/nikiomori/Pretype
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
