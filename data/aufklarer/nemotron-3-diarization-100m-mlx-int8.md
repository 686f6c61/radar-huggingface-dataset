# aufklarer/Nemotron-3-Diarization-100M-MLX-INT8

## Resumen

Nemotron-3-Diarization-100M-MLX-INT8 es una exportación comunitaria a formato MLX del modelo de diarización de hablantes `nvidia/Nemotron-3-Diarization`, publicada por el usuario `aufklarer`. El modelo resuelve una tarea concreta de audio: emitir probabilidades de actividad por trama para hasta ocho hablantes simultáneos, es decir, determinar *cuándo habla cada voz* dentro de una señal de audio. No transcribe voz ni identifica personas, por lo que funciona como pieza de un pipeline mayor (diarización + ASR), no como sistema completo de reconocimiento del habla.

El checkpoint cuenta con 99.259.800 parámetros (unos 99,2 M) y se distribuye cuantizado en INT8 afín con group size 64, manteniendo otros tensores en FP16, lo que da un peso de aproximadamente 102 MiB. Está pensado para ejecutarse en Apple Silicon mediante MLX, con una ventana de entrada de 30,4 segundos de características mel (128 bandas, audio mono a 16 kHz) y salida en tramas de 10 ms.

Su relevancia es práctica: permite llevar diarización en tiempo real al dispositivo (on-device) en equipos Mac, sin GPU NVIDIA ni servicios en la nube. Según las mediciones del autor, las etapas del modelo tardan una mediana de 32,7 ms por fragmento de 30,4 segundos en un M5 Pro, lo que supone aproximadamente 930 veces más rápido que el tiempo real del audio. Se trata de una conversión reciente, con cero descargas y cero *likes* en el momento de la consulta, y sin tasa de error de diarización (DER) medida de extremo a extremo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de diarizacion de NVIDIA NeMo; la informacion proporcionada no detalla la arquitectura interna) |
| Parametros totales | 99.259.800 (aprox. 99,2 M) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no aplica en tokens; ventana de audio de 30,4 s por fragmento de entrada (3040 tramas de salida a 10 ms) |
| Tipos de cuantizacion | INT8 afin, group size 64; otros tensores en FP16 |
| Idiomas soportados | multilingue (lista concreta de idiomas no disponible) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | MLX safetensors (`model.safetensors`, aprox. 102 MiB) |
| Modelo base | nvidia/Nemotron-3-Diarization (revision `a435e9867d79e789e90053f9b6d6834053af564a`) |
| Tarea (pipeline) | voice-activity-detection / speaker-diarization |
| Entrada de audio | 16 kHz mono, 128 bandas mel, tensor `[1, 3040, 128]` |
| Salida | probabilidades de actividad a 10 ms y a 80 ms, umbral recomendado 0,25 |
| Numero de hablantes | hasta 8 |
| Tamano del repositorio | 0,1 GB |
| Autor de la conversion | aufklarer (exportacion no oficial, derivada de NVIDIA) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo (no se confirma si es un transformer puro, un modelo convolucional o una variante hibrida), ni los datos de entrenamiento, el numero de tokens o el proceso de alineacion (RLHF/DPO). Lo unico documentado es el comportamiento de inferencia: una etapa de *preencode* que convierte las caracteristicas mel en embeddings (secuencia de 304 tramas con dimension 512 en el ejemplo de uso), seguida de una etapa que produce probabilidades de actividad por trama. En el ejemplo de codigo se empaqueta la secuencia con un bloque de ceros y se llama a `infer_preencoded` con valor de contexto 380, pero el significado exacto de ese parametro no se explica en la model card.

El punto tecnicamente relevante de esta ficha es la exportacion: se han convertido los pesos a INT8 afín con group size 64 en MLX, dejando el resto de tensores en FP16. El autor valida la conversion frente al checkpoint original sin cuantizar con una comparacion de paridad numerica: diferencia absoluta media de probabilidad entre 0,00036 y 0,00073, y una discrepancia en la decision de actividad (umbral 0,25) del 0,01 % al 0,07 % de los pares trama/canal. Es una verificacion de fidelidad numerica, no una evaluacion de calidad de diarizacion. Para el modo *streaming*, la model card indica explicitamente que hay que reproducir el algoritmo de cache y FIFO del modelo original para conservar las etiquetas de hablante entre fragmentos.

## Capacidades

- Deteccion de actividad de voz (VAD) a nivel de trama: emite probabilidades de actividad con resolucion de 10 ms.
- Diarizacion de hablantes: distingue actividad para hasta ocho hablantes simultaneos o solapados.
- Salida dual: probabilidades a 10 ms y a 80 ms, con umbral de decision recomendado de 0,25 definido en `config.json`.
- Procesamiento por fragmentos (*chunked*) con estado: mantiene una cache de hablantes en orden de llegada y una FIFO para preservar las etiquetas entre fragmentos consecutivos.
- Ejecucion en streaming: la ventana de 30,4 s se procesa en 32,7 ms (mediana) en un M5 Pro, lo que permite flujo continuo en tiempo real.
- Soporte multilingue declarado (el idioma no afecta a la tarea de diarizacion, que opera sobre caracteristicas acusticas).
- Inferencia local en Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- No realiza transcripcion de voz ni identificacion biométrica de personas.
- No dispone de *tool calling* ni de capacidades de agente o razonamiento multi-paso: no es un modelo de lenguaje.

## Casos de uso

- Transcripcion con etiquetas de hablante: encadenar este modelo con un ASR (por ejemplo, Whisper u otro modelo NeMo) para producir transcripciones de reuniones donde cada intervencion queda atribuida a un hablante. La salida a 10 ms encaja de forma natural con los *timestamps* de un sistema ASR.
- Actas y resumenes de reuniones: al segmentar por hablante y por turno, se pueden generar resumenes diferenciados por participante y calcular tiempos de intervencion en entornos corporativos.
- Analisis de llamadas en centros de contacto: separar agente y cliente en grabaciones mono para medir tiempos de habla, solapamientos y turnos, alimentando analitica de calidad sin enviar audio a terceros.
- Subtitulado automatico de entrevistas y podcasts: generar subtitulos con marcas de cambio de hablante, util en produccion de contenido multilingue gracias al soporte multilingue declarado.
- Investigacion cualitativa en ciencias sociales: transcripcion y segmentacion de entrevistas largas manteniendo la atribucion de voz, con el audio procesado localmente para cumplir requisitos de confidencialidad.
- Preprocesado y ahorro de computo: usar el modelo como VAD previo para recortar silencios y activar el ASR solo en segmentos con voz, reduciendo coste de transcripcion en lotes grandes de audio.
- Aplicaciones de escritorio en macOS con privacidad por diseno: integrar el modelo en herramientas nativas de Mac (notas de voz, grabadoras, editores) que necesitan diarizacion sin conexion y sin coste por minuto de API.
- Monitorizacion en directo de participacion: en streaming, medir en tiempo real cuantos hablantes estan activos y cuanto habla cada uno, por ejemplo en plataformas de videoconferencia o en analisis de sesiones en vivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar de diarizacion (por ejemplo, DER sobre AMI, DIHARD o VoxConverse) en la informacion disponible. El autor indica de forma explicita que la comparacion realizada es una prueba de paridad numerica de la cuantizacion, no un *benchmark* de tasa de error de diarizacion, y que no se ha medido DER de extremo a extremo para este paquete.

| Medida | Valor | Interpretacion |
|---|---|---|
| Tiempo mediano de las etapas del modelo | 32,7 ms | Sobre un fragmento de 30,4 s; aprox. 930x mas rapido que el tiempo real |
| Diferencia absoluta media de probabilidad | 0,00036 – 0,00073 | Frente al checkpoint sin cuantizar; menor es mejor |
| Desacuerdo en la decision de actividad (umbral 0,25) | 0,01 % – 0,07 % de pares trama/canal | La cuantizacion altera pocas decisiones |
| DER de extremo a extremo | no medido | No disponible |
| Hardware y software de la medicion | Apple M5 Pro, macOS 26.6.2 | Mediana de tres ejecuciones en caliente |
| Alcance de la medicion | Solo etapas del modelo | Excluye extraccion mel, carga de archivo, actualizacion de cache y postprocesado de segmentos |

## Requisitos de hardware

- Pesos: aproximadamente 102 MiB en el repositorio (INT8 con group size 64 mas tensores FP16); el repositorio completo ocupa 0,1 GB.
- Plataforma obligatoria: Apple Silicon con MLX. La libreria `mlx` no soporta GPU NVIDIA, AMD ni CPU x86 de forma oficial, por lo que no es desplegable en A100, H100 o RTX en este formato.
- Memoria: el peso del modelo es minimo; el consumo real depende del *buffer* de audio y de los tensores intermedios (secuencia de 304 tramas de 512 dimensiones mas el bloque empaquetado). La model card no publica cifras de memoria pico.
- Cabe en cualquier Mac con chip de la serie M: la medicion de referencia se hizo en un M5 Pro, pero no se documentan requisitos minimos de generacion de chip ni de RAM unificada.
- Rendimiento de referencia: 32,7 ms medianos por fragmento de 30,4 s (aproximadamente 930x tiempo real) en M5 Pro, excluyendo preprocesado y postprocesado.
- Opciones de despliegue: ejecucion directa con Python y MLX usando `mlx_reference.py` y `run_chunk.py` incluidos en el repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son *runtimes* de modelos de lenguaje y no aplican a este tipo de modelo). El ecosistema asociado que aparece enlazado es `speech-swift` (SDK para Apple) y la documentacion de soniqo.audio.
- Requisito de integracion en streaming: hay que reimplementar el algoritmo de cache de hablantes y FIFO del modelo original para mantener etiquetas coherentes entre fragmentos.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Cuantizacion | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| aufklarer/Nemotron-3-Diarization-100M-MLX-INT8 | 99,26 M | 30,4 s por fragmento | INT8 (group size 64) + FP16 | OpenMDW 1.1 | MLX safetensors, orientado a Apple Silicon |
| nvidia/Nemotron-3-Diarization (modelo origen) | 99,2 M (segun la model card del export) | no disponible | FP sin cuantizar | OpenMDW 1.1 | no disponible en la informacion proporcionada |
| Otras alternativas de diarizacion (p. ej. familias pyannote o NeMo) | no disponible | no disponible | no disponible | no disponible | no disponible |

Los datos disponibles solo permiten comparar el export con su modelo origen, y unicamente en los aspectos de cuantizacion y paridad numerica. No hay informacion sobre parametros, contexto, rendimiento, licencia o disponibilidad de alternativas como pyannote o las herramientas de diarizacion de NeMo, por lo que no se incluyen cifras que no esten respaldadas por la fuente.

## Limitaciones y advertencias

- No transcribe voz ni identifica personas: solo produce probabilidades de actividad por hablante. Cualquier expectativa de reconocimiento del habla o de identificacion biometrica queda fuera de su alcance.
- No se ha medido el DER de extremo a extremo de este paquete. La paridad numerica frente al checkpoint original no garantiza un rendimiento equivalente en una metrica de diarizacion completa.
- En modo *streaming*, si no se reproduce el algoritmo de cache y FIFO del modelo origen, las etiquetas de hablante pueden cambiar entre fragmentos y romper la coherencia de la diarizacion.
- Limite de ocho hablantes simultaneos como maximo; no se documenta el comportamiento con mas voces ni el rendimiento en audio muy solapado o con ruido.
- Requiere caracteristicas mel preprocesadas con el preprocesador de NeMo (128 bandas, 16 kHz mono, forma `[1, 3040, 128]`). Un preprocesado distinto invalida los resultados.
- Dependencia de plataforma: al ser un export MLX, no es utilizable en GPUs NVIDIA o AMD ni en servidores Linux convencionales. Para esos entornos habria que usar el modelo origen.
- Es una conversion no oficial realizada por un tercero, con cero descargas y cero *likes* en el momento de la consulta; no ha pasado por una validacion amplia de la comunidad.
- La licencia OpenMDW 1.1 aplica tanto al modelo origen como a estos pesos derivados; conviene revisar `LICENSE` y `NOTICE` del repositorio antes de un uso comercial, ya que en la informacion proporcionada no se detallan los terminos concretos.
- Sesgos conocidos: no disponible. La informacion no incluye analisis de sesgos por idioma, acento, genero o tipo de voz, algo relevante en diarizacion.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto; el riesgo equivalente es la asignacion erronea de actividad a un hablante, que la model card no cuantifica en terminos de error final.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aufklarer/Nemotron-3-Diarization-100M-MLX-INT8
- Modelo base (NVIDIA): https://huggingface.co/nvidia/Nemotron-3-Diarization
- Blog de NVIDIA sobre el modelo de diarizacion: https://huggingface.co/blog/nvidia/nemotron-diarization
- speech-swift (SDK para Apple): https://github.com/soniqo/speech-swift
- Documentacion de instalacion y CLI: https://soniqo.audio/getting-started
- Sitio web: https://soniqo.audio
- Blog: https://soniqo.audio/blog
