# desert-ant-labs/who

## Resumen

Who es un modelo de diarización de hablantes (speaker diarization) desarrollado por Desert Ant Labs, distribuido en HuggingFace bajo el identificador `desert-ant-labs/who`. Su función es etiquetar quién habla en cada momento de un audio o vídeo, devolviendo turnos de palabra por persona con marcas temporales de inicio y fin. Está diseñado específicamente para pódcasts, entrevistas, llamadas y reuniones, y acepta grabaciones de cualquier duración.

A diferencia de los modelos de lenguaje, Who no es un transformer generativo: es una cadena de cinco grafos de inferencia optimizados para ejecución local (encoder y queries a 60 s y 300 s, más un extractor de huella de voz de 30 s para emparejar hablantes entre secciones). Se distribuye en cuatro variantes de runtime (Core ML float16 e int8, LiteRT int8 y ONNX int8) con pesos de 81 MB, 42 MB, 32 MB y 99 MB respectivamente, y el repositorio completo ocupa 0,4 GB.

Su relevancia actual reside en el despliegue totalmente on-device: procesa secciones de cinco minutos en una sola pasada, usa el Neural Engine en plataformas Apple y LiteRT en Linux, Windows y Android, y según el autor una entrevista de 50 minutos se resuelve en 3 segundos en un MacBook Pro. La licencia es source-available propietaria (`desert-ant-labs-source-available-1.0`), no open source, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de cinco grafos de inferencia para diarización (encoder de audio, queries de hablantes, extractor de huella de voz); no es un modelo generativo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventanas de audio de 60 s y 300 s, con procesamiento de grabaciones de duración arbitraria por secciones |
| Tipos de cuantizacion | float16 (Core ML), int8 (Core ML, LiteRT y ONNX); en ONNX los productos matriciales son int8 y el resto float32 |
| Idiomas soportados | no disponible |
| Licencia | desert-ant-labs-source-available-1.0 (source-available, no open source) |
| Formato de pesos | Core ML compilado (`coreml-fp16`, `coreml-int8`), LiteRT/TFLite (`who.tflite` con las cinco gráficas como firmas), ONNX (`onnx-int8`) |

Datos adicionales de distribución:

| Directorio | Runtime | Pesos | Tamano |
|---|---|---|---:|
| `coreml-fp16/` | Core ML, compilado | float16 | 81 MB |
| `coreml-int8/` | Core ML, compilado | 8 bits | 42 MB |
| `litert-int8/` | LiteRT | 8 bits, cinco grafos en un unico `who.tflite` | 32 MB |
| `onnx-int8/` | ONNX Runtime | int8 en productos matriciales, resto float32 | 99 MB |

| Fichero | Contenido |
|---|---|
| `encoder_6000` | De 60 s de audio a tramas de voz |
| `queries_6000` | Hablantes presentes en esos 60 s y cuándo habla cada uno |
| `encoder_30000` | De 300 s de audio a tramas de voz |
| `queries_30000` | Hablantes presentes en esos 300 s y cuándo habla cada uno |
| `voice_3256` | Huella de voz de un tramo de 30 s, para emparejar hablantes entre secciones |
| `who_meta.json` | Geometría del front-end, nombres de entrada y salida de cada grafo, umbrales de decisión |
| `who_mel_banks.f32` | Banco de filtros mel 80 x 257, little-endian |
| `who_voice_banks.f32` | Banco de huellas de voz (contenido completo no disponible en la información proporcionada) |

## Arquitectura y entrenamiento

La información disponible describe la topología de inferencia pero no la arquitectura interna de las redes ni el proceso de entrenamiento. El sistema se compone de cinco grafos: dos encoders que convierten audio en tramas de voz (ventanas de 60 s y 300 s), dos módulos de queries que a partir de esas tramas estiman qué hablantes hay y en qué intervalos habla cada uno, y un módulo `voice_3256` que genera una huella de voz a partir de un tramo de 30 s para reidentificar hablantes entre secciones. El front-end consume un banco de filtros mel de 80 x 257 almacenado como `who_mel_banks.f32`, con geometría y umbrales de decisión definidos en `who_meta.json`.

El flujo de trabajo es por secciones: procesa cada bloque de cinco minutos en una pasada y luego empareja las voces entre bloques, lo que permite cubrir grabaciones de cualquier longitud sin una ventana de contexto fija. Numera a los hablantes en el orden en que aparecen por primera vez y marca simultáneamente a ambos interlocutores cuando hay solapamiento de habla. No se han publicado datos sobre número de tokens o horas de audio de entrenamiento, composición del dataset, ni sobre uso de RLHF, DPO u otras etapas de ajuste. Las dos variantes de pesos Core ML (float16 e int8) declaran el mismo error sobre AMI (12,6 %), lo que sugiere que la cuantización a 8 bits no degrada la métrica en ese conjunto.

## Capacidades

- Diarización de hablantes con marcas temporales: devuelve turnos por persona con inicio y fin, aptos para etiquetar transcripciones.
- Manejo de grabaciones de duración arbitraria mediante procesamiento por secciones de cinco minutos y emparejamiento de voces entre secciones.
- Detección de solapamiento: cuando dos personas hablan a la vez, marca a ambas.
- Numeración consistente de hablantes en orden de primera aparición.
- Extracción de huella de voz a partir de tramos de 30 s (`voice_3256`) para reidentificación entre bloques.
- Ejecución on-device en iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.
- Backends disponibles: Core ML (Neural Engine en Apple), LiteRT, ONNX Runtime.
- SDKs oficiales en Swift (paquete `desert-ant-core` desde 4.2.1), Kotlin (`ai.desertant:who:4.2.1`) y JavaScript (`@desert-ant-labs/who`, con `@litertjs/core` para navegador).
- No dispone de generación de texto, tool calling, agents, visión ni capacidad multilingüe declarada: es un modelo puramente de audio.

## Casos de uso

- Etiquetado de transcripciones por hablante: se ejecuta Who sobre el audio y se alinean los turnos devueltos con la transcripción existente, de modo que cada intervención queda atribuida a una persona; es adecuado porque entrega intervalos temporales exactos por hablante.
- Pódcasts y entrevistas de larga duración: al procesar por secciones de cinco minutos y emparejar voces, cubre programas de 50 minutos o más sin truncar, y permite saltar al siguiente turno de un invitado concreto.
- Reuniones y actas automáticas: en grabaciones de sala (AMI, NOTSOFAR-1) identifica las intervenciones para construir resúmenes con atribución; el autor reporta DER de 12,6 % en AMI con mezcla de auriculares.
- Edición automática de vídeo y audio: cortar en cada cambio de hablante o generar pistas separadas por persona usando los timestamps de cambio de turno.
- Análisis de llamadas de centros de contacto: en `Earnings-21` el modelo reporta DER de 27,7 % en llamadas de 2 a 20 hablantes, útil para medir tiempos de habla por participante y detectar solapamientos.
- Procesado en tiempo de captura en dispositivos: al usar el Neural Engine en Apple y LiteRT en Android, se puede integrar en apps móviles sin enviar audio a la nube, lo que facilita el cumplimiento de requisitos de privacidad.
- Herramientas de accesibilidad y seguimiento de reuniones: resaltar visualmente quién habla en tiempo real o generar un índice navegable por interlocutor.
- Diarización en navegador o Node sin backend de GPU: con el build `@desert-ant-labs/who` y LiteRT.js se pueden ofrecer funciones de etiquetado en aplicaciones web.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (`verified: false` en todos los casos). Métrica: diarization error rate (DER), menor es mejor.

| Dataset | Condiciones | Muestras | DER |
|---|---|---:|---:|
| AMI meetings | Mezcla de auriculares, reuniones completas | 16 | 0,126 |
| VoxConverse | Grabaciones completas, hasta 4 hablantes | 86 | 0,084 |
| VoxConverse | Grabaciones completas, 2-21 hablantes | 232 | 0,175 |
| NOTSOFAR-1 meetings | Campo lejano, reuniones completas, hasta 4 hablantes | 65 | 0,162 |
| NOTSOFAR-1 meetings | Campo lejano, reuniones completas, 3-8 hablantes | 129 | 0,243 |
| Earnings-21 calls | Llamadas completas, 2-20 hablantes | 44 | 0,277 |
| DiPCo dinner parties | Campo lejano, sesiones completas | 10 | 0,411 |
| CHiME-6 dinner parties | Campo lejano, sesiones completas | 2 | 0,399 |

No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos de diarización, ni métricas de latencia o throughput más allá de la referencia cualitativa del autor (50 minutos de audio en 3 s en un MacBook Pro).

## Requisitos de hardware

- Inferencia on-device: no requiere GPU dedicada. En Apple usa el Neural Engine; en Linux, Windows y Android se ejecuta mediante LiteRT; también hay build de ONNX Runtime.
- Huella de almacenamiento: 81 MB (Core ML float16), 42 MB (Core ML int8), 32 MB (LiteRT int8) y 99 MB (ONNX int8); el repositorio completo, con todas las variantes, ocupa 0,4 GB.
- VRAM estimada: no disponible; por el tamaño de los ficheros (32-99 MB) el modelo está pensado para memoria unificada de dispositivos y CPU/NPU, no para GPUs de datacenter.
- GPU recomendadas: no disponibles; no se documenta ningún backend CUDA. Los backends declarados son Core ML, LiteRT y ONNX Runtime.
- Compatibilidad con GPU de consumo: no aplica según la documentación; el despliegue previsto es en móvil, escritorio y navegador.
- Opciones de despliegue: Core ML compilado (iOS, macOS, tvOS, visionOS), LiteRT/TFLite (Android, Linux, Windows, navegador vía LiteRT.js), ONNX Runtime, y SDKs Swift, Kotlin y JavaScript/Node.
- Latencia y throughput: el autor indica 3 s para una entrevista de 50 minutos en un MacBook Pro, en el dispositivo. No se publican cifras por plataforma ni de consumo energético.

## Comparativa con modelos similares

No se dispone de datos de otros modelos de diarización en la información proporcionada, por lo que no es posible construir una comparativa numérica fiable. Como referencia de categoría, los conjuntos usados por el autor (AMI, VoxConverse, NOTSOFAR-1, DiPCo, CHiME-6, Earnings-21) son los habituales del campo y permiten comparar con otras herramientas de diarización que publiquen DER sobre los mismos splits, pero los valores de esas alternativas no están disponibles aquí.

| Modelo | Parametros | Contexto / ventana | DER publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| who (desert-ant-labs) | no disponible | Secciones de 60 s y 300 s, audio de duración arbitraria | 0,084-0,411 segun dataset (ver tabla) | desert-ant-labs-source-available-1.0 | HuggingFace, SDKs Swift/Kotlin/JS |
| Alternativas de diarizacion | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi paso; cualquier ficha que lo trate como LLM sería incorrecta.
- Los valores de DER están marcados como no verificados (`verified: false`) en la model card; proceden del propio autor y no de una evaluación independiente.
- Rendimiento degradado en escenarios de campo lejano y reuniones con muchos hablantes: DER de 0,411 en DiPCo y 0,399 en CHiME-6 frente a 0,084 en VoxConverse con hasta 4 hablantes.
- El conjunto de evaluación de CHiME-6 contiene solo 2 muestras y DiPCo 10, por lo que esas cifras tienen alta varianza y no deben extrapolarse.
- Las métricas se han obtenido con configuraciones heterogéneas (mezcla de auriculares, campo lejano, número variable de hablantes), por lo que no son directamente comparables entre filas.
- Idiomas soportados: no disponibles. No se declara cobertura lingüística ni comportamiento en código-switching.
- Sesgos conocidos: no documentados. Cabe esperar los sesgos habituales en diarización (acentos, solapamiento intenso, calidad de micrófono, número de hablantes), pero no hay datos publicados al respecto.
- Riesgo de error en el emparejamiento de voces entre secciones: el propio diseño depende de `voice_3256`; voces similares o cambios de canal pueden provocar fusiones o divisiones de hablantes.
- Licencia source-available propietaria (`desert-ant-labs-source-available-1.0`, enlace al texto completo en la model card): no es open source y las condiciones de uso comercial, redistribución y despliegue en productos deben verificarse en https://license.desertant.com/1.0 antes de integrarlo en producción.
- Los pesos corresponden a la versión v0.3.4; la actualización del repositorio es de 2026-10-27, por lo que conviene fijar la versión concreta en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/desert-ant-labs/who
- Documentación y SDKs: https://desertant.com/docs/who/
- Página del modelo en el sitio del autor: https://desertant.com/models/who/
- Texto de la licencia: https://license.desertant.com/1.0
- Repositorio del SDK (Swift, Kotlin, JavaScript): https://github.com/Desert-Ant-Labs/desert-ant-core
- Paquete npm: https://www.npmjs.com/package/@desert-ant-labs/who
- Conjunto de evaluación AMI usado por el autor: https://huggingface.co/datasets/diarizers-community/ami
- Conjunto NOTSOFAR-1: https://huggingface.co/datasets/microsoft/NOTSOFAR
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de la información de HuggingFace.
