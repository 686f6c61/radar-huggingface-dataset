# olabrini/tarteel-warsh-asr-onnx

## Resumen

tarteel-warsh-asr-onnx es una conversion al formato ONNX con cuantizacion a enteros de 8 bits del modelo tarteel-ai/whisper-base-ar-quran, publicada por el usuario olabrini. El objetivo es ejecutar reconocimiento automatico del habla (ASR) en el navegador mediante transformers.js, sin necesidad de servidor, aprovechando la ventana de audio y la arquitectura encoder-decoder de la familia Whisper en su variante base. El modelo hereda del original la especializacion en arabe coranico y se emplea en un prototipo de correccion de recitacion en la lectura Warsh.

El modelo resuelve un caso de uso muy concreto: transcribir recitacion coranica en la variante de lectura Warsh y comparar la salida con el texto esperado para detectar errores del recitador. Al estar empaquetado en ONNX INT8, el peso total del repositorio es de aproximadamente 0,1 GB, lo que permite su descarga y ejecucion en el lado del cliente. El autor reporta que, sobre un conjunto de 84 versiculos de prueba, 81 transcripciones coinciden exactamente con las del modelo original (un 96,4 % de acuerdo), lo que situa la perdida por cuantizacion en torno al 3,6 % de los casos.

Se trata de un artefacto de nicho, no de un modelo de proposito general. Su relevancia actual reside en demostrar que un ASR especializado en arabe coranico puede desplegarse integramente en el navegador. La ficha se apoya unicamente en los metadatos de HuggingFace y en la model card del autor, que esta redactada en frances.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base); dato derivado del modelo base, no confirmado en la informacion proporcionada |
| Parametros totales | Aproximadamente 74 M (cifra estandar de Whisper base; no confirmada en la informacion proporcionada) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | Ventana de audio de 30 s (estandar de Whisper base; no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | ONNX INT8 (archivos `*_quantized.onnx` en 8 bits) |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (cuantizado a 8 bits) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper en su variante base: un transformer encoder-decoder disenado para transcripcion de audio, con una ventana de entrada de 30 segundos y entrenamiento multitarea (transcripcion y traduccion) sobre audio emparejado. El modelo original, tarteel-ai/whisper-base-ar-quran, es un ajuste fino de Whisper orientado al arabe coranico. La informacion disponible no detalla el volumen de tokens, la composicion exacta del dataset de ajuste ni si se emplearon tecnicas de RLHF o DPO en el modelo base.

La aportacion de esta ficha es exclusivamente de conversion y compresion: el autor toma los pesos del modelo base (licencia Apache 2.0) y los exporta a ONNX con cuantizacion a enteros de 8 bits, de modo que puedan ejecutarse con transformers.js en el navegador. No se anade entrenamiento nuevo ni destilacion; se trata de un proceso de serializacion y cuantizacion post-entrenamiento. El autor indica que el resultado se utiliza en un prototipo de correccion de recitacion en lectura Warsh.

## Capacidades

- Reconocimiento automatico del habla (ASR) de recitacion coranica en arabe, orientado a la lectura Warsh.
- Transcripcion de audio con la ventana de contexto propia de Whisper base.
- Ejecucion en el navegador del cliente mediante transformers.js, sin backend.
- Inferencia en formato ONNX cuantizado a INT8, con menor huella de memoria que el modelo original.
- Comparacion de la transcripcion obtenida frente al texto de referencia para tareas de correccion de recitacion.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio generativo ni modo de pensamiento.

## Casos de uso

- Correccion de recitacion coranica en lectura Warsh: el modelo transcribe el audio del recitador y la aplicacion compara el resultado con el versiculo esperado para senalar discrepancias, tal como hace el prototipo al que alude la model card.
- Aplicaciones web de aprendizaje del Coran sin servidor: al estar en ONNX INT8 y ejecutarse con transformers.js, permite practicar la recitacion en el navegador sin enviar audio a un servidor, lo que reduce costes y mejora la privacidad.
- Verificacion de memorizacion (hifz): un estudiante puede recitar un pasaje y el modelo comprueba si la transcripcion coincide con el texto memorizado, dentro de los 84 versiculos de validacion reportados.
- Indexacion y busqueda de recitaciones: transcribir grabaciones para generar metadatos y permitir busquedas por versiculo o fragmento.
- Herramientas educativas offline: integracion en aplicaciones de escritorio o PWA que funcionan sin conexion una vez descargado el modelo (aproximadamente 0,1 GB).
- Prototipado rapido de interfaces de audio: por su tamano reducido, sirve como banco de pruebas para validar una interfaz de transcripcion antes de migrar a un modelo mayor.
- Filtrado de errores por cuantizacion: permite medir en produccion cuantas transcripciones se desvian del modelo original INT8 frente a los pesos completos.

## Benchmarks y rendimiento

Los unicos datos cuantitativos disponibles provienen de la model card del autor.

| Prueba | Metrica | Resultado |
|---|---|---|
| Conjunto de 84 versiculos de test (lectura Warsh) | Coincidencia exacta de transcripcion con el modelo original | 81 de 84 (96,4 %) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni WER global) en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: aproximadamente 0,1 GB, por lo que el modelo cabe holgadamente en memoria de cualquier dispositivo moderno.
- Inferencia prevista en CPU y en navegador mediante transformers.js, sin requerir GPU.
- Al derivar de Whisper base (del orden de 74 M de parametros) en INT8, la VRAM necesaria es minima; no se proporcionan cifras exactas.
- No requiere GPU dedicada; es apto para portatiles, equipos de escritorio y dispositivos moviles con recursos modestos.
- Opciones de despliegue: transformers.js en navegador o Node.js. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato y tarea.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Las cifras de parametros y ventana de los modelos de referencia son valores estandar y publicos de la familia Whisper; se incluyen a titulo orientativo y no proceden de la informacion proporcionada.

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| olabrini/tarteel-warsh-asr-onnx | Aprox. 74 M | 30 s | ar | Apache 2.0 | ONNX INT8 |
| tarteel-ai/whisper-base-ar-quran | Aprox. 74 M | 30 s | ar | Apache 2.0 | safetensors / PyTorch |
| openai/whisper-base | Aprox. 74 M | 30 s | Multilingue | Apache 2.0 | safetensors / PyTorch |
| openai/whisper-small | Aprox. 244 M | 30 s | Multilingue | Apache 2.0 | safetensors / PyTorch |

Frente al modelo original, la ventaja de esta version es el formato ONNX INT8 para ejecucion en navegador y su menor tamano; la contrapartida es la perdida de coincidencia en 3 de 84 casos de prueba. Frente a whisper-base de OpenAI, esta especializado en arabe coranico (lectura Warsh) en lugar de ASR multilingue generico.

## Limitaciones y advertencias

- Modelo de nicho: disenado para recitacion coranica en lectura Warsh, no para ASR general en arabe.
- Idioma unico: solo soporta arabe (ar); no se documenta ningun otro idioma.
- La cuantizacion INT8 introduce divergencias: 3 de cada 84 transcripciones difieren del modelo original, por lo que la salida no es identica a la de los pesos sin cuantizar.
- Sesgos esperables: el ajuste fino sobre un corpus coranico puede degradar la transcripcion de arabe dialectal o de arabe estandar moderno.
- Riesgo de alucinacion inherente a la familia Whisper: repeticiones en bucle, omisiones o texto inventado con audio ambiguo o ruidoso.
- Sin validacion comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- Metadatos anom alos: la fecha de creacion indicada (2026-10-14) es posterior a la fecha habitual de publicacion, lo que conviene verificar antes de citarla.
- La model card esta redactada en frances, no en arabe ni en ingles.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe respetar tambien la licencia del modelo base (tarteel-ai/whisper-base-ar-quran, tambien Apache 2.0).
- Al ejecutarse en el navegador con transformers.js, conviene medir el rendimiento real en cada dispositivo, ya que no se ofrecen cifras de latencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/olabrini/tarteel-warsh-asr-onnx
- Modelo base: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
