# diarizeapp/granite-speech-5.0-470m-turboctc-onnx-qnn

## Resumen

Granite Speech 5.0 470M TurboCTC - Snapdragon X Elite precompiled QNN es una build precompilada del modelo de reconocimiento automático del habla ibm-granite/granite-speech-5.0-470m-turboctc, publicada por el usuario diarizeapp. La diferencia respecto al modelo original no está en los pesos ni en la arquitectura, sino en la forma de empaquetado: se distribuye como binario de contexto EPContext de ONNX Runtime listo para ejecutarse sobre la NPU Hexagon (HTP v73, SoC model 60) de los procesadores Qualcomm Snapdragon X Elite. El objetivo es evitar la compilación en el dispositivo y ofrecer inferencia acelerada por NPU con una latencia medida de 35,0 ms por ventana de audio de 4,0 segundos.

El modelo base es un sistema ASR de 470 millones de parámetros con arquitectura Conformer y decodificación CTC (los tags declaran `conformer` y `ctc`). La entrada es un tensor `input_features` de forma `[1, 200, 320]`, correspondiente a 200 tramas a 50 Hz (4,0 segundos de audio), y la salida es `logits` de forma `[1, 50, 16384]`, es decir, 50 tramas de salida con un vocabulario de 16.384 tokens. La decodificación es CTC greedy con `blank id` igual a 0 y el tokenizador se entrega en `tokenizer.json`.

Su relevancia es de nicho pero clara: los portátiles con Snapdragon X Elite tienen NPU Hexagon poco aprovechada por las pilas de inferencia habituales, y esta build demuestra que un modelo ASR de casi 500 millones de parámetros puede ejecutarse en la NPU con una fidelidad numérica muy alta frente a CPU (similitud coseno de 0,9999199339321682). La licencia Apache 2.0 del modelo base se mantiene, y el repositorio ocupa 1,0 GB. El modelo solo soporta inglés y no se han publicado resultados de WER ni de benchmarks estándar de ASR en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con cabeza CTC (segun tags del repositorio); detalle de capas no disponible |
| Parametros totales | 470 millones (segun denominacion del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo ASR); ventana de entrada de 4,0 s (tensor `[1, 200, 320]` a 50 Hz) |
| Tipos de cuantizacion | no disponible; se distribuye como binario de contexto EPContext de QNN para Hexagon NPU. Existe una version ONNX portable en el repositorio enlazado |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX: `model_qnn_ctx.onnx` (wrapper) mas ficheros `*_qnn.bin` (binario de contexto QNN), que deben mantenerse juntos porque la ruta es relativa |
| Tamano del repositorio | 1,0 GB |
| Entrada | `input_features` `[1, 200, 320]` (ventana de 4,0 s a 50 Hz) |
| Salida | `logits` `[1, 50, 16384]` (50 tramas, vocabulario de 16.384) |
| Decodificacion | CTC greedy, blank id 0; tokenizador en `tokenizer.json` |
| Toolchain de compilacion | QAIRT 2.50.40.260831140417, onnxruntime 1.30.0, onnxruntime-qnn 2.6.0 |
| Hardware objetivo | NPU Hexagon HTP v73, SoC model 60 (Qualcomm Snapdragon X Elite) |
| Modelo base | ibm-granite/granite-speech-5.0-470m-turboctc |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura Conformer, es decir, un encoder que combina bloques de atencion y convoluciones, con una cabeza de clasificacion CTC en lugar de un decoder autorregresivo. Los tags del repositorio (`conformer`, `ctc`, `granite_speech5_ctc`) confirman esta aproximacion, y la forma de la salida `[1, 50, 16384]` es coherente con una cabeza CTC que emite una distribucion sobre 16.384 tokens por cada una de las 50 tramas de salida. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni sobre el esquema exacto del encoder.

Tampoco se ha publicado en la informacion disponible el detalle del entrenamiento: numero de tokens de audio, composicion del dataset, uso de RLHF/DPO (poco habitual en ASR con CTC) ni estrategias de aumento de datos. El unico dato tecnico de entrenamiento indirecto es el propio nombre "TurboCTC", que sugiere una variante optimizada para decodificacion CTC rapida, pero su significado exacto no se documenta en la ficha.

La innovacion de esta publicacion concreta no esta en el modelo, sino en el pipeline de despliegue: se ha compilado el grafo a un binario de contexto EPContext ejecutable sobre la NPU Hexagon con QAIRT 2.50.40.260831140417, y se ha verificado la fidelidad frente a CPU con una similitud coseno de 0,9999199339321682. La build esta atada a esa version de QAIRT y a la arquitectura HTP v73; para otros dispositivos o SDKs hay que recompilar con `granite_pipeline.py`, segun indica la model card.

## Capacidades

- Reconocimiento automatico del habla en ingles con salida de logits CTC `[1, 50, 16384]` por ventana de 4,0 segundos.
- Decodificacion CTC greedy con blank id 0, sin decoder autorregresivo ni modelo de lenguaje externo.
- Procesamiento en ventanas deslizantes de 4,0 s, con `input_features` de 200 tramas a 50 Hz.
- Ejecucion en NPU Hexagon (HTP v73) mediante el plugin EP `onnxruntime-qnn`, con fallback a CPU desactivado (`session.disable_cpu_ep_fallback=1`).
- Inferencia de bajisima latencia: 35,0 ms medidos por ventana de 4,0 s.
- No se documentan capacidades de vision, audio generativo, tool calling, function calling, agentes ni razonamiento multi-paso; son capacidades no aplicables a un modelo ASR con cabeza CTC.
- Capacidades multilingues: no. Solo ingles.
- No se documenta soporte de diarizacion de hablantes pese al nombre del autor del repositorio.

## Casos de uso

- Dictado en tiempo real en portatiles Snapdragon X Elite: con 35,0 ms por ventana de 4,0 s, el modelo permite transcripcion continua con ventanas solapadas sin acumular retardo perceptible para el usuario.
- Subtitulado local de reuniones y videollamadas: la ventana de 4,0 s encaja con la cadencia tipica de los sistemas de subtitulado en directo, y la ejecucion en NPU libera CPU y GPU para el resto de la aplicacion.
- Transcripcion de notas de voz en aplicaciones de escritorio: al ser un modelo de 470 millones de parametros y 1,0 GB de repositorio, puede empaquetarse dentro de una aplicacion nativa sin depender de servicios en la nube.
- Procesamiento por lotes de archivos de audio en estaciones de trabajo Windows on Arm: la NPU permite mantener el procesamiento desatendido con bajo consumo energetico, relevante en equipos portatiles.
- Componente de pipelines ASR con postproceso propio: la salida en logits CTC permite aplicar decodificacion con beam search o integracion con un modelo de lenguaje externo si se desea mejorar la precision.
- Investigacion en aceleracion por NPU: sirve como referencia reproducible para medir la fidelidad numerica entre NPU Hexagon y CPU en modelos Conformer, con una similitud coseno reportada de 0,9999199339321682.
- Aplicaciones de accesibilidad con reconocimiento de voz local: la licencia Apache 2.0 y la ausencia de llamadas a servicios externos facilitan su integracion en productos de asistencia por voz para personas con movilidad reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar de ASR (WER sobre LibriSpeech, Common Voice u otros) en la informacion disponible. El unico dato de rendimiento medido por el autor es el siguiente:

| Metrica | Valor |
|---|---|
| Latencia por ventana | 35,0 ms por ventana de 4,0 s |
| Factor de tiempo real (derivado) | aproximadamente 0,00875, es decir, unas 114 veces mas rapido que el tiempo real |
| Similitud coseno frente a CPU | 0,9999199339321682 |
| WER (LibriSpeech, Common Voice, etc.) | no disponible |
| MMLU / HumanEval / GSM8K | no aplica (modelo ASR) |

## Requisitos de hardware

- Hardware objetivo unico: NPU Hexagon HTP v73 con SoC model 60, presente en los procesadores Qualcomm Snapdragon X Elite. El binario de contexto esta atado a esa arquitectura.
- No cabe ni se ejecuta en GPUs convencionales (A100, H100, RTX 4090) tal cual: el binario `*_qnn.bin` es especifico de QNN. Para esos entornos habria que usar el modelo base o la version ONNX portable.
- Requisitos de memoria: el repositorio ocupa 1,0 GB; el modelo base tiene 470 millones de parametros, por lo que en CPU con precision de 16 bits necesitaria del orden de 1 GB de RAM (calculo derivado, no confirmado por el autor).
- Runtime necesario: onnxruntime 1.30.0 con el plugin `onnxruntime-qnn` 2.6.0, y QAIRT 2.50.40.260831140417 para la build publicada.
- Configuracion obligatoria: registrar el plugin EP, seleccionar el dispositivo NPU `OrtEpDevice` y fijar `session.disable_cpu_ep_fallback=1`. No se deben pasar `soc_model` ni `htp_arch` en tiempo de ejecucion.
- Throughput y latencia: 35,0 ms por ventana de 4,0 s medidos; no se han publicado mediciones de energia ni de latencia con ventanas solapadas.
- Opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI): no aplicables a un modelo ASR CTC. Para CPU o GPU hay que recurrir al modelo base o a la build ONNX portable.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Idiomas | Licencia | Formato | Hardware objetivo |
|---|---|---|---|---|---|---|
| diarizeapp/granite-speech-5.0-470m-turboctc-onnx-qnn | 470 M | Conformer + CTC | en | apache-2.0 | ONNX EPContext QNN | NPU Hexagon HTP v73 (Snapdragon X Elite) |
| ibm-granite/granite-speech-5.0-470m-turboctc | 470 M | Conformer + CTC | en | apache-2.0 | no disponible | CPU / GPU genericos |
| diarizeapp/granite-speech-5.0-470m-turboctc-onnx | 470 M | Conformer + CTC | en | apache-2.0 | ONNX portable | CPU / GPU genericos |

No se dispone de datos de rendimiento comparativo entre estas tres variantes mas alla de la similitud coseno y la latencia reportadas para la build QNN. La comparacion con alternativas ASR de otros fabricantes (por ejemplo, modelos de la familia Whisper) no se incluye porque no hay datos de benchmarks en la informacion proporcionada.

## Limitaciones y advertencias

- El binario de contexto esta atado a una version concreta de QAIRT (2.50.40.260831140417) y a la arquitectura HTP v73 con SoC model 60. No funcionara en otras NPUs ni con otras versiones del SDK sin recompilar.
- El wrapper `model_qnn_ctx.onnx` y los ficheros `*_qnn.bin` deben mantenerse juntos y con la misma ruta relativa; si se separan, la carga falla.
- Solo soporta ingles. No hay capacidades multilingues documentadas.
- No se ha publicado el WER ni ningun benchmark de calidad de transcripcion, por lo que no es posible evaluar la precision real frente a alternativas.
- El modelo base es un CTC puro sin modelo de lenguaje: es probable que la puntuacion, las mayusculas y la correccion de nombres propios sean inferiores a las de sistemas ASR con decoder autorregresivo (observacion general sobre CTC, no verificada en este modelo).
- Riesgo de alucinacion acustica: en segmentos con ruido, silencio o audio no ingles, un CTC puede emitir secuencias de tokens sin sentido; no se documentan mecanismos de deteccion de voz o filtrado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y esta publicado por un tercero, no por IBM. No ha pasado por una validacion independiente conocida.
- La licencia Apache 2.0 del modelo base permite uso comercial, pero conviene verificar que la licencia se mantiene para esta redistribucion derivada.
- La fecha de creacion que figura en el repositorio es el 2 de octubre de 2026; conviene comprobar la vigencia de la build antes de usarla en produccion.
- El autor del repositorio se llama `diarizeapp`, pero no se documenta ninguna capacidad de diarizacion en la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/diarizeapp/granite-speech-5.0-470m-turboctc-onnx-qnn
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Pesos ONNX portables: https://huggingface.co/diarizeapp/granite-speech-5.0-470m-turboctc-onnx
- Script de recompilacion mencionado: `granite_pipeline.py` (incluido en el repositorio; no se proporciona URL directa)
