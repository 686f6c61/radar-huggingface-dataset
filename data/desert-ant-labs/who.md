# desert-ant-labs/who

## Resumen

Who es un modelo de diarización de hablantes (speaker diarization) desarrollado por Desert-Ant-Labs, diseñado para etiquetar quién habla y cuándo en grabaciones de audio y vídeo. El modelo segmenta el audio en turnos por hablante, con marcas temporales de inicio y fin, y numera a los hablantes en el orden en que aparecen por primera vez. Su propuesta diferencial es la ejecución íntegra en el dispositivo (on-device): corre sobre el Neural Engine en plataformas Apple, mediante LiteRT en Linux, Windows y Android, y a través de WebAssembly en navegador y Node, con una build adicional en ONNX.

El modelo está etiquetado como beta y se distribuye en un repositorio de 0,4 GB con pesos en formato LiteRT/TFLite, Core ML y ONNX. La build de Core ML ocupa 81 MB en float16 o 42 MB con pesos de 8 bits, y ambas mantienen la misma tasa de error en el corpus AMI (12,6 %). Está pensado para podcasts, entrevistas, llamadas y reuniones, y admite grabaciones de cualquier duración procesando secciones de cinco minutos en una pasada y emparejando voces entre secciones.

La relevancia actual del modelo reside en su orientación a despliegue local sin servidor: procesa una entrevista de 50 minutos en 3 segundos en un MacBook Pro, lo que lo hace adecuado para aplicaciones de privacidad estricta, entornos sin conectividad y flujos en tiempo real sobre hardware de consumo. La licencia es propietaria de tipo source-available, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de audio para diarización; pesos en LiteRT/TFLite, Core ML y ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible (procesa audio en secciones de 5 minutos con emparejamiento de voces entre secciones) |
| Tipos de cuantización | float16 y pesos de 8 bits (build Core ML: 81 MB y 42 MB respectivamente) |
| Idiomas soportados | no disponible |
| Licencia | desert-ant-labs-source-available (source-available, propietaria) |
| Formato de pesos | LiteRT/TFLite, Core ML, ONNX |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la información proporcionada. La model card describe el comportamiento a nivel de sistema: el modelo procesa cada sección de cinco minutos en una sola pasada y realiza un emparejamiento de voces entre secciones para mantener la consistencia de la identidad de los hablantes a lo largo de grabaciones largas. Numera a los hablantes en orden de primera aparición y marca simultáneamente a dos personas cuando hablan a la vez (solapamiento).

Tampoco se especifican el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de ajuste como RLHF o DPO, algo esperable dado que se trata de un modelo de audio y no de lenguaje. Las innovaciones destacables documentadas son de despliegue: ejecución en Neural Engine (Apple), LiteRT (Linux, Windows, Android) y WebAssembly (navegador y Node), con una build ONNX adicional, y paridad de tasa de error entre las variantes float16 y de 8 bits en el corpus AMI.

## Capacidades

- Diarización de hablantes: identifica quién habla y genera turnos con marcas temporales de inicio y fin (en segundos desde el comienzo).
- Numeración de hablantes en orden de primera aparición, con recuento total de hablantes en el resultado.
- Detección de solapamiento: cuando dos personas hablan a la vez, marca a ambas.
- Procesamiento de grabaciones de cualquier duración mediante secciones de cinco minutos y emparejamiento de voces entre secciones.
- Entrada de audio decodificado en mono a cualquier frecuencia de muestreo (por ejemplo, 48 kHz), además de ficheros directamente.
- Ejecución on-device en iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.
- SDK con APIs en Swift, Kotlin y JavaScript/TypeScript.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; el modelo es específicamente de audio.

## Casos de uso

- Etiquetado de transcripciones por hablante: a partir de los turnos con marcas temporales, se puede alinear una transcripción existente con cada interlocutor, lo que resulta adecuado para entrevistas y podcasts donde se necesita atribuir cada frase a una persona.
- Navegación de entrevistas largas: las marcas de inicio y fin permiten saltar al siguiente turno de un invitado concreto o segmentar la grabación en clips por hablante, aprovechando que el modelo procesa audio de cualquier duración.
- Corte automático por cambio de hablante: los límites de turno permiten dividir el audio en fragmentos cuando cambia la persona que habla, útil en producción de vídeo y edición de pódcast.
- Análisis de reuniones: en grabaciones de reuniones (el modelo reporta resultados en AMI y NOTSOFAR-1) se pueden extraer tiempos de intervención por participante para métricas de participación y actas enriquecidas.
- Procesamiento de llamadas de atención al cliente: la diarización permite separar agente y cliente en grabaciones de llamadas (evaluado en Earnings-21), habilitando análisis de conversación y control de calidad.
- Aplicaciones móviles y de escritorio con privacidad estricta: al ejecutarse en el dispositivo mediante Core ML, LiteRT o WebAssembly, el audio no sale del terminal, lo que encaja en escenarios regulados o sin conectividad.
- Procesamiento en navegador y Node: la build WebAssembly permite diarizar en el cliente sin backend de inferencia, útil para herramientas web de edición o transcripción.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en tasa de error de diarización (DER, menor es mejor):

| Dataset | Condiciones | Muestras | DER |
|---|---|---|---|
| AMI meetings | headset mix, reuniones completas | 16 | 0,126 |
| VoxConverse | grabaciones completas, hasta 4 hablantes | 86 | 0,084 |
| VoxConverse | grabaciones completas, 2-21 hablantes | 232 | 0,175 |
| NOTSOFAR-1 meetings | far-field, reuniones completas, hasta 4 hablantes | 65 | 0,162 |
| NOTSOFAR-1 meetings | far-field, reuniones completas, 3-8 hablantes | 129 | 0,243 |
| Earnings-21 calls | llamadas completas, 2-20 hablantes | 44 | 0,277 |
| DiPCo dinner parties | far-field, sesiones completas | 10 | 0,411 |
| CHiME-6 dinner parties | far-field, sesiones completas | 2 | 0,399 |

Además, el autor declara que las builds Core ML float16 y de 8 bits obtienen la misma DER en AMI (12,6 %). Como referencia de latencia, una entrevista de 50 minutos se procesa en 3 segundos en un MacBook Pro, según la model card.

## Requisitos de hardware

- El modelo está diseñado para inferencia on-device; no requiere GPU de servidor ni VRAM dedicada en el sentido habitual de modelos de lenguaje.
- Tamaño de pesos: 81 MB (Core ML float16) y 42 MB (Core ML con pesos de 8 bits), según la model card; el repositorio completo ocupa 0,4 GB.
- Plataformas soportadas: iOS, macOS, tvOS, visionOS (Neural Engine), Android, Linux y Windows (LiteRT), navegador y Node (WebAssembly), con build ONNX adicional.
- Cabe holgadamente en hardware de consumo, incluidos dispositivos móviles y portátiles; el autor cita un MacBook Pro como referencia de rendimiento (3 s para 50 minutos de audio).
- Opciones de despliegue: SDK propio con paquetes Swift (desert-ant-core), Kotlin (ai.desertant:who) y JavaScript (@desert-ant-labs/who con @litertjs/core), además de la build ONNX para runtimes compatibles.
- Latencia y throughput: no se publican cifras más allá del ejemplo de 50 minutos en 3 segundos en MacBook Pro; no disponible para otras plataformas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de modelos comparables (parámetros, contexto, rendimiento, licencia) para establecer una comparativa rigurosa. Los benchmarks del modelo se publican contra datasets de referencia (AMI, VoxConverse, NOTSOFAR-1, Earnings-21, DiPCo, CHiME-6), pero no contra otros sistemas de diarización concretos.

| Aspecto | Who | Alternativas comparables |
|---|---|---|
| Tarea | Diarización de hablantes on-device | no disponible |
| Parámetros | no disponible | no disponible |
| Contexto | secciones de 5 minutos con emparejamiento entre secciones | no disponible |
| DER (AMI) | 0,126 | no disponible |
| Licencia | source-available propietaria | no disponible |
| Despliegue | Core ML, LiteRT, ONNX, WebAssembly | no disponible |

## Limitaciones y advertencias

- Estado beta: el propio autor etiqueta el modelo como beta, lo que implica posibles cambios de API y de comportamiento entre versiones.
- Resultados no verificados: todos los valores de DER del model-index figuran con `verified: false`; son cifras declaradas por el autor.
- Rendimiento degradado en escenarios difíciles: la DER sube notablemente en fiestas y cenas con micrófono lejano (DiPCo 0,411; CHiME-6 0,399) y en llamadas con muchos hablantes (Earnings-21 0,277), frente a los mejores resultados en VoxConverse con hasta 4 hablantes (0,084).
- Idiomas no declarados: no se especifica qué lenguas cubre el modelo ni su robustez multilingüe.
- Licencia restrictiva: la licencia desert-ant-labs-source-available es propietaria de tipo source-available; es imprescindible revisar los términos en https://license.desertant.com/ antes de cualquier uso comercial o redistribución.
- Sin información sobre sesgos: no se documentan sesgos conocidos por acento, género, edad ni condiciones acústicas.
- Riesgo de confusión de hablantes: el emparejamiento de voces entre secciones de cinco minutos puede fallar en grabaciones con voces similares o cambios de canal; no se documentan métricas específicas de esta componente.
- Dependencia de SDK propietario: el uso práctico pasa por los paquetes de Desert-Ant-Labs, con descarga de pesos en el primer uso.
- No apto para tareas de lenguaje: no genera texto ni razona; debe combinarse con un sistema de ASR para obtener transcripciones etiquetadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/who
- Pesos v0.3.4: https://huggingface.co/desert-ant-labs/who/tree/v0.3.4
- Demo: https://desertant.com/models/who/
- Repositorio del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core
- Licencia: https://license.desertant.com/
- Documentación de requisitos Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Documentación de requisitos Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Documentación de requisitos JavaScript/TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
