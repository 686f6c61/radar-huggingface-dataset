# lingyuxing/Gander

## Resumen

Gander es un modelo de interaccion omnicanal (audio, video, texto) desarrollado por el usuario lingyuxing y publicado en HuggingFace bajo licencia Apache 2.0. Se construye sobre `openbmb/MiniCPM-o-4_5` y su objetivo es mantener una conversacion hablada y visual continua mientras se ejecutan tareas de larga duracion de forma asincrona. A diferencia de los asistentes de voz por turnos, Gander modela la interaccion como unidades causales de un segundo: en cada unidad, el modelo observa el audio y el video recien disponibles y decide si escuchar, hablar, interrumpir o invocar una operacion de tarea.

La arquitectura se divide en dos componentes entrenables mas un runtime externo. El `thinker` realiza percepcion multimodal, control de la interaccion, generacion de lenguaje y operaciones de tarea, con un presupuesto de hasta 8 tokens lexicos por unidad de habla. El `talker` toma las representaciones del thinker y sintetiza habla de forma incremental mediante tokens S3 y un decodificador Token2wav, con 50 tokens S3 por unidad y emision en chunks de 25 tokens (aproximadamente 0,5 segundos). El runtime de Gander gestiona el ciclo de vida de las tareas delegadas.

El modelo es relevante para investigacion en asistentes multimodales en tiempo real, dialogo full-duplex, modelado de video-lenguaje en streaming y orquestacion de agentes. Se distribuye en BF16 con checkpoints en safetensors y ONNX, con un repositorio de 20,0 GB, y no declara idiomas soportados ni publica resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con dos modulos entrenables (thinker y talker) sobre `openbmb/MiniCPM-o-4_5`; el talker usa tokens S3 y decodificacion Token2wav |
| Parametros totales | no disponible (el repositorio ocupa 20,0 GB, lo que en BF16 corresponde aproximadamente a 10 000 millones de parametros entre ambos componentes) |
| Parametros activos | no disponible; no se documenta una arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | no disponible; la interaccion se organiza en unidades causales de 1 segundo, sin que se declare una ventana de contexto en tokens |
| Tipos de cuantizacion | BF16 como precision de referencia; no se documentan cuantizaciones GGUF, AWQ o GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX (etiquetas del repositorio); checkpoints separados en `thinker/` y `talker/` |
| Unidad temporal de interaccion | 1 segundo |
| Presupuesto de salida del thinker | hasta 8 tokens lexicos por unidad de habla |
| Presupuesto de salida del talker | 50 tokens S3 por unidad de habla |
| Chunk de habla en streaming | 25 tokens S3, aproximadamente 0,5 segundos |
| Frecuencia de muestreo de audio de entrada | 16 kHz |
| Frecuencia de muestreo de habla de salida | 24 kHz |
| Precision declarada | BF16 |
| Tamano del repositorio | 20,0 GB |
| Modalidades de entrada | texto, audio, imagen y fotogramas de video |

## Arquitectura y entrenamiento

Gander no es un unico transformer monolitico, sino un sistema de tres piezas. El `thinker` concentra la percepcion multimodal (texto, audio a 16 kHz, imagen y fotogramas de video), el control de la interaccion y la generacion de lenguaje, y produce tanto texto como llamadas estructuradas a operaciones de tarea. El `talker` no genera habla desde cero: se condiciona sobre las representaciones del thinker y produce tokens S3 de forma incremental, que un decodificador Token2wav convierte en onda de audio a 24 kHz. El tercer elemento, el runtime de Gander, es externo al modelo y se encarga de la gestion del ciclo de vida de las tareas y de la coordinacion con el proveedor de workers que las ejecuta. El contrato temporal compartido entre ambos modulos se documenta en `release_manifest.json`.

El entrenamiento parte de `MiniCPM-o-4_5` en dos etapas. El thinker entrena el modelo de lenguaje y la proyeccion de audio durante 1 epoca y 8407 pasos de optimizacion. El talker entrena la proyeccion semantica y el decodificador de habla durante 2 epocas y 3246 pasos. La mezcla de datos es multimodal y cubre dialogo hablado, interaccion full-duplex, comprension de video en streaming y ciclos de vida de tareas de agente. La representacion de entrenamiento replica la misma estructura de unidades causales de un segundo que se usa en inferencia, de modo que no hay discrepancia entre el regimen de entrenamiento y el de servicio. No se documentan tecnicas de alineacion como RLHF o DPO, ni innovaciones de decodificacion especulativa o atencion lineal.

## Capacidades

- Interaccion hablada continua con deteccion de turno: el thinker decide en cada unidad de un segundo si escuchar, hablar, interrumpir o invocar una operacion.
- Gestion de interrupciones y backchannels conversacionales, es decir, respuestas breves de acompanamiento tipicas de la conversacion humana.
- Comprension de imagen y video en streaming, con respuestas ancladas temporalmente a los fotogramas observados.
- Generacion de habla incremental sincronizada con la salida del thinker, en chunks de 25 tokens S3 (unos 0,5 segundos).
- Function calling y delegacion estructurada de tareas, incluyendo instrucciones de seguimiento, interaccion de progreso y notificacion de finalizacion.
- Orquestacion de agentes con ejecucion asincrona de tareas de larga duracion mediante el runtime de Gander.
- Entrada multimodal combinada de texto, audio, imagen y video en la misma secuencia de interaccion.
- Capacidades multilingues: no disponible, no se declaran idiomas soportados.
- Modo de pensamiento explicito (`thinking`): no disponible.
- Vision y audio: soportados de forma nativa mediante `init_vision` e `init_audio` en la carga del thinker.

## Casos de uso

- Asistente de voz full-duplex para atencion al cliente: el modelo mantiene la conversacion abierta sin esperar a que el usuario termine, gestiona interrupciones y emite respuestas de acompanamiento mientras consulta sistemas internos, gracias a la estructura de unidades de un segundo y al presupuesto de 8 tokens lexicos por unidad.
- Agente de soporte con ejecucion asincrona de tareas: las peticiones que requieren procesos largos (reembolsos, altas, consultas a sistemas externos) se delegan al runtime como operaciones estructuradas, y el modelo sigue conversando e informando del progreso sin bloquear el dialogo.
- Accesibilidad audiovisual: descripcion en directo de lo que ocurre en un video o en una camara para personas con discapacidad visual, aprovechando la comprension de fotogramas en streaming y la salida de habla incremental.
- Teleasistencia y acompanamiento continuo: sesiones largas con retroalimentacion verbal frecuente, donde la capacidad de backchannel y de interrupcion resulta mas natural que en un asistente por turnos.
- Analisis de reuniones en directo: el modelo escucha y observa, responde a preguntas puntuales durante la reunion y dispara tareas de seguimiento (resumen, asignacion de acciones) mediante function calling.
- Robotica de servicio e interfaces embebidas: bucle percepcion-accion-interaccion con entrada de camara y microfono y salida de voz, coordinando con el runtime la ejecucion de tareas fisicas o de backend.
- Investigacion en modelado de dialogo y latencia: banco de pruebas para medir politicas de turno, manejo de interrupciones y sincronizacion entre representaciones del thinker y generacion de habla.
- Prototipos de tutoria guiada por camara: el modelo observa un objeto o una pizarra, conversa sobre ello y lanza ejercicios o verificaciones como tareas estructuradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente documenta los pasos de entrenamiento (8407 pasos de optimizacion en el thinker y 3246 en el talker) y los presupuestos de salida por unidad temporal (8 tokens lexicos y 50 tokens S3), pero no incluye metricas de evaluacion como MMLU, HumanEval, GSM8K, ASR, latencia extremo a extremo ni tasas de exito en tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 20 GB (tamano del repositorio), por lo que el thinker necesita del orden de 24-28 GB de VRAM sumando cache KV y los codificadores de vision y audio. El talker, con sus propios pesos y el decodificador Token2wav, anade un consumo adicional que la configuracion de ejemplo resuelve en una segunda GPU.
- La configuracion oficial de servicio usa `detached_talker_device: cuda:1`, es decir, un minimo de dos GPUs para la experiencia completa de audio y video en tiempo real.
- GPU recomendadas: A100 40/80 GB y H100 para servir thinker y talker con margen; RTX A6000 48 GB o 2 x RTX 4090 para despliegues de investigacion.
- Viabilidad en GPU de consumo: una RTX 4090 de 24 GB queda muy justa para el thinker en BF16 y no permite alojar tambien el talker; se requieren dos GPUs de 24 GB o una unica GPU de 48 GB. No se distribuyen pesos cuantizados que reduzcan este requisito.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` para cargar el thinker (con `init_vision` e `init_audio`), ejecucion ONNX y el runtime de Gander (repositorio Omni-Interaction-Agent) para la inferencia completa en tiempo real. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: la granularidad declarada es de unidades de 1 segundo y chunks de habla de aproximadamente 0,5 segundos, que actuan como cota practica de la latencia de generacion de voz. No se publican cifras de throughput ni de latencia extremo a extremo.

## Comparativa con modelos similares

No se dispone de especificaciones verificadas de modelos alternativos en la informacion proporcionada. La tabla identifica las alternativas logicas por categoria (modelos omnicanal y de dialogo full-duplex), pero los campos se dejan como no disponibles cuando no constan en la documentacion aportada.

| Modelo | Parametros | Contexto | Modalidades | Licencia | Estado |
|---|---|---|---|---|---|
| Gander (lingyuxing) | no disponible (~20 GB en BF16) | no disponible | texto, audio, imagen, video | Apache 2.0 | publicado, 0 descargas y 0 likes |
| openbmb/MiniCPM-o-4_5 | no disponible | no disponible | multimodal (modelo base) | no disponible en la informacion aportada | modelo base declarado |
| Qwen2.5-Omni | no disponible | no disponible | texto, audio, imagen, video | no disponible en la informacion aportada | alternativa de categoria |
| Moshi (Kyutai) | no disponible | no disponible | audio | no disponible en la informacion aportada | alternativa de categoria |
| GLM-4-Voice | no disponible | no disponible | texto, audio | no disponible en la informacion aportada | alternativa de categoria |

Diferencia cualitativa comprobable: Gander incorpora de forma explicita un contrato de unidades causales de un segundo entre percepcion, decision de turno y sintesis de voz, con presupuestos de salida fijos por unidad, algo que no se documenta en los demas modelos de la tabla dentro de la informacion disponible.

## Limitaciones y advertencias

- El propio autor advierte de que las salidas pueden contener errores factuales o de percepcion, en especial con audio ambiguo, cambios visuales rapidos o dependencias temporales largas.
- Las acciones externas consecuentes deben validarse antes de ejecutarse: el runtime delega tareas en un proveedor de workers y el modelo no garantiza que la operacion invocada sea la correcta.
- No hay ningun benchmark ni evaluacion publicada, por lo que el rendimiento real frente a modelos de la misma categoria no es verificable.
- El repositorio registra 0 descargas y 0 likes, sin historial de uso ni validacion por parte de la comunidad.
- Los enlaces a GitHub, paper y demo de la model card aparecen como marcadores de posicion; el propio README indica que las URLs publicas deben sustituirse antes de la publicacion. Conviene verificar su disponibilidad antes de citarlos.
- No se declaran idiomas soportados, lo que impide asumir un comportamiento fiable en castellano.
- La licencia declarada es Apache 2.0, pero al tratarse de un derivado de `openbmb/MiniCPM-o-4_5` conviene revisar las condiciones de la licencia del modelo base antes de un uso comercial.
- Solo se distribuyen pesos en BF16: no hay GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware de consumo o en entornos con VRAM reducida.
- La via de uso con `transformers` carga unicamente el thinker (con `init_tts=False`); la funcionalidad completa de voz y video en streaming exige el runtime externo, lo que anade complejidad de despliegue y una segunda GPU en la configuracion de ejemplo.
- El modelo esta declarado para investigacion; no se documenta un proceso de alineacion (RLHF/DPO) que mitigue sesgos o comportamientos indeseados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lingyuxing/Gander
- Modelo base: https://huggingface.co/openbmb/MiniCPM-o-4_5
- Repositorio GitHub del runtime: https://github.com/Omni-Interaction-Gander/Omni-Interaction-Agent
- Paper: https://arxiv.org/abs/2609.08977
- Pagina de demo: https://Omni-Interaction-Gander.github.io/Omni-Interaction-Agent
- Dataset: anunciado como "coming soon" en la model card, sin URL publica
