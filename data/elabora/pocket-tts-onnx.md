# elabora/pocket-tts-onnx

## Resumen

Pocket TTS es un modelo de síntesis de voz (text-to-speech) compacto desarrollado por Kyutai (Manu Orsini, Simon Rouard, Gabriel De Marmiesse, Václav Volhejn, Neil Zeghidour y Alexandre Défossez), pensado para ejecutarse en CPU y en dispositivos de gama baja. Este repositorio, `elabora/pocket-tts-onnx`, no es un modelo nuevo: es un espejo sin modificar de la exportación a ONNX publicada por KevinAHM (`KevinAHM/pocket-tts-onnx`, revisión `58a6d00cf13d239b6748cb0769f35c580a8f606c`), que convierte los pesos originales de `kyutai/pocket-tts` en grafos ONNX separados y aplica cuantización int8 a tres de ellos. El espejo lo mantiene Elabora, una herramienta de autoría de módulos de e-learning, para fijar los bytes exactos con los que se validó su integración y verificar su SHA-256 en local.

El repositorio contiene dos bundles de idioma, `english_2026-04` y `french_24l`, cada uno con el acondicionador de texto, el modelo de lenguaje de flujo en dos partes (`flow_lm_main` y `flow_lm_flow`), el decodificador Mimi y un codificador Mimi que solo se necesita para clonar o construir voces. El tamaño total del repositorio es de 0,6 GB, y el bundle inglés ocupa aproximadamente 125 MB sin codificador (165 MB con él), frente a los cerca de 354 MB del francés (394 MB con codificador), lo que refleja que el bundle francés es un modelo bastante mayor.

Su relevancia ahora es doble: por un lado, demuestra que un TTS con clonación de voz a partir de muestras cortas puede correr en CPU y en el navegador vía ONNX Runtime Web; por otro, ilustra una práctica de empaquetado reproducible (hashes por fichero, licencia incluida y atribución explícita) para equipos que necesitan depender de un modelo cuyo repositorio upstream pertenece a un particular y podría desaparecer.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS neuronal en grafos ONNX: acondicionador de texto, modelo de lenguaje de flujo (`flow_lm_main` + `flow_lm_flow`), decodificador Mimi y codificador Mimi (códec neuronal de Kyutai); el detalle interno de capas no está documentado en la información disponible |
| Parámetros totales | No disponible (el bundle francés es mucho mayor: `flow_lm_main_int8.onnx` de 305.144.125 bytes frente a 76.341.079 bytes del inglés) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana de contexto de LLM; la longitud de texto por petición la fija `bundle.json` y no está documentada |
| Tipos de cuantización | int8 en `flow_lm_main`, `flow_lm_flow` y `mimi_decoder`; fp32 en `text_conditioner` y `mimi_encoder` (los grafos fp32 del upstream no se incluyen) |
| Idiomas soportados | Inglés (`english_2026-04`) y francés (`french_24l`) |
| Licencia | CC BY 4.0 (Creative Commons Attribution 4.0 International) |
| Formato de pesos | ONNX (`.onnx`), más `bundle.json`, `bos_before_voice.npy` y `tokenizer.json` (SentencePiece) que se descarga aparte |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna más allá de los nombres de los grafos exportados. Por esos nombres se deduce una cadena de tres etapas: un acondicionador de texto que procesa la entrada lingüística, un modelo de lenguaje de flujo (`flow_lm_main` y `flow_lm_flow`) que genera tokens de audio, y un decodificador Mimi que convierte esos tokens en forma de onda. El codificador Mimi (`mimi_encoder.onnx`, 39,8 MB) es el componente simétrico que se usa para obtener los tokens de una muestra de voz, necesario para clonación y para construir catálogos de voces; no interviene en la síntesis.

KevinAHM exportó los pesos a ONNX como grafos separados y cuantizó a int8 `flow_lm_main`, `flow_lm_flow` y `mimi_decoder`, dejando en fp32 el acondicionador de texto y el codificador Mimi. No se ha publicado en esta información el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. El tokenizador es SentencePiece y se distribuye por separado en `kyutai/pocket-tts-without-voice-cloning`, en la ruta `languages/<bundle>/tokenizer.json`. Elabora no ha convertido, reentrenado, recomprimido ni renombrado ningún fichero: cada archivo del espejo es idéntico byte a byte al del upstream en la revisión indicada.

## Capacidades

- Síntesis de voz a partir de texto en inglés y en francés, con un bundle independiente por idioma.
- Clonación de voz a partir de muestras de audio cortas (capacidad declarada de Pocket TTS en la model card del exportador); requiere el codificador Mimi, que sí está incluido en este espejo.
- Construcción de catálogos de voces propio: Elabora usa `mimi_encoder.onnx` una sola vez, en máquinas de desarrollo, para generar las voces de su catálogo.
- Ejecución en CPU y en navegador mediante ONNX Runtime y ONNX Runtime Web, sin GPU dedicada.
- Decodificación fotograma a fotograma (frame by frame) sobre onnxruntime, lo que habilita reproducción en streaming en implementaciones derivadas.
- Verificación de integridad por SHA-256 de cada fichero, útil en pipelines que necesitan fijar exactamente la versión usada.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada más allá de la codificación de voces.

## Casos de uso

- Narración de líneas de voz en herramientas de autoría de e-learning: Elabora emplea estos bundles para locutar guiones de módulos formativos en local, sin enviar texto a servicios en la nube y con verificación de hash antes de cargar los pesos.
- Síntesis en el navegador: al ser grafos ONNX int8, se pueden servir con ONNX Runtime Web y generar voz en el cliente, lo que reduce coste de infraestructura y evita transmitir el texto del usuario a un servidor.
- Asistentes de lectura y accesibilidad: lectura en voz alta de artículos, documentación o interfaces para usuarios con discapacidad visual, en inglés y francés, en equipos sin GPU.
- Prototipado de productos de voz sin presupuesto de GPU: un equipo puede montar una demo funcional de TTS en un portátil, con una huella de disco de 125-165 MB (inglés) o 354-394 MB (francés) por bundle.
- Doblaje y localización de contenido corto entre inglés y francés: dos bundles separados permiten generar la misma locución en ambos idiomas manteniendo una voz de referencia propia del catálogo.
- Pruebas de regresión de pipelines de audio: al estar cada peso fijado por SHA-256 y por revisión de upstream, sirve para pruebas reproducibles de un sistema de generación de voz que debe dar resultados estables en el tiempo.
- Integración en aplicaciones de escritorio o embebidas: el formato ONNX con int8 encaja en runtimes ligeros, y existen ports independientes (Candle en Rust con WASM y PyO3, jax-js) que amplían los entornos de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del espejo no incluye métricas de calidad de voz (MOS, CMOS), de error de pronunciación ni comparativas numéricas con otros sistemas TTS, y tampoco se aportan medidas de latencia o de tiempo real factor (RTF).

## Requisitos de hardware

- Inferencia en CPU: es el objetivo de diseño del modelo ("a TTS that fits in your CPU"); no se especifican requisitos mínimos de CPU en la información disponible.
- Memoria: como referencia de huella en disco de los pesos, el bundle inglés suma unos 125 MB sin codificador (165 MB con `mimi_encoder.onnx`) y el francés unos 354 MB sin codificador (394 MB con él); el repositorio completo ocupa 0,6 GB.
- VRAM: no aplica en el escenario previsto (CPU); no se han publicado cifras de VRAM para ejecución en GPU.
- GPU recomendadas: no disponible; al ser un modelo orientado a CPU, no se documenta ninguna GPU recomendada.
- Compatibilidad con GPU de consumo: no documentada; cualquier GPU que soporte ONNX Runtime podría ejecutar los grafos, pero no hay datos de rendimiento publicados.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), ONNX Runtime Web para navegador, el paquete single-file de `thewh1teagle/pocket-tts-onnx`, el port a Candle en Rust (`babybirdprd`) y la implementación en jax-js.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas / contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| Pocket TTS ONNX int8 (este espejo) | No disponible | Inglés y francés, un bundle por idioma | CC BY 4.0 | ONNX int8 + fp32 parcial, ejecutable en CPU |
| Pocket TTS original (`kyutai/pocket-tts`) | No disponible | Inglés y francés | CC BY 4.0 | Pesos originales de Kyutai, sin cuantizar |
| Piper | No disponible en esta búsqueda (modelos VITS pequeños por voz) | Decenas de idiomas y voces | MIT (según su proyecto) | ONNX, orientado a CPU y a dispositivos embebidos |
| Kokoro-82M | 82 M | Principalmente inglés y otros idiomas según versión | Apache 2.0 (según su model card) | Pesos PyTorch y exportaciones ONNX de la comunidad |
| XTTS-v2 (Coqui) | No disponible en esta búsqueda | Multilingüe, con clonación de voz | Coqui Public Model License (uso no comercial) | Pesos PyTorch; requiere GPU para latencias bajas |

Nota: los datos de Piper, Kokoro-82M y XTTS-v2 provienen de sus model cards públicas y no se han verificado en la búsqueda web proporcionada; se incluyen solo como orientación de categoría. Para Pocket TTS no hay cifras de rendimiento publicadas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Es un espejo, no un modelo mantenido: no recibirá correcciones ni mejoras por parte de Elabora, y su utilidad depende de la revisión concreta de upstream que se copió.
- El upstream pertenece a un particular (`KevinAHM`) que puede renombrar o borrar el repositorio; el espejo existe precisamente por ese riesgo, pero solo cubre dos bundles y un subconjunto de ficheros (no incluye los grafos fp32 ni los bundles restantes).
- El `tokenizer.json` no está en este repositorio: hay que descargarlo de `kyutai/pocket-tts-without-voice-cloning` en la revisión indicada, lo que añade una dependencia externa al despliegue.
- Solo inglés y francés; no hay soporte documentado de castellano ni de otros idiomas.
- La cuantización int8 de `flow_lm_main`, `flow_lm_flow` y `mimi_decoder` puede degradar la calidad de audio respecto a los pesos fp32 originales; no se ha publicado ninguna evaluación de esa pérdida.
- No hay benchmarks ni métricas de calidad de voz publicadas, y el repositorio tiene 0 descargas y 0 likes, por lo que no existe validación comunitaria medible.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribución a Kyutai (modelo original) y a KevinAHM (conversión a ONNX), además de enlazar la licencia; el incumplimiento de la atribución invalida el permiso.
- Kyutai prohíbe expresamente en su model card la suplantación o clonación de voz sin consentimiento explícito y lícito, la desinformación y la presentación de contenido generado como grabación real, así como la generación de contenido ilícito, difamatorio, acosador o que vulnere la privacidad.
- Un TTS no "alucina" en el sentido de un LLM, pero sí puede producir pronunciaciones incorrectas, prosodia poco natural o fallos en nombres propios y números; no hay datos sobre su comportamiento en estos casos.
- Los ficheros se distribuyen sin garantía de ningún tipo, y la fecha de creación del repositorio (2026-10-19) indica que se trata de una copia reciente y sin historial de uso prolongado.

## Enlaces

- Repositorio espejo en HuggingFace: https://huggingface.co/elabora/pocket-tts-onnx
- Repositorio upstream de la conversión ONNX (KevinAHM): https://huggingface.co/KevinAHM/pocket-tts-onnx
- Modelo original de Kyutai: https://huggingface.co/kyutai/pocket-tts
- Tokenizadores por bundle: https://huggingface.co/kyutai/pocket-tts-without-voice-cloning
- Página oficial y demo de Pocket TTS: https://kyutai-labs.github.io/pocket-tts/
- Código de Kyutai: https://github.com/kyutai-labs/pocket-tts
- Exportación single-file con onnxruntime (thewh1teagle): https://github.com/thewh1teagle/pocket-tts-onnx
- Otro espejo de la conversión ONNX: https://huggingface.co/theoracleguy/pocket-tts-onnx
- Elabora (mantenedor del espejo): https://elabora.studio
- Texto legal de CC BY 4.0: https://creativecommons.org/licenses/by/4.0/legalcode
