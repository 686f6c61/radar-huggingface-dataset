# iky1e/granite-speech-5.0-470m-turboctc-mlx-fp16

## Resumen

El modelo `iky1e/granite-speech-5.0-470m-turboctc-mlx-fp16` es una conversión a formato MLX (Apple Silicon) de los pesos del modelo `ibm-granite/granite-speech-5.0-470m-turboctc`, desarrollado por IBM. Se trata de un sistema de reconocimiento automático del habla (ASR) en inglés, compacto, con 470 millones de parámetros, diseñado para ofrecer una velocidad de inferencia muy alta y poder ejecutarse en dispositivos de borde como portátiles, teléfonos móviles o hardware embebido. La conversión ha sido realizada por el usuario `iky1e` y publicada bajo licencia Apache 2.0, manteniendo los términos del modelo original.

La relevancia de este modelo radica en su equilibrio entre precisión y velocidad: IBM reporta una velocidad de transcripción superior a 12 600 RTFx (tiempos reales) en una GPU NVIDIA H200, lo que permite transcribir horas de audio en segundos. La versión MLX aquí presentada conserva los pesos en FP16 sin cuantización, lo que facilita su uso en equipos Apple con el runtime Granite-MLX, manteniendo una fidelidad del 99,97 % respecto al checkpoint original en términos de acuerdo de transcripción a nivel de palabra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder con block self-attention, self-conditioning y temporal downsampling; salida CTC con 16 384 unidades BPE |
| Parametros totales | 472 993 792 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 20,48 segundos de audio (configuracion por defecto en Granite-MLX) |
| Tipos de cuantizacion | FP16 (este repositorio); tambien disponibles Q8, Q6, Q5 y Q4 en repositorios hermanos del mismo autor |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `granite-speech-5.0-470m-turboctc` es un codificador de voz basado en la arquitectura Conformer, que combina capas de convolucion y atencion por bloques. Incorpora self-conditioning y reduccion temporal de la resolucion, y su capa de salida produce 16 384 unidades BPE. Es un modelo exclusivamente encoder, sin decodificador de lenguaje, que emplea decodificacion CTC greedy para generar transcripciones. No se dispone de informacion detallada sobre el conjunto de datos de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas como RLHF o DPO, ya que no se mencionan en la documentacion consultada.

La conversion a MLX realizada por `iky1e` transpone los kernels de convolucion depthwise de PyTorch al formato MLX, elimina contadores de batch propios del entrenamiento, convierte los tensores de punto flotante a FP16 y aplica cuantizacion afin solo a los pesos cuando es necesario. Las activaciones se mantienen en punto flotante durante la inferencia. El proceso de conversion esta documentado y es reproducible mediante un script publicado en el repositorio.

## Capacidades

- Transcripcion de voz en ingles a texto con alta velocidad (mas de 12 600 RTFx en GPU H200 segun IBM).
- Procesamiento de archivos de audio y video, con exportacion a formatos TXT, SRT, WebVTT y JSON mediante el runtime Granite-MLX.
- Adecuado para inferencia en tiempo real o por lotes en dispositivos con recursos limitados (portatiles, smartphones, edge).
- Soporte para decodificacion CTC greedy, sin necesidad de modelo de lenguaje externo.
- No incluye capacidades de tool calling, agentes, vision, audio de salida ni razonamiento multimodal; es exclusivamente un sistema de reconocimiento de voz.

## Casos de uso

- Transcripcion de reuniones y conferencias: el modelo puede procesar grabaciones de larga duracion (por ejemplo, una clase de 100 minutos) en pocos segundos, gracias a su alta velocidad y a la gestion de memoria acotada del runtime Granite-MLX, que divide el audio en fragmentos de 122,88 segundos con un contexto de 20,48 segundos.
- Subtitulacion automatica de videos: al aceptar archivos de video y exportar a SRT o WebVTT, permite generar subtitulos para contenido educativo, corporativo o de entretenimiento de forma rapida y local, sin depender de servicios en la nube.
- Asistentes de voz en dispositivos de borde: su tamano compacto (470M parametros) y su bajo consumo de memoria lo hacen apto para integrarse en aplicaciones de asistencia por voz en moviles o dispositivos IoT, donde la latencia y la privacidad son criticas.
- Accesibilidad para personas con discapacidad auditiva: la transcripcion en tiempo real de conversaciones o eventos puede facilitar la inclusion en entornos educativos o laborales, con la ventaja de ejecutarse localmente sin conexion.
- Analisis de contenido multimedia: permite indexar y buscar dentro de archivos de audio o video mediante la transcripcion a texto, habilitando busquedas por palabras clave en bibliotecas de medios.
- Entrenamiento de otros modelos: las transcripciones generadas pueden utilizarse como datos de entrenamiento o de aumento para otros sistemas de procesamiento de lenguaje natural, aprovechando la velocidad del modelo para procesar grandes volumenes de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar de ASR (como WER) en la informacion disponible. Los datos de rendimiento que se proporcionan son los siguientes:

| Metrica | Valor |
|---|---|
| Velocidad de transcripcion (RTFx) en NVIDIA H200 | > 12 600 |
| Acuerdo con el checkpoint original (FP16, word-level) | 99,9706 % |
| Tamano del archivo de pesos (FP16) | 902,22 MiB |
| Tamano del archivo de pesos (Q4) | 254,93 MiB |

Nota: el "acuerdo con el checkpoint original" se calcula como `100 − ediciones Levenshtein a nivel de palabra / palabras de origen` y no debe confundirse con WER. La prueba se realizo sobre una conferencia de 6 118,72 segundos (101 minutos y 58 segundos) con un solo hablante, utilizando los valores por defecto de Granite-MLX (fragmentos de 122,88 segundos, contexto de 20,48 segundos, activaciones FP16, decodificacion CTC greedy y cache MLX de 64 MiB).

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo de pesos FP16 ocupa aproximadamente 902 MiB, por lo que con overhead de runtime se estima un consumo de memoria de entre 1 y 2 GB. Las versiones cuantizadas (Q8, Q6, Q5, Q4) reducen este requisito hasta 255 MiB en el caso de Q4.
- GPU recomendadas: al ser un modelo MLX, esta optimizado para Apple Silicon (M1, M2, M3, M4 y posteriores). No se requieren GPU dedicadas de alta gama; cualquier Mac con chip Apple Silicon puede ejecutarlo. Para el modelo original en PyTorch, se puede usar cualquier GPU NVIDIA con al menos 2 GB de VRAM, aunque este repositorio no incluye pesos en formato PyTorch.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo moderna (por ejemplo, RTX 3060 o superior) si se convierte a otro formato, pero el uso previsto es en Apple Silicon.
- Opciones de despliegue: el runtime oficial es Granite-MLX (Swift), que acepta archivos de audio y video y exporta transcripciones en varios formatos. Tambien se puede utilizar con otros frameworks de MLX (Python) si se adapta, aunque no se documenta en este repositorio.
- Latencia y throughput: no se proporcionan valores de latencia especificos, pero la velocidad reportada de mas de 12 600 RTFx en H200 sugiere una latencia muy baja para fragmentos cortos. En Apple Silicon, el rendimiento dependera del modelo concreto del chip.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos ASR en la informacion proporcionada. Se podria comparar cualitativamente con Whisper (de OpenAI) en su variante small, pero no se tienen datos numericos de WER ni de velocidad para establecer una comparacion rigurosa. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- El modelo solo soporta el idioma ingles; no es adecuado para transcripcion en otros idiomas.
- La longitud de contexto de audio esta limitada a 20,48 segundos por defecto en Granite-MLX, aunque el runtime gestiona fragmentos mas largos mediante particionamiento. Para audio muy largo, la coherencia entre fragmentos puede verse afectada.
- No se han publicado evaluaciones de WER en conjuntos de datos estandar, por lo que la precision real en escenarios con ruido, acentos variados o multiples hablantes no esta verificada.
- El acuerdo con el checkpoint original (99,97 %) se calculo sobre una unica grabacion de un solo hablante; no garantiza el mismo nivel de fidelidad en otras condiciones.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero el software Granite-MLX (el runtime) tiene su propia licencia, que no se especifica en este repositorio. Es necesario revisar los terminos de ese software por separado.
- Al ser una conversion de pesos, cualquier error en el proceso de conversion podria afectar a la precision, aunque la validacion realizada muestra una desviacion minima.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/iky1e/granite-speech-5.0-470m-turboctc-mlx-fp16
- Modelo base original de IBM: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Repositorio GitHub de IBM Granite Speech: https://github.com/ibm-granite/granite-speech-models
- Documentacion de IBM sobre Granite Speech: https://www.ibm.com/granite/docs/models/speech
- Articulo sobre el lanzamiento de Granite Speech 5.0 Turbo CTC: https://korshunov.ai/en/article/20704-ibm-releases-granite-speech-5-0-turbo-ctc-models-with-over-12600-rtfx-speed/
- Articulo en The AI Chronicler: https://theaicronicle.com/en/news/research/granite-speech-5-0-turbo-ctc-speed-accuracy
