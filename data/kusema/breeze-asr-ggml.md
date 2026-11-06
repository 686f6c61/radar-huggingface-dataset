# kusema/breeze-asr-ggml

## Resumen

Breeze ASR 25 (GGML) es un espejo del modelo de reconocimiento automático del habla MediaTek-Research/Breeze-ASR-25, convertido al formato GGML de whisper.cpp y cuantizado a `q5_k`. El repositorio lo publica el autor de Kusema, una aplicación de dictado para Windows, con el único objetivo de garantizar la integridad de la descarga: el archivo es una copia sin modificar y su tamaño y SHA-256 coinciden con los que la aplicación verifica tras cada descarga. Los autores de Kusema no han entrenado el modelo ni están afiliados a MediaTek Research.

El modelo subyacente, Breeze-ASR-25, es un sistema de reconocimiento de voz de MediaTek Research orientado a transcripción multilingüe, con especial énfasis en mandarín, inglés y code-switching entre ambos. Esta distribución concreta no aporta pesos nuevos: es un artefacto de despliegue pensado para ejecutarse en local mediante whisper.cpp, sin dependencias de Python ni de GPU dedicada.

Su relevancia es práctica: permite integrar un ASR de calidad en aplicaciones de escritorio y pipelines ligeros con un único archivo de aproximadamente 1,08 GB, licencia Apache 2.0 y un formato ampliamente soportado por el ecosistema ggml. No se dispone de información sobre arquitectura interna, parámetros o contexto en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base basado en Whisper; detalles no publicados en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio dependiente de whisper.cpp; no especificada) |
| Tipos de cuantizacion | `q5_k` (única variante publicada en este repositorio) |
| Idiomas soportados | no disponible en esta ficha (el modelo base Breeze-ASR-25 esta orientado a mandarin, ingles y code-switching, segun la informacion del autor original) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML (archivo binario `breeze-asr-q5_k.bin`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el volumen de datos de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO u otras) empleadas en Breeze-ASR-25. La model card de este repositorio es exclusivamente una nota de espejo y no reproduce los detalles tecnicos del modelo original.

Lo unico documentado en esta ficha es el proceso de conversion: el modelo original se transformo al formato GGML de whisper.cpp y se cuantizo a `q5_k`, partiendo del archivo que distribuia la aplicacion Handy, en la que se basa Kusema. El resultado es un binario de 1.080.732.108 bytes con SHA-256 `8efbf0ce8a3f50fe332b7617da787fb81354b358c288b008d3bdef8359df64c6`.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) como tarea principal del pipeline `automatic-speech-recognition`.
- Ejecucion local mediante whisper.cpp, sin necesidad de Python ni de frameworks de deep learning en tiempo de inferencia.
- Formato GGML cuantizado, adecuado para CPU y para GPU con poca memoria.
- Idiomas: no disponibles en la informacion proporcionada para esta distribucion; consultar la ficha del modelo original.
- Soporte de tool calling, agentes, vision, audio generativo o thinking mode: no disponible (no aplica a un modelo ASR).
- No se documentan capacidades de diarizacion, timestamps por palabra ni deteccion de idioma en esta ficha.

## Casos de uso

- Dictado en aplicaciones de escritorio: es el escenario para el que se publica este espejo. Kusema lo integra como motor de transcripcion en Windows, verificando el SHA-256 del binario tras la descarga para garantizar que el archivo no se ha corrompido ni manipulado.
- Transcripcion offline en equipos sin GPU: el formato GGML y la cuantizacion `q5_k` permiten ejecutar la inferencia en CPU, lo que encaja en portatiles y estaciones de trabajo sin acelerador dedicado.
- Subtitulado de reuniones y clases: al ejecutarse en local, el audio no sale del dispositivo, lo que simplifica el cumplimiento de requisitos de privacidad en entornos corporativos o educativos.
- Preprocesado de audio en pipelines de datos: transcripcion por lotes de grabaciones para alimentar indices de busqueda, sistemas de actas o analitica de conversaciones, usando whisper.cpp como dependencia ligera.
- Prototipado rapido de interfaces de voz: un unico archivo y una libreria C/C++ permiten incorporar ASR a demos y pruebas de concepto sin montar un stack de servidor.
- Distribucion reproducible en aplicaciones de terceros: el par tamaño + SHA-256 documentado facilita empaquetar el modelo con verificacion de integridad en instaladores y actualizadores.
- Procesamiento en entornos con conectividad limitada: al no requerir llamadas a una API externa, resulta adecuado para despliegues en campo, kioscos o sistemas embebidos con Linux.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, un binario `q5_k` de aproximadamente 1,08 GB requiere del orden de 1,5 a 2,5 GB de memoria en tiempo de ejecucion al sumar pesos y buffers de inferencia; esta cifra es una estimacion, no un dato publicado.
- GPU recomendadas: no especificadas por el autor. whisper.cpp puede ejecutarse en GPU NVIDIA mediante CUDA y en GPU Apple mediante Metal; el modelo base tambien puede correr integramente en CPU.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 4 GB o mas de memoria, aunque no hay confirmacion oficial en la informacion disponible.
- Opciones de despliegue: whisper.cpp (libreria C/C++, CLI y bindings), y cualquier herramienta que consuma archivos GGML de whisper.cpp. No se documenta soporte para vLLM, TGI ni Ollama en esta ficha.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| kusema/breeze-asr-ggml (este) | no disponible | no disponible | no disponible en esta ficha | Apache 2.0 | GGML `q5_k` | Hugging Face, espejo verificado por SHA-256 |
| MediaTek-Research/Breeze-ASR-25 | no disponible | no disponible | mandarin, ingles y code-switching (segun el autor original) | Apache 2.0 | safetensors (formato original) | Hugging Face, repositorio oficial |
| Whisper (variantes de OpenAI) | 39 M a 1,55 G | ventana de audio de 30 s por segmento | multilingue (segun variante) | MIT (pesos) | GGML, safetensors, entre otros | Hugging Face y ecosistema whisper.cpp |
| whisper.cpp (formatos GGML de la comunidad) | segun modelo origen | segun modelo origen | segun modelo origen | segun modelo origen | GGML | GitHub y Hugging Face |

La comparativa se limita a datos publicos y verificables; no se dispone de cifras de rendimiento comparables para este artefacto.

## Limitaciones y advertencias

- Este repositorio no es el modelo original: es un espejo mantenido por terceros. Para uso en produccion conviene partir de MediaTek-Research/Breeze-ASR-25 y de su documentacion oficial.
- Solo se publica una variante cuantizada (`q5_k`); no hay versiones en otros niveles de cuantizacion ni pesos sin cuantizar en este repositorio.
- La cuantizacion a `q5_k` puede introducir una perdida de precision en la transcripcion respecto al modelo original; no se han publicado mediciones de esa degradacion.
- No se documentan sesgos, tasas de alucinacion ni comportamiento en audio con ruido, acentos o dominios especializados (medico, legal, tecnico).
- El soporte de idiomas de esta distribucion no esta confirmado en la informacion disponible; verificar en la ficha del modelo original antes de asumir cobertura multilingue.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y la atribucion a MediaTek Research incluidos en el archivo `LICENSE`.
- No se garantiza mantenimiento, actualizaciones ni soporte por parte de los autores de Kusema; el repositorio tiene cero descargas y cero likes en el momento de la consulta.
- El modelo esta pensado para inferencia con whisper.cpp; intentar cargarlo con otras librerias (transformers, vLLM) requerira conversion previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kusema/breeze-asr-ggml
- Modelo original: https://huggingface.co/MediaTek-Research/Breeze-ASR-25
- Proyecto Kusema: https://github.com/neulinc/kusema
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
