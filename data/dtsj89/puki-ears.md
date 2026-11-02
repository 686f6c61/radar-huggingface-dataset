# dtsj89/puki-ears

## Resumen

Puki's ears (kol-stream para moviles) es una conversion a ONNX con cuantizacion int8 del modelo de reconocimiento automatico del habla MaorB/embeddinggemma-2-asr-hebrew-english-streaming, desarrollado originalmente por MaorB sobre el codificador de audio de EmbeddingGemma 2 de Google y entrenado con datos de ivrit.ai. La version que nos ocupa la publica dtsj89 con el objetivo concreto de ejecutarla en Android dentro de Puki, un juego infantil que escucha al nino a traves del telefono. El modelo resuelve el problema de llevar ASR bilingue hebreo-ingles a dispositivos moviles de gama baja sin depender de la nube.

Tecnicamente se trata de un modelo de tipo transducer (RNN-T) con dos grafos ONNX separados: un encoder que transforma fotogramas de audio en bruto (1, M, 320) en representaciones (1, T, 512), y un step que combina filas del encoder con las dos ultimas piezas emitidas para producir puntuaciones sobre un vocabulario de 2.048 piezas sentencepiece. La extraccion de caracteristicas log-mel esta embebida en el grafo del encoder, de modo que la entrada es audio PCM a 16 kHz sin preprocesado externo.

Su relevancia actual radica en la combinacion de tres factores: licencia Apache 2.0, un peso de repositorio de solo 0,4 GB y unas latencias medidas en hardware modesto (un Galaxy Tab A7 Lite con 4 hilos procesa una palabra en unos 0,55 s y una frase de 2 s en 1,4 s). Es, por tanto, una pieza practica para ASR embebido en hebreo e ingles, un par de idiomas con escasa cobertura en modelos ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer (RNN-T) sobre codificador de audio de EmbeddingGemma 2, exportado a dos grafos ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa flujos de audio por fotogramas de 320 muestras) |
| Tipos de cuantizacion | int8 dinamica en las multiplicaciones matriciales |
| Idiomas soportados | he (hebreo), en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder.onnx`, `step.onnx`) mas `tokens.txt` con 2.048 piezas sentencepiece |

## Arquitectura y entrenamiento

El modelo es un transducer de reconocimiento del habla construido sobre el codificador de audio de EmbeddingGemma 2 de Google. La exportacion separa la inferencia en dos grafos: `encoder.onnx` recibe fotogramas de audio en float32 con forma (1, M, 320), aplica internamente la extraccion de caracteristicas log-mel con el mismo corte que el extractor de Gemma (160 ceros de prefijo, ventanas de 320 muestras cada 160, a 16 kHz) y emite representaciones (1, T, 512); `step.onnx` toma filas del encoder (N, 512) junto con las dos ultimas piezas emitidas (1, 2) en int64 y devuelve puntuaciones (N, 2048) sobre el vocabulario, donde la pieza 0 es el token blank. La decodificacion es greedy y su implementacion de referencia esta en `KolEars.kt` del repositorio de Puki.

El entrenamiento original corresponde a MaorB y utiliza datos de ivrit.ai para la parte hebrea, con cobertura tambien de ingles. La model card no detalla el volumen de tokens, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO; esos datos deben consultarse en la ficha del modelo base. La innovacion practica de esta version es la cuantizacion dinamica int8 de todas las multiplicaciones matriciales junto con la optimizacion de los grafos al nivel "extended" de ONNX Runtime, lo que permite cargarlos tal cual. Segun el autor, la salida coincide con el modelo original en los clips de prueba y la version int8 solo difiere en un nombre poco frecuente.

## Capacidades

- Reconocimiento automatico del habla en hebreo e ingles sobre audio PCM a 16 kHz.
- Extraccion de caracteristicas log-mel integrada en el grafo: no requiere preprocesado externo.
- Decodificacion greedy en streaming por fotogramas, adecuada para captura continua de microfono.
- Ejecucion en CPU de moviles y tablets Android mediante ONNX Runtime, sin GPU.
- Modelo bilingue con vocabulario unico de 2.048 piezas sentencepiece.
- No soporta tool calling, function calling ni razonamiento multi-paso: es exclusivamente un modelo ASR.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Juegos infantiles con voz: es el caso original de Puki, donde el modelo escucha al nino a traves del microfono del telefono y reconoce palabras o frases cortas en hebreo o ingles para activar respuestas del juego, gracias a su baja latencia (0,55 s por palabra en una tablet de gama baja).
- Reconocimiento de comandos por voz en aplicaciones Android: integrado con ONNX Runtime, permite dictar ordenes cortas sin conexion y sin enviar audio a servidores externos.
- Subtitulado en directo de conversaciones bilingues hebreo-ingles en entornos con conectividad limitada, usando la decodificacion en streaming sobre fotogramas consecutivos.
- Notas de voz transcritas en el dispositivo: grabacion de mensajes breves y conversion a texto en local, con la ventaja de que el audio no sale del terminal.
- Interfaces de accesibilidad: entrada por voz para usuarios con dificultades motoras en aplicaciones Android, con un consumo de almacenamiento de solo 0,4 GB.
- Kioscos o dispositivos empotrados con Android y CPU modesta que necesiten reconocimiento de palabras clave en hebreo o ingles sin infraestructura cloud.
- Prototipado rapido de pipelines ASR: los dos grafos ONNX y el fichero de tokens permiten montar un decodificador greedy propio en cualquier lenguaje con bindings de ONNX Runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (WER, MMLU, etc.) en la informacion disponible. Los unicos datos de rendimiento proporcionados son mediciones de latencia del autor:

| Medicion | Hardware | Resultado |
|---|---|---|
| Una palabra | Galaxy Tab A7 Lite, 4 hilos | ~0,55 s |
| Frase de 2 s | Galaxy Tab A7 Lite, 4 hilos | ~1,4 s |
| Fidelidad vs. modelo original | Clips de prueba | Coincide; difiere solo en un nombre poco frecuente |

## Requisitos de hardware

- Almacenamiento: repositorio de 0,4 GB; el modelo completo en int8 ocupa ese orden de magnitud.
- VRAM: no aplica, esta pensado para inferencia en CPU; no se han publicado requisitos de memoria RAM, aunque por el tamano del repo cabe holgadamente en moviles con 2 GB o mas.
- GPU: no requiere GPU; funciona en CPU. No se han publicado pruebas en A100, H100 ni RTX 4090.
- Cabe en cualquier dispositivo Android moderno, incluidas tablets de gama baja como la Galaxy Tab A7 Lite usada en las mediciones.
- Despliegue: ONNX Runtime (grafos ya optimizados a nivel "extended"), integrable en apps Android via Kotlin/Java; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: ~0,55 s por palabra y ~1,4 s por frase de 2 s en Galaxy Tab A7 Lite con 4 hilos. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Tamano | Licencia | Despliegue |
|---|---|---|---|---|---|
| Puki's ears (este modelo) | Transducer ONNX int8 | he, en | 0,4 GB (repo) | Apache 2.0 | ONNX Runtime en Android |
| MaorB/embeddinggemma-2-asr-hebrew-english-streaming | Transducer (modelo base) | he, en | no disponible | Apache 2.0 | Framework original (no ONNX) |
| Whisper turbo de ivrit.ai | Transformer encoder-decoder | he (y otros) | no disponible | no disponible | Servidor/GPU tipicamente |

Segun la model card, el modelo base es menos preciso que el Whisper turbo de ivrit.ai para hebreo; la ventaja de Puki's ears frente a ambos es su formato ONNX int8 listo para ejecutarse en un telefono. No se dispone de datos de benchmarks comparativos publicados.

## Limitaciones y advertencias

- No genera puntuacion: la salida carece de signos de puntuacion, lo que limita su uso en transcripcion de documentos.
- Precision inferior a la del Whisper turbo de ivrit.ai en hebreo, segun la propia model card.
- La cuantizacion int8 introduce diferencias menores: el autor reporta un fallo en un nombre poco frecuente respecto al modelo original.
- Solo cubre hebreo e ingles; no hay soporte de otros idiomas.
- Orientado a frases cortas y comandos; no se han publicado resultados en audio largo o dominios acusticos dificiles.
- Los datos de entrenamiento hebreos de ivrit.ai estan bajo CC BY 4.0 con una clausula de proposito de entrenamiento de IA; conviene revisar la ficha del modelo base para obligaciones de atribucion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos subyacentes pueden imponer condiciones adicionales que deben verificarse.
- Riesgo de alucinacion en transcripciones con ruido de fondo o habla solapada, comun en modelos transducer pequenos; no se han publicado tasas de error.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni mantenimiento garantizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dtsj89/puki-ears
- Modelo base: https://huggingface.co/MaorB/embeddinggemma-2-asr-hebrew-english-streaming
- Repositorio de Puki: https://github.com/TomSadeh/puki
- Script de exportacion: https://github.com/TomSadeh/puki/blob/main/train/kolstream_export.py
- Datos de entrenamiento (ivrit.ai): https://www.ivrit.ai
