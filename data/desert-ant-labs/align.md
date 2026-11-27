# desert-ant-labs/align

## Resumen

Align es un modelo de refinamiento de marcas de tiempo a nivel de palabra (word-timestamp refinement) desarrollado por Desert Ant Labs. No es un modelo de reconocimiento de voz al uso: recibe una transcripcion ya existente, generada por cualquier motor de ASR (Apple SpeechAnalyzer, Whisper u otros), junto con el audio original, y devuelve las mismas palabras con tiempos de inicio y fin mas precisos. El problema que resuelve es el desalineamiento tipico de los subtitulos y cortes generados por reconocedores automaticos, que suelen desviarse decenas o cientos de milisegundos respecto al audio real.

La propuesta es deliberadamente minimalista: modelos de 560 KB compilados en Core ML, con variantes LiteRT/TFLite, que refinan un resultado tipico en pocos milisegundos y se ejecutan en el dispositivo. Soporta nueve idiomas (aleman, ingles, espanol, frances, italiano, japones, coreano, portugues y chino) y plataformas muy diversas: iOS, macOS, tvOS, visionOS, Android, Linux, Windows y Node. En Apple dispone ademas de una integracion directa con SpeechAnalyzer mediante `StreamingRefiner`.

Su relevancia actual radica en que el refinamiento de timestamps es una pieza critica en pipelines de subtitulado, edicion automatica de video y busqueda sobre audio, y tradicionalmente exigia modelos de alineacion forzada mucho mas pesados o servicios en la nube. Align traslada esa funcion al dispositivo con un coste computacional casi despreciable y sin enviar audio a servidores externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelos compilados para Core ML y LiteRT/TFLite; arquitectura interna no especificada) |
| Parametros totales | no disponible (peso del artefacto: 560 KB en Core ML compilado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de busqueda por palabra; no se documenta en tokens) |
| Tipos de cuantizacion | no disponible (artefactos precompilados Core ML y LiteRT) |
| Idiomas soportados | de, en, es, fr, it, ja, ko, pt, zh (9 idiomas) |
| Licencia | desert-ant-labs-source-available (source available, no open source) |
| Formato de pesos | Core ML compilado y LiteRT/TFLite; distribucion via SDK (Swift, Kotlin, JavaScript) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (tipo de red, capas, atencion, etc.), solo el formato de despliegue: artefactos compilados para Core ML en plataformas Apple y LiteRT/TFLite para el resto, con un peso de 560 KB en la variante Core ML. No se especifica el numero de parametros ni la composicion del dataset de entrenamiento.

El funcionamiento descrito es el de un refinador de alineacion: dado un conjunto de palabras con tiempos aproximados y el audio correspondiente a 16 kHz, el modelo ajusta los limites de cada palabra. La API impone validaciones estrictas de entrada (tiempos finitos entre -1 y 10.000.000 segundos, frecuencia de muestreo positiva, audio no vacio, audio no-16 kHz limitado a menos de 37 horas) y define mecanismos de fallback: si la correccion cae en el borde de la ventana de busqueda, si el rango corregido terminaria antes de empezar, o si falta contexto futuro en modo streaming, se conserva el timestamp original. Estos fallbacks comprueban estructura, no precision, por lo que una correccion plausible pero erronea puede aplicarse igualmente. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Refinamiento de marcas de tiempo a nivel de palabra sobre transcripciones existentes de cualquier motor de ASR.
- Alineacion forzada (forced alignment) de palabras contra el audio.
- Procesamiento en dispositivo, sin dependencia de red tras la descarga inicial de pesos.
- Soporte multilingue para 9 idiomas: aleman, ingles, espanol, frances, italiano, japones, coreano, portugues y chino.
- Integracion con Apple SpeechAnalyzer (iOS 26 y posteriores) mediante `StreamingRefiner`, con correccion de resultados finalizados y paso sin cambios de los resultados volatiles.
- Modo streaming con gestion de contexto futuro no almacenado en buffer.
- API multiplataforma: Swift (iOS, macOS, tvOS, visionOS), Kotlin (Android), JavaScript/TypeScript (Node con subruta `/native` precompilada para linux-x64, linux-arm64 y darwin-arm64).
- Comprobacion sincrona y asincrona de idioma soportado (`isSupported`), con devolucion de palabras sin cambios para idiomas no soportados.
- Descarga y cache de pesos desde Hugging Face en el primer uso, con opcion de empaquetarlos con la aplicacion.

## Casos de uso

- Subtitulado automatico de video: se pasa la transcripcion de Whisper o SpeechAnalyzer junto al audio y se obtienen subtitulos cuyos tiempos caen sobre la palabra exacta, lo que reduce el desfase perceptible en reproduccion.
- Edicion automatica basada en texto (text-based editing): en editores de video que permiten cortar por transcripcion, los limites de corte precisos evitan clips que empiezan o terminan a mitad de palabra.
- Generacion de clips y highlights: al refinar los tiempos de las palabras clave, los fragmentos extraidos respetan el inicio y fin reales del habla, util en herramientas de resumen de reuniones o podcasts.
- Busqueda y navegacion sobre audio: con timestamps fiables a nivel de palabra se puede saltar a la ocurrencia exacta de un termino en una grabacion larga, por ejemplo en apps de notas de voz o archivos de entrevistas.
- Accesibilidad y karaoke: resaltado sincronizado de palabras en tiempo real sobre el audio reproducido, usando `StreamingRefiner` para corregir resultados finalizados mientras se transcribe.
- Procesamiento por lotes en servidor o CI: la subruta `/native` de Node permite refinar transcripciones en pipelines de Linux (x64 y arm64) sin GPU, integrable en flujos de postproduccion o indexacion masiva.
- Aplicaciones moviles offline: al ejecutarse en dispositivo con 560 KB, encaja en apps de Android e iOS que necesitan subtitulos precisos sin enviar audio a la nube por privacidad o conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el artefacto Core ML ocupa 560 KB y el modelo se ejecuta en CPU/GPU/NPU del dispositivo segun la plataforma. No se dispone de cifras de memoria en ejecucion.
- GPU recomendadas: no se especifican; el diseno es para inferencia en dispositivo, no para servidores con GPU dedicada.
- Cabe en GPU de consumo: si, por tamano, aunque el objetivo declarado es la ejecucion en dispositivos moviles y de escritorio sin acelerador dedicado.
- Opciones de despliegue: SDK oficial para Swift, Kotlin y JavaScript (Node, subruta `/native`); artefactos Core ML y LiteRT/TFLite. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: se indica que refina un resultado tipico en pocos milisegundos en dispositivo; no se publican cifras concretas de latencia ni de throughput.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables de otros modelos de refinamiento de timestamps en la informacion proporcionada. La tabla siguiente recoge unicamente lo que se conoce de Align; las celdas de alternativas quedan como no disponibles.

| Modelo | Tipo | Idiomas | Contexto | Licencia | Despliegue |
|---|---|---|---|---|---|
| Align (Desert Ant Labs) | Refinamiento de word timestamps | 9 | no disponible | source available | Core ML, LiteRT, SDK Swift/Kotlin/JS |
| Alternativas de alineacion forzada | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de ASR: requiere una transcripcion previa; no transcribe audio por si mismo.
- Solo soporta nueve idiomas; para cualquier otro, `refine` devuelve las palabras sin cambios y no lanza error, lo que puede pasar desapercibido si no se comprueba `isSupported` antes.
- Los fallbacks por borde de ventana, rango invertido o falta de contexto en streaming comprueban estructura, no precision: una correccion plausible pero incorrecta se aplica igualmente.
- Si el modelo falla al ejecutarse, `refine` lanza un error y no recurre al timestamp original.
- Una palabra situada mas de 1,2 s despues del final del audio conserva sus tiempos de entrada con `refined` en falso.
- En modo streaming solo se corrigen los resultados finalizados; los volatiles pasan sin cambios.
- Restricciones de entrada estrictas: tiempos finitos entre -1 y 10.000.000 segundos, frecuencia de muestreo positiva, audio no vacio y audio distinto de 16 kHz limitado a menos de 37 horas.
- La licencia es source available (desert-ant-labs-source-available), no open source; es necesario revisar los terminos en el enlace de licencia antes de un uso comercial.
- No se documentan sesgos conocidos, tasas de alucinacion ni limites de contexto en tokens; esta informacion no esta disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/align
- Pesos v1.1.0: https://huggingface.co/desert-ant-labs/align/tree/v1.1.0
- Licencia: https://license.desertant.com/
- Repositorio del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core
- Documentacion de requisitos Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Documentacion de requisitos Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Documentacion de requisitos JavaScript/TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
- Descarga y cache de modelos: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#model-downloads-and-caching
