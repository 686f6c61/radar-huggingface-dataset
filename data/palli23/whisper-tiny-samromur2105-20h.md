# palli23/whisper-tiny-samromur2105-20h

## Resumen

whisper-tiny-samromur2105-20h es un ajuste fino de Whisper Tiny (39 millones de parametros) sobre un subconjunto anidado de 20 horas de audio extraido del pool de escalado samromur-21.05, un corpus de habla en islandes. Lo publica el usuario palli23 en Hugging Face y forma parte del conjunto de checkpoints de escalado del trabajo "Scaling Smaller ASR Models Against Multilingual ASR Giants", aceptado en ICASSP 2026. El problema que aborda es acotado pero relevante: comprobar hasta que punto un modelo ASR muy pequeno puede competir en un idioma concreto cuando se le dedica un ajuste fino especifico, frente a modelos multilingues de gran tamano.

El modelo es un sistema de reconocimiento automatico de voz (ASR), no un modelo de lenguaje generativo: recibe audio y devuelve la transcripcion en islandes. Su arquitectura es la de Whisper Tiny original, un transformer encoder-decoder con normalizacion sobre espectrogramas mel de 80 canales y ventanas de 30 segundos, sin modificaciones estructurales anunciadas por el autor. El interes practico esta en su huella de memoria y computo: 39 millones de parametros permiten inferencia en CPU y en cualquier GPU de consumo, lo que lo hace util para transcripcion embebida o para experimentos de escalado de datos.

La relevancia actual del checkpoint es doble. Por un lado, sirve como punto de referencia reproducible dentro de un estudio de escalado de datos (de ahi el sufijo "20h", que indica el volumen de horas de entrenamiento). Por otro lado, es un ejemplo de ajuste fino de un modelo de 39M en un idioma de bajos recursos como el islandes, donde los corpus disponibles (Samromur) son mucho mas pequenos que en ingles o castellano. Conviene senalar que la model card es extremadamente breve y no incluye resultados numericos de WER o CER, que el autor remite al paper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Tiny), con preprocesado de espectrograma mel de 80 canales |
| Parametros totales | 39 millones (segun la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos por inferencia y hasta 448 tokens de salida objetivo, heredado de la arquitectura Whisper Tiny; no se especifica de forma explicita en la model card |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | islandes (is) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | no disponible (no se detalla en la model card) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper Tiny: un transformer encoder-decoder con atencion completa, entrenado originalmente por OpenAI para transcripcion y traduccion de voz multilingue. El encoder procesa espectrogramas mel de 80 canales calculados sobre ventanas de 30 segundos (3000 fotogramas, submuestreados a 1500 por las capas convolucionales de entrada), y el decoder autoregresivo genera hasta 448 tokens objetivo con los tokens especiales de idioma y tarea. En este caso concreto no se documenta ninguna modificacion de la arquitectura base.

En cuanto a los datos, el autor indica que el ajuste fino se realizo sobre un subconjunto anidado de 20 horas del pool de escalado samromur-21.05, es decir, un corpus de habla islandesa preparado para estudiar el efecto del volumen de datos ("nested subset" implica subconjuntos encajados de distinto tamano, disenados para trazar curvas de escalado). No se detalla en la model card la composicion exacta del dataset, el numero de tokens o muestras procesadas, ni si se aplicaron tecnicas de aumento de datos, RLHF o DPO; en un modelo ASR discriminativo como este, ese tipo de alineamiento no seria de aplicacion. Tampoco se especifican hiperparametros de entrenamiento, tasa de aprendizaje, numero de epochs ni estrategia de congelacion de capas.

## Capacidades

- Transcripcion de voz a texto en islandes: es la funcion principal y unica documentada por el autor.
- Reconocimiento de habla sobre ventanas de hasta 30 segundos de audio por pasada, con la posibilidad de trocear audios mas largos.
- Aprovechamiento del token de idioma forzado a "is" y de la tarea de transcripcion (no de traduccion), que es el modo esperado tras el ajuste fino.
- Manejo de audio con ruido moderado y distintas condiciones de grabacion, en la medida en que el corpus Samromur lo permita; el autor no publica evaluacion de robustez.
- Capacidad residual de Whisper para segmentacion temporal y marcas de tiempo, ya que se conserva la cabeza de decodificacion de la arquitectura base.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje con decodificacion de texto libre).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no; el modelo esta especializado en islandes y no se documenta retencion de otros idiomas.
- Modo thinking, vision o audio-vision: no disponible.

## Casos de uso

- Transcripcion de reuniones en islandes: el modelo puede integrarse en un servicio que trocee el audio en segmentos de 30 segundos y concatene las salidas, con un coste de computo minimo gracias a sus 39M de parametros.
- Archivado y subtitulado de contenido audiovisual islandes: util para generar subtitulos automaticos de videos largos, aceptando una calidad inferior a la de modelos grandes pero con un coste por hora de audio muy bajo.
- Prototipado rapido de productos de voz en islandes: sirve como linea base funcional antes de invertir en un modelo mayor, ya que se puede ejecutar en el portatil de un desarrollador sin GPU.
- Investigacion sobre escalado de datos ASR: el checkpoint forma parte de un conjunto de subconjuntos anidados (20h y otros volumenes), por lo que permite reproducir curvas de WER frente a horas de entrenamiento en un idioma de bajos recursos.
- Evaluacion comparativa de modelos pequenos frente a gigantes multilingues: es un punto de medida directo contra Whisper Large o MMS en la misma tarea islandesa, lo que ayuda a decidir si compensa un modelo grande por idioma.
- Procesamiento por lotes de corpus de voz con fines linguisticos: transcripcion masiva de grabaciones para construir indices de busqueda o analisis lexicos, ejecutable en CPU en paralelo sobre varios nucleos.
- Subtitulado en tiempo casi real en dispositivos de bajos recursos: su tamano permite despliegue en Raspberry Pi o moviles mediante whisper.cpp o CTranslate2, con la latencia como principal limitacion a medir por el integrador.
- Filtrado previo en pipelines de voz: usar el modelo como primera etapa barata para descartar audio sin habla o marcar segmentos que requieran un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica unicamente que los resultados de WER y CER se encuentran en el paper "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026), sin incluir cifras. No se dispone por tanto de datos de WER, CER, ni de comparaciones numericas con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 160 MB en fp32 y 80 MB en fp16 solo para los pesos; el pico de memoria durante la inferencia depende del framework y del tamano de lote, pero en la practica se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU moderna; no requiere A100 ni H100. Una RTX 4090, una RTX 3060 o incluso una GPU integrada son suficientes.
- Cabe en GPU de consumo: si, en todas las gamas, y tambien en CPU sin dificultad. El cuello de botella es el ancho de banda y el preprocesado de audio, no la memoria.
- Opciones de despliegue: pipeline de transformers (WhisperForConditionalGeneration), faster-whisper sobre CTranslate2, whisper.cpp / GGML, exportacion a ONNX. TGI no es adecuado para esta arquitectura orientada a audio; vLLM incluye soporte para Whisper, aunque no es la via mas comun para este tamano de modelo.
- Latencia y throughput estimados: no disponible; el autor no publica medidas. Cualquier cifra concreta debe medirse en el entorno objetivo, ya que depende del backend, de la longitud del audio y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| palli23/whisper-tiny-samromur2105-20h | 39M | Islandes | 30 s de audio por ventana (heredado de Whisper) | cc-by-sa-4.0 | Hugging Face |
| openai/whisper-tiny (modelo base) | 39M | Multilingue (99 idiomas) | 30 s de audio por ventana | MIT (segun la model card del modelo base) | Hugging Face |
| openai/whisper-small | 244M | Multilingue (99 idiomas) | 30 s de audio por ventana | MIT (segun la model card del modelo base) | Hugging Face |
| facebook/mms-1b-all | aproximadamente 1B | Mas de 1100 idiomas, incluido el islandes | Ventana de audio variable segun configuracion | CC-BY-NC-4.0 (uso no comercial) | Hugging Face |

El rendimiento comparado en islandes no esta disponible en la informacion proporcionada: no se han publicado cifras de WER o CER para este checkpoint ni para los alternativas en el material consultado. La comparacion debe limitarse, por tanto, a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre el corpus Samromur, es probable que herede los sesgos de representacion de ese corpus (variedad de acentos, edades, genero y condiciones de grabacion). El autor no publica analisis de sesgo.
- Alucinacion: los modelos Whisper son conocidos por generar texto plausible cuando el audio es silencioso, ruidoso o esta en un idioma distinto del entrenado; en un ajuste fino monoingue esto puede producir transcripciones inventadas en islandes. No hay evaluacion del autor sobre este comportamiento.
- Limitacion de idioma: esta especializado en islandes. Forzarlo a transcribir otros idiomas no esta soportado y probablemente degrade gravemente la salida.
- Restriccion de licencia: cc-by-sa-4.0 permite uso comercial, pero obliga a atribucion y a compartir las obras derivadas bajo la misma licencia (copyleft). Esto puede ser incompatible con productos propietarios que no quieran liberar derivados; conviene revisarlo antes de integrarlo en un producto cerrado.
- Model card incompleta: no se documentan cuantizaciones, formato de pesos, hiperparametros, composicion del dataset ni cifras de evaluacion, lo que dificulta la reproducibilidad.
- Fecha de creacion posterior a la de muchos entornos de despliegue: la ficha indica creacion el 2026-08-29, lo que debe tenerse en cuenta al fijar versiones de dependencias en produccion.
- Sin garantias de calidad: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y no hay validacion externa publicada mas alla de la referencia al paper.
- Sin soporte de function calling ni de razonamiento: no debe utilizarse como componente de un agente conversacional; solo produce transcripciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/palli23/whisper-tiny-samromur2105-20h
- Paper de referencia citado en la model card: "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026). No se proporciona enlace directo en la informacion disponible; debe buscarse por titulo en las actas de ICASSP 2026.
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de referencia de Whisper: https://github.com/openai/whisper
- Corpus Samromur (islandes): no se proporciona enlace en la informacion disponible. La busqueda web realizada no devolvio resultados relevantes: los enlaces recuperados corresponden a textos de literatura clasica china (Liu Zi Xin Lun) y no guardan relacion con el modelo, por lo que se descartan.
