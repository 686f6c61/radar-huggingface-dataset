# mentisialog/sherpa-onnx-nemotron-asr-streaming-farsi-1120ms-int8

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un paquete de inferencia en formato ONNX del modelo `mehdi-hf/nemotron-asr-streaming-farsi`, un ajuste fino en persa del modelo de NVIDIA `nemotron-3.5-asr-streaming-0.6b`. Se trata por tanto de un sistema de reconocimiento automático del habla (ASR) en streaming, basado en un codificador FastConformer con memoria de caché y un decodificador RNN-T, con aproximadamente 0,6 mil millones de parámetros segun el nombre del modelo base. Lo publica el usuario `mentisialog` y su valor esta en que el modelo original solo se distribuia como checkpoint `.nemo` de NeMo, mientras que este repositorio ofrece los grafos ONNX listos para ejecutarse en CPU con sherpa-onnx.

La conversion fija dos decisiones tecnicas concretas: chunks de 1120 ms y cuantizacion dinamica int8 del codificador, decodificador y joiner. No se ha reentrenado ni modificado ningun peso; es exclusivamente una conversion de formato. El paquete ocupa 0,7 GB en el repositorio y el pico de memoria medido en inferencia es de unos 1,7 GB, lo que lo hace viable en portatiles y dispositivos sin GPU.

Es relevante ahora porque cubre un hueco practico: ASR en streaming para persa con licencia permisiva, latencia de aproximadamente un segundo y despliegue trivial en produccion sobre CPU. El coste es que se evalua unicamente sobre habla leida de FLEURS y que el modelo esta limitado a un solo idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador FastConformer cache-aware (streaming) + decodificador y joiner RNN-T (transducer) |
| Parametros totales | 0,6 B (segun el nombre del modelo base `nemotron-3.5-asr-streaming-0.6b`); desglose exacto no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica como ventana de tokens: modelo de streaming con chunks de 1120 ms |
| Tipos de cuantizacion | Int8 dinamica (encoder, decoder y joiner); no se ofrecen otras variantes en el repo |
| Idiomas soportados | Persa (`fa`); prompt de idioma `fa-IR` (indice 38 en `prompt_dictionary`) |
| Licencia | OpenMDW License Agreement, version 1.1 (`license: other`) |
| Formato de pesos | ONNX int8: `encoder.int8.onnx` (657,6 MB), `decoder.int8.onnx` (7,3 MB), `joiner.int8.onnx` (1,7 MB) + `tokens.txt` (15 KB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base de NVIDIA: un codificador FastConformer con atencion cache-aware, disenado para procesar audio en fragmentos sin recalcular todo el historial, acoplado a un decodificador RNN-T y un joiner que producen la salida token a token con decodificacion greedy. El paquete ONNX separa esos tres componentes en grafos independientes, tal y como espera sherpa-onnx para su `OnlineRecognizer.from_transducer`. El modelo es *language-prompted*: recibe un identificador de idioma (`fa-IR`) que condiciona la decodificacion, y el codificador lee sus propios metadatos de caracteristicas (80 dimensiones Mel, 16 kHz).

No hay informacion en la documentacion proporcionada sobre el volumen de datos de entrenamiento, la composicion del corpus de ajuste fino ni si se aplicaron tecnicas de RLHF o similar; esos detalles se remiten al fichero `NOTICE`, que no se incluye en la informacion disponible. La innovacion tecnica relevante de esta publicacion es de ingenieria de despliegue: exportacion con el exportador Nemotron de sherpa-onnx (Apache-2.0), modificado para cargar un `.nemo` local y escribir `tokens.txt` junto a los grafos, con cuantizacion dinamica int8 que reduce el codificador a 657,6 MB manteniendo el coste computacional en CPU.

## Capacidades

- Transcripcion de voz a texto en persa (`fa-IR`) en modo streaming, con salida incremental.
- Procesamiento en tiempo real por fragmentos: el consumo de audio y la decodificacion se intercalan, sin esperar al final de la locucion.
- Decodificacion greedy con RNN-T, adecuada para baja latencia y sin necesidad de beam search costoso.
- Entrada de audio mono a 16 kHz en float32, con caracteristicas Mel de 80 dimensiones.
- Gestion de multiples flujos simultaneos mediante el objeto `stream` de sherpa-onnx (un stream por fuente de audio).
- Seleccion de idioma en tiempo de ejecucion mediante `stream.set_option("language", "fa-IR")`.
- No soporta: puntuacion automatica mas alla de la que emite el modelo, etiquetado de hablantes, traduccion, ni otras modalidades (vision, texto, tool calling).

## Casos de uso

- **Subtitulado en directo de clases y webinars en persa**: alimentando el stream con bloques de 100 ms se obtienen hipotesis parciales con aproximadamente 1 s de retraso, suficientes para subtitulos rodados en formacion online o eventos.
- **Transcripcion de atencion al cliente en centros de llamadas**: el bajo coste por hora de audio (RTF ~0,05 en 2 hilos) permite procesar el 100 % de las llamadas en CPU en lugar de muestrear, y usar el texto para control de calidad y busqueda.
- **Dictado por voz en aplicaciones de escritorio o moviles**: el paquete ONNX se integra con los bindings de sherpa-onnx (C++, C#, Kotlin, Swift, Python) y cabe en 1,7 GB de memoria, por lo que funciona sin GPU en equipos de usuario final.
- **Accesibilidad para personas sordas**: generacion de subtitulos en vivo en entornos presenciales o videoconferencias, con la salvedad de la latencia de ~1 s y la ausencia de diarizacion.
- **Indexacion y busqueda de archivos de audio en persa**: transcripcion por lotes de podcasts, archivos de radio o grabaciones de reuniones para construir un indice de texto consultable.
- **Procesamiento en el borde (edge) y entornos con recursos limitados**: su perfil de memoria y su ejecucion exclusiva en CPU permiten desplegarlo en mini-PC, Raspberry Pi de gama alta o contenedores sin acelerador.
- **Preprocesado en pipelines de datos**: primer paso de transcripcion en bruto antes de un post-proceso con modelos de puntuacion o normalizacion de numeros, dado que el modelo no restaura puntuacion.

## Benchmarks y rendimiento

Evaluacion indicativa del autor sobre 50 clips de test de FLEURS `fa_ir` (884 s), emitidos en fragmentos de tamano real sobre CPU (Apple M4, 2 hilos), con normalizacion de mayusculas y puntuacion.

| Configuracion | WER | WER (clips sin digitos) |
|---|---|---|
| Tal como se grabo | 15,1 % | 11,7 % |
| Nivel de entrada normalizado | 13,7 % | 9,5 % |

| Metrica de eficiencia | Valor |
|---|---|
| Real-time factor (RTF) | ~0,05 en 2 hilos |
| Pico de memoria | ~1,7 GB |
| Latencia de aparicion de palabra | ~1 s (chunks de 1120 ms) |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. El propio autor advierte que la muestra es pequena y que las cifras deben revalidarse sobre audio propio; parte de la diferencia entre ambas columnas se debe a que los digitos se puntuan contra numeros escritos con letras.

## Requisitos de hardware

- **VRAM**: no requiere GPU; inferencia en CPU. Memoria RAM pico medida de ~1,7 GB, coherente con un repo de 0,7 GB y estados de decodificacion.
- **GPU recomendadas**: no aplica para este paquete (grafos ONNX para CPU). No se han publicado mediciones en GPU.
- **Cabe en GPU de consumo**: si, en cualquier equipo con 2 GB de RAM libre; tambien en portatiles y mini-PC sin acelerador.
- **Rendimiento de referencia**: RTF ~0,05 con 2 hilos en Apple M4, es decir, unas 20 veces mas rapido que el tiempo real; con `num_threads=1` el margen se reduce pero sigue siendo suficiente para streaming en vivo (dato no publicado).
- **Opciones de despliegue**: sherpa-onnx (version minima 1.13.5; probado con 1.13.8) via `OnlineRecognizer.from_transducer`, con bindings en Python, C++, C#, Kotlin, Swift y otros. No aplica vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- **Consideracion operativa**: con versiones anteriores a 1.13.5 el modelo carga pero produce texto de baja calidad; el soporte multilinguie de Nemotron llego en 1.13.3 y el arreglo de decodificacion greedy de NeMo en 1.13.5.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Streaming | Contexto / chunk | Licencia | Datos de WER en persa |
|---|---|---|---|---|---|---|
| Este paquete (`sherpa-onnx-nemotron-asr-streaming-farsi-1120ms-int8`) | 0,6 B | ONNX int8 | Si, chunks de 1120 ms | No aplica | OpenMDW 1.1 | 13,7 % (FLEURS, nivel normalizado) |
| `mehdi-hf/nemotron-asr-streaming-farsi` (upstream) | 0,6 B | Checkpoint NeMo `.nemo` | Si | No aplica | No disponible en la informacion proporcionada | No disponible |
| `nvidia/nemotron-3.5-asr-streaming-0.6b` (base) | 0,6 B | NeMo | Si | No aplica | No disponible en la informacion proporcionada | No disponible (no es especifico de persa) |
| Whisper large-v3 u otros ASR multilingues | No disponible en la informacion proporcionada | No disponible | No por defecto (ventana completa) | No disponible | No disponible en la informacion proporcionada | No comparable: no hay mediciones en la informacion disponible |

La comparacion cuantitativa con alternativas no puede establecerse con los datos suministrados: solo existe una medicion de WER para este paquete. La diferencia practica frente al upstream es el formato (ONNX int8 ejecutable en CPU frente a `.nemo` que requiere NeMo) y frente al base, el ajuste especifico a persa.

## Limitaciones y advertencias

- **Solo persa**: el modelo esta prompted a `fa-IR`; no es un sistema multilingue utilizable en otros idiomas sin un ajuste especifico.
- **Latencia de streaming**: las palabras aparecen aproximadamente 1 s despues de pronunciarse, lo que descarta usos que exijan respuesta sub-segundo.
- **Sin puntuacion ni diarizacion**: no restaura puntuacion mas alla de lo que emite el modelo ni etiqueta hablantes; requiere post-proceso si se necesita texto formateado.
- **Evaluacion limitada**: solo sobre habla leida (FLEURS) con 50 clips y 884 s; el rendimiento en habla conversacional, acentos regionales o audio con ruido no esta caracterizado.
- **Sensibilidad al nivel de entrada**: con picos en torno a -40 dBFS la calidad cae de forma notable; es obligatorio normalizar el nivel antes de alimentar el stream.
- **Peria de la primera palabra**: si no se ceba el stream con unos 0,5 s de silencio, la primera palabra puede descartarse.
- **Dependencia de version**: exige sherpa-onnx >= 1.13.5; con versiones anteriores el modelo carga pero transcribe mal, un fallo silencioso en produccion.
- **Riesgo de alucinacion en ASR**: en tramos con ruido o silencio puede emitir hipotesis plausibles no presentes en el audio; conviene aplicar umbrales de confianza o VAD externo.
- **Digitos**: el WER penaliza la discrepancia entre cifras y numeros escritos con letras; la diferencia entre columnas del benchmark sugiere revisar la normalizacion de numeros en la evaluacion propia.
- **Licencia**: OpenMDW 1.1 se declara como `license: other`; hay que revisar el texto completo y el fichero `NOTICE` (que recoge los datasets de ajuste fino y sus licencias) antes de un uso comercial.
- **Sesgos**: no hay informacion sobre la composicion del corpus de entrenamiento ni sobre sesgos demograficos o dialectales; no disponible.
- **Sin GPU**: no se han publicado mediciones ni grafos optimizados para acelerador; el rendimiento en GPU es no disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mentisialog/sherpa-onnx-nemotron-asr-streaming-farsi-1120ms-int8
- Modelo base del ajuste fino (persa): https://huggingface.co/mehdi-hf/nemotron-asr-streaming-farsi
- Modelo original de NVIDIA: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Repositorio de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Texto de la licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
