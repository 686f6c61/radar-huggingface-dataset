# loom-ai-org/qwen3-tts-12hz-0.6b-loom

## Resumen

`qwen3-tts-12hz-0.6b-loom` es la exportación a GGUF del talker de síntesis de voz Qwen3-TTS 12Hz 0.6B Base, publicada por loom-ai-org para su runtime loom.cpp. Se trata de un modelo de texto a códigos neuronales (text-to-codes), no de un modelo de texto a audio: recibe un texto y un clip de voz de referencia y devuelve 16 flujos de tokens de códec, que un tokenizador independiente convierte después en forma de onda. Por sí solo no genera audio.

El checkpoint procede de `Qwen/Qwen3-TTS-12Hz-0.6B-Base` y conserva los pesos sin modificar; lo que cambia es el empaquetado, que en un único archivo GGUF autocontenido incluye las topologías de grafo, el tokenizador y el script de control (driver). El recuento real de parámetros declarado en safetensors es de 983.964.937 (unos 984 M, notablemente por encima del «0.6B» del nombre comercial) y el repositorio ocupa 3,9 GB.

Su interés actual es de infraestructura: desacopla el talker del códec, lo que permite cachear, editar o decodificar los tokens por separado, y facilita el despliegue dentro del ecosistema loom-py / loom.cpp bajo licencia Apache 2.0. La clonación de voz funciona por x-vector (1024 floats) extraído de un clip de referencia, ya que el checkpoint no incluye tabla de hablantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (talker) con predictor de codigos; numero de capas, atencion y configuracion interna no disponibles |
| Parametros totales | 983.964.937 (~984 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; nivel de cuantizacion concreto no disponible (el tamano del repo, 3,9 GB, es coherente con pesos de ~32 bits por parametro) |
| Idiomas soportados | zh, en, ja, ko, de, fr, ru, pt, es, it |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF autodescriptivo (incluye topologias de grafo, tokenizer y driver script) |
| Modelo base | Qwen/Qwen3-TTS-12Hz-0.6B-Base |
| Biblioteca de ejecucion | loom-py-rt (loom-py sobre loom.cpp) |
| Tasa de fotogramas | 12,5 fotogramas de audio por segundo (80 ms por fotograma) |
| Codebooks por fotograma | 16 (el code predictor genera 15 a partir del estado oculto del talker) |
| Modalidad de salida | Tokens de codigo (no audio) |

## Arquitectura y entrenamiento

La informacion disponible describe un «talker» exportado: un transformer autoregresivo que recibe texto y una representacion de voz de referencia, y emite tokens de codigo dispuestos por fotogramas (frame-major, una fila por fotograma, 16 codebooks de ancho). Uno de los 16 codebooks lo produce directamente el talker; los otros 15 los genera un componente adicional llamado *code predictor* a partir del estado oculto del talker. Esto implica que cada fotograma de audio cuesta 16 pasadas del transformer, es decir, 200 pasadas del decoder por segundo de audio a 12,5 fotogramas por segundo.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Tampoco se detallan mecanismos como decodificacion especulativa o atencion lineal. Lo unico documentado sobre el proceso de decoding es que este export declara la configuracion propia del checkpoint: `temperature 0.9`, `top_k 50` y `repetition_penalty 1.05`, con un segundo conjunto de parametros para el code predictor. La decodificacion con `temperature=0` (greedy) reproduce `transformers` de forma exacta, verificado con 672 codigos sobre 42 fotogramas.

## Capacidades

- Sintesis de voz a partir de texto con clonacion por referencia: acepta un clip de audio (`waveform=`) y el codificador de hablante extrae un x-vector de 1024 floats.
- Reutilizacion de voz precalculada: se puede pasar `x_vector=` directamente, ya que el vector es todo lo que aporta la identidad vocal.
- Generacion multilingue en diez idiomas (chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano), seleccionables mediante `language_id`; si se omite, se asume ingles.
- Emision de tokens de codigo en lugar de audio, lo que permite cachearlos, editarlos o decodificarlos con otro componente.
- Decodificacion reproducible mediante `seed=`, y decodificacion greedy determinista con `temperature=0`.
- Control de la longitud de generacion en fotogramas de audio mediante `max_new_tokens` (a 12,5 fotogramas por segundo).
- Separacion de responsabilidades: el talker y el codec se empaquetan en repositorios distintos, de modo que un mismo codec sirve para todas las tallas y variantes del talker.
- Tool calling, function calling, razonamiento multi-paso, agentes, vision y audio: no disponibles / no aplica (modelo de sintesis de voz).

## Casos de uso

- Audiolibros y narracion con voz propia: partiendo de un clip de referencia de pocos segundos, el modelo genera los tokens de la locucion completa, que se decodifican al codec para obtener el WAV final; la voz se mantiene coherente en todo el capitulo porque el x-vector es fijo.
- Doblaje y localizacion multilingue: un mismo texto puede sintetizarse en los diez idiomas soportados cambiando `language_id` (por ejemplo, 2054 para espanol, 2050 para ingles), conservando el timbre del hablante original.
- Sistemas de atencion al cliente con voz de marca: se clona la voz corporativa una vez, se guarda el vector de 1024 floats y se reutiliza en cada sintesis en produccion sin volver a procesar el clip.
- Accesibilidad y lectura asistida: conversion de articulos, notificaciones o correos a voz en aplicaciones de lectores de pantalla, con la ventaja de que el pipeline completo cabe en un modelo de menos de 1.000 M de parametros.
- Generacion de corpus sinteticos para ASR: al poder producir las mismas frases con distintas voces de referencia y distintos idiomas, resulta util para ampliar datasets de reconocimiento de voz, sobre todo porque los tokens de codigo se pueden inspeccionar y filtrar antes de decodificar.
- Edicion y postproduccion de audio: como la salida son tokens y no audio, un editor puede modificar, recortar o empalmar secuencias de codigos antes de pasarlas al codec, algo imposible si el modelo devolviera directamente la onda.
- Prototipado y pruebas de regresion en local: al ser un GGUF que declara el ancho de fotograma, un par talker-codec incompatible falla de forma explicita en lugar de producir audio con la duracion equivocada, lo que simplifica el control de calidad en pipelines.
- Pipelines de evaluacion de TTS: la verificacion documentada de que `temperature=0` reproduce `transformers` de forma exacta permite usar este export como referencia reproducible en pruebas automatizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento documentado es una verificacion de equivalencia numerica: con `temperature=0` (greedy) el export reproduce `transformers` de forma exacta —672 codigos sobre 42 fotogramas, todos identicos— y el audio resultante, al transcribirlo, devuelve la frase de entrada. La model card esta truncada en la frase «Generation is slower than the...», por lo que no se dispone de cifras de latencia o throughput del autor.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 984 M de parametros; no son cifras oficiales): ~3,9 GB en fp32, ~2 GB en fp16, ~1 GB en int8 y ~0,5 GB en int4. A estas cifras hay que sumar el espacio de estados intermedios del decoder y del code predictor.
- Repositorio en disco: 3,9 GB solo para este checkpoint, mas el tamano del codec emparejado.
- Cabe en GPU de consumo: por tamano, si; una RTX 3060 de 12 GB o superior absorbe el modelo sin dificultad en cualquiera de las precisiones habituales. No hay confirmacion oficial de este extremo.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cualquier GPU con al menos 4-6 GB de VRAM libre es suficiente, pero el fabricante no publica una lista.
- Opciones de despliegue: el runtime previsto es loom-py (`pip install -U "loom-py-rt[hub]"`) sobre el motor loom.cpp; el modelo se carga con `loom.Model.from_pretrained`. vLLM, llama.cpp, Ollama o TGI no estan soportados de forma oficial segun la documentacion disponible.
- Latencia y throughput: no disponibles. Como referencia de carga computacional, cada fotograma exige 16 pasadas del transformer, de modo que generar un segundo de audio implica 200 pasadas del decoder a 12,5 fotogramas por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Salida | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| qwen3-tts-12hz-0.6b-loom | 984 M | Tokens de codigo (16 codebooks) | Apache 2.0 | GGUF, via loom.cpp / loom-py |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base | 0,6B (nominal) | Tokens de codigo; el codec va incluido en el mismo checkpoint | Apache 2.0 | Pesos originales, ecosistema transformers |
| qwen3-tts-tokenizer-12hz-loom | no disponible | Audio (forma de onda) | Apache 2.0 | GGUF, via loom.cpp / loom-py |

La comparacion con sistemas TTS de otros fabricantes (XTTS, Bark, Parler-TTS u otros) no esta disponible en la informacion proporcionada; no se han podido consultar sus parametros ni sus resultados en condiciones equivalentes.

## Limitaciones y advertencias

- Este modelo no produce audio. Emite dieciseis flujos de tokens de codec; sin el tokenizador `qwen3-tts-tokenizer-12hz-loom` la salida no es utilizable.
- La voz procede obligatoriamente de un clip de referencia: el campo `spk_id` del checkpoint esta vacio y no existe tabla de hablantes, por lo que la clonacion es el unico modo disponible.
- El modo de clonacion de mayor fidelidad del modelo original (condicionado por la transcripcion del clip de referencia ademas de sus tokens) no esta implementado en este export, porque requiere la mitad ENCODE del codec, que esta coleccion no exporta.
- `language_id` es un numero entero crudo, no una etiqueta: ingles 2050, aleman 2053, espanol 2054, chino 2055, japones 2058, frances 2061, coreano 2064, ruso 2069, italiano 2070 y portugues 2071. Si se omite, se asume ingles.
- El modelo muestrea por defecto, de modo que dos ejecuciones de la misma frase dan dos tomas distintas. Solo `seed=` garantiza reproducibilidad.
- La penalizacion por repeticion no es opcional: `transformers` la aplica como procesador y no como warper, por lo que afecta incluso al argmax greedy. Sin ella el modelo nunca emite su token de fin y agota `max_new_tokens`. Pasar `repetition_penalty=1.0` la desactiva y provoca exactamente ese comportamiento.
- `max_new_tokens` cuenta fotogramas de audio (12,5 por segundo), no pasos del decoder: un fotograma equivale a dieciseis pasadas del transformer. Confundir las unidades lleva a longitudes de generacion equivocadas.
- El repositorio esta recien publicado (creado el 17 de septiembre de 2026) y no registra descargas ni valoraciones; su adopcion y mantenimiento a largo plazo no estan contrastados.
- La model card esta truncada en el apartado de rendimiento, por lo que no hay datos publicados de velocidad, latencia ni calidad subjetiva.
- Riesgo de alucinacion fonetica, sesgos de hablante o limitaciones de contexto: no disponibles en la informacion proporcionada.
- Restricciones de licencia: ninguna conocida. Apache 2.0, heredada del modelo base, permite uso comercial, pero conviene verificar las condiciones del codec emparejado antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/loom-ai-org/qwen3-tts-12hz-0.6b-loom
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Codec emparejado: https://huggingface.co/loom-ai-org/qwen3-tts-tokenizer-12hz-loom
- loom.cpp (motor): https://github.com/loom-ai-org/loom.cpp
- loom-exporter (herramienta de exportacion): https://github.com/loom-ai-org/loom-exporter
- loom-py (API de Python): https://github.com/loom-ai-org/loom-py

Nota: la busqueda web realizada no devolvio resultados relevantes para este modelo; todos los enlaces devueltos corresponden a la aplicacion de grabacion de pantalla Loom y a una marca de ropa homonima, sin relacion con loom-ai-org.
