# Rcarvalo/lfm2a-fr-v3-checkpoints

## Resumen

Este repositorio, publicado por el usuario Rcarvalo, no contiene un modelo nuevo en el sentido habitual, sino los checkpoints intermedios y finales de dos experimentos de ajuste fino sobre LiquidAI/LFM2.5-Audio-1.5B. El objetivo declarado es adaptar un modelo de audio de proposito general hacia un asistente de voz en frances, manteniendo la voz femenina estadounidense del modelo base para el ingles y preservando las capacidades de texto del modelo de lenguaje subyacente. El autor lo describe explicitamente como artefacto de experimento y no como release: los pesos se publican para liberar disco de la maquina de entrenamiento y para que sirvan de punto de partida de futuras ejecuciones.

El modelo base es LFM2-Audio, una arquitectura de Liquid AI que combina un backbone de lenguaje con modulos de audio y un depth transformer, y que utiliza el codec Mimi (el codebook 0 de Mimi, que determina que sonido viene despues, se predice a partir del estado oculto del backbone). El tamano es de 1.500 millones de parametros y el corpus de entrenamiento documentado trabaja con un contexto de 1.024 tokens. La licencia es lfm1.0, etiquetada como "other" en HuggingFace.

La relevancia de esta publicacion es acotada y practica: documenta con detalle poco habitual la receta de ajuste fino (corpus, tasas de aprendizaje, congelacion parcial del backbone, decodificacion recomendada) y publica metricas de INCLUDE-fr y de WER de sintesis de voz para cada checkpoint, incluido el veredicto negativo de una de las dos ramas. Resulta util para quien quiera reproducir el proceso o reutilizar los pesos, pero no es un modelo listo para produccion ni ha sido validado por la comunidad (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2-Audio: backbone de lenguaje + modulos de audio + depth transformer, con codec Mimi |
| Parametros totales | 1.500 millones (heredados de LiquidAI/LFM2.5-Audio-1.5B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.024 tokens en el corpus de entrenamiento; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | frances (fr) e ingles (en) |
| Licencia | lfm1.0 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | safetensors (un unico `model.safetensors` por checkpoint) |
| Modelo base | LiquidAI/LFM2.5-Audio-1.5B (revision c362a0625dfe45aa588dce5f0ada28a7e5707628) |
| Tamano del repositorio | 58,8 GB (agregado de todos los checkpoints) |
| Tarea declarada | text-to-speech (con soporte de speech-to-speech) |
| Fecha de creacion / actualizacion | 2026-10-09 / 2026-10-12 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base sin modificaciones estructurales: un backbone de lenguaje LFM2-Audio de 1,5B acompanado de modulos de audio y un depth transformer, con el codec Mimi como representacion discreta del audio. La particularidad tecnica relevante para el ajuste fino es que el codebook 0 de Mimi (que determina que sonido viene despues) se predice a partir del estado oculto del backbone, de ahi que una de las dos ramas de entrenamiento congele parcialmente el backbone: se aplica una tasa de aprendizaje de 1e-5 al backbone del modelo de lenguaje (`lm_lr_scale` 0,1) y de 1e-4 a los modulos de audio y al depth transformer, con 300 pasos de warm-up y decaimiento coseno. El batch es de 8 x 8 acumulacion = 64 ejemplos, en bf16, con AdamW y recorte de gradiente 1.0, durante 2 epocas (6.574 pasos).

El corpus comun, denominado `anchor_v5`, contiene 207.033 ejemplos de entrenamiento con contexto de 1.024 tokens, y en todos ellos solo se supervisa el turno del asistente. Se compone de tres bloques: ASR sobre voz real multihablante (31.056 clips en frances procedentes de Emilia-YODAS, Multilingual LibriSpeech, Common Voice, VoxPopuli y CEFC-Orfeo, y 21.211 clips en ingles de LibriTTS-R); TTS e TTS intercalado (6 tokens de texto por 12 frames de audio) sobre la voz del asistente, con 9.750 clips de SIWIS, 21.267 clips en frances sintetizados con un Qwen3-TTS ajustado sobre SIWIS y 21.216 clips en ingles con la voz femenina estadounidense del modelo base; y aproximadamente la mitad de ejemplos puramente textuales (39.198 intercambios pregunta/respuesta en frances y 14.727 en ingles de `Rcarvalo/text-replay-fr-en`, vistos dos veces). La segunda rama anade un conjunto de numeros en frances (3.000 frases de plantilla con fechas, horas, precios, porcentajes, direcciones, anos y cantidades en digitos, de las que 1.761 se conservaron tras validacion con Whisper), motivado porque los numeros se leian a menudo en ingles.

La primera rama, `stage_a`, parte del modelo base y entrena todos los parametros con tasa 1e-4 durante 2.000 pasos (checkpoints cada 500). La segunda, `stage_b_var`, parte de los pesos de una ejecucion intermedia no publicada en este repositorio (`s1-text62-lm1.0`, con 62 % de ejemplos textuales) y es la que se considera el resultado final. El autor documenta explicitamente que `stage_a` fue un callejon sin salida: con puntuaciones de texto iguales o mejores, la ejecucion `s1-text62-lm1.0` alcanza un WER de TTS de 0,12 frente a los 0,19-0,22 de `stage_a`. La decodificacion recomendada (decision D42 del proyecto) es muestreo del audio con temperatura 1,0 y top-k 4, tanto en generacion secuencial como intercalada, manteniendo el texto en modo greedy.

## Capacidades

- Reconocimiento automatico del habla (ASR) en frances e ingles sobre voz real multihablante, invocado mediante prompts explicitos del tipo `Perform ASR. The audio is in French.`.
- Sintesis de voz (TTS) en frances con la voz SIWIS, y en ingles con la voz femenina estadounidense del modelo base, mediante prompts como `Perform TTS. Use the French female voice.`.
- Generacion intercalada de texto y audio (TTS intercalado) con una relacion supervisada de 6 tokens de texto por 12 frames de audio.
- Generacion de texto y respuesta a preguntas en frances e ingles, con las capacidades del modelo de lenguaje subyacente preservadas por el bloque de reinyeccion de texto.
- Lectura correcta de numeros en frances (fechas, horas, precios, porcentajes, direcciones, anos, cantidades), capacidad reforzada de forma especifica en la rama `stage_b_var`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision o audio de entrada mas alla del audio conversacional: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Asistente de voz en frances para prototipado: el modelo acepta audio y genera audio y texto de forma intercalada, por lo que sirve para montar una demo de asistente conversacional en frances con la voz SIWIS, siempre que se asuma su caracter experimental.
- Lectura en voz alta de texto frances con digitos: gracias al conjunto especifico de numeros anadido en `stage_b_var`, es adecuado para leer fechas, precios, porcentajes y direcciones sin que el modelo derive al ingles, un fallo frecuente en el modelo base.
- Transcripcion ASR de audio multihablante en frances e ingles: el corpus incluye voz real de Emilia-YODAS, Common Voice, VoxPopuli y LibriTTS-R, por lo que el ajuste esta orientado a transcripcion de audio no studio.
- Reentrenamiento o continuacion de una linea de investigacion: cada checkpoint puede usarse como punto de partida de una nueva ejecucion con `s2s-finetune --model-id <carpeta>`, ya que los pesos se conservan en formato safetensors estandar.
- Evaluacion comparativa de estrategias de ajuste fino: el repositorio incluye `params.json` con la configuracion completa y un directorio `eval/` con `summary.json` y CSV por frase, lo que permite reproducir el analisis de las dos ramas sin reentrenar.
- Generacion de datos sinteticos de audio en frances: los checkpoints pueden emplearse para producir respuestas de asistente en la voz objetivo, de forma analoga a como el autor genero parte de su propio corpus con un Qwen3-TTS ajustado sobre SIWIS.
- Investigacion sobre congelacion selectiva de capas en modelos de audio: la comparacion entre `stage_a` (todo a 1e-4) y `stage_b_var` (backbone a 1e-5) documenta el efecto de ralentizar el backbone sobre la calidad de la sintesis.
- Integracion en pipelines de voz en tiempo real: no recomendada con la informacion disponible, ya que no se publican datos de latencia ni de throughput.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a la rama `stage_a` y al modelo base. La metrica INCLUDE-fr se calcula sobre 419 preguntas y mide la log-probabilidad de la letra de respuesta, con un error estandar aproximado de 2,4 puntos. El WER de TTS frances se calcula sobre 50 frases sonda fijas no vistas en entrenamiento, con decodificacion D42 (temperatura 1,0, top-k 4), semilla 0, prompt generico `Perform TTS. Use a French voice.` y transcripcion con Whisper-small.

| Modelo / checkpoint | Pasos | INCLUDE-fr (419 preguntas) | WER de TTS en frances |
|---|---|---|---|
| Modelo base LFM2.5-Audio-1.5B | 0 | 42,2 % | 0,62 |
| `stage_a` checkpoint_0 | 500 | 39,1 % | 0,319 |
| `stage_a` checkpoint_1 | 1.000 | 33,7 % | 0,262 |
| `stage_a` checkpoint_2 | 1.500 | 37,7 % | 0,190 |
| `stage_a` checkpoint_3 (= final) | 2.000 | 37,7 % | 0,217 |
| Referencia `s1-text62-lm1.0` (no publicada en este repo) | 2.600 | igual o mejor que `stage_a` | 0,12 |

No se publican resultados de MMLU, HumanEval, GSM8K ni de otras baterias de benchmarks en la informacion disponible. Tampoco se publican metricas para la rama `stage_b_var` mas alla de su WER final descrito de forma agregada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato publicado. Como referencia aritmetica a partir del numero de parametros, 1.500 millones en bf16 ocupan aproximadamente 3 GB de pesos, a los que hay que sumar el coste del codec de audio y de la cache de atencion a 1.024 tokens; una estimacion razonable se situa en 4-6 GB en bf16 y bastante menos con cuantizacion de 8 o 4 bits. Estas cifras son estimaciones derivadas del tamano, no datos del autor.
- GPU recomendadas: no disponible. Por el perfil de memoria estimado, el modelo seria ejecutable en GPUs de consumo como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080 o RTX 4090, asi como en A100 o H100 para entrenamiento o lotes grandes.
- Cabe en GPU de consumo: probable segun el calculo anterior, pero no confirmado por el autor.
- Opciones de despliegue: la model card solo documenta la carga mediante `LFM2AudioModel.from_pretrained` sobre una carpeta que contenga `model.safetensors` junto con el resto de ficheros del modelo base, y el uso en entrenamiento con `s2s-finetune --model-id <carpeta>`. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio completo ocupa 58,8 GB, aunque un unico checkpoint requiere aproximadamente el tamano de los pesos del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | INCLUDE-fr | WER de TTS fr | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Rcarvalo/lfm2a-fr-v3-checkpoints (`stage_a` final) | 1,5B | 1.024 tokens (entrenamiento) | 37,7 % | 0,217 | lfm1.0 | Publicado como artefacto de experimento, 0 descargas |
| LiquidAI/LFM2.5-Audio-1.5B (modelo base) | 1,5B | no disponible | 42,2 % | 0,62 | lfm1.0 (lfm1.0 en el ajuste) | Release oficial de Liquid AI |
| `s1-text62-lm1.0` (referencia interna del autor) | 1,5B | 1.024 tokens | igual o mejor que `stage_a` | 0,12 | no disponible | No publicado en este repositorio |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | No se documentan otras alternativas en la informacion proporcionada |

El modelo base y la ejecucion interna de referencia son los dos unicos terminos de comparacion documentados. No se dispone de datos sobre modelos competidores de sintesis de voz o de audio conversacional en la informacion proporcionada.

## Limitaciones y advertencias

- No es un release: el propio autor lo califica de artefacto de experimento publicado para liberar disco y para servir de punto de partida, no como un modelo listo para uso.
- Las ejecuciones no se pueden reanudar de forma exacta: no se subieron los estados del optimizador, del scheduler ni del generador de numeros aleatorios.
- El tokenizer, el processor y el detokenizador de audio no se incluyen en este repositorio; hay que descargarlos del modelo base en la revision concreta indicada.
- Solo se supervisa el turno del asistente en el entrenamiento, lo que limita el comportamiento en dialogos con roles invertidos o con historial largo.
- El contexto de entrenamiento documentado es de 1.024 tokens, insuficiente para conversaciones largas.
- Ambito linguistico restringido a frances e ingles; el resto de idiomas no esta soportado ni evaluado.
- Riesgo de alucinacion en ASR y en respuestas de texto: no se aportan datos de robustez, de tasas de error por dominio ni de evaluacion con conjuntos adversarios.
- Parte de los datos de entrenamiento son sinteticos (Qwen3-TTS ajustado sobre SIWIS), por lo que los artefactos del generador pueden haberse transferido al modelo.
- Sesgos: no se documenta ningun analisis de sesgos de genero, acento, edad ni origen social, pese a que el modelo fija una unica voz por idioma.
- Licencia lfm1.0, etiquetada como "other" en HuggingFace: las condiciones exactas de uso comercial deben verificarse en el fichero LICENSE del repositorio y en los terminos de Liquid AI. No se puede asumir uso comercial libre.
- Los checkpoints `stage_a` se describen como un callejon sin salida con peor WER que una ejecucion intermedia no publicada; reutilizarlos sin mas puede dar resultados suboptimos.
- Sin validacion de la comunidad: 0 descargas y 0 likes, sin issues ni evaluaciones externas.
- No se publican datos de latencia, throughput ni consumo energetico, lo que impide planificar un despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rcarvalo/lfm2a-fr-v3-checkpoints
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-Audio-1.5B
- Revision del modelo base usada por el autor: c362a0625dfe45aa588dce5f0ada28a7e5707628
- Fichero de licencia del repositorio: LICENSE (referenciado como `license_link` en la model card)
- Dataset de voz SIWIS: https://huggingface.co/datasets/Rcarvalo/siwis-fr-24k
- Dataset de texto de reinyeccion: https://huggingface.co/datasets/Rcarvalo/text-replay-fr-en
- Repositorio de entrenamiento: la model card menciona la herramienta `s2s-finetune` y "the training repository", pero no incluye una URL verificable; no disponible.
- Paper, blog o demo oficial del ajuste: no disponible.
- Resultados de la busqueda web: las consultas devolvieron exclusivamente contenido no relacionado con el modelo (paginas de video para adultos y agregadores de webcams). No se ha identificado ningun enlace relevante y no se incluye ninguno.
