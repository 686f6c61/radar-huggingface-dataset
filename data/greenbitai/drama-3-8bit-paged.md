# GreenBitAI/Drama-3-8bit-paged

## Resumen

GreenBitAI/Drama-3-8bit-paged es un empaquetado comunitario del modelo de síntesis de voz (text-to-speech) Fish Audio Drama 3, un TTS expresivo y multihablante de 3.179.093.120 parámetros (3,18 mil millones) con arquitectura de mezcla de expertos (MoE). Lo publica GreenBitAI, que no tiene relación con Fish Audio ni cuenta con su patrocinio: los pesos proceden de la conversión a MLX de 8 bits de `mlx-community/fish-audio-drama-3-8bit`, y este repositorio solo cambia su disposición en disco, no sus valores.

La aportación concreta es la paginación de expertos: los expertos enrutados se guardan en `experts.bin`, con un registro por experto, de modo que la máquina lee del SSD únicamente los expertos que necesita en cada paso. Eso permite ejecutar el modelo en Macs de 32-48 GB de memoria unificada que no pueden mantener los 40 GB del modelo completo en RAM, a costa de velocidad (aproximadamente la mitad de tiempo real con 48 GB y un tercio con 32 GB).

El modelo se sirve mediante `gbx-lm`, un binario para Apple silicon que expone un endpoint compatible con OpenAI (`/v1/audio/speech`) y que delega la decodificación de códigos de audio a un proceso auxiliar (`gbx-codecs`). Es relevante ahora porque demuestra una vía práctica de inferencia MoE fuera de memoria en hardware de consumo, aplicada a un TTS multilingüe con clonación de voz y control de emoción mediante marcas inline.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre el modelo TTS `fish_drama3`, con paginación de expertos en disco; inferencia en MLX sobre Apple silicon |
| Parámetros totales | 3.179.093.120 (3,18 mil millones), según los safetensors del repositorio |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible; es un modelo TTS y el texto largo se divide y se locuta por fragmentos |
| Tipos de cuantización | 8 bits en los expertos enrutados (conversión MLX 8-bit); el resto de componentes, en la precisión original de la release de Fish Audio |
| Idiomas soportados | 83 idiomas, entre ellos es, en, zh, ja, ko, fr, de, pt, it, ar, hi, ru, nl, pl, tr, vi, th, uk, sv, da, fi |
| Licencia | fish-audio-community-license (campo `license: other`) |
| Formato de pesos | safetensors más `experts.bin` (un registro por experto, diseño paginado propio de gbx-lm); pesos en formato MLX |
| Tamaño del repositorio | 42,6 GB |
| Memoria en disco requerida | 40 GB para el modelo |
| Pipeline | text-to-speech (multihablante, clonación de voz) |
| Formatos de audio de salida | WAV 44,1 kHz (por defecto) y PCM 24 kHz, 16 bits, mono; otros formatos se rechazan |
| Librería / runtime | gbx-lm (binario `darwin-arm64`), más gbx-codecs para el códec de audio |

## Arquitectura y entrenamiento

El modelo subyacente es Fish Audio Drama 3, un TTS con arquitectura de mezcla de expertos: solo una parte de los expertos se activa por token, lo que desacopla el número total de parámetros del coste de cómputo por paso. La release de GreenBitAI no reentrena ni modifica los pesos: parte de la conversión a MLX de 8 bits de `mlx-community/fish-audio-drama-3-8bit`, aplica cuantización de 8 bits a los expertos enrutados y mantiene el resto de componentes tal como se publicaron. La única transformación propia es de disposición en disco, con los expertos enrutados aislados en `experts.bin` para permitir lectura selectiva desde SSD.

El autor declara una comprobación de equivalencia frente a los pesos de mlx-community: salida idéntica hasta peticiones de 127 tokens y todas las capas idénticas. No se documentan en la información disponible el volumen de datos de entrenamiento, la composición del corpus, ni si hubo RLHF, DPO u otra fase de alineamiento. La innovación técnica destacable es la paginación de expertos combinada con decodificación en streaming (primer audio en menos de 0,3 s) y la separación del códec de audio en un proceso independiente que solo requiere `mlx`, `numpy` y `miniaudio`, sin PyTorch ni ffmpeg, y unos 3 GB de memoria durante la decodificación.

## Capacidades

- Síntesis de voz expresiva en 83 idiomas, con salida WAV 44,1 kHz o PCM 24 kHz mono a 16 bits.
- Diálogo multihablante nativo: hasta 16 hablantes en un mismo texto mediante las marcas `<|speaker:0|>` a `<|speaker:15|>`.
- Clonación de voz zero-shot a partir de una grabación limpia de 5-30 s acompañada de su transcripción exacta (wav, flac o mp3); la voz se invoca por nombre de fichero en el campo `voice`.
- Control de emoción y entrega mediante marcas inline en el texto: `[laughs]`, `[sighs]`, `[whispering]`, entre otras.
- Troceado automático de textos largos, que se locutan en orden.
- Streaming de audio mientras se genera (`stream_format: "audio"`), con formato PCM compatible con el SDK de OpenAI.
- API compatible con OpenAI (`/v1/audio/speech`), invocable con `curl` o con el SDK oficial mediante `extra_body`.
- Parámetros de muestreo expuestos: `seed`, `temperature`, `top_p`, `sample_rate`.
- No soporta `speed` distinto de 1.0 ni el campo `instructions`; la emoción se controla solo con las marcas inline.
- No es un modelo de lenguaje: no hay generación de texto, razonamiento, tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Audiolibros y narración larga: el modelo trocea el texto y lo locuta en orden, con marcas como `[whispering]` para pasajes concretos; en un Mac de 64 GB o más genera a 2,2 veces tiempo real, suficiente para producir capítulos completos por lotes.
- Doblaje y localización multilingüe: con 83 idiomas y clonación de voz, se puede mantener la identidad de la voz del actor original entre versiones en castellano, inglés, francés o japonés usando una muestra de 5-30 s y su transcripción.
- Ficción sonora y podcast con varios personajes: las marcas `<|speaker:0|>` a `<|speaker:15|>` permiten escribir un guion con hasta 16 voces diferenciadas en una sola petición, sin concatenar ficheros de audio.
- Generación por lotes en local sin depender de la nube: en Macs de 48 GB funciona a media velocidad de tiempo real y en 32 GB a un tercio; el flujo recomendado es generar el fichero y reproducirlo después, lo que encaja con pipelines nocturnos de contenido editorial.
- Accesibilidad y lectura de documentos: conversión de artículos, informes o apuntes a audio con una voz clonada del propio usuario, ejecutada íntegramente en el equipo y sin enviar texto a servicios externos.
- Prototipado de asistentes e IVR: el endpoint compatible con OpenAI permite sustituir un proveedor de TTS comercial por este servidor local sin reescribir el cliente, útil para demos de asistentes de voz y pruebas de conversación.
- Videojuegos y prototipos de NPC: diálogos de personajes con emoción marcada en el propio guion y varias voces en una misma llamada, adecuado para maquetas de doblaje antes de contratar actores.
- Formación y e-learning: locución de cursos con pronunciación controlada por texto y velocidad fija, generando los materiales una sola vez de forma offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (ni MMLU, ni HumanEval, ni GSM8K, ni métricas objetivas de calidad de voz como MOS). El autor solo aporta métricas de rendimiento de inferencia, que se recogen a continuación tal como están declaradas:

| Métrica | Valor declarado |
|---|---|
| Throughput en M3 Ultra (64 GB o más) | 46-47 fotogramas por segundo, 2,2 veces tiempo real |
| Latencia hasta el primer audio (streaming) | menos de 0,3 s |
| Throughput con 48 GB de memoria unificada | aproximadamente la mitad de tiempo real |
| Throughput con 32 GB de memoria unificada | aproximadamente un tercio de tiempo real |
| Equivalencia con los pesos de mlx-community | salida idéntica hasta peticiones de 127 tokens; todas las capas idénticas |

## Requisitos de hardware

- Plataforma: exclusivamente Apple silicon. El binario distribuido es `gbx_lm-darwin-arm64`; no hay soporte documentado para CUDA, ROCm ni CPU x86.
- Memoria unificada: 64 GB o más para inferencia en tiempo real; 32 GB como mínimo para uso offline con paginación de expertos desde SSD.
- Disco: 40 GB para el modelo, más espacio para las voces de referencia y los ficheros generados.
- Memoria del códec: unos 3 GB adicionales durante la decodificación, en un proceso aparte gestionado por gbx-lm.
- Software: Python 3.10 o superior para el entorno de gbx-codecs, que solo necesita `mlx`, `numpy` y `miniaudio`; no requiere PyTorch ni ffmpeg.
- GPU dedicadas (A100, H100, RTX 4090): no disponibles para este empaquetado; el repositorio no incluye ruta de despliegue en ellas.
- Opciones de despliegue: servidor HTTP de gbx-lm en el puerto 11688 con API compatible con OpenAI; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de la sección anterior; el rendimiento depende críticamente del ancho de banda del SSD cuando los expertos se paginan desde disco.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización / formato | Plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| GreenBitAI/Drama-3-8bit-paged | 3,18 mil millones (safetensors) | 8 bits en expertos enrutados; safetensors + `experts.bin` paginado | Apple silicon, gbx-lm | fish-audio-community-license | Este modelo; ejecutable con 32-48 GB paginando expertos |
| mlx-community/fish-audio-drama-3-8bit | no disponible el recuento publicado (mismo modelo base) | 8 bits, MLX | Apple silicon, MLX | derivada de la licencia del modelo base | Requiere mantener el modelo completo en memoria; sin paginación |
| fishaudio/drama-3 | no disponible en la información | pesos originales de Fish Audio | no disponible | fish-audio-community-license | Modelo base del que derivan las dos builds anteriores |

No se dispone en la información proporcionada de datos de otros modelos TTS comparables (parámetros, contexto, métricas de calidad o licencia), por lo que la comparación con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- Dependencia total de Apple silicon y del binario `darwin-arm64` de gbx-lm: no hay ruta para Linux, Windows ni GPUs NVIDIA, lo que excluye su uso en servidores convencionales.
- Por debajo de 64 GB de memoria unificada no hay tiempo real; con 32 GB el rendimiento cae a un tercio de tiempo real y pasa a ser un flujo offline.
- Los pesos paginados se validaron contra mlx-community solo hasta peticiones de 127 tokens y comparando capa por capa; no se documenta una validación en peticiones largas o en todos los idiomas.
- El modelo acorta las pausas de más de un segundo y, según el autor, en ocasiones se queda en silencio durante varios segundos a mitad de frase antes de terminar: requiere postproceso o recorte en producción.
- No admite `speed` distinto de 1.0 ni `instructions`; el control expresivo depende exclusivamente de las marcas inline soportadas.
- Riesgo de errores de locución (omisiones, repeticiones, pronunciación incorrecta) en lugar del riesgo de alucinación factual propio de un LLM; no se han publicado evaluaciones de calidad por idioma.
- La clonación de voz exige disponer de los derechos sobre la grabación de referencia; el propio autor advierte de usar solo voces con derecho de uso. Es un vector claro de suplantación y deepfakes si se emplea sin consentimiento.
- Licencia `fish-audio-community-license`: hay que revisar el fichero LICENSE del repositorio para conocer las condiciones exactas de uso comercial, redistribución y atribución antes de integrarlo en un producto.
- Build comunitaria sin respaldo de Fish Audio, con 0 descargas y 0 likes en el momento de la consulta y publicada el 27 de octubre de 2026: validación externa prácticamente inexistente.
- No se documentan sesgos por idioma, variedad dialectal ni comportamiento con acentos; el castellano figura en la lista de idiomas, pero sin métricas específicas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/GreenBitAI/Drama-3-8bit-paged
- Modelo base (Fish Audio Drama 3): https://huggingface.co/fishaudio/drama-3
- Conversión MLX 8-bit de referencia: https://huggingface.co/mlx-community/fish-audio-drama-3-8bit
- gbx-lm (runtime y servidor compatible con OpenAI): https://github.com/GreenBitAI/gbx-lm
- gbx-codecs (códec de audio): https://github.com/GreenBitAI/gbx-codecs
- Binario precompilado para Apple silicon: https://github.com/GreenBitAI/gbx-lm/releases/latest/download/gbx_lm-darwin-arm64.tar.gz
- Paper técnico: no disponible
- Demo: no disponible
- Búsqueda web: no devolvió resultados relevantes; los enlaces obtenidos eran genéricos a YouTube y no guardan relación con el modelo.
