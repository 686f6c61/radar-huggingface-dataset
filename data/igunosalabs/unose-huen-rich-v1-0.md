# igunosalabs/Unose-Huen-Rich-v1.0

## Resumen

Unose-Huen-Rich-v1.0 es un modelo experimental de reconocimiento automatico del habla (ASR) enriquecido con anotaciones paralinguisticas y emocionales, desarrollado por Igunosa Labs bajo Patrick Aigbogun. A diferencia de un ASR convencional, que solo devuelve el texto transcrito, este modelo anade etiquetas inline que describen la entonacion y el estado afectivo del hablante, como `[whispering]`, `[laughing]`, `[shouting]`, `[sigh]`, `[pause]` y emociones como `[angry]`, `[happy]`, `[sad]` o `[neutral]`.

El modelo es un fine-tuning directo sobre `igunosalabs/Unose-Huen-Small`, un modelo ASR de 244 millones de parametros basado en la arquitectura Whisper (según los tags del repositorio) con un WER macro-promedio del 7,71%. En esta version "Rich", el codificador acustico del backbone se mantiene congelado durante el entrenamiento, lo que sugiere que solo se reentrenan las capas superiores para la tarea de anotacion. Con 241,7 millones de parametros y un tamaño de repositorio de 1,0 GB en formato safetensors, es un modelo ligero y accesible para despliegue en hardware de consumo. Su relevancia radica en la creciente demanda de transcripcion con metadatos prosodicos para subtitulado, analisis de conversaciones y datasets de entrenamiento de modelos de voz expresivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (ASR encoder-decoder), fine-tuning para ASR enriquecido con anotaciones paralinguisticas |
| Parametros totales | 241.741.824 (~242M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano del repo: 1,0 GB) |

## Arquitectura y entrenamiento

El modelo parte del backbone `igunosalabs/Unose-Huen-Small`, un modelo ASR de 244 millones de parametros basado en la arquitectura Whisper (tal y como indican los tags del repositorio). Durante el fine-tuning hacia la version "Rich", el codificador acustico se mantuvo congelado, de modo que el entrenamiento se centra en adaptar el decodificador para generar transcripciones con etiquetas de estilo de habla y emocion intercaladas en el texto. Esta estrategia reduce el coste computacional del entrenamiento y preserva la calidad de transcripcion del modelo base.

Los datos de entrenamiento publicados son escasos: no se ha especificado el dataset empleado, el numero de tokens o muestras, ni la composicion del corpus. La metrica de convergencia final reportada es una loss de 5,3978. El entrenamiento se realizo en una GPU NVIDIA L4 de Google Colab, lo que indica un proceso de bajo presupuesto y, posiblemente, limitaciones en la escala y diversidad de los datos de anotacion paralinguistica. No hay informacion sobre RLHF, DPO u otras tecnicas de alineacion, lo cual es esperable en un modelo ASR. El modelo base reporta un WER macro-promedio del 7,71%, aunque no se indica si este valor se mantiene en la version Rich.

## Capacidades

- Transcripcion de voz a texto con anotaciones paralinguisticas inline, no solo texto plano.
- Deteccion de estilo de entrega vocal mediante etiquetas especiales:
  - `[whispering]`: habla susurrada, secreta o de baja amplitud.
  - `[laughing]`: risas, carcajadas y cadencias humoristicas.
  - `[shouting]`: intensidad acustica elevada o panico.
  - `[sigh]`: pausas de exhalacion y agotamiento.
  - `[pause]`: vacilaciones conversacionales.
- Clasificacion del estado afectivo del hablante: `[angry]`, `[happy]`, `[sad]`, `[neutral]`.
- Herencia de las capacidades de transcripcion del modelo base Unose-Huen-Small (WER macro del 7,71%).
- No hay informacion disponible sobre idiomas soportados, tool calling, capacidades agentes ni modalidades adicionales (vision o audio generativo).

## Casos de uso

- Subtitulado expresivo para audiovisual: el modelo puede generar subtitulos que incluyan indicaciones como `[whispering]` o `[shouting]`, utiles para doblaje, accesibilidad o adaptaciones de guion, donde la entonacion del actor es parte del contenido.
- Creacion de datasets para TTS expresivo: las transcripciones anotadas con emocion y estilo de habla pueden servir como pares texto-etiqueta para entrenar modelos de sintesis de voz con prosodia controlada.
- Analisis de llamadas de atencion al cliente: la deteccion de `[angry]`, `[sigh]` o `[shouting]` permite priorizar automaticamente llamadas con clientes frustrados y alimentar sistemas de calidad de servicio.
- Transcripcion de podcasts y contenido conversacional: las etiquetas de risa y pausa facilitan la edicion posterior y la generacion de resumenes con contexto tonal.
- Investigacion en paralinguistica: al ser un modelo experimental y ligero (242M de parametros), es adecuado como punto de partida reproducible para estudios academicos sobre deteccion de emocion en el habla.
- Preparacion de datos para modelos de voz conversacionales: agentes de voz que necesitan entender no solo que se dice, sino como se dice, pueden usar estas anotaciones como senales de entrada.
- Archivado y busqueda en bibliotecas de audio: las etiquetas de afecto permiten indexar grabaciones por estado emocional del hablante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es el WER macro-promedio del 7,71% correspondiente al modelo base `igunosalabs/Unose-Huen-Small`, no a esta version Rich. La loss final de entrenamiento fue 5,3978, una cifra que no es directamente comparable entre modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con ~242M de parametros en pesos completos (~1,0 GB en safetensors), un modelo de este tamaño deberia ser manejable en GPUs con 4-6 GB de VRAM en fp16, aunque esta estimacion no esta confirmada por el autor.
- GPU recomendadas: no disponible. El entrenamiento se realizo en una NVIDIA L4 (Google Colab), lo que sugiere que la inferencia es viable en hardware igual o superior de gama consumer.
- Consumer GPUs: dado el tamaño (~1 GB de pesos), deberia funcionar en GPUs de consumo modestas (por ejemplo, RTX 3060 o superiores), e incluso es plausible su ejecucion en CPU, aunque sin datos oficiales de latencia.
- Opciones de despliegue: no hay instrucciones oficiales de despliegue. Al tratarse de pesos safetensors basados en Whisper, es probable que funcione con la libreria `transformers` de Hugging Face; la compatibilidad con llama.cpp, Ollama, vLLM o TGI no esta documentada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Anotacion paralinguistica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unose-Huen-Rich-v1.0 | ~242M | ASR enriquecido | Si (emocion y estilo de habla) | no disponible | HuggingFace, 0 descargas |
| Whisper Small (OpenAI) | 244M | ASR estandar | No | MIT | Ampliamente disponible |
| Whisper Medium (OpenAI) | 769M | ASR estandar | No | MIT | Ampliamente disponible |

La comparativa mas directa es con Whisper Small, dado que el modelo base tiene un tamaño casi identico (244M frente a 242M). La diferencia diferenciadora de Unose-Huen-Rich es la generacion de etiquetas de emocion y estilo de habla, una capacidad que Whisper estandar no ofrece. No hay datos comparativos de WER entre ambos en condiciones equivalentes.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo califica de experimental, con 0 descargas y 0 likes en el momento de la ficha, por lo que no existe historial de uso comunitario ni validacion externa.
- Riesgo de degradacion del WER: al congelar el codificador acustico y reentrenar para una tarea compuesta (transcripcion + anotacion), no esta garantizado que se mantenga el 7,71% de WER del modelo base; no hay evaluacion publicada de la version Rich.
- La loss final de 5,3978 es relativamente alta y sugiere posible convergencia incompleta, coherente con un entrenamiento breve en una L4 de Colab.
- Idiomas soportados no documentados: no se especifica en que idiomas transcribe, un caveat critico antes de cualquier despliegue.
- Licencia no disponible: no es posible confirmar si el uso comercial esta permitido; hay que verificar la licencia en el repositorio antes de uso en produccion.
- Sesgos: no hay informacion sobre sesgos del modelo. Los sistemas de deteccion de emocion en el habla suelen presentar sesgos demograficos conocidos (por acento, genero o edad), y no hay evidencia de que este modelo los haya evaluado o mitigado.
- La clasificacion de emociones y estilos de habla es intrinsecamente subjetiva y propensa a errores; las etiquetas generadas no deben tratarse como verdad absoluta en aplicaciones sensibles.
- Sin documentacion de despliegue, cuantizacion ni requisitos de hardware oficiales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/igunosalabs/Unose-Huen-Rich-v1.0
- Modelo base (backbone): https://huggingface.co/igunosalabs/Unose-Huen-Small
- Organizacion Igunosa Labs: no disponible (no se ha encontrado enlace a la organizacion en la informacion proporcionada)
- Paper o blog: no disponible
