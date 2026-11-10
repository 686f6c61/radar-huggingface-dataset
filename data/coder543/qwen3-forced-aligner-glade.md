# coder543/qwen3-forced-aligner-glade

## Resumen

Qwen3 Forced Aligner for Glade es una conversión del modelo Qwen3-ForcedAligner-0.6B de Qwen a los formatos y la configuración de ejecución de Glade, orientados al Apple Neural Engine mediante las APIs Core AI de Apple. El modelo original resuelve una tarea concreta de alineamiento forzado: recibe un texto ya transcrito junto con el audio correspondiente y predice marcas temporales para cada palabra, sin realizar reconocimiento de voz ni sustituir la transcripción. Esta conversión la publica el usuario coder543 y mantiene la licencia Apache 2.0 del modelo fuente.

Aunque la nomenclatura comercial habla de "0.6B", el checkpoint completo ronda los 918 millones de parámetros; el sufijo 0.6B describe únicamente el backbone de texto. La arquitectura combina un frontend convolucional, un Transformer de audio de 24 capas y un Transformer de texto de 28 capas, con un clasificador de timestamps de 80 ms de resolución. Su relevancia actual radica en que permite ejecutar alineamiento forzado multilingüe en hardware Apple (Mac con silicio y iPhone) con aceleración por Neural Engine y velocidades muy superiores al tiempo real.

El modelo está pensado para integrarse en pipelines de subtitulado, sincronización de transcripciones y anotación de corpus, siempre que el host aporte el preprocesado de audio, la tokenización BPE y el postprocesado de marcas temporales. No es un modelo de propósito general ni genera texto de forma autorregresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Frontend convolucional + Transformer de audio (24 capas) + Transformer de texto causal (28 capas) + clasificador de timestamps |
| Parametros totales | ~918 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8.192 posiciones combinadas de audio y texto; audio limitado a 5 minutos por llamada; entry points densos de 512, 1.024 y 1.536 posiciones |
| Tipos de cuantizacion | W8A16 en frontend convolucional y Transformers de audio y texto; FP16 en clasificador de timestamps y tabla de embeddings |
| Idiomas soportados | en, zh, yue, fr, de, it, ja, ko, pt, ru, es (otros en modo best-effort) |
| Licencia | Apache 2.0 |
| Formato de pesos | assets `.aimodel` para Core AI / Glade (no safetensors ni GGUF); repo de 1,9 GB |

## Arquitectura y entrenamiento

La arquitectura es un sistema de alineamiento forzado en dos torres: un frontend convolucional que procesa características log-mel a 16 kHz, seguido de un Transformer de audio de 24 capas, y un Transformer de texto de 28 capas que consume los tokens BPE de la transcripción. Sobre ambas representaciones actúa un clasificador de timestamps con clases separadas 80 ms. El texto se procesa de forma causal, pero como todas las palabras se conocen de antemano, no existe bucle de generación autorregresiva de tokens.

La conversión aplica cuantización W8A16 a las partes convolucional y Transformer, manteniendo FP16 en el clasificador y la tabla de embeddings. Para entradas largas se usa prefill de 512 posiciones con posiciones rotatorias absolutas originales y caché de clave/valor completa por capa, hasta 8.192 posiciones combinadas. La normalización de cabezas query/key se agrupa por lotes entre cabezas independientes preservando la semántica del modelo original. El host debe encargarse del framing de audio, extracción de log-mel, BPE a nivel de byte, lookup de embeddings, gestión de caché causal y postprocesado de timestamps; los grafos no aceptan audio y texto crudos. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo fuente.

## Capacidades

- Alineamiento forzado de palabras sobre una transcripción ya proporcionada, con predicción de marcas temporales.
- Soporte multilingüe declarado para 11 idiomas: inglés, chino, cantonés, francés, alemán, italiano, japonés, coreano, portugués, ruso y español.
- Procesamiento de audio de hasta 5 minutos por llamada de alineación.
- Manejo de entradas largas mediante prefill por bloques de 512 posiciones con retención de contexto previo.
- Reparación monótona de timestamps en el modelo fuente, que puede producir tramos de palabra de duración cero.
- Ejecución acelerada en Apple Neural Engine mediante Core AI, con grafos que no usan GPU del proceso objetivo.
- No realiza reconocimiento de voz ni genera o corrige la transcripción.
- No dispone de tool calling, function calling ni capacidades de agente.

## Casos de uso

- Subtitulado automático con marcas por palabra: dado un transcript ya generado por un ASR, el modelo devuelve tiempos por palabra para producir subtítulos karaoke o resaltados sincronizados, aprovechando su resolución de 80 ms y su velocidad superior a 100× tiempo real en Mac y iPhone.
- Sincronización de transcripciones editoriales: en flujos de postproducción donde el texto se corrige manualmente, el modelo reajusta los tiempos sobre la versión editada sin volver a transcribir el audio.
- Anotación de corpus lingüísticos: para investigación en fonética o análisis de discurso, permite obtener fronteras de palabra consistentes en 11 idiomas sobre grabaciones de hasta 5 minutos por llamada.
- Aplicaciones móviles de accesibilidad: al ejecutarse en iPhone 15 Pro Max con Core AI y Neural Engine, habilita resaltado de texto en tiempo de lectura sobre audio pregrabado con un footprint de cliente de aproximadamente 1,48 GB en la prueba de grabación completa.
- Procesamiento por lotes en Mac: con un MacBook Air M3 y 16 GB se alinean 18 minutos de audio en 7,541 s (145,3× RTFx), adecuado para pipelines de archivado y catalogación de medios.
- Control de calidad de doblaje y localización: comparar los tiempos predichos con los del reconocedor nativo para detectar desviaciones en segmentos problemáticos, manteniendo la transcripción original de forma independiente.
- Investigación en alineamiento multimodal: servir como referencia numérica reproducible, ya que las repeticiones en iPhone coincidieron exactamente con las clases crudas y los tiempos reparados del Mac en las 4.448 clases de la grabación completa.

## Benchmarks y rendimiento

El autor publica mediciones de velocidad de alineación sobre el discurso "We choose to go to the Moon" de John F. Kennedy, con transcripción ya proporcionada y excluyendo ASR, carga de modelo, especialización y decodificación de audio.

| Dispositivo | Audio | Mediana de alineación en caliente | RTFx | Repeticiones |
|---|---|---:|---:|---:|
| M3 MacBook Air, 16 GB | Extracto de 20 s | 0,103 s | 194,9× | 5 |
| M3 MacBook Air, 16 GB | Grabación completa de 18 min 15 s | 7,541 s | 145,3× | 5 |
| iPhone 15 Pro Max | Extracto de 20 s | 0,125 s | 160,4× | 5 |
| iPhone 15 Pro Max | Grabación completa de 18 min 15 s | 9,173 s | 119,4× | 3 |

La grabación completa son 1.095,3 s divididos en 36 segmentos de transcripción de como máximo 35 s. Una llamada separada de 238,6 s con 5.151 posiciones válidas tarda 6,91 s en Mac, aproximadamente 34,5× tiempo real, lo que refleja el mayor coste de la atención global larga. El pico de footprint del cliente fue de unos 0,81 GB en Mac y 1,48 GB en iPhone para la grabación completa. No se han publicado resultados de benchmarks de precisión (WER de alineamiento, MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Hardware obligatorio: silicio Apple físico con macOS 27 o iOS 27, APIs Core AI y el runtime host específico de Glade para este modelo.
- No es ejecutable en GPU NVIDIA, AMD ni en CPU genérica con los assets publicados.
- VRAM estimada: no aplica; el consumo medido es de aproximadamente 0,81 GB de footprint de cliente en Mac y 1,48 GB en iPhone para la grabación completa, excluyendo asignaciones del driver y del compilador.
- Dispositivos validados: M3 MacBook Air con 16 GB e iPhone 15 Pro Max.
- Preparación en primer uso: 8 min 27 s en M3 MacBook Air y 11 min 15 s en iPhone 15 Pro Max; preparaciones cacheadas posteriores de 0,139 s y 0,081-0,579 s respectivamente.
- Opciones de despliegue: runtime host de Glade sobre Core AI; no hay soporte de vLLM, llama.cpp, Ollama ni TGI.
- Throughput: 145,3× RTFx en Mac y 119,4× RTFx en iPhone sobre la grabación completa; 194,9× y 160,4× respectivamente en el extracto de 20 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Ejecución |
|---|---|---|---|---|---|
| coder543/qwen3-forced-aligner-glade | ~918 M | 8.192 posiciones combinadas, audio ≤5 min | 11 | Apache 2.0 | Core AI / Apple Neural Engine |
| Qwen/Qwen3-ForcedAligner-0.6B-hf | ~918 M (según el autor de la conversión) | no disponible en la información proporcionada | 11 | Apache 2.0 | Framework original de Qwen |
| Otros alineadores forzados | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible no incluye datos de rendimiento del modelo fuente ni de alternativas comparables, por lo que no es posible establecer una comparación cuantitativa de precisión.

## Limitaciones y advertencias

- El modelo no reconoce voz ni corrige transcripciones: si el texto de entrada es incorrecto, la alineación será incorrecta.
- Requiere hardware Apple físico, macOS 27 o iOS 27, Core AI y el runtime host de Glade; no hay ruta de despliegue en otras plataformas.
- Los grafos no aceptan audio y texto crudos: el host debe implementar framing a 16 kHz, log-mel, BPE a nivel de byte, lookup de embeddings, gestión de caché causal y postprocesado de timestamps.
- Límite de 5 minutos de audio por llamada y de 8.192 posiciones combinadas; ambos deben respetarse simultáneamente.
- La reparación monótona del modelo fuente puede generar tramos de palabra con duración cero.
- La cobertura de 11 idiomas es la declarada por el modelo fuente; el autor advierte que esta conversión no establece precisión temporal fuera de esa cobertura, y que otros idiomas son solo best-effort.
- Los tiempos de preparación en primer uso son elevados (8-11 minutos) y pueden repetirse si cambian almacenamiento, aplicación, sistema operativo o dispositivo.
- Las mediciones de rendimiento no predicen el coste de una única llamada de alineación de contexto largo, que es sensiblemente más caro por la atención global.
- No se han publicado métricas de precisión de fronteras de palabra validadas por anotadores humanos; la coincidencia Mac-iPhone demuestra acuerdo numérico, no exactitud.
- El repositorio no incluye productos del compilador AoT, ya que no se ha demostrado beneficio en tiempo de carga.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de licencia y verificar las obligaciones de atribución del modelo fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coder543/qwen3-forced-aligner-glade
- Modelo base: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B-hf
- Revisión del modelo fuente citada: `c07281df297b9905d24a508279258cccf987a064`
- Paper, blog, repositorio o demo de Glade: no disponible en la información proporcionada
