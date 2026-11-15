# oblivius/vrc-we-voice-es

## Resumen
vrc-we-voice-es es un modelo de deteccion de palabras clave (keyword spotting) para espanol, publicado por el usuario oblivius dentro del proyecto vrc-WiredExpressions. Se trata de un wav2vec2 afinado con CTC sobre letras, podado de 24 a 16 capas transformer y exportado a ONNX con cuantizacion dinamica int8, lo que reduce el peso del fichero a 254 MB. No es un transcriptor de proposito general, sino un detector de frases registradas por el cliente que debe dispararse cuando esas frases aparecen en audio continuo.

El modelo parte de jonatasgrosman/wav2vec2-large-xlsr-53-spanish (Apache 2.0) y se entrena con Common Voice 19.0, Multilingual Spoken Words Corpus y FLEURS, anadiendo ruido MUSAN en la mitad de las muestras. La innovacion principal es la tabla de pronunciacion `pron.tsv`, que permite registrar una frase por su sonido y no solo por su grafia, mejorando la deteccion de homofonos y variantes ortograficas.

Es relevante porque ofrece un detector de palabras clave ligero, ejecutable en local y en varios idiomas (comparte el codificador convolucional con otros modelos vrc-we-voice), con metricas de falsos positivos por hora sensiblemente mejores que el modelo base en pruebas locales de palabras aisladas y audio concurrido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer encoder) con cabeza CTC sobre letras |
| Parametros totales | no disponible (red podada a 16 capas transformer; repo de 0.5 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventanas de audio; entrenamiento con utterances de 0.5 a 15 s) |
| Tipos de cuantizacion | int8 dinamica en las MatMul (model.onnx y enc.onnx) |
| Idiomas soportados | es (espanol) |
| Licencia | Apache 2.0 (pesos y configuracion); pron.tsv bajo CC BY 4.0 |
| Formato de pesos | ONNX (model.onnx, enc.onnx), vocab.json, config.json, voice.json, pron.tsv |

## Arquitectura y entrenamiento
El modelo es un wav2vec2 afinado con CTC sobre letras, derivado de jonatasgrosman/wav2vec2-large-xlsr-53-spanish. Se poda a las 16 capas inferiores de 24 y se entrena con todas las capas y la cabeza activas. El codificador convolucional de rasgos queda congelado tras el afinado, de modo que se comparte entre todos los modelos vrc-we-voice y se expone por separado en `fx.onnx`; `enc.onnx` contiene la parte restante, de forma que `enc.onnx(fx.onnx(x))` equivale exactamente a `model.onnx(x)`. La salida son logits de forma `[batch, frames, 41]` con frames de 20 ms, entrada float32 a 16 kHz mono con media cero y varianza unitaria.

El entrenamiento usa lotes de 40 s de audio con 2 acumulaciones por paso, AdamW, 10 % de warm-up y decaimiento lineal. Los datos son Common Voice 19.0 (280.781 utterances, CC0 1.0), Multilingual Spoken Words Corpus (446.571 utterances, CC BY 4.0) y FLEURS train (2.205 utterances, CC BY 4.0), con ruido MUSAN (CC BY 4.0) en la mitad de las utterances a 5-20 dB SNR y un 5 % de muestras solo de ruido con objetivo vacio. La primera etapa (poda a 16 capas, 12.000 pasos, 3e-5) se conserva; la continuacion de 4.000 pasos a 1e-5 con palabras aisladas muestreadas al 0,35 es la version final (mejora de +12,3 en palabras con ruido); una segunda continuacion de 6.000 pasos a 1,5e-5 se descarto (neto -17,8).

La tabla `pron.tsv` contiene 30.000 palabras con su sonido en IPA (CharsiuG2P sin marcas de acento, silaba ni enlace) y sus variantes ortograficas (2.363 en total), generadas por un transformer de caracteres de 3+3 capas y anchura 256 entrenado de sonido a grafia con beam 8. Permite registrar una frase por su sonido ademas de por su grafia.

## Capacidades
- Deteccion de palabras clave y frases registradas por el cliente en audio continuo, con umbral de disparo configurable (por defecto -0,6 en `voice.json`).
- Reconocimiento de voz CTC sobre letras en espanol (salida de logits por frame de 20 ms).
- Deteccion por sonido ademas de por grafia: homofonos y variantes ortograficas se agrupan bajo la misma frase registrada.
- Inferencia en dos etapas (`fx.onnx` + `enc.onnx`) para reutilizar el codificador convolucional entre idiomas.
- Ejecucion en ONNX Runtime con cuantizacion int8 dinamica.
- No soporta tool calling, function calling, agentes, vision, audio generativo ni modo de razonamiento explicito; es un modelo puramente acustico y discriminativo.

## Casos de uso
- Activacion por voz en dispositivos empotrados: el modelo int8 de 254 MB puede ejecutarse en local para detectar una palabra de activacion concreta antes de despertar un asistente mayor, con umbral ajustable y bajo coste de falsos positivos en audio no hablado (0,05 por frase-hora).
- Deteccion de comandos en aplicaciones de accesibilidad: registrar frases como "abrir menu" o "detener" y disparar acciones cuando se pronuncian, con tolerancia a homofonos gracias a `pron.tsv`.
- Monitorizacion de emisiones de radio o podcast: registrar terminos de marca o nombres propios y contar apariciones en audio continuo, usando la deteccion por sonido para capturar variantes de pronunciacion.
- Filtrado previo en pipelines de ASR: usar el detector como etapa de cribado para decidir que segmentos de audio se envian a un transcriptor completo, reduciendo coste computacional.
- Sistemas de subtitulado con palabras clave resaltadas: detectar terminos concretos en una transcripcion en curso para resaltarlos o enlazarlos, aprovechando la salida CTC por frame.
- Juguetes y dispositivos interactivos: activacion por frases registradas en hardware con CPU, sin GPU, gracias al formato ONNX int8 y a la separacion en dos ficheros para clientes multilingues.
- Investigacion en keyword spotting: punto de partida podado y cuantizado para comparar estrategias de deteccion por sonido frente a deteccion por grafia con las mismas condiciones de evaluacion.

## Benchmarks y rendimiento
Los datos son pruebas locales de keyword spotting del autor, no benchmarks estandar. Ambos modelos se ejecutan en int8 con su propio umbral (este modelo -0,6; el base -0,75). Se compara con facebook/wav2vec2-xlsr-53-espeak-cv-ft.

| Exito % / falsos positivos por hora | wav2vec2-xlsr-53-espeak-cv-ft (base) | vrc-we-voice-es |
|---|---|---|
| Frases | 94,5 / 0,48 | 95,4 / 0,18 |
| Frases con ruido | 95,4 / 0,42 | 93,6 / 0,24 |
| Palabras | 56,8 / 2,12 | 80,5 / 0,65 |
| Palabras con ruido | 51,6 / 1,79 | 80,5 / 0,49 |
| Audio concurrido | 70,6 / 0,92 | 86,0 / 0,31 |
| Audio no hablado | no disponible / 0,21 | no disponible / 0,05 |

Efecto de la tabla de pronunciacion en conjuntos de palabras locales limpias:

| Metrica | Sin tabla | Con tabla |
|---|---|---|
| Homofonos detectados como otro miembro del grupo, % | 48 | 69 |
| Variantes ortograficas detectadas como otro miembro del grupo, % | 34 | 54 |
| Falsos positivos por frase-hora en los conjuntos de palabras | 0,35 | 0,35 |

Las pruebas de frases usan una frase por oracion del test de FLEURS; la variante con ruido anade ruido a 10 dB SNR. Las de palabras usan clips aislados del test de Multilingual Spoken Words de hablantes no vistos en entrenamiento. La prueba de audio concurrido registra todas las frases a la vez; la de audio no hablado usa musica de MUSAN y sonidos vocales de VocalSound.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita; el fichero int8 pesa 254 MB, por lo que cabe en memoria de CPU y en GPUs de gama baja.
- GPU recomendadas: no disponible; al ser ONNX int8, puede ejecutarse en CPU, GPU integrada o GPUs consumer como RTX 3060 o superiores sin requisitos especificos documentados.
- Cabe en GPU consumer: si, dado el tamano del modelo; no se documentan requisitos minimos.
- Opciones de despliegue: ONNX Runtime (formato nativo); no se documentan exportaciones a vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la prueba local | Licencia | Formato |
|---|---|---|---|---|---|
| vrc-we-voice-es | no disponible (16 capas, podado) | no disponible | 95,4 % frases / 80,5 % palabras | Apache 2.0 (pesos) | ONNX int8 |
| jonatasgrosman/wav2vec2-large-xlsr-53-spanish | no disponible (24 capas) | no disponible | no evaluado en la prueba local | Apache 2.0 | safetensors |
| facebook/wav2vec2-xlsr-53-espeak-cv-ft | no disponible | no disponible | 94,5 % frases / 56,8 % palabras | no disponible | no disponible |

## Limitaciones y advertencias
- Modelo especializado en deteccion de palabras clave, no en transcripcion de proposito general; la salida es CTC sobre letras y requiere un cliente que registre frases y aplique umbral.
- Solo soporta espanol.
- Las metricas son pruebas locales del autor, no benchmarks estandar; la comparacion con el modelo base usa umbrales distintos para cada uno.
- Riesgo de falsos positivos en audio concurrido (0,31 por frase-hora) y en homofonos; la tabla de pronunciacion mejora la deteccion pero no elimina la ambiguedad (31 % de homofonos no detectados como grupo correcto).
- La tabla `pron.tsv` tiene licencia CC BY 4.0, distinta de la Apache 2.0 de los pesos; conviene revisar atribuciones si se redistribuye.
- El modelo se entrena con utterances de 0,5 a 15 s; no se documenta comportamiento con ventanas mas largas.
- No se documentan sesgos demograficos ni de acento; el rendimiento puede variar con hablantes fuera de la distribucion de Common Voice y Multilingual Spoken Words.
- La cuantizacion int8 dinamica puede degradar ligeramente la precision respecto al modelo en float; no se publican metricas comparativas float frente a int8.

## Enlaces
- Hugging Face: https://huggingface.co/oblivius/vrc-we-voice-es
- Modelo base: https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-spanish
- Modelo de comparacion: https://huggingface.co/facebook/wav2vec2-xlsr-53-espeak-cv-ft
- Modelo hermano en ingles: https://huggingface.co/oblivius/vrc-we-voice-en
- Common Voice 19.0: https://commonvoice.mozilla.org
- Multilingual Spoken Words Corpus: https://mlcommons.org/datasets/multilingual-spoken-words/
- FLEURS: https://huggingface.co/datasets/google/fleurs
- MUSAN: https://www.openslr.org/17/
- CharsiuG2P: https://github.com/lingjzhu/CharsiuG2P
- Exportacion ONNX de CharsiuG2P: https://huggingface.co/klebster/g2p_multilingual_byT5_tiny_onnx
