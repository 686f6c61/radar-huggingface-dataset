# devendradhakad/autodroid-Audio8-Audio8-TTS-Preview-0.6B-ONNX-INT4

## Resumen

Audio8 TTS Preview 0.6B ONNX INT4 es una versión cuantizada y empaquetada para inferencia en CPU del modelo de síntesis de voz (text-to-speech) multilingüe Audio8 TTS Preview 0.6B, orientado a clonación de voz zero-shot. El modelo base lo desarrolla Audio8 (Audio8-AI) y esta ficha corresponde a la conversión publicada por el usuario devendradhakad en HuggingFace, que incluye los pesos en formato ONNX con cuantización INT4.

El modelo se apoya en una arquitectura DualAR inspirada en Fish Audio S2 Pro: un transformer autorregresivo "lento" (Slow AR) que predice un token semántico por frame de audio y un transformer autorregresivo "rápido" (Fast AR) que predice los codebooks del codec condicionado por el estado oculto del Slow AR. El modelo principal tiene 601.159.424 parámetros (sin contar el codec) y una ventana de contexto de hasta 2.048 posiciones empaquetadas de texto y audio.

Su relevancia actual radica en que permite ejecutar TTS multilingüe con clonación de voz y streaming en CPU, sin CUDA ni dependencias de PyTorch o Transformers en tiempo de inferencia, con un consumo de memoria en torno a 1 GiB tras la carga. Está pensado para despliegues locales y en el borde con requisitos de privacidad, aunque se trata de una versión preview con cobertura de idiomas deliberadamente limitada a 11 lenguas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer DualAR (autorregresivo dual: Slow AR + Fast AR), inspirado en Fish Audio S2 Pro, con codec neural de audio |
| Parametros totales | 601.159.424 (modelo principal, excluyendo el codec) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | hasta 2.048 posiciones empaquetadas de texto/audio |
| Tipos de cuantizacion | pesos de Slow AR y Fast AR en INT4 (weight-only); activaciones, estados ocultos y cache KV en FP16; codec encoder/decoder en FP16; salida de onda en FP32 |
| Idiomas soportados | 11: cantonés (yue), chino (zh), neerlandés (nl), inglés (en), francés (fr), alemán (de), italiano (it), japonés (ja), coreano (ko), polaco (pl) y español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (slow_ar_int4.onnx, fast_ar_int4.onnx, codec_decoder_fp16.onnx y codec_encoder_fp16.onnx) más tokenizer.json; runtime onnxruntime |
| Codec de audio | 44,1 kHz, 2.048 muestras por frame (~21,5 frames/s); 10 codebooks de 4.096 entradas cada uno |
| Frecuencia de muestreo de salida | 44,1 kHz mono, FP32 |
| Tamano del repositorio | ~0,6 GB (repo en HuggingFace); ~572 MiB de archivos online; ~968 MiB el repositorio completo con el encoder de registro de voz |
| Ejecucion | ONNX Runtime, CPUExecutionProvider |

## Arquitectura y entrenamiento

La arquitectura es un transformer DualAR. El Slow AR (24 capas, anchura 896, 14 cabezas de atención y 2 cabezas KV) predice un token semántico por frame de audio; el Fast AR (4 capas, anchura 896, 14 cabezas de atención y 2 cabezas KV) predice los codebooks del frame condicionado por el estado oculto del Slow AR y por los codebooks precedentes. El códec neural opera a 44,1 kHz con 2.048 muestras por frame (unos 21,5 frames por segundo) y 10 codebooks de 4.096 entradas. El contexto admite hasta 2.048 posiciones empaquetadas de texto y audio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. La innovación destacable de este repositorio es de despliegue: cuantización weight-only INT4 de los pesos de los dos módulos autorregresivos, códec y encoder en FP16, y empaquetado para inferencia exclusivamente en CPU mediante ONNX Runtime, sin PyTorch, Transformers ni Hugging Face Hub como dependencias tras la descarga. La model card indica además que la arquitectura está inspirada en Fish Audio S2 Pro.

## Capacidades

- Síntesis de voz multilingüe en 11 idiomas (cantonés, chino, neerlandés, inglés, francés, alemán, italiano, japonés, coreano, polaco y español).
- Clonación de voz zero-shot a partir de una grabación de referencia de 0,5 a 30 segundos junto con su transcripción exacta y un nombre de perfil.
- Perfiles de voz reutilizables almacenados localmente; el encoder de registro se carga solo durante la operación de registro de voz.
- Streaming de audio PCM y salida de onda a 44,1 kHz mono.
- Servicio local con CLI, interfaz web, API HTTP y endpoint compatible con OpenAI.
- Ejecución en CPU sin CUDA, con un consumo de memoria en torno a 1 GiB tras la carga.
- No es un modelo de propósito general: no genera texto, no razona, no escribe código ni procesa visión. Su única tarea es text-to-speech.

## Casos de uso

- Clonación de voz para creación de contenido: un creador puede registrar su propia voz con una grabación de 0,5 a 30 segundos y su transcripción, y generar narraciones completas con un perfil local reutilizable, sin enviar audio a servicios en la nube.
- Audiolibros y podcasts: el modelo permite producir audio de larga duración a 44,1 kHz con una voz consistente; el streaming PCM y la ventana de 2.048 posiciones facilitan la síntesis por tramos encadenados.
- Asistentes de voz locales y privados: al ejecutarse enteramente en CPU y con el endpoint compatible con OpenAI, se puede integrar como backend de voz en un asistente doméstico o de escritorio sin exponer datos a terceros.
- Sistemas de atención telefónica o IVR multilingües: la cobertura de 11 idiomas permite generar mensajes y respuestas habladas en el idioma del usuario desde una única instancia; el servicio HTTP local encaja con un despliegue en el borde o en una máquina de oficina.
- Accesibilidad: conversión de texto a voz para lectores de pantalla, avisos y contenido divulgativo en equipos sin GPU, con un consumo de memoria inferior a 1,2 GiB en pico de síntesis.
- Voces de personajes en videojuegos y aplicaciones interactivas: el registro de perfiles de voz permitidos y la API local permiten generar diálogos dinámicos en tiempo de ejecución sin depender de conectividad.
- Despliegue en hardware de gama baja: al no requerir CUDA y necesitar alrededor de 2 GB de RAM libre, es viable en portátiles, mini-PC y dispositivos de borde, según lo probado en un Apple M2 de 16 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el modelo como "SOTA-class" en TTS multilingüe a escala compacta, pero no aporta cifras de MMLU, WER, MOS ni de ninguna otra métrica objetiva, por lo que no se incluyen números.

## Requisitos de hardware

- Inferencia en CPU mediante ONNX Runtime CPUExecutionProvider; no requiere GPU ni CUDA.
- Memoria medida en un Apple M2 de 16 GB con cinco hilos de ONNX Runtime: ~1.004 MiB tras la carga y ~1,1-1,2 GiB en pico de síntesis; el registro de voz alcanza ~1,55 GiB de pico (se liberan las sesiones online antes de cargar el encoder del códec).
- Tamaño de los archivos online: ~572 MiB; repositorio completo con el encoder de registro: ~968 MiB.
- Cabe en equipos de consumo con aproximadamente 2 GB de RAM libre; el entorno probado es macOS arm64. No se especifican GPU recomendadas porque el proveedor de ejecución es CPU.
- Opciones de despliegue: ONNX Runtime con CLI, interfaz web, API HTTP, streaming PCM y endpoint compatible con OpenAI, mediante los scripts incluidos en el repositorio de GitHub (setup.sh, start_server.sh).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible elaborar una comparativa cuantitativa fiable. Como referencias cualitativas, la model card cita Fish Audio S2 Pro como inspiración arquitectónica y el propio modelo base Audio8/Audio8-TTS-Preview-0.6b, del que esta conversión deriva, pero no se incluyen sus parámetros, contexto, rendimiento ni licencia.

## Limitaciones y advertencias

- Es una versión preview: la cobertura de idiomas está limitada intencionadamente a las 11 lenguas listadas y el soporte de dialectos chinos y una cobertura multilingüe mayor quedan para versiones futuras.
- Solo hace text-to-speech; no es un modelo de lenguaje general ni admite tool calling, agentes, razonamiento multi-paso ni tareas de código o matemáticas.
- La clonación de voz exige una grabación de referencia de 0,5 a 30 segundos junto con su transcripción exacta; una transcripción incorrecta degrada la calidad del perfil.
- La clonación de voz plantea riesgos de suplantación y deepfakes; es responsabilidad del usuario disponer del consentimiento de la persona cuya voz se clona y cumplir la normativa aplicable.
- La cuantización weight-only INT4 de los módulos autorregresivos puede reducir la calidad de audio respecto a los pesos en FP16/FP32 del modelo base, aunque no se aportan métricas comparativas.
- El entorno validado es macOS arm64 sobre Apple M2; el comportamiento en otras plataformas y con otros asignadores de memoria puede variar.
- Repositorio de terceros: la conversión la publica el usuario devendradhakad (0 descargas y 0 likes en el momento de la consulta). Las etiquetas indican como base Edge0/Audio8-TTS-Preview-0.6b, mientras que la model card y los metadatos de HuggingFace apuntan a Audio8/Audio8-TTS-Preview-0.6b; conviene verificar la procedencia antes de usarlo en producción.
- Este repositorio contiene únicamente los archivos del modelo: el código de inferencia, el servicio de streaming y el registro de voz están en el repositorio de GitHub del proyecto.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo base conviene comprobar también los términos y condiciones del modelo original.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/devendradhakad/autodroid-Audio8-Audio8-TTS-Preview-0.6B-ONNX-INT4
- Modelo base Audio8 TTS Preview 0.6B: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.6b
- Repositorio oficial ONNX INT4 citado en la model card: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.6B-ONNX-INT4
- Repositorio de código en GitHub: https://github.com/Audio8-AI/Audio8_TTS
- Código de despliegue en ONNX Runtime: https://github.com/Audio8-AI/Audio8_TTS/tree/master/onnx_runtime
- Demo en vivo: https://audio8-ai.github.io/Audio8_TTS/
- Licencia Apache 2.0 del proyecto: https://github.com/Audio8-AI/Audio8_TTS/blob/master/LICENSE
- ONNX Runtime: https://onnxruntime.ai/
- Fish Audio S2 Pro (arquitectura de referencia): https://github.com/fishaudio/fish-speech
