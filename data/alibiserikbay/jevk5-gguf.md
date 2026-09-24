# alibiserikbay/JevK5-GGUF

## Resumen

JevK5-GGUF es el conjunto de versiones cuantizadas en formato GGUF de los modelos de decisión JevK5 (4B) y JevK5-2B, desarrollados por el usuario alibiserikbay y publicados bajo licencia Apache-2.0. A diferencia de un modelo generativo convencional, JevK5 no redacta respuestas: recibe un documento (evidencia), un criterio y una pregunta de tipo sí/no, elección múltiple o puntuación, y devuelve en una única pasada forward una probabilidad calibrada para cada opción, leída directamente de los log-probabilidades del siguiente token correspondiente a las letras de respuesta. El autor lo presenta explícitamente como una alternativa abierta y no afiliada a Jev, el producto de decisión de TypeSafe AI.

El interés de esta publicación está en el empaquetado para llama.cpp: permite ejecutar el modelo en GPU de NVIDIA, AMD, Intel y Apple, además de en CPU sin acelerador, con ficheros de entre 2,01 GB y 4,48 GB. El autor documenta que la cuantización Q8_0 es prácticamente sin pérdida (228/231 y 226/231 respuestas idénticas al modelo bf16 de referencia en JevBench) y que la Q4_K_M del modelo de 4B cabe en GPUs de 4 GB y Macs de 8 GB, a cambio de modificar 12 respuestas, diez de ellas en el nivel de dificultad alto.

La relevancia actual del proyecto es práctica: cubre el nicho de modelos de enrutado, clasificación y evaluación que devuelven una distribución de probabilidad calibrada en lugar de texto generado, con latencias de entre 9 y 14 ms por decisión en H100 mediante el runtime de transformers con grafos CUDA, y de 0,23 a 0,6 segundos por decisión en CPU o en Metal. Se publica en inglés y con 0 descargas y 0 likes en el momento de la consulta, por lo que su validación por parte de la comunidad es todavía nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; el repositorio de GitHub del autor describe la variante de 4B como Qwen3.5-4B mas un LoRA destilado |
| Parametros totales | 1.881.825.088 (~1,88 mil millones) segun los metadatos del repositorio; el autor publica variantes nominales de 4B (JevK5) y 2B (JevK5-2B) |
| Parametros activos | No aplica: no se describe una arquitectura de mezcla de expertos |
| Longitud de contexto | No disponible; el ejemplo de arranque de `llama-server` usa `-c 8192` |
| Tipos de cuantizacion | Q8_0 y Q4_K_M en GGUF; los modelos base sin cuantizar estan en bf16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); los modelos base se distribuyen en bf16 |
| Variantes publicadas | `jevk5-4b-v0.2-Q8_0.gguf` (4,48 GB), `jevk5-4b-v0.2-Q4_K_M.gguf` (2,71 GB), `jevk5-2b-v0.2-Q8_0.gguf` (2,01 GB) |
| Tamano del repositorio | 9,2 GB |
| Temperatura de calibracion | 1,532 para JevK5 4B; 1,42 para JevK5-2B |
| Modelos base | alibiserikbay/JevK5 y alibiserikbay/JevK5-2B |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo mas alla de su naturaleza de modelo de decision y de la descripcion del repositorio de GitHub, que indica que la variante de 4B parte de Qwen3.5-4B con un LoRA destilado. El comportamiento observable si esta documentado con precision: el modelo consume un prompt con formato de chat tipo ChatML (`<|im_start|>system`, `<|im_start|>user`, `<|im_start|>assistant`) que incluye un bloque `<think>` vacio antes de la respuesta, y su salida util no es texto generado sino la distribucion de log-probabilidades del primer token de respuesta. El cliente de referencia pide `n_predict: 1` con `temperature: 0` y `n_probs: 40`, reconstruye las log-probabilidades de las letras de opcion (A, B, C...) y las normaliza con la temperatura de calibracion mediante una softmax. El autor afirma que este cliente reproduce exactamente las probabilidades de la implementacion de referencia, con una diferencia maxima de 0,0 en items de tipo si/no, eleccion y puntuacion.

En cuanto al entrenamiento, no se proporcionan datos sobre el numero de tokens, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. La model card menciona que los ficheros GGUF se generaron con `convert_hf_to_gguf.py` de llama.cpp, aunque el texto de la model card facilitado esta truncado en ese punto, por lo que no se pueden detallar los commits, parametros de conversion ni el procedimiento completo de cuantizacion. El modelo se evalua con JevBench, un conjunto de 231 decisiones publicas organizadas en tres niveles de dificultad (facil, estandar y dificil), y la calibracion se trata como una propiedad de primer orden del sistema, no como un ajuste posterior.

## Capacidades

- Decisiones tipadas en una sola pasada forward: preguntas de si/no, de eleccion entre multiples opciones identificadas por letra y de puntuacion por niveles, sin generar texto.
- Salida de una distribucion de probabilidad calibrada sobre todas las opciones, no solo la opcion ganadora, lo que permite aplicar umbrales de confianza y abstenerse por debajo de un umbral.
- Inferencia determinista: el cliente de referencia usa `temperature: 0` y `n_predict: 1`, de modo que la misma entrada produce la misma distribucion.
- Aplicacion de un criterio explicito proporcionado en el prompt a una evidencia documental tambien proporcionada en el prompt.
- Ejecucion local en CPU sin GPU, y en GPUs NVIDIA, AMD, Intel y Apple mediante llama.cpp con soporte Metal.
- Modo conversacional mediante plantilla de chat ChatML, aunque su uso previsto es el de decision puntual y no el de dialogo multi-turno.
- Etiquetas declaradas por el autor: `decision-model`, `system-one`, `typed-decisions`, `calibration`, `jev-alternative`.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio, ni modos de razonamiento extendido. El bloque `<think>` presente en la plantilla se envia vacio.

## Casos de uso

- Enrutado o triaje de tickets de soporte: el modelo recibe el texto del ticket como evidencia y devuelve la probabilidad de que corresponda a facturacion, soporte tecnico o ventas. Es el ejemplo que incluye la propia model card y encaja porque la decision es cerrada, con pocas clases y con necesidad de umbral de confianza para derivar a un humano.
- Moderacion y cumplimiento normativo: con preguntas de tipo si/no del estilo "¿incumple esta politica?", el modelo devuelve la probabilidad de cada respuesta, lo que permite fijar un umbral de escalado en lugar de depender de una generacion binaria poco calibrada.
- Seleccion de herramienta o fuente en un pipeline RAG: dada la consulta del usuario y la lista de herramientas o indices disponibles, el modelo puntua cada opcion y se elige la de mayor probabilidad, con el coste de una sola pasada forward en lugar de una llamada generativa completa.
- Prefiltrado en pipelines de agentes: decidir si una consulta requiere una llamada al modelo grande o puede resolverse con una regla o con un recuperador, usando la probabilidad como senal de confianza para escalar. La latencia en CPU (0,23-0,6 s) lo hace viable como etapa previa.
- Evaluacion automatica de respuestas con escala de puntuacion: dada una respuesta y una rubrica, el modelo devuelve una distribucion sobre los niveles 0, 1, 2... en lugar de una nota unica generada, lo que facilita agregar incertidumbre en la evaluacion de datasets.
- Verificacion de afirmaciones sobre documentos largos: comprobar si un texto respalda una afirmacion concreta con una probabilidad de "verdadero" y "falso", util en revision documental y en control de calidad de resumenes.
- Etiquetado de datasets a escala: clasificacion automatica de grandes volumenes de texto con un umbral de confianza que derive a revision manual los casos dudosos, usando la variante de 2B en Q8_0 sobre CPU para abaratar el coste por item.
- Despliegue en entornos sin GPU: la variante de 2B en Q8_0 (2,01 GB) funciona en CPU con 48 hilos a 0,23-0,27 s por decision en documentos cortos, lo que la hace adecuada para equipos de desarrollo, portatiles y entornos on-premise sin acelerador.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre las 231 decisiones publicas de JevBench. La columna "misma respuesta que bf16" indica cuantas decisiones coinciden con el modelo sin cuantizar. Los niveles facil, estandar y dificil son exactitudes por nivel.

| Fichero | Modelo | Tamano | Misma respuesta que bf16 | Facil | Estandar | Dificil |
|---|---|---:|---:|---:|---:|---:|
| `jevk5-4b-v0.2-Q8_0.gguf` | JevK5 4B | 4,48 GB | 228 / 231 | 1,000 | 0,958 | 0,721 |
| `jevk5-4b-v0.2-Q4_K_M.gguf` | JevK5 4B | 2,71 GB | 219 / 231 | 1,000 | 0,931 | 0,730 |
| `jevk5-2b-v0.2-Q8_0.gguf` | JevK5-2B | 2,01 GB | 226 / 231 | 1,000 | 0,792 | 0,622 |
| bf16 de referencia | JevK5 4B | 8,4 GB | — | 1,000 | 0,958 | 0,739 |
| bf16 de referencia | JevK5-2B | 3,8 GB | — | 1,000 | 0,806 | 0,604 |

Otros datos de rendimiento aportados por el autor:

| Hardware | JevK5-2B Q8_0 | JevK5 4B Q8_0 |
|---|---:|---:|
| Solo CPU, 48 hilos (servidor) | ~0,23-0,27 s | ~0,57 s |
| Apple M1 Pro, Metal | no medido | ~0,6 s |

Los tiempos corresponden a documentos cortos de unos 170 tokens y aumentan con la longitud del documento: aproximadamente 0,7-1,0 s (2B) y 1,8 s (4B) en CPU para los items dificiles del benchmark. Las GPU de consumo NVIDIA, AMD e Intel no se han medido. Para la latencia mas baja en NVIDIA, el runtime de transformers del repositorio del autor usa grafos CUDA y reporta unos 9-14 ms por decision en una H100. El autor senala que una compilacion Q8_0 del 4B construida del mismo modo y ejecutada en un M1 Pro con Metal coincidio en 230 de 231 respuestas.

## Requisitos de hardware

- Guia de seleccion del propio autor: GPU de 6 GB o mas, `jevk5-4b-v0.2-Q8_0` (4,48 GB); GPU de 4 GB, `jevk5-4b-v0.2-Q4_K_M` (2,71 GB) o `jevk5-2b-v0.2-Q8_0` (2,01 GB); sin GPU, `jevk5-2b-v0.2-Q8_0`.
- La Q4_K_M del 4B cabe en GPUs de 4 GB y en Macs de 8 GB, segun el autor.
- Los modelos de referencia sin cuantizar ocupan 8,4 GB (4B) y 3,8 GB (2B) en bf16; el repositorio completo ocupa 9,2 GB.
- VRAM exacta de inferencia (incluyendo memoria de contexto y overhead del runtime): no disponible. Los tamanos de fichero anteriores son el dato mas proximo aportado.
- Aceleradores compatibles: GPUs NVIDIA, AMD, Intel y Apple (Metal), ademas de CPU. No se han publicado mediciones en GPU de consumo NVIDIA, AMD o Intel.
- Despliegue: `llama-server` es el unico runtime probado por el autor, y es necesario porque la calibracion requiere una API que devuelva las log-probabilidades de las letras de respuesta para un prompt ya tokenizado. Ejemplo de arranque: `llama-server --hf-repo alibiserikbay/JevK5-GGUF --hf-file jevk5-2b-v0.2-Q8_0.gguf -c 8192 -ngl 99`.
- Ollama y LM Studio pueden cargar los ficheros, pero el autor no ha verificado si sus APIs exponen las log-probabilidades necesarias para obtener las probabilidades calibradas.
- No se mencionan vLLM, TGI ni otros servidores como opciones soportadas.
- Latencia medida: 0,23-0,27 s (2B Q8_0) y 0,57 s (4B Q8_0) en CPU de 48 hilos para documentos cortos; ~0,6 s (4B Q8_0) en M1 Pro con Metal; 9-14 ms por decision en H100 con el runtime de transformers y grafos CUDA. Throughput con peticiones concurrentes: no disponible, las mediciones son de una decision a la vez.
- El autor advierte de que no se publica una Q4_K_M del modelo de 2B porque modificaba 29 respuestas y bajaba la exactitud en el nivel dificil de 0,604 a 0,514.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevBench (estandar / dificil) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JevK5 4B, Q8_0 (este repositorio) | 4B nominal | no disponible | 0,958 / 0,721 | Apache-2.0 | GGUF publico en HuggingFace |
| JevK5 4B, bf16 (modelo base) | 4B nominal | no disponible | 0,958 / 0,739 | Apache-2.0 | Pesos en HuggingFace |
| JevK5-2B, Q8_0 (este repositorio) | 2B nominal | no disponible | 0,792 / 0,622 | Apache-2.0 | GGUF publico en HuggingFace |
| TypeSafe Jev | no disponible | no disponible | no disponible | Propietaria | Servicio propietario, del que este proyecto se declara alternativa no afiliada |

No se dispone de datos de otros modelos de decision abiertos comparables (parametros, contexto o resultados de JevBench) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo unicamente en ingles; no se declara soporte de otros idiomas.
- No es un modelo generativo: su salida util son log-probabilidades de un unico token. Usarlo para generar texto libre queda fuera de su diseno documentado.
- La calibracion solo esta verificada con `llama-server`. Con Ollama, LM Studio u otros clientes basados en llama.cpp, el autor no ha comprobado que las log-probabilidades esten disponibles y sean equivalentes.
- La evaluacion se apoya en 231 decisiones publicas de JevBench, un conjunto pequeno y con niveles de dificultad definidos por el propio autor del modelo; no hay validacion independiente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de uso en produccion por terceros.
- La cuantizacion Q4_K_M del 4B cambia 12 respuestas respecto a bf16, diez de ellas en el nivel dificil. Para decisiones sensibles conviene usar Q8_0 o recalibrar el umbral de confianza.
- La variante de 2B en Q4_K_M no se publica deliberadamente por la perdida de calidad (29 respuestas modificadas, exactitud dificil de 0,604 a 0,514), de modo que en GPUs muy ajustadas la unica opcion es Q8_0.
- No se han medido latencias en GPUs de consumo NVIDIA, AMD e Intel, asi que las cifras de rendimiento solo estan contrastadas en CPU, Apple Metal y H100.
- Riesgo de alucinacion: estructuralmente no puede inventar texto, pero si puede asignar alta probabilidad a una opcion incorrecta cuando la evidencia es ambigua o el criterio esta mal formulado. La model card no documenta evaluaciones de sesgo ni de robustez ante entradas adversarias.
- La licencia del modelo publicado es Apache-2.0, pero la informacion proporcionada no detalla los terminos de los modelos base ni del LoRA destilado (se menciona Qwen3.5-4B en la descripcion del repositorio de GitHub). Conviene verificar esas condiciones antes de un uso comercial.
- Existe una discrepancia entre los metadatos de HuggingFace (1.881.825.088 parametros) y los nombres comerciales de las variantes (4B y 2B). El metadato probablemente corresponde a una de las variantes y no al conjunto del repositorio; no se especifica a cual.
- La model card disponible esta truncada en la seccion de creacion de los ficheros, por lo que faltan detalles del proceso de conversion y cuantizacion.
- El proyecto no esta afiliado a TypeSafe AI ni a su producto Jev; la comparacion con este ultimo procede del propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alibiserikbay/JevK5-GGUF
- Modelo base JevK5: https://huggingface.co/alibiserikbay/JevK5
- Modelo base JevK5-2B: https://huggingface.co/alibiserikbay/JevK5-2B
- Repositorio del autor en GitHub: https://github.com/allebee/jevk5
- llama.cpp: https://github.com/ggml-org/llama.cpp
- JevBench: mencionado en la model card, sin URL disponible en la informacion proporcionada
- TypeSafe Jev: mencionado como producto propietario al que este modelo sirve de alternativa, sin URL disponible en la informacion proporcionada
