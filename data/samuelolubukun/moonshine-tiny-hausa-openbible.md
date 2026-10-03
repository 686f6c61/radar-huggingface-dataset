# samuelolubukun/moonshine-tiny-hausa-openbible

## Resumen

El modelo `samuelolubukun/moonshine-tiny-hausa-openbible` es un ajuste fino del checkpoint `UsefulSensors/moonshine-tiny` (un Transformer encoder-decoder de aproximadamente 27 millones de parametros) especializado en reconocimiento automatico del habla (ASR) en hausa (`ha`). Lo publica el usuario samuelolubukun y su objetivo es cubrir una carencia evidente: la mayoria de los modelos ASR de tamano pequeno estan entrenados casi exclusivamente en ingles, y las lenguas africanas con ortografia ganchuda (`ɓ`, `ɗ`, `ƙ`, `ƴ`) apenas tienen representacion en modelos abiertos.

El ajuste se ha realizado sobre la configuracion en hausa del dataset `multilingual-tts/open-bible`, con 30.676 segmentos de audio a 16 kHz grabados en estudio, durante 5.000 pasos (unas 2,92 epocas) en una unica GPU NVIDIA A10G. El autor amplia el vocabulario del tokenizador con 9 tokens especificos para las consonantes ganchudas y un token de idioma `<|ha|>`, lo que permite preservar distinciones foneticas que un vocabulario heredado del ingles no cubriria.

Su relevancia es doble. Por un lado, demuestra que es posible adaptar un modelo ASR de menos de 30 millones de parametros a una lengua de bajos recursos con recursos de computo muy modestos. Por otro lado, publica un WER del 27,09 % (texto normalizado) sobre un conjunto de test de 100 muestras de hablantes y capitulos no vistos, una cifra razonable para un modelo de este tamano pero que todavia queda lejos de un uso en produccion sin supervision humana. Actualmente el repositorio no tiene descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Moonshine, Useful Sensors) |
| Parametros totales | 27.095.616 (~27 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; al ser un modelo ASR procesa audio de longitud variable con padding dinamico, no una ventana de tokens fija |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors) |
| Idiomas soportados | hausa (`ha`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Frecuencia de muestreo de entrada | 16.000 Hz, mono |
| Vocabulario extendido | 9 tokens: `ɓ`, `ɗ`, `ƙ`, `ƴ`, `Ɓ`, `Ɗ`, `Ƙ`, `Ƴ`, `<|ha|>` |
| Modelo base | UsefulSensors/moonshine-tiny (~27 M) |
| Dataset de ajuste | multilingual-tts/open-bible, configuracion hausa (30.676 segmentos) |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | automatic-speech-recognition |
| Fecha de creacion (segun HuggingFace) | 2026-10-03 |

## Arquitectura y entrenamiento

La arquitectura es la de Moonshine, un Transformer encoder-decoder pensado para ASR que procesa audio a 16 kHz y genera texto autoregresivamente. A diferencia de Whisper, Moonshine no fuerza el relleno de todas las entradas a una ventana fija de 30 segundos, lo que reduce el coste computacional en clips cortos y lo hace apto para inferencia en dispositivos modestos. El encoder consume el audio y el decoder produce la transcripcion; el checkpoint tiny tiene unos 27 millones de parametros en total, coherente con el recuento de safetensors del repositorio (27.095.616).

El ajuste fino no sigue un esquema de RLHF ni DPO, sino un entrenamiento supervisado clasico de secuencias con perdida tipo cross-entropy sobre pares audio-transcripcion. Segun la model card, se ejecutaron 5.000 pasos con batch de 8 y acumulacion de gradiente de 2 (batch efectivo de 16), learning rate de 5e-5 con warmup lineal de 100 pasos, precision mixta FP16 y una sola A10G de 24 GB. La curva de perdida descendio de 2,1450 (paso 0) a 0,3012 (paso 5.000) sin sintomas de sobreajuste declarados, con la norma de gradiente bajando de 2,627 a 1,210. El autor documenta hitos intermedios: estabilizacion de los embeddings de consonantes ganchudas hacia el paso 750, asentamiento del reconocimiento a nivel de palabra hacia el paso 1.000 y fluidez a nivel de clausula hacia el paso 2.000.

La innovacion tecnica mas destacable es precisamente la extension del vocabulario: anadir tokens dedicados a `ɓ`, `ɗ`, `ƙ`, `ƴ` y sus mayusculas evita que el tokenizador herede una segmentacion pensada para ingles y permite al modelo distinguir pares minimos del hausa. No se documentan otras tecnicas como decodificacion especulativa, atencion lineal o destilacion.

## Capacidades

- Transcripcion de voz en hausa a texto sin puntuacion ni capitalizacion por defecto, salida en minusculas.
- Reconocimiento de consonantes ganchudas del hausa (`ɓ`, `ɗ`, `ƙ`, `ƴ`) gracias a los tokens anadidos al vocabulario.
- Decodificacion con beam search; en la evaluacion del autor se uso `num_beams=4`, `repetition_penalty=1.3` y `no_repeat_ngram_size=3`.
- Manejo de audio de longitud variable a 16 kHz mono, sin el recorte fijo de 30 segundos tipico de Whisper.
- Vocabulario y fraseologia de registro biblico y religioso, incluyendo nombres propios y terminos poco frecuentes (`filistiyawa`, `gwauruwa`, `maraya`, `baƙo`, `talaka`).
- Ausencia de alucinacion de citas declarada por el autor: 0 % de citation hallucinations en las 100 muestras de test.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo de pensamiento; no es un modelo de instrucciones.
- No dispone de capacidades de vision, audio clasificacion ni traduccion explicita.
- Multilingue: no, esta especializado exclusivamente en hausa.

## Casos de uso

- Transcripcion de audio religioso en hausa: el modelo esta ajustado sobre el corpus `open-bible`, por lo que sermonones, lecturas y material devocional en este registro son su dominio natural. Su ventana de audio variable evita recortes artificiales en fragmentos largos.
- Archivado y digitalizacion de patrimonio oral hausaparlante: convertir grabaciones de campo a texto buscable, aceptando una revision humana posterior dado el WER del 27 % en texto normalizado.
- Subtitulado asistido para creadores de contenido en hausa: generar subtitulos preliminares con un modelo de 27 M que se ejecuta en CPU o en una GPU de gama baja, y corregir despues las variaciones ortograficas.
- Investigacion en ASR de bajos recursos: sirve como punto de partida para fine-tuning en otras lenguas africanas con ortografia ganchuda, ya que el vocabulario extendido y los hiperparametros documentados son reproducibles con una sola GPU de 24 GB.
- Aplicaciones de voz offline en hardware limitado: con menos de 60 MB en FP16, el modelo puede integrarse en dispositivos embebidos o moviles sin conexion, util en regiones con conectividad intermitente.
- Alfabetizacion y ensenanza del hausa escrito: el reconocimiento correcto de consonantes ganchudas permite usarlo en herramientas que refuercen la ortografia estandar frente a variantes dialectales.
- Analisis de entrevistas y trabajo de campo en ciencias sociales: transcripcion semiautomatica de corpus orales en hausa, con el modelo actuando como primer paso y un anotador humano validando la salida.
- Accesibilidad en servicios publicos locales: transcripcion en tiempo casi real de interacciones presenciales en hausa para generar actas o resumenes escritos, siempre con supervision.

## Benchmarks y rendimiento

El autor publica resultados sobre 100 muestras de test de hablantes y capitulos no vistos, con beam search (`num_beams=4`, `repetition_penalty=1.3`, `no_repeat_ngram_size=3`):

| Metrica | Texto literal (raw) | Texto normalizado (clean) |
|---|---|---|
| Word Error Rate (WER) | 36,88 % | 27,09 % |
| Character Error Rate (CER) | 13,33 % | 10,23 % |
| Alucinaciones de citas | 0 % | 0 % |

La normalizacion "clean" aplica NFC Unicode, minusculas, eliminacion de puntuacion y colapso de espacios, siguiendo la practica habitual de la comunidad de habla. No se han publicado en la informacion disponible resultados comparativos del modelo frente a Whisper, Wav2Vec2 u otros sistemas ASR evaluados sobre el mismo conjunto de test en hausa, por lo que no es posible establecer una comparacion numerica directa.

Registro de convergencia del entrenamiento declarado por el autor:

| Paso | Epoca | Perdida de entrenamiento | Norma de gradiente |
|---|---|---|---|
| 0 | 0,00 | 2,1450 | no disponible |
| 750 | 0,45 | 0,5889 | 2,627 |
| 1.000 | 0,58 | 0,5241 | 1,928 |
| 2.000 | 1,17 | 0,4102 | 1,832 |
| 3.000 | 1,75 | 0,3213 | 1,439 |
| 4.000 | 2,34 | 0,3150 | 1,390 |
| 5.000 | 2,92 | 0,3012 | 1,210 |

## Requisitos de hardware

- VRAM estimada: muy baja. Con 27,1 M de parametros, los pesos ocupan aproximadamente 108 MB en FP32, 54 MB en FP16 y 27 MB en INT8, mas el buffer de activaciones del encoder, tipicamente por debajo de 1 GB en total para clips de duracion moderada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. El autor entreno en una NVIDIA A10G de 24 GB, pero para inferencia basta una GTX 1050 Ti, una T4, una RTX 3060 o incluso una RTX 4090 sobradamente.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo de los ultimos diez anos, y previsiblemente tambien en CPU y en dispositivos tipo Raspberry Pi.
- Opciones de despliegue: la via natural es la libreria `transformers` de HuggingFace con la clase correspondiente a la familia Moonshine; tambien es habitual exportar estos modelos a ONNX Runtime, ya que los checkpoints originales de Moonshine se distribuyen en ese formato. No se confirma en la informacion disponible soporte en llama.cpp, Ollama, vLLM o TGI, herramientas orientadas a modelos de lenguaje mas que a ASR.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia por segundo de audio ni de factor de tiempo real para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Contexto de audio | Licencia | Formato | WER en hausa |
|---|---|---|---|---|---|---|
| samuelolubukun/moonshine-tiny-hausa-openbible | 27,1 M | hausa | longitud variable a 16 kHz | apache-2.0 | safetensors | 27,09 % (normalizado) |
| UsefulSensors/moonshine-tiny (base) | ~27 M | ingles | longitud variable a 16 kHz | no disponible en la informacion proporcionada | safetensors, ONNX | no disponible |
| openai/whisper-tiny | 39 M | multilingue (99 idiomas) | ventana fija de 30 s, 16 kHz | apache-2.0 | safetensors, GGUF (comunidad) | no disponible |
| openai/whisper-base | 74 M | multilingue (99 idiomas) | ventana fija de 30 s, 16 kHz | apache-2.0 | safetensors, GGUF (comunidad) | no disponible |

La comparacion se limita a arquitectura, tamano, licencia y formato porque no hay cifras publicas de WER en hausa para los modelos alternativos dentro de la informacion disponible. Whisper tiny y base cubren hausa dentro de su conjunto multilingue, pero con mucha menos presencia de la lengua en el entrenamiento y con un coste computacional mayor por el padding fijo a 30 segundos.

## Limitaciones y advertencias

- Dominio muy restringido: el ajuste se hizo exclusivamente sobre texto biblico del corpus `open-bible`. El rendimiento fuera de ese registro (conversacion coloquial, noticias, terminos tecnicos, habla con ruido de fondo) no esta medido y previsiblemente sera peor.
- WER elevado: 27,09 % en texto normalizado y 36,88 % en texto literal sobre hablantes no vistos. Es una tasa demasiado alta para transcripcion automatica sin revision humana en contextos criticos.
- Evaluacion muy limitada: solo 100 muestras de test. La afirmacion de 0 % de alucinaciones de citas se basa en ese conjunto reducido y no permite generalizar.
- Sin puntuacion ni capitalizacion de serie: la salida se emite en minusculas y sin signos de puntuacion, lo que obliga a un postprocesado si se necesita texto legible.
- Sin marcas de tiempo ni diarizacion: no se documenta salida de timestamps ni identificacion de hablantes, lo que limita su uso directo en subtitulado sincronizado.
- Riesgo de alucinacion en audio degradado: aunque el autor reporta 0 % de alucinaciones de citas, no hay evaluacion con audio ruidoso, con acentos no cubiertos o con silencios largos, escenarios donde los modelos ASR pequenos suelen generar texto inventado.
- Sensibilidad a la ortografia: la evaluacion cualitativa muestra confusiones recurrentes en fronteras rapidas de palabra (`samanasarku` por `ruwan saman ƙasarku`, `zamaura dagaari` por `zama ƙura da gari`) y variantes dialectales (`koyarwasa` frente a `koyarwarsa`).
- Sin datos sobre sesgos: no se ha publicado ningun analisis de sesgo por genero, edad, region o dialecto del hausa.
- Licencia permisiva pero con incertidumbre en la cadena: el repositorio declara apache-2.0, mientras que los tags de HuggingFace mezclan `moonshine-ai/moonshine-tiny` y `UsefulSensors/moonshine-tiny` como modelo base. Conviene verificar la licencia del checkpoint base antes de un uso comercial.
- Validacion comunitaria nula: 0 descargas y 0 valoraciones en el momento de la consulta, por lo que no hay evidencia independiente que reproduzca los resultados declarados.
- Metadatos anomalos: la fecha de creacion registrada en HuggingFace (2026-10-03) es posterior a la fecha habitual de publicacion, lo que sugiere un error de metadatos del repositorio.
- Model card incompleta: la seccion de limitaciones del autor aparece truncada en la informacion disponible, de modo que no se pueden citar sus advertencias completas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/samuelolubukun/moonshine-tiny-hausa-openbible
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/multilingual-tts/open-bible

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre Moonshine en hausa; los enlaces obtenidos no guardaban relacion con el tema y se han descartado. No se dispone por tanto de papers, blogs o demos adicionales que enlazar.
