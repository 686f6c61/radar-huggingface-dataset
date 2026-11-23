# desert-ant-labs/who

## Resumen

Who es un modelo de diarización de hablantes (speaker diarization) desarrollado por Desert Ant Labs, diseñado para etiquetar quién habla y cuándo en grabaciones de audio y vídeo, directamente en el dispositivo. El modelo identifica turnos de palabra por persona con marcas de tiempo precisas, lo que permite etiquetar transcripciones por hablante, saltar al siguiente turno de un participante o cortar el audio en cada cambio de voz. Está pensado para pódcasts, entrevistas, llamadas y reuniones, y admite grabaciones de cualquier duración procesándolas por secciones de cinco minutos con emparejamiento de voces entre secciones.

La propuesta diferencial es la inferencia totalmente local: el modelo se ejecuta en el Neural Engine en plataformas Apple, mediante LiteRT en Linux, Windows y Android, y a través de WebAssembly en navegador y Node, con una build adicional en ONNX. El peso Core ML es de 81 MB en float16 o 42 MB con pesos de 8 bits, y ambas variantes mantienen la misma tasa de error de diarización (12,6 %) sobre reuniones AMI. El modelo está en estado beta y se distribuye bajo una licencia propia de tipo source-available.

El repositorio ocupa 0,4 GB y acumula 1509 descargas y 26 likes en Hugging Face. La librería declarada es litert y el pipeline asignado es voice-activity-detection, aunque la tarea real es diarización de hablantes. No se dispone de información sobre arquitectura interna, número de parámetros ni longitud de contexto, ya que la model card no los detalla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (procesa audio por secciones de 5 minutos con emparejamiento entre secciones) |
| Tipos de cuantizacion | float16 y pesos de 8 bits (builds Core ML); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (el modelo opera sobre audio, no sobre texto; no se declaran idiomas) |
| Licencia | desert-ant-labs-source-available (source-available, no open source) |
| Formato de pesos | Core ML, LiteRT/TFLite, ONNX, WebAssembly |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo (tipo de red, número de parámetros ni diseño de las capas) en la documentación disponible. La model card describe el comportamiento a nivel de sistema: el modelo procesa cada sección de cinco minutos en una sola pasada y posteriormente empareja las voces entre secciones para mantener la consistencia de identidad de hablante a lo largo de grabaciones largas. Los hablantes se numeran en orden de primera aparición y, cuando dos personas hablan simultáneamente, el modelo marca a ambas.

Tampoco se detallan los datos de entrenamiento, el número de tokens o horas de audio utilizadas, la composición del dataset ni si hubo etapas de ajuste fino supervisado o preferencias. La información disponible se limita a los resultados de evaluación sobre varios corpus públicos (AMI, VoxConverse, NOTSOFAR-1, Earnings-21, DiPCo y CHiME-6) y a las plataformas de despliegue soportadas. La innovación destacable es la orientación a inferencia on-device multiplataforma con un mismo modelo exportado a Core ML, LiteRT, ONNX y WebAssembly, manteniendo la tasa de error entre las variantes float16 y de 8 bits.

## Capacidades

- Diarización de hablantes con marcas de tiempo de inicio y fin por turno de palabra.
- Numeración automática de hablantes en orden de primera aparición.
- Detección y marcado de solapamiento cuando dos personas hablan a la vez.
- Procesamiento de grabaciones de cualquier duración mediante secciones de cinco minutos con emparejamiento de voces entre secciones.
- Entrada de audio decodificado en mono a cualquier frecuencia de muestreo (se aceptan muestras y sample rate arbitrarios).
- Ejecución on-device en iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.
- Backends de inferencia: Neural Engine (Apple), LiteRT (Linux, Windows, Android), WebAssembly (navegador y Node) y ONNX.
- SDK con APIs en Swift, Kotlin y JavaScript/TypeScript.
- No se declaran capacidades de generación de texto, razonamiento, código, tool calling ni agentes; es un modelo exclusivamente de audio.

## Casos de uso

- Etiquetado de transcripciones por hablante: tras generar una transcripción con un modelo ASR, los turnos con timestamps de Who permiten asignar cada fragmento al hablante correcto, útil en entrevistas y reuniones.
- Edición de pódcasts: detección automática de los turnos de cada invitado para saltar al siguiente turno o cortar el audio en cada cambio de voz, agilizando el montaje.
- Actas de reuniones: en combinación con ASR, producir resúmenes atribuidos por participante en reuniones presenciales o remotas, con la ventaja de que el procesado ocurre en el dispositivo y el audio no sale de él.
- Análisis de llamadas de atención al cliente: identificación de turnos de agente y cliente en grabaciones de call center (evaluado sobre Earnings-21) para métricas de tiempo de habla y participación.
- Aplicaciones móviles de privacidad: integración vía Core ML o LiteRT en apps iOS y Android que necesitan diarización sin enviar audio a la nube, gracias a los 42 MB del build de 8 bits.
- Herramientas web y Node: diarización en el navegador o en servidores Node mediante WebAssembly, sin dependencias nativas, para procesar entrevistas subidas por el usuario.
- Investigación en diarización: uso del build ONNX como referencia reproducible sobre AMI, VoxConverse y NOTSOFAR-1 para comparativas con otros sistemas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Dataset | Condiciones | Muestras | DER |
|---|---|---|---|
| AMI meetings | headset mix, reuniones completas | 16 | 0,126 |
| VoxConverse | grabaciones completas, hasta 4 hablantes | 86 | 0,084 |
| VoxConverse | grabaciones completas, 2-21 hablantes | 232 | 0,175 |
| NOTSOFAR-1 | far-field, reuniones completas, hasta 4 hablantes | 65 | 0,162 |
| NOTSOFAR-1 | far-field, reuniones completas, 3-8 hablantes | 129 | 0,243 |
| Earnings-21 | llamadas completas, 2-20 hablantes | 44 | 0,277 |
| DiPCo | cenas far-field, sesiones completas | 10 | 0,411 |
| CHiME-6 | cenas far-field, sesiones completas | 2 | 0,399 |

Según la model card, el build Core ML en float16 y el de 8 bits obtienen la misma tasa de error en AMI (12,6 %). Como referencia de velocidad, se indica que un segmento de 50 minutos se procesa en 3 segundos en un MacBook Pro, íntegramente en el dispositivo.

## Requisitos de hardware

- Huella de almacenamiento: 81 MB (Core ML float16) o 42 MB (Core ML con pesos de 8 bits); el repositorio completo ocupa 0,4 GB.
- Ejecución en Neural Engine en Apple Silicon (iOS, macOS, tvOS, visionOS), sin necesidad de GPU dedicada.
- Ejecución mediante LiteRT en Linux, Windows y Android; mediante WebAssembly en navegador y Node; build ONNX disponible para otros runtimes.
- No se especifican requisitos de VRAM ni GPU concretas (A100, H100, RTX 4090); el diseño es on-device y no está orientado a servidores con GPU.
- Throughput declarado: 50 minutos de audio en 3 segundos en un MacBook Pro.
- Opciones de despliegue: SDK propio (Swift Package, paquete Kotlin `ai.desertant:who`, paquetes npm `@desert-ant-labs/who` y `@litertjs/core`), además de los formatos Core ML, LiteRT/TFLite, ONNX y WebAssembly. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).

## Comparativa con modelos similares

No se dispone de datos de otros modelos de diarización en la información proporcionada para establecer una comparativa con cifras verificables. La model card no incluye comparaciones con alternativas. Como referencia cualitativa, la categoría incluye sistemas como pyannote.audio o los pipelines de diarización de WhisperX, pero no se han aportado sus métricas en esta ficha, por lo que la comparación cuantitativa se indica como no disponible.

| Modelo | Parametros | Contexto | DER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Who (desert-ant-labs) | no disponible | secciones de 5 min | 0,084-0,411 según corpus | source-available | Hugging Face, SDK multiplataforma |
| Alternativas de la categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Estado beta: el propio autor marca el modelo como beta, lo que implica posibles cambios de API y comportamiento entre versiones.
- Licencia source-available (desert-ant-labs-source-available): no es una licencia open source; es imprescindible revisar los términos en https://license.desertant.com/ antes de cualquier uso comercial.
- No se declaran idiomas soportados; al operar sobre audio, el rendimiento puede variar según idioma, acento y calidad de la grabación, sin datos publicados al respecto.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente.
- El rendimiento se degrada en escenarios far-field y con muchos hablantes: el DER sube a 0,411 en DiPCo y 0,399 en CHiME-6, y a 0,277 en Earnings-21, frente a 0,084 en VoxConverse con hasta 4 hablantes.
- No se detallan sesgos conocidos ni riesgos de alucinación (no genera texto), pero la atribución errónea de hablantes en audio ruidoso o con solapamientos es un riesgo inherente a la tarea.
- El procesamiento por secciones de cinco minutos con emparejamiento posterior puede introducir errores de identidad en grabaciones muy largas con cambios de hablantes entre secciones.
- No hay información pública sobre arquitectura ni parámetros, lo que dificulta auditar el modelo o estimar su comportamiento fuera de los corpus evaluados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/who
- Pesos v0.3.4: https://huggingface.co/desert-ant-labs/who/tree/v0.3.4
- Demo: https://desertant.com/models/who/
- Licencia: https://license.desertant.com/
- Repositorio del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core
- Documentación del modelo en el repositorio: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/docs/models/who.md
