# gregbarbosa/kokoro-82m-ane-coreml

## Resumen

`gregbarbosa/kokoro-82m-ane-coreml` es una conversion a Core ML en siete etapas del modelo de sintesis de voz hexgrad/Kokoro-82M (Apache-2.0), adaptada del trabajo laishere/kokoro-coreml (Apache-2.0). El objetivo es ejecutar text-to-speech integramente en el Apple Neural Engine (ANE), sin GPU dedicada y sin conexion de red, empaquetando cada bloque del pipeline como un `.mlmodelc` compilado que debe cargarse con colocacion estricta `.cpuAndNeuralEngine`.

El repositorio no contiene pesos de un modelo nuevo: redistribuye los pesos de Kokoro-82M (82 millones de parametros) reorganizados en siete etapas (KokoroAlbert, KokoroPostAlbert, KokoroAlignment, KokoroProsody, KokoroNoise, KokoroVocoder y KokoroTail), el mapa `vocab.json` de fonemas a tokens y 28 embeddings de voz en fp32 con forma `[510, 256]`. El consumidor declarado es Vox, donde se registra como el motor TTS `kokoro-82m-ane`.

Su relevancia es practica: demuestra un pipeline TTS de 82M de parametros ejecutandose a 19–22,6x tiempo real en un M1 Pro con un time-to-first-chunk de 75–850 ms, con el texto permaneciendo en el dispositivo. El repositorio tiene 0,1 GB, cero descargas y cero likes en el momento de la consulta, y la model card no documenta el proceso de entrenamiento del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cadena de siete etapas Core ML derivada de Kokoro-82M: Albert, PostAlbert, Alignment, Prosody, Noise, Vocoder y Tail |
| Parametros totales | 82 millones (heredados de hexgrad/Kokoro-82M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de lenguaje; formas estaticas: entrada ALBERT de hasta 510 fonemas, vocoder de hasta 2000 frames |
| Tipos de cuantizacion | No disponible para las etapas `.mlmodelc`; los embeddings de voz se distribuyen en fp32 |
| Idiomas soportados | Ingles (variantes estadounidense y britanica) |
| Licencia | Apache-2.0 (pesos y voces de hexgrad/Kokoro-82M; conversion Core ML de laishere/kokoro-coreml) |
| Formato de pesos | Core ML compilado (`.mlmodelc`), `vocab.json` y embeddings de voz `.bin` en fp32 |

## Arquitectura y entrenamiento

La conversion divide el pipeline de Kokoro-82M en siete etapas compiladas que deben cargarse obligatoriamente con colocacion estricta `.cpuAndNeuralEngine`; una colocacion mixta multiplica el coste por 2–4, y ejecutar la etapa Prosody en `.all` provoca un fallo de segmentacion en macOS 27 con el error `mps.expand_dims invalid axis`. Las formas son estaticas: el codificador ALBERT admite hasta 510 fonemas y el vocoder hasta 2000 frames, lo que acota tanto la longitud del texto de entrada como la duracion del audio generado.

El repositorio incluye `vocab.json` como mapa de fonemas a tokens y un directorio `voices/` con embeddings crudos en fp32 de forma `[510, 256]`, donde la fila se corresponde con el numero de tokens menos uno, las primeras 128 dimensiones codifican timbre y las ultimas 128 codifican estilo. Estos tensores proceden de los `voices/*.pt` originales y la conversion es byte a byte identica al `af_heart.bin` de referencia del iOSDemo. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre el uso de RLHF o DPO en el modelo original, ya que la model card solo documenta la conversion.

## Capacidades

- Sintesis de voz a partir de texto en ingles, con una cadena de siete etapas orientada a inferencia exclusiva en el Neural Engine.
- 28 voces incluidas en el conjunto de lanzamiento: 20 estadounidenses (af_alloy, af_aoede, af_bella, af_heart, af_jessica, af_kore, af_nicole, af_nova, af_river, af_sarah, af_sky, am_adam, am_echo, am_eric, am_fenrir, am_liam, am_michael, am_onyx, am_puck, am_santa) y 8 britanicas (bf_alice, bf_emma, bf_isabella, bf_lily, bm_daniel, bm_fable, bm_george, bm_lewis).
- Control de timbre y estilo mediante embeddings de voz de 256 dimensiones, separados en 128 dimensiones de timbre y 128 de estilo.
- Entrada basada en fonemas, gestionada a traves de `vocab.json`; no se incluye en el repositorio un front-end de grafema a fonema.
- Generacion de audio por lotes por etapa (formas estaticas de hasta 2000 frames en el vocoder).
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo thinking, vision ni audio de entrada; el flujo es exclusivamente texto a voz.
- No se declaran capacidades de razonamiento, codigo ni matematicas, por tratarse de un modelo TTS.

## Casos de uso

- Lectura por voz en aplicaciones iOS y macOS: integrado como motor `kokoro-82m-ane` en Vox, permite locutar articulos, EPUB o notas con un time-to-first-chunk de 75–850 ms y 19–22,6x tiempo real en un M1 Pro, sin enviar el texto a ningun servidor.
- Accesibilidad para personas con discapacidad visual o dislexia: las 28 voces en ingles estadounidense y britanico permiten elegir una voz con timbre y estilo adecuados, y la ejecucion en el Neural Engine mantiene la bateria y la privacidad del contenido leido.
- Asistentes de voz y avisos en tiempo real: la latencia de arranque declarada hace viable la locucion de notificaciones, instrucciones de navegacion o confirmaciones de comandos dentro del propio dispositivo, sin coste por llamada a API.
- Produccion de audio a partir de texto (audiolibros, podcast, demos): el cambio de voz por embedding permite asignar voces distintas a narrador y personajes procesando el texto por bloques de hasta 510 fonemas.
- Aplicaciones de aprendizaje de ingles: la representacion interna basada en fonemas y el soporte de voces britanicas y estadounidenses permiten exponer la pronunciacion de un texto en dos acentos distintos.
- Videojuegos y experiencias interactivas: la inferencia local elimina la dependencia de red y el coste de sintesis por peticion, y los embeddings de estilo permiten variar la locucion de un mismo personaje.
- Dispositivos Apple Silicon sin conectividad o con requisitos de residencia de datos: al no salir el texto del equipo, el flujo encaja en entornos con exigencias de cumplimiento normativo sobre datos personales.

## Benchmarks y rendimiento

| Metrica | Valor declarado | Hardware |
|---|---|---|
| Velocidad de sintesis | 19–22,6x tiempo real (flat) | Apple M1 Pro |
| Time-to-first-chunk | 75–850 ms | Apple M1 Pro |
| Penalizacion por colocacion mixta | 2–4x mas coste frente a `.cpuAndNeuralEngine` estricto | No especificado |

No se han publicado resultados de benchmarks en la informacion disponible para metricas de calidad de sintesis (MOS, WER, similitud de hablante), ni comparativas numericas frente a otros sistemas TTS.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon con Neural Engine; el benchmark declarado se realizo en un M1 Pro.
- Las siete etapas deben cargarse con colocacion estricta `.cpuAndNeuralEngine`; una colocacion mixta reduce el rendimiento entre 2 y 4 veces.
- Tamano del repositorio: 0,1 GB, lo que incluye las etapas Core ML, el vocabulario y 28 embeddings de voz de `[510, 256]` en fp32 (aproximadamente 0,5 MB por voz).
- VRAM dedicada: no aplica; el modelo se ejecuta sobre memoria unificada, por lo que no requiere GPU NVIDIA ni CUDA.
- Compatibilidad con GPU de consumo: no aplica en el sentido habitual, ya que el destino es el Neural Engine de los SoC de Apple y no una tarjeta grafica discreta.
- Opciones de despliegue: runtime de Core ML (por ejemplo, mediante coremltools o el framework Core ML del sistema); no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 75–850 ms hasta el primer fragmento de audio y 19–22,6x tiempo real en M1 Pro; no se han publicado cifras de throughput para otros SoC.
- Advertencia de plataforma: ejecutar la etapa Prosody con colocacion `.all` provoca un fallo de segmentacion en macOS 27.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gregbarbosa/kokoro-82m-ane-coreml | 82M | Core ML (`.mlmodelc`) | Apache-2.0 | HuggingFace (0 descargas) | Conversion en 7 etapas para Neural Engine; benchmark en M1 Pro |
| hexgrad/Kokoro-82M | 82M | PyTorch (`.pt`) | Apache-2.0 | HuggingFace | Modelo original del que se derivan pesos y voces |
| laishere/kokoro-coreml | 82M | Core ML | Apache-2.0 | GitHub | Conversion de referencia de la que se adapta la cadena |

No se dispone de datos de rendimiento comparativos entre las tres variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Cobertura idiomatica limitada al ingles: el conjunto de voces de lanzamiento solo incluye variantes estadounidense y britanica, por lo que no hay soporte declarado para castellano ni otros idiomas.
- Requiere un front-end de fonemizacion externo: el repositorio solo aporta `vocab.json`, de modo que la conversion de texto a fonemas debe implementarla la aplicacion consumidora.
- Formas estaticas: el codificador admite como maximo 510 fonemas y el vocoder 2000 frames, lo que obliga a fragmentar textos largos y acota la duracion de cada sintesis.
- Restricciones de despliegue estrictas: la colocacion mixta degrada el rendimiento 2–4 veces y la etapa Prosody en `.all` provoca un fallo de segmentacion en macOS 27.
- Sin datos de entrenamiento ni de evaluacion: no se documentan dataset, numero de tokens, tecnicas de alineacion ni metricas de calidad de la sintesis.
- Riesgo de uso indebido de voz sintetica: la disponibilidad de 28 voces con embeddings reutilizables facilita la clonacion o suplantacion si no se aplican controles de consentimiento y marcado de audio sintetico.
- Posibles sesgos acentuales y de timbre: el conjunto de voces no cubre la diversidad de hablantes de ingles como lengua global, lo que puede afectar a la representacion en productos dirigidos a audiencias internacionales.
- Licencia: los pesos, las voces y la conversion se declaran Apache-2.0, lo que permite uso comercial, pero se exige mantener la atribucion a hexgrad/Kokoro-82M, a laishere/kokoro-coreml (© 2026 laishere) y al script de generacion de paquetes de voz de Vox.
- Estado del repositorio: cero descargas y cero likes, sin pipeline declarado en HuggingFace, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/gregbarbosa/kokoro-82m-ane-coreml
- Modelo original: https://huggingface.co/hexgrad/Kokoro-82M
- Conversion de referencia: https://github.com/laishere/kokoro-coreml
- Consumidor declarado (motor `kokoro-82m-ane`): https://github.com/gregbarbosa/Vox
- Script de generacion de paquetes de voz: `scripts/generate-ane-voice-packs.py` en el repositorio Vox
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a un medio de prensa generalista sin relacion con el repositorio.
