# coreai-community/Audio8-TTS-Preview-0.6b-CoreAI

## Resumen

Audio8-TTS-Preview-0.6b-CoreAI es un port a Core AI —el runtime de ML on-device de Apple para iOS 27 y macOS 27, sucesor de Core ML— del modelo de sintesis de voz Audio8-TTS-Preview-0.6b de Edge0. El modelo original es un sistema de text-to-speech (TTS) con arquitectura DualAR, diseno de Fish Audio S2 Pro, que combina un autoregresivo lento tipo Qwen2.5 (24 capas, 896 de ancho) que predice un token semantico cada 46 ms, un autoregresivo rapido de 4 capas que predice los otros nueve libros de codigos del frame, y un codec estilo DAC a 44,1 kHz que reconstruye el audio. El modelo base suma 601M parametros mas un codec de 337M.

La aportacion de este port es que ejecuta el modelo completo, incluido el muestreador, dentro del grafo de Core AI: se exporta a un bundle `.aimodel` que corre en la GPU o en el Neural Engine de Apple Silicon. Frente al primer export (que ejecutaba una llamada del AR lento mas nueve del AR rapido con el muestreo en el host, con un coste de milisegundos por llamada), la version publicada agrupa el paso lento, el muestreo semantico y las diez filas del AR rapido en una unica llamada por frame, con el muestreador (top-k 50, top-p 0,9, temperatura 0,7, Gumbel-max y RAS) escrito sin ordenacion.

El modelo es relevante porque habilita TTS multilingue de 11 idiomas y clonacion de voz zero-shot directamente en iPhone y Mac, sin nube. El repositorio ocupa 1,6 GB y la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR (autoregresivo lento tipo Qwen2.5 + autoregresivo rapido de 4 capas) con codec estilo DAC a 44,1 kHz |
| Parametros totales | 601M (modelo AR) + 337M (codec) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | Prefill en ventanas de 32 frames; cache KV de 2048 posiciones; generacion acotada a 512 frames (~23,5 s de audio a 21,5 frames/s) |
| Tipos de cuantizacion | AR lento en int8 (weight-only, per-block-32, simetrico con clipping); embeddings, cabeza de 4097 filas, normas y AR rapido en fp16. En el ecosistema existen tambien builds ONNX INT4 para CPU, GGUF y MLX (bf16, 8-bit y 4-bit) |
| Idiomas soportados | 11: cantonés (yue), chino (zh), neerlandés (nl), inglés (en), francés (fr), alemán (de), italiano (it), japonés (ja), coreano (ko), polaco (pl) y español (es) |
| Licencia | Apache-2.0 |
| Formato de pesos | Bundle `.aimodel` de Core AI; en el ecosistema tambien GGUF, ONNX INT4 y MLX |

## Arquitectura y entrenamiento

El sistema sigue el diseno DualAR de Fish Audio S2 Pro. El autoregresivo lento tiene forma de Qwen2.5 con 24 capas y ancho 896, y predice un token semantico por frame de 46 ms (2048 muestras a 44,1 kHz, unas 21,5 frames/s). El autoregresivo rapido, de 4 capas, predice de forma secuencial los nueve libros de codigos restantes del mismo frame. Un codec estilo DAC a 44,1 kHz convierte los diez libros de codigos en audio. La cabeza del AR lento es la propia tabla de embeddings reducida a sus 4097 filas (ids semanticos mas eos), en lugar de las 155.776 originales, lo que reduce el peso de 279 MB a 7 MB sin perdida funcional, ya que el muestreador del publicador pone a -inf todos los demas logits antes del muestreo.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. La innovacion tecnica del port es la integracion del muestreador dentro del grafo: la funcion `frame` ejecuta en una sola llamada el paso lento, el muestreo semantico (top-k 50, top-p 0,9, temperatura 0,7, Gumbel-max, RAS, implementado con `topk(50)`, `logsumexp` y suma acumulada) y las diez filas del AR rapido con nueve extracciones de libros de codigos. Los sorteos uniformes entran como entradas, de modo que una traza grabada reproduce exactamente la eleccion del oraculo. El codec y el encoder son causales, trabajan en ventanas de 160 frames y conservan los ultimos 32.

## Capacidades

- Sintesis de voz multilingue en 11 idiomas: cantonés, chino, neerlandés, inglés, francés, alemán, italiano, japonés, coreano, polaco y español.
- Clonacion de voz zero-shot a partir de una grabacion de referencia y su transcripcion (la descripcion del publicador indica 0,5-30 s; el contrato del encoder limita la entrada a 442.368 muestras, es decir, unos 10 s).
- Registro de voz mediante `encoder.aimodel`, que convierte audio mono a 44,1 kHz en codigos reutilizables: los codigos mas la transcripcion constituyen la voz.
- Salida de audio a 44,1 kHz (el codec produce `wav [1, 327680]` por cada ventana de 160 frames).
- Inferencia on-device en Apple Silicon, ejecutable en GPU o Neural Engine a traves del runtime Core AI.
- Muestreador deterministico y reproducible dentro del grafo, con sorteos uniformes como entradas.
- Prompt con soporte de hablante (`<|speaker:0|>`) y de transcripcion de referencia.

No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni vision o audio de entrada mas alla de la referencia de voz para clonacion.

## Casos de uso

- Aplicaciones de lectura en voz alta en iOS y macOS: el modelo corre integramente en el dispositivo, por lo que un lector de pantalla o un cliente de correo puede sintetizar texto a 44,1 kHz sin enviar datos a la nube.
- Clonacion de voz personal en apps de accesibilidad: un usuario graba de 0,5 a 10 s de su voz, el encoder genera los codigos y el modelo reproduce su timbre en castellano, cantonés o cualquiera de los 11 idiomas soportados.
- Asistentes conversacionales locales: al ejecutarse en el Neural Engine sin dependencia de red, encaja en asistentes de voz con latencia baja y privacidad total.
- Generacion de audiolibros y podcast: la ventana de generacion de hasta 512 frames (~23,5 s por turno) permite sintetizar parrafos completos en una sola pasada.
- Doblaje de contenido a varios idiomas: al cubrir 11 idiomas con un mismo modelo, se puede reutilizar la misma voz clonada para versiones en espanol, frances, aleman o japones.
- Interfaces de voz en videojuegos y kioscos: la inferencia on-device evita costes de API y funciona sin conectividad.
- Prototipado de voces para produccion de audio: la clonacion zero-shot permite validar timbres antes de contratar un locutor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo esta pensado para ejecucion on-device en Apple Silicon (iPhone y Mac) mediante el runtime Core AI, en GPU o Neural Engine, sin necesidad de VRAM dedicada de escritorio.
- Huella en disco: el repositorio ocupa 1,6 GB.
- Precision: AR lento en int8 (weight-only) y resto en fp16; la cabeza reducida a 4097 filas pesa 7 MB en lugar de 279 MB.
- Inferencia: la ruta de la primera exportacion (una llamada de AR lento mas nueve de AR rapido con muestreo en host) consumia unos 48 ms de tiempo de motor por frame de 46 ms en un M4 Max; la version publicada reduce esa sobrecarga al ejecutar todo el frame en una unica llamada. No se especifica la latencia del port de Core AI.
- Opciones de despliegue alternativas en el ecosistema: builds MLX (bf16, 8-bit, 4-bit), build ONNX INT4 para CPU y GGUF.
- No se indica soporte de vLLM, TGI o llama.cpp para este port concreto; el runtime objetivo es Core AI.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Runtime objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| coreai-community/Audio8-TTS-Preview-0.6b-CoreAI (este) | 601M + 337M codec | `.aimodel` | Core AI (Apple on-device) | Apache-2.0 | HuggingFace |
| Edge0/Audio8-TTS-Preview-0.6b (base) | 601M + 337M codec | ONNX | ONNX Runtime (CPU) | Apache-2.0 | HuggingFace |
| mlx-community/Audio8-TTS-Preview-0.6b-bf16 | 601M + 337M codec | MLX (bf16, 8-bit, 4-bit) | MLX (Apple Silicon) | Apache-2.0 | HuggingFace |

Como alternativas del mismo publicador y del mismo modelo base, la comparacion se limita al formato y al runtime: este port es el primero que lleva Audio8-TTS a Core AI con el muestreador dentro del grafo. Los resultados de rendimiento comparados entre estos builds no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Se trata de un modelo en fase preview (el identificador incluye "Preview"): la calidad y la estabilidad pueden no ser definitivas.
- No se documentan sesgos concretos, pero un modelo TTS entrenado con datos de voz puede reproducir sesgos de acento, genero o procedencia presentes en sus datos.
- Riesgo de alucinacion en el sentido de pronunciacion incorrecta, prosodia inestable o artefactos en el audio generado, especialmente fuera de los idiomas con mas datos.
- La clonacion de voz zero-shot plantea riesgos de suplantacion; conviene aplicar controles de consentimiento y marcas de agua en produccion.
- La longitud de generacion esta acotada a 512 frames (~23,5 s) por turno segun el contrato del grafo.
- La clonacion depende de la transcripcion de la referencia, por lo que errores en esa transcripcion degradan el resultado.
- Existe una discrepancia entre la descripcion (referencia de 0,5-30 s) y el contrato del encoder (entrada limitada a ~10 s); conviene validar el caso de uso real.
- La licencia Apache-2.0 permite uso comercial, pero el uso de voces clonadas puede estar sujeto a normativa adicional (por ejemplo, derechos de imagen y voz).
- Aunque existe port de Core ML del modelo ASR hermano, no habia port de Core AI ni Core ML de este TTS antes de esta publicacion.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/coreai-community/Audio8-TTS-Preview-0.6b-CoreAI
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Preview-0.6b
- Port enlazado en la model card: https://huggingface.co/mlboydaisuke/Audio8-TTS-Preview-0.6b-CoreAI/tree/72e1c935961c786bb838e235c7839a2bd77468cc
- Build MLX: https://huggingface.co/mlx-community/Audio8-TTS-Preview-0.6b-bf16
- Benchmark de referencia de Apple Silicon: https://github.com/john-rocky/apple-silicon-llm-bench
- Nota tecnica del port: `knowledge/audio8-tts-port.md` (referenciada en la model card; la URL completa no esta disponible en la informacion proporcionada)
