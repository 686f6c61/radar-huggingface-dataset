# desert-ant-labs/align

## Resumen

Align es un modelo de refinamiento de marcas temporales a nivel de palabra (forced alignment) desarrollado por Desert Ant Labs. No es un modelo de reconocimiento de voz en sentido estricto: recibe una transcripcion ya existente, generada por cualquier motor de ASR (Whisper, `SpeechAnalyzer` de Apple, etc.), junto con el audio original, y devuelve las mismas palabras con tiempos de inicio y fin mas precisos. El ejemplo de la model card ilustra el efecto: la palabra "world" pasa de 2,61-3,04 s a 2,57-2,98 s.

Su relevancia practica esta en el tamano y el despliegue: los pesos compilados ocupan aproximadamente 560 KB en Core ML y el refinamiento de un resultado tipico se completa en pocos milisegundos en el propio dispositivo. Esto lo hace apto para subtitulado, edicion automatica y pipelines de transcripcion en tiempo real sin coste de servidor. El modelo cubre nueve idiomas (aleman, ingles, espanol, frances, italiano, japones, coreano, portugues y chino) y se distribuye a traves de SDKs para Swift, Kotlin y JavaScript, ademas de formatos LiteRT/TFLite y Core ML.

La informacion publica no detalla la arquitectura interna ni el volumen de datos de entrenamiento; la model card se centra en la API, el comportamiento de los fallbacks y las plataformas soportadas. La licencia es propietaria de tipo source-available, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo acustico de forced alignment; se distribuye compilado en Core ML y LiteRT/TFLite) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de busqueda por palabra; audio de entrada hasta 37 horas si la frecuencia no es 16 kHz) |
| Tipos de cuantizacion | no disponible (pesos compilados; ~560 KB en Core ML) |
| Idiomas soportados | de, en, es, fr, it, ja, ko, pt, zh (9 idiomas) |
| Licencia | desert-ant-labs-source-available (propietaria, enlace: https://license.desertant.com/) |
| Formato de pesos | Core ML compilado, LiteRT/TFLite; SDKs Swift, Kotlin y JavaScript (Node nativo) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo, el numero de parametros ni la composicion del dataset de entrenamiento. Por la funcion que desempena, se trata de un modelo acustico de alineamiento forzado que, dada una secuencia de palabras y el audio correspondiente, busca los limites temporales optimos de cada palabra dentro de una ventana de busqueda. La model card menciona explicitamente esa ventana y advierte de que las correcciones que caen en su borde se descartan, lo que sugiere un mecanismo de busqueda local acotada en lugar de un alineamiento global sobre toda la secuencia.

El modelo se distribuye compilado para Core ML y LiteRT/TFLite, con un peso aproximado de 560 KB, lo que indica una red de muy baja capacidad optimizada para latencia. No hay informacion disponible sobre el numero de tokens o horas de audio empleados en el entrenamiento, ni sobre si se aplicaron tecnicas de RLHF o ajuste supervisado. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Refinamiento de marcas temporales a nivel de palabra sobre transcripciones producidas por otros motores de ASR, devolviendo las mismas palabras con tiempos de inicio y fin mas ajustados.
- Integracion con `SpeechAnalyzer` de Apple (iOS 26 y posteriores) mediante `StreamingRefiner`, que corrige solo los resultados finalizados y deja intactos los volatiles.
- Soporte multilingue en nueve idiomas: aleman, ingles, espanol, frances, italiano, japones, coreano, portugues y chino.
- Ejecucion en dispositivo en iOS, macOS, tvOS, visionOS, Android, Linux, Windows y Node.
- Comprobacion previa de idioma soportado mediante `isSupported`, con devolucion de las palabras sin cambios (sin excepcion) para idiomas no soportados.
- Validacion de entrada: tiempos finitos entre -1 y 10.000.000 segundos, frecuencia de muestreo finita y positiva, audio no vacio.
- Marcado por palabra del resultado mediante el flag `refined`, que distingue las correcciones aplicadas de los tiempos originales conservados.
- No incluye generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni capacidades de agente.

## Casos de uso

- Subtitulado y captioning: el refinamiento a nivel de palabra permite que los subtitulos cambien exactamente en el limite de cada palabra, lo que mejora la legibilidad y el sincronismo en reproductores y plataformas de video.
- Edicion automatica de video y audio: los cortes basados en palabras ("cut on word") requieren tiempos precisos; Align corrige los limites que devuelve el ASR y evita cortes a mitad de palabra en herramientas de edicion y creadores de contenido.
- Resaltado de palabras en karaoke y lectura guiada: aplicaciones de aprendizaje de idiomas y de lectura sincronizada pueden iluminar cada palabra en el instante exacto en que se pronuncia.
- Postprocesado de transcripciones de Whisper u otros motores: se pasa la salida del ASR junto con el audio y se obtiene la misma transcripcion con marcas temporales mas ajustadas, sin cambiar el texto.
- Pipeline en tiempo real con `SpeechAnalyzer` en Apple: `StreamingRefiner` corrige los resultados finalizados mientras el audio se sigue transcribiendo, adecuado para notas de voz, reuniones y dictado en iOS 26 o posterior.
- Busqueda y navegacion dentro de audio: con tiempos precisos por palabra se puede saltar a una frase concreta en un podcast o una grabacion larga, o generar enlaces profundos a fragmentos.
- Procesamiento por lotes en servidor o en Node: el subpath `/native` de JavaScript permite ejecutar el refinamiento en Linux x64/arm64 y macOS arm64 dentro de pipelines de transcripcion masiva.
- Aplicaciones moviles sin conectividad: al ejecutarse en dispositivo y descargar los pesos una sola vez, encaja en apps de grabacion y transcripcion que deben funcionar sin red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los pesos compilados ocupan aproximadamente 560 KB en Core ML, por lo que el consumo de memoria es minimo y no requiere GPU dedicada.
- GPU recomendadas: no aplica; el modelo esta disenado para ejecucion en dispositivo (CPU y aceleradores integrados como Neural Engine en Apple o NNAPI en Android).
- Cabe en cualquier GPU de consumo: si, por el tamano de los pesos; no se documentan requisitos especificos de A100, H100 o RTX 4090.
- Opciones de despliegue: SDKs oficiales para Swift (iOS, macOS, tvOS, visionOS), Kotlin (Android), JavaScript con subpath `/native` para Node (linux-x64, linux-arm64, darwin-arm64); formatos Core ML y LiteRT/TFLite.
- Latencia y throughput: la model card indica "pocos milisegundos" por resultado tipico en dispositivo; no se publican cifras concretas de throughput.
- Descarga de pesos: el SDK descarga los pesos desde Hugging Face en el primer uso y los cachea; es posible descargarlos antes (por ejemplo, durante el onboarding) o distribuirlos con la aplicacion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Align (desert-ant-labs) | Refinamiento de timestamps / forced alignment | no disponible (~560 KB compilado) | no disponible | 9 | source-available propietaria | Hugging Face + SDKs Swift/Kotlin/JS |
| Whisper (OpenAI) | ASR completo | 39M-1,55B | 30 s de audio | ~99 | MIT | Abierta, ampliamente desplegada |
| wav2vec 2.0 (Meta) | ASR / representaciones acusticas | 95M-317M | no disponible | multilingue (segun checkpoint) | MIT / CC-BY-NC segun variante | Abierta |
| `SpeechAnalyzer` (Apple) | ASR del sistema | no disponible | no disponible | multilingue | propietaria de Apple | Integrada en iOS 26+ |

La comparacion es aproximada: Align no transcribe, sino que corrige los tiempos de una transcripcion existente, por lo que compite con utilidades de forced alignment (por ejemplo, Montreal Forced Aligner o los modulos de timestamps de Whisper) mas que con motores de ASR completos. No se dispone de datos publicos de precision comparada.

## Limitaciones y advertencias

- No transcribe: requiere una transcripcion previa y el audio correspondiente; no sustituye a un motor de ASR.
- Los fallbacks comprueban estructura, no precision: una correccion plausible pero incorrecta se aplica igualmente.
- Se conserva el tiempo original cuando la correccion cae en el borde de la ventana de busqueda, cuando el rango corregido terminaria antes de empezar o, en streaming, cuando el contexto futuro aun no esta en el buffer.
- Si un modelo falla al ejecutarse, `refine` lanza un error y no aplica fallback.
- Una palabra situada mas de 1,2 s despues del final del audio no tiene material contra el que alinearse y conserva sus tiempos originales con `refined` en falso.
- Idiomas no soportados: `refine` devuelve las palabras sin cambios y no lanza excepcion, lo que puede pasar desapercibido si no se comprueba `isSupported` antes de construir el pipeline.
- Audio a una frecuencia distinta de 16 kHz debe ser mas corto de 37 horas; el audio no puede estar vacio.
- No se documentan sesgos, tasas de alucinacion (no genera texto) ni evaluaciones de precision publicadas.
- Licencia propietaria source-available: es imprescindible revisar los terminos en https://license.desertant.com/ antes de un uso comercial o de redistribuir los pesos.
- Dependencia de los SDKs oficiales y de la descarga de pesos desde Hugging Face en el primer uso; conviene planificar el cacheo o la distribucion empaquetada en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/align
- Pesos v1.1.0: https://huggingface.co/desert-ant-labs/align/tree/v1.1.0
- Licencia: https://license.desertant.com/
- Repositorio del SDK (desert-ant-core): https://github.com/Desert-Ant-Labs/desert-ant-core
- Documentacion de requisitos Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Documentacion de Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Documentacion de JavaScript/TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
- Descarga y cacheo de modelos: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#model-downloads-and-caching
- Paquete npm: https://www.npmjs.com/package/@desert-ant-labs/align
