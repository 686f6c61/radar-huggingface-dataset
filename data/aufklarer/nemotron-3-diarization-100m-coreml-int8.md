# aufklarer/Nemotron-3-Diarization-100M-CoreML-INT8

## Resumen

Nemotron-3-Diarization-100M-CoreML-INT8 es una exportación compilada a CoreML del modelo NVIDIA Nemotron 3 Diarization, publicada por el usuario aufklarer para su ejecución en dispositivos Apple. El modelo original es un sistema de diarización de hablantes en streaming de aproximadamente 99,2 millones de parámetros, y esta versión lo reempaqueta en dos grafos `.mlmodelc` con pesos lineales cuantizados a INT8 (bloque 32) y convoluciones y activaciones en FP16, con un tamaño combinado de unos 103 MiB.

La pieza relevante no es el modelo base, sino el formato: hasta ahora la diarización de calidad basada en transformers exigía GPU o servicios en la nube, mientras que este bundle está pensado para ejecutarse en CPU de Apple Silicon dentro de aplicaciones iOS 18 o superiores. El modelo emite probabilidades de actividad por trama de 10 ms y por hablante, para un máximo de ocho hablantes, procesando la señal en fragmentos de 30,4 segundos de características mel (16 kHz mono, 128 bandas).

Es importante acotar su alcance: no transcribe voz ni identifica personas, solo determina qué hablante está activo en cada instante. Su utilidad real aparece como etapa previa o paralela a un sistema ASR, aportando etiquetas de hablante a una transcripción en aplicaciones de reuniones, subtitulado o análisis de llamadas que deban funcionar sin conexión y sin enviar audio a terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pre-encoder de proyección de características mel y cabeza de actividad de hablante (detalle completo de capas no disponible) |
| Parametros totales | 99,2 millones (modelo fuente) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Procesamiento por fragmentos de 30,4 s de mel (3040 tramas de 10 ms), con estado de caché de hablantes y FIFO entre fragmentos |
| Tipos de cuantizacion | Pesos lineales INT8 con cuantización por bloques de 32; convoluciones y activaciones en FP16 |
| Idiomas soportados | Multilingue (lista concreta de idiomas no disponible) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | Dos grafos CoreML compilados (`Nemotron3PreEncoder.mlmodelc` y `Nemotron3Head.mlmodelc`); no se distribuye `.mlpackage` |

Datos adicionales: audio de entrada a 16 kHz mono con 128 bandas mel, resolución de salida de 10 ms por trama, hasta 8 hablantes, objetivo mínimo de despliegue iOS 18, tamano de repo 0,1 GB. Estructura de entrada del head: tensor empaquetado de forma `[1, 684, 512]` (512 dimensiones de embedding, 380 posiciones ocupadas en el primer fragmento).

## Arquitectura y entrenamiento

La informacion disponible describe la estructura del bundle, no el entrenamiento del modelo fuente. El paquete consta de dos etapas: un pre-encoder (`Nemotron3PreEncoder.mlmodelc`, unos 0,6 MiB) que proyecta las características mel, y un head (`Nemotron3Head.mlmodelc`, unos 102 MiB) que aloja el transformer y la cabeza de actividad de hablante. Los pesos lineales del transformer estan cuantizados a INT8 con granularidad de bloque 32, mientras que las convoluciones y las activaciones se mantienen en FP16. El modelo fuente, `nvidia/Nemotron-3-Diarization` (revision `a435e9867d79e789e90053f9b6d6834053af564a`), se distribuye bajo la misma licencia OpenMDW 1.1.

El aspecto tecnico mas relevante es el modo streaming. El modelo no procesa el audio completo de una vez, sino fragmentos de 30,4 segundos con un algoritmo de caché de hablantes por orden de llegada y una cola FIFO que arrastra el estado entre fragmentos; sin reproducir ese mecanismo, las etiquetas de hablante no son consistentes a lo largo de una grabacion. El bundle incluye un fichero `learnable_silence.f32` (2 KiB) con el embedding de silencio de la caché. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Diarizacion de hablantes en streaming: asigna actividad por hablante a cada trama de 10 ms, con soporte de hasta ocho hablantes simultaneos.
- Deteccion de actividad de voz (VAD): la salida de probabilidades por trama permite derivar segmentos de voz y silencio aplicando el umbral de 0,25 indicado en `config.json`.
- Mantenimiento de identidad de hablante entre fragmentos mediante caché por orden de llegada y estado FIFO, que preserva las etiquetas a lo largo de una sesion.
- Procesamiento multilingue declarado, sin lista explicita de idiomas; al operar sobre características acusticas, la deteccion de turnos no depende del lexico.
- Inferencia en CPU de Apple Silicon, sin necesidad de GPU dedicada ni de conexion de red.
- No realiza transcripcion de voz: no genera texto.
- No realiza identificacion biometrica de personas: no vincula voces a identidades reales.
- No soporta tool calling, function calling ni flujos de agentes; es un modelo puramente acustico.
- No dispone de capacidades de vision, texto ni audio generativo.
- Entrada limitada a caracteristicas log-mel preprocesadas con la forma `[1, 3040, 128]`, calculadas fuera del bundle con el preprocesador de NeMo.

## Casos de uso

- Transcripcion etiquetada por hablante en aplicaciones iOS: ejecutar el bundle junto a un modelo ASR tambien en dispositivo y fusionar las etiquetas de hablante del diarizador con las palabras transcritas, obteniendo actas o subtitulos con "Hablante 1", "Hablante 2" sin enviar audio fuera del terminal.
- Notas de reunion en local: grabar una reunion, procesarla por fragmentos de 30,4 s y generar un resumen con turnos de palabra; la caché de hablantes mantiene la coherencia de etiquetas en sesiones de decenas de minutos.
- Subtitulado en directo de contenido con varios interlocutores: usar la salida de 10 ms para cambiar el color o la posicion del subtitulo segun el hablante activo, con una latencia de proceso de unos 100 ms por fragmento.
- Analisis de llamadas de atencion al cliente: separar automaticamente los turnos de agente y cliente para calcular tiempos de habla, solapamientos e interrupciones, partiendo del VAD y de la diarizacion y sin necesidad de transcripcion.
- Preprocesado para ASR en la nube o en servidor: filtrar silencio y segmentar por hablante antes de enviar audio a un motor ASR, reduciendo el volumen de audio transmitido y el coste por minuto.
- Indexacion y busqueda en archivos de audio largos: dividir un archivo en segmentos atribuidos a hablantes para etiquetar, trocear y almacenar fragmentos buscables en una base de datos.
- Endpointing en asistentes de voz: detectar cuando un hablante termina su turno para disparar la respuesta del sistema, evitando cortes prematuros por pausas internas.
- Aplicaciones sin conectividad o con requisitos de privacidad estrictos: al ocupar unos 103 MiB y no requerir red, encaja en escenarios de campo, salud o legal donde el audio no puede salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de error de diarizacion (DER) en la informacion disponible. El autor indica explicitamente que las mediciones del bundle son una comprobacion de paridad numerica frente al checkpoint sin cuantizar, no un benchmark de DER. Las mediciones se tomaron en un Apple M5 Pro con macOS 26.6.2, sobre un fragmento de 30,4 s de cada una de tres grabaciones locales, con la mediana de tres ejecuciones en caliente y solo CPU; se excluyen la extraccion mel, la carga de ficheros, la actualizacion de la cache de hablantes y el postprocesado de segmentos.

| Medida | CoreML INT8 | Interpretacion |
|---|---|---|
| Tiempo medio de las etapas del modelo | 101,6 ms | Unas 300 veces mas rapido que la duracion del fragmento, en CPU |
| Diferencia absoluta media de probabilidad | 0,00046–0,00082 | Proximidad alta al checkpoint fuente |
| Desacuerdo en la decision de actividad con umbral 0,25 | 0,03–0,06 % de pares trama/canal | La cuantizacion altera muy pocas decisiones |
| DER de extremo a extremo | No medido | No disponible para este bundle |

## Requisitos de hardware

- Memoria: los dos grafos compilados suman unos 103 MiB, por lo que el conjunto cabe en la memoria unificada de cualquier Mac o iPhone compatible con iOS 18.
- GPU: no requiere GPU dedicada. Las mediciones publicadas son exclusivamente en CPU de un M5 Pro.
- Cabe en hardware de consumo: si, en cualquier equipo Apple Silicon (familia M) y en iPhone o iPad con iOS 18 o superior. No esta pensado para GPU NVIDIA ni AMD.
- Opciones de despliegue: CoreML a traves de `coremltools` (carga con `ct.models.CompiledMLModel`) y el SDK speech-swift del mismo autor. No es compatible con vLLM, llama.cpp, Ollama, TGI ni otras pilas de servidor, al estar en formato `.mlmodelc`.
- Latencia: aproximadamente 101,6 ms por fragmento de 30,4 s en CPU de M5 Pro (solo etapas del modelo). El rendimiento en iPhone no esta publicado.
- Throughput: no disponible; no se han publicado mediciones de fragmentos por segundo ni de concurrencia.
- Preprocesado requerido: extraccion de caracteristicas log-mel de 128 bandas compatible con el preprocesador de NeMo, fuera del bundle; el coste de ese paso no esta incluido en las cifras anteriores.

## Comparativa con modelos similares

La informacion disponible permite comparar el bundle con su modelo fuente, pero no aporta cifras de DER ni de latencia de otras alternativas de diarizacion, por lo que la comparacion con sistemas externos queda marcada como no disponible.

| Modelo | Parametros | Formato | Cuantizacion | Plataforma objetivo | Licencia | Rendimiento (DER) |
|---|---|---|---|---|---|---|
| aufklarer/Nemotron-3-Diarization-100M-CoreML-INT8 | 99,2 M (modelo fuente) | CoreML `.mlmodelc` compilado | INT8 bloque 32 en lineales, FP16 en conv/activaciones | Apple Silicon, iOS 18+ | OpenMDW 1.1 | No medido; paridad numerica alta frente al checkpoint (dif. media 0,00046–0,00082) |
| nvidia/Nemotron-3-Diarization (fuente) | 99,2 M | Pesos originales (formato no disponible en la informacion proporcionada) | Sin cuantizar | GPU/CPU generica | OpenMDW 1.1 | No disponible |
| Otras alternativas de diarizacion (p. ej. sistemas basados en pyannote o NeMo) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No transcribe ni identifica personas: cualquier expectativa de reconocimiento de voz o de identidad queda fuera del alcance del modelo.
- No se ha medido el error de diarizacion (DER) de este bundle, solo la paridad numerica con el checkpoint fuente. La calidad real de la diarizacion en produccion es, por tanto, una incognita no cuantificada.
- La coherencia de las etiquetas de hablante depende de reproducir el algoritmo de cache y FIFO del modelo fuente. Una integracion que ignore ese estado producira etiquetas inconsistentes entre fragmentos.
- El limite de ocho hablantes es duro; en escenas con mas interlocutores, la asignacion se degradara o colapsara voces.
- Discrepancias del 0,03–0,06 % en las decisiones de actividad, aunque pequenas, pueden acumularse a lo largo de una sesion larga al realimentar el estado de cache.
- La extraccion de caracteristicas mel debe coincidir con el preprocesador de NeMo; un preprocesado distinto invalida las probabilidades de salida.
- Solo funciona en el ecosistema Apple (CoreML, iOS 18+, Apple Silicon). No hay ruta de despliegue en servidores Linux con GPU.
- El pipeline declarado es `voice-activity-detection`, no `speaker-diarization`; conviene verificar el comportamiento por trama antes de usarlo como diarizador completo.
- Advertencia de licencia: OpenMDW 1.1 es una licencia de pesos abiertos con sus propias condiciones; debe revisarse el fichero `LICENSE` y el `NOTICE` antes de un uso comercial. La model card no detalla obligaciones de atribucion ni restricciones de uso.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia (23 de septiembre de 2026): se trata de una publicacion reciente y sin validacion independiente.
- Riesgo de sesgo: no se documenta la composicion del dataset de entrenamiento ni la distribucion de idiomas, acentos o condiciones acusticas, por lo que no puede evaluarse su comportamiento diferencial por poblacion.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados trataban de temas sin relacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aufklarer/Nemotron-3-Diarization-100M-CoreML-INT8
- Modelo fuente: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Descripcion de arquitectura y protocolo de benchmark de NVIDIA: https://huggingface.co/blog/nvidia/nemotron-diarization
- SDK speech-swift para Apple: https://github.com/soniqo/speech-swift
- Documentacion e guia de instalacion y CLI: https://soniqo.audio/getting-started
- Sitio web del autor: https://soniqo.audio
- Blog del autor: https://soniqo.audio/blog
- Revision del modelo fuente citada: `a435e9867d79e789e90053f9b6d6834053af564a`
