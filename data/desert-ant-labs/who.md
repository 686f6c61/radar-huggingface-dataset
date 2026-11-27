# desert-ant-labs/who

## Resumen

Who es un modelo de diarización de hablantes (speaker diarization) desarrollado por Desert-Ant-Labs, diseñado para etiquetar quién habla en cada momento de una grabación de audio o vídeo, produciendo turnos por persona con marcas de tiempo. El modelo está pensado para ejecutarse íntegramente en el dispositivo (on-device), sin depender de servicios en la nube, y soporta grabaciones de cualquier duración procesándolas en secciones de cinco minutos con emparejamiento de voces entre secciones.

El modelo se distribuye en múltiples formatos de ejecución: Core ML para plataformas Apple (con aceleración por Neural Engine), LiteRT para Linux, Windows y Android, WebAssembly para navegador y Node, y una build ONNX. Los pesos en Core ML ocupan 81 MB en float16 o 42 MB con cuantización de 8 bits, manteniendo ambos la misma tasa de error en el conjunto AMI (12,6 %). El repositorio completo ocupa 0,4 GB.

Es relevante para desarrolladores que necesitan diarización de hablantes de baja latencia y privacidad por diseño (procesamiento local), en escenarios como podcasts, entrevistas, llamadas y reuniones. El modelo está en estado beta y su licencia es propietaria de tipo source-available, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de diarización de hablantes; pesos distribuidos en Core ML, LiteRT/TFLite, ONNX y WebAssembly) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa audio en secciones de 5 minutos con emparejamiento de voces entre secciones |
| Tipos de cuantizacion | float16 (81 MB en Core ML) y pesos de 8 bits (42 MB en Core ML) |
| Idiomas soportados | no disponible (el modelo opera sobre señal de audio, no sobre texto) |
| Licencia | desert-ant-labs-source-available (propietaria, source-available) |
| Formato de pesos | Core ML, LiteRT/TFLite, ONNX, WebAssembly |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo (tipo de red, capas, mecanismo de atención) ni sobre el volumen o composición del dataset de entrenamiento. La model card describe el comportamiento funcional: el modelo numera a los hablantes en orden de primera aparición, marca simultáneamente a dos hablantes cuando hablan a la vez (solapamiento) y procesa cada sección de cinco minutos en una sola pasada, emparejando voces entre secciones para mantener la consistencia de identidad a lo largo de grabaciones largas.

La innovación destacable es la orientación a inferencia on-device multiplataforma: el mismo modelo se ejecuta en Neural Engine (Apple), LiteRT (Linux, Windows, Android) y WebAssembly (navegador y Node), con una build ONNX adicional. La cuantización a 8 bits reduce el tamaño de 81 MB a 42 MB sin degradar la tasa de error en AMI (12,6 % en ambas builds). No se documenta si hubo RLHF, DPO u otras etapas de ajuste.

## Capacidades

- Diarización de hablantes: etiqueta quién habla en cada turno con marcas de inicio y fin en segundos.
- Numeración de hablantes en orden de primera aparición (0, 1, 2, ...).
- Detección de solapamiento: cuando dos personas hablan a la vez, marca a ambas.
- Procesamiento de grabaciones de cualquier duración mediante secciones de cinco minutos con emparejamiento de voces entre secciones.
- Entrada flexible: acepta ficheros de audio/vídeo o muestras mono decodificadas a cualquier frecuencia de muestreo (por ejemplo, 48 kHz).
- Ejecución on-device en iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.
- SDKs nativos en Swift, Kotlin y JavaScript/TypeScript.
- No se documentan capacidades de reconocimiento de voz (transcripción), tool calling, agentes ni multilingüismo textual.

## Casos de uso

- Etiquetado de transcripciones por hablante: combinando la salida de turnos (speaker, start, end) con una transcripción con marcas de tiempo, se puede asignar cada fragmento de texto a la persona que lo pronunció, útil en entrevistas y podcasts.
- Edición de podcasts e interviews: los tiempos de cambio de hablante permiten cortar automáticamente en cada intervención o saltar a la siguiente vez que habla un invitado concreto.
- Actas de reuniones: en reuniones grabadas (AMI, NOTSOFAR-1) el modelo separa a los participantes para generar resúmenes atribuidos por persona.
- Análisis de llamadas de atención al cliente: en llamadas con múltiples participantes (Earnings-21) se puede medir la participación de agente y cliente y detectar solapamientos.
- Privacidad por diseño en aplicaciones móviles: al ejecutarse en el Neural Engine o LiteRT sin enviar audio a la nube, es adecuado para apps de grabación y notas de voz en iOS y Android.
- Procesamiento en navegador: con la build WebAssembly se puede diarizar audio localmente en una aplicación web o en Node sin backend de inferencia.
- Post-procesado en pipelines de vídeo: marcar tramos por hablante para subtitulado, búsqueda por persona o generación de clips centrados en un interlocutor.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados) en tasa de error de diarización (DER, menor es mejor):

| Dataset | Condiciones | Muestras | DER |
|---|---|---|---|
| AMI meetings | headset mix, reuniones completas | 16 | 0,126 |
| VoxConverse | grabaciones completas, hasta 4 hablantes | 86 | 0,084 |
| VoxConverse | grabaciones completas, 2-21 hablantes | 232 | 0,175 |
| NOTSOFAR-1 meetings | campo lejano, reuniones completas, hasta 4 hablantes | 65 | 0,162 |
| NOTSOFAR-1 meetings | campo lejano, reuniones completas, 3-8 hablantes | 129 | 0,243 |
| Earnings-21 calls | llamadas completas, 2-20 hablantes | 44 | 0,277 |
| DiPCo dinner parties | campo lejano, sesiones completas | 10 | 0,411 |
| CHiME-6 dinner parties | campo lejano, sesiones completas | 2 | 0,399 |

Nota de rendimiento: según el autor, una entrevista de 50 minutos se procesa en 3 segundos en un MacBook Pro, íntegramente en el dispositivo.

## Requisitos de hardware

- VRAM: no disponible; el modelo está diseñado para inferencia on-device y su tamaño de pesos (42-81 MB en Core ML) sugiere un consumo de memoria muy bajo, aunque no se publican cifras.
- GPU/acceleradores recomendados: Neural Engine en plataformas Apple; LiteRT en Linux, Windows y Android; WebAssembly en navegador y Node; build ONNX disponible.
- GPU de consumo: por el tamaño de los pesos (decenas de MB), es previsible que quepa en cualquier GPU de consumo moderna, aunque no se documentan requisitos mínimos.
- Opciones de despliegue: SDKs oficiales Swift (Swift Package Manager), Kotlin (Maven/BOM ai.desertant) y JavaScript (`@desert-ant-labs/who` con `@litertjs/core` en navegador, core nativo precompilado en Node); build ONNX para otros entornos.
- Latencia y throughput: 50 minutos de audio en 3 segundos en un MacBook Pro (dato del autor); no se publican cifras de throughput para otras plataformas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de modelos comparables (parámetros, contexto, rendimiento o licencia) para establecer una comparativa rigurosa. Las alternativas habituales del ecosistema open source de diarización (por ejemplo, pipelines basados en pyannote) no están documentadas en esta ficha con cifras verificables, por lo que se indica: no disponible.

## Limitaciones y advertencias

- Estado beta: el propio autor marca el modelo como Beta, lo que implica posible inestabilidad de API o de resultados en producción.
- Resultados no verificados: todas las métricas DER del model-index están marcadas como `verified: false`; proceden del autor y no de una evaluación independiente.
- Degradación en campo lejano y reuniones multihablante: el DER sube notablemente en DiPCo (0,411), CHiME-6 (0,399) y NOTSOFAR-1 con 3-8 hablantes (0,243), frente a VoxConverse con hasta 4 hablantes (0,084).
- Sesgos: no se documentan análisis de sesgo por acento, género, edad o idioma; al operar sobre audio, el rendimiento puede variar según la lengua y las condiciones acústicas.
- Idiomas: no se declaran idiomas soportados; no hay garantía documentada de comportamiento multilingüe.
- Licencia: `desert-ant-labs-source-available` (source-available, no open source); es necesario revisar los términos en https://license.desertant.com/ antes de cualquier uso comercial.
- Dependencia de SDKs propietarios: el uso en producción pasa por los paquetes oficiales de Desert-Ant-Labs, lo que puede condicionar la portabilidad.
- No realiza transcripción: el modelo solo etiqueta hablantes y turnos; para texto hay que combinarlo con un sistema ASR externo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/who
- Pesos v0.3.4: https://huggingface.co/desert-ant-labs/who/tree/v0.3.4
- Demo: https://desertant.com/models/who/
- Repositorio del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core
- Documentación fuente de la model card: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/docs/models/who.md
- Requisitos Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Requisitos Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Requisitos JavaScript/TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
- Licencia: https://license.desertant.com/
