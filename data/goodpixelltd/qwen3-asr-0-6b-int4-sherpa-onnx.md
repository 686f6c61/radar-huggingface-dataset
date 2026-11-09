# goodpixelltd/qwen3-asr-0.6b-int4-sherpa-onnx

## Resumen

Qwen3-ASR 0.6B INT4 para sherpa-onnx es una distribucion cuantizada del modelo de reconocimiento automatico del habla Qwen3-ASR-0.6B, publicado originalmente por el equipo Qwen de Alibaba. Esta version, mantenida por el usuario goodpixelltd, convierte los pesos de precision completa a enteros de 4 bits (block size 32, simetrico) y los empaqueta en formato ONNX con datos externos, de modo que el modelo pueda ejecutarse en el runtime sherpa-onnx tanto en servidores como en dispositivos moviles.

El problema que resuelve es el coste de memoria y almacenamiento de un ASR de calidad en produccion: el paquete ocupa 602 MB en disco frente a los 937 MB de la version de 8 bits, y reduce el pico de memoria en un iPhone 14 Pro de 2,3-2,6 GB a 1,6-1,7 GB para 60 segundos de audio. La degradacion de precision es marginal: la tasa de error de caracteres (CER) sobre 500 clips de conversacion de YouTube pasa de 22,9% a 23,1% en Hong Kong, de 8,9% a 9,0% en Taiwan y de 4,4% a 4,5% en China continental.

El modelo cubre tres idiomas (mandarin, cantonés y ingles) y esta pensado para despliegues de transcripcion en tiempo real o por lotes donde el presupuesto de VRAM o RAM es ajustado. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | encoder-decoder tipo transformer para ASR (arquitectura exacta del modelo base no detallada en la informacion disponible) |
| Parametros totales | 0,6 mil millones (segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; en la practica, audio de hasta ~35 s sin ajustes, ampliable con `max_total_len` (60 s de audio ~780 tokens; 1536 tokens funciona) |
| Tipos de cuantizacion | INT4 simetrico, block size 32 (`MatMulNBits` para pesos MatMul, `GatherBlockQuantized` para embeddings) |
| Idiomas soportados | zh (mandarin), yue (cantonés), en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX con datos externos (`.onnx` + `.weights`); requiere onnxruntime >= 1.20 (sherpa-onnx 2.0.1 incluye 1.28.2) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen/Qwen3-ASR-0.6B ni sus datos de entrenamiento (numero de tokens, composicion del corpus, uso de RLHF o DPO). Lo que si se describe es el proceso de cuantizacion y empaquetado: se parte de la exportacion ONNX de precision completa publicada en ModelScope (modelo `zengshuishui/Qwen3-ASR-onnx`, script en el repositorio de Wasser1462) y se convierten los pesos a INT4 simetrico con block size 32. Los pesos de las operaciones MatMul usan el operador `MatMulNBits` y el embedding de tokens usa `GatherBlockQuantized`, ambos introducidos en onnxruntime 1.20.

La innovacion tecnica principal de esta distribucion es el uso de datos externos de ONNX: los tensores cuantizados se almacenan en ficheros `.weights` separados que deben permanecer junto a su `.onnx` correspondiente. onnxruntime los mapea desde disco en lugar de copiarlos a memoria, lo que reduce el consumo tras la carga de 0,77 GB a 0,54 GB en un iPhone 14 Pro. El paquete incluye `conv_frontend.onnx` (sin cambios respecto al original), `encoder.int4.onnx` + `encoder.int4.weights`, `decoder.int4.onnx` + `decoder.int4.weights` y el directorio `tokenizer/`.

## Capacidades

- Reconocimiento automatico del habla (transcripcion audio a texto) en mandarin, cantonés e ingles.
- Procesamiento de audio conversacional real, no solo lectura de locucion: los benchmarks se hicieron sobre clips de conversacion de YouTube.
- Manejo de audio largo mediante troceado en fragmentos de 20 s o menos, o mediante elevacion de `max_total_len` (60 s de audio equivalen a unos 780 tokens; 1536 tokens es un valor funcional).
- Ejecucion en dispositivos moviles y entornos con memoria limitada gracias al formato ONNX external data.
- Integracion con el runtime sherpa-onnx, que permite despliegue en C++, Python, Android, iOS y otras plataformas soportadas por dicho runtime.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio generation ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion de reuniones y conversaciones multilingues: el modelo cubre mandarin, cantonés e ingles, por lo que resulta adecuado para equipos con presencia en Hong Kong, Taiwan y China continental, con CER medido de 4,5-23,1% segun la variante.
- Subtitulado de contenido de YouTube y plataformas de video: el benchmark del autor se realizo precisamente sobre 500 clips de conversacion de YouTube, lo que indica un ajuste razonable a ese dominio.
- Aplicaciones moviles de dictado o notas de voz: con 602 MB en disco y un pico de 1,6-1,7 GB en un iPhone 14 Pro para 60 s de audio, cabe en telefonos de gama alta sin servidor.
- Asistentes de voz embebidos en dispositivos edge: la integracion con sherpa-onnx permite ejecutar la inferencia localmente en dispositivos con recursos limitados, sin depender de la nube.
- Transcripcion por lotes en servidores con GPU modestas: al ser un modelo de 0,6B en INT4, el coste de VRAM es bajo y permite procesar colas de audio en paralelo con multiples instancias.
- Analisis de llamadas de atencion al cliente: la transcripcion de conversaciones telefonicas o de soporte permite alimentar pipelines de analitica, siempre que el audio se trocee en fragmentos de 20 s para controlar el consumo de memoria.
- Archivado y busqueda de contenido audiovisual: transcripcion de archivos historicos para indexacion y busqueda textual, con la ventaja de que el modelo es ligero y se puede desplegar en infraestructura propia.

## Benchmarks y rendimiento

El autor publica la tasa de error de caracteres (CER) sobre 500 clips de conversacion de YouTube, comparando la version INT4 con la version de 8 bits:

| Region | CER INT4 | CER 8 bits |
|---|---|---|
| Hong Kong | 23,1% | 22,9% |
| Taiwan | 9,0% | 8,9% |
| China continental | 4,5% | 4,4% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que se trata de un modelo ASR y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM/RAM estimada: 602 MB en disco; memoria tras la carga de 0,54 GB en iPhone 14 Pro; pico de 1,6-1,7 GB procesando 60 s de audio en fragmentos de 20 s.
- GPU recomendadas: no se especifican en la informacion disponible; al ser un modelo de 0,6B en INT4, cualquier GPU consumer con al menos 2-3 GB de memoria libre deberia ser suficiente.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con 4 GB o mas de VRAM, aunque no se documentan pruebas concretas.
- Cabe en movil: si, validado en iPhone 14 Pro con sherpa-onnx.
- Opciones de despliegue: sherpa-onnx (runtime principal, version 2.0.1 o superior con onnxruntime 1.28.2); onnxruntime >= 1.20 de forma directa. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Tamano en disco | Licencia |
|---|---|---|---|---|---|
| goodpixelltd/qwen3-asr-0.6b-int4-sherpa-onnx | 0,6B | zh, yue, en | ONNX INT4 | 602 MB | Apache 2.0 |
| Qwen3-ASR 0.6B (8 bits, sherpa-onnx) | 0,6B | zh, yue, en | ONNX INT8 | 937 MB | Apache 2.0 |
| Qwen/Qwen3-ASR-0.6B (precision completa) | 0,6B | zh, yue, en | safetensors/ONNX | no disponible | Apache 2.0 |

La comparativa se limita a las variantes del mismo modelo base, ya que la informacion disponible no incluye datos de otros modelos ASR comparables (Whisper, Parakeet, etc.). El modelo INT4 ofrece una reduccion de tamano del 36% respecto a la version de 8 bits con una degradacion de CER de solo 0,1-0,2 puntos porcentuales.

## Limitaciones y advertencias

- La informacion disponible no documenta sesgos conocidos del modelo base; al ser un ASR, los sesgos se manifestarian en el reconocimiento de acentos, dialectos y variedades no representadas en el entrenamiento.
- Riesgo de alucinacion: no documentado en la informacion disponible, pero es un fenomeno comun en modelos ASR basados en transformer, especialmente con audio ruidoso o silencios largos.
- Limitacion de contexto: para audio superior a unos 35 s es necesario elevar `max_total_len` o trocear el audio en fragmentos de 20 s o menos; no hacerlo puede provocar errores o truncamientos.
- Cobertura de idiomas limitada a mandarin, cantonés e ingles; no se garantiza un rendimiento aceptable en otras lenguas.
- El CER en Hong Kong (23,1%) es notablemente superior al de China continental (4,5%), lo que sugiere un peor rendimiento con determinados acentos o variedades del cantonés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique si se han realizado cambios.
- Caveat de produccion: los ficheros `.weights` deben mantenerse junto a sus `.onnx` correspondientes; si se separan, el modelo no cargara. Ademas, se requiere onnxruntime >= 1.20, por lo que entornos con versiones anteriores no son compatibles.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad sobre esta distribucion concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goodpixelltd/qwen3-asr-0.6b-int4-sherpa-onnx
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Exportacion ONNX de precision completa (ModelScope): https://modelscope.cn/models/zengshuishui/Qwen3-ASR-onnx
- Script de exportacion ONNX: https://github.com/Wasser1462/Qwen3-ASR-onnx
