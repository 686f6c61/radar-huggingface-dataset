# jbarney/circuit-audio-7b

## Resumen

`circuit-audio-7b` es un adaptador LoRA de tipo "modelo de decisión" (System One) desarrollado por el usuario jbarney dentro de la familia *circuit* y publicado bajo licencia Apache 2.0. Se construye sobre el modelo de lenguaje de `Qwen/Qwen2-Audio-7B-Instruct`, cuyo encoder de audio permanece congelado, y añade una cabeza de lectura por punteros (*pointer readout head*). El modelo no transcribe ni genera texto libre: recibe un estado compuesto por un clip de audio (voz o no) y un texto opcional, junto con una pregunta tipada, y devuelve en una única pasada directa una distribución de probabilidad calibrada sobre las opciones de respuesta.

La innovación principal es el formato de decisión: cada opción se envuelve entre tokens delimitadores y la secuencia termina con un token *decide*; la cabeza puntúa el delimitador de cierre de cada opción contra ese token y aplica softmax. Como el vocabulario de Qwen2-Audio carece de los tokens de caja que usan los modelos de texto de la familia, se reutilizan tres tokens de marca temporal sin uso como delimitadores (registrados en `config.json` como `pointer_tokens`). El resultado es un clasificador de audio con probabilidades calibradas, pensado para decidir, no para conversar.

Es relevante ahora porque ataca un problema habitual en pipelines de voz: sustituir la cadena ASR + razonamiento textual por una decisión directa sobre el audio, con buena calibración y un coste de inferencia de una sola pasada. Sus resultados en la rejilla de evaluación propia mejoran de forma notable a la base sin ajustar (90,0 % frente a 68,7 % de exactitud sobre 300 clips). Conviene subrayar que se trata de un artefacto de investigación con 0 descargas y 0 *likes* en el momento de la consulta, entrenado íntegramente con voz sintética.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo de lenguaje de Qwen2-Audio-7B-Instruct (encoder de audio congelado) más cabeza de lectura por punteros; no es MoE ni SSM |
| Parametros totales | 40M en el adaptador LoRA (rank 16, alpha 32, solo proyecciones de atención y MLP del LM) + ~2,1M en la cabeza (dos mapas lineales de 4096 x 256); el recuento exacto del modelo base no se detalla en la información disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el entrenamiento usó un máximo de 1024 tokens y los clips se remuestrean a 16 kHz mono |
| Tipos de cuantizacion | No disponible; el repositorio publica el adaptador PEFT y la cabeza sin versiones cuantizadas |
| Idiomas soportados | Inglés (en), con voz de entrenamiento exclusivamente sintética |
| Licencia | Apache 2.0 (adaptador y cabeza); el modelo base Qwen2-Audio también es Apache 2.0 |
| Formato de pesos | `adapter/` (PEFT LoRA en safetensors), `head.pt` (PyTorch, claves `q.weight` y `k.weight`) y `config.json`; tamano del repo 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura combina tres piezas: el encoder de audio de Qwen2-Audio (congelado), el modelo de lenguaje de Qwen2-Audio-7B-Instruct con un adaptador LoRA de rank 16 y alpha 32 aplicado únicamente a las proyecciones de atención y MLP, y una cabeza de lectura por punteros formada por dos mapas lineales de 4096 x 256. El mecanismo de decisión envuelve cada opción candidata entre tokens delimitadores, cierra la secuencia con un token *decide* y puntúa el delimitador de cada opción contra dicho token antes de aplicar softmax, lo que produce una distribución de probabilidad sobre las alternativas en una sola pasada directa.

El entrenamiento usó la rejilla de audio del repositorio `circuit` (comando `python -m s1proto.data.audio_grid`): 1.000 clips, 10 celdas y aproximadamente un 8 % renderizado como ambiguo con etiquetas suaves, sin salidas de modelo maestro. Se realizó una época con batch 2, máximo de 1.024 tokens, aprendizaje de 1e-4 para el LoRA y 1e-3 para la cabeza, precisión bf16 y entropía cruzada con objetivos suaves, con parada temprana sobre la ECE de validación (mejor punto en el paso 400: ECE 0,082 y exactitud 88,3 %). El coste declarado es de unos 35 minutos en la GPU de un portátil Apple, sin hardware alquilado. Las operaciones cubiertas por la rejilla son clasificar, extraer, contar, comparar, consistencia y negación.

## Capacidades

- Clasificación de audio binaria y multiclase mediante preguntas tipadas (por ejemplo, distinguir voz de no voz o etiquetar el tipo de clip).
- Extracción de campos hablados: importes y números de cuenta, con rendimiento cercano al 100 % ya en el modelo base.
- Recuento de eventos sonoros (pitidos) y de elementos enumerados en una locución, la mejora más acusada del ajuste fino.
- Comparación de magnitudes ("¿el importe de este mes es mayor?") con respuesta calibrada.
- Comprobaciones de consistencia y de negación ("¿falta X en la lista?").
- Salida de distribuciones de probabilidad calibradas (ECE 0,072 en los clips decidibles), aptas para umbrales de confianza y triaje.
- Inferencia en una sola pasada directa, sin transcripción intermedia ni generación autoregresiva de texto.
- No dispone de *tool calling*, ni de capacidad de agente, ni de modo *thinking*; tampoco genera texto libre ni mantiene conversaciones multiturno.

## Casos de uso

- Triaje de llamadas de soporte: el modelo decide si un clip contiene habla y clasifica la operación solicitada en una sola pasada, de modo que un sistema de atención al cliente puede enrutar sin ejecutar un ASR completo. Su ECE de 0,072 permite fijar umbrales de derivación a un humano.
- Extracción de datos dictados: capturar importes y números de cuenta hablados directamente desde el audio, ya que la extracción de un importe o un número de cuenta está cerca del 100 % incluso en el modelo base.
- Verificación de lecturas en voz alta: comprobar que una persona ha leído correctamente una lista o una cifra (lectura de contadores, inventarios, verificación de pedidos), comparando la locución con el valor esperado mediante la operación de consistencia.
- Detección de omisiones en listas: validar que una locución enumera todos los elementos obligatorios ("¿falta X en la lista?"), tarea que pasa del 55 % al 100 % de acierto con el ajuste fino, útil en protocolos de verificación y *checklists*.
- Comparación de magnitudes en informes hablados: responder a preguntas del tipo "¿el importe de este mes es mayor?" sobre notas de voz, con una mejora del 46 % al 89 %, aplicable a resúmenes financieros o de consumo.
- Recuento de eventos acústicos en entornos controlados: contar pitidos o señales de un dispositivo en grabaciones cortas; es la celda más débil (67 %) y exige validación previa con audio real.
- Evaluación comparativa de pipelines de voz: servir de referencia en experimentos que midan si merece la pena una decisión directa sobre audio frente a la cadena ASR más razonamiento textual, dado que comparte base y coste por clip con Qwen2-Audio-7B-Instruct.
- Investigación sobre calibración: estudiar el comportamiento de las probabilidades en entradas ambiguas, donde el modelo declara una confianza media de 0,63 (0,27 en preguntas de conteo enmascaradas por ruido), frente al 0,67 de la base.

## Benchmarks y rendimiento

Rejilla de generalización sobre audio: llamadas de soporte sintetizadas, listas habladas y lectura de números, además de pitidos, ruido y silencio generados, con cada etiqueta calculada por el código que produjo el clip. Se evalúan 300 clips reservados con exactitud y ECE (15 bins).

| Modelo | Clips decidibles (279): exactitud / ECE | Los 300 clips: exactitud / ECE | ms por clip (portátil serie M) |
|---|---|---|---|
| Qwen2-Audio-7B-Instruct, sin ajustar, logits de letras | 72,0 % / 0,188 | 68,7 % / 0,214 | 1.180 |
| circuit-audio-7b | 93,5 % / 0,072 | 90,0 % / 0,109 | 1.180 |

Mejoras por celda frente a la base sin ajustar: conteo de pitidos (15 % a 67 %), conteo de elementos enumerados (63 % a 89 %), "¿falta X en la lista?" (55 % a 100 %) y "¿el importe de este mes es mayor?" (46 % a 89 %). La extracción de un importe o un número de cuenta hablado ya estaba cerca del 100 % sin ajuste. En los 21 clips convertidos en indecidibles (habla ahogada por ruido, corte antes de las palabras clave, dos importes iguales) la confianza media del ajuste fino es de 0,63 frente a 0,67 de la base; en preguntas de conteo con ruido cae a 0,27. El autor lo describe como el miembro menos sobreconfiado de la familia en entradas ambiguas, aunque todavía lejos de la distribución plana que exigiría la etiqueta. En validación, el mejor punto se alcanza en el paso 400 con ECE 0,082 y exactitud 88,3 %.

## Requisitos de hardware

- El adaptador y la cabeza ocupan 0,2 GB, pero la inferencia requiere cargar el modelo base Qwen2-Audio-7B-Instruct completo.
- VRAM estimada (no publicada por el autor, derivada del tamano del modelo base): en torno a 16-17 GB en bf16, unos 9-10 GB en cuantización de 8 bits y unos 5-6 GB en 4 bits, más el *overhead* de activaciones y del encoder de audio.
- GPU recomendadas: A100, H100 o L40S para bf16 con margen; RTX 4090 (24 GB) o RTX 3090 para bf16 ajustado o 8 bits.
- Cabe en GPU de consumo con cuantización de 8 o 4 bits (RTX 4090, 3090, 4080 de 16 GB en 4 bits), aunque la información disponible no documenta configuraciones de cuantización probadas.
- Despliegue: `transformers` + PEFT para cargar el adaptador y `head.pt`, y el evaluador propio del repositorio `circuit` (`uv run python scripts/eval_audio.py data/audio/grid/eval.jsonl --lora runs/circuit-audio-7b --out results/agrid.json`). vLLM es una vía razonable por su soporte de Qwen2-Audio, pero no está confirmada en la documentación del modelo.
- No se publican versiones GGUF, ni integración con Ollama o llama.cpp, ni plantillas de TGI.
- Latencia declarada: 1.180 ms por clip en la GPU de un portátil de la serie M, idéntica a la del modelo base sin ajustar. No se publica *throughput* en lote ni latencia en GPU de datacenter.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Rendimiento en la rejilla del autor | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| circuit-audio-7b | Qwen2-Audio-7B-Instruct | 40M de LoRA + ~2,1M de cabeza sobre base de 7B | No disponible (entrenamiento a 1.024 tokens) | 93,5 % / ECE 0,072 en 279 clips decidibles | Apache 2.0 | Adaptador y cabeza en HuggingFace; 0 descargas |
| Qwen2-Audio-7B-Instruct (base sin ajustar) | - | 7B (no detallado) | No disponible en la información proporcionada | 72,0 % / ECE 0,188 en 279 clips decidibles | Apache 2.0 | Modelo completo publicado |
| circuit-8b | No detallado | No disponible | No disponible | No disponible | No disponible | Adaptador en HuggingFace |
| circuit-vl-4b | No detallado | No disponible | No disponible | No disponible | No disponible | Adaptador en HuggingFace |
| circuit-1.7b | No detallado | No disponible | No disponible | No disponible | No disponible | Adaptador en HuggingFace |

Los tres modelos *circuit* restantes pertenecen a la misma familia y comparten el esquema de decisión y la cabeza de punteros, pero la información proporcionada no incluye sus especificaciones ni sus resultados, por lo que no es posible compararlos numéricamente.

## Limitaciones y advertencias

- El propio autor declara que no es un sistema de producción para decisiones que afecten a personas; su uso previsto es la investigación y la evaluación de modelos de decisión calibrados.
- Solo inglés, y todo el habla de entrenamiento es sintética (voces de macOS). Cabe esperar una caída de rendimiento en grabaciones reales hasta que se incorpore audio real al conjunto de datos.
- La rejilla de evaluación es pequeña: 1.000 clips de entrenamiento, 10 celdas y 300 clips de prueba, generados por el propio autor, lo que limita la generalización de las cifras.
- El conteo de pitidos sigue siendo la celda más débil, con un 67 % de acierto incluso tras el ajuste.
- En entradas ambiguas el modelo sigue siendo sobreconfiado: confianza media de 0,63 (0,27 en conteo con ruido), lejos de la distribución plana ideal.
- Riesgo de alucinación y de respuestas forzadas: al tratarse de un clasificador con softmax sobre opciones cerradas, siempre devuelve una distribución, incluso cuando el clip es indecidible.
- No se documentan sesgos concretos, pero al derivar de Qwen2-Audio-7B-Instruct y entrenarse con voces sintéticas, hereda los sesgos del modelo base y la distribución acústica de los sintetizadores usados.
- Restricciones de licencia: Apache 2.0 tanto en adaptador y cabeza como en el modelo base, lo que permite uso comercial, pero el aviso de uso previsto del autor desaconseja aplicaciones con impacto sobre personas.
- El repositorio tiene 0 descargas y 0 *likes*, y no se han publicado versiones cuantizadas, informes de seguridad ni evaluaciones por terceros.
- El soporte por HTTP del estado de audio se describe como el siguiente paso, de modo que la integración como servicio todavía no está resuelta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jbarney/circuit-audio-7b
- Modelo base: https://huggingface.co/Qwen/Qwen2-Audio-7B-Instruct
- Sitio del proyecto decision-circuits: https://decisioncircuits.com
- Repositorio de código `circuit`: https://github.com/Barneyjm/circuit
- Miembro de la familia circuit-1.7b: https://huggingface.co/jbarney/circuit-1.7b
- Miembro de la familia circuit-8b: https://huggingface.co/jbarney/circuit-8b
- Miembro de la familia circuit-vl-4b: https://huggingface.co/jbarney/circuit-vl-4b

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a páginas de soporte de Microsoft ajenas al tema.
