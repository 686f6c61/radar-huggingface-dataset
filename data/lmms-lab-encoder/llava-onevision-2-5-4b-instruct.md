# lmms-lab-encoder/LLaVA-OneVision-2.5-4B-Instruct

## Resumen

LLaVA-OneVision-2.5-4B-Instruct es un modelo de lenguaje y vision de 4B (5.250 millones de parametros reales segun los pesos en safetensors) desarrollado por el equipo lmms-lab-encoder, vinculado al proyecto EvolvingLMMs-Lab. Esta disenado para tareas de comprension de imagen unica, multiples imagenes y video, e incorpora una capacidad poco habitual: el procesamiento de video en modo *streaming*, donde los fotogramas llegan uno a uno y el modelo decide en cada paso si permanecer en silencio, responder o generar una descripcion.

El modelo emplea una arquitectura multimodal tipo LLaVA-OneVision con un *vision tower* de patch-16 y fusion 3x3 que logra una compresion espacial de 9x (un token visual por cada 48x48 pixeles), lo que permite encajar videos largos en una ventana de contexto de 262.000 tokens. Ademas del muestreo uniforme de fotogramas, incorpora un modo *codec* que aprovecha el coste en bits del codificador de video para empaquetar las regiones informativas en un numero reducido de lienzos.

Su relevancia actual radica en unificar inferencia offline y streaming con los mismos pesos y la misma plantilla de chat, activando el modo mediante `apply_chat_template(..., streaming=True)`. Se distribuye bajo licencia Apache 2.0, lo que facilita su adopcion comercial, y su tamano contenido lo hace desplegable en hardware de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal tipo LLaVA-OneVision (transformer con vision tower patch-16 y fusion 3x3) |
| Parametros totales | 5.253.089.792 (aproximadamente 5,25B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue la familia LLaVA-OneVision, con un *vision encoder* de patch-16 y un mecanismo de fusion 3x3 que reduce la secuencia visual a un token por cada 48x48 pixeles, es decir, una compresion espacial de 9x. Esta compresion es la que permite manejar videos de hasta 1024 fotogramas en el contexto de 262.000 tokens. El modelo soporta dos estrategias de muestreo de video: muestreo uniforme de fotogramas y el llamado modo *codec*, que utiliza el coste en bits del codificador de video para seleccionar y empaquetar las regiones informativas en pocos lienzos.

El entrenamiento esta orientado tanto a tareas offline como a video en streaming. En este ultimo modo, ocho tokens de protocolo codifican la decision por fotograma (permanecer en silencio, responder o generar un caption), de modo que los mismos pesos sirven para ambos regimenes sin cambios en la plantilla de chat. No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card indica que el informe tecnico esta pendiente de publicacion.

## Capacidades

- Generacion de texto y comprension de imagen unica y multiples imagenes.
- Comprension de video offline con muestreo uniforme de fotogramas.
- Comprension de video en streaming: decision por fotograma de silencio, respuesta o caption mediante tokens de protocolo.
- Modo codec de video: empaquetado de regiones informativas segun el coste en bits del codificador.
- Procesamiento de video largo (hasta 1024 fotogramas en modo codec, hasta 950-2048 fotogramas segun configuracion en modo frames).
- Grounding temporal en video (localizacion de eventos, medido con TimeLens y JumpScore).
- Conversacion multimodal multi-turno mediante plantilla de chat.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible en la informacion proporcionada.

## Casos de uso

- Vigilancia y analisis de video en tiempo real: el modo streaming permite procesar fotogramas a medida que llegan y decidir cuando emitir una alerta o descripcion, adecuado para monitorizacion de camaras donde no interesa generar texto en cada fotograma.
- Resumen de videos largos: con 262.000 tokens de contexto y modo codec, puede condensar reuniones, clases o grabaciones de varias horas en resumenes estructurados sin perder eventos relevantes.
- Localizacion temporal de eventos: las capacidades de grounding temporal (TimeLens, JumpScore) permiten responder a preguntas del tipo "en que momento ocurre X" en un video, util para edicion automatica o indexado de contenido audiovisual.
- Indexado y busqueda semantica de videotecas: combinado con un pipeline de recuperacion, el modelo puede generar descripciones y metadatos por segmento para alimentar un buscador sobre archivos de video.
- Analisis de contenido deportivo o de accion: MotionBench y MVBench muestran buen rendimiento en comprension de movimiento, aplicable a analisis tactico o deteccion de acciones en retransmisiones.
- Asistencia multimodal en entornos de desarrollo: con soporte de imagenes, puede analizar capturas de pantalla, diagramas o mockups y responder preguntas sobre ellos en flujos de trabajo de documentacion tecnica.
- Descripcion automatica de video para accesibilidad: generacion de subtitulos y audiodescripciones por fotograma o segmento, gracias al modo streaming con tokens de caption.

## Benchmarks y rendimiento

Resultados publicados en la model card. Las celdas indican la configuracion entre parentesis (TC = modo codec con numero de lienzos; f = numero de fotogramas).

| Benchmark | OV2.5-4B (codec) | OV2.5-4B (frames) | Qwen3.5-4B |
|---|---|---|---|
| VideoMME (sin subtitulos) | 71,9 | 69,7 | 71,7 |
| VideoMME (con subtitulos) | 74,7 | 75,2 | 75,9 |
| MotionBench | 64,2 (TC128) | 62,4 (128f) | 60,1 (128f) |
| TOMATO | 36,0 (TC16) | 39,2 (16f) | 32,4 (16f) |
| MVBench | 75,5 (TC64) | 72,0 (64f) | 64,0 (64f) |
| NextQA MC test | 86,4 (TC64) | 86,1 (64f) | 80,7 (64f) |
| TempCompass MC | 79,7 (TC64) | 75,8 (64f) | 73,4 (64f) |
| Video-MME-v2 | 17,2 (TC64) | 16,4 (64f) | 15,5 (64f) |
| EgoSchema subset | 79,8 (TC64) | 80,0 (64f) | 68,2 (64f) |
| Video-Index | 23,1 (TC512) | 20,0 (1fps) | 19,6 (1fps) |
| LVBench | 61,6 (TC1024) | 62,0 (950f) | 56,5 (2048f) |
| MLVU dev | 77,1 (TC512) | 75,3 (512f) | 73,8 (512f) |
| LongVideoBench val | 71,1 (TC768) | 69,0 (1280f) | 62,7 (700f) |
| VideoEval-Pro | 64,6 (TC768) | 64,4 (950f) | 62,8 (2048f) |
| TimeLens ActivityNet (mIoU) | 59,1 (TC128) | 58,8 (2048f) | 53,8 (2048f) |
| TimeLens Charades (mIoU) | 61,3 (TC128) | 60,6 (2048f) | 48,1 (2048f) |
| TimeLens QVHighlights (mIoU) | 70,3 (TC128) | 68,4 (2048f) | 67,5 (2048f) |

No se han publicado en la informacion disponible resultados de benchmarks de texto puro (MMLU, GSM8K) ni de codigo (HumanEval).

## Requisitos de hardware

- VRAM estimada para inferencia: con 5,25B parametros, en FP16 requiere aproximadamente 10,5 GB solo para pesos, mas el coste del vision tower y de la cache KV (que con 262.000 tokens de contexto puede ser muy elevada). En cuantizacion de 8 bits cabe en torno a 6-7 GB; en 4 bits, alrededor de 3-4 GB.
- GPU recomendadas: A100 40/80 GB o H100 para contextos largos y video de muchos fotogramas; L40S o A10G para despliegues de produccion con contexto moderado.
- Cabe en GPU de consumo: si, en tarjetas con 16-24 GB (RTX 4090, RTX 4080, RTX 3090) para FP16 con contexto reducido, y en 8-12 GB con cuantizacion agresiva.
- Opciones de despliegue: transformers (libreria indicada en la model card, requiere `custom_code`); el soporte en vLLM, llama.cpp, Ollama o TGI no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | VideoMME (sin subs) | Licencia | Notas |
|---|---|---|---|---|---|
| LLaVA-OneVision-2.5-4B-Instruct | 5,25B | 262.000 | 71,9 | Apache 2.0 | Modo streaming y codec integrados |
| Qwen3.5-4B | No disponible | No disponible | 71,7 | No disponible | Referencia de la model card; mejor en VideoMME con subtitulos (75,9) |
| Alternativas de 4B multimodales | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos adicionales en la informacion proporcionada |

En los benchmarks de video largo y grounding temporal el modelo supera de forma consistente a Qwen3.5-4B (LVBench 61,6 frente a 56,5; LongVideoBench 71,1 frente a 62,7; TimeLens Charades 61,3 frente a 48,1), mientras que en VideoMME con subtitulos queda ligeramente por detras.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos conocidos; al ser un modelo multimodal entrenado con datos web, es probable que herede sesgos presentes en ellos.
- Riesgo de alucinacion en descripciones de imagenes y video, especialmente en escenas ambiguas o con oclusiones; conviene validar las salidas en produccion.
- El rendimiento en Video-MME-v2 es bajo en terminos absolutos (17,2), lo que sugiere dificultades en tareas de video de nueva generacion.
- El modo streaming depende de ocho tokens de protocolo especificos; su uso incorrecto o fuera de la plantilla de chat puede degradar la calidad de las respuestas.
- El contexto de 262.000 tokens implica un coste de cache KV elevado; en despliegues con muchos fotogramas puede requerir hardware de gama alta.
- Idiomas soportados no declarados: no hay garantia de calidad multilingue fuera del ingles.
- Licencia Apache 2.0 permite uso comercial, pero el modelo requiere `custom_code` en transformers, lo que anade complejidad de integracion.
- El informe tecnico y la pagina del proyecto estan pendientes de publicacion, por lo que faltan detalles sobre datos de entrenamiento y alineacion.

## Enlaces

- Hugging Face: https://huggingface.co/lmms-lab-encoder/LLaVA-OneVision-2.5-4B-Instruct
- Repositorio GitHub: https://github.com/EvolvingLMMs-Lab/LLaVA-OneVision-2.5
- Pagina del proyecto: pendiente de publicacion (segun la model card)
- Informe tecnico: pendiente de publicacion (segun la model card)
- README en chino: README_CN.md en el repositorio de Hugging Face
